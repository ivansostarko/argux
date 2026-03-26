/**
 * ARGUX — Storage Browser Mock Data
 * 30 files across persons and orgs, folder tree, file types, shortcuts
 */
import { mockPersons } from './persons';
import { mockOrganizations } from './organizations';

export type FileType = 'audio' | 'video' | 'photo' | 'document' | 'transcript' | 'report' | 'evidence' | 'social' | 'camera' | 'folder';
export type EntityType = 'person' | 'org';

export interface StorageFile {
    id: string; name: string; type: FileType; size: string; sizeBytes: number;
    mimeType: string; entityType: EntityType; entityId: number; entityName: string;
    folder: string; path: string;
    uploadedBy: string; uploadedAt: string; modifiedAt: string;
    tags: string[]; transcription?: string; duration?: string;
    resolution?: string; pages?: number; source?: string;
}
export interface FolderNode {
    id: string; name: string; icon: string; entityType?: EntityType; entityId?: number;
    children: FolderNode[]; fileCount: number; totalSize: string;
}

export const typeConfig: Record<FileType, { icon: string; color: string; label: string }> = {
    audio: { icon: '🎙️', color: '#f59e0b', label: 'Audio' }, video: { icon: '🎥', color: '#3b82f6', label: 'Video' },
    photo: { icon: '📷', color: '#22c55e', label: 'Photo' }, document: { icon: '📄', color: '#6b7280', label: 'Document' },
    transcript: { icon: '📝', color: '#8b5cf6', label: 'Transcript' }, report: { icon: '📊', color: '#ef4444', label: 'Report' },
    evidence: { icon: '🔒', color: '#ec4899', label: 'Evidence' }, social: { icon: '💬', color: '#06b6d4', label: 'Social' },
    camera: { icon: '📹', color: '#10b981', label: 'Camera' }, folder: { icon: '📁', color: '#f59e0b', label: 'Folder' },
};

const defaultSubfolders = ['Audio', 'Video', 'Photos', 'Documents', 'Transcripts', 'Reports', 'Evidence', 'Social Media', 'Camera Captures'];
const sfTypeMap: Record<string, FileType> = { 'Audio': 'audio', 'Video': 'video', 'Photos': 'photo', 'Documents': 'document', 'Transcripts': 'transcript', 'Reports': 'report', 'Evidence': 'evidence', 'Social Media': 'social', 'Camera Captures': 'camera' };

export function buildTree(): FolderNode[] {
    const persons: FolderNode = { id: 'persons', name: 'Persons', icon: '👥', children: mockPersons.slice(0, 12).map(p => ({
        id: `p-${p.id}`, name: `${p.firstName} ${p.lastName}`, icon: '🧑', entityType: 'person' as EntityType, entityId: p.id,
        children: defaultSubfolders.map(sf => ({ id: `p-${p.id}-${sf.toLowerCase().replace(/\s/g, '-')}`, name: sf, icon: typeConfig[sfTypeMap[sf] || 'folder'].icon, children: [], fileCount: 0, totalSize: '—' })),
        fileCount: 0, totalSize: '—',
    })), fileCount: 0, totalSize: '—' };
    const orgs: FolderNode = { id: 'orgs', name: 'Organizations', icon: '🏢', children: mockOrganizations.slice(0, 10).map(o => ({
        id: `o-${o.id}`, name: o.name, icon: '🏢', entityType: 'org' as EntityType, entityId: o.id,
        children: defaultSubfolders.map(sf => ({ id: `o-${o.id}-${sf.toLowerCase().replace(/\s/g, '-')}`, name: sf, icon: typeConfig[sfTypeMap[sf] || 'folder'].icon, children: [], fileCount: 0, totalSize: '—' })),
        fileCount: 0, totalSize: '—',
    })), fileCount: 0, totalSize: '—' };
    return [persons, orgs];
}

