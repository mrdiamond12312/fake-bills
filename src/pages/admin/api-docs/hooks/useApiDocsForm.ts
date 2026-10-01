import { useIntl } from '@umijs/max';
import { message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { randomSeed } from '@/components/Bills/helpers/random';
import { BILL_RENDER_API } from '@/const/bill';
import {
  API_FORM_DEFAULTS,
  API_FORM_KEY,
  TApiFormFields,
  buildGetCurl,
  buildPostCurl,
  buildRenderUrl,
} from '@/pages/admin/api-docs/helpers/apiFormKeys';
import { useApiDocsResolver } from '@/pages/admin/api-docs/hooks/useApiDocsResolver';

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

export const useApiDocsForm = () => {
  const { formatMessage } = useIntl();
  const { FormSchema } = useApiDocsResolver();

  const methods = useForm<TApiFormFields>({
    mode: 'onChange',
    resolver: FormSchema,
    defaultValues: API_FORM_DEFAULTS,
  });
  const values = useWatch({ control: methods.control }) as TApiFormFields;

  const origin = window.location.origin;
  const examples = useMemo(() => {
    const getUrl = buildRenderUrl(origin, values);
    return {
      getUrl,
      getCurl: buildGetCurl(getUrl, values.format),
      postCurl: buildPostCurl(origin, values),
      listUrl: `${origin}${BILL_RENDER_API}?list=templates`,
      catalogUrl: `${origin}/api/catalog/products?keyword=banh`,
    };
  }, [origin, values]);

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
    setIsSending(true);
    const started = performance.now();
    try {
      const response = await fetch(buildRenderUrl(origin, methods.getValues()));
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
        const { message: error } = JSON.parse(await blob.text());
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

  const handleShuffleSeed = useCallback(
    () => methods.setValue(API_FORM_KEY.seed, randomSeed(), { shouldDirty: true }),
    [methods],
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
    examples,
    result,
    isSending,
    handleSend,
    handleShuffleSeed,
    handleCopy,
  } as const;
};
