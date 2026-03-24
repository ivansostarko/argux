import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Background Jobs  ·  Queue & Worker Dashboard
   Data sync, AI inference, report gen, exports, media processing
   ═══════════════════════════════════════════════════════════════ */

type JobStatus = 'Running' | 'Queued' | 'Completed' | 'Failed' | 'Cancelled' | 'Retrying';
type JobType = 'data_sync' | 'ai_inference' | 'report_gen' | 'bulk_export' | 'media_process' | 'face_search' | 'scraper_run' | 'backup' | 'lpr_batch' | 'workflow_exec';
type Priority = 'Critical' | 'High' | 'Normal' | 'Low';

interface Job {
    id: string; name: string; type: JobType; status: JobStatus; priority: Priority;
    progress: number; // 0-100
    worker: string; queue: string;
    entityType?: string; entityId?: number; entityName?: string;
    operationCode: string;
    startedAt: string; estimatedEnd: string; completedAt: string; duration: string;
    initiatedBy: string;
    input: string; output: string; errorLog: string;
    retryCount: number; maxRetries: number;
    tags: string[];
}

interface Worker {
    id: string; name: string; status: 'Active' | 'Idle' | 'Overloaded' | 'Offline';
    currentJob: string; jobsProcessed: number; uptime: string;
    cpu: number; memory: number;
}

