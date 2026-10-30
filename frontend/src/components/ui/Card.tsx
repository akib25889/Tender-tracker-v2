import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
}) => {
  return (
    <div
      className={`bg-white dark:bg-[#131B28] rounded-xl border border-[#E2E8F0] dark:border-[#212E42] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.4)] ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F1F5F9] dark:border-[#1E2E4C]">
          <div>
            {title && (
              <h3 className="font-display font-semibold text-[15px] text-[#0F172A] dark:text-[#E7EEFA] leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

