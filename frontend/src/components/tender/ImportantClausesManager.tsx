import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { ImportantClause, ClauseCriticality, ClauseCategory, TenderDocument, TenderAmendment } from '../../types/tender';
import { useTenders } from '../../context/TenderContext';
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
  Clock,
} from 'lucide-react';

interface ImportantClausesManagerProps {
  clauses: ImportantClause[];
  onChange?: (clauses: ImportantClause[]) => void;
  readOnly?: boolean;
  tenderDocuments?: TenderDocument[];
  tenderId?: string;
  tenderTitle?: string;
  amendments?: TenderAmendment[];
  tenderSubmissionDeadline?: string;
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
  tenderId,
  tenderTitle,
  amendments,
  tenderSubmissionDeadline,
}) => {
  const { tenders, addTenderAmendment, showSuccessNotification } = useTenders();
  const currentTender = tenderId ? tenders.find((t) => t.id === tenderId) : undefined;
  const currentAmendments = amendments || currentTender?.amendments || [];
  const currentDeadline = tenderSubmissionDeadline || currentTender?.submissionDeadline;
  const currentTitle = tenderTitle || currentTender?.title || tenderId || 'Tender';

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

  // Corrigenda Modal State
  const [isAmendmentModalOpen, setIsAmendmentModalOpen] = useState(false);
  const [amendmentForm, setAmendmentForm] = useState({
    corrigendumNumber: '',
    title: '',
    issueDate: new Date().toISOString().split('T')[0],
    isDeadlineExtension: false,
    newDeadlineDate: '',
    newDeadlineHour: '17',
    newDeadlineMinute: '00',
    newDeadlineTimezone: 'BST',
    rulesChanged: '',
    referenceMemo: '',
    addToImportantClauses: true,
  });
  const [isSubmittingAmendment, setIsSubmittingAmendment] = useState(false);

  const handleSaveAmendment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendmentForm.corrigendumNumber.trim() || !amendmentForm.title.trim()) return;
    setIsSubmittingAmendment(true);

    try {
      let combinedDeadline: string | undefined = undefined;
      if (amendmentForm.isDeadlineExtension && amendmentForm.newDeadlineDate) {
        combinedDeadline = `${amendmentForm.newDeadlineDate} ${amendmentForm.newDeadlineHour}:${amendmentForm.newDeadlineMinute} ${amendmentForm.newDeadlineTimezone}`.trim();
      }

      const activeTid = tenderId || currentTender?.id;
      if (activeTid) {
        await addTenderAmendment(activeTid, {
          amendmentNumber: amendmentForm.corrigendumNumber.trim(),
          corrigendumNumber: amendmentForm.corrigendumNumber.trim(),
          title: amendmentForm.title.trim(),
          issuedDate: amendmentForm.issueDate,
          issueDate: amendmentForm.issueDate,
          isDeadlineExtended: amendmentForm.isDeadlineExtension,
          isDeadlineExtension: amendmentForm.isDeadlineExtension,
          newDeadline: combinedDeadline,
          newRules: amendmentForm.rulesChanged ? [amendmentForm.rulesChanged.trim()] : [],
          ruleChangesDescription: amendmentForm.rulesChanged.trim() || undefined,
          rulesChanged: amendmentForm.rulesChanged.trim() || undefined,
          referenceNotice: amendmentForm.referenceMemo.trim() || undefined,
          referenceMemo: amendmentForm.referenceMemo.trim() || undefined,
        });
      }

      if (amendmentForm.addToImportantClauses && amendmentForm.rulesChanged.trim()) {
        const newClause: ImportantClause = {
          id: `clause-corrigendum-${Date.now().toString(36)}`,
          clause_title: `Corrigendum #${amendmentForm.corrigendumNumber}: ${amendmentForm.title.trim().slice(0, 45)}`,
          category: 'TECHNICAL_MANDATORY',
          criticality: 'CRITICAL',
          doc_file_name: tenderDocuments[0]?.name || 'Corrigendum Notice',
          doc_reference: amendmentForm.referenceMemo.trim() || amendmentForm.corrigendumNumber.trim(),
          clause_text: amendmentForm.rulesChanged.trim(),
          implication: 'Introduced via client corrigendum / amendment notice.',
        };
        onChange?.([...clauses, newClause]);
      }

      setIsAmendmentModalOpen(false);
      setAmendmentForm({
        corrigendumNumber: '',
        title: '',
        issueDate: new Date().toISOString().split('T')[0],
        isDeadlineExtension: false,
        newDeadlineDate: '',
        newDeadlineHour: '17',
        newDeadlineMinute: '00',
        newDeadlineTimezone: 'BST',
        rulesChanged: '',
        referenceMemo: '',
        addToImportantClauses: true,
      });
      showSuccessNotification('Corrigendum amendment recorded and active countdown updated.', 'Corrigendum Issued');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAmendment(false);
    }
  };

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

      {/* Corrigenda, Addenda & Rule Amendments Card */}
      <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#F1F5F9] dark:border-slate-800 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white tracking-tight">
              Corrigenda, Addenda &amp; Rule Amendments
            </h3>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {currentAmendments.length} Recorded
            </span>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setIsAmendmentModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400 dark:text-white" />
              <span>+ Record Corrigendum</span>
            </button>
          )}
        </div>

        <div className="p-5">
          {(!currentAmendments || currentAmendments.length === 0) ? (
            <div className="py-6 text-center text-[#64748B] dark:text-slate-400 text-xs">
              <p>No corrigendum or tender amendments have been issued yet for this RFP.</p>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setIsAmendmentModalOpen(true)}
                  className="mt-2 text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  + Issue Corrigendum / Extend Submission Deadline / Amend Rules
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {currentAmendments.map((amd, idx) => (
                <div
                  key={amd.id || idx}
                  className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-950/20 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-white">
                        {amd.corrigendumNumber || (amd.amendmentNumber ? `Corrigendum #${amd.amendmentNumber}` : `Amendment #${idx + 1}`)}
                      </span>
                      <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">
                        {amd.title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-[#64748B] dark:text-slate-400">
                      Issued: {amd.issueDate || amd.issuedDate || '—'}
                    </span>
                  </div>

                  {(amd.isDeadlineExtension || amd.isDeadlineExtended) && (
                    <div className="flex items-center gap-2 text-xs p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-medium">
                      <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        <strong>Submission Deadline Extended:</strong> {amd.oldDeadline || amd.previousDeadline ? `From ${amd.oldDeadline || amd.previousDeadline} → ` : ''}
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">{amd.newDeadline || currentDeadline}</span>
                      </span>
                    </div>
                  )}

                  {(amd.rulesChanged || amd.ruleChangesDescription || (amd.newRules && amd.newRules.length > 0)) && (
                    <div className="text-xs text-[#334155] dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-[#E2E8F0] dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block">
                        Amended Rules &amp; Clause Modifications:
                      </span>
                      <p className="whitespace-pre-line leading-relaxed">
                        {amd.rulesChanged || amd.ruleChangesDescription || (amd.newRules ? amd.newRules.join('\n') : '')}
                      </p>
                    </div>
                  )}

                  {(amd.referenceMemo || amd.referenceNotice) && (
                    <div className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-1.5 font-mono">
                      <span>Ref / Circular / Memo:</span>
                      <span className="font-semibold text-[#0F172A] dark:text-slate-200">{amd.referenceMemo || amd.referenceNotice}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
        <div className="space-y-3">
          {filteredClauses.map((clause) => {
            const catMeta = CATEGORIES.find((c) => c.value === clause.category) || CATEGORIES[5];
            const CatIcon = catMeta.icon;

            const isCritical = clause.criticality === 'CRITICAL';
            const isHigh = clause.criticality === 'HIGH';

            const accentColor = isCritical
              ? 'border-l-rose-500'
              : isHigh
              ? 'border-l-amber-500'
              : 'border-l-sky-400';

            return (
              <div
                key={clause.id}
                className={`relative bg-white dark:bg-slate-900/70 border border-[#E2E8F0] dark:border-slate-800 border-l-4 ${accentColor} rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow`}
              >
                {/* Card Body */}
                <div className="p-4">
                  {/* Row 1: Badges + Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Criticality Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${
                          isCritical
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30'
                            : isHigh
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                            : 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30'
                        }`}
                      >
                        {isCritical ? (
                          <AlertCircle className="w-2.5 h-2.5" />
                        ) : isHigh ? (
                          <AlertTriangle className="w-2.5 h-2.5" />
                        ) : (
                          <ShieldAlert className="w-2.5 h-2.5" />
                        )}
                        {clause.criticality}
                      </span>

                      {/* Category Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${catMeta.color}`}
                      >
                        <CatIcon className="w-2.5 h-2.5" />
                        {catMeta.label}
                      </span>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        title="Copy citation and excerpt"
                        onClick={() => handleCopyClause(clause)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {copiedId === clause.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {!readOnly && (
                        <>
                          <button
                            type="button"
                            title="Edit clause"
                            onClick={() => openEditModal(clause)}
                            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete clause"
                            onClick={() => handleDeleteClause(clause.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Title */}
                  <h4 className="text-sm font-bold text-[#0F172A] dark:text-white mb-2.5 leading-snug">
                    {clause.clause_title}
                  </h4>

                  {/* Row 3: Document Reference Strip */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[11px] text-[#64748B] dark:text-slate-400">
                    {(clause.doc_file_name) && (
                      <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-indigo-400">
                        <FileText className="w-3 h-3 shrink-0" />
                        {clause.doc_file_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-[#334155] dark:text-slate-300">Ref:</span>
                      {clause.doc_reference}
                    </span>
                    {clause.page_number && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/40 font-semibold">
                        p. {clause.page_number}
                      </span>
                    )}
                  </div>

                  {/* Row 4: Clause Excerpt */}
                  {clause.clause_text && (
                    <blockquote className="border-l-2 border-blue-400 dark:border-blue-500/60 pl-3 pr-2 py-2 bg-slate-50 dark:bg-slate-950/50 rounded-r-lg mb-2.5 text-[11px] text-[#334155] dark:text-slate-300 font-serif italic leading-relaxed">
                      {clause.clause_text}
                    </blockquote>
                  )}

                  {/* Row 5: Strategic Action */}
                  {clause.implication && (
                    <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-lg px-3 py-2 text-[11px] text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p>
                        <span className="font-bold text-amber-800 dark:text-amber-300">Action: </span>
                        {clause.implication}
                      </p>
                    </div>
                  )}
                </div>
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

      {/* RECORD CORRIGENDUM / AMENDMENT MODAL */}
      {isAmendmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-scaleIn my-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-slate-100">
                    Record Corrigendum / Tender Amendment
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    Tender Reference: <span className="font-semibold text-[#0F172A] dark:text-slate-200">{tenderId || 'Current Proposal'}</span> {currentTitle ? `• ${currentTitle}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAmendmentModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-slate-200 text-lg font-bold p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#475569] dark:text-slate-300 leading-relaxed">
              Record official client notices, addenda, deadline extensions, or rule modifications issued by the procuring entity. Submitting will update the active countdown timer and log compliance clauses.
            </p>

            <form onSubmit={handleSaveAmendment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                    Corrigendum / Addendum # *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Corrigendum No. 1, Addendum 02"
                    value={amendmentForm.corrigendumNumber}
                    onChange={(e) => setAmendmentForm({ ...amendmentForm, corrigendumNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100 font-mono focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                    Official Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={amendmentForm.issueDate}
                    onChange={(e) => setAmendmentForm({ ...amendmentForm, issueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                  Amendment Title / Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Time Extension for Bid Submission & Technical Specification Revisions"
                  value={amendmentForm.title}
                  onChange={(e) => setAmendmentForm({ ...amendmentForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Deadline Extension Toggle */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-3">
                <label className="flex items-center gap-2 font-bold text-[#0F172A] dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amendmentForm.isDeadlineExtension}
                    onChange={(e) => setAmendmentForm({ ...amendmentForm, isDeadlineExtension: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                  <span>Extends Tender Submission Deadline &amp; Cutoff Time</span>
                </label>

                {amendmentForm.isDeadlineExtension && (
                  <div className="space-y-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                    {currentDeadline && (
                      <div className="text-[11px] text-[#64748B] dark:text-slate-400">
                        Current Active Deadline: <span className="font-mono font-bold text-[#0F172A] dark:text-slate-200">{currentDeadline}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#475569] dark:text-slate-300 mb-1">
                          New Extended Date *
                        </label>
                        <input
                          type="date"
                          required={amendmentForm.isDeadlineExtension}
                          value={amendmentForm.newDeadlineDate}
                          onChange={(e) => setAmendmentForm({ ...amendmentForm, newDeadlineDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#475569] dark:text-slate-300 mb-1">
                          Time (HH:MM)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            maxLength={2}
                            placeholder="17"
                            value={amendmentForm.newDeadlineHour}
                            onChange={(e) => setAmendmentForm({ ...amendmentForm, newDeadlineHour: e.target.value })}
                            className="w-12 px-2 py-1.5 text-center bg-white dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100 font-mono"
                          />
                          <span>:</span>
                          <input
                            type="text"
                            maxLength={2}
                            placeholder="00"
                            value={amendmentForm.newDeadlineMinute}
                            onChange={(e) => setAmendmentForm({ ...amendmentForm, newDeadlineMinute: e.target.value })}
                            className="w-12 px-2 py-1.5 text-center bg-white dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#475569] dark:text-slate-300 mb-1">
                          Zone
                        </label>
                        <select
                          value={amendmentForm.newDeadlineTimezone}
                          onChange={(e) => setAmendmentForm({ ...amendmentForm, newDeadlineTimezone: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100"
                        >
                          <option value="BST">BST (UTC+6)</option>
                          <option value="UTC">UTC (GMT)</option>
                          <option value="EST">EST (UTC-5)</option>
                          <option value="PST">PST (UTC-8)</option>
                          <option value="CET">CET (UTC+1)</option>
                          <option value="IST">IST (UTC+5:30)</option>
                          <option value="SGT">SGT (UTC+8)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rules / Terms Changed */}
              <div>
                <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                  Amended Rules, Clause Additions &amp; Requirements Revised
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail any changes to qualification criteria, turnover, warranty, liquidated damages, or technical specifications..."
                  value={amendmentForm.rulesChanged}
                  onChange={(e) => setAmendmentForm({ ...amendmentForm, rulesChanged: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100 leading-relaxed focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Reference Memo / Circular */}
              <div>
                <label className="block font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                  Authority Circular / Memo / Portal Notice Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Memo No. 46.02.0000.000.14.001.26-892 or e-GP Notice Ref"
                  value={amendmentForm.referenceMemo}
                  onChange={(e) => setAmendmentForm({ ...amendmentForm, referenceMemo: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100 font-mono focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Append to Important Clauses Checkbox */}
              <label className="flex items-center gap-2 text-xs text-[#475569] dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={amendmentForm.addToImportantClauses}
                  onChange={(e) => setAmendmentForm({ ...amendmentForm, addToImportantClauses: e.target.checked })}
                  className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-blue-500"
                />
                <span>Automatically sync new rules into Tender Important Clauses &amp; Compliance Matrix</span>
              </label>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAmendmentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#475569] dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAmendment}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isSubmittingAmendment ? 'Recording Amendment...' : 'Record Corrigendum'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
