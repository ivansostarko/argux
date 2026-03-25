/**
 * ARGUX — Risks Dashboard Page Tests
 * Tests for mock data integrity, risk factors, categories, and keyboard shortcuts
 *
 * Run: npx vitest run resources/js/tests/Risks.test.ts
 */
import { describe, it, expect } from 'vitest';
import { personRiskFactors, factorCategories, keyboardShortcuts } from '../mock/risks';
import type { ViewTab, RiskFactor } from '../mock/risks';
import { mockPersons, riskColors } from '../mock/persons';
import { mockOrganizations } from '../mock/organizations';
import { mockVehicles } from '../mock/vehicles';

// ═══════════════════════════════════════════════════════════════
// Risk Factor Config Tests
// ═══════════════════════════════════════════════════════════════

describe('Risks factorCategories', () => {
    it('should have 8 categories', () => {
        expect(factorCategories.length).toBe(8);
    });

    it('all should have id, label, icon, color', () => {
        factorCategories.forEach(fc => {
            expect(fc.id).toBeTruthy();
            expect(fc.label).toBeTruthy();
            expect(fc.icon).toBeTruthy();
            expect(fc.color).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });

    it('should include core categories', () => {
        const ids = factorCategories.map(c => c.id);
        expect(ids).toContain('connections');
        expect(ids).toContain('zone');
        expect(ids).toContain('behavior');
        expect(ids).toContain('financial');
    });

    it('IDs should be unique', () => {
        const ids = factorCategories.map(c => c.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});

// ═══════════════════════════════════════════════════════════════
// Person Risk Factors Tests
// ═══════════════════════════════════════════════════════════════

describe('Risks personRiskFactors', () => {
    const allFactors = Object.entries(personRiskFactors).flatMap(([, factors]) => factors);

    it('should have factors for at least 3 persons', () => {
        expect(Object.keys(personRiskFactors).length).toBeGreaterThanOrEqual(3);
    });

    it('all factor IDs should be unique', () => {
        const ids = allFactors.map(f => f.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all factors should have required fields', () => {
        allFactors.forEach((f: RiskFactor) => {
            expect(f.id).toBeTruthy();
            expect(f.category).toBeTruthy();
            expect(f.icon).toBeTruthy();
            expect(f.label).toBeTruthy();
            expect(['critical', 'high', 'medium', 'low']).toContain(f.severity);
            expect(f.score).toBeGreaterThan(0);
            expect(f.score).toBeLessThanOrEqual(100);
            expect(f.detail).toBeTruthy();
        });
    });

    it('all factor categories should be valid', () => {
        const validCats = factorCategories.map(c => c.id);
        allFactors.forEach(f => {
            expect(validCats).toContain(f.category);
        });
    });

    it('person IDs should match mockPersons', () => {
        const personIds = mockPersons.map(p => p.id);
        Object.keys(personRiskFactors).forEach(pid => {
            expect(personIds).toContain(parseInt(pid));
        });
    });

    it('should have at least one critical factor', () => {
        const critical = allFactors.filter(f => f.severity === 'critical');
        expect(critical.length).toBeGreaterThanOrEqual(3);
    });

    it('scores should be between 1 and 100', () => {
        allFactors.forEach(f => {
            expect(f.score).toBeGreaterThanOrEqual(1);
            expect(f.score).toBeLessThanOrEqual(100);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Cross-Entity Risk Tests
// ═══════════════════════════════════════════════════════════════

describe('Risks cross-entity data', () => {
    it('mockPersons should have risk field', () => {
        mockPersons.forEach(p => {
            expect(p.risk).toBeTruthy();
            expect(riskColors[p.risk]).toBeDefined();
        });
    });

    it('mockOrganizations should have risk field', () => {
        mockOrganizations.forEach(o => {
            expect(o.risk).toBeTruthy();
            expect(riskColors[o.risk]).toBeDefined();
        });
    });

    it('mockVehicles should have risk field', () => {
        mockVehicles.forEach(v => {
            expect(v.risk).toBeTruthy();
            expect(riskColors[v.risk]).toBeDefined();
        });
    });

    it('should have at least 1 Critical person', () => {
        expect(mockPersons.filter(p => p.risk === 'Critical').length).toBeGreaterThanOrEqual(1);
    });

    it('should have at least 1 Critical organization', () => {
        expect(mockOrganizations.filter(o => o.risk === 'Critical').length).toBeGreaterThanOrEqual(1);
    });

    it('riskColors should cover all risk levels', () => {
        (['Critical', 'High', 'Medium', 'Low', 'No Risk'] as const).forEach(r => {
            expect(riskColors[r]).toBeDefined();
            expect(riskColors[r]).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Keyboard Shortcuts Tests
// ═══════════════════════════════════════════════════════════════

describe('Risks keyboardShortcuts', () => {
    it('should have at least 7 shortcuts', () => {
        expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(7);
    });

    it('should include tab shortcuts 1-5', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        expect(keys).toContain('1');
        expect(keys).toContain('2');
        expect(keys).toContain('3');
        expect(keys).toContain('4');
        expect(keys).toContain('5');
    });

    it('should include Ctrl+Q', () => {
        expect(keyboardShortcuts.map(s => s.key)).toContain('Ctrl+Q');
    });

    it('should include F for search and R for reset', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        expect(keys).toContain('F');
        expect(keys).toContain('R');
    });

    it('all should have key and description', () => {
        keyboardShortcuts.forEach(s => {
            expect(s.key).toBeTruthy();
            expect(s.description).toBeTruthy();
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Tab Type Tests
// ═══════════════════════════════════════════════════════════════

describe('Risks ViewTab type', () => {
    it('should allow all 5 tab values', () => {
        const tabs: ViewTab[] = ['overview', 'persons', 'organizations', 'vehicles', 'matrix'];
        expect(tabs.length).toBe(5);
    });
});