/**
 * ARGUX — Admin Configuration Mock Data
 * 11 tabs: general, security, notifications, dev, map, retention, backup, ai, storage, update, licence
 */

export type ConfigTab = 'general' | 'security' | 'notifications' | 'dev' | 'map' | 'retention' | 'backup' | 'ai' | 'storage' | 'update' | 'licence';
export interface TabDef { id: ConfigTab; label: string; icon: string; }

export const configTabs: TabDef[] = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'dev', label: 'Developer', icon: '🛠️' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'retention', label: 'Retention', icon: '📦' },
    { id: 'backup', label: 'Backup', icon: '💾' },
    { id: 'ai', label: 'AI Models', icon: '🤖' },
    { id: 'storage', label: 'Storage', icon: '🗄️' },
    { id: 'update', label: 'Update', icon: '🔄' },
    { id: 'licence', label: 'Licence', icon: '🔑' },
];

// ═══ GENERAL ═══
export const languages = [
    { code: 'en', label: 'English' }, { code: 'hr', label: 'Croatian (Hrvatski)' },
    { code: 'de', label: 'German (Deutsch)' }, { code: 'fr', label: 'French (Français)' },
    { code: 'es', label: 'Spanish (Español)' }, { code: 'ar', label: 'Arabic (العربية)' },
];
export const timezones = ['Europe/Zagreb','Europe/London','Europe/Berlin','Europe/Moscow','America/New_York','America/Chicago','America/Los_Angeles','Asia/Dubai','Asia/Tokyo','Asia/Shanghai','Australia/Sydney','UTC'];
export const dateFormats = ['DD.MM.YYYY','MM/DD/YYYY','YYYY-MM-DD','DD/MM/YYYY','DD-MMM-YYYY'];
export const themes = [
    { id: 'tactical-dark', label: 'Tactical Dark' },{ id: 'midnight-ops', label: 'Midnight Ops' },
    { id: 'stealth-green', label: 'Stealth Green' },{ id: 'crimson-ops', label: 'Crimson Ops' },
    { id: 'desert-storm', label: 'Desert Storm' },{ id: 'ocean-depth', label: 'Ocean Depth' },
    { id: 'phantom-gray', label: 'Phantom Gray' },{ id: 'arctic-white', label: 'Arctic White' },
    { id: 'sand-light', label: 'Sand Light' },{ id: 'silver-steel', label: 'Silver Steel' },
];
export const fonts = [
    { id: 'geist', label: 'Geist' },{ id: 'ibm-plex', label: 'IBM Plex Sans' },
    { id: 'dm-sans', label: 'DM Sans' },{ id: 'space-grotesk', label: 'Space Grotesk' },
    { id: 'outfit', label: 'Outfit' },{ id: 'sora', label: 'Sora' },
    { id: 'source-code', label: 'Source Code Pro' },
];
export interface ClockCity { id: string; label: string; timezone: string; }
export const defaultClocks: ClockCity[] = [
    { id: 'c1', label: 'Zagreb', timezone: 'Europe/Zagreb' },
    { id: 'c2', label: 'London', timezone: 'Europe/London' },
    { id: 'c3', label: 'New York', timezone: 'America/New_York' },
    { id: 'c4', label: 'Dubai', timezone: 'Asia/Dubai' },
    { id: 'c5', label: 'Tokyo', timezone: 'Asia/Tokyo' },
];

// ═══ SECURITY ═══
export const mfaMethods = ['Authenticator App','SMS','Email'];
export const sessionTimeouts = ['15 minutes','30 minutes','1 hour','2 hours','4 hours','8 hours','24 hours','Never'];
export const encryptionOptions = ['AES-256-GCM','AES-256-CBC','ChaCha20-Poly1305'];
export const passwordPolicies = [
    { id: 'min_length', label: 'Minimum Length', value: '12', type: 'number' },
    { id: 'require_upper', label: 'Require Uppercase', value: true, type: 'toggle' },
    { id: 'require_lower', label: 'Require Lowercase', value: true, type: 'toggle' },
    { id: 'require_number', label: 'Require Number', value: true, type: 'toggle' },
    { id: 'require_special', label: 'Require Special Character', value: true, type: 'toggle' },
    { id: 'max_age', label: 'Max Password Age (days)', value: '90', type: 'number' },
    { id: 'history', label: 'Password History (prevent reuse)', value: '5', type: 'number' },
];
export const defaultIpWhitelist = ['10.0.0.0/8','192.168.0.0/16','172.16.0.0/12'];

