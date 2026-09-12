import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTenders } from '../../context/TenderContext';
import { UserRole } from '../../types/tender';
import { ChevronDown, User, LogOut, Bell, Settings } from 'lucide-react';

const ROLE_BADGES: Record<
  UserRole,
  { label: string; bg: string; text: string; border: string }
> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    bg: 'bg-[#FEF2F2] dark:bg-red-950/40',
    text: 'text-[#DC2626] dark:text-red-400',
    border: 'border-[#FECACA] dark:border-red-900',
  },
  BUSINESS_HEAD: {
    label: 'Business Head',
    bg: 'bg-[#F3E8FF] dark:bg-purple-950/40',
    text: 'text-[#7E22CE] dark:text-purple-400',
    border: 'border-[#D8B4FE] dark:border-purple-900',
  },
  EXECUTIVE_MANAGER: {
    label: 'Executive Manager',
    bg: 'bg-[#EFF6FF] dark:bg-blue-950/40',
    text: 'text-[#1D4ED8] dark:text-blue-400',
    border: 'border-[#BFDBFE] dark:border-blue-900',
  },
  SENIOR_MANAGER: {
    label: 'Senior Manager',
    bg: 'bg-[#FFFBEB] dark:bg-amber-950/40',
    text: 'text-[#B45309] dark:text-amber-400',
    border: 'border-[#FDE68A] dark:border-amber-900',
  },
  TENDER_ANALYST: {
    label: 'Tender Analyst',
    bg: 'bg-[#F0FDF4] dark:bg-emerald-950/40',
    text: 'text-[#15803D] dark:text-emerald-400',
    border: 'border-[#BBF7D0] dark:border-emerald-900',
  },
};

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useTenders();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const badge = ROLE_BADGES[currentUser.role] || ROLE_BADGES.SUPER_ADMIN;

  const handleSignOut = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        title="Account & User Menu"
      >
        <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden ring-1 ring-[#CBD5E1] dark:ring-slate-600">
          {currentUser.profilePic ? (
            <img src={currentUser.profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            currentUser.avatar || currentUser.name?.slice(0, 2).toUpperCase() || 'U'
          )}
        </div>

        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-semibold text-[#0F172A] dark:text-slate-100 leading-tight">
            {currentUser.name || 'User Profile'}
          </span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.label}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-[#E2E8F0] dark:border-slate-700 z-50 py-1 divide-y divide-[#F1F5F9] dark:divide-slate-800 animate-fadeIn text-xs">
          {/* User Profile Header */}
          <div className="p-3 bg-[#F8FAFC] dark:bg-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.profilePic ? (
                  <img src={currentUser.profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.avatar || currentUser.name?.slice(0, 2).toUpperCase() || 'U'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-[#0F172A] dark:text-white truncate">
                  {currentUser.name || 'Authenticated User'}
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono truncate">
                  {currentUser.email || 'user@tendertracker.com'}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </span>
              {currentUser.department && (
                <span className="text-[10px] text-[#64748B] dark:text-slate-400 truncate">
                  {currentUser.department}
                </span>
              )}
            </div>
          </div>

          {/* Menu Navigation Links */}
          <div className="py-1">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#334155] dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-[#64748B]" />
              <span>Account &amp; System Settings</span>
            </Link>

            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#334155] dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4 text-[#64748B]" />
              <span>Audit Alerts &amp; Notifications</span>
            </Link>

            <Link
              to="/team"
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#334155] dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
            >
              <User className="w-4 h-4 text-[#64748B]" />
              <span>Team Roster &amp; Capacity</span>
            </Link>
          </div>

          {/* Sign Out Action */}
          <div className="py-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#DC2626] dark:text-red-400 hover:bg-[#FEF2F2] dark:hover:bg-red-950/30 transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Command Center</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

