import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordView.vue'),
    meta: { guest: true }
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

  if (to.meta.requiresAuth) {
    // If user already in memory, proceed
    if (userStore.user) {
      next()
      return
    }

    // Try to restore session from server
    const loggedIn = await userStore.fetchMe()
    if (loggedIn) {
      next()
      return
    }

    // Try auto-login with remembered credentials
    const remembered = userStore.getRememberedCredentials()
    if (remembered) {
      try {
        await userStore.login(remembered.username, remembered.password, true)
        next()
        return
      } catch {
        // Credentials no longer valid, clear them
        userStore.clearRememberedCredentials()
      }
    }

    // No valid session, redirect to login
    next('/login')
    return
  }

  // If going to login but already authenticated, redirect to game
  if (to.meta.guest && userStore.user) {
    next('/')
    return
  }

  next()
})

export default router
