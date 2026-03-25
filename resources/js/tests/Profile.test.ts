/**
 * ARGUX — Profile Page Tests
 * Tests for mock data integrity, keyboard shortcuts, and data consistency
 *
 * Run: npx vitest run resources/js/tests/Profile.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
    mockUser, mockSessions, mockAuditLog, mockIpData,
    backupCodes, languages, dateFormats, timezones,
    actionColors, keyboardShortcuts,
} from '../mock/profile';
import type { Tab, AuditEntry, Session, IpData, Language } from '../mock/profile';

// ═══════════════════════════════════════════════════════════════
// Mock User Tests
// ═══════════════════════════════════════════════════════════════

describe('Profile mockUser', () => {
    it('should have all required fields', () => {
        expect(mockUser.firstName).toBeTruthy();
        expect(mockUser.lastName).toBeTruthy();
        expect(mockUser.email).toContain('@');
        expect(mockUser.phone).toBeTruthy();
        expect(mockUser.role).toBeTruthy();
        expect(mockUser.initials).toBe('JM');
    });

    it('initials should match first letters of name', () => {
        const expected = mockUser.firstName[0] + mockUser.lastName[0];
        expect(mockUser.initials).toBe(expected);
    });
});

// ═══════════════════════════════════════════════════════════════
// Sessions Tests
// ═══════════════════════════════════════════════════════════════

describe('Profile mockSessions', () => {
    it('should have at least 2 sessions', () => {
        expect(mockSessions.length).toBeGreaterThanOrEqual(2);
    });

    it('should have exactly one current session', () => {
        const current = mockSessions.filter(s => s.current);
        expect(current.length).toBe(1);
    });

    it('all sessions should have required fields', () => {
        mockSessions.forEach((s: Session) => {
            expect(s.id).toBeTruthy();
            expect(s.device).toBeTruthy();
            expect(s.browser).toBeTruthy();
            expect(s.ip).toBeTruthy();
            expect(s.location).toBeTruthy();
            expect(s.lastActive).toBeTruthy();
            expect(typeof s.current).toBe('boolean');
            expect(typeof s.trusted).toBe('boolean');
        });
    });

    it('session IDs should be unique', () => {
        const ids = mockSessions.map(s => s.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all session IPs should exist in mockIpData', () => {
        mockSessions.forEach(s => {
            expect(mockIpData[s.ip]).toBeDefined();
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Audit Log Tests
// ═══════════════════════════════════════════════════════════════

describe('Profile mockAuditLog', () => {
    it('should have at least 10 entries', () => {
        expect(mockAuditLog.length).toBeGreaterThanOrEqual(10);
    });

    it('all entries should have required fields', () => {
        mockAuditLog.forEach((e: AuditEntry) => {
            expect(e.id).toBeGreaterThan(0);
            expect(e.time).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
            expect(e.action).toBeTruthy();
            expect(e.details).toBeTruthy();
            expect(e.ip).toBeTruthy();
        });
    });

    it('entry IDs should be unique', () => {
        const ids = mockAuditLog.map(e => e.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('entries should be in reverse chronological order', () => {
        for (let i = 0; i < mockAuditLog.length - 1; i++) {
            expect(mockAuditLog[i].time >= mockAuditLog[i + 1].time).toBe(true);
        }
    });

    it('all actions should have a color defined', () => {
        const actions = new Set(mockAuditLog.map(e => e.action));
        actions.forEach(action => {
            expect(actionColors[action]).toBeDefined();
        });
    });

    it('all IPs should exist in mockIpData', () => {
        const ips = new Set(mockAuditLog.map(e => e.ip));
        ips.forEach(ip => {
            expect(mockIpData[ip]).toBeDefined();
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// IP Data Tests
// ═══════════════════════════════════════════════════════════════

describe('Profile mockIpData', () => {
    it('should have at least 3 IP entries', () => {
        expect(Object.keys(mockIpData).length).toBeGreaterThanOrEqual(3);
    });

    it('all entries should have required fields', () => {
        Object.values(mockIpData).forEach((d: IpData) => {
            expect(d.ip).toBeTruthy();
            expect(d.hostname).toBeTruthy();
            expect(d.city).toBeTruthy();
            expect(d.isp).toBeTruthy();
            expect(d.type).toBeTruthy();
        });
    });

    it('keys should match ip field values', () => {
        Object.entries(mockIpData).forEach(([key, data]) => {
            expect(key).toBe(data.ip);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Backup Codes Tests
// ═══════════════════════════════════════════════════════════════

describe('Profile backupCodes', () => {
    it('should have 8 codes', () => {
        expect(backupCodes.length).toBe(8);
    });

    it('all codes should match format XXXX-XXXX', () => {
        backupCodes.forEach(code => {
            expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
        });
    });

    it('all codes should be unique', () => {
        expect(new Set(backupCodes).size).toBe(backupCodes.length);
    });
});

// ═══════════════════════════════════════════════════════════════
// Languages Tests
// ═══════════════════════════════════════════════════════════════

describe('Profile languages', () => {
    it('should have at least 3 languages', () => {
        expect(languages.length).toBeGreaterThanOrEqual(3);
    });

    it('should include English and Croatian', () => {
        const ids = languages.map(l => l.id);
        expect(ids).toContain('en');
        expect(ids).toContain('hr');
    });

    it('all should have required fields', () => {
        languages.forEach((l: Language) => {
            expect(l.id).toBeTruthy();
            expect(l.label).toBeTruthy();
            expect(l.flag).toBeTruthy();
            expect(['ltr', 'rtl']).toContain(l.dir);
        });
    });

    it('Arabic should be RTL', () => {
        const ar = languages.find(l => l.id === 'ar');
        expect(ar?.dir).toBe('rtl');
    });
});

// ═══════════════════════════════════════════════════════════════
// Settings Tests
// ═══════════════════════════════════════════════════════════════

describe('Profile settings data', () => {
    it('should have at least 5 date formats', () => {
        expect(dateFormats.length).toBeGreaterThanOrEqual(5);
    });

    it('should include common date formats', () => {
        expect(dateFormats).toContain('YYYY-MM-DD');
        expect(dateFormats).toContain('DD/MM/YYYY');
    });

    it('should have at least 10 timezones', () => {
        expect(timezones.length).toBeGreaterThanOrEqual(10);
    });

    it('should include Zagreb timezone', () => {
        expect(timezones).toContain('Europe/Zagreb');
    });

    it('should include UTC', () => {
        expect(timezones).toContain('UTC');
    });
});

// ═══════════════════════════════════════════════════════════════
// Keyboard Shortcuts Tests
// ═══════════════════════════════════════════════════════════════

describe('Profile keyboardShortcuts', () => {
    it('should have at least 5 shortcuts', () => {
        expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(5);
    });

    it('should include tab shortcuts 1-5', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        expect(keys).toContain('1');
        expect(keys).toContain('2');
        expect(keys).toContain('3');
        expect(keys).toContain('4');
        expect(keys).toContain('5');
    });

    it('should include Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        expect(keys).toContain('Ctrl+Q');
    });

    it('all should have key and description', () => {
        keyboardShortcuts.forEach(s => {
            expect(s.key).toBeTruthy();
            expect(s.description).toBeTruthy();
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Tab Type Tests
// ═══════════════════════════════════════════════════════════════

describe('Profile Tab type', () => {
    it('should allow all 5 tab values', () => {
        const tabs: Tab[] = ['personal', 'password', 'security', 'settings', 'audit'];
        expect(tabs.length).toBe(5);
    });
});
