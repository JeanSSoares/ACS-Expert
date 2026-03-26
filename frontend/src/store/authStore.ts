import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/types'

interface AuthState {
  token: string | null
  refreshToken: string | null
  usuario: Usuario | null
  isAuthenticated: boolean
  setAuth: (token: string, refreshToken: string, usuario: Usuario) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      usuario: null,
      isAuthenticated: false,

      setAuth: (token, refreshToken, usuario) =>
        set({ token, refreshToken, usuario, isAuthenticated: true }),

      setToken: (token) =>
        set({ token }),

      logout: () =>
        set({ token: null, refreshToken: null, usuario: null, isAuthenticated: false }),
    }),
    {
      name: 'acs-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
