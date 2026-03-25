/**
 * ARGUX — Activity Log Mock Data
 * 40 events across 12 types, filter helpers, keyboard shortcuts
 */

export type EventType = 'phone' | 'gps' | 'camera' | 'lpr' | 'face' | 'audio' | 'video' | 'zone' | 'alert' | 'system' | 'workflow' | 'record';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface ActivityEvent {
    id: string; type: EventType; severity: Severity;
    title: string; description: string;
    personId: number | null; personName: string;
    orgId: number | null; orgName: string;
    deviceId: number | null; deviceName: string;
    operationCode: string;
    lat: number; lng: number; location: string;
    timestamp: string; timeAgo: string;
    source: string;
    metadata: Record<string, string>;
}

export const typeConfig: Record<EventType, { icon: string; label: string; color: string }> = {
    phone: { icon: '📱', label: 'Phone', color: '#06b6d4' },
    gps: { icon: '📡', label: 'GPS', color: '#22c55e' },
    camera: { icon: '📹', label: 'Camera', color: '#8b5cf6' },
    lpr: { icon: '🚗', label: 'LPR', color: '#10b981' },
    face: { icon: '🧑', label: 'Face', color: '#ec4899' },
    audio: { icon: '🎙️', label: 'Audio', color: '#f59e0b' },
    video: { icon: '🎥', label: 'Video', color: '#3b82f6' },
    zone: { icon: '🛡️', label: 'Zone', color: '#f97316' },
    alert: { icon: '🚨', label: 'Alert', color: '#ef4444' },
    system: { icon: '⚙️', label: 'System', color: '#6b7280' },
    workflow: { icon: '⚡', label: 'Workflow', color: '#a855f7' },
    record: { icon: '📝', label: 'Record', color: '#14b8a6' },
};

export const sevConfig: Record<Severity, { color: string; label: string }> = {
    critical: { color: '#ef4444', label: 'Critical' },
    high: { color: '#f97316', label: 'High' },
    medium: { color: '#f59e0b', label: 'Medium' },
    low: { color: '#22c55e', label: 'Low' },
    info: { color: '#6b7280', label: 'Info' },
};

