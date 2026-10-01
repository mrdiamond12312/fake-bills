import { toSVG } from 'bwip-js';

import { createRandom } from '@/components/Bills/helpers/random';
import type { TBillCodes, TBillData } from '@/components/Bills/types';

const toBase64 = (text: string) =>
  typeof Buffer !== 'undefined'
    ? Buffer.from(text, 'utf-8').toString('base64')
    : btoa(unescape(encodeURIComponent(text)));

export const svgToDataUrl = (svg: string) => `data:image/svg+xml;base64,${toBase64(svg)}`;

/**
 * QR + barcode for a bill. Custom content from `display.qrText` / `display.barcodeText` when set;
 * otherwise random but seeded, with the QR pointing at example.com.
 */
export const generateBillCodes = (data: Pick<TBillData, 'display' | 'transaction'>) => {
  const seed = data.display?.seed || 'receipt-lab';
  const random = createRandom(seed);

  const lookupCode = data.transaction?.lookupCode || random.alphanumeric(10);
  const randomQr = `https://einvoice.example.com/lookup?code=${lookupCode}&ref=${random.alphanumeric(
    12,
  )}`;
  const randomBarcode = random.digits(20);

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
  } satisfies TBillCodes;
};
