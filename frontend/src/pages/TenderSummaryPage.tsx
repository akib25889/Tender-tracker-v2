import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, ExternalLink, Printer } from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { TenderSummaryDocument } from '../components/ui/TenderSummaryDocument';

export const TenderSummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenders } = useTenders();
  const tender = tenders.find((t) => t.id === id);

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#64748B]">
        <p className="text-sm">Tender not found.</p>
        <Link to="/registry" className="text-xs text-[#2563EB] hover:underline">
          &larr; Back to Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAFC]">
      {/* Top action bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between shadow-xs print:hidden">
        <Link
          to={`/tenders/${tender.id}`}
          className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
          <Link
            to={`/registry?id=${tender.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Entry
          </Link>
          <Link
            to={`/tenders/${tender.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white hover:bg-[#1E293B] rounded-lg text-xs font-semibold transition-colors"
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
