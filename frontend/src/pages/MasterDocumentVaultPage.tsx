import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { DocumentAccessLevel, ReusableDocument } from '../types/tender';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Download,
  Shield,
  Lock,
  Calendar,
  Link as LinkIcon,
  X,
  CheckCircle2,
  FileText,
  Building2,
  Award,
  Users,
  DollarSign,
  Scale,
  Share2,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  'Company Statutory': Building2,
  'Financial & Tax': DollarSign,
  'Certifications & ISO': Award,
  'Key Personnel CV': Users,
  'Past Credentials': CheckCircle2,
  'Legal & Governance': Scale,
};

const ACCESS_CONFIG: Record<
  DocumentAccessLevel,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  ALL_TEAM: {
    label: 'All Team Members',
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    border: 'border-[#BBF7D0]',
    desc: 'Accessible by all staff and analysts',
  },
  MANAGEMENT_ONLY: {
    label: 'Management Only',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    border: 'border-[#BFDBFE]',
    desc: 'Directors and Managers only',
  },
  RESTRICTED_FINANCE: {
    label: 'Finance & Legal Only',
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
    desc: 'Commercial Finance and Executive Board',
  },
  EXECUTIVE_ONLY: {
    label: 'Executive Board Only',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#B91C1C]',
    border: 'border-[#FECACA]',
    desc: 'Strictly restricted to Business Head',
  },
};

