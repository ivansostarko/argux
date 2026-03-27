/**
 * ARGUX — Role Management Mock Data
 * CRUD for roles with per-module permission matrix for admin and user accounts
 */

export type RoleScope = 'admin' | 'user';
export type PermAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'manage';

export interface ModuleDef {
    id: string; label: string; icon: string; section: string;
}

export interface RolePermission {
    moduleId: string; actions: PermAction[];
}

export interface Role {
    id: number; name: string; scope: RoleScope; color: string;
    description: string; level: number; isSystem: boolean;
    permissions: RolePermission[];
    userCount: number; createdAt: string; createdBy: string;
}

export const permActions: { id: PermAction; label: string; short: string }[] = [
    { id: 'view', label: 'View', short: 'V' },
    { id: 'create', label: 'Create', short: 'C' },
    { id: 'edit', label: 'Edit', short: 'E' },
    { id: 'delete', label: 'Delete', short: 'D' },
    { id: 'export', label: 'Export', short: 'X' },
    { id: 'manage', label: 'Manage', short: 'M' },
];

export const modules: ModuleDef[] = [
    // Command
    { id: 'map', label: 'Tactical Map', icon: '🗺️', section: 'Command' },
    { id: 'vision', label: 'Vision', icon: '📹', section: 'Command' },
    { id: 'operations', label: 'Operations', icon: '🎯', section: 'Command' },
    // Subjects
    { id: 'persons', label: 'Persons', icon: '👤', section: 'Subjects' },
    { id: 'organizations', label: 'Organizations', icon: '🏢', section: 'Subjects' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚗', section: 'Subjects' },
    { id: 'devices', label: 'Devices', icon: '📡', section: 'Subjects' },
    // Intelligence
    { id: 'plate_recognition', label: 'Plate Recognition', icon: '🔢', section: 'Intelligence' },
    { id: 'face_recognition', label: 'Face Recognition', icon: '🧑', section: 'Intelligence' },
    { id: 'scraper', label: 'Social Scraper', icon: '🔗', section: 'Intelligence' },
    { id: 'web_scraper', label: 'Web Scraper', icon: '🌐', section: 'Intelligence' },
    { id: 'surveillance_apps', label: 'Surveillance Apps', icon: '📱', section: 'Intelligence' },
    // Analysis
    { id: 'connections', label: 'Connections', icon: '🔗', section: 'Analysis' },
    { id: 'workflows', label: 'Workflows', icon: '📋', section: 'Analysis' },
    { id: 'data_sources', label: 'Data Sources', icon: '💾', section: 'Analysis' },
    // Monitoring
    { id: 'alerts', label: 'Alert Rules', icon: '🚨', section: 'Monitoring' },
    { id: 'activity', label: 'Activity Log', icon: '📊', section: 'Monitoring' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', section: 'Monitoring' },
    { id: 'risks', label: 'Risks', icon: '🛡️', section: 'Monitoring' },
    // Tools
    { id: 'ai_assistant', label: 'AI Assistant', icon: '🤖', section: 'Tools' },
    { id: 'records', label: 'Records', icon: '📄', section: 'Tools' },
    { id: 'storage', label: 'Storage', icon: '📁', section: 'Tools' },
    { id: 'reports', label: 'Reports', icon: '📊', section: 'Tools' },
    // System
    { id: 'jobs', label: 'Jobs', icon: '⚙️', section: 'System' },
    // Admin
    { id: 'admin_dashboard', label: 'Admin Dashboard', icon: '📊', section: 'Admin' },
    { id: 'admin_users', label: 'User Mgmt', icon: '👥', section: 'Admin' },
    { id: 'admin_admins', label: 'Admin Mgmt', icon: '🛡️', section: 'Admin' },
    { id: 'admin_roles', label: 'Role Mgmt', icon: '🔑', section: 'Admin' },
    { id: 'admin_config', label: 'Configuration', icon: '🔧', section: 'Admin' },
    { id: 'admin_audit', label: 'Audit Log', icon: '📋', section: 'Admin' },
    { id: 'admin_support', label: 'Support', icon: '🎫', section: 'Admin' },
    { id: 'admin_kb', label: 'Knowledge Base', icon: '📚', section: 'Admin' },
];

const allActions: PermAction[] = ['view', 'create', 'edit', 'delete', 'export', 'manage'];
const viewOnly: PermAction[] = ['view'];
const viewExport: PermAction[] = ['view', 'export'];
const viewCreateEdit: PermAction[] = ['view', 'create', 'edit'];
const fullExceptManage: PermAction[] = ['view', 'create', 'edit', 'delete', 'export'];
const allModulePerms = (actions: PermAction[]) => modules.map(m => ({ moduleId: m.id, actions }));

export const mockRoles: Role[] = [
    // Admin roles
    { id: 1, name: 'Super Admin', scope: 'admin', color: '#ef4444', description: 'Unrestricted access to all system modules, configuration, and user management. Reserved for primary system administrators.', level: 10, isSystem: true, permissions: allModulePerms(allActions), userCount: 2, createdAt: '2024-01-15', createdBy: 'System' },
    { id: 2, name: 'Admin', scope: 'admin', color: '#f97316', description: 'Full operator and admin panel access. Can manage users, configuration, and most system settings. Cannot manage other admin accounts.', level: 8, isSystem: true, permissions: modules.map(m => ({ moduleId: m.id, actions: m.id === 'admin_admins' ? viewOnly : allActions })), userCount: 4, createdAt: '2024-01-15', createdBy: 'System' },
    { id: 3, name: 'Security Officer', scope: 'admin', color: '#8b5cf6', description: 'Access to audit logs, security configuration, session management, and alert monitoring. Cannot modify user accounts.', level: 6, isSystem: true, permissions: modules.map(m => ({ moduleId: m.id, actions: ['admin_audit', 'admin_config', 'alerts', 'activity', 'risks'].includes(m.id) ? allActions : m.section === 'Admin' ? viewOnly : viewExport })), userCount: 2, createdAt: '2024-01-15', createdBy: 'System' },
    { id: 4, name: 'Audit Reader', scope: 'admin', color: '#3b82f6', description: 'Read-only access to audit logs and reports for compliance review purposes.', level: 3, isSystem: true, permissions: modules.map(m => ({ moduleId: m.id, actions: ['admin_audit', 'admin_dashboard', 'reports'].includes(m.id) ? viewExport : [] })), userCount: 2, createdAt: '2024-01-15', createdBy: 'System' },
    { id: 5, name: 'Support Agent', scope: 'admin', color: '#06b6d4', description: 'Access to support tickets and knowledge base management. Limited admin panel visibility.', level: 2, isSystem: true, permissions: modules.map(m => ({ moduleId: m.id, actions: ['admin_support', 'admin_kb'].includes(m.id) ? fullExceptManage : m.id === 'admin_dashboard' ? viewOnly : [] })), userCount: 2, createdAt: '2024-01-15', createdBy: 'System' },
    // User roles
    { id: 10, name: 'Senior Operator', scope: 'user', color: '#22c55e', description: 'Full access to all operational modules. Can create, edit, and export entities, run AI queries, and manage workflows.', level: 7, isSystem: true, permissions: modules.filter(m => m.section !== 'Admin').map(m => ({ moduleId: m.id, actions: allActions })), userCount: 4, createdAt: '2024-01-15', createdBy: 'System' },
    { id: 11, name: 'Intelligence Analyst', scope: 'user', color: '#8b5cf6', description: 'Access to intelligence modules, connections analysis, AI assistant, and reporting. Can create and edit entities but cannot delete.', level: 5, isSystem: false, permissions: modules.filter(m => m.section !== 'Admin').map(m => ({ moduleId: m.id, actions: ['persons', 'organizations', 'connections', 'face_recognition', 'scraper', 'web_scraper', 'ai_assistant', 'reports', 'records'].includes(m.id) ? fullExceptManage : viewExport })), userCount: 4, createdAt: '2024-03-20', createdBy: 'Col. Tomić' },
    { id: 12, name: 'Operator', scope: 'user', color: '#f59e0b', description: 'Standard operator access. Can view and create entries across most modules. Limited editing and no deletion.', level: 4, isSystem: true, permissions: modules.filter(m => m.section !== 'Admin').map(m => ({ moduleId: m.id, actions: ['map', 'vision', 'activity', 'notifications', 'alerts', 'storage'].includes(m.id) ? viewCreateEdit : viewOnly })), userCount: 5, createdAt: '2024-01-15', createdBy: 'System' },
    { id: 13, name: 'Viewer', scope: 'user', color: '#6b7280', description: 'Read-only access to operational data. For briefing preparation and oversight roles.', level: 2, isSystem: true, permissions: modules.filter(m => m.section !== 'Admin').map(m => ({ moduleId: m.id, actions: ['map', 'persons', 'organizations', 'vehicles', 'activity', 'reports'].includes(m.id) ? viewOnly : [] })), userCount: 1, createdAt: '2024-01-15', createdBy: 'System' },
    { id: 14, name: 'Trainee', scope: 'user', color: '#ec4899', description: 'Limited access for personnel in training program. Map, vision, and activity log only. No intelligence or entity creation.', level: 1, isSystem: false, permissions: modules.filter(m => m.section !== 'Admin').map(m => ({ moduleId: m.id, actions: ['map', 'vision', 'activity', 'notifications'].includes(m.id) ? viewOnly : [] })), userCount: 1, createdAt: '2026-01-15', createdBy: 'Maj. Novak' },
];

export const keyboardShortcuts = [
    { key: 'N', description: 'New role' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters' },
    { key: 'Esc', description: 'Close modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
