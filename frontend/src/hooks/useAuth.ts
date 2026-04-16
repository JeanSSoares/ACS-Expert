import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import type { LoginPayload, Usuario } from '@/types'

// O backend retorna snake_case; mapeamos para o tipo Usuario (camelCase)
function mapUsuario(raw: any): Usuario {
  return {
    id:          raw.id,
    nome:        raw.nome,
    matricula:   raw.matricula,
    email:       raw.email,
    perfil:      raw.perfil,
    municipioId: raw.municipio_id ?? raw.municipioId,
    microareaId: raw.microarea_id ?? raw.microareaId,
    ativo:       Boolean(raw.ativo),
    ultimoAcesso: raw.ultimo_acesso ?? raw.ultimoAcesso,
  }
}

export function useAuth() {
  const navigate = useNavigate()
  const { usuario, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore()

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await api.post<{ token: string; usuario: any }>('/auth/login', payload)
      setAuth(data.token, '', mapUsuario(data.usuario))
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
