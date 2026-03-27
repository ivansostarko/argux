/**
 * ARGUX — Records Mock Data
 * AI-powered evidence processing: transcription, translation, summarization, OCR
 */
import { mockPersons } from './persons';
import { mockOrganizations } from './organizations';

export type RecordType = 'video_transcription' | 'audio_transcription' | 'translation' | 'file_summary' | 'photo_ocr' | 'document' | 'evidence';
export type RecordStatus = 'completed' | 'processing' | 'queued' | 'failed' | 'draft';
export type SourceLang = 'auto' | 'en' | 'hr' | 'ar' | 'de' | 'es' | 'fr' | 'ru' | 'zh' | 'ja' | 'tr' | 'sr' | 'bs';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface Record {
    id: string; type: RecordType; status: RecordStatus; priority: Priority;
    title: string; description: string;
    sourceFile: string; sourceSize: string; sourceDuration?: string;
    sourceLang?: SourceLang; targetLang?: SourceLang;
    entityType?: 'person' | 'org'; entityId?: number; entityName?: string;
    operationCode?: string;
    aiModel: string; confidence?: number; progress?: number;
    result?: string; resultPreview?: string; wordCount?: number;
    createdBy: string; createdAt: string; completedAt?: string;
    processingTime?: string; tags: string[];
}

export const typeConfig: { [K in RecordType]: { icon: string; color: string; label: string; aiModel: string } } = {
    video_transcription: { icon: '🎥', color: '#3b82f6', label: 'Video Transcription', aiModel: 'Faster-Whisper Large-v3' },
    audio_transcription: { icon: '🎙️', color: '#f59e0b', label: 'Audio Transcription', aiModel: 'Faster-Whisper Large-v3' },
    translation:         { icon: '🌐', color: '#8b5cf6', label: 'Translation', aiModel: 'Meta NLLB-200' },
    file_summary:        { icon: '📝', color: '#22c55e', label: 'File Summary', aiModel: 'LLaMA 3.1 70B' },
    photo_ocr:           { icon: '📷', color: '#ec4899', label: 'Photo OCR / Transcription', aiModel: 'LLaVA Vision' },
    document:            { icon: '📄', color: '#6b7280', label: 'Document', aiModel: 'Manual' },
    evidence:            { icon: '🔒', color: '#ef4444', label: 'Evidence Package', aiModel: 'Manual' },
};

export const statusConfig: { [K in RecordStatus]: { color: string; label: string } } = {
    completed:  { color: '#22c55e', label: 'Completed' },
    processing: { color: '#3b82f6', label: 'Processing' },
    queued:     { color: '#f59e0b', label: 'Queued' },
    failed:     { color: '#ef4444', label: 'Failed' },
    draft:      { color: '#6b7280', label: 'Draft' },
};

export const priorityConfig: { [K in Priority]: { color: string } } = {
    critical: { color: '#ef4444' }, high: { color: '#f97316' }, medium: { color: '#f59e0b' }, low: { color: '#22c55e' },
};

