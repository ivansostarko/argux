/**
 * ARGUX — Admin Statistics Mock Data
 * 6 tabs of chart data: overview, activity, devices, alerts, media, subjects
 */

export type TabId = 'overview' | 'activity' | 'devices' | 'alerts' | 'media' | 'subjects';
export interface TabDef { id: TabId; label: string; icon: string; }
export const tabs: TabDef[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'activity', label: 'Activity', icon: '⚡' },
    { id: 'devices', label: 'Devices', icon: '📡' },
    { id: 'alerts', label: 'Alerts', icon: '🚨' },
    { id: 'media', label: 'Media & AI', icon: '🤖' },
    { id: 'subjects', label: 'Subjects', icon: '🎯' },
];

// ═══ OVERVIEW ═══
export const overviewKpis = [
    { label: 'Total Events', value: '1,247,832', trend: '+12.4%', color: '#3b82f6' },
    { label: 'Entities Tracked', value: '12,847', trend: '+89 today', color: '#22c55e' },
    { label: 'Active Operations', value: '5', trend: 'HAWK leading', color: '#f59e0b' },
    { label: 'AI Jobs Processed', value: '8,432', trend: '+340 this week', color: '#8b5cf6' },
    { label: 'Storage Used', value: '2.4 TB', trend: '30% of 8 TB', color: '#06b6d4' },
    { label: 'System Uptime', value: '99.97%', trend: '42 days', color: '#22c55e' },
];

export const eventTrend = [
    { month: 'Oct', events: 82400 }, { month: 'Nov', events: 94200 }, { month: 'Dec', events: 87600 },
    { month: 'Jan', events: 105800 }, { month: 'Feb', events: 118400 }, { month: 'Mar', events: 134200 },
];

export const entityGrowth = [
    { month: 'Oct', persons: 8200, orgs: 420, vehicles: 1800 },
    { month: 'Nov', persons: 8900, orgs: 450, vehicles: 2100 },
    { month: 'Dec', persons: 9400, orgs: 470, vehicles: 2400 },
    { month: 'Jan', persons: 10200, orgs: 510, vehicles: 2700 },
    { month: 'Feb', persons: 11400, orgs: 540, vehicles: 3000 },
    { month: 'Mar', persons: 12847, orgs: 580, vehicles: 3200 },
];

export const storageDonut = [
    { label: 'Video', value: 1200, color: '#3b82f6' },
    { label: 'Camera', value: 480, color: '#8b5cf6' },
    { label: 'Audio', value: 220, color: '#f59e0b' },
    { label: 'Docs', value: 180, color: '#22c55e' },
    { label: 'Photos', value: 160, color: '#ec4899' },
    { label: 'Backups', value: 120, color: '#06b6d4' },
    { label: 'AI Models', value: 45, color: '#ef4444' },
];

// ═══ ACTIVITY ═══
export const activityHeatmap: number[][] = [ // 7 days x 24 hours
    [2,1,0,0,1,3,8,22,45,52,48,42,38,44,50,47,40,32,18,12,8,5,3,2],
    [1,1,0,0,0,2,6,18,42,55,50,44,40,46,52,49,42,30,16,10,6,4,2,1],
    [2,1,1,0,1,4,10,25,48,58,54,48,42,48,55,51,44,35,20,14,8,5,3,2],
    [1,0,0,0,0,3,8,20,40,50,46,40,36,42,48,45,38,28,15,10,6,3,2,1],
    [3,2,1,0,1,5,12,28,52,62,58,52,46,52,58,54,48,38,22,15,10,6,4,3],
    [2,1,0,0,0,2,5,12,28,35,32,28,24,22,20,18,14,10,8,6,4,3,2,1],
    [1,0,0,0,0,1,3,8,18,22,20,18,16,14,12,10,8,6,4,3,2,1,1,0],
];
export const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const topSubjectsByActivity = [
    { name: 'Horvat, M.', events: 4823, color: '#ef4444' },
    { name: 'Mendoza, C.', events: 3912, color: '#f97316' },
    { name: 'Hassan, O.', events: 3240, color: '#f59e0b' },
    { name: 'Al-Rashid, A.', events: 2890, color: '#22c55e' },
    { name: 'Babić, I.', events: 2456, color: '#3b82f6' },
    { name: 'Kovačević, A.', events: 1890, color: '#8b5cf6' },
    { name: 'Petrova, E.', events: 1345, color: '#06b6d4' },
    { name: 'Tanaka, Y.', events: 987, color: '#ec4899' },
];

