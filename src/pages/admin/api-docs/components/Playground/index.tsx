import { CodeOutlined, ImportOutlined, SendOutlined, SyncOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import {
  Alert,
  Button,
  Col,
  Descriptions,
  Empty,
  Flex,
  Form,
  Image,
  Row,
  Segmented,
  Select,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import React from 'react';
import { Controller } from 'react-hook-form';

import { BILL_TEMPLATES } from '@/components/Bills/registry';
import TextArea from '@/components/Input/TextArea';
import { BILL_RENDER_API } from '@/const/bill';
import { API_FORM_KEY, TApiMethod } from '@/pages/admin/api-docs/helpers/apiFormKeys';
import { LONG_URL, type TApiTryResult } from '@/pages/admin/api-docs/hooks/useApiDocsForm';

const { Item } = Form;

type TPlayground = {
  control: any;
  method: TApiMethod;
  getUrlLength: number;
  result?: TApiTryResult;
  isSending: boolean;
  onSend: () => void;
  onStartFrom: (templateId: string) => void;
  onLoadFromComposer: () => void;
  onFormatBody: () => void;
  onShuffleSeed: () => void;
};

/** Segmented bound to a form field */
const SegmentedField: React.FC<{ control: any; name: string; options: any[] }> = ({
  control,
  name,
  options,
}) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <Segmented value={field.value} onChange={field.onChange} options={options} />
    )}
  />
);

export const Playground: React.FC<TPlayground> = ({
  control,
  method,
  getUrlLength,
  result,
  isSending,
  onSend,
  onStartFrom,
  onLoadFromComposer,
  onFormatBody,
  onShuffleSeed,
}) => {
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();
  const t = (id: string, defaultMessage: string) => formatMessage({ id, defaultMessage });

  return (
    <Row gutter={[24, 16]}>
      <Col span={24} lg={12}>
        <Form layout="vertical" component={false}>
          <Flex gap={16} wrap>
            <Item label="method">
              <SegmentedField
                control={control}
                name={API_FORM_KEY.method}
                options={['GET', 'POST']}
              />
            </Item>
            <Item label="format">
              <SegmentedField
                control={control}
                name={API_FORM_KEY.format}
                options={['png', 'svg']}
              />
            </Item>
            <Item label="scale">
              <SegmentedField control={control} name={API_FORM_KEY.scale} options={[1, 2, 3, 4]} />
            </Item>
          </Flex>
          <Item
            label={t('apiDocs.body.label', 'Bill (JSON)')}
            extra={
              method === 'GET'
                ? formatMessage(
                    {
                      id: 'apiDocs.body.hint.get',
                      defaultMessage:
                        'GET sends this as dotted params (store.name=…&items.0.title=…). URL: {length} chars',
                    },
                    { length: getUrlLength },
                  )
                : t(
                    'apiDocs.body.hint.post',
                    'POST sends this as the JSON body. Leave out anything you want from the template defaults.',
                  )
            }
          >
            <Flex gap={8} wrap className="mb-2">
              <Select
                size="small"
                className="min-w-[200px]"
                placeholder={t('apiDocs.body.startFrom', 'Start from template…')}
                value={null}
                onChange={onStartFrom}
                popupMatchSelectWidth={false}
                options={BILL_TEMPLATES.map((template) => ({
                  value: template.id,
                  label: `${template.id} — ${t(
                    `bills.template.${template.id}.name`,
                    template.name,
                  )}`,
                }))}
              />
              <Tooltip
                title={t(
                  'apiDocs.body.fromComposer.hint',
                  'Copies the current Bill composer draft into the editor',
                )}
              >
                <Button size="small" icon={<ImportOutlined />} onClick={onLoadFromComposer}>
                  {t('apiDocs.body.fromComposer', 'From composer')}
                </Button>
              </Tooltip>
              <Button size="small" icon={<CodeOutlined />} onClick={onFormatBody}>
                {t('apiDocs.body.format', 'Format')}
              </Button>
              <Button size="small" icon={<SyncOutlined />} onClick={onShuffleSeed}>
                {t('apiDocs.body.shuffleSeed', 'New seed')}
              </Button>
            </Flex>
            <TextArea
              control={control}
              name={API_FORM_KEY.body}
              spellCheck={false}
              autoSize={{ minRows: 14, maxRows: 32 }}
              className="font-mono text-body-3-regular"
            />
          </Item>
          {method === 'GET' && getUrlLength > LONG_URL ? (
            <Alert
              type="warning"
              showIcon
              className="mb-4"
              message={t(
                'apiDocs.body.longUrl',
                'This URL is very long; servers may refuse it. Switch to POST for big bills.',
              )}
            />
          ) : null}
        </Form>
        <Flex align="center" gap={12}>
          <Button type="primary" icon={<SendOutlined />} loading={isSending} onClick={onSend}>
            {t('apiDocs.try.send', 'Send request')}
          </Button>
          <Typography.Text type="secondary" className="text-body-3-regular">
            {`${method} ${BILL_RENDER_API}`}
          </Typography.Text>
        </Flex>
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
          <Flex
            align="center"
            justify="center"
            className="h-full min-h-60 rounded-lg"
            style={{ backgroundColor: token.colorFillQuaternary }}
          >
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
