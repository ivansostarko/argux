import { describe, it, expect } from 'vitest';
import { personRiskFactors, factorCategories, keyboardShortcuts } from '../mock/risks';
import type { ViewTab, RiskFactor } from '../mock/risks';

describe('Risks Mock Data', () => {
    describe('personRiskFactors', () => {
        it('should have factors for key persons', () => {
            expect(personRiskFactors[1]).toBeDefined();
            expect(personRiskFactors[9]).toBeDefined();
            expect(personRiskFactors[12]).toBeDefined();
        });
        it('Horvat should have 6+ factors', () => { expect(personRiskFactors[1].length).toBeGreaterThanOrEqual(6); });
        it('all factors should have required fields', () => {
            Object.values(personRiskFactors).flat().forEach((f: RiskFactor) => {
                expect(f.id).toBeTruthy(); expect(f.category).toBeTruthy();
                expect(f.icon).toBeTruthy(); expect(f.label).toBeTruthy();
                expect(f.severity).toBeTruthy(); expect(typeof f.score).toBe('number');
                expect(f.detail).toBeTruthy();
            });
        });
        it('scores should be 0-100', () => {
            Object.values(personRiskFactors).flat().forEach((f: RiskFactor) => {
                expect(f.score).toBeGreaterThan(0); expect(f.score).toBeLessThanOrEqual(100);
            });
        });
        it('IDs should be unique', () => {
            const ids = Object.values(personRiskFactors).flat().map(f => f.id);
            expect(new Set(ids).size).toBe(ids.length);
        });
        it('categories should match factorCategories', () => {
            const validCats = factorCategories.map((c: any) => c.id);
            Object.values(personRiskFactors).flat().forEach((f: RiskFactor) => {
                expect(validCats).toContain(f.category);
            });
        });
    });

    describe('factorCategories', () => {
        it('should have categories', () => { expect(factorCategories.length).toBeGreaterThanOrEqual(6); });
        it('each should have id, label, icon, color', () => {
            factorCategories.forEach((fc: any) => {
                expect(fc.id).toBeTruthy(); expect(fc.label).toBeTruthy();
                expect(fc.icon).toBeTruthy(); expect(fc.color).toMatch(/^#/);
            });
        });
        it('IDs should be unique', () => {
            const ids = factorCategories.map((c: any) => c.id);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });

    describe('keyboardShortcuts', () => {
        it('should have shortcuts', () => { expect(keyboardShortcuts.length).toBeGreaterThan(0); });
        it('each has key and description', () => {
            keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); });
        });
    });
});
