import { DownloadOutlined, ExportOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Flex, Image } from 'antd';
import React from 'react';

type TApiPreview = {
  src?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
};

/** Fullscreen view of the API render (zoom/rotate from AntD), plus download and open-in-tab. */
export const ApiPreview: React.FC<TApiPreview> = ({ src, open, onOpenChange, onDownload }) => {
  const { formatMessage } = useIntl();
  if (!src) return null;

  return (
    <Image
      src={src}
      className="!hidden"
      alt="API render"
      preview={{
        visible: open,
        onVisibleChange: onOpenChange,
        toolbarRender: (originalNode) => (
          <Flex vertical align="center" gap={12}>
            {originalNode}
            <Flex gap={8}>
              <Button icon={<DownloadOutlined />} onClick={onDownload}>
                {formatMessage({ id: 'bills.apiPreview.download', defaultMessage: 'Download' })}
              </Button>
              <Button icon={<ExportOutlined />} onClick={() => window.open(src, '_blank')}>
                {formatMessage({
                  id: 'bills.apiPreview.newTab',
                  defaultMessage: 'Open in new tab',
                })}
              </Button>
            </Flex>
          </Flex>
        ),
      }}
    />
  );
};
