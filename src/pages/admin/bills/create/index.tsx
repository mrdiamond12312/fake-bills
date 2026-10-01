import {
  ClearOutlined,
  CloudDownloadOutlined,
  DownloadOutlined,
  LinkOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Collapse,
  Flex,
  Form,
  Grid,
  Popconfirm,
  Row,
  Segmented,
  Slider,
  Space,
  Tooltip,
} from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';

import BillFontFaces from '@/components/Bills/BillFontFaces';
import Projector from '@/components/Projector';
import { BillPreview } from '@/pages/admin/bills/create/components/BillPreview';
import { CatalogImport } from '@/pages/admin/bills/create/components/CatalogImport';
import { DisplayOptions } from '@/pages/admin/bills/create/components/DisplayOptions';
import { ProductList } from '@/pages/admin/bills/create/components/ProductList';
import { StoreInfo } from '@/pages/admin/bills/create/components/StoreInfo';
import { TaxInfo } from '@/pages/admin/bills/create/components/TaxInfo';
import { TemplatePicker } from '@/pages/admin/bills/create/components/TemplatePicker';
import { TransactionInfo } from '@/pages/admin/bills/create/components/TransactionInfo';
import { useBillForm } from '@/pages/admin/bills/create/hooks/useBillForm';

type TPreviewMode = 'flat' | 'projector';

const AdminBillCreate: React.FC = () => {
  const { formatMessage } = useIntl();
  const t = (id: string, defaultMessage: string) => formatMessage({ id, defaultMessage });
  const [previewMode, setPreviewMode] = useState<TPreviewMode>('flat');
  const [zoom, setZoom] = useState(1);
  const screens = Grid.useBreakpoint();

  const {
    methods,
    control,
    bill,
    totals,
    codes,
    view,
    previewRef,
    isExporting,
    isRendering,
    handleTemplateChange,
    handleResetStore,
    handleResetAll,
    handleShuffleCodes,
    handleExportPng,
    handleRenderViaApi,
    handleCopyApiUrl,
    handleCopyPageLink,
  } = useBillForm();

  const fields = view.template.fields;

  return (
    <PageContainer
      title={t('bills.create.title', 'Bill composer')}
      subTitle={t('bills.create.subtitle', 'Sample receipts for OCR testing')}
      className="w-full"
      extra={
        <Space>
          <Tooltip
            title={t(
              'bills.actions.copyPageLink.hint',
              'The page link always carries every form value; open it later to get this exact bill back',
            )}
          >
            <Button icon={<ShareAltOutlined />} onClick={handleCopyPageLink}>
              {t('bills.actions.copyPageLink', 'Copy link')}
            </Button>
          </Tooltip>
          <Popconfirm
            title={t('bills.actions.resetAll.confirm', 'Discard the draft and start over?')}
            onConfirm={handleResetAll}
          >
            <Button icon={<ClearOutlined />}>{t('bills.actions.resetAll', 'Start over')}</Button>
          </Popconfirm>
        </Space>
      }
    >
      <BillFontFaces />
      <FormProvider {...methods}>
        <Row gutter={[16, 16]}>
          <Col span={24} xl={12}>
            {/* Inline labels squeeze the inputs on phones; stack them below `sm` */}
            <Form layout={screens.sm ? 'horizontal' : 'vertical'} component={false}>
              <Flex vertical gap={16}>
                <Card>
                  <TemplatePicker
                    control={control}
                    onChange={handleTemplateChange}
                    onResetStore={handleResetStore}
                  />
                </Card>
                <Card title={t('bills.section.products', 'Products')}>
                  <ProductList control={control} template={view.template} />
                </Card>
                <Card title={t('bills.section.tax', 'Tax & totals')}>
                  <TaxInfo control={control} totals={totals} />
                </Card>
                <Collapse
                  defaultActiveKey={['store']}
                  className="bg-neutral-1"
                  items={[
                    {
                      key: 'store',
                      label: t('bills.section.store', 'Store info'),
                      children: <StoreInfo control={control} fields={fields} />,
                    },
                    {
                      key: 'transaction',
                      label: t('bills.section.transaction', 'Transaction'),
                      children: <TransactionInfo control={control} fields={fields} />,
                    },
                    {
                      key: 'display',
                      label: t('bills.section.display', 'Print & watermark'),
                      children: <DisplayOptions control={control} onShuffle={handleShuffleCodes} />,
                    },
                    {
                      key: 'catalog',
                      label: t('bills.section.catalog', 'Product catalog (.xlsx import)'),
                      children: <CatalogImport />,
                    },
                  ]}
                />
              </Flex>
            </Form>
          </Col>

          <Col span={24} xl={12}>
            {/* Sticky in the space under the h-14 header: 1rem above + 1rem below, body scrolls inside */}
            <Card
              className="xl:sticky xl:top-[calc(3.5rem+1rem)] xl:flex xl:max-h-[calc(100vh-3.5rem-2rem)] xl:flex-col [&_.ant-card-head-title]:flex-none [&_.ant-card-head-wrapper]:flex-wrap [&_.ant-card-head-wrapper]:gap-2 [&_.ant-card-head-wrapper]:py-2"
              styles={{ body: { flex: 1, minHeight: 0, overflow: 'auto' } }}
              title={
                <Segmented<TPreviewMode>
                  value={previewMode}
                  onChange={setPreviewMode}
                  options={[
                    { value: 'flat', label: t('bills.preview.flat', 'Preview') },
                    { value: 'projector', label: t('bills.preview.projector', 'Projector') },
                  ]}
                />
              }
              extra={
                <Space wrap>
                  <Button
                    icon={<DownloadOutlined />}
                    loading={isExporting}
                    onClick={handleExportPng}
                  >
                    PNG
                  </Button>
                  <Button
                    icon={<CloudDownloadOutlined />}
                    loading={isRendering}
                    onClick={handleRenderViaApi}
                  >
                    {t('bills.actions.renderApi', 'Via API')}
                  </Button>
                  <Tooltip title={t('bills.actions.copyApiUrl', 'Copy API URL')}>
                    <Button icon={<LinkOutlined />} onClick={handleCopyApiUrl} />
                  </Tooltip>
                </Space>
              }
            >
              {previewMode === 'flat' ? (
                <Flex align="center" gap={8}>
                  <span className="text-body-3-medium text-neutral-7">
                    {t('bills.preview.zoom', 'Zoom')}
                  </span>
                  <Slider
                    className="flex-1"
                    min={0.4}
                    max={1.6}
                    step={0.05}
                    value={zoom}
                    onChange={setZoom}
                  />
                </Flex>
              ) : null}
              {/* The flat bill stays mounted (off-screen in projector mode) — it is the projector's texture source */}
              <div
                className={classNames(
                  'checkerboard rounded-lg',
                  previewMode === 'projector' && 'fixed -left-[10000px] top-0',
                )}
              >
                <BillPreview
                  ref={previewRef}
                  bill={bill}
                  totals={totals}
                  codes={codes}
                  paperWidth={view.paperWidth}
                  zoom={previewMode === 'flat' ? zoom : 1}
                />
              </div>
              {previewMode === 'projector' ? (
                <Projector
                  sourceRef={previewRef}
                  version={bill}
                  fileName={`${bill.templateId}-${bill.display.seed}`}
                />
              ) : null}
            </Card>
          </Col>
        </Row>
      </FormProvider>
    </PageContainer>
  );
};

export default AdminBillCreate;
