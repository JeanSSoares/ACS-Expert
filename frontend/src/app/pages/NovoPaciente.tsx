import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { pacientesService, type CriarPacientePayload } from '@/services/pacientesService';
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

export function NovoPaciente() {
  const navigate = useNavigate();
  const usuarioAuth = useAuthStore((s) => s.usuario);

  // Identificação
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cns, setCns] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<Sexo>('f');

  // Localização
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [microareaId, setMicroareaId] = useState<string>('');
  const [nomeReferencia, setNomeReferencia] = useState('');

  // Contexto social
  const [idosoMoraSozinho, setIdosoMoraSozinho]           = useState(false);
  const [vulnerabilidadeSocial, setVulnerabilidadeSocial] = useState(false);
  const [dificuldadeLocomocao, setDificuldadeLocomocao]   = useState(false);
  const [beneficioSocial, setBeneficioSocial]             = useState(false);

  // Comorbidades
  const [comorbidadesSel, setComorbidadesSel] = useState<Set<Comorbidade>>(new Set());

  // Microáreas
  const [microareas, setMicroareas] = useState<MicroareaAPI[]>([]);

  // Submit
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarMicroareas() {
      try {
        const { data } = await microareasService.listar(usuarioAuth?.municipioId);
        setMicroareas(data);
      } catch {
        // se falhar, deixa vazio — o campo ainda será opcional
      }
    }
    carregarMicroareas();
  }, [usuarioAuth?.municipioId]);

  const toggleComorbidade = (c: Comorbidade) => {
    setComorbidadesSel((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c); else next.add(c);
      return next;
    });
  };

  const handleSalvar = async () => {
    setErro(null);

    if (!nome.trim() || !dataNascimento || !sexo) {
      setErro('Preencha nome, data de nascimento e sexo.');
      return;
    }

    const payload: CriarPacientePayload = {
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
      await pacientesService.criar(payload);
      navigate('/pacientes');
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Erro ao salvar paciente.');
    } finally {
      setSalvando(false);
    }
  };

  const sexoButton = (val: Sexo, label: string) => (
    <button
      onClick={() => setSexo(val)}
      className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
      style={{
        backgroundColor: sexo === val ? 'var(--acs-azul)' : 'white',
        color: sexo === val ? '#FFFFFF' : 'var(--acs-ink)',
        border: sexo === val ? 'none' : '1px solid var(--acs-line)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-white border-b border-acs-line px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-acs-ink" />
          </button>
          <h2 className="font-display font-bold text-acs-ink">Novo Paciente</h2>
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
          <h3 className="font-display font-semibold text-acs-ink mb-3">Identificação</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-acs-ink block mb-2">
                Nome completo <span className="text-acs-vermelho">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome completo"
                className="w-full px-4 py-2.5 rounded-lg border border-acs-line bg-white text-acs-ink placeholder:text-acs-ink-3 focus:outline-none focus:ring-2 focus:ring-acs-azul/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-acs-ink block mb-2">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 rounded-lg border border-acs-line bg-white text-acs-ink placeholder:text-acs-ink-3 focus:outline-none focus:ring-2 focus:ring-acs-azul/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-acs-ink block mb-2">CNS (Cartão Nacional de Saúde)</label>
              <input
                type="text"
                value={cns}
                onChange={(e) => setCns(e.target.value)}
                placeholder="000 0000 0000 0000"
                className="w-full px-4 py-2.5 rounded-lg border border-acs-line bg-white text-acs-ink placeholder:text-acs-ink-3 focus:outline-none focus:ring-2 focus:ring-acs-azul/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-acs-ink block mb-2">
                Data de nascimento <span className="text-acs-vermelho">*</span>
              </label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-acs-line bg-white text-acs-ink focus:outline-none focus:ring-2 focus:ring-acs-azul/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-acs-ink block mb-2">
                Sexo <span className="text-acs-vermelho">*</span>
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
          <h3 className="font-display font-semibold text-acs-ink mb-3">Localização</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-acs-ink block mb-2">Logradouro</label>
              <input
                type="text"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                placeholder="Ex: Rua das Flores"
                className="w-full px-4 py-2.5 rounded-lg border border-acs-line bg-white text-acs-ink placeholder:text-acs-ink-3 focus:outline-none focus:ring-2 focus:ring-acs-azul/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-acs-ink block mb-2">Número</label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-2.5 rounded-lg border border-acs-line bg-white text-acs-ink placeholder:text-acs-ink-3 focus:outline-none focus:ring-2 focus:ring-acs-azul/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-acs-ink block mb-2">CEP</label>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="w-full px-4 py-2.5 rounded-lg border border-acs-line bg-white text-acs-ink placeholder:text-acs-ink-3 focus:outline-none focus:ring-2 focus:ring-acs-azul/20"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-acs-ink block mb-2">Bairro</label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Ex: Centro"
                className="w-full px-4 py-2.5 rounded-lg border border-acs-line bg-white text-acs-ink placeholder:text-acs-ink-3 focus:outline-none focus:ring-2 focus:ring-acs-azul/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-acs-ink block mb-2">Complemento</label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Apto, bloco, etc."
                className="w-full px-4 py-2.5 rounded-lg border border-acs-line bg-white text-acs-ink placeholder:text-acs-ink-3 focus:outline-none focus:ring-2 focus:ring-acs-azul/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-acs-ink block mb-2">Microárea</label>
              <select
                value={microareaId}
                onChange={(e) => setMicroareaId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-acs-line bg-white text-acs-ink focus:outline-none focus:ring-2 focus:ring-acs-azul/20"
              >
                <option value="">Selecione...</option>
                {microareas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-acs-ink block mb-2">Referência de localização</label>
              <textarea
                value={nomeReferencia}
                onChange={(e) => setNomeReferencia(e.target.value)}
                placeholder="Ex: Próximo ao mercado, casa azul..."
                className="w-full px-4 py-2.5 rounded-lg border border-acs-line bg-white text-acs-ink placeholder:text-acs-ink-3 focus:outline-none focus:ring-2 focus:ring-acs-azul/20 resize-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Contexto Social */}
        <div>
          <h3 className="font-display font-semibold text-acs-ink mb-3">Contexto Social</h3>
          <div className="space-y-2">
            {[
              { checked: idosoMoraSozinho,       set: setIdosoMoraSozinho,       label: 'Idoso que mora sozinho' },
              { checked: vulnerabilidadeSocial,  set: setVulnerabilidadeSocial,  label: 'Família em situação de vulnerabilidade' },
              { checked: dificuldadeLocomocao,   set: setDificuldadeLocomocao,   label: 'Dificuldade de locomoção' },
              { checked: beneficioSocial,        set: setBeneficioSocial,        label: 'Beneficiário de programa social' },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-acs-line cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.set(e.target.checked)}
                  className="w-4 h-4 text-acs-azul rounded border-acs-line focus:ring-acs-azul"
                />
                <span className="text-sm text-acs-ink">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Comorbidades */}
        <div>
          <h3 className="font-display font-semibold text-acs-ink mb-3">Comorbidades</h3>
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
                    backgroundColor: selecionado ? 'var(--acs-azul)' : 'white',
                    color: selecionado ? '#FFFFFF' : 'var(--acs-ink)',
                    border: selecionado ? 'none' : '1px solid var(--acs-line)',
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-acs-line p-4 max-w-[390px] mx-auto">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={salvando}
            className="px-6 py-3 text-acs-ink-3 font-semibold disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="flex-1 py-3 bg-acs-azul text-white rounded-xl font-semibold hover:bg-acs-azul-900 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {salvando && <Loader2 size={18} className="animate-spin" />}
            {salvando ? 'Salvando...' : 'Salvar Paciente'}
          </button>
        </div>
      </div>
    </div>
  );
}
