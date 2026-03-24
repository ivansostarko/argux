import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockVehicles, riskColors } from '../../mock/vehicles';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Plate Recognition (LPR)  ·  License Plate Intelligence
   YOLOv8 detection + PaddleOCR · All scanned plates, linked to
   vehicles, persons, organizations, cameras
   ═══════════════════════════════════════════════════════════════ */

type ScanStatus = 'Matched' | 'Watchlist Hit' | 'Unknown' | 'Partial Read';
type Direction = 'North' | 'South' | 'East' | 'West' | 'Entering' | 'Exiting' | '—';

interface LPRReader {
    id: string; name: string; location: string; lat: number; lng: number; cameraId: number | null;
    status: 'Online' | 'Offline' | 'Maintenance'; captureCount: number;
}

interface LPRScan {
    id: string; plate: string; plateConfidence: number;
    readerId: string; readerName: string; readerLocation: string;
    cameraId: number | null; cameraName: string;
    vehicleId: number | null; vehicleMake: string; vehicleModel: string; vehicleColor: string;
    personId: number | null; personName: string;
    orgId: number | null; orgName: string;
    status: ScanStatus; direction: Direction; speed: number | null; lane: string;
    timestamp: string; timeAgo: string;
    lat: number; lng: number;
    operationCode: string;
    watchlistMatch: boolean;
    tags: string[];
}

const statusColors: Record<ScanStatus, string> = { 'Matched': '#22c55e', 'Watchlist Hit': '#ef4444', 'Unknown': '#6b7280', 'Partial Read': '#f59e0b' };
const statusIcons: Record<ScanStatus, string> = { 'Matched': '✅', 'Watchlist Hit': '🚨', 'Unknown': '❓', 'Partial Read': '⚠️' };

// ═══ LPR READERS (8 fixed + 2 mobile) ═══
const readers: LPRReader[] = [
    { id: 'lpr-01', name: 'Vukovarska East', location: 'Vukovarska cesta, Zagreb', lat: 45.802, lng: 15.995, cameraId: 8, status: 'Online', captureCount: 12840 },
    { id: 'lpr-02', name: 'Airport Cargo Gate', location: 'Zagreb Airport, Cargo Terminal', lat: 45.743, lng: 16.069, cameraId: 14, status: 'Online', captureCount: 8920 },
    { id: 'lpr-03', name: 'A1 Highway Km 78 South', location: 'A1 Highway, Southbound', lat: 45.327, lng: 16.334, cameraId: null, status: 'Online', captureCount: 34560 },
    { id: 'lpr-04', name: 'Savska Safe House', location: 'Savska cesta 41, Zagreb', lat: 45.807, lng: 15.985, cameraId: null, status: 'Online', captureCount: 6780 },
    { id: 'lpr-05', name: 'Port Terminal Entry', location: 'Port Terminal, Zagreb', lat: 45.818, lng: 15.992, cameraId: null, status: 'Online', captureCount: 9450 },
    { id: 'lpr-06', name: 'Ilica / Frankopanska', location: 'Ilica, Zagreb', lat: 45.813, lng: 15.978, cameraId: 8, status: 'Online', captureCount: 18920 },
    { id: 'lpr-07', name: 'Rashid Tower Parking', location: 'Dubai, UAE', lat: 25.205, lng: 55.271, cameraId: 11, status: 'Online', captureCount: 4230 },
    { id: 'lpr-08', name: 'Split Coastal Road', location: 'Split, Croatia', lat: 43.508, lng: 16.440, cameraId: 3, status: 'Maintenance', captureCount: 7120 },
    { id: 'lpr-09', name: 'Mobile Unit Alpha', location: 'Variable — Zagreb', lat: 45.815, lng: 15.982, cameraId: null, status: 'Online', captureCount: 2340 },
    { id: 'lpr-10', name: 'Mobile Unit Bravo', location: 'Variable — Port Area', lat: 45.816, lng: 15.990, cameraId: null, status: 'Offline', captureCount: 890 },
];

