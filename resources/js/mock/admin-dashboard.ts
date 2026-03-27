/**
 * ARGUX — Admin Dashboard Mock Data
 * KPIs, system health, services, activity, quick actions
 */

export interface KpiCard {
    id: string; label: string; value: string | number; unit?: string;
    icon: string; color: string; trend: 'up' | 'down' | 'stable'; trendValue: string;
    sparkline: number[];
}

export interface ServiceHealth {
    id: string; name: string; status: 'healthy' | 'degraded' | 'down' | 'maintenance';
    uptime: string; latency: string; cpu: number; memory: number;
    icon: string; description: string; lastCheck: string;
}

export interface QuickAction {
    id: string; label: string; icon: string; color: string; description: string;
    confirmText?: string; dangerous?: boolean;
}

export interface RecentEvent {
    id: string; type: 'login' | 'config' | 'alert' | 'deploy' | 'error' | 'user' | 'sync' | 'backup';
    title: string; description: string; user: string; time: string; icon: string; color: string;
}

export interface StorageBreakdown {
    label: string; size: string; bytes: number; color: string; icon: string;
}

export const statusColors = {
    healthy: '#22c55e', degraded: '#f59e0b', down: '#ef4444', maintenance: '#6b7280',
};

export const kpiCards: KpiCard[] = [
    { id: 'users', label: 'Total Users', value: 147, icon: '👥', color: '#3b82f6', trend: 'up', trendValue: '+12 this month', sparkline: [120, 125, 128, 132, 135, 140, 142, 147] },
    { id: 'sessions', label: 'Active Sessions', value: 34, icon: '🟢', color: '#22c55e', trend: 'stable', trendValue: 'Avg 31/day', sparkline: [28, 32, 35, 30, 34, 33, 31, 34] },
    { id: 'uptime', label: 'System Uptime', value: '99.97%', icon: '⏱️', color: '#8b5cf6', trend: 'up', trendValue: '42 days continuous', sparkline: [99.9, 99.95, 99.92, 99.98, 99.97, 99.99, 99.96, 99.97] },
    { id: 'storage', label: 'Storage Used', value: '2.4 TB', unit: '/ 8 TB', icon: '💾', color: '#f59e0b', trend: 'up', trendValue: '+180 GB this week', sparkline: [1.8, 1.9, 2.0, 2.1, 2.15, 2.2, 2.3, 2.4] },
    { id: 'kafka', label: 'Kafka Queue', value: '1,247', icon: '📨', color: '#06b6d4', trend: 'down', trendValue: '-340 from peak', sparkline: [2100, 1800, 1600, 1500, 1400, 1350, 1280, 1247] },
    { id: 'entities', label: 'Tracked Entities', value: '12,847', icon: '🎯', color: '#ef4444', trend: 'up', trendValue: '+89 today', sparkline: [12200, 12350, 12480, 12550, 12630, 12710, 12780, 12847] },
    { id: 'alerts', label: 'Active Alerts', value: 23, icon: '🚨', color: '#f97316', trend: 'up', trendValue: '+5 since 06:00', sparkline: [12, 14, 16, 18, 17, 19, 21, 23] },
    { id: 'ai_jobs', label: 'AI Queue', value: 8, icon: '🤖', color: '#ec4899', trend: 'down', trendValue: '3 processing now', sparkline: [15, 14, 12, 11, 10, 9, 9, 8] },
];

export const services: ServiceHealth[] = [
    { id: 's1', name: 'PostgreSQL + PostGIS', status: 'healthy', uptime: '99.99%', latency: '2ms', cpu: 18, memory: 42, icon: '🐘', description: 'Primary database', lastCheck: '12s ago' },
    { id: 's2', name: 'Redis Cluster', status: 'healthy', uptime: '99.99%', latency: '<1ms', cpu: 5, memory: 28, icon: '⚡', description: 'Cache & sessions', lastCheck: '8s ago' },
    { id: 's3', name: 'Apache Kafka', status: 'healthy', uptime: '99.98%', latency: '4ms', cpu: 22, memory: 56, icon: '📨', description: 'Event streaming', lastCheck: '5s ago' },
    { id: 's4', name: 'ClickHouse', status: 'healthy', uptime: '99.97%', latency: '8ms', cpu: 35, memory: 61, icon: '📊', description: 'Analytics & time-series', lastCheck: '15s ago' },
    { id: 's5', name: 'Typesense', status: 'healthy', uptime: '99.99%', latency: '3ms', cpu: 8, memory: 22, icon: '🔍', description: 'Full-text search', lastCheck: '10s ago' },
    { id: 's6', name: 'MinIO Storage', status: 'healthy', uptime: '99.99%', latency: '6ms', cpu: 12, memory: 38, icon: '📁', description: 'Object storage', lastCheck: '7s ago' },
    { id: 's7', name: 'Ollama (LLaMA 3.1)', status: 'healthy', uptime: '99.90%', latency: '120ms', cpu: 78, memory: 85, icon: '🤖', description: 'Local LLM inference', lastCheck: '20s ago' },
    { id: 's8', name: 'InsightFace Engine', status: 'healthy', uptime: '99.95%', latency: '45ms', cpu: 62, memory: 72, icon: '🧑', description: 'Face recognition', lastCheck: '18s ago' },
    { id: 's9', name: 'Faster-Whisper', status: 'degraded', uptime: '99.80%', latency: '890ms', cpu: 92, memory: 88, icon: '🎙️', description: 'Audio transcription', lastCheck: '25s ago' },
    { id: 's10', name: 'Keycloak SSO', status: 'healthy', uptime: '99.99%', latency: '15ms', cpu: 10, memory: 34, icon: '🔐', description: 'Authentication', lastCheck: '6s ago' },
    { id: 's11', name: 'Nginx Proxy', status: 'healthy', uptime: '100%', latency: '<1ms', cpu: 3, memory: 8, icon: '🌐', description: 'Reverse proxy + TLS', lastCheck: '4s ago' },
    { id: 's12', name: 'Camera Network', status: 'degraded', uptime: '98.50%', latency: '—', cpu: 0, memory: 0, icon: '📹', description: '2 cameras offline', lastCheck: '30s ago' },
];

