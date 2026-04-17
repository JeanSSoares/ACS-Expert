import { ArrowLeft, AlertCircle, CheckCircle2, Loader2, Activity } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useTriagemStore } from '@/store/triagemStore';
import {
  triagensService,
  labelPrioridade,
  labelAcao,
  corPrioridade,
  type TriagemResultadoAPI,
} from '@/services/triagensService';

export function TriagemResultado() {
  const navigate = useNavigate();
  const {
    paciente, tipoVisita, observacao, riskFactors,
    sintomas, qualifiers, resultado, setResultado, reset,
  } = useTriagemStore();

  const [avaliando, setAvaliando] = useState(false);
  const [salvando, setSalvando]   = useState(false);
  const [erro, setErro]           = useState<string | null>(null);
  const [sucesso, setSucesso]     = useState(false);

  useEffect(() => {
    if (!paciente) return;
    if (Object.keys(sintomas).length === 0) return;
    if (resultado) return;

    let cancelado = false;
    async function avaliar() {
      setAvaliando(true);
      setErro(null);
      try {
        const { data } = await triagensService.avaliar({
          faixa_etaria: paciente!.faixaEtaria,
          sexo:         paciente!.sexo,
          sintomas,
          riskFactors,
          qualifiers,
        });
        if (!cancelado) setResultado(data);
      } catch (err: any) {
        if (!cancelado) {
          setErro(err?.response?.data?.message ?? 'Erro ao avaliar triagem.');
        }
      } finally {
        if (!cancelado) setAvaliando(false);
      }
    }
    avaliar();
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paciente?.id]);

  if (!paciente) {
    return (
      <div className="h-full flex flex-col p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-acs-ink mb-6">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="flex items-start gap-3 bg-acs-amar-100 border border-acs-amar/20 rounded-xl p-4">
          <AlertCircle size={18} className="text-[#A3740A] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#A3740A]">Triagem nao iniciada.</p>
        </div>
      </div>
    );
  }

  async function handleSalvar() {
    if (!paciente) return;
    setSalvando(true);
    setErro(null);
    try {
      await triagensService.criar({
        paciente_id: paciente.id,
        payload: {
          faixa_etaria: paciente.faixaEtaria,
          sexo:         paciente.sexo,
          sintomas,
          riskFactors,
          qualifiers,
        },
      });
      setSucesso(true);
      setTimeout(() => {
        reset();
        navigate(`/paciente/${paciente.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('[TriagemResultado] Falha ao salvar:', err);
      const data   = err?.response?.data;
      const msg    = data?.message ?? err?.message ?? 'Erro ao salvar triagem.';
      const detail = data?.error ? ` (${data.error})` : '';
      setErro(msg + detail);
    } finally {
      setSalvando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-16 h-16 rounded-full bg-acs-verde-100 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-acs-verde" />
        </div>
        <h2 className="font-display font-bold text-acs-ink text-lg text-center">Triagem salva com sucesso!</h2>
        <p className="text-sm text-acs-ink-3 text-center">Redirecionando...</p>
      </div>
    );
  }

  if (avaliando || !resultado) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-acs-ink-3">
        <Loader2 size={24} className="animate-spin" />
        {erro ? (
          <p className="text-acs-vermelho text-sm px-6 text-center">{erro}</p>
        ) : (
          <p className="text-sm">Avaliando sintomas...</p>
        )}
      </div>
    );
  }

  const prio     = resultado.nivel_prioridade;
  const corPrio  = corPrioridade(prio);
  const pLabel   = labelPrioridade(prio);
  const aLabel   = labelAcao(resultado.acao_recomendada);
  const topList  = resultado.computed.slice(0, 8);

  const paleta = {
    danger:  { bg: 'bg-acs-vermelho',  text: 'text-white', iconColor: '#fff' },
    warning: { bg: 'bg-acs-amar',      text: 'text-white', iconColor: '#fff' },
    info:    { bg: 'bg-acs-verde',     text: 'text-white', iconColor: '#fff' },
  }[corPrio];

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-white border-b border-acs-line px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-acs-ink" />
          </button>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-acs-ink">Resultado da Triagem</h2>
            <p className="text-sm text-acs-ink-3 truncate">
              {paciente.nome} • {new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-1.5 bg-acs-azul rounded-full" />
          <div className="flex-1 h-1.5 bg-acs-azul rounded-full" />
          <div className="flex-1 h-1.5 bg-acs-azul rounded-full" />
        </div>
        <p className="eyebrow mt-2">3 de 3 — Resultado</p>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6">
        {erro && (
          <div className="flex items-start gap-3 bg-acs-vermelho-100 border border-acs-vermelho/20 rounded-xl p-4">
            <AlertCircle size={18} className="text-acs-vermelho flex-shrink-0 mt-0.5" />
            <p className="text-sm text-acs-vermelho">{erro}</p>
          </div>
        )}

        {/* Card de prioridade */}
        <div className={`${paleta.bg} rounded-[22px] p-5`}>
          <div className="mb-3">
            <span className="inline-block px-2.5 py-1 rounded-md bg-black/20 font-mono text-[10px] font-semibold uppercase tracking-[.1em] text-white">
              {pLabel}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <Activity size={32} style={{ color: paleta.iconColor }} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className={`text-[30px] font-display font-semibold leading-tight ${paleta.text}`}>{pLabel}</h3>
              <p className={`text-sm mt-2 ${paleta.text} opacity-90`}>{aLabel}</p>
              {resultado.top_doenca && (
                <p className={`text-xs mt-2 opacity-80 ${paleta.text}`}>
                  Hipotese principal: <strong>{resultado.top_doenca.nome}</strong> ({resultado.top_doenca.score}%)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Condicoes mais provaveis */}
        <div>
          <h3 className="font-display font-semibold text-acs-ink mb-3">Condicoes mais provaveis</h3>
          {topList.length === 0 ? (
            <p className="text-sm text-acs-ink-3">Nenhuma condicao com probabilidade significativa.</p>
          ) : (
            <div className="space-y-3">
              {topList.map((d) => {
                const color =
                  d.score >= 65 ? 'bg-acs-vermelho' :
                  d.score >= 35 ? 'bg-acs-amar' : 'bg-acs-verde';

                return (
                  <div
                    key={d.id}
                    className="card-acs p-4 border border-acs-line"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-acs-ink truncate">{d.nome}</h4>
                        {d.descricao && (
                          <p className="text-xs text-acs-ink-3 mt-1 line-clamp-2">{d.descricao}</p>
                        )}
                      </div>
                      <RiskBadgeInline label={d.label} />
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-acs-paper-2 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${color}`}
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-acs-ink-3 mt-1 font-mono">{d.score}% de compatibilidade</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumo do contexto */}
        <div>
          <h3 className="font-display font-semibold text-acs-ink mb-3">Resumo da triagem</h3>
          <div className="card-acs p-4 border border-acs-line space-y-2 text-sm">
            <p><span className="text-acs-ink-3">Tipo de visita: </span><span className="font-medium text-acs-ink">{tipoVisita}</span></p>
            <p><span className="text-acs-ink-3">Faixa etaria: </span><span className="font-medium text-acs-ink">{paciente.faixaEtaria}</span></p>
            <p><span className="text-acs-ink-3">Sintomas marcados: </span><span className="font-medium text-acs-ink">{Object.keys(sintomas).length}</span></p>
            <p><span className="text-acs-ink-3">Fatores de risco: </span><span className="font-medium text-acs-ink">{riskFactors.length > 0 ? riskFactors.join(', ') : 'nenhum'}</span></p>
            {observacao && (
              <p><span className="text-acs-ink-3">Observacao: </span><span className="text-acs-ink">{observacao}</span></p>
            )}
          </div>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-acs-line p-4 max-w-[800px] mx-auto">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/triagem/${paciente.id}/passo2`)}
            disabled={salvando}
            className="flex-1 py-3 bg-white text-acs-azul rounded-xl font-semibold border border-acs-azul hover:bg-acs-azul-050 transition-colors disabled:opacity-50"
          >
            Editar sintomas
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="flex-1 py-3 bg-acs-coral text-white rounded-xl font-semibold hover:brightness-95 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(231,111,74,.3)]"
          >
            {salvando && <Loader2 size={18} className="animate-spin" />}
            {salvando ? 'Salvando...' : 'Salvar Triagem'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RiskBadgeInline({ label }: { label: string }) {
  const cfg =
    label === 'Alta'  ? 'bg-acs-vermelho-100 text-acs-vermelho' :
    label === 'Media' || label === 'Média' ? 'bg-acs-amar-100 text-[#A3740A]' :
                         'bg-acs-verde-100 text-[#1E6B48]';
  return (
    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold uppercase tracking-[.1em] flex-shrink-0 ${cfg}`}>
      {label}
    </span>
  );
}
