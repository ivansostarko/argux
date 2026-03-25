/**
 * ARGUX — Profile Page Mock Data
 * Sessions, audit log, IP data, backup codes, languages, settings
 */

export type Tab = 'personal' | 'password' | 'security' | 'settings' | 'audit';

export interface AuditEntry { id: number; time: string; action: string; details: string; ip: string; }
export interface Session { id: string; device: string; browser: string; ip: string; location: string; lastActive: string; current: boolean; trusted: boolean; }
export interface IpData { ip: string; hostname: string; city: string; region: string; country: string; loc: string; org: string; postal: string; timezone: string; asn: string; isp: string; type: string; }
export interface Language { id: string; label: string; flag: string; dir: 'ltr' | 'rtl'; }

export const mockUser = {
    firstName: 'James', lastName: 'Mitchell',
    email: 'j.mitchell@argux.mil', phone: '+385 91 234 5847',
    role: 'Senior Operator', department: 'Intelligence Analysis',
    initials: 'JM',
};

export const mockSessions: Session[] = [
    { id: 's1', device: 'MacBook Pro 16"', browser: 'Chrome 122.0', ip: '185.23.45.67', location: 'Zagreb, HR', lastActive: 'Now', current: true, trusted: true },
    { id: 's2', device: 'iPhone 15 Pro', browser: 'Safari 17.3', ip: '185.23.45.68', location: 'Zagreb, HR', lastActive: '12m ago', current: false, trusted: true },
    { id: 's3', device: 'Windows Desktop', browser: 'Firefox 124.0', ip: '91.207.12.34', location: 'Split, HR', lastActive: '2h ago', current: false, trusted: false },
    { id: 's4', device: 'iPad Air', browser: 'Safari 17.2', ip: '185.23.45.69', location: 'Zagreb, HR', lastActive: '1d ago', current: false, trusted: true },
];

export const mockAuditLog: AuditEntry[] = [
    { id: 1, time: '2026-03-20 15:02:14', action: 'Login', details: 'Successful authentication via 2FA (Authenticator App)', ip: '185.23.45.67' },
    { id: 2, time: '2026-03-20 14:58:02', action: 'Failed Login', details: 'Invalid password — attempt 1 of 5', ip: '91.207.12.34' },
    { id: 3, time: '2026-03-20 12:30:00', action: 'Profile Updated', details: 'Changed timezone from UTC to Europe/Zagreb', ip: '185.23.45.67' },
    { id: 4, time: '2026-03-20 10:15:33', action: 'Password Changed', details: 'Password updated, all other sessions revoked', ip: '185.23.45.67' },
    { id: 5, time: '2026-03-19 22:10:00', action: 'New Device Login', details: 'First login from Windows Desktop (Firefox 124.0)', ip: '91.207.12.34' },
    { id: 6, time: '2026-03-19 18:45:12', action: '2FA Method Changed', details: 'Switched from SMS to Authenticator App', ip: '185.23.45.67' },
    { id: 7, time: '2026-03-19 16:22:08', action: 'Session Revoked', details: 'Manually revoked session from Unknown Device', ip: '185.23.45.67' },
    { id: 8, time: '2026-03-19 09:00:44', action: 'Login', details: 'Successful authentication via 2FA (SMS)', ip: '185.23.45.68' },
    { id: 9, time: '2026-03-18 20:55:19', action: 'Backup Codes Generated', details: '8 new backup codes generated', ip: '185.23.45.67' },
    { id: 10, time: '2026-03-18 14:30:02', action: 'API Key Created', details: 'New read-only API key for dashboard', ip: '185.23.45.67' },
    { id: 11, time: '2026-03-18 11:12:55', action: 'Login', details: 'Successful authentication via 2FA (Auth App)', ip: '185.23.45.67' },
    { id: 12, time: '2026-03-17 23:48:30', action: 'Failed Login', details: 'Invalid 2FA code — attempt 2 of 3', ip: '185.23.45.67' },
    { id: 13, time: '2026-03-17 16:05:18', action: 'Device Trusted', details: 'Marked iPhone 15 Pro as trusted device', ip: '185.23.45.68' },
    { id: 14, time: '2026-03-17 09:30:00', action: 'Login', details: 'Successful authentication via 2FA (Auth App)', ip: '185.23.45.67' },
    { id: 15, time: '2026-03-16 22:15:44', action: 'Logout', details: 'Manual logout from all devices', ip: '185.23.45.67' },
    { id: 16, time: '2026-03-16 14:20:33', action: 'Profile Updated', details: 'Updated phone number', ip: '185.23.45.67' },
    { id: 17, time: '2026-03-16 08:00:12', action: 'Login', details: 'Successful auth via 2FA (Email)', ip: '185.23.45.68' },
    { id: 18, time: '2026-03-15 19:40:27', action: 'Suspicious Activity', details: 'Rapid location change: Zagreb → Split in 15min', ip: '91.207.12.34' },
    { id: 19, time: '2026-03-15 15:10:55', action: 'Role Updated', details: 'Promoted to Senior Operator by admin', ip: '10.0.1.1' },
    { id: 20, time: '2026-03-15 10:00:00', action: 'Login', details: 'Successful authentication via 2FA', ip: '185.23.45.67' },
];

