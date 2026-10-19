/**
 * Bill ⇄ flat query string, shared by the composer's page link and GET /api/bills/render,
 * so a page link and an API link carry the same params (`templateId=…&store.name=…&items.0.title=…`).
 */
import { normalizeBillData, TDeepPartialBill } from '@/components/Bills/helpers/normalize';
import { flattenToQuery, unflattenQuery } from '@/utils/query-params';

/** Top-level bill keys; any other param is ignored by `billFromQuery`. */
const BILL_ROOT_KEYS = [
  'templateId',
  'store',
  'transaction',
  'items',
  'tax',
  'display',
  'footerNote',
];

/**
 * `keepDataUrls: false` drops uploaded (data-URL) logos, which make the link far too long for a
 * page link; the API link keeps them so GET can render anything POST can.
 */
export const billToQuery = (bill: TDeepPartialBill, { keepDataUrls = false } = {}) =>
  flattenToQuery(bill, {
    skip: (path, value) =>
      !keepDataUrls && path === 'store.logoUrl' && String(value).startsWith('data:'),
  });

/** Rebuilds the bill from dotted params; `undefined` when none of them are bill fields. */
export const billFromQuery = (params: URLSearchParams): TDeepPartialBill | undefined => {
  const billParams = new URLSearchParams();
  params.forEach((value, key) => {
    // bare `items` is the API's legacy JSON-array shortcut, not a dotted field
    if (key !== 'items' && BILL_ROOT_KEYS.includes(key.split('.')[0])) {
      billParams.append(key, value);
    }
  });
  if (![...billParams.keys()].length) return undefined;

  // a fully-populated bill of the same template tells unflatten which values are numbers/booleans
  const reference = normalizeBillData({ templateId: billParams.get('templateId') ?? undefined });
  reference.transaction.amountPaid ??= 0;
  reference.store.logoWidth ??= 0;
  reference.items = [{ ...reference.items[0], discount: 0 }];
  return unflattenQuery(billParams, reference) as TDeepPartialBill;
};

const isPlainObject = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Deep merge where `override` wins and arrays (items) are replaced, not merged. */
export const mergeBill = <T>(base: T, override: unknown): T => {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : override) as T;
  }
  const result: Record<string, any> = { ...base };
  Object.entries(override).forEach(([key, value]) => {
    result[key] = mergeBill(result[key], value);
  });
  return result as T;
};
