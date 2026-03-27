/**
 * ARGUX — Support Tickets Mock Data
 * Ticketing system for reporting system problems and feature requests
 */

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';
export type TicketCategory = 'bug' | 'feature' | 'access' | 'hardware' | 'network' | 'training' | 'data' | 'security';
export type MessageType = 'user' | 'admin' | 'system';

export interface TicketMessage {
    id: string; type: MessageType; author: string; authorRole?: string;
    content: string; timestamp: string; attachments?: string[];
}

export interface Ticket {
    id: string; number: string; subject: string; description: string;
    status: TicketStatus; priority: TicketPriority; category: TicketCategory;
    reporter: string; reporterEmail: string; assignee: string;
    createdAt: string; updatedAt: string; resolvedAt?: string;
    messages: TicketMessage[]; tags: string[];
}

export const statusConfig: Record<TicketStatus, { label: string; color: string; icon: string }> = {
    open:        { label: 'Open', color: '#3b82f6', icon: '🔵' },
    in_progress: { label: 'In Progress', color: '#f59e0b', icon: '🟡' },
    waiting:     { label: 'Waiting', color: '#8b5cf6', icon: '🟣' },
    resolved:    { label: 'Resolved', color: '#22c55e', icon: '🟢' },
    closed:      { label: 'Closed', color: '#6b7280', icon: '⚫' },
};

export const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
    critical: { color: '#ef4444', label: 'Critical' },
    high:     { color: '#f97316', label: 'High' },
    medium:   { color: '#f59e0b', label: 'Medium' },
    low:      { color: '#22c55e', label: 'Low' },
};

export const categoryConfig: Record<TicketCategory, { label: string; icon: string }> = {
    bug:      { label: 'Bug Report', icon: '🐛' },
    feature:  { label: 'Feature Request', icon: '✨' },
    access:   { label: 'Access & Permissions', icon: '🔑' },
    hardware: { label: 'Hardware Issue', icon: '🖥️' },
    network:  { label: 'Network Problem', icon: '🌐' },
    training: { label: 'Training Request', icon: '📖' },
    data:     { label: 'Data Issue', icon: '💾' },
    security: { label: 'Security Concern', icon: '🔐' },
};

export const assignees = [
    'Unassigned', 'Col. Tomić', 'Maj. Novak', 'Sgt. Matić', 'Lt. Perić', 'IT Support', 'AI Team', 'Security Team',
];

