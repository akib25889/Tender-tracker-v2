import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { MOCK_TENDERS } from '../mock/tenders';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { ReadinessBar } from '../components/ui/ReadinessBar';

export const TenderListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');

  const filteredTenders = MOCK_TENDERS.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStage === 'ALL' || t.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Tenders</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Pipeline Registry</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Tender Registry &amp; Pipeline
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage {MOCK_TENDERS.length} active opportunities across discovery, eligibility screening, proposal collation, and statutory submission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>New Tender Opportunity</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tender ID, title, donor..."
            className="w-full pl-9 pr-4 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-xs text-[#64748B] font-medium whitespace-nowrap">Stage:</span>
          {['ALL', 'SCREENING', 'UNDER_ANALYSIS', 'PREPARATION', 'INTERNAL_REVIEW'].map(
            (stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedStage === stage
                    ? 'bg-[#0F172A] text-white font-semibold'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {stage.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tenders Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4">Tender ID &amp; SOW Title</th>
                <th className="py-3 px-4">Issuing Authority</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Readiness</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {filteredTenders.map((tender) => (
                <tr
                  key={tender.id}
                  className="hover:bg-[#F8FAFC] transition-colors group"
                >
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#0F172A]">
                        {tender.id}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-mono">
                        {tender.referenceNo}
                      </span>
                    </div>
                    <Link
                      to={`/tenders/${tender.id}`}
                      className="font-medium text-[#0F172A] group-hover:text-[#2563EB] line-clamp-1"
                    >
                      {tender.title}
                    </Link>
                  </td>

                  <td className="py-3.5 px-4 text-[#475569]">
                    <div className="font-medium text-[#0F172A]">
                      {tender.organization}
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      {tender.country}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                    ${(tender.estimatedValue / 1000000).toFixed(2)}M
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge stage={tender.stage} />
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge decision={tender.decision} />
                  </td>

                  <td className="py-3.5 px-4">
                    <UrgencyBadge
                      daysRemaining={tender.daysRemaining}
                      hoursRemaining={tender.hoursRemaining}
                    />
                  </td>

                  <td className="py-3.5 px-4 w-36">
                    <ReadinessBar score={tender.readinessScore} />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/tenders/${tender.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] rounded border border-[#BFDBFE] transition-colors"
                    >
                      <span>Workspace</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

