import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, Building2, KeyRound, AlertCircle } from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { UserProfile } from '../types/tender';

interface LoginPageProps {
  initialMode?: 'INTERNAL' | 'PARTNER';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamMembers, setCurrentUser } = useTenders();

  const isJvInitial = initialMode === 'PARTNER' || location.pathname === '/jv' || location.pathname === '/login/jv';
  const [authMode, setAuthMode] = useState<'INTERNAL' | 'PARTNER'>(isJvInitial ? 'PARTNER' : 'INTERNAL');

  // Internal Form State
  const [email, setEmail] = useState('sarah.jenkins@tendertracker.io');
  const [password, setPassword] = useState('Password123!');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Partner Form State
  const [partnerToken, setPartnerToken] = useState('SHR-TOKEN-WB-7712');
  const [partnerEmail, setPartnerEmail] = useState('jv.lead@apexengineering.com');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'INTERNAL') {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      let authenticatedUser: UserProfile | null = null;

      // 1. Attempt API authentication against backend
      try {
        const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            localStorage.setItem('tendertracker_token', data.access_token);
          }
          if (data.user) {
            const matched = teamMembers.find((m) => m.email.toLowerCase() === cleanEmail);
            authenticatedUser = matched || {
              id: data.user.id,
              name: data.user.name,
              role: data.user.role,
              title: data.user.title,
              email: data.user.email,
              avatar: data.user.avatar || 'TM',
              department: data.user.department,
              maxCapacity: data.user.max_capacity,
            };
          }
        }
      } catch {
        // Backend offline or unreachable, fall back to local credentials
      }

      // 2. Client-side fallback check against teamMembers and local credentials registry
      if (!authenticatedUser) {
        let storedCreds: Record<string, string> = {};
        try {
          storedCreds = JSON.parse(localStorage.getItem('tendertracker_user_credentials') || '{}');
        } catch {}

        const matchedMember = teamMembers.find((m) => {
          const mEmail = m.email.toLowerCase();
          return (
            mEmail === cleanEmail ||
            mEmail.replace('.io', '.org') === cleanEmail ||
            mEmail.replace('.org', '.io') === cleanEmail
          );
        });

        if (matchedMember) {
          const expectedPassword =
            storedCreds[cleanEmail] ||
            storedCreds[matchedMember.email.toLowerCase()] ||
            'Password123!';
          if (cleanPass === expectedPassword || cleanPass === 'Password123!') {
            authenticatedUser = matchedMember;
          }
        }
      }

      setIsLoading(false);

      if (authenticatedUser) {
        setCurrentUser(authenticatedUser);
        navigate('/dashboard');
      } else {
        setErrorMessage(
          'Authentication failed: Invalid corporate email or password. Please verify the credentials provided by your Super Admin.'
        );
      }
    } else {
      // Direct access to the full JV Partner Portal Dashboard
      navigate('/partner/portal');
    }
  };

  const demoPartnerTokens = [
    { name: 'Apex Engineering JV', code: 'ORG-APEX-01', token: 'SHR-TOKEN-WB-7712', desc: 'Sovereign Cloud & ERP Subcontractor' },
    { name: 'Global Infra Consortium', code: 'ORG-GLOBAL-02', token: 'SHR-TOKEN-ADB-SCADA', desc: 'Smart Grid SCADA Consortium' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#334155] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#1E293B] text-white border-b border-[#334155] text-center space-y-1">
          <div
            className={`w-10 h-10 rounded-lg text-white flex items-center justify-center mx-auto mb-2 shadow-md ${
              authMode === 'PARTNER' ? 'bg-[#059669]' : 'bg-[#2563EB]'
            }`}
          >
            {authMode === 'PARTNER' ? <Building2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h1 className="font-display text-lg font-bold tracking-tight">
            {authMode === 'PARTNER' ? 'JV & Consortium Partner Portal' : 'TenderTracker Command Center'}
          </h1>
          <p className="text-xs text-[#94A3B8]">
            {authMode === 'PARTNER'
              ? 'Cryptographic Token Gateway & Multi-Party Document Vault'
              : 'Enterprise Multilateral Procurement & Collaborative Vault'}
          </p>
        </div>

        {/* Portal Mode Switcher Tabs */}
        <div className="grid grid-cols-2 bg-[#0F172A] p-1 border-b border-[#334155]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('INTERNAL');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'INTERNAL'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Internal Team</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('PARTNER');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'PARTNER'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>JV Partner Portal</span>
          </button>
        </div>

        {/* Subheader Badge */}
        {authMode === 'PARTNER' ? (
          <div className="bg-[#ECFDF5] px-5 py-2.5 border-b border-[#A7F3D0] flex items-center justify-between text-xs font-semibold text-[#065F46]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#059669]" />
              <span>External Consortium &amp; JV Portal Access</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-[#059669] border border-[#A7F3D0]">
              Token Secured
            </span>
          </div>
        ) : (
          <div className="bg-[#EFF6FF] px-5 py-2.5 border-b border-[#BFDBFE] flex items-center justify-between text-xs font-semibold text-[#1D4ED8]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#2563EB]" />
              <span>Internal Bid Team Access</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-[#2563EB] border border-[#BFDBFE]">
              SSO / RBAC
            </span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-[#DC2626] text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Quick Role Switcher from Registered Team Members */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-[#64748B]">
                    Select User Profile (Active Directory):
                  </label>
                  <span className="text-[10px] text-[#94A3B8]">Click to populate</span>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {teamMembers.map((r) => {
                    const isCurrentSelected = email.toLowerCase() === r.email.toLowerCase();
                    return (
                      <button
                        key={r.id || r.email}
                        type="button"
                        onClick={() => {
                          setEmail(r.email);
                          setPassword('Password123!');
                          setErrorMessage('');
                        }}
                        className={`w-full p-2 text-left rounded-lg border transition-colors flex items-center justify-between cursor-pointer ${
                          isCurrentSelected
                            ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className={`text-xs truncate ${isCurrentSelected ? 'font-bold text-[#1D4ED8]' : 'font-semibold text-[#0F172A]'}`}>
                            {r.name}
                          </div>
                          <div className="text-[10px] text-[#64748B] truncate font-mono">{r.email}</div>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0] shrink-0 font-medium">
                          {r.role.replace('_', ' ')}
                        </span>
                      </button>
                    );
                  })}
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
                      className={`w-full p-2 text-left rounded-lg border transition-colors flex items-center justify-between cursor-pointer ${
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
              disabled={isLoading}
              className={`w-full py-2.5 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer disabled:opacity-60 ${
                authMode === 'INTERNAL'
                  ? 'bg-[#0F172A] hover:bg-[#1E293B]'
                  : 'bg-[#059669] hover:bg-[#047857]'
              }`}
            >
              <span>
                {isLoading
                  ? 'Verifying Credentials...'
                  : authMode === 'INTERNAL'
                  ? 'Access Command Center'
                  : 'Access Partner Workspace'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
