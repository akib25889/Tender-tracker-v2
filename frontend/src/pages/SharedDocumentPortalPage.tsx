import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Shield,
  ShieldAlert,
  Clock,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface ShareData {
  token: string;
  document_id: string;
  document_name: string;
  tender_id: string;
  tender_title?: string;
  folder: string;
  size: string;
  sha256: string;
  can_view: boolean;
  can_download: boolean;
  expires_at?: string;
  status: string;
  shared_by: string;
}

export const SharedDocumentPortalPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    const fetchSharedDoc = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://127.0.0.1:8000/api/shared/${token}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ detail: 'Document link invalid or expired' }));
          throw new Error(errData.detail || 'Access Denied');
        }
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'The requested document link could not be authorized.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedDoc();
    }
  }, [token]);

  const handleCopyHash = () => {
    if (data?.sha256) {
      navigator.clipboard.writeText(data.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#2563EB] selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold font-display shadow-md shadow-blue-500/20">
              TT
            </div>
            <div>
              <h1 className="font-display font-bold text-sm text-white tracking-wide">
                TenderTracker Secure Portal
              </h1>
              <p className="text-[10px] text-[#94A3B8]">
                NYK Advance Joint Venture & Partner File Distribution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Shield className="w-3 h-3" />
              <span>TLS & SHA-256 Verified</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          {loading ? (
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-10 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm text-[#94A3B8]">Verifying cryptographic token and security blockers...</p>
            </div>
          ) : error ? (
            <div className="bg-[#18131B] border border-red-500/30 rounded-2xl p-8 space-y-6 shadow-2xl animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-lg font-bold text-white">Access Authorization Restricted</h2>
                <p className="text-xs text-[#FDA4AF] leading-relaxed max-w-md mx-auto">{error}</p>
              </div>

              <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-4 text-xs text-[#FCA5A5] space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Security Compliance Notice</span>
                </div>
                <p className="text-[11px] text-[#F87171] leading-normal">
                  In accordance with NYK Advance Information Security & JV Isolation policies, this share link may have expired, been revoked by an administrator, or exceeded its access ceiling.
                </p>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs text-[#94A3B8] hover:text-white transition-colors"
                >
                  <span>Return to TenderTracker Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : data ? (
            <div className="bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
              {/* Card Header */}
              <div className="p-6 border-b border-white/10 bg-linear-to-b from-white/5 to-transparent">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {data.folder.replace(/_/g, ' ')}
                  </span>
                  {data.expires_at && (
                    <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Valid until: {new Date(data.expires_at).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white break-all">{data.document_name}</h2>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Context: <span className="text-white font-medium">{data.tender_title}</span> ({data.tender_id})
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Meta & Integrity */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-[#94A3B8] block">File Size</span>
                    <span className="font-semibold text-white mt-0.5 block">{data.size}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-[#94A3B8] block">Permission Level</span>
                    <span className="font-semibold text-blue-400 mt-0.5 block">
                      {data.can_download ? 'Download Permitted' : 'View Only Restricted'}
                    </span>
                  </div>
                </div>

                {/* SHA-256 Checksum */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                    <span className="font-semibold">Cryptographic SHA-256 Fingerprint:</span>
                    <button
                      onClick={handleCopyHash}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedHash ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy Hash</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-[10px] text-white/80 break-all">{data.sha256}</p>
                </div>

                {/* Download CTA */}
                {data.can_download ? (
                  <a
                    href={`http://127.0.0.1:8000/api/shared/${token}/download`}
                    className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Original Document ({data.size})</span>
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0 text-yellow-400" />
                    <span>Download is prohibited by partner permission ceilings. File can only be viewed in approved viewers.</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 border-t border-white/10 bg-black/20 flex items-center justify-between text-[10px] text-[#64748B]">
                <span>Shared by: {data.shared_by}</span>
                <span>Immutable Audit Trail Active</span>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-[#64748B]">
        <p>© 2026 NYK Advance TenderTracker Enterprise. Secure Document Distribution System.</p>
      </footer>
    </div>
  );
};
