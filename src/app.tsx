import type { ConfigProviderProps } from 'antd/es/config-provider';

import defaultSettings from '../config/defaultSettings';

export const antd = (memo: ConfigProviderProps) => {
  memo.theme ??= {};
  memo.theme.token = {
    ...memo.theme.token,
    colorPrimary: defaultSettings.colorPrimary,
    borderRadius: 6,
  };
  return memo;
};
