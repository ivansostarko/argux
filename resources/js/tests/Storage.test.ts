/**
 * ARGUX — Storage Browser Page Tests
 * Run: npx vitest run resources/js/tests/Storage.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockFiles, buildTree, typeConfig, keyboardShortcuts } from '../mock/storage';
import type { FileType, StorageFile, FolderNode } from '../mock/storage';

describe('Storage typeConfig', () => {
    it('should have 10 file types', () => { expect(Object.keys(typeConfig).length).toBe(10); });
    it('all should have icon, color, label', () => {
        (Object.keys(typeConfig) as FileType[]).forEach(t => {
            expect(typeConfig[t].icon).toBeTruthy(); expect(typeConfig[t].color).toMatch(/^#[0-9a-f]{6}$/i); expect(typeConfig[t].label).toBeTruthy();
        });
    });
    it('should include core types', () => { ['audio', 'video', 'photo', 'document', 'evidence', 'report'].forEach(t => expect(typeConfig[t as FileType]).toBeTruthy()); });
});

describe('Storage mockFiles', () => {
    it('should have at least 20 files', () => { expect(mockFiles.length).toBeGreaterThanOrEqual(20); });
    it('IDs should be unique', () => { const ids = mockFiles.map(f => f.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockFiles.forEach((f: StorageFile) => {
            expect(f.id).toBeTruthy(); expect(f.name).toBeTruthy();
            expect(Object.keys(typeConfig)).toContain(f.type);
            expect(f.size).toBeTruthy(); expect(typeof f.sizeBytes).toBe('number'); expect(f.sizeBytes).toBeGreaterThan(0);
            expect(f.mimeType).toBeTruthy();
            expect(['person', 'org']).toContain(f.entityType);
            expect(f.entityId).toBeGreaterThan(0); expect(f.entityName).toBeTruthy();
            expect(f.folder).toBeTruthy(); expect(f.path).toBeTruthy();
            expect(f.uploadedBy).toBeTruthy(); expect(f.uploadedAt).toBeTruthy();
            expect(f.tags.length).toBeGreaterThan(0);
        });
    });
    it('should span multiple file types', () => { const types = new Set(mockFiles.map(f => f.type)); expect(types.size).toBeGreaterThanOrEqual(6); });
    it('should have person and org files', () => {
        expect(mockFiles.filter(f => f.entityType === 'person').length).toBeGreaterThanOrEqual(10);
        expect(mockFiles.filter(f => f.entityType === 'org').length).toBeGreaterThanOrEqual(3);
    });
    it('should have files with transcriptions', () => { expect(mockFiles.filter(f => f.transcription).length).toBeGreaterThanOrEqual(2); });
    it('should have files with duration', () => { expect(mockFiles.filter(f => f.duration).length).toBeGreaterThanOrEqual(3); });
    it('should have files with pages', () => { expect(mockFiles.filter(f => f.pages).length).toBeGreaterThanOrEqual(3); });
    it('should have files with resolution', () => { expect(mockFiles.filter(f => f.resolution).length).toBeGreaterThanOrEqual(2); });
    it('should span multiple entities', () => {
        const personIds = new Set(mockFiles.filter(f => f.entityType === 'person').map(f => f.entityId));
        expect(personIds.size).toBeGreaterThanOrEqual(4);
    });
    it('sizes should be consistent (sizeBytes matches size label)', () => {
        mockFiles.forEach(f => {
            if (f.size.includes('MB')) expect(f.sizeBytes).toBeGreaterThanOrEqual(1000);
            if (f.size.includes('GB')) expect(f.sizeBytes).toBeGreaterThanOrEqual(1000000000);
        });
    });
});

describe('Storage buildTree', () => {
    it('should return persons and orgs root nodes', () => {
        const tree = buildTree();
        expect(tree.length).toBe(2);
        expect(tree[0].id).toBe('persons'); expect(tree[1].id).toBe('orgs');
    });
    it('persons should have children', () => { const tree = buildTree(); expect(tree[0].children.length).toBeGreaterThanOrEqual(5); });
    it('orgs should have children', () => { const tree = buildTree(); expect(tree[1].children.length).toBeGreaterThanOrEqual(5); });
    it('entity nodes should have subfolders', () => {
        const tree = buildTree();
        const firstPerson = tree[0].children[0];
        expect(firstPerson.children.length).toBe(9); // 9 default subfolders
        expect(firstPerson.entityType).toBe('person');
        expect(firstPerson.entityId).toBeGreaterThan(0);
    });
    it('subfolder names should match default set', () => {
        const tree = buildTree();
        const subs = tree[0].children[0].children.map(c => c.name);
        expect(subs).toContain('Audio'); expect(subs).toContain('Video'); expect(subs).toContain('Photos');
        expect(subs).toContain('Documents'); expect(subs).toContain('Evidence');
    });
});

describe('Storage keyboardShortcuts', () => {
    it('should have at least 4', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(4); });
    it('should include U, F, R, Esc, Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['U', 'F', 'R', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
    it('all should have key and description', () => { keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); }); });
});
