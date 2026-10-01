/**
 * Hypermarket POS receipt on condensed thermal mono: centred header, "Description / VAT"
 * item lines with "qty unit x price", double-height TỔNG CỘNG, VAT breakdown, footer grid + QR.
 */
import { Flex } from 'antd';
import React from 'react';

import { FONT_ID } from '@/components/Bills/fonts';
import { formatDateTime, formatMoney } from '@/components/Bills/helpers/calc';
import {
  CharLine,
  Cells,
  Logo,
  PrintImage,
  PrintScale,
  Text,
  Wordmark,
} from '@/components/Bills/shared/Print';
import type { TBillTemplate, TBillTemplateProps } from '@/components/Bills/types';
import { PAPER_WIDTH } from '@/const/bill';

const GoTops: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, 'DD/MM/YYYY HH:mm:ss');

  return (
    <Flex vertical>
      <Logo store={store} fallback={<Wordmark text={store.name} size={s * 2} variant="boxed" />} />
      <Flex vertical align="center">
        <Text align="center">{store.name}</Text>
        <Text align="center">{store.legalName ?? ''}</Text>
        <Text align="center">{store.address ?? ''}</Text>
        <Text align="center">{`${t('receipt.taxCode')}: ${store.taxCode ?? ''}`}</Text>
        <Text align="center">{`${t('receipt.phoneLong')}: ${store.phone ?? ''}`}</Text>
        <Text align="center">{`Hotline: ${store.hotline ?? ''}`}</Text>
        <Text align="center">{t('receipt.bill').toUpperCase()}</Text>
      </Flex>
      <Flex justify="space-between">
        <Text>{t('receipt.description')}</Text>
        <Text align="right">VAT</Text>
      </Flex>
      <CharLine />
      {totals.lines.map((line) => (
        <Flex vertical key={line.index}>
          <Flex justify="space-between">
            <Text flex={1}>{line.title.toUpperCase()}</Text>
            <Text align="right" nowrap>
              {String(tax.vatRate)}
            </Text>
          </Flex>
          <Cells
            cells={[
              { text: line.quantity, width: s * 2.5, align: 'right' },
              { text: `${line.unit || t('receipt.unitDefault')}  x`, width: s * 5, align: 'right' },
              { text: formatMoney(line.unitPrice), flex: 1, align: 'right' },
              { text: formatMoney(line.lineTotal), flex: 1, align: 'right' },
            ]}
          />
        </Flex>
      ))}
      <CharLine />
      <Flex justify="space-between" align="flex-start">
        <PrintScale fontSize={s}>
          <Text>{t('receipt.total').toUpperCase()}</Text>
        </PrintScale>
        <PrintScale fontSize={s} align="center">
          <Text>VND</Text>
        </PrintScale>
        <PrintScale fontSize={s} align="right">
          <Text>{formatMoney(totals.grandTotal)}</Text>
        </PrintScale>
      </Flex>
      <Text>{`${t('receipt.quantity')}:  ${totals.totalQuantity}`}</Text>
      <CharLine />
      <Cells
        cells={[
          { text: (transaction.paymentMethod || t('receipt.cash')).toUpperCase(), flex: 2 },
          { text: 'VND', flex: 1, align: 'center' },
          { text: formatMoney(totals.amountPaid), flex: 2, align: 'right' },
        ]}
      />
      <Text>{`${t('receipt.netValue')}:`}</Text>
      <Cells
        cells={[
          { text: `${tax.vatRate.toFixed(2)} ${t('receipt.percentOf')}`, flex: 2 },
          { text: formatMoney(totals.preTaxAmount), flex: 2, align: 'right' },
          { text: formatMoney(totals.vatAmount), flex: 2, align: 'right' },
        ]}
      />
      <CharLine />
      {transaction.memberCode ? (
        <Text>{`${t('receipt.memberNo')}:  ${transaction.memberCode}`}</Text>
      ) : null}
      {transaction.customerName ? (
        <Text>{`${t('receipt.customerShort')}  ${transaction.customerName}`}</Text>
      ) : null}
      {transaction.memberCode || transaction.customerName ? <CharLine /> : null}
      <Cells
        cells={[
          { text: t('receipt.date'), flex: 3 },
          { text: t('receipt.time'), flex: 2 },
          { text: 'POS', flex: 1, align: 'right' },
          { text: t('receipt.cashier'), flex: 2, align: 'right' },
          { text: t('receipt.ticket'), flex: 2, align: 'right' },
        ]}
      />
      <Cells
        cells={[
          { text: dateTime.slice(0, 10), flex: 3 },
          { text: dateTime.slice(11), flex: 2 },
          { text: transaction.posNo ?? '', flex: 1, align: 'right' },
          { text: transaction.cashier ?? '', flex: 2, align: 'right' },
          { text: transaction.invoiceNo ?? '', flex: 2, align: 'right' },
        ]}
      />
      {display.showQr !== false ? (
        <Flex vertical align="center" className="mt-2">
          <PrintImage src={codes.qrDataUrl} width={s * 6} />
          <Text align="center">{t('receipt.scanQrInvoice')}</Text>
        </Flex>
      ) : null}
      <Text align="center" className="mt-2">
        {data.footerNote ?? ''}
      </Text>
      {display.showBarcode !== false ? (
        <Flex vertical align="center" className="mt-1">
          <PrintImage src={codes.barcodeDataUrl} width={Math.round(s * 18)} height={s * 2} />
          <Text align="center">{codes.barcodeValue}</Text>
        </Flex>
      ) : null}
    </Flex>
  );
};

export const goTopsTemplate: TBillTemplate = {
  id: 'go-tops',
  name: 'GO! / Tops Market layout',
  description: 'Hypermarket POS: qty × price lines, double-height total, VAT table, QR footer',
  printerStyle: 'Condensed thermal mono (Epson Font B)',
  component: GoTops,
  fontId: FONT_ID.inconsolataCondensed,
  fontSize: 16,
  paperWidth: PAPER_WIDTH.mm58,
  catalogAccounts: ['go!', 'mini go', 'tops'],
  fields: [
    'store.legalName',
    'store.address',
    'store.phone',
    'store.hotline',
    'store.taxCode',
    'transaction.invoiceNo',
    'transaction.posNo',
    'transaction.cashier',
    'transaction.paymentMethod',
    'transaction.amountPaid',
    'transaction.customerName',
    'transaction.memberCode',
    'item.unit',
    'footerNote',
  ],
  defaults: {
    store: {
      name: 'PHỐ XANH!',
      legalName: 'CTy TNHH TMDV Siêu Thị Phố Xanh',
      address: 'Lô 7, KDC Hưng Thạnh, P. Hưng Phú, TP. Cần Thơ',
      phone: '0292 0000 111',
      hotline: '1900 0000',
      taxCode: '0100000002',
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: '',
      showLogo: true,
      logoAlign: 'center',
      logoWidth: 180,
    },
    transaction: {
      invoiceNo: '029010875',
      posNo: '029',
      cashier: '120126',
      paymentMethod: 'CASH',
      memberCode: '3101533****',
      customerName: 'Trần Minh Anh',
    },
    footerNote:
      'Cám ơn Quý Khách !\nHẹn gặp lại!\nPhiếu tính tiền chỉ có giá trị xuất\nhóa đơn trong vòng 120 phút',
  },
};
