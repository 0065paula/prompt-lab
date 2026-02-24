import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/laboratory'
  },
  {
    path: '/laboratory',
    name: 'laboratory',
    component: () => import('../components/PromptLaboratory.vue')
  },
  {
    path: '/comparison',
    name: 'comparison',
    component: () => import('../components/VisualComparison.vue')
  },
  {
    path: '/templates',
    name: 'templates',
    component: () => import('../components/PromptTemplates.vue')
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../components/IterationHistory.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
