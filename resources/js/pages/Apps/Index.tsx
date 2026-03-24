import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Surveillance Apps  ·  Remote Device Monitor
   Deploy stealth agents to target phones · iOS/Android
   SMS, Calls, Contacts, Calendar, Camera, Mic, GPS, Screenshots
   ═══════════════════════════════════════════════════════════════ */

type AppStatus = 'Active' | 'Stealth' | 'Paused' | 'Offline' | 'Compromised';
type AppType = 'Full Monitor' | 'GPS Tracker' | 'Comms Intercept' | 'Stealth Suite';
type DataTab = 'sms' | 'calls' | 'contacts' | 'calendar' | 'notifications' | 'network' | 'location' | 'screenshots' | 'photos' | 'remote';

interface DeployedApp {
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

interface SMS { id: string; from: string; to: string; direction: 'in' | 'out'; body: string; timestamp: string; flagged: boolean; flagReason: string; }
interface Call { id: string; number: string; name: string; direction: 'in' | 'out' | 'missed'; duration: string; timestamp: string; recorded: boolean; }
interface Contact { id: string; name: string; phone: string; email: string; label: string; starred: boolean; }
interface CalEvent { id: string; title: string; date: string; time: string; location: string; notes: string; }
interface Notif { id: string; app: string; title: string; body: string; timestamp: string; }
interface Screenshot { id: string; timestamp: string; app: string; size: string; }
interface Photo { id: string; filename: string; timestamp: string; size: string; location: string; }

const statusColors: Record<AppStatus, string> = { Active: '#22c55e', Stealth: '#8b5cf6', Paused: '#f59e0b', Offline: '#6b7280', Compromised: '#ef4444' };
const statusIcons: Record<AppStatus, string> = { Active: '🟢', Stealth: '🕵️', Paused: '⏸️', Offline: '⚫', Compromised: '🔴' };
const typeIcons: Record<AppType, string> = { 'Full Monitor': '📱', 'GPS Tracker': '📍', 'Comms Intercept': '📡', 'Stealth Suite': '🕵️' };
const tabConfig: Record<DataTab, { icon: string; label: string }> = {
    sms: { icon: '💬', label: 'SMS' }, calls: { icon: '📞', label: 'Calls' }, contacts: { icon: '👥', label: 'Contacts' },
    calendar: { icon: '📅', label: 'Calendar' }, notifications: { icon: '🔔', label: 'Notifs' }, network: { icon: '📶', label: 'Network' },
    location: { icon: '📍', label: 'Location' }, screenshots: { icon: '📸', label: 'Screens' }, photos: { icon: '🖼️', label: 'Photos' }, remote: { icon: '🎮', label: 'Remote' },
};

// ═══ MOCK DEPLOYED APPS (6) ═══
const mockApps: DeployedApp[] = [
    {
        id: 'app-01', personId: 1, personName: 'Marko Horvat', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'Full Monitor', status: 'Active', platform: 'Android', deviceModel: 'Samsung Galaxy S24 Ultra', osVersion: 'Android 15', appVersion: 'ARGUX Agent v3.2.1',
        imei: '353456789012345', macAddress: 'A4:C3:F0:12:34:56', phoneNumber: '+385 91 234 5678',
        lastCheckIn: '2026-03-24 10:13:45', lastCheckInAgo: '1m ago', battery: 72, signal: 88, storage: 45,
        lat: 45.813, lng: 15.977, locationName: 'Ilica 42, Zagreb', operationCode: 'HAWK', installedDate: '2026-02-15',
        stats: { sms: 342, calls: 189, contacts: 247, photos: 1245, screenshots: 89, totalData: '2.4 GB' },
        sms: [
            { id: 's1', from: '+385 91 234 5678', to: '+385 99 876 5432', direction: 'out', body: 'Sve spremno za četvrtak. Pristanište 7, 22h. Budi tamo.', timestamp: '2026-03-24 09:28', flagged: true, flagReason: 'CRITICAL: Keywords "četvrtak" (Thursday), "pristanište 7" (dock 7), "22h". Matches intercepted audio and Telegram messages.' },
            { id: 's2', from: '+385 99 876 5432', to: '+385 91 234 5678', direction: 'in', body: 'Potvrđeno. Imam ključeve. Ruta B bez zaustavljanja.', timestamp: '2026-03-24 09:30', flagged: true, flagReason: 'CRITICAL: "Ruta B" (Route B) + "bez zaustavljanja" (no stops). Cross-ref Telegram sp-13.' },
            { id: 's3', from: '+385 91 234 5678', to: '+385 92 111 2222', direction: 'out', body: 'Vidimo se sutra na kavi. Esplanade u 10?', timestamp: '2026-03-24 08:15', flagged: false, flagReason: '' },
            { id: 's4', from: 'Alpha Security', to: '+385 91 234 5678', direction: 'in', body: 'Reminder: Board meeting Tuesday 09:00. Conference Room A.', timestamp: '2026-03-24 07:00', flagged: false, flagReason: '' },
            { id: 's5', from: '+385 91 234 5678', to: '+57 310 555 0000', direction: 'out', body: 'Mendoza — paketi stigli. Sve čisto. Javi se večeras.', timestamp: '2026-03-23 22:45', flagged: true, flagReason: 'Cross-border comms to Mendoza Colombian number. "paketi stigli" (packages arrived). Night activity 22:45.' },
            { id: 's6', from: '+385 91 234 5678', to: '+385 91 999 8888', direction: 'out', body: 'Moraš doći po auto sutra. Servis je gotov.', timestamp: '2026-03-23 16:30', flagged: false, flagReason: '' },
        ],
        calls: [
            { id: 'c1', number: '+385 99 876 5432', name: 'Unknown (Babić burner?)', direction: 'out', duration: '4:12', timestamp: '2026-03-24 08:22', recorded: true },
            { id: 'c2', number: '+57 310 555 0000', name: 'Mendoza (Colombia)', direction: 'out', duration: '8:34', timestamp: '2026-03-23 22:30', recorded: true },
            { id: 'c3', number: '+385 1 234 5678', name: 'Alpha Security HQ', direction: 'in', duration: '2:15', timestamp: '2026-03-24 07:45', recorded: false },
            { id: 'c4', number: '+966 50 123 4567', name: 'Al-Rashid (Saudi)', direction: 'in', duration: '12:05', timestamp: '2026-03-23 18:00', recorded: true },
            { id: 'c5', number: '+385 92 111 2222', name: 'Unknown Personal', direction: 'out', duration: '1:30', timestamp: '2026-03-24 08:20', recorded: false },
            { id: 'c6', number: '+385 99 876 5432', name: 'Unknown (Babić burner?)', direction: 'missed', duration: '—', timestamp: '2026-03-24 06:15', recorded: false },
        ],
        contacts: [
            { id: 'ct1', name: 'Ivan B.', phone: '+385 99 876 5432', email: '', label: 'Work', starred: true },
            { id: 'ct2', name: 'Carlos M.', phone: '+57 310 555 0000', email: 'carlos@mie.co', label: 'Business', starred: true },
            { id: 'ct3', name: 'Ahmed R.', phone: '+966 50 123 4567', email: 'a.rashid@corp.sa', label: 'Business', starred: true },
            { id: 'ct4', name: 'ASG Office', phone: '+385 1 234 5678', email: 'info@alphasecgroup.hr', label: 'Work', starred: false },
            { id: 'ct5', name: 'Omar H.', phone: '+20 100 123 4567', email: '', label: 'Business', starred: true },
            { id: 'ct6', name: 'Mama', phone: '+385 91 555 1234', email: '', label: 'Family', starred: false },
            { id: 'ct7', name: 'Auto Servis Krešo', phone: '+385 91 999 8888', email: '', label: 'Other', starred: false },
            { id: 'ct8', name: 'Odvjetnik Marić', phone: '+385 1 456 7890', email: 'maric@law.hr', label: 'Work', starred: false },
        ],
        calendar: [
            { id: 'cal1', title: '🔴 Port Terminal — Dock 7', date: '2026-03-27', time: '22:00', location: 'Zagreb Port Terminal', notes: 'CRITICAL — matches operational intel' },
            { id: 'cal2', title: 'Board Meeting', date: '2026-03-25', time: '09:00', location: 'Alpha Security HQ, Conf Room A', notes: '' },
            { id: 'cal3', title: 'Lunch w/ Ivan', date: '2026-03-25', time: '12:30', location: 'Vinodol Restaurant', notes: '' },
            { id: 'cal4', title: 'Flight to Riyadh', date: '2026-03-28', time: '06:00', location: 'Zagreb Airport', notes: 'Business class. Return 03-30' },
        ],
        notifications: [
            { id: 'n1', app: 'Telegram', title: 'Carlos M.', body: 'New message in mendoza_group', timestamp: '2026-03-24 09:30' },
            { id: 'n2', app: 'Signal', title: 'Encrypted Chat', body: 'New message from +966...', timestamp: '2026-03-24 09:15' },
            { id: 'n3', app: 'Gmail', title: 'Alpha Security', body: 'Invoice #2026-0342 approved', timestamp: '2026-03-24 08:00' },
            { id: 'n4', app: 'WhatsApp', title: 'Ivan B.', body: 'Sent a photo', timestamp: '2026-03-24 07:30' },
            { id: 'n5', app: 'Banking', title: 'PBZ Bank', body: 'Transfer received: €12,500.00', timestamp: '2026-03-23 22:00' },
        ],
        screenshots: [
            { id: 'ss1', timestamp: '2026-03-24 09:30', app: 'Telegram (mendoza_group)', size: '245 KB' },
            { id: 'ss2', timestamp: '2026-03-24 09:15', app: 'Signal (encrypted)', size: '198 KB' },
            { id: 'ss3', timestamp: '2026-03-24 08:00', app: 'Gmail (invoice)', size: '312 KB' },
            { id: 'ss4', timestamp: '2026-03-23 22:00', app: 'Banking app (transfer)', size: '189 KB' },
        ],
        photos: [
            { id: 'ph1', filename: 'IMG_20260324_091500.jpg', timestamp: '2026-03-24 09:15', size: '4.2 MB', location: 'Port Terminal area' },
            { id: 'ph2', filename: 'IMG_20260323_224500.jpg', timestamp: '2026-03-23 22:45', size: '3.8 MB', location: 'Savska cesta' },
            { id: 'ph3', filename: 'IMG_20260323_183000.jpg', timestamp: '2026-03-23 18:30', size: '5.1 MB', location: 'Zagreb center' },
        ],
        networkInfo: { 'Carrier': 'T-Mobile HR', 'Network': 'LTE (4G)', 'Cell ID': 'LAC:4521 CID:12847', 'IP Address': '10.128.45.221', 'WiFi SSID': 'ASG-SECURE-5G', 'WiFi BSSID': 'AA:BB:CC:DD:11:22', 'DNS': '1.1.1.1, 8.8.8.8', 'VPN': 'None detected', 'Bluetooth': 'On — 3 paired devices', 'NFC': 'Enabled', 'Airplane Mode': 'Off', 'Data Roaming': 'Off' },
    },
    {
        id: 'app-02', personId: 9, personName: 'Carlos Mendoza', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'Stealth Suite', status: 'Stealth', platform: 'Android', deviceModel: 'Google Pixel 8 Pro', osVersion: 'Android 14', appVersion: 'ARGUX Agent v3.2.1',
        imei: '864512345678901', macAddress: 'B2:D4:E1:23:45:67', phoneNumber: '+57 310 555 0000',
        lastCheckIn: '2026-03-24 10:12:00', lastCheckInAgo: '2m ago', battery: 45, signal: 72, storage: 67,
        lat: 45.820, lng: 15.960, locationName: 'Maksimirska 128, Zagreb', operationCode: 'HAWK', installedDate: '2026-03-05',
        stats: { sms: 567, calls: 234, contacts: 189, photos: 890, screenshots: 156, totalData: '4.1 GB' },
        sms: [
            { id: 's7', from: '+57 310 555 0000', to: '+385 91 234 5678', direction: 'out', body: 'Potvrđeno. Imam ključeve. Ruta B bez zaustavljanja.', timestamp: '2026-03-24 09:30', flagged: true, flagReason: 'CRITICAL: Reply to Horvat. Route B confirmed. Keys reference.' },
            { id: 's8', from: '+57 310 555 0000', to: '+20 100 123 4567', direction: 'out', body: 'Hassan — storage unit ready. Thursday 16:00 as agreed.', timestamp: '2026-03-24 08:00', flagged: true, flagReason: 'Cross-ref with Hassan storage visit pattern (48h intervals). Thursday coordination.' },
            { id: 's9', from: '+57 310 555 0000', to: '+57 311 222 3333', direction: 'out', body: 'Todo listo aquí. Confirma el envío desde Bogotá.', timestamp: '2026-03-23 23:45', flagged: true, flagReason: 'Spanish: "Everything ready here. Confirm shipment from Bogotá." International coordination.' },
        ],
        calls: [
            { id: 'c7', number: '+385 91 234 5678', name: 'Horvat', direction: 'in', duration: '4:12', timestamp: '2026-03-24 08:22', recorded: true },
            { id: 'c8', number: '+20 100 123 4567', name: 'Hassan (Egypt)', direction: 'out', duration: '6:45', timestamp: '2026-03-24 07:00', recorded: true },
        ],
        contacts: [
            { id: 'ct9', name: 'Hawk', phone: '+385 91 234 5678', email: '', label: 'Work', starred: true },
            { id: 'ct10', name: 'Falcon', phone: '+20 100 123 4567', email: '', label: 'Work', starred: true },
            { id: 'ct11', name: 'Shadow', phone: '+966 50 123 4567', email: '', label: 'Business', starred: true },
            { id: 'ct12', name: 'Bogotá HQ', phone: '+57 311 222 3333', email: '', label: 'Business', starred: true },
        ],
        calendar: [
            { id: 'cal5', title: 'Dock 7 — Final', date: '2026-03-27', time: '21:30', location: 'Port Terminal', notes: 'Arrive 30min early' },
            { id: 'cal6', title: 'Storage Unit B', date: '2026-03-25', time: '16:00', location: 'Self-Storage Dubrava', notes: 'Bring keys' },
        ],
        notifications: [
            { id: 'n6', app: 'Signal', title: 'New message', body: '2 new encrypted messages', timestamp: '2026-03-24 09:30' },
            { id: 'n7', app: 'Maps', title: 'Navigate', body: 'Route to Port Terminal (12 min)', timestamp: '2026-03-24 06:30' },
        ],
        screenshots: [{ id: 'ss5', timestamp: '2026-03-24 09:30', app: 'Signal (encrypted)', size: '210 KB' }],
        photos: [{ id: 'ph4', filename: 'IMG_20260323_2230.jpg', timestamp: '2026-03-23 22:30', size: '3.5 MB', location: 'Savska cesta' }],
        networkInfo: { 'Carrier': 'A1 HR (Roaming)', 'Network': '5G NR', 'Cell ID': 'LAC:5012 CID:34521', 'IP Address': '10.45.78.99', 'WiFi SSID': 'Hotel_Zagreb_5G', 'VPN': 'NordVPN (Panama)', 'Bluetooth': 'Off', 'NFC': 'Disabled', 'SIM': 'Prepaid — NEW (24h)', 'IMSI': '21901***7733' },
    },
    {
        id: 'app-03', personId: 7, personName: 'Omar Hassan', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'Comms Intercept', status: 'Active', platform: 'iOS', deviceModel: 'iPhone 15 Pro Max', osVersion: 'iOS 18.3', appVersion: 'ARGUX Agent v3.1.8',
        imei: '352789012345678', macAddress: 'C6:E8:F2:34:56:78', phoneNumber: '+20 100 123 4567',
        lastCheckIn: '2026-03-24 10:10:00', lastCheckInAgo: '4m ago', battery: 34, signal: 65, storage: 78,
        lat: 45.805, lng: 15.968, locationName: 'Dubrava, Zagreb', operationCode: 'HAWK', installedDate: '2026-02-28',
        stats: { sms: 189, calls: 145, contacts: 312, photos: 456, screenshots: 23, totalData: '1.8 GB' },
        sms: [
            { id: 's10', from: '+57 310 555 0000', to: '+20 100 123 4567', direction: 'in', body: 'Hassan — storage unit ready. Thursday 16:00 as agreed.', timestamp: '2026-03-24 08:00', flagged: true, flagReason: 'Inbound from Mendoza. Storage unit coordination. Thursday pattern.' },
            { id: 's11', from: '+20 100 123 4567', to: '+966 50 123 4567', direction: 'out', body: 'Sir, package logistics confirmed through Zagreb. ETA Thursday PM.', timestamp: '2026-03-24 08:30', flagged: true, flagReason: 'To Al-Rashid. "Package logistics" + "Zagreb" + "Thursday". Chain of command visible.' },
        ],
        calls: [{ id: 'c9', number: '+57 310 555 0000', name: 'Mendoza', direction: 'in', duration: '6:45', timestamp: '2026-03-24 07:00', recorded: true }],
        contacts: [
            { id: 'ct13', name: 'Lobo', phone: '+57 310 555 0000', email: '', label: 'Business', starred: true },
            { id: 'ct14', name: 'The Boss', phone: '+966 50 123 4567', email: '', label: 'VIP', starred: true },
        ],
        calendar: [{ id: 'cal7', title: 'Storage B — Inspection', date: '2026-03-25', time: '16:00', location: 'Self-Storage Dubrava', notes: '' }],
        notifications: [{ id: 'n8', app: 'Signal', title: 'Encrypted', body: '3 new messages', timestamp: '2026-03-24 09:00' }],
        screenshots: [], photos: [],
        networkInfo: { 'Carrier': 'Hrvatski Telekom', 'Network': '4G LTE', 'Cell ID': 'LAC:3210 CID:78654', 'IP Address': '10.200.12.88', 'WiFi SSID': 'None (mobile data)', 'VPN': 'None', 'Bluetooth': 'On', 'SIM': 'Dual SIM — EG primary + HR secondary' },
    },
    {
        id: 'app-04', personId: 12, personName: 'Ivan Babić', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'GPS Tracker', status: 'Active', platform: 'Android', deviceModel: 'Samsung Galaxy A54', osVersion: 'Android 14', appVersion: 'ARGUX Tracker v2.4.0',
        imei: '356123456789012', macAddress: 'D8:F0:12:45:67:89', phoneNumber: '+385 99 876 5432',
        lastCheckIn: '2026-03-24 10:14:00', lastCheckInAgo: '<1m ago', battery: 89, signal: 95, storage: 23,
        lat: 45.802, lng: 15.995, locationName: 'Vukovarska cesta 58, Zagreb', operationCode: 'HAWK', installedDate: '2026-03-01',
        stats: { sms: 0, calls: 0, contacts: 0, photos: 0, screenshots: 0, totalData: '340 MB' },
        sms: [], calls: [], contacts: [], calendar: [], notifications: [], screenshots: [], photos: [],
        networkInfo: { 'Carrier': 'A1 HR', 'Network': '4G LTE', 'Cell ID': 'LAC:4890 CID:11234', 'IP Address': '10.55.33.44' },
    },
    {
        id: 'app-05', personId: 3, personName: 'Ahmed Al-Rashid', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'Full Monitor', status: 'Offline', platform: 'iOS', deviceModel: 'iPhone 16 Pro Max', osVersion: 'iOS 18.4', appVersion: 'ARGUX Agent v3.2.0',
        imei: '357456789012345', macAddress: 'E0:A2:B4:56:78:90', phoneNumber: '+966 50 123 4567',
        lastCheckIn: '2026-03-23 18:30:00', lastCheckInAgo: '16h ago', battery: 0, signal: 0, storage: 55,
        lat: 25.205, lng: 55.271, locationName: 'Rashid Holdings Tower, Dubai', operationCode: 'GLACIER', installedDate: '2026-01-20',
        stats: { sms: 89, calls: 67, contacts: 456, photos: 2345, screenshots: 34, totalData: '6.8 GB' },
        sms: [{ id: 's12', from: '+20 100 123 4567', to: '+966 50 123 4567', direction: 'in', body: 'Sir, package logistics confirmed through Zagreb. ETA Thursday PM.', timestamp: '2026-03-24 08:30', flagged: true, flagReason: 'From Hassan. Full chain: Horvat→Mendoza→Hassan→Al-Rashid. Thursday delivery confirmed.' }],
        calls: [{ id: 'c10', number: '+385 91 234 5678', name: 'Horvat', direction: 'out', duration: '12:05', timestamp: '2026-03-23 18:00', recorded: true }],
        contacts: [], calendar: [], notifications: [], screenshots: [], photos: [],
        networkInfo: { 'Carrier': 'STC Saudi', 'Network': '5G', 'Last Known IP': '10.80.12.5', 'Status': 'OFFLINE — 16h', 'Possible Cause': 'Phone powered off or Faraday cage' },
    },
    {
        id: 'app-06', personId: 4, personName: 'Elena Petrova', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg',
        type: 'Comms Intercept', status: 'Paused', platform: 'Android', deviceModel: 'Xiaomi 14 Ultra', osVersion: 'Android 14', appVersion: 'ARGUX Agent v3.1.5',
        imei: '358234567890123', macAddress: 'F2:B4:C6:67:89:01', phoneNumber: '+7 916 123 4567',
        lastCheckIn: '2026-03-20 14:00:00', lastCheckInAgo: '4d ago', battery: 0, signal: 0, storage: 42,
        lat: 55.756, lng: 37.617, locationName: 'Moscow, Russia', operationCode: '', installedDate: '2026-02-10',
        stats: { sms: 45, calls: 23, contacts: 178, photos: 234, screenshots: 12, totalData: '890 MB' },
        sms: [], calls: [], contacts: [], calendar: [], notifications: [], screenshots: [], photos: [],
        networkInfo: { 'Carrier': 'MTS Russia', 'Network': 'Last: 4G LTE', 'Status': 'PAUSED — Legal review pending' },
    },
];

type ViewMode = 'list' | 'detail';

function AppsIndex() {
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState<AppStatus | 'all'>('all');
    const [platformF, setPlatformF] = useState<'Android' | 'iOS' | 'all'>('all');
    const [selApp, setSelApp] = useState<string | null>(null);
    const [dataTab, setDataTab] = useState<DataTab>('sms');

    const app = selApp ? mockApps.find(a => a.id === selApp) : null;

    const filtered = useMemo(() => mockApps.filter(a => {
        if (statusF !== 'all' && a.status !== statusF) return false;
        if (platformF !== 'all' && a.platform !== platformF) return false;
        if (search && !a.personName.toLowerCase().includes(search.toLowerCase()) && !a.deviceModel.toLowerCase().includes(search.toLowerCase()) && !a.imei.includes(search)) return false;
        return true;
    }), [statusF, platformF, search]);

    const stats = { total: mockApps.length, active: mockApps.filter(a => a.status === 'Active' || a.status === 'Stealth').length, offline: mockApps.filter(a => a.status === 'Offline' || a.status === 'Paused').length, totalData: '16.2 GB' };

    return (<>
        <PageMeta title="Surveillance Apps" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* LEFT */}
            <div style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#a855f710', border: '1px solid #a855f725', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📱</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>APPS</div><div style={{ fontSize: 7, color: theme.textDim }}>Surveillance Agents</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 3 }}>
                    {[{ n: stats.total, l: 'Deploy', c: theme.accent }, { n: stats.active, l: 'Live', c: '#22c55e' }, { n: stats.offline, l: 'Down', c: '#6b7280' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '3px 0' }}><div style={{ fontSize: 14, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Status + Platform */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Status</div>
                    {(['all', 'Active', 'Stealth', 'Paused', 'Offline'] as const).map(s => { const c = s === 'all' ? mockApps.length : mockApps.filter(a => a.status === s).length; if (c === 0 && s !== 'all') return null; return <button key={s} onClick={() => setStatusF(s as any)} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: statusF === s ? `${s === 'all' ? theme.accent : statusColors[s as AppStatus]}08` : 'transparent', color: statusF === s ? (s === 'all' ? theme.accent : statusColors[s as AppStatus]) : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${statusF === s ? (s === 'all' ? theme.accent : statusColors[s as AppStatus]) : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}>{s === 'all' ? '📋' : statusIcons[s as AppStatus]} <span style={{ flex: 1 }}>{s === 'all' ? 'All' : s}</span><span style={{ fontSize: 7, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 4 }}>Platform</div>
                    <div style={{ display: 'flex', gap: 2 }}>{(['all', 'Android', 'iOS'] as const).map(p => <button key={p} onClick={() => setPlatformF(p as any)} style={{ flex: 1, padding: '3px', borderRadius: 3, border: `1px solid ${platformF === p ? theme.accent + '40' : theme.border}`, background: platformF === p ? `${theme.accent}08` : 'transparent', color: platformF === p ? theme.accent : theme.textDim, fontSize: 8, cursor: 'pointer', fontFamily: 'inherit' }}>{p === 'Android' ? '🤖' : p === 'iOS' ? '🍎' : ''} {p}</button>)}</div>
                </div>

                {/* Deployed app list */}
                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', padding: '4px 0' }}>
                    {filtered.map(a => {
                        const sel = selApp === a.id; const sc = statusColors[a.status];
                        return <div key={a.id} onClick={() => { setSelApp(a.id); setDataTab('sms'); }} style={{ padding: '8px 12px', cursor: 'pointer', borderLeft: `3px solid ${sel ? sc : 'transparent'}`, background: sel ? `${sc}06` : 'transparent', transition: 'all 0.1s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <img src={a.personAvatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${sc}40` }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{a.personName}</div>
                                    <div style={{ fontSize: 7, color: theme.textDim }}>{a.deviceModel.split(' ').slice(0, 2).join(' ')} · {a.platform}</div>
                                </div>
                                <div style={{ textAlign: 'right' as const }}>
                                    <div style={{ fontSize: 7, fontWeight: 700, color: sc }}>{statusIcons[a.status]}</div>
                                    <div style={{ fontSize: 6, color: theme.textDim }}>{a.lastCheckInAgo}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, marginTop: 4, fontSize: 7, color: theme.textDim }}>
                                <span>🔋{a.battery}%</span><span>📶{a.signal}%</span><span>💬{a.stats.sms}</span><span>📞{a.stats.calls}</span>
                            </div>
                        </div>;
                    })}
                </div>

                <div style={{ padding: '8px 12px', borderTop: `1px solid ${theme.border}` }}>
                    {[{ l: '🧑 Persons', h: '/persons' }, { l: '📡 Devices', h: '/devices' }, { l: '🗺️ Map', h: '/map' }, { l: '🚨 Alerts', h: '/alerts' }].map(lk => <a key={lk.h} href={lk.h} style={{ display: 'block', fontSize: 8, color: theme.textDim, textDecoration: 'none', padding: '2px 0' }}>{lk.l}</a>)}
                </div>
            </div>

            {/* CENTER + RIGHT: App Detail */}
            {!app && <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim }}><div style={{ textAlign: 'center' as const }}><div style={{ fontSize: 40, opacity: 0.2, marginBottom: 8 }}>📱</div><div style={{ fontSize: 14, fontWeight: 700, color: theme.textSecondary }}>Select a deployed app</div><div style={{ fontSize: 10, color: theme.textDim, marginTop: 4 }}>Choose a target device from the sidebar</div></div></div>}

            {app && <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                {/* Device header */}
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap' as const }}>
                    <img src={app.personAvatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${statusColors[app.status]}50` }} />
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>{app.personName} <span style={{ fontSize: 9, color: statusColors[app.status], fontWeight: 600 }}>{statusIcons[app.status]} {app.status}</span></div>
                        <div style={{ fontSize: 8, color: theme.textDim }}>{app.deviceModel} · {app.platform} {app.osVersion} · {app.appVersion}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        {[{ l: 'IMEI', v: app.imei }, { l: 'MAC', v: app.macAddress }, { l: 'Phone', v: app.phoneNumber }].map(i => <div key={i.l} style={{ textAlign: 'right' as const }}><div style={{ fontSize: 6, color: theme.textDim }}>{i.l}</div><div style={{ fontSize: 8, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{i.v}</div></div>)}
                    </div>
                </div>

                {/* Stats bar */}
                <div style={{ padding: '6px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 6, flexShrink: 0 }}>
                    {[{ n: app.stats.sms, l: '💬 SMS' }, { n: app.stats.calls, l: '📞 Calls' }, { n: app.stats.contacts, l: '👥 Contacts' }, { n: app.stats.photos, l: '🖼️ Photos' }, { n: app.stats.screenshots, l: '📸 Screens' }].map(s => <div key={s.l} style={{ textAlign: 'center' as const, flex: 1 }}><div style={{ fontSize: 13, fontWeight: 800, color: theme.accent, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                    <div style={{ textAlign: 'center' as const, flex: 1 }}><div style={{ fontSize: 13, fontWeight: 800, color: app.battery > 30 ? '#22c55e' : '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>{app.battery}%</div><div style={{ fontSize: 6, color: theme.textDim }}>🔋 Battery</div></div>
                    <div style={{ textAlign: 'center' as const, flex: 1 }}><div style={{ fontSize: 13, fontWeight: 800, color: app.signal > 50 ? '#22c55e' : '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{app.signal}%</div><div style={{ fontSize: 6, color: theme.textDim }}>📶 Signal</div></div>
                </div>

                {/* Data tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {(Object.keys(tabConfig) as DataTab[]).map(t => { const tc = tabConfig[t]; return <button key={t} onClick={() => setDataTab(t)} style={{ padding: '7px 10px', border: 'none', borderBottom: `2px solid ${dataTab === t ? '#a855f7' : 'transparent'}`, background: 'transparent', color: dataTab === t ? theme.text : theme.textDim, fontSize: 9, fontWeight: dataTab === t ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>{tc.icon} {tc.label}</button>; })}
                </div>

                {/* Data content */}
                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {/* SMS */}
                    {dataTab === 'sms' && <div>
                        {app.sms.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim, fontSize: 10 }}>No SMS data (GPS tracker only)</div>}
                        {app.sms.map(s => <div key={s.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}06`, background: s.flagged ? '#ef444406' : 'transparent', borderLeft: `3px solid ${s.flagged ? '#ef4444' : 'transparent'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                                <span style={{ fontSize: 10 }}>{s.direction === 'out' ? '📤' : '📥'}</span>
                                <span style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{s.direction === 'out' ? s.to : s.from}</span>
                                <span style={{ fontSize: 7, color: theme.textDim }}>{s.direction === 'out' ? 'Sent' : 'Received'}</span>
                                {s.flagged && <span style={{ fontSize: 6, fontWeight: 800, padding: '1px 4px', borderRadius: 2, background: '#ef444420', color: '#ef4444', marginLeft: 'auto' }}>🚩 FLAGGED</span>}
                                <span style={{ fontSize: 7, color: theme.textDim, marginLeft: s.flagged ? 0 : 'auto' }}>{s.timestamp.slice(5)}</span>
                            </div>
                            <div style={{ fontSize: 10, color: theme.text, lineHeight: 1.5, padding: '4px 0 4px 18px' }}>{s.body}</div>
                            {s.flagged && <div style={{ fontSize: 8, color: '#ef4444', lineHeight: 1.4, padding: '4px 8px', marginLeft: 18, borderRadius: 4, background: '#ef444408', border: '1px solid #ef444415' }}>🚩 {s.flagReason}</div>}
                        </div>)}
                    </div>}

                    {/* Calls */}
                    {dataTab === 'calls' && <div>
                        {app.calls.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim, fontSize: 10 }}>No call data</div>}
                        {app.calls.map(c => <div key={c.id} style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 14 }}>{c.direction === 'out' ? '📞' : c.direction === 'missed' ? '📵' : '📲'}</span>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, color: c.direction === 'missed' ? '#ef4444' : theme.text }}>{c.name}</div><div style={{ fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{c.number}</div></div>
                            <div style={{ textAlign: 'right' as const }}>
                                <div style={{ fontSize: 9, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{c.duration}</div>
                                <div style={{ fontSize: 7, color: theme.textDim }}>{c.timestamp.slice(5)}</div>
                            </div>
                            {c.recorded && <span style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: '#ef444412', color: '#ef4444', fontWeight: 700 }}>🎙️ REC</span>}
                        </div>)}
                    </div>}

                    {/* Contacts */}
                    {dataTab === 'contacts' && <div>
                        {app.contacts.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim, fontSize: 10 }}>No contacts data</div>}
                        {app.contacts.map(c => <div key={c.id} style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${theme.accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: theme.accent, fontWeight: 800 }}>{c.name.charAt(0)}</div>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{c.name} {c.starred && '⭐'}</div><div style={{ fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{c.phone}</div>{c.email && <div style={{ fontSize: 7, color: theme.textDim }}>{c.email}</div>}</div>
                            <span style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${theme.border}15`, color: theme.textDim }}>{c.label}</span>
                        </div>)}
                    </div>}

                    {/* Calendar */}
                    {dataTab === 'calendar' && <div>
                        {app.calendar.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim, fontSize: 10 }}>No calendar data</div>}
                        {app.calendar.map(c => <div key={c.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}06`, borderLeft: `3px solid ${c.title.includes('🔴') || c.title.includes('Dock') ? '#ef4444' : theme.accent}` }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, marginBottom: 2 }}>{c.title}</div>
                            <div style={{ fontSize: 9, color: theme.textDim }}>{c.date} · {c.time} · 📍 {c.location}</div>
                            {c.notes && <div style={{ fontSize: 8, color: c.notes.includes('CRITICAL') ? '#ef4444' : theme.textSecondary, marginTop: 2 }}>{c.notes}</div>}
                        </div>)}
                    </div>}

                    {/* Notifications */}
                    {dataTab === 'notifications' && <div>
                        {app.notifications.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim, fontSize: 10 }}>No notifications</div>}
                        {app.notifications.map(n => <div key={n.id} style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{ width: 24, height: 24, borderRadius: 5, background: `${theme.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>🔔</div>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{n.app} — {n.title}</div><div style={{ fontSize: 9, color: theme.textSecondary }}>{n.body}</div></div>
                            <span style={{ fontSize: 7, color: theme.textDim, flexShrink: 0 }}>{n.timestamp.slice(5)}</span>
                        </div>)}
                    </div>}

                    {/* Network */}
                    {dataTab === 'network' && <div style={{ padding: 16 }}>
                        <div style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            {Object.entries(app.networkInfo).map(([k, v]) => <div key={k} style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 9, color: theme.textDim }}>{k}</span><span style={{ fontSize: 9, color: (k === 'VPN' && v !== 'None' && v !== 'None detected') ? '#f59e0b' : k === 'Status' && v.includes('OFFLINE') ? '#ef4444' : theme.text, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{v}</span></div>)}
                        </div>
                    </div>}

                    {/* Location */}
                    {dataTab === 'location' && <div style={{ padding: 16 }}>
                        <div style={{ padding: '16px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bgCard, marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, marginBottom: 4 }}>📍 Current Location</div>
                            <div style={{ fontSize: 10, color: theme.textSecondary, marginBottom: 6 }}>{app.locationName}</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div><div style={{ fontSize: 7, color: theme.textDim }}>Latitude</div><div style={{ fontSize: 10, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{app.lat.toFixed(5)}</div></div>
                                <div><div style={{ fontSize: 7, color: theme.textDim }}>Longitude</div><div style={{ fontSize: 10, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{app.lng.toFixed(5)}</div></div>
                                <div><div style={{ fontSize: 7, color: theme.textDim }}>Last Update</div><div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{app.lastCheckInAgo}</div></div>
                            </div>
                            <a href="/map" style={{ display: 'inline-block', marginTop: 8, fontSize: 8, padding: '4px 10px', borderRadius: 4, border: `1px solid ${theme.accent}30`, color: theme.accent, textDecoration: 'none', fontWeight: 700 }}>🗺️ Show on Tactical Map</a>
                        </div>
                    </div>}

                    {/* Screenshots */}
                    {dataTab === 'screenshots' && <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                        {app.screenshots.length === 0 && <div style={{ gridColumn: '1/-1', padding: 30, textAlign: 'center' as const, color: theme.textDim, fontSize: 10 }}>No screenshots captured</div>}
                        {app.screenshots.map(s => <div key={s.id} style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            <div style={{ height: 100, background: '#0a0e16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 9 }}>📸 {s.app}</div>
                            <div style={{ padding: '6px 8px' }}><div style={{ fontSize: 8, color: theme.text }}>{s.app}</div><div style={{ fontSize: 7, color: theme.textDim }}>{s.timestamp.slice(5)} · {s.size}</div></div>
                        </div>)}
                    </div>}

                    {/* Photos */}
                    {dataTab === 'photos' && <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                        {app.photos.length === 0 && <div style={{ gridColumn: '1/-1', padding: 30, textAlign: 'center' as const, color: theme.textDim, fontSize: 10 }}>No photos captured</div>}
                        {app.photos.map(p => <div key={p.id} style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            <div style={{ height: 100, background: '#0a0e16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 9 }}>🖼️ {p.filename}</div>
                            <div style={{ padding: '6px 8px' }}><div style={{ fontSize: 8, color: theme.text }}>{p.filename}</div><div style={{ fontSize: 7, color: theme.textDim }}>{p.timestamp.slice(5)} · {p.size} · 📍 {p.location}</div></div>
                        </div>)}
                    </div>}

                    {/* Remote Control */}
                    {dataTab === 'remote' && <div style={{ padding: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>🎮 Remote Control Panel</div>
                        <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 12 }}>Send commands to the deployed agent on {app.personName}'s device. Actions execute silently.</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            {[
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
                            ].map(cmd => <button key={cmd.label} disabled={app.status === 'Offline' || app.status === 'Paused'} style={{ padding: '12px', borderRadius: 6, border: `1px solid ${cmd.color}20`, background: `${cmd.color}04`, cursor: app.status === 'Offline' || app.status === 'Paused' ? 'not-allowed' : 'pointer', textAlign: 'left' as const, fontFamily: 'inherit', opacity: app.status === 'Offline' || app.status === 'Paused' ? 0.4 : 1 }}>
                                <div style={{ fontSize: 16, marginBottom: 4 }}>{cmd.icon}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{cmd.label}</div>
                                <div style={{ fontSize: 8, color: theme.textDim }}>{cmd.desc}</div>
                            </button>)}
                        </div>
                        {(app.status === 'Offline' || app.status === 'Paused') && <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, border: '1px solid #ef444420', background: '#ef444406', fontSize: 9, color: '#ef4444' }}>⚠️ Device is {app.status.toLowerCase()}. Remote commands unavailable until reconnection.</div>}
                    </div>}
                </div>

                {/* Bottom */}
                <div style={{ padding: '3px 16px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>📱 {app.deviceModel} · {app.platform} · IMEI: {app.imei}</span>
                    <div style={{ flex: 1 }} /><a href={`/persons/${app.personId}`} style={{ color: theme.accent, textDecoration: 'none', fontSize: 7 }}>🧑 Profile</a><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>}
        </div>
    </>);
}

AppsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default AppsIndex;
