import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenders } from '../../context/TenderContext';
import {
  Search,
  Briefcase,
  CheckCircle2,
  FileText,
  Users,
  Compass,
  X,
  CornerDownLeft,
  Command,
  LayoutDashboard,
  Calendar,
  BarChart3,
  Archive,
  Settings,
  MessageSquare
} from 'lucide-react';

type ItemCategory = 'ALL' | 'TENDERS' | 'TASKS' | 'DOCS' | 'TEAM' | 'NAV';

interface PaletteItem {
  id: string;
  category: 'TENDERS' | 'TASKS' | 'DOCS' | 'TEAM' | 'NAV';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: any;
  onSelect: () => void;
}

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    tenders,
    reusableDocuments,
    teamMembers,
  } = useTenders();

  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Keyboard Listener: Cmd+Shift+K / Ctrl+Shift+K & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  // Autofocus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Compile all searchable items
  const allItems: PaletteItem[] = [];

  // 1. Tenders
  tenders.forEach((t) => {
    allItems.push({
      id: `tdr-${t.id}`,
      category: 'TENDERS',
      title: `${t.id}: ${t.title}`,
      subtitle: `${t.organization} • ${t.country} • Stage: ${t.stage}`,
      badge: t.stage,
      badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
      icon: Briefcase,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate(`/tenders/${t.id}`);
      },
    });
  });

  // 2. Tasks across all tenders
  tenders.forEach((t) => {
    t.tasks.forEach((task) => {
      allItems.push({
        id: `task-${t.id}-${task.id}`,
        category: 'TASKS',
        title: task.title,
        subtitle: `Tender: ${t.id} • Assigned to ${task.assignee} • Priority: ${task.priority}`,
        badge: task.status.replace('_', ' '),
        badgeColor:
          task.status === 'DONE'
            ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
            : task.status === 'IN_PROGRESS'
            ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
            : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
        icon: CheckCircle2,
        onSelect: () => {
          setIsCommandPaletteOpen(false);
          navigate(`/tenders/${t.id}/tasks`);
        },
      });
    });
  });

  // 3. Documents (Tender Vault Docs + Reusable Master Docs)
  tenders.forEach((t) => {
    t.documents.forEach((doc) => {
      allItems.push({
        id: `doc-${t.id}-${doc.id}`,
        category: 'DOCS',
        title: doc.name,
        subtitle: `Tender: ${t.id} • Folder: ${doc.folder}`,
        badge: doc.isReusableLink ? 'Master Link' : 'Vault File',
        badgeColor: 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]',
        icon: FileText,
        onSelect: () => {
          setIsCommandPaletteOpen(false);
          navigate(`/tenders/${t.id}/documents`);
        },
      });
    });
  });

  reusableDocuments.forEach((doc) => {
    allItems.push({
      id: `rud-${doc.id}`,
      category: 'DOCS',
      title: doc.name,
      subtitle: `Corporate Master Library • ${doc.category} • ${doc.size}`,
      badge: 'Master Reusable',
      badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
      icon: FileText,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/documents');
      },
    });
  });

  // 4. Team Members
  teamMembers.forEach((member) => {
    allItems.push({
      id: `usr-${member.id}`,
      category: 'TEAM',
      title: member.name,
      subtitle: `${member.title} • ${member.department || 'Operations'} (${member.email})`,
      badge: member.role.replace('_', ' '),
      badgeColor: 'bg-[#F3E8FF] text-[#7E22CE] border-[#D8B4FE]',
      icon: Users,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/team');
      },
    });
  });

  // 5. System Quick Navigation
  const systemNav: PaletteItem[] = [
    {
      id: 'nav-dashboard',
      category: 'NAV',
      title: 'Executive Dashboard',
      subtitle: 'Real-time KPI metrics, win rates, and stage distribution pipeline',
      badge: 'Overview',
      badgeColor: 'bg-[#F1F5F9] text-[#0F172A]',
      icon: LayoutDashboard,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/dashboard');
      },
    },
    {
      id: 'nav-discovery',
      category: 'NAV',
      title: 'Bid Discovery & Intake Queue',
      subtitle: 'Ingest raw RFP tenders, extract milestones, and run Go/No-Go triage',
      badge: 'Gate 1',
      badgeColor: 'bg-[#EFF6FF] text-[#2563EB]',
      icon: Compass,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/tenders?stage=DISCOVERED');
      },
    },
    {
      id: 'nav-pipeline',
      category: 'NAV',
      title: 'Tender Pipeline Master Ledger',
      subtitle: '6-Gate operational lifecycle tracking and opportunity directory',
      badge: 'Pipeline',
      badgeColor: 'bg-[#F1F5F9] text-[#0F172A]',
      icon: Briefcase,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/tenders');
      },
    },
    {
      id: 'nav-my-tasks',
      category: 'NAV',
      title: 'My Operational Deliverables & Tasks',
      subtitle: 'Personal work queue and team member assignment filters',
      badge: 'Actionable',
      badgeColor: 'bg-[#F0FDF4] text-[#15803D]',
      icon: CheckCircle2,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/tasks/my-tasks');
      },
    },
    {
      id: 'nav-master-vault',
      category: 'NAV',
      title: 'Master Reusable Document Vault',
      subtitle: 'Trade licenses, audited financials, ISO certificates, and cross-tender referencing',
      badge: 'Vault',
      badgeColor: 'bg-[#EFF6FF] text-[#2563EB]',
      icon: FileText,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/documents');
      },
    },
    {
      id: 'nav-chat',
      category: 'NAV',
      title: 'Team Chat & Tender Discussions',
      subtitle: 'Real-time cross-departmental communications and proposal remark threads',
      badge: 'Collaboration',
      badgeColor: 'bg-[#EFF6FF] text-[#2563EB]',
      icon: MessageSquare,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/discussions');
      },
    },
    {
      id: 'nav-calendar',
      category: 'NAV',
      title: 'Statutory Deadlines & Milestones Calendar',
      subtitle: 'Critical cutoffs, pre-bid meetings, and submission schedules',
      badge: 'Schedule',
      badgeColor: 'bg-[#FFFBEB] text-[#B45309]',
      icon: Calendar,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/calendar');
      },
    },
    {
      id: 'nav-reports',
      category: 'NAV',
      title: 'Executive Reports & Win/Loss Debrief',
      subtitle: 'Comprehensive post-bid post-mortems and margin analytics',
      badge: 'Reports',
      badgeColor: 'bg-[#F1F5F9] text-[#0F172A]',
      icon: BarChart3,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/reports');
      },
    },
    {
      id: 'nav-archive',
      category: 'NAV',
      title: 'Archived Non-Participating Records',
      subtitle: 'Repository of bypassed opportunities and historical data',
      badge: 'Archive',
      badgeColor: 'bg-[#F1F5F9] text-[#64748B]',
      icon: Archive,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/archive');
      },
    },
    {
      id: 'nav-settings',
      category: 'NAV',
      title: 'System Settings & Storage Parameters',
      subtitle: 'Configure local SSD vault paths, currencies, and notifications',
      badge: 'Config',
      badgeColor: 'bg-[#F1F5F9] text-[#64748B]',
      icon: Settings,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        navigate('/settings');
      },
    },
  ];

  allItems.push(...systemNav);

  // Filter items by activeCategory & search query
  const filteredItems = allItems.filter((item) => {
    const matchesCategory =
      activeCategory === 'ALL' || item.category === activeCategory;
    const q = query.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesQuery =
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q));

    return matchesCategory && matchesQuery;
  });

  // Keep selectedIndex within bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(0);
    }
  }, [filteredItems.length, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Arrow key navigation inside input
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[620px]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#2563EB] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or search tenders, tasks, documents, team..."
            className="w-full text-sm text-[#0F172A] placeholder:text-[#94A3B8] border-none focus:outline-none bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 rounded text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-[11px] font-mono text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-0.5 rounded hover:bg-[#E2E8F0] transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: 'All Results' },
            { id: 'TENDERS', label: 'Tenders' },
            { id: 'TASKS', label: 'Tasks' },
            { id: 'DOCS', label: 'Documents' },
            { id: 'TEAM', label: 'Team' },
            { id: 'NAV', label: 'Pages' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id as ItemCategory);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] font-mono text-[#94A3B8] shrink-0">
            {filteredItems.length} match{filteredItems.length === 1 ? '' : 'es'}
          </span>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-[#F1F5F9]"
        >
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#94A3B8] space-y-2">
              <Command className="w-8 h-8 text-[#CBD5E1] mx-auto" />
              <p className="font-semibold text-[#0F172A]">No matching items found</p>
              <p className="text-[11px]">Try searching by Tender ID, client name, deliverable task, or document title.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  data-index={idx}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]'
                      : 'hover:bg-[#F8FAFC] text-[#0F172A]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs truncate text-[#0F172A]">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              item.badgeColor || 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-xs">
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] font-mono">
                        <span>Select</span>
                        <CornerDownLeft className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Key Hints */}
        <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#CBD5E1] rounded text-[10px] font-mono font-bold shadow-2xs">↑↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#CBD5E1] rounded text-[10px] font-mono font-bold shadow-2xs">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#CBD5E1] rounded text-[10px] font-mono font-bold shadow-2xs">esc</kbd>
              <span>to close</span>
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px] text-[#94A3B8]">
            <Command className="w-3 h-3" />
            <span>TenderTracker Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
};
