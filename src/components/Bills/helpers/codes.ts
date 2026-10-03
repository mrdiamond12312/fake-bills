import { toSVG } from 'bwip-js';

import { formatDateTime } from '@/components/Bills/helpers/calc';
import { createRandom } from '@/components/Bills/helpers/random';
import { BILL_TEMPLATE_MAP } from '@/components/Bills/registry';
import type { TBillCodes, TBillData } from '@/components/Bills/types';

const toBase64 = (text: string) =>
  typeof Buffer !== 'undefined'
    ? Buffer.from(text, 'utf-8').toString('base64')
    : btoa(unescape(encodeURIComponent(text)));

export const svgToDataUrl = (svg: string) => `data:image/svg+xml;base64,${toBase64(svg)}`;

/**
 * Mã CQT in the e-invoice shape "M1-<YY>-<5 alnum>-<11 digits>", but with a fixed TEST0 series
 * and zero-padded number so it can never match a real invoice and reads as a sample.
 */
const randomTaxAuthorityCode = (
  random: ReturnType<typeof createRandom>,
  dateTime: string | undefined,
) => {
  const year = formatDateTime(dateTime, 'YYYYMMDDHHmmss').slice(2, 4);
  return `M1-${year}-TEST0-000000${random.digits(5)}`;
};

/**
 * QR + barcode for a bill. Custom content from `display.qrText` / `display.barcodeText` when set;
 * otherwise random but seeded, with the QR pointing at example.com. The barcode falls back to the
 * template's own receipt-number format (`barcodeValue`) when it has one.
 */
export const generateBillCodes = (data: Pick<TBillData, 'display' | 'transaction' | 'templateId'>) => {
  const seed = data.display?.seed || 'receipt-lab';
  const random = createRandom(seed);
  // separate stream so adding codes never shifts the ones above for an existing seed
  const extraRandom = createRandom(`${seed}:codes`);
  const template = BILL_TEMPLATE_MAP[data.templateId ?? ''];

  const lookupCode = data.transaction?.lookupCode || random.alphanumeric(10);
  const randomQr = `https://einvoice.example.com/lookup?code=${lookupCode}&ref=${random.alphanumeric(
    12,
  )}`;
  const digitsBarcode = random.digits(20);
  const randomBarcode = template?.barcodeValue
    ? template.barcodeValue(data as TBillData, extraRandom)
    : digitsBarcode;
  const taxAuthorityCode =
    data.transaction?.lookupCode?.trim() ||
    randomTaxAuthorityCode(createRandom(`${seed}:cqt`), data.transaction?.dateTime);

  const qrSvgFor = (text: string) => toSVG({ bcid: 'qrcode', text, scale: 3, eclevel: 'M' } as any);
  const barcodeSvgFor = (text: string) =>
    toSVG({ bcid: 'code128', text, scale: 2, height: 10, includetext: false } as any);

  // Invalid custom content (e.g. non-ASCII in Code 128) falls back to the random code
  // instead of breaking the render; the form shows the validation error.
  const encode = (custom: string | undefined, fallback: string, draw: (text: string) => string) => {
    const text = custom?.trim();
    if (text) {
      try {
        return { value: text, svg: draw(text) };
      } catch {
        // fall through
      }
    }
    return { value: fallback, svg: draw(fallback) };
  };

  const qr = encode(data.display?.qrText, randomQr, qrSvgFor);
  const barcode = encode(data.display?.barcodeText, randomBarcode, barcodeSvgFor);
  const qrPayload = qr.value;
  const barcodeValue = barcode.value;
  const qrSvg = qr.svg;
  const barcodeSvg = barcode.svg;

  return {
    qrPayload,
    qrDataUrl: svgToDataUrl(qrSvg),
    barcodeValue,
    barcodeDataUrl: svgToDataUrl(barcodeSvg),
    taxAuthorityCode,
  } satisfies TBillCodes;
};
