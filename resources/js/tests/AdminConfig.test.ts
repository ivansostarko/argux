/**
 * ARGUX — Admin Configuration Tests
 * Run: npx vitest run resources/js/tests/AdminConfig.test.ts
 */
import { describe, it, expect } from 'vitest';
import * as C from '../mock/admin-config';

describe('Config tabs', () => {
    it('should have 7 tabs', () => { expect(C.configTabs.length).toBe(7); });
    it('should include all expected tabs', () => {
        const ids = C.configTabs.map(t => t.id);
        ['general', 'security', 'notifications', 'dev', 'map', 'retention', 'system'].forEach(id => expect(ids).toContain(id));
    });
    it('all should have id, label, icon', () => { C.configTabs.forEach(t => { expect(t.id).toBeTruthy(); expect(t.label).toBeTruthy(); expect(t.icon).toBeTruthy(); }); });
});

describe('General config', () => {
    it('should have at least 4 languages', () => { expect(C.languages.length).toBeGreaterThanOrEqual(4); });
    it('should include en and hr', () => { expect(C.languages.map(l => l.code)).toContain('en'); expect(C.languages.map(l => l.code)).toContain('hr'); });
    it('should have at least 8 timezones', () => { expect(C.timezones.length).toBeGreaterThanOrEqual(8); });
    it('should have at least 4 date formats', () => { expect(C.dateFormats.length).toBeGreaterThanOrEqual(4); });
    it('should have 10 themes', () => { expect(C.themes.length).toBe(10); });
    it('should have 7 fonts', () => { expect(C.fonts.length).toBe(7); });
    it('should have at least 3 default clocks', () => { expect(C.defaultClocks.length).toBeGreaterThanOrEqual(3); });
    it('clocks should have id, label, timezone', () => { C.defaultClocks.forEach(c => { expect(c.id).toBeTruthy(); expect(c.label).toBeTruthy(); expect(c.timezone).toBeTruthy(); }); });
});

describe('Security config', () => {
    it('should have 3 MFA methods', () => { expect(C.mfaMethods.length).toBe(3); });
    it('should have at least 6 session timeouts', () => { expect(C.sessionTimeouts.length).toBeGreaterThanOrEqual(6); });
    it('should have at least 2 encryption options', () => { expect(C.encryptionOptions.length).toBeGreaterThanOrEqual(2); });
    it('should have at least 5 password policies', () => { expect(C.passwordPolicies.length).toBeGreaterThanOrEqual(5); });
    it('should have at least 2 default IP ranges', () => { expect(C.defaultIpWhitelist.length).toBeGreaterThanOrEqual(2); });
});

describe('Notifications config', () => {
    it('should have at least 10 notification types', () => { expect(C.notificationTypes.length).toBeGreaterThanOrEqual(10); });
    it('notification types should have id, label, icon, default', () => { C.notificationTypes.forEach(n => { expect(n.id).toBeTruthy(); expect(n.label).toBeTruthy(); expect(n.icon).toBeTruthy(); expect(typeof n.default).toBe('boolean'); }); });
    it('should have at least 5 channels', () => { expect(C.notificationChannels.length).toBeGreaterThanOrEqual(5); });
    it('channels should have id, label, icon, enabled', () => { C.notificationChannels.forEach(c => { expect(c.id).toBeTruthy(); expect(c.label).toBeTruthy(); expect(typeof c.enabled).toBe('boolean'); }); });
    it('in-app channel should be enabled by default', () => { expect(C.notificationChannels.find(c => c.id === 'in_app')?.enabled).toBe(true); });
});

describe('Dev config', () => {
    it('should have at least 4 environments', () => { expect(C.appEnvironments.length).toBeGreaterThanOrEqual(4); });
    it('should include production', () => { expect(C.appEnvironments).toContain('production'); });
    it('should have at least 6 log levels', () => { expect(C.logLevels.length).toBeGreaterThanOrEqual(6); });
    it('should have at least 3 filesystems', () => { expect(C.filesystems.length).toBeGreaterThanOrEqual(3); });
});

describe('Map config', () => {
    it('should have at least 12 tile providers', () => { expect(C.tileProviders.length).toBeGreaterThanOrEqual(12); });
    it('should have at least 5 map layers', () => { expect(C.mapLayers.length).toBeGreaterThanOrEqual(5); });
    it('should include CartoDB Dark', () => { expect(C.tileProviders.some(t => t.includes('CartoDB Dark'))).toBe(true); });
});

describe('Retention config', () => {
    it('should have at least 8 retention periods', () => { expect(C.retentionPeriods.length).toBeGreaterThanOrEqual(8); });
    it('should include Forever', () => { expect(C.retentionPeriods).toContain('Forever'); });
});

describe('System config', () => {
    it('should have at least 3 backup frequencies', () => { expect(C.backupFrequencies.length).toBeGreaterThanOrEqual(3); });
    it('should have at least 2 backup types', () => { expect(C.backupTypes.length).toBeGreaterThanOrEqual(2); });
    it('should have at least 7 AI models', () => { expect(C.aiModels.length).toBeGreaterThanOrEqual(7); });
    it('AI models should have id, label, gpu, status', () => { C.aiModels.forEach(m => { expect(m.id).toBeTruthy(); expect(m.label).toBeTruthy(); expect(m.gpu).toBeTruthy(); expect(['active', 'standby']).toContain(m.status); }); });
    it('should include key AI models', () => {
        const labels = C.aiModels.map(m => m.label);
        expect(labels.some(l => l.includes('LLaMA'))).toBe(true);
        expect(labels.some(l => l.includes('Whisper'))).toBe(true);
        expect(labels.some(l => l.includes('InsightFace'))).toBe(true);
    });
});

describe('Config shortcuts', () => {
    it('should include tab switching, S, Ctrl+Q', () => {
        const keys = C.keyboardShortcuts.map(s => s.key);
        expect(keys.some(k => k.includes('1'))).toBe(true);
        expect(keys).toContain('S');
        expect(keys).toContain('Ctrl+Q');
    });
});
