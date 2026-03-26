/**
 * ARGUX — Alerts Mock Data
 * 18 alert rules, 12 alert events, trigger/severity configs, shortcuts
 */
export type TriggerType = 'zone_entry' | 'zone_exit' | 'colocation' | 'face_match' | 'photo_video' | 'speed_alert' | 'signal_lost' | 'lpr_match' | 'keyword';
export type Severity = 'Critical' | 'Warning' | 'Informational';
export type Channel = 'In-App' | 'Email' | 'SMS' | 'Webhook';
export type ViewTab = 'rules' | 'feed' | 'stats';

export interface AlertRule {
    id: string; name: string; description: string;
    triggerType: TriggerType; severity: Severity;
    enabled: boolean; channels: Channel[];
    cooldown: number; targetPersonIds: number[]; targetPersonNames: string[];
    targetOrgIds: number[]; targetOrgNames: string[];
    operationCode: string; config: Record<string, string>;
    firedCount: number; lastFired: string;
    createdAt: string; createdBy: string;
}

export interface AlertEvent {
    id: string; ruleId: string; ruleName: string; triggerType: TriggerType; severity: Severity;
    title: string; personName: string; location: string;
    timestamp: string; timeAgo: string; acknowledged: boolean;
}

export const triggerConfig: Record<TriggerType, { icon: string; label: string; color: string; fields: string[] }> = {
    zone_entry: { icon: '🛡️', label: 'Zone Entry', color: '#ef4444', fields: ['Zone', 'Subjects', 'Time Window'] },
    zone_exit: { icon: '🚪', label: 'Zone Exit', color: '#f97316', fields: ['Zone', 'Subjects', 'Time Window'] },
    colocation: { icon: '🔗', label: 'Co-location', color: '#ec4899', fields: ['Subject A', 'Subject B', 'Radius (m)'] },
    face_match: { icon: '🧑', label: 'Face Match', color: '#8b5cf6', fields: ['Subject', 'Confidence %', 'Camera'] },
    photo_video: { icon: '📸', label: 'Photo/Video', color: '#06b6d4', fields: ['Subject', 'Source Type', 'Time Filter'] },
    speed_alert: { icon: '🏎️', label: 'Speed Alert', color: '#f59e0b', fields: ['Speed (km/h)', 'Subject', 'Zone'] },
    signal_lost: { icon: '📵', label: 'Signal Lost', color: '#6b7280', fields: ['Timeout (min)', 'Devices', 'Location'] },
    lpr_match: { icon: '🚗', label: 'LPR Match', color: '#10b981', fields: ['Plate Pattern', 'Reader', 'Time Window'] },
    keyword: { icon: '🔤', label: 'Keyword', color: '#3b82f6', fields: ['Keywords', 'Languages', 'Confidence'] },
};

export const sevColors: Record<Severity, string> = { Critical: '#ef4444', Warning: '#f59e0b', Informational: '#3b82f6' };

