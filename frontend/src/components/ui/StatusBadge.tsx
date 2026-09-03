import React from 'react';
import { TenderStage, DecisionStatus } from '../../types/tender';

interface StatusBadgeProps {
  stage?: TenderStage;
  decision?: DecisionStatus;
  className?: string;
}

const STAGE_CONFIG: Record<TenderStage, { label: string; bg: string; text: string; border: string }> = {
  DISCOVERED: {
    label: 'Discovered',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    border: 'border-[#BFDBFE]',
  },
  SCREENING: {
    label: 'Screening',
    bg: 'bg-[#EEF2FF]',
    text: 'text-[#4338CA]',
    border: 'border-[#C7D2FE]',
  },
  UNDER_ANALYSIS: {
    label: 'Analysis',
    bg: 'bg-[#F5F3FF]',
    text: 'text-[#6D28D9]',
    border: 'border-[#DDD6FE]',
  },
  PREPARATION: {
    label: 'Preparation',
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
  },
  INTERNAL_REVIEW: {
    label: 'Review',
    bg: 'bg-[#FFF7ED]',
    text: 'text-[#C2410C]',
    border: 'border-[#FED7AA]',
  },
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-[#F1F5F9]',
    text: 'text-[#334155]',
    border: 'border-[#CBD5E1]',
  },
  AWARDED: {
    label: 'Awarded (Won)',
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    border: 'border-[#BBF7D0]',
  },
  LOST: {
    label: 'Lost',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#B91C1C]',
    border: 'border-[#FECACA]',
  },
  DECLINED: {
    label: 'Declined (No-Go)',
    bg: 'bg-[#F8FAFC]',
    text: 'text-[#64748B]',
    border: 'border-[#E2E8F0]',
  },
};

const DECISION_CONFIG: Record<DecisionStatus, { label: string; bg: string; text: string; border: string }> = {
  GO: {
    label: 'GO',
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    border: 'border-[#BBF7D0]',
  },
  NO_GO: {
    label: 'NO-GO',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#B91C1C]',
    border: 'border-[#FECACA]',
  },
  CONDITIONAL: {
    label: 'CONDITIONAL',
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
  },
  PENDING: {
    label: 'DECISION PENDING',
    bg: 'bg-[#F1F5F9]',
    text: 'text-[#475569]',
    border: 'border-[#CBD5E1]',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ stage, decision, className = '' }) => {
  if (decision) {
    const config = DECISION_CONFIG[decision] || DECISION_CONFIG.PENDING;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border ${config.bg} ${config.text} ${config.border} ${className}`}
      >
        {config.label}
      </span>
    );
  }

  if (stage) {
    const config = STAGE_CONFIG[stage] || STAGE_CONFIG.DISCOVERED;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border ${config.bg} ${config.text} ${config.border} ${className}`}
      >
        {config.label}
      </span>
    );
  }

  return null;
};

