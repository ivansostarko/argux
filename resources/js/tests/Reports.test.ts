import { describe, it, expect } from 'vitest';
import {
    mockReports, statusConfig, personSections, orgSections,
    persons, organizations, riskColors, keyboardShortcuts,
} from '../mock/reports';
import type { ReportStatus, EntityType, Report } from '../mock/reports';

describe('Reports Mock Data', () => {
    describe('mockReports', () => {
        it('should have 9 reports', () => { expect(mockReports.length).toBe(9); });
        it('IDs should be unique', () => { const ids = mockReports.map(r => r.id); expect(new Set(ids).size).toBe(ids.length); });
        it('all reports should have required fields', () => {
            mockReports.forEach(r => {
                expect(r.id).toBeTruthy(); expect(r.entityType).toBeTruthy(); expect(r.entityName).toBeTruthy();
                expect(r.title).toBeTruthy(); expect(r.status).toBeTruthy(); expect(r.format).toBeTruthy();
                expect(typeof r.sections).toBe('number'); expect(r.generatedBy).toBeTruthy();
                expect(r.classification).toBe('CLASSIFIED // NOFORN');
            });
        });
        it('should have completed reports', () => {
            const completed = mockReports.filter(r => r.status === 'completed');
            expect(completed.length).toBe(7);
            completed.forEach(r => { expect(r.pages).toBeGreaterThan(0); expect(r.size).toBeTruthy(); });
        });
        it('should have a generating report', () => { expect(mockReports.filter(r => r.status === 'generating').length).toBe(1); });
        it('should have a failed report', () => { expect(mockReports.filter(r => r.status === 'failed').length).toBe(1); });
        it('person reports should have 14 sections', () => {
            mockReports.filter(r => r.entityType === 'person' && r.status === 'completed').forEach(r => expect(r.sections).toBe(14));
        });
        it('org reports should have 6 sections', () => {
            mockReports.filter(r => r.entityType === 'organization' && r.status === 'completed').forEach(r => expect(r.sections).toBe(6));
        });
    });

    describe('entities', () => {
        it('should have 10 persons', () => { expect(persons.length).toBe(10); });
        it('should have 5 organizations', () => { expect(organizations.length).toBe(5); });
        it('persons should have id, name, risk', () => {
            persons.forEach(p => { expect(p.id).toBeTruthy(); expect(p.name).toBeTruthy(); expect(p.risk).toBeTruthy(); });
        });
    });

    describe('sections', () => {
        it('person reports have 14 sections', () => { expect(personSections.length).toBe(14); });
        it('org reports have 6 sections', () => { expect(orgSections.length).toBe(6); });
        it('sections should not have empty strings', () => {
            personSections.forEach(s => expect(s.length).toBeGreaterThan(0));
            orgSections.forEach(s => expect(s.length).toBeGreaterThan(0));
        });
    });

    describe('statusConfig', () => {
        it('should have 4 statuses', () => { expect(Object.keys(statusConfig).length).toBe(4); });
        it('each status should have label, color, icon', () => {
            Object.values(statusConfig).forEach(s => { expect(s.label).toBeTruthy(); expect(s.color).toMatch(/^#/); expect(s.icon).toBeTruthy(); });
        });
    });

    describe('riskColors', () => {
        it('should have 4 risk levels', () => { expect(Object.keys(riskColors).length).toBe(4); });
    });

    describe('keyboardShortcuts', () => {
        it('should have shortcuts', () => { expect(keyboardShortcuts.length).toBeGreaterThan(0); });
        it('each shortcut should have key and description', () => {
            keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); });
        });
    });
});
