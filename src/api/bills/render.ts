import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';

import type { TDeepPartialBill } from '@/components/Bills/helpers/normalize';
import { BILL_TEMPLATES } from '@/components/Bills/registry';
import { billFromQuery, mergeBill } from '@/utils/bill-query';
import { renderBill } from '@/utils/render-bill';

const MAX_ITEMS = 200;

type TRenderInput = TDeepPartialBill & { scale?: string | number; format?: string };

const decodePayload = (payload: string) =>
  JSON.parse(
    Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'),
  );

// umi's `req.query` splits the raw URL without decoding it (accents, spaces, JSON break)
const searchParamsOf = (req: UmiApiRequest) =>
  new URL(req.url ?? '', 'http://localhost').searchParams;

/**
 * Legacy shortcuts, kept so old links still work:
 *   template, vat, seed, language (vi|en), name, logo (image URL), cashier, invoice, billId,
 *   qr, barcode, items (JSON array)
 */
const fromShortcuts = (params: URLSearchParams): TDeepPartialBill => {
  const get = (key: string) => params.get(key) || undefined;
  const items = get('items');
  const language = get('language');
  return {
    ...(get('template') ? { templateId: get('template') } : {}),
    store: {
      ...(get('name') ? { name: get('name') } : {}),
      ...(get('logo') ? { logoUrl: get('logo') } : {}),
    },
    transaction: {
      ...(get('cashier') ? { cashier: get('cashier') } : {}),
      ...(get('invoice') ? { invoiceNo: get('invoice') } : {}),
      ...(get('billId') ? { billId: get('billId') } : {}),
    },
    tax: get('vat') ? { vatRate: Number(get('vat')) } : {},
    display: {
      ...(get('seed') ? { seed: get('seed') } : {}),
      ...(get('qr') ? { qrText: get('qr') } : {}),
      ...(get('barcode') ? { barcodeText: get('barcode') } : {}),
      ...(language === 'en' || language === 'vi' ? { language } : {}),
    },
    ...(items ? { items: JSON.parse(items) } : {}),
  };
};

/**
 * GET takes everything POST does, in two ways: `data` (the POST body as URL-encoded JSON) or
 * dotted params (`templateId=…&store.name=…&items.0.title=…`, what "Copy API link" builds).
 * Later layers win: `payload` (legacy base64url JSON) → `data` → legacy shortcuts → dotted params.
 */
const fromQuery = (params: URLSearchParams): TRenderInput => {
  const get = (key: string) => params.get(key) || undefined;
  const payload = get('payload');
  const data = get('data');
  const layers: TRenderInput[] = [
    payload ? decodePayload(payload) : {},
    // URLSearchParams has already percent-decoded it
    data ? JSON.parse(data) : {},
    fromShortcuts(params),
    billFromQuery(params) ?? {},
  ];
  const merged = layers.reduce<TRenderInput>((acc, layer) => mergeBill(acc, layer), {});
  return {
    ...merged,
    scale: get('scale') ?? merged.scale,
    format: get('format') ?? merged.format,
  };
};

/**
 * GET|POST /api/bills/render → image/png (or image/svg+xml with format=svg)
 * GET /api/bills/render?list=templates → available template ids
 */
export default async function (req: UmiApiRequest, res: UmiApiResponse) {
  try {
    const params = searchParamsOf(req);
    if (params.get('list') === 'templates') {
      res.status(200).json(
        BILL_TEMPLATES.map(({ id, name, description, printerStyle, fields }) => ({
          id,
          name,
          description,
          printerStyle,
          fields,
        })),
      );
      return;
    }

    let input: TRenderInput;
    if (req.method === 'POST') {
      // umi has already read the body before calling the handler
      input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    } else {
      input = fromQuery(params);
    }

    if ((input.items?.length ?? 0) > MAX_ITEMS) {
      res.status(400).json({ message: `At most ${MAX_ITEMS} items per bill.` });
      return;
    }

    const { scale, format, ...bill } = input;
    const result = await renderBill(bill, {
      scale: Number(scale) || undefined,
      format: format === 'svg' ? 'svg' : 'png',
    });

    res
      .status(200)
      .header('Content-Type', result.contentType)
      .header('Cache-Control', 'no-store')
      .header('X-Bill-Template', result.data.templateId)
      .header('X-Bill-Seed', String(result.data.display.seed))
      .end(result.body);
  } catch (error: any) {
    res.status(400).json({ message: error?.message ?? 'Render failed' });
  }
}
