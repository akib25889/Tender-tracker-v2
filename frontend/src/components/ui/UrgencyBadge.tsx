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
  if (daysRemaining <= 0 && (!hoursRemaining || hoursRemaining <= 0)) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 text-[#94A3B8] bg-[#F8FAFC] border border-[#E2E8F0] ${className}`}
      >
        No Deadline
      </span>
    );
  }

  const isCritical = daysRemaining <= 2;
  const isUrgent = daysRemaining > 2 && daysRemaining <= 5;

  let text = `${daysRemaining}d left`;
  if (hoursRemaining !== undefined && hoursRemaining < 48) {
    text = `${hoursRemaining}h left`;
  }

  if (isCritical) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] shadow-2xs ${className}`}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]"></span>
        </span>
        <span>{text}</span>
      </span>
    );
  }

  if (isUrgent) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#D97706] shrink-0"></span>
        <span>{text}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] ${className}`}
    >
      {text}
    </span>
  );
};
