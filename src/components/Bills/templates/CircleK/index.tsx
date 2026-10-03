/**
 * Convenience-store receipt on a condensed thermal mono font (Epson Font B look):
 * unaccented bilingual text, "ITEM UnitPrice Qty Amount" table, double-height total.
 */
import { Flex } from 'antd';
import React from 'react';

import { FONT_ID } from '@/components/Bills/fonts';
import {
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
  Spacer,
  Text,
  Wordmark,
} from '@/components/Bills/shared/Print';
import type { TBillTemplate, TBillTemplateProps } from '@/components/Bills/types';
import { PAPER_WIDTH } from '@/const/bill';

const CircleK: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display } = data;
  const s = font.size;
  // Prints "VIETNAMESE/ENGLISH" labels; English receipts drop the Vietnamese half.
  const bi = (key: Parameters<typeof t>[0], english: string) =>
    t.lang === 'vi' ? `${vn(t(key)).toUpperCase()}/${english}` : english;
  const date = new Date(transaction.dateTime || Date.now());
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  const month = date.toLocaleString('en-US', { month: 'short' });

  return (
    <Flex vertical>
      <Logo
        store={store}
        fallback={<Wordmark text={store.name} size={s * 2.2} variant="inverted" />}
      />
      <Text size={s * 0.8} bold>
        {vn(store.legalName).toUpperCase()}
      </Text>
      <Text size={s * 0.8}>{vn(store.address)}</Text>
      <Text size={s * 0.8}>{`${bi('receipt.taxCode', 'TAX CODE')}: ${store.taxCode ?? ''}`}</Text>
      <Spacer size={4} />
      <Text size={s * 1.1}>{bi('receipt.bill', 'RECEIPT')}</Text>
      <Text size={s * 0.8}>{`${bi('receipt.lookupCode', 'LOOKUP')}:${
        transaction.lookupCode || codes.barcodeValue.slice(0, 12)
      }`}</Text>
      <Text>{`Store:${store.branch ?? ''}`}</Text>
      <Text>{`Receipt:${transaction.invoiceNo ?? ''}`}</Text>
      <Text>{`Date:${weekday} ${String(date.getDate()).padStart(
        2,
        '0',
      )} ${month} ${date.getFullYear()} ${formatDateTime(
        transaction.dateTime,
        'DD/MM/YYYY HH:mm:ss',
      ).slice(11)}`}</Text>
      <Text>{`Terminal:${transaction.posNo ?? ''}`}</Text>
      <Text>{`CashierName:${vn(transaction.cashier)}`}</Text>
      <Cells
        cells={[
          { text: 'ITEM', width: s * 4 },
          { text: 'UnitPrice', width: s * 6 },
          { text: 'Qty', flex: 1 },
          { text: 'Amount', align: 'right', flex: 1 },
        ]}
      />
      <CharLine />
      {totals.lines.map((line) => (
        <Flex vertical key={line.index} className="mb-0.5">
          <Text align="center">{vn(line.title)}</Text>
          <Cells
            cells={[
              { text: formatMoney(line.unitPrice), width: s * 7, align: 'right' },
              { text: line.quantity, flex: 1, align: 'center' },
              { text: formatMoney(line.unitPrice * line.quantity), flex: 1, align: 'right' },
            ]}
          />
          {line.discount ? (
            <KeyValue label="  KM-Discount" value={`-${formatMoney(line.discount)}`} />
          ) : null}
        </Flex>
      ))}
      <CharLine />
      <Flex vertical style={{ paddingLeft: s * 2 }}>
        <KeyValue label="Total Item(s) Qty:" value={totals.totalQuantity} bold />
        <KeyValue label="Subtotal:" value={`${formatMoney(totals.grossAmount)} VND`} />
        <KeyValue
          label="Total Discount:"
          value={`${totals.totalDiscount ? '-' : ''}${formatMoney(totals.totalDiscount)} VND`}
        />
        <Flex justify="space-between">
          <PrintScale fontSize={s} y={2}>
            <Text>Total(+VAT):</Text>
          </PrintScale>
          <PrintScale fontSize={s} y={2} align="right">
            <Text>{`${formatMoney(totals.grandTotal)} VND`}</Text>
          </PrintScale>
        </Flex>
      </Flex>
      <CharLine />
      <Flex vertical style={{ paddingLeft: s * 2 }}>
        <KeyValue
          label={`${vn(transaction.paymentMethod) || 'Cash'}:`}
          value={`${formatMoney(totals.amountPaid)} VND`}
        />
        <KeyValue label="CHANGE DUE:" value={`${formatMoney(totals.change)} VND`} bold />
        <KeyValue
          label={`VAT ${data.tax.vatRate}% incl.:`}
          value={`${formatMoney(totals.vatAmount)} VND`}
        />
      </Flex>
      <Spacer size={4} />
      <Text size={s * 0.8}>{vn(data.footerNote)}</Text>
      <Spacer size={4} />
      <Text bold>{`${bi('receipt.lookupCode', 'TRACKING CODE')}: ${codes.barcodeValue.slice(
        4,
        16,
      )}`}</Text>
      <Text size={s * 0.8}>
        {vn(t('receipt.updateInvoiceInfo', { site: store.website ?? '' }))}
      </Text>
      <CharLine />
      {display.showBarcode !== false ? (
        <Flex justify="center" className="mt-1.5">
          <PrintImage
            src={codes.barcodeDataUrl}
            width={Math.round(s * 15)}
            height={Math.round(s * 2.2)}
          />
        </Flex>
      ) : null}
      {display.showQr ? (
        <Flex justify="center" className="mt-1.5">
          <PrintImage src={codes.qrDataUrl} width={s * 7} />
        </Flex>
      ) : null}
    </Flex>
  );
};

export const circleKTemplate: TBillTemplate = {
  id: 'circle-k',
  name: 'Circle K layout',
  description: 'Convenience store, unaccented bilingual text, double-height total',
  printerStyle: 'Condensed thermal mono (Epson Font B)',
  component: CircleK,
  fontId: FONT_ID.inconsolataCondensed,
  fontSize: 17,
  paperWidth: PAPER_WIDTH.mm58 + 32,
  catalogAccounts: ['circle k'],
  fields: [
    'store.legalName',
    'store.branch',
    'store.address',
    'store.taxCode',
    'store.website',
    'transaction.invoiceNo',
    'transaction.posNo',
    'transaction.cashier',
    'transaction.paymentMethod',
    'transaction.amountPaid',
    'transaction.lookupCode',
    'item.discount',
    'footerNote',
  ],
  defaults: {
    store: {
      name: 'SAO MAI 24/7',
      legalName: 'Chi nhánh Công ty TNHH Sao Mai Tiện Lợi',
      branch: 'SM0142',
      address: '12 Đường Số 7, Phường An Khánh, TP. Thủ Đức, TP.HCM',
      taxCode: '0100000001-142',
      website: 'www.saomai247.example.com/hoa-don',
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: '',
      showLogo: true,
      logoAlign: 'center',
      logoWidth: 200,
    },
    transaction: {
      invoiceNo: 'TE',
      posNo: '02',
      cashier: 'Nguyễn Thị B',
      paymentMethod: 'Cash',
    },
    footerNote:
      'Khong tra hang va hoan tien thua khi thanh toan bang voucher.\nNo refund and no change due when paying by voucher.',
  },
};
