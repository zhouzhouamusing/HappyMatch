import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)

  async function login(username, password, rememberMe = false) {
    const res = await api.post('/api/auth/login', { username, password, rememberMe })
    user.value = res.data.data
    if (rememberMe) {
      localStorage.setItem('rememberedUser', username)
    } else {
      localStorage.removeItem('rememberedUser')
    }
    return res.data.data
  }

  async function register(form) {
    const res = await api.post('/api/auth/register', form)
    user.value = res.data.data
    return res.data.data
  }

  async function fetchMe() {
    try {
      const res = await api.get('/api/auth/me')
      user.value = res.data.data
    } catch {
      user.value = null
    }
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout')
    } finally {
      user.value = null
    }
  }

  async function getSecurityQuestion(username) {
    const res = await api.get('/api/auth/security-question', { params: { username } })
    return res.data.data.securityQuestion
  }

  async function resetPassword(form) {
    const res = await api.post('/api/auth/reset-password', form)
    return res.data.message
  }

  function getRememberedUser() {
    return localStorage.getItem('rememberedUser') || ''
  }

  return { user, login, register, fetchMe, logout, getSecurityQuestion, resetPassword, getRememberedUser }
})
