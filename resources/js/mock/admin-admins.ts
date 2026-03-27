/**
 * ARGUX — Admin Management Mock Data
 * CRUD for administrator accounts with roles, permissions, MFA, sessions
 */

export type AdminStatus = 'active' | 'suspended' | 'pending' | 'locked';
export type AdminRole = 'super_admin' | 'admin' | 'security_officer' | 'audit_reader' | 'support_agent';
export type MfaMethod = 'app' | 'sms' | 'email' | 'none';

export interface AdminSession {
    id: string; device: string; ip: string; location: string; lastActive: string; current?: boolean;
}

export interface Admin {
    id: number; firstName: string; lastName: string; email: string;
    phone: string; avatar?: string; role: AdminRole; status: AdminStatus;
    mfa: MfaMethod; mfaEnrolled: boolean; department: string;
    lastLogin: string; lastIp: string; loginCount: number;
    createdAt: string; createdBy: string;
    failedAttempts: number; lockedUntil?: string;
    sessions: AdminSession[];
    permissions: string[];
    notes: string;
}

export const statusConfig: Record<AdminStatus, { label: string; color: string; icon: string }> = {
    active:    { label: 'Active', color: '#22c55e', icon: '🟢' },
    suspended: { label: 'Suspended', color: '#f59e0b', icon: '🟡' },
    pending:   { label: 'Pending', color: '#3b82f6', icon: '🔵' },
    locked:    { label: 'Locked', color: '#ef4444', icon: '🔴' },
};

export const roleConfig: Record<AdminRole, { label: string; color: string; level: number; description: string }> = {
    super_admin:     { label: 'Super Admin', color: '#ef4444', level: 5, description: 'Full system access, user management, configuration' },
    admin:           { label: 'Admin', color: '#f97316', level: 4, description: 'User management, configuration, monitoring' },
    security_officer:{ label: 'Security Officer', color: '#8b5cf6', level: 3, description: 'Audit logs, security config, session management' },
    audit_reader:    { label: 'Audit Reader', color: '#3b82f6', level: 2, description: 'Read-only access to audit logs and reports' },
    support_agent:   { label: 'Support Agent', color: '#06b6d4', level: 1, description: 'Support tickets, knowledge base management' },
};

export const departments = ['Command', 'Intelligence', 'Operations', 'IT Infrastructure', 'Security', 'Training', 'Analysis', 'Field Operations'];

const av = (initials: string) => undefined; // No avatar URL — use initials

