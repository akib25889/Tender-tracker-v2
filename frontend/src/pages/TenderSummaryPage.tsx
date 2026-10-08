import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, ExternalLink, Printer } from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { useTenderQuery } from '../hooks/useTenderQueries';
import { TenderSummaryDocument } from '../components/ui/TenderSummaryDocument';
import { NotFoundPage } from './status/NotFoundPage';

export const TenderSummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenders } = useTenders();
  const { data: queryTender, isLoading } = useTenderQuery(id);
  const tender = tenders.find((t) => t.id === id) || queryTender;

  if (!tender) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        </div>
      );
    }
    return <NotFoundPage resource="Tender Summary Record" resourceId={id} />;
  }

  return (
    <div className="min-h-full bg-[var(--bg-subtle)]">
      {/* Top action bar */}
      <div className="sticky top-0 z-10 bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-6 py-3 flex items-center justify-between shadow-xs print:hidden">
        <Link
          to={`/tenders/${tender.id}`}
          className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
          <Link
            to={`/registry?id=${tender.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] rounded-lg text-xs font-semibold transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Entry
          </Link>
          <Link
            to={`/tenders/${tender.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] text-[var(--accent-on)] hover:bg-[var(--accent-hover)] rounded-lg text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Workspace
          </Link>
        </div>
      </div>

      {/* Render Document */}
      <div className="py-6 px-4">
        <TenderSummaryDocument tender={tender} />
      </div>
    </div>
  );
};
