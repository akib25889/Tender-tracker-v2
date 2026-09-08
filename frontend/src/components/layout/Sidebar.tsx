import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Archive,
  MessageSquare,
  KeyRound,
  Building2,
  Landmark,
  Wrench,
  Award,
  UserCheck,
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

  const isToolsRoute =
    location.pathname.startsWith('/tools') ||
    location.pathname.startsWith('/permissions') ||
    location.pathname.startsWith('/profile');
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(() => isToolsRoute);

  useEffect(() => {
    if (isToolsRoute) {
      setIsToolsOpen(true);
    }
  }, [isToolsRoute]);

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
      label: 'Client Visitors',
      path: '/clients/visits',
      icon: UserCheck,
      badge: undefined,
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
      label: 'Report & Analytics',
      path: '/reports',
      icon: BarChart3,
      badge: undefined,
    },
  ];

  const toolsItems = [
    {
      label: 'Company Profiles',
      path: '/tools/company-profiles',
      icon: Building2,
      badge: undefined,
    },
    {
      label: 'Organizations',
      path: '/tools/organizations',
      icon: Landmark,
      badge: undefined,
    },
    {
      label: 'Client Visitors',
      path: '/clients/visits',
      icon: UserCheck,
      badge: undefined,
    },
    {
      label: 'Access & Permissions',
      path: '/tools/permissions',
      icon: KeyRound,
      badge: undefined,
    },
    {
      label: 'Company Credentials',
      path: '/documents?tab=credentials',
      icon: Award,
      badge: undefined,
    },
    {
      label: 'Personnel Dossiers',
      path: '/profile',
      icon: UserCheck,
      badge: undefined,
    },
    {
      label: 'Archive',
      path: '/tools/archive',
      icon: Archive,
      badge: archivedCount > 0 ? `${archivedCount}` : undefined,
    },
  ];

  const systemItems = [
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
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <div className={`h-14 ${collapsed ? 'flex items-center justify-center px-0' : 'px-3 flex items-center justify-between'} border-b border-[#1E293B] shrink-0`}>
          {collapsed ? (
            <button
              onClick={onToggle}
              className="relative w-9 h-9 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center text-white shadow-sm transition-all group cursor-pointer"
              title="Expand sidebar"
            >
              <ShieldCheck className="w-4 h-4 group-hover:hidden transition-transform" />
              <ChevronRight className="w-4 h-4 hidden group-hover:block transition-transform" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-display font-bold text-sm text-white tracking-tight leading-none truncate">
                    TenderTracker
                  </span>
                  <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mt-1 truncate">
                    Command Center
                  </span>
                </div>
              </div>

              {/* Minimizer Button */}
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors shrink-0 cursor-pointer"
                title="Minimize sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
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
                  className={`flex items-center ${
                    collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2'
                  } rounded-lg text-sm font-medium transition-colors group relative ${
                    isMatch
                      ? 'bg-[#1E293B] text-white font-semibold'
                      : 'text-[#94A3B8] hover:bg-[#1E293B]/70 hover:text-white'
                  }`}
                  title={
                    collapsed
                      ? item.badge || item.urgentBadge
                        ? `${item.label} (${item.urgentBadge || item.badge})`
                        : item.label
                      : undefined
                  }
                >
                  <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} truncate`}>
                    <Icon className="w-4 h-4 shrink-0 text-[#94A3B8] group-hover:text-white transition-colors" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {collapsed ? (
                    (item.urgentBadge || item.badge) && (
                      <span
                        className={`absolute top-1.5 right-2 w-2 h-2 rounded-full ${
                          item.urgentBadge ? 'bg-[#EF4444] animate-pulse' : 'bg-[#3B82F6]'
                        }`}
                      />
                    )
                  ) : (
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

        {/* Tools & Addons Dropdown Module */}
        <div className="px-3 pb-3">
          {collapsed ? (
            <div className="relative group/mini">
              <button
                type="button"
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`w-full flex items-center justify-center py-2.5 px-0 rounded-lg text-sm transition-colors cursor-pointer ${
                  isToolsRoute
                    ? 'bg-[#1E293B] text-white'
                    : 'text-[#94A3B8] hover:bg-[#1E293B]/70 hover:text-white'
                }`}
                title="Tools & Addons"
              >
                <Wrench className={`w-4 h-4 ${isToolsRoute ? 'text-[#38BDF8]' : 'text-[#94A3B8]'}`} />
              </button>

              {/* Popover on hover in collapsed mode */}
              <div className="absolute left-full top-0 ml-2 hidden group-hover/mini:block z-50 bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-xl p-2 w-48 animate-scaleIn">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] px-2 py-1 flex items-center gap-1.5 border-b border-[#1E293B] mb-1">
                  <Wrench className="w-3 h-3 text-[#38BDF8]" />
                  <span>Tools & Addons</span>
                </div>
                {toolsItems.map((item) => {
                  const Icon = item.icon;
                  const isMatch = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isMatch
                          ? 'bg-[#2563EB] text-white font-semibold'
                          : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isToolsRoute
                    ? 'bg-[#1E293B] text-white font-semibold'
                    : 'text-[#94A3B8] hover:bg-[#1E293B]/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Wrench
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isToolsRoute ? 'text-[#38BDF8]' : 'text-[#94A3B8] group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">Tools &amp; Addons</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-[#64748B] group-hover:text-white transition-transform duration-200 ${
                    isToolsOpen ? 'transform rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {isToolsOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-[#334155] space-y-1 animate-fadeIn">
                  {toolsItems.map((item) => {
                    const Icon = item.icon;
                    const isMatch = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors group ${
                          isMatch
                            ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                            : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                              isMatch ? 'text-white' : 'text-[#94A3B8] group-hover:text-white'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#1E293B] text-[#F8FAFC] font-mono text-[10px] font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Area: System Nav */}
      <div className="p-3 border-t border-[#1E293B]">

        <nav className="space-y-1 mb-2">
          {systemItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${
                    collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2'
                  } rounded-lg text-sm font-medium transition-colors group relative ${
                    isActive
                      ? 'bg-[#1E293B] text-white font-semibold'
                      : 'text-[#94A3B8] hover:bg-[#1E293B]/70 hover:text-white'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} truncate`}>
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
          className={`w-full flex items-center justify-center ${
            collapsed ? 'py-2.5 px-0' : 'py-2 px-3'
          } rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer`}
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
