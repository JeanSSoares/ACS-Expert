import { ArrowLeft, User, MapPin, Phone, Mail, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';

export function Perfil() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col pb-16 overflow-y-auto">
      {/* Header */}
      <div className="bg-[#0066CC] px-6 py-8">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-[#0066CC] font-bold text-3xl mb-4">
            AS
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Ana Silva</h2>
          <p className="text-sm text-white/90">Matrícula: 12345-6</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6 -mt-6">
        {/* Card de informações */}
        <div className="bg-white rounded-xl p-4 border border-[#DBEAFE]" style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-[#64748B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B]">Área de atuação</p>
                <p className="font-medium text-[#0B1220]">Microárea 3 — Vila Nova</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone size={20} className="text-[#64748B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B]">Telefone</p>
                <p className="font-medium text-[#0B1220]">(11) 98765-4321</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={20} className="text-[#64748B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B]">E-mail</p>
                <p className="font-medium text-[#0B1220]">ana.silva@saude.gov.br</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Estatísticas do mês</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-[#DBEAFE] text-center" style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}>
              <div className="text-2xl font-bold text-[#0066CC]">127</div>
              <div className="text-xs text-[#64748B] mt-1">Visitas realizadas</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#DBEAFE] text-center" style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}>
              <div className="text-2xl font-bold text-[#0066CC]">43</div>
              <div className="text-xs text-[#64748B] mt-1">Triagens feitas</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#DBEAFE] text-center" style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}>
              <div className="text-2xl font-bold text-[#10B981]">32</div>
              <div className="text-xs text-[#64748B] mt-1">Encaminhamentos</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#DBEAFE] text-center" style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}>
              <div className="text-2xl font-bold text-[#F59E0B]">8</div>
              <div className="text-xs text-[#64748B] mt-1">Casos urgentes</div>
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Configurações</h3>
          <div className="space-y-2">
            <button className="w-full bg-white rounded-xl p-4 border border-[#DBEAFE] flex items-center justify-between hover:bg-[#F6F9FF] transition-colors">
              <span className="text-sm font-medium text-[#0B1220]">Editar perfil</span>
              <span className="text-[#64748B]">›</span>
            </button>
            <button className="w-full bg-white rounded-xl p-4 border border-[#DBEAFE] flex items-center justify-between hover:bg-[#F6F9FF] transition-colors">
              <span className="text-sm font-medium text-[#0B1220]">Notificações</span>
              <span className="text-[#64748B]">›</span>
            </button>
            <button className="w-full bg-white rounded-xl p-4 border border-[#DBEAFE] flex items-center justify-between hover:bg-[#F6F9FF] transition-colors">
              <span className="text-sm font-medium text-[#0B1220]">Preferências</span>
              <span className="text-[#64748B]">›</span>
            </button>
            <button className="w-full bg-white rounded-xl p-4 border border-[#DBEAFE] flex items-center justify-between hover:bg-[#F6F9FF] transition-colors">
              <span className="text-sm font-medium text-[#0B1220]">Ajuda e suporte</span>
              <span className="text-[#64748B]">›</span>
            </button>
          </div>
        </div>

        {/* Sair */}
        <button 
          onClick={() => navigate('/')}
          className="w-full bg-white rounded-xl p-4 border border-[#EF4444] flex items-center justify-center gap-2 text-[#EF4444] font-semibold hover:bg-[#FEE2E2] transition-colors"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
