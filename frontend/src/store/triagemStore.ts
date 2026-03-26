import { create } from 'zustand'
import type { TriagemInput, AvaliarTriagemResponse, Triagem } from '@/types'

interface TriagemState {
  // Wizard state (passo 1 → passo 2 → resultado)
  pacienteId: number | null
  visitaId: number | null
  input: Partial<TriagemInput>
  resultado: AvaliarTriagemResponse | null
  triagemSalva: Triagem | null
  loading: boolean
  error: string | null

  initTriagem: (pacienteId: number, visitaId?: number) => void
  updateInput: (partial: Partial<TriagemInput>) => void
  setResultado: (r: AvaliarTriagemResponse) => void
  setTriagemSalva: (t: Triagem) => void
  setLoading: (v: boolean) => void
  setError: (msg: string | null) => void
  reset: () => void
}

const initialState = {
  pacienteId: null,
  visitaId: null,
  input: {},
  resultado: null,
  triagemSalva: null,
  loading: false,
  error: null,
}

export const useTriagemStore = create<TriagemState>((set) => ({
  ...initialState,

  initTriagem: (pacienteId, visitaId) =>
    set({ ...initialState, pacienteId, visitaId: visitaId ?? null }),

  updateInput: (partial) =>
    set((state) => ({ input: { ...state.input, ...partial } })),

  setResultado: (r) => set({ resultado: r }),
  setTriagemSalva: (t) => set({ triagemSalva: t }),
  setLoading: (v) => set({ loading: v }),
  setError: (msg) => set({ error: msg }),
  reset: () => set(initialState),
}))
