import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)

  async function login(username, password) {
    const res = await api.post('/api/auth/login', { username, password })
    user.value = res.data
    return res.data
  }

  async function register(username, password) {
    const res = await api.post('/api/auth/register', { username, password })
    user.value = res.data
    return res.data
  }

  async function fetchMe() {
    try {
      const res = await api.get('/api/auth/me')
      user.value = res.data
    } catch {
      user.value = null
    }
  }

  async function logout() {
    await api.post('/api/auth/logout')
    user.value = null
  }

  return { user, login, register, fetchMe, logout }
})
