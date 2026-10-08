import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  bodyClassName = 'p-5',
  title,
  subtitle,
  headerAction,
}) => {
  return (
    <div className={`tt-card ${className}`}>
      {(title || headerAction) && (
        <div className="tt-card-head flex-wrap">
          <div className="min-w-0">
            {title && <h3 className="tt-title">{title}</h3>}
            {subtitle && <p className="text-xs tt-text-3 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="ml-auto min-w-0 max-w-full">{headerAction}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};
