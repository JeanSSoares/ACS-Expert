import { ArrowLeft, Search, ChevronDown, ChevronUp, AlertCircle, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useMemo, useState } from 'react';
import { useTriagemStore } from '@/store/triagemStore';
import type { SintomaCatalogo } from '@/services/triagensService';

const GROUP_ORDER = [
  'Sintomas Gerais',
  'Saúde Mental',
  'Neurológico e Cabeça',
  'Visão e Olhos',
  'Ouvido, Nariz e Garganta (Otorrino)',
  'Cardiovascular',
  'Respiratório',
  'Digestivo e Abdominal',
  'Urinário e Renal',
  'Genital e Reprodutivo',
  'Músculos e Articulações',
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

  // Se caiu direto nesta página sem passar pelo passo 1
  if (!paciente || !catalogo) {
    return (
      <div className="h-full flex flex-col p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#0B1220] mb-6">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="flex items-start gap-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl p-4">
          <AlertCircle size={18} className="text-[#92400E] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#92400E]">
            Triagem não iniciada. Volte e inicie pelo passo 1.
          </p>
        </div>
      </div>
    );
  }

  // Filtra por sexo e por texto de busca
  const sintomasVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return catalogo.sintomas.filter((s) => {
      if (s.sexFilter && s.sexFilter !== paciente.sexo) return false;
      if (termo && !s.label.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [catalogo.sintomas, busca, paciente.sexo]);

  // Agrupa
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
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} color="#0B1220" />
          </button>
          <div className="min-w-0">
            <h2 className="font-bold text-[#0B1220]">Nova Triagem</h2>
            <p className="text-sm text-[#64748B] truncate">
              {paciente.nome} • {paciente.idade} anos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-2 bg-[#0066CC] rounded-full" />
          <div className="flex-1 h-2 bg-[#0066CC] rounded-full" />
          <div className="flex-1 h-2 bg-[#DBEAFE] rounded-full" />
        </div>
        <p className="text-xs text-[#64748B] mt-2">2 de 3 — Sintomas e intensidade</p>
      </div>

      {/* Busca */}
      <div className="px-6 py-3 bg-white border-b border-[#DBEAFE]">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Buscar sintoma..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
          />
        </div>
      </div>

      {/* Chips dos selecionados + sliders de intensidade */}
      {idsSelecionados.length > 0 && (
        <div className="px-6 py-3 bg-[#F0F9FF] border-b border-[#DBEAFE] max-h-56 overflow-y-auto">
          <p className="text-xs font-semibold text-[#64748B] mb-2">
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
                <div key={id} className="bg-white rounded-lg p-3 border border-[#DBEAFE]">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-sm font-medium text-[#0B1220] truncate">{label}</span>
                    <button
                      onClick={() => toggleSintoma(id)}
                      className="text-[#EF4444] text-xs font-medium flex-shrink-0"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={intensidade}
                      onChange={(e) => setIntensidade(id, Number(e.target.value))}
                      className="flex-1 accent-[#0066CC]"
                    />
                    <div className="w-14 text-center">
                      <div className="text-lg font-bold text-[#0066CC]">{intensidade}</div>
                      <div className="text-[10px] text-[#64748B] leading-none">intensidade</div>
                    </div>
                  </div>

                  {temQualificador && (
                    <button
                      onClick={() => setQuailAberto(quailAberto === id ? null : id)}
                      className="mt-2 text-xs font-medium text-[#0066CC] flex items-center gap-1"
                    >
                      {quailAberto === id ? <Minus size={12} /> : <Plus size={12} />}
                      Detalhes ({qualAtivos})
                    </button>
                  )}

                  {quailAberto === id && temQualificador && (
                    <div className="mt-2 pt-2 border-t border-[#DBEAFE] space-y-1.5">
                      {catalogo.qualificadores[id]
                        .filter((q) => !q.sex || q.sex === paciente.sexo)
                        .map((q) => (
                          <label key={q.id} className="flex items-start gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={qualifiers[id]?.[q.id] ?? false}
                              onChange={() => toggleQualifier(id, q.id)}
                              className="mt-0.5 accent-[#0066CC]"
                            />
                            <span className="text-[#0B1220]">{q.label}</span>
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
          const aberto = grupoAberto === grupo || busca.length > 0; // expande tudo quando tem busca
          return (
            <div key={grupo} className="bg-white rounded-xl border border-[#DBEAFE] overflow-hidden">
              <button
                onClick={() => setGrupoAberto(aberto ? null : grupo)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F6F9FF]"
              >
                <span className="font-semibold text-[#0B1220] text-sm">{grupo}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B]">{lista.length}</span>
                  {aberto ? (
                    <ChevronUp size={18} className="text-[#64748B]" />
                  ) : (
                    <ChevronDown size={18} className="text-[#64748B]" />
                  )}
                </div>
              </button>

              {aberto && (
                <div className="px-4 pb-4 pt-2 border-t border-[#DBEAFE]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {lista.map((s) => {
                      const ativo = Boolean(sintomas[s.id]);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleSintoma(s.id)}
                          className="px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors"
                          style={{
                            backgroundColor: ativo ? '#0066CC' : '#F6F9FF',
                            color: ativo ? '#FFFFFF' : '#0B1220',
                            border: ativo ? 'none' : '1px solid #DBEAFE',
                          }}
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
          <p className="text-center text-[#64748B] text-sm py-8">
            Nenhum sintoma encontrado para "{busca}".
          </p>
        )}
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBEAFE] p-4 max-w-[800px] mx-auto">
        <button
          onClick={() => navigate(`/triagem/${paciente.id}/resultado`)}
          disabled={idsSelecionados.length === 0}
          className="w-full py-3 bg-[#0066CC] text-white rounded-xl font-semibold hover:bg-[#0052A3] transition-colors disabled:bg-[#DBEAFE] disabled:text-[#64748B] disabled:cursor-not-allowed"
        >
          Avaliar ({idsSelecionados.length} sintoma{idsSelecionados.length === 1 ? '' : 's'})
        </button>
      </div>
    </div>
  );
}
