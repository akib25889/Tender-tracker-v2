import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { fuzzyMatch } from '../utils/fuzzySearch';
import {
  Building2,
  Plus,
  Search,
  Globe,
  Landmark,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  FolderTree,
  Table as TableIcon,
  Check,
  AlertTriangle,
  X,
  Target,
} from 'lucide-react';

const ORG_TYPES = [
  { code: 'GOVERNMENT', label: 'Government' },
  { code: 'MINISTRY', label: 'Ministry' },
  { code: 'DIVISION', label: 'Division' },
  { code: 'DEPARTMENT', label: 'Department' },
  { code: 'DIRECTORATE', label: 'Directorate' },
  { code: 'AUTHORITY', label: 'Authority' },
  { code: 'CORPORATION', label: 'Corporation' },
  { code: 'STATE_OWNED_ENTERPRISE', label: 'State-Owned Enterprise' },
  { code: 'UN_SYSTEM', label: 'UN System Root' },
  { code: 'UN_ORGANIZATION', label: 'UN Organization' },
  { code: 'UN_PROGRAMME', label: 'UN Programme / Fund' },
  { code: 'UN_COUNTRY_OFFICE', label: 'UN Country Office' },
  { code: 'MULTILATERAL_ORGANIZATION', label: 'Multilateral Bank' },
  { code: 'DEVELOPMENT_PARTNER', label: 'Development Partner' },
  { code: 'BANK', label: 'Bank / Financial Inst.' },
  { code: 'PRIVATE_COMPANY', label: 'Private Enterprise' },
  { code: 'OTHER', label: 'Other Procuring Entity' },
];

