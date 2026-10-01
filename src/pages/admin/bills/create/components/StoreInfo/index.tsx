import { UploadOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import {
  Button,
  Col,
  Flex,
  Form,
  Image,
  message,
  Row,
  Segmented,
  Tag,
  theme,
  Typography,
  Upload,
} from 'antd';
import React, { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import type { TBillField } from '@/components/Bills/types';
import InputText from '@/components/Input';
import Slider from '@/components/Input/Slider';
import Switch from '@/components/Input/Switch';
import TextArea from '@/components/Input/TextArea';
import { isFieldVisible } from '@/pages/admin/bills/create/helpers/billFormKeys';

const { Item } = Form;

const STORE_FIELDS: {
  field: TBillField;
  name: string;
  id: string;
  label: string;
  span?: number;
}[] = [
  {
    field: 'store.legalName',
    name: 'store.legalName',
    id: 'bills.form.store.legalName',
    label: 'Company / legal name',
    span: 24,
  },
  {
    field: 'store.branch',
    name: 'store.branch',
    id: 'bills.form.store.branch',
    label: 'Branch / store code',
  },
  {
    field: 'store.taxCode',
    name: 'store.taxCode',
    id: 'bills.form.store.taxCode',
    label: 'Tax code (MST)',
  },
  {
    field: 'store.address',
    name: 'store.address',
    id: 'bills.form.store.address',
    label: 'Address',
    span: 24,
  },
  { field: 'store.phone', name: 'store.phone', id: 'bills.form.store.phone', label: 'Phone' },
  {
    field: 'store.hotline',
    name: 'store.hotline',
    id: 'bills.form.store.hotline',
    label: 'Hotline',
  },
  {
    field: 'store.website',
    name: 'store.website',
    id: 'bills.form.store.website',
    label: 'Website',
  },
  {
    field: 'store.slogan',
    name: 'store.slogan',
    id: 'bills.form.store.slogan',
    label: 'Slogan / opening hours',
  },
];

const MAX_LOGO_BYTES = 400 * 1024;

export const StoreInfo: React.FC<{ control: any; fields: TBillField[] }> = ({
  control,
  fields,
}) => {
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();
  const { setValue } = useFormContext();
  const showLogo = useWatch({ control, name: 'store.showLogo' });
  const logoUrl: string | undefined = useWatch({ control, name: 'store.logoUrl' });
  const logoAlign = useWatch({ control, name: 'store.logoAlign' }) ?? 'center';
  const [logoError, setLogoError] = useState(false);

  const handleLogoFile = (file: File) => {
    if (file.size > MAX_LOGO_BYTES) {
      message.error(
        formatMessage({
          id: 'bills.form.store.logo.tooLarge',
          defaultMessage: 'Logo must be 400 KB or smaller',
        }),
      );
      return false;
    }
    const reader = new FileReader();
    reader.onload = () => setValue('store.logoUrl', String(reader.result), { shouldDirty: true });
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <Row gutter={12}>
      <Col span={24}>
        <Item
          required
          label={formatMessage({ id: 'bills.form.store.name', defaultMessage: 'Store name' })}
        >
          <InputText control={control} name="store.name" />
        </Item>
      </Col>
      <Col span={24}>
        <Item
          label={
            <Flex gap={8} align="center">
              {formatMessage({ id: 'bills.form.store.logo', defaultMessage: 'Logo' })}
              <Switch control={control} name="store.showLogo" size="small" />
            </Flex>
          }
          extra={formatMessage({
            id: 'bills.form.store.logo.hint',
            defaultMessage:
              'Image URL (src) or upload (≤ 400 KB). Empty → the template prints the store name as a wordmark.',
          })}
        >
          <Flex gap={12} align="flex-start" wrap>
            <Flex
              align="center"
              justify="center"
              className="h-16 w-24 shrink-0 overflow-hidden rounded border border-solid"
              style={{
                backgroundColor: token.colorBgContainer,
                borderColor: token.colorBorder,
              }}
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  preview={false}
                  className="max-h-16 max-w-24 object-contain"
                  onLoad={() => setLogoError(false)}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-body-3-regular" style={{ color: token.colorTextTertiary }}>
                  {formatMessage({ id: 'bills.form.store.logo.none', defaultMessage: 'Wordmark' })}
                </span>
              )}
            </Flex>
            <Flex vertical gap={8} flex={1} className="min-w-60">
              <Flex gap={8}>
                {logoUrl?.startsWith('data:') ? (
                  <Tag
                    closable
                    onClose={() => setValue('store.logoUrl', '', { shouldDirty: true })}
                    className="m-0 flex flex-1 items-center"
                  >
                    {formatMessage({
                      id: 'bills.form.store.logo.uploaded',
                      defaultMessage: 'Uploaded image',
                    })}
                  </Tag>
                ) : (
                  <div className="min-w-0 flex-1">
                    <InputText
                      control={control}
                      name="store.logoUrl"
                      disabled={showLogo === false}
                      placeholder={formatMessage({
                        id: 'bills.form.store.logo.src',
                        defaultMessage: 'Logo image URL (src), e.g. https://…/logo.png',
                      })}
                      allowClear
                    />
                  </div>
                )}
                <Upload
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  showUploadList={false}
                  beforeUpload={handleLogoFile}
                  disabled={showLogo === false}
                >
                  <Button icon={<UploadOutlined />}>
                    {formatMessage({
                      id: 'bills.form.store.logo.upload',
                      defaultMessage: 'Upload',
                    })}
                  </Button>
                </Upload>
              </Flex>
              {logoUrl && logoError ? (
                <Typography.Text type="warning" className="text-body-3-regular">
                  {formatMessage({
                    id: 'bills.form.store.logo.error',
                    defaultMessage:
                      "This image couldn't be loaded (bad URL or the host blocks hotlinking).",
                  })}
                </Typography.Text>
              ) : null}
              <Flex gap={12} align="center" wrap>
                <Segmented
                  disabled={showLogo === false}
                  value={logoAlign}
                  onChange={(value) => setValue('store.logoAlign', value, { shouldDirty: true })}
                  options={[
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                  ]}
                />
                <div className="min-w-40 flex-1">
                  <Slider
                    control={control}
                    name="store.logoWidth"
                    min={40}
                    max={320}
                    disabled={showLogo === false}
                    tooltip={{ formatter: (value) => `${value}px` }}
                  />
                </div>
              </Flex>
            </Flex>
          </Flex>
        </Item>
      </Col>
      {STORE_FIELDS.filter(({ field }) => isFieldVisible(fields, field)).map((item) => (
        <Col key={item.name} span={24} md={item.span ?? 12}>
          <Item label={formatMessage({ id: item.id, defaultMessage: item.label })}>
            <InputText control={control} name={item.name} />
          </Item>
        </Col>
      ))}

      {isFieldVisible(fields, 'footerNote') ? (
        <Col span={24}>
          <Item
            label={formatMessage({ id: 'bills.form.footerNote', defaultMessage: 'Footer note' })}
          >
            <TextArea control={control} name="footerNote" autoSize={{ minRows: 2, maxRows: 6 }} />
          </Item>
        </Col>
      ) : null}
    </Row>
  );
};