const typeConfig: Record<JobType, { icon: string; color: string; label: string }> = {
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
const statusColors: Record<JobStatus, string> = { Running: '#3b82f6', Queued: '#f59e0b', Completed: '#22c55e', Failed: '#ef4444', Cancelled: '#6b7280', Retrying: '#f97316' };
const statusIcons: Record<JobStatus, string> = { Running: '⏳', Queued: '🕐', Completed: '✅', Failed: '❌', Cancelled: '⛔', Retrying: '🔄' };
const prioColors: Record<Priority, string> = { Critical: '#ef4444', High: '#f97316', Normal: '#3b82f6', Low: '#6b7280' };

// ═══ MOCK WORKERS (6) ═══
const mockWorkers: Worker[] = [
    { id: 'w-1', name: 'Worker Alpha', status: 'Active', currentJob: 'job-01', jobsProcessed: 1247, uptime: '14d 6h', cpu: 72, memory: 68 },
    { id: 'w-2', name: 'Worker Bravo', status: 'Active', currentJob: 'job-02', jobsProcessed: 1189, uptime: '14d 6h', cpu: 45, memory: 52 },
    { id: 'w-3', name: 'Worker Charlie', status: 'Active', currentJob: 'job-03', jobsProcessed: 934, uptime: '14d 6h', cpu: 88, memory: 81 },
    { id: 'w-4', name: 'GPU Worker Delta', status: 'Active', currentJob: 'job-04', jobsProcessed: 567, uptime: '14d 6h', cpu: 34, memory: 92 },
    { id: 'w-5', name: 'Worker Echo', status: 'Idle', currentJob: '', jobsProcessed: 1102, uptime: '14d 6h', cpu: 5, memory: 22 },
    { id: 'w-6', name: 'Worker Foxtrot', status: 'Offline', currentJob: '', jobsProcessed: 845, uptime: '0', cpu: 0, memory: 0 },
];

// ═══ 30 MOCK JOBS ═══
const mockJobs: Job[] = [
    // Running (4)
    { id: 'job-01', name: 'INTERPOL I-24/7 Sync', type: 'data_sync', status: 'Running', priority: 'Critical', progress: 67, worker: 'Worker Alpha', queue: 'sync-priority', entityType: 'data_source', entityId: undefined, entityName: 'INTERPOL I-24/7', operationCode: '', startedAt: '2026-03-24 10:12:00', estimatedEnd: '2026-03-24 10:13:30', completedAt: '', duration: '1m 22s', initiatedBy: 'System (Schedule)', input: 'Incremental sync: Red Notices, Stolen Vehicles, Wanted Persons', output: '67% — 2,845/4,250 records checked', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['interpol', 'sync', 'scheduled'] },
    { id: 'job-02', name: 'Horvat Movement Analysis — AI', type: 'ai_inference', status: 'Running', priority: 'High', progress: 43, worker: 'Worker Bravo', queue: 'ai-inference', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', startedAt: '2026-03-24 10:10:00', estimatedEnd: '2026-03-24 10:15:00', completedAt: '', duration: '3m 24s', initiatedBy: 'Workflow: Nightly Sweep', input: 'LLaMA 3.1 70B · Movement pattern analysis · Window: 7 days · Subject: Horvat', output: '43% — Embedding generation complete, scoring in progress', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['HAWK', 'ai', 'movement', 'llama'] },
    { id: 'job-03', name: 'Video Transcription — Port Camera', type: 'media_process', status: 'Running', priority: 'Normal', progress: 28, worker: 'Worker Charlie', queue: 'media', entityType: 'device', entityId: 16, entityName: 'Port Terminal Cam', operationCode: 'HAWK', startedAt: '2026-03-24 10:05:00', estimatedEnd: '2026-03-24 10:25:00', completedAt: '', duration: '8m 24s', initiatedBy: 'Col. Tomić', input: 'Faster-Whisper Large-v3 · 45min video · Audio extraction + transcription + speaker diarization', output: '28% — Audio extracted, transcription 12:40/45:00', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['HAWK', 'video', 'transcription', 'faster-whisper'] },
    { id: 'job-04', name: 'Face Search — All Cameras for Mendoza', type: 'face_search', status: 'Running', priority: 'High', progress: 55, worker: 'GPU Worker Delta', queue: 'gpu-inference', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', operationCode: 'HAWK', startedAt: '2026-03-24 10:08:00', estimatedEnd: '2026-03-24 10:18:00', completedAt: '', duration: '5m 24s', initiatedBy: 'Cpt. Horvat', input: 'InsightFace/ArcFace · ONNX Runtime GPU · 11 cameras · 72h archive · Subject: Mendoza', output: '55% — 6/11 cameras scanned, 2 matches found so far', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['HAWK', 'face', 'insightface', 'gpu'] },

    // Queued (5)
    { id: 'job-05', name: 'HAWK Weekly Report #5', type: 'report_gen', status: 'Queued', priority: 'High', progress: 0, worker: '', queue: 'reports', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', startedAt: '', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'Scheduled (Weekly)', input: '18 sections · Period: 2026-03-17 to 2026-03-24 · Subject: Horvat', output: '', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['HAWK', 'report', 'weekly'] },
    { id: 'job-06', name: 'Social Scraper — Telegram Batch', type: 'scraper_run', status: 'Queued', priority: 'Normal', progress: 0, worker: '', queue: 'scraper', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', operationCode: 'HAWK', startedAt: '', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (5min interval)', input: 'Telegram channels: mendoza_group, falcon_ops · Keywords: delivery, dock, urgent', output: '', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['HAWK', 'telegram', 'scraper'] },
    { id: 'job-07', name: 'LPR Batch — A1 Highway 24h', type: 'lpr_batch', status: 'Queued', priority: 'Normal', progress: 0, worker: '', queue: 'lpr', entityType: 'device', entityId: undefined, entityName: 'A1 Highway Km 78', operationCode: '', startedAt: '', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (Daily)', input: 'PaddleOCR v3 · 24h archive · 8,420 vehicle captures · Watchlist cross-ref', output: '', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['lpr', 'paddleocr', 'batch'] },
    { id: 'job-08', name: 'OpenCorporates Sync — Shell Detection', type: 'data_sync', status: 'Queued', priority: 'Normal', progress: 0, worker: '', queue: 'sync', entityType: 'organization', entityId: 2, entityName: 'Rashid Holdings International', operationCode: 'GLACIER', startedAt: '', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (4h interval)', input: 'OpenCorporates API · Query: Rashid Holdings subsidiaries · 210M+ records', output: '', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['GLACIER', 'opencorporates', 'shell-company'] },
    { id: 'job-09', name: 'Dark Web Crawl — Forum Monitor', type: 'scraper_run', status: 'Queued', priority: 'Low', progress: 0, worker: '', queue: 'scraper', entityType: undefined, entityId: undefined, entityName: 'Dark Web Forum', operationCode: '', startedAt: '', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (2h interval)', input: 'Tor crawler · 15 forums · Keywords: weapons, adriatic, croatia', output: '', errorLog: '', retryCount: 0, maxRetries: 5, tags: ['dark-web', 'crawler', 'tor'] },

    // Completed (15)
    { id: 'job-10', name: 'Morning Briefing #24 — HAWK', type: 'report_gen', status: 'Completed', priority: 'High', progress: 100, worker: 'Worker Alpha', queue: 'reports', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', startedAt: '2026-03-24 06:00:00', estimatedEnd: '', completedAt: '2026-03-24 06:00:12', duration: '12.4s', initiatedBy: 'Workflow: Nightly Sweep', input: 'LLaMA 3.1 · Overnight events 22:00-06:00 · 4 HAWK subjects', output: 'Briefing #24 generated (8 pages). 4 overnight events. Emailed to Col. Tomić.', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['HAWK', 'briefing', 'completed'] },
    { id: 'job-11', name: 'Co-location Evidence Package #42', type: 'workflow_exec', status: 'Completed', priority: 'Critical', progress: 100, worker: 'Worker Bravo', queue: 'workflow', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', startedAt: '2026-03-24 09:15:22', estimatedEnd: '', completedAt: '2026-03-24 09:15:24', duration: '1.5s', initiatedBy: 'Workflow: Co-location Evidence', input: 'Trigger: Horvat + Mendoza co-location (25m) · GPS trails + camera stills', output: 'Evidence #42 created. Alert sent to Alpha. Escalated to Commander.', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['HAWK', 'evidence', 'co-location', 'workflow'] },
    { id: 'job-12', name: 'EU Sanctions CFSP Sync', type: 'data_sync', status: 'Completed', priority: 'Normal', progress: 100, worker: 'Worker Echo', queue: 'sync', entityType: undefined, entityId: undefined, entityName: 'EU Sanctions CFSP', operationCode: '', startedAt: '2026-03-24 10:00:00', estimatedEnd: '', completedAt: '2026-03-24 10:00:04', duration: '4.2s', initiatedBy: 'System (Hourly)', input: 'REST API · 12,847 entities · Incremental check', output: 'No new entries matching watched entities.', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['sanctions', 'eu', 'sync'] },
    { id: 'job-13', name: 'Vehicle Registry HAK Sync', type: 'data_sync', status: 'Completed', priority: 'Normal', progress: 100, worker: 'Worker Charlie', queue: 'sync', entityType: undefined, entityId: undefined, entityName: 'Vehicle Registry (HAK)', operationCode: '', startedAt: '2026-03-24 08:30:00', estimatedEnd: '', completedAt: '2026-03-24 08:31:12', duration: '1m 12s', initiatedBy: 'System (4h interval)', input: 'REST API · Plate changes + insurance updates · Watchlist cross-ref', output: '56 plate changes. ZG-1847-AB insurance renewed.', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['vehicles', 'hak', 'sync'] },
    { id: 'job-14', name: 'Anomaly Detection Batch — 4 Subjects', type: 'ai_inference', status: 'Completed', priority: 'High', progress: 100, worker: 'GPU Worker Delta', queue: 'gpu-inference', entityType: undefined, entityId: undefined, entityName: 'HAWK Subjects', operationCode: 'HAWK', startedAt: '2026-03-24 05:00:00', estimatedEnd: '', completedAt: '2026-03-24 05:00:47', duration: '47s', initiatedBy: 'Scheduled (Nightly)', input: 'Ollama LLaMA 3.1 70B · XGBoost · 4 subjects · 7-day window', output: '2 new anomalies flagged: Horvat weekend surge, Mendoza counter-surveillance.', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['HAWK', 'anomaly', 'ai', 'xgboost'] },
    { id: 'job-15', name: 'Full System Backup', type: 'backup', status: 'Completed', priority: 'Normal', progress: 100, worker: 'Worker Echo', queue: 'maintenance', entityType: undefined, entityId: undefined, entityName: 'System', operationCode: '', startedAt: '2026-03-24 03:00:00', estimatedEnd: '', completedAt: '2026-03-24 03:42:15', duration: '42m 15s', initiatedBy: 'System (Nightly)', input: 'Full backup · PostgreSQL + ClickHouse + MinIO + Configs · AES-256 encryption', output: '2.4 TB compressed. Integrity verified. Stored in /backup/2026-03-24/', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['backup', 'full', 'nightly'] },
    { id: 'job-16', name: 'Social Scraper — All Platforms', type: 'scraper_run', status: 'Completed', priority: 'Normal', progress: 100, worker: 'Worker Alpha', queue: 'scraper', entityType: undefined, entityId: undefined, entityName: '18 Scrapers', operationCode: '', startedAt: '2026-03-24 10:00:00', estimatedEnd: '', completedAt: '2026-03-24 10:00:45', duration: '45s', initiatedBy: 'System (15min interval)', input: '18 scrapers · 10 platforms · Keyword matching + AI sentiment', output: '234 new posts scraped. 3 flagged by AI sentiment analysis.', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['social', 'scraper', 'batch'] },
    { id: 'job-17', name: 'News Monitor — 500+ Sources', type: 'scraper_run', status: 'Completed', priority: 'Normal', progress: 100, worker: 'Worker Bravo', queue: 'scraper', entityType: undefined, entityId: undefined, entityName: 'News Monitor', operationCode: '', startedAt: '2026-03-24 10:10:00', estimatedEnd: '', completedAt: '2026-03-24 10:10:08', duration: '8s', initiatedBy: 'System (5min interval)', input: 'NLP entity extraction · 500+ sources · Relevance scoring', output: '42 articles. 1 relevant: Rashid Holdings quarterly report mention.', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['news', 'nlp', 'scraper'] },
    { id: 'job-18', name: 'Workflow: Port Terminal Intrusion', type: 'workflow_exec', status: 'Completed', priority: 'Critical', progress: 100, worker: 'Worker Alpha', queue: 'workflow', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', startedAt: '2026-03-24 06:42:32', estimatedEnd: '', completedAt: '2026-03-24 06:42:34', duration: '2.3s', initiatedBy: 'Workflow: Port Terminal Intrusion', input: 'Trigger: Zone Entry — Horvat at port · 4 actions', output: 'Alert sent to Alpha. CAM-05 activated. Anomaly report generated.', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['HAWK', 'port', 'zone-entry', 'workflow'] },
    { id: 'job-19', name: 'LPR Watchlist Auto-Track', type: 'workflow_exec', status: 'Completed', priority: 'High', progress: 100, worker: 'Worker Charlie', queue: 'workflow', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', startedAt: '2026-03-24 09:31:12', estimatedEnd: '', completedAt: '2026-03-24 09:31:13', duration: '0.8s', initiatedBy: 'Workflow: LPR Watchlist', input: 'Trigger: ZG-1847-AB at Vukovarska · GPS-002 activation', output: 'Alert sent. GPS-002 tracking confirmed active.', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['HAWK', 'lpr', 'gps', 'workflow'] },
    { id: 'job-20', name: 'Audio Keyword Scan — MIC-ALPHA', type: 'media_process', status: 'Completed', priority: 'High', progress: 100, worker: 'GPU Worker Delta', queue: 'gpu-inference', entityType: 'device', entityId: 9, entityName: 'Al-Rashid Residence Mic', operationCode: 'HAWK', startedAt: '2026-03-24 08:22:00', estimatedEnd: '', completedAt: '2026-03-24 08:22:05', duration: '4.8s', initiatedBy: 'System (Real-time)', input: 'Faster-Whisper Large-v3 · Audio stream · Keywords: delivery, shipment, cargo, port', output: 'Keyword "delivery" detected ×3. Croatian language. Transcript generated.', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['HAWK', 'audio', 'keyword', 'faster-whisper'] },
    { id: 'job-21', name: 'PEP Screening — Dow Jones', type: 'data_sync', status: 'Completed', priority: 'Normal', progress: 100, worker: 'Worker Echo', queue: 'sync', entityType: undefined, entityId: undefined, entityName: 'PEP Screening', operationCode: 'GLACIER', startedAt: '2026-03-24 08:00:00', estimatedEnd: '', completedAt: '2026-03-24 08:00:13', duration: '12.5s', initiatedBy: 'System (2h interval)', input: 'Dow Jones Risk API · Watched entities · PEP + SOE + Adverse Media', output: '2 PEP status changes for Al-Rashid associates.', errorLog: '', retryCount: 0, maxRetries: 3, tags: ['GLACIER', 'pep', 'dow-jones'] },
    { id: 'job-22', name: 'Rashid Shell Company Report', type: 'report_gen', status: 'Completed', priority: 'High', progress: 100, worker: 'Worker Bravo', queue: 'reports', entityType: 'organization', entityId: 2, entityName: 'Rashid Holdings', operationCode: 'GLACIER', startedAt: '2026-03-24 08:00:05', estimatedEnd: '', completedAt: '2026-03-24 08:00:27', duration: '22s', initiatedBy: 'OpenCorporates Sync', input: 'Auto-generated report: Rashid Holdings subsidiaries + filings', output: '2 new shell companies detected. Report: 18 pages. Stored in MinIO.', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['GLACIER', 'shell-company', 'report'] },
    { id: 'job-23', name: 'Activity Export — CSV', type: 'bulk_export', status: 'Completed', priority: 'Low', progress: 100, worker: 'Worker Echo', queue: 'export', entityType: undefined, entityId: undefined, entityName: 'Activity Log', operationCode: 'HAWK', startedAt: '2026-03-24 07:00:00', estimatedEnd: '', completedAt: '2026-03-24 07:00:34', duration: '34s', initiatedBy: 'Lt. Petrić', input: 'Export: HAWK activity log · 30 days · CSV format · All event types', output: 'Exported 12,450 events. File: hawk_activity_30d.csv (4.2 MB)', errorLog: '', retryCount: 0, maxRetries: 1, tags: ['HAWK', 'export', 'csv'] },
    { id: 'job-24', name: 'Translation — Arabic Intercept', type: 'ai_inference', status: 'Completed', priority: 'Normal', progress: 100, worker: 'GPU Worker Delta', queue: 'gpu-inference', entityType: 'person', entityId: 7, entityName: 'Omar Hassan', operationCode: 'HAWK', startedAt: '2026-03-24 07:30:25', estimatedEnd: '', completedAt: '2026-03-24 07:30:38', duration: '13s', initiatedBy: 'System (Auto)', input: 'Meta NLLB-200 · Arabic→English · 4m 12s audio transcript', output: 'Translation complete. Assessed routine personal call. No intel.', errorLog: '', retryCount: 0, maxRetries: 2, tags: ['HAWK', 'translation', 'nllb', 'arabic'] },

    // Failed (3)
    { id: 'job-25', name: 'Credit Bureau HROK Sync', type: 'data_sync', status: 'Failed', priority: 'Normal', progress: 0, worker: 'Worker Echo', queue: 'sync', entityType: undefined, entityId: undefined, entityName: 'Credit Bureau (HROK)', operationCode: '', startedAt: '2026-03-22 06:00:00', estimatedEnd: '', completedAt: '2026-03-22 06:00:30', duration: '30s', initiatedBy: 'System (Daily)', input: 'SOAP endpoint · Credit scores + payment history', output: '', errorLog: 'Connection refused. HROK server maintenance (48h downtime announced). Error: ECONNREFUSED 10.0.22.1:443', retryCount: 3, maxRetries: 3, tags: ['error', 'hrok', 'connection-refused'] },
    { id: 'job-26', name: 'Dark Web Marketplace Crawl', type: 'scraper_run', status: 'Failed', priority: 'Low', progress: 12, worker: 'Worker Charlie', queue: 'scraper', entityType: undefined, entityId: undefined, entityName: 'Dark Web Marketplace', operationCode: '', startedAt: '2026-03-22 14:00:00', estimatedEnd: '', completedAt: '2026-03-22 14:02:15', duration: '2m 15s', initiatedBy: 'System (4h interval)', input: 'Tor crawler · 8 marketplaces · Weapons category', output: '', errorLog: 'Tor circuit failed. 5/8 onion addresses unreachable. CircuitBuildTimeout exceeded (120s). Retry recommended during low-traffic hours.', retryCount: 2, maxRetries: 5, tags: ['error', 'tor', 'dark-web', 'timeout'] },
    { id: 'job-27', name: 'Li Wei Report — Shanghai', type: 'report_gen', status: 'Failed', priority: 'Normal', progress: 35, worker: 'Worker Alpha', queue: 'reports', entityType: 'person', entityId: 10, entityName: 'Li Wei', operationCode: 'PHOENIX', startedAt: '2026-03-18 06:00:00', estimatedEnd: '', completedAt: '2026-03-18 06:02:45', duration: '2m 45s', initiatedBy: 'Cpt. Perić', input: '18 sections · Period: 2026-03-01 to 2026-03-18 · Subject: Li Wei', output: '', errorLog: 'Insufficient data for 12/18 sections. Shanghai camera offline. Data sources limited. Error: ReportSectionEmpty for: Face Recognition, Deployed Surveillance, Audio Intercepts, Social Media.', retryCount: 1, maxRetries: 2, tags: ['PHOENIX', 'error', 'insufficient-data'] },

    // Cancelled (1)
    { id: 'job-28', name: 'Bulk Photo Export — All Persons', type: 'bulk_export', status: 'Cancelled', priority: 'Low', progress: 8, worker: 'Worker Echo', queue: 'export', entityType: undefined, entityId: undefined, entityName: 'All Persons', operationCode: '', startedAt: '2026-03-23 15:00:00', estimatedEnd: '', completedAt: '2026-03-23 15:02:00', duration: '2m 00s', initiatedBy: 'Sgt. Matić', input: 'Export all person photos from MinIO · ZIP archive', output: 'Cancelled by user at 8% (234/2,891 files)', errorLog: 'Job cancelled by Sgt. Matić: "Wrong export parameters"', retryCount: 0, maxRetries: 1, tags: ['cancelled', 'export', 'user-cancelled'] },

    // Retrying (2)
    { id: 'job-29', name: 'Cairo Camera Reconnect', type: 'data_sync', status: 'Retrying', priority: 'High', progress: 0, worker: 'Worker Bravo', queue: 'sync-priority', entityType: 'device', entityId: 7, entityName: 'Cairo Office Interior', operationCode: '', startedAt: '2026-03-24 10:00:00', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (Auto-retry)', input: 'ONVIF reconnect · IP: 10.0.7.42 · Timeout: 30s · TLS handshake', output: '', errorLog: 'Attempt 2/5: Connection timeout. Previous: TLS handshake failed (certificate expired?). Camera may have been discovered.', retryCount: 2, maxRetries: 5, tags: ['retry', 'camera', 'cairo', 'connection'] },
    { id: 'job-30', name: 'Court Records e-Spis Sync', type: 'data_sync', status: 'Retrying', priority: 'Normal', progress: 0, worker: 'Worker Charlie', queue: 'sync', entityType: undefined, entityId: undefined, entityName: 'Court Records (e-Spis)', operationCode: '', startedAt: '2026-03-24 09:00:00', estimatedEnd: '', completedAt: '', duration: '—', initiatedBy: 'System (12h interval)', input: 'SOAP endpoint · Civil + criminal cases · Watched entities', output: '', errorLog: 'Attempt 1/3: Partial response — civil cases endpoint timeout (30s). Criminal records OK. Retrying with extended timeout (60s).', retryCount: 1, maxRetries: 3, tags: ['retry', 'court', 'timeout', 'partial'] },
];

type ViewTab = 'all' | 'running' | 'queued' | 'completed' | 'failed' | 'workers';

function JobsIndex() {
    const [tab, setTab] = useState<ViewTab>('all');
    const [search, setSearch] = useState('');
    const [typeF, setTypeF] = useState<JobType | 'all'>('all');
    const [statusF, setStatusF] = useState<JobStatus | 'all'>('all');
    const [prioF, setPrioF] = useState<Priority | 'all'>('all');
    const [opF, setOpF] = useState('all');
    const [selJob, setSelJob] = useState<string | null>(null);

    // Simulate running job progress
    const [tick, setTick] = useState(0);
    useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 3000); return () => clearInterval(iv); }, []);

    const job = selJob ? mockJobs.find(j => j.id === selJob) : null;
    const allOps = [...new Set(mockJobs.map(j => j.operationCode).filter(Boolean))];

    const statusForTab = (t: ViewTab): JobStatus | undefined => {
        if (t === 'running') return 'Running';
        if (t === 'queued') return 'Queued';
        if (t === 'completed') return 'Completed';
        if (t === 'failed') return 'Failed';
        return undefined;
    };

    const filtered = useMemo(() => {
        const tabStatus = statusForTab(tab);
        return mockJobs.filter(j => {
            if (tab === 'failed' && (j.status === 'Failed' || j.status === 'Cancelled' || j.status === 'Retrying')) { /* pass */ }
            else if (tabStatus && j.status !== tabStatus) return false;
            if (typeF !== 'all' && j.type !== typeF) return false;
            if (statusF !== 'all' && j.status !== statusF) return false;
            if (prioF !== 'all' && j.priority !== prioF) return false;
            if (opF !== 'all' && j.operationCode !== opF) return false;
            if (search && !j.name.toLowerCase().includes(search.toLowerCase()) && !j.entityName?.toLowerCase().includes(search.toLowerCase()) && !j.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
            return true;
        });
    }, [tab, typeF, statusF, prioF, opF, search]);

    const stats = { total: mockJobs.length, running: mockJobs.filter(j => j.status === 'Running').length, queued: mockJobs.filter(j => j.status === 'Queued').length, completed: mockJobs.filter(j => j.status === 'Completed').length, failed: mockJobs.filter(j => j.status === 'Failed' || j.status === 'Cancelled' || j.status === 'Retrying').length, workersActive: mockWorkers.filter(w => w.status === 'Active').length };

    const tabItems: { id: ViewTab; label: string; count: number; color: string }[] = [
        { id: 'all', label: '📋 All Jobs', count: mockJobs.length, color: theme.accent },
        { id: 'running', label: '⏳ Running', count: stats.running, color: '#3b82f6' },
        { id: 'queued', label: '🕐 Queued', count: stats.queued, color: '#f59e0b' },
        { id: 'completed', label: '✅ Completed', count: stats.completed, color: '#22c55e' },
        { id: 'failed', label: '❌ Failed', count: stats.failed, color: '#ef4444' },
        { id: 'workers', label: '🖥️ Workers', count: mockWorkers.length, color: '#8b5cf6' },
    ];

    return (<>
        <PageMeta title="Background Jobs" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* LEFT */}
            <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#8b5cf610', border: '1px solid #8b5cf625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚙️</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>JOBS</div><div style={{ fontSize: 7, color: theme.textDim }}>Queue & Worker Dashboard</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 3 }}>
                    {[{ n: stats.running, l: 'Run', c: '#3b82f6' }, { n: stats.queued, l: 'Queue', c: '#f59e0b' }, { n: stats.completed, l: 'Done', c: '#22c55e' }, { n: stats.failed, l: 'Fail', c: '#ef4444' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '3px 0' }}><div style={{ fontSize: 13, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Job type */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Job Type</div>
                    <button onClick={() => setTypeF('all')} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: typeF === 'all' ? `${theme.accent}08` : 'transparent', color: typeF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${typeF === 'all' ? theme.accent : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}>All Types</button>
                    {(Object.keys(typeConfig) as JobType[]).map(t => { const tc = typeConfig[t]; const c = mockJobs.filter(j => j.type === t).length; if (c === 0) return null; return <button key={t} onClick={() => setTypeF(t)} style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: typeF === t ? `${tc.color}08` : 'transparent', color: typeF === t ? tc.color : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${typeF === t ? tc.color : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}><span>{tc.icon}</span><span style={{ flex: 1 }}>{tc.label}</span><span style={{ fontSize: 7, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>

                {/* Priority + Operation */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Priority</div><div style={{ display: 'flex', gap: 2 }}>
                        {(['all', 'Critical', 'High', 'Normal', 'Low'] as const).map(p => <button key={p} onClick={() => setPrioF(p as any)} style={{ flex: 1, padding: '2px', borderRadius: 3, border: `1px solid ${prioF === p ? (p === 'all' ? theme.accent : prioColors[p as Priority]) + '40' : theme.border}`, background: prioF === p ? `${p === 'all' ? theme.accent : prioColors[p as Priority]}08` : 'transparent', color: prioF === p ? (p === 'all' ? theme.accent : prioColors[p as Priority]) : theme.textDim, fontSize: 6, cursor: 'pointer', fontFamily: 'inherit' }}>{p === 'all' ? 'All' : p.slice(0, 4)}</button>)}
                    </div></div>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Operation</div><select value={opF} onChange={e => setOpF(e.target.value)} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Operations</option>{allOps.map(o => <option key={o} value={o}>OP {o}</option>)}</select></div>
                </div>

                <div style={{ padding: '8px 12px', marginTop: 'auto' }}>
                    {[{ l: '📊 Activity', h: '/activity' }, { l: '🗄️ Data Sources', h: '/data-sources' }, { l: '⚡ Workflows', h: '/workflows' }, { l: '📊 Reports', h: '/reports' }].map(lk => <a key={lk.h} href={lk.h} style={{ display: 'block', fontSize: 8, color: theme.textDim, textDecoration: 'none', padding: '2px 0' }}>{lk.l}</a>)}
                </div>
            </div>

            {/* CENTER */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {tabItems.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 12px', border: 'none', borderBottom: `2px solid ${tab === t.id ? t.color : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 10, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' as const }}>{t.label} <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: `${tab === t.id ? t.color : theme.border}20`, color: tab === t.id ? t.color : theme.textDim }}>{t.count}</span></button>)}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {/* WORKERS TAB */}
                    {tab === 'workers' && <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                        {mockWorkers.map(w => { const wc = w.status === 'Active' ? '#22c55e' : w.status === 'Idle' ? '#f59e0b' : w.status === 'Overloaded' ? '#ef4444' : '#6b7280'; return <div key={w.id} style={{ padding: '14px', borderRadius: 8, border: `1px solid ${wc}20`, background: `${wc}03` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: wc, boxShadow: w.status === 'Active' ? `0 0 6px ${wc}` : 'none' }} />
                                <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{w.name}</div><div style={{ fontSize: 7, color: wc, fontWeight: 600 }}>{w.status}</div></div>
                                <span style={{ fontSize: 9, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{w.jobsProcessed.toLocaleString()}</span>
                            </div>
                            {w.currentJob && <div style={{ fontSize: 8, color: theme.textDim, marginBottom: 6 }}>Current: <span style={{ color: theme.accent }}>{mockJobs.find(j => j.id === w.currentJob)?.name || '—'}</span></div>}
                            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                                <div style={{ flex: 1 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: theme.textDim, marginBottom: 2 }}><span>CPU</span><span>{w.cpu}%</span></div><div style={{ height: 4, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${w.cpu}%`, height: '100%', background: w.cpu > 80 ? '#ef4444' : w.cpu > 60 ? '#f59e0b' : '#22c55e', borderRadius: 2 }} /></div></div>
                                <div style={{ flex: 1 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: theme.textDim, marginBottom: 2 }}><span>MEM</span><span>{w.memory}%</span></div><div style={{ height: 4, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${w.memory}%`, height: '100%', background: w.memory > 80 ? '#ef4444' : w.memory > 60 ? '#f59e0b' : '#22c55e', borderRadius: 2 }} /></div></div>
                            </div>
                            <div style={{ fontSize: 7, color: theme.textDim }}>Uptime: {w.uptime} · {w.jobsProcessed.toLocaleString()} jobs processed</div>
                        </div>; })}
                    </div>}

                    {/* JOB LIST */}
                    {tab !== 'workers' && <>
                        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 28, opacity: 0.2 }}>⚙️</div><div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>No jobs match</div></div>}
                        {filtered.map(j => {
                            const tc = typeConfig[j.type]; const sc = statusColors[j.status]; const sel = selJob === j.id;
                            const animatedProgress = j.status === 'Running' ? Math.min(99, j.progress + (tick % 3) * 2) : j.progress;
                            return <div key={j.id} onClick={() => setSelJob(j.id)} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: sel ? `${tc.color}04` : 'transparent', borderLeft: `3px solid ${sel ? tc.color : 'transparent'}`, transition: 'all 0.1s' }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${tc.color}12`, border: `1px solid ${tc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{tc.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{j.name}</span>
                                        <span style={{ fontSize: 6, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: `${prioColors[j.priority]}12`, color: prioColors[j.priority], flexShrink: 0 }}>{j.priority}</span>
                                    </div>
                                    {/* Progress bar for running/retrying */}
                                    {(j.status === 'Running' || j.status === 'Retrying') && <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${animatedProgress}%`, height: '100%', background: j.status === 'Retrying' ? '#f97316' : sc, borderRadius: 2, transition: 'width 1s ease' }} /></div>
                                        <span style={{ fontSize: 8, fontWeight: 700, color: sc, fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{animatedProgress}%</span>
                                    </div>}
                                    <div style={{ display: 'flex', gap: 4, fontSize: 7, color: theme.textDim }}>
                                        {j.entityName && <span>{j.entityName}</span>}
                                        <span>· {j.worker || 'Waiting'}</span>
                                        <span>· {j.duration}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                                    <div style={{ fontSize: 8, fontWeight: 700, color: sc, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                                        {j.status === 'Running' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc, animation: 'argux-pulse 1.5s infinite' }} />}
                                        {statusIcons[j.status]} {j.status}
                                    </div>
                                    {j.operationCode && <div style={{ fontSize: 7, color: theme.accent, marginTop: 1 }}>{j.operationCode}</div>}
                                </div>
                            </div>;
                        })}
                    </>}
                </div>

                <div style={{ padding: '3px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>{stats.running} running · {stats.queued} queued · {stats.completed} completed · {stats.failed} failed · {stats.workersActive}/{mockWorkers.length} workers</span>
                    <div style={{ flex: 1 }} /><span>Laravel Octane · Kafka · Redis · On-Premise</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>

            {/* RIGHT: Job Detail */}
            {job && tab !== 'workers' && <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${typeConfig[job.type].color}12`, border: `1px solid ${typeConfig[job.type].color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{typeConfig[job.type].icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{job.name}</div><div style={{ fontSize: 7, color: typeConfig[job.type].color, fontWeight: 600 }}>{typeConfig[job.type].label}</div></div>
                        <button onClick={() => setSelJob(null)} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                        <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: `${statusColors[job.status]}12`, color: statusColors[job.status] }}>{statusIcons[job.status]} {job.status}</span>
                        <span style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${prioColors[job.priority]}12`, color: prioColors[job.priority] }}>{job.priority}</span>
                        {job.operationCode && <span style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${theme.accent}10`, color: theme.accent }}>{job.operationCode}</span>}
                    </div>
                </div>

                {/* Progress */}
                {(job.status === 'Running' || job.status === 'Retrying') && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, marginBottom: 3 }}><span style={{ color: theme.textDim }}>Progress</span><span style={{ color: statusColors[job.status], fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{Math.min(99, job.progress + (tick % 3) * 2)}%</span></div>
                    <div style={{ height: 6, borderRadius: 3, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${Math.min(99, job.progress + (tick % 3) * 2)}%`, height: '100%', background: statusColors[job.status], borderRadius: 3, transition: 'width 1s ease' }} /></div>
                    {job.estimatedEnd && <div style={{ fontSize: 7, color: theme.textDim, marginTop: 2 }}>ETA: {job.estimatedEnd.slice(11)}</div>}
                </div>}

                {/* Input */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>📥 Input Parameters</div>
                    <div style={{ fontSize: 8, color: theme.textSecondary, lineHeight: 1.5 }}>{job.input}</div>
                </div>

                {/* Output */}
                {job.output && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>📤 Output</div>
                    <div style={{ fontSize: 8, color: theme.textSecondary, lineHeight: 1.5 }}>{job.output}</div>
                </div>}

                {/* Error */}
                {job.errorLog && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, background: '#ef444406' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>❌ Error Log</div>
                    <div style={{ fontSize: 8, color: theme.textSecondary, lineHeight: 1.5, fontFamily: "'JetBrains Mono',monospace" }}>{job.errorLog}</div>
                    {job.retryCount > 0 && <div style={{ fontSize: 7, color: '#f97316', marginTop: 3 }}>Retry {job.retryCount}/{job.maxRetries}</div>}
                </div>}

                {/* Metadata */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                    {[
                        { l: 'Worker', v: job.worker || 'Waiting for assignment' },
                        { l: 'Queue', v: job.queue },
                        { l: 'Initiated by', v: job.initiatedBy },
                        { l: 'Started', v: job.startedAt || '—' },
                        { l: 'Completed', v: job.completedAt || '—' },
                        { l: 'Duration', v: job.duration },
                        ...(job.entityName ? [{ l: 'Entity', v: `${job.entityName}` }] : []),
                    ].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: theme.text }}>{r.v}</span></div>)}
                </div>

                {/* Tags */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                        {job.tags.map(t => <span key={t} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: t === 'error' || t === 'cancelled' ? '#ef444412' : t.includes('HAWK') || t.includes('GLACIER') || t.includes('PHOENIX') ? `${theme.accent}10` : `${theme.border}20`, color: t === 'error' || t === 'cancelled' ? '#ef4444' : t.includes('HAWK') || t.includes('GLACIER') || t.includes('PHOENIX') ? theme.accent : theme.textSecondary }}>{t}</span>)}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '8px 12px', display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginTop: 'auto' }}>
                    {job.status === 'Failed' && <button style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid #f59e0b30`, background: '#f59e0b06', color: '#f59e0b', fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Retry</button>}
                    {job.status === 'Running' && <button style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid #ef444430`, background: '#ef444406', color: '#ef4444', fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⛔ Cancel</button>}
                    {job.entityId && <a href={`/${job.entityType === 'person' ? 'persons' : job.entityType === 'organization' ? 'organizations' : 'devices'}/${job.entityId}`} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, textDecoration: 'none', fontSize: 8, fontWeight: 600, textAlign: 'center' as const }}>View Entity</a>}
                    <a href="/activity" style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8, textAlign: 'center' as const }}>📊 Log</a>
                </div>
            </div>}
        </div>
    </>);
}

JobsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default JobsIndex;
