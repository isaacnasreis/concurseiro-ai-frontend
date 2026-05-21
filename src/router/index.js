import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/gerador',
      name: 'gerador',
      component: () => import('../views/GeradorView.vue'),
    },
    {
      path: '/simulado',
      name: 'simulado',
      component: () => import('../views/SimuladoView.vue'),
    },
    {
      path: '/simplificador',
      name: 'simplificador',
      component: () => import('../views/SimplificadorView.vue'),
    },
    {
      path: '/mentor',
      name: 'mentor',
      component: () => import('../views/MentorView.vue'),
    },
  ],
});

export default router;
