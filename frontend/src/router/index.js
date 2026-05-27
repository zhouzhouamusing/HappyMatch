import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordView.vue')
  },
  {
    path: '/',
    name: 'Game',
    component: () => import('../views/GameView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.user) {
    try {
      await userStore.fetchMe()
      if (!userStore.user) {
        next('/login')
        return
      }
    } catch {
      next('/login')
      return
    }
  }

  if (to.path === '/login' && userStore.user) {
    next('/')
    return
  }

  next()
})

export default router
