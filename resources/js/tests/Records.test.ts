/**
 * ARGUX — Records Page Tests
 * Run: npx vitest run resources/js/tests/Records.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
    mockRecords, typeConfig, statusConfig, priorityConfig, languages, entityOptions, keyboardShortcuts
} from '../mock/records';
import type { RecordType, RecordStatus, Priority, Record as AIRecord } from '../mock/records';

describe('Records typeConfig', () => {
    it('should have 7 record types', () => { expect(Object.keys(typeConfig).length).toBe(7); });
    it('should include 5 AI types', () => {
        ['video_transcription', 'audio_transcription', 'translation', 'file_summary', 'photo_ocr'].forEach(t =>
            expect(typeConfig[t as RecordType]).toBeTruthy()
        );
    });
    it('all should have icon, color, label, aiModel', () => {
        Object.values(typeConfig).forEach(t => {
            expect(t.icon).toBeTruthy(); expect(t.color).toMatch(/^#[0-9a-f]{6}$/i);
            expect(t.label).toBeTruthy(); expect(t.aiModel).toBeTruthy();
        });
    });
    it('AI models should be correct', () => {
        expect(typeConfig.video_transcription.aiModel).toContain('Whisper');
        expect(typeConfig.audio_transcription.aiModel).toContain('Whisper');
        expect(typeConfig.translation.aiModel).toContain('NLLB');
        expect(typeConfig.file_summary.aiModel).toContain('LLaMA');
        expect(typeConfig.photo_ocr.aiModel).toContain('LLaVA');
    });
});

describe('Records statusConfig', () => {
    it('should have 5 statuses', () => { expect(Object.keys(statusConfig).length).toBe(5); });
    it('should include completed, processing, queued, failed, draft', () => {
        ['completed', 'processing', 'queued', 'failed', 'draft'].forEach(s =>
            expect(statusConfig[s as RecordStatus]).toBeTruthy()
        );
    });
    it('all should have color and label', () => {
        Object.values(statusConfig).forEach(s => { expect(s.color).toMatch(/^#[0-9a-f]{6}$/i); expect(s.label).toBeTruthy(); });
    });
});

describe('Records priorityConfig', () => {
    it('should have 4 priorities', () => { expect(Object.keys(priorityConfig).length).toBe(4); });
    it('all should have colors', () => {
        (['critical', 'high', 'medium', 'low'] as Priority[]).forEach(p =>
            expect(priorityConfig[p].color).toMatch(/^#[0-9a-f]{6}$/i)
        );
    });
});

describe('Records languages', () => {
    it('should have at least 10 languages', () => { expect(languages.length).toBeGreaterThanOrEqual(10); });
    it('should include auto, en, hr, ar', () => {
        const codes = languages.map(l => l.code);
        ['auto', 'en', 'hr', 'ar'].forEach(c => expect(codes).toContain(c));
    });
    it('all should have code and label', () => { languages.forEach(l => { expect(l.code).toBeTruthy(); expect(l.label).toBeTruthy(); }); });
});

describe('Records entityOptions', () => {
    it('should have at least 15 options', () => { expect(entityOptions.length).toBeGreaterThanOrEqual(15); });
    it('should have persons and orgs', () => {
        expect(entityOptions.filter(o => o.entityType === 'person').length).toBeGreaterThanOrEqual(5);
        expect(entityOptions.filter(o => o.entityType === 'org').length).toBeGreaterThanOrEqual(3);
    });
});

describe('Records mockRecords', () => {
    it('should have at least 12 records', () => { expect(mockRecords.length).toBeGreaterThanOrEqual(12); });
    it('IDs should be unique', () => { const ids = mockRecords.map(r => r.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockRecords.forEach((r: AIRecord) => {
            expect(r.id).toBeTruthy(); expect(r.title).toBeTruthy(); expect(r.description).toBeTruthy();
            expect(Object.keys(typeConfig)).toContain(r.type);
            expect(Object.keys(statusConfig)).toContain(r.status);
            expect(Object.keys(priorityConfig)).toContain(r.priority);
            expect(r.sourceFile).toBeTruthy(); expect(r.aiModel).toBeTruthy();
            expect(r.createdBy).toBeTruthy(); expect(r.createdAt).toBeTruthy();
            expect(r.tags.length).toBeGreaterThan(0);
        });
    });
    it('should have all 5 AI types represented', () => {
        const types = new Set(mockRecords.map(r => r.type));
        ['video_transcription', 'audio_transcription', 'translation', 'file_summary', 'photo_ocr'].forEach(t =>
            expect(types.has(t as RecordType)).toBe(true)
        );
    });
    it('should have multiple statuses', () => {
        const statuses = new Set(mockRecords.map(r => r.status));
        expect(statuses.size).toBeGreaterThanOrEqual(4);
        expect(statuses.has('completed')).toBe(true);
        expect(statuses.has('processing')).toBe(true);
        expect(statuses.has('failed')).toBe(true);
    });
    it('should have multiple priorities', () => {
        const prios = new Set(mockRecords.map(r => r.priority));
        expect(prios.size).toBeGreaterThanOrEqual(3);
    });
    it('completed records should have results', () => {
        mockRecords.filter(r => r.status === 'completed' && r.type !== 'document' && r.type !== 'evidence').forEach(r => {
            expect(r.result).toBeTruthy();
            expect(r.completedAt).toBeTruthy();
        });
    });
    it('processing records should have progress', () => {
        mockRecords.filter(r => r.status === 'processing').forEach(r => {
            expect(r.progress).toBeDefined();
        });
    });
    it('should have records with confidence scores', () => {
        const withConf = mockRecords.filter(r => r.confidence !== undefined);
        expect(withConf.length).toBeGreaterThanOrEqual(5);
        withConf.forEach(r => { expect(r.confidence).toBeGreaterThanOrEqual(0); expect(r.confidence).toBeLessThanOrEqual(100); });
    });
    it('should have records linked to entities', () => {
        const linked = mockRecords.filter(r => r.entityName);
        expect(linked.length).toBeGreaterThanOrEqual(8);
    });
    it('should have records with operation codes', () => {
        const withOps = mockRecords.filter(r => r.operationCode);
        expect(withOps.length).toBeGreaterThanOrEqual(3);
        const ops = new Set(withOps.map(r => r.operationCode));
        expect(ops.has('HAWK')).toBe(true);
    });
    it('translations should have source and target languages', () => {
        mockRecords.filter(r => r.type === 'translation').forEach(r => {
            expect(r.sourceLang).toBeTruthy(); expect(r.targetLang).toBeTruthy();
        });
    });
    it('audio/video records should have duration', () => {
        mockRecords.filter(r => ['video_transcription', 'audio_transcription'].includes(r.type) && r.status !== 'queued').forEach(r => {
            expect(r.sourceDuration).toBeTruthy();
        });
    });
    it('failed records should have error info', () => {
        mockRecords.filter(r => r.status === 'failed').forEach(r => {
            expect(r.result).toBeTruthy();
            expect(r.result!.toLowerCase()).toContain('fail');
        });
    });
});

describe('Records keyboardShortcuts', () => {
    it('should have at least 6', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(6); });
    it('should include 1, 2, 3, F, R, Esc, Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['1', '2', '3', 'F', 'R', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
    it('all should have key and description', () => { keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); }); });
});