export const OrganizationsPage: React.FC = () => {
  const { organizations, addOrganization, tenders } = useTenders();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [activeView, setActiveView] = useState<'TABLE' | 'TREE'>('TREE');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'ORG-BD-GOV': true,
    'ORG-BD-PMO': true,
    'ORG-BD-MORTH': true,
    'ORG-BD-LGRD': true,
    'ORG-BD-MPEMR': true,
    'ORG-BD-MOWR': true,
    'ORG-BD-MOEDU': true,
    'ORG-BD-MOA': true,
  });

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    organizations.forEach((o) => {
      allExpanded[o.id] = true;
    });
    setExpandedNodes(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedNodes({ 'ORG-BD-GOV': true });
  };

  // Modal Form State
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [type, setType] = useState('MINISTRY');
  const [parentId, setParentId] = useState<string>('');
  const [country, setCountry] = useState('Bangladesh');
  const [website, setWebsite] = useState('');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [aliases, setAliases] = useState('');
  const [description, setDescription] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleOpenAddWithParent = (parentOrgId?: string) => {
    if (parentOrgId) {
      setParentId(parentOrgId);
      const parent = organizations.find((o) => o.id === parentOrgId);
      if (parent?.country) setCountry(parent.country);
      if (parent?.type === 'GOVERNMENT') setType('MINISTRY');
      else if (parent?.type === 'MINISTRY') setType('DEPARTMENT');
      else if (parent?.type === 'UN_PROGRAMME') setType('UN_COUNTRY_OFFICE');
      else setType('DEPARTMENT');
    } else {
      setParentId('');
      setType('MINISTRY');
      setCountry('Bangladesh');
    }
    setName('');
    setShortName('');
    setWebsite('');
    setAliases('');
    setDescription('');
    setPriority('HIGH');
    setIsAddModalOpen(true);
  };

  // Check duplicate
  const isDuplicateName = useMemo(() => {
    if (!name.trim()) return false;
    const lower = name.trim().toLowerCase();
    return organizations.some(
      (o) =>
        o.name.toLowerCase() === lower ||
        (o.shortName && o.shortName.toLowerCase() === lower) ||
        (o.aliases && o.aliases.some((a) => a.toLowerCase() === lower))
    );
  }, [name, organizations]);

  const handleSaveOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const aliasArray = aliases
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const created = addOrganization({
      name: name.trim(),
      shortName: shortName.trim() || undefined,
      type,
      parentId: parentId || null,
      country: country.trim() || 'Bangladesh',
      website: website.trim() || undefined,
      priority,
      aliases: aliasArray.length ? aliasArray : undefined,
      description: description.trim() || undefined,
    });

    if (parentId) {
      setExpandedNodes((prev) => ({ ...prev, [parentId]: true }));
    }

    setIsAddModalOpen(false);
    setNotification(`Successfully registered organization "${created.name}"`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Calculate stats
  const orgStats = useMemo(() => {
    return organizations.map((org) => {
      const orgNameLower = org.name.toLowerCase();
      const orgShortLower = org.shortName?.toLowerCase() || '';
      const matchedTenders = tenders.filter((t) => {
        const tOrg = (t.organization || '').toLowerCase();
        return (
          tOrg.includes(orgNameLower) ||
          orgNameLower.includes(tOrg) ||
          (orgShortLower && tOrg.includes(orgShortLower))
        );
      });

      return {
        ...org,
        linkedBidsCount: matchedTenders.length,
      };
    });
  }, [organizations, tenders]);

  // Filtered organizations
  const filteredOrgs = useMemo(() => {
    return orgStats.filter((org) => {
      const matchesSearch = fuzzyMatch(
        [org.name, org.shortName, org.country, ...(org.aliases || [])],
        searchQuery
      );

      const matchesType =
        selectedTypeFilter === 'ALL' ||
        (selectedTypeFilter === 'GOV' &&
          ['GOVERNMENT', 'MINISTRY', 'DIVISION', 'DEPARTMENT', 'DIRECTORATE', 'AUTHORITY', 'STATE_OWNED_ENTERPRISE'].includes(org.type)) ||
        (selectedTypeFilter === 'UN' &&
          ['UN_SYSTEM', 'UN_ORGANIZATION', 'UN_PROGRAMME', 'UN_COUNTRY_OFFICE'].includes(org.type)) ||
        (selectedTypeFilter === 'MDB' &&
          ['MULTILATERAL_ORGANIZATION', 'DEVELOPMENT_PARTNER'].includes(org.type)) ||
        org.type === selectedTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [orgStats, searchQuery, selectedTypeFilter]);

  // Tree roots
  const orgTreeRoots = useMemo(() => {
    const parentMap: Record<string, typeof orgStats> = {};
    orgStats.forEach((org) => {
      const pid = org.parentId || 'ROOT';
      if (!parentMap[pid]) parentMap[pid] = [];
      parentMap[pid].push(org);
    });

    return { roots: parentMap['ROOT'] || [], parentMap };
  }, [orgStats]);

  const getTypeIcon = (typeCode: string) => {
    if (typeCode.startsWith('UN_')) return <Globe className="w-3.5 h-3.5 text-[var(--accent)]" />;
    if (['GOVERNMENT', 'MINISTRY', 'DIVISION', 'DEPARTMENT'].includes(typeCode))
      return <Landmark className="w-3.5 h-3.5 text-[var(--text-primary)]" />;
    return <Building2 className="w-3.5 h-3.5 text-[var(--ok)]" />;
  };

  const parseDescriptionDetails = (desc?: string) => {
    let location = '';
    let noticeUrl = '';
    let tenderUrl = '';
    if (!desc) return { location, noticeUrl, tenderUrl };

    const parts = desc.split('|').map((p) => p.trim());
    for (const part of parts) {
      if (part.startsWith('Location:')) {
        location = part.replace('Location:', '').trim();
      } else if (part.startsWith('Notice Portal:')) {
        noticeUrl = part.replace('Notice Portal:', '').trim();
      } else if (part.startsWith('Tender Portal:')) {
        tenderUrl = part.replace('Tender Portal:', '').trim();
      }
    }
    return { location, noticeUrl, tenderUrl };
  };

  const renderTreeNode = (node: (typeof orgStats)[0], depth = 0) => {
    const children = orgTreeRoots.parentMap[node.id] || [];
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedNodes[node.id];
    const { location, noticeUrl, tenderUrl } = parseDescriptionDetails(node.description);

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
 depth === 0
 ? 'bg-[var(--bg-subtle)] border-[var(--border-strong)] font-semibold'
              : 'bg-[var(--bg-surface)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)]'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNode(node.id)}
                className="p-1 hover:bg-[var(--bg-muted)] rounded text-[var(--text-secondary)] shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[var(--text-primary)]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--text-primary)]" />
                )}
              </button>
            ) : (
              <span className="w-6 shrink-0" />
            )}

            <div className="flex items-center gap-2 min-w-0">
              {getTypeIcon(node.type)}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {node.name}
                  </span>
                  {node.shortName && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-bold border border-[var(--border-default)]">
                      {node.shortName}
                    </span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] uppercase">
                    {node.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] flex flex-wrap items-center gap-2 mt-0.5">
                  <span>{node.country}</span>
                  {location && (
                    <>
                      <span>•</span>
                      <span className="text-[var(--text-secondary)]">{location}</span>
                    </>
                  )}
                  {node.website && (
                    <>
                      <span>•</span>
                      <a
                        href={node.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--accent)] hover:underline flex items-center gap-0.5 font-medium"
                      >
                        Portal <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </>
                  )}
                  {tenderUrl && (
                    <>
                      <span>•</span>
                      <a
                        href={tenderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--ok)] hover:underline flex items-center gap-0.5 font-semibold text-[10px] bg-[var(--ok-soft)] px-1.5 py-0.2 rounded border border-[var(--ok-line)]"
                      >
                        Tenders <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </>
                  )}
                  {noticeUrl && (
                    <>
                      <span>•</span>
                      <a
                        href={noticeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--warn)] hover:underline flex items-center gap-0.5 font-semibold text-[10px] bg-[var(--warn-soft)] px-1.5 py-0.2 rounded border border-[var(--warn-line)]"
                      >
                        Notices <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-right font-mono text-xs">
              <span className="text-[var(--text-secondary)]">Bids:</span>
              <span className="font-bold text-[var(--text-primary)]">{node.linkedBidsCount}</span>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddWithParent(node.id)}
              className="p-1 px-2 text-[11px] font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] rounded border border-transparent hover:border-[var(--accent-line)] transition-colors"
              title="Add subsidiary or department under this organization"
            >
              + Sub-Office
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-[var(--ok-soft)] border border-[var(--ok-line)] rounded-xl text-xs text-[var(--ok)] font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[var(--ok)]" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-[var(--ok)] hover:text-[var(--ok)]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
            <span>Tools &amp; Addons</span>
            <span>•</span>
            <span className="font-semibold text-[var(--text-primary)]">Organization Intelligence</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Procuring Organizations &amp; Hierarchy
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Centralized master database of procuring entities, government ministries, UN bodies, and multilateral partners.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddWithParent()}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-[var(--accent-on)] rounded-lg text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Organization</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              Registered Organizations
            </span>
            <span className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1 block">
              {organizations.length}
            </span>
            <span className="text-[11px] text-[var(--accent)]">Master catalog entities</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              Government Bodies
            </span>
            <span className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1 block">
              {
                organizations.filter((o) =>
                  ['GOVERNMENT', 'MINISTRY', 'DIVISION', 'DEPARTMENT', 'DIRECTORATE', 'AUTHORITY', 'STATE_OWNED_ENTERPRISE'].includes(o.type)
                ).length
              }
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">Ministries &amp; state agencies</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              UN &amp; Multilateral Partners
            </span>
            <span className="font-display text-2xl font-bold text-[var(--accent)] mt-1 block">
              {
                organizations.filter((o) =>
                  ['UN_SYSTEM', 'UN_ORGANIZATION', 'UN_PROGRAMME', 'UN_COUNTRY_OFFICE', 'MULTILATERAL_ORGANIZATION', 'DEVELOPMENT_PARTNER'].includes(
                    o.type
                  )
                ).length
              }
            </span>
            <span className="text-[11px] text-[var(--ok)]">UNGM, WB &amp; ADB agencies</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-default)] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              Active Tenders Linked
            </span>
            <span className="font-display text-2xl font-bold text-[var(--ok)] mt-1 block">
              {tenders.length}
            </span>
            <span className="text-[11px] text-[var(--ok)]">Opportunities in pipeline</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--ok-soft)] text-[var(--ok)] flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container: Search, Filter, and Views */}
      <Card
        title="Organization Hierarchy & Intelligence Console"
        subtitle="Manage unlimited parent-child hierarchies, tracking priorities, and official procurement portals"
        headerAction={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {activeView === 'TREE' && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2.5 py-1 text-[11px] font-medium rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2.5 py-1 text-[11px] font-medium rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  Collapse All
                </button>
              </div>
            )}
            <div className="flex items-center p-1 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setActiveView('TREE')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
 activeView === 'TREE'
 ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Tree Hierarchy</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('TABLE')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
 activeView === 'TABLE'
 ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Directory Table</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Search & Type Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search organizations by name, short code, country, or aliases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 min-w-0 text-xs pb-1 sm:pb-0">
              {[
                { id: 'ALL', label: 'All Types' },
                { id: 'GOV', label: 'Government' },
                { id: 'UN', label: 'UN System' },
                { id: 'MDB', label: 'Multilateral' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedTypeFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
 selectedTypeFilter === filter.id
 ? 'bg-[var(--accent)] text-[var(--accent-on)]'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* VIEW 1: HIERARCHY TREE VIEW */}
          {activeView === 'TREE' && (
            <div className="space-y-2 pt-2">
              {orgTreeRoots.roots.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                  No organizations found matching search criteria.
                </div>
              ) : (
                orgTreeRoots.roots.map((rootNode) => renderTreeNode(rootNode, 0))
              )}
            </div>
          )}

          {/* VIEW 2: DIRECTORY TABLE VIEW */}
          {activeView === 'TABLE' && (
            <div className="overflow-x-auto -mx-5 -my-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    <th className="py-3 px-4">Organization Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Parent Organization</th>
                    <th className="py-3 px-3">Country</th>
                    <th className="py-3 px-3 text-center">Linked Bids</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredOrgs.map((org) => {
                    const parent = organizations.find((o) => o.id === org.parentId);
                    const { location, noticeUrl, tenderUrl } = parseDescriptionDetails(org.description);
                    return (
                      <tr key={org.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(org.type)}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{org.name}</span>
                                {org.shortName && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-bold border border-[var(--border-default)]">
                                    {org.shortName}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                {org.website && (
                                  <a
                                    href={org.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-0.5"
                                  >
                                    Portal <ExternalLink className="w-2 h-2" />
                                  </a>
                                )}
                                {tenderUrl && (
                                  <a
                                    href={tenderUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-semibold text-[var(--ok)] hover:underline flex items-center gap-0.5 bg-[var(--ok-soft)] px-1 py-0.2 rounded border border-[var(--ok-line)]"
                                  >
                                    Tenders <ExternalLink className="w-2 h-2" />
                                  </a>
                                )}
                                {noticeUrl && (
                                  <a
                                    href={noticeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-semibold text-[var(--warn)] hover:underline flex items-center gap-0.5 bg-[var(--warn-soft)] px-1 py-0.2 rounded border border-[var(--warn-line)]"
                                  >
                                    Notices <ExternalLink className="w-2 h-2" />
                                  </a>
                                )}
                                {location && (
                                  <span className="text-[10px] text-[var(--text-secondary)]">
                                    ({location})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] font-semibold">
                            {org.type.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-[var(--text-secondary)]">
                          {parent ? (
                            <span className="text-[var(--text-primary)] font-medium">{parent.name}</span>
                          ) : (
                            <span className="text-[var(--text-muted)] italic">Top-Level Root</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-[var(--text-secondary)]">{org.country}</td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-[var(--text-primary)]">
                          {org.linkedBidsCount}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenAddWithParent(org.id)}
                            className="text-[11px] font-semibold text-[var(--accent)] hover:underline"
                          >
                            + Sub-Office
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* ADD ORGANIZATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[var(--text-primary)]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-xl w-full max-w-xl overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-display font-bold text-[var(--text-primary)] text-base">
                  Register New Procuring Organization
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOrganization} className="p-6 space-y-4 text-xs">
              {isDuplicateName && (
                <div className="p-3 bg-[var(--warn-soft)] border border-[var(--warn-line)] rounded-lg text-[var(--warn)] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--warn)]" />
                  <span>
                    <strong>Notice:</strong> An organization with a similar name or alias already exists in the catalog.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Organization Official Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ministry of Primary and Mass Education"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Acronym / Short Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MoPME"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg font-mono text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Organization Classification Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)]"
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Parent Organization in Tree
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)]"
                  >
                    <option value="">None (Top-Level Sovereign / International Root)</option>
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} {o.shortName ? `(${o.shortName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Country / Jurisdiction *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Procurement Portal / URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Monitoring Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)]"
                  >
                    <option value="CRITICAL">Critical (High Volume)</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Monitoring</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Search Aliases (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary Education Board, Primary Mass Education"
                  value={aliases}
                  onChange={(e) => setAliases(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Mandate &amp; Operational Scope Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Official procurement responsibilities, typical tender domains..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)]"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)] font-semibold rounded-lg hover:bg-[var(--bg-subtle)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-on)] font-semibold rounded-lg hover:bg-[var(--accent-hover)] shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Organization</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

