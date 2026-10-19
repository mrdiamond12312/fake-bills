import { useIntl } from '@umijs/max';
import { message } from 'antd';
import { toPng } from 'html-to-image';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { resolveBillView } from '@/components/Bills/BillRenderer';
import { calculateTotals } from '@/components/Bills/helpers/calc';
import { generateBillCodes } from '@/components/Bills/helpers/codes';
import { normalizeBillData, switchBillTemplate } from '@/components/Bills/helpers/normalize';
import { randomSeed } from '@/components/Bills/helpers/random';
import { BILL_DRAFT_STORAGE_KEY, BILL_RENDER_API } from '@/const/bill';
import { TBillFormFields } from '@/pages/admin/bills/create/helpers/billFormKeys';
import { useBillResolver } from '@/pages/admin/bills/create/hooks/useBillResolver';
import { billFromQuery, billToQuery } from '@/utils/bill-query';
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from '@/utils/local-storage';

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

/** Form state from the page link, if it carries one (`?templateId=…&store.name=…`). */
const billFromLocation = () => {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('templateId')) return undefined;
  return billFromQuery(params) as TBillFormFields;
};

/** Past this, some proxies/servers start cutting the URL (Node's default header limit is 16 KB). */
const LONG_URL = 8000;

/** The GET render link for the current bill: the page link's params on the API path. */
const apiUrlFor = (bill: TBillFormFields) =>
  `${window.location.origin}${BILL_RENDER_API}?${billToQuery(bill, {
    keepDataUrls: true,
  }).toString()}`;