export const mockAdmins: Admin[] = [
    { id: 1, firstName: 'Dragan', lastName: 'Tomić', email: 'tomic@argux.mil', phone: '+385 91 100 0001', role: 'super_admin', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Command', lastLogin: '2026-03-27 09:32', lastIp: '10.0.1.10', loginCount: 847, createdAt: '2024-01-15', createdBy: 'System', failedAttempts: 0, notes: 'Primary system administrator. Original platform deployment lead.',
        sessions: [{ id: 'ss1', device: 'Chrome 124 / Windows 11', ip: '10.0.1.10', location: 'HQ — Room 201', lastActive: '2 min ago', current: true }, { id: 'ss2', device: 'ARGUX Mobile / iOS 18', ip: '10.0.4.50', location: 'Mobile VPN', lastActive: '15 min ago' }],
        permissions: ['all'] },
    { id: 2, firstName: 'Ivana', lastName: 'Novak', email: 'novak@argux.mil', phone: '+385 91 100 0002', role: 'admin', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Analysis', lastLogin: '2026-03-27 08:45', lastIp: '10.0.1.15', loginCount: 623, createdAt: '2024-03-20', createdBy: 'Dragan Tomić', failedAttempts: 0, notes: 'Analysis division lead. Manages operator accounts for intelligence team.',
        sessions: [{ id: 'ss3', device: 'Chrome 124 / macOS 15', ip: '10.0.1.15', location: 'HQ — Room 305', lastActive: '5 min ago', current: true }],
        permissions: ['users.read', 'users.write', 'config.read', 'config.write', 'audit.read', 'reports.read', 'reports.export'] },
    { id: 3, firstName: 'Petar', lastName: 'Matić', email: 'matic@argux.mil', phone: '+385 91 100 0003', role: 'admin', status: 'active', mfa: 'sms', mfaEnrolled: true, department: 'Field Operations', lastLogin: '2026-03-27 07:55', lastIp: '10.0.1.22', loginCount: 412, createdAt: '2024-06-10', createdBy: 'Dragan Tomić', failedAttempts: 0, notes: 'Field intelligence lead. Primarily manages device and data source access.',
        sessions: [{ id: 'ss4', device: 'Chrome 124 / Ubuntu 24', ip: '10.0.1.22', location: 'Field Office — Zagreb East', lastActive: '12 min ago', current: true }],
        permissions: ['users.read', 'users.write', 'devices.manage', 'datasources.manage', 'audit.read'] },
    { id: 4, firstName: 'Marina', lastName: 'Jurić', email: 'juric@argux.mil', phone: '+385 91 100 0004', role: 'security_officer', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Security', lastLogin: '2026-03-27 08:10', lastIp: '10.0.2.12', loginCount: 389, createdAt: '2024-08-01', createdBy: 'Dragan Tomić', failedAttempts: 0, notes: 'Chief security officer. Manages MFA policies, session auditing, and incident response.',
        sessions: [{ id: 'ss5', device: 'Firefox 125 / Fedora 41', ip: '10.0.2.12', location: 'Security Operations Center', lastActive: '8 min ago', current: true }],
        permissions: ['audit.read', 'audit.export', 'security.manage', 'sessions.manage', 'config.security'] },
    { id: 5, firstName: 'Luka', lastName: 'Babić', email: 'babic.admin@argux.mil', phone: '+385 91 100 0005', role: 'support_agent', status: 'active', mfa: 'email', mfaEnrolled: true, department: 'IT Infrastructure', lastLogin: '2026-03-26 16:30', lastIp: '10.0.2.5', loginCount: 178, createdAt: '2025-01-15', createdBy: 'Ivana Novak', failedAttempts: 0, notes: 'IT support team lead. Handles operator tickets and KB articles.',
        sessions: [],
        permissions: ['support.read', 'support.write', 'kb.read', 'kb.write', 'users.read'] },
    { id: 6, firstName: 'Nikola', lastName: 'Krajina', email: 'krajina@argux.mil', phone: '+385 91 100 0006', role: 'audit_reader', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Command', lastLogin: '2026-03-25 14:20', lastIp: '10.0.1.30', loginCount: 92, createdAt: '2025-04-01', createdBy: 'Dragan Tomić', failedAttempts: 0, notes: 'Compliance officer. Read-only audit access for internal review.',
        sessions: [],
        permissions: ['audit.read', 'audit.export', 'reports.read'] },
    { id: 7, firstName: 'Katarina', lastName: 'Šimunović', email: 'simunovic@argux.mil', phone: '+385 91 100 0007', role: 'admin', status: 'suspended', mfa: 'app', mfaEnrolled: true, department: 'Intelligence', lastLogin: '2026-03-10 11:45', lastIp: '10.0.1.40', loginCount: 234, createdAt: '2024-11-20', createdBy: 'Dragan Tomić', failedAttempts: 0, notes: 'Suspended pending security review. Accessed classified records outside authorized scope on 2026-03-10.',
        sessions: [],
        permissions: ['users.read', 'users.write', 'config.read'] },
    { id: 8, firstName: 'Marko', lastName: 'Vlahović', email: 'vlahovic@argux.mil', phone: '+385 91 100 0008', role: 'support_agent', status: 'pending', mfa: 'none', mfaEnrolled: false, department: 'Training', lastLogin: 'Never', lastIp: '—', loginCount: 0, createdAt: '2026-03-25', createdBy: 'Ivana Novak', failedAttempts: 0, notes: 'New training coordinator. Account pending MFA enrollment and security briefing.',
        sessions: [],
        permissions: ['support.read', 'support.write', 'kb.read', 'kb.write'] },
    { id: 9, firstName: 'Ana', lastName: 'Perić', email: 'peric.admin@argux.mil', phone: '+385 91 100 0009', role: 'audit_reader', status: 'pending', mfa: 'none', mfaEnrolled: false, department: 'Analysis', lastLogin: 'Never', lastIp: '—', loginCount: 0, createdAt: '2026-03-26', createdBy: 'Ivana Novak', failedAttempts: 0, notes: 'Recently transferred. Admin audit reader role pending approval from Col. Tomić.',
        sessions: [],
        permissions: ['audit.read'] },
    { id: 10, firstName: 'Damir', lastName: 'Kožul', email: 'kozul@argux.mil', phone: '+385 91 100 0010', role: 'admin', status: 'locked', mfa: 'sms', mfaEnrolled: true, department: 'Operations', lastLogin: '2026-03-27 03:15', lastIp: '192.168.50.12', loginCount: 301, createdAt: '2024-05-10', createdBy: 'Dragan Tomić', failedAttempts: 5, lockedUntil: '2026-03-27 09:15', notes: 'LOCKED: 5 failed login attempts from unusual IP (192.168.50.12) at 03:15. Auto-locked for 6 hours. Security team investigating.',
        sessions: [],
        permissions: ['users.read', 'users.write', 'config.read', 'config.write', 'audit.read'] },
    { id: 11, firstName: 'Josip', lastName: 'Zelić', email: 'zelic@argux.mil', phone: '+385 91 100 0011', role: 'security_officer', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Security', lastLogin: '2026-03-27 06:00', lastIp: '10.0.2.14', loginCount: 256, createdAt: '2024-09-15', createdBy: 'Dragan Tomić', failedAttempts: 0, notes: 'Night shift security. Monitors overnight alerts and automated system events.',
        sessions: [{ id: 'ss6', device: 'Chrome 124 / Windows 11', ip: '10.0.2.14', location: 'Security Operations Center', lastActive: '45 min ago' }],
        permissions: ['audit.read', 'security.manage', 'sessions.manage', 'alerts.manage'] },
    { id: 12, firstName: 'Helena', lastName: 'Radić', email: 'radic@argux.mil', phone: '+385 91 100 0012', role: 'super_admin', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'IT Infrastructure', lastLogin: '2026-03-26 22:15', lastIp: '10.0.2.5', loginCount: 534, createdAt: '2024-01-15', createdBy: 'System', failedAttempts: 0, notes: 'Secondary super admin. Infrastructure and database management. On-call rotation.',
        sessions: [],
        permissions: ['all'] },
];

export const keyboardShortcuts = [
    { key: 'N', description: 'New admin' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters' },
    { key: '←', description: 'Previous page' },
    { key: '→', description: 'Next page' },
    { key: 'Esc', description: 'Close modal / panel' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
