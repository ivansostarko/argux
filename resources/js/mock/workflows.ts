/**
 * ARGUX — Workflows Mock Data
 * 9 workflows, 6 templates, kanban columns, trigger/action types, shortcuts
 */
export type WfStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Archived';
export type TriggerType = 'zone_entry' | 'zone_exit' | 'colocation' | 'face_match' | 'lpr_match' | 'signal_lost' | 'speed_alert' | 'keyword' | 'schedule' | 'manual';
export type ActionType = 'alert' | 'assign' | 'escalate' | 'ai_analysis' | 'record' | 'notify' | 'deploy_device' | 'generate_report';
export type ViewTab = 'kanban' | 'list' | 'templates';

export interface Trigger { id: string; type: TriggerType; label: string; config: string; icon: string; }
export interface Action { id: string; type: ActionType; label: string; config: string; icon: string; }
export interface ExecLog { id: string; ts: string; status: 'success' | 'failed' | 'running'; duration: string; triggeredBy: string; output: string; }
export interface Workflow {
    id: string; name: string; description: string; status: WfStatus; priority: 'Critical' | 'High' | 'Medium' | 'Low';
    operationId: string; operationName: string;
    triggers: Trigger[]; actions: Action[];
    linkedPersonIds: number[]; linkedPersonNames: string[];
    execCount: number; lastRun: string; successRate: number;
    execLog: ExecLog[];
    createdAt: string; updatedAt: string; createdBy: string;
}
export interface Template { id: string; name: string; description: string; icon: string; category: string; triggers: Trigger[]; actions: Action[]; }

export const statusColors: Record<WfStatus, string> = { Draft: '#6b7280', Active: '#22c55e', Paused: '#f59e0b', Completed: '#3b82f6', Archived: '#64748b' };
export const statusIcons: Record<WfStatus, string> = { Draft: '📝', Active: '🟢', Paused: '⏸️', Completed: '✅', Archived: '📦' };
export const prioColors: Record<string, string> = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#22c55e' };
export const triggerIcons: Record<TriggerType, string> = { zone_entry: '🛡️', zone_exit: '🚪', colocation: '🔗', face_match: '🧑', lpr_match: '🚗', signal_lost: '📵', speed_alert: '🏎️', keyword: '🔤', schedule: '⏰', manual: '👆' };
export const actionIcons: Record<ActionType, string> = { alert: '🚨', assign: '👤', escalate: '📢', ai_analysis: '🤖', record: '📝', notify: '🔔', deploy_device: '📡', generate_report: '📊' };

export const kanbanCols: { status: WfStatus; label: string }[] = [
    { status: 'Draft', label: 'Draft' }, { status: 'Active', label: 'Active' }, { status: 'Paused', label: 'Paused' }, { status: 'Completed', label: 'Completed' }, { status: 'Archived', label: 'Archived' },
];

export const allTriggerTypes: { type: TriggerType; label: string }[] = [
    { type: 'zone_entry', label: 'Zone Entry' }, { type: 'zone_exit', label: 'Zone Exit' }, { type: 'colocation', label: 'Co-location' },
    { type: 'face_match', label: 'Face Match' }, { type: 'lpr_match', label: 'LPR Match' }, { type: 'signal_lost', label: 'Signal Lost' },
    { type: 'speed_alert', label: 'Speed Alert' }, { type: 'keyword', label: 'Keyword' }, { type: 'schedule', label: 'Schedule' }, { type: 'manual', label: 'Manual' },
];
export const allActionTypes: { type: ActionType; label: string }[] = [
    { type: 'alert', label: 'Send Alert' }, { type: 'assign', label: 'Assign Team' }, { type: 'escalate', label: 'Escalate' },
    { type: 'ai_analysis', label: 'AI Analysis' }, { type: 'record', label: 'Create Record' }, { type: 'notify', label: 'Notify' },
    { type: 'deploy_device', label: 'Deploy Device' }, { type: 'generate_report', label: 'Generate Report' },
];

