/**
 * ARGUX — Storage Browser Mock Data
 * Split-panel file manager backed by MinIO
 */

export type FileType = 'audio' | 'video' | 'photo' | 'document';
export type EntityType = 'person' | 'organization';

export interface StorageEntity {
    id: number; name: string; type: EntityType; fileCount: number; totalSize: string;
}

export interface StorageFile {
    id: string; name: string; fileType: FileType; size: string; sizeBytes: number;
    entityId: number; entityType: EntityType; entityName: string;
    mimeType: string; uploadedBy: string; uploadedAt: string;
    metadata: Record<string, string>; transcript?: string;
}

export const fileTypeConfig: Record<FileType, { label: string; icon: string; color: string; extensions: string[] }> = {
    audio:    { label: 'Audio', icon: '🎵', color: '#8b5cf6', extensions: ['.wav', '.mp3', '.ogg', '.flac'] },
    video:    { label: 'Video', icon: '🎬', color: '#3b82f6', extensions: ['.mp4', '.mkv', '.avi', '.mov'] },
    photo:    { label: 'Photos', icon: '📷', color: '#22c55e', extensions: ['.jpg', '.png', '.webp', '.heic'] },
    document: { label: 'Documents', icon: '📄', color: '#f59e0b', extensions: ['.pdf', '.docx', '.xlsx', '.txt'] },
};

export const entities: StorageEntity[] = [
    { id: 1, name: 'Marko Horvat', type: 'person', fileCount: 18, totalSize: '2.4 GB' },
    { id: 9, name: 'Carlos Mendoza', type: 'person', fileCount: 12, totalSize: '1.8 GB' },
    { id: 12, name: 'Ivan Babić', type: 'person', fileCount: 8, totalSize: '940 MB' },
    { id: 7, name: 'Youssef Hassan', type: 'person', fileCount: 14, totalSize: '1.6 GB' },
    { id: 3, name: 'Ahmed Al-Rashid', type: 'person', fileCount: 10, totalSize: '1.2 GB' },
    { id: 2, name: 'Elena Petrova', type: 'person', fileCount: 5, totalSize: '320 MB' },
    { id: 101, name: 'Adriatic Maritime Holdings', type: 'organization', fileCount: 6, totalSize: '780 MB' },
    { id: 102, name: 'Balkan Transit Group', type: 'organization', fileCount: 4, totalSize: '420 MB' },
];

