/**
 * Fresh-market receipt in a Segoe-like sans: name left / address right header, PHIẾU MUA HÀNG,
 * member block, lines with "(barcode)" suffix, discount summary, payment section,
 * QR with invoice note, hotline and return policy.
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
  Spacer,
  Text,
  Wordmark,
} from '@/components/Bills/shared/Print';
import type { TBillTemplate, TBillTemplateProps } from '@/components/Bills/types';
import { PAPER_WIDTH } from '@/const/bill';

const FarmersMarket: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, 'DD/MM/YYYY HH:mm:ss');

  return (
    <Flex vertical>
      <Flex justify="space-between" align="flex-start" gap={12}>
        <Logo
          inline
          store={{ ...store, logoWidth: store.logoWidth ?? 110 }}
          defaultAlign="left"
          fallback={<Wordmark text={store.name} size={s * 1.2} letterSpacing={0} />}
        />
        <Text align="right" size={s * 0.8} flex={1}>
          {store.address ?? ''}
        </Text>
      </Flex>
      <Text align="center" bold size={s * 1.15} className="mt-2">
        {t('receipt.purchaseSlip').toUpperCase()}
      </Text>
      <Flex justify="space-between" className="mt-1">
        <Text size={s * 0.85}>{`${t('receipt.saleDate')}: ${dateTime}`}</Text>
        <Text size={s * 0.85} align="right">{`${t('receipt.printDate')}: ${dateTime}`}</Text>
      </Flex>
      <Text size={s * 0.85}>{`${t('receipt.memberName')}: ${
        transaction.customerName || t('receipt.walkIn')
      }`}</Text>
      <Text size={s * 0.85}>{`${t('receipt.memberCard')}: ${transaction.memberCode ?? ''}`}</Text>
      <Text size={s * 0.85}>{`${t('receipt.cashier')}: ${transaction.cashier ?? ''}`}</Text>
      <Cells
        className="mt-2"
        cells={[
          { text: t('receipt.price'), flex: 2, align: 'center', bold: true },
          { text: t('receipt.quantity'), flex: 2, align: 'center', bold: true },
          { text: t('receipt.amount'), flex: 2, align: 'right', bold: true },
        ]}
      />
      <RuleLine dashed />
      {totals.lines.map((line) => (
        <Flex vertical key={line.index} className="mb-1">
          <Text size={s * 0.85}>{`${line.title}${line.barcode ? ` (${line.barcode})` : ''}`}</Text>
          <Cells
            cells={[
              { text: formatMoney(line.unitPrice), flex: 2, align: 'center' },
              { text: line.quantity, flex: 2, align: 'center' },
              { text: formatMoney(line.unitPrice * line.quantity), flex: 2, align: 'right' },
            ]}
          />
          {line.discount ? <Text align="right">{`- ${formatMoney(line.discount)}`}</Text> : null}
        </Flex>
      ))}
      <RuleLine dashed />
      <KeyValue
        label={`${t('receipt.totalBeforeDiscount')}:`}
        value={formatMoney(totals.grossAmount)}
      />
      <KeyValue
        label={`${t('receipt.totalDiscountShort')}:`}
        value={`${totals.totalDiscount ? '- ' : ''}${formatMoney(totals.totalDiscount)}`}
      />
      <KeyValue label={`${t('receipt.amountDue')}:`} value={formatMoney(totals.grandTotal)} bold />
      <Text size={s * 0.8}>
        {t('receipt.vatIncludedAmount', {
          rate: data.tax.vatRate,
          amount: formatMoney(totals.vatAmount),
        })}
      </Text>
      <Spacer size={10} />
      <Text bold size={s * 1.1}>
        {t('receipt.paymentMethod')}
      </Text>
      <KeyValue
        label={transaction.paymentMethod || t('receipt.cash')}
        value={formatMoney(totals.amountPaid)}
      />
      <Spacer size={8} />
      <KeyValue
        label={`${t('receipt.amountReceived')}:`}
        value={formatMoney(totals.amountPaid)}
        bold
      />
      <KeyValue label={`${t('receipt.changeShort')}:`} value={formatMoney(totals.change)} bold />
      <Spacer size={10} />
      <Flex gap={8} align="center">
        <Text size={s * 0.8} flex={1}>
          {t('receipt.scanQrInvoiceSite', { site: store.website ?? '' })}
        </Text>
        {display.showQr !== false ? <PrintImage src={codes.qrDataUrl} width={s * 6} /> : null}
      </Flex>
      <RuleLine dashed />
      <Text align="center" size={s * 0.85}>{`${t('receipt.feedbackHotline')}: ${
        store.hotline ?? ''
      }`}</Text>
      <Spacer size={6} />
      <Text size={s * 0.8}>{data.footerNote ?? ''}</Text>
      {display.showBarcode !== false ? (
        <Flex vertical align="center" className="mt-2">
          <PrintImage src={codes.barcodeDataUrl} width={Math.round(s * 13)} height={s * 2.2} />
          <Text size={s * 0.7} align="center">
            {codes.barcodeValue}
          </Text>
        </Flex>
      ) : null}
    </Flex>
  );
};

export const farmersMarketTemplate: TBillTemplate = {
  id: 'farmers-market',
  name: 'Farmers Market layout',
  description: 'Fresh market, member block, per-line discounts, payment section, policy text',
  printerStyle: 'Segoe UI-like sans',
  component: FarmersMarket,
  fontId: FONT_ID.openSans,
  fontSize: 15,
  paperWidth: PAPER_WIDTH.mm58 + 32,
  catalogAccounts: ['farmers'],
  fields: [
    'store.address',
    'store.hotline',
    'store.website',
    'transaction.cashier',
    'transaction.paymentMethod',
    'transaction.amountPaid',
    'transaction.customerName',
    'transaction.memberCode',
    'item.barcode',
    'item.discount',
    'footerNote',
  ],
  defaults: {
    store: {
      name: 'Nông Trại Fresh',
      address: '513 Sư Vạn Hạnh, Phường Hòa Hưng, TP.HCM',
      hotline: '1800 0000',
      website: 'einvoice.nongtrai.example.com',
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: '',
      showLogo: true,
    },
    transaction: {
      cashier: 'E6952 - Lý Khánh Phương',
      paymentMethod: 'Cà thẻ',
      memberCode: 'C9999999',
    },
    footerNote:
      'Chính sách bảo hành/ đổi trả sản phẩm:\n- Hàng hóa bị rách bao bì/ hư hỏng trong quá trình giao\n- Hàng hóa hết hạn sử dụng/ lỗi do nhà sản xuất\nVui lòng giữ phiếu tính tiền để đổi trả sản phẩm trong 24h.\nCảm ơn đã lựa chọn mua sắm tại Nông Trại Fresh!',
  },
};
