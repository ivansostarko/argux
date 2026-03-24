import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockPersons, riskColors, type Risk } from '../../mock/persons';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Face Recognition  ·  InsightFace / ArcFace Engine
   YOLOv8 detection + InsightFace matching · On-Premise GPU
   ═══════════════════════════════════════════════════════════════ */

type MatchStatus = 'Confirmed Match' | 'Possible Match' | 'No Match' | 'Pending Review';

interface FaceCapture {
    id: string; captureUrl: string;
    personId: number | null; personName: string; personAvatar: string;
    personRisk: Risk;
    confidence: number; status: MatchStatus;
    cameraId: number | null; cameraName: string;
    lat: number; lng: number; location: string;
    timestamp: string; timeAgo: string;
    operationCode: string;
    disguise: string; companions: string; quality: number;
    tags: string[];
}

const statusColors: Record<MatchStatus, string> = { 'Confirmed Match': '#22c55e', 'Possible Match': '#f59e0b', 'No Match': '#6b7280', 'Pending Review': '#8b5cf6' };
const statusIcons: Record<MatchStatus, string> = { 'Confirmed Match': '✅', 'Possible Match': '🟡', 'No Match': '❌', 'Pending Review': '🔍' };

// 11 cameras from devices
const cameras = [
    { id: 1, name: 'Zagreb HQ Entrance', location: 'Savska cesta 120, Zagreb' },
    { id: 3, name: 'Split Hotel Marjan Lobby', location: 'Hotel Marjan, Split' },
    { id: 5, name: 'Dubai Port Camera', location: 'Jebel Ali Port, Dubai' },
    { id: 7, name: 'Cairo Office Interior', location: 'Cairo, Egypt' },
    { id: 8, name: 'Zagreb Street Cam A1', location: 'Ilica / Frankopanska, Zagreb' },
    { id: 11, name: 'Rashid Holdings Parking', location: 'Dubai, UAE' },
    { id: 12, name: 'Moscow Meeting Room', location: 'Moscow, Russia' },
    { id: 14, name: 'Zagreb Airport Cargo', location: 'Zagreb Airport' },
    { id: 15, name: 'Maksimir Park Cam', location: 'Maksimir Park, Zagreb' },
    { id: 16, name: 'Port Terminal Cam', location: 'Port Terminal, Zagreb' },
    { id: 17, name: 'Diplomatic Quarter Cam', location: 'Embassy Row, Zagreb' },
];

