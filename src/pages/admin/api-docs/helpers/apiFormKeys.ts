import { DEFAULT_TEMPLATE_ID } from '@/components/Bills/registry';
import { BILL_RENDER_API, DEFAULT_VAT_RATE } from '@/const/bill';

export enum API_FORM_KEY {
  template = 'template',
  language = 'language',
  seed = 'seed',
  vat = 'vat',
  name = 'name',
  format = 'format',
  scale = 'scale',
}

export type TApiFormFields = {
  [API_FORM_KEY.template]: string;
  [API_FORM_KEY.language]: 'vi' | 'en';
  [API_FORM_KEY.seed]: string;
  [API_FORM_KEY.vat]: number;
  [API_FORM_KEY.name]: string;
  [API_FORM_KEY.format]: 'png' | 'svg';
  [API_FORM_KEY.scale]: number;
};

export const API_FORM_DEFAULTS: TApiFormFields = {
  [API_FORM_KEY.template]: DEFAULT_TEMPLATE_ID,
  [API_FORM_KEY.language]: 'vi',
  [API_FORM_KEY.seed]: 'run-42',
  [API_FORM_KEY.vat]: DEFAULT_VAT_RATE,
  [API_FORM_KEY.name]: '',
  [API_FORM_KEY.format]: 'png',
  [API_FORM_KEY.scale]: 2,
};

/** GET query shortcuts accepted by /api/bills/render, and the bill field each one sets. */
export const RENDER_QUERY_PARAMS = [
  { param: 'template', sets: 'templateId' },
  { param: 'vat', sets: 'tax.vatRate' },
  { param: 'seed', sets: 'display.seed' },
  { param: 'language', sets: 'display.language (vi | en)' },
  { param: 'name', sets: 'store.name' },
  { param: 'logo', sets: 'store.logoUrl' },
  { param: 'cashier', sets: 'transaction.cashier' },
  { param: 'invoice', sets: 'transaction.invoiceNo' },
  { param: 'qr', sets: 'display.qrText' },
  { param: 'barcode', sets: 'display.barcodeText' },
  { param: 'items', sets: 'items (JSON array)' },
  { param: 'payload', sets: 'whole bill as base64url JSON' },
  { param: 'scale', sets: '1–4, default 2' },
  { param: 'format', sets: 'png | svg' },
] as const;

/** Only non-default values go in the URL, so the example stays short. */
export const buildRenderUrl = (origin: string, values: TApiFormFields) => {
  const params = new URLSearchParams();
  params.set('template', values.template);
  if (values.language !== API_FORM_DEFAULTS.language) params.set('language', values.language);
  if (values.seed) params.set('seed', values.seed);
  if (values.vat !== DEFAULT_VAT_RATE) params.set('vat', String(values.vat));
  if (values.name?.trim()) params.set('name', values.name.trim());
  if (values.format !== 'png') params.set('format', values.format);
  if (values.scale !== 2) params.set('scale', String(values.scale));
  return `${origin}${BILL_RENDER_API}?${params.toString()}`;
};

export const buildGetCurl = (url: string, format: TApiFormFields['format']) =>
  `curl -o bill.${format} "${url}"`;

export const buildPostCurl = (origin: string, values: TApiFormFields) => {
  const body = {
    templateId: values.template,
    store: { name: values.name?.trim() || 'My Test Mart' },
    items: [{ title: 'Bánh mì', barcode: '8930000000017', unitPrice: 15000, quantity: 2 }],
    tax: { vatRate: values.vat },
    display: { seed: values.seed, language: values.language },
    scale: values.scale,
    format: values.format,
  };
  return [
    `curl -o bill.${values.format} -X POST \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  ${origin}${BILL_RENDER_API} \\`,
    `  -d '${JSON.stringify(body, null, 2).replace(/\n/g, '\n  ')}'`,
  ].join('\n');
};
