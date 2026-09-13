import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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
import { OrganizationsPage } from './pages/OrganizationsPage';
import { PartnerPortalPage } from './pages/PartnerPortalPage';
import { CompanyProfilesPage } from './pages/CompanyProfilesPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { ClientVisitsPage } from './pages/ClientVisitsPage';
import { NotFoundPage } from './pages/status/NotFoundPage';
import { AccessDeniedPage } from './pages/status/AccessDeniedPage';
import { RootErrorBoundary } from './components/common/RootErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/jv',
    element: <LoginPage initialMode="PARTNER" />,
  },
  {
    path: '/login/jv',
    element: <LoginPage initialMode="PARTNER" />,
  },
  {
    path: '/shared/:token',
    element: <SharedDocumentPortalPage />,
  },
  {
    path: '/partner/portal',
    element: <PartnerPortalPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RootErrorBoundary />,
    children: [
      {
        path: '/dashboard',
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
        element: <Navigate to="/tools/archive" replace />,
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
            element: <Navigate to="../submission" replace />,
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
        path: 'profile',
        element: <UserProfilePage />,
      },
      {
        path: 'profile/:userId',
        element: <UserProfilePage />,
      },
      {
        path: 'tools/profile',
        element: <Navigate to="/profile" replace />,
      },
      {
        path: 'tools/permissions',
        element: <MasterPermissionsPage />,
      },
      {
        path: 'permissions',
        element: <Navigate to="/tools/permissions" replace />,
      },
      {
        path: 'tools/organizations',
        element: <OrganizationsPage />,
      },
      {
        path: 'organizations',
        element: <Navigate to="/tools/organizations" replace />,
      },
      {
        path: 'tools/archive',
        element: <ArchivedTendersPage />,
      },
      {
        path: 'tools/company-profiles',
        element: <CompanyProfilesPage />,
      },
      {
        path: 'companies',
        element: <Navigate to="/tools/company-profiles" replace />,
      },
      {
        path: 'tools/partner-portal',
        element: <PartnerPortalPage />,
      },
      {
        path: 'partner-portal',
        element: <Navigate to="/partner/portal" replace />,
      },
      {
        path: 'clients/visits',
        element: <ClientVisitsPage />,
      },
      {
        path: 'visits',
        element: <Navigate to="/clients/visits" replace />,
      },
      {
        path: 'tools/client-visits',
        element: <Navigate to="/clients/visits" replace />,
      },
      {
        path: '403',
        element: <AccessDeniedPage />,
      },
      {
        path: '404',
        element: <NotFoundPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
