import { SettingOutlined } from '@ant-design/icons';
import { ProConfigProvider, SettingDrawer, enUSIntl, viVNIntl } from '@ant-design/pro-components';
import { getLocale, useIntl } from '@umijs/max';
import { Button, Tooltip } from 'antd';
import React, { useState } from 'react';

import { useThemeSettings } from '@/components/ThemeProvider';
import { THEME_COLOR_LIST } from '@/const/theme';

const SelectTheme: React.FC = () => {
  const { formatMessage } = useIntl();
  const { settings, setSettings } = useThemeSettings();
  const [open, setOpen] = useState(false);

  const title = formatMessage({ id: 'theme.title', defaultMessage: 'Theme' });
  // The drawer's own labels come from pro-components' intl, not our locale files.
  // Pick it from the active app locale so Vietnamese doesn't fall back to Chinese.
  const proIntl = getLocale() === 'vi-VN' ? viVNIntl : enUSIntl;

  return (
    <>
      <Tooltip title={title}>
        <Button
          type="text"
          icon={<SettingOutlined />}
          aria-label={title}
          onClick={() => setOpen(true)}
        />
      </Tooltip>
      <ProConfigProvider intl={proIntl}>
        <SettingDrawer
          // Theme controls only — the app has a fixed custom layout, so hide layout/menu options.
          themeOnly
          enableDarkTheme
          collapse={open}
          onCollapseChange={setOpen}
          hideHintAlert
          hideCopyButton
          disableUrlParams
          colorList={THEME_COLOR_LIST}
          settings={settings}
          onSettingChange={(next) =>
            setSettings({
              navTheme: next.navTheme === 'realDark' ? 'realDark' : 'light',
              colorPrimary: next.colorPrimary ?? settings.colorPrimary,
            })
          }
        />
      </ProConfigProvider>
    </>
  );
};

export default SelectTheme;
