import { API_BASE_URL } from '../utils/apiConfig';
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

const INITIAL_GENERAL_MESSAGES: GeneralMessage[] = [];

const ROLE_BADGES: Record<UserRole, { bg: string; text: string; border: string; label: string }> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    bg: 'bg-[var(--crit-soft)]',
    text: 'text-[var(--crit)]',
    border: 'border-[var(--crit-line)]',
  },
  BUSINESS_HEAD: {
    label: 'Business Head',
    bg: 'bg-[var(--bg-subtle)]',
    text: 'text-[var(--text-secondary)]',
    border: 'border-[var(--border-default)]',
  },
  EXECUTIVE_MANAGER: {
    label: 'Executive Mgr',
    bg: 'bg-[var(--accent-soft)]',
    text: 'text-[var(--accent)]',
    border: 'border-[var(--accent-line)]',
  },
  SENIOR_MANAGER: {
    label: 'Senior Mgr',
    bg: 'bg-[var(--warn-soft)]',
    text: 'text-[var(--warn)]',
    border: 'border-[var(--warn-line)]',
  },
  TENDER_ANALYST: {
    label: 'Tender Analyst',
    bg: 'bg-[var(--ok-soft)]',
    text: 'text-[var(--ok)]',
    border: 'border-[var(--ok-line)]',
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
      fetch(`${API_BASE_URL}/chat/channels/${activeChannelId}/messages`)
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

      fetch(`${API_BASE_URL}/chat/channels/${activeChannelId}/messages`, {
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
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
            <span>Collaboration</span>
            <span>•</span>
            <span className="font-semibold text-[var(--text-primary)]">Real-Time Communications</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Team Chat &amp; Tender Discussions
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Centralized communications hub for cross-departmental alignment, blocker mitigation, and tender-specific debriefs.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--bg-surface)] px-3 py-1.5 rounded-lg border border-[var(--border-default)] text-xs">
          <div className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse" />
          <span className="text-[var(--text-secondary)]">Active Identity:</span>
          <span className="font-bold text-[var(--text-primary)]">{currentUser.name}</span>
          <span className="font-mono text-[10px] text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded">
            {currentUser.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Main 3-Column Chat Console */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm flex flex-col lg:flex-row h-[720px] overflow-hidden">
        {/* LEFT COLUMN: Channels & Tenders List */}
        <div className="w-full lg:w-72 border-r border-[var(--border-default)] flex flex-col bg-[var(--bg-subtle)]">
          {/* Search Box */}
          <div className="p-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search channels or tenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border-none focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
            {/* General Team Channels */}
            <div>
              <span className="px-2 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
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
 ? 'bg-[var(--accent)] text-[var(--accent-on)] font-semibold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Hash className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
                        <span className="truncate">{channel.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
 isSelected ? 'bg-[var(--accent-hover)] text-[var(--accent-on)]' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
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
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Tender Proposal Threads
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{filteredTenders.length}</span>
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
 ? 'bg-[var(--accent)] text-[var(--accent-on)] font-semibold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--accent)]'}`} />
                          <span className="font-mono text-[11px] font-bold truncate">{t.id}</span>
                        </div>
                        <span
                          className={`block text-[11px] truncate mt-0.5 ${
 isSelected ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'
 }`}
                        >
                          {t.title}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
 isSelected
 ? 'bg-[var(--accent-hover)] text-[var(--accent-on)]'
                            : commentsCount > 0
                            ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
                            : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
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
        <div className="flex-1 flex flex-col bg-[var(--bg-surface)]">
          {/* Channel Header */}
          <div className="p-3.5 border-b border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                {isTenderChannel ? <Briefcase className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-bold text-[var(--text-primary)] truncate">
                    {isTenderChannel && selectedTender
                      ? `${selectedTender.id}: ${selectedTender.title}`
                      : selectedGeneralChannel?.label}
                  </h3>
                  {isTenderChannel && selectedTender && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
                      {selectedTender.stage}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-subtle)] hover:bg-[var(--accent-soft)] border border-[var(--border-default)] text-[var(--accent)] font-semibold text-xs rounded-lg transition-colors shrink-0"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-subtle)]/50">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-xs text-[var(--text-primary)]">No messages in this discussion yet</h4>
                <p className="text-[11px] text-[var(--text-secondary)] max-w-sm">
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
                    className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-2xs hover:border-[var(--border-strong)] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-[var(--accent-on)] flex items-center justify-center text-xs font-bold shrink-0">
                          {msg.authorAvatar}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-[var(--text-primary)]">{msg.authorName}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(msg.createdAt)}</span>
                          </span>
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--crit)] rounded transition-opacity"
                          title="Delete remark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-2 pl-9 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Mention Pills */}
          <div className="px-4 py-1.5 bg-[var(--bg-subtle)] border-t border-[var(--border-default)] flex items-center gap-1.5 overflow-x-auto text-[11px] text-[var(--text-secondary)]">
            <AtSign className="w-3 h-3 text-[var(--accent)] shrink-0" />
            <span className="font-medium shrink-0">Quick Mention:</span>
            {teamMembers.slice(0, 5).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleTagMember(m.name)}
                className="bg-[var(--bg-surface)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] px-2 py-0.5 rounded border border-[var(--border-default)] font-medium text-[10px] transition-colors shrink-0"
              >
                @{m.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
            <div className="mb-2 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <span className="shrink-0 font-semibold text-[var(--text-secondary)]">Quick reply:</span>
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => insertIntoDraft(reply)}
                  className="shrink-0 rounded-md border border-[var(--border-default)] bg-[var(--bg-subtle)] px-2 py-1 text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
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
                className="flex-1 p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
              />
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((open) => !open)}
                  className="p-3 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--accent)] rounded-xl transition-colors"
                  title="Add emoji"
                  aria-label="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 right-0 z-20 flex gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 shadow-lg">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          insertIntoDraft(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="rounded-md p-1.5 text-base transition-colors hover:bg-[var(--accent-soft)]"
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
                className="p-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[var(--accent-on)] rounded-xl shadow-sm transition-colors shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Active Participants & Channel Info */}
        <div className="hidden xl:flex w-64 border-l border-[var(--border-default)] flex-col bg-[var(--bg-subtle)]">
          <div className="p-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)] font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--accent)]" />
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
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]"
                  >
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-[var(--accent-on)] flex items-center justify-center text-xs font-bold">
                        {m.avatar}
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[var(--ok)] absolute -bottom-0.5 -right-0.5 ring-2 ring-[var(--accent-on)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-xs text-[var(--text-primary)] block truncate">
                        {m.name} {isCurrent && '(You)'}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">{m.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Context Card if in a tender */}
            {isTenderChannel && selectedTender && (
              <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] space-y-2 text-xs">
                <span className="font-bold text-[var(--text-primary)] block">Tender Summary</span>
                <div className="space-y-1 text-[11px] text-[var(--text-secondary)]">
                  <div className="flex justify-between">
                    <span>Est. Value:</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">
                      ${selectedTender.estimatedValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Readiness:</span>
                    <span className="font-mono font-semibold text-[var(--ok)]">
                      {selectedTender.readinessScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Tasks:</span>
                    <span className="font-mono font-semibold text-[var(--accent)]">
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