export const quickActions: QuickAction[] = [
    { id: 'qa1', label: 'Clear Cache', icon: '🗑️', color: '#f59e0b', description: 'Flush Redis cache + Typesense rebuild' },
    { id: 'qa2', label: 'Restart Workers', icon: '🔄', color: '#3b82f6', description: 'Restart Octane + queue workers', confirmText: 'Restart all workers? Active jobs will be re-queued.' },
    { id: 'qa3', label: 'Force Sync', icon: '📡', color: '#22c55e', description: 'Trigger sync on all 22 data sources' },
    { id: 'qa4', label: 'System Report', icon: '📊', color: '#8b5cf6', description: 'Generate full system health report' },
    { id: 'qa5', label: 'Backup Now', icon: '💾', color: '#06b6d4', description: 'Trigger incremental database backup' },
    { id: 'qa6', label: 'Rebuild Index', icon: '🔍', color: '#ec4899', description: 'Rebuild Typesense + RAG vector index' },
    { id: 'qa7', label: 'Purge Logs', icon: '📋', color: '#f97316', description: 'Archive logs older than 90 days', confirmText: 'Archive old logs? This cannot be undone.', dangerous: true },
    { id: 'qa8', label: 'Kill Sessions', icon: '🔒', color: '#ef4444', description: 'Terminate all active operator sessions', confirmText: 'Kill all sessions? Users will be logged out.', dangerous: true },
];

export const recentEvents: RecentEvent[] = [
    { id: 'e1', type: 'login', title: 'Admin login', description: 'Col. Tomić authenticated via 2FA', user: 'Col. Tomić', time: '2 min ago', icon: '🔐', color: '#22c55e' },
    { id: 'e2', type: 'alert', title: 'Critical alert triggered', description: 'Co-location: Horvat + Mendoza at Savska', user: 'System', time: '12 min ago', icon: '🚨', color: '#ef4444' },
    { id: 'e3', type: 'sync', title: 'Data source sync completed', description: 'INTERPOL I-24/7 — 847 records updated', user: 'Scheduler', time: '18 min ago', icon: '📡', color: '#3b82f6' },
    { id: 'e4', type: 'deploy', title: 'AI model deployed', description: 'Faster-Whisper Large-v3 GPU allocation updated', user: 'Sgt. Matić', time: '25 min ago', icon: '🤖', color: '#8b5cf6' },
    { id: 'e5', type: 'user', title: 'New user registered', description: 'Lt. Ana Perić — pending approval', user: 'System', time: '32 min ago', icon: '👤', color: '#06b6d4' },
    { id: 'e6', type: 'config', title: 'Configuration changed', description: 'Alert cooldown updated: 5min → 3min', user: 'Maj. Novak', time: '45 min ago', icon: '⚙️', color: '#f59e0b' },
    { id: 'e7', type: 'backup', title: 'Backup completed', description: 'Incremental backup — 2.4 TB — verified OK', user: 'Scheduler', time: '1h ago', icon: '💾', color: '#22c55e' },
    { id: 'e8', type: 'error', title: 'Transcription failed', description: 'hassan_storage_ambient.wav — SNR too low', user: 'Faster-Whisper', time: '1.5h ago', icon: '❌', color: '#ef4444' },
    { id: 'e9', type: 'login', title: 'Failed login attempt', description: '3 failed attempts from 192.168.1.45', user: 'Unknown', time: '2h ago', icon: '⚠️', color: '#f97316' },
    { id: 'e10', type: 'sync', title: 'EU Sanctions list updated', description: 'CFSP — 12 new entries, 3 removed', user: 'Scheduler', time: '3h ago', icon: '📡', color: '#3b82f6' },
];

export const storageBreakdown: StorageBreakdown[] = [
    { label: 'Video Recordings', size: '1.2 TB', bytes: 1320000000000, color: '#3b82f6', icon: '🎥' },
    { label: 'Camera Captures', size: '480 GB', bytes: 515000000000, color: '#8b5cf6', icon: '📹' },
    { label: 'Audio Files', size: '220 GB', bytes: 236000000000, color: '#f59e0b', icon: '🎙️' },
    { label: 'Documents & Reports', size: '180 GB', bytes: 193000000000, color: '#22c55e', icon: '📄' },
    { label: 'Photos & Images', size: '160 GB', bytes: 172000000000, color: '#ec4899', icon: '📷' },
    { label: 'Database Backups', size: '120 GB', bytes: 129000000000, color: '#06b6d4', icon: '💾' },
    { label: 'AI Models', size: '45 GB', bytes: 48000000000, color: '#ef4444', icon: '🤖' },
];

export const keyboardShortcuts = [
    { key: 'R', description: 'Refresh dashboard' },
    { key: 'Esc', description: 'Close modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
