/**
 * ARGUX — Admin Audit Log Mock Data
 * Immutable system activity log with cryptographic integrity hashes
 */

export type ActionType = 'login' | 'logout' | 'view' | 'create' | 'update' | 'delete' | 'export' | 'import' | 'config' | 'alert' | 'assign' | 'revoke' | 'search' | 'ai_query' | 'sync' | 'deploy' | 'failed_login' | 'mfa_verify' | 'session_kill' | 'backup';
export type Severity = 'info' | 'warning' | 'critical' | 'success';
export type Module = 'auth' | 'persons' | 'organizations' | 'vehicles' | 'devices' | 'map' | 'operations' | 'alerts' | 'connections' | 'face_recognition' | 'lpr' | 'scraper' | 'ai_assistant' | 'reports' | 'storage' | 'admin' | 'config' | 'data_sources' | 'workflows' | 'system';

export interface AuditEntry {
    id: string; timestamp: string; user: string; userRole: string; userId: number;
    action: ActionType; severity: Severity; module: Module;
    target: string; targetId?: string; description: string;
    ip: string; userAgent: string; sessionId: string;
    integrityHash: string; previousHash: string;
    metadata?: Record<string, string>;
}

export const actionConfig: Record<ActionType, { label: string; icon: string; color: string }> = {
    login:        { label: 'Login', icon: '🔐', color: '#22c55e' },
    logout:       { label: 'Logout', icon: '🚪', color: '#6b7280' },
    view:         { label: 'View', icon: '👁️', color: '#3b82f6' },
    create:       { label: 'Create', icon: '➕', color: '#22c55e' },
    update:       { label: 'Update', icon: '✏️', color: '#f59e0b' },
    delete:       { label: 'Delete', icon: '🗑️', color: '#ef4444' },
    export:       { label: 'Export', icon: '📤', color: '#8b5cf6' },
    import:       { label: 'Import', icon: '📥', color: '#06b6d4' },
    config:       { label: 'Config Change', icon: '⚙️', color: '#f59e0b' },
    alert:        { label: 'Alert Triggered', icon: '🚨', color: '#ef4444' },
    assign:       { label: 'Assign', icon: '🔗', color: '#3b82f6' },
    revoke:       { label: 'Revoke', icon: '🔒', color: '#f97316' },
    search:       { label: 'Search', icon: '🔍', color: '#6b7280' },
    ai_query:     { label: 'AI Query', icon: '🤖', color: '#ec4899' },
    sync:         { label: 'Data Sync', icon: '📡', color: '#06b6d4' },
    deploy:       { label: 'Deploy', icon: '🚀', color: '#8b5cf6' },
    failed_login: { label: 'Failed Login', icon: '⚠️', color: '#ef4444' },
    mfa_verify:   { label: 'MFA Verify', icon: '🔑', color: '#22c55e' },
    session_kill: { label: 'Session Kill', icon: '💀', color: '#ef4444' },
    backup:       { label: 'Backup', icon: '💾', color: '#06b6d4' },
};

export const severityConfig: Record<Severity, { label: string; color: string }> = {
    info:     { label: 'Info', color: '#3b82f6' },
    success:  { label: 'Success', color: '#22c55e' },
    warning:  { label: 'Warning', color: '#f59e0b' },
    critical: { label: 'Critical', color: '#ef4444' },
};

