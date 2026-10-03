/**
 * Hypermarket receipt on condensed thermal mono, unaccented: left-aligned header,
 * "ENT date POS:store-pos", "=" rules, "001 NAME" lines with "barcode dgia sl so tien" below,
 * VAT + total, double-height amount received / change, cashier, receipt barcode + digits,
 * e-invoice policy text, QR, member footer.
 */
import { Flex } from 'antd';
import React from 'react';

import { FONT_ID } from '@/components/Bills/fonts';
import {
  digitsOf,
  formatDateTime,
  formatMoney,
  stripDiacritics as vn,
} from '@/components/Bills/helpers/calc';
import {
  Cells,
  CharLine,
  KeyValue,
  Logo,
  PrintImage,
  PrintScale,
  Text,
  Wordmark,
} from '@/components/Bills/shared/Print';
import type { TBillTemplate, TBillTemplateProps } from '@/components/Bills/types';
import { PAPER_WIDTH } from '@/const/bill';

const LotteMart: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;
  // this printer drops accents
  const T = (key: Parameters<typeof t>[0]) => vn(t(key));
  const vatLabel = `${String(tax.vatRate).padStart(2, '0')} % VAT`;

  return (
    <Flex vertical>
      <Logo
        store={store}
        fallback={<Wordmark text={store.name} size={s * 2.2} letterSpacing={1} />}
      />
      <Text>{vn(store.branch).toUpperCase()}</Text>
      <Text>{vn(store.address).toUpperCase()}</Text>
      <Text>{`Hotline: ${store.hotline ?? ''}`}</Text>
      <Text>{`MST: ${store.taxCode ?? ''}`}</Text>
      <Cells
        cells={[
          { text: 'ENT', width: s * 3 },
          { text: formatDateTime(transaction.dateTime, 'YYYY-MM-DD HH:mm'), flex: 1 },
          { text: `POS:${transaction.posNo ?? ''}`, flex: 1, align: 'right' },
        ]}
      />
      <CharLine char="=" />
      <Cells
        cells={[
          { text: T('receipt.productCodeShort'), flex: 2 },
          { text: T('receipt.unitPriceShort').toLowerCase(), flex: 1, align: 'right' },
          { text: T('receipt.qty').toLowerCase(), width: s * 2.5, align: 'right' },
          { text: T('receipt.money').toLowerCase(), flex: 1, align: 'right' },
        ]}
      />
      <CharLine char="=" />
      {totals.lines.map((line) => (
        <Flex vertical key={line.index}>
          <Text>{`${String(line.index + 1).padStart(3, '0')} ${vn(line.title).toUpperCase()}`}</Text>
          <Cells
            cells={[
              { text: ` ${line.barcode ?? ''}`, flex: 2 },
              { text: String(Math.round(line.unitPrice)), flex: 1, align: 'right' },
              { text: line.quantity, width: s * 2.5, align: 'right' },
              { text: formatMoney(line.lineTotal), flex: 1, align: 'right' },
            ]}
          />
        </Flex>
      ))}
      <CharLine char="=" />
      <KeyValue label={vatLabel} value={formatMoney(totals.vatAmount)} />
      <KeyValue label={T('receipt.total')} value={formatMoney(totals.grandTotal)} />
      <CharLine char="=" />
      <KeyValue label={T('receipt.amountTendered')} value={formatMoney(totals.amountPaid)} />
      <CharLine char="-" />
      <KeyValue
        label={vn(transaction.paymentMethod || t('receipt.cash')).toUpperCase()}
        value={formatMoney(totals.amountPaid)}
      />
      <KeyValue label={T('receipt.invoiceNoLong')} value={transaction.invoiceNo ?? ''} />
      <CharLine char="-" />
      <Flex justify="space-between">
        <PrintScale fontSize={s}>
          <Text>{T('receipt.amountCollected')}</Text>
        </PrintScale>
        <PrintScale fontSize={s} align="right">
          <Text>{formatMoney(totals.amountPaid)}</Text>
        </PrintScale>
      </Flex>
      <Flex justify="space-between">
        <PrintScale fontSize={s}>
          <Text>{T('receipt.changeReturned')}</Text>
        </PrintScale>
        <PrintScale fontSize={s} align="right">
          <Text>{formatMoney(totals.change)}</Text>
        </PrintScale>
      </Flex>
      <CharLine char="=" />
      <Flex justify="space-between">
        <Text>{`${T('receipt.itemLines')} : ${totals.lines.length}`}</Text>
        <Text align="right" nowrap>{`${T('receipt.soldQty')} : ${totals.totalQuantity}`}</Text>
      </Flex>
      <CharLine char="-" />
      <Text>{`Cashier:${vn(transaction.cashier).toUpperCase()}`}</Text>
      {/* receipt barcode: after the totals, before the policy text */}
      {display.showBarcode !== false ? (
        <Flex vertical align="center">
          <PrintImage src={codes.barcodeDataUrl} width={Math.round(s * 18)} height={s * 2} />
          <Text align="center">{codes.barcodeValue}</Text>
        </Flex>
      ) : null}
      <Text className="mt-2">{vn(data.footerNote).toUpperCase()}</Text>
      {display.showQr !== false ? (
        <Flex justify="center" className="mt-2">
          <PrintImage src={codes.qrDataUrl} width={s * 7} />
        </Flex>
      ) : null}
      <Text className="mt-2" size={s * 0.85}>
        {T('receipt.memberSavings').toUpperCase()}
      </Text>
    </Flex>
  );
};

export const lotteMartTemplate: TBillTemplate = {
  id: 'lotte-mart',
  name: 'Lotte Mart layout',
  description: 'Hypermarket, unaccented mono, numbered lines with barcode row, barcode before policy',
  printerStyle: 'Condensed thermal mono (Epson Font B)',
  component: LotteMart,
  fontId: FONT_ID.inconsolataCondensed,
  fontSize: 17,
  paperWidth: PAPER_WIDTH.mm58 + 32,
  catalogAccounts: ['lotte'],
  billId: { source: 'barcode', retailer: 'lottemart' },
  // 002 + YYMMDD + store/POS (from "0206-0119") + 8-digit sequence, e.g. 0022601010001000100000001
  barcodeValue: ({ transaction }) =>
    [
      '002',
      formatDateTime(transaction.dateTime, 'YYYYMMDDHHmmss').slice(2, 8),
      digitsOf(transaction.posNo, 8),
      digitsOf(transaction.invoiceNo, 8),
    ].join(''),
  fields: [
    'store.branch',
    'store.address',
    'store.hotline',
    'store.taxCode',
    'transaction.invoiceNo',
    'transaction.billId',
    'transaction.posNo',
    'transaction.cashier',
    'transaction.paymentMethod',
    'transaction.amountPaid',
    'item.barcode',
    'footerNote',
  ],
  defaults: {
    store: {
      name: 'SAO MAI Mart',
      branch: 'SAO MAI Mart Phú Thọ',
      address: 'Lầu 1, 000 Đường Số 1, P.1, Q.1',
      hotline: '0900000000',
      taxCode: '0100000009',
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: '',
      showLogo: true,
      logoAlign: 'center',
    },
    transaction: {
      invoiceNo: '00000001',
      posNo: '0001-0001',
      cashier: '100000001 Nguyễn Văn A',
      paymentMethod: 'QR VNPAY',
    },
    footerNote:
      'Hóa đơn GTGT chỉ được xuất trong ngày phát hành hóa đơn bán hàng, quý khách vui lòng quét mã QR trước 11PM để nhận hóa đơn GTGT.',
    tax: { vatRate: 8 },
  },
};
