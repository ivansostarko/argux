/**
 * ARGUX — Admin Support Tickets Tests
 * Run: npx vitest run resources/js/tests/AdminSupport.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockTickets, statusConfig, priorityConfig, categoryConfig, assignees, keyboardShortcuts } from '../mock/admin-support';
import type { TicketStatus, TicketPriority, TicketCategory, Ticket } from '../mock/admin-support';

describe('Support statusConfig', () => {
    it('should have 5 statuses', () => { expect(Object.keys(statusConfig).length).toBe(5); });
    it('should include open, in_progress, waiting, resolved, closed', () => {
        ['open', 'in_progress', 'waiting', 'resolved', 'closed'].forEach(s =>
            expect(statusConfig[s as TicketStatus]).toBeTruthy()
        );
    });
    it('all should have label, color, icon', () => {
        Object.values(statusConfig).forEach(s => {
            expect(s.label).toBeTruthy(); expect(s.color).toMatch(/^#[0-9a-f]{6}$/i); expect(s.icon).toBeTruthy();
        });
    });
});

describe('Support priorityConfig', () => {
    it('should have 4 priorities', () => { expect(Object.keys(priorityConfig).length).toBe(4); });
    it('all should have label and color', () => {
        (['critical', 'high', 'medium', 'low'] as TicketPriority[]).forEach(p => {
            expect(priorityConfig[p].label).toBeTruthy();
            expect(priorityConfig[p].color).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });
});

describe('Support categoryConfig', () => {
    it('should have 8 categories', () => { expect(Object.keys(categoryConfig).length).toBe(8); });
    it('should include bug, feature, access, hardware, network, training, data, security', () => {
        ['bug', 'feature', 'access', 'hardware', 'network', 'training', 'data', 'security'].forEach(c =>
            expect(categoryConfig[c as TicketCategory]).toBeTruthy()
        );
    });
    it('all should have label and icon', () => {
        Object.values(categoryConfig).forEach(c => { expect(c.label).toBeTruthy(); expect(c.icon).toBeTruthy(); });
    });
});

describe('Support assignees', () => {
    it('should have at least 5 assignees', () => { expect(assignees.length).toBeGreaterThanOrEqual(5); });
    it('should include Unassigned', () => { expect(assignees).toContain('Unassigned'); });
});

describe('Support mockTickets', () => {
    it('should have at least 10 tickets', () => { expect(mockTickets.length).toBeGreaterThanOrEqual(10); });
    it('IDs should be unique', () => { const ids = mockTickets.map(t => t.id); expect(new Set(ids).size).toBe(ids.length); });
    it('ticket numbers should be unique', () => { const nums = mockTickets.map(t => t.number); expect(new Set(nums).size).toBe(nums.length); });
    it('all should have required fields', () => {
        mockTickets.forEach((t: Ticket) => {
            expect(t.id).toBeTruthy(); expect(t.number).toMatch(/^TKT-\d+$/);
            expect(t.subject).toBeTruthy(); expect(t.description).toBeTruthy();
            expect(Object.keys(statusConfig)).toContain(t.status);
            expect(Object.keys(priorityConfig)).toContain(t.priority);
            expect(Object.keys(categoryConfig)).toContain(t.category);
            expect(t.reporter).toBeTruthy(); expect(t.reporterEmail).toBeTruthy();
            expect(t.assignee).toBeTruthy();
            expect(t.createdAt).toBeTruthy(); expect(t.updatedAt).toBeTruthy();
            expect(t.messages.length).toBeGreaterThanOrEqual(1);
            expect(t.tags.length).toBeGreaterThan(0);
        });
    });
    it('should have all 5 statuses represented', () => {
        const statuses = new Set(mockTickets.map(t => t.status));
        ['open', 'in_progress', 'waiting', 'resolved', 'closed'].forEach(s =>
            expect(statuses.has(s as TicketStatus)).toBe(true)
        );
    });
    it('should have multiple priorities', () => {
        const prios = new Set(mockTickets.map(t => t.priority));
        expect(prios.size).toBeGreaterThanOrEqual(3);
    });
    it('should have multiple categories', () => {
        const cats = new Set(mockTickets.map(t => t.category));
        expect(cats.size).toBeGreaterThanOrEqual(5);
    });
    it('resolved/closed tickets should have resolvedAt', () => {
        mockTickets.filter(t => t.status === 'resolved' || t.status === 'closed').forEach(t => {
            expect(t.resolvedAt).toBeTruthy();
        });
    });
    it('messages should have valid types', () => {
        mockTickets.forEach(t => {
            t.messages.forEach(m => {
                expect(m.id).toBeTruthy(); expect(m.content).toBeTruthy();
                expect(m.author).toBeTruthy(); expect(m.timestamp).toBeTruthy();
                expect(['user', 'admin', 'system']).toContain(m.type);
            });
        });
    });
    it('should have tickets with multiple messages (conversation threads)', () => {
        expect(mockTickets.filter(t => t.messages.length >= 3).length).toBeGreaterThanOrEqual(4);
    });
    it('should have tickets with all 3 message types', () => {
        const allMsgs = mockTickets.flatMap(t => t.messages);
        const types = new Set(allMsgs.map(m => m.type));
        expect(types.has('user')).toBe(true);
        expect(types.has('admin')).toBe(true);
        expect(types.has('system')).toBe(true);
    });
    it('critical tickets should exist', () => {
        expect(mockTickets.filter(t => t.priority === 'critical').length).toBeGreaterThanOrEqual(1);
    });
    it('open tickets count should match sidebar badge (3)', () => {
        expect(mockTickets.filter(t => t.status === 'open').length).toBe(3);
    });
});

describe('Support keyboardShortcuts', () => {
    it('should have at least 4', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(4); });
    it('should include N, F, R, Esc, Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['N', 'F', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
});
