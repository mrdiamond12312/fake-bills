import type { TBillData, TBillTotals } from '@/components/Bills/types';

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const calculateTotals = (data: Pick<TBillData, 'items' | 'tax' | 'transaction'>) => {
  const vatRate = Math.max(0, toNumber(data.tax?.vatRate)) / 100;
  const priceIncludesVat = data.tax?.priceIncludesVat ?? true;

  const lines = (data.items ?? []).map((item, index) => {
    const unitPrice = toNumber(item.unitPrice);
    const quantity = toNumber(item.quantity);
    const discount = toNumber(item.discount);
    return {
      ...item,
      unitPrice,
      quantity,
      discount,
      index,
      lineTotal: Math.round(unitPrice * quantity - discount),
    };
  });

  const totalQuantity = lines.reduce((acc, line) => acc + line.quantity, 0);
  const grossAmount = lines.reduce((acc, line) => acc + line.unitPrice * line.quantity, 0);
  const totalDiscount = lines.reduce((acc, line) => acc + (line.discount ?? 0), 0);
  const netAmount = grossAmount - totalDiscount;

  const preTaxAmount = priceIncludesVat ? Math.round(netAmount / (1 + vatRate)) : netAmount;
  const vatAmount = priceIncludesVat ? netAmount - preTaxAmount : Math.round(netAmount * vatRate);
  const grandTotal = preTaxAmount + vatAmount;

  const paid = toNumber(data.transaction?.amountPaid);
  const amountPaid = paid > 0 ? paid : grandTotal;

  return {
    lines,
    totalQuantity,
    grossAmount,
    totalDiscount,
    preTaxAmount,
    vatAmount,
    grandTotal,
    amountPaid,
    change: Math.max(0, amountPaid - grandTotal),
  } satisfies TBillTotals;
};

/** 1234567 → "1,234,567" (or "1.234.567" with separator '.') */
export const formatMoney = (value: number, separator: ',' | '.' = ',') =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);

const pad = (value: number) => String(value).padStart(2, '0');

export const formatDateTime = (
  iso: string | undefined,
  pattern:
    | 'DD/MM/YYYY HH:mm'
    | 'DD/MM/YYYY HH:mm:ss'
    | 'YYYY-MM-DD HH:mm'
    | 'DD-MM-YYYY HH:mm'
    | 'YYYYMMDDHHmmss',
) => {
  const date = iso ? new Date(iso) : new Date();
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  const tokens: Record<string, string> = {
    YYYY: String(safe.getFullYear()),
    MM: pad(safe.getMonth() + 1),
    DD: pad(safe.getDate()),
    HH: pad(safe.getHours()),
    mm: pad(safe.getMinutes()),
    ss: pad(safe.getSeconds()),
  };
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (token) => tokens[token]);
};

/** Last `length` digits of a field, zero-padded: ("0206-0119", 8) → "02060119". */
export const digitsOf = (value = '', length: number) =>
  value.replace(/\D/g, '').slice(-length).padStart(length, '0');

/** Removes Vietnamese diacritics — many POS printers print unaccented text. */
export const stripDiacritics = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