export const mockRules: AlertRule[] = [
    { id: 'ar-01', name: 'Horvat Port Terminal Entry', description: 'Triggers when Horvat enters the Port Terminal restricted perimeter.', triggerType: 'zone_entry', severity: 'Critical', enabled: true, channels: ['In-App', 'SMS', 'Email'], cooldown: 5, targetPersonIds: [1], targetPersonNames: ['Marko Horvat'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Zone: 'Port Terminal Perimeter', Radius: '500m', 'Time Window': '24/7' }, firedCount: 11, lastFired: '2026-03-24 06:42', createdAt: '2026-03-01', createdBy: 'Col. Tomić' },
    { id: 'ar-02', name: 'Horvat + Mendoza Co-location', description: 'Detects when Horvat and Mendoza are within 50 meters.', triggerType: 'colocation', severity: 'Critical', enabled: true, channels: ['In-App', 'SMS'], cooldown: 15, targetPersonIds: [1, 9], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { 'Subject A': 'Marko Horvat', 'Subject B': 'Carlos Mendoza', Radius: '50m' }, firedCount: 8, lastFired: '2026-03-24 09:15', createdAt: '2026-03-05', createdBy: 'Cpt. Horvat' },
    { id: 'ar-03', name: 'HAWK Face at Airport', description: 'Face recognition for any HAWK target at Zagreb Airport Cargo.', triggerType: 'face_match', severity: 'Critical', enabled: true, channels: ['In-App', 'Email', 'Webhook'], cooldown: 0, targetPersonIds: [1, 9, 12, 7], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Camera: 'Zagreb Airport (CAM-14)', Confidence: '≥ 85%' }, firedCount: 3, lastFired: '2026-03-24 07:15', createdAt: '2026-03-01', createdBy: 'Col. Tomić' },
    { id: 'ar-04', name: 'LPR Watchlist — HAWK Vehicles', description: 'Captures watchlisted plates at monitored LPR positions.', triggerType: 'lpr_match', severity: 'Warning', enabled: true, channels: ['In-App'], cooldown: 10, targetPersonIds: [1, 12, 3, 9], targetPersonNames: ['Marko Horvat', 'Ivan Babić', 'Ahmed Al-Rashid', 'Carlos Mendoza'], targetOrgIds: [1], targetOrgNames: ['Alpha Security Group'], operationCode: 'HAWK', config: { Plates: 'ZG-1234-AB, ZG-5678-CD, SA-9012-RH', Readers: 'Vukovarska, Airport, A1' }, firedCount: 31, lastFired: '2026-03-24 09:31', createdAt: '2026-02-20', createdBy: 'Lt. Petrić' },
    { id: 'ar-05', name: 'Target Signal Lost (30min)', description: 'Alerts when any HAWK device goes dark for 30+ minutes.', triggerType: 'signal_lost', severity: 'Warning', enabled: true, channels: ['In-App', 'Email'], cooldown: 60, targetPersonIds: [1, 9, 12, 7], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Timeout: '30 min', Devices: 'GPS-002, GPS-010, GPS-013' }, firedCount: 6, lastFired: '2026-03-24 04:00', createdAt: '2026-03-01', createdBy: 'Sgt. Matić' },
    { id: 'ar-06', name: 'Speed >100 km/h Urban Zone', description: 'Vehicle exceeds 100 km/h in urban monitoring zone.', triggerType: 'speed_alert', severity: 'Warning', enabled: true, channels: ['In-App'], cooldown: 5, targetPersonIds: [1, 12, 9], targetPersonNames: ['Marko Horvat', 'Ivan Babić', 'Carlos Mendoza'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Threshold: '100 km/h', Zone: 'Urban (50 km/h limit)' }, firedCount: 4, lastFired: '2026-03-24 08:44', createdAt: '2026-03-05', createdBy: 'Lt. Petrić' },
    { id: 'ar-07', name: 'Babić Diplomatic Quarter', description: 'Triggers when Babić enters the diplomatic quarter zone.', triggerType: 'zone_entry', severity: 'Warning', enabled: true, channels: ['In-App', 'Email'], cooldown: 30, targetPersonIds: [12], targetPersonNames: ['Ivan Babić'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Zone: 'Diplomatic Quarter', Radius: '300m' }, firedCount: 4, lastFired: '2026-03-23 14:22', createdAt: '2026-03-15', createdBy: 'Cpt. Horvat' },
    { id: 'ar-08', name: 'Hassan Zone Exit — Bravo', description: 'Tracks when Hassan exits the monitored port area zone.', triggerType: 'zone_exit', severity: 'Informational', enabled: true, channels: ['In-App'], cooldown: 30, targetPersonIds: [7], targetPersonNames: ['Omar Hassan'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Zone: 'Monitored Zone Bravo', Direction: 'Any' }, firedCount: 12, lastFired: '2026-03-24 06:15', createdAt: '2026-03-10', createdBy: 'Sgt. Matić' },
    { id: 'ar-09', name: 'Keyword — delivery / shipment', description: 'Flags audio intercepts with operational keywords.', triggerType: 'keyword', severity: 'Warning', enabled: true, channels: ['In-App', 'Email'], cooldown: 0, targetPersonIds: [1, 9, 7], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Omar Hassan'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Keywords: 'delivery, shipment, cargo, port', Languages: 'Croatian, English, Arabic' }, firedCount: 7, lastFired: '2026-03-24 08:22', createdAt: '2026-03-08', createdBy: 'Sgt. Matić' },
    { id: 'ar-10', name: 'Any Target Photo/Video', description: 'Photo or video surveillance captures any HAWK target.', triggerType: 'photo_video', severity: 'Informational', enabled: true, channels: ['In-App'], cooldown: 15, targetPersonIds: [1, 9, 12, 7], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Source: 'Photo + Video', 'Time Filter': '24/7' }, firedCount: 45, lastFired: '2026-03-24 06:48', createdAt: '2026-03-01', createdBy: 'Col. Tomić' },
    { id: 'ar-11', name: 'Restricted Zone Alpha — All', description: 'Critical alert when any person enters the primary restricted perimeter.', triggerType: 'zone_entry', severity: 'Critical', enabled: true, channels: ['In-App', 'SMS', 'Webhook'], cooldown: 0, targetPersonIds: [1, 9, 12, 7, 3], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan', 'Ahmed Al-Rashid'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Zone: 'Restricted Zone Alpha', Radius: '200m', Escalation: 'Commander' }, firedCount: 3, lastFired: '2026-03-24 10:02', createdAt: '2026-02-15', createdBy: 'Col. Tomić' },
    { id: 'ar-13', name: 'GLACIER — Transaction >€50K', description: 'Wire transfers exceeding €50,000 from Rashid/Falcon accounts.', triggerType: 'keyword', severity: 'Critical', enabled: true, channels: ['In-App', 'Email', 'Webhook'], cooldown: 0, targetPersonIds: [3, 7], targetPersonNames: ['Ahmed Al-Rashid', 'Omar Hassan'], targetOrgIds: [2, 5], targetOrgNames: ['Rashid Holdings', 'Falcon Trading'], operationCode: 'GLACIER', config: { Keywords: 'Amount > €50,000', Source: 'FINA Bank Monitor' }, firedCount: 2, lastFired: '2026-03-20 14:30', createdAt: '2026-03-20', createdBy: 'Cpt. Galić' },
    { id: 'ar-18', name: 'PHOENIX — Shanghai Camera', description: 'Motion/face detection at Shanghai Port camera.', triggerType: 'photo_video', severity: 'Informational', enabled: false, channels: ['In-App'], cooldown: 60, targetPersonIds: [10], targetPersonNames: ['Li Wei'], targetOrgIds: [4], targetOrgNames: ['Dragon Tech Solutions'], operationCode: 'PHOENIX', config: { Camera: 'Shanghai Port Cam (CAM-19)', Status: 'Standby' }, firedCount: 0, lastFired: '—', createdAt: '2026-03-12', createdBy: 'Cpt. Perić' },
];

