import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { BottomNav } from '../components/BottomNav';

export function Encaminhamentos() {
  const [activeTab, setActiveTab] = useState('todos');

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'pendentes', label: 'Pendentes' },
    { id: 'realizados', label: 'Realizados' },
    { id: 'ausencia', label: 'Ausência' }
  ];

  const encaminhamentos = [
    {
      id: 1,
      paciente: 'Maria Silva',
      tipo: 'Consulta Médica',
      data: '15 mar 2026',
      status: 'pendente',
      diasPendente: 3
    },
    {
      id: 2,
      paciente: 'João Pereira',
      tipo: 'Vacinação',
      data: '10 mar 2026',
      status: 'realizado',
      dataRealizacao: '14 mar 2026'
    },
    {
      id: 3,
      paciente: 'Carlos Melo',
      tipo: 'Exame',
      data: '08 mar 2026',
      status: 'ausencia',
      diasPendente: 7
    },
    {
      id: 4,
      paciente: 'Ana Costa',
      tipo: 'Enfermagem',
      data: '12 mar 2026',
      status: 'realizado',
      dataRealizacao: '13 mar 2026'
    },
    {
      id: 5,
      paciente: 'Pedro Santos',
      tipo: 'Consulta Médica',
      data: '16 mar 2026',
      status: 'pendente',
      diasPendente: 2
    }
  ];

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Consulta Médica': return '#0066CC';
      case 'Vacinação': return '#10B981';
      case 'Exame': return '#F59E0B';
      case 'Enfermagem': return '#8B5CF6';
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock size={20} className="text-[#F59E0B]" />;
      case 'realizado':
        return <CheckCircle2 size={20} className="text-[#10B981]" />;
      case 'ausencia':
        return <XCircle size={20} className="text-[#EF4444]" />;
      default:
        return null;
    }
  };

  const getStatusText = (enc: any) => {
    switch (enc.status) {
      case 'pendente':
        return `Pendente — há ${enc.diasPendente} dias`;
      case 'realizado':
        return `Realizado — em ${enc.dataRealizacao}`;
      case 'ausencia':
        return 'Paciente não compareceu';
      default:
        return '';
    }
  };

  const getStatusButton = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Registrar Retorno';
      case 'ausencia':
        return 'Agendar Nova Visita';
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col pb-16 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4">
        <h2 className="font-bold text-[#0B1220] mb-4">Encaminhamentos</h2>
        
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                backgroundColor: activeTab === tab.id ? '#0066CC' : '#F6F9FF',
                color: activeTab === tab.id ? '#FFFFFF' : '#64748B',
                border: activeTab === tab.id ? 'none' : '1px solid #DBEAFE'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de encaminhamentos */}
      <div className="flex-1 px-6 py-4 space-y-3">
        {encaminhamentos.map((enc) => (
          <div
            key={enc.id}
            className="bg-white rounded-xl p-4 border border-[#DBEAFE]"
            style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-[#0B1220] mb-1">{enc.paciente}</h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: getTipoColor(enc.tipo) + '20',
                      color: getTipoColor(enc.tipo)
                    }}
                  >
                    {enc.tipo}
                  </span>
                  <span className="text-xs text-[#64748B]">{enc.data}</span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(enc.status)}
                  <span className={`text-sm ${
                    enc.status === 'realizado' ? 'text-[#10B981]' :
                    enc.status === 'ausencia' ? 'text-[#EF4444]' :
                    'text-[#F59E0B]'
                  }`}>
                    {getStatusText(enc)}
                  </span>
                </div>
              </div>
            </div>

            {getStatusButton(enc.status) && (
              <button className="w-full py-2 bg-[#0066CC] text-white rounded-lg text-sm font-medium hover:bg-[#0052A3] transition-colors">
                {getStatusButton(enc.status)}
              </button>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
