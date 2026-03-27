/**
 * ARGUX — Admin Audit Log Tests
 * Run: npx vitest run resources/js/tests/AdminAudit.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockAuditEntries, actionConfig, severityConfig, moduleConfig, users, ips, keyboardShortcuts } from '../mock/admin-audit';
import type { ActionType, Severity, Module, AuditEntry } from '../mock/admin-audit';

describe('Audit actionConfig', () => {
    it('should have 20 action types', () => { expect(Object.keys(actionConfig).length).toBe(20); });
    it('all should have label, icon, color', () => {
        Object.values(actionConfig).forEach(a => {
            expect(a.label).toBeTruthy(); expect(a.icon).toBeTruthy(); expect(a.color).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });
    it('should include core actions', () => {
        ['login', 'logout', 'view', 'create', 'update', 'delete', 'export', 'config', 'alert', 'failed_login'].forEach(a =>
            expect(actionConfig[a as ActionType]).toBeTruthy()
        );
    });
});

describe('Audit severityConfig', () => {
    it('should have 4 severities', () => { expect(Object.keys(severityConfig).length).toBe(4); });
    it('should include info, warning, critical, success', () => {
        ['info', 'warning', 'critical', 'success'].forEach(s => expect(severityConfig[s as Severity]).toBeTruthy());
    });
    it('all should have label and color', () => {
        Object.values(severityConfig).forEach(s => { expect(s.label).toBeTruthy(); expect(s.color).toMatch(/^#[0-9a-f]{6}$/i); });
    });
});

describe('Audit moduleConfig', () => {
    it('should have 20 modules', () => { expect(Object.keys(moduleConfig).length).toBe(20); });
    it('should include core modules', () => {
        ['auth', 'persons', 'organizations', 'map', 'operations', 'alerts', 'admin', 'config', 'system'].forEach(m =>
            expect(moduleConfig[m as Module]).toBeTruthy()
        );
    });
    it('all should have label and icon', () => {
        Object.values(moduleConfig).forEach(m => { expect(m.label).toBeTruthy(); expect(m.icon).toBeTruthy(); });
    });
});

describe('Audit users', () => {
    it('should have at least 8 users', () => { expect(users.length).toBeGreaterThanOrEqual(8); });
    it('all should have id, name, role', () => { users.forEach(u => { expect(typeof u.id).toBe('number'); expect(u.name).toBeTruthy(); expect(u.role).toBeTruthy(); }); });
    it('should include System user', () => { expect(users.some(u => u.name === 'System')).toBe(true); });
});

describe('Audit mockAuditEntries', () => {
    it('should have at least 25 entries', () => { expect(mockAuditEntries.length).toBeGreaterThanOrEqual(25); });
    it('IDs should be unique', () => { const ids = mockAuditEntries.map(e => e.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockAuditEntries.forEach((e: AuditEntry) => {
            expect(e.id).toBeTruthy(); expect(e.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}/);
            expect(e.user).toBeTruthy(); expect(e.userRole).toBeTruthy();
            expect(Object.keys(actionConfig)).toContain(e.action);
            expect(Object.keys(severityConfig)).toContain(e.severity);
            expect(Object.keys(moduleConfig)).toContain(e.module);
            expect(e.target).toBeTruthy(); expect(e.description).toBeTruthy();
            expect(e.ip).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
            expect(e.userAgent).toBeTruthy(); expect(e.sessionId).toBeTruthy();
            expect(e.integrityHash).toBeTruthy(); expect(e.previousHash).toBeTruthy();
        });
    });
    it('should have all 4 severities represented', () => {
        const sevs = new Set(mockAuditEntries.map(e => e.severity));
        ['info', 'warning', 'critical', 'success'].forEach(s => expect(sevs.has(s as Severity)).toBe(true));
    });
    it('should have at least 8 different action types', () => {
        const actions = new Set(mockAuditEntries.map(e => e.action));
        expect(actions.size).toBeGreaterThanOrEqual(8);
    });
    it('should have at least 6 different modules', () => {
        const modules = new Set(mockAuditEntries.map(e => e.module));
        expect(modules.size).toBeGreaterThanOrEqual(6);
    });
    it('should have at least 5 different users', () => {
        const userNames = new Set(mockAuditEntries.map(e => e.user));
        expect(userNames.size).toBeGreaterThanOrEqual(5);
    });
    it('should have varied IP addresses', () => {
        const ipSet = new Set(mockAuditEntries.map(e => e.ip));
        expect(ipSet.size).toBeGreaterThanOrEqual(5);
    });
    it('integrity hashes should form a chain', () => {
        for (let i = 1; i < mockAuditEntries.length; i++) {
            expect(mockAuditEntries[i].previousHash).toBe(mockAuditEntries[i - 1].integrityHash);
        }
    });
    it('should have entries with metadata', () => {
        const withMeta = mockAuditEntries.filter(e => e.metadata);
        expect(withMeta.length).toBeGreaterThanOrEqual(8);
    });
    it('should include critical security events', () => {
        const critical = mockAuditEntries.filter(e => e.severity === 'critical');
        expect(critical.length).toBeGreaterThanOrEqual(2);
        expect(critical.some(e => e.action === 'failed_login')).toBe(true);
    });
    it('should include automated system entries', () => {
        const sys = mockAuditEntries.filter(e => e.user === 'System');
        expect(sys.length).toBeGreaterThanOrEqual(4);
    });
    it('timestamps should be in descending order', () => {
        for (let i = 1; i < mockAuditEntries.length; i++) {
            expect(mockAuditEntries[i - 1].timestamp >= mockAuditEntries[i].timestamp).toBe(true);
        }
    });
    it('descriptions should be substantive (>30 chars)', () => {
        mockAuditEntries.forEach(e => expect(e.description.length).toBeGreaterThan(30));
    });
});

describe('Audit keyboardShortcuts', () => {
    it('should have at least 5', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(5); });
    it('should include F, R, ←, →, Esc, Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['F', 'R', '←', '→', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
});
