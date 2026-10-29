import { Tender } from '../types/tender';
import { fuzzyMatch } from './fuzzySearch';

export interface TenderFilterState {
  searchQuery: string;
  selectedStage: string;
  selectedCategory: string;
  selectedOrg: string;
  selectedCompany: string;
  selectedPortal: string;
  selectedTenderType: string;
  selectedOutcome: 'ALL' | 'WON' | 'LOST' | 'IN_FLIGHT' | 'DECLINED';
  datePreset: string;
  customStartDate: string;
  customEndDate: string;
}

export const INITIAL_FILTER_STATE: TenderFilterState = {
  searchQuery: '',
  selectedStage: 'ALL',
  selectedCategory: 'ALL',
  selectedOrg: 'ALL',
  selectedCompany: 'ALL',
  selectedPortal: 'ALL',
  selectedTenderType: 'ALL',
  selectedOutcome: 'ALL',
  datePreset: 'ALL',
  customStartDate: '',
  customEndDate: '',
};

export function parseSafeDate(dStr?: string): Date | null {
  if (!dStr) return null;
  const clean = dStr.trim();
  const d = new Date(clean);
  if (!isNaN(d.getTime())) return d;
  const parts = clean.split('-');
  if (parts.length === 3) {
    const parsed = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export function getTenderPortal(t: Tender): string {
  if (t.summary?.portal) {
    if (t.summary.portal.includes('e-GP')) return 'e-GP (eprocure.gov.bd)';
    if (t.summary.portal.includes('Quantum')) return 'UNDP Quantum Supplier Portal';
    if (t.summary.portal.includes('UNGM')) return 'UNGM / UN Agencies';
    return t.summary.portal;
  }
  const ref = t.referenceNo || '';
  if (/^\d{6,}$/.test(ref)) return 'e-GP (eprocure.gov.bd)';
  if (
    ref.includes('UNDP') ||
    ref.includes('UN') ||
    ref.includes('LRPS') ||
    (t.organization && t.organization.includes('United Nations'))
  ) {
    return 'UNGM / UN Agencies';
  }
  if (ref.includes('BPD') || ref.includes('BRAC')) return 'BRAC / Corporate';
  return 'Direct / Agency Portal';
}

export function getTenderType(t: Tender): string {
  if (t.summary?.tenderType) return t.summary.tenderType;
  const method = (t as any).procurementMethod;
  if (method) return method;
  const ref = (t.referenceNo || '').toUpperCase();
  const title = (t.title || '').toUpperCase();
  if (ref.includes('RFP') || title.includes('RFP')) return 'RFP';
  if (ref.includes('RFQ') || title.includes('RFQ')) return 'RFQ';
  if (ref.includes('EOI') || title.includes('EOI')) return 'EOI';
  if (title.includes('FRAMEWORK')) return 'Framework Agreement';
  return 'OTM';
}

export function countActiveFilters(
  filters: Partial<TenderFilterState>,
  excludeKeys: (keyof TenderFilterState)[] = []
): number {
  let count = 0;
  if (!excludeKeys.includes('searchQuery') && filters.searchQuery?.trim()) count++;
  if (!excludeKeys.includes('selectedStage') && filters.selectedStage && filters.selectedStage !== 'ALL') count++;
  if (!excludeKeys.includes('selectedCategory') && filters.selectedCategory && filters.selectedCategory !== 'ALL') count++;
  if (!excludeKeys.includes('selectedOrg') && filters.selectedOrg && filters.selectedOrg !== 'ALL') count++;
  if (!excludeKeys.includes('selectedCompany') && filters.selectedCompany && filters.selectedCompany !== 'ALL') count++;
  if (!excludeKeys.includes('selectedPortal') && filters.selectedPortal && filters.selectedPortal !== 'ALL') count++;
  if (!excludeKeys.includes('selectedTenderType') && filters.selectedTenderType && filters.selectedTenderType !== 'ALL') count++;
  if (!excludeKeys.includes('selectedOutcome') && filters.selectedOutcome && filters.selectedOutcome !== 'ALL') count++;
  if (!excludeKeys.includes('datePreset') && filters.datePreset && filters.datePreset !== 'ALL') count++;
  if (!excludeKeys.includes('customStartDate') && filters.customStartDate) count++;
  if (!excludeKeys.includes('customEndDate') && filters.customEndDate) count++;
  return count;
}

export function extractFilterOptions(tenders: Tender[]) {
  const categories = ['ALL', ...Array.from(new Set(tenders.map((t) => t.category).filter(Boolean))).sort()];
  const organizations = ['ALL', ...Array.from(new Set(tenders.map((t) => t.organization).filter(Boolean))).sort()];
  
  const companiesSet = new Set<string>();
  companiesSet.add('PrimeTech Solutions Ltd');
  tenders.forEach((t) => {
    const localPartner = t.summary?.jv?.localPartner;
    if (localPartner) companiesSet.add(localPartner);
    const leadMember = t.summary?.jv?.leadMember;
    if (leadMember) {
      const lead = leadMember.split('(')[0].trim();
      if (lead) companiesSet.add(lead);
    }
  });
  const companies = ['ALL', ...Array.from(companiesSet).sort()];

  const portalsSet = new Set<string>();
  tenders.forEach((t) => portalsSet.add(getTenderPortal(t)));
  const portals = ['ALL', ...Array.from(portalsSet).sort()];

  const typesSet = new Set<string>();
  tenders.forEach((t) => typesSet.add(getTenderType(t)));
  const tenderTypes = ['ALL', ...Array.from(typesSet).sort()];

  return { categories, organizations, companies, portals, tenderTypes };
}

export function filterTenders(tenders: Tender[], filters: Partial<TenderFilterState>): Tender[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return tenders.filter((t) => {
    // 1. Search Query
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.trim();
      const match = fuzzyMatch(
        [
          t.title,
          t.id,
          t.referenceNo,
          t.organization,
          t.country,
          t.summary?.tenderIdDisplay,
          t.category,
        ],
        q
      );
      if (!match) return false;
    }

    // 2. Stage Filter
    if (filters.selectedStage && filters.selectedStage !== 'ALL') {
      if (t.stage !== filters.selectedStage) return false;
    }

    // 3. Category Filter
    if (filters.selectedCategory && filters.selectedCategory !== 'ALL') {
      if (t.category !== filters.selectedCategory) return false;
    }

    // 4. Organization Filter
    if (filters.selectedOrg && filters.selectedOrg !== 'ALL') {
      if (t.organization !== filters.selectedOrg) return false;
    }

    // 5. Company / Partner Filter
    if (filters.selectedCompany && filters.selectedCompany !== 'ALL') {
      const target = filters.selectedCompany;
      const isLead = target === 'PrimeTech Solutions Ltd';
      const localPartner = t.summary?.jv?.localPartner;
      const leadMember = t.summary?.jv?.leadMember;
      const matchesPartner =
        (localPartner && localPartner.includes(target)) ||
        (leadMember && leadMember.includes(target));
      if (!matchesPartner && !(isLead && (!localPartner || isLead))) {
        return false;
      }
    }

    // 6. Portal Filter
    if (filters.selectedPortal && filters.selectedPortal !== 'ALL') {
      if (getTenderPortal(t) !== filters.selectedPortal) return false;
    }

    // 7. Tender Type Filter
    if (filters.selectedTenderType && filters.selectedTenderType !== 'ALL') {
      if (getTenderType(t) !== filters.selectedTenderType) return false;
    }

    // 8. Outcome Filter (Won / Lost / In-Flight / Declined)
    if (filters.selectedOutcome && filters.selectedOutcome !== 'ALL') {
      if (filters.selectedOutcome === 'WON' && t.stage !== 'AWARDED') return false;
      if (filters.selectedOutcome === 'LOST' && t.stage !== 'LOST') return false;
      if (filters.selectedOutcome === 'DECLINED' && t.stage !== 'DECLINED' && (t.decision as string) !== 'NO_GO' && (t.decision as string) !== 'NO-GO') return false;
      if (filters.selectedOutcome === 'IN_FLIGHT') {
        if (
          t.stage === 'AWARDED' ||
          t.stage === 'LOST' ||
          t.stage === 'DECLINED' ||
          t.stage === 'ARCHIVED'
        ) {
          return false;
        }
      }
    }

    // 9. Date Preset Filter
    if (filters.datePreset && filters.datePreset !== 'ALL') {
      const dDate = parseSafeDate(t.submissionDeadline);
      if (!dDate) return false;

      if (filters.datePreset === 'TODAY') {
        const tomorrow = new Date(todayStart);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (dDate < todayStart || dDate >= tomorrow) return false;
      } else if (filters.datePreset === '7_DAYS') {
        const in7 = new Date(todayStart);
        in7.setDate(in7.getDate() + 7);
        if (dDate < todayStart || dDate > in7) return false;
      } else if (filters.datePreset === '30_DAYS') {
        const in30 = new Date(todayStart);
        in30.setDate(in30.getDate() + 30);
        if (dDate < todayStart || dDate > in30) return false;
      } else if (filters.datePreset === 'THIS_MONTH') {
        const endOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0);
        const startOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
        if (dDate < startOfMonth || dDate > endOfMonth) return false;
      } else if (filters.datePreset === 'PAST') {
        if (dDate >= todayStart) return false;
      }
    }

    // 10. Custom Date Range Filter
    if (filters.customStartDate) {
      const start = parseSafeDate(filters.customStartDate);
      const dDate = parseSafeDate(t.submissionDeadline);
      if (start && (!dDate || dDate < start)) return false;
    }
    if (filters.customEndDate) {
      const end = parseSafeDate(filters.customEndDate);
      if (end) end.setHours(23, 59, 59, 999);
      const dDate = parseSafeDate(t.submissionDeadline);
      if (end && (!dDate || dDate > end)) return false;
    }

    return true;
  });
}

