import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  ClipboardList,
  CheckCircle2,
  FolderGit2,
  CalendarDays,
  FileCheck,
  Users,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Archive,
  MessageSquare,
  KeyRound,
} from 'lucide-react';
import { useTenders } from '../../context/TenderContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { tenders } = useTenders();
  const newDiscoveredCount = tenders.filter((t) => t.stage === 'DISCOVERED').length;
  const archivedCount = tenders.filter((t) => t.stage === 'ARCHIVED').length;

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      label: 'Bid Discovery',
      path: '/tenders?stage=DISCOVERED',
      icon: Compass,
      badge: newDiscoveredCount > 0 ? `${newDiscoveredCount} New` : undefined,
    },
    {
      label: 'Tender Registry',
      path: '/registry',
      icon: ClipboardList,
      badge: undefined,
    },
    {
      label: 'Pipeline Overview',
      path: '/tenders',
      icon: FolderGit2,
      badge: undefined,
    },
    {
      label: 'My Tasks',
      path: '/tasks/my-tasks',
      icon: CheckCircle2,
      badge: '18',
    },
    {
      label: 'Calendar',
      path: '/calendar',
      icon: CalendarDays,
      urgentBadge: '3 Due',
    },
    {
      label: 'Document Vault',
      path: '/documents',
      icon: FileCheck,
      badge: undefined,
    },
    {
      label: 'Team & Workload',
      path: '/team',
      icon: Users,
      badge: undefined,
    },
    {
      label: 'Chat & Comments',
      path: '/discussions',
      icon: MessageSquare,
      badge: undefined,
    },
    {
      label: 'Reports & Status',
      path: '/reports',
      icon: BarChart3,
      badge: undefined,
    },
    {
      label: 'Archived Records',
      path: '/archive',
      icon: Archive,
      badge: archivedCount > 0 ? `${archivedCount}` : undefined,
    },
  ];

  const systemItems = [
    {
      label: 'Access & Permissions',
      path: '/permissions',
      icon: KeyRound,
      badge: 'Master',
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: '8',
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      badge: undefined,
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[#0F172A] border-r border-[#1E293B] z-50 flex flex-col justify-between select-none transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Branding with Minimizer Button */}
      <div className="flex flex-col">
        <div className="h-14 px-3 flex items-center justify-between border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shrink-0 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-display font-bold text-sm text-white tracking-tight leading-none truncate">
                  TenderTracker
                </span>
                <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mt-1 truncate">
                  Command Center
                </span>
              </div>
            )}
          </div>

          {/* Minimizer Button */}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Command Navigation */}
        <div className="px-3 py-4">
          {!collapsed && (
            <div className="px-2 pb-2 text-[10px] font-semibold tracking-wider uppercase text-[#64748B]">
              Command Navigation
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isMatch = item.path.includes('?')
                ? location.pathname + location.search === item.path
                : location.pathname === item.path && !location.search;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                    isMatch
                      ? 'bg-[#1E293B] text-white font-semibold'
                      : 'text-[#94A3B8] hover:bg-[#1E293B]/70 hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className="w-4 h-4 shrink-0 text-[#94A3B8] group-hover:text-white transition-colors" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && (
                    <>
                      {item.urgentBadge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#B91C1C] font-mono text-[10px] font-bold">
                          {item.urgentBadge}
                        </span>
                      )}
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#1E293B] text-[#F8FAFC] font-mono text-[11px] font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Area: Operational Readiness & System */}
      <div className="p-3 border-t border-[#1E293B]">
        {!collapsed && (
          <div className="p-3 rounded-lg bg-[#1E293B] mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-[#94A3B8]">
                Operational Readiness
              </span>
              <span className="font-mono text-xs font-bold text-white">84%</span>
            </div>
            <div className="w-full bg-[#0F172A] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#2563EB] h-full rounded-full w-[84%]"></div>
            </div>
          </div>
        )}

        <nav className="space-y-1 mb-2">
          {systemItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                    isActive
                      ? 'bg-[#1E293B] text-white font-semibold'
                      : 'text-[#94A3B8] hover:bg-[#1E293B]/70 hover:text-white'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className="w-4 h-4 shrink-0 text-[#94A3B8] group-hover:text-white" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#2563EB] text-white font-mono text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Minimizer Bar at Bottom */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 px-3 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <ChevronLeft className="w-4 h-4" />
              <span>Minimize Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
