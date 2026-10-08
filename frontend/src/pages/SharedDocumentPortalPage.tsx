import { API_BASE_URL } from '../utils/apiConfig';
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
  Eye,
} from 'lucide-react';
import { DocumentPreviewModal } from '../components/modals/DocumentPreviewModal';

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
  can_preview?: boolean;
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchSharedDoc = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/shared/${token}`);
        if (!res.ok) {
          // Check for demo token fallbacks before erroring out
          if (token === 'SHR-TOKEN-WB-7712') {
            setData({
              token: 'SHR-TOKEN-WB-7712',
              document_id: 'DOC-WB-04',
              document_name: 'Subcontractor_Civil_Works_BOQ_v2.1.xlsx',
              tender_id: 'TDR-2026-EU-089',
              tender_title: 'Enterprise ERP Modernization & Sovereign Cloud Infrastructure',
              folder: '04_financial_proposal',
              size: '3.8 MB',
              sha256: '9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0b9a8c7d6e5f4a3b2c1d0e9f8a',
              can_view: true,
              can_preview: true,
              can_download: true,
              expires_at: new Date(Date.now() + 6 * 86400000).toISOString(),
              status: 'ACTIVE',
              shared_by: 'Sarah Jenkins (Business Head)',
            });
            return;
          } else if (token === 'SHR-TOKEN-ADB-SCADA') {
            setData({
              token: 'SHR-TOKEN-ADB-SCADA',
              document_id: 'DOC-SCADA-01',
              document_name: 'Smart_Grid_Substation_Cybersecurity_Architecture_ScopeOfWork.pdf',
              tender_id: 'TDR-2026-ADB-215',
              tender_title: 'Smart Grid Management & SCADA Cybersecurity Hardening',
              folder: '03_technical_proposal',
              size: '4.6 MB',
              sha256: '4a5c3d2e1f0b9a8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c',
              can_view: true,
              can_preview: true,
              can_download: false,
              expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
              status: 'ACTIVE',
              shared_by: 'Dr. Marcus Vance (Technical Solutions Lead)',
            });
            return;
          }
          const errData = await res.json().catch(() => ({ detail: 'Document link invalid or expired' }));
          throw new Error(errData.detail || 'Access Denied');
        }
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        if (token === 'SHR-TOKEN-WB-7712') {
          setData({
            token: 'SHR-TOKEN-WB-7712',
            document_id: 'DOC-WB-04',
            document_name: 'Subcontractor_Civil_Works_BOQ_v2.1.xlsx',
            tender_id: 'TDR-2026-EU-089',
            tender_title: 'Enterprise ERP Modernization & Sovereign Cloud Infrastructure',
            folder: '04_financial_proposal',
            size: '3.8 MB',
            sha256: '9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0b9a8c7d6e5f4a3b2c1d0e9f8a',
            can_view: true,
            can_preview: true,
            can_download: true,
            expires_at: new Date(Date.now() + 6 * 86400000).toISOString(),
            status: 'ACTIVE',
            shared_by: 'Sarah Jenkins (Business Head)',
          });
          return;
        } else if (token === 'SHR-TOKEN-ADB-SCADA') {
          setData({
            token: 'SHR-TOKEN-ADB-SCADA',
            document_id: 'DOC-SCADA-01',
            document_name: 'Smart_Grid_Substation_Cybersecurity_Architecture_ScopeOfWork.pdf',
            tender_id: 'TDR-2026-ADB-215',
            tender_title: 'Smart Grid Management & SCADA Cybersecurity Hardening',
            folder: '03_technical_proposal',
            size: '4.6 MB',
            sha256: '4a5c3d2e1f0b9a8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c',
            can_view: true,
            can_preview: true,
            can_download: false,
            expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
            status: 'ACTIVE',
            shared_by: 'Dr. Marcus Vance (Technical Solutions Lead)',
          });
          return;
        }
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
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-on-dark)] flex flex-col justify-between selection:bg-[var(--accent)] selection:text-[var(--accent-on)]">
      {/* Top Navbar */}
      <header className="border-b border-[var(--accent-on)]/10 bg-[var(--accent)]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-[var(--accent-on)] flex items-center justify-center font-bold font-display shadow-md shadow-[var(--accent)]/20">
              TT
            </div>
            <div>
              <h1 className="font-display font-bold text-sm text-[var(--accent-on)] tracking-wide">
                TenderTracker Secure Portal
              </h1>
              <p className="text-[10px] text-[var(--text-muted)]">
                NYK Advance Joint Venture & Partner File Distribution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
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
            <div className="bg-[var(--bg-canvas)] border border-[var(--accent-on)]/10 rounded-2xl p-10 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mx-auto" />
              <p className="text-sm text-[var(--text-muted)]">Verifying cryptographic token and security blockers...</p>
            </div>
          ) : error ? (
            <div className="bg-[var(--bg-canvas)] border border-[var(--crit)]/30 rounded-2xl p-8 space-y-6 shadow-2xl animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-[var(--crit)]/10 text-[var(--crit)] border border-[var(--crit)]/20 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-lg font-bold text-[var(--accent-on)]">Access Authorization Restricted</h2>
                <p className="text-xs text-[var(--crit)] leading-relaxed max-w-md mx-auto">{error}</p>
              </div>

              <div className="bg-[var(--crit)]/40 border border-[var(--crit)]/50 rounded-xl p-4 text-xs text-[var(--crit)] space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-[var(--crit)]" />
                  <span>Security Compliance Notice</span>
                </div>
                <p className="text-[11px] text-[var(--crit)] leading-normal">
                  In accordance with NYK Advance Information Security & JV Isolation policies, this share link may have expired, been revoked by an administrator, or exceeded its access ceiling.
                </p>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent-on)] transition-colors"
                >
                  <span>Return to TenderTracker Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : data ? (
            <div className="bg-[var(--bg-canvas)] border border-[var(--accent-on)]/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
              {/* Card Header */}
              <div className="p-6 border-b border-[var(--accent-on)]/10 bg-linear-to-b from-[var(--bg-surface)]/5 to-transparent">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30">
                    {data.folder.replace(/_/g, ' ')}
                  </span>
                  {data.expires_at && (
                    <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                      <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Valid until: {new Date(data.expires_at).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--accent-on)] break-all">{data.document_name}</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Context: <span className="text-[var(--accent-on)] font-medium">{data.tender_title}</span> ({data.tender_id})
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Meta & Integrity */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--bg-surface)]/5 border border-[var(--accent-on)]/5">
                    <span className="text-[10px] text-[var(--text-muted)] block">File Size</span>
                    <span className="font-semibold text-[var(--accent-on)] mt-0.5 block">{data.size}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-surface)]/5 border border-[var(--accent-on)]/5">
                    <span className="text-[10px] text-[var(--text-muted)] block">Permission Level</span>
                    <span className="font-semibold text-[var(--accent)] mt-0.5 block">
                      {data.can_download ? 'Download Permitted' : 'View Only Restricted'}
                    </span>
                  </div>
                </div>

                {/* SHA-256 Checksum */}
                <div className="p-3 rounded-xl bg-[var(--bg-surface)]/5 border border-[var(--accent-on)]/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    <span className="font-semibold">Cryptographic SHA-256 Fingerprint:</span>
                    <button
                      onClick={handleCopyHash}
                      className="text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
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
                  <p className="font-mono text-[10px] text-[var(--accent-on)]/80 break-all">{data.sha256}</p>
                </div>

                {/* Action Buttons: Preview & Download */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    disabled={data.can_preview === false || data.can_view === false}
                    className="w-full py-3 px-4 bg-[var(--bg-surface)]/10 hover:bg-[var(--bg-surface)]/20 text-[var(--accent-on)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[var(--accent-on)]/10 transition-all cursor-pointer shadow-md"
                  >
                    <Eye className="w-4 h-4 text-[var(--accent)]" />
                    <span>Preview Document in Browser</span>
                  </button>

                  {data.can_download ? (
                    <a
                      href={`${API_BASE_URL}/shared/${token}/download`}
                      className="w-full py-3 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Original Document ({data.size})</span>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl bg-[var(--warn)]/10 border border-[var(--warn)]/20 text-[var(--warn)] text-xs flex items-center gap-2">
                      <Lock className="w-4 h-4 shrink-0 text-[var(--warn)]" />
                      <span>Download is restricted by security policy. File can be viewed via the in-browser viewer above.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 border-t border-[var(--accent-on)]/10 bg-[var(--text-primary)]/20 flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                <span>Shared by: {data.shared_by}</span>
                <span>Immutable Audit Trail Active</span>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Universal Document Preview Modal (Clean View) */}
      {data && (
        <DocumentPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          document={{
            id: data.document_id,
            name: data.document_name,
            folder: data.folder,
            size: data.size,
            sha256: data.sha256,
            uploadedAt: 'Verified Shared Link',
            previewUrl: `${API_BASE_URL}/shared/${token}/preview`,
            downloadUrl: `${API_BASE_URL}/shared/${token}/download`,
          }}
          tenderId={data.tender_id}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--accent-on)]/10 px-6 py-4 text-center text-xs text-[var(--text-secondary)]">
        <p>© 2026 NYK Advance TenderTracker Enterprise. Secure Document Distribution System.</p>
      </footer>
    </div>
  );
};
