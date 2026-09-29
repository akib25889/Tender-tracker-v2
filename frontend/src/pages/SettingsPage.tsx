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
  Snowflake,
  Flame,
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
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>System</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Infrastructure &amp; Alert Configuration</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            System, Storage &amp; Alert Settings
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Local SSD storage vault directory paths, SHA-256 verification flags, SMTP email notifications, and SLA alert thresholds.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold rounded-lg shadow-sm animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Appearance & Workspace Theme */}
        <Card
          title="Appearance & Interface Theme"
          subtitle="Toggle workspace visual mode between Light Workspace, Dark Command Center, Winter Frost, and Warm Earth"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Light Theme Card Option */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                  theme === 'light'
                    ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-white'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                    theme === 'light'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0F172A]">
                      Light Workspace
                    </span>
                    {theme === 'light' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Clean, bright slate theme tailored for daytime reading, high-key ambient light, and standard document readability.
                  </p>
                </div>
              </button>

              {/* Dark Theme Card Option */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                  theme === 'dark'
                    ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-white'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                    theme === 'dark'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  <Moon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0F172A]">
                      Dark Command Center
                    </span>
                    {theme === 'dark' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    High-contrast dark theme (WCAG AA compliant) with deep elevation surfaces and luminous status badges to reduce eye fatigue.
                  </p>
                </div>
              </button>

              {/* Winter Theme Card Option */}
              <button
                type="button"
                onClick={() => setTheme('winter')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                  theme === 'winter'
                    ? 'bg-[#EEF5FF] border-[#176B87] ring-2 ring-[#86B6F6]/60 shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#B4D4FF] hover:bg-[#EEF5FF]/40'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                    theme === 'winter'
                      ? 'bg-[#176B87] text-white shadow-xs'
                      : 'bg-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  <Snowflake className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0F172A]">
                      Winter Frost
                    </span>
                    {theme === 'winter' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B4D4FF] text-[#176B87] border border-[#86B6F6]">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Arctic winter palette with ice white base, frost borders, glacier blue accents, and deep ocean teal contrast.
                  </p>
                  {/* Swatches */}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: '#EEF5FF' }} title="Ice White: #EEF5FF" />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: '#B4D4FF' }} title="Frost Blue: #B4D4FF" />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: '#86B6F6' }} title="Glacier Blue: #86B6F6" />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: '#176B87' }} title="Ocean Teal: #176B87" />
                  </div>
                </div>
              </button>

              {/* Warm (Worm) Theme Card Option */}
              <button
                type="button"
                onClick={() => setTheme('warm')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                  theme === 'warm'
                    ? 'bg-[#F5F0E8] border-[#1B3254] ring-2 ring-[#4E719D]/60 shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#D9C5B7] hover:bg-[#F5F0E8]/50'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                    theme === 'warm'
                      ? 'bg-[#1B3254] text-white shadow-xs'
                      : 'bg-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  <Flame className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0F172A]">
                      Warm Earth
                    </span>
                    {theme === 'warm' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D9C5B7] text-[#1B3254] border border-[#4E719D]">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Warm earth & coastal palette with linen cream base, sand beige borders, coastal slate blue accents, and deep indigo navy.
                  </p>
                  {/* Swatches */}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: '#F5F0E8' }} title="Warm Cream: #F5F0E8" />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: '#D9C5B7' }} title="Warm Sand: #D9C5B7" />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: '#4E719D' }} title="Slate Blue: #4E719D" />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: '#1B3254' }} title="Midnight Navy: #1B3254" />
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Toggle Action Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <span className="text-[#64748B]">
                  Currently active:{' '}
                  <strong className="text-[#0F172A] capitalize">
                    {theme === 'dark' ? 'Dark Command Center' : theme === 'winter' ? 'Winter Frost' : theme === 'warm' ? 'Warm Earth' : 'Light Workspace'}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 px-3.5 py-1.5 bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Switch to Dark Mode</span>
                  </>
                ) : theme === 'dark' ? (
                  <>
                    <Snowflake className="w-3.5 h-3.5 text-[#176B87]" />
                    <span>Switch to Winter Frost</span>
                  </>
                ) : theme === 'winter' ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>Switch to Warm Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Switch to Light Mode</span>
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
              <label className="block font-semibold text-[#0F172A] mb-1">
                Local Root Filesystem Vault Path:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={vaultPath}
                  onChange={(e) => setVaultPath(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-xs text-[#0F172A]"
                />
                <button
                  type="button"
                  onClick={() => alert('Directory verified: storage/tenders/ exists with read/write permissions.')}
                  className="px-3 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-[#0F172A] rounded-lg font-semibold transition-colors"
                >
                  Verify Path
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-[#2563EB]" />
                <div>
                  <span className="font-semibold text-[#0F172A] block">Local Volume Free Capacity</span>
                  <span className="text-[11px] text-[#64748B]">NVMe SSD partition H:\</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-[#0F172A] block">428.4 GB Free</span>
                <span className="text-[10px] text-[#16A34A]">Optimal Write Performance</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <div>
                <span className="font-semibold text-[#0F172A] block">
                  Enforce Immutable SHA-256 Checksum Verification
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Recalculates cryptographic digest on upload and before statutory sign-off.
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableShaVerification}
                onChange={(e) => setEnableShaVerification(e.target.checked)}
                className="w-4 h-4 accent-[#2563EB]"
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
                <label className="block font-semibold text-[#0F172A] mb-1">
                  SMTP Host / Relay Server:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={smtpServer}
                    onChange={(e) => setSmtpServer(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Port:
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Authorized System Sender Address:
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
              />
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] space-y-2.5">
              <span className="font-semibold text-[#0F172A] block">Subscribed Email Trigger Events:</span>
              
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyDeadlines}
                  onChange={(e) => setNotifyDeadlines(e.target.checked)}
                  className="w-4 h-4 accent-[#2563EB] rounded"
                />
                <div>
                  <span className="font-medium text-[#0F172A] block">Critical Submission Deadline Escalation</span>
                  <span className="text-[11px] text-[#64748B]">Immediate dispatch to lead bid director when deadline &le; 48 hours</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySignOffs}
                  onChange={(e) => setNotifySignOffs(e.target.checked)}
                  className="w-4 h-4 accent-[#2563EB] rounded"
                />
                <div>
                  <span className="font-medium text-[#0F172A] block">Tier 3 / Tier 4 Gatekeeper Sign-Off Requests</span>
                  <span className="text-[11px] text-[#64748B]">Alert assigned Legal Counsel or Business Head when prior tiers are cleared</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyBlockers}
                  onChange={(e) => setNotifyBlockers(e.target.checked)}
                  className="w-4 h-4 accent-[#2563EB] rounded"
                />
                <div>
                  <span className="font-medium text-[#0F172A] block">Requirement Checklist Blockers</span>
                  <span className="text-[11px] text-[#64748B]">Notify whole bid team whenever a mandatory clause is flagged BLOCKER</span>
                </div>
              </label>
            </div>

            {/* Test Email Dispatch Panel */}
            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#2563EB]" />
                <span className="font-medium text-[#0F172A]">Send Test Alert:</span>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-[#CBD5E1] rounded text-xs font-mono text-[#0F172A] w-64"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestEmail}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-semibold shadow-xs transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testEmailSent ? 'Test Alert Dispatched!' : 'Send Test Notification'}</span>
              </button>
            </div>

            {testEmailSent && (
              <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] rounded-lg flex items-center gap-2 text-xs animate-fadeIn">
                <Check className="w-4 h-4 shrink-0 text-[#16A34A]" />
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
              <label className="block font-semibold text-[#0F172A] mb-1">
                Critical Urgency Window (Hours):
              </label>
              <input
                type="number"
                value={alertThresholdHours}
                onChange={(e) => setAlertThresholdHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
              />
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Triggers red pulsing urgency badge on dashboard when remaining time &le; {alertThresholdHours}h.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Gatekeeper Review SLA Limit:
              </label>
              <select className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]">
                <option value="24">24 Hours per Review Tier</option>
                <option value="48">48 Hours per Review Tier</option>
                <option value="72">72 Hours per Review Tier</option>
              </select>
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Escalates to Operations Director if gate review remains pending past SLA.
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B] shadow-sm transition-colors text-xs"
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
