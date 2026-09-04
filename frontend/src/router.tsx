import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TenderListPage } from './pages/TenderListPage';
import { TenderRegistryPage } from './pages/TenderRegistryPage';
import { TenderSummaryPage } from './pages/TenderSummaryPage';
import { ArchivedTendersPage } from './pages/ArchivedTendersPage';
import { TenderDetailPage } from './pages/TenderDetailPage';
import { TenderRequirementsTab } from './pages/tender-tabs/TenderRequirementsTab';
import { TenderTasksTab } from './pages/tender-tabs/TenderTasksTab';
import { TenderDocumentsTab } from './pages/tender-tabs/TenderDocumentsTab';
import { TenderReviewTab } from './pages/tender-tabs/TenderReviewTab';
import { TenderSubmissionTab } from './pages/tender-tabs/TenderSubmissionTab';
import { TenderResultTab } from './pages/tender-tabs/TenderResultTab';
import { MyTasksPage } from './pages/MyTasksPage';
import { TeamAllocationPage } from './pages/TeamAllocationPage';
import { CalendarPage } from './pages/CalendarPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { MasterDocumentVaultPage } from './pages/MasterDocumentVaultPage';
import { ChatDiscussionsPage } from './pages/ChatDiscussionsPage';
import { MasterPermissionsPage } from './pages/MasterPermissionsPage';
import { TenderPartnersTab } from './pages/tender-tabs/TenderPartnersTab';
import { SharedDocumentPortalPage } from './pages/SharedDocumentPortalPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/shared/:token',
    element: <SharedDocumentPortalPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'registry',
        element: <TenderRegistryPage />,
      },
      {
        path: 'registry/summary/:id',
        element: <TenderSummaryPage />,
      },
      {
        path: 'archive',
        element: <ArchivedTendersPage />,
      },
      {
        path: 'tenders',
        element: <TenderListPage />,
      },
      {
        path: 'tenders/:id',
        element: <TenderDetailPage />,
        children: [
          {
            path: 'requirements',
            element: <TenderRequirementsTab />,
          },
          {
            path: 'tasks',
            element: <TenderTasksTab />,
          },
          {
            path: 'documents',
            element: <TenderDocumentsTab />,
          },
          {
            path: 'partners',
            element: <TenderPartnersTab />,
          },
          {
            path: 'review',
            element: <TenderReviewTab />,
          },
          {
            path: 'submission',
            element: <TenderSubmissionTab />,
          },
          {
            path: 'result',
            element: <TenderResultTab />,
          },
        ],
      },
      {
        path: 'tasks/my-tasks',
        element: <MyTasksPage />,
      },
      {
        path: 'documents',
        element: <MasterDocumentVaultPage />,
      },
      {
        path: 'team',
        element: <TeamAllocationPage />,
      },
      {
        path: 'discussions',
        element: <ChatDiscussionsPage />,
      },
      {
        path: 'calendar',
        element: <CalendarPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'permissions',
        element: <MasterPermissionsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

