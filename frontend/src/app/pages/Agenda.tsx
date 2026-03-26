import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MapaVisitas } from '../components/MapaVisitas';
import { useState } from 'react';

export function Agenda() {
  const navigate = useNavigate();
  const [visualizacao, setVisualizacao] = useState<'lista' | 'mapa'>('lista');
  const [rotaOtimizada, setRotaOtimizada] = useState(false);

  const visitasIniciais = [
    {
      id: 1,
      ordem: 1,
      prioridade: 'urgent' as const,
      paciente: 'Maria Silva',
      endereco: 'Rua das Flores, 123',
      distancia: '350m',
      razao: 'Sem visita há 14 dias — Alto risco',
      status: 'pendente',
      lat: -23.5505,
      lng: -46.6333,
      distanciaMetros: 350
    },
    {
      id: 2,
      ordem: 2,
      prioridade: 'urgent' as const,
      paciente: 'Carlos Melo',
      endereco: 'Av. Brasil, 456',
      distancia: '520m',
      razao: 'Encaminhamento pendente',
      status: 'pendente',
      lat: -23.5515,
      lng: -46.6355,
      distanciaMetros: 520
    },
    {
      id: 3,
      ordem: 3,
      prioridade: 'warning' as const,
      paciente: 'João Pereira',
      endereco: 'Rua Santos, 789',
      distancia: '1.2km',
      razao: 'Paciente crônico',
      status: 'realizada',
      lat: -23.5490,
      lng: -46.6370,
      distanciaMetros: 1200
    },
    {
      id: 4,
      ordem: 4,
      prioridade: 'low' as const,
      paciente: 'Ana Costa',
      endereco: 'Rua das Acácias, 321',
      distancia: '800m',
      razao: 'Visita de rotina',
      status: 'realizada',
      lat: -23.5525,
      lng: -46.6320,
      distanciaMetros: 800
    }
  ];

  const [visitas, setVisitas] = useState(visitasIniciais);

  const otimizarRota = () => {
    // Algoritmo simples de otimização: ordenar por prioridade e depois por distância
    const visitasPendentes = visitas.filter(v => v.status === 'pendente');
    const visitasRealizadas = visitas.filter(v => v.status === 'realizada');

    // Ordenar pendentes: urgentes primeiro, depois por distância
    const visitasOrdenadas = visitasPendentes.sort((a, b) => {
      // Prioridade: urgent > warning > low
      const prioridadeOrder = { urgent: 0, warning: 1, low: 2 };
      const diffPrioridade = prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade];
      
      if (diffPrioridade !== 0) return diffPrioridade;
      
      // Se mesma prioridade, ordenar por distância
      return a.distanciaMetros - b.distanciaMetros;
    });

    // Recalcular ordem
    const visitasComNovaOrdem = [
      ...visitasOrdenadas.map((v, idx) => ({ ...v, ordem: idx + 1 })),
      ...visitasRealizadas.map((v, idx) => ({ ...v, ordem: visitasOrdenadas.length + idx + 1 }))
    ];

    setVisitas(visitasComNovaOrdem);
    setRotaOtimizada(true);
    
    // Mudar para visualização de mapa quando otimizar rota
    setVisualizacao('mapa');
    
    // Resetar feedback visual após 5 segundos
    setTimeout(() => setRotaOtimizada(false), 5000);
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgent': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#0066CC';
    }
  };

  const getPrioridadeLabel = (prioridade: string) => {
    switch (prioridade) {
      case 'urgent': return 'URGENTE';
      case 'warning': return 'ATENÇÃO';
      case 'low': return 'ROTINA';
      default: return 'NORMAL';
    }
  };

  return (
    <div className="h-full flex flex-col pb-16 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-[#0B1220]">Agenda do Dia</h2>
            <p className="text-sm text-[#64748B]">19 de março de 2026</p>
          </div>
          
          <div className="flex gap-2">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                visualizacao === 'lista' 
                  ? 'bg-[#0066CC] text-white' 
                  : 'bg-white text-[#64748B] border border-[#DBEAFE]'
              }`}
              onClick={() => setVisualizacao('lista')}
            >
              Lista
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                visualizacao === 'mapa' 
                  ? 'bg-[#0066CC] text-white' 
                  : 'bg-white text-[#64748B] border border-[#DBEAFE]'
              }`}
              onClick={() => setVisualizacao('mapa')}
            >
              Mapa
            </button>
          </div>
        </div>

        {/* Métricas */}
        <div className="flex gap-3">
          <div className="flex-1 bg-[#F6F9FF] rounded-lg px-3 py-2 text-center">
            <div className="text-xl font-bold text-[#0066CC]">8</div>
            <div className="text-xs text-[#64748B]">Total</div>
          </div>
          <div className="flex-1 bg-[#D1FAE5] rounded-lg px-3 py-2 text-center">
            <div className="text-xl font-bold text-[#10B981]">3</div>
            <div className="text-xs text-[#065F46]">Realizadas</div>
          </div>
          <div className="flex-1 bg-[#FEE2E2] rounded-lg px-3 py-2 text-center">
            <div className="text-xl font-bold text-[#EF4444]">2</div>
            <div className="text-xs text-[#991B1B]">Urgentes</div>
          </div>
        </div>
      </div>

      {/* Lista de visitas */}
      {visualizacao === 'lista' && (
        <div className="flex-1 px-6 py-4 space-y-3">
          {visitas.map((visita) => (
            <div
              key={visita.id}
              className={`bg-white rounded-xl p-4 border-l-4 ${visita.status === 'realizada' ? 'opacity-60' : ''}`}
              style={{
                borderLeftColor: getPrioridadeColor(visita.prioridade),
                boxShadow: '0 6px 18px rgba(16,25,40,0.04)'
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: getPrioridadeColor(visita.prioridade) }}
                >
                  {visita.ordem}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-[#0B1220]">{visita.paciente}</h3>
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor: getPrioridadeColor(visita.prioridade) + '20',
                        color: getPrioridadeColor(visita.prioridade)
                      }}
                    >
                      {getPrioridadeLabel(visita.prioridade)}
                    </span>
                  </div>

                  <p className="text-sm text-[#64748B] mb-1">{visita.endereco}</p>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs text-[#64748B] flex items-center gap-1">
                      <MapPin size={12} />
                      {visita.distancia}
                    </span>
                    <span className="text-xs text-[#64748B]">{visita.razao}</span>
                  </div>

                  {visita.status === 'realizada' ? (
                    <div className="flex items-center gap-2 text-sm text-[#10B981]">
                      <span>✓</span>
                      <span className="font-medium">Realizada</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/paciente/${visita.id}`)}
                        className="flex-1 py-2 bg-[#0066CC] text-white rounded-lg text-sm font-medium hover:bg-[#0052A3] transition-colors"
                      >
                        Iniciar
                      </button>
                      <button className="px-4 py-2 bg-[#FEF3C7] text-[#92400E] rounded-lg text-sm font-medium hover:bg-[#FDE68A] transition-colors">
                        Adiar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mapa de visitas */}
      {visualizacao === 'mapa' && (
        <div className="flex-1 px-6 py-4">
          <MapaVisitas visitas={visitas} mostrarRota={rotaOtimizada} />
          
          {/* Legenda do mapa */}
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border border-[#DBEAFE]">
            <h3 className="text-sm font-semibold text-[#0B1220] mb-3">Legenda</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#EF4444] flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow">1</div>
                <span className="text-xs text-[#64748B]">Urgente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#F59E0B] flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow">2</div>
                <span className="text-xs text-[#64748B]">Atenção</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow">3</div>
                <span className="text-xs text-[#64748B]">Rotina</span>
              </div>
              {rotaOtimizada && (
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-6 bg-[#0066CC] opacity-80" style={{ borderTop: '3px dashed #0066CC' }}></div>
                  <span className="text-xs text-[#64748B]">Rota Otimizada</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        className="fixed bottom-24 right-8 flex items-center gap-2 px-4 py-3 bg-[#0066CC] rounded-full shadow-lg text-white font-semibold hover:bg-[#0052A3] transition-colors"
        onClick={otimizarRota}
      >
        <MapPin size={20} />
        Otimizar Rota
      </button>

      {rotaOtimizada && (
        <div className="fixed bottom-36 right-8 px-4 py-2 bg-[#10B981] text-white rounded-full shadow-lg font-semibold text-sm animate-slide-up flex items-center gap-2">
          <span>✓</span>
          Rota Otimizada!
        </div>
      )}
    </div>
  );
}