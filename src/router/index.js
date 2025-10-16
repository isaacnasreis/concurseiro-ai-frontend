import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
