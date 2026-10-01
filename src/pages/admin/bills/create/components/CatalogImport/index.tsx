import { DeleteOutlined, DownloadOutlined, ExportOutlined, InboxOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Flex, List, message, Popconfirm, Space, Tooltip, Typography, Upload } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import { BILL_TEMPLATES } from '@/components/Bills/registry';
import { downloadCatalogTemplate, exportCatalog } from '@/services/catalog/api-services';
import {
  useCatalogProducts,
  useImportCatalog,
  useImportedCatalog,
  useRemoveCatalogSource,
} from '@/services/catalog/services';

/** Import store product lists from .xlsx/.xls/.csv; cached in localStorage. */
export const CatalogImport: React.FC = () => {
  const { formatMessage } = useIntl();
  const { data } = useImportedCatalog();
  const { mutateAsync: importCatalog, isLoading } = useImportCatalog();
  const { mutate: removeSource } = useRemoveCatalogSource();
  // export what you imported (the built-in demo list only when nothing is imported yet)
  const { products: allProducts } = useCatalogProducts();
  const exportable = data?.products.length ? data.products : allProducts;
  // one example row per store layout in the template's ACCOUNT column
  const exampleAccounts = BILL_TEMPLATES.map((template) => template.name.replace(/ layout$/i, ''));
  const t = (id: string, defaultMessage: string) => formatMessage({ id, defaultMessage });

  const handleFile = async (file: File) => {
    try {
      const result = await importCatalog(file);
      message.success(
        formatMessage(
          {
            id: 'bills.catalog.import.done',
            defaultMessage: 'Imported {count} products from {name}{skipped}',
          },
          {
            count: result.products.length,
            name: file.name,
            skipped: result.skipped ? ` (${result.skipped} rows skipped)` : '',
          },
        ),
      );
    } catch (error: any) {
      message.error(error?.message ?? 'Import failed');
    }
    return false;
  };

  return (
    <Flex vertical gap={12}>
      <Upload.Dragger
        accept=".xlsx,.xls,.csv"
        multiple
        showUploadList={false}
        beforeUpload={(file) => {
          handleFile(file);
          return false;
        }}
        disabled={isLoading}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {t('bills.catalog.import.title', 'Drop .xlsx files with store products here')}
        </p>
        <p className="ant-upload-hint px-4">
          {t(
            'bills.catalog.import.hint',
            'Sheet layout: STT | ACCOUNT | BARCODE | ART CODE | SKU NAME | NOTE (PRICE, UNIT optional). ACCOUNT is the store chain.',
          )}
        </p>
      </Upload.Dragger>
      <Flex justify="space-between" align="center">
        <Space size={4}>
          <Tooltip
            title={t(
              'bills.catalog.template.hint',
              'Same layout as the SKU sheet (STT, ACCOUNT, BARCODE, ART CODE, SKU NAME, NOTE), one example row per store',
            )}
          >
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => downloadCatalogTemplate(exampleAccounts)}
            >
              {t('bills.catalog.template', 'Download template (.xlsx)')}
            </Button>
          </Tooltip>
          <Button
            size="small"
            icon={<ExportOutlined />}
            disabled={!exportable.length}
            onClick={() => exportCatalog(exportable)}
          >
            {t('bills.catalog.export', 'Export catalog')}
          </Button>
        </Space>
        {data?.sources.length ? (
          <Popconfirm
            title={t('bills.catalog.clear.confirm', 'Remove all imported products?')}
            onConfirm={() => removeSource(undefined)}
          >
            <Button size="small" danger type="text">
              {t('bills.catalog.clear', 'Clear all')}
            </Button>
          </Popconfirm>
        ) : null}
      </Flex>
      {data?.sources.length ? (
        <List
          size="small"
          bordered
          dataSource={data.sources}
          renderItem={(source) => (
            <List.Item
              actions={[
                <Button
                  key="remove"
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeSource(source.name)}
                />,
              ]}
            >
              <List.Item.Meta
                title={source.name}
                description={
                  <Typography.Text type="secondary" className="text-body-3-regular">
                    {`${source.count} products · ${source.sheets.join(', ')} · ${dayjs(
                      source.importedAt,
                    ).format('DD/MM/YYYY HH:mm')}`}
                  </Typography.Text>
                }
              />
            </List.Item>
          )}
        />
      ) : null}
    </Flex>
  );
};
