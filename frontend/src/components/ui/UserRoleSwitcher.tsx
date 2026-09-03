import React, { useState, useRef, useEffect } from 'react';
import { useTenders } from '../../context/TenderContext';
import { UserRole } from '../../types/tender';
import { Shield, ChevronDown, Check } from 'lucide-react';

const ROLE_BADGES: Record<
  UserRole,
  { label: string; bg: string; text: string; border: string }
> = {
  BUSINESS_HEAD: {
    label: 'Business Head',
    bg: 'bg-[#F3E8FF]',
    text: 'text-[#7E22CE]',
    border: 'border-[#D8B4FE]',
  },
  EXECUTIVE_MANAGER: {
    label: 'Executive Manager',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    border: 'border-[#BFDBFE]',
  },
  SENIOR_MANAGER: {
    label: 'Senior Manager',
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
  },
  TENDER_ANALYST: {
    label: 'Tender Analyst',
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    border: 'border-[#BBF7D0]',
  },
};

export const UserRoleSwitcher: React.FC = () => {
  const { currentUser, setCurrentUser, teamMembers } = useTenders();
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

  const currentBadge = ROLE_BADGES[currentUser.role];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors shadow-xs"
        title="Switch user profile and role"
      >
        <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
          {currentUser.avatar}
        </div>

        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-semibold text-[#0F172A] leading-tight">
            {currentUser.name}
          </span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}
          >
            {currentBadge.label}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-[#E2E8F0] z-50 py-1 divide-y divide-[#F1F5F9] animate-fadeIn text-xs">
          <div className="p-3 bg-[#F8FAFC]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              <Shield className="w-3 h-3 text-[#2563EB]" />
              <span>Role-Based Access (RBAC)</span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Switch team profile to test role permissions and sign-off policies.
            </p>
          </div>

          <div className="p-1 space-y-0.5">
            {teamMembers.map((member) => {
              const isSelected = member.id === currentUser.id;
              const badge = ROLE_BADGES[member.role];
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    setCurrentUser(member);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                      : 'hover:bg-[#F8FAFC] text-[#0F172A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        isSelected ? 'bg-[#2563EB]' : 'bg-[#0F172A]'
                      }`}
                    >
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-xs leading-snug">
                        {member.name}
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
