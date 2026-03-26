import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export function NovoPaciente() {
  const navigate = useNavigate();
  const [sexo, setSexo] = useState('feminino');

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} color="#0B1220" />
          </button>
          <h2 className="font-bold text-[#0B1220]">Novo Paciente</h2>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6">
        {/* Identificação */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Identificação</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">
                Nome completo <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                placeholder="Digite o nome completo"
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">CNS (Cartão Nacional de Saúde)</label>
              <input
                type="text"
                placeholder="000 0000 0000 0000"
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">Data de nascimento</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">Sexo</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSexo('masculino')}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: sexo === 'masculino' ? '#0066CC' : 'white',
                    color: sexo === 'masculino' ? '#FFFFFF' : '#0B1220',
                    border: sexo === 'masculino' ? 'none' : '1px solid #DBEAFE'
                  }}
                >
                  Masculino
                </button>
                <button
                  onClick={() => setSexo('feminino')}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: sexo === 'feminino' ? '#0066CC' : 'white',
                    color: sexo === 'feminino' ? '#FFFFFF' : '#0B1220',
                    border: sexo === 'feminino' ? 'none' : '1px solid #DBEAFE'
                  }}
                >
                  Feminino
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Localização */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Localização</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">Endereço (rua + número)</label>
              <input
                type="text"
                placeholder="Ex: Rua das Flores, 123"
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">Complemento</label>
              <input
                type="text"
                placeholder="Apto, bloco, etc."
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">Microárea</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20">
                <option value="">Selecione...</option>
                <option value="1">Microárea 1</option>
                <option value="2">Microárea 2</option>
                <option value="3">Microárea 3 — Vila Nova</option>
                <option value="4">Microárea 4</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1220] block mb-2">Referência de localização</label>
              <textarea
                placeholder="Ex: Próximo ao mercado, casa azul..."
                className="w-full px-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 resize-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Contexto Social */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Contexto Social</h3>
          <div className="space-y-2">
            {[
              'Idoso que mora sozinho',
              'Família em situação de vulnerabilidade',
              'Dificuldade de locomoção',
              'Beneficiário de programa social'
            ].map((item) => (
              <label key={item} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#DBEAFE]">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#0066CC] rounded border-[#DBEAFE] focus:ring-[#0066CC]"
                />
                <span className="text-sm text-[#0B1220]">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBEAFE] p-4 max-w-[390px] mx-auto">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-[#64748B] font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={() => navigate('/pacientes')}
            className="flex-1 py-3 bg-[#0066CC] text-white rounded-xl font-semibold hover:bg-[#0052A3] transition-colors"
          >
            Salvar Paciente
          </button>
        </div>
      </div>
    </div>
  );
}
