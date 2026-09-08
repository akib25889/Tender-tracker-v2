export type VisitType =
  | 'IN_PERSON_OFFICE'
  | 'CLIENT_SITE_VISIT'
  | 'VIRTUAL_CONFERENCE'
  | 'PRE_BID_MEETING'
  | 'COURTESY_CALL'
  | 'COMMERCIAL_NEGOTIATION'
  | 'OTHER';

export type VisitStatus =
  | 'SCHEDULED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export type VisitSentiment =
  | 'VERY_POSITIVE'
  | 'POSITIVE'
  | 'NEUTRAL'
  | 'CONCERNED'
  | 'CRITICAL';

export interface AccompanyingPerson {
  name: string;
  designation?: string;
  phone?: string;
  email?: string;
}

export interface ActionItem {
  task: string;
  owner?: string;
  deadline?: string;
  is_done: boolean;
}

export interface ClientVisit {
  id: string;
  title: string;
  client_organization: string;
  organization_id?: string | null;
  tender_id?: string | null;
  visitor_name: string;
  visitor_designation?: string | null;
  visitor_phone?: string | null;
  visitor_email?: string | null;
  accompanying_persons?: AccompanyingPerson[] | null;
  internal_host_name?: string | null;
  internal_host_role?: string | null;
  visit_type?: VisitType;
  status?: VisitStatus;
  scheduled_start: string;
  scheduled_end?: string | null;
  actual_check_in?: string | null;
  actual_check_out?: string | null;
  location_or_room?: string | null;
  meeting_link?: string | null;
  agenda?: string | null;
  discussion_notes?: string | null;
  action_items?: ActionItem[] | null;
  sentiment_outcome?: VisitSentiment | null;
  attachments?: Array<{ name: string; url?: string; size?: string }> | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClientVisitCreateInput {
  title: string;
  client_organization: string;
  organization_id?: string | null;
  tender_id?: string | null;
  visitor_name: string;
  visitor_designation?: string | null;
  visitor_phone?: string | null;
  visitor_email?: string | null;
  accompanying_persons?: AccompanyingPerson[] | null;
  internal_host_name?: string | null;
  internal_host_role?: string | null;
  visit_type?: VisitType;
  status?: VisitStatus;
  scheduled_start: string;
  scheduled_end?: string | null;
  actual_check_in?: string | null;
  actual_check_out?: string | null;
  location_or_room?: string | null;
  meeting_link?: string | null;
  agenda?: string | null;
  discussion_notes?: string | null;
  action_items?: ActionItem[] | null;
  sentiment_outcome?: VisitSentiment | null;
}