// ═══ NOTIFICATIONS ═══
export const notificationTypes = [
    { id: 'zone_breach', label: 'Zone Breach Alert', icon: '🚧', default: true },
    { id: 'face_match', label: 'Face Recognition Match', icon: '🧑', default: true },
    { id: 'lpr_match', label: 'LPR Match', icon: '🔢', default: true },
    { id: 'colocation', label: 'Co-location Alert', icon: '📍', default: true },
    { id: 'signal_lost', label: 'Signal Lost', icon: '📡', default: true },
    { id: 'speed_alert', label: 'Speed Alert', icon: '🏎️', default: true },
    { id: 'keyword', label: 'Keyword Detection', icon: '🔤', default: true },
    { id: 'device_offline', label: 'Device Offline', icon: '🔴', default: false },
    { id: 'sync_complete', label: 'Data Source Sync', icon: '📡', default: false },
    { id: 'report_ready', label: 'Report Generated', icon: '📊', default: true },
    { id: 'ai_complete', label: 'AI Job Complete', icon: '🤖', default: false },
    { id: 'user_login', label: 'User Login', icon: '🔐', default: false },
    { id: 'backup_complete', label: 'Backup Complete', icon: '💾', default: false },
    { id: 'system_error', label: 'System Error', icon: '❌', default: true },
];
export const notificationChannels = [
    { id: 'in_app', label: 'In-App Notifications', icon: '🔔', enabled: true },
    { id: 'email', label: 'Email', icon: '📧', enabled: true },
    { id: 'sms', label: 'SMS', icon: '📱', enabled: false },
    { id: 'webhook', label: 'Webhook', icon: '🔗', enabled: false },
    { id: 'telegram', label: 'Telegram Bot', icon: '✈️', enabled: false },
    { id: 'slack', label: 'Slack Integration', icon: '💬', enabled: false },
    { id: 'push', label: 'Push Notifications', icon: '📲', enabled: true },
];

// ═══ DEV ═══
export const appEnvironments = ['production','staging','development','testing','local'];
export const debugModes = ['disabled','enabled','verbose'];
export const logLevels = ['emergency','alert','critical','error','warning','notice','info','debug'];
export const logChannels = ['stack','single','daily','syslog','stderr','null'];
export const filesystems = ['local','minio','s3','nfs'];

// ═══ MAP ═══
export const tileProviders = ['OpenFreeMap (Vector)','CartoDB Dark','CartoDB Light','CartoDB Voyager','ESRI World Imagery','ESRI Topo','ESRI Street','Stamen Toner','Stamen Watercolor','Stamen Terrain','OSM Standard','OSM Humanitarian','Thunderforest Outdoors','OpenTopoMap','CARTO Positron','CARTO DarkMatter'];
export const mapLayers = ['Markers','Heatmap','Tracks','Zones','Network','Clusters'];

// ═══ RETENTION ═══
export const retentionPeriods = ['7 days','14 days','30 days','60 days','90 days','180 days','1 year','2 years','5 years','Forever'];

