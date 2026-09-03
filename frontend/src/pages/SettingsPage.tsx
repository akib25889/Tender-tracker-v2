import React from 'react';
import { Card } from '../components/ui/Card';
import { HardDrive } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
          <span>System</span>
          <span>•</span>
          <span className="font-semibold text-[#0F172A]">Configuration</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
          System &amp; Storage Settings
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Local SSD storage health, alert interval triggers, and role-based permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Local SSD Storage Vault Health" subtitle="Local server NVMe storage capacity and replication metrics">
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Volume Mount:</span>
                <span className="font-mono text-[#0F172A] font-semibold">/storage/tenders/</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Capacity Used:</span>
                <span className="font-mono text-[#0F172A] font-semibold">142.6 GB / 1.8 TB (7.8%)</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div className="bg-[#16A34A] h-full rounded-full w-[8%]"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#F0FDF4] rounded border border-[#BBF7D0] text-[#15803D] font-medium">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span>SSD Health: Nominal (SMART 100%)</span>
              </div>
              <span className="font-mono text-[11px]">38°C</span>
            </div>
          </div>
        </Card>

        <Card title="RBAC Permission Tiers" subtitle="7-tier enterprise role matrix configured">
          <div className="space-y-2 text-xs">
            {[
              { role: 'Super Admin', desc: 'System configuration, user provisioning, board exports' },
              { role: 'Tender / Bid Director', desc: 'Go/No-Go sign-off, pipeline valuation, tender assignment' },
              { role: 'Technical Solutions Lead', desc: 'Scope analysis, clause verification, technical proposal authoring' },
              { role: 'Finance & Compliance Lead', desc: 'Bank guarantees, solvency certification, BOQ validation' },
              { role: 'Viewer', desc: 'Read-only access to pipeline registries and reports' },
            ].map((r) => (
              <div key={r.role} className="p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#0F172A]">{r.role}</span>
                  <p className="text-[11px] text-[#64748B]">{r.desc}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E2E8F0] text-[#475569]">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

