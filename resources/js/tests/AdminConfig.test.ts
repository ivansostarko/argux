/**
 * ARGUX — Admin Configuration Tests (11 tabs)
 * Run: npx vitest run resources/js/tests/AdminConfig.test.ts
 */
import { describe, it, expect } from 'vitest';
import * as C from '../mock/admin-config';

describe('Config tabs', () => {
    it('should have 11 tabs', () => { expect(C.configTabs.length).toBe(11); });
    it('should include all expected tabs', () => {
        const ids = C.configTabs.map(t => t.id);
        ['general','security','notifications','dev','map','retention','backup','ai','storage','update','licence'].forEach(id => expect(ids).toContain(id));
    });
});

describe('General config', () => {
    it('should have languages, timezones, themes, fonts, clocks', () => {
        expect(C.languages.length).toBeGreaterThanOrEqual(4);
        expect(C.timezones.length).toBeGreaterThanOrEqual(8);
        expect(C.themes.length).toBe(10);
        expect(C.fonts.length).toBe(7);
        expect(C.defaultClocks.length).toBeGreaterThanOrEqual(3);
    });
});

describe('Security config', () => {
    it('should have MFA, timeouts, encryption, passwords, IPs', () => {
        expect(C.mfaMethods.length).toBe(3);
        expect(C.sessionTimeouts.length).toBeGreaterThanOrEqual(6);
        expect(C.encryptionOptions.length).toBeGreaterThanOrEqual(2);
        expect(C.passwordPolicies.length).toBeGreaterThanOrEqual(5);
        expect(C.defaultIpWhitelist.length).toBeGreaterThanOrEqual(2);
    });
});

describe('Notifications config', () => {
    it('should have types and channels', () => {
        expect(C.notificationTypes.length).toBeGreaterThanOrEqual(10);
        expect(C.notificationChannels.length).toBeGreaterThanOrEqual(5);
        expect(C.notificationChannels.find(c => c.id === 'in_app')?.enabled).toBe(true);
    });
});

describe('Backup config', () => {
    it('should have frequencies and types', () => { expect(C.backupFrequencies.length).toBeGreaterThanOrEqual(3); expect(C.backupTypes.length).toBeGreaterThanOrEqual(2); });
    it('should have backup history', () => { expect(C.backupHistory.length).toBeGreaterThanOrEqual(5); });
    it('backup history should have required fields', () => {
        C.backupHistory.forEach(b => { expect(b.id).toBeTruthy(); expect(['completed','running','failed','scheduled']).toContain(b.status); expect(b.databases.length).toBeGreaterThan(0); });
    });
    it('should have backup databases', () => { expect(C.backupDatabases.length).toBeGreaterThanOrEqual(4); });
    it('should have both completed and failed backups', () => {
        expect(C.backupHistory.some(b => b.status === 'completed')).toBe(true);
        expect(C.backupHistory.some(b => b.status === 'failed')).toBe(true);
    });
});

describe('AI config', () => {
    it('should have at least 8 AI functions', () => { expect(C.aiFunctions.length).toBeGreaterThanOrEqual(8); });
    it('should include core functions', () => {
        const ids = C.aiFunctions.map(f => f.id);
        ['rag','audio_transcription','video_analysis','photo_analysis','plate_recognition','face_recognition','translation'].forEach(id => expect(ids).toContain(id));
    });
    it('all functions should have models', () => { C.aiFunctions.forEach(f => { expect(f.models.length).toBeGreaterThanOrEqual(1); expect(f.primaryModelId).toBeTruthy(); expect(f.models.some(m => m.id === f.primaryModelId)).toBe(true); }); });
    it('models should have required fields', () => { C.aiFunctions.flatMap(f => f.models).forEach(m => { expect(m.id).toBeTruthy(); expect(m.name).toBeTruthy(); expect(['active','standby','error']).toContain(m.status); }); });
    it('functions should have usage stats', () => { C.aiFunctions.forEach(f => { expect(typeof f.jobsToday).toBe('number'); expect(typeof f.jobsTotal).toBe('number'); expect(f.avgTime).toBeTruthy(); }); });
    it('some functions should have multiple models', () => { expect(C.aiFunctions.filter(f => f.models.length >= 2).length).toBeGreaterThanOrEqual(4); });
});

describe('Storage config', () => {
    it('should have at least 5 storage nodes', () => { expect(C.storageNodes.length).toBeGreaterThanOrEqual(5); });
    it('nodes should have required fields', () => { C.storageNodes.forEach(n => { expect(n.id).toBeTruthy(); expect(n.totalGb).toBeGreaterThan(0); expect(n.usedGb).toBeLessThanOrEqual(n.totalGb); expect(['healthy','warning','critical']).toContain(n.status); }); });
    it('should have MinIO buckets', () => { expect(C.minioBuckets.length).toBeGreaterThanOrEqual(5); });
    it('buckets should have objects and size', () => { C.minioBuckets.forEach(b => { expect(b.name).toBeTruthy(); expect(b.objects).toBeGreaterThan(0); expect(b.sizeGb).toBeGreaterThan(0); }); });
    it('should include PostgreSQL, ClickHouse, MinIO, Redis', () => {
        const labels = C.storageNodes.map(n => n.label);
        expect(labels.some(l => l.includes('PostgreSQL'))).toBe(true);
        expect(labels.some(l => l.includes('ClickHouse'))).toBe(true);
        expect(labels.some(l => l.includes('MinIO'))).toBe(true);
        expect(labels.some(l => l.includes('Redis'))).toBe(true);
    });
});

describe('Update config', () => {
    it('should have current version info', () => { expect(C.currentVersion.version).toBeTruthy(); expect(C.currentVersion.build).toBeTruthy(); expect(C.currentVersion.laravel).toBeTruthy(); expect(C.currentVersion.react).toBeTruthy(); });
    it('should have available updates', () => { expect(C.availableUpdates.length).toBeGreaterThanOrEqual(1); C.availableUpdates.forEach(u => { expect(u.version).toBeTruthy(); expect(u.changes.length).toBeGreaterThan(0); expect(['major','minor','patch','security']).toContain(u.type); }); });
    it('should have update history', () => { expect(C.updateHistory.length).toBeGreaterThanOrEqual(3); });
});

describe('Licence config', () => {
    it('should have licence info', () => { expect(C.licenceInfo.key).toBeTruthy(); expect(C.licenceInfo.type).toBeTruthy(); expect(C.licenceInfo.status).toBe('active'); expect(C.licenceInfo.daysRemaining).toBeGreaterThan(0); expect(C.licenceInfo.seats.used).toBeLessThanOrEqual(C.licenceInfo.seats.total); });
    it('should have at least 20 modules', () => { expect(C.licenceModules.length).toBeGreaterThanOrEqual(20); });
    it('most modules should be included', () => { expect(C.licenceModules.filter(m => m.included).length).toBeGreaterThan(C.licenceModules.length / 2); });
    it('some modules should be add-ons', () => { expect(C.licenceModules.filter(m => m.addon).length).toBeGreaterThanOrEqual(3); });
    it('some modules should not be licensed', () => { expect(C.licenceModules.filter(m => !m.included).length).toBeGreaterThanOrEqual(1); });
    it('addon modules should have prices', () => { C.licenceModules.filter(m => m.addon).forEach(m => expect(m.addonPrice).toBeTruthy()); });
});
