import React, { useEffect, useState } from 'react';
import { Search, Plus, Bell, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserRoleSwitcher } from '../ui/UserRoleSwitcher';
import { useTenders } from '../../context/TenderContext';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  const { setIsCommandPaletteOpen } = useTenders();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      fetch('http://127.0.0.1:8000/api/alerts')
        .then((r) => r.json())
        .then((data) => setUnreadCount(data.unread ?? 0))
        .catch(() => {});
    };
    fetchUnread();
    // Refresh badge every 60 seconds
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] z-40 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Sidebar Minimizer & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors shrink-0"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="relative w-full max-w-lg text-left group cursor-pointer"
        >
          <div className="flex items-center w-full pl-9 pr-14 py-1.5 bg-[#F1F5F9] group-hover:bg-[#E2E8F0]/80 rounded-lg text-xs text-[#94A3B8] border border-transparent group-hover:border-[#CBD5E1] transition-all">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] group-hover:text-[#2563EB] w-4 h-4 transition-colors" />
            <span className="truncate">Search RFP, Tender ID, Authority, or Task...</span>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[#64748B] font-mono text-[10px] bg-white border border-[#CBD5E1] px-1.5 py-0.5 rounded shadow-2xs">
            <span>⌘K</span>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <Link
          to="/registry"
          className="flex items-center gap-1 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Opportunity</span>
        </Link>

        {/* Quick Theme Toggle (Light / Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Workspace' : 'Switch to Dark Command Center'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
          ) : (
            <Moon className="w-4 h-4 text-[#64748B] hover:text-[#2563EB] transition-colors" />
          )}
        </button>

        {/* System Alert Bell — live unread badge */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
          title="Audit alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            unreadCount <= 9 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                9+
              </span>
            )
          )}
        </Link>

        {/* User Identity & RBAC Switcher */}
        <div className="pl-2 border-l border-[#E2E8F0]">
          <UserRoleSwitcher />
        </div>
      </div>
    </header>
  );
};
