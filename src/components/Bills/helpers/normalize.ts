import { randomSeed } from '@/components/Bills/helpers/random';
import { getBillTemplate } from '@/components/Bills/registry';
import type { TBillData, TBillItem } from '@/components/Bills/types';
import { DEFAULT_VAT_RATE, WATERMARK_LIMITS } from '@/const/bill';

export type TDeepPartialBill = Partial<
  Omit<TBillData, 'store' | 'transaction' | 'tax' | 'display' | 'items'>
> & {
  store?: Partial<TBillData['store']>;
  transaction?: Partial<TBillData['transaction']>;
  tax?: Partial<TBillData['tax']>;
  display?: Partial<TBillData['display']>;
  items?: Partial<TBillItem>[];
};

export const SAMPLE_ITEMS: TBillItem[] = [
  {
    title: 'Nước suối tinh khiết 500ml',
    barcode: '8930000000017',
    unit: 'Chai',
    unitPrice: 7000,
    quantity: 3,
  },
  {
    title: 'Mì ăn liền vị tôm chua cay 75g',
    barcode: '8930000000024',
    unit: 'Gói',
    unitPrice: 4500,
    quantity: 5,
  },
];

/**
 * Fills anything missing from the template's defaults.
 * Used by the form (template switch / first load) and by the API (query params).
 */
export const normalizeBillData = (input: TDeepPartialBill = {}): TBillData => {
  const template = getBillTemplate(input.templateId);
  const { defaults } = template;

  const items = (input.items?.length ? input.items : SAMPLE_ITEMS).map((item) => ({
    title: item.title ?? '',
    barcode: item.barcode ?? '',
    unit: item.unit ?? '',
    unitPrice: Number(item.unitPrice) || 0,
    quantity: Number(item.quantity) || 0,
    discount: Number(item.discount) || 0,
  }));

  return {
    templateId: template.id,
    store: { ...defaults.store, ...input.store, name: input.store?.name || defaults.store.name },
    transaction: {
      ...defaults.transaction,
      dateTime: new Date().toISOString(),
      ...input.transaction,
    },
    items,
    tax: {
      vatRate: DEFAULT_VAT_RATE,
      priceIncludesVat: true,
      ...defaults.tax,
      ...input.tax,
    },
    display: {
      fontId: template.fontId,
      fontSize: template.fontSize,
      paperWidth: template.paperWidth,
      seed: randomSeed(),
      language: 'vi',
      showQr: true,
      showBarcode: true,
      inkDensity: 1,
      ...input.display,
      watermark: {
        text: WATERMARK_LIMITS.defaultText,
        opacity: WATERMARK_LIMITS.opacity.default,
        size: WATERMARK_LIMITS.size.default,
        angle: WATERMARK_LIMITS.angle.default,
        spacing: WATERMARK_LIMITS.spacing.default,
        ...input.display?.watermark,
      },
    },
    footerNote: input.footerNote ?? defaults.footerNote,
  };
};

/**
 * Switching template keeps products/tax/watermark but swaps in the new store's
 * info, font and paper width.
 */
export const switchBillTemplate = (current: TBillData, templateId: string): TBillData => {
  const fresh = normalizeBillData({ templateId });
  return {
    ...fresh,
    items: current.items,
    tax: current.tax,
    transaction: { ...fresh.transaction, dateTime: current.transaction.dateTime },
    display: {
      ...fresh.display,
      seed: current.display.seed,
      language: current.display.language,
      showQr: current.display.showQr,
      showBarcode: current.display.showBarcode,
      inkDensity: current.display.inkDensity,
      watermark: current.display.watermark,
    },
  };
};
