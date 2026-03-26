import { mockPersons } from './persons';
import { mockOrganizations } from './organizations';

export const connectionTypes = [
    // Personal
    'Friend', 'Best Friend', 'Acquaintance', 'Lover', 'Ex-Lover', 'Spouse', 'Ex-Spouse',
    // Family
    'Mother', 'Father', 'Son', 'Daughter', 'Brother', 'Sister', 'Uncle', 'Aunt',
    'Cousin', 'Nephew', 'Niece', 'Grandfather', 'Grandmother', 'Godfather', 'Godmother',
    'Step-Father', 'Step-Mother', 'Step-Brother', 'Step-Sister', 'In-Law', 'Guardian',
    // Professional
    'Employee', 'Employer', 'Business Partner', 'Business Associate', 'Investor',
    'Client', 'Supplier', 'Contractor', 'Consultant', 'Mentor', 'Protégé',
    // Criminal / Intelligence
    'Co-Conspirator', 'Handler', 'Asset', 'Informant', 'Accomplice',
    'Suspect', 'Associate', 'Cell Member', 'Recruiter', 'Financier',
    // Operational
    'Co-location', 'Communication', 'Financial Transaction',
    'Travel Companion', 'Shared Vehicle', 'Shared Property', 'Shared Device',
    // Legal
    'Legal Representative', 'Witness', 'Defendant', 'Plaintiff',
    // Other
    'Neighbor', 'Roommate', 'Classmate', 'Military Comrade', 'Unknown',
];

export const connectionCategories: Record<string, { types: string[]; color: string }> = {
    'Family':      { types: ['Mother','Father','Son','Daughter','Brother','Sister','Uncle','Aunt','Cousin','Nephew','Niece','Grandfather','Grandmother','Godfather','Godmother','Step-Father','Step-Mother','Step-Brother','Step-Sister','In-Law','Guardian','Spouse','Ex-Spouse'], color: '#f59e0b' },
    'Personal':    { types: ['Friend','Best Friend','Acquaintance','Lover','Ex-Lover','Neighbor','Roommate','Classmate','Military Comrade'], color: '#22c55e' },
    'Professional':{ types: ['Employee','Employer','Business Partner','Business Associate','Investor','Client','Supplier','Contractor','Consultant','Mentor','Protégé'], color: '#3b82f6' },
    'Criminal':    { types: ['Co-Conspirator','Handler','Asset','Informant','Accomplice','Suspect','Associate','Cell Member','Recruiter','Financier'], color: '#ef4444' },
    'Operational': { types: ['Co-location','Communication','Financial Transaction','Travel Companion','Shared Vehicle','Shared Property','Shared Device'], color: '#8b5cf6' },
    'Legal':       { types: ['Legal Representative','Witness','Defendant','Plaintiff'], color: '#06b6d4' },
    'Unknown':     { types: ['Unknown'], color: '#6b7280' },
};

export function getConnectionColor(type: string): string {
    for (const cat of Object.values(connectionCategories)) {
        if (cat.types.includes(type)) return cat.color;
    }
    return '#6b7280';
}

export function getConnectionCategory(type: string): string {
    for (const [name, cat] of Object.entries(connectionCategories)) {
        if (cat.types.includes(type)) return name;
    }
    return 'Unknown';
}

export interface ConnectionNode {
    id: string;
    type: 'person' | 'organization';
    label: string;
    subLabel: string;
    entityId: number;
    avatar: string | null;
    risk: string;
}

export type Relationship = 'Good' | 'Bad' | 'Neutral' | 'Unknown';
export const relationships: Relationship[] = ['Good', 'Bad', 'Neutral', 'Unknown'];
export const relationshipColors: Record<Relationship, string> = { Good: '#22c55e', Bad: '#ef4444', Neutral: '#f59e0b', Unknown: '#6b7280' };
export const relationshipIcons: Record<Relationship, string> = { Good: '●', Bad: '▲', Neutral: '◆', Unknown: '○' };

export interface ConnectionEdge {
    id: string;
    source: string;
    target: string;
    type: string;
    relationship: Relationship;
    strength: number; // 1-5
    notes: string;
    firstSeen: string;
    lastSeen: string;
}

// Build nodes from persons and organizations
export const nodes: ConnectionNode[] = [
    ...mockPersons.map(p => ({
        id: `p-${p.id}`, type: 'person' as const, label: `${p.firstName} ${p.lastName}`,
        subLabel: p.nationality, entityId: p.id, avatar: p.avatar, risk: p.risk,
    })),
    ...mockOrganizations.map(o => ({
        id: `o-${o.id}`, type: 'organization' as const, label: o.name,
        subLabel: o.industry, entityId: o.id, avatar: o.logo, risk: o.risk,
    })),
];

