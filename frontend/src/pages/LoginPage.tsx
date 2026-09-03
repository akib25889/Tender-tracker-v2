import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 border border-[#334155]/30">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            TenderTracker
          </h1>
          <p className="text-xs text-[#64748B] uppercase tracking-wider font-semibold mt-1">
            Procurement Core &amp; Command Center
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Enterprise Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                defaultValue="sarah.jenkins@tendertracker.internal"
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Master Passcode
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#2563EB]" />
              <span>Remember session</span>
            </label>
            <span className="font-mono text-[11px] text-[#2563EB]">Argon2id TLS</span>
          </div>

          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold transition-colors shadow-md"
          >
            <span>Sign In to Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#F1F5F9] text-center text-[11px] text-[#94A3B8]">
          <span>Protected by Enterprise RBAC &amp; Local SSD Vault Encryption</span>
        </div>
      </div>
    </div>
  );
};

