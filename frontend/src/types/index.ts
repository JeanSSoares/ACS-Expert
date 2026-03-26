// ============================================================
// ACS-Expert — Tipos TypeScript do domínio
// Espelham o schema MySQL definido no SAP
// ============================================================

// ── Enums ────────────────────────────────────────────────────

export type Perfil = 'acs' | 'coordenador' | 'gestor'

export type Sexo = 'm' | 'f'

export type NivelRisco = 'baixo' | 'moderado' | 'alto'

export type NivelPrioridade = 'muito_baixa' | 'baixa' | 'media' | 'alta'

export type AcaoRecomendada = 'acompanhamento' | 'encaminhar_ubs' | 'urgencia'

export type TipoVisita = 'rotina' | 'busca_ativa' | 'retorno' | 'urgencia'

export type StatusVisita = 'planejada' | 'realizada' | 'cancelada' | 'remarcada'

export type TipoEncaminhamento =
  | 'consulta_medica'
  | 'enfermagem'
  | 'vacinacao'
  | 'exame'
  | 'urgencia'
  | 'especialista'

export type StatusEncaminhamento = 'pendente' | 'realizado' | 'ausencia' | 'cancelado'

export type TipoAlerta =
  | 'alto_risco_sem_visita'
  | 'encaminhamento_pendente'
  | 'encaminhamento_ausencia'
  | 'cronico_sem_acompanhamento'
  | 'gestante_sem_prenatal'
  | 'vacina_atrasada'
  | 'familia_multiplo_risco'

export type UrgenciaAlerta = 'informativo' | 'atencao' | 'urgente'

export type Comorbidade =
  | 'fumante'
  | 'hipertenso'
  | 'diabetico'
  | 'obeso'
  | 'asmatico'
  | 'gestante'
  | 'cardiopata'
  | 'dpoc'
  | 'imunossuprimido'

export type FaixaEtaria =
  | '0-18'
  | '19-23'
  | '24-28'
  | '29-33'
  | '34-38'
  | '39-43'
  | '44-48'
  | '49-53'
  | '54-58'
  | '59+'

// ── Entidades ────────────────────────────────────────────────

export interface Municipio {
  id: number
  nome: string
  uf: string
  codigoIbge?: string
}

export interface Microarea {
  id: number
  nome: string
  municipioId: number
}

export interface Usuario {
  id: number
  nome: string
  matricula: string
  email?: string
  perfil: Perfil
  microareaId?: number
  municipioId: number
  microarea?: Microarea
  municipio?: Municipio
  ativo: boolean
  ultimoAcesso?: string
}

export interface Domicilio {
  id: number
  nomeReferencia?: string
  logradouro: string
  numero?: string
  complemento?: string
  bairro?: string
  cep?: string
  microareaId?: number
  latitude?: number
  longitude?: number
}

export interface Paciente {
  id: number
  nome: string
  cpf?: string
  cns?: string
  identificadorMunicipal?: string
  dataNascimento: string           // ISO date string
  sexo: Sexo
  domicilioId?: number
  responsavelDomicilio: boolean
  acsResponsavelId?: number
  // contexto social
  idosoMoraSozinho: boolean
  vulnerabilidadeSocial: boolean
  dificuldadeLocomocao: boolean
  beneficioSocial: boolean
  // score denormalizado
  scoreRiscoAtual: number
  nivelRisco: NivelRisco
  dataUltimaTriagem?: string
  dataUltimaVisita?: string
  ativo: boolean
  // relacionamentos opcionais (incluídos no GET /pacientes/:id)
  comorbidades?: Comorbidade[]
  domicilio?: Domicilio
}

export interface Visita {
  id: number
  pacienteId: number
  acsId: number
  dataHora: string
  tipoVisita: TipoVisita
  status: StatusVisita
  observacao?: string
  offlineUuid?: string
  paciente?: Pick<Paciente, 'id' | 'nome' | 'nivelRisco'>
}

