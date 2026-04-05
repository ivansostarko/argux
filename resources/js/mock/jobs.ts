/**
 * ARGUX — Background Jobs Mock Data
 * Job queue dashboard: running, queued, completed, failed jobs
 */

export type JobStatus = 'running' | 'queued' | 'completed' | 'failed' | 'cancelled';
export type JobType = 'sync' | 'ai_inference' | 'report' | 'export' | 'media' | 'backup' | 'import' | 'index_rebuild';

export interface Job {
    id: string; type: JobType; name: string; status: JobStatus;
    progress: number; worker: string; queue: string;
    startedAt: string | null; completedAt: string | null; duration: string | null;
    initiator: string; priority: 'high' | 'normal' | 'low';
    input: Record<string, string>; output: string | null;
    error: string | null; retryCount: number; maxRetries: number;
}

export const typeConfig: Record<JobType, { label: string; icon: string; color: string }> = {
    sync:          { label: 'Data Sync', icon: '📡', color: '#3b82f6' },
    ai_inference:  { label: 'AI Inference', icon: '🤖', color: '#8b5cf6' },
    report:        { label: 'Report Generation', icon: '📊', color: '#22c55e' },
    export:        { label: 'Bulk Export', icon: '📤', color: '#06b6d4' },
    media:         { label: 'Media Processing', icon: '🎬', color: '#f59e0b' },
    backup:        { label: 'Backup', icon: '💾', color: '#ec4899' },
    import:        { label: 'Data Import', icon: '📥', color: '#f97316' },
    index_rebuild: { label: 'Index Rebuild', icon: '🔍', color: '#ef4444' },
};

export const statusConfig: Record<JobStatus, { label: string; color: string; icon: string }> = {
    running:   { label: 'Running', color: '#3b82f6', icon: '🔄' },
    queued:    { label: 'Queued', color: '#f59e0b', icon: '⏳' },
    completed: { label: 'Completed', color: '#22c55e', icon: '✅' },
    failed:    { label: 'Failed', color: '#ef4444', icon: '❌' },
    cancelled: { label: 'Cancelled', color: '#6b7280', icon: '🚫' },
};

