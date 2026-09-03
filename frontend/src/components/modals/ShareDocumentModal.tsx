import React, { useState } from 'react';
import { useTenders } from '../../context/TenderContext';
import {
  X,
  Share2,
  Copy,
  Check,
  Shield,
  Clock,
  Mail,
  FileCheck,
  Lock,
} from 'lucide-react';

export const ShareDocumentModal: React.FC = () => {
  const {
    activeDocForShare,
    setActiveDocForShare,
    shareDocument,
    currentUser,
  } = useTenders();

  const [permission, setPermission] = useState<'VIEW_ONLY' | 'DOWNLOAD_ALLOWED'>(
    'VIEW_ONLY'
  );
  const [email, setEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  if (!activeDocForShare) return null;

  const { tenderId, doc } = activeDocForShare;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const link = shareDocument(tenderId, doc.id, {
      permission,
      email: email.trim() || undefined,
    });
    const url = `https://tendertracker.io/vault/share/${link.token}`;
    setGeneratedUrl(url);
  };

  const handleCopy = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-[#0F172A]">
                Share Document Vault File
              </h3>
              <p className="text-[10px] text-[#64748B]">
                Generate secure time-limited link with granular permission controls
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveDocForShare(null)}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Target Summary */}
        <div className="p-4 bg-[#F1F5F9] border-b border-[#E2E8F0] text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#0F172A] truncate">
            <FileCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span className="truncate">{doc.name}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-[#64748B] font-mono mt-1">
            <span>Size: {doc.size}</span>
            <span>Rev: {doc.revision}</span>
            <span>Tender: {tenderId}</span>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleGenerate} className="p-6 space-y-4 text-xs">
          {/* Permission selector */}
          <div>
            <label className="block font-bold text-[#0F172A] mb-2">
              Access Permission Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPermission('VIEW_ONLY')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  permission === 'VIEW_ONLY'
                    ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>View Only</span>
                </div>
                <span className="text-[10px] block opacity-80">
                  Read in browser; watermarked without download
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPermission('DOWNLOAD_ALLOWED')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  permission === 'DOWNLOAD_ALLOWED'
                    ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Full Download</span>
                </div>
                <span className="text-[10px] block opacity-80">
                  Authorized partners can download original PDF
                </span>
              </button>
            </div>
          </div>

          {/* Email restriction (Optional) */}
          <div>
            <label className="block font-semibold text-[#475569] mb-1">
              Recipient Email (Optional)
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="partner@organization.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A]"
              />
            </div>
          </div>

          {/* Generated URL view & copy */}
          {generatedUrl ? (
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#15803D] font-bold">
                <span>Secure Link Ready (Expires in 7 days)</span>
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-[#BBF7D0] rounded text-[11px] font-mono text-[#0F172A]"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#15803D] text-white rounded text-xs font-semibold hover:bg-[#166534] transition-colors shadow-xs"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] shadow-sm transition-colors"
            >
              Generate Share Link
            </button>
          )}

          <div className="pt-2 text-[10px] text-[#94A3B8] flex items-center justify-between">
            <span>Author: {currentUser.name} ({currentUser.role})</span>
            <span>Verified Audit Trail Active</span>
          </div>
        </form>
      </div>
    </div>
  );
};

