import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: HomeView
    },
    {
      path: '/blog/:blogId/detail',
      name: 'blog-detail',
      component: () => import('../views/BlogDetail.vue')
    },
    {
      path: '/blog/create',
      name: 'blog-create',
      component: () => import('../views/BlogCreateUpdate.vue')
    },
    {
      path: '/blog/:blogId/update',
      name: 'blog-update',
      component: () => import('../views/BlogCreateUpdate.vue')
    }
  ]
})

export default router
