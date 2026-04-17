import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { BottomNav } from '../components/BottomNav';

export function Encaminhamentos() {
  const [activeTab, setActiveTab] = useState('todos');

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'pendentes', label: 'Pendentes' },
    { id: 'realizados', label: 'Realizados' },
    { id: 'ausencia', label: 'Ausencia' }
  ];

  const encaminhamentos = [
    { id: 1, paciente: 'Maria Silva', tipo: 'Consulta Medica', data: '15 mar 2026', status: 'pendente', diasPendente: 3 },
    { id: 2, paciente: 'Joao Pereira', tipo: 'Vacinacao', data: '10 mar 2026', status: 'realizado', dataRealizacao: '14 mar 2026' },
    { id: 3, paciente: 'Carlos Melo', tipo: 'Exame', data: '08 mar 2026', status: 'ausencia', diasPendente: 7 },
    { id: 4, paciente: 'Ana Costa', tipo: 'Enfermagem', data: '12 mar 2026', status: 'realizado', dataRealizacao: '13 mar 2026' },
    { id: 5, paciente: 'Pedro Santos', tipo: 'Consulta Medica', data: '16 mar 2026', status: 'pendente', diasPendente: 2 },
  ];

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Consulta Medica': return 'var(--acs-azul)';
      case 'Vacinacao': return 'var(--acs-verde)';
      case 'Exame': return 'var(--acs-amar)';
      case 'Enfermagem': return '#8B5CF6';
      default: return 'var(--acs-ink-3)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock size={20} className="text-acs-amar" />;
      case 'realizado': return <CheckCircle2 size={20} className="text-acs-verde" />;
      case 'ausencia': return <XCircle size={20} className="text-acs-vermelho" />;
      default: return null;
    }
  };

  const getStatusText = (enc: any) => {
    switch (enc.status) {
      case 'pendente': return `Pendente — ha ${enc.diasPendente} dias`;
      case 'realizado': return `Realizado — em ${enc.dataRealizacao}`;
      case 'ausencia': return 'Paciente nao compareceu';
      default: return '';
    }
  };

  const getStatusButton = (status: string) => {
    switch (status) {
      case 'pendente': return 'Registrar Retorno';
      case 'ausencia': return 'Agendar Nova Visita';
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col pb-16 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-acs-line px-6 py-4">
        <h2 className="font-display font-bold text-acs-ink mb-4">Encaminhamentos</h2>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-acs-ink text-acs-paper'
                  : 'bg-acs-paper-2 text-acs-ink-3 border border-acs-line'
              }`}
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
            className="card-acs p-4 border border-acs-line"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-acs-ink mb-1">{enc.paciente}</h3>

                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2.5 py-1 rounded-md font-mono text-[10px] font-semibold uppercase tracking-[.1em]"
                    style={{
                      backgroundColor: getTipoColor(enc.tipo) + '20',
                      color: getTipoColor(enc.tipo)
                    }}
                  >
                    {enc.tipo}
                  </span>
                  <span className="text-xs text-acs-ink-3">{enc.data}</span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(enc.status)}
                  <span className={`text-sm ${
                    enc.status === 'realizado' ? 'text-acs-verde' :
                    enc.status === 'ausencia' ? 'text-acs-vermelho' :
                    'text-acs-amar'
                  }`}>
                    {getStatusText(enc)}
                  </span>
                </div>
              </div>
            </div>

            {getStatusButton(enc.status) && (
              <button className="w-full py-2 bg-acs-azul text-white rounded-xl text-sm font-medium hover:bg-acs-azul-900 transition-colors">
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
