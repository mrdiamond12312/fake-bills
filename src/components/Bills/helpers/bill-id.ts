/**
 * Bill ID rules of the OCR backend (`getBillIdConfidence` in ocr.ts), so the composer can show
 * whether the printed bill ID will pass, and suggest one ID that passes and one that doesn't.
 * Keep in sync with the backend when it changes.
 */
import { formatDateTime } from '@/components/Bills/helpers/calc';

/** Where the template prints the value the OCR prompt extracts as `bill_id`. */
export type TBillIdSource = 'cqt' | 'barcode';

/** Retailer keys as the backend names them. */
export type TOcrRetailer = 'aeon' | 'coopmart' | 'winmart' | 'emart' | 'lottemart' | 'go';

export type TBillIdCheck = { ok: boolean; reason?: string };

const MAX_DAY_GAP = 1;
const CQT_YEARS = ['25', '26'];

/** "20261003" → day number, NaN when not a real date. */
const dayNumber = (yyyymmdd: string) => {
  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6));
  const day = Number(yyyymmdd.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  const valid =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return valid ? date.getTime() / 864e5 : NaN;
};

const shiftDays = (yyyymmdd: string, days: number) => {
  const date = new Date(dayNumber(yyyymmdd) * 864e5 + days * 864e5);
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('');
};

/** Gap in days between the date inside the ID and the bill date. */
const dateGapReason = (idDate: string, billDate: string): TBillIdCheck => {
  const gap = Math.abs(dayNumber(idDate) - dayNumber(billDate));
  if (Number.isNaN(gap)) return { ok: false, reason: `"${idDate}" in the ID is not a valid date` };
  if (gap > MAX_DAY_GAP) {
    return { ok: false, reason: `Date in the ID is ${gap} days from the bill date (max 1)` };
  }
  return { ok: true };
};

export const checkBillId = (
  retailer: TOcrRetailer,
  billId: string,
  billDateTime: string | undefined,
): TBillIdCheck => {
  const billDate = formatDateTime(billDateTime, 'YYYYMMDDHHmmss').slice(0, 8);
  if (!billId) return { ok: false, reason: 'Empty bill ID' };

  switch (retailer) {
    case 'emart': {
      const match = billId.match(/^0(\d{8})(\d{12,14})$/);
      if (!match || billId.length < 21 || billId.length > 23) {
        return { ok: false, reason: '"0" + YYYYMMDD + 12–14 digits (21–23 long)' };
      }
      return dateGapReason(match[1], billDate);
    }
    case 'lottemart': {
      const match = billId.match(/^\d{3}(\d{6})\d{14,16}$/);
      if (!match) return { ok: false, reason: '3 digits + YYMMDD + 14–16 digits' };
      return dateGapReason(`20${match[1]}`, billDate);
    }
    case 'go':
      return /^660000\d{28,32}$/.test(billId)
        ? { ok: true }
        : { ok: false, reason: '"660000" + 28–32 digits' };
    case 'aeon':
    case 'coopmart':
    case 'winmart': {
      const match = billId.match(/^M1-(\d{2})-([A-ZА-Я0-9]{4,6})-(\d{8,12})$/);
      if (!match) return { ok: false, reason: 'M1-YY-<4–6 uppercase/digits>-<8–12 digits>' };
      if (!CQT_YEARS.includes(match[1])) {
        return { ok: false, reason: `Year ${match[1]} not accepted (${CQT_YEARS.join(', ')} only)` };
      }
      return { ok: true };
    }
    default:
      return { ok: true };
  }
};

/**
 * A realistic ID that the backend rejects, made from a passing one: wrong year for Mã CQT,
 * a date 3 days off for date-carrying barcodes, a wrong prefix for GO! / Tops.
 */
export const makeInvalidBillId = (retailer: TOcrRetailer, validId: string) => {
  switch (retailer) {
    case 'emart':
      return `0${shiftDays(validId.slice(1, 9), 3)}${validId.slice(9)}`;
    case 'lottemart':
      return `${validId.slice(0, 3)}${shiftDays(`20${validId.slice(3, 9)}`, 3).slice(2)}${validId.slice(9)}`;
    case 'go':
      return `660001${validId.slice(6)}`;
    default:
      return validId.replace(/^M1-\d{2}-/, 'M1-24-');
  }
};