export const mockFiles: StorageFile[] = [
    // Horvat
    { id: 'f01', name: 'horvat_port_cam07.mp4', fileType: 'video', size: '1.2 GB', sizeBytes: 1288490188, entityId: 1, entityType: 'person', entityName: 'Marko Horvat', mimeType: 'video/mp4', uploadedBy: 'CAM-07', uploadedAt: '2026-03-27 08:45', metadata: { camera: 'CAM-07', location: 'Port Terminal East', duration: '45:12', resolution: '1920x1080', fps: '30' }, transcript: 'No speech detected — ambient surveillance footage' },
    { id: 'f02', name: 'horvat_voice_intercept_01.wav', fileType: 'audio', size: '48 MB', sizeBytes: 50331648, entityId: 1, entityType: 'person', entityName: 'Marko Horvat', mimeType: 'audio/wav', uploadedBy: 'Sgt. Matić', uploadedAt: '2026-03-26 14:20', metadata: { source: 'Phone intercept', duration: '12:34', sampleRate: '44.1 kHz', channels: 'Stereo' }, transcript: 'Partial transcript: "...meeting at the port, Thursday... bring the documents... make sure nobody follows..."' },
    { id: 'f03', name: 'horvat_cafe_photo_001.jpg', fileType: 'photo', size: '4.2 MB', sizeBytes: 4404019, entityId: 1, entityType: 'person', entityName: 'Marko Horvat', mimeType: 'image/jpeg', uploadedBy: 'Sgt. Matić', uploadedAt: '2026-03-25 16:30', metadata: { camera: 'Nikon D850', location: 'Café Europa, Zagreb', gps: '45.8131, 15.9772', resolution: '8256x5504' } },
    { id: 'f04', name: 'horvat_financial_analysis.pdf', fileType: 'document', size: '2.8 MB', sizeBytes: 2936012, entityId: 1, entityType: 'person', entityName: 'Marko Horvat', mimeType: 'application/pdf', uploadedBy: 'Maj. Novak', uploadedAt: '2026-03-24 10:00', metadata: { pages: '18', classification: 'CLASSIFIED', author: 'Financial Intelligence Unit' } },
    // Mendoza
    { id: 'f05', name: 'mendoza_ambient.wav', fileType: 'audio', size: '82 MB', sizeBytes: 85983436, entityId: 9, entityType: 'person', entityName: 'Carlos Mendoza', mimeType: 'audio/wav', uploadedBy: 'Sgt. Matić', uploadedAt: '2026-03-27 06:00', metadata: { source: 'Ambient mic', duration: '28:45', snr: '< 3 dB', location: 'Warehouse district' } },
    { id: 'f06', name: 'mendoza_vehicle_followup.mp4', fileType: 'video', size: '680 MB', sizeBytes: 713031680, entityId: 9, entityType: 'person', entityName: 'Carlos Mendoza', mimeType: 'video/mp4', uploadedBy: 'CAM-12', uploadedAt: '2026-03-26 22:15', metadata: { camera: 'CAM-12', duration: '22:10', resolution: '1920x1080' } },
    { id: 'f07', name: 'mendoza_passport_scan.pdf', fileType: 'document', size: '1.4 MB', sizeBytes: 1468006, entityId: 9, entityType: 'person', entityName: 'Carlos Mendoza', mimeType: 'application/pdf', uploadedBy: 'Lt. Perić', uploadedAt: '2026-03-20 09:30', metadata: { pages: '2', documentType: 'Passport', nationality: 'Colombian' } },
    // Hassan
    { id: 'f08', name: 'hassan_intercept_ar.txt', fileType: 'document', size: '24 KB', sizeBytes: 24576, entityId: 7, entityType: 'person', entityName: 'Youssef Hassan', mimeType: 'text/plain', uploadedBy: 'Lt. Perić', uploadedAt: '2026-03-27 08:10', metadata: { language: 'Arabic', wordCount: '3,847', classification: 'CLASSIFIED' }, transcript: 'Arabic text — pending NLLB-200 translation' },
    { id: 'f09', name: 'hassan_meeting_cam04.mp4', fileType: 'video', size: '920 MB', sizeBytes: 964689920, entityId: 7, entityType: 'person', entityName: 'Youssef Hassan', mimeType: 'video/mp4', uploadedBy: 'CAM-04', uploadedAt: '2026-03-25 19:00', metadata: { camera: 'CAM-04', location: 'Restaurant Dubrovnik', duration: '34:20' } },
    // Babić
    { id: 'f10', name: 'babic_loitering_cam12.mp4', fileType: 'video', size: '540 MB', sizeBytes: 566231040, entityId: 12, entityType: 'person', entityName: 'Ivan Babić', mimeType: 'video/mp4', uploadedBy: 'CAM-12', uploadedAt: '2026-03-26 03:30', metadata: { camera: 'CAM-12', duration: '18:45', alert: 'Loitering detected' } },
    { id: 'f11', name: 'babic_associates_photos.zip', fileType: 'document', size: '28 MB', sizeBytes: 29360128, entityId: 12, entityType: 'person', entityName: 'Ivan Babić', mimeType: 'application/zip', uploadedBy: 'Sgt. Matić', uploadedAt: '2026-03-22 11:00', metadata: { contents: '12 surveillance photos', classification: 'CLASSIFIED' } },
    // Al-Rashid
    { id: 'f12', name: 'alrashid_phone_extract.xlsx', fileType: 'document', size: '3.6 MB', sizeBytes: 3774873, entityId: 3, entityType: 'person', entityName: 'Ahmed Al-Rashid', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadedBy: 'Lt. Perić', uploadedAt: '2026-03-24 14:00', metadata: { rows: '4,821', sheets: '6 (SMS, Calls, Contacts, Calendar, Apps, Locations)' } },
    // Adriatic Maritime
    { id: 'f13', name: 'adriatic_corporate_records.pdf', fileType: 'document', size: '12 MB', sizeBytes: 12582912, entityId: 101, entityType: 'organization', entityName: 'Adriatic Maritime Holdings', mimeType: 'application/pdf', uploadedBy: 'Maj. Novak', uploadedAt: '2026-03-23 09:00', metadata: { pages: '84', source: 'National Business Registry', classification: 'CLASSIFIED' } },
    { id: 'f14', name: 'adriatic_port_surveillance.mp4', fileType: 'video', size: '2.1 GB', sizeBytes: 2254857830, entityId: 101, entityType: 'organization', entityName: 'Adriatic Maritime Holdings', mimeType: 'video/mp4', uploadedBy: 'CAM-07', uploadedAt: '2026-03-22 06:00', metadata: { camera: 'CAM-07', duration: '1:12:30', location: 'Port of Rijeka' } },
    // Balkan Transit
    { id: 'f15', name: 'balkan_transit_financials.xlsx', fileType: 'document', size: '5.4 MB', sizeBytes: 5662310, entityId: 102, entityType: 'organization', entityName: 'Balkan Transit Group', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadedBy: 'Maj. Novak', uploadedAt: '2026-03-21 16:00', metadata: { rows: '12,340', source: 'Bank Transaction Monitor' } },
    // Petrova
    { id: 'f16', name: 'petrova_social_export.pdf', fileType: 'document', size: '8.2 MB', sizeBytes: 8598323, entityId: 2, entityType: 'person', entityName: 'Elena Petrova', mimeType: 'application/pdf', uploadedBy: 'System', uploadedAt: '2026-03-20 12:00', metadata: { pages: '42', platforms: 'Instagram, Telegram', period: '90 days' } },
];

export const keyboardShortcuts = [
    { key: 'F', description: 'Focus search' },
    { key: 'Esc', description: 'Close preview / deselect' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