export const mockIpData: Record<string, IpData> = {
    '185.23.45.67': { ip: '185.23.45.67', hostname: 'host-185-23-45-67.ht.hr', city: 'Zagreb', region: 'City of Zagreb', country: 'HR', loc: '45.8150,15.9819', org: 'AS34594 HT Croatian Telecom', postal: '10000', timezone: 'Europe/Zagreb', asn: 'AS34594', isp: 'Croatian Telecom d.d.', type: 'ISP' },
    '185.23.45.68': { ip: '185.23.45.68', hostname: 'mobile-185-23-45-68.ht.hr', city: 'Zagreb', region: 'City of Zagreb', country: 'HR', loc: '45.8131,15.9775', org: 'AS34594 HT Croatian Telecom', postal: '10000', timezone: 'Europe/Zagreb', asn: 'AS34594', isp: 'Croatian Telecom d.d.', type: 'Mobile' },
    '185.23.45.69': { ip: '185.23.45.69', hostname: 'wifi-185-23-45-69.ht.hr', city: 'Zagreb', region: 'City of Zagreb', country: 'HR', loc: '45.8142,15.9780', org: 'AS34594 HT Croatian Telecom', postal: '10000', timezone: 'Europe/Zagreb', asn: 'AS34594', isp: 'Croatian Telecom d.d.', type: 'ISP' },
    '91.207.12.34': { ip: '91.207.12.34', hostname: 'host-91-207-12-34.a1.hr', city: 'Split', region: 'Split-Dalmatia', country: 'HR', loc: '43.5081,16.4402', org: 'AS13046 A1 Hrvatska', postal: '21000', timezone: 'Europe/Zagreb', asn: 'AS13046', isp: 'A1 Hrvatska d.o.o.', type: 'ISP' },
    '10.0.1.1': { ip: '10.0.1.1', hostname: 'gateway.argux.internal', city: 'Internal', region: 'Private Network', country: '-', loc: '-', org: 'ARGUX Internal', postal: '-', timezone: '-', asn: 'Private', isp: 'ARGUX Infrastructure', type: 'Private' },
};

export const backupCodes = ['A4K2-M9X1', 'B7J3-P2W8', 'C1L5-N6Y4', 'D8R7-Q3V9', 'E5T2-S1Z6', 'F3U8-R4X2', 'G9W1-T7K5', 'H6Y4-V2M3'];

export const languages: Language[] = [
    { id: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
    { id: 'hr', label: 'Croatian', flag: '🇭🇷', dir: 'ltr' },
    { id: 'ru', label: 'Russian', flag: '🇷🇺', dir: 'ltr' },
    { id: 'zh', label: 'Chinese', flag: '🇨🇳', dir: 'ltr' },
    { id: 'ar', label: 'Arabic', flag: '🇸🇦', dir: 'rtl' },
];

export const dateFormats = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'DD.MM.YYYY', 'DD-MM-YYYY', 'YYYY/MM/DD', 'MMM DD, YYYY', 'DD MMM YYYY', 'MMMM DD, YYYY', 'DD MMMM YYYY'];

export const timezones = ['UTC', 'Europe/Zagreb', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Rome', 'Europe/Moscow', 'Asia/Dubai', 'Asia/Riyadh', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Singapore', 'Australia/Sydney', 'Pacific/Auckland', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo', 'Africa/Cairo', 'Africa/Johannesburg'];

export const actionColors: Record<string, string> = {
    'Login': '#10b981', 'Failed Login': '#f43f5e', 'Logout': '#8896ab',
    'Profile Updated': '#3b82f6', 'Password Changed': '#f59e0b',
    'New Device Login': '#06b6d4', '2FA Method Changed': '#3b82f6',
    'Session Revoked': '#f43f5e', 'Backup Codes Generated': '#f59e0b',
    'API Key Created': '#3b82f6', 'Device Trusted': '#10b981',
    'Suspicious Activity': '#f43f5e', 'Role Updated': '#f59e0b',
};

export const keyboardShortcuts = [
    { key: '1', description: 'Personal Data tab' },
    { key: '2', description: 'Password tab' },
    { key: '3', description: 'Security tab' },
    { key: '4', description: 'Settings tab' },
    { key: '5', description: 'Audit Logs tab' },
    { key: 'S', description: 'Save current form' },
    { key: 'Esc', description: 'Close modal / panel' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