export const useBillForm = () => {
  const { formatMessage } = useIntl();
  const { FormSchema } = useBillResolver();

  // The page link wins over the local draft, so a shared/bookmarked link opens exactly that bill.
  const initialValues = useMemo(
    () =>
      normalizeBillData(
        billFromLocation() ?? readLocalStorage<TBillFormFields>(BILL_DRAFT_STORAGE_KEY) ?? {},
      ),
    [],
  );

  const methods = useForm<TBillFormFields>({
    mode: 'onChange',
    resolver: FormSchema,
    defaultValues: initialValues,
  });

  const watched = useWatch({ control: methods.control }) as TBillFormFields;
  // Typing stays snappy; the receipt re-renders a beat later.
  const deferred = useDeferredValue(watched);
  const bill = useMemo(() => normalizeBillData(deferred), [deferred]);
  const totals = useMemo(() => calculateTotals(bill), [bill]);
  const codes = useMemo(
    () => generateBillCodes(bill),
    // templates build their barcode number from the store/POS/ticket/date fields
    [
      bill.templateId,
      bill.display.seed,
      bill.display.qrText,
      bill.display.barcodeText,
      bill.transaction.lookupCode,
      bill.transaction.billId,
      bill.transaction.dateTime,
      bill.transaction.invoiceNo,
      bill.transaction.posNo,
      bill.store.branch,
    ],
  );
  const view = useMemo(() => resolveBillView(bill), [bill]);

  // Draft autosave + keep every form value in the page link
  useEffect(() => {
    const timer = setTimeout(() => {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}?${billToQuery(deferred).toString()}`,
      );
      try {
        writeLocalStorage(BILL_DRAFT_STORAGE_KEY, deferred);
      } catch {
        // an uploaded logo can blow the quota; the draft just won't persist
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [deferred]);

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      methods.reset(switchBillTemplate(normalizeBillData(methods.getValues()), templateId));
    },
    [methods],
  );

  const handleResetStore = useCallback(() => {
    const fresh = normalizeBillData({ templateId: methods.getValues('templateId') });
    methods.setValue('store', fresh.store, { shouldDirty: true });
    methods.setValue('transaction', { ...fresh.transaction }, { shouldDirty: true });
    methods.setValue('footerNote', fresh.footerNote, { shouldDirty: true });
  }, [methods]);

  const handleResetAll = useCallback(() => {
    removeLocalStorage(BILL_DRAFT_STORAGE_KEY);
    methods.reset(normalizeBillData({ templateId: methods.getValues('templateId') }));
  }, [methods]);

  const handleShuffleCodes = useCallback(() => {
    methods.setValue('display.seed', randomSeed(), { shouldDirty: true });
    methods.setValue('transaction.lookupCode', '', { shouldDirty: true });
  }, [methods]);

  /* -------------------------------- exports -------------------------------- */

  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fileBaseName = `${bill.templateId}-${bill.display.seed}`;

  const handleExportPng = useCallback(async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(previewRef.current, { pixelRatio: 2, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      downloadBlob(blob, `${fileBaseName}.png`);
    } catch (error: any) {
      message.error(error?.message ?? 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [fileBaseName]);

  const [isRendering, setIsRendering] = useState(false);
  /** The last API render, shown fullscreen; `url` is a blob URL */
  const [apiImage, setApiImage] = useState<{ url: string; blob: Blob; fileName: string }>();
  const [isApiPreviewOpen, setIsApiPreviewOpen] = useState(false);

  // release the previous render's blob URL when replaced or on leaving the page
  useEffect(
    () => () => {
      if (apiImage) URL.revokeObjectURL(apiImage.url);
    },
    [apiImage],
  );

  /** GET the exact link "Copy API link" gives; POST only when it's too long to send. */
  const fetchApiRender = useCallback(async () => {
    const url = apiUrlFor(methods.getValues());
    const response =
      url.length <= LONG_URL
        ? await fetch(url)
        : await fetch(BILL_RENDER_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(methods.getValues()),
          });
    if (!response.ok) throw new Error((await response.json()).message);
    return response.blob();
  }, [methods]);

  const handleRenderViaApi = useCallback(async () => {
    const valid = await methods.trigger();
    if (!valid) return;
    setIsRendering(true);
    try {
      const blob = await fetchApiRender();
      setApiImage({ url: URL.createObjectURL(blob), blob, fileName: `${fileBaseName}.api.png` });
      setIsApiPreviewOpen(true);
    } catch (error: any) {
      message.error(error?.message ?? 'Render failed');
    } finally {
      setIsRendering(false);
    }
  }, [methods, fetchApiRender, fileBaseName]);

  const handleDownloadApiImage = useCallback(() => {
    if (apiImage) downloadBlob(apiImage.blob, apiImage.fileName);
  }, [apiImage]);

  /** The browser shows the PNG itself: the GET link directly, or the POST result as a blob. */
  const handleOpenApiInTab = useCallback(async () => {
    const url = apiUrlFor(methods.getValues());
    if (url.length <= LONG_URL) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    // open the tab inside the click so it isn't blocked as a popup, fill it once POST returns
    const tab = window.open('', '_blank');
    setIsRendering(true);
    try {
      const blob = await fetchApiRender();
      if (tab) tab.location.href = URL.createObjectURL(blob);
    } catch (error: any) {
      tab?.close();
      message.error(error?.message ?? 'Render failed');
    } finally {
      setIsRendering(false);
    }
  }, [methods, fetchApiRender]);

  const handleCopyPageLink = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}?${billToQuery(
      methods.getValues(),
    ).toString()}`;
    await navigator.clipboard.writeText(url);
    message.success(
      formatMessage(
        { id: 'bills.actions.copyPageLink.done', defaultMessage: 'Link copied ({length} chars)' },
        { length: url.length },
      ),
    );
  }, [methods, formatMessage]);

  const handleCopyApiUrl = useCallback(async () => {
    const url = apiUrlFor(methods.getValues());
    await navigator.clipboard.writeText(url);
    const notify = url.length > LONG_URL ? message.warning : message.success;
    notify(
      formatMessage(
        {
          id:
            url.length > LONG_URL
              ? 'bills.actions.copyApiUrl.long'
              : 'bills.actions.copyApiUrl.done',
          defaultMessage:
            url.length > LONG_URL
              ? 'API link copied ({length} chars). That is long; use POST if it gets cut.'
              : 'API link copied ({length} chars)',
        },
        { length: url.length },
      ),
    );
  }, [methods, formatMessage]);

  return {
    methods,
    control: methods.control,
    bill,
    totals,
    codes,
    view,
    previewRef,
    isExporting,
    isRendering,
    handleTemplateChange,
    handleResetStore,
    handleResetAll,
    handleShuffleCodes,
    handleExportPng,
    handleRenderViaApi,
    apiImage,
    isApiPreviewOpen,
    setIsApiPreviewOpen,
    handleDownloadApiImage,
    handleOpenApiInTab,
    handleCopyApiUrl,
    handleCopyPageLink,
  } as const;
};
