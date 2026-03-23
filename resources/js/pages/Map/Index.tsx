import PageMeta from '../../components/layout/PageMeta';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockPersons } from '../../mock/persons';
import { mockOrganizations } from '../../mock/organizations';
import { mockVehicles } from '../../mock/vehicles';

// All subjects placed in Croatia for mockup — spread across Croatian cities
const cityCoords: Record<string, [number, number]> = {
    'Zagreb': [15.9819, 45.8150], 'Split': [16.4402, 43.5081], 'Dubrovnik': [18.0944, 42.6507],
    'Rijeka': [14.4422, 45.3271], 'Osijek': [18.6939, 45.5550], 'Zadar': [15.2314, 44.1194],
    'Pula': [13.8496, 44.8666], 'Varaždin': [16.3366, 46.3057], 'Šibenik': [15.8952, 43.7350],
    'Karlovac': [15.5553, 45.4929],
    // Map foreign cities to Croatian locations for mockup
    'Belgrade': [15.9670, 45.8050], 'Riyadh': [16.0100, 45.7900], 'Moscow': [15.9500, 45.8250],
    'Dublin': [15.9300, 45.8000], 'Tokyo': [16.0300, 45.8100], 'Cairo': [15.9900, 45.8200],
    'Berlin': [15.9600, 45.8300], 'Bogotá': [16.0000, 45.7800], 'Shanghai': [16.0200, 45.8050],
    'Dubai': [15.9400, 45.7950], 'Mumbai': [16.0400, 45.8150], 'Budva': [15.9750, 45.8080],
    'London': [15.9550, 45.8120], 'Jebel Ali Free Zone': [15.9350, 45.8180],
};

/* ═══ SIDEBAR MULTISELECT ═══ */
function SidebarMS({ selected, onChange, options, placeholder, showSelectAll }: { selected: string[]; onChange: (v: string[]) => void; options: { id: string; label: string; sub?: string; img?: string }[]; placeholder: string; showSelectAll?: boolean }) {
    const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()) || (o.sub || '').toLowerCase().includes(q.toLowerCase()));
    const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    const allSelected = selected.length === options.length;
    const has = selected.length > 0;
    return (<div ref={ref} style={{ position: 'relative' }}><button className="tmap-ms-trigger" onClick={() => { setOpen(!open); setQ(''); }} style={{ color: has ? theme.text : theme.textDim, borderColor: has ? theme.accent + '40' : theme.border }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{has ? `${selected.length} of ${options.length} selected` : placeholder}</span><svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4" /></svg></button>{open && <div className="tmap-ms-panel"><div className="tmap-ms-search"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus />{has && <button onClick={() => onChange([])} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: theme.danger, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '2px 6px', borderRadius: 3, flexShrink: 0 }}>Clear</button>}</div>{showSelectAll && !q && <div className="tmap-ms-item" onClick={() => onChange(allSelected ? [] : options.map(o => o.id))} style={{ color: allSelected ? theme.accent : theme.textSecondary, borderBottom: `1px solid ${theme.border}`, fontWeight: 700, fontSize: 10 }}><div className={`tmap-ms-check ${allSelected ? 'on' : ''}`}>{allSelected && <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>Select All</div>}<div className="tmap-ms-list">{filtered.map(o => { const c = selected.includes(o.id); return <div key={o.id} className="tmap-ms-item" onClick={() => toggle(o.id)} style={{ color: c ? theme.accent : theme.text }}><div className={`tmap-ms-check ${c ? 'on' : ''}`}>{c && <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>{o.img && <img src={o.img} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${theme.border}`, flexShrink: 0 }} />}<div><div>{o.label}</div>{o.sub && <div style={{ fontSize: 9, color: theme.textDim }}>{o.sub}</div>}</div></div>; })}{filtered.length === 0 && <div style={{ padding: 12, fontSize: 10, color: theme.textDim, textAlign: 'center' }}>No results</div>}</div></div>}{has && <div className="tmap-tags">{selected.slice(0, 6).map(id => { const o = options.find(x => x.id === id); return o ? <span key={id} className="tmap-tag">{o.label.split(' ')[0]}<button onClick={e => { e.stopPropagation(); toggle(id); }}><svg width="7" height="7" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button></span> : null; })}{selected.length > 6 && <span className="tmap-tag" style={{ opacity: 0.6 }}>+{selected.length - 6}</span>}</div>}</div>);
}

/* ═══ COLLAPSIBLE SECTION ═══ */
function Section({ title, icon, children, defaultOpen = false, badge }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; badge?: number }) {
    const [open, setOpen] = useState(defaultOpen);
    return (<div className="tmap-section"><div className="tmap-section-header" onClick={() => setOpen(!open)}><div className="tmap-section-title">{icon}{title}{badge !== undefined && badge > 0 && <span style={{ fontSize: 8, fontWeight: 700, padding: '0 4px', borderRadius: 6, background: theme.accent, color: '#fff', lineHeight: '14px' }}>{badge}</span>}</div><svg className={`tmap-section-chevron ${open ? 'open' : ''}`} width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,3 5,7 8,3" /></svg></div>{open && <div className="tmap-section-content">{children}</div>}</div>);
}

/* ═══ TOGGLE SWITCH ═══ */
function Toggle({ label, enabled, onChange, description }: { label: string; enabled: boolean; onChange: (v: boolean) => void; description?: string }) {
    return (<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: '6px 0' }}>
        <div><div style={{ fontSize: 11, fontWeight: 600, color: enabled ? theme.text : theme.textSecondary }}>{label}</div>{description && <div style={{ fontSize: 9, color: theme.textDim, marginTop: 1 }}>{description}</div>}</div>
        <button onClick={() => onChange(!enabled)} style={{ width: 34, height: 18, borderRadius: 9, border: 'none', background: enabled ? theme.accent : theme.border, cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}><div style={{ width: 14, height: 14, borderRadius: 7, background: '#fff', position: 'absolute', top: 2, left: enabled ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} /></button>
    </div>);
}

/* ═══ SECTION ICONS ═══ */
const Ico = {
    period: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="12" height="11" rx="1"/><line x1="2" y1="7" x2="14" y2="7"/><line x1="5" y1="1" x2="5" y2="4"/><line x1="11" y1="1" x2="11" y2="4"/></svg>,
    subjects: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="5" r="3"/><path d="M1 14c0-3 2.2-5 5-5s5 2 5 5"/><circle cx="12" cy="5" r="2"/><path d="M12 9c1.7 0 3 1.3 3 3"/></svg>,
    sources: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1v14M4 4v8M12 4v8M1 6v4M15 6v4"/></svg>,
    layers: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2l6 3-6 3-6-3z"/><path d="M2 8l6 3 6-3"/><path d="M2 11l6 3 6-3"/></svg>,
    tiles: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>,
    tools: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 2l4 4-8 8H2v-4z"/></svg>,
    intel: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>,
    objects: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1C5.24 1 3 3.24 3 6c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z"/><circle cx="8" cy="6" r="2"/></svg>,
    places: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 6.5l-4 8-4-8a4 4 0 118 0z"/></svg>,
    settings: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>,
};

const personOpts = mockPersons.map(p => ({ id: p.id.toString(), label: `${p.firstName} ${p.lastName}`, sub: `${p.nationality} · ${p.risk}`, img: p.avatar || undefined }));
const orgOpts = mockOrganizations.map(o => ({ id: o.id.toString(), label: o.name, sub: `${o.country} · ${o.industry}`, img: o.logo || undefined }));

/* ═══ COMPASS WIDGET ═══ */
function Compass({ bearing }: { bearing: number }) {
    return (<div style={{ width: 60, height: 60, position: 'relative' }}>
        <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: `rotate(${-bearing}deg)`, transition: 'transform 0.3s ease-out' }}>
            <circle cx="30" cy="30" r="28" fill="rgba(10,14,22,0.85)" stroke={theme.border} strokeWidth="1.5"/>
            <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
            {[0,45,90,135,180,225,270,315].map(a => <line key={a} x1="30" y1={a % 90 === 0 ? 5 : 7} x2="30" y2={a % 90 === 0 ? 10 : 9} transform={`rotate(${a} 30 30)`} stroke={a === 0 ? '#ef4444' : 'rgba(255,255,255,0.25)'} strokeWidth={a % 90 === 0 ? 1.5 : 0.8} strokeLinecap="round"/>)}
            <polygon points="30,8 27,24 30,21 33,24" fill="#ef4444" opacity="0.9"/>
            <polygon points="30,52 27,36 30,39 33,36" fill="rgba(255,255,255,0.3)"/>
            <circle cx="30" cy="30" r="3" fill={theme.accent} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5"/>
            <text x="30" y="6" textAnchor="middle" fontSize="6" fontWeight="800" fill="#ef4444" fontFamily="system-ui">N</text>
            <text x="30" y="58" textAnchor="middle" fontSize="5" fontWeight="700" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">S</text>
            <text x="4" y="32" textAnchor="middle" fontSize="5" fontWeight="700" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">W</text>
            <text x="56" y="32" textAnchor="middle" fontSize="5" fontWeight="700" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">E</text>
        </svg>
        <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 8, fontWeight: 700, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' as const }}>{Math.round(bearing)}°</div>
    </div>);
}

