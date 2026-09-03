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
  } = useTenders();

  const [fileName, setFileName] = useState('');

  if (!uploadFolderTarget && !activeTenderIdForModal) return null;

  const handleClose = () => {
    setUploadFolderTarget(null);
    setActiveTenderIdForModal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTenderIdForModal) {
      addDocument(activeTenderIdForModal, {
        name: fileName || 'Statutory_Compliance_Evidence_v1.pdf',
        folder: uploadFolderTarget || '03_technical_proposal',
        size: '4.2 MB',
      });
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div>
            <h3 className="font-display text-base font-bold text-[#0F172A]">
              Upload Vault Document
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Secure upload to local SSD with automatic SHA-256 revision hash
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
          <div>
            <label className="block font-semibold text-[#0F172A] mb-1">
              Target Vault Directory
            </label>
            <div className="flex items-center gap-2 p-2 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] font-mono text-[11px] text-[#0F172A]">
              <Folder className="w-4 h-4 text-[#2563EB]" />
              <span>/{uploadFolderTarget || '03_technical_proposal'}/</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#0F172A] mb-1">
              Document / File Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bank_Solvency_Letter_Notarized_2026.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Drag & Drop Simulation Box */}
          <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-6 text-center hover:border-[#2563EB] transition-colors bg-[#F8FAFC] cursor-pointer">
            <UploadCloud className="w-8 h-8 text-[#2563EB] mx-auto mb-2" />
            <span className="font-semibold text-[#0F172A] block">
              Drag file here or click to browse
            </span>
            <span className="text-[10px] text-[#94A3B8] mt-1 block">
              PDF, DOCX, XLSX, or ZIP up to 100MB
            </span>
          </div>

          <div className="p-3 bg-[#F0FDF4] rounded-lg border border-[#BBF7D0] flex items-center gap-2 text-[#15803D]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px] leading-tight">
              Cryptographic SHA-256 checksum will be stamped immediately upon upload.
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
