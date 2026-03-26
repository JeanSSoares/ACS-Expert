import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { RiskBadge } from '../components/RiskBadge';

export function PerfilPaciente() {
  const navigate = useNavigate();
  const { id } = useParams();

  const comorbidades = ['Hipertensa', 'Diabética', 'Cardiopatia'];

  const triagens = [
    {
      id: 1,
      data: '15 mar 2026',
      risco: 'urgent' as const,
      score: 78,
      sintomas: ['Dor no peito', 'Falta de ar', 'Tontura'],
      acao: 'Encaminhar à UBS',
      status: 'realizado'
    },
    {
      id: 2,
      data: '28 fev 2026',
      risco: 'warning' as const,
      score: 52,
      sintomas: ['Dor de cabeça', 'Cansaço'],
      acao: 'Monitorar em casa',
      status: 'pendente'
    },
    {
      id: 3,
      data: '10 fev 2026',
      risco: 'low' as const,
      score: 28,
      sintomas: ['Tosse leve'],
      acao: 'Orientação domiciliar',
      status: 'realizado'
    }
  ];

  const encaminhamentos = [
    {
      id: 1,
      data: '15 mar 2026',
      tipo: 'Consulta Médica',
      status: 'pendente'
    },
    {
      id: 2,
      data: '28 fev 2026',
      tipo: 'Exame de sangue',
      status: 'realizado'
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-6">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} color="#0B1220" />
          </button>
          <h2 className="font-bold text-[#0B1220]">Maria Silva</h2>
        </div>
        <RiskBadge level="urgent" label="ALTO RISCO" />
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Dados rápidos */}
        <div className="bg-white rounded-xl p-4 border border-[#DBEAFE]" style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#64748B]">Idade</p>
              <p className="font-semibold text-[#0B1220]">67 anos</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Sexo</p>
              <p className="font-semibold text-[#0B1220]">Feminino</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Microárea</p>
              <p className="font-semibold text-[#0B1220]">3</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Mora sozinha</p>
              <p className="font-semibold text-[#0B1220]">Sim</p>
            </div>
          </div>
        </div>

        {/* Comorbidades */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Comorbidades registradas</h3>
          <div className="flex flex-wrap gap-2">
            {comorbidades.map((comorbidade) => (
              <span
                key={comorbidade}
                className="px-3 py-1.5 bg-[#FEF3C7] text-[#92400E] rounded-full text-sm font-medium border border-[#F59E0B]"
              >
                {comorbidade}
              </span>
            ))}
          </div>
        </div>

        {/* Histórico de Triagens */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-4">Histórico de Triagens</h3>
          <div className="space-y-4">
            {triagens.map((triagem, index) => (
              <div key={triagem.id} className="relative">
                {/* Timeline line */}
                {index < triagens.length - 1 && (
                  <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-[#DBEAFE]" />
                )}
                
                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10">
                    <div
                      className="w-6 h-6 rounded-full border-4 border-white"
                      style={{
                        backgroundColor: triagem.risco === 'urgent' ? '#EF4444' : triagem.risco === 'warning' ? '#F59E0B' : '#10B981'
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white rounded-xl p-4 border border-[#DBEAFE]" style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-[#0B1220]">{triagem.data}</p>
                      <RiskBadge level={triagem.risco} label={`${triagem.score}%`} />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {triagem.sintomas.slice(0, 3).map((sintoma) => (
                        <span
                          key={sintoma}
                          className="px-2 py-1 bg-[#F6F9FF] text-[#64748B] rounded text-xs"
                        >
                          {sintoma}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-[#0B1220] mb-3">
                      <span className="font-medium">Ação:</span> {triagem.acao}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${triagem.status === 'realizado' ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                        {triagem.status === 'realizado' ? '✓ Realizado' : '⏱ Pendente'}
                      </span>
                      <button className="text-xs text-[#0066CC] font-medium">Ver detalhe</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Encaminhamentos */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Encaminhamentos</h3>
          <div className="space-y-2">
            {encaminhamentos.map((enc) => (
              <div
                key={enc.id}
                className="bg-white rounded-xl p-3 border border-[#DBEAFE] flex items-center justify-between"
                style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}
              >
                <div>
                  <p className="font-medium text-[#0B1220] text-sm">{enc.tipo}</p>
                  <p className="text-xs text-[#64748B]">{enc.data}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  enc.status === 'realizado' 
                    ? 'bg-[#D1FAE5] text-[#065F46]' 
                    : 'bg-[#FEF3C7] text-[#92400E]'
                }`}>
                  {enc.status === 'realizado' ? 'Realizado' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBEAFE] p-4 max-w-[390px] mx-auto">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/triagem/1/passo1')}
            className="flex-1 py-3 bg-[#0066CC] text-white rounded-xl font-semibold hover:bg-[#0052A3] transition-colors"
          >
            Nova Triagem
          </button>
          <button className="flex-1 py-3 bg-white text-[#0066CC] rounded-xl font-semibold border-2 border-[#0066CC] hover:bg-[#F6F9FF] transition-colors">
            Registrar Visita
          </button>
        </div>
      </div>
    </div>
  );
}
