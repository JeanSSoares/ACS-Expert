import { ArrowLeft, Search, ChevronDown, ChevronUp, AlertCircle, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useMemo, useState } from 'react';
import { useTriagemStore } from '@/store/triagemStore';
import type { SintomaCatalogo } from '@/services/triagensService';

const GROUP_ORDER = [
  'Sintomas Gerais',
  'Saude Mental',
  'Neurologico e Cabeca',
  'Visao e Olhos',
  'Ouvido, Nariz e Garganta (Otorrino)',
  'Cardiovascular',
  'Respiratorio',
  'Digestivo e Abdominal',
  'Urinario e Renal',
  'Genital e Reprodutivo',
  'Musculos e Articulacoes',
  'Pele e Cabelos',
];

export function TriagemPasso2() {
  const navigate = useNavigate();
  const {
    paciente, catalogo, sintomas, qualifiers,
    toggleSintoma, setIntensidade, toggleQualifier,
  } = useTriagemStore();

  const [busca, setBusca]           = useState('');
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null);
  const [quailAberto, setQuailAberto] = useState<string | null>(null);

  if (!paciente || !catalogo) {
    return (
      <div className="h-full flex flex-col p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-acs-ink mb-6">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="flex items-start gap-3 bg-acs-amar-100 border border-acs-amar/20 rounded-xl p-4">
          <AlertCircle size={18} className="text-[#A3740A] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#A3740A]">
            Triagem nao iniciada. Volte e inicie pelo passo 1.
          </p>
        </div>
      </div>
    );
  }

  const sintomasVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return catalogo.sintomas.filter((s) => {
      if (s.sexFilter && s.sexFilter !== paciente.sexo) return false;
      if (termo && !s.label.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [catalogo.sintomas, busca, paciente.sexo]);

  const sintomasPorGrupo = useMemo(() => {
    const mapa = new Map<string, SintomaCatalogo[]>();
    for (const s of sintomasVisiveis) {
      const g = s.group ?? 'Outros';
      if (!mapa.has(g)) mapa.set(g, []);
      mapa.get(g)!.push(s);
    }
    return mapa;
  }, [sintomasVisiveis]);

  const idsSelecionados = Object.keys(sintomas);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-acs-line px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-acs-ink" />
          </button>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-acs-ink">Nova Triagem</h2>
            <p className="text-sm text-acs-ink-3 truncate">
              {paciente.nome} • {paciente.idade} anos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-1.5 bg-acs-azul rounded-full" />
          <div className="flex-1 h-1.5 bg-acs-azul rounded-full" />
          <div className="flex-1 h-1.5 bg-acs-paper-2 rounded-full" />
        </div>
        <p className="eyebrow mt-2">2 de 3 — Sintomas e intensidade</p>
      </div>

      {/* Busca */}
      <div className="px-6 py-3 bg-white border-b border-acs-line">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-acs-ink-3" />
          <input
            type="text"
            placeholder="Buscar sintoma..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-acs-line bg-white text-acs-ink placeholder:text-acs-ink-4 focus:outline-none focus:ring-2 focus:ring-acs-azul"
          />
        </div>
      </div>

      {/* Chips dos selecionados + sliders de intensidade */}
      {idsSelecionados.length > 0 && (
        <div className="px-6 py-3 bg-acs-azul-050 border-b border-acs-line max-h-56 overflow-y-auto">
          <p className="eyebrow mb-2">
            {idsSelecionados.length} sintoma(s) selecionado(s)
          </p>
          <div className="space-y-2">
            {idsSelecionados.map((id) => {
              const sint = catalogo.sintomas.find((s) => s.id === id);
              const label = sint?.label ?? id;
              const intensidade = sintomas[id].intensity;
              const temQualificador = Boolean(catalogo.qualificadores[id]);
              const qualAtivos = Object.entries(qualifiers[id] ?? {}).filter(([, v]) => v).length;

              return (
                <div key={id} className="bg-white rounded-xl p-3 border border-acs-line">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-sm font-medium text-acs-ink truncate">{label}</span>
                    <button
                      onClick={() => toggleSintoma(id)}
                      className="text-acs-vermelho text-xs font-medium flex-shrink-0"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg, #2F9E6E 0%, #F2B134 50%, #E76F4A 100%)' }}>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={intensidade}
                        onChange={(e) => setIntensidade(id, Number(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="w-14 text-center">
                      <div className="text-lg font-display font-bold text-acs-azul">{intensidade}</div>
                      <div className="text-[10px] text-acs-ink-3 leading-none">intensidade</div>
                    </div>
                  </div>

                  {temQualificador && (
                    <button
                      onClick={() => setQuailAberto(quailAberto === id ? null : id)}
                      className="mt-2 text-xs font-medium text-acs-azul flex items-center gap-1"
                    >
                      {quailAberto === id ? <Minus size={12} /> : <Plus size={12} />}
                      Detalhes ({qualAtivos})
                    </button>
                  )}

                  {quailAberto === id && temQualificador && (
                    <div className="mt-2 pt-2 border-t border-acs-line space-y-1.5">
                      {catalogo.qualificadores[id]
                        .filter((q) => !q.sex || q.sex === paciente.sexo)
                        .map((q) => (
                          <label key={q.id} className="flex items-start gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={qualifiers[id]?.[q.id] ?? false}
                              onChange={() => toggleQualifier(id, q.id)}
                              className="mt-0.5 accent-acs-azul"
                            />
                            <span className="text-acs-ink">{q.label}</span>
                          </label>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de grupos */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 pb-28">
        {GROUP_ORDER.filter((g) => sintomasPorGrupo.has(g)).map((grupo) => {
          const lista = sintomasPorGrupo.get(grupo)!;
          const aberto = grupoAberto === grupo || busca.length > 0;
          return (
            <div key={grupo} className="bg-white rounded-2xl border border-acs-line overflow-hidden">
              <button
                onClick={() => setGrupoAberto(aberto ? null : grupo)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-acs-paper"
              >
                <span className="font-semibold text-acs-ink text-sm">{grupo}</span>
                <div className="flex items-center gap-2">
                  <span className="eyebrow">{lista.length}</span>
                  {aberto ? (
                    <ChevronUp size={18} className="text-acs-ink-3" />
                  ) : (
                    <ChevronDown size={18} className="text-acs-ink-3" />
                  )}
                </div>
              </button>

              {aberto && (
                <div className="px-4 pb-4 pt-2 border-t border-acs-line">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {lista.map((s) => {
                      const ativo = Boolean(sintomas[s.id]);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleSintoma(s.id)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-colors ${
                            ativo
                              ? 'bg-acs-azul text-white'
                              : 'bg-acs-paper text-acs-ink border border-acs-line'
                          }`}
                        >
                          {ativo && '✓ '}{s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {GROUP_ORDER.every((g) => !sintomasPorGrupo.has(g)) && (
          <p className="text-center text-acs-ink-3 text-sm py-8">
            Nenhum sintoma encontrado para "{busca}".
          </p>
        )}
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-acs-line p-4 max-w-[800px] mx-auto">
        <button
          onClick={() => navigate(`/triagem/${paciente.id}/resultado`)}
          disabled={idsSelecionados.length === 0}
          className="w-full py-3 bg-acs-azul text-white rounded-xl font-semibold hover:bg-acs-azul-900 transition-colors disabled:bg-acs-paper-2 disabled:text-acs-ink-3 disabled:cursor-not-allowed"
        >
          Avaliar ({idsSelecionados.length} sintoma{idsSelecionados.length === 1 ? '' : 's'})
        </button>
      </div>
    </div>
  );
}
