import { useEffect, useState } from 'react';
import { Bell, Stethoscope, Search, Calendar, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import { RiskBadge } from '../components/RiskBadge';
import { useAuthStore } from '@/store/authStore';
import { usuariosService, type UsuarioAPI } from '@/services/usuariosService';

function saudacao(nomeCompleto?: string) {
  const hora = new Date().getHours();
  const prefixo = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const primeiroNome = nomeCompleto?.trim().split(' ')[0] ?? '';
  return primeiroNome ? `${prefixo}, ${primeiroNome}` : prefixo;
}

function iniciais(nome?: string) {
  if (!nome) return '?';
  return nome.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

const PERFIL_LABEL: Record<string, string> = {
  acs:         'Agente Comunitário de Saúde',
  coordenador: 'Coordenador',
  gestor:      'Gestor',
};

export function Dashboard() {
  const navigate    = useNavigate();
  const usuarioAuth = useAuthStore((s) => s.usuario);
  const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);

  useEffect(() => {
    if (!usuarioAuth?.id) return;
    let cancelado = false;
    usuariosService.buscarPorId(usuarioAuth.id)
      .then(({ data }) => { if (!cancelado) setUsuario(data); })
      .catch(() => {/* mantém fallback do store */});
    return () => { cancelado = true; };
  }, [usuarioAuth?.id]);

  const nome     = usuario?.nome     ?? usuarioAuth?.nome;
  const perfil   = usuario?.perfil   ?? usuarioAuth?.perfil;
  const subtitulo = usuario?.microarea_nome
    ?? (usuario?.municipio_nome ? `${PERFIL_LABEL[perfil ?? ''] ?? perfil} — ${usuario.municipio_nome}` : PERFIL_LABEL[perfil ?? ''] ?? '');

  const alerts = [
    {
      id: 1,
      patient: 'Maria Silva',
      message: 'Alto risco, sem visita há 12 dias',
      level: 'urgent' as const
    },
    {
      id: 2,
      patient: 'João Pereira',
      message: 'Encaminhamento pendente há 5 dias',
      level: 'warning' as const
    },
    {
      id: 3,
      patient: 'Família Souza',
      message: '3 membros em risco moderado',
      level: 'warning' as const
    }
  ];

  const quickActions = [
    { icon: Stethoscope, label: 'Nova Triagem', path: '/pacientes' },
    { icon: Search, label: 'Buscar Paciente', path: '/pacientes' },
    { icon: Calendar, label: 'Minha Agenda', path: '/agenda' },
    { icon: ClipboardCheck, label: 'Encaminhamentos', path: '/encaminhamentos' }
  ];

  return (
    <div className="min-h-screen bg-[#F6F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#0066CC] flex items-center justify-center text-white font-semibold">
                {iniciais(nome)}
              </div>
              <div>
                <h2 className="font-bold text-[#0B1220] text-lg lg:text-xl">{saudacao(nome)}</h2>
                {subtitulo && <p className="text-sm text-[#64748B]">{subtitulo}</p>}
              </div>
            </div>
            <button className="relative lg:hidden" onClick={() => navigate('/alertas')}>
              <Bell size={24} color="#64748B" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white text-xs rounded-full flex items-center justify-center">
                7
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agenda do dia */}
            <div className="bg-[#0066CC] rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-white mb-4 text-lg">Agenda de hoje</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">8</div>
                  <div className="text-sm text-white/80">Planejadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">3</div>
                  <div className="text-sm text-white/80">Realizadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">2</div>
                  <div className="text-sm text-white/80">Urgentes</div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/agenda')}
                className="w-full py-3 bg-white/20 backdrop-blur text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                Ver agenda completa
              </button>
            </div>

            {/* Ações rápidas */}
            <div>
              <h3 className="font-semibold text-[#0B1220] mb-4 text-lg">Ações rápidas</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      className="bg-white rounded-xl p-4 lg:p-6 flex flex-col items-center gap-3 border border-[#DBEAFE] hover:border-[#0066CC] hover:shadow-lg transition-all"
                      style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}
                    >
                      <Icon size={28} color="#0066CC" strokeWidth={2} />
                      <span className="text-sm font-medium text-[#0B1220] text-center">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Coluna Lateral - Alertas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-[#DBEAFE] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#0B1220] text-lg">Alertas</h3>
                <span className="w-6 h-6 bg-[#EF4444] text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  7
                </span>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-[#F6F9FF] rounded-lg p-3 border-l-4"
                    style={{
                      borderLeftColor: alert.level === 'urgent' ? '#EF4444' : '#F59E0B'
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-[#0B1220] text-sm">{alert.patient}</p>
                      <RiskBadge level={alert.level} />
                    </div>
                    <p className="text-xs text-[#64748B]">{alert.message}</p>
                  </div>
                ))}
              </div>
              <button 
                className="w-full text-sm text-[#0066CC] font-medium mt-4 py-2 hover:bg-[#F0F9FF] rounded-lg transition-colors" 
                onClick={() => navigate('/alertas')}
              >
                Ver todos os alertas →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}