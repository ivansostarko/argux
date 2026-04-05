import { describe, it, expect } from 'vitest';
import { mockJobs, typeConfig, statusConfig, keyboardShortcuts } from '../mock/jobs';
import type { JobStatus, JobType, Job } from '../mock/jobs';

describe('Jobs Mock Data', () => {
    describe('mockJobs', () => {
        it('should have 16 jobs', () => { expect(mockJobs.length).toBe(16); });
        it('IDs should be unique', () => { const ids = mockJobs.map(j => j.id); expect(new Set(ids).size).toBe(ids.length); });
        it('all jobs should have required fields', () => {
            mockJobs.forEach(j => {
                expect(j.id).toBeTruthy(); expect(j.type).toBeTruthy(); expect(j.name).toBeTruthy();
                expect(j.status).toBeTruthy(); expect(typeof j.progress).toBe('number');
                expect(j.queue).toBeTruthy(); expect(j.initiator).toBeTruthy(); expect(j.input).toBeTruthy();
                expect(j.priority).toBeTruthy(); expect(typeof j.retryCount).toBe('number');
                expect(typeof j.maxRetries).toBe('number');
            });
        });
        it('should have running jobs', () => { expect(mockJobs.filter(j => j.status === 'running').length).toBe(3); });
        it('should have queued jobs', () => { expect(mockJobs.filter(j => j.status === 'queued').length).toBe(3); });
        it('should have completed jobs', () => { expect(mockJobs.filter(j => j.status === 'completed').length).toBe(6); });
        it('should have failed jobs', () => { expect(mockJobs.filter(j => j.status === 'failed').length).toBe(3); });
        it('should have cancelled jobs', () => { expect(mockJobs.filter(j => j.status === 'cancelled').length).toBe(1); });
        it('running jobs should have progress < 100', () => { mockJobs.filter(j => j.status === 'running').forEach(j => expect(j.progress).toBeLessThan(100)); });
        it('completed jobs should have progress 100', () => { mockJobs.filter(j => j.status === 'completed').forEach(j => expect(j.progress).toBe(100)); });
        it('completed jobs should have output', () => { mockJobs.filter(j => j.status === 'completed').forEach(j => expect(j.output).toBeTruthy()); });
        it('failed jobs should have error', () => { mockJobs.filter(j => j.status === 'failed').forEach(j => expect(j.error).toBeTruthy()); });
        it('running jobs should have startedAt', () => { mockJobs.filter(j => j.status === 'running').forEach(j => expect(j.startedAt).toBeTruthy()); });
        it('completed jobs should have duration', () => { mockJobs.filter(j => j.status === 'completed').forEach(j => expect(j.duration).toBeTruthy()); });
        it('queued jobs should not have worker', () => { mockJobs.filter(j => j.status === 'queued').forEach(j => expect(j.worker).toBe('')); });
    });

    describe('typeConfig', () => {
        it('should have 8 types', () => { expect(Object.keys(typeConfig).length).toBe(8); });
        it('each type should have label, icon, color', () => {
            Object.values(typeConfig).forEach(t => { expect(t.label).toBeTruthy(); expect(t.icon).toBeTruthy(); expect(t.color).toMatch(/^#/); });
        });
    });

    describe('statusConfig', () => {
        it('should have 5 statuses', () => { expect(Object.keys(statusConfig).length).toBe(5); });
        it('each status should have label, color, icon', () => {
            Object.values(statusConfig).forEach(s => { expect(s.label).toBeTruthy(); expect(s.color).toMatch(/^#/); expect(s.icon).toBeTruthy(); });
        });
    });

    describe('keyboardShortcuts', () => {
        it('should have shortcuts', () => { expect(keyboardShortcuts.length).toBeGreaterThan(0); });
        it('each shortcut should have key and description', () => {
            keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); });
        });
    });
});
