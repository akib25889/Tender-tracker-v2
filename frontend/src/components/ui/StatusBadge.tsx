import React from 'react';
import { TenderStage, DecisionStatus } from '../../types/tender';

interface StatusBadgeProps {
  stage?: TenderStage;
  decision?: DecisionStatus;
  className?: string;
}

/**
 * Lifecycle stages read as a dot plus a word, not as a filled pill.
 * A row can carry several of these, so only the two terminal outcomes
 * (Awarded, Lost) spend a semantic colour; everything in flight is neutral
 * or accent. Tone names map to the token layer in index.css.
 */
type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'crit' | 'ring';

const STAGE_CONFIG: Record<TenderStage, { label: string; tone: Tone; filled?: boolean }> = {
  DISCOVERED:      { label: 'Discovered', tone: 'neutral' },
  SCREENING:       { label: 'Screening', tone: 'accent' },
  UNDER_ANALYSIS:  { label: 'Under analysis', tone: 'accent' },
  PREPARATION:     { label: 'Preparation', tone: 'accent' },
  INTERNAL_REVIEW: { label: 'Internal review', tone: 'accent' },
  SUBMITTED:       { label: 'Submitted', tone: 'ok' },
  AWARDED:         { label: 'Awarded', tone: 'ok', filled: true },
  LOST:            { label: 'Lost', tone: 'crit', filled: true },
  DECLINED:        { label: 'Declined', tone: 'ring' },
  ARCHIVED:        { label: 'Archived', tone: 'ring' },
};

const DECISION_CONFIG: Record<DecisionStatus, { label: string; tone: Tone }> = {
  GO:          { label: 'Go', tone: 'ok' },
  NO_GO:       { label: 'No-go', tone: 'crit' },
  CONDITIONAL: { label: 'Conditional', tone: 'warn' },
  PENDING:     { label: 'Pending', tone: 'neutral' },
};

const DOT_CLASS: Record<Tone, string> = {
  neutral: 'tt-dot',
  accent: 'tt-dot tt-dot-accent',
  ok: 'tt-dot tt-dot-ok',
  warn: 'tt-dot tt-dot-warn',
  crit: 'tt-dot tt-dot-crit',
  ring: 'tt-dot tt-dot-ring',
};

const TAG_CLASS: Record<Tone, string> = {
  neutral: 'tt-tag',
  accent: 'tt-tag tt-tag-accent',
  ok: 'tt-tag tt-tag-ok',
  warn: 'tt-tag tt-tag-warn',
  crit: 'tt-tag tt-tag-crit',
  ring: 'tt-tag',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ stage, decision, className = '' }) => {
  if (decision) {
    const config = DECISION_CONFIG[decision] || DECISION_CONFIG.PENDING;
    return <span className={`${TAG_CLASS[config.tone]} ${className}`}>{config.label}</span>;
  }

  if (stage) {
    const config = STAGE_CONFIG[stage] || STAGE_CONFIG.DISCOVERED;

    if (config.filled) {
      return <span className={`${TAG_CLASS[config.tone]} ${className}`}>{config.label}</span>;
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-xs tt-text-2 ${className}`}
      >
        <i className={DOT_CLASS[config.tone]} aria-hidden="true" />
        {config.label}
      </span>
    );
  }

  return null;
};
