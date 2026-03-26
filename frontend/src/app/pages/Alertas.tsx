import { ArrowLeft, AlertCircle, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Alertas() {
  const navigate = useNavigate();

  const alertasUrgentes = [
    {
      id: 1,
      paciente: 'Carlos Melo',
      mensagem: 'Encaminhamento sem retorno há 7 dias',
      tipo: 'urgent'
    },
    {
      id: 2,
      paciente: 'Maria Silva',
      mensagem: 'Alto risco, sem visita há 12 dias',
      tipo: 'urgent'
    }
  ];

  const alertasAtencao = [
    {
      id: 3,
      paciente: 'Família Rocha',
      mensagem: '2 crônicos sem visita há 30 dias',
      tipo: 'warning'
    },
    {
      id: 4,
      paciente: 'João Pereira',
      mensagem: 'Encaminhamento pendente há 5 dias',
      tipo: 'warning'
    },
    {
      id: 5,
      paciente: 'Ana Lima',
      mensagem: 'Renovação de receita necessária',
      tipo: 'warning'
    }
  ];

  const alertasInfo = [
    {
      id: 6,
      paciente: 'Campanha de vacinação',
      mensagem: '4 pacientes elegíveis na sua microárea',
      tipo: 'info'
    },
    {
      id: 7,
      paciente: 'Atualização do sistema',
      mensagem: 'Novos recursos disponíveis',
      tipo: 'info'
    }
  ];

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'urgent':
        return <AlertCircle size={24} className="text-[#EF4444]" />;
      case 'warning':
        return <Clock size={24} className="text-[#F59E0B]" />;
      case 'info':
        return <Info size={24} className="text-[#0066CC]" />;
      default:
        return null;
    }
  };

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case 'urgent':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#0066CC';
      default:
        return '#64748B';
    }
  };

  const AlertCard = ({ alerta }: { alerta: any }) => (
    <div
      className="bg-white rounded-xl p-4 border-l-4"
      style={{
        borderLeftColor: getAlertColor(alerta.tipo),
        boxShadow: '0 6px 18px rgba(16,25,40,0.04)'
      }}
    >
      <div className="flex items-start gap-3">
        {getAlertIcon(alerta.tipo)}
        <div className="flex-1">
          <h4 className="font-semibold text-[#0B1220] mb-1">{alerta.paciente}</h4>
          <p className="text-sm text-[#64748B] mb-3">{alerta.mensagem}</p>
          {alerta.tipo !== 'info' && (
            <button className="text-sm text-[#0066CC] font-medium">
              Agendar visita
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} color="#0B1220" />
          </button>
          <h2 className="font-bold text-[#0B1220]">Alertas</h2>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6">
        {/* Urgente - Hoje */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <h3 className="font-semibold text-[#0B1220]">Urgente — Hoje</h3>
          </div>
          <div className="space-y-3">
            {alertasUrgentes.map((alerta) => (
              <AlertCard key={alerta.id} alerta={alerta} />
            ))}
          </div>
        </div>

        {/* Atenção */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <h3 className="font-semibold text-[#0B1220]">Atenção</h3>
          </div>
          <div className="space-y-3">
            {alertasAtencao.map((alerta) => (
              <AlertCard key={alerta.id} alerta={alerta} />
            ))}
          </div>
        </div>

        {/* Informativos */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#0066CC]" />
            <h3 className="font-semibold text-[#0B1220]">Informativos</h3>
          </div>
          <div className="space-y-3">
            {alertasInfo.map((alerta) => (
              <AlertCard key={alerta.id} alerta={alerta} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
