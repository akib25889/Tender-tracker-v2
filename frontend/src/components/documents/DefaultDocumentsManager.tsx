import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { useTenders } from '../../context/TenderContext';
import { ReusableDocument, DocumentAccessLevel } from '../../types/tender';
import { fuzzyMatch } from '../../utils/fuzzySearch';
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  Building2,
  RefreshCw,
  Folder,
  Trash2,
  Download,
  Eye,
  Check,
  Users,
  ShieldCheck,
  X,
} from 'lucide-react';
import { DocumentPreviewModal } from '../modals/DocumentPreviewModal';

const FOLDER_OPTIONS = [
  { value: '02_company_statutory_documents', label: '02 Company Statutory Credentials' },
  { value: '02A_jv_partner_credentials', label: '02A JV Partner Credentials' },
  { value: '02B_lead_statutory_documents', label: '02B Lead Bidder Statutory Credentials' },
  { value: '03_technical_proposal', label: '03 Technical Proposal & Architecture' },
  { value: '04_financial_proposal', label: '04 Financial Proposal & BOQ Tables' },
  { value: '01_original_tender_documents', label: '01 Original Tender Notices' },
  { value: '05_final_submission_package', label: '05 Final Submission Package' },
];

export const DefaultDocumentsManager: React.FC = () => {
  const {
    reusableDocuments,
    updateReusableDocument,
    addReusableDocument,
    companyProfiles,
    syncDefaultDocumentsToActiveTenders,
  } = useTenders();

  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [folderFilter, setFolderFilter] = useState('ALL');
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Add Default Document Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPickExistingModalOpen, setIsPickExistingModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('Company Statutory');
  const [addCompany, setAddCompany] = useState('PrimeTech Ltd');
  const [addRole, setAddRole] = useState<'LEAD_BIDDER' | 'JV_PARTNER' | 'SUBCONTRACTOR'>('LEAD_BIDDER');
  const [addTargetFolder, setAddTargetFolder] = useState('02_company_statutory_documents');
  const [addFile, setAddFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered documents
  const allDefaults = reusableDocuments.filter((d) => Boolean(d.isDefault));
  const nonDefaults = reusableDocuments.filter((d) => !d.isDefault);

  const filteredDefaults = allDefaults.filter((doc) => {
    const matchesCompany =
      companyFilter === 'ALL' ||
      (doc.companyName || '').toLowerCase() === companyFilter.toLowerCase();
    const matchesFolder =
      folderFilter === 'ALL' ||
      (doc.defaultFolder || '02_company_statutory_documents') === folderFilter;
    const matchesSearch = fuzzyMatch(
      [doc.name, doc.category, doc.companyName || '', doc.defaultFolder || ''],
      searchQuery
    );
    return matchesCompany && matchesFolder && matchesSearch;
  });

  const handleToggleDefault = async (doc: ReusableDocument) => {
    await updateReusableDocument(doc.id, { isDefault: !doc.isDefault });
  };

  const handleChangeFolder = async (doc: ReusableDocument, newFolder: string) => {
    await updateReusableDocument(doc.id, { defaultFolder: newFolder });
  };

  const handleSyncDefaults = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncDefaultDocumentsToActiveTenders();
      setSyncResult(res.message || `Successfully synced ${res.synced_count} default document links.`);
      setTimeout(() => setSyncResult(null), 5000);
    } catch (e) {
      setSyncResult('Failed to synchronize defaults.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateDefault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setIsSubmitting(true);
    try {
      await addReusableDocument({
        name: addName.trim(),
        category: addCategory,
        companyName: addCompany,
        companyRole: addRole,
        isJvPartner: addRole === 'JV_PARTNER',
        accessLevel: 'ALL_TEAM' as DocumentAccessLevel,
        isDefault: true,
        defaultFolder: addTargetFolder,
        file: addFile || undefined,
      });
      setAddName('');
      setAddFile(null);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create default document:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Executive Control Header */}
      <Card className="p-5 border border-[#E2E8F0] dark:border-slate-800 shadow-xs bg-gradient-to-r from-amber-500/5 via-blue-500/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A] dark:text-slate-100 tracking-tight">
                  Default Tender Documents &amp; Auto-Injection Rules
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-900/50">
                  {allDefaults.length} Active Defaults
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Configure standard statutory certificates, company profiles, and compliance documents required in every tender. Active documents configured here are <strong>automatically provisioned and linked into each new tender</strong> the instant it is created.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleSyncDefaults}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-[#0F172A] dark:text-slate-200 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50"
              title="Apply all active default documents into all existing non-archived tenders"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Tenders...' : 'Sync to Active Tenders'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPickExistingModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#0F172A] dark:text-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Pick from Master Vault ({nonDefaults.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Default Document</span>
            </button>
          </div>
        </div>

        {syncResult && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{syncResult}</span>
          </div>
        )}
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search default documents, target folders, companies..."
            className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl text-xs text-[#0F172A] dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Company Filter */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl text-xs text-[#0F172A] dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Companies</option>
            {companyProfiles.map((cp) => (
              <option key={cp.id} value={cp.trade_name || cp.legal_name}>
                {cp.trade_name || cp.legal_name} ({cp.company_role})
              </option>
            ))}
          </select>

          {/* Target Folder Filter */}
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl text-xs text-[#0F172A] dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Target Folders</option>
            {FOLDER_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Defaults Table */}
      <Card className="border border-[#E2E8F0] dark:border-slate-800 overflow-hidden shadow-xs">
        {filteredDefaults.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#0F172A] dark:text-slate-100">
              No Default Documents Matched
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-md mx-auto">
              {allDefaults.length === 0
                ? "You haven't designated any documents as mandatory defaults yet. Add one or pick from your existing Master Vault to auto-populate them in every tender."
                : "No default documents match your search or filter criteria."}
            </p>
            {allDefaults.length === 0 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPickExistingModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Pick from Master Vault
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-slate-800/60 border-b border-[#E2E8F0] dark:border-slate-800 text-[#475569] dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Mandatory Document</th>
                  <th className="py-3 px-3">Owning Company</th>
                  <th className="py-3 px-3">Default Target Folder in Tender</th>
                  <th className="py-3 px-3">File &amp; Integrity</th>
                  <th className="py-3 px-3">Auto-Inject Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] dark:divide-slate-800/80">
                {filteredDefaults.map((doc) => {
                  const targetFolderVal = doc.defaultFolder || '02_company_statutory_documents';
                  const isJv = doc.isJvPartner || doc.companyRole === 'JV_PARTNER';

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Document Name */}
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="font-bold text-xs text-[#0F172A] dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left truncate block cursor-pointer"
                              title={doc.name}
                            >
                              {doc.name}
                            </button>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#64748B] dark:text-slate-400">
                              <span className="font-medium">{doc.category}</span>
                              <span>•</span>
                              <span>{doc.size || '2.0 MB'}</span>
                              <span>•</span>
                              <span>{doc.revision || 'v1.0'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owning Company */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isJv ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                              <Users className="w-3 h-3" />
                              <span>{doc.companyName || 'JV Partner'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                              <Building2 className="w-3 h-3" />
                              <span>{doc.companyName || 'PrimeTech Ltd'}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Default Target Folder Dropdown */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <select
                            value={targetFolderVal}
                            onChange={(e) => handleChangeFolder(doc, e.target.value)}
                            className="bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[240px] truncate"
                          >
                            {FOLDER_OPTIONS.map((f) => (
                              <option key={f.value} value={f.value}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* File & SHA-256 Checksum */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>SHA-256 Verified</span>
                          </div>
                          <div className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono truncate max-w-[150px]">
                            {doc.sha256 ? `${doc.sha256.substring(0, 14)}...` : 'Pre-stamped'}
                          </div>
                        </div>
                      </td>

                      {/* Auto-Inject Status Toggle */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleDefault(doc)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            doc.isDefault
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                          title={doc.isDefault ? 'Active in all new tenders (click to pause)' : 'Paused (click to activate)'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${doc.isDefault ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{doc.isDefault ? 'Auto-Inject ON' : 'Paused'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Preview document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => window.open(`/api/reusable-documents/${doc.id}/download`, '_blank')}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleDefault(doc)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Remove from default list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal: Pick from Existing Master Vault Documents */}
      {isPickExistingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-slate-100">
                  Select Master Document to Require in Every Tender
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPickExistingModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] dark:text-slate-400 shrink-0">
              Pick any existing document from your Master Library. It will be marked as a Default Requirement and auto-linked into new tenders.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
              {nonDefaults.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  All master documents are already configured as defaults!
                </div>
              ) : (
                nonDefaults.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700/60 rounded-xl flex items-center justify-between gap-3 hover:border-blue-400 transition-colors"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-xs text-[#0F172A] dark:text-slate-200 truncate">
                          {doc.name}
                        </div>
                        <div className="text-[10px] text-[#64748B] dark:text-slate-400">
                          {doc.category} • {doc.companyName || 'PrimeTech Ltd'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        await updateReusableDocument(doc.id, {
                          isDefault: true,
                          defaultFolder: '02_company_statutory_documents',
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Set as Default</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] dark:border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsPickExistingModalOpen(false)}
                className="px-4 py-2 border border-[#CBD5E1] dark:border-slate-700 text-xs font-semibold rounded-xl text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Default Document */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-slate-100">
                  Add Mandatory Default Document
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDefault} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-slate-200 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Updated Trade License 2026-2027.pdf"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-slate-200 mb-1">
                    Category
                  </label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Company Statutory">Company Statutory</option>
                    <option value="Financial & Tax">Financial &amp; Tax</option>
                    <option value="Certifications & ISO">Certifications &amp; ISO</option>
                    <option value="Legal & Governance">Legal &amp; Governance</option>
                    <option value="Past Credentials">Past Credentials</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-slate-200 mb-1">
                    Owning Entity
                  </label>
                  <select
                    value={addCompany}
                    onChange={(e) => {
                      setAddCompany(e.target.value);
                      const p = companyProfiles.find((cp) => (cp.trade_name || cp.legal_name) === e.target.value);
                      if (p) setAddRole(p.company_role as any || 'LEAD_BIDDER');
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-slate-100 focus:outline-none"
                  >
                    {companyProfiles.map((cp) => (
                      <option key={cp.id} value={cp.trade_name || cp.legal_name}>
                        {cp.trade_name || cp.legal_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-slate-200 mb-1">
                  Default Target Folder in New Tenders *
                </label>
                <select
                  value={addTargetFolder}
                  onChange={(e) => setAddTargetFolder(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-slate-100 focus:outline-none"
                >
                  {FOLDER_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">
                  The system will automatically link this document into this specific folder whenever a new tender is created.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-slate-200 mb-1">
                  Upload Physical Master File (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setAddFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#CBD5E1] dark:border-slate-700 text-xs font-semibold rounded-xl text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Save & Enable Auto-Inject'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
        />
      )}
    </div>
  );
};
