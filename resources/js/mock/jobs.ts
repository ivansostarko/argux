/**
 * ARGUX — Background Jobs Mock Data
 * 30 jobs, 6 workers, type/status/priority configs, shortcuts
 */

export type JobStatus = 'Running' | 'Queued' | 'Completed' | 'Failed' | 'Cancelled' | 'Retrying';
export type JobType = 'data_sync' | 'ai_inference' | 'report_gen' | 'bulk_export' | 'media_process' | 'face_search' | 'scraper_run' | 'backup' | 'lpr_batch' | 'workflow_exec';
export type Priority = 'Critical' | 'High' | 'Normal' | 'Low';
export type ViewTab = 'all' | 'running' | 'queued' | 'completed' | 'failed' | 'workers';

export interface Job {
    id: string; name: string; type: JobType; status: JobStatus; priority: Priority;
    progress: number; worker: string; queue: string;
    entityType?: string; entityId?: number; entityName?: string;
    operationCode: string;
    startedAt: string; estimatedEnd: string; completedAt: string; duration: string;
    initiatedBy: string; input: string; output: string; errorLog: string;
    retryCount: number; maxRetries: number; tags: string[];
}

export interface Worker {
    id: string; name: string; status: 'Active' | 'Idle' | 'Overloaded' | 'Offline';
    currentJob: string; jobsProcessed: number; uptime: string; cpu: number; memory: number;
}

export const typeConfig: Record<JobType, { icon: string; color: string; label: string }> = {
    data_sync: { icon: '🔄', color: '#3b82f6', label: 'Data Sync' },
    ai_inference: { icon: '🤖', color: '#8b5cf6', label: 'AI Inference' },
    report_gen: { icon: '📊', color: '#f59e0b', label: 'Report Generation' },
    bulk_export: { icon: '📦', color: '#06b6d4', label: 'Bulk Export' },
    media_process: { icon: '🎬', color: '#ec4899', label: 'Media Processing' },
    face_search: { icon: '🧑', color: '#10b981', label: 'Face Search' },
    scraper_run: { icon: '📱', color: '#f97316', label: 'Scraper Run' },
    backup: { icon: '💾', color: '#6b7280', label: 'System Backup' },
    lpr_batch: { icon: '🚗', color: '#22c55e', label: 'LPR Batch' },
    workflow_exec: { icon: '⚡', color: '#a855f7', label: 'Workflow Execution' },
};
export const statusColors: Record<JobStatus, string> = { Running: '#3b82f6', Queued: '#f59e0b', Completed: '#22c55e', Failed: '#ef4444', Cancelled: '#6b7280', Retrying: '#f97316' };
export const statusIcons: Record<JobStatus, string> = { Running: '⏳', Queued: '🕐', Completed: '✅', Failed: '❌', Cancelled: '⛔', Retrying: '🔄' };
export const prioColors: Record<Priority, string> = { Critical: '#ef4444', High: '#f97316', Normal: '#3b82f6', Low: '#6b7280' };

export const mockWorkers: Worker[] = [
    { id: 'w-1', name: 'Worker Alpha', status: 'Active', currentJob: 'job-01', jobsProcessed: 1247, uptime: '14d 6h', cpu: 72, memory: 68 },
    { id: 'w-2', name: 'Worker Bravo', status: 'Active', currentJob: 'job-02', jobsProcessed: 1189, uptime: '14d 6h', cpu: 45, memory: 52 },
    { id: 'w-3', name: 'Worker Charlie', status: 'Active', currentJob: 'job-03', jobsProcessed: 934, uptime: '14d 6h', cpu: 88, memory: 81 },
    { id: 'w-4', name: 'GPU Worker Delta', status: 'Active', currentJob: 'job-04', jobsProcessed: 567, uptime: '14d 6h', cpu: 34, memory: 92 },
    { id: 'w-5', name: 'Worker Echo', status: 'Idle', currentJob: '', jobsProcessed: 1102, uptime: '14d 6h', cpu: 5, memory: 22 },
    { id: 'w-6', name: 'Worker Foxtrot', status: 'Offline', currentJob: '', jobsProcessed: 845, uptime: '0', cpu: 0, memory: 0 },
];

