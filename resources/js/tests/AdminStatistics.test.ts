/**
 * ARGUX — Admin Statistics Tests
 * Run: npx vitest run resources/js/tests/AdminStatistics.test.ts
 */
import { describe, it, expect } from 'vitest';
import * as D from '../mock/admin-statistics';

describe('Statistics tabs', () => {
    it('should have 6 tabs', () => { expect(D.tabs.length).toBe(6); });
    it('should include overview, activity, devices, alerts, media, subjects', () => {
        const ids = D.tabs.map(t => t.id);
        ['overview', 'activity', 'devices', 'alerts', 'media', 'subjects'].forEach(id => expect(ids).toContain(id));
    });
    it('all should have id, label, icon', () => { D.tabs.forEach(t => { expect(t.id).toBeTruthy(); expect(t.label).toBeTruthy(); expect(t.icon).toBeTruthy(); }); });
});

describe('Overview data', () => {
    it('should have 6 KPIs', () => { expect(D.overviewKpis.length).toBe(6); });
    it('event trend should have 6 months', () => { expect(D.eventTrend.length).toBe(6); });
    it('entity growth should have 6 months with 3 series', () => { D.entityGrowth.forEach(d => { expect(d.persons).toBeGreaterThan(0); expect(d.orgs).toBeGreaterThan(0); expect(d.vehicles).toBeGreaterThan(0); }); });
    it('storage donut should have 7 categories', () => { expect(D.storageDonut.length).toBe(7); });
    it('event trend should be ascending', () => { for (let i = 1; i < D.eventTrend.length; i++) expect(D.eventTrend[i].events).toBeGreaterThanOrEqual(D.eventTrend[i - 1].events); });
});

describe('Activity data', () => {
    it('heatmap should be 7x24', () => { expect(D.activityHeatmap.length).toBe(7); D.activityHeatmap.forEach(row => expect(row.length).toBe(24)); });
    it('should have 7 day labels', () => { expect(D.heatmapDays.length).toBe(7); });
    it('top subjects should have at least 8', () => { expect(D.topSubjectsByActivity.length).toBeGreaterThanOrEqual(8); });
    it('top subjects should be sorted by events desc', () => { for (let i = 1; i < D.topSubjectsByActivity.length; i++) expect(D.topSubjectsByActivity[i - 1].events).toBeGreaterThanOrEqual(D.topSubjectsByActivity[i].events); });
    it('event type breakdown should have at least 6 types', () => { expect(D.eventTypeBreakdown.length).toBeGreaterThanOrEqual(6); });
});

describe('Devices data', () => {
    it('should have at least 5 device types', () => { expect(D.devicesByType.length).toBeGreaterThanOrEqual(5); });
    it('online + offline should equal total', () => { D.devicesByType.forEach(d => expect(d.online + d.offline).toBe(d.total)); });
    it('battery distribution should have 6 ranges', () => { expect(D.batteryDistribution.length).toBe(6); });
    it('sync rate data should have percentage values', () => { D.deviceSyncRate.forEach(d => { expect(d.cameras).toBeGreaterThanOrEqual(80); expect(d.gps).toBeGreaterThanOrEqual(80); }); });
});

describe('Alerts data', () => {
    it('alert frequency should have 7 days', () => { expect(D.alertFrequency.length).toBe(7); });
    it('severity donut should have 3 severities', () => { expect(D.alertSeverityDonut.length).toBe(3); });
    it('response time should have 5 ranges', () => { expect(D.responseTimeHistogram.length).toBe(5); });
    it('top triggered rules should have at least 6', () => { expect(D.topTriggeredRules.length).toBeGreaterThanOrEqual(6); });
    it('rules should have valid severities', () => { D.topTriggeredRules.forEach(r => expect(['critical', 'warning', 'info']).toContain(r.severity)); });
    it('rules should be sorted by triggers desc', () => { for (let i = 1; i < D.topTriggeredRules.length; i++) expect(D.topTriggeredRules[i - 1].triggers).toBeGreaterThanOrEqual(D.topTriggeredRules[i].triggers); });
});

describe('Media & AI data', () => {
    it('upload volume should have 5 weeks', () => { expect(D.uploadVolume.length).toBe(5); });
    it('AI stats should have at least 5 models', () => { expect(D.aiProcessingStats.length).toBeGreaterThanOrEqual(5); });
    it('AI models should include key engines', () => { const names = D.aiProcessingStats.map(m => m.model); expect(names.some(n => n.includes('Whisper'))).toBe(true); expect(names.some(n => n.includes('LLaMA'))).toBe(true); expect(names.some(n => n.includes('InsightFace'))).toBe(true); });
    it('face match rate should have 6 months', () => { expect(D.faceMatchRate.length).toBe(6); });
    it('face match rate should be improving', () => { expect(D.faceMatchRate[5].rate).toBeGreaterThan(D.faceMatchRate[0].rate); });
});

describe('Subjects data', () => {
    it('top persons should have 10', () => { expect(D.topPersonsByActivity.length).toBe(10); });
    it('top persons should be sorted by events desc', () => { for (let i = 1; i < D.topPersonsByActivity.length; i++) expect(D.topPersonsByActivity[i - 1].events).toBeGreaterThanOrEqual(D.topPersonsByActivity[i].events); });
    it('top orgs should have at least 6', () => { expect(D.topOrgsByConnections.length).toBeGreaterThanOrEqual(6); });
    it('risk distribution should have 5 levels', () => { expect(D.riskDistribution.length).toBe(5); });
    it('new entities trend should have 6 months', () => { expect(D.newEntitiesTrend.length).toBe(6); });
});

describe('Statistics keyboardShortcuts', () => {
    it('should include tab switching and Ctrl+Q', () => {
        const keys = D.keyboardShortcuts.map(s => s.key);
        expect(keys.some(k => k.includes('1'))).toBe(true);
        expect(keys).toContain('Ctrl+Q');
    });
});
