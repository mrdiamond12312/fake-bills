import { Flex, Spin, theme } from 'antd';
import React from 'react';

/** Umi route-loading fallback: shown while an async page chunk loads. */
const Loading: React.FC = () => {
  const { token } = theme.useToken();
  return (
    <Flex
      align="center"
      justify="center"
      className="min-h-[40vh] w-full"
      style={{ color: token.colorPrimary }}
    >
      <Spin size="large" />
    </Flex>
  );
};

export default Loading;