// ═══ BACKUP ═══
export const backupFrequencies = ['Every 6 hours','Every 12 hours','Daily','Weekly','Monthly'];
export const backupTypes = ['Full','Incremental','Differential'];
export interface BackupRecord {
    id: string; type: string; status: 'completed' | 'running' | 'failed' | 'scheduled';
    size: string; createdAt: string; duration: string; verified: boolean;
    databases: string[]; includesFiles: boolean; encryption: boolean; note: string;
}
export const backupHistory: BackupRecord[] = [
    { id: 'b1', type: 'Incremental', status: 'completed', size: '2.4 TB', createdAt: '2026-03-28 04:00', duration: '47 min', verified: true, databases: ['PostgreSQL','ClickHouse','Redis'], includesFiles: true, encryption: true, note: 'Scheduled daily backup' },
    { id: 'b2', type: 'Incremental', status: 'completed', size: '2.38 TB', createdAt: '2026-03-27 04:00', duration: '44 min', verified: true, databases: ['PostgreSQL','ClickHouse','Redis'], includesFiles: true, encryption: true, note: 'Scheduled daily backup' },
    { id: 'b3', type: 'Full', status: 'completed', size: '2.35 TB', createdAt: '2026-03-24 02:00', duration: '2h 18min', verified: true, databases: ['PostgreSQL','ClickHouse','Redis','Typesense'], includesFiles: true, encryption: true, note: 'Weekly full backup' },
    { id: 'b4', type: 'Incremental', status: 'failed', size: '—', createdAt: '2026-03-23 04:00', duration: '12 min', verified: false, databases: ['PostgreSQL'], includesFiles: false, encryption: true, note: 'Failed: ClickHouse connection timeout' },
    { id: 'b5', type: 'Full', status: 'completed', size: '2.28 TB', createdAt: '2026-03-17 02:00', duration: '2h 05min', verified: true, databases: ['PostgreSQL','ClickHouse','Redis','Typesense'], includesFiles: true, encryption: true, note: 'Weekly full backup' },
    { id: 'b6', type: 'Incremental', status: 'scheduled', size: '—', createdAt: '2026-03-29 04:00', duration: '—', verified: false, databases: ['PostgreSQL','ClickHouse','Redis'], includesFiles: true, encryption: true, note: 'Next scheduled backup' },
];
export const backupDatabases = [
    { id: 'pg', label: 'PostgreSQL + PostGIS', icon: '🐘', size: '84 GB', enabled: true },
    { id: 'ch', label: 'ClickHouse', icon: '📊', size: '320 GB', enabled: true },
    { id: 'redis', label: 'Redis', icon: '⚡', size: '2.8 GB', enabled: true },
    { id: 'typesense', label: 'Typesense', icon: '🔍', size: '12 GB', enabled: true },
    { id: 'chromadb', label: 'ChromaDB (RAG)', icon: '🧠', size: '4.2 GB', enabled: false },
];