export const mockJobs: Job[] = [
    { id: 'job-01', name: 'INTERPOL I-24/7 Sync', type: 'data_sync', status: 'Running', priority: 'Critical', progress: 67, worker: 'Worker Alpha', queue: 'sync-priority', entityName: 'INTERPOL I-24/7', operationCode: '', startedAt: '2026-03-24 10:12:00', estimatedEnd: '2026-03-24 10:13:30', completedAt: '', duration: '1m 22s', initiatedBy: 'System (Schedule)', input: 'Incremental sync: Red Notices, Stolen Vehicles, Wanted Persons', output: '67% — 2,845/4,250 records checked', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['interpol', 'sync', 'scheduled'] },
    { id: 'job-02', name: 'Horvat Movement Analysis — AI', type: 'ai_inference', status: 'Running', priority: 'High', progress: 43, worker: 'Worker Bravo', queue: 'ai-inference', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', startedAt: '2026-03-24 10:10:00', estimatedEnd: '2026-03-24 10:15:00', completedAt: '', duration: '3m 24s', initiatedBy: 'Workflow: Nightly Sweep', input: 'LLaMA 3.1 70B · Movement pattern analysis · 7 days', output: '43% — Embedding generation complete', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['HAWK', 'ai', 'llama'] },
    { id: 'job-03', name: 'Video Transcription — Port Camera', type: 'media_process', status: 'Running', priority: 'Normal', progress: 28, worker: 'Worker Charlie', queue: 'media', entityType: 'device', entityId: 16, entityName: 'Port Terminal Cam', operationCode: 'HAWK', startedAt: '2026-03-24 10:05:00', estimatedEnd: '2026-03-24 10:25:00', completedAt: '', duration: '8m 24s', initiatedBy: 'Col. Tomić', input: 'Faster-Whisper Large-v3 · 45min video · Speaker diarization', output: '28% — Audio extracted, transcription 12:40/45:00', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['HAWK', 'video', 'faster-whisper'] },
    { id: 'job-04', name: 'Face Search — Mendoza All Cameras', type: 'face_search', status: 'Running', priority: 'High', progress: 55, worker: 'GPU Worker Delta', queue: 'gpu-inference', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', operationCode: 'HAWK', startedAt: '2026-03-24 10:08:00', estimatedEnd: '2026-03-24 10:18:00', completedAt: '', duration: '5m 24s', initiatedBy: 'Cpt. Horvat', input: 'InsightFace/ArcFace · 11 cameras · 72h archive', output: '55% — 6/11 cameras, 2 matches', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['HAWK', 'face', 'gpu'] },
    { id: 'job-05', name: 'HAWK Weekly Report #5', type: 'report_gen', status: 'Queued', priority: 'High', progress: 0, worker: '', queue: 'reports', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', startedAt: '', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'Scheduled (Weekly)', input: '18 sections · 2026-03-17 to 2026-03-24', output: '', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['HAWK', 'report', 'weekly'] },
    { id: 'job-06', name: 'Social Scraper — Telegram', type: 'scraper_run', status: 'Queued', priority: 'Normal', progress: 0, worker: '', queue: 'scraper', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', operationCode: 'HAWK', startedAt: '', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (5min)', input: 'Telegram channels · Keywords: delivery, dock, urgent', output: '', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['HAWK', 'telegram'] },
    { id: 'job-07', name: 'LPR Batch — A1 Highway', type: 'lpr_batch', status: 'Queued', priority: 'Normal', progress: 0, worker: '', queue: 'lpr', entityName: 'A1 Highway Km 78', operationCode: '', startedAt: '', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (Daily)', input: 'PaddleOCR v3 · 8,420 captures · Watchlist cross-ref', output: '', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['lpr', 'paddleocr'] },
    { id: 'job-08', name: 'OpenCorporates Sync', type: 'data_sync', status: 'Queued', priority: 'Normal', progress: 0, worker: '', queue: 'sync', entityType: 'organization', entityId: 2, entityName: 'Rashid Holdings', operationCode: 'GLACIER', startedAt: '', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (4h)', input: 'OpenCorporates API · 210M+ records', output: '', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['GLACIER', 'opencorporates'] },
    { id: 'job-09', name: 'Dark Web Forum Crawl', type: 'scraper_run', status: 'Queued', priority: 'Low', progress: 0, worker: '', queue: 'scraper', entityName: 'Dark Web Forum', operationCode: '', startedAt: '', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (2h)', input: 'Tor crawler · 15 forums', output: '', errorLog: '', retryCount: 0, maxRetries: 5, tags: ['dark-web', 'tor'] },
    { id: 'job-10', name: 'Morning Briefing #24', type: 'report_gen', status: 'Completed', priority: 'High', progress: 100, worker: 'Worker Alpha', queue: 'reports', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', startedAt: '2026-03-24 06:00:00', estimatedEnd: '', completedAt: '2026-03-24 06:00:12', duration: '12.4s', initiatedBy: 'Workflow: Nightly Sweep', input: 'LLaMA 3.1 · Overnight events', output: 'Briefing #24 (8 pages). Emailed.', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['HAWK', 'briefing'] },
    { id: 'job-11', name: 'Co-location Evidence #42', type: 'workflow_exec', status: 'Completed', priority: 'Critical', progress: 100, worker: 'Worker Bravo', queue: 'workflow', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', startedAt: '2026-03-24 09:15:22', estimatedEnd: '', completedAt: '2026-03-24 09:15:24', duration: '1.5s', initiatedBy: 'Workflow: Co-location', input: 'Horvat + Mendoza · GPS + camera', output: 'Evidence #42 created. Escalated.', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['HAWK', 'evidence', 'workflow'] },
    { id: 'job-12', name: 'EU Sanctions CFSP Sync', type: 'data_sync', status: 'Completed', priority: 'Normal', progress: 100, worker: 'Worker Echo', queue: 'sync', entityName: 'EU Sanctions CFSP', operationCode: '', startedAt: '2026-03-24 10:00:00', estimatedEnd: '', completedAt: '2026-03-24 10:00:04', duration: '4.2s', initiatedBy: 'System (Hourly)', input: '12,847 entities · Incremental', output: 'No new matches.', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['sanctions', 'sync'] },
    { id: 'job-13', name: 'Vehicle Registry HAK Sync', type: 'data_sync', status: 'Completed', priority: 'Normal', progress: 100, worker: 'Worker Charlie', queue: 'sync', entityName: 'Vehicle Registry', operationCode: '', startedAt: '2026-03-24 08:30:00', estimatedEnd: '', completedAt: '2026-03-24 08:31:12', duration: '1m 12s', initiatedBy: 'System (4h)', input: 'Plate changes + insurance', output: '56 changes. ZG-1847-AB renewed.', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['vehicles', 'sync'] },
    { id: 'job-14', name: 'Anomaly Detection Batch', type: 'ai_inference', status: 'Completed', priority: 'High', progress: 100, worker: 'GPU Worker Delta', queue: 'gpu-inference', entityName: 'HAWK Subjects', operationCode: 'HAWK', startedAt: '2026-03-24 05:00:00', estimatedEnd: '', completedAt: '2026-03-24 05:00:47', duration: '47s', initiatedBy: 'Scheduled (Nightly)', input: 'LLaMA 3.1 70B + XGBoost · 4 subjects', output: '2 anomalies: Horvat surge, Mendoza counter-surv.', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['HAWK', 'anomaly', 'ai'] },
    { id: 'job-15', name: 'Full System Backup', type: 'backup', status: 'Completed', priority: 'Normal', progress: 100, worker: 'Worker Echo', queue: 'maintenance', entityName: 'System', operationCode: '', startedAt: '2026-03-24 03:00:00', estimatedEnd: '', completedAt: '2026-03-24 03:42:15', duration: '42m 15s', initiatedBy: 'System (Nightly)', input: 'Full · PostgreSQL + ClickHouse + MinIO · AES-256', output: '2.4 TB. Integrity verified.', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['backup', 'nightly'] },
    { id: 'job-25', name: 'Credit Bureau HROK Sync', type: 'data_sync', status: 'Failed', priority: 'Normal', progress: 0, worker: 'Worker Echo', queue: 'sync', entityName: 'Credit Bureau', operationCode: '', startedAt: '2026-03-22 06:00:00', estimatedEnd: '', completedAt: '2026-03-22 06:00:30', duration: '30s', initiatedBy: 'System (Daily)', input: 'SOAP · Credit scores', output: '', errorLog: 'ECONNREFUSED 10.0.22.1:443', retryCount: 3, maxRetries: 3, tags: ['error', 'connection-refused'] },
    { id: 'job-26', name: 'Dark Web Marketplace Crawl', type: 'scraper_run', status: 'Failed', priority: 'Low', progress: 12, worker: 'Worker Charlie', queue: 'scraper', entityName: 'Dark Web Marketplace', operationCode: '', startedAt: '2026-03-22 14:00:00', estimatedEnd: '', completedAt: '2026-03-22 14:02:15', duration: '2m 15s', initiatedBy: 'System (4h)', input: 'Tor · 8 marketplaces', output: '', errorLog: 'Tor circuit failed. 5/8 onion addresses unreachable.', retryCount: 2, maxRetries: 5, tags: ['error', 'tor', 'timeout'] },
    { id: 'job-27', name: 'Li Wei Report — Shanghai', type: 'report_gen', status: 'Failed', priority: 'Normal', progress: 35, worker: 'Worker Alpha', queue: 'reports', entityType: 'person', entityId: 10, entityName: 'Li Wei', operationCode: 'PHOENIX', startedAt: '2026-03-18 06:00:00', estimatedEnd: '', completedAt: '2026-03-18 06:02:45', duration: '2m 45s', initiatedBy: 'Cpt. Perić', input: '18 sections · Li Wei', output: '', errorLog: 'Insufficient data for 12/18 sections.', retryCount: 1, maxRetries: 2, tags: ['PHOENIX', 'error', 'insufficient-data'] },
    { id: 'job-29', name: 'Cairo Camera Reconnect', type: 'data_sync', status: 'Retrying', priority: 'High', progress: 0, worker: 'Worker Bravo', queue: 'sync-priority', entityType: 'device', entityId: 7, entityName: 'Cairo Office Interior', operationCode: '', startedAt: '2026-03-24 10:00:00', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (Auto-retry)', input: 'ONVIF reconnect · TLS', output: '', errorLog: 'Attempt 2/5: Connection timeout.', retryCount: 2, maxRetries: 5, tags: ['retry', 'camera', 'cairo'] },
    { id: 'job-30', name: 'Court Records e-Spis Sync', type: 'data_sync', status: 'Retrying', priority: 'Normal', progress: 0, worker: 'Worker Charlie', queue: 'sync', entityName: 'Court Records', operationCode: '', startedAt: '2026-03-24 09:00:00', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (12h)', input: 'SOAP · Civil + criminal', output: '', errorLog: 'Attempt 1/3: Partial response timeout.', retryCount: 1, maxRetries: 3, tags: ['retry', 'court', 'timeout'] },
];

export const allOps = [...new Set(mockJobs.map(j => j.operationCode).filter(Boolean))];

export const keyboardShortcuts = [
    { key: '1', description: 'All Jobs tab' },
    { key: '2', description: 'Running tab' },
    { key: '3', description: 'Queued tab' },
    { key: '4', description: 'Completed tab' },
    { key: '5', description: 'Failed tab' },
    { key: '6', description: 'Workers tab' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters' },
    { key: 'Esc', description: 'Close detail / modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
