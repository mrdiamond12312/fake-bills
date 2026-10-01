import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Alert, Card, Flex, Table, Tag, Typography } from 'antd';
import React from 'react';
import { FormProvider } from 'react-hook-form';

import { BILL_RENDER_API } from '@/const/bill';
import { CodeBlock } from '@/pages/admin/api-docs/components/CodeBlock';
import { Playground } from '@/pages/admin/api-docs/components/Playground';
import { RENDER_QUERY_PARAMS } from '@/pages/admin/api-docs/helpers/apiFormKeys';
import { useApiDocsForm } from '@/pages/admin/api-docs/hooks/useApiDocsForm';

const METHOD_COLOR: Record<string, string> = { GET: 'green', POST: 'blue' };

const AdminApiDocs: React.FC = () => {
  const { formatMessage } = useIntl();
  const t = (id: string, defaultMessage: string) => formatMessage({ id, defaultMessage });

  const {
    methods,
    control,
    examples,
    result,
    isSending,
    handleSend,
    handleShuffleSeed,
    handleCopy,
  } = useApiDocsForm();

  const endpoints = [
    {
      key: 'render-get',
      methods: ['GET', 'POST'],
      path: BILL_RENDER_API,
      returns: t(
        'apiDocs.endpoints.render',
        'Renders a receipt → image/png (or image/svg+xml with format=svg)',
      ),
    },
    {
      key: 'templates',
      methods: ['GET'],
      path: `${BILL_RENDER_API}?list=templates`,
      returns: t(
        'apiDocs.endpoints.templates',
        'Lists template ids, names and the fields each prints (JSON)',
      ),
    },
    {
      key: 'catalog',
      methods: ['GET'],
      path: '/api/catalog/products?keyword=',
      returns: t(
        'apiDocs.endpoints.catalog',
        'Searches the built-in demo catalog; accents are ignored (JSON)',
      ),
    },
  ];

  return (
    <PageContainer
      title={t('apiDocs.title', 'Render API')}
      subTitle={t('apiDocs.subtitle', 'Render the same sample receipts over HTTP')}
      className="w-full"
    >
      <Flex vertical gap={16}>
        <Card title={t('apiDocs.section.overview', 'Overview')}>
          <Flex vertical gap={12}>
            <Typography.Paragraph className="!mb-0">
              {t(
                'apiDocs.overview.intro',
                'The API draws a receipt with the same templates, fonts and codes as the composer, server-side (satori → resvg). Send only the fields you want to change; everything else comes from the template defaults. The same seed always gives the same QR, barcode and lookup codes.',
              )}
            </Typography.Paragraph>
            <Alert
              type="info"
              showIcon
              message={t(
                'apiDocs.overview.watermark',
                'Every response carries the tiled SAMPLE watermark. display.watermark can tune it (opacity ≥ 0.08) but not remove it.',
              )}
            />
            <Table
              size="small"
              pagination={false}
              rowKey="key"
              scroll={{ x: 'max-content' }}
              dataSource={endpoints}
              columns={[
                {
                  title: t('apiDocs.col.method', 'Method'),
                  dataIndex: 'methods',
                  width: 140,
                  render: (list: string[]) =>
                    list.map((method) => (
                      <Tag key={method} color={METHOD_COLOR[method]}>
                        {method}
                      </Tag>
                    )),
                },
                {
                  title: t('apiDocs.col.path', 'Path'),
                  dataIndex: 'path',
                  render: (path: string) => (
                    <Typography.Text code className="whitespace-nowrap">
                      {path}
                    </Typography.Text>
                  ),
                },
                { title: t('apiDocs.col.returns', 'Returns'), dataIndex: 'returns' },
              ]}
            />
          </Flex>
        </Card>

        <Card title={t('apiDocs.section.try', 'Try it')}>
          <FormProvider {...methods}>
            <Playground
              control={control}
              result={result}
              isSending={isSending}
              onSend={handleSend}
              onShuffleSeed={handleShuffleSeed}
            />
          </FormProvider>
          <Flex vertical gap={12} className="mt-6">
            <CodeBlock label="GET URL" code={examples.getUrl} onCopy={handleCopy} />
            <CodeBlock label="curl" code={examples.getCurl} onCopy={handleCopy} />
          </Flex>
        </Card>

        <Card title={t('apiDocs.section.get', 'GET: query shortcuts')}>
          <Typography.Paragraph type="secondary">
            {t(
              'apiDocs.get.intro',
              'Handy for quick renders and links. The shortcuts override anything inside payload.',
            )}
          </Typography.Paragraph>
          <Table
            size="small"
            pagination={false}
            rowKey="param"
            dataSource={[...RENDER_QUERY_PARAMS]}
            columns={[
              {
                title: t('apiDocs.col.param', 'Param'),
                dataIndex: 'param',
                width: 160,
                render: (param: string) => <Typography.Text code>{param}</Typography.Text>,
              },
              { title: t('apiDocs.col.sets', 'Sets'), dataIndex: 'sets' },
            ]}
          />
        </Card>

        <Card title={t('apiDocs.section.post', 'POST: full control')}>
          <Typography.Paragraph type="secondary">
            {t(
              'apiDocs.post.intro',
              'Send any subset of the bill as the JSON body (templateId, store, transaction, items, tax, display, footerNote), plus scale and format. This example follows the playground values above.',
            )}
          </Typography.Paragraph>
          <CodeBlock label="curl" code={examples.postCurl} onCopy={handleCopy} />
        </Card>

        <Card title={t('apiDocs.section.responses', 'Responses & limits')}>
          <ul className="m-0 flex flex-col gap-2 pl-5">
            <li>
              <Typography.Text code>200</Typography.Text>{' '}
              {t(
                'apiDocs.responses.ok',
                'The image. Headers X-Bill-Template and X-Bill-Seed identify the render; reuse the seed to reproduce it.',
              )}
            </li>
            <li>
              <Typography.Text code>400</Typography.Text>{' '}
              {t(
                'apiDocs.responses.error',
                'JSON with a message field describing what went wrong.',
              )}
            </li>
            <li>
              {t('apiDocs.responses.items', 'At most 200 items per bill. scale is clamped to 1–4.')}
            </li>
            <li>
              {t(
                'apiDocs.responses.logo',
                'Logos: pass an image URL in store.logoUrl (or logo=). Use POST for data URLs; they are too long for a query string.',
              )}
            </li>
          </ul>
          <Flex vertical gap={12} className="mt-4">
            <CodeBlock label="GET" code={examples.listUrl} onCopy={handleCopy} />
            <CodeBlock label="GET" code={examples.catalogUrl} onCopy={handleCopy} />
          </Flex>
        </Card>
      </Flex>
    </PageContainer>
  );
};

export default AdminApiDocs;