export const mockEvents: ActivityEvent[] = [
    { id: 'ev-01', type: 'zone', severity: 'critical', title: 'Geofence breach — Restricted Zone Alpha', description: 'Subject entered restricted perimeter zone. GPS confirmed position inside exclusion boundary for 4 minutes.', personId: 1, personName: 'Marko Horvat', orgId: 1, orgName: 'Alpha Security Group', deviceId: 2, deviceName: 'Horvat Vehicle Tracker', operationCode: 'HAWK', lat: 45.813, lng: 15.977, location: 'Restricted Zone Alpha, Zagreb', timestamp: '2026-03-24 10:02:15', timeAgo: '12m ago', source: 'Zone Engine', metadata: { Zone: 'Restricted Alpha', Duration: '4m 12s', 'Entry Point': 'North fence' } },
    { id: 'ev-02', type: 'face', severity: 'critical', title: 'Face match — Horvat at Camera 07 (94%)', description: 'Positive facial recognition match from Camera 07 at Trg bana Jelačića. Subject wearing baseball cap.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: 8, deviceName: 'Zagreb Street Cam A1', operationCode: 'HAWK', lat: 45.813, lng: 15.977, location: 'Trg bana Jelačića, Zagreb', timestamp: '2026-03-24 09:48:33', timeAgo: '26m ago', source: 'InsightFace · CAM-07', metadata: { Confidence: '94%', Camera: 'CAM-07', Disguise: 'Baseball cap' } },
    { id: 'ev-03', type: 'lpr', severity: 'high', title: 'LPR capture — ZG-1847-AB at Vukovarska', description: 'Vehicle registered to subject captured at LPR checkpoint. Heading east toward port district.', personId: 1, personName: 'Marko Horvat', orgId: 1, orgName: 'Alpha Security Group', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.802, lng: 15.995, location: 'Vukovarska cesta, Zagreb', timestamp: '2026-03-24 09:31:10', timeAgo: '43m ago', source: 'LPR Reader · Vukovarska', metadata: { Plate: 'ZG-1847-AB', Speed: '52 km/h', Direction: 'East', Vehicle: 'BMW X5 M' } },
    { id: 'ev-04', type: 'alert', severity: 'critical', title: 'Co-location alert — Horvat & Mendoza', description: 'Proximity alert triggered. Both subjects within 25m at Savska cesta for 8 minutes. 3rd event in 48h.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.807, lng: 15.985, location: 'Savska cesta 41, Zagreb', timestamp: '2026-03-24 09:15:22', timeAgo: '59m ago', source: 'Correlation Engine', metadata: { 'Subject B': 'Carlos Mendoza', Distance: '25m', Duration: '8 min', Occurrence: '3rd in 48h' } },
    { id: 'ev-05', type: 'phone', severity: 'high', title: 'Phone signal restored — Mendoza', description: 'Mobile locator signal restored after 6-hour blackout. Previous position: unknown.', personId: 9, personName: 'Carlos Mendoza', orgId: 6, orgName: 'Mendoza Import-Export SA', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.820, lng: 15.960, location: 'Maksimirska 128, Zagreb', timestamp: '2026-03-24 09:02:40', timeAgo: '1h ago', source: 'Mobile Locator', metadata: { 'Dark Period': '6h (03:00–09:00)', Signal: '72%', Battery: '45%' } },
    { id: 'ev-06', type: 'gps', severity: 'medium', title: 'GPS speed anomaly — 118 km/h in urban zone', description: 'Vehicle GPS recorded sustained speed of 118 km/h in 50 km/h zone for 3.2 km.', personId: 12, personName: 'Ivan Babić', orgId: 1, orgName: 'Alpha Security Group', deviceId: 10, deviceName: 'Babić Vehicle GPS', operationCode: 'HAWK', lat: 45.816, lng: 15.950, location: 'Ilica 242, Zagreb', timestamp: '2026-03-24 08:44:11', timeAgo: '1h ago', source: 'GPS Tracker · GPS-010', metadata: { Speed: '118 km/h', 'Zone Limit': '50 km/h', Distance: '3.2 km' } },
    { id: 'ev-07', type: 'audio', severity: 'high', title: 'Audio keyword detected — "delivery" ×3', description: 'Faster-Whisper transcription flagged keyword "delivery" mentioned 3 times in 4-minute conversation.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: 9, deviceName: 'Al-Rashid Residence Mic', operationCode: 'HAWK', lat: 45.813, lng: 15.977, location: 'MIC-ALPHA position, Zagreb', timestamp: '2026-03-24 08:22:05', timeAgo: '2h ago', source: 'Faster-Whisper · MIC-ALPHA', metadata: { Keyword: 'delivery', Mentions: '3', Language: 'Croatian', Duration: '4m 12s' } },
    { id: 'ev-08', type: 'camera', severity: 'medium', title: 'Surveillance camera — subject loitering', description: 'Camera 12 recorded subject standing outside building entrance for 22 minutes without entering.', personId: 12, personName: 'Ivan Babić', orgId: null, orgName: '', deviceId: 8, deviceName: 'Zagreb Street Cam A1', operationCode: 'HAWK', lat: 45.809, lng: 15.972, location: 'Heinzelova 62, Zagreb', timestamp: '2026-03-24 07:55:30', timeAgo: '2h ago', source: 'Camera 12 · AI Detection', metadata: { Duration: '22 min', Behavior: 'Loitering', 'AI Flag': 'Counter-surveillance' } },
    { id: 'ev-09', type: 'workflow', severity: 'info', title: 'Workflow — Nightly Activity Sweep', description: 'Scheduled workflow generated morning briefing #24. 4 overnight events detected.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 06:00:00', timeAgo: '4h ago', source: 'Workflow Engine', metadata: { Workflow: 'Nightly Activity Sweep', Report: 'Briefing #24', Events: '4' } },
    { id: 'ev-10', type: 'phone', severity: 'critical', title: 'SIM swap detected — Mendoza new IMSI', description: 'Subject phone registered new IMSI. Previous SIM deactivated. Prepaid from Glavni Kolodvor kiosk.', personId: 9, personName: 'Carlos Mendoza', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.807, lng: 15.978, location: 'Glavni Kolodvor, Zagreb', timestamp: '2026-03-24 02:45:18', timeAgo: '7h ago', source: 'IMSI Catcher', metadata: { 'Old IMSI': '21910***4821', 'New IMSI': '21901***7733', Type: 'Prepaid' } },
    { id: 'ev-11', type: 'zone', severity: 'high', title: 'Zone exit — Hassan leaves Monitored Bravo', description: 'Subject exited monitored perimeter zone. Heading NW on foot.', personId: 7, personName: 'Omar Hassan', orgId: 5, orgName: 'Falcon Trading LLC', deviceId: 13, deviceName: 'Hassan Personal Tracker', operationCode: 'HAWK', lat: 45.818, lng: 15.992, location: 'Monitored Zone Bravo, Port Area', timestamp: '2026-03-24 06:15:44', timeAgo: '4h ago', source: 'Zone Engine', metadata: { Zone: 'Monitored Bravo', 'Time Inside': '38 min', Direction: 'Northwest' } },
    { id: 'ev-12', type: 'face', severity: 'high', title: 'Face match — Babić at Maksimir (87%)', description: 'InsightFace detected Ivan Babić at Maksimir park entrance camera. No disguise. Alone.', personId: 12, personName: 'Ivan Babić', orgId: 1, orgName: 'Alpha Security Group', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.820, lng: 15.960, location: 'Maksimir Park, Zagreb', timestamp: '2026-03-24 08:12:50', timeAgo: '2h ago', source: 'InsightFace · Maksimir Cam', metadata: { Confidence: '87%', Disguise: 'None', Companions: 'Alone' } },
    { id: 'ev-13', type: 'lpr', severity: 'medium', title: 'LPR — SA-9012-RH at airport cargo', description: 'Diplomatic vehicle captured entering airport cargo terminal parking area.', personId: 3, personName: 'Ahmed Al-Rashid', orgId: 2, orgName: 'Rashid Holdings International', deviceId: 14, deviceName: 'Zagreb Airport Cargo', operationCode: 'GLACIER', lat: 45.743, lng: 16.069, location: 'Airport Cargo Terminal, Zagreb', timestamp: '2026-03-24 07:30:22', timeAgo: '3h ago', source: 'LPR Reader · Airport', metadata: { Plate: 'SA-9012-RH', Vehicle: 'Rolls-Royce Ghost', Notes: 'Diplomatic plates' } },
    { id: 'ev-14', type: 'gps', severity: 'info', title: 'GPS battery low — Hassan (12%)', description: 'GPS-013 battery dropped below 15%. Attached to motorcycle. Signal degrading.', personId: 7, personName: 'Omar Hassan', orgId: null, orgName: '', deviceId: 13, deviceName: 'Hassan Personal Tracker', operationCode: 'HAWK', lat: 45.809, lng: 15.972, location: 'Trešnjevka, Zagreb', timestamp: '2026-03-24 05:30:15', timeAgo: '5h ago', source: 'GPS-013', metadata: { Battery: '12%', Device: 'GPS-013', 'Attached To': 'Motorcycle' } },
    { id: 'ev-15', type: 'video', severity: 'info', title: 'Video uploaded — parking garage', description: 'Surveillance video from parking garage indexed. 45-minute recording.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.814, lng: 15.978, location: 'Parking Garage B2, Vlaška', timestamp: '2026-03-24 06:48:00', timeAgo: '3h ago', source: 'MinIO Storage', metadata: { Duration: '45 min', Location: 'Garage Level B2' } },
    { id: 'ev-16', type: 'alert', severity: 'high', title: 'Signal lost — Babić phone 30min', description: 'Mobile phone locator lost signal. Last position: Dubrava residential area.', personId: 12, personName: 'Ivan Babić', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.820, lng: 15.960, location: 'Dubrava, Zagreb', timestamp: '2026-03-24 04:00:33', timeAgo: '6h ago', source: 'Mobile Locator · Timeout', metadata: { Timeout: '30 min', 'Last Signal': '88%' } },
    { id: 'ev-17', type: 'workflow', severity: 'high', title: 'Workflow — Co-location Evidence', description: 'Automated evidence capture: Horvat + Mendoza co-location #3. GPS trails + camera stills.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 09:15:25', timeAgo: '59m ago', source: 'Workflow Engine', metadata: { 'Evidence ID': 'EVD-042', Status: 'Completed' } },
    { id: 'ev-18', type: 'system', severity: 'info', title: 'Data sync — INTERPOL I-24/7', description: 'Scheduled sync completed. 3 new Red Notices, 0 matching HAWK subjects.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: '', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 04:00:00', timeAgo: '6h ago', source: 'Data Source Sync', metadata: { Source: 'INTERPOL I-24/7', Records: '3 new', Matches: '0' } },
    { id: 'ev-19', type: 'system', severity: 'info', title: 'AI inference — Anomaly detection', description: 'Ollama LLaMA 3.1 completed overnight anomaly detection. 2 new anomalies flagged.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 05:00:00', timeAgo: '5h ago', source: 'Ollama · LLaMA 3.1', metadata: { Model: 'LLaMA 3.1 70B', Anomalies: '2', Duration: '47s' } },
    { id: 'ev-20', type: 'record', severity: 'info', title: 'Evidence #43 — Port terminal photos', description: 'New evidence record: port terminal surveillance photos. Assigned to Horvat and Mendoza.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 08:30:00', timeAgo: '2h ago', source: 'Records Module', metadata: { Type: 'Photo', Title: 'Port Terminal Photos' } },
];

export const allPersons = [...new Set(mockEvents.filter(e => e.personName).map(e => ({ id: e.personId!, name: e.personName })))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number; name: string }[]);
export const allOrgs = [...new Set(mockEvents.filter(e => e.orgName).map(e => ({ id: e.orgId!, name: e.orgName })))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number; name: string }[]);
export const allOps = [...new Set(mockEvents.map(e => e.operationCode).filter(Boolean))];

export const keyboardShortcuts = [
    { key: 'F', description: 'Focus search' },
    { key: 'C', description: 'Toggle Critical only' },
    { key: 'R', description: 'Reset all filters' },
    { key: 'Esc', description: 'Close expanded / modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
