import { ApiOutlined, FileTextOutlined, MenuOutlined } from '@ant-design/icons';
import { SelectLang, history, useIntl, useLocation, useOutlet } from '@umijs/max';
import { Button, Flex, Grid, Layout, Menu, Typography, theme } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';


import SelectTheme from '@/components/SelectTheme';
import { useThemeSettings } from '@/components/ThemeProvider';
import { PATH_ADMIN_API_DOCS, PATH_ADMIN_BILLS_CREATE } from '@/const/path';

const { Sider, Header, Content } = Layout;

const SIDER_WIDTH = 220;

const AdminLayout: React.FC = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  // Capture the current outlet element so the exiting page keeps its content
  // through the fade-out instead of swapping to the new page mid-animation.
  const outlet = useOutlet();
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const { settings } = useThemeSettings();
  const isDark = settings.navTheme === 'realDark';
  // Below lg the sidebar becomes an overlay drawer; at lg+ it sits in-flow.
  const isNarrow = !screens.lg;
  const [open, setOpen] = useState(false);

  // Close the overlay when the viewport grows back to the in-flow layout.
  useEffect(() => {
    if (!isNarrow) setOpen(false);
  }, [isNarrow]);

  return (
    <Layout className="min-h-screen">
      <Sider
        theme={isDark ? 'dark' : 'light'}
        width={SIDER_WIDTH}
        // Fixed width always; the narrow slide animates transform (not width) so the
        // menu labels never squeeze mid-animation.
        className="[&_.ant-layout-sider-children]:overflow-y-auto"
        style={{
          position: isNarrow ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 30,
          borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
          transition: 'transform 0.2s ease',
          transform: isNarrow && !open ? `translateX(-${SIDER_WIDTH}px)` : 'translateX(0)',
        }}
      >
        <Flex
          align="center"
          gap={10}
          className="h-14 px-5"
          style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
        >
          <span className="text-heading-5 leading-none text-teal-4">▤</span>
          <Typography.Text strong className="text-body-1-semibold">
            Receipt Lab
          </Typography.Text>
        </Flex>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          onClick={({ key }) => {
            history.push(key);
            if (isNarrow) setOpen(false);
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
      {isNarrow && open ? (
        <div className="fixed inset-0 z-[25] bg-neutral-10/40" onClick={() => setOpen(false)} />
      ) : null}
      <Layout>
        {/* Bar spans edge-to-edge; inner content aligns to the page container. */}
        <Header
          className="sticky top-0 z-20 h-14 !px-0 backdrop-blur"
          style={{
            backgroundColor: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Flex align="center" justify="space-between" className="container-page h-full">
            {isNarrow ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setOpen((v) => !v)}
                aria-label={formatMessage({ id: 'menu.toggle', defaultMessage: 'Menu' })}
                aria-expanded={open}
              />
            ) : (
              <span />
            )}
            <Flex align="center" gap={4}>
              <SelectTheme />
              <SelectLang />
            </Flex>
          </Flex>
        </Header>
        {/* One container wraps every page: title header and content align to it. */}
        <Content style={{ backgroundColor: token.colorBgLayout }}>
          <div className="container-page pt-6">
            {/* Fade the page out then in on route change (mode="wait"). */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
