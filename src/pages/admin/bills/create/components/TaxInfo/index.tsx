import { useIntl } from '@umijs/max';
import { Col, Descriptions, Flex, Form, Row, Segmented } from 'antd';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { formatMoney } from '@/components/Bills/helpers/calc';
import type { TBillTotals } from '@/components/Bills/types';
import InputNumber from '@/components/Input/InputNumber';
import Switch from '@/components/Input/Switch';
import { VAT_RATE_OPTIONS } from '@/const/bill';

const { Item } = Form;

export const TaxInfo: React.FC<{ control: any; totals: TBillTotals }> = ({ control, totals }) => {
  const { formatMessage } = useIntl();
  const { setValue } = useFormContext();
  const vatRate = useWatch({ control, name: 'tax.vatRate' });

  return (
    <Row gutter={12}>
      <Col span={24} lg={14} xl={24} xxl={14}>
        <Item label={formatMessage({ id: 'bills.form.tax.vatRate', defaultMessage: 'VAT (%)' })}>
          <Flex gap={8} wrap>
            <div className="w-24 shrink-0">
              <InputNumber control={control} name="tax.vatRate" min={0} max={100} step={1} />
            </div>
            <Segmented
              value={VAT_RATE_OPTIONS.includes(vatRate) ? vatRate : undefined}
              onChange={(value) => setValue('tax.vatRate', value, { shouldDirty: true })}
              options={VAT_RATE_OPTIONS.map((rate) => ({ value: rate, label: `${rate}%` }))}
            />
          </Flex>
        </Item>
      </Col>
      <Col span={24} lg={10} xl={24} xxl={10}>
        <Item
          label={formatMessage({
            id: 'bills.form.tax.priceIncludesVat',
            defaultMessage: 'Unit prices already include VAT',
          })}
        >
          <Switch control={control} name="tax.priceIncludesVat" />
        </Item>
      </Col>
      <Col span={24}>
        <Descriptions
          size="small"
          // the card is half-width from xl, so drop back to 2 columns there
          column={{ xs: 1, sm: 2, md: 3, xl: 2, xxl: 3 }}
          bordered
          items={[
            {
              key: 'gross',
              label: formatMessage({ id: 'bills.totals.gross', defaultMessage: 'Gross' }),
              children: formatMoney(totals.grossAmount),
            },
            {
              key: 'discount',
              label: formatMessage({ id: 'bills.totals.discount', defaultMessage: 'Discount' }),
              children: formatMoney(totals.totalDiscount),
            },
            {
              key: 'preTax',
              label: formatMessage({ id: 'bills.totals.preTax', defaultMessage: 'Before VAT' }),
              children: formatMoney(totals.preTaxAmount),
            },
            {
              key: 'vat',
              label: formatMessage({ id: 'bills.totals.vat', defaultMessage: 'VAT' }),
              children: formatMoney(totals.vatAmount),
            },
            {
              key: 'total',
              label: formatMessage({ id: 'bills.totals.total', defaultMessage: 'Total' }),
              children: <strong>{formatMoney(totals.grandTotal)} ₫</strong>,
            },
            {
              key: 'change',
              label: formatMessage({ id: 'bills.totals.change', defaultMessage: 'Change' }),
              children: formatMoney(totals.change),
            },
          ]}
        />
      </Col>
    </Row>
  );
};
