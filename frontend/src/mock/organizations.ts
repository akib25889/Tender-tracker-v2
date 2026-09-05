import { Organization } from '../types/tender';

export const INITIAL_ORGANIZATIONS: Organization[] = [
  // 1. Bangladesh Government Roots & Ministries
  {
    id: 'ORG-BD-01',
    name: 'Government of the People\'s Republic of Bangladesh',
    shortName: 'GoB',
    type: 'GOVERNMENT',
    parentId: null,
    country: 'Bangladesh',
    website: 'https://bangladesh.gov.bd',
    priority: 'CRITICAL',
    aliases: ['GoB', 'Bangladesh Government', 'BD Govt'],
    description: 'Sovereign executive government authority of Bangladesh.'
  },
  {
    id: 'ORG-BD-02',
    name: 'Ministry of Road Transport and Bridges',
    shortName: 'MoRTB',
    type: 'MINISTRY',
    parentId: 'ORG-BD-01',
    country: 'Bangladesh',
    website: 'https://rthd.gov.bd',
    priority: 'CRITICAL',
    aliases: ['MoRTB', 'Road Transport & Bridges Ministry'],
    description: 'Infrastructure and major transportation network authority.'
  },
  {
    id: 'ORG-BD-03',
    name: 'Dhaka Mass Transit Company Limited',
    shortName: 'DMTCL',
    type: 'STATE_OWNED_ENTERPRISE',
    parentId: 'ORG-BD-02',
    country: 'Bangladesh',
    website: 'https://dmtcl.gov.bd',
    priority: 'CRITICAL',
    aliases: ['DMTCL', 'Dhaka Metro Rail', 'Metro Rail Authority'],
    description: 'Executing agency for Dhaka Mass Rapid Transit (MRT) network.'
  },
  {
    id: 'ORG-BD-04',
    name: 'Ministry of Power, Energy and Mineral Resources',
    shortName: 'MPEMR',
    type: 'MINISTRY',
    parentId: 'ORG-BD-01',
    country: 'Bangladesh',
    website: 'https://powerdivision.gov.bd',
    priority: 'HIGH',
    aliases: ['MPEMR', 'Power Division'],
    description: 'National power generation, distribution, and transmission governance.'
  },
  {
    id: 'ORG-BD-05',
    name: 'Power Grid Company of Bangladesh',
    shortName: 'PGCB',
    type: 'CORPORATION',
    parentId: 'ORG-BD-04',
    country: 'Bangladesh',
    website: 'https://pgcb.gov.bd',
    priority: 'HIGH',
    aliases: ['PGCB', 'Power Grid BD'],
    description: 'Sole electric power transmission utility in Bangladesh.'
  },
  {
    id: 'ORG-BD-06',
    name: 'Ministry of Railways',
    shortName: 'MoR',
    type: 'MINISTRY',
    parentId: 'ORG-BD-01',
    country: 'Bangladesh',
    website: 'https://mor.gov.bd',
    priority: 'HIGH',
    aliases: ['MoR', 'Railways Ministry'],
    description: 'Railway transport infrastructure development and regulation.'
  },
  {
    id: 'ORG-BD-07',
    name: 'Bangladesh Railway',
    shortName: 'BR',
    type: 'DEPARTMENT',
    parentId: 'ORG-BD-06',
    country: 'Bangladesh',
    website: 'https://railway.gov.bd',
    priority: 'HIGH',
    aliases: ['BR', 'Railway Department'],
    description: 'State-owned rail transport agency of Bangladesh.'
  },
  {
    id: 'ORG-BD-08',
    name: 'Ministry of Civil Aviation and Tourism',
    shortName: 'MoCAT',
    type: 'MINISTRY',
    parentId: 'ORG-BD-01',
    country: 'Bangladesh',
    website: 'https://mocat.gov.bd',
    priority: 'MEDIUM',
    aliases: ['MoCAT'],
    description: 'Aviation safety, airports infrastructure, and tourism regulation.'
  },
  {
    id: 'ORG-BD-09',
    name: 'Civil Aviation Authority of Bangladesh',
    shortName: 'CAAB',
    type: 'AUTHORITY',
    parentId: 'ORG-BD-08',
    country: 'Bangladesh',
    website: 'https://caab.gov.bd',
    priority: 'MEDIUM',
    aliases: ['CAAB', 'Civil Aviation Authority'],
    description: 'Regulatory authority for all civil aviation and airports operation.'
  },
  {
    id: 'ORG-BD-10',
    name: 'Information and Communication Technology Division',
    shortName: 'ICTD',
    type: 'DIVISION',
    parentId: 'ORG-BD-01',
    country: 'Bangladesh',
    website: 'https://ictd.gov.bd',
    priority: 'CRITICAL',
    aliases: ['ICT Division', 'ICTD', 'Ministry of Posts, Telecommunications and IT'],
    description: 'Lead government division driving digital government and IT procurement.'
  },
  {
    id: 'ORG-BD-11',
    name: 'Bangladesh Computer Council',
    shortName: 'BCC',
    type: 'STATUTORY_BODY',
    parentId: 'ORG-BD-10',
    country: 'Bangladesh',
    website: 'https://bcc.gov.bd',
    priority: 'CRITICAL',
    aliases: ['BCC', 'National Computer Council'],
    description: 'Apex technical ICT agency managing national data centers and e-Gov.'
  },

  // 2. United Nations System
  {
    id: 'ORG-UN-01',
    name: 'United Nations System',
    shortName: 'UN',
    type: 'UN_SYSTEM',
    parentId: null,
    country: 'International',
    website: 'https://ungm.org',
    priority: 'CRITICAL',
    aliases: ['UN', 'United Nations', 'UN System'],
    description: 'Global intergovernmental organization and multilateral umbrella.'
  },
  {
    id: 'ORG-UN-02',
    name: 'United Nations Development Programme',
    shortName: 'UNDP',
    type: 'UN_PROGRAMME',
    parentId: 'ORG-UN-01',
    country: 'Global',
    website: 'https://undp.org',
    priority: 'CRITICAL',
    aliases: ['UNDP', 'UN Development Programme'],
    description: 'United Nations lead development network and procurement hub.'
  },
  {
    id: 'ORG-UN-03',
    name: 'UNDP Bangladesh',
    shortName: 'UNDP BD',
    type: 'UN_COUNTRY_OFFICE',
    parentId: 'ORG-UN-02',
    country: 'Bangladesh',
    website: 'https://www.undp.org/bangladesh',
    priority: 'CRITICAL',
    aliases: ['UNDP Bangladesh', 'UNDP Country Office Dhaka'],
    description: 'Country office overseeing climate resilience, governance, and digital public goods.'
  },
  {
    id: 'ORG-UN-04',
    name: 'United Nations Office for Project Services',
    shortName: 'UNOPS',
    type: 'UN_ORGANIZATION',
    parentId: 'ORG-UN-01',
    country: 'International',
    website: 'https://unops.org',
    priority: 'HIGH',
    aliases: ['UNOPS'],
    description: 'Operational arm dedicated to implementing infrastructure and procurement.'
  },

  // 3. Multilateral Development Banks
  {
    id: 'ORG-MDB-01',
    name: 'World Bank Group',
    shortName: 'WB',
    type: 'MULTILATERAL_ORGANIZATION',
    parentId: null,
    country: 'International',
    website: 'https://worldbank.org',
    priority: 'CRITICAL',
    aliases: ['World Bank', 'IBRD', 'IDA', 'WBG'],
    description: 'International financial institution providing grants and credits.'
  },
  {
    id: 'ORG-MDB-02',
    name: 'Asian Development Bank',
    shortName: 'ADB',
    type: 'MULTILATERAL_ORGANIZATION',
    parentId: null,
    country: 'International',
    website: 'https://adb.org',
    priority: 'HIGH',
    aliases: ['ADB', 'Asian Dev Bank'],
    description: 'Regional multilateral development bank supporting Asia and Pacific.'
  },
  {
    id: 'ORG-MDB-03',
    name: 'Japan International Cooperation Agency',
    shortName: 'JICA',
    type: 'DEVELOPMENT_PARTNER',
    parentId: null,
    country: 'Japan',
    website: 'https://jica.go.jp',
    priority: 'HIGH',
    aliases: ['JICA', 'Japan ODA'],
    description: 'Japanese government agency delivering official development assistance.'
  }
];
