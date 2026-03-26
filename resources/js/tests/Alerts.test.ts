/**
 * ARGUX — Alerts Page Tests
 * Run: npx vitest run resources/js/tests/Alerts.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockRules, mockAlertEvents, triggerConfig, sevColors, allOps, allPersons, keyboardShortcuts } from '../mock/alerts';
import type { TriggerType, Severity, ViewTab, AlertRule, AlertEvent } from '../mock/alerts';

describe('Alerts triggerConfig', () => {
    const types = Object.keys(triggerConfig) as TriggerType[];
    it('should have 9 trigger types', () => { expect(types.length).toBe(9); });
    it('all should have icon, label, color, fields', () => { types.forEach(t => { expect(triggerConfig[t].icon).toBeTruthy(); expect(triggerConfig[t].label).toBeTruthy(); expect(triggerConfig[t].color).toMatch(/^#[0-9a-f]{6}$/i); expect(triggerConfig[t].fields.length).toBeGreaterThan(0); }); });
    it('should include core types', () => { const ids = types; ['zone_entry', 'colocation', 'face_match', 'lpr_match', 'keyword'].forEach(t => expect(ids).toContain(t)); });
});

describe('Alerts sevColors', () => {
    it('should cover 3 severities', () => {
        (['Critical', 'Warning', 'Informational'] as const).forEach(s => { expect(sevColors[s]).toMatch(/^#[0-9a-f]{6}$/i); });
    });
});

describe('Alerts mockRules', () => {
    it('should have at least 10 rules', () => { expect(mockRules.length).toBeGreaterThanOrEqual(10); });
    it('IDs should be unique', () => { const ids = mockRules.map(r => r.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockRules.forEach((r: AlertRule) => {
            expect(r.id).toBeTruthy(); expect(r.name).toBeTruthy(); expect(r.description).toBeTruthy();
            expect(Object.keys(triggerConfig)).toContain(r.triggerType);
            expect(['Critical', 'Warning', 'Informational']).toContain(r.severity);
            expect(typeof r.enabled).toBe('boolean'); expect(r.channels.length).toBeGreaterThan(0);
            expect(typeof r.cooldown).toBe('number'); expect(r.operationCode).toBeTruthy();
            expect(typeof r.firedCount).toBe('number'); expect(r.createdBy).toBeTruthy();
        });
    });
    it('should have critical rules', () => { expect(mockRules.filter(r => r.severity === 'Critical').length).toBeGreaterThanOrEqual(3); });
    it('should have enabled and disabled rules', () => { expect(mockRules.filter(r => r.enabled).length).toBeGreaterThanOrEqual(5); expect(mockRules.filter(r => !r.enabled).length).toBeGreaterThanOrEqual(1); });
    it('should have rules across multiple trigger types', () => { const types = new Set(mockRules.map(r => r.triggerType)); expect(types.size).toBeGreaterThanOrEqual(5); });
    it('channels should be valid', () => { mockRules.forEach(r => r.channels.forEach(c => expect(['In-App', 'Email', 'SMS', 'Webhook']).toContain(c))); });
});

describe('Alerts mockAlertEvents', () => {
    it('should have at least 5 events', () => { expect(mockAlertEvents.length).toBeGreaterThanOrEqual(5); });
    it('IDs should be unique', () => { const ids = mockAlertEvents.map(e => e.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockAlertEvents.forEach((e: AlertEvent) => {
            expect(e.id).toBeTruthy(); expect(e.ruleId).toBeTruthy(); expect(e.title).toBeTruthy();
            expect(e.location).toBeTruthy(); expect(e.timestamp).toBeTruthy(); expect(e.timeAgo).toBeTruthy();
            expect(typeof e.acknowledged).toBe('boolean');
        });
    });
    it('should have unacknowledged events', () => { expect(mockAlertEvents.filter(e => !e.acknowledged).length).toBeGreaterThanOrEqual(1); });
    it('ruleIds should reference existing rules', () => { const ruleIds = mockRules.map(r => r.id); mockAlertEvents.forEach(e => expect(ruleIds).toContain(e.ruleId)); });
});

describe('Alerts helpers', () => {
    it('allOps should have at least 1 op', () => { expect(allOps.length).toBeGreaterThanOrEqual(1); });
    it('allPersons should have at least 3 persons', () => { expect(allPersons.length).toBeGreaterThanOrEqual(3); });
    it('allPersons should be sorted', () => { for (let i = 1; i < allPersons.length; i++) expect(allPersons[i] >= allPersons[i - 1]).toBe(true); });
});

describe('Alerts keyboardShortcuts', () => {
    it('should have at least 6 shortcuts', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(6); });
    it('should include Ctrl+Q, F, R, N, Esc, 1-3', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['Ctrl+Q', 'F', 'R', 'N', 'Esc', '1', '2', '3'].forEach(k => expect(keys).toContain(k));
    });
    it('all should have key and description', () => { keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); }); });
});
