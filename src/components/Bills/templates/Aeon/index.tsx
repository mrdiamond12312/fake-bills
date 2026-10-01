/**
 * Aeon mall layout: condensed thermal mono in accented uppercase, "=" rules,
 * SẢN PHẨM / MÃ HÀNG / SỐ LƯỢNG header, per-line VAT, payment block, member points,
 * two QR codes each with a note beside it.
 */
import { Flex } from 'antd';
import React from 'react';

import { FONT_ID } from '@/components/Bills/fonts';
import { formatDateTime, formatMoney } from '@/components/Bills/helpers/calc';
import {
  CharLine,
  Cells,
  KeyValue,
  Logo,
  PrintImage,
  Spacer,
  Text,
  Wordmark,
} from '@/components/Bills/shared/Print';
import type { TBillTemplate, TBillTemplateProps } from '@/components/Bills/types';
import { PAPER_WIDTH } from '@/const/bill';

const money = (value: number) => formatMoney(value, '.');

const Aeon: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, 'DD/MM/YYYY HH:mm');
  const upper = (text?: string) => (text ?? '').toUpperCase();
  const T = (key: Parameters<typeof t>[0]) => upper(t(key));

  return (
    <Flex vertical>
      <Logo
        store={store}
        fallback={<Wordmark text={store.name} size={s * 2.6} letterSpacing={2} />}
      />
      <Flex vertical align="center">
        <Text align="center">{store.legalName ?? ''}</Text>
        <Text align="center">{`${T('receipt.phone')}: ${store.phone ?? ''} - ${
          store.website ?? ''
        }`}</Text>
        <Text align="center">{`${T('receipt.openingHours')}: ${upper(store.slogan)}`}</Text>
        <Text align="center">{`${T('receipt.phone')}: ${store.hotline ?? ''}`}</Text>
        <Text align="center">
          {transaction.lookupCode || `M1-26-${codes.barcodeValue.slice(0, 13)}`}
        </Text>
      </Flex>
      <Text>{T('receipt.product')}</Text>
      <Text>{T('receipt.productCode')}</Text>
      <Flex justify="space-between" align="flex-end">
        <Flex flex={1} className="min-w-0">
          <Cells
            cells={[
              { text: T('receipt.quantity'), width: s * 6 },
              { text: T('receipt.unitPrice'), flex: 1, align: 'center' },
            ]}
          />
        </Flex>
        <Flex vertical align="flex-end" className="shrink-0">
          <Text align="right">VAT</Text>
          <Text align="right" nowrap>
            {T('receipt.amount')}
          </Text>
        </Flex>
      </Flex>
      <CharLine char="=" />
      {totals.lines.map((line) => (
        <Flex vertical key={line.index} className="mb-0.5">
          <Text>{upper(line.title)}</Text>
          <Flex justify="space-between">
            <Text>{line.barcode ?? ''}</Text>
            <Text align="right" nowrap>{`VAT ${tax.vatRate}%`}</Text>
          </Flex>
          <Cells
            cells={[
              { text: line.quantity, width: s * 6 },
              { text: money(line.unitPrice), flex: 1, align: 'center' },
              { text: money(line.lineTotal), flex: 1, align: 'right' },
            ]}
          />
        </Flex>
      ))}
      <CharLine />
      <Text>{`${T('receipt.itemCount')}: ${totals.lines.length}`}</Text>
      <Text>{T('receipt.paymentMethod')}</Text>
      <KeyValue
        label={`${upper(transaction.paymentMethod) || T('receipt.cash')}       :`}
        value=""
      />
      <Text align="right">{money(totals.amountPaid)}</Text>
      <CharLine />
      <KeyValue label={`${T('receipt.totalPayment')}     :`} value={money(totals.grandTotal)} />
      <KeyValue label={`${T('receipt.change')}       :`} value={money(totals.change)} />
      <CharLine />
      <Text>{T('receipt.pricesIncludeVat')}</Text>
      <CharLine />
      <Text>{`${T('receipt.cashier')}: ${transaction.cashier ?? ''}`}</Text>
      <Text>{`${T('receipt.counter')}: ${transaction.posNo ?? ''}`}</Text>
      <Text>{`${T('receipt.memberId')}: ${transaction.memberCode ?? ''}`}</Text>
      <Text>{`${T('receipt.pointsStar')}: 0`}</Text>
      <Flex justify="space-between">
        <Text>{`${T('receipt.transactionNo')}: ${transaction.invoiceNo ?? ''}`}</Text>
        <Text align="right" nowrap>{`${dateTime.slice(11)} ${dateTime.slice(0, 10)}`}</Text>
      </Flex>
      <CharLine char="=" />
      <Text align="center">{upper(data.footerNote)}</Text>
      <Spacer size={10} />
      {display.showQr !== false ? (
        <Flex vertical gap={16}>
          <Flex gap={12} align="center">
            <PrintImage src={codes.qrDataUrl} width={s * 5} />
            <Text flex={1}>{t('receipt.scanQrVat')}</Text>
          </Flex>
          <Flex gap={12} align="center">
            <PrintImage src={codes.qrDataUrl} width={s * 5} />
            <Text flex={1}>{t('receipt.scanQrFeedback')}</Text>
          </Flex>
        </Flex>
      ) : null}
      <Spacer size={10} />
      <Text align="center">{t('receipt.thanks')}</Text>
      {display.showBarcode ? (
        <Flex justify="center" className="mt-2">
          <PrintImage src={codes.barcodeDataUrl} width={Math.round(s * 16)} height={s * 2} />
        </Flex>
      ) : null}
    </Flex>
  );
};

export const aeonTemplate: TBillTemplate = {
  id: 'aeon',
  name: 'Aeon layout',
  description: 'Mall receipt: accented uppercase mono, per-line VAT, member points, two QR notes',
  printerStyle: 'Condensed thermal mono (Epson Font B)',
  component: Aeon,
  fontId: FONT_ID.inconsolataCondensed,
  fontSize: 17,
  paperWidth: PAPER_WIDTH.mm58 + 32,
  catalogAccounts: ['aeon'],
  // the bill prints the store's own item code (ART CODE), not the EAN
  itemCode: 'artCode',
  fields: [
    'store.legalName',
    'store.phone',
    'store.hotline',
    'store.website',
    'store.slogan',
    'transaction.invoiceNo',
    'transaction.posNo',
    'transaction.cashier',
    'transaction.paymentMethod',
    'transaction.amountPaid',
    'transaction.memberCode',
    'transaction.lookupCode',
    'item.barcode',
    'footerNote',
  ],
  defaults: {
    store: {
      name: 'AURORA',
      legalName: 'Trung tâm mua sắm AURORA-BÌNH DƯƠNG',
      phone: '1800.000.000',
      hotline: '1800.000.111',
      website: 'www.aurora.example.com',
      slogan: '8H00-22H00',
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: '',
      showLogo: true,
      logoAlign: 'center',
    },
    transaction: {
      invoiceNo: '0150241',
      posNo: '015',
      cashier: 'Nguyễn Thị Khánh An',
      paymentMethod: 'Tiền mặt',
      memberCode: '1003279371',
      amountPaid: 60000,
    },
    footerNote:
      'Vui lòng giữ lại phiếu để có thể đổi, trả trong thời hạn quy định được niêm yết tại quầy dịch vụ khách hàng',
    tax: { vatRate: 8 },
  },
};
