import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useTenders } from '../../context/TenderContext';
import { NewTenderModal } from '../modals/NewTenderModal';
import { UploadDocumentModal } from '../modals/UploadDocumentModal';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { setIsNewTenderModalOpen } = useTenders();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
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
          onNewTenderClick={() => setIsNewTenderModalOpen(true)}
        />

        {/* Viewport Content */}
        <main className="pt-14 min-h-screen">
          <div className="p-6 max-w-[1780px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <NewTenderModal />
      <UploadDocumentModal />
    </div>
  );
};
