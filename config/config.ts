// https://umijs.org/config/
import { defineConfig } from '@umijs/max';

import defaultSettings from './defaultSettings';
import routes from './routes';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  define: {
    REACT_APP_ENV,
  },
  hash: true,
  routes,
  theme: {
    'root-entry-name': 'variable',
  },
  ignoreMomentLocale: true,
  fastRefresh: true,
  model: {},
  initialState: {},
  title: defaultSettings.title,
  /**
   * @name locale plugin
   * @doc https://umijs.org/docs/max/i18n
   */
  locale: {
    default: 'en-US',
    antd: true,
    baseNavigator: true,
  },
  antd: {},
  request: {},
  reactQuery: {},
  /**
   * @name API routes
   * @description files in src/api are served under /api (dev server + vercel build)
   * @doc https://umijs.org/docs/guides/api-routes
   */
  apiRoute: {
    platform: 'vercel',
  },
  mfsu: {
    strategy: 'normal',
  },
  esbuildMinifyIIFE: true,
  tailwindcss: {},
});
