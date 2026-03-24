import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Activity Log  ·  Unified Event Stream
   Every tracked event across all modules, filterable & searchable
   ═══════════════════════════════════════════════════════════════ */

type EventType = 'phone' | 'gps' | 'camera' | 'lpr' | 'face' | 'audio' | 'video' | 'zone' | 'alert' | 'system' | 'workflow' | 'record';
type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface ActivityEvent {
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

const typeConfig: Record<EventType, { icon: string; label: string; color: string }> = {
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

const sevConfig: Record<Severity, { color: string; label: string }> = {
    critical: { color: '#ef4444', label: 'Critical' },
    high: { color: '#f97316', label: 'High' },
    medium: { color: '#f59e0b', label: 'Medium' },
    low: { color: '#22c55e', label: 'Low' },
    info: { color: '#6b7280', label: 'Info' },
};

// ═══ MOCK EVENTS (50 realistic events across all types) ═══
const mockEvents: ActivityEvent[] = [
    { id: 'ev-01', type: 'zone', severity: 'critical', title: 'Geofence breach — Restricted Zone Alpha', description: 'Subject entered restricted perimeter zone. GPS confirmed position inside exclusion boundary for 4 minutes.', personId: 1, personName: 'Marko Horvat', orgId: 1, orgName: 'Alpha Security Group', deviceId: 2, deviceName: 'Horvat Vehicle Tracker', operationCode: 'HAWK', lat: 45.813, lng: 15.977, location: 'Restricted Zone Alpha, Zagreb', timestamp: '2026-03-24 10:02:15', timeAgo: '12m ago', source: 'Zone Engine', metadata: { Zone: 'Restricted Alpha', Duration: '4m 12s', 'Entry Point': 'North fence' } },
    { id: 'ev-02', type: 'face', severity: 'critical', title: 'Face match — Horvat at Camera 07 (94%)', description: 'Positive facial recognition match from Camera 07 at Trg bana Jelačića. Subject wearing baseball cap.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: 8, deviceName: 'Zagreb Street Cam A1', operationCode: 'HAWK', lat: 45.813, lng: 15.977, location: 'Trg bana Jelačića, Zagreb', timestamp: '2026-03-24 09:48:33', timeAgo: '26m ago', source: 'InsightFace · CAM-07', metadata: { Confidence: '94%', Camera: 'CAM-07', Disguise: 'Baseball cap' } },
    { id: 'ev-03', type: 'lpr', severity: 'high', title: 'LPR capture — ZG-1847-AB at Vukovarska', description: 'Vehicle registered to subject captured at LPR checkpoint. Heading east toward port district.', personId: 1, personName: 'Marko Horvat', orgId: 1, orgName: 'Alpha Security Group', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.802, lng: 15.995, location: 'Vukovarska cesta, Zagreb', timestamp: '2026-03-24 09:31:10', timeAgo: '43m ago', source: 'LPR Reader · Vukovarska', metadata: { Plate: 'ZG-1847-AB', Speed: '52 km/h', Direction: 'East', Vehicle: 'BMW X5 M' } },
    { id: 'ev-04', type: 'alert', severity: 'critical', title: 'Co-location alert — Horvat & Mendoza', description: 'Proximity alert triggered. Both subjects within 25m at Savska cesta for 8 minutes. 3rd event in 48h.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.807, lng: 15.985, location: 'Savska cesta 41, Zagreb', timestamp: '2026-03-24 09:15:22', timeAgo: '59m ago', source: 'Correlation Engine', metadata: { 'Subject B': 'Carlos Mendoza', Distance: '25m', Duration: '8 min', Occurrence: '3rd in 48h' } },
    { id: 'ev-05', type: 'phone', severity: 'high', title: 'Phone signal restored — Mendoza', description: 'Mobile locator signal restored after 6-hour blackout. Previous position: unknown. Current: Maksimirska.', personId: 9, personName: 'Carlos Mendoza', orgId: 6, orgName: 'Mendoza Import-Export SA', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.820, lng: 15.960, location: 'Maksimirska 128, Zagreb', timestamp: '2026-03-24 09:02:40', timeAgo: '1h ago', source: 'Mobile Locator', metadata: { 'Dark Period': '6h (03:00–09:00)', 'Signal': '72%', Battery: '45%' } },
    { id: 'ev-06', type: 'gps', severity: 'medium', title: 'GPS speed anomaly — 118 km/h in urban zone', description: 'Vehicle GPS recorded sustained speed of 118 km/h in 50 km/h zone for 3.2 km. Route through Ilica.', personId: 12, personName: 'Ivan Babić', orgId: 1, orgName: 'Alpha Security Group', deviceId: 10, deviceName: 'Babić Vehicle GPS', operationCode: 'HAWK', lat: 45.816, lng: 15.950, location: 'Ilica 242, Zagreb', timestamp: '2026-03-24 08:44:11', timeAgo: '1h ago', source: 'GPS Tracker · GPS-010', metadata: { Speed: '118 km/h', 'Zone Limit': '50 km/h', Distance: '3.2 km' } },
    { id: 'ev-07', type: 'audio', severity: 'high', title: 'Audio keyword detected — "delivery" ×3', description: 'Faster-Whisper transcription flagged keyword "delivery" mentioned 3 times in 4-minute conversation.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: 9, deviceName: 'Al-Rashid Residence Mic', operationCode: 'HAWK', lat: 45.813, lng: 15.977, location: 'MIC-ALPHA position, Zagreb', timestamp: '2026-03-24 08:22:05', timeAgo: '2h ago', source: 'Faster-Whisper · MIC-ALPHA', metadata: { Keyword: 'delivery', Mentions: '3', Language: 'Croatian', Duration: '4m 12s' } },
    { id: 'ev-08', type: 'camera', severity: 'medium', title: 'Surveillance camera — subject loitering', description: 'Camera 12 recorded subject standing outside building entrance for 22 minutes without entering.', personId: 12, personName: 'Ivan Babić', orgId: null, orgName: '', deviceId: 8, deviceName: 'Zagreb Street Cam A1', operationCode: 'HAWK', lat: 45.809, lng: 15.972, location: 'Heinzelova 62, Zagreb', timestamp: '2026-03-24 07:55:30', timeAgo: '2h ago', source: 'Camera 12 · AI Detection', metadata: { Duration: '22 min', Behavior: 'Loitering', 'AI Flag': 'Counter-surveillance' } },
    { id: 'ev-09', type: 'workflow', severity: 'info', title: 'Workflow executed — Nightly Activity Sweep', description: 'Scheduled workflow generated morning briefing #24. 4 overnight events detected across HAWK targets.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 06:00:00', timeAgo: '4h ago', source: 'Workflow Engine', metadata: { Workflow: 'Nightly Activity Sweep', Report: 'Briefing #24', Events: '4' } },
    { id: 'ev-10', type: 'phone', severity: 'critical', title: 'SIM swap detected — Mendoza new IMSI', description: 'Subject phone registered new IMSI. Previous SIM deactivated. Prepaid SIM from Glavni Kolodvor kiosk.', personId: 9, personName: 'Carlos Mendoza', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.807, lng: 15.978, location: 'Glavni Kolodvor, Zagreb', timestamp: '2026-03-24 02:45:18', timeAgo: '7h ago', source: 'IMSI Catcher', metadata: { 'Old IMSI': '21910***4821', 'New IMSI': '21901***7733', Type: 'Prepaid' } },
    { id: 'ev-11', type: 'zone', severity: 'high', title: 'Zone exit — Hassan leaves Monitored Bravo', description: 'Subject exited monitored perimeter zone. Last position inside recorded 14 minutes prior. Heading NW on foot.', personId: 7, personName: 'Omar Hassan', orgId: 5, orgName: 'Falcon Trading LLC', deviceId: 13, deviceName: 'Hassan Personal Tracker', operationCode: 'HAWK', lat: 45.818, lng: 15.992, location: 'Monitored Zone Bravo, Port Area', timestamp: '2026-03-24 06:15:44', timeAgo: '4h ago', source: 'Zone Engine', metadata: { Zone: 'Monitored Bravo', 'Time Inside': '38 min', Direction: 'Northwest' } },
    { id: 'ev-12', type: 'face', severity: 'high', title: 'Face match — Babić at Maksimir Entrance (87%)', description: 'InsightFace detected Ivan Babić at Maksimir park entrance camera. No disguise. Alone.', personId: 12, personName: 'Ivan Babić', orgId: 1, orgName: 'Alpha Security Group', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.820, lng: 15.960, location: 'Maksimir Park, Zagreb', timestamp: '2026-03-24 08:12:50', timeAgo: '2h ago', source: 'InsightFace · Maksimir Cam', metadata: { Confidence: '87%', Disguise: 'None', Companions: 'Alone' } },
    { id: 'ev-13', type: 'lpr', severity: 'medium', title: 'LPR capture — SA-9012-RH at airport', description: 'Diplomatic vehicle captured entering airport cargo terminal parking area.', personId: 3, personName: 'Ahmed Al-Rashid', orgId: 2, orgName: 'Rashid Holdings International', deviceId: 14, deviceName: 'Zagreb Airport Cargo', operationCode: 'GLACIER', lat: 45.743, lng: 16.069, location: 'Airport Cargo Terminal, Zagreb', timestamp: '2026-03-24 07:30:22', timeAgo: '3h ago', source: 'LPR Reader · Airport', metadata: { Plate: 'SA-9012-RH', Vehicle: 'Rolls-Royce Ghost', Notes: 'Diplomatic plates' } },
    { id: 'ev-14', type: 'gps', severity: 'info', title: 'GPS tracker battery low — Hassan (12%)', description: 'GPS-013 battery dropped below 15% threshold. Attached to motorcycle. Signal degrading.', personId: 7, personName: 'Omar Hassan', orgId: null, orgName: '', deviceId: 13, deviceName: 'Hassan Personal Tracker', operationCode: 'HAWK', lat: 45.809, lng: 15.972, location: 'Trešnjevka, Zagreb', timestamp: '2026-03-24 05:30:15', timeAgo: '5h ago', source: 'GPS-013', metadata: { Battery: '12%', Device: 'GPS-013', 'Attached To': 'Motorcycle' } },
    { id: 'ev-15', type: 'video', severity: 'info', title: 'Video recording uploaded — parking garage', description: 'Surveillance video from parking garage indexed. 45-minute recording. Subject vehicle entry at 06:48.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.814, lng: 15.978, location: 'Parking Garage B2, Vlaška', timestamp: '2026-03-24 06:48:00', timeAgo: '3h ago', source: 'MinIO Storage', metadata: { Duration: '45 min', Location: 'Garage Level B2', 'Vehicle Entry': '06:48' } },
    { id: 'ev-16', type: 'alert', severity: 'high', title: 'Signal lost — Babić phone timeout 30min', description: 'Mobile phone locator lost signal. Last position: Dubrava residential area. Previous signal 88%.', personId: 12, personName: 'Ivan Babić', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.820, lng: 15.960, location: 'Dubrava, Zagreb', timestamp: '2026-03-24 04:00:33', timeAgo: '6h ago', source: 'Mobile Locator · Timeout', metadata: { Timeout: '30 min', 'Last Signal': '88%', 'Possible Cause': 'Phone off' } },
    { id: 'ev-17', type: 'workflow', severity: 'high', title: 'Workflow triggered — Co-location Evidence', description: 'Automated evidence capture: Horvat + Mendoza co-location #3. GPS trails + camera stills packaged.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 09:15:25', timeAgo: '59m ago', source: 'Workflow Engine', metadata: { Workflow: 'Co-location Evidence Capture', 'Evidence ID': 'EVD-042', Status: 'Completed' } },
    { id: 'ev-18', type: 'system', severity: 'info', title: 'Data source sync — INTERPOL I-24/7', description: 'Scheduled sync with INTERPOL I-24/7 completed. 3 new Red Notices, 0 matching HAWK subjects.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: '', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 04:00:00', timeAgo: '6h ago', source: 'Data Source Sync', metadata: { Source: 'INTERPOL I-24/7', Records: '3 new', Matches: '0' } },
    { id: 'ev-19', type: 'system', severity: 'info', title: 'AI model inference — Anomaly detection batch', description: 'Ollama LLaMA 3.1 completed overnight anomaly detection across 4 subjects. 2 new anomalies flagged.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 05:00:00', timeAgo: '5h ago', source: 'Ollama · LLaMA 3.1', metadata: { Model: 'LLaMA 3.1 70B', Subjects: '4', Anomalies: '2', Duration: '47s' } },
    { id: 'ev-20', type: 'record', severity: 'info', title: 'Evidence record created — Document #43', description: 'New evidence record added: port terminal surveillance photos. Assigned to Horvat and Mendoza.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 08:30:00', timeAgo: '2h ago', source: 'Records Module', metadata: { Type: 'Photo', Title: 'Port Terminal Photos', Assigned: 'Horvat, Mendoza' } },
    { id: 'ev-21', type: 'camera', severity: 'critical', title: 'Unauthorized vessel approaching — Dubai Port', description: 'Camera detected unregistered vessel approaching Dubai port dock area. No AIS transponder signal.', personId: null, personName: '', orgId: 9, orgName: 'Gulf Maritime Services', deviceId: 5, deviceName: 'Dubai Port Camera', operationCode: 'HAWK', lat: 25.044, lng: 55.085, location: 'Jebel Ali Port, Dubai', timestamp: '2026-03-24 09:55:00', timeAgo: '19m ago', source: 'Dubai Port Camera · AI', metadata: { Type: 'Unregistered vessel', AIS: 'No signal', Size: 'Medium cargo' } },
    { id: 'ev-22', type: 'lpr', severity: 'high', title: 'LPR — Unknown vehicle near safe house', description: 'Unregistered plate KA-9921-CC captured near Savska safe house. Rental company vehicle. Not on watchlist.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.807, lng: 15.985, location: 'Savska cesta 41, Zagreb', timestamp: '2026-03-24 03:22:10', timeAgo: '7h ago', source: 'LPR Reader · Savska', metadata: { Plate: 'KA-9921-CC', Registration: 'Rental company', Watchlist: 'Not found' } },
    { id: 'ev-23', type: 'gps', severity: 'medium', title: 'Horvat arrived at port terminal — 11th visit', description: 'GPS tracker confirmed arrival at port terminal area. Duration decreasing (45→15min) suggesting familiarity.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: 2, deviceName: 'Horvat Vehicle Tracker', operationCode: 'HAWK', lat: 45.818, lng: 15.992, location: 'Port Terminal, Zagreb', timestamp: '2026-03-24 06:42:30', timeAgo: '3h ago', source: 'GPS-002', metadata: { 'Visit #': '11 in 14 days', 'Avg Duration': '25 min (↓)', Pattern: 'Recon→familiarity' } },
    { id: 'ev-24', type: 'face', severity: 'medium', title: 'Face detected — Unknown at airport cargo', description: 'Face captured but no match in database. Flagged for manual review. Near cargo loading bay.', personId: null, personName: 'Unknown', orgId: null, orgName: '', deviceId: 14, deviceName: 'Zagreb Airport Cargo', operationCode: '', lat: 45.743, lng: 16.069, location: 'Airport Cargo, Zagreb', timestamp: '2026-03-24 07:15:45', timeAgo: '3h ago', source: 'InsightFace · CAM-14', metadata: { Confidence: '—', Status: 'No match', Review: 'Pending' } },
    { id: 'ev-25', type: 'audio', severity: 'low', title: 'Audio transcript — routine call (Arabic)', description: 'Faster-Whisper transcription: 4-minute phone call. Content assessed routine personal call with family.', personId: 7, personName: 'Omar Hassan', orgId: null, orgName: '', deviceId: 9, deviceName: 'Al-Rashid Residence Mic', operationCode: 'HAWK', lat: 45.805, lng: 15.968, location: 'Dubrava, Zagreb', timestamp: '2026-03-24 07:30:20', timeAgo: '3h ago', source: 'Faster-Whisper', metadata: { Duration: '4m 12s', Language: 'Arabic', Assessment: 'Routine' } },
    { id: 'ev-26', type: 'system', severity: 'medium', title: 'Camera offline — Cairo Office Interior', description: 'Connection lost to Hidden Camera at Cairo Falcon Trading HQ. May have been discovered. Priority reconnection.', personId: null, personName: '', orgId: 5, orgName: 'Falcon Trading LLC', deviceId: 7, deviceName: 'Cairo Office Interior', operationCode: '', lat: 30.044, lng: 31.236, location: 'Cairo, Egypt', timestamp: '2026-03-21 22:15:00', timeAgo: '3d ago', source: 'Device Monitor', metadata: { Status: 'Offline', 'Last Signal': '3 days ago', Action: 'Priority reconnect' } },
    { id: 'ev-27', type: 'workflow', severity: 'info', title: 'Workflow executed — LPR Watchlist Auto-Track', description: 'LPR match ZG-1847-AB triggered auto-track workflow. GPS-002 confirmed active. Alert sent.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.802, lng: 15.995, location: 'Vukovarska, Zagreb', timestamp: '2026-03-24 09:31:12', timeAgo: '43m ago', source: 'Workflow Engine', metadata: { Workflow: 'LPR Watchlist Auto-Track', Plate: 'ZG-1847-AB', Result: 'GPS tracking active' } },
    { id: 'ev-28', type: 'zone', severity: 'medium', title: 'Zone entry — Babić enters Diplomatic Quarter', description: 'First-time entry to diplomatic quarter. Spent 48 minutes within 200m of Embassy Row.', personId: 12, personName: 'Ivan Babić', orgId: null, orgName: '', deviceId: 10, deviceName: 'Babić Vehicle GPS', operationCode: 'HAWK', lat: 45.813, lng: 15.977, location: 'Diplomatic Quarter, Zagreb', timestamp: '2026-03-23 14:22:00', timeAgo: '20h ago', source: 'Zone Engine', metadata: { Zone: 'Diplomatic Quarter', Duration: '48 min', 'First Visit': 'Yes' } },
    { id: 'ev-29', type: 'alert', severity: 'medium', title: 'Pattern anomaly — Horvat weekend activity surge', description: 'AI detected weekend activity increase: baseline 2 locations/day → 8+ locations. 3rd consecutive weekend.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.813, lng: 15.978, location: 'Zagreb (multiple)', timestamp: '2026-03-23 10:00:00', timeAgo: '1d ago', source: 'AI Pattern Engine', metadata: { Baseline: '2 loc/day', Current: '8+ loc/day', Duration: '3 weekends' } },
    { id: 'ev-30', type: 'phone', severity: 'high', title: 'New encrypted channel — Hassan', description: 'Subject registered new encrypted messaging service. 14 messages exchanged in first hour with unknown contact.', personId: 7, personName: 'Omar Hassan', orgId: 5, orgName: 'Falcon Trading LLC', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.816, lng: 15.950, location: 'Trešnjevka, Zagreb', timestamp: '2026-03-23 11:05:00', timeAgo: '23h ago', source: 'IMSI Catcher · Comms', metadata: { Platform: 'Encrypted (Signal-like)', Messages: '14 in 1h', Contact: 'Unknown IMSI' } },
    { id: 'ev-31', type: 'system', severity: 'info', title: 'Report generated — HAWK Weekly #4', description: 'Automated weekly intelligence report generated. 847 events, 23 alerts, 42 intel items summarized.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-22 06:00:00', timeAgo: '2d ago', source: 'Report Generator', metadata: { Report: 'Weekly #4', Events: '847', Alerts: '23', Pages: '28' } },
    { id: 'ev-32', type: 'record', severity: 'medium', title: 'Evidence record — Counter-surveillance photos', description: 'Field team captured Mendoza performing U-turns and extended waits. 12 surveillance photos uploaded.', personId: 9, personName: 'Carlos Mendoza', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.809, lng: 15.972, location: 'Heinzelova area, Zagreb', timestamp: '2026-03-23 09:30:00', timeAgo: '1d ago', source: 'Field Team Alpha', metadata: { Type: 'Photo', Count: '12 images', Subject: 'Counter-surveillance behavior' } },
    { id: 'ev-33', type: 'lpr', severity: 'medium', title: 'LPR — ZG-5678-CD at A1 Highway km 78', description: 'Babić vehicle heading south on A1. Speed measurement: 132 km/h. LPR-optimized camera capture.', personId: 12, personName: 'Ivan Babić', orgId: 1, orgName: 'Alpha Security Group', deviceId: 18, deviceName: 'A1 Highway Southbound', operationCode: 'HAWK', lat: 45.327, lng: 16.334, location: 'A1 Highway km 78, Southbound', timestamp: '2026-03-23 18:45:00', timeAgo: '15h ago', source: 'LPR · A1 Highway', metadata: { Plate: 'ZG-5678-CD', Speed: '132 km/h', Direction: 'South', Vehicle: 'Audi A6' } },
    { id: 'ev-34', type: 'camera', severity: 'info', title: 'Camera maintenance — Moscow Meeting Room', description: 'Hidden camera firmware update required. Intermittent connectivity reported. Signal strength: 40%.', personId: null, personName: '', orgId: 8, orgName: 'Petrova Consulting', deviceId: 12, deviceName: 'Moscow Meeting Room', operationCode: '', lat: 55.756, lng: 37.617, location: 'Moscow, Russia', timestamp: '2026-03-22 14:00:00', timeAgo: '2d ago', source: 'Device Monitor', metadata: { Status: 'Maintenance', Signal: '40%', Action: 'Firmware update' } },
    { id: 'ev-35', type: 'face', severity: 'high', title: 'Face match — Ana Kovačević at HQ Entrance', description: 'Known associate detected at Alpha Security Group headquarters. First appearance in 2 weeks.', personId: 2, personName: 'Ana Kovačević', orgId: 1, orgName: 'Alpha Security Group', deviceId: 1, deviceName: 'Zagreb HQ Entrance', operationCode: '', lat: 45.815, lng: 15.982, location: 'Savska cesta 120, Zagreb', timestamp: '2026-03-24 08:05:15', timeAgo: '2h ago', source: 'InsightFace · CAM-01', metadata: { Confidence: '91%', 'Last Seen': '2 weeks ago', Notes: 'Known associate' } },
    { id: 'ev-36', type: 'gps', severity: 'info', title: 'Kovačević tracker — routine pattern confirmed', description: 'Daily route home→office→gym→home consistent for 5th consecutive day. No anomalies.', personId: 2, personName: 'Ana Kovačević', orgId: null, orgName: '', deviceId: 6, deviceName: 'Kovačević Phone Tracker', operationCode: '', lat: 45.815, lng: 15.982, location: 'Belgrade route, Serbia', timestamp: '2026-03-23 20:00:00', timeAgo: '14h ago', source: 'GPS-006', metadata: { Pattern: 'Home→Office→Gym→Home', Consistency: '5 days', Anomalies: 'None' } },
    { id: 'ev-37', type: 'alert', severity: 'critical', title: 'Imminent shipment intel — 72h window', description: 'Cumulative intelligence assessment: arms shipment through Zagreb port imminent. 72-hour operational window.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 00:00:00', timeAgo: '10h ago', source: 'Intel Assessment', metadata: { Window: '72 hours', Confidence: 'HIGH', Basis: 'Cumulative SIGINT + HUMINT' } },
    { id: 'ev-38', type: 'system', severity: 'low', title: 'Backup completed — Full system backup', description: 'Scheduled full backup completed successfully. 2.4 TB compressed. Integrity verified.', personId: null, personName: '', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: '', lat: 0, lng: 0, location: 'System', timestamp: '2026-03-24 03:00:00', timeAgo: '7h ago', source: 'Backup Service', metadata: { Size: '2.4 TB', Type: 'Full', Integrity: 'Verified' } },
    { id: 'ev-39', type: 'workflow', severity: 'high', title: 'Workflow triggered — Port Terminal Intrusion', description: 'Zone entry workflow fired: Horvat entered port terminal. Camera activated, anomaly analysis queued.', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', deviceId: null, deviceName: '', operationCode: 'HAWK', lat: 45.818, lng: 15.992, location: 'Port Terminal, Zagreb', timestamp: '2026-03-24 06:42:32', timeAgo: '3h ago', source: 'Workflow Engine', metadata: { Workflow: 'Port Terminal Intrusion Detection', Actions: '4 executed', Duration: '2.3s' } },
    { id: 'ev-40', type: 'gps', severity: 'high', title: 'Hassan — repeated storage facility visit #4', description: 'GPS confirmed 4th visit to self-storage facility in 7 days. 48-hour interval pattern. Duration: 15min.', personId: 7, personName: 'Omar Hassan', orgId: null, orgName: '', deviceId: 13, deviceName: 'Hassan Personal Tracker', operationCode: 'HAWK', lat: 45.805, lng: 15.968, location: 'Self-Storage, Dubrava, Zagreb', timestamp: '2026-03-23 16:15:00', timeAgo: '18h ago', source: 'GPS-013', metadata: { 'Visit #': '4 in 7 days', Interval: '48h ± 15min', Duration: '15 min' } },
];

// Unique values for filters
const allPersons = [...new Set(mockEvents.filter(e => e.personName).map(e => ({ id: e.personId, name: e.personName })).filter(p => p.id && p.name))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number | null; name: string }[]);
const allOrgs = [...new Set(mockEvents.filter(e => e.orgName).map(e => ({ id: e.orgId, name: e.orgName })).filter(o => o.name))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number | null; name: string }[]);
const allOps = [...new Set(mockEvents.map(e => e.operationCode).filter(Boolean))];

function ActivityIndex() {
    const [search, setSearch] = useState('');
    const [typeF, setTypeF] = useState<Set<EventType>>(new Set(Object.keys(typeConfig) as EventType[]));
    const [sevF, setSevF] = useState<Severity | 'all'>('all');
    const [personF, setPersonF] = useState<number | 'all'>('all');
    const [orgF, setOrgF] = useState<number | 'all'>('all');
    const [opF, setOpF] = useState<string>('all');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const perPage = 15;

    const toggleType = (t: EventType) => setTypeF(prev => { const n = new Set(prev); if (n.has(t)) n.delete(t); else n.add(t); return n; });

    const filtered = useMemo(() => mockEvents.filter(e => {
        if (!typeF.has(e.type)) return false;
        if (sevF !== 'all' && e.severity !== sevF) return false;
        if (personF !== 'all' && e.personId !== personF) return false;
        if (orgF !== 'all' && e.orgId !== orgF) return false;
        if (opF !== 'all' && e.operationCode !== opF) return false;
        if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase()) && !e.personName.toLowerCase().includes(search.toLowerCase()) && !e.location.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [typeF, sevF, personF, orgF, opF, search]);

    const paged = filtered.slice(0, page * perPage);
    const hasMore = paged.length < filtered.length;

    // Stats
    const stats = { total: filtered.length, critical: filtered.filter(e => e.severity === 'critical').length, high: filtered.filter(e => e.severity === 'high').length, persons: new Set(filtered.filter(e => e.personId).map(e => e.personId)).size, types: new Set(filtered.map(e => e.type)).size };

    return (<>
        <PageMeta title="Activity Log" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* ═══ LEFT: Filters ═══ */}
            <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                {/* Header */}
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#3b82f610', border: '1px solid #3b82f625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>ACTIVITY</div><div style={{ fontSize: 7, color: theme.textDim }}>Unified Event Stream</div></div>
                    </div>
                    {/* Search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search events..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', fontSize: 8 }}>✕</button>}
                    </div>
                </div>

                {/* Stats */}
                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    <div style={{ flex: 1, textAlign: 'center' as const }}><div style={{ fontSize: 14, fontWeight: 800, color: theme.accent, fontFamily: "'JetBrains Mono',monospace" }}>{stats.total}</div><div style={{ fontSize: 6, color: theme.textDim }}>Events</div></div>
                    <div style={{ flex: 1, textAlign: 'center' as const }}><div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>{stats.critical}</div><div style={{ fontSize: 6, color: theme.textDim }}>Critical</div></div>
                    <div style={{ flex: 1, textAlign: 'center' as const }}><div style={{ fontSize: 14, fontWeight: 800, color: '#f97316', fontFamily: "'JetBrains Mono',monospace" }}>{stats.high}</div><div style={{ fontSize: 6, color: theme.textDim }}>High</div></div>
                    <div style={{ flex: 1, textAlign: 'center' as const }}><div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e', fontFamily: "'JetBrains Mono',monospace" }}>{stats.persons}</div><div style={{ fontSize: 6, color: theme.textDim }}>Subjects</div></div>
                </div>

                {/* Event Type chips */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Event Types</div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        {(Object.keys(typeConfig) as EventType[]).map(t => { const c = typeConfig[t]; const on = typeF.has(t); const count = mockEvents.filter(e => e.type === t).length;
                            return <button key={t} onClick={() => { toggleType(t); setPage(1); }} style={{ padding: '2px 6px', borderRadius: 3, border: `1px solid ${on ? c.color + '40' : theme.border}`, background: on ? `${c.color}08` : 'transparent', color: on ? c.color : theme.textDim, fontSize: 7, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>{c.icon} {c.label} <span style={{ fontSize: 6, opacity: 0.6 }}>{count}</span></button>;
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                        <button onClick={() => { setTypeF(new Set(Object.keys(typeConfig) as EventType[])); setPage(1); }} style={{ fontSize: 7, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
                        <button onClick={() => { setTypeF(new Set()); setPage(1); }} style={{ fontSize: 7, color: theme.textDim, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>None</button>
                    </div>
                </div>

                {/* Severity */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Severity</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                        <button onClick={() => { setSevF('all'); setPage(1); }} style={{ padding: '2px 6px', borderRadius: 3, border: `1px solid ${sevF === 'all' ? theme.accent + '40' : theme.border}`, background: sevF === 'all' ? `${theme.accent}08` : 'transparent', color: sevF === 'all' ? theme.accent : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
                        {(Object.keys(sevConfig) as Severity[]).map(s => <button key={s} onClick={() => { setSevF(s); setPage(1); }} style={{ padding: '2px 6px', borderRadius: 3, border: `1px solid ${sevF === s ? sevConfig[s].color + '40' : theme.border}`, background: sevF === s ? `${sevConfig[s].color}08` : 'transparent', color: sevF === s ? sevConfig[s].color : theme.textDim, fontSize: 7, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{sevConfig[s].label}</button>)}
                    </div>
                </div>

                {/* Person filter */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Person</div>
                    <select value={personF === 'all' ? 'all' : String(personF)} onChange={e => { setPersonF(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); setPage(1); }} style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: `1px solid ${personF !== 'all' ? '#ec489940' : theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                        <option value="all">All Persons</option>
                        {allPersons.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                    </select>
                </div>

                {/* Organization filter */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Organization</div>
                    <select value={orgF === 'all' ? 'all' : String(orgF)} onChange={e => { setOrgF(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); setPage(1); }} style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: `1px solid ${orgF !== 'all' ? '#8b5cf640' : theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                        <option value="all">All Organizations</option>
                        {allOrgs.map(o => <option key={o.id} value={String(o.id)}>{o.name}</option>)}
                    </select>
                </div>

                {/* Operation filter */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Operation</div>
                    <select value={opF} onChange={e => { setOpF(e.target.value); setPage(1); }} style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: `1px solid ${opF !== 'all' ? '#f5940b40' : theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                        <option value="all">All Operations</option>
                        {allOps.map(o => <option key={o} value={o}>OP {o}</option>)}
                    </select>
                </div>

                {/* Reset */}
                <div style={{ padding: '8px 12px', marginTop: 'auto' }}>
                    <button onClick={() => { setSearch(''); setTypeF(new Set(Object.keys(typeConfig) as EventType[])); setSevF('all'); setPersonF('all'); setOrgF('all'); setOpF('all'); setPage(1); }} style={{ width: '100%', padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, cursor: 'pointer', fontFamily: 'inherit' }}>↻ Reset All Filters</button>
                </div>
            </div>

            {/* ═══ RIGHT: Event Stream ═══ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px 3fr 1fr 1fr 1fr 80px', padding: '6px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', flexShrink: 0, background: theme.bg, gap: 8 }}>
                    <span>Type</span><span>Event</span><span>Subject</span><span>Source</span><span>Operation</span><span style={{ textAlign: 'right' as const }}>Time</span>
                </div>

                {/* Events */}
                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {paged.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 28, marginBottom: 6, opacity: 0.2 }}>📊</div><div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary }}>No events match</div><div style={{ fontSize: 10, color: theme.textDim, marginTop: 2 }}>Adjust filters or search criteria</div></div>}

                    {paged.map(e => {
                        const tc = typeConfig[e.type];
                        const sc = sevConfig[e.severity];
                        const isExp = expanded === e.id;
                        return <div key={e.id}>
                            <div onClick={() => setExpanded(isExp ? null : e.id)} style={{ display: 'grid', gridTemplateColumns: '40px 3fr 1fr 1fr 1fr 80px', padding: '8px 14px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', gap: 8, background: isExp ? `${tc.color}04` : 'transparent', borderLeft: `3px solid ${isExp ? tc.color : 'transparent'}`, transition: 'all 0.1s' }}>
                                {/* Type icon + severity */}
                                <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2 }}>
                                    <div style={{ width: 24, height: 24, borderRadius: 5, background: `${tc.color}12`, border: `1px solid ${tc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{tc.icon}</div>
                                    <div style={{ width: 6, height: 3, borderRadius: 1, background: sc.color }} />
                                </div>

                                {/* Event */}
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{e.title}</div>
                                    <div style={{ fontSize: 8, color: theme.textDim, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{e.location}</div>
                                </div>

                                {/* Subject */}
                                <div>{e.personName ? <a href={e.personId ? `/persons/${e.personId}` : '#'} onClick={ev => ev.stopPropagation()} style={{ fontSize: 9, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>{e.personName}</a> : <span style={{ fontSize: 8, color: theme.textDim }}>—</span>}
                                    {e.orgName && <div style={{ fontSize: 7, color: theme.textDim, marginTop: 1 }}>{e.orgName}</div>}
                                </div>

                                {/* Source */}
                                <div style={{ fontSize: 8, color: theme.textDim }}>{e.source.split('·')[0].trim()}</div>

                                {/* Operation */}
                                <div>{e.operationCode ? <a href="/operations" onClick={ev => ev.stopPropagation()} style={{ fontSize: 8, padding: '1px 5px', borderRadius: 2, background: `${theme.accent}10`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>{e.operationCode}</a> : <span style={{ fontSize: 8, color: theme.textDim }}>—</span>}</div>

                                {/* Time */}
                                <div style={{ textAlign: 'right' as const }}>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>{e.timeAgo}</div>
                                    <div style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace", marginTop: 1 }}>{e.timestamp.slice(11)}</div>
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {isExp && <div style={{ padding: '10px 14px 10px 57px', borderBottom: `1px solid ${theme.border}`, background: `${tc.color}03` }}>
                                <div style={{ fontSize: 9, color: theme.textSecondary, lineHeight: 1.6, marginBottom: 8 }}>{e.description}</div>

                                {/* Metadata grid */}
                                {Object.keys(e.metadata).length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 4, marginBottom: 8 }}>
                                    {Object.entries(e.metadata).map(([k, v]) => <div key={k} style={{ padding: '4px 8px', borderRadius: 4, background: `${theme.border}15`, border: `1px solid ${theme.border}08` }}>
                                        <div style={{ fontSize: 7, color: theme.textDim }}>{k}</div>
                                        <div style={{ fontSize: 9, fontWeight: 600, color: theme.text }}>{v}</div>
                                    </div>)}
                                </div>}

                                {/* Quick links */}
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                                    {e.personId && <a href={`/persons/${e.personId}`} style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>🧑 {e.personName}</a>}
                                    {e.orgId && <a href={`/organizations/${e.orgId}`} style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid #8b5cf625`, color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>🏢 {e.orgName}</a>}
                                    {e.deviceId && <a href={`/devices/${e.deviceId}`} style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid #22c55e25`, color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>📡 {e.deviceName}</a>}
                                    {e.operationCode && <a href="/operations" style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid #f5940b25`, color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>🎯 OP {e.operationCode}</a>}
                                    {e.lat > 0 && <a href="/map" style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontWeight: 600 }}>🗺️ Show on Map</a>}
                                </div>
                            </div>}
                        </div>;
                    })}

                    {/* Load more */}
                    {hasMore && <div style={{ padding: '12px', textAlign: 'center' as const }}>
                        <button onClick={() => setPage(p => p + 1)} style={{ padding: '6px 20px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Load more ({filtered.length - paged.length} remaining)</button>
                    </div>}
                </div>

                {/* Bottom bar */}
                <div style={{ padding: '3px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>Showing <span style={{ fontWeight: 700, color: theme.accent }}>{paged.length}</span> of {filtered.length} events</span>
                    {(personF !== 'all' || orgF !== 'all' || opF !== 'all' || sevF !== 'all' || search) && <span style={{ color: '#f59e0b' }}>· Filters active</span>}
                    <div style={{ flex: 1 }} />
                    <span>Real-time · WebSocket · ClickHouse</span>
                    <span>·</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>
        </div>
    </>);
}

ActivityIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default ActivityIndex;
