import React from 'react';

interface UrgencyBadgeProps {
  daysRemaining: number;
  hoursRemaining?: number;
  className?: string;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  daysRemaining,
  hoursRemaining,
  className = '',
}) => {
  const isCritical = daysRemaining <= 2;
  const isUrgent = daysRemaining > 2 && daysRemaining <= 5;

  let text = `${daysRemaining}d left`;
  if (hoursRemaining !== undefined && hoursRemaining < 48) {
    text = `${hoursRemaining}h left`;
  }

  if (isCritical) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]"></span>
        </span>
        {text}
      </span>
    );
  }

  if (isUrgent) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]"></span>
        {text}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] ${className}`}
    >
      {text}
    </span>
  );
};