export const moduleConfig: Record<Module, { label: string; icon: string }> = {
    auth:             { label: 'Authentication', icon: '🔐' },
    persons:          { label: 'Persons', icon: '👤' },
    organizations:    { label: 'Organizations', icon: '🏢' },
    vehicles:         { label: 'Vehicles', icon: '🚗' },
    devices:          { label: 'Devices', icon: '📡' },
    map:              { label: 'Tactical Map', icon: '🗺️' },
    operations:       { label: 'Operations', icon: '🎯' },
    alerts:           { label: 'Alerts', icon: '🚨' },
    connections:      { label: 'Connections', icon: '🔗' },
    face_recognition: { label: 'Face Recognition', icon: '🧑' },
    lpr:              { label: 'Plate Recognition', icon: '🔢' },
    scraper:          { label: 'Scrapers', icon: '🌐' },
    ai_assistant:     { label: 'AI Assistant', icon: '🤖' },
    reports:          { label: 'Reports', icon: '📊' },
    storage:          { label: 'Storage', icon: '📁' },
    admin:            { label: 'Admin Panel', icon: '⚙️' },
    config:           { label: 'Configuration', icon: '🔧' },
    data_sources:     { label: 'Data Sources', icon: '💾' },
    workflows:        { label: 'Workflows', icon: '📋' },
    system:           { label: 'System', icon: '🖥️' },
};

const h = (i: number) => `sha256:${(0xA3F7B2C0 + i * 0x1E3D5A7B).toString(16).padStart(8, '0')}...${(0xD4E8F100 + i * 0x2B4C6D8E).toString(16).padStart(8, '0')}`;

export const users = [
    { id: 1, name: 'Col. Tomić', role: 'System Admin' },
    { id: 2, name: 'Maj. Novak', role: 'Analysis Lead' },
    { id: 3, name: 'Cpt. Horvat', role: 'Operations' },
    { id: 4, name: 'Sgt. Matić', role: 'Field Intelligence' },
    { id: 5, name: 'Lt. Perić', role: 'Intelligence Analyst' },
    { id: 6, name: 'IT Support', role: 'Infrastructure' },
    { id: 7, name: 'AI Team', role: 'Engineering' },
    { id: 8, name: 'Security Team', role: 'Security' },
    { id: 0, name: 'System', role: 'Automated' },
];

export const ips = ['10.0.1.10', '10.0.1.15', '10.0.1.22', '10.0.1.30', '10.0.1.45', '10.0.2.5', '10.0.2.12', '10.0.3.1', '192.168.1.100', '192.168.50.12'];

