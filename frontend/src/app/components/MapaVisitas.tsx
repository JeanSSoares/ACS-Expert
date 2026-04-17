import { MapPin } from 'lucide-react';

interface Visita {
  id: number;
  ordem: number;
  prioridade: 'urgent' | 'warning' | 'low';
  paciente: string;
  endereco: string;
  distancia: string;
  razao: string;
  status: string;
  lat: number;
  lng: number;
}

interface MapaVisitasProps {
  visitas: Visita[];
  mostrarRota?: boolean;
}

export function MapaVisitas({ visitas, mostrarRota = false }: MapaVisitasProps) {
  // Calcular limites do mapa
  const lats = visitas.map(v => v.lat);
  const lngs = visitas.map(v => v.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Normalizar coordenadas para o canvas (0-100%)
  const normalizePosition = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 80 + 10; // 10% margin
    const y = ((maxLat - lat) / (maxLat - minLat)) * 80 + 10; // invertido porque Y cresce para baixo
    return { x, y };
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgent': return 'var(--acs-vermelho)';
      case 'warning': return 'var(--acs-amar)';
      case 'low': return 'var(--acs-verde)';
      default: return 'var(--acs-azul)';
    }
  };

  // Criar linha de rota para visitas pendentes
  const visitasPendentes = visitas.filter(v => v.status === 'pendente');
  const rotaPoints = visitasPendentes.map(v => normalizePosition(v.lat, v.lng));
  
  // Criar path SVG para a linha tracejada
  const rotaPath = rotaPoints.length > 1 
    ? `M ${rotaPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`
    : '';

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border-2 border-acs-line bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] relative">
      {/* Grid de fundo para simular mapa */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--acs-azul)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Elementos decorativos de ruas */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-acs-ink-3"></div>
        <div className="absolute top-2/4 left-0 right-0 h-1 bg-acs-ink-3"></div>
        <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-acs-ink-3"></div>
        <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-acs-ink-3"></div>
        <div className="absolute top-0 bottom-0 left-2/4 w-1 bg-acs-ink-3"></div>
        <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-acs-ink-3"></div>
      </div>

      {/* SVG para linha de rota */}
      {mostrarRota && rotaPoints.length > 1 && (
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <path
            d={rotaPath}
            fill="none"
            stroke="var(--acs-azul)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity="0.8"
          />
        </svg>
      )}

      {/* Marcadores de visitas */}
      {visitas.map((visita) => {
        const pos = normalizePosition(visita.lat, visita.lng);
        const color = getPrioridadeColor(visita.prioridade);
        
        return (
          <div
            key={visita.id}
            className="absolute group cursor-pointer transition-transform hover:scale-110"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Marcador */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-3 border-white shadow-lg relative z-10"
              style={{ backgroundColor: color }}
            >
              {visita.ordem}
            </div>
            
            {/* Tooltip ao hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              <div className="bg-white rounded-xl shadow-xl p-3 min-w-[200px] border border-acs-line">
                <div className="font-bold text-acs-ink text-sm mb-1">{visita.paciente}</div>
                <div className="text-acs-ink-3 text-xs mb-1">{visita.endereco}</div>
                <div className="text-acs-ink-3 text-xs mb-1">{visita.razao}</div>
                <div className="text-acs-ink-3 text-xs mb-2">
                  <MapPin size={10} className="inline mr-1" />
                  {visita.distancia}
                </div>
                {visita.status === 'realizada' ? (
                  <div className="text-acs-verde text-xs font-medium">✓ Realizada</div>
                ) : (
                  <div className="text-acs-azul text-xs font-medium">Pendente</div>
                )}
                {/* Seta do tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                  <div className="border-8 border-transparent border-t-white"></div>
                </div>
              </div>
            </div>

            {/* Pulse animation para visitas pendentes */}
            {visita.status === 'pendente' && (
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ backgroundColor: color }}
              ></div>
            )}
          </div>
        );
      })}

      {/* Legenda no canto */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-acs-line">
        <div className="text-xs font-semibold text-acs-ink mb-1 font-display">Mapa de Visitas</div>
        <div className="text-xs text-acs-ink-3">Area de cobertura</div>
      </div>
    </div>
  );
}
