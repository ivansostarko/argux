import { describe, it, expect } from 'vitest';
import { mockFiles, entities, fileTypeConfig, keyboardShortcuts } from '../mock/storage';
import type { FileType, StorageFile, StorageEntity } from '../mock/storage';

describe('Storage Mock Data', () => {
    describe('mockFiles', () => {
        it('should have 16 files', () => { expect(mockFiles.length).toBe(16); });
        it('IDs should be unique', () => { const ids = mockFiles.map(f => f.id); expect(new Set(ids).size).toBe(ids.length); });
        it('all files should have required fields', () => {
            mockFiles.forEach(f => {
                expect(f.id).toBeTruthy(); expect(f.name).toBeTruthy(); expect(f.fileType).toBeTruthy();
                expect(f.size).toBeTruthy(); expect(typeof f.sizeBytes).toBe('number');
                expect(f.entityId).toBeTruthy(); expect(f.entityType).toBeTruthy(); expect(f.entityName).toBeTruthy();
                expect(f.mimeType).toBeTruthy(); expect(f.uploadedBy).toBeTruthy(); expect(f.uploadedAt).toBeTruthy();
                expect(Object.keys(fileTypeConfig)).toContain(f.fileType);
            });
        });
        it('should span multiple file types', () => { const types = new Set(mockFiles.map(f => f.fileType)); expect(types.size).toBe(4); });
        it('should have person and org files', () => {
            expect(mockFiles.filter(f => f.entityType === 'person').length).toBeGreaterThan(0);
            expect(mockFiles.filter(f => f.entityType === 'organization').length).toBeGreaterThan(0);
        });
        it('should have files with transcripts', () => { expect(mockFiles.filter(f => f.transcript).length).toBeGreaterThanOrEqual(2); });
        it('should have files with metadata', () => { mockFiles.forEach(f => expect(typeof f.metadata).toBe('object')); });
        it('type distribution is correct', () => {
            expect(mockFiles.filter(f => f.fileType === 'audio').length).toBe(2);
            expect(mockFiles.filter(f => f.fileType === 'video').length).toBe(6);
            expect(mockFiles.filter(f => f.fileType === 'photo').length).toBe(1);
            expect(mockFiles.filter(f => f.fileType === 'document').length).toBe(7);
        });
    });

    describe('entities', () => {
        it('should have 8 entities', () => { expect(entities.length).toBe(8); });
        it('should have persons and organizations', () => {
            expect(entities.filter(e => e.type === 'person').length).toBe(6);
            expect(entities.filter(e => e.type === 'organization').length).toBe(2);
        });
        it('each entity should have fileCount and totalSize', () => {
            entities.forEach(e => { expect(e.fileCount).toBeGreaterThan(0); expect(e.totalSize).toBeTruthy(); });
        });
    });

    describe('fileTypeConfig', () => {
        it('should have 4 types', () => { expect(Object.keys(fileTypeConfig).length).toBe(4); });
        it('each type should have label, icon, color, extensions', () => {
            Object.values(fileTypeConfig).forEach(t => {
                expect(t.label).toBeTruthy(); expect(t.icon).toBeTruthy();
                expect(t.color).toMatch(/^#/); expect(t.extensions.length).toBeGreaterThan(0);
            });
        });
    });

    describe('keyboardShortcuts', () => {
        it('should have shortcuts', () => { expect(keyboardShortcuts.length).toBeGreaterThan(0); });
        it('each shortcut should have key and description', () => {
            keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); });
        });
    });
});
