/**
 * ARGUX — Jobs Page Tests
 * Run: npx vitest run resources/js/tests/Jobs.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockJobs, mockWorkers, typeConfig, statusColors, statusIcons, prioColors, allOps, keyboardShortcuts } from '../mock/jobs';
import type { JobStatus, JobType, Priority, ViewTab, Job, Worker } from '../mock/jobs';

describe('Jobs typeConfig', () => {
    const types = Object.keys(typeConfig) as JobType[];
    it('should have 10 job types', () => { expect(types.length).toBe(10); });
    it('all should have icon, color, label', () => { types.forEach(t => { expect(typeConfig[t].icon).toBeTruthy(); expect(typeConfig[t].color).toMatch(/^#[0-9a-f]{6}$/i); expect(typeConfig[t].label).toBeTruthy(); }); });
});

describe('Jobs statusColors/Icons', () => {
    it('should cover all 6 statuses', () => {
        (['Running', 'Queued', 'Completed', 'Failed', 'Cancelled', 'Retrying'] as const).forEach(s => {
            expect(statusColors[s]).toMatch(/^#[0-9a-f]{6}$/i);
            expect(statusIcons[s]).toBeTruthy();
        });
    });
});

describe('Jobs prioColors', () => {
    it('should cover all 4 priorities', () => {
        (['Critical', 'High', 'Normal', 'Low'] as const).forEach(p => {
            expect(prioColors[p]).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });
});

describe('Jobs mockJobs', () => {
    it('should have at least 15 jobs', () => { expect(mockJobs.length).toBeGreaterThanOrEqual(15); });
    it('IDs should be unique', () => { const ids = mockJobs.map(j => j.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockJobs.forEach((j: Job) => {
            expect(j.id).toBeTruthy(); expect(j.name).toBeTruthy(); expect(j.type).toBeTruthy();
            expect(j.status).toBeTruthy(); expect(j.priority).toBeTruthy();
            expect(typeof j.progress).toBe('number'); expect(j.progress).toBeGreaterThanOrEqual(0); expect(j.progress).toBeLessThanOrEqual(100);
            expect(j.queue).toBeTruthy(); expect(j.initiatedBy).toBeTruthy(); expect(j.input).toBeTruthy();
            expect(j.tags.length).toBeGreaterThan(0);
        });
    });
    it('all types should be valid', () => { mockJobs.forEach(j => expect(Object.keys(typeConfig)).toContain(j.type)); });
    it('all statuses should be valid', () => { mockJobs.forEach(j => expect(Object.keys(statusColors)).toContain(j.status)); });
    it('all priorities should be valid', () => { mockJobs.forEach(j => expect(Object.keys(prioColors)).toContain(j.priority)); });
    it('should have running jobs', () => { expect(mockJobs.filter(j => j.status === 'Running').length).toBeGreaterThanOrEqual(2); });
    it('should have queued jobs', () => { expect(mockJobs.filter(j => j.status === 'Queued').length).toBeGreaterThanOrEqual(2); });
    it('should have completed jobs', () => { expect(mockJobs.filter(j => j.status === 'Completed').length).toBeGreaterThanOrEqual(3); });
    it('should have failed jobs', () => { expect(mockJobs.filter(j => j.status === 'Failed').length).toBeGreaterThanOrEqual(1); });
    it('running jobs should have progress < 100', () => { mockJobs.filter(j => j.status === 'Running').forEach(j => expect(j.progress).toBeLessThan(100)); });
    it('completed jobs should have progress 100', () => { mockJobs.filter(j => j.status === 'Completed').forEach(j => expect(j.progress).toBe(100)); });
    it('completed jobs should have output', () => { mockJobs.filter(j => j.status === 'Completed').forEach(j => expect(j.output).toBeTruthy()); });
    it('failed jobs should have errorLog', () => { mockJobs.filter(j => j.status === 'Failed').forEach(j => expect(j.errorLog).toBeTruthy()); });
});

describe('Jobs mockWorkers', () => {
    it('should have at least 4 workers', () => { expect(mockWorkers.length).toBeGreaterThanOrEqual(4); });
    it('IDs should be unique', () => { const ids = mockWorkers.map(w => w.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockWorkers.forEach((w: Worker) => {
            expect(w.id).toBeTruthy(); expect(w.name).toBeTruthy(); expect(w.status).toBeTruthy();
            expect(typeof w.jobsProcessed).toBe('number'); expect(typeof w.cpu).toBe('number'); expect(typeof w.memory).toBe('number');
        });
    });
    it('active workers should have currentJob', () => { mockWorkers.filter(w => w.status === 'Active').forEach(w => expect(w.currentJob).toBeTruthy()); });
    it('cpu and memory should be 0-100', () => { mockWorkers.forEach(w => { expect(w.cpu).toBeGreaterThanOrEqual(0); expect(w.cpu).toBeLessThanOrEqual(100); expect(w.memory).toBeGreaterThanOrEqual(0); expect(w.memory).toBeLessThanOrEqual(100); }); });
});

describe('Jobs allOps', () => {
    it('should have at least 1 op', () => { expect(allOps.length).toBeGreaterThanOrEqual(1); });
    it('should not have empty strings', () => { allOps.forEach(o => expect(o.length).toBeGreaterThan(0)); });
});

describe('Jobs keyboardShortcuts', () => {
    it('should have at least 8 shortcuts', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(8); });
    it('should include Ctrl+Q, F, R, Esc, 1-6', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        expect(keys).toContain('Ctrl+Q'); expect(keys).toContain('F'); expect(keys).toContain('R'); expect(keys).toContain('Esc');
        expect(keys).toContain('1'); expect(keys).toContain('6');
    });
    it('all should have key and description', () => { keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); }); });
});
