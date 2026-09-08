import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Building2,
  User,
  Mail,
  Phone,
  Video,
  MapPin,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  Briefcase,
} from 'lucide-react';
import { useTenders } from '../../context/TenderContext';
import {
  ClientVisit,
  VisitType,
  VisitStatus,
  VisitSentiment,
  AccompanyingPerson,
  ActionItem,
} from '../../types/clientVisit';

interface ClientVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialVisit?: ClientVisit | null;
  mode?: 'SCHEDULE' | 'LOG_PAST' | 'EDIT';
}

const VISIT_TYPES: { label: string; value: VisitType; icon: any }[] = [
  { label: 'In-Person Office Visit', value: 'IN_PERSON_OFFICE', icon: Building2 },
  { label: 'Virtual Conference', value: 'VIRTUAL_CONFERENCE', icon: Video },
  { label: 'Pre-Bid Meeting', value: 'PRE_BID_MEETING', icon: Briefcase },
  { label: 'Client Site Visit', value: 'CLIENT_SITE_VISIT', icon: MapPin },
  { label: 'Courtesy Call', value: 'COURTESY_CALL', icon: Users },
  { label: 'Commercial Negotiation', value: 'COMMERCIAL_NEGOTIATION', icon: CheckCircle2 },
];

const SENTIMENTS: { label: string; value: VisitSentiment; color: string }[] = [
  { label: 'Very Positive', value: 'VERY_POSITIVE', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' },
  { label: 'Positive', value: 'POSITIVE', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' },
  { label: 'Neutral', value: 'NEUTRAL', color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700' },
  { label: 'Concerned', value: 'CONCERNED', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' },
  { label: 'Critical Issues', value: 'CRITICAL', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800' },
];

export const ClientVisitModal: React.FC<ClientVisitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialVisit,
  mode = 'SCHEDULE',
}) => {
  const { tenders, teamMembers } = useTenders();

  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'LOG_PAST'>(
    initialVisit ? (initialVisit.status === 'COMPLETED' ? 'LOG_PAST' : 'SCHEDULE') : (mode === 'LOG_PAST' ? 'LOG_PAST' : 'SCHEDULE')
  );

  // Form State
  const [title, setTitle] = useState('');
  const [clientOrganization, setClientOrganization] = useState('');
  const [tenderId, setTenderId] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorDesignation, setVisitorDesignation] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [accompanyingPersons, setAccompanyingPersons] = useState<AccompanyingPerson[]>([]);
  const [internalHostName, setInternalHostName] = useState('Sarah Jenkins');
  const [internalHostRole, setInternalHostRole] = useState('Business Head');
  const [visitType, setVisitType] = useState<VisitType>('IN_PERSON_OFFICE');
  const [status, setStatus] = useState<VisitStatus>('SCHEDULED');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [actualCheckIn, setActualCheckIn] = useState('');
  const [actualCheckOut, setActualCheckOut] = useState('');
  const [locationOrRoom, setLocationOrRoom] = useState('Main Boardroom');
  const [meetingLink, setMeetingLink] = useState('');
  const [agenda, setAgenda] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [sentimentOutcome, setSentimentOutcome] = useState<VisitSentiment>('POSITIVE');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load organizations list for auto-complete
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetch('/api/organizations')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setOrganizations(data);
        }
      })
      .catch(() => {});
  }, []);

  // Sync initial values
  useEffect(() => {
    if (initialVisit) {
      setTitle(initialVisit.title || '');
      setClientOrganization(initialVisit.client_organization || '');
      setTenderId(initialVisit.tender_id || '');
      setVisitorName(initialVisit.visitor_name || '');
      setVisitorDesignation(initialVisit.visitor_designation || '');
      setVisitorPhone(initialVisit.visitor_phone || '');
      setVisitorEmail(initialVisit.visitor_email || '');
      setAccompanyingPersons(initialVisit.accompanying_persons || []);
      setInternalHostName(initialVisit.internal_host_name || 'Sarah Jenkins');
      setInternalHostRole(initialVisit.internal_host_role || 'Business Head');
      setVisitType(initialVisit.visit_type || 'IN_PERSON_OFFICE');
      setStatus(initialVisit.status || 'SCHEDULED');
      setScheduledStart(initialVisit.scheduled_start ? initialVisit.scheduled_start.slice(0, 16) : '');
      setScheduledEnd(initialVisit.scheduled_end ? initialVisit.scheduled_end.slice(0, 16) : '');
      setActualCheckIn(initialVisit.actual_check_in ? initialVisit.actual_check_in.slice(0, 16) : '');
      setActualCheckOut(initialVisit.actual_check_out ? initialVisit.actual_check_out.slice(0, 16) : '');
      setLocationOrRoom(initialVisit.location_or_room || 'Main Boardroom');
      setMeetingLink(initialVisit.meeting_link || '');
      setAgenda(initialVisit.agenda || '');
      setDiscussionNotes(initialVisit.discussion_notes || '');
      setActionItems(initialVisit.action_items || []);
      setSentimentOutcome(initialVisit.sentiment_outcome || 'POSITIVE');
    } else {
      // Default to tomorrow at 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const startStr = tomorrow.toISOString().slice(0, 16);
      tomorrow.setHours(11, 30, 0, 0);
      const endStr = tomorrow.toISOString().slice(0, 16);

      setTitle('');
      setClientOrganization('');
      setTenderId('');
      setVisitorName('');
      setVisitorDesignation('');
      setVisitorPhone('');
      setVisitorEmail('');
      setAccompanyingPersons([]);
      setInternalHostName(teamMembers[0]?.name || 'Sarah Jenkins');
      setInternalHostRole(teamMembers[0]?.role || 'Business Head');
      setVisitType('IN_PERSON_OFFICE');
      setStatus(activeTab === 'LOG_PAST' ? 'COMPLETED' : 'SCHEDULED');
      setScheduledStart(startStr);
      setScheduledEnd(endStr);
      setLocationOrRoom('Main Boardroom');
      setMeetingLink('');
      setAgenda('');
      setDiscussionNotes('');
      setActionItems([]);
      setSentimentOutcome('POSITIVE');
    }
  }, [initialVisit, isOpen, activeTab]);

  if (!isOpen) return null;

  const handleAddAccompanying = () => {
    setAccompanyingPersons([...accompanyingPersons, { name: '', designation: '', phone: '', email: '' }]);
  };

  const handleUpdateAccompanying = (index: number, field: keyof AccompanyingPerson, value: string) => {
    const updated = [...accompanyingPersons];
    updated[index] = { ...updated[index], [field]: value };
    setAccompanyingPersons(updated);
  };

  const handleRemoveAccompanying = (index: number) => {
    setAccompanyingPersons(accompanyingPersons.filter((_, i) => i !== index));
  };

  const handleAddActionItem = () => {
    setActionItems([...actionItems, { task: '', owner: internalHostName, deadline: '', is_done: false }]);
  };

  const handleUpdateActionItem = (index: number, field: keyof ActionItem, value: any) => {
    const updated = [...actionItems];
    updated[index] = { ...updated[index], [field]: value };
    setActionItems(updated);
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const payload = {
      title: title.trim() || 'Client Engagement / Meeting',
      client_organization: clientOrganization.trim() || 'General Client / Entity',
      tender_id: tenderId ? tenderId : null,
      visitor_name: visitorName.trim() || 'Guest Visitor',
      visitor_designation: visitorDesignation.trim() || null,
      visitor_phone: visitorPhone.trim() || null,
      visitor_email: visitorEmail.trim() || null,
      accompanying_persons: accompanyingPersons.filter((p) => p.name.trim().length > 0),
      internal_host_name: internalHostName.trim() || 'Sarah Jenkins',
      internal_host_role: internalHostRole.trim() || 'Business Head',
      visit_type: visitType,
      status: activeTab === 'LOG_PAST' && status === 'SCHEDULED' ? 'COMPLETED' : status,
      scheduled_start: scheduledStart || new Date().toISOString().slice(0, 16),
      scheduled_end: scheduledEnd || null,
      actual_check_in: actualCheckIn || null,
      actual_check_out: actualCheckOut || null,
      location_or_room: locationOrRoom.trim() || null,
      meeting_link: meetingLink.trim() || null,
      agenda: agenda.trim() || null,
      discussion_notes: discussionNotes.trim() || null,
      action_items: actionItems.filter((a) => a.task.trim().length > 0),
      sentiment_outcome: sentimentOutcome,
    };

    try {
      const url = initialVisit
        ? `/api/v1/client-visits/${initialVisit.id}`
        : '/api/v1/client-visits';
      const method = initialVisit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to save visit record.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {initialVisit ? 'Edit Client Visit & Meeting' : 'Schedule or Log Client Visit'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage visitor registries, stakeholder alignments, and meeting deliverables
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs (only if creating new) */}
        {!initialVisit && (
          <div className="px-6 pt-3 pb-0 bg-slate-50/40 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('SCHEDULE');
                  setStatus('SCHEDULED');
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
                  activeTab === 'SCHEDULE'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0F172A]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Upcoming Meeting</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('LOG_PAST');
                  setStatus('COMPLETED');
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
                  activeTab === 'LOG_PAST'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0F172A]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Log Completed / Walk-In Record</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          {/* Section: Visit Purpose & Client */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              1. Meeting / Visit Details
            </div>
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Meeting Title / Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Technical Clarification & Architectural Briefing for ADB Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Client / Procuring Entity
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="organizations-list"
                    placeholder="e.g. United Nations Development Programme"
                    value={clientOrganization}
                    onChange={(e) => setClientOrganization(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <datalist id="organizations-list">
                    {organizations.map((org) => (
                      <option key={org.id} value={org.name} />
                    ))}
                    <option value="World Bank Group" />
                    <option value="Asian Development Bank" />
                    <option value="UNDP Procurement Division" />
                    <option value="Ministry of Power & Energy" />
                    <option value="Roads and Highways Department" />
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Associated Tender (Optional)
                </label>
                <select
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">-- Standalone / General Meeting --</option>
                  {tenders.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.id}] {t.title.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Visit Type, Schedule & Location */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              2. Logistics &amp; Timing
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Visit Format
                </label>
                <select
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value as VisitType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {VISIT_TYPES.map((vt) => (
                    <option key={vt.value} value={vt.value}>
                      {vt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Start Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledStart}
                  onChange={(e) => setScheduledStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Estimated End Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledEnd}
                  onChange={(e) => setScheduledEnd(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Physical Location / Meeting Room
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Executive Boardroom 4A, Headquarters"
                    value={locationOrRoom}
                    onChange={(e) => setLocationOrRoom(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Virtual Meeting Link (Zoom / Teams / Meet)
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    placeholder="https://teams.microsoft.com/l/meetup-join/..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Visitor & Host Contacts */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              3. Principal Visitor &amp; Internal Host
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Primary Visitor Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Dr. Arthur Pendelton"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Visitor Designation / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Director General, Procurement Board"
                  value={visitorDesignation}
                  onChange={(e) => setVisitorDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Visitor Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Visitor Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="arthur.pendelton@undp.org"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Accompanying Delegation Table */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Accompanying Delegation / Attendees ({accompanyingPersons.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddAccompanying}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Accompanying Person</span>
                </button>
              </div>

              {accompanyingPersons.length > 0 && (
                <div className="space-y-2 bg-slate-50/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {accompanyingPersons.map((person, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={person.name}
                        onChange={(e) => handleUpdateAccompanying(idx, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Designation"
                        value={person.designation || ''}
                        onChange={(e) => handleUpdateAccompanying(idx, 'designation', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Email / Phone"
                        value={person.email || ''}
                        onChange={(e) => handleUpdateAccompanying(idx, 'email', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAccompanying(idx)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Internal Host Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Internal Host
                </label>
                <select
                  value={internalHostName}
                  onChange={(e) => {
                    const host = teamMembers.find((m) => m.name === e.target.value);
                    setInternalHostName(e.target.value);
                    if (host?.role) setInternalHostRole(host.role.replace('_', ' '));
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role.replace('_', ' ')})
                    </option>
                  ))}
                  <option value="Sarah Jenkins">Sarah Jenkins (Business Head)</option>
                  <option value="Michael Zhang">Michael Zhang (Chief Estimator)</option>
                  <option value="David Kumar">David Kumar (Managing Director)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Internal Host Role / Title
                </label>
                <input
                  type="text"
                  value={internalHostRole}
                  onChange={(e) => setInternalHostRole(e.target.value)}
                  placeholder="e.g. Business Head"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section: Agenda, Minutes & Outcomes */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              4. Agenda &amp; Meeting Minutes
            </div>

            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Agenda &amp; Discussion Objectives
              </label>
              <textarea
                rows={2}
                placeholder="Key talking points, evaluation criteria questions, scope clarification..."
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            </div>

            {(activeTab === 'LOG_PAST' || status === 'COMPLETED' || initialVisit) && (
              <>
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Discussion Summary / Meeting Minutes (MoM)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Summarize client feedback, requirements discussed, agreed timeline commitments..."
                    value={discussionNotes}
                    onChange={(e) => setDiscussionNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Action Items Builder */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Follow-up Action Items ({actionItems.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddActionItem}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Action Item</span>
                    </button>
                  </div>

                  {actionItems.length > 0 && (
                    <div className="space-y-2 bg-slate-50/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      {actionItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.is_done}
                            onChange={(e) => handleUpdateActionItem(idx, 'is_done', e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Deliverable description"
                            value={item.task}
                            onChange={(e) => handleUpdateActionItem(idx, 'task', e.target.value)}
                            className="flex-2 px-3 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                          <input
                            type="text"
                            placeholder="Owner"
                            value={item.owner || ''}
                            onChange={(e) => handleUpdateActionItem(idx, 'owner', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                          <input
                            type="text"
                            placeholder="Deadline (e.g. Sep 15)"
                            value={item.deadline || ''}
                            onChange={(e) => handleUpdateActionItem(idx, 'deadline', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveActionItem(idx)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sentiment Outcome */}
                <div className="pt-2">
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Client Relationship &amp; Opportunity Sentiment
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {SENTIMENTS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSentimentOutcome(s.value)}
                        className={`py-2 px-2.5 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
                          sentimentOutcome === s.value
                            ? `${s.color} ring-2 ring-blue-500/50 shadow-sm font-bold`
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-xs">Record Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VisitStatus)}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="CHECKED_IN">Checked-In (Active)</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RESCHEDULED">Rescheduled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{initialVisit ? 'Update Visit' : activeTab === 'SCHEDULE' ? 'Confirm Schedule' : 'Save Minutes'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
