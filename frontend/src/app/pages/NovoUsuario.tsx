import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Perfil } from '@/types';

interface FormData {
  nome: string;
  matricula: string;
  email: string;
  perfil: Perfil | '';
  microareaId: string;
  senha: string;
  senhaConfirmacao: string;
  ativo: boolean;
}

const PERFIL_OPTIONS: { value: Perfil; label: string; descricao: string }[] = [
  {
    value: 'acs',
    label: 'Agente Comunitário de Saúde',
    descricao: 'Realiza visitas, triagens e encaminhamentos',
  },
  {
    value: 'coordenador',
    label: 'Coordenador',
    descricao: 'Gerencia equipes e acompanha indicadores',
  },
  {
    value: 'gestor',
    label: 'Gestor',
    descricao: 'Acesso completo ao sistema e relatórios',
  },
];

const MICROAREAS = [
  { id: '1', nome: 'Microárea 1' },
  { id: '2', nome: 'Microárea 2' },
  { id: '3', nome: 'Microárea 3 — Vila Nova' },
  { id: '4', nome: 'Microárea 4' },
];

function InputField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[#0B1220] block mb-2">
        {label}
        {required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-[#EF4444] flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 text-sm';
const inputErrorClass =
  'w-full px-4 py-2.5 rounded-lg border border-[#EF4444] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20 text-sm';

export function NovoUsuario() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    nome: '',
    matricula: '',
    email: '',
    perfil: '',
    microareaId: '',
    senha: '',
    senhaConfirmacao: '',
    ativo: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  function validar(): boolean {
    const erros: Partial<Record<keyof FormData, string>> = {};

    if (!form.nome.trim()) erros.nome = 'Nome é obrigatório';
    if (!form.matricula.trim()) erros.matricula = 'Matrícula é obrigatória';
    if (!form.perfil) erros.perfil = 'Selecione um perfil';
    if (form.perfil === 'acs' && !form.microareaId) erros.microareaId = 'Microárea é obrigatória para ACS';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) erros.email = 'E-mail inválido';
    if (!form.senha) erros.senha = 'Senha é obrigatória';
    else if (form.senha.length < 8) erros.senha = 'Mínimo de 8 caracteres';
    if (!form.senhaConfirmacao) erros.senhaConfirmacao = 'Confirme a senha';
    else if (form.senha !== form.senhaConfirmacao) erros.senhaConfirmacao = 'As senhas não coincidem';

    setErrors(erros);
    return Object.keys(erros).length === 0;
  }

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    // TODO: chamar api.post('/usuarios', form) e redirecionar
    setSucesso(true);
    setTimeout(() => navigate('/usuarios'), 1500);
  }

  if (sucesso) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center">
          <CheckCircle2 size={32} className="text-[#10B981]" />
        </div>
        <h2 className="font-bold text-[#0B1220] text-lg text-center">Usuário criado com sucesso!</h2>
        <p className="text-sm text-[#64748B] text-center">Redirecionando para a lista de usuários…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSalvar} noValidate className="h-full flex flex-col overflow-y-auto pb-28">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} color="#0B1220" />
          </button>
          <div>
            <h2 className="font-bold text-[#0B1220]">Novo usuário</h2>
            <p className="text-xs text-[#64748B]">Preencha os dados de acesso</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 space-y-7">
        {/* ── Identificação ─────────────────────────────── */}
        <section>
          <h3 className="font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0066CC] text-white text-xs flex items-center justify-center font-bold">1</span>
            Identificação
          </h3>
          <div className="space-y-4">
            <InputField label="Nome completo" required error={errors.nome}>
              <input
                type="text"
                placeholder="Ex: Ana Paula da Silva"
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
                className={errors.nome ? inputErrorClass : inputClass}
              />
            </InputField>

            <InputField label="Matrícula" required error={errors.matricula}>
              <input
                type="text"
                placeholder="00000-0"
                value={form.matricula}
                onChange={(e) => set('matricula', e.target.value)}
                className={errors.matricula ? inputErrorClass : inputClass}
              />
            </InputField>

            <InputField label="E-mail" error={errors.email}>
              <input
                type="email"
                placeholder="usuario@saude.gov.br"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className={errors.email ? inputErrorClass : inputClass}
              />
            </InputField>
          </div>
        </section>

        {/* ── Perfil de acesso ──────────────────────────── */}
        <section>
          <h3 className="font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0066CC] text-white text-xs flex items-center justify-center font-bold">2</span>
            Perfil de acesso
          </h3>

          {errors.perfil && (
            <p className="mb-3 text-xs text-[#EF4444] flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.perfil}
            </p>
          )}

          <div className="space-y-2">
            {PERFIL_OPTIONS.map((op) => {
              const ativo = form.perfil === op.value;
              return (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => {
                    set('perfil', op.value);
                    if (op.value !== 'acs') set('microareaId', '');
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    ativo
                      ? 'border-[#0066CC] bg-[#E8F0FE]'
                      : 'border-[#DBEAFE] bg-white hover:border-[#0066CC]/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors ${
                        ativo ? 'border-[#0066CC] bg-[#0066CC]' : 'border-[#CBD5E1]'
                      }`}
                    >
                      {ativo && <div className="w-full h-full rounded-full bg-white scale-[0.4]" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${ativo ? 'text-[#0066CC]' : 'text-[#0B1220]'}`}>
                        {op.label}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5">{op.descricao}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Microárea — só aparece para ACS */}
          {form.perfil === 'acs' && (
            <div className="mt-4">
              <InputField label="Microárea de atuação" required error={errors.microareaId}>
                <select
                  value={form.microareaId}
                  onChange={(e) => set('microareaId', e.target.value)}
                  className={errors.microareaId ? inputErrorClass : inputClass}
                >
                  <option value="">Selecione a microárea…</option>
                  {MICROAREAS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </InputField>
            </div>
          )}
        </section>

        {/* ── Senha ─────────────────────────────────────── */}
        <section>
          <h3 className="font-semibold text-[#0B1220] mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0066CC] text-white text-xs flex items-center justify-center font-bold">3</span>
            Senha de acesso
          </h3>
          <div className="space-y-4">
            <InputField label="Senha" required error={errors.senha}>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={form.senha}
                  onChange={(e) => set('senha', e.target.value)}
                  className={`${errors.senha ? inputErrorClass : inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B1220]"
                >
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </InputField>

            <InputField label="Confirmar senha" required error={errors.senhaConfirmacao}>
              <div className="relative">
                <input
                  type={showConfirmacao ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={form.senhaConfirmacao}
                  onChange={(e) => set('senhaConfirmacao', e.target.value)}
                  className={`${errors.senhaConfirmacao ? inputErrorClass : inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmacao((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B1220]"
                >
                  {showConfirmacao ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </InputField>

            {/* Indicador de força da senha */}
            {form.senha && (
              <SenhaForca senha={form.senha} />
            )}
          </div>
        </section>

        {/* ── Status ────────────────────────────────────── */}
        <section>
          <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#DBEAFE] cursor-pointer hover:bg-[#F6F9FF] transition-colors">
            <div>
              <p className="font-medium text-sm text-[#0B1220]">Usuário ativo</p>
              <p className="text-xs text-[#64748B] mt-0.5">Permite acesso imediato ao sistema</p>
            </div>
            <div
              onClick={() => set('ativo', !form.ativo)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                form.ativo ? 'bg-[#0066CC]' : 'bg-[#CBD5E1]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${
                  form.ativo ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </div>
          </label>
        </section>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBEAFE] p-4 max-w-[800px] mx-auto">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-[#64748B] font-semibold text-sm hover:text-[#0B1220] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-[#0066CC] text-white rounded-xl font-semibold text-sm hover:bg-[#0052A3] transition-colors"
          >
            Criar usuário
          </button>
        </div>
      </div>
    </form>
  );
}

function SenhaForca({ senha }: { senha: string }) {
  const criterios = [
    { ok: senha.length >= 8, label: '8 caracteres' },
    { ok: /[A-Z]/.test(senha), label: 'Maiúscula' },
    { ok: /[0-9]/.test(senha), label: 'Número' },
    { ok: /[^A-Za-z0-9]/.test(senha), label: 'Especial' },
  ];
  const forca = criterios.filter((c) => c.ok).length;
  const cor = forca <= 1 ? '#EF4444' : forca === 2 ? '#F59E0B' : forca === 3 ? '#3B82F6' : '#10B981';
  const label = forca <= 1 ? 'Fraca' : forca === 2 ? 'Regular' : forca === 3 ? 'Boa' : 'Forte';

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="flex-1 h-1.5 rounded-full transition-colors"
            style={{ backgroundColor: n <= forca ? cor : '#E2E8F0' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: cor }}>
          Força: {label}
        </p>
        <div className="flex gap-3">
          {criterios.map((c) => (
            <span
              key={c.label}
              className="text-[10px] flex items-center gap-1"
              style={{ color: c.ok ? '#10B981' : '#94A3B8' }}
            >
              <span>{c.ok ? '✓' : '○'}</span>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
