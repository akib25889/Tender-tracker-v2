import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
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
    'ORG-BD-01': true,
    'ORG-BD-02': true,
    'ORG-BD-04': true,
    'ORG-BD-06': true,
    'ORG-BD-10': true,
    'ORG-UN-01': true,
    'ORG-UN-02': true,
    'ORG-MDB-01': true,
  });

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
      const matchesSearch =
        !searchQuery ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (org.shortName && org.shortName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        org.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (org.aliases && org.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())));

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
    if (typeCode.startsWith('UN_')) return <Globe className="w-3.5 h-3.5 text-[#2563EB]" />;
    if (['GOVERNMENT', 'MINISTRY', 'DIVISION', 'DEPARTMENT'].includes(typeCode))
      return <Landmark className="w-3.5 h-3.5 text-[#0F172A]" />;
    return <Building2 className="w-3.5 h-3.5 text-[#059669]" />;
  };

  const renderTreeNode = (node: (typeof orgStats)[0], depth = 0) => {
    const children = orgTreeRoots.parentMap[node.id] || [];
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedNodes[node.id];

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
            depth === 0
              ? 'bg-[#F8FAFC] border-[#CBD5E1] font-semibold'
              : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNode(node.id)}
                className="p-1 hover:bg-[#E2E8F0] rounded text-[#64748B] shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[#0F172A]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#0F172A]" />
                )}
              </button>
            ) : (
              <span className="w-6 shrink-0" />
            )}

            <div className="flex items-center gap-2 min-w-0">
              {getTypeIcon(node.type)}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-[#0F172A] truncate">
                    {node.name}
                  </span>
                  {node.shortName && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569] font-bold border border-[#E2E8F0]">
                      {node.shortName}
                    </span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#64748B] border border-[#E2E8F0] uppercase">
                    {node.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                  <span>{node.country}</span>
                  {node.website && (
                    <>
                      <span>•</span>
                      <a
                        href={node.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2563EB] hover:underline flex items-center gap-0.5"
                      >
                        Portal <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-right font-mono text-xs">
              <span className="text-[#64748B]">Bids:</span>
              <span className="font-bold text-[#0F172A]">{node.linkedBidsCount}</span>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddWithParent(node.id)}
              className="p-1 px-2 text-[11px] font-semibold text-[#2563EB] hover:bg-[#EFF6FF] rounded border border-transparent hover:border-[#BFDBFE] transition-colors"
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
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs text-[#065F46] font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#059669]" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-[#059669] hover:text-[#064E3B]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Tools &amp; Addons</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Organization Intelligence</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Procuring Organizations &amp; Hierarchy
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Centralized master database of procuring entities, government ministries, UN bodies, and multilateral partners.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddWithParent()}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Organization</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Registered Organizations
            </span>
            <span className="font-display text-2xl font-bold text-[#0F172A] mt-1 block">
              {organizations.length}
            </span>
            <span className="text-[11px] text-[#2563EB]">Master catalog entities</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Government Bodies
            </span>
            <span className="font-display text-2xl font-bold text-[#0F172A] mt-1 block">
              {
                organizations.filter((o) =>
                  ['GOVERNMENT', 'MINISTRY', 'DIVISION', 'DEPARTMENT', 'DIRECTORATE', 'AUTHORITY', 'STATE_OWNED_ENTERPRISE'].includes(o.type)
                ).length
              }
            </span>
            <span className="text-[11px] text-[#64748B]">Ministries &amp; state agencies</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              UN &amp; Multilateral Partners
            </span>
            <span className="font-display text-2xl font-bold text-[#2563EB] mt-1 block">
              {
                organizations.filter((o) =>
                  ['UN_SYSTEM', 'UN_ORGANIZATION', 'UN_PROGRAMME', 'UN_COUNTRY_OFFICE', 'MULTILATERAL_ORGANIZATION', 'DEVELOPMENT_PARTNER'].includes(
                    o.type
                  )
                ).length
              }
            </span>
            <span className="text-[11px] text-[#16A34A]">UNGM, WB &amp; ADB agencies</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Active Tenders Linked
            </span>
            <span className="font-display text-2xl font-bold text-[#10B981] mt-1 block">
              {tenders.length}
            </span>
            <span className="text-[11px] text-[#16A34A]">Opportunities in pipeline</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container: Search, Filter, and Views */}
      <Card
        title="Organization Hierarchy & Intelligence Console"
        subtitle="Manage unlimited parent-child hierarchies, tracking priorities, and official procurement portals"
        headerAction={
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setActiveView('TREE')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                  activeView === 'TREE'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
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
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
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
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search organizations by name, short code, country, or aliases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
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
                      ? 'bg-[#0F172A] text-white'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
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
                <div className="p-8 text-center text-xs text-[#94A3B8]">
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
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3 px-4">Organization Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Parent Organization</th>
                    <th className="py-3 px-3">Country</th>
                    <th className="py-3 px-3 text-center">Linked Bids</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredOrgs.map((org) => {
                    const parent = organizations.find((o) => o.id === org.parentId);
                    return (
                      <tr key={org.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#0F172A]">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(org.type)}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{org.name}</span>
                                {org.shortName && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569] font-bold border border-[#E2E8F0]">
                                    {org.shortName}
                                  </span>
                                )}
                              </div>
                              {org.website && (
                                <a
                                  href={org.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-[#2563EB] hover:underline flex items-center gap-1 mt-0.5"
                                >
                                  {org.website.replace('https://', '')}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#475569] border border-[#E2E8F0] font-semibold">
                            {org.type.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-[#64748B]">
                          {parent ? (
                            <span className="text-[#0F172A] font-medium">{parent.name}</span>
                          ) : (
                            <span className="text-[#94A3B8] italic">Top-Level Root</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-[#475569]">{org.country}</td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-[#0F172A]">
                          {org.linkedBidsCount}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenAddWithParent(org.id)}
                            className="text-[11px] font-semibold text-[#2563EB] hover:underline"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl w-full max-w-xl overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display font-bold text-[#0F172A] text-base">
                  Register New Procuring Organization
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#E2E8F0] text-[#64748B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOrganization} className="p-6 space-y-4 text-xs">
              {isDuplicateName && (
                <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-[#B45309] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
                  <span>
                    <strong>Notice:</strong> An organization with a similar name or alias already exists in the catalog.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Organization Official Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ministry of Primary and Mass Education"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Acronym / Short Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MoPME"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg font-mono text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Organization Classification Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A]"
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Parent Organization in Tree
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A]"
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
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Country / Jurisdiction *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Procurement Portal / URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Monitoring Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A]"
                  >
                    <option value="CRITICAL">Critical (High Volume)</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Monitoring</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Search Aliases (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary Education Board, Primary Mass Education"
                  value={aliases}
                  onChange={(e) => setAliases(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Mandate &amp; Operational Scope Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Official procurement responsibilities, typical tender domains..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#CBD5E1] text-[#475569] font-semibold rounded-lg hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F172A] text-white font-semibold rounded-lg hover:bg-[#1E293B] shadow-sm flex items-center gap-1.5"
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

