import axios from 'axios'

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  response => {
    const data = response.data
    if (data && data.success === false) {
      return Promise.reject({ response: { data, status: response.status } })
    }
    return response
  },
  error => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/forgot-password') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