export const languages: { code: SourceLang; label: string }[] = [
    { code: 'auto', label: 'Auto-detect' }, { code: 'en', label: 'English' }, { code: 'hr', label: 'Croatian' },
    { code: 'ar', label: 'Arabic' }, { code: 'de', label: 'German' }, { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' }, { code: 'ru', label: 'Russian' }, { code: 'zh', label: 'Chinese' },
    { code: 'ja', label: 'Japanese' }, { code: 'tr', label: 'Turkish' }, { code: 'sr', label: 'Serbian' }, { code: 'bs', label: 'Bosnian' },
];

export const entityOptions = [
    ...mockPersons.slice(0, 15).map(p => ({ id: `p-${p.id}`, label: `🧑 ${p.firstName} ${p.lastName}`, entityType: 'person' as const, entityId: p.id })),
    ...mockOrganizations.slice(0, 10).map(o => ({ id: `o-${o.id}`, label: `🏢 ${o.name}`, entityType: 'org' as const, entityId: o.id })),
];

export const mockRecords: Record[] = [
    { id: 'r01', type: 'video_transcription', status: 'completed', priority: 'critical', title: 'Port Terminal Surveillance — CAM-07', description: 'Full transcription of 45-minute surveillance footage from Camera 07 at Zagreb port terminal. Subject Horvat observed conducting reconnaissance.', sourceFile: 'horvat_port_cam07.mp4', sourceSize: '128 MB', sourceDuration: '45:00', sourceLang: 'hr', aiModel: 'Faster-Whisper Large-v3', confidence: 94, result: 'Transcription complete. 3,847 words extracted. 12 keyword matches flagged. Conversation between 2 speakers detected at 18:32-22:15. References to "Thursday delivery" and "dock 7" identified as operationally significant.', resultPreview: '...dogovoreno za četvrtak navečer, terminal 7, dvadeset i tri sata...', wordCount: 3847, createdBy: 'System', createdAt: '2026-03-24 09:48', completedAt: '2026-03-24 10:12', processingTime: '24 min', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', tags: ['keyword-flagged', 'port', 'HAWK', 'croatian', '2-speakers'] },
    { id: 'r02', type: 'audio_transcription', status: 'completed', priority: 'critical', title: 'Phone Intercept — Horvat Outgoing Call', description: 'Transcription of intercepted phone call. Subject discussing logistics with unknown contact.', sourceFile: 'horvat_phone_20260324.wav', sourceSize: '4.2 MB', sourceDuration: '4:12', sourceLang: 'hr', aiModel: 'Faster-Whisper Large-v3', confidence: 91, result: 'Full transcript: 4-minute call in Croatian. Subject confirms delivery schedule. References to "the port", "Thursday night", "dock 7". Second speaker uses coded language — possible operational communication.', resultPreview: '...potvrđujem, četvrtak navečer, dok sedam, dvadeset tri...', wordCount: 612, createdBy: 'Sgt. Matić', createdAt: '2026-03-24 08:22', completedAt: '2026-03-24 08:26', processingTime: '4 min', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', tags: ['intercept', 'keyword-flagged', 'croatian', 'coded-language'] },
    { id: 'r03', type: 'translation', status: 'completed', priority: 'high', title: 'Hassan Encrypted Comms — Arabic → English', description: 'Translation of 14 intercepted encrypted messages from Signal-like platform. Arabic to English.', sourceFile: 'hassan_encrypted_msgs.json', sourceSize: '18 KB', sourceLang: 'ar', targetLang: 'en', aiModel: 'Meta NLLB-200', confidence: 88, result: 'Translation complete. 14 messages translated. Content suggests coordination of logistics operation. References to "the package", "Wednesday pickup", and geographic coordinates matching port area. 3 messages contain potential code words requiring analyst review.', resultPreview: 'MSG 1: "The package is ready for Wednesday. Confirm pickup location..."', wordCount: 890, createdBy: 'System', createdAt: '2026-03-24 08:30', completedAt: '2026-03-24 08:35', processingTime: '5 min', entityType: 'person', entityId: 7, entityName: 'Omar Hassan', operationCode: 'HAWK', tags: ['encrypted', 'arabic', 'translated', 'code-words'] },
    { id: 'r04', type: 'file_summary', status: 'completed', priority: 'high', title: 'Rashid Holdings Financial Analysis Summary', description: 'AI-generated summary of 42-page financial audit report. Highlights suspicious transactions and shell company patterns.', sourceFile: 'asg_financial_audit_2025.pdf', sourceSize: '5.8 MB', aiModel: 'LLaMA 3.1 70B', confidence: 86, result: 'EXECUTIVE SUMMARY: Analysis reveals 12 over-invoiced cargo shipments between Dubai and Zagreb (total discrepancy: €2.4M). Three shell companies identified in Panama, Cayman Islands, and Cyprus. Fund flow pattern consistent with trade-based money laundering. CEO Al-Rashid has direct communication with Hassan through intermediary. Recommendation: Escalate to Financial Intelligence Unit.', wordCount: 2840, createdBy: 'Financial Intel', createdAt: '2026-03-22 09:00', completedAt: '2026-03-22 09:18', processingTime: '18 min', entityType: 'org', entityId: 2, entityName: 'Rashid Holdings', operationCode: 'GLACIER', tags: ['financial', 'shell-companies', 'AML', 'GLACIER'] },
    { id: 'r05', type: 'photo_ocr', status: 'completed', priority: 'medium', title: 'LPR Capture — Vukovarska Checkpoint', description: 'OCR extraction from LPR camera capture. License plate recognition and vehicle identification.', sourceFile: 'horvat_vukovarska_lpr.jpg', sourceSize: '1.8 MB', aiModel: 'LLaVA Vision', confidence: 97, result: 'License plate: ZG-1847-AB (confidence: 97%). Vehicle: BMW 5 Series, dark blue/black. Direction: Eastbound. Additional text detected: parking permit sticker "ZONA-3 2026". Timestamp overlay: 2026-03-24 09:31:14.', wordCount: 45, createdBy: 'LPR System', createdAt: '2026-03-24 09:31', completedAt: '2026-03-24 09:31', processingTime: '< 1 sec', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', tags: ['lpr', 'ZG-1847-AB', 'vukovarska'] },
    { id: 'r06', type: 'audio_transcription', status: 'processing', priority: 'high', title: 'Mendoza Night Activity — Vehicle Audio', description: 'Transcription of in-vehicle audio captured during night movement pattern 03:15-03:37.', sourceFile: 'mendoza_vehicle_audio.wav', sourceSize: '8.6 MB', sourceDuration: '22:00', sourceLang: 'es', aiModel: 'Faster-Whisper Large-v3', progress: 67, createdBy: 'System', createdAt: '2026-03-24 10:00', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', operationCode: 'HAWK', tags: ['spanish', 'night-activity', 'vehicle'] },
    { id: 'r07', type: 'translation', status: 'processing', priority: 'critical', title: 'Mendoza Vehicle Audio — Spanish → English', description: 'Translation of transcribed vehicle audio. Pending transcription completion.', sourceFile: 'mendoza_vehicle_transcript.txt', sourceSize: '—', sourceLang: 'es', targetLang: 'en', aiModel: 'Meta NLLB-200', progress: 0, createdBy: 'System', createdAt: '2026-03-24 10:05', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', operationCode: 'HAWK', tags: ['spanish', 'pending-transcription', 'chained'] },
    { id: 'r08', type: 'video_transcription', status: 'queued', priority: 'medium', title: 'Babić Loitering — Camera 12 Footage', description: 'Transcription of 22-minute loitering footage. AI-flagged behavior at Heinzelova office building.', sourceFile: 'babic_loitering_cam12.mp4', sourceSize: '67 MB', sourceDuration: '22:00', sourceLang: 'auto', aiModel: 'Faster-Whisper Large-v3', createdBy: 'AI Detection', createdAt: '2026-03-24 07:55', entityType: 'person', entityId: 12, entityName: 'Ivan Babić', tags: ['loitering', 'ai-flagged', 'counter-surveillance'] },
    { id: 'r09', type: 'file_summary', status: 'queued', priority: 'low', title: 'CERBERUS Final Report — Executive Summary', description: 'Generate executive summary of completed Operation CERBERUS final report.', sourceFile: 'cerberus_final_report.pdf', sourceSize: '12.4 MB', aiModel: 'LLaMA 3.1 70B', createdBy: 'Col. Tomić', createdAt: '2026-03-23 14:00', operationCode: 'CERBERUS', tags: ['CERBERUS', 'final-report', 'debrief'] },
    { id: 'r10', type: 'photo_ocr', status: 'completed', priority: 'medium', title: 'Diplomatic Quarter — Embassy Signage OCR', description: 'OCR on surveillance photos from Babić diplomatic quarter visit. Extract embassy names and signage.', sourceFile: 'babic_diplomatic_photos.zip', sourceSize: '22 MB', aiModel: 'LLaVA Vision', confidence: 82, result: 'Detected signage: "Embassy of the Republic of Turkey" (conf: 92%), "Consulate General of Egypt" (conf: 88%), street sign "Prilaz Gjure Deželića" (conf: 95%). Subject photographed at 3 locations within 200m radius. Duration at each: 12min, 8min, 28min.', wordCount: 78, createdBy: 'Field Team Alpha', createdAt: '2026-03-23 15:20', completedAt: '2026-03-23 15:22', processingTime: '2 min', entityType: 'person', entityId: 12, entityName: 'Ivan Babić', tags: ['diplomatic', 'embassy', 'OCR', 'signage'] },
    { id: 'r11', type: 'audio_transcription', status: 'failed', priority: 'medium', title: 'Hassan Storage Facility — Ambient Audio', description: 'Attempted transcription of ambient audio from storage facility visit. Audio quality too degraded.', sourceFile: 'hassan_storage_ambient.wav', sourceSize: '2.1 MB', sourceDuration: '15:00', sourceLang: 'ar', aiModel: 'Faster-Whisper Large-v3', confidence: 12, result: 'FAILED: Audio quality below minimum threshold (SNR < 5dB). Excessive background noise from ventilation system. Recommend: DeepFilterNet noise reduction preprocessing, then retry.', createdBy: 'System', createdAt: '2026-03-23 16:45', completedAt: '2026-03-23 16:48', processingTime: '3 min', entityType: 'person', entityId: 7, entityName: 'Omar Hassan', tags: ['failed', 'low-quality', 'noise'] },
    { id: 'r12', type: 'video_transcription', status: 'completed', priority: 'high', title: 'Co-location Event — Horvat & Mendoza at Savska', description: 'Transcription of surveillance footage capturing co-location meeting. Two speakers identified.', sourceFile: 'colocation_savska_41.mp4', sourceSize: '45 MB', sourceDuration: '8:00', sourceLang: 'auto', aiModel: 'Faster-Whisper Large-v3', confidence: 89, result: 'Two speakers identified via pyannote diarization. Speaker A (Horvat): Croatian, discussing timeline. Speaker B (Mendoza): Spanish-accented Croatian. Key phrases: "everything is ready", "the boat arrives Thursday". Meeting duration: 8 minutes. No third parties detected.', resultPreview: 'Speaker A: "Sve je spremno, brod dolazi u četvrtak..."', wordCount: 1240, createdBy: 'Correlation Engine', createdAt: '2026-03-24 09:20', completedAt: '2026-03-24 09:32', processingTime: '12 min', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', tags: ['co-location', 'mendoza', '2-speakers', 'diarization', 'HAWK'] },
    { id: 'r13', type: 'document', status: 'completed', priority: 'high', title: 'Checkpoint Avoidance Route Map — Babić', description: 'Manually created document mapping Babić alternate routes avoiding 3 fixed LPR cameras.', sourceFile: 'babic_route_map.pdf', sourceSize: '340 KB', aiModel: 'Manual', createdBy: 'AI Analysis', createdAt: '2026-03-22 10:00', completedAt: '2026-03-22 10:00', entityType: 'person', entityId: 12, entityName: 'Ivan Babić', tags: ['checkpoint', 'LPR-avoidance', 'route-map'] },
    { id: 'r14', type: 'evidence', status: 'completed', priority: 'critical', title: 'Evidence Package — Horvat Co-location Series', description: 'Chain-of-custody evidence package containing all co-location evidence for Horvat-Mendoza meetings.', sourceFile: 'horvat_colocation_evidence_042.zip', sourceSize: '18.5 MB', aiModel: 'Manual', createdBy: 'Workflow Engine', createdAt: '2026-03-24 09:15', completedAt: '2026-03-24 09:15', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', operationCode: 'HAWK', tags: ['evidence', 'co-location', 'chain-of-custody', 'HAWK'] },
    { id: 'r15', type: 'translation', status: 'completed', priority: 'medium', title: 'Cargo Manifest Translation — Chinese → English', description: 'Translation of Dragon Tech Solutions cargo manifests showing weight/volume discrepancies.', sourceFile: 'dragon_tech_manifests.pdf', sourceSize: '1.4 MB', sourceLang: 'zh', targetLang: 'en', aiModel: 'Meta NLLB-200', confidence: 85, result: 'Translation of 8 cargo manifests. Declared: "consumer electronics" (total 2,400kg). Actual weight estimate from vessel AIS data: ~4,100kg. Volume discrepancy: declared 12m³, estimated 22m³. Pattern consistent with dual-use technology concealment.', wordCount: 560, createdBy: 'Cpt. Perić', createdAt: '2026-03-18 11:00', completedAt: '2026-03-18 11:08', processingTime: '8 min', entityType: 'org', entityId: 4, entityName: 'Dragon Tech Solutions', operationCode: 'PHOENIX', tags: ['chinese', 'cargo', 'manifest', 'discrepancy', 'PHOENIX'] },
];

export const keyboardShortcuts = [
    { key: 'N', description: 'New record' },
    { key: '1', description: 'All records' },
    { key: '2', description: 'Processing' },
    { key: '3', description: 'Completed' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters' },
    { key: 'Esc', description: 'Close modal / detail' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