// Build edges — realistic intelligence connections
export const edges: ConnectionEdge[] = [
    // Alpha Security Group network
    { id:'c1', source:'p-1', target:'p-12', type:'Business Partner', relationship:'Good', strength:5, notes:'Co-founders of Alpha Security Group. Daily contact.', firstSeen:'2015-01-01', lastSeen:'2026-03-18' },
    { id:'c2', source:'p-1', target:'o-1', type:'Employee', relationship:'Neutral', strength:5, notes:'CEO of Alpha Security Group.', firstSeen:'2009-06-01', lastSeen:'2026-03-18' },
    { id:'c3', source:'p-12', target:'o-1', type:'Employee', relationship:'Good', strength:5, notes:'Security Director.', firstSeen:'2015-01-01', lastSeen:'2026-03-18' },
    { id:'c4', source:'p-1', target:'p-2', type:'Lover', relationship:'Good', strength:4, notes:'Ongoing relationship. Frequent encrypted communications.', firstSeen:'2024-02-14', lastSeen:'2026-03-15' },
    { id:'c5', source:'p-1', target:'p-7', type:'Business Associate', relationship:'Bad', strength:3, notes:'Arms procurement channel suspected.', firstSeen:'2022-06-10', lastSeen:'2026-01-20' },
    { id:'c6', source:'p-1', target:'p-3', type:'Financial Transaction', relationship:'Neutral', strength:4, notes:'Multiple wire transfers via Dubai intermediary.', firstSeen:'2023-03-15', lastSeen:'2026-02-10' },
    // Rashid Holdings network
    { id:'c7', source:'p-3', target:'o-2', type:'Employee', relationship:'Neutral', strength:5, notes:'CEO & Founder.', firstSeen:'2005-01-01', lastSeen:'2026-02-15' },
    { id:'c8', source:'p-3', target:'p-7', type:'Financier', relationship:'Bad', strength:4, notes:'Suspected funding of Falcon Trading operations.', firstSeen:'2020-08-01', lastSeen:'2026-01-05' },
    { id:'c9', source:'p-3', target:'p-9', type:'Client', relationship:'Neutral', strength:3, notes:'Import/export facilitation through Mendoza network.', firstSeen:'2021-11-20', lastSeen:'2025-12-30' },
    { id:'c10', source:'o-2', target:'o-5', type:'Business Associate', relationship:'Neutral', strength:3, notes:'Joint maritime logistics operation.', firstSeen:'2019-05-01', lastSeen:'2026-01-15' },
    // Mendoza network
    { id:'c11', source:'p-9', target:'o-6', type:'Employee', relationship:'Neutral', strength:5, notes:'CEO of Mendoza Import-Export.', firstSeen:'2015-11-10', lastSeen:'2026-03-05' },
    { id:'c12', source:'p-9', target:'p-7', type:'Co-Conspirator', relationship:'Good', strength:4, notes:'Cross-border smuggling coordination.', firstSeen:'2018-04-01', lastSeen:'2026-01-05' },
    { id:'c13', source:'p-9', target:'p-14', type:'Associate', relationship:'Bad', strength:3, notes:'Belgrade connection. Money laundering suspected.', firstSeen:'2022-07-15', lastSeen:'2025-11-20' },
    // Petrova network
    { id:'c14', source:'p-4', target:'o-8', type:'Employee', relationship:'Neutral', strength:5, notes:'CEO of Petrova Consulting.', firstSeen:'2021-01-15', lastSeen:'2026-03-01' },
    { id:'c15', source:'p-4', target:'p-2', type:'Friend', relationship:'Good', strength:3, notes:'University classmates. Ongoing social contact.', firstSeen:'2010-09-01', lastSeen:'2026-02-28' },
    { id:'c16', source:'p-4', target:'p-10', type:'Communication', relationship:'Unknown', strength:2, notes:'Encrypted Telegram messages intercepted.', firstSeen:'2025-06-01', lastSeen:'2026-02-20' },
    // Dragon Tech
    { id:'c17', source:'p-10', target:'o-4', type:'Employee', relationship:'Neutral', strength:5, notes:'CEO & Founder.', firstSeen:'2018-04-20', lastSeen:'2026-02-20' },
    { id:'c18', source:'o-4', target:'o-1', type:'Supplier', relationship:'Neutral', strength:2, notes:'Cybersecurity software procurement.', firstSeen:'2023-01-10', lastSeen:'2025-09-15' },
    // Falcon Trading
    { id:'c19', source:'p-7', target:'o-5', type:'Employee', relationship:'Neutral', strength:5, notes:'Managing Director.', firstSeen:'2010-03-01', lastSeen:'2026-01-05' },
    { id:'c20', source:'p-7', target:'p-11', type:'Informant', relationship:'Bad', strength:2, notes:'Provides intelligence on Egyptian operations.', firstSeen:'2024-01-15', lastSeen:'2025-10-30' },
    // Family connections
    { id:'c21', source:'p-12', target:'p-14', type:'Brother', relationship:'Good', strength:5, notes:'Blood relation. Ivan and Nikola Jovanović (different surnames — maternal).', firstSeen:'1986-01-01', lastSeen:'2026-03-18' },
    { id:'c22', source:'p-2', target:'p-14', type:'Ex-Lover', relationship:'Bad', strength:2, notes:'Brief relationship in 2019.', firstSeen:'2019-03-01', lastSeen:'2019-11-15' },
    // Mitchell & Partners
    { id:'c23', source:'p-15', target:'o-7', type:'Employee', relationship:'Neutral', strength:5, notes:'Managing Partner.', firstSeen:'2016-07-01', lastSeen:'2026-02-20' },
    { id:'c24', source:'o-7', target:'o-2', type:'Legal Representative', relationship:'Neutral', strength:4, notes:'Legal counsel for Rashid Holdings in EU matters.', firstSeen:'2020-02-01', lastSeen:'2026-01-30' },
    // Sharma Pharma
    { id:'c25', source:'p-13', target:'o-10', type:'Employee', relationship:'Neutral', strength:5, notes:'CEO.', firstSeen:'2010-05-12', lastSeen:'2026-03-10' },
    // Gulf Maritime
    { id:'c26', source:'o-9', target:'o-5', type:'Business Associate', relationship:'Unknown', strength:3, notes:'Shared vessel operations. Cairo-Dubai route.', firstSeen:'2018-11-01', lastSeen:'2026-03-15' },
    { id:'c27', source:'o-9', target:'o-2', type:'Shared Property', relationship:'Neutral', strength:2, notes:'Joint warehouse in Jebel Ali.', firstSeen:'2021-06-01', lastSeen:'2025-12-01' },
    // Co-location events
    { id:'c28', source:'p-1', target:'p-9', type:'Co-location', relationship:'Unknown', strength:2, notes:'Hotel Marjan, Split — 3 co-location events in 2025.', firstSeen:'2025-03-20', lastSeen:'2025-11-14' },
    { id:'c29', source:'p-3', target:'p-15', type:'Communication', relationship:'Neutral', strength:3, notes:'14 phone calls over 6 months.', firstSeen:'2025-06-01', lastSeen:'2026-01-30' },
    // More personal
    { id:'c30', source:'p-6', target:'p-10', type:'Classmate', relationship:'Neutral', strength:1, notes:'Tokyo University exchange program 2014.', firstSeen:'2014-04-01', lastSeen:'2015-03-31' },
    { id:'c31', source:'p-5', target:'p-15', type:'Friend', relationship:'Good', strength:2, notes:'Dublin legal circles.', firstSeen:'2018-09-01', lastSeen:'2025-08-20' },
    { id:'c32', source:'p-8', target:'o-3', type:'Employee', relationship:'Neutral', strength:5, notes:'CEO of Meridian Logistics.', firstSeen:'2019-08-10', lastSeen:'2026-01-20' },
    { id:'c33', source:'p-11', target:'p-7', type:'Military Comrade', relationship:'Good', strength:3, notes:'Egyptian military service 1997-2000.', firstSeen:'1997-01-01', lastSeen:'2000-12-31' },
    { id:'c34', source:'p-1', target:'p-4', type:'Travel Companion', relationship:'Unknown', strength:2, notes:'Moscow trip detected — 2 days overlap at Metropol Hotel.', firstSeen:'2025-09-10', lastSeen:'2025-09-12' },
    { id:'c35', source:'o-6', target:'o-9', type:'Financial Transaction', relationship:'Bad', strength:3, notes:'$2.4M transfer via Panama shell company.', firstSeen:'2024-08-15', lastSeen:'2024-08-15' },
];

export const keyboardShortcuts = [
    { key: 'N', description: 'New Connection' },
    { key: 'T', description: 'Toggle Types panel' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters & zoom' },
    { key: 'Esc', description: 'Close detail / modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
