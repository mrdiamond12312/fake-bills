import { CopyOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Flex, Tag, Tooltip } from 'antd';
import React from 'react';

type TCodeBlock = {
  code: string;
  label?: string;
  onCopy: (text: string) => void;
};

export const CodeBlock: React.FC<TCodeBlock> = ({ code, label, onCopy }) => {
  const { formatMessage } = useIntl();

  return (
    <Flex vertical className="overflow-hidden rounded-lg border border-neutral-3 bg-neutral-9">
      <Flex align="center" justify="space-between" className="border-b border-neutral-8 px-3 py-1">
        {label ? <Tag bordered={false}>{label}</Tag> : <span />}
        <Tooltip title={formatMessage({ id: 'apiDocs.copy', defaultMessage: 'Copy' })}>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined className="text-neutral-4" />}
            onClick={() => onCopy(code)}
          />
        </Tooltip>
      </Flex>
      <pre className="m-0 overflow-x-auto p-3 font-mono text-body-3-regular text-neutral-3">
        {code}
      </pre>
    </Flex>
  );
};
