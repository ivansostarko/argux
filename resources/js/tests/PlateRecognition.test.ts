/**
 * ARGUX — Plate Recognition Page Tests
 * Run: npx vitest run resources/js/tests/PlateRecognition.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockScans, readers, statusColors, statusIcons, allReaders, allPersons, allOrgs, allPlates, keyboardShortcuts } from '../mock/plateRecognition';
import type { ScanStatus, ViewTab, LPRReader, LPRScan } from '../mock/plateRecognition';

describe('PlateRecognition statusColors/Icons', () => {
    it('should cover all 4 statuses', () => {
        (['Matched', 'Watchlist Hit', 'Unknown', 'Partial Read'] as ScanStatus[]).forEach(s => {
            expect(statusColors[s]).toMatch(/^#[0-9a-f]{6}$/i); expect(statusIcons[s]).toBeTruthy();
        });
    });
});

describe('PlateRecognition readers', () => {
    it('should have at least 8 readers', () => { expect(readers.length).toBeGreaterThanOrEqual(8); });
    it('IDs should be unique', () => { const ids = readers.map(r => r.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        readers.forEach((r: LPRReader) => {
            expect(r.id).toBeTruthy(); expect(r.name).toBeTruthy(); expect(r.location).toBeTruthy();
            expect(typeof r.lat).toBe('number'); expect(typeof r.lng).toBe('number');
            expect(['Online', 'Offline', 'Maintenance']).toContain(r.status);
            expect(typeof r.captureCount).toBe('number');
        });
    });
    it('should have online readers', () => { expect(readers.filter(r => r.status === 'Online').length).toBeGreaterThanOrEqual(5); });
    it('should have offline/maintenance', () => { expect(readers.filter(r => r.status !== 'Online').length).toBeGreaterThanOrEqual(1); });
});

describe('PlateRecognition mockScans', () => {
    it('should have at least 12 scans', () => { expect(mockScans.length).toBeGreaterThanOrEqual(12); });
    it('IDs should be unique', () => { const ids = mockScans.map(s => s.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockScans.forEach((s: LPRScan) => {
            expect(s.id).toBeTruthy(); expect(s.plate).toBeTruthy();
            expect(typeof s.plateConfidence).toBe('number'); expect(s.plateConfidence).toBeGreaterThanOrEqual(0); expect(s.plateConfidence).toBeLessThanOrEqual(100);
            expect(s.readerId).toBeTruthy(); expect(s.readerName).toBeTruthy();
            expect(['Matched', 'Watchlist Hit', 'Unknown', 'Partial Read']).toContain(s.status);
            expect(typeof s.lat).toBe('number'); expect(typeof s.lng).toBe('number');
            expect(s.timestamp).toBeTruthy(); expect(s.timeAgo).toBeTruthy();
            expect(typeof s.watchlistMatch).toBe('boolean');
            expect(s.tags.length).toBeGreaterThan(0);
        });
    });
    it('should have watchlist hits', () => { expect(mockScans.filter(s => s.watchlistMatch).length).toBeGreaterThanOrEqual(5); });
    it('should have unknown plates', () => { expect(mockScans.filter(s => s.status === 'Unknown').length).toBeGreaterThanOrEqual(1); });
    it('should have partial reads', () => { expect(mockScans.filter(s => s.status === 'Partial Read').length).toBeGreaterThanOrEqual(1); });
    it('watchlist hits should have watchlistMatch=true', () => { mockScans.filter(s => s.status === 'Watchlist Hit').forEach(s => expect(s.watchlistMatch).toBe(true)); });
    it('should have scans with speed data', () => { expect(mockScans.filter(s => s.speed !== null && s.speed > 0).length).toBeGreaterThanOrEqual(5); });
    it('should reference valid readers', () => { const rIds = readers.map(r => r.id); mockScans.forEach(s => expect(rIds).toContain(s.readerId)); });
    it('should have multiple unique plates', () => { expect(allPlates.length).toBeGreaterThanOrEqual(6); });
});

describe('PlateRecognition derived lists', () => {
    it('allReaders should match readers count', () => { expect(allReaders.length).toBe(readers.length); });
    it('allPersons should have unique IDs', () => { const ids = allPersons.map(p => p.id); expect(new Set(ids).size).toBe(ids.length); });
    it('allOrgs should have unique IDs', () => { const ids = allOrgs.map(o => o.id); expect(new Set(ids).size).toBe(ids.length); });
    it('allPlates should be sorted', () => { for (let i = 1; i < allPlates.length; i++) expect(allPlates[i] >= allPlates[i - 1]).toBe(true); });
});

describe('PlateRecognition keyboardShortcuts', () => {
    it('should have at least 6', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(6); });
    it('should include Ctrl+Q, F, R, Esc, 1-3', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['Ctrl+Q', 'F', 'R', 'Esc', '1', '2', '3'].forEach(k => expect(keys).toContain(k));
    });
    it('all should have key and description', () => { keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); }); });
});
