import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import type { LoginPayload, AuthResponse } from '@/types'

export function useAuth() {
  const navigate = useNavigate()
  const { usuario, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore()

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/login', payload)
      setAuth(data.token, data.refreshToken, data.usuario)
      navigate('/dashboard', { replace: true })
    },
    [setAuth, navigate]
  )

  const logout = useCallback(() => {
    storeLogout()
    navigate('/login', { replace: true })
  }, [storeLogout, navigate])

  return { usuario, isAuthenticated, login, logout }
}