// ═══ AI ═══
export type AiFunction = 'rag' | 'audio_transcription' | 'video_analysis' | 'photo_analysis' | 'plate_recognition' | 'face_recognition' | 'translation' | 'summarization' | 'anomaly_detection';
export interface AiModel { id: string; name: string; version: string; gpu: string; status: 'active' | 'standby' | 'error'; }
export interface AiFunctionDef {
    id: AiFunction; label: string; icon: string; description: string;
    models: AiModel[]; primaryModelId: string;
    jobsToday: number; jobsTotal: number; avgTime: string; errorRate: string;
    gpuUsage: number; queueDepth: number;
}
export const aiFunctions: AiFunctionDef[] = [
    { id: 'rag', label: 'RAG Assistant', icon: '🧠', description: 'Retrieval-augmented generation for AI chat queries with entity context.',
        models: [{ id: 'llama70', name: 'LLaMA 3.1 70B', version: 'v3.1', gpu: '24 GB', status: 'active' },{ id: 'llama8', name: 'LLaMA 3.1 8B', version: 'v3.1', gpu: '8 GB', status: 'standby' },{ id: 'mistral7', name: 'Mistral 7B', version: 'v0.3', gpu: '8 GB', status: 'standby' }],
        primaryModelId: 'llama70', jobsToday: 47, jobsTotal: 3240, avgTime: '12s', errorRate: '0.3%', gpuUsage: 85, queueDepth: 4 },
    { id: 'audio_transcription', label: 'Audio Transcription', icon: '🎙️', description: 'Speech-to-text for phone intercepts, ambient audio, and recordings.',
        models: [{ id: 'whisper-lg', name: 'Faster-Whisper Large-v3', version: 'v3', gpu: '12 GB', status: 'active' },{ id: 'whisper-md', name: 'Faster-Whisper Medium', version: 'v3', gpu: '6 GB', status: 'standby' }],
        primaryModelId: 'whisper-lg', jobsToday: 23, jobsTotal: 2847, avgTime: '4.2min', errorRate: '1.2%', gpuUsage: 78, queueDepth: 3 },
    { id: 'video_analysis', label: 'Video Analysis', icon: '🎥', description: 'Video transcription, object detection, and behavior analysis.',
        models: [{ id: 'whisper-vid', name: 'Faster-Whisper Large-v3', version: 'v3', gpu: '12 GB', status: 'active' },{ id: 'yolo-vid', name: 'YOLOv8 (Object)', version: 'v8.2', gpu: '4 GB', status: 'active' }],
        primaryModelId: 'whisper-vid', jobsToday: 8, jobsTotal: 1456, avgTime: '8.5min', errorRate: '2.1%', gpuUsage: 72, queueDepth: 2 },
    { id: 'photo_analysis', label: 'Photo Analysis & OCR', icon: '📷', description: 'Image analysis, OCR text extraction, and document scanning.',
        models: [{ id: 'llava', name: 'LLaVA Vision', version: 'v1.6', gpu: '8 GB', status: 'active' },{ id: 'paddleocr', name: 'PaddleOCR v3', version: 'v3', gpu: '2 GB', status: 'active' }],
        primaryModelId: 'llava', jobsToday: 34, jobsTotal: 1234, avgTime: '1.8s', errorRate: '0.5%', gpuUsage: 45, queueDepth: 1 },
    { id: 'plate_recognition', label: 'Plate Recognition (LPR)', icon: '🚗', description: 'License plate detection and character recognition from camera feeds.',
        models: [{ id: 'yolo-lpr', name: 'YOLOv8 (Plate Detect)', version: 'v8.2', gpu: '4 GB', status: 'active' },{ id: 'paddle-lpr', name: 'PaddleOCR v3 (Chars)', version: 'v3', gpu: '2 GB', status: 'active' }],
        primaryModelId: 'yolo-lpr', jobsToday: 892, jobsTotal: 48200, avgTime: '0.3s', errorRate: '0.8%', gpuUsage: 35, queueDepth: 0 },
    { id: 'face_recognition', label: 'Face Recognition', icon: '🧑', description: 'Facial detection, matching, and identification against known subjects.',
        models: [{ id: 'insightface', name: 'InsightFace / ArcFace', version: 'v2.1', gpu: '6 GB', status: 'active' },{ id: 'retinaface', name: 'RetinaFace (Detect)', version: 'v1.0', gpu: '2 GB', status: 'active' }],
        primaryModelId: 'insightface', jobsToday: 156, jobsTotal: 3421, avgTime: '0.8s', errorRate: '0.2%', gpuUsage: 62, queueDepth: 0 },
    { id: 'translation', label: 'Translation', icon: '🌐', description: 'Multi-language text translation (200 languages supported).',
        models: [{ id: 'nllb200', name: 'Meta NLLB-200', version: 'v1.0', gpu: '4 GB', status: 'active' }],
        primaryModelId: 'nllb200', jobsToday: 12, jobsTotal: 890, avgTime: '6.4s', errorRate: '0.1%', gpuUsage: 22, queueDepth: 0 },
    { id: 'summarization', label: 'Summarization', icon: '📝', description: 'Document and report summarization using large language models.',
        models: [{ id: 'llama-sum', name: 'LLaMA 3.1 70B', version: 'v3.1', gpu: '24 GB', status: 'active' }],
        primaryModelId: 'llama-sum', jobsToday: 5, jobsTotal: 456, avgTime: '18s', errorRate: '0.4%', gpuUsage: 85, queueDepth: 1 },
    { id: 'anomaly_detection', label: 'Anomaly Detection', icon: '🔮', description: 'Behavioral pattern analysis and predictive risk scoring.',
        models: [{ id: 'xgb', name: 'XGBoost Risk', version: 'v1.7', gpu: '0 GB', status: 'active' },{ id: 'sklearn', name: 'scikit-learn Pipeline', version: 'v1.4', gpu: '0 GB', status: 'active' }],
        primaryModelId: 'xgb', jobsToday: 1247, jobsTotal: 89400, avgTime: '0.05s', errorRate: '0%', gpuUsage: 0, queueDepth: 0 },
];

