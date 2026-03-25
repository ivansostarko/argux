/**
 * ARGUX — Reports Mock Data
 * Report definitions, sections, statuses, keyboard shortcuts
 */
import type { Risk } from './persons';

export type ReportStatus = 'Completed' | 'Generating' | 'Failed' | 'Queued';
export type EntityType = 'person' | 'organization';
export type ViewMode = 'history' | 'generate' | 'preview';

export interface Report {
    id: string; title: string; entityType: EntityType;
    entityId: number; entityName: string; entityRisk: Risk;
    status: ReportStatus; classification: string;
    dateFrom: string; dateTo: string; generatedAt: string;
    generatedBy: string; pages: number; size: string;
    sections: string[]; operationCode: string;
    stats: { events: number; alerts: number; connections: number; lprHits: number; faceMatches: number; files: number };
}

export const statusColors: Record<ReportStatus, string> = { Completed: '#22c55e', Generating: '#f59e0b', Failed: '#ef4444', Queued: '#6b7280' };
export const statusIcons: Record<ReportStatus, string> = { Completed: '✅', Generating: '⏳', Failed: '❌', Queued: '🕐' };

export const personSections = ['AI Summary', 'Profile & Identity', 'Contact Information', 'Known Addresses', 'Employment History', 'Education', 'Vehicles', 'Known Locations', 'Connections Graph', 'Events Timeline', 'LPR Activity', 'Face Recognition Matches', 'Deployed Surveillance', 'Audio Intercepts', 'Social Media', 'Records & Evidence', 'Risk Assessment', 'Notes & Annotations'];
export const orgSections = ['AI Summary', 'Company Profile', 'Linked Persons', 'Financial Analysis', 'Connections Graph', 'Data Sources', 'Vehicles', 'Events Timeline', 'Records & Evidence', 'Risk Assessment', 'Notes'];

