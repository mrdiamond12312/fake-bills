import { yupResolver } from '@hookform/resolvers/yup';
import { useIntl } from '@umijs/max';
import * as yup from 'yup';

import { WATERMARK_LIMITS } from '@/const/bill';
import { BILL_ITEM_KEY, TBillFormFields } from '@/pages/admin/bills/create/helpers/billFormKeys';

export const useBillResolver = () => {
  const { formatMessage } = useIntl();

  const numberError = formatMessage({
    id: 'bills.form.validation.number',
    defaultMessage: 'Please enter a number!',
  });

  const ItemSchema = yup.object().shape({
    [BILL_ITEM_KEY.title]: yup
      .string()
      .trim()
      .required(
        formatMessage({
          id: 'bills.form.validation.item.title',
          defaultMessage: 'Product title is required',
        }),
      ),
    [BILL_ITEM_KEY.barcode]: yup.string(),
    [BILL_ITEM_KEY.unit]: yup.string(),
    [BILL_ITEM_KEY.unitPrice]: yup
      .number()
      .typeError(numberError)
      .min(
        0,
        formatMessage({
          id: 'bills.form.validation.price.min',
          defaultMessage: 'Price must be ≥ 0',
        }),
      )
      .required(),
    [BILL_ITEM_KEY.quantity]: yup
      .number()
      .typeError(numberError)
      .moreThan(
        0,
        formatMessage({
          id: 'bills.form.validation.quantity.min',
          defaultMessage: 'Quantity must be > 0',
        }),
      )
      .required(),
    [BILL_ITEM_KEY.discount]: yup.number().typeError(numberError).min(0).nullable(),
  });

  const BillSchema = yup.object().shape({
    templateId: yup.string().required(),
    store: yup.object().shape({
      name: yup
        .string()
        .trim()
        .required(
          formatMessage({
            id: 'bills.form.validation.store.name',
            defaultMessage: 'Store name is required',
          }),
        ),
      logoWidth: yup.number().min(24).max(400).nullable(),
    }),
    transaction: yup.object().shape({
      // may become the Code 128 barcode, so the same limits apply
      billId: yup
        .string()
        .max(
          80,
          formatMessage({
            id: 'bills.form.validation.barcode.max',
            defaultMessage: 'Barcode content must be at most 80 characters',
          }),
        )
        .matches(/^[\x20-\x7E]*$/, {
          message: formatMessage({
            id: 'bills.form.validation.barcode.ascii',
            defaultMessage: 'Code 128 only supports plain ASCII (no accents)',
          }),
        }),
    }),
    items: yup
      .array()
      .of(ItemSchema)
      .min(
        1,
        formatMessage({
          id: 'bills.form.validation.items.min',
          defaultMessage: 'Add at least one product',
        }),
      ),
    tax: yup.object().shape({
      vatRate: yup
        .number()
        .typeError(numberError)
        .min(0)
        .max(
          100,
          formatMessage({ id: 'bills.form.validation.vat.max', defaultMessage: 'VAT ≤ 100%' }),
        )
        .required(),
      priceIncludesVat: yup.boolean(),
    }),
    display: yup.object().shape({
      qrText: yup.string().max(
        1000,
        formatMessage({
          id: 'bills.form.validation.qr.max',
          defaultMessage: 'QR content must be at most 1000 characters',
        }),
      ),
      barcodeText: yup
        .string()
        .max(
          80,
          formatMessage({
            id: 'bills.form.validation.barcode.max',
            defaultMessage: 'Barcode content must be at most 80 characters',
          }),
        )
        .matches(/^[\x20-\x7E]*$/, {
          message: formatMessage({
            id: 'bills.form.validation.barcode.ascii',
            defaultMessage: 'Code 128 only supports plain ASCII (no accents)',
          }),
        }),
      watermark: yup.object().shape({
        opacity: yup.number().min(WATERMARK_LIMITS.opacity.min).max(WATERMARK_LIMITS.opacity.max),
      }),
    }),
  });

  return {
    FormSchema: yupResolver(BillSchema) as any as ReturnType<typeof yupResolver<TBillFormFields>>,
  };
};
