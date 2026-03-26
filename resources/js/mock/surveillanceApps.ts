/**
 * ARGUX — Surveillance Apps Mock Data
 * 6 deployed apps with SMS, calls, contacts, calendar, notifications, screenshots, photos, network, remote
 */
export type AppStatus = 'Active' | 'Stealth' | 'Paused' | 'Offline' | 'Compromised';
export type AppType = 'Full Monitor' | 'GPS Tracker' | 'Comms Intercept' | 'Stealth Suite';
export type DataTab = 'sms' | 'calls' | 'contacts' | 'calendar' | 'notifications' | 'network' | 'location' | 'screenshots' | 'photos' | 'remote';

export interface SMS { id: string; from: string; to: string; direction: 'in' | 'out'; body: string; timestamp: string; flagged: boolean; flagReason: string; }
export interface Call { id: string; number: string; name: string; direction: 'in' | 'out' | 'missed'; duration: string; timestamp: string; recorded: boolean; }
export interface Contact { id: string; name: string; phone: string; email: string; label: string; starred: boolean; }
export interface CalEvent { id: string; title: string; date: string; time: string; location: string; notes: string; }
export interface Notif { id: string; app: string; title: string; body: string; timestamp: string; }
export interface Screenshot { id: string; timestamp: string; app: string; size: string; }
export interface Photo { id: string; filename: string; timestamp: string; size: string; location: string; }

export interface DeployedApp {
    id: string; personId: number; personName: string; personAvatar: string;
    type: AppType; status: AppStatus; platform: 'Android' | 'iOS';
    deviceModel: string; osVersion: string; appVersion: string;
    imei: string; macAddress: string; phoneNumber: string;
    lastCheckIn: string; lastCheckInAgo: string;
    battery: number; signal: number; storage: number;
    lat: number; lng: number; locationName: string;
    operationCode: string; installedDate: string;
    stats: { sms: number; calls: number; contacts: number; photos: number; screenshots: number; totalData: string };
    sms: SMS[]; calls: Call[]; contacts: Contact[]; calendar: CalEvent[]; notifications: Notif[]; screenshots: Screenshot[]; photos: Photo[];
    networkInfo: Record<string, string>;
}

export const statusColors: Record<AppStatus, string> = { Active: '#22c55e', Stealth: '#8b5cf6', Paused: '#f59e0b', Offline: '#6b7280', Compromised: '#ef4444' };
export const statusIcons: Record<AppStatus, string> = { Active: '🟢', Stealth: '🕵️', Paused: '⏸️', Offline: '⚫', Compromised: '🔴' };
export const typeIcons: Record<AppType, string> = { 'Full Monitor': '📱', 'GPS Tracker': '📍', 'Comms Intercept': '📡', 'Stealth Suite': '🕵️' };
export const tabConfig: Record<DataTab, { icon: string; label: string }> = {
    sms: { icon: '💬', label: 'SMS' }, calls: { icon: '📞', label: 'Calls' }, contacts: { icon: '👥', label: 'Contacts' },
    calendar: { icon: '📅', label: 'Calendar' }, notifications: { icon: '🔔', label: 'Notifs' }, network: { icon: '📶', label: 'Network' },
    location: { icon: '📍', label: 'Location' }, screenshots: { icon: '📸', label: 'Screens' }, photos: { icon: '🖼️', label: 'Photos' }, remote: { icon: '🎮', label: 'Remote' },
};

export const remoteCommands = [
    { icon: '📍', label: 'Force GPS Update', desc: 'Get precise location now', color: '#22c55e' },
    { icon: '📷', label: 'Open Front Camera', desc: 'Capture silent photo', color: '#3b82f6' },
    { icon: '📹', label: 'Open Rear Camera', desc: '10s silent video', color: '#8b5cf6' },
    { icon: '🎙️', label: 'Open Microphone', desc: 'Record ambient audio 60s', color: '#f59e0b' },
    { icon: '📸', label: 'Take Screenshot', desc: 'Capture current screen', color: '#ec4899' },
    { icon: '📶', label: 'Network Scan', desc: 'Nearby WiFi + BT devices', color: '#06b6d4' },
    { icon: '📋', label: 'Clipboard Content', desc: 'Read clipboard text', color: '#10b981' },
    { icon: '🔔', label: 'Silent Ping', desc: 'Force check-in', color: '#6b7280' },
    { icon: '🔒', label: 'Lock Device', desc: 'Remote lock screen', color: '#ef4444' },
    { icon: '📡', label: 'Force Data Upload', desc: 'Upload all pending data', color: '#a855f7' },
];

