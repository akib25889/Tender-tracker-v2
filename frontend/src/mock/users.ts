import { UserProfile } from '../types/tender';

export const TEAM_PROFILES: UserProfile[] = [
  {
    id: 'USR-01',
    name: 'Sarah Jenkins',
    role: 'BID_DIRECTOR',
    title: 'Senior Bid Operations Director',
    email: 'sarah.jenkins@tendertracker.io',
    avatar: 'SJ',
  },
  {
    id: 'USR-02',
    name: 'Dr. Marcus Vance',
    role: 'TECHNICAL_LEAD',
    title: 'Lead Enterprise Architect',
    email: 'marcus.vance@tendertracker.io',
    avatar: 'MV',
  },
  {
    id: 'USR-03',
    name: 'Tariq Al-Mansoor',
    role: 'FINANCIAL_ANALYST',
    title: 'Commercial Pricing Specialist',
    email: 'tariq.almansoor@tendertracker.io',
    avatar: 'TA',
  },
  {
    id: 'USR-04',
    name: 'Elena Rostova',
    role: 'COMPLIANCE_OFFICER',
    title: 'Statutory Compliance Lead',
    email: 'elena.rostova@tendertracker.io',
    avatar: 'ER',
  },
  {
    id: 'USR-05',
    name: 'Alex Mercer',
    role: 'VIEWER',
    title: 'Audit Observer (Read-Only)',
    email: 'alex.mercer@tendertracker.io',
    avatar: 'AM',
  },
];
