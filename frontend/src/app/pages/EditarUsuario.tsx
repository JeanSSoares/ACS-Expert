import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  ArrowLeft, AlertCircle, CheckCircle2, Loader2,
  Eye, EyeOff, UserX, ShieldCheck, Users, UserCog,
} from 'lucide-react'
import { usuariosService, microareasService, type UsuarioAPI, type MicroareaAPI } from '@/services/usuariosService'
import { useAuthStore } from '@/store/authStore'
import type { Perfil } from '@/types'

const PERFIL_OPTIONS: { value: Perfil; label: string; descricao: string }[] = [
  { value: 'acs',         label: 'Agente Comunitário de Saúde', descricao: 'Realiza visitas, triagens e encaminhamentos' },
  { value: 'coordenador', label: 'Coordenador',                 descricao: 'Gerencia equipes e acompanha indicadores' },
  { value: 'gestor',      label: 'Gestor',                      descricao: 'Acesso completo ao sistema e relatórios' },
]

const PERFIL_ICON: Record<Perfil, typeof Users> = {
  acs: Users, coordenador: UserCog, gestor: ShieldCheck,
}

const PERFIL_COLOR: Record<Perfil, string> = {
  acs: '#0066CC', coordenador: '#7C3AED', gestor: '#059669',
}

function InputField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[#0B1220] block mb-2">
        {label}{required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-[#EF4444] flex items-center gap-1">
          <AlertCircle size={12} />{error}
        </p>
      )}
    </div>
  )
}

const inputClass      = 'w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 text-sm'
const inputErrorClass = 'w-full px-4 py-2.5 rounded-lg border border-[#EF4444] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20 text-sm'
const inputDisabled   = 'w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-sm cursor-not-allowed'

