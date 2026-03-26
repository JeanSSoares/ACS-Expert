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
// logo placeholder — substitua por um arquivo SVG/PNG em src/assets/logo.svg

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'pacientes', label: 'Pacientes', icon: Users, path: '/pacientes' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, path: '/agenda' },
    { id: 'encaminhamentos', label: 'Encaminhamentos', icon: FileText, path: '/encaminhamentos' },
    { id: 'alertas', label: 'Alertas', icon: Bell, path: '/alertas' },
    { id: 'usuarios', label: 'Usuários', icon: UserCog, path: '/usuarios' },
    { id: 'perfil', label: 'Perfil', icon: User, path: '/perfil' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-[#DBEAFE] h-screen sticky top-0">
      {/* Logo/Header */}
      <div className="p-6 border-b border-[#DBEAFE]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-acs-primary flex items-center justify-center text-white font-bold text-sm">A</div>
          <div>
            <h1 className="font-bold text-[#0B1220]">ACS-Expert</h1>
            <p className="text-xs text-[#64748B]">Sistema SUS</p>
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#0066CC] text-white shadow-md'
                  : 'text-[#64748B] hover:bg-[#F0F9FF] hover:text-[#0066CC]'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
              {item.id === 'alertas' && (
                <span className="ml-auto w-5 h-5 bg-[#EF4444] text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-[#DBEAFE]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#EF4444] transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
}