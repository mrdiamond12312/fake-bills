import type { TBillData, TBillField } from '@/components/Bills/types';

export enum BILL_FORM_KEY {
  templateId = 'templateId',
  store = 'store',
  transaction = 'transaction',
  items = 'items',
  tax = 'tax',
  display = 'display',
  footerNote = 'footerNote',
}

export enum BILL_ITEM_KEY {
  title = 'title',
  barcode = 'barcode',
  unit = 'unit',
  unitPrice = 'unitPrice',
  quantity = 'quantity',
  discount = 'discount',
}

export type TBillFormFields = TBillData;

/** "items.3.title" */
export const itemFieldName = (index: number, key: BILL_ITEM_KEY) =>
  [BILL_FORM_KEY.items, index, key].join('.');

export const EMPTY_BILL_ITEM = {
  [BILL_ITEM_KEY.title]: '',
  [BILL_ITEM_KEY.barcode]: '',
  [BILL_ITEM_KEY.unit]: '',
  [BILL_ITEM_KEY.unitPrice]: 0,
  [BILL_ITEM_KEY.quantity]: 1,
  [BILL_ITEM_KEY.discount]: 0,
};

/** Form fields shown for the active template (`store.name`, dates, items, tax always show). */
export const isFieldVisible = (fields: TBillField[], field: TBillField) => fields.includes(field);
