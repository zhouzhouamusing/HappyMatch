import axios from 'axios'

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Public endpoints that should never trigger auth redirect
const PUBLIC_URLS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/security-question',
  '/api/auth/reset-password',
  '/api/auth/me'
]

function isPublicUrl(url) {
  return PUBLIC_URLS.some(p => url.includes(p))
}

api.interceptors.response.use(
  response => response,
  error => {
    const url = error.config?.url || ''
    const status = error.response?.status

    // Only redirect on 401 from protected (non-public) endpoints
    if (status === 401 && !isPublicUrl(url)) {
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/forgot-password') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
