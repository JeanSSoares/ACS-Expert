import { AlertCircle, Share2, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';
import { RiskBadge } from '../components/RiskBadge';

export function TriagemResultado() {
  const navigate = useNavigate();
  const { pacienteId } = useParams();
  const [showEncaminhamento, setShowEncaminhamento] = useState(false);

  const condicoes = [
    { nome: 'Hipertensão Arterial', compatibilidade: 92, nivel: 'Alta' },
    { nome: 'Insuficiência Cardíaca', compatibilidade: 78, nivel: 'Alta' },
    { nome: 'Angina', compatibilidade: 65, nivel: 'Média' },
    { nome: 'Arritmia Cardíaca', compatibilidade: 54, nivel: 'Média' },
    { nome: 'Infarto Agudo', compatibilidade: 42, nivel: 'Baixa' }
  ];

  const orientacoes = [
    'Monitorar pressão arterial diariamente',
    'Evitar esforços físicos intensos',
    'Manter dieta com pouco sal',
    'Retornar imediatamente se piorar',
    'Tomar medicação conforme prescrito'
  ];

  const handleSalvar = () => {
    navigate(`/paciente/${pacienteId}`);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4">
        <h2 className="font-bold text-[#0B1220]">Resultado da Triagem</h2>
        <p className="text-sm text-[#64748B]">Maria Silva • 19 mar 2026, 14:30</p>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6">
        {/* Card de Prioridade - ALTO RISCO */}
        <div className="bg-gradient-to-br from-[#FEE2E2] to-[#FEF3C7] rounded-xl p-6 border-2 border-[#EF4444]" style={{ boxShadow: '0 6px 18px rgba(239,68,68,0.2)' }}>
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle size={32} className="text-[#EF4444] flex-shrink-0" />
            <div className="flex-1">
              <RiskBadge level="urgent" />
              <h3 className="text-xl font-bold text-[#991B1B] mt-2">ALTA PRIORIDADE</h3>
              <p className="text-sm text-[#991B1B] mt-2">
                Encaminhar imediatamente. Sintomas e perfil indicam risco elevado.
              </p>
            </div>
          </div>
        </div>

        {/* Condições mais prováveis */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Condições mais prováveis</h3>
          <div className="space-y-3">
            {condicoes.map((condicao) => (
              <div
                key={condicao.nome}
                className="bg-white rounded-xl p-4 border border-[#DBEAFE]"
                style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-[#0B1220]">{condicao.nome}</h4>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: condicao.nivel === 'Alta' ? '#FEE2E2' : condicao.nivel === 'Média' ? '#FEF3C7' : '#D1FAE5',
                      color: condicao.nivel === 'Alta' ? '#991B1B' : condicao.nivel === 'Média' ? '#92400E' : '#065F46'
                    }}
                  >
                    {condicao.nivel}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="w-full bg-[#DBEAFE] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${condicao.compatibilidade}%`,
                        backgroundColor: condicao.compatibilidade >= 70 ? '#EF4444' : condicao.compatibilidade >= 50 ? '#F59E0B' : '#10B981'
                      }}
                    />
                  </div>
                </div>

                <p className="text-xs text-[#64748B]">
                  {condicao.compatibilidade}% de compatibilidade
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ação Recomendada */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Ação Recomendada</h3>
          <div className="bg-white rounded-xl p-4 border-l-4 border-[#0066CC]" style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}>
            <div className="flex items-start gap-3 mb-3">
              <Check size={20} className="text-[#0066CC] flex-shrink-0 mt-0.5" />
              <p className="font-medium text-[#0B1220]">
                Encaminhar para consulta médica na UBS
              </p>
            </div>
            <button
              onClick={() => setShowEncaminhamento(true)}
              className="w-full py-2 bg-[#0066CC] text-white rounded-lg text-sm font-semibold hover:bg-[#0052A3] transition-colors"
            >
              Registrar Encaminhamento
            </button>
          </div>
        </div>

        {/* Orientações ao Paciente */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Orientações ao Paciente</h3>
          <div className="bg-white rounded-xl p-4 border border-[#DBEAFE]" style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}>
            <ul className="space-y-2">
              {orientacoes.map((orientacao, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[#0B1220]">
                  <span className="text-[#0066CC] flex-shrink-0">•</span>
                  <span>{orientacao}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBEAFE] p-4 max-w-[390px] mx-auto">
        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#0066CC] rounded-xl font-semibold border-2 border-[#0066CC] hover:bg-[#F6F9FF] transition-colors">
            <Share2 size={18} />
            Exportar
          </button>
          <button
            onClick={handleSalvar}
            className="flex-1 py-3 bg-[#0066CC] text-white rounded-xl font-semibold hover:bg-[#0052A3] transition-colors"
          >
            Salvar Triagem
          </button>
        </div>
      </div>

      {/* Bottom Sheet Encaminhamento */}
      {showEncaminhamento && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 max-w-[390px] mx-auto">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="w-12 h-1.5 bg-[#DBEAFE] rounded-full mx-auto mb-6" />
            
            <h3 className="font-bold text-[#0B1220] mb-4">Registrar Encaminhamento</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#0B1220] block mb-2">Tipo de encaminhamento</label>
                <div className="flex flex-wrap gap-2">
                  {['Consulta Médica', 'Enfermagem', 'Vacinação', 'Exame', 'Urgência'].map((tipo) => (
                    <button
                      key={tipo}
                      className="px-3 py-2 bg-[#0066CC] text-white rounded-lg text-sm font-medium"
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#0B1220] block mb-2">Motivo</label>
                <input
                  type="text"
                  value="Hipertensão Arterial - Alto risco"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220]"
                  readOnly
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#0B1220] block mb-2">Unidade de destino</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220]">
                  <option>UBS Central</option>
                  <option>UBS Bairro</option>
                  <option>UBS Vila Nova</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEncaminhamento(false)}
                  className="flex-1 py-3 text-[#64748B] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowEncaminhamento(false);
                    // Mostra confirmação
                  }}
                  className="flex-1 py-3 bg-[#0066CC] text-white rounded-xl font-semibold"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
