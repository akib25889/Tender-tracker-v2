import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTenders } from '../context/TenderContext';
import { UserRole, TenderReviewTier } from '../types/tender';
import {
  MessageSquare,
  Send,
  Trash2,
  Search,
  Hash,
  Briefcase,
  Users,
  AtSign,
  ArrowRight,
  Clock,
  Smile,
  CheckCircle2,
  Building2,
  Calendar,
  ShieldCheck,
  PanelRightClose,
  PanelRightOpen,
  X,
  ThumbsUp,
} from 'lucide-react';

const QUICK_REPLIES = [
  'Acknowledged, I will review this.',
  'Scope & architecture verified.',
  'Commercials updated in pricing sheet.',
  'Bank guarantee request initiated.',
  'This is blocked pending client clarification.',
  'Approved from my side.',
];

const STARTER_PROMPTS = [
  'Review SOW compliance and deliverables timeline',
  'Verify bank solvency certificate and BG issuance',
  'Check Tier-1 technical review sign-off status',
  'Confirm foreign currency conversion rate for BDT',
];

const QUICK_EMOJIS = ['👍', '✅', '🎯', '🙌', '⚠️', '💬', '🚀', '🔒'];

interface GeneralMessage {
  id: string;
  channelId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  createdAt: string;
  reactions?: Record<string, number>;
}

const DEFAULT_GENERAL_CHANNELS = [
  {
    id: 'general-ops',
    name: 'general-operations',
    label: 'General Bid Operations',
    description: 'Cross-functional announcements, SLA notices, and team coordination.',
    unreadCount: 2,
  },
  {
    id: 'tech-architecture',
    name: 'technical-solutions',
    label: 'Technical Solutions & SOW',
    description: 'Scope of work reviews, cloud architecture diagrams, and cybersecurity accreditation.',
    unreadCount: 5,
  },
  {
    id: 'commercial-pricing',
    name: 'commercial-pricing',
    label: 'Commercial & Pricing Triage',
    description: 'BOQ pricing models, gross margins, tender securities, and bank guarantees.',
    unreadCount: 0,
  },
  {
    id: 'legal-compliance',
    name: 'legal-compliance',
    label: 'Legal & Risk Mitigation',
    description: 'Statutory trade licenses, JV liability clauses, and liquidated damages.',
    unreadCount: 1,
  },
];

const INITIAL_GENERAL_MESSAGES: GeneralMessage[] = [
  {
    id: 'MSG-001',
    channelId: 'general-ops',
    authorName: 'Sarah Jenkins',
    authorRole: 'BUSINESS_HEAD',
    authorAvatar: 'SJ',
    content: 'Team, please review approaching Q3 submission deadlines. Ensure all statutory certificates in the Master Vault are renewed before Friday.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    reactions: { '👍': 3, '✅': 2 },
  },
  {
    id: 'MSG-002',
    channelId: 'general-ops',
    authorName: 'Dr. Marcus Vance',
    authorRole: 'EXECUTIVE_MANAGER',
    authorAvatar: 'MV',
    content: 'Understood. Technical architecture for the ERP modernization tender is currently at 88% readiness and on track for Tier 1 sign-off.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    reactions: { '🚀': 2 },
  },
  {
    id: 'MSG-003',
    channelId: 'tech-architecture',
    authorName: 'Dr. Marcus Vance',
    authorRole: 'EXECUTIVE_MANAGER',
    authorAvatar: 'MV',
    content: 'Confirmed that sovereign cloud specifications require dual-zone disaster recovery nodes. Adding this to the methodology section.',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    reactions: { '🎯': 3 },
  },
  {
    id: 'MSG-004',
    channelId: 'commercial-pricing',
    authorName: 'Tariq Al-Mansoor',
    authorRole: 'SENIOR_MANAGER',
    authorAvatar: 'TA',
    content: 'Foreign exchange rate for BDT conversions has been aligned to 122. Bank solvency verification letter is ready in the Master Vault.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    reactions: { '👍': 4 },
  },
  {
    id: 'MSG-005',
    channelId: 'legal-compliance',
    authorName: 'Elena Rostova',
    authorRole: 'TENDER_ANALYST',
    authorAvatar: 'ER',
    content: 'JV framework agreement audited and confirmed compliant with UN procurement guidelines.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    reactions: { '✅': 2 },
  },
];