// ═══ MOCK SCANS (50 captures) ═══
const mockScans: LPRScan[] = [
    { id: 'lp-01', plate: 'ZG-1234-AB', plateConfidence: 99, readerId: 'lpr-01', readerName: 'Vukovarska East', readerLocation: 'Vukovarska cesta', cameraId: 8, cameraName: 'Zagreb Street Cam A1', vehicleId: 1, vehicleMake: 'BMW', vehicleModel: 'X5 M', vehicleColor: 'Matte Black', personId: 1, personName: 'Marko Horvat', orgId: 1, orgName: 'Alpha Security Group', status: 'Watchlist Hit', direction: 'East', speed: 52, lane: 'Lane 2', timestamp: '2026-03-24 09:31:10', timeAgo: '43m', lat: 45.802, lng: 15.995, operationCode: 'HAWK', watchlistMatch: true, tags: ['watchlist', 'HAWK', 'tracked'] },
    { id: 'lp-02', plate: 'ZG-1234-AB', plateConfidence: 98, readerId: 'lpr-05', readerName: 'Port Terminal Entry', readerLocation: 'Port Terminal', cameraId: null, cameraName: 'Port Gate LPR', vehicleId: 1, vehicleMake: 'BMW', vehicleModel: 'X5 M', vehicleColor: 'Matte Black', personId: 1, personName: 'Marko Horvat', orgId: 1, orgName: 'Alpha Security Group', status: 'Watchlist Hit', direction: 'Entering', speed: 15, lane: 'Gate 3', timestamp: '2026-03-24 06:42:30', timeAgo: '3h', lat: 45.818, lng: 15.992, operationCode: 'HAWK', watchlistMatch: true, tags: ['watchlist', 'port-entry', 'visit-11'] },
    { id: 'lp-03', plate: 'ZG-1234-AB', plateConfidence: 97, readerId: 'lpr-06', readerName: 'Ilica / Frankopanska', readerLocation: 'Ilica, Zagreb', cameraId: 8, cameraName: 'Zagreb Street Cam A1', vehicleId: 1, vehicleMake: 'BMW', vehicleModel: 'X5 M', vehicleColor: 'Matte Black', personId: 1, personName: 'Marko Horvat', orgId: 1, orgName: 'Alpha Security Group', status: 'Watchlist Hit', direction: 'West', speed: 45, lane: 'Lane 1', timestamp: '2026-03-24 05:55:00', timeAgo: '4h', lat: 45.813, lng: 15.978, operationCode: 'HAWK', watchlistMatch: true, tags: ['watchlist', 'early-morning'] },
    { id: 'lp-04', plate: 'ZG-5678-CD', plateConfidence: 99, readerId: 'lpr-03', readerName: 'A1 Highway Km 78', readerLocation: 'A1 Highway South', cameraId: null, cameraName: 'A1 LPR South', vehicleId: 2, vehicleMake: 'Audi', vehicleModel: 'A6', vehicleColor: 'Dark Blue', personId: 12, personName: 'Ivan Babić', orgId: 1, orgName: 'Alpha Security Group', status: 'Watchlist Hit', direction: 'South', speed: 132, lane: 'Lane 3 (fast)', timestamp: '2026-03-23 18:45:00', timeAgo: '15h', lat: 45.327, lng: 16.334, operationCode: 'HAWK', watchlistMatch: true, tags: ['watchlist', 'speeding', '132kmh'] },
    { id: 'lp-05', plate: 'ZG-5678-CD', plateConfidence: 96, readerId: 'lpr-01', readerName: 'Vukovarska East', readerLocation: 'Vukovarska cesta', cameraId: 8, cameraName: 'Zagreb Street Cam A1', vehicleId: 2, vehicleMake: 'Audi', vehicleModel: 'A6', vehicleColor: 'Dark Blue', personId: 12, personName: 'Ivan Babić', orgId: 1, orgName: 'Alpha Security Group', status: 'Watchlist Hit', direction: 'East', speed: 48, lane: 'Lane 1', timestamp: '2026-03-24 08:15:00', timeAgo: '2h', lat: 45.802, lng: 15.995, operationCode: 'HAWK', watchlistMatch: true, tags: ['watchlist', 'weekly-meeting'] },
    { id: 'lp-06', plate: 'SA-9012-RH', plateConfidence: 98, readerId: 'lpr-02', readerName: 'Airport Cargo Gate', readerLocation: 'Airport Cargo', cameraId: 14, cameraName: 'Zagreb Airport Cargo', vehicleId: 3, vehicleMake: 'Rolls-Royce', vehicleModel: 'Ghost', vehicleColor: 'Pearl White', personId: 3, personName: 'Ahmed Al-Rashid', orgId: 2, orgName: 'Rashid Holdings International', status: 'Watchlist Hit', direction: 'Entering', speed: 20, lane: 'VIP Gate', timestamp: '2026-03-24 07:30:22', timeAgo: '3h', lat: 45.743, lng: 16.069, operationCode: 'GLACIER', watchlistMatch: true, tags: ['watchlist', 'diplomatic', 'GLACIER'] },
    { id: 'lp-07', plate: 'SA-9012-RH', plateConfidence: 97, readerId: 'lpr-07', readerName: 'Rashid Tower Parking', readerLocation: 'Dubai', cameraId: 11, cameraName: 'Rashid Holdings Parking', vehicleId: 3, vehicleMake: 'Rolls-Royce', vehicleModel: 'Ghost', vehicleColor: 'Pearl White', personId: 3, personName: 'Ahmed Al-Rashid', orgId: 2, orgName: 'Rashid Holdings International', status: 'Watchlist Hit', direction: 'Entering', speed: 8, lane: 'P2 Ramp', timestamp: '2026-03-23 08:15:00', timeAgo: '26h', lat: 25.205, lng: 55.271, operationCode: 'GLACIER', watchlistMatch: true, tags: ['watchlist', 'dubai', 'routine'] },
    { id: 'lp-08', plate: 'SA-3456-RH', plateConfidence: 99, readerId: 'lpr-07', readerName: 'Rashid Tower Parking', readerLocation: 'Dubai', cameraId: 11, cameraName: 'Rashid Holdings Parking', vehicleId: 4, vehicleMake: 'Mercedes-Benz', vehicleModel: 'G63 AMG', vehicleColor: 'Black', personId: 3, personName: 'Ahmed Al-Rashid', orgId: 2, orgName: 'Rashid Holdings International', status: 'Matched', direction: 'Exiting', speed: 12, lane: 'P2 Ramp', timestamp: '2026-03-24 06:30:00', timeAgo: '4h', lat: 25.205, lng: 55.271, operationCode: 'GLACIER', watchlistMatch: false, tags: ['convoy-vehicle'] },
    { id: 'lp-09', plate: 'BOG-789-ME', plateConfidence: 94, readerId: 'lpr-04', readerName: 'Savska Safe House', readerLocation: 'Savska cesta 41', cameraId: null, cameraName: 'Savska LPR', vehicleId: 8, vehicleMake: 'Toyota', vehicleModel: 'Fortuner', vehicleColor: 'Black', personId: 9, personName: 'Carlos Mendoza', orgId: 6, orgName: 'Mendoza Import-Export SA', status: 'Watchlist Hit', direction: 'North', speed: 35, lane: 'Lane 1', timestamp: '2026-03-23 22:08:00', timeAgo: '12h', lat: 45.807, lng: 15.985, operationCode: 'HAWK', watchlistMatch: true, tags: ['watchlist', 'night', 'safe-house'] },
    { id: 'lp-10', plate: 'KA-9921-CC', plateConfidence: 96, readerId: 'lpr-04', readerName: 'Savska Safe House', readerLocation: 'Savska cesta 41', cameraId: null, cameraName: 'Savska LPR', vehicleId: null, vehicleMake: '', vehicleModel: '', vehicleColor: '', personId: null, personName: '', orgId: null, orgName: '', status: 'Unknown', direction: 'South', speed: 28, lane: 'Lane 1', timestamp: '2026-03-24 03:22:10', timeAgo: '7h', lat: 45.807, lng: 15.985, operationCode: 'HAWK', watchlistMatch: false, tags: ['unknown', 'rental', 'night', 'safe-house-proximity'] },
    { id: 'lp-11', plate: 'ZG-8888-XX', plateConfidence: 99, readerId: 'lpr-01', readerName: 'Vukovarska East', readerLocation: 'Vukovarska', cameraId: 8, cameraName: 'Zagreb Street Cam A1', vehicleId: 18, vehicleMake: 'Porsche', vehicleModel: 'Cayenne Turbo GT', vehicleColor: 'Racing Green', personId: null, personName: '', orgId: null, orgName: '', status: 'Matched', direction: 'West', speed: 65, lane: 'Lane 2', timestamp: '2026-03-24 08:50:00', timeAgo: '1h', lat: 45.802, lng: 15.995, operationCode: '', watchlistMatch: false, tags: ['registered', 'no-flag'] },
    { id: 'lp-12', plate: 'ZG-???4-AB', plateConfidence: 42, readerId: 'lpr-09', readerName: 'Mobile Unit Alpha', readerLocation: 'Zagreb variable', cameraId: null, cameraName: 'Mobile LPR Alpha', vehicleId: null, vehicleMake: '', vehicleModel: '', vehicleColor: '', personId: null, personName: '', orgId: null, orgName: '', status: 'Partial Read', direction: 'East', speed: null, lane: '—', timestamp: '2026-03-24 07:12:00', timeAgo: '3h', lat: 45.815, lng: 15.982, operationCode: '', watchlistMatch: false, tags: ['partial', 'obscured', 'rain'] },
    { id: 'lp-13', plate: 'EG-4567-FT', plateConfidence: 95, readerId: 'lpr-05', readerName: 'Port Terminal Entry', readerLocation: 'Port Terminal', cameraId: null, cameraName: 'Port Gate LPR', vehicleId: 7, vehicleMake: 'Toyota', vehicleModel: 'Land Cruiser 300', vehicleColor: 'White', personId: 7, personName: 'Omar Hassan', orgId: 5, orgName: 'Falcon Trading LLC', status: 'Watchlist Hit', direction: 'Entering', speed: 20, lane: 'Gate 1', timestamp: '2026-03-23 16:00:00', timeAgo: '18h', lat: 45.818, lng: 15.992, operationCode: 'HAWK', watchlistMatch: true, tags: ['watchlist', 'port', 'hassan'] },
    { id: 'lp-14', plate: 'ZG-1234-AB', plateConfidence: 98, readerId: 'lpr-04', readerName: 'Savska Safe House', readerLocation: 'Savska cesta 41', cameraId: null, cameraName: 'Savska LPR', vehicleId: 1, vehicleMake: 'BMW', vehicleModel: 'X5 M', vehicleColor: 'Matte Black', personId: 1, personName: 'Marko Horvat', orgId: 1, orgName: 'Alpha Security Group', status: 'Watchlist Hit', direction: 'North', speed: 30, lane: 'Lane 1', timestamp: '2026-03-23 21:15:00', timeAgo: '13h', lat: 45.807, lng: 15.985, operationCode: 'HAWK', watchlistMatch: true, tags: ['watchlist', 'night', 'safe-house'] },
    { id: 'lp-15', plate: 'HR-AB-123', plateConfidence: 99, readerId: 'lpr-06', readerName: 'Ilica / Frankopanska', readerLocation: 'Ilica', cameraId: 8, cameraName: 'Zagreb Street Cam A1', vehicleId: null, vehicleMake: '', vehicleModel: '', vehicleColor: '', personId: null, personName: '', orgId: null, orgName: '', status: 'Matched', direction: 'East', speed: 42, lane: 'Lane 1', timestamp: '2026-03-24 09:05:00', timeAgo: '1h', lat: 45.813, lng: 15.978, operationCode: '', watchlistMatch: false, tags: ['civilian', 'no-flag'] },
    { id: 'lp-16', plate: 'ZG-5678-CD', plateConfidence: 88, readerId: 'lpr-09', readerName: 'Mobile Unit Alpha', readerLocation: 'Diplomatic Quarter', cameraId: null, cameraName: 'Mobile LPR Alpha', vehicleId: 2, vehicleMake: 'Audi', vehicleModel: 'A6', vehicleColor: 'Dark Blue', personId: 12, personName: 'Ivan Babić', orgId: 1, orgName: 'Alpha Security Group', status: 'Watchlist Hit', direction: 'North', speed: 35, lane: '—', timestamp: '2026-03-23 14:20:00', timeAgo: '20h', lat: 45.813, lng: 15.977, operationCode: 'HAWK', watchlistMatch: true, tags: ['watchlist', 'diplomatic-quarter', 'mobile-capture'] },
    { id: 'lp-17', plate: 'ST-9012-EF', plateConfidence: 97, readerId: 'lpr-08', readerName: 'Split Coastal Road', readerLocation: 'Split', cameraId: 3, cameraName: 'Split Hotel Marjan Lobby', vehicleId: 14, vehicleMake: 'Fiat', vehicleModel: '500e', vehicleColor: 'Coral', personId: 11, personName: 'Fatima Al-Zahra', orgId: null, orgName: '', status: 'Matched', direction: 'South', speed: 50, lane: 'Lane 1', timestamp: '2026-03-22 10:30:00', timeAgo: '2d', lat: 43.508, lng: 16.440, operationCode: '', watchlistMatch: false, tags: ['split', 'routine'] },
    { id: 'lp-18', plate: 'M-RU-2345', plateConfidence: 91, readerId: 'lpr-06', readerName: 'Ilica / Frankopanska', readerLocation: 'Ilica', cameraId: 8, cameraName: 'Zagreb Street Cam A1', vehicleId: 11, vehicleMake: 'Lada', vehicleModel: 'Vesta SW Cross', vehicleColor: 'Olive', personId: 4, personName: 'Elena Petrova', orgId: 8, orgName: 'Petrova Consulting', status: 'Matched', direction: 'West', speed: 38, lane: 'Lane 1', timestamp: '2026-03-24 07:45:00', timeAgo: '2h', lat: 45.813, lng: 15.978, operationCode: '', watchlistMatch: false, tags: ['russian-plates', 'routine'] },
    { id: 'lp-19', plate: 'B-MU-7890', plateConfidence: 99, readerId: 'lpr-01', readerName: 'Vukovarska East', readerLocation: 'Vukovarska', cameraId: 8, cameraName: 'Zagreb Street Cam A1', vehicleId: 5, vehicleMake: 'Volkswagen', vehicleModel: 'Passat', vehicleColor: 'Silver', personId: 8, personName: 'Sophie Müller', orgId: 3, orgName: 'Meridian Logistics GmbH', status: 'Matched', direction: 'East', speed: 55, lane: 'Lane 2', timestamp: '2026-03-24 08:20:00', timeAgo: '2h', lat: 45.802, lng: 15.995, operationCode: '', watchlistMatch: false, tags: ['german-plates', 'routine'] },
    { id: 'lp-20', plate: 'XX-????-??', plateConfidence: 18, readerId: 'lpr-05', readerName: 'Port Terminal Entry', readerLocation: 'Port Terminal', cameraId: null, cameraName: 'Port Gate LPR', vehicleId: null, vehicleMake: '', vehicleModel: '', vehicleColor: '', personId: null, personName: '', orgId: null, orgName: '', status: 'Partial Read', direction: 'Entering', speed: 10, lane: 'Gate 2', timestamp: '2026-03-24 04:15:00', timeAgo: '6h', lat: 45.818, lng: 15.992, operationCode: '', watchlistMatch: false, tags: ['partial', 'covered-plate', 'suspicious'] },
    { id: 'lp-21', plate: 'ZG-1234-AB', plateConfidence: 97, readerId: 'lpr-06', readerName: 'Ilica / Frankopanska', readerLocation: 'Ilica', cameraId: 8, cameraName: 'Zagreb Street Cam A1', vehicleId: 1, vehicleMake: 'BMW', vehicleModel: 'X5 M', vehicleColor: 'Matte Black', personId: 1, personName: 'Marko Horvat', orgId: 1, orgName: 'Alpha Security Group', status: 'Watchlist Hit', direction: 'East', speed: 42, lane: 'Lane 1', timestamp: '2026-03-23 15:30:00', timeAgo: '19h', lat: 45.813, lng: 15.978, operationCode: 'HAWK', watchlistMatch: true, tags: ['watchlist'] },
    { id: 'lp-22', plate: 'DU-5678-GMS', plateConfidence: 96, readerId: 'lpr-07', readerName: 'Rashid Tower Parking', readerLocation: 'Dubai', cameraId: 11, cameraName: 'Rashid Holdings Parking', vehicleId: 12, vehicleMake: 'Nissan', vehicleModel: 'Patrol', vehicleColor: 'Sand', personId: null, personName: '', orgId: 9, orgName: 'Gulf Maritime Services', status: 'Matched', direction: 'Entering', speed: 15, lane: 'P1 Ramp', timestamp: '2026-03-24 05:30:00', timeAgo: '5h', lat: 25.205, lng: 55.271, operationCode: '', watchlistMatch: false, tags: ['dubai', 'gulf-maritime'] },
    { id: 'lp-23', plate: 'LN-7890-MP', plateConfidence: 95, readerId: 'lpr-02', readerName: 'Airport Cargo Gate', readerLocation: 'Airport', cameraId: 14, cameraName: 'Zagreb Airport Cargo', vehicleId: 10, vehicleMake: 'Jaguar', vehicleModel: 'F-Pace SVR', vehicleColor: 'British Racing Green', personId: 7, personName: 'Omar Hassan', orgId: null, orgName: '', status: 'Matched', direction: 'Exiting', speed: 25, lane: 'Gate 2', timestamp: '2026-03-23 12:00:00', timeAgo: '22h', lat: 45.743, lng: 16.069, operationCode: 'HAWK', watchlistMatch: false, tags: ['airport', 'hassan-associate'] },
    { id: 'lp-24', plate: 'KA-5511-BB', plateConfidence: 93, readerId: 'lpr-04', readerName: 'Savska Safe House', readerLocation: 'Savska', cameraId: null, cameraName: 'Savska LPR', vehicleId: null, vehicleMake: '', vehicleModel: '', vehicleColor: '', personId: null, personName: '', orgId: null, orgName: '', status: 'Unknown', direction: 'North', speed: 40, lane: 'Lane 1', timestamp: '2026-03-24 01:45:00', timeAgo: '8h', lat: 45.807, lng: 15.985, operationCode: '', watchlistMatch: false, tags: ['unknown', 'night', 'safe-house-proximity'] },
];

