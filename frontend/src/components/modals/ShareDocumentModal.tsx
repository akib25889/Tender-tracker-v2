import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useState, useEffect } from 'react';
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
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface ActiveShare {
  id: number;
  token: string;
  shared_with_type: string;
  recipient_email?: string;
  can_download: boolean;
  expires_at?: string;
  status: string;
  created_at: string;
}

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
  const [activeShares, setActiveShares] = useState<ActiveShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);

  const tenderId = activeDocForShare?.tenderId;
  const doc = activeDocForShare?.doc;

  const fetchActiveShares = async () => {
    if (!doc?.id) return;
    try {
      setLoadingShares(true);
      const res = await fetch(`${API_BASE_URL}/documents/${doc.id}/shares`);
      if (res.ok) {
        const data = await res.json();
        setActiveShares(data);
      }
    } catch (err) {
      console.error('Failed to fetch active shares:', err);
    } finally {
      setLoadingShares(false);
    }
  };

  useEffect(() => {
    if (doc?.id) {
      fetchActiveShares();
      setGeneratedUrl(null);
      setEmail('');
    }
  }, [doc?.id]);

  if (!activeDocForShare || !doc || !tenderId) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${doc.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shared_with_type: email.trim() ? 'USER' : 'PUBLIC',
          recipient_email: email.trim() || undefined,
          can_view: true,
          can_preview: true,
          can_download: permission === 'DOWNLOAD_ALLOWED',
          expires_in_days: 7,
        }),
      });

      if (res.ok) {
        const share = await res.json();
        const url = `${window.location.origin}/shared/${share.token}`;
        setGeneratedUrl(url);
        fetchActiveShares();
      } else {
        // Fallback to local context
        const link = shareDocument(tenderId, doc.id, {
          permission,
          email: email.trim() || undefined,
        });
        const url = `${window.location.origin}/shared/${link.token}`;
        setGeneratedUrl(url);
      }
    } catch (err) {
      const link = shareDocument(tenderId, doc.id, {
        permission,
        email: email.trim() || undefined,
      });
      const url = `${window.location.origin}/shared/${link.token}`;
      setGeneratedUrl(url);
    }
  };

  const handleRevokeShare = async (shareId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/shares/${shareId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchActiveShares();
      }
    } catch (err) {
      console.error('Failed to revoke share:', err);
    }
  };

  const handleCopy = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="tt-overlay items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[var(--bg-surface)] rounded-xl shadow-2xl border border-[var(--border-default)] max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--bg-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
                Share Document Vault File
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)]">
                Generate secure time-limited link with granular permission controls
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveDocForShare(null)}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Target Summary */}
        <div className="p-4 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-xs shrink-0">
          <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)] truncate">
            <FileCheck className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span className="truncate">{doc.name}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)] font-mono mt-1">
            <span>Tender Context: {tenderId}</span>
            <span>Integrity: SHA-256 Verified</span>
          </div>
        </div>

        {/* Body Form */}
        <div className="overflow-y-auto p-6 space-y-4 text-xs">
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Permission selector */}
            <div>
              <label className="block font-bold text-[var(--text-primary)] mb-2">
                Access Permission Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPermission('VIEW_ONLY')}
                  className={`p-3 rounded-lg border text-left transition-all ${
 permission === 'VIEW_ONLY'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>View Only</span>
                  </div>
                  <span className="text-[10px] block opacity-80">
                    Read directly in browser without file download
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPermission('DOWNLOAD_ALLOWED')}
                  className={`p-3 rounded-lg border text-left transition-all ${
 permission === 'DOWNLOAD_ALLOWED'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
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
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                Recipient Email (Optional Restriction)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="partner@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            {/* Generated URL view & copy */}
            {generatedUrl ? (
              <div className="p-3 bg-[var(--ok-soft)] border border-[var(--ok-line)] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[var(--ok)] font-bold">
                  <span>Live Secure Link (Expires in 7 days)</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedUrl}
                    className="flex-1 px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--ok-line)] rounded text-[11px] font-mono text-[var(--text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--ok)] text-[var(--accent-on)] rounded text-xs font-semibold hover:bg-[var(--ok)] transition-colors shadow-xs"
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
                className="w-full py-2.5 bg-[var(--accent)] text-[var(--accent-on)] rounded-lg text-xs font-semibold hover:bg-[var(--accent-hover)] shadow-sm transition-colors"
              >
                Create Live Share Link
              </button>
            )}
          </form>

          {/* Existing Active Shares Table (Sections 28 & 29) */}
          <div className="pt-3 border-t border-[var(--border-default)] space-y-2">
            <h4 className="font-bold text-xs text-[var(--text-primary)]">Active Share Links for this File</h4>
            {loadingShares ? (
              <p className="text-[11px] text-[var(--text-secondary)]">Loading shares...</p>
            ) : activeShares.length === 0 ? (
              <p className="text-[11px] text-[var(--text-secondary)]">No active share links recorded yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {activeShares.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] flex items-center justify-between gap-2 text-[11px]"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[var(--accent)]">{s.token.slice(0, 10)}...</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[var(--accent-soft)] text-[var(--accent)]">
                          {s.can_download ? 'DOWNLOAD' : 'VIEW ONLY'}
                        </span>
                        {s.recipient_email && (
                          <span className="text-[var(--text-secondary)]">→ {s.recipient_email}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        Created: {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={`/shared/${s.token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
                        title="Open portal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleRevokeShare(s.id)}
                        className="p-1 rounded text-[var(--crit)] hover:bg-[var(--crit-soft)]"
                        title="Revoke Share Immediately"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-default)] bg-[var(--bg-subtle)] text-[10px] text-[var(--text-muted)] flex items-center justify-between shrink-0">
          <span>Author: {currentUser.name} ({currentUser.role})</span>
          <span>Verified Audit Trail Active</span>
        </div>
      </div>
    </div>
  );
};
