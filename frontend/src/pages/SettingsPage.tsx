import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { HardDrive, Save, Check, Mail, Bell, Send } from 'lucide-react';

export const SettingsPage: React.FC = () => {
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
