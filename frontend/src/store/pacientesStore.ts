import { create } from 'zustand'
import type { Paciente, PaginatedResponse } from '@/types'

interface PacientesState {
  pacientes: Paciente[]
  total: number
  page: number
  limit: number
  loading: boolean
  error: string | null
  pacienteAtual: Paciente | null

  setPacientes: (resp: PaginatedResponse<Paciente>) => void
  setPacienteAtual: (p: Paciente | null) => void
  upsertPaciente: (p: Paciente) => void
  setLoading: (v: boolean) => void
  setError: (msg: string | null) => void
  reset: () => void
}

const initialState = {
  pacientes: [],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  error: null,
  pacienteAtual: null,
}

export const usePacientesStore = create<PacientesState>((set) => ({
  ...initialState,

  setPacientes: ({ data, total, page, limit }) =>
    set({ pacientes: data, total, page, limit }),

  setPacienteAtual: (p) => set({ pacienteAtual: p }),

  upsertPaciente: (p) =>
    set((state) => {
      const idx = state.pacientes.findIndex((x) => x.id === p.id)
      if (idx >= 0) {
        const updated = [...state.pacientes]
        updated[idx] = p
        return { pacientes: updated, pacienteAtual: p }
      }
      return { pacientes: [p, ...state.pacientes], pacienteAtual: p }
    }),

  setLoading: (v) => set({ loading: v }),
  setError: (msg) => set({ error: msg }),
  reset: () => set(initialState),
}))
