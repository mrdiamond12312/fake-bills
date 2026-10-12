/**
 * WinMart 2026 slip in Arial: logo + PHIẾU TÍNH TIỀN with the QR top-right, "date|MSCH|PTT" and
 * "NV|Mã CQT" lines, Mặt hàng header with KM / T.Tiền columns, name over "qty x price  KM  total"
 * item rows, TỔNG TIỀN HÀNG + Tiền cần thanh toán, e-invoice note with the auth code, barcode.
 */
import { Flex } from 'antd';
import React from 'react';

import { FONT_ID } from '@/components/Bills/fonts';
import { formatDateTime, formatMoney } from '@/components/Bills/helpers/calc';
import { createRandom } from '@/components/Bills/helpers/random';
import {
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

const WinMart2026: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display } = data;
  const s = font.size;
  // 4-char "Mã xác thực HĐ"; seeded so the same bill keeps the same code
  const authCode =
    transaction.lookupCode?.trim().slice(0, 4).toUpperCase() ||
    createRandom(`${display.seed ?? ''}:auth`).alphanumeric(4);
  const money = { flex: 2, align: 'right' as const };

  return (
    <Flex vertical>
      <Flex align="flex-start" gap={8}>
        <Flex vertical flex={1}>
          <Logo
            store={store}
            defaultAlign="left"
            fallback={<Wordmark text={store.name} size={s * 2.2} letterSpacing={0} />}
          />
          <Text size={s * 1.35} bold>
            {t('receipt.bill').toUpperCase()}
          </Text>
        </Flex>
        {display.showQr !== false ? (
          <Flex className="shrink-0">
            <PrintImage src={codes.qrDataUrl} width={s * 4.5} />
          </Flex>
        ) : null}
      </Flex>

      <Text className="mt-1">{`${formatDateTime(transaction.dateTime, 'DD/MM/YYYY HH:mm')}|MSCH:${
        store.branch ?? ''
      }|PTT:${transaction.invoiceNo ?? ''}`}</Text>
      <Text>{`NV:${transaction.cashier ?? ''}|${t('receipt.taxAuthorityCode')}: ${
        codes.taxAuthorityCode
      }`}</Text>

      <Text className="mt-1">{t('receipt.goods')}</Text>
      <Cells
        cells={[
          { text: '', flex: 3 },
          { text: t('receipt.promo'), ...money },
          { text: t('receipt.amountShort'), ...money },
        ]}
      />
      {totals.lines.map((line) => (
        <Flex vertical key={line.index}>
          <Text>{line.title}</Text>
          <Cells
            cells={[
              { text: line.quantity, width: s * 1.6 },
              { text: 'x', width: s * 1.2 },
              { text: formatMoney(line.unitPrice), flex: 2 },
              { text: line.discount ? `-${formatMoney(line.discount)}` : '', ...money },
              { text: formatMoney(line.lineTotal), ...money },
            ]}
          />
        </Flex>
      ))}

      <Spacer size={4} />
      <Cells
        cells={[
          { text: t('receipt.totalGoods').toUpperCase(), flex: 3, bold: true },
          {
            text: totals.totalDiscount ? `-${formatMoney(totals.totalDiscount)}` : '',
            ...money,
          },
          { text: formatMoney(totals.grandTotal), ...money, bold: true },
        ]}
      />
      <KeyValue label={t('receipt.amountToPay')} value={formatMoney(totals.grandTotal)} bold />
      <KeyValue
        label={transaction.paymentMethod || t('receipt.cash')}
        value={formatMoney(totals.amountPaid)}
      />
      {totals.change ? (
        <KeyValue label={t('receipt.change')} value={formatMoney(totals.change)} />
      ) : null}

      <Spacer size={6} />
      <Text>{`${data.footerNote ?? ''} (${t('receipt.invoiceAuthCode')}: ${authCode}). ${t(
        'receipt.wrongInfoDisclaimer',
      )} Hotline: ${store.hotline ?? ''}`}</Text>
      {display.showBarcode !== false ? (
        <Flex justify="center" className="mt-2">
          <PrintImage src={codes.barcodeDataUrl} width={Math.round(s * 15)} height={s * 2.6} />
        </Flex>
      ) : null}
    </Flex>
  );
};

export const winMart2026Template: TBillTemplate = {
  id: 'winmart-2026',
  name: 'WinMart 2026 layout',
  description: 'Minimart slip, QR beside the title, KM / T.Tiền columns, auth code in the note',
  printerStyle: 'Arial / Helvetica',
  component: WinMart2026,
  fontId: FONT_ID.arimo,
  fontSize: 15,
  paperWidth: PAPER_WIDTH.mm58 + 16,
  catalogAccounts: ['winmart'],
  billId: { source: 'cqt', retailer: 'winmart' },
  fields: [
    'store.branch',
    'store.hotline',
    'transaction.invoiceNo',
    'transaction.billId',
    'transaction.cashier',
    'transaction.paymentMethod',
    'transaction.amountPaid',
    'transaction.lookupCode',
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
      logoAlign: 'left',
    },
    transaction: {
      invoiceNo: '100126010100001',
      cashier: '00000001',
      paymentMethod: 'VietQR',
    },
    footerNote: 'Truy cập hoadon.example.com trong 60 phút để xuất hóa đơn',
  },
};