// ═══ STORAGE ═══
export interface StorageNode { id: string; label: string; icon: string; type: 'database' | 'object' | 'cache' | 'search'; totalGb: number; usedGb: number; status: 'healthy' | 'warning' | 'critical'; host: string; port: number; version: string; connections?: number; }
export const storageNodes: StorageNode[] = [
    { id: 'pg', label: 'PostgreSQL + PostGIS', icon: '🐘', type: 'database', totalGb: 500, usedGb: 84, status: 'healthy', host: '10.0.1.50', port: 5432, version: '16.2 + PostGIS 3.4', connections: 42 },
    { id: 'ch', label: 'ClickHouse', icon: '📊', type: 'database', totalGb: 1000, usedGb: 320, status: 'healthy', host: '10.0.1.51', port: 8123, version: '24.3', connections: 18 },
    { id: 'minio', label: 'MinIO Object Storage', icon: '📁', type: 'object', totalGb: 8000, usedGb: 2405, status: 'healthy', host: '10.0.1.60', port: 9000, version: 'RELEASE.2024-03' },
    { id: 'redis', label: 'Redis Cluster', icon: '⚡', type: 'cache', totalGb: 32, usedGb: 2.8, status: 'healthy', host: '10.0.1.52', port: 6379, version: '7.2.4', connections: 156 },
    { id: 'typesense', label: 'Typesense', icon: '🔍', type: 'search', totalGb: 64, usedGb: 12, status: 'healthy', host: '10.0.1.53', port: 8108, version: '27.0' },
    { id: 'chroma', label: 'ChromaDB (RAG vectors)', icon: '🧠', type: 'database', totalGb: 50, usedGb: 4.2, status: 'healthy', host: '10.0.1.54', port: 8000, version: '0.4.22' },
];
export interface MinioBucket { name: string; objects: number; size: string; sizeGb: number; }
export const minioBuckets: MinioBucket[] = [
    { name: 'surveillance-video', objects: 12840, size: '1.2 TB', sizeGb: 1200 },
    { name: 'camera-captures', objects: 89200, size: '480 GB', sizeGb: 480 },
    { name: 'audio-recordings', objects: 4520, size: '220 GB', sizeGb: 220 },
    { name: 'documents-reports', objects: 8900, size: '180 GB', sizeGb: 180 },
    { name: 'photos-images', objects: 34600, size: '160 GB', sizeGb: 160 },
    { name: 'database-backups', objects: 45, size: '120 GB', sizeGb: 120 },
    { name: 'ai-models', objects: 18, size: '45 GB', sizeGb: 45 },
];

// ═══ UPDATE ═══
export interface UpdateVersion { version: string; date: string; type: 'major' | 'minor' | 'patch' | 'security'; changes: string[]; size: string; }
export const currentVersion = { version: '0.25.36', build: '20260328-001', date: '2026-03-28', environment: 'production', node: 'v22.12.0', php: '8.4.2', laravel: '13.0.4', react: '19.1.0', vite: '6.2.0', tauri: '2.3.1' };
export const availableUpdates: UpdateVersion[] = [
    { version: '0.26.0', date: '2026-03-30', type: 'minor', changes: ['New Statistics drill-down charts','Improved camera wall grid performance','Arabic RTL layout support','Kafka consumer auto-scaling','Bug fixes for LPR diacritics'], size: '128 MB' },
    { version: '0.25.37', date: '2026-03-29', type: 'patch', changes: ['Fixed Faster-Whisper GPU overflow on 30+ min files','Fixed connections graph 500+ node crash','Updated InsightFace confidence calibration'], size: '12 MB' },
];
export const updateHistory: UpdateVersion[] = [
    { version: '0.25.36', date: '2026-03-28', type: 'patch', changes: ['Admin config — 11 tabs with 60+ settings','Admin statistics — 6 tab dashboards with SVG charts'], size: '45 MB' },
    { version: '0.25.30', date: '2026-03-27', type: 'minor', changes: ['Admin Knowledge Base','Admin Support Tickets','Admin Audit Log','Admin Dashboard'], size: '82 MB' },
    { version: '0.25.0', date: '2026-03-25', type: 'minor', changes: ['Records AI Processing page','Admin layout and sidebar','9 admin placeholder pages'], size: '64 MB' },
    { version: '0.24.0', date: '2026-03-20', type: 'minor', changes: ['Vision camera wall','Operations planning','Connections graph'], size: '96 MB' },
];

