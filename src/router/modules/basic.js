export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('@src/views/login/index.vue'),
  },
  {
    name: '404',
    path: '/404',
    component: () => import('@src/views/not-found/index.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
];
