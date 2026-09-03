import React from 'react';

interface ReadinessBarProps {
  score: number; // 0 to 100
  showLabel?: boolean;
  className?: string;
}

export const ReadinessBar: React.FC<ReadinessBarProps> = ({
  score,
  showLabel = true,
  className = '',
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));

  // Determine indicator color based on score
  let barColor = 'bg-[#DC2626]'; // < 40% red
  if (clampedScore >= 75) {
    barColor = 'bg-[#16A34A]'; // >= 75% green
  } else if (clampedScore >= 50) {
    barColor = 'bg-[#2563EB]'; // 50-74% royal blue
  } else if (clampedScore >= 40) {
    barColor = 'bg-[#D97706]'; // 40-49% amber
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-xs font-semibold text-[#0F172A] w-8 text-right">
          {clampedScore}%
        </span>
      )}
    </div>
  );
};

