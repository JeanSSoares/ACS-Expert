import { Home, Calendar, Users, ClipboardCheck, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Calendar, label: 'Agenda', path: '/agenda' },
    { icon: Users, label: 'Pacientes', path: '/pacientes' },
    { icon: ClipboardCheck, label: 'Encaminhamentos', path: '/encaminhamentos' },
    { icon: User, label: 'Perfil', path: '/perfil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-acs-line max-w-[390px] mx-auto">
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center gap-1 ${
                isActive ? 'text-acs-azul' : 'text-acs-ink-3'
              }`}
            >
              {isActive && (
                <span className="absolute top-[3px] w-7 h-[3px] rounded-full bg-acs-azul" />
              )}
              <Icon size={20} strokeWidth={isActive ? 2 : 1.8} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
