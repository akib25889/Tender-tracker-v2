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
      className={`bg-white rounded-lg border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F1F5F9]">
          <div>
            {title && (
              <h3 className="font-display font-semibold text-[15px] text-[#0F172A] leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

