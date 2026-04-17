import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Bell,
  User,
  LogOut,
  UserCog,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/app/components/brand/Logo';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'pacientes', label: 'Pacientes', icon: Users, path: '/pacientes' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, path: '/agenda' },
    { id: 'encaminhamentos', label: 'Encaminhamentos', icon: FileText, path: '/encaminhamentos' },
    { id: 'alertas', label: 'Alertas', icon: Bell, path: '/alertas' },
    { id: 'usuarios', label: 'Usuários', icon: UserCog, path: '/usuarios' },
    { id: 'perfil', label: 'Perfil', icon: User, path: '/perfil' },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-acs-line h-screen sticky top-0">
      {/* Logo/Header */}
      <div className="p-6 border-b border-acs-line">
        <div className="flex items-center gap-3">
          <Logo variant="mark" size={36} />
          <div>
            <h1 className="font-display font-bold text-acs-ink">ACS-Expert</h1>
            <p className="text-xs text-acs-ink-3">Sistema SUS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-acs-azul text-white shadow-md'
                  : 'text-acs-ink-3 hover:bg-acs-azul-050 hover:text-acs-azul'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
              {item.id === 'alertas' && (
                <span className="ml-auto w-5 h-5 bg-acs-vermelho text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-acs-line">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-acs-ink-3 hover:bg-acs-vermelho-100 hover:text-acs-vermelho transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
}