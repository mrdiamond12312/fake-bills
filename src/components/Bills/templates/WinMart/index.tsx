/**
 * Compact minimart slip in Arial: logo, PHIẾU TÍNH TIỀN, "date|MSCH|PTT" line, NV, Mã CQT,
 * bilingual Mặt hàng/giá · Description header, name / SKU / "qty x price" item lines with the
 * amount below, TỔNG CỘNG VND block, pre-tax/VAT split, QR beside the e-invoice note, barcode.
 * Sections are split by dotted printed rules.
 */
import { Flex } from 'antd';
import React from 'react';

import { FONT_ID } from '@/components/Bills/fonts';
import { formatDateTime, formatMoney } from '@/components/Bills/helpers/calc';
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

/** The printer's dotted rule between sections. */
const Divider: React.FC = () => <CharLine char="." className="my-0.5" />;

const WinMart: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;

  return (
    <Flex vertical>
      <Logo
        store={store}
        fallback={<Wordmark text={store.name} size={s * 2.4} letterSpacing={0} />}
      />
      <Flex vertical align="center">
        <Text align="center" size={s * 1.3} bold>
          {t('receipt.bill').toUpperCase()}
        </Text>
        {/* MSCH (store code) sits between the date/time and PTT on one line */}
        <Text align="center" size={s * 0.9}>{`${formatDateTime(
          transaction.dateTime,
          'DD/MM/YYYY HH:mm',
        )}|MSCH:${store.branch ?? ''}|PTT:${transaction.invoiceNo ?? ''}`}</Text>
        <Text align="center">{`NV:${transaction.cashier ?? ''}`}</Text>
        <Text align="center">{`${t('receipt.taxAuthorityCode')}: ${codes.taxAuthorityCode}`}</Text>
      </Flex>

      <Cells
        className="mt-2"
        cells={[
          { text: t('receipt.itemPrice'), flex: 3 },
          { text: t('receipt.qty'), flex: 1, align: 'right' },
        ]}
      />
      <Cells
        cells={[
          { text: t('receipt.descriptionBilingual'), flex: 3 },
          { text: t('receipt.amountShort'), flex: 2, align: 'right' },
        ]}
      />
      <Divider />
      {totals.lines.map((line) => (
        <Flex vertical key={line.index}>
          <Text>{line.title}</Text>
          {line.barcode ? <Text>{line.barcode}</Text> : null}
          <Cells
            cells={[
              { text: `${line.quantity} x ${formatMoney(line.unitPrice)}`, flex: 3 },
              { text: line.quantity, flex: 1, align: 'right' },
            ]}
          />
          {line.discount ? (
            <KeyValue label={t('receipt.promo')} value={`-${formatMoney(line.discount)}`} />
          ) : null}
          <Text align="right">{formatMoney(line.lineTotal)}</Text>
          <Divider />
        </Flex>
      ))}

      <KeyValue
        label={t('receipt.totalVnd').toUpperCase()}
        value={formatMoney(totals.grandTotal)}
        bold
      />
      <KeyValue label={t('receipt.quantity')} value={totals.totalQuantity} />
      <KeyValue
        label={transaction.paymentMethod || t('receipt.cash')}
        value={formatMoney(totals.amountPaid)}
      />
      {totals.change ? (
        <KeyValue label={t('receipt.change')} value={formatMoney(totals.change)} />
      ) : null}
      <Divider />

      <Text>{`${t('receipt.netValue')}:`}</Text>
      <Cells
        cells={[
          { text: '1', width: s * 1.5 },
          {
            text: t('receipt.vatRateOf', {
              rate: Number(tax.vatRate).toFixed(2),
              base: formatMoney(totals.preTaxAmount),
            }),
            flex: 3,
          },
          { text: formatMoney(totals.preTaxAmount), flex: 2, align: 'right' },
        ]}
      />
      <Text align="right">{formatMoney(totals.vatAmount)}</Text>
      {transaction.customerName ? (
        <Flex vertical>
          <Divider />
          <Text>{`${t('receipt.customer')} ${transaction.customerName}`}</Text>
        </Flex>
      ) : null}
      <Divider />

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
  description: 'Minimart slip, bilingual header, qty × price lines, pre-tax/VAT split, QR + note',
  printerStyle: 'Arial / Helvetica',
  component: WinMart,
  fontId: FONT_ID.arimo,
  fontSize: 15,
  paperWidth: PAPER_WIDTH.mm58 + 16,
  catalogAccounts: ['winmart', 'bach hoa xanh', 'bhx'],
  billId: { source: 'cqt', retailer: 'winmart' },
  fields: [
    'store.branch',
    'store.hotline',
    'transaction.invoiceNo',
    'transaction.billId',
    'transaction.cashier',
    'transaction.paymentMethod',
    'transaction.amountPaid',
    'transaction.customerName',
    'item.barcode',
    'item.discount',
    'footerNote',
  ],
  defaults: {
    store: {
      name: 'HạnhPhúc',
      /** MSCH: the store's numeric code */
      branch: '1001',
      hotline: '024 0000 0000',
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: '',
      showLogo: true,
      logoAlign: 'center',
    },
    transaction: {
      invoiceNo: '100126010100001',
      cashier: '00000001',
      paymentMethod: 'VietQR',
    },
    footerNote:
      'Quét QR để xuất hóa đơn hoặc truy cập hoadon.example.com trong 60 phút. Xin từ chối chịu trách nhiệm nếu nhập thông tin sai.',
  },
};
