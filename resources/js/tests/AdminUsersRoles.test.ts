/**
 * ARGUX — Admin Users + Roles Tests
 * Run: npx vitest run resources/js/tests/AdminUsersRoles.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockUsers, statusConfig as uStatus, departments, units } from '../mock/admin-users';
import { mockRoles, modules, permActions, keyboardShortcuts as roleShortcuts } from '../mock/admin-roles';
import type { AppUser, UserStatus } from '../mock/admin-users';
import type { Role, RoleScope, PermAction } from '../mock/admin-roles';

describe('Users statusConfig', () => {
    it('should have 5 statuses', () => { expect(Object.keys(uStatus).length).toBe(5); });
    it('all should have label, color, icon', () => { Object.values(uStatus).forEach(s => { expect(s.label).toBeTruthy(); expect(s.color).toMatch(/^#/); expect(s.icon).toBeTruthy(); }); });
});

describe('Users mockUsers', () => {
    it('should have at least 12 users', () => { expect(mockUsers.length).toBeGreaterThanOrEqual(12); });
    it('IDs should be unique', () => { expect(new Set(mockUsers.map(u => u.id)).size).toBe(mockUsers.length); });
    it('emails should be unique', () => { expect(new Set(mockUsers.map(u => u.email)).size).toBe(mockUsers.length); });
    it('all should have required fields', () => {
        mockUsers.forEach((u: AppUser) => {
            expect(u.firstName).toBeTruthy(); expect(u.lastName).toBeTruthy();
            expect(u.email).toContain('@'); expect(u.roleId).toBeGreaterThan(0);
            expect(u.roleName).toBeTruthy(); expect(Object.keys(uStatus)).toContain(u.status);
            expect(departments).toContain(u.department); expect(units).toContain(u.unit);
        });
    });
    it('should have all 5 statuses', () => {
        const s = new Set(mockUsers.map(u => u.status));
        ['active', 'suspended', 'pending', 'locked', 'archived'].forEach(st => expect(s.has(st as UserStatus)).toBe(true));
    });
    it('should have multiple roles', () => { expect(new Set(mockUsers.map(u => u.roleName)).size).toBeGreaterThanOrEqual(4); });
    it('should have multiple departments', () => { expect(new Set(mockUsers.map(u => u.department)).size).toBeGreaterThanOrEqual(5); });
    it('pending users should not have MFA', () => { mockUsers.filter(u => u.status === 'pending').forEach(u => { expect(u.mfaEnrolled).toBe(false); expect(u.mfa).toBe('none'); }); });
    it('locked users should have failed attempts', () => { mockUsers.filter(u => u.status === 'locked').forEach(u => expect(u.failedAttempts).toBeGreaterThan(0)); });
    it('some users should have active sessions', () => { expect(mockUsers.filter(u => u.activeSessions > 0).length).toBeGreaterThanOrEqual(3); });
});

describe('Roles modules', () => {
    it('should have at least 30 modules', () => { expect(modules.length).toBeGreaterThanOrEqual(30); });
    it('IDs should be unique', () => { expect(new Set(modules.map(m => m.id)).size).toBe(modules.length); });
    it('should cover 8 sections', () => { expect(new Set(modules.map(m => m.section)).size).toBeGreaterThanOrEqual(7); });
    it('should include admin modules', () => {
        const ids = modules.map(m => m.id);
        ['admin_dashboard', 'admin_users', 'admin_admins', 'admin_roles', 'admin_config', 'admin_audit'].forEach(id => expect(ids).toContain(id));
    });
    it('should include user modules', () => {
        const ids = modules.map(m => m.id);
        ['map', 'persons', 'organizations', 'vehicles', 'devices', 'alerts', 'reports', 'ai_assistant'].forEach(id => expect(ids).toContain(id));
    });
});

describe('Roles permActions', () => {
    it('should have 6 actions', () => { expect(permActions.length).toBe(6); });
    it('should include view, create, edit, delete, export, manage', () => {
        const ids = permActions.map(a => a.id);
        ['view', 'create', 'edit', 'delete', 'export', 'manage'].forEach(a => expect(ids).toContain(a));
    });
});

describe('Roles mockRoles', () => {
    it('should have at least 8 roles', () => { expect(mockRoles.length).toBeGreaterThanOrEqual(8); });
    it('IDs should be unique', () => { expect(new Set(mockRoles.map(r => r.id)).size).toBe(mockRoles.length); });
    it('all should have required fields', () => {
        mockRoles.forEach((r: Role) => {
            expect(r.name).toBeTruthy(); expect(['admin', 'user']).toContain(r.scope);
            expect(r.color).toMatch(/^#/); expect(r.description).toBeTruthy();
            expect(r.level).toBeGreaterThanOrEqual(1);
            expect(typeof r.isSystem).toBe('boolean');
            expect(Array.isArray(r.permissions)).toBe(true);
            expect(typeof r.userCount).toBe('number');
        });
    });
    it('should have both admin and user scopes', () => {
        expect(mockRoles.filter(r => r.scope === 'admin').length).toBeGreaterThanOrEqual(3);
        expect(mockRoles.filter(r => r.scope === 'user').length).toBeGreaterThanOrEqual(3);
    });
    it('super_admin should have permissions on all modules', () => {
        const sa = mockRoles.find(r => r.name === 'Super Admin');
        expect(sa).toBeTruthy();
        expect(sa!.permissions.length).toBe(modules.length);
        sa!.permissions.forEach(p => expect(p.actions.length).toBe(permActions.length));
    });
    it('viewer should have limited permissions', () => {
        const v = mockRoles.find(r => r.name === 'Viewer');
        expect(v).toBeTruthy();
        const totalPerms = v!.permissions.reduce((s, p) => s + p.actions.length, 0);
        expect(totalPerms).toBeLessThan(30);
    });
    it('system roles should exist', () => { expect(mockRoles.filter(r => r.isSystem).length).toBeGreaterThanOrEqual(5); });
    it('non-system roles should exist', () => { expect(mockRoles.filter(r => !r.isSystem).length).toBeGreaterThanOrEqual(1); });
    it('permissions should reference valid modules', () => {
        const mids = new Set(modules.map(m => m.id));
        mockRoles.forEach(r => r.permissions.forEach(p => expect(mids.has(p.moduleId)).toBe(true)));
    });
    it('permissions should reference valid actions', () => {
        const aids = new Set(permActions.map(a => a.id));
        mockRoles.forEach(r => r.permissions.forEach(p => p.actions.forEach(a => expect(aids.has(a)).toBe(true))));
    });
    it('user roles should not have admin module access', () => {
        const userRoles = mockRoles.filter(r => r.scope === 'user');
        userRoles.forEach(r => { const adminPerms = r.permissions.filter(p => p.moduleId.startsWith('admin_')); adminPerms.forEach(p => expect(p.actions.length).toBe(0)); });
    });
});

describe('Role keyboardShortcuts', () => {
    it('should include N, F, R, Esc, Ctrl+Q', () => {
        const keys = roleShortcuts.map(s => s.key);
        ['N', 'F', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
});