export const mockAlertEvents: AlertEvent[] = [
    { id: 'ae-01', ruleId: 'ar-11', ruleName: 'Restricted Zone Alpha', triggerType: 'zone_entry', severity: 'Critical', title: 'Horvat entered Restricted Zone Alpha — 4 min inside', personName: 'Marko Horvat', location: 'Restricted Zone Alpha, Zagreb', timestamp: '2026-03-24 10:02', timeAgo: '12m', acknowledged: false },
    { id: 'ae-02', ruleId: 'ar-03', ruleName: 'Face at Airport', triggerType: 'face_match', severity: 'Critical', title: 'Face match: Horvat at CAM-07 (94%)', personName: 'Marko Horvat', location: 'Trg bana Jelačića', timestamp: '2026-03-24 09:48', timeAgo: '26m', acknowledged: false },
    { id: 'ae-03', ruleId: 'ar-04', ruleName: 'LPR Watchlist', triggerType: 'lpr_match', severity: 'Warning', title: 'ZG-1847-AB at Vukovarska heading east', personName: 'Marko Horvat', location: 'Vukovarska cesta', timestamp: '2026-03-24 09:31', timeAgo: '43m', acknowledged: true },
    { id: 'ae-04', ruleId: 'ar-02', ruleName: 'Horvat+Mendoza', triggerType: 'colocation', severity: 'Critical', title: 'Horvat & Mendoza at Savska (25m) — 3rd in 48h', personName: 'Marko Horvat', location: 'Savska cesta 41', timestamp: '2026-03-24 09:15', timeAgo: '59m', acknowledged: false },
    { id: 'ae-05', ruleId: 'ar-09', ruleName: 'Keyword', triggerType: 'keyword', severity: 'Warning', title: 'Audio keyword "delivery" ×3', personName: 'Marko Horvat', location: 'MIC-ALPHA', timestamp: '2026-03-24 08:22', timeAgo: '2h', acknowledged: true },
    { id: 'ae-06', ruleId: 'ar-06', ruleName: 'Speed Violation', triggerType: 'speed_alert', severity: 'Warning', title: 'Babić 118 km/h in 50 zone for 3.2 km', personName: 'Ivan Babić', location: 'Ilica 242', timestamp: '2026-03-24 08:44', timeAgo: '1h', acknowledged: true },
    { id: 'ae-07', ruleId: 'ar-01', ruleName: 'Horvat Port', triggerType: 'zone_entry', severity: 'Critical', title: 'Horvat Port Terminal — visit #11', personName: 'Marko Horvat', location: 'Port Terminal', timestamp: '2026-03-24 06:42', timeAgo: '3h', acknowledged: true },
    { id: 'ae-08', ruleId: 'ar-05', ruleName: 'Signal Lost', triggerType: 'signal_lost', severity: 'Warning', title: 'Babić phone signal lost — 30min', personName: 'Ivan Babić', location: 'Dubrava', timestamp: '2026-03-24 04:00', timeAgo: '6h', acknowledged: true },
];

export const allOps = [...new Set(mockRules.map(r => r.operationCode))];
export const allPersons = [...new Set(mockRules.flatMap(r => r.targetPersonNames))].sort();

export const keyboardShortcuts = [
    { key: '1', description: 'Rules tab' },
    { key: '2', description: 'Live Feed tab' },
    { key: '3', description: 'Statistics tab' },
    { key: 'N', description: 'New Alert Rule' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters' },
    { key: 'Esc', description: 'Close detail / modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
