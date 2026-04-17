type RiskLevel = 'urgent' | 'warning' | 'info' | 'low';

interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
}

const RISK_CFG: Record<RiskLevel, { bg: string; fg: string; dot: string; defaultLabel: string }> = {
  urgent: { bg: 'bg-acs-vermelho-100', fg: 'text-acs-vermelho',  dot: 'bg-acs-vermelho',  defaultLabel: 'URGENTE' },
  warning: { bg: 'bg-acs-amar-100',     fg: 'text-[#A3740A]',    dot: 'bg-acs-amar',      defaultLabel: 'ATENÇÃO' },
  info:    { bg: 'bg-acs-azul-100',     fg: 'text-acs-azul',     dot: 'bg-acs-azul-700',  defaultLabel: 'INFO' },
  low:     { bg: 'bg-acs-verde-100',    fg: 'text-[#1E6B48]',    dot: 'bg-acs-verde',     defaultLabel: 'ROTINA' },
};

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const c = RISK_CFG[level];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold uppercase tracking-[.1em] ${c.bg} ${c.fg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {label || c.defaultLabel}
    </span>
  );
}