export const eventTypeBreakdown = [
    { type: 'GPS Position', count: 412000, color: '#3b82f6' },
    { type: 'Phone Signal', count: 287000, color: '#22c55e' },
    { type: 'Camera Capture', count: 198000, color: '#8b5cf6' },
    { type: 'LPR Detection', count: 89000, color: '#f59e0b' },
    { type: 'Face Match', count: 42000, color: '#ec4899' },
    { type: 'Audio Intercept', count: 28000, color: '#06b6d4' },
    { type: 'Video Recording', count: 18000, color: '#ef4444' },
    { type: 'Web Scrape', count: 12000, color: '#6b7280' },
];

// ═══ DEVICES ═══
export const devicesByType = [
    { type: 'Cameras', total: 47, online: 45, offline: 2, color: '#3b82f6' },
    { type: 'GPS Trackers', total: 34, online: 32, offline: 2, color: '#22c55e' },
    { type: 'Phones', total: 28, online: 26, offline: 2, color: '#f59e0b' },
    { type: 'LPR Readers', total: 18, online: 18, offline: 0, color: '#8b5cf6' },
    { type: 'Microphones', total: 12, online: 11, offline: 1, color: '#ec4899' },
    { type: 'Face Cameras', total: 8, online: 8, offline: 0, color: '#06b6d4' },
];

export const batteryDistribution = [
    { range: '0-20%', count: 3, color: '#ef4444' },
    { range: '21-40%', count: 7, color: '#f97316' },
    { range: '41-60%', count: 12, color: '#f59e0b' },
    { range: '61-80%', count: 28, color: '#22c55e' },
    { range: '81-100%', count: 45, color: '#3b82f6' },
    { range: 'N/A', count: 52, color: '#6b7280' },
];

export const deviceSyncRate = [
    { hour: '00', cameras: 98, gps: 95, phones: 92 },
    { hour: '04', cameras: 99, gps: 97, phones: 88 },
    { hour: '08', cameras: 97, gps: 99, phones: 96 },
    { hour: '12', cameras: 96, gps: 98, phones: 97 },
    { hour: '16', cameras: 98, gps: 99, phones: 95 },
    { hour: '20', cameras: 99, gps: 96, phones: 93 },
];

// ═══ ALERTS ═══
export const alertFrequency = [
    { day: 'Mon', critical: 3, warning: 12, info: 28 },
    { day: 'Tue', critical: 1, warning: 8, info: 22 },
    { day: 'Wed', critical: 5, warning: 15, info: 35 },
    { day: 'Thu', critical: 2, warning: 10, info: 25 },
    { day: 'Fri', critical: 7, warning: 18, info: 42 },
    { day: 'Sat', critical: 1, warning: 5, info: 12 },
    { day: 'Sun', critical: 0, warning: 3, info: 8 },
];

export const alertSeverityDonut = [
    { severity: 'Critical', count: 19, color: '#ef4444' },
    { severity: 'Warning', count: 71, color: '#f59e0b' },
    { severity: 'Informational', count: 172, color: '#3b82f6' },
];

export const responseTimeHistogram = [
    { range: '<5s', count: 45, color: '#22c55e' },
    { range: '5-15s', count: 82, color: '#3b82f6' },
    { range: '15-30s', count: 34, color: '#f59e0b' },
    { range: '30-60s', count: 12, color: '#f97316' },
    { range: '>60s', count: 3, color: '#ef4444' },
];

export const topTriggeredRules = [
    { rule: 'Zone Entry — Port Area', triggers: 89, severity: 'warning' as const },
    { rule: 'Co-location — Horvat+Mendoza', triggers: 34, severity: 'critical' as const },
    { rule: 'LPR Match — ZG-1847-AB', triggers: 28, severity: 'warning' as const },
    { rule: 'Face Match — Babić (>80%)', triggers: 22, severity: 'info' as const },
    { rule: 'Signal Lost — GPS Fleet', triggers: 18, severity: 'warning' as const },
    { rule: 'Speed Alert — Mendoza >120km/h', triggers: 12, severity: 'critical' as const },
    { rule: 'Zone Exit — Diplomatic Quarter', triggers: 9, severity: 'info' as const },
    { rule: 'Keyword — "Thursday delivery"', triggers: 7, severity: 'critical' as const },
];

// ═══ MEDIA & AI ═══
export const uploadVolume = [
    { week: 'W9', video: 120, audio: 45, photos: 80, docs: 30 },
    { week: 'W10', video: 135, audio: 52, photos: 92, docs: 28 },
    { week: 'W11', video: 148, audio: 48, photos: 88, docs: 35 },
    { week: 'W12', video: 162, audio: 56, photos: 95, docs: 32 },
    { week: 'W13', video: 178, audio: 62, photos: 102, docs: 38 },
];