// ═══ 30 MOCK FACE CAPTURES ═══
const mockCaptures: FaceCapture[] = [
    { id: 'fc-01', captureUrl: '', personId: 1, personName: 'Marko Horvat', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'Critical', confidence: 94, status: 'Confirmed Match', cameraId: 8, cameraName: 'Zagreb Street Cam A1', lat: 45.813, lng: 15.977, location: 'Trg bana Jelačića, Zagreb', timestamp: '2026-03-24 09:48:33', timeAgo: '26m', operationCode: 'HAWK', disguise: 'Baseball cap', companions: 'Alone', quality: 92, tags: ['HAWK', 'priority', 'disguise'] },
    { id: 'fc-02', captureUrl: '', personId: 1, personName: 'Marko Horvat', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'Critical', confidence: 91, status: 'Confirmed Match', cameraId: 16, cameraName: 'Port Terminal Cam', lat: 45.818, lng: 15.992, location: 'Port Terminal, Zagreb', timestamp: '2026-03-24 06:42:15', timeAgo: '3h', operationCode: 'HAWK', disguise: 'Sunglasses', companions: 'With 1 unknown male', quality: 88, tags: ['HAWK', 'port', 'companion'] },
    { id: 'fc-03', captureUrl: '', personId: 1, personName: 'Marko Horvat', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'Critical', confidence: 97, status: 'Confirmed Match', cameraId: 1, cameraName: 'Zagreb HQ Entrance', lat: 45.815, lng: 15.982, location: 'Savska cesta 120, Zagreb', timestamp: '2026-03-23 17:30:00', timeAgo: '17h', operationCode: 'HAWK', disguise: 'None', companions: 'With Babić', quality: 96, tags: ['HAWK', 'HQ', 'high-quality'] },
    { id: 'fc-04', captureUrl: '', personId: 12, personName: 'Ivan Babić', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'High', confidence: 87, status: 'Confirmed Match', cameraId: 15, cameraName: 'Maksimir Park Cam', lat: 45.820, lng: 15.960, location: 'Maksimir Park, Zagreb', timestamp: '2026-03-24 08:12:50', timeAgo: '2h', operationCode: 'HAWK', disguise: 'None', companions: 'Alone', quality: 85, tags: ['HAWK', 'park', 'routine'] },
    { id: 'fc-05', captureUrl: '', personId: 12, personName: 'Ivan Babić', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'High', confidence: 92, status: 'Confirmed Match', cameraId: 1, cameraName: 'Zagreb HQ Entrance', lat: 45.815, lng: 15.982, location: 'Savska cesta 120, Zagreb', timestamp: '2026-03-23 17:28:00', timeAgo: '17h', operationCode: 'HAWK', disguise: 'None', companions: 'With Horvat', quality: 94, tags: ['HAWK', 'HQ', 'co-arrival'] },
    { id: 'fc-06', captureUrl: '', personId: 12, personName: 'Ivan Babić', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'High', confidence: 78, status: 'Possible Match', cameraId: 17, cameraName: 'Diplomatic Quarter Cam', lat: 45.813, lng: 15.977, location: 'Embassy Row, Zagreb', timestamp: '2026-03-23 14:22:00', timeAgo: '20h', operationCode: 'HAWK', disguise: 'Hat + Scarf', companions: 'Alone', quality: 62, tags: ['HAWK', 'diplomatic', 'disguise', 'low-quality'] },
    { id: 'fc-07', captureUrl: '', personId: 2, personName: 'Ana Kovačević', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'High', confidence: 91, status: 'Confirmed Match', cameraId: 1, cameraName: 'Zagreb HQ Entrance', lat: 45.815, lng: 15.982, location: 'Savska cesta 120, Zagreb', timestamp: '2026-03-24 08:05:15', timeAgo: '2h', operationCode: '', disguise: 'None', companions: 'Alone', quality: 93, tags: ['associate', 'first-in-2-weeks'] },
    { id: 'fc-08', captureUrl: '', personId: 3, personName: 'Ahmed Al-Rashid', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'Critical', confidence: 89, status: 'Confirmed Match', cameraId: 14, cameraName: 'Zagreb Airport Cargo', lat: 45.743, lng: 16.069, location: 'Airport Cargo Terminal, Zagreb', timestamp: '2026-03-24 07:25:00', timeAgo: '3h', operationCode: 'GLACIER', disguise: 'None', companions: 'With 2 bodyguards', quality: 90, tags: ['GLACIER', 'airport', 'bodyguards', 'diplomatic'] },
    { id: 'fc-09', captureUrl: '', personId: 3, personName: 'Ahmed Al-Rashid', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'Critical', confidence: 85, status: 'Confirmed Match', cameraId: 11, cameraName: 'Rashid Holdings Parking', lat: 25.205, lng: 55.271, location: 'Rashid Holdings Tower, Dubai', timestamp: '2026-03-23 08:10:00', timeAgo: '26h', operationCode: 'GLACIER', disguise: 'None', companions: 'With driver', quality: 87, tags: ['GLACIER', 'dubai', 'routine'] },
    { id: 'fc-10', captureUrl: '', personId: 7, personName: 'Omar Hassan', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'High', confidence: 82, status: 'Confirmed Match', cameraId: 16, cameraName: 'Port Terminal Cam', lat: 45.818, lng: 15.992, location: 'Port Terminal Gate 1, Zagreb', timestamp: '2026-03-23 16:05:00', timeAgo: '18h', operationCode: 'HAWK', disguise: 'None', companions: 'Alone', quality: 80, tags: ['HAWK', 'port'] },
    { id: 'fc-11', captureUrl: '', personId: 7, personName: 'Omar Hassan', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'High', confidence: 68, status: 'Possible Match', cameraId: 5, cameraName: 'Dubai Port Camera', lat: 25.044, lng: 55.085, location: 'Jebel Ali Port, Dubai', timestamp: '2026-03-22 14:30:00', timeAgo: '2d', operationCode: 'HAWK', disguise: 'Keffiyeh', companions: '3 unknown males', quality: 55, tags: ['HAWK', 'dubai', 'low-quality', 'disguise'] },
    { id: 'fc-12', captureUrl: '', personId: 9, personName: 'Carlos Mendoza', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'Critical', confidence: 76, status: 'Possible Match', cameraId: 8, cameraName: 'Zagreb Street Cam A1', lat: 45.813, lng: 15.978, location: 'Ilica, Zagreb', timestamp: '2026-03-24 01:30:00', timeAgo: '9h', operationCode: 'HAWK', disguise: 'Hood + Mask', companions: 'Alone', quality: 48, tags: ['HAWK', 'night', 'heavy-disguise', 'low-quality'] },
    { id: 'fc-13', captureUrl: '', personId: 9, personName: 'Carlos Mendoza', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'Critical', confidence: 88, status: 'Confirmed Match', cameraId: 1, cameraName: 'Zagreb HQ Entrance', lat: 45.815, lng: 15.982, location: 'Near Savska cesta, Zagreb', timestamp: '2026-03-24 09:14:00', timeAgo: '1h', operationCode: 'HAWK', disguise: 'None', companions: 'Alone', quality: 91, tags: ['HAWK', 'co-location-event'] },
    { id: 'fc-14', captureUrl: '', personId: null, personName: '', personAvatar: '', personRisk: 'No Risk', confidence: 0, status: 'No Match', cameraId: 14, cameraName: 'Zagreb Airport Cargo', lat: 45.743, lng: 16.069, location: 'Airport Cargo, Zagreb', timestamp: '2026-03-24 07:15:45', timeAgo: '3h', operationCode: '', disguise: 'None', companions: 'Alone', quality: 82, tags: ['unknown', 'airport', 'pending-review'] },
    { id: 'fc-15', captureUrl: '', personId: null, personName: '', personAvatar: '', personRisk: 'No Risk', confidence: 0, status: 'No Match', cameraId: 16, cameraName: 'Port Terminal Cam', lat: 45.818, lng: 15.992, location: 'Port Terminal, Zagreb', timestamp: '2026-03-24 04:15:00', timeAgo: '6h', operationCode: '', disguise: 'Hood', companions: 'Alone', quality: 35, tags: ['unknown', 'night', 'suspicious', 'covered-plate-vehicle'] },
    { id: 'fc-16', captureUrl: '', personId: null, personName: '', personAvatar: '', personRisk: 'No Risk', confidence: 0, status: 'Pending Review', cameraId: 5, cameraName: 'Dubai Port Camera', lat: 25.044, lng: 55.085, location: 'Jebel Ali Port, Dubai', timestamp: '2026-03-24 09:55:00', timeAgo: '19m', operationCode: '', disguise: 'None', companions: 'On vessel deck', quality: 71, tags: ['unregistered-vessel', 'dubai', 'manual-review'] },
    { id: 'fc-17', captureUrl: '', personId: 4, personName: 'Elena Petrova', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'Medium', confidence: 90, status: 'Confirmed Match', cameraId: 12, cameraName: 'Moscow Meeting Room', lat: 55.756, lng: 37.617, location: 'Moscow, Russia', timestamp: '2026-03-19 11:00:00', timeAgo: '5d', operationCode: '', disguise: 'None', companions: '4 others (meeting)', quality: 88, tags: ['moscow', 'meeting', 'routine'] },
    { id: 'fc-18', captureUrl: '', personId: 1, personName: 'Marko Horvat', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'Critical', confidence: 96, status: 'Confirmed Match', cameraId: 8, cameraName: 'Zagreb Street Cam A1', lat: 45.813, lng: 15.978, location: 'Frankopanska, Zagreb', timestamp: '2026-03-23 08:15:00', timeAgo: '26h', operationCode: 'HAWK', disguise: 'None', companions: 'Alone', quality: 95, tags: ['HAWK', 'morning-routine'] },
    { id: 'fc-19', captureUrl: '', personId: null, personName: '', personAvatar: '', personRisk: 'No Risk', confidence: 0, status: 'Pending Review', cameraId: 1, cameraName: 'Zagreb HQ Entrance', lat: 45.815, lng: 15.982, location: 'Savska cesta 120, Zagreb', timestamp: '2026-03-24 02:30:00', timeAgo: '8h', operationCode: '', disguise: 'None', companions: 'Alone', quality: 78, tags: ['after-hours', 'motion-triggered', 'manual-review'] },
    { id: 'fc-20', captureUrl: '', personId: 1, personName: 'Marko Horvat', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', personRisk: 'Critical', confidence: 73, status: 'Possible Match', cameraId: 3, cameraName: 'Split Hotel Marjan Lobby', lat: 43.508, lng: 16.440, location: 'Hotel Marjan, Split', timestamp: '2026-03-21 22:15:00', timeAgo: '3d', operationCode: 'HAWK', disguise: 'None', companions: 'With unknown female', quality: 60, tags: ['HAWK', 'split', 'low-quality', 'hotel'] },
];

const allCameras = [...new Set(mockCaptures.map(c => c.cameraName))].sort();
const allMatchedPersons = [...new Set(mockCaptures.filter(c => c.personId).map(c => ({ id: c.personId!, name: c.personName })))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number; name: string }[]);
const allOps = [...new Set(mockCaptures.map(c => c.operationCode).filter(Boolean))];

