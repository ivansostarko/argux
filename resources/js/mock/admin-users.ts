/**
 * ARGUX — User Management Mock Data
 * CRUD for operator accounts (distinct from admin accounts)
 */

export type UserStatus = 'active' | 'suspended' | 'pending' | 'locked' | 'archived';
export type MfaMethod = 'app' | 'sms' | 'email' | 'none';

export interface AppUser {
    id: number; firstName: string; lastName: string; email: string;
    phone: string; avatar?: string; roleId: number; roleName: string;
    status: UserStatus; mfa: MfaMethod; mfaEnrolled: boolean;
    department: string; unit: string;
    lastLogin: string; lastIp: string; loginCount: number;
    createdAt: string; createdBy: string;
    failedAttempts: number; lockedUntil?: string;
    activeSessions: number; notes: string;
}

export const statusConfig: Record<UserStatus, { label: string; color: string; icon: string }> = {
    active:    { label: 'Active', color: '#22c55e', icon: '🟢' },
    suspended: { label: 'Suspended', color: '#f59e0b', icon: '🟡' },
    pending:   { label: 'Pending', color: '#3b82f6', icon: '🔵' },
    locked:    { label: 'Locked', color: '#ef4444', icon: '🔴' },
    archived:  { label: 'Archived', color: '#6b7280', icon: '⚫' },
};

export const departments = ['Intelligence', 'Operations', 'Analysis', 'Field Operations', 'Surveillance', 'IT Support', 'Training', 'Command', 'Security', 'Communications'];
export const units = ['Unit Alpha', 'Unit Bravo', 'Unit Charlie', 'Unit Delta', 'Unit Echo', 'HQ Staff', 'Mobile Team', 'Night Shift', 'Remote'];

