import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useTenders } from '../../context/TenderContext';
import { DocumentAccessLevel } from '../../types/tender';
import { downloadFolderAsZip, downloadAllVaultAsZip } from '../../utils/zipDownloader';
import {
  Folder,
  FileText,
  Download,
  Upload,
  FolderPlus,
  X,
  Check,
  Link as LinkIcon,
  Lock,
  Trash2,
  Archive,
  Share2,
} from 'lucide-react';

const ACCESS_STYLES: Record<
  DocumentAccessLevel,
  { label: string; bg: string; text: string; border: string }
> = {
  ALL_TEAM: {
    label: '🌐 All Team',
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    border: 'border-[#BBF7D0]',
  },
  MANAGEMENT_ONLY: {
    label: '🛡️ Management',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    border: 'border-[#BFDBFE]',
  },
  RESTRICTED_FINANCE: {
    label: '🔒 Finance/Legal',
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
  },
  EXECUTIVE_ONLY: {
    label: '👑 Executive',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#B91C1C]',
    border: 'border-[#FECACA]',
  },
};

export const TenderDocumentsTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    tenders,
    setActiveTenderIdForModal,
    setUploadFolderTarget,
    addFolder,
    deleteFolder,
    moveDocumentFolder,
    reusableDocuments,
    linkReusableDocumentToTender,
    updateTenderDocumentAccess,
    hasDocumentAccess,
    currentUser,
    setActiveDocForShare,
  } = useTenders();

  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const [activeFolderFilter, setActiveFolderFilter] = useState<string>('ALL');
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderLabel, setNewFolderLabel] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [folderToDelete, setFolderToDelete] = useState<{
    name: string;
    label: string;
    fileCount: number;
  } | null>(null);

  // Modal: Link Reusable Document
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedReusableDocId, setSelectedReusableDocId] = useState<string>('');
  const [linkTargetFolder, setLinkTargetFolder] = useState<string>('02_company_statutory_documents');
  const [linkFilterCategory, setLinkFilterCategory] = useState<string>('ALL');

  const defaultFolders = [
    {
      name: '01_original_tender_documents',
      label: 'Original RFP Notices & Addenda',
    },
    {
      name: '02_company_statutory_documents',
      label: 'Company Statutory Credentials',
    },
    {
      name: '03_technical_proposal',
      label: 'Technical Proposal & Architecture',
    },
    {
      name: '04_financial_proposal',
      label: 'Financial Proposal & BOQ Tables',
    },
    {
      name: '05_final_submission_package',
      label: 'Compiled Sealed Submission Package',
    },
    {
      name: '06_submission_receipts',
      label: 'Official Portal Receipts & Confirmations',
    },
  ];

  if (!tender) return null;

  const folders = [...defaultFolders, ...(tender.customFolders || [])].filter(
    (f) => !(tender.deletedFolders || []).includes(f.name)
  );

  const handleOpenUpload = (folderName: string) => {
    setActiveTenderIdForModal(tender.id);
    setUploadFolderTarget(folderName);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderLabel.trim()) return;

    const folderIndex = folders.length + 1;
    const prefix = folderIndex < 10 ? `0${folderIndex}` : `${folderIndex}`;
    const autoSlug = `${prefix}_${newFolderLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    const finalName = newFolderName.trim() || autoSlug;

    addFolder(tender.id, {
      name: finalName,
      label: newFolderLabel.trim(),
    });

    setNewFolderLabel('');
    setNewFolderName('');
    setIsCreateFolderModalOpen(false);
  };

  const handleLinkReusable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReusableDocId) return;

    linkReusableDocumentToTender(tender.id, selectedReusableDocId, linkTargetFolder);
    setSelectedReusableDocId('');
    setIsLinkModalOpen(false);
  };

  const displayedDocs = (tender.documents || []).filter(
    (d) => activeFolderFilter === 'ALL' || d.folder === activeFolderFilter
  );

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F172A]">
            Tender Document Vault
          </h2>
          <p className="text-xs text-[#64748B]">
            Organize RFP notices, statutory credentials, and technical/financial proposals into dedicated folders
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Link from Master Library Button */}
          <button
            type="button"
            onClick={() => {
              if (reusableDocuments.length > 0) {
                setSelectedReusableDocId(reusableDocuments[0].id);
              }
              setIsLinkModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold rounded-lg hover:bg-[#DBEAFE] shadow-xs transition-colors"
            title="Import or reference an existing reusable master document from the company repository"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Link Master Library File</span>
          </button>

          {/* Create Folder Button */}
          <button
            type="button"
            onClick={() => setIsCreateFolderModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold rounded-lg hover:bg-[#F8FAFC] shadow-xs transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Create Folder</span>
          </button>

          {/* Download All Vault as ZIP */}
          <button
            type="button"
            onClick={() =>
              downloadAllVaultAsZip(
                tender.id,
                tender.title,
                folders,
                tender.documents
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold rounded-lg hover:bg-[#F8FAFC] shadow-xs transition-colors"
            title="Download entire tender vault across all folders as a structured ZIP package"
          >
            <Archive className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Download All as ZIP</span>
          </button>

          {/* Upload Document Button */}
          <button
            type="button"
            onClick={() => handleOpenUpload(folders[0]?.name || '03_technical_proposal')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-[#1D4ED8] shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Folder Hierarchy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((f) => {
          const folderFiles = tender.documents.filter((d) => d.folder === f.name);
          const isSelected = activeFolderFilter === f.name;

          return (
            <Card
              key={f.name}
              className={`hover:border-[#CBD5E1] transition-all cursor-pointer group relative ${
                isSelected
                  ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 bg-[#F8FAFC]'
                  : ''
              }`}
            >
              <div
                onClick={() =>
                  setActiveFolderFilter((prev) => (prev === f.name ? 'ALL' : f.name))
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#EFF6FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white'
                      }`}
                    >
                      <Folder className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0F172A] leading-tight truncate">
                        {f.label}
                      </h4>
                      <span className="text-[10px] text-[#64748B] font-mono block mt-0.5 truncate">
                        /{f.name}/
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFolderAsZip(
                          tender.id,
                          f.name,
                          f.label,
                          tender.documents
                        );
                      }}
                      className="p-1 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                      title={`Download folder "${f.label}" as ZIP`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderToDelete({
                          name: f.name,
                          label: f.label,
                          fileCount: folderFiles.length,
                        });
                      }}
                      className="p-1 rounded text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                      title={`Delete folder "${f.label}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-3 mt-3 border-t border-[#F1F5F9]">
                  <span className="font-semibold">
                    {folderFiles.length} file{folderFiles.length === 1 ? '' : 's'} inside
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFolderAsZip(
                          tender.id,
                          f.name,
                          f.label,
                          tender.documents
                        );
                      }}
                      className="inline-flex items-center gap-1 text-[#2563EB] hover:underline font-semibold"
                      title={`Download ${f.label} as ZIP archive`}
                    >
                      <Download className="w-3 h-3" />
                      <span>Download ZIP</span>
                    </button>
                    <span className="text-[#CBD5E1]">•</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenUpload(f.name);
                      }}
                      className="text-[#2563EB] hover:underline font-semibold"
                    >
                      + Upload
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Document Vault Table */}
      <Card
        title="Document Vault Files"
        subtitle={`Showing ${displayedDocs.length} document(s) ${
          activeFolderFilter !== 'ALL'
            ? `in folder: "${folders.find((f) => f.name === activeFolderFilter)?.label || activeFolderFilter}"`
            : 'across all folders'
        }`}
        headerAction={
          activeFolderFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setActiveFolderFilter('ALL')}
              className="text-xs text-[#2563EB] font-semibold hover:underline bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#BFDBFE]"
            >
              Show All Folders
            </button>
          )
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3 w-56">Target Folder (Move / Assign)</th>
                <th className="py-2.5 px-3 w-44">Access Permission Scope</th>
                <th className="py-2.5 px-3">Uploaded</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {displayedDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#94A3B8]">
                    No files found in this folder. Click <strong>"+ Upload here"</strong> or <strong>"Link Master Library File"</strong> above to add files.
                  </td>
                </tr>
              ) : (
                displayedDocs.map((doc) => {
                  const docAccess = doc.accessLevel || 'ALL_TEAM';
                  const hasAccess = hasDocumentAccess(docAccess);
                  const accessBadge = ACCESS_STYLES[docAccess] || ACCESS_STYLES.ALL_TEAM;

                  return (
                    <tr key={doc.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-3 font-medium text-[#0F172A] max-w-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <FileText className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          <span className="font-semibold truncate">{doc.name}</span>
                          {doc.isReusableLink && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                              <LinkIcon className="w-2.5 h-2.5" />
                              <span>Master Link</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {/* Interactive Folder Reassignment Dropdown */}
                        <select
                          value={doc.folder}
                          onChange={(e) =>
                            moveDocumentFolder(tender.id, doc.id, e.target.value)
                          }
                          className="w-full px-2 py-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-xs font-medium text-[#0F172A] hover:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
                          title="Click to reassign/move this document to another folder"
                        >
                          {folders.map((f) => (
                            <option key={f.name} value={f.name}>
                              📁 {f.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-3">
                        {/* Interactive Document Access Selector */}
                        <select
                          value={docAccess}
                          disabled={currentUser.role === 'TENDER_ANALYST'}
                          onChange={(e) =>
                            updateTenderDocumentAccess(
                              tender.id,
                              doc.id,
                              e.target.value as DocumentAccessLevel
                            )
                          }
                          className={`text-[10px] font-bold px-2 py-1 rounded border cursor-pointer focus:outline-none ${accessBadge.bg} ${accessBadge.text} ${accessBadge.border}`}
                          title="Update who can view and access this document"
                        >
                          <option value="ALL_TEAM">🌐 All Team</option>
                          <option value="MANAGEMENT_ONLY">🛡️ Management</option>
                          <option value="RESTRICTED_FINANCE">🔒 Finance/Legal</option>
                          <option value="EXECUTIVE_ONLY">👑 Executive</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-[#64748B]">{doc.uploadedAt}</td>
                      <td className="py-3 px-3 text-right">
                        {hasAccess ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveDocForShare({ tenderId: tender.id, doc })
                              }
                              className="p-1.5 text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] rounded-lg transition-colors shadow-2xs"
                              title="Share document link"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                alert(`Simulating secure download for ${doc.name}`)
                              }
                              className="p-1.5 text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg transition-colors shadow-2xs"
                              title="Download file"
                            >
                              <Download className="w-3.5 h-3.5 text-[#64748B]" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg cursor-not-allowed"
                            title="Access Restricted: Requires management clearance"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Restricted</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Create New Folder */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display text-base font-bold text-[#0F172A]">
                  Create Vault Folder
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Folder Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Clarifications & Addenda"
                  value={newFolderLabel}
                  onChange={(e) => {
                    setNewFolderLabel(e.target.value);
                    const folderIndex = folders.length + 1;
                    const prefix = folderIndex < 10 ? `0${folderIndex}` : `${folderIndex}`;
                    setNewFolderName(
                      `${prefix}_${e.target.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
                    );
                  }}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Directory Path / Folder Slug (Local SSD storage)
                </label>
                <div className="flex items-center gap-2 p-2 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] font-mono text-[11px] text-[#0F172A]">
                  <Folder className="w-4 h-4 text-[#2563EB]" />
                  <span>/{newFolderName || '07_custom_folder'}/</span>
                </div>
                <span className="text-[10px] text-[#64748B] mt-1 block font-mono">
                  Location: storage/tenders/{tender.id}/{newFolderName || '07_custom_folder'}/
                </span>
              </div>

              <div className="p-3 bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] text-[11px] text-[#1D4ED8]">
                <strong>Folder Routing Note:</strong> Once created, you can immediately upload documents into this folder, link master files, or reassign existing documents from the table below.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create Vault Folder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Link Master Reusable Document to Project Folder */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display text-base font-bold text-[#0F172A]">
                  Link Master Library Document to Proposal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkReusable} className="p-6 space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-[#0F172A]">
                    Select Master Document to Reference *
                  </label>
                  <select
                    value={linkFilterCategory}
                    onChange={(e) => setLinkFilterCategory(e.target.value)}
                    className="text-[10px] bg-[#F1F5F9] border border-[#CBD5E1] rounded px-1.5 py-0.5 text-[#0F172A]"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Company Statutory">Company Statutory</option>
                    <option value="Financial & Tax">Financial & Tax</option>
                    <option value="Certifications & ISO">Certifications & ISO</option>
                    <option value="Key Personnel CV">Key Personnel CV</option>
                    <option value="Past Credentials">Past Credentials</option>
                    <option value="Legal & Governance">Legal & Governance</option>
                  </select>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[#E2E8F0] rounded-lg p-2 bg-[#F8FAFC]">
                  {reusableDocuments
                    .filter(
                      (d) =>
                        linkFilterCategory === 'ALL' || d.category === linkFilterCategory
                    )
                    .map((d) => {
                      const isSelected = selectedReusableDocId === d.id;
                      const hasAccess = hasDocumentAccess(d.accessLevel);
                      return (
                        <div
                          key={d.id}
                          onClick={() => hasAccess && setSelectedReusableDocId(d.id)}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-[#EFF6FF] border-[#2563EB] ring-1 ring-[#2563EB]'
                              : hasAccess
                              ? 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                              : 'bg-[#F1F5F9] border-[#E2E8F0] opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-[#0F172A] block truncate">
                              {d.name}
                            </span>
                            <span className="text-[10px] text-[#64748B] block mt-0.5">
                              {d.category} • {d.size} • {d.revision}
                            </span>
                          </div>
                          {hasAccess ? (
                            isSelected && <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-1" />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Restricted</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Destination Proposal Folder *
                </label>
                <select
                  value={linkTargetFolder}
                  onChange={(e) => setLinkTargetFolder(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  {folders.map((f) => (
                    <option key={f.name} value={f.name}>
                      📁 {f.label} (/{f.name}/)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-[#F0FDF4] rounded-lg border border-[#BBF7D0] text-[11px] text-[#15803D]">
                <strong>Zero-Redundancy Link:</strong> This creates a cryptographic reference to the master file. Any future updates to the master file will automatically stay synced.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedReusableDocId}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors shadow-sm"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link into Folder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Folder */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#DC2626]">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-[#0F172A]">
                  Delete Vault Folder
                </h3>
                <p className="text-xs text-[#64748B]">Confirm removal from proposal structure</p>
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs space-y-1">
              <span className="font-bold text-[#0F172A] block">
                Folder: {folderToDelete.label}
              </span>
              <span className="font-mono text-[11px] text-[#64748B] block">
                /{folderToDelete.name}/
              </span>
              {folderToDelete.fileCount > 0 ? (
                <p className="text-[#B45309] font-medium pt-1 text-[11px] leading-relaxed">
                  ⚠️ This folder contains {folderToDelete.fileCount} file(s). To protect proposal integrity, these files will be safely moved to "Original RFP Notices & Addenda".
                </p>
              ) : (
                <p className="text-[#64748B] pt-1 text-[11px]">This folder is empty.</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9] text-xs">
              <button
                type="button"
                onClick={() => setFolderToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteFolder(tender.id, folderToDelete.name);
                  if (activeFolderFilter === folderToDelete.name) {
                    setActiveFolderFilter('ALL');
                  }
                  setFolderToDelete(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#DC2626] text-white font-semibold hover:bg-[#B91C1C] shadow-sm transition-colors"
              >
                Delete Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
