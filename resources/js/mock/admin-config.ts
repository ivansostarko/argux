/**
 * ARGUX — Admin Configuration Mock Data
 * Settings across 7 tabs: general, security, notifications, dev, map, retention, backup/ai
 */

export type ConfigTab = 'general' | 'security' | 'notifications' | 'dev' | 'map' | 'retention' | 'system';
export interface TabDef { id: ConfigTab; label: string; icon: string; }

export const configTabs: TabDef[] = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'dev', label: 'Developer', icon: '🛠️' },
    { id: 'map', label: 'Map Defaults', icon: '🗺️' },
    { id: 'retention', label: 'Data Retention', icon: '📦' },
    { id: 'system', label: 'Backup & AI', icon: '💾' },
];

// ═══ GENERAL ═══
export const languages = [
    { code: 'en', label: 'English' }, { code: 'hr', label: 'Croatian (Hrvatski)' },
    { code: 'de', label: 'German (Deutsch)' }, { code: 'fr', label: 'French (Français)' },
    { code: 'es', label: 'Spanish (Español)' }, { code: 'ar', label: 'Arabic (العربية)' },
];
export const timezones = [
    'Europe/Zagreb', 'Europe/London', 'Europe/Berlin', 'Europe/Moscow',
    'America/New_York', 'America/Chicago', 'America/Los_Angeles',
    'Asia/Dubai', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney', 'UTC',
];
export const dateFormats = ['DD.MM.YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MMM-YYYY'];
export const themes = [
    { id: 'tactical-dark', label: 'Tactical Dark' }, { id: 'midnight-ops', label: 'Midnight Ops' },
    { id: 'stealth-green', label: 'Stealth Green' }, { id: 'crimson-ops', label: 'Crimson Ops' },
    { id: 'desert-storm', label: 'Desert Storm' }, { id: 'ocean-depth', label: 'Ocean Depth' },
    { id: 'phantom-gray', label: 'Phantom Gray' }, { id: 'arctic-white', label: 'Arctic White' },
    { id: 'sand-light', label: 'Sand Light' }, { id: 'silver-steel', label: 'Silver Steel' },
];
export const fonts = [
    { id: 'geist', label: 'Geist' }, { id: 'ibm-plex', label: 'IBM Plex Sans' },
    { id: 'dm-sans', label: 'DM Sans' }, { id: 'space-grotesk', label: 'Space Grotesk' },
    { id: 'outfit', label: 'Outfit' }, { id: 'sora', label: 'Sora' },
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
export const mfaMethods = ['Authenticator App', 'SMS', 'Email'];
export const sessionTimeouts = ['15 minutes', '30 minutes', '1 hour', '2 hours', '4 hours', '8 hours', '24 hours', 'Never'];
export const encryptionOptions = ['AES-256-GCM', 'AES-256-CBC', 'ChaCha20-Poly1305'];
export const passwordPolicies = [
    { id: 'min_length', label: 'Minimum Length', value: '12', type: 'number' },
    { id: 'require_upper', label: 'Require Uppercase', value: true, type: 'toggle' },
    { id: 'require_lower', label: 'Require Lowercase', value: true, type: 'toggle' },
    { id: 'require_number', label: 'Require Number', value: true, type: 'toggle' },
    { id: 'require_special', label: 'Require Special Character', value: true, type: 'toggle' },
    { id: 'max_age', label: 'Max Password Age (days)', value: '90', type: 'number' },
    { id: 'history', label: 'Password History (prevent reuse)', value: '5', type: 'number' },
];
export const defaultIpWhitelist = ['10.0.0.0/8', '192.168.0.0/16', '172.16.0.0/12'];

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
export const appEnvironments = ['production', 'staging', 'development', 'testing', 'local'];
export const debugModes = ['disabled', 'enabled', 'verbose'];
export const logLevels = ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug'];
export const logChannels = ['stack', 'single', 'daily', 'syslog', 'stderr', 'null'];
export const filesystems = ['local', 'minio', 's3', 'nfs'];

// ═══ MAP ═══
export const tileProviders = [
    'OpenFreeMap (Vector)', 'CartoDB Dark', 'CartoDB Light', 'CartoDB Voyager',
    'ESRI World Imagery', 'ESRI Topo', 'ESRI Street', 'Stamen Toner',
    'Stamen Watercolor', 'Stamen Terrain', 'OSM Standard', 'OSM Humanitarian',
    'Thunderforest Outdoors', 'OpenTopoMap', 'CARTO Positron', 'CARTO DarkMatter',
];
export const mapLayers = ['Markers', 'Heatmap', 'Tracks', 'Zones', 'Network', 'Clusters'];

// ═══ RETENTION ═══
export const retentionPeriods = ['7 days', '14 days', '30 days', '60 days', '90 days', '180 days', '1 year', '2 years', '5 years', 'Forever'];

// ═══ SYSTEM ═══
export const backupFrequencies = ['Every 6 hours', 'Every 12 hours', 'Daily', 'Weekly', 'Monthly'];
export const backupTypes = ['Full', 'Incremental', 'Differential'];
export const aiModels = [
    { id: 'llama', label: 'LLaMA 3.1 70B', gpu: '24 GB', status: 'active' },
    { id: 'llama8b', label: 'LLaMA 3.1 8B', gpu: '8 GB', status: 'standby' },
    { id: 'whisper', label: 'Faster-Whisper Large-v3', gpu: '12 GB', status: 'active' },
    { id: 'insightface', label: 'InsightFace / ArcFace', gpu: '6 GB', status: 'active' },
    { id: 'nllb', label: 'Meta NLLB-200', gpu: '4 GB', status: 'active' },
    { id: 'llava', label: 'LLaVA Vision', gpu: '8 GB', status: 'active' },
    { id: 'paddleocr', label: 'PaddleOCR v3', gpu: '2 GB', status: 'active' },
    { id: 'yolov8', label: 'YOLOv8 (LPR)', gpu: '4 GB', status: 'active' },
    { id: 'mistral', label: 'Mistral 7B (RAG)', gpu: '8 GB', status: 'standby' },
];

export const keyboardShortcuts = [
    { key: '1-7', description: 'Switch tab' },
    { key: 'S', description: 'Save settings' },
    { key: 'Esc', description: 'Close modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
