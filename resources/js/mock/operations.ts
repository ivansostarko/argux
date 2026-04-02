/**
 * ARGUX — Operations Mock Data
 * 5 operations with teams, zones, alerts, timeline, checklist, briefing
 */
export type Phase = 'Planning' | 'Preparation' | 'Active' | 'Debrief' | 'Closed';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type DetailTab = 'overview' | 'targets' | 'resources' | 'teams' | 'zones' | 'alerts' | 'events' | 'timeline' | 'briefing';

export interface TeamMember { personId: number; role: string; callsign: string; }
export interface Team { id: string; name: string; icon: string; color: string; lead: string; members: TeamMember[]; }
export interface OpZone { id: string; name: string; type: 'surveillance' | 'restricted' | 'staging' | 'buffer'; lat: number; lng: number; radius: number; }
export interface AlertRule { id: string; type: string; description: string; severity: 'critical' | 'high' | 'medium'; enabled: boolean; }
export interface TimelineEvent { id: string; date: string; label: string; type: 'phase' | 'event' | 'intel' | 'alert'; color: string; }
export interface Checklist { id: string; label: string; done: boolean; assignee: string; }
export interface Operation {
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

export const phaseColors: Record<Phase, string> = { Planning: '#3b82f6', Preparation: '#f59e0b', Active: '#22c55e', Debrief: '#a855f7', Closed: '#6b7280' };
export const phaseIcons: Record<Phase, string> = { Planning: '📋', Preparation: '🔧', Active: '🟢', Debrief: '📊', Closed: '🔒' };
export const prioColors: Record<Priority, string> = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#22c55e' };
export const allPhases: Phase[] = ['Planning', 'Preparation', 'Active', 'Debrief', 'Closed'];

export const tabList: { id: DetailTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📋' }, { id: 'targets', label: 'Targets', icon: '🎯' },
    { id: 'resources', label: 'Resources', icon: '📡' }, { id: 'teams', label: 'Teams', icon: '👥' },
    { id: 'zones', label: 'Zones', icon: '🗺️' }, { id: 'alerts', label: 'Alerts', icon: '🚨' },
    { id: 'events', label: 'Events', icon: '📊' },
    { id: 'timeline', label: 'Timeline', icon: '📅' }, { id: 'briefing', label: 'Briefing', icon: '📝' },
];

export interface OpEvent { id: string; type: 'surveillance' | 'alert' | 'intel' | 'comm' | 'movement' | 'system'; title: string; description: string; personName: string; timestamp: string; severity: 'critical' | 'high' | 'medium' | 'low' | 'info'; source: string; }

export const globalZonePool: OpZone[] = [
    { id: 'gz1', name: 'Port Terminal Perimeter', type: 'surveillance', lat: 45.818, lng: 15.992, radius: 500 },
    { id: 'gz2', name: 'Restricted Zone Alpha', type: 'restricted', lat: 45.813, lng: 15.977, radius: 200 },
    { id: 'gz3', name: 'Staging Area Bravo', type: 'staging', lat: 45.802, lng: 15.995, radius: 150 },
    { id: 'gz4', name: 'Buffer Zone Charlie', type: 'buffer', lat: 45.808, lng: 15.985, radius: 300 },
    { id: 'gz5', name: 'Airport Cargo Terminal', type: 'surveillance', lat: 45.742, lng: 16.069, radius: 400 },
    { id: 'gz6', name: 'Train Station Area', type: 'surveillance', lat: 45.804, lng: 15.979, radius: 250 },
    { id: 'gz7', name: 'Restricted Zone Bravo', type: 'restricted', lat: 45.830, lng: 16.010, radius: 180 },
    { id: 'gz8', name: 'Safehouse Perimeter', type: 'buffer', lat: 45.795, lng: 15.960, radius: 100 },
    { id: 'gz9', name: 'Border Checkpoint Delta', type: 'restricted', lat: 45.850, lng: 16.050, radius: 350 },
    { id: 'gz10', name: 'Marina Surveillance', type: 'surveillance', lat: 45.810, lng: 15.955, radius: 220 },
];

export const globalAlertPool: AlertRule[] = [
    { id: 'ga1', type: 'Zone Entry', description: 'Target enters monitored zone', severity: 'critical', enabled: true },
    { id: 'ga2', type: 'Zone Exit', description: 'Target exits containment zone', severity: 'high', enabled: true },
    { id: 'ga3', type: 'Co-location', description: 'Two targets within 50m', severity: 'critical', enabled: true },
    { id: 'ga4', type: 'Face Match', description: 'Face recognition match at camera', severity: 'high', enabled: true },
    { id: 'ga5', type: 'LPR Match', description: 'License plate detected at checkpoint', severity: 'high', enabled: true },
    { id: 'ga6', type: 'Signal Lost', description: 'Device signal lost >30 minutes', severity: 'medium', enabled: true },
    { id: 'ga7', type: 'Speed Alert', description: 'Vehicle exceeds speed threshold', severity: 'medium', enabled: true },
    { id: 'ga8', type: 'Co-location', description: 'Multiple targets at same location', severity: 'critical', enabled: true },
    { id: 'ga9', type: 'Face Match', description: 'Unknown face at restricted area', severity: 'high', enabled: true },
    { id: 'ga10', type: 'Zone Entry', description: 'Any person enters restricted perimeter', severity: 'critical', enabled: true },
];

export const mockOpEvents: Record<string, OpEvent[]> = {
    'op-1': [
        { id: 'ev1', type: 'surveillance', title: 'Horvat arrived at Port Terminal', description: 'Subject entered surveillance zone via Gate 3. Duration: 47 min.', personName: 'Marko Horvat', timestamp: '2026-03-24 14:32', severity: 'critical', source: 'Camera Network' },
        { id: 'ev2', type: 'alert', title: 'Co-location: Horvat + Mendoza', description: 'Two subjects within 30m at warehouse B7.', personName: 'Horvat / Mendoza', timestamp: '2026-03-24 14:45', severity: 'critical', source: 'GPS Tracker' },
        { id: 'ev3', type: 'movement', title: 'Vehicle ZG-1847-AB at port approach', description: 'LPR capture at Checkpoint Alpha. Speed: 42 km/h.', personName: 'Mendoza', timestamp: '2026-03-24 13:55', severity: 'high', source: 'LPR Reader' },
        { id: 'ev4', type: 'intel', title: 'Intercepted encrypted communication', description: 'New encryption protocol detected on Horvat device.', personName: 'Horvat', timestamp: '2026-03-24 11:20', severity: 'high', source: 'SIGINT' },
        { id: 'ev5', type: 'system', title: 'Camera #14 offline', description: 'Port Terminal north camera lost connection.', personName: 'System', timestamp: '2026-03-24 10:05', severity: 'medium', source: 'Device Monitor' },
        { id: 'ev6', type: 'surveillance', title: 'Babić counter-surveillance detected', description: 'Subject performed 3 U-turns in 10 min — SDR pattern.', personName: 'Babić', timestamp: '2026-03-23 22:15', severity: 'high', source: 'Mobile Tracker' },
        { id: 'ev7', type: 'comm', title: 'Hassan new phone detected', description: 'New IMSI registered on network near staging area.', personName: 'Hassan', timestamp: '2026-03-23 18:30', severity: 'medium', source: 'IMSI Catcher' },
        { id: 'ev8', type: 'alert', title: 'Zone breach: Restricted Alpha', description: 'Unknown vehicle entered restricted zone at 03:12.', personName: 'Unknown', timestamp: '2026-03-23 03:12', severity: 'critical', source: 'Geofence' },
    ],
    'op-2': [
        { id: 'ev20', type: 'intel', title: 'Suspicious transaction flagged', description: '€87,000 wire from Rashid Holdings to shell company.', personName: 'Al-Rashid', timestamp: '2026-03-22 09:45', severity: 'high', source: 'Bank Monitor' },
        { id: 'ev21', type: 'system', title: 'EU Sanctions cross-reference complete', description: '3 new matches found against CFSP list.', personName: 'System', timestamp: '2026-03-21 16:30', severity: 'medium', source: 'Sanctions DB' },
    ],
    'op-3': [
        { id: 'ev30', type: 'surveillance', title: 'Li Wei cargo inspection', description: 'Subject inspected container #MSKU-4721 at Shanghai port.', personName: 'Li Wei', timestamp: '2026-03-18 08:20', severity: 'medium', source: 'Camera' },
    ],
    'op-4': [
        { id: 'ev40', type: 'intel', title: 'Route #3 mapped', description: 'Border crossing route through Bapska identified.', personName: 'Babić', timestamp: '2026-01-28 15:40', severity: 'high', source: 'Ground Team' },
    ],
};

export const mockOps: Operation[] = [
    { id: 'op-1', codename: 'HAWK', name: 'Operation HAWK — Zagreb Port Network', phase: 'Active', priority: 'Critical', classification: 'TOP SECRET // NOFORN',
      description: 'Multi-phase surveillance targeting suspected arms trafficking through Zagreb port. Primary targets: Horvat, Mendoza, Babić. Imminent shipment within 72 hours.',
      commander: 'Col. Davor Tomić', startDate: '2026-02-15', endDate: '',
      targetPersonIds: [1, 9, 12, 7, 3], targetOrgIds: [1, 2, 5],
      deployedDeviceIds: [1, 2, 5, 8, 14, 17, 18], trackedVehicleIds: [1, 3, 5, 8],
      teams: [
          { id: 't1', name: 'Alpha — Ground Surveillance', icon: '🏃', color: '#3b82f6', lead: 'Cpt. Nina Horvat', members: [{ personId: 1, role: 'Primary Target', callsign: 'HAWK-1' }, { personId: 12, role: 'Secondary Target', callsign: 'HAWK-2' }] },
          { id: 't2', name: 'Bravo — Technical', icon: '📡', color: '#22c55e', lead: 'Lt. Marko Petrić', members: [{ personId: 9, role: 'Target', callsign: 'LOBO' }] },
          { id: 't3', name: 'Charlie — SIGINT', icon: '🛰️', color: '#a855f7', lead: 'Sgt. Ana Matić', members: [{ personId: 7, role: 'Target', callsign: 'FALCON' }] },
          { id: 't4', name: 'Delta — Maritime', icon: '🚢', color: '#06b6d4', lead: 'Lt. Cmdr. Škugor', members: [] },
          { id: 't5', name: 'Echo — Air Support', icon: '🚁', color: '#f59e0b', lead: 'Cpt. Vlahović', members: [] },
          { id: 't6', name: 'Fox — Rapid Response', icon: '⚡', color: '#ef4444', lead: 'Sgt. Maj. Grubić', members: [] },
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
      ],
      timeline: [
          { id: 'tl1', date: '2026-02-15', label: 'Operation initiated — Planning', type: 'phase', color: '#3b82f6' },
          { id: 'tl3', date: '2026-03-01', label: 'Preparation — devices deployed', type: 'phase', color: '#f59e0b' },
          { id: 'tl5', date: '2026-03-10', label: 'Active phase — full surveillance', type: 'phase', color: '#22c55e' },
          { id: 'tl6', date: '2026-03-15', label: 'Port terminal recon detected', type: 'alert', color: '#ef4444' },
          { id: 'tl7', date: '2026-03-20', label: 'Counter-surveillance — Mendoza', type: 'alert', color: '#ef4444' },
          { id: 'tl9', date: '2026-03-24', label: 'Imminent shipment — 72h window', type: 'alert', color: '#ef4444' },
      ],
      checklist: [
          { id: 'ck1', label: 'Deploy GPS trackers on all target vehicles', done: true, assignee: 'Bravo' },
          { id: 'ck2', label: 'Establish camera coverage at port', done: true, assignee: 'Bravo' },
          { id: 'ck3', label: 'IMSI catcher deployment at staging area', done: true, assignee: 'Charlie' },
          { id: 'ck5', label: 'Maritime patrol coordination', done: false, assignee: 'Delta' },
          { id: 'ck6', label: 'Air support on standby', done: false, assignee: 'Echo' },
          { id: 'ck7', label: 'Rapid response team briefed', done: true, assignee: 'Fox' },
          { id: 'ck8', label: 'Evidence chain documentation', done: false, assignee: 'Alpha' },
      ],
      briefingNotes: 'SITREP 2026-03-24: Imminent arms shipment through Zagreb port within 72h. Horvat conducting final recon (11th visit in 14 days). Mendoza counter-surveillance detected. Hassan new encrypted comms.\n\nROE: Observe and document only. No interdiction without Commander authorization.',
      commsChannel: 'HAWK-NET (encrypted)', commsFreq: 'Ch. 7 / 162.475 MHz',
      riskLevel: 87, threatAssessment: 'HIGH — Surveillance-aware targets. Counter-surveillance detected. Armed response capability suspected.',
      stats: { events: 847, alerts: 23, hoursActive: 336, intel: 42 } },
    { id: 'op-2', codename: 'GLACIER', name: 'Operation GLACIER — Financial Network', phase: 'Planning', priority: 'High', classification: 'SECRET',
      description: 'Financial intelligence on suspected money laundering through Rashid Holdings and shell companies across UAE, Egypt, Croatia.',
      commander: 'Maj. Petra Novak', startDate: '2026-03-20', endDate: '',
      targetPersonIds: [3, 7], targetOrgIds: [2, 5, 9],
      deployedDeviceIds: [5, 11], trackedVehicleIds: [6],
      teams: [{ id: 't7', name: 'Alpha — Financial Intel', icon: '💰', color: '#f59e0b', lead: 'Cpt. Galić', members: [] }, { id: 't8', name: 'Bravo — OSINT', icon: '🌐', color: '#3b82f6', lead: 'Lt. Jurić', members: [] }],
      zones: [{ id: 'z5', name: 'Rashid Holdings Tower', type: 'surveillance', lat: 25.204, lng: 55.270, radius: 300 }],
      alertRules: [{ id: 'ar7', type: 'Transaction Alert', description: '>€50K from flagged accounts', severity: 'high', enabled: true }],
      timeline: [{ id: 'tl10', date: '2026-03-20', label: 'Operation initiated', type: 'phase', color: '#3b82f6' }, { id: 'tl11', date: '2026-03-22', label: 'EU Sanctions cross-ref done', type: 'intel', color: '#a855f7' }],
      checklist: [{ id: 'ck9', label: 'Map financial network graph', done: false, assignee: 'Alpha' }, { id: 'ck10', label: 'AML monitoring access', done: true, assignee: 'Alpha' }],
      briefingNotes: 'Rashid Holdings: trade-based laundering patterns. Over-invoicing on 12 cargo shipments. Investigation needed before escalation.',
      commsChannel: 'GLACIER-NET', commsFreq: 'Ch. 12 / 164.200 MHz',
      riskLevel: 45, threatAssessment: 'MEDIUM — Financial targets. Low physical risk.',
      stats: { events: 124, alerts: 5, hoursActive: 96, intel: 18 } },
    { id: 'op-3', codename: 'PHOENIX', name: 'Operation PHOENIX — East Asia Corridor', phase: 'Preparation', priority: 'Medium', classification: 'SECRET // NOFORN',
      description: 'Intelligence collection on suspected tech transfer corridor between Shanghai and European intermediaries via Dragon Tech Solutions.',
      commander: 'Lt. Col. Šimunić', startDate: '2026-03-10', endDate: '',
      targetPersonIds: [10], targetOrgIds: [4],
      deployedDeviceIds: [19], trackedVehicleIds: [],
      teams: [{ id: 't9', name: 'Alpha — Technical Intel', icon: '🔬', color: '#06b6d4', lead: 'Cpt. Perić', members: [] }],
      zones: [{ id: 'z6', name: 'Shanghai Port', type: 'surveillance', lat: 31.230, lng: 121.473, radius: 1000 }],
      alertRules: [], timeline: [{ id: 'tl12', date: '2026-03-10', label: 'Operation initiated', type: 'phase', color: '#3b82f6' }],
      checklist: [{ id: 'ck12', label: 'Shanghai camera feed', done: true, assignee: 'Alpha' }, { id: 'ck13', label: 'Maritime AIS setup', done: false, assignee: 'Alpha' }],
      briefingNotes: 'Dragon Tech cargo manifests show discrepancies. Li Wei visited Zagreb twice. Camera on standby pending legal auth.',
      commsChannel: 'PHOENIX-NET', commsFreq: 'Ch. 15 / 166.100 MHz',
      riskLevel: 32, threatAssessment: 'LOW — Remote monitoring only.',
      stats: { events: 38, alerts: 1, hoursActive: 48, intel: 7 } },
    { id: 'op-4', codename: 'CERBERUS', name: 'Operation CERBERUS — Border Crossing', phase: 'Debrief', priority: 'High', classification: 'SECRET',
      description: 'Completed operation: irregular border crossings Croatia-Bosnia/Serbia. Mapped 3 routes, identified 7 facilitators.',
      commander: 'Col. Davor Tomić', startDate: '2025-11-01', endDate: '2026-02-28',
      targetPersonIds: [12], targetOrgIds: [],
      deployedDeviceIds: [8, 18], trackedVehicleIds: [3],
      teams: [{ id: 't10', name: 'Alpha — Border Patrol', icon: '🛂', color: '#ef4444', lead: 'Sgt. Vidić', members: [] }],
      zones: [], alertRules: [],
      timeline: [{ id: 'tl14', date: '2025-11-01', label: 'Operation initiated', type: 'phase', color: '#3b82f6' }, { id: 'tl15', date: '2026-01-15', label: '3 routes, 7 facilitators', type: 'intel', color: '#a855f7' }, { id: 'tl16', date: '2026-02-28', label: 'Concluded — Debrief', type: 'phase', color: '#a855f7' }],
      checklist: [{ id: 'ck14', label: 'Final report', done: true, assignee: 'Alpha' }, { id: 'ck15', label: 'Evidence package', done: true, assignee: 'Alpha' }, { id: 'ck16', label: 'Lessons learned', done: false, assignee: 'Alpha' }],
      briefingNotes: 'FINAL: 3 smuggling routes documented. 7 facilitators identified. Evidence package for prosecutor. Babić connection confirmed. Intel folded into HAWK.',
      commsChannel: '—', commsFreq: '—', riskLevel: 15, threatAssessment: 'LOW — Concluded.',
      stats: { events: 2341, alerts: 67, hoursActive: 2880, intel: 156 } },
    { id: 'op-5', codename: 'SHADOW', name: 'Operation SHADOW — Diplomatic', phase: 'Closed', priority: 'Critical', classification: 'TOP SECRET // EYES ONLY',
      description: 'Classified diplomatic surveillance. Details EYES ONLY. Closed per Ministry of Interior directive.',
      commander: '[REDACTED]', startDate: '2025-06-01', endDate: '2025-12-15',
      targetPersonIds: [], targetOrgIds: [], deployedDeviceIds: [], trackedVehicleIds: [],
      teams: [], zones: [], alertRules: [],
      timeline: [{ id: 'tl17', date: '2025-06-01', label: 'Initiated', type: 'phase', color: '#3b82f6' }, { id: 'tl18', date: '2025-12-15', label: 'Closed by directive', type: 'phase', color: '#6b7280' }],
      checklist: [], briefingNotes: '[REDACTED — EYES ONLY]',
      commsChannel: '[REDACTED]', commsFreq: '[REDACTED]', riskLevel: 0, threatAssessment: '[CLASSIFIED]',
      stats: { events: 0, alerts: 0, hoursActive: 0, intel: 0 } },
];

export const keyboardShortcuts = [
    { key: 'N', description: 'New Operation' }, { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters' }, { key: 'Esc', description: 'Close / deselect' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
