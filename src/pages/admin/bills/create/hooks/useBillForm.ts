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
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from '@/utils/local-storage';
import { flattenToQuery, unflattenQuery } from '@/utils/query-params';

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

/** Uploaded (data-URL) logos are far too long for a link; they stay in the local draft only. */
const skipInLink = (path: string, value: unknown) =>
  path === 'store.logoUrl' && String(value).startsWith('data:');

export const billToQuery = (bill: TBillFormFields) => flattenToQuery(bill, { skip: skipInLink });

/** Form state from the page link, if it carries one (`?templateId=…&store.name=…`). */
const billFromLocation = () => {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('templateId')) return undefined;
  // a fully-populated bill of the same template tells unflatten which values are numbers/booleans
  const reference = normalizeBillData({ templateId: params.get('templateId') ?? undefined });
  reference.transaction.amountPaid ??= 0;
  reference.store.logoWidth ??= 0;
  return unflattenQuery(params, reference) as TBillFormFields;
};

const toBase64Url = (text: string) =>
  btoa(unescape(encodeURIComponent(text)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

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

  const handleRenderViaApi = useCallback(async () => {
    const valid = await methods.trigger();
    if (!valid) return;
    setIsRendering(true);
    try {
      const response = await fetch(BILL_RENDER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...methods.getValues(), scale: 2 }),
      });
      if (!response.ok) throw new Error((await response.json()).message);
      downloadBlob(await response.blob(), `${fileBaseName}.api.png`);
    } catch (error: any) {
      message.error(error?.message ?? 'Render failed');
    } finally {
      setIsRendering(false);
    }
  }, [methods, fileBaseName]);

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
    const { store, ...rest } = methods.getValues();
    // data-URL logos make the URL huge; POST the JSON body for those
    const payload = {
      ...rest,
      store: { ...store, logoUrl: store.logoUrl?.startsWith('data:') ? '' : store.logoUrl },
    };
    const url = `${window.location.origin}${BILL_RENDER_API}?payload=${toBase64Url(
      JSON.stringify(payload),
    )}`;
    await navigator.clipboard.writeText(url);
    message.success(
      formatMessage(
        { id: 'bills.actions.copyApiUrl.done', defaultMessage: 'API URL copied ({length} chars)' },
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
    handleCopyApiUrl,
    handleCopyPageLink,
  } as const;
};
