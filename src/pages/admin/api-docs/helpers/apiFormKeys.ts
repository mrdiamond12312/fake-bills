import type { TDeepPartialBill } from '@/components/Bills/helpers/normalize';
import { DEFAULT_TEMPLATE_ID } from '@/components/Bills/registry';
import { BILL_RENDER_API } from '@/const/bill';
import { billToQuery } from '@/utils/bill-query';

export enum API_FORM_KEY {
  method = 'method',
  format = 'format',
  scale = 'scale',
  body = 'body',
}

export type TApiMethod = 'GET' | 'POST';

export type TApiFormFields = {
  [API_FORM_KEY.method]: TApiMethod;
  [API_FORM_KEY.format]: 'png' | 'svg';
  [API_FORM_KEY.scale]: number;
  /** The bill as JSON text; GET sends it as dotted params, POST as the body */
  [API_FORM_KEY.body]: string;
};

export const API_MAX_ITEMS = 200;

type TOutputOptions = Pick<TApiFormFields, API_FORM_KEY.format | API_FORM_KEY.scale>;

/** A short bill that shows the main sections; everything left out comes from the template. */
export const starterBody = (templateId = DEFAULT_TEMPLATE_ID, seed = 'run-42') =>
  JSON.stringify(
    {
      templateId,
      transaction: { cashier: '0001' },
      items: [
        { title: 'Bánh mì', barcode: '8930000000017', unitPrice: 15000, quantity: 2 },
        { title: 'Sữa tươi 180ml', unitPrice: 8000, quantity: 3, discount: 2000 },
      ],
      tax: { vatRate: 8 },
      display: { seed, language: 'vi', itemNameLines: 0 },
    },
    null,
    2,
  );

export const API_FORM_DEFAULTS: TApiFormFields = {
  [API_FORM_KEY.method]: 'GET',
  [API_FORM_KEY.format]: 'png',
  [API_FORM_KEY.scale]: 2,
  [API_FORM_KEY.body]: starterBody(),
};

/** The body as a bill, or `undefined` when it isn't a JSON object. */
export const parseBody = (text?: string): TDeepPartialBill | undefined => {
  try {
    const value = JSON.parse(text ?? '');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
  } catch {
    return undefined;
  }
};

/** Legacy GET shortcuts, still accepted next to the dotted params. */
export const RENDER_QUERY_PARAMS = [
  { param: 'payload', sets: 'whole bill as base64url JSON' },
  { param: 'template', sets: 'templateId' },
  { param: 'vat', sets: 'tax.vatRate' },
  { param: 'seed', sets: 'display.seed' },
  { param: 'language', sets: 'display.language (vi | en)' },
  { param: 'name', sets: 'store.name' },
  { param: 'logo', sets: 'store.logoUrl' },
  { param: 'cashier', sets: 'transaction.cashier' },
  { param: 'invoice', sets: 'transaction.invoiceNo' },
  { param: 'billId', sets: 'transaction.billId (the OCR bill_id: Mã CQT or barcode)' },
  { param: 'qr', sets: 'display.qrText' },
  { param: 'barcode', sets: 'display.barcodeText' },
  { param: 'items', sets: 'items (JSON array)' },
] as const;

/** Output options go in only when they differ from the defaults, so links stay short. */
const outputOptions = ({ format, scale }: TOutputOptions) => ({
  ...(format !== 'png' ? { format } : {}),
  ...(scale !== 2 ? { scale } : {}),
});

export const buildRenderUrl = (origin: string, bill: TDeepPartialBill, values: TOutputOptions) => {
  const params = billToQuery(bill, { keepDataUrls: true });
  Object.entries(outputOptions(values)).forEach(([key, value]) => params.set(key, String(value)));
  return `${origin}${BILL_RENDER_API}?${params.toString()}`;
};

export const buildPostBody = (bill: TDeepPartialBill, values: TOutputOptions) => ({
  ...bill,
  ...outputOptions(values),
});

export const buildGetCurl = (url: string, format: TApiFormFields['format']) =>
  `curl -o bill.${format} "${url}"`;

export const buildPostCurl = (origin: string, bill: TDeepPartialBill, values: TOutputOptions) =>
  [
    `curl -o bill.${values.format} -X POST \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  ${origin}${BILL_RENDER_API} \\`,
    // single quotes inside the JSON would end the shell string
    `  -d '${JSON.stringify(buildPostBody(bill, values), null, 2)
      .replace(/'/g, "'\\''")
      .replace(/\n/g, '\n  ')}'`,
  ].join('\n');
