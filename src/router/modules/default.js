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
        path: '/iframe',
        name: 'iframe',
        component: () => import('@src/views/iframe/index.vue'),
        props: (route) => ({
          src: decodeURIComponent(route.query.src),
        }),
      },
    ],
  },
];
