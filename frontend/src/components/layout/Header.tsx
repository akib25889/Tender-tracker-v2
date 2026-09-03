import React from 'react';
import { Search, Plus, Bell, User } from 'lucide-react';
import { useTenders } from '../../context/TenderContext';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onNewTenderClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  onNewTenderClick,
}) => {
  const { currency, setCurrency } = useTenders();

  return (
    <header
      className={`fixed top-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] z-40 flex items-center justify-between px-6 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Search & Enterprise Badge */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
          <input
            type="text"
            placeholder="Search RFP, Tender ID, Organization, or Team member... (Ctrl + K)"
            className="w-full pl-9 pr-14 py-1.5 bg-[#F1F5F9] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] border-none focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[#94A3B8] font-mono text-[10px] bg-[#E2E8F0] px-1.5 py-0.5 rounded">
            <span>⌘K</span>
          </div>
        </div>
        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-bold tracking-wider uppercase border border-[#BFDBFE]">
          Enterprise Core
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Currency Switcher (USD / BDT) */}
        <div className="flex items-center p-0.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs">
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold transition-colors ${
              currency === 'USD'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
            title="Switch valuation display to US Dollar ($)"
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency('BDT')}
            className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold transition-colors ${
              currency === 'BDT'
                ? 'bg-white text-[#16A34A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
            title="Switch valuation display to Bangladeshi Taka (৳)"
          >
            BDT (৳)
          </button>
        </div>

        <button
          onClick={onNewTenderClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Tender</span>
        </button>

        <div className="h-5 w-px bg-[#E2E8F0] mx-1"></div>

        {/* Notifications Icon with Pulse */}
        <button
          className="relative p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
          title="8 pending alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]"></span>
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#E2E8F0]">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#0F172A] leading-tight">
              Sarah Jenkins
            </span>
            <span className="text-[10px] text-[#64748B] leading-tight">
              Bid Ops Director
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
