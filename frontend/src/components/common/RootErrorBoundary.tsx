import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertOctagon, RotateCcw, Trash2, Home, Terminal, ChevronDown } from 'lucide-react';
import { NotFoundPage } from '../../pages/status/NotFoundPage';
import { AccessDeniedPage } from '../../pages/status/AccessDeniedPage';

export const RootErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // If this is a known HTTP 404 router error
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  // If this is a known HTTP 403 router error
  if (isRouteErrorResponse(error) && error.status === 403) {
    return <AccessDeniedPage />;
  }

  const errorMessage =
    isRouteErrorResponse(error)
      ? `${error.status} ${error.statusText}`
      : error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : 'An unexpected application runtime exception occurred.';

  const errorStack = error instanceof Error ? error.stack : undefined;

  const handleHardReset = () => {
    if (
      window.confirm(
        'Warning: This will clear your local cached tenders & reset the application state to factory defaults. Proceed?'
      )
    ) {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.error('Failed to clear storage:', e);
      }
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-[var(--bg-surface)] border border-[var(--crit-line)] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center">
        {/* Decorative Alert Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--crit)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--crit)]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Status Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-[var(--crit-soft)] text-[var(--crit)] flex items-center justify-center mb-6 shadow-inner ring-8 ring-[var(--crit-line)]">
          <AlertOctagon className="w-10 h-10" />
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-[var(--accent)] text-[var(--accent-on)] font-mono text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
            500
          </span>
        </div>

        {/* Header Text */}
        <span className="text-xs font-mono font-bold tracking-widest text-[var(--crit)] uppercase bg-[var(--crit-soft)] px-3 py-1 rounded-full border border-[var(--crit-line)]">
          Runtime Exception Intercepted
        </span>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] mt-4 tracking-tight">
          Application Error Encountered
        </h1>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 max-w-lg mx-auto leading-relaxed">
          The application encountered an unexpected runtime fault during rendering. System state has been quarantined to prevent data corruption.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={handleHardReset}
            className="px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--crit)] text-xs font-semibold rounded-xl hover:bg-[var(--crit-soft)] transition-colors shadow-2xs flex items-center gap-2"
            title="Clear cached browser state if corruption persists"
          >
            <Trash2 className="w-4 h-4" />
            <span>Emergency Cache Reset</span>
          </button>
        </div>

        {/* Expandable Technical Diagnostics Details */}
        <div className="mt-8 text-left">
          <details className="group border border-[var(--border-default)] rounded-2xl p-4 bg-[var(--bg-subtle)] transition-all">
            <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-bold text-[var(--text-secondary)]">
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                Technical Diagnostic Telemetry
              </span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-[var(--text-muted)]" />
            </summary>

            <div className="mt-3 pt-3 border-t border-[var(--border-default)] space-y-2">
              <div className="text-[11px] font-mono text-[var(--crit)] bg-[var(--crit-soft)] p-2.5 rounded-lg break-all border border-[var(--crit-line)]">
                {errorMessage}
              </div>

              {errorStack && (
                <pre className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] p-3 rounded-lg overflow-x-auto max-h-48 border border-[var(--border-default)] leading-relaxed">
                  {errorStack}
                </pre>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

