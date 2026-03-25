/**
 * ARGUX — Reports Page Tests
 * Run: npx vitest run resources/js/tests/Reports.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
    mockReports, statusColors, statusIcons, personSections, orgSections,
    allOps, keyboardShortcuts,
} from '../mock/reports';
import type { ReportStatus, EntityType, ViewMode, Report } from '../mock/reports';

describe('Reports statusColors/Icons', () => {
    it('should cover all statuses', () => {
        (['Completed', 'Generating', 'Failed', 'Queued'] as const).forEach(s => {
            expect(statusColors[s]).toMatch(/^#[0-9a-f]{6}$/i);
            expect(statusIcons[s]).toBeTruthy();
        });
    });
});

describe('Reports sections', () => {
    it('personSections should have 18 sections', () => {
        expect(personSections.length).toBe(18);
    });
    it('orgSections should have 11 sections', () => {
        expect(orgSections.length).toBe(11);
    });
    it('both should include AI Summary and Risk Assessment', () => {
        expect(personSections).toContain('AI Summary');
        expect(personSections).toContain('Risk Assessment');
        expect(orgSections).toContain('AI Summary');
        expect(orgSections).toContain('Risk Assessment');
    });
});

describe('Reports mockReports', () => {
    it('should have at least 10 reports', () => {
        expect(mockReports.length).toBeGreaterThanOrEqual(10);
    });

    it('all should have required fields', () => {
        mockReports.forEach((r: Report) => {
            expect(r.id).toBeTruthy();
            expect(r.title).toBeTruthy();
            expect(['person', 'organization']).toContain(r.entityType);
            expect(r.entityId).toBeGreaterThan(0);
            expect(r.entityName).toBeTruthy();
            expect(['Completed', 'Generating', 'Failed', 'Queued']).toContain(r.status);
            expect(r.classification).toBeTruthy();
            expect(r.dateFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(r.dateTo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(r.generatedBy).toBeTruthy();
            expect(r.operationCode).toBeTruthy();
            expect(r.sections.length).toBeGreaterThan(0);
        });
    });

    it('IDs should be unique', () => {
        const ids = mockReports.map(r => r.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have completed reports with pages > 0', () => {
        const completed = mockReports.filter(r => r.status === 'Completed');
        expect(completed.length).toBeGreaterThanOrEqual(5);
        completed.forEach(r => {
            expect(r.pages).toBeGreaterThan(0);
            expect(r.size).not.toBe('—');
        });
    });

    it('should have both person and org reports', () => {
        expect(mockReports.filter(r => r.entityType === 'person').length).toBeGreaterThanOrEqual(3);
        expect(mockReports.filter(r => r.entityType === 'organization').length).toBeGreaterThanOrEqual(2);
    });

    it('stats should have all required fields', () => {
        mockReports.forEach(r => {
            expect(typeof r.stats.events).toBe('number');
            expect(typeof r.stats.alerts).toBe('number');
            expect(typeof r.stats.connections).toBe('number');
            expect(typeof r.stats.lprHits).toBe('number');
            expect(typeof r.stats.faceMatches).toBe('number');
            expect(typeof r.stats.files).toBe('number');
        });
    });

    it('should have at least one failed and one generating report', () => {
        expect(mockReports.filter(r => r.status === 'Failed').length).toBeGreaterThanOrEqual(1);
        expect(mockReports.filter(r => r.status === 'Generating').length).toBeGreaterThanOrEqual(1);
    });
});

describe('Reports allOps', () => {
    it('should have at least 2 operation codes', () => {
        expect(allOps.length).toBeGreaterThanOrEqual(2);
    });
    it('should not have empty strings', () => {
        allOps.forEach(op => expect(op.length).toBeGreaterThan(0));
    });
});

describe('Reports keyboardShortcuts', () => {
    it('should have at least 5 shortcuts', () => {
        expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(5);
    });
    it('should include Ctrl+Q, F, R, Esc', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        expect(keys).toContain('Ctrl+Q');
        expect(keys).toContain('F');
        expect(keys).toContain('R');
        expect(keys).toContain('Esc');
    });
    it('should include view shortcuts 1-2', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        expect(keys).toContain('1');
        expect(keys).toContain('2');
    });
    it('all should have key and description', () => {
        keyboardShortcuts.forEach(s => {
            expect(s.key).toBeTruthy();
            expect(s.description).toBeTruthy();
        });
    });
});

describe('Reports ViewMode type', () => {
    it('should allow all 3 view modes', () => {
        const views: ViewMode[] = ['history', 'generate', 'preview'];
        expect(views.length).toBe(3);
    });
});
