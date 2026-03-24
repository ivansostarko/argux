import PageMeta from '../../components/layout/PageMeta';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Workflows  ·  Automated Surveillance Workflow Engine
   Kanban board + trigger/action builder + execution log
   ═══════════════════════════════════════════════════════════════ */

type WfStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Archived';
type TriggerType = 'zone_entry' | 'zone_exit' | 'colocation' | 'face_match' | 'lpr_match' | 'signal_lost' | 'speed_alert' | 'keyword' | 'schedule' | 'manual';
type ActionType = 'alert' | 'assign' | 'escalate' | 'ai_analysis' | 'record' | 'notify' | 'deploy_device' | 'generate_report';

interface Trigger { id: string; type: TriggerType; label: string; config: string; icon: string; }
interface Action { id: string; type: ActionType; label: string; config: string; icon: string; }
interface ExecLog { id: string; ts: string; status: 'success' | 'failed' | 'running'; duration: string; triggeredBy: string; output: string; }
interface Workflow {
    id: string; name: string; description: string; status: WfStatus; priority: 'Critical' | 'High' | 'Medium' | 'Low';
    operationId: string; operationName: string;
    triggers: Trigger[]; actions: Action[];
    linkedPersonIds: number[]; linkedPersonNames: string[];
    execCount: number; lastRun: string; successRate: number;
    execLog: ExecLog[];
    createdAt: string; updatedAt: string; createdBy: string;
}
interface Template { id: string; name: string; description: string; icon: string; category: string; triggers: Trigger[]; actions: Action[]; }

const statusColors: Record<WfStatus, string> = { Draft: '#6b7280', Active: '#22c55e', Paused: '#f59e0b', Completed: '#3b82f6', Archived: '#64748b' };
const statusIcons: Record<WfStatus, string> = { Draft: '📝', Active: '🟢', Paused: '⏸️', Completed: '✅', Archived: '📦' };
const prioColors: Record<string, string> = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#22c55e' };
const triggerIcons: Record<TriggerType, string> = { zone_entry: '🛡️', zone_exit: '🚪', colocation: '🔗', face_match: '🧑', lpr_match: '🚗', signal_lost: '📵', speed_alert: '🏎️', keyword: '🔤', schedule: '⏰', manual: '👆' };
const actionIcons: Record<ActionType, string> = { alert: '🚨', assign: '👤', escalate: '📢', ai_analysis: '🤖', record: '📝', notify: '🔔', deploy_device: '📡', generate_report: '📊' };

const kanbanCols: { status: WfStatus; label: string }[] = [
    { status: 'Draft', label: 'Draft' },
    { status: 'Active', label: 'Active' },
    { status: 'Paused', label: 'Paused' },
    { status: 'Completed', label: 'Completed' },
    { status: 'Archived', label: 'Archived' },
];

