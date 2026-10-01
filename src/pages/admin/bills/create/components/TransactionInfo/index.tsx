import { useIntl } from '@umijs/max';
import { Col, Form, Row } from 'antd';
import React from 'react';

import type { TBillField } from '@/components/Bills/types';
import InputText from '@/components/Input';
import DatePicker from '@/components/Input/DatePicker';
import InputNumber from '@/components/Input/InputNumber';
import { isFieldVisible } from '@/pages/admin/bills/create/helpers/billFormKeys';

const { Item } = Form;

const TEXT_FIELDS: { field: TBillField; id: string; label: string }[] = [
  {
    field: 'transaction.invoiceNo',
    id: 'bills.form.transaction.invoiceNo',
    label: 'Invoice / receipt no.',
  },
  { field: 'transaction.posNo', id: 'bills.form.transaction.posNo', label: 'POS / counter' },
  { field: 'transaction.cashier', id: 'bills.form.transaction.cashier', label: 'Cashier' },
  {
    field: 'transaction.paymentMethod',
    id: 'bills.form.transaction.paymentMethod',
    label: 'Payment method',
  },
  {
    field: 'transaction.customerName',
    id: 'bills.form.transaction.customerName',
    label: 'Customer name',
  },
  {
    field: 'transaction.memberCode',
    id: 'bills.form.transaction.memberCode',
    label: 'Member card no.',
  },
  {
    field: 'transaction.lookupCode',
    id: 'bills.form.transaction.lookupCode',
    label: 'Lookup code (empty = random)',
  },
];

export const TransactionInfo: React.FC<{ control: any; fields: TBillField[] }> = ({
  control,
  fields,
}) => {
  const { formatMessage } = useIntl();

  return (
    <Row gutter={12}>
      <Col span={24} md={12}>
        <Item
          label={formatMessage({
            id: 'bills.form.transaction.dateTime',
            defaultMessage: 'Date & time',
          })}
        >
          <DatePicker
            control={control}
            name="transaction.dateTime"
            showTime
            format="DD/MM/YYYY HH:mm:ss"
          />
        </Item>
      </Col>
      {TEXT_FIELDS.filter(({ field }) => isFieldVisible(fields, field)).map((item) => (
        <Col key={item.field} span={24} md={12}>
          <Item label={formatMessage({ id: item.id, defaultMessage: item.label })}>
            <InputText control={control} name={item.field} />
          </Item>
        </Col>
      ))}
      {isFieldVisible(fields, 'transaction.amountPaid') ? (
        <Col span={24} md={12}>
          <Item
            label={formatMessage({
              id: 'bills.form.transaction.amountPaid',
              defaultMessage: 'Customer paid (empty = exact)',
            })}
          >
            <InputNumber control={control} name="transaction.amountPaid" min={0} step={10000} />
          </Item>
        </Col>
      ) : null}
    </Row>
  );
};
