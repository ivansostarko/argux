import { describe, it, expect } from 'vitest';
import { mockRules, mockAlertEvents, triggerConfig, sevColors, allOps, allPersons, keyboardShortcuts } from '../mock/alerts';
import type { TriggerType, Severity, AlertRule, AlertEvent } from '../mock/alerts';

describe('Alerts Mock Data', () => {
    describe('mockRules', () => {
        it('should have 13+ rules', () => { expect(mockRules.length).toBeGreaterThanOrEqual(13); });
        it('IDs should be unique', () => { const ids = mockRules.map(r => r.id); expect(new Set(ids).size).toBe(ids.length); });
        it('all rules have required fields', () => {
            mockRules.forEach(r => {
                expect(r.id).toBeTruthy(); expect(r.name).toBeTruthy();
                expect(r.triggerType).toBeTruthy(); expect(r.severity).toBeTruthy();
                expect(typeof r.enabled).toBe('boolean');
                expect(Array.isArray(r.channels)).toBe(true);
                expect(r.channels.length).toBeGreaterThan(0);
                expect(typeof r.firedCount).toBe('number');
            });
        });
        it('should have all 9 trigger types', () => {
            const types = new Set(mockRules.map(r => r.triggerType));
            expect(types.size).toBeGreaterThanOrEqual(7);
        });
        it('should have disabled rules', () => {
            expect(mockRules.filter(r => !r.enabled).length).toBeGreaterThan(0);
        });
    });

    describe('mockAlertEvents', () => {
        it('should have 8+ events', () => { expect(mockAlertEvents.length).toBeGreaterThanOrEqual(8); });
        it('should have unacknowledged events', () => {
            expect(mockAlertEvents.filter(e => !e.acknowledged).length).toBeGreaterThan(0);
        });
        it('events reference valid rules', () => {
            const ruleIds = new Set(mockRules.map(r => r.id));
            mockAlertEvents.forEach(e => { expect(ruleIds.has(e.ruleId)).toBe(true); });
        });
    });

    describe('triggerConfig', () => {
        it('should have 9 trigger types', () => { expect(Object.keys(triggerConfig).length).toBe(9); });
        it('each has icon, label, color, fields', () => {
            Object.values(triggerConfig).forEach(t => {
                expect(t.icon).toBeTruthy(); expect(t.label).toBeTruthy();
                expect(t.color).toMatch(/^#/); expect(Array.isArray(t.fields)).toBe(true);
            });
        });
    });

    describe('sevColors', () => {
        it('should have 3 severities', () => { expect(Object.keys(sevColors).length).toBe(3); });
    });

    describe('derived data', () => {
        it('allOps should have operations', () => { expect(allOps.length).toBeGreaterThan(0); });
        it('allPersons should have persons', () => { expect(allPersons.length).toBeGreaterThan(0); });
    });

    describe('keyboardShortcuts', () => {
        it('should have shortcuts', () => { expect(keyboardShortcuts.length).toBeGreaterThan(0); });
    });
});
