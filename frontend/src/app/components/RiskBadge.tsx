type RiskLevel = 'urgent' | 'warning' | 'info' | 'low';

interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
}

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const variants = {
    urgent: {
      bg: '#FEE2E2',
      text: '#991B1B',
      border: '#EF4444',
      defaultLabel: 'URGENTE'
    },
    warning: {
      bg: '#FEF3C7',
      text: '#92400E',
      border: '#F59E0B',
      defaultLabel: 'ATENÇÃO'
    },
    info: {
      bg: '#DBEAFE',
      text: '#1E40AF',
      border: '#0066CC',
      defaultLabel: 'INFO'
    },
    low: {
      bg: '#D1FAE5',
      text: '#065F46',
      border: '#10B981',
      defaultLabel: 'BAIXO'
    }
  };

  const variant = variants[level];

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: variant.bg,
        color: variant.text,
        border: `1px solid ${variant.border}`
      }}
    >
      {label || variant.defaultLabel}
    </span>
  );
}
