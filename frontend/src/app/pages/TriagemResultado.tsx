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

  // Avalia (preview) automaticamente ao entrar
  useEffect(() => {
    if (!paciente) return;
    if (Object.keys(sintomas).length === 0) return;
    if (resultado) return; // já tem resultado em memória

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
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#0B1220] mb-6">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="flex items-start gap-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl p-4">
          <AlertCircle size={18} className="text-[#92400E] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#92400E]">Triagem não iniciada.</p>
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
      // dá um respiro pro usuário ver o sucesso, depois volta pra perfil
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
        <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center">
          <CheckCircle2 size={32} className="text-[#10B981]" />
        </div>
        <h2 className="font-bold text-[#0B1220] text-lg text-center">Triagem salva com sucesso!</h2>
        <p className="text-sm text-[#64748B] text-center">Redirecionando...</p>
      </div>
    );
  }

  if (avaliando || !resultado) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-[#64748B]">
        <Loader2 size={24} className="animate-spin" />
        {erro ? (
          <p className="text-[#EF4444] text-sm px-6 text-center">{erro}</p>
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
    danger:  { bg: 'from-[#FEE2E2] to-[#FEF3C7]', border: '#EF4444', text: '#991B1B', iconColor: '#EF4444' },
    warning: { bg: 'from-[#FEF3C7] to-[#FEF9C3]', border: '#F59E0B', text: '#92400E', iconColor: '#F59E0B' },
    info:    { bg: 'from-[#DCFCE7] to-[#D1FAE5]', border: '#10B981', text: '#065F46', iconColor: '#10B981' },
  }[corPrio];

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} color="#0B1220" />
          </button>
          <div className="min-w-0">
            <h2 className="font-bold text-[#0B1220]">Resultado da Triagem</h2>
            <p className="text-sm text-[#64748B] truncate">
              {paciente.nome} • {new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-2 bg-[#0066CC] rounded-full" />
          <div className="flex-1 h-2 bg-[#0066CC] rounded-full" />
          <div className="flex-1 h-2 bg-[#0066CC] rounded-full" />
        </div>
        <p className="text-xs text-[#64748B] mt-2">3 de 3 — Resultado</p>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6">
        {erro && (
          <div className="flex items-start gap-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl p-4">
            <AlertCircle size={18} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#B91C1C]">{erro}</p>
          </div>
        )}

        {/* Card de prioridade */}
        <div
          className={`bg-gradient-to-br ${paleta.bg} rounded-xl p-6 border-2`}
          style={{ borderColor: paleta.border, boxShadow: `0 6px 18px ${paleta.border}40` }}
        >
          <div className="flex items-start gap-3">
            <Activity size={32} style={{ color: paleta.iconColor }} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-xl font-bold" style={{ color: paleta.text }}>{pLabel}</h3>
              <p className="text-sm mt-2" style={{ color: paleta.text }}>{aLabel}</p>
              {resultado.top_doenca && (
                <p className="text-xs mt-2 opacity-80" style={{ color: paleta.text }}>
                  Hipótese principal: <strong>{resultado.top_doenca.nome}</strong> ({resultado.top_doenca.score}%)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Condições mais prováveis */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Condições mais prováveis</h3>
          {topList.length === 0 ? (
            <p className="text-sm text-[#64748B]">Nenhuma condição com probabilidade significativa.</p>
          ) : (
            <div className="space-y-3">
              {topList.map((d) => {
                const color =
                  d.score >= 65 ? '#EF4444' :
                  d.score >= 35 ? '#F59E0B' : '#10B981';
                const badge =
                  d.label === 'Alta'  ? { bg: '#FEE2E2', text: '#991B1B' } :
                  d.label === 'Média' ? { bg: '#FEF3C7', text: '#92400E' } :
                                        { bg: '#D1FAE5', text: '#065F46' };

                return (
                  <div
                    key={d.id}
                    className="bg-white rounded-xl p-4 border border-[#DBEAFE]"
                    style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#0B1220] truncate">{d.nome}</h4>
                        {d.descricao && (
                          <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{d.descricao}</p>
                        )}
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {d.label}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-[#DBEAFE] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${d.score}%`, backgroundColor: color }}
                        />
                      </div>
                      <p className="text-xs text-[#64748B] mt-1">{d.score}% de compatibilidade</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumo do contexto */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Resumo da triagem</h3>
          <div
            className="bg-white rounded-xl p-4 border border-[#DBEAFE] space-y-2 text-sm"
            style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}
          >
            <p><span className="text-[#64748B]">Tipo de visita: </span><span className="font-medium text-[#0B1220]">{tipoVisita}</span></p>
            <p><span className="text-[#64748B]">Faixa etária: </span><span className="font-medium text-[#0B1220]">{paciente.faixaEtaria}</span></p>
            <p><span className="text-[#64748B]">Sintomas marcados: </span><span className="font-medium text-[#0B1220]">{Object.keys(sintomas).length}</span></p>
            <p><span className="text-[#64748B]">Fatores de risco: </span><span className="font-medium text-[#0B1220]">{riskFactors.length > 0 ? riskFactors.join(', ') : 'nenhum'}</span></p>
            {observacao && (
              <p><span className="text-[#64748B]">Observação: </span><span className="text-[#0B1220]">{observacao}</span></p>
            )}
          </div>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBEAFE] p-4 max-w-[800px] mx-auto">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/triagem/${paciente.id}/passo2`)}
            disabled={salvando}
            className="flex-1 py-3 bg-white text-[#0066CC] rounded-xl font-semibold border-2 border-[#0066CC] hover:bg-[#F6F9FF] transition-colors disabled:opacity-50"
          >
            Editar sintomas
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="flex-1 py-3 bg-[#0066CC] text-white rounded-xl font-semibold hover:bg-[#0052A3] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {salvando && <Loader2 size={18} className="animate-spin" />}
            {salvando ? 'Salvando...' : 'Salvar Triagem'}
          </button>
        </div>
      </div>
    </div>
  );
}
