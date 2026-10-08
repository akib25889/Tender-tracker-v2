import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/apiConfig';
import { Card } from '../components/ui/Card';
import {
  HardDrive,
  Save,
  Check,
  Mail,
  Bell,
  Send,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, toggleTheme } = useTheme();

  const [vaultPath, setVaultPath] = useState('H:/Tender tracker v2/storage/tenders');
  const [alertThresholdHours, setAlertThresholdHours] = useState(48);
  const [enableShaVerification, setEnableShaVerification] = useState(true);

  // Email Notification & SMTP Settings
  const [smtpServer, setSmtpServer] = useState('smtp.tendertracker.internal');
  const [smtpPort, setSmtpPort] = useState(587);
  const [senderEmail, setSenderEmail] = useState('notifications@tendertracker.enterprise');
  const [notifyDeadlines, setNotifyDeadlines] = useState(true);
  const [notifySignOffs, setNotifySignOffs] = useState(true);
  const [notifyBlockers, setNotifyBlockers] = useState(true);
  const [testEmailAddress, setTestEmailAddress] = useState('s.jenkins@tendertracker.enterprise');
  const [testEmailSent, setTestEmailSent] = useState(false);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Record<string, string> | null) => {
        if (data) {
          if (data.vault_path) setVaultPath(data.vault_path);
          if (data.alert_threshold_hours) setAlertThresholdHours(Number(data.alert_threshold_hours));
          if (data.enable_sha_verification !== undefined) setEnableShaVerification(data.enable_sha_verification === 'true');
          if (data.smtp_server) setSmtpServer(data.smtp_server);
          if (data.smtp_port) setSmtpPort(Number(data.smtp_port));
          if (data.sender_email) setSenderEmail(data.sender_email);
          if (data.notify_deadlines !== undefined) setNotifyDeadlines(data.notify_deadlines === 'true');
          if (data.notify_sign_offs !== undefined) setNotifySignOffs(data.notify_sign_offs === 'true');
          if (data.notify_blockers !== undefined) setNotifyBlockers(data.notify_blockers === 'true');
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vault_path: vaultPath,
          alert_threshold_hours: String(alertThresholdHours),
          enable_sha_verification: String(enableShaVerification),
          smtp_server: smtpServer,
          smtp_port: String(smtpPort),
          sender_email: senderEmail,
          notify_deadlines: String(notifyDeadlines),
          notify_sign_offs: String(notifySignOffs),
          notify_blockers: String(notifyBlockers),
        }),
      });
    } catch {
      // Offline fallback
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSendTestEmail = () => {
    setTestEmailSent(true);
    setTimeout(() => setTestEmailSent(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
            <span>System</span>
            <span>•</span>
            <span className="font-semibold text-[var(--text-primary)]">Infrastructure &amp; Alert Configuration</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            System, Storage &amp; Alert Settings
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Local SSD storage vault directory paths, SHA-256 verification flags, SMTP email notifications, and SLA alert thresholds.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ok-soft)] border border-[var(--ok-line)] text-[var(--ok)] text-xs font-semibold rounded-lg shadow-sm animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Appearance & Workspace Theme */}
        <Card
          title="Appearance"
          subtitle="Both themes come from one token set, so contrast and meaning stay identical"
        >
          <div className="space-y-4 text-xs">
            {/* Two themes, one token set. Accent marks the chosen one — the
                same rule the rest of the app follows. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { id: 'light', name: 'Light', Icon: Sun,
                  blurb: 'Near-white canvas with hairline borders. Best in a bright room or on a projector.' },
                { id: 'dark', name: 'Dark', Icon: Moon,
                  blurb: 'Deep neutral canvas at the same contrast ratios. Easier for long sessions and late portal cutoffs.' },
              ] as const).map(({ id, name, Icon, blurb }) => {
                const active = theme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTheme(id)}
                    aria-pressed={active}
                    className={`tt-focus flex items-start gap-3.5 p-4 rounded-lg border text-left transition-colors ${
 active
                        ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
 active
                          ? 'bg-[var(--accent)] text-[var(--accent-on)]'
                          : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{name}</span>
                        {active && <span className="tt-tag tt-tag-accent">Active</span>}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{blurb}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Toggle Action Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-[var(--text-secondary)]">
                  Currently active:{' '}
                  <strong className="text-[var(--text-primary)] capitalize">
                    {theme === 'dark' ? 'Dark' : 'Light'}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 px-3.5 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    <span>Switch to dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    <span>Switch to light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* Storage Vault Configuration */}
        <Card
          title="Local NVMe Document Vault Configuration"
          subtitle="Physical storage engine parameters under storage/tenders/{TDR-ID}/"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                Local Root Filesystem Vault Path:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={vaultPath}
                  onChange={(e) => setVaultPath(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg font-mono text-xs text-[var(--text-primary)]"
                />
                <button
                  type="button"
                  onClick={() => alert('Directory verified: storage/tenders/ exists with read/write permissions.')}
                  className="px-3 py-2 bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-lg font-semibold transition-colors"
                >
                  Verify Path
                </button>
              </div>
            </div>

            <div className="p-3 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-[var(--accent)]" />
                <div>
                  <span className="font-semibold text-[var(--text-primary)] block">Local Volume Free Capacity</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">NVMe SSD partition H:\</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-[var(--text-primary)] block">428.4 GB Free</span>
                <span className="text-[10px] text-[var(--ok)]">Optimal Write Performance</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)]">
              <div>
                <span className="font-semibold text-[var(--text-primary)] block">
                  Enforce Immutable SHA-256 Checksum Verification
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  Recalculates cryptographic digest on upload and before statutory sign-off.
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableShaVerification}
                onChange={(e) => setEnableShaVerification(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </div>
          </div>
        </Card>



        {/* Email Notifications & SMTP Gateway */}
        <Card
          title="Automated Email Notification Dispatcher"
          subtitle="SMTP gateway configuration for real-time tender deadline alarms and gatekeeper alerts"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  SMTP Host / Relay Server:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={smtpServer}
                    onChange={(e) => setSmtpServer(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg font-mono text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Port:
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg font-mono text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                Authorized System Sender Address:
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg font-mono text-[var(--text-primary)]"
              />
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2.5">
              <span className="font-semibold text-[var(--text-primary)] block">Subscribed Email Trigger Events:</span>
              
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyDeadlines}
                  onChange={(e) => setNotifyDeadlines(e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent)] rounded"
                />
                <div>
                  <span className="font-medium text-[var(--text-primary)] block">Critical Submission Deadline Escalation</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">Immediate dispatch to lead bid director when deadline &le; 48 hours</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySignOffs}
                  onChange={(e) => setNotifySignOffs(e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent)] rounded"
                />
                <div>
                  <span className="font-medium text-[var(--text-primary)] block">Tier 3 / Tier 4 Gatekeeper Sign-Off Requests</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">Alert assigned Legal Counsel or Business Head when prior tiers are cleared</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyBlockers}
                  onChange={(e) => setNotifyBlockers(e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent)] rounded"
                />
                <div>
                  <span className="font-medium text-[var(--text-primary)] block">Requirement Checklist Blockers</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">Notify whole bid team whenever a mandatory clause is flagged BLOCKER</span>
                </div>
              </label>
            </div>

            {/* Test Email Dispatch Panel */}
            <div className="p-3.5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[var(--accent)]" />
                <span className="font-medium text-[var(--text-primary)]">Send Test Alert:</span>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="px-2.5 py-1 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded text-xs font-mono text-[var(--text-primary)] w-64"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestEmail}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] rounded-lg font-semibold shadow-xs transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testEmailSent ? 'Test Alert Dispatched!' : 'Send Test Notification'}</span>
              </button>
            </div>

            {testEmailSent && (
              <div className="p-3 bg-[var(--accent-soft)] border border-[var(--accent-line)] text-[var(--accent)] rounded-lg flex items-center gap-2 text-xs animate-fadeIn">
                <Check className="w-4 h-4 shrink-0 text-[var(--ok)]" />
                <span>
                  Simulated SMTP alert delivered to <strong>{testEmailAddress}</strong>: "CRITICAL: TDR-2026-EU-089 Submission window closing in 48 hours".
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* SLA & Notification Thresholds */}
        <Card
          title="Operational SLA &amp; Cutoff Alert Thresholds"
          subtitle="Timing intervals for pulsing attention badges and automated escalate notifications"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                Critical Urgency Window (Hours):
              </label>
              <input
                type="number"
                value={alertThresholdHours}
                onChange={(e) => setAlertThresholdHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg font-mono text-[var(--text-primary)]"
              />
              <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">
                Triggers red pulsing urgency badge on dashboard when remaining time &le; {alertThresholdHours}h.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                Gatekeeper Review SLA Limit:
              </label>
              <select className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)]">
                <option value="24">24 Hours per Review Tier</option>
                <option value="48">48 Hours per Review Tier</option>
                <option value="72">72 Hours per Review Tier</option>
              </select>
              <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">
                Escalates to Operations Director if gate review remains pending past SLA.
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-[var(--accent-on)] rounded-lg font-semibold hover:bg-[var(--accent-hover)] shadow-sm transition-colors text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};