export const mockReports: Report[] = [
    { id: 'rpt-01', title: 'HAWK Subject Profile — Marko Horvat', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', entityRisk: 'Critical', status: 'Completed', classification: 'TOP SECRET // NOFORN', dateFrom: '2026-02-24', dateTo: '2026-03-24', generatedAt: '2026-03-24 06:00', generatedBy: 'Col. Tomić', pages: 34, size: '8.2 MB', sections: personSections, operationCode: 'HAWK', stats: { events: 847, alerts: 23, connections: 12, lprHits: 31, faceMatches: 7, files: 9 } },
    { id: 'rpt-02', title: 'Weekly Intelligence — Horvat (Week 4)', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2026-03-18', dateTo: '2026-03-24', generatedAt: '2026-03-24 06:00', generatedBy: 'Workflow: Nightly Sweep', pages: 28, size: '5.4 MB', sections: ['AI Summary', 'Events Timeline', 'LPR Activity', 'Connections Graph', 'Risk Assessment'], operationCode: 'HAWK', stats: { events: 142, alerts: 8, connections: 5, lprHits: 12, faceMatches: 3, files: 4 } },
    { id: 'rpt-03', title: 'Subject Profile — Carlos Mendoza', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2026-03-01', dateTo: '2026-03-24', generatedAt: '2026-03-23 14:00', generatedBy: 'Cpt. Horvat', pages: 22, size: '4.1 MB', sections: personSections.filter(s => s !== 'Education'), operationCode: 'HAWK', stats: { events: 312, alerts: 11, connections: 8, lprHits: 14, faceMatches: 2, files: 4 } },
    { id: 'rpt-04', title: 'Counter-Surveillance — Mendoza', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET', dateFrom: '2026-03-20', dateTo: '2026-03-24', generatedAt: '2026-03-24 03:37', generatedBy: 'AI Analysis', pages: 12, size: '2.8 MB', sections: ['AI Summary', 'Events Timeline', 'Known Locations', 'Risk Assessment'], operationCode: 'HAWK', stats: { events: 45, alerts: 4, connections: 3, lprHits: 6, faceMatches: 0, files: 2 } },
    { id: 'rpt-05', title: 'Subject Profile — Ivan Babić', entityType: 'person', entityId: 12, entityName: 'Ivan Babić', entityRisk: 'High', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2026-03-01', dateTo: '2026-03-23', generatedAt: '2026-03-23 10:00', generatedBy: 'Sgt. Matić', pages: 18, size: '3.6 MB', sections: personSections, operationCode: 'HAWK', stats: { events: 198, alerts: 6, connections: 6, lprHits: 20, faceMatches: 4, files: 3 } },
    { id: 'rpt-06', title: 'Subject Profile — Omar Hassan', entityType: 'person', entityId: 7, entityName: 'Omar Hassan', entityRisk: 'High', status: 'Completed', classification: 'SECRET', dateFrom: '2026-03-10', dateTo: '2026-03-23', generatedAt: '2026-03-23 10:00', generatedBy: 'Sgt. Matić', pages: 15, size: '2.9 MB', sections: personSections.filter(s => !['Education', 'Social Media'].includes(s)), operationCode: 'HAWK', stats: { events: 156, alerts: 5, connections: 4, lprHits: 8, faceMatches: 1, files: 3 } },
    { id: 'rpt-07', title: 'Financial Intel — Ahmed Al-Rashid', entityType: 'person', entityId: 3, entityName: 'Ahmed Al-Rashid', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2026-01-01', dateTo: '2026-03-24', generatedAt: '2026-03-20 09:00', generatedBy: 'Cpt. Galić', pages: 26, size: '6.2 MB', sections: [...personSections, 'Financial Transactions', 'Shell Company Analysis'], operationCode: 'GLACIER', stats: { events: 89, alerts: 3, connections: 9, lprHits: 4, faceMatches: 1, files: 2 } },
    { id: 'rpt-08', title: 'Org — Alpha Security Group', entityType: 'organization', entityId: 1, entityName: 'Alpha Security Group', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2025-06-01', dateTo: '2026-03-24', generatedAt: '2026-03-15 08:00', generatedBy: 'Col. Tomić', pages: 42, size: '11.3 MB', sections: orgSections, operationCode: 'HAWK', stats: { events: 1240, alerts: 34, connections: 18, lprHits: 45, faceMatches: 12, files: 4 } },
    { id: 'rpt-09', title: 'Org — Rashid Holdings International', entityType: 'organization', entityId: 2, entityName: 'Rashid Holdings International', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2025-01-01', dateTo: '2026-03-24', generatedAt: '2026-03-20 14:00', generatedBy: 'Cpt. Galić', pages: 38, size: '9.8 MB', sections: [...orgSections, 'Shell Company Network', 'Sanctions Screening'], operationCode: 'GLACIER', stats: { events: 456, alerts: 12, connections: 14, lprHits: 8, faceMatches: 3, files: 3 } },
    { id: 'rpt-10', title: 'Org — Falcon Trading LLC', entityType: 'organization', entityId: 5, entityName: 'Falcon Trading LLC', entityRisk: 'High', status: 'Completed', classification: 'SECRET', dateFrom: '2026-01-01', dateTo: '2026-03-24', generatedAt: '2026-03-18 09:00', generatedBy: 'Lt. Petrić', pages: 16, size: '3.1 MB', sections: orgSections, operationCode: 'HAWK', stats: { events: 78, alerts: 4, connections: 7, lprHits: 3, faceMatches: 0, files: 1 } },
    { id: 'rpt-11', title: 'Daily Briefing — HAWK #24', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', entityRisk: 'Critical', status: 'Generating', classification: 'SECRET', dateFrom: '2026-03-23', dateTo: '2026-03-24', generatedAt: '2026-03-24 06:00', generatedBy: 'Workflow: Nightly Sweep', pages: 0, size: '—', sections: ['AI Summary', 'Events Timeline', 'Alerts'], operationCode: 'HAWK', stats: { events: 0, alerts: 0, connections: 0, lprHits: 0, faceMatches: 0, files: 0 } },
    { id: 'rpt-12', title: 'Li Wei — Shanghai Observation', entityType: 'person', entityId: 10, entityName: 'Li Wei', entityRisk: 'Medium', status: 'Failed', classification: 'SECRET // NOFORN', dateFrom: '2026-03-01', dateTo: '2026-03-18', generatedAt: '2026-03-18 06:00', generatedBy: 'Cpt. Perić', pages: 0, size: '—', sections: personSections, operationCode: 'PHOENIX', stats: { events: 0, alerts: 0, connections: 0, lprHits: 0, faceMatches: 0, files: 0 } },
];

export const allOps = [...new Set(mockReports.map(r => r.operationCode))];

export const keyboardShortcuts = [
    { key: '1', description: 'Report History view' },
    { key: '2', description: 'Generate New view' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters' },
    { key: 'Esc', description: 'Close detail / modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
