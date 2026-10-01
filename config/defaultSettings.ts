import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#13A89E',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Receipt Lab',
  logo: '/favicon.svg',
  iconfontUrl: '',
  layout: 'side',
};

export default Settings;
