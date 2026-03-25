/**
 * ARGUX — Activity Log Page Tests
 * Tests for mock data integrity, type configs, filters, and keyboard shortcuts
 *
 * Run: npx vitest run resources/js/tests/Activity.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
    mockEvents, typeConfig, sevConfig,
    allPersons, allOrgs, allOps, keyboardShortcuts,
} from '../mock/activity';
import type { EventType, Severity, ActivityEvent } from '../mock/activity';

// ═══════════════════════════════════════════════════════════════
// Event Type Config Tests
// ═══════════════════════════════════════════════════════════════

describe('Activity typeConfig', () => {
    const types = Object.keys(typeConfig) as EventType[];

    it('should have 12 event types', () => {
        expect(types.length).toBe(12);
    });

    it('should include core surveillance types', () => {
        const required: EventType[] = ['phone', 'gps', 'camera', 'lpr', 'face', 'audio', 'video', 'zone', 'alert', 'system', 'workflow', 'record'];
        required.forEach(t => {
            expect(typeConfig[t]).toBeDefined();
        });
    });

    it('all types should have icon, label, and color', () => {
        types.forEach(t => {
            expect(typeConfig[t].icon).toBeTruthy();
            expect(typeConfig[t].label).toBeTruthy();
            expect(typeConfig[t].color).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Severity Config Tests
// ═══════════════════════════════════════════════════════════════

describe('Activity sevConfig', () => {
    const sevs = Object.keys(sevConfig) as Severity[];

    it('should have 5 severity levels', () => {
        expect(sevs.length).toBe(5);
    });

    it('should include all levels', () => {
        ['critical', 'high', 'medium', 'low', 'info'].forEach(s => {
            expect(sevConfig[s as Severity]).toBeDefined();
        });
    });

    it('all should have color and label', () => {
        sevs.forEach(s => {
            expect(sevConfig[s].color).toMatch(/^#[0-9a-f]{6}$/i);
            expect(sevConfig[s].label).toBeTruthy();
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Mock Events Tests
// ═══════════════════════════════════════════════════════════════

describe('Activity mockEvents', () => {
    it('should have at least 15 events', () => {
        expect(mockEvents.length).toBeGreaterThanOrEqual(15);
    });

    it('all events should have required fields', () => {
        mockEvents.forEach((e: ActivityEvent) => {
            expect(e.id).toBeTruthy();
            expect(e.type).toBeTruthy();
            expect(e.severity).toBeTruthy();
            expect(e.title).toBeTruthy();
            expect(e.description).toBeTruthy();
            expect(e.timestamp).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
            expect(e.timeAgo).toBeTruthy();
            expect(e.source).toBeTruthy();
            expect(typeof e.lat).toBe('number');
            expect(typeof e.lng).toBe('number');
        });
    });

    it('event IDs should be unique', () => {
        const ids = mockEvents.map(e => e.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all event types should be valid', () => {
        const validTypes = Object.keys(typeConfig);
        mockEvents.forEach(e => {
            expect(validTypes).toContain(e.type);
        });
    });

    it('all severities should be valid', () => {
        const validSevs = Object.keys(sevConfig);
        mockEvents.forEach(e => {
            expect(validSevs).toContain(e.severity);
        });
    });

    it('should have events across multiple types', () => {
        const uniqueTypes = new Set(mockEvents.map(e => e.type));
        expect(uniqueTypes.size).toBeGreaterThanOrEqual(8);
    });

    it('should have events across multiple severities', () => {
        const uniqueSevs = new Set(mockEvents.map(e => e.severity));
        expect(uniqueSevs.size).toBeGreaterThanOrEqual(4);
    });

    it('should have critical events', () => {
        const critical = mockEvents.filter(e => e.severity === 'critical');
        expect(critical.length).toBeGreaterThanOrEqual(2);
    });

    it('should have events with person references', () => {
        const withPerson = mockEvents.filter(e => e.personId !== null);
        expect(withPerson.length).toBeGreaterThanOrEqual(5);
    });

    it('should have events with metadata', () => {
        mockEvents.forEach(e => {
            expect(typeof e.metadata).toBe('object');
            expect(Object.keys(e.metadata).length).toBeGreaterThanOrEqual(1);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Filter Helpers Tests
// ═══════════════════════════════════════════════════════════════

describe('Activity filter helpers', () => {
    it('allPersons should have unique entries', () => {
        const ids = allPersons.map(p => p.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('allPersons should all have name and id', () => {
        allPersons.forEach(p => {
            expect(p.id).toBeGreaterThan(0);
            expect(p.name).toBeTruthy();
        });
    });

    it('allOrgs should have unique entries', () => {
        const ids = allOrgs.map(o => o.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('allOrgs should all have name and id', () => {
        allOrgs.forEach(o => {
            expect(o.id).toBeGreaterThan(0);
            expect(o.name).toBeTruthy();
        });
    });

    it('allOps should have at least 1 operation code', () => {
        expect(allOps.length).toBeGreaterThanOrEqual(1);
    });

    it('allOps should have no empty strings', () => {
        allOps.forEach(op => {
            expect(op.length).toBeGreaterThan(0);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Keyboard Shortcuts Tests
// ═══════════════════════════════════════════════════════════════

describe('Activity keyboardShortcuts', () => {
    it('should have at least 4 shortcuts', () => {
        expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(4);
    });

    it('should include Ctrl+Q', () => {
        expect(keyboardShortcuts.map(s => s.key)).toContain('Ctrl+Q');
    });

    it('should include F for search', () => {
        expect(keyboardShortcuts.map(s => s.key)).toContain('F');
    });

    it('should include R for reset', () => {
        expect(keyboardShortcuts.map(s => s.key)).toContain('R');
    });

    it('should include Esc', () => {
        expect(keyboardShortcuts.map(s => s.key)).toContain('Esc');
    });

    it('all should have key and description', () => {
        keyboardShortcuts.forEach(s => {
            expect(s.key).toBeTruthy();
            expect(s.description).toBeTruthy();
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Data Consistency Tests
// ═══════════════════════════════════════════════════════════════

describe('Activity data consistency', () => {
    it('persons in events should match allPersons', () => {
        const eventPersonIds = new Set(mockEvents.filter(e => e.personId).map(e => e.personId));
        const helperPersonIds = new Set(allPersons.map(p => p.id));
        eventPersonIds.forEach(id => {
            expect(helperPersonIds.has(id as number)).toBe(true);
        });
    });

    it('orgs in events should match allOrgs', () => {
        const eventOrgIds = new Set(mockEvents.filter(e => e.orgId).map(e => e.orgId));
        const helperOrgIds = new Set(allOrgs.map(o => o.id));
        eventOrgIds.forEach(id => {
            expect(helperOrgIds.has(id as number)).toBe(true);
        });
    });

    it('operations in events should match allOps', () => {
        const eventOps = new Set(mockEvents.map(e => e.operationCode).filter(Boolean));
        eventOps.forEach(op => {
            expect(allOps).toContain(op);
        });
    });
});