type ViewTab = 'captures' | 'search' | 'stats';

function FaceRecognitionIndex() {
    const [tab, setTab] = useState<ViewTab>('captures');
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState<MatchStatus | 'all'>('all');
    const [cameraF, setCameraF] = useState('all');
    const [personF, setPersonF] = useState<number | 'all'>('all');
    const [opF, setOpF] = useState('all');
    const [minConf, setMinConf] = useState(0);
    const [selCapture, setSelCapture] = useState<string | null>(null);

    // Search mode
    const [searchPerson, setSearchPerson] = useState<number | null>(null);
    const [searchDragOver, setSearchDragOver] = useState(false);
    const [searchRunning, setSearchRunning] = useState(false);
    const [searchDone, setSearchDone] = useState(false);

    const capture = selCapture ? mockCaptures.find(c => c.id === selCapture) : null;

    const filtered = useMemo(() => mockCaptures.filter(c => {
        if (statusF !== 'all' && c.status !== statusF) return false;
        if (cameraF !== 'all' && c.cameraName !== cameraF) return false;
        if (personF !== 'all' && c.personId !== personF) return false;
        if (opF !== 'all' && c.operationCode !== opF) return false;
        if (minConf > 0 && c.confidence < minConf && c.confidence > 0) return false;
        if (search && !c.personName.toLowerCase().includes(search.toLowerCase()) && !c.cameraName.toLowerCase().includes(search.toLowerCase()) && !c.location.toLowerCase().includes(search.toLowerCase()) && !c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
    }), [statusF, cameraF, personF, opF, minConf, search]);

    const stats = { total: mockCaptures.length, confirmed: mockCaptures.filter(c => c.status === 'Confirmed Match').length, possible: mockCaptures.filter(c => c.status === 'Possible Match').length, noMatch: mockCaptures.filter(c => c.status === 'No Match').length, pending: mockCaptures.filter(c => c.status === 'Pending Review').length, uniquePersons: new Set(mockCaptures.filter(c => c.personId).map(c => c.personId)).size, avgConf: Math.round(mockCaptures.filter(c => c.confidence > 0).reduce((s, c) => s + c.confidence, 0) / mockCaptures.filter(c => c.confidence > 0).length) };

    const runSearch = () => { setSearchRunning(true); setSearchDone(false); setTimeout(() => { setSearchRunning(false); setSearchDone(true); }, 2500); };

    const searchResults = searchDone && searchPerson ? mockCaptures.filter(c => c.personId === searchPerson) : [];

    return (<>
        <PageMeta title="Face Recognition" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* LEFT */}
            <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#ec489910', border: '1px solid #ec489925', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧑</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>FACE ID</div><div style={{ fontSize: 7, color: theme.textDim }}>InsightFace / ArcFace</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search captures..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 3 }}>
                    {[{ n: stats.total, l: 'Total', c: theme.accent }, { n: stats.confirmed, l: 'Match', c: '#22c55e' }, { n: stats.pending, l: 'Pend', c: '#8b5cf6' }, { n: `${stats.avgConf}%`, l: 'Avg', c: '#f59e0b' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '3px 0' }}><div style={{ fontSize: 13, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Status filter */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Match Status</div>
                    {(['all', 'Confirmed Match', 'Possible Match', 'No Match', 'Pending Review'] as const).map(s => { const c = s === 'all' ? mockCaptures.length : mockCaptures.filter(cc => cc.status === s).length; return <button key={s} onClick={() => setStatusF(s as any)} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: statusF === s ? `${s === 'all' ? theme.accent : statusColors[s as MatchStatus]}08` : 'transparent', color: statusF === s ? (s === 'all' ? theme.accent : statusColors[s as MatchStatus]) : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${statusF === s ? (s === 'all' ? theme.accent : statusColors[s as MatchStatus]) : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}>{s === 'all' ? '📋' : statusIcons[s as MatchStatus]} <span style={{ flex: 1 }}>{s === 'all' ? 'All' : s.split(' ')[0]}</span><span style={{ fontSize: 7, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>

                {/* Camera */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Camera Source</div>
                    <select value={cameraF} onChange={e => setCameraF(e.target.value)} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Cameras</option>{allCameras.map(c => <option key={c} value={c}>{c}</option>)}</select>
                </div>

                {/* Person */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Matched Person</div>
                    <select value={personF === 'all' ? 'all' : String(personF)} onChange={e => setPersonF(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Persons</option>{allMatchedPersons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                </div>

                {/* Operation */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Operation</div>
                    <select value={opF} onChange={e => setOpF(e.target.value)} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Operations</option>{allOps.map(o => <option key={o} value={o}>OP {o}</option>)}</select>
                </div>

                {/* Min confidence */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ fontSize: 8, fontWeight: 700, color: theme.textDim }}>Min Confidence</span><span style={{ fontSize: 8, color: theme.accent, fontFamily: "'JetBrains Mono',monospace" }}>{minConf}%</span></div>
                    <input type="range" min={0} max={95} step={5} value={minConf} onChange={e => setMinConf(parseInt(e.target.value))} style={{ width: '100%', accentColor: theme.accent }} />
                </div>

                <div style={{ padding: '8px 12px', marginTop: 'auto' }}>
                    {[{ l: '🗺️ Map', h: '/map' }, { l: '📹 Vision', h: '/vision' }, { l: '🚨 Alerts', h: '/alerts' }, { l: '📊 Activity', h: '/activity' }].map(lk => <a key={lk.h} href={lk.h} style={{ display: 'block', fontSize: 8, color: theme.textDim, textDecoration: 'none', padding: '2px 0' }}>{lk.l}</a>)}
                </div>
            </div>

            {/* CENTER */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {[{ id: 'captures' as ViewTab, l: '📋 All Captures', n: filtered.length }, { id: 'search' as ViewTab, l: '🔍 Face Search' }, { id: 'stats' as ViewTab, l: '📊 Statistics' }].map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#ec4899' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 10, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>{t.l}{t.n !== undefined && <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: `${tab === t.id ? '#ec4899' : theme.border}20`, color: tab === t.id ? '#ec4899' : theme.textDim }}>{t.n}</span>}</button>)}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {/* ═══ CAPTURES GRID ═══ */}
                    {tab === 'captures' && <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                        {filtered.length === 0 && <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 28, opacity: 0.2 }}>🧑</div><div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>No captures match</div></div>}
                        {filtered.map(c => {
                            const sc = statusColors[c.status]; const sel = selCapture === c.id;
                            return <div key={c.id} onClick={() => setSelCapture(c.id)} style={{ borderRadius: 8, border: `1px solid ${sel ? sc + '40' : theme.border}`, background: sel ? `${sc}04` : theme.bgCard, cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.15s' }}>
                                {/* Face capture area */}
                                <div style={{ height: 100, background: '#0a0e16', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
                                    {c.personAvatar ? <img src={c.personAvatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${sc}60` }} /> : <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${theme.border}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: `2px solid ${sc}40` }}>❓</div>}
                                    {/* Confidence badge */}
                                    {c.confidence > 0 && <div style={{ position: 'absolute' as const, top: 6, right: 6, padding: '2px 6px', borderRadius: 3, background: c.confidence > 85 ? '#22c55e' : c.confidence > 70 ? '#f59e0b' : '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>{c.confidence}%</div>}
                                    {/* Status */}
                                    <div style={{ position: 'absolute' as const, bottom: 6, left: 6, padding: '2px 5px', borderRadius: 3, background: 'rgba(0,0,0,0.7)', color: sc, fontSize: 7, fontWeight: 700 }}>{statusIcons[c.status]} {c.status.split(' ')[0]}</div>
                                    {/* Camera */}
                                    <div style={{ position: 'absolute' as const, bottom: 6, right: 6, fontSize: 6, color: '#ffffff60', fontFamily: "'JetBrains Mono',monospace" }}>{c.cameraName.slice(0, 18)}</div>
                                </div>
                                {/* Info */}
                                <div style={{ padding: '8px 10px' }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: c.personId ? theme.text : theme.textDim, marginBottom: 2 }}>{c.personName || 'Unknown Person'}</div>
                                    <div style={{ fontSize: 7, color: theme.textDim, marginBottom: 4 }}>{c.location.length > 30 ? c.location.slice(0, 30) + '…' : c.location}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: 2 }}>
                                            {c.disguise !== 'None' && <span style={{ fontSize: 6, padding: '1px 3px', borderRadius: 2, background: '#f59e0b12', color: '#f59e0b' }}>🎭</span>}
                                            {c.operationCode && <span style={{ fontSize: 6, padding: '1px 3px', borderRadius: 2, background: `${theme.accent}10`, color: theme.accent }}>{c.operationCode}</span>}
                                        </div>
                                        <span style={{ fontSize: 7, color: theme.textDim }}>{c.timeAgo}</span>
                                    </div>
                                </div>
                            </div>;
                        })}
                    </div>}

                    {/* ═══ FACE SEARCH ═══ */}
                    {tab === 'search' && <div style={{ padding: 16, maxWidth: 650 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 4 }}>🔍 Face Search — Database Lookup</div>
                        <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 16 }}>Upload a photo or select a known person to search all camera captures for matching faces using InsightFace/ArcFace (ONNX Runtime, GPU-accelerated).</div>

                        {/* Upload area */}
                        <div onDragOver={e => { e.preventDefault(); setSearchDragOver(true); }} onDragLeave={() => setSearchDragOver(false)} onDrop={e => { e.preventDefault(); setSearchDragOver(false); }} style={{ padding: '24px', borderRadius: 8, border: `2px dashed ${searchDragOver ? '#ec4899' : theme.border}`, background: searchDragOver ? '#ec489906' : 'transparent', textAlign: 'center' as const, marginBottom: 12, transition: 'all 0.15s' }}>
                            <div style={{ fontSize: 28, marginBottom: 4 }}>📤</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>Drop a face photo here</div>
                            <div style={{ fontSize: 8, color: theme.textDim, marginTop: 2 }}>JPEG, PNG · Min 100×100px · Frontal view recommended</div>
                            <button style={{ marginTop: 8, padding: '5px 14px', borderRadius: 4, border: `1px solid #ec489930`, background: '#ec489906', color: '#ec4899', fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Browse Files</button>
                        </div>

                        <div style={{ textAlign: 'center' as const, fontSize: 9, color: theme.textDim, margin: '8px 0' }}>— OR —</div>

                        {/* Select known person */}
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Select Known Person from Database</div>
                            <select value={searchPerson ?? ''} onChange={e => { setSearchPerson(e.target.value ? parseInt(e.target.value) : null); setSearchDone(false); }} style={{ width: '100%', padding: '8px 10px', borderRadius: 5, border: `1px solid ${searchPerson ? '#ec489940' : theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 10, fontFamily: 'inherit', outline: 'none' }}>
                                <option value="">— Select person —</option>
                                {mockPersons.slice(0, 15).map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.risk})</option>)}
                            </select>
                        </div>

                        {/* Selected person preview */}
                        {searchPerson && (() => { const p = mockPersons.find(pp => pp.id === searchPerson); if (!p) return null; return <div style={{ padding: '12px', borderRadius: 8, border: `1px solid #ec489920`, background: '#ec489904', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={p.avatar || undefined} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ec489940' }} />
                            <div><div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{p.firstName} {p.lastName}</div><div style={{ fontSize: 8, color: theme.textDim }}>{p.nationality} · <span style={{ color: riskColors[p.risk], fontWeight: 600 }}>{p.risk}</span></div></div>
                        </div>; })()}

                        <button onClick={runSearch} disabled={!searchPerson || searchRunning} style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', background: searchPerson && !searchRunning ? '#ec4899' : `${theme.border}30`, color: searchPerson && !searchRunning ? '#fff' : theme.textDim, fontSize: 11, fontWeight: 800, cursor: searchPerson ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>{searchRunning ? '⏳ Searching camera database...' : '🔍 Search All Cameras for Face Matches'}</button>

                        {/* Progress */}
                        {searchRunning && <div style={{ marginTop: 12, padding: '12px', borderRadius: 6, border: `1px solid #ec489920`, background: '#ec489904' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 9, color: theme.text }}><span>Scanning camera archives...</span><span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#ec4899' }}>11 cameras</span></div>
                            <div style={{ height: 4, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: '65%', height: '100%', background: '#ec4899', borderRadius: 2, transition: 'width 1s', animation: 'none' }} /></div>
                            <div style={{ fontSize: 7, color: theme.textDim, marginTop: 4 }}>InsightFace / ArcFace · ONNX Runtime · GPU: NVIDIA A100 · Embedding comparison</div>
                        </div>}

                        {/* Results */}
                        {searchDone && <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>✅ Search Complete — {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''} found</div>
                            {searchResults.length === 0 && <div style={{ padding: 20, textAlign: 'center' as const, color: theme.textDim, fontSize: 10, borderRadius: 6, border: `1px solid ${theme.border}` }}>No matches found in camera archives for this person.</div>}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6 }}>
                                {searchResults.map(c => <div key={c.id} onClick={() => { setTab('captures'); setSelCapture(c.id); }} style={{ padding: '10px', borderRadius: 6, border: `1px solid ${statusColors[c.status]}20`, background: `${statusColors[c.status]}04`, cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0a0e16', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${c.confidence > 85 ? '#22c55e' : '#f59e0b'}40` }}>{c.personAvatar ? <img src={c.personAvatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} /> : <span>❓</span>}</div>
                                        <div><div style={{ fontSize: 12, fontWeight: 800, color: c.confidence > 85 ? '#22c55e' : '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{c.confidence}%</div><div style={{ fontSize: 6, color: theme.textDim }}>{c.status}</div></div>
                                    </div>
                                    <div style={{ fontSize: 8, color: theme.text }}>{c.cameraName}</div>
                                    <div style={{ fontSize: 7, color: theme.textDim }}>{c.location.slice(0, 30)}</div>
                                    <div style={{ fontSize: 7, color: theme.textDim, marginTop: 2 }}>{c.timestamp.slice(5)} · {c.disguise !== 'None' ? `🎭 ${c.disguise}` : 'No disguise'}</div>
                                </div>)}
                            </div>
                        </div>}
                    </div>}

                    {/* ═══ STATISTICS ═══ */}
                    {tab === 'stats' && <div style={{ padding: 16, display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                        {/* Per person */}
                        <div><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>Face Captures by Person</div>
                        <div style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            {allMatchedPersons.map(p => { const caps = mockCaptures.filter(c => c.personId === p.id); const avgC = Math.round(caps.reduce((s, c) => s + c.confidence, 0) / caps.length);
                                return <div key={p.id} style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <img src={caps[0]?.personAvatar || undefined} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${riskColors[caps[0]?.personRisk || 'No Risk']}40` }} />
                                    <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{p.name}</div><div style={{ fontSize: 7, color: theme.textDim }}>{caps.length} captures · Avg: {avgC}%</div></div>
                                    <div style={{ display: 'flex', gap: 2 }}>{caps.slice(0, 5).map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c.confidence > 85 ? '#22c55e' : c.confidence > 70 ? '#f59e0b' : '#ef4444' }} />)}</div>
                                    <a href={`/persons/${p.id}`} style={{ fontSize: 7, padding: '2px 6px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>Profile</a>
                                </div>;
                            })}
                        </div></div>

                        {/* Per camera */}
                        <div><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>Captures by Camera</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
                            {cameras.slice(0, 8).map(cam => { const caps = mockCaptures.filter(c => c.cameraId === cam.id);
                                return <div key={cam.id} style={{ padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgCard }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, marginBottom: 2 }}>{cam.name}</div>
                                    <div style={{ fontSize: 7, color: theme.textDim, marginBottom: 4 }}>{cam.location}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: caps.length > 0 ? '#ec4899' : theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{caps.length}</span>
                                        <a href={`/devices/${cam.id}`} style={{ fontSize: 7, color: theme.accent, textDecoration: 'none' }}>📹 Device</a>
                                    </div>
                                </div>;
                            })}
                        </div></div>
                    </div>}
                </div>

                <div style={{ padding: '3px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>{filtered.length} captures · {stats.uniquePersons} persons · {cameras.length} cameras · Avg {stats.avgConf}% confidence</span>
                    <div style={{ flex: 1 }} /><span>InsightFace / ArcFace · ONNX · GPU</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>

            {/* RIGHT: Capture Detail */}
            {capture && tab === 'captures' && <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {capture.personAvatar ? <img src={capture.personAvatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${statusColors[capture.status]}60` }} /> : <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${theme.border}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: `2px solid ${statusColors[capture.status]}40` }}>❓</div>}
                        <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{capture.personName || 'Unknown Person'}</div><div style={{ fontSize: 7, color: statusColors[capture.status], fontWeight: 600 }}>{statusIcons[capture.status]} {capture.status}</div></div>
                        <button onClick={() => setSelCapture(null)} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                </div>

                {/* Confidence gauge */}
                {capture.confidence > 0 && <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: `conic-gradient(${capture.confidence > 85 ? '#22c55e' : capture.confidence > 70 ? '#f59e0b' : '#ef4444'} ${capture.confidence * 3.6}deg, ${theme.border}20 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 42, height: 42, borderRadius: '50%', background: theme.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: capture.confidence > 85 ? '#22c55e' : capture.confidence > 70 ? '#f59e0b' : '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>{capture.confidence}%</div></div>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim }}>CONFIDENCE</div><div style={{ fontSize: 7, color: theme.textDim }}>Quality: {capture.quality}%</div></div>
                </div>}

                {/* Details */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                    {[
                        { l: 'Camera', v: capture.cameraName },
                        { l: 'Location', v: capture.location },
                        { l: 'Disguise', v: capture.disguise },
                        { l: 'Companions', v: capture.companions },
                        { l: 'Timestamp', v: capture.timestamp },
                        { l: 'Quality', v: `${capture.quality}%` },
                        { l: 'Coordinates', v: `${capture.lat.toFixed(4)}, ${capture.lng.toFixed(4)}` },
                        ...(capture.operationCode ? [{ l: 'Operation', v: `OP ${capture.operationCode}` }] : []),
                    ].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: r.l === 'Disguise' && r.v !== 'None' ? '#f59e0b' : theme.text, fontWeight: r.l === 'Disguise' && r.v !== 'None' ? 700 : 400 }}>{r.v}</span></div>)}
                </div>

                {/* Tags */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                        {capture.tags.map(t => <span key={t} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: t === 'HAWK' || t === 'GLACIER' ? `${theme.accent}10` : t.includes('disguise') ? '#f59e0b10' : `${theme.border}20`, color: t === 'HAWK' || t === 'GLACIER' ? theme.accent : t.includes('disguise') ? '#f59e0b' : theme.textSecondary }}>{t}</span>)}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '8px 12px', display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginTop: 'auto' }}>
                    {capture.personId && <a href={`/persons/${capture.personId}`} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, textDecoration: 'none', fontSize: 8, fontWeight: 700, textAlign: 'center' as const }}>🧑 Profile</a>}
                    {capture.cameraId && <a href={`/devices/${capture.cameraId}`} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8, textAlign: 'center' as const }}>📹 Camera</a>}
                    <a href="/map" style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8, textAlign: 'center' as const }}>🗺️ Map</a>
                </div>
            </div>}
        </div>
    </>);
}

FaceRecognitionIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default FaceRecognitionIndex;
