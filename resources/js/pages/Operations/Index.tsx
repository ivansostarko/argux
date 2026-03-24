import PageMeta from '../../components/layout/PageMeta';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockPersons } from '../../mock/persons';
import { mockDevices, deviceTypeIcons } from '../../mock/devices';
import { mockOrganizations } from '../../mock/organizations';
import { mockVehicles } from '../../mock/vehicles';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Operations  ·  Surveillance Operation Planning Center
   Plan, resource, execute & debrief tactical surveillance ops
   ═══════════════════════════════════════════════════════════════ */

// ═══ TYPES ═══
type Phase = 'Planning' | 'Preparation' | 'Active' | 'Debrief' | 'Closed';
type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
interface TeamMember { personId: number; role: string; callsign: string; }
interface Team { id: string; name: string; icon: string; color: string; lead: string; members: TeamMember[]; }
interface OpZone { id: string; name: string; type: 'surveillance' | 'restricted' | 'staging' | 'buffer'; lat: number; lng: number; radius: number; }
interface AlertRule { id: string; type: string; description: string; severity: 'critical' | 'high' | 'medium'; enabled: boolean; }
interface TimelineEvent { id: string; date: string; label: string; type: 'phase' | 'event' | 'intel' | 'alert'; color: string; }
interface Checklist { id: string; label: string; done: boolean; assignee: string; }
interface Operation {
    id: string; codename: string; name: string; description: string;
    phase: Phase; priority: Priority; classification: string;
    commander: string; startDate: string; endDate: string;
    targetPersonIds: number[]; targetOrgIds: number[];
    deployedDeviceIds: number[]; trackedVehicleIds: number[];
    teams: Team[]; zones: OpZone[]; alertRules: AlertRule[];
    timeline: TimelineEvent[]; checklist: Checklist[];
    briefingNotes: string; commsChannel: string; commsFreq: string;
    riskLevel: number; threatAssessment: string;
    stats: { events: number; alerts: number; hoursActive: number; intel: number; };
}

type DetailTab = 'overview' | 'targets' | 'resources' | 'teams' | 'zones' | 'alerts' | 'timeline' | 'briefing';

const phaseColors: Record<Phase, string> = { Planning: '#3b82f6', Preparation: '#f59e0b', Active: '#22c55e', Debrief: '#a855f7', Closed: '#6b7280' };
const phaseIcons: Record<Phase, string> = { Planning: '📋', Preparation: '🔧', Active: '🟢', Debrief: '📊', Closed: '🔒' };
const prioColors: Record<Priority, string> = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#22c55e' };

