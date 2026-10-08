import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileQuestion,
  Home,
  ArrowLeft,
  Search,
  FolderGit2,
  FileText,
  Compass,
} from 'lucide-react';

interface NotFoundPageProps {
  resource?: string;
  resourceId?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  resource,
  resourceId,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const displayTarget = resourceId
    ? `${resource || 'Resource'}: ${resourceId}`
    : location.pathname;

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden text-center">
        {/* Decorative Grid Background Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--bg-subtle)]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Central 404 Status Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-6 shadow-inner ring-8 ring-[var(--accent-line)]">
          <FileQuestion className="w-10 h-10" />
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-[var(--accent)] text-[var(--accent-on)] font-mono text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
            404
          </span>
        </div>

        {/* Header Text */}
        <span className="text-xs font-mono font-bold tracking-widest text-[var(--accent)] uppercase bg-[var(--accent-soft)] px-3 py-1 rounded-full border border-[var(--accent-line)]">
          Status 404 • Resource Not Located
        </span>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] mt-4 tracking-tight">
          {resource
            ? `${resource} Record Not Found`
            : 'Page or Destination Not Found'}
        </h1>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 max-w-lg mx-auto leading-relaxed">
          The requested system target{' '}
          <code className="px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-primary)] font-mono text-xs font-semibold break-all border border-[var(--border-default)]">
            {displayTarget}
          </code>{' '}
          is either unavailable, moved, or deleted from the operational repository.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-semibold rounded-xl hover:bg-[var(--bg-subtle)] transition-colors shadow-2xs flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/dashboard"
            className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Mission Control Dashboard</span>
          </Link>

          <Link
            to="/tenders"
            className="px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Tender Pipeline</span>
          </Link>
        </div>

        {/* Quick Access Shortcuts */}
        <div className="mt-10 pt-8 border-t border-[var(--border-subtle)]">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-4">
            Suggested Quick Navigations
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <Link
              to="/tenders"
              className="p-3 rounded-xl border border-[var(--border-default)] hover:border-[var(--accent)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Live Proposals</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-1">
                Browse active bids and qualification gates
              </p>
            </Link>

            <Link
              to="/documents"
              className="p-3 rounded-xl border border-[var(--border-default)] hover:border-[var(--accent)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Master Vault</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-1">
                Reusable statutory certificates & credentials
              </p>
            </Link>

            <Link
              to="/registry"
              className="p-3 rounded-xl border border-[var(--border-default)] hover:border-[var(--accent)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                <Search className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Tender Intake</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-1">
                Register new RFP discovery records
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
