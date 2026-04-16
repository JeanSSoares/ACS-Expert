import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  pacientesService,
  type AtualizarPacientePayload,
} from '@/services/pacientesService';
import { microareasService, type MicroareaAPI } from '@/services/usuariosService';
import type { Comorbidade, Sexo } from '@/types';

const COMORBIDADES: { id: Comorbidade; label: string }[] = [
  { id: 'hipertenso',     label: 'Hipertenso(a)' },
  { id: 'diabetico',      label: 'Diabético(a)' },
  { id: 'obeso',          label: 'Obeso(a)' },
  { id: 'fumante',        label: 'Fumante' },
  { id: 'asmatico',       label: 'Asmático(a)' },
  { id: 'cardiopata',     label: 'Cardiopata' },
  { id: 'dpoc',           label: 'DPOC' },
  { id: 'gestante',       label: 'Gestante' },
  { id: 'imunossuprimido',label: 'Imunossuprimido(a)' },
];

// Converte '2026-04-16T00:00:00.000Z' ou 'Mon Apr 16 2026 ...' → 'YYYY-MM-DD'
function toInputDate(valor?: string): string {
  if (!valor) return '';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function EditarPaciente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const usuarioAuth = useAuthStore((s) => s.usuario);

  // Carregamento
  const [loading, setLoading]   = useState(true);
  const [erroLoad, setErroLoad] = useState<string | null>(null);

  // Identificação
  const [nome, setNome] = useState('');
  const [cpf, setCpf]   = useState('');
  const [cns, setCns]   = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<Sexo>('f');

  // Localização
  const [logradouro, setLogradouro]   = useState('');
  const [numero, setNumero]           = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro]           = useState('');
  const [cep, setCep]                 = useState('');
  const [microareaId, setMicroareaId] = useState<string>('');
  const [nomeReferencia, setNomeReferencia] = useState('');

  // Contexto social
  const [idosoMoraSozinho, setIdosoMoraSozinho]           = useState(false);
  const [vulnerabilidadeSocial, setVulnerabilidadeSocial] = useState(false);
  const [dificuldadeLocomocao, setDificuldadeLocomocao]   = useState(false);
  const [beneficioSocial, setBeneficioSocial]             = useState(false);

  // Comorbidades
  const [comorbidadesSel, setComorbidadesSel] = useState<Set<Comorbidade>>(new Set());

  // Dados auxiliares
  const [microareas, setMicroareas] = useState<MicroareaAPI[]>([]);

  // Submit
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro]         = useState<string | null>(null);

  // Carrega paciente + microáreas em paralelo
  useEffect(() => {
    if (!id) return;
    let cancelado = false;

    async function carregar() {
      setLoading(true);
      setErroLoad(null);
      try {
        const [{ data: paciente }, { data: areas }] = await Promise.all([
          pacientesService.buscarPorId(Number(id)),
          microareasService.listar(usuarioAuth?.municipioId),
        ]);
        if (cancelado) return;

        setNome(paciente.nome ?? '');
        setCpf(paciente.cpf ?? '');
        setCns(paciente.cns ?? '');
        setDataNascimento(toInputDate(paciente.data_nascimento));
        setSexo(paciente.sexo);

        setLogradouro(paciente.logradouro ?? '');
        setNumero(paciente.numero ?? '');
        setComplemento(paciente.complemento ?? '');
        setBairro(paciente.bairro ?? '');
        setCep(paciente.cep ?? '');
        setMicroareaId(paciente.microarea_id ? String(paciente.microarea_id) : '');
        setNomeReferencia(paciente.nome_referencia ?? '');

        setIdosoMoraSozinho(Boolean(paciente.idoso_mora_sozinho));
        setVulnerabilidadeSocial(Boolean(paciente.vulnerabilidade_social));
        setDificuldadeLocomocao(Boolean(paciente.dificuldade_locomocao));
        setBeneficioSocial(Boolean(paciente.beneficio_social));

        setComorbidadesSel(new Set(paciente.comorbidades ?? []));
        setMicroareas(areas);
      } catch (err: any) {
        if (!cancelado) {
          setErroLoad(err?.response?.data?.message ?? 'Erro ao carregar paciente.');
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregar();
    return () => { cancelado = true; };
  }, [id, usuarioAuth?.municipioId]);

  const toggleComorbidade = (c: Comorbidade) => {
    setComorbidadesSel((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c); else next.add(c);
      return next;
    });
  };

  const handleSalvar = async () => {
    setErro(null);

    if (!id) return;
    if (!nome.trim() || !dataNascimento || !sexo) {
      setErro('Preencha nome, data de nascimento e sexo.');
      return;
    }

    const payload: AtualizarPacientePayload = {
      nome: nome.trim(),
      cpf: cpf || undefined,
      cns: cns || undefined,
      data_nascimento: dataNascimento,
      sexo,
      idoso_mora_sozinho:     idosoMoraSozinho,
      vulnerabilidade_social: vulnerabilidadeSocial,
      dificuldade_locomocao:  dificuldadeLocomocao,
      beneficio_social:       beneficioSocial,
      comorbidades: Array.from(comorbidadesSel),
    };

    if (logradouro.trim()) {
      payload.endereco = {
        logradouro: logradouro.trim(),
        numero: numero || undefined,
        complemento: complemento || undefined,
        bairro: bairro || undefined,
        cep: cep || undefined,
        microarea_id: microareaId ? Number(microareaId) : undefined,
        nome_referencia: nomeReferencia || undefined,
      };
    }

    setSalvando(true);
    try {
      await pacientesService.atualizar(Number(id), payload);
      navigate(`/paciente/${id}`);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[EditarPaciente] Falha ao atualizar:', err);
      const data   = err?.response?.data;
      const msg    = data?.message ?? err?.message ?? 'Erro ao salvar alterações.';
      const detail = data?.error ? ` (${data.error})` : '';
      setErro(msg + detail);
    } finally {
      setSalvando(false);
    }
  };

  const sexoButton = (val: Sexo, label: string) => (
    <button
      type="button"
      onClick={() => setSexo(val)}
      className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
      style={{
        backgroundColor: sexo === val ? '#0066CC' : 'white',
        color: sexo === val ? '#FFFFFF' : '#0B1220',
        border: sexo === val ? 'none' : '1px solid #DBEAFE',
      }}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center gap-2 text-[#64748B]">
        <Loader2 size={20} className="animate-spin" />
        Carregando dados do paciente...
      </div>
    );
  }

  if (erroLoad) {
    return (
      <div className="h-full flex flex-col p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#0B1220] mb-6">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="flex items-start gap-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl p-4">
          <AlertCircle size={18} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#B91C1C]">{erroLoad}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} color="#0B1220" />
          </button>
          <h2 className="font-bold text-[#0B1220]">Editar paciente</h2>
        </div>
      </div>

      {erro && (
        <div className="mx-6 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {erro}
        </div>
      )}

      <div className="flex-1 px-6 py-4 space-y-6">
        {/* Identificação */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Identificação</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">
                Nome completo <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">CNS</label>
              <input
                type="text"
                value={cns}
                onChange={(e) => setCns(e.target.value)}
                placeholder="000 0000 0000 0000"
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">
                Data de nascimento <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">
                Sexo <span className="text-[#EF4444]">*</span>
              </label>
              <div className="flex gap-3">
                {sexoButton('m', 'Masculino')}
                {sexoButton('f', 'Feminino')}
              </div>
            </div>
          </div>
        </div>

        {/* Localização */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Localização</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">Logradouro</label>
              <input
                type="text"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[#0B1220] block mb-2">Número</label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#0B1220] block mb-2">CEP</label>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">Bairro</label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">Complemento</label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">Microárea</label>
              <select
                value={microareaId}
                onChange={(e) => setMicroareaId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              >
                <option value="">Selecione...</option>
                {microareas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">Referência de localização</label>
              <textarea
                value={nomeReferencia}
                onChange={(e) => setNomeReferencia(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 resize-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Contexto Social */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Contexto Social</h3>
          <div className="space-y-2">
            {[
              { checked: idosoMoraSozinho,      set: setIdosoMoraSozinho,      label: 'Idoso que mora sozinho' },
              { checked: vulnerabilidadeSocial, set: setVulnerabilidadeSocial, label: 'Família em situação de vulnerabilidade' },
              { checked: dificuldadeLocomocao,  set: setDificuldadeLocomocao,  label: 'Dificuldade de locomoção' },
              { checked: beneficioSocial,       set: setBeneficioSocial,       label: 'Beneficiário de programa social' },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#DBEAFE] cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.set(e.target.checked)}
                  className="w-4 h-4 text-[#0066CC] rounded border-[#DBEAFE] focus:ring-[#0066CC]"
                />
                <span className="text-sm text-[#0B1220]">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Comorbidades */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Comorbidades</h3>
          <div className="flex flex-wrap gap-2">
            {COMORBIDADES.map((c) => {
              const selecionado = comorbidadesSel.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleComorbidade(c.id)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: selecionado ? '#0066CC' : 'white',
                    color: selecionado ? '#FFFFFF' : '#0B1220',
                    border: selecionado ? 'none' : '1px solid #DBEAFE',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBEAFE] p-4 max-w-[800px] mx-auto">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={salvando}
            className="px-6 py-3 text-[#64748B] font-semibold disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="flex-1 py-3 bg-[#0066CC] text-white rounded-xl font-semibold hover:bg-[#0052A3] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {salvando && <Loader2 size={18} className="animate-spin" />}
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