export const mockFiles: StorageFile[] = [
    { id: 'f01', name: 'horvat_phone_intercept_20260324.wav', type: 'audio', size: '4.2 MB', sizeBytes: 4400000, mimeType: 'audio/wav', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Audio', path: '/Persons/Marko Horvat/Audio', uploadedBy: 'Sgt. Matić', uploadedAt: '2026-03-24 08:22', modifiedAt: '2026-03-24 08:22', tags: ['intercept', 'keyword-flagged', 'croatian'], transcription: '...delivery confirmed for Thursday night at dock 7...', duration: '4:12', source: 'Faster-Whisper' },
    { id: 'f02', name: 'horvat_port_surveillance_cam07.mp4', type: 'video', size: '128 MB', sizeBytes: 134000000, mimeType: 'video/mp4', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Video', path: '/Persons/Marko Horvat/Video', uploadedBy: 'System', uploadedAt: '2026-03-24 09:48', modifiedAt: '2026-03-24 09:48', tags: ['surveillance', 'face-match', 'port'], duration: '45:00', resolution: '4K', source: 'CAM-07' },
    { id: 'f03', name: 'horvat_vukovarska_lpr_capture.jpg', type: 'photo', size: '1.8 MB', sizeBytes: 1900000, mimeType: 'image/jpeg', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Photos', path: '/Persons/Marko Horvat/Photos', uploadedBy: 'LPR System', uploadedAt: '2026-03-24 09:31', modifiedAt: '2026-03-24 09:31', tags: ['lpr', 'ZG-1847-AB'], resolution: '4K', source: 'LPR Vukovarska' },
    { id: 'f04', name: 'HAWK_Weekly_Report_4.pdf', type: 'report', size: '2.4 MB', sizeBytes: 2500000, mimeType: 'application/pdf', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Reports', path: '/Persons/Marko Horvat/Reports', uploadedBy: 'Report Gen', uploadedAt: '2026-03-22 06:00', modifiedAt: '2026-03-22 06:00', tags: ['weekly', 'HAWK', 'classified'], pages: 28, source: 'Report Generator' },
    { id: 'f05', name: 'horvat_colocation_evidence_042.zip', type: 'evidence', size: '18.5 MB', sizeBytes: 19400000, mimeType: 'application/zip', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Evidence', path: '/Persons/Marko Horvat/Evidence', uploadedBy: 'Workflow', uploadedAt: '2026-03-24 09:15', modifiedAt: '2026-03-24 09:15', tags: ['co-location', 'mendoza', 'GPS-trail'], source: 'Workflow Engine' },
    { id: 'f06', name: 'horvat_facebook_archive.json', type: 'social', size: '890 KB', sizeBytes: 912000, mimeType: 'application/json', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Social Media', path: '/Persons/Marko Horvat/Social Media', uploadedBy: 'Scraper', uploadedAt: '2026-03-20 14:00', modifiedAt: '2026-03-20 14:00', tags: ['facebook', 'scraped'], source: 'OSINT Engine' },
    { id: 'f08', name: 'intercept_transcript_20260324.txt', type: 'transcript', size: '12 KB', sizeBytes: 12000, mimeType: 'text/plain', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Transcripts', path: '/Persons/Marko Horvat/Transcripts', uploadedBy: 'Faster-Whisper', uploadedAt: '2026-03-24 08:30', modifiedAt: '2026-03-24 08:30', tags: ['transcript', 'auto', 'keyword-flagged'], pages: 3, source: 'Faster-Whisper' },
    { id: 'f09', name: 'horvat_movement_analysis.pdf', type: 'document', size: '1.1 MB', sizeBytes: 1150000, mimeType: 'application/pdf', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Documents', path: '/Persons/Marko Horvat/Documents', uploadedBy: 'AI', uploadedAt: '2026-03-23 06:00', modifiedAt: '2026-03-23 06:00', tags: ['analysis', 'movement', 'AI'], pages: 8, source: 'LLaMA 3.1' },
    { id: 'f07', name: 'horvat_parking_garage_b2.mp4', type: 'camera', size: '456 MB', sizeBytes: 478000000, mimeType: 'video/mp4', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Camera Captures', path: '/Persons/Marko Horvat/Camera Captures', uploadedBy: 'System', uploadedAt: '2026-03-24 06:48', modifiedAt: '2026-03-24 06:48', tags: ['parking', 'garage-B2'], duration: '45:00', resolution: '1080p', source: 'MinIO' },
    { id: 'f10', name: 'mendoza_counter_surv_photos.zip', type: 'evidence', size: '34 MB', sizeBytes: 35600000, mimeType: 'application/zip', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', folder: 'Evidence', path: '/Persons/Carlos Mendoza/Evidence', uploadedBy: 'Alpha', uploadedAt: '2026-03-23 09:30', modifiedAt: '2026-03-23 09:30', tags: ['counter-surveillance', '12-images'], source: 'Field Team' },
    { id: 'f11', name: 'mendoza_sim_swap_log.json', type: 'document', size: '5 KB', sizeBytes: 5000, mimeType: 'application/json', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', folder: 'Documents', path: '/Persons/Carlos Mendoza/Documents', uploadedBy: 'IMSI', uploadedAt: '2026-03-24 02:45', modifiedAt: '2026-03-24 02:45', tags: ['sim-swap', 'imsi'], source: 'IMSI Catcher' },
    { id: 'f13', name: 'mendoza_speed_violation.mp4', type: 'camera', size: '89 MB', sizeBytes: 93300000, mimeType: 'video/mp4', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', folder: 'Camera Captures', path: '/Persons/Carlos Mendoza/Camera Captures', uploadedBy: 'System', uploadedAt: '2026-03-23 22:08', modifiedAt: '2026-03-23 22:08', tags: ['speed', '118kmh', 'evasive'], duration: '2:15', resolution: '1080p', source: 'Street Cam A1' },
    { id: 'f14', name: 'babic_diplomatic_photos.zip', type: 'photo', size: '22 MB', sizeBytes: 23000000, mimeType: 'application/zip', entityType: 'person', entityId: 12, entityName: 'Ivan Babić', folder: 'Photos', path: '/Persons/Ivan Babić/Photos', uploadedBy: 'Alpha', uploadedAt: '2026-03-23 15:10', modifiedAt: '2026-03-23 15:10', tags: ['diplomatic-quarter', 'embassy'], source: 'Field Team' },
    { id: 'f17', name: 'hassan_routine_call_arabic.wav', type: 'audio', size: '3.8 MB', sizeBytes: 3980000, mimeType: 'audio/wav', entityType: 'person', entityId: 7, entityName: 'Omar Hassan', folder: 'Audio', path: '/Persons/Omar Hassan/Audio', uploadedBy: 'Monitor', uploadedAt: '2026-03-24 07:30', modifiedAt: '2026-03-24 07:30', tags: ['arabic', 'routine'], duration: '4:12', transcription: 'Routine personal call. No operational intel.', source: 'Faster-Whisper' },
    { id: 'f19', name: 'hassan_storage_facility.zip', type: 'photo', size: '15 MB', sizeBytes: 15700000, mimeType: 'application/zip', entityType: 'person', entityId: 7, entityName: 'Omar Hassan', folder: 'Photos', path: '/Persons/Omar Hassan/Photos', uploadedBy: 'Bravo', uploadedAt: '2026-03-23 16:30', modifiedAt: '2026-03-23 16:30', tags: ['storage', 'visit-4', '48h-interval'], source: 'Field Team' },
    { id: 'f20', name: 'alrashid_cargo_invoices.xlsx', type: 'document', size: '2.1 MB', sizeBytes: 2200000, mimeType: 'application/vnd.openxmlformats', entityType: 'person', entityId: 3, entityName: 'Ahmed Al-Rashid', folder: 'Documents', path: '/Persons/Ahmed Al-Rashid/Documents', uploadedBy: 'Financial Intel', uploadedAt: '2026-03-18 09:00', modifiedAt: '2026-03-20 14:30', tags: ['over-invoicing', 'AML', '12-shipments'], pages: 15, source: 'Financial Team' },
    { id: 'f21', name: 'alrashid_airport_lpr.jpg', type: 'photo', size: '2.3 MB', sizeBytes: 2400000, mimeType: 'image/jpeg', entityType: 'person', entityId: 3, entityName: 'Ahmed Al-Rashid', folder: 'Photos', path: '/Persons/Ahmed Al-Rashid/Photos', uploadedBy: 'LPR', uploadedAt: '2026-03-24 07:30', modifiedAt: '2026-03-24 07:30', tags: ['lpr', 'SA-9012-RH', 'airport'], resolution: '4K', source: 'LPR Airport' },
    { id: 'f30', name: 'asg_company_registration.pdf', type: 'document', size: '450 KB', sizeBytes: 461000, mimeType: 'application/pdf', entityType: 'org', entityId: 1, entityName: 'Alpha Security Group', folder: 'Documents', path: '/Orgs/Alpha Security Group/Documents', uploadedBy: 'Registry', uploadedAt: '2024-06-15 08:00', modifiedAt: '2025-11-20 10:00', tags: ['registration', 'official'], pages: 12, source: 'Business Registry' },
    { id: 'f31', name: 'asg_hq_afterhours.mp4', type: 'camera', size: '234 MB', sizeBytes: 245000000, mimeType: 'video/mp4', entityType: 'org', entityId: 1, entityName: 'Alpha Security Group', folder: 'Camera Captures', path: '/Orgs/Alpha Security Group/Camera Captures', uploadedBy: 'System', uploadedAt: '2026-03-24 02:30', modifiedAt: '2026-03-24 02:30', tags: ['after-hours', 'motion', '02:30'], duration: '8:15', resolution: '4K', source: 'CAM-01' },
    { id: 'f32', name: 'asg_financial_audit_2025.pdf', type: 'report', size: '5.8 MB', sizeBytes: 6080000, mimeType: 'application/pdf', entityType: 'org', entityId: 1, entityName: 'Alpha Security Group', folder: 'Reports', path: '/Orgs/Alpha Security Group/Reports', uploadedBy: 'Financial Intel', uploadedAt: '2026-01-15 09:00', modifiedAt: '2026-02-28 16:00', tags: ['financial', 'audit', 'suspicious'], pages: 42, source: 'Financial Analysis' },
    { id: 'f34', name: 'rashid_shell_companies.pdf', type: 'report', size: '3.4 MB', sizeBytes: 3560000, mimeType: 'application/pdf', entityType: 'org', entityId: 2, entityName: 'Rashid Holdings', folder: 'Reports', path: '/Orgs/Rashid Holdings/Reports', uploadedBy: 'OpenCorporates', uploadedAt: '2026-03-24 08:00', modifiedAt: '2026-03-24 08:00', tags: ['shell-companies', '2-new'], pages: 18, source: 'OpenCorporates' },
    { id: 'f37', name: 'falcon_bank_transactions.csv', type: 'document', size: '1.9 MB', sizeBytes: 1990000, mimeType: 'text/csv', entityType: 'org', entityId: 5, entityName: 'Falcon Trading LLC', folder: 'Documents', path: '/Orgs/Falcon Trading/Documents', uploadedBy: 'FINA', uploadedAt: '2026-03-24 10:12', modifiedAt: '2026-03-24 10:12', tags: ['bank', 'AML-flagged'], source: 'Bank Monitor' },
];

export const keyboardShortcuts = [
    { key: 'U', description: 'Toggle upload zone' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset to all files' },
    { key: 'Esc', description: 'Close detail / modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
