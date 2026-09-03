import React from 'react';
import { Search, Plus, Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserRoleSwitcher } from '../ui/UserRoleSwitcher';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar?: () => void;
  onNewTenderClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  onToggleSidebar,
  onNewTenderClick,
}) => {
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
            title={sidebarCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#2563EB]" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
          <input
            type="text"
            placeholder="Search RFP, Tender ID, Authority, or Task... (Ctrl + K)"
            className="w-full pl-9 pr-14 py-1.5 bg-[#F1F5F9] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] border-none focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[#94A3B8] font-mono text-[10px] bg-[#E2E8F0] px-1.5 py-0.5 rounded">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <Link
          to="/registry"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm"
        >
          <span>Registry</span>
        </Link>

        {onNewTenderClick && (
          <button
            onClick={onNewTenderClick}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Opportunity</span>
          </button>
        )}

        {/* System Alert Bell */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
          title="Audit alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB] ring-2 ring-white" />
        </Link>

        {/* User Identity & RBAC Switcher */}
        <div className="pl-2 border-l border-[#E2E8F0]">
          <UserRoleSwitcher />
        </div>
      </div>
    </header>
  );
};