export interface SintomaInput {
  intensity: number
  qualifiers?: Record<string, boolean>
}

export interface TriagemInput {
  pacienteId: number
  visitaId?: number
  faixaEtaria: FaixaEtaria
  sexo: Sexo
  sintomas: Record<string, SintomaInput>    // { tosse: { intensity: 7, qualifiers: { seca: true } } }
  riskFactors: Comorbidade[]
  qualifiers: Record<string, Record<string, boolean>>
}

export interface TriagemResultadoDoenca {
  id: string
  nome: string
  descricao?: string
  score: number
  label: 'Alta' | 'Media' | 'Baixa'
  rankPosicao: number
}

export interface Triagem {
  id: number
  visitaId?: number
  pacienteId: number
  acsId: number
  dataHora: string
  faixaEtaria: FaixaEtaria
  sexo: Sexo
  scoreFinal: number
  nivelRisco: NivelRisco
  nivelPrioridade: NivelPrioridade
  acaoRecomendada: AcaoRecomendada
  topDoencaId?: string
  topDoencaNome?: string
  topDoencaScore?: number
  payloadSintomas: Record<string, SintomaInput>
  payloadResultado: TriagemResultadoDoenca[]
  sintomas?: TriagemSintoma[]
  resultados?: TriagemResultadoDoenca[]
}

export interface TriagemSintoma {
  id: number
  triagemId: number
  sintomaId: string
  intensidade: number
  qualificadores?: Record<string, boolean>
}

export interface Encaminhamento {
  id: number
  triagemId?: number
  pacienteId: number
  acsId: number
  tipo: TipoEncaminhamento
  motivo: string
  unidadeSaudeId?: number
  dataEncaminhamento: string
  dataPrevista?: string
  status: StatusEncaminhamento
  dataDesfecho?: string
  observacaoDesfecho?: string
  notificarAusencia: boolean
  offlineUuid?: string
  paciente?: Pick<Paciente, 'id' | 'nome'>
  unidadeSaude?: UnidadeSaude
}

export interface UnidadeSaude {
  id: number
  nome: string
  tipo: 'ubs' | 'caps' | 'hospital' | 'laboratorio' | 'outro'
  endereco?: string
  municipioId: number
  latitude?: number
  longitude?: number
}

export interface Alerta {
  id: number
  pacienteId?: number
  acsId: number
  tipo: TipoAlerta
  urgencia: UrgenciaAlerta
  titulo: string
  mensagem?: string
  resolvido: boolean
  dataResolucao?: string
  createdAt: string
  paciente?: Pick<Paciente, 'id' | 'nome'>
}

export interface AgendaVisita {
  id: number
  acsId: number
  pacienteId: number
  dataAgenda: string
  ordemPrioridade: number
  scorePrioridade: number
  motivoPrioridade: {
    scoreClinico?: number
    diasSemVisita?: number
    temCronico?: boolean
    eventoRecente?: string | null
    vulnerabilidade?: boolean
    scoreTotal?: number
  }
  status: 'pendente' | 'realizada' | 'adiada' | 'cancelada'
  visitaId?: number
  paciente?: Pick<Paciente, 'id' | 'nome' | 'nivelRisco' | 'scoreRiscoAtual'>
  domicilio?: Pick<Domicilio, 'logradouro' | 'numero' | 'bairro'>
}

// ── Auth ─────────────────────────────────────────────────────

export interface LoginPayload {
  matricula: string
  senha: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  usuario: Usuario
}

// ── API helpers ──────────────────────────────────────────────

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ── Motor de inferência (resposta da API) ────────────────────

export interface AvaliarTriagemResponse {
  computed: TriagemResultadoDoenca[]
  nivelPrioridade: NivelPrioridade
  acaoRecomendada: AcaoRecomendada
  scoreFinal: number
  nivelRisco: NivelRisco
  logs?: object[]
}
