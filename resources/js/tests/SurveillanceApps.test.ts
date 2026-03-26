/**
 * ARGUX — Surveillance Apps Page Tests
 * Run: npx vitest run resources/js/tests/SurveillanceApps.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockApps, statusColors, statusIcons, typeIcons, tabConfig, remoteCommands, keyboardShortcuts } from '../mock/surveillanceApps';
import type { AppStatus, AppType, DataTab, DeployedApp } from '../mock/surveillanceApps';

describe('SurveillanceApps statusColors/Icons', () => {
    it('should cover all 5 statuses', () => {
        (['Active', 'Stealth', 'Paused', 'Offline', 'Compromised'] as AppStatus[]).forEach(s => {
            expect(statusColors[s]).toMatch(/^#[0-9a-f]{6}$/i); expect(statusIcons[s]).toBeTruthy();
        });
    });
});

describe('SurveillanceApps typeIcons', () => {
    it('should cover all 4 types', () => {
        (['Full Monitor', 'GPS Tracker', 'Comms Intercept', 'Stealth Suite'] as AppType[]).forEach(t => expect(typeIcons[t]).toBeTruthy());
    });
});

describe('SurveillanceApps tabConfig', () => {
    it('should have 10 tabs', () => { expect(Object.keys(tabConfig).length).toBe(10); });
    it('all should have icon and label', () => {
        (Object.keys(tabConfig) as DataTab[]).forEach(t => {
            expect(tabConfig[t].icon).toBeTruthy(); expect(tabConfig[t].label).toBeTruthy();
        });
    });
    it('should include sms, calls, contacts, calendar, remote', () => {
        ['sms', 'calls', 'contacts', 'calendar', 'remote'].forEach(t => expect(tabConfig[t as DataTab]).toBeTruthy());
    });
});

describe('SurveillanceApps remoteCommands', () => {
    it('should have 10 commands', () => { expect(remoteCommands.length).toBe(10); });
    it('all should have icon, label, desc, color', () => {
        remoteCommands.forEach(c => {
            expect(c.icon).toBeTruthy(); expect(c.label).toBeTruthy();
            expect(c.desc).toBeTruthy(); expect(c.color).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });
});

describe('SurveillanceApps mockApps', () => {
    it('should have 6 apps', () => { expect(mockApps.length).toBe(6); });
    it('IDs should be unique', () => { const ids = mockApps.map(a => a.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockApps.forEach((a: DeployedApp) => {
            expect(a.id).toBeTruthy(); expect(a.personId).toBeGreaterThan(0);
            expect(a.personName).toBeTruthy(); expect(a.personAvatar).toBeTruthy();
            expect(['Full Monitor', 'GPS Tracker', 'Comms Intercept', 'Stealth Suite']).toContain(a.type);
            expect(['Active', 'Stealth', 'Paused', 'Offline', 'Compromised']).toContain(a.status);
            expect(['Android', 'iOS']).toContain(a.platform);
            expect(a.deviceModel).toBeTruthy(); expect(a.osVersion).toBeTruthy();
            expect(a.imei).toBeTruthy(); expect(a.phoneNumber).toBeTruthy();
            expect(typeof a.battery).toBe('number'); expect(typeof a.signal).toBe('number');
            expect(typeof a.lat).toBe('number'); expect(typeof a.lng).toBe('number');
        });
    });
    it('should have active/stealth apps', () => { expect(mockApps.filter(a => a.status === 'Active' || a.status === 'Stealth').length).toBeGreaterThanOrEqual(3); });
    it('should have offline/paused apps', () => { expect(mockApps.filter(a => a.status === 'Offline' || a.status === 'Paused').length).toBeGreaterThanOrEqual(1); });
    it('should span both platforms', () => {
        expect(mockApps.filter(a => a.platform === 'Android').length).toBeGreaterThanOrEqual(2);
        expect(mockApps.filter(a => a.platform === 'iOS').length).toBeGreaterThanOrEqual(1);
    });
    it('should have apps with SMS data', () => { expect(mockApps.filter(a => a.sms.length > 0).length).toBeGreaterThanOrEqual(3); });
    it('should have apps with calls data', () => { expect(mockApps.filter(a => a.calls.length > 0).length).toBeGreaterThanOrEqual(3); });
    it('should have apps with contacts', () => { expect(mockApps.filter(a => a.contacts.length > 0).length).toBeGreaterThanOrEqual(2); });
    it('should have flagged SMS', () => {
        const flagged = mockApps.flatMap(a => a.sms).filter(s => s.flagged);
        expect(flagged.length).toBeGreaterThanOrEqual(5);
        flagged.forEach(s => expect(s.flagReason).toBeTruthy());
    });
    it('should have recorded calls', () => { expect(mockApps.flatMap(a => a.calls).filter(c => c.recorded).length).toBeGreaterThanOrEqual(3); });
    it('should have networkInfo on all apps', () => { mockApps.forEach(a => expect(Object.keys(a.networkInfo).length).toBeGreaterThan(0)); });
    it('stats should have correct shape', () => {
        mockApps.forEach(a => {
            expect(typeof a.stats.sms).toBe('number'); expect(typeof a.stats.calls).toBe('number');
            expect(typeof a.stats.contacts).toBe('number'); expect(typeof a.stats.photos).toBe('number');
            expect(a.stats.totalData).toBeTruthy();
        });
    });
    it('GPS tracker should have empty comms data', () => {
        const gps = mockApps.find(a => a.type === 'GPS Tracker');
        expect(gps).toBeTruthy();
        expect(gps!.sms.length).toBe(0); expect(gps!.calls.length).toBe(0); expect(gps!.contacts.length).toBe(0);
    });
});

describe('SurveillanceApps keyboardShortcuts', () => {
    it('should have at least 8', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(8); });
    it('should include Ctrl+Q, F, R, Esc, 1-5, 0', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['Ctrl+Q', 'F', 'R', 'Esc', '1', '2', '3', '0'].forEach(k => expect(keys).toContain(k));
    });
    it('all should have key and description', () => { keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); }); });
});
