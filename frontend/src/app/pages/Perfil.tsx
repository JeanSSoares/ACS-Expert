import { useEffect, useState } from 'react';
import { MapPin, Mail, LogOut, Loader2, AlertCircle, Building2, IdCard, ShieldCheck } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { usuariosService, type UsuarioAPI } from '@/services/usuariosService';

const PERFIL_LABEL: Record<string, string> = {
  acs:         'Agente Comunitário de Saúde',
  coordenador: 'Coordenador',
  gestor:      'Gestor',
};

function formatarData(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function iniciais(nome?: string) {
  if (!nome) return '?';
  return nome.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function Perfil() {
  const { usuario: usuarioAuth, logout } = useAuth();
  const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState<string | null>(null);

  useEffect(() => {
    if (!usuarioAuth?.id) {
      setLoading(false);
      return;
    }
    let cancelado = false;
    setLoading(true);
    setErro(null);
    usuariosService.buscarPorId(usuarioAuth.id)
      .then(({ data }) => { if (!cancelado) setUsuario(data); })
      .catch((err) => {
        if (!cancelado) {
          setErro(err?.response?.data?.message ?? 'Não foi possível carregar seus dados.');
        }
      })
      .finally(() => { if (!cancelado) setLoading(false); });
    return () => { cancelado = true; };
  }, [usuarioAuth?.id]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-[#64748B]">
        <Loader2 size={24} className="animate-spin" />
        Carregando perfil...
      </div>
    );
  }

  if (erro || !usuario) {
    return (
      <div className="h-full flex flex-col pb-16 overflow-y-auto">
        <div className="bg-[#0066CC] px-6 py-8 text-center">
          <h2 className="text-xl font-bold text-white">Perfil</h2>
        </div>
        <div className="flex-1 px-6 py-6">
          <div className="flex items-start gap-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl p-4">
            <AlertCircle size={18} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#B91C1C]">
              {erro ?? 'Você não está autenticado. Faça login novamente.'}
            </p>
          </div>
          <button
            onClick={logout}
            className="mt-6 w-full bg-white rounded-xl p-4 border border-[#EF4444] flex items-center justify-center gap-2 text-[#EF4444] font-semibold hover:bg-[#FEE2E2] transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pb-16 overflow-y-auto">
      {/* Header */}
      <div className="bg-[#0066CC] px-6 py-8">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-[#0066CC] font-bold text-3xl mb-4">
            {iniciais(usuario.nome)}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{usuario.nome}</h2>
          <p className="text-sm text-white/90">
            {PERFIL_LABEL[usuario.perfil] ?? usuario.perfil}
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6 -mt-6">
        {/* Card de informações */}
        <div
          className="bg-white rounded-xl p-4 border border-[#DBEAFE]"
          style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <IdCard size={20} className="text-[#64748B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B]">Matrícula</p>
                <p className="font-medium text-[#0B1220]">{usuario.matricula}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-[#64748B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B]">Perfil de acesso</p>
                <p className="font-medium text-[#0B1220]">
                  {PERFIL_LABEL[usuario.perfil] ?? usuario.perfil}
                  {usuario.ativo ? '' : ' (inativo)'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 size={20} className="text-[#64748B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B]">Município</p>
                <p className="font-medium text-[#0B1220]">
                  {usuario.municipio_nome ?? '—'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-[#64748B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B]">Área de atuação</p>
                <p className="font-medium text-[#0B1220]">
                  {usuario.microarea_nome ?? 'Sem microárea vinculada'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={20} className="text-[#64748B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B]">E-mail</p>
                <p className="font-medium text-[#0B1220]">
                  {usuario.email ?? 'Não informado'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Último acesso */}
        {usuario.ultimo_acesso && (
          <p className="text-xs text-[#64748B] text-center">
            Último acesso: {formatarData(usuario.ultimo_acesso)}
          </p>
        )}

        {/* Configurações */}
        <div>
          <h3 className="font-semibold text-[#0B1220] mb-3">Configurações</h3>
          <div className="space-y-2">
            <button className="w-full bg-white rounded-xl p-4 border border-[#DBEAFE] flex items-center justify-between hover:bg-[#F6F9FF] transition-colors">
              <span className="text-sm font-medium text-[#0B1220]">Editar perfil</span>
              <span className="text-[#64748B]">›</span>
            </button>
            <button className="w-full bg-white rounded-xl p-4 border border-[#DBEAFE] flex items-center justify-between hover:bg-[#F6F9FF] transition-colors">
              <span className="text-sm font-medium text-[#0B1220]">Alterar senha</span>
              <span className="text-[#64748B]">›</span>
            </button>
            <button className="w-full bg-white rounded-xl p-4 border border-[#DBEAFE] flex items-center justify-between hover:bg-[#F6F9FF] transition-colors">
              <span className="text-sm font-medium text-[#0B1220]">Notificações</span>
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
          onClick={logout}
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
