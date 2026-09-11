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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-[#FECACA] dark:border-rose-900/50 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center">
        {/* Decorative Alert Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Status Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-[#FEF2F2] dark:bg-rose-950/40 text-[#DC2626] dark:text-rose-400 flex items-center justify-center mb-6 shadow-inner ring-8 ring-rose-50 dark:ring-rose-900/20">
          <AlertOctagon className="w-10 h-10" />
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-[#0F172A] text-white font-mono text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
            500
          </span>
        </div>

        {/* Header Text */}
        <span className="text-xs font-mono font-bold tracking-widest text-[#DC2626] dark:text-rose-400 uppercase bg-[#FEF2F2] dark:bg-rose-950/60 px-3 py-1 rounded-full border border-[#FECACA] dark:border-rose-800">
          Runtime Exception Intercepted
        </span>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0F172A] dark:text-white mt-4 tracking-tight">
          Application Error Encountered
        </h1>

        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-3 max-w-lg mx-auto leading-relaxed">
          The application encountered an unexpected runtime fault during rendering. System state has been quarantined to prevent data corruption.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={handleHardReset}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-[#DC2626] text-xs font-semibold rounded-xl hover:bg-[#FEF2F2] dark:hover:bg-rose-950/40 transition-colors shadow-2xs flex items-center gap-2"
            title="Clear cached browser state if corruption persists"
          >
            <Trash2 className="w-4 h-4" />
            <span>Emergency Cache Reset</span>
          </button>
        </div>

        {/* Expandable Technical Diagnostics Details */}
        <div className="mt-8 text-left">
          <details className="group border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 bg-[#F8FAFC] dark:bg-slate-800/50 transition-all">
            <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-bold text-[#475569] dark:text-slate-300">
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#64748B]" />
                Technical Diagnostic Telemetry
              </span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-[#94A3B8]" />
            </summary>

            <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-slate-700 space-y-2">
              <div className="text-[11px] font-mono text-[#DC2626] bg-[#FEF2F2] dark:bg-rose-950/50 p-2.5 rounded-lg break-all border border-[#FECACA] dark:border-rose-900/50">
                {errorMessage}
              </div>

              {errorStack && (
                <pre className="text-[10px] font-mono text-[#64748B] dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg overflow-x-auto max-h-48 border border-[#E2E8F0] dark:border-slate-800 leading-relaxed">
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
