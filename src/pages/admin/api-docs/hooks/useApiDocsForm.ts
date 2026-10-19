import { useIntl } from '@umijs/max';
import { message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { randomSeed } from '@/components/Bills/helpers/random';
import { API_BODY_STORAGE_KEY, BILL_DRAFT_STORAGE_KEY, BILL_RENDER_API } from '@/const/bill';
import {
  API_FORM_DEFAULTS,
  API_FORM_KEY,
  TApiFormFields,
  buildGetCurl,
  buildPostBody,
  buildPostCurl,
  buildRenderUrl,
  parseBody,
  starterBody,
} from '@/pages/admin/api-docs/helpers/apiFormKeys';
import { useApiDocsResolver } from '@/pages/admin/api-docs/hooks/useApiDocsResolver';
import { readLocalStorage, writeLocalStorage } from '@/utils/local-storage';

export type TApiTryResult = {
  status: number;
  contentType: string;
  template: string;
  seed: string;
  bytes: number;
  millis: number;
  objectUrl?: string;
  error?: string;
};

/** Past this, some proxies/servers start cutting the URL (Node's default header limit is 16 KB). */
export const LONG_URL = 8000;

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

export const useApiDocsForm = () => {
  const { formatMessage } = useIntl();
  const { FormSchema } = useApiDocsResolver();

  const methods = useForm<TApiFormFields>({
    mode: 'onChange',
    resolver: FormSchema,
    defaultValues: {
      ...API_FORM_DEFAULTS,
      body: readLocalStorage<string>(API_BODY_STORAGE_KEY) ?? API_FORM_DEFAULTS.body,
    },
  });
  const values = useWatch({ control: methods.control }) as TApiFormFields;

  // keep the editor across reloads
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        writeLocalStorage(API_BODY_STORAGE_KEY, values.body);
      } catch {
        // a body with an uploaded logo can blow the quota; it just won't persist
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [values.body]);

  const origin = window.location.origin;
  // while the JSON is mid-edit, the examples keep showing an empty bill
  const bill = useMemo(() => parseBody(values.body) ?? {}, [values.body]);
  const examples = useMemo(() => {
    const getUrl = buildRenderUrl(origin, bill, values);
    return {
      getUrl,
      getCurl: buildGetCurl(getUrl, values.format),
      postCurl: buildPostCurl(origin, bill, values),
      listUrl: `${origin}${BILL_RENDER_API}?list=templates`,
      catalogUrl: `${origin}/api/catalog/products?keyword=banh`,
    };
  }, [origin, bill, values]);

  const [result, setResult] = useState<TApiTryResult>();
  const [isSending, setIsSending] = useState(false);

  // the preview holds a blob URL; release it when replaced or on leaving the page
  useEffect(
    () => () => {
      if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    },
    [result],
  );

  const handleSend = useCallback(async () => {
    const valid = await methods.trigger();
    if (!valid) return;
    const current = methods.getValues();
    const body = parseBody(current.body) ?? {};
    setIsSending(true);
    const started = performance.now();
    try {
      const response =
        current.method === 'GET'
          ? await fetch(buildRenderUrl(origin, body, current))
          : await fetch(BILL_RENDER_API, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(buildPostBody(body, current)),
            });
      const blob = await response.blob();
      const base = {
        status: response.status,
        contentType: response.headers.get('Content-Type') ?? '',
        template: response.headers.get('X-Bill-Template') ?? '',
        seed: response.headers.get('X-Bill-Seed') ?? '',
        bytes: blob.size,
        millis: Math.round(performance.now() - started),
      };
      if (!response.ok) {
        // a too-long GET is refused before our handler runs, so the body may not be JSON
        const text = await blob.text();
        let error = text || response.statusText;
        try {
          error = JSON.parse(text).message ?? error;
        } catch {
          // keep the raw text
        }
        setResult({ ...base, error });
        return;
      }
      setResult({ ...base, objectUrl: URL.createObjectURL(blob) });
    } catch (error: any) {
      message.error(error?.message ?? 'Request failed');
    } finally {
      setIsSending(false);
    }
  }, [methods, origin]);

  const setBody = useCallback(
    (body: string) => methods.setValue(API_FORM_KEY.body, body, { shouldValidate: true }),
    [methods],
  );

  /** Patches the parsed body; does nothing while the JSON is invalid. */
  const patchBody = useCallback(
    (patch: (body: Record<string, any>) => Record<string, any>) => {
      const body = parseBody(methods.getValues(API_FORM_KEY.body));
      if (!body) {
        message.warning(
          formatMessage({ id: 'apiDocs.body.invalid', defaultMessage: 'Fix the JSON first' }),
        );
        return;
      }
      setBody(pretty(patch(body)));
    },
    [methods, setBody, formatMessage],
  );

  const handleStartFrom = useCallback(
    (templateId: string) => {
      const seed = parseBody(methods.getValues(API_FORM_KEY.body))?.display?.seed;
      setBody(starterBody(templateId, seed || undefined));
    },
    [methods, setBody],
  );

  const handleLoadFromComposer = useCallback(() => {
    const draft = readLocalStorage<Record<string, any>>(BILL_DRAFT_STORAGE_KEY);
    if (!draft) {
      message.info(
        formatMessage({
          id: 'apiDocs.body.noDraft',
          defaultMessage: 'No composer draft yet. Open the Bill composer first.',
        }),
      );
      return;
    }
    setBody(pretty(draft));
  }, [setBody, formatMessage]);

  const handleFormatBody = useCallback(() => patchBody((body) => body), [patchBody]);

  const handleShuffleSeed = useCallback(
    () => patchBody((body) => ({ ...body, display: { ...body.display, seed: randomSeed() } })),
    [patchBody],
  );

  const handleCopy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      message.success(formatMessage({ id: 'apiDocs.copied', defaultMessage: 'Copied' }));
    },
    [formatMessage],
  );

  return {
    methods,
    control: methods.control,
    values,
    examples,
    result,
    isSending,
    handleSend,
    handleStartFrom,
    handleLoadFromComposer,
    handleFormatBody,
    handleShuffleSeed,
    handleCopy,
  } as const;
};
