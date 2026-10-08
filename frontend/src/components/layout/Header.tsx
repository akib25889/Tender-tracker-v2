import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useEffect, useState } from 'react';
import { Search, Plus, Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { useTenders } from '../../context/TenderContext';
import { HeaderClock } from './HeaderClock';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { setIsCommandPaletteOpen } = useTenders();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      fetch(`${API_BASE_URL}/alerts`)
        .then((r) => r.json())
        .then((data) => setUnreadCount(data.unread ?? 0))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 h-14 tt-topbar z-40 flex items-center gap-3 px-3 sm:px-5 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* min-w-0 lets this column shrink below its content width, which is what
          kept the page scrolling sideways by a few pixels on narrow screens. */}
      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-2xl">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="tt-icon-btn"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
          className="tt-searchbar tt-focus"
          title="Search (⌘K)"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="tt-truncate flex-1">Search tenders, IDs, authorities</span>
          <span className="tt-kbd hidden sm:inline">⌘K</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <HeaderClock />

        <Link to="/registry" className="tt-btn tt-btn-primary">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New tender</span>
        </Link>

        <Link to="/notifications" className="tt-icon-btn" title="Alerts" aria-label="Alerts">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="tt-badge-dot">{unreadCount <= 9 ? unreadCount : '9+'}</span>
          )}
        </Link>

        <div className="pl-1.5 sm:pl-2" style={{ borderLeft: '1px solid var(--border-default)' }}>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
