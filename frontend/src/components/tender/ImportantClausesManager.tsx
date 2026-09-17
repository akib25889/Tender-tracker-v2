import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { ImportantClause, ClauseCriticality, ClauseCategory, TenderDocument } from '../../types/tender';
import {
  FileText,
  Plus,
  Copy,
  Check,
  Edit2,
  Trash2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Search,
  BookOpen,
  Scale,
  DollarSign,
  FileCheck,
  Shield,
  X,
  Sparkles,
} from 'lucide-react';

interface ImportantClausesManagerProps {
  clauses: ImportantClause[];
  onChange?: (clauses: ImportantClause[]) => void;
  readOnly?: boolean;
  tenderDocuments?: TenderDocument[];
}

const CATEGORIES: { value: ClauseCategory; label: string; color: string; icon: any }[] = [
  { value: 'FINANCIAL', label: 'Financial & Guarantees', color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30', icon: DollarSign },
  { value: 'LEGAL_RISK', label: 'Legal & Risk Exposure', color: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30', icon: Scale },
  { value: 'TECHNICAL_MANDATORY', label: 'Technical Mandatory', color: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/30', icon: FileCheck },
  { value: 'ELIGIBILITY', label: 'Eligibility & Turnover', color: 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/30', icon: Shield },
  { value: 'PENALTY', label: 'Penalties & LD Cap', color: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30', icon: AlertTriangle },
  { value: 'OTHER', label: 'General / Other', color: 'text-slate-700 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-500/10 dark:border-slate-500/30', icon: BookOpen },
];

const PRESETS: Omit<ImportantClause, 'id'>[] = [
  {
    clause_title: 'Bid Security Bank Guarantee Requirement',
    category: 'FINANCIAL',
    criticality: 'CRITICAL',
    doc_file_name: 'RFP_Volume_1_ITB.pdf',
    doc_reference: 'Section 2 (ITB) Clause 14.1',
    page_number: 'Page 28',
    clause_text: 'The Bidder shall furnish as part of its Bid, a Bid Security in the amount of [Amount] in the form of an unconditional and irrevocable Bank Guarantee from any scheduled commercial bank.',
    implication: 'Must issue Bank Guarantee at least 7 days prior to bid submission. Validate format against Schedule C-1 exactly.',
  },
  {
    clause_title: 'Liquidated Damages (LD) & Delay Cap',
    category: 'PENALTY',
    criticality: 'HIGH',
    doc_file_name: 'Tender_GCC_PCC.pdf',
    doc_reference: 'Section 4 (GCC) Clause 27.1',
    page_number: 'Page 62',
    clause_text: 'Liquidated damages shall apply at 0.5% of the contract value per week of delay up to a maximum deduction of 10% of the total contract price.',
    implication: 'High delivery risk. Project schedule must include minimum 2-3 weeks buffer before key milestones.',
  },
  {
    clause_title: 'JV Lead Partner Minimum Equity & Experience',
    category: 'ELIGIBILITY',
    criticality: 'CRITICAL',
    doc_file_name: 'RFP_Volume_1_ITB.pdf',
    doc_reference: 'Section 3 (Evaluation) Clause 3.2',
    page_number: 'Page 35',
    clause_text: 'In case of Joint Venture, the Lead Partner must hold at least 51% share and satisfy at least 60% of the minimum turnover requirement.',
    implication: 'JV agreement must stipulate 51%+ lead equity and joint-several liability clause signed on non-judicial stamp.',
  },
  {
    clause_title: 'Defect Liability Period (DLP) & Retention Money',
    category: 'LEGAL_RISK',
    criticality: 'MEDIUM',
    doc_file_name: 'Tender_PCC.pdf',
    doc_reference: 'Section 5 (PCC) Clause 16.2',
    page_number: 'Page 88',
    clause_text: 'The Defect Liability Period shall be 12 months from final operational acceptance. Retention money of 5% will be released after DLP completion.',
    implication: 'Cash flow impact: 5% contract value locked for 12 months post-handover. Include cost of retention in financial model.',
  },
  {
    clause_title: 'OEM Manufacturer Authorization Form (MAF)',
    category: 'TECHNICAL_MANDATORY',
    criticality: 'CRITICAL',
    doc_file_name: 'TOR_Technical_Specs.pdf',
    doc_reference: 'Section 6 (TOR) Clause 8.4',
    page_number: 'Page 44',
    clause_text: 'Tenderer must submit valid Manufacturer Authorization Form (MAF) directly signed by OEM regional head authorizing supply and warranty commitment.',
    implication: 'Deal blocker. Engage OEM partner immediately to obtain original stamped authorization letter.',
  },
];

export const ImportantClausesManager: React.FC<ImportantClausesManagerProps> = ({
  clauses = [],
  onChange,
  readOnly = false,
  tenderDocuments = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ClauseCategory>('FINANCIAL');
  const [formCriticality, setFormCriticality] = useState<ClauseCriticality>('CRITICAL');
  const [formDocFile, setFormDocFile] = useState('');
  const [formDocRef, setFormDocRef] = useState('');
  const [formPageNum, setFormPageNum] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formImplication, setFormImplication] = useState('');

  const openAddModal = (preset?: Omit<ImportantClause, 'id'>) => {
    if (preset) {
      setFormTitle(preset.clause_title);
      setFormCategory(preset.category as ClauseCategory);
      setFormCriticality(preset.criticality as ClauseCriticality);
      setFormDocFile(preset.doc_file_name || '');
      setFormDocRef(preset.doc_reference);
      setFormPageNum(preset.page_number || '');
      setFormExcerpt(preset.clause_text);
      setFormImplication(preset.implication || '');
    } else {
      setFormTitle('');
      setFormCategory('FINANCIAL');
      setFormCriticality('CRITICAL');
      setFormDocFile(tenderDocuments[0]?.name || '');
      setFormDocRef('');
      setFormPageNum('');
      setFormExcerpt('');
      setFormImplication('');
    }
    setEditingClauseId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (clause: ImportantClause) => {
    setFormTitle(clause.clause_title);
    setFormCategory((clause.category as ClauseCategory) || 'FINANCIAL');
    setFormCriticality((clause.criticality as ClauseCriticality) || 'CRITICAL');
    setFormDocFile(clause.doc_file_name || '');
    setFormDocRef(clause.doc_reference || '');
    setFormPageNum(clause.page_number || '');
    setFormExcerpt(clause.clause_text || '');
    setFormImplication(clause.implication || '');
    setEditingClauseId(clause.id);
    setIsModalOpen(true);
  };

  const handleSaveClause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDocRef.trim()) return;

    if (editingClauseId) {
      const updated = clauses.map((c) =>
        c.id === editingClauseId
          ? {
              ...c,
              clause_title: formTitle.trim(),
              category: formCategory,
              criticality: formCriticality,
              doc_file_name: formDocFile.trim() || undefined,
              doc_reference: formDocRef.trim(),
              page_number: formPageNum.trim() || undefined,
              clause_text: formExcerpt.trim(),
              implication: formImplication.trim() || undefined,
            }
          : c
      );
      onChange?.(updated);
    } else {
      const newClause: ImportantClause = {
        id: `clause-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
        clause_title: formTitle.trim(),
        category: formCategory,
        criticality: formCriticality,
        doc_file_name: formDocFile.trim() || undefined,
        doc_reference: formDocRef.trim(),
        page_number: formPageNum.trim() || undefined,
        clause_text: formExcerpt.trim(),
        implication: formImplication.trim() || undefined,
      };
      onChange?.([...clauses, newClause]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClause = (id: string) => {
    onChange?.(clauses.filter((c) => c.id !== id));
  };

  const handleCopyClause = (clause: ImportantClause) => {
    const formatted = [
      `[TENDER CLAUSE REFERENCE] ${clause.clause_title}`,
      `Criticality: ${clause.criticality} | Category: ${clause.category}`,
      `Document: ${clause.doc_file_name || 'N/A'} | Ref: ${clause.doc_reference} ${clause.page_number ? `(${clause.page_number})` : ''}`,
      `\nEXCERPT:\n"${clause.clause_text}"`,
      clause.implication ? `\nSTRATEGIC ACTION / IMPLICATION:\n${clause.implication}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(formatted);
    setCopiedId(clause.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredClauses = useMemo(() => {
    return clauses.filter((c) => {
      const matchesSearch =
        searchTerm === '' ||
        c.clause_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.doc_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.doc_file_name && c.doc_file_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.clause_text && c.clause_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.implication && c.implication.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'ALL' || c.category === selectedCategory;

      const matchesCriticality =
        selectedCriticality === 'ALL' || c.criticality === selectedCriticality;

      return matchesSearch && matchesCategory && matchesCriticality;
    });
  }, [clauses, searchTerm, selectedCategory, selectedCriticality]);

  const criticalCount = clauses.filter((c) => c.criticality === 'CRITICAL').length;
  const highCount = clauses.filter((c) => c.criticality === 'HIGH').length;

  return (
    <div className="space-y-4">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-slate-900/80 p-4 rounded-xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Tender Document Clauses &amp; References
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                {clauses.length} Marked
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Pin critical conditions, legal risks, financial guarantees, and exact section citations extracted from RFP/ITB dossiers.
            </p>
          </div>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Mark Clause</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Presets Bar (Available if not read-only) */}
      {!readOnly && (
        <div className="bg-[#F8FAFC] dark:bg-slate-900/50 p-3.5 rounded-xl border border-[#E2E8F0] dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] dark:text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Industry RFP Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => openAddModal(preset)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50/80 dark:hover:bg-slate-700 text-[#334155] dark:text-slate-200 hover:text-blue-700 hover:border-blue-300 dark:hover:border-slate-600 border border-[#CBD5E1] dark:border-slate-700 shadow-2xs transition-all flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#64748B]" />
                <span>{preset.clause_title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by clause title, reference, page, or quote..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-[#CBD5E1] dark:border-slate-700 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-[#CBD5E1] dark:border-slate-700 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCriticality}
            onChange={(e) => setSelectedCriticality(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-[#CBD5E1] dark:border-slate-700 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Criticalities</option>
            <option value="CRITICAL">🔴 Critical Blocker ({criticalCount})</option>
            <option value="HIGH">🟠 High Risk ({highCount})</option>
            <option value="MEDIUM">🟡 Standard Compliance</option>
          </select>
        </div>
      </div>

      {/* Clauses List */}
      {filteredClauses.length === 0 ? (
        <Card className="p-10 text-center bg-white dark:bg-slate-900/40 border-2 border-dashed border-[#CBD5E1] dark:border-slate-700 rounded-xl shadow-none">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#0F172A] dark:text-white mb-1">No Important Clauses Marked</h4>
          <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
            Mark crucial clauses directly from the tender RFP, GCC, or PCC documents with exact section citations and page numbers to prevent non-compliance.
          </p>
          {!readOnly && (
            <button
              type="button"
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mark First Clause</span>
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredClauses.map((clause) => {
            const catMeta = CATEGORIES.find((c) => c.value === clause.category) || CATEGORIES[5];
            const CatIcon = catMeta.icon;

            const isCritical = clause.criticality === 'CRITICAL';
            const isHigh = clause.criticality === 'HIGH';

            return (
              <div
                key={clause.id}
                className="relative group bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 rounded-xl p-4 transition-all shadow-xs"
              >
                {/* Top Header Row with Action Toolbar */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Criticality Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        isCritical
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30'
                          : isHigh
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                          : 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30'
                      }`}
                    >
                      {isCritical ? (
                        <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                      ) : isHigh ? (
                        <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <ShieldAlert className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                      )}
                      {clause.criticality}
                    </span>

                    {/* Category Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${catMeta.color}`}
                    >
                      <CatIcon className="w-3 h-3" />
                      {catMeta.label}
                    </span>
                  </div>

                  {/* Top-of-field Action Toolbar: Copy, Edit, Delete */}
                  <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg p-1 shadow-2xs">
                    <button
                      type="button"
                      title="Copy citation and excerpt"
                      onClick={() => handleCopyClause(clause)}
                      className="p-1 text-[#64748B] hover:text-[#0F172A] dark:text-slate-300 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      {copiedId === clause.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {!readOnly && (
                      <>
                        <button
                          type="button"
                          title="Edit clause details"
                          onClick={() => openEditModal(clause)}
                          className="p-1 text-[#64748B] hover:text-blue-600 dark:text-slate-300 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                        </button>
                        <button
                          type="button"
                          title="Delete clause"
                          onClick={() => handleDeleteClause(clause.id)}
                          className="p-1 text-[#64748B] hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Clause Title */}
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-white mb-2">
                  {clause.clause_title}
                </h4>

                {/* Exact Document Reference Pill */}
                <div className="flex flex-wrap items-center gap-2 mb-3 text-xs bg-[#F1F5F9] dark:bg-slate-950/60 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-800 text-[#475569] dark:text-slate-300">
                  <span className="font-semibold text-blue-600 dark:text-indigo-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {clause.doc_file_name || 'Tender Document'}
                  </span>
                  <span className="text-[#94A3B8]">•</span>
                  <span className="font-medium text-[#1E293B] dark:text-slate-200">
                    Ref: {clause.doc_reference}
                  </span>
                  {clause.page_number && (
                    <>
                      <span className="text-[#94A3B8]">•</span>
                      <span className="text-amber-700 dark:text-amber-300 font-medium">
                        {clause.page_number}
                      </span>
                    </>
                  )}
                </div>

                {/* Exact Clause Excerpt */}
                {clause.clause_text && (
                  <div className="relative pl-3 border-l-2 border-blue-500 bg-blue-50/50 dark:bg-slate-950/40 p-3 rounded-r-lg mb-2.5 text-xs text-[#1E293B] dark:text-slate-300 font-serif italic leading-relaxed">
                    <span className="text-blue-600 font-bold mr-1">“</span>
                    {clause.clause_text}
                    <span className="text-blue-600 font-bold ml-1">”</span>
                  </div>
                )}

                {/* Strategic Action Required / Implication */}
                {clause.implication && (
                  <div className="text-xs bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3 text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-800 dark:text-amber-300">Strategic Compliance Action: </span>
                      <span>{clause.implication}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                  {editingClauseId ? 'Edit Marked Clause' : 'Mark Important Tender Clause'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClause} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-300 mb-1">
                  Clause Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bid Security Bank Guarantee, Liquidated Damages Cap"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-800 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-300 mb-1">
                    Criticality Level
                  </label>
                  <select
                    value={formCriticality}
                    onChange={(e) => setFormCriticality(e.target.value as ClauseCriticality)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="CRITICAL">🔴 CRITICAL - Deal Blocker</option>
                    <option value="HIGH">🟠 HIGH - Significant Financial/Legal Risk</option>
                    <option value="MEDIUM">🟡 MEDIUM - Standard Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-300 mb-1">
                    Clause Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ClauseCategory)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Reference Grid */}
              <div className="p-3.5 bg-[#F8FAFC] dark:bg-slate-950/60 rounded-xl border border-[#E2E8F0] dark:border-slate-800/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-indigo-400">
                  <FileText className="w-4 h-4" />
                  <span>Exact Document Reference Citation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-[#475569] dark:text-slate-400 mb-1">
                      Document File Name
                    </label>
                    <input
                      type="text"
                      list="doc-names-list"
                      placeholder="e.g. RFP_Volume_1.pdf"
                      value={formDocFile}
                      onChange={(e) => setFormDocFile(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-[#CBD5E1] dark:border-slate-700 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <datalist id="doc-names-list">
                      {tenderDocuments.map((d) => (
                        <option key={d.id} value={d.name} />
                      ))}
                      <option value="RFP_Volume_1_ITB.pdf" />
                      <option value="Tender_GCC_PCC.pdf" />
                      <option value="TOR_Technical_Specifications.pdf" />
                      <option value="Financial_BOQ_Schedule.xlsx" />
                    </datalist>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-[#475569] dark:text-slate-400 mb-1">
                      Section &amp; Clause Ref <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Section 2 (ITB) Clause 14.1"
                      value={formDocRef}
                      onChange={(e) => setFormDocRef(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-[#CBD5E1] dark:border-slate-700 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-[#475569] dark:text-slate-400 mb-1">
                      Page Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Page 28"
                      value={formPageNum}
                      onChange={(e) => setFormPageNum(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-[#CBD5E1] dark:border-slate-700 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Exact Clause Excerpt */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-300 mb-1">
                  Exact Clause Excerpt (Quoted from RFP)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste or type exact clause wording from the tender dossier..."
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-800 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-blue-500 font-serif italic"
                />
              </div>

              {/* Strategic Implication / Action Required */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-300 mb-1">
                  Strategic Action / Compliance Implication
                </label>
                <textarea
                  rows={2}
                  placeholder="What must the bid team do to comply or mitigate this clause?"
                  value={formImplication}
                  onChange={(e) => setFormImplication(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-800 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {editingClauseId ? 'Save Changes' : 'Add Clause'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