const ROLE_BADGES: Record<UserRole, { bg: string; text: string; border: string; label: string }> = {
  BUSINESS_HEAD: {
    label: 'Business Head',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  EXECUTIVE_MANAGER: {
    label: 'Executive Mgr',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  SENIOR_MANAGER: {
    label: 'Senior Mgr',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  TENDER_ANALYST: {
    label: 'Tender Analyst',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
};

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DISCOVERED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  SCREENING: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  UNDER_ANALYSIS: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  PREPARATION: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  INTERNAL_REVIEW: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  SUBMITTED: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  AWARDED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  LOST: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  DECLINED: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

export const ChatDiscussionsPage: React.FC = () => {
  const { tenders, addComment, deleteComment, currentUser, teamMembers } = useTenders();

  // Navigation tab: 'channels' or 'tenders'
  const [navTab, setNavTab] = useState<'channels' | 'tenders'>('channels');
  const [activeChannelId, setActiveChannelId] = useState<string>('general-ops');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tenderFilter, setTenderFilter] = useState<'ALL' | 'PREPARATION' | 'ACTIVE'>('ALL');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // General Chat Messages stored in localStorage
  const [generalMessages, setGeneralMessages] = useState<GeneralMessage[]>(() => {
    const saved = localStorage.getItem('tendertracker_general_chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_GENERAL_MESSAGES;
  });

  useEffect(() => {
    localStorage.setItem('tendertracker_general_chat', JSON.stringify(generalMessages));
  }, [generalMessages]);

  useEffect(() => {
    if (!activeChannelId.startsWith('tdr-')) {
      fetch(`http://127.0.0.1:8000/api/chat/channels/${activeChannelId}/messages`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: GeneralMessage[] = data.map((m: any) => ({
              id: m.id,
              channelId: m.channel_id,
              authorName: m.sender_name,
              authorRole: m.sender_role,
              authorAvatar: m.sender_avatar || 'SJ',
              content: m.content,
              createdAt: m.created_at,
            }));
            setGeneralMessages((prev) => {
              const otherChannels = prev.filter((m) => m.channelId !== activeChannelId);
              return [...otherChannels, ...mapped];
            });
          }
        })
        .catch(() => {});
    }
  }, [activeChannelId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChannelId, generalMessages, tenders]);

  // Is the active channel a tender project or a general channel?
  const isTenderChannel = activeChannelId.startsWith('tdr-');
  const selectedTender = isTenderChannel
    ? tenders.find((t) => `tdr-${t.id}` === activeChannelId)
    : null;
  const selectedGeneralChannel = !isTenderChannel
    ? DEFAULT_GENERAL_CHANNELS.find((c) => c.id === activeChannelId) || DEFAULT_GENERAL_CHANNELS[0]
    : null;

  // Messages to display
  const currentMessages: GeneralMessage[] = isTenderChannel && selectedTender
    ? (selectedTender.comments || []).map((c) => ({
        id: c.id,
        channelId: activeChannelId,
        authorName: c.authorName,
        authorRole: c.authorRole,
        authorAvatar: c.authorAvatar || 'TM',
        content: c.content,
        createdAt: c.createdAt,
        reactions: undefined,
      }))
    : generalMessages.filter((m) => m.channelId === activeChannelId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (isTenderChannel && selectedTender) {
      addComment(selectedTender.id, inputText.trim());
    } else {
      const text = inputText.trim();
      const tempId = `MSG-${Date.now()}`;
      const newMsg: GeneralMessage = {
        id: tempId,
        channelId: activeChannelId,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        authorAvatar: currentUser.avatar,
        content: text,
        createdAt: new Date().toISOString(),
      };
      setGeneralMessages((prev) => [...prev, newMsg]);

      fetch(`http://127.0.0.1:8000/api/chat/channels/${activeChannelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          sender_name: currentUser.name,
          sender_role: currentUser.role,
          sender_avatar: currentUser.avatar,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((saved) => {
          if (saved) {
            setGeneralMessages((prev) =>
              prev.map((m) =>
                m.id === tempId ? { ...m, id: saved.id, createdAt: saved.created_at } : m
              )
            );
          }
        })
        .catch(() => {});
    }

    setInputText('');
  };

  const handleDeleteMessage = (msgId: string) => {
    if (isTenderChannel && selectedTender) {
      deleteComment(selectedTender.id, msgId);
    } else {
      setGeneralMessages((prev) => prev.filter((m) => m.id !== msgId));
    }
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setGeneralMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions || {};
        const count = currentReactions[emoji] || 0;
        return {
          ...m,
          reactions: {
            ...currentReactions,
            [emoji]: count + 1,
          },
        };
      })
    );
  };

  const handleTagMember = (name: string) => {
    setInputText((prev) => `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}@${name} `);
  };

  const insertIntoDraft = (value: string) => {
    setInputText((prev) => `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}${value}`);
  };

  const formatTimestamp = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Today at ${timeStr}` : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${timeStr}`;
  };

  // Filter tenders based on search query and category filter
  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (tenderFilter === 'PREPARATION') {
      return t.stage === 'PREPARATION';
    }
    if (tenderFilter === 'ACTIVE') {
      return ['UNDER_ANALYSIS', 'PREPARATION', 'INTERNAL_REVIEW'].includes(t.stage);
    }
    return true;
  });

  // Filter channels based on search query
  const filteredChannels = DEFAULT_GENERAL_CHANNELS.filter(
    (c) =>
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine squad members for right panel
  const activeSquad = selectedTender
    ? teamMembers.filter(
        (m) =>
          (m.activeTenderRoles && m.activeTenderRoles[selectedTender.id]) ||
          m.role === 'BUSINESS_HEAD' ||
          m.role === 'EXECUTIVE_MANAGER'
      )
    : teamMembers.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-blue-600">Collaboration</span>
            <span>/</span>
            <span className="text-slate-700">Real-Time Communications</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Executive Team Chat &amp; Tender Discussions</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Live Hub
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-functional triage, technical SOW clarification, pricing sign-offs, and tender-specific debriefs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser.avatar}
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white animate-pulse" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-xs leading-none">{currentUser.name}</div>
              <div className="text-[10px] text-blue-600 font-medium leading-none mt-0.5">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Enterprise Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row h-[760px] overflow-hidden">
        {/* LEFT COLUMN: Channels & Tenders Navigator */}
        <div className="w-full lg:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Segmented Switcher Tabs */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setNavTab('channels')}
                className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  navTab === 'channels'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                <span>Channels</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {DEFAULT_GENERAL_CHANNELS.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setNavTab('tenders')}
                className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  navTab === 'tenders'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Tenders</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-mono font-bold">
                  {tenders.length}
                </span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative mt-2.5">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={navTab === 'channels' ? 'Search team channels...' : 'Search by ID, client, or title...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Chips (for Tenders tab) */}
            {navTab === 'tenders' && (
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setTenderFilter('ALL')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    tenderFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({tenders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTenderFilter('PREPARATION')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    tenderFilter === 'PREPARATION'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Prep
                </button>
                <button
                  type="button"
                  onClick={() => setTenderFilter('ACTIVE')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    tenderFilter === 'ACTIVE'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Active Pipeline
                </button>
              </div>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
            {navTab === 'channels' ? (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Channels
                </div>
                {filteredChannels.map((channel) => {
                  const isSelected = activeChannelId === channel.id;
                  const count = generalMessages.filter((m) => m.channelId === channel.id).length;
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setActiveChannelId(channel.id)}
                      className={`w-full flex items-start justify-between p-2.5 rounded-lg text-left transition-all border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/70'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <Hash className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-blue-600'}`} />
                          <span className="font-semibold text-xs truncate">{channel.label}</span>
                        </div>
                        <p
                          className={`text-[11px] line-clamp-1 mt-1 ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {channel.description}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
                          isSelected
                            ? 'bg-slate-800 text-cyan-300'
                            : count > 0
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Tender Discussion Threads</span>
                  <span className="font-mono">{filteredTenders.length}</span>
                </div>
                {filteredTenders.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">No tenders match your filter</div>
                ) : (
                  filteredTenders.map((t) => {
                    const channelId = `tdr-${t.id}`;
                    const isSelected = activeChannelId === channelId;
                    const commentsCount = t.comments?.length || 0;
                    const stageBadge = STAGE_COLORS[t.stage] || STAGE_COLORS.PREPARATION;

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveChannelId(channelId)}
                        className={`w-full flex items-start justify-between p-2.5 rounded-lg text-left transition-all border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/70'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono text-[11px] font-bold truncate tracking-tight">{t.id}</span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                                isSelected ? 'bg-slate-800 text-slate-200 border-slate-700' : `${stageBadge.bg} ${stageBadge.text} ${stageBadge.border}`
                              }`}
                            >
                              {t.stage}
                            </span>
                          </div>
                          <p
                            className={`text-xs font-medium truncate ${
                              isSelected ? 'text-white' : 'text-slate-800'
                            }`}
                          >
                            {t.title}
                          </p>
                          <p
                            className={`text-[10px] truncate mt-0.5 ${
                              isSelected ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {t.organization}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
                            isSelected
                              ? 'bg-slate-800 text-cyan-300'
                              : commentsCount > 0
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {commentsCount}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Live Discussion Stream */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {/* Active Channel Header */}
          <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                {isTenderChannel ? <Briefcase className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-slate-900 truncate">
                    {isTenderChannel && selectedTender
                      ? `${selectedTender.id}: ${selectedTender.title}`
                      : selectedGeneralChannel?.label}
                  </h2>
                  {isTenderChannel && selectedTender && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        STAGE_COLORS[selectedTender.stage]?.bg || 'bg-blue-50'
                      } ${STAGE_COLORS[selectedTender.stage]?.text || 'text-blue-700'} ${
                        STAGE_COLORS[selectedTender.stage]?.border || 'border-blue-200'
                      }`}
                    >
                      {selectedTender.stage}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {isTenderChannel && selectedTender
                    ? `Client: ${selectedTender.organization} • Deadline: ${selectedTender.submissionDeadline || 'Open'}`
                    : selectedGeneralChannel?.description}
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {isTenderChannel && selectedTender && (
                <Link
                  to={`/tenders/${selectedTender.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-blue-600 font-semibold text-xs rounded-lg transition-all shadow-2xs"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => setShowRightPanel((prev) => !prev)}
                className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  showRightPanel
                    ? 'bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
                title={showRightPanel ? 'Hide context panel' : 'Show context panel'}
              >
                {showRightPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Messages Feed Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">No messages in this discussion thread yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mt-1">
                    Start the discussion by posting an operational update, risk observation, or asking for squad alignment.
                  </p>
                </div>
                {/* Starter Prompt Pills */}
                <div className="pt-2 flex flex-wrap justify-center gap-1.5 max-w-md">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => insertIntoDraft(prompt)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-full text-[11px] text-slate-600 transition-all shadow-2xs"
                    >
                      + {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              currentMessages.map((msg) => {
                const badge = ROLE_BADGES[msg.authorRole] || ROLE_BADGES.TENDER_ANALYST;
                const isAuthor = msg.authorName === currentUser.name;
                const canDelete = isAuthor || currentUser.role === 'BUSINESS_HEAD';

                return (
                  <div
                    key={msg.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                          {msg.authorAvatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{msg.authorName}</span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimestamp(msg.createdAt)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleAddReaction(msg.id, '👍')}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title="Like"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTagMember(msg.authorName)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title="Reply / Mention"
                        >
                          <AtSign className="w-3.5 h-3.5" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete remark"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 pl-10 text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Reactions Pill Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="mt-2 pl-10 flex items-center gap-1.5">
                        {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <span
                            key={emoji}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] text-slate-500">{count}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Mention & Quick Replies Bar */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <AtSign className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-600 text-[11px] shrink-0">Tag:</span>
              {teamMembers.slice(0, 5).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleTagMember(m.name)}
                  className="bg-white hover:bg-blue-50 hover:text-blue-700 px-2 py-0.5 rounded border border-slate-200 text-[11px] font-medium text-slate-600 transition-colors shrink-0 shadow-2xs"
                >
                  @{m.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 shrink-0">Quick reply:</span>
              {QUICK_REPLIES.slice(0, 3).map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => insertIntoDraft(reply)}
                  className="bg-white hover:bg-blue-50 hover:text-blue-700 px-2 py-0.5 rounded border border-slate-200 text-[11px] text-slate-600 transition-colors shrink-0 shadow-2xs"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Integrated Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200 bg-white">
            <div className="flex items-end gap-2.5">
              <div className="flex-1 relative">
                <textarea
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={`Post message to ${
                    isTenderChannel && selectedTender ? selectedTender.id : `#${selectedGeneralChannel?.name}`
                  } as ${currentUser.name}... (Press Enter to send)`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white resize-none transition-all leading-relaxed"
                />

                {/* Left Attachment / Emoji triggers inside input bar */}
                <div className="flex items-center gap-1 mt-1">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker((open) => !open)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Insert emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-10 left-0 z-30 flex gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                        {QUICK_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              insertIntoDraft(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="rounded-md p-1 text-base transition-colors hover:bg-blue-50"
                            title={`Insert ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400">
                    Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">Shift+Enter</kbd> for newline
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl shadow-xs transition-all shrink-0 flex items-center justify-center"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Tender Context & Bid Squad */}
        {showRightPanel && (
          <div className="hidden xl:flex w-72 border-l border-slate-200 flex-col bg-slate-50/50">
            <div className="p-3.5 border-b border-slate-200 bg-white font-bold text-xs text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isTenderChannel ? <Briefcase className="w-4 h-4 text-blue-600" /> : <ShieldCheck className="w-4 h-4 text-blue-600" />}
                <span>{isTenderChannel ? 'Tender Intelligence' : 'Channel Mandate'}</span>
              </div>
              <span className="text-[10px] font-normal text-slate-400">Context</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
              {/* If Tender Channel: Quick Spec Card */}
              {isTenderChannel && selectedTender ? (
                <>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Procuring Client
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5 font-bold text-slate-900 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{selectedTender.organization}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Estimated Value</span>
                        <span className="font-mono font-bold text-slate-900">
                          ${selectedTender.estimatedValue.toLocaleString()}
                        </span>
                        {selectedTender.estimatedValueBdt && (
                          <span className="block text-[9px] text-slate-500 font-mono">
                            ৳{(selectedTender.estimatedValueBdt / 10000000).toFixed(2)} Cr
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Readiness</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                selectedTender.readinessScore >= 70
                                  ? 'bg-emerald-500'
                                  : selectedTender.readinessScore >= 40
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${selectedTender.readinessScore}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-slate-900 text-[10px]">
                            {selectedTender.readinessScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block text-[10px] mb-1">Submission Deadline</span>
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{selectedTender.submissionDeadline || 'Date not specified'}</span>
                      </div>
                    </div>

                    <Link
                      to={`/tenders/${selectedTender.id}`}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors"
                    >
                      <span>Open Tender Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Tender Sign-offs & Milestones */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Key Review Gates</span>
                    </span>
                    <div className="space-y-1.5 text-[11px]">
                      {selectedTender.reviews && selectedTender.reviews.length > 0 ? (
                        selectedTender.reviews.map((tier: TenderReviewTier) => (
                          <div
                            key={tier.tierNumber}
                            className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100"
                          >
                            <span className="text-slate-700 truncate font-medium">{tier.name}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                tier.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tier.status === 'ACTION_REQUIRED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {tier.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 text-[11px] italic">No gate sign-offs logged yet</div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Channel Mandate Information */
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                  <span className="font-bold text-slate-900 text-xs block">Operational Mandate</span>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {selectedGeneralChannel?.description}
                  </p>
                  <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px] text-blue-800 space-y-1">
                    <span className="font-bold block">SLA Commitment:</span>
                    <p className="text-[10px] leading-normal text-blue-700">
                      • Response time SLA: &lt; 2 hours during active bids.
                      <br />• All compliance risks must be tagged with mitigation owners.
                    </p>
                  </div>
                </div>
              )}

              {/* Assigned Bid Squad */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isTenderChannel ? 'Assigned Bid Squad' : 'Active Team Leads'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{activeSquad.length}</span>
                </div>

                <div className="space-y-1.5">
                  {activeSquad.map((m) => {
                    const isCurrent = m.id === currentUser.id;
                    const roleBadge = ROLE_BADGES[m.role] || ROLE_BADGES.TENDER_ANALYST;

                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                              {m.avatar}
                            </div>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 text-xs truncate">
                              {m.name} {isCurrent && <span className="text-slate-400 font-normal">(You)</span>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[8px] font-semibold px-1 py-0.2 rounded border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                                {roleBadge.label}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate">• {m.title}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTagMember(m.name)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title={`Mention ${m.name}`}
                        >
                          <AtSign className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
