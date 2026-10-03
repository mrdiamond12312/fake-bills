import type React from 'react';

import type { FONT_ID } from '@/components/Bills/fonts';
import type { TBillIdSource, TOcrRetailer } from '@/components/Bills/helpers/bill-id';
import type { createRandom } from '@/components/Bills/helpers/random';
import type { TReceiptT } from '@/components/Bills/helpers/receipt-text';

export type TReceiptLanguage = 'vi' | 'en';

export type TLogoAlign = 'left' | 'center' | 'right';

export type TStoreInfo = {
  name: string;
  legalName?: string;
  branch?: string;
  address?: string;
  phone?: string;
  hotline?: string;
  taxCode?: string;
  website?: string;
  slogan?: string;
  /**
   * Logo image src (http(s) URL or data URL). Empty → template renders its text wordmark.
   * Templates can set a default in `defaults.store.logoUrl`.
   */
  logoUrl?: string;
  logoWidth?: number;
  logoAlign?: TLogoAlign;
  showLogo?: boolean;
};

export type TTransactionInfo = {
  invoiceNo?: string;
  posNo?: string;
  cashier?: string;
  /** ISO string */
  dateTime?: string;
  paymentMethod?: string;
  /** Amount handed over by customer. Empty → equals total. */
  amountPaid?: number;
  customerName?: string;
  memberCode?: string;
  /** E-invoice lookup code put in the random QR link (and printed by Circle K) */
  lookupCode?: string;
  /** Overrides whatever the template prints as the OCR `bill_id` (Mã CQT or barcode). Empty → generated. */
  billId?: string;
};

export type TBillItem = {
  title: string;
  barcode?: string;
  unit?: string;
  unitPrice: number;
  quantity: number;
  /** Absolute discount on the line, in VND */
  discount?: number;
};

export type TTaxInfo = {
  /** Percent, e.g. 10 */
  vatRate: number;
  /** true → unit prices already include VAT (most VN retail receipts) */
  priceIncludesVat: boolean;
};

export type TWatermarkOptions = {
  text?: string;
  opacity?: number;
  angle?: number;
  size?: number;
  /** Gap multiplier between tiles; bigger → sparser */
  spacing?: number;
  color?: string;
};

export type TDisplayOptions = {
  /** Language of the printed labels */
  language?: TReceiptLanguage;
  /** Overrides the template's font preset */
  fontId?: FONT_ID;
  /** Base font size in px */
  fontSize?: number;
  /** Paper width in px (58mm ≈ 384, 80mm ≈ 576 at 203dpi) */
  paperWidth?: number;
  /** Seed for QR/barcode/codes. Same seed → same output. */
  seed?: string;
  /** QR content; empty → random (from seed) */
  qrText?: string;
  /** Code 128 barcode content (printable ASCII); empty → random 20 digits (from seed) */
  barcodeText?: string;
  showQr?: boolean;
  showBarcode?: boolean;
  /** Ink darkness 0.5 → faded print, 1 → crisp */
  inkDensity?: number;
  watermark?: TWatermarkOptions;
};

export type TBillData = {
  templateId: string;
  store: TStoreInfo;
  transaction: TTransactionInfo;
  items: TBillItem[];
  tax: TTaxInfo;
  display: TDisplayOptions;
  footerNote?: string;
};

export type TBillLine = TBillItem & {
  index: number;
  lineTotal: number;
};

export type TBillTotals = {
  lines: TBillLine[];
  totalQuantity: number;
  /** Sum of unitPrice * quantity before discounts */
  grossAmount: number;
  totalDiscount: number;
  /** Amount before VAT */
  preTaxAmount: number;
  vatAmount: number;
  /** Amount the customer pays */
  grandTotal: number;
  amountPaid: number;
  change: number;
};

export type TBillCodes = {
  qrPayload: string;
  qrDataUrl: string;
  barcodeValue: string;
  barcodeDataUrl: string;
  /** Mã CQT (tax-authority code) in the "M1-YY-XXXXX-###########" format */
  taxAuthorityCode: string;
  /** The value the OCR reads as `bill_id` for this template; '' when the template has none */
  billId: string;
  /** What `billId` would be without the `transaction.billId` override */
  generatedBillId: string;
};

/** Everything a template needs to draw itself. Templates must be pure (no hooks) so satori can render them. */
export type TBillTemplateProps = {
  data: TBillData;
  totals: TBillTotals;
  codes: TBillCodes;
  font: { family: string; size: number };
  /** Printed-label translator for the chosen receipt language */
  t: TReceiptT;
};

/** Form fields a template can opt into. The form hides fields the active template doesn't use. */
export type TBillField =
  | 'store.legalName'
  | 'store.branch'
  | 'store.address'
  | 'store.phone'
  | 'store.hotline'
  | 'store.taxCode'
  | 'store.website'
  | 'store.slogan'
  | 'transaction.invoiceNo'
  | 'transaction.posNo'
  | 'transaction.cashier'
  | 'transaction.paymentMethod'
  | 'transaction.amountPaid'
  | 'transaction.customerName'
  | 'transaction.memberCode'
  | 'transaction.lookupCode'
  | 'transaction.billId'
  | 'item.barcode'
  | 'item.unit'
  | 'item.discount'
  | 'footerNote';

export type TBillTemplate = {
  id: string;
  name: string;
  description: string;
  /** Which printer look this template imitates, shown in the switcher */
  printerStyle: string;
  component: React.FC<TBillTemplateProps>;
  fontId: FONT_ID;
  fontSize: number;
  paperWidth: number;
  fields: TBillField[];
  /**
   * Catalog ACCOUNT values that belong to this store (matched case/accent-insensitively as
   * substrings); their products are suggested first.
   */
  catalogAccounts?: string[];
  /** Which catalog code the store's bill prints for an item. Default: barcode. */
  itemCode?: 'barcode' | 'artCode';
  /**
   * The receipt barcode number this store prints, built from the bill (store/POS/date/ticket).
   * Used when `display.barcodeText` is empty; default: 20 random digits.
   */
  barcodeValue?: (data: TBillData, random: ReturnType<typeof createRandom>) => string;
  /**
   * Where this store's receipt carries the OCR `bill_id` and which backend rule checks it.
   * Templates without it have no Bill ID field.
   */
  billId?: { source: TBillIdSource; retailer: TOcrRetailer };
  defaults: Pick<TBillData, 'store' | 'transaction' | 'footerNote'> & {
    tax?: Partial<TTaxInfo>;
  };
};
