import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTenders } from '../../context/TenderContext';
import { UserRole } from '../../types/tender';
import { ChevronDown, User, LogOut, Bell, Settings } from 'lucide-react';

/**
 * A role is an identity, not a status, so every badge is neutral. Colour in
 * this app means urgency or outcome; spending five hues on job titles was
 * what made a single header row carry four competing accents.
 */
const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super admin',
  BUSINESS_HEAD: 'Business head',
  EXECUTIVE_MANAGER: 'Executive manager',
  SENIOR_MANAGER: 'Senior manager',
  TENDER_ANALYST: 'Tender analyst',
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const roleLabel = ROLE_LABELS[currentUser.role] || ROLE_LABELS.SUPER_ADMIN;
  const initials = currentUser.avatar || currentUser.name?.slice(0, 2).toUpperCase() || 'U';

  const handleSignOut = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const avatar = (size: string, text: string) => (
    <div className={`tt-avatar ${size} ${text}`}>
      {currentUser.profilePic ? (
        <img src={currentUser.profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="tt-btn tt-focus gap-2"
        title="Account menu"
      >
        {avatar('w-6 h-6', 'text-[10px]')}
        <span className="hidden lg:flex flex-col text-left leading-tight">
          <span className="text-xs font-medium tt-text">{currentUser.name || 'User profile'}</span>
          <span className="text-[10px] tt-text-3">{roleLabel}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 tt-menu z-50 overflow-hidden" role="menu">
          <div className="tt-menu-head">
            <div className="flex items-center gap-2.5">
              {avatar('w-9 h-9', 'text-xs')}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium tt-text tt-truncate">
                  {currentUser.name || 'Authenticated user'}
                </p>
                <p className="text-[11px] tt-text-3 font-mono tt-truncate">
                  {currentUser.email || 'user@tendertracker.com'}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="tt-tag">{roleLabel}</span>
              {currentUser.department && (
                <span className="text-[11px] tt-text-3 tt-truncate">{currentUser.department}</span>
              )}
            </div>
          </div>

          <div className="py-1">
            <Link to="/settings" onClick={() => setIsOpen(false)} className="tt-menu-item" role="menuitem">
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </Link>
            <Link to="/notifications" onClick={() => setIsOpen(false)} className="tt-menu-item" role="menuitem">
              <Bell className="w-4 h-4 shrink-0" />
              <span>Alerts and notifications</span>
            </Link>
            <Link to="/team" onClick={() => setIsOpen(false)} className="tt-menu-item" role="menuitem">
              <User className="w-4 h-4 shrink-0" />
              <span>Team and capacity</span>
            </Link>
          </div>

          <div className="py-1 tt-menu-sep">
            <button
              type="button"
              onClick={handleSignOut}
              className="tt-menu-item tt-menu-item-danger"
              role="menuitem"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
