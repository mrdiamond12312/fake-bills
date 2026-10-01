import { history, useIntl } from '@umijs/max';
import { Button, Flex, Result, theme } from 'antd';
import React from 'react';

import { PATH_ADMIN_BILLS_CREATE } from '@/const/path';

const NoFoundPage: React.FC = () => {
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();
  return (
    <Flex
      align="center"
      justify="center"
      className="min-h-screen"
      style={{ backgroundColor: token.colorBgLayout }}
    >
      <Result
        className="fade-in"
        status="404"
        title="404"
        subTitle={formatMessage({
          id: 'pages.404.subTitle',
          defaultMessage: 'This page does not exist.',
        })}
        extra={
          <Button type="primary" onClick={() => history.push(PATH_ADMIN_BILLS_CREATE)}>
            {formatMessage({ id: 'pages.404.buttonText', defaultMessage: 'Back to the composer' })}
          </Button>
        }
      />
    </Flex>
  );
};

export default NoFoundPage;