/* ═══ MINIMAP WIDGET ═══ */
function Minimap({ center, zoom: mainZoom, onNavigate }: { center: { lat: number; lng: number }; zoom: number; onNavigate: (lat: number, lng: number) => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const mmRef = useRef<any>(null);

    useEffect(() => {
        if (!ref.current || !(window as any).maplibregl) return;
        const ml = (window as any).maplibregl;
        const mm = new ml.Map({
            container: ref.current,
            style: { version: 8, sources: { 'esri-world': { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256 } }, layers: [{ id: 'bg', type: 'raster', source: 'esri-world' }] },
            center: [center.lng, center.lat], zoom: Math.max(0, mainZoom - 8),
            interactive: false, attributionControl: false,
            maxZoom: 8,
        });
        mmRef.current = mm;
        return () => { mm.remove(); mmRef.current = null; };
    }, []);

    useEffect(() => {
        if (mmRef.current) {
            mmRef.current.setCenter([center.lng, center.lat]);
            mmRef.current.setZoom(Math.max(0, mainZoom - 8));
        }
    }, [center.lat, center.lng, mainZoom]);

    const handleClick = (e: React.MouseEvent) => {
        if (!mmRef.current) return;
        const rect = (e.target as HTMLElement).closest('div')!.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const lngLat = mmRef.current.unproject([x, y]);
        onNavigate(lngLat.lat, lngLat.lng);
    };

    return (<div onClick={handleClick} style={{ width: 140, height: 100, borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${theme.border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.5)', position: 'relative', cursor: 'crosshair' }}>
        <div ref={ref} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.8"><line x1="8" y1="2" x2="8" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="2" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="14" y2="8"/></svg>
        </div>
        <div style={{ position: 'absolute', top: 3, left: 5, fontSize: 7, fontWeight: 700, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", opacity: 0.7, pointerEvents: 'none' }}>OVERVIEW</div>
        <div style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 6, color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace", pointerEvents: 'none' }}>Click to navigate</div>
    </div>);
}

/* ═══ MAP CONTROL BUTTON ═══ */
function MapBtn({ onClick, title, children, active }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) {
    return <button onClick={onClick} title={title} style={{ width: 32, height: 32, borderRadius: 6, background: active ? theme.accentDim : 'rgba(13,18,32,0.9)', border: `1px solid ${active ? theme.accent + '50' : theme.border}`, color: active ? theme.accent : theme.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', transition: 'all 0.12s' }} onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(13,18,32,1)'; e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.borderColor = theme.textDim; }}} onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(13,18,32,0.9)'; e.currentTarget.style.color = theme.textDim; e.currentTarget.style.borderColor = theme.border; }}}>{children}</button>;
}

/* ═══ MAIN ═══ */
export default function MapIndex() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const fpsRef = useRef<{ frames: number; lastTime: number; fps: number }>({ frames: 0, lastTime: performance.now(), fps: 0 });
    const prevCameraRef = useRef<{ center: [number, number]; zoom: number; bearing: number; pitch: number }>({ center: [15.9819, 45.8150], zoom: 13, bearing: 0, pitch: 0 });
    const mapVersionRef = useRef(0);
    const tileInitRef = useRef(true); // skip first run of tile/loc effects
    const [loaded, setLoaded] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [coords, setCoords] = useState({ lat: 45.8150, lng: 15.9819 });
    const [zoom, setZoom] = useState(13);
    const [bearing, setBearing] = useState(0);
    const [fps, setFps] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Sidebar
    const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); });
    const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
    const [selectedPersons, setSelectedPersons] = useState<string[]>([]);
    const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);

    // Sources
    type SourceId = 'cam-public' | 'cam-hidden' | 'cam-private' | 'gps' | 'audio' | 'app-locator' | 'app-photo' | 'app-video' | 'app-audio' | 'app-camera';
    interface SourceType { id: SourceId; label: string; group: string; color: string; icon: string; shape: 'circle' | 'square' | 'diamond'; }
    const sourceTypes: SourceType[] = [
        { id: 'cam-public', label: 'Public Camera', group: 'Camera', color: '#3b82f6', icon: '📹', shape: 'square' },
        { id: 'cam-hidden', label: 'Hidden Camera', group: 'Camera', color: '#ef4444', icon: '🔴', shape: 'square' },
        { id: 'cam-private', label: 'Private Camera', group: 'Camera', color: '#8b5cf6', icon: '📷', shape: 'square' },
        { id: 'gps', label: 'GPS Tracker', group: 'GPS', color: '#22c55e', icon: '📡', shape: 'circle' },
        { id: 'audio', label: 'Audio Recorder', group: 'Audio', color: '#f59e0b', icon: '🎙️', shape: 'diamond' },
        { id: 'app-locator', label: 'Mobile Locator', group: 'Mobile App', color: '#06b6d4', icon: '📍', shape: 'circle' },
        { id: 'app-photo', label: 'Mobile Photo', group: 'Mobile App', color: '#ec4899', icon: '🖼️', shape: 'circle' },
        { id: 'app-video', label: 'Mobile Video', group: 'Mobile App', color: '#f97316', icon: '🎬', shape: 'circle' },
        { id: 'app-audio', label: 'Mobile Audio', group: 'Mobile App', color: '#a855f7', icon: '🔊', shape: 'circle' },
        { id: 'app-camera', label: 'Mobile Camera', group: 'Mobile App', color: '#14b8a6', icon: '📱', shape: 'circle' },
    ];
    interface SourceMarker { id: string; sourceId: SourceId; lat: number; lng: number; label: string; status: 'online' | 'offline' | 'degraded'; detail: string; }
    const mockSourceMarkers: SourceMarker[] = [
        // Public Cameras (8)
        { id: 'sc1', sourceId: 'cam-public', lat: 45.8131, lng: 15.9775, label: 'Ban Jelačić Square Cam', status: 'online', detail: 'Resolution: 4K · FPS: 30 · Uptime: 99.8%' },
        { id: 'sc2', sourceId: 'cam-public', lat: 45.8155, lng: 15.9690, label: 'Ilica Street Cam #1', status: 'online', detail: 'Resolution: 1080p · FPS: 25 · Uptime: 98.5%' },
        { id: 'sc3', sourceId: 'cam-public', lat: 45.8048, lng: 15.9620, label: 'Savska Cesta Intersection', status: 'degraded', detail: 'Resolution: 1080p · FPS: 15 · Signal weak' },
        { id: 'sc4', sourceId: 'cam-public', lat: 45.8100, lng: 15.9930, label: 'Maksimir Park Entrance', status: 'online', detail: 'Resolution: 4K · FPS: 30 · Night vision enabled' },
        { id: 'sc5', sourceId: 'cam-public', lat: 45.8000, lng: 15.9710, label: 'Main Station South', status: 'online', detail: 'Resolution: 4K · FPS: 30 · Facial recognition active' },
        { id: 'sc6', sourceId: 'cam-public', lat: 45.8195, lng: 15.9555, label: 'Črnomerec Junction', status: 'offline', detail: 'Maintenance since 2026-03-20' },
        { id: 'sc7', sourceId: 'cam-public', lat: 45.8060, lng: 16.0010, label: 'Dubrava Overpass', status: 'online', detail: 'Resolution: 1080p · FPS: 25' },
        { id: 'sc8', sourceId: 'cam-public', lat: 45.8210, lng: 15.9850, label: 'Kaptol Area Cam', status: 'online', detail: 'Resolution: 4K · PTZ · FPS: 30' },
        // Hidden Cameras (5)
        { id: 'sh1', sourceId: 'cam-hidden', lat: 45.8142, lng: 15.9760, label: 'OP-HAWK Unit Alpha', status: 'online', detail: 'Covert · Battery: 89% · Last ping: 2m ago' },
        { id: 'sh2', sourceId: 'cam-hidden', lat: 45.8088, lng: 15.9680, label: 'OP-HAWK Unit Bravo', status: 'online', detail: 'Covert · Battery: 72% · Last ping: 5m ago' },
        { id: 'sh3', sourceId: 'cam-hidden', lat: 45.8170, lng: 15.9810, label: 'OP-HAWK Unit Charlie', status: 'degraded', detail: 'Covert · Battery: 23% · Low battery warning' },
        { id: 'sh4', sourceId: 'cam-hidden', lat: 45.8050, lng: 15.9900, label: 'OP-HAWK Unit Delta', status: 'online', detail: 'Covert · Battery: 95% · Last ping: 1m ago' },
        { id: 'sh5', sourceId: 'cam-hidden', lat: 45.8120, lng: 15.9580, label: 'OP-HAWK Unit Echo', status: 'offline', detail: 'Covert · Device unreachable since 18:00' },
        // Private Cameras (4)
        { id: 'sp1', sourceId: 'cam-private', lat: 45.8115, lng: 15.9830, label: 'ASG HQ Interior #1', status: 'online', detail: 'Private · Restricted access · Recording' },
        { id: 'sp2', sourceId: 'cam-private', lat: 45.8117, lng: 15.9835, label: 'ASG HQ Interior #2', status: 'online', detail: 'Private · Restricted access · Recording' },
        { id: 'sp3', sourceId: 'cam-private', lat: 45.8070, lng: 15.9750, label: 'Safehouse Bravo Cam', status: 'online', detail: 'Private · Motion-triggered · 128GB storage' },
        { id: 'sp4', sourceId: 'cam-private', lat: 45.8190, lng: 15.9700, label: 'Drop Point Zulu Cam', status: 'degraded', detail: 'Private · Intermittent connection' },
        // GPS Trackers (7)
        { id: 'sg1', sourceId: 'gps', lat: 45.8138, lng: 15.9780, label: 'GPS-001 (Horvat Vehicle)', status: 'online', detail: 'Speed: 0 km/h · Parked · Battery: 94%' },
        { id: 'sg2', sourceId: 'gps', lat: 45.8075, lng: 15.9850, label: 'GPS-002 (Babić Vehicle)', status: 'online', detail: 'Speed: 42 km/h · Moving SE · Battery: 88%' },
        { id: 'sg3', sourceId: 'gps', lat: 45.8200, lng: 15.9600, label: 'GPS-003 (Package Alpha)', status: 'online', detail: 'Speed: 0 km/h · Stationary · Battery: 76%' },
        { id: 'sg4', sourceId: 'gps', lat: 45.8020, lng: 15.9950, label: 'GPS-004 (Suspect Van)', status: 'degraded', detail: 'Speed: 15 km/h · Signal intermittent' },
        { id: 'sg5', sourceId: 'gps', lat: 45.8160, lng: 15.9500, label: 'GPS-005 (Asset Foxtrot)', status: 'online', detail: 'Speed: 0 km/h · Parked · Battery: 100%' },
        { id: 'sg6', sourceId: 'gps', lat: 45.8095, lng: 15.9720, label: 'GPS-006 (Motorcycle)', status: 'offline', detail: 'Last position 3h ago · Battery: 12%' },
        { id: 'sg7', sourceId: 'gps', lat: 45.8180, lng: 15.9920, label: 'GPS-007 (Cargo Trailer)', status: 'online', detail: 'Speed: 0 km/h · Port area · Battery: 67%' },
        // Audio Recorders (4)
        { id: 'sa1', sourceId: 'audio', lat: 45.8133, lng: 15.9770, label: 'MIC-ALPHA (Café Target)', status: 'online', detail: 'Recording · Duration: 4h 23m · Quality: High' },
        { id: 'sa2', sourceId: 'audio', lat: 45.8110, lng: 15.9840, label: 'MIC-BRAVO (Office Bug)', status: 'online', detail: 'Recording · Duration: 12h 05m · Quality: High' },
        { id: 'sa3', sourceId: 'audio', lat: 45.8065, lng: 15.9660, label: 'MIC-CHARLIE (Vehicle)', status: 'degraded', detail: 'Recording · Duration: 1h 44m · Background noise' },
        { id: 'sa4', sourceId: 'audio', lat: 45.8185, lng: 15.9730, label: 'MIC-DELTA (Meeting Rm)', status: 'offline', detail: 'Battery depleted · Last recording: 09:15' },
        // Mobile App - Locator (5)
        { id: 'ml1', sourceId: 'app-locator', lat: 45.8125, lng: 15.9795, label: 'APP-LOC Horvat Phone', status: 'online', detail: 'Accuracy: 3m · Provider: GPS+WiFi · Updated: 30s ago' },
        { id: 'ml2', sourceId: 'app-locator', lat: 45.8080, lng: 15.9870, label: 'APP-LOC Babić Phone', status: 'online', detail: 'Accuracy: 8m · Provider: Cell · Updated: 2m ago' },
        { id: 'ml3', sourceId: 'app-locator', lat: 45.8155, lng: 15.9650, label: 'APP-LOC Suspect Kilo', status: 'online', detail: 'Accuracy: 5m · Provider: GPS · Updated: 45s ago' },
        { id: 'ml4', sourceId: 'app-locator', lat: 45.8040, lng: 15.9780, label: 'APP-LOC Asset Lima', status: 'degraded', detail: 'Accuracy: 150m · Cell only · Last update: 15m ago' },
        { id: 'ml5', sourceId: 'app-locator', lat: 45.8175, lng: 15.9880, label: 'APP-LOC Target Mike', status: 'offline', detail: 'Phone powered off · Last seen: 2h ago' },
        // Mobile App - Photo (3)
        { id: 'mp1', sourceId: 'app-photo', lat: 45.8130, lng: 15.9810, label: 'APP-PHO Horvat Phone', status: 'online', detail: 'Auto-capture: ON · 47 photos today · Storage: 62%' },
        { id: 'mp2', sourceId: 'app-photo', lat: 45.8090, lng: 15.9690, label: 'APP-PHO Babić Phone', status: 'online', detail: 'Auto-capture: ON · 12 photos today · Storage: 84%' },
        { id: 'mp3', sourceId: 'app-photo', lat: 45.8165, lng: 15.9560, label: 'APP-PHO Suspect Kilo', status: 'degraded', detail: 'Auto-capture: OFF · Manual only · Storage: 91%' },
        // Mobile App - Video (3)
        { id: 'mv1', sourceId: 'app-video', lat: 45.8145, lng: 15.9750, label: 'APP-VID Horvat Phone', status: 'online', detail: 'Live stream available · Quality: 720p' },
        { id: 'mv2', sourceId: 'app-video', lat: 45.8060, lng: 15.9810, label: 'APP-VID Babić Phone', status: 'online', detail: 'Recording in background · 2.3 GB captured' },
        { id: 'mv3', sourceId: 'app-video', lat: 45.8195, lng: 15.9640, label: 'APP-VID Target Oscar', status: 'offline', detail: 'No video permission · App restricted' },
        // Mobile App - Audio Recorder (3)
        { id: 'ma1', sourceId: 'app-audio', lat: 45.8128, lng: 15.9820, label: 'APP-AUD Horvat Phone', status: 'online', detail: 'Ambient recording · Duration: 3h 12m · -42dB' },
        { id: 'ma2', sourceId: 'app-audio', lat: 45.8082, lng: 15.9740, label: 'APP-AUD Babić Phone', status: 'online', detail: 'Call recording active · 7 calls intercepted' },
        { id: 'ma3', sourceId: 'app-audio', lat: 45.8170, lng: 15.9900, label: 'APP-AUD Suspect Papa', status: 'degraded', detail: 'Mic permission revoked · Retry pending' },
        // Mobile App - Camera (3)
        { id: 'mc1', sourceId: 'app-camera', lat: 45.8135, lng: 15.9760, label: 'APP-CAM Horvat Phone', status: 'online', detail: 'Front cam accessible · Stealth mode · Last snap: 5m' },
        { id: 'mc2', sourceId: 'app-camera', lat: 45.8070, lng: 15.9850, label: 'APP-CAM Babić Phone', status: 'online', detail: 'Rear cam accessible · Stealth mode · Last snap: 22m' },
        { id: 'mc3', sourceId: 'app-camera', lat: 45.8150, lng: 15.9580, label: 'APP-CAM Target Quebec', status: 'offline', detail: 'Camera blocked by user · App hidden' },
    ];
    const [activeSources, setActiveSources] = useState<Set<SourceId>>(new Set());
    const toggleSource = (id: SourceId) => setActiveSources(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    const toggleSourceGroup = (group: string) => {
        const groupIds = sourceTypes.filter(s => s.group === group).map(s => s.id);
        const allOn = groupIds.every(id => activeSources.has(id));
        setActiveSources(prev => { const n = new Set(prev); groupIds.forEach(id => allOn ? n.delete(id) : n.add(id)); return n; });
    };
    const activeSourceCount = activeSources.size;
    const activeSourceMarkers = mockSourceMarkers.filter(m => activeSources.has(m.sourceId));

    // Layers
    const [layerHeatmap, setLayerHeatmap] = useState(false);
    const [heatmapIntensity, setHeatmapIntensity] = useState(0.6);
    const [heatmapRadius, setHeatmapRadius] = useState(25);
    const [layerNetwork, setLayerNetwork] = useState(false);
    const [networkShowPersons, setNetworkShowPersons] = useState(true);
    const [networkShowOrgs, setNetworkShowOrgs] = useState(true);
    const [networkShowDevices, setNetworkShowDevices] = useState(true);

    // Heatmap mock data — activity hotspots across Zagreb
    const heatmapPoints: [number, number, number][] = [
        // [lng, lat, weight] — high activity areas
        [15.9775, 45.8131, 1.0], [15.9770, 45.8135, 0.9], [15.9780, 45.8128, 0.85], // Ban Jelačić
        [15.9690, 45.8155, 0.7], [15.9700, 45.8150, 0.6], [15.9685, 45.8160, 0.5], // Ilica
        [15.9830, 45.8115, 0.95], [15.9835, 45.8117, 0.8], [15.9825, 45.8112, 0.7], // ASG HQ
        [15.9620, 45.8048, 0.6], [15.9630, 45.8045, 0.5], // Savska
        [15.9930, 45.8100, 0.4], [15.9940, 45.8095, 0.35], // Maksimir
        [15.9710, 45.8000, 0.75], [15.9720, 45.7995, 0.65], [15.9705, 45.8005, 0.55], // Main Station
        [15.9810, 45.8070, 0.5], [15.9800, 45.8075, 0.4], // Safehouse area
        [15.9555, 45.8195, 0.3], [15.9560, 45.8190, 0.25], // Črnomerec
        [16.0010, 45.8060, 0.45], [16.0020, 45.8055, 0.35], // Dubrava
        [15.9850, 45.8210, 0.55], [15.9845, 45.8215, 0.45], // Kaptol
        [15.9760, 45.8142, 0.8], [15.9755, 45.8145, 0.7], // Covert ops area
        [15.9780, 45.8090, 0.6], [15.9790, 45.8085, 0.5], // Mid city
        [15.9650, 45.8155, 0.4], [15.9580, 45.8120, 0.3], // West Zagreb
        [15.9900, 45.8050, 0.5], [15.9880, 45.8060, 0.4], [15.9910, 45.8040, 0.35], // East activity
        [15.9740, 45.8080, 0.55], [15.9730, 45.8085, 0.45], // Central south
        [15.9820, 45.8170, 0.65], [15.9815, 45.8175, 0.5], // North central
    ];

    // Network mock data — connections between entities in Zagreb
    interface NetNode { id: string; type: 'person' | 'org' | 'device'; label: string; lat: number; lng: number; color: string; }
    interface NetEdge { from: string; to: string; strength: number; type: 'financial' | 'family' | 'business' | 'criminal' | 'comms' | 'surveillance'; }
    const netNodes: NetNode[] = [
        { id: 'p1', type: 'person', label: 'Horvat', lat: 45.8150, lng: 15.9819, color: '#ef4444' },
        { id: 'p2', type: 'person', label: 'Kovačević', lat: 45.8050, lng: 15.9670, color: '#f97316' },
        { id: 'p3', type: 'person', label: 'Al-Rashid', lat: 45.7900, lng: 16.0100, color: '#ef4444' },
        { id: 'p7', type: 'person', label: 'Hassan', lat: 45.8200, lng: 15.9900, color: '#f97316' },
        { id: 'p9', type: 'person', label: 'Mendoza', lat: 45.7800, lng: 16.0000, color: '#ef4444' },
        { id: 'p12', type: 'person', label: 'Babić', lat: 45.8080, lng: 15.9750, color: '#f97316' },
        { id: 'o1', type: 'org', label: 'Alpha Security', lat: 45.8115, lng: 15.9830, color: '#3b82f6' },
        { id: 'o2', type: 'org', label: 'Rashid Holdings', lat: 45.7950, lng: 15.9950, color: '#3b82f6' },
        { id: 'o5', type: 'org', label: 'Falcon Trading', lat: 45.8180, lng: 15.9600, color: '#3b82f6' },
        { id: 'o6', type: 'org', label: 'Mendoza IE', lat: 45.7850, lng: 16.0050, color: '#3b82f6' },
        { id: 'd1', type: 'device', label: 'GPS-001', lat: 45.8138, lng: 15.9780, color: '#22c55e' },
        { id: 'd2', type: 'device', label: 'GPS-002', lat: 45.8075, lng: 15.9850, color: '#22c55e' },
        { id: 'd3', type: 'device', label: 'MIC-ALPHA', lat: 45.8133, lng: 15.9770, color: '#f59e0b' },
        { id: 'd4', type: 'device', label: 'OP-HAWK-A', lat: 45.8142, lng: 15.9760, color: '#f59e0b' },
        { id: 'd5', type: 'device', label: 'APP-LOC', lat: 45.8125, lng: 15.9795, color: '#06b6d4' },
    ];
    const netEdges: NetEdge[] = [
        { from: 'p1', to: 'o1', strength: 0.95, type: 'business' },
        { from: 'p12', to: 'o1', strength: 0.9, type: 'business' },
        { from: 'p1', to: 'p12', strength: 0.85, type: 'criminal' },
        { from: 'p3', to: 'o2', strength: 0.95, type: 'financial' },
        { from: 'p7', to: 'o5', strength: 0.8, type: 'business' },
        { from: 'p9', to: 'o6', strength: 0.9, type: 'criminal' },
        { from: 'p3', to: 'p7', strength: 0.6, type: 'financial' },
        { from: 'p1', to: 'p2', strength: 0.5, type: 'comms' },
        { from: 'p9', to: 'p3', strength: 0.4, type: 'financial' },
        { from: 'o1', to: 'o5', strength: 0.3, type: 'business' },
        { from: 'o2', to: 'o6', strength: 0.35, type: 'financial' },
        { from: 'p1', to: 'd1', strength: 0.9, type: 'surveillance' },
        { from: 'p12', to: 'd2', strength: 0.85, type: 'surveillance' },
        { from: 'p1', to: 'd3', strength: 0.8, type: 'surveillance' },
        { from: 'p1', to: 'd4', strength: 0.75, type: 'surveillance' },
        { from: 'p1', to: 'd5', strength: 0.9, type: 'surveillance' },
        { from: 'p2', to: 'o1', strength: 0.45, type: 'comms' },
        { from: 'p7', to: 'p9', strength: 0.35, type: 'criminal' },
    ];
    const edgeColors: Record<string, string> = { financial: '#f59e0b', family: '#ec4899', business: '#3b82f6', criminal: '#ef4444', comms: '#8b5cf6', surveillance: '#22c55e' };

    // LPR Layer
    const [layerLPR, setLayerLPR] = useState(false);
    interface LPRSighting { id: string; plate: string; vehicleId: number; personId: number; personName: string; orgId?: number; orgName?: string; lat: number; lng: number; direction: string; speed: number; confidence: number; cameraId: string; cameraName: string; timestamp: string; photoUrl: string; }
    const mockLPR: LPRSighting[] = [
        { id: 'lpr-1', plate: 'ZG-1234-AB', vehicleId: 1, personId: 1, personName: 'Marko Horvat', orgId: 1, orgName: 'Alpha Security', lat: 45.8131, lng: 15.9775, direction: 'NE', speed: 42, confidence: 98.7, cameraId: 'sc1', cameraName: 'Ban Jelačić Cam', timestamp: '2026-03-23 08:14', photoUrl: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/car_1.jpg' },
        { id: 'lpr-2', plate: 'ZG-1234-AB', vehicleId: 1, personId: 1, personName: 'Marko Horvat', orgId: 1, orgName: 'Alpha Security', lat: 45.8048, lng: 15.9620, direction: 'S', speed: 55, confidence: 96.2, cameraId: 'sc3', cameraName: 'Savska Intersection', timestamp: '2026-03-23 08:22', photoUrl: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/car_1.jpg' },
        { id: 'lpr-3', plate: 'ZG-5678-CD', vehicleId: 2, personId: 12, personName: 'Ivan Babić', orgId: 1, orgName: 'Alpha Security', lat: 45.8100, lng: 15.9930, direction: 'W', speed: 38, confidence: 99.1, cameraId: 'sc4', cameraName: 'Maksimir Entrance', timestamp: '2026-03-23 07:55', photoUrl: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/car_2.jpeg' },
        { id: 'lpr-4', plate: 'ZG-5678-CD', vehicleId: 2, personId: 12, personName: 'Ivan Babić', orgId: 1, orgName: 'Alpha Security', lat: 45.8210, lng: 15.9850, direction: 'N', speed: 28, confidence: 94.8, cameraId: 'sc8', cameraName: 'Kaptol Area Cam', timestamp: '2026-03-23 09:03', photoUrl: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/car_2.jpeg' },
        { id: 'lpr-5', plate: 'SA-9012-RH', vehicleId: 3, personId: 3, personName: 'Ahmed Al-Rashid', orgId: 2, orgName: 'Rashid Holdings', lat: 45.8000, lng: 15.9710, direction: 'E', speed: 60, confidence: 97.5, cameraId: 'sc5', cameraName: 'Main Station South', timestamp: '2026-03-23 10:30', photoUrl: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/car_1.jpg' },
        { id: 'lpr-6', plate: 'SA-3456-RH', vehicleId: 4, personId: 3, personName: 'Ahmed Al-Rashid', orgId: 2, orgName: 'Rashid Holdings', lat: 45.8155, lng: 15.9690, direction: 'SE', speed: 45, confidence: 95.3, cameraId: 'sc2', cameraName: 'Ilica Street Cam', timestamp: '2026-03-23 10:45', photoUrl: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/car_1.jpg' },
        { id: 'lpr-7', plate: 'EG-4567-FT', vehicleId: 7, personId: 7, personName: 'Omar Hassan', orgId: 5, orgName: 'Falcon Trading', lat: 45.8060, lng: 16.0010, direction: 'NW', speed: 52, confidence: 92.1, cameraId: 'sc7', cameraName: 'Dubrava Overpass', timestamp: '2026-03-23 06:18', photoUrl: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/car_2.jpeg' },
        { id: 'lpr-8', plate: 'ZG-UNKN-01', vehicleId: 0, personId: 0, personName: 'Unknown', lat: 45.8195, lng: 15.9555, direction: 'W', speed: 75, confidence: 88.4, cameraId: 'sc6', cameraName: 'Črnomerec Junction', timestamp: '2026-03-22 23:47', photoUrl: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/car_1.jpg' },
        { id: 'lpr-9', plate: 'CO-MEND-99', vehicleId: 0, personId: 9, personName: 'Carlos Mendoza', orgId: 6, orgName: 'Mendoza IE', lat: 45.8088, lng: 15.9680, direction: 'N', speed: 33, confidence: 91.7, cameraId: 'sh2', cameraName: 'OP-HAWK Bravo', timestamp: '2026-03-23 02:12', photoUrl: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/car_2.jpeg' },
    ];

    // Face Recognition Layer
    const [layerFace, setLayerFace] = useState(false);
    interface FaceMatch { id: string; personId: number; personName: string; personAvatar: string; risk: string; lat: number; lng: number; confidence: number; cameraId: string; cameraName: string; timestamp: string; captureUrl: string; emotion: string; wearing: string; }
    const mockFaces: FaceMatch[] = [
        { id: 'fr-1', personId: 1, personName: 'Marko Horvat', personAvatar: mockPersons.find(p => p.id === 1)?.avatar || '', risk: 'Critical', lat: 45.8133, lng: 15.9778, confidence: 97.4, cameraId: 'sc1', cameraName: 'Ban Jelačić Cam', timestamp: '2026-03-23 08:12', captureUrl: mockPersons.find(p => p.id === 1)?.avatar || '', emotion: 'Neutral', wearing: 'Sunglasses, Dark jacket' },
        { id: 'fr-2', personId: 1, personName: 'Marko Horvat', personAvatar: mockPersons.find(p => p.id === 1)?.avatar || '', risk: 'Critical', lat: 45.8115, lng: 15.9830, confidence: 94.2, cameraId: 'sp1', cameraName: 'ASG HQ Interior', timestamp: '2026-03-23 09:45', captureUrl: mockPersons.find(p => p.id === 1)?.avatar || '', emotion: 'Focused', wearing: 'Suit, No glasses' },
        { id: 'fr-3', personId: 12, personName: 'Ivan Babić', personAvatar: '', risk: 'High', lat: 45.8105, lng: 15.9935, confidence: 92.8, cameraId: 'sc4', cameraName: 'Maksimir Entrance', timestamp: '2026-03-23 07:30', captureUrl: '', emotion: 'Neutral', wearing: 'Cap, Windbreaker' },
        { id: 'fr-4', personId: 3, personName: 'Ahmed Al-Rashid', personAvatar: mockPersons.find(p => p.id === 3)?.avatar || '', risk: 'Critical', lat: 45.8002, lng: 15.9715, confidence: 89.5, cameraId: 'sc5', cameraName: 'Main Station South', timestamp: '2026-03-23 10:28', captureUrl: mockPersons.find(p => p.id === 3)?.avatar || '', emotion: 'Phone call', wearing: 'White thobe, Briefcase' },
        { id: 'fr-5', personId: 7, personName: 'Omar Hassan', personAvatar: mockPersons.find(p => p.id === 7)?.avatar || '', risk: 'High', lat: 45.8062, lng: 16.0015, confidence: 86.3, cameraId: 'sc7', cameraName: 'Dubrava Overpass', timestamp: '2026-03-23 06:15', captureUrl: mockPersons.find(p => p.id === 7)?.avatar || '', emotion: 'Alert', wearing: 'Leather jacket, Bag' },
        { id: 'fr-6', personId: 9, personName: 'Carlos Mendoza', personAvatar: '', risk: 'Critical', lat: 45.8090, lng: 15.9685, confidence: 78.1, cameraId: 'sh2', cameraName: 'OP-HAWK Bravo', timestamp: '2026-03-23 02:10', captureUrl: '', emotion: 'Suspicious', wearing: 'Hoodie, Mask (partial)' },
        { id: 'fr-7', personId: 2, personName: 'Ana Kovačević', personAvatar: mockPersons.find(p => p.id === 2)?.avatar || '', risk: 'High', lat: 45.8142, lng: 15.9762, confidence: 95.6, cameraId: 'sh1', cameraName: 'OP-HAWK Alpha', timestamp: '2026-03-23 11:02', captureUrl: mockPersons.find(p => p.id === 2)?.avatar || '', emotion: 'Conversation', wearing: 'Red coat, Scarf' },
        { id: 'fr-8', personId: 0, personName: 'Unknown Subject', personAvatar: '', risk: 'Unknown', lat: 45.8170, lng: 15.9810, confidence: 0, cameraId: 'sh3', cameraName: 'OP-HAWK Charlie', timestamp: '2026-03-23 04:33', captureUrl: '', emotion: 'Unknown', wearing: 'Dark clothing, Hood' },
        { id: 'fr-9', personId: 4, personName: 'Elena Petrova', personAvatar: mockPersons.find(p => p.id === 4)?.avatar || '', risk: 'Medium', lat: 45.8070, lng: 15.9755, confidence: 91.0, cameraId: 'sp3', cameraName: 'Safehouse Bravo', timestamp: '2026-03-22 22:18', captureUrl: mockPersons.find(p => p.id === 4)?.avatar || '', emotion: 'Neutral', wearing: 'Business attire' },
        { id: 'fr-10', personId: 10, personName: 'Li Wei', personAvatar: '', risk: 'Medium', lat: 45.8200, lng: 15.9605, confidence: 83.7, cameraId: 'sc6', cameraName: 'Črnomerec Junction', timestamp: '2026-03-22 19:45', captureUrl: '', emotion: 'Hurried', wearing: 'Backpack, Glasses' },
    ];

    // ═══ TIMELINE ═══
    const [timelineOpen, setTimelineOpen] = useState(false);
    const [timelinePlaying, setTimelinePlaying] = useState(false);
    const [timelineSpeed, setTimelineSpeed] = useState(1);
    const [timelineCursor, setTimelineCursor] = useState(100); // 0..100 %
    const [tlFilterTypes, setTlFilterTypes] = useState<Set<string>>(new Set(['lpr', 'face', 'source', 'zone', 'object']));
    const [tlPersonIds, setTlPersonIds] = useState<Set<number>>(new Set()); // filter by persons
    const [tlOrgIds, setTlOrgIds] = useState<Set<number>>(new Set()); // filter by orgs
    const [tlAutoMarkers, setTlAutoMarkers] = useState(true); // show markers for visible events
    const [tlLoop, setTlLoop] = useState(false); // loop playback
    const [tlAutoFollow, setTlAutoFollow] = useState(false); // auto-center on latest event
    const [tlTrackingPerson, setTlTrackingPerson] = useState<number | null>(null); // person being tracked
    const [tlTracking3D, setTlTracking3D] = useState(false); // 3D tracking mode
    const [tlTrackStep, setTlTrackStep] = useState(-1); // current step in tracking animation
    const [tlShowPersonPanel, setTlShowPersonPanel] = useState(false);
    const timelinePlayRef = useRef<number | null>(null);
    const tlEventMarkersRef = useRef<any[]>([]);
    const tlTrackLineRef = useRef<boolean>(false);
    const timelineActive = timelineOpen && timelineCursor < 100;
    const [tlLightbox, setTlLightbox] = useState<string | null>(null);
    const [tlMarkerCtx, setTlMarkerCtx] = useState<{ x: number; y: number; ev: any } | null>(null);
    const [tlHiddenIds, setTlHiddenIds] = useState<Set<string>>(new Set());
    const timeAgo = (ts: string) => { const d = Date.now() - new Date(ts.replace(' ', 'T')).getTime(); const m = Math.floor(d / 60000); if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ${m % 60}m ago`; return `${Math.floor(h / 24)}d ago`; };
    const mockAddress = (lat: number, lng: number) => { const streets = ['Ilica', 'Jurišićeva', 'Savska cesta', 'Vukovarska', 'Maksimirska', 'Zvonimirova', 'Draškovićeva', 'Vlaška', 'Hebrangova', 'Preradovićeva']; const num = Math.floor(((lat * 1000 + lng * 1000) % 50) + 1); const idx = Math.floor(((lat * 10000 + lng * 10000) % streets.length)); return `${streets[idx]} ${num}, Zagreb`; };
    const tlOccurrences = (ev: any) => { if (ev.type === 'face' && ev.personId) return allTLEvents.filter((e: any) => e.type === 'face' && e.personId === ev.personId).length; if (ev.type === 'lpr' && ev.plate) return allTLEvents.filter((e: any) => e.type === 'lpr' && e.plate === ev.plate).length; return 1; };

    // Objects
    type ObjType = 'marker' | 'line' | 'rectangle' | 'polygon' | 'freehand' | 'circle';
    interface MapObject { id: string; type: ObjType; name: string; color: string; coords: [number, number][]; visible: boolean; assignedTo?: { type: 'person' | 'org'; id: string; name: string } | null; createdAt: string; }
    const objTypeLabels: Record<ObjType, { icon: string; label: string }> = { marker: { icon: '📌', label: 'Marker' }, line: { icon: '📏', label: 'Line' }, rectangle: { icon: '⬜', label: 'Rectangle' }, polygon: { icon: '⬡', label: 'Polygon' }, freehand: { icon: '✏️', label: 'Freehand' }, circle: { icon: '⭕', label: 'Circle' } };
    const objColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    const defaultObjects: MapObject[] = [
        { id: 'obj-1', type: 'marker', name: 'Observation Point Alpha', color: '#ef4444', coords: [[15.9790, 45.8140]], visible: true, assignedTo: { type: 'person', id: '1', name: 'Marko Horvat' }, createdAt: '2026-03-20 14:30' },
        { id: 'obj-2', type: 'line', name: 'Suspect Route A', color: '#f59e0b', coords: [[15.9750, 45.8130], [15.9800, 45.8110], [15.9850, 45.8125]], visible: true, assignedTo: { type: 'person', id: '12', name: 'Ivan Babić' }, createdAt: '2026-03-19 09:15' },
        { id: 'obj-3', type: 'rectangle', name: 'Surveillance Area B', color: '#3b82f6', coords: [[15.9700, 45.8070], [15.9750, 45.8070], [15.9750, 45.8090], [15.9700, 45.8090]], visible: true, assignedTo: { type: 'org', id: '1', name: 'Alpha Security Group' }, createdAt: '2026-03-18 16:45' },
        { id: 'obj-4', type: 'circle', name: 'Dead Drop Radius', color: '#22c55e', coords: [[15.9820, 45.8170]], visible: true, assignedTo: null, createdAt: '2026-03-17 11:00' },
        { id: 'obj-5', type: 'polygon', name: 'Parking Lot Perimeter', color: '#8b5cf6', coords: [[15.9600, 45.8155], [15.9630, 45.8165], [15.9645, 45.8150], [15.9625, 45.8138], [15.9605, 45.8142]], visible: true, assignedTo: null, createdAt: '2026-03-16 08:20' },
    ];
    const [mapObjects, setMapObjects] = useState<MapObject[]>(defaultObjects);
    const [objSearch, setObjSearch] = useState('');
    const [objDrawing, setObjDrawing] = useState<{ type: ObjType; points: [number, number][] } | null>(null);
    const [objModal, setObjModal] = useState<{ mode: 'add' | 'edit'; obj?: MapObject } | null>(null);
    const [objForm, setObjForm] = useState({ name: '', color: '#3b82f6', assignType: '' as '' | 'person' | 'org', assignId: '' });
    const [objDeleteConfirm, setObjDeleteConfirm] = useState<MapObject | null>(null);
    const [mapCtxMenu, setMapCtxMenu] = useState<{ x: number; y: number; lngLat: [number, number] } | null>(null);
    const [objCtxMenu, setObjCtxMenu] = useState<{ x: number; y: number; obj: MapObject } | null>(null);
    const [placingMarker, setPlacingMarker] = useState(false);

    const filteredObjects = mapObjects.filter(o => !objSearch || o.name.toLowerCase().includes(objSearch.toLowerCase()) || o.type.includes(objSearch.toLowerCase()));
    const toggleObjVisibility = (id: string) => setMapObjects(prev => prev.map(o => o.id === id ? { ...o, visible: !o.visible } : o));
    const deleteObj = () => { if (objDeleteConfirm) { setMapObjects(prev => prev.filter(o => o.id !== objDeleteConfirm.id)); setObjDeleteConfirm(null); } };
    const openEditObj = (o: MapObject) => { setObjForm({ name: o.name, color: o.color, assignType: o.assignedTo?.type || '', assignId: o.assignedTo?.id || '' }); setObjModal({ mode: 'edit', obj: o }); };
    const startObjDraw = (type: ObjType) => { setObjDrawing({ type, points: [] }); setMapCtxMenu(null); setObjCtxMenu(null); setRulerActive(false); setZoneDrawing(null); setPlacingMarker(false); };
    const startPlacingMarker = () => { setPlacingMarker(true); setMapCtxMenu(null); setObjCtxMenu(null); setObjDrawing(null); setRulerActive(false); setZoneDrawing(null); };
    const placeMarkerAt = (lngLat: [number, number]) => {
        setPlacingMarker(false);
        setObjForm({ name: '', color: '#ef4444', assignType: '', assignId: '' });
        const obj: MapObject = { id: `obj-${Date.now()}`, type: 'marker', name: '', color: '#ef4444', coords: [lngLat], visible: true, assignedTo: null, createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') };
        setObjModal({ mode: 'add', obj });
    };
    const saveObj = () => {
        if (!objForm.name.trim()) return;
        const assignedTo = objForm.assignType && objForm.assignId ? { type: objForm.assignType as 'person' | 'org', id: objForm.assignId, name: (objForm.assignType === 'person' ? personOpts : orgOpts).find(o => o.id === objForm.assignId)?.label || '?' } : null;
        if (objModal?.mode === 'edit' && objModal.obj) {
            setMapObjects(prev => prev.map(o => o.id === objModal.obj!.id ? { ...o, name: objForm.name.trim(), color: objForm.color, assignedTo } : o));
        } else if (objModal?.obj) {
            setMapObjects(prev => [...prev, { ...objModal.obj!, name: objForm.name.trim(), color: objForm.color, assignedTo }]);
        }
        setObjModal(null);
    };
    const goToObj = (o: MapObject) => { if (o.coords.length > 0) mapRef.current?.flyTo({ center: o.coords[0], zoom: 16, duration: 1200 }); };

    // Settings
    const [showMinimap, setShowMinimap] = useState(true);
    const [showCompass, setShowCompass] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [showLocalization, setShowLocalization] = useState(false);
    const [showCoords, setShowCoords] = useState(false);
    const [showSearch, setShowSearch] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    const [showZones, setShowZones] = useState(true);
    const [showFps, setShowFps] = useState(false);

    // Saved Places
    interface SavedPlace { id: string; name: string; lat: number; lng: number; zoom: number; color: string; note?: string; }
    const defaultPlaces: SavedPlace[] = [
        { id: 'sp-1', name: 'Zagreb', lat: 45.8150, lng: 15.9819, zoom: 13, color: '#3b82f6', note: 'Croatia — ARGUX HQ' },
        { id: 'sp-2', name: 'Riyadh', lat: 24.7136, lng: 46.6753, zoom: 11, color: '#f59e0b', note: 'Saudi Arabia — Region HQ' },
        { id: 'sp-3', name: 'Sydney', lat: -33.8688, lng: 151.2093, zoom: 12, color: '#22c55e', note: 'Australia — APAC Operations' },
    ];
    const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(defaultPlaces);
    const [placesSearch, setPlacesSearch] = useState('');
    const [placeModal, setPlaceModal] = useState<{ mode: 'add' | 'edit'; place?: SavedPlace } | null>(null);
    const [placeForm, setPlaceForm] = useState({ name: '', lat: '', lng: '', zoom: '13', color: '#3b82f6', note: '' });
    const [deleteConfirm, setDeleteConfirm] = useState<SavedPlace | null>(null);
    const placeColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    const openAddPlace = () => { setPlaceForm({ name: '', lat: '', lng: '', zoom: '13', color: '#3b82f6', note: '' }); setPlaceModal({ mode: 'add' }); };
    const openEditPlace = (p: SavedPlace) => { setPlaceForm({ name: p.name, lat: p.lat.toString(), lng: p.lng.toString(), zoom: p.zoom.toString(), color: p.color, note: p.note || '' }); setPlaceModal({ mode: 'edit', place: p }); };
    const savePlace = () => {
        const { name, lat, lng, zoom, color, note } = placeForm;
        if (!name.trim() || !lat || !lng) return;
        const entry: SavedPlace = { id: placeModal?.place?.id || `sp-${Date.now()}`, name: name.trim(), lat: parseFloat(lat), lng: parseFloat(lng), zoom: parseInt(zoom) || 13, color, note: note.trim() || undefined };
        if (placeModal?.mode === 'edit') { setSavedPlaces(prev => prev.map(p => p.id === entry.id ? entry : p)); }
        else { setSavedPlaces(prev => [...prev, entry]); }
        setPlaceModal(null);
    };
    const confirmDeletePlace = () => { if (deleteConfirm) { setSavedPlaces(prev => prev.filter(p => p.id !== deleteConfirm.id)); setDeleteConfirm(null); } };
    const goToPlace = (p: SavedPlace) => { mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: p.zoom, duration: 1500, essential: true }); };
    const addCurrentLocation = () => {
        const map = mapRef.current;
        if (!map) return;
        const c = map.getCenter();
        const z = Math.round(map.getZoom());
        setPlaceForm({ name: '', lat: c.lat.toFixed(5), lng: c.lng.toFixed(5), zoom: z.toString(), color: '#3b82f6', note: '' });
        setPlaceModal({ mode: 'add' });
    };
    const filteredPlaces = savedPlaces.filter(p => !placesSearch || p.name.toLowerCase().includes(placesSearch.toLowerCase()) || (p.note || '').toLowerCase().includes(placesSearch.toLowerCase()));

    // Ruler Tool
    interface RulerPoint { lat: number; lng: number; }
    const [rulerActive, setRulerActive] = useState(false);
    const [rulerPoints, setRulerPoints] = useState<RulerPoint[]>([]);
    const rulerSourceRef = useRef(false);

    const calcDistance = (points: RulerPoint[]): number => {
        let total = 0;
        for (let i = 1; i < points.length; i++) {
            const R = 6371000; // meters
            const dLat = (points[i].lat - points[i - 1].lat) * Math.PI / 180;
            const dLng = (points[i].lng - points[i - 1].lng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(points[i - 1].lat * Math.PI / 180) * Math.cos(points[i].lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
            total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }
        return total;
    };
    const formatDist = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;

    // Draw ruler line + points on map
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;

        const updateRulerLayer = () => {
            const m = mapRef.current;
            if (!m) return;
            const geojson: any = { type: 'FeatureCollection', features: [] };
            if (rulerPoints.length >= 2) {
                geojson.features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: rulerPoints.map(p => [p.lng, p.lat]) }, properties: {} });
            }
            rulerPoints.forEach((p, i) => {
                geojson.features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.lng, p.lat] }, properties: { index: i } });
            });

            try {
                if (m.getSource('ruler-source')) {
                    (m.getSource('ruler-source') as any).setData(geojson);
                } else {
                    m.addSource('ruler-source', { type: 'geojson', data: geojson });
                    m.addLayer({ id: 'ruler-line', type: 'line', source: 'ruler-source', filter: ['==', '$type', 'LineString'], paint: { 'line-color': '#f59e0b', 'line-width': 2.5, 'line-dasharray': [3, 2] } });
                    m.addLayer({ id: 'ruler-points', type: 'circle', source: 'ruler-source', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': 5, 'circle-color': '#f59e0b', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
                    rulerSourceRef.current = true;
                }
            } catch {}
        };

        if (rulerActive || rulerPoints.length > 0) {
            updateRulerLayer();
        } else {
            // Clean up
            try { if (map.getLayer('ruler-line')) map.removeLayer('ruler-line'); } catch {}
            try { if (map.getLayer('ruler-points')) map.removeLayer('ruler-points'); } catch {}
            try { if (map.getSource('ruler-source')) map.removeSource('ruler-source'); } catch {}
            rulerSourceRef.current = false;
        }
    }, [rulerPoints, rulerActive, loaded]);

    // Ruler click handler
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded || !rulerActive) return;
        const handler = (e: any) => { setRulerPoints(prev => [...prev, { lat: e.lngLat.lat, lng: e.lngLat.lng }]); };
        map.on('click', handler);
        map.getCanvas().style.cursor = 'crosshair';
        return () => { map.off('click', handler); if (mapRef.current) mapRef.current.getCanvas().style.cursor = ''; };
    }, [rulerActive, loaded]);

    const clearRuler = () => { setRulerPoints([]); };
    const undoRulerPoint = () => { setRulerPoints(prev => prev.slice(0, -1)); };
    const stopRuler = () => { setRulerActive(false); };

    // Zone Editor
    type ZoneShape = 'circle' | 'polygon';
    type ZoneType = 'restricted' | 'monitored' | 'surveillance' | 'safe' | 'exclusion' | 'operations' | 'buffer' | 'quarantine';
    interface MapZone { id: string; name: string; shape: ZoneShape; type: ZoneType; color: string; lat: number; lng: number; radius?: number; points?: { lat: number; lng: number }[]; }
    const zoneTypes: { id: ZoneType; label: string; icon: string }[] = [
        { id: 'restricted', label: 'Restricted', icon: '🚫' },
        { id: 'monitored', label: 'Monitored', icon: '👁️' },
        { id: 'surveillance', label: 'Surveillance', icon: '📡' },
        { id: 'safe', label: 'Safe', icon: '✅' },
        { id: 'exclusion', label: 'Exclusion', icon: '⛔' },
        { id: 'operations', label: 'Operations', icon: '🎯' },
        { id: 'buffer', label: 'Buffer', icon: '🔶' },
        { id: 'quarantine', label: 'Quarantine', icon: '☣️' },
    ];
    const defaultZones: MapZone[] = [
        { id: 'z-1', name: 'ASG HQ Perimeter', shape: 'circle', type: 'restricted', color: '#ef4444', lat: 45.8050, lng: 15.9719, radius: 300 },
        { id: 'z-2', name: 'Zagreb Central Monitoring', shape: 'circle', type: 'monitored', color: '#3b82f6', lat: 45.8131, lng: 15.9775, radius: 800 },
        { id: 'z-3', name: 'Maksimir Park Surveillance', shape: 'polygon', type: 'surveillance', color: '#8b5cf6', lat: 45.822, lng: 16.018, points: [{ lat: 45.825, lng: 16.012 }, { lat: 45.826, lng: 16.022 }, { lat: 45.820, lng: 16.024 }, { lat: 45.818, lng: 16.016 }] },
        { id: 'z-4', name: 'Airport Safe Zone', shape: 'circle', type: 'safe', color: '#22c55e', lat: 45.7429, lng: 16.0688, radius: 1200 },
        { id: 'z-5', name: 'Dubrava Exclusion Area', shape: 'polygon', type: 'exclusion', color: '#f97316', lat: 45.827, lng: 16.045, points: [{ lat: 45.830, lng: 16.040 }, { lat: 45.832, lng: 16.050 }, { lat: 45.825, lng: 16.052 }, { lat: 45.823, lng: 16.042 }] },
        { id: 'z-6', name: 'Jarun Operations Zone', shape: 'circle', type: 'operations', color: '#06b6d4', lat: 45.7825, lng: 15.9300, radius: 500 },
        { id: 'z-7', name: 'Sava River Buffer', shape: 'polygon', type: 'buffer', color: '#f59e0b', lat: 45.800, lng: 15.975, points: [{ lat: 45.803, lng: 15.960 }, { lat: 45.803, lng: 15.990 }, { lat: 45.797, lng: 15.990 }, { lat: 45.797, lng: 15.960 }] },
    ];
    const [zones, setZones] = useState<MapZone[]>(defaultZones);
    const [hiddenZones, setHiddenZones] = useState<Set<string>>(new Set());
    const [zoneSearch, setZoneSearch] = useState('');
    const [zoneModal, setZoneModal] = useState<{ mode: 'add' | 'edit'; zone?: MapZone } | null>(null);
    const [zoneForm, setZoneForm] = useState({ name: '', shape: 'circle' as ZoneShape, type: 'monitored' as ZoneType, color: '#3b82f6', lat: '', lng: '', radius: '500' });
    const [zoneDeleteConfirm, setZoneDeleteConfirm] = useState<MapZone | null>(null);
    const [zoneDrawing, setZoneDrawing] = useState<{ shape: ZoneShape; points: { lat: number; lng: number }[] } | null>(null);
    const [zoneCtxMenu, setZoneCtxMenu] = useState<{ x: number; y: number; zone: MapZone } | null>(null);
    const [zoneAddStep, setZoneAddStep] = useState<'pick' | 'form' | null>(null);
    const [zoneEventsPanel, setZoneEventsPanel] = useState<MapZone | null>(null);
    const zoneColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    // ═══ TIMELINE COMPUTED (depends on zones) ═══
    interface TLEvent { id: string; type: string; icon: string; title: string; sub: string; ts: string; lat: number; lng: number; sev: string; color: string; personId?: number; orgId?: number; personName?: string; photoUrl?: string; orgName?: string; cameraId?: string; cameraName?: string; confidence?: number; risk?: string; plate?: string; speed?: number; direction?: string; vehicleId?: number; vehicleMake?: string; vehicleModel?: string; vehicleType?: string; emotion?: string; wearing?: string; }
    const allTLEvents = useMemo<TLEvent[]>(() => {
        const evts: TLEvent[] = [
            ...mockLPR.map(l => { const v = mockVehicles.find(vv => vv.id === l.vehicleId); return { id: l.id, type: 'lpr', icon: '🚗', title: `LPR: ${l.plate}`, sub: `${l.personName} · ${l.cameraName} · ${l.speed}km/h ${l.direction}`, ts: l.timestamp, lat: l.lat, lng: l.lng, sev: l.confidence >= 95 ? 'high' : 'medium', color: '#10b981', personId: l.personId, orgId: l.orgId, personName: l.personName, orgName: l.orgName, photoUrl: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/registration_plate.jpg', cameraId: l.cameraId, cameraName: l.cameraName, confidence: l.confidence, plate: l.plate, speed: l.speed, direction: l.direction, vehicleId: l.vehicleId, vehicleMake: v?.make, vehicleModel: v?.model, vehicleType: v?.type, risk: v?.risk }; }),
            ...mockFaces.map(f => ({ id: f.id, type: 'face', icon: '🧑‍🦲', title: `Face: ${f.personName}`, sub: `${f.confidence}% · ${f.cameraName} · ${f.emotion}`, ts: f.timestamp, lat: f.lat, lng: f.lng, sev: f.risk === 'Critical' ? 'critical' : f.risk === 'High' ? 'high' : 'medium', color: '#ec4899', personId: f.personId, personName: f.personName, photoUrl: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', cameraId: f.cameraId, cameraName: f.cameraName, confidence: f.confidence, risk: f.risk, emotion: f.emotion, wearing: f.wearing })),
            ...zones.flatMap(z => { const s = z.id.charCodeAt(z.id.length - 1); const pids = [1, 12, 0]; return [0, 1, 2].map(i => { const h = (s * 3 + i * 7) % 24; const m = (s * 11 + i * 17) % 60; const labels = ['Entry', 'Exit', 'Breach']; const names = ['Marko Horvat', 'Ivan Babić', 'Unknown']; return { id: `ze-${z.id}-${i}`, type: 'zone', icon: '🛡️', title: `Zone ${labels[i]}: ${z.name}`, sub: `${names[i]} · ${z.type}`, ts: `2026-03-23 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, lat: z.lat, lng: z.lng, sev: z.type === 'restricted' ? 'critical' : 'info', color: z.color, personId: pids[i], personName: names[i] }; }); }),
            { id: 'se1', type: 'source', icon: '📹', title: 'Camera: Motion Detected', sub: 'Ban Jelačić Cam · Zone A perimeter', ts: '2026-03-23 07:42', lat: 45.8131, lng: 15.9775, sev: 'info', color: '#3b82f6' },
            { id: 'se2', type: 'source', icon: '🎙️', title: 'Audio: Keyword Detected', sub: 'MIC-ALPHA · "delivery" ×3', ts: '2026-03-23 09:15', lat: 45.8133, lng: 15.977, sev: 'high', color: '#f59e0b', personId: 1, personName: 'Marko Horvat' },
            { id: 'se3', type: 'source', icon: '📡', title: 'GPS: Speed Alert', sub: 'GPS-004 >70km/h in monitored zone', ts: '2026-03-23 05:30', lat: 45.802, lng: 15.995, sev: 'high', color: '#22c55e', personId: 7, personName: 'Omar Hassan' },
            { id: 'se4', type: 'source', icon: '📱', title: 'Mobile: Signal Lost', sub: 'Target Mike phone powered off', ts: '2026-03-23 03:45', lat: 45.8175, lng: 15.988, sev: 'critical', color: '#06b6d4', personId: 9, personName: 'Carlos Mendoza' },
            { id: 'se5', type: 'source', icon: '📹', title: 'Camera: Offline', sub: 'Črnomerec Junction', ts: '2026-03-22 18:00', lat: 45.8195, lng: 15.9555, sev: 'low', color: '#3b82f6' },
            { id: 'se6', type: 'source', icon: '🔴', title: 'Covert: Battery Low', sub: 'OP-HAWK Charlie 23%', ts: '2026-03-23 06:00', lat: 45.817, lng: 15.981, sev: 'medium', color: '#ef4444' },
            { id: 'oe1', type: 'object', icon: '📌', title: 'Marker: Observation Alpha', sub: 'By Mitchell · Assigned Horvat', ts: '2026-03-20 14:30', lat: 45.814, lng: 15.979, sev: 'info', color: '#ef4444', personId: 1, personName: 'Marko Horvat' },
            { id: 'oe2', type: 'object', icon: '📏', title: 'Route: Suspect Route A', sub: 'Tracking Babić movement', ts: '2026-03-19 09:15', lat: 45.813, lng: 15.975, sev: 'info', color: '#f59e0b', personId: 12, personName: 'Ivan Babić' },
        ];
        return evts.sort((a, b) => a.ts.localeCompare(b.ts));
    }, [zones]);

    // Period-filtered events (dateFrom/dateTo from sidebar)
    const periodFilteredEvents = useMemo(() => {
        let evts = allTLEvents;
        if (dateFrom) { const d = new Date(dateFrom + 'T00:00:00').getTime(); evts = evts.filter(e => new Date(e.ts.replace(' ', 'T')).getTime() >= d); }
        if (dateTo) { const d = new Date(dateTo + 'T23:59:59').getTime(); evts = evts.filter(e => new Date(e.ts.replace(' ', 'T')).getTime() <= d); }
        return evts;
    }, [allTLEvents, dateFrom, dateTo]);

    // Person/Org + type filtered
    const filteredTLEvents = useMemo(() => {
        let evts = periodFilteredEvents.filter(e => tlFilterTypes.has(e.type));
        if (tlPersonIds.size > 0) evts = evts.filter(e => e.personId && tlPersonIds.has(e.personId));
        if (tlOrgIds.size > 0) evts = evts.filter(e => e.orgId && tlOrgIds.has(e.orgId));
        return evts;
    }, [periodFilteredEvents, tlFilterTypes, tlPersonIds, tlOrgIds]);

    const tlStart = filteredTLEvents.length > 0 ? new Date(filteredTLEvents[0].ts.replace(' ', 'T')).getTime() : Date.now() - 86400000;
    const tlEnd = filteredTLEvents.length > 0 ? new Date(filteredTLEvents[filteredTLEvents.length - 1].ts.replace(' ', 'T')).getTime() : Date.now();
    const tlRange = Math.max(tlEnd - tlStart, 1);
    const tlCursorMs = tlStart + (timelineCursor / 100) * tlRange;
    const fmtTlTime = (ms: number) => { const d = new Date(ms); return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

    const visibleTLEvents = filteredTLEvents.filter(e => new Date(e.ts.replace(' ', 'T')).getTime() <= tlCursorMs && !tlHiddenIds.has(e.id));

    // Density bars
    const tlDensity = useMemo(() => {
        const buckets = new Array(50).fill(0);
        filteredTLEvents.forEach(e => {
            const t = new Date(e.ts.replace(' ', 'T')).getTime();
            const idx = Math.min(49, Math.floor(((t - tlStart) / tlRange) * 50));
            buckets[idx]++;
        });
        const max = Math.max(...buckets, 1);
        return buckets.map(b => b / max);
    }, [filteredTLEvents, tlStart, tlRange]);

    // Unique persons in events for person picker
    const tlPersonOptions = useMemo(() => {
        const map = new Map<number, string>();
        allTLEvents.forEach(e => { if (e.personId && e.personId > 0 && e.personName) map.set(e.personId, e.personName); });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
    }, [allTLEvents]);

    // Tracking: events for tracked person
    const tlTrackEvents = useMemo(() => {
        if (!tlTrackingPerson) return [];
        return filteredTLEvents.filter(e => e.personId === tlTrackingPerson);
    }, [tlTrackingPerson, filteredTLEvents]);

    // Playback loop
    useEffect(() => {
        if (!timelinePlaying) { if (timelinePlayRef.current) clearInterval(timelinePlayRef.current); timelinePlayRef.current = null; return; }
        timelinePlayRef.current = window.setInterval(() => {
            setTimelineCursor(prev => {
                const n = prev + 0.15 * timelineSpeed;
                if (n >= 100) { if (tlLoop) return 0; setTimelinePlaying(false); return 100; }
                return n;
            });
        }, 50);
        return () => { if (timelinePlayRef.current) clearInterval(timelinePlayRef.current); };
    }, [timelinePlaying, timelineSpeed, tlLoop]);

    const toggleTlFilter = (t: string) => setTlFilterTypes(p => { const n = new Set(p); n.has(t) ? n.delete(t) : n.add(t); return n; });
    const toggleTlPerson = (id: number) => setTlPersonIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

    // Timeline stats
    const tlStats = useMemo(() => {
        const visible = visibleTLEvents;
        const total = filteredTLEvents.length;
        const bySev = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
        const byType: Record<string, number> = {};
        const uniquePersons = new Set<number>();
        visible.forEach(e => {
            bySev[e.sev as keyof typeof bySev] = (bySev[e.sev as keyof typeof bySev] || 0) + 1;
            byType[e.type] = (byType[e.type] || 0) + 1;
            if (e.personId && e.personId > 0) uniquePersons.add(e.personId);
        });
        // Events per hour rate
        const visMs = visible.length >= 2 ? new Date(visible[visible.length - 1].ts.replace(' ', 'T')).getTime() - new Date(visible[0].ts.replace(' ', 'T')).getTime() : 3600000;
        const rate = visible.length > 0 ? (visible.length / (visMs / 3600000)).toFixed(1) : '0';
        return { total, shown: visible.length, bySev, byType, uniquePersons: uniquePersons.size, rate };
    }, [visibleTLEvents, filteredTLEvents]);

    // Auto-follow: center map on latest visible event during playback
    useEffect(() => {
        if (!tlAutoFollow || !timelinePlaying || visibleTLEvents.length === 0) return;
        const last = visibleTLEvents[visibleTLEvents.length - 1];
        const map = mapRef.current;
        if (map) map.easeTo({ center: [last.lng, last.lat], duration: 300 });
    }, [visibleTLEvents.length, tlAutoFollow, timelinePlaying]);

    // Zoom to fit all visible events
    const tlZoomToFit = () => {
        const map = mapRef.current;
        const ml = (window as any).maplibregl;
        if (!map || !ml || visibleTLEvents.length === 0) return;
        if (visibleTLEvents.length === 1) { map.flyTo({ center: [visibleTLEvents[0].lng, visibleTLEvents[0].lat], zoom: 15, duration: 600 }); return; }
        const bounds = new ml.LngLatBounds();
        visibleTLEvents.forEach(e => bounds.extend([e.lng, e.lat]));
        map.fitBounds(bounds, { padding: 60, duration: 800 });
    };

    // Jump to next critical event from cursor
    const tlJumpToCritical = () => {
        const next = filteredTLEvents.find(e => {
            const t = new Date(e.ts.replace(' ', 'T')).getTime();
            return t > tlCursorMs && e.sev === 'critical';
        });
        if (next) {
            const pct = Math.min(100, ((new Date(next.ts.replace(' ', 'T')).getTime() - tlStart) / tlRange) * 100);
            setTimelineCursor(pct);
            setTimelinePlaying(false);
            const map = mapRef.current;
            if (map) map.flyTo({ center: [next.lng, next.lat], zoom: 16, duration: 800 });
        }
    };

    // Timeline event markers on map
    useEffect(() => {
        tlEventMarkersRef.current.forEach(m => m.remove());
        tlEventMarkersRef.current = [];
        const map = mapRef.current;
        const ml = (window as any).maplibregl;
        if (!map || !ml || !loaded || !timelineOpen || !tlAutoMarkers) return;
        visibleTLEvents.forEach((ev, i) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'tmap-marker-source';
            wrapper.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:visible;';
            const inner = document.createElement('div');
            inner.className = 'tmap-marker-inner tmap-tl-event-dot';
            const sevColor = ev.sev === 'critical' ? '#ef4444' : ev.sev === 'high' ? '#f97316' : ev.sev === 'medium' ? '#f59e0b' : ev.sev === 'low' ? '#6b7280' : '#3b82f6';
            const isFace = ev.type === 'face';
            const isLPR = ev.type === 'lpr';
            const hasPhoto = isFace || isLPR;
            if (hasPhoto) {
                const borderRadius = isFace ? '50%' : '5px';
                const size = isFace ? 30 : 28;
                inner.style.cssText = `width:${size}px;height:${size}px;border-radius:${borderRadius};border:2.5px solid ${ev.color};background:url(${ev.photoUrl}) center/cover;box-shadow:0 0 10px ${ev.color}60,0 2px 8px rgba(0,0,0,0.5);position:relative;overflow:visible;`;
                const badge = document.createElement('div');
                badge.style.cssText = `position:absolute;bottom:-3px;right:-3px;width:14px;height:14px;border-radius:${isFace ? '50%' : '3px'};background:${ev.color};border:1.5px solid rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;font-size:7px;pointer-events:none;`;
                badge.textContent = isFace ? '👤' : '🚗';
                inner.appendChild(badge);
                const sevDot = document.createElement('div');
                sevDot.style.cssText = `position:absolute;top:-2px;left:-2px;width:8px;height:8px;border-radius:50%;background:${sevColor};border:1.5px solid rgba(13,18,32,0.9);pointer-events:none;`;
                inner.appendChild(sevDot);
            } else {
                inner.style.cssText = `width:26px;height:26px;border-radius:6px;border:2px solid ${ev.color};background:rgba(13,18,32,0.92);box-shadow:0 0 8px ${ev.color}50,0 2px 6px rgba(0,0,0,0.4);position:relative;overflow:visible;display:flex;align-items:center;justify-content:center;font-size:13px;`;
                inner.textContent = ev.icon;
                const sevDot = document.createElement('div');
                sevDot.style.cssText = `position:absolute;top:-2px;right:-2px;width:7px;height:7px;border-radius:50%;background:${sevColor};border:1.5px solid rgba(13,18,32,0.9);pointer-events:none;`;
                inner.appendChild(sevDot);
            }
            if (i >= visibleTLEvents.length - 5) {
                const pulse = document.createElement('div');
                pulse.className = 'tmap-tl-pulse';
                pulse.style.cssText = `position:absolute;inset:-6px;border-radius:${isFace ? '50%' : '8px'};border:1.5px solid ${ev.color};opacity:0;pointer-events:none;`;
                inner.appendChild(pulse);
            }
            wrapper.appendChild(inner);
            const marker = new ml.Marker({ element: wrapper, anchor: 'center' }).setLngLat([ev.lng, ev.lat]).addTo(map);
            wrapper.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                const addr = mockAddress(ev.lat, ev.lng);
                const ago = timeAgo(ev.ts);
                const occ = tlOccurrences(ev);
                const riskColor = ev.risk === 'Critical' ? '#ef4444' : ev.risk === 'High' ? '#f97316' : ev.risk === 'Medium' ? '#f59e0b' : '#6b7280';
                const confColor = (ev.confidence || 0) >= 90 ? '#22c55e' : (ev.confidence || 0) >= 75 ? '#f59e0b' : '#ef4444';
                let popupHtml = '';
                if (isFace) {
                    popupHtml = `<div class="tmap-popup-card"><div style="position:relative;border-bottom:1px solid var(--ax-border)"><img src="${ev.photoUrl}" class="tmap-popup-photo" data-lightbox="${ev.photoUrl}" style="width:100%;height:100px;object-fit:cover;display:block;cursor:zoom-in;" /><div style="position:absolute;top:6px;right:6px;display:flex;gap:3px"><span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.6);color:${riskColor};backdrop-filter:blur(4px)">${ev.risk || 'Unknown'}</span><span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.6);color:${confColor};backdrop-filter:blur(4px)">${ev.confidence || 0}%</span></div></div><div class="tmap-popup-header" style="gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:#ec489915;border:1.5px solid #ec489940;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🧑‍🦲</div><div class="tmap-popup-hinfo"><div class="tmap-popup-name" style="font-size:12px">${ev.personId && ev.personId > 0 ? `<a href="/persons/${ev.personId}" style="color:var(--ax-accent);text-decoration:none">${ev.personName}</a>` : ev.personName || 'Unknown'}</div><div class="tmap-popup-meta"><span style="font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;background:${sevColor}15;color:${sevColor};border:1px solid ${sevColor}30">${ev.sev.toUpperCase()}</span><span style="font-size:8px;font-weight:600;padding:1px 5px;border-radius:3px;background:#ec489915;color:#ec4899;border:1px solid #ec489930">FACE</span></div></div></div><div class="tmap-popup-grid"><div class="tmap-popup-row"><span class="tmap-popup-label">📍 Address</span><span class="tmap-popup-val">${addr}</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">🕐 Time</span><span class="tmap-popup-val">${ev.ts} <span style="color:var(--ax-text-dim);font-size:9px">(${ago})</span></span></div><div class="tmap-popup-row"><span class="tmap-popup-label">🎯 Confidence</span><span class="tmap-popup-val" style="color:${confColor};font-weight:700">${ev.confidence}%</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">⚠️ Risk</span><span class="tmap-popup-val" style="color:${riskColor};font-weight:600">${ev.risk || 'Unknown'}</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">📊 Occurrences</span><span class="tmap-popup-val">${occ} sightings</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">😐 Emotion</span><span class="tmap-popup-val">${ev.emotion || '—'}</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">👕 Wearing</span><span class="tmap-popup-val">${ev.wearing || '—'}</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">📹 Camera</span><span class="tmap-popup-val"><a href="/devices/${ev.cameraId}" style="color:var(--ax-accent);text-decoration:none">${ev.cameraName}</a></span></div></div><div class="tmap-popup-coords">${ev.lat.toFixed(5)}, ${ev.lng.toFixed(5)}</div></div>`;
                } else if (isLPR) {
                    popupHtml = `<div class="tmap-popup-card"><div style="position:relative;border-bottom:1px solid var(--ax-border)"><img src="${ev.photoUrl}" class="tmap-popup-photo" data-lightbox="${ev.photoUrl}" style="width:100%;height:80px;object-fit:cover;display:block;cursor:zoom-in;" /><div style="position:absolute;bottom:6px;left:6px;font-size:16px;font-weight:800;font-family:'JetBrains Mono',monospace;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.8);letter-spacing:0.06em">${ev.plate || ''}</div><div style="position:absolute;top:6px;right:6px;display:flex;gap:3px"><span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.6);color:#10b981;backdrop-filter:blur(4px)">${ev.confidence || 0}%</span></div></div><div class="tmap-popup-header" style="gap:8px"><div style="width:28px;height:28px;border-radius:5px;background:#10b98115;border:1.5px solid #10b98140;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🚗</div><div class="tmap-popup-hinfo"><div class="tmap-popup-name" style="font-size:12px;font-family:'JetBrains Mono',monospace;letter-spacing:0.04em">${ev.plate || ''}</div><div class="tmap-popup-meta"><span style="font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;background:${sevColor}15;color:${sevColor};border:1px solid ${sevColor}30">${ev.sev.toUpperCase()}</span><span style="font-size:8px;font-weight:600;padding:1px 5px;border-radius:3px;background:#10b98115;color:#10b981;border:1px solid #10b98130">LPR</span></div></div></div><div class="tmap-popup-grid"><div class="tmap-popup-row"><span class="tmap-popup-label">📍 Address</span><span class="tmap-popup-val">${addr}</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">👤 Owner</span><span class="tmap-popup-val">${ev.personId && ev.personId > 0 ? `<a href="/persons/${ev.personId}" style="color:var(--ax-accent);text-decoration:none">${ev.personName}</a>` : ev.personName || 'Unknown'}${ev.orgName ? ` · <a href="/organizations/${ev.orgId}" style="color:var(--ax-accent);text-decoration:none">${ev.orgName}</a>` : ''}</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">🕐 Time</span><span class="tmap-popup-val">${ev.ts} <span style="color:var(--ax-text-dim);font-size:9px">(${ago})</span></span></div><div class="tmap-popup-row"><span class="tmap-popup-label">⚠️ Risk</span><span class="tmap-popup-val" style="color:${riskColor};font-weight:600">${ev.risk || 'Unknown'}</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">📊 Occurrences</span><span class="tmap-popup-val">${occ} sightings</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">🧭 Speed</span><span class="tmap-popup-val">${ev.direction || '—'} at ${ev.speed || 0} km/h</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">🚙 Vehicle</span><span class="tmap-popup-val">${ev.vehicleType || '—'} · ${ev.vehicleMake || ''} ${ev.vehicleModel || ''}</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">📹 Camera</span><span class="tmap-popup-val"><a href="/devices/${ev.cameraId}" style="color:var(--ax-accent);text-decoration:none">${ev.cameraName}</a></span></div></div><div class="tmap-popup-coords">${ev.lat.toFixed(5)}, ${ev.lng.toFixed(5)}</div></div>`;
                } else {
                    popupHtml = `<div class="tmap-popup-card"><div class="tmap-popup-header" style="gap:8px"><div style="width:28px;height:28px;border-radius:6px;background:${ev.color}15;border:1.5px solid ${ev.color}40;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${ev.icon}</div><div class="tmap-popup-hinfo"><div class="tmap-popup-name" style="font-size:12px">${ev.title}</div><div class="tmap-popup-meta"><span style="font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;background:${sevColor}15;color:${sevColor};border:1px solid ${sevColor}30">${ev.sev.toUpperCase()}</span><span style="font-size:8px;font-weight:600;padding:1px 5px;border-radius:3px;background:${ev.color}15;color:${ev.color};border:1px solid ${ev.color}30">${ev.type.toUpperCase()}</span></div></div></div><div class="tmap-popup-grid"><div class="tmap-popup-row"><span class="tmap-popup-label">📍 Address</span><span class="tmap-popup-val">${addr}</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">📋 Details</span><span class="tmap-popup-val">${ev.sub}</span></div><div class="tmap-popup-row"><span class="tmap-popup-label">🕐 Time</span><span class="tmap-popup-val">${ev.ts} <span style="color:var(--ax-text-dim);font-size:9px">(${ago})</span></span></div>${ev.personName ? `<div class="tmap-popup-row"><span class="tmap-popup-label">👤 Person</span><span class="tmap-popup-val" style="color:var(--ax-accent)">${ev.personName}</span></div>` : ''}</div><div class="tmap-popup-coords">${ev.lat.toFixed(5)}, ${ev.lng.toFixed(5)}</div></div>`;
                }
                const popup = new ml.Popup({ offset: hasPhoto ? 18 : 14, maxWidth: '300px', className: 'tmap-popup' }).setLngLat([ev.lng, ev.lat]).setHTML(popupHtml).addTo(map);
                setTimeout(() => { popup.getElement()?.querySelectorAll('.tmap-popup-photo').forEach((img: any) => { img.addEventListener('click', (pe: Event) => { pe.stopPropagation(); setTlLightbox(img.getAttribute('data-lightbox')); }); }); }, 50);
            });
            wrapper.addEventListener('contextmenu', (e: Event) => {
                e.preventDefault(); e.stopPropagation();
                const me = e as MouseEvent;
                const rect = mapContainer.current?.getBoundingClientRect();
                if (rect) setTlMarkerCtx({ x: me.clientX - rect.left, y: me.clientY - rect.top, ev });
            });
            tlEventMarkersRef.current.push(marker);
        });
        return () => { tlEventMarkersRef.current.forEach(m => m.remove()); tlEventMarkersRef.current = []; };
    }, [visibleTLEvents, timelineOpen, tlAutoMarkers, loaded]);

    // Tracking animation: fly from event to event
    const tlTrackAnimRef = useRef<number | null>(null);
    const startTracking = (personId: number, use3D: boolean) => {
        setTlTrackingPerson(personId);
        setTlTracking3D(use3D);
        setTlTrackStep(0);
        setTimelineCursor(0);
        setTimelinePlaying(false);
        // Auto-select person filter
        setTlPersonIds(new Set([personId]));
    };
    const stopTracking = () => {
        setTlTrackingPerson(null);
        setTlTrackStep(-1);
        if (tlTrackAnimRef.current) { cancelAnimationFrame(tlTrackAnimRef.current); tlTrackAnimRef.current = null; }
        // Clean up track line
        const map = mapRef.current;
        if (map) { try { if (map.getLayer('tl-track-line')) map.removeLayer('tl-track-line'); if (map.getSource('tl-track-src')) map.removeSource('tl-track-src'); } catch {} }
        tlTrackLineRef.current = false;
    };
    // Tracking step effect
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded || !tlTrackingPerson || tlTrackStep < 0) return;
        const evts = tlTrackEvents;
        if (evts.length === 0 || tlTrackStep >= evts.length) { stopTracking(); return; }
        const ev = evts[tlTrackStep];
        // Move cursor to this event's time
        const evTime = new Date(ev.ts.replace(' ', 'T')).getTime();
        const pct = Math.min(100, Math.max(0, ((evTime - tlStart) / tlRange) * 100));
        setTimelineCursor(pct);
        // Draw accumulated track line
        const lineCoords = evts.slice(0, tlTrackStep + 1).map(e => [e.lng, e.lat]);
        const geojson: any = { type: 'FeatureCollection', features: lineCoords.length >= 2 ? [{ type: 'Feature', geometry: { type: 'LineString', coordinates: lineCoords }, properties: {} }] : [] };
        try {
            if (map.getSource('tl-track-src')) { (map.getSource('tl-track-src') as any).setData(geojson); }
            else { map.addSource('tl-track-src', { type: 'geojson', data: geojson }); map.addLayer({ id: 'tl-track-line', type: 'line', source: 'tl-track-src', paint: { 'line-color': '#3b82f6', 'line-width': 3, 'line-opacity': 0.7, 'line-dasharray': [2, 2] } }); tlTrackLineRef.current = true; }
        } catch {}
        // Fly to event
        map.flyTo({ center: [ev.lng, ev.lat], zoom: tlTracking3D ? 17 : 16, pitch: tlTracking3D ? 60 : 0, bearing: tlTracking3D && tlTrackStep > 0 ? (() => { const prev = evts[tlTrackStep - 1]; const dx = ev.lng - prev.lng; const dy = ev.lat - prev.lat; return (Math.atan2(dx, dy) * 180 / Math.PI); })() : 0, duration: 1500 });
        // Auto-advance after pause
        const timer = setTimeout(() => {
            if (tlTrackStep < evts.length - 1) setTlTrackStep(s => s + 1);
            else stopTracking();
        }, 2000 + (1500 / timelineSpeed));
        return () => clearTimeout(timer);
    }, [tlTrackStep, tlTrackingPerson, loaded]);

    const openAddZone = () => { setZoneForm({ name: '', shape: 'circle', type: 'monitored', color: '#3b82f6', lat: '', lng: '', radius: '500' }); setZoneAddStep('pick'); setZoneModal(null); };
    const openAddZoneManual = (shape: ZoneShape) => {
        const map = mapRef.current;
        const c = map ? map.getCenter() : { lat: 45.815, lng: 15.982 };
        setZoneForm({ name: '', shape, type: 'monitored', color: '#3b82f6', lat: c.lat.toFixed(5), lng: (c as any).lng.toFixed(5), radius: '500' });
        setZoneAddStep(null); setZoneModal({ mode: 'add' });
    };
    const startDrawAndClose = (shape: ZoneShape) => { setZoneAddStep(null); startDrawZone(shape); };
    const openEditZone = (z: MapZone) => { setZoneForm({ name: z.name, shape: z.shape, type: z.type, color: z.color, lat: z.lat.toString(), lng: z.lng.toString(), radius: (z.radius || 500).toString() }); setZoneModal({ mode: 'edit', zone: z }); };
    const saveZone = () => {
        const { name, shape, type, color, lat, lng, radius } = zoneForm;
        if (!name.trim() || !lat || !lng) return;
        const entry: MapZone = { id: zoneModal?.zone?.id || `z-${Date.now()}`, name: name.trim(), shape, type, color, lat: parseFloat(lat), lng: parseFloat(lng), radius: shape === 'circle' ? (parseInt(radius) || 500) : undefined, points: zoneModal?.zone?.points };
        if (zoneModal?.mode === 'edit') setZones(prev => prev.map(z => z.id === entry.id ? entry : z));
        else setZones(prev => [...prev, entry]);
        setZoneModal(null);
    };
    const confirmDeleteZone = () => { if (zoneDeleteConfirm) { setZones(prev => prev.filter(z => z.id !== zoneDeleteConfirm.id)); setZoneDeleteConfirm(null); } };
    const goToZone = (z: MapZone) => { mapRef.current?.flyTo({ center: [z.lng, z.lat], zoom: z.radius ? Math.max(13, 16 - Math.log2((z.radius || 500) / 100)) : 14, duration: 1200 }); };
    const startDrawZone = (shape: ZoneShape) => { setZoneDrawing({ shape, points: [] }); setRulerActive(false); };
    const toggleZoneVisibility = (id: string) => { setHiddenZones(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
    const filteredZones = zones.filter(z => !zoneSearch || z.name.toLowerCase().includes(zoneSearch.toLowerCase()) || z.type.includes(zoneSearch.toLowerCase()));

    // Mock zone events
    const zoneEventTypes = ['Entry', 'Exit', 'Breach', 'Patrol', 'Sighting', 'Alert', 'Scan', 'Checkpoint'] as const;
    const getZoneEvents = (z: MapZone) => {
        const seed = z.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const count = 5 + (seed % 8);
        const events: { id: string; type: string; person: string; time: string; detail: string; severity: 'critical' | 'warning' | 'info' }[] = [];
        const persons = ['Marko Horvat', 'Viktor Petrović', 'Elena Vasquez', 'Sergei Volkov', 'Ahmed Al-Rashid', 'Ana Kovačević', 'Unknown Subject', 'Vehicle #ZG-4421'];
        const severities: ('critical' | 'warning' | 'info')[] = ['critical', 'warning', 'info', 'info', 'warning', 'info', 'critical', 'info'];
        for (let i = 0; i < count; i++) {
            const h = ((seed * (i + 1) * 7) % 24); const m = ((seed * (i + 1) * 13) % 60);
            const d = ((seed * (i + 1)) % 28) + 1;
            events.push({
                id: `ev-${z.id}-${i}`,
                type: zoneEventTypes[(seed + i * 3) % zoneEventTypes.length],
                person: persons[(seed + i * 5) % persons.length],
                time: `2026-03-${String(d).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
                detail: [`Detected at perimeter`, `Crossed boundary heading north`, `Stationary for 12 min`, `LPR match confirmed`, `Face match 94.2%`, `Signal lost after 3 min`, `Device handshake captured`, `Unauthorized access attempt`][(seed + i * 2) % 8],
                severity: severities[(seed + i) % severities.length],
            });
        }
        return events.sort((a, b) => b.time.localeCompare(a.time));
    };

    // Circle GeoJSON helper (approximation with 64 segments)
    const circleToPolygon = (lat: number, lng: number, radiusM: number, segments = 64): number[][] => {
        const coords: number[][] = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            const dLat = (radiusM / 6371000) * (180 / Math.PI);
            const dLng = dLat / Math.cos(lat * Math.PI / 180);
            coords.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]);
        }
        return coords;
    };

    // Draw zones on map
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        const geojson: any = { type: 'FeatureCollection', features: [] };
        zones.forEach(z => {
            if (hiddenZones.has(z.id)) return; // skip hidden zones
            const zHeight = z.type === 'restricted' ? 100 : z.type === 'exclusion' ? 90 : z.type === 'operations' ? 70 : z.type === 'surveillance' ? 60 : z.type === 'monitored' ? 50 : z.type === 'quarantine' ? 80 : z.type === 'buffer' ? 30 : 40;
            if (z.shape === 'circle' && z.radius) {
                geojson.features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [circleToPolygon(z.lat, z.lng, z.radius)] }, properties: { id: z.id, color: z.color, name: z.name, height: zHeight } });
            } else if (z.shape === 'polygon' && z.points && z.points.length >= 3) {
                const coords = z.points.map(p => [p.lng, p.lat]);
                coords.push(coords[0]); // close polygon
                geojson.features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: { id: z.id, color: z.color, name: z.name, height: zHeight } });
            }
        });
        // Drawing preview
        if (zoneDrawing && zoneDrawing.points.length >= 2) {
            const coords = zoneDrawing.points.map(p => [p.lng, p.lat]);
            if (zoneDrawing.shape === 'polygon' && coords.length >= 3) { coords.push(coords[0]); geojson.features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: { id: 'drawing', color: '#ffffff', name: 'Drawing...' } }); }
            else { geojson.features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: { id: 'drawing-line' } }); }
        }
        try {
            if (map.getSource('zones-source')) { (map.getSource('zones-source') as any).setData(geojson); }
            else {
                map.addSource('zones-source', { type: 'geojson', data: geojson });
                map.addLayer({ id: 'zones-fill', type: 'fill', source: 'zones-source', filter: ['==', '$type', 'Polygon'], paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.12 } });
                map.addLayer({ id: 'zones-outline', type: 'line', source: 'zones-source', filter: ['==', '$type', 'Polygon'], paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': 0.6 } });
                map.addLayer({ id: 'zones-drawing-line', type: 'line', source: 'zones-source', filter: ['==', '$type', 'LineString'], paint: { 'line-color': '#ffffff', 'line-width': 2, 'line-dasharray': [4, 3] } });
            }
        } catch {}
    }, [zones, zoneDrawing, hiddenZones, loaded]);

    // Zone draw click handler
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded || !zoneDrawing) return;
        const handler = (e: any) => { setZoneDrawing(prev => prev ? { ...prev, points: [...prev.points, { lat: e.lngLat.lat, lng: e.lngLat.lng }] } : null); };
        const dblHandler = (e: any) => {
            e.preventDefault();
            if (!zoneDrawing || zoneDrawing.points.length < 2) return;
            if (zoneDrawing.shape === 'circle') {
                const ctr = zoneDrawing.points[0];
                const edge = zoneDrawing.points[zoneDrawing.points.length - 1];
                const R = 6371000; const dLat = (edge.lat - ctr.lat) * Math.PI / 180; const dLng = (edge.lng - ctr.lng) * Math.PI / 180;
                const a = Math.sin(dLat / 2) ** 2 + Math.cos(ctr.lat * Math.PI / 180) * Math.cos(edge.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
                const radius = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
                setZoneForm(f => ({ ...f, shape: 'circle', lat: ctr.lat.toFixed(5), lng: ctr.lng.toFixed(5), radius: radius.toString() }));
                setZoneModal({ mode: 'add' });
            } else {
                const pts = zoneDrawing.points;
                const cLat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
                const cLng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
                const newZone: MapZone = { id: `z-${Date.now()}`, name: '', shape: 'polygon', type: 'monitored', color: '#3b82f6', lat: cLat, lng: cLng, points: pts };
                setZoneForm(f => ({ ...f, shape: 'polygon', lat: cLat.toFixed(5), lng: cLng.toFixed(5) }));
                setZoneModal({ mode: 'add', zone: newZone });
            }
            setZoneDrawing(null);
        };
        map.on('click', handler);
        map.on('dblclick', dblHandler);
        map.getCanvas().style.cursor = 'crosshair';
        return () => { map.off('click', handler); map.off('dblclick', dblHandler); if (mapRef.current) mapRef.current.getCanvas().style.cursor = ''; };
    }, [zoneDrawing, loaded]);

    // Zone right-click context menu
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        const ctxHandler = (e: any) => {
            const zFillLayers = ['zones-fill', 'zones-fill-3d'].filter(l => map.getLayer(l));
            const features = map.queryRenderedFeatures(e.point, { layers: zFillLayers });
            if (features && features.length > 0) {
                e.preventDefault();
                const fid = features[0].properties?.id;
                const zone = zones.find(z => z.id === fid);
                if (zone) { setZoneCtxMenu({ x: e.point.x, y: e.point.y, zone }); setMarkerCtxMenu(null); }
            }
        };
        const closeCtx = () => { setZoneCtxMenu(null); setMarkerCtxMenu(null); setMapCtxMenu(null); setObjCtxMenu(null); };
        map.on('contextmenu', ctxHandler);
        map.on('click', closeCtx);
        map.on('movestart', closeCtx);
        return () => { map.off('contextmenu', ctxHandler); map.off('click', closeCtx); map.off('movestart', closeCtx); };
    }, [zones, loaded]);

    // Close zone ctx menu on outside click
    useEffect(() => { const h = () => { setZoneCtxMenu(null); setMarkerCtxMenu(null); setMapCtxMenu(null); setObjCtxMenu(null); }; window.addEventListener('click', h); return () => window.removeEventListener('click', h); }, []);

    // Subject markers on map (persons + organizations)
    const markersRef = useRef<any[]>([]);
    const [markerCtxMenu, setMarkerCtxMenu] = useState<{ x: number; y: number; type: 'person' | 'org'; id: number; name: string; img: string; riskColor: string } | null>(null);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        // Remove old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        const ml = (window as any).maplibregl;
        if (!ml) return;

        // Add person markers
        selectedPersons.forEach(pid => {
            const p = mockPersons.find(x => x.id.toString() === pid);
            if (!p || !p.addresses?.[0]) return;
            const addr = p.addresses[0];
            const mc = cityCoords[addr.city];
            if (!mc) return;
            const offset = ((p.id * 0.003) % 0.02) - 0.01;
            const riskColor = p.risk === 'Critical' ? '#ef4444' : p.risk === 'High' ? '#f97316' : p.risk === 'Medium' ? '#f59e0b' : '#22c55e';
            const el = document.createElement('div');
            el.className = 'tmap-marker-person';
            el.innerHTML = `<div class="tmap-marker-inner" style="width:32px;height:32px;border-radius:50%;border:2.5px solid ${riskColor};background:url(${p.avatar}) center/cover;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`;
            const lngLat: [number, number] = [mc[0] + offset, mc[1] + offset * 0.7];
            const marker = new ml.Marker({ element: el, anchor: 'center' }).setLngLat(lngLat).addTo(map);
            // Click → popup
            const job = p.employment?.[0];
            const lastSeenH = Math.floor(((p.id * 7 + 3) % 48));
            const lastSeen = lastSeenH < 1 ? 'Just now' : lastSeenH < 24 ? `${lastSeenH}h ago` : `${Math.floor(lastSeenH / 24)}d ago`;
            const statusColor = p.status === 'Active' ? '#22c55e' : p.status === 'Inactive' ? '#6b7280' : p.status === 'Under Review' ? '#f59e0b' : '#ef4444';
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                new ml.Popup({ offset: 20, maxWidth: '280px', className: 'tmap-popup' })
                    .setLngLat(lngLat)
                    .setHTML(`<div class="tmap-popup-card">
                        <div class="tmap-popup-header">
                            <img src="${p.avatar}" class="tmap-popup-avatar" />
                            <div class="tmap-popup-hinfo">
                                <div class="tmap-popup-name">${p.firstName} ${p.lastName}${p.nickname ? ` <span class="tmap-popup-nick">"${p.nickname}"</span>` : ''}</div>
                                <div class="tmap-popup-meta">
                                    <span class="tmap-popup-risk" style="background:${riskColor}15;color:${riskColor};border:1px solid ${riskColor}30">${p.risk}</span>
                                    <span class="tmap-popup-status"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${statusColor};margin-right:3px"></span>${p.status}</span>
                                </div>
                            </div>
                        </div>
                        <div class="tmap-popup-grid">
                            <div class="tmap-popup-row"><span class="tmap-popup-label">📞 Phone</span><span class="tmap-popup-val">${p.phone || '—'}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">✉️ Email</span><span class="tmap-popup-val">${p.email || '—'}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">🏢 Work</span><span class="tmap-popup-val">${job ? `${job.title} at ${job.company}` : '—'}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">🌍 Nationality</span><span class="tmap-popup-val">${p.nationality}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">📍 Address</span><span class="tmap-popup-val">${addr.address} ${addr.addressNumber}, ${addr.city}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">🎂 DOB</span><span class="tmap-popup-val">${p.dob}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">⏱️ Last Seen</span><span class="tmap-popup-val">${lastSeen}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">🔑 Tax ID</span><span class="tmap-popup-val">${p.taxNumber || '—'}</span></div>
                        </div>
                        <div class="tmap-popup-coords">${lngLat[1].toFixed(5)}, ${lngLat[0].toFixed(5)}</div>
                    </div>`).addTo(map);
            });
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault(); e.stopPropagation();
                const rect = mapContainer.current?.getBoundingClientRect();
                if (rect) { setMarkerCtxMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, type: 'person', id: p.id, name: `${p.firstName} ${p.lastName}`, img: p.avatar || '', riskColor }); setZoneCtxMenu(null); }
            });
            markersRef.current.push(marker);
        });

        // Add organization markers
        selectedOrgs.forEach(oid => {
            const o = mockOrganizations.find(x => x.id.toString() === oid);
            if (!o || !o.addresses?.[0]) return;
            const addr = o.addresses[0];
            const mc = cityCoords[addr.city];
            if (!mc) return;
            const offset = ((o.id * 0.004) % 0.02) - 0.008;
            const riskColor = o.risk === 'Critical' ? '#ef4444' : o.risk === 'High' ? '#f97316' : o.risk === 'Medium' ? '#f59e0b' : '#22c55e';
            const imgSrc = o.logo || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(o.name)}&backgroundColor=1e3a5f`;
            const el = document.createElement('div');
            el.className = 'tmap-marker-org';
            el.innerHTML = `<div class="tmap-marker-inner" style="width:32px;height:32px;border-radius:6px;border:2.5px solid ${riskColor};background:url(${imgSrc}) center/cover #0d1220;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`;
            const lngLat: [number, number] = [mc[0] + offset, mc[1] - offset * 0.6];
            const marker = new ml.Marker({ element: el, anchor: 'center' }).setLngLat(lngLat).addTo(map);
            // Click → popup
            const website = o.websites?.[0]?.url || '';
            const empCount = 10 + ((o.id * 17) % 490);
            const linkedCount = o.linkedPersons?.length || 0;
            const statusColor = o.status === 'Active' ? '#22c55e' : o.status === 'Inactive' ? '#6b7280' : o.status === 'Under Review' ? '#f59e0b' : '#ef4444';
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                new ml.Popup({ offset: 20, maxWidth: '280px', className: 'tmap-popup' })
                    .setLngLat(lngLat)
                    .setHTML(`<div class="tmap-popup-card">
                        <div class="tmap-popup-header">
                            <img src="${imgSrc}" class="tmap-popup-avatar" style="border-radius:6px" />
                            <div class="tmap-popup-hinfo">
                                <div class="tmap-popup-name">${o.name}</div>
                                <div class="tmap-popup-meta">
                                    <span class="tmap-popup-risk" style="background:${riskColor}15;color:${riskColor};border:1px solid ${riskColor}30">${o.risk}</span>
                                    <span class="tmap-popup-status"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${statusColor};margin-right:3px"></span>${o.status}</span>
                                </div>
                            </div>
                        </div>
                        <div class="tmap-popup-grid">
                            <div class="tmap-popup-row"><span class="tmap-popup-label">👤 CEO</span><span class="tmap-popup-val">${o.ceo || '—'}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">👑 Owner</span><span class="tmap-popup-val">${o.owner || '—'}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">🏭 Industry</span><span class="tmap-popup-val">${o.industry}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">🌐 Website</span><span class="tmap-popup-val">${website ? `<a href="${website}" target="_blank" style="color:#3b82f6">${website.replace('https://', '')}</a>` : '—'}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">📍 Address</span><span class="tmap-popup-val">${addr.address} ${addr.addressNumber}, ${addr.city}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">🌍 Country</span><span class="tmap-popup-val">${o.country}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">📋 VAT</span><span class="tmap-popup-val">${o.vat || '—'}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">👥 Linked</span><span class="tmap-popup-val">${linkedCount} person${linkedCount !== 1 ? 's' : ''}</span></div>
                            <div class="tmap-popup-row"><span class="tmap-popup-label">📊 Employees</span><span class="tmap-popup-val">~${empCount}</span></div>
                        </div>
                        <div class="tmap-popup-coords">${lngLat[1].toFixed(5)}, ${lngLat[0].toFixed(5)}</div>
                    </div>`).addTo(map);
            });
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault(); e.stopPropagation();
                const rect = mapContainer.current?.getBoundingClientRect();
                if (rect) { setMarkerCtxMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, type: 'org', id: o.id, name: o.name, img: imgSrc, riskColor }); setZoneCtxMenu(null); }
            });
            markersRef.current.push(marker);
        });

        return () => { markersRef.current.forEach(m => m.remove()); markersRef.current = []; };
    }, [selectedPersons, selectedOrgs, loaded]);

    // Source markers on map
    const sourceMarkersRef = useRef<any[]>([]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        sourceMarkersRef.current.forEach(m => m.remove());
        sourceMarkersRef.current = [];
        const ml = (window as any).maplibregl;
        if (!ml) return;
        activeSourceMarkers.forEach(sm => {
            const st = sourceTypes.find(s => s.id === sm.sourceId);
            if (!st) return;
            const statusDot = sm.status === 'online' ? '#22c55e' : sm.status === 'degraded' ? '#f59e0b' : '#6b7280';
            const el = document.createElement('div');
            el.className = 'tmap-marker-source';
            const borderRadius = st.shape === 'circle' ? '50%' : st.shape === 'diamond' ? '4px' : '4px';
            const rotate = st.shape === 'diamond' ? 'transform:rotate(45deg);' : '';
            const innerRotate = st.shape === 'diamond' ? 'transform:rotate(-45deg);' : '';
            el.innerHTML = `<div class="tmap-marker-inner" style="width:26px;height:26px;border-radius:${borderRadius};border:2px solid ${st.color};background:rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.5);${rotate}"><span style="font-size:12px;line-height:1;${innerRotate}">${st.icon}</span></div><div class="tmap-marker-status" style="background:${statusDot}"></div>`;
            const lngLat: [number, number] = [sm.lng, sm.lat];
            const marker = new ml.Marker({ element: el, anchor: 'center' }).setLngLat(lngLat).addTo(map);
            el.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                new ml.Popup({ offset: 16, maxWidth: '240px', className: 'tmap-popup' })
                    .setLngLat(lngLat)
                    .setHTML(`<div class="tmap-popup-card">
                        <div class="tmap-popup-header" style="gap:8px">
                            <span style="font-size:20px">${st.icon}</span>
                            <div class="tmap-popup-hinfo">
                                <div class="tmap-popup-name" style="font-size:12px">${sm.label}</div>
                                <div class="tmap-popup-meta">
                                    <span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px;background:${st.color}15;color:${st.color};border:1px solid ${st.color}30">${st.label}</span>
                                    <span class="tmap-popup-status"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${statusDot};margin-right:3px"></span>${sm.status}</span>
                                </div>
                            </div>
                        </div>
                        <div style="padding:8px 14px;font-size:10px;color:var(--ax-text-dim);line-height:1.5">${sm.detail}</div>
                        <div class="tmap-popup-coords">${lngLat[1].toFixed(5)}, ${lngLat[0].toFixed(5)}</div>
                    </div>`).addTo(map);
            });
            sourceMarkersRef.current.push(marker);
        });
        return () => { sourceMarkersRef.current.forEach(m => m.remove()); sourceMarkersRef.current = []; };
    }, [activeSources, loaded]);

    // Heatmap layer
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        try {
            if (layerHeatmap) {
                const geojson: any = { type: 'FeatureCollection', features: heatmapPoints.map((p, i) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p[0], p[1]] }, properties: { weight: p[2], id: i } })) };
                if (map.getSource('heatmap-source')) {
                    (map.getSource('heatmap-source') as any).setData(geojson);
                } else {
                    map.addSource('heatmap-source', { type: 'geojson', data: geojson });
                    map.addLayer({
                        id: 'heatmap-layer', type: 'heatmap', source: 'heatmap-source',
                        paint: {
                            'heatmap-weight': ['get', 'weight'],
                            'heatmap-intensity': heatmapIntensity,
                            'heatmap-radius': heatmapRadius,
                            'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', 0.2, 'rgba(59,130,246,0.3)', 0.4, 'rgba(34,197,94,0.5)', 0.6, 'rgba(245,158,11,0.7)', 0.8, 'rgba(239,68,68,0.85)', 1, 'rgba(255,255,255,1)'],
                            'heatmap-opacity': 0.75,
                        }
                    }, map.getLayer('zones-fill') ? 'zones-fill' : map.getLayer('zones-fill-3d') ? 'zones-fill-3d' : undefined);
                }
                map.setPaintProperty('heatmap-layer', 'heatmap-intensity', heatmapIntensity);
                map.setPaintProperty('heatmap-layer', 'heatmap-radius', heatmapRadius);
            } else {
                if (map.getLayer('heatmap-layer')) map.removeLayer('heatmap-layer');
                if (map.getSource('heatmap-source')) map.removeSource('heatmap-source');
            }
        } catch {}
    }, [layerHeatmap, heatmapIntensity, heatmapRadius, loaded]);

    // Network layer
    const networkMarkersRef = useRef<any[]>([]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        networkMarkersRef.current.forEach(m => m.remove());
        networkMarkersRef.current = [];
        try {
            if (layerNetwork) {
                const visibleNodes = netNodes.filter(n => (n.type === 'person' && networkShowPersons) || (n.type === 'org' && networkShowOrgs) || (n.type === 'device' && networkShowDevices));
                const visibleIds = new Set(visibleNodes.map(n => n.id));
                const visibleEdges = netEdges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));
                const edgeFeatures = visibleEdges.map(e => {
                    const from = netNodes.find(n => n.id === e.from)!;
                    const to = netNodes.find(n => n.id === e.to)!;
                    return { type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates: [[from.lng, from.lat], [to.lng, to.lat]] }, properties: { color: edgeColors[e.type] || '#6b7280', width: 1 + e.strength * 3, type: e.type, opacity: 0.3 + e.strength * 0.5 } };
                });
                const geojson: any = { type: 'FeatureCollection', features: edgeFeatures };
                if (map.getSource('network-source')) {
                    (map.getSource('network-source') as any).setData(geojson);
                } else {
                    map.addSource('network-source', { type: 'geojson', data: geojson });
                    map.addLayer({ id: 'network-lines', type: 'line', source: 'network-source', paint: { 'line-color': ['get', 'color'], 'line-width': ['get', 'width'], 'line-opacity': ['get', 'opacity'], 'line-dasharray': [3, 2] } });
                }
                // Node markers
                const ml = (window as any).maplibregl;
                if (ml) {
                    visibleNodes.forEach(n => {
                        const el = document.createElement('div');
                        el.className = 'tmap-net-node';
                        const icon = n.type === 'person' ? '👤' : n.type === 'org' ? '🏢' : '📡';
                        const shape = n.type === 'org' ? 'border-radius:4px' : 'border-radius:50%';
                        el.innerHTML = `<div style="width:20px;height:20px;${shape};border:2px solid ${n.color};background:rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.5);font-size:10px;cursor:pointer;" title="${n.label}">${icon}</div>`;
                        const conns = visibleEdges.filter(e => e.from === n.id || e.to === n.id).length;
                        const marker = new ml.Marker({ element: el, anchor: 'center' }).setLngLat([n.lng, n.lat]).addTo(map);
                        el.addEventListener('click', (ev: Event) => {
                            ev.stopPropagation();
                            const connDetails = visibleEdges.filter(e => e.from === n.id || e.to === n.id).map(e => {
                                const other = netNodes.find(nn => nn.id === (e.from === n.id ? e.to : e.from));
                                return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0"><span style="width:8px;height:3px;border-radius:1px;background:${edgeColors[e.type]};flex-shrink:0"></span><span style="font-size:10px;color:var(--ax-text)">${other?.label || '?'}</span><span style="font-size:8px;padding:1px 4px;border-radius:2px;background:${edgeColors[e.type]}15;color:${edgeColors[e.type]};font-weight:600">${e.type}</span><span style="font-size:8px;color:var(--ax-text-dim)">${Math.round(e.strength * 100)}%</span></div>`;
                            }).join('');
                            new ml.Popup({ offset: 14, maxWidth: '220px', className: 'tmap-popup' })
                                .setLngLat([n.lng, n.lat])
                                .setHTML(`<div class="tmap-popup-card"><div class="tmap-popup-header" style="gap:8px"><span style="font-size:18px">${icon}</span><div class="tmap-popup-hinfo"><div class="tmap-popup-name" style="font-size:12px">${n.label}</div><div style="font-size:9px;color:var(--ax-text-dim)">${n.type.charAt(0).toUpperCase() + n.type.slice(1)} · ${conns} connection${conns !== 1 ? 's' : ''}</div></div></div><div style="padding:6px 14px">${connDetails}</div></div>`).addTo(map);
                        });
                        networkMarkersRef.current.push(marker);
                    });
                }
            } else {
                if (map.getLayer('network-lines')) map.removeLayer('network-lines');
                if (map.getSource('network-source')) map.removeSource('network-source');
            }
        } catch {}
        return () => { networkMarkersRef.current.forEach(m => m.remove()); networkMarkersRef.current = []; };
    }, [layerNetwork, networkShowPersons, networkShowOrgs, networkShowDevices, loaded]);

    // LPR markers on map
    const lprMarkersRef = useRef<any[]>([]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        lprMarkersRef.current.forEach(m => m.remove());
        lprMarkersRef.current = [];
        const ml = (window as any).maplibregl;
        if (!ml || !layerLPR) return;

        const lprFiltered = timelineActive ? mockLPR.filter(l => new Date(l.timestamp.replace(' ', 'T')).getTime() <= tlCursorMs) : mockLPR;
        // Also draw connection lines from LPR to person/org markers if they're on the map
        const lprLineFeats: any[] = [];
        lprFiltered.forEach(lpr => {
            const riskColor = lpr.personId === 0 ? '#6b7280' : (mockPersons.find(p => p.id === lpr.personId)?.risk === 'Critical' ? '#ef4444' : '#f97316');
            const el = document.createElement('div');
            el.className = 'tmap-marker-source';
            el.innerHTML = `<div class="tmap-marker-inner" style="width:28px;height:28px;border-radius:4px;border:2px solid #10b981;background:rgba(13,18,32,0.92);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5);font-size:13px;position:relative;">🚗<div style="position:absolute;top:-3px;right:-3px;width:8px;height:8px;border-radius:50%;background:${riskColor};border:1.5px solid rgba(13,18,32,0.9)"></div></div>`;
            const marker = new ml.Marker({ element: el, anchor: 'center' }).setLngLat([lpr.lng, lpr.lat]).addTo(map);
            el.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                const confColor = lpr.confidence >= 95 ? '#22c55e' : lpr.confidence >= 85 ? '#f59e0b' : '#ef4444';
                new ml.Popup({ offset: 16, maxWidth: '280px', className: 'tmap-popup' }).setLngLat([lpr.lng, lpr.lat]).setHTML(`<div class="tmap-popup-card">
                    <div class="tmap-popup-header"><img src="${lpr.photoUrl}" class="tmap-popup-avatar" style="border-radius:6px;width:48px;height:36px;object-fit:cover" /><div class="tmap-popup-hinfo"><div class="tmap-popup-name" style="font-size:14px;font-family:'JetBrains Mono',monospace;letter-spacing:0.05em">${lpr.plate}</div><div class="tmap-popup-meta"><span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px;background:${confColor}15;color:${confColor};border:1px solid ${confColor}30">${lpr.confidence}% match</span><span class="tmap-popup-status"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;margin-right:3px"></span>LPR</span></div></div></div>
                    <div class="tmap-popup-grid">
                        <div class="tmap-popup-row"><span class="tmap-popup-label">👤 Owner</span><span class="tmap-popup-val">${lpr.personName}${lpr.orgName ? ` · ${lpr.orgName}` : ''}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🧭 Direction</span><span class="tmap-popup-val">${lpr.direction} at ${lpr.speed} km/h</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">📹 Camera</span><span class="tmap-popup-val">${lpr.cameraName}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🕐 Time</span><span class="tmap-popup-val">${lpr.timestamp}</span></div>
                    </div><div class="tmap-popup-coords">${lpr.lat.toFixed(5)}, ${lpr.lng.toFixed(5)}</div></div>`).addTo(map);
            });
            lprMarkersRef.current.push(marker);
            // Line from LPR to next sighting of same plate (route trail)
            const samePlate = lprFiltered.filter(l => l.plate === lpr.plate);
            const idx = samePlate.indexOf(lpr);
            if (idx < samePlate.length - 1) {
                const next = samePlate[idx + 1];
                lprLineFeats.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[lpr.lng, lpr.lat], [next.lng, next.lat]] }, properties: { color: '#10b981', width: 2 } });
            }
        });
        // LPR route lines
        const geojson: any = { type: 'FeatureCollection', features: lprLineFeats };
        try {
            if (map.getSource('lpr-routes')) { (map.getSource('lpr-routes') as any).setData(geojson); }
            else { map.addSource('lpr-routes', { type: 'geojson', data: geojson }); map.addLayer({ id: 'lpr-routes-line', type: 'line', source: 'lpr-routes', paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': 0.5, 'line-dasharray': [4, 3] } }); }
        } catch {}
        return () => { lprMarkersRef.current.forEach(m => m.remove()); lprMarkersRef.current = []; try { if (map.getLayer('lpr-routes-line')) map.removeLayer('lpr-routes-line'); if (map.getSource('lpr-routes')) map.removeSource('lpr-routes'); } catch {} };
    }, [layerLPR, loaded, timelineActive, tlCursorMs]);

    // Face Recognition markers on map
    const faceMarkersRef = useRef<any[]>([]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        faceMarkersRef.current.forEach(m => m.remove());
        faceMarkersRef.current = [];
        const ml = (window as any).maplibregl;
        if (!ml || !layerFace) return;
        const faceFiltered = timelineActive ? mockFaces.filter(f => new Date(f.timestamp.replace(' ', 'T')).getTime() <= tlCursorMs) : mockFaces;
        faceFiltered.forEach(fr => {
            const confColor = fr.confidence >= 90 ? '#22c55e' : fr.confidence >= 75 ? '#f59e0b' : fr.personId === 0 ? '#ef4444' : '#6b7280';
            const riskColor = fr.risk === 'Critical' ? '#ef4444' : fr.risk === 'High' ? '#f97316' : fr.risk === 'Medium' ? '#f59e0b' : '#6b7280';
            const el = document.createElement('div');
            el.className = 'tmap-marker-source';
            const hasAvatar = fr.personAvatar && fr.personId > 0;
            el.innerHTML = `<div class="tmap-marker-inner" style="width:30px;height:30px;border-radius:50%;border:2.5px solid ${riskColor};background:${hasAvatar ? `url(${fr.personAvatar}) center/cover` : 'rgba(13,18,32,0.92)'};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5);font-size:12px;position:relative;${hasAvatar ? '' : ''}">${hasAvatar ? '' : '👤'}<div style="position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:${confColor};border:1.5px solid rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;"><span style="font-size:5px;font-weight:900;color:#fff">${fr.confidence > 0 ? Math.round(fr.confidence) : '?'}</span></div></div>`;
            const marker = new ml.Marker({ element: el, anchor: 'center' }).setLngLat([fr.lng, fr.lat]).addTo(map);
            el.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                new ml.Popup({ offset: 18, maxWidth: '280px', className: 'tmap-popup' }).setLngLat([fr.lng, fr.lat]).setHTML(`<div class="tmap-popup-card">
                    <div class="tmap-popup-header">
                        <div style="width:44px;height:44px;border-radius:50%;border:2.5px solid ${riskColor};background:${hasAvatar ? `url(${fr.personAvatar}) center/cover` : 'rgba(13,18,32,0.9)'};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${hasAvatar ? '' : '👤'}</div>
                        <div class="tmap-popup-hinfo"><div class="tmap-popup-name">${fr.personName}</div><div class="tmap-popup-meta">
                            <span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px;background:${riskColor}15;color:${riskColor};border:1px solid ${riskColor}30">${fr.risk}</span>
                            <span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px;background:${confColor}15;color:${confColor};border:1px solid ${confColor}30">${fr.confidence > 0 ? fr.confidence + '% match' : 'No match'}</span>
                        </div></div>
                    </div>
                    <div class="tmap-popup-grid">
                        <div class="tmap-popup-row"><span class="tmap-popup-label">📹 Camera</span><span class="tmap-popup-val">${fr.cameraName}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🕐 Time</span><span class="tmap-popup-val">${fr.timestamp}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">😐 Emotion</span><span class="tmap-popup-val">${fr.emotion}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">👕 Wearing</span><span class="tmap-popup-val">${fr.wearing}</span></div>
                    </div><div class="tmap-popup-coords">${fr.lat.toFixed(5)}, ${fr.lng.toFixed(5)}</div></div>`).addTo(map);
            });
            faceMarkersRef.current.push(marker);
        });
        return () => { faceMarkersRef.current.forEach(m => m.remove()); faceMarkersRef.current = []; };
    }, [layerFace, loaded, timelineActive, tlCursorMs]);

    // Object drawing click handler
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded || !objDrawing) return;
        const isFreeDraw = objDrawing.type === 'freehand';
        let isMouseDown = false;
        const addPoint = (e: any) => { setObjDrawing(prev => prev ? { ...prev, points: [...prev.points, [e.lngLat.lng, e.lngLat.lat]] } : null); };
        const handleClick = (e: any) => { if (!isFreeDraw) addPoint(e); };
        const handleMouseDown = (e: any) => { if (isFreeDraw) { isMouseDown = true; addPoint(e); map.dragPan.disable(); } };
        const handleMouseMove = (e: any) => { if (isFreeDraw && isMouseDown) addPoint(e); };
        const handleMouseUp = () => { if (isFreeDraw && isMouseDown) { isMouseDown = false; map.dragPan.enable(); finishDrawing(); } };
        const handleDblClick = (e: any) => { e.preventDefault(); if (!isFreeDraw) finishDrawing(); };
        const finishDrawing = () => {
            setObjDrawing(prev => {
                if (!prev || prev.points.length < 1) return null;
                let coords = prev.points as [number, number][];
                if (prev.type === 'rectangle' && coords.length >= 2) {
                    const [a, b] = [coords[0], coords[coords.length - 1]];
                    coords = [[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]];
                }
                const obj: MapObject = { id: `obj-${Date.now()}`, type: prev.type, name: '', color: '#3b82f6', coords, visible: true, assignedTo: null, createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') };
                setObjForm({ name: '', color: '#3b82f6', assignType: '', assignId: '' });
                setObjModal({ mode: 'add', obj });
                return null;
            });
        };
        map.on('click', handleClick);
        map.on('dblclick', handleDblClick);
        if (isFreeDraw) { map.on('mousedown', handleMouseDown); map.on('mousemove', handleMouseMove); map.on('mouseup', handleMouseUp); }
        map.getCanvas().style.cursor = 'crosshair';
        return () => { map.off('click', handleClick); map.off('dblclick', handleDblClick); map.off('mousedown', handleMouseDown); map.off('mousemove', handleMouseMove); map.off('mouseup', handleMouseUp); if (mapRef.current) { mapRef.current.getCanvas().style.cursor = ''; mapRef.current.dragPan.enable(); } };
    }, [objDrawing, loaded]);

    // Render objects on map
    const objMarkersRef = useRef<any[]>([]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        objMarkersRef.current.forEach(m => m.remove());
        objMarkersRef.current = [];
        const geojson: any = { type: 'FeatureCollection', features: [] };
        const ml = (window as any).maplibregl;
        mapObjects.forEach(o => {
            if (!o.visible) return;
            if (o.type === 'marker' && o.coords.length >= 1) {
                if (ml) {
                    const el = document.createElement('div');
                    el.className = 'tmap-marker-source';
                    el.innerHTML = `<div class="tmap-marker-inner" style="width:24px;height:24px;border-radius:50%;border:2px solid ${o.color};background:rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.5);font-size:11px;">📌</div>`;
                    el.title = o.name || 'Marker';
                    const marker = new ml.Marker({ element: el, anchor: 'center' }).setLngLat(o.coords[0]).addTo(map);
                    el.addEventListener('click', (e: Event) => { e.stopPropagation(); new ml.Popup({ offset: 14, maxWidth: '200px', className: 'tmap-popup' }).setLngLat(o.coords[0]).setHTML(`<div class="tmap-popup-card"><div class="tmap-popup-header" style="gap:8px"><span style="font-size:16px">📌</span><div class="tmap-popup-hinfo"><div class="tmap-popup-name" style="font-size:11px">${o.name}</div><div style="font-size:9px;color:var(--ax-text-dim)">${o.assignedTo ? `${o.assignedTo.type === 'person' ? '👤' : '🏢'} ${o.assignedTo.name}` : 'Unassigned'} · ${o.createdAt}</div></div></div></div>`).addTo(map); });
                    objMarkersRef.current.push(marker);
                }
            } else if (o.type === 'line' || o.type === 'freehand') {
                geojson.features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: o.coords }, properties: { color: o.color, width: o.type === 'freehand' ? 2 : 3, id: o.id } });
            } else if (['rectangle', 'polygon'].includes(o.type) && o.coords.length >= 3) {
                const closed = [...o.coords, o.coords[0]];
                geojson.features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [closed] }, properties: { color: o.color, id: o.id, height: o.type === 'rectangle' ? 45 : 35 } });
            } else if (o.type === 'circle' && o.coords.length >= 1) {
                const [lng, lat] = o.coords[0]; const r = 150;
                const circ: [number, number][] = []; for (let i = 0; i <= 64; i++) { const a = (i / 64) * 2 * Math.PI; const dLat = (r / 6371000) * (180 / Math.PI); const dLng = dLat / Math.cos(lat * Math.PI / 180); circ.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]); }
                geojson.features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [circ] }, properties: { color: o.color, id: o.id, height: 55 } });
            }
        });
        // Drawing preview
        if (objDrawing && objDrawing.points.length >= 1) {
            const coords = objDrawing.points as [number, number][];
            if (coords.length >= 2) geojson.features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: { color: '#ffffff', width: 2, id: 'obj-drawing' } });
        }
        try {
            if (map.getSource('objects-source')) { (map.getSource('objects-source') as any).setData(geojson); }
            else {
                map.addSource('objects-source', { type: 'geojson', data: geojson });
                map.addLayer({ id: 'objects-fill', type: 'fill', source: 'objects-source', filter: ['==', '$type', 'Polygon'], paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.15 } });
                map.addLayer({ id: 'objects-outline', type: 'line', source: 'objects-source', filter: ['==', '$type', 'Polygon'], paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': 0.7 } });
                map.addLayer({ id: 'objects-line', type: 'line', source: 'objects-source', filter: ['==', '$type', 'LineString'], paint: { 'line-color': ['get', 'color'], 'line-width': ['coalesce', ['get', 'width'], 3], 'line-opacity': 0.8 } });
            }
        } catch {}
        return () => { objMarkersRef.current.forEach(m => m.remove()); objMarkersRef.current = []; };
    }, [mapObjects, objDrawing, loaded]);

    // Map right-click context menu (when not on zone/marker)
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        const handler = (e: any) => {
            // Check zones first
            const zoneFeatures = map.queryRenderedFeatures(e.point, { layers: ['zones-fill', 'zones-fill-3d'].filter(l => map.getLayer(l)) });
            if (zoneFeatures && zoneFeatures.length > 0) return;
            // Check objects
            const objLayers = ['objects-fill', 'objects-fill-3d', 'objects-outline', 'objects-line'].filter(l => map.getLayer(l));
            if (objLayers.length > 0) {
                const objFeatures = map.queryRenderedFeatures(e.point, { layers: objLayers });
                if (objFeatures && objFeatures.length > 0) {
                    const fid = objFeatures[0].properties?.id;
                    const obj = mapObjects.find(o => o.id === fid);
                    if (obj) { setObjCtxMenu({ x: e.point.x, y: e.point.y, obj }); setMapCtxMenu(null); setZoneCtxMenu(null); setMarkerCtxMenu(null); e.preventDefault(); return; }
                }
            }
            setMapCtxMenu({ x: e.point.x, y: e.point.y, lngLat: [e.lngLat.lng, e.lngLat.lat] });
            setZoneCtxMenu(null); setMarkerCtxMenu(null); setObjCtxMenu(null);
            e.preventDefault();
        };
        map.on('contextmenu', handler);
        return () => { map.off('contextmenu', handler); };
    }, [mapObjects, loaded]);

    // Placing marker mode — click on map to place
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded || !placingMarker) return;
        map.getCanvas().style.cursor = 'crosshair';
        const handler = (e: any) => { placeMarkerAt([e.lngLat.lng, e.lngLat.lat]); };
        map.on('click', handler);
        return () => { map.off('click', handler); if (mapRef.current) mapRef.current.getCanvas().style.cursor = ''; };
    }, [placingMarker, loaded]);

    // Tiles
    type TileId = string;
    interface TileDef { id: TileId; name: string; category: '2D' | '3D'; preview: string; url?: string; style?: any; }
    const tiles2D: TileDef[] = [
        { id: 'dark', name: 'Dark', category: '2D', preview: '🌑', url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png' },
        { id: 'street', name: 'Street', category: '2D', preview: '🗺️', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' },
        { id: 'satellite', name: 'Satellite', category: '2D', preview: '🛰️', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
        { id: 'voyager', name: 'Voyager', category: '2D', preview: '🧭', url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png' },
        { id: 'light', name: 'Light', category: '2D', preview: '☀️', url: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png' },
        { id: 'topo', name: 'Topo', category: '2D', preview: '⛰️', url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png' },
        { id: 'natgeo', name: 'NatGeo', category: '2D', preview: '🌍', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}' },
        { id: 'terrain', name: 'Terrain', category: '2D', preview: '🏔️', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}' },
        { id: 'dark-nolabel', name: 'Dark Clean', category: '2D', preview: '⚫', url: 'https://basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png' },
        { id: 'watercolor', name: 'Watercolor', category: '2D', preview: '🎨', url: 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg' },
        { id: 'positron', name: 'Positron', category: '2D', preview: '⬜', url: 'https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png' },
        { id: 'humanitarian', name: 'Humanitarian', category: '2D', preview: '🏥', url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' },
    ];
    const tiles3D: TileDef[] = [
        { id: '3d-buildings', name: '3D Buildings', category: '3D', preview: '🏢' },
        { id: '3d-globe', name: '3D Globe', category: '3D', preview: '🌐' },
        { id: '3d-terrain', name: '3D Terrain', category: '3D', preview: '🗻' },
    ];
    const [activeTile, setActiveTile] = useState<TileId>('dark');
    const [active3D, setActive3D] = useState<TileId | null>(null);

    // Place search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lng: number; sub: string }[]>([]);
    const [searchFocused, setSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

    const searchTimerRef = useRef<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Live geocoding via Nominatim (OpenStreetMap) — debounced 400ms
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        if (!searchQuery.trim() || searchQuery.trim().length < 2) { setSearchResults([]); setSearchLoading(false); return; }
        setSearchLoading(true);
        searchTimerRef.current = setTimeout(async () => {
            try {
                const q = encodeURIComponent(searchQuery.trim());
                const viewbox = mapRef.current ? (() => {
                    const b = mapRef.current.getBounds();
                    return `&viewbox=${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}`;
                })() : '';
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&addressdetails=1&limit=10&accept-language=en${viewbox}&bounded=0`);
                if (!res.ok) throw new Error('Search failed');
                const data = await res.json();
                setSearchResults(data.map((r: any) => {
                    const parts: string[] = [];
                    if (r.address?.road) parts.push(r.address.road);
                    if (r.address?.city || r.address?.town || r.address?.village) parts.push(r.address.city || r.address.town || r.address.village);
                    if (r.address?.state) parts.push(r.address.state);
                    if (r.address?.country) parts.push(r.address.country);
                    const sub = parts.length > 0 ? parts.join(', ') : (r.display_name || '').split(',').slice(1, 4).join(',').trim();
                    const typeLabel = (r.type || '').replace(/_/g, ' ');
                    return { name: r.display_name?.split(',')[0] || r.name || 'Unknown', lat: parseFloat(r.lat), lng: parseFloat(r.lon), sub: sub || typeLabel, type: r.type || '', osm_type: r.osm_type || '' };
                }));
            } catch { setSearchResults([]); }
            setSearchLoading(false);
        }, 400);
        return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
    }, [searchQuery]);

    const handleSearchSelect = (place: { name: string; lat: number; lng: number; type?: string }) => {
        const t = (place.type || '').toLowerCase();
        const zoom = ['house','building','address','residential','apartments','hotel','restaurant','cafe','shop','bar'].includes(t) ? 18
            : ['street','road','path','footway','cycleway','pedestrian','service'].includes(t) ? 17
            : ['neighbourhood','suburb','quarter','park','cemetery','stadium','university'].includes(t) ? 15
            : ['city','town'].includes(t) ? 13
            : ['state','region','province','county'].includes(t) ? 9
            : ['country'].includes(t) ? 6
            : 14;
        mapRef.current?.flyTo({ center: [place.lng, place.lat], zoom, duration: 1200 });
        setSearchQuery(''); setSearchResults([]); setSearchFocused(false);
    };

    // FPS counter
    useEffect(() => {
        if (!showFps) return;
        let raf: number;
        const tick = () => {
            fpsRef.current.frames++;
            const now = performance.now();
            if (now - fpsRef.current.lastTime >= 1000) {
                fpsRef.current.fps = fpsRef.current.frames;
                setFps(fpsRef.current.frames);
                fpsRef.current.frames = 0;
                fpsRef.current.lastTime = now;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [showFps]);

    // Tile switching — only when user changes tile, not on initial load
    useEffect(() => {
        if (tileInitRef.current) return; // skip initial render
        const map = mapRef.current;
        if (!map || !loaded || map._isGlobe) return;
        const ver = mapVersionRef.current;
        // Wait for map idle to avoid AbortError on in-flight tile requests
        const apply = () => {
            if (mapVersionRef.current !== ver || !mapRef.current || mapRef.current._isGlobe) return;
            const tile = tiles2D.find(t => t.id === activeTile);
            if (!tile?.url) return;
            try { const src = mapRef.current.getSource('base-tiles'); if (src?.setTiles) src.setTiles([tile.url]); } catch {}
        };
        if (map.loaded()) apply(); else map.once('idle', apply);
    }, [activeTile]);

    // Show Labels: toggle labels overlay visibility on all tile types
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        try {
            if (map.getLayer('labels-layer')) {
                map.setLayoutProperty('labels-layer', 'visibility', showLabels ? 'visible' : 'none');
            }
        } catch {}
    }, [showLabels, loaded]);

    // Hide/show zones
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        const vis = showZones ? 'visible' : 'none';
        try { if (map.getLayer('zones-fill')) map.setLayoutProperty('zones-fill', 'visibility', vis); } catch {}
        try { if (map.getLayer('zones-fill-3d')) map.setLayoutProperty('zones-fill-3d', 'visibility', vis); } catch {}
        try { if (map.getLayer('zones-outline')) map.setLayoutProperty('zones-outline', 'visibility', vis); } catch {}
        try { if (map.getLayer('zones-drawing-line')) map.setLayoutProperty('zones-drawing-line', 'visibility', vis); } catch {}
    }, [showZones, loaded]);

    // Localization: swap label overlay tiles (English-only vs English+local)
    useEffect(() => {
        if (tileInitRef.current) return;
        const map = mapRef.current;
        if (!map || !loaded || map._isGlobe) return;
        const ver = mapVersionRef.current;
        const labelUrl = showLocalization
            ? 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'           // English + local (full tile as overlay, has labels with local names)
            : 'https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png';  // English labels only
        const apply = () => {
            if (mapVersionRef.current !== ver || !mapRef.current || mapRef.current._isGlobe) return;
            try { const src = mapRef.current.getSource('labels-overlay'); if (src?.setTiles) src.setTiles([labelUrl]); } catch {}
        };
        if (map.loaded()) apply(); else map.once('idle', apply);
    }, [showLocalization, loaded]);

    // 3D Modes — Globe requires map rebuild, others modify in place
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        const ver = mapVersionRef.current;

        // Skip cleanup if already in globe mode — rebuild handles it
        if (!map._isGlobe) {
            try { if (map.getLayer('3d-buildings-layer')) map.removeLayer('3d-buildings-layer'); } catch {}
            try { if (map.getSource('3d-buildings-src')) map.removeSource('3d-buildings-src'); } catch {}
            try { map.setTerrain(null); } catch {}
            try { if (map.getSource('terrain-dem')) map.removeSource('terrain-dem'); } catch {}
        }

        if (active3D === '3d-buildings') {
            if (map._isGlobe) { rebuildMapForFlat(); return; }
            try {
                if (!map.getSource('3d-buildings-src')) {
                    map.addSource('3d-buildings-src', { type: 'vector', url: 'https://tiles.openfreemap.org/planet' });
                }
                map.addLayer({ id: '3d-buildings-layer', source: '3d-buildings-src', 'source-layer': 'building', type: 'fill-extrusion', minzoom: 14, paint: { 'fill-extrusion-color': '#1a2744', 'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 10], 'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-opacity': 0.7 } });
                map.easeTo({ pitch: 55, duration: 800 });
            } catch (e) { console.warn('3D Buildings failed:', e); }

        } else if (active3D === '3d-globe') {
            if (!map._isGlobe) rebuildMapForGlobe();

        } else if (active3D === '3d-terrain') {
            if (map._isGlobe) { rebuildMapForFlat(); return; }
            try {
                if (!map.getSource('terrain-dem')) {
                    map.addSource('terrain-dem', { type: 'raster-dem', tiles: ['https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png'], tileSize: 256 });
                }
                const applyTerrain = () => {
                    if (mapVersionRef.current !== ver) return; // map was replaced
                    try {
                        mapRef.current?.setTerrain({ source: 'terrain-dem', exaggeration: 1.5 });
                        mapRef.current?.easeTo({ pitch: 60, zoom: Math.max(mapRef.current.getZoom(), 10), duration: 800 });
                    } catch (e) { console.warn('Terrain apply failed:', e); }
                };
                if (map.isSourceLoaded('terrain-dem')) applyTerrain();
                else { map.once('sourcedata', (e: any) => { if (e.sourceId === 'terrain-dem' && e.isSourceLoaded) applyTerrain(); }); setTimeout(applyTerrain, 500); }
            } catch (e) { console.warn('3D Terrain failed:', e); }

        } else {
            if (map._isGlobe) { rebuildMapForFlat(); }
            else { try { map.easeTo({ pitch: 0, duration: 500 }); } catch {} }
        }
    }, [active3D, loaded]);

    // 3D mode: swap flat fill → fill-extrusion for zones and objects, animate
    const anim3dRef = useRef<number | null>(null);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        const is3D = !!active3D;
        const container = mapContainer.current?.parentElement;
        if (container) { is3D ? container.classList.add('tmap-3d-active') : container.classList.remove('tmap-3d-active'); }

        // Stop any existing animation
        if (anim3dRef.current) { cancelAnimationFrame(anim3dRef.current); anim3dRef.current = null; }

        try {
            // ZONES: swap fill → fill-extrusion or back
            if (map.getSource('zones-source')) {
                if (is3D) {
                    if (map.getLayer('zones-fill')) map.removeLayer('zones-fill');
                    if (!map.getLayer('zones-fill-3d')) {
                        map.addLayer({ id: 'zones-fill-3d', type: 'fill-extrusion', source: 'zones-source', filter: ['==', '$type', 'Polygon'], paint: {
                            'fill-extrusion-color': ['get', 'color'],
                            'fill-extrusion-height': ['coalesce', ['get', 'height'], 50],
                            'fill-extrusion-base': 0,
                            'fill-extrusion-opacity': 0.35,
                        }});
                    }
                    if (map.getLayer('zones-outline')) {
                        map.setPaintProperty('zones-outline', 'line-width', 3);
                        map.setPaintProperty('zones-outline', 'line-dasharray', [6, 3]);
                    }
                } else {
                    if (map.getLayer('zones-fill-3d')) map.removeLayer('zones-fill-3d');
                    if (!map.getLayer('zones-fill')) {
                        map.addLayer({ id: 'zones-fill', type: 'fill', source: 'zones-source', filter: ['==', '$type', 'Polygon'], paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.12 } });
                    }
                    if (map.getLayer('zones-outline')) {
                        map.setPaintProperty('zones-outline', 'line-width', 2);
                        map.setPaintProperty('zones-outline', 'line-dasharray', [1, 0]);
                    }
                }
            }
            // OBJECTS: swap fill → fill-extrusion or back
            if (map.getSource('objects-source')) {
                if (is3D) {
                    if (map.getLayer('objects-fill')) map.removeLayer('objects-fill');
                    if (!map.getLayer('objects-fill-3d')) {
                        map.addLayer({ id: 'objects-fill-3d', type: 'fill-extrusion', source: 'objects-source', filter: ['==', '$type', 'Polygon'], paint: {
                            'fill-extrusion-color': ['get', 'color'],
                            'fill-extrusion-height': ['coalesce', ['get', 'height'], 35],
                            'fill-extrusion-base': 0,
                            'fill-extrusion-opacity': 0.4,
                        }});
                    }
                    if (map.getLayer('objects-outline')) {
                        map.setPaintProperty('objects-outline', 'line-width', 3);
                        map.setPaintProperty('objects-outline', 'line-dasharray', [5, 3]);
                    }
                    if (map.getLayer('objects-line')) map.setPaintProperty('objects-line', 'line-width', 4);
                } else {
                    if (map.getLayer('objects-fill-3d')) map.removeLayer('objects-fill-3d');
                    if (!map.getLayer('objects-fill')) {
                        map.addLayer({ id: 'objects-fill', type: 'fill', source: 'objects-source', filter: ['==', '$type', 'Polygon'], paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.15 } });
                    }
                    if (map.getLayer('objects-outline')) {
                        map.setPaintProperty('objects-outline', 'line-width', 2);
                        map.setPaintProperty('objects-outline', 'line-dasharray', [1, 0]);
                    }
                    if (map.getLayer('objects-line')) map.setPaintProperty('objects-line', 'line-width', ['coalesce', ['get', 'width'], 3]);
                }
            }
            // HEATMAP: boost in 3D
            if (map.getLayer('heatmap-layer')) {
                map.setPaintProperty('heatmap-layer', 'heatmap-opacity', is3D ? 0.9 : 0.75);
            }

            // 3D animation loop: breathing opacity + gentle height pulse for zones & objects
            if (is3D) {
                const startTime = performance.now();
                const animate = () => {
                    if (!mapRef.current || !active3D) return;
                    const t = (performance.now() - startTime) / 1000;

                    try {
                        // Zones: breathing opacity (0.25 → 0.45) + height oscillation ±5%
                        if (mapRef.current.getLayer('zones-fill-3d')) {
                            const zoneOp = 0.35 + Math.sin(t * 0.8) * 0.1;
                            mapRef.current.setPaintProperty('zones-fill-3d', 'fill-extrusion-opacity', zoneOp);
                        }
                        // Zone outlines: glowing opacity
                        if (mapRef.current.getLayer('zones-outline')) {
                            const outlineOp = 0.6 + Math.sin(t * 1.2) * 0.25;
                            mapRef.current.setPaintProperty('zones-outline', 'line-opacity', outlineOp);
                        }
                        // Objects: breathing opacity offset from zones
                        if (mapRef.current.getLayer('objects-fill-3d')) {
                            const objOp = 0.4 + Math.sin(t * 1.0 + 1.5) * 0.1;
                            mapRef.current.setPaintProperty('objects-fill-3d', 'fill-extrusion-opacity', objOp);
                        }
                        // Object outlines: glow
                        if (mapRef.current.getLayer('objects-outline')) {
                            const objOutOp = 0.7 + Math.sin(t * 1.5 + 0.8) * 0.2;
                            mapRef.current.setPaintProperty('objects-outline', 'line-opacity', objOutOp);
                        }
                        // Network lines: pulse
                        if (mapRef.current.getLayer('network-lines')) {
                            const netOp = 0.4 + Math.sin(t * 0.6 + 2.0) * 0.2;
                            mapRef.current.setPaintProperty('network-lines', 'line-opacity', netOp);
                        }
                    } catch {}
                    anim3dRef.current = requestAnimationFrame(animate);
                };
                anim3dRef.current = requestAnimationFrame(animate);
            } else {
                // Reset static opacities
                try {
                    if (map.getLayer('zones-outline')) map.setPaintProperty('zones-outline', 'line-opacity', 0.6);
                    if (map.getLayer('objects-outline')) map.setPaintProperty('objects-outline', 'line-opacity', 0.7);
                    if (map.getLayer('objects-line')) map.setPaintProperty('objects-line', 'line-opacity', 0.8);
                    if (map.getLayer('network-lines')) map.setPaintProperty('network-lines', 'line-opacity', ['get', 'opacity']);
                } catch {}
            }
        } catch (e) { console.warn('3D layer swap:', e); }

        return () => { if (anim3dRef.current) { cancelAnimationFrame(anim3dRef.current); anim3dRef.current = null; } };
    }, [active3D, loaded]);

    // Load MapLibre + map create/rebuild helpers
    const attachMapEvents = useCallback((map: any) => {
        map.on('mousemove', (e: any) => setCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
        map.on('zoomend', () => setZoom(Math.round(map.getZoom() * 10) / 10));
        map.on('rotate', () => setBearing(map.getBearing()));
        map.on('moveend', () => { const c = map.getCenter(); prevCameraRef.current = { center: [c.lng, c.lat], zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() }; });
    }, []);

    const rebuildMapForGlobe = useCallback(() => {
        if (!mapContainer.current || !(window as any).maplibregl) return;
        const ml = (window as any).maplibregl;
        if (mapRef.current) {
            if ((mapRef.current as any)._spinFrame) cancelAnimationFrame((mapRef.current as any)._spinFrame);
            try { const c = mapRef.current.getCenter(); prevCameraRef.current = { center: [c.lng, c.lat], zoom: mapRef.current.getZoom(), bearing: mapRef.current.getBearing(), pitch: mapRef.current.getPitch() }; } catch {}
            mapRef.current._removed = true;
            mapRef.current.remove();
            mapRef.current = null;
        }
        mapVersionRef.current++;
        setLoaded(false);
        // Official MapLibre v5 globe pattern — projection inside style object
        const map = new ml.Map({
            container: mapContainer.current,
            zoom: 1.5,
            center: [prevCameraRef.current.center[0], prevCameraRef.current.center[1]],
            attributionControl: false,
            maxPitch: 85,
            style: {
                version: 8,
                projection: { type: 'globe' },
                sky: {
                    'sky-color': '#000008',
                    'sky-horizon-blend': 1,
                    'horizon-color': '#000015',
                    'horizon-fog-blend': 1,
                    'fog-color': '#000008',
                    'fog-ground-blend': 0.5,
                    'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0],
                },
                sources: {
                    satellite: {
                        type: 'raster',
                        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                        tileSize: 256,
                        maxzoom: 19,
                    },
                    'labels-overlay': { type: 'raster', tiles: ['https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png'], tileSize: 256 },
                },
                layers: [
                    { id: 'satellite-layer', type: 'raster', source: 'satellite' },
                    { id: 'labels-layer', type: 'raster', source: 'labels-overlay' },
                ],
            },
        });
        (map as any)._isGlobe = true;
        attachMapEvents(map);
        map.on('load', () => {
            setLoaded(true);
            setZoom(Math.round(map.getZoom() * 10) / 10);
            // Auto-rotate like Google Earth idle
            let spinning = true;
            const spinGlobe = () => {
                if (!spinning || !mapRef.current || !mapRef.current._isGlobe) return;
                const c = mapRef.current.getCenter();
                c.lng -= 0.15;
                mapRef.current.setCenter(c);
                (mapRef.current as any)._spinFrame = requestAnimationFrame(spinGlobe);
            };
            setTimeout(() => { if (mapRef.current?._isGlobe) spinGlobe(); }, 1200);
            const stopSpin = () => { spinning = false; if ((mapRef.current as any)?._spinFrame) cancelAnimationFrame((mapRef.current as any)._spinFrame); };
            map.on('mousedown', stopSpin);
            map.on('touchstart', stopSpin);
            map.on('wheel', stopSpin);
        });
        mapRef.current = map;
    }, [attachMapEvents]);

    const rebuildMapForFlat = useCallback(() => {
        if (!mapContainer.current || !(window as any).maplibregl) return;
        const ml = (window as any).maplibregl;
        if (mapRef.current) {
            // Cancel globe spin if running
            if ((mapRef.current as any)._spinFrame) cancelAnimationFrame((mapRef.current as any)._spinFrame);
            try { const c = mapRef.current.getCenter(); prevCameraRef.current = { center: [c.lng, c.lat], zoom: mapRef.current.getZoom(), bearing: mapRef.current.getBearing(), pitch: 0 }; } catch {}
            mapRef.current._removed = true;
            mapRef.current.remove();
            mapRef.current = null;
        }
        mapVersionRef.current++;
        setLoaded(false);
        const tile = tiles2D.find(t => t.id === activeTile);
        const tileUrl = tile?.url || 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png';
        const map = new ml.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'base-tiles': { type: 'raster', tiles: [tileUrl], tileSize: 256 },
                    'labels-overlay': { type: 'raster', tiles: ['https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png'], tileSize: 256 },
                },
                layers: [
                    { id: 'base-layer', type: 'raster', source: 'base-tiles', minzoom: 0, maxzoom: 20 },
                    { id: 'labels-layer', type: 'raster', source: 'labels-overlay', minzoom: 0, maxzoom: 20 },
                ],
            },
            center: prevCameraRef.current.center,
            zoom: Math.max(prevCameraRef.current.zoom, 8),
            bearing: prevCameraRef.current.bearing,
            pitch: 0,
            attributionControl: false,
        });
        (map as any)._isGlobe = false;
        attachMapEvents(map);
        map.on('load', () => { setLoaded(true); setZoom(Math.round(map.getZoom() * 10) / 10); });
        mapRef.current = map;
    }, [attachMapEvents, activeTile]);

    useEffect(() => {
        const maplibreCSS = 'https://unpkg.com/maplibre-gl@5.21.0/dist/maplibre-gl.css';
        const maplibreJS = 'https://unpkg.com/maplibre-gl@5.21.0/dist/maplibre-gl.js';
        if (!document.querySelector(`link[href="${maplibreCSS}"]`)) { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = maplibreCSS; document.head.appendChild(link); }

        const initMap = () => {
            if (!mapContainer.current || !(window as any).maplibregl) return;
            const ml = (window as any).maplibregl;
            const map = new ml.Map({
                container: mapContainer.current,
                style: {
                    version: 8,
                    sources: {
                        'base-tiles': { type: 'raster', tiles: ['https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'], tileSize: 256 },
                        'labels-overlay': { type: 'raster', tiles: ['https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png'], tileSize: 256 },
                    },
                    layers: [
                        { id: 'base-layer', type: 'raster', source: 'base-tiles', minzoom: 0, maxzoom: 20 },
                        { id: 'labels-layer', type: 'raster', source: 'labels-overlay', minzoom: 0, maxzoom: 20 },
                    ],
                },
                center: [15.9819, 45.8150], zoom: 13, attributionControl: false,
            });
            (map as any)._isGlobe = false;
            attachMapEvents(map);
            map.on('load', () => {
                setLoaded(true);
                setZoom(Math.round(map.getZoom() * 10) / 10);
                // Allow tile/localization effects to run on future changes
                setTimeout(() => { tileInitRef.current = false; }, 100);
            });
            mapRef.current = map;
        };
        if ((window as any).maplibregl) initMap(); else { const s = document.createElement('script'); s.src = maplibreJS; s.onload = () => setTimeout(initMap, 50); document.head.appendChild(s); }
        return () => { if (mapRef.current) { if ((mapRef.current as any)._spinFrame) cancelAnimationFrame((mapRef.current as any)._spinFrame); mapRef.current.remove(); mapRef.current = null; } };
    }, []);

    const handleRecenter = useCallback(() => { mapRef.current?.flyTo({ center: [15.9819, 45.8150], zoom: 13, bearing: 0, duration: 1000 }); }, []);
    const handleMinimapNav = useCallback((lat: number, lng: number) => { mapRef.current?.flyTo({ center: [lng, lat], zoom: mapRef.current.getZoom(), duration: 800 }); }, []);
    const handleZoomIn = () => { mapRef.current?.zoomIn({ duration: 300 }); };
    const handleZoomOut = () => { mapRef.current?.zoomOut({ duration: 300 }); };
    const handleResetNorth = () => { mapRef.current?.rotateTo(0, { duration: 500 }); };
    const handleRotateCW = () => { if (mapRef.current) mapRef.current.rotateTo(mapRef.current.getBearing() + 45, { duration: 400 }); };
    const handleRotateCCW = () => { if (mapRef.current) mapRef.current.rotateTo(mapRef.current.getBearing() - 45, { duration: 400 }); };
    const handleFullscreen = () => {
        const el = document.querySelector('.tmap-page');
        if (!el) return;
        if (!document.fullscreenElement) { el.requestFullscreen?.(); setIsFullscreen(true); }
        else { document.exitFullscreen?.(); setIsFullscreen(false); }
    };
    useEffect(() => { const h = () => setIsFullscreen(!!document.fullscreenElement); document.addEventListener('fullscreenchange', h); return () => document.removeEventListener('fullscreenchange', h); }, []);

    const dateInputStyle: React.CSSProperties = { width: '100%', padding: '7px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", outline: 'none', colorScheme: 'dark' as any };

    return (
        <>
        <PageMeta title="Tactical Map" description="Real-time geospatial surveillance and entity tracking" section="map" />
        <div className="tmap-page">
            <button className="tmap-mobile-toggle tmap-overlay-btn" onClick={() => setSidebarOpen(!sidebarOpen)}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg></button>
            {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }} />}

            {/* Sidebar */}
            <div className={`tmap-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="tmap-sidebar-header">
                    <div className="tmap-sidebar-brand"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 2v12M2 8h12"/><circle cx="8" cy="8" r="2"/></svg>Tactical Map</div>
                    <button onClick={handleRecenter} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Recenter" onMouseEnter={e => (e.currentTarget.style.color = theme.accent)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5"/><circle cx="8" cy="8" r="1"/><line x1="8" y1="1" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/></svg></button>
                </div>
                <div className="tmap-sidebar-body">
                    {/* PERIOD */}
                    <Section title="Period" icon={Ico.period} >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>From</div><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={dateInputStyle} /></div>
                            <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>To</div><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={dateInputStyle} /></div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {['24h', '7d', '30d'].map(p => <button key={p} onClick={() => { const d = new Date(); const f = new Date(); if (p === '24h') f.setDate(d.getDate() - 1); if (p === '7d') f.setDate(d.getDate() - 7); if (p === '30d') f.setDate(d.getDate() - 30); setDateFrom(f.toISOString().slice(0, 10)); setDateTo(d.toISOString().slice(0, 10)); }} style={{ flex: 1, padding: '4px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textDim; }}>{p}</button>)}
                                {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(''); setDateTo(''); }} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: theme.danger, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>×</button>}
                            </div>
                            {(dateFrom || dateTo) && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, padding: '5px 8px', borderRadius: 5, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
                                <span style={{ fontSize: 9, color: theme.textSecondary }}>{periodFilteredEvents.length} events in period</span>
                                <button onClick={() => { setTimelineOpen(true); setTimelineCursor(100); }} style={{ fontSize: 8, fontWeight: 700, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>Open Timeline →</button>
                            </div>}
                        </div>
                    </Section>

                    {/* SUBJECTS */}
                    <Section title="Subjects" icon={Ico.subjects} badge={selectedPersons.length + selectedOrgs.length}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Persons ({selectedPersons.length}/{mockPersons.length})</div><SidebarMS selected={selectedPersons} onChange={setSelectedPersons} options={personOpts} placeholder="Select persons to track..." showSelectAll /></div>
                            <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Organizations ({selectedOrgs.length}/{mockOrganizations.length})</div><SidebarMS selected={selectedOrgs} onChange={setSelectedOrgs} options={orgOpts} placeholder="Select organizations..." showSelectAll /></div>
                        </div>
                    </Section>

                    <Section title="Sources" icon={Ico.sources} badge={activeSourceCount}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {['Camera', 'GPS', 'Audio', 'Mobile App'].map(group => {
                                const items = sourceTypes.filter(s => s.group === group);
                                const activeInGroup = items.filter(s => activeSources.has(s.id)).length;
                                const allOn = activeInGroup === items.length;
                                return <div key={group}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{group} {activeInGroup > 0 && <span style={{ color: theme.accent }}>({activeInGroup})</span>}</span>
                                        <button onClick={() => toggleSourceGroup(group)} style={{ fontSize: 8, fontWeight: 600, color: allOn ? theme.danger : theme.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>{allOn ? 'Off All' : 'On All'}</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {items.map(s => {
                                            const isOn = activeSources.has(s.id);
                                            const markerCount = mockSourceMarkers.filter(m => m.sourceId === s.id).length;
                                            const onlineCount = mockSourceMarkers.filter(m => m.sourceId === s.id && m.status === 'online').length;
                                            return <button key={s.id} onClick={() => toggleSource(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 5, border: `1px solid ${isOn ? s.color + '40' : theme.border}`, background: isOn ? s.color + '08' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const, width: '100%', transition: 'all 0.1s' }} onMouseEnter={e => { if (!isOn) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = s.color + '25'; } }} onMouseLeave={e => { if (!isOn) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = theme.border; } }}>
                                                <span style={{ fontSize: 12, width: 16, textAlign: 'center' as const, flexShrink: 0 }}>{s.icon}</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 10, fontWeight: 600, color: isOn ? s.color : theme.text, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                                                </div>
                                                <span style={{ fontSize: 8, color: theme.textDim, flexShrink: 0 }}>{onlineCount}/{markerCount}</span>
                                                <div style={{ width: 8, height: 8, borderRadius: 2, border: `1.5px solid ${isOn ? s.color : theme.border}`, background: isOn ? s.color : 'transparent', flexShrink: 0, transition: 'all 0.1s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isOn && <svg width="5" height="5" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>
                                            </button>;
                                        })}
                                    </div>
                                </div>;
                            })}
                            {activeSourceCount > 0 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: `1px solid ${theme.border}` }}>
                                <span style={{ fontSize: 9, color: theme.textDim }}>{activeSourceMarkers.length} markers visible</span>
                                <button onClick={() => setActiveSources(new Set())} style={{ fontSize: 8, fontWeight: 600, color: theme.danger, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Disable All</button>
                            </div>}
                        </div>
                    </Section>
                    <Section title="Layers" icon={Ico.layers} badge={(layerHeatmap ? 1 : 0) + (layerNetwork ? 1 : 0) + (layerLPR ? 1 : 0) + (layerFace ? 1 : 0)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {/* Heatmap Layer */}
                            <div style={{ border: `1px solid ${layerHeatmap ? '#f59e0b30' : theme.border}`, borderRadius: 6, padding: 8, background: layerHeatmap ? 'rgba(245,158,11,0.03)' : 'transparent' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: layerHeatmap ? 8 : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 12 }}>🔥</span>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: layerHeatmap ? '#f59e0b' : theme.text }}>Activity Heatmap</span>
                                    </div>
                                    <button onClick={() => setLayerHeatmap(!layerHeatmap)} style={{ width: 32, height: 16, borderRadius: 8, border: 'none', background: layerHeatmap ? '#f59e0b' : theme.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff', position: 'absolute', top: 2, left: layerHeatmap ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                                    </button>
                                </div>
                                {layerHeatmap && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ fontSize: 9, color: theme.textDim }}>{heatmapPoints.length} activity points · Density visualization of surveillance events</div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: theme.textDim, marginBottom: 2 }}><span>Intensity</span><span style={{ color: '#f59e0b', fontWeight: 700 }}>{(heatmapIntensity * 100).toFixed(0)}%</span></div>
                                        <input type="range" min="10" max="100" step="5" value={heatmapIntensity * 100} onChange={e => setHeatmapIntensity(parseInt(e.target.value) / 100)} style={{ width: '100%', accentColor: '#f59e0b', height: 3 }} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: theme.textDim, marginBottom: 2 }}><span>Radius</span><span style={{ color: '#f59e0b', fontWeight: 700 }}>{heatmapRadius}px</span></div>
                                        <input type="range" min="10" max="60" step="5" value={heatmapRadius} onChange={e => setHeatmapRadius(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b', height: 3 }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                        {[['🔵', 'Low'], ['🟢', 'Medium'], ['🟡', 'High'], ['🔴', 'Critical'], ['⚪', 'Peak']].map(([ico, lbl]) => <span key={lbl} style={{ fontSize: 8, color: theme.textDim, display: 'flex', alignItems: 'center', gap: 2 }}>{ico} {lbl}</span>)}
                                    </div>
                                </div>}
                            </div>

                            {/* Network Layer */}
                            <div style={{ border: `1px solid ${layerNetwork ? '#8b5cf630' : theme.border}`, borderRadius: 6, padding: 8, background: layerNetwork ? 'rgba(139,92,246,0.03)' : 'transparent' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: layerNetwork ? 8 : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 12 }}>🕸️</span>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: layerNetwork ? '#8b5cf6' : theme.text }}>Network Graph</span>
                                    </div>
                                    <button onClick={() => setLayerNetwork(!layerNetwork)} style={{ width: 32, height: 16, borderRadius: 8, border: 'none', background: layerNetwork ? '#8b5cf6' : theme.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff', position: 'absolute', top: 2, left: layerNetwork ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                                    </button>
                                </div>
                                {layerNetwork && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ fontSize: 9, color: theme.textDim }}>{netNodes.length} nodes · {netEdges.length} connections</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <span style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Show</span>
                                        {[
                                            { label: 'Persons', icon: '👤', enabled: networkShowPersons, toggle: setNetworkShowPersons, count: netNodes.filter(n => n.type === 'person').length, color: '#ef4444' },
                                            { label: 'Organizations', icon: '🏢', enabled: networkShowOrgs, toggle: setNetworkShowOrgs, count: netNodes.filter(n => n.type === 'org').length, color: '#3b82f6' },
                                            { label: 'Devices', icon: '📡', enabled: networkShowDevices, toggle: setNetworkShowDevices, count: netNodes.filter(n => n.type === 'device').length, color: '#22c55e' },
                                        ].map(f => (
                                            <button key={f.label} onClick={() => f.toggle(!f.enabled)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 6px', borderRadius: 4, border: `1px solid ${f.enabled ? f.color + '40' : theme.border}`, background: f.enabled ? f.color + '08' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const }}>
                                                <span style={{ fontSize: 10 }}>{f.icon}</span>
                                                <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: f.enabled ? f.color : theme.textDim }}>{f.label}</span>
                                                <span style={{ fontSize: 8, color: theme.textDim }}>{f.count}</span>
                                                <div style={{ width: 8, height: 8, borderRadius: 2, border: `1.5px solid ${f.enabled ? f.color : theme.border}`, background: f.enabled ? f.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.enabled && <svg width="5" height="5" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <span style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Connection Types</span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                            {Object.entries(edgeColors).map(([type, color]) => <span key={type} style={{ fontSize: 8, display: 'flex', alignItems: 'center', gap: 3, color: theme.textDim }}><span style={{ width: 10, height: 3, borderRadius: 1, background: color }} />{type}</span>)}
                                        </div>
                                    </div>
                                </div>}
                            </div>

                            {/* LPR Layer */}
                            <div style={{ border: `1px solid ${layerLPR ? '#10b98130' : theme.border}`, borderRadius: 6, padding: 8, background: layerLPR ? 'rgba(16,185,129,0.03)' : 'transparent' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: layerLPR ? 8 : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 12 }}>🚗</span>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: layerLPR ? '#10b981' : theme.text }}>Plate Recognition</span>
                                    </div>
                                    <button onClick={() => setLayerLPR(!layerLPR)} style={{ width: 32, height: 16, borderRadius: 8, border: 'none', background: layerLPR ? '#10b981' : theme.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff', position: 'absolute', top: 2, left: layerLPR ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                                    </button>
                                </div>
                                {layerLPR && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ fontSize: 9, color: theme.textDim }}>{mockLPR.length} sightings · {new Set(mockLPR.map(l => l.plate)).size} unique plates · Route trails shown</div>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                        {Array.from(new Set(mockLPR.map(l => l.plate))).slice(0, 5).map(plate => {
                                            const lpr = mockLPR.find(l => l.plate === plate)!;
                                            const count = mockLPR.filter(l => l.plate === plate).length;
                                            return <span key={plate} style={{ fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: 3 }}>{plate}<span style={{ fontSize: 7, color: theme.textDim }}>×{count}</span></span>;
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                        {[['🟢', '≥95%'], ['🟡', '85-94%'], ['🔴', '<85%']].map(([ico, lbl]) => <span key={lbl} style={{ fontSize: 8, color: theme.textDim, display: 'flex', alignItems: 'center', gap: 2 }}>{ico} {lbl}</span>)}
                                    </div>
                                </div>}
                            </div>

                            {/* Face Recognition Layer */}
                            <div style={{ border: `1px solid ${layerFace ? '#ec489930' : theme.border}`, borderRadius: 6, padding: 8, background: layerFace ? 'rgba(236,72,153,0.03)' : 'transparent' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: layerFace ? 8 : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 12 }}>🧑‍🦲</span>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: layerFace ? '#ec4899' : theme.text }}>Face Recognition</span>
                                    </div>
                                    <button onClick={() => setLayerFace(!layerFace)} style={{ width: 32, height: 16, borderRadius: 8, border: 'none', background: layerFace ? '#ec4899' : theme.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff', position: 'absolute', top: 2, left: layerFace ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                                    </button>
                                </div>
                                {layerFace && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ fontSize: 9, color: theme.textDim }}>{mockFaces.length} captures · {mockFaces.filter(f => f.personId > 0).length} matched · {mockFaces.filter(f => f.personId === 0).length} unidentified</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {mockFaces.filter(f => f.personId > 0).slice(0, 5).map(fr => {
                                            const riskColor = fr.risk === 'Critical' ? '#ef4444' : fr.risk === 'High' ? '#f97316' : fr.risk === 'Medium' ? '#f59e0b' : '#6b7280';
                                            return <div key={fr.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9 }}>
                                                <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${riskColor}`, background: fr.personAvatar ? `url(${fr.personAvatar}) center/cover` : 'rgba(13,18,32,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, flexShrink: 0 }}>{fr.personAvatar ? '' : '👤'}</div>
                                                <span style={{ color: theme.text, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{fr.personName}</span>
                                                <span style={{ color: fr.confidence >= 90 ? '#22c55e' : '#f59e0b', fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 700 }}>{fr.confidence}%</span>
                                            </div>;
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                        {[['🟢', '≥90%'], ['🟡', '75-89%'], ['🔴', '<75%'], ['⚫', 'Unknown']].map(([ico, lbl]) => <span key={lbl} style={{ fontSize: 8, color: theme.textDim, display: 'flex', alignItems: 'center', gap: 2 }}>{ico} {lbl}</span>)}
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </Section>
                    <Section title="Tiles" icon={Ico.tiles} badge={active3D ? 1 : 0}>
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>2D Base Maps</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 12 }}>
                                {tiles2D.map(t => { const isActive = activeTile === t.id; return (
                                    <button key={t.id} onClick={() => setActiveTile(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 2px', borderRadius: 6, border: `1.5px solid ${isActive ? theme.accent : theme.border}`, background: isActive ? theme.accentDim : 'transparent', cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit' }} onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')} onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}>
                                        <span style={{ fontSize: 16 }}>{t.preview}</span>
                                        <span style={{ fontSize: 8, fontWeight: 600, color: isActive ? theme.accent : theme.textDim, lineHeight: 1.1, textAlign: 'center' }}>{t.name}</span>
                                    </button>
                                ); })}
                            </div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>3D Modes</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                                {tiles3D.map(t => { const isActive = active3D === t.id; return (
                                    <button key={t.id} onClick={() => setActive3D(isActive ? null : t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 2px', borderRadius: 6, border: `1.5px solid ${isActive ? '#8b5cf6' : theme.border}`, background: isActive ? 'rgba(139,92,246,0.08)' : 'transparent', cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit' }} onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')} onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}>
                                        <span style={{ fontSize: 18 }}>{t.preview}</span>
                                        <span style={{ fontSize: 8, fontWeight: 600, color: isActive ? '#8b5cf6' : theme.textDim, lineHeight: 1.1, textAlign: 'center' }}>{t.name}</span>
                                    </button>
                                ); })}
                            </div>
                            {active3D && <div style={{ marginTop: 8, padding: '5px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', fontSize: 9, color: 'rgba(139,92,246,0.7)' }}>3D mode active: {tiles3D.find(t => t.id === active3D)?.name}. Click again to disable.</div>}
                        </div>
                    </Section>
                    <Section title="Tools" icon={Ico.tools} badge={(rulerActive ? 1 : 0) + (zoneDrawing ? 1 : 0)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {/* Ruler */}
                            <div style={{ border: `1px solid ${rulerActive ? '#f59e0b30' : theme.border}`, borderRadius: 6, padding: 8, background: rulerActive ? 'rgba(245,158,11,0.03)' : 'transparent' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={rulerActive ? '#f59e0b' : theme.textDim} strokeWidth="1.5" strokeLinecap="round"><path d="M2 14L14 2"/><path d="M5 14L2 14L2 11"/><path d="M11 2L14 2L14 5"/><line x1="4" y1="10" x2="6" y2="12"/><line x1="6" y1="8" x2="8" y2="10"/><line x1="8" y1="6" x2="10" y2="8"/></svg>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: rulerActive ? '#f59e0b' : theme.text }}>Ruler</span>
                                    </div>
                                    <button onClick={() => { if (rulerActive) { stopRuler(); } else { setRulerPoints([]); setRulerActive(true); setZoneDrawing(null); } }} style={{ padding: '3px 10px', borderRadius: 4, border: `1px solid ${rulerActive ? '#f59e0b50' : theme.border}`, background: rulerActive ? 'rgba(245,158,11,0.1)' : 'transparent', color: rulerActive ? '#f59e0b' : theme.textDim, fontSize: 9, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{rulerActive ? 'Stop' : 'Start'}</button>
                                </div>
                                <div style={{ fontSize: 9, color: theme.textDim, marginBottom: rulerPoints.length > 0 ? 8 : 0 }}>
                                    {rulerActive ? 'Click on the map to add measurement points.' : 'Measure distance between multiple points on the map.'}
                                </div>

                                {rulerPoints.length > 0 && <>
                                    {/* Points list */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 120, overflowY: 'auto', marginBottom: 6 }}>
                                        {rulerPoints.map((pt, i) => {
                                            const segDist = i > 0 ? calcDistance([rulerPoints[i - 1], pt]) : 0;
                                            return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
                                                <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '1.5px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 800, color: '#f59e0b', flexShrink: 0 }}>{i + 1}</div>
                                                <span style={{ fontSize: 9, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", flex: 1 }}>{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</span>
                                                {i > 0 && <span style={{ fontSize: 8, fontWeight: 700, color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>+{formatDist(segDist)}</span>}
                                            </div>;
                                        })}
                                    </div>

                                    {/* Total distance */}
                                    {rulerPoints.length >= 2 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 5, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 6 }}>
                                        <span style={{ fontSize: 9, fontWeight: 600, color: theme.textSecondary }}>Total Distance</span>
                                        <span style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>{formatDist(calcDistance(rulerPoints))}</span>
                                    </div>}

                                    {/* Segment count */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 9, color: theme.textDim, marginBottom: 6 }}>
                                        <span>{rulerPoints.length} point{rulerPoints.length !== 1 ? 's' : ''}</span>
                                        {rulerPoints.length >= 2 && <span>· {rulerPoints.length - 1} segment{rulerPoints.length - 1 !== 1 ? 's' : ''}</span>}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button onClick={undoRulerPoint} style={{ flex: 1, padding: '5px 0', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent + '50'; e.currentTarget.style.color = theme.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textDim; }}>Undo</button>
                                        <button onClick={clearRuler} style={{ flex: 1, padding: '5px 0', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', color: theme.danger, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Clear All</button>
                                    </div>
                                </>}
                            </div>

                            {/* Zone Editor */}
                            <div style={{ border: `1px solid ${zoneDrawing ? '#8b5cf630' : theme.border}`, borderRadius: 6, padding: 8, background: zoneDrawing ? 'rgba(139,92,246,0.03)' : 'transparent' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={zoneDrawing ? '#8b5cf6' : theme.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3,2 13,2 15,8 10,14 6,14 1,8"/></svg>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: zoneDrawing ? '#8b5cf6' : theme.text }}>Zone Editor</span>
                                        <span style={{ fontSize: 8, fontWeight: 600, color: theme.textDim, background: theme.bgInput, padding: '1px 5px', borderRadius: 3 }}>{zones.length}</span>
                                    </div>
                                    <button onClick={openAddZone} style={{ padding: '3px 8px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.accent, fontSize: 9, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>+ Add</button>
                                </div>

                                {/* Draw buttons */}
                                {!zoneDrawing && <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                                    <button onClick={() => startDrawZone('circle')} style={{ flex: 1, padding: '5px 0', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf650'; e.currentTarget.style.color = '#8b5cf6'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textDim; }}><svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/></svg>Draw Circle</button>
                                    <button onClick={() => startDrawZone('polygon')} style={{ flex: 1, padding: '5px 0', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf650'; e.currentTarget.style.color = '#8b5cf6'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textDim; }}><svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><polygon points="3,12 8,2 13,12"/></svg>Draw Polygon</button>
                                </div>}

                                {/* Drawing mode */}
                                {zoneDrawing && <div style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', marginBottom: 6, fontSize: 9, color: '#8b5cf6', fontWeight: 600 }}>Drawing active — see map for instructions</div>}

                                {/* Zone search */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px', marginBottom: 4 }}>
                                    <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                                    <input value={zoneSearch} onChange={e => setZoneSearch(e.target.value)} placeholder="Search zones..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '4px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                                    {zoneSearch && <button onClick={() => setZoneSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 0, display: 'flex' }}><svg width="7" height="7" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}
                                </div>

                                {/* Zone list */}
                                {filteredZones.length === 0 && <div className="tmap-empty">{zoneSearch ? 'No matching zones.' : 'No zones defined.'}</div>}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 180, overflowY: 'auto' }}>
                                    {filteredZones.map(z => {
                                        const isHidden = hiddenZones.has(z.id);
                                        return (
                                        <div key={z.id} onClick={() => goToZone(z)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 6px', borderRadius: 5, border: `1px solid ${theme.border}`, cursor: 'pointer', transition: 'all 0.1s', opacity: isHidden ? 0.4 : 1 }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = z.color + '40'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = theme.border; }}>
                                            <button onClick={e => { e.stopPropagation(); toggleZoneVisibility(z.id); }} style={{ background: 'none', border: 'none', color: isHidden ? theme.textDim : z.color, cursor: 'pointer', padding: 1, display: 'flex', flexShrink: 0 }} title={isHidden ? 'Show zone' : 'Hide zone'}>{isHidden ? <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/><circle cx="8" cy="8" r="2"/><line x1="3" y1="13" x2="13" y2="3"/></svg> : <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/><circle cx="8" cy="8" r="2"/></svg>}</button>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 10, fontWeight: 600, color: isHidden ? theme.textDim : theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, textDecoration: isHidden ? 'line-through' : 'none' }}>{z.name}</div>
                                                <div style={{ fontSize: 8, color: theme.textDim }}>{zoneTypes.find(t => t.id === z.type)?.icon} {zoneTypes.find(t => t.id === z.type)?.label} · {z.shape === 'circle' ? `${z.radius}m` : `${z.points?.length || 0} pts`}</div>
                                            </div>
                                            <button onClick={e => { e.stopPropagation(); openEditZone(z); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = theme.accent)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)} title="Edit"><svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 2l3 3-8 8H3v-3z"/></svg></button>
                                            <button onClick={e => { e.stopPropagation(); setZoneDeleteConfirm(z); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = theme.danger)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)} title="Delete"><svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
                                        </div>);
                                    })}
                                </div>
                                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 8, color: theme.textDim }}>Right-click zone on map for options.</span>
                                    {hiddenZones.size > 0 && <button onClick={() => setHiddenZones(new Set())} style={{ fontSize: 8, fontWeight: 600, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Show All ({hiddenZones.size} hidden)</button>}
                                </div>
                            </div>
                        </div>
                    </Section>
                    <Section title="Intelligence" icon={Ico.intel}><div className="tmap-empty">Intelligence analysis panels coming soon.</div></Section>
                    <Section title="Objects" icon={Ico.objects} badge={mapObjects.length}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {/* Draw buttons */}
                            {!objDrawing && !placingMarker && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                                {(['marker', 'line', 'rectangle', 'polygon', 'freehand', 'circle'] as ObjType[]).map(t => <button key={t} onClick={() => t === 'marker' ? startPlacingMarker() : startObjDraw(t)} style={{ padding: '5px 2px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'center' as const, lineHeight: 1.3 }} onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent + '50'; e.currentTarget.style.color = theme.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textDim; }}><div style={{ fontSize: 12, marginBottom: 1 }}>{objTypeLabels[t].icon}</div>{objTypeLabels[t].label}</button>)}
                            </div>}
                            {objDrawing && <div style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 9, color: theme.accent, fontWeight: 600 }}>Drawing {objTypeLabels[objDrawing.type].label} — {objDrawing.points.length} pts <button onClick={() => setObjDrawing(null)} style={{ marginLeft: 6, fontSize: 8, color: theme.danger, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Cancel</button></div>}
                            {placingMarker && <div style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', fontSize: 9, color: '#ef4444', fontWeight: 600 }}>📌 Click on map to place marker <button onClick={() => setPlacingMarker(false)} style={{ marginLeft: 6, fontSize: 8, color: theme.danger, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Cancel</button></div>}
                            {/* Search */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                                <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                                <input value={objSearch} onChange={e => setObjSearch(e.target.value)} placeholder="Search objects..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '4px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                                {objSearch && <button onClick={() => setObjSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 0, display: 'flex' }}><svg width="7" height="7" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}
                            </div>
                            {/* Object list */}
                            {filteredObjects.length === 0 && <div className="tmap-empty">{objSearch ? 'No matching objects.' : 'No objects placed. Draw or add a marker.'}</div>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 200, overflowY: 'auto' }}>
                                {filteredObjects.map(o => {
                                    const hidden = !o.visible;
                                    return <div key={o.id} onClick={() => goToObj(o)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 6px', borderRadius: 5, border: `1px solid ${theme.border}`, cursor: 'pointer', opacity: hidden ? 0.4 : 1, transition: 'all 0.1s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = o.color + '40'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = theme.border; }}>
                                        <button onClick={e => { e.stopPropagation(); toggleObjVisibility(o.id); }} style={{ background: 'none', border: 'none', color: hidden ? theme.textDim : o.color, cursor: 'pointer', padding: 1, display: 'flex', flexShrink: 0, fontSize: 10 }} title={hidden ? 'Show' : 'Hide'}>{hidden ? <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/><circle cx="8" cy="8" r="2"/><line x1="3" y1="13" x2="13" y2="3"/></svg> : <span>{objTypeLabels[o.type].icon}</span>}</button>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 10, fontWeight: 600, color: hidden ? theme.textDim : theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, textDecoration: hidden ? 'line-through' : 'none' }}>{o.name || 'Untitled'}</div>
                                            <div style={{ fontSize: 8, color: theme.textDim }}>{objTypeLabels[o.type].label}{o.assignedTo ? ` · ${o.assignedTo.type === 'person' ? '👤' : '🏢'} ${o.assignedTo.name}` : ''}</div>
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); openEditObj(o); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = theme.accent)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 2l3 3-8 8H3v-3z"/></svg></button>
                                        <button onClick={e => { e.stopPropagation(); setObjDeleteConfirm(o); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = theme.danger)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
                                    </div>;
                                })}
                            </div>
                        </div>
                    </Section>
                    <Section title="Saved Places" icon={Ico.places}  badge={savedPlaces.length}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {/* Search + Add */}
                            <div style={{ display: 'flex', gap: 4 }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                                    <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                                    <input value={placesSearch} onChange={e => setPlacesSearch(e.target.value)} placeholder="Search saved..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                                    {placesSearch && <button onClick={() => setPlacesSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 0, display: 'flex' }}><svg width="7" height="7" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}
                                </div>
                                <button onClick={openAddPlace} title="Add place" style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.background = theme.accentDim; e.currentTarget.style.borderColor = theme.accent + '50'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = theme.border; }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg></button>
                                <button onClick={addCurrentLocation} title="Save current view" style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.color = theme.accent; e.currentTarget.style.borderColor = theme.accent + '50'; }} onMouseLeave={e => { e.currentTarget.style.color = theme.textDim; e.currentTarget.style.borderColor = theme.border; }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5"/><circle cx="8" cy="8" r="1.5"/><line x1="8" y1="1" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/></svg></button>
                            </div>

                            {/* Place list */}
                            {filteredPlaces.length === 0 && <div className="tmap-empty">{placesSearch ? 'No matching places.' : 'No saved places.'}</div>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 220, overflowY: 'auto' }}>
                                {filteredPlaces.map(p => (
                                    <div key={p.id} onClick={() => goToPlace(p)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, cursor: 'pointer', transition: 'all 0.1s', background: 'transparent' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = p.color + '40'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = theme.border; }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0, boxShadow: `0 0 6px ${p.color}40` }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.name}</div>
                                            {p.note && <div style={{ fontSize: 8, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.note}</div>}
                                        </div>
                                        <span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{p.lat.toFixed(1)}, {p.lng.toFixed(1)}</span>
                                        <button onClick={e => { e.stopPropagation(); openEditPlace(p); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = theme.accent)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)} title="Edit"><svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 2l3 3-8 8H3v-3z"/></svg></button>
                                        <button onClick={e => { e.stopPropagation(); setDeleteConfirm(p); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = theme.danger)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)} title="Delete"><svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
                                    </div>
                                ))}
                            </div>

                            {/* Add/Edit Modal */}
                            {placeModal && <div style={{ background: theme.bgCard, border: `1px solid ${theme.accent}30`, borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: theme.accent, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{placeModal.mode === 'add' ? '+ New Place' : '✎ Edit Place'}</div>
                                <input value={placeForm.name} onChange={e => setPlaceForm(f => ({ ...f, name: e.target.value }))} placeholder="Place name *" style={{ width: '100%', padding: '6px 8px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.text, fontSize: 11, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <input value={placeForm.lat} onChange={e => setPlaceForm(f => ({ ...f, lat: e.target.value }))} placeholder="Latitude *" style={{ flex: 1, padding: '6px 8px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.text, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: 'none', minWidth: 0 }} />
                                    <input value={placeForm.lng} onChange={e => setPlaceForm(f => ({ ...f, lng: e.target.value }))} placeholder="Longitude *" style={{ flex: 1, padding: '6px 8px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.text, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: 'none', minWidth: 0 }} />
                                    <input value={placeForm.zoom} onChange={e => setPlaceForm(f => ({ ...f, zoom: e.target.value }))} placeholder="Z" style={{ width: 36, padding: '6px 4px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.text, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: 'none', textAlign: 'center' as const }} />
                                </div>
                                <input value={placeForm.note} onChange={e => setPlaceForm(f => ({ ...f, note: e.target.value }))} placeholder="Note (optional)" style={{ width: '100%', padding: '6px 8px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.text, fontSize: 10, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 9, color: theme.textDim, marginRight: 2 }}>Color</span>
                                    {placeColors.map(c => <button key={c} onClick={() => setPlaceForm(f => ({ ...f, color: c }))} style={{ width: 16, height: 16, borderRadius: 4, background: c, border: placeForm.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', padding: 0, boxShadow: placeForm.color === c ? `0 0 6px ${c}60` : 'none' }} />)}
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                                    <button onClick={savePlace} disabled={!placeForm.name.trim() || !placeForm.lat || !placeForm.lng} style={{ flex: 1, padding: '6px 0', borderRadius: 5, border: 'none', background: (!placeForm.name.trim() || !placeForm.lat || !placeForm.lng) ? theme.border : theme.accent, color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'inherit', cursor: (!placeForm.name.trim() || !placeForm.lat || !placeForm.lng) ? 'not-allowed' : 'pointer', opacity: (!placeForm.name.trim() || !placeForm.lat || !placeForm.lng) ? 0.4 : 1 }}>{placeModal.mode === 'add' ? 'Save Place' : 'Update Place'}</button>
                                    <button onClick={() => setPlaceModal(null)} style={{ padding: '6px 14px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 10, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </div>}

                            {/* Delete Confirmation */}
                            {deleteConfirm && <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 12, marginTop: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.danger} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="9"/><circle cx="8" cy="11.5" r="0.5" fill={theme.danger}/></svg>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: theme.danger, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Delete Place</span>
                                </div>
                                <div style={{ fontSize: 11, color: theme.text, marginBottom: 4 }}>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</div>
                                <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 10 }}>This action cannot be undone.</div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={confirmDeletePlace} style={{ flex: 1, padding: '6px 0', borderRadius: 5, border: 'none', background: theme.danger, color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>Delete</button>
                                    <button onClick={() => setDeleteConfirm(null)} style={{ padding: '6px 14px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 10, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </div>}
                        </div>
                    </Section>

                    {/* SETTINGS */}
                    <Section title="Settings" icon={Ico.settings} >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Toggle label="World Minimap" description="Satellite overview map in top-right" enabled={showMinimap} onChange={setShowMinimap} />
                            <Toggle label="Compass" description="Bearing indicator in bottom-left" enabled={showCompass} onChange={setShowCompass} />
                            <Toggle label="Map Controls" description="Zoom, fullscreen, rotation buttons" enabled={showControls} onChange={setShowControls} />
                            <Toggle label="Show Labels" description="Place and road names on map" enabled={showLabels} onChange={setShowLabels} />
                            <Toggle label="Show Zones" description="Display zone overlays on map" enabled={showZones} onChange={setShowZones} />
                            <Toggle label="Localization" description="Add local language names alongside English" enabled={showLocalization} onChange={setShowLocalization} />
                            <Toggle label="Coordinates" description="Lat/lng, zoom and bearing bar" enabled={showCoords} onChange={setShowCoords} />
                            <Toggle label="Place Search" description="Search bar for locations on map" enabled={showSearch} onChange={setShowSearch} />
                            <Toggle label="FPS Counter" description="Frames per second display" enabled={showFps} onChange={setShowFps} />
                        </div>
                    </Section>
                </div>
            </div>

            {/* Map */}
            <div className="tmap-container">
                <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

                {/* Loading */}
                {!loaded && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0e16', zIndex: 20 }}>
                    {/* Animated rings */}
                    <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 20 }}>
                        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', inset: 0, animation: 'argux-spin 3s linear infinite' }}>
                            <circle cx="60" cy="60" r="54" fill="none" stroke={theme.border} strokeWidth="1" />
                            <circle cx="60" cy="60" r="54" fill="none" stroke={theme.accent} strokeWidth="2" strokeDasharray="40 300" strokeLinecap="round" />
                        </svg>
                        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', inset: 0, animation: 'argux-spin 2s linear infinite reverse' }}>
                            <circle cx="60" cy="60" r="44" fill="none" stroke={theme.border} strokeWidth="0.5" />
                            <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5" strokeDasharray="25 250" strokeLinecap="round" />
                        </svg>
                        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', inset: 0, animation: 'argux-spin 5s linear infinite' }}>
                            <circle cx="60" cy="60" r="34" fill="none" stroke={theme.border} strokeWidth="0.5" />
                            <circle cx="60" cy="60" r="34" fill="none" stroke="rgba(34,197,94,0.5)" strokeWidth="1" strokeDasharray="15 200" strokeLinecap="round" />
                        </svg>
                        {/* Center crosshair */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
                                <circle cx="14" cy="14" r="4" /><line x1="14" y1="2" x2="14" y2="8" /><line x1="14" y1="20" x2="14" y2="26" /><line x1="2" y1="14" x2="8" y2="14" /><line x1="20" y1="14" x2="26" y2="14" />
                            </svg>
                        </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, letterSpacing: '0.1em', marginBottom: 6 }}>TACTICAL MAP</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 16 }}>Initializing MapLibre GL JS</div>
                    {/* Progress steps */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                        {['Loading map engine', 'Fetching tile sources', 'Configuring overlays'].map((step, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, animation: `argux-fadeIn 0.4s ease-out ${i * 0.3}s both` }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', border: `1.5px solid ${theme.accent}`, background: theme.accentDim, animation: 'argux-spin 1.5s linear infinite', animationDelay: `${i * 0.2}s` }} />
                                <span style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{step}...</span>
                            </div>
                        ))}
                    </div>
                </div>}

                {/* TOP-LEFT: Place Search */}
                {showSearch && loaded && <div ref={searchRef} style={{ position: 'absolute', top: 10, left: 10, zIndex: 15, width: 300 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(13,18,32,0.92)', border: `1px solid ${searchFocused ? theme.accent + '60' : theme.border}`, borderRadius: 8, padding: '0 10px', backdropFilter: 'blur(8px)', transition: 'border-color 0.15s' }}>
                        {searchLoading ? <div style={{ width: 13, height: 13, border: `2px solid ${theme.border}`, borderTop: `2px solid ${theme.accent}`, borderRadius: '50%', animation: 'argux-spin 0.6s linear infinite', flexShrink: 0 }} /> : <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={searchFocused ? theme.accent : theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>}
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setSearchFocused(true)} placeholder="Search any place worldwide..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', display: 'flex', padding: 2 }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}
                    </div>
                    {searchFocused && searchResults.length > 0 && <div style={{ marginTop: 4, background: 'rgba(13,18,32,0.95)', border: `1px solid ${theme.border}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', maxHeight: 340, overflowY: 'auto' }}>
                        {searchResults.map((r, i) => (
                            <div key={i} onClick={() => handleSearchSelect(r)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: i < searchResults.length - 1 ? `1px solid ${theme.border}` : 'none', transition: 'background 0.1s', display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M8 1C5.24 1 3 3.24 3 6c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z"/><circle cx="8" cy="6" r="1.5"/></svg>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.name}</div>
                                    <div style={{ fontSize: 9, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.sub}</div>
                                </div>
                                <span style={{ fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{r.lat.toFixed(2)}, {r.lng.toFixed(2)}</span>
                            </div>
                        ))}
                        <div style={{ padding: '4px 12px 5px', borderTop: `1px solid ${theme.border}`, fontSize: 8, color: theme.textDim, textAlign: 'center' }}>Powered by OpenStreetMap Nominatim</div>
                    </div>}
                    {searchFocused && !searchLoading && searchQuery.trim().length >= 2 && searchResults.length === 0 && <div style={{ marginTop: 4, background: 'rgba(13,18,32,0.95)', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '12px 14px', textAlign: 'center', fontSize: 11, color: theme.textDim, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>No places found for "{searchQuery}"</div>}
                    {searchFocused && searchLoading && searchResults.length === 0 && <div style={{ marginTop: 4, background: 'rgba(13,18,32,0.95)', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '12px 14px', textAlign: 'center', fontSize: 11, color: theme.textDim, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>Searching...</div>}
                </div>}

                {/* TOP-RIGHT: Minimap */}
                {showMinimap && loaded && <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 5 }}><Minimap center={coords} zoom={zoom} onNavigate={handleMinimapNav} /></div>}

                {/* BOTTOM-LEFT: Compass */}
                {showCompass && loaded && <div style={{ position: 'absolute', bottom: 60, left: 12, zIndex: 5 }}><Compass bearing={bearing} /></div>}

                {/* BOTTOM-RIGHT: Map Controls */}
                {showControls && loaded && <div style={{ position: 'absolute', bottom: 30, right: 12, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <MapBtn onClick={handleZoomIn} title="Zoom In"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="4" x2="8" y2="12"/><line x1="4" y1="8" x2="12" y2="8"/></svg></MapBtn>
                    <MapBtn onClick={handleZoomOut} title="Zoom Out"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="8" x2="12" y2="8"/></svg></MapBtn>
                    <div style={{ height: 1, background: theme.border, margin: '2px 4px' }} />
                    <MapBtn onClick={handleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} active={isFullscreen}>{isFullscreen ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="6,2 6,6 2,6"/><polyline points="10,14 10,10 14,10"/><polyline points="14,6 10,6 10,2"/><polyline points="2,10 6,10 6,14"/></svg> : <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="2,6 2,2 6,2"/><polyline points="14,10 14,14 10,14"/><polyline points="10,2 14,2 14,6"/><polyline points="6,14 2,14 2,10"/></svg>}</MapBtn>
                    <div style={{ height: 1, background: theme.border, margin: '2px 4px' }} />
                    <MapBtn onClick={handleRotateCCW} title="Rotate Left"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 7a5 5 0 019 1"/><polyline points="2,4 4,7 7,5"/></svg></MapBtn>
                    <MapBtn onClick={handleResetNorth} title="Reset North" active={Math.abs(bearing) > 1}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="8,2 13,14 8,10 3,14"/></svg></MapBtn>
                    <MapBtn onClick={handleRotateCW} title="Rotate Right"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 7a5 5 0 00-9 1"/><polyline points="14,4 12,7 9,5"/></svg></MapBtn>
                </div>}

                {/* Timeline Toggle */}
                {loaded && <button onClick={() => { setTimelineOpen(!timelineOpen); if (!timelineOpen) { setTimelineCursor(100); setTlTrackingPerson(null); setTlTrackStep(-1); } setTimelinePlaying(false); }} style={{ position: 'absolute', bottom: timelineOpen ? 282 : (showCoords ? 36 : 10), left: '50%', transform: 'translateX(-50%)', zIndex: 15, background: timelineOpen ? 'rgba(59,130,246,0.15)' : 'rgba(13,18,32,0.9)', border: `1px solid ${timelineOpen ? '#3b82f650' : theme.border}`, borderRadius: 8, padding: '6px 14px', cursor: 'pointer', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 6, transition: 'bottom 0.3s ease, background 0.2s', fontFamily: 'inherit' }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={timelineOpen ? '#3b82f6' : theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><polyline points="8,5 8,8 11,8"/></svg>
                    <span style={{ fontSize: 10, fontWeight: 700, color: timelineOpen ? '#3b82f6' : theme.textDim }}>Timeline</span>
                    {timelineActive && <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: 3, background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f630' }}>ACTIVE</span>}
                    {tlTrackingPerson && <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: 3, background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e30' }}>TRACKING</span>}
                    {(dateFrom || dateTo) && <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: 3, background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b30' }}>PERIOD</span>}
                </button>}

                {/* Timeline Panel */}
                {timelineOpen && loaded && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 12, background: 'rgba(10,14,22,0.96)', borderTop: `1px solid ${theme.border}`, backdropFilter: 'blur(12px)' }}>
                    {/* Row 1: Transport + time + stats + tracking */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderBottom: `1px solid ${theme.border}20`, flexWrap: 'wrap' }}>
                        <button onClick={() => { if (timelineCursor >= 100) setTimelineCursor(0); setTimelinePlaying(!timelinePlaying); }} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${timelinePlaying ? '#3b82f650' : theme.border}`, background: timelinePlaying ? 'rgba(59,130,246,0.12)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: timelinePlaying ? '#3b82f6' : theme.textDim, flexShrink: 0 }}>
                            {timelinePlaying ? <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="3" width="4" height="10" rx="1"/><rect x="9" y="3" width="4" height="10" rx="1"/></svg> : <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><polygon points="4,2 14,8 4,14"/></svg>}
                        </button>
                        <button onClick={() => setTimelineCursor(Math.max(0, timelineCursor - 2))} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, flexShrink: 0, padding: 0 }}><svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor"><polygon points="10,2 4,8 10,14"/></svg></button>
                        <button onClick={() => setTimelineCursor(Math.min(100, timelineCursor + 2))} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, flexShrink: 0, padding: 0 }}><svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor"><polygon points="6,2 12,8 6,14"/></svg></button>
                        <div style={{ display: 'flex', gap: 2 }}>{[0.5, 1, 2, 4].map(s => <button key={s} onClick={() => setTimelineSpeed(s)} style={{ padding: '2px 5px', borderRadius: 3, border: `1px solid ${timelineSpeed === s ? '#3b82f640' : theme.border}`, background: timelineSpeed === s ? 'rgba(59,130,246,0.1)' : 'transparent', color: timelineSpeed === s ? '#3b82f6' : theme.textDim, fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer' }}>{s}×</button>)}</div>
                        <button onClick={() => setTlLoop(!tlLoop)} title="Loop playback" style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${tlLoop ? '#8b5cf640' : theme.border}`, background: tlLoop ? 'rgba(139,92,246,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tlLoop ? '#8b5cf6' : theme.textDim, flexShrink: 0, padding: 0, fontSize: 10 }}>🔁</button>
                        <button onClick={() => { const last = visibleTLEvents[visibleTLEvents.length - 1]; if (last && mapRef.current) mapRef.current.flyTo({ center: [last.lng, last.lat], zoom: 15, duration: 600 }); }} title="Center on latest event" style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, flexShrink: 0, padding: 0, fontSize: 10 }}>🎯</button>
                        <button onClick={tlZoomToFit} title="Zoom to fit all visible events" style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, flexShrink: 0, padding: 0, fontSize: 10 }}>🔎</button>
                        <button onClick={tlJumpToCritical} title="Jump to next critical event" style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${tlStats.bySev.critical > 0 ? '#ef444440' : theme.border}`, background: tlStats.bySev.critical > 0 ? 'rgba(239,68,68,0.06)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tlStats.bySev.critical > 0 ? '#ef4444' : theme.textDim, flexShrink: 0, padding: 0, fontSize: 10 }}>⚠️</button>
                        <button onClick={() => setTlAutoFollow(!tlAutoFollow)} title="Auto-follow latest event during playback" style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${tlAutoFollow ? '#06b6d440' : theme.border}`, background: tlAutoFollow ? 'rgba(6,182,212,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tlAutoFollow ? '#06b6d4' : theme.textDim, flexShrink: 0, padding: 0, fontSize: 10 }}>📡</button>
                        <div style={{ width: 1, height: 16, background: theme.border, flexShrink: 0 }} />
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: timelineActive ? '#3b82f6' : theme.text, letterSpacing: '0.03em', flexShrink: 0 }}>{fmtTlTime(tlCursorMs)}</div>
                        <span style={{ fontSize: 8, color: theme.textDim, flexShrink: 0 }}>{visibleTLEvents.length}/{filteredTLEvents.length}</span>
                        {(dateFrom || dateTo) && <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: '#f59e0b10', color: '#f59e0b', border: '1px solid #f59e0b20' }}>📅 {dateFrom || '∞'} → {dateTo || '∞'}</span>}
                        <div style={{ flex: 1 }} />
                        {/* Auto markers toggle */}
                        <button onClick={() => setTlAutoMarkers(!tlAutoMarkers)} style={{ padding: '2px 8px', borderRadius: 3, border: `1px solid ${tlAutoMarkers ? '#22c55e40' : theme.border}`, background: tlAutoMarkers ? 'rgba(34,197,94,0.08)' : 'transparent', color: tlAutoMarkers ? '#22c55e' : theme.textDim, fontSize: 8, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>📍 Markers {tlAutoMarkers ? 'ON' : 'OFF'}</button>
                        {/* Person tracking */}
                        <button onClick={() => setTlShowPersonPanel(!tlShowPersonPanel)} style={{ padding: '2px 8px', borderRadius: 3, border: `1px solid ${tlShowPersonPanel ? '#ec489940' : theme.border}`, background: tlShowPersonPanel ? 'rgba(236,72,153,0.08)' : 'transparent', color: tlShowPersonPanel ? '#ec4899' : theme.textDim, fontSize: 8, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>👤 Persons</button>
                        <button onClick={() => { setTimelineCursor(100); setTimelinePlaying(false); stopTracking(); }} style={{ padding: '2px 7px', borderRadius: 3, border: `1px solid ${theme.border}`, background: timelineCursor < 100 ? 'rgba(59,130,246,0.08)' : 'transparent', cursor: 'pointer', fontSize: 8, fontWeight: 700, color: timelineCursor < 100 ? '#3b82f6' : theme.textDim, fontFamily: 'inherit' }}>Reset</button>
                        <button onClick={() => { setTimelineOpen(false); setTimelinePlaying(false); setTimelineCursor(100); stopTracking(); }} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, flexShrink: 0, padding: 0, fontSize: 10 }}>✕</button>
                    </div>

                    {/* Tracking indicator */}
                    {tlTrackingPerson && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(34,197,94,0.06)', borderBottom: `1px solid #22c55e20` }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'tmap3d-pulse 1.5s infinite' }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e' }}>TRACKING: {tlPersonOptions.find(p => p.id === tlTrackingPerson)?.name}</span>
                        <span style={{ fontSize: 8, color: theme.textDim }}>Step {tlTrackStep + 1}/{tlTrackEvents.length} · {tlTracking3D ? '3D' : '2D'}</span>
                        <div style={{ flex: 1 }} />
                        <button onClick={() => { if (tlTrackStep > 0) setTlTrackStep(s => s - 1); }} style={{ padding: '1px 6px', borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, cursor: 'pointer', fontFamily: 'inherit' }}>◀ Prev</button>
                        <button onClick={() => { if (tlTrackStep < tlTrackEvents.length - 1) setTlTrackStep(s => s + 1); }} style={{ padding: '1px 6px', borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Next ▶</button>
                        <button onClick={stopTracking} style={{ padding: '1px 6px', borderRadius: 3, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: theme.danger, fontSize: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>Stop</button>
                    </div>}

                    {/* Stats bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 12px', borderBottom: `1px solid ${theme.border}15`, flexWrap: 'wrap' }}>
                        {[{ label: 'Critical', count: tlStats.bySev.critical, color: '#ef4444' }, { label: 'High', count: tlStats.bySev.high, color: '#f97316' }, { label: 'Medium', count: tlStats.bySev.medium, color: '#f59e0b' }, { label: 'Low', count: tlStats.bySev.low, color: '#6b7280' }, { label: 'Info', count: tlStats.bySev.info, color: '#3b82f6' }].map(s => (
                            <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8 }}>
                                <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                                <span style={{ color: s.count > 0 ? s.color : theme.textDim, fontWeight: 700 }}>{s.count}</span>
                                <span style={{ color: theme.textDim }}>{s.label}</span>
                            </span>
                        ))}
                        <span style={{ width: 1, height: 10, background: theme.border, flexShrink: 0 }} />
                        <span style={{ fontSize: 8, color: theme.textDim }}>👤 {tlStats.uniquePersons} persons</span>
                        <span style={{ fontSize: 8, color: theme.textDim }}>⚡ {tlStats.rate}/hr</span>
                        <div style={{ flex: 1 }} />
                        <button onClick={() => { /* mock export */ const el = document.createElement('a'); el.href = 'data:text/csv,' + encodeURIComponent('id,type,title,time,lat,lng,severity,person\n' + visibleTLEvents.map(e => `${e.id},${e.type},"${e.title}",${e.ts},${e.lat},${e.lng},${e.sev},${e.personName || ''}`).join('\n')); el.download = 'argux-timeline-export.csv'; el.click(); }} style={{ padding: '2px 7px', borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 7, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>📥 Export</button>
                        {tlHiddenIds.size > 0 && <button onClick={() => setTlHiddenIds(new Set())} style={{ padding: '2px 7px', borderRadius: 3, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: theme.danger, fontSize: 7, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>👁️ {tlHiddenIds.size} hidden · Show all</button>}
                    </div>

                    {/* Severity heatstrip */}
                    <div style={{ display: 'flex', height: 3, margin: '0 12px', borderRadius: 2, overflow: 'hidden' }}>
                        {filteredTLEvents.map((ev, i) => {
                            const sevC = ev.sev === 'critical' ? '#ef4444' : ev.sev === 'high' ? '#f97316' : ev.sev === 'medium' ? '#f59e0b' : ev.sev === 'low' ? '#6b7280' : '#3b82f6';
                            const evPct = ((new Date(ev.ts.replace(' ', 'T')).getTime() - tlStart) / tlRange) * 100;
                            const isPast = evPct <= timelineCursor;
                            return <div key={ev.id + i} style={{ flex: 1, background: isPast ? sevC : sevC + '25' }} />;
                        })}
                    </div>

                    {/* Scrubber */}
                    <div style={{ padding: '4px 12px 2px' }}>
                        <div style={{ display: 'flex', gap: 1, height: 20, alignItems: 'flex-end', marginBottom: 1 }}>
                            {tlDensity.map((d, i) => { const pct = ((i + 0.5) / 50) * 100; const past = pct <= timelineCursor; return <div key={i} style={{ flex: 1, height: `${Math.max(2, d * 100)}%`, background: past ? '#3b82f6' : `rgba(${d > 0.5 ? '239,68,68' : '107,114,128'},${0.15 + d * 0.3})`, borderRadius: '2px 2px 0 0', transition: 'background 0.1s' }} />; })}
                        </div>
                        <input type="range" min="0" max="100" step="0.1" value={timelineCursor} onChange={e => { setTimelineCursor(parseFloat(e.target.value)); setTimelinePlaying(false); }} style={{ width: '100%', height: 6, appearance: 'none', WebkitAppearance: 'none', background: `linear-gradient(to right, #3b82f6 ${timelineCursor}%, ${theme.border} ${timelineCursor}%)`, borderRadius: 3, outline: 'none', cursor: 'pointer', margin: '2px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, fontFamily: "'JetBrains Mono', monospace", color: theme.textDim }}><span>{fmtTlTime(tlStart)}</span><span>{fmtTlTime(tlStart + tlRange * 0.25)}</span><span>{fmtTlTime(tlStart + tlRange * 0.5)}</span><span>{fmtTlTime(tlStart + tlRange * 0.75)}</span><span>{fmtTlTime(tlEnd)}</span></div>
                    </div>

                    {/* Bottom: filters + person panel + event feed */}
                    <div style={{ display: 'flex', height: tlShowPersonPanel ? 140 : 100, borderTop: `1px solid ${theme.border}20`, marginTop: 2 }}>
                        {/* Type filters */}
                        <div style={{ width: 110, borderRight: `1px solid ${theme.border}20`, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, overflowY: 'auto' }}>
                            <div style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>Types</div>
                            {[{ id: 'lpr', icon: '🚗', label: 'LPR', color: '#10b981' }, { id: 'face', icon: '🧑‍🦲', label: 'Face', color: '#ec4899' }, { id: 'source', icon: '📡', label: 'Sources', color: '#3b82f6' }, { id: 'zone', icon: '🛡️', label: 'Zones', color: '#f59e0b' }, { id: 'object', icon: '📌', label: 'Objects', color: '#8b5cf6' }].map(f => {
                                const on = tlFilterTypes.has(f.id); const count = periodFilteredEvents.filter(e => e.type === f.id).length;
                                return <button key={f.id} onClick={() => toggleTlFilter(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 5px', borderRadius: 3, border: `1px solid ${on ? f.color + '40' : theme.border}`, background: on ? f.color + '08' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' }}><span style={{ fontSize: 9 }}>{f.icon}</span><span style={{ fontSize: 8, fontWeight: 600, color: on ? f.color : theme.textDim, flex: 1 }}>{f.label}</span><span style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{count}</span></button>;
                            })}
                            {tlPersonIds.size > 0 && <div style={{ marginTop: 4, paddingTop: 4, borderTop: `1px solid ${theme.border}20` }}>
                                <div style={{ fontSize: 7, fontWeight: 700, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Persons</div>
                                {Array.from(tlPersonIds).map(pid => { const p = tlPersonOptions.find(x => x.id === pid); return p ? <div key={pid} style={{ fontSize: 7, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 3, marginBottom: 1 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ec4899', flexShrink: 0 }} />{p.name}<button onClick={() => toggleTlPerson(pid)} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: 8, padding: 0, marginLeft: 'auto' }}>×</button></div> : null; })}
                            </div>}
                        </div>

                        {/* Person panel (toggleable) */}
                        {tlShowPersonPanel && <div style={{ width: 160, borderRight: `1px solid ${theme.border}20`, padding: '4px 8px', overflowY: 'auto', flexShrink: 0 }}>
                            <div style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Filter / Track Person</div>
                            {tlPersonOptions.map(p => {
                                const isFiltered = tlPersonIds.has(p.id);
                                const isTracking = tlTrackingPerson === p.id;
                                const evtCount = filteredTLEvents.filter(e => e.personId === p.id).length;
                                const avatar = mockPersons.find(x => x.id === p.id)?.avatar;
                                return <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 4px', borderRadius: 4, marginBottom: 2, background: isTracking ? 'rgba(34,197,94,0.08)' : isFiltered ? 'rgba(236,72,153,0.06)' : 'transparent', border: `1px solid ${isTracking ? '#22c55e30' : isFiltered ? '#ec489920' : 'transparent'}` }}>
                                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: avatar ? `url(${avatar}) center/cover` : 'rgba(59,130,246,0.15)', border: `1.5px solid ${isFiltered ? '#ec4899' : theme.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>{avatar ? '' : '👤'}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 8, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                        <div style={{ fontSize: 7, color: theme.textDim }}>{evtCount} events</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                        <button onClick={() => toggleTlPerson(p.id)} title="Filter" style={{ width: 16, height: 16, borderRadius: 3, border: `1px solid ${isFiltered ? '#ec489940' : theme.border}`, background: isFiltered ? 'rgba(236,72,153,0.1)' : 'transparent', color: isFiltered ? '#ec4899' : theme.textDim, fontSize: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>🔍</button>
                                        <button onClick={() => startTracking(p.id, false)} title="Track 2D" style={{ width: 16, height: 16, borderRadius: 3, border: `1px solid ${isTracking && !tlTracking3D ? '#22c55e40' : theme.border}`, background: isTracking && !tlTracking3D ? 'rgba(34,197,94,0.1)' : 'transparent', color: theme.textDim, fontSize: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>▶</button>
                                        <button onClick={() => startTracking(p.id, true)} title="Track 3D" style={{ width: 16, height: 16, borderRadius: 3, border: `1px solid ${isTracking && tlTracking3D ? '#8b5cf640' : theme.border}`, background: isTracking && tlTracking3D ? 'rgba(139,92,246,0.1)' : 'transparent', color: theme.textDim, fontSize: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontWeight: 700 }}>3D</button>
                                    </div>
                                </div>;
                            })}
                        </div>}

                        {/* Event feed */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2px 0', scrollbarWidth: 'thin' }}>
                            {visibleTLEvents.length === 0 && <div style={{ padding: 16, textAlign: 'center', fontSize: 10, color: theme.textDim }}>No events at this time position.{timelineCursor >= 100 ? ' Use the slider or press Play.' : ' Drag slider forward.'}</div>}
                            {[...visibleTLEvents].reverse().slice(0, 60).map((ev, idx) => {
                                const sevColor = ev.sev === 'critical' ? '#ef4444' : ev.sev === 'high' ? '#f97316' : ev.sev === 'medium' ? '#f59e0b' : ev.sev === 'low' ? '#6b7280' : '#3b82f6';
                                const isTrackEv = tlTrackingPerson && ev.personId === tlTrackingPerson;
                                const hasThumb = ev.type === 'face' || ev.type === 'lpr';
                                return <div key={ev.id + idx} onClick={() => { const map = mapRef.current; if (map) map.flyTo({ center: [ev.lng, ev.lat], zoom: Math.max(map.getZoom(), 15), duration: 600 }); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}10`, transition: 'background 0.1s', background: isTrackEv ? 'rgba(34,197,94,0.04)' : 'transparent' }} onMouseEnter={e => (e.currentTarget.style.background = isTrackEv ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)')} onMouseLeave={e => (e.currentTarget.style.background = isTrackEv ? 'rgba(34,197,94,0.04)' : 'transparent')}>
                                    <div style={{ width: 3, height: hasThumb ? 28 : 20, borderRadius: 2, background: sevColor, flexShrink: 0 }} />
                                    {hasThumb ? <div style={{ width: 24, height: 24, borderRadius: ev.type === 'face' ? '50%' : 4, overflow: 'hidden', border: `1.5px solid ${ev.color}`, flexShrink: 0 }}><img src={ev.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div> : <span style={{ fontSize: 12, flexShrink: 0, width: 24, textAlign: 'center' }}>{ev.icon}</span>}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 9, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {ev.title}
                                            <span style={{ fontSize: 7, fontWeight: 700, padding: '0 3px', borderRadius: 2, background: `${sevColor}15`, color: sevColor, border: `1px solid ${sevColor}25`, flexShrink: 0 }}>{ev.sev === 'critical' ? '!!!' : ev.sev === 'high' ? '!!' : ev.sev === 'medium' ? '!' : ''}</span>
                                        </div>
                                        <div style={{ fontSize: 7, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.sub}</div>
                                    </div>
                                    {ev.personName && <span style={{ fontSize: 7, color: '#ec4899', flexShrink: 0, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.personName}</span>}
                                    <span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, whiteSpace: 'nowrap' }}>{ev.ts.split(' ')[1]}</span>
                                </div>;
                            })}
                        </div>
                    </div>
                </div>}

                {/* Timeline Lightbox */}
                {tlLightbox && <div onClick={() => setTlLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', backdropFilter: 'blur(8px)' }}>
                    <img src={tlLightbox} style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }} />
                    <button onClick={() => setTlLightbox(null)} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>}

                {/* Timeline Marker Context Menu */}
                {tlMarkerCtx && <div onClick={() => setTlMarkerCtx(null)} style={{ position: 'fixed', inset: 0, zIndex: 100 }}><div onClick={e => e.stopPropagation()} style={{ position: 'absolute', left: tlMarkerCtx.x + (mapContainer.current?.getBoundingClientRect().left || 0), top: tlMarkerCtx.y + (mapContainer.current?.getBoundingClientRect().top || 0), zIndex: 101, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden', minWidth: 180 }}>
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {tlMarkerCtx.ev.photoUrl ? <img src={tlMarkerCtx.ev.photoUrl} style={{ width: 22, height: 22, borderRadius: tlMarkerCtx.ev.type === 'face' ? '50%' : 4, objectFit: 'cover', border: `2px solid ${tlMarkerCtx.ev.color}` }} /> : <span style={{ fontSize: 14 }}>{tlMarkerCtx.ev.icon}</span>}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tlMarkerCtx.ev.title}</div>
                            <div style={{ fontSize: 8, color: theme.textDim }}>{tlMarkerCtx.ev.ts}</div>
                        </div>
                    </div>
                    <div style={{ padding: '2px 0' }}>
                        {tlMarkerCtx.ev.type === 'face' && tlMarkerCtx.ev.personId && tlMarkerCtx.ev.personId > 0 && <button onClick={() => { router.visit(`/persons/${tlMarkerCtx.ev.personId}`); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.accent, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>👤 Person Details</button>}
                        {tlMarkerCtx.ev.type === 'lpr' && tlMarkerCtx.ev.vehicleId && tlMarkerCtx.ev.vehicleId > 0 && <button onClick={() => { router.visit(`/vehicles/${tlMarkerCtx.ev.vehicleId}`); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.accent, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>🚗 Vehicle Details</button>}
                        {tlMarkerCtx.ev.type === 'lpr' && tlMarkerCtx.ev.personId && tlMarkerCtx.ev.personId > 0 && <button onClick={() => { router.visit(`/persons/${tlMarkerCtx.ev.personId}`); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.textSecondary, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>👤 Owner Profile</button>}
                        {tlMarkerCtx.ev.type === 'lpr' && tlMarkerCtx.ev.orgId && <button onClick={() => { router.visit(`/organizations/${tlMarkerCtx.ev.orgId}`); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.textSecondary, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>🏢 Organization</button>}
                        {tlMarkerCtx.ev.cameraId && <button onClick={() => { router.visit(`/devices/${tlMarkerCtx.ev.cameraId}`); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.textSecondary, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>📹 Camera Details</button>}
                        {tlMarkerCtx.ev.photoUrl && <button onClick={() => { setTlLightbox(tlMarkerCtx.ev.photoUrl!); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.textSecondary, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>🔍 View Photo</button>}
                        <div style={{ height: 1, background: theme.border, margin: '2px 8px' }} />
                        <button onClick={() => { setTlHiddenIds(prev => new Set([...prev, tlMarkerCtx.ev.id])); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.danger, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>👁️‍🗨️ Hide from Map</button>
                    </div>
                </div></div>}

                {/* Coordinates */}
                {showCoords && loaded && <div className="tmap-coords" style={{ bottom: timelineOpen ? 282 : 8, transition: 'bottom 0.3s ease', zIndex: 15 }}><span>LAT {coords.lat.toFixed(5)}</span><span>LNG {coords.lng.toFixed(5)}</span><span>Z {zoom}</span><span>BRG {Math.round(bearing)}°</span></div>}

                {/* FPS Counter */}
                {showFps && loaded && <div style={{ position: 'absolute', top: showMinimap ? 118 : 10, right: 10, zIndex: 5, background: fps >= 50 ? 'rgba(34,197,94,0.12)' : fps >= 30 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${fps >= 50 ? '#22c55e30' : fps >= 30 ? '#f59e0b30' : '#ef444430'}`, borderRadius: 6, padding: '4px 10px', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: fps >= 50 ? '#22c55e' : fps >= 30 ? '#f59e0b' : '#ef4444' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: fps >= 50 ? '#22c55e' : fps >= 30 ? '#f59e0b' : '#ef4444' }}>{fps} FPS</span>
                </div>}

                {/* Zone Context Menu (right-click on zone) */}
                {zoneCtxMenu && <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', left: zoneCtxMenu.x, top: zoneCtxMenu.y, zIndex: 50, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden', minWidth: 180 }}>
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: zoneCtxMenu.zone.shape === 'circle' ? '50%' : 2, background: zoneCtxMenu.zone.color }} />
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{zoneCtxMenu.zone.name}</div>
                            <div style={{ fontSize: 8, color: theme.textDim }}>{zoneTypes.find(t => t.id === zoneCtxMenu.zone.type)?.icon} {zoneTypes.find(t => t.id === zoneCtxMenu.zone.type)?.label}</div>
                        </div>
                    </div>
                    <div style={{ padding: '2px 0' }}>
                        <button onClick={() => { setZoneEventsPanel(zoneCtxMenu.zone); goToZone(zoneCtxMenu.zone); setZoneCtxMenu(null); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="1"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="6" x2="6" y2="14"/></svg>Show Events</button>
                        <button onClick={() => { openEditZone(zoneCtxMenu.zone); setZoneCtxMenu(null); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round"><path d="M11 2l3 3-8 8H3v-3z"/></svg>Edit Zone</button>
                        <button onClick={() => { goToZone(zoneCtxMenu.zone); setZoneCtxMenu(null); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5"/><circle cx="8" cy="8" r="1.5"/></svg>Zoom to Zone</button>
                        <button onClick={() => { toggleZoneVisibility(zoneCtxMenu.zone.id); setZoneCtxMenu(null); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{hiddenZones.has(zoneCtxMenu.zone.id) ? <><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/><circle cx="8" cy="8" r="2"/></svg>Show Zone</> : <><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/><circle cx="8" cy="8" r="2"/><line x1="3" y1="13" x2="13" y2="3"/></svg>Hide Zone</>}</button>
                        <div style={{ height: 1, background: theme.border, margin: '2px 8px' }} />
                        <button onClick={() => { setZoneDeleteConfirm(zoneCtxMenu.zone); setZoneCtxMenu(null); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.danger, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 4h10M6 4V3h4v1M5 4v8.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5V4"/></svg>Delete Zone</button>
                    </div>
                </div>}

                {/* Marker Context Menu (right-click on person/org marker) */}
                {markerCtxMenu && <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', left: markerCtxMenu.x, top: markerCtxMenu.y, zIndex: 55, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden', minWidth: 190 }}>
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={markerCtxMenu.img} style={{ width: 22, height: 22, borderRadius: markerCtxMenu.type === 'person' ? '50%' : 4, objectFit: 'cover', border: `2px solid ${markerCtxMenu.riskColor}` }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{markerCtxMenu.name}</span>
                    </div>
                    <div style={{ padding: '2px 0' }}>
                        {(markerCtxMenu.type === 'person' ? [
                            { label: 'Profile', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>, href: `/persons/${markerCtxMenu.id}` },
                            { label: 'Vehicles', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textSecondary} strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="6" width="14" height="6" rx="1.5"/><circle cx="4.5" cy="12" r="1.5"/><circle cx="11.5" cy="12" r="1.5"/><path d="M3 6l2-3h6l2 3"/></svg>, href: `/persons/${markerCtxMenu.id}?tab=vehicles` },
                            { label: 'Devices', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textSecondary} strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="1" width="12" height="10" rx="1.5"/><line x1="5" y1="14" x2="11" y2="14"/><line x1="8" y1="11" x2="8" y2="14"/></svg>, href: `/persons/${markerCtxMenu.id}?tab=devices` },
                            { label: 'Connections', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textSecondary} strokeWidth="1.5" strokeLinecap="round"><circle cx="4" cy="4" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="8" cy="12" r="2"/><line x1="5.5" y1="5.5" x2="6.5" y2="10.5"/><line x1="10.5" y1="5.5" x2="9.5" y2="10.5"/><line x1="6" y1="4" x2="10" y2="4"/></svg>, href: `/persons/${markerCtxMenu.id}?tab=connections` },
                            { label: 'AI Assistant', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="10" rx="2"/><path d="M5 7h6M5 9h3"/></svg>, href: `/persons/${markerCtxMenu.id}?tab=ai` },
                            { label: 'Notes', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textSecondary} strokeWidth="1.5" strokeLinecap="round"><path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="8" y2="11"/></svg>, href: `/persons/${markerCtxMenu.id}?tab=notes` },
                        ] : [
                            { label: 'Company Profile', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="4" width="12" height="10" rx="1"/><path d="M5 4V2h6v2"/><line x1="2" y1="8" x2="14" y2="8"/></svg>, href: `/organizations/${markerCtxMenu.id}` },
                            { label: 'Vehicles', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textSecondary} strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="6" width="14" height="6" rx="1.5"/><circle cx="4.5" cy="12" r="1.5"/><circle cx="11.5" cy="12" r="1.5"/><path d="M3 6l2-3h6l2 3"/></svg>, href: `/organizations/${markerCtxMenu.id}?tab=vehicles` },
                            { label: 'Devices', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textSecondary} strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="1" width="12" height="10" rx="1.5"/><line x1="5" y1="14" x2="11" y2="14"/><line x1="8" y1="11" x2="8" y2="14"/></svg>, href: `/organizations/${markerCtxMenu.id}?tab=devices` },
                            { label: 'Connections', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textSecondary} strokeWidth="1.5" strokeLinecap="round"><circle cx="4" cy="4" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="8" cy="12" r="2"/><line x1="5.5" y1="5.5" x2="6.5" y2="10.5"/><line x1="10.5" y1="5.5" x2="9.5" y2="10.5"/><line x1="6" y1="4" x2="10" y2="4"/></svg>, href: `/organizations/${markerCtxMenu.id}?tab=connections` },
                            { label: 'AI Assistant', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="10" rx="2"/><path d="M5 7h6M5 9h3"/></svg>, href: `/organizations/${markerCtxMenu.id}?tab=ai` },
                            { label: 'Notes', icon: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textSecondary} strokeWidth="1.5" strokeLinecap="round"><path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="8" y2="11"/></svg>, href: `/organizations/${markerCtxMenu.id}?tab=notes` },
                        ]).map((item, i) => (
                            <a key={i} href={item.href} onClick={() => setMarkerCtxMenu(null)} style={{ display: 'flex', width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', textDecoration: 'none', alignItems: 'center', gap: 8, boxSizing: 'border-box' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{item.icon}{item.label}</a>
                        ))}
                    </div>
                </div>}

                {/* Zone Add: Method Picker Overlay */}
                {zoneAddStep === 'pick' && <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={() => setZoneAddStep(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }} />
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 420, maxWidth: '92%', background: 'rgba(13,18,32,0.98)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 14, boxShadow: '0 24px 60px rgba(0,0,0,0.7)', padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round"><polygon points="3,2 13,2 15,8 10,14 6,14 1,8"/></svg>
                                <span style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Add New Zone</span>
                            </div>
                            <button onClick={() => setZoneAddStep(null)} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 4, display: 'flex' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
                        </div>
                        <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 16 }}>Choose how to create your zone — draw directly on the map or enter coordinates manually.</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                            {/* Draw Circle */}
                            <button onClick={() => startDrawAndClose('circle')} style={{ padding: '16px 12px', borderRadius: 10, border: `1.5px solid ${theme.border}`, background: 'rgba(139,92,246,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf680'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'rgba(139,92,246,0.03)'; }}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#8b5cf6" strokeWidth="1.5"><circle cx="16" cy="16" r="12" strokeDasharray="4 2"/><circle cx="16" cy="16" r="2" fill="#8b5cf6"/><line x1="16" y1="16" x2="28" y2="16" strokeDasharray="2 2" opacity="0.5"/></svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>Draw Circle</span>
                                <span style={{ fontSize: 9, color: theme.textDim, textAlign: 'center' }}>Click center then edge to set radius</span>
                            </button>
                            {/* Draw Polygon */}
                            <button onClick={() => startDrawAndClose('polygon')} style={{ padding: '16px 12px', borderRadius: 10, border: `1.5px solid ${theme.border}`, background: 'rgba(139,92,246,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf680'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'rgba(139,92,246,0.03)'; }}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#8b5cf6" strokeWidth="1.5"><polygon points="6,24 16,4 26,24" strokeDasharray="4 2"/><circle cx="6" cy="24" r="2" fill="#8b5cf6"/><circle cx="16" cy="4" r="2" fill="#8b5cf6"/><circle cx="26" cy="24" r="2" fill="#8b5cf6"/></svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>Draw Polygon</span>
                                <span style={{ fontSize: 9, color: theme.textDim, textAlign: 'center' }}>Click vertices, double-click to close</span>
                            </button>
                            {/* Manual Circle */}
                            <button onClick={() => openAddZoneManual('circle')} style={{ padding: '16px 12px', borderRadius: 10, border: `1.5px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent + '80'; e.currentTarget.style.background = 'rgba(59,130,246,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'transparent'; }}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={theme.accent} strokeWidth="1.5"><circle cx="16" cy="16" r="12"/><text x="16" y="20" textAnchor="middle" fontSize="10" fill={theme.accent} stroke="none" fontFamily="JetBrains Mono, monospace">123</text></svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>Manual Circle</span>
                                <span style={{ fontSize: 9, color: theme.textDim, textAlign: 'center' }}>Enter coordinates and radius</span>
                            </button>
                            {/* Manual Polygon */}
                            <button onClick={() => openAddZoneManual('polygon')} style={{ padding: '16px 12px', borderRadius: 10, border: `1.5px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent + '80'; e.currentTarget.style.background = 'rgba(59,130,246,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'transparent'; }}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={theme.accent} strokeWidth="1.5"><polygon points="6,24 16,4 26,24"/><text x="16" y="20" textAnchor="middle" fontSize="10" fill={theme.accent} stroke="none" fontFamily="JetBrains Mono, monospace">123</text></svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>Manual Polygon</span>
                                <span style={{ fontSize: 9, color: theme.textDim, textAlign: 'center' }}>Enter center coordinates</span>
                            </button>
                        </div>
                    </div>
                </div>}

                {/* Zone Drawing Instruction Bar (top-center) */}
                {zoneDrawing && <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 30, background: 'rgba(13,18,32,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, padding: '10px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 12, maxWidth: '90%' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', animation: 'argux-spin 1s linear infinite', boxShadow: '0 0 8px #8b5cf6' }} />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>Drawing {zoneDrawing.shape === 'circle' ? 'Circle Zone' : 'Polygon Zone'}</div>
                        <div style={{ fontSize: 10, color: theme.textDim }}>{zoneDrawing.shape === 'circle' ? (zoneDrawing.points.length === 0 ? 'Click to place center point' : 'Click to set edge — double-click to finish') : (zoneDrawing.points.length < 3 ? `Click to add vertices (${zoneDrawing.points.length}/3 min)` : `${zoneDrawing.points.length} points — double-click to close`)}</div>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#8b5cf6', fontFamily: "'JetBrains Mono', monospace", minWidth: 24, textAlign: 'center' as const }}>{zoneDrawing.points.length}</span>
                    <button onClick={() => setZoneDrawing(null)} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: theme.danger, fontSize: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>Cancel</button>
                </div>}

                {/* Zone Add/Edit Form Panel (right side) */}
                {zoneModal && <div style={{ position: 'absolute', top: 10, right: showMinimap ? 160 : 10, bottom: 50, zIndex: 35, width: 320, maxWidth: '80%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, background: 'rgba(13,18,32,0.97)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round"><polygon points="3,2 13,2 15,8 10,14 6,14 1,8"/></svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{zoneModal.mode === 'add' ? 'New Zone' : 'Edit Zone'}</span>
                            </div>
                            <button onClick={() => setZoneModal(null)} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
                        </div>
                        <input value={zoneForm.name} onChange={e => setZoneForm(f => ({ ...f, name: e.target.value }))} placeholder="Zone name *" autoFocus style={{ width: '100%', padding: '8px 10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
                        <div style={{ display: 'flex', gap: 4 }}>
                            {(['circle', 'polygon'] as ZoneShape[]).map(s => <button key={s} onClick={() => setZoneForm(f => ({ ...f, shape: s }))} style={{ flex: 1, padding: '6px 0', borderRadius: 5, border: `1.5px solid ${zoneForm.shape === s ? '#8b5cf6' : theme.border}`, background: zoneForm.shape === s ? 'rgba(139,92,246,0.1)' : 'transparent', color: zoneForm.shape === s ? '#8b5cf6' : theme.textDim, fontSize: 10, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>{s === 'circle' ? '⬤ Circle' : '⬡ Polygon'}</button>)}
                        </div>
                        <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Type</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
                                {zoneTypes.map(t => <button key={t.id} onClick={() => setZoneForm(f => ({ ...f, type: t.id }))} style={{ padding: '5px 2px', borderRadius: 4, border: `1.5px solid ${zoneForm.type === t.id ? '#8b5cf6' : theme.border}`, background: zoneForm.type === t.id ? 'rgba(139,92,246,0.08)' : 'transparent', color: zoneForm.type === t.id ? '#8b5cf6' : theme.textDim, fontSize: 8, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'center' as const }}><div style={{ fontSize: 13 }}>{t.icon}</div>{t.label}</button>)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 8, fontWeight: 600, color: theme.textDim, marginBottom: 2 }}>Latitude *</div><input value={zoneForm.lat} onChange={e => setZoneForm(f => ({ ...f, lat: e.target.value }))} placeholder="45.8150" style={{ width: '100%', padding: '6px 8px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 4, color: theme.text, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: 'none', boxSizing: 'border-box' as const }} /></div>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 8, fontWeight: 600, color: theme.textDim, marginBottom: 2 }}>Longitude *</div><input value={zoneForm.lng} onChange={e => setZoneForm(f => ({ ...f, lng: e.target.value }))} placeholder="15.9819" style={{ width: '100%', padding: '6px 8px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 4, color: theme.text, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: 'none', boxSizing: 'border-box' as const }} /></div>
                            {zoneForm.shape === 'circle' && <div style={{ width: 72 }}><div style={{ fontSize: 8, fontWeight: 600, color: theme.textDim, marginBottom: 2 }}>Radius (m)</div><input value={zoneForm.radius} onChange={e => setZoneForm(f => ({ ...f, radius: e.target.value }))} placeholder="500" style={{ width: '100%', padding: '6px 4px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 4, color: theme.text, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: 'none', boxSizing: 'border-box' as const, textAlign: 'center' as const }} /></div>}
                        </div>
                        {zoneForm.shape === 'circle' && zoneForm.radius && <div>
                            <input type="range" min="50" max="5000" step="50" value={parseInt(zoneForm.radius) || 500} onChange={e => setZoneForm(f => ({ ...f, radius: e.target.value }))} style={{ width: '100%', accentColor: '#8b5cf6', height: 4 }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: theme.textDim }}><span>50m</span><span style={{ color: '#8b5cf6', fontWeight: 700 }}>{zoneForm.radius}m</span><span>5000m</span></div>
                        </div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 9, color: theme.textDim }}>Color</span>
                            {zoneColors.map(c => <button key={c} onClick={() => setZoneForm(f => ({ ...f, color: c }))} style={{ width: 18, height: 18, borderRadius: 4, background: c, border: zoneForm.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', padding: 0, boxShadow: zoneForm.color === c ? `0 0 6px ${c}60` : 'none', transition: 'all 0.1s' }} />)}
                        </div>
                        {/* Preview */}
                        <div style={{ padding: '8px 10px', borderRadius: 6, background: `${zoneForm.color}10`, border: `1px solid ${zoneForm.color}25`, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 12, height: 12, borderRadius: zoneForm.shape === 'circle' ? '50%' : 3, background: zoneForm.color, boxShadow: `0 0 8px ${zoneForm.color}50` }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: theme.text }}>{zoneForm.name || 'Untitled Zone'}</div>
                                <div style={{ fontSize: 8, color: theme.textDim }}>{zoneTypes.find(t => t.id === zoneForm.type)?.icon} {zoneTypes.find(t => t.id === zoneForm.type)?.label} · {zoneForm.shape === 'circle' ? `${zoneForm.radius || 0}m` : 'Polygon'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                            <button onClick={saveZone} disabled={!zoneForm.name.trim() || !zoneForm.lat || !zoneForm.lng} style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', background: (!zoneForm.name.trim() || !zoneForm.lat || !zoneForm.lng) ? theme.border : '#8b5cf6', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'inherit', cursor: (!zoneForm.name.trim() || !zoneForm.lat || !zoneForm.lng) ? 'not-allowed' : 'pointer', opacity: (!zoneForm.name.trim() || !zoneForm.lat || !zoneForm.lng) ? 0.4 : 1 }}>{zoneModal.mode === 'add' ? 'Create Zone' : 'Update Zone'}</button>
                            <button onClick={() => setZoneModal(null)} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                </div>}

                {/* Zone Delete Confirm Overlay */}
                {zoneDeleteConfirm && <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={() => setZoneDeleteConfirm(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 340, maxWidth: '90%', background: 'rgba(13,18,32,0.98)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={theme.danger} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><line x1="8" y1="5" x2="8" y2="9"/><circle cx="8" cy="11.5" r="0.5" fill={theme.danger}/></svg>
                            <span style={{ fontSize: 14, fontWeight: 700, color: theme.danger }}>Delete Zone</span>
                        </div>
                        <div style={{ fontSize: 13, color: theme.text, marginBottom: 4 }}>Are you sure you want to delete <strong style={{ color: zoneDeleteConfirm.color }}>{zoneDeleteConfirm.name}</strong>?</div>
                        <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 6 }}>{zoneTypes.find(t => t.id === zoneDeleteConfirm.type)?.icon} {zoneTypes.find(t => t.id === zoneDeleteConfirm.type)?.label} · {zoneDeleteConfirm.shape === 'circle' ? `${zoneDeleteConfirm.radius}m radius` : `${zoneDeleteConfirm.points?.length || 0} vertices`}</div>
                        <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 16 }}>This zone will be permanently removed from the map. This action cannot be undone.</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={confirmDeleteZone} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', background: theme.danger, color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>Delete Zone</button>
                            <button onClick={() => setZoneDeleteConfirm(null)} style={{ padding: '9px 20px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                </div>}

                {/* Zone Events Panel (bottom-left, floating) */}
                {zoneEventsPanel && (() => {
                    const events = getZoneEvents(zoneEventsPanel);
                    const sevColors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
                    return <div style={{ position: 'absolute', bottom: 50, left: 10, zIndex: 35, width: 360, maxWidth: '80%', maxHeight: 380, background: 'rgba(13,18,32,0.97)', border: `1px solid ${zoneEventsPanel.color}30`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: zoneEventsPanel.shape === 'circle' ? '50%' : 3, background: zoneEventsPanel.color, boxShadow: `0 0 8px ${zoneEventsPanel.color}50` }} />
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{zoneEventsPanel.name}</div>
                                    <div style={{ fontSize: 9, color: theme.textDim }}>{zoneTypes.find(t => t.id === zoneEventsPanel.type)?.icon} {zoneTypes.find(t => t.id === zoneEventsPanel.type)?.label} · {events.length} events</div>
                                </div>
                            </div>
                            <button onClick={() => setZoneEventsPanel(null)} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 4, display: 'flex' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
                        </div>
                        {/* Summary */}
                        <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                            {(['critical', 'warning', 'info'] as const).map(s => { const c = events.filter(e => e.severity === s).length; return <div key={s} style={{ flex: 1, padding: '4px 6px', borderRadius: 4, background: sevColors[s] + '10', border: `1px solid ${sevColors[s]}20`, textAlign: 'center' as const }}><div style={{ fontSize: 14, fontWeight: 800, color: sevColors[s] }}>{c}</div><div style={{ fontSize: 7, color: theme.textDim, textTransform: 'uppercase' as const, fontWeight: 600 }}>{s}</div></div>; })}
                        </div>
                        {/* Event list */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
                            {events.map((ev, i) => (
                                <div key={ev.id} style={{ padding: '8px 14px', borderBottom: i < events.length - 1 ? `1px solid ${theme.border}` : 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: 3, background: sevColors[ev.severity], flexShrink: 0, marginTop: 5, boxShadow: `0 0 4px ${sevColors[ev.severity]}40` }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{ev.type}</span>
                                            <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: sevColors[ev.severity] + '15', color: sevColors[ev.severity], fontWeight: 600, textTransform: 'uppercase' as const }}>{ev.severity}</span>
                                        </div>
                                        <div style={{ fontSize: 10, color: theme.textSecondary, marginBottom: 1 }}>{ev.person}</div>
                                        <div style={{ fontSize: 9, color: theme.textDim }}>{ev.detail}</div>
                                    </div>
                                    <span style={{ fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, whiteSpace: 'nowrap' as const }}>{ev.time.split(' ')[1]}<br/><span style={{ fontSize: 7 }}>{ev.time.split(' ')[0].slice(5)}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>;
                })()}

                {/* Map Right-Click Context Menu */}
                {mapCtxMenu && <div onClick={e => e.stopPropagation()} className="tmap-ctxmenu" style={{ position: 'absolute', left: mapCtxMenu.x, top: mapCtxMenu.y, zIndex: 55, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'visible', minWidth: 170 }}>
                    <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{mapCtxMenu.lngLat[1].toFixed(5)}, {mapCtxMenu.lngLat[0].toFixed(5)}</div>
                    <div style={{ padding: '2px 0' }}>
                        <button onClick={() => { placeMarkerAt(mapCtxMenu.lngLat); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>📌 Add Marker</button>
                        <div className="tmap-ctxmenu-sub-wrap" style={{ position: 'relative' }}>
                            <button style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>🖊️ Add Object</span><svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,2 7,5 3,8"/></svg>
                            </button>
                            <div className="tmap-ctxmenu-sub" style={{ position: 'absolute', left: '100%', top: -2, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden', minWidth: 150, display: 'none' }}>
                                {(['line', 'rectangle', 'polygon', 'freehand', 'circle'] as ObjType[]).map(t => <button key={t} onClick={() => startObjDraw(t)} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{objTypeLabels[t].icon} Draw {objTypeLabels[t].label}</button>)}
                            </div>
                        </div>
                    </div>
                </div>}

                {/* Object Right-Click Context Menu */}
                {objCtxMenu && <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', left: objCtxMenu.x, top: objCtxMenu.y, zIndex: 55, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden', minWidth: 170 }}>
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12 }}>{objTypeLabels[objCtxMenu.obj.type].icon}</span>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{objCtxMenu.obj.name || 'Untitled'}</div>
                            <div style={{ fontSize: 8, color: theme.textDim }}>{objTypeLabels[objCtxMenu.obj.type].label}{objCtxMenu.obj.assignedTo ? ` · ${objCtxMenu.obj.assignedTo.name}` : ''}</div>
                        </div>
                    </div>
                    <div style={{ padding: '2px 0' }}>
                        <button onClick={() => { goToObj(objCtxMenu.obj); setObjCtxMenu(null); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5"/><circle cx="8" cy="8" r="1.5"/></svg>Zoom to Object</button>
                        <button onClick={() => { openEditObj(objCtxMenu.obj); setObjCtxMenu(null); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round"><path d="M11 2l3 3-8 8H3v-3z"/></svg>Edit Object</button>
                        <button onClick={() => { toggleObjVisibility(objCtxMenu.obj.id); setObjCtxMenu(null); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{objCtxMenu.obj.visible ? <><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/><circle cx="8" cy="8" r="2"/><line x1="3" y1="13" x2="13" y2="3"/></svg>Hide Object</> : <><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/><circle cx="8" cy="8" r="2"/></svg>Show Object</>}</button>
                        <div style={{ height: 1, background: theme.border, margin: '2px 8px' }} />
                        <button onClick={() => { setObjDeleteConfirm(objCtxMenu.obj); setObjCtxMenu(null); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.danger, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 4h10M6 4V3h4v1M5 4v8.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5V4"/></svg>Remove Object</button>
                    </div>
                </div>}

                {/* Placing Marker Instruction Bar */}
                {placingMarker && <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 30, background: 'rgba(13,18,32,0.95)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 12, maxWidth: '90%' }}>
                    <span style={{ fontSize: 18 }}>📌</span>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>Place Marker</div>
                        <div style={{ fontSize: 10, color: theme.textDim }}>Click anywhere on the map to place your marker.</div>
                    </div>
                    <button onClick={() => setPlacingMarker(false)} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: theme.danger, fontSize: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>Cancel</button>
                </div>}

                {/* Object Drawing Instruction Bar */}
                {objDrawing && <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 30, background: 'rgba(13,18,32,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, padding: '10px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 12, maxWidth: '90%' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }} />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent }}>Drawing {objTypeLabels[objDrawing.type].label}</div>
                        <div style={{ fontSize: 10, color: theme.textDim }}>{objDrawing.type === 'freehand' ? 'Click and drag to draw. Release to finish.' : objDrawing.type === 'circle' ? 'Click center point. Double-click to finish.' : objDrawing.type === 'rectangle' ? 'Click two corners. Double-click to finish.' : `Click to add points (${objDrawing.points.length}). Double-click to finish.`}</div>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: theme.accent, fontFamily: "'JetBrains Mono', monospace", minWidth: 24, textAlign: 'center' as const }}>{objDrawing.points.length}</span>
                    <button onClick={() => setObjDrawing(null)} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: theme.danger, fontSize: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>Cancel</button>
                </div>}

                {/* Object Add/Edit Modal (right side) */}
                {objModal && <div style={{ position: 'absolute', top: 10, right: showMinimap ? 160 : 10, bottom: 50, zIndex: 35, width: 300, maxWidth: '80%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, background: 'rgba(13,18,32,0.97)', border: `1px solid ${theme.accent}30`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', padding: 14, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: theme.accent, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{objModal.mode === 'add' ? `New ${objModal.obj ? objTypeLabels[objModal.obj.type].icon + ' ' + objTypeLabels[objModal.obj.type].label : 'Object'}` : 'Edit Object'}</span>
                            <button onClick={() => setObjModal(null)} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
                        </div>
                        <input value={objForm.name} onChange={e => setObjForm(f => ({ ...f, name: e.target.value }))} placeholder="Object name *" autoFocus style={{ width: '100%', padding: '7px 10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 9, color: theme.textDim }}>Color</span>
                            {objColors.map(c => <button key={c} onClick={() => setObjForm(f => ({ ...f, color: c }))} style={{ width: 16, height: 16, borderRadius: 3, background: c, border: objForm.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', padding: 0, boxShadow: objForm.color === c ? `0 0 6px ${c}60` : 'none' }} />)}
                        </div>
                        <div>
                            <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Assign To</div>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                {[{ v: '', l: 'None' }, { v: 'person', l: '👤 Person' }, { v: 'org', l: '🏢 Org' }].map(opt => <button key={opt.v} onClick={() => setObjForm(f => ({ ...f, assignType: opt.v as any, assignId: '' }))} style={{ flex: 1, padding: '4px 0', borderRadius: 4, border: `1px solid ${objForm.assignType === opt.v ? theme.accent + '60' : theme.border}`, background: objForm.assignType === opt.v ? theme.accentDim : 'transparent', color: objForm.assignType === opt.v ? theme.accent : theme.textDim, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>{opt.l}</button>)}
                            </div>
                            {objForm.assignType && <select value={objForm.assignId} onChange={e => setObjForm(f => ({ ...f, assignId: e.target.value }))} style={{ width: '100%', padding: '6px 8px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.text, fontSize: 10, fontFamily: 'inherit', outline: 'none' }}>
                                <option value="">Select {objForm.assignType === 'person' ? 'person' : 'organization'}...</option>
                                {(objForm.assignType === 'person' ? personOpts : orgOpts).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                            </select>}
                        </div>
                        {objModal.obj && <div style={{ padding: '6px 8px', borderRadius: 5, background: `${objForm.color}10`, border: `1px solid ${objForm.color}20`, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14 }}>{objTypeLabels[objModal.obj.type].icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: theme.text }}>{objForm.name || 'Untitled'}</div>
                                <div style={{ fontSize: 8, color: theme.textDim }}>{objTypeLabels[objModal.obj.type].label} · {objModal.obj.coords.length} point{objModal.obj.coords.length !== 1 ? 's' : ''}</div>
                            </div>
                        </div>}
                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                            <button onClick={saveObj} disabled={!objForm.name.trim()} style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', background: !objForm.name.trim() ? theme.border : theme.accent, color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'inherit', cursor: !objForm.name.trim() ? 'not-allowed' : 'pointer', opacity: !objForm.name.trim() ? 0.4 : 1 }}>{objModal.mode === 'add' ? 'Create' : 'Update'}</button>
                            <button onClick={() => setObjModal(null)} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                </div>}

                {/* Object Delete Confirm */}
                {objDeleteConfirm && <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={() => setObjDeleteConfirm(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 320, maxWidth: '90%', background: 'rgba(13,18,32,0.98)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={theme.danger} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><line x1="8" y1="5" x2="8" y2="9"/><circle cx="8" cy="11.5" r="0.5" fill={theme.danger}/></svg>
                            <span style={{ fontSize: 13, fontWeight: 700, color: theme.danger }}>Delete Object</span>
                        </div>
                        <div style={{ fontSize: 12, color: theme.text, marginBottom: 4 }}>Delete <strong style={{ color: objDeleteConfirm.color }}>{objDeleteConfirm.name || 'Untitled'}</strong>?</div>
                        <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 14 }}>{objTypeLabels[objDeleteConfirm.type].icon} {objTypeLabels[objDeleteConfirm.type].label} · This action cannot be undone.</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={deleteObj} style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', background: theme.danger, color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>Delete</button>
                            <button onClick={() => setObjDeleteConfirm(null)} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                </div>}
            </div>
        </div>
        </>
    );
}

MapIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
