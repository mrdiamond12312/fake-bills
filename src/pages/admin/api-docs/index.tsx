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
    values,
    examples,
    typeFiles,
    dottedHelperFiles,
    clientLanguage,
    handleClientLanguageChange,
    result,
    isSending,
    handleSend,
    handleStartFrom,
    handleLoadFromComposer,
    handleFormatBody,
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
      <div className="page-stack">
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
              method={values.method}
              getUrlLength={examples.getUrl.length}
              result={result}
              isSending={isSending}
              onSend={handleSend}
              onStartFrom={handleStartFrom}
              onLoadFromComposer={handleLoadFromComposer}
              onFormatBody={handleFormatBody}
              onShuffleSeed={handleShuffleSeed}
            />
          </FormProvider>
          <Flex vertical className="mt-6">
            <CodeBlock
              // remount on method switch so the tab resets to curl
              key={values.method}
              files={values.method === 'GET' ? examples.dottedFiles : examples.postFiles}
              onCopy={handleCopy}
            />
          </Flex>
        </Card>

        <Card title={t('apiDocs.section.ways', 'Ways to send the bill')}>
          <Typography.Paragraph type="secondary">
            {t(
              'apiDocs.ways.intro',
              'All three take the same fields and give the same image. The examples follow the playground body above. URLs past about 8–16 KB get refused, so use POST for big bills.',
            )}
          </Typography.Paragraph>
          <Flex vertical gap={20}>
            {[
              {
                key: 'post',
                title: t('apiDocs.ways.post.title', '1. POST a JSON body'),
                hint: t(
                  'apiDocs.ways.post.hint',
                  'Calling from code. No size limit. scale and format go in the body.',
                ),
                files: examples.postFiles,
              },
              {
                key: 'data',
                title: t('apiDocs.ways.data.title', '2. GET with data'),
                hint: t(
                  'apiDocs.ways.data.hint',
                  'You need a URL and already have the bill as an object: data=encodeURIComponent(JSON.stringify(bill)). scale and format can go inside it or next to it.',
                ),
                files: examples.dataFiles,
              },
              {
                key: 'dotted',
                title: t('apiDocs.ways.dotted.title', '3. GET with dotted params'),
                hint: t(
                  'apiDocs.ways.dotted.hint',
                  'Writing or editing a link by hand: templateId=…&store.name=…&items.0.title=…, plus scale and format. Numbers and true/false come back typed, and any items.N.* param replaces the whole list. "Copy API link" in the composer builds one for the current bill.',
                ),
                files: examples.dottedFiles,
                extra: (
                  <>
                    <Typography.Text type="secondary" className="mt-2">
                      {t(
                        'apiDocs.ways.dotted.helper',
                        "Building dotted params from an object in code: flatten it with a helper like this. Libraries such as qs or http_build_query write brackets (items[0][title]), which the API doesn't read.",
                      )}
                    </Typography.Text>
                    <CodeBlock
                      files={dottedHelperFiles}
                      activeKey={clientLanguage}
                      onActiveChange={handleClientLanguageChange}
                      onCopy={handleCopy}
                    />
                  </>
                ),
              },
            ].map((way) => (
              <Flex vertical gap={8} key={way.key}>
                <Typography.Text strong>{way.title}</Typography.Text>
                <Typography.Text type="secondary">{way.hint}</Typography.Text>
                <CodeBlock files={way.files} onCopy={handleCopy} />
                {'extra' in way ? way.extra : null}
              </Flex>
            ))}
          </Flex>
        </Card>

        <Card title={t('apiDocs.section.types', 'Request body type')}>
          <Typography.Paragraph type="secondary">
            {t(
              'apiDocs.types.intro',
              'Copy this into your client for autocomplete and type checks. Every field is optional; anything left out comes from the template defaults.',
            )}
          </Typography.Paragraph>
          <CodeBlock files={typeFiles} onCopy={handleCopy} />
        </Card>

        <Card title={t('apiDocs.section.clients', 'Client examples')}>
          <Typography.Paragraph type="secondary">
            {t(
              'apiDocs.clients.intro',
              'The playground bill sent with POST (saved to a file), then the same bill as a GET data URL. Standard libraries only.',
            )}
          </Typography.Paragraph>
          <CodeBlock
            files={examples.clientFiles}
            activeKey={clientLanguage}
            onActiveChange={handleClientLanguageChange}
            onCopy={handleCopy}
          />
        </Card>

        <Card title={t('apiDocs.section.legacy', 'Combining & legacy params')}>
          <Typography.Paragraph type="secondary">
            {t(
              'apiDocs.legacy.layers',
              'GET params apply in layers, later ones win: payload → data → legacy shortcuts → dotted params. So data=…&store.name=Other%20Mart sends a base bill and overrides one field.',
            )}
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary">
            {t(
              'apiDocs.legacy.intro',
              'These older params keep old links working. Use data or dotted params in new code.',
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
                'Logos: pass an image URL in store.logoUrl (or logo=). Data URLs work in GET too but make very long links; prefer POST for those.',
              )}
            </li>
          </ul>
          <Flex vertical gap={12} className="mt-4">
            <CodeBlock files={examples.listFiles} onCopy={handleCopy} />
            <CodeBlock files={examples.catalogFiles} onCopy={handleCopy} />
          </Flex>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AdminApiDocs;
