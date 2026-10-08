import { API_BASE_URL } from '../utils/apiConfig';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, Building2, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { UserProfile } from '../types/tender';

interface LoginPageProps {
  initialMode?: 'INTERNAL' | 'PARTNER';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useTenders();

  const isJvInitial = initialMode === 'PARTNER' || location.pathname === '/jv' || location.pathname === '/login/jv';
  const [authMode, setAuthMode] = useState<'INTERNAL' | 'PARTNER'>(isJvInitial ? 'PARTNER' : 'INTERNAL');

  // Internal Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Partner Form State
  const [partnerToken, setPartnerToken] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'INTERNAL') {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanEmail || !cleanPass) {
        setErrorMessage('Please enter both your corporate email and password.');
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
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
            const authenticatedUser: UserProfile = {
              id: data.user.id,
              name: data.user.name,
              role: data.user.role,
              title: data.user.title || '',
              email: data.user.email,
              avatar: data.user.avatar || (data.user.name ? data.user.name.slice(0, 2).toUpperCase() : 'U'),
              department: data.user.department || '',
              maxCapacity: data.user.max_capacity || 10,
            };
            setCurrentUser(authenticatedUser);
            setIsLoading(false);
            const redirectPath = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(redirectPath, { replace: true });
            return;
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setErrorMessage(errData.detail || 'Authentication failed: Invalid corporate email or password.');
        }
      } catch {
        setErrorMessage('Unable to connect to TenderTracker authentication server. Please verify your connection.');
      }
      setIsLoading(false);
    } else {
      // JV Partner Portal validation
      const cleanToken = partnerToken.trim();
      const cleanPartnerEmail = partnerEmail.trim();

      if (!cleanToken || !cleanPartnerEmail) {
        setErrorMessage('Please enter both your partner representative email and access key token.');
        return;
      }

      navigate(`/shared/${encodeURIComponent(cleanToken)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--accent)] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-surface)] rounded-xl shadow-2xl border border-[var(--border-strong)] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[var(--accent-hover)] text-[var(--accent-on)] border-b border-[var(--border-strong)] text-center space-y-1">
          <div
            className={`w-10 h-10 rounded-lg text-[var(--accent-on)] flex items-center justify-center mx-auto mb-2 shadow-md ${
 authMode === 'PARTNER' ? 'bg-[var(--ok)]' : 'bg-[var(--accent)]'
 }`}
          >
            {authMode === 'PARTNER' ? <Building2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h1 className="font-display text-lg font-bold tracking-tight">
            {authMode === 'PARTNER' ? 'JV & Consortium Partner Portal' : 'TenderTracker Command Center'}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            {authMode === 'PARTNER'
              ? 'Cryptographic Token Gateway & Multi-Party Document Vault'
              : 'Enterprise Multilateral Procurement & Collaborative Vault'}
          </p>
        </div>

        {/* Portal Mode Switcher Tabs */}
        <div className="grid grid-cols-2 bg-[var(--accent)] p-1 border-b border-[var(--border-strong)]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('INTERNAL');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
 authMode === 'INTERNAL'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--accent-on)]'
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
 ? 'bg-[var(--ok)] text-[var(--accent-on)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--accent-on)]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>JV Partner Portal</span>
          </button>
        </div>

        {/* Subheader Badge */}
        {authMode === 'PARTNER' ? (
          <div className="bg-[var(--ok-soft)] px-5 py-2.5 border-b border-[var(--ok-line)] flex items-center justify-between text-xs font-semibold text-[var(--ok)]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--ok)]" />
              <span>External Consortium &amp; JV Portal Access</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--ok)] border border-[var(--ok-line)]">
              Token Secured
            </span>
          </div>
        ) : (
          <div className="bg-[var(--accent-soft)] px-5 py-2.5 border-b border-[var(--accent-line)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--accent)]" />
              <span>Internal Bid Team Access</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--accent)] border border-[var(--accent-line)]">
              SSO / RBAC
            </span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-[var(--crit-soft)] border border-[var(--crit-line)] rounded-lg text-[var(--crit)] text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authMode === 'INTERNAL' ? (
            <>
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Enterprise Email Address
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Corporate Password / SSO Token
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full pl-9 pr-10 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-[var(--ok-soft)] border border-[var(--ok-line)] rounded-lg text-[var(--ok)] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <KeyRound className="w-4 h-4 text-[var(--ok)]" />
                  <span>Secure JV &amp; Consortium Gateway</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Enter your cryptographic authorization token and authorized email to access shared proposal files and submission ceilings.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Partner Representative Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    placeholder="partner.delegate@org.com"
                    className="w-full pl-9 pr-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ok)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Security Share Token / Access Key
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={partnerToken}
                    onChange={(e) => setPartnerToken(e.target.value)}
                    placeholder="e.g. SHR-TOKEN-..."
                    className="w-full pl-9 pr-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-mono placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ok)]"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 text-[var(--accent-on)] rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer disabled:opacity-60 ${
 authMode === 'INTERNAL'
 ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'
                  : 'bg-[var(--ok)] hover:bg-[var(--ok)]'
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