export const mockWorkflows: Workflow[] = [
    { id: 'wf-1', name: 'Port Terminal Intrusion Detection', description: 'Triggers when HAWK target enters port restricted zone. Auto-deploys cameras and alerts ground team.', status: 'Active', priority: 'Critical', operationId: 'op-1', operationName: 'OP HAWK',
      triggers: [{ id: 'tr1', type: 'zone_entry', label: 'Zone Entry — Port Terminal', config: 'Zone: Port Terminal | Subjects: Horvat, Mendoza, Babić, Hassan', icon: '🛡️' }, { id: 'tr2', type: 'face_match', label: 'Face Match at Port Cameras', config: 'Cameras: Port, Airport | Confidence: >85%', icon: '🧑' }],
      actions: [{ id: 'ac1', type: 'alert', label: 'Critical Alert', config: 'Channel: In-App + SMS', icon: '🚨' }, { id: 'ac2', type: 'deploy_device', label: 'Activate Cameras', config: 'CAM-05, CAM-14 | High-res', icon: '📡' }, { id: 'ac3', type: 'ai_analysis', label: 'Anomaly Detection', config: 'LLaMA 3.1 | 24h context', icon: '🤖' }, { id: 'ac4', type: 'generate_report', label: 'Incident Report', config: 'GPS trail + face captures', icon: '📊' }],
      linkedPersonIds: [1, 9, 12, 7], linkedPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan'],
      execCount: 23, lastRun: '2026-03-24 09:48', successRate: 96,
      execLog: [{ id: 'ex1', ts: '2026-03-24 09:48', status: 'success', duration: '2.3s', triggeredBy: 'Zone Entry — Horvat at port', output: 'Alert sent. CAM-05 activated. Report generated.' }, { id: 'ex2', ts: '2026-03-24 06:42', status: 'success', duration: '1.8s', triggeredBy: 'Face Match — Horvat at CAM-07 (94%)', output: 'Alert dispatched. Recording started.' }, { id: 'ex4', ts: '2026-03-23 18:15', status: 'failed', duration: '8.2s', triggeredBy: 'Face Match — Unknown at CAM-14', output: 'Error: Confidence below threshold (72%).' }],
      createdAt: '2026-03-01', updatedAt: '2026-03-24', createdBy: 'Col. Tomić' },
    { id: 'wf-2', name: 'Horvat-Mendoza Co-location Monitor', description: 'Detects when Horvat and Mendoza are within 50m. Captures evidence and escalates.', status: 'Active', priority: 'Critical', operationId: 'op-1', operationName: 'OP HAWK',
      triggers: [{ id: 'tr3', type: 'colocation', label: 'Co-location Detection', config: 'Subject A: Horvat | Subject B: Mendoza | Radius: 50m', icon: '🔗' }],
      actions: [{ id: 'ac5', type: 'alert', label: 'Critical Alert', config: 'All channels', icon: '🚨' }, { id: 'ac6', type: 'record', label: 'Evidence Record', config: 'GPS trails + camera stills', icon: '📝' }, { id: 'ac7', type: 'escalate', label: 'Escalate to Commander', config: 'Col. Tomić + map + timeline', icon: '📢' }],
      linkedPersonIds: [1, 9], linkedPersonNames: ['Marko Horvat', 'Carlos Mendoza'],
      execCount: 8, lastRun: '2026-03-24 09:15', successRate: 100,
      execLog: [{ id: 'ex6', ts: '2026-03-24 09:15', status: 'success', duration: '1.5s', triggeredBy: 'Co-location: Horvat+Mendoza at Savska (25m)', output: '3rd co-location in 48h. Evidence #42.' }],
      createdAt: '2026-03-05', updatedAt: '2026-03-24', createdBy: 'Cpt. Horvat' },
    { id: 'wf-3', name: 'Counter-Surveillance Detection', description: 'Monitors CS patterns: phone off during transit, evasive driving, checkpoint avoidance.', status: 'Active', priority: 'High', operationId: 'op-1', operationName: 'OP HAWK',
      triggers: [{ id: 'tr4', type: 'signal_lost', label: 'Phone Signal Lost', config: 'Timeout: 30min | All HAWK targets', icon: '📵' }, { id: 'tr5', type: 'speed_alert', label: 'Evasive Speed', config: '>100km/h urban | >2min', icon: '🏎️' }],
      actions: [{ id: 'ac8', type: 'ai_analysis', label: 'Pattern Analysis', config: 'XGBoost CS scoring', icon: '🤖' }, { id: 'ac9', type: 'notify', label: 'Notify Team', config: 'Alpha Team', icon: '🔔' }],
      linkedPersonIds: [1, 9, 12], linkedPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić'],
      execCount: 14, lastRun: '2026-03-24 03:37', successRate: 86,
      execLog: [{ id: 'ex8', ts: '2026-03-24 03:37', status: 'success', duration: '4.5s', triggeredBy: 'Signal Lost — Mendoza 6h', output: '95% CS. Alpha notified.' }],
      createdAt: '2026-03-08', updatedAt: '2026-03-24', createdBy: 'Sgt. Matić' },
    { id: 'wf-4', name: 'LPR Watchlist Auto-Track', description: 'Watchlisted plate captured → auto GPS + notify team.', status: 'Active', priority: 'High', operationId: 'op-1', operationName: 'OP HAWK',
      triggers: [{ id: 'tr6', type: 'lpr_match', label: 'LPR Watchlist Match', config: 'ZG-1234-AB, ZG-5678-CD, SA-9012-RH', icon: '🚗' }],
      actions: [{ id: 'ac10', type: 'alert', label: 'LPR Alert', config: 'In-App | High', icon: '🚨' }, { id: 'ac11', type: 'deploy_device', label: 'GPS Tracking', config: 'Auto-start tracker', icon: '📡' }],
      linkedPersonIds: [1, 12, 3, 9], linkedPersonNames: ['Marko Horvat', 'Ivan Babić', 'Ahmed Al-Rashid', 'Carlos Mendoza'],
      execCount: 31, lastRun: '2026-03-24 09:31', successRate: 100,
      execLog: [{ id: 'ex10', ts: '2026-03-24 09:31', status: 'success', duration: '0.8s', triggeredBy: 'LPR: ZG-1847-AB Vukovarska', output: 'GPS-002 tracking active.' }],
      createdAt: '2026-02-20', updatedAt: '2026-03-24', createdBy: 'Lt. Petrić' },
    { id: 'wf-5', name: 'Financial Transaction Monitor', description: 'Wire transfers >€50K from flagged accounts trigger AML analysis.', status: 'Draft', priority: 'High', operationId: 'op-2', operationName: 'OP GLACIER',
      triggers: [{ id: 'tr7', type: 'keyword', label: 'Transaction Threshold', config: '>€50,000 | Rashid Holdings, Falcon Trading', icon: '🔤' }],
      actions: [{ id: 'ac12', type: 'ai_analysis', label: 'AML Analysis', config: 'XGBoost | 6mo history', icon: '🤖' }, { id: 'ac13', type: 'generate_report', label: 'Compliance Report', config: 'SAR template', icon: '📊' }],
      linkedPersonIds: [3, 7], linkedPersonNames: ['Ahmed Al-Rashid', 'Omar Hassan'],
      execCount: 0, lastRun: '—', successRate: 0, execLog: [],
      createdAt: '2026-03-22', updatedAt: '2026-03-22', createdBy: 'Cpt. Galić' },
    { id: 'wf-6', name: 'Nightly Activity Sweep', description: 'Daily 06:00 AI summary of overnight HAWK activity.', status: 'Active', priority: 'Medium', operationId: 'op-1', operationName: 'OP HAWK',
      triggers: [{ id: 'tr8', type: 'schedule', label: 'Daily at 06:00', config: '0 6 * * * Europe/Zagreb', icon: '⏰' }],
      actions: [{ id: 'ac14', type: 'ai_analysis', label: 'Nightly Summary', config: 'LLaMA 3.1 | 22:00-06:00', icon: '🤖' }, { id: 'ac15', type: 'generate_report', label: 'Morning Briefing', config: 'Movement + alerts + intel', icon: '📊' }, { id: 'ac16', type: 'notify', label: 'Email Commander', config: 'Col. Tomić', icon: '🔔' }],
      linkedPersonIds: [1, 9, 12, 7], linkedPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan'],
      execCount: 24, lastRun: '2026-03-24 06:00', successRate: 100,
      execLog: [{ id: 'ex11', ts: '2026-03-24 06:00', status: 'running', duration: '—', triggeredBy: 'Schedule: 06:00', output: 'Generating...' }, { id: 'ex12', ts: '2026-03-23 06:00', status: 'success', duration: '12.4s', triggeredBy: 'Schedule: 06:00', output: 'Briefing #23. 4 events. Emailed.' }],
      createdAt: '2026-03-01', updatedAt: '2026-03-24', createdBy: 'Sgt. Matić' },
    { id: 'wf-7', name: 'Diplomatic Quarter Surveillance', description: 'Babić enters diplomatic quarter → enhanced monitoring.', status: 'Paused', priority: 'Medium', operationId: 'op-1', operationName: 'OP HAWK',
      triggers: [{ id: 'tr9', type: 'zone_entry', label: 'Zone Entry — Diplomatic', config: 'Subject: Ivan Babić', icon: '🛡️' }],
      actions: [{ id: 'ac17', type: 'alert', label: 'Diplomatic Alert', config: 'High severity', icon: '🚨' }, { id: 'ac18', type: 'assign', label: 'Ground Team', config: 'Alpha | Physical surveillance', icon: '👤' }],
      linkedPersonIds: [12], linkedPersonNames: ['Ivan Babić'],
      execCount: 4, lastRun: '2026-03-23 14:22', successRate: 100,
      execLog: [{ id: 'ex13', ts: '2026-03-23 14:22', status: 'success', duration: '1.1s', triggeredBy: 'Babić at Embassy Row', output: 'Alpha dispatched. 48min in zone.' }],
      createdAt: '2026-03-15', updatedAt: '2026-03-23', createdBy: 'Cpt. Horvat' },
    { id: 'wf-8', name: 'Border Crossing Alert Chain', description: 'OP CERBERUS legacy. Border crossing patterns.', status: 'Completed', priority: 'High', operationId: 'op-4', operationName: 'OP CERBERUS',
      triggers: [{ id: 'tr10', type: 'zone_exit', label: 'Border Exit', config: 'Croatia-Bosnia buffer', icon: '🚪' }],
      actions: [{ id: 'ac19', type: 'alert', label: 'Border Alert', config: 'All | Critical', icon: '🚨' }],
      linkedPersonIds: [12], linkedPersonNames: ['Ivan Babić'],
      execCount: 67, lastRun: '2026-02-27 23:45', successRate: 97,
      execLog: [{ id: 'ex14', ts: '2026-02-27 23:45', status: 'success', duration: '0.9s', triggeredBy: 'Babić border crossing', output: 'Final exec. CERBERUS closed.' }],
      createdAt: '2025-11-05', updatedAt: '2026-02-28', createdBy: 'Sgt. Vidić' },
    { id: 'wf-9', name: 'Shanghai Port Cargo Watch', description: 'Dragon Tech cargo monitoring. Archived pending legal.', status: 'Archived', priority: 'Low', operationId: 'op-3', operationName: 'OP PHOENIX',
      triggers: [{ id: 'tr11', type: 'manual', label: 'Manual Trigger', config: 'Operator activation', icon: '👆' }],
      actions: [{ id: 'ac20', type: 'record', label: 'Log Cargo', config: 'Auto-tag Dragon Tech', icon: '📝' }],
      linkedPersonIds: [10], linkedPersonNames: ['Li Wei'],
      execCount: 2, lastRun: '2026-03-18 06:00', successRate: 100, execLog: [],
      createdAt: '2026-03-12', updatedAt: '2026-03-20', createdBy: 'Cpt. Perić' },
];

