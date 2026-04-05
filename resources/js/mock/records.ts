/**
 * ARGUX — Records / Evidence Management Mock Data
 * Chain of custody tracking for evidence items
 */

export type RecordType = 'document' | 'photo' | 'video' | 'audio' | 'digital' | 'physical';
export type CustodyAction = 'created' | 'accessed' | 'modified' | 'transferred' | 'exported';

export interface CustodyEntry { id: string; action: CustodyAction; user: string; timestamp: string; details: string; }
export interface AssignedEntity { id: number; name: string; type: 'person' | 'organization'; }

export interface EvidenceRecord {
    id: string; title: string; type: RecordType; description: string;
    fileUrl: string | null; fileSize: string | null; mimeType: string | null;
    assignedPersons: AssignedEntity[]; assignedOrgs: AssignedEntity[];
    transcript: string | null; createdBy: string; createdAt: string; updatedAt: string;
    custody: CustodyEntry[]; tags: string[];
}

export const typeConfig: Record<RecordType, { label: string; icon: string; color: string }> = {
    document: { label: 'Document', icon: '📄', color: '#f59e0b' },
    photo:    { label: 'Photo', icon: '📷', color: '#22c55e' },
    video:    { label: 'Video', icon: '🎬', color: '#3b82f6' },
    audio:    { label: 'Audio', icon: '🎵', color: '#8b5cf6' },
    digital:  { label: 'Digital', icon: '💾', color: '#06b6d4' },
    physical: { label: 'Physical', icon: '📦', color: '#f97316' },
};

export const custodyActionConfig: Record<CustodyAction, { label: string; color: string }> = {
    created:     { label: 'Created', color: '#22c55e' },
    accessed:    { label: 'Accessed', color: '#3b82f6' },
    modified:    { label: 'Modified', color: '#f59e0b' },
    transferred: { label: 'Transferred', color: '#8b5cf6' },
    exported:    { label: 'Exported', color: '#06b6d4' },
};

export const availablePersons: AssignedEntity[] = [
    { id: 1, name: 'Marko Horvat', type: 'person' },{ id: 9, name: 'Carlos Mendoza', type: 'person' },
    { id: 12, name: 'Ivan Babić', type: 'person' },{ id: 7, name: 'Youssef Hassan', type: 'person' },
    { id: 3, name: 'Ahmed Al-Rashid', type: 'person' },{ id: 2, name: 'Elena Petrova', type: 'person' },
];
export const availableOrgs: AssignedEntity[] = [
    { id: 101, name: 'Adriatic Maritime Holdings', type: 'organization' },{ id: 102, name: 'Balkan Transit Group', type: 'organization' },
    { id: 103, name: 'Meridian Finance Ltd', type: 'organization' },
];