const allReaders = readers.map(r => r.name);
const allPersons = [...new Set(mockScans.filter(s => s.personName).map(s => ({ id: s.personId!, name: s.personName })))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number; name: string }[]);
const allOrgs = [...new Set(mockScans.filter(s => s.orgName).map(s => ({ id: s.orgId!, name: s.orgName })))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number; name: string }[]);
const allPlates = [...new Set(mockScans.map(s => s.plate))].sort();

type ViewTab = 'scans' | 'readers' | 'watchlist';

function PlateRecognitionIndex() {
    const [tab, setTab] = useState<ViewTab>('scans');
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState<ScanStatus | 'all'>('all');
    const [readerF, setReaderF] = useState('all');
    const [personF, setPersonF] = useState<number | 'all'>('all');
    const [orgF, setOrgF] = useState<number | 'all'>('all');
    const [plateF, setPlateF] = useState('all');
    const [selScan, setSelScan] = useState<string | null>(null);

    const scan = selScan ? mockScans.find(s => s.id === selScan) : null;

    const filtered = useMemo(() => mockScans.filter(s => {
        if (statusF !== 'all' && s.status !== statusF) return false;
        if (readerF !== 'all' && s.readerName !== readerF) return false;
        if (personF !== 'all' && s.personId !== personF) return false;
        if (orgF !== 'all' && s.orgId !== orgF) return false;
        if (plateF !== 'all' && s.plate !== plateF) return false;
        if (search && !s.plate.toLowerCase().includes(search.toLowerCase()) && !s.personName.toLowerCase().includes(search.toLowerCase()) && !s.readerLocation.toLowerCase().includes(search.toLowerCase()) && !s.vehicleMake.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [statusF, readerF, personF, orgF, plateF, search]);

    const stats = { total: mockScans.length, watchlist: mockScans.filter(s => s.watchlistMatch).length, matched: mockScans.filter(s => s.status === 'Matched').length, unknown: mockScans.filter(s => s.status === 'Unknown').length, partial: mockScans.filter(s => s.status === 'Partial Read').length, readersOnline: readers.filter(r => r.status === 'Online').length };

    const watchlistPlates = [...new Set(mockScans.filter(s => s.watchlistMatch).map(s => s.plate))];
    const watchlistDetails = watchlistPlates.map(p => { const scans = mockScans.filter(s => s.plate === p); const v = mockVehicles.find(vv => vv.plate === p); return { plate: p, scans: scans.length, lastSeen: scans[0]?.timestamp || '', personName: scans[0]?.personName || '', vehicleDesc: v ? `${v.make} ${v.model} · ${v.color}` : '—', risk: v?.risk || 'No Risk' as const }; });

    return (<>
        <PageMeta title="Plate Recognition" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* LEFT */}
            <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#10b98110', border: '1px solid #10b98125', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚗</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>LPR</div><div style={{ fontSize: 7, color: theme.textDim }}>License Plate Recognition</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plates..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 3 }}>
                    {[{ n: stats.total, l: 'Total', c: theme.accent }, { n: stats.watchlist, l: 'Watch', c: '#ef4444' }, { n: stats.unknown, l: 'Unkn', c: '#6b7280' }, { n: stats.readersOnline, l: 'Rdrs', c: '#22c55e' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '3px 0' }}><div style={{ fontSize: 13, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Status */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Scan Status</div>
                    {(['all', 'Watchlist Hit', 'Matched', 'Unknown', 'Partial Read'] as const).map(s => { const c = s === 'all' ? mockScans.length : mockScans.filter(sc => sc.status === s).length; return <button key={s} onClick={() => { setStatusF(s as any); }} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: statusF === s ? `${s === 'all' ? theme.accent : statusColors[s as ScanStatus]}08` : 'transparent', color: statusF === s ? (s === 'all' ? theme.accent : statusColors[s as ScanStatus]) : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${statusF === s ? (s === 'all' ? theme.accent : statusColors[s as ScanStatus]) : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}>{s === 'all' ? '📋' : statusIcons[s as ScanStatus]} <span style={{ flex: 1 }}>{s === 'all' ? 'All Scans' : s}</span><span style={{ fontSize: 7, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>

                {/* Reader */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>LPR Reader</div>
                    <select value={readerF} onChange={e => setReaderF(e.target.value)} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Readers ({readers.length})</option>{allReaders.map(r => <option key={r} value={r}>{r}</option>)}</select>
                </div>

                {/* Person */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Person</div>
                    <select value={personF === 'all' ? 'all' : String(personF)} onChange={e => setPersonF(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Persons</option>{allPersons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                </div>

                {/* Org */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Organization</div>
                    <select value={orgF === 'all' ? 'all' : String(orgF)} onChange={e => setOrgF(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Organizations</option>{allOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
                </div>

                {/* Plate */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Plate Number</div>
                    <select value={plateF} onChange={e => setPlateF(e.target.value)} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Plates</option>{allPlates.map(p => <option key={p} value={p}>{p}</option>)}</select>
                </div>

                <div style={{ padding: '8px 12px', marginTop: 'auto' }}>
                    {[{ l: '🗺️ Map', h: '/map' }, { l: '🚗 Vehicles', h: '/vehicles' }, { l: '🚨 Alerts', h: '/alerts' }, { l: '📊 Activity', h: '/activity' }].map(lk => <a key={lk.h} href={lk.h} style={{ display: 'block', fontSize: 8, color: theme.textDim, textDecoration: 'none', padding: '2px 0' }}>{lk.l}</a>)}
                </div>
            </div>

            {/* CENTER */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {[{ id: 'scans' as ViewTab, l: '📋 All Scans', n: filtered.length }, { id: 'watchlist' as ViewTab, l: '🚨 Watchlist', n: watchlistPlates.length }, { id: 'readers' as ViewTab, l: '📡 Readers', n: readers.length }].map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#10b981' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 10, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>{t.l} <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: `${tab === t.id ? '#10b981' : theme.border}20`, color: tab === t.id ? '#10b981' : theme.textDim }}>{t.n}</span></button>)}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {/* ═══ SCANS ═══ */}
                    {tab === 'scans' && <>
                        <div style={{ display: 'grid', gridTemplateColumns: '100px 2fr 1fr 70px 50px 60px 60px', padding: '5px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', background: theme.bg, gap: 6, position: 'sticky' as const, top: 0, zIndex: 1 }}>
                            <span>Plate</span><span>Reader / Location</span><span>Vehicle</span><span>Status</span><span>Conf</span><span>Speed</span><span style={{ textAlign: 'right' as const }}>Time</span>
                        </div>
                        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 28, opacity: 0.2 }}>🚗</div><div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>No scans match</div></div>}
                        {filtered.map(s => {
                            const sc = statusColors[s.status]; const sel = selScan === s.id;
                            return <div key={s.id} onClick={() => setSelScan(s.id)} style={{ display: 'grid', gridTemplateColumns: '100px 2fr 1fr 70px 50px 60px 60px', padding: '7px 14px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', gap: 6, background: sel ? `${sc}04` : 'transparent', borderLeft: `3px solid ${sel ? sc : 'transparent'}` }}>
                                {/* Plate */}
                                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 800, color: s.watchlistMatch ? '#ef4444' : theme.text, letterSpacing: '0.04em' }}>{s.plate}</div>
                                {/* Reader */}
                                <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.text }}>{s.readerName}</div><div style={{ fontSize: 7, color: theme.textDim }}>{s.readerLocation}</div></div>
                                {/* Vehicle */}
                                <div>{s.vehicleId ? <><div style={{ fontSize: 8, color: theme.text }}>{s.vehicleMake} {s.vehicleModel}</div><div style={{ fontSize: 7, color: theme.textDim }}>{s.personName && <a href={`/persons/${s.personId}`} onClick={e => e.stopPropagation()} style={{ color: theme.accent, textDecoration: 'none' }}>🧑 {s.personName}</a>}</div></> : <span style={{ fontSize: 8, color: theme.textDim }}>—</span>}</div>
                                {/* Status */}
                                <span style={{ fontSize: 7, fontWeight: 700, color: sc }}>{statusIcons[s.status]} {s.status.split(' ')[0]}</span>
                                {/* Confidence */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <div style={{ width: 20, height: 3, borderRadius: 1, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${s.plateConfidence}%`, height: '100%', background: s.plateConfidence > 90 ? '#22c55e' : s.plateConfidence > 70 ? '#f59e0b' : '#ef4444' }} /></div>
                                    <span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{s.plateConfidence}%</span>
                                </div>
                                {/* Speed */}
                                <span style={{ fontSize: 8, color: s.speed && s.speed > 100 ? '#ef4444' : theme.textDim, fontFamily: "'JetBrains Mono',monospace", fontWeight: s.speed && s.speed > 100 ? 700 : 400 }}>{s.speed ? `${s.speed} km/h` : '—'}</span>
                                {/* Time */}
                                <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 8, color: theme.textDim }}>{s.timeAgo}</div><div style={{ fontSize: 6, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{s.timestamp.slice(11)}</div></div>
                            </div>;
                        })}
                    </>}

                    {/* ═══ WATCHLIST ═══ */}
                    {tab === 'watchlist' && <div style={{ padding: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>🚨 Watchlist Plates ({watchlistPlates.length})</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                            {watchlistDetails.map(w => <div key={w.plate} onClick={() => { setTab('scans'); setPlateF(w.plate); }} style={{ padding: '12px', borderRadius: 8, border: `1px solid ${riskColors[w.risk]}20`, background: `${riskColors[w.risk]}03`, cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 900, color: '#ef4444', letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 4, background: '#ef444408', border: '1px solid #ef444420' }}>{w.plate}</div>
                                    <span style={{ fontSize: 8, fontWeight: 700, color: riskColors[w.risk], padding: '2px 6px', borderRadius: 3, background: `${riskColors[w.risk]}12` }}>{w.risk}</span>
                                </div>
                                <div style={{ fontSize: 9, color: theme.text, marginBottom: 2 }}>{w.vehicleDesc}</div>
                                {w.personName && <a href={`/persons/${mockScans.find(s => s.plate === w.plate)?.personId}`} style={{ fontSize: 8, color: theme.accent, textDecoration: 'none' }}>🧑 {w.personName}</a>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 8, color: theme.textDim }}>
                                    <span>{w.scans} captures</span><span>Last: {w.lastSeen.slice(5, 16)}</span>
                                </div>
                            </div>)}
                        </div>
                    </div>}

                    {/* ═══ READERS ═══ */}
                    {tab === 'readers' && <div style={{ padding: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>📡 LPR Readers ({readers.length})</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                            {readers.map(r => { const rc = r.status === 'Online' ? '#22c55e' : r.status === 'Offline' ? '#ef4444' : '#f59e0b'; return <div key={r.id} onClick={() => { setTab('scans'); setReaderF(r.name); }} style={{ padding: '12px', borderRadius: 8, border: `1px solid ${rc}20`, background: `${rc}03`, cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: rc, boxShadow: r.status === 'Online' ? `0 0 4px ${rc}` : 'none' }} />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{r.name}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 7, fontWeight: 700, color: rc }}>{r.status}</span>
                                </div>
                                <div style={{ fontSize: 8, color: theme.textDim, marginBottom: 4 }}>📍 {r.location}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8 }}>
                                    <span style={{ color: theme.textDim }}>{r.cameraId ? <a href={`/devices/${r.cameraId}`} style={{ color: theme.accent, textDecoration: 'none' }}>📹 Camera #{r.cameraId}</a> : 'Standalone'}</span>
                                    <span style={{ color: theme.text, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{r.captureCount.toLocaleString()}</span>
                                </div>
                            </div>; })}
                        </div>
                    </div>}
                </div>

                <div style={{ padding: '3px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>{filtered.length} scans · {stats.watchlist} watchlist hits · {readers.filter(r => r.status === 'Online').length}/{readers.length} readers online</span>
                    <div style={{ flex: 1 }} /><span>YOLOv8 + PaddleOCR v3 · On-Premise</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>

            {/* RIGHT: Scan Detail */}
            {scan && <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 900, color: scan.watchlistMatch ? '#ef4444' : theme.text, letterSpacing: '0.06em', padding: '5px 12px', borderRadius: 5, background: scan.watchlistMatch ? '#ef444408' : `${theme.border}10`, border: `1px solid ${scan.watchlistMatch ? '#ef444425' : theme.border}` }}>{scan.plate}</div>
                        <button onClick={() => setSelScan(null)} style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                        <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: `${statusColors[scan.status]}12`, color: statusColors[scan.status] }}>{statusIcons[scan.status]} {scan.status}</span>
                        {scan.operationCode && <span style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${theme.accent}10`, color: theme.accent }}>{scan.operationCode}</span>}
                    </div>
                </div>

                {/* Capture image placeholder */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ width: '100%', height: 80, borderRadius: 6, background: '#0a0e16', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const, overflow: 'hidden' }}>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '0.08em', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{scan.plate}</div>
                        <div style={{ position: 'absolute' as const, bottom: 4, right: 6, fontSize: 7, color: '#ffffff80', fontFamily: "'JetBrains Mono',monospace" }}>{scan.plateConfidence}% · {scan.cameraName}</div>
                    </div>
                </div>

                {/* Vehicle info */}
                {scan.vehicleId && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>🚗 Vehicle</div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                        {[{ l: 'Make/Model', v: `${scan.vehicleMake} ${scan.vehicleModel}` }, { l: 'Color', v: scan.vehicleColor }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: theme.text, fontWeight: 600 }}>{r.v}</span></div>)}
                    </div>
                    <a href={`/vehicles/${scan.vehicleId}`} style={{ display: 'inline-block', marginTop: 4, fontSize: 7, padding: '2px 6px', borderRadius: 3, border: `1px solid #10b98125`, color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>View Vehicle</a>
                </div>}

                {/* Person */}
                {scan.personId && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#ec4899', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>🧑 Registered Owner</div>
                    <a href={`/persons/${scan.personId}`} style={{ fontSize: 9, color: theme.accent, textDecoration: 'none', fontWeight: 700 }}>{scan.personName}</a>
                    {scan.orgName && <div style={{ marginTop: 2 }}><a href={`/organizations/${scan.orgId}`} style={{ fontSize: 8, color: '#8b5cf6', textDecoration: 'none' }}>🏢 {scan.orgName}</a></div>}
                </div>}

                {/* Capture details */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 2 }}>📡 Capture Details</div>
                    {[
                        { l: 'Reader', v: scan.readerName },
                        { l: 'Location', v: scan.readerLocation },
                        { l: 'Camera', v: scan.cameraName },
                        { l: 'Direction', v: scan.direction },
                        { l: 'Speed', v: scan.speed ? `${scan.speed} km/h` : '—' },
                        { l: 'Lane', v: scan.lane },
                        { l: 'Confidence', v: `${scan.plateConfidence}%` },
                        { l: 'Timestamp', v: scan.timestamp },
                        { l: 'Coordinates', v: `${scan.lat.toFixed(4)}, ${scan.lng.toFixed(4)}` },
                    ].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: theme.text }}>{r.v}</span></div>)}
                </div>

                {/* Tags */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                        {scan.tags.map(t => <span key={t} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: t === 'watchlist' ? '#ef444412' : `${theme.border}20`, color: t === 'watchlist' ? '#ef4444' : theme.textSecondary }}>{t}</span>)}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '8px 12px', display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginTop: 'auto' }}>
                    <a href="/map" style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, textDecoration: 'none', fontSize: 8, fontWeight: 700, textAlign: 'center' as const }}>🗺️ Map</a>
                    <a href="/alerts" style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8, textAlign: 'center' as const }}>🚨 Alert</a>
                    {scan.cameraId && <a href={`/devices/${scan.cameraId}`} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8, textAlign: 'center' as const }}>📹 Camera</a>}
                </div>
            </div>}
        </div>
    </>);
}

PlateRecognitionIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default PlateRecognitionIndex;