// ═══ LICENCE ═══
export interface LicenceModule { id: string; label: string; icon: string; included: boolean; addon: boolean; addonPrice?: string; }
export const licenceInfo = {
    key: 'ARGUX-ENT-2026-XXXXX-XXXXX-XXXXX',
    type: 'Enterprise' as const,
    holder: 'Ministry of Interior — Republic of Croatia',
    seats: { used: 147, total: 200 },
    validFrom: '2024-01-15', validUntil: '2027-01-14',
    hardwareLock: 'HW-ID: A3F7B2C0-D4E8F100',
    support: 'Premium 24/7',
    lastChecked: '2026-03-28 08:00',
    status: 'active' as const,
    daysRemaining: 293,
};
export const licenceTypes = ['Community','Professional','Enterprise','Government','Military'];
export const licenceModules: LicenceModule[] = [
    { id: 'map', label: 'Tactical Map', icon: '🗺️', included: true, addon: false },
    { id: 'vision', label: 'Vision Camera Wall', icon: '📹', included: true, addon: false },
    { id: 'persons', label: 'Person Management', icon: '👤', included: true, addon: false },
    { id: 'organizations', label: 'Organization Mgmt', icon: '🏢', included: true, addon: false },
    { id: 'vehicles', label: 'Vehicle Tracking', icon: '🚗', included: true, addon: false },
    { id: 'devices', label: 'Device Management', icon: '📡', included: true, addon: false },
    { id: 'operations', label: 'Operations Planning', icon: '🎯', included: true, addon: false },
    { id: 'face_recognition', label: 'Face Recognition', icon: '🧑', included: true, addon: true, addonPrice: '€15,000/yr' },
    { id: 'plate_recognition', label: 'Plate Recognition', icon: '🔢', included: true, addon: true, addonPrice: '€12,000/yr' },
    { id: 'social_scraper', label: 'Social Media Scraper', icon: '🔗', included: true, addon: true, addonPrice: '€8,000/yr' },
    { id: 'web_scraper', label: 'Web Scraper', icon: '🌐', included: true, addon: false },
    { id: 'surveillance_apps', label: 'Surveillance Apps', icon: '📱', included: true, addon: true, addonPrice: '€20,000/yr' },
    { id: 'connections', label: 'Connections Graph', icon: '🔗', included: true, addon: false },
    { id: 'workflows', label: 'Workflow Automation', icon: '📋', included: true, addon: false },
    { id: 'ai_assistant', label: 'AI Assistant (RAG)', icon: '🤖', included: true, addon: true, addonPrice: '€25,000/yr' },
    { id: 'ai_transcription', label: 'AI Transcription', icon: '🎙️', included: true, addon: true, addonPrice: '€18,000/yr' },
    { id: 'ai_translation', label: 'AI Translation', icon: '🌐', included: true, addon: true, addonPrice: '€10,000/yr' },
    { id: 'reports', label: 'Report Generator', icon: '📊', included: true, addon: false },
    { id: 'data_sources', label: 'Data Source Integrations', icon: '💾', included: true, addon: false },
    { id: 'alerts', label: 'Alert System', icon: '🚨', included: true, addon: false },
    { id: 'admin_panel', label: 'Admin Panel', icon: '⚙️', included: true, addon: false },
    { id: 'audit_trail', label: 'Audit Trail', icon: '📋', included: true, addon: false },
    { id: 'air_gap', label: 'Air-Gap Deployment', icon: '🔒', included: true, addon: true, addonPrice: '€30,000/yr' },
    { id: 'multi_site', label: 'Multi-Site Federation', icon: '🌍', included: false, addon: true, addonPrice: '€50,000/yr' },
    { id: 'satellite_feed', label: 'Satellite Feed Integration', icon: '🛰️', included: false, addon: true, addonPrice: '€75,000/yr' },
];

export const keyboardShortcuts = [
    { key: '1-9,0', description: 'Switch tab (0=10, -=11)' },
    { key: 'S', description: 'Save settings' },
    { key: 'Esc', description: 'Close modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
