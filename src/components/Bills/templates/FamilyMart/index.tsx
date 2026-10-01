/**
 * Convenience-store receipt in Times: logo, address, HÓA ĐƠN BÁN HÀNG, Số HĐ, serif table,
 * bold totals, thank-you box with QR on the right, bilingual invoice note, barcode.
 */
import { Flex } from 'antd';
import React from 'react';

import { FONT_ID } from '@/components/Bills/fonts';
import { formatDateTime, formatMoney } from '@/components/Bills/helpers/calc';
import { Cells, Logo, PrintImage, RuleLine, Text, Wordmark } from '@/components/Bills/shared/Print';
import type { TBillTemplate, TBillTemplateProps } from '@/components/Bills/types';
import { PAPER_WIDTH } from '@/const/bill';

const FamilyMart: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, 'DD/MM/YYYY HH:mm');

  return (
    <Flex vertical>
      <Logo
        store={store}
        fallback={<Wordmark text={store.name} size={s * 2} letterSpacing={0} />}
      />
      <Flex vertical align="center">
        <Text align="center">{store.address ?? ''}</Text>
        <Text align="center">{`${t('receipt.tel')}: ${store.phone ?? ''}`}</Text>
        <Text align="center" bold className="mt-1">
          {t('receipt.salesInvoice').toUpperCase()}
        </Text>
        <Text align="center" bold size={s * 1.1}>{`${t('receipt.invoiceNo')}: ${
          transaction.invoiceNo ?? ''
        }`}</Text>
      </Flex>
      <Cells
        className="mt-2"
        cells={[
          { text: t('receipt.productName'), flex: 4, bold: true },
          { text: t('receipt.qty'), flex: 1, align: 'center', bold: true },
          { text: t('receipt.unitPrice'), flex: 2, align: 'right', bold: true },
          { text: t('receipt.amount'), flex: 2, align: 'right', bold: true },
        ]}
      />
      <RuleLine dashed />
      {totals.lines.map((line) => (
        <Cells
          key={line.index}
          size={s * 0.85}
          cells={[
            { text: line.title, flex: 4 },
            { text: line.quantity, flex: 1, align: 'center' },
            { text: formatMoney(line.unitPrice), flex: 2, align: 'right' },
            { text: formatMoney(line.lineTotal), flex: 2, align: 'right' },
          ]}
        />
      ))}
      <RuleLine dashed />
      <Cells
        size={s * 1.1}
        cells={[
          { text: `${t('receipt.totalQtyTotal')}:`, flex: 4, bold: true },
          { text: totals.totalQuantity, flex: 1, align: 'center' },
          { text: formatMoney(totals.grandTotal), flex: 3, align: 'right' },
        ]}
      />
      <Cells
        size={s * 1.1}
        cells={[
          { text: `${t('receipt.customerPaid')}:`, flex: 4, bold: true },
          { text: transaction.paymentMethod ?? '', flex: 2, align: 'center' },
          { text: formatMoney(totals.amountPaid), flex: 2, align: 'right' },
        ]}
      />
      <Text size={s * 0.85}>
        {t('receipt.vatIncludedAmount', {
          rate: data.tax.vatRate,
          amount: formatMoney(totals.vatAmount),
        })}
      </Text>
      <RuleLine dashed />
      <Flex gap={8} align="center">
        <Flex vertical flex={1}>
          <Text bold size={s * 1.1}>
            {t('receipt.thanksShort')}
          </Text>
          <Text>{`${t('receipt.cashier')}: ${(transaction.cashier ?? '').toUpperCase()}`}</Text>
          <Text>
            {t('receipt.dateTimeLine', { date: dateTime.slice(0, 10), time: dateTime.slice(11) })}
          </Text>
          <Text>{`POS: ${transaction.posNo ?? ''}`}</Text>
        </Flex>
        {display.showQr !== false ? (
          <Flex className="shrink-0 border border-solid border-[#1c1c1c] p-1">
            <PrintImage src={codes.qrDataUrl} width={s * 5.5} />
          </Flex>
        ) : null}
      </Flex>
      <RuleLine dashed />
      <Text size={s * 0.75}>{data.footerNote ?? ''}</Text>
      {display.showBarcode !== false ? (
        <Flex justify="center" className="mt-2">
          <PrintImage src={codes.barcodeDataUrl} width={Math.round(s * 20)} height={s * 2.2} />
        </Flex>
      ) : null}
    </Flex>
  );
};

export const familyMartTemplate: TBillTemplate = {
  id: 'familymart',
  name: 'FamilyMart / GS25 layout',
  description: 'Convenience store in Times, thank-you box with QR, bilingual invoice note',
  printerStyle: 'Times New Roman',
  component: FamilyMart,
  fontId: FONT_ID.tinos,
  fontSize: 16,
  paperWidth: PAPER_WIDTH.mm58 + 16,
  catalogAccounts: ['familymart', 'gs25'],
  fields: [
    'store.address',
    'store.phone',
    'transaction.invoiceNo',
    'transaction.posNo',
    'transaction.cashier',
    'transaction.paymentMethod',
    'transaction.amountPaid',
    'footerNote',
  ],
  defaults: {
    store: {
      name: 'NgôiSao 24h',
      address: 'B20 Bạch Đằng, P Tân Sơn Hòa, TP HCM',
      phone: '028 0000 0000',
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: '',
      showLogo: true,
      logoAlign: 'center',
    },
    transaction: {
      invoiceNo: '2026010340UhzgwedRhi',
      posNo: 'POS01',
      cashier: 'Nguyễn Thị Diễm',
      paymentMethod: 'MOMO',
    },
    footerNote:
      'Xuất hóa đơn: Quét QR hoặc truy cập https://portal.example.com/xuat-hoa-don\nYêu cầu xuất hóa đơn VAT chỉ nhận trong 120 phút sau khi mua hàng\nInvoice issuing: Scan QR or visit https://portal.example.com\nRequest VAT invoice within 120 minutes of purchase',
  },
};
