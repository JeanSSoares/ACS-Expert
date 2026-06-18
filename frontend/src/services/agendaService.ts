import api from './api'
import type { NivelRisco } from '@/types'

export type StatusAgenda = 'pendente' | 'realizada' | 'adiada' | 'cancelada'

// Breakdown que o backend devolve em motivo_prioridade.
export interface AgendaMotivo {
  motivos:   string[]
  breakdown: {
    score_clinico:           number
    dias_sem_visita:         number | null
    peso_dias_sem_visita:    number
    peso_cronico:            number
    peso_evento_recente:     number
    peso_vulnerabilidade:    number
    total_cronicos:          number
    alertas_urgentes:        number
    alertas_atencao:         number
    triagens_altas_recentes: number
  }
  flags: {
    familia_multiplo_risco?:    boolean
    cronico_sem_acompanhamento?: boolean
  }
}

export interface AgendaItemAPI {
  id:                   number
  acs_id:               number
  paciente_id:          number
  data_agenda:          string
  ordem_prioridade:     number
  score_prioridade:     number
  motivo_prioridade:    AgendaMotivo | null
  status:               StatusAgenda
  visita_id?:           number
  created_at:           string
  // Joins:
  paciente_nome?:       string
  paciente_nivel_risco?: NivelRisco
  score_risco_atual?:   number
  idoso_mora_sozinho?:  number
  vulnerabilidade_social?: number
  dificuldade_locomocao?: number
  logradouro?:          string
  numero?:              string
  bairro?:              string
  cep?:                 string
  microarea_id?:        number
  microarea_nome?:      string
  latitude?:            number
  longitude?:           number
}

export interface AgendaResposta {
  data:        string
  acs_id?:     number
  total:       number
  realizadas:  number
  urgentes:    number
  itens:       AgendaItemAPI[]
}

export const agendaService = {
  // acsId só é respeitado pelo backend para perfis gestor/coordenador.
  hoje: (opts?: { data?: string; acsId?: number }) =>
    api.get<AgendaResposta>('/agenda/hoje', {
      params: {
        ...(opts?.data ? { data: opts.data } : {}),
        ...(opts?.acsId ? { acs_id: opts.acsId } : {}),
      },
    }),

  gerar: (payload?: { data?: string; limite?: number; acsId?: number }) =>
    api.post<AgendaResposta>('/agenda/gerar', {
      ...(payload?.data ? { data: payload.data } : {}),
      ...(payload?.limite ? { limite: payload.limite } : {}),
      ...(payload?.acsId ? { acs_id: payload.acsId } : {}),
    }),

  atualizarStatus: (id: number, status: StatusAgenda, visita_id?: number) =>
    api.put<{ id: number; status: StatusAgenda; visita_id: number | null }>(
      `/agenda/${id}/status`,
      { status, visita_id }
    ),
}

// ── Helpers de UI ───────────────────────────────────────────

export function corPrioridadePorRisco(
  nivel?: NivelRisco
): 'urgent' | 'warning' | 'low' {
  if (nivel === 'alto')     return 'urgent'
  if (nivel === 'moderado') return 'warning'
  return 'low'
}
