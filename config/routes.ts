/**
 * @name umi routes
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/',
    redirect: '/admin/bills/create',
  },
  {
    path: 'admin',
    wrappers: ['@/layouts/Admin'],
    routes: [
      { path: '', redirect: 'bills/create' },
      {
        path: 'bills/create',
        name: 'admin-bills-create',
        component: '@/pages/admin/bills/create',
      },
      {
        path: 'api-docs',
        name: 'admin-api-docs',
        component: '@/pages/admin/api-docs',
      },
    ],
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
