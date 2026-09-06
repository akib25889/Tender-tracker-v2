import React, { useState } from 'react';
import { X, UploadCloud, Folder, FileCheck, ShieldCheck } from 'lucide-react';
import { useTenders } from '../../context/TenderContext';

export const UploadDocumentModal: React.FC = () => {
  const {
    uploadFolderTarget,
    setUploadFolderTarget,
    activeTenderIdForModal,
    setActiveTenderIdForModal,
    addDocument,
    tenders,
  } = useTenders();

  const [fileName, setFileName] = useState('');

  const tender = tenders.find((t) => t.id === activeTenderIdForModal);

  const isJvTender = Boolean(
    tender?.summary?.jv?.participation?.toLowerCase().includes('allow') ||
    tender?.summary?.jv?.leadMember ||
    tender?.summary?.jv?.localPartner
  );

  const jvPartnerName =
    tender?.summary?.jv?.localPartner ||
    'DataCore Systems Ltd';
  const leadCompanyName = 'PrimeTech Ltd';

  // Folders definition with JV folders prioritized if JV is allowed
  const standardFolders = [
    { name: '01_original_tender_documents', label: 'Original RFP Notices & Addenda' },
    { name: '02_company_statutory_documents', label: 'Company Statutory Credentials' },
    { name: '03_technical_proposal', label: 'Technical Proposal & Architecture' },
    { name: '04_financial_proposal', label: 'Financial Proposal & BOQ Tables' },
    { name: '05_final_submission_package', label: 'Compiled Sealed Submission Package' },
    { name: '06_submission_receipts', label: 'Official Portal Receipts & Confirmations' },
  ];

  const jvFolders = [
    { name: '02A_jv_partner_credentials', label: `⭐ JV Partner Credentials (${jvPartnerName})` },
    { name: '02B_lead_statutory_documents', label: `🏛️ Lead Bidder Statutory Credentials (${leadCompanyName})` },
    { name: '02C_jv_agreement_and_poa', label: '📜 JV Consortium Deed & Power of Attorney' },
    { name: '01_original_tender_documents', label: 'Original RFP Notices & Addenda' },
    { name: '03_technical_proposal', label: 'Technical Proposal & Architecture' },
    { name: '04_financial_proposal', label: 'Financial Proposal & BOQ Tables' },
    { name: '05_final_submission_package', label: 'Compiled Sealed Submission Package' },
    { name: '06_submission_receipts', label: 'Official Portal Receipts & Confirmations' },
  ];

  const allFolders = [
    ...(isJvTender ? jvFolders : standardFolders),
    ...(tender?.customFolders || []),
  ];

  const [companyRole, setCompanyRole] = useState<'LEAD_BIDDER' | 'JV_PARTNER' | 'SUBCONTRACTOR'>(
    uploadFolderTarget?.toLowerCase().includes('jv') || (isJvTender && !uploadFolderTarget?.toLowerCase().includes('lead'))
      ? 'JV_PARTNER'
      : 'LEAD_BIDDER'
  );
  const [companyName, setCompanyName] = useState<string>(
    uploadFolderTarget?.toLowerCase().includes('jv') || (isJvTender && !uploadFolderTarget?.toLowerCase().includes('lead'))
      ? jvPartnerName
      : leadCompanyName
  );

  if (!uploadFolderTarget && !activeTenderIdForModal) return null;

  const handleClose = () => {
    setUploadFolderTarget(null);
    setActiveTenderIdForModal(null);
  };

  const handleFolderChange = (folder: string) => {
    setUploadFolderTarget(folder);
    if (folder.toLowerCase().includes('jv')) {
      setCompanyRole('JV_PARTNER');
      setCompanyName(jvPartnerName);
    } else if (folder.toLowerCase().includes('lead')) {
      setCompanyRole('LEAD_BIDDER');
      setCompanyName(leadCompanyName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTenderIdForModal) {
      const selectedFolder = uploadFolderTarget || (isJvTender ? '02A_jv_partner_credentials' : '02_company_statutory_documents');
      addDocument(activeTenderIdForModal, {
        name: fileName || 'Statutory_Compliance_Evidence_v1.pdf',
        folder: selectedFolder,
        size: '4.2 MB',
        companyName,
        companyRole,
        isJvPartner: companyRole === 'JV_PARTNER',
      });
    }
    handleClose();
  };

  const safeCompanySlug = companyName.replace(/[^a-zA-Z0-9_-]+/g, '_').trim() || 'PrimeTech_Ltd';
  const effectiveFolder = uploadFolderTarget || (isJvTender ? '02A_jv_partner_credentials' : '02_company_statutory_documents');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div>
            <h3 className="font-display text-base font-bold text-[#0F172A] flex items-center gap-2">
              <span>Upload Vault Document</span>
              {isJvTender && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                  ⭐ JV Workflow Active
                </span>
              )}
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Secure upload to local SSD with entity namespace &amp; automatic SHA-256 stamp
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Folder with JV Prioritization */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-[#0F172A]">
                Target Vault Directory *
              </label>
              {isJvTender && (
                <span className="text-[10px] font-bold text-purple-700">
                  JV Folders Suggested First
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={effectiveFolder}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-medium text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
              >
                {allFolders.map((f) => (
                  <option key={f.name} value={f.name}>
                    📁 {f.label} (/{f.name}/)
                  </option>
                ))}
              </select>
              <Folder className="w-4 h-4 text-[#2563EB] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Owning Company & Entity Disambiguation */}
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider">
                Owning Company / Entity Disambiguation
              </span>
              <span className="text-[10px] font-semibold text-[#64748B]">
                Prevents identical name collision
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                  Entity Role
                </label>
                <select
                  value={companyRole}
                  onChange={(e) => {
                    const role = e.target.value as any;
                    setCompanyRole(role);
                    if (role === 'JV_PARTNER') setCompanyName(jvPartnerName);
                    else if (role === 'LEAD_BIDDER') setCompanyName(leadCompanyName);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg font-bold text-[#0F172A] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="JV_PARTNER">⭐ JV Partner</option>
                  <option value="LEAD_BIDDER">🏛️ Lead Bidder (Self)</option>
                  <option value="SUBCONTRACTOR">🔧 Subcontractor / Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. DataCore Systems Ltd"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg font-medium text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="text-[10px] text-[#64748B] font-mono pt-1 border-t border-[#E2E8F0]">
              Physical HDD Path: storage/tenders/{tender?.id || '{TDR-ID}'}/{effectiveFolder}/<span className="text-[#2563EB] font-bold">[{safeCompanySlug}]</span>/
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#0F172A] mb-1">
              Document / File Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Trade_License_2026.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Drag & Drop Simulation Box */}
          <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-5 text-center hover:border-[#2563EB] transition-colors bg-[#F8FAFC] cursor-pointer">
            <UploadCloud className="w-7 h-7 text-[#2563EB] mx-auto mb-1.5" />
            <span className="font-semibold text-[#0F172A] block">
              Drag file here or click to browse
            </span>
            <span className="text-[10px] text-[#94A3B8] mt-0.5 block">
              PDF, DOCX, XLSX, or ZIP up to 100MB
            </span>
          </div>

          <div className="p-2.5 bg-[#F0FDF4] rounded-lg border border-[#BBF7D0] flex items-center gap-2 text-[#15803D]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px] leading-tight">
              Cryptographic SHA-256 checksum will be stamped immediately under company folder.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1D4ED8] transition-colors shadow-sm"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Seal &amp; Upload</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

