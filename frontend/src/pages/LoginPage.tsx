import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, Building2, KeyRound } from 'lucide-react';

interface LoginPageProps {
  initialMode?: 'INTERNAL' | 'PARTNER';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultMode = initialMode || (location.pathname === '/jv' ? 'PARTNER' : 'INTERNAL');
  const [authMode, setAuthMode] = useState<'INTERNAL' | 'PARTNER'>(defaultMode);

  // Internal Form State
  const [email, setEmail] = useState('s.jenkins@tendertracker.enterprise');
  const [password, setPassword] = useState('••••••••••••');

  // Partner Form State
  const [partnerToken, setPartnerToken] = useState('SHR-TOKEN-WB-7712');
  const [partnerEmail, setPartnerEmail] = useState('jv.lead@apexengineering.com');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'INTERNAL') {
      navigate('/dashboard');
    } else {
      // Direct access to the shared document portal via partner token
      if (partnerToken.trim()) {
        navigate(`/shared/${encodeURIComponent(partnerToken.trim())}`);
      }
    }
  };

  const internalRoles = [
    { name: 'Sarah Jenkins', role: 'Senior Bid Operations Director', email: 's.jenkins@tendertracker.enterprise' },
    { name: 'Dr. Marcus Vance', role: 'Technical Solutions Lead', email: 'm.vance@tendertracker.enterprise' },
    { name: 'Tariq Al-Mansoor', role: 'Finance & Compliance Lead', email: 't.mansoor@tendertracker.enterprise' },
  ];

  const demoPartnerTokens = [
    { name: 'Apex Engineering JV', code: 'ORG-APEX-01', token: 'SHR-TOKEN-WB-7712', desc: 'Sovereign Cloud & ERP Subcontractor' },
    { name: 'Global Infra Consortium', code: 'ORG-GLOBAL-02', token: 'SHR-TOKEN-ADB-SCADA', desc: 'Smart Grid SCADA Consortium' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#334155] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#1E293B] text-white border-b border-[#334155] text-center space-y-1">
          <div className="w-10 h-10 rounded-lg bg-[#2563EB] text-white flex items-center justify-center mx-auto mb-2 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-display text-lg font-bold tracking-tight">
            TenderTracker Command Center
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Enterprise Multilateral Procurement &amp; Collaborative Vault
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 bg-[#F1F5F9] p-1 border-b border-[#E2E8F0] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMode('INTERNAL')}
            className={`py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'INTERNAL'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Internal Bid Team</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('PARTNER')}
            className={`py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'PARTNER'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>JV / Partner Portal</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          {authMode === 'INTERNAL' ? (
            <>
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Enterprise Email Address
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Corporate Password / SSO Token
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Quick Role Switcher for Demo */}
              <div>
                <label className="block font-semibold text-[#64748B] mb-1.5">
                  Quick Switch Persona (Demo Environment):
                </label>
                <div className="space-y-1.5">
                  {internalRoles.map((r) => (
                    <button
                      key={r.name}
                      type="button"
                      onClick={() => setEmail(r.email)}
                      className={`w-full p-2 text-left rounded-lg border transition-colors flex items-center justify-between ${
                        email === r.email
                          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-bold'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <span>{r.name}</span>
                      <span className="text-[10px] font-normal font-mono">{r.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-[#065F46] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <KeyRound className="w-4 h-4 text-[#10B981]" />
                  <span>Secure JV &amp; Consortium Gateway</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Enter your cryptographic authorization token or select an assigned partner organization below to access authorized proposal files and ceilings.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Partner Representative Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    placeholder="partner.delegate@org.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Security Share Token / Access Key
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    required
                    value={partnerToken}
                    onChange={(e) => setPartnerToken(e.target.value)}
                    placeholder="e.g. SHR-TOKEN-..."
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] font-mono focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              {/* Demo Partner Selectors */}
              <div>
                <label className="block font-semibold text-[#64748B] mb-1.5">
                  Verified Partner Organizations:
                </label>
                <div className="space-y-1.5">
                  {demoPartnerTokens.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setPartnerToken(p.token)}
                      className={`w-full p-2 text-left rounded-lg border transition-colors flex items-center justify-between ${
                        partnerToken === p.token
                          ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-bold'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-[#0F172A]">{p.name}</div>
                        <div className="text-[10px] text-[#64748B]">{p.desc}</div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0]">
                        {p.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-2.5 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md ${
                authMode === 'INTERNAL'
                  ? 'bg-[#0F172A] hover:bg-[#1E293B]'
                  : 'bg-[#059669] hover:bg-[#047857]'
              }`}
            >
              <span>{authMode === 'INTERNAL' ? 'Access Command Center' : 'Access Partner Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="p-3 bg-[#F8FAFC] border-t border-[#F1F5F9] text-center text-[11px] text-[#94A3B8]">
          RBAC Protected • Local SSD Encrypted Vault • v2.5.0
        </div>
      </div>
    </div>
  );
};
