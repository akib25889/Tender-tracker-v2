import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('s.jenkins@tendertracker.enterprise');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const roles = [
    { name: 'Sarah Jenkins', role: 'Senior Bid Operations Director', email: 's.jenkins@tendertracker.enterprise' },
    { name: 'Dr. Marcus Vance', role: 'Technical Solutions Lead', email: 'm.vance@tendertracker.enterprise' },
    { name: 'Tariq Al-Mansoor', role: 'Finance & Compliance Lead', email: 't.mansoor@tendertracker.enterprise' },
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
            Enterprise Multilateral Procurement &amp; Proposal Core
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
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
              {roles.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => {
                    setEmail(r.email);
                  }}
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

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <span>Access Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="p-3 bg-[#F8FAFC] border-t border-[#F1F5F9] text-center text-[11px] text-[#94A3B8]">
          RBAC Protected • Local SSD Encrypted Vault • v2.1.0
        </div>
      </div>
    </div>
  );
};
