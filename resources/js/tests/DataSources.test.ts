/**
 * ARGUX — Data Sources Page Tests
 * Run: npx vitest run resources/js/tests/DataSources.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockDS, statusColors, statusIcons, catColors, catIcons, allCategories, allProtocols, allCountries, keyboardShortcuts } from '../mock/dataSources';
import type { DSStatus, DSCategory, Protocol, DataSource } from '../mock/dataSources';

describe('DataSources statusColors/Icons', () => {
    it('should cover all 5 statuses', () => {
        (['Connected', 'Degraded', 'Paused', 'Error', 'Offline'] as DSStatus[]).forEach(s => {
            expect(statusColors[s]).toMatch(/^#[0-9a-f]{6}$/i); expect(statusIcons[s]).toBeTruthy();
        });
    });
});

describe('DataSources catColors/Icons', () => {
    it('should cover all 6 categories', () => {
        allCategories.forEach(c => { expect(catColors[c]).toMatch(/^#[0-9a-f]{6}$/i); expect(catIcons[c]).toBeTruthy(); });
    });
    it('should have 6 categories', () => { expect(allCategories.length).toBe(6); });
});

describe('DataSources allProtocols', () => {
    it('should have at least 8 protocols', () => { expect(allProtocols.length).toBeGreaterThanOrEqual(8); });
    it('should include REST, SOAP, gRPC, MQTT', () => { ['REST', 'SOAP', 'gRPC', 'MQTT'].forEach(p => expect(allProtocols).toContain(p)); });
});

describe('DataSources mockDS', () => {
    it('should have at least 15 sources', () => { expect(mockDS.length).toBeGreaterThanOrEqual(15); });
    it('IDs should be unique', () => { const ids = mockDS.map(d => d.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockDS.forEach((d: DataSource) => {
            expect(d.id).toBeTruthy(); expect(d.name).toBeTruthy(); expect(d.provider).toBeTruthy();
            expect(allCategories).toContain(d.category);
            expect(['Connected', 'Degraded', 'Paused', 'Error', 'Offline']).toContain(d.status);
            expect(typeof d.health).toBe('number'); expect(d.health).toBeGreaterThanOrEqual(0); expect(d.health).toBeLessThanOrEqual(100);
            expect(d.protocol).toBeTruthy(); expect(d.endpoint).toBeTruthy(); expect(d.auth).toBeTruthy();
            expect(d.country).toBeTruthy(); expect(d.schedule).toBeTruthy();
            expect(typeof d.encryptRest).toBe('boolean'); expect(typeof d.encryptTransit).toBe('boolean');
            expect(d.dataFields.length).toBeGreaterThan(0); expect(d.linkedModules.length).toBeGreaterThan(0);
        });
    });
    it('should span all 6 categories', () => { const cats = new Set(mockDS.map(d => d.category)); expect(cats.size).toBe(6); });
    it('should have connected sources', () => { expect(mockDS.filter(d => d.status === 'Connected').length).toBeGreaterThanOrEqual(10); });
    it('should have degraded/error/paused sources', () => { expect(mockDS.filter(d => d.status !== 'Connected').length).toBeGreaterThanOrEqual(3); });
    it('should span multiple countries', () => { expect(allCountries.length).toBeGreaterThanOrEqual(5); });
    it('should have syncLog arrays', () => { mockDS.forEach(d => { expect(Array.isArray(d.syncLog)).toBe(true); d.syncLog.forEach(e => { expect(e.id).toBeTruthy(); expect(e.ts).toBeTruthy(); expect(['success', 'error', 'partial']).toContain(e.status); expect(e.detail).toBeTruthy(); }); }); });
    it('tags should have label and color', () => { mockDS.forEach(d => d.tags.forEach(t => { expect(t.label).toBeTruthy(); expect(t.color).toMatch(/^#[0-9a-f]{6}$/i); })); });
    it('should have multiple protocols represented', () => { const protos = new Set(mockDS.map(d => d.protocol)); expect(protos.size).toBeGreaterThanOrEqual(5); });
});

describe('DataSources allCountries', () => {
    it('should be sorted', () => { for (let i = 1; i < allCountries.length; i++) expect(allCountries[i] >= allCountries[i - 1]).toBe(true); });
});

describe('DataSources keyboardShortcuts', () => {
    it('should have at least 5', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(5); });
    it('should include N, F, R, S, Esc, Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['N', 'F', 'R', 'S', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
    it('all should have key and description', () => { keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); }); });
});
