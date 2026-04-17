import { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface ResponsiveLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function ResponsiveLayout({ children, showNav = true }: ResponsiveLayoutProps) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: Sidebar + Content */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - apenas desktop e se não for login */}
        {!isLoginPage && showNav && (
          <Sidebar />
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${!isLoginPage && showNav ? 'lg:ml-0' : ''} ${!isLoginPage ? 'pb-16 lg:pb-0' : ''}`}>
          {children}
        </main>
      </div>

      {/* Mobile: Bottom Navigation - apenas mobile e se não for login */}
      {!isLoginPage && showNav && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
