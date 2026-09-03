import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Save,
  Check,
  Layers,
  FileCheck2,
  Briefcase,
  AlertTriangle,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import {
  TenderClassification,
  TenderPriority,
  TenderPersonnelReq,
  TenderHardwareReq,
  TenderRiskPoint,
} from '../types/tender';
import { ExportDropdown } from '../components/ui/ExportDropdown';

const CLASSIFICATIONS: TenderClassification[] = [
  'SOFTWARE / IT RELATED',
  'PARTIALLY SOFTWARE / IT RELATED',
  'NOT SOFTWARE / IT RELATED',
  'UNCLEAR',
];

export const TenderRegistryPage: React.FC = () => {
  const { tenders, addTender, deleteTender } = useTenders();
  const [searchParams] = useSearchParams();
  const editIdFromUrl = searchParams.get('id') || searchParams.get('edit');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassificationFilter, setSelectedClassificationFilter] = useState<string>('ALL');
  const [selectedTenderId, setSelectedTenderId] = useState<string>(
    editIdFromUrl || tenders[0]?.id || ''
  );

  useEffect(() => {
    if (editIdFromUrl && tenders.some((t) => t.id === editIdFromUrl)) {
      setSelectedTenderId(editIdFromUrl);
    }
  }, [editIdFromUrl, tenders]);

  const [activeEditorTab, setActiveEditorTab] = useState<
    'BASIC' | 'SCOPE' | 'ELIGIBILITY' | 'STAFFING' | 'RISKS'
  >('BASIC');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);

  // Form State initialized from currently selected tender
  const selectedTender =
    tenders.find((t) => t.id === selectedTenderId) || tenders[0];

  const [classification, setClassification] = useState<TenderClassification>(
    selectedTender?.summary?.classification || 'SOFTWARE / IT RELATED'
  );
  const [tenderTitle, setTenderTitle] = useState(selectedTender?.title || '');
  const [projectName, setProjectName] = useState(
    selectedTender?.summary?.projectName || ''
  );
  const [tenderId, setTenderId] = useState(selectedTender?.id || '');
  const [referenceNo, setReferenceNo] = useState(
    selectedTender?.referenceNo || ''
  );
  const [client, setClient] = useState(selectedTender?.organization || '');
  const [country, setCountry] = useState(selectedTender?.country || '');
  const [portal, setPortal] = useState(
    selectedTender?.summary?.portal || 'e-GP / UNGM'
  );
  const [publishedDate, setPublishedDate] = useState(
    selectedTender?.summary?.publishedDate ||
      new Date().toISOString().split('T')[0]
  );
  const [lastDate, setLastDate] = useState(
    selectedTender?.submissionDeadline
      ? selectedTender.submissionDeadline.split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [submissionTime, setSubmissionTime] = useState(
    selectedTender?.summary?.submissionTime || '14:00 BST'
  );
  const [priority, setPriority] = useState<TenderPriority>(
    selectedTender?.priority || 'HIGH'
  );
  const [category, setCategory] = useState(
    selectedTender?.category || 'IT & Cloud Infrastructure'
  );

  // Scope & Commercial
  const [mainIdea, setMainIdea] = useState(
    selectedTender?.summary?.mainIdea ||
      'Deployment of centralized enterprise software, cloud infrastructure, and technical support.'
  );
  const [tenderSecurity, setTenderSecurity] = useState(
    selectedTender?.summary?.commercial?.tenderSecurity ||
      'Bank Guarantee Required'
  );
  const [contractPeriod, setContractPeriod] = useState(
    selectedTender?.summary?.commercial?.contractPeriod ||
      '12 Months + 24 Months O&M'
  );
  const [tenderDocPrice, setTenderDocPrice] = useState(
    selectedTender?.summary?.commercial?.tenderDocPrice || 'Free on Portal'
  );
  const [performanceSecurity, setPerformanceSecurity] = useState(
    selectedTender?.summary?.commercial?.performanceSecurity ||
      '10% of Contract Value'
  );

  // Dynamic Lists
  const [technicalReqs, setTechnicalReqs] = useState<string[]>(
    selectedTender?.summary?.technicalReqs || [
      'Web-based zero-trust information system',
      'High-availability database cluster replication',
      'Automated integration API with audit logging',
    ]
  );
  const [technologyMentioned, setTechnologyMentioned] = useState<string[]>(
    selectedTender?.summary?.technologyMentioned || [
      'React',
      'Python / FastAPI',
      'PostgreSQL',
      'Docker',
    ]
  );
  const [operationalReqs, setOperationalReqs] = useState<string[]>(
    selectedTender?.summary?.operationalReqs || [
      '24/7 on-call technical support with 2-hour MTTR',
      'Tier-4 SLA: 99.95% system uptime guarantee',
    ]
  );

  // Eligibility & JV
  const [generalExperience, setGeneralExperience] = useState(
    selectedTender?.summary?.eligibility?.generalExperience ||
      'Minimum 5 years of commercial software experience.'
  );
  const [similarExperience, setSimilarExperience] = useState(
    selectedTender?.summary?.eligibility?.similarExperience ||
      'At least 2 completed contracts of similar complexity.'
  );
  const [similarProjectValue, setSimilarProjectValue] = useState(
    selectedTender?.summary?.eligibility?.similarProjectValue ||
      'Single contract benchmark of similar value.'
  );
  const [avgTurnover, setAvgTurnover] = useState(
    selectedTender?.summary?.eligibility?.avgTurnover ||
      'Audited turnover average across last 3 years.'
  );
  const [financialResources, setFinancialResources] = useState(
    selectedTender?.summary?.eligibility?.financialResources ||
      'Liquid assets or bank credit line.'
  );
  const [certification, setCertification] = useState(
    selectedTender?.summary?.eligibility?.certification ||
      'ISO 9001, ISO 27001 mandatory.'
  );
  const [localPresence, setLocalPresence] = useState(
    selectedTender?.summary?.eligibility?.localPresence ||
      'Local branch or registered support center.'
  );

  const [jvParticipation, setJvParticipation] = useState(
    selectedTender?.summary?.jv?.participation || 'Allowed per tender terms'
  );
  const [leadMember, setLeadMember] = useState(
    selectedTender?.summary?.jv?.leadMember || 'Must meet majority requirements'
  );
  const [memberRules, setMemberRules] = useState(
    selectedTender?.summary?.jv?.memberRules ||
      'Each partner must satisfy stated qualifications'
  );
  const [localPartner, setLocalPartner] = useState(
    selectedTender?.summary?.jv?.localPartner ||
      'Local partner required if foreign lead firm'
  );
  const [jvAgreement, setJvAgreement] = useState(
    selectedTender?.summary?.jv?.jvAgreement ||
      'Formally notarized joint venture deed'
  );

  // Documents, Personnel, Hardware
  const [documents, setDocuments] = useState<string[]>(
    selectedTender?.summary?.submissionDocuments || [
      'Valid Trade License & Incorporation Certificate',
      'Tax Clearance Certificate',
      'Audited Financial Statements (Last 3 Years)',
      'Client Completion Certificates',
    ]
  );

  const [personnel, setPersonnel] = useState<TenderPersonnelReq[]>(
    selectedTender?.summary?.personnel || [
      {
        position: 'Project Manager / Team Lead',
        qualification: 'B.Sc. in CSE + PMP',
        experience: '10+ Years',
        qty: '1',
      },
      {
        position: 'Solutions Architect',
        qualification: 'B.Sc. in IT',
        experience: '8+ Years',
        qty: '2',
      },
    ]
  );

  const [hardware, setHardware] = useState<TenderHardwareReq[]>(
    selectedTender?.summary?.hardware || [
      {
        equipment: 'Application Servers (2U Rackmount)',
        purpose: 'Production cluster hypervisors',
      },
      {
        equipment: 'Storage Array (NVMe SAN)',
        purpose: 'Database storage repository',
      },
    ]
  );

  // Dates, Risks, Management
  const [clarificationDeadline, setClarificationDeadline] = useState(
    selectedTender?.summary?.dates?.clarificationDeadline ||
      new Date().toISOString().split('T')[0]
  );
  const [openingDate, setOpeningDate] = useState(
    selectedTender?.summary?.dates?.openingDate ||
      new Date().toISOString().split('T')[0]
  );
  const [contractStart, setContractStart] = useState(
    selectedTender?.summary?.dates?.contractStart ||
      new Date().toISOString().split('T')[0]
  );

  const [risks, setRisks] = useState<TenderRiskPoint[]>(
    selectedTender?.summary?.risks || [
      {
        type: 'Tender Requirement',
        text: 'Mandatory bank guarantee solvency confirmation.',
      },
      {
        type: 'Analyst Observation',
        text: 'Tight submission timeline requiring prompt document collation.',
      },
    ]
  );

  const [management, setManagement] = useState<string[]>(
    selectedTender?.summary?.managementHighlights || [
      'Key opportunity in multilateral procurement domain.',
      'High technical scoring alignment with past track record.',
    ]
  );
  const [notes, setNotes] = useState(
    selectedTender?.summary?.notes ||
      'Pre-bid clarification meeting notes and internal briefing notes.'
  );

  // Sync form when selectedTender changes
  useEffect(() => {
    if (!selectedTender) return;
    setClassification(
      selectedTender.summary?.classification || 'SOFTWARE / IT RELATED'
    );
    setTenderTitle(selectedTender.title);
    setProjectName(selectedTender.summary?.projectName || '');
    setTenderId(selectedTender.id);
    setReferenceNo(selectedTender.referenceNo);
    setClient(selectedTender.organization);
    setCountry(selectedTender.country);
    setPortal(selectedTender.summary?.portal || 'e-GP / UNGM');
    setPublishedDate(
      selectedTender.summary?.publishedDate ||
        new Date().toISOString().split('T')[0]
    );
    setLastDate(
      selectedTender.submissionDeadline
        ? selectedTender.submissionDeadline.split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
    setSubmissionTime(selectedTender.summary?.submissionTime || '14:00 BST');
    setPriority(selectedTender.priority);
    setCategory(selectedTender.category);

    setMainIdea(
      selectedTender.summary?.mainIdea ||
        'Deployment of centralized enterprise software, cloud infrastructure, and technical support.'
    );
    setTenderSecurity(
      selectedTender.summary?.commercial?.tenderSecurity ||
        'Bank Guarantee Required'
    );
    setContractPeriod(
      selectedTender.summary?.commercial?.contractPeriod ||
        '12 Months + 24 Months O&M'
    );
    setTenderDocPrice(
      selectedTender.summary?.commercial?.tenderDocPrice || 'Free on Portal'
    );
    setPerformanceSecurity(
      selectedTender.summary?.commercial?.performanceSecurity ||
        '10% of Contract Value'
    );

    setTechnicalReqs(
      selectedTender.summary?.technicalReqs || [
        'Web-based zero-trust information system',
        'Database cluster replication',
      ]
    );
    setTechnologyMentioned(
      selectedTender.summary?.technologyMentioned || ['React', 'Python']
    );
    setOperationalReqs(
      selectedTender.summary?.operationalReqs || [
        '24/7 on-call technical support',
      ]
    );

    setGeneralExperience(
      selectedTender.summary?.eligibility?.generalExperience ||
        'Minimum 5 years commercial experience.'
    );
    setSimilarExperience(
      selectedTender.summary?.eligibility?.similarExperience ||
        'At least 2 completed contracts of similar complexity.'
    );
    setSimilarProjectValue(
      selectedTender.summary?.eligibility?.similarProjectValue ||
        'Single contract benchmark.'
    );
    setAvgTurnover(
      selectedTender.summary?.eligibility?.avgTurnover ||
        'Audited turnover average.'
    );
    setFinancialResources(
      selectedTender.summary?.eligibility?.financialResources ||
        'Liquid assets or bank credit line.'
    );
    setCertification(
      selectedTender.summary?.eligibility?.certification ||
        'ISO 9001, ISO 27001 mandatory.'
    );
    setLocalPresence(
      selectedTender.summary?.eligibility?.localPresence ||
        'Local support branch.'
    );

    setJvParticipation(
      selectedTender.summary?.jv?.participation || 'Allowed per terms'
    );
    setLeadMember(
      selectedTender.summary?.jv?.leadMember || 'Must meet majority'
    );
    setMemberRules(
      selectedTender.summary?.jv?.memberRules || 'Shared qualifications'
    );
    setLocalPartner(
      selectedTender.summary?.jv?.localPartner || 'Local partner mandate'
    );
    setJvAgreement(
      selectedTender.summary?.jv?.jvAgreement || 'Notarized legal deed'
    );

    setDocuments(
      selectedTender.summary?.submissionDocuments || [
        'Valid Trade License',
        'Tax Clearance Certificate',
      ]
    );
    setPersonnel(
      selectedTender.summary?.personnel || [
        {
          position: 'Project Lead',
          qualification: 'B.Sc. in CSE',
          experience: '8+ Years',
          qty: '1',
        },
      ]
    );
    setHardware(
      selectedTender.summary?.hardware || [
        { equipment: 'Application Servers', purpose: 'Production cluster' },
      ]
    );

    setClarificationDeadline(
      selectedTender.summary?.dates?.clarificationDeadline ||
        new Date().toISOString().split('T')[0]
    );
    setOpeningDate(
      selectedTender.summary?.dates?.openingDate ||
        new Date().toISOString().split('T')[0]
    );
    setContractStart(
      selectedTender.summary?.dates?.contractStart ||
        new Date().toISOString().split('T')[0]
    );

    setRisks(
      selectedTender.summary?.risks || [
        {
          type: 'Tender Requirement',
          text: 'Mandatory bank guarantee solvency confirmation.',
        },
      ]
    );
    setManagement(
      selectedTender.summary?.managementHighlights || [
        'Strategic tender opportunity.',
      ]
    );
    setNotes(selectedTender.summary?.notes || '');
  }, [selectedTenderId]);

  const filteredTenders = tenders.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      t.title.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.referenceNo.toLowerCase().includes(q) ||
      t.organization.toLowerCase().includes(q);
    const matchesClass =
      selectedClassificationFilter === 'ALL' ||
      t.summary?.classification === selectedClassificationFilter;
    return matchesQuery && matchesClass;
  });

  const handleCreateNewBlank = () => {
    const newId = `TDR-2026-REG-${Math.floor(100 + Math.random() * 900)}`;
    addTender({
      id: newId,
      referenceNo: `REF/${newId}`,
      title: 'New Tender Entry',
      organization: 'Issuing Authority / Client',
      country: 'Bangladesh / Regional',
      category: 'IT & Cloud Infrastructure',
      estimatedValue: 1000000,
      stage: 'DISCOVERED',
      priority: 'HIGH',
      submissionDeadline: new Date(Date.now() + 21 * 86400000).toISOString(),
      summary: {
        classification: 'SOFTWARE / IT RELATED',
        projectName: 'New Project Specification',
        portal: 'e-GP Portal',
        publishedDate: new Date().toISOString().split('T')[0],
        submissionTime: '14:00 BST',
        mainIdea: 'Detailed description of the tender requirement.',
      },
    });
    setSelectedTenderId(newId);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();

    addTender({
      id: tenderId,
      referenceNo,
      title: tenderTitle,
      organization: client,
      country,
      category,
      priority,
      submissionDeadline: new Date(lastDate).toISOString(),
      summary: {
        classification,
        projectName,
        portal,
        publishedDate,
        submissionTime,
        mainIdea,
        commercial: {
          tenderSecurity,
          contractPeriod,
          tenderDocPrice,
          performanceSecurity,
        },
        technicalReqs: technicalReqs.filter((s) => s.trim().length > 0),
        technologyMentioned: technologyMentioned.filter(
          (s) => s.trim().length > 0
        ),
        operationalReqs: operationalReqs.filter((s) => s.trim().length > 0),
        eligibility: {
          generalExperience,
          similarExperience,
          similarProjectValue,
          avgTurnover,
          financialResources,
          certification,
          localPresence,
        },
        jv: {
          participation: jvParticipation,
          leadMember,
          memberRules,
          localPartner,
          jvAgreement,
        },
        submissionDocuments: documents.filter((s) => s.trim().length > 0),
        personnel: personnel.filter((p) => p.position.trim().length > 0),
        hardware: hardware.filter((h) => h.equipment.trim().length > 0),
        dates: {
          clarificationDeadline,
          submissionDeadline: `${lastDate} ${submissionTime}`,
          openingDate,
          contractStart,
        },
        risks: risks.filter((r) => r.text.trim().length > 0),
        managementHighlights: management.filter((m) => m.trim().length > 0),
        notes,
      },
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDeleteCurrent = () => {
    if (!selectedTender) return;
    if (window.confirm(`Are you sure you want to permanently delete tender "${selectedTender.title}" (${selectedTender.id})?`)) {
      deleteTender(selectedTender.id);
      const remaining = tenders.filter((t) => t.id !== selectedTender.id);
      if (remaining.length > 0) {
        setSelectedTenderId(remaining[0].id);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Procurement Core</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">
              Tender Registry Console
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Tender Registry &amp; Data Entry
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Full data entry workspace matching the official Tender Summary
            template — manage all technical, statutory, and commercial parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold rounded-lg shadow-sm">
              <Check className="w-3.5 h-3.5" />
              <span>Entry Saved Successfully!</span>
            </div>
          )}
          {selectedTender && (
            <ExportDropdown tender={selectedTender} label="Export Entry" />
          )}
          <button
            onClick={handleCreateNewBlank}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Tender Entry</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split Workspace (Rail + Editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[750px]">
        {/* Left List Rail (Conditional Minimization) */}
        {!isRailCollapsed && (
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden transition-all duration-300">
            {/* Rail Header with Minimizer */}
            <div className="p-3.5 border-b border-[#F1F5F9] space-y-2.5 bg-[#F8FAFC]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider">
                  Tender Explorer ({filteredTenders.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsRailCollapsed(true)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
                  title="Minimize search & list panel"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, ref no. or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* Classification Filter */}
              <div className="flex items-center gap-1 overflow-x-auto text-[10px] pb-1">
              <button
                onClick={() => setSelectedClassificationFilter('ALL')}
                className={`px-2 py-0.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                  selectedClassificationFilter === 'ALL'
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                All ({tenders.length})
              </button>
              {CLASSIFICATIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedClassificationFilter(c)}
                  className={`px-2 py-0.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                    selectedClassificationFilter === c
                      ? 'bg-[#0F172A] text-white'
                      : 'bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {c.includes('SOFTWARE') ? 'Software' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Entry Cards */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F1F5F9] p-2 space-y-1">
            {filteredTenders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#94A3B8]">
                No entries match your search.
              </div>
            ) : (
              filteredTenders.map((t) => {
                const isSelected = t.id === selectedTenderId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTenderId(t.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-l-4 border-l-[#2563EB] shadow-xs'
                        : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] mb-1">
                      <span className="font-bold text-[#2563EB]">{t.id}</span>
                      <span>{t.referenceNo}</span>
                    </div>

                    <h4 className="font-semibold text-xs text-[#0F172A] line-clamp-2 leading-snug">
                      {t.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2">
                      <span className="truncate max-w-[140px]">
                        {t.organization}
                      </span>
                      <span className="font-mono text-[10px] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                        Due {new Date(t.submissionDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

        {/* Right Editor Panel (8 or 12 Cols) */}
        <div
          className={`${
            isRailCollapsed ? 'lg:col-span-12' : 'lg:col-span-8'
          } bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden transition-all duration-300`}
        >
          {/* Editor Header Bar */}
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              {isRailCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsRailCollapsed(false)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  title="Expand search & list panel"
                >
                  <PanelLeftOpen className="w-4 h-4 text-[#2563EB]" />
                  <span>Tender List ({filteredTenders.length})</span>
                </button>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0F172A] bg-white border border-[#CBD5E1] px-2 py-0.5 rounded">
                    {selectedTender?.id}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    Ref: {selectedTender?.referenceNo}
                  </span>
                </div>
                <h2 className="font-display text-base font-bold text-[#0F172A] mt-1 line-clamp-1">
                  {tenderTitle || 'Untitled Tender Entry'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteCurrent}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                title="Delete this tender"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <Link
                to={`/tenders/${selectedTender?.id}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold transition-colors"
              >
                <span>Workspace</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={handleSaveEntry}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Entry</span>
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center border-b border-[#E2E8F0] bg-white px-6 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveEditorTab('BASIC')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'BASIC'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. Basic Information</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('SCOPE')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'SCOPE'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>2. Scope &amp; Commercial</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('ELIGIBILITY')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'ELIGIBILITY'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>3. Eligibility &amp; JV</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('STAFFING')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'STAFFING'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>4. Staff &amp; Hardware</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('RISKS')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeEditorTab === 'RISKS'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>5. Dates, Risks &amp; Notes</span>
            </button>
          </div>

          {/* Form Scroll Body */}
          <form
            onSubmit={handleSaveEntry}
            className="flex-1 overflow-y-auto p-6 space-y-6 text-xs"
          >
            {/* TAB 1: BASIC INFORMATION */}
            {activeEditorTab === 'BASIC' && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block font-bold text-[#0F172A] mb-1.5">
                    Tender Domain Classification
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CLASSIFICATIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setClassification(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          classification === c
                            ? 'bg-[#0F172A] text-white shadow-sm ring-2 ring-[#0F172A]/20'
                            : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Tender Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={tenderTitle}
                      onChange={(e) => setTenderTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Tender ID *
                    </label>
                    <input
                      type="text"
                      value={tenderId}
                      onChange={(e) => setTenderId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Reference No.
                    </label>
                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Procurement Portal
                    </label>
                    <input
                      type="text"
                      value={portal}
                      onChange={(e) => setPortal(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Country / Jurisdiction *
                    </label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Client / Issuing Authority *
                    </label>
                    <input
                      type="text"
                      required
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      SOW Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    >
                      <option value="IT & Cloud Infrastructure">
                        IT &amp; Cloud Infrastructure
                      </option>
                      <option value="Healthcare Systems">
                        Healthcare Systems
                      </option>
                      <option value="Cybersecurity & Energy">
                        Cybersecurity &amp; Energy
                      </option>
                      <option value="Identity & Security">
                        Identity &amp; Security
                      </option>
                      <option value="Government Software">
                        Government Software
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Published Date
                    </label>
                    <input
                      type="date"
                      value={publishedDate}
                      onChange={(e) => setPublishedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Last Date (Submission Deadline) *
                    </label>
                    <input
                      type="date"
                      required
                      value={lastDate}
                      onChange={(e) => setLastDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Submission Cutoff Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={submissionTime}
                      onChange={(e) => setSubmissionTime(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Operational Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as TenderPriority)
                    }
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                  >
                    <option value="CRITICAL">
                      CRITICAL (Window &lt; 48h / Urgent Gate)
                    </option>
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MEDIUM">MEDIUM Priority</option>
                    <option value="LOW">LOW Priority</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 2: SCOPE & COMMERCIAL */}
            {activeEditorTab === 'SCOPE' && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">
                    Main Idea &amp; Scope Objectives
                  </label>
                  <textarea
                    rows={3}
                    value={mainIdea}
                    onChange={(e) => setMainIdea(e.target.value)}
                    className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Tender Security / EMD
                    </label>
                    <input
                      type="text"
                      value={tenderSecurity}
                      onChange={(e) => setTenderSecurity(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Contract / Service Period
                    </label>
                    <input
                      type="text"
                      value={contractPeriod}
                      onChange={(e) => setContractPeriod(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Tender Document Price
                    </label>
                    <input
                      type="text"
                      value={tenderDocPrice}
                      onChange={(e) => setTenderDocPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Performance Security
                    </label>
                    <input
                      type="text"
                      value={performanceSecurity}
                      onChange={(e) => setPerformanceSecurity(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#0F172A]">
                      Technical Requirements
                    </label>
                    <button
                      type="button"
                      onClick={() => setTechnicalReqs([...technicalReqs, ''])}
                      className="text-[#2563EB] font-semibold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add line</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {technicalReqs.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => {
                            const updated = [...technicalReqs];
                            updated[idx] = e.target.value;
                            setTechnicalReqs(updated);
                          }}
                          className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setTechnicalReqs(
                              technicalReqs.filter((_, i) => i !== idx)
                            )
                          }
                          className="p-1 text-[#94A3B8] hover:text-[#DC2626]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ELIGIBILITY & JV */}
            {activeEditorTab === 'ELIGIBILITY' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      General Experience
                    </label>
                    <input
                      type="text"
                      value={generalExperience}
                      onChange={(e) => setGeneralExperience(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Similar Experience
                    </label>
                    <input
                      type="text"
                      value={similarExperience}
                      onChange={(e) => setSimilarExperience(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Similar Project Minimum Value
                    </label>
                    <input
                      type="text"
                      value={similarProjectValue}
                      onChange={(e) => setSimilarProjectValue(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Average Annual Turnover
                    </label>
                    <input
                      type="text"
                      value={avgTurnover}
                      onChange={(e) => setAvgTurnover(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Financial Resources / Liquid Assets
                    </label>
                    <input
                      type="text"
                      value={financialResources}
                      onChange={(e) => setFinancialResources(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Required Quality Certifications
                    </label>
                    <input
                      type="text"
                      value={certification}
                      onChange={(e) => setCertification(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">
                    Local Presence Requirements
                  </label>
                  <input
                    type="text"
                    value={localPresence}
                    onChange={(e) => setLocalPresence(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: STAFFING & HARDWARE */}
            {activeEditorTab === 'STAFFING' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Submission Documents Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#0F172A]">
                      Documents Required in Submission
                    </label>
                    <button
                      type="button"
                      onClick={() => setDocuments([...documents, ''])}
                      className="text-[#2563EB] font-semibold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Document</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={doc}
                          onChange={(e) => {
                            const updated = [...documents];
                            updated[idx] = e.target.value;
                            setDocuments(updated);
                          }}
                          className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDocuments(documents.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-[#94A3B8] hover:text-[#DC2626]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personnel Table */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#0F172A]">
                      CV &amp; Key Personnel Requirements
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setPersonnel([
                          ...personnel,
                          {
                            position: '',
                            qualification: '',
                            experience: '',
                            qty: '1',
                          },
                        ])
                      }
                      className="text-[#2563EB] font-semibold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Position</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] text-[#64748B]">
                        <tr>
                          <th className="p-2">Position Title</th>
                          <th className="p-2">Min. Qualification</th>
                          <th className="p-2">Experience</th>
                          <th className="p-2 w-14 text-center">Qty</th>
                          <th className="p-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {personnel.map((p, idx) => (
                          <tr key={idx}>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={p.position}
                                onChange={(e) => {
                                  const updated = [...personnel];
                                  updated[idx].position = e.target.value;
                                  setPersonnel(updated);
                                }}
                                className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={p.qualification}
                                onChange={(e) => {
                                  const updated = [...personnel];
                                  updated[idx].qualification = e.target.value;
                                  setPersonnel(updated);
                                }}
                                className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={p.experience}
                                onChange={(e) => {
                                  const updated = [...personnel];
                                  updated[idx].experience = e.target.value;
                                  setPersonnel(updated);
                                }}
                                className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs"
                              />
                            </td>
                            <td className="p-1.5 text-center font-mono">
                              <input
                                type="text"
                                value={p.qty}
                                onChange={(e) => {
                                  const updated = [...personnel];
                                  updated[idx].qty = e.target.value;
                                  setPersonnel(updated);
                                }}
                                className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs text-center"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setPersonnel(
                                    personnel.filter((_, i) => i !== idx)
                                  )
                                }
                                className="text-[#94A3B8] hover:text-[#DC2626]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DATES & RISKS */}
            {activeEditorTab === 'RISKS' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Clarification Deadline
                    </label>
                    <input
                      type="date"
                      value={clarificationDeadline}
                      onChange={(e) => setClarificationDeadline(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Bid Opening Date
                    </label>
                    <input
                      type="date"
                      value={openingDate}
                      onChange={(e) => setOpeningDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">
                      Expected Contract Start
                    </label>
                    <input
                      type="date"
                      value={contractStart}
                      onChange={(e) => setContractStart(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#0F172A]">
                      Key Risks / Important Points
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setRisks([
                          ...risks,
                          { type: 'Tender Requirement', text: '' },
                        ])
                      }
                      className="text-[#2563EB] font-semibold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Risk Point</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {risks.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={r.type}
                          onChange={(e) => {
                            const updated = [...risks];
                            updated[idx].type = e.target.value as
                              | 'Tender Requirement'
                              | 'Analyst Observation';
                            setRisks(updated);
                          }}
                          className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] shrink-0"
                        >
                          <option value="Tender Requirement">
                            Tender Requirement
                          </option>
                          <option value="Analyst Observation">
                            Analyst Observation
                          </option>
                        </select>
                        <input
                          type="text"
                          value={r.text}
                          placeholder="Point senior management needs to know..."
                          onChange={(e) => {
                            const updated = [...risks];
                            updated[idx].text = e.target.value;
                            setRisks(updated);
                          }}
                          className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setRisks(risks.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-[#94A3B8] hover:text-[#DC2626]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0F172A] mb-1">
                    Internal Remarks &amp; Debrief Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                  />
                </div>
              </div>
            )}

            {/* Bottom Save & Action Row */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between bg-white shrink-0">
              <div className="text-xs text-[#64748B]">
                Status:{' '}
                <span className="font-semibold text-[#0F172A]">
                  {selectedTender?.stage}
                </span>{' '}
                • Priority:{' '}
                <span className="font-semibold text-[#2563EB]">
                  {selectedTender?.priority}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B] shadow-sm transition-colors text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
