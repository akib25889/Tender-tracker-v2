import React from 'react';

interface UrgencyBadgeProps {
  daysRemaining?: number;
  hoursRemaining?: number;
  deadlineStr?: string;
  className?: string;
}

/**
 * A deadline is shown as a countdown from now — T-2d, T-18h — rather than as
 * a span of time the reader has to re-anchor ("2 days left" from when?). The
 * figure is set in the data face so a column of them lines up.
 *
 * Colour still does the triage: red inside 48 hours, amber inside five days,
 * neutral beyond that, so a list of twenty tenders shows colour only on the
 * handful that need action today.
 */
export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  daysRemaining,
  hoursRemaining,
  deadlineStr,
  className = '',
}) => {
  let effectiveDays = daysRemaining ?? 0;
  let effectiveHours = hoursRemaining;

  if (deadlineStr) {
    const d = new Date(deadlineStr);
    if (!isNaN(d.getTime())) {
      const diff = d.getTime() - Date.now();
      if (diff > 0) {
        effectiveDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        effectiveHours = Math.floor(diff / (1000 * 60 * 60));
      } else {
        effectiveDays = 0;
        effectiveHours = 0;
      }
    }
  }

  if (effectiveDays <= 0 && (!effectiveHours || effectiveHours <= 0)) {
    return (
      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-xs tt-text-3 ${className}`}>
        No deadline
      </span>
    );
  }

  // U+2212 MINUS, not a hyphen: it is the same width as a digit in the mono
  // face, so T-9d and T-12d keep their columns aligned.
  const text =
    effectiveHours !== undefined && effectiveHours < 48
      ? `T\u2212${effectiveHours}h`
      : `T\u2212${effectiveDays}d`;

  const label =
    effectiveHours !== undefined && effectiveHours < 48
      ? `${effectiveHours} hours remaining`
      : `${effectiveDays} days remaining`;

  const tone =
    effectiveDays <= 2 ? ' tt-countdown-crit' : effectiveDays <= 5 ? ' tt-countdown-warn' : '';

  return (
    <span className={`tt-countdown${tone} ${className}`} title={label} aria-label={label}>
      {text}
    </span>
  );
};
