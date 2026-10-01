/**
 * Hypermarket receipt on a tall condensed sans: logo + side info header, numbered
 * "01) VAT08 NAME" lines with barcode/price/qty/amount, double-height amount due,
 * tax split, point-save block.
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
  PrintScale,
  RuleLine,
  Spacer,
  Text,
  Wordmark,
} from '@/components/Bills/shared/Print';
import type { TBillTemplate, TBillTemplateProps } from '@/components/Bills/types';
import { PAPER_WIDTH } from '@/const/bill';

const Emart: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;
  const vatCode = `VAT${String(tax.vatRate).padStart(2, '0')}`;

  return (
    <Flex vertical>
      <Flex align="center" gap={8}>
        <Logo
          inline
          store={{ ...store, logoWidth: store.logoWidth ?? 130 }}
          defaultAlign="left"
          fallback={<Wordmark text={store.name} size={s * 1.9} />}
        />
        <Flex vertical flex={1} className="border-0 border-l border-solid border-[#1c1c1c] pl-2">
          <Text size={s * 0.7} bold>
            {store.branch ?? ''}
          </Text>
          <Text size={s * 0.7} bold>{`${t('receipt.phoneFull')}: ${store.phone ?? ''}`}</Text>
          <Text size={s * 0.7} bold>{`${t('receipt.taxCode')}: ${store.taxCode ?? ''}`}</Text>
        </Flex>
      </Flex>
      <Spacer size={10} />
      <Text>{store.address ?? ''}</Text>
      <Text>{store.slogan ?? ''}</Text>
      <Spacer size={10} />
      <Text>{`${transaction.invoiceNo ?? ''}  ${formatDateTime(
        transaction.dateTime,
        'DD-MM-YYYY HH:mm',
      )}  POS:${transaction.posNo ?? ''}`}</Text>
      <RuleLine dashed />
      <Cells
        cells={[
          { text: t('receipt.productNameLong'), flex: 3 },
          { text: t('receipt.unitPrice'), flex: 2, align: 'right' },
          { text: t('receipt.qty'), width: s * 2.5, align: 'right' },
          { text: t('receipt.money'), flex: 2, align: 'right' },
        ]}
      />
      <RuleLine dashed />
      {totals.lines.map((line) => (
        <Flex vertical key={line.index}>
          <Text>{`${String(line.index + 1).padStart(
            2,
            '0',
          )}) ${vatCode}  ${line.title.toUpperCase()}`}</Text>
          <Cells
            cells={[
              { text: line.barcode ?? '', flex: 3 },
              { text: formatMoney(line.unitPrice), flex: 2, align: 'right' },
              { text: line.quantity, width: s * 2.5, align: 'right' },
              { text: formatMoney(line.lineTotal), flex: 2, align: 'right' },
            ]}
          />
        </Flex>
      ))}
      <RuleLine dashed />
      <KeyValue label={t('receipt.subtotal')} value={formatMoney(totals.grossAmount)} />
      <Flex justify="space-between">
        <PrintScale fontSize={s}>
          <Text>{t('receipt.amountToReceive')}</Text>
        </PrintScale>
        <PrintScale fontSize={s} align="right">
          <Text>{formatMoney(totals.grandTotal)}</Text>
        </PrintScale>
      </Flex>
      <RuleLine />
      <KeyValue
        label={transaction.paymentMethod || t('receipt.cash')}
        value={formatMoney(totals.amountPaid)}
      />
      <KeyValue label={t('receipt.change')} value={formatMoney(totals.change)} />
      <RuleLine />
      <KeyValue label={t('receipt.taxable')} value={formatMoney(totals.preTaxAmount)} />
      <KeyValue label={t('receipt.vatAmount')} value={formatMoney(totals.vatAmount)} />
      <RuleLine />
      <KeyValue label={t('receipt.totalTax')} value={formatMoney(totals.vatAmount)} />
      <KeyValue label={vatCode} value={`(${formatMoney(totals.vatAmount)})`} />
      <Spacer size={8} />
      <Text align="center">{t('receipt.pointSave')}</Text>
      <KeyValue label={`${t('receipt.cardNo')}:`} value={transaction.memberCode ?? ''} />
      <KeyValue
        label={`${t('receipt.cardHolder')}:`}
        value={(transaction.customerName ?? '').toUpperCase()}
      />
      <RuleLine dashed />
      <Text>{`${t('receipt.totalItems')} : ${totals.totalQuantity}`}</Text>
      <Text>{`NO:${transaction.posNo ?? ''} ${t('receipt.cashier')}:${
        transaction.cashier ?? ''
      }`}</Text>
      <Spacer size={8} />
      <Text>{data.footerNote ?? ''}</Text>
      {display.showBarcode !== false ? (
        <Flex vertical align="center" className="mt-2">
          <PrintImage src={codes.barcodeDataUrl} width={Math.round(s * 18)} height={s * 2} />
          <Text align="center">{codes.barcodeValue}</Text>
        </Flex>
      ) : null}
      {display.showQr ? (
        <Flex justify="center" className="mt-2">
          <PrintImage src={codes.qrDataUrl} width={s * 6} />
        </Flex>
      ) : null}
    </Flex>
  );
};

export const emartTemplate: TBillTemplate = {
  id: 'emart',
  name: 'Emart layout',
  description: 'Hypermarket, numbered VAT-coded lines, double-height amount due, point save',
  printerStyle: 'Tall condensed sans',
  component: Emart,
  fontId: FONT_ID.robotoCondensed,
  fontSize: 16,
  paperWidth: PAPER_WIDTH.mm58 + 16,
  catalogAccounts: ['emart'],
  fields: [
    'store.branch',
    'store.address',
    'store.phone',
    'store.taxCode',
    'store.slogan',
    'transaction.invoiceNo',
    'transaction.posNo',
    'transaction.cashier',
    'transaction.paymentMethod',
    'transaction.amountPaid',
    'transaction.customerName',
    'transaction.memberCode',
    'item.barcode',
    'footerNote',
  ],
  defaults: {
    store: {
      name: 'benthanh',
      branch: 'Bến Thành Mart Gò Vấp',
      address: '100 Phan Văn Trị, P5, Q Gò Vấp, TPHCM',
      phone: '(028) 300 00000',
      taxCode: '0100000005',
      slogan: 'Hoạt động từ :7h30 - 22h30',
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: '',
      showLogo: true,
    },
    transaction: {
      invoiceNo: '01001',
      posNo: '0026-0188',
      cashier: '2200057(Nguyen Thu Tuyet)',
      paymentMethod: 'Thẻ tín dụng:VISA',
      memberCode: '8479********6748',
      customerName: 'Tạ Phương Thảo',
    },
    footerNote:
      'LƯU Ý: Phiếu này chỉ có giá trị xuất\nhóa đơn trong ngày\nXIN CAM ON QUY KHACH\nHẸN GẶP LẠI',
    tax: { vatRate: 8 },
  },
};
