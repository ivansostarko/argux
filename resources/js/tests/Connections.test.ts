/**
 * ARGUX — Connections Page Tests
 * Run: npx vitest run resources/js/tests/Connections.test.ts
 */
import { describe, it, expect } from 'vitest';
import { nodes, edges, connectionCategories, connectionTypes, getConnectionColor, getConnectionCategory, relationshipColors, relationships, keyboardShortcuts } from '../mock/connections';
import type { ConnectionNode, ConnectionEdge, Relationship } from '../mock/connections';

describe('Connections connectionTypes', () => {
    it('should have at least 50 types', () => { expect(connectionTypes.length).toBeGreaterThanOrEqual(50); });
    it('should include core types', () => { ['Friend', 'Spouse', 'Employee', 'Co-Conspirator', 'Co-location', 'Unknown'].forEach(t => expect(connectionTypes).toContain(t)); });
});

describe('Connections connectionCategories', () => {
    it('should have 7 categories', () => { expect(Object.keys(connectionCategories).length).toBe(7); });
    it('all should have types array and color', () => {
        Object.values(connectionCategories).forEach(c => {
            expect(c.types.length).toBeGreaterThan(0);
            expect(c.color).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });
    it('should include Family, Personal, Professional, Criminal, Operational, Legal, Unknown', () => {
        ['Family', 'Personal', 'Professional', 'Criminal', 'Operational', 'Legal', 'Unknown'].forEach(c => expect(connectionCategories[c]).toBeTruthy());
    });
    it('all connection types should be in a category', () => {
        const allInCategories = Object.values(connectionCategories).flatMap(c => c.types);
        connectionTypes.forEach(t => expect(allInCategories).toContain(t));
    });
});

describe('Connections getConnectionColor/Category', () => {
    it('should return correct color for known types', () => {
        expect(getConnectionColor('Friend')).toBe(connectionCategories['Personal'].color);
        expect(getConnectionColor('Employee')).toBe(connectionCategories['Professional'].color);
        expect(getConnectionColor('Co-Conspirator')).toBe(connectionCategories['Criminal'].color);
    });
    it('should return correct category', () => {
        expect(getConnectionCategory('Friend')).toBe('Personal');
        expect(getConnectionCategory('Father')).toBe('Family');
        expect(getConnectionCategory('Handler')).toBe('Criminal');
    });
    it('should return fallback for unknown', () => {
        expect(getConnectionColor('nonexistent')).toBe('#6b7280');
        expect(getConnectionCategory('nonexistent')).toBe('Unknown');
    });
});

describe('Connections relationships', () => {
    it('should have 4 relationships', () => { expect(relationships.length).toBe(4); });
    it('should have colors for all', () => { relationships.forEach(r => expect(relationshipColors[r]).toMatch(/^#[0-9a-f]{6}$/i)); });
});

describe('Connections nodes', () => {
    it('should have at least 15 nodes', () => { expect(nodes.length).toBeGreaterThanOrEqual(15); });
    it('IDs should be unique', () => { const ids = nodes.map(n => n.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        nodes.forEach((n: ConnectionNode) => {
            expect(n.id).toBeTruthy(); expect(n.label).toBeTruthy();
            expect(['person', 'organization']).toContain(n.type);
            expect(typeof n.entityId).toBe('number');
            expect(n.risk).toBeTruthy();
        });
    });
    it('should have both persons and organizations', () => {
        expect(nodes.filter(n => n.type === 'person').length).toBeGreaterThanOrEqual(8);
        expect(nodes.filter(n => n.type === 'organization').length).toBeGreaterThanOrEqual(5);
    });
});

describe('Connections edges', () => {
    it('should have at least 25 edges', () => { expect(edges.length).toBeGreaterThanOrEqual(25); });
    it('IDs should be unique', () => { const ids = edges.map(e => e.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should reference valid nodes', () => {
        const nodeIds = new Set(nodes.map(n => n.id));
        edges.forEach(e => { expect(nodeIds.has(e.source)).toBe(true); expect(nodeIds.has(e.target)).toBe(true); });
    });
    it('all should have valid types', () => { edges.forEach(e => expect(connectionTypes).toContain(e.type)); });
    it('all should have valid relationships', () => { edges.forEach(e => expect(relationships).toContain(e.relationship)); });
    it('strength should be 1-5', () => { edges.forEach(e => { expect(e.strength).toBeGreaterThanOrEqual(1); expect(e.strength).toBeLessThanOrEqual(5); }); });
    it('should span multiple categories', () => {
        const cats = new Set(edges.map(e => getConnectionCategory(e.type)));
        expect(cats.size).toBeGreaterThanOrEqual(4);
    });
});

describe('Connections keyboardShortcuts', () => {
    it('should have at least 5', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(5); });
    it('should include N, T, F, R, Esc, Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['N', 'T', 'F', 'R', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
});
