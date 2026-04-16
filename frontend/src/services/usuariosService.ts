import api from './api'
import type { Perfil } from '@/types'

export interface UsuarioAPI {
  id: number
  nome: string
  matricula: string
  email?: string
  perfil: Perfil
  ativo: number   // MySQL retorna TINYINT como 0/1
  ultimo_acesso?: string
  created_at?: string
  updated_at?: string
  microarea_id?: number
  microarea_nome?: string
  municipio_id?: number
  municipio_nome?: string
}

export interface MicroareaAPI {
  id: number
  nome: string
  municipio_id: number
}

export interface CriarUsuarioPayload {
  nome: string
  matricula: string
  email?: string
  senha: string
  perfil: Perfil
  microarea_id?: number
  municipio_id: number
  ativo?: boolean
}

export interface AtualizarUsuarioPayload {
  nome?: string
  email?: string
  perfil?: Perfil
  microarea_id?: number | null
  municipio_id?: number
  ativo?: boolean
}

export const usuariosService = {
  listar: (params?: { perfil?: Perfil; ativo?: boolean; busca?: string }) =>
    api.get<UsuarioAPI[]>('/usuarios', { params }),

  buscarPorId: (id: number) =>
    api.get<UsuarioAPI>(`/usuarios/${id}`),

  criar: (payload: CriarUsuarioPayload) =>
    api.post<UsuarioAPI>('/usuarios', payload),

  atualizar: (id: number, payload: AtualizarUsuarioPayload) =>
    api.put<UsuarioAPI>(`/usuarios/${id}`, payload),

  desativar: (id: number) =>
    api.delete(`/usuarios/${id}`),

  alterarSenha: (id: number, payload: { senha_atual?: string; nova_senha: string }) =>
    api.patch(`/usuarios/${id}/senha`, payload),
}

export const microareasService = {
  listar: (municipio_id?: number) =>
    api.get<MicroareaAPI[]>('/microareas', { params: municipio_id ? { municipio_id } : undefined }),
}
