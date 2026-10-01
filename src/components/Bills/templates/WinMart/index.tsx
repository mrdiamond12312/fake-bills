/**
 * Compact minimart slip in Arial: bold title, "date|MSCH|NV" line, Mặt hàng/SL/KM/T.Tiền
 * table, TỔNG TIỀN, QR on the left with the e-invoice note beside it, barcode.
 */
import { Flex } from 'antd';
import React from 'react';

import { FONT_ID } from '@/components/Bills/fonts';
import { formatDateTime, formatMoney } from '@/components/Bills/helpers/calc';
import {
  Cells,
  KeyValue,
  Logo,
  PrintImage,
  RuleLine,
  Text,
  Wordmark,
} from '@/components/Bills/shared/Print';
import type { TBillTemplate, TBillTemplateProps } from '@/components/Bills/types';
import { PAPER_WIDTH } from '@/const/bill';

const WinMart: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display } = data;
  const s = font.size;

  return (
    <Flex vertical>
      <Logo
        store={store}
        fallback={<Wordmark text={store.name} size={s * 2.4} letterSpacing={0} />}
      />
      <Flex vertical align="center">
        <Text align="center" bold size={s * 1.3}>
          {t('receipt.bill').toUpperCase()}
        </Text>
        <Text align="center">{`${formatDateTime(transaction.dateTime, 'DD/MM/YYYY HH:mm')}|MSCH:${
          store.branch ?? ''
        }|NV:${transaction.cashier ?? ''}`}</Text>
        <Text align="center">{`PTT:${transaction.invoiceNo ?? ''}`}</Text>
        <Text align="center" italic>{`${t('receipt.taxAuthorityCode')}: ${
          transaction.lookupCode || codes.barcodeValue.slice(0, 14)
        }`}</Text>
      </Flex>
      <Cells
        className="mt-3"
        cells={[
          { text: t('receipt.itemPrice'), flex: 3 },
          { text: t('receipt.qty'), flex: 1, align: 'center' },
          { text: t('receipt.promo'), flex: 1, align: 'center' },
          { text: t('receipt.amountShort'), flex: 2, align: 'right' },
        ]}
      />
      {totals.lines.map((line) => (
        <Flex vertical key={line.index} className="mt-1">
          <Text>{line.title}</Text>
          <Cells
            cells={[
              { text: formatMoney(line.unitPrice), flex: 3 },
              { text: line.quantity, flex: 1, align: 'center' },
              { text: line.discount ? formatMoney(line.discount) : '', flex: 1, align: 'center' },
              { text: formatMoney(line.lineTotal), flex: 2, align: 'right' },
            ]}
          />
        </Flex>
      ))}
      <RuleLine dashed />
      <Cells
        cells={[
          { text: t('receipt.totalAmount').toUpperCase(), flex: 3, bold: true },
          { text: '', flex: 1 },
          { text: formatMoney(totals.totalDiscount), flex: 1, align: 'center' },
          { text: formatMoney(totals.grandTotal), flex: 2, align: 'right', bold: true },
        ]}
      />
      <KeyValue
        label={t('receipt.vatInRate', { rate: data.tax.vatRate })}
        value={formatMoney(totals.vatAmount)}
      />
      <RuleLine dashed />
      <Flex gap={8} align="flex-start">
        {display.showQr !== false ? (
          <Flex vertical className="shrink-0">
            <PrintImage src={codes.qrDataUrl} width={s * 6.5} />
            <Text>{`${t('receipt.invoiceCode')}: ${(transaction.invoiceNo ?? '').slice(-4)}`}</Text>
          </Flex>
        ) : null}
        <Flex vertical flex={1}>
          <Text>{data.footerNote ?? ''}</Text>
          {display.showBarcode !== false ? (
            <Flex className="mt-2">
              <PrintImage src={codes.barcodeDataUrl} width={Math.round(s * 13)} height={s * 2.4} />
            </Flex>
          ) : null}
          <Text>{`${t('receipt.phone')}: ${store.hotline ?? ''}`}</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const winMartTemplate: TBillTemplate = {
  id: 'winmart',
  name: 'WinMart / Bách Hóa Xanh layout',
  description: 'Compact minimart slip, discount column, QR + e-invoice note side by side',
  printerStyle: 'Arial / Helvetica',
  component: WinMart,
  fontId: FONT_ID.arimo,
  fontSize: 15,
  paperWidth: PAPER_WIDTH.mm58 + 16,
  catalogAccounts: ['winmart', 'bach hoa xanh', 'bhx'],
  fields: [
    'store.branch',
    'store.hotline',
    'transaction.invoiceNo',
    'transaction.cashier',
    'transaction.lookupCode',
    'item.discount',
    'footerNote',
  ],
  defaults: {
    store: {
      name: 'HạnhPhúc',
      branch: '1664',
      hotline: '024 0000 0000',
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: '',
      showLogo: true,
      logoAlign: 'center',
    },
    transaction: {
      invoiceNo: '166401250803265',
      cashier: '09043572',
    },
    footerNote:
      'Quét QR để xuất hóa đơn hoặc truy cập hoadon.example.com trong 60 phút. Xin từ chối chịu trách nhiệm nếu nhập thông tin sai.',
  },
};
