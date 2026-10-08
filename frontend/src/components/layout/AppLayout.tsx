import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { UploadDocumentModal } from '../modals/UploadDocumentModal';
import { ShareDocumentModal } from '../modals/ShareDocumentModal';
import { CommandPaletteModal } from '../modals/CommandPaletteModal';
import { useTheme } from '../../hooks/useTheme';

/** Below this width a 256px rail leaves too little room for the content. */
const RAIL_COLLAPSE_BREAKPOINT = 1024;

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < RAIL_COLLAPSE_BREAKPOINT
  );
  const userSetRef = useRef(false);
  const { theme } = useTheme();

  // Collapse the rail automatically on narrow screens, but stop doing so once
  // the person has made the choice themselves in this session.
  useEffect(() => {
    const onResize = () => {
      if (userSetRef.current) return;
      setSidebarCollapsed(window.innerWidth < RAIL_COLLAPSE_BREAKPOINT);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleSidebar = () => {
    userSetRef.current = true;
    setSidebarCollapsed((v) => !v);
  };

  return (
    <div className={`min-h-screen tt-canvas ${theme}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />

        <main className="pt-14 min-h-screen">
          <div className="p-4 sm:p-6 max-w-[1780px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <UploadDocumentModal />
      <ShareDocumentModal />
      <CommandPaletteModal />
    </div>
  );
};
