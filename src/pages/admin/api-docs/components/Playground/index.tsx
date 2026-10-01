import { SendOutlined, SyncOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Alert, Button, Col, Descriptions, Empty, Flex, Form, Image, Row, Segmented } from 'antd';
import React from 'react';
import { Controller } from 'react-hook-form';

import { BILL_TEMPLATES } from '@/components/Bills/registry';
import InputText from '@/components/Input';
import InputNumber from '@/components/Input/InputNumber';
import Select from '@/components/Input/Select';
import { API_FORM_KEY } from '@/pages/admin/api-docs/helpers/apiFormKeys';
import type { TApiTryResult } from '@/pages/admin/api-docs/hooks/useApiDocsForm';

const { Item } = Form;

type TPlayground = {
  control: any;
  result?: TApiTryResult;
  isSending: boolean;
  onSend: () => void;
  onShuffleSeed: () => void;
};

export const Playground: React.FC<TPlayground> = ({
  control,
  result,
  isSending,
  onSend,
  onShuffleSeed,
}) => {
  const { formatMessage } = useIntl();
  const t = (id: string, defaultMessage: string) => formatMessage({ id, defaultMessage });

  return (
    <Row gutter={[24, 16]}>
      <Col span={24} lg={12}>
        <Form layout="vertical" component={false}>
          <Row gutter={16}>
            <Col span={24}>
              <Item label="template">
                <Select
                  control={control}
                  name={API_FORM_KEY.template}
                  className="w-full"
                  options={BILL_TEMPLATES.map((template) => ({
                    value: template.id,
                    label: `${template.id} — ${t(
                      `bills.template.${template.id}.name`,
                      template.name,
                    )}`,
                  }))}
                />
              </Item>
            </Col>
            <Col span={12}>
              <Item label="language">
                <Controller
                  control={control}
                  name={API_FORM_KEY.language}
                  render={({ field }) => (
                    <Segmented
                      value={field.value}
                      onChange={field.onChange}
                      options={['vi', 'en']}
                    />
                  )}
                />
              </Item>
            </Col>
            <Col span={12}>
              <Item label="vat (%)">
                <InputNumber
                  control={control}
                  name={API_FORM_KEY.vat}
                  min={0}
                  max={100}
                  className="w-full"
                />
              </Item>
            </Col>
            <Col span={24}>
              <Item label="seed" extra={t('apiDocs.seed.hint', 'Same seed → same codes')}>
                <Flex gap={8}>
                  <InputText control={control} name={API_FORM_KEY.seed} allowClear />
                  <Button icon={<SyncOutlined />} onClick={onShuffleSeed} />
                </Flex>
              </Item>
            </Col>
            <Col span={24}>
              <Item label="name">
                <InputText
                  control={control}
                  name={API_FORM_KEY.name}
                  allowClear
                  placeholder={t('apiDocs.name.placeholder', 'Template default when empty')}
                />
              </Item>
            </Col>
            <Col span={12}>
              <Item label="format">
                <Controller
                  control={control}
                  name={API_FORM_KEY.format}
                  render={({ field }) => (
                    <Segmented
                      value={field.value}
                      onChange={field.onChange}
                      options={['png', 'svg']}
                    />
                  )}
                />
              </Item>
            </Col>
            <Col span={12}>
              <Item label="scale">
                <Controller
                  control={control}
                  name={API_FORM_KEY.scale}
                  render={({ field }) => (
                    <Segmented
                      value={field.value}
                      onChange={field.onChange}
                      options={[1, 2, 3, 4]}
                    />
                  )}
                />
              </Item>
            </Col>
          </Row>
        </Form>
        <Button type="primary" icon={<SendOutlined />} loading={isSending} onClick={onSend}>
          {t('apiDocs.try.send', 'Send request')}
        </Button>
      </Col>

      <Col span={24} lg={12}>
        {result ? (
          <Flex vertical gap={12}>
            <Descriptions
              size="small"
              column={{ xs: 1, sm: 2 }}
              bordered
              items={[
                { key: 'status', label: 'Status', children: String(result.status) },
                {
                  key: 'time',
                  label: t('apiDocs.try.time', 'Time'),
                  children: `${result.millis} ms`,
                },
                { key: 'type', label: 'Content-Type', children: result.contentType },
                {
                  key: 'size',
                  label: t('apiDocs.try.size', 'Size'),
                  children: `${(result.bytes / 1024).toFixed(1)} KB`,
                },
                { key: 'template', label: 'X-Bill-Template', children: result.template || '—' },
                { key: 'seed', label: 'X-Bill-Seed', children: result.seed || '—' },
              ]}
            />
            {result.error ? <Alert type="error" showIcon message={result.error} /> : null}
            {result.objectUrl ? (
              <Flex
                justify="center"
                className="checkerboard max-h-[560px] overflow-auto rounded-lg p-4"
              >
                <Image src={result.objectUrl} width={280} alt="render result" />
              </Flex>
            ) : null}
          </Flex>
        ) : (
          <Flex align="center" justify="center" className="h-full min-h-60 rounded-lg bg-neutral-2">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t(
                'apiDocs.try.empty',
                'Send a request to see the rendered receipt here',
              )}
            />
          </Flex>
        )}
      </Col>
    </Row>
  );
};