export const mockAuditEntries: AuditEntry[] = [
    { id: 'a01', timestamp: '2026-03-27 09:32:14', user: 'Col. Tomić', userRole: 'System Admin', userId: 1, action: 'login', severity: 'success', module: 'auth', target: 'Session', description: 'Successful admin login via 2FA (Authenticator App)', ip: '10.0.1.10', userAgent: 'Chrome 124 / Windows 11', sessionId: 'sess_a7f3b2', integrityHash: h(1), previousHash: h(0) },
    { id: 'a02', timestamp: '2026-03-27 09:30:05', user: 'Sgt. Matić', userRole: 'Field Intelligence', userId: 4, action: 'ai_query', severity: 'info', module: 'ai_assistant', target: 'Person #1 — Marko Horvat', targetId: 'p-1', description: 'AI query: "Summarize all recent activity for Horvat including co-location events"', ip: '10.0.1.22', userAgent: 'Chrome 124 / Ubuntu 24', sessionId: 'sess_c4d8e1', integrityHash: h(2), previousHash: h(1), metadata: { model: 'LLaMA 3.1 70B', tokens: '2,847' } },
    { id: 'a03', timestamp: '2026-03-27 09:28:41', user: 'System', userRole: 'Automated', userId: 0, action: 'alert', severity: 'critical', module: 'alerts', target: 'Alert Rule #7 — Co-location', description: 'Co-location alert triggered: Horvat + Mendoza within 50m at Savska 41, Zagreb', ip: '10.0.3.1', userAgent: 'ARGUX Alert Engine v3.2', sessionId: 'sys_alert', integrityHash: h(3), previousHash: h(2), metadata: { subjects: 'Horvat, Mendoza', distance: '23m', location: '45.8064,15.9706' } },
    { id: 'a04', timestamp: '2026-03-27 09:25:18', user: 'Lt. Perić', userRole: 'Intelligence Analyst', userId: 5, action: 'view', severity: 'info', module: 'persons', target: 'Person #12 — Ivan Babić', targetId: 'p-12', description: 'Viewed person detail page: Basic, Connections, Events tabs', ip: '10.0.1.45', userAgent: 'Firefox 125 / macOS 15', sessionId: 'sess_f2a9c3', integrityHash: h(4), previousHash: h(3) },
    { id: 'a05', timestamp: '2026-03-27 09:22:33', user: 'Cpt. Horvat', userRole: 'Operations', userId: 3, action: 'update', severity: 'warning', module: 'operations', target: 'Operation HAWK', targetId: 'op-1', description: 'Updated operation phase: Preparation → Active. Added 3 new team members.', ip: '10.0.1.30', userAgent: 'Chrome 124 / Windows 11', sessionId: 'sess_b5e7d4', integrityHash: h(5), previousHash: h(4), metadata: { old_phase: 'Preparation', new_phase: 'Active', members_added: '3' } },
    { id: 'a06', timestamp: '2026-03-27 09:20:00', user: 'System', userRole: 'Automated', userId: 0, action: 'sync', severity: 'success', module: 'data_sources', target: 'INTERPOL I-24/7', description: 'Data source sync completed. 847 records updated, 12 new entries, 0 errors.', ip: '10.0.3.1', userAgent: 'ARGUX Sync Worker v2.1', sessionId: 'sys_sync', integrityHash: h(6), previousHash: h(5), metadata: { records: '847', new: '12', errors: '0', duration: '34s' } },
    { id: 'a07', timestamp: '2026-03-27 09:18:12', user: 'Maj. Novak', userRole: 'Analysis Lead', userId: 2, action: 'export', severity: 'info', module: 'reports', target: 'Person Report — Marko Horvat', targetId: 'rpt-42', description: 'Exported intelligence report to PDF. 14 sections, 23 pages. Classification: CLASSIFIED // NOFORN.', ip: '10.0.1.15', userAgent: 'Chrome 124 / macOS 15', sessionId: 'sess_d1c6b8', integrityHash: h(7), previousHash: h(6), metadata: { format: 'PDF', pages: '23', classification: 'CLASSIFIED' } },
    { id: 'a08', timestamp: '2026-03-27 09:15:44', user: 'IT Support', userRole: 'Infrastructure', userId: 6, action: 'config', severity: 'warning', module: 'config', target: 'Alert Configuration', description: 'Changed alert cooldown from 5 minutes to 3 minutes for all severity levels.', ip: '10.0.2.5', userAgent: 'Chrome 124 / Ubuntu 24', sessionId: 'sess_e8f4a2', integrityHash: h(8), previousHash: h(7), metadata: { setting: 'alert.cooldown', old_value: '300s', new_value: '180s' } },
    { id: 'a09', timestamp: '2026-03-27 09:12:08', user: 'Sgt. Matić', userRole: 'Field Intelligence', userId: 4, action: 'create', severity: 'success', module: 'face_recognition', target: 'Face Search — Horvat', targetId: 'fs-87', description: 'Initiated face recognition search. Uploaded reference photo. 3 matches found (94%, 89%, 76%).', ip: '10.0.1.22', userAgent: 'Chrome 124 / Ubuntu 24', sessionId: 'sess_c4d8e1', integrityHash: h(9), previousHash: h(8), metadata: { matches: '3', top_confidence: '94%' } },
    { id: 'a10', timestamp: '2026-03-27 09:10:30', user: 'Col. Tomić', userRole: 'System Admin', userId: 1, action: 'create', severity: 'success', module: 'admin', target: 'User Account — Lt. Perić', targetId: 'u-5', description: 'Created new operator account for Lt. Ana Perić. Role: Intelligence Analyst. Modules: Intelligence, Monitoring, Analysis, Tools.', ip: '10.0.1.10', userAgent: 'Chrome 124 / Windows 11', sessionId: 'sess_a7f3b2', integrityHash: h(10), previousHash: h(9), metadata: { role: 'Intelligence Analyst', modules: '4' } },
    { id: 'a11', timestamp: '2026-03-27 09:05:22', user: 'System', userRole: 'Automated', userId: 0, action: 'backup', severity: 'success', module: 'system', target: 'Database Backup', description: 'Incremental backup completed. Size: 2.4 TB. Integrity verification: PASSED. Encryption: AES-256.', ip: '10.0.3.1', userAgent: 'ARGUX Backup Agent v1.4', sessionId: 'sys_backup', integrityHash: h(11), previousHash: h(10), metadata: { size: '2.4 TB', type: 'incremental', verification: 'PASSED' } },
    { id: 'a12', timestamp: '2026-03-27 08:58:17', user: 'Lt. Perić', userRole: 'Intelligence Analyst', userId: 5, action: 'search', severity: 'info', module: 'persons', target: 'Global Search', description: 'Search query: "Mendoza port Thursday". Results: 4 persons, 8 events, 2 records.', ip: '10.0.1.45', userAgent: 'Firefox 125 / macOS 15', sessionId: 'sess_f2a9c3', integrityHash: h(12), previousHash: h(11), metadata: { query: 'Mendoza port Thursday', results: '14' } },
    { id: 'a13', timestamp: '2026-03-27 08:55:00', user: 'System', userRole: 'Automated', userId: 0, action: 'alert', severity: 'warning', module: 'devices', target: 'Camera CAM-03', description: 'Device offline alert: Camera CAM-03 (Port Terminal East) lost connection. Last signal: 08:54:45.', ip: '10.0.3.1', userAgent: 'ARGUX Device Monitor v2.0', sessionId: 'sys_device', integrityHash: h(13), previousHash: h(12) },
    { id: 'a14', timestamp: '2026-03-27 08:50:33', user: 'Cpt. Horvat', userRole: 'Operations', userId: 3, action: 'assign', severity: 'info', module: 'operations', target: 'Operation HAWK — Team Alpha', description: 'Assigned Team Alpha to Operation HAWK surveillance rotation. 6 operators, 4-hour shifts.', ip: '10.0.1.30', userAgent: 'Chrome 124 / Windows 11', sessionId: 'sess_b5e7d4', integrityHash: h(14), previousHash: h(13) },
    { id: 'a15', timestamp: '2026-03-27 08:45:11', user: 'Maj. Novak', userRole: 'Analysis Lead', userId: 2, action: 'view', severity: 'info', module: 'connections', target: 'Connections Graph — Full Network', description: 'Viewed full connections graph. Nodes: 387. Edges: 1,204. Applied filter: OP HAWK entities only.', ip: '10.0.1.15', userAgent: 'Chrome 124 / macOS 15', sessionId: 'sess_d1c6b8', integrityHash: h(15), previousHash: h(14) },
    { id: 'a16', timestamp: '2026-03-27 08:40:28', user: 'Security Team', userRole: 'Security', userId: 8, action: 'session_kill', severity: 'critical', module: 'admin', target: 'Session sess_x9z2m1 — Unknown', description: 'Force-terminated suspicious session from IP 192.168.50.12. Reason: Unauthorized access attempt on ClickHouse node.', ip: '10.0.2.12', userAgent: 'Chrome 124 / Windows 11', sessionId: 'sess_g3h5j7', integrityHash: h(16), previousHash: h(15), metadata: { killed_ip: '192.168.50.12', reason: 'Unauthorized SSH' } },
    { id: 'a17', timestamp: '2026-03-27 08:35:50', user: 'Unknown', userRole: 'N/A', userId: 0, action: 'failed_login', severity: 'critical', module: 'auth', target: 'Login Page', description: 'Failed login attempt #4 from 192.168.50.12. Account lockout triggered after 3 failures.', ip: '192.168.50.12', userAgent: 'curl/8.1', sessionId: 'n/a', integrityHash: h(17), previousHash: h(16), metadata: { attempts: '4', lockout: 'true' } },
    { id: 'a18', timestamp: '2026-03-27 08:30:15', user: 'AI Team', userRole: 'Engineering', userId: 7, action: 'deploy', severity: 'warning', module: 'system', target: 'Faster-Whisper Large-v3', description: 'Deployed updated Faster-Whisper model. GPU allocation: 12GB VRAM. Batch size reduced for stability.', ip: '10.0.2.5', userAgent: 'Chrome 124 / Ubuntu 24', sessionId: 'sess_k1m3n5', integrityHash: h(18), previousHash: h(17), metadata: { model: 'Faster-Whisper Large-v3', gpu_vram: '12GB' } },
    { id: 'a19', timestamp: '2026-03-27 08:25:00', user: 'Sgt. Matić', userRole: 'Field Intelligence', userId: 4, action: 'create', severity: 'success', module: 'lpr', target: 'LPR Alert — ZG-1847-AB', description: 'Created LPR watch for plate ZG-1847-AB (Horvat vehicle). All LPR cameras activated.', ip: '10.0.1.22', userAgent: 'Chrome 124 / Ubuntu 24', sessionId: 'sess_c4d8e1', integrityHash: h(19), previousHash: h(18) },
    { id: 'a20', timestamp: '2026-03-27 08:20:44', user: 'Col. Tomić', userRole: 'System Admin', userId: 1, action: 'config', severity: 'warning', module: 'config', target: 'Security Settings', description: 'Updated MFA enforcement: Optional → Required for all users. Grace period: 48 hours.', ip: '10.0.1.10', userAgent: 'Chrome 124 / Windows 11', sessionId: 'sess_a7f3b2', integrityHash: h(20), previousHash: h(19), metadata: { setting: 'security.mfa', old_value: 'optional', new_value: 'required' } },
    { id: 'a21', timestamp: '2026-03-27 08:15:30', user: 'System', userRole: 'Automated', userId: 0, action: 'sync', severity: 'success', module: 'data_sources', target: 'EU Sanctions List CFSP', description: 'Sanctions list sync completed. 12 new entries added, 3 entries removed. Total: 8,421 records.', ip: '10.0.3.1', userAgent: 'ARGUX Sync Worker v2.1', sessionId: 'sys_sync', integrityHash: h(21), previousHash: h(20), metadata: { added: '12', removed: '3', total: '8421' } },
    { id: 'a22', timestamp: '2026-03-27 08:10:18', user: 'Lt. Perić', userRole: 'Intelligence Analyst', userId: 5, action: 'mfa_verify', severity: 'success', module: 'auth', target: 'Session', description: 'MFA verification successful (Authenticator App). Session established.', ip: '10.0.1.45', userAgent: 'Firefox 125 / macOS 15', sessionId: 'sess_f2a9c3', integrityHash: h(22), previousHash: h(21) },
    { id: 'a23', timestamp: '2026-03-27 08:10:10', user: 'Lt. Perić', userRole: 'Intelligence Analyst', userId: 5, action: 'login', severity: 'success', module: 'auth', target: 'Session', description: 'Successful operator login. Redirected to 2FA verification.', ip: '10.0.1.45', userAgent: 'Firefox 125 / macOS 15', sessionId: 'sess_f2a9c3', integrityHash: h(23), previousHash: h(22) },
    { id: 'a24', timestamp: '2026-03-27 08:05:00', user: 'Cpt. Horvat', userRole: 'Operations', userId: 3, action: 'view', severity: 'info', module: 'map', target: 'Tactical Map', description: 'Opened tactical map. Loaded 247 markers, 12 zones, 5 active tracks. Tile provider: CartoDB Dark.', ip: '10.0.1.30', userAgent: 'Chrome 124 / Windows 11', sessionId: 'sess_b5e7d4', integrityHash: h(24), previousHash: h(23), metadata: { markers: '247', zones: '12', tracks: '5' } },
    { id: 'a25', timestamp: '2026-03-27 07:55:33', user: 'Maj. Novak', userRole: 'Analysis Lead', userId: 2, action: 'update', severity: 'info', module: 'persons', target: 'Person #9 — Carlos Mendoza', targetId: 'p-9', description: 'Updated risk level: High → Critical. Added note: "Night activity pattern confirmed by CAM-12."', ip: '10.0.1.15', userAgent: 'Chrome 124 / macOS 15', sessionId: 'sess_d1c6b8', integrityHash: h(25), previousHash: h(24), metadata: { field: 'risk', old_value: 'High', new_value: 'Critical' } },
    { id: 'a26', timestamp: '2026-03-27 07:50:00', user: 'System', userRole: 'Automated', userId: 0, action: 'alert', severity: 'warning', module: 'alerts', target: 'Alert Rule #3 — LPR Match', description: 'LPR match: Plate ZG-1847-AB detected at Vukovarska checkpoint (CAM-LPR-04). Subject: Horvat.', ip: '10.0.3.1', userAgent: 'ARGUX LPR Engine v1.8', sessionId: 'sys_lpr', integrityHash: h(26), previousHash: h(25) },
    { id: 'a27', timestamp: '2026-03-27 07:45:12', user: 'IT Support', userRole: 'Infrastructure', userId: 6, action: 'delete', severity: 'warning', module: 'storage', target: 'Archived Logs — Jan 2026', description: 'Deleted archived system logs from January 2026. Size freed: 45 GB. Retention policy: 90 days.', ip: '10.0.2.5', userAgent: 'Chrome 124 / Ubuntu 24', sessionId: 'sess_e8f4a2', integrityHash: h(27), previousHash: h(26), metadata: { size_freed: '45 GB', retention: '90 days' } },
    { id: 'a28', timestamp: '2026-03-27 07:40:00', user: 'Sgt. Matić', userRole: 'Field Intelligence', userId: 4, action: 'create', severity: 'success', module: 'workflows', target: 'Workflow — HAWK Port Monitor', description: 'Created automated workflow: HAWK Port Monitor. Trigger: Zone entry (Port Area). Actions: Alert + Track + Notify.', ip: '10.0.1.22', userAgent: 'Chrome 124 / Ubuntu 24', sessionId: 'sess_c4d8e1', integrityHash: h(28), previousHash: h(27) },
    { id: 'a29', timestamp: '2026-03-27 07:30:45', user: 'Col. Tomić', userRole: 'System Admin', userId: 1, action: 'revoke', severity: 'critical', module: 'admin', target: 'User #99 — Deactivated Account', targetId: 'u-99', description: 'Revoked all access for deactivated user account. Sessions terminated. API keys invalidated.', ip: '10.0.1.10', userAgent: 'Chrome 124 / Windows 11', sessionId: 'sess_a7f3b2', integrityHash: h(29), previousHash: h(28) },
    { id: 'a30', timestamp: '2026-03-27 07:20:00', user: 'System', userRole: 'Automated', userId: 0, action: 'import', severity: 'success', module: 'data_sources', target: 'National Vehicle Registry', description: 'Vehicle registry import completed. 1,247 records updated. Duration: 12 minutes.', ip: '10.0.3.1', userAgent: 'ARGUX Sync Worker v2.1', sessionId: 'sys_sync', integrityHash: h(30), previousHash: h(29), metadata: { records: '1247', duration: '12m' } },
];

export const keyboardShortcuts = [
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset all filters' },
    { key: '←', description: 'Previous page' },
    { key: '→', description: 'Next page' },
    { key: 'Esc', description: 'Close detail / modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
