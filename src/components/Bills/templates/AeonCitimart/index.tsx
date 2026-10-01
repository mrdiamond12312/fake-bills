/**
 * Supermarket receipt on a bitmap mono font (Epson Font A look), unaccented:
 * "HOA DON BAN LE", barcode under each item, pre-tax/VAT breakdown, member points.
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

const AeonCitimart: React.FC<TBillTemplateProps> = ({ data, totals, codes, font, t }) => {
  const { store, transaction, display, tax } = data;
  const s = font.size;
  const dateTime = formatDateTime(transaction.dateTime, 'DD/MM/YYYY HH:mm');
  // this printer drops accents
  const T = (key: Parameters<typeof t>[0], values?: Record<string, string | number>) =>
    vn(t(key, values));

  return (
    <Flex vertical>
      <Logo
        store={store}
        fallback={<Wordmark text={store.name} size={s * 2} sub={vn(store.slogan)} />}
      />
      <Flex vertical align="center">
        <Text align="center">{vn(store.address)}</Text>
        <Text align="center">{`${T('receipt.tel')}:${store.phone ?? ''}`}</Text>
        <Text align="center">{`${T('receipt.taxCode')}: ${store.taxCode ?? ''}`}</Text>
        <Text align="center">{`${T('receipt.website')}: ${store.website ?? ''}`}</Text>
        <Text align="center" size={s * 1.5} bold>
          {T('receipt.retailInvoice').toUpperCase()}
        </Text>
      </Flex>
      <Spacer size={6} />
      <Flex justify="space-between">
        <Text>{`${T('receipt.invoiceNoLong')}:${transaction.invoiceNo ?? ''}`}</Text>
        <Text align="right" nowrap>{`${T('receipt.date')}: ${dateTime.slice(0, 10)}`}</Text>
      </Flex>
      <Flex justify="space-between">
        <Text>{`${T('receipt.counter')}:   ${transaction.posNo ?? ''}`}</Text>
        <Text align="right" nowrap>{`${T('receipt.time')}: ${dateTime.slice(11)}`}</Text>
      </Flex>
      <Text>{`${T('receipt.cashier')}:  ${vn(transaction.cashier)}`}</Text>
      <Text>{`${T('receipt.customer')}: ${vn(transaction.customerName)}`}</Text>
      <Cells
        cells={[
          { text: T('receipt.product').toUpperCase(), flex: 3 },
          { text: T('receipt.quantity').toUpperCase(), flex: 2, align: 'right' },
          { text: T('receipt.unitPrice').toUpperCase(), flex: 2, align: 'right' },
          { text: T('receipt.amount').toUpperCase(), flex: 2, align: 'right' },
        ]}
      />
      <CharLine />
      {totals.lines.map((line) => (
        <Flex vertical key={line.index}>
          <Text>{vn(line.title).toUpperCase()}</Text>
          <Cells
            cells={[
              { text: ` ${line.barcode ?? ''}`, flex: 3 },
              { text: line.quantity, flex: 2, align: 'right' },
              { text: formatMoney(line.unitPrice), flex: 2, align: 'right' },
              { text: formatMoney(line.lineTotal), flex: 2, align: 'right' },
            ]}
          />
        </Flex>
      ))}
      <CharLine />
      <KeyValue
        label={`${T('receipt.totalDiscount')}:`}
        value={formatMoney(totals.totalDiscount)}
      />
      <KeyValue label={`${tax.vatRate}      (%VAT)`} value={formatMoney(totals.vatAmount)} />
      <KeyValue label={`${T('receipt.tax')}:`} value={formatMoney(totals.vatAmount)} />
      <KeyValue
        label={`${T('receipt.totalBeforeTax')}:`}
        value={formatMoney(totals.preTaxAmount)}
      />
      <KeyValue
        label={`${T('receipt.totalWithTax').toUpperCase()}:`}
        value={formatMoney(totals.grandTotal)}
        bold
      />
      <Spacer size={10} />
      <KeyValue
        label={vn(transaction.paymentMethod) || T('receipt.cash')}
        value={formatMoney(totals.amountPaid)}
      />
      <Spacer size={10} />
      <KeyValue
        label={T('receipt.changeCash', {
          method: vn(transaction.paymentMethod) || T('receipt.cash'),
        })}
        value={formatMoney(totals.change)}
      />
      <CharLine />
      <Text>{`${T('receipt.memberCardLong')}: ${transaction.memberCode ?? ''}`}</Text>
      <Text>{`${T('receipt.pointsUsed')}:`}</Text>
      <Spacer size={10} />
      <Text>{`${T('receipt.currentPoints')}:`}</Text>
      <Text>{T('receipt.pointsNote')}</Text>
      <CharLine />
      <Text align="center">{vn(data.footerNote)}</Text>
      {display.showQr ? (
        <Flex justify="center" className="mt-2">
          <PrintImage src={codes.qrDataUrl} width={s * 6} />
        </Flex>
      ) : null}
      {display.showBarcode !== false ? (
        <Flex justify="center" className="mt-6">
          <PrintImage src={codes.barcodeDataUrl} width={Math.round(s * 16)} height={s * 2.5} />
        </Flex>
      ) : null}
    </Flex>
  );
};

export const aeonCitimartTemplate: TBillTemplate = {
  id: 'aeon-citimart',
  name: 'Aeon Citimart / MM Mega Market layout',
  description: 'Supermarket retail invoice, unaccented bitmap print, barcode per item',
  printerStyle: 'Bitmap mono (Epson Font A)',
  component: AeonCitimart,
  fontId: FONT_ID.vt323,
  fontSize: 18,
  paperWidth: PAPER_WIDTH.mm58 + 16,
  catalogAccounts: ['citimart', 'mega market', 'mm mega'],
  fields: [
    'store.address',
    'store.phone',
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
    'item.barcode',
    'item.discount',
    'footerNote',
  ],
  defaults: {
    store: {
      name: 'HOA BINH Supermarket',
      slogan: 'Noi mua sam cua moi nha',
      address: '45 Nguyễn Thượng Hiền, Quận 3, TP.HCM, Việt Nam',
      phone: '(028)39000000',
      taxCode: '0100000003',
      website: 'www.hoabinhmart.example.com',
      /** Default logo image src for this template; empty → text wordmark */
      logoUrl: '',
      showLogo: true,
      logoAlign: 'center',
    },
    transaction: {
      invoiceNo: '1111110269833',
      posNo: '111110',
      cashier: '674624_NHU',
      paymentMethod: 'Tien mat',
      amountPaid: 100000,
    },
    footerNote:
      'XIN CHAN THANH CAM ON (THANK YOU)\nHoa don se duoc xuat trong ngay\nTax invoice will be issued within same day',
    tax: { vatRate: 8 },
  },
};
