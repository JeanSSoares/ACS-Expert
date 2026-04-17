import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { useTriagemStore } from '@/store/triagemStore';
import { pacientesService, calcularIdade } from '@/services/pacientesService';
import { triagensService, idadeParaFaixaEtaria } from '@/services/triagensService';
import type { Comorbidade, TipoVisita } from '@/types';

const FATORES_RISCO: { id: Comorbidade; label: string }[] = [
  { id: 'fumante',         label: 'Fumante' },
  { id: 'hipertenso',      label: 'Hipertenso(a)' },
  { id: 'diabetico',       label: 'Diabetico(a)' },
  { id: 'obeso',           label: 'Obeso(a)' },
  { id: 'asmatico',        label: 'Asmatico(a)' },
  { id: 'gestante',        label: 'Gestante' },
  { id: 'cardiopata',      label: 'Cardiopata' },
  { id: 'dpoc',            label: 'DPOC' },
  { id: 'imunossuprimido', label: 'Imunossuprimido(a)' },
];

const TIPOS_VISITA: { id: TipoVisita; label: string }[] = [
  { id: 'rotina',      label: 'Rotina' },
  { id: 'busca_ativa', label: 'Busca ativa' },
  { id: 'retorno',     label: 'Retorno' },
  { id: 'urgencia',    label: 'Urgencia' },
];

export function TriagemPasso1() {
  const navigate = useNavigate();
  const { pacienteId } = useParams();
  const {
    paciente, tipoVisita, observacao, riskFactors, catalogo,
    setPaciente, setTipoVisita, setObservacao,
    toggleRiskFactor, setRiskFactors, setCatalogo, reset,
  } = useTriagemStore();

  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState<string | null>(null);

  useEffect(() => {
    if (!pacienteId) return;
    let cancelado = false;

    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const idNum = Number(pacienteId);
        if (paciente && paciente.id !== idNum) reset();

        const [{ data: pac }, { data: cat }] = await Promise.all([
          pacientesService.buscarPorId(idNum),
          catalogo
            ? Promise.resolve({ data: catalogo })
            : triagensService.catalogo(),
        ]);

        if (cancelado) return;

        const idade = calcularIdade(pac.data_nascimento);
        setPaciente({
          id:          pac.id,
          nome:        pac.nome,
          idade,
          sexo:        pac.sexo,
          faixaEtaria: idadeParaFaixaEtaria(idade),
        });

        if (!catalogo) setCatalogo(cat);

        if (riskFactors.length === 0 && pac.comorbidades?.length) {
          setRiskFactors(pac.comorbidades as Comorbidade[]);
        }
      } catch (err: any) {
        if (!cancelado) {
          setErro(err?.response?.data?.message ?? 'Erro ao carregar triagem.');
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregar();
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center gap-2 text-acs-ink-3">
        <Loader2 size={20} className="animate-spin" />
        Carregando...
      </div>
    );
  }

  if (erro || !paciente) {
    return (
      <div className="h-full flex flex-col p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-acs-ink mb-6">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="flex items-start gap-3 bg-acs-vermelho-100 border border-acs-vermelho/20 rounded-xl p-4">
          <AlertCircle size={18} className="text-acs-vermelho flex-shrink-0 mt-0.5" />
          <p className="text-sm text-acs-vermelho">{erro ?? 'Paciente nao encontrado.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-white border-b border-acs-line px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-acs-ink" />
          </button>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-acs-ink">Nova Triagem</h2>
            <p className="text-sm text-acs-ink-3 truncate">
              {paciente.nome} • {paciente.idade} anos • {paciente.sexo === 'm' ? 'Masculino' : 'Feminino'}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-1.5 bg-acs-azul rounded-full" />
          <div className="flex-1 h-1.5 bg-acs-paper-2 rounded-full" />
          <div className="flex-1 h-1.5 bg-acs-paper-2 rounded-full" />
        </div>
        <p className="eyebrow mt-2">1 de 3 — Fatores de risco e contexto</p>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6">
        {/* Fatores de Risco */}
        <div>
          <h3 className="font-display font-semibold text-acs-ink mb-1">Fatores de Risco / Comorbidades</h3>
          <p className="text-xs text-acs-ink-3 mb-3">
            Pre-selecionadas com base no prontuario. Ajuste se necessario.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FATORES_RISCO.map((f) => {
              const ativo = riskFactors.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleRiskFactor(f.id)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    ativo
                      ? 'bg-acs-azul text-white'
                      : 'bg-white text-acs-ink border border-acs-line'
                  }`}
                >
                  {ativo && '✓ '}{f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contexto da Visita */}
        <div>
          <h3 className="font-display font-semibold text-acs-ink mb-3">Contexto da visita</h3>

          <div className="mb-4">
            <label className="text-sm font-medium text-acs-ink block mb-2">Tipo de visita</label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_VISITA.map((t) => {
                const ativo = tipoVisita === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipoVisita(t.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      ativo
                        ? 'bg-acs-azul text-white'
                        : 'bg-white text-acs-ink border border-acs-line'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-acs-ink block mb-2">Observacao</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Observacoes sobre a visita..."
              className="w-full px-4 py-3 rounded-xl border border-acs-line bg-white text-acs-ink placeholder:text-acs-ink-4 focus:outline-none focus:ring-2 focus:ring-acs-azul resize-none"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-acs-line p-4 max-w-[800px] mx-auto">
        <button
          onClick={() => navigate(`/triagem/${paciente.id}/passo2`)}
          className="w-full py-3 bg-acs-azul text-white rounded-xl font-semibold hover:bg-acs-azul-900 transition-colors"
        >
          Proximo: Sintomas
        </button>
      </div>
    </div>
  );
}
