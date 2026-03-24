import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockPersons } from '../../mock/persons';
import { mockOrganizations } from '../../mock/organizations';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Storage Browser  ·  MinIO File Manager
   Split-panel: entity folder tree + file list + upload
   ═══════════════════════════════════════════════════════════════ */

type FileType = 'audio' | 'video' | 'photo' | 'document' | 'transcript' | 'report' | 'evidence' | 'social' | 'camera' | 'folder';
type EntityType = 'person' | 'org';

interface StorageFile {
    id: string; name: string; type: FileType; size: string; sizeBytes: number;
    mimeType: string; entityType: EntityType; entityId: number; entityName: string;
    folder: string; path: string;
    uploadedBy: string; uploadedAt: string; modifiedAt: string;
    tags: string[]; transcription?: string; duration?: string;
    resolution?: string; pages?: number; source?: string;
}

interface FolderNode {
    id: string; name: string; icon: string; entityType?: EntityType; entityId?: number;
    children: FolderNode[]; fileCount: number; totalSize: string;
}

const typeConfig: Record<FileType, { icon: string; color: string; label: string }> = {
    audio: { icon: '🎙️', color: '#f59e0b', label: 'Audio' },
    video: { icon: '🎥', color: '#3b82f6', label: 'Video' },
    photo: { icon: '📷', color: '#22c55e', label: 'Photo' },
    document: { icon: '📄', color: '#6b7280', label: 'Document' },
    transcript: { icon: '📝', color: '#8b5cf6', label: 'Transcript' },
    report: { icon: '📊', color: '#ef4444', label: 'Report' },
    evidence: { icon: '🔒', color: '#ec4899', label: 'Evidence' },
    social: { icon: '💬', color: '#06b6d4', label: 'Social Media' },
    camera: { icon: '📹', color: '#10b981', label: 'Camera Capture' },
    folder: { icon: '📁', color: '#f59e0b', label: 'Folder' },
};

const defaultSubfolders = ['Audio', 'Video', 'Photos', 'Documents', 'Transcripts', 'Reports', 'Evidence', 'Social Media', 'Camera Captures'];

// Build folder tree from persons + orgs
const buildTree = (): FolderNode[] => {
    const persons: FolderNode = { id: 'persons', name: 'Persons', icon: '👥', children: mockPersons.slice(0, 12).map(p => ({
        id: `p-${p.id}`, name: `${p.firstName} ${p.lastName}`, icon: '🧑', entityType: 'person' as EntityType, entityId: p.id,
        children: defaultSubfolders.map(sf => ({ id: `p-${p.id}-${sf.toLowerCase().replace(/\s/g, '-')}`, name: sf, icon: typeConfig[sf === 'Audio' ? 'audio' : sf === 'Video' ? 'video' : sf === 'Photos' ? 'photo' : sf === 'Documents' ? 'document' : sf === 'Transcripts' ? 'transcript' : sf === 'Reports' ? 'report' : sf === 'Evidence' ? 'evidence' : sf === 'Social Media' ? 'social' : 'camera'].icon, children: [], fileCount: 0, totalSize: '—' })),
        fileCount: 0, totalSize: '—',
    })), fileCount: 0, totalSize: '—' };

    const orgs: FolderNode = { id: 'orgs', name: 'Organizations', icon: '🏢', children: mockOrganizations.slice(0, 10).map(o => ({
        id: `o-${o.id}`, name: o.name, icon: '🏢', entityType: 'org' as EntityType, entityId: o.id,
        children: defaultSubfolders.map(sf => ({ id: `o-${o.id}-${sf.toLowerCase().replace(/\s/g, '-')}`, name: sf, icon: typeConfig[sf === 'Audio' ? 'audio' : sf === 'Video' ? 'video' : sf === 'Photos' ? 'photo' : sf === 'Documents' ? 'document' : sf === 'Transcripts' ? 'transcript' : sf === 'Reports' ? 'report' : sf === 'Evidence' ? 'evidence' : sf === 'Social Media' ? 'social' : 'camera'].icon, children: [], fileCount: 0, totalSize: '—' })),
        fileCount: 0, totalSize: '—',
    })), fileCount: 0, totalSize: '—' };

    return [persons, orgs];
};

