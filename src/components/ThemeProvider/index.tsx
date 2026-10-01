import { ConfigProvider, theme as antdTheme } from 'antd';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import defaultSettings from '../../../config/defaultSettings';

import { THEME_STORAGE_KEY } from '@/const/theme';
import { readLocalStorage, writeLocalStorage } from '@/utils/local-storage';

// The subset of pro's settings we persist and apply (SettingDrawer emits these).
export type TThemeSettings = {
  navTheme: 'light' | 'realDark';
  colorPrimary: string;
};

type TThemeContext = {
  settings: TThemeSettings;
  setSettings: (next: TThemeSettings) => void;
};

const DEFAULT_SETTINGS: TThemeSettings = {
  navTheme: 'light',
  colorPrimary: defaultSettings.colorPrimary ?? '#13A89E',
};

const ThemeContext = createContext<TThemeContext | null>(null);

/** Read-and-use the theme settings. Throws if used outside the provider. */
export const useThemeSettings = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeSettings must be used within ThemeProvider');
  return ctx;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<TThemeSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...readLocalStorage<Partial<TThemeSettings>>(THEME_STORAGE_KEY),
  }));

  const setSettings = (next: TThemeSettings) => {
    setSettingsState(next);
    try {
      writeLocalStorage(THEME_STORAGE_KEY, next);
    } catch {
      // theme is cosmetic; ignore storage failures
    }
  };

  const value = useMemo<TThemeContext>(() => ({ settings, setSettings }), [settings]);
  const isDark = settings.navTheme === 'realDark';

  // Expose the mode to plain CSS (e.g. .checkerboard) which can't read AntD tokens.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: { colorPrimary: settings.colorPrimary, borderRadius: 6 },
          components: {
            // Keep the dark Sider/Menu on the neutral dark container, not AntD's navy.
            Layout: isDark ? { siderBg: '#141414' } : {},
            Menu: isDark ? { darkItemBg: '#141414', darkSubMenuItemBg: '#141414' } : {},
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
