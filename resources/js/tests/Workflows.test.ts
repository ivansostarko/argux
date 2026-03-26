/**
 * ARGUX — Workflows Page Tests
 * Run: npx vitest run resources/js/tests/Workflows.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockWorkflows, templates, statusColors, statusIcons, prioColors, triggerIcons, actionIcons, kanbanCols, allTriggerTypes, allActionTypes, keyboardShortcuts } from '../mock/workflows';
import type { WfStatus, TriggerType, ActionType, Workflow, Template } from '../mock/workflows';

describe('Workflows statusColors/Icons', () => {
    it('should cover all 5 statuses', () => { (['Draft', 'Active', 'Paused', 'Completed', 'Archived'] as WfStatus[]).forEach(s => { expect(statusColors[s]).toMatch(/^#[0-9a-f]{6}$/i); expect(statusIcons[s]).toBeTruthy(); }); });
});

describe('Workflows prioColors', () => {
    it('should cover 4 priorities', () => { ['Critical', 'High', 'Medium', 'Low'].forEach(p => expect(prioColors[p]).toMatch(/^#[0-9a-f]{6}$/i)); });
});

describe('Workflows triggerIcons', () => {
    it('should have 10 trigger types', () => { expect(Object.keys(triggerIcons).length).toBe(10); });
    it('allTriggerTypes should match', () => { allTriggerTypes.forEach(t => expect(triggerIcons[t.type]).toBeTruthy()); });
});

describe('Workflows actionIcons', () => {
    it('should have 8 action types', () => { expect(Object.keys(actionIcons).length).toBe(8); });
    it('allActionTypes should match', () => { allActionTypes.forEach(a => expect(actionIcons[a.type]).toBeTruthy()); });
});

describe('Workflows kanbanCols', () => {
    it('should have 5 columns', () => { expect(kanbanCols.length).toBe(5); });
    it('should match status order', () => { expect(kanbanCols.map(c => c.status)).toEqual(['Draft', 'Active', 'Paused', 'Completed', 'Archived']); });
});

describe('Workflows mockWorkflows', () => {
    it('should have 9 workflows', () => { expect(mockWorkflows.length).toBe(9); });
    it('IDs should be unique', () => { const ids = mockWorkflows.map(w => w.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockWorkflows.forEach((w: Workflow) => {
            expect(w.id).toBeTruthy(); expect(w.name).toBeTruthy(); expect(w.description).toBeTruthy();
            expect(['Draft', 'Active', 'Paused', 'Completed', 'Archived']).toContain(w.status);
            expect(['Critical', 'High', 'Medium', 'Low']).toContain(w.priority);
            expect(w.operationName).toBeTruthy();
            expect(w.triggers.length).toBeGreaterThan(0); expect(w.actions.length).toBeGreaterThan(0);
            expect(w.linkedPersonIds.length).toBeGreaterThan(0);
            expect(w.linkedPersonIds.length).toBe(w.linkedPersonNames.length);
            expect(typeof w.execCount).toBe('number'); expect(typeof w.successRate).toBe('number');
            expect(w.createdBy).toBeTruthy();
        });
    });
    it('should span multiple statuses', () => { const statuses = new Set(mockWorkflows.map(w => w.status)); expect(statuses.size).toBeGreaterThanOrEqual(4); });
    it('should span multiple operations', () => { const ops = new Set(mockWorkflows.map(w => w.operationName)); expect(ops.size).toBeGreaterThanOrEqual(2); });
    it('should have active workflows', () => { expect(mockWorkflows.filter(w => w.status === 'Active').length).toBeGreaterThanOrEqual(3); });
    it('should have workflows with exec logs', () => { expect(mockWorkflows.filter(w => w.execLog.length > 0).length).toBeGreaterThanOrEqual(5); });
    it('exec logs should have valid statuses', () => { mockWorkflows.flatMap(w => w.execLog).forEach(e => { expect(['success', 'failed', 'running']).toContain(e.status); expect(e.triggeredBy).toBeTruthy(); expect(e.output).toBeTruthy(); }); });
    it('should have multiple trigger types used', () => { const types = new Set(mockWorkflows.flatMap(w => w.triggers).map(t => t.type)); expect(types.size).toBeGreaterThanOrEqual(5); });
    it('should have multiple action types used', () => { const types = new Set(mockWorkflows.flatMap(w => w.actions).map(a => a.type)); expect(types.size).toBeGreaterThanOrEqual(5); });
});

describe('Workflows templates', () => {
    it('should have 6 templates', () => { expect(templates.length).toBe(6); });
    it('IDs should be unique', () => { const ids = templates.map(t => t.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        templates.forEach((t: Template) => {
            expect(t.id).toBeTruthy(); expect(t.name).toBeTruthy(); expect(t.description).toBeTruthy();
            expect(t.icon).toBeTruthy(); expect(t.category).toBeTruthy();
            expect(t.triggers.length).toBeGreaterThan(0); expect(t.actions.length).toBeGreaterThan(0);
        });
    });
    it('should span multiple categories', () => { const cats = new Set(templates.map(t => t.category)); expect(cats.size).toBeGreaterThanOrEqual(3); });
});

describe('Workflows keyboardShortcuts', () => {
    it('should have at least 7', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(7); });
    it('should include N, F, R, Esc, Ctrl+Q, 1-3', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['N', 'F', 'R', 'Esc', 'Ctrl+Q', '1', '2', '3'].forEach(k => expect(keys).toContain(k));
    });
});