// ═══ MOCK FILES (60 files across persons and orgs) ═══
const mockFiles: StorageFile[] = [
    // Horvat (person 1)
    { id: 'f01', name: 'horvat_phone_intercept_20260324.wav', type: 'audio', size: '4.2 MB', sizeBytes: 4400000, mimeType: 'audio/wav', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Audio', path: '/Persons/Marko Horvat/Audio', uploadedBy: 'Sgt. Matić', uploadedAt: '2026-03-24 08:22', modifiedAt: '2026-03-24 08:22', tags: ['intercept', 'keyword-flagged', 'croatian'], transcription: 'Partial transcript: "...delivery confirmed for Thursday night at the port terminal dock 7..."', duration: '4:12', source: 'Faster-Whisper · MIC-ALPHA' },
    { id: 'f02', name: 'horvat_port_surveillance_cam07.mp4', type: 'video', size: '128 MB', sizeBytes: 134000000, mimeType: 'video/mp4', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Video', path: '/Persons/Marko Horvat/Video', uploadedBy: 'System', uploadedAt: '2026-03-24 09:48', modifiedAt: '2026-03-24 09:48', tags: ['surveillance', 'face-match', 'port'], duration: '45:00', resolution: '4K (3840×2160)', source: 'Camera 07 · CAM-07' },
    { id: 'f03', name: 'horvat_vukovarska_lpr_capture.jpg', type: 'photo', size: '1.8 MB', sizeBytes: 1900000, mimeType: 'image/jpeg', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Photos', path: '/Persons/Marko Horvat/Photos', uploadedBy: 'LPR System', uploadedAt: '2026-03-24 09:31', modifiedAt: '2026-03-24 09:31', tags: ['lpr', 'ZG-1847-AB', 'vukovarska'], resolution: '3840×2160', source: 'LPR Reader · Vukovarska' },
    { id: 'f04', name: 'HAWK_Weekly_Report_4.pdf', type: 'report', size: '2.4 MB', sizeBytes: 2500000, mimeType: 'application/pdf', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Reports', path: '/Persons/Marko Horvat/Reports', uploadedBy: 'Report Generator', uploadedAt: '2026-03-22 06:00', modifiedAt: '2026-03-22 06:00', tags: ['weekly', 'HAWK', 'classified'], pages: 28, source: 'Report Generator' },
    { id: 'f05', name: 'horvat_colocation_evidence_042.zip', type: 'evidence', size: '18.5 MB', sizeBytes: 19400000, mimeType: 'application/zip', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Evidence', path: '/Persons/Marko Horvat/Evidence', uploadedBy: 'Workflow Engine', uploadedAt: '2026-03-24 09:15', modifiedAt: '2026-03-24 09:15', tags: ['co-location', 'mendoza', 'GPS-trail', 'evidence-package'], source: 'Workflow: Co-location Evidence' },
    { id: 'f06', name: 'horvat_facebook_profile_archive.json', type: 'social', size: '890 KB', sizeBytes: 912000, mimeType: 'application/json', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Social Media', path: '/Persons/Marko Horvat/Social Media', uploadedBy: 'Social Scraper', uploadedAt: '2026-03-20 14:00', modifiedAt: '2026-03-20 14:00', tags: ['facebook', 'scraped', 'profile'], source: 'OSINT Engine' },
    { id: 'f07', name: 'horvat_parking_garage_b2.mp4', type: 'camera', size: '456 MB', sizeBytes: 478000000, mimeType: 'video/mp4', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Camera Captures', path: '/Persons/Marko Horvat/Camera Captures', uploadedBy: 'System', uploadedAt: '2026-03-24 06:48', modifiedAt: '2026-03-24 06:48', tags: ['parking', 'garage-B2', 'vehicle-entry'], duration: '45:00', resolution: '1080p', source: 'MinIO Auto-Index' },
    { id: 'f08', name: 'intercept_transcript_20260324.txt', type: 'transcript', size: '12 KB', sizeBytes: 12000, mimeType: 'text/plain', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Transcripts', path: '/Persons/Marko Horvat/Transcripts', uploadedBy: 'Faster-Whisper', uploadedAt: '2026-03-24 08:30', modifiedAt: '2026-03-24 08:30', tags: ['transcript', 'auto-generated', 'keyword-flagged'], pages: 3, source: 'Faster-Whisper · CTranslate2' },
    { id: 'f09', name: 'horvat_movement_analysis.pdf', type: 'document', size: '1.1 MB', sizeBytes: 1150000, mimeType: 'application/pdf', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', folder: 'Documents', path: '/Persons/Marko Horvat/Documents', uploadedBy: 'AI Analysis', uploadedAt: '2026-03-23 06:00', modifiedAt: '2026-03-23 06:00', tags: ['analysis', 'movement', 'AI-generated'], pages: 8, source: 'Ollama LLaMA 3.1' },

    // Mendoza (person 9)
    { id: 'f10', name: 'mendoza_counter_surv_photos.zip', type: 'evidence', size: '34 MB', sizeBytes: 35600000, mimeType: 'application/zip', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', folder: 'Evidence', path: '/Persons/Carlos Mendoza/Evidence', uploadedBy: 'Field Team Alpha', uploadedAt: '2026-03-23 09:30', modifiedAt: '2026-03-23 09:30', tags: ['counter-surveillance', 'photos', '12-images'], source: 'Field Team Alpha' },
    { id: 'f11', name: 'mendoza_sim_swap_log.json', type: 'document', size: '5 KB', sizeBytes: 5000, mimeType: 'application/json', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', folder: 'Documents', path: '/Persons/Carlos Mendoza/Documents', uploadedBy: 'IMSI Catcher', uploadedAt: '2026-03-24 02:45', modifiedAt: '2026-03-24 02:45', tags: ['sim-swap', 'imsi', 'prepaid'], source: 'IMSI Catcher Array' },
    { id: 'f12', name: 'mendoza_night_route_20260324.gpx', type: 'document', size: '28 KB', sizeBytes: 28000, mimeType: 'application/gpx+xml', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', folder: 'Documents', path: '/Persons/Carlos Mendoza/Documents', uploadedBy: 'GPS-004', uploadedAt: '2026-03-24 03:37', modifiedAt: '2026-03-24 03:37', tags: ['gps-route', 'night-activity', 'evasive'], source: 'GPS Tracker · GPS-004' },
    { id: 'f13', name: 'mendoza_speed_violation.mp4', type: 'camera', size: '89 MB', sizeBytes: 93300000, mimeType: 'video/mp4', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', folder: 'Camera Captures', path: '/Persons/Carlos Mendoza/Camera Captures', uploadedBy: 'System', uploadedAt: '2026-03-23 22:08', modifiedAt: '2026-03-23 22:08', tags: ['speed-violation', '118kmh', 'evasive-driving'], duration: '2:15', resolution: '1080p', source: 'Street Camera A1' },

    // Babić (person 12)
    { id: 'f14', name: 'babic_diplomatic_quarter_photos.zip', type: 'photo', size: '22 MB', sizeBytes: 23000000, mimeType: 'application/zip', entityType: 'person', entityId: 12, entityName: 'Ivan Babić', folder: 'Photos', path: '/Persons/Ivan Babić/Photos', uploadedBy: 'Field Team Alpha', uploadedAt: '2026-03-23 15:10', modifiedAt: '2026-03-23 15:10', tags: ['diplomatic-quarter', 'embassy-row', 'first-visit'], source: 'Field Team' },
    { id: 'f15', name: 'babic_loitering_heinzelova.mp4', type: 'camera', size: '67 MB', sizeBytes: 70000000, mimeType: 'video/mp4', entityType: 'person', entityId: 12, entityName: 'Ivan Babić', folder: 'Camera Captures', path: '/Persons/Ivan Babić/Camera Captures', uploadedBy: 'System', uploadedAt: '2026-03-24 07:55', modifiedAt: '2026-03-24 07:55', tags: ['loitering', '22-minutes', 'ai-flagged'], duration: '22:00', resolution: '1080p', source: 'Camera 12 · AI Detection' },
    { id: 'f16', name: 'babic_checkpoint_avoidance_map.pdf', type: 'document', size: '340 KB', sizeBytes: 348000, mimeType: 'application/pdf', entityType: 'person', entityId: 12, entityName: 'Ivan Babić', folder: 'Documents', path: '/Persons/Ivan Babić/Documents', uploadedBy: 'AI Analysis', uploadedAt: '2026-03-22 10:00', modifiedAt: '2026-03-22 10:00', tags: ['checkpoint-avoidance', 'lpr', 'route-map'], pages: 4, source: 'Pattern Detection AI' },

    // Hassan (person 7)
    { id: 'f17', name: 'hassan_routine_call_arabic.wav', type: 'audio', size: '3.8 MB', sizeBytes: 3980000, mimeType: 'audio/wav', entityType: 'person', entityId: 7, entityName: 'Omar Hassan', folder: 'Audio', path: '/Persons/Omar Hassan/Audio', uploadedBy: 'Audio Monitor', uploadedAt: '2026-03-24 07:30', modifiedAt: '2026-03-24 07:30', tags: ['arabic', 'routine', 'personal'], duration: '4:12', transcription: 'Assessed routine personal call with family member. No operational intelligence detected.', source: 'Faster-Whisper' },
    { id: 'f18', name: 'hassan_encrypted_comms_metadata.json', type: 'document', size: '8 KB', sizeBytes: 8000, mimeType: 'application/json', entityType: 'person', entityId: 7, entityName: 'Omar Hassan', folder: 'Documents', path: '/Persons/Omar Hassan/Documents', uploadedBy: 'IMSI Catcher', uploadedAt: '2026-03-23 11:05', modifiedAt: '2026-03-23 11:05', tags: ['encrypted', 'signal-like', '14-messages'], source: 'Comms Monitor' },
    { id: 'f19', name: 'hassan_storage_facility_photos.zip', type: 'photo', size: '15 MB', sizeBytes: 15700000, mimeType: 'application/zip', entityType: 'person', entityId: 7, entityName: 'Omar Hassan', folder: 'Photos', path: '/Persons/Omar Hassan/Photos', uploadedBy: 'Physical Surveillance', uploadedAt: '2026-03-23 16:30', modifiedAt: '2026-03-23 16:30', tags: ['storage-facility', 'visit-4', '48h-interval'], source: 'Field Team Bravo' },

    // Al-Rashid (person 3)
    { id: 'f20', name: 'alrashid_cargo_invoices_analysis.xlsx', type: 'document', size: '2.1 MB', sizeBytes: 2200000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', entityType: 'person', entityId: 3, entityName: 'Ahmed Al-Rashid', folder: 'Documents', path: '/Persons/Ahmed Al-Rashid/Documents', uploadedBy: 'Financial Intel', uploadedAt: '2026-03-18 09:00', modifiedAt: '2026-03-20 14:30', tags: ['over-invoicing', 'cargo', 'AML', '12-shipments'], pages: 15, source: 'Financial Analysis Team' },
    { id: 'f21', name: 'alrashid_airport_lpr.jpg', type: 'photo', size: '2.3 MB', sizeBytes: 2400000, mimeType: 'image/jpeg', entityType: 'person', entityId: 3, entityName: 'Ahmed Al-Rashid', folder: 'Photos', path: '/Persons/Ahmed Al-Rashid/Photos', uploadedBy: 'LPR System', uploadedAt: '2026-03-24 07:30', modifiedAt: '2026-03-24 07:30', tags: ['lpr', 'SA-9012-RH', 'airport', 'diplomatic'], resolution: '4K', source: 'LPR Reader · Airport' },

    // Alpha Security Group (org 1)
    { id: 'f30', name: 'asg_company_registration.pdf', type: 'document', size: '450 KB', sizeBytes: 461000, mimeType: 'application/pdf', entityType: 'org', entityId: 1, entityName: 'Alpha Security Group', folder: 'Documents', path: '/Organizations/Alpha Security Group/Documents', uploadedBy: 'Business Registry', uploadedAt: '2024-06-15 08:00', modifiedAt: '2025-11-20 10:00', tags: ['registration', 'official', 'directors'], pages: 12, source: 'National Business Registry' },
    { id: 'f31', name: 'asg_hq_afterhours_20260324.mp4', type: 'camera', size: '234 MB', sizeBytes: 245000000, mimeType: 'video/mp4', entityType: 'org', entityId: 1, entityName: 'Alpha Security Group', folder: 'Camera Captures', path: '/Organizations/Alpha Security Group/Camera Captures', uploadedBy: 'System', uploadedAt: '2026-03-24 02:30', modifiedAt: '2026-03-24 02:30', tags: ['after-hours', 'motion-detected', '02:30'], duration: '8:15', resolution: '4K', source: 'Zagreb HQ Entrance · CAM-01' },
    { id: 'f32', name: 'asg_financial_audit_2025.pdf', type: 'report', size: '5.8 MB', sizeBytes: 6080000, mimeType: 'application/pdf', entityType: 'org', entityId: 1, entityName: 'Alpha Security Group', folder: 'Reports', path: '/Organizations/Alpha Security Group/Reports', uploadedBy: 'Financial Intel', uploadedAt: '2026-01-15 09:00', modifiedAt: '2026-02-28 16:00', tags: ['financial', 'audit', 'suspicious'], pages: 42, source: 'Financial Analysis' },
    { id: 'f33', name: 'asg_employee_network_graph.png', type: 'photo', size: '1.2 MB', sizeBytes: 1260000, mimeType: 'image/png', entityType: 'org', entityId: 1, entityName: 'Alpha Security Group', folder: 'Photos', path: '/Organizations/Alpha Security Group/Photos', uploadedBy: 'Connections Module', uploadedAt: '2026-03-10 14:00', modifiedAt: '2026-03-10 14:00', tags: ['network-graph', 'connections', 'employees'], resolution: '2560×1440', source: 'Connections Graph Export' },

    // Rashid Holdings (org 2)
    { id: 'f34', name: 'rashid_shell_companies_report.pdf', type: 'report', size: '3.4 MB', sizeBytes: 3560000, mimeType: 'application/pdf', entityType: 'org', entityId: 2, entityName: 'Rashid Holdings International', folder: 'Reports', path: '/Organizations/Rashid Holdings International/Reports', uploadedBy: 'OpenCorporates Sync', uploadedAt: '2026-03-24 08:00', modifiedAt: '2026-03-24 08:00', tags: ['shell-companies', 'opencorporates', '2-new-detected'], pages: 18, source: 'OpenCorporates · 210M records' },
    { id: 'f35', name: 'rashid_cargo_manifests_q1_2026.xlsx', type: 'document', size: '4.7 MB', sizeBytes: 4930000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', entityType: 'org', entityId: 2, entityName: 'Rashid Holdings International', folder: 'Documents', path: '/Organizations/Rashid Holdings International/Documents', uploadedBy: 'Maritime Intel', uploadedAt: '2026-03-15 10:00', modifiedAt: '2026-03-22 11:00', tags: ['cargo', 'manifests', 'over-invoicing', 'Q1-2026'], source: 'Maritime AIS + Customs' },
    { id: 'f36', name: 'rashid_sanctions_screening.pdf', type: 'evidence', size: '780 KB', sizeBytes: 800000, mimeType: 'application/pdf', entityType: 'org', entityId: 2, entityName: 'Rashid Holdings International', folder: 'Evidence', path: '/Organizations/Rashid Holdings International/Evidence', uploadedBy: 'EU Sanctions Sync', uploadedAt: '2026-03-24 10:00', modifiedAt: '2026-03-24 10:00', tags: ['sanctions', 'EU-CFSP', 'screening-result'], pages: 6, source: 'EU Sanctions CFSP' },

    // Falcon Trading (org 5)
    { id: 'f37', name: 'falcon_trading_bank_transactions.csv', type: 'document', size: '1.9 MB', sizeBytes: 1990000, mimeType: 'text/csv', entityType: 'org', entityId: 5, entityName: 'Falcon Trading LLC', folder: 'Documents', path: '/Organizations/Falcon Trading LLC/Documents', uploadedBy: 'Bank Monitor', uploadedAt: '2026-03-24 10:12', modifiedAt: '2026-03-24 10:12', tags: ['bank', 'transactions', 'AML-flagged'], source: 'Bank Transaction Monitor · FINA' },

    // Kovačević (person 2)
    { id: 'f22', name: 'kovacevic_face_match_hq.jpg', type: 'photo', size: '1.5 MB', sizeBytes: 1575000, mimeType: 'image/jpeg', entityType: 'person', entityId: 2, entityName: 'Ana Kovačević', folder: 'Photos', path: '/Persons/Ana Kovačević/Photos', uploadedBy: 'InsightFace', uploadedAt: '2026-03-24 08:05', modifiedAt: '2026-03-24 08:05', tags: ['face-match', '91%', 'hq-entrance'], resolution: '1920×1080', source: 'InsightFace · CAM-01' },

    // Li Wei (person 10)
    { id: 'f23', name: 'liwei_shanghai_port_observation.pdf', type: 'document', size: '560 KB', sizeBytes: 573000, mimeType: 'application/pdf', entityType: 'person', entityId: 10, entityName: 'Li Wei', folder: 'Documents', path: '/Persons/Li Wei/Documents', uploadedBy: 'Cpt. Perić', uploadedAt: '2026-03-18 06:00', modifiedAt: '2026-03-18 06:00', tags: ['shanghai', 'port', 'observation', 'PHOENIX'], pages: 5, source: 'Field Report' },
];

const allEntityTypes: EntityType[] = ['person', 'org'];

function StorageIndex() {
    const [search, setSearch] = useState('');
    const [typeF, setTypeF] = useState<FileType | 'all'>('all');
    const [entityF, setEntityF] = useState<string>('all'); // "all", "p-1", "o-1", "persons", "orgs"
    const [selFile, setSelFile] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['persons', 'orgs']));
    const [sortCol, setSortCol] = useState<'name' | 'size' | 'date' | 'type'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [showUpload, setShowUpload] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const tree = useMemo(buildTree, []);
    const file = selFile ? mockFiles.find(f => f.id === selFile) : null;

    const toggleExpand = (id: string) => setExpanded(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

    // Filter files
    const filtered = useMemo(() => {
        let files = mockFiles;
        if (entityF !== 'all') {
            if (entityF === 'persons') files = files.filter(f => f.entityType === 'person');
            else if (entityF === 'orgs') files = files.filter(f => f.entityType === 'org');
            else if (entityF.startsWith('p-')) files = files.filter(f => f.entityType === 'person' && f.entityId === parseInt(entityF.slice(2)));
            else if (entityF.startsWith('o-')) files = files.filter(f => f.entityType === 'org' && f.entityId === parseInt(entityF.slice(2)));
            // Subfolder filter
            const parts = entityF.split('-');
            if (parts.length >= 3) {
                const folder = parts.slice(2).join(' ').replace(/-/g, ' ');
                files = files.filter(f => f.folder.toLowerCase() === folder.toLowerCase() || f.folder.toLowerCase().replace(/\s/g, '-') === parts.slice(2).join('-'));
            }
        }
        if (typeF !== 'all') files = files.filter(f => f.type === typeF);
        if (search) files = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.entityName.toLowerCase().includes(search.toLowerCase()) || f.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) || (f.transcription?.toLowerCase().includes(search.toLowerCase())));
        // Sort
        return [...files].sort((a, b) => {
            const m = sortDir === 'asc' ? 1 : -1;
            if (sortCol === 'name') return a.name.localeCompare(b.name) * m;
            if (sortCol === 'size') return (a.sizeBytes - b.sizeBytes) * m;
            if (sortCol === 'type') return a.type.localeCompare(b.type) * m;
            return a.uploadedAt.localeCompare(b.uploadedAt) * m;
        });
    }, [entityF, typeF, search, sortCol, sortDir]);

    const totalSize = useMemo(() => {
        const bytes = filtered.reduce((s, f) => s + f.sizeBytes, 0);
        return bytes > 1e9 ? `${(bytes / 1e9).toFixed(1)} GB` : `${(bytes / 1e6).toFixed(1)} MB`;
    }, [filtered]);

    const toggleSort = (col: typeof sortCol) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('desc'); } };
    const SortIcon = ({ col }: { col: typeof sortCol }) => sortCol === col ? <span style={{ fontSize: 7, marginLeft: 2 }}>{sortDir === 'asc' ? '▲' : '▼'}</span> : null;

    // Folder tree node renderer
    const TreeNode = ({ node, depth }: { node: FolderNode; depth: number }) => {
        const isExp = expanded.has(node.id);
        const isSel = entityF === node.id;
        const hasKids = node.children.length > 0;
        const fileCount = mockFiles.filter(f => {
            if (node.id === 'persons') return f.entityType === 'person';
            if (node.id === 'orgs') return f.entityType === 'org';
            if (node.entityType === 'person') return f.entityType === 'person' && f.entityId === node.entityId;
            if (node.entityType === 'org') return f.entityType === 'org' && f.entityId === node.entityId;
            return false;
        }).length;

        return <>
            <div onClick={() => { setEntityF(node.id); if (hasKids) toggleExpand(node.id); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: `2px 6px 2px ${8 + depth * 12}px`, cursor: 'pointer', borderRadius: 3, background: isSel ? `${theme.accent}08` : 'transparent', borderLeft: `2px solid ${isSel ? theme.accent : 'transparent'}`, fontSize: 9, color: isSel ? theme.text : theme.textDim, transition: 'all 0.1s' }}>
                {hasKids && <span style={{ fontSize: 7, width: 8, textAlign: 'center' as const, color: theme.textDim, flexShrink: 0 }}>{isExp ? '▼' : '▶'}</span>}
                {!hasKids && <span style={{ width: 8, flexShrink: 0 }} />}
                <span style={{ fontSize: 10 }}>{node.icon}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, fontWeight: isSel ? 700 : 500 }}>{node.name}</span>
                {fileCount > 0 && <span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{fileCount}</span>}
            </div>
            {isExp && node.children.map(c => <TreeNode key={c.id} node={c} depth={depth + 1} />)}
        </>;
    };

    return (<>
        <PageMeta title="Storage Browser" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* LEFT: Folder Tree */}
            <div style={{ width: 230, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f59e0b10', border: '1px solid #f59e0b25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📁</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>STORAGE</div><div style={{ fontSize: 7, color: theme.textDim }}>MinIO File Manager</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                {/* Tree */}
                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', padding: '4px 0' }}>
                    <div onClick={() => setEntityF('all')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px 3px 8px', cursor: 'pointer', borderRadius: 3, background: entityF === 'all' ? `${theme.accent}08` : 'transparent', borderLeft: `2px solid ${entityF === 'all' ? theme.accent : 'transparent'}`, fontSize: 9, color: entityF === 'all' ? theme.text : theme.textDim, fontWeight: entityF === 'all' ? 700 : 500, marginBottom: 2 }}>
                        <span style={{ fontSize: 10 }}>🗄️</span><span>All Files</span><span style={{ marginLeft: 'auto', fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{mockFiles.length}</span>
                    </div>
                    {tree.map(node => <TreeNode key={node.id} node={node} depth={0} />)}
                </div>

                {/* File type filter */}
                <div style={{ padding: '6px 10px', borderTop: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>File Type</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                        <button onClick={() => setTypeF('all')} style={{ padding: '1px 4px', borderRadius: 2, border: `1px solid ${typeF === 'all' ? theme.accent + '40' : theme.border}`, background: typeF === 'all' ? `${theme.accent}08` : 'transparent', color: typeF === 'all' ? theme.accent : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
                        {(Object.keys(typeConfig) as FileType[]).filter(t => t !== 'folder').map(t => { const tc = typeConfig[t]; const c = mockFiles.filter(f => f.type === t).length; if (c === 0) return null; return <button key={t} onClick={() => setTypeF(t)} style={{ padding: '1px 4px', borderRadius: 2, border: `1px solid ${typeF === t ? tc.color + '40' : theme.border}`, background: typeF === t ? `${tc.color}08` : 'transparent', color: typeF === t ? tc.color : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>{tc.icon} {c}</button>; })}
                    </div>
                </div>

                {/* Upload button */}
                <div style={{ padding: '6px 10px', borderTop: `1px solid ${theme.border}` }}>
                    <button onClick={() => setShowUpload(!showUpload)} style={{ width: '100%', padding: '6px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>📤 Upload Files</button>
                </div>

                <div style={{ padding: '4px 10px', fontSize: 7, color: theme.textDim, borderTop: `1px solid ${theme.border}` }}>
                    {mockFiles.length} files · {totalSize} total
                </div>
            </div>

            {/* CENTER: File List */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                {/* Upload zone */}
                {showUpload && <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); setShowUpload(false); }} style={{ padding: '16px', borderBottom: `1px solid ${theme.border}`, background: dragOver ? `${theme.accent}08` : theme.bgCard, textAlign: 'center' as const, transition: 'background 0.15s', flexShrink: 0 }}>
                    <div style={{ padding: '20px', borderRadius: 8, border: `2px dashed ${dragOver ? theme.accent : theme.border}`, background: dragOver ? `${theme.accent}04` : 'transparent', transition: 'all 0.15s' }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>📤</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>Drop files here or click to browse</div>
                        <div style={{ fontSize: 8, color: theme.textDim, marginTop: 2 }}>Supports: Audio, Video, Photos, Documents, Evidence packages</div>
                        <div style={{ fontSize: 8, color: theme.textDim }}>Files will be assigned to: <span style={{ color: theme.accent, fontWeight: 600 }}>{entityF === 'all' ? 'Select an entity folder first' : entityF.startsWith('p-') ? mockPersons.find(p => p.id === parseInt(entityF.slice(2)))?.firstName + ' ' + mockPersons.find(p => p.id === parseInt(entityF.slice(2)))?.lastName : entityF.startsWith('o-') ? mockOrganizations.find(o => o.id === parseInt(entityF.slice(2)))?.name : entityF}</span></div>
                        <button style={{ marginTop: 8, padding: '5px 16px', borderRadius: 4, border: `1px solid ${theme.accent}30`, background: `${theme.accent}08`, color: theme.accent, fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Browse Files</button>
                    </div>
                </div>}

                {/* Path breadcrumb */}
                <div style={{ padding: '5px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: theme.textDim, flexShrink: 0, background: theme.bg }}>
                    <span onClick={() => setEntityF('all')} style={{ cursor: 'pointer', color: theme.accent }}>🗄️ Storage</span>
                    {entityF !== 'all' && <><span>/</span><span style={{ color: theme.text, fontWeight: 600 }}>{entityF === 'persons' ? '👥 Persons' : entityF === 'orgs' ? '🏢 Organizations' : entityF.startsWith('p-') ? `🧑 ${mockPersons.find(p => p.id === parseInt(entityF.split('-')[1]))?.firstName || ''}` : entityF.startsWith('o-') ? `🏢 ${mockOrganizations.find(o => o.id === parseInt(entityF.split('-')[1]))?.name?.slice(0, 20) || ''}` : entityF}</span></>}
                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: theme.accent, fontFamily: "'JetBrains Mono',monospace" }}>{filtered.length}</span> files · {totalSize}
                </div>

                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '28px 3fr 1fr 80px 1fr 80px', padding: '4px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', flexShrink: 0, background: theme.bg, gap: 6, cursor: 'pointer', userSelect: 'none' }}>
                    <span></span>
                    <span onClick={() => toggleSort('name')}>Name <SortIcon col="name" /></span>
                    <span>Entity</span>
                    <span onClick={() => toggleSort('type')}>Type <SortIcon col="type" /></span>
                    <span>Tags</span>
                    <span onClick={() => toggleSort('size')} style={{ textAlign: 'right' as const }}>Size <SortIcon col="size" /></span>
                </div>

                {/* File rows */}
                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 28, opacity: 0.2 }}>📁</div><div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>No files found</div><div style={{ fontSize: 9, color: theme.textDim, marginTop: 2 }}>Select a folder or adjust search</div></div>}

                    {filtered.map(f => {
                        const tc = typeConfig[f.type]; const sel = selFile === f.id;
                        return <div key={f.id} onClick={() => setSelFile(f.id)} style={{ display: 'grid', gridTemplateColumns: '28px 3fr 1fr 80px 1fr 80px', padding: '6px 14px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', gap: 6, background: sel ? `${tc.color}04` : 'transparent', borderLeft: `3px solid ${sel ? tc.color : 'transparent'}`, transition: 'all 0.1s' }}>
                            <div style={{ width: 22, height: 22, borderRadius: 4, background: `${tc.color}12`, border: `1px solid ${tc.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{tc.icon}</div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 9, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{f.name}</div>
                                <div style={{ fontSize: 7, color: theme.textDim }}>{f.folder} · {f.uploadedAt.slice(5)}</div>
                            </div>
                            <div><a href={`/${f.entityType === 'person' ? 'persons' : 'organizations'}/${f.entityId}`} onClick={e => e.stopPropagation()} style={{ fontSize: 8, color: theme.accent, textDecoration: 'none' }}>{f.entityType === 'person' ? '🧑' : '🏢'} {f.entityName.split(' ').slice(0, 2).join(' ')}</a></div>
                            <span style={{ fontSize: 7, fontWeight: 600, color: tc.color }}>{tc.label}</span>
                            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const, overflow: 'hidden', maxHeight: 16 }}>
                                {f.tags.slice(0, 2).map(t => <span key={t} style={{ fontSize: 6, padding: '0 3px', borderRadius: 2, background: `${theme.border}20`, color: theme.textDim, whiteSpace: 'nowrap' as const }}>{t}</span>)}
                                {f.tags.length > 2 && <span style={{ fontSize: 6, color: theme.textDim }}>+{f.tags.length - 2}</span>}
                            </div>
                            <div style={{ textAlign: 'right' as const, fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{f.size}</div>
                        </div>;
                    })}
                </div>

                {/* Bottom */}
                <div style={{ padding: '3px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>{filtered.length} files · {totalSize}</span>
                    <div style={{ flex: 1 }} /><span>MinIO · AES-256 · On-Premise</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>

            {/* RIGHT: File Detail */}
            {file && <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: `${typeConfig[file.type].color}12`, border: `1px solid ${typeConfig[file.type].color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{typeConfig[file.type].icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{file.name}</div><div style={{ fontSize: 7, color: typeConfig[file.type].color, fontWeight: 600 }}>{typeConfig[file.type].label} · {file.mimeType}</div></div>
                        <button onClick={() => setSelFile(null)} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                </div>

                {/* Preview area */}
                {(file.type === 'photo' || file.type === 'camera') && file.mimeType.startsWith('image') && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e16' }}>
                    <div style={{ width: '100%', height: 100, borderRadius: 4, background: `${typeConfig[file.type].color}08`, border: `1px solid ${typeConfig[file.type].color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 9 }}>🖼️ Image Preview</div>
                </div>}
                {(file.type === 'audio') && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${theme.accent}30`, background: `${theme.accent}08`, color: theme.accent, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: `${theme.border}30` }}><div style={{ width: '35%', height: '100%', borderRadius: 2, background: theme.accent }} /></div>
                    <span style={{ fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{file.duration}</span>
                </div>}
                {(file.type === 'video' || (file.type === 'camera' && file.mimeType.startsWith('video'))) && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, background: '#0a0e16' }}>
                    <div style={{ width: '100%', height: 90, borderRadius: 4, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 1, background: `${theme.border}30` }}><div style={{ width: '20%', height: '100%', borderRadius: 1, background: '#3b82f6' }} /></div>
                        <span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{file.duration}</span>
                    </div>
                </div>}

                {/* File info */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                    {[
                        { l: 'Size', v: file.size },
                        { l: 'MIME', v: file.mimeType },
                        { l: 'Entity', v: `${file.entityType === 'person' ? '🧑' : '🏢'} ${file.entityName}` },
                        { l: 'Folder', v: file.folder },
                        { l: 'Path', v: file.path },
                        { l: 'Uploaded', v: `${file.uploadedAt} by ${file.uploadedBy}` },
                        { l: 'Modified', v: file.modifiedAt },
                        { l: 'Source', v: file.source || '—' },
                        ...(file.duration ? [{ l: 'Duration', v: file.duration }] : []),
                        ...(file.resolution ? [{ l: 'Resolution', v: file.resolution }] : []),
                        ...(file.pages ? [{ l: 'Pages', v: `${file.pages}` }] : []),
                    ].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><span style={{ fontSize: 7, color: theme.textDim, flexShrink: 0 }}>{r.l}</span><span style={{ fontSize: 7, color: theme.text, textAlign: 'right' as const, wordBreak: 'break-all' }}>{r.v}</span></div>)}
                </div>

                {/* Tags */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>Tags</div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        {file.tags.map(t => <span key={t} style={{ fontSize: 7, padding: '2px 6px', borderRadius: 3, background: `${theme.border}20`, color: theme.textSecondary }}>{t}</span>)}
                    </div>
                </div>

                {/* Transcript */}
                {file.transcription && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 7, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>📝 Transcript</div>
                    <div style={{ fontSize: 8, color: theme.textSecondary, lineHeight: 1.5, fontStyle: 'italic' }}>"{file.transcription}"</div>
                </div>}

                {/* Actions */}
                <div style={{ padding: '8px 12px', display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginTop: 'auto' }}>
                    <button style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⬇️ Download</button>
                    <button style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, cursor: 'pointer', fontFamily: 'inherit' }}>🔗 Share</button>
                    <a href={`/${file.entityType === 'person' ? 'persons' : 'organizations'}/${file.entityId}`} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8, textAlign: 'center' as const }}>🧑 Entity</a>
                </div>
            </div>}
        </div>
    </>);
}

StorageIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default StorageIndex;
