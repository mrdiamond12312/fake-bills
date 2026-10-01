import { DeleteOutlined, NumberOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Col, Empty, Flex, Row, Tooltip, Typography } from 'antd';
import React, { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { formatMoney } from '@/components/Bills/helpers/calc';
import { randomEan13 } from '@/components/Bills/helpers/random';
import type { TBillTemplate } from '@/components/Bills/types';
import InputText from '@/components/Input';
import AutoComplete from '@/components/Input/AutoComplete';
import InputNumber from '@/components/Input/InputNumber';
import ValidateError from '@/components/Input/ValidateError';
import {
  BILL_FORM_KEY,
  BILL_ITEM_KEY,
  EMPTY_BILL_ITEM,
  isFieldVisible,
  itemFieldName,
} from '@/pages/admin/bills/create/helpers/billFormKeys';
import { useCatalogOptions } from '@/pages/admin/bills/create/hooks/useCatalogOptions';

type TProductRow = {
  control: any;
  index: number;
  template: TBillTemplate;
  onRemove: () => void;
  catalog: ReturnType<typeof useCatalogOptions>;
};

const ProductRow: React.FC<TProductRow> = ({ control, index, template, onRemove, catalog }) => {
  const { fields } = template;
  const { formatMessage } = useIntl();
  const { setValue } = useFormContext();
  const [titleTerm, setTitleTerm] = useState('');
  const [barcodeTerm, setBarcodeTerm] = useState('');
  const item = useWatch({ control, name: `${BILL_FORM_KEY.items}.${index}` }) ?? {};
  const lineTotal =
    (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0) - (Number(item.discount) || 0);

  // Picking from the catalog fills the linked fields; typing freely leaves them alone.
  const fillFrom = (product?: API.TCatalogProduct) => {
    if (!product) return;
    const options = { shouldDirty: true, shouldValidate: true };
    setValue(itemFieldName(index, BILL_ITEM_KEY.title), product.title, options);
    setValue(itemFieldName(index, BILL_ITEM_KEY.barcode), catalog.codeFor(product), options);
    if (product.price)
      setValue(itemFieldName(index, BILL_ITEM_KEY.unitPrice), product.price, options);
    if (product.unit) setValue(itemFieldName(index, BILL_ITEM_KEY.unit), product.unit, options);
  };

  const label = (id: string, defaultMessage: string) => (
    <span className="text-body-3-medium text-neutral-7">
      {formatMessage({ id, defaultMessage })}
    </span>
  );

  return (
    <div className="rounded-lg border border-solid border-neutral-3 bg-neutral-2 p-3">
      <Row gutter={[8, 4]} align="bottom">
        <Col span={24} lg={14}>
          {label('bills.form.item.title', 'Product title')}
          <AutoComplete
            control={control}
            name={itemFieldName(index, BILL_ITEM_KEY.title)}
            options={catalog.searchByTitle(titleTerm)}
            onSearch={setTitleTerm}
            onFocus={() => setTitleTerm('')}
            onPick={(_, option) => fillFrom(option?.product)}
            popupMatchSelectWidth={420}
            placeholder={formatMessage({
              id: 'bills.form.item.title.placeholder',
              defaultMessage: 'Search catalog or type anything',
            })}
          />
        </Col>
        <Col span={24} lg={10}>
          {label('bills.form.item.barcode', 'Barcode / product ID')}
          <Flex gap={4}>
            <div className="flex-1 min-w-0">
              <AutoComplete
                control={control}
                name={itemFieldName(index, BILL_ITEM_KEY.barcode)}
                options={catalog.searchByCode(barcodeTerm)}
                onSearch={setBarcodeTerm}
                onFocus={() => setBarcodeTerm('')}
                onPick={(_, option) => fillFrom(option?.product)}
                popupMatchSelectWidth={360}
              />
            </div>
            <Tooltip
              title={formatMessage({
                id: 'bills.form.item.barcode.random',
                defaultMessage: 'Random EAN-13',
              })}
            >
              <Button
                icon={<NumberOutlined />}
                onClick={() =>
                  setValue(itemFieldName(index, BILL_ITEM_KEY.barcode), randomEan13(), {
                    shouldDirty: true,
                  })
                }
              />
            </Tooltip>
          </Flex>
        </Col>
        <Col span={12} md={6}>
          {label('bills.form.item.unitPrice', 'Unit price')}
          <InputNumber
            control={control}
            name={itemFieldName(index, BILL_ITEM_KEY.unitPrice)}
            min={0}
            step={500}
          />
        </Col>
        <Col span={12} md={4}>
          {label('bills.form.item.quantity', 'Qty')}
          <InputNumber
            control={control}
            name={itemFieldName(index, BILL_ITEM_KEY.quantity)}
            min={0}
            step={1}
          />
        </Col>
        {isFieldVisible(fields, 'item.unit') ? (
          <Col span={12} md={4}>
            {label('bills.form.item.unit', 'Unit')}
            <InputText control={control} name={itemFieldName(index, BILL_ITEM_KEY.unit)} />
          </Col>
        ) : null}
        {isFieldVisible(fields, 'item.discount') ? (
          <Col span={12} md={5}>
            {label('bills.form.item.discount', 'Discount')}
            <InputNumber
              control={control}
              name={itemFieldName(index, BILL_ITEM_KEY.discount)}
              min={0}
              step={1000}
            />
          </Col>
        ) : null}
        <Col flex="auto">
          <Flex justify="flex-end" align="center" gap={8} className="h-8">
            <Typography.Text strong>{formatMoney(lineTotal)} ₫</Typography.Text>
            <Button danger type="text" icon={<DeleteOutlined />} onClick={onRemove} />
          </Flex>
        </Col>
      </Row>
    </div>
  );
};

export const ProductList: React.FC<{ control: any; template: TBillTemplate }> = ({
  control,
  template,
}) => {
  const { formatMessage } = useIntl();
  const { formState } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: BILL_FORM_KEY.items });
  const catalog = useCatalogOptions(template);
  const itemsError = (formState.errors?.items as any)?.root ?? (formState.errors?.items as any);

  return (
    <Flex vertical gap={8}>
      {fields.length ? (
        fields.map((field, index) => (
          <ProductRow
            key={field.id}
            control={control}
            index={index}
            template={template}
            onRemove={() => remove(index)}
            catalog={catalog}
          />
        ))
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={formatMessage({
            id: 'bills.form.items.empty',
            defaultMessage: 'No products yet',
          })}
        />
      )}
      {itemsError?.message ? <ValidateError error={itemsError} /> : null}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => append({ ...EMPTY_BILL_ITEM })}
        block
      >
        {formatMessage({ id: 'bills.form.items.add', defaultMessage: 'Add product' })}
      </Button>
      <Typography.Text type="secondary" className="text-body-3-regular">
        {formatMessage(
          {
            id: 'bills.form.items.catalogCount',
            defaultMessage: '{count} products in catalog · {storeCount} for this store',
          },
          { count: catalog.productCount, storeCount: catalog.storeProductCount },
        )}
      </Typography.Text>
    </Flex>
  );
};