// ═══ MOCK WORKFLOWS ═══
const mockWorkflows: Workflow[] = [
    {
        id: 'wf-1', name: 'Port Terminal Intrusion Detection', description: 'Triggers when any OP HAWK target enters the port terminal restricted zone. Auto-deploys additional camera coverage and alerts ground team.',
        status: 'Active', priority: 'Critical', operationId: 'op-1', operationName: 'OP HAWK',
        triggers: [
            { id: 'tr1', type: 'zone_entry', label: 'Zone Entry — Port Terminal', config: 'Zone: Port Terminal Perimeter | Subjects: Horvat, Mendoza, Babić, Hassan', icon: '🛡️' },
            { id: 'tr2', type: 'face_match', label: 'Face Match at Port Cameras', config: 'Cameras: Dubai Port, Airport Cargo | Confidence: >85%', icon: '🧑' },
        ],
        actions: [
            { id: 'ac1', type: 'alert', label: 'Send Critical Alert', config: 'Channel: In-App + SMS | Recipients: Alpha Team Lead', icon: '🚨' },
            { id: 'ac2', type: 'deploy_device', label: 'Activate Port Cameras', config: 'Devices: CAM-05, CAM-14 | Mode: High-resolution recording', icon: '📡' },
            { id: 'ac3', type: 'ai_analysis', label: 'Run Anomaly Detection', config: 'Model: Ollama LLaMA 3.1 | Context: Last 24h movement', icon: '🤖' },
            { id: 'ac4', type: 'generate_report', label: 'Generate Incident Report', config: 'Template: Zone Breach | Include: GPS trail, face captures', icon: '📊' },
        ],
        linkedPersonIds: [1, 9, 12, 7], linkedPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan'],
        execCount: 23, lastRun: '2026-03-24 09:48', successRate: 96,
        execLog: [
            { id: 'ex1', ts: '2026-03-24 09:48', status: 'success', duration: '2.3s', triggeredBy: 'Zone Entry — Horvat at port', output: 'Alert sent to Alpha. CAM-05 activated. Anomaly report generated.' },
            { id: 'ex2', ts: '2026-03-24 06:42', status: 'success', duration: '1.8s', triggeredBy: 'Face Match — Horvat at CAM-07 (94%)', output: 'Alert dispatched. Recording started. Report queued.' },
            { id: 'ex3', ts: '2026-03-23 22:31', status: 'success', duration: '3.1s', triggeredBy: 'Zone Entry — Mendoza at port', output: 'Alert sent. Night mode activated on CAM-05.' },
            { id: 'ex4', ts: '2026-03-23 18:15', status: 'failed', duration: '8.2s', triggeredBy: 'Face Match — Unknown at CAM-14', output: 'Error: Confidence below threshold (72%). No actions triggered.' },
            { id: 'ex5', ts: '2026-03-22 14:20', status: 'success', duration: '2.0s', triggeredBy: 'Zone Entry — Babić at port', output: 'Full workflow executed. Intel report #37 generated.' },
        ],
        createdAt: '2026-03-01', updatedAt: '2026-03-24', createdBy: 'Col. Tomić',
    },
    {
        id: 'wf-2', name: 'Horvat-Mendoza Co-location Monitor', description: 'Detects when Horvat and Mendoza are within 50m of each other. Captures evidence and escalates to operation commander.',
        status: 'Active', priority: 'Critical', operationId: 'op-1', operationName: 'OP HAWK',
        triggers: [{ id: 'tr3', type: 'colocation', label: 'Co-location Detection', config: 'Subject A: Horvat | Subject B: Mendoza | Radius: 50m', icon: '🔗' }],
        actions: [
            { id: 'ac5', type: 'alert', label: 'Critical Co-location Alert', config: 'Channel: All | Priority: Critical', icon: '🚨' },
            { id: 'ac6', type: 'record', label: 'Create Evidence Record', config: 'Type: Co-location | Auto-attach: GPS trails, camera stills', icon: '📝' },
            { id: 'ac7', type: 'escalate', label: 'Escalate to Commander', config: 'Notify: Col. Tomić | Include: Co-location map + timeline', icon: '📢' },
        ],
        linkedPersonIds: [1, 9], linkedPersonNames: ['Marko Horvat', 'Carlos Mendoza'],
        execCount: 8, lastRun: '2026-03-24 09:15', successRate: 100,
        execLog: [
            { id: 'ex6', ts: '2026-03-24 09:15', status: 'success', duration: '1.5s', triggeredBy: 'Co-location: Horvat + Mendoza at Savska (25m)', output: '3rd co-location in 48h. Escalated to Commander. Evidence #42 created.' },
            { id: 'ex7', ts: '2026-03-22 22:08', status: 'success', duration: '1.8s', triggeredBy: 'Co-location: Horvat + Mendoza at port (38m)', output: 'Alert sent. Night evidence captured.' },
        ],
        createdAt: '2026-03-05', updatedAt: '2026-03-24', createdBy: 'Cpt. Horvat',
    },
    {
        id: 'wf-3', name: 'Counter-Surveillance Detection', description: 'Monitors for counter-surveillance behavior patterns: phone off during transit, evasive driving, checkpoint avoidance.',
        status: 'Active', priority: 'High', operationId: 'op-1', operationName: 'OP HAWK',
        triggers: [
            { id: 'tr4', type: 'signal_lost', label: 'Phone Signal Lost', config: 'Timeout: 30min | Subjects: All HAWK targets', icon: '📵' },
            { id: 'tr5', type: 'speed_alert', label: 'Evasive Speed Pattern', config: 'Speed: >100km/h in urban zone | Duration: >2min', icon: '🏎️' },
        ],
        actions: [
            { id: 'ac8', type: 'ai_analysis', label: 'Run Pattern Analysis', config: 'Model: XGBoost | Type: Counter-surveillance scoring', icon: '🤖' },
            { id: 'ac9', type: 'notify', label: 'Notify Surveillance Team', config: 'Team: Alpha | Message: Counter-surveillance detected', icon: '🔔' },
        ],
        linkedPersonIds: [1, 9, 12], linkedPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić'],
        execCount: 14, lastRun: '2026-03-24 03:37', successRate: 86,
        execLog: [
            { id: 'ex8', ts: '2026-03-24 03:37', status: 'success', duration: '4.5s', triggeredBy: 'Signal Lost — Mendoza phone off for 6h', output: 'Pattern analysis: 95% counter-surveillance. Alpha notified.' },
            { id: 'ex9', ts: '2026-03-23 22:08', status: 'success', duration: '3.2s', triggeredBy: 'Speed Alert — Horvat 120km/h evasive', output: 'Evasive driving confirmed. CS score: HIGH.' },
        ],
        createdAt: '2026-03-08', updatedAt: '2026-03-24', createdBy: 'Sgt. Matić',
    },
    {
        id: 'wf-4', name: 'LPR Watchlist Auto-Track', description: 'When any watchlisted vehicle plate is captured by LPR, automatically start GPS tracking and notify relevant team.',
        status: 'Active', priority: 'High', operationId: 'op-1', operationName: 'OP HAWK',
        triggers: [{ id: 'tr6', type: 'lpr_match', label: 'LPR Watchlist Match', config: 'Plates: ZG-1234-AB, ZG-5678-CD, SA-9012-RH, CO-MEND-99', icon: '🚗' }],
        actions: [
            { id: 'ac10', type: 'alert', label: 'LPR Alert', config: 'Channel: In-App | Severity: High', icon: '🚨' },
            { id: 'ac11', type: 'deploy_device', label: 'Activate GPS Tracking', config: 'Auto-start GPS tracker for matched vehicle', icon: '📡' },
        ],
        linkedPersonIds: [1, 12, 3, 9], linkedPersonNames: ['Marko Horvat', 'Ivan Babić', 'Ahmed Al-Rashid', 'Carlos Mendoza'],
        execCount: 31, lastRun: '2026-03-24 09:31', successRate: 100,
        execLog: [
            { id: 'ex10', ts: '2026-03-24 09:31', status: 'success', duration: '0.8s', triggeredBy: 'LPR: ZG-1847-AB at Vukovarska', output: 'Alert sent. GPS-002 tracking confirmed active.' },
        ],
        createdAt: '2026-02-20', updatedAt: '2026-03-24', createdBy: 'Lt. Petrić',
    },
    {
        id: 'wf-5', name: 'Financial Transaction Monitor', description: 'Monitors wire transfers exceeding €50K from flagged accounts. Triggers AML analysis and generates compliance report.',
        status: 'Draft', priority: 'High', operationId: 'op-2', operationName: 'OP GLACIER',
        triggers: [{ id: 'tr7', type: 'keyword', label: 'Transaction Threshold', config: 'Amount: >€50,000 | Accounts: Rashid Holdings, Falcon Trading', icon: '🔤' }],
        actions: [
            { id: 'ac12', type: 'ai_analysis', label: 'AML Pattern Analysis', config: 'Model: XGBoost | Dataset: Transaction history 6mo', icon: '🤖' },
            { id: 'ac13', type: 'generate_report', label: 'Compliance Report', config: 'Template: AML Suspicious Activity | Recipient: Financial Intel', icon: '📊' },
        ],
        linkedPersonIds: [3, 7], linkedPersonNames: ['Ahmed Al-Rashid', 'Omar Hassan'],
        execCount: 0, lastRun: '—', successRate: 0,
        execLog: [],
        createdAt: '2026-03-22', updatedAt: '2026-03-22', createdBy: 'Cpt. Galić',
    },
    {
        id: 'wf-6', name: 'Nightly Activity Sweep', description: 'Scheduled workflow that runs at 06:00 daily, aggregating all overnight activity for HAWK targets into a morning briefing.',
        status: 'Active', priority: 'Medium', operationId: 'op-1', operationName: 'OP HAWK',
        triggers: [{ id: 'tr8', type: 'schedule', label: 'Daily at 06:00', config: 'Schedule: 0 6 * * * | Timezone: Europe/Zagreb', icon: '⏰' }],
        actions: [
            { id: 'ac14', type: 'ai_analysis', label: 'Nightly Activity Summary', config: 'Model: LLaMA 3.1 | Window: 22:00-06:00 | Subjects: All HAWK', icon: '🤖' },
            { id: 'ac15', type: 'generate_report', label: 'Morning Briefing PDF', config: 'Template: Daily Briefing | Include: Movement, alerts, intel', icon: '📊' },
            { id: 'ac16', type: 'notify', label: 'Send to Commander', config: 'Email: Col. Tomić | Subject: HAWK Daily Briefing', icon: '🔔' },
        ],
        linkedPersonIds: [1, 9, 12, 7], linkedPersonNames: ['Marko Horvat', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan'],
        execCount: 24, lastRun: '2026-03-24 06:00', successRate: 100,
        execLog: [
            { id: 'ex11', ts: '2026-03-24 06:00', status: 'running', duration: '—', triggeredBy: 'Schedule: Daily 06:00', output: 'Generating morning briefing...' },
            { id: 'ex12', ts: '2026-03-23 06:00', status: 'success', duration: '12.4s', triggeredBy: 'Schedule: Daily 06:00', output: 'Briefing #23 generated. 4 overnight events. Emailed to Commander.' },
        ],
        createdAt: '2026-03-01', updatedAt: '2026-03-24', createdBy: 'Sgt. Matić',
    },
    {
        id: 'wf-7', name: 'Diplomatic Quarter Surveillance', description: 'Activated when Babić enters the diplomatic quarter. New pattern detected — requires enhanced monitoring.',
        status: 'Paused', priority: 'Medium', operationId: 'op-1', operationName: 'OP HAWK',
        triggers: [{ id: 'tr9', type: 'zone_entry', label: 'Zone Entry — Diplomatic Quarter', config: 'Zone: Diplomatic Quarter | Subject: Ivan Babić', icon: '🛡️' }],
        actions: [
            { id: 'ac17', type: 'alert', label: 'Diplomatic Alert', config: 'Channel: In-App | Severity: High', icon: '🚨' },
            { id: 'ac18', type: 'assign', label: 'Assign Ground Team', config: 'Team: Alpha | Task: Physical surveillance', icon: '👤' },
        ],
        linkedPersonIds: [12], linkedPersonNames: ['Ivan Babić'],
        execCount: 4, lastRun: '2026-03-23 14:22', successRate: 100,
        execLog: [
            { id: 'ex13', ts: '2026-03-23 14:22', status: 'success', duration: '1.1s', triggeredBy: 'Zone Entry — Babić at Embassy Row', output: 'Alert sent. Alpha dispatched. 48min inside zone.' },
        ],
        createdAt: '2026-03-15', updatedAt: '2026-03-23', createdBy: 'Cpt. Horvat',
    },
    {
        id: 'wf-8', name: 'Border Crossing Alert Chain', description: 'Legacy workflow from OP CERBERUS. Monitored border crossing patterns. Completed with operation.',
        status: 'Completed', priority: 'High', operationId: 'op-4', operationName: 'OP CERBERUS',
        triggers: [{ id: 'tr10', type: 'zone_exit', label: 'Zone Exit — Border Region', config: 'Zone: Croatia-Bosnia border buffer | All subjects', icon: '🚪' }],
        actions: [{ id: 'ac19', type: 'alert', label: 'Border Alert', config: 'Channel: All | Priority: Critical', icon: '🚨' }],
        linkedPersonIds: [12, 14], linkedPersonNames: ['Ivan Babić', 'Nikola Jovanović'],
        execCount: 67, lastRun: '2026-02-27 23:45', successRate: 97,
        execLog: [{ id: 'ex14', ts: '2026-02-27 23:45', status: 'success', duration: '0.9s', triggeredBy: 'Zone Exit — Babić crossed border', output: 'Final execution. Op CERBERUS closed next day.' }],
        createdAt: '2025-11-05', updatedAt: '2026-02-28', createdBy: 'Sgt. Vidić',
    },
    {
        id: 'wf-9', name: 'Shanghai Port Cargo Watch', description: 'Archived workflow for Dragon Tech cargo monitoring. Pending legal authorization.',
        status: 'Archived', priority: 'Low', operationId: 'op-3', operationName: 'OP PHOENIX',
        triggers: [{ id: 'tr11', type: 'manual', label: 'Manual Trigger', config: 'Requires operator activation', icon: '👆' }],
        actions: [{ id: 'ac20', type: 'record', label: 'Log Cargo Movement', config: 'Type: Observation | Auto-tag: Dragon Tech', icon: '📝' }],
        linkedPersonIds: [10], linkedPersonNames: ['Li Wei'],
        execCount: 2, lastRun: '2026-03-18 06:00', successRate: 100,
        execLog: [], createdAt: '2026-03-12', updatedAt: '2026-03-20', createdBy: 'Cpt. Perić',
    },
];

// ═══ TEMPLATES ═══
const templates: Template[] = [
    { id: 'tpl-1', name: 'Zone Breach Response', description: 'Alert + record + escalate when target enters restricted zone', icon: '🛡️', category: 'Geofencing',
      triggers: [{ id: 't', type: 'zone_entry', label: 'Zone Entry', config: 'Configure zone and subjects', icon: '🛡️' }],
      actions: [{ id: 'a1', type: 'alert', label: 'Send Alert', config: '', icon: '🚨' }, { id: 'a2', type: 'record', label: 'Create Record', config: '', icon: '📝' }, { id: 'a3', type: 'escalate', label: 'Escalate', config: '', icon: '📢' }] },
    { id: 'tpl-2', name: 'Co-location Evidence Capture', description: 'Detect proximity + auto-capture evidence + generate report', icon: '🔗', category: 'Intelligence',
      triggers: [{ id: 't', type: 'colocation', label: 'Co-location', config: '', icon: '🔗' }],
      actions: [{ id: 'a1', type: 'record', label: 'Evidence', config: '', icon: '📝' }, { id: 'a2', type: 'generate_report', label: 'Report', config: '', icon: '📊' }] },
    { id: 'tpl-3', name: 'Vehicle Tracking Chain', description: 'LPR match triggers GPS activation and team notification', icon: '🚗', category: 'Vehicles',
      triggers: [{ id: 't', type: 'lpr_match', label: 'LPR Match', config: '', icon: '🚗' }],
      actions: [{ id: 'a1', type: 'deploy_device', label: 'Start GPS', config: '', icon: '📡' }, { id: 'a2', type: 'notify', label: 'Notify Team', config: '', icon: '🔔' }] },
    { id: 'tpl-4', name: 'Daily Intelligence Briefing', description: 'Scheduled AI summary with overnight activity analysis', icon: '⏰', category: 'Scheduled',
      triggers: [{ id: 't', type: 'schedule', label: 'Daily Schedule', config: '', icon: '⏰' }],
      actions: [{ id: 'a1', type: 'ai_analysis', label: 'AI Summary', config: '', icon: '🤖' }, { id: 'a2', type: 'generate_report', label: 'PDF Report', config: '', icon: '📊' }] },
    { id: 'tpl-5', name: 'Signal Loss Response', description: 'Phone/GPS goes dark → alert + deploy backup tracking', icon: '📵', category: 'Technical',
      triggers: [{ id: 't', type: 'signal_lost', label: 'Signal Lost', config: '', icon: '📵' }],
      actions: [{ id: 'a1', type: 'alert', label: 'Alert', config: '', icon: '🚨' }, { id: 'a2', type: 'deploy_device', label: 'Backup Track', config: '', icon: '📡' }] },
    { id: 'tpl-6', name: 'Face Recognition Alert', description: 'Face match at camera → alert + record + AI analysis', icon: '🧑', category: 'Intelligence',
      triggers: [{ id: 't', type: 'face_match', label: 'Face Match', config: '', icon: '🧑' }],
      actions: [{ id: 'a1', type: 'alert', label: 'Alert', config: '', icon: '🚨' }, { id: 'a2', type: 'ai_analysis', label: 'AI Analysis', config: '', icon: '🤖' }] },
];

type ViewTab = 'kanban' | 'list' | 'templates';

function WorkflowsIndex() {
    const [view, setView] = useState<ViewTab>('kanban');
    const [selWf, setSelWf] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [opFilter, setOpFilter] = useState('all');
    const [detailTab, setDetailTab] = useState<'config' | 'log'>('config');

    const wf = selWf ? mockWorkflows.find(w => w.id === selWf) : null;
    const ops = [...new Set(mockWorkflows.map(w => w.operationName))];

    const filteredWfs = mockWorkflows.filter(w => {
        if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.operationName.toLowerCase().includes(search.toLowerCase())) return false;
        if (opFilter !== 'all' && w.operationName !== opFilter) return false;
        return true;
    });

    const WfCard = ({ w }: { w: Workflow }) => {
        const sel = selWf === w.id;
        const sc = statusColors[w.status];
        return <div onClick={() => { setSelWf(w.id); setDetailTab('config'); }} style={{ padding: '8px 10px', borderRadius: 6, border: `1px solid ${sel ? sc + '50' : theme.border}`, background: sel ? `${sc}06` : theme.bgCard, cursor: 'pointer', marginBottom: 4, transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 7, fontWeight: 800, padding: '1px 4px', borderRadius: 2, background: `${prioColors[w.priority]}12`, color: prioColors[w.priority] }}>{w.priority}</span>
                <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 2, background: `${theme.accent}10`, color: theme.accent }}>{w.operationName}</span>
                <span style={{ marginLeft: 'auto', fontSize: 7, color: theme.textDim }}>{w.execCount} runs</span>
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: theme.text, marginBottom: 3, lineHeight: 1.3 }}>{w.name}</div>
            <div style={{ display: 'flex', gap: 3, marginBottom: 4, flexWrap: 'wrap' as const }}>
                {w.triggers.map(t => <span key={t.id} style={{ fontSize: 6, padding: '1px 3px', borderRadius: 2, background: `${theme.border}30`, color: theme.textDim }}>{t.icon} {t.type.replace('_', ' ')}</span>)}
                <span style={{ fontSize: 6, color: theme.textDim }}>→</span>
                {w.actions.slice(0, 2).map(a => <span key={a.id} style={{ fontSize: 6, padding: '1px 3px', borderRadius: 2, background: `${theme.border}30`, color: theme.textDim }}>{a.icon}</span>)}
                {w.actions.length > 2 && <span style={{ fontSize: 6, color: theme.textDim }}>+{w.actions.length - 2}</span>}
            </div>
            <div style={{ display: 'flex', gap: 4, fontSize: 7, color: theme.textDim }}>
                <span>👥 {w.linkedPersonNames.length}</span>
                {w.successRate > 0 && <span style={{ color: w.successRate >= 95 ? '#22c55e' : '#f59e0b' }}>{w.successRate}%</span>}
                {w.lastRun !== '—' && <span style={{ marginLeft: 'auto' }}>{w.lastRun.slice(5)}</span>}
            </div>
        </div>;
    };

    return (<>
        <PageMeta title="Workflows" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* ═══ MAIN AREA ═══ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                {/* Header */}
                <div style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' as const }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#8b5cf610', border: '1px solid #8b5cf625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>WORKFLOWS</div><div style={{ fontSize: 7, color: theme.textDim }}>Automated Surveillance Engine</div></div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 3, marginLeft: 8 }}>
                        {kanbanCols.filter(c => mockWorkflows.some(w => w.status === c.status)).map(c => {
                            const count = mockWorkflows.filter(w => w.status === c.status).length;
                            return <span key={c.status} style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3, border: `1px solid ${statusColors[c.status]}25`, color: statusColors[c.status] }}>{statusIcons[c.status]} {count}</span>;
                        })}
                    </div>

                    {/* Search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px', flex: '1 1 120px', minWidth: 80, maxWidth: 200 }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '4px 0', color: theme.text, fontSize: 9, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>

                    {/* Op filter */}
                    <select value={opFilter} onChange={e => setOpFilter(e.target.value)} style={{ padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 8, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                        <option value="all">All Operations</option>
                        {ops.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>

                    {/* View toggle */}
                    <div style={{ display: 'flex', gap: 1, marginLeft: 'auto' }}>
                        {[{ id: 'kanban' as ViewTab, l: '▦ Kanban' }, { id: 'list' as ViewTab, l: '☰ List' }, { id: 'templates' as ViewTab, l: '📋 Templates' }].map(v => <button key={v.id} onClick={() => setView(v.id)} style={{ padding: '3px 8px', borderRadius: 4, border: `1px solid ${view === v.id ? '#8b5cf640' : theme.border}`, background: view === v.id ? '#8b5cf608' : 'transparent', color: view === v.id ? '#8b5cf6' : theme.textDim, fontSize: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{v.l}</button>)}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: view === 'templates' ? 16 : 0 }}>
                    {/* KANBAN VIEW */}
                    {view === 'kanban' && <div style={{ display: 'flex', gap: 0, height: '100%', overflow: 'auto' }}>
                        {kanbanCols.map(col => {
                            const colWfs = filteredWfs.filter(w => w.status === col.status);
                            return <div key={col.status} style={{ flex: 1, minWidth: 200, borderRight: `1px solid ${theme.border}06`, display: 'flex', flexDirection: 'column' as const }}>
                                <div style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, position: 'sticky' as const, top: 0, background: theme.bg, zIndex: 1 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: statusColors[col.status] }} />
                                    <span style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{col.label}</span>
                                    <span style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace" }}>{colWfs.length}</span>
                                </div>
                                <div style={{ flex: 1, padding: 6, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                                    {colWfs.map(w => <WfCard key={w.id} w={w} />)}
                                    {colWfs.length === 0 && <div style={{ padding: 16, textAlign: 'center' as const, fontSize: 9, color: theme.textDim, opacity: 0.5 }}>No workflows</div>}
                                </div>
                            </div>;
                        })}
                    </div>}

                    {/* LIST VIEW */}
                    {view === 'list' && <div style={{ padding: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1fr', padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', position: 'sticky' as const, top: 0, background: theme.bg, zIndex: 1 }}>
                            <span>Workflow</span><span>Status</span><span>Operation</span><span>Runs</span><span>Success</span><span>Last Run</span>
                        </div>
                        {filteredWfs.map(w => <div key={w.id} onClick={() => { setSelWf(w.id); setDetailTab('config'); }} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1fr', padding: '8px 12px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', background: selWf === w.id ? `${statusColors[w.status]}04` : 'transparent', borderLeft: `3px solid ${selWf === w.id ? statusColors[w.status] : 'transparent'}` }}>
                            <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{w.name}</div><div style={{ fontSize: 7, color: theme.textDim, marginTop: 1 }}>{w.triggers.length} triggers → {w.actions.length} actions · {w.linkedPersonNames.length} subjects</div></div>
                            <span style={{ fontSize: 8, fontWeight: 700, color: statusColors[w.status] }}>{statusIcons[w.status]} {w.status}</span>
                            <span style={{ fontSize: 8, color: theme.accent }}>{w.operationName}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{w.execCount}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: w.successRate >= 95 ? '#22c55e' : w.successRate > 0 ? '#f59e0b' : theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{w.successRate > 0 ? `${w.successRate}%` : '—'}</span>
                            <span style={{ fontSize: 8, color: theme.textDim }}>{w.lastRun === '—' ? '—' : w.lastRun.slice(5)}</span>
                        </div>)}
                    </div>}

                    {/* TEMPLATES VIEW */}
                    {view === 'templates' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                        {templates.map(t => <div key={t.id} style={{ padding: '14px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bgCard, cursor: 'pointer', transition: 'border-color 0.15s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#8b5cf640'} onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 6, background: '#8b5cf610', border: '1px solid #8b5cf625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{t.icon}</div>
                                <div><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{t.name}</div><div style={{ fontSize: 7, color: '#8b5cf6', fontWeight: 600 }}>{t.category}</div></div>
                            </div>
                            <div style={{ fontSize: 9, color: theme.textSecondary, lineHeight: 1.5, marginBottom: 8 }}>{t.description}</div>
                            <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' as const }}>
                                {t.triggers.map(tr => <span key={tr.id} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: '#3b82f610', color: '#3b82f6', fontWeight: 600 }}>{tr.icon} {tr.label}</span>)}
                                <span style={{ fontSize: 8, color: theme.textDim }}>→</span>
                                {t.actions.map(a => <span key={a.id} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: '#22c55e10', color: '#22c55e', fontWeight: 600 }}>{a.icon} {a.label}</span>)}
                            </div>
                            <button style={{ marginTop: 8, width: '100%', padding: '5px', borderRadius: 4, border: `1px solid #8b5cf630`, background: '#8b5cf606', color: '#8b5cf6', fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Use Template</button>
                        </div>)}
                    </div>}
                </div>
            </div>

            {/* ═══ RIGHT PANEL: Workflow Detail ═══ */}
            {wf && <div style={{ width: 300, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                {/* Header */}
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 5, background: `${statusColors[wf.status]}12`, border: `1px solid ${statusColors[wf.status]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{statusIcons[wf.status]}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{wf.name}</div>
                            <div style={{ fontSize: 7, color: theme.textDim, display: 'flex', gap: 4, marginTop: 1 }}>
                                <span style={{ color: statusColors[wf.status], fontWeight: 600 }}>{wf.status}</span>
                                <span style={{ color: theme.accent }}>{wf.operationName}</span>
                            </div>
                        </div>
                        <button onClick={() => setSelWf(null)} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ fontSize: 8, color: theme.textSecondary, lineHeight: 1.5 }}>{wf.description}</div>
                </div>

                {/* Stats */}
                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[
                        { n: wf.execCount, l: 'Runs', c: '#3b82f6' },
                        { n: `${wf.successRate}%`, l: 'Success', c: wf.successRate >= 95 ? '#22c55e' : '#f59e0b' },
                        { n: wf.triggers.length, l: 'Triggers', c: '#8b5cf6' },
                        { n: wf.actions.length, l: 'Actions', c: '#06b6d4' },
                    ].map((s, i) => <div key={i} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div>
                        <div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div>
                    </div>)}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {[{ id: 'config' as const, l: '⚙️ Config' }, { id: 'log' as const, l: '📜 Exec Log' }].map(t => <button key={t.id} onClick={() => setDetailTab(t.id)} style={{ flex: 1, padding: '6px', border: 'none', borderBottom: `2px solid ${detailTab === t.id ? '#8b5cf6' : 'transparent'}`, background: 'transparent', color: detailTab === t.id ? theme.text : theme.textDim, fontSize: 9, fontWeight: detailTab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{t.l}</button>)}
                </div>

                {detailTab === 'config' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {/* Triggers */}
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>⚡ Triggers ({wf.triggers.length})</div>
                        {wf.triggers.map(t => <div key={t.id} style={{ padding: '6px 8px', marginBottom: 3, borderRadius: 5, border: `1px solid #3b82f615`, background: '#3b82f604' }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: theme.text, display: 'flex', alignItems: 'center', gap: 4 }}><span>{t.icon}</span>{t.label}</div>
                            <div style={{ fontSize: 7, color: theme.textDim, marginTop: 2 }}>{t.config}</div>
                        </div>)}
                    </div>

                    {/* Actions */}
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>🎯 Actions ({wf.actions.length})</div>
                        {wf.actions.map((a, i) => <div key={a.id} style={{ padding: '6px 8px', marginBottom: 3, borderRadius: 5, border: `1px solid #22c55e15`, background: '#22c55e04', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#22c55e15', border: '1px solid #22c55e30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#22c55e', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                            <div><div style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{a.icon} {a.label}</div><div style={{ fontSize: 7, color: theme.textDim, marginTop: 1 }}>{a.config}</div></div>
                        </div>)}
                    </div>

                    {/* Linked persons */}
                    {wf.linkedPersonNames.length > 0 && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>👥 Linked Subjects ({wf.linkedPersonNames.length})</div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                            {wf.linkedPersonIds.map((id, i) => <a key={id} href={`/persons/${id}`} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3, border: `1px solid ${theme.accent}20`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>🧑 {wf.linkedPersonNames[i]}</a>)}
                        </div>
                    </div>}

                    {/* Meta */}
                    <div style={{ padding: '8px 12px' }}>
                        {[{ l: 'Operation', v: wf.operationName }, { l: 'Created', v: `${wf.createdAt} by ${wf.createdBy}` }, { l: 'Last updated', v: wf.updatedAt }, { l: 'Last run', v: wf.lastRun }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginBottom: 2 }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: theme.text }}>{r.v}</span></div>)}
                        <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
                            <a href="/operations" style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>🎯 Operation</a>
                            <a href="/map" style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none' }}>🗺️ Map</a>
                            <a href="/alerts" style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none' }}>🚨 Alerts</a>
                        </div>
                    </div>
                </div>}

                {detailTab === 'log' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {wf.execLog.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim, fontSize: 10 }}>No executions yet</div>}
                    {wf.execLog.map(e => {
                        const ec = e.status === 'success' ? '#22c55e' : e.status === 'failed' ? '#ef4444' : '#f59e0b';
                        return <div key={e.id} style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}06` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: ec, boxShadow: e.status === 'running' ? `0 0 4px ${ec}` : 'none', animation: e.status === 'running' ? 'argux-pulse 1.5s infinite' : 'none' }} />
                                <span style={{ fontSize: 8, fontWeight: 700, color: ec, textTransform: 'uppercase' as const }}>{e.status}</span>
                                <span style={{ fontSize: 7, color: theme.textDim, marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace" }}>{e.duration}</span>
                            </div>
                            <div style={{ fontSize: 8, fontWeight: 600, color: theme.text, marginBottom: 2 }}>{e.triggeredBy}</div>
                            <div style={{ fontSize: 7, color: theme.textSecondary, lineHeight: 1.4 }}>{e.output}</div>
                            <div style={{ fontSize: 7, color: theme.textDim, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>{e.ts}</div>
                        </div>;
                    })}
                </div>}
            </div>}
        </div>
    </>);
}

WorkflowsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default WorkflowsIndex;