export const MasterDocumentVaultPage: React.FC = () => {
  const {
    reusableDocuments,
    addReusableDocument,
    updateDocumentAccess,
    linkReusableDocumentToTender,
    hasDocumentAccess,
    currentUser,
    tenders,
    setActiveDocForShare,
  } = useTenders();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAccess, setSelectedAccess] = useState<string>('ALL');

  // Modal: Add New Reusable Document
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Company Statutory');
  const [newExpiry, setNewExpiry] = useState('');
  const [newAccess, setNewAccess] = useState<DocumentAccessLevel>('ALL_TEAM');
  const [newDesc, setNewDesc] = useState('');

  // Modal: Reference / Link Document to Tender
  const [docToLink, setDocToLink] = useState<ReusableDocument | null>(null);
  const [targetTenderId, setTargetTenderId] = useState<string>(tenders[0]?.id || '');
  const [targetFolder, setTargetFolder] = useState<string>('02_company_statutory_documents');
  const [linkSuccessMsg, setLinkSuccessMsg] = useState<string | null>(null);

  const categories = [
    'Company Statutory',
    'Financial & Tax',
    'Certifications & ISO',
    'Key Personnel CV',
    'Past Credentials',
    'Legal & Governance',
  ];

  const filteredDocs = reusableDocuments.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesAccess =
      selectedAccess === 'ALL' || doc.accessLevel === selectedAccess;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesAccess && matchesSearch;
  });

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addReusableDocument({
      name: newName.trim(),
      category: newCategory,
      expiryDate: newExpiry || undefined,
      accessLevel: newAccess,
      size: '2.8 MB',
      description: newDesc.trim() || undefined,
    });

    setNewName('');
    setNewDesc('');
    setNewExpiry('');
    setIsAddModalOpen(false);
  };

  const handleLinkToTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToLink || !targetTenderId) return;

    linkReusableDocumentToTender(targetTenderId, docToLink.id, targetFolder);
    const targetTender = tenders.find((t) => t.id === targetTenderId);
    setLinkSuccessMsg(
      `Linked "${docToLink.name}" into ${targetTender?.id || targetTenderId} (${targetFolder})`
    );
    setTimeout(() => {
      setLinkSuccessMsg(null);
      setDocToLink(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Corporate Repository</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Master Reusable Vault</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Reusable Master Document Library
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Central repository of reusable credentials, audited balance sheets, ISO certifications, and CVs. Reference them into any tender proposal with 1 click.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Reusable Master File</span>
        </button>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Master Files</span>
            <FileCheck className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#0F172A]">
            {reusableDocuments.length} Documents
          </div>
          <div className="text-[11px] text-[#16A34A] font-medium">Ready to reference</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Company Credentials</span>
            <Building2 className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#0F172A]">
            {reusableDocuments.filter((d) => d.category === 'Company Statutory' || d.category === 'Certifications & ISO').length} Files
          </div>
          <div className="text-[11px] text-[#64748B]">Licenses &amp; Accreditations</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Financial &amp; Legal</span>
            <Scale className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#0F172A]">
            {reusableDocuments.filter((d) => d.category === 'Financial & Tax' || d.category === 'Legal & Governance').length} Files
          </div>
          <div className="text-[11px] text-[#64748B]">Audits, Solvency &amp; JV</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Your Access Scope</span>
            <Shield className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="font-semibold text-sm text-[#0F172A] truncate">
            {currentUser.name}
          </div>
          <div className="text-[11px] font-mono text-[#7C3AED] font-bold">
            Role: {currentUser.role.replace('_', ' ')}
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search master documents, certifications, licenses..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {/* Access Level Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg text-xs">
              <Shield className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-[#64748B] font-medium">Access:</span>
              <select
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#0F172A] border-none focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Access Levels</option>
                <option value="ALL_TEAM">All Team Members</option>
                <option value="MANAGEMENT_ONLY">Management Only</option>
                <option value="RESTRICTED_FINANCE">Finance &amp; Legal Only</option>
                <option value="EXECUTIVE_ONLY">Executive Board Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#F1F5F9]">
          <Filter className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          <span className="text-xs text-[#64748B] font-medium mr-1">Category:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-[#0F172A] text-white font-semibold'
                : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All Categories ({reusableDocuments.length})
          </button>
          {categories.map((cat) => {
            const count = reusableDocuments.filter((d) => d.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#0F172A] text-white font-semibold'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Master Documents Table */}
      <Card
        title="Reusable Master Files Dossier"
        subtitle={`Showing ${filteredDocs.length} master credential(s) available for cross-tender referencing`}
      >
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4">Master Document</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Access Permission Scope</th>
                <th className="py-3 px-4">Validity / Expiry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#94A3B8]">
                    No reusable documents match your filter. Click "Upload Reusable Master File" to add documents.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const hasAccess = hasDocumentAccess(doc.accessLevel);
                  const Icon = CATEGORY_ICONS[doc.category] || FileText;
                  const accessBadge = ACCESS_CONFIG[doc.accessLevel];

                  return (
                    <tr key={doc.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB] shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-[#0F172A] block leading-snug">
                              {doc.name}
                            </span>
                            {doc.description && (
                              <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed line-clamp-1">
                                {doc.description}
                              </p>
                            )}
                            <span className="font-mono text-[10px] text-[#94A3B8] block mt-0.5">
                              SHA-256: {doc.sha256.substring(0, 16)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F1F5F9] text-[#475569]">
                          {doc.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {/* Interactive Access Level Controller */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={doc.accessLevel}
                            disabled={currentUser.role === 'TENDER_ANALYST'}
                            onChange={(e) =>
                              updateDocumentAccess(
                                doc.id,
                                e.target.value as DocumentAccessLevel
                              )
                            }
                            className={`text-[10px] font-bold px-2 py-1 rounded border cursor-pointer focus:outline-none ${accessBadge.bg} ${accessBadge.text} ${accessBadge.border}`}
                            title={accessBadge.desc}
                          >
                            <option value="ALL_TEAM">🌐 All Team Members</option>
                            <option value="MANAGEMENT_ONLY">🛡️ Management Only</option>
                            <option value="RESTRICTED_FINANCE">🔒 Finance &amp; Legal Only</option>
                            <option value="EXECUTIVE_ONLY">👑 Executive Board Only</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {doc.expiryDate ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#0F172A]">
                            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>Valid until {doc.expiryDate}</span>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8] text-[11px] italic">Perpetual</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reference into Tender Button */}
                          <button
                            type="button"
                            onClick={() => setDocToLink(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg transition-colors"
                            title="Reference this document into a tender proposal"
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>Use in Tender</span>
                          </button>

                          {/* Share Document Link */}
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDocForShare({
                                tenderId: 'Master Library',
                                doc: {
                                  id: doc.id,
                                  name: doc.name,
                                  folder: doc.category,
                                  revision: doc.revision,
                                  uploadedAt: doc.uploadedAt,
                                  size: doc.size,
                                  sha256: doc.sha256,
                                  accessLevel: doc.accessLevel,
                                },
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg transition-colors"
                            title="Generate shareable link for this master document"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Share</span>
                          </button>

                          {/* Secure Download Button */}
                          {hasAccess ? (
                            <button
                              type="button"
                              onClick={() => alert(`Simulating secure download for ${doc.name}`)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg transition-colors shadow-2xs"
                              title="Download Master Document"
                            >
                              <Download className="w-3 h-3 text-[#64748B]" />
                              <span>Download</span>
                            </button>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg cursor-not-allowed"
                              title="You do not have clearance to download this file"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Restricted</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Upload Reusable Document */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display text-sm font-bold text-[#0F172A]">
                  Upload Reusable Master File
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Document Title / File Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO_27001_Global_Security_Accreditation_2026.pdf"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Document Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Validity / Expiration Date
                  </label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Access &amp; Security Permission Scope *
                </label>
                <select
                  value={newAccess}
                  onChange={(e) => setNewAccess(e.target.value as DocumentAccessLevel)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="ALL_TEAM">🌐 All Team Members (Public to organization)</option>
                  <option value="MANAGEMENT_ONLY">🛡️ Management Only (Directors &amp; Managers)</option>
                  <option value="RESTRICTED_FINANCE">🔒 Finance &amp; Legal Only (Confidential Financials)</option>
                  <option value="EXECUTIVE_ONLY">👑 Executive Board Only (C-Level Clearance)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Brief Description / Scope of Use
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Certified copy of ISO audit report valid across EMEA and Asia..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-[11px] text-[#1D4ED8]">
                <strong>Cross-Project Storage:</strong> Master files are indexed in the corporate repository and can be referenced into any tender proposal without re-uploading.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0F172A] text-white font-semibold hover:bg-[#1E293B] shadow-sm transition-colors"
                >
                  Save to Master Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reference / Link Document to Project Tender */}
      {docToLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display text-sm font-bold text-[#0F172A]">
                  Reference Document in Tender Project
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDocToLink(null)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {linkSuccessMsg ? (
              <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
                <p className="text-xs font-bold text-[#15803D]">{linkSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleLinkToTender} className="space-y-3.5 text-xs">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                    Referencing Master Document:
                  </span>
                  <span className="font-semibold text-xs text-[#0F172A] block mt-0.5">
                    {docToLink.name}
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Category: {docToLink.category} • Size: {docToLink.size}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Select Target Tender Opportunity *
                  </label>
                  <select
                    value={targetTenderId}
                    onChange={(e) => setTargetTenderId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    {tenders.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}: {t.title} ({t.stage})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Destination Vault Folder in Proposal *
                  </label>
                  <select
                    value={targetFolder}
                    onChange={(e) => setTargetFolder(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="02_company_statutory_documents">
                      📁 02 Company Statutory Credentials
                    </option>
                    <option value="01_original_tender_documents">
                      📁 01 Original RFP Notices &amp; Addenda
                    </option>
                    <option value="03_technical_proposal">
                      📁 03 Technical Proposal &amp; Architecture
                    </option>
                    <option value="04_financial_proposal">
                      📁 04 Financial Proposal &amp; BOQ Tables
                    </option>
                    <option value="05_final_submission_package">
                      📁 05 Compiled Sealed Submission Package
                    </option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setDocToLink(null)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#2563EB] text-white font-semibold hover:bg-[#1D4ED8] shadow-sm transition-colors"
                  >
                    Link to Project Folder
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
