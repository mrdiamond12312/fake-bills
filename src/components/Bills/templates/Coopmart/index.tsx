/**
 * Co-op supermarket receipt on a Courier-style slab mono: barcode + short name per line,
 * "VAT8%  qty  price đ  total đ", payment split, customer loyalty box, big barcode + digits.
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
  Text,
  Wordmark,
} from '@/components/Bills/shared/Print';
import type { TBillTemplate, TBillTemplateProps } from '@/components/Bills/types';
import { PAPER_WIDTH } from '@/const/bill';

const money = (value: number) => `${formatMoney(value, '.')} đ`;

const Coopmart: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, 'DD/MM/YYYY HH:mm:ss');
  // this printer drops accents
  const T = (key: Parameters<typeof t>[0], values?: Record<string, string | number>) =>
    vn(t(key, values));

  return (
    <Flex vertical>
      <Logo
        store={store}
        fallback={<Wordmark text={store.name} size={s * 2.2} sub={store.slogan} />}
      />
      <Flex vertical align="center">
        <Text align="center">{vn(store.branch)}</Text>
        <Text align="center">{`${T('receipt.taxCode')}: ${store.taxCode ?? ''}`}</Text>
        <Text align="center">{`${T('receipt.salesLocation')} ${vn(store.address)}`}</Text>
        <Text align="center">{`${T('receipt.phone')}: ${store.phone ?? ''}`}</Text>
        <Text align="center">{`Hotline: ${store.hotline ?? ''}`}</Text>
        <Text align="center">{`Website: ${store.website ?? ''}`}</Text>
        <Text align="center" size={s * 1.2} bold>
          {T('receipt.bill').toUpperCase()}
        </Text>
        <Text align="center">{T('receipt.supermarketOrder')}</Text>
        <Text align="center">{`${T('receipt.taxAuthorityCode')}: ${codes.taxAuthorityCode}`}</Text>
      </Flex>
      <Flex justify="space-between">
        <Text>{`${T('receipt.counter')}: ${transaction.posNo ?? ''}`}</Text>
        <Text align="right" nowrap>{`${T('receipt.date')}: ${dateTime}`}</Text>
      </Flex>
      <Flex justify="space-between">
        <Text>{`${T('receipt.staff')}: ${vn(transaction.cashier)}`}</Text>
        <Text align="right" nowrap>{`${T('receipt.invoiceNo')}: ${
          transaction.invoiceNo ?? ''
        }`}</Text>
      </Flex>
      <CharLine />
      {totals.lines.map((line) => (
        <Flex vertical key={line.index} className="mb-0.5">
          <Cells
            cells={[
              { text: line.barcode ?? '', width: s * 8.6 },
              { text: vn(line.title), flex: 1 },
            ]}
          />
          <Cells
            cells={[
              { text: `VAT${tax.vatRate}%`, width: s * 4 },
              { text: line.quantity, width: s * 2, align: 'right' },
              { text: money(line.unitPrice), flex: 1, align: 'right' },
              { text: money(line.lineTotal), flex: 1, align: 'right' },
            ]}
          />
        </Flex>
      ))}
      <CharLine char="=" />
      <KeyValue label={`${T('receipt.totalQuantity')}:`} value={totals.totalQuantity} />
      <KeyValue label={`${T('receipt.totalAmount')}:`} value={money(totals.grandTotal)} bold />
      <Text>{`${T('receipt.paymentMethod')}:`}</Text>
      <KeyValue
        label={`${vn(transaction.paymentMethod) || T('receipt.cash')}:`}
        value={money(totals.amountPaid)}
      />
      <KeyValue
        label={`${T('receipt.vatIncludedRate', { rate: tax.vatRate })}:`}
        value={money(totals.vatAmount)}
      />
      <CharLine char="=" />
      <Text bold>{`${T('receipt.loyalty').toUpperCase()}:`}</Text>
      <Flex vertical className="pl-6">
        <Text>{`${T('receipt.memberCode').padEnd(11)}: ${transaction.memberCode ?? ''}`}</Text>
        <Text>{`${T('receipt.fullName').padEnd(11)}: ${(
          transaction.customerName ?? ''
        ).toUpperCase()}`}</Text>
      </Flex>
      <CharLine char="=" />
      <Text align="center">{vn(data.footerNote)}</Text>
      {display.showBarcode !== false ? (
        <Flex vertical align="center" className="mt-1">
          <PrintImage src={codes.barcodeDataUrl} width={Math.round(s * 22)} height={s * 3.5} />
          <Text align="center">{codes.barcodeValue}</Text>
        </Flex>
      ) : null}
      <Text>{`${T('receipt.transactionCode')}: ${codes.barcodeValue} ${dateTime.slice(
        11,
        16,
      )}`}</Text>
      {display.showQr ? (
        <Flex justify="center" className="mt-2">
          <PrintImage src={codes.qrDataUrl} width={s * 6} />
        </Flex>
      ) : null}
    </Flex>
  );
};

export const coopmartTemplate: TBillTemplate = {
  id: 'coopmart',
  name: 'Co.opmart layout',
  description: 'Co-op supermarket, barcode-first lines with đ amounts, loyalty block',
  printerStyle: 'Courier-style slab mono',
  component: Coopmart,
  fontId: FONT_ID.ibmPlexMono,
  fontSize: 14,
  paperWidth: PAPER_WIDTH.mm80 - 96,
  catalogAccounts: ['co.op', 'coop'],
  // store + counter + YYMMDD + invoice no, e.g. 0012000126010110001
  barcodeValue: ({ transaction }, random) => {
    return [
      `00${random.int(100, 999)}`,
      digitsOf(transaction.posNo, 3),
      formatDateTime(transaction.dateTime, 'YYYYMMDDHHmmss').slice(2, 8),
      digitsOf(transaction.invoiceNo, 5),
    ].join('');
  },
  fields: [
    'store.branch',
    'store.address',
    'store.phone',
    'store.hotline',
    'store.taxCode',
    'store.website',
    'store.slogan',
    'transaction.invoiceNo',
    'transaction.posNo',
    'transaction.cashier',
    'transaction.paymentMethod',
    'transaction.amountPaid',
    'transaction.customerName',
    'transaction.memberCode',
    'transaction.lookupCode',
    'item.barcode',
    'footerNote',
  ],
  defaults: {
    store: {
      name: 'LuaVang coop',
      slogan: 'bạn của mọi nhà',
      branch: 'Lúa Vàng Co-op Tân Phú',
      address: '02 Trường Chinh, P. Tây Thạnh, Q. Tân Phú, TP.HCM',
      phone: '(028)30000000',
      hotline: '1900000000',
      taxCode: '0100000004',
      website: 'www.luavangcoop.example.com',
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: '',
      showLogo: true,
      logoAlign: 'center',
    },
    transaction: {
      invoiceNo: '10001',
      posNo: '01',
      cashier: '00000001-NVA',
      paymentMethod: 'MOMO',
      memberCode: '1000000000001',
      customerName: 'Nguyễn Văn A',
    },
    footerNote: 'Cam on Quy khach - Hen gap lai',
    tax: { vatRate: 8 },
  },
};