export function EditarUsuario() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const usuarioAuth = useAuthStore((s) => s.usuario)
  const isGestor   = usuarioAuth?.perfil === 'gestor'

  // ── Estados principais ─────────────────────────────────────────
  const [usuario,     setUsuario]     = useState<UsuarioAPI | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)

  // Campos editáveis
  const [nome,       setNome]       = useState('')
  const [email,      setEmail]      = useState('')
  const [perfil,     setPerfil]     = useState<Perfil | ''>('')
  const [microareaId, setMicroareaId] = useState('')
  const [ativo,      setAtivo]      = useState(true)
  const [microareas, setMicroareas] = useState<MicroareaAPI[]>([])

  // Erros de validação
  const [errors, setErrors] = useState<{ nome?: string; email?: string; perfil?: string; microareaId?: string }>({})
  const [erroApi, setErroApi] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [sucesso,  setSucesso]  = useState(false)

  // Seção de senha
  const [senhaAberta,    setSenhaAberta]    = useState(false)
  const [senhaAtual,     setSenhaAtual]     = useState('')
  const [novaSenha,      setNovaSenha]      = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showAtual,      setShowAtual]      = useState(false)
  const [showNova,       setShowNova]       = useState(false)
  const [showConfirm,    setShowConfirm]    = useState(false)
  const [errosSenha,     setErrosSenha]     = useState<{ senhaAtual?: string; novaSenha?: string; confirmarSenha?: string }>({})
  const [erroApiSenha,   setErroApiSenha]   = useState<string | null>(null)
  const [salvandoSenha,  setSalvandoSenha]  = useState(false)
  const [sucessoSenha,   setSucessoSenha]   = useState(false)

  // Confirmação de desativação
  const [confirmandoDesativar, setConfirmandoDesativar] = useState(false)
  const [desativando,          setDesativando]          = useState(false)

  // ── Carga inicial ──────────────────────────────────────────────
  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        setErroCarregar(null)
        const { data } = await usuariosService.buscarPorId(Number(id))
        setUsuario(data)
        setNome(data.nome)
        setEmail(data.email ?? '')
        setPerfil(data.perfil)
        setMicroareaId(data.microarea_id ? String(data.microarea_id) : '')
        setAtivo(Boolean(data.ativo))
      } catch (e: any) {
        setErroCarregar(e?.response?.data?.message ?? 'Erro ao carregar usuário.')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [id])

  useEffect(() => {
    microareasService.listar(usuarioAuth?.municipioId)
      .then(({ data }) => setMicroareas(data))
      .catch(() => {})
  }, [usuarioAuth?.municipioId])

  // ── Salvar dados ───────────────────────────────────────────────
  function validar(): boolean {
    const erros: typeof errors = {}
    if (!nome.trim())  erros.nome  = 'Nome é obrigatório'
    if (!perfil)       erros.perfil = 'Selecione um perfil'
    if (perfil === 'acs' && !microareaId) erros.microareaId = 'Microárea é obrigatória para ACS'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.email = 'E-mail inválido'
    setErrors(erros)
    return Object.keys(erros).length === 0
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    setSalvando(true)
    setErroApi(null)
    try {
      await usuariosService.atualizar(Number(id), {
        nome,
        email:        email || undefined,
        perfil:       perfil as Perfil,
        microarea_id: microareaId ? Number(microareaId) : null,
        ativo,
      })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 2500)
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Erro ao salvar. Tente novamente.'
      if (msg.toLowerCase().includes('e-mail')) setErrors((p) => ({ ...p, email: msg }))
      else setErroApi(msg)
    } finally {
      setSalvando(false)
    }
  }

  // ── Alterar senha ──────────────────────────────────────────────
  function validarSenha(): boolean {
    const erros: typeof errosSenha = {}
    const isProprioUsuario = usuarioAuth?.id === usuario?.id
    if (isProprioUsuario && !senhaAtual) erros.senhaAtual = 'Informe a senha atual'
    if (!novaSenha)              erros.novaSenha      = 'Nova senha é obrigatória'
    else if (novaSenha.length < 8) erros.novaSenha    = 'Mínimo de 8 caracteres'
    if (!confirmarSenha)         erros.confirmarSenha = 'Confirme a nova senha'
    else if (novaSenha !== confirmarSenha) erros.confirmarSenha = 'As senhas não coincidem'
    setErrosSenha(erros)
    return Object.keys(erros).length === 0
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (!validarSenha()) return
    setSalvandoSenha(true)
    setErroApiSenha(null)
    try {
      await usuariosService.alterarSenha(Number(id), {
        senha_atual: senhaAtual || undefined,
        nova_senha:  novaSenha,
      })
      setSucessoSenha(true)
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('')
      setTimeout(() => { setSucessoSenha(false); setSenhaAberta(false) }, 2000)
    } catch (e: any) {
      setErroApiSenha(e?.response?.data?.message ?? 'Erro ao alterar senha.')
    } finally {
      setSalvandoSenha(false)
    }
  }

  // ── Desativar ──────────────────────────────────────────────────
  async function handleDesativar() {
    setDesativando(true)
    try {
      await usuariosService.desativar(Number(id))
      navigate('/usuarios')
    } catch (e: any) {
      setErroApi(e?.response?.data?.message ?? 'Erro ao desativar usuário.')
      setConfirmandoDesativar(false)
    } finally {
      setDesativando(false)
    }
  }

  // ── Renders ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-[#64748B]">
        <Loader2 size={28} className="animate-spin text-[#0066CC]" />
        <p className="text-sm">Carregando usuário…</p>
      </div>
    )
  }

  if (erroCarregar) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center">
          <AlertCircle size={22} className="text-[#EF4444]" />
        </div>
        <p className="text-sm text-[#64748B] text-center">{erroCarregar}</p>
        <button onClick={() => navigate('/usuarios')}
          className="text-sm text-[#0066CC] font-medium hover:underline">
          Voltar à lista
        </button>
      </div>
    )
  }

  if (!usuario) return null

  const PIcon = PERFIL_ICON[usuario.perfil]
  const pCor  = PERFIL_COLOR[usuario.perfil]
  const iniciais = usuario.nome
    .split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-28">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/usuarios')}>
            <ArrowLeft size={24} color="#0B1220" />
          </button>
          <div>
            <h2 className="font-bold text-[#0B1220]">Editar usuário</h2>
            <p className="text-xs text-[#64748B]">Mat. {usuario.matricula}</p>
          </div>
        </div>

        {/* Avatar resumo */}
        <div className="mt-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
            style={{ backgroundColor: pCor }}>
            {iniciais}
          </div>
          <div>
            <p className="font-semibold text-[#0B1220] text-sm">{usuario.nome}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <PIcon size={12} style={{ color: pCor }} />
              <span className="text-xs font-medium" style={{ color: pCor }}>
                {PERFIL_OPTIONS.find((p) => p.value === usuario.perfil)?.label}
              </span>
              {!usuario.ativo && (
                <span className="text-[10px] bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-full">Inativo</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 space-y-7">
        {/* Erro geral */}
        {erroApi && (
          <div className="flex items-start gap-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl p-4">
            <AlertCircle size={18} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#B91C1C]">{erroApi}</p>
          </div>
        )}

        {sucesso && (
          <div className="flex items-center gap-3 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl p-4">
            <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0" />
            <p className="text-sm text-[#065F46] font-medium">Dados salvos com sucesso!</p>
          </div>
        )}

        {/* ── 1. Identificação ────────────────────────── */}
        <form onSubmit={handleSalvar} noValidate>
          <section>
            <h3 className="font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0066CC] text-white text-xs flex items-center justify-center font-bold">1</span>
              Identificação
            </h3>
            <div className="space-y-4">
              <InputField label="Nome completo" required error={errors.nome}>
                <input type="text" value={nome} onChange={(e) => { setNome(e.target.value); setErrors((p) => ({ ...p, nome: undefined })) }}
                  className={errors.nome ? inputErrorClass : inputClass} />
              </InputField>

              <InputField label="Matrícula">
                <input type="text" value={usuario.matricula} disabled className={inputDisabled} />
              </InputField>

              <InputField label="E-mail" error={errors.email}>
                <input type="email" placeholder="usuario@saude.gov.br" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
                  className={errors.email ? inputErrorClass : inputClass} />
              </InputField>
            </div>
          </section>

          {/* ── 2. Perfil ──────────────────────────────── */}
          <section className="mt-7">
            <h3 className="font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0066CC] text-white text-xs flex items-center justify-center font-bold">2</span>
              Perfil de acesso
            </h3>

            {errors.perfil && (
              <p className="mb-3 text-xs text-[#EF4444] flex items-center gap-1">
                <AlertCircle size={12} />{errors.perfil}
              </p>
            )}

            <div className="space-y-2">
              {PERFIL_OPTIONS.map((op) => {
                const isAtivo = perfil === op.value
                return (
                  <button key={op.value} type="button"
                    onClick={() => { setPerfil(op.value); if (op.value !== 'acs') setMicroareaId(''); setErrors((p) => ({ ...p, perfil: undefined, microareaId: undefined })) }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isAtivo ? 'border-[#0066CC] bg-[#E8F0FE]' : 'border-[#DBEAFE] bg-white hover:border-[#0066CC]/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${isAtivo ? 'border-[#0066CC] bg-[#0066CC]' : 'border-[#CBD5E1]'}`}>
                        {isAtivo && <div className="w-full h-full rounded-full bg-white scale-[0.4]" />}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isAtivo ? 'text-[#0066CC]' : 'text-[#0B1220]'}`}>{op.label}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">{op.descricao}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {perfil === 'acs' && (
              <div className="mt-4">
                <InputField label="Microárea de atuação" required error={errors.microareaId}>
                  <select value={microareaId}
                    onChange={(e) => { setMicroareaId(e.target.value); setErrors((p) => ({ ...p, microareaId: undefined })) }}
                    className={errors.microareaId ? inputErrorClass : inputClass}>
                    <option value="">Selecione a microárea…</option>
                    {microareas.map((m) => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </InputField>
              </div>
            )}
          </section>

          {/* ── Status ─────────────────────────────────── */}
          <section className="mt-7">
            <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#DBEAFE] cursor-pointer hover:bg-[#F6F9FF] transition-colors">
              <div>
                <p className="font-medium text-sm text-[#0B1220]">Usuário ativo</p>
                <p className="text-xs text-[#64748B] mt-0.5">Permite acesso ao sistema</p>
              </div>
              <div onClick={() => setAtivo((v) => !v)}
                className={`w-12 h-6 rounded-full transition-colors relative ${ativo ? 'bg-[#0066CC]' : 'bg-[#CBD5E1]'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${ativo ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </section>

          {/* Botão salvar */}
          <div className="mt-6">
            <button type="submit" disabled={salvando}
              className="w-full py-3 bg-[#0066CC] text-white rounded-xl font-semibold text-sm hover:bg-[#0052A3] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {salvando && <Loader2 size={16} className="animate-spin" />}
              {salvando ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>

        {/* ── 3. Alterar senha ───────────────────────── */}
        <section className="bg-white rounded-xl border border-[#DBEAFE] overflow-hidden">
          <button
            type="button"
            onClick={() => setSenhaAberta((v) => !v)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F6F9FF] transition-colors"
          >
            <div>
              <p className="font-semibold text-sm text-[#0B1220]">Alterar senha</p>
              <p className="text-xs text-[#64748B] mt-0.5">Redefina a senha de acesso</p>
            </div>
            <span className="text-[#64748B] text-xs font-medium">{senhaAberta ? 'Fechar' : 'Abrir'}</span>
          </button>

          {senhaAberta && (
            <form onSubmit={handleAlterarSenha} noValidate className="px-4 pb-4 space-y-4 border-t border-[#DBEAFE] pt-4">
              {erroApiSenha && (
                <div className="flex items-start gap-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl p-3">
                  <AlertCircle size={16} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#B91C1C]">{erroApiSenha}</p>
                </div>
              )}
              {sucessoSenha && (
                <div className="flex items-center gap-3 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl p-3">
                  <CheckCircle2 size={16} className="text-[#10B981] flex-shrink-0" />
                  <p className="text-xs text-[#065F46] font-medium">Senha alterada com sucesso!</p>
                </div>
              )}

              {/* Senha atual só aparece se o usuário está editando a si mesmo (e não é gestor editando outro) */}
              {usuarioAuth?.id === usuario.id && (
                <InputField label="Senha atual" required error={errosSenha.senhaAtual}>
                  <div className="relative">
                    <input type={showAtual ? 'text' : 'password'} value={senhaAtual}
                      onChange={(e) => { setSenhaAtual(e.target.value); setErrosSenha((p) => ({ ...p, senhaAtual: undefined })) }}
                      className={`${errosSenha.senhaAtual ? inputErrorClass : inputClass} pr-11`} />
                    <button type="button" onClick={() => setShowAtual((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                      {showAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </InputField>
              )}

              <InputField label="Nova senha" required error={errosSenha.novaSenha}>
                <div className="relative">
                  <input type={showNova ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={novaSenha}
                    onChange={(e) => { setNovaSenha(e.target.value); setErrosSenha((p) => ({ ...p, novaSenha: undefined })) }}
                    className={`${errosSenha.novaSenha ? inputErrorClass : inputClass} pr-11`} />
                  <button type="button" onClick={() => setShowNova((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                    {showNova ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </InputField>

              <InputField label="Confirmar nova senha" required error={errosSenha.confirmarSenha}>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} placeholder="Repita a nova senha" value={confirmarSenha}
                    onChange={(e) => { setConfirmarSenha(e.target.value); setErrosSenha((p) => ({ ...p, confirmarSenha: undefined })) }}
                    className={`${errosSenha.confirmarSenha ? inputErrorClass : inputClass} pr-11`} />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </InputField>

              <button type="submit" disabled={salvandoSenha}
                className="w-full py-2.5 bg-[#7C3AED] text-white rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {salvandoSenha && <Loader2 size={16} className="animate-spin" />}
                {salvandoSenha ? 'Salvando…' : 'Alterar senha'}
              </button>
            </form>
          )}
        </section>

        {/* ── Zona de perigo (apenas gestor) ─────────── */}
        {isGestor && usuario.ativo && (
          <section className="rounded-xl border border-[#FECACA] overflow-hidden">
            <div className="p-4 bg-[#FFF5F5]">
              <p className="font-semibold text-sm text-[#B91C1C]">Zona de risco</p>
              <p className="text-xs text-[#64748B] mt-0.5">Ações irreversíveis no cadastro do usuário</p>
            </div>

            <div className="p-4 bg-white">
              {!confirmandoDesativar ? (
                <button
                  type="button"
                  onClick={() => setConfirmandoDesativar(true)}
                  className="flex items-center gap-2 text-sm font-medium text-[#EF4444] hover:text-[#B91C1C] transition-colors"
                >
                  <UserX size={16} />
                  Desativar usuário
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[#0B1220]">
                    Tem certeza que deseja desativar <strong>{usuario.nome}</strong>?
                    O acesso será bloqueado imediatamente.
                  </p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setConfirmandoDesativar(false)} disabled={desativando}
                      className="flex-1 py-2 rounded-lg border border-[#DBEAFE] text-sm text-[#64748B] font-medium hover:bg-[#F6F9FF] transition-colors disabled:opacity-50">
                      Cancelar
                    </button>
                    <button type="button" onClick={handleDesativar} disabled={desativando}
                      className="flex-1 py-2 rounded-lg bg-[#EF4444] text-white text-sm font-semibold hover:bg-[#DC2626] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                      {desativando && <Loader2 size={14} className="animate-spin" />}
                      {desativando ? 'Desativando…' : 'Confirmar desativação'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
