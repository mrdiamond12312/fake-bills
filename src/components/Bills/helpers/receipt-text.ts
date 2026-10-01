import type { TReceiptLanguage } from '@/components/Bills/types';
import { receiptLocale as en } from '@/locales/en-US/receipt';
import { receiptLocale as vi } from '@/locales/vi-VN/receipt';

export type TReceiptKey = keyof typeof vi;

const DICTIONARIES: Record<TReceiptLanguage, Record<TReceiptKey, string>> = { vi, en };

export type TReceiptT = ((key: TReceiptKey, values?: Record<string, string | number>) => string) & {
  lang: TReceiptLanguage;
};

/**
 * Receipt-label translator. Plain function (no React context) so it works in the browser
 * preview and in the satori API alike. `{name}` placeholders are filled from `values`.
 */
export const createReceiptT = (lang: TReceiptLanguage = 'vi'): TReceiptT => {
  const dictionary = DICTIONARIES[lang] ?? vi;
  const t = ((key, values) =>
    (dictionary[key] ?? vi[key] ?? key).replace(/\{(\w+)\}/g, (_, name) =>
      values?.[name] === undefined ? `{${name}}` : String(values[name]),
    )) as TReceiptT;
  t.lang = lang;
  return t;
};
