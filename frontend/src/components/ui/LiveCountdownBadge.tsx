import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface LiveCountdownBadgeProps {
  deadlineStr?: string;
  daysRemaining?: number;
  hoursRemaining?: number;
  className?: string;
}

function calculateTimeLeft(
  deadlineStr?: string,
  daysRemaining?: number,
  hoursRemaining?: number
): string {
  let targetMs: number | null = null;

  if (deadlineStr) {
    const d = new Date(deadlineStr);
    if (!isNaN(d.getTime())) {
      targetMs = d.getTime();
    }
  }

  const now = Date.now();

  if (targetMs === null) {
    if (daysRemaining !== undefined && daysRemaining > 0) {
      return `${daysRemaining}d remaining`;
    }
    if (hoursRemaining !== undefined && hoursRemaining > 0) {
      return `${hoursRemaining}h remaining`;
    }
    return '';
  }

  const diff = targetMs - now;
  if (diff <= 0) {
    return 'Deadline Expired';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${hours.toString().padStart(2, '0')}h`);
  parts.push(`${minutes.toString().padStart(2, '0')}m`);
  parts.push(`${seconds.toString().padStart(2, '0')}s`);

  return parts.join(' ');
}

export const LiveCountdownBadge: React.FC<LiveCountdownBadgeProps> = ({
  deadlineStr,
  daysRemaining,
  hoursRemaining,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<string>(() =>
    calculateTimeLeft(deadlineStr, daysRemaining, hoursRemaining)
  );

  useEffect(() => {
    const tick = () => {
      setTimeLeft(calculateTimeLeft(deadlineStr, daysRemaining, hoursRemaining));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadlineStr, daysRemaining, hoursRemaining]);

  if (!timeLeft) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold whitespace-nowrap shrink-0 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs ${className}`}
      title="Live countdown to submission cutoff in Bangladesh Standard Time (BST / UTC+6)"
    >
      <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse shrink-0" />
      <span>{timeLeft}</span>
      <span className="text-[10px] font-sans font-semibold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider ml-0.5">
        BD Time
      </span>
    </span>
  );
};
