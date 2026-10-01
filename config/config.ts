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
    default: 'vi-VN',
    antd: true,
    baseNavigator: false,
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
    // With pnpm `nodeLinker: hoisted`, MFSU mis-resolves umi's own dev-client helper
    // (".//<abs>/@umijs/utils/compiled/strip-ansi … does not exist in container" → blank page).
    exclude: ['@umijs/utils'],
  },
  esbuildMinifyIIFE: true,
  tailwindcss: {},
});
