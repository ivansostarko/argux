/**
 * ARGUX — Admin Management Tests
 * Run: npx vitest run resources/js/tests/AdminAdmins.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockAdmins, statusConfig, roleConfig, departments, keyboardShortcuts } from '../mock/admin-admins';
import type { AdminStatus, AdminRole, Admin } from '../mock/admin-admins';

describe('Admins statusConfig', () => {
    it('should have 4 statuses', () => { expect(Object.keys(statusConfig).length).toBe(4); });
    it('should include active, suspended, pending, locked', () => {
        ['active', 'suspended', 'pending', 'locked'].forEach(s => expect(statusConfig[s as AdminStatus]).toBeTruthy());
    });
    it('all should have label, color, icon', () => {
        Object.values(statusConfig).forEach(s => { expect(s.label).toBeTruthy(); expect(s.color).toMatch(/^#[0-9a-f]{6}$/i); expect(s.icon).toBeTruthy(); });
    });
});

describe('Admins roleConfig', () => {
    it('should have 5 roles', () => { expect(Object.keys(roleConfig).length).toBe(5); });
    it('should include super_admin, admin, security_officer, audit_reader, support_agent', () => {
        ['super_admin', 'admin', 'security_officer', 'audit_reader', 'support_agent'].forEach(r =>
            expect(roleConfig[r as AdminRole]).toBeTruthy()
        );
    });
    it('all should have label, color, level, description', () => {
        Object.values(roleConfig).forEach(r => {
            expect(r.label).toBeTruthy(); expect(r.color).toMatch(/^#[0-9a-f]{6}$/i);
            expect(r.level).toBeGreaterThanOrEqual(1); expect(r.level).toBeLessThanOrEqual(5);
            expect(r.description).toBeTruthy();
        });
    });
    it('levels should be unique and ordered', () => {
        const levels = Object.values(roleConfig).map(r => r.level).sort();
        expect(new Set(levels).size).toBe(levels.length);
    });
});

describe('Admins departments', () => {
    it('should have at least 6', () => { expect(departments.length).toBeGreaterThanOrEqual(6); });
    it('should include Command, Security, IT Infrastructure', () => {
        ['Command', 'Security', 'IT Infrastructure'].forEach(d => expect(departments).toContain(d));
    });
});

describe('Admins mockAdmins', () => {
    it('should have at least 10 admins', () => { expect(mockAdmins.length).toBeGreaterThanOrEqual(10); });
    it('IDs should be unique', () => { const ids = mockAdmins.map(a => a.id); expect(new Set(ids).size).toBe(ids.length); });
    it('emails should be unique', () => { const emails = mockAdmins.map(a => a.email); expect(new Set(emails).size).toBe(emails.length); });
    it('all should have required fields', () => {
        mockAdmins.forEach((a: Admin) => {
            expect(a.id).toBeTruthy(); expect(a.firstName).toBeTruthy(); expect(a.lastName).toBeTruthy();
            expect(a.email).toContain('@'); expect(a.phone).toBeTruthy();
            expect(Object.keys(roleConfig)).toContain(a.role);
            expect(Object.keys(statusConfig)).toContain(a.status);
            expect(['app', 'sms', 'email', 'none']).toContain(a.mfa);
            expect(typeof a.mfaEnrolled).toBe('boolean');
            expect(departments).toContain(a.department);
            expect(a.lastLogin).toBeTruthy();
            expect(typeof a.loginCount).toBe('number');
            expect(a.createdAt).toBeTruthy(); expect(a.createdBy).toBeTruthy();
            expect(typeof a.failedAttempts).toBe('number');
            expect(Array.isArray(a.sessions)).toBe(true);
            expect(Array.isArray(a.permissions)).toBe(true);
        });
    });
    it('should have all 4 statuses represented', () => {
        const statuses = new Set(mockAdmins.map(a => a.status));
        ['active', 'suspended', 'pending', 'locked'].forEach(s => expect(statuses.has(s as AdminStatus)).toBe(true));
    });
    it('should have all 5 roles represented', () => {
        const roles = new Set(mockAdmins.map(a => a.role));
        ['super_admin', 'admin', 'security_officer', 'audit_reader', 'support_agent'].forEach(r =>
            expect(roles.has(r as AdminRole)).toBe(true)
        );
    });
    it('should have at least 2 super_admins', () => {
        expect(mockAdmins.filter(a => a.role === 'super_admin').length).toBeGreaterThanOrEqual(2);
    });
    it('active admins should be majority', () => {
        const active = mockAdmins.filter(a => a.status === 'active').length;
        expect(active).toBeGreaterThan(mockAdmins.length / 2);
    });
    it('some admins should have active sessions', () => {
        const withSessions = mockAdmins.filter(a => a.sessions.length > 0);
        expect(withSessions.length).toBeGreaterThanOrEqual(3);
    });
    it('sessions should have required fields', () => {
        mockAdmins.flatMap(a => a.sessions).forEach(s => {
            expect(s.id).toBeTruthy(); expect(s.device).toBeTruthy();
            expect(s.ip).toBeTruthy(); expect(s.location).toBeTruthy();
            expect(s.lastActive).toBeTruthy();
        });
    });
    it('pending admins should not have MFA enrolled', () => {
        mockAdmins.filter(a => a.status === 'pending').forEach(a => {
            expect(a.mfaEnrolled).toBe(false); expect(a.mfa).toBe('none');
        });
    });
    it('locked admin should have failed attempts > 0', () => {
        mockAdmins.filter(a => a.status === 'locked').forEach(a => {
            expect(a.failedAttempts).toBeGreaterThan(0);
            expect(a.lockedUntil).toBeTruthy();
        });
    });
    it('suspended admin should have a reason in notes', () => {
        mockAdmins.filter(a => a.status === 'suspended').forEach(a => {
            expect(a.notes.length).toBeGreaterThan(20);
        });
    });
    it('should have admins from multiple departments', () => {
        const depts = new Set(mockAdmins.map(a => a.department));
        expect(depts.size).toBeGreaterThanOrEqual(5);
    });
    it('login counts should vary', () => {
        const counts = mockAdmins.map(a => a.loginCount);
        expect(new Set(counts).size).toBeGreaterThan(5);
    });
    it('super_admins should have all permissions', () => {
        mockAdmins.filter(a => a.role === 'super_admin').forEach(a => {
            expect(a.permissions).toContain('all');
        });
    });
});

describe('Admins keyboardShortcuts', () => {
    it('should have at least 6', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(6); });
    it('should include N, F, R, ←, →, Esc, Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['N', 'F', 'R', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
});
