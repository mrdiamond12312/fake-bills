import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';

import type { TDeepPartialBill } from '@/components/Bills/helpers/normalize';
import { BILL_TEMPLATES } from '@/components/Bills/registry';
import { renderBill } from '@/utils/render-bill';

const MAX_ITEMS = 200;

const decodePayload = (payload: string) =>
  JSON.parse(
    Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'),
  );

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * Query-string shortcuts on top of the full JSON bill:
 *   template, vat, seed, language (vi|en), name, logo (image URL), cashier, invoice, qr, barcode,
 *   scale, format,
 *   items (JSON array)
 */
const fromQuery = (
  query: UmiApiRequest['query'],
): TDeepPartialBill & { scale?: string; format?: string } => {
  const payload = first(query.payload);
  const base: TDeepPartialBill = payload ? decodePayload(payload) : {};
  const items = first(query.items);
  return {
    ...base,
    templateId: first(query.template) ?? base.templateId,
    store: {
      ...base.store,
      ...(first(query.name) ? { name: first(query.name) } : {}),
      ...(first(query.logo) ? { logoUrl: first(query.logo) } : {}),
    },
    transaction: {
      ...base.transaction,
      ...(first(query.cashier) ? { cashier: first(query.cashier) } : {}),
      ...(first(query.invoice) ? { invoiceNo: first(query.invoice) } : {}),
    },
    tax: { ...base.tax, ...(first(query.vat) ? { vatRate: Number(first(query.vat)) } : {}) },
    display: {
      ...base.display,
      ...(first(query.seed) ? { seed: first(query.seed) } : {}),
      ...(first(query.qr) ? { qrText: first(query.qr) } : {}),
      ...(first(query.barcode) ? { barcodeText: first(query.barcode) } : {}),
      ...(first(query.language) === 'en' || first(query.language) === 'vi'
        ? { language: first(query.language) as 'vi' | 'en' }
        : {}),
    },
    items: items ? JSON.parse(items) : base.items,
    scale: first(query.scale),
    format: first(query.format),
  };
};

/**
 * GET|POST /api/bills/render → image/png (or image/svg+xml with format=svg)
 * GET /api/bills/render?list=templates → available template ids
 */
export default async function (req: UmiApiRequest, res: UmiApiResponse) {
  try {
    if (first(req.query.list) === 'templates') {
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

    let input: TDeepPartialBill & { scale?: string | number; format?: string };
    if (req.method === 'POST') {
      // umi has already read the body before calling the handler
      input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    } else {
      input = fromQuery(req.query);
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
