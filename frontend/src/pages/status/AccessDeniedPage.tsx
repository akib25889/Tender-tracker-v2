import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock, UserCheck, KeyRound } from 'lucide-react';
import { useTenders } from '../../context/TenderContext';

interface AccessDeniedPageProps {
  requiredRole?: string;
  resourceName?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  requiredRole = 'Executive / Super Admin Clearance',
  resourceName,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useTenders();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-[#FED7AA] dark:border-amber-900/50 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden text-center">
        {/* Security Warning Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Security Shield Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 flex items-center justify-center mb-6 shadow-inner ring-8 ring-amber-50 dark:ring-amber-900/20">
          <ShieldAlert className="w-10 h-10" />
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-[#DC2626] text-white font-mono text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
            403
          </span>
        </div>

        {/* Header Text */}
        <span className="text-xs font-mono font-bold tracking-widest text-[#D97706] dark:text-amber-400 uppercase bg-[#FFFBEB] dark:bg-amber-950/60 px-3 py-1 rounded-full border border-[#FDE68A] dark:border-amber-800">
          Status 403 • Access Boundary Enforced
        </span>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0F172A] dark:text-white mt-4 tracking-tight">
          Access Restricted / Permission Ceiled
        </h1>

        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-3 max-w-lg mx-auto leading-relaxed">
          Your current account does not possess the requisite clearance to access{' '}
          {resourceName ? (
            <strong className="text-[#0F172A] dark:text-slate-200">{resourceName}</strong>
          ) : (
            'this confidential module'
          )}
          . Operational security and data residency policies prevent unauthorized traversal.
        </p>

        {/* Current Identity & Required Clearance Matrix */}
        <div className="mt-6 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 text-left max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              Active Operator:
            </span>
            <span className="font-semibold text-[#0F172A] dark:text-slate-200">
              {currentUser?.name || 'Authenticated User'} ({currentUser?.role?.replace(/_/g, ' ') || 'USER'})
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E8F0] dark:border-slate-700">
            <span className="text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#DC2626]" />
              Clearance Required:
            </span>
            <span className="font-semibold text-[#DC2626] font-mono text-[11px]">
              {requiredRole}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-[#0F172A] dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-700 transition-colors shadow-2xs flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Previous Screen</span>
          </button>

          <Link
            to="/dashboard"
            className="px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Mission Control</span>
          </Link>

          <Link
            to="/login"
            className="px-4 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Switch Profile / Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