export const mockTickets: Ticket[] = [
    { id: 't01', number: 'TKT-001', subject: 'Faster-Whisper GPU memory overflow on long recordings', description: 'When processing audio files longer than 30 minutes, the Faster-Whisper service runs out of GPU VRAM and crashes. Affects all transcription jobs for long surveillance recordings.', status: 'open', priority: 'critical', category: 'bug', reporter: 'Sgt. Matić', reporterEmail: 'matic@argux.mil', assignee: 'AI Team', createdAt: '2026-03-27 08:15', updatedAt: '2026-03-27 09:30', tags: ['faster-whisper', 'GPU', 'transcription', 'crash'],
        messages: [
            { id: 'm01', type: 'user', author: 'Sgt. Matić', authorRole: 'Field Intelligence', content: 'Faster-Whisper crashes when processing audio files longer than 30 minutes. GPU memory (24GB VRAM) fills up completely. Error: CUDA out of memory. This blocks all transcription jobs in the queue.\n\nAffected files:\n- mendoza_vehicle_audio.wav (22 min) — processed OK\n- horvat_port_cam07.mp4 (45 min) — FAILED\n- babic_loitering_cam12.mp4 (22 min) — processed OK\n\nSeems to be a threshold around 35-40 minutes.', timestamp: '2026-03-27 08:15' },
            { id: 'm02', type: 'system', author: 'System', content: 'Ticket created and assigned to AI Team. Priority: Critical.', timestamp: '2026-03-27 08:15' },
            { id: 'm03', type: 'admin', author: 'AI Team', authorRole: 'Engineering', content: 'Confirmed the issue. The batch size for the CTranslate2 backend needs to be reduced for files >30min. We are testing a chunked processing approach that splits audio into 15-minute segments. Fix ETA: 24-48 hours.', timestamp: '2026-03-27 09:30' },
        ]},
    { id: 't02', number: 'TKT-002', subject: 'Camera CAM-03 and CAM-09 offline since yesterday', description: 'Two surveillance cameras in the Zagreb port area stopped transmitting. RTSP streams timeout. Physical access needed for inspection.', status: 'in_progress', priority: 'high', category: 'hardware', reporter: 'Cpt. Horvat', reporterEmail: 'horvat@argux.mil', assignee: 'IT Support', createdAt: '2026-03-26 14:20', updatedAt: '2026-03-27 07:45', tags: ['cameras', 'hardware', 'port', 'RTSP'],
        messages: [
            { id: 'm04', type: 'user', author: 'Cpt. Horvat', authorRole: 'Operations', content: 'CAM-03 (Port Terminal East) and CAM-09 (Port Terminal West) are both offline. No video feed since yesterday 13:00. These are critical for OP HAWK surveillance coverage of the port area.', timestamp: '2026-03-26 14:20' },
            { id: 'm05', type: 'system', author: 'System', content: 'Ticket created. Assigned to IT Support.', timestamp: '2026-03-26 14:20' },
            { id: 'm06', type: 'admin', author: 'IT Support', authorRole: 'Infrastructure', content: 'Ping tests confirm both cameras are unreachable. Power supply issue suspected — both are on the same PoE switch (Port Terminal Building B). Field team dispatched for physical inspection at 08:00 tomorrow.', timestamp: '2026-03-26 16:30' },
            { id: 'm07', type: 'admin', author: 'IT Support', authorRole: 'Infrastructure', content: 'Field team confirmed: PoE switch in Building B failed. Replacement unit sourced. Installation scheduled for 14:00 today.', timestamp: '2026-03-27 07:45' },
        ]},
    { id: 't03', number: 'TKT-003', subject: 'Request: Bulk export of person records to PDF', description: 'Need ability to select multiple persons and generate a combined intelligence report as a single PDF document.', status: 'waiting', priority: 'medium', category: 'feature', reporter: 'Maj. Novak', reporterEmail: 'novak@argux.mil', assignee: 'Col. Tomić', createdAt: '2026-03-25 10:00', updatedAt: '2026-03-26 11:15', tags: ['export', 'PDF', 'reports', 'bulk'],
        messages: [
            { id: 'm08', type: 'user', author: 'Maj. Novak', authorRole: 'Analysis Lead', content: 'Currently we can only generate reports for individual persons. For briefings, I need to compile reports for 5-10 subjects into a single document. Can we add a bulk export feature to the Reports module?', timestamp: '2026-03-25 10:00' },
            { id: 'm09', type: 'system', author: 'System', content: 'Ticket created. Assigned to Col. Tomić for review.', timestamp: '2026-03-25 10:00' },
            { id: 'm10', type: 'admin', author: 'Col. Tomić', authorRole: 'System Admin', content: 'Good request. This aligns with the planned Report Generator enhancements. Moving to backlog for sprint planning. Waiting on resource allocation.', timestamp: '2026-03-26 11:15' },
        ]},
    { id: 't04', number: 'TKT-004', subject: 'New operator onboarding — Lt. Perić needs access', description: 'Lt. Ana Perić transferred from Zagreb PD. Needs full operator access with Intelligence and Monitoring modules.', status: 'resolved', priority: 'medium', category: 'access', reporter: 'Maj. Novak', reporterEmail: 'novak@argux.mil', assignee: 'Col. Tomić', createdAt: '2026-03-24 09:00', updatedAt: '2026-03-25 14:30', resolvedAt: '2026-03-25 14:30', tags: ['access', 'onboarding', 'new-user'],
        messages: [
            { id: 'm11', type: 'user', author: 'Maj. Novak', authorRole: 'Analysis Lead', content: 'Lt. Ana Perić (badge #4721) transferred from Zagreb PD Intelligence Unit. Please create operator account with:\n- Role: Intelligence Analyst\n- Modules: Intelligence, Monitoring, Analysis, Tools\n- Operations: HAWK, GLACIER\n- Email: a.peric@argux.mil', timestamp: '2026-03-24 09:00' },
            { id: 'm12', type: 'admin', author: 'Col. Tomić', authorRole: 'System Admin', content: 'Account created. Credentials sent via secure channel. 2FA enrollment required on first login. Access provisioned for requested modules and operations.', timestamp: '2026-03-25 14:30' },
            { id: 'm13', type: 'system', author: 'System', content: 'Ticket resolved by Col. Tomić.', timestamp: '2026-03-25 14:30' },
        ]},
    { id: 't05', number: 'TKT-005', subject: 'Kafka consumer lag spike during peak hours', description: 'Event ingestion queue builds up significantly between 08:00-10:00 causing delayed alert delivery.', status: 'in_progress', priority: 'high', category: 'network', reporter: 'IT Support', reporterEmail: 'itsupport@argux.mil', assignee: 'IT Support', createdAt: '2026-03-23 11:00', updatedAt: '2026-03-26 16:00', tags: ['kafka', 'performance', 'queue', 'alerts'],
        messages: [
            { id: 'm14', type: 'user', author: 'IT Support', authorRole: 'Infrastructure', content: 'Monitoring shows Kafka consumer lag reaching 5000+ events between 08:00-10:00 daily. This corresponds to shift change when all operators log in and data sources sync. Alert delivery delayed by up to 45 seconds during peak.', timestamp: '2026-03-23 11:00' },
            { id: 'm15', type: 'admin', author: 'IT Support', authorRole: 'Infrastructure', content: 'Added 2 additional consumer instances. Staggered data source sync times to reduce burst. Monitoring improvement over next 48 hours.', timestamp: '2026-03-26 16:00' },
        ]},
    { id: 't06', number: 'TKT-006', subject: 'Connections graph crashes with 500+ nodes', description: 'The force-directed graph visualization becomes unresponsive when displaying more than ~500 entity nodes.', status: 'open', priority: 'medium', category: 'bug', reporter: 'Lt. Perić', reporterEmail: 'peric@argux.mil', assignee: 'Unassigned', createdAt: '2026-03-27 07:30', updatedAt: '2026-03-27 07:30', tags: ['connections', 'graph', 'performance', 'D3'],
        messages: [
            { id: 'm16', type: 'user', author: 'Lt. Perić', authorRole: 'Intelligence Analyst', content: 'When loading the full connections graph without filters (all persons + organizations), the page freezes for 10+ seconds and sometimes the browser tab crashes. Works fine with <200 nodes. Need to visualize the full network for OP HAWK briefing.', timestamp: '2026-03-27 07:30' },
            { id: 'm17', type: 'system', author: 'System', content: 'Ticket created. Awaiting assignment.', timestamp: '2026-03-27 07:30' },
        ]},
    { id: 't07', number: 'TKT-007', subject: 'Request: Arabic language UI translation', description: 'Need ARGUX interface translated to Arabic for regional deployment.', status: 'closed', priority: 'low', category: 'feature', reporter: 'Col. Tomić', reporterEmail: 'tomic@argux.mil', assignee: 'Col. Tomić', createdAt: '2026-03-15 09:00', updatedAt: '2026-03-20 17:00', resolvedAt: '2026-03-20 17:00', tags: ['i18n', 'arabic', 'RTL', 'localization'],
        messages: [
            { id: 'm18', type: 'user', author: 'Col. Tomić', authorRole: 'System Admin', content: 'Regional partner requested Arabic language interface. This requires RTL layout support and full UI string translation.', timestamp: '2026-03-15 09:00' },
            { id: 'm19', type: 'admin', author: 'Col. Tomić', authorRole: 'System Admin', content: 'Evaluated scope: 2000+ translation keys, RTL layout adaptation. Scheduled for Q3 2026 release. Closing ticket — tracked in product roadmap.', timestamp: '2026-03-20 17:00' },
            { id: 'm20', type: 'system', author: 'System', content: 'Ticket closed.', timestamp: '2026-03-20 17:00' },
        ]},
    { id: 't08', number: 'TKT-008', subject: 'InsightFace confidence scores inconsistent after model update', description: 'Face recognition confidence scores dropped 10-15% after the latest ArcFace model update.', status: 'resolved', priority: 'high', category: 'bug', reporter: 'Sgt. Matić', reporterEmail: 'matic@argux.mil', assignee: 'AI Team', createdAt: '2026-03-21 13:00', updatedAt: '2026-03-24 10:00', resolvedAt: '2026-03-24 10:00', tags: ['face-recognition', 'InsightFace', 'model', 'confidence'],
        messages: [
            { id: 'm21', type: 'user', author: 'Sgt. Matić', authorRole: 'Field Intelligence', content: 'After the ArcFace model was updated on March 20th, face recognition confidence scores dropped significantly. A match that was previously 94% now shows 79%. Multiple operators reporting similar drops.', timestamp: '2026-03-21 13:00' },
            { id: 'm22', type: 'admin', author: 'AI Team', authorRole: 'Engineering', content: 'Investigated — the new model uses a different normalization layer. We need to adjust the confidence threshold calibration. Rolling back to previous model version while we recalibrate.', timestamp: '2026-03-22 09:00' },
            { id: 'm23', type: 'admin', author: 'AI Team', authorRole: 'Engineering', content: 'Recalibrated model deployed. Confidence scores restored to expected levels. Verified against test set: 94% match accuracy restored. Keeping this ticket for 48h monitoring.', timestamp: '2026-03-24 10:00' },
            { id: 'm24', type: 'system', author: 'System', content: 'Ticket resolved by AI Team.', timestamp: '2026-03-24 10:00' },
        ]},
    { id: 't09', number: 'TKT-009', subject: 'Training session request — New surveillance workflows', description: 'Team Alpha needs training on the new workflow builder and automated alert escalation features.', status: 'waiting', priority: 'low', category: 'training', reporter: 'Cpt. Horvat', reporterEmail: 'horvat@argux.mil', assignee: 'Maj. Novak', createdAt: '2026-03-22 15:00', updatedAt: '2026-03-23 09:00', tags: ['training', 'workflows', 'team-alpha'],
        messages: [
            { id: 'm25', type: 'user', author: 'Cpt. Horvat', authorRole: 'Operations', content: 'Team Alpha (6 operators) needs training on:\n1. New workflow Kanban builder\n2. Automated alert escalation chains\n3. Operation-scoped AI queries\n\nPreferred time: Week of March 31st, afternoon sessions.', timestamp: '2026-03-22 15:00' },
            { id: 'm26', type: 'admin', author: 'Maj. Novak', authorRole: 'Analysis Lead', content: 'Confirmed. Training scheduled for April 1-2, 14:00-16:00. Room 304. Please ensure all Team Alpha members have updated their ARGUX client to v0.25+.', timestamp: '2026-03-23 09:00' },
        ]},
    { id: 't10', number: 'TKT-010', subject: 'LPR camera misreading Croatian plates with diacritics', description: 'YOLOv8 + PaddleOCR occasionally misreads Croatian license plates containing characters like Č, Ž, Š.', status: 'open', priority: 'medium', category: 'data', reporter: 'Lt. Perić', reporterEmail: 'peric@argux.mil', assignee: 'AI Team', createdAt: '2026-03-26 16:30', updatedAt: '2026-03-26 16:30', tags: ['LPR', 'OCR', 'diacritics', 'Croatian'],
        messages: [
            { id: 'm27', type: 'user', author: 'Lt. Perić', authorRole: 'Intelligence Analyst', content: 'PaddleOCR misreads plates with Croatian diacritics ~15% of the time. Examples:\n- ZG-ČK-123 read as ZG-CK-123\n- RI-ŽB-456 read as RI-ZB-456\n\nThis causes missed matches in the vehicle tracking system.', timestamp: '2026-03-26 16:30' },
            { id: 'm28', type: 'system', author: 'System', content: 'Ticket created. Assigned to AI Team.', timestamp: '2026-03-26 16:30' },
        ]},
    { id: 't11', number: 'TKT-011', subject: 'Request: Dark mode for admin print reports', description: 'Printed intelligence reports always use light theme. Need option to generate dark-themed PDFs.', status: 'closed', priority: 'low', category: 'feature', reporter: 'Maj. Novak', reporterEmail: 'novak@argux.mil', assignee: 'Col. Tomić', createdAt: '2026-03-10 11:00', updatedAt: '2026-03-12 14:00', resolvedAt: '2026-03-12 14:00', tags: ['print', 'PDF', 'dark-mode', 'reports'],
        messages: [
            { id: 'm29', type: 'user', author: 'Maj. Novak', authorRole: 'Analysis Lead', content: 'Currently all PDF reports are generated with white background. For secure facilities with dim lighting, a dark-themed PDF option would be easier to read on screens.', timestamp: '2026-03-10 11:00' },
            { id: 'm30', type: 'admin', author: 'Col. Tomić', authorRole: 'System Admin', content: 'Noted but low priority. Standard practice is light-themed documents for printing and archival. Closing — may revisit in future UX update.', timestamp: '2026-03-12 14:00' },
        ]},
    { id: 't12', number: 'TKT-012', subject: 'Unauthorized SSH access attempt on Node 3', description: 'Security alert: Multiple failed SSH login attempts detected on the ClickHouse analytics node.', status: 'resolved', priority: 'critical', category: 'security', reporter: 'Security Team', reporterEmail: 'security@argux.mil', assignee: 'Security Team', createdAt: '2026-03-25 03:15', updatedAt: '2026-03-25 16:00', resolvedAt: '2026-03-25 16:00', tags: ['security', 'SSH', 'intrusion', 'clickhouse'],
        messages: [
            { id: 'm31', type: 'user', author: 'Security Team', authorRole: 'Security', content: 'IDS detected 247 failed SSH login attempts on ClickHouse Node 3 (10.0.1.43) between 02:00-03:00. Source IP: 192.168.50.12 — internal network. Brute force pattern detected.', timestamp: '2026-03-25 03:15' },
            { id: 'm32', type: 'system', author: 'System', content: 'CRITICAL: Security ticket auto-escalated.', timestamp: '2026-03-25 03:15' },
            { id: 'm33', type: 'admin', author: 'Security Team', authorRole: 'Security', content: 'Source IP belongs to decommissioned monitoring station in Building C. IP blocked at firewall. Node 3 SSH hardened: key-only auth enforced, fail2ban threshold lowered. Full audit in progress.', timestamp: '2026-03-25 06:00' },
            { id: 'm34', type: 'admin', author: 'Security Team', authorRole: 'Security', content: 'Audit complete. No successful access. Old monitoring station was not properly decommissioned — still had automated scripts running. Station physically disconnected and wiped. Incident report filed.', timestamp: '2026-03-25 16:00' },
            { id: 'm35', type: 'system', author: 'System', content: 'Ticket resolved.', timestamp: '2026-03-25 16:00' },
        ]},
];

export const keyboardShortcuts = [
    { key: 'N', description: 'New ticket' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters' },
    { key: 'Esc', description: 'Close panel / modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