export const mockApps: DeployedApp[] = [
    {
        id: 'app-01', personId: 1, personName: 'Marko Horvat', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'Full Monitor', status: 'Active', platform: 'Android', deviceModel: 'Samsung Galaxy S24 Ultra', osVersion: 'Android 15', appVersion: 'ARGUX Agent v3.2.1',
        imei: '353456789012345', macAddress: 'A4:C3:F0:12:34:56', phoneNumber: '+385 91 234 5678',
        lastCheckIn: '2026-03-24 10:13:45', lastCheckInAgo: '1m ago', battery: 72, signal: 88, storage: 45,
        lat: 45.813, lng: 15.977, locationName: 'Ilica 42, Zagreb', operationCode: 'HAWK', installedDate: '2026-02-15',
        stats: { sms: 342, calls: 189, contacts: 247, photos: 1245, screenshots: 89, totalData: '2.4 GB' },
        sms: [
            { id: 's1', from: '+385 91 234 5678', to: '+385 99 876 5432', direction: 'out', body: 'Sve spremno za četvrtak. Pristanište 7, 22h. Budi tamo.', timestamp: '2026-03-24 09:28', flagged: true, flagReason: 'CRITICAL: "četvrtak" (Thursday), "pristanište 7" (dock 7), "22h". Matches intercepted audio.' },
            { id: 's2', from: '+385 99 876 5432', to: '+385 91 234 5678', direction: 'in', body: 'Potvrđeno. Imam ključeve. Ruta B bez zaustavljanja.', timestamp: '2026-03-24 09:30', flagged: true, flagReason: 'CRITICAL: "Ruta B" (Route B) + "bez zaustavljanja" (no stops). Cross-ref Telegram.' },
            { id: 's3', from: '+385 91 234 5678', to: '+385 92 111 2222', direction: 'out', body: 'Vidimo se sutra na kavi. Esplanade u 10?', timestamp: '2026-03-24 08:15', flagged: false, flagReason: '' },
            { id: 's5', from: '+385 91 234 5678', to: '+57 310 555 0000', direction: 'out', body: 'Mendoza — paketi stigli. Sve čisto. Javi se večeras.', timestamp: '2026-03-23 22:45', flagged: true, flagReason: 'Cross-border to Mendoza. "paketi stigli" (packages arrived). Night 22:45.' },
        ],
        calls: [
            { id: 'c1', number: '+385 99 876 5432', name: 'Unknown (Babić burner?)', direction: 'out', duration: '4:12', timestamp: '2026-03-24 08:22', recorded: true },
            { id: 'c2', number: '+57 310 555 0000', name: 'Mendoza (Colombia)', direction: 'out', duration: '8:34', timestamp: '2026-03-23 22:30', recorded: true },
            { id: 'c3', number: '+385 1 234 5678', name: 'Alpha Security HQ', direction: 'in', duration: '2:15', timestamp: '2026-03-24 07:45', recorded: false },
            { id: 'c4', number: '+966 50 123 4567', name: 'Al-Rashid (Saudi)', direction: 'in', duration: '12:05', timestamp: '2026-03-23 18:00', recorded: true },
        ],
        contacts: [
            { id: 'ct1', name: 'Ivan B.', phone: '+385 99 876 5432', email: '', label: 'Work', starred: true },
            { id: 'ct2', name: 'Carlos M.', phone: '+57 310 555 0000', email: 'carlos@mie.co', label: 'Business', starred: true },
            { id: 'ct3', name: 'Ahmed R.', phone: '+966 50 123 4567', email: 'a.rashid@corp.sa', label: 'Business', starred: true },
            { id: 'ct4', name: 'ASG Office', phone: '+385 1 234 5678', email: 'info@alphasecgroup.hr', label: 'Work', starred: false },
            { id: 'ct5', name: 'Omar H.', phone: '+20 100 123 4567', email: '', label: 'Business', starred: true },
            { id: 'ct6', name: 'Mama', phone: '+385 91 555 1234', email: '', label: 'Family', starred: false },
        ],
        calendar: [
            { id: 'cal1', title: '🔴 Port Terminal — Dock 7', date: '2026-03-27', time: '22:00', location: 'Zagreb Port Terminal', notes: 'CRITICAL — matches operational intel' },
            { id: 'cal2', title: 'Board Meeting', date: '2026-03-25', time: '09:00', location: 'Alpha Security HQ', notes: '' },
            { id: 'cal4', title: 'Flight to Riyadh', date: '2026-03-28', time: '06:00', location: 'Zagreb Airport', notes: 'Business class. Return 03-30' },
        ],
        notifications: [
            { id: 'n1', app: 'Telegram', title: 'Carlos M.', body: 'New message in mendoza_group', timestamp: '2026-03-24 09:30' },
            { id: 'n2', app: 'Signal', title: 'Encrypted Chat', body: 'New message from +966...', timestamp: '2026-03-24 09:15' },
            { id: 'n5', app: 'Banking', title: 'PBZ Bank', body: 'Transfer received: €12,500.00', timestamp: '2026-03-23 22:00' },
        ],
        screenshots: [
            { id: 'ss1', timestamp: '2026-03-24 09:30', app: 'Telegram (mendoza_group)', size: '245 KB' },
            { id: 'ss2', timestamp: '2026-03-24 09:15', app: 'Signal (encrypted)', size: '198 KB' },
            { id: 'ss4', timestamp: '2026-03-23 22:00', app: 'Banking app (transfer)', size: '189 KB' },
        ],
        photos: [
            { id: 'ph1', filename: 'IMG_20260324_091500.jpg', timestamp: '2026-03-24 09:15', size: '4.2 MB', location: 'Port Terminal area' },
            { id: 'ph2', filename: 'IMG_20260323_224500.jpg', timestamp: '2026-03-23 22:45', size: '3.8 MB', location: 'Savska cesta' },
        ],
        networkInfo: { 'Carrier': 'T-Mobile HR', 'Network': 'LTE (4G)', 'Cell ID': 'LAC:4521 CID:12847', 'IP': '10.128.45.221', 'WiFi': 'ASG-SECURE-5G', 'VPN': 'None detected', 'Bluetooth': 'On — 3 paired' },
    },
    {
        id: 'app-02', personId: 9, personName: 'Carlos Mendoza', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'Stealth Suite', status: 'Stealth', platform: 'Android', deviceModel: 'Google Pixel 8 Pro', osVersion: 'Android 14', appVersion: 'ARGUX Agent v3.2.1',
        imei: '864512345678901', macAddress: 'B2:D4:E1:23:45:67', phoneNumber: '+57 310 555 0000',
        lastCheckIn: '2026-03-24 10:12:00', lastCheckInAgo: '2m ago', battery: 45, signal: 72, storage: 67,
        lat: 45.820, lng: 15.960, locationName: 'Maksimirska 128, Zagreb', operationCode: 'HAWK', installedDate: '2026-03-05',
        stats: { sms: 567, calls: 234, contacts: 189, photos: 890, screenshots: 156, totalData: '4.1 GB' },
        sms: [
            { id: 's7', from: '+57 310 555 0000', to: '+385 91 234 5678', direction: 'out', body: 'Potvrđeno. Imam ključeve. Ruta B bez zaustavljanja.', timestamp: '2026-03-24 09:30', flagged: true, flagReason: 'CRITICAL: Reply to Horvat. Route B confirmed.' },
            { id: 's8', from: '+57 310 555 0000', to: '+20 100 123 4567', direction: 'out', body: 'Hassan — storage unit ready. Thursday 16:00 as agreed.', timestamp: '2026-03-24 08:00', flagged: true, flagReason: 'Cross-ref Hassan storage pattern (48h intervals).' },
            { id: 's9', from: '+57 310 555 0000', to: '+57 311 222 3333', direction: 'out', body: 'Todo listo aquí. Confirma el envío desde Bogotá.', timestamp: '2026-03-23 23:45', flagged: true, flagReason: '"Everything ready here. Confirm shipment from Bogotá."' },
        ],
        calls: [
            { id: 'c7', number: '+385 91 234 5678', name: 'Horvat', direction: 'in', duration: '4:12', timestamp: '2026-03-24 08:22', recorded: true },
            { id: 'c8', number: '+20 100 123 4567', name: 'Hassan (Egypt)', direction: 'out', duration: '6:45', timestamp: '2026-03-24 07:00', recorded: true },
        ],
        contacts: [
            { id: 'ct9', name: 'Hawk', phone: '+385 91 234 5678', email: '', label: 'Work', starred: true },
            { id: 'ct10', name: 'Falcon', phone: '+20 100 123 4567', email: '', label: 'Work', starred: true },
            { id: 'ct12', name: 'Bogotá HQ', phone: '+57 311 222 3333', email: '', label: 'Business', starred: true },
        ],
        calendar: [{ id: 'cal5', title: 'Dock 7 — Final', date: '2026-03-27', time: '21:30', location: 'Port Terminal', notes: 'Arrive 30min early' }],
        notifications: [{ id: 'n6', app: 'Signal', title: 'New message', body: '2 encrypted messages', timestamp: '2026-03-24 09:30' }],
        screenshots: [{ id: 'ss5', timestamp: '2026-03-24 09:30', app: 'Signal (encrypted)', size: '210 KB' }],
        photos: [{ id: 'ph4', filename: 'IMG_20260323_2230.jpg', timestamp: '2026-03-23 22:30', size: '3.5 MB', location: 'Savska cesta' }],
        networkInfo: { 'Carrier': 'A1 HR (Roaming)', 'Network': '5G NR', 'IP': '10.45.78.99', 'WiFi': 'Hotel_Zagreb_5G', 'VPN': 'NordVPN (Panama)', 'SIM': 'Prepaid — NEW (24h)', 'IMSI': '21901***7733' },
    },
    {
        id: 'app-03', personId: 7, personName: 'Omar Hassan', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'Comms Intercept', status: 'Active', platform: 'iOS', deviceModel: 'iPhone 15 Pro Max', osVersion: 'iOS 18.3', appVersion: 'ARGUX Agent v3.1.8',
        imei: '352789012345678', macAddress: 'C6:E8:F2:34:56:78', phoneNumber: '+20 100 123 4567',
        lastCheckIn: '2026-03-24 10:10:00', lastCheckInAgo: '4m ago', battery: 34, signal: 65, storage: 78,
        lat: 45.805, lng: 15.968, locationName: 'Dubrava, Zagreb', operationCode: 'HAWK', installedDate: '2026-02-28',
        stats: { sms: 189, calls: 145, contacts: 312, photos: 456, screenshots: 23, totalData: '1.8 GB' },
        sms: [
            { id: 's10', from: '+57 310 555 0000', to: '+20 100 123 4567', direction: 'in', body: 'Hassan — storage unit ready. Thursday 16:00.', timestamp: '2026-03-24 08:00', flagged: true, flagReason: 'Inbound from Mendoza. Storage coordination.' },
            { id: 's11', from: '+20 100 123 4567', to: '+966 50 123 4567', direction: 'out', body: 'Sir, package logistics confirmed through Zagreb. ETA Thursday PM.', timestamp: '2026-03-24 08:30', flagged: true, flagReason: 'To Al-Rashid. Chain of command: Horvat→Mendoza→Hassan→Al-Rashid.' },
        ],
        calls: [{ id: 'c9', number: '+57 310 555 0000', name: 'Mendoza', direction: 'in', duration: '6:45', timestamp: '2026-03-24 07:00', recorded: true }],
        contacts: [{ id: 'ct13', name: 'Lobo', phone: '+57 310 555 0000', email: '', label: 'Business', starred: true }, { id: 'ct14', name: 'The Boss', phone: '+966 50 123 4567', email: '', label: 'VIP', starred: true }],
        calendar: [{ id: 'cal7', title: 'Storage B — Inspection', date: '2026-03-25', time: '16:00', location: 'Self-Storage Dubrava', notes: '' }],
        notifications: [{ id: 'n8', app: 'Signal', title: 'Encrypted', body: '3 new messages', timestamp: '2026-03-24 09:00' }],
        screenshots: [], photos: [],
        networkInfo: { 'Carrier': 'Hrvatski Telekom', 'Network': '4G LTE', 'IP': '10.200.12.88', 'WiFi': 'None (mobile)', 'VPN': 'None', 'SIM': 'Dual — EG+HR' },
    },
    {
        id: 'app-04', personId: 12, personName: 'Ivan Babić', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'GPS Tracker', status: 'Active', platform: 'Android', deviceModel: 'Samsung Galaxy A54', osVersion: 'Android 14', appVersion: 'ARGUX Tracker v2.4.0',
        imei: '356123456789012', macAddress: 'D8:F0:12:45:67:89', phoneNumber: '+385 99 876 5432',
        lastCheckIn: '2026-03-24 10:14:00', lastCheckInAgo: '<1m ago', battery: 89, signal: 95, storage: 23,
        lat: 45.802, lng: 15.995, locationName: 'Vukovarska cesta 58, Zagreb', operationCode: 'HAWK', installedDate: '2026-03-01',
        stats: { sms: 0, calls: 0, contacts: 0, photos: 0, screenshots: 0, totalData: '340 MB' },
        sms: [], calls: [], contacts: [], calendar: [], notifications: [], screenshots: [], photos: [],
        networkInfo: { 'Carrier': 'A1 HR', 'Network': '4G LTE', 'Cell ID': 'LAC:4890 CID:11234', 'IP': '10.55.33.44' },
    },
    {
        id: 'app-05', personId: 3, personName: 'Ahmed Al-Rashid', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'Full Monitor', status: 'Offline', platform: 'iOS', deviceModel: 'iPhone 16 Pro Max', osVersion: 'iOS 18.4', appVersion: 'ARGUX Agent v3.2.0',
        imei: '357456789012345', macAddress: 'E0:A2:B4:56:78:90', phoneNumber: '+966 50 123 4567',
        lastCheckIn: '2026-03-23 18:30:00', lastCheckInAgo: '16h ago', battery: 0, signal: 0, storage: 55,
        lat: 25.205, lng: 55.271, locationName: 'Rashid Holdings Tower, Dubai', operationCode: 'GLACIER', installedDate: '2026-01-20',
        stats: { sms: 89, calls: 67, contacts: 456, photos: 2345, screenshots: 34, totalData: '6.8 GB' },
        sms: [{ id: 's12', from: '+20 100 123 4567', to: '+966 50 123 4567', direction: 'in', body: 'Sir, package logistics confirmed through Zagreb. ETA Thursday PM.', timestamp: '2026-03-24 08:30', flagged: true, flagReason: 'Full chain: Horvat→Mendoza→Hassan→Al-Rashid. Thursday confirmed.' }],
        calls: [{ id: 'c10', number: '+385 91 234 5678', name: 'Horvat', direction: 'out', duration: '12:05', timestamp: '2026-03-23 18:00', recorded: true }],
        contacts: [], calendar: [], notifications: [], screenshots: [], photos: [],
        networkInfo: { 'Carrier': 'STC Saudi', 'Network': '5G', 'Last IP': '10.80.12.5', 'Status': 'OFFLINE — 16h', 'Cause': 'Phone off or Faraday cage' },
    },
    {
        id: 'app-06', personId: 4, personName: 'Elena Petrova', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'Comms Intercept', status: 'Paused', platform: 'Android', deviceModel: 'Xiaomi 14 Ultra', osVersion: 'Android 14', appVersion: 'ARGUX Agent v3.1.5',
        imei: '358234567890123', macAddress: 'F2:B4:C6:67:89:01', phoneNumber: '+7 916 123 4567',
        lastCheckIn: '2026-03-20 14:00:00', lastCheckInAgo: '4d ago', battery: 0, signal: 0, storage: 42,
        lat: 55.756, lng: 37.617, locationName: 'Moscow, Russia', operationCode: '', installedDate: '2026-02-10',
        stats: { sms: 45, calls: 23, contacts: 178, photos: 234, screenshots: 12, totalData: '890 MB' },
        sms: [], calls: [], contacts: [], calendar: [], notifications: [], screenshots: [], photos: [],
        networkInfo: { 'Carrier': 'MTS Russia', 'Network': 'Last: 4G LTE', 'Status': 'PAUSED — Legal review' },
    },
];

export const keyboardShortcuts = [
    { key: '1', description: 'SMS tab' }, { key: '2', description: 'Calls tab' }, { key: '3', description: 'Contacts tab' },
    { key: '4', description: 'Calendar tab' }, { key: '5', description: 'Network tab' }, { key: '0', description: 'Remote tab' },
    { key: 'F', description: 'Focus search' }, { key: 'R', description: 'Reset filters' },
    { key: 'Esc', description: 'Close / deselect' }, { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
