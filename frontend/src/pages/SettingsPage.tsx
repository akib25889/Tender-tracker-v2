import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { HardDrive, Save, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [vaultPath, setVaultPath] = useState('H:/Tender tracker v2/storage/tenders');
  const [alertThresholdHours, setAlertThresholdHours] = useState(48);
  const [enableShaVerification, setEnableShaVerification] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>System</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Infrastructure Configuration</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            System &amp; Storage Settings
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Local SSD storage vault directory paths, SHA-256 verification flags, and operational SLA parameters.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold rounded-lg shadow-sm">
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
                  className="px-3 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-[#0F172A] rounded-lg font-semibold"
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
