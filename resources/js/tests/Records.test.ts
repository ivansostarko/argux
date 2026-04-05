import { describe, it, expect } from 'vitest';
import {
    mockRecords, typeConfig, statusConfig, priorityConfig, languages, keyboardShortcuts
} from '../mock/records';
import type { RecordType, RecordStatus, Priority, AIRecord } from '../mock/records';

describe('Records Mock Data', () => {
    describe('mockRecords', () => {
        it('should have 15 records', () => { expect(mockRecords.length).toBe(15); });
        it('IDs should be unique', () => { const ids = mockRecords.map(r => r.id); expect(new Set(ids).size).toBe(ids.length); });
        it('all records should have required fields', () => {
            mockRecords.forEach(r => {
                expect(r.id).toBeTruthy(); expect(r.type).toBeTruthy();
                expect(r.status).toBeTruthy(); expect(r.priority).toBeTruthy();
                expect(r.title).toBeTruthy(); expect(r.sourceFile).toBeTruthy();
                expect(r.aiModel).toBeTruthy(); expect(r.createdBy).toBeTruthy();
                expect(r.tags.length).toBeGreaterThan(0);
            });
        });
        it('should have all 7 types', () => {
            const types = new Set(mockRecords.map(r => r.type));
            expect(types.size).toBe(7);
        });
        it('should have all 5 statuses', () => {
            const statuses = new Set(mockRecords.map(r => r.status));
            expect(statuses.size).toBeGreaterThanOrEqual(4);
        });
        it('completed records should have result', () => {
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
        it('failed records should have result with FAILED', () => {
            mockRecords.filter(r => r.status === 'failed').forEach(r => {
                expect(r.result).toBeTruthy();
                expect(r.result!.toLowerCase()).toContain('fail');
            });
        });
    });

    describe('typeConfig', () => {
        it('should have 7 types', () => { expect(Object.keys(typeConfig).length).toBe(7); });
        it('each has icon, color, label, aiModel', () => {
            Object.values(typeConfig).forEach(t => {
                expect(t.icon).toBeTruthy(); expect(t.color).toMatch(/^#[0-9a-f]{6}$/i);
                expect(t.label).toBeTruthy(); expect(t.aiModel).toBeTruthy();
            });
        });
    });

    describe('statusConfig', () => {
        it('should have 5 statuses', () => { expect(Object.keys(statusConfig).length).toBe(5); });
        Object.values(statusConfig).forEach(s => { expect(s.color).toMatch(/^#[0-9a-f]{6}$/i); expect(s.label).toBeTruthy(); });
    });

    describe('languages', () => {
        it('should have 13 languages', () => { expect(languages.length).toBe(13); });
        it('all should have code and label', () => { languages.forEach(l => { expect(l.code).toBeTruthy(); expect(l.label).toBeTruthy(); }); });
        it('IDs should be unique', () => { const codes = languages.map(l => l.code); expect(new Set(codes).size).toBe(codes.length); });
    });

    describe('keyboardShortcuts', () => {
        it('should have shortcuts', () => { expect(keyboardShortcuts.length).toBeGreaterThan(0); });
        it('each has key and description', () => {
            keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); });
        });
    });
});
