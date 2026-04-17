import { ArrowLeft, AlertCircle, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Alertas() {
  const navigate = useNavigate();

  const alertasUrgentes = [
    { id: 1, paciente: 'Carlos Melo', mensagem: 'Encaminhamento sem retorno ha 7 dias', tipo: 'urgent' },
    { id: 2, paciente: 'Maria Silva', mensagem: 'Alto risco, sem visita ha 12 dias', tipo: 'urgent' },
  ];

  const alertasAtencao = [
    { id: 3, paciente: 'Familia Rocha', mensagem: '2 cronicos sem visita ha 30 dias', tipo: 'warning' },
    { id: 4, paciente: 'Joao Pereira', mensagem: 'Encaminhamento pendente ha 5 dias', tipo: 'warning' },
    { id: 5, paciente: 'Ana Lima', mensagem: 'Renovacao de receita necessaria', tipo: 'warning' },
  ];

  const alertasInfo = [
    { id: 6, paciente: 'Campanha de vacinacao', mensagem: '4 pacientes elegiveis na sua microarea', tipo: 'info' },
    { id: 7, paciente: 'Atualizacao do sistema', mensagem: 'Novos recursos disponiveis', tipo: 'info' },
  ];

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'urgent': return <AlertCircle size={24} className="text-acs-vermelho" />;
      case 'warning': return <Clock size={24} className="text-acs-amar" />;
      case 'info': return <Info size={24} className="text-acs-azul" />;
      default: return null;
    }
  };

  const getAlertBorderClass = (tipo: string) => {
    switch (tipo) {
      case 'urgent': return 'border-l-acs-vermelho';
      case 'warning': return 'border-l-acs-amar';
      case 'info': return 'border-l-acs-azul';
      default: return 'border-l-acs-ink-3';
    }
  };

  const getAlertDotClass = (tipo: string) => {
    switch (tipo) {
      case 'urgent': return 'bg-acs-vermelho';
      case 'warning': return 'bg-acs-amar';
      case 'info': return 'bg-acs-azul';
      default: return 'bg-acs-ink-3';
    }
  };

  const AlertCard = ({ alerta }: { alerta: any }) => (
    <div className={`bg-white rounded-xl p-3.5 border-l-[3px] shadow-[0_1px_2px_rgba(10,20,40,.06)] ${getAlertBorderClass(alerta.tipo)}`}>
      <div className="flex items-start gap-3">
        {getAlertIcon(alerta.tipo)}
        <div className="flex-1">
          <h4 className="font-semibold text-acs-ink mb-1">{alerta.paciente}</h4>
          <p className="text-sm text-acs-ink-3 mb-3">{alerta.mensagem}</p>
          {alerta.tipo !== 'info' && (
            <button className="text-sm text-acs-azul font-medium">
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
      <div className="bg-white border-b border-acs-line px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-acs-ink" />
          </button>
          <h2 className="font-display font-bold text-acs-ink">Alertas</h2>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6">
        {/* Urgente */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${getAlertDotClass('urgent')}`} />
            <h3 className="font-display font-semibold text-acs-ink">Urgente — Hoje</h3>
          </div>
          <div className="space-y-3">
            {alertasUrgentes.map((alerta) => (
              <AlertCard key={alerta.id} alerta={alerta} />
            ))}
          </div>
        </div>

        {/* Atencao */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${getAlertDotClass('warning')}`} />
            <h3 className="font-display font-semibold text-acs-ink">Atencao</h3>
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
            <div className={`w-2 h-2 rounded-full ${getAlertDotClass('info')}`} />
            <h3 className="font-display font-semibold text-acs-ink">Informativos</h3>
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