// ═══ MOCK OPERATIONS ═══
const mockOps: Operation[] = [
    {
        id: 'op-1', codename: 'HAWK', name: 'Operation HAWK — Zagreb Port Network', phase: 'Active', priority: 'Critical', classification: 'TOP SECRET // NOFORN',
        description: 'Multi-phase surveillance operation targeting suspected arms trafficking network operating through Zagreb port facilities and associated logistics companies. Primary targets: Horvat, Mendoza, Babić. Intelligence suggests imminent shipment within 72 hours.',
        commander: 'Col. Davor Tomić', startDate: '2026-02-15', endDate: '',
        targetPersonIds: [1, 9, 12, 7, 3], targetOrgIds: [1, 2, 5],
        deployedDeviceIds: [1, 2, 5, 8, 14, 17, 18], trackedVehicleIds: [1, 3, 5, 8],
        teams: [
            { id: 't1', name: 'Alpha — Ground Surveillance', icon: '🏃', color: '#3b82f6', lead: 'Cpt. Nina Horvat', members: [{ personId: 1, role: 'Primary Target', callsign: 'HAWK-1' }, { personId: 12, role: 'Secondary Target', callsign: 'HAWK-2' }] },
            { id: 't2', name: 'Bravo — Technical', icon: '📡', color: '#22c55e', lead: 'Lt. Marko Petrić', members: [{ personId: 9, role: 'Target', callsign: 'LOBO' }] },
            { id: 't3', name: 'Charlie — SIGINT', icon: '🛰️', color: '#a855f7', lead: 'Sgt. Ana Matić', members: [{ personId: 7, role: 'Target', callsign: 'FALCON' }] },
            { id: 't4', name: 'Delta — Maritime', icon: '🚢', color: '#06b6d4', lead: 'Lt. Cmdr. Ivan Škugor', members: [] },
            { id: 't5', name: 'Echo — Air Support', icon: '🚁', color: '#f59e0b', lead: 'Cpt. Dario Vlahović', members: [] },
            { id: 't6', name: 'Fox — Rapid Response', icon: '⚡', color: '#ef4444', lead: 'Sgt. Maj. Tomislav Grubić', members: [] },
        ],
        zones: [
            { id: 'z1', name: 'Port Terminal Perimeter', type: 'surveillance', lat: 45.818, lng: 15.992, radius: 500 },
            { id: 'z2', name: 'Restricted Zone Alpha', type: 'restricted', lat: 45.813, lng: 15.977, radius: 200 },
            { id: 'z3', name: 'Staging Area Bravo', type: 'staging', lat: 45.802, lng: 15.995, radius: 150 },
            { id: 'z4', name: 'Buffer Zone Charlie', type: 'buffer', lat: 45.808, lng: 15.985, radius: 300 },
        ],
        alertRules: [
            { id: 'ar1', type: 'Zone Entry', description: 'Horvat enters Port Terminal', severity: 'critical', enabled: true },
            { id: 'ar2', type: 'Co-location', description: 'Horvat + Mendoza within 50m', severity: 'critical', enabled: true },
            { id: 'ar3', type: 'LPR Match', description: 'ZG-1847-AB at port approaches', severity: 'high', enabled: true },
            { id: 'ar4', type: 'Face Match', description: 'Any target at airport cargo', severity: 'high', enabled: true },
            { id: 'ar5', type: 'Signal Lost', description: 'Any target device dark >30min', severity: 'medium', enabled: true },
            { id: 'ar6', type: 'Speed Alert', description: 'Target vehicle >120km/h', severity: 'medium', enabled: false },
        ],
        timeline: [
            { id: 'tl1', date: '2026-02-15', label: 'Operation initiated — Planning phase', type: 'phase', color: '#3b82f6' },
            { id: 'tl2', date: '2026-02-22', label: 'INTERPOL intel received — Horvat flagged', type: 'intel', color: '#a855f7' },
            { id: 'tl3', date: '2026-03-01', label: 'Preparation phase — devices deployed', type: 'phase', color: '#f59e0b' },
            { id: 'tl4', date: '2026-03-05', label: 'First co-location: Horvat + Mendoza at Savska', type: 'event', color: '#22c55e' },
            { id: 'tl5', date: '2026-03-10', label: 'Active phase — full surveillance activated', type: 'phase', color: '#22c55e' },
            { id: 'tl6', date: '2026-03-15', label: 'Port terminal reconaissance detected', type: 'alert', color: '#ef4444' },
            { id: 'tl7', date: '2026-03-20', label: 'Counter-surveillance behavior — Mendoza', type: 'alert', color: '#ef4444' },
            { id: 'tl8', date: '2026-03-22', label: 'New encrypted comms channel — Hassan', type: 'intel', color: '#a855f7' },
            { id: 'tl9', date: '2026-03-24', label: 'Imminent shipment intel — 72h window', type: 'alert', color: '#ef4444' },
        ],
        checklist: [
            { id: 'ck1', label: 'Deploy GPS trackers on all target vehicles', done: true, assignee: 'Bravo' },
            { id: 'ck2', label: 'Establish camera coverage at port terminal', done: true, assignee: 'Bravo' },
            { id: 'ck3', label: 'IMSI catcher deployment at staging area', done: true, assignee: 'Charlie' },
            { id: 'ck4', label: 'Position mobile LPR at port approaches', done: true, assignee: 'Alpha' },
            { id: 'ck5', label: 'Maritime patrol coordination', done: false, assignee: 'Delta' },
            { id: 'ck6', label: 'Air support on standby confirmation', done: false, assignee: 'Echo' },
            { id: 'ck7', label: 'Rapid response team briefed', done: true, assignee: 'Fox' },
            { id: 'ck8', label: 'Evidence chain documentation prepared', done: false, assignee: 'Alpha' },
        ],
        briefingNotes: 'SITREP 2026-03-24: Intelligence indicates imminent arms shipment through Zagreb port within 72h window. Horvat observed conducting final reconnaissance at port terminal (11th visit in 14 days). Mendoza exhibiting counter-surveillance techniques — recommend switching to passive monitoring. Hassan activated new encrypted comms channel — IMSI correlation pending.\n\nROE: Observe and document only. No interdiction without direct authorization from Op Commander. All teams maintain radio silence on primary channel unless emergency.',
        commsChannel: 'HAWK-NET (encrypted)', commsFreq: 'Ch. 7 / 162.475 MHz',
        riskLevel: 87,
        threatAssessment: 'HIGH — Targets are surveillance-aware. Counter-surveillance detected. Armed response capability suspected. Port area has multiple exit routes including maritime.',
        stats: { events: 847, alerts: 23, hoursActive: 336, intel: 42 },
    },
    {
        id: 'op-2', codename: 'GLACIER', name: 'Operation GLACIER — Financial Network', phase: 'Planning', priority: 'High', classification: 'SECRET',
        description: 'Financial intelligence operation targeting suspected money laundering network through Rashid Holdings and associated shell companies across UAE, Egypt, and Croatia.',
        commander: 'Maj. Petra Novak', startDate: '2026-03-20', endDate: '',
        targetPersonIds: [3, 7], targetOrgIds: [2, 5, 9],
        deployedDeviceIds: [5, 11], trackedVehicleIds: [6],
        teams: [
            { id: 't7', name: 'Alpha — Financial Intel', icon: '💰', color: '#f59e0b', lead: 'Cpt. Marta Galić', members: [] },
            { id: 't8', name: 'Bravo — OSINT', icon: '🌐', color: '#3b82f6', lead: 'Lt. Filip Jurić', members: [] },
        ],
        zones: [{ id: 'z5', name: 'Rashid Holdings Tower', type: 'surveillance', lat: 25.204, lng: 55.270, radius: 300 }],
        alertRules: [{ id: 'ar7', type: 'Transaction Alert', description: 'Wire transfer >€50K from flagged accounts', severity: 'high', enabled: true }],
        timeline: [
            { id: 'tl10', date: '2026-03-20', label: 'Operation initiated — Planning phase', type: 'phase', color: '#3b82f6' },
            { id: 'tl11', date: '2026-03-22', label: 'EU Sanctions cross-reference completed', type: 'intel', color: '#a855f7' },
        ],
        checklist: [
            { id: 'ck9', label: 'Map complete financial network graph', done: false, assignee: 'Alpha' },
            { id: 'ck10', label: 'Obtain AML monitoring access', done: true, assignee: 'Alpha' },
            { id: 'ck11', label: 'OSINT sweep on shell companies', done: false, assignee: 'Bravo' },
        ],
        briefingNotes: 'Initial assessment: Rashid Holdings shows patterns consistent with trade-based money laundering. Over-invoicing detected on 12 cargo shipments between Dubai and Zagreb. Al-Rashid (CEO) has direct communication with Hassan (Falcon Trading). Further investigation required before escalation.',
        commsChannel: 'GLACIER-NET', commsFreq: 'Ch. 12 / 164.200 MHz',
        riskLevel: 45, threatAssessment: 'MEDIUM — Financial targets. Low physical risk. Legal complexity is primary challenge.',
        stats: { events: 124, alerts: 5, hoursActive: 96, intel: 18 },
    },
    {
        id: 'op-3', codename: 'PHOENIX', name: 'Operation PHOENIX — East Asia Corridor', phase: 'Preparation', priority: 'Medium', classification: 'SECRET // NOFORN',
        description: 'Intelligence collection on suspected technology transfer corridor between Shanghai port operations and European intermediaries. Focus on Dragon Tech Solutions and associated logistics.',
        commander: 'Lt. Col. Boris Šimunić', startDate: '2026-03-10', endDate: '',
        targetPersonIds: [10], targetOrgIds: [4],
        deployedDeviceIds: [19], trackedVehicleIds: [],
        teams: [
            { id: 't9', name: 'Alpha — Technical Intel', icon: '🔬', color: '#06b6d4', lead: 'Cpt. Iva Perić', members: [] },
        ],
        zones: [{ id: 'z6', name: 'Shanghai Port Monitoring', type: 'surveillance', lat: 31.230, lng: 121.473, radius: 1000 }],
        alertRules: [],
        timeline: [
            { id: 'tl12', date: '2026-03-10', label: 'Operation initiated', type: 'phase', color: '#3b82f6' },
            { id: 'tl13', date: '2026-03-18', label: 'Camera deployed at Shanghai port', type: 'event', color: '#22c55e' },
        ],
        checklist: [{ id: 'ck12', label: 'Establish Shanghai port camera feed', done: true, assignee: 'Alpha' }, { id: 'ck13', label: 'Maritime AIS monitoring setup', done: false, assignee: 'Alpha' }],
        briefingNotes: 'Preliminary: Dragon Tech Solutions cargo manifests show discrepancies between declared electronics and actual weight/volume. Li Wei (Dragon) visited Zagreb twice in 6 months. Camera deployed but on standby pending legal authorization for active monitoring.',
        commsChannel: 'PHOENIX-NET', commsFreq: 'Ch. 15 / 166.100 MHz',
        riskLevel: 32, threatAssessment: 'LOW — Remote monitoring only. No physical exposure.',
        stats: { events: 38, alerts: 1, hoursActive: 48, intel: 7 },
    },
    {
        id: 'op-4', codename: 'CERBERUS', name: 'Operation CERBERUS — Border Crossing Network', phase: 'Debrief', priority: 'High', classification: 'SECRET',
        description: 'Completed operation focused on irregular border crossing patterns across Croatia-Bosnia and Croatia-Serbia borders. Successfully mapped 3 smuggling routes and identified 7 facilitators.',
        commander: 'Col. Davor Tomić', startDate: '2025-11-01', endDate: '2026-02-28',
        targetPersonIds: [12, 14], targetOrgIds: [],
        deployedDeviceIds: [8, 18], trackedVehicleIds: [3],
        teams: [{ id: 't10', name: 'Alpha — Border Patrol', icon: '🛂', color: '#ef4444', lead: 'Sgt. Karlo Vidić', members: [] }],
        zones: [], alertRules: [], timeline: [
            { id: 'tl14', date: '2025-11-01', label: 'Operation initiated', type: 'phase', color: '#3b82f6' },
            { id: 'tl15', date: '2026-01-15', label: '3 routes mapped, 7 facilitators identified', type: 'intel', color: '#a855f7' },
            { id: 'tl16', date: '2026-02-28', label: 'Operation concluded — Debrief phase', type: 'phase', color: '#a855f7' },
        ],
        checklist: [{ id: 'ck14', label: 'Final report submitted', done: true, assignee: 'Alpha' }, { id: 'ck15', label: 'Evidence package for prosecution', done: true, assignee: 'Alpha' }, { id: 'ck16', label: 'Lessons learned document', done: false, assignee: 'Alpha' }],
        briefingNotes: 'FINAL: Operation concluded successfully. 3 smuggling routes documented. 7 facilitators identified (5 Croatian, 2 Bosnian). Evidence package prepared for state prosecutor. Babić connection to Organization Alpha confirmed. Recommend folding intel into OP HAWK.',
        commsChannel: '—', commsFreq: '—', riskLevel: 15, threatAssessment: 'LOW — Operation concluded.',
        stats: { events: 2341, alerts: 67, hoursActive: 2880, intel: 156 },
    },
    {
        id: 'op-5', codename: 'SHADOW', name: 'Operation SHADOW — Diplomatic Surveillance', phase: 'Closed', priority: 'Critical', classification: 'TOP SECRET // EYES ONLY',
        description: 'Classified diplomatic surveillance operation. Details restricted to EYES ONLY clearance. Operation closed per directive from Ministry of Interior.',
        commander: '[REDACTED]', startDate: '2025-06-01', endDate: '2025-12-15',
        targetPersonIds: [], targetOrgIds: [], deployedDeviceIds: [], trackedVehicleIds: [],
        teams: [], zones: [], alertRules: [], timeline: [
            { id: 'tl17', date: '2025-06-01', label: 'Operation initiated', type: 'phase', color: '#3b82f6' },
            { id: 'tl18', date: '2025-12-15', label: 'Operation closed by directive', type: 'phase', color: '#6b7280' },
        ],
        checklist: [], briefingNotes: '[REDACTED — EYES ONLY clearance required]',
        commsChannel: '[REDACTED]', commsFreq: '[REDACTED]', riskLevel: 0, threatAssessment: '[CLASSIFIED]',
        stats: { events: 0, alerts: 0, hoursActive: 0, intel: 0 },
    },
];