export const aiProcessingStats = [
    { model: 'Faster-Whisper', jobs: 2847, avgTime: '4.2 min', gpu: '78%', queue: 3, color: '#3b82f6' },
    { model: 'LLaVA Vision', jobs: 1234, avgTime: '1.8 sec', gpu: '45%', queue: 1, color: '#ec4899' },
    { model: 'Meta NLLB-200', jobs: 890, avgTime: '6.4 sec', gpu: '22%', queue: 0, color: '#8b5cf6' },
    { model: 'LLaMA 3.1 70B', jobs: 456, avgTime: '12 sec', gpu: '85%', queue: 4, color: '#22c55e' },
    { model: 'InsightFace', jobs: 3421, avgTime: '0.8 sec', gpu: '62%', queue: 0, color: '#f59e0b' },
    { model: 'PaddleOCR v3', jobs: 1567, avgTime: '0.3 sec', gpu: '15%', queue: 0, color: '#06b6d4' },
];

export const faceMatchRate = [
    { month: 'Oct', matches: 234, searches: 890, rate: 26.3 },
    { month: 'Nov', matches: 312, searches: 1020, rate: 30.6 },
    { month: 'Dec', matches: 287, searches: 950, rate: 30.2 },
    { month: 'Jan', matches: 356, searches: 1100, rate: 32.4 },
    { month: 'Feb', matches: 412, searches: 1240, rate: 33.2 },
    { month: 'Mar', matches: 478, searches: 1380, rate: 34.6 },
];

// ═══ SUBJECTS ═══
export const topPersonsByActivity = [
    { name: 'Horvat, Marko', risk: 'Critical', events: 4823, connections: 18, devices: 5 },
    { name: 'Mendoza, Carlos', risk: 'Critical', events: 3912, connections: 12, devices: 3 },
    { name: 'Hassan, Omar', risk: 'High', events: 3240, connections: 15, devices: 4 },
    { name: 'Al-Rashid, Ahmed', risk: 'Critical', events: 2890, connections: 22, devices: 2 },
    { name: 'Babić, Ivan', risk: 'High', events: 2456, connections: 9, devices: 6 },
    { name: 'Kovačević, Ana', risk: 'High', events: 1890, connections: 7, devices: 2 },
    { name: 'Petrova, Elena', risk: 'Medium', events: 1345, connections: 5, devices: 1 },
    { name: 'Tanaka, Yuki', risk: 'No Risk', events: 987, connections: 3, devices: 1 },
    { name: "O'Brien, James", risk: 'Low', events: 756, connections: 4, devices: 1 },
    { name: 'Chen, Wei', risk: 'Medium', events: 623, connections: 6, devices: 2 },
];

export const topOrgsByConnections = [
    { name: 'Alpha Security Group', connections: 34, risk: 'Critical' },
    { name: 'Rashid Holdings', connections: 28, risk: 'Critical' },
    { name: 'Falcon Trading LLC', connections: 22, risk: 'High' },
    { name: 'Dragon Tech Solutions', connections: 18, risk: 'High' },
    { name: 'Meridian Logistics', connections: 15, risk: 'Medium' },
    { name: 'Balkan Import/Export', connections: 12, risk: 'High' },
    { name: 'Crimson Bay Capital', connections: 9, risk: 'Medium' },
    { name: 'Silk Route Ventures', connections: 7, risk: 'Low' },
];

export const riskDistribution = [
    { level: 'Critical', persons: 3, orgs: 2, color: '#ef4444' },
    { level: 'High', persons: 5, orgs: 4, color: '#f97316' },
    { level: 'Medium', persons: 6, orgs: 3, color: '#f59e0b' },
    { level: 'Low', persons: 5, orgs: 2, color: '#22c55e' },
    { level: 'No Risk', persons: 4, orgs: 2, color: '#6b7280' },
];

export const newEntitiesTrend = [
    { month: 'Oct', persons: 45, orgs: 8, vehicles: 22 },
    { month: 'Nov', persons: 62, orgs: 12, vehicles: 34 },
    { month: 'Dec', persons: 38, orgs: 6, vehicles: 18 },
    { month: 'Jan', persons: 71, orgs: 15, vehicles: 40 },
    { month: 'Feb', persons: 84, orgs: 11, vehicles: 38 },
    { month: 'Mar', persons: 89, orgs: 14, vehicles: 42 },
];

export const keyboardShortcuts = [
    { key: '1-6', description: 'Switch tab' },
    { key: 'R', description: 'Refresh data' },
    { key: 'Esc', description: 'Close modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
