import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Alert Rules  ·  Surveillance Alert Configuration
   9 trigger types, per-entity targeting, channel routing
   ═══════════════════════════════════════════════════════════════ */

type TriggerType = 'zone_entry' | 'zone_exit' | 'colocation' | 'face_match' | 'photo_video' | 'speed_alert' | 'signal_lost' | 'lpr_match' | 'keyword';
type Severity = 'Critical' | 'Warning' | 'Informational';
type Channel = 'In-App' | 'Email' | 'SMS' | 'Webhook';

interface AlertRule {
    id: string; name: string; description: string;
    triggerType: TriggerType; severity: Severity;
    enabled: boolean; channels: Channel[];
    cooldown: number; // minutes
    targetPersonIds: number[]; targetPersonNames: string[];
    targetOrgIds: number[]; targetOrgNames: string[];
    operationCode: string;
    config: Record<string, string>;
    firedCount: number; lastFired: string;
    createdAt: string; createdBy: string;
}

interface AlertEvent {
    id: string; ruleId: string; ruleName: string; triggerType: TriggerType; severity: Severity;
    title: string; personName: string; location: string;
    timestamp: string; timeAgo: string; acknowledged: boolean;
}

const triggerConfig: Record<TriggerType, { icon: string; label: string; color: string; fields: string[] }> = {
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

const sevColors: Record<Severity, string> = { Critical: '#ef4444', Warning: '#f59e0b', Informational: '#3b82f6' };

// ═══ 18 MOCK ALERT RULES ═══
const mockRules: AlertRule[] = [
    { id: 'ar-01', name: 'Horvat Port Terminal Entry', description: 'Triggers when Horvat enters the Port Terminal restricted perimeter. Critical priority — indicates potential operational activity.', triggerType: 'zone_entry', severity: 'Critical', enabled: true, channels: ['In-App', 'SMS', 'Email'], cooldown: 5, targetPersonIds: [1], targetPersonNames: ['Marko Horvat'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Zone: 'Port Terminal Perimeter', Radius: '500m', 'Time Window': '24/7', 'Alert Priority': 'Immediate' }, firedCount: 11, lastFired: '2026-03-24 06:42', createdAt: '2026-03-01', createdBy: 'Col. Tomić' },
    { id: 'ar-02', name: 'Horvat + Mendoza Co-location', description: 'Detects when Horvat and Mendoza are within 50 meters. Tracks frequency of meetings for pattern analysis.', triggerType: 'colocation', severity: 'Critical', enabled: true, channels: ['In-App', 'SMS'], cooldown: 15, targetPersonIds: [1, 9], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { 'Subject A': 'Marko Horvat', 'Subject B': 'Carlos Mendoza', Radius: '50m', 'Min Duration': '2 min' }, firedCount: 8, lastFired: '2026-03-24 09:15', createdAt: '2026-03-05', createdBy: 'Cpt. Horvat' },
    { id: 'ar-03', name: 'HAWK Target Face at Airport', description: 'Face recognition match for any HAWK target at Zagreb Airport Cargo terminal cameras.', triggerType: 'face_match', severity: 'Critical', enabled: true, channels: ['In-App', 'Email', 'Webhook'], cooldown: 0, targetPersonIds: [1, 9, 12, 7], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Camera: 'Zagreb Airport Cargo (CAM-14)', Confidence: '≥ 85%', 'Match DB': 'InsightFace / ArcFace' }, firedCount: 3, lastFired: '2026-03-24 07:15', createdAt: '2026-03-01', createdBy: 'Col. Tomić' },
    { id: 'ar-04', name: 'LPR Watchlist — HAWK Vehicles', description: 'Captures any watchlisted vehicle plate at monitored LPR positions across Zagreb.', triggerType: 'lpr_match', severity: 'Warning', enabled: true, channels: ['In-App'], cooldown: 10, targetPersonIds: [1, 12, 3, 9], targetPersonNames: ['Marko Horvat', 'Ivan Babić', 'Ahmed Al-Rashid', 'Carlos Mendoza'], targetOrgIds: [1], targetOrgNames: ['Alpha Security Group'], operationCode: 'HAWK', config: { Plates: 'ZG-1234-AB, ZG-5678-CD, SA-9012-RH, CO-MEND-99', Readers: 'Vukovarska, Airport, A1 Highway, Savska', 'Time Window': '24/7' }, firedCount: 31, lastFired: '2026-03-24 09:31', createdAt: '2026-02-20', createdBy: 'Lt. Petrić' },
    { id: 'ar-05', name: 'Target Device Signal Lost', description: 'Alerts when any HAWK target device goes dark for more than 30 minutes.', triggerType: 'signal_lost', severity: 'Warning', enabled: true, channels: ['In-App', 'Email'], cooldown: 60, targetPersonIds: [1, 9, 12, 7], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Timeout: '30 minutes', Devices: 'GPS-002, GPS-010, GPS-013, APP-LOC', 'Expected Coverage': 'Zagreb metro area' }, firedCount: 6, lastFired: '2026-03-24 04:00', createdAt: '2026-03-01', createdBy: 'Sgt. Matić' },
    { id: 'ar-06', name: 'Speed Violation — Urban Zone', description: 'Alerts when any tracked vehicle exceeds 100 km/h in an urban monitoring zone.', triggerType: 'speed_alert', severity: 'Warning', enabled: true, channels: ['In-App'], cooldown: 5, targetPersonIds: [1, 12, 9], targetPersonNames: ['Marko Horvat', 'Ivan Babić', 'Carlos Mendoza'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Threshold: '100 km/h', 'Zone Type': 'Urban (50 km/h limit)', Duration: '> 30 seconds', 'Min Distance': '500m' }, firedCount: 4, lastFired: '2026-03-24 08:44', createdAt: '2026-03-05', createdBy: 'Lt. Petrić' },
    { id: 'ar-07', name: 'Babić Diplomatic Quarter Entry', description: 'Triggers when Babić enters the diplomatic quarter zone. New pattern under investigation.', triggerType: 'zone_entry', severity: 'Warning', enabled: true, channels: ['In-App', 'Email'], cooldown: 30, targetPersonIds: [12], targetPersonNames: ['Ivan Babić'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Zone: 'Diplomatic Quarter', Radius: '300m', 'Time Window': '24/7' }, firedCount: 4, lastFired: '2026-03-23 14:22', createdAt: '2026-03-15', createdBy: 'Cpt. Horvat' },
    { id: 'ar-08', name: 'Hassan Zone Exit — Monitored Bravo', description: 'Tracks when Hassan exits the monitored port area zone.', triggerType: 'zone_exit', severity: 'Informational', enabled: true, channels: ['In-App'], cooldown: 30, targetPersonIds: [7], targetPersonNames: ['Omar Hassan'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Zone: 'Monitored Zone Bravo', Radius: '400m', Direction: 'Any' }, firedCount: 12, lastFired: '2026-03-24 06:15', createdAt: '2026-03-10', createdBy: 'Sgt. Matić' },
    { id: 'ar-09', name: 'Audio Keyword — "delivery" / "shipment"', description: 'Flags audio intercepts containing operational keywords in Croatian or English.', triggerType: 'keyword', severity: 'Warning', enabled: true, channels: ['In-App', 'Email'], cooldown: 0, targetPersonIds: [1, 9, 7], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Omar Hassan'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Keywords: 'delivery, shipment, cargo, port, tonight, package', Languages: 'Croatian, English, Arabic', Confidence: '≥ 80%', Source: 'Faster-Whisper' }, firedCount: 7, lastFired: '2026-03-24 08:22', createdAt: '2026-03-08', createdBy: 'Sgt. Matić' },
    { id: 'ar-10', name: 'Any Target Photo/Video Capture', description: 'Notifies when photo or video surveillance captures any HAWK target subject.', triggerType: 'photo_video', severity: 'Informational', enabled: true, channels: ['In-App'], cooldown: 15, targetPersonIds: [1, 9, 12, 7], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { 'Source Type': 'Photo + Video', 'Time Filter': '24/7', 'Auto-Index': 'MinIO storage' }, firedCount: 45, lastFired: '2026-03-24 06:48', createdAt: '2026-03-01', createdBy: 'Col. Tomić' },
    { id: 'ar-11', name: 'Restricted Zone Alpha — Any Subject', description: 'Critical alert when any monitored person enters the primary restricted perimeter.', triggerType: 'zone_entry', severity: 'Critical', enabled: true, channels: ['In-App', 'SMS', 'Webhook'], cooldown: 0, targetPersonIds: [1, 9, 12, 7, 3], targetPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan', 'Ahmed Al-Rashid'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Zone: 'Restricted Zone Alpha', Radius: '200m', 'Alert Priority': 'Immediate', 'Escalation': 'Commander' }, firedCount: 3, lastFired: '2026-03-24 10:02', createdAt: '2026-02-15', createdBy: 'Col. Tomić' },
    { id: 'ar-12', name: 'Horvat + Babić Co-location', description: 'Tracks weekly meetings between Horvat and Babić. Pattern: Tuesdays 08:00-10:00 at Vukovarska.', triggerType: 'colocation', severity: 'Warning', enabled: true, channels: ['In-App'], cooldown: 60, targetPersonIds: [1, 12], targetPersonNames: ['Marko Horvat', 'Ivan Babić'], targetOrgIds: [1], targetOrgNames: ['Alpha Security Group'], operationCode: 'HAWK', config: { 'Subject A': 'Marko Horvat', 'Subject B': 'Ivan Babić', Radius: '25m', Pattern: 'Weekly Tuesday 08-10' }, firedCount: 6, lastFired: '2026-03-24 08:15', createdAt: '2026-03-01', createdBy: 'Cpt. Horvat' },
    { id: 'ar-13', name: 'GLACIER — Transaction >€50K', description: 'Flags wire transfers exceeding €50,000 from Rashid Holdings or Falcon Trading accounts.', triggerType: 'keyword', severity: 'Critical', enabled: true, channels: ['In-App', 'Email', 'Webhook'], cooldown: 0, targetPersonIds: [3, 7], targetPersonNames: ['Ahmed Al-Rashid', 'Omar Hassan'], targetOrgIds: [2, 5], targetOrgNames: ['Rashid Holdings International', 'Falcon Trading LLC'], operationCode: 'GLACIER', config: { Keywords: 'Transaction amount > €50,000', Source: 'Bank Transaction Monitor (FINA)', Accounts: 'Rashid Holdings, Falcon Trading', 'AML Flag': 'Auto-generate SAR' }, firedCount: 2, lastFired: '2026-03-20 14:30', createdAt: '2026-03-20', createdBy: 'Cpt. Galić' },
    { id: 'ar-14', name: 'Al-Rashid Face Recognition', description: 'Face match for Al-Rashid at any camera in the network. Diplomatic sensitivity.', triggerType: 'face_match', severity: 'Warning', enabled: true, channels: ['In-App', 'Email'], cooldown: 30, targetPersonIds: [3], targetPersonNames: ['Ahmed Al-Rashid'], targetOrgIds: [2], targetOrgNames: ['Rashid Holdings International'], operationCode: 'GLACIER', config: { Camera: 'All network cameras', Confidence: '≥ 80%', Notes: 'Handle with diplomatic sensitivity' }, firedCount: 1, lastFired: '2026-03-18 11:30', createdAt: '2026-03-20', createdBy: 'Maj. Novak' },
    { id: 'ar-15', name: 'ASG HQ Camera Motion — After Hours', description: 'Motion detection at Alpha Security Group HQ outside business hours.', triggerType: 'photo_video', severity: 'Warning', enabled: true, channels: ['In-App'], cooldown: 15, targetPersonIds: [], targetPersonNames: [], targetOrgIds: [1], targetOrgNames: ['Alpha Security Group'], operationCode: 'HAWK', config: { 'Source Type': 'Camera motion detection', 'Time Filter': '20:00 — 06:00', Camera: 'Zagreb HQ Entrance (CAM-01)', 'Sensitivity': 'High' }, firedCount: 18, lastFired: '2026-03-24 02:30', createdAt: '2026-02-15', createdBy: 'Lt. Petrić' },
    { id: 'ar-16', name: 'Mendoza SIM/IMSI Change', description: 'Detects SIM swap or new IMSI registration by Mendoza device.', triggerType: 'signal_lost', severity: 'Critical', enabled: true, channels: ['In-App', 'SMS'], cooldown: 0, targetPersonIds: [9], targetPersonNames: ['Carlos Mendoza'], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { 'Detection': 'IMSI change / SIM swap', Device: 'Mendoza primary phone', Source: 'IMSI Catcher Array', 'Auto-correlate': 'New IMSI to known contacts' }, firedCount: 1, lastFired: '2026-03-24 02:45', createdAt: '2026-03-10', createdBy: 'Sgt. Matić' },
    { id: 'ar-17', name: 'Unknown LPR at Safe House', description: 'Any unregistered plate captured near the Savska safe house location.', triggerType: 'lpr_match', severity: 'Warning', enabled: true, channels: ['In-App', 'Email'], cooldown: 30, targetPersonIds: [], targetPersonNames: [], targetOrgIds: [], targetOrgNames: [], operationCode: 'HAWK', config: { Plates: '* (any not on whitelist)', Reader: 'Savska LPR', Radius: '100m from safe house', Whitelist: '12 known plates' }, firedCount: 5, lastFired: '2026-03-24 03:22', createdAt: '2026-03-01', createdBy: 'Cpt. Horvat' },
    { id: 'ar-18', name: 'PHOENIX — Shanghai Camera Activity', description: 'Any motion or face detection at Shanghai Port camera during active hours.', triggerType: 'photo_video', severity: 'Informational', enabled: false, channels: ['In-App'], cooldown: 60, targetPersonIds: [10], targetPersonNames: ['Li Wei'], targetOrgIds: [4], targetOrgNames: ['Dragon Tech Solutions'], operationCode: 'PHOENIX', config: { Camera: 'Shanghai Port Cam (CAM-19)', 'Source Type': 'Motion + Face', Status: 'Standby — pending legal authorization' }, firedCount: 0, lastFired: '—', createdAt: '2026-03-12', createdBy: 'Cpt. Perić' },
];

// Recent alert events
const mockAlertEvents: AlertEvent[] = [
    { id: 'ae-01', ruleId: 'ar-11', ruleName: 'Restricted Zone Alpha', triggerType: 'zone_entry', severity: 'Critical', title: 'Horvat entered Restricted Zone Alpha — 4 min inside', personName: 'Marko Horvat', location: 'Restricted Zone Alpha, Zagreb', timestamp: '2026-03-24 10:02', timeAgo: '12m', acknowledged: false },
    { id: 'ae-02', ruleId: 'ar-03', ruleName: 'Face at Airport', triggerType: 'face_match', severity: 'Critical', title: 'Face match: Horvat at CAM-07 (94% confidence)', personName: 'Marko Horvat', location: 'Trg bana Jelačića', timestamp: '2026-03-24 09:48', timeAgo: '26m', acknowledged: false },
    { id: 'ae-03', ruleId: 'ar-04', ruleName: 'LPR Watchlist', triggerType: 'lpr_match', severity: 'Warning', title: 'ZG-1847-AB captured at Vukovarska heading east', personName: 'Marko Horvat', location: 'Vukovarska cesta', timestamp: '2026-03-24 09:31', timeAgo: '43m', acknowledged: true },
    { id: 'ae-04', ruleId: 'ar-02', ruleName: 'Horvat+Mendoza', triggerType: 'colocation', severity: 'Critical', title: 'Co-location: Horvat & Mendoza at Savska (25m) — 3rd in 48h', personName: 'Marko Horvat', location: 'Savska cesta 41', timestamp: '2026-03-24 09:15', timeAgo: '59m', acknowledged: false },
    { id: 'ae-05', ruleId: 'ar-09', ruleName: 'Keyword Detection', triggerType: 'keyword', severity: 'Warning', title: 'Audio keyword "delivery" ×3 in intercepted call', personName: 'Marko Horvat', location: 'MIC-ALPHA', timestamp: '2026-03-24 08:22', timeAgo: '2h', acknowledged: true },
    { id: 'ae-06', ruleId: 'ar-06', ruleName: 'Speed Violation', triggerType: 'speed_alert', severity: 'Warning', title: 'Babić vehicle 118 km/h in 50 km/h zone for 3.2 km', personName: 'Ivan Babić', location: 'Ilica 242', timestamp: '2026-03-24 08:44', timeAgo: '1h', acknowledged: true },
    { id: 'ae-07', ruleId: 'ar-12', ruleName: 'Horvat+Babić', triggerType: 'colocation', severity: 'Warning', title: 'Weekly co-location: Horvat & Babić at Vukovarska (Tuesday)', personName: 'Marko Horvat', location: 'Vukovarska 58', timestamp: '2026-03-24 08:15', timeAgo: '2h', acknowledged: true },
    { id: 'ae-08', ruleId: 'ar-01', ruleName: 'Horvat Port', triggerType: 'zone_entry', severity: 'Critical', title: 'Horvat entered Port Terminal — visit #11 in 14 days', personName: 'Marko Horvat', location: 'Port Terminal', timestamp: '2026-03-24 06:42', timeAgo: '3h', acknowledged: true },
    { id: 'ae-09', ruleId: 'ar-05', ruleName: 'Signal Lost', triggerType: 'signal_lost', severity: 'Warning', title: 'Babić phone signal lost — 30min timeout reached', personName: 'Ivan Babić', location: 'Dubrava', timestamp: '2026-03-24 04:00', timeAgo: '6h', acknowledged: true },
    { id: 'ae-10', ruleId: 'ar-17', ruleName: 'Unknown LPR', triggerType: 'lpr_match', severity: 'Warning', title: 'Unknown plate KA-9921-CC near Savska safe house (rental)', personName: '', location: 'Savska cesta 41', timestamp: '2026-03-24 03:22', timeAgo: '7h', acknowledged: false },
    { id: 'ae-11', ruleId: 'ar-16', ruleName: 'Mendoza SIM', triggerType: 'signal_lost', severity: 'Critical', title: 'SIM swap detected — Mendoza new prepaid IMSI', personName: 'Carlos Mendoza', location: 'Glavni Kolodvor', timestamp: '2026-03-24 02:45', timeAgo: '7h', acknowledged: true },
    { id: 'ae-12', ruleId: 'ar-15', ruleName: 'ASG After-Hours', triggerType: 'photo_video', severity: 'Warning', title: 'Motion at ASG HQ after hours — 02:30', personName: '', location: 'Savska cesta 120', timestamp: '2026-03-24 02:30', timeAgo: '8h', acknowledged: true },
];

type ViewTab = 'rules' | 'feed' | 'stats';
const allOps = [...new Set(mockRules.map(r => r.operationCode))];
const allPersons = [...new Set(mockRules.flatMap(r => r.targetPersonNames))].sort();

function AlertsIndex() {
    const [tab, setTab] = useState<ViewTab>('rules');
    const [search, setSearch] = useState('');
    const [triggerF, setTriggerF] = useState<TriggerType | 'all'>('all');
    const [sevF, setSevF] = useState<Severity | 'all'>('all');
    const [opF, setOpF] = useState('all');
    const [personF, setPersonF] = useState('all');
    const [enabledF, setEnabledF] = useState<'all' | 'enabled' | 'disabled'>('all');
    const [selRule, setSelRule] = useState<string | null>(null);

    const rule = selRule ? mockRules.find(r => r.id === selRule) : null;

    const filtered = useMemo(() => mockRules.filter(r => {
        if (triggerF !== 'all' && r.triggerType !== triggerF) return false;
        if (sevF !== 'all' && r.severity !== sevF) return false;
        if (opF !== 'all' && r.operationCode !== opF) return false;
        if (personF !== 'all' && !r.targetPersonNames.includes(personF)) return false;
        if (enabledF === 'enabled' && !r.enabled) return false;
        if (enabledF === 'disabled' && r.enabled) return false;
        if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [triggerF, sevF, opF, personF, enabledF, search]);

    const stats = { total: mockRules.length, enabled: mockRules.filter(r => r.enabled).length, critical: mockRules.filter(r => r.severity === 'Critical').length, totalFired: mockRules.reduce((s, r) => s + r.firedCount, 0), unack: mockAlertEvents.filter(e => !e.acknowledged).length };

    // Trigger type counts
    const triggerCounts = Object.fromEntries((Object.keys(triggerConfig) as TriggerType[]).map(t => [t, mockRules.filter(r => r.triggerType === t).length]));

    return (<>
        <PageMeta title="Alert Rules" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* LEFT: Filters */}
            <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#ef444410', border: '1px solid #ef444425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚨</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>ALERTS</div><div style={{ fontSize: 7, color: theme.textDim }}>Surveillance Alert Engine</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                {/* Stats */}
                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 3 }}>
                    {[{ n: stats.total, l: 'Rules', c: theme.accent }, { n: stats.enabled, l: 'Active', c: '#22c55e' }, { n: stats.unack, l: 'Unack', c: '#ef4444' }, { n: stats.totalFired, l: 'Fired', c: '#f59e0b' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '3px 0' }}><div style={{ fontSize: 13, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Trigger type */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Trigger Type</div>
                    <button onClick={() => setTriggerF('all')} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: triggerF === 'all' ? `${theme.accent}08` : 'transparent', color: triggerF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${triggerF === 'all' ? theme.accent : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}>All ({mockRules.length})</button>
                    {(Object.keys(triggerConfig) as TriggerType[]).map(t => { const tc = triggerConfig[t]; const c = triggerCounts[t]; if (c === 0) return null; return <button key={t} onClick={() => setTriggerF(t)} style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: triggerF === t ? `${tc.color}08` : 'transparent', color: triggerF === t ? tc.color : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${triggerF === t ? tc.color : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}><span>{tc.icon}</span><span style={{ flex: 1 }}>{tc.label}</span><span style={{ fontSize: 7, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>

                {/* Severity */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Severity</div>
                    <div style={{ display: 'flex', gap: 2 }}>
                        {(['all', 'Critical', 'Warning', 'Informational'] as const).map(s => <button key={s} onClick={() => setSevF(s)} style={{ flex: 1, padding: '3px 4px', borderRadius: 3, border: `1px solid ${sevF === s ? (s === 'all' ? theme.accent : sevColors[s as Severity]) + '40' : theme.border}`, background: sevF === s ? `${s === 'all' ? theme.accent : sevColors[s as Severity]}08` : 'transparent', color: sevF === s ? (s === 'all' ? theme.accent : sevColors[s as Severity]) : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit', fontWeight: sevF === s ? 700 : 500 }}>{s === 'all' ? 'All' : s === 'Informational' ? 'Info' : s}</button>)}
                    </div>
                </div>

                {/* Operation + Person + Enabled */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Operation</div><select value={opF} onChange={e => setOpF(e.target.value)} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}><option value="all">All Operations</option>{allOps.map(o => <option key={o} value={o}>OP {o}</option>)}</select></div>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Target Person</div><select value={personF} onChange={e => setPersonF(e.target.value)} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}><option value="all">All Persons</option>{allPersons.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Status</div><div style={{ display: 'flex', gap: 2 }}>{[{ id: 'all' as const, l: 'All' }, { id: 'enabled' as const, l: 'Enabled' }, { id: 'disabled' as const, l: 'Disabled' }].map(s => <button key={s.id} onClick={() => setEnabledF(s.id)} style={{ flex: 1, padding: '3px', borderRadius: 3, border: `1px solid ${enabledF === s.id ? theme.accent + '40' : theme.border}`, background: enabledF === s.id ? `${theme.accent}08` : 'transparent', color: enabledF === s.id ? theme.accent : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>{s.l}</button>)}</div></div>
                </div>

                <div style={{ padding: '8px 12px', marginTop: 'auto', display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                    <a href="/activity" style={{ fontSize: 8, color: theme.textDim, textDecoration: 'none' }}>📊 Activity Log</a>
                    <a href="/workflows" style={{ fontSize: 8, color: theme.textDim, textDecoration: 'none' }}>⚡ Workflows</a>
                    <a href="/operations" style={{ fontSize: 8, color: theme.textDim, textDecoration: 'none' }}>🎯 Operations</a>
                </div>
            </div>

            {/* CENTER */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {[{ id: 'rules' as ViewTab, l: '📋 Rules', n: filtered.length }, { id: 'feed' as ViewTab, l: '🔴 Live Feed', n: stats.unack }, { id: 'stats' as ViewTab, l: '📊 Statistics' }].map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#ef4444' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 10, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>{t.l}{t.n !== undefined && <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: `${tab === t.id ? '#ef4444' : theme.border}20`, color: tab === t.id ? '#ef4444' : theme.textDim }}>{t.n}</span>}</button>)}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {/* ═══ RULES LIST ═══ */}
                    {tab === 'rules' && <>
                        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 28, opacity: 0.2 }}>🚨</div><div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>No rules match</div></div>}
                        {filtered.map(r => {
                            const tc = triggerConfig[r.triggerType]; const sc = sevColors[r.severity]; const sel = selRule === r.id;
                            return <div key={r.id} onClick={() => setSelRule(r.id)} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: sel ? `${tc.color}04` : 'transparent', borderLeft: `3px solid ${sel ? tc.color : 'transparent'}`, opacity: r.enabled ? 1 : 0.5, transition: 'all 0.1s' }}>
                                {/* Type icon */}
                                <div style={{ width: 32, height: 32, borderRadius: 6, background: `${tc.color}12`, border: `1px solid ${tc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{tc.icon}</div>
                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{r.name}</span>
                                        {!r.enabled && <span style={{ fontSize: 6, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: `${theme.border}30`, color: theme.textDim }}>DISABLED</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                                        <span style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${sc}12`, color: sc, fontWeight: 600 }}>{r.severity}</span>
                                        <span style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${theme.accent}10`, color: theme.accent }}>{r.operationCode}</span>
                                        {r.channels.map(c => <span key={c} style={{ fontSize: 6, padding: '1px 3px', borderRadius: 2, background: `${theme.border}20`, color: theme.textDim }}>{c}</span>)}
                                    </div>
                                </div>
                                {/* Targets */}
                                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                                    {r.targetPersonNames.length > 0 && <div style={{ fontSize: 7, color: theme.textDim }}>{r.targetPersonNames.length > 2 ? `${r.targetPersonNames.slice(0, 2).join(', ')} +${r.targetPersonNames.length - 2}` : r.targetPersonNames.join(', ')}</div>}
                                    {r.targetOrgNames.length > 0 && <div style={{ fontSize: 7, color: '#8b5cf6' }}>{r.targetOrgNames[0]}</div>}
                                </div>
                                {/* Fired count */}
                                <div style={{ textAlign: 'center' as const, flexShrink: 0, width: 45 }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: r.firedCount > 20 ? '#f59e0b' : theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{r.firedCount}</div>
                                    <div style={{ fontSize: 6, color: theme.textDim }}>fired</div>
                                </div>
                            </div>;
                        })}
                    </>}

                    {/* ═══ LIVE FEED ═══ */}
                    {tab === 'feed' && <>
                        {mockAlertEvents.map(e => {
                            const tc = triggerConfig[e.triggerType]; const sc = sevColors[e.severity];
                            return <div key={e.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 10, alignItems: 'flex-start', background: !e.acknowledged ? `${sc}04` : 'transparent', borderLeft: `3px solid ${!e.acknowledged ? sc : 'transparent'}` }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${tc.color}12`, border: `1px solid ${tc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginTop: 2 }}>{tc.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, marginBottom: 2 }}>{e.title}</div>
                                    <div style={{ display: 'flex', gap: 4, fontSize: 8, color: theme.textDim }}>
                                        {e.personName && <a href={`/persons/${mockRules.find(r => r.id === e.ruleId)?.targetPersonIds[0] || 1}`} onClick={ev => ev.stopPropagation()} style={{ color: theme.accent, textDecoration: 'none' }}>🧑 {e.personName}</a>}
                                        <span>📍 {e.location}</span>
                                        <span>· Rule: {e.ruleName}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                                    <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: `${sc}12`, color: sc }}>{e.severity}</span>
                                    <div style={{ fontSize: 8, color: theme.textDim, marginTop: 2 }}>{e.timeAgo}</div>
                                    {!e.acknowledged && <div style={{ fontSize: 6, fontWeight: 800, color: '#ef4444', marginTop: 2 }}>● NEW</div>}
                                </div>
                            </div>;
                        })}
                    </>}

                    {/* ═══ STATISTICS ═══ */}
                    {tab === 'stats' && <div style={{ padding: 16, display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                        {/* By trigger type */}
                        <div><div style={{ fontSize: 11, fontWeight: 700, color: theme.text, marginBottom: 8 }}>Alerts by Trigger Type</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                            {(Object.keys(triggerConfig) as TriggerType[]).map(t => { const tc = triggerConfig[t]; const count = mockRules.filter(r => r.triggerType === t).length; const fired = mockRules.filter(r => r.triggerType === t).reduce((s, r) => s + r.firedCount, 0);
                                return <div key={t} style={{ flex: '1 1 100px', minWidth: 100, padding: '10px', borderRadius: 6, border: `1px solid ${tc.color}15`, background: `${tc.color}04` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}><span style={{ fontSize: 14 }}>{tc.icon}</span><span style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{tc.label}</span></div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <div><div style={{ fontSize: 16, fontWeight: 800, color: tc.color, fontFamily: "'JetBrains Mono',monospace" }}>{count}</div><div style={{ fontSize: 6, color: theme.textDim }}>rules</div></div>
                                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{fired}</div><div style={{ fontSize: 6, color: theme.textDim }}>fired</div></div>
                                    </div>
                                </div>;
                            })}
                        </div></div>

                        {/* By person */}
                        <div><div style={{ fontSize: 11, fontWeight: 700, color: theme.text, marginBottom: 8 }}>Alert Coverage by Person</div>
                        <div style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            {allPersons.map(p => { const rules = mockRules.filter(r => r.targetPersonNames.includes(p)); const fired = rules.reduce((s, r) => s + r.firedCount, 0);
                                return <div key={p} style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 9, fontWeight: 600, color: theme.text, flex: 1 }}>{p}</span>
                                    <span style={{ fontSize: 8, color: theme.textDim }}>{rules.length} rules</span>
                                    <div style={{ width: 50, height: 4, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${Math.min(100, (fired / 50) * 100)}%`, height: '100%', background: fired > 20 ? '#ef4444' : '#f59e0b', borderRadius: 2 }} /></div>
                                    <span style={{ fontSize: 8, fontWeight: 700, color: fired > 20 ? '#ef4444' : theme.textDim, fontFamily: "'JetBrains Mono',monospace", width: 25, textAlign: 'right' as const }}>{fired}</span>
                                </div>;
                            })}
                        </div></div>

                        {/* By operation */}
                        <div><div style={{ fontSize: 11, fontWeight: 700, color: theme.text, marginBottom: 8 }}>By Operation</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {allOps.map(op => { const rules = mockRules.filter(r => r.operationCode === op); const fired = rules.reduce((s, r) => s + r.firedCount, 0);
                                return <div key={op} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}` }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.accent, marginBottom: 4 }}>OP {op}</div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <div><div style={{ fontSize: 18, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{rules.length}</div><div style={{ fontSize: 7, color: theme.textDim }}>rules</div></div>
                                        <div><div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{fired}</div><div style={{ fontSize: 7, color: theme.textDim }}>fired</div></div>
                                    </div>
                                </div>;
                            })}
                        </div></div>
                    </div>}
                </div>

                {/* Bottom */}
                <div style={{ padding: '3px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>{stats.total} rules · {stats.enabled} active · {stats.totalFired} total fired · {stats.unack} unacknowledged</span>
                    <div style={{ flex: 1 }} /><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>

            {/* RIGHT: Rule Detail */}
            {rule && <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${triggerConfig[rule.triggerType].color}12`, border: `1px solid ${triggerConfig[rule.triggerType].color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{triggerConfig[rule.triggerType].icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{rule.name}</div><div style={{ fontSize: 7, color: theme.textDim }}>{triggerConfig[rule.triggerType].label} · {rule.operationCode}</div></div>
                        <button onClick={() => setSelRule(null)} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: `${sevColors[rule.severity]}12`, color: sevColors[rule.severity] }}>{rule.severity}</span>
                        <span style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: rule.enabled ? '#22c55e12' : `${theme.border}20`, color: rule.enabled ? '#22c55e' : theme.textDim, fontWeight: 600 }}>{rule.enabled ? '● Enabled' : '○ Disabled'}</span>
                    </div>
                </div>

                {/* Description */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: 9, color: theme.textSecondary, lineHeight: 1.5 }}>{rule.description}</div>

                {/* Stats */}
                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ n: rule.firedCount, l: 'Fired', c: '#f59e0b' }, { n: rule.cooldown + 'm', l: 'Cooldown', c: theme.textDim }].map((s, i) => <div key={i} style={{ flex: 1, textAlign: 'center' as const }}><div style={{ fontSize: 14, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Config */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>⚙️ Configuration</div>
                    {Object.entries(rule.config).map(([k, v]) => <div key={k} style={{ padding: '3px 6px', marginBottom: 2, borderRadius: 3, background: `${theme.border}10`, border: `1px solid ${theme.border}08` }}><div style={{ fontSize: 7, color: theme.textDim }}>{k}</div><div style={{ fontSize: 9, fontWeight: 600, color: theme.text }}>{v}</div></div>)}
                </div>

                {/* Channels */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>📡 Channels</div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        {rule.channels.map(c => <span key={c} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3, background: `${theme.accent}08`, color: theme.accent, fontWeight: 600 }}>{c === 'In-App' ? '🔔' : c === 'Email' ? '📧' : c === 'SMS' ? '💬' : '🔗'} {c}</span>)}
                    </div>
                </div>

                {/* Targets */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>🎯 Targets</div>
                    {rule.targetPersonNames.length > 0 && <div style={{ marginBottom: 4 }}>{rule.targetPersonIds.map((id, i) => <a key={id} href={`/persons/${id}`} style={{ display: 'inline-block', fontSize: 8, padding: '2px 6px', borderRadius: 3, background: '#ec489908', color: '#ec4899', textDecoration: 'none', fontWeight: 600, marginRight: 3, marginBottom: 2 }}>🧑 {rule.targetPersonNames[i]}</a>)}</div>}
                    {rule.targetOrgNames.length > 0 && <div>{rule.targetOrgIds.map((id, i) => <a key={id} href={`/organizations/${id}`} style={{ display: 'inline-block', fontSize: 8, padding: '2px 6px', borderRadius: 3, background: '#8b5cf608', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600, marginRight: 3 }}>🏢 {rule.targetOrgNames[i]}</a>)}</div>}
                    {rule.targetPersonNames.length === 0 && rule.targetOrgNames.length === 0 && <div style={{ fontSize: 8, color: theme.textDim }}>No specific entity targets (general rule)</div>}
                </div>

                {/* Meta */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    {[{ l: 'Last Fired', v: rule.lastFired }, { l: 'Created', v: `${rule.createdAt} by ${rule.createdBy}` }, { l: 'Operation', v: `OP ${rule.operationCode}` }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: theme.text }}>{r.v}</span></div>)}
                </div>

                {/* Actions */}
                <div style={{ padding: '8px 12px', marginTop: 'auto', display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                    <button style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${rule.enabled ? '#f59e0b30' : '#22c55e30'}`, background: rule.enabled ? '#f59e0b06' : '#22c55e06', color: rule.enabled ? '#f59e0b' : '#22c55e', fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{rule.enabled ? '⏸ Disable' : '▶ Enable'}</button>
                    <a href="/operations" style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none', fontSize: 8, fontWeight: 600, textAlign: 'center' as const }}>🎯 Operation</a>
                    <a href="/workflows" style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8, textAlign: 'center' as const }}>⚡ Workflow</a>
                </div>
            </div>}
        </div>
    </>);
}

AlertsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default AlertsIndex;
