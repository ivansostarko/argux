/**
 * ARGUX — Report Generator Mock Data
 * Intelligence reports for persons and organizations
 */

export type EntityType = 'person' | 'organization';
export type ReportStatus = 'completed' | 'generating' | 'queued' | 'failed';
export type ReportFormat = 'pdf' | 'docx';

export interface ReportEntity {
    id: number; name: string; type: EntityType; risk: string;
}

export interface Report {
    id: string; entityType: EntityType; entityId: number; entityName: string;
    title: string; status: ReportStatus; format: ReportFormat;
    sections: number; pages: number; size: string;
    generatedBy: string; generatedAt: string; dateFrom: string; dateTo: string;
    classification: string; jobId: string | null;
}

export const persons: ReportEntity[] = [
    { id: 1, name: 'Marko Horvat', type: 'person', risk: 'Critical' },
    { id: 3, name: 'Ahmed Al-Rashid', type: 'person', risk: 'Critical' },
    { id: 7, name: 'Youssef Hassan', type: 'person', risk: 'High' },
    { id: 9, name: 'Carlos Mendoza', type: 'person', risk: 'Critical' },
    { id: 12, name: 'Ivan Babić', type: 'person', risk: 'High' },
    { id: 2, name: 'Elena Petrova', type: 'person', risk: 'Medium' },
    { id: 4, name: 'Viktor Petrenko', type: 'person', risk: 'Medium' },
    { id: 5, name: 'Ana Kovačević', type: 'person', risk: 'Low' },
    { id: 6, name: 'Marco Rossi', type: 'person', risk: 'Medium' },
    { id: 8, name: 'Dragana Simić', type: 'person', risk: 'Low' },
];

export const organizations: ReportEntity[] = [
    { id: 1, name: 'Adriatic Maritime Holdings', type: 'organization', risk: 'Critical' },
    { id: 2, name: 'Balkan Transit Group', type: 'organization', risk: 'High' },
    { id: 3, name: 'Meridian Finance Ltd', type: 'organization', risk: 'High' },
    { id: 4, name: 'EuroChem Distribution', type: 'organization', risk: 'Medium' },
    { id: 5, name: 'Solaris Energy Partners', type: 'organization', risk: 'Low' },
];

export const statusConfig: Record<ReportStatus, { label: string; color: string; icon: string }> = {
    completed:  { label: 'Completed', color: '#22c55e', icon: '✅' },
    generating: { label: 'Generating', color: '#3b82f6', icon: '🔄' },
    queued:     { label: 'Queued', color: '#f59e0b', icon: '⏳' },
    failed:     { label: 'Failed', color: '#ef4444', icon: '❌' },
};

export const riskColors: Record<string, string> = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#22c55e' };

export const personSections = ['AI Summary', 'Profile', 'Statistics', 'Vehicles', 'Known Locations', 'Connections Graph', 'Events Timeline', 'LPR Activity', 'Records', 'Face Recognition', 'Surveillance Apps', 'Social Media', 'Risk Assessment', 'Notes'];
export const orgSections = ['Company Info', 'Linked Persons', 'Connections', 'Data Sources', 'Financial Links', 'Risk Assessment'];

export const mockReports: Report[] = [
    { id: 'rpt-01', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', title: 'Intelligence Report — Marko Horvat (Full)', status: 'completed', format: 'pdf', sections: 14, pages: 23, size: '4.2 MB', generatedBy: 'Maj. Novak', generatedAt: '2026-03-27 09:18', dateFrom: '2026-01-01', dateTo: '2026-03-27', classification: 'CLASSIFIED // NOFORN', jobId: null },
    { id: 'rpt-02', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', title: 'Intelligence Report — Carlos Mendoza', status: 'completed', format: 'pdf', sections: 14, pages: 18, size: '3.1 MB', generatedBy: 'Lt. Perić', generatedAt: '2026-03-26 16:30', dateFrom: '2026-02-01', dateTo: '2026-03-26', classification: 'CLASSIFIED // NOFORN', jobId: null },
    { id: 'rpt-03', entityType: 'organization', entityId: 1, entityName: 'Adriatic Maritime Holdings', title: 'Organization Report — Adriatic Maritime', status: 'completed', format: 'pdf', sections: 6, pages: 12, size: '2.8 MB', generatedBy: 'Maj. Novak', generatedAt: '2026-03-25 11:00', dateFrom: '2025-06-01', dateTo: '2026-03-25', classification: 'CLASSIFIED // NOFORN', jobId: null },
    { id: 'rpt-04', entityType: 'person', entityId: 12, entityName: 'Ivan Babić', title: 'Intelligence Report — Ivan Babić', status: 'completed', format: 'docx', sections: 14, pages: 15, size: '2.4 MB', generatedBy: 'Sgt. Matić', generatedAt: '2026-03-24 14:20', dateFrom: '2026-01-15', dateTo: '2026-03-24', classification: 'CLASSIFIED // NOFORN', jobId: null },
    { id: 'rpt-05', entityType: 'person', entityId: 7, entityName: 'Youssef Hassan', title: 'Intelligence Report — Youssef Hassan', status: 'completed', format: 'pdf', sections: 14, pages: 20, size: '3.6 MB', generatedBy: 'Lt. Perić', generatedAt: '2026-03-23 09:45', dateFrom: '2025-12-01', dateTo: '2026-03-23', classification: 'CLASSIFIED // NOFORN', jobId: null },
    { id: 'rpt-06', entityType: 'person', entityId: 3, entityName: 'Ahmed Al-Rashid', title: 'Intelligence Report — Ahmed Al-Rashid', status: 'completed', format: 'pdf', sections: 14, pages: 22, size: '4.0 MB', generatedBy: 'Maj. Novak', generatedAt: '2026-03-22 10:30', dateFrom: '2025-09-01', dateTo: '2026-03-22', classification: 'CLASSIFIED // NOFORN', jobId: null },
    { id: 'rpt-07', entityType: 'organization', entityId: 2, entityName: 'Balkan Transit Group', title: 'Organization Report — Balkan Transit', status: 'completed', format: 'pdf', sections: 6, pages: 9, size: '1.9 MB', generatedBy: 'Cpt. Horvat', generatedAt: '2026-03-20 15:00', dateFrom: '2026-01-01', dateTo: '2026-03-20', classification: 'CLASSIFIED // NOFORN', jobId: null },
    { id: 'rpt-08', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', title: 'Weekly Summary — Horvat (W13)', status: 'generating', format: 'pdf', sections: 14, pages: 0, size: '', generatedBy: 'Scheduler', generatedAt: '2026-03-27 09:30', dateFrom: '2026-03-20', dateTo: '2026-03-27', classification: 'CLASSIFIED // NOFORN', jobId: 'j-rpt-08' },
    { id: 'rpt-09', entityType: 'person', entityId: 2, entityName: 'Elena Petrova', title: 'Intelligence Report — Elena Petrova', status: 'failed', format: 'pdf', sections: 14, pages: 0, size: '', generatedBy: 'Sgt. Matić', generatedAt: '2026-03-26 18:00', dateFrom: '2026-01-01', dateTo: '2026-03-26', classification: 'CLASSIFIED // NOFORN', jobId: 'j-rpt-09' },
];

export const keyboardShortcuts = [
    { key: 'F', description: 'Focus search' },
    { key: 'N', description: 'New report' },
    { key: 'Esc', description: 'Close modal / panel' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
