import axios from 'axios'

import { useAuthStore } from '../../store/authSlice'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // 60s- your ML pipeline needs time
})

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally- redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

