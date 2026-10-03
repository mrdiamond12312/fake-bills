import { SettingOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Col, Flex, Form, Input, Popover, Row, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { checkBillId, makeInvalidBillId } from '@/components/Bills/helpers/bill-id';
import { getBillTemplate } from '@/components/Bills/registry';
import type { TBillCodes, TBillData, TBillField } from '@/components/Bills/types';
import InputText from '@/components/Input';
import AutoComplete from '@/components/Input/AutoComplete';
import DatePicker from '@/components/Input/DatePicker';
import InputNumber from '@/components/Input/InputNumber';
import { BILL_FORM_KEY, isFieldVisible } from '@/pages/admin/bills/create/helpers/billFormKeys';
import { useInvoiceMask } from '@/pages/admin/bills/create/hooks/useInvoiceMask';

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
    label: 'Lookup code in the QR link (empty = random)',
  },
];

export const TransactionInfo: React.FC<{
  control: any;
  fields: TBillField[];
  bill: TBillData;
  codes: TBillCodes;
}> = ({ control, fields, bill, codes }) => {
  const { formatMessage } = useIntl();
  const t = (id: string, defaultMessage: string) => formatMessage({ id, defaultMessage });
  const templateId = useWatch({ control, name: BILL_FORM_KEY.templateId });
  const { mask, handleMaskChange, handleGenerate } = useInvoiceMask(templateId);

  // Invoice no. gets a generate button + a per-template mask; the field itself stays editable.
  const invoiceInput = (
    <Flex gap={8}>
      <div className="min-w-0 flex-1">
        <InputText control={control} name="transaction.invoiceNo" allowClear />
      </div>
      <Tooltip
        title={
          mask
            ? `${t('bills.form.invoiceMask.generate', 'Generate from mask')}: ${mask}`
            : t('bills.form.invoiceMask.generateRandom', 'Generate a random ID')
        }
      >
        <Button icon={<ThunderboltOutlined />} onClick={handleGenerate} />
      </Tooltip>
      <Popover
        trigger="click"
        title={t('bills.form.invoiceMask.title', 'ID mask for this template')}
        content={
          <Flex vertical gap={6} className="w-72">
            <Input
              value={mask}
              allowClear
              placeholder="e.g. INV-####-AA**"
              onChange={(event) => handleMaskChange(event.target.value)}
            />
            <Typography.Text type="secondary" className="text-body-3-regular">
              {t(
                'bills.form.invoiceMask.hint',
                '# digit · A uppercase · a lowercase · * letter or digit · \\x literal x. Empty → random 12 characters.',
              )}
            </Typography.Text>
          </Flex>
        }
      >
        <Tooltip title={t('bills.form.invoiceMask.title', 'ID mask for this template')}>
          <Button icon={<SettingOutlined />} type={mask ? 'primary' : 'default'} ghost={!!mask} />
        </Tooltip>
      </Popover>
    </Flex>
  );

  // Bill ID = what the OCR reads as bill_id for this store; checked with the backend's rule
  const billIdRule = getBillTemplate(templateId).billId;
  const billIdInput = (() => {
    if (!billIdRule || !isFieldVisible(fields, 'transaction.billId')) return null;
    const { retailer, source } = billIdRule;
    const dateTime = bill.transaction.dateTime;
    const validId = codes.generatedBillId;
    const invalidId = makeInvalidBillId(retailer, validId);
    const invalidCheck = checkBillId(retailer, invalidId, dateTime);
    const check = checkBillId(retailer, codes.billId, dateTime);
    const suggestion = (id: string, ok: boolean, note: string) => ({
      value: id,
      // reason under the ID so a long reason never truncates the code itself
      label: (
        <Flex vertical align="flex-start" gap={2}>
          <Typography.Text>{id}</Typography.Text>
          <Tag color={ok ? 'success' : 'error'} className="m-0 whitespace-normal">
            {note}
          </Tag>
        </Flex>
      ),
    });

    return (
      <Col span={24}>
        <Item
          label={formatMessage(
            { id: 'bills.form.transaction.billId', defaultMessage: 'Bill ID ({source})' },
            {
              source:
                source === 'cqt'
                  ? 'Mã CQT'
                  : formatMessage({ id: 'bills.form.billId.barcode', defaultMessage: 'barcode' }),
            },
          )}
          extra={
            <Typography.Text type={check.ok ? 'success' : 'danger'}>
              {check.ok
                ? formatMessage(
                    {
                      id: 'bills.form.billId.passes',
                      defaultMessage: '✓ {id} passes the OCR bill ID check',
                    },
                    { id: codes.billId },
                  )
                : formatMessage(
                    {
                      id: 'bills.form.billId.fails',
                      defaultMessage: '✗ {id} will be rejected: {reason}',
                    },
                    { id: codes.billId, reason: check.reason },
                  )}
            </Typography.Text>
          }
        >
          <AutoComplete
            control={control}
            name="transaction.billId"
            placeholder={`${validId} (${formatMessage({
              id: 'bills.form.billId.preset',
              defaultMessage: 'preset',
            })})`}
            options={[
              suggestion(
                validId,
                true,
                formatMessage({ id: 'bills.form.billId.suggestValid', defaultMessage: '✓ passes' }),
              ),
              suggestion(invalidId, false, `✗ ${invalidCheck.reason ?? ''}`),
            ]}
          />
        </Item>
      </Col>
    );
  })();

  return (
    <Row gutter={12}>
      {billIdInput}
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
        <Col
          key={item.field}
          span={24}
          // the invoice row carries two buttons, so it gets the full width
          md={item.field === 'transaction.invoiceNo' ? 24 : 12}
        >
          <Item label={formatMessage({ id: item.id, defaultMessage: item.label })}>
            {item.field === 'transaction.invoiceNo' ? (
              invoiceInput
            ) : (
              <InputText control={control} name={item.field} />
            )}
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
