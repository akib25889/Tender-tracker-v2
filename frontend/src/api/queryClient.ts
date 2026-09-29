import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance configured for TenderTracker Command Center.
 * Configured with caching, deduplication, and sensible stale times for enterprise tender operations.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes: queries remain fresh without background refetching
      gcTime: 1000 * 60 * 15,    // 15 minutes: garbage collection time for unused cache entries
      refetchOnWindowFocus: false, // Prevents sudden flashing/refetches when switching browser tabs
      retry: 1,                  // Single retry on network failure before raising error
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Standard Query Key hierarchy for TanStack Query across the application.
 */
export const queryKeys = {
  tenders: {
    all: ['tenders'] as const,
    list: (filters?: Record<string, unknown>) => ['tenders', 'list', filters] as const,
    detail: (id: string | undefined) => ['tenders', 'detail', id] as const,
    summary: (id: string | undefined) => ['tenders', 'summary', id] as const,
    clauses: (id: string | undefined) => ['tenders', 'clauses', id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  organizations: {
    all: ['organizations'] as const,
  },
  companyProjects: {
    all: ['companyProjects'] as const,
    detail: (id: string | undefined) => ['companyProjects', 'detail', id] as const,
  },
  companyProfiles: {
    all: ['companyProfiles'] as const,
  },
  reports: {
    analytics: ['reports', 'analytics'] as const,
  },
  clientVisits: {
    all: ['clientVisits'] as const,
    detail: (id: string | undefined) => ['clientVisits', 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  userActivities: (userId: string | undefined) => ['userActivities', userId] as const,
};
