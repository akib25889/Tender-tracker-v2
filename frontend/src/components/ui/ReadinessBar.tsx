import React from 'react';

interface ReadinessBarProps {
  score: number; // 0 to 100
  showLabel?: boolean;
  className?: string;
}

function readinessTone(score: number): 'ok' | 'warn' | 'crit' {
  if (score >= 70) return 'ok';
  if (score >= 40) return 'warn';
  return 'crit';
}

export const ReadinessBar: React.FC<ReadinessBarProps> = ({
  score,
  showLabel = true,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 min-w-10 tt-meter tt-meter-${readinessTone(clamped)}`}>
        <i style={{ width: `${clamped}%` }} />
      </div>
      {showLabel && (
        <span className="font-mono text-[11px] tt-text-2 tt-num w-8 text-right">{clamped}%</span>
      )}
    </div>
  );
};
