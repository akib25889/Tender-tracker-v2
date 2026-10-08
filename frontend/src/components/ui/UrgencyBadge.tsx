import React from 'react';

interface UrgencyBadgeProps {
  daysRemaining?: number;
  hoursRemaining?: number;
  deadlineStr?: string;
  className?: string;
}

/**
 * Red is reserved for a deadline inside 48 hours and amber for one inside
 * five days. Anything further out is plain text, so a list of twenty tenders
 * shows colour only on the handful that need action today.
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

  const text =
    effectiveHours !== undefined && effectiveHours < 48
      ? `${effectiveHours}h left`
      : `${effectiveDays}d left`;

  if (effectiveDays <= 2) {
    return <span className={`tt-tag tt-tag-crit ${className}`}>{text}</span>;
  }

  if (effectiveDays <= 5) {
    return <span className={`tt-tag tt-tag-warn ${className}`}>{text}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-xs tt-text-2 ${className}`}>
      <i className="tt-dot" aria-hidden="true" />
      {text}
    </span>
  );
};
