import { describe, it, expect } from 'vitest';
import {
    mockRecords, typeConfig, custodyActionConfig,
    availablePersons, availableOrgs, keyboardShortcuts,
} from '../mock/records';
import type { RecordType, EvidenceRecord } from '../mock/records';

describe('Records Mock Data', () => {
    describe('mockRecords', () => {
        it('should have 12 records', () => { expect(mockRecords.length).toBe(12); });
        it('IDs should be unique', () => { const ids = mockRecords.map(r => r.id); expect(new Set(ids).size).toBe(ids.length); });
        it('all records should have required fields', () => {
            mockRecords.forEach(r => {
                expect(r.id).toBeTruthy(); expect(r.title).toBeTruthy(); expect(r.type).toBeTruthy();
                expect(r.description).toBeTruthy(); expect(r.createdBy).toBeTruthy();
                expect(r.createdAt).toBeTruthy(); expect(r.updatedAt).toBeTruthy();
                expect(Array.isArray(r.custody)).toBe(true);
                expect(r.custody.length).toBeGreaterThan(0);
                expect(Array.isArray(r.tags)).toBe(true);
            });
        });
        it('should have all 6 types', () => {
            const types = new Set(mockRecords.map(r => r.type));
            expect(types.size).toBe(6);
            ['document', 'photo', 'video', 'audio', 'digital', 'physical'].forEach(t => expect(types.has(t as RecordType)).toBe(true));
        });
        it('physical record should have no fileUrl', () => {
            const physical = mockRecords.find(r => r.type === 'physical');
            expect(physical).toBeDefined();
            expect(physical!.fileUrl).toBeNull();
        });
        it('records with transcripts', () => {
            const withTranscript = mockRecords.filter(r => r.transcript);
            expect(withTranscript.length).toBeGreaterThanOrEqual(2);
        });
        it('records assigned to persons and orgs', () => {
            expect(mockRecords.filter(r => r.assignedPersons.length > 0).length).toBeGreaterThan(0);
            expect(mockRecords.filter(r => r.assignedOrgs.length > 0).length).toBeGreaterThan(0);
        });
        it('multi-entity assignment exists', () => {
            const multi = mockRecords.find(r => r.assignedPersons.length > 1);
            expect(multi).toBeDefined();
        });
    });

    describe('typeConfig', () => {
        it('should have 6 types', () => { expect(Object.keys(typeConfig).length).toBe(6); });
        it('each type has label, icon, color', () => {
            (Object.values(typeConfig) as { label: string; icon: string; color: string }[]).forEach(t => {
                expect(t.label).toBeTruthy(); expect(t.icon).toBeTruthy(); expect(t.color).toMatch(/^#/);
            });
        });
    });

    describe('custodyActionConfig', () => {
        it('should have 5 actions', () => { expect(Object.keys(custodyActionConfig).length).toBe(5); });
    });

    describe('entities', () => {
        it('should have 6 persons', () => { expect(availablePersons.length).toBe(6); });
        it('should have 3 organizations', () => { expect(availableOrgs.length).toBe(3); });
    });

    describe('keyboardShortcuts', () => {
        it('should have shortcuts', () => { expect(keyboardShortcuts.length).toBeGreaterThan(0); });
        it('each has key and description', () => {
            keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); });
        });
    });
});
