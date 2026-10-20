import { CopyOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Flex, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';

import { TCodeLanguage, highlightCode } from '@/pages/admin/api-docs/helpers/highlight';

import './index.less';

export type TCodeFile = {
  key: string;
  label: string;
  language: TCodeLanguage;
  code: string;
  /** What the copy button copies when it differs from the display (e.g. the encoded URL) */
  copyText?: string;
};

type TCodeBlock = {
  /** One tab per file, like open files in an editor */
  files: TCodeFile[];
  /** Controlled tab; leave out to let the block switch tabs on its own */
  activeKey?: string;
  onActiveChange?: (key: string) => void;
  onCopy: (text: string) => void;
};

export const CodeBlock: React.FC<TCodeBlock> = ({ files, activeKey, onActiveChange, onCopy }) => {
  const { formatMessage } = useIntl();
  const [ownKey, setOwnKey] = useState(files[0]?.key);
  const file = files.find(({ key }) => key === (activeKey ?? ownKey)) ?? files[0];

  const html = useMemo(() => highlightCode(file.code, file.language), [file]);
  const lineCount = useMemo(() => file.code.split('\n').length, [file]);
  // a one-line URL or command reads better without a gutter
  const showGutter = lineCount > 1;
  const switchable = files.length > 1;

  const handleTab = (key: string) => {
    setOwnKey(key);
    onActiveChange?.(key);
  };

  return (
    <Flex vertical className="code-editor overflow-hidden rounded-lg">
      <Flex align="flex-end" justify="space-between" className="code-editor__header pr-2 pt-1">
        <Flex className="overflow-x-auto">
          {files.map((tab) => {
            const active = tab.key === file.key;
            return (
              <button
                key={tab.key}
                type="button"
                disabled={!switchable}
                onClick={() => handleTab(tab.key)}
                className={classNames(
                  'code-editor__tab whitespace-nowrap rounded-t border-0 px-3 py-1 font-mono text-body-3-regular',
                  { 'code-editor__tab--active': active, 'cursor-pointer': switchable && !active },
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </Flex>
        <Tooltip
          title={
            file.copyText
              ? formatMessage({ id: 'apiDocs.copy.encoded', defaultMessage: 'Copy (URL-encoded)' })
              : formatMessage({ id: 'apiDocs.copy', defaultMessage: 'Copy' })
          }
        >
          <Button
            type="text"
            size="small"
            className="mb-1"
            icon={<CopyOutlined className="text-neutral-5" />}
            onClick={() => onCopy(file.copyText ?? file.code)}
          />
        </Tooltip>
      </Flex>
      <Flex className="overflow-x-auto font-mono text-body-3-regular">
        {showGutter ? (
          <pre className="code-editor__gutter m-0 select-none py-3 pl-3 pr-3 text-right">
            {Array.from({ length: lineCount }, (_, index) => index + 1).join('\n')}
          </pre>
        ) : null}
        <pre
          className={classNames('m-0 flex-1 p-3', {
            // a single long URL wraps instead of scrolling off to the side
            'whitespace-pre-wrap break-all': file.language === 'url' && !showGutter,
          })}
          // highlight.js escapes the source, and the URL highlighter escapes every token
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Flex>
    </Flex>
  );
};
