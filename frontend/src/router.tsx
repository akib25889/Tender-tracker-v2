import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TenderListPage } from './pages/TenderListPage';
import { TenderDetailPage } from './pages/TenderDetailPage';
import { TenderAnalysisTab } from './pages/tender-tabs/TenderAnalysisTab';
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

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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
        path: 'tenders',
        element: <TenderListPage />,
      },
      {
        path: 'tenders/:id',
        element: <TenderDetailPage />,
        children: [
          {
            path: 'analysis',
            element: <TenderAnalysisTab />,
          },
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
        path: 'team',
        element: <TeamAllocationPage />,
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
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