export const mockUsers: AppUser[] = [
    { id: 101, firstName: 'Marko', lastName: 'Horvat', email: 'horvat.op@argux.mil', phone: '+385 91 200 0001', roleId: 2, roleName: 'Senior Operator', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Operations', unit: 'Unit Alpha', lastLogin: '2026-03-27 08:05', lastIp: '10.0.1.30', loginCount: 534, createdAt: '2024-06-15', createdBy: 'Col. Tomić', failedAttempts: 0, activeSessions: 1, notes: 'Team Alpha lead. Primary HAWK operator.' },
    { id: 102, firstName: 'Ana', lastName: 'Kovačević', email: 'kovacevic@argux.mil', phone: '+385 91 200 0002', roleId: 3, roleName: 'Intelligence Analyst', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Intelligence', unit: 'HQ Staff', lastLogin: '2026-03-27 08:45', lastIp: '10.0.1.15', loginCount: 412, createdAt: '2024-08-20', createdBy: 'Maj. Novak', failedAttempts: 0, activeSessions: 1, notes: 'Connections and network analysis specialist.' },
    { id: 103, firstName: 'Ivan', lastName: 'Babić', email: 'babic.op@argux.mil', phone: '+385 91 200 0003', roleId: 2, roleName: 'Senior Operator', status: 'active', mfa: 'sms', mfaEnrolled: true, department: 'Field Operations', unit: 'Mobile Team', lastLogin: '2026-03-27 07:30', lastIp: '10.0.4.22', loginCount: 287, createdAt: '2024-09-10', createdBy: 'Cpt. Horvat', failedAttempts: 0, activeSessions: 2, notes: 'Mobile field operator. Primarily map and tracking.' },
    { id: 104, firstName: 'Elena', lastName: 'Petrova', email: 'petrova@argux.mil', phone: '+385 91 200 0004', roleId: 4, roleName: 'Operator', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Surveillance', unit: 'Night Shift', lastLogin: '2026-03-27 06:00', lastIp: '10.0.2.14', loginCount: 198, createdAt: '2025-01-10', createdBy: 'Maj. Novak', failedAttempts: 0, activeSessions: 0, notes: 'Night shift camera monitoring and LPR operations.' },
    { id: 105, firstName: 'Josip', lastName: 'Zelić', email: 'zelic.op@argux.mil', phone: '+385 91 200 0005', roleId: 3, roleName: 'Intelligence Analyst', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Analysis', unit: 'HQ Staff', lastLogin: '2026-03-26 17:00', lastIp: '10.0.1.18', loginCount: 345, createdAt: '2024-07-01', createdBy: 'Col. Tomić', failedAttempts: 0, activeSessions: 0, notes: 'Workflow builder and data source integration specialist.' },
    { id: 106, firstName: 'Katarina', lastName: 'Šimunović', email: 'simunovic.op@argux.mil', phone: '+385 91 200 0006', roleId: 4, roleName: 'Operator', status: 'suspended', mfa: 'app', mfaEnrolled: true, department: 'Intelligence', unit: 'Unit Bravo', lastLogin: '2026-03-10 11:45', lastIp: '10.0.1.40', loginCount: 156, createdAt: '2024-11-20', createdBy: 'Maj. Novak', failedAttempts: 0, activeSessions: 0, notes: 'Suspended: Accessed records outside authorized scope. Under review.' },
    { id: 107, firstName: 'Damir', lastName: 'Kožul', email: 'kozul.op@argux.mil', phone: '+385 91 200 0007', roleId: 2, roleName: 'Senior Operator', status: 'locked', mfa: 'sms', mfaEnrolled: true, department: 'Operations', unit: 'Unit Charlie', lastLogin: '2026-03-27 03:15', lastIp: '192.168.50.12', loginCount: 220, createdAt: '2024-05-10', createdBy: 'Col. Tomić', failedAttempts: 5, lockedUntil: '2026-03-27 09:15', activeSessions: 0, notes: 'LOCKED: 5 failed attempts from unusual IP at 03:15.' },
    { id: 108, firstName: 'Nikola', lastName: 'Krajina', email: 'krajina.op@argux.mil', phone: '+385 91 200 0008', roleId: 5, roleName: 'Viewer', status: 'active', mfa: 'email', mfaEnrolled: true, department: 'Command', unit: 'HQ Staff', lastLogin: '2026-03-25 14:20', lastIp: '10.0.1.30', loginCount: 67, createdAt: '2025-04-01', createdBy: 'Col. Tomić', failedAttempts: 0, activeSessions: 0, notes: 'Read-only access for briefing preparation.' },
    { id: 109, firstName: 'Luka', lastName: 'Radić', email: 'radic.op@argux.mil', phone: '+385 91 200 0009', roleId: 4, roleName: 'Operator', status: 'pending', mfa: 'none', mfaEnrolled: false, department: 'Surveillance', unit: 'Unit Delta', lastLogin: 'Never', lastIp: '—', loginCount: 0, createdAt: '2026-03-26', createdBy: 'Maj. Novak', failedAttempts: 0, activeSessions: 0, notes: 'New hire. Pending MFA enrollment and orientation.' },
    { id: 110, firstName: 'Petra', lastName: 'Vuković', email: 'vukovic@argux.mil', phone: '+385 91 200 0010', roleId: 3, roleName: 'Intelligence Analyst', status: 'pending', mfa: 'none', mfaEnrolled: false, department: 'Intelligence', unit: 'Unit Echo', lastLogin: 'Never', lastIp: '—', loginCount: 0, createdAt: '2026-03-27', createdBy: 'Cpt. Horvat', failedAttempts: 0, activeSessions: 0, notes: 'Transfer from Zagreb PD. Awaiting security clearance.' },
    { id: 111, firstName: 'Tomislav', lastName: 'Marić', email: 'maric@argux.mil', phone: '+385 91 200 0011', roleId: 4, roleName: 'Operator', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Field Operations', unit: 'Mobile Team', lastLogin: '2026-03-27 07:00', lastIp: '10.0.4.30', loginCount: 178, createdAt: '2025-02-15', createdBy: 'Cpt. Horvat', failedAttempts: 0, activeSessions: 1, notes: 'Mobile team driver and GPS tracking operator.' },
    { id: 112, firstName: 'Maja', lastName: 'Perić', email: 'peric.op@argux.mil', phone: '+385 91 200 0012', roleId: 3, roleName: 'Intelligence Analyst', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Analysis', unit: 'HQ Staff', lastLogin: '2026-03-27 08:30', lastIp: '10.0.1.45', loginCount: 89, createdAt: '2025-11-01', createdBy: 'Maj. Novak', failedAttempts: 0, activeSessions: 1, notes: 'Recently promoted. Specializes in face recognition and LPR.' },
    { id: 113, firstName: 'Goran', lastName: 'Tadić', email: 'tadic@argux.mil', phone: '+385 91 200 0013', roleId: 4, roleName: 'Operator', status: 'archived', mfa: 'app', mfaEnrolled: true, department: 'Operations', unit: 'Unit Alpha', lastLogin: '2026-01-15 16:00', lastIp: '10.0.1.22', loginCount: 445, createdAt: '2024-02-01', createdBy: 'Col. Tomić', failedAttempts: 0, activeSessions: 0, notes: 'Archived: Transferred to partner agency. Access revoked 2026-01-20.' },
    { id: 114, firstName: 'Sandra', lastName: 'Ilić', email: 'ilic@argux.mil', phone: '+385 91 200 0014', roleId: 6, roleName: 'Trainee', status: 'active', mfa: 'email', mfaEnrolled: true, department: 'Training', unit: 'HQ Staff', lastLogin: '2026-03-26 09:00', lastIp: '10.0.1.50', loginCount: 34, createdAt: '2026-02-01', createdBy: 'Maj. Novak', failedAttempts: 0, activeSessions: 0, notes: 'Training program. Limited access until certification.' },
    { id: 115, firstName: 'Filip', lastName: 'Dragić', email: 'dragic@argux.mil', phone: '+385 91 200 0015', roleId: 2, roleName: 'Senior Operator', status: 'active', mfa: 'app', mfaEnrolled: true, department: 'Operations', unit: 'Unit Bravo', lastLogin: '2026-03-27 07:45', lastIp: '10.0.1.35', loginCount: 312, createdAt: '2024-08-01', createdBy: 'Col. Tomić', failedAttempts: 0, activeSessions: 1, notes: 'Team Bravo lead. Social media and web scraping operations.' },
];

export const keyboardShortcuts = [
    { key: 'N', description: 'New user' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters' },
    { key: '←', description: 'Previous page' },
    { key: '→', description: 'Next page' },
    { key: 'Esc', description: 'Close modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
