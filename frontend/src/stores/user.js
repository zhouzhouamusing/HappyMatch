import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

const CREDENTIAL_KEY = 'hm_remembered'

function encodeCredentials(username, password) {
  return btoa(encodeURIComponent(JSON.stringify({ u: username, p: password })))
}

function decodeCredentials(encoded) {
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(encoded)))
    return { username: decoded.u, password: decoded.p }
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const user = ref(null)

  async function login(username, password, rememberMe = false) {
    const res = await api.post('/api/auth/login', { username, password, rememberMe })
    user.value = res.data.data

    // Store or clear credentials based on remember-me choice
    if (rememberMe) {
      localStorage.setItem(CREDENTIAL_KEY, encodeCredentials(username, password))
    } else {
      localStorage.removeItem(CREDENTIAL_KEY)
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
      return true
    } catch {
      user.value = null
      return false
    }
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // ignore network errors during logout
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

  function getRememberedCredentials() {
    const stored = localStorage.getItem(CREDENTIAL_KEY)
    if (!stored) return null
    return decodeCredentials(stored)
  }

  function clearRememberedCredentials() {
    localStorage.removeItem(CREDENTIAL_KEY)
  }

  return {
    user,
    login,
    register,
    fetchMe,
    logout,
    getSecurityQuestion,
    resetPassword,
    getRememberedCredentials,
    clearRememberedCredentials
  }
})
