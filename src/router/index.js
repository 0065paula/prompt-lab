import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/diagnosis'
  },
  {
    path: '/diagnosis',
    name: 'diagnosis',
    component: () => import('../components/DiagnosisRoom.vue'),
    meta: { title: '诊断室', icon: '🩺' }
  },
  {
    path: '/optimizer',
    name: 'optimizer',
    component: () => import('../components/Optimizer.vue'),
    meta: { title: '优化器', icon: '✨' }
  },
  {
    path: '/ab-test',
    name: 'ab-test',
    component: () => import('../components/ABTestLab.vue'),
    meta: { title: 'A/B测试', icon: '🧪' }
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../components/VersionHistory.vue'),
    meta: { title: '版本历史', icon: '📚' }
  },
  {
    path: '/templates',
    name: 'templates',
    component: () => import('../components/TemplateStudio.vue'),
    meta: { title: '模板工坊', icon: '🎨' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
