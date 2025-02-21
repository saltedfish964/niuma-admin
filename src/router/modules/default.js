export default [
  {
    path: '/',
    component: () => import('@src/layout/default/index.vue'),
    children: [
      {
        path: '/',
        name: 'home',
        component: () => import('@src/views/home/index.vue'),
      },
      {
        path: '/overview',
        name: 'overview',
        component: () => import('@src/views/overview/index.vue'),
      },
      {
        path: '/workbench',
        name: 'workbench',
        component: () => import('@src/views/workbench/index.vue'),
      },
      {
        path: '/icon',
        name: 'icon',
        component: () => import('@src/views/icon/index.vue'),
      },
      {
        path: '/iframe',
        name: 'iframe',
        component: () => import('@src/views/iframe/index.vue'),
        props: (route) => ({
          src: decodeURIComponent(route.query.src),
        }),
      },
      {
        path: '/table',
        name: 'table',
        component: () => import('@src/views/table/index.vue'),
      },
    ],
  },
];