export const mockJobs: Job[] = [
    { id: 'j01', type: 'ai_inference', name: 'Faster-Whisper: horvat_port_cam07.mp4', status: 'running', progress: 67, worker: 'gpu-worker-1', queue: 'ai-high', startedAt: '2026-03-27 09:28:00', completedAt: null, duration: null, initiator: 'Sgt. Matić', priority: 'high', input: { file: 'horvat_port_cam07.mp4', model: 'large-v3', language: 'auto', duration: '45 min' }, output: null, error: null, retryCount: 0, maxRetries: 3 },
    { id: 'j02', type: 'sync', name: 'INTERPOL I-24/7 Full Sync', status: 'running', progress: 42, worker: 'sync-worker-2', queue: 'sync', startedAt: '2026-03-27 09:25:00', completedAt: null, duration: null, initiator: 'Scheduler', priority: 'normal', input: { source: 'INTERPOL I-24/7', type: 'full', records: '~12,000' }, output: null, error: null, retryCount: 0, maxRetries: 3 },
    { id: 'j03', type: 'ai_inference', name: 'Face Recognition: Mendoza batch (24 images)', status: 'running', progress: 88, worker: 'gpu-worker-2', queue: 'ai-high', startedAt: '2026-03-27 09:20:00', completedAt: null, duration: null, initiator: 'Lt. Perić', priority: 'high', input: { subject: 'Carlos Mendoza', images: '24', model: 'ArcFace R100', threshold: '85%' }, output: null, error: null, retryCount: 0, maxRetries: 2 },
    { id: 'j04', type: 'report', name: 'Intelligence Report: Horvat (Full)', status: 'queued', progress: 0, worker: '', queue: 'reports', startedAt: null, completedAt: null, duration: null, initiator: 'Maj. Novak', priority: 'normal', input: { entity: 'Person #1 — Marko Horvat', sections: '14', format: 'PDF', classification: 'CLASSIFIED' }, output: null, error: null, retryCount: 0, maxRetries: 2 },
    { id: 'j05', type: 'export', name: 'Bulk Export: HAWK Operation Events (CSV)', status: 'queued', progress: 0, worker: '', queue: 'exports', startedAt: null, completedAt: null, duration: null, initiator: 'Cpt. Horvat', priority: 'low', input: { operation: 'HAWK', events: '~4,200', format: 'CSV', dateRange: '2026-01-01 to 2026-03-27' }, output: null, error: null, retryCount: 0, maxRetries: 1 },
    { id: 'j06', type: 'media', name: 'Video Transcode: cam12_babic_loiter.mp4', status: 'queued', progress: 0, worker: '', queue: 'media', startedAt: null, completedAt: null, duration: null, initiator: 'System', priority: 'low', input: { file: 'cam12_babic_loiter.mp4', inputFormat: 'H.265', outputFormat: 'H.264', resolution: '1080p' }, output: null, error: null, retryCount: 0, maxRetries: 2 },
    { id: 'j07', type: 'sync', name: 'EU Sanctions CFSP Incremental', status: 'completed', progress: 100, worker: 'sync-worker-1', queue: 'sync', startedAt: '2026-03-27 08:00:00', completedAt: '2026-03-27 08:02:34', duration: '2m 34s', initiator: 'Scheduler', priority: 'normal', input: { source: 'EU Sanctions CFSP', type: 'incremental' }, output: '12 new entries, 3 removed, 0 errors', error: null, retryCount: 0, maxRetries: 3 },
    { id: 'j08', type: 'backup', name: 'Incremental Backup — All Databases', status: 'completed', progress: 100, worker: 'backup-worker-1', queue: 'backup', startedAt: '2026-03-27 03:00:00', completedAt: '2026-03-27 03:08:12', duration: '8m 12s', initiator: 'Scheduler', priority: 'high', input: { type: 'incremental', databases: '5', encryption: 'AES-256' }, output: '2.4 TB backed up. Integrity: PASSED.', error: null, retryCount: 0, maxRetries: 1 },
    { id: 'j09', type: 'ai_inference', name: 'LPR Batch: Zagreb highways (142 plates)', status: 'completed', progress: 100, worker: 'gpu-worker-1', queue: 'ai-normal', startedAt: '2026-03-27 07:30:00', completedAt: '2026-03-27 07:32:18', duration: '2m 18s', initiator: 'System', priority: 'normal', input: { source: 'Highway cameras', plates: '142', model: 'YOLOv8 + PaddleOCR' }, output: '142 plates read, 8 matches found, 2 flagged', error: null, retryCount: 0, maxRetries: 3 },
    { id: 'j10', type: 'report', name: 'Weekly Summary Report', status: 'completed', progress: 100, worker: 'report-worker-1', queue: 'reports', startedAt: '2026-03-27 06:00:00', completedAt: '2026-03-27 06:04:47', duration: '4m 47s', initiator: 'Scheduler', priority: 'normal', input: { type: 'weekly_summary', week: '2026-W13', format: 'PDF' }, output: '42 pages, 7 sections. Delivered to 3 recipients.', error: null, retryCount: 0, maxRetries: 2 },
    { id: 'j11', type: 'import', name: 'Vehicle Registry Import (Zagreb PD)', status: 'completed', progress: 100, worker: 'import-worker-1', queue: 'imports', startedAt: '2026-03-27 07:45:00', completedAt: '2026-03-27 07:46:22', duration: '1m 22s', initiator: 'Col. Tomić', priority: 'normal', input: { source: 'Zagreb PD', records: '1,247', format: 'XML/SOAP' }, output: '1,247 records processed, 34 new plates, 0 duplicates', error: null, retryCount: 0, maxRetries: 2 },
    { id: 'j12', type: 'ai_inference', name: 'Translation: hassan_intercept_ar.txt', status: 'failed', progress: 78, worker: 'gpu-worker-2', queue: 'ai-normal', startedAt: '2026-03-27 08:10:00', completedAt: '2026-03-27 08:14:33', duration: '4m 33s', initiator: 'Lt. Perić', priority: 'normal', input: { file: 'hassan_intercept_ar.txt', model: 'NLLB-200', sourceLang: 'Arabic', targetLang: 'Croatian' }, output: null, error: 'CUDA error: device-side assert triggered at token 4,892. Model checkpoint may be corrupted. Recommend re-downloading NLLB-200 weights.', retryCount: 2, maxRetries: 3 },
    { id: 'j13', type: 'media', name: 'Audio Enhancement: mendoza_ambient.wav', status: 'failed', progress: 34, worker: 'media-worker-1', queue: 'media', startedAt: '2026-03-27 08:30:00', completedAt: '2026-03-27 08:31:45', duration: '1m 45s', initiator: 'Sgt. Matić', priority: 'high', input: { file: 'mendoza_ambient.wav', model: 'DeepFilterNet', snr: '< 3 dB' }, output: null, error: 'SNR too low (< 3 dB). DeepFilterNet cannot enhance audio with signal-to-noise ratio below threshold. Source recording quality insufficient.', retryCount: 1, maxRetries: 2 },
    { id: 'j14', type: 'sync', name: 'Dark Web Monitor — Tor Scrape', status: 'failed', progress: 12, worker: 'sync-worker-3', queue: 'sync', startedAt: '2026-03-27 04:00:00', completedAt: '2026-03-27 04:03:11', duration: '3m 11s', initiator: 'Scheduler', priority: 'low', input: { source: 'Dark Web Monitor', circuits: '5', timeout: '120s' }, output: null, error: 'Connection timeout on 4/5 Tor circuits. Exit nodes unreachable. Network may be under DDoS.', retryCount: 3, maxRetries: 3 },
    { id: 'j15', type: 'index_rebuild', name: 'Typesense Full Reindex', status: 'completed', progress: 100, worker: 'index-worker-1', queue: 'maintenance', startedAt: '2026-03-26 22:00:00', completedAt: '2026-03-26 22:12:44', duration: '12m 44s', initiator: 'Col. Tomić', priority: 'normal', input: { engine: 'Typesense', collections: '8', records: '~248,000' }, output: '248,392 documents indexed across 8 collections. 0 errors.', error: null, retryCount: 0, maxRetries: 1 },
    { id: 'j16', type: 'export', name: 'Face Recognition Matches Export', status: 'cancelled', progress: 15, worker: 'export-worker-1', queue: 'exports', startedAt: '2026-03-26 16:00:00', completedAt: '2026-03-26 16:02:00', duration: '2m', initiator: 'Lt. Perić', priority: 'low', input: { type: 'face_matches', dateRange: '30 days', format: 'CSV' }, output: null, error: 'Cancelled by user.', retryCount: 0, maxRetries: 1 },
];

export const keyboardShortcuts = [
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Refresh jobs' },
    { key: 'Esc', description: 'Close detail panel' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
