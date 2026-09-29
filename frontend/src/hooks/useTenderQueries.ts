import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../utils/apiConfig';
import { queryKeys } from '../api/queryClient';
import { mapDbTenderToTender } from '../utils/tenderMappers';
import {
  Tender,
  TenderCategory,
  Organization,
  CompanyProjectCredential,
  CompanyProfile,
} from '../types/tender';
import { ClientVisit } from '../types/clientVisit';

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all tenders from the backend API, mapped to frontend Tender model.
 */
export function useTendersQuery() {
  return useQuery<Tender[]>({
    queryKey: queryKeys.tenders.all,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/tenders`);
      if (!res.ok) {
        throw new Error(`Failed to fetch tenders: ${res.statusText}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((dbt) => mapDbTenderToTender(dbt));
    },
  });
}

/**
 * Fetch a single tender detail by its ID.
 */
export function useTenderQuery(tenderId: string | undefined) {
  return useQuery<Tender | null>({
    queryKey: queryKeys.tenders.detail(tenderId),
    queryFn: async () => {
      if (!tenderId) return null;
      const res = await fetch(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch tender ${tenderId}: ${res.statusText}`);
      }
      const data = await res.json();
      return mapDbTenderToTender(data);
    },
    enabled: Boolean(tenderId),
  });
}

/**
 * Fetch tender categories taxonomy.
 */
export function useCategoriesQuery() {
  return useQuery<TenderCategory[]>({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.statusText}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

/**
 * Fetch procuring entity organizations master directory.
 */
export function useOrganizationsQuery() {
  return useQuery<Organization[]>({
    queryKey: queryKeys.organizations.all,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/organizations`);
      if (!res.ok) {
        throw new Error(`Failed to fetch organizations: ${res.statusText}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

/**
 * Fetch past company project experience credentials (Work Orders, CCs, etc.).
 */
export function useCompanyProjectsQuery() {
  return useQuery<CompanyProjectCredential[]>({
    queryKey: queryKeys.companyProjects.all,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/company-projects`);
      if (!res.ok) {
        throw new Error(`Failed to fetch company projects: ${res.statusText}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

/**
 * Fetch company organizational profiles.
 */
export function useCompanyProfilesQuery() {
  return useQuery<CompanyProfile[]>({
    queryKey: queryKeys.companyProfiles.all,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/company-profiles`);
      if (!res.ok) {
        throw new Error(`Failed to fetch company profiles: ${res.statusText}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

/**
 * Fetch pipeline report analytics data with generic return type.
 */
export function useReportsAnalyticsQuery<TData = any>() {
  return useQuery<TData>({
    queryKey: queryKeys.reports.analytics,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard/reports/analytics`);
      if (!res.ok) {
        throw new Error(`Failed to fetch report analytics: ${res.statusText}`);
      }
      return res.json();
    },
  });
}

/**
 * Fetch client visits and meetings schedule.
 */
export function useClientVisitsQuery() {
  return useQuery<ClientVisit[]>({
    queryKey: queryKeys.clientVisits.all,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/client-visits`);
      if (!res.ok) {
        throw new Error(`Failed to fetch client visits: ${res.statusText}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Mutation to update a tender with automatic query cache invalidation.
 */
export function useUpdateTenderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tender> }) => {
      const res = await fetch(`${API_BASE_URL}/tenders/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        throw new Error(`Failed to update tender: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenders.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.analytics });
    },
  });
}

/**
 * Mutation to delete a tender with automatic cache invalidation.
 */
export function useDeleteTenderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/tenders/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(`Failed to delete tender: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenders.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.analytics });
    },
  });
}

/**
 * Mutation to patch a client visit status.
 */
export function usePatchClientVisitStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      visitId,
      status,
      actualCheckIn,
      actualCheckOut,
    }: {
      visitId: string;
      status: string;
      actualCheckIn?: string;
      actualCheckOut?: string;
    }) => {
      const payload: Record<string, unknown> = { status };
      if (actualCheckIn) payload.actual_check_in = actualCheckIn;
      if (actualCheckOut) payload.actual_check_out = actualCheckOut;

      const res = await fetch(`${API_BASE_URL}/client-visits/${visitId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Failed to update client visit status: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientVisits.all });
    },
  });
}
