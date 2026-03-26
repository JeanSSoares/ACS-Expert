import { ReactNode } from 'react';

interface MobileContainerProps {
  children: ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E5E7EB' }}>
      <div className="w-[390px] h-[844px] bg-[#F6F9FF] relative overflow-hidden shadow-2xl">
        {children}
      </div>
    </div>
  );
}
