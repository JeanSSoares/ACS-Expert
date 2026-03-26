import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';

export function TriagemPasso1() {
  const navigate = useNavigate();
  const { pacienteId } = useParams();
  
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [tipoVisita, setTipoVisita] = useState('rotina');

  const fatoresRisco = [
    'Fumante',
    'Hipertenso(a)',
    'Diabético(a)',
    'Obeso(a)',
    'Asmático(a)',
    'Gestante',
    'Cardiopata',
    'DPOC',
    'Imunossuprimido(a)'
  ];

  const tiposVisita = [
    { id: 'rotina', label: 'Rotina' },
    { id: 'busca-ativa', label: 'Busca ativa' },
    { id: 'retorno', label: 'Retorno' },
    { id: 'urgencia', label: 'Urgência' }
  ];

  const toggleFactor = (factor: string) => {
    if (selectedFactors.includes(factor)) {
      setSelectedFactors(selectedFactors.filter(f => f !== factor));
    } else {
      setSelectedFactors([...selectedFactors, factor]);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} color="#0B1220" />
          </button>
          <div>
            <h2 className="font-bold text-[#0B1220]">Nova Triagem</h2>
            <p className="text-sm text-[#64748B]">Maria Silva, 67 anos</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-2 bg-[#0066CC] rounded-full" />
          <div className="flex-1 h-2 bg-[#DBEAFE] rounded-full" />
          <div className="flex-1 h-2 bg-[#DBEAFE] rounded-full" />
        </div>
        <p className="text-xs text-[#64748B] mt-2">Dados — Sintomas — Resultado</p>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6">
        {/* Fatores de Risco */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Fatores de Risco / Comorbidades</h3>
          <div className="grid grid-cols-2 gap-2">
            {fatoresRisco.map((factor) => {
              const isSelected = selectedFactors.includes(factor);
              return (
                <button
                  key={factor}
                  onClick={() => toggleFactor(factor)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isSelected ? '#0066CC' : '#F6F9FF',
                    color: isSelected ? '#FFFFFF' : '#0B1220',
                    border: isSelected ? 'none' : '1px solid #DBEAFE'
                  }}
                >
                  {isSelected && '✓ '}
                  {factor}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contexto da Visita */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Contexto da Visita</h3>
          
          <div className="bg-white rounded-xl p-4 border border-[#DBEAFE] mb-4" style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}>
            <label className="text-sm text-[#64748B] block mb-2">Data/hora da visita</label>
            <p className="font-medium text-[#0B1220]">19 de março de 2026 • 14:30</p>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#0B1220] block mb-2">Tipo de visita</label>
            <div className="grid grid-cols-2 gap-2">
              {tiposVisita.map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => setTipoVisita(tipo.id)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: tipoVisita === tipo.id ? '#0066CC' : 'white',
                    color: tipoVisita === tipo.id ? '#FFFFFF' : '#0B1220',
                    border: tipoVisita === tipo.id ? 'none' : '1px solid #DBEAFE'
                  }}
                >
                  {tipo.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#0B1220] block mb-2">Observação</label>
            <textarea
              placeholder="Observações sobre a visita..."
              className="w-full px-4 py-3 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 resize-none"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="bg-white border-t border-[#DBEAFE] p-4">
        <button
          onClick={() => navigate(`/triagem/${pacienteId}/passo2`)}
          className="w-full py-3 bg-[#0066CC] text-white rounded-xl font-semibold hover:bg-[#0052A3] transition-colors"
        >
          Próximo: Sintomas
        </button>
      </div>
    </div>
  );
}
