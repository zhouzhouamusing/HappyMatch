import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const GameViewImport = () => import('../views/GameView.vue')

export function preloadGameView() {
  GameViewImport()
}

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
    component: GameViewImport,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

let authChecked = null

function ensureAuth(userStore) {
  if (!authChecked) {
    authChecked = (async () => {
      if (userStore.user) return true
      const loggedIn = await userStore.fetchMe()
      if (loggedIn) return true
      const remembered = userStore.getRememberedCredentials()
      if (remembered) {
        try {
          await userStore.login(remembered.username, remembered.password, true)
          return true
        } catch {
          userStore.clearRememberedCredentials()
        }
      }
      return false
    })()
  }
  return authChecked
}

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth) {
    if (userStore.user) {
      next()
      return
    }
    const authed = await ensureAuth(userStore)
    next(authed ? undefined : '/login')
    return
  }

  if (to.meta.guest && userStore.user) {
    next('/')
    return
  }

  next()
})

export function resetAuthState() {
  authChecked = null
}

export default router
