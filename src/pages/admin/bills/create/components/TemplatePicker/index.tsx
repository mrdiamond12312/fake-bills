import { ReloadOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Flex, Form, Select, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { getFontPreset } from '@/components/Bills/fonts';
import { BILL_TEMPLATES } from '@/components/Bills/registry';
import { BILL_FORM_KEY } from '@/pages/admin/bills/create/helpers/billFormKeys';

type TTemplatePicker = {
  control: any;
  onChange: (templateId: string) => void;
  onResetStore: () => void;
};

export const TemplatePicker: React.FC<TTemplatePicker> = ({ control, onChange, onResetStore }) => {
  const { formatMessage } = useIntl();
  const templateId = useWatch({ control, name: BILL_FORM_KEY.templateId });
  const active = BILL_TEMPLATES.find((template) => template.id === templateId);

  return (
    <Form.Item
      label={formatMessage({ id: 'bills.form.template.label', defaultMessage: 'Store template' })}
      className="mb-0"
    >
      <Flex gap={8}>
        <Select
          value={templateId}
          onChange={onChange}
          className="flex-1"
          size="large"
          optionLabelProp="label"
          options={BILL_TEMPLATES.map((template) => ({
            value: template.id,
            label: formatMessage({
              id: `bills.template.${template.id}.name`,
              defaultMessage: template.name,
            }),
            template,
          }))}
          optionRender={({ data }) => (
            <Flex vertical>
              <Typography.Text strong>
                <FormattedMessage
                  id={`bills.template.${data.template.id}.name`}
                  defaultMessage={data.template.name}
                />
              </Typography.Text>
              <Typography.Text type="secondary" className="text-body-3-regular">
                <FormattedMessage
                  id={`bills.template.${data.template.id}.description`}
                  defaultMessage={data.template.description}
                />
              </Typography.Text>
            </Flex>
          )}
        />
        <Tooltip
          title={formatMessage({
            id: 'bills.form.template.resetStore',
            defaultMessage: "Restore this template's default store info",
          })}
        >
          <Button size="large" icon={<ReloadOutlined />} onClick={onResetStore} />
        </Tooltip>
      </Flex>
      {active ? (
        <Flex gap={4} wrap className="mt-2">
          <Tag color="cyan" className="whitespace-normal">
            <FormattedMessage
              id={`bills.font.${active.fontId}`}
              defaultMessage={active.printerStyle}
            />
          </Tag>
          <Tag>{getFontPreset(active.fontId).label}</Tag>
          <Tag>{`${active.paperWidth}px`}</Tag>
        </Flex>
      ) : null}
    </Form.Item>
  );
};
