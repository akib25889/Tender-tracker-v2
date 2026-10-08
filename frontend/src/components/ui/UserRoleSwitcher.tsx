import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenders } from '../../context/TenderContext';
import { UserRole } from '../../types/tender';
import { Shield, ChevronDown, Check, User } from 'lucide-react';

const ROLE_BADGES: Record<
  UserRole,
  { label: string; bg: string; text: string; border: string }
> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    bg: 'bg-[var(--crit-soft)]',
    text: 'text-[var(--crit)]',
    border: 'border-[var(--crit-line)]',
  },
  BUSINESS_HEAD: {
    label: 'Business Head',
    bg: 'bg-[var(--bg-subtle)]',
    text: 'text-[var(--text-secondary)]',
    border: 'border-[var(--border-default)]',
  },
  EXECUTIVE_MANAGER: {
    label: 'Executive Manager',
    bg: 'bg-[var(--accent-soft)]',
    text: 'text-[var(--accent)]',
    border: 'border-[var(--accent-line)]',
  },
  SENIOR_MANAGER: {
    label: 'Senior Manager',
    bg: 'bg-[var(--warn-soft)]',
    text: 'text-[var(--warn)]',
    border: 'border-[var(--warn-line)]',
  },
  TENDER_ANALYST: {
    label: 'Tender Analyst',
    bg: 'bg-[var(--ok-soft)]',
    text: 'text-[var(--ok)]',
    border: 'border-[var(--ok-line)]',
  },
};

export const UserRoleSwitcher: React.FC = () => {
  const navigate = useNavigate();
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
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] transition-colors shadow-xs"
        title="Switch user profile and role"
      >
        <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-on)] flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
          {currentUser.profilePic ? (
            <img src={currentUser.profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            currentUser.avatar
          )}
        </div>

        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
            {currentUser.name}
          </span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}
          >
            {currentBadge.label}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--bg-surface)] shadow-xl border border-[var(--border-default)] z-50 py-1 divide-y divide-[var(--border-subtle)] animate-fadeIn text-xs">
          <div className="p-3 bg-[var(--bg-subtle)]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              <Shield className="w-3 h-3 text-[var(--accent)]" />
              <span>Active Team Identity</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Switch team profile for authorship &amp; assignment. All members enjoy full permissions.
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
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[var(--accent-on)] shrink-0 overflow-hidden ${
 isSelected ? 'bg-[var(--accent)]' : 'bg-[var(--accent)]'
                      }`}
                    >
                      {member.profilePic ? (
                        <img src={member.profilePic} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.avatar
                      )}
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

                  {isSelected && <Check className="w-4 h-4 text-[var(--accent)]" />}
                </button>
              );
            })}
          </div>

          <div className="p-2 bg-[var(--bg-subtle)]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(`/profile/${currentUser.id}`);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--accent)] hover:text-[var(--accent-on)] hover:border-[var(--accent)] rounded-lg text-xs font-semibold text-[var(--text-primary)] transition-all shadow-xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>View Profile &amp; Dossier</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
