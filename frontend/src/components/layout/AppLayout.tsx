import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { UploadDocumentModal } from '../modals/UploadDocumentModal';
import { CommandPaletteModal } from '../modals/CommandPaletteModal';
import { useTheme } from '../../hooks/useTheme';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen bg-[#F8FAFC] ${theme}`}>
      {/* Pinned Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Pinned Top Header */}
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Viewport Content */}
        <main className="pt-14 min-h-screen">
          <div className="p-6 max-w-[1780px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <UploadDocumentModal />
      <CommandPaletteModal />
    </div>
  );
};