export const mockRecords: EvidenceRecord[] = [
    { id: 'rec-01', title: 'Horvat Port Meeting — Surveillance Video', type: 'video', description: 'Extended surveillance footage of Horvat meeting unknown male at Port Terminal East. Subject arrived 08:32, departed 09:14. Exchanged manila envelope.', fileUrl: '/storage/records/horvat_port_meeting.mp4', fileSize: '1.2 GB', mimeType: 'video/mp4', assignedPersons: [{ id: 1, name: 'Marko Horvat', type: 'person' }], assignedOrgs: [{ id: 101, name: 'Adriatic Maritime Holdings', type: 'organization' }], transcript: 'No speech detected — ambient surveillance. Visual: two males, brief handshake, envelope exchange at 08:47.', createdBy: 'Sgt. Matić', createdAt: '2026-03-27 09:30', updatedAt: '2026-03-27 09:30', custody: [{ id: 'c01', action: 'created', user: 'Sgt. Matić', timestamp: '2026-03-27 09:30', details: 'Imported from CAM-07 footage' }, { id: 'c02', action: 'accessed', user: 'Maj. Novak', timestamp: '2026-03-27 09:45', details: 'Viewed for intelligence report' }], tags: ['surveillance', 'port', 'meeting', 'envelope'] },
    { id: 'rec-02', title: 'Horvat Phone Intercept — Voice Recording', type: 'audio', description: 'Phone intercept of Horvat discussing Thursday port arrangements. Mentions "documents" and counter-surveillance awareness.', fileUrl: '/storage/records/horvat_intercept_01.wav', fileSize: '48 MB', mimeType: 'audio/wav', assignedPersons: [{ id: 1, name: 'Marko Horvat', type: 'person' }], assignedOrgs: [], transcript: '"...meeting at the port, Thursday... bring the documents... make sure nobody follows... the usual place, gate 7..."', createdBy: 'Sgt. Matić', createdAt: '2026-03-26 14:20', updatedAt: '2026-03-27 08:00', custody: [{ id: 'c03', action: 'created', user: 'Sgt. Matić', timestamp: '2026-03-26 14:20', details: 'Captured via phone intercept system' }, { id: 'c04', action: 'modified', user: 'AI System', timestamp: '2026-03-26 14:35', details: 'Faster-Whisper transcription completed (large-v3)' }, { id: 'c05', action: 'accessed', user: 'Lt. Perić', timestamp: '2026-03-27 08:00', details: 'Reviewed transcript for keyword analysis' }], tags: ['intercept', 'phone', 'voice', 'port', 'thursday'] },
    { id: 'rec-03', title: 'Mendoza Passport — Identity Document', type: 'document', description: 'Scanned copy of Colombian passport for Carlos Mendoza. Passport number: CC-87234591. Expires: 2028-06-15.', fileUrl: '/storage/records/mendoza_passport.pdf', fileSize: '1.4 MB', mimeType: 'application/pdf', assignedPersons: [{ id: 9, name: 'Carlos Mendoza', type: 'person' }], assignedOrgs: [], transcript: null, createdBy: 'Lt. Perić', createdAt: '2026-03-20 09:30', updatedAt: '2026-03-20 09:30', custody: [{ id: 'c06', action: 'created', user: 'Lt. Perić', timestamp: '2026-03-20 09:30', details: 'Scanned from physical copy obtained via border control' }], tags: ['passport', 'identity', 'colombian'] },
    { id: 'rec-04', title: 'Horvat Café Meeting — Photo Series', type: 'photo', description: '12 surveillance photographs of Horvat at Café Europa with Babić. Subject meeting lasted approximately 45 minutes.', fileUrl: '/storage/records/horvat_cafe_photos.zip', fileSize: '48 MB', mimeType: 'application/zip', assignedPersons: [{ id: 1, name: 'Marko Horvat', type: 'person' }, { id: 12, name: 'Ivan Babić', type: 'person' }], assignedOrgs: [], transcript: null, createdBy: 'Sgt. Matić', createdAt: '2026-03-25 16:30', updatedAt: '2026-03-25 17:00', custody: [{ id: 'c07', action: 'created', user: 'Sgt. Matić', timestamp: '2026-03-25 16:30', details: 'Captured with Nikon D850 from position Alpha' }, { id: 'c08', action: 'modified', user: 'Sgt. Matić', timestamp: '2026-03-25 17:00', details: 'Added metadata and GPS coordinates' }], tags: ['surveillance', 'cafe', 'meeting', 'babic'] },
    { id: 'rec-05', title: 'Al-Rashid Phone Extract — Digital Evidence', type: 'digital', description: 'Complete phone data extraction from Al-Rashid device. Contains SMS, call logs, contacts, calendar, location history, and installed apps.', fileUrl: '/storage/records/alrashid_phone.xlsx', fileSize: '3.6 MB', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', assignedPersons: [{ id: 3, name: 'Ahmed Al-Rashid', type: 'person' }], assignedOrgs: [], transcript: null, createdBy: 'Lt. Perić', createdAt: '2026-03-24 14:00', updatedAt: '2026-03-25 09:00', custody: [{ id: 'c09', action: 'created', user: 'Lt. Perić', timestamp: '2026-03-24 14:00', details: 'Extracted via forensic toolkit (Cellebrite UFED)' }, { id: 'c10', action: 'accessed', user: 'Maj. Novak', timestamp: '2026-03-25 09:00', details: 'Cross-referenced with known contacts database' }], tags: ['phone', 'extraction', 'cellebrite', 'contacts'] },
    { id: 'rec-06', title: 'Adriatic Maritime — Corporate Registration', type: 'document', description: 'Complete corporate registration records for Adriatic Maritime Holdings d.o.o. including shareholders, directors, and beneficial ownership chain.', fileUrl: '/storage/records/adriatic_corp.pdf', fileSize: '12 MB', mimeType: 'application/pdf', assignedPersons: [{ id: 1, name: 'Marko Horvat', type: 'person' }], assignedOrgs: [{ id: 101, name: 'Adriatic Maritime Holdings', type: 'organization' }], transcript: null, createdBy: 'Maj. Novak', createdAt: '2026-03-23 09:00', updatedAt: '2026-03-23 09:00', custody: [{ id: 'c11', action: 'created', user: 'Maj. Novak', timestamp: '2026-03-23 09:00', details: 'Retrieved from National Business Registry (SOAP API)' }], tags: ['corporate', 'registry', 'shareholders', 'beneficial-ownership'] },
    { id: 'rec-07', title: 'Hassan Arabic Intercept — Text Document', type: 'document', description: 'Intercepted Arabic text communications from Hassan. Pending NLLB-200 translation from Arabic to Croatian.', fileUrl: '/storage/records/hassan_intercept.txt', fileSize: '24 KB', mimeType: 'text/plain', assignedPersons: [{ id: 7, name: 'Youssef Hassan', type: 'person' }], assignedOrgs: [], transcript: 'Arabic text — translation pending. Initial keyword scan flagged: shipping, Thursday, port, payment.', createdBy: 'Lt. Perić', createdAt: '2026-03-27 08:10', updatedAt: '2026-03-27 08:10', custody: [{ id: 'c12', action: 'created', user: 'Lt. Perić', timestamp: '2026-03-27 08:10', details: 'Intercepted from encrypted messaging platform' }], tags: ['arabic', 'intercept', 'translation-pending'] },
    { id: 'rec-08', title: 'Babić Warehouse — Night Surveillance', type: 'video', description: 'Night vision surveillance of Babić loitering near warehouse district. Camera CAM-12 triggered loitering alert at 03:15.', fileUrl: '/storage/records/babic_warehouse.mp4', fileSize: '540 MB', mimeType: 'video/mp4', assignedPersons: [{ id: 12, name: 'Ivan Babić', type: 'person' }], assignedOrgs: [], transcript: null, createdBy: 'CAM-12', createdAt: '2026-03-26 03:30', updatedAt: '2026-03-26 03:30', custody: [{ id: 'c13', action: 'created', user: 'System', timestamp: '2026-03-26 03:30', details: 'Auto-captured by loitering detection algorithm' }], tags: ['night-vision', 'warehouse', 'loitering', 'alert'] },
    { id: 'rec-09', title: 'Seized USB Drive — Physical Evidence', type: 'physical', description: 'USB flash drive (Kingston 32GB) seized during search of Mendoza vehicle. Chain of custody initiated. Awaiting forensic imaging.', fileUrl: null, fileSize: null, mimeType: null, assignedPersons: [{ id: 9, name: 'Carlos Mendoza', type: 'person' }], assignedOrgs: [{ id: 102, name: 'Balkan Transit Group', type: 'organization' }], transcript: null, createdBy: 'Cpt. Horvat', createdAt: '2026-03-22 18:45', updatedAt: '2026-03-24 10:00', custody: [{ id: 'c14', action: 'created', user: 'Cpt. Horvat', timestamp: '2026-03-22 18:45', details: 'Seized from glove compartment, vehicle plate ZG-4421-MN' }, { id: 'c15', action: 'transferred', user: 'Cpt. Horvat', timestamp: '2026-03-23 08:00', details: 'Transferred to Digital Forensics Lab, evidence bag #DF-2026-0342' }, { id: 'c16', action: 'accessed', user: 'Digital Forensics', timestamp: '2026-03-24 10:00', details: 'Forensic imaging initiated (FTK Imager)' }], tags: ['usb', 'seized', 'physical', 'forensics', 'vehicle'] },
    { id: 'rec-10', title: 'Financial Transaction Analysis — Meridian', type: 'digital', description: 'Suspicious transaction patterns from Meridian Finance Ltd bank monitoring. 23 flagged transactions totaling €847,000 over 90 days.', fileUrl: '/storage/records/meridian_transactions.xlsx', fileSize: '5.4 MB', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', assignedPersons: [], assignedOrgs: [{ id: 103, name: 'Meridian Finance Ltd', type: 'organization' }], transcript: null, createdBy: 'Maj. Novak', createdAt: '2026-03-21 16:00', updatedAt: '2026-03-21 16:00', custody: [{ id: 'c17', action: 'created', user: 'Maj. Novak', timestamp: '2026-03-21 16:00', details: 'Generated from Bank Transaction Monitor (AML flagged)' }, { id: 'c18', action: 'exported', user: 'Maj. Novak', timestamp: '2026-03-21 16:30', details: 'Exported to intelligence report rpt-03' }], tags: ['financial', 'transactions', 'AML', 'suspicious'] },
    { id: 'rec-11', title: 'Mendoza Vehicle Follow — Dashcam', type: 'video', description: 'Dashcam recording from undercover vehicle following Mendoza from port to warehouse district. Duration 22 minutes.', fileUrl: '/storage/records/mendoza_follow.mp4', fileSize: '680 MB', mimeType: 'video/mp4', assignedPersons: [{ id: 9, name: 'Carlos Mendoza', type: 'person' }], assignedOrgs: [], transcript: null, createdBy: 'Cpt. Horvat', createdAt: '2026-03-26 22:15', updatedAt: '2026-03-26 22:15', custody: [{ id: 'c19', action: 'created', user: 'Cpt. Horvat', timestamp: '2026-03-26 22:15', details: 'Dashcam upload from undercover unit Bravo-3' }], tags: ['dashcam', 'follow', 'vehicle', 'undercover'] },
    { id: 'rec-12', title: 'Petrova Social Media Export', type: 'digital', description: 'Aggregated social media posts from Elena Petrova across Instagram and Telegram. 90-day collection period.', fileUrl: '/storage/records/petrova_social.pdf', fileSize: '8.2 MB', mimeType: 'application/pdf', assignedPersons: [{ id: 2, name: 'Elena Petrova', type: 'person' }], assignedOrgs: [], transcript: null, createdBy: 'System', createdAt: '2026-03-20 12:00', updatedAt: '2026-03-20 12:00', custody: [{ id: 'c20', action: 'created', user: 'Social Scraper', timestamp: '2026-03-20 12:00', details: 'Auto-generated from social media scraper output' }], tags: ['social', 'instagram', 'telegram', 'scraper'] },
];

export const keyboardShortcuts = [
    { key: 'F', description: 'Focus search' },
    { key: 'N', description: 'New record' },
    { key: 'Esc', description: 'Close modal / detail' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
