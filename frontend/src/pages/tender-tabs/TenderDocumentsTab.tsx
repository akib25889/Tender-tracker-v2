import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useTenders } from '../../context/TenderContext';
import { DocumentAccessLevel } from '../../types/tender';
import { DocumentAccessLevel, TenderDocument } from '../../types/tender';
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
  AlertTriangle,
  RotateCcw,
  Clock,
  Send,
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
    requestDocumentReupload,
    requestNewDocumentUpload,
    resolveDocumentReupload,
    companyProfiles,
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

  const isJvTender = Boolean(
    tender?.summary?.jv?.participation?.toLowerCase().includes('allow') ||
    tender?.summary?.jv?.leadMember ||
    tender?.summary?.jv?.localPartner
  );

  const jvPartnerName =
    tender?.summary?.jv?.localPartner ||
    'DataCore Systems Ltd';
  const leadCompanyName = 'PrimeTech Ltd';

  // Re-upload Request Modal State
  const [selectedDocForReupload, setSelectedDocForReupload] = useState<TenderDocument | null>(null);
  const [reuploadReason, setReuploadReason] = useState('Missing Auditor Stamp');
  const [reuploadComment, setReuploadComment] = useState('');
  const [reuploadDueDate, setReuploadDueDate] = useState('T-48h');
  const [isSubmittingReupload, setIsSubmittingReupload] = useState(false);
  const [reuploadFeedbackToast, setReuploadFeedbackToast] = useState<string | null>(null);

  // Request New Document Modal State
  const [isRequestDocModalOpen, setIsRequestDocModalOpen] = useState(false);
  const [reqDocTitle, setReqDocTitle] = useState('');
  const [reqDocFolder, setReqDocFolder] = useState('02_company_statutory_documents');
  const [reqDocCompany, setReqDocCompany] = useState(isJvTender ? jvPartnerName : leadCompanyName);
  const [reqDocInstructions, setReqDocInstructions] = useState('');
  const [reqDocDueDate, setReqDocDueDate] = useState('T-48h');
  const [isSubmittingNewReq, setIsSubmittingNewReq] = useState(false);

  // Resolve Re-upload Modal State
  const [docToResolve, setDocToResolve] = useState<TenderDocument | null>(null);
  const [resolveFile, setResolveFile] = useState<File | null>(null);
  const [resolveComment, setResolveComment] = useState('');
  const [isSubmittingResolve, setIsSubmittingResolve] = useState(false);

  // Modal: Link Reusable Document
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedReusableDocId, setSelectedReusableDocId] = useState<string>('');
  const [linkTargetFolder, setLinkTargetFolder] = useState<string>(
    isJvTender ? '02A_jv_partner_credentials' : '02_company_statutory_documents'
  );
  const [linkFilterCategory, setLinkFilterCategory] = useState<string>('ALL');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');

  const standardFolders = [
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

  const jvPrioritizedFolders = [
    {
      name: '02A_jv_partner_credentials',
      label: `⭐ JV Partner Credentials (${jvPartnerName})`,
    },
    {
      name: '02B_lead_statutory_documents',
      label: `🏛️ Lead Bidder Statutory Credentials (${leadCompanyName})`,
    },
    {
      name: '02C_jv_agreement_and_poa',
      label: '📜 JV Consortium Deed & Power of Attorney',
    },
    {
      name: '01_original_tender_documents',
      label: 'Original RFP Notices & Addenda',
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

  const baseFolders = isJvTender ? jvPrioritizedFolders : standardFolders;
  const folders = [...baseFolders, ...(tender.customFolders || [])].filter(
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

  const handleSendReuploadRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForReupload) return;
    setIsSubmittingReupload(true);
    await requestDocumentReupload(tender.id, selectedDocForReupload.id, {
      reason: reuploadReason,
      comment: reuploadComment,
      dueDate: reuploadDueDate,
      requestedBy: currentUser.name,
    });
    setIsSubmittingReupload(false);
    const docName = selectedDocForReupload.name;
    setSelectedDocForReupload(null);
    setReuploadFeedbackToast(`Re-upload request sent for "${docName}". Partner notified with action requirement.`);
    setTimeout(() => setReuploadFeedbackToast(null), 4000);
  };

  const handleSendNewDocumentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDocTitle.trim()) return;
    setIsSubmittingNewReq(true);
    await requestNewDocumentUpload({
      tenderId: tender.id,
      title: reqDocTitle.trim(),
      folder: reqDocFolder,
      companyName: reqDocCompany,
      companyRole: reqDocCompany === leadCompanyName ? 'LEAD_BIDDER' : 'JV_PARTNER',
      instructions: reqDocInstructions.trim(),
      dueDate: reqDocDueDate,
      requestedBy: currentUser.name,
    });
    setIsSubmittingNewReq(false);
    setIsRequestDocModalOpen(false);
    const title = reqDocTitle;
    setReqDocTitle('');
    setReqDocInstructions('');
    setReuploadFeedbackToast(`Document request "${title}" dispatched to ${reqDocCompany}.`);
    setTimeout(() => setReuploadFeedbackToast(null), 4000);
  };

  const handleResolveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToResolve || !resolveFile) return;
    setIsSubmittingResolve(true);
    await resolveDocumentReupload(tender.id, docToResolve.id, resolveFile, resolveComment);
    setIsSubmittingResolve(false);
    const name = docToResolve.name;
    setDocToResolve(null);
    setResolveFile(null);
    setResolveComment('');
    setReuploadFeedbackToast(`Revised document uploaded for "${name}". Status changed to Under Review.`);
    setTimeout(() => setReuploadFeedbackToast(null), 4000);
  };

  const displayedDocs = (tender.documents || []).filter((d) => {
    const matchesFolder = activeFolderFilter === 'ALL' || d.folder === activeFolderFilter;
    const matchesCompany =
      companyFilter === 'ALL' ||
      (companyFilter === 'JV' && (d.isJvPartner || d.companyRole === 'JV_PARTNER')) ||
      (companyFilter === 'LEAD' && (d.companyRole === 'LEAD_BIDDER' || (!d.isJvPartner && d.companyRole !== 'JV_PARTNER'))) ||
      d.companyName === companyFilter;
    return matchesFolder && matchesCompany;
  });

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
          {/* Link Master Reusable Document Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedReusableDocId('');
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

          {/* Request Document from Partner Button */}
          <button
            type="button"
            onClick={() => {
              setReqDocTitle('');
              setReqDocInstructions('');
              setReqDocFolder(folders[1]?.name || '02_company_statutory_documents');
              setReqDocCompany(isJvTender ? jvPartnerName : leadCompanyName);
              setReqDocDueDate('T-48h');
              setIsRequestDocModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold rounded-lg hover:bg-amber-100 shadow-xs transition-colors"
            title="Send an official deliverable request for a missing document to a partner or team member"
          >
            <Send className="w-3.5 h-3.5 text-amber-700" />
            <span>Request Document from Partner</span>
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

      {/* Feedback Toast Notification */}
      {reuploadFeedbackToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{reuploadFeedbackToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setReuploadFeedbackToast(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
        {/* Entity / Company Disambiguation Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 border-b border-[#F1F5F9]">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mr-1 shrink-0">
            Entity Filter:
          </span>
          <button
            type="button"
            onClick={() => setCompanyFilter('ALL')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              companyFilter === 'ALL'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All Entities ({tender.documents.length})
          </button>
          {isJvTender && (
            <button
              type="button"
              onClick={() => setCompanyFilter('JV')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                companyFilter === 'JV'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              <span>⭐ JV: {jvPartnerName}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/25 font-bold">
                {tender.documents.filter((d) => d.isJvPartner || d.companyRole === 'JV_PARTNER').length}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setCompanyFilter('LEAD')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              companyFilter === 'LEAD'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <span>🏛️ Lead: {leadCompanyName}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/25 font-bold">
              {tender.documents.filter((d) => !d.isJvPartner && d.companyRole !== 'JV_PARTNER').length}
            </span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-2.5 px-3">File Name &amp; Owning Entity</th>
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
                    No files found for this filter. Click <strong>"+ Upload here"</strong> or <strong>"Link Master Library File"</strong> above to add files.
                  </td>
                </tr>
              ) : (
                displayedDocs.map((doc) => {
                  const docAccess = doc.accessLevel || 'ALL_TEAM';
                  const hasAccess = hasDocumentAccess(docAccess);
                  const accessBadge = ACCESS_STYLES[docAccess] || ACCESS_STYLES.ALL_TEAM;
                  const isJvDoc = doc.isJvPartner || doc.companyRole === 'JV_PARTNER';

                  return (
                    <tr key={doc.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-3 font-medium text-[#0F172A] max-w-sm">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <FileText className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          <span className="font-semibold">{doc.name}</span>

                          {/* Status Badge */}
                          {doc.status === 'ACTION_REQUIRED' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Action Required</span>
                            </span>
                          ) : doc.status === 'PENDING_REVIEW' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              <Clock className="w-2.5 h-2.5" />
                              <span>Under Review</span>
                            </span>
                          ) : null}

                          {/* Owning Entity Disambiguation Badge */}
                          {isJvDoc ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              ⭐ JV: {doc.companyName || jvPartnerName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              🏛️ Lead: {doc.companyName || leadCompanyName}
                            </span>
                          )}

                          {doc.isReusableLink && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                              <LinkIcon className="w-2.5 h-2.5" />
                              <span>Master Link</span>
                            </span>
                          )}
                        </div>

                        {/* Action Required Feedback Callout */}
                        {doc.status === 'ACTION_REQUIRED' && (
                          <div className="w-full mt-2 p-2.5 bg-amber-50/90 border border-amber-300 rounded-lg text-amber-900 text-[11px] space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold flex items-center gap-1 text-amber-900">
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Re-Upload Requested</span>
                              </span>
                              <span className="text-[10px] font-mono font-bold bg-amber-200/90 px-1.5 py-0.5 rounded text-amber-900">
                                Due: {doc.actionDueDate || 'T-48h'}
                              </span>
                            </div>
                            {doc.actionComment && (
                              <p className="text-[11px] text-amber-900 bg-white/70 p-1.5 rounded border border-amber-200 leading-tight">
                                "{doc.actionComment}"
                                {doc.requestedBy && (
                                  <span className="not-italic text-[9.5px] text-amber-700 font-semibold block mt-1">
                                    — Requested by {doc.requestedBy}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        )}
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
                      <td className="py-3 px-3 text-[#64748B]">
                        <div>{doc.uploadedAt}</div>
                        <div className="text-[10px] text-[#94A3B8] font-mono">{doc.revision} • {doc.size}</div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {hasAccess ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Request Re-Upload / Flag Action Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDocForReupload(doc);
                                setReuploadReason('Missing Auditor Stamp');
                                setReuploadComment(doc.actionComment ? doc.actionComment.replace(/^\[.*?\]\s*/, '') : '');
                                setReuploadDueDate(doc.actionDueDate || 'T-48h');
                              }}
                              className={`p-1.5 rounded-lg border transition-colors shadow-2xs ${
                                doc.status === 'ACTION_REQUIRED'
                                  ? 'text-amber-700 bg-amber-100 border-amber-300 hover:bg-amber-200'
                                  : 'text-[#64748B] bg-white border-[#E2E8F0] hover:text-amber-700 hover:bg-amber-50 hover:border-amber-300'
                              }`}
                              title={
                                doc.status === 'ACTION_REQUIRED'
                                  ? 'Edit Re-Upload Request instructions'
                                  : 'Request document revision / re-upload with reviewer comments'
                              }
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {/* Resolve Re-Upload / Upload Revision Button if flagged */}
                            {doc.status === 'ACTION_REQUIRED' && (
                              <button
                                type="button"
                                onClick={() => setDocToResolve(doc)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded text-[10px] font-bold shadow-2xs transition-colors shrink-0"
                                title="Upload certified revision to resolve this action request"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Upload</span>
                              </button>
                            )}

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
                    .sort((a, b) => {
                      if (!isJvTender) return 0;
                      const aIsJv = a.isJvPartner || a.companyRole === 'JV_PARTNER';
                      const bIsJv = b.isJvPartner || b.companyRole === 'JV_PARTNER';
                      if (aIsJv && !bIsJv) return -1;
                      if (!aIsJv && bIsJv) return 1;
                      return 0;
                    })
                    .map((d) => {
                      const isSelected = selectedReusableDocId === d.id;
                      const hasAccess = hasDocumentAccess(d.accessLevel);
                      const isJv = d.isJvPartner || d.companyRole === 'JV_PARTNER';

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
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-[10px] text-[#64748B]">
                                {d.category} • {d.size}
                              </span>
                              {isJv ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  ⭐ JV: {d.companyName || 'JV Partner'}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  🏛️ Lead: {d.companyName || 'Lead Bidder'}
                                </span>
                              )}
                            </div>
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
      {/* Modal: Delete Folder Confirmation */}
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

      {/* Modal 1: Request Document Revision & Re-Upload */}
      {selectedDocForReupload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#FFFBEB]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#FEF3C7] text-[#D97706]">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#92400E]">
                    Request Document Revision &amp; Re-Upload
                  </h3>
                  <p className="text-xs text-[#B45309]">
                    Flag this file and notify the partner with compliance revision instructions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocForReupload(null)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReuploadRequest} className="p-6 space-y-4 text-xs">
              {/* Target File Info */}
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A] text-xs truncate max-w-xs">
                    {selectedDocForReupload.name}
                  </span>
                  <span className="font-mono text-[10px] font-bold bg-[#E2E8F0] text-[#475569] px-1.5 py-0.5 rounded">
                    {selectedDocForReupload.revision}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                  <span>Entity: <strong>{selectedDocForReupload.companyName || leadCompanyName}</strong></span>
                  <span>•</span>
                  <span>Folder: <strong>{folders.find(f => f.name === selectedDocForReupload.folder)?.label || selectedDocForReupload.folder}</strong></span>
                </div>
              </div>

              {/* Defect / Reason */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Primary Defect / Re-Upload Reason:
                </label>
                <select
                  value={reuploadReason}
                  onChange={(e) => setReuploadReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-medium text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                >
                  <option value="Missing Auditor Stamp">Missing CA Auditor Seal &amp; Stamp on Pages</option>
                  <option value="Illegible / Low Resolution Scan">Illegible / Low Resolution Scan (&lt;300 DPI)</option>
                  <option value="Expired Document Validity">Expired Document Validity Date</option>
                  <option value="Missing Signatures">Missing Authorized Attorney Signature / Board Resolution</option>
                  <option value="Incorrect Entity Details">Incorrect Legal Name / Tax Registration Details</option>
                  <option value="Tender Specific Format Required">Specific Tender Format / Notarization Required</option>
                  <option value="Other Compliance Defect">Other Compliance Defect</option>
                </select>
              </div>

              {/* Feedback Comment */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Reviewer Feedback &amp; Action Instructions:
                </label>
                <textarea
                  value={reuploadComment}
                  onChange={(e) => setReuploadComment(e.target.value)}
                  placeholder="Explain exactly what needs fixing (e.g. Page 4 requires physical signature and official seal of the external chartered accountant. Please re-scan at 300 DPI and upload)."
                  rows={4}
                  required
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#F59E0B] resize-none leading-relaxed"
                />
              </div>

              {/* Urgency Due Window */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1.5">
                  Resolution SLA / Due Window:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'T-24h (Urgent)', value: 'T-24h' },
                    { label: 'T-48h (Standard)', value: 'T-48h' },
                    { label: 'T-72h', value: 'T-72h' },
                    { label: 'Before Gate 5', value: 'Gate 5 Review' },
                  ].map((sla) => (
                    <button
                      key={sla.value}
                      type="button"
                      onClick={() => setReuploadDueDate(sla.value)}
                      className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold text-center transition-all ${
                        reuploadDueDate === sla.value
                          ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E] shadow-2xs font-bold'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-white'
                      }`}
                    >
                      {sla.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  This document's status will be marked as <strong>ACTION REQUIRED</strong>. An alert banner will appear in the partner portal and dashboard until a certified revision is submitted.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setSelectedDocForReupload(null)}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#64748B] font-semibold rounded-lg hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReupload || !reuploadComment.trim()}
                  className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReupload ? 'Sending Request...' : 'Dispatch Re-Upload Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Request Missing Document from Partner */}
      {isRequestDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#0F172A]">
                    Request Missing Document from Partner
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Send a formal deliverable request for statutory credentials, forms, or technical diagrams
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestDocModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNewDocumentRequest} className="p-6 space-y-4 text-xs">
              {/* Target Entity / Partner */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Assign To Entity / JV Partner:
                </label>
                <select
                  value={reqDocCompany}
                  onChange={(e) => setReqDocCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-medium text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value={leadCompanyName}>🏛️ Lead Bidder ({leadCompanyName})</option>
                  <option value={jvPartnerName}>⭐ JV Partner ({jvPartnerName})</option>
                  {companyProfiles
                    .filter((p) => p.legal_name !== leadCompanyName && p.legal_name !== jvPartnerName)
                    .map((p) => (
                      <option key={p.id} value={p.legal_name}>
                        🤝 {p.legal_name} ({p.company_role})
                      </option>
                    ))}
                </select>
              </div>

              {/* Document Title */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Required Document Title:
                </label>
                <input
                  type="text"
                  value={reqDocTitle}
                  onChange={(e) => setReqDocTitle(e.target.value)}
                  placeholder="e.g. Manufacturer Authorization Form (MAF) - Cisco Systems"
                  required
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* Target Vault Folder */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Target Vault Folder:
                </label>
                <select
                  value={reqDocFolder}
                  onChange={(e) => setReqDocFolder(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-medium text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  {folders.map((f) => (
                    <option key={f.name} value={f.name}>
                      📁 {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detailed Instructions */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Instructions &amp; Compliance Specifications:
                </label>
                <textarea
                  value={reqDocInstructions}
                  onChange={(e) => setReqDocInstructions(e.target.value)}
                  placeholder="e.g. Letter must be printed on official manufacturer letterhead, specifically referencing this tender number, and signed by an authorized regional director."
                  rows={3}
                  required
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] resize-none leading-relaxed"
                />
              </div>

              {/* SLA Due Window */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1.5">
                  Resolution SLA / Due Window:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'T-24h (Urgent)', value: 'T-24h' },
                    { label: 'T-48h (Standard)', value: 'T-48h' },
                    { label: 'T-72h', value: 'T-72h' },
                    { label: 'Before Gate 5', value: 'Gate 5 Review' },
                  ].map((sla) => (
                    <button
                      key={sla.value}
                      type="button"
                      onClick={() => setReqDocDueDate(sla.value)}
                      className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold text-center transition-all ${
                        reqDocDueDate === sla.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs font-bold'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-white'
                      }`}
                    >
                      {sla.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsRequestDocModalOpen(false)}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#64748B] font-semibold rounded-lg hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewReq || !reqDocTitle.trim()}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingNewReq ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Upload Certified Revision to Resolve Request */}
      {docToResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#0F172A]">
                    Upload Revised Document
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Resolve action request for {docToResolve.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDocToResolve(null);
                  setResolveFile(null);
                }}
                className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveUpload} className="p-6 space-y-4 text-xs">
              {/* Reviewer instructions prompt */}
              {docToResolve.actionComment && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] space-y-1">
                  <span className="font-bold block">Reviewer Instructions:</span>
                  <p className="italic">"{docToResolve.actionComment}"</p>
                </div>
              )}

              {/* File input */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Select Certified Revision File (PDF / Office):
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResolveFile(e.target.files[0]);
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A]"
                />
              </div>

              {/* Resolution Note */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Resolution Note / Auditor Changes Summary:
                </label>
                <textarea
                  value={resolveComment}
                  onChange={(e) => setResolveComment(e.target.value)}
                  placeholder="e.g. Certified stamp affixed on page 4 by statutory auditor. Re-scanned at 300 DPI."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => {
                    setDocToResolve(null);
                    setResolveFile(null);
                  }}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#64748B] font-semibold rounded-lg hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResolve || !resolveFile}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isSubmittingResolve ? 'Uploading...' : 'Submit Revision (v1.1)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