function OperationsIndex() {
    const [selOp, setSelOp] = useState<string>(mockOps[0].id);
    const [tab, setTab] = useState<DetailTab>('overview');
    const [phaseF, setPhaseF] = useState<Phase | 'all'>('all');
    const [search, setSearch] = useState('');

    const op = mockOps.find(o => o.id === selOp) || mockOps[0];
    const filtered = mockOps.filter(o => {
        if (phaseF !== 'all' && o.phase !== phaseF) return false;
        if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.codename.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const targets = op.targetPersonIds.map(id => mockPersons.find(p => p.id === id)).filter(Boolean);
    const targetOrgs = op.targetOrgIds.map(id => mockOrganizations.find(o => o.id === id)).filter(Boolean);
    const devices = op.deployedDeviceIds.map(id => mockDevices.find(d => d.id === id)).filter(Boolean);
    const vehicles = op.trackedVehicleIds.map(id => mockVehicles.find(v => v.id === id)).filter(Boolean);

    const SB = ({ c, n, l }: { c: string; n: number | string; l: string }) => <div style={{ padding: '6px 10px', borderRadius: 6, background: `${c}08`, border: `1px solid ${c}20`, flex: 1, minWidth: 70 }}><div style={{ fontSize: 18, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{n}</div><div style={{ fontSize: 7, color: theme.textDim, marginTop: 1 }}>{l}</div></div>;

    const tabList: { id: DetailTab; label: string; icon: string }[] = [
        { id: 'overview', label: 'Overview', icon: '📋' },
        { id: 'targets', label: 'Targets', icon: '🎯' },
        { id: 'resources', label: 'Resources', icon: '📡' },
        { id: 'teams', label: 'Teams', icon: '👥' },
        { id: 'zones', label: 'Zones', icon: '🗺️' },
        { id: 'alerts', label: 'Alerts', icon: '🚨' },
        { id: 'timeline', label: 'Timeline', icon: '📅' },
        { id: 'briefing', label: 'Briefing', icon: '📝' },
    ];

    return (<>
        <PageMeta title={`Operations — ${op.codename}`} />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* ═══ LEFT: Operation List ═══ */}
            <div style={{ width: 280, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#ef444410', border: '1px solid #ef444425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎯</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text, letterSpacing: '0.04em' }}>OPERATIONS</div><div style={{ fontSize: 7, color: theme.textDim }}>Surveillance Planning Center</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px', marginBottom: 6 }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search operations..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                        {(['all', 'Active', 'Planning', 'Preparation', 'Debrief', 'Closed'] as (Phase | 'all')[]).map(p => <button key={p} onClick={() => setPhaseF(p)} style={{ padding: '2px 6px', borderRadius: 3, border: `1px solid ${phaseF === p ? (p === 'all' ? theme.accent : phaseColors[p as Phase]) + '40' : theme.border}`, background: phaseF === p ? `${p === 'all' ? theme.accent : phaseColors[p as Phase]}08` : 'transparent', color: phaseF === p ? (p === 'all' ? theme.accent : phaseColors[p as Phase]) : theme.textDim, fontSize: 7, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{p === 'all' ? 'All' : p}</button>)}
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {filtered.map(o => {
                        const pc = phaseColors[o.phase]; const sel = o.id === selOp;
                        return <div key={o.id} onClick={() => { setSelOp(o.id); setTab('overview'); }} style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', borderLeft: `3px solid ${sel ? pc : 'transparent'}`, background: sel ? `${pc}06` : 'transparent', transition: 'all 0.1s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <span style={{ fontSize: 7, fontWeight: 800, padding: '1px 5px', borderRadius: 3, background: `${pc}15`, color: pc, letterSpacing: '0.06em' }}>{o.phase.toUpperCase()}</span>
                                <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: `${prioColors[o.priority]}12`, color: prioColors[o.priority] }}>{o.priority}</span>
                                <span style={{ fontSize: 7, color: theme.textDim, marginLeft: 'auto' }}>{o.startDate}</span>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, marginBottom: 2 }}>
                                <span style={{ color: pc, fontFamily: "'JetBrains Mono',monospace" }}>{o.codename}</span>
                            </div>
                            <div style={{ fontSize: 8, color: theme.textDim, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{o.description.slice(0, 120)}</div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 4, fontSize: 7, color: theme.textDim }}>
                                <span>🎯 {o.targetPersonIds.length}</span>
                                <span>📡 {o.deployedDeviceIds.length}</span>
                                <span>🚗 {o.trackedVehicleIds.length}</span>
                                <span>👥 {o.teams.length}</span>
                            </div>
                        </div>;
                    })}
                </div>
                <div style={{ padding: '6px 12px', borderTop: `1px solid ${theme.border}`, fontSize: 7, color: theme.textDim }}>{mockOps.length} operations · {mockOps.filter(o => o.phase === 'Active').length} active</div>
            </div>

            {/* ═══ RIGHT: Detail ═══ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                {/* Header */}
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${phaseColors[op.phase]}10`, border: `1.5px solid ${phaseColors[op.phase]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{phaseIcons[op.phase]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>
                            <span style={{ color: phaseColors[op.phase], fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.04em' }}>{op.codename}</span>
                            <span style={{ fontWeight: 400, color: theme.textDim, fontSize: 11, marginLeft: 8 }}>{op.name.replace(`Operation ${op.codename} — `, '')}</span>
                        </div>
                        <div style={{ fontSize: 8, color: theme.textDim, marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: phaseColors[op.phase] }}>{op.phase}</span>
                            <span>Cmdr: {op.commander}</span>
                            <span>{op.startDate}{op.endDate ? ` → ${op.endDate}` : ' → ongoing'}</span>
                            <span style={{ padding: '1px 5px', borderRadius: 2, background: '#ef444412', color: '#ef4444', fontWeight: 700, fontSize: 7 }}>{op.classification}</span>
                        </div>
                    </div>
                    {/* Risk gauge */}
                    {op.riskLevel > 0 && <div style={{ textAlign: 'center' as const }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `conic-gradient(${op.riskLevel > 70 ? '#ef4444' : op.riskLevel > 40 ? '#f59e0b' : '#22c55e'} ${op.riskLevel * 3.6}deg, ${theme.border}30 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: op.riskLevel > 70 ? '#ef4444' : op.riskLevel > 40 ? '#f59e0b' : '#22c55e', fontFamily: "'JetBrains Mono',monospace" }}>{op.riskLevel}</div>
                        </div>
                        <div style={{ fontSize: 6, color: theme.textDim, marginTop: 1 }}>RISK</div>
                    </div>}
                    {/* Quick links */}
                    <div style={{ display: 'flex', gap: 3 }}>
                        <a href="/map" style={{ fontSize: 7, padding: '4px 8px', borderRadius: 4, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>🗺️ Map</a>
                        <a href="/vision" style={{ fontSize: 7, padding: '4px 8px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontWeight: 600 }}>📹 Vision</a>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ padding: '0 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 0, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {tabList.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 12px', border: 'none', borderBottom: `2px solid ${tab === t.id ? phaseColors[op.phase] : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 9, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' as const }}><span style={{ fontSize: 11 }}>{t.icon}</span>{t.label}</button>)}
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', padding: 16 }}>

                    {/* ═══ OVERVIEW ═══ */}
                    {tab === 'overview' && <>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' as const }}>
                            <SB c="#3b82f6" n={op.stats.events} l="Events" />
                            <SB c="#ef4444" n={op.stats.alerts} l="Alerts" />
                            <SB c="#22c55e" n={`${op.stats.hoursActive}h`} l="Active Time" />
                            <SB c="#a855f7" n={op.stats.intel} l="Intel Reports" />
                        </div>
                        <div style={{ fontSize: 10, color: theme.textSecondary, lineHeight: 1.6, marginBottom: 12, padding: '10px 12px', borderRadius: 6, background: `${theme.border}08`, border: `1px solid ${theme.border}` }}>{op.description}</div>

                        {/* Checklist */}
                        {op.checklist.length > 0 && <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, marginBottom: 6 }}>📋 Operational Checklist <span style={{ fontWeight: 400, color: theme.textDim }}>({op.checklist.filter(c => c.done).length}/{op.checklist.length})</span></div>
                            <div style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                                {op.checklist.map(c => <div key={c.id} style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 9 }}>
                                    <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${c.done ? '#22c55e' : theme.border}`, background: c.done ? '#22c55e15' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#22c55e', flexShrink: 0 }}>{c.done ? '✓' : ''}</div>
                                    <span style={{ color: c.done ? theme.textDim : theme.text, textDecoration: c.done ? 'line-through' : 'none', flex: 1 }}>{c.label}</span>
                                    <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 2, background: `${theme.border}30`, color: theme.textDim }}>{c.assignee}</span>
                                </div>)}
                            </div>
                        </div>}

                        {/* Threat assessment */}
                        {op.threatAssessment && op.threatAssessment !== '[CLASSIFIED]' && <div style={{ padding: '10px 12px', borderRadius: 6, background: op.riskLevel > 70 ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)', border: `1px solid ${op.riskLevel > 70 ? '#ef4444' : '#f59e0b'}15` }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: op.riskLevel > 70 ? '#ef4444' : '#f59e0b', marginBottom: 4 }}>⚠️ Threat Assessment</div>
                            <div style={{ fontSize: 9, color: theme.textSecondary, lineHeight: 1.5 }}>{op.threatAssessment}</div>
                        </div>}
                    </>}

                    {/* ═══ TARGETS ═══ */}
                    {tab === 'targets' && <>
                        {targets.length > 0 && <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, marginBottom: 6 }}>🎯 Target Persons ({targets.length})</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                                {targets.map(p => { if (!p) return null; const rc = p.risk === 'Critical' ? '#ef4444' : p.risk === 'High' ? '#f97316' : '#f59e0b';
                                    return <div key={p.id} style={{ padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <img src={p.avatar || undefined} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', border: `1.5px solid ${rc}40` }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{p.firstName} {p.lastName} <span style={{ color: theme.textDim, fontWeight: 400 }}>"{p.nickname}"</span></div>
                                            <div style={{ fontSize: 8, color: theme.textDim }}>{p.nationality} · <span style={{ color: rc, fontWeight: 600 }}>{p.risk}</span></div>
                                        </div>
                                        <a href={`/persons/${p.id}`} style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>View</a>
                                    </div>; })}
                            </div>
                        </div>}
                        {targetOrgs.length > 0 && <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, marginBottom: 6 }}>🏢 Target Organizations ({targetOrgs.length})</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                                {targetOrgs.map(o => { if (!o) return null; const rc = o.risk === 'Critical' ? '#ef4444' : o.risk === 'High' ? '#f97316' : '#f59e0b';
                                    return <div key={o.id} style={{ padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 6, background: `${rc}10`, border: `1px solid ${rc}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏢</div>
                                        <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{o.name}</div><div style={{ fontSize: 8, color: theme.textDim }}>{o.country} · <span style={{ color: rc, fontWeight: 600 }}>{o.risk}</span></div></div>
                                        <a href={`/organizations/${o.id}`} style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>View</a>
                                    </div>; })}
                            </div>
                        </div>}
                        {targets.length === 0 && targetOrgs.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim, fontSize: 11 }}>{op.phase === 'Closed' ? '🔒 Target data restricted' : 'No targets assigned'}</div>}
                    </>}

                    {/* ═══ RESOURCES ═══ */}
                    {tab === 'resources' && <>
                        {devices.length > 0 && <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, marginBottom: 6 }}>📡 Deployed Devices ({devices.length})</div>
                            <div style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                                {devices.map(d => { if (!d) return null; const stc = d.status === 'Online' ? '#22c55e' : '#ef4444';
                                    return <div key={d.id} style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 14 }}>{deviceTypeIcons[d.type as keyof typeof deviceTypeIcons] || '📡'}</span>
                                        <div style={{ flex: 1 }}><div style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{d.name}</div><div style={{ fontSize: 7, color: theme.textDim }}>{d.type} · {d.manufacturer} · {d.locationName.split(',')[0]}</div></div>
                                        <span style={{ fontSize: 7, fontWeight: 700, color: stc }}>{d.status}</span>
                                        <a href={`/devices/${d.id}`} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>Detail</a>
                                    </div>; })}
                            </div>
                        </div>}
                        {vehicles.length > 0 && <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, marginBottom: 6 }}>🚗 Tracked Vehicles ({vehicles.length})</div>
                            <div style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                                {vehicles.map(v => { if (!v) return null;
                                    return <div key={v.id} style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 14 }}>🚗</span>
                                        <div style={{ flex: 1 }}><div style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{v.plate} — {v.make} {v.model}</div><div style={{ fontSize: 7, color: theme.textDim }}>{v.year} · {v.color}</div></div>
                                        <a href={`/vehicles/${v.id}`} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>Detail</a>
                                    </div>; })}
                            </div>
                        </div>}
                    </>}

                    {/* ═══ TEAMS ═══ */}
                    {tab === 'teams' && <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8 }}>
                            {op.teams.map(t => <div key={t.id} style={{ padding: '12px', borderRadius: 8, border: `1px solid ${t.color}20`, background: `${t.color}04` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 6, background: `${t.color}15`, border: `1px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{t.icon}</div>
                                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{t.name}</div><div style={{ fontSize: 8, color: theme.textDim }}>Lead: {t.lead}</div></div>
                                </div>
                                {t.members.length > 0 && <div style={{ borderTop: `1px solid ${t.color}15`, paddingTop: 6 }}>
                                    {t.members.map(m => { const p = mockPersons.find(pp => pp.id === m.personId);
                                        return <div key={m.personId} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 8 }}>
                                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${t.color}15`, color: t.color, fontWeight: 700 }}>{m.callsign}</span>
                                            <span style={{ color: theme.text }}>{p ? `${p.firstName} ${p.lastName}` : `Person #${m.personId}`}</span>
                                            <span style={{ color: theme.textDim, marginLeft: 'auto' }}>{m.role}</span>
                                        </div>; })}
                                </div>}
                            </div>)}
                        </div>
                        {op.teams.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim }}>No teams assigned</div>}
                    </>}

                    {/* ═══ ZONES ═══ */}
                    {tab === 'zones' && <>
                        {op.zones.length > 0 ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                            {op.zones.map(z => { const ztc = z.type === 'restricted' ? '#ef4444' : z.type === 'staging' ? '#f59e0b' : z.type === 'buffer' ? '#06b6d4' : '#22c55e';
                                return <div key={z.id} style={{ padding: '12px', borderRadius: 8, border: `1px solid ${ztc}20`, background: `${ztc}04` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: ztc }} />
                                        <span style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{z.name}</span>
                                    </div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>Type: <span style={{ color: ztc, fontWeight: 600 }}>{z.type}</span></div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>Center: {z.lat.toFixed(3)}, {z.lng.toFixed(3)}</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>Radius: {z.radius}m</div>
                                    <a href="/map" style={{ fontSize: 7, color: theme.accent, textDecoration: 'none', display: 'inline-block', marginTop: 4 }}>🗺️ View on Map</a>
                                </div>; })}
                        </div> : <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim }}>No zones defined</div>}
                    </>}

                    {/* ═══ ALERTS ═══ */}
                    {tab === 'alerts' && <>
                        {op.alertRules.length > 0 ? <div style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            {op.alertRules.map(a => { const ac = a.severity === 'critical' ? '#ef4444' : a.severity === 'high' ? '#f97316' : '#f59e0b';
                                return <div key={a.id} style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 8, opacity: a.enabled ? 1 : 0.4 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.enabled ? ac : theme.textDim }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{a.type}</div>
                                        <div style={{ fontSize: 8, color: theme.textDim }}>{a.description}</div>
                                    </div>
                                    <span style={{ fontSize: 7, fontWeight: 700, color: ac, padding: '1px 5px', borderRadius: 2, background: `${ac}10` }}>{a.severity}</span>
                                    <span style={{ fontSize: 7, color: a.enabled ? '#22c55e' : theme.textDim }}>{a.enabled ? 'ACTIVE' : 'OFF'}</span>
                                </div>; })}
                        </div> : <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim }}>No alert rules configured</div>}
                    </>}

                    {/* ═══ TIMELINE ═══ */}
                    {tab === 'timeline' && <>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 0, paddingLeft: 16 }}>
                            {op.timeline.map((e, i) => <div key={e.id} style={{ display: 'flex', gap: 12, position: 'relative' as const, paddingBottom: 16 }}>
                                {/* Connector line */}
                                {i < op.timeline.length - 1 && <div style={{ position: 'absolute' as const, left: 5, top: 14, bottom: -2, width: 2, background: `linear-gradient(${e.color}40, ${op.timeline[i + 1]?.color || theme.border}40)` }} />}
                                {/* Dot */}
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: `${e.color}20`, border: `2px solid ${e.color}`, flexShrink: 0, marginTop: 2, zIndex: 1 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 8, fontWeight: 700, color: e.color, fontFamily: "'JetBrains Mono',monospace" }}>{e.date}</div>
                                    <div style={{ fontSize: 10, color: theme.text, marginTop: 2 }}>{e.label}</div>
                                    <span style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${e.color}10`, color: e.color, fontWeight: 600 }}>{e.type}</span>
                                </div>
                            </div>)}
                        </div>
                        {op.timeline.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim }}>No timeline events</div>}
                    </>}

                    {/* ═══ BRIEFING ═══ */}
                    {tab === 'briefing' && <>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                            <div style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}` }}>
                                <div style={{ fontSize: 8, color: theme.textDim, marginBottom: 2 }}>Comms Channel</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{op.commsChannel}</div>
                            </div>
                            <div style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}` }}>
                                <div style={{ fontSize: 8, color: theme.textDim, marginBottom: 2 }}>Frequency</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{op.commsFreq}</div>
                            </div>
                        </div>
                        <div style={{ padding: '12px 14px', borderRadius: 6, background: `${theme.border}08`, border: `1px solid ${theme.border}` }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: theme.text, marginBottom: 6 }}>📝 Briefing Notes</div>
                            <div style={{ fontSize: 10, color: theme.textSecondary, lineHeight: 1.7, whiteSpace: 'pre-wrap' as const }}>{op.briefingNotes}</div>
                        </div>
                        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: '#ef444406', border: '1px solid #ef444415', fontSize: 8, color: '#ef4444', fontWeight: 700, textAlign: 'center' as const }}>
                            ARGUX Surveillance Platform — {op.classification} — {op.codename}
                        </div>
                    </>}
                </div>
            </div>
        </div>
    </>);
}

OperationsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default OperationsIndex;
