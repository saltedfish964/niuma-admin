export default [
  {
    path: '/',
    component: () => import('@src/layout/default/index.vue'),
    children: [
      {
        name: 'home',
        path: '/',
        component: () => import('@src/views/home/index.vue'),
      },
    ],
  },
];
