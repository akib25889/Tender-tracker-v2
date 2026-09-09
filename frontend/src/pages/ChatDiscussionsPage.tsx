import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTenders } from '../context/TenderContext';
import { UserRole } from '../types/tender';
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
} from 'lucide-react';

const QUICK_REPLIES = [
  'Acknowledged, I will review this.',
  'Thanks, I will follow up shortly.',
  'This is blocked pending additional information.',
  'Approved from my side.',
];

const QUICK_EMOJIS = ['👍', '✅', '🎯', '🙌', '⚠️', '💬'];

interface GeneralMessage {
  id: string;
  channelId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

const DEFAULT_GENERAL_CHANNELS = [
  {
    id: 'general-ops',
    name: 'general-operations',
    label: 'General Bid Operations',
    description: 'Cross-functional announcements, SLA notices, and team coordination.',
  },
  {
    id: 'tech-architecture',
    name: 'technical-solutions',
    label: 'Technical Solutions & Scope of Work (SOW)',
    description: 'Scope of work reviews, cloud architecture diagrams, and cybersecurity accreditation.',
  },
  {
    id: 'commercial-pricing',
    name: 'commercial-pricing',
    label: 'Commercial & Pricing Triage',
    description: 'BOQ pricing models, gross margins, tender securities, and bank guarantees.',
  },
  {
    id: 'legal-compliance',
    name: 'legal-compliance',
    label: 'Legal & Risk Mitigation',
    description: 'Statutory trade licenses, JV liability clauses, and liquidated damages.',
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
  },
  {
    id: 'MSG-002',
    channelId: 'general-ops',
    authorName: 'Dr. Marcus Vance',
    authorRole: 'EXECUTIVE_MANAGER',
    authorAvatar: 'MV',
    content: 'Understood. Technical architecture for the ERP modernization tender is currently at 88% readiness and on track for Tier 1 sign-off.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'MSG-003',
    channelId: 'tech-architecture',
    authorName: 'Dr. Marcus Vance',
    authorRole: 'EXECUTIVE_MANAGER',
    authorAvatar: 'MV',
    content: 'Confirmed that sovereign cloud specifications require dual-zone disaster recovery nodes. Adding this to the methodology section.',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'MSG-004',
    channelId: 'commercial-pricing',
    authorName: 'Tariq Al-Mansoor',
    authorRole: 'SENIOR_MANAGER',
    authorAvatar: 'TA',
    content: 'Foreign exchange rate for BDT conversions has been aligned to 122. Bank solvency verification letter is ready in the Master Vault.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'MSG-005',
    channelId: 'legal-compliance',
    authorName: 'Elena Rostova',
    authorRole: 'TENDER_ANALYST',
    authorAvatar: 'ER',
    content: 'JV framework agreement audited and confirmed compliant with UN procurement guidelines.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const ROLE_BADGES: Record<UserRole, { bg: string; text: string; border: string; label: string }> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#DC2626]',
    border: 'border-[#FECACA]',
  },
  BUSINESS_HEAD: {
    label: 'Business Head',
    bg: 'bg-[#F3E8FF]',
    text: 'text-[#7E22CE]',
    border: 'border-[#D8B4FE]',
  },
  EXECUTIVE_MANAGER: {
    label: 'Executive Mgr',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    border: 'border-[#BFDBFE]',
  },
  SENIOR_MANAGER: {
    label: 'Senior Mgr',
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
  },
  TENDER_ANALYST: {
    label: 'Tender Analyst',
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    border: 'border-[#BBF7D0]',
  },
};

export const ChatDiscussionsPage: React.FC = () => {
  const { tenders, addComment, deleteComment, currentUser, teamMembers } = useTenders();

  const [activeChannelId, setActiveChannelId] = useState<string>('general-ops');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
  const currentMessages = isTenderChannel && selectedTender
    ? (selectedTender.comments || []).map((c) => ({
        id: c.id,
        channelId: activeChannelId,
        authorName: c.authorName,
        authorRole: c.authorRole,
        authorAvatar: c.authorAvatar || 'TM',
        content: c.content,
        createdAt: c.createdAt,
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

  const handleTagMember = (name: string) => {
    setInputText((prev) => `${prev} @${name} `);
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
    return isToday ? `Today at ${timeStr}` : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  };

  // Filter channels based on search query
  const filteredTenders = tenders.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Collaboration</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Real-Time Communications</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Team Chat &amp; Tender Discussions
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Centralized communications hub for cross-departmental alignment, blocker mitigation, and tender-specific debriefs.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs">
          <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="text-[#64748B]">Active Identity:</span>
          <span className="font-bold text-[#0F172A]">{currentUser.name}</span>
          <span className="font-mono text-[10px] text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded">
            {currentUser.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Main 3-Column Chat Console */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col lg:flex-row h-[720px] overflow-hidden">
        {/* LEFT COLUMN: Channels & Tenders List */}
        <div className="w-full lg:w-72 border-r border-[#E2E8F0] flex flex-col bg-[#F8FAFC]">
          {/* Search Box */}
          <div className="p-3 border-b border-[#E2E8F0] bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search channels or tenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#F1F5F9] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] border-none focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
            {/* General Team Channels */}
            <div>
              <span className="px-2 text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Team Channels
              </span>
              <div className="space-y-0.5">
                {DEFAULT_GENERAL_CHANNELS.map((channel) => {
                  const isSelected = activeChannelId === channel.id;
                  const count = generalMessages.filter((m) => m.channelId === channel.id).length;
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setActiveChannelId(channel.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-[#0F172A] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Hash className={`w-3.5 h-3.5 ${isSelected ? 'text-[#38BDF8]' : 'text-[#64748B]'}`} />
                        <span className="truncate">{channel.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isSelected ? 'bg-[#1E293B] text-white' : 'bg-[#E2E8F0] text-[#64748B]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tender Specific Channels */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Tender Proposal Threads
                </span>
                <span className="text-[10px] text-[#94A3B8] font-mono">{filteredTenders.length}</span>
              </div>
              <div className="space-y-0.5">
                {filteredTenders.map((t) => {
                  const channelId = `tdr-${t.id}`;
                  const isSelected = activeChannelId === channelId;
                  const commentsCount = t.comments?.length || 0;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveChannelId(channelId)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-[#0F172A] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[#38BDF8]' : 'text-[#2563EB]'}`} />
                          <span className="font-mono text-[11px] font-bold truncate">{t.id}</span>
                        </div>
                        <span
                          className={`block text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-[#94A3B8]' : 'text-[#64748B]'
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                          isSelected
                            ? 'bg-[#1E293B] text-white'
                            : commentsCount > 0
                            ? 'bg-[#EFF6FF] text-[#2563EB] font-bold'
                            : 'bg-[#E2E8F0] text-[#64748B]'
                        }`}
                      >
                        {commentsCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Live Chat Stream */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Channel Header */}
          <div className="p-3.5 border-b border-[#E2E8F0] bg-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                {isTenderChannel ? <Briefcase className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-bold text-[#0F172A] truncate">
                    {isTenderChannel && selectedTender
                      ? `${selectedTender.id}: ${selectedTender.title}`
                      : selectedGeneralChannel?.label}
                  </h3>
                  {isTenderChannel && selectedTender && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                      {selectedTender.stage}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                  {isTenderChannel && selectedTender
                    ? `Client: ${selectedTender.organization} • Deadline: ${selectedTender.submissionDeadline || 'Open'}`
                    : selectedGeneralChannel?.description}
                </p>
              </div>
            </div>

            {/* Quick Link to Tender Workspace if in a tender channel */}
            {isTenderChannel && selectedTender && (
              <Link
                to={`/tenders/${selectedTender.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[#2563EB] font-semibold text-xs rounded-lg transition-colors shrink-0"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]/50">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-xs text-[#0F172A]">No messages in this discussion yet</h4>
                <p className="text-[11px] text-[#64748B] max-w-sm">
                  Start the conversation by posting an operational update, risk observation, or asking for team input below.
                </p>
              </div>
            ) : (
              currentMessages.map((msg) => {
                const badge = ROLE_BADGES[msg.authorRole] || ROLE_BADGES.TENDER_ANALYST;
                const isAuthor = msg.authorName === currentUser.name;
                const canDelete = isAuthor || currentUser.role === 'BUSINESS_HEAD';

                return (
                  <div
                    key={msg.id}
                    className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs hover:border-[#CBD5E1] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {msg.authorAvatar}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-[#0F172A]">{msg.authorName}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(msg.createdAt)}</span>
                          </span>
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#94A3B8] hover:text-[#DC2626] rounded transition-opacity"
                          title="Delete remark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-2 pl-9 text-xs text-[#2D3A4A] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Mention Pills */}
          <div className="px-4 py-1.5 bg-[#F1F5F9] border-t border-[#E2E8F0] flex items-center gap-1.5 overflow-x-auto text-[11px] text-[#64748B]">
            <AtSign className="w-3 h-3 text-[#2563EB] shrink-0" />
            <span className="font-medium shrink-0">Quick Mention:</span>
            {teamMembers.slice(0, 5).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleTagMember(m.name)}
                className="bg-white hover:bg-[#EFF6FF] hover:text-[#2563EB] px-2 py-0.5 rounded border border-[#E2E8F0] font-medium text-[10px] transition-colors shrink-0"
              >
                @{m.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E2E8F0] bg-white">
            <div className="mb-2 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <span className="shrink-0 font-semibold text-[#64748B]">Quick reply:</span>
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => insertIntoDraft(reply)}
                  className="shrink-0 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[#475569] transition-colors hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                >
                  {reply}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
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
                placeholder={`Post remark in ${
                  isTenderChannel && selectedTender ? selectedTender.id : `#${selectedGeneralChannel?.name}`
                } as ${currentUser.name}... (Press Enter to send)`}
                className="flex-1 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB] resize-none"
              />
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((open) => !open)}
                  className="p-3 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#2563EB] rounded-xl transition-colors"
                  title="Add emoji"
                  aria-label="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 right-0 z-20 flex gap-1 rounded-lg border border-[#E2E8F0] bg-white p-2 shadow-lg">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          insertIntoDraft(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="rounded-md p-1.5 text-base transition-colors hover:bg-[#EFF6FF]"
                        title={`Add ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-40 text-white rounded-xl shadow-sm transition-colors shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Active Participants & Channel Info */}
        <div className="hidden xl:flex w-64 border-l border-[#E2E8F0] flex-col bg-[#F8FAFC]">
          <div className="p-3 border-b border-[#E2E8F0] bg-white font-bold text-xs text-[#0F172A] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#2563EB]" />
            <span>Team Members ({teamMembers.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {/* Active Team Roster */}
            <div className="space-y-2">
              {teamMembers.map((m) => {
                const isCurrent = m.id === currentUser.id;
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#E2E8F0]"
                  >
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold">
                        {m.avatar}
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#16A34A] absolute -bottom-0.5 -right-0.5 ring-2 ring-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-xs text-[#0F172A] block truncate">
                        {m.name} {isCurrent && '(You)'}
                      </span>
                      <span className="text-[10px] text-[#64748B] block truncate">{m.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Context Card if in a tender */}
            {isTenderChannel && selectedTender && (
              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                <span className="font-bold text-[#0F172A] block">Tender Summary</span>
                <div className="space-y-1 text-[11px] text-[#64748B]">
                  <div className="flex justify-between">
                    <span>Est. Value:</span>
                    <span className="font-mono font-semibold text-[#0F172A]">
                      ${selectedTender.estimatedValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Readiness:</span>
                    <span className="font-mono font-semibold text-[#16A34A]">
                      {selectedTender.readinessScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Tasks:</span>
                    <span className="font-mono font-semibold text-[#2563EB]">
                      {selectedTender.tasks.length} tasks
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
