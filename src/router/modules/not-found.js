export default [
  {
    name: 'not-found',
    path: '/:pathMatch(.*)*',
    component: () => import('@src/views/not-found/index.vue'),
  },
];
