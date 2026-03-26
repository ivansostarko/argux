/**
 * ARGUX — Operations Page Tests
 * Run: npx vitest run resources/js/tests/Operations.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockOps, phaseColors, phaseIcons, prioColors, allPhases, tabList, keyboardShortcuts } from '../mock/operations';
import type { Phase, Priority, Operation } from '../mock/operations';

describe('Operations phaseColors/Icons', () => {
    it('should cover all 5 phases', () => { allPhases.forEach(p => { expect(phaseColors[p]).toMatch(/^#[0-9a-f]{6}$/i); expect(phaseIcons[p]).toBeTruthy(); }); });
    it('allPhases should have 5 entries', () => { expect(allPhases.length).toBe(5); });
});

describe('Operations prioColors', () => {
    it('should cover 4 priorities', () => { (['Critical', 'High', 'Medium', 'Low'] as Priority[]).forEach(p => expect(prioColors[p]).toMatch(/^#[0-9a-f]{6}$/i)); });
});

describe('Operations tabList', () => {
    it('should have 8 tabs', () => { expect(tabList.length).toBe(8); });
    it('should include overview, targets, teams, timeline, briefing', () => {
        const ids = tabList.map(t => t.id);
        ['overview', 'targets', 'resources', 'teams', 'zones', 'alerts', 'timeline', 'briefing'].forEach(t => expect(ids).toContain(t));
    });
    it('all should have id, label, icon', () => { tabList.forEach(t => { expect(t.id).toBeTruthy(); expect(t.label).toBeTruthy(); expect(t.icon).toBeTruthy(); }); });
});

describe('Operations mockOps', () => {
    it('should have 5 operations', () => { expect(mockOps.length).toBe(5); });
    it('IDs should be unique', () => { const ids = mockOps.map(o => o.id); expect(new Set(ids).size).toBe(ids.length); });
    it('codenames should be unique', () => { const codes = mockOps.map(o => o.codename); expect(new Set(codes).size).toBe(codes.length); });
    it('all should have required fields', () => {
        mockOps.forEach((o: Operation) => {
            expect(o.id).toBeTruthy(); expect(o.codename).toBeTruthy(); expect(o.name).toBeTruthy();
            expect(o.description).toBeTruthy();
            expect(allPhases).toContain(o.phase);
            expect(['Critical', 'High', 'Medium', 'Low']).toContain(o.priority);
            expect(o.classification).toBeTruthy(); expect(o.commander).toBeTruthy();
            expect(o.startDate).toBeTruthy();
            expect(typeof o.riskLevel).toBe('number');
            expect(typeof o.stats.events).toBe('number');
            expect(typeof o.stats.alerts).toBe('number');
            expect(typeof o.stats.hoursActive).toBe('number');
        });
    });
    it('should span multiple phases', () => { const phases = new Set(mockOps.map(o => o.phase)); expect(phases.size).toBeGreaterThanOrEqual(4); });
    it('should have active operations', () => { expect(mockOps.filter(o => o.phase === 'Active').length).toBeGreaterThanOrEqual(1); });
    it('should have operations with teams', () => { expect(mockOps.filter(o => o.teams.length > 0).length).toBeGreaterThanOrEqual(3); });
    it('should have operations with zones', () => { expect(mockOps.filter(o => o.zones.length > 0).length).toBeGreaterThanOrEqual(2); });
    it('should have operations with alert rules', () => { expect(mockOps.filter(o => o.alertRules.length > 0).length).toBeGreaterThanOrEqual(2); });
    it('should have operations with timeline events', () => { expect(mockOps.filter(o => o.timeline.length > 0).length).toBeGreaterThanOrEqual(4); });
    it('should have operations with checklists', () => { expect(mockOps.filter(o => o.checklist.length > 0).length).toBeGreaterThanOrEqual(3); });
    it('teams should have valid structure', () => { mockOps.flatMap(o => o.teams).forEach(t => { expect(t.id).toBeTruthy(); expect(t.name).toBeTruthy(); expect(t.icon).toBeTruthy(); expect(t.color).toMatch(/^#[0-9a-f]{6}$/i); expect(t.lead).toBeTruthy(); }); });
    it('zones should have valid coordinates', () => { mockOps.flatMap(o => o.zones).forEach(z => { expect(z.name).toBeTruthy(); expect(typeof z.lat).toBe('number'); expect(typeof z.lng).toBe('number'); expect(z.radius).toBeGreaterThan(0); expect(['surveillance', 'restricted', 'staging', 'buffer']).toContain(z.type); }); });
    it('HAWK should be the most complex operation', () => {
        const hawk = mockOps.find(o => o.codename === 'HAWK');
        expect(hawk).toBeTruthy();
        expect(hawk!.teams.length).toBeGreaterThanOrEqual(4);
        expect(hawk!.zones.length).toBeGreaterThanOrEqual(3);
        expect(hawk!.alertRules.length).toBeGreaterThanOrEqual(4);
        expect(hawk!.targetPersonIds.length).toBeGreaterThanOrEqual(4);
    });
});

describe('Operations keyboardShortcuts', () => {
    it('should have at least 4', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(4); });
    it('should include N, F, R, Esc, Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['N', 'F', 'R', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
});
