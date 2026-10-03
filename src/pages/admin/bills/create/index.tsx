import {
  ClearOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
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
  Modal,
  Popconfirm,
  Row,
  Segmented,
  Slider,
  Space,
  Tooltip,
  theme,
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
  const [catalogOpen, setCatalogOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();

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
        <div className="page-stack">
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
                  <Card
                    title={t('bills.section.products', 'Products')}
                    extra={
                      <Button
                        size="small"
                        icon={<CloudUploadOutlined />}
                        onClick={() => setCatalogOpen(true)}
                      >
                        {t('bills.section.catalog.open', 'Import catalog')}
                      </Button>
                    }
                  >
                    <ProductList control={control} template={view.template} />
                  </Card>
                  <Card title={t('bills.section.tax', 'Tax & totals')}>
                    <TaxInfo control={control} totals={totals} />
                  </Card>
                  <Collapse
                    defaultActiveKey={['store']}
                    style={{ backgroundColor: token.colorBgContainer }}
                    items={[
                      {
                        key: 'store',
                        label: t('bills.section.store', 'Store info'),
                        children: <StoreInfo control={control} fields={fields} />,
                      },
                      {
                        key: 'transaction',
                        label: t('bills.section.transaction', 'Transaction'),
                        children: (
                          <TransactionInfo
                            control={control}
                            fields={fields}
                            bill={bill}
                            codes={codes}
                          />
                        ),
                      },
                      {
                        key: 'display',
                        label: t('bills.section.display', 'Print & watermark'),
                        children: (
                          <DisplayOptions control={control} onShuffle={handleShuffleCodes} />
                        ),
                      },
                    ]}
                  />
                </Flex>
              </Form>
            </Col>

            <Col span={24} xl={12}>
              {/* Sticky under the 5.6rem header: 1.6rem above + 1.6rem below, body scrolls inside */}
              <Card
                className="xl:sticky xl:top-[calc(5.6rem+1.6rem)] xl:flex xl:h-[calc(100vh-5.6rem-3.2rem)] xl:flex-col [&_.ant-card-head-title]:flex-none [&_.ant-card-head-wrapper]:flex-wrap [&_.ant-card-head-wrapper]:gap-2 [&_.ant-card-head-wrapper]:py-2 [&_.ant-card-head]:relative [&_.ant-card-head]:z-[15]"
                styles={{
                  // paddingTop 0 so the sticky bar sits flush at the top (bar adds its own py)
                  body: {
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: 0,
                  },
                }}
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
                  <Flex
                    align="center"
                    gap={8}
                    className="sticky top-0 z-10 py-3"
                    style={{ backgroundColor: token.colorBgContainer }}
                  >
                    <span
                      className="text-body-3-medium"
                      style={{ color: token.colorTextSecondary }}
                    >
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
                    // Flat: fill the remaining card height and scroll the bill within.
                    previewMode === 'flat' && 'min-h-0 flex-1 overflow-auto',
                    // Projector: this stays mounted off-screen as the texture source.
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
                  <div className="flex min-h-0 flex-1 flex-col">
                    <Projector
                      sourceRef={previewRef}
                      version={bill}
                      fileName={`${bill.templateId}-${bill.display.seed}`}
                    />
                  </div>
                ) : null}
              </Card>
            </Col>
          </Row>
        </div>

        <Modal
          open={catalogOpen}
          onCancel={() => setCatalogOpen(false)}
          footer={null}
          width={640}
          title={t('bills.section.catalog', 'Product catalog (.xlsx import)')}
          destroyOnHidden
        >
          <CatalogImport />
        </Modal>
      </FormProvider>
    </PageContainer>
  );
};

export default AdminBillCreate;
