import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — injeta Bearer token ─────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — renova token com refresh ──────────
let isRefreshing = false
let queue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    const { refreshToken, setToken, logout } = useAuthStore.getState()
    if (!refreshToken) {
      logout()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        queue.push(resolve)
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post<{ token: string }>('/api/auth/refresh', { refreshToken })
      setToken(data.token)
      queue.forEach((cb) => cb(data.token))
      queue = []
      original.headers.Authorization = `Bearer ${data.token}`
      return api(original)
    } catch {
      logout()
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
