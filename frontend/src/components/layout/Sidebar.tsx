import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  ClipboardList,
  CheckCircle2,
  FolderGit2,
  CalendarDays,
  FileCheck,
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
  Users,
  Tags,
} from 'lucide-react';
import { useTenders } from '../../context/TenderContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

type NavEntry = {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  urgent?: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { tenders } = useTenders();

  const newDiscoveredCount = tenders.filter((t) => t.stage === 'DISCOVERED').length;
  const archivedCount = tenders.filter((t) => t.stage === 'ARCHIVED').length;
  const pendingTasksCount = tenders.reduce(
    (acc, t) => acc + (t.tasks ? t.tasks.filter((tk) => tk.status !== 'DONE').length : 0),
    0
  );
  const upcomingDeadlinesCount = tenders.filter(
    (t) =>
      t.daysRemaining >= 0 &&
      t.daysRemaining <= 7 &&
      t.stage !== 'SUBMITTED' &&
      t.stage !== 'ARCHIVED'
  ).length;

  const isToolsRoute =
    location.pathname.startsWith('/tools') ||
    location.pathname.startsWith('/permissions') ||
    location.pathname.startsWith('/profile') ||
    location.pathname === '/team';
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(() => isToolsRoute);

  useEffect(() => {
    if (isToolsRoute) setIsToolsOpen(true);
  }, [isToolsRoute]);

  const navItems: NavEntry[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Bid discovery', path: '/tenders?stage=DISCOVERED', icon: Compass, count: newDiscoveredCount },
    { label: 'Tender registry', path: '/registry', icon: ClipboardList },
    { label: 'Pipeline', path: '/tenders', icon: FolderGit2 },
    { label: 'My tasks', path: '/tasks/my-tasks', icon: CheckCircle2, count: pendingTasksCount },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays, count: upcomingDeadlinesCount, urgent: true },
    { label: 'Client visitors', path: '/clients/visits', icon: UserCheck },
    { label: 'Document vault', path: '/documents', icon: FileCheck },
    { label: 'Discussions', path: '/discussions', icon: MessageSquare },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const toolsItems: NavEntry[] = [
    { label: 'Company profiles', path: '/tools/company-profiles', icon: Building2 },
    { label: 'Organizations', path: '/tools/organizations', icon: Landmark },
    { label: 'SOW categories', path: '/tools/categories', icon: Tags },
    { label: 'Access & permissions', path: '/tools/permissions', icon: KeyRound },
    { label: 'Team & capacity', path: '/team', icon: Users },
    { label: 'Company credentials', path: '/documents?tab=credentials', icon: Award },
    { label: 'Personnel dossiers', path: '/profile', icon: UserCheck },
    { label: 'Archive', path: '/tools/archive', icon: Archive, count: archivedCount },
  ];

  const matches = (path: string) =>
    path.includes('?')
      ? location.pathname + location.search === path
      : location.pathname === path && !location.search;

  const countPill = (item: NavEntry) =>
    item.count ? (
      <span className={`tt-nav-count ${item.urgent ? 'tt-nav-count-crit' : ''}`}>{item.count}</span>
    ) : null;

  return (
    <aside
      className={`fixed left-0 top-0 h-full tt-rail z-50 flex flex-col justify-between select-none transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        {/* Brand */}
        <div
          className={`h-14 shrink-0 tt-rail-head flex items-center ${
            collapsed ? 'justify-center px-0' : 'px-3 justify-between'
          }`}
        >
          {collapsed ? (
            <button
              onClick={onToggle}
              className="tt-brand-mark w-9 h-9 flex items-center justify-center group tt-focus cursor-pointer"
              title="Expand sidebar"
            >
              <ShieldCheck className="w-4 h-4 group-hover:hidden" />
              <ChevronRight className="w-4 h-4 hidden group-hover:block" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="tt-brand-mark w-8 h-8 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-display font-semibold text-sm tt-text tracking-tight leading-none tt-truncate">
                    TenderTracker
                  </span>
                  <span className="tt-rail-label mt-1 tt-truncate">NYK Advance</span>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="tt-icon-btn shrink-0"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Primary navigation */}
        <div className="px-3 py-4">
          {!collapsed && <div className="tt-rail-label px-2 pb-2">Navigation</div>}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = matches(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`tt-nav-item tt-focus relative ${active ? 'is-active' : ''} ${
                    collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2 gap-2'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={`flex items-center min-w-0 ${collapsed ? '' : 'gap-3'}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="tt-truncate">{item.label}</span>}
                  </span>
                  {collapsed
                    ? Boolean(item.count) && (
                        <i
                          className={`tt-dot ${item.urgent ? 'tt-dot-crit' : 'tt-dot-accent'} absolute top-1.5 right-2`}
                          aria-hidden="true"
                        />
                      )
                    : countPill(item)}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Tools */}
        <div className="px-3 pb-3">
          {collapsed ? (
            <div className="relative group/mini">
              <button
                type="button"
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`tt-nav-item tt-focus w-full justify-center py-2.5 px-0 ${
                  isToolsRoute ? 'is-active' : ''
                }`}
                title="Tools & add-ons"
              >
                <Wrench className="w-4 h-4" />
              </button>

              <div className="absolute left-full top-0 ml-2 hidden group-hover/mini:block z-50 tt-menu p-2 w-52">
                <div className="tt-rail-label px-2 py-1 mb-1 flex items-center gap-1.5 tt-menu-sep pb-2">
                  <Wrench className="w-3 h-3" />
                  <span>Tools &amp; add-ons</span>
                </div>
                {toolsItems.map((item) => {
                  const Icon = item.icon;
                  const active = matches(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      aria-current={active ? 'page' : undefined}
                      className={`tt-nav-sub flex items-center gap-2.5 px-2.5 py-1.5 ${active ? 'is-active' : ''}`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="tt-truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                aria-expanded={isToolsOpen}
                className={`tt-nav-item tt-focus w-full justify-between px-3 py-2 gap-2 ${
                  isToolsRoute ? 'is-active' : ''
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Wrench className="w-4 h-4 shrink-0" />
                  <span className="tt-truncate">Tools &amp; add-ons</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isToolsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isToolsOpen && (
                <div
                  className="mt-1 ml-4 pl-3 space-y-0.5"
                  style={{ borderLeft: '1px solid var(--border-default)' }}
                >
                  {toolsItems.map((item) => {
                    const Icon = item.icon;
                    const active = matches(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        aria-current={active ? 'page' : undefined}
                        className={`tt-nav-sub flex items-center justify-between gap-2 px-2.5 py-1.5 ${
                          active ? 'is-active' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="tt-truncate">{item.label}</span>
                        </span>
                        {countPill(item)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 tt-rail-foot">
        <nav className="space-y-0.5 mb-2">
          {(() => {
            const active = matches('/settings');
            return (
              <Link
                to="/settings"
                aria-current={active ? 'page' : undefined}
                className={`tt-nav-item tt-focus ${active ? 'is-active' : ''} ${
                  collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2 gap-3'
                }`}
                title={collapsed ? 'Settings' : undefined}
              >
                <Settings className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="tt-truncate">Settings</span>}
              </Link>
            );
          })()}
        </nav>

        <button
          onClick={onToggle}
          className={`tt-nav-item tt-focus w-full justify-center ${
            collapsed ? 'py-2.5 px-0' : 'py-2 px-3 gap-2'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
