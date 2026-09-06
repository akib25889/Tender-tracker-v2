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
  { value: 'FINANCIAL', label: 'Financial & Guarantees', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: DollarSign },
  { value: 'LEGAL_RISK', label: 'Legal & Risk Exposure', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', icon: Scale },
  { value: 'TECHNICAL_MANDATORY', label: 'Technical Mandatory', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30', icon: FileCheck },
  { value: 'ELIGIBILITY', label: 'Eligibility & Turnover', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', icon: Shield },
  { value: 'PENALTY', label: 'Penalties & LD Cap', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: AlertTriangle },
  { value: 'OTHER', label: 'General / Other', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30', icon: BookOpen },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">
              Tender Document Clauses & References
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {clauses.length} Marked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pin critical conditions, legal risks, financial guarantees, and exact section citations extracted from RFP/ITB tender dossiers.
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Mark Clause
            </button>
          </div>
        )}
      </div>

      {/* Quick Presets Bar (Available if not read-only) */}
      {!readOnly && (
        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-slate-300">Quick Industry RFP Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => openAddModal(preset)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span>+</span>
                <span>{preset.clause_title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by clause title, reference, page, or quote..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
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
            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
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
        <Card className="p-8 text-center bg-slate-900/30 border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-medium text-white mb-1">No Important Clauses Marked</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Mark crucial clauses directly from the tender RFP, GCC, or PCC documents with exact section citations and page numbers to prevent non-compliance.
          </p>
          {!readOnly && (
            <button
              type="button"
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Mark First Clause
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
                className="relative group bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-sm"
              >
                {/* Top Header Row with Action Toolbar */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Criticality Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        isCritical
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : isHigh
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      }`}
                    >
                      {isCritical ? (
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                      ) : isHigh ? (
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      ) : (
                        <ShieldAlert className="w-3 h-3 text-sky-400" />
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
                  <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg p-1 shadow-sm">
                    <button
                      type="button"
                      title="Copy citation and excerpt"
                      onClick={() => handleCopyClause(clause)}
                      className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                    >
                      {copiedId === clause.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                          className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                        <button
                          type="button"
                          title="Delete clause"
                          onClick={() => handleDeleteClause(clause.id)}
                          className="p-1 text-slate-300 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Clause Title */}
                <h4 className="text-sm font-semibold text-white mb-2">
                  {clause.clause_title}
                </h4>

                {/* Exact Document Reference Pill */}
                <div className="flex flex-wrap items-center gap-2 mb-3 text-xs bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80 text-slate-300">
                  <span className="font-semibold text-indigo-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {clause.doc_file_name || 'Tender Document'}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="font-medium text-slate-200">
                    Ref: {clause.doc_reference}
                  </span>
                  {clause.page_number && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-300/90 font-medium">
                        {clause.page_number}
                      </span>
                    </>
                  )}
                </div>

                {/* Exact Clause Excerpt */}
                {clause.clause_text && (
                  <div className="relative pl-3 border-l-2 border-indigo-500/60 bg-slate-950/40 p-2.5 rounded-r-lg mb-2.5 text-xs text-slate-300 font-serif italic leading-relaxed">
                    <span className="text-indigo-400 font-bold mr-1">“</span>
                    {clause.clause_text}
                    <span className="text-indigo-400 font-bold ml-1">”</span>
                  </div>
                )}

                {/* Strategic Action Required / Implication */}
                {clause.implication && (
                  <div className="text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-amber-200/90 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300">Strategic Compliance Action: </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  {editingClauseId ? 'Edit Marked Clause' : 'Mark Important Tender Clause'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClause} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Clause Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bid Security Bank Guarantee, Liquidated Damages Cap"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Criticality Level
                  </label>
                  <select
                    value={formCriticality}
                    onChange={(e) => setFormCriticality(e.target.value as ClauseCriticality)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CRITICAL">🔴 CRITICAL - Deal Blocker</option>
                    <option value="HIGH">🟠 HIGH - Significant Financial/Legal Risk</option>
                    <option value="MEDIUM">🟡 MEDIUM - Standard Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Clause Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ClauseCategory)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
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
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                  <FileText className="w-4 h-4" />
                  <span>Exact Document Reference Citation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Document File Name
                    </label>
                    <input
                      type="text"
                      list="doc-names-list"
                      placeholder="e.g. RFP_Volume_1.pdf"
                      value={formDocFile}
                      onChange={(e) => setFormDocFile(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Section & Clause Ref <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Section 2 (ITB) Clause 14.1"
                      value={formDocRef}
                      onChange={(e) => setFormDocRef(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Page Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Page 28"
                      value={formPageNum}
                      onChange={(e) => setFormPageNum(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Exact Clause Excerpt */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Exact Clause Excerpt (Quoted from RFP)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste or type exact clause wording from the tender dossier..."
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-serif italic"
                />
              </div>

              {/* Strategic Implication / Action Required */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Strategic Action / Compliance Implication
                </label>
                <textarea
                  rows={2}
                  placeholder="What must the bid team do to comply or mitigate this clause?"
                  value={formImplication}
                  onChange={(e) => setFormImplication(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors"
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

