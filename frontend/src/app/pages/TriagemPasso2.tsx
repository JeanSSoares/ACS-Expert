import { ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';

export function TriagemPasso2() {
  const navigate = useNavigate();
  const { pacienteId } = useParams();
  
  const [selectedSintomas, setSelectedSintomas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const gruposSintomas = [
    {
      id: 'gerais',
      nome: 'Sintomas Gerais',
      sintomas: ['Febre', 'Fadiga', 'Perda de peso', 'Sudorese noturna']
    },
    {
      id: 'saude-mental',
      nome: 'Saúde Mental',
      sintomas: ['Ansiedade', 'Tristeza', 'Insônia', 'Irritabilidade']
    },
    {
      id: 'neurologico',
      nome: 'Neurológico e Cabeça',
      sintomas: ['Dor de cabeça', 'Tontura', 'Visão turva', 'Formigamento']
    },
    {
      id: 'cardiovascular',
      nome: 'Cardiovascular',
      sintomas: ['Dor no peito', 'Palpitações', 'Inchaço nas pernas', 'Pressão alta']
    },
    {
      id: 'respiratorio',
      nome: 'Respiratório',
      sintomas: ['Tosse', 'Falta de ar', 'Chiado no peito', 'Dor ao respirar']
    },
    {
      id: 'digestivo',
      nome: 'Digestivo e Abdominal',
      sintomas: ['Dor abdominal', 'Náusea', 'Vômito', 'Diarreia']
    },
    {
      id: 'urinario',
      nome: 'Urinário e Renal',
      sintomas: ['Dor ao urinar', 'Urina escura', 'Urgência urinária']
    },
    {
      id: 'pele',
      nome: 'Pele e Cabelos',
      sintomas: ['Manchas na pele', 'Coceira', 'Feridas', 'Queda de cabelo']
    }
  ];

  const toggleSintoma = (sintoma: string) => {
    if (selectedSintomas.includes(sintoma)) {
      setSelectedSintomas(selectedSintomas.filter(s => s !== sintoma));
    } else {
      setSelectedSintomas([...selectedSintomas, sintoma]);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
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
          <div className="flex-1 h-2 bg-[#0066CC] rounded-full" />
          <div className="flex-1 h-2 bg-[#DBEAFE] rounded-full" />
        </div>
        <p className="text-xs text-[#64748B] mt-2">Sintomas</p>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Search */}
        <div className="px-6 py-4 bg-white border-b border-[#DBEAFE]">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Buscar sintoma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
            />
          </div>
        </div>

        {/* Sintomas selecionados */}
        {selectedSintomas.length > 0 && (
          <div className="px-6 py-3 bg-[#F6F9FF] border-b border-[#DBEAFE]">
            <p className="text-xs font-medium text-[#64748B] mb-2">Selecionados:</p>
            <div className="flex flex-wrap gap-2">
              {selectedSintomas.map((sintoma) => (
                <span
                  key={sintoma}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0066CC] text-white rounded-full text-sm font-medium"
                >
                  {sintoma}
                  <button
                    onClick={() => toggleSintoma(sintoma)}
                    className="ml-1 hover:bg-white/20 rounded-full"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Grupos de sintomas */}
        <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto pb-24">
          {gruposSintomas.map((grupo) => (
            <div
              key={grupo.id}
              className="bg-white rounded-xl border border-[#DBEAFE] overflow-hidden"
              style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}
            >
              <button
                onClick={() => toggleGroup(grupo.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F6F9FF] transition-colors"
              >
                <span className="font-semibold text-[#0B1220]">{grupo.nome}</span>
                {expandedGroup === grupo.id ? (
                  <ChevronUp size={20} className="text-[#64748B]" />
                ) : (
                  <ChevronDown size={20} className="text-[#64748B]" />
                )}
              </button>

              {expandedGroup === grupo.id && (
                <div className="px-4 pb-4 pt-2 border-t border-[#DBEAFE]">
                  <div className="grid grid-cols-2 gap-2">
                    {grupo.sintomas.map((sintoma) => {
                      const isSelected = selectedSintomas.includes(sintoma);
                      return (
                        <button
                          key={sintoma}
                          onClick={() => toggleSintoma(sintoma)}
                          className="px-3 py-2 rounded-lg text-sm font-medium transition-all text-left"
                          style={{
                            backgroundColor: isSelected ? '#0066CC' : '#F6F9FF',
                            color: isSelected ? '#FFFFFF' : '#0B1220',
                            border: isSelected ? 'none' : '1px solid #DBEAFE'
                          }}
                        >
                          {isSelected && '✓ '}
                          {sintoma}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBEAFE] p-4 max-w-[390px] mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#64748B]">
            {selectedSintomas.length} sintomas selecionados
          </span>
        </div>
        <button
          onClick={() => navigate(`/triagem/${pacienteId}/resultado`)}
          className="w-full py-3 bg-[#0066CC] text-white rounded-xl font-semibold hover:bg-[#0052A3] transition-colors disabled:bg-[#DBEAFE] disabled:text-[#64748B]"
          disabled={selectedSintomas.length === 0}
        >
          Avaliar
        </button>
      </div>
    </div>
  );
}
