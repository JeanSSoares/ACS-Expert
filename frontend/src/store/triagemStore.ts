import { create } from 'zustand'
import type { Comorbidade, Sexo, TipoVisita } from '@/types'
import type {
  CatalogoTriagem,
  FaixaEtariaStr,
  TriagemResultadoAPI,
} from '@/services/triagensService'

// Estado da triagem em andamento — ephemeral (não persistimos em localStorage)

export interface TriagemContextoPaciente {
  id:          number
  nome:        string
  idade:       number
  sexo:        Sexo
  faixaEtaria: FaixaEtariaStr
}

export interface TriagemSintomaSel {
  intensity: number
}

interface TriagemState {
  paciente:    TriagemContextoPaciente | null
  tipoVisita:  TipoVisita
  observacao:  string
  riskFactors: Comorbidade[]
  sintomas:    Record<string, TriagemSintomaSel>
  qualifiers:  Record<string, Record<string, boolean>>
  catalogo:    CatalogoTriagem | null
  resultado:   TriagemResultadoAPI | null

  // Actions
  setPaciente:      (p: TriagemContextoPaciente) => void
  setTipoVisita:    (t: TipoVisita) => void
  setObservacao:    (o: string) => void
  toggleRiskFactor: (f: Comorbidade) => void
  setRiskFactors:   (list: Comorbidade[]) => void
  toggleSintoma:    (id: string) => void
  setIntensidade:   (id: string, v: number) => void
  toggleQualifier:  (sintomaId: string, qualifierId: string) => void
  setCatalogo:      (c: CatalogoTriagem) => void
  setResultado:     (r: TriagemResultadoAPI | null) => void
  reset:            () => void
}

const estadoInicial = {
  paciente:    null,
  tipoVisita:  'rotina' as TipoVisita,
  observacao:  '',
  riskFactors: [] as Comorbidade[],
  sintomas:    {} as Record<string, TriagemSintomaSel>,
  qualifiers:  {} as Record<string, Record<string, boolean>>,
  catalogo:    null,
  resultado:   null,
}

export const useTriagemStore = create<TriagemState>()((set) => ({
  ...estadoInicial,

  setPaciente:   (p) => set({ paciente: p }),
  setTipoVisita: (t) => set({ tipoVisita: t }),
  setObservacao: (o) => set({ observacao: o }),

  toggleRiskFactor: (f) =>
    set((state) => ({
      riskFactors: state.riskFactors.includes(f)
        ? state.riskFactors.filter((x) => x !== f)
        : [...state.riskFactors, f],
    })),

  setRiskFactors: (list) => set({ riskFactors: list }),

  toggleSintoma: (id) =>
    set((state) => {
      const next = { ...state.sintomas }
      const nextQuali = { ...state.qualifiers }
      if (next[id]) {
        delete next[id]
        delete nextQuali[id]
      } else {
        next[id] = { intensity: 5 }
      }
      return { sintomas: next, qualifiers: nextQuali }
    }),

  setIntensidade: (id, v) =>
    set((state) => ({
      sintomas: state.sintomas[id]
        ? { ...state.sintomas, [id]: { intensity: v } }
        : state.sintomas,
    })),

  toggleQualifier: (sintomaId, qualifierId) =>
    set((state) => {
      const current = state.qualifiers[sintomaId] ?? {}
      return {
        qualifiers: {
          ...state.qualifiers,
          [sintomaId]: { ...current, [qualifierId]: !current[qualifierId] },
        },
      }
    }),

  setCatalogo:  (c) => set({ catalogo: c }),
  setResultado: (r) => set({ resultado: r }),

  reset: () => set({ ...estadoInicial }),
}))