export const templates: Template[] = [
    { id: 'tpl-1', name: 'Zone Breach Response', description: 'Alert + record + escalate on zone entry', icon: '🛡️', category: 'Geofencing', triggers: [{ id: 't', type: 'zone_entry', label: 'Zone Entry', config: '', icon: '🛡️' }], actions: [{ id: 'a1', type: 'alert', label: 'Alert', config: '', icon: '🚨' }, { id: 'a2', type: 'record', label: 'Record', config: '', icon: '📝' }, { id: 'a3', type: 'escalate', label: 'Escalate', config: '', icon: '📢' }] },
    { id: 'tpl-2', name: 'Co-location Evidence', description: 'Proximity detect + evidence + report', icon: '🔗', category: 'Intelligence', triggers: [{ id: 't', type: 'colocation', label: 'Co-location', config: '', icon: '🔗' }], actions: [{ id: 'a1', type: 'record', label: 'Evidence', config: '', icon: '📝' }, { id: 'a2', type: 'generate_report', label: 'Report', config: '', icon: '📊' }] },
    { id: 'tpl-3', name: 'Vehicle Tracking Chain', description: 'LPR match → GPS + notify', icon: '🚗', category: 'Vehicles', triggers: [{ id: 't', type: 'lpr_match', label: 'LPR Match', config: '', icon: '🚗' }], actions: [{ id: 'a1', type: 'deploy_device', label: 'GPS', config: '', icon: '📡' }, { id: 'a2', type: 'notify', label: 'Notify', config: '', icon: '🔔' }] },
    { id: 'tpl-4', name: 'Daily Briefing', description: 'Scheduled AI overnight summary', icon: '⏰', category: 'Scheduled', triggers: [{ id: 't', type: 'schedule', label: 'Schedule', config: '', icon: '⏰' }], actions: [{ id: 'a1', type: 'ai_analysis', label: 'AI Summary', config: '', icon: '🤖' }, { id: 'a2', type: 'generate_report', label: 'PDF', config: '', icon: '📊' }] },
    { id: 'tpl-5', name: 'Signal Loss Response', description: 'Phone dark → alert + backup track', icon: '📵', category: 'Technical', triggers: [{ id: 't', type: 'signal_lost', label: 'Signal Lost', config: '', icon: '📵' }], actions: [{ id: 'a1', type: 'alert', label: 'Alert', config: '', icon: '🚨' }, { id: 'a2', type: 'deploy_device', label: 'Backup', config: '', icon: '📡' }] },
    { id: 'tpl-6', name: 'Face Recognition Alert', description: 'Face match → alert + AI', icon: '🧑', category: 'Intelligence', triggers: [{ id: 't', type: 'face_match', label: 'Face Match', config: '', icon: '🧑' }], actions: [{ id: 'a1', type: 'alert', label: 'Alert', config: '', icon: '🚨' }, { id: 'a2', type: 'ai_analysis', label: 'AI', config: '', icon: '🤖' }] },
];

export const keyboardShortcuts = [
    { key: '1', description: 'Kanban view' }, { key: '2', description: 'List view' }, { key: '3', description: 'Templates view' },
    { key: 'N', description: 'New Workflow' }, { key: 'F', description: 'Focus search' }, { key: 'R', description: 'Reset filters' },
    { key: 'Esc', description: 'Close detail / modal' }, { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
