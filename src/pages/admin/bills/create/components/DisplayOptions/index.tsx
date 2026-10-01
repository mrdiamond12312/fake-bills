import { SyncOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Col, ColorPicker, Flex, Form, Row, Segmented, Typography } from 'antd';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { FONT_PRESETS } from '@/components/Bills/fonts';
import InputText from '@/components/Input';
import Select from '@/components/Input/Select';
import Slider from '@/components/Input/Slider';
import Switch from '@/components/Input/Switch';
import { WATERMARK_LIMITS } from '@/const/bill';

const { Item } = Form;

export const DisplayOptions: React.FC<{ control: any; onShuffle: () => void }> = ({
  control,
  onShuffle,
}) => {
  const { formatMessage } = useIntl();
  const { setValue } = useFormContext();
  const seed = useWatch({ control, name: 'display.seed' });
  const color = useWatch({ control, name: 'display.watermark.color' }) ?? '#b3261e';
  const language = useWatch({ control, name: 'display.language' }) ?? 'vi';
  const t = (id: string, defaultMessage: string) => formatMessage({ id, defaultMessage });

  // Vertical labels: inline ones overflow the narrow columns into their neighbours
  return (
    <Form layout="vertical" component={false}>
      <Row gutter={16}>
        <Col span={24}>
          <Item
            label={t('bills.form.display.language', 'Receipt language')}
            extra={t(
              'bills.form.display.language.hint',
              'Switches the printed labels. Store info, product names and the footer note print as you typed them.',
            )}
          >
            <Segmented
              value={language}
              onChange={(value) => setValue('display.language', value, { shouldDirty: true })}
              options={[
                { value: 'vi', label: 'Tiếng Việt' },
                { value: 'en', label: 'English' },
              ]}
            />
          </Item>
        </Col>
        <Col span={24} md={12}>
          <Item label={t('bills.form.display.font', 'Font (override)')}>
            <Select
              control={control}
              name="display.fontId"
              className="w-full"
              options={Object.values(FONT_PRESETS).map((font) => ({
                value: font.id,
                label: `${font.label} — ${t(`bills.font.${font.id}`, font.imitates)}`,
              }))}
            />
          </Item>
        </Col>
        <Col span={12} md={6}>
          <Item label={t('bills.form.display.fontSize', 'Font size')}>
            <Slider control={control} name="display.fontSize" min={10} max={28} />
          </Item>
        </Col>
        <Col span={12} md={6}>
          <Item label={t('bills.form.display.paperWidth', 'Paper width')}>
            <Slider control={control} name="display.paperWidth" min={300} max={720} step={8} />
          </Item>
        </Col>
        <Col span={12} md={8}>
          <Item label={t('bills.form.display.inkDensity', 'Ink density')}>
            <Slider control={control} name="display.inkDensity" min={0.45} max={1} step={0.05} />
          </Item>
        </Col>
        <Col span={12} md={8}>
          <Item label={t('bills.form.display.codes', 'QR / barcode')}>
            <Flex gap={12} align="center">
              <Switch
                control={control}
                name="display.showQr"
                checkedChildren="QR"
                unCheckedChildren="QR"
              />
              <Switch
                control={control}
                name="display.showBarcode"
                checkedChildren="|||"
                unCheckedChildren="|||"
              />
            </Flex>
          </Item>
        </Col>
        <Col span={24} md={8}>
          <Item label={t('bills.form.display.seed', 'Random seed')}>
            <Flex gap={8} align="center" wrap>
              <Typography.Text code copyable>
                {seed}
              </Typography.Text>
              <Button size="small" icon={<SyncOutlined />} onClick={onShuffle}>
                {t('bills.form.display.shuffle', 'Shuffle')}
              </Button>
            </Flex>
          </Item>
        </Col>

        <Col span={24} md={12}>
          <Item
            label={t('bills.form.display.qrText', 'QR content')}
            extra={t('bills.form.display.codes.hint', 'Empty → random from the seed')}
          >
            <InputText control={control} name="display.qrText" allowClear placeholder="https://…" />
          </Item>
        </Col>
        <Col span={24} md={12}>
          <Item
            label={t('bills.form.display.barcodeText', 'Barcode content (Code 128)')}
            extra={t('bills.form.display.codes.hint', 'Empty → random from the seed')}
          >
            <InputText control={control} name="display.barcodeText" allowClear />
          </Item>
        </Col>

        <Col span={24}>
          <Typography.Title level={5} className="!mt-0">
            {t('bills.form.watermark.title', 'Watermark')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="text-body-3-regular">
            {t(
              'bills.form.watermark.hint',
              'Always printed on every output (preview, projector, PNG, API). Tune it so it disturbs OCR as little as you need.',
            )}
          </Typography.Paragraph>
        </Col>
        <Col span={24} md={16}>
          <Item label={t('bills.form.watermark.text', 'Text (SAMPLE is always kept)')}>
            <InputText control={control} name="display.watermark.text" />
          </Item>
        </Col>
        <Col span={24} md={8}>
          <Item label={t('bills.form.watermark.color', 'Color')}>
            <ColorPicker
              value={color}
              onChange={(value) =>
                setValue('display.watermark.color', value.toHexString(), { shouldDirty: true })
              }
              showText
            />
          </Item>
        </Col>
        <Col span={12} md={6}>
          <Item label={t('bills.form.watermark.opacity', 'Opacity')}>
            <Slider
              control={control}
              name="display.watermark.opacity"
              min={WATERMARK_LIMITS.opacity.min}
              max={WATERMARK_LIMITS.opacity.max}
              step={0.01}
            />
          </Item>
        </Col>
        <Col span={12} md={6}>
          <Item label={t('bills.form.watermark.size', 'Size')}>
            <Slider
              control={control}
              name="display.watermark.size"
              min={WATERMARK_LIMITS.size.min}
              max={WATERMARK_LIMITS.size.max}
            />
          </Item>
        </Col>
        <Col span={12} md={6}>
          <Item label={t('bills.form.watermark.angle', 'Angle')}>
            <Slider
              control={control}
              name="display.watermark.angle"
              min={WATERMARK_LIMITS.angle.min}
              max={WATERMARK_LIMITS.angle.max}
            />
          </Item>
        </Col>
        <Col span={12} md={6}>
          <Item label={t('bills.form.watermark.spacing', 'Spacing')}>
            <Slider
              control={control}
              name="display.watermark.spacing"
              min={WATERMARK_LIMITS.spacing.min}
              max={WATERMARK_LIMITS.spacing.max}
              step={0.1}
            />
          </Item>
        </Col>
      </Row>
    </Form>
  );
};
