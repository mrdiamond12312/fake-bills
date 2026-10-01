import { ApiOutlined, FileTextOutlined } from '@ant-design/icons';
import { Outlet, SelectLang, history, useIntl, useLocation } from '@umijs/max';
import { Flex, Layout, Menu, Typography } from 'antd';
import React, { useState } from 'react';

import { PATH_ADMIN_API_DOCS, PATH_ADMIN_BILLS_CREATE } from '@/const/path';

const { Sider, Header, Content } = Layout;

const AdminLayout: React.FC = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  return (
    <Layout className="min-h-screen">
      <Sider
        breakpoint="lg"
        collapsedWidth={0}
        theme="light"
        width={220}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        onBreakpoint={setIsNarrow}
        // the zero-width toggle tab hangs outside the sider, so scroll the children, not the sider
        className="border-r border-neutral-3 [&_.ant-layout-sider-children]:overflow-y-auto"
        // pinned to the viewport while the page scrolls; below lg it slides over the page instead of squeezing it
        style={{
          position: isNarrow ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 30,
        }}
      >
        <Flex align="center" gap={8} className="h-14 px-5">
          <span className="text-heading-5 text-teal-4">▤</span>
          <Typography.Text strong className="text-body-1-semibold">
            Receipt Lab
          </Typography.Text>
        </Flex>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          onClick={({ key }) => {
            history.push(key);
            if (isNarrow) setCollapsed(true);
          }}
          items={[
            {
              key: PATH_ADMIN_BILLS_CREATE,
              icon: <FileTextOutlined />,
              label: formatMessage({
                id: 'menu.admin-bills-create',
                defaultMessage: 'Bill composer',
              }),
            },
            {
              key: PATH_ADMIN_API_DOCS,
              icon: <ApiOutlined />,
              label: formatMessage({ id: 'menu.admin-api-docs', defaultMessage: 'Render API' }),
            },
          ]}
        />
      </Sider>
      {isNarrow && !collapsed ? (
        <div className="fixed inset-0 z-[25] bg-neutral-10/40" onClick={() => setCollapsed(true)} />
      ) : null}
      <Layout>
        <Header className="sticky top-0 z-20 flex h-14 items-center justify-end bg-neutral-1/80 px-6 shadow-sm backdrop-blur">
          <SelectLang />
        </Header>
        <Content className="bg-neutral-2">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
