import PageMeta from '../../components/layout/PageMeta';
import { useState, useRef, useEffect, useCallback, useMemo, Fragment } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import type { AnomalyEvent, PredRiskEntry, PatternEntry, IncidentEvent, CompareMetric, RoutePoint } from './mockData';
import { anomalyTypes, patternCategories, incidentTypes, heatCalPersonInfo, MOCK_ANOMALIES, MOCK_PREDICTIONS, MOCK_PATTERNS, MOCK_INCIDENTS, MOCK_ROUTES } from './mockData';
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
    return (<div ref={ref} style={{ position: 'relative' as const }}><button className="tmap-ms-trigger" onClick={() => { setOpen(!open); setQ(''); }} style={{ color: has ? theme.text : theme.textDim, borderColor: has ? theme.accent + '40' : theme.border }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{has ? `${selected.length} of ${options.length} selected` : placeholder}</span><svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4" /></svg></button>{open && <div className="tmap-ms-panel"><div className="tmap-ms-search"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus />{has && <button onClick={() => onChange([])} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: theme.danger, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '2px 6px', borderRadius: 3, flexShrink: 0 }}>Clear</button>}</div>{showSelectAll && !q && <div className="tmap-ms-item" onClick={() => onChange(allSelected ? [] : options.map(o => o.id))} style={{ color: allSelected ? theme.accent : theme.textSecondary, borderBottom: `1px solid ${theme.border}`, fontWeight: 700, fontSize: 10 }}><div className={`tmap-ms-check ${allSelected ? 'on' : ''}`}>{allSelected && <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>Select All</div>}<div className="tmap-ms-list">{filtered.map(o => { const c = selected.includes(o.id); return <div key={o.id} className="tmap-ms-item" onClick={() => toggle(o.id)} style={{ color: c ? theme.accent : theme.text }}><div className={`tmap-ms-check ${c ? 'on' : ''}`}>{c && <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>{o.img && <img src={o.img} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${theme.border}`, flexShrink: 0 }} />}<div><div>{o.label}</div>{o.sub && <div style={{ fontSize: 9, color: theme.textDim }}>{o.sub}</div>}</div></div>; })}{filtered.length === 0 && <div style={{ padding: 12, fontSize: 10, color: theme.textDim, textAlign: 'center' as const }}>No results</div>}</div></div>}{has && <div className="tmap-tags">{selected.slice(0, 6).map(id => { const o = options.find(x => x.id === id); return o ? <span key={id} className="tmap-tag">{o.label.split(' ')[0]}<button onClick={e => { e.stopPropagation(); toggle(id); }}><svg width="7" height="7" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button></span> : null; })}{selected.length > 6 && <span className="tmap-tag" style={{ opacity: 0.6 }}>+{selected.length - 6}</span>}</div>}</div>);
}

/* ═══ COLLAPSIBLE SECTION ═══ */
function Section({ title, icon, children, defaultOpen = false, badge, dragHandle }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; badge?: number; dragHandle?: React.ReactNode }) {
    const [open, setOpen] = useState(defaultOpen);
    return (<div className="tmap-section"><div className="tmap-section-header" onClick={() => setOpen(!open)}>{dragHandle}<div className="tmap-section-title">{icon}{title}{badge !== undefined && badge > 0 && <span style={{ fontSize: 8, fontWeight: 700, padding: '0 4px', borderRadius: 6, background: theme.accent, color: '#fff', lineHeight: '14px' }}>{badge}</span>}</div><svg className={`tmap-section-chevron ${open ? 'open' : ''}`} width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,3 5,7 8,3" /></svg></div>{open && <div className="tmap-section-content">{children}</div>}</div>);
}

/* ═══ TOGGLE SWITCH ═══ */
function Toggle({ label, enabled, onChange, description }: { label: string; enabled: boolean; onChange: (v: boolean) => void; description?: string }) {
    return (<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: '6px 0' }}>
        <div><div style={{ fontSize: 11, fontWeight: 600, color: enabled ? theme.text : theme.textSecondary }}>{label}</div>{description && <div style={{ fontSize: 9, color: theme.textDim, marginTop: 1 }}>{description}</div>}</div>
        <button onClick={() => onChange(!enabled)} style={{ width: 34, height: 18, borderRadius: 9, border: 'none', background: enabled ? theme.accent : theme.border, cursor: 'pointer', position: 'relative' as const, flexShrink: 0, transition: 'background 0.2s' }}><div style={{ width: 14, height: 14, borderRadius: 7, background: '#fff', position: 'absolute' as const, top: 2, left: enabled ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} /></button>
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
    workspaces: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"/><path d="M2 4l2-2h4l2 2"/><line x1="6" y1="8" x2="10" y2="8"/><line x1="6" y1="11" x2="9" y2="11"/></svg>,
};

const personOpts = mockPersons.map(p => ({ id: p.id.toString(), label: `${p.firstName} ${p.lastName}`, sub: `${p.nationality} · ${p.risk}`, img: p.avatar || undefined }));
const orgOpts = mockOrganizations.map(o => ({ id: o.id.toString(), label: o.name, sub: `${o.country} · ${o.industry}`, img: o.logo || undefined }));

/* ═══ COMPASS WIDGET ═══ */
function Compass({ bearing }: { bearing: number }) {
    return (<div style={{ width: 60, height: 60, position: 'relative' as const }}>
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
        <div style={{ position: 'absolute' as const, bottom: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 8, fontWeight: 700, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' as const }}>{Math.round(bearing)}°</div>
    </div>);
}

/* ═══ MINIMAP WIDGET ═══ */
function Minimap({ center, zoom: mainZoom, onNavigate }: { center: { lat: number; lng: number }; zoom: number; onNavigate: (lat: number, lng: number) => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const mmRef = useRef<any>(null);

    useEffect(() => {
        if (!ref.current || !(window as any).maplibregl) return;
        const ml = (window as any).maplibregl;
        try {
        const mm = new ml.Map({
            container: ref.current,
            style: { version: 8, sources: { 'esri-world': { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256 } }, layers: [{ id: 'bg', type: 'raster', source: 'esri-world' }] },
            center: [center.lng, center.lat], zoom: Math.max(0, mainZoom - 8),
            interactive: false, attributionControl: false,
            maxZoom: 8,
        });
        mmRef.current = mm;
        return () => { mm.remove(); mmRef.current = null; };
        } catch { /* WebGL not available */ }
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

    return (<div onClick={handleClick} style={{ width: 140, height: 100, borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${theme.border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.5)', position: 'relative' as const, cursor: 'crosshair' }}>
        <div ref={ref} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute' as const, inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.8"><line x1="8" y1="2" x2="8" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="2" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="14" y2="8"/></svg>
        </div>
        <div style={{ position: 'absolute' as const, top: 3, left: 5, fontSize: 7, fontWeight: 700, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", opacity: 0.7, pointerEvents: 'none' }}>OVERVIEW</div>
        <div style={{ position: 'absolute' as const, bottom: 2, right: 4, fontSize: 6, color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace", pointerEvents: 'none' }}>Click to navigate</div>
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
    const [webglFailed, setWebglFailed] = useState(false);
    const [topLoader, setTopLoader] = useState(0); // 0 = hidden, 1-99 = progress, 100 = done
    const topLoaderTimer = useRef<number | null>(null);
    const triggerTopLoader = useCallback(() => {
        if (topLoaderTimer.current) clearTimeout(topLoaderTimer.current);
        setTopLoader(30);
        topLoaderTimer.current = window.setTimeout(() => {
            setTopLoader(70);
            topLoaderTimer.current = window.setTimeout(() => {
                setTopLoader(100);
                topLoaderTimer.current = window.setTimeout(() => setTopLoader(0), 400);
            }, 200);
        }, 150);
    }, []);
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
    interface SourceMarker { id: string; sourceId: SourceId; lat: number; lng: number; label: string; status: 'online' | 'offline' | 'degraded'; detail: string; personId?: number; personName?: string; personLastName?: string; personNickname?: string; personAvatar?: string; risk?: string; accuracy?: string; lastUpdated?: string; phoneType?: 'ios' | 'android'; battery?: number; deviceId?: number; signal?: number; orgId?: number; orgName?: string; orgAvatar?: string; }
    const [hiddenSources, setHiddenSources] = useState<Set<string>>(new Set());
    const mockSourceMarkers: SourceMarker[] = [
        // Public Cameras (8)
        { id: 'sc1', sourceId: 'cam-public', lat: 45.8131, lng: 15.9775, label: 'Ban Jelačić Square Cam', status: 'online', detail: 'Resolution: 4K · FPS: 30 · Uptime: 99.8%', deviceId: 101, lastUpdated: '5s ago' },
        { id: 'sc2', sourceId: 'cam-public', lat: 45.8155, lng: 15.9690, label: 'Ilica Street Cam #1', status: 'online', detail: 'Resolution: 1080p · FPS: 25 · Uptime: 98.5%', deviceId: 102, lastUpdated: '8s ago' },
        { id: 'sc3', sourceId: 'cam-public', lat: 45.8048, lng: 15.9620, label: 'Savska Cesta Intersection', status: 'degraded', detail: 'Resolution: 1080p · FPS: 15 · Signal weak', deviceId: 103, lastUpdated: '2m ago' },
        { id: 'sc4', sourceId: 'cam-public', lat: 45.8100, lng: 15.9930, label: 'Maksimir Park Entrance', status: 'online', detail: 'Resolution: 4K · FPS: 30 · Night vision enabled', deviceId: 104, lastUpdated: '3s ago' },
        { id: 'sc5', sourceId: 'cam-public', lat: 45.8000, lng: 15.9710, label: 'Main Station South', status: 'online', detail: 'Resolution: 4K · FPS: 30 · Facial recognition active', deviceId: 105, lastUpdated: '1s ago' },
        { id: 'sc6', sourceId: 'cam-public', lat: 45.8195, lng: 15.9555, label: 'Črnomerec Junction', status: 'offline', detail: 'Maintenance since 2026-03-20', deviceId: 106, lastUpdated: '3d ago' },
        { id: 'sc7', sourceId: 'cam-public', lat: 45.8060, lng: 16.0010, label: 'Dubrava Overpass', status: 'online', detail: 'Resolution: 1080p · FPS: 25', deviceId: 107, lastUpdated: '12s ago' },
        { id: 'sc8', sourceId: 'cam-public', lat: 45.8210, lng: 15.9850, label: 'Kaptol Area Cam', status: 'online', detail: 'Resolution: 4K · PTZ · FPS: 30', deviceId: 108, lastUpdated: '2s ago' },
        // Hidden Cameras (5)
        { id: 'sh1', sourceId: 'cam-hidden', lat: 45.8142, lng: 15.9760, label: 'OP-HAWK Unit Alpha', status: 'online', detail: 'Covert · Battery: 89% · Last ping: 2m ago', deviceId: 201, personId: 1, personName: 'Marko', personLastName: 'Horvat', personNickname: 'Hawk', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', battery: 89, signal: 95, lastUpdated: '2m ago' },
        { id: 'sh2', sourceId: 'cam-hidden', lat: 45.8088, lng: 15.9680, label: 'OP-HAWK Unit Bravo', status: 'online', detail: 'Covert · Battery: 72% · Last ping: 5m ago', deviceId: 202, personId: 12, personName: 'Ivan', personLastName: 'Babić', personNickname: 'Ghost', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', battery: 72, signal: 88, lastUpdated: '5m ago' },
        { id: 'sh3', sourceId: 'cam-hidden', lat: 45.8170, lng: 15.9810, label: 'OP-HAWK Unit Charlie', status: 'degraded', detail: 'Covert · Battery: 23% · Low battery warning', deviceId: 203, orgId: 1, orgName: 'Alpha Security', orgAvatar: '', risk: 'Medium', battery: 23, signal: 45, lastUpdated: '8m ago' },
        { id: 'sh4', sourceId: 'cam-hidden', lat: 45.8050, lng: 15.9900, label: 'OP-HAWK Unit Delta', status: 'online', detail: 'Covert · Battery: 95% · Last ping: 1m ago', deviceId: 204, personId: 3, personName: 'Ahmed', personLastName: 'Al-Rashid', personNickname: 'Mike', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', battery: 95, signal: 92, lastUpdated: '1m ago' },
        { id: 'sh5', sourceId: 'cam-hidden', lat: 45.8120, lng: 15.9580, label: 'OP-HAWK Unit Echo', status: 'offline', detail: 'Covert · Device unreachable since 18:00', deviceId: 205, orgId: 2, orgName: 'Rashid Holdings', orgAvatar: '', risk: 'High', battery: 0, signal: 0, lastUpdated: '6h ago' },
        // Private Cameras (4)
        { id: 'sp1', sourceId: 'cam-private', lat: 45.8115, lng: 15.9830, label: 'ASG HQ Interior #1', status: 'online', detail: 'Private · Restricted access · Recording', deviceId: 301, orgId: 1, orgName: 'Alpha Security', orgAvatar: '', risk: 'High', battery: 100, signal: 100, lastUpdated: '1s ago' },
        { id: 'sp2', sourceId: 'cam-private', lat: 45.8117, lng: 15.9835, label: 'ASG HQ Interior #2', status: 'online', detail: 'Private · Restricted access · Recording', deviceId: 302, orgId: 1, orgName: 'Alpha Security', orgAvatar: '', risk: 'High', battery: 100, signal: 98, lastUpdated: '3s ago' },
        { id: 'sp3', sourceId: 'cam-private', lat: 45.8070, lng: 15.9750, label: 'Safehouse Bravo Cam', status: 'online', detail: 'Private · Motion-triggered · 128GB storage', deviceId: 303, personId: 1, personName: 'Marko', personLastName: 'Horvat', personNickname: 'Hawk', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', battery: 100, signal: 90, lastUpdated: '10s ago' },
        { id: 'sp4', sourceId: 'cam-private', lat: 45.8190, lng: 15.9700, label: 'Drop Point Zulu Cam', status: 'degraded', detail: 'Private · Intermittent connection', deviceId: 304, orgId: 2, orgName: 'Rashid Holdings', orgAvatar: '', risk: 'Critical', battery: 56, signal: 32, lastUpdated: '12m ago' },
        // GPS Trackers (7)
        { id: 'sg1', sourceId: 'gps', lat: 45.8138, lng: 15.9780, label: 'GPS-001 (Horvat Vehicle)', status: 'online', detail: 'Speed: 0 km/h · Parked · Battery: 94%', deviceId: 401, personId: 1, personName: 'Marko', personLastName: 'Horvat', personNickname: 'Hawk', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', battery: 94, signal: 98, lastUpdated: '10s ago' },
        { id: 'sg2', sourceId: 'gps', lat: 45.8075, lng: 15.9850, label: 'GPS-002 (Babić Vehicle)', status: 'online', detail: 'Speed: 42 km/h · Moving SE · Battery: 88%', deviceId: 402, personId: 12, personName: 'Ivan', personLastName: 'Babić', personNickname: 'Ghost', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', battery: 88, signal: 91, lastUpdated: '5s ago' },
        { id: 'sg3', sourceId: 'gps', lat: 45.8200, lng: 15.9600, label: 'GPS-003 (Package Alpha)', status: 'online', detail: 'Speed: 0 km/h · Stationary · Battery: 76%', deviceId: 403, orgId: 1, orgName: 'Alpha Security', orgAvatar: '', risk: 'Medium', battery: 76, signal: 85, lastUpdated: '30s ago' },
        { id: 'sg4', sourceId: 'gps', lat: 45.8020, lng: 15.9950, label: 'GPS-004 (Suspect Van)', status: 'degraded', detail: 'Speed: 15 km/h · Signal intermittent', deviceId: 404, personId: 9, personName: 'Carlos', personLastName: 'Mendoza', personNickname: 'Lima', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', battery: 45, signal: 28, lastUpdated: '4m ago' },
        { id: 'sg5', sourceId: 'gps', lat: 45.8160, lng: 15.9500, label: 'GPS-005 (Asset Foxtrot)', status: 'online', detail: 'Speed: 0 km/h · Parked · Battery: 100%', deviceId: 405, orgId: 5, orgName: 'Falcon Trading', orgAvatar: '', risk: 'Medium', battery: 100, signal: 96, lastUpdated: '15s ago' },
        { id: 'sg6', sourceId: 'gps', lat: 45.8095, lng: 15.9720, label: 'GPS-006 (Motorcycle)', status: 'offline', detail: 'Last position 3h ago · Battery: 12%', deviceId: 406, personId: 7, personName: 'Omar', personLastName: 'Hassan', personNickname: 'Kilo', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', battery: 12, signal: 0, lastUpdated: '3h ago' },
        { id: 'sg7', sourceId: 'gps', lat: 45.8180, lng: 15.9920, label: 'GPS-007 (Cargo Trailer)', status: 'online', detail: 'Speed: 0 km/h · Port area · Battery: 67%', deviceId: 407, orgId: 6, orgName: 'Mendoza IE', orgAvatar: '', risk: 'High', battery: 67, signal: 82, lastUpdated: '1m ago' },
        // Audio Recorders (4)
        { id: 'sa1', sourceId: 'audio', lat: 45.8133, lng: 15.9770, label: 'MIC-ALPHA (Café Target)', status: 'online', detail: 'Recording · Duration: 4h 23m · Quality: High', deviceId: 501, personId: 1, personName: 'Marko', personLastName: 'Horvat', personNickname: 'Hawk', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', battery: 78, signal: 92, lastUpdated: '20s ago' },
        { id: 'sa2', sourceId: 'audio', lat: 45.8110, lng: 15.9840, label: 'MIC-BRAVO (Office Bug)', status: 'online', detail: 'Recording · Duration: 12h 05m · Quality: High', deviceId: 502, orgId: 1, orgName: 'Alpha Security', orgAvatar: '', risk: 'High', battery: 61, signal: 88, lastUpdated: '45s ago' },
        { id: 'sa3', sourceId: 'audio', lat: 45.8065, lng: 15.9660, label: 'MIC-CHARLIE (Vehicle)', status: 'degraded', detail: 'Recording · Duration: 1h 44m · Background noise', deviceId: 503, personId: 12, personName: 'Ivan', personLastName: 'Babić', personNickname: 'Ghost', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', battery: 34, signal: 41, lastUpdated: '6m ago' },
        { id: 'sa4', sourceId: 'audio', lat: 45.8185, lng: 15.9730, label: 'MIC-DELTA (Meeting Rm)', status: 'offline', detail: 'Battery depleted · Last recording: 09:15', deviceId: 504, orgId: 2, orgName: 'Rashid Holdings', orgAvatar: '', risk: 'Critical', battery: 0, signal: 0, lastUpdated: '5h ago' },
        // Mobile App - Locator (5)
        { id: 'ml1', sourceId: 'app-locator', lat: 45.8125, lng: 15.9795, label: 'APP-LOC Horvat Phone', status: 'online', detail: 'Accuracy: 3m · Provider: GPS+WiFi · Updated: 30s ago', personId: 1, personName: 'Marko', personLastName: 'Horvat', personNickname: 'Hawk', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', accuracy: '3m', lastUpdated: '30s ago', phoneType: 'ios', battery: 87 },
        { id: 'ml2', sourceId: 'app-locator', lat: 45.8080, lng: 15.9870, label: 'APP-LOC Babić Phone', status: 'online', detail: 'Accuracy: 8m · Provider: Cell · Updated: 2m ago', personId: 12, personName: 'Ivan', personLastName: 'Babić', personNickname: 'Ghost', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', accuracy: '8m', lastUpdated: '2m ago', phoneType: 'android', battery: 64 },
        { id: 'ml3', sourceId: 'app-locator', lat: 45.8155, lng: 15.9650, label: 'APP-LOC Suspect Kilo', status: 'online', detail: 'Accuracy: 5m · Provider: GPS · Updated: 45s ago', personId: 7, personName: 'Omar', personLastName: 'Hassan', personNickname: 'Kilo', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', accuracy: '5m', lastUpdated: '45s ago', phoneType: 'android', battery: 42 },
        { id: 'ml4', sourceId: 'app-locator', lat: 45.8040, lng: 15.9780, label: 'APP-LOC Asset Lima', status: 'degraded', detail: 'Accuracy: 150m · Cell only · Last update: 15m ago', personId: 9, personName: 'Carlos', personLastName: 'Mendoza', personNickname: 'Lima', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', accuracy: '150m', lastUpdated: '15m ago', phoneType: 'ios', battery: 23 },
        { id: 'ml5', sourceId: 'app-locator', lat: 45.8175, lng: 15.9880, label: 'APP-LOC Target Mike', status: 'offline', detail: 'Phone powered off · Last seen: 2h ago', personId: 3, personName: 'Ahmed', personLastName: 'Al-Rashid', personNickname: 'Mike', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', accuracy: '—', lastUpdated: '2h ago', phoneType: 'android', battery: 0 },
        // Mobile App - Photo (3)
        { id: 'mp1', sourceId: 'app-photo', lat: 45.8130, lng: 15.9810, label: 'APP-PHO Horvat Phone', status: 'online', detail: 'Auto-capture: ON · 47 photos today · Storage: 62%', personId: 1, personName: 'Marko', personLastName: 'Horvat', personNickname: 'Hawk', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', accuracy: '3m', lastUpdated: '1m ago', phoneType: 'ios', battery: 87 },
        { id: 'mp2', sourceId: 'app-photo', lat: 45.8090, lng: 15.9690, label: 'APP-PHO Babić Phone', status: 'online', detail: 'Auto-capture: ON · 12 photos today · Storage: 84%', personId: 12, personName: 'Ivan', personLastName: 'Babić', personNickname: 'Ghost', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', accuracy: '8m', lastUpdated: '3m ago', phoneType: 'android', battery: 64 },
        { id: 'mp3', sourceId: 'app-photo', lat: 45.8165, lng: 15.9560, label: 'APP-PHO Suspect Kilo', status: 'degraded', detail: 'Auto-capture: OFF · Manual only · Storage: 91%', personId: 7, personName: 'Omar', personLastName: 'Hassan', personNickname: 'Kilo', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', accuracy: '12m', lastUpdated: '8m ago', phoneType: 'android', battery: 42 },
        // Mobile App - Video (3)
        { id: 'mv1', sourceId: 'app-video', lat: 45.8145, lng: 15.9750, label: 'APP-VID Horvat Phone', status: 'online', detail: 'Live stream available · Quality: 720p', personId: 1, personName: 'Marko', personLastName: 'Horvat', personNickname: 'Hawk', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', accuracy: '3m', lastUpdated: '15s ago', phoneType: 'ios', battery: 87 },
        { id: 'mv2', sourceId: 'app-video', lat: 45.8060, lng: 15.9810, label: 'APP-VID Babić Phone', status: 'online', detail: 'Recording in background · 2.3 GB captured', personId: 12, personName: 'Ivan', personLastName: 'Babić', personNickname: 'Ghost', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', accuracy: '5m', lastUpdated: '1m ago', phoneType: 'android', battery: 64 },
        { id: 'mv3', sourceId: 'app-video', lat: 45.8195, lng: 15.9640, label: 'APP-VID Target Oscar', status: 'offline', detail: 'No video permission · App restricted', personId: 7, personName: 'Omar', personLastName: 'Hassan', personNickname: 'Oscar', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', accuracy: '—', lastUpdated: '45m ago', phoneType: 'android', battery: 18 },
        // Mobile App - Audio Recorder (3)
        { id: 'ma1', sourceId: 'app-audio', lat: 45.8128, lng: 15.9820, label: 'APP-AUD Horvat Phone', status: 'online', detail: 'Ambient recording · Duration: 3h 12m · -42dB', personId: 1, personName: 'Marko', personLastName: 'Horvat', personNickname: 'Hawk', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', accuracy: '3m', lastUpdated: '10s ago', phoneType: 'ios', battery: 87 },
        { id: 'ma2', sourceId: 'app-audio', lat: 45.8082, lng: 15.9740, label: 'APP-AUD Babić Phone', status: 'online', detail: 'Call recording active · 7 calls intercepted', personId: 12, personName: 'Ivan', personLastName: 'Babić', personNickname: 'Ghost', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', accuracy: '8m', lastUpdated: '2m ago', phoneType: 'android', battery: 64 },
        { id: 'ma3', sourceId: 'app-audio', lat: 45.8170, lng: 15.9900, label: 'APP-AUD Suspect Papa', status: 'degraded', detail: 'Mic permission revoked · Retry pending', personId: 9, personName: 'Carlos', personLastName: 'Mendoza', personNickname: 'Papa', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', accuracy: '25m', lastUpdated: '12m ago', phoneType: 'ios', battery: 31 },
        // Mobile App - Camera (3)
        { id: 'mc1', sourceId: 'app-camera', lat: 45.8135, lng: 15.9760, label: 'APP-CAM Horvat Phone', status: 'online', detail: 'Front cam accessible · Stealth mode · Last snap: 5m', personId: 1, personName: 'Marko', personLastName: 'Horvat', personNickname: 'Hawk', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', accuracy: '3m', lastUpdated: '5m ago', phoneType: 'ios', battery: 87 },
        { id: 'mc2', sourceId: 'app-camera', lat: 45.8070, lng: 15.9850, label: 'APP-CAM Babić Phone', status: 'online', detail: 'Rear cam accessible · Stealth mode · Last snap: 22m', personId: 12, personName: 'Ivan', personLastName: 'Babić', personNickname: 'Ghost', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High', accuracy: '5m', lastUpdated: '22m ago', phoneType: 'android', battery: 64 },
        { id: 'mc3', sourceId: 'app-camera', lat: 45.8150, lng: 15.9580, label: 'APP-CAM Target Quebec', status: 'offline', detail: 'Camera blocked by user · App hidden', personId: 9, personName: 'Carlos', personLastName: 'Mendoza', personNickname: 'Quebec', personAvatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical', accuracy: '—', lastUpdated: '1h ago', phoneType: 'ios', battery: 5 },
    ];
    const [activeSources, setActiveSources] = useState<Set<SourceId>>(new Set());
    const toggleSource = (id: SourceId) => { triggerTopLoader(); setActiveSources(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
    const toggleSourceGroup = (group: string) => {
        triggerTopLoader();
        const groupIds = sourceTypes.filter(s => s.group === group).map(s => s.id);
        const allOn = groupIds.every(id => activeSources.has(id));
        setActiveSources(prev => { const n = new Set(prev); groupIds.forEach(id => allOn ? n.delete(id) : n.add(id)); return n; });
    };
    const activeSourceCount = activeSources.size;
    const activeSourceMarkers = mockSourceMarkers.filter(m => activeSources.has(m.sourceId) && !hiddenSources.has(m.id));

    // Layers
    const [layerHeatmap, setLayerHeatmap] = useState(false);
    const [heatmapIntensity, setHeatmapIntensity] = useState(0.6);
    const [heatmapRadius, setHeatmapRadius] = useState(25);
    const [layerNetwork, setLayerNetwork] = useState(false);
    const [networkShowPersons, setNetworkShowPersons] = useState(true);
    const [networkShowOrgs, setNetworkShowOrgs] = useState(true);
    const [networkShowDevices, setNetworkShowDevices] = useState(true);
    const [netSearch, setNetSearch] = useState('');
    const [netEdgeFilters, setNetEdgeFilters] = useState<Set<string>>(new Set(['financial', 'family', 'business', 'criminal', 'comms', 'surveillance']));
    const [netStrengthMin, setNetStrengthMin] = useState(0);
    const [netIsolatedEdge, setNetIsolatedEdge] = useState<string | null>(null); // "from|to" key
    const [netFocusNode, setNetFocusNode] = useState<string | null>(null);
    const [netShowLabels, setNetShowLabels] = useState(true);

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
        { from: 'p2', to: 'p7', strength: 0.25, type: 'comms' },
        { from: 'p1', to: 'p3', strength: 0.7, type: 'criminal' },
        { from: 'p12', to: 'p2', strength: 0.55, type: 'family' },
        { from: 'p3', to: 'o6', strength: 0.45, type: 'financial' },
        { from: 'p9', to: 'd2', strength: 0.6, type: 'surveillance' },
        { from: 'o1', to: 'o2', strength: 0.2, type: 'financial' },
    ];
    const edgeColors: Record<string, string> = { financial: '#f59e0b', family: '#ec4899', business: '#3b82f6', criminal: '#ef4444', comms: '#8b5cf6', surveillance: '#22c55e' };
    const edgeKey = (e: NetEdge) => `${e.from}|${e.to}`;
    const netNodeConns = (nodeId: string) => netEdges.filter(e => e.from === nodeId || e.to === nodeId);
    const netFilteredEdges = useMemo(() => netEdges.filter(e => netEdgeFilters.has(e.type) && e.strength >= netStrengthMin), [netEdgeFilters, netStrengthMin]);

    // LPR Layer
    const [layerLPR, setLayerLPR] = useState(false);
    const [lprSearch, setLprSearch] = useState('');
    const [lprSelected, setLprSelected] = useState<Set<string>>(new Set());
    const [lprHidden, setLprHidden] = useState<Set<string>>(new Set());
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
    const [faceSearch, setFaceSearch] = useState('');
    const [faceSelected, setFaceSelected] = useState<Set<string>>(new Set()); // selected face IDs to show (empty = all)
    const [faceHidden, setFaceHidden] = useState<Set<string>>(new Set()); // hidden face IDs
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
    const [showObjectsPanel, setShowObjectsPanel] = useState(false);
    const [objPanelTab, setObjPanelTab] = useState<'all' | 'markers' | 'shapes'>('all');
    const [showHeatmapPanel, setShowHeatmapPanel] = useState(false);
    const [showNetworkPanel, setShowNetworkPanel] = useState(false);
    const [showLPRPanel, setShowLPRPanel] = useState(false);
    const [showFacePanel, setShowFacePanel] = useState(false);
    const activeLayerPanel = showHeatmapPanel ? 'heatmap' : showNetworkPanel ? 'network' : showLPRPanel ? 'lpr' : showFacePanel ? 'face' : null;
    const [showRulerPanel, setShowRulerPanel] = useState(false);
    const [showZonePanel, setShowZonePanel] = useState(false);
    const [showPlacesPanel, setShowPlacesPanel] = useState(false);
    const [showWorkspacesPanel, setShowWorkspacesPanel] = useState(false);

    // ═══ EVENT CORRELATION ═══
    const [showCorrelationPanel, setShowCorrelationPanel] = useState(false);
    const [corrSubjectA, setCorrSubjectA] = useState<string>('');
    const [corrSubjectB, setCorrSubjectB] = useState<string>('');
    const [corrRadius, setCorrRadius] = useState(200); // meters
    const [corrTimeWindow, setCorrTimeWindow] = useState('30d');
    const [corrSortBy, setCorrSortBy] = useState<'date' | 'distance' | 'duration'>('date');
    const [corrRunning, setCorrRunning] = useState(false);
    const [corrResults, setCorrResults] = useState<any[] | null>(null);
    const [corrSelectedEvent, setCorrSelectedEvent] = useState<string | null>(null);

    interface CorrEvent { id: string; subjectA: { id: number; name: string; avatar: string; risk: string }; subjectB: { id: number; name: string; avatar: string; risk: string }; lat: number; lng: number; timestamp: string; timeAgo: string; distance: number; duration: number; source: string; confidence: number; severity: 'critical' | 'high' | 'medium' | 'low'; location: string; notes: string; }

    const corrPersonOptions = useMemo(() => {
        const seen = new Set<number>();
        return mockSourceMarkers.filter(m => m.personId && !seen.has(m.personId!) && seen.add(m.personId!)).map(m => ({ id: String(m.personId), label: `${m.personName} ${m.personLastName}`, avatar: m.personAvatar || '', risk: m.risk || 'Unknown', nickname: m.personNickname || '' }));
    }, []);

    const mockCorrResults: CorrEvent[] = useMemo(() => [
        { id: 'ce-1', subjectA: { id: 1, name: 'Marko Horvat', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical' }, subjectB: { id: 12, name: 'Ivan Babić', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High' }, lat: 45.8131, lng: 15.9775, timestamp: '2026-03-24 08:14', timeAgo: '2h ago', distance: 12, duration: 45, source: 'GPS + Phone', confidence: 97, severity: 'critical', location: 'Ban Jelačić Square, Zagreb', notes: 'Both subjects stationary for 45 min. Phone intercept suggests face-to-face meeting.' },
        { id: 'ce-2', subjectA: { id: 1, name: 'Marko Horvat', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical' }, subjectB: { id: 9, name: 'Carlos Mendoza', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical' }, lat: 45.8075, lng: 15.9850, timestamp: '2026-03-23 22:31', timeAgo: '12h ago', distance: 34, duration: 18, source: 'Camera + GPS', confidence: 89, severity: 'critical', location: 'Savska cesta 41, Zagreb', notes: 'Nighttime meeting near known safe house. Subject B arrived by vehicle.' },
        { id: 'ce-3', subjectA: { id: 12, name: 'Ivan Babić', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High' }, subjectB: { id: 7, name: 'Omar Hassan', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High' }, lat: 45.8200, lng: 15.9600, timestamp: '2026-03-23 15:08', timeAgo: '19h ago', distance: 78, duration: 6, source: 'Phone + LPR', confidence: 72, severity: 'high', location: 'Maksimirska 128, Zagreb', notes: 'Brief proximity event. Both driving, possible convoy or following.' },
        { id: 'ce-4', subjectA: { id: 1, name: 'Marko Horvat', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical' }, subjectB: { id: 7, name: 'Omar Hassan', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High' }, lat: 45.8160, lng: 15.9500, timestamp: '2026-03-23 11:22', timeAgo: '23h ago', distance: 145, duration: 2, source: 'Camera', confidence: 64, severity: 'medium', location: 'Ilica 242, Zagreb', notes: 'Subjects in same area briefly. Possible coincidence or surveillance detection.' },
        { id: 'ce-5', subjectA: { id: 9, name: 'Carlos Mendoza', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical' }, subjectB: { id: 12, name: 'Ivan Babić', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High' }, lat: 45.8095, lng: 15.9720, timestamp: '2026-03-22 19:45', timeAgo: '1d ago', distance: 22, duration: 32, source: 'GPS + Phone', confidence: 94, severity: 'critical', location: 'Heinzelova 62, Zagreb', notes: 'Extended meeting at commercial building. Third unknown person detected nearby.' },
        { id: 'ce-6', subjectA: { id: 1, name: 'Marko Horvat', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical' }, subjectB: { id: 12, name: 'Ivan Babić', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High' }, lat: 45.8020, lng: 15.9950, timestamp: '2026-03-22 08:05', timeAgo: '2d ago', distance: 8, duration: 120, source: 'GPS + Phone + Camera', confidence: 99, severity: 'critical', location: 'Vukovarska 58, Zagreb', notes: 'Prolonged co-location (2h). Identified as recurring meeting point. 4th occurrence this month.' },
        { id: 'ce-7', subjectA: { id: 7, name: 'Omar Hassan', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'High' }, subjectB: { id: 9, name: 'Carlos Mendoza', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical' }, lat: 45.8180, lng: 15.9920, timestamp: '2026-03-21 14:30', timeAgo: '3d ago', distance: 55, duration: 10, source: 'LPR + GPS', confidence: 81, severity: 'high', location: 'Port area, Zagreb', notes: 'Both vehicles spotted at port facility. Cargo trailer GPS-007 also present.' },
        { id: 'ce-8', subjectA: { id: 1, name: 'Marko Horvat', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical' }, subjectB: { id: 9, name: 'Carlos Mendoza', avatar: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg', risk: 'Critical' }, lat: 45.8138, lng: 15.9780, timestamp: '2026-03-20 20:15', timeAgo: '4d ago', distance: 18, duration: 55, source: 'Phone + GPS', confidence: 92, severity: 'critical', location: 'Vlaška 70, Zagreb', notes: 'Evening meeting in residential area. Known associate residence.' },
    ], []);

    const runCorrelation = () => {
        setCorrRunning(true);
        triggerTopLoader();
        setTimeout(() => {
            let results = [...mockCorrResults];
            if (corrSubjectA) results = results.filter(r => String(r.subjectA.id) === corrSubjectA || String(r.subjectB.id) === corrSubjectA);
            if (corrSubjectB) results = results.filter(r => String(r.subjectA.id) === corrSubjectB || String(r.subjectB.id) === corrSubjectB);
            results = results.filter(r => r.distance <= corrRadius);
            if (corrSortBy === 'distance') results.sort((a, b) => a.distance - b.distance);
            else if (corrSortBy === 'duration') results.sort((a, b) => b.duration - a.duration);
            setCorrResults(results);
            setCorrRunning(false);
        }, 1200 + Math.random() * 800);
    };

    const corrStats = useMemo(() => {
        if (!corrResults) return null;
        const total = corrResults.length;
        const avgDist = total > 0 ? Math.round(corrResults.reduce((s, r) => s + r.distance, 0) / total) : 0;
        const avgDur = total > 0 ? Math.round(corrResults.reduce((s, r) => s + r.duration, 0) / total) : 0;
        const totalDur = corrResults.reduce((s, r) => s + r.duration, 0);
        const critical = corrResults.filter(r => r.severity === 'critical').length;
        const high = corrResults.filter(r => r.severity === 'high').length;
        const uniquePairs = new Set(corrResults.map(r => [r.subjectA.id, r.subjectB.id].sort().join('-'))).size;
        const avgConf = total > 0 ? Math.round(corrResults.reduce((s, r) => s + r.confidence, 0) / total) : 0;
        return { total, avgDist, avgDur, totalDur, critical, high, uniquePairs, avgConf };
    }, [corrResults]);

    // ═══ ANOMALY DETECTION ═══
    const [showAnomalyPanel, setShowAnomalyPanel] = useState(false);
    const [anomalySubject, setAnomalySubject] = useState<string>('');
    const [anomalyType, setAnomalyType] = useState<string>('all');
    const [anomalySensitivity, setAnomalySensitivity] = useState(70);
    const [anomalyRunning, setAnomalyRunning] = useState(false);
    const [anomalyResults, setAnomalyResults] = useState<any[] | null>(null);
    const [anomalySelectedId, setAnomalySelectedId] = useState<string | null>(null);



    const mockAnomalies = MOCK_ANOMALIES;

    const runAnomalyDetection = () => {
        setAnomalyRunning(true);
        triggerTopLoader();
        setTimeout(() => {
            let results = [...mockAnomalies];
            if (anomalySubject) results = results.filter(r => String(r.personId) === anomalySubject);
            if (anomalyType !== 'all') results = results.filter(r => r.type === anomalyType);
            results = results.filter(r => r.confidence >= (100 - anomalySensitivity));
            setAnomalyResults(results);
            setAnomalyRunning(false);
        }, 1500 + Math.random() * 1000);
    };

    const anomalyStats = useMemo(() => {
        if (!anomalyResults) return null;
        const total = anomalyResults.length;
        const critical = anomalyResults.filter(r => r.severity === 'critical').length;
        const high = anomalyResults.filter(r => r.severity === 'high').length;
        const medium = anomalyResults.filter(r => r.severity === 'medium').length;
        const avgConf = total > 0 ? Math.round(anomalyResults.reduce((s, r) => s + r.confidence, 0) / total) : 0;
        const avgDev = total > 0 ? Math.round(anomalyResults.reduce((s, r) => s + r.deviation, 0) / total) : 0;
        const subjects = new Set(anomalyResults.map(r => r.personId)).size;
        const types = new Set(anomalyResults.map(r => r.type)).size;
        return { total, critical, high, medium, avgConf, avgDev, subjects, types };
    }, [anomalyResults]);

    // ═══ PREDICTIVE RISK ═══
    const [showPredictivePanel, setShowPredictivePanel] = useState(false);
    const [predTimeHorizon, setPredTimeHorizon] = useState<'6h' | '24h' | '72h' | '7d'>('24h');
    const [predRunning, setPredRunning] = useState(false);
    const [predResults, setPredResults] = useState<any[] | null>(null);
    const [predSelectedId, setPredSelectedId] = useState<string | null>(null);


    const mockPredictions = MOCK_PREDICTIONS;

    const runPredictiveRisk = () => {
        setPredRunning(true);
        triggerTopLoader();
        setTimeout(() => {
            setPredResults([...mockPredictions]);
            setPredRunning(false);
        }, 2000 + Math.random() * 1000);
    };

    const predStats = useMemo(() => {
        if (!predResults) return null;
        const total = predResults.length;
        const escalating = predResults.filter(r => r.riskDelta > 10).length;
        const avgScore = total > 0 ? Math.round(predResults.reduce((s, r) => s + r.riskScore, 0) / total) : 0;
        const avgConf = total > 0 ? Math.round(predResults.reduce((s, r) => s + r.confidence, 0) / total) : 0;
        const critPredicted = predResults.filter(r => r.predictedRisk === 'Critical').length;
        const totalActions = predResults.reduce((s, r) => s + r.recommendedActions.length, 0);
        return { total, escalating, avgScore, avgConf, critPredicted, totalActions };
    }, [predResults]);

    // ═══ PATTERN DETECTION ═══
    const [showPatternPanel, setShowPatternPanel] = useState(false);
    const [patternSubject, setPatternSubject] = useState<string>('');
    const [patternCategory, setPatternCategory] = useState<string>('all');
    const [patternRunning, setPatternRunning] = useState(false);
    const [patternResults, setPatternResults] = useState<any[] | null>(null);
    const [patternSelectedId, setPatternSelectedId] = useState<string | null>(null);



    const mockPatterns = MOCK_PATTERNS;

    const runPatternDetection = () => {
        setPatternRunning(true);
        triggerTopLoader();
        setTimeout(() => {
            let results = [...mockPatterns];
            if (patternSubject) results = results.filter(r => String(r.personId) === patternSubject);
            if (patternCategory !== 'all') results = results.filter(r => r.category === patternCategory);
            setPatternResults(results);
            setPatternRunning(false);
        }, 1800 + Math.random() * 1200);
    };

    const patternStats = useMemo(() => {
        if (!patternResults) return null;
        const total = patternResults.length;
        const critical = patternResults.filter(r => r.severity === 'critical').length;
        const high = patternResults.filter(r => r.severity === 'high').length;
        const avgReg = total > 0 ? Math.round(patternResults.reduce((s, r) => s + r.regularity, 0) / total) : 0;
        const avgConf = total > 0 ? Math.round(patternResults.reduce((s, r) => s + r.confidence, 0) / total) : 0;
        const totalOcc = patternResults.reduce((s, r) => s + r.occurrences, 0);
        const subjects = new Set(patternResults.map(r => r.personId)).size;
        return { total, critical, high, avgReg, avgConf, totalOcc, subjects };
    }, [patternResults]);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // ═══ INCIDENT TIMELINE ═══
    const [showIncidentPanel, setShowIncidentPanel] = useState(false);
    const [incidentSearch, setIncidentSearch] = useState('');
    const [incidentTypeFilter, setIncidentTypeFilter] = useState<Set<string>>(new Set(['all']));
    const [incidentSevFilter, setIncidentSevFilter] = useState<Set<string>>(new Set(['all']));
    const [incidentSelectedId, setIncidentSelectedId] = useState<string | null>(null);
    const [incidentSortAsc, setIncidentSortAsc] = useState(false);



    const mockIncidents = MOCK_INCIDENTS;

    const filteredIncidents = useMemo(() => {
        let results = [...mockIncidents];
        if (!incidentTypeFilter.has('all')) results = results.filter(e => incidentTypeFilter.has(e.type));
        if (!incidentSevFilter.has('all')) results = results.filter(e => incidentSevFilter.has(e.severity));
        if (incidentSearch.trim()) { const q = incidentSearch.toLowerCase(); results = results.filter(e => e.title.toLowerCase().includes(q) || e.personName.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.source.toLowerCase().includes(q)); }
        if (incidentSortAsc) results.reverse();
        return results;
    }, [mockIncidents, incidentTypeFilter, incidentSevFilter, incidentSearch, incidentSortAsc]);

    const incidentStats = useMemo(() => ({
        total: mockIncidents.length,
        critical: mockIncidents.filter(e => e.severity === 'critical').length,
        high: mockIncidents.filter(e => e.severity === 'high').length,
        medium: mockIncidents.filter(e => e.severity === 'medium').length,
        low: mockIncidents.filter(e => e.severity === 'low').length,
        info: mockIncidents.filter(e => e.severity === 'info').length,
        types: new Set(mockIncidents.map(e => e.type)).size,
        subjects: new Set(mockIncidents.filter(e => e.personId > 0).map(e => e.personId)).size,
    }), [mockIncidents]);

    // ═══ HEAT CALENDAR ═══
    const [showHeatCalPanel, setShowHeatCalPanel] = useState(false);
    const [heatCalPerson, setHeatCalPerson] = useState<string>('1');

    const heatCalData = useMemo(() => {
        const data: Record<number, Record<string, number>> = {};
        [1, 7, 9, 12].forEach(pid => {
            data[pid] = {};
            const now = new Date(2026, 2, 24);
            for (let d = 0; d < 90; d++) {
                const date = new Date(now); date.setDate(now.getDate() - d);
                const key = date.toISOString().slice(0, 10);
                const dow = date.getDay();
                const isWeekend = dow === 0 || dow === 6;
                const base = pid === 1 ? 14 : pid === 9 ? 18 : pid === 7 ? 8 : 10;
                const noise = Math.floor(Math.random() * 12) - 3;
                const weekendMod = isWeekend ? (pid === 1 && d < 21 ? 8 : -5) : 0;
                const trend = pid === 9 ? Math.floor(d < 14 ? 6 : 0) : 0;
                data[pid][key] = Math.max(0, base + noise + weekendMod + trend);
            }
        });
        return data;
    }, []);

    // ═══ MULTI-ENTITY COMPARISON ═══
    const [showComparePanel, setShowComparePanel] = useState(false);
    const [compareA, setCompareA] = useState<string>('1');
    const [compareB, setCompareB] = useState<string>('9');


    const compareData = useMemo((): CompareMetric[] => {
        if (!compareA || !compareB) return [];
        const metrics: Record<string, Record<string, { events: number; avgSpeed: number; nightActivity: number; zones: number; colocs: number; devices: number; lprHits: number; faceHits: number; comms: number; riskScore: number; locations: number; anomalies: number }>> = {
            '1': { data: { events: 847, avgSpeed: 42, nightActivity: 18, zones: 4, colocs: 23, devices: 3, lprHits: 56, faceHits: 12, comms: 34, riskScore: 94, locations: 31, anomalies: 7 } },
            '7': { data: { events: 412, avgSpeed: 28, nightActivity: 6, zones: 2, colocs: 11, devices: 2, lprHits: 18, faceHits: 5, comms: 89, riskScore: 72, locations: 14, anomalies: 4 } },
            '9': { data: { events: 634, avgSpeed: 55, nightActivity: 32, zones: 3, colocs: 19, devices: 4, lprHits: 41, faceHits: 8, comms: 52, riskScore: 89, locations: 26, anomalies: 6 } },
            '12': { data: { events: 523, avgSpeed: 38, nightActivity: 11, zones: 3, colocs: 15, devices: 2, lprHits: 34, faceHits: 7, comms: 21, riskScore: 81, locations: 19, anomalies: 5 } },
        };
        const a = (metrics[compareA] || metrics['1']).data;
        const b = (metrics[compareB] || metrics['9']).data;
        return [
            { label: 'Risk Score', icon: '⚠️', aVal: a.riskScore, bVal: b.riskScore, higherIsBad: true },
            { label: 'Total Events', icon: '📊', aVal: a.events, bVal: b.events, higherIsBad: true },
            { label: 'Night Activity', icon: '🌙', aVal: a.nightActivity, bVal: b.nightActivity, unit: 'events', higherIsBad: true },
            { label: 'Avg Speed', icon: '🏎️', aVal: a.avgSpeed, bVal: b.avgSpeed, unit: 'km/h', higherIsBad: true },
            { label: 'Locations Visited', icon: '📍', aVal: a.locations, bVal: b.locations, higherIsBad: true },
            { label: 'Co-locations', icon: '🔗', aVal: a.colocs, bVal: b.colocs, higherIsBad: true },
            { label: 'Zone Violations', icon: '🛡️', aVal: a.zones, bVal: b.zones, higherIsBad: true },
            { label: 'LPR Captures', icon: '🚗', aVal: a.lprHits, bVal: b.lprHits },
            { label: 'Face Matches', icon: '🧑', aVal: a.faceHits, bVal: b.faceHits },
            { label: 'Comms Intercepts', icon: '📡', aVal: a.comms, bVal: b.comms, higherIsBad: true },
            { label: 'Active Devices', icon: '📱', aVal: a.devices, bVal: b.devices },
            { label: 'Anomalies', icon: '🧠', aVal: a.anomalies, bVal: b.anomalies, higherIsBad: true },
        ];
    }, [compareA, compareB]);

    // ═══ ROUTE REPLAY ═══
    const [showRouteReplay, setShowRouteReplay] = useState(false);
    const [rrPerson, setRrPerson] = useState<string>('1');
    const [rrPlaying, setRrPlaying] = useState(false);
    const [rrSpeed, setRrSpeed] = useState<number>(1);
    const [rrCursor, setRrCursor] = useState<number>(0);
    const rrIntervalRef = useRef<any>(null);

    const mockRoutes = MOCK_ROUTES;

    useEffect(() => {
        if (rrPlaying && showRouteReplay) {
            const route = mockRoutes[rrPerson] || [];
            if (route.length === 0) return;
            rrIntervalRef.current = setInterval(() => {
                setRrCursor(prev => {
                    const next = prev + 1;
                    if (next >= route.length) { setRrPlaying(false); return route.length - 1; }
                    return next;
                });
            }, 800 / rrSpeed);
            return () => clearInterval(rrIntervalRef.current);
        }
        return () => { if (rrIntervalRef.current) clearInterval(rrIntervalRef.current); };
    }, [rrPlaying, rrSpeed, rrPerson, showRouteReplay]);

    // Fly to current route point
    useEffect(() => {
        if (!showRouteReplay) return;
        const route = mockRoutes[rrPerson] || [];
        if (route.length === 0 || rrCursor >= route.length) return;
        const pt = route[rrCursor];
        mapRef.current?.easeTo({ center: [pt.lng, pt.lat], duration: 600 });
    }, [rrCursor, rrPerson, showRouteReplay]);

    // ═══ FLOATING PANEL SYSTEM ═══
    const mapContainerRef = useRef<HTMLDivElement>(null);
    type PanelId = 'tracker' | 'feed' | 'ruler' | 'zone' | 'objects' | 'places' | 'workspaces' | 'layers' | 'correlation' | 'anomaly' | 'predictive' | 'pattern' | 'incidents' | 'heatcal' | 'compare' | 'routereplay';
    interface PanelPos { x: number; y: number; }
    interface PanelSize { w: number; h: number; }
    const SNAP_THRESHOLD = 24;
    const MIN_PANEL_W = 240;
    const MIN_PANEL_H = 120;

    // Default positions — spread panels so they don't overlap when multiple open
    const defaultPanelPositions: Record<string, PanelPos> = {
        tracker: { x: 10, y: 10 },
        correlation: { x: 10, y: 10 },
        anomaly: { x: 10, y: 10 },
        predictive: { x: 10, y: 10 },
        pattern: { x: 10, y: 10 },
        incidents: { x: 10, y: 10 },
        feed: { x: 10, y: 10 },
        ruler: { x: 10, y: 10 },
        zone: { x: 10, y: 10 },
        objects: { x: 10, y: 10 },
        places: { x: 10, y: 10 },
        workspaces: { x: 10, y: 10 },
        layers: { x: 10, y: 10 },
        heatcal: { x: 10, y: 10 },
        compare: { x: 10, y: 10 },
        routereplay: { x: 10, y: 10 },
    };

    const [panelPositions, setPanelPositions] = useState<Record<string, PanelPos>>({});
    const [panelSizes, setPanelSizes] = useState<Record<string, PanelSize>>({});
    const [panelMinimized, setPanelMinimized] = useState<Set<string>>(new Set());
    const [panelMaximized, setPanelMaximized] = useState<string | null>(null);
    const [panelZStack, setPanelZStack] = useState<string[]>([]);
    const panelDragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
    const panelResizeRef = useRef<{ id: string; edge: string; startX: number; startY: number; origX: number; origY: number; origW: number; origH: number } | null>(null);

    // Auto-position: when a panel opens at default pos, cascade it if another panel is already there
    const getAutoPosition = (id: PanelId): PanelPos => {
        if (panelPositions[id]) return panelPositions[id];
        const base = defaultPanelPositions[id] || { x: 10, y: 10 };
        const occupiedPositions = Object.entries(panelPositions).filter(([k]) => k !== id).map(([, v]) => v);
        let pos = { ...base };
        let attempts = 0;
        while (attempts < 8 && occupiedPositions.some(op => Math.abs(op.x - pos.x) < 30 && Math.abs(op.y - pos.y) < 30)) {
            pos = { x: pos.x + 30, y: pos.y + 30 };
            attempts++;
        }
        // Clamp to container
        const cw = mapContainerRef.current ? mapContainerRef.current.offsetWidth : window.innerWidth;
        const ch = mapContainerRef.current ? mapContainerRef.current.offsetHeight : window.innerHeight;
        pos.x = Math.max(0, Math.min(pos.x, cw - 280));
        pos.y = Math.max(0, Math.min(pos.y, ch - 120));
        return pos;
    };

    const getPanelPos = (id: PanelId) => panelPositions[id] || getAutoPosition(id);
    const getPanelSize = (id: PanelId, defaultW: number) => panelSizes[id] || { w: defaultW, h: 0 };
    const isPanelMin = (id: PanelId) => panelMinimized.has(id);
    const isPanelMax = (id: PanelId) => panelMaximized === id;
    const getPanelZ = (id: PanelId) => { const idx = panelZStack.indexOf(id); return idx >= 0 ? 16 + idx : 16; };

    const bringToFront = (id: PanelId) => {
        setPanelZStack(prev => { if (prev.length > 0 && prev[prev.length - 1] === id) return prev; const n = prev.filter(p => p !== id); n.push(id); return n; });
        // Auto-set position on first open so cascade takes effect
        if (!panelPositions[id]) {
            const pos = getAutoPosition(id);
            setPanelPositions(prev => ({ ...prev, [id]: pos }));
        }
    };

    const togglePanelMin = (id: PanelId) => {
        setPanelMinimized(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
        if (panelMaximized === id) setPanelMaximized(null);
    };
    const togglePanelMax = (id: PanelId) => {
        setPanelMaximized(prev => prev === id ? null : id);
        setPanelMinimized(prev => { const n = new Set(prev); n.delete(id); return n; });
        bringToFront(id);
    };

    // Snap-to-edge logic — uses actual panel size for right/bottom edge
    const snapPosition = (x: number, y: number, panelEl: HTMLElement | null): PanelPos => {
        const container = mapContainerRef.current;
        const cw = container ? container.offsetWidth : window.innerWidth;
        const ch = container ? container.offsetHeight : window.innerHeight;
        const pw = panelEl ? panelEl.offsetWidth : 360;
        const ph = panelEl ? panelEl.offsetHeight : 300;
        let sx = x, sy = y;
        // Left edge snap
        if (x < SNAP_THRESHOLD) sx = 4;
        // Right edge snap — panel's right side aligns to container right
        else if (x + pw > cw - SNAP_THRESHOLD) sx = Math.max(4, cw - pw - 4);
        // Top edge snap
        if (y < SNAP_THRESHOLD) sy = 4;
        // Bottom edge snap — panel's bottom side aligns to container bottom
        else if (y + ph > ch - SNAP_THRESHOLD) sy = Math.max(4, ch - ph - 4);
        // Clamp so panel is always reachable
        sx = Math.max(0, Math.min(sx, cw - 40));
        sy = Math.max(0, Math.min(sy, ch - 30));
        return { x: sx, y: sy };
    };

    // Mouse drag
    const onPanelDragStart = (id: PanelId, e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button, input, select, textarea, a')) return;
        e.preventDefault();
        bringToFront(id);
        const pos = getPanelPos(id);
        const panelEl = (e.target as HTMLElement).closest('[data-panel]') as HTMLElement | null;
        panelDragRef.current = { id, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
        const onMove = (ev: MouseEvent) => {
            if (!panelDragRef.current || panelDragRef.current.id !== id) return;
            const dx = ev.clientX - panelDragRef.current.startX;
            const dy = ev.clientY - panelDragRef.current.startY;
            const raw = { x: panelDragRef.current.origX + dx, y: panelDragRef.current.origY + dy };
            const snapped = snapPosition(raw.x, raw.y, panelEl);
            setPanelPositions(prev => ({ ...prev, [id]: snapped }));
        };
        const onUp = () => { panelDragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    // Touch drag
    const onPanelTouchStart = (id: PanelId, e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('button, input, select, textarea, a')) return;
        bringToFront(id);
        const touch = e.touches[0];
        const pos = getPanelPos(id);
        const panelEl = (e.target as HTMLElement).closest('[data-panel]') as HTMLElement | null;
        panelDragRef.current = { id, startX: touch.clientX, startY: touch.clientY, origX: pos.x, origY: pos.y };
        const onMove = (ev: TouchEvent) => {
            if (!panelDragRef.current || panelDragRef.current.id !== id) return;
            ev.preventDefault();
            const t = ev.touches[0];
            const dx = t.clientX - panelDragRef.current.startX;
            const dy = t.clientY - panelDragRef.current.startY;
            const raw = { x: panelDragRef.current.origX + dx, y: panelDragRef.current.origY + dy };
            const snapped = snapPosition(raw.x, raw.y, panelEl);
            setPanelPositions(prev => ({ ...prev, [id]: snapped }));
        };
        const onEnd = () => { panelDragRef.current = null; window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
    };

    // Resize
    const onPanelResizeStart = (id: PanelId, edge: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        bringToFront(id);
        const pos = getPanelPos(id);
        const el = (e.target as HTMLElement).closest('[data-panel]') as HTMLElement | null;
        const origW = el ? el.offsetWidth : 360;
        const origH = el ? el.offsetHeight : 400;
        panelResizeRef.current = { id, edge, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, origW, origH };
        const onMove = (ev: MouseEvent) => {
            if (!panelResizeRef.current || panelResizeRef.current.id !== id) return;
            const ref = panelResizeRef.current;
            const dx = ev.clientX - ref.startX;
            const dy = ev.clientY - ref.startY;
            let newW = ref.origW, newH = ref.origH, newX = ref.origX, newY = ref.origY;
            if (edge.includes('e')) newW = Math.max(MIN_PANEL_W, ref.origW + dx);
            if (edge.includes('w')) { newW = Math.max(MIN_PANEL_W, ref.origW - dx); newX = ref.origX + (ref.origW - newW); }
            if (edge.includes('s')) newH = Math.max(MIN_PANEL_H, ref.origH + dy);
            if (edge.includes('n')) { newH = Math.max(MIN_PANEL_H, ref.origH - dy); newY = ref.origY + (ref.origH - newH); }
            setPanelSizes(prev => ({ ...prev, [id]: { w: newW, h: newH } }));
            if (edge.includes('w') || edge.includes('n')) setPanelPositions(prev => ({ ...prev, [id]: { x: newX, y: newY } }));
        };
        const onUp = () => { panelResizeRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); document.body.style.cursor = ''; };
        document.body.style.cursor = edge === 'e' || edge === 'w' ? 'ew-resize' : edge === 'n' || edge === 's' ? 'ns-resize' : edge.includes('n') && edge.includes('e') || edge.includes('s') && edge.includes('w') ? 'nesw-resize' : 'nwse-resize';
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };


    const panelStyle = (id: PanelId, width: string, color: string): React.CSSProperties => {
        if (isPanelMax(id)) return { position: 'absolute' as const, top: 4, left: 4, right: 4, bottom: timelineOpen ? 280 : 4, width: 'auto', maxHeight: 'none', zIndex: 20, display: 'flex', flexDirection: 'column' as const, background: 'rgba(10,14,22,0.98)', border: `1px solid ${color}25`, borderRadius: 10, boxShadow: '0 12px 48px rgba(0,0,0,0.6)', backdropFilter: 'blur(14px)', overflow: 'hidden', animation: 'argux-fadeIn 0.15s ease-out', transition: 'all 0.2s ease' };
        const pos = getPanelPos(id);
        const size = getPanelSize(id, parseInt(width) || 360);
        const hasCustomSize = panelSizes[id];
        return { position: 'absolute' as const, top: pos.y, left: pos.x, width: hasCustomSize ? size.w : `min(${width}, calc(100vw - 20px))`, height: hasCustomSize && size.h > 0 && !isPanelMin(id) ? size.h : undefined, maxHeight: isPanelMin(id) ? 'none' : hasCustomSize ? undefined : `calc(100% - ${pos.y + 10}px)`, zIndex: getPanelZ(id), display: 'flex', flexDirection: 'column' as const, background: 'rgba(10,14,22,0.97)', border: `1px solid ${color}20`, borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', overflow: 'hidden', animation: 'argux-fadeIn 0.15s ease-out' };
    };

    // Resize grip — single visible handle at bottom-right corner, does not block content
    const PanelResizeGrip = ({ id }: { id: PanelId }) => {
        if (isPanelMax(id) || isPanelMin(id)) return null;
        return <div onMouseDown={e => onPanelResizeStart(id, 'se', e)} style={{ position: 'absolute' as const, bottom: 2, right: 2, width: 12, height: 12, cursor: 'nwse-resize', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, transition: 'opacity 0.15s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}><svg width="8" height="8" viewBox="0 0 8 8" fill="none"><line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" strokeWidth="1"/><line x1="7" y1="4" x2="4" y2="7" stroke="currentColor" strokeWidth="1"/><line x1="7" y1="6.5" x2="6.5" y2="7" stroke="currentColor" strokeWidth="1"/></svg></div>;
    };

    const PanelHeader = ({ id, icon, title, subtitle, color, onClose, extra }: { id: PanelId; icon: string; title: string; subtitle: string; color: string; onClose: () => void; extra?: React.ReactNode }) => (
        <div onMouseDown={e => onPanelDragStart(id, e)} onTouchStart={e => onPanelTouchStart(id, e)} style={{ padding: '8px 10px', borderBottom: isPanelMin(id) ? 'none' : `1px solid ${theme.border}30`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, cursor: 'grab', userSelect: 'none', touchAction: 'none' }}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{title}</div>
                {!isPanelMin(id) && <div style={{ fontSize: 7, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{subtitle}</div>}
            </div>
            {extra}
            <button onClick={() => togglePanelMin(id)} title={isPanelMin(id) ? 'Expand' : 'Minimize'} style={{ width: 20, height: 20, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 9, padding: 0, flexShrink: 0 }}>{isPanelMin(id) ? '🔽' : '🔼'}</button>
            <button onClick={() => togglePanelMax(id)} title={isPanelMax(id) ? 'Restore' : 'Maximize'} style={{ width: 20, height: 20, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 9, padding: 0, flexShrink: 0 }}>{isPanelMax(id) ? '🗗' : '🗖'}</button>
            <button onClick={onClose} style={{ width: 20, height: 20, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 10, padding: 0, flexShrink: 0 }}>✕</button>
        </div>
    );

    const filteredObjects = mapObjects.filter(o => {
        if (objSearch && !o.name.toLowerCase().includes(objSearch.toLowerCase()) && !o.type.includes(objSearch.toLowerCase())) return false;
        if (objPanelTab === 'markers' && o.type !== 'marker') return false;
        if (objPanelTab === 'shapes' && o.type === 'marker') return false;
        return true;
    });
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
    const goToObj = (o: MapObject) => { triggerTopLoader(); if (o.coords.length > 0) mapRef.current?.flyTo({ center: o.coords[0], zoom: 16, duration: 1200 }); };

    // Settings
    const [showMinimap, setShowMinimap] = useState(true);
    const [showCompass, setShowCompass] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [showLocalization, setShowLocalization] = useState(false);
    const [showCoords, setShowCoords] = useState(false);
    const [showSearch, setShowSearch] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    const [showZones, setShowZones] = useState(false);
    const [showObjects, setShowObjects] = useState(false);
    const [showFps, setShowFps] = useState(false);
    const [showLiveFeed, setShowLiveFeed] = useState(false);

    // ═══ LIVE TRACKER ═══
    interface LiveTrackSession { id: string; personId: number; personName: string; personLastName: string; personNickname: string; personAvatar: string; risk: string; sourceType: 'gps' | 'phone'; sourceLabel: string; deviceId: number; status: 'tracking' | 'paused' | 'lost'; startedAt: string; speed: number; heading: string; distance: number; accuracy: number; battery: number; signal: number; positions: { lat: number; lng: number; ts: number }[]; color: string; }
    const [liveTrackSessions, setLiveTrackSessions] = useState<LiveTrackSession[]>([]);
    const [liveTrackSearch, setLiveTrackSearch] = useState('');
    const [liveTrackFollow, setLiveTrackFollow] = useState<string | null>(null); // session ID to auto-follow
    const [liveTrackShowTrails, setLiveTrackShowTrails] = useState(true);
    const [liveTrackShowLabels, setLiveTrackShowLabels] = useState(true);
    const [liveTrackShowRadius, setLiveTrackShowRadius] = useState(true);
    const [showLiveTracker, setShowLiveTracker] = useState(false);
    const [liveTrackTab, setLiveTrackTab] = useState<'sessions' | 'targets' | 'history'>('sessions');
    const liveTrackMarkersRef = useRef<any[]>([]);
    const liveTrackInterval = useRef<number | null>(null);

    // Persons available for tracking (have GPS or phone locator sources)
    const trackablePersons = useMemo(() => {
        const gpsPersons = mockSourceMarkers.filter(m => m.sourceId === 'gps' && m.personId).map(m => ({ personId: m.personId!, personName: m.personName!, personLastName: m.personLastName!, personNickname: m.personNickname || '', personAvatar: m.personAvatar || '', risk: m.risk || 'Unknown', sourceType: 'gps' as const, sourceLabel: m.label, deviceId: m.deviceId || 0, lat: m.lat, lng: m.lng, battery: m.battery ?? 0, signal: m.signal ?? 0, status: m.status }));
        const phonePersons = mockSourceMarkers.filter(m => m.sourceId === 'app-locator' && m.personId).map(m => ({ personId: m.personId!, personName: m.personName!, personLastName: m.personLastName!, personNickname: m.personNickname || '', personAvatar: m.personAvatar || '', risk: m.risk || 'Unknown', sourceType: 'phone' as const, sourceLabel: m.label, deviceId: m.deviceId || 0, lat: m.lat, lng: m.lng, battery: m.battery ?? 0, signal: m.signal ?? 0, status: m.status }));
        return [...gpsPersons, ...phonePersons];
    }, []);

    const trackColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#ef4444'];
    const headings = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    const startLiveTrack = (tp: typeof trackablePersons[0]) => {
        triggerTopLoader();
        const existing = liveTrackSessions.find(s => s.personId === tp.personId && s.sourceType === tp.sourceType);
        if (existing) return;
        const color = trackColors[liveTrackSessions.length % trackColors.length];
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const session: LiveTrackSession = {
            id: `lt-${Date.now()}-${tp.personId}`, personId: tp.personId, personName: tp.personName, personLastName: tp.personLastName, personNickname: tp.personNickname, personAvatar: tp.personAvatar, risk: tp.risk, sourceType: tp.sourceType, sourceLabel: tp.sourceLabel, deviceId: tp.deviceId, status: tp.status === 'offline' ? 'lost' : 'tracking', startedAt: ts, speed: Math.floor(Math.random() * 45), heading: headings[Math.floor(Math.random() * 8)], distance: 0, accuracy: tp.sourceType === 'phone' ? 5 + Math.floor(Math.random() * 20) : 2 + Math.floor(Math.random() * 5), battery: tp.battery, signal: tp.signal, positions: [{ lat: tp.lat, lng: tp.lng, ts: Date.now() }], color,
        };
        setLiveTrackSessions(prev => [...prev, session]);
    };

    const stopLiveTrack = (sessionId: string) => {
        triggerTopLoader();
        setLiveTrackSessions(prev => prev.filter(s => s.id !== sessionId));
        if (liveTrackFollow === sessionId) setLiveTrackFollow(null);
    };

    const togglePauseLiveTrack = (sessionId: string) => {
        setLiveTrackSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: s.status === 'tracking' ? 'paused' : 'tracking' } : s));
    };

    const stopAllLiveTracks = () => {
        triggerTopLoader();
        setLiveTrackSessions([]);
        setLiveTrackFollow(null);
    };

    // Simulate live position updates every 2 seconds
    useEffect(() => {
        if (liveTrackSessions.filter(s => s.status === 'tracking').length === 0) {
            if (liveTrackInterval.current) { clearInterval(liveTrackInterval.current); liveTrackInterval.current = null; }
            return;
        }
        liveTrackInterval.current = window.setInterval(() => {
            setLiveTrackSessions(prev => prev.map(s => {
                if (s.status !== 'tracking') return s;
                const last = s.positions[s.positions.length - 1];
                // Random walk simulation
                const dlat = (Math.random() - 0.5) * 0.0008;
                const dlng = (Math.random() - 0.5) * 0.0012;
                const newLat = last.lat + dlat;
                const newLng = last.lng + dlng;
                const dx = dlng * 111320 * Math.cos(newLat * Math.PI / 180);
                const dy = dlat * 111320;
                const stepDist = Math.sqrt(dx * dx + dy * dy);
                const speed = Math.round(stepDist / 2 * 3.6); // m/2s → km/h
                const angle = Math.atan2(dx, dy) * 180 / Math.PI;
                const hIdx = Math.round(((angle + 360) % 360) / 45) % 8;
                // Randomly degrade signal or lose track
                const rnd = Math.random();
                let newStatus: 'tracking' | 'paused' | 'lost' = s.status;
                let newSignal = s.signal + Math.floor((Math.random() - 0.5) * 6);
                newSignal = Math.max(0, Math.min(100, newSignal));
                if (rnd > 0.98 && s.status === 'tracking') newStatus = 'lost';
                const newBat = Math.max(0, s.battery - (Math.random() > 0.8 ? 1 : 0));
                return { ...s, speed, heading: headings[hIdx], distance: s.distance + stepDist, accuracy: s.sourceType === 'phone' ? 3 + Math.floor(Math.random() * 25) : 1 + Math.floor(Math.random() * 6), battery: newBat, signal: newSignal, status: newStatus, positions: [...s.positions, { lat: newLat, lng: newLng, ts: Date.now() }].slice(-200) };
            }));
        }, 2000);
        return () => { if (liveTrackInterval.current) { clearInterval(liveTrackInterval.current); liveTrackInterval.current = null; } };
    }, [liveTrackSessions.filter(s => s.status === 'tracking').length]);

    // Auto-follow tracked person
    useEffect(() => {
        if (!liveTrackFollow) return;
        const session = liveTrackSessions.find(s => s.id === liveTrackFollow);
        if (!session || session.positions.length === 0) return;
        const last = session.positions[session.positions.length - 1];
        const map = mapRef.current;
        if (map) map.easeTo({ center: [last.lng, last.lat], duration: 800 });
    }, [liveTrackFollow, liveTrackSessions]);

    // Render live track markers and trails on map
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        liveTrackMarkersRef.current.forEach(m => m.remove());
        liveTrackMarkersRef.current = [];
        const ml = (window as any).maplibregl;
        if (!ml) return;

        liveTrackSessions.forEach(session => {
            if (session.positions.length === 0) return;
            const last = session.positions[session.positions.length - 1];
            const riskColor = session.risk === 'Critical' ? '#ef4444' : session.risk === 'High' ? '#f97316' : '#f59e0b';
            const isLost = session.status === 'lost';
            const isPaused = session.status === 'paused';

            // Trail line
            if (liveTrackShowTrails && session.positions.length > 1) {
                const srcId = `lt-trail-${session.id}`;
                const coords = session.positions.map(p => [p.lng, p.lat]);
                const geojson: any = { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } };
                try {
                    if (map.getSource(srcId)) { (map.getSource(srcId) as any).setData(geojson); }
                    else { map.addSource(srcId, { type: 'geojson', data: geojson }); map.addLayer({ id: `${srcId}-line`, type: 'line', source: srcId, paint: { 'line-color': session.color, 'line-width': 2.5, 'line-opacity': isPaused ? 0.3 : 0.7, 'line-dasharray': isPaused ? [4, 4] : [1, 0] } }); }
                } catch {}
            }

            // Accuracy radius circle
            if (liveTrackShowRadius && session.accuracy > 5) {
                const circSrcId = `lt-radius-${session.id}`;
                const steps = 40;
                const km = session.accuracy / 1000;
                const circCoords: [number, number][] = [];
                for (let i = 0; i <= steps; i++) {
                    const a = (i / steps) * Math.PI * 2;
                    circCoords.push([last.lng + (km / 111.32) * Math.cos(a) / Math.cos(last.lat * Math.PI / 180), last.lat + (km / 111.32) * Math.sin(a)]);
                }
                const circGeo: any = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [circCoords] } };
                try {
                    if (map.getSource(circSrcId)) { (map.getSource(circSrcId) as any).setData(circGeo); }
                    else { map.addSource(circSrcId, { type: 'geojson', data: circGeo }); map.addLayer({ id: `${circSrcId}-fill`, type: 'fill', source: circSrcId, paint: { 'fill-color': session.color, 'fill-opacity': 0.06 } }); map.addLayer({ id: `${circSrcId}-stroke`, type: 'line', source: circSrcId, paint: { 'line-color': session.color, 'line-width': 1, 'line-opacity': 0.3, 'line-dasharray': [3, 3] } }); }
                } catch {}
            }

            // Person marker
            const wrapper = document.createElement('div');
            wrapper.className = 'tmap-marker-source';
            wrapper.style.cssText = `opacity:${isLost ? 0.4 : 1};transition:opacity 0.5s;`;
            const pulseRing = session.status === 'tracking' ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${session.color};opacity:0;pointer-events:none" class="tmap-tl-pulse"></div>` : '';
            wrapper.innerHTML = `<div class="tmap-marker-inner" style="width:34px;height:34px;border-radius:50%;border:3px solid ${session.color};background:url(${session.personAvatar}) center/cover;box-shadow:0 0 14px ${session.color}50,0 4px 12px rgba(0,0,0,0.5);position:relative;overflow:visible;">${pulseRing}<div style="position:absolute;top:-4px;right:-4px;width:10px;height:10px;border-radius:50%;background:${session.status === 'tracking' ? '#22c55e' : session.status === 'paused' ? '#f59e0b' : '#ef4444'};border:2px solid rgba(13,18,32,0.9);pointer-events:none;${session.status === 'tracking' ? 'animation:tmap-tl-ring 1.5s infinite;' : ''}"></div><div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);min-width:14px;height:12px;border-radius:6px;background:${session.color};border:1.5px solid rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;padding:0 3px;pointer-events:none"><span style="font-size:6px;font-weight:900;color:#fff;line-height:1">${session.sourceType === 'gps' ? '📡' : '📍'}</span></div></div>${liveTrackShowLabels ? `<div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:4px;white-space:nowrap;pointer-events:none;text-align:center"><div style="font-size:8px;font-weight:800;color:${session.color};text-shadow:0 1px 4px rgba(0,0,0,0.9)">${session.personName} ${session.personLastName}</div><div style="font-size:7px;font-weight:600;color:${session.status === 'tracking' ? '#22c55e' : session.status === 'paused' ? '#f59e0b' : '#ef4444'};text-shadow:0 1px 4px rgba(0,0,0,0.9)">${session.speed} km/h · ${session.heading}</div></div>` : ''}`;

            const marker = new ml.Marker({ element: wrapper, anchor: 'center' }).setLngLat([last.lng, last.lat]).addTo(map);

            // Click → popup
            wrapper.addEventListener('click', (ev: Event) => {
                ev.stopPropagation();
                const addr = mockAddress(last.lat, last.lng);
                const dur = session.positions.length > 1 ? Math.round((Date.now() - session.positions[0].ts) / 1000) : 0;
                const durStr = dur >= 3600 ? `${Math.floor(dur / 3600)}h ${Math.floor((dur % 3600) / 60)}m` : dur >= 60 ? `${Math.floor(dur / 60)}m ${dur % 60}s` : `${dur}s`;
                const distStr = session.distance >= 1000 ? `${(session.distance / 1000).toFixed(2)} km` : `${Math.round(session.distance)} m`;
                const batColor = session.battery > 60 ? '#22c55e' : session.battery > 20 ? '#f59e0b' : '#ef4444';
                const sigColor = session.signal > 70 ? '#22c55e' : session.signal > 30 ? '#f59e0b' : '#ef4444';
                const statColor = session.status === 'tracking' ? '#22c55e' : session.status === 'paused' ? '#f59e0b' : '#ef4444';
                new ml.Popup({ offset: 20, maxWidth: '300px', className: 'tmap-popup' }).setLngLat([last.lng, last.lat]).setHTML(`<div class="tmap-popup-card">
                    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--ax-border)">
                        <div style="width:40px;height:40px;border-radius:50%;border:3px solid ${session.color};background:url(${session.personAvatar}) center/cover;flex-shrink:0"></div>
                        <div style="flex:1;min-width:0">
                            <div style="font-size:12px;font-weight:700;color:var(--ax-text)"><a href="/persons/${session.personId}" style="color:var(--ax-accent);text-decoration:none">${session.personName} ${session.personLastName}</a></div>
                            <div style="font-size:9px;color:var(--ax-text-dim)">aka ${session.personNickname} · ${session.sourceType === 'gps' ? '📡 GPS' : '📍 Phone'}</div>
                            <div style="display:flex;gap:4px;margin-top:2px">
                                <span style="font-size:7px;font-weight:700;padding:1px 5px;border-radius:3px;background:${statColor}15;color:${statColor};border:1px solid ${statColor}30"><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${statColor};margin-right:2px;vertical-align:middle"></span>${session.status.toUpperCase()}</span>
                                <span style="font-size:7px;font-weight:700;padding:1px 5px;border-radius:3px;background:${session.color}15;color:${session.color};border:1px solid ${session.color}30">LIVE</span>
                            </div>
                        </div>
                    </div>
                    <div class="tmap-popup-grid">
                        <div class="tmap-popup-row"><span class="tmap-popup-label">📍 Address</span><span class="tmap-popup-val">${addr}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🏎️ Speed</span><span class="tmap-popup-val" style="font-weight:700;color:${session.speed > 80 ? '#ef4444' : session.speed > 40 ? '#f59e0b' : 'var(--ax-text)'}">${session.speed} km/h ${session.heading}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">📐 Distance</span><span class="tmap-popup-val">${distStr}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">⏱️ Duration</span><span class="tmap-popup-val">${durStr}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🎯 Accuracy</span><span class="tmap-popup-val">${session.accuracy}m</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">📶 Signal</span><span class="tmap-popup-val" style="color:${sigColor};font-weight:700">${session.signal}%</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🔋 Battery</span><span class="tmap-popup-val" style="color:${batColor};font-weight:700">${session.battery}%</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">📊 Points</span><span class="tmap-popup-val">${session.positions.length} positions logged</span></div>
                    </div>
                    <div class="tmap-popup-coords">${last.lat.toFixed(5)}, ${last.lng.toFixed(5)}</div>
                </div>`).addTo(map);
            });

            liveTrackMarkersRef.current.push(marker);
        });

        return () => {
            liveTrackMarkersRef.current.forEach(m => m.remove());
            liveTrackMarkersRef.current = [];
            // Clean up trail sources/layers
            liveTrackSessions.forEach(session => {
                try { if (map.getLayer(`lt-trail-${session.id}-line`)) map.removeLayer(`lt-trail-${session.id}-line`); if (map.getSource(`lt-trail-${session.id}`)) map.removeSource(`lt-trail-${session.id}`); } catch {}
                try { if (map.getLayer(`lt-radius-${session.id}-fill`)) map.removeLayer(`lt-radius-${session.id}-fill`); if (map.getLayer(`lt-radius-${session.id}-stroke`)) map.removeLayer(`lt-radius-${session.id}-stroke`); if (map.getSource(`lt-radius-${session.id}`)) map.removeSource(`lt-radius-${session.id}`); } catch {}
            });
        };
    }, [liveTrackSessions, liveTrackShowTrails, liveTrackShowLabels, liveTrackShowRadius, loaded]);
    const [liveFeedRunning, setLiveFeedRunning] = useState(true);
    const [liveFeedEvents, setLiveFeedEvents] = useState<any[]>([]);
    const [liveFeedFilter, setLiveFeedFilter] = useState<Set<string>>(new Set(['lpr', 'face', 'zone', 'source', 'alert']));
    const [liveFeedPinned, setLiveFeedPinned] = useState<Set<string>>(new Set());
    const [liveFeedMuted, setLiveFeedMuted] = useState(false);
    const liveFeedIdRef = useRef(0);

    // ═══ WORKSPACES ═══
    interface MapWorkspace { id: string; name: string; description: string; createdAt: string; updatedAt: string; thumbnail: string; tags: string[]; isAutoSave: boolean; state: WorkspaceState; }
    interface WorkspaceState { viewport: { center: [number, number]; zoom: number; pitch: number; bearing: number }; dateFrom: string; dateTo: string; selectedPersons: string[]; selectedOrgs: string[]; activeSources: string[]; layerHeatmap: boolean; layerNetwork: boolean; layerLPR: boolean; layerFace: boolean; activeTile: string; active3D: string | null; showZones: boolean; showObjects: boolean; showMinimap: boolean; showCompass: boolean; showControls: boolean; showLabels: boolean; showCoords: boolean; showFps: boolean; showLiveFeed: boolean; showSearch: boolean; showLocalization: boolean; }
    const [workspaces, setWorkspaces] = useState<MapWorkspace[]>([
        { id: 'ws-1', name: 'Morning Surveillance', description: 'Active monitoring of Horvat and Al-Rashid movements with LPR + Face layers', createdAt: '2026-03-23 06:00', updatedAt: '2026-03-23 08:30', thumbnail: '', tags: ['surveillance', 'active', 'priority'], isAutoSave: false, state: { viewport: { center: [15.9775, 45.8131], zoom: 14, pitch: 0, bearing: 0 }, dateFrom: '2026-03-23', dateTo: '2026-03-23', selectedPersons: ['1', '3'], selectedOrgs: [], activeSources: [], layerHeatmap: false, layerNetwork: false, layerLPR: true, layerFace: true, activeTile: 'dark', active3D: null, showZones: true, showObjects: false, showMinimap: true, showCompass: true, showControls: true, showLabels: true, showCoords: true, showFps: false, showLiveFeed: true, showSearch: true, showLocalization: false } },
        { id: 'ws-2', name: 'Zone Perimeter Check', description: 'All zones + heatmap overlay for overnight activity analysis', createdAt: '2026-03-22 22:00', updatedAt: '2026-03-22 23:15', thumbnail: '', tags: ['zones', 'heatmap', 'nightly'], isAutoSave: false, state: { viewport: { center: [15.975, 45.812], zoom: 13, pitch: 0, bearing: 0 }, dateFrom: '2026-03-22', dateTo: '2026-03-23', selectedPersons: [], selectedOrgs: [], activeSources: [], layerHeatmap: true, layerNetwork: false, layerLPR: false, layerFace: false, activeTile: 'dark', active3D: null, showZones: true, showObjects: true, showMinimap: true, showCompass: true, showControls: true, showLabels: false, showCoords: false, showFps: false, showLiveFeed: false, showSearch: true, showLocalization: false } },
        { id: 'ws-3', name: '3D City Overview', description: 'Full 3D buildings mode with network graph for connection analysis', createdAt: '2026-03-21 14:00', updatedAt: '2026-03-21 16:30', thumbnail: '', tags: ['3d', 'network', 'analysis'], isAutoSave: false, state: { viewport: { center: [15.98, 45.813], zoom: 15, pitch: 55, bearing: -20 }, dateFrom: '2026-02-23', dateTo: '2026-03-23', selectedPersons: [], selectedOrgs: [], activeSources: [], layerHeatmap: false, layerNetwork: true, layerLPR: false, layerFace: false, activeTile: 'dark', active3D: '3d-buildings', showZones: false, showObjects: false, showMinimap: true, showCompass: true, showControls: true, showLabels: true, showCoords: true, showFps: true, showLiveFeed: false, showSearch: true, showLocalization: false } },
        { id: 'ws-4', name: 'Operation HAWK', description: 'Full deployment view — all sources, all persons, all layers active', createdAt: '2026-03-20 08:00', updatedAt: '2026-03-23 07:00', thumbnail: '', tags: ['operation', 'full', 'hawk'], isAutoSave: false, state: { viewport: { center: [15.977, 45.813], zoom: 14, pitch: 0, bearing: 0 }, dateFrom: '2026-03-20', dateTo: '2026-03-23', selectedPersons: ['1', '3', '7', '9', '12'], selectedOrgs: ['1', '2'], activeSources: [], layerHeatmap: true, layerNetwork: true, layerLPR: true, layerFace: true, activeTile: 'dark', active3D: null, showZones: true, showObjects: true, showMinimap: true, showCompass: true, showControls: true, showLabels: true, showCoords: true, showFps: false, showLiveFeed: true, showSearch: true, showLocalization: false } },
    ]);
    const [wsSearch, setWsSearch] = useState('');
    const [wsModal, setWsModal] = useState<{ mode: 'save' | 'edit'; ws?: MapWorkspace } | null>(null);
    const [wsForm, setWsForm] = useState({ name: '', description: '', tags: '' });
    const [wsDeleteConfirm, setWsDeleteConfirm] = useState<string | null>(null);
    const [wsActiveId, setWsActiveId] = useState<string | null>(null);

    // ═══ SECTION ORDER (drag & drop) ═══
    const defaultSectionOrder = ['period', 'subjects', 'sources', 'layers', 'tiles', 'tools', 'intelligence', 'objects', 'places', 'workspaces', 'settings'] as const;
    type SectionId = typeof defaultSectionOrder[number];
    const [sectionOrder, setSectionOrder] = useState<SectionId[]>(() => {
        try { const saved = localStorage.getItem('argux_section_order'); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length === defaultSectionOrder.length) return parsed; } } catch {} return [...defaultSectionOrder];
    });
    const [dragSectionId, setDragSectionId] = useState<SectionId | null>(null);
    const [dragOverId, setDragOverId] = useState<SectionId | null>(null);
    const [sectionReorderMode, setSectionReorderMode] = useState(false);

    const handleSectionDragStart = (id: SectionId) => { setDragSectionId(id); };
    const handleSectionDragOver = (e: React.DragEvent, id: SectionId) => { e.preventDefault(); if (dragSectionId && id !== dragSectionId) setDragOverId(id); };
    const handleSectionDrop = (id: SectionId) => {
        if (!dragSectionId || dragSectionId === id) { setDragSectionId(null); setDragOverId(null); return; }
        setSectionOrder(prev => {
            const newOrder = [...prev];
            const fromIdx = newOrder.indexOf(dragSectionId);
            const toIdx = newOrder.indexOf(id);
            if (fromIdx === -1 || toIdx === -1) return prev;
            newOrder.splice(fromIdx, 1);
            newOrder.splice(toIdx, 0, dragSectionId);
            try { localStorage.setItem('argux_section_order', JSON.stringify(newOrder)); } catch {}
            return newOrder;
        });
        setDragSectionId(null); setDragOverId(null);
    };
    const handleSectionDragEnd = () => { setDragSectionId(null); setDragOverId(null); };
    const resetSectionOrder = () => { const o = [...defaultSectionOrder]; setSectionOrder(o); try { localStorage.setItem('argux_section_order', JSON.stringify(o)); } catch {} };
    const dragHandleEl = (id: SectionId) => sectionReorderMode ? <div draggable onDragStart={() => handleSectionDragStart(id)} onDragEnd={handleSectionDragEnd} onClick={e => e.stopPropagation()} style={{ cursor: 'grab', padding: '2px 4px 2px 0', display: 'flex', alignItems: 'center', color: theme.textDim, flexShrink: 0 }} title="Drag to reorder"><svg width="8" height="10" viewBox="0 0 8 12" fill="currentColor"><circle cx="2" cy="2" r="1"/><circle cx="6" cy="2" r="1"/><circle cx="2" cy="6" r="1"/><circle cx="6" cy="6" r="1"/><circle cx="2" cy="10" r="1"/><circle cx="6" cy="10" r="1"/></svg></div> : undefined;

    const captureWorkspaceState = (): WorkspaceState => {
        const map = mapRef.current;
        const c = map ? map.getCenter() : { lng: 15.977, lat: 45.813 };
        return {
            viewport: { center: [c.lng, c.lat], zoom: map?.getZoom() || 13, pitch: map?.getPitch() || 0, bearing: map?.getBearing() || 0 },
            dateFrom, dateTo, selectedPersons, selectedOrgs,
            activeSources: Array.from(activeSources),
            layerHeatmap, layerNetwork, layerLPR, layerFace,
            activeTile, active3D: active3D || null,
            showZones, showObjects, showMinimap, showCompass, showControls, showLabels, showCoords, showFps, showLiveFeed, showSearch, showLocalization,
        };
    };

    const saveWorkspace = () => {
        if (!wsForm.name.trim()) return;
        triggerTopLoader();
        const now = new Date();
        const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (wsModal?.mode === 'edit' && wsModal.ws) {
            setWorkspaces(prev => prev.map(w => w.id === wsModal.ws!.id ? { ...w, name: wsForm.name, description: wsForm.description, tags: wsForm.tags.split(',').map(t => t.trim()).filter(Boolean), updatedAt: ts, state: captureWorkspaceState() } : w));
            setWsActiveId(wsModal.ws.id);
        } else {
            const id = `ws-${Date.now()}`;
            setWorkspaces(prev => [{ id, name: wsForm.name, description: wsForm.description, createdAt: ts, updatedAt: ts, thumbnail: '', tags: wsForm.tags.split(',').map(t => t.trim()).filter(Boolean), isAutoSave: false, state: captureWorkspaceState() }, ...prev]);
            setWsActiveId(id);
        }
        setWsModal(null);
    };

    const loadWorkspace = (ws: MapWorkspace) => {
        triggerTopLoader();
        const s = ws.state;
        setDateFrom(s.dateFrom); setDateTo(s.dateTo);
        setSelectedPersons(s.selectedPersons); setSelectedOrgs(s.selectedOrgs);
        setActiveSources(new Set(s.activeSources as any));
        setLayerHeatmap(s.layerHeatmap); setLayerNetwork(s.layerNetwork); setLayerLPR(s.layerLPR); setLayerFace(s.layerFace);
        setActiveTile(s.activeTile as any); setActive3D(s.active3D as any);
        setShowZones(s.showZones); setShowObjects(s.showObjects); setShowMinimap(s.showMinimap); setShowCompass(s.showCompass); setShowControls(s.showControls); setShowLabels(s.showLabels); setShowCoords(s.showCoords); setShowFps(s.showFps); setShowLiveFeed(s.showLiveFeed); setShowSearch(s.showSearch); setShowLocalization(s.showLocalization);
        setWsActiveId(ws.id);
        // Fly to saved viewport
        const map = mapRef.current;
        if (map) setTimeout(() => { map.flyTo({ center: s.viewport.center, zoom: s.viewport.zoom, pitch: s.viewport.pitch, bearing: s.viewport.bearing, duration: 1200 }); }, 100);
    };

    const deleteWorkspace = (id: string) => { triggerTopLoader(); setWorkspaces(prev => prev.filter(w => w.id !== id)); if (wsActiveId === id) setWsActiveId(null); setWsDeleteConfirm(null); };
    const openSaveWs = () => { triggerTopLoader(); setWsForm({ name: '', description: '', tags: '' }); setWsModal({ mode: 'save' }); };
    const openEditWs = (ws: MapWorkspace) => { triggerTopLoader(); setWsForm({ name: ws.name, description: ws.description, tags: ws.tags.join(', ') }); setWsModal({ mode: 'edit', ws }); };
    const updateWsState = (ws: MapWorkspace) => { triggerTopLoader(); const now = new Date(); const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; setWorkspaces(prev => prev.map(w => w.id === ws.id ? { ...w, state: captureWorkspaceState(), updatedAt: ts } : w)); };
    const liveFeedMarkerRef = useRef<any>(null);
    const liveFeedPopupRef = useRef<any>(null);
    const showLiveFeedMarker = (evt: any) => {
        const map = mapRef.current;
        const ml = (window as any).maplibregl;
        if (!map || !ml) return;
        // Remove previous
        if (liveFeedMarkerRef.current) { liveFeedMarkerRef.current.remove(); liveFeedMarkerRef.current = null; }
        if (liveFeedPopupRef.current) { liveFeedPopupRef.current.remove(); liveFeedPopupRef.current = null; }
        // Create marker
        const sevColor = evt.sev === 'critical' ? '#ef4444' : evt.sev === 'high' ? '#f97316' : evt.sev === 'medium' ? '#f59e0b' : evt.sev === 'low' ? '#6b7280' : '#3b82f6';
        const wrapper = document.createElement('div');
        wrapper.className = 'tmap-marker-source';
        wrapper.style.cssText = 'width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:visible;';
        wrapper.innerHTML = `<div class="tmap-marker-inner" style="width:36px;height:36px;border-radius:50%;border:3px solid ${evt.color};background:rgba(13,18,32,0.92);box-shadow:0 0 16px ${evt.color}60,0 0 30px ${evt.color}20,0 4px 12px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:18px;position:relative;overflow:visible;"><span>${evt.icon}</span><div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${evt.color};opacity:0;pointer-events:none;" class="tmap-tl-pulse"></div><div style="position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:${sevColor};border:2px solid rgba(13,18,32,0.9);pointer-events:none;"></div></div>`;
        const marker = new ml.Marker({ element: wrapper, anchor: 'center' }).setLngLat([evt.lng, evt.lat]).addTo(map);
        liveFeedMarkerRef.current = marker;
        // Create popup
        const addr = mockAddress(evt.lat, evt.lng);
        const popup = new ml.Popup({ offset: 24, maxWidth: '260px', className: 'tmap-popup', closeOnClick: false }).setLngLat([evt.lng, evt.lat]).setHTML(`<div class="tmap-popup-card">
            <div class="tmap-popup-header" style="gap:8px">
                <div style="width:30px;height:30px;border-radius:8px;background:${evt.color}15;border:1.5px solid ${evt.color}40;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">${evt.icon}</div>
                <div class="tmap-popup-hinfo">
                    <div class="tmap-popup-name" style="font-size:11px">${evt.title}</div>
                    <div class="tmap-popup-meta">
                        <span style="font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;background:${sevColor}15;color:${sevColor};border:1px solid ${sevColor}30">${evt.sev.toUpperCase()}</span>
                        <span style="font-size:8px;font-weight:600;padding:1px 5px;border-radius:3px;background:${evt.color}15;color:${evt.color};border:1px solid ${evt.color}30">${evt.type.toUpperCase()}</span>
                        <span style="font-size:7px;font-weight:800;padding:1px 4px;border-radius:2px;background:#ef444420;color:#ef4444;border:1px solid #ef444430">LIVE</span>
                    </div>
                </div>
            </div>
            <div class="tmap-popup-grid">
                <div class="tmap-popup-row"><span class="tmap-popup-label">📍 Address</span><span class="tmap-popup-val">${addr}</span></div>
                ${evt.person ? `<div class="tmap-popup-row"><span class="tmap-popup-label">👤 Person</span><span class="tmap-popup-val" style="color:var(--ax-accent)">${evt.person}</span></div>` : ''}
                ${evt.camera ? `<div class="tmap-popup-row"><span class="tmap-popup-label">📹 Source</span><span class="tmap-popup-val">${evt.camera}</span></div>` : ''}
                <div class="tmap-popup-row"><span class="tmap-popup-label">🕐 Time</span><span class="tmap-popup-val">${evt.ts}</span></div>
            </div>
            <div class="tmap-popup-coords">${evt.lat.toFixed(5)}, ${evt.lng.toFixed(5)}</div>
        </div>`).addTo(map);
        liveFeedPopupRef.current = popup;
        popup.on('close', () => { if (liveFeedMarkerRef.current) { liveFeedMarkerRef.current.remove(); liveFeedMarkerRef.current = null; } liveFeedPopupRef.current = null; });
        // Fly to
        map.flyTo({ center: [evt.lng, evt.lat], zoom: Math.max(map.getZoom(), 16), duration: 600 });
    };

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

    const openAddPlace = () => { triggerTopLoader(); setPlaceForm({ name: '', lat: '', lng: '', zoom: '13', color: '#3b82f6', note: '' }); setPlaceModal({ mode: 'add' }); };
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
    const goToPlace = (p: SavedPlace) => { triggerTopLoader(); mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: p.zoom, duration: 1500, essential: true }); };
    const addCurrentLocation = () => { triggerTopLoader();
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

    const openAddZone = () => { triggerTopLoader(); setZoneForm({ name: '', shape: 'circle', type: 'monitored', color: '#3b82f6', lat: '', lng: '', radius: '500' }); setZoneAddStep('pick'); setZoneModal(null); };
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
    const goToZone = (z: MapZone) => { triggerTopLoader(); mapRef.current?.flyTo({ center: [z.lng, z.lat], zoom: z.radius ? Math.max(13, 16 - Math.log2((z.radius || 500) / 100)) : 14, duration: 1200 }); };
    const startDrawZone = (shape: ZoneShape) => { triggerTopLoader(); setZoneDrawing({ shape, points: [] }); setRulerActive(false); };
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
    const sourcePopupsRef = useRef<any[]>([]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        sourceMarkersRef.current.forEach(m => m.remove());
        sourceMarkersRef.current = [];
        sourcePopupsRef.current.forEach(p => { try { p.remove(); } catch {} });
        sourcePopupsRef.current = [];
        const ml = (window as any).maplibregl;
        if (!ml) return;
        const isMobile = (id: SourceId) => id.startsWith('app-');
        const isCamera = (id: SourceId) => id.startsWith('cam-');
        const videoUrl = 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/rtl_direkt.mp4';
        const audioUrl = 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/audio.mp3';
        const photoUrl = 'https://picsum.photos/800/600?random=742';

        activeSourceMarkers.forEach(sm => {
            const st = sourceTypes.find(s => s.id === sm.sourceId);
            if (!st) return;
            const statusDot = sm.status === 'online' ? '#22c55e' : sm.status === 'degraded' ? '#f59e0b' : '#6b7280';
            const riskColor = sm.risk === 'Critical' ? '#ef4444' : sm.risk === 'High' ? '#f97316' : sm.risk === 'Medium' ? '#f59e0b' : '#6b7280';
            const el = document.createElement('div');
            el.className = 'tmap-marker-source';
            const borderRadius = st.shape === 'circle' ? '50%' : st.shape === 'diamond' ? '4px' : '4px';
            const rotate = st.shape === 'diamond' ? 'transform:rotate(45deg);' : '';
            const innerRotate = st.shape === 'diamond' ? 'transform:rotate(-45deg);' : '';
            const hasPerson = !!sm.personId;
            const hasOrg = !!sm.orgId;
            const hasOwner = hasPerson || hasOrg;
            const sigColor = (sm.signal || 0) > 70 ? '#22c55e' : (sm.signal || 0) > 30 ? '#f59e0b' : '#ef4444';
            const batColor = (sm.battery ?? 100) > 60 ? '#22c55e' : (sm.battery ?? 100) > 20 ? '#f59e0b' : '#ef4444';

            if (isMobile(sm.sourceId) && sm.personAvatar) {
                el.innerHTML = `<div class="tmap-marker-inner" style="width:30px;height:30px;border-radius:50%;border:2.5px solid ${riskColor};background:url(${sm.personAvatar}) center/cover;box-shadow:0 0 10px ${riskColor}40,0 2px 8px rgba(0,0,0,0.5);position:relative;overflow:visible;"><div style="position:absolute;bottom:-3px;right:-3px;min-width:14px;height:12px;border-radius:6px;background:${st.color};border:1.5px solid rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;padding:0 2px;pointer-events:none"><span style="font-size:7px;line-height:1">${st.icon}</span></div><div style="position:absolute;top:-2px;left:-2px;width:8px;height:8px;border-radius:50%;background:${statusDot};border:1.5px solid rgba(13,18,32,0.9);pointer-events:none"></div></div>`;
            } else {
                el.innerHTML = `<div class="tmap-marker-inner" style="width:26px;height:26px;border-radius:${borderRadius};border:2px solid ${st.color};background:rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.5);${rotate}"><span style="font-size:12px;line-height:1;${innerRotate}">${st.icon}</span></div><div class="tmap-marker-status" style="background:${statusDot}"></div>`;
            }
            const lngLat: [number, number] = [sm.lng, sm.lat];
            const marker = new ml.Marker({ element: el, anchor: 'center' }).setLngLat(lngLat).addTo(map);

            el.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                let popupHtml = '';
                const addr = mockAddress(sm.lat, sm.lng);
                const batBar = sm.battery !== undefined ? `<div style="width:100%;height:4px;border-radius:2px;background:${theme.border};overflow:hidden"><div style="width:${sm.battery}%;height:100%;background:${batColor};border-radius:2px"></div></div>` : '';
                const sigBar = sm.signal !== undefined ? `<div style="width:100%;height:4px;border-radius:2px;background:${theme.border};overflow:hidden"><div style="width:${sm.signal}%;height:100%;background:${sigColor};border-radius:2px"></div></div>` : '';
                const phoneIcon = sm.phoneType === 'ios' ? '🍎' : sm.phoneType === 'android' ? '🤖' : '';

                // Owner header (person or org)
                const ownerHeader = hasOwner ? `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--ax-border)"><div class="tmap-src-avatar" style="width:40px;height:40px;border-radius:${hasPerson ? '50%' : '8px'};border:2.5px solid ${riskColor};background:${sm.personAvatar ? `url(${sm.personAvatar}) center/cover` : `rgba(59,130,246,0.15)`};flex-shrink:0;cursor:${sm.personAvatar ? 'zoom-in' : 'default'};display:flex;align-items:center;justify-content:center;font-size:18px" ${sm.personAvatar ? `data-lightbox="${sm.personAvatar}"` : ''}>${!sm.personAvatar ? (hasOrg ? '🏢' : '👤') : ''}</div><div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700;color:var(--ax-text)">${hasPerson ? `<a href="/persons/${sm.personId}" style="color:var(--ax-accent);text-decoration:none">${sm.personName} ${sm.personLastName}</a>` : `<a href="/organizations/${sm.orgId}" style="color:var(--ax-accent);text-decoration:none">${sm.orgName}</a>`}</div>${hasPerson && sm.personNickname ? `<div style="font-size:9px;color:var(--ax-text-dim)">aka <span style="font-weight:600;color:var(--ax-text-sec)">${sm.personNickname}</span></div>` : ''}<div style="display:flex;gap:4px;margin-top:2px"><span style="font-size:7px;font-weight:700;padding:1px 5px;border-radius:3px;background:${riskColor}15;color:${riskColor};border:1px solid ${riskColor}30">${sm.risk || 'Unknown'}</span><span style="font-size:7px;font-weight:600;padding:1px 5px;border-radius:3px;background:${statusDot}15;color:${statusDot};border:1px solid ${statusDot}30"><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${statusDot};margin-right:2px;vertical-align:middle"></span>${sm.status}</span><span style="font-size:7px;font-weight:600;padding:1px 5px;border-radius:3px;background:${st.color}15;color:${st.color};border:1px solid ${st.color}30">${st.label}</span></div></div></div>` : '';

                // Device header (for public cameras — no owner)
                const deviceHeader = !hasOwner ? `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--ax-border)"><div style="width:36px;height:36px;border-radius:8px;background:${st.color}12;border:2px solid ${st.color}30;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${st.icon}</div><div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700;color:var(--ax-text)">${sm.label}</div><div style="display:flex;gap:4px;margin-top:2px"><span style="font-size:7px;font-weight:600;padding:1px 5px;border-radius:3px;background:${statusDot}15;color:${statusDot};border:1px solid ${statusDot}30"><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${statusDot};margin-right:2px;vertical-align:middle"></span>${sm.status}</span><span style="font-size:7px;font-weight:600;padding:1px 5px;border-radius:3px;background:${st.color}15;color:${st.color};border:1px solid ${st.color}30">${st.label}</span></div></div></div>` : '';

                // Info grid (shared)
                const infoRows = [
                    `<div class="tmap-popup-row"><span class="tmap-popup-label">📍 Address</span><span class="tmap-popup-val">${addr}</span></div>`,
                    sm.lastUpdated ? `<div class="tmap-popup-row"><span class="tmap-popup-label">🕐 Updated</span><span class="tmap-popup-val">${sm.lastUpdated}</span></div>` : '',
                    sm.accuracy ? `<div class="tmap-popup-row"><span class="tmap-popup-label">🎯 Accuracy</span><span class="tmap-popup-val">${sm.accuracy}</span></div>` : '',
                    sm.phoneType ? `<div class="tmap-popup-row"><span class="tmap-popup-label">${phoneIcon} Phone</span><span class="tmap-popup-val" style="text-transform:capitalize">${sm.phoneType}</span></div>` : '',
                    sm.signal !== undefined ? `<div class="tmap-popup-row"><span class="tmap-popup-label">📶 Signal</span><span class="tmap-popup-val" style="color:${sigColor};font-weight:700">${sm.signal}%</span></div>` : '',
                    sm.battery !== undefined ? `<div class="tmap-popup-row"><span class="tmap-popup-label">🔋 Battery</span><span class="tmap-popup-val" style="color:${batColor};font-weight:700">${sm.battery}%</span></div>` : '',
                ].filter(Boolean).join('');
                const infoGrid = `<div class="tmap-popup-grid">${infoRows}</div>${sm.battery !== undefined ? `<div style="padding:0 14px 4px">${batBar}</div>` : ''}${sm.signal !== undefined ? `<div style="padding:0 14px 6px">${sigBar}</div>` : ''}`;

                // Video block
                const videoBlock = `<div style="border-bottom:1px solid var(--ax-border);background:#000"><video style="width:100%;height:140px;object-fit:cover;display:block" src="${videoUrl}" preload="metadata" controls controlsList="nodownload" playsinline></video></div>`;
                // Audio block
                const audioBlock = `<div style="padding:8px 14px;border-bottom:1px solid var(--ax-border);background:rgba(245,158,11,0.04)"><div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><span style="font-size:14px">🎙️</span><span style="font-size:10px;font-weight:700;color:var(--ax-text)">Audio Recording</span><span style="font-size:7px;padding:1px 5px;border-radius:3px;background:${sm.status === 'online' ? '#22c55e15' : '#6b728015'};color:${sm.status === 'online' ? '#22c55e' : '#6b7280'};border:1px solid ${sm.status === 'online' ? '#22c55e20' : '#6b728020'};font-weight:700">${sm.status === 'online' ? 'RECORDING' : 'INACTIVE'}</span></div><audio style="width:100%;height:32px" src="${audioUrl}" preload="metadata" controls controlsList="nodownload"></audio></div>`;

                if (sm.sourceId === 'cam-public') {
                    popupHtml = `<div class="tmap-popup-card">${deviceHeader}${videoBlock}${infoGrid}<div style="padding:6px 14px;font-size:9px;color:var(--ax-text-dim);line-height:1.5">${sm.detail}</div><div class="tmap-popup-coords">${sm.lat.toFixed(5)}, ${sm.lng.toFixed(5)}</div></div>`;
                } else if (sm.sourceId === 'cam-hidden' || sm.sourceId === 'cam-private') {
                    popupHtml = `<div class="tmap-popup-card">${ownerHeader}${videoBlock}${infoGrid}<div class="tmap-popup-coords">${sm.lat.toFixed(5)}, ${sm.lng.toFixed(5)}</div></div>`;
                } else if (sm.sourceId === 'gps') {
                    popupHtml = `<div class="tmap-popup-card">${ownerHeader}${infoGrid}<div style="padding:4px 14px 6px;font-size:9px;color:var(--ax-text-dim);line-height:1.5">${sm.detail}</div><div class="tmap-popup-coords">${sm.lat.toFixed(5)}, ${sm.lng.toFixed(5)}</div></div>`;
                } else if (sm.sourceId === 'audio') {
                    popupHtml = `<div class="tmap-popup-card">${ownerHeader}${audioBlock}${infoGrid}<div class="tmap-popup-coords">${sm.lat.toFixed(5)}, ${sm.lng.toFixed(5)}</div></div>`;
                } else if (isMobile(sm.sourceId) && sm.personId) {
                    const mobileHeader = `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--ax-border)"><div class="tmap-src-avatar" style="width:40px;height:40px;border-radius:50%;border:2.5px solid ${riskColor};background:url(${sm.personAvatar || ''}) center/cover;flex-shrink:0;cursor:zoom-in" data-lightbox="${sm.personAvatar || ''}"></div><div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700;color:var(--ax-text)"><a href="/persons/${sm.personId}" style="color:var(--ax-accent);text-decoration:none">${sm.personName} ${sm.personLastName}</a></div><div style="font-size:9px;color:var(--ax-text-dim)">aka <span style="font-weight:600;color:var(--ax-text-sec)">${sm.personNickname}</span></div><div style="display:flex;gap:4px;margin-top:2px"><span style="font-size:7px;font-weight:700;padding:1px 5px;border-radius:3px;background:${riskColor}15;color:${riskColor};border:1px solid ${riskColor}30">${sm.risk}</span><span style="font-size:7px;font-weight:600;padding:1px 5px;border-radius:3px;background:${statusDot}15;color:${statusDot};border:1px solid ${statusDot}30"><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${statusDot};margin-right:2px;vertical-align:middle"></span>${sm.status}</span><span style="font-size:7px;font-weight:600;padding:1px 5px;border-radius:3px;background:${st.color}15;color:${st.color};border:1px solid ${st.color}30">${st.label}</span></div></div></div>`;
                    if (sm.sourceId === 'app-photo') {
                        popupHtml = `<div class="tmap-popup-card">${mobileHeader}<div style="border-bottom:1px solid var(--ax-border)"><img src="${photoUrl}" class="tmap-src-media-photo" style="width:100%;height:120px;object-fit:cover;display:block;cursor:zoom-in" /></div>${infoGrid}<div class="tmap-popup-coords">${sm.lat.toFixed(5)}, ${sm.lng.toFixed(5)}</div></div>`;
                    } else if (sm.sourceId === 'app-video' || sm.sourceId === 'app-camera') {
                        popupHtml = `<div class="tmap-popup-card">${mobileHeader}${videoBlock}${infoGrid}<div class="tmap-popup-coords">${sm.lat.toFixed(5)}, ${sm.lng.toFixed(5)}</div></div>`;
                    } else if (sm.sourceId === 'app-audio') {
                        const mobileAudioBlock = `<div style="padding:8px 14px;border-bottom:1px solid var(--ax-border);background:rgba(168,85,247,0.04)"><div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><span style="font-size:14px">🎵</span><span style="font-size:10px;font-weight:700;color:var(--ax-text)">Audio Recording</span><span style="font-size:7px;padding:1px 5px;border-radius:3px;background:#a855f715;color:#a855f7;border:1px solid #a855f720;font-weight:700">${sm.status === 'online' ? 'RECORDING' : 'PAUSED'}</span></div><audio style="width:100%;height:32px" src="${audioUrl}" preload="metadata" controls controlsList="nodownload"></audio></div>`;
                        popupHtml = `<div class="tmap-popup-card">${mobileHeader}${mobileAudioBlock}${infoGrid}<div class="tmap-popup-coords">${sm.lat.toFixed(5)}, ${sm.lng.toFixed(5)}</div></div>`;
                    } else {
                        popupHtml = `<div class="tmap-popup-card">${mobileHeader}${infoGrid}<div class="tmap-popup-coords">${sm.lat.toFixed(5)}, ${sm.lng.toFixed(5)}</div></div>`;
                    }
                } else {
                    popupHtml = `<div class="tmap-popup-card"><div class="tmap-popup-header" style="gap:8px"><span style="font-size:20px">${st.icon}</span><div class="tmap-popup-hinfo"><div class="tmap-popup-name" style="font-size:12px">${sm.label}</div><div class="tmap-popup-meta"><span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px;background:${st.color}15;color:${st.color};border:1px solid ${st.color}30">${st.label}</span><span class="tmap-popup-status"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${statusDot};margin-right:3px"></span>${sm.status}</span></div></div></div><div style="padding:8px 14px;font-size:10px;color:var(--ax-text-dim);line-height:1.5">${sm.detail}</div><div class="tmap-popup-coords">${lngLat[1].toFixed(5)}, ${lngLat[0].toFixed(5)}</div></div>`;
                }
                const popup = new ml.Popup({ offset: 18, maxWidth: '300px', className: 'tmap-popup' }).setLngLat(lngLat).setHTML(popupHtml).addTo(map);
                sourcePopupsRef.current.push(popup);
                setTimeout(() => {
                    const pel = popup.getElement();
                    pel?.querySelectorAll('.tmap-src-avatar[data-lightbox]').forEach((img: any) => { img.addEventListener('click', (pe: Event) => { pe.stopPropagation(); const url = img.getAttribute('data-lightbox'); if (url) setTlLightbox(url); }); });
                    pel?.querySelectorAll('.tmap-src-media-photo').forEach((img: any) => { img.addEventListener('click', (pe: Event) => { pe.stopPropagation(); setTlLightbox(photoUrl); }); });
                }, 50);
            });

            // Right-click → context menu
            el.addEventListener('contextmenu', (ev: Event) => {
                ev.preventDefault(); ev.stopPropagation();
                const me = ev as MouseEvent;
                const rect = mapContainer.current?.getBoundingClientRect();
                if (!rect) return;
                const x = me.clientX - rect.left;
                const y = me.clientY - rect.top;
                if (sm.sourceId === 'cam-public') {
                    setTlMarkerCtx({ x, y, ev: { id: sm.id, type: 'source', icon: st.icon, title: sm.label, sub: st.label, ts: sm.lastUpdated || '', lat: sm.lat, lng: sm.lng, sev: 'info', color: st.color, cameraId: sm.deviceId } });
                } else if (hasPerson) {
                    setTlMarkerCtx({ x, y, ev: { id: sm.id, type: 'face', icon: st.icon, title: `${sm.personName} ${sm.personLastName}`, sub: st.label, ts: sm.lastUpdated || '', lat: sm.lat, lng: sm.lng, sev: sm.risk === 'Critical' ? 'critical' : 'high', color: st.color, personId: sm.personId, personName: `${sm.personName} ${sm.personLastName}`, cameraId: sm.deviceId } });
                } else if (hasOrg) {
                    setTlMarkerCtx({ x, y, ev: { id: sm.id, type: 'lpr', icon: st.icon, title: sm.orgName || sm.label, sub: st.label, ts: sm.lastUpdated || '', lat: sm.lat, lng: sm.lng, sev: sm.risk === 'Critical' ? 'critical' : 'high', color: st.color, orgId: sm.orgId, orgName: sm.orgName, cameraId: sm.deviceId } });
                } else {
                    setTlMarkerCtx({ x, y, ev: { id: sm.id, type: 'source', icon: st.icon, title: sm.label, sub: st.label, ts: '', lat: sm.lat, lng: sm.lng, sev: 'info', color: st.color, cameraId: sm.deviceId } });
                }
            });
            sourceMarkersRef.current.push(marker);
        });
        return () => { sourceMarkersRef.current.forEach(m => m.remove()); sourceMarkersRef.current = []; sourcePopupsRef.current.forEach(p => { try { p.remove(); } catch {} }); sourcePopupsRef.current = []; };
    }, [activeSources, hiddenSources, loaded]);

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
                const visibleNodes = netNodes.filter(n => {
                    if (n.type === 'person' && !networkShowPersons) return false;
                    if (n.type === 'org' && !networkShowOrgs) return false;
                    if (n.type === 'device' && !networkShowDevices) return false;
                    if (netSearch.trim()) { const q = netSearch.toLowerCase(); if (!n.label.toLowerCase().includes(q) && !n.id.toLowerCase().includes(q)) return false; }
                    return true;
                });
                const visibleIds = new Set(visibleNodes.map(n => n.id));
                const visibleEdges = netFilteredEdges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));

                // Determine which nodes/edges are highlighted (isolated edge or focused node)
                const isoEdge = netIsolatedEdge ? visibleEdges.find(e => edgeKey(e) === netIsolatedEdge) : null;
                const focusConns = netFocusNode ? visibleEdges.filter(e => e.from === netFocusNode || e.to === netFocusNode) : null;
                const highlightedNodeIds = new Set<string>();
                if (isoEdge) { highlightedNodeIds.add(isoEdge.from); highlightedNodeIds.add(isoEdge.to); }
                if (focusConns) { highlightedNodeIds.add(netFocusNode!); focusConns.forEach(e => { highlightedNodeIds.add(e.from); highlightedNodeIds.add(e.to); }); }
                const hasHighlight = isoEdge || focusConns;

                const edgeFeatures = visibleEdges.map(e => {
                    const from = netNodes.find(n => n.id === e.from)!;
                    const to = netNodes.find(n => n.id === e.to)!;
                    let opacity = 0.3 + e.strength * 0.5;
                    let width = 1 + e.strength * 3;
                    if (hasHighlight) {
                        const isHighlighted = isoEdge ? edgeKey(e) === netIsolatedEdge : focusConns!.some(fc => edgeKey(fc) === edgeKey(e));
                        opacity = isHighlighted ? 0.9 : 0.06;
                        width = isHighlighted ? 2 + e.strength * 4 : 1;
                    }
                    return { type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates: [[from.lng, from.lat], [to.lng, to.lat]] }, properties: { color: edgeColors[e.type] || '#6b7280', width, type: e.type, opacity, edgeId: edgeKey(e), from: e.from, to: e.to, strength: e.strength } };
                });
                const geojson: any = { type: 'FeatureCollection', features: edgeFeatures };
                if (map.getSource('network-source')) {
                    (map.getSource('network-source') as any).setData(geojson);
                } else {
                    map.addSource('network-source', { type: 'geojson', data: geojson });
                    map.addLayer({ id: 'network-lines', type: 'line', source: 'network-source', paint: { 'line-color': ['get', 'color'], 'line-width': ['get', 'width'], 'line-opacity': ['get', 'opacity'], 'line-dasharray': [3, 2] } });
                    // Click on line to isolate
                    map.on('click', 'network-lines', (ev: any) => {
                        if (ev.features && ev.features.length > 0) {
                            const eid = ev.features[0].properties.edgeId;
                            setNetIsolatedEdge(prev => prev === eid ? null : eid);
                            setNetFocusNode(null);
                        }
                    });
                    map.on('mouseenter', 'network-lines', () => { map.getCanvas().style.cursor = 'pointer'; });
                    map.on('mouseleave', 'network-lines', () => { map.getCanvas().style.cursor = ''; });
                }
                // Node markers
                const ml = (window as any).maplibregl;
                if (ml) {
                    visibleNodes.forEach(n => {
                        const isHighlighted = !hasHighlight || highlightedNodeIds.has(n.id);
                        const isFocused = netFocusNode === n.id;
                        const conns = visibleEdges.filter(e => e.from === n.id || e.to === n.id);
                        const connCount = conns.length;
                        const icon = n.type === 'person' ? '👤' : n.type === 'org' ? '🏢' : '📡';
                        const shape = n.type === 'org' ? 'border-radius:5px' : 'border-radius:50%';
                        const size = isFocused ? 28 : 22;
                        const wrapper = document.createElement('div');
                        wrapper.className = 'tmap-marker-source';
                        wrapper.style.cssText = `opacity:${isHighlighted ? 1 : 0.15};transition:opacity 0.3s;cursor:pointer;`;
                        wrapper.innerHTML = `<div class="tmap-marker-inner" style="width:${size}px;height:${size}px;${shape};border:${isFocused ? 3 : 2}px solid ${n.color};background:rgba(13,18,32,0.92);display:flex;align-items:center;justify-content:center;box-shadow:${isFocused ? `0 0 14px ${n.color}60,` : ''}0 2px 8px rgba(0,0,0,0.5);font-size:${isFocused ? 14 : 11}px;position:relative;overflow:visible;">${icon}${connCount > 0 ? `<div style="position:absolute;top:-4px;right:-4px;min-width:12px;height:12px;border-radius:6px;background:${n.color};border:1.5px solid rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;padding:0 2px"><span style="font-size:6px;font-weight:900;color:#fff;line-height:1">${connCount}</span></div>` : ''}</div>${netShowLabels ? `<div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:2px;font-size:7px;font-weight:700;color:${isHighlighted ? n.color : theme.textDim};white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,0.8);pointer-events:none">${n.label}</div>` : ''}`;
                        const marker = new ml.Marker({ element: wrapper, anchor: 'center' }).setLngLat([n.lng, n.lat]).addTo(map);

                        // Click → popup with connections
                        wrapper.addEventListener('click', (ev: Event) => {
                            ev.stopPropagation();
                            const connDetails = conns.map(e => {
                                const other = netNodes.find(nn => nn.id === (e.from === n.id ? e.to : e.from));
                                const otherIcon = other?.type === 'person' ? '👤' : other?.type === 'org' ? '🏢' : '📡';
                                return `<div style="display:flex;align-items:center;gap:5px;padding:3px 0;cursor:pointer" class="tmap-net-conn-row" data-edge="${edgeKey(e)}"><span style="width:8px;height:3px;border-radius:1px;background:${edgeColors[e.type]};flex-shrink:0"></span><span style="font-size:9px">${otherIcon}</span><span style="font-size:10px;color:var(--ax-text);font-weight:600;flex:1">${other?.label || '?'}</span><span style="font-size:7px;padding:1px 4px;border-radius:2px;background:${edgeColors[e.type]}15;color:${edgeColors[e.type]};font-weight:700">${e.type}</span><span style="font-size:7px;color:var(--ax-text-dim);font-family:'JetBrains Mono',monospace">${Math.round(e.strength * 100)}%</span></div>`;
                            }).join('');
                            const strengthAvg = conns.length > 0 ? Math.round(conns.reduce((s, e) => s + e.strength, 0) / conns.length * 100) : 0;
                            const typeBreakdown = Object.entries(edgeColors).map(([t, c]) => { const cnt = conns.filter(e => e.type === t).length; return cnt > 0 ? `<span style="font-size:7px;padding:1px 4px;border-radius:2px;background:${c}12;color:${c};font-weight:700;border:1px solid ${c}20">${t} ${cnt}</span>` : ''; }).filter(Boolean).join(' ');
                            const popup = new ml.Popup({ offset: 16, maxWidth: '260px', className: 'tmap-popup' }).setLngLat([n.lng, n.lat]).setHTML(`<div class="tmap-popup-card">
                                <div class="tmap-popup-header" style="gap:8px">
                                    <div style="width:32px;height:32px;${shape};border:2.5px solid ${n.color};background:rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;box-shadow:0 0 10px ${n.color}30">${icon}</div>
                                    <div class="tmap-popup-hinfo">
                                        <div class="tmap-popup-name" style="font-size:12px">${n.label}</div>
                                        <div style="font-size:9px;color:var(--ax-text-dim)">${n.type.charAt(0).toUpperCase() + n.type.slice(1)} · ${connCount} conn · avg ${strengthAvg}%</div>
                                    </div>
                                </div>
                                <div style="padding:4px 14px 2px;display:flex;gap:3px;flex-wrap:wrap">${typeBreakdown}</div>
                                <div style="padding:4px 14px 2px"><span style="font-size:8px;font-weight:700;color:var(--ax-text-dim);text-transform:uppercase;letter-spacing:0.06em">Connections</span></div>
                                <div style="padding:2px 14px 8px;max-height:140px;overflow-y:auto">${connDetails}</div>
                                <div style="padding:4px 14px 8px;display:flex;gap:4px">
                                    <button class="tmap-net-focus-btn" style="flex:1;padding:4px;border-radius:4px;border:1px solid ${n.color}30;background:${n.color}08;color:${n.color};font-size:8px;font-weight:700;cursor:pointer;font-family:inherit;text-align:center">🔍 Focus</button>
                                    <button class="tmap-net-isolate-btn" style="flex:1;padding:4px;border-radius:4px;border:1px solid var(--ax-border);background:transparent;color:var(--ax-text-dim);font-size:8px;font-weight:700;cursor:pointer;font-family:inherit;text-align:center">🎯 Isolate All</button>
                                </div>
                                <div class="tmap-popup-coords">${n.lat.toFixed(5)}, ${n.lng.toFixed(5)}</div>
                            </div>`).addTo(map);
                            // Wire popup button clicks
                            setTimeout(() => {
                                const pel = popup.getElement();
                                pel?.querySelector('.tmap-net-focus-btn')?.addEventListener('click', (pe: Event) => { pe.stopPropagation(); setNetFocusNode(prev => prev === n.id ? null : n.id); setNetIsolatedEdge(null); popup.remove(); });
                                pel?.querySelector('.tmap-net-isolate-btn')?.addEventListener('click', (pe: Event) => { pe.stopPropagation(); setNetFocusNode(null); setNetIsolatedEdge(null); popup.remove(); });
                                pel?.querySelectorAll('.tmap-net-conn-row').forEach((row: any) => { row.addEventListener('click', (pe: Event) => { pe.stopPropagation(); const eid = row.getAttribute('data-edge'); setNetIsolatedEdge((prev: string | null) => prev === eid ? null : eid); setNetFocusNode(null); popup.remove(); }); });
                            }, 50);
                        });

                        // Right-click → context menu
                        wrapper.addEventListener('contextmenu', (ev: Event) => {
                            ev.preventDefault(); ev.stopPropagation();
                            const me = ev as MouseEvent;
                            const rect = mapContainer.current?.getBoundingClientRect();
                            if (rect) {
                                const personId = n.type === 'person' ? parseInt(n.id.replace('p', '')) : 0;
                                const orgId = n.type === 'org' ? parseInt(n.id.replace('o', '')) : 0;
                                setTlMarkerCtx({ x: me.clientX - rect.left, y: me.clientY - rect.top, ev: { id: n.id, type: n.type === 'person' ? 'face' : n.type === 'org' ? 'zone' : 'source', icon, title: n.label, sub: `${n.type} · ${connCount} connections`, ts: '', lat: n.lat, lng: n.lng, sev: 'info', color: n.color, personId: personId > 0 ? personId : undefined, orgId: orgId > 0 ? orgId : undefined, cameraId: undefined } });
                            }
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
    }, [layerNetwork, networkShowPersons, networkShowOrgs, networkShowDevices, netSearch, netEdgeFilters, netStrengthMin, netIsolatedEdge, netFocusNode, netShowLabels, loaded]);

    // LPR markers on map
    const lprMarkersRef = useRef<any[]>([]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        lprMarkersRef.current.forEach(m => m.remove());
        lprMarkersRef.current = [];
        const ml = (window as any).maplibregl;
        if (!ml || !layerLPR) return;

        let lprFiltered = timelineActive ? mockLPR.filter(l => new Date(l.timestamp.replace(' ', 'T')).getTime() <= tlCursorMs) : mockLPR;
        if (lprSelected.size > 0) lprFiltered = lprFiltered.filter(l => lprSelected.has(l.id));
        lprFiltered = lprFiltered.filter(l => !lprHidden.has(l.id));
        if (lprSearch.trim()) { const q = lprSearch.toLowerCase(); lprFiltered = lprFiltered.filter(l => l.plate.toLowerCase().includes(q) || l.personName.toLowerCase().includes(q) || l.cameraName.toLowerCase().includes(q) || (l.orgName || '').toLowerCase().includes(q)); }

        const platePhoto = 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/registration_plate.jpg';
        const ownerPhoto = 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg';
        const lprLineFeats: any[] = [];
        lprFiltered.forEach(lpr => {
            const v = mockVehicles.find(vv => vv.id === lpr.vehicleId);
            const riskColor = lpr.personId === 0 ? '#6b7280' : (mockPersons.find(p => p.id === lpr.personId)?.risk === 'Critical' ? '#ef4444' : '#f97316');
            const confColor = lpr.confidence >= 95 ? '#22c55e' : lpr.confidence >= 85 ? '#f59e0b' : '#ef4444';
            const wrapper = document.createElement('div');
            wrapper.className = 'tmap-marker-source';
            wrapper.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:visible;';
            const inner = document.createElement('div');
            inner.className = 'tmap-marker-inner tmap-tl-event-dot';
            inner.style.cssText = `width:30px;height:22px;border-radius:4px;border:2.5px solid #10b981;background:url(${platePhoto}) center/cover;box-shadow:0 0 10px #10b98140,0 2px 8px rgba(0,0,0,0.5);position:relative;overflow:visible;`;
            const badge = document.createElement('div');
            badge.style.cssText = `position:absolute;bottom:-4px;right:-4px;min-width:16px;height:12px;border-radius:6px;background:${confColor};border:1.5px solid rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;padding:0 2px;pointer-events:none;`;
            badge.innerHTML = `<span style="font-size:6px;font-weight:900;color:#fff;line-height:1">${Math.round(lpr.confidence)}%</span>`;
            inner.appendChild(badge);
            const sevDot = document.createElement('div');
            sevDot.style.cssText = `position:absolute;top:-2px;left:-2px;width:8px;height:8px;border-radius:50%;background:${riskColor};border:1.5px solid rgba(13,18,32,0.9);pointer-events:none;`;
            inner.appendChild(sevDot);
            wrapper.appendChild(inner);
            const marker = new ml.Marker({ element: wrapper, anchor: 'center' }).setLngLat([lpr.lng, lpr.lat]).addTo(map);

            wrapper.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                const addr = mockAddress(lpr.lat, lpr.lng);
                const ago = timeAgo(lpr.timestamp);
                const occ = mockLPR.filter(l => l.plate === lpr.plate).length;
                const popup = new ml.Popup({ offset: 16, maxWidth: '300px', className: 'tmap-popup' }).setLngLat([lpr.lng, lpr.lat]).setHTML(`<div class="tmap-popup-card">
                    <div style="position:relative;border-bottom:1px solid var(--ax-border)">
                        <img src="${platePhoto}" class="tmap-lpr-plate-photo" style="width:100%;height:80px;object-fit:cover;display:block;cursor:zoom-in;" />
                        <div style="position:absolute;bottom:6px;left:8px;font-size:16px;font-weight:800;font-family:'JetBrains Mono',monospace;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.8);letter-spacing:0.06em">${lpr.plate}</div>
                        <div style="position:absolute;top:6px;right:6px;display:flex;gap:3px">
                            <span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.6);color:${confColor};backdrop-filter:blur(4px)">${lpr.confidence}%</span>
                            <span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.6);color:#10b981;backdrop-filter:blur(4px)">LPR</span>
                        </div>
                    </div>
                    <div class="tmap-popup-header" style="gap:8px">
                        <div class="tmap-lpr-owner-photo" style="width:36px;height:36px;border-radius:50%;border:2.5px solid ${riskColor};background:url(${ownerPhoto}) center/cover;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;cursor:zoom-in" data-lightbox="${ownerPhoto}"></div>
                        <div class="tmap-popup-hinfo">
                            <div class="tmap-popup-name" style="font-size:12px;font-family:'JetBrains Mono',monospace;letter-spacing:0.04em">${lpr.plate}</div>
                            <div style="font-size:10px;color:var(--ax-text-sec);margin-top:1px">${lpr.personId > 0 ? `<a href="/persons/${lpr.personId}" style="color:var(--ax-accent);text-decoration:none">${lpr.personName}</a>` : lpr.personName}${lpr.orgName ? ` · <a href="/organizations/${lpr.orgId}" style="color:var(--ax-accent);text-decoration:none">${lpr.orgName}</a>` : ''}</div>
                        </div>
                    </div>
                    <div class="tmap-popup-grid">
                        <div class="tmap-popup-row"><span class="tmap-popup-label">📍 Address</span><span class="tmap-popup-val">${addr}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🕐 Time</span><span class="tmap-popup-val">${lpr.timestamp} <span style="color:var(--ax-text-dim);font-size:9px">(${ago})</span></span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🎯 Confidence</span><span class="tmap-popup-val" style="color:${confColor};font-weight:700">${lpr.confidence}%</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">⚠️ Risk</span><span class="tmap-popup-val" style="color:${riskColor};font-weight:600">${v?.risk || 'Unknown'}</span></div>
                        ${occ > 1 ? `<div class="tmap-popup-row"><span class="tmap-popup-label">📊 Occurrences</span><span class="tmap-popup-val">${occ} sightings</span></div>` : ''}
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🧭 Speed</span><span class="tmap-popup-val">${lpr.direction} at ${lpr.speed} km/h</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🚙 Vehicle</span><span class="tmap-popup-val">${v ? `${v.type} · ${v.make} ${v.model} · ${v.color}` : '—'}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">📹 Camera</span><span class="tmap-popup-val"><a href="/devices/${lpr.cameraId}" style="color:var(--ax-accent);text-decoration:none">${lpr.cameraName}</a></span></div>
                    </div>
                    ${v ? `<div style="padding:4px 14px 8px;display:flex;gap:6px"><a href="/vehicles/${v.id}" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px;border-radius:5px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);color:#10b981;font-size:9px;font-weight:700;text-decoration:none;font-family:inherit">🚗 Vehicle Details</a>${lpr.personId > 0 ? `<a href="/persons/${lpr.personId}" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px;border-radius:5px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);color:var(--ax-accent);font-size:9px;font-weight:700;text-decoration:none;font-family:inherit">👤 Person</a>` : ''}</div>` : ''}
                    <div class="tmap-popup-coords">${lpr.lat.toFixed(5)}, ${lpr.lng.toFixed(5)}</div>
                </div>`).addTo(map);
                setTimeout(() => {
                    const el = popup.getElement();
                    el?.querySelectorAll('.tmap-lpr-plate-photo').forEach((img: any) => { img.addEventListener('click', (pe: Event) => { pe.stopPropagation(); setTlLightbox(platePhoto); }); });
                    el?.querySelectorAll('.tmap-lpr-owner-photo').forEach((img: any) => { img.addEventListener('click', (pe: Event) => { pe.stopPropagation(); setTlLightbox(img.getAttribute('data-lightbox')); }); });
                }, 50);
            });

            wrapper.addEventListener('contextmenu', (e: Event) => {
                e.preventDefault(); e.stopPropagation();
                const me = e as MouseEvent;
                const rect = mapContainer.current?.getBoundingClientRect();
                if (rect) setTlMarkerCtx({ x: me.clientX - rect.left, y: me.clientY - rect.top, ev: { id: lpr.id, type: 'lpr', icon: '🚗', title: `LPR: ${lpr.plate}`, sub: lpr.cameraName, ts: lpr.timestamp, lat: lpr.lat, lng: lpr.lng, sev: lpr.confidence >= 95 ? 'high' : 'medium', color: '#10b981', personId: lpr.personId, personName: lpr.personName, orgId: lpr.orgId, orgName: lpr.orgName, photoUrl: platePhoto, cameraId: lpr.cameraId, cameraName: lpr.cameraName, vehicleId: lpr.vehicleId, plate: lpr.plate } });
            });

            lprMarkersRef.current.push(marker);
            const samePlate = lprFiltered.filter(l => l.plate === lpr.plate);
            const idx = samePlate.indexOf(lpr);
            if (idx < samePlate.length - 1) {
                const next = samePlate[idx + 1];
                lprLineFeats.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[lpr.lng, lpr.lat], [next.lng, next.lat]] }, properties: { color: '#10b981', width: 2 } });
            }
        });
        const geojson: any = { type: 'FeatureCollection', features: lprLineFeats };
        try {
            if (map.getSource('lpr-routes')) { (map.getSource('lpr-routes') as any).setData(geojson); }
            else { map.addSource('lpr-routes', { type: 'geojson', data: geojson }); map.addLayer({ id: 'lpr-routes-line', type: 'line', source: 'lpr-routes', paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': 0.5, 'line-dasharray': [4, 3] } }); }
        } catch {}
        return () => { lprMarkersRef.current.forEach(m => m.remove()); lprMarkersRef.current = []; try { if (map.getLayer('lpr-routes-line')) map.removeLayer('lpr-routes-line'); if (map.getSource('lpr-routes')) map.removeSource('lpr-routes'); } catch {} };
    }, [layerLPR, loaded, timelineActive, tlCursorMs, lprSelected, lprHidden, lprSearch]);

    // Face Recognition markers on map
    const faceMarkersRef = useRef<any[]>([]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        faceMarkersRef.current.forEach(m => m.remove());
        faceMarkersRef.current = [];
        const ml = (window as any).maplibregl;
        if (!ml || !layerFace) return;
        let faceFiltered = timelineActive ? mockFaces.filter(f => new Date(f.timestamp.replace(' ', 'T')).getTime() <= tlCursorMs) : mockFaces;
        // Apply selection filter (empty = show all)
        if (faceSelected.size > 0) faceFiltered = faceFiltered.filter(f => faceSelected.has(f.id));
        // Apply hidden filter
        faceFiltered = faceFiltered.filter(f => !faceHidden.has(f.id));
        // Apply search
        if (faceSearch.trim()) { const q = faceSearch.toLowerCase(); faceFiltered = faceFiltered.filter(f => f.personName.toLowerCase().includes(q) || f.cameraName.toLowerCase().includes(q)); }

        faceFiltered.forEach(fr => {
            const confColor = fr.confidence >= 90 ? '#22c55e' : fr.confidence >= 75 ? '#f59e0b' : fr.personId === 0 ? '#ef4444' : '#6b7280';
            const riskColor = fr.risk === 'Critical' ? '#ef4444' : fr.risk === 'High' ? '#f97316' : fr.risk === 'Medium' ? '#f59e0b' : '#6b7280';
            const capturePhoto = 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg';
            const wrapper = document.createElement('div');
            wrapper.className = 'tmap-marker-source';
            wrapper.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:visible;';
            const inner = document.createElement('div');
            inner.className = 'tmap-marker-inner tmap-tl-event-dot';
            inner.style.cssText = `width:30px;height:30px;border-radius:50%;border:2.5px solid ${riskColor};background:url(${capturePhoto}) center/cover;box-shadow:0 0 10px ${riskColor}40,0 2px 8px rgba(0,0,0,0.5);position:relative;overflow:visible;`;
            // Confidence badge
            const badge = document.createElement('div');
            badge.style.cssText = `position:absolute;bottom:-3px;right:-3px;min-width:16px;height:12px;border-radius:6px;background:${confColor};border:1.5px solid rgba(13,18,32,0.9);display:flex;align-items:center;justify-content:center;padding:0 2px;pointer-events:none;`;
            badge.innerHTML = `<span style="font-size:6px;font-weight:900;color:#fff;line-height:1">${fr.confidence > 0 ? Math.round(fr.confidence) : '?'}%</span>`;
            inner.appendChild(badge);
            // Risk dot
            const sevDot = document.createElement('div');
            sevDot.style.cssText = `position:absolute;top:-2px;left:-2px;width:8px;height:8px;border-radius:50%;background:${riskColor};border:1.5px solid rgba(13,18,32,0.9);pointer-events:none;`;
            inner.appendChild(sevDot);
            wrapper.appendChild(inner);
            const marker = new ml.Marker({ element: wrapper, anchor: 'center' }).setLngLat([fr.lng, fr.lat]).addTo(map);

            // Click → rich popup with photo + lightbox
            wrapper.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                const addr = mockAddress(fr.lat, fr.lng);
                const ago = timeAgo(fr.timestamp);
                const occ = mockFaces.filter(f => f.personId === fr.personId && fr.personId > 0).length;
                const popup = new ml.Popup({ offset: 18, maxWidth: '300px', className: 'tmap-popup' }).setLngLat([fr.lng, fr.lat]).setHTML(`<div class="tmap-popup-card">
                    <div style="position:relative;border-bottom:1px solid var(--ax-border)">
                        <img src="${capturePhoto}" class="tmap-fr-photo" style="width:100%;height:100px;object-fit:cover;display:block;cursor:zoom-in;" />
                        <div style="position:absolute;top:6px;right:6px;display:flex;gap:3px">
                            <span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.6);color:${riskColor};backdrop-filter:blur(4px)">${fr.risk}</span>
                            <span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.6);color:${confColor};backdrop-filter:blur(4px)">${fr.confidence}%</span>
                        </div>
                    </div>
                    <div class="tmap-popup-header" style="gap:8px">
                        <div class="tmap-fr-avatar" style="width:36px;height:36px;border-radius:50%;border:2.5px solid ${riskColor};background:${fr.personAvatar ? `url(${fr.personAvatar}) center/cover` : 'rgba(13,18,32,0.9)'};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;cursor:${fr.personAvatar ? 'zoom-in' : 'default'}" ${fr.personAvatar ? `data-lightbox="${fr.personAvatar}"` : ''}>${fr.personAvatar ? '' : '👤'}</div>
                        <div class="tmap-popup-hinfo">
                            <div class="tmap-popup-name" style="font-size:12px">${fr.personId > 0 ? `<a href="/persons/${fr.personId}" style="color:var(--ax-accent);text-decoration:none">${fr.personName}</a>` : fr.personName}</div>
                            <div class="tmap-popup-meta">
                                <span style="font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;background:${riskColor}15;color:${riskColor};border:1px solid ${riskColor}30">${fr.risk}</span>
                                <span style="font-size:8px;font-weight:600;padding:1px 5px;border-radius:3px;background:#ec489915;color:#ec4899;border:1px solid #ec489930">FACE</span>
                            </div>
                        </div>
                    </div>
                    <div class="tmap-popup-grid">
                        <div class="tmap-popup-row"><span class="tmap-popup-label">📍 Address</span><span class="tmap-popup-val">${addr}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🕐 Time</span><span class="tmap-popup-val">${fr.timestamp} <span style="color:var(--ax-text-dim);font-size:9px">(${ago})</span></span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">🎯 Confidence</span><span class="tmap-popup-val" style="color:${confColor};font-weight:700">${fr.confidence}%</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">⚠️ Risk</span><span class="tmap-popup-val" style="color:${riskColor};font-weight:600">${fr.risk}</span></div>
                        ${occ > 1 ? `<div class="tmap-popup-row"><span class="tmap-popup-label">📊 Occurrences</span><span class="tmap-popup-val">${occ} captures in period</span></div>` : ''}
                        <div class="tmap-popup-row"><span class="tmap-popup-label">😐 Emotion</span><span class="tmap-popup-val">${fr.emotion}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">👕 Wearing</span><span class="tmap-popup-val">${fr.wearing}</span></div>
                        <div class="tmap-popup-row"><span class="tmap-popup-label">📹 Camera</span><span class="tmap-popup-val"><a href="/devices/${fr.cameraId}" style="color:var(--ax-accent);text-decoration:none">${fr.cameraName}</a></span></div>
                    </div>
                    <div class="tmap-popup-coords">${fr.lat.toFixed(5)}, ${fr.lng.toFixed(5)}</div>
                </div>`).addTo(map);
                // Wire lightbox clicks
                setTimeout(() => {
                    const el = popup.getElement();
                    el?.querySelectorAll('.tmap-fr-photo').forEach((img: any) => { img.addEventListener('click', (pe: Event) => { pe.stopPropagation(); setTlLightbox(capturePhoto); }); });
                    el?.querySelectorAll('.tmap-fr-avatar[data-lightbox]').forEach((img: any) => { img.addEventListener('click', (pe: Event) => { pe.stopPropagation(); setTlLightbox(img.getAttribute('data-lightbox')); }); });
                }, 50);
            });

            // Right-click → context menu
            wrapper.addEventListener('contextmenu', (e: Event) => {
                e.preventDefault(); e.stopPropagation();
                const me = e as MouseEvent;
                const rect = mapContainer.current?.getBoundingClientRect();
                if (rect) setTlMarkerCtx({ x: me.clientX - rect.left, y: me.clientY - rect.top, ev: { id: fr.id, type: 'face', icon: '🧑‍🦲', title: `Face: ${fr.personName}`, sub: fr.cameraName, ts: fr.timestamp, lat: fr.lat, lng: fr.lng, sev: fr.risk === 'Critical' ? 'critical' : 'high', color: '#ec4899', personId: fr.personId, personName: fr.personName, photoUrl: capturePhoto, cameraId: fr.cameraId, cameraName: fr.cameraName } });
            });

            faceMarkersRef.current.push(marker);
        });
        return () => { faceMarkersRef.current.forEach(m => m.remove()); faceMarkersRef.current = []; };
    }, [layerFace, loaded, timelineActive, tlCursorMs, faceSelected, faceHidden, faceSearch]);

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
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchFocused, setSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

    const searchTimerRef = useRef<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchCategory, setSearchCategory] = useState<'all' | 'entities' | 'places' | 'coords'>('all');

    interface SearchResult { id: string; category: 'person' | 'org' | 'vehicle' | 'device' | 'place' | 'zone' | 'saved' | 'coord' | 'geo'; name: string; sub: string; icon: string; color: string; lat: number; lng: number; zoom: number; risk?: string; avatar?: string; type?: string; }

    // Local entity search (instant, no API call)
    const searchEntities = (q: string): SearchResult[] => {
        const results: SearchResult[] = [];
        const ql = q.toLowerCase();
        // Persons
        mockSourceMarkers.filter(m => m.personId && m.personName).forEach(m => {
            if (results.some(r => r.id === `p-${m.personId}`)) return;
            const name = `${m.personName} ${m.personLastName}`;
            if (name.toLowerCase().includes(ql) || (m.personNickname || '').toLowerCase().includes(ql)) {
                results.push({ id: `p-${m.personId}`, category: 'person', name, sub: `${m.personNickname || ''} · ${m.risk || 'Unknown'} risk`, icon: '👤', color: m.risk === 'Critical' ? '#ef4444' : m.risk === 'High' ? '#f97316' : '#f59e0b', lat: m.lat, lng: m.lng, zoom: 16, risk: m.risk, avatar: m.personAvatar });
            }
        });
        // Organizations
        mockSourceMarkers.filter(m => m.orgId && m.orgName).forEach(m => {
            if (results.some(r => r.id === `o-${m.orgId}`)) return;
            if (m.orgName!.toLowerCase().includes(ql)) {
                results.push({ id: `o-${m.orgId}`, category: 'org', name: m.orgName!, sub: 'Organization', icon: '🏢', color: '#3b82f6', lat: m.lat, lng: m.lng, zoom: 15 });
            }
        });
        // Vehicles (from mock data if available)
        mockLPR.forEach(l => {
            if (results.some(r => r.id === `v-${l.plate}`)) return;
            if (l.plate.toLowerCase().includes(ql) || l.personName.toLowerCase().includes(ql)) {
                const v = mockVehicles.find(vv => vv.id === l.vehicleId);
                results.push({ id: `v-${l.plate}`, category: 'vehicle', name: l.plate, sub: v ? `${v.make} ${v.model} · ${l.personName}` : l.personName, icon: '🚗', color: '#10b981', lat: l.lat, lng: l.lng, zoom: 17 });
            }
        });
        // Devices
        mockSourceMarkers.forEach(m => {
            if (m.label.toLowerCase().includes(ql) || (m.deviceId && String(m.deviceId).includes(ql))) {
                results.push({ id: `d-${m.id}`, category: 'device', name: m.label, sub: `${sourceTypes.find((s: SourceType) => s.id === m.sourceId)?.label || m.sourceId} · ${m.status}`, icon: sourceTypes.find((s: SourceType) => s.id === m.sourceId)?.icon || '📡', color: sourceTypes.find((s: SourceType) => s.id === m.sourceId)?.color || '#22c55e', lat: m.lat, lng: m.lng, zoom: 17 });
            }
        });
        // Saved places
        savedPlaces.forEach(p => {
            if (p.name.toLowerCase().includes(ql) || (p.note || '').toLowerCase().includes(ql)) {
                results.push({ id: `sp-${p.id}`, category: 'saved', name: p.name, sub: p.note || `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`, icon: '⭐', color: p.color, lat: p.lat, lng: p.lng, zoom: p.zoom });
            }
        });
        // Zones
        zones.forEach(z => {
            if (z.name.toLowerCase().includes(ql)) {
                results.push({ id: `z-${z.id}`, category: 'zone', name: z.name, sub: `${zoneTypes.find(t => t.id === z.type)?.label || z.type} · ${z.shape}`, icon: '🛡️', color: z.color, lat: z.lat, lng: z.lng, zoom: 15 });
            }
        });
        return results.slice(0, 8);
    };

    // Coordinate detection: "45.8131, 15.9775" or "45.8131 15.9775"
    const parseCoordinates = (q: string): SearchResult | null => {
        const match = q.match(/^\s*(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)\s*$/);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                return { id: 'coord', category: 'coord', name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, sub: 'Navigate to coordinates', icon: '🎯', color: '#22c55e', lat, lng, zoom: 16 };
            }
        }
        return null;
    };

    // Combined search: instant local + debounced geocoding
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        if (!searchQuery.trim() || searchQuery.trim().length < 2) { setSearchResults([]); setSearchLoading(false); return; }

        const q = searchQuery.trim();

        // Instant: coordinates + local entities
        const instant: SearchResult[] = [];
        const coordResult = parseCoordinates(q);
        if (coordResult) instant.push(coordResult);
        const entityResults = searchEntities(q);
        instant.push(...entityResults);
        setSearchResults(instant);

        // Debounced: geocoding (only if not pure coordinates and category allows)
        if (!coordResult && searchCategory !== 'entities' && searchCategory !== 'coords') {
            setSearchLoading(true);
            searchTimerRef.current = setTimeout(async () => {
                try {
                    const eq = encodeURIComponent(q);
                    const viewbox = mapRef.current ? (() => { const b = mapRef.current.getBounds(); return `&viewbox=${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}`; })() : '';
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${eq}&format=json&addressdetails=1&limit=6&accept-language=en${viewbox}&bounded=0`);
                    if (!res.ok) throw new Error('Search failed');
                    const data = await res.json();
                    const geoResults: SearchResult[] = data.map((r: any) => {
                        const parts: string[] = [];
                        if (r.address?.road) parts.push(r.address.road);
                        if (r.address?.city || r.address?.town || r.address?.village) parts.push(r.address.city || r.address.town || r.address.village);
                        if (r.address?.country) parts.push(r.address.country);
                        const sub = parts.join(', ') || (r.display_name || '').split(',').slice(1, 3).join(',').trim();
                        const t = (r.type || '').toLowerCase();
                        const zoom = ['house', 'building', 'address', 'residential'].includes(t) ? 18 : ['street', 'road'].includes(t) ? 17 : ['neighbourhood', 'suburb', 'park'].includes(t) ? 15 : ['city', 'town'].includes(t) ? 13 : ['state', 'region'].includes(t) ? 9 : ['country'].includes(t) ? 6 : 14;
                        return { id: `geo-${r.place_id}`, category: 'geo' as const, name: r.display_name?.split(',')[0] || 'Unknown', sub, icon: '📍', color: theme.accent, lat: parseFloat(r.lat), lng: parseFloat(r.lon), zoom, type: r.type };
                    });
                    // Merge: keep instant results on top, add geo results
                    setSearchResults(prev => {
                        const localResults = prev.filter(r => r.category !== 'geo');
                        return [...localResults, ...geoResults];
                    });
                } catch {}
                setSearchLoading(false);
            }, 400);
        } else {
            setSearchLoading(false);
        }

        return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
    }, [searchQuery, searchCategory]);

    const handleSearchSelect = (result: SearchResult) => {
        mapRef.current?.flyTo({ center: [result.lng, result.lat], zoom: result.zoom, duration: 1200 });
        triggerTopLoader();
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

    // Live Feed: generate mock events at intervals
    useEffect(() => {
        if (!showLiveFeed || !liveFeedRunning) return;
        const templates = [
            { type: 'lpr', icon: '🚗', titles: ['LPR: ZG-1234-AB detected', 'LPR: SA-9012-RH captured', 'LPR: ZG-5678-CD spotted', 'LPR: EG-4567-FT flagged', 'LPR: CO-MEND-99 tracked'], sev: ['high', 'medium', 'critical', 'high', 'medium'], color: '#10b981', persons: ['Marko Horvat', 'Ahmed Al-Rashid', 'Ivan Babić', 'Omar Hassan', 'Carlos Mendoza'], cameras: ['Ban Jelačić Cam', 'Savska Intersection', 'Maksimir Entrance', 'Dubrava Overpass', 'Črnomerec Junction'] },
            { type: 'face', icon: '🧑‍🦲', titles: ['Face match: Marko Horvat', 'Face match: Ivan Babić', 'Face detected: Unknown', 'Face match: Ahmed Al-Rashid', 'Face match: Ana Kovačević'], sev: ['critical', 'high', 'medium', 'critical', 'high'], color: '#ec4899', persons: ['Marko Horvat', 'Ivan Babić', 'Unknown Subject', 'Ahmed Al-Rashid', 'Ana Kovačević'], cameras: ['OP-HAWK Alpha', 'Maksimir Entrance', 'OP-HAWK Charlie', 'Main Station', 'ASG HQ Interior'] },
            { type: 'zone', icon: '🛡️', titles: ['⚠️ ZONE ENTRY: Horvat → Restricted Alpha', '⚠️ ZONE EXIT: Hassan → Monitored Bravo', '⚠️ ZONE ENTRY: Babić → Diplomatic Quarter', '⚠️ ZONE ENTRY: Mendoza → Port Terminal', '⚠️ ZONE EXIT: Horvat → Safe House'], sev: ['critical', 'high', 'medium', 'critical', 'high'], color: '#f59e0b', persons: ['Marko Horvat', 'Omar Hassan', 'Ivan Babić', 'Carlos Mendoza', 'Marko Horvat'], cameras: ['Zone Engine', 'Zone Engine', 'Zone Engine', 'Zone Engine', 'Zone Engine'] },
            { type: 'source', icon: '📡', titles: ['GPS: Speed alert triggered', 'Camera: Motion detected', 'Audio: Keyword flagged', 'Mobile: Signal lost', 'Sensor: Anomaly detected'], sev: ['high', 'info', 'high', 'critical', 'medium'], color: '#3b82f6', persons: ['Omar Hassan', '', 'Marko Horvat', 'Carlos Mendoza', ''], cameras: ['GPS-004', 'Ban Jelačić Cam', 'MIC-ALPHA', 'APP-LOC', 'Sensor Grid'] },
            { type: 'alert', icon: '🚨', titles: ['ALERT: Co-location detected', 'ALERT: Geofence breach — critical', 'ALERT: Pattern anomaly', 'ALERT: Signal intercept', 'ALERT: Surveillance gap'], sev: ['critical', 'critical', 'high', 'high', 'medium'], color: '#ef4444', persons: ['Horvat + Al-Rashid', 'Omar Hassan', 'Ivan Babić', 'Carlos Mendoza', ''], cameras: [] },
            { type: 'zone', icon: '🚪', titles: ['ZONE EXIT: Hassan → Storage Facility', 'ZONE ENTRY: Mendoza → Savska Perimeter', 'ZONE EXIT: Babić → Checkpoint Zone', 'ZONE ENTRY: Hassan → Port Loading Area', 'ZONE EXIT: Mendoza → Industrial Block'], sev: ['medium', 'high', 'medium', 'critical', 'high'], color: '#f97316', persons: ['Omar Hassan', 'Carlos Mendoza', 'Ivan Babić', 'Omar Hassan', 'Carlos Mendoza'], cameras: ['Zone Engine', 'Zone Engine', 'Zone Engine', 'Zone Engine', 'Zone Engine'] },
        ];
        const interval = setInterval(() => {
            const tpl = templates[Math.floor(Math.random() * templates.length)];
            const idx = Math.floor(Math.random() * tpl.titles.length);
            const id = `lf-${++liveFeedIdRef.current}`;
            const now = new Date();
            const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            const lat = 45.800 + Math.random() * 0.025;
            const lng = 15.955 + Math.random() * 0.05;
            const evt = {
                id, type: tpl.type, icon: tpl.icon, title: tpl.titles[idx], sev: tpl.sev[idx],
                color: tpl.color, person: tpl.persons[idx], camera: tpl.cameras[idx] || '',
                ts, lat, lng, isNew: true,
            };
            setLiveFeedEvents(prev => [evt, ...prev].slice(0, 100));
            // Clear "new" flag after animation
            setTimeout(() => setLiveFeedEvents(prev => prev.map(e => e.id === id ? { ...e, isNew: false } : e)), 2000);
        }, 2500 + Math.random() * 2000);
        return () => clearInterval(interval);
    }, [showLiveFeed, liveFeedRunning]);

    // ═══ KEYBOARD SHORTCUTS ═══
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportStatus, setExportStatus] = useState<{ type: 'idle' | 'exporting' | 'done' | 'error'; msg: string }>({ type: 'idle', msg: '' });
    const [shareUrl, setShareUrl] = useState('');
    const [shareCopied, setShareCopied] = useState(false);
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName;
            const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

            // CTRL+Q — toggle shortcuts overlay
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') { e.preventDefault(); setShowShortcuts(prev => !prev); return; }

            // Escape — close things in priority order
            if (e.key === 'Escape') {
                if (showExportModal) { setShowExportModal(false); return; }
                if (showShortcuts) { setShowShortcuts(false); return; }
                if (tlLightbox) { setTlLightbox(null); return; }
                if (tlMarkerCtx) { setTlMarkerCtx(null); return; }
                if (markerCtxMenu) { setMarkerCtxMenu(null); return; }
                if (mapCtxMenu) { setMapCtxMenu(null); return; }
                if (zoneCtxMenu) { setZoneCtxMenu(null); return; }
                if (objCtxMenu) { setObjCtxMenu(null); return; }
                if (wsModal) { setWsModal(null); return; }
                if (zoneModal) { setZoneModal(null); return; }
                if (placeModal) { setPlaceModal(null); return; }
                if (deleteConfirm) { setDeleteConfirm(null); return; }
                if (zoneDrawing) { setZoneDrawing(null); return; }
                if (objDrawing) { setObjDrawing(null); return; }
                if (rulerActive) { setRulerActive(false); return; }
                if (placingMarker) { setPlacingMarker(false); return; }
                if (timelineOpen) { setTimelineOpen(false); setTimelinePlaying(false); return; }
                if (showLiveTracker) { setShowLiveTracker(false); return; }
                if (showCorrelationPanel) { setShowCorrelationPanel(false); return; }
                if (showAnomalyPanel) { setShowAnomalyPanel(false); return; }
                if (showPredictivePanel) { setShowPredictivePanel(false); return; }
                if (showPatternPanel) { setShowPatternPanel(false); return; }
                if (showIncidentPanel) { setShowIncidentPanel(false); return; }
                if (showHeatCalPanel) { setShowHeatCalPanel(false); return; }
                if (showComparePanel) { setShowComparePanel(false); return; }
                if (showRouteReplay) { setShowRouteReplay(false); setRrPlaying(false); return; }
                if (showObjectsPanel) { setShowObjectsPanel(false); return; }
                if (showRulerPanel) { setShowRulerPanel(false); return; }
                if (showZonePanel) { setShowZonePanel(false); return; }
                if (showPlacesPanel) { setShowPlacesPanel(false); return; }
                if (showWorkspacesPanel) { setShowWorkspacesPanel(false); return; }
                if (activeLayerPanel) { setShowHeatmapPanel(false); setShowNetworkPanel(false); setShowLPRPanel(false); setShowFacePanel(false); return; }
                if (sidebarOpen) { setSidebarOpen(false); return; }
            }

            // Skip all other shortcuts when typing in inputs
            if (inInput) return;

            // / — Focus search
            if (e.key === '/' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); const el = document.querySelector('.tmap-container input[type="text"], .tmap-container input:not([type])') as HTMLInputElement; if (el) el.focus(); return; }

            // Navigation & View
            if (e.key === '+' || e.key === '=') { handleZoomIn(); return; }
            if (e.key === '-') { handleZoomOut(); return; }
            if (e.key === 'n' || e.key === 'N') { handleResetNorth(); return; }
            if (e.key === '[') { handleRotateCCW(); return; }
            if (e.key === ']') { handleRotateCW(); return; }
            if (e.key === 'f' && !e.ctrlKey) { handleFullscreen(); return; }

            // Sidebar
            if (e.key === 's' && !e.ctrlKey) { setSidebarOpen(prev => !prev); return; }

            // Timeline
            if (e.key === 't' && !e.ctrlKey) { setTimelineOpen(prev => !prev); return; }

            // Intelligence Panels
            if (e.key === '1' && e.altKey) { e.preventDefault(); setShowLiveTracker(prev => !prev); triggerTopLoader(); return; }
            if (e.key === '2' && e.altKey) { e.preventDefault(); setShowCorrelationPanel(prev => !prev); triggerTopLoader(); return; }
            if (e.key === '3' && e.altKey) { e.preventDefault(); setShowAnomalyPanel(prev => !prev); triggerTopLoader(); return; }
            if (e.key === '4' && e.altKey) { e.preventDefault(); setShowPredictivePanel(prev => !prev); triggerTopLoader(); return; }
            if (e.key === '5' && e.altKey) { e.preventDefault(); setShowPatternPanel(prev => !prev); triggerTopLoader(); return; }
            if (e.key === '6' && e.altKey) { e.preventDefault(); setShowIncidentPanel(prev => !prev); triggerTopLoader(); return; }
            if (e.key === '7' && e.altKey) { e.preventDefault(); setShowHeatCalPanel(prev => !prev); triggerTopLoader(); return; }
            if (e.key === '8' && e.altKey) { e.preventDefault(); setShowComparePanel(prev => !prev); triggerTopLoader(); return; }
            if (e.key === '9' && e.altKey) { e.preventDefault(); setShowRouteReplay(prev => !prev); triggerTopLoader(); return; }

            // Tools
            if (e.key === 'r' && !e.ctrlKey) { setRulerActive(prev => !prev); return; }
            if (e.key === 'l' && !e.ctrlKey) { setShowLiveFeed(prev => !prev); return; }
            if (e.key === 'm' && !e.ctrlKey) { setShowMinimap(prev => !prev); return; }
            if (e.key === 'g' && !e.ctrlKey) { setShowCoords(prev => !prev); return; }
            if (e.key === 'p' && !e.ctrlKey) { setPlacingMarker(prev => !prev); return; }
            if (e.key === 'e' && !e.ctrlKey) { setShowExportModal(prev => !prev); return; }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [showExportModal, showShortcuts, tlLightbox, tlMarkerCtx, markerCtxMenu, mapCtxMenu, zoneCtxMenu, objCtxMenu, wsModal, zoneModal, placeModal, deleteConfirm, zoneDrawing, objDrawing, rulerActive, placingMarker, timelineOpen, showLiveTracker, showCorrelationPanel, showAnomalyPanel, showPredictivePanel, showPatternPanel, showIncidentPanel, showHeatCalPanel, showComparePanel, showRouteReplay, showObjectsPanel, showRulerPanel, showZonePanel, showPlacesPanel, showWorkspacesPanel, activeLayerPanel, sidebarOpen]);

    // ═══ GLOBAL CLEANUP on unmount ═══
    useEffect(() => {
        return () => {
            if (timelinePlayRef.current) clearInterval(timelinePlayRef.current);
            if (topLoaderTimer.current) clearTimeout(topLoaderTimer.current);
            if (liveTrackInterval.current) clearInterval(liveTrackInterval.current);
        };
    }, []);

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

    // Show/hide objects layers
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        const vis = showObjects ? 'visible' : 'none';
        try { if (map.getLayer('objects-fill')) map.setLayoutProperty('objects-fill', 'visibility', vis); } catch {}
        try { if (map.getLayer('objects-fill-3d')) map.setLayoutProperty('objects-fill-3d', 'visibility', vis); } catch {}
        try { if (map.getLayer('objects-outline')) map.setLayoutProperty('objects-outline', 'visibility', vis); } catch {}
        try { if (map.getLayer('objects-line')) map.setLayoutProperty('objects-line', 'visibility', vis); } catch {}
        // Toggle DOM markers
        objMarkersRef.current.forEach(m => { try { m.getElement().style.display = showObjects ? '' : 'none'; } catch {} });
    }, [showObjects, loaded]);

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
        if (webglFailed) return;
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
        try {
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
        } catch (e) { console.warn('MapLibre WebGL globe init failed:', e); setWebglFailed(true); setLoaded(true); }
    }, [attachMapEvents]);

    const rebuildMapForFlat = useCallback(() => {
        if (webglFailed) return;
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
        try {
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
        } catch (e) { console.warn('MapLibre WebGL flat init failed:', e); setWebglFailed(true); setLoaded(true); }
    }, [attachMapEvents, activeTile]);

    useEffect(() => {
        const maplibreCSS = 'https://unpkg.com/maplibre-gl@5.21.0/dist/maplibre-gl.css';
        const maplibreJS = 'https://unpkg.com/maplibre-gl@5.21.0/dist/maplibre-gl.js';
        if (!document.querySelector(`link[href="${maplibreCSS}"]`)) { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = maplibreCSS; document.head.appendChild(link); }

        // Global error handler to catch uncaught WebGL context creation errors
        const globalWebGLErrorHandler = (event: ErrorEvent) => {
            if (event.message?.includes('WebGL') || event.message?.includes('webgl') || event.message?.includes('webglcontextcreationerror') || event.message?.includes('Failed to initialize WebGL')) {
                event.preventDefault();
                event.stopPropagation();
                console.warn('ARGUX: Global WebGL error caught:', event.message);
                setWebglFailed(true);
                setLoaded(true);
            }
        };
        const globalWebGLCtxHandler = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
            console.warn('ARGUX: Global webglcontextcreationerror caught');
            setWebglFailed(true);
            setLoaded(true);
        };
        window.addEventListener('error', globalWebGLErrorHandler);
        window.addEventListener('webglcontextcreationerror', globalWebGLCtxHandler, true);
        document.addEventListener('webglcontextcreationerror', globalWebGLCtxHandler, true);

        // Pre-check WebGL availability before attempting MapLibre init
        const checkWebGL = (): boolean => {
            try {
                const c = document.createElement('canvas');
                const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl');
                if (!gl) return false;
                // Also check if it's a real context (not a disabled stub)
                const dbg = (gl as any).getExtension?.('WEBGL_debug_renderer_info');
                if (dbg) { const renderer = (gl as any).getParameter?.(dbg.UNMASKED_RENDERER_WEBGL) || ''; if (renderer === 'Disabled' || renderer === 'SwiftShader') return false; }
                return true;
            } catch { return false; }
        };

        const initMap = () => {
            if (!mapContainer.current || !(window as any).maplibregl) return;
            if (!checkWebGL()) { console.warn('WebGL not available — map will show fallback UI'); setWebglFailed(true); setLoaded(true); return; }
            const ml = (window as any).maplibregl;
            try {
            // Listen for WebGL context errors on the container before map creation
            const onCtxError = (ev: Event) => { ev.preventDefault(); ev.stopPropagation(); console.warn('WebGL context creation error caught:', ev); setWebglFailed(true); setLoaded(true); };
            mapContainer.current.addEventListener('webglcontextcreationerror', onCtxError, true);
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
            map.on('error', (e: any) => { if (e?.error?.message?.includes('WebGL') || e?.error?.message?.includes('webgl')) { console.warn('MapLibre runtime WebGL error:', e); setWebglFailed(true); setLoaded(true); } });
            (map as any)._isGlobe = false;
            attachMapEvents(map);
            map.on('load', () => {
                setLoaded(true);
                setZoom(Math.round(map.getZoom() * 10) / 10);
                // Allow tile/localization effects to run on future changes
                setTimeout(() => { tileInitRef.current = false; }, 100);
            });
            mapRef.current = map;
            } catch (e: any) { console.warn('MapLibre WebGL init failed:', e?.message || e); setWebglFailed(true); setLoaded(true); }
        };
        if ((window as any).maplibregl) initMap(); else { const s = document.createElement('script'); s.src = maplibreJS; s.onload = () => setTimeout(initMap, 50); document.head.appendChild(s); }
        return () => { window.removeEventListener('error', globalWebGLErrorHandler); window.removeEventListener('webglcontextcreationerror', globalWebGLCtxHandler, true); document.removeEventListener('webglcontextcreationerror', globalWebGLCtxHandler, true); if (mapRef.current) { if ((mapRef.current as any)._spinFrame) cancelAnimationFrame((mapRef.current as any)._spinFrame); mapRef.current.remove(); mapRef.current = null; } };
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
            {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }} />}

            {/* Sidebar */}
            <div className={`tmap-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="tmap-sidebar-header">
                    <div className="tmap-sidebar-brand"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 2v12M2 8h12"/><circle cx="8" cy="8" r="2"/></svg>Tactical Map</div>
                    <button onClick={handleRecenter} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Recenter" onMouseEnter={e => (e.currentTarget.style.color = theme.accent)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5"/><circle cx="8" cy="8" r="1"/><line x1="8" y1="1" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/></svg></button>
                </div>
                <div className="tmap-sidebar-body">
                    {/* Section reorder control */}
                    <div style={{ padding: '4px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}30`, flexShrink: 0 }}>
                        <button onClick={() => setSectionReorderMode(!sectionReorderMode)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, border: `1px solid ${sectionReorderMode ? theme.accent + '40' : 'transparent'}`, background: sectionReorderMode ? `${theme.accent}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, fontWeight: 600, color: sectionReorderMode ? theme.accent : theme.textDim }}>
                            <svg width="8" height="10" viewBox="0 0 8 12" fill="currentColor"><circle cx="2" cy="2" r="1"/><circle cx="6" cy="2" r="1"/><circle cx="2" cy="6" r="1"/><circle cx="6" cy="6" r="1"/><circle cx="2" cy="10" r="1"/><circle cx="6" cy="10" r="1"/></svg>
                            {sectionReorderMode ? 'Done' : 'Reorder'}
                        </button>
                        {sectionReorderMode && <button onClick={resetSectionOrder} style={{ fontSize: 8, padding: '3px 8px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: theme.textDim }}>Reset order</button>}
                    </div>

                    {/* PERIOD */}
                    <div className={`tmap-section-wrap${dragSectionId === 'period' ? ' dragging' : ''}${dragOverId === 'period' ? ' drag-over' : ''}`} style={{ order: sectionOrder.indexOf('period') }} onDragOver={e => handleSectionDragOver(e, 'period')} onDrop={() => handleSectionDrop('period')}>
                    <Section title="Period" icon={Ico.period} dragHandle={dragHandleEl('period')}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                            <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>From</div><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={dateInputStyle} /></div>
                            <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>To</div><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={dateInputStyle} /></div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {['24h', '7d', '30d'].map(p => <button key={p} onClick={() => { const d = new Date(); const f = new Date(); if (p === '24h') f.setDate(d.getDate() - 1); if (p === '7d') f.setDate(d.getDate() - 7); if (p === '30d') f.setDate(d.getDate() - 30); setDateFrom(f.toISOString().slice(0, 10)); setDateTo(d.toISOString().slice(0, 10)); triggerTopLoader(); }} style={{ flex: 1, padding: '4px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textDim; }}>{p}</button>)}
                                {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(''); setDateTo(''); triggerTopLoader(); }} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: theme.danger, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>×</button>}
                            </div>
                            {(dateFrom || dateTo) && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, padding: '5px 8px', borderRadius: 5, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
                                <span style={{ fontSize: 9, color: theme.textSecondary }}>{periodFilteredEvents.length} events in period</span>
                                <button onClick={() => { setTimelineOpen(true); setTimelineCursor(100); }} style={{ fontSize: 8, fontWeight: 700, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>Open Timeline →</button>
                            </div>}
                        </div>
                    </Section>
                    </div>

                    {/* SUBJECTS */}
                    <div className={`tmap-section-wrap${dragSectionId === 'subjects' ? ' dragging' : ''}${dragOverId === 'subjects' ? ' drag-over' : ''}`} style={{ order: sectionOrder.indexOf('subjects') }} onDragOver={e => handleSectionDragOver(e, 'subjects')} onDrop={() => handleSectionDrop('subjects')}>
                    <Section title="Subjects" icon={Ico.subjects} badge={selectedPersons.length + selectedOrgs.length} dragHandle={dragHandleEl('subjects')}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                            <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Persons ({selectedPersons.length}/{mockPersons.length})</div><SidebarMS selected={selectedPersons} onChange={v => { setSelectedPersons(v); triggerTopLoader(); }} options={personOpts} placeholder="Select persons to track..." showSelectAll /></div>
                            <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Organizations ({selectedOrgs.length}/{mockOrganizations.length})</div><SidebarMS selected={selectedOrgs} onChange={v => { setSelectedOrgs(v); triggerTopLoader(); }} options={orgOpts} placeholder="Select organizations..." showSelectAll /></div>
                        </div>
                    </Section>
                    </div>

                    <div className={`tmap-section-wrap${dragSectionId === 'sources' ? ' dragging' : ''}${dragOverId === 'sources' ? ' drag-over' : ''}`} style={{ order: sectionOrder.indexOf('sources') }} onDragOver={e => handleSectionDragOver(e, 'sources')} onDrop={() => handleSectionDrop('sources')}>
                    <Section title="Sources" icon={Ico.sources} badge={activeSourceCount} dragHandle={dragHandleEl('sources')}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                            {['Camera', 'GPS', 'Audio', 'Mobile App'].map(group => {
                                const items = sourceTypes.filter(s => s.group === group);
                                const activeInGroup = items.filter(s => activeSources.has(s.id)).length;
                                const allOn = activeInGroup === items.length;
                                return <div key={group}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{group} {activeInGroup > 0 && <span style={{ color: theme.accent }}>({activeInGroup})</span>}</span>
                                        <button onClick={() => toggleSourceGroup(group)} style={{ fontSize: 8, fontWeight: 600, color: allOn ? theme.danger : theme.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>{allOn ? 'Off All' : 'On All'}</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
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
                                <button onClick={() => { setActiveSources(new Set()); triggerTopLoader(); }} style={{ fontSize: 8, fontWeight: 600, color: theme.danger, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Disable All</button>
                            </div>}
                        </div>
                    </Section>
                    </div>
                    <div className={`tmap-section-wrap${dragSectionId === 'layers' ? ' dragging' : ''}${dragOverId === 'layers' ? ' drag-over' : ''}`} style={{ order: sectionOrder.indexOf('layers') }} onDragOver={e => handleSectionDragOver(e, 'layers')} onDrop={() => handleSectionDrop('layers')}>
                    <Section title="Layers" icon={Ico.layers} badge={(layerHeatmap ? 1 : 0) + (layerNetwork ? 1 : 0) + (layerLPR ? 1 : 0) + (layerFace ? 1 : 0)} dragHandle={dragHandleEl('layers')}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                            {/* Layer buttons */}
                            {[
                                { key: 'heatmap', icon: '🔥', label: 'Activity Heatmap', color: '#f59e0b', active: layerHeatmap, toggle: () => { setLayerHeatmap(!layerHeatmap); triggerTopLoader(); }, panel: showHeatmapPanel, openPanel: () => { setShowHeatmapPanel(true); setShowNetworkPanel(false); setShowLPRPanel(false); setShowFacePanel(false); triggerTopLoader(); }, desc: layerHeatmap ? `${heatmapPoints.length} points · ${(heatmapIntensity * 100).toFixed(0)}% intensity` : 'Surveillance activity density' },
                                { key: 'network', icon: '🕸️', label: 'Network Graph', color: '#8b5cf6', active: layerNetwork, toggle: () => { setLayerNetwork(!layerNetwork); triggerTopLoader(); }, panel: showNetworkPanel, openPanel: () => { setShowNetworkPanel(true); setShowHeatmapPanel(false); setShowLPRPanel(false); setShowFacePanel(false); triggerTopLoader(); }, desc: layerNetwork ? `${netNodes.length} nodes · ${netFilteredEdges.length} connections${netIsolatedEdge ? ' · isolated' : ''}` : 'Entity connection analysis' },
                                { key: 'lpr', icon: '🚗', label: 'Plate Recognition', color: '#10b981', active: layerLPR, toggle: () => { setLayerLPR(!layerLPR); triggerTopLoader(); }, panel: showLPRPanel, openPanel: () => { setShowLPRPanel(true); setShowHeatmapPanel(false); setShowNetworkPanel(false); setShowFacePanel(false); triggerTopLoader(); }, desc: layerLPR ? `${mockLPR.filter(l => !lprHidden.has(l.id) && (lprSelected.size === 0 || lprSelected.has(l.id))).length} visible · ${lprHidden.size} hidden` : 'License plate captures' },
                                { key: 'face', icon: '🧑‍🦲', label: 'Face Recognition', color: '#ec4899', active: layerFace, toggle: () => { setLayerFace(!layerFace); triggerTopLoader(); }, panel: showFacePanel, openPanel: () => { setShowFacePanel(true); setShowHeatmapPanel(false); setShowNetworkPanel(false); setShowLPRPanel(false); triggerTopLoader(); }, desc: layerFace ? `${mockFaces.filter(f => !faceHidden.has(f.id) && (faceSelected.size === 0 || faceSelected.has(f.id))).length} visible · ${faceHidden.size} hidden` : 'Facial recognition captures' },
                            ].map(l => <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {/* Toggle switch */}
                                <button onClick={l.toggle} style={{ width: 28, height: 16, borderRadius: 8, border: 'none', background: l.active ? l.color : theme.border, cursor: 'pointer', position: 'relative' as const, transition: 'background 0.2s', padding: 0, flexShrink: 0 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff', position: 'absolute' as const, top: 2, left: l.active ? 14 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                                </button>
                                {/* Panel open button */}
                                <button onClick={l.openPanel} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 5, border: `1px solid ${l.active ? l.color + '25' : l.panel ? l.color + '40' : theme.border}`, background: l.panel ? `${l.color}06` : l.active ? `${l.color}03` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const, transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = `${l.color}08`; e.currentTarget.style.borderColor = l.color + '40'; }} onMouseLeave={e => { e.currentTarget.style.background = l.panel ? `${l.color}06` : l.active ? `${l.color}03` : 'transparent'; e.currentTarget.style.borderColor = l.active ? l.color + '25' : l.panel ? l.color + '40' : theme.border; }}>
                                    <span style={{ fontSize: 13 }}>{l.icon}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: l.active ? l.color : theme.text }}>{l.label}</div>
                                        <div style={{ fontSize: 7, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{l.desc}</div>
                                    </div>
                                    <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke={l.panel ? l.color : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                                </button>
                            </div>)}
                        </div>
                    </Section>
                    </div>
                    <div className={`tmap-section-wrap${dragSectionId === 'tiles' ? ' dragging' : ''}${dragOverId === 'tiles' ? ' drag-over' : ''}`} style={{ order: sectionOrder.indexOf('tiles') }} onDragOver={e => handleSectionDragOver(e, 'tiles')} onDrop={() => handleSectionDrop('tiles')}>
                    <Section title="Tiles" icon={Ico.tiles} badge={active3D ? 1 : 0} dragHandle={dragHandleEl('tiles')}>
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>2D Base Maps</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 12 }}>
                                {tiles2D.map(t => { const isActive = activeTile === t.id; return (
                                    <button key={t.id} onClick={() => { setActiveTile(t.id); triggerTopLoader(); }} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3, padding: '6px 2px', borderRadius: 6, border: `1.5px solid ${isActive ? theme.accent : theme.border}`, background: isActive ? theme.accentDim : 'transparent', cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit' }} onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')} onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}>
                                        <span style={{ fontSize: 16 }}>{t.preview}</span>
                                        <span style={{ fontSize: 8, fontWeight: 600, color: isActive ? theme.accent : theme.textDim, lineHeight: 1.1, textAlign: 'center' as const }}>{t.name}</span>
                                    </button>
                                ); })}
                            </div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>3D Modes</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                                {tiles3D.map(t => { const isActive = active3D === t.id; return (
                                    <button key={t.id} onClick={() => { setActive3D(isActive ? null : t.id); triggerTopLoader(); }} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3, padding: '8px 2px', borderRadius: 6, border: `1.5px solid ${isActive ? '#8b5cf6' : theme.border}`, background: isActive ? 'rgba(139,92,246,0.08)' : 'transparent', cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit' }} onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')} onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}>
                                        <span style={{ fontSize: 18 }}>{t.preview}</span>
                                        <span style={{ fontSize: 8, fontWeight: 600, color: isActive ? '#8b5cf6' : theme.textDim, lineHeight: 1.1, textAlign: 'center' as const }}>{t.name}</span>
                                    </button>
                                ); })}
                            </div>
                            {active3D && <div style={{ marginTop: 8, padding: '5px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', fontSize: 9, color: 'rgba(139,92,246,0.7)' }}>3D mode active: {tiles3D.find(t => t.id === active3D)?.name}. Click again to disable.</div>}
                        </div>
                    </Section>
                    </div>
                    <div className={`tmap-section-wrap${dragSectionId === 'tools' ? ' dragging' : ''}${dragOverId === 'tools' ? ' drag-over' : ''}`} style={{ order: sectionOrder.indexOf('tools') }} onDragOver={e => handleSectionDragOver(e, 'tools')} onDrop={() => handleSectionDrop('tools')}>
                    <Section title="Tools" icon={Ico.tools} badge={(rulerActive ? 1 : 0) + (zoneDrawing ? 1 : 0)} dragHandle={dragHandleEl('tools')}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                            {/* Ruler button */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <button onClick={() => { if (rulerActive) { stopRuler(); } else { setRulerPoints([]); setRulerActive(true); triggerTopLoader(); setZoneDrawing(null); } }} style={{ width: 28, height: 16, borderRadius: 8, border: 'none', background: rulerActive ? '#f59e0b' : theme.border, cursor: 'pointer', position: 'relative' as const, transition: 'background 0.2s', padding: 0, flexShrink: 0 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff', position: 'absolute' as const, top: 2, left: rulerActive ? 14 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                                </button>
                                <button onClick={() => { setShowRulerPanel(true); setShowZonePanel(false); triggerTopLoader(); }} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 5, border: `1px solid ${rulerActive ? '#f59e0b25' : showRulerPanel ? '#f59e0b40' : theme.border}`, background: showRulerPanel ? 'rgba(245,158,11,0.06)' : rulerActive ? 'rgba(245,158,11,0.03)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const, transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = showRulerPanel ? 'rgba(245,158,11,0.06)' : rulerActive ? 'rgba(245,158,11,0.03)' : 'transparent'; }}>
                                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={rulerActive ? '#f59e0b' : theme.textDim} strokeWidth="1.5" strokeLinecap="round"><path d="M2 14L14 2"/><path d="M5 14L2 14L2 11"/><path d="M11 2L14 2L14 5"/></svg>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: rulerActive ? '#f59e0b' : theme.text }}>Ruler</div>
                                        <div style={{ fontSize: 7, color: theme.textDim }}>{rulerActive ? `${rulerPoints.length} points${rulerPoints.length >= 2 ? ` · ${formatDist(calcDistance(rulerPoints))}` : ''}` : 'Measure distances on map'}</div>
                                    </div>
                                    {rulerPoints.length >= 2 && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#f59e0b15', color: '#f59e0b', border: '1px solid #f59e0b25', fontFamily: "'JetBrains Mono', monospace" }}>{formatDist(calcDistance(rulerPoints))}</span>}
                                    <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke={showRulerPanel ? '#f59e0b' : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                                </button>
                            </div>
                            {/* Zone Editor button */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <button onClick={() => { if (zoneDrawing) { setZoneDrawing(null); } else { openAddZone(); } }} style={{ width: 28, height: 16, borderRadius: 8, border: 'none', background: zoneDrawing ? '#8b5cf6' : theme.border, cursor: 'pointer', position: 'relative' as const, transition: 'background 0.2s', padding: 0, flexShrink: 0 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff', position: 'absolute' as const, top: 2, left: zoneDrawing ? 14 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                                </button>
                                <button onClick={() => { setShowZonePanel(true); setShowRulerPanel(false); triggerTopLoader(); }} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 5, border: `1px solid ${zoneDrawing ? '#8b5cf625' : showZonePanel ? '#8b5cf640' : theme.border}`, background: showZonePanel ? 'rgba(139,92,246,0.06)' : zoneDrawing ? 'rgba(139,92,246,0.03)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const, transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = showZonePanel ? 'rgba(139,92,246,0.06)' : zoneDrawing ? 'rgba(139,92,246,0.03)' : 'transparent'; }}>
                                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={zoneDrawing ? '#8b5cf6' : theme.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/><circle cx="8" cy="8" r="2"/></svg>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: zoneDrawing ? '#8b5cf6' : theme.text }}>Zone Editor</div>
                                        <div style={{ fontSize: 7, color: theme.textDim }}>{zones.length} zones{hiddenZones.size > 0 ? ` · ${hiddenZones.size} hidden` : ''}{zoneDrawing ? ' · Drawing...' : ''}</div>
                                    </div>
                                    {zones.length > 0 && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#8b5cf612', color: '#8b5cf6', border: '1px solid #8b5cf620' }}>{zones.length}</span>}
                                    <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke={showZonePanel ? '#8b5cf6' : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                                </button>
                            </div>
                            {/* Active drawing indicator */}
                            {zoneDrawing && <div style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', fontSize: 9, color: '#8b5cf6', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Drawing {zoneDrawing.shape} — {zoneDrawing.points.length} pts<button onClick={() => setZoneDrawing(null)} style={{ fontSize: 8, color: theme.danger, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Cancel</button></div>}
                        </div>
                    </Section>
                    </div>
                    <div className={`tmap-section-wrap${dragSectionId === 'intelligence' ? ' dragging' : ''}${dragOverId === 'intelligence' ? ' drag-over' : ''}`} style={{ order: sectionOrder.indexOf('intelligence') }} onDragOver={e => handleSectionDragOver(e, 'intelligence')} onDrop={() => handleSectionDrop('intelligence')}>
                    <Section title="Intelligence" icon={Ico.intel} badge={liveTrackSessions.length + (corrResults ? corrResults.length : 0) + (anomalyResults ? anomalyResults.length : 0) + (predResults ? predResults.length : 0) + (patternResults ? patternResults.length : 0)} dragHandle={dragHandleEl('intelligence')}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                            {/* Live Tracker button */}
                            <button onClick={() => { setShowLiveTracker(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, border: `1px solid ${liveTrackSessions.length > 0 ? '#22c55e30' : theme.border}`, background: liveTrackSessions.length > 0 ? 'rgba(34,197,94,0.04)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.06)'; e.currentTarget.style.borderColor = '#22c55e40'; }} onMouseLeave={e => { e.currentTarget.style.background = liveTrackSessions.length > 0 ? 'rgba(34,197,94,0.04)' : 'transparent'; e.currentTarget.style.borderColor = liveTrackSessions.length > 0 ? '#22c55e30' : theme.border; }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: liveTrackSessions.length > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.06)', border: `1px solid ${liveTrackSessions.length > 0 ? '#22c55e30' : '#22c55e15'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, position: 'relative' as const }}>🎯{liveTrackSessions.length > 0 && <div style={{ position: 'absolute' as const, top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#22c55e', border: '1.5px solid rgba(13,18,32,0.9)', animation: 'tmap-tl-ring 1.5s infinite' }} />}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: liveTrackSessions.length > 0 ? '#22c55e' : theme.text }}>Live Tracker</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>{liveTrackSessions.length > 0 ? `${liveTrackSessions.filter(s => s.status === 'tracking').length} tracking · ${liveTrackSessions.filter(s => s.status === 'paused').length} paused` : 'Track persons via GPS or phone'}</div>
                                </div>
                                {liveTrackSessions.length > 0 && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#22c55e15', color: '#22c55e', border: '1px solid #22c55e25' }}>{liveTrackSessions.length}</span>}
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>

                            {/* Active session mini-badges */}
                            {liveTrackSessions.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', padding: '0 2px' }}>
                                {liveTrackSessions.map(s => {
                                    const statColor = s.status === 'tracking' ? '#22c55e' : s.status === 'paused' ? '#f59e0b' : '#ef4444';
                                    return <button key={s.id} onClick={() => { setShowLiveTracker(true); setLiveTrackFollow(s.id); triggerTopLoader(); const last = s.positions[s.positions.length - 1]; if (last && mapRef.current) mapRef.current.flyTo({ center: [last.lng, last.lat], zoom: 16, duration: 800 }); }} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 5px', borderRadius: 3, border: `1px solid ${s.color}30`, background: `${s.color}06`, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: statColor, flexShrink: 0 }} />
                                        <span style={{ fontSize: 7, fontWeight: 700, color: s.color }}>{s.personName.charAt(0)}{s.personLastName.charAt(0)}</span>
                                        <span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{s.speed}km/h</span>
                                    </button>;
                                })}
                            </div>}

                            {/* Other intelligence panels */}
                            {/* Event Correlation button */}
                            <button onClick={() => { setShowCorrelationPanel(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, border: `1px solid ${corrResults && corrResults.length > 0 ? '#f59e0b30' : showCorrelationPanel ? '#f59e0b40' : theme.border}`, background: showCorrelationPanel ? 'rgba(245,158,11,0.06)' : corrResults && corrResults.length > 0 ? 'rgba(245,158,11,0.03)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = showCorrelationPanel ? 'rgba(245,158,11,0.06)' : corrResults && corrResults.length > 0 ? 'rgba(245,158,11,0.03)' : 'transparent'; }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: corrResults && corrResults.length > 0 ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.06)', border: `1px solid ${corrResults && corrResults.length > 0 ? '#f59e0b30' : '#f59e0b15'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🔗</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: corrResults && corrResults.length > 0 ? '#f59e0b' : theme.text }}>Event Correlation</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>{corrResults ? `${corrResults.length} co-locations found` : 'Analyze co-location events'}</div>
                                </div>
                                {corrResults && corrResults.length > 0 && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#f59e0b15', color: '#f59e0b', border: '1px solid #f59e0b25' }}>{corrResults.length}</span>}
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={showCorrelationPanel ? '#f59e0b' : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>

                            {[
                                { icon: '🧠', label: 'Anomaly Detection', desc: 'AI movement analysis', panel: true },
                            ].map(p => <button key={p.label} onClick={() => { setShowAnomalyPanel(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, border: `1px solid ${anomalyResults && anomalyResults.length > 0 ? '#8b5cf630' : showAnomalyPanel ? '#8b5cf640' : theme.border}`, background: showAnomalyPanel ? 'rgba(139,92,246,0.06)' : anomalyResults && anomalyResults.length > 0 ? 'rgba(139,92,246,0.03)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = showAnomalyPanel ? 'rgba(139,92,246,0.06)' : anomalyResults && anomalyResults.length > 0 ? 'rgba(139,92,246,0.03)' : 'transparent'; }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: anomalyResults && anomalyResults.length > 0 ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.06)', border: `1px solid ${anomalyResults && anomalyResults.length > 0 ? '#8b5cf630' : '#8b5cf615'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{p.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: anomalyResults && anomalyResults.length > 0 ? '#8b5cf6' : theme.text }}>{p.label}</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>{anomalyResults ? `${anomalyResults.length} anomalies detected` : p.desc}</div>
                                </div>
                                {anomalyResults && anomalyResults.length > 0 && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#8b5cf615', color: '#8b5cf6', border: '1px solid #8b5cf625' }}>{anomalyResults.length}</span>}
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={showAnomalyPanel ? '#8b5cf6' : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>)}

                            {/* Predictive Risk button */}
                            <button onClick={() => { setShowPredictivePanel(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, border: `1px solid ${predResults && predResults.length > 0 ? '#ef444430' : showPredictivePanel ? '#ef444440' : theme.border}`, background: showPredictivePanel ? 'rgba(239,68,68,0.06)' : predResults && predResults.length > 0 ? 'rgba(239,68,68,0.03)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = showPredictivePanel ? 'rgba(239,68,68,0.06)' : predResults && predResults.length > 0 ? 'rgba(239,68,68,0.03)' : 'transparent'; }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: predResults && predResults.length > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.06)', border: `1px solid ${predResults && predResults.length > 0 ? '#ef444430' : '#ef444415'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📈</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: predResults && predResults.length > 0 ? '#ef4444' : theme.text }}>Predictive Risk</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>{predResults ? `${predResults.length} subjects · ${predResults.filter(r => r.riskDelta > 10).length} escalating` : 'Location & risk predictions'}</div>
                                </div>
                                {predResults && predResults.length > 0 && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#ef444415', color: '#ef4444', border: '1px solid #ef444425' }}>{predResults.length}</span>}
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={showPredictivePanel ? '#ef4444' : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>

                            {/* Pattern Detection button */}
                            <button onClick={() => { setShowPatternPanel(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, border: `1px solid ${patternResults && patternResults.length > 0 ? '#06b6d430' : showPatternPanel ? '#06b6d440' : theme.border}`, background: showPatternPanel ? 'rgba(6,182,212,0.06)' : patternResults && patternResults.length > 0 ? 'rgba(6,182,212,0.03)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = showPatternPanel ? 'rgba(6,182,212,0.06)' : patternResults && patternResults.length > 0 ? 'rgba(6,182,212,0.03)' : 'transparent'; }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: patternResults && patternResults.length > 0 ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.06)', border: `1px solid ${patternResults && patternResults.length > 0 ? '#06b6d430' : '#06b6d415'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🔄</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: patternResults && patternResults.length > 0 ? '#06b6d4' : theme.text }}>Pattern Detection</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>{patternResults ? `${patternResults.length} patterns · ${patternResults.reduce((s, r) => s + r.occurrences, 0)} occurrences` : 'Frequency & regularity analysis'}</div>
                                </div>
                                {patternResults && patternResults.length > 0 && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#06b6d415', color: '#06b6d4', border: '1px solid #06b6d425' }}>{patternResults.length}</span>}
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={showPatternPanel ? '#06b6d4' : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>

                            {/* Incident Timeline button */}
                            <button onClick={() => { setShowIncidentPanel(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, border: `1px solid ${showIncidentPanel ? '#f9731640' : theme.border}`, background: showIncidentPanel ? 'rgba(249,115,22,0.06)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = showIncidentPanel ? 'rgba(249,115,22,0.06)' : 'transparent'; }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📋</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: showIncidentPanel ? '#f97316' : theme.text }}>Incident Timeline</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>{mockIncidents.length} events · {incidentStats.critical} critical</div>
                                </div>
                                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: incidentStats.critical > 0 ? '#ef444415' : `${theme.accent}12`, color: incidentStats.critical > 0 ? '#ef4444' : theme.accent, border: `1px solid ${incidentStats.critical > 0 ? '#ef444425' : theme.accent + '20'}` }}>{mockIncidents.length}</span>
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={showIncidentPanel ? '#f97316' : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>

                            {/* Heat Calendar button */}
                            <button onClick={() => { setShowHeatCalPanel(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, border: `1px solid ${showHeatCalPanel ? '#10b98140' : theme.border}`, background: showHeatCalPanel ? 'rgba(16,185,129,0.06)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = showHeatCalPanel ? 'rgba(16,185,129,0.06)' : 'transparent'; }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📅</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: showHeatCalPanel ? '#10b981' : theme.text }}>Heat Calendar</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>Daily activity grid · 90 days</div>
                                </div>
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={showHeatCalPanel ? '#10b981' : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>

                            {/* Multi-Entity Comparison button */}
                            <button onClick={() => { setShowComparePanel(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, border: `1px solid ${showComparePanel ? '#a855f740' : theme.border}`, background: showComparePanel ? 'rgba(168,85,247,0.06)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = showComparePanel ? 'rgba(168,85,247,0.06)' : 'transparent'; }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>⚖️</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: showComparePanel ? '#a855f7' : theme.text }}>Entity Comparison</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>Side-by-side activity analysis</div>
                                </div>
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={showComparePanel ? '#a855f7' : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>

                            {/* Route Replay button */}
                            <button onClick={() => { setShowRouteReplay(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, border: `1px solid ${showRouteReplay ? '#ec489940' : theme.border}`, background: showRouteReplay ? 'rgba(236,72,153,0.06)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(236,72,153,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = showRouteReplay ? 'rgba(236,72,153,0.06)' : 'transparent'; }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: rrPlaying ? 'rgba(236,72,153,0.15)' : 'rgba(236,72,153,0.06)', border: `1px solid ${rrPlaying ? '#ec489940' : '#ec489915'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🎬</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: showRouteReplay ? '#ec4899' : theme.text }}>Route Replay</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>{rrPlaying ? `Playing · ${rrSpeed}x speed` : 'Animate historical movement'}</div>
                                </div>
                                {rrPlaying && <span style={{ fontSize: 7, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#ec489915', color: '#ec4899', border: '1px solid #ec489925', animation: 'argux-fadeIn 0.3s' }}>▶ LIVE</span>}
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={showRouteReplay ? '#ec4899' : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>
                        </div>
                    </Section>
                    </div>
                    <div className={`tmap-section-wrap${dragSectionId === 'objects' ? ' dragging' : ''}${dragOverId === 'objects' ? ' drag-over' : ''}`} style={{ order: sectionOrder.indexOf('objects') }} onDragOver={e => handleSectionDragOver(e, 'objects')} onDrop={() => handleSectionDrop('objects')}>
                    <Section title="Objects" icon={Ico.objects} badge={mapObjects.length} dragHandle={dragHandleEl('objects')}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                            {/* Draw buttons */}
                            {!objDrawing && !placingMarker && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                                {(['marker', 'line', 'rectangle', 'polygon', 'freehand', 'circle'] as ObjType[]).map(t => <button key={t} onClick={() => t === 'marker' ? startPlacingMarker() : startObjDraw(t)} style={{ padding: '5px 2px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'center' as const, lineHeight: 1.3 }} onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent + '50'; e.currentTarget.style.color = theme.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textDim; }}><div style={{ fontSize: 12, marginBottom: 1 }}>{objTypeLabels[t].icon}</div>{objTypeLabels[t].label}</button>)}
                            </div>}
                            {objDrawing && <div style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 9, color: theme.accent, fontWeight: 600 }}>Drawing {objTypeLabels[objDrawing.type].label} — {objDrawing.points.length} pts <button onClick={() => setObjDrawing(null)} style={{ marginLeft: 6, fontSize: 8, color: theme.danger, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Cancel</button></div>}
                            {placingMarker && <div style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', fontSize: 9, color: '#ef4444', fontWeight: 600 }}>📌 Click on map to place marker <button onClick={() => setPlacingMarker(false)} style={{ marginLeft: 6, fontSize: 8, color: theme.danger, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Cancel</button></div>}
                            {/* Open Objects Panel button */}
                            <button onClick={() => { setShowObjectsPanel(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, border: `1px solid ${mapObjects.length > 0 ? theme.accent + '25' : theme.border}`, background: mapObjects.length > 0 ? `${theme.accent}04` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = `${theme.accent}08`; e.currentTarget.style.borderColor = theme.accent + '40'; }} onMouseLeave={e => { e.currentTarget.style.background = mapObjects.length > 0 ? `${theme.accent}04` : 'transparent'; e.currentTarget.style.borderColor = mapObjects.length > 0 ? theme.accent + '25' : theme.border; }}>
                                <div style={{ width: 24, height: 24, borderRadius: 5, background: `${theme.accent}08`, border: `1px solid ${theme.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>📋</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>Objects List</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>{mapObjects.length} objects · {mapObjects.filter(o => o.type === 'marker').length} markers · {mapObjects.filter(o => o.type !== 'marker').length} shapes</div>
                                </div>
                                {mapObjects.length > 0 && <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${theme.accent}12`, color: theme.accent, border: `1px solid ${theme.accent}20` }}>{mapObjects.length}</span>}
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>
                            {/* Quick visible count */}
                            {mapObjects.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                {Object.entries(objTypeLabels).map(([type, info]) => { const count = mapObjects.filter(o => o.type === type).length; return count > 0 ? <span key={type} style={{ fontSize: 7, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: `${theme.accent}06`, color: theme.textDim, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 2 }}>{info.icon} {count}</span> : null; })}
                                {mapObjects.some(o => !o.visible) && <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: 'rgba(239,68,68,0.06)', color: theme.danger, border: '1px solid rgba(239,68,68,0.15)' }}>👁️ {mapObjects.filter(o => !o.visible).length} hidden</span>}
                            </div>}
                        </div>
                    </Section>
                    </div>
                    <div className={`tmap-section-wrap${dragSectionId === 'places' ? ' dragging' : ''}${dragOverId === 'places' ? ' drag-over' : ''}`} style={{ order: sectionOrder.indexOf('places') }} onDragOver={e => handleSectionDragOver(e, 'places')} onDrop={() => handleSectionDrop('places')}>
                    <Section title="Saved Places" icon={Ico.places} badge={savedPlaces.length} dragHandle={dragHandleEl('places')}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                            <button onClick={() => { setShowPlacesPanel(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, border: `1px solid ${savedPlaces.length > 0 ? theme.accent + '25' : theme.border}`, background: showPlacesPanel ? `${theme.accent}06` : savedPlaces.length > 0 ? `${theme.accent}03` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = `${theme.accent}08`; }} onMouseLeave={e => { e.currentTarget.style.background = showPlacesPanel ? `${theme.accent}06` : savedPlaces.length > 0 ? `${theme.accent}03` : 'transparent'; }}>
                                <div style={{ width: 24, height: 24, borderRadius: 5, background: `${theme.accent}08`, border: `1px solid ${theme.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>📍</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>Saved Places</div>
                                    <div style={{ fontSize: 7, color: theme.textDim }}>{savedPlaces.length} places saved</div>
                                </div>
                                {savedPlaces.length > 0 && <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${theme.accent}12`, color: theme.accent, border: `1px solid ${theme.accent}20` }}>{savedPlaces.length}</span>}
                                <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke={showPlacesPanel ? theme.accent : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>
                            {/* Quick action buttons */}
                            <div style={{ display: 'flex', gap: 3 }}>
                                <button onClick={openAddPlace} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.accent}25`, background: `${theme.accent}04`, color: theme.accent, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>+ Add Place</button>
                                <button onClick={addCurrentLocation} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>📍 Save View</button>
                            </div>
                        </div>
                    </Section>
                    </div>

                    {/* SETTINGS */}
                    <div className={`tmap-section-wrap${dragSectionId === 'workspaces' ? ' dragging' : ''}${dragOverId === 'workspaces' ? ' drag-over' : ''}`} style={{ order: sectionOrder.indexOf('workspaces') }} onDragOver={e => handleSectionDragOver(e, 'workspaces')} onDrop={() => handleSectionDrop('workspaces')}>
                    <Section title="Workspaces" icon={Ico.workspaces} badge={workspaces.length} dragHandle={dragHandleEl('workspaces')}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                            {/* Active workspace indicator */}
                            {wsActiveId && <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 5, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                                <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{workspaces.find(w => w.id === wsActiveId)?.name || 'Active'}</span>
                                <button onClick={() => { const ws = workspaces.find(w => w.id === wsActiveId); if (ws) updateWsState(ws); }} title="Update" style={{ fontSize: 7, padding: '1px 5px', borderRadius: 3, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.06)', color: theme.accent, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>💾</button>
                            </div>}
                            {/* Open panel button */}
                            <button onClick={() => { setShowWorkspacesPanel(true); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, border: `1px solid ${workspaces.length > 0 ? theme.accent + '25' : theme.border}`, background: showWorkspacesPanel ? `${theme.accent}06` : workspaces.length > 0 ? `${theme.accent}03` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = `${theme.accent}08`; }} onMouseLeave={e => { e.currentTarget.style.background = showWorkspacesPanel ? `${theme.accent}06` : workspaces.length > 0 ? `${theme.accent}03` : 'transparent'; }}>
                                <div style={{ width: 24, height: 24, borderRadius: 5, background: `${theme.accent}08`, border: `1px solid ${theme.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>📋</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>Workspaces</div>
                                    <div style={{ fontSize: 7, color: theme.textDim }}>{workspaces.length} saved{wsActiveId ? ` · ${workspaces.find(w => w.id === wsActiveId)?.name || 'Active'}` : ''}</div>
                                </div>
                                {workspaces.length > 0 && <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${theme.accent}12`, color: theme.accent, border: `1px solid ${theme.accent}20` }}>{workspaces.length}</span>}
                                <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke={showWorkspacesPanel ? theme.accent : theme.textDim} strokeWidth="2" strokeLinecap="round"><polyline points="6,4 10,8 6,12"/></svg>
                            </button>
                            {/* Quick save */}
                            <button onClick={openSaveWs} style={{ padding: '5px', borderRadius: 4, border: `1px solid ${theme.accent}25`, background: `${theme.accent}04`, color: theme.accent, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, width: '100%' }}>💾 Save Current State</button>
                        </div>
                    </Section>
                    </div>

                    {/* Save/Edit Workspace Modal */}
                    {wsModal && <div style={{ position: 'fixed' as const, inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setWsModal(null)}>
                        <div onClick={e => e.stopPropagation()} style={{ background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 14, width: '100%', maxWidth: 400, padding: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'argux-fadeIn 0.2s ease-out', overflow: 'hidden' }}>
                            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16 }}>{wsModal.mode === 'save' ? '💾' : '✏️'}</span>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{wsModal.mode === 'save' ? 'Save Workspace' : 'Edit Workspace'}</div>
                                    <div style={{ fontSize: 10, color: theme.textDim }}>{wsModal.mode === 'save' ? 'Save the current map configuration for later use' : 'Update workspace details'}</div>
                                </div>
                            </div>
                            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 10, fontWeight: 600, color: theme.textSecondary, display: 'block', marginBottom: 4 }}>Name *</label>
                                    <input value={wsForm.name} onChange={e => setWsForm({ ...wsForm, name: e.target.value })} placeholder="e.g. Morning Surveillance" autoFocus style={{ width: '100%', padding: '8px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 10, fontWeight: 600, color: theme.textSecondary, display: 'block', marginBottom: 4 }}>Description</label>
                                    <textarea value={wsForm.description} onChange={e => setWsForm({ ...wsForm, description: e.target.value })} placeholder="What is this workspace for?" rows={2} style={{ width: '100%', padding: '8px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 10, fontWeight: 600, color: theme.textSecondary, display: 'block', marginBottom: 4 }}>Tags <span style={{ fontWeight: 400, color: theme.textDim }}>(comma separated)</span></label>
                                    <input value={wsForm.tags} onChange={e => setWsForm({ ...wsForm, tags: e.target.value })} placeholder="surveillance, active, priority" style={{ width: '100%', padding: '8px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
                                </div>
                                {wsModal.mode === 'save' && <div style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)', fontSize: 9, color: theme.textDim }}>
                                    <div style={{ fontWeight: 700, color: theme.accent, marginBottom: 4 }}>State to be saved:</div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <span>📍 Viewport</span>
                                        <span>📅 Period: {dateFrom} → {dateTo}</span>
                                        <span>👤 {selectedPersons.length} persons</span>
                                        <span>🏢 {selectedOrgs.length} orgs</span>
                                        {layerLPR && <span>🚗 LPR</span>}
                                        {layerFace && <span>🧑‍🦲 Face</span>}
                                        {layerHeatmap && <span>🔥 Heatmap</span>}
                                        {layerNetwork && <span>🕸️ Network</span>}
                                        {showZones && <span>🛡️ Zones</span>}
                                        {active3D && <span>🏢 3D</span>}
                                    </div>
                                </div>}
                            </div>
                            <div style={{ padding: '12px 18px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button onClick={() => setWsModal(null)} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={saveWorkspace} disabled={!wsForm.name.trim()} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: wsForm.name.trim() ? theme.accent : theme.border, color: wsForm.name.trim() ? '#fff' : theme.textDim, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: wsForm.name.trim() ? 'pointer' : 'not-allowed', opacity: wsForm.name.trim() ? 1 : 0.5 }}>{wsModal.mode === 'save' ? '💾 Save Workspace' : '✏️ Update'}</button>
                            </div>
                        </div>
                    </div>}

                    <div className={`tmap-section-wrap${dragSectionId === 'settings' ? ' dragging' : ''}${dragOverId === 'settings' ? ' drag-over' : ''}`} style={{ order: sectionOrder.indexOf('settings') }} onDragOver={e => handleSectionDragOver(e, 'settings')} onDrop={() => handleSectionDrop('settings')}>
                    <Section title="Settings" icon={Ico.settings}  dragHandle={dragHandleEl('settings')}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                            <Toggle label="World Minimap" description="Satellite overview map in top-right" enabled={showMinimap} onChange={v => { setShowMinimap(v); triggerTopLoader(); }} />
                            <Toggle label="Compass" description="Bearing indicator in bottom-left" enabled={showCompass} onChange={v => { setShowCompass(v); triggerTopLoader(); }} />
                            <Toggle label="Map Controls" description="Zoom, fullscreen, rotation buttons" enabled={showControls} onChange={v => { setShowControls(v); triggerTopLoader(); }} />
                            <Toggle label="Show Labels" description="Place and road names on map" enabled={showLabels} onChange={v => { setShowLabels(v); triggerTopLoader(); }} />
                            <Toggle label="Show Zones" description="Display zone overlays on map" enabled={showZones} onChange={v => { setShowZones(v); triggerTopLoader(); }} />
                            <Toggle label="Show Objects" description="Display custom objects on map" enabled={showObjects} onChange={v => { setShowObjects(v); triggerTopLoader(); }} />
                            <Toggle label="Localization" description="Add local language names alongside English" enabled={showLocalization} onChange={v => { setShowLocalization(v); triggerTopLoader(); }} />
                            <Toggle label="Coordinates" description="Lat/lng, zoom and bearing bar" enabled={showCoords} onChange={v => { setShowCoords(v); triggerTopLoader(); }} />
                            <Toggle label="Place Search" description="Search bar for locations on map" enabled={showSearch} onChange={v => { setShowSearch(v); triggerTopLoader(); }} />
                            <Toggle label="FPS Counter" description="Frames per second display" enabled={showFps} onChange={v => { setShowFps(v); triggerTopLoader(); }} />
                            <Toggle label="Live Feed" description="Real-time event feed widget" enabled={showLiveFeed} onChange={v => { setShowLiveFeed(v); if (v) setLiveFeedRunning(true); triggerTopLoader(); }} />
                        </div>
                    </Section>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="tmap-container" ref={mapContainerRef}>
                {!webglFailed && <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />}

                {/* WebGL Fallback UI */}
                {webglFailed && <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', background: '#0a0e16', zIndex: 25 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 6 }}>WebGL Unavailable</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, maxWidth: 380, textAlign: 'center' as const, lineHeight: 1.6, marginBottom: 16 }}>The tactical map requires WebGL (hardware-accelerated graphics) which is not available in this browser environment. This can happen when GPU acceleration is disabled, the browser is sandboxed, or hardware does not support WebGL.</div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${theme.accent}40`, background: `${theme.accent}10`, color: theme.accent, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>↻ Retry</button>
                        <a href="/dashboard" style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 10, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>← Dashboard</a>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'rgba(255,255,255,0.02)', maxWidth: 380 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, marginBottom: 6 }}>Troubleshooting</div>
                        <div style={{ fontSize: 8, color: theme.textDim, lineHeight: 1.6 }}>
                            • Enable hardware acceleration in browser settings<br/>
                            • Check chrome://gpu for WebGL status<br/>
                            • Update GPU drivers<br/>
                            • Try a different browser (Chrome, Firefox, Edge)<br/>
                            • Ensure the browser is not running in a sandboxed or headless mode
                        </div>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
                        {[{ l: '📊 Activity', h: '/activity' }, { l: '🧑 Persons', h: '/persons' }, { l: '🎯 Operations', h: '/operations' }, { l: '📹 Vision', h: '/vision' }].map(lk => <a key={lk.h} href={lk.h} style={{ padding: '5px 10px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8 }}>{lk.l}</a>)}
                    </div>
                </div>}

                {/* Top Loader Bar */}
                {topLoader > 0 && <div style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, height: 3, zIndex: 60, overflow: 'hidden', background: 'transparent' }}>
                    <div style={{ height: '100%', width: `${topLoader}%`, background: `linear-gradient(90deg, ${theme.accent}, #8b5cf6, #ec4899)`, borderRadius: '0 2px 2px 0', transition: topLoader === 100 ? 'width 0.2s ease-out, opacity 0.4s ease-out' : 'width 0.3s ease-out', opacity: topLoader === 100 ? 0 : 1, boxShadow: `0 0 10px ${theme.accent}60, 0 0 4px ${theme.accent}40` }}>
                        <div style={{ position: 'absolute' as const, right: 0, top: 0, width: 60, height: '100%', background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3))`, animation: 'tmap-loader-shimmer 0.8s ease-in-out infinite' }} />
                    </div>
                </div>}

                {/* Loading */}
                {!loaded && <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', background: '#0a0e16', zIndex: 20 }}>
                    {/* Animated rings */}
                    <div style={{ position: 'relative' as const, width: 120, height: 120, marginBottom: 20 }}>
                        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute' as const, inset: 0, animation: 'argux-spin 3s linear infinite' }}>
                            <circle cx="60" cy="60" r="54" fill="none" stroke={theme.border} strokeWidth="1" />
                            <circle cx="60" cy="60" r="54" fill="none" stroke={theme.accent} strokeWidth="2" strokeDasharray="40 300" strokeLinecap="round" />
                        </svg>
                        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute' as const, inset: 0, animation: 'argux-spin 2s linear infinite reverse' }}>
                            <circle cx="60" cy="60" r="44" fill="none" stroke={theme.border} strokeWidth="0.5" />
                            <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5" strokeDasharray="25 250" strokeLinecap="round" />
                        </svg>
                        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute' as const, inset: 0, animation: 'argux-spin 5s linear infinite' }}>
                            <circle cx="60" cy="60" r="34" fill="none" stroke={theme.border} strokeWidth="0.5" />
                            <circle cx="60" cy="60" r="34" fill="none" stroke="rgba(34,197,94,0.5)" strokeWidth="1" strokeDasharray="15 200" strokeLinecap="round" />
                        </svg>
                        {/* Center crosshair */}
                        <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
                                <circle cx="14" cy="14" r="4" /><line x1="14" y1="2" x2="14" y2="8" /><line x1="14" y1="20" x2="14" y2="26" /><line x1="2" y1="14" x2="8" y2="14" /><line x1="20" y1="14" x2="26" y2="14" />
                            </svg>
                        </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, letterSpacing: '0.1em', marginBottom: 6 }}>TACTICAL MAP</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 16 }}>Initializing MapLibre GL JS</div>
                    {/* Progress steps */}
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6, alignItems: 'flex-start' }}>
                        {['Loading map engine', 'Fetching tile sources', 'Configuring overlays'].map((step, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, animation: `argux-fadeIn 0.4s ease-out ${i * 0.3}s both` }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', border: `1.5px solid ${theme.accent}`, background: theme.accentDim, animation: 'argux-spin 1.5s linear infinite', animationDelay: `${i * 0.2}s` }} />
                                <span style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{step}...</span>
                            </div>
                        ))}
                    </div>
                </div>}

                {/* TOP-LEFT: Place Search */}
                {showSearch && loaded && <div ref={searchRef} style={{ position: 'absolute' as const, top: 10, left: 10, zIndex: 15, width: 'min(380px, calc(100vw - 20px))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(13,18,32,0.94)', border: `1px solid ${searchFocused ? theme.accent + '60' : theme.border}`, borderRadius: searchFocused && searchResults.length > 0 ? '8px 8px 0 0' : '8px', padding: '0 10px', backdropFilter: 'blur(10px)', transition: 'border-color 0.15s, border-radius 0.15s', boxShadow: searchFocused ? '0 4px 20px rgba(0,0,0,0.4)' : 'none' }}>
                        {searchLoading ? <div style={{ width: 13, height: 13, border: `2px solid ${theme.border}`, borderTop: `2px solid ${theme.accent}`, borderRadius: '50%', animation: 'argux-spin 0.6s linear infinite', flexShrink: 0 }} /> : <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={searchFocused ? theme.accent : theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>}
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setSearchFocused(true)} placeholder="Search entities, places, coordinates..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} onKeyDown={e => { if (e.key === 'Escape') { setSearchQuery(''); setSearchFocused(false); } if (e.key === 'Enter' && searchResults.length > 0) handleSearchSelect(searchResults[0]); }} />
                        {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', display: 'flex', padding: 2 }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}
                        {/* Keyboard shortcut hint */}
                        {!searchFocused && !searchQuery && <span style={{ fontSize: 8, color: theme.textDim, padding: '1px 5px', borderRadius: 3, background: `${theme.border}40`, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>/</span>}
                    </div>
                    {/* Category filter chips */}
                    {searchFocused && searchQuery.length >= 2 && <div style={{ display: 'flex', gap: 3, padding: '6px 10px', background: 'rgba(13,18,32,0.94)', borderLeft: `1px solid ${theme.accent}60`, borderRight: `1px solid ${theme.accent}60`, backdropFilter: 'blur(10px)' }}>
                        {[{ id: 'all' as const, label: 'All', icon: '🔍' }, { id: 'entities' as const, label: 'Entities', icon: '👤' }, { id: 'places' as const, label: 'Places', icon: '📍' }, { id: 'coords' as const, label: 'Coords', icon: '🎯' }].map(c => <button key={c.id} onClick={() => setSearchCategory(c.id)} style={{ padding: '2px 7px', borderRadius: 4, border: `1px solid ${searchCategory === c.id ? theme.accent + '40' : 'transparent'}`, background: searchCategory === c.id ? `${theme.accent}08` : 'transparent', color: searchCategory === c.id ? theme.accent : theme.textDim, fontSize: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}>{c.icon} {c.label}</button>)}
                    </div>}
                    {/* Results dropdown */}
                    {searchFocused && searchResults.length > 0 && <div style={{ background: 'rgba(13,18,32,0.95)', border: `1px solid ${theme.accent}60`, borderTop: `1px solid ${theme.border}30`, borderRadius: '0 0 8px 8px', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', maxHeight: 400, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                        {/* Group results by category */}
                        {(() => {
                            const groups: Record<string, SearchResult[]> = {};
                            const catFilter = searchCategory;
                            searchResults.forEach(r => {
                                if (catFilter === 'entities' && !['person', 'org', 'vehicle', 'device'].includes(r.category)) return;
                                if (catFilter === 'places' && !['saved', 'zone', 'geo'].includes(r.category)) return;
                                if (catFilter === 'coords' && r.category !== 'coord') return;
                                const key = r.category === 'person' ? 'Persons' : r.category === 'org' ? 'Organizations' : r.category === 'vehicle' ? 'Vehicles' : r.category === 'device' ? 'Devices' : r.category === 'saved' ? 'Saved Places' : r.category === 'zone' ? 'Zones' : r.category === 'coord' ? 'Coordinates' : 'Places';
                                if (!groups[key]) groups[key] = [];
                                groups[key].push(r);
                            });
                            return Object.entries(groups).map(([groupName, items]) => <div key={groupName}>
                                <div style={{ padding: '5px 12px', fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.1em', background: 'rgba(255,255,255,0.015)', borderBottom: `1px solid ${theme.border}20` }}>{groupName} <span style={{ fontWeight: 400, fontSize: 7, opacity: 0.7 }}>({items.length})</span></div>
                                {items.map(r => (
                                    <div key={r.id} onClick={() => handleSearchSelect(r)} style={{ padding: '7px 12px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}10`, transition: 'background 0.1s', display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                        {/* Icon or avatar */}
                                        {r.avatar ? <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${r.color}`, background: `url(${r.avatar}) center/cover`, flexShrink: 0 }} /> : <div style={{ width: 24, height: 24, borderRadius: r.category === 'person' ? '50%' : 5, background: `${r.color}12`, border: `1px solid ${r.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>{r.icon}</div>}
                                        {/* Text */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.name}</div>
                                            <div style={{ fontSize: 8, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.sub}</div>
                                        </div>
                                        {/* Risk badge for persons */}
                                        {r.risk && <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: `${r.color}12`, color: r.color, border: `1px solid ${r.color}20`, flexShrink: 0 }}>{r.risk}</span>}
                                        {/* Coordinates */}
                                        <span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{r.lat.toFixed(2)},{r.lng.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>);
                        })()}
                        {/* Footer */}
                        <div style={{ padding: '5px 12px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 8, color: theme.textDim }}>
                            <span>{searchResults.length} results{searchLoading ? ' · searching...' : ''}</span>
                            <span>Typesense + Nominatim</span>
                        </div>
                    </div>}
                    {/* Empty state */}
                    {searchFocused && !searchLoading && searchQuery.trim().length >= 2 && searchResults.length === 0 && <div style={{ background: 'rgba(13,18,32,0.95)', border: `1px solid ${theme.accent}60`, borderTop: `1px solid ${theme.border}30`, borderRadius: '0 0 8px 8px', padding: '16px 14px', textAlign: 'center' as const, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                        <div style={{ fontSize: 18, marginBottom: 6 }}>🔍</div>
                        <div style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 600, marginBottom: 2 }}>No results for "{searchQuery}"</div>
                        <div style={{ fontSize: 9, color: theme.textDim }}>Try a person name, plate number, device ID, or address</div>
                    </div>}
                    {/* Loading state */}
                    {searchFocused && searchLoading && searchResults.length === 0 && <div style={{ background: 'rgba(13,18,32,0.95)', border: `1px solid ${theme.accent}60`, borderTop: `1px solid ${theme.border}30`, borderRadius: '0 0 8px 8px', padding: '14px', textAlign: 'center' as const, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <div style={{ width: 12, height: 12, border: `2px solid ${theme.border}`, borderTop: `2px solid ${theme.accent}`, borderRadius: '50%', animation: 'argux-spin 0.6s linear infinite' }} />
                        <span style={{ fontSize: 11, color: theme.textDim }}>Searching entities & places...</span>
                    </div>}
                    {/* Quick tips when focused but no query */}
                    {searchFocused && searchQuery.length < 2 && <div style={{ marginTop: 4, background: 'rgba(13,18,32,0.95)', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Search across</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                            {[{ icon: '👤', label: 'Persons', desc: 'Name, nickname', color: '#ef4444' }, { icon: '🏢', label: 'Organizations', desc: 'Company name', color: '#3b82f6' }, { icon: '🚗', label: 'Vehicles', desc: 'Plate number', color: '#10b981' }, { icon: '📡', label: 'Devices', desc: 'Device label, ID', color: '#22c55e' }, { icon: '⭐', label: 'Saved Places', desc: 'Bookmarked locations', color: '#f59e0b' }, { icon: '🛡️', label: 'Zones', desc: 'Geofence zones', color: '#8b5cf6' }, { icon: '📍', label: 'Addresses', desc: 'Cities, streets', color: theme.accent }, { icon: '🎯', label: 'Coordinates', desc: '45.81, 15.97', color: '#22c55e' }].map(h => <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 4 }}>
                                <span style={{ fontSize: 11 }}>{h.icon}</span>
                                <div><div style={{ fontSize: 9, fontWeight: 600, color: h.color }}>{h.label}</div><div style={{ fontSize: 7, color: theme.textDim }}>{h.desc}</div></div>
                            </div>)}
                        </div>
                    </div>}
                </div>}

                {/* TOP-RIGHT: Minimap */}
                {showMinimap && loaded && !webglFailed && <div style={{ position: 'absolute' as const, top: 10, right: 10, zIndex: 5 }}><Minimap center={coords} zoom={zoom} onNavigate={handleMinimapNav} /></div>}

                {/* BOTTOM-LEFT: Compass */}
                {showCompass && loaded && <div style={{ position: 'absolute' as const, bottom: 60, left: 12, zIndex: 5 }}><Compass bearing={bearing} /></div>}

                {/* BOTTOM-RIGHT: Map Controls */}
                {showControls && loaded && <div style={{ position: 'absolute' as const, bottom: 30, right: 12, zIndex: 5, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                    <MapBtn onClick={handleZoomIn} title="Zoom In"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="4" x2="8" y2="12"/><line x1="4" y1="8" x2="12" y2="8"/></svg></MapBtn>
                    <MapBtn onClick={handleZoomOut} title="Zoom Out"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="8" x2="12" y2="8"/></svg></MapBtn>
                    <div style={{ height: 1, background: theme.border, margin: '2px 4px' }} />
                    <MapBtn onClick={handleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} active={isFullscreen}>{isFullscreen ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="6,2 6,6 2,6"/><polyline points="10,14 10,10 14,10"/><polyline points="14,6 10,6 10,2"/><polyline points="2,10 6,10 6,14"/></svg> : <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="2,6 2,2 6,2"/><polyline points="14,10 14,14 10,14"/><polyline points="10,2 14,2 14,6"/><polyline points="6,14 2,14 2,10"/></svg>}</MapBtn>
                    <div style={{ height: 1, background: theme.border, margin: '2px 4px' }} />
                    <MapBtn onClick={handleRotateCCW} title="Rotate Left"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 7a5 5 0 019 1"/><polyline points="2,4 4,7 7,5"/></svg></MapBtn>
                    <MapBtn onClick={handleResetNorth} title="Reset North" active={Math.abs(bearing) > 1}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="8,2 13,14 8,10 3,14"/></svg></MapBtn>
                    <MapBtn onClick={handleRotateCW} title="Rotate Right"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 7a5 5 0 00-9 1"/><polyline points="14,4 12,7 9,5"/></svg></MapBtn>
                    <div style={{ height: 1, background: theme.border, margin: '2px 4px' }} />
                    <MapBtn onClick={() => setShowExportModal(true)} title="Export / Share (E)" active={showExportModal}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 12v2h8v-2"/><path d="M8 2v8"/><polyline points="5,5 8,2 11,5"/></svg></MapBtn>
                </div>}

                {/* Timeline Toggle */}
                {loaded && <button onClick={() => { setTimelineOpen(!timelineOpen); if (!timelineOpen) { setTimelineCursor(100); setTlTrackingPerson(null); setTlTrackStep(-1); } setTimelinePlaying(false); }} style={{ position: 'absolute' as const, bottom: timelineOpen ? 282 : (showCoords ? 36 : 10), left: '50%', transform: 'translateX(-50%)', zIndex: 15, background: timelineOpen ? 'rgba(59,130,246,0.15)' : 'rgba(13,18,32,0.9)', border: `1px solid ${timelineOpen ? '#3b82f650' : theme.border}`, borderRadius: 8, padding: '6px 14px', cursor: 'pointer', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 6, transition: 'bottom 0.3s ease, background 0.2s', fontFamily: 'inherit' }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={timelineOpen ? '#3b82f6' : theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><polyline points="8,5 8,8 11,8"/></svg>
                    <span style={{ fontSize: 10, fontWeight: 700, color: timelineOpen ? '#3b82f6' : theme.textDim }}>Timeline</span>
                    {timelineActive && <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: 3, background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f630' }}>ACTIVE</span>}
                    {tlTrackingPerson && <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: 3, background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e30' }}>TRACKING</span>}
                    {(dateFrom || dateTo) && <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: 3, background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b30' }}>PERIOD</span>}
                </button>}

                {/* Timeline Panel */}
                {timelineOpen && loaded && <div style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, zIndex: 12, background: 'rgba(10,14,22,0.96)', borderTop: `1px solid ${theme.border}`, backdropFilter: 'blur(12px)' }}>
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
                        <div style={{ width: 110, borderRight: `1px solid ${theme.border}20`, padding: '4px 8px', display: 'flex', flexDirection: 'column' as const, gap: 2, flexShrink: 0, overflowY: 'auto' }}>
                            <div style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 1 }}>Types</div>
                            {[{ id: 'lpr', icon: '🚗', label: 'LPR', color: '#10b981' }, { id: 'face', icon: '🧑‍🦲', label: 'Face', color: '#ec4899' }, { id: 'source', icon: '📡', label: 'Sources', color: '#3b82f6' }, { id: 'zone', icon: '🛡️', label: 'Zones', color: '#f59e0b' }, { id: 'object', icon: '📌', label: 'Objects', color: '#8b5cf6' }].map(f => {
                                const on = tlFilterTypes.has(f.id); const count = periodFilteredEvents.filter(e => e.type === f.id).length;
                                return <button key={f.id} onClick={() => toggleTlFilter(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 5px', borderRadius: 3, border: `1px solid ${on ? f.color + '40' : theme.border}`, background: on ? f.color + '08' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const }}><span style={{ fontSize: 9 }}>{f.icon}</span><span style={{ fontSize: 8, fontWeight: 600, color: on ? f.color : theme.textDim, flex: 1 }}>{f.label}</span><span style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{count}</span></button>;
                            })}
                            {tlPersonIds.size > 0 && <div style={{ marginTop: 4, paddingTop: 4, borderTop: `1px solid ${theme.border}20` }}>
                                <div style={{ fontSize: 7, fontWeight: 700, color: '#ec4899', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 2 }}>Persons</div>
                                {Array.from(tlPersonIds).map(pid => { const p = tlPersonOptions.find(x => x.id === pid); return p ? <div key={pid} style={{ fontSize: 7, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 3, marginBottom: 1 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ec4899', flexShrink: 0 }} />{p.name}<button onClick={() => toggleTlPerson(pid)} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: 8, padding: 0, marginLeft: 'auto' }}>×</button></div> : null; })}
                            </div>}
                        </div>

                        {/* Person panel (toggleable) */}
                        {tlShowPersonPanel && <div style={{ width: 160, borderRight: `1px solid ${theme.border}20`, padding: '4px 8px', overflowY: 'auto', flexShrink: 0 }}>
                            <div style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 3 }}>Filter / Track Person</div>
                            {tlPersonOptions.map(p => {
                                const isFiltered = tlPersonIds.has(p.id);
                                const isTracking = tlTrackingPerson === p.id;
                                const evtCount = filteredTLEvents.filter(e => e.personId === p.id).length;
                                const avatar = mockPersons.find(x => x.id === p.id)?.avatar;
                                return <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 4px', borderRadius: 4, marginBottom: 2, background: isTracking ? 'rgba(34,197,94,0.08)' : isFiltered ? 'rgba(236,72,153,0.06)' : 'transparent', border: `1px solid ${isTracking ? '#22c55e30' : isFiltered ? '#ec489920' : 'transparent'}` }}>
                                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: avatar ? `url(${avatar}) center/cover` : 'rgba(59,130,246,0.15)', border: `1.5px solid ${isFiltered ? '#ec4899' : theme.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>{avatar ? '' : '👤'}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 8, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.name}</div>
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
                            {visibleTLEvents.length === 0 && <div style={{ padding: 16, textAlign: 'center' as const, fontSize: 10, color: theme.textDim }}>No events at this time position.{timelineCursor >= 100 ? ' Use the slider or press Play.' : ' Drag slider forward.'}</div>}
                            {[...visibleTLEvents].reverse().slice(0, 60).map((ev, idx) => {
                                const sevColor = ev.sev === 'critical' ? '#ef4444' : ev.sev === 'high' ? '#f97316' : ev.sev === 'medium' ? '#f59e0b' : ev.sev === 'low' ? '#6b7280' : '#3b82f6';
                                const isTrackEv = tlTrackingPerson && ev.personId === tlTrackingPerson;
                                const hasThumb = ev.type === 'face' || ev.type === 'lpr';
                                return <div key={ev.id + idx} onClick={() => { const map = mapRef.current; if (map) map.flyTo({ center: [ev.lng, ev.lat], zoom: Math.max(map.getZoom(), 15), duration: 600 }); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}10`, transition: 'background 0.1s', background: isTrackEv ? 'rgba(34,197,94,0.04)' : 'transparent' }} onMouseEnter={e => (e.currentTarget.style.background = isTrackEv ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)')} onMouseLeave={e => (e.currentTarget.style.background = isTrackEv ? 'rgba(34,197,94,0.04)' : 'transparent')}>
                                    <div style={{ width: 3, height: hasThumb ? 28 : 20, borderRadius: 2, background: sevColor, flexShrink: 0 }} />
                                    {hasThumb ? <div style={{ width: 24, height: 24, borderRadius: ev.type === 'face' ? '50%' : 4, overflow: 'hidden', border: `1.5px solid ${ev.color}`, flexShrink: 0 }}><img src={ev.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div> : <span style={{ fontSize: 12, flexShrink: 0, width: 24, textAlign: 'center' as const }}>{ev.icon}</span>}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 9, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {ev.title}
                                            <span style={{ fontSize: 7, fontWeight: 700, padding: '0 3px', borderRadius: 2, background: `${sevColor}15`, color: sevColor, border: `1px solid ${sevColor}25`, flexShrink: 0 }}>{ev.sev === 'critical' ? '!!!' : ev.sev === 'high' ? '!!' : ev.sev === 'medium' ? '!' : ''}</span>
                                        </div>
                                        <div style={{ fontSize: 7, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{ev.sub}</div>
                                    </div>
                                    {ev.personName && <span style={{ fontSize: 7, color: '#ec4899', flexShrink: 0, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{ev.personName}</span>}
                                    <span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, whiteSpace: 'nowrap' as const }}>{ev.ts.split(' ')[1]}</span>
                                </div>;
                            })}
                        </div>
                    </div>
                </div>}

                {/* Live Tracker Panel */}
                {showLiveTracker && loaded && <div data-panel="tracker" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('tracker' as PanelId); }} style={panelStyle('tracker', '360px', liveTrackSessions.length > 0 ? '#22c55e' : theme.border)}>
                    <PanelHeader id="tracker" icon="🎯" title="Live Tracker" subtitle={liveTrackSessions.length > 0 ? `${liveTrackSessions.filter(s => s.status === 'tracking').length} tracking · ${trackablePersons.length} available` : `${trackablePersons.length} targets available`} color="#22c55e" onClose={() => setShowLiveTracker(false)} />
                    <PanelResizeGrip id="tracker" />

                    {!isPanelMin('tracker') && <>{/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}20`, flexShrink: 0 }}>
                        {[{ id: 'sessions' as const, label: 'Sessions', count: liveTrackSessions.length }, { id: 'targets' as const, label: 'Targets', count: trackablePersons.length }, { id: 'history' as const, label: 'History', count: 0 }].map(t => <button key={t.id} onClick={() => setLiveTrackTab(t.id)} style={{ flex: 1, padding: '7px 0', background: 'transparent', border: 'none', borderBottom: `2px solid ${liveTrackTab === t.id ? '#22c55e' : 'transparent'}`, color: liveTrackTab === t.id ? '#22c55e' : theme.textDim, fontSize: 9, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>{t.label}{t.count > 0 && <span style={{ fontSize: 7, fontWeight: 800, padding: '0 3px', borderRadius: 3, background: liveTrackTab === t.id ? '#22c55e15' : `${theme.border}`, color: liveTrackTab === t.id ? '#22c55e' : theme.textDim }}>{t.count}</span>}</button>)}
                    </div>

                    {/* Display toggles */}
                    {liveTrackSessions.length > 0 && <div style={{ display: 'flex', gap: 3, padding: '6px 14px', borderBottom: `1px solid ${theme.border}15`, flexShrink: 0, flexWrap: 'wrap' }}>
                        <button onClick={() => { setLiveTrackShowTrails(!liveTrackShowTrails); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: `1px solid ${liveTrackShowTrails ? '#22c55e30' : theme.border}`, background: liveTrackShowTrails ? '#22c55e08' : 'transparent', color: liveTrackShowTrails ? '#22c55e' : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>🛤️ Trails</button>
                        <button onClick={() => { setLiveTrackShowLabels(!liveTrackShowLabels); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: `1px solid ${liveTrackShowLabels ? '#3b82f630' : theme.border}`, background: liveTrackShowLabels ? '#3b82f608' : 'transparent', color: liveTrackShowLabels ? '#3b82f6' : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>🏷️ Labels</button>
                        <button onClick={() => { setLiveTrackShowRadius(!liveTrackShowRadius); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: `1px solid ${liveTrackShowRadius ? '#f59e0b30' : theme.border}`, background: liveTrackShowRadius ? '#f59e0b08' : 'transparent', color: liveTrackShowRadius ? '#f59e0b' : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>⭕ Accuracy</button>
                        {liveTrackSessions.length > 1 && <button onClick={stopAllLiveTracks} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', color: theme.danger, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, marginLeft: 'auto' }}>✕ Stop All</button>}
                    </div>}

                    {/* Tab content */}
                    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>

                        {/* Sessions tab */}
                        {liveTrackTab === 'sessions' && <>
                            {liveTrackSessions.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const }}>
                                <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>No Active Sessions</div>
                                <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 12 }}>Go to Targets tab to start tracking a person via GPS or phone locator.</div>
                                <button onClick={() => setLiveTrackTab('targets')} style={{ padding: '6px 16px', borderRadius: 5, border: '1px solid #22c55e30', background: 'rgba(34,197,94,0.06)', color: '#22c55e', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Browse Targets →</button>
                            </div>}
                            {liveTrackSessions.map(s => {
                                const statColor = s.status === 'tracking' ? '#22c55e' : s.status === 'paused' ? '#f59e0b' : '#ef4444';
                                const riskColor = s.risk === 'Critical' ? '#ef4444' : s.risk === 'High' ? '#f97316' : '#f59e0b';
                                const isFollowing = liveTrackFollow === s.id;
                                const dur = s.positions.length > 1 ? Math.round((Date.now() - s.positions[0].ts) / 1000) : 0;
                                const durStr = dur >= 3600 ? `${Math.floor(dur / 3600)}h ${Math.floor((dur % 3600) / 60)}m` : dur >= 60 ? `${Math.floor(dur / 60)}m ${dur % 60}s` : `${dur}s`;
                                const distStr = s.distance >= 1000 ? `${(s.distance / 1000).toFixed(2)} km` : `${Math.round(s.distance)} m`;
                                const batColor = s.battery > 60 ? '#22c55e' : s.battery > 20 ? '#f59e0b' : '#ef4444';
                                const sigColor = s.signal > 70 ? '#22c55e' : s.signal > 30 ? '#f59e0b' : '#ef4444';
                                const last = s.positions[s.positions.length - 1];
                                return <div key={s.id} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}10`, background: isFollowing ? `${s.color}04` : 'transparent' }}>
                                    {/* Person header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2.5px solid ${s.color}`, background: `url(${s.personAvatar}) center/cover`, flexShrink: 0, cursor: 'pointer' }} onClick={() => { if (last && mapRef.current) mapRef.current.flyTo({ center: [last.lng, last.lat], zoom: 16, duration: 800 }); }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{s.personName} {s.personLastName} <span style={{ fontWeight: 400, color: theme.textDim, fontSize: 9 }}>({s.personNickname})</span></div>
                                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 1 }}>
                                                <span style={{ fontSize: 7, fontWeight: 800, padding: '1px 5px', borderRadius: 3, background: `${statColor}15`, color: statColor, border: `1px solid ${statColor}25` }}>{s.status === 'tracking' ? '● TRACKING' : s.status === 'paused' ? '⏸ PAUSED' : '✕ SIGNAL LOST'}</span>
                                                <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: `${riskColor}12`, color: riskColor, border: `1px solid ${riskColor}20` }}>{s.risk}</span>
                                                <span style={{ fontSize: 7, fontWeight: 600, color: s.sourceType === 'gps' ? '#22c55e' : '#06b6d4' }}>{s.sourceType === 'gps' ? '📡 GPS' : '📍 Phone'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Stats grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 8px', fontSize: 8, marginBottom: 6 }}>
                                        <div><span style={{ color: theme.textDim }}>Speed</span><div style={{ fontWeight: 700, color: s.speed > 80 ? '#ef4444' : s.speed > 40 ? '#f59e0b' : '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>{s.speed} km/h</div></div>
                                        <div><span style={{ color: theme.textDim }}>Heading</span><div style={{ fontWeight: 700, color: theme.text }}>{s.heading}</div></div>
                                        <div><span style={{ color: theme.textDim }}>Distance</span><div style={{ fontWeight: 700, color: theme.text }}>{distStr}</div></div>
                                        <div><span style={{ color: theme.textDim }}>Duration</span><div style={{ fontWeight: 700, color: theme.text }}>{durStr}</div></div>
                                        <div><span style={{ color: theme.textDim }}>Accuracy</span><div style={{ fontWeight: 700, color: theme.text }}>{s.accuracy}m</div></div>
                                        <div><span style={{ color: theme.textDim }}>Signal</span><div style={{ fontWeight: 700, color: sigColor }}>{s.signal}%</div></div>
                                        <div><span style={{ color: theme.textDim }}>Battery</span><div style={{ fontWeight: 700, color: batColor }}>{s.battery}%</div></div>
                                        <div><span style={{ color: theme.textDim }}>Points</span><div style={{ fontWeight: 700, color: theme.text }}>{s.positions.length}</div></div>
                                    </div>
                                    {/* Battery + Signal bars */}
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                                        <div style={{ flex: 1 }}><div style={{ fontSize: 7, color: theme.textDim, marginBottom: 2 }}>🔋 Battery</div><div style={{ height: 4, borderRadius: 2, background: theme.border, overflow: 'hidden' }}><div style={{ width: `${s.battery}%`, height: '100%', background: batColor, borderRadius: 2, transition: 'width 0.5s' }} /></div></div>
                                        <div style={{ flex: 1 }}><div style={{ fontSize: 7, color: theme.textDim, marginBottom: 2 }}>📶 Signal</div><div style={{ height: 4, borderRadius: 2, background: theme.border, overflow: 'hidden' }}><div style={{ width: `${s.signal}%`, height: '100%', background: sigColor, borderRadius: 2, transition: 'width 0.5s' }} /></div></div>
                                    </div>
                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button onClick={() => { if (last && mapRef.current) mapRef.current.flyTo({ center: [last.lng, last.lat], zoom: 17, duration: 800 }); }} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${s.color}25`, background: `${s.color}06`, color: s.color, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>📍 Locate</button>
                                        <button onClick={() => setLiveTrackFollow(isFollowing ? null : s.id)} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${isFollowing ? s.color + '40' : theme.border}`, background: isFollowing ? `${s.color}10` : 'transparent', color: isFollowing ? s.color : theme.textDim, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>{isFollowing ? '🎯 Following' : '🎯 Follow'}</button>
                                        <button onClick={() => togglePauseLiveTrack(s.id)} style={{ padding: '5px 8px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{s.status === 'tracking' ? '⏸' : '▶'}</button>
                                        <button onClick={() => stopLiveTrack(s.id)} style={{ padding: '5px 8px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', color: theme.danger, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
                                    </div>
                                </div>;
                            })}
                        </>}

                        {/* Targets tab */}
                        {liveTrackTab === 'targets' && <div style={{ padding: '8px 14px' }}>
                            <input value={liveTrackSearch} onChange={e => setLiveTrackSearch(e.target.value)} placeholder="Search persons..." style={{ padding: '6px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${liveTrackSearch ? '#22c55e50' : theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', outline: 'none', width: '100%', marginBottom: 8 }} />
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                                {trackablePersons.filter(tp => { if (liveTrackSearch.trim()) { const q = liveTrackSearch.toLowerCase(); return tp.personName.toLowerCase().includes(q) || tp.personLastName.toLowerCase().includes(q) || tp.personNickname.toLowerCase().includes(q); } return true; }).map(tp => {
                                    const isActive = liveTrackSessions.some(s => s.personId === tp.personId && s.sourceType === tp.sourceType);
                                    const riskColor = tp.risk === 'Critical' ? '#ef4444' : tp.risk === 'High' ? '#f97316' : '#f59e0b';
                                    const batColor = tp.battery > 60 ? '#22c55e' : tp.battery > 20 ? '#f59e0b' : '#ef4444';
                                    return <div key={`${tp.personId}-${tp.sourceType}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, border: `1px solid ${isActive ? '#22c55e20' : theme.border}`, background: isActive ? 'rgba(34,197,94,0.03)' : 'transparent' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${riskColor}`, background: tp.personAvatar ? `url(${tp.personAvatar}) center/cover` : 'rgba(13,18,32,0.9)', flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{tp.personName} {tp.personLastName}</div>
                                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 1 }}>
                                                <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: `${riskColor}12`, color: riskColor, border: `1px solid ${riskColor}20` }}>{tp.risk}</span>
                                                <span style={{ fontSize: 7, color: tp.sourceType === 'gps' ? '#22c55e' : '#06b6d4', fontWeight: 600 }}>{tp.sourceType === 'gps' ? '📡 GPS' : '📍 Phone'}</span>
                                                <span style={{ fontSize: 7, color: tp.status === 'online' ? '#22c55e' : tp.status === 'degraded' ? '#f59e0b' : '#6b7280' }}>● {tp.status}</span>
                                                <span style={{ fontSize: 7, color: batColor }}>🔋{tp.battery}%</span>
                                            </div>
                                        </div>
                                        {isActive ? <span style={{ fontSize: 8, fontWeight: 700, color: '#22c55e', padding: '3px 8px', borderRadius: 4, background: '#22c55e10', border: '1px solid #22c55e20' }}>ACTIVE</span> : <button onClick={() => { startLiveTrack(tp); setLiveTrackTab('sessions'); triggerTopLoader(); }} disabled={tp.status === 'offline'} style={{ padding: '4px 10px', borderRadius: 4, border: `1px solid ${tp.status === 'offline' ? theme.border : '#22c55e30'}`, background: tp.status === 'offline' ? 'transparent' : 'rgba(34,197,94,0.08)', color: tp.status === 'offline' ? theme.textDim : '#22c55e', fontSize: 9, fontWeight: 700, cursor: tp.status === 'offline' ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: tp.status === 'offline' ? 0.5 : 1 }}>▶ Track</button>}
                                    </div>;
                                })}
                            </div>
                        </div>}

                        {/* History tab */}
                        {liveTrackTab === 'history' && <div style={{ padding: 30, textAlign: 'center' as const }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>Tracking History</div>
                            <div style={{ fontSize: 10, color: theme.textDim }}>Past tracking sessions will appear here. Export routes and analysis reports.</div>
                        </div>}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: liveTrackSessions.filter(s => s.status === 'tracking').length > 0 ? '#22c55e' : '#6b7280', boxShadow: liveTrackSessions.filter(s => s.status === 'tracking').length > 0 ? '0 0 6px #22c55e60' : 'none' }} />
                        <span style={{ fontSize: 8, color: liveTrackSessions.filter(s => s.status === 'tracking').length > 0 ? '#22c55e' : theme.textDim, fontWeight: 600 }}>{liveTrackSessions.filter(s => s.status === 'tracking').length > 0 ? `${liveTrackSessions.filter(s => s.status === 'tracking').length} live` : 'Idle'}</span>
                        <span style={{ fontSize: 8, color: theme.textDim }}>·</span>
                        <span style={{ fontSize: 8, color: theme.textDim }}>{trackablePersons.filter(t => t.status === 'online').length}/{trackablePersons.length} online</span>
                        <div style={{ flex: 1 }} />
                        <span style={{ fontSize: 7, color: theme.textDim }}>WS: <span style={{ color: liveTrackSessions.length > 0 ? '#22c55e' : '#6b7280', fontWeight: 700 }}>ws://argux.local:6002</span></span>
                    </div>
                </>}
                </div>}

                {/* ═══ EVENT CORRELATION PANEL ═══ */}
                {showCorrelationPanel && loaded && <div data-panel="correlation" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('correlation' as PanelId); }} style={panelStyle('correlation', '400px', '#f59e0b')}>
                    <PanelHeader id="correlation" icon="🔗" title="Event Correlation" subtitle={corrResults ? `${corrResults.length} co-locations · ${corrStats?.uniquePairs || 0} pairs` : 'Configure and run co-location analysis'} color="#f59e0b" onClose={() => setShowCorrelationPanel(false)} extra={corrResults ? <button onClick={() => { setCorrResults(null); setCorrSelectedEvent(null); }} style={{ padding: '3px 8px', borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>✕ Clear</button> : undefined} />
                    <PanelResizeGrip id="correlation" />

                    {!isPanelMin('correlation') && <>
                    {/* Config section */}
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}15`, flexShrink: 0, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                        {/* Subject selectors */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Subject A</div>
                                <select value={corrSubjectA} onChange={e => setCorrSubjectA(e.target.value)} style={{ width: '100%', padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${corrSubjectA ? '#f59e0b40' : theme.border}`, borderRadius: 5, fontSize: 10, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                                    <option value="">All persons</option>
                                    {corrPersonOptions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', padding: '0 0 6px', color: '#f59e0b', fontSize: 10, fontWeight: 700 }}>↔</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Subject B</div>
                                <select value={corrSubjectB} onChange={e => setCorrSubjectB(e.target.value)} style={{ width: '100%', padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${corrSubjectB ? '#f59e0b40' : theme.border}`, borderRadius: 5, fontSize: 10, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                                    <option value="">All persons</option>
                                    {corrPersonOptions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Threshold controls */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Radius</span><span style={{ fontSize: 9, fontWeight: 700, color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>{corrRadius}m</span></div>
                                <input type="range" min={10} max={500} step={10} value={corrRadius} onChange={e => setCorrRadius(parseInt(e.target.value))} style={{ width: '100%', height: 4, accentColor: '#f59e0b' }} />
                            </div>
                            <div style={{ width: 90 }}>
                                <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Window</div>
                                <select value={corrTimeWindow} onChange={e => setCorrTimeWindow(e.target.value)} style={{ width: '100%', padding: '5px 6px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 5, fontSize: 10, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                                    <option value="24h">24 hours</option>
                                    <option value="7d">7 days</option>
                                    <option value="30d">30 days</option>
                                    <option value="90d">90 days</option>
                                    <option value="all">All time</option>
                                </select>
                            </div>
                        </div>
                        {/* Run button */}
                        <button onClick={runCorrelation} disabled={corrRunning} style={{ padding: '8px', borderRadius: 6, border: 'none', background: corrRunning ? theme.border : 'linear-gradient(135deg, #f59e0b, #d97706)', color: corrRunning ? theme.textDim : '#fff', fontSize: 11, fontWeight: 800, cursor: corrRunning ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, letterSpacing: '0.05em', opacity: corrRunning ? 0.6 : 1, transition: 'all 0.2s' }}>
                            {corrRunning ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'argux-spin 0.8s linear infinite' }} />Analyzing...</> : <>🔍 Run Correlation Analysis</>}
                        </button>
                    </div>

                    {/* Results */}
                    {corrResults && <>
                        {/* Stats cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                            {[
                                { label: 'Events', value: String(corrStats!.total), color: '#f59e0b' },
                                { label: 'Pairs', value: String(corrStats!.uniquePairs), color: '#3b82f6' },
                                { label: 'Avg Dist', value: `${corrStats!.avgDist}m`, color: '#22c55e' },
                                { label: 'Avg Dur', value: `${corrStats!.avgDur}m`, color: '#8b5cf6' },
                            ].map(s => <div key={s.label} style={{ padding: '6px 4px', borderRadius: 5, background: `${s.color}06`, border: `1px solid ${s.color}15`, textAlign: 'center' as const }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: 7, color: theme.textDim, marginTop: 2, fontWeight: 600 }}>{s.label}</div>
                            </div>)}
                        </div>

                        {/* Severity breakdown */}
                        <div style={{ display: 'flex', gap: 3, padding: '6px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                            {[
                                { sev: 'critical', color: '#ef4444', count: corrStats!.critical },
                                { sev: 'high', color: '#f97316', count: corrStats!.high },
                                { sev: 'medium', color: '#f59e0b', count: corrResults.filter(r => r.severity === 'medium').length },
                                { sev: 'low', color: '#6b7280', count: corrResults.filter(r => r.severity === 'low').length },
                            ].map(s => <div key={s.sev} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '3px 0', borderRadius: 3, background: s.count > 0 ? `${s.color}08` : 'transparent', border: `1px solid ${s.count > 0 ? s.color + '20' : 'transparent'}` }}>
                                <div style={{ width: 5, height: 5, borderRadius: 1, background: s.count > 0 ? s.color : theme.border }} />
                                <span style={{ fontSize: 8, fontWeight: 700, color: s.count > 0 ? s.color : theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{s.count}</span>
                                <span style={{ fontSize: 7, color: theme.textDim }}>{s.sev}</span>
                            </div>)}
                        </div>

                        {/* Sort controls */}
                        <div style={{ display: 'flex', gap: 3, padding: '6px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                            <span style={{ fontSize: 8, color: theme.textDim, fontWeight: 600, display: 'flex', alignItems: 'center', marginRight: 2 }}>Sort:</span>
                            {[{ id: 'date' as const, label: '📅 Date' }, { id: 'distance' as const, label: '📐 Distance' }, { id: 'duration' as const, label: '⏱️ Duration' }].map(s => <button key={s.id} onClick={() => { setCorrSortBy(s.id); const sorted = [...corrResults]; if (s.id === 'distance') sorted.sort((a, b) => a.distance - b.distance); else if (s.id === 'duration') sorted.sort((a, b) => b.duration - a.duration); else sorted.sort((a, b) => b.timestamp.localeCompare(a.timestamp)); setCorrResults(sorted); }} style={{ padding: '3px 7px', borderRadius: 3, border: `1px solid ${corrSortBy === s.id ? '#f59e0b30' : theme.border}`, background: corrSortBy === s.id ? '#f59e0b08' : 'transparent', color: corrSortBy === s.id ? '#f59e0b' : theme.textDim, fontSize: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{s.label}</button>)}
                        </div>

                        {/* Event list */}
                        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                            {corrResults.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const }}><div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div><div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>No Co-locations Found</div><div style={{ fontSize: 10, color: theme.textDim }}>Try increasing the radius or broadening the time window.</div></div>}
                            {corrResults.map(ev => {
                                const sevColor = ev.severity === 'critical' ? '#ef4444' : ev.severity === 'high' ? '#f97316' : ev.severity === 'medium' ? '#f59e0b' : '#6b7280';
                                const confColor = ev.confidence >= 90 ? '#22c55e' : ev.confidence >= 75 ? '#f59e0b' : '#ef4444';
                                const isSelected = corrSelectedEvent === ev.id;
                                return <div key={ev.id} onClick={() => { setCorrSelectedEvent(isSelected ? null : ev.id); mapRef.current?.flyTo({ center: [ev.lng, ev.lat], zoom: 16, duration: 800 }); triggerTopLoader(); }} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}08`, cursor: 'pointer', background: isSelected ? '#f59e0b06' : 'transparent', transition: 'background 0.15s', borderLeft: `3px solid ${sevColor}` }} onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }} onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                                    {/* Subject pair */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${ev.subjectA.risk === 'Critical' ? '#ef4444' : '#f97316'}`, background: `url(${ev.subjectA.avatar}) center/cover`, flexShrink: 0 }} />
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${ev.subjectB.risk === 'Critical' ? '#ef4444' : '#f97316'}`, background: `url(${ev.subjectB.avatar}) center/cover`, flexShrink: 0, marginLeft: -8 }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{ev.subjectA.name.split(' ')[1]} ↔ {ev.subjectB.name.split(' ')[1]}</div>
                                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 1 }}>
                                                <span style={{ fontSize: 7, fontWeight: 800, padding: '1px 4px', borderRadius: 2, background: `${sevColor}12`, color: sevColor, border: `1px solid ${sevColor}20` }}>{ev.severity.toUpperCase()}</span>
                                                <span style={{ fontSize: 7, color: confColor, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{ev.confidence}%</span>
                                                <span style={{ fontSize: 7, color: theme.textDim }}>{ev.source}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                                            <div style={{ fontSize: 8, color: theme.textDim }}>{ev.timeAgo}</div>
                                        </div>
                                    </div>
                                    {/* Metrics */}
                                    <div style={{ display: 'flex', gap: 10, fontSize: 8, marginBottom: isSelected ? 6 : 0 }}>
                                        <span><span style={{ color: theme.textDim }}>📐</span> <span style={{ fontWeight: 700, color: ev.distance <= 25 ? '#ef4444' : ev.distance <= 100 ? '#f59e0b' : '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>{ev.distance}m</span></span>
                                        <span><span style={{ color: theme.textDim }}>⏱️</span> <span style={{ fontWeight: 700, color: ev.duration >= 30 ? '#ef4444' : ev.duration >= 10 ? '#f59e0b' : theme.text, fontFamily: "'JetBrains Mono', monospace" }}>{ev.duration}min</span></span>
                                        <span><span style={{ color: theme.textDim }}>📍</span> <span style={{ color: theme.textSecondary }}>{ev.location.split(',')[0]}</span></span>
                                    </div>
                                    {/* Expanded details */}
                                    {isSelected && <div style={{ marginTop: 6, padding: '8px', borderRadius: 5, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
                                        <div style={{ fontSize: 8, color: theme.textDim, marginBottom: 4 }}>📍 {ev.location}</div>
                                        <div style={{ fontSize: 8, color: theme.textDim, marginBottom: 4 }}>📅 {ev.timestamp}</div>
                                        <div style={{ fontSize: 8, color: theme.textDim, marginBottom: 4 }}>🎯 Coordinates: <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{ev.lat.toFixed(5)}, {ev.lng.toFixed(5)}</span></div>
                                        <div style={{ fontSize: 9, color: theme.text, fontStyle: 'italic', lineHeight: 1.4, borderTop: `1px solid ${theme.border}15`, paddingTop: 6, marginTop: 4 }}>💬 {ev.notes}</div>
                                    </div>}
                                </div>;
                            })}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <span style={{ fontSize: 8, color: theme.textDim }}>{corrResults.length} events · {corrStats!.totalDur}min total · ø{corrStats!.avgConf}% confidence</span>
                        </div>
                    </>}

                    {/* Empty state before first run */}
                    {!corrResults && !corrRunning && <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' as const }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🔗</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>Co-location Analysis</div>
                        <div style={{ fontSize: 10, color: theme.textDim, maxWidth: 240, lineHeight: 1.5 }}>Configure subjects and thresholds above, then run the analysis to find co-location events between persons of interest.</div>
                    </div>}

                    {/* Loading state */}
                    {corrRunning && <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
                        <div style={{ width: 32, height: 32, border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'argux-spin 0.8s linear infinite', marginBottom: 12 }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>Analyzing Events</div>
                        <div style={{ fontSize: 9, color: theme.textDim }}>Cross-referencing position data across {corrPersonOptions.length} subjects...</div>
                    </div>}
                    </>}
                </div>}

                {/* ═══ ANOMALY DETECTION PANEL ═══ */}
                {showAnomalyPanel && loaded && <div data-panel="anomaly" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('anomaly' as PanelId); }} style={panelStyle('anomaly', '400px', '#8b5cf6')}>
                    <PanelHeader id="anomaly" icon="🧠" title="Anomaly Detection" subtitle={anomalyResults ? `${anomalyResults.length} anomalies · ${anomalyStats?.subjects || 0} subjects` : 'AI-powered movement pattern analysis'} color="#8b5cf6" onClose={() => setShowAnomalyPanel(false)} extra={anomalyResults ? <button onClick={() => { setAnomalyResults(null); setAnomalySelectedId(null); }} style={{ padding: '3px 8px', borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>✕ Clear</button> : undefined} />
                    <PanelResizeGrip id="anomaly" />

                    {!isPanelMin('anomaly') && <>
                    {/* Config */}
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}15`, flexShrink: 0, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                        {/* Subject + Type */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Subject</div>
                                <select value={anomalySubject} onChange={e => setAnomalySubject(e.target.value)} style={{ width: '100%', padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${anomalySubject ? '#8b5cf640' : theme.border}`, borderRadius: 5, fontSize: 10, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                                    <option value="">All persons</option>
                                    {corrPersonOptions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Type</div>
                                <select value={anomalyType} onChange={e => setAnomalyType(e.target.value)} style={{ width: '100%', padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${anomalyType !== 'all' ? '#8b5cf640' : theme.border}`, borderRadius: 5, fontSize: 10, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                                    {anomalyTypes.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Sensitivity slider */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Sensitivity</span><span style={{ fontSize: 9, fontWeight: 700, color: '#8b5cf6', fontFamily: "'JetBrains Mono', monospace" }}>{anomalySensitivity}%</span></div>
                            <input type="range" min={30} max={100} step={5} value={anomalySensitivity} onChange={e => setAnomalySensitivity(parseInt(e.target.value))} style={{ width: '100%', height: 4, accentColor: '#8b5cf6' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: theme.textDim, marginTop: 2 }}><span>Fewer, high-confidence</span><span>More, lower threshold</span></div>
                        </div>
                        {/* Run button */}
                        <button onClick={runAnomalyDetection} disabled={anomalyRunning} style={{ padding: '8px', borderRadius: 6, border: 'none', background: anomalyRunning ? theme.border : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: anomalyRunning ? theme.textDim : '#fff', fontSize: 11, fontWeight: 800, cursor: anomalyRunning ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, letterSpacing: '0.05em', opacity: anomalyRunning ? 0.6 : 1, transition: 'all 0.2s' }}>
                            {anomalyRunning ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'argux-spin 0.8s linear infinite' }} />Running AI Analysis...</> : <>🧠 Run Anomaly Detection</>}
                        </button>
                    </div>

                    {/* Results */}
                    {anomalyResults && <>
                        {/* Stats row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                            {[
                                { label: 'Anomalies', value: String(anomalyStats!.total), color: '#8b5cf6' },
                                { label: 'Subjects', value: String(anomalyStats!.subjects), color: '#3b82f6' },
                                { label: 'Avg Conf', value: `${anomalyStats!.avgConf}%`, color: '#22c55e' },
                                { label: 'Avg Dev', value: `${anomalyStats!.avgDev}%`, color: '#f59e0b' },
                            ].map(s => <div key={s.label} style={{ padding: '6px 4px', borderRadius: 5, background: `${s.color}06`, border: `1px solid ${s.color}15`, textAlign: 'center' as const }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: 7, color: theme.textDim, marginTop: 2, fontWeight: 600 }}>{s.label}</div>
                            </div>)}
                        </div>

                        {/* Severity + Type chips */}
                        <div style={{ display: 'flex', gap: 3, padding: '6px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0, flexWrap: 'wrap' }}>
                            {[
                                { sev: 'critical', color: '#ef4444', count: anomalyStats!.critical },
                                { sev: 'high', color: '#f97316', count: anomalyStats!.high },
                                { sev: 'medium', color: '#f59e0b', count: anomalyStats!.medium },
                            ].filter(s => s.count > 0).map(s => <span key={s.sev} style={{ fontSize: 7, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: `${s.color}10`, color: s.color, border: `1px solid ${s.color}20` }}>{s.count} {s.sev}</span>)}
                            <span style={{ width: 1, height: 14, background: theme.border, margin: '0 2px' }} />
                            {anomalyTypes.filter(t => t.id !== 'all' && anomalyResults.some(r => r.type === t.id)).map(t => <span key={t.id} style={{ fontSize: 7, fontWeight: 600, padding: '2px 5px', borderRadius: 3, background: `${t.color}08`, color: t.color, border: `1px solid ${t.color}15` }}>{t.icon} {anomalyResults.filter(r => r.type === t.id).length}</span>)}
                        </div>

                        {/* Anomaly list */}
                        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                            {anomalyResults.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const }}><div style={{ fontSize: 28, marginBottom: 8 }}>✅</div><div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>No Anomalies Detected</div><div style={{ fontSize: 10, color: theme.textDim }}>All movement patterns within expected baselines. Try increasing sensitivity.</div></div>}
                            {anomalyResults.map(an => {
                                const sevColor = an.severity === 'critical' ? '#ef4444' : an.severity === 'high' ? '#f97316' : an.severity === 'medium' ? '#f59e0b' : '#6b7280';
                                const typeInfo = anomalyTypes.find(t => t.id === an.type);
                                const typeColor = typeInfo?.color || '#8b5cf6';
                                const confColor = an.confidence >= 90 ? '#22c55e' : an.confidence >= 75 ? '#f59e0b' : '#ef4444';
                                const isExpanded = anomalySelectedId === an.id;
                                return <div key={an.id} onClick={() => { setAnomalySelectedId(isExpanded ? null : an.id); mapRef.current?.flyTo({ center: [an.lng, an.lat], zoom: 16, duration: 800 }); triggerTopLoader(); }} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}08`, cursor: 'pointer', background: isExpanded ? '#8b5cf606' : 'transparent', transition: 'background 0.15s', borderLeft: `3px solid ${sevColor}` }} onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }} onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${an.risk === 'Critical' ? '#ef4444' : '#f97316'}`, background: `url(${an.personAvatar}) center/cover`, flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{an.title}</div>
                                            <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 1 }}>
                                                <span style={{ fontSize: 7, fontWeight: 800, padding: '1px 4px', borderRadius: 2, background: `${sevColor}12`, color: sevColor, border: `1px solid ${sevColor}20` }}>{an.severity.toUpperCase()}</span>
                                                <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 2, background: `${typeColor}10`, color: typeColor, border: `1px solid ${typeColor}15` }}>{typeInfo?.icon} {typeInfo?.label}</span>
                                                <span style={{ fontSize: 7, color: confColor, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{an.confidence}%</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                                            <div style={{ fontSize: 8, color: theme.textDim }}>{an.timeAgo}</div>
                                            <div style={{ fontSize: 8, color: theme.textDim }}>{an.personName.split(' ')[1]}</div>
                                        </div>
                                    </div>
                                    {/* Deviation bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: isExpanded ? 6 : 0 }}>
                                        <span style={{ fontSize: 7, color: theme.textDim, width: 50, flexShrink: 0 }}>Deviation</span>
                                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: theme.border, overflow: 'hidden' }}><div style={{ width: `${an.deviation}%`, height: '100%', borderRadius: 2, background: an.deviation >= 85 ? '#ef4444' : an.deviation >= 70 ? '#f59e0b' : '#22c55e', transition: 'width 0.5s' }} /></div>
                                        <span style={{ fontSize: 8, fontWeight: 700, color: an.deviation >= 85 ? '#ef4444' : an.deviation >= 70 ? '#f59e0b' : '#22c55e', fontFamily: "'JetBrains Mono', monospace", width: 30, textAlign: 'right' as const, flexShrink: 0 }}>{an.deviation}%</span>
                                    </div>
                                    {/* Expanded */}
                                    {isExpanded && <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                                        {/* Description */}
                                        <div style={{ fontSize: 9, color: theme.text, lineHeight: 1.5, padding: '8px', borderRadius: 5, background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.1)' }}>{an.description}</div>
                                        {/* Baseline vs Observed */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                            <div style={{ padding: '6px 8px', borderRadius: 5, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
                                                <div style={{ fontSize: 7, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 3 }}>📊 Baseline</div>
                                                <div style={{ fontSize: 8, color: theme.textDim, lineHeight: 1.4 }}>{an.baseline}</div>
                                            </div>
                                            <div style={{ padding: '6px 8px', borderRadius: 5, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                                                <div style={{ fontSize: 7, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 3 }}>⚠️ Observed</div>
                                                <div style={{ fontSize: 8, color: theme.textDim, lineHeight: 1.4 }}>{an.observed}</div>
                                            </div>
                                        </div>
                                        {/* Location + Time */}
                                        <div style={{ display: 'flex', gap: 8, fontSize: 8, color: theme.textDim }}>
                                            <span>📍 {mockAddress(an.lat, an.lng)}</span>
                                            <span>📅 {an.timestamp}</span>
                                        </div>
                                        {/* Recommendation */}
                                        <div style={{ padding: '8px', borderRadius: 5, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
                                            <div style={{ fontSize: 7, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 3 }}>💡 Recommendation</div>
                                            <div style={{ fontSize: 9, color: theme.text, lineHeight: 1.5 }}>{an.recommendation}</div>
                                        </div>
                                    </div>}
                                </div>;
                            })}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <span style={{ fontSize: 8, color: theme.textDim }}>{anomalyResults.length} anomalies · ø{anomalyStats!.avgConf}% confidence · {anomalyStats!.types} types</span>
                            <div style={{ flex: 1 }} />
                            <span style={{ fontSize: 7, color: '#8b5cf6', fontWeight: 600 }}>AI: Ollama LLaMA 3.1</span>
                        </div>
                    </>}

                    {/* Empty state */}
                    {!anomalyResults && !anomalyRunning && <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' as const }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🧠</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>AI Anomaly Detection</div>
                        <div style={{ fontSize: 10, color: theme.textDim, maxWidth: 260, lineHeight: 1.5, marginBottom: 12 }}>Uses on-premise AI to analyze movement patterns, temporal behaviors, and communication changes to identify deviations from established baselines.</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>{anomalyTypes.filter(t => t.id !== 'all').map(t => <span key={t.id} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${t.color}08`, color: t.color, border: `1px solid ${t.color}15` }}>{t.icon} {t.label}</span>)}</div>
                    </div>}

                    {/* Loading */}
                    {anomalyRunning && <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
                        <div style={{ width: 32, height: 32, border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'argux-spin 0.8s linear infinite', marginBottom: 12 }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', marginBottom: 4 }}>Analyzing Patterns</div>
                        <div style={{ fontSize: 9, color: theme.textDim, textAlign: 'center' as const, lineHeight: 1.5 }}>Running behavioral analysis on {anomalySubject ? '1 subject' : `${corrPersonOptions.length} subjects`}...<br/>Comparing against 30-day baseline profiles.</div>
                    </div>}
                    </>}
                </div>}

                {/* ═══ PREDICTIVE RISK PANEL ═══ */}
                {showPredictivePanel && loaded && <div data-panel="predictive" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('predictive' as PanelId); }} style={panelStyle('predictive', '420px', '#ef4444')}>
                    <PanelHeader id="predictive" icon="📈" title="Predictive Risk" subtitle={predResults ? `${predResults.length} subjects · Horizon: ${predTimeHorizon}` : 'Risk trajectory & location prediction'} color="#ef4444" onClose={() => setShowPredictivePanel(false)} extra={predResults ? <button onClick={() => { setPredResults(null); setPredSelectedId(null); }} style={{ padding: '3px 8px', borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>✕ Clear</button> : undefined} />
                    <PanelResizeGrip id="predictive" />

                    {!isPanelMin('predictive') && <>
                    {/* Config */}
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}15`, flexShrink: 0, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                        <div>
                            <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Prediction Horizon</div>
                            <div style={{ display: 'flex', gap: 3 }}>
                                {[{ id: '6h' as const, label: '6 Hours' }, { id: '24h' as const, label: '24 Hours' }, { id: '72h' as const, label: '3 Days' }, { id: '7d' as const, label: '7 Days' }].map(h => <button key={h.id} onClick={() => setPredTimeHorizon(h.id)} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${predTimeHorizon === h.id ? '#ef444440' : theme.border}`, background: predTimeHorizon === h.id ? 'rgba(239,68,68,0.08)' : 'transparent', color: predTimeHorizon === h.id ? '#ef4444' : theme.textDim, fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{h.label}</button>)}
                            </div>
                        </div>
                        <button onClick={runPredictiveRisk} disabled={predRunning} style={{ padding: '8px', borderRadius: 6, border: 'none', background: predRunning ? theme.border : 'linear-gradient(135deg, #ef4444, #dc2626)', color: predRunning ? theme.textDim : '#fff', fontSize: 11, fontWeight: 800, cursor: predRunning ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, letterSpacing: '0.05em', opacity: predRunning ? 0.6 : 1, transition: 'all 0.2s' }}>
                            {predRunning ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'argux-spin 0.8s linear infinite' }} />Generating Predictions...</> : <>📈 Run Predictive Analysis</>}
                        </button>
                    </div>

                    {/* Results */}
                    {predResults && <>
                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                            {[
                                { label: 'Avg Score', value: String(predStats!.avgScore), color: predStats!.avgScore >= 80 ? '#ef4444' : '#f59e0b' },
                                { label: 'Escalating', value: String(predStats!.escalating), color: '#ef4444' },
                                { label: 'Actions', value: String(predStats!.totalActions), color: '#3b82f6' },
                            ].map(s => <div key={s.label} style={{ padding: '6px 4px', borderRadius: 5, background: `${s.color}06`, border: `1px solid ${s.color}15`, textAlign: 'center' as const }}>
                                <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: 7, color: theme.textDim, marginTop: 2, fontWeight: 600 }}>{s.label}</div>
                            </div>)}
                        </div>

                        {/* Subject list */}
                        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                            {predResults.map(pr => {
                                const riskColor = pr.predictedRisk === 'Critical' ? '#ef4444' : pr.predictedRisk === 'High' ? '#f97316' : pr.predictedRisk === 'Medium' ? '#f59e0b' : '#22c55e';
                                const curColor = pr.currentRisk === 'Critical' ? '#ef4444' : pr.currentRisk === 'High' ? '#f97316' : '#f59e0b';
                                const isExp = predSelectedId === pr.id;
                                const escalating = pr.riskDelta > 10;
                                return <div key={pr.id} onClick={() => { setPredSelectedId(isExp ? null : pr.id); mapRef.current?.flyTo({ center: [pr.predictedLng, pr.predictedLat], zoom: 15, duration: 800 }); triggerTopLoader(); }} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}08`, cursor: 'pointer', background: isExp ? '#ef444406' : 'transparent', transition: 'background 0.15s', borderLeft: `3px solid ${riskColor}` }} onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }} onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = 'transparent'; }}>
                                    {/* Person header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2.5px solid ${riskColor}`, background: `url(${pr.personAvatar}) center/cover`, flexShrink: 0, position: 'relative' as const }}>
                                            {escalating && <div style={{ position: 'absolute' as const, top: -3, right: -3, width: 12, height: 12, borderRadius: '50%', background: '#ef4444', border: '1.5px solid rgba(13,18,32,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontWeight: 900 }}>↑</div>}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{pr.personName}</div>
                                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 1 }}>
                                                <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: `${curColor}12`, color: curColor, border: `1px solid ${curColor}20` }}>{pr.currentRisk}</span>
                                                <span style={{ fontSize: 9, color: escalating ? '#ef4444' : '#22c55e' }}>→</span>
                                                <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 3, background: `${riskColor}15`, color: riskColor, border: `1px solid ${riskColor}25` }}>{pr.predictedRisk}</span>
                                                <span style={{ fontSize: 8, fontWeight: 800, color: pr.riskDelta > 0 ? '#ef4444' : '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>{pr.riskDelta > 0 ? '+' : ''}{pr.riskDelta}%</span>
                                            </div>
                                        </div>
                                        {/* Risk score gauge */}
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${riskColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' as const, background: `conic-gradient(${riskColor} ${pr.riskScore * 3.6}deg, ${theme.border} ${pr.riskScore * 3.6}deg)` }}>
                                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(10,14,22,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 11, fontWeight: 900, color: riskColor, fontFamily: "'JetBrains Mono', monospace" }}>{pr.riskScore}</span></div>
                                        </div>
                                    </div>
                                    {/* Predicted location */}
                                    <div style={{ display: 'flex', gap: 8, fontSize: 8, color: theme.textDim, marginBottom: isExp ? 6 : 0 }}>
                                        <span>📍 <span style={{ color: theme.text, fontWeight: 600 }}>{pr.predictedLocation}</span></span>
                                        <span>🕐 <span style={{ color: theme.text, fontWeight: 600 }}>{pr.predictedTime}</span></span>
                                        <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>{pr.probability}%</span>
                                    </div>

                                    {/* Expanded details */}
                                    {isExp && <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                                        {/* Risk factors */}
                                        <div style={{ padding: '8px', borderRadius: 6, background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.08)' }}>
                                            <div style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }}>Risk Factors</div>
                                            {pr.factors.map((f: any, i: number) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <span style={{ fontSize: 10 }}>{f.icon}</span>
                                                <span style={{ fontSize: 9, color: theme.text, flex: 1 }}>{f.label}</span>
                                                <span style={{ fontSize: 8, color: f.trend === 'up' ? '#ef4444' : f.trend === 'down' ? '#22c55e' : '#f59e0b' }}>{f.trend === 'up' ? '↑' : f.trend === 'down' ? '↓' : '→'}</span>
                                                <div style={{ width: 60, height: 4, borderRadius: 2, background: theme.border, overflow: 'hidden' }}><div style={{ width: `${f.weight}%`, height: '100%', borderRadius: 2, background: f.weight >= 85 ? '#ef4444' : f.weight >= 70 ? '#f59e0b' : '#3b82f6' }} /></div>
                                                <span style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", width: 26, textAlign: 'right' as const }}>{f.weight}%</span>
                                            </div>)}
                                        </div>
                                        {/* Next predicted locations */}
                                        <div style={{ padding: '8px', borderRadius: 6, background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.08)' }}>
                                            <div style={{ fontSize: 8, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }}>Predicted Locations</div>
                                            {pr.nextLocations.map((loc: any, i: number) => <div key={i} onClick={e => { e.stopPropagation(); mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 16, duration: 600 }); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 4, marginBottom: 2, cursor: 'pointer', border: `1px solid transparent` }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f625'; e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}>
                                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: `conic-gradient(#3b82f6 ${loc.probability * 3.6}deg, ${theme.border} ${loc.probability * 3.6}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(10,14,22,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 6, fontWeight: 900, color: '#3b82f6' }}>{i + 1}</span></div></div>
                                                <span style={{ fontSize: 9, color: theme.text, flex: 1 }}>{loc.name}</span>
                                                <span style={{ fontSize: 9, fontWeight: 800, color: loc.probability >= 60 ? '#ef4444' : loc.probability >= 40 ? '#f59e0b' : '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>{loc.probability}%</span>
                                            </div>)}
                                        </div>
                                        {/* Threat assessment */}
                                        <div style={{ padding: '8px', borderRadius: 6, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                                            <div style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 }}>⚠️ Threat Assessment</div>
                                            <div style={{ fontSize: 9, color: theme.text, lineHeight: 1.5 }}>{pr.threatAssessment}</div>
                                        </div>
                                        {/* Recommended actions */}
                                        <div style={{ padding: '8px', borderRadius: 6, background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.1)' }}>
                                            <div style={{ fontSize: 8, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 }}>💡 Recommended Actions</div>
                                            {pr.recommendedActions.map((a: string, i: number) => <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 3 }}>
                                                <div style={{ width: 14, height: 14, borderRadius: 3, background: '#22c55e12', border: '1px solid #22c55e20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 800, color: '#22c55e', flexShrink: 0 }}>{i + 1}</div>
                                                <span style={{ fontSize: 9, color: theme.text, lineHeight: 1.4 }}>{a}</span>
                                            </div>)}
                                        </div>
                                    </div>}
                                </div>;
                            })}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <span style={{ fontSize: 8, color: theme.textDim }}>{predResults.length} subjects · ø{predStats!.avgConf}% conf · {predStats!.totalActions} actions</span>
                            <div style={{ flex: 1 }} />
                            <span style={{ fontSize: 7, color: '#ef4444', fontWeight: 600 }}>AI: XGBoost + scikit-learn</span>
                        </div>
                    </>}

                    {/* Empty state */}
                    {!predResults && !predRunning && <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' as const }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>📈</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>Predictive Risk Analysis</div>
                        <div style={{ fontSize: 10, color: theme.textDim, maxWidth: 260, lineHeight: 1.5, marginBottom: 12 }}>Uses on-premise ML models to predict risk trajectories, probable next locations, and threat assessments for persons of interest.</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {['Risk Trajectory', 'Location Prediction', 'Threat Assessment', 'Action Recommendations'].map(f => <span key={f} style={{ fontSize: 7, padding: '2px 6px', borderRadius: 3, background: '#ef444408', color: '#ef4444', border: '1px solid #ef444415' }}>{f}</span>)}
                        </div>
                    </div>}

                    {/* Loading */}
                    {predRunning && <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
                        <div style={{ width: 32, height: 32, border: '3px solid rgba(239,68,68,0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'argux-spin 0.8s linear infinite', marginBottom: 12 }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>Generating Predictions</div>
                        <div style={{ fontSize: 9, color: theme.textDim, textAlign: 'center' as const, lineHeight: 1.5 }}>Analyzing {predTimeHorizon} horizon across {corrPersonOptions.length} subjects...<br/>Processing behavioral data, network graphs, and location history.</div>
                    </div>}
                    </>}
                </div>}

                {/* ═══ PATTERN DETECTION PANEL ═══ */}
                {showPatternPanel && loaded && <div data-panel="pattern" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('pattern' as PanelId); }} style={panelStyle('pattern', '420px', '#06b6d4')}>
                    <PanelHeader id="pattern" icon="🔄" title="Pattern Detection" subtitle={patternResults ? `${patternResults.length} patterns · ${patternStats?.totalOcc || 0} occurrences` : 'Frequency & regularity analysis'} color="#06b6d4" onClose={() => setShowPatternPanel(false)} extra={patternResults ? <button onClick={() => { setPatternResults(null); setPatternSelectedId(null); }} style={{ padding: '3px 8px', borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>✕ Clear</button> : undefined} />
                    <PanelResizeGrip id="pattern" />

                    {!isPanelMin('pattern') && <>
                    {/* Config */}
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}15`, flexShrink: 0, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Subject</div>
                                <select value={patternSubject} onChange={e => setPatternSubject(e.target.value)} style={{ width: '100%', padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${patternSubject ? '#06b6d440' : theme.border}`, borderRadius: 5, fontSize: 10, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                                    <option value="">All persons</option>
                                    {corrPersonOptions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Category</div>
                                <select value={patternCategory} onChange={e => setPatternCategory(e.target.value)} style={{ width: '100%', padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${patternCategory !== 'all' ? '#06b6d440' : theme.border}`, borderRadius: 5, fontSize: 10, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                                    {patternCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={runPatternDetection} disabled={patternRunning} style={{ padding: '8px', borderRadius: 6, border: 'none', background: patternRunning ? theme.border : 'linear-gradient(135deg, #06b6d4, #0891b2)', color: patternRunning ? theme.textDim : '#fff', fontSize: 11, fontWeight: 800, cursor: patternRunning ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, letterSpacing: '0.05em', opacity: patternRunning ? 0.6 : 1, transition: 'all 0.2s' }}>
                            {patternRunning ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'argux-spin 0.8s linear infinite' }} />Scanning Patterns...</> : <>🔄 Run Pattern Detection</>}
                        </button>
                    </div>

                    {/* Results */}
                    {patternResults && <>
                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                            {[
                                { label: 'Patterns', value: String(patternStats!.total), color: '#06b6d4' },
                                { label: 'Subjects', value: String(patternStats!.subjects), color: '#3b82f6' },
                                { label: 'Avg Reg', value: `${patternStats!.avgReg}%`, color: '#f59e0b' },
                                { label: 'Events', value: String(patternStats!.totalOcc), color: '#22c55e' },
                            ].map(s => <div key={s.label} style={{ padding: '6px 4px', borderRadius: 5, background: `${s.color}06`, border: `1px solid ${s.color}15`, textAlign: 'center' as const }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: 7, color: theme.textDim, marginTop: 2, fontWeight: 600 }}>{s.label}</div>
                            </div>)}
                        </div>

                        {/* Category + severity chips */}
                        <div style={{ display: 'flex', gap: 3, padding: '6px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0, flexWrap: 'wrap' }}>
                            {[{ sev: 'critical', color: '#ef4444' }, { sev: 'high', color: '#f97316' }, { sev: 'medium', color: '#f59e0b' }].map(s => { const c = patternResults.filter(r => r.severity === s.sev).length; return c > 0 ? <span key={s.sev} style={{ fontSize: 7, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: `${s.color}10`, color: s.color, border: `1px solid ${s.color}20` }}>{c} {s.sev}</span> : null; })}
                            <span style={{ width: 1, height: 14, background: theme.border, margin: '0 2px' }} />
                            {patternCategories.filter(c => c.id !== 'all' && patternResults.some(r => r.category === c.id)).map(c => <span key={c.id} style={{ fontSize: 7, fontWeight: 600, padding: '2px 5px', borderRadius: 3, background: `${c.color}08`, color: c.color, border: `1px solid ${c.color}15` }}>{c.icon} {patternResults.filter(r => r.category === c.id).length}</span>)}
                        </div>

                        {/* Pattern list */}
                        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                            {patternResults.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const }}><div style={{ fontSize: 28, marginBottom: 8 }}>✅</div><div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>No Patterns Detected</div><div style={{ fontSize: 10, color: theme.textDim }}>No recurring behavioral patterns found for the selected filters.</div></div>}
                            {patternResults.map(pt => {
                                const sevColor = pt.severity === 'critical' ? '#ef4444' : pt.severity === 'high' ? '#f97316' : '#f59e0b';
                                const catInfo = patternCategories.find(c => c.id === pt.category);
                                const catColor = catInfo?.color || '#06b6d4';
                                const isExp = patternSelectedId === pt.id;
                                const maxHeat = Math.max(...pt.heatmap, 1);
                                return <div key={pt.id} onClick={() => { setPatternSelectedId(isExp ? null : pt.id); mapRef.current?.flyTo({ center: [pt.lng, pt.lat], zoom: 16, duration: 800 }); triggerTopLoader(); }} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}08`, cursor: 'pointer', background: isExp ? '#06b6d406' : 'transparent', transition: 'background 0.15s', borderLeft: `3px solid ${sevColor}` }} onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }} onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = 'transparent'; }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${pt.risk === 'Critical' ? '#ef4444' : '#f97316'}`, background: `url(${pt.personAvatar}) center/cover`, flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{pt.title}</div>
                                            <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 1 }}>
                                                <span style={{ fontSize: 7, fontWeight: 800, padding: '1px 4px', borderRadius: 2, background: `${sevColor}12`, color: sevColor, border: `1px solid ${sevColor}20` }}>{pt.severity.toUpperCase()}</span>
                                                <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 2, background: `${catColor}10`, color: catColor, border: `1px solid ${catColor}15` }}>{catInfo?.icon} {catInfo?.label}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                                            <div style={{ fontSize: 8, color: theme.textDim }}>{pt.personName.split(' ')[1]}</div>
                                            <div style={{ fontSize: 8, fontWeight: 700, color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}>{pt.occurrences}×</div>
                                        </div>
                                    </div>
                                    {/* Weekly heatmap bar */}
                                    <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                                        {pt.heatmap.map((v: number, i: number) => <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 1 }}>
                                            <div style={{ width: '100%', height: 6, borderRadius: 1, background: v > 0 ? `rgba(6,182,212,${0.15 + (v / maxHeat) * 0.7})` : `${theme.border}40` }} />
                                            <span style={{ fontSize: 5, color: v > 0 ? '#06b6d4' : theme.textDim, fontWeight: 600 }}>{dayLabels[i]}</span>
                                        </div>)}
                                    </div>
                                    {/* Frequency + regularity */}
                                    <div style={{ display: 'flex', gap: 8, fontSize: 8, alignItems: 'center' }}>
                                        <span style={{ color: theme.textDim }}>📅 <span style={{ color: theme.text, fontWeight: 600 }}>{pt.frequency}</span></span>
                                        <span style={{ color: theme.textDim }}>Regularity:</span>
                                        <div style={{ width: 40, height: 3, borderRadius: 1, background: theme.border, overflow: 'hidden' }}><div style={{ width: `${pt.regularity}%`, height: '100%', borderRadius: 1, background: pt.regularity >= 85 ? '#22c55e' : pt.regularity >= 65 ? '#f59e0b' : '#ef4444' }} /></div>
                                        <span style={{ fontWeight: 700, color: pt.regularity >= 85 ? '#22c55e' : pt.regularity >= 65 ? '#f59e0b' : '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>{pt.regularity}%</span>
                                    </div>

                                    {/* Expanded */}
                                    {isExp && <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                                        {/* Description */}
                                        <div style={{ fontSize: 9, color: theme.text, lineHeight: 1.5, padding: '8px', borderRadius: 5, background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.1)' }}>{pt.description}</div>
                                        {/* Details grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                            {pt.details.map((d: any) => <div key={d.label} style={{ padding: '5px 8px', borderRadius: 4, background: `${theme.border}15`, border: `1px solid ${theme.border}30` }}>
                                                <div style={{ fontSize: 7, color: theme.textDim, fontWeight: 600, marginBottom: 1 }}>{d.label}</div>
                                                <div style={{ fontSize: 9, color: theme.text, fontWeight: 700 }}>{d.value}</div>
                                            </div>)}
                                        </div>
                                        {/* Involved persons */}
                                        {pt.involvedPersons.length > 0 && <div style={{ padding: '6px 8px', borderRadius: 5, background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.1)' }}>
                                            <div style={{ fontSize: 7, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 }}>👥 Involved Persons</div>
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{pt.involvedPersons.map((p: any) => <span key={p.name} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3, background: '#8b5cf608', color: '#8b5cf6', border: '1px solid #8b5cf615', fontWeight: 600 }}>{p.name} ({p.count}×)</span>)}</div>
                                        </div>}
                                        {/* Weekly heatmap expanded */}
                                        <div style={{ padding: '6px 8px', borderRadius: 5, background: 'rgba(6,182,212,0.03)', border: '1px solid rgba(6,182,212,0.08)' }}>
                                            <div style={{ fontSize: 7, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }}>📊 Weekly Activity Heatmap</div>
                                            <div style={{ display: 'flex', gap: 3 }}>
                                                {pt.heatmap.map((v: number, i: number) => <div key={i} style={{ flex: 1, textAlign: 'center' as const }}>
                                                    <div style={{ height: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}><div style={{ width: '80%', height: `${v > 0 ? Math.max(20, (v / maxHeat) * 100) : 4}%`, borderRadius: '2px 2px 0 0', background: v > 0 ? `rgba(6,182,212,${0.3 + (v / maxHeat) * 0.6})` : `${theme.border}30`, transition: 'height 0.3s' }} /></div>
                                                    <div style={{ fontSize: 7, color: v > 0 ? '#06b6d4' : theme.textDim, fontWeight: 700, marginTop: 2 }}>{dayLabels[i]}</div>
                                                    <div style={{ fontSize: 7, color: v > 0 ? '#06b6d4' : theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
                                                </div>)}
                                            </div>
                                        </div>
                                        {/* Assessment */}
                                        <div style={{ padding: '8px', borderRadius: 5, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                                            <div style={{ fontSize: 7, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 3 }}>🎯 Assessment</div>
                                            <div style={{ fontSize: 9, color: theme.text, lineHeight: 1.5 }}>{pt.assessment}</div>
                                        </div>
                                    </div>}
                                </div>;
                            })}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <span style={{ fontSize: 8, color: theme.textDim }}>{patternResults.length} patterns · ø{patternStats!.avgConf}% conf · ø{patternStats!.avgReg}% regularity</span>
                            <div style={{ flex: 1 }} />
                            <span style={{ fontSize: 7, color: '#06b6d4', fontWeight: 600 }}>AI: scikit-learn + Kafka</span>
                        </div>
                    </>}

                    {/* Empty state */}
                    {!patternResults && !patternRunning && <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' as const }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🔄</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>Pattern Detection</div>
                        <div style={{ fontSize: 10, color: theme.textDim, maxWidth: 260, lineHeight: 1.5, marginBottom: 12 }}>Analyzes recurring behavioral patterns including meeting schedules, movement routes, communication timing, and location frequency across all monitored subjects.</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>{patternCategories.filter(c => c.id !== 'all').map(c => <span key={c.id} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${c.color}08`, color: c.color, border: `1px solid ${c.color}15` }}>{c.icon} {c.label}</span>)}</div>
                    </div>}

                    {/* Loading */}
                    {patternRunning && <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
                        <div style={{ width: 32, height: 32, border: '3px solid rgba(6,182,212,0.2)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'argux-spin 0.8s linear infinite', marginBottom: 12 }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', marginBottom: 4 }}>Scanning Patterns</div>
                        <div style={{ fontSize: 9, color: theme.textDim, textAlign: 'center' as const, lineHeight: 1.5 }}>Analyzing {patternSubject ? '1 subject' : `${corrPersonOptions.length} subjects`} across 30-day history...<br/>Processing {patternCategory === 'all' ? 'all categories' : patternCategories.find(c => c.id === patternCategory)?.label}.</div>
                    </div>}
                    </>}
                </div>}

                {/* ═══ INCIDENT TIMELINE PANEL ═══ */}
                {showIncidentPanel && loaded && <div data-panel="incidents" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('incidents' as PanelId); }} style={panelStyle('incidents', '420px', '#f97316')}>
                    <PanelHeader id="incidents" icon="📋" title="Incident Timeline" subtitle={`${filteredIncidents.length} of ${mockIncidents.length} events · ${incidentStats.subjects} subjects`} color="#f97316" onClose={() => setShowIncidentPanel(false)} extra={<button onClick={() => setIncidentSortAsc(!incidentSortAsc)} title={incidentSortAsc ? 'Oldest first' : 'Newest first'} style={{ padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{incidentSortAsc ? '↑ Old' : '↓ New'}</button>} />
                    <PanelResizeGrip id="incidents" />

                    {!isPanelMin('incidents') && <>
                    {/* Severity summary */}
                    <div style={{ display: 'flex', gap: 3, padding: '6px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                        {[
                            { sev: 'all', label: 'All', color: '#f97316', count: mockIncidents.length },
                            { sev: 'critical', label: 'Crit', color: '#ef4444', count: incidentStats.critical },
                            { sev: 'high', label: 'High', color: '#f97316', count: incidentStats.high },
                            { sev: 'medium', label: 'Med', color: '#f59e0b', count: incidentStats.medium },
                            { sev: 'low', label: 'Low', color: '#6b7280', count: incidentStats.low },
                            { sev: 'info', label: 'Info', color: '#3b82f6', count: incidentStats.info },
                        ].map(s => { const on = incidentSevFilter.has(s.sev); return <button key={s.sev} onClick={() => setIncidentSevFilter(prev => { if (s.sev === 'all') return new Set(['all']); const n = new Set(prev); n.delete('all'); if (n.has(s.sev)) { n.delete(s.sev); if (n.size === 0) return new Set(['all']); } else n.add(s.sev); return n; })} style={{ flex: 1, padding: '4px 2px', borderRadius: 4, border: `1px solid ${on ? s.color + '40' : 'transparent'}`, background: on ? `${s.color}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const, transition: 'all 0.1s' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: on ? s.color : theme.textDim, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.count}</div>
                            <div style={{ fontSize: 6, fontWeight: 700, color: on ? s.color : theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginTop: 1 }}>{s.label}</div>
                        </button>; })}
                    </div>

                    {/* Type filter chips */}
                    <div style={{ display: 'flex', gap: 3, padding: '6px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0, flexWrap: 'wrap' as const }}>
                        <button onClick={() => setIncidentTypeFilter(new Set(['all']))} style={{ padding: '2px 6px', borderRadius: 3, border: `1px solid ${incidentTypeFilter.has('all') ? '#f9731640' : theme.border}`, background: incidentTypeFilter.has('all') ? '#f9731608' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, fontWeight: 600, color: incidentTypeFilter.has('all') ? '#f97316' : theme.textDim }}>All</button>
                        {incidentTypes.map(t => { const on = incidentTypeFilter.has(t.id); const count = mockIncidents.filter(e => e.type === t.id).length; return count > 0 ? <button key={t.id} onClick={() => setIncidentTypeFilter(prev => { const n = new Set(prev); n.delete('all'); if (n.has(t.id)) { n.delete(t.id); if (n.size === 0) return new Set(['all']); } else n.add(t.id); return n; })} style={{ padding: '2px 6px', borderRadius: 3, border: `1px solid ${on ? t.color + '40' : theme.border}`, background: on ? `${t.color}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 2, fontSize: 8, fontWeight: 600, color: on ? t.color : theme.textDim }}>{t.icon}<span style={{ fontSize: 7 }}>{count}</span></button> : null; })}
                    </div>

                    {/* Search */}
                    <div style={{ padding: '6px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${incidentSearch ? '#f9731650' : theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                            <input value={incidentSearch} onChange={e => setIncidentSearch(e.target.value)} placeholder="Search events, persons, locations..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '6px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                            {incidentSearch && <button onClick={() => setIncidentSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }}><svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}
                        </div>
                    </div>

                    {/* Event list */}
                    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                        {filteredIncidents.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const }}><div style={{ fontSize: 28, marginBottom: 8 }}>📋</div><div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>No Events Match</div><div style={{ fontSize: 10, color: theme.textDim }}>Adjust filters or search terms to see events.</div></div>}
                        {filteredIncidents.map(ev => {
                            const sevColor = ev.severity === 'critical' ? '#ef4444' : ev.severity === 'high' ? '#f97316' : ev.severity === 'medium' ? '#f59e0b' : ev.severity === 'low' ? '#6b7280' : '#3b82f6';
                            const typeInfo = incidentTypes.find(t => t.id === ev.type);
                            const typeColor = typeInfo?.color || '#f97316';
                            const isExp = incidentSelectedId === ev.id;
                            return <div key={ev.id} onClick={() => { setIncidentSelectedId(isExp ? null : ev.id); mapRef.current?.flyTo({ center: [ev.lng, ev.lat], zoom: 16, duration: 800 }); triggerTopLoader(); }} style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', background: isExp ? '#f9731606' : 'transparent', transition: 'background 0.15s' }} onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = 'rgba(255,255,255,0.015)'; }} onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = 'transparent'; }}>
                                {/* Timeline connector */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {/* Left: timeline line + icon */}
                                    <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', width: 28, flexShrink: 0 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${typeColor}12`, border: `1.5px solid ${typeColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>{typeInfo?.icon || '📌'}</div>
                                        <div style={{ width: 1.5, flex: 1, background: `linear-gradient(to bottom, ${typeColor}30, transparent)`, marginTop: 4, minHeight: 8 }} />
                                    </div>
                                    {/* Right: content */}
                                    <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, lineHeight: 1.3 }}>{ev.title}</div>
                                                <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' as const }}>
                                                    <span style={{ fontSize: 7, fontWeight: 800, padding: '1px 4px', borderRadius: 2, background: `${sevColor}12`, color: sevColor, border: `1px solid ${sevColor}20` }}>{ev.severity.toUpperCase()}</span>
                                                    <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 2, background: `${typeColor}10`, color: typeColor, border: `1px solid ${typeColor}15` }}>{typeInfo?.label}</span>
                                                    {ev.personId > 0 && <span style={{ fontSize: 7, color: theme.textDim, display: 'flex', alignItems: 'center', gap: 2 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: ev.personAvatar ? `url(${ev.personAvatar}) center/cover` : theme.border, border: `1px solid ${ev.risk === 'Critical' ? '#ef444440' : '#f9731640'}`, flexShrink: 0 }} />{ev.personName.split(' ')[1]}</span>}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                                                <div style={{ fontSize: 8, color: theme.textDim, fontWeight: 600 }}>{ev.timeAgo}</div>
                                                <div style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{ev.timestamp.split(' ')[1]}</div>
                                            </div>
                                        </div>
                                        {/* Location + source */}
                                        <div style={{ display: 'flex', gap: 6, fontSize: 8, color: theme.textDim }}>
                                            <span>📍 {ev.location.split(',')[0]}</span>
                                            {ev.linkedEntityName && <span>🔗 {ev.linkedEntityName.length > 20 ? ev.linkedEntityName.slice(0, 20) + '...' : ev.linkedEntityName}</span>}
                                        </div>
                                        {/* Expanded details */}
                                        {isExp && <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                                            {/* Description */}
                                            <div style={{ fontSize: 9, color: theme.text, lineHeight: 1.5, padding: '8px', borderRadius: 5, background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)' }}>{ev.description}</div>
                                            {/* Metadata grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                                {Object.entries(ev.metadata).map(([k, v]) => <div key={k} style={{ padding: '4px 8px', borderRadius: 4, background: `${theme.border}15`, border: `1px solid ${theme.border}30` }}>
                                                    <div style={{ fontSize: 7, color: theme.textDim, fontWeight: 600, marginBottom: 1 }}>{k}</div>
                                                    <div style={{ fontSize: 9, color: theme.text, fontWeight: 700 }}>{v}</div>
                                                </div>)}
                                            </div>
                                            {/* Source + coords */}
                                            <div style={{ display: 'flex', gap: 8, fontSize: 8, color: theme.textDim, flexWrap: 'wrap' as const }}>
                                                <span>📡 {ev.source}</span>
                                                <span>📍 {ev.location}</span>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>🎯 {ev.lat.toFixed(5)}, {ev.lng.toFixed(5)}</span>
                                            </div>
                                            {/* Person link */}
                                            {ev.personId > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 5, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)' }}>
                                                <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${ev.risk === 'Critical' ? '#ef4444' : '#f97316'}`, background: `url(${ev.personAvatar}) center/cover`, flexShrink: 0 }} />
                                                <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.accent }}>{ev.personName}</div><div style={{ fontSize: 7, color: theme.textDim }}>Risk: {ev.risk} · {ev.timestamp}</div></div>
                                            </div>}
                                        </div>}
                                    </div>
                                </div>
                            </div>;
                        })}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e60' }} />
                        <span style={{ fontSize: 8, color: '#22c55e', fontWeight: 600 }}>Live</span>
                        <span style={{ fontSize: 8, color: theme.textDim }}>·</span>
                        <span style={{ fontSize: 8, color: theme.textDim }}>{filteredIncidents.length} of {mockIncidents.length} · {incidentStats.types} types · {incidentStats.subjects} subjects</span>
                        <div style={{ flex: 1 }} />
                        <span style={{ fontSize: 7, color: '#f97316', fontWeight: 600 }}>Kafka Stream</span>
                    </div>
                    </>}
                </div>}

                {/* ═══ HEAT CALENDAR PANEL ═══ */}
                {showHeatCalPanel && loaded && <div data-panel="heatcal" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('heatcal' as PanelId); }} style={panelStyle('heatcal', '460px', '#10b981')}>
                    <PanelHeader id="heatcal" icon="📅" title="Heat Calendar" subtitle={`${heatCalPersonInfo[parseInt(heatCalPerson)]?.name || 'Select person'} · 90 days`} color="#10b981" onClose={() => setShowHeatCalPanel(false)} />
                    <PanelResizeGrip id="heatcal" />

                    {!isPanelMin('heatcal') && <>
                    {/* Person selector */}
                    <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: 3 }}>
                            {Object.entries(heatCalPersonInfo).map(([pid, info]) => {
                                const on = heatCalPerson === pid;
                                const riskColor = info.risk === 'Critical' ? '#ef4444' : '#f97316';
                                return <button key={pid} onClick={() => setHeatCalPerson(pid)} style={{ flex: 1, padding: '5px 4px', borderRadius: 5, border: `1px solid ${on ? '#10b98140' : theme.border}`, background: on ? 'rgba(16,185,129,0.06)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: on ? '#10b981' : theme.text }}>{info.name.split(' ')[1]}</div>
                                    <div style={{ fontSize: 7, color: riskColor, fontWeight: 600 }}>{info.risk}</div>
                                </button>;
                            })}
                        </div>
                    </div>

                    {/* Calendar grid */}
                    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'thin', padding: '10px 14px', minHeight: 0 }}>
                        {(() => {
                            const personData = heatCalData[parseInt(heatCalPerson)] || {};
                            const weeks: string[][] = [];
                            const now = new Date(2026, 2, 24);
                            // Build 13 weeks × 7 days
                            for (let w = 12; w >= 0; w--) {
                                const week: string[] = [];
                                for (let d = 0; d < 7; d++) {
                                    const dayOffset = w * 7 + (6 - d);
                                    const date = new Date(now); date.setDate(now.getDate() - dayOffset);
                                    week.push(date.toISOString().slice(0, 10));
                                }
                                weeks.push(week);
                            }
                            const maxVal = Math.max(1, ...Object.values(personData));
                            const monthLabels: { label: string; col: number }[] = [];
                            weeks.forEach((wk, wi) => { const d = new Date(wk[0]); if (d.getDate() <= 7) monthLabels.push({ label: d.toLocaleString('en', { month: 'short' }), col: wi }); });
                            const totalEvents = Object.values(personData).reduce((a, b) => a + b, 0);
                            const avgPerDay = Math.round(totalEvents / 90);
                            const maxDay = Object.entries(personData).sort((a, b) => b[1] - a[1])[0];
                            const activeDays = Object.values(personData).filter(v => v > 0).length;

                            return <>
                                {/* Stats row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 10 }}>
                                    {[
                                        { label: 'Total', value: String(totalEvents), color: '#10b981' },
                                        { label: 'Daily Avg', value: String(avgPerDay), color: '#3b82f6' },
                                        { label: 'Peak Day', value: maxDay ? String(maxDay[1]) : '0', color: '#ef4444' },
                                        { label: 'Active Days', value: `${activeDays}/90`, color: '#f59e0b' },
                                    ].map(s => <div key={s.label} style={{ padding: '5px 4px', borderRadius: 5, background: `${s.color}06`, border: `1px solid ${s.color}15`, textAlign: 'center' as const }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.value}</div>
                                        <div style={{ fontSize: 7, color: theme.textDim, marginTop: 2 }}>{s.label}</div>
                                    </div>)}
                                </div>

                                {/* Month labels */}
                                <div style={{ display: 'flex', gap: 2, marginBottom: 2, paddingLeft: 22 }}>
                                    {weeks.map((_, wi) => { const ml = monthLabels.find(m => m.col === wi); return <div key={wi} style={{ width: 11, fontSize: 7, color: theme.textDim, fontWeight: 600, textAlign: 'center' as const }}>{ml?.label || ''}</div>; })}
                                </div>

                                {/* Grid: rows = days (Mon-Sun), cols = weeks */}
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, di) => <div key={dayName} style={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 2 }}>
                                    <span style={{ width: 18, fontSize: 7, color: theme.textDim, textAlign: 'right' as const, flexShrink: 0, fontWeight: 600 }}>{di % 2 === 0 ? dayName : ''}</span>
                                    {weeks.map((wk, wi) => {
                                        const dateStr = wk[di];
                                        const val = personData[dateStr] || 0;
                                        const intensity = val / maxVal;
                                        const bg = val === 0 ? `${theme.border}25` : `rgba(16,185,129,${0.15 + intensity * 0.75})`;
                                        const today = dateStr === '2026-03-24';
                                        return <div key={wi} title={`${dateStr}: ${val} events`} style={{ width: 11, height: 11, borderRadius: 2, background: bg, border: today ? '1.5px solid #fff' : '1px solid transparent', cursor: 'pointer', transition: 'transform 0.1s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.4)'; e.currentTarget.style.zIndex = '5'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '0'; }} />;
                                    })}
                                </div>)}

                                {/* Legend */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'flex-end' }}>
                                    <span style={{ fontSize: 7, color: theme.textDim }}>Less</span>
                                    {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => <div key={v} style={{ width: 10, height: 10, borderRadius: 2, background: v === 0 ? `${theme.border}25` : `rgba(16,185,129,${0.15 + v * 0.75})` }} />)}
                                    <span style={{ fontSize: 7, color: theme.textDim }}>More</span>
                                </div>

                                {/* Peak info */}
                                {maxDay && <div style={{ marginTop: 8, padding: '6px 8px', borderRadius: 5, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)', fontSize: 9, color: theme.textDim }}>📈 Peak: <span style={{ color: '#ef4444', fontWeight: 700 }}>{maxDay[1]} events</span> on <span style={{ color: theme.text, fontWeight: 600 }}>{maxDay[0]}</span></div>}
                            </>;
                        })()}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 8, color: theme.textDim }}>90-day activity heatmap · Kafka event stream</span>
                        <div style={{ flex: 1 }} />
                        <span style={{ fontSize: 7, color: '#10b981', fontWeight: 600 }}>ClickHouse Analytics</span>
                    </div>
                    </>}
                </div>}

                {/* ═══ ENTITY COMPARISON PANEL ═══ */}
                {showComparePanel && loaded && <div data-panel="compare" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('compare' as PanelId); }} style={panelStyle('compare', '440px', '#a855f7')}>
                    <PanelHeader id="compare" icon="⚖️" title="Entity Comparison" subtitle={`${heatCalPersonInfo[parseInt(compareA)]?.name || '—'} vs ${heatCalPersonInfo[parseInt(compareB)]?.name || '—'}`} color="#a855f7" onClose={() => setShowComparePanel(false)} />
                    <PanelResizeGrip id="compare" />

                    {!isPanelMin('compare') && <>
                    {/* Subject selectors */}
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 8, fontWeight: 700, color: '#3b82f6', marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Subject A</div>
                                <select value={compareA} onChange={e => setCompareA(e.target.value)} style={{ width: '100%', padding: '5px 8px', background: theme.bgInput, color: theme.text, border: '1px solid #3b82f640', borderRadius: 5, fontSize: 10, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                                    {corrPersonOptions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                </select>
                            </div>
                            <div style={{ fontSize: 16, color: theme.textDim, marginTop: 14 }}>⚔️</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Subject B</div>
                                <select value={compareB} onChange={e => setCompareB(e.target.value)} style={{ width: '100%', padding: '5px 8px', background: theme.bgInput, color: theme.text, border: '1px solid #ef444440', borderRadius: 5, fontSize: 10, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                                    {corrPersonOptions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                </select>
                            </div>
                        </div>
                        {compareA === compareB && <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 9, color: '#f59e0b' }}>⚠️ Select two different subjects for comparison</div>}
                    </div>

                    {/* Comparison metrics */}
                    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                        {compareA !== compareB && compareData.map(m => {
                            const aNum = typeof m.aVal === 'number' ? m.aVal : 0;
                            const bNum = typeof m.bVal === 'number' ? m.bVal : 0;
                            const maxV = Math.max(aNum, bNum, 1);
                            const aWider = aNum >= bNum;
                            const diff = aNum - bNum;
                            const diffPct = maxV > 0 ? Math.round((Math.abs(diff) / maxV) * 100) : 0;
                            const highlightA = m.higherIsBad && aNum > bNum;
                            const highlightB = m.higherIsBad && bNum > aNum;
                            return <div key={m.label} style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}06` }}>
                                {/* Label row */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 10 }}>{m.icon}</span>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: theme.textSecondary }}>{m.label}</span>
                                    {diffPct > 15 && <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>Δ{diffPct}%</span>}
                                </div>
                                {/* Dual bar */}
                                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                    {/* A value */}
                                    <span style={{ width: 36, fontSize: 11, fontWeight: 800, color: highlightA ? '#ef4444' : '#3b82f6', fontFamily: "'JetBrains Mono', monospace", textAlign: 'right' as const }}>{m.aVal}</span>
                                    {/* A bar (right-aligned) */}
                                    <div style={{ flex: 1, height: 8, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
                                        <div style={{ width: `${(aNum / maxV) * 100}%`, height: '100%', borderRadius: 2, background: highlightA ? 'linear-gradient(90deg, #3b82f6, #ef4444)' : '#3b82f6', transition: 'width 0.4s' }} />
                                    </div>
                                    {/* Divider */}
                                    <div style={{ width: 2, height: 14, background: theme.border, borderRadius: 1, flexShrink: 0 }} />
                                    {/* B bar (left-aligned) */}
                                    <div style={{ flex: 1, height: 8, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden' }}>
                                        <div style={{ width: `${(bNum / maxV) * 100}%`, height: '100%', borderRadius: 2, background: highlightB ? 'linear-gradient(270deg, #ef4444, #ef444460)' : '#ef4444', transition: 'width 0.4s' }} />
                                    </div>
                                    {/* B value */}
                                    <span style={{ width: 36, fontSize: 11, fontWeight: 800, color: highlightB ? '#ef4444' : '#ef444499', fontFamily: "'JetBrains Mono', monospace", textAlign: 'left' as const }}>{m.bVal}</span>
                                </div>
                                {m.unit && <div style={{ textAlign: 'center' as const, fontSize: 7, color: theme.textDim, marginTop: 1 }}>{m.unit}</div>}
                            </div>;
                        })}

                        {/* Activity pattern comparison */}
                        {compareA !== compareB && <div style={{ padding: '10px 14px' }}>
                            <div style={{ fontSize: 8, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8 }}>📊 Weekly Activity Pattern</div>
                            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 50 }}>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                                    const aVal = [12, 15, 11, 18, 14, 6, 4][i] * (parseInt(compareA) === 9 ? 1.3 : 1);
                                    const bVal = [10, 8, 13, 9, 16, 12, 7][i] * (parseInt(compareB) === 9 ? 1.3 : 1);
                                    const maxD = Math.max(aVal, bVal, 1);
                                    return <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 1 }}>
                                        <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 36 }}>
                                            <div style={{ width: 6, height: `${(aVal / 25) * 100}%`, borderRadius: '2px 2px 0 0', background: '#3b82f6', minHeight: 2 }} />
                                            <div style={{ width: 6, height: `${(bVal / 25) * 100}%`, borderRadius: '2px 2px 0 0', background: '#ef4444', minHeight: 2 }} />
                                        </div>
                                        <span style={{ fontSize: 6, color: theme.textDim, fontWeight: 600 }}>{day}</span>
                                    </div>;
                                })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 8, height: 4, borderRadius: 1, background: '#3b82f6' }} /><span style={{ fontSize: 7, color: '#3b82f6', fontWeight: 600 }}>{heatCalPersonInfo[parseInt(compareA)]?.name.split(' ')[1] || 'A'}</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 8, height: 4, borderRadius: 1, background: '#ef4444' }} /><span style={{ fontSize: 7, color: '#ef4444', fontWeight: 600 }}>{heatCalPersonInfo[parseInt(compareB)]?.name.split(' ')[1] || 'B'}</span></div>
                            </div>
                        </div>}

                        {/* Overlap analysis */}
                        {compareA !== compareB && <div style={{ padding: '8px 14px' }}>
                            <div style={{ padding: '8px', borderRadius: 6, background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.1)' }}>
                                <div style={{ fontSize: 8, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 }}>🔗 Overlap Analysis</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                    {[
                                        { label: 'Co-locations', value: '23 events', color: '#ef4444' },
                                        { label: 'Shared Zones', value: '2 zones', color: '#f59e0b' },
                                        { label: 'Shared Contacts', value: '4 persons', color: '#3b82f6' },
                                        { label: 'Time Overlap', value: '68%', color: '#22c55e' },
                                    ].map(o => <div key={o.label} style={{ padding: '4px 6px', borderRadius: 4, background: `${theme.border}15` }}>
                                        <div style={{ fontSize: 7, color: theme.textDim }}>{o.label}</div>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: o.color }}>{o.value}</div>
                                    </div>)}
                                </div>
                            </div>
                        </div>}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 8, color: theme.textDim }}>{compareData.length} metrics · 30-day analysis window</span>
                        <div style={{ flex: 1 }} />
                        <span style={{ fontSize: 7, color: '#a855f7', fontWeight: 600 }}>ClickHouse + scikit-learn</span>
                    </div>
                    </>}
                </div>}

                {/* ═══ ROUTE REPLAY PANEL ═══ */}
                {showRouteReplay && loaded && <div data-panel="routereplay" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('routereplay' as PanelId); }} style={panelStyle('routereplay', '380px', '#ec4899')}>
                    <PanelHeader id="routereplay" icon="🎬" title="Route Replay" subtitle={`${heatCalPersonInfo[parseInt(rrPerson)]?.name || 'Select'} · ${(mockRoutes[rrPerson] || []).length} points`} color="#ec4899" onClose={() => { setShowRouteReplay(false); setRrPlaying(false); }} extra={rrPlaying ? <span style={{ fontSize: 7, fontWeight: 800, padding: '2px 5px', borderRadius: 3, background: '#ec489920', color: '#ec4899', border: '1px solid #ec489930', animation: 'argux-fadeIn 0.3s' }}>▶ PLAYING</span> : undefined} />
                    <PanelResizeGrip id="routereplay" />

                    {!isPanelMin('routereplay') && <>
                    {/* Person selector */}
                    <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Subject</div>
                        <div style={{ display: 'flex', gap: 3 }}>
                            {Object.entries(mockRoutes).map(([pid, route]) => {
                                const on = rrPerson === pid;
                                const info = heatCalPersonInfo[parseInt(pid)];
                                return <button key={pid} onClick={() => { setRrPerson(pid); setRrCursor(0); setRrPlaying(false); }} style={{ flex: 1, padding: '5px', borderRadius: 5, border: `1px solid ${on ? '#ec489940' : theme.border}`, background: on ? 'rgba(236,72,153,0.06)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: on ? '#ec4899' : theme.text }}>{info?.name.split(' ')[1] || pid}</div>
                                    <div style={{ fontSize: 7, color: theme.textDim }}>{route.length} pts</div>
                                </button>;
                            })}
                        </div>
                    </div>

                    {/* Transport controls */}
                    <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {/* Rewind */}
                            <button onClick={() => { setRrCursor(0); setRrPlaying(false); }} style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 10, flexShrink: 0 }}>⏮</button>
                            {/* Step back */}
                            <button onClick={() => setRrCursor(prev => Math.max(0, prev - 1))} style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 10, flexShrink: 0 }}>⏪</button>
                            {/* Play/Pause */}
                            <button onClick={() => { if (rrCursor >= (mockRoutes[rrPerson] || []).length - 1) setRrCursor(0); setRrPlaying(prev => !prev); }} style={{ width: 36, height: 28, borderRadius: 5, border: `1px solid ${rrPlaying ? '#ec489950' : theme.border}`, background: rrPlaying ? 'rgba(236,72,153,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: rrPlaying ? '#ec4899' : theme.textDim, fontSize: 12, flexShrink: 0 }}>{rrPlaying ? '⏸' : '▶️'}</button>
                            {/* Step forward */}
                            <button onClick={() => setRrCursor(prev => Math.min((mockRoutes[rrPerson] || []).length - 1, prev + 1))} style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 10, flexShrink: 0 }}>⏩</button>
                            {/* End */}
                            <button onClick={() => { setRrCursor((mockRoutes[rrPerson] || []).length - 1); setRrPlaying(false); }} style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 10, flexShrink: 0 }}>⏭</button>
                            <div style={{ flex: 1 }} />
                            {/* Speed */}
                            {[0.5, 1, 2, 4].map(s => <button key={s} onClick={() => setRrSpeed(s)} style={{ padding: '3px 6px', borderRadius: 3, border: `1px solid ${rrSpeed === s ? '#ec489940' : theme.border}`, background: rrSpeed === s ? 'rgba(236,72,153,0.08)' : 'transparent', color: rrSpeed === s ? '#ec4899' : theme.textDim, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>{s}×</button>)}
                        </div>

                        {/* Progress bar */}
                        <div style={{ marginTop: 6 }}>
                            <input type="range" min={0} max={Math.max(0, (mockRoutes[rrPerson] || []).length - 1)} value={rrCursor} onChange={e => { setRrCursor(parseInt(e.target.value)); setRrPlaying(false); }} style={{ width: '100%', height: 4, accentColor: '#ec4899' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: theme.textDim, marginTop: 2 }}>
                                <span>{(mockRoutes[rrPerson] || [])[rrCursor]?.ts || '--:--'}</span>
                                <span>{rrCursor + 1}/{(mockRoutes[rrPerson] || []).length}</span>
                                <span>{(mockRoutes[rrPerson] || [])[(mockRoutes[rrPerson] || []).length - 1]?.ts || '--:--'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Current position info */}
                    {(() => {
                        const route = mockRoutes[rrPerson] || [];
                        const pt = route[rrCursor];
                        if (!pt) return null;
                        return <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                                <div style={{ padding: '4px 6px', borderRadius: 4, background: `${theme.border}15`, textAlign: 'center' as const }}><div style={{ fontSize: 7, color: theme.textDim }}>Speed</div><div style={{ fontSize: 12, fontWeight: 800, color: pt.speed > 80 ? '#ef4444' : pt.speed > 0 ? '#22c55e' : theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{pt.speed}<span style={{ fontSize: 7, fontWeight: 400 }}> km/h</span></div></div>
                                <div style={{ padding: '4px 6px', borderRadius: 4, background: `${theme.border}15`, textAlign: 'center' as const }}><div style={{ fontSize: 7, color: theme.textDim }}>Bearing</div><div style={{ fontSize: 12, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono', monospace" }}>{pt.bearing}°</div></div>
                                <div style={{ padding: '4px 6px', borderRadius: 4, background: `${theme.border}15`, textAlign: 'center' as const }}><div style={{ fontSize: 7, color: theme.textDim }}>Time</div><div style={{ fontSize: 12, fontWeight: 800, color: '#ec4899', fontFamily: "'JetBrains Mono', monospace" }}>{pt.ts}</div></div>
                            </div>
                            <div style={{ marginTop: 4, fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", textAlign: 'center' as const }}>{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</div>
                        </div>;
                    })()}

                    {/* Event log — scrollable list of points */}
                    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                        {(mockRoutes[rrPerson] || []).map((pt, i) => {
                            const isCurrent = i === rrCursor;
                            const isPast = i < rrCursor;
                            const evtColors: Record<string, string> = { alert: '#ef4444', lpr: '#10b981', zone: '#f97316', face: '#ec4899', phone: '#06b6d4', gps: '#22c55e' };
                            return <div key={i} onClick={() => { setRrCursor(i); setRrPlaying(false); }} style={{ padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: isCurrent ? 'rgba(236,72,153,0.06)' : 'transparent', borderLeft: `3px solid ${isCurrent ? '#ec4899' : isPast ? '#ec489930' : 'transparent'}`, transition: 'background 0.1s', opacity: isPast && !isCurrent ? 0.5 : 1 }} onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }} onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}>
                                <span style={{ fontSize: 9, fontWeight: 700, color: isCurrent ? '#ec4899' : theme.textDim, fontFamily: "'JetBrains Mono', monospace", width: 34, flexShrink: 0 }}>{pt.ts}</span>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isCurrent ? '#ec4899' : isPast ? '#ec489940' : `${theme.border}40`, flexShrink: 0, boxShadow: isCurrent ? '0 0 8px #ec489960' : 'none' }} />
                                {pt.event ? <span style={{ fontSize: 9, color: evtColors[pt.eventType || ''] || theme.text, fontWeight: 600, flex: 1 }}>{pt.event}</span> : <span style={{ fontSize: 8, color: theme.textDim, flex: 1 }}>{pt.speed} km/h · {pt.bearing}°</span>}
                            </div>;
                        })}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 8, color: theme.textDim }}>{(mockRoutes[rrPerson] || []).length} waypoints · {(mockRoutes[rrPerson] || []).filter(p => p.event).length} events</span>
                        <div style={{ flex: 1 }} />
                        <span style={{ fontSize: 7, color: '#ec4899', fontWeight: 600 }}>GPS + Kafka</span>
                    </div>
                    </>}
                </div>}

                {/* ═══ WORKSPACES PANEL ═══ */}
                {showWorkspacesPanel && loaded && <div data-panel="workspaces" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('workspaces' as PanelId); }} style={panelStyle('workspaces', '360px', theme.accent)}>
                    <PanelHeader id="workspaces" icon="📋" title="Workspaces" subtitle={`${workspaces.length} saved${wsActiveId ? ` · ${workspaces.find(w => w.id === wsActiveId)?.name}` : ''}`} color={theme.accent} onClose={() => setShowWorkspacesPanel(false)} extra={<button onClick={openSaveWs} style={{ padding: '3px 8px', borderRadius: 3, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 8, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>💾 Save</button>} />
                    <PanelResizeGrip id="workspaces" />
                    {!isPanelMin('workspaces') && <>{/* Active workspace banner */}
                    {wsActiveId && <div style={{ padding: '6px 14px', borderBottom: `1px solid ${theme.border}10`, background: 'rgba(34,197,94,0.03)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 6px #22c55e60' }} />
                        <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 700, flex: 1 }}>{workspaces.find(w => w.id === wsActiveId)?.name}</span>
                        <button onClick={() => { const ws = workspaces.find(w => w.id === wsActiveId); if (ws) { updateWsState(ws); triggerTopLoader(); } }} style={{ fontSize: 7, padding: '2px 6px', borderRadius: 3, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.06)', color: theme.accent, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>💾 Update</button>
                    </div>}
                    {/* Search */}
                    <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${wsSearch ? theme.accent + '50' : theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                            <input value={wsSearch} onChange={e => setWsSearch(e.target.value)} placeholder="Search workspaces..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '7px 0', color: theme.text, fontSize: 11, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                            {wsSearch && <button onClick={() => setWsSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }}><svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}
                        </div>
                    </div>
                    {/* Workspace list */}
                    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                        {workspaces.filter(ws => { if (!wsSearch.trim()) return true; const q = wsSearch.toLowerCase(); return ws.name.toLowerCase().includes(q) || ws.description.toLowerCase().includes(q) || ws.tags.some(t => t.toLowerCase().includes(q)); }).length === 0 && <div style={{ padding: 30, textAlign: 'center' as const }}><div style={{ fontSize: 28, marginBottom: 8 }}>📋</div><div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>{wsSearch ? 'No Matches' : 'No Workspaces'}</div><div style={{ fontSize: 10, color: theme.textDim }}>{wsSearch ? 'Try a different search.' : 'Save your current map state as a workspace.'}</div></div>}
                        {workspaces.filter(ws => { if (!wsSearch.trim()) return true; const q = wsSearch.toLowerCase(); return ws.name.toLowerCase().includes(q) || ws.description.toLowerCase().includes(q) || ws.tags.some(t => t.toLowerCase().includes(q)); }).map(ws => {
                            const isActive = wsActiveId === ws.id;
                            const isDeleting = wsDeleteConfirm === ws.id;
                            return <div key={ws.id} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}08`, background: isActive ? 'rgba(34,197,94,0.03)' : isDeleting ? 'rgba(239,68,68,0.03)' : 'transparent', transition: 'background 0.15s' }} onMouseEnter={e => { if (!isActive && !isDeleting) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }} onMouseLeave={e => { if (!isActive && !isDeleting) e.currentTarget.style.background = 'transparent'; }}>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 6, background: isActive ? 'rgba(34,197,94,0.12)' : `${theme.accent}08`, border: `1px solid ${isActive ? '#22c55e30' : theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{isActive ? '✅' : '📋'}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? '#22c55e' : theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{ws.name}</div>
                                        <div style={{ fontSize: 9, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, marginTop: 1 }}>{ws.description}</div>
                                    </div>
                                    {isActive && <span style={{ fontSize: 7, fontWeight: 800, padding: '2px 5px', borderRadius: 3, background: '#22c55e15', color: '#22c55e', border: '1px solid #22c55e25', flexShrink: 0 }}>ACTIVE</span>}
                                </div>
                                {/* Tags */}
                                {ws.tags.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 4 }}>
                                    {ws.tags.map(t => <span key={t} style={{ fontSize: 7, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: `${theme.accent}08`, color: theme.accent, border: `1px solid ${theme.accent}15` }}>{t}</span>)}
                                </div>}
                                {/* Meta + state icons */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 8, color: theme.textDim, marginBottom: 6 }}>
                                    <span>📅 {ws.updatedAt.split(' ')[0]}</span>
                                    <span>🕐 {ws.updatedAt.split(' ')[1]}</span>
                                    <span>👤 {ws.state.selectedPersons.length}</span>
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        {ws.state.layerHeatmap && <span style={{ fontSize: 7, padding: '0 3px', borderRadius: 2, background: '#f59e0b10', color: '#f59e0b', border: '1px solid #f59e0b20' }}>🔥</span>}
                                        {ws.state.layerNetwork && <span style={{ fontSize: 7, padding: '0 3px', borderRadius: 2, background: '#8b5cf610', color: '#8b5cf6', border: '1px solid #8b5cf620' }}>🕸️</span>}
                                        {ws.state.layerLPR && <span style={{ fontSize: 7, padding: '0 3px', borderRadius: 2, background: '#10b98110', color: '#10b981', border: '1px solid #10b98120' }}>🚗</span>}
                                        {ws.state.layerFace && <span style={{ fontSize: 7, padding: '0 3px', borderRadius: 2, background: '#ec489910', color: '#ec4899', border: '1px solid #ec489920' }}>🧑‍🦲</span>}
                                        {ws.state.showZones && <span style={{ fontSize: 7, padding: '0 3px', borderRadius: 2, background: '#8b5cf610', color: '#8b5cf6', border: '1px solid #8b5cf620' }}>🛡️</span>}
                                    </div>
                                </div>
                                {/* Actions */}
                                {isDeleting ? <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 0' }}>
                                    <span style={{ fontSize: 9, color: theme.danger, flex: 1 }}>Delete this workspace?</span>
                                    <button onClick={() => deleteWorkspace(ws.id)} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: theme.danger, fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                                    <button onClick={() => setWsDeleteConfirm(null)} style={{ padding: '4px 10px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                                </div> : <div style={{ display: 'flex', gap: 4 }}>
                                    <button onClick={() => { loadWorkspace(ws); triggerTopLoader(); }} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${isActive ? '#22c55e25' : theme.accent + '25'}`, background: isActive ? 'rgba(34,197,94,0.06)' : `${theme.accent}06`, color: isActive ? '#22c55e' : theme.accent, fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{isActive ? '🔄 Reload' : '📂 Load'}</button>
                                    <button onClick={() => openEditWs(ws)} title="Edit" style={{ width: 28, height: 28, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: theme.textDim, fontSize: 10 }} onMouseEnter={e => (e.currentTarget.style.color = theme.accent)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}>✏️</button>
                                    <button onClick={() => { updateWsState(ws); triggerTopLoader(); }} title="Save current state" style={{ width: 28, height: 28, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: theme.textDim, fontSize: 10 }} onMouseEnter={e => (e.currentTarget.style.color = '#22c55e')} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}>💾</button>
                                    <button onClick={() => setWsDeleteConfirm(ws.id)} title="Delete" style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: theme.textDim, fontSize: 10 }} onMouseEnter={e => (e.currentTarget.style.color = theme.danger)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}>🗑️</button>
                                </div>}
                            </div>;
                        })}
                    </div>
                    {/* Footer */}
                    <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 8, color: theme.textDim }}>{workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}</span>
                    </div>
                </>}
                </div>}

                {/* ═══ SAVED PLACES PANEL ═══ */}
                {showPlacesPanel && loaded && <div data-panel="places" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('places' as PanelId); }} style={panelStyle('places', '320px', theme.accent)}>
                    <PanelHeader id="places" icon="📍" title="Saved Places" subtitle={`${savedPlaces.length} places`} color={theme.accent} onClose={() => setShowPlacesPanel(false)} extra={<><button onClick={openAddPlace} style={{ padding: '3px 8px', borderRadius: 3, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 8, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>+ Add</button><button onClick={addCurrentLocation} title="Save view" style={{ width: 20, height: 20, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 9, padding: 0 }}>📍</button></>} />
                    <PanelResizeGrip id="places" />
                    {!isPanelMin('places') && <>{/* Search */}
                    <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${placesSearch ? theme.accent + '50' : theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                            <input value={placesSearch} onChange={e => setPlacesSearch(e.target.value)} placeholder="Search places..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '7px 0', color: theme.text, fontSize: 11, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                            {placesSearch && <button onClick={() => setPlacesSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }}><svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}
                        </div>
                    </div>
                    {/* Place list */}
                    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                        {filteredPlaces.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const }}><div style={{ fontSize: 28, marginBottom: 8 }}>📍</div><div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>{placesSearch ? 'No Matches' : 'No Saved Places'}</div><div style={{ fontSize: 10, color: theme.textDim }}>{placesSearch ? 'Try a different search.' : 'Save locations for quick navigation.'}</div></div>}
                        {filteredPlaces.map(p => (
                            <div key={p.id} onClick={() => goToPlace(p)} style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}08`, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'background 0.1s', background: 'transparent' }} onMouseEnter={e => { e.currentTarget.style.background = `${p.color}08`; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${p.color}15`, border: `1.5px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' as const }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, boxShadow: `0 0 6px ${p.color}50` }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.name}</div>
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 1 }}>
                                        <span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span>
                                        <span style={{ fontSize: 7, color: theme.textDim }}>z{p.zoom}</span>
                                    </div>
                                    {p.note && <div style={{ fontSize: 8, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, marginTop: 1 }}>{p.note}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                    <button onClick={e => { e.stopPropagation(); openEditPlace(p); }} title="Edit" style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: theme.textDim }} onMouseEnter={e => (e.currentTarget.style.color = theme.accent)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 2l3 3-8 8H3v-3z"/></svg></button>
                                    <button onClick={e => { e.stopPropagation(); setDeleteConfirm(p); }} title="Delete" style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: theme.textDim }} onMouseEnter={e => (e.currentTarget.style.color = theme.danger)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Add/Edit form */}
                    {placeModal && <div style={{ padding: '10px 14px', borderTop: `1px solid ${theme.accent}20`, flexShrink: 0, background: 'rgba(29,111,239,0.02)' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.accent, marginBottom: 6 }}>{placeModal.mode === 'add' ? '+ New Place' : '✎ Edit Place'}</div>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                            <input value={placeForm.name} onChange={e => setPlaceForm(f => ({ ...f, name: e.target.value }))} placeholder="Place name *" style={{ width: '100%', padding: '7px 10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.text, fontSize: 11, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
                            <div style={{ display: 'flex', gap: 6 }}>
                                <input value={placeForm.lat} onChange={e => setPlaceForm(f => ({ ...f, lat: e.target.value }))} placeholder="Latitude *" style={{ flex: 1, padding: '7px 10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.text, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: 'none', minWidth: 0 }} />
                                <input value={placeForm.lng} onChange={e => setPlaceForm(f => ({ ...f, lng: e.target.value }))} placeholder="Longitude *" style={{ flex: 1, padding: '7px 10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.text, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: 'none', minWidth: 0 }} />
                                <input value={placeForm.zoom} onChange={e => setPlaceForm(f => ({ ...f, zoom: e.target.value }))} placeholder="Z" style={{ width: 40, padding: '7px 4px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.text, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: 'none', textAlign: 'center' as const }} />
                            </div>
                            <input value={placeForm.note} onChange={e => setPlaceForm(f => ({ ...f, note: e.target.value }))} placeholder="Note (optional)" style={{ width: '100%', padding: '7px 10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.text, fontSize: 10, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ fontSize: 9, color: theme.textDim, marginRight: 2 }}>Color</span>{placeColors.map(c => <button key={c} onClick={() => setPlaceForm(f => ({ ...f, color: c }))} style={{ width: 16, height: 16, borderRadius: 4, background: c, border: placeForm.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', padding: 0, boxShadow: placeForm.color === c ? `0 0 6px ${c}60` : 'none' }} />)}</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={savePlace} disabled={!placeForm.name.trim() || !placeForm.lat || !placeForm.lng} style={{ flex: 1, padding: '7px 0', borderRadius: 5, border: 'none', background: (!placeForm.name.trim() || !placeForm.lat || !placeForm.lng) ? theme.border : theme.accent, color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'inherit', cursor: (!placeForm.name.trim() || !placeForm.lat || !placeForm.lng) ? 'not-allowed' : 'pointer', opacity: (!placeForm.name.trim() || !placeForm.lat || !placeForm.lng) ? 0.4 : 1 }}>{placeModal.mode === 'add' ? 'Save Place' : 'Update'}</button>
                                <button onClick={() => setPlaceModal(null)} style={{ padding: '7px 14px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 10, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </div>
                    </div>}
                    {/* Delete confirmation */}
                    {deleteConfirm && <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(239,68,68,0.2)', flexShrink: 0, background: 'rgba(239,68,68,0.02)' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.danger, marginBottom: 4 }}>Delete "{deleteConfirm.name}"?</div>
                        <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 8 }}>This action cannot be undone.</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={confirmDeletePlace} style={{ flex: 1, padding: '7px 0', borderRadius: 5, border: 'none', background: theme.danger, color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>Delete</button>
                            <button onClick={() => setDeleteConfirm(null)} style={{ padding: '7px 14px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 10, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>}
                    {/* Footer */}
                    <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 8, color: theme.textDim }}>{filteredPlaces.length} of {savedPlaces.length} shown</span>
                    </div>
                </>}
                </div>}

                {/* ═══ TOOL PANELS ═══ */}
                {/* Ruler Panel */}
                {showRulerPanel && loaded && <div data-panel="ruler" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('ruler' as PanelId); }} style={panelStyle('ruler', '320px', rulerActive ? '#f59e0b' : theme.border)}>
                    <PanelHeader id="ruler" icon="📏" title="Ruler" subtitle={rulerActive ? `${rulerPoints.length} points · Click map to add` : 'Measure distances'} color="#f59e0b" onClose={() => setShowRulerPanel(false)} extra={<button onClick={() => { if (rulerActive) { stopRuler(); } else { setRulerPoints([]); setRulerActive(true); triggerTopLoader(); setZoneDrawing(null); } }} style={{ padding: '3px 8px', borderRadius: 3, border: `1px solid ${rulerActive ? '#f59e0b40' : '#22c55e30'}`, background: rulerActive ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.06)', color: rulerActive ? '#f59e0b' : '#22c55e', fontSize: 8, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{rulerActive ? '⏹ Stop' : '▶ Start'}</button>} />
                    <PanelResizeGrip id="ruler" />
                    {!isPanelMin('ruler') && <><div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0, padding: '10px 14px' }}>
                        {/* Total distance card */}
                        {rulerPoints.length >= 2 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 10 }}>
                            <div><div style={{ fontSize: 8, color: theme.textDim, marginBottom: 1 }}>Total Distance</div><div style={{ fontSize: 16, fontWeight: 800, color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>{formatDist(calcDistance(rulerPoints))}</div></div>
                            <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 8, color: theme.textDim }}>{rulerPoints.length} pts · {rulerPoints.length - 1} seg</div></div>
                        </div>}
                        {/* Points list */}
                        {rulerPoints.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                            {rulerPoints.map((pt, i) => {
                                const segDist = i > 0 ? calcDistance([rulerPoints[i - 1], pt]) : 0;
                                return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 5, background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.08)' }}>
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(245,158,11,0.12)', border: '1.5px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#f59e0b', flexShrink: 0 }}>{i + 1}</div>
                                    <div style={{ flex: 1 }}><span style={{ fontSize: 9, color: theme.text, fontFamily: "'JetBrains Mono', monospace" }}>{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</span><div style={{ fontSize: 7, color: theme.textDim }}>{mockAddress(pt.lat, pt.lng)}</div></div>
                                    {i > 0 && <span style={{ fontSize: 9, fontWeight: 700, color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>+{formatDist(segDist)}</span>}
                                </div>;
                            })}
                        </div> : <div style={{ padding: 20, textAlign: 'center' as const }}><div style={{ fontSize: 24, marginBottom: 6 }}>📏</div><div style={{ fontSize: 11, fontWeight: 600, color: theme.textSecondary }}>{rulerActive ? 'Click on the map to add points' : 'Start the ruler to begin measuring'}</div></div>}
                    </div>
                    {rulerPoints.length > 0 && <div style={{ padding: '8px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button onClick={undoRulerPoint} style={{ flex: 1, padding: '6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>↩ Undo</button>
                        <button onClick={clearRuler} style={{ flex: 1, padding: '6px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', color: theme.danger, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>🗑️ Clear All</button>
                    </div>}
                </>}
                </div>}

                {/* Zone Editor Panel */}
                {showZonePanel && loaded && <div data-panel="zone" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('zone' as PanelId); }} style={panelStyle('zone', '340px', zoneDrawing ? '#8b5cf6' : theme.border)}>
                    <PanelHeader id="zone" icon="🛡️" title="Zone Editor" subtitle={`${zones.length} zones · ${zones.length - hiddenZones.size} visible${zoneDrawing ? ' · Drawing...' : ''}`} color="#8b5cf6" onClose={() => setShowZonePanel(false)} extra={<button onClick={openAddZone} style={{ padding: '3px 8px', borderRadius: 3, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 8, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>+ Add</button>} />
                    <PanelResizeGrip id="zone" />
                    {!isPanelMin('zone') && <>{/* Draw zone buttons */}
                    {!zoneDrawing && <div style={{ display: 'flex', gap: 4, padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                        <button onClick={() => startDrawZone('circle')} style={{ flex: 1, padding: '6px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf650'; e.currentTarget.style.color = '#8b5cf6'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textDim; }}>⭕ Circle</button>
                        <button onClick={() => startDrawZone('polygon')} style={{ flex: 1, padding: '6px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf650'; e.currentTarget.style.color = '#8b5cf6'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textDim; }}>⬡ Polygon</button>
                    </div>}
                    {zoneDrawing && <div style={{ padding: '6px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}><div style={{ padding: '5px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', fontSize: 9, color: '#8b5cf6', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Drawing {zoneDrawing.shape} — {zoneDrawing.points.length} pts<button onClick={() => setZoneDrawing(null)} style={{ fontSize: 8, color: theme.danger, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Cancel</button></div></div>}
                    {/* Search */}
                    <div style={{ padding: '6px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${zoneSearch ? '#8b5cf650' : theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                            <input value={zoneSearch} onChange={e => setZoneSearch(e.target.value)} placeholder="Search zones..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '7px 0', color: theme.text, fontSize: 11, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                            {zoneSearch && <button onClick={() => setZoneSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }}><svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}
                        </div>
                    </div>
                    {/* Zone list */}
                    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                        {filteredZones.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const }}><div style={{ fontSize: 28, marginBottom: 8 }}>🛡️</div><div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>{zoneSearch ? 'No Matches' : 'No Zones'}</div><div style={{ fontSize: 10, color: theme.textDim }}>{zoneSearch ? 'Try a different search.' : 'Draw a circle or polygon on the map.'}</div></div>}
                        {filteredZones.map(z => {
                            const isHidden = hiddenZones.has(z.id);
                            const zt = zoneTypes.find(t => t.id === z.type);
                            return <div key={z.id} onClick={() => goToZone(z)} style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}08`, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: isHidden ? 0.45 : 1, transition: 'all 0.15s, background 0.1s', background: 'transparent' }} onMouseEnter={e => { e.currentTarget.style.background = `${z.color}06`; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                <div style={{ width: 28, height: 28, borderRadius: z.shape === 'circle' ? '50%' : 5, background: `${z.color}12`, border: `1.5px solid ${z.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, position: 'relative' as const }}>{zt?.icon || '🛡️'}{isHidden && <div style={{ position: 'absolute' as const, inset: 0, borderRadius: 'inherit', background: 'rgba(13,18,32,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/></svg></div>}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: isHidden ? theme.textDim : theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, textDecoration: isHidden ? 'line-through' : 'none' }}>{z.name}</div>
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 1 }}><span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 2, background: `${z.color}12`, color: z.color, border: `1px solid ${z.color}20` }}>{zt?.label || z.type}</span><span style={{ fontSize: 7, color: theme.textDim }}>{z.shape === 'circle' ? `${z.radius}m radius` : `${z.points?.length || 0} vertices`}</span></div>
                                </div>
                                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                    <button onClick={e => { e.stopPropagation(); toggleZoneVisibility(z.id); triggerTopLoader(); }} title={isHidden ? 'Show' : 'Hide'} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${isHidden ? theme.danger + '20' : theme.border}`, background: isHidden ? 'rgba(239,68,68,0.04)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 9, color: isHidden ? theme.danger : theme.textDim }}>{isHidden ? '👁️‍🗨️' : '👁️'}</button>
                                    <button onClick={e => { e.stopPropagation(); openEditZone(z); }} title="Edit" style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: theme.textDim }} onMouseEnter={e => (e.currentTarget.style.color = theme.accent)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 2l3 3-8 8H3v-3z"/></svg></button>
                                    <button onClick={e => { e.stopPropagation(); setZoneDeleteConfirm(z); }} title="Delete" style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: theme.textDim }} onMouseEnter={e => (e.currentTarget.style.color = theme.danger)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
                                </div>
                            </div>;
                        })}
                    </div>
                    <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 8, color: theme.textDim }}>{filteredZones.length} of {zones.length} zones</span>
                        <div style={{ flex: 1 }} />
                        {hiddenZones.size > 0 && <button onClick={() => { setHiddenZones(new Set()); triggerTopLoader(); }} style={{ fontSize: 7, padding: '2px 6px', borderRadius: 3, border: '1px solid #22c55e20', background: '#22c55e06', color: '#22c55e', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>👁️ Show All ({hiddenZones.size})</button>}
                    </div>
                </>}
                </div>}

                {/* ═══ LAYER PANELS ═══ */}
                {/* Only one layer panel open at a time — positioned bottom-right */}
                {activeLayerPanel && loaded && <div data-panel="layers" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('layers' as PanelId); }} style={panelStyle('layers', '340px', activeLayerPanel === 'heatmap' ? '#f59e0b' : activeLayerPanel === 'network' ? '#8b5cf6' : activeLayerPanel === 'lpr' ? '#10b981' : '#ec4899')}>
                    <PanelHeader id="layers" icon={activeLayerPanel === 'heatmap' ? '🔥' : activeLayerPanel === 'network' ? '🕸️' : activeLayerPanel === 'lpr' ? '🚗' : '🧑‍🦲'} title={activeLayerPanel === 'heatmap' ? 'Activity Heatmap' : activeLayerPanel === 'network' ? 'Network Graph' : activeLayerPanel === 'lpr' ? 'Plate Recognition' : 'Face Recognition'} subtitle={activeLayerPanel === 'heatmap' ? `${heatmapPoints.length} points · ${layerHeatmap ? 'Active' : 'Inactive'}` : activeLayerPanel === 'network' ? `${netNodes.length} nodes · ${netFilteredEdges.length} connections` : activeLayerPanel === 'lpr' ? `${mockLPR.length} sightings · ${new Set(mockLPR.map(l => l.plate)).size} plates` : `${mockFaces.length} captures · ${mockFaces.filter(f => f.personId > 0).length} matched`} color={activeLayerPanel === 'heatmap' ? '#f59e0b' : activeLayerPanel === 'network' ? '#8b5cf6' : activeLayerPanel === 'lpr' ? '#10b981' : '#ec4899'} onClose={() => { setShowHeatmapPanel(false); setShowNetworkPanel(false); setShowLPRPanel(false); setShowFacePanel(false); }} extra={<button onClick={() => { if (activeLayerPanel === 'heatmap') setLayerHeatmap(!layerHeatmap); else if (activeLayerPanel === 'network') setLayerNetwork(!layerNetwork); else if (activeLayerPanel === 'lpr') setLayerLPR(!layerLPR); else setLayerFace(!layerFace); triggerTopLoader(); }} style={{ width: 28, height: 14, borderRadius: 7, border: 'none', background: (activeLayerPanel === 'heatmap' ? layerHeatmap : activeLayerPanel === 'network' ? layerNetwork : activeLayerPanel === 'lpr' ? layerLPR : layerFace) ? (activeLayerPanel === 'heatmap' ? '#f59e0b' : activeLayerPanel === 'network' ? '#8b5cf6' : activeLayerPanel === 'lpr' ? '#10b981' : '#ec4899') : theme.border, cursor: 'pointer', position: 'relative' as const, transition: 'background 0.2s', padding: 0, flexShrink: 0 }}><div style={{ width: 10, height: 10, borderRadius: 5, background: '#fff', position: 'absolute' as const, top: 2, left: (activeLayerPanel === 'heatmap' ? layerHeatmap : activeLayerPanel === 'network' ? layerNetwork : activeLayerPanel === 'lpr' ? layerLPR : layerFace) ? 16 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} /></button>} />
                    <PanelResizeGrip id="layers" />

                    {!isPanelMin('layers') && <><div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>

                        {/* ── HEATMAP PANEL ── */}
                        {activeLayerPanel === 'heatmap' && <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                            <div style={{ fontSize: 10, color: theme.textDim }}>{heatmapPoints.length} activity points plotted. Density visualization shows areas of high surveillance activity concentration.</div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: theme.textDim, marginBottom: 4 }}><span>Intensity</span><span style={{ color: '#f59e0b', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{(heatmapIntensity * 100).toFixed(0)}%</span></div>
                                <input type="range" min="10" max="100" step="5" value={heatmapIntensity * 100} onChange={e => setHeatmapIntensity(parseInt(e.target.value) / 100)} style={{ width: '100%', accentColor: '#f59e0b', height: 4 }} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: theme.textDim, marginBottom: 4 }}><span>Radius</span><span style={{ color: '#f59e0b', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{heatmapRadius}px</span></div>
                                <input type="range" min="10" max="60" step="5" value={heatmapRadius} onChange={e => setHeatmapRadius(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b', height: 4 }} />
                            </div>
                            <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 }}>Legend</div><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{[['🔵', 'Low'], ['🟢', 'Medium'], ['🟡', 'High'], ['🔴', 'Critical'], ['⚪', 'Peak']].map(([ico, lbl]) => <span key={lbl} style={{ fontSize: 9, color: theme.textDim, display: 'flex', alignItems: 'center', gap: 3 }}>{ico} {lbl}</span>)}</div></div>
                        </div>}

                        {/* ── NETWORK PANEL ── */}
                        {activeLayerPanel === 'network' && <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                            {/* Isolation indicator */}
                            {(netIsolatedEdge || netFocusNode) && <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', borderRadius: 5, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />
                                <span style={{ fontSize: 9, color: '#8b5cf6', fontWeight: 600, flex: 1 }}>{netIsolatedEdge ? (() => { const e = netEdges.find(ee => edgeKey(ee) === netIsolatedEdge); if (!e) return 'Isolated'; const from = netNodes.find(n => n.id === e.from); const to = netNodes.find(n => n.id === e.to); return `${from?.label} ↔ ${to?.label}`; })() : `Focus: ${netNodes.find(n => n.id === netFocusNode)?.label}`}</span>
                                <button onClick={() => { setNetIsolatedEdge(null); setNetFocusNode(null); }} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3, border: '1px solid #8b5cf625', background: 'transparent', color: '#8b5cf6', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>✕</button>
                            </div>}
                            <input value={netSearch} onChange={e => setNetSearch(e.target.value)} placeholder="Search nodes..." style={{ padding: '6px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${netSearch ? '#8b5cf650' : theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', outline: 'none', width: '100%' }} />
                            {/* Node filters */}
                            <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 3 }}>Nodes</div>
                                {[{ label: 'Persons', icon: '👤', enabled: networkShowPersons, toggle: setNetworkShowPersons, count: netNodes.filter(n => n.type === 'person').length, color: '#ef4444' }, { label: 'Organizations', icon: '🏢', enabled: networkShowOrgs, toggle: setNetworkShowOrgs, count: netNodes.filter(n => n.type === 'org').length, color: '#3b82f6' }, { label: 'Devices', icon: '📡', enabled: networkShowDevices, toggle: setNetworkShowDevices, count: netNodes.filter(n => n.type === 'device').length, color: '#22c55e' }].map(f => <button key={f.label} onClick={() => { f.toggle(!f.enabled); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 5, border: `1px solid ${f.enabled ? f.color + '40' : theme.border}`, background: f.enabled ? f.color + '08' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const, marginBottom: 2 }}><span style={{ fontSize: 11 }}>{f.icon}</span><span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: f.enabled ? f.color : theme.textDim }}>{f.label}</span><span style={{ fontSize: 8, color: theme.textDim }}>{f.count}</span><div style={{ width: 8, height: 8, borderRadius: 2, border: `1.5px solid ${f.enabled ? f.color : theme.border}`, background: f.enabled ? f.color : 'transparent' }}>{f.enabled && <svg width="5" height="5" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div></button>)}
                            </div>
                            {/* Edge type filters */}
                            <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 3 }}>Connection Types</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>{Object.entries(edgeColors).map(([type, color]) => { const on = netEdgeFilters.has(type); const cnt = netEdges.filter(e => e.type === type).length; return <button key={type} onClick={() => { setNetEdgeFilters(prev => { const n = new Set(prev); n.has(type) ? n.delete(type) : n.add(type); return n; }); triggerTopLoader(); }} style={{ padding: '3px 7px', borderRadius: 4, border: `1px solid ${on ? color + '40' : theme.border}`, background: on ? color + '08' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 600, color: on ? color : theme.textDim }}><span style={{ width: 8, height: 3, borderRadius: 1, background: on ? color : theme.border }} />{type} <span style={{ fontSize: 7, opacity: 0.7 }}>{cnt}</span></button>; })}</div></div>
                            {/* Strength slider */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Min Strength</span><span style={{ fontSize: 9, fontWeight: 700, color: '#8b5cf6', fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(netStrengthMin * 100)}%</span></div>
                                <input type="range" min={0} max={100} value={netStrengthMin * 100} onChange={e => setNetStrengthMin(parseInt(e.target.value) / 100)} style={{ width: '100%', height: 4, accentColor: '#8b5cf6' }} />
                            </div>
                            {/* Connection list */}
                            <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 3 }}>Connections · click to isolate</div><div style={{ maxHeight: 150, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const, gap: 1 }}>{netFilteredEdges.map(e => { const from = netNodes.find(n => n.id === e.from); const to = netNodes.find(n => n.id === e.to); const isIso = netIsolatedEdge === edgeKey(e); return <button key={edgeKey(e)} onClick={() => { setNetIsolatedEdge(prev => prev === edgeKey(e) ? null : edgeKey(e)); setNetFocusNode(null); triggerTopLoader(); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', borderRadius: 4, border: `1px solid ${isIso ? '#8b5cf630' : 'transparent'}`, background: isIso ? 'rgba(139,92,246,0.06)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' as const }}><span style={{ width: 8, height: 3, borderRadius: 1, background: edgeColors[e.type], flexShrink: 0 }} /><span style={{ fontSize: 9, fontWeight: 600, color: isIso ? '#8b5cf6' : theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{from?.label} ↔ {to?.label}</span><span style={{ fontSize: 7, color: edgeColors[e.type], fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{Math.round(e.strength * 100)}%</span>{isIso && <span style={{ fontSize: 7, color: '#8b5cf6' }}>🎯</span>}</button>; })}</div></div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                <button onClick={() => { setNetShowLabels(!netShowLabels); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: `1px solid ${netShowLabels ? '#8b5cf630' : theme.border}`, background: netShowLabels ? '#8b5cf608' : 'transparent', color: netShowLabels ? '#8b5cf6' : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>🏷️ Labels</button>
                                <button onClick={() => { setNetIsolatedEdge(null); setNetFocusNode(null); setNetStrengthMin(0); setNetEdgeFilters(new Set(['financial', 'family', 'business', 'criminal', 'comms', 'surveillance'])); setNetSearch(''); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>🔄 Reset</button>
                                <button onClick={() => { triggerTopLoader(); const map = mapRef.current; if (!map) return; const lats = netNodes.map(n => n.lat); const lngs = netNodes.map(n => n.lng); map.fitBounds([[Math.min(...lngs) - 0.005, Math.min(...lats) - 0.005], [Math.max(...lngs) + 0.005, Math.max(...lats) + 0.005]], { padding: 40, duration: 800 }); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>🔎 Fit All</button>
                            </div>
                        </div>}

                        {/* ── LPR PANEL ── */}
                        {activeLayerPanel === 'lpr' && <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                            <div style={{ fontSize: 9, color: theme.textDim }}>{mockLPR.length} sightings · {new Set(mockLPR.map(l => l.plate)).size} plates{lprHidden.size > 0 ? ` · ${lprHidden.size} hidden` : ''}</div>
                            <input value={lprSearch} onChange={e => setLprSearch(e.target.value)} placeholder="Search plates, persons..." style={{ padding: '6px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${lprSearch ? '#10b98150' : theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', outline: 'none', width: '100%' }} />
                            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column' as const, gap: 3, scrollbarWidth: 'thin' }}>
                                {mockLPR.filter(l => { if (lprSearch.trim()) { const q = lprSearch.toLowerCase(); return l.plate.toLowerCase().includes(q) || l.personName.toLowerCase().includes(q) || l.cameraName.toLowerCase().includes(q) || (l.orgName || '').toLowerCase().includes(q); } return true; }).map(lpr => { const confColor = lpr.confidence >= 95 ? '#22c55e' : lpr.confidence >= 85 ? '#f59e0b' : '#ef4444'; const v = mockVehicles.find(vv => vv.id === lpr.vehicleId); const isSelected = lprSelected.size === 0 || lprSelected.has(lpr.id); const isHidden = lprHidden.has(lpr.id); return <div key={lpr.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 5, background: isHidden ? 'rgba(107,114,128,0.04)' : isSelected && lprSelected.size > 0 ? 'rgba(16,185,129,0.04)' : 'transparent', border: `1px solid ${isHidden ? theme.border + '50' : isSelected && lprSelected.size > 0 ? '#10b98120' : theme.border}`, opacity: isHidden ? 0.5 : 1 }}>
                                    <button onClick={() => { setLprSelected(prev => { const n = new Set(prev); if (prev.size === 0) { mockLPR.forEach(l => { if (l.id !== lpr.id) n.add(l.id); }); } else if (n.has(lpr.id)) { n.delete(lpr.id); if (n.size === 0) return new Set(); } else { n.add(lpr.id); } return n; }); }} style={{ width: 12, height: 12, borderRadius: 2, border: `1.5px solid ${isSelected ? '#10b981' : theme.border}`, background: isSelected && lprSelected.size > 0 ? '#10b981' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}>{isSelected && lprSelected.size > 0 && <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</button>
                                    <div style={{ width: 26, height: 18, borderRadius: 3, border: '1.5px solid #10b981', background: 'url(https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/registration_plate.jpg) center/cover', flexShrink: 0, cursor: 'pointer' }} onClick={() => setTlLightbox('https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/registration_plate.jpg')} />
                                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ fontSize: 10, fontWeight: 700, color: isHidden ? theme.textDim : theme.text, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.03em' }}>{lpr.plate}</span><span style={{ fontSize: 8, color: confColor, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{lpr.confidence}%</span></div><div style={{ fontSize: 7, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{lpr.personName}{v ? ` · ${v.make} ${v.model}` : ''}</div></div>
                                    <button onClick={() => setLprHidden(prev => { const n = new Set(prev); n.has(lpr.id) ? n.delete(lpr.id) : n.add(lpr.id); return n; })} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${isHidden ? theme.danger + '30' : theme.border}`, background: isHidden ? 'rgba(239,68,68,0.04)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0, fontSize: 8, color: isHidden ? theme.danger : theme.textDim }}>{isHidden ? '👁️‍🗨️' : '👁️'}</button>
                                </div>; })}
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                <button onClick={() => { setLprSelected(new Set()); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: lprSelected.size === 0 ? '#10b98108' : 'transparent', color: lprSelected.size === 0 ? '#10b981' : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>All</button>
                                <button onClick={() => { setLprSelected(new Set(mockLPR.filter(l => l.personId > 0).map(l => l.id))); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Known</button>
                                {lprHidden.size > 0 && <button onClick={() => { setLprHidden(new Set()); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', color: theme.danger, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Show {lprHidden.size} hidden</button>}
                            </div>
                        </div>}

                        {/* ── FACE PANEL ── */}
                        {activeLayerPanel === 'face' && <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                            <div style={{ fontSize: 9, color: theme.textDim }}>{mockFaces.length} captures · {mockFaces.filter(f => f.personId > 0).length} matched · {mockFaces.filter(f => f.personId === 0).length} unidentified{faceHidden.size > 0 ? ` · ${faceHidden.size} hidden` : ''}</div>
                            <input value={faceSearch} onChange={e => setFaceSearch(e.target.value)} placeholder="Search captures..." style={{ padding: '6px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${faceSearch ? '#ec489950' : theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', outline: 'none', width: '100%' }} />
                            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column' as const, gap: 3, scrollbarWidth: 'thin' }}>
                                {mockFaces.filter(fr => { if (faceSearch.trim()) { const q = faceSearch.toLowerCase(); return fr.personName.toLowerCase().includes(q) || fr.cameraName.toLowerCase().includes(q) || fr.emotion.toLowerCase().includes(q); } return true; }).map(fr => { const riskColor = fr.risk === 'Critical' ? '#ef4444' : fr.risk === 'High' ? '#f97316' : '#f59e0b'; const confColor = fr.confidence >= 90 ? '#22c55e' : fr.confidence >= 75 ? '#f59e0b' : '#ef4444'; const isSelected = faceSelected.size === 0 || faceSelected.has(fr.id); const isHidden = faceHidden.has(fr.id); return <div key={fr.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 5, background: isHidden ? 'rgba(107,114,128,0.04)' : isSelected && faceSelected.size > 0 ? 'rgba(236,72,153,0.04)' : 'transparent', border: `1px solid ${isHidden ? theme.border + '50' : isSelected && faceSelected.size > 0 ? '#ec489920' : theme.border}`, opacity: isHidden ? 0.5 : 1 }}>
                                    <button onClick={() => { setFaceSelected(prev => { const n = new Set(prev); if (prev.size === 0) { mockFaces.forEach(f => { if (f.id !== fr.id) n.add(f.id); }); } else if (n.has(fr.id)) { n.delete(fr.id); if (n.size === 0) return new Set(); } else { n.add(fr.id); } return n; }); }} style={{ width: 12, height: 12, borderRadius: 2, border: `1.5px solid ${isSelected ? '#ec4899' : theme.border}`, background: isSelected && faceSelected.size > 0 ? '#ec4899' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}>{isSelected && faceSelected.size > 0 && <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</button>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${riskColor}`, background: 'url(https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg) center/cover', flexShrink: 0, cursor: 'pointer' }} onClick={() => setTlLightbox('https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg')} />
                                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 10, fontWeight: 600, color: isHidden ? theme.textDim : theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{fr.personName}</div><div style={{ fontSize: 7, color: theme.textDim, display: 'flex', gap: 4, alignItems: 'center' }}><span>{fr.cameraName}</span><span style={{ color: confColor, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{fr.confidence}%</span></div></div>
                                    <button onClick={() => setFaceHidden(prev => { const n = new Set(prev); n.has(fr.id) ? n.delete(fr.id) : n.add(fr.id); return n; })} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${isHidden ? theme.danger + '30' : theme.border}`, background: isHidden ? 'rgba(239,68,68,0.04)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0, fontSize: 8, color: isHidden ? theme.danger : theme.textDim }}>{isHidden ? '👁️‍🗨️' : '👁️'}</button>
                                </div>; })}
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                <button onClick={() => { setFaceSelected(new Set()); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: faceSelected.size === 0 ? '#ec489908' : 'transparent', color: faceSelected.size === 0 ? '#ec4899' : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>All</button>
                                <button onClick={() => { setFaceSelected(new Set(mockFaces.filter(f => f.personId > 0).map(f => f.id))); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Matched</button>
                                <button onClick={() => { setFaceSelected(new Set(mockFaces.filter(f => f.personId === 0).map(f => f.id))); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Unknown</button>
                                {faceHidden.size > 0 && <button onClick={() => { setFaceHidden(new Set()); triggerTopLoader(); }} style={{ fontSize: 8, padding: '3px 7px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', color: theme.danger, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Show {faceHidden.size} hidden</button>}
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{[['🟢', '≥90%'], ['🟡', '75-89%'], ['🔴', '<75%'], ['⚫', 'Unknown']].map(([ico, lbl]) => <span key={lbl} style={{ fontSize: 8, color: theme.textDim, display: 'flex', alignItems: 'center', gap: 2 }}>{ico} {lbl}</span>)}</div>
                        </div>}
                    </div>
                </>}
                </div>}

                {/* Objects Panel */}
                {showObjectsPanel && loaded && <div data-panel="objects" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('objects' as PanelId); }} style={panelStyle('objects', '380px', theme.accent)}>
                    <PanelHeader id="objects" icon="📋" title="Map Objects" subtitle={`${mapObjects.length} objects · ${mapObjects.filter(o => o.visible).length} visible · ${mapObjects.filter(o => !o.visible).length} hidden`} color={theme.accent} onClose={() => setShowObjectsPanel(false)} extra={mapObjects.some(o => !o.visible) ? <button onClick={() => setMapObjects(prev => prev.map(o => ({ ...o, visible: true })))} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, border: '1px solid #22c55e25', background: '#22c55e08', color: '#22c55e', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>Show All</button> : undefined} />
                    <PanelResizeGrip id="objects" />

                    {!isPanelMin('objects') && <>{/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}20`, flexShrink: 0 }}>
                        {[{ id: 'all' as const, label: 'All', count: mapObjects.length }, { id: 'markers' as const, label: 'Markers', count: mapObjects.filter(o => o.type === 'marker').length }, { id: 'shapes' as const, label: 'Shapes', count: mapObjects.filter(o => o.type !== 'marker').length }].map(t => <button key={t.id} onClick={() => setObjPanelTab(t.id)} style={{ flex: 1, padding: '7px 0', background: 'transparent', border: 'none', borderBottom: `2px solid ${objPanelTab === t.id ? theme.accent : 'transparent'}`, color: objPanelTab === t.id ? theme.accent : theme.textDim, fontSize: 9, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>{t.label}{t.count > 0 && <span style={{ fontSize: 7, fontWeight: 800, padding: '0 3px', borderRadius: 3, background: objPanelTab === t.id ? `${theme.accent}15` : theme.border, color: objPanelTab === t.id ? theme.accent : theme.textDim }}>{t.count}</span>}</button>)}
                    </div>

                    {/* Search */}
                    <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${objSearch ? theme.accent + '50' : theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                            <input value={objSearch} onChange={e => setObjSearch(e.target.value)} placeholder="Search objects by name or type..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '7px 0', color: theme.text, fontSize: 11, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                            {objSearch && <button onClick={() => setObjSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2, display: 'flex' }}><svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}
                        </div>
                    </div>

                    {/* Object list */}
                    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                        {filteredObjects.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{objPanelTab === 'markers' ? '📌' : objPanelTab === 'shapes' ? '⬡' : '📋'}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary, marginBottom: 4 }}>{objSearch ? 'No Matches' : 'No Objects'}</div>
                            <div style={{ fontSize: 10, color: theme.textDim }}>{objSearch ? 'Try a different search term.' : 'Use the draw tools in the sidebar to create objects on the map.'}</div>
                        </div>}
                        {filteredObjects.map(o => {
                            const hidden = !o.visible;
                            const typeInfo = objTypeLabels[o.type];
                            const coordStr = o.coords.length > 0 ? `${o.coords[0][1].toFixed(4)}, ${o.coords[0][0].toFixed(4)}` : '—';
                            return <div key={o.id} style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}08`, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: hidden ? 0.45 : 1, transition: 'all 0.15s, background 0.1s', background: 'transparent' }} onMouseEnter={e => { e.currentTarget.style.background = `${o.color}06`; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }} onClick={() => goToObj(o)}>
                                {/* Color dot + icon */}
                                <div style={{ width: 30, height: 30, borderRadius: o.type === 'marker' ? '50%' : 6, background: `${o.color}12`, border: `1.5px solid ${o.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, position: 'relative' as const }}>{typeInfo.icon}
                                    {hidden && <div style={{ position: 'absolute' as const, inset: 0, borderRadius: 'inherit', background: 'rgba(13,18,32,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/></svg></div>}
                                </div>
                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: hidden ? theme.textDim : theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, textDecoration: hidden ? 'line-through' : 'none' }}>{o.name || 'Untitled'}</div>
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 1 }}>
                                        <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 2, background: `${o.color}12`, color: o.color, border: `1px solid ${o.color}20` }}>{typeInfo.label}</span>
                                        {o.assignedTo && <span style={{ fontSize: 7, color: theme.textDim }}>{o.assignedTo.type === 'person' ? '👤' : '🏢'} {o.assignedTo.name}</span>}
                                        <span style={{ fontSize: 7, color: theme.textDim }}>{o.coords.length} pts</span>
                                    </div>
                                </div>
                                {/* Coords */}
                                <span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{coordStr}</span>
                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                    <button onClick={e => { e.stopPropagation(); toggleObjVisibility(o.id); triggerTopLoader(); }} title={hidden ? 'Show' : 'Hide'} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${hidden ? theme.danger + '20' : theme.border}`, background: hidden ? 'rgba(239,68,68,0.04)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 9, color: hidden ? theme.danger : theme.textDim }}>{hidden ? '👁️‍🗨️' : '👁️'}</button>
                                    <button onClick={e => { e.stopPropagation(); openEditObj(o); }} title="Edit" style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: theme.textDim }} onMouseEnter={e => (e.currentTarget.style.color = theme.accent)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 2l3 3-8 8H3v-3z"/></svg></button>
                                    <button onClick={e => { e.stopPropagation(); setObjDeleteConfirm(o); }} title="Delete" style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: theme.textDim }} onMouseEnter={e => (e.currentTarget.style.color = theme.danger)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
                                </div>
                            </div>;
                        })}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 8, color: theme.textDim }}>{filteredObjects.length} of {mapObjects.length} shown</span>
                        <div style={{ flex: 1 }} />
                        {mapObjects.length > 0 && <button onClick={() => { setMapObjects(prev => prev.map(o => ({ ...o, visible: true }))); triggerTopLoader(); }} style={{ fontSize: 7, padding: '2px 6px', borderRadius: 3, border: '1px solid #22c55e20', background: '#22c55e06', color: '#22c55e', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>👁️ Show All</button>}
                        {mapObjects.length > 0 && <button onClick={() => { setMapObjects(prev => prev.map(o => ({ ...o, visible: false }))); triggerTopLoader(); }} style={{ fontSize: 7, padding: '2px 6px', borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>🚫 Hide All</button>}
                    </div>
                </>}
                </div>}

                {/* Timeline Lightbox */}
                {tlLightbox && <div onClick={() => setTlLightbox(null)} style={{ position: 'fixed' as const, inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', backdropFilter: 'blur(8px)' }}>
                    <img src={tlLightbox} style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }} />
                    <button onClick={() => setTlLightbox(null)} style={{ position: 'absolute' as const, top: 20, right: 20, width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>}

                {/* Timeline Marker Context Menu */}
                {tlMarkerCtx && <div onClick={() => setTlMarkerCtx(null)} style={{ position: 'fixed' as const, inset: 0, zIndex: 100 }}><div onClick={e => e.stopPropagation()} style={{ position: 'absolute' as const, left: Math.min(tlMarkerCtx.x + (mapContainer.current?.getBoundingClientRect().left || 0), window.innerWidth - 200), top: Math.min(tlMarkerCtx.y + (mapContainer.current?.getBoundingClientRect().top || 0), window.innerHeight - 220), zIndex: 101, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden', minWidth: 180 }}>
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {tlMarkerCtx.ev.photoUrl ? <img src={tlMarkerCtx.ev.photoUrl} style={{ width: 22, height: 22, borderRadius: tlMarkerCtx.ev.type === 'face' ? '50%' : 4, objectFit: 'cover', border: `2px solid ${tlMarkerCtx.ev.color}` }} /> : <span style={{ fontSize: 14 }}>{tlMarkerCtx.ev.icon}</span>}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{tlMarkerCtx.ev.title}</div>
                            <div style={{ fontSize: 8, color: theme.textDim }}>{tlMarkerCtx.ev.ts}</div>
                        </div>
                    </div>
                    <div style={{ padding: '2px 0' }}>
                        {tlMarkerCtx.ev.type === 'face' && tlMarkerCtx.ev.personId && tlMarkerCtx.ev.personId > 0 && <button onClick={() => { router.visit(`/persons/${tlMarkerCtx.ev.personId}`); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.accent, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>👤 Person Details</button>}
                        {tlMarkerCtx.ev.type === 'lpr' && tlMarkerCtx.ev.vehicleId && tlMarkerCtx.ev.vehicleId > 0 && <button onClick={() => { router.visit(`/vehicles/${tlMarkerCtx.ev.vehicleId}`); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.accent, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>🚗 Vehicle Details</button>}
                        {tlMarkerCtx.ev.type === 'lpr' && tlMarkerCtx.ev.personId && tlMarkerCtx.ev.personId > 0 && <button onClick={() => { router.visit(`/persons/${tlMarkerCtx.ev.personId}`); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.textSecondary, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>👤 Person Details</button>}
                        {tlMarkerCtx.ev.type === 'lpr' && tlMarkerCtx.ev.orgId && <button onClick={() => { router.visit(`/organizations/${tlMarkerCtx.ev.orgId}`); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.textSecondary, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>🏢 Organization</button>}
                        {tlMarkerCtx.ev.cameraId && <button onClick={() => { router.visit(`/devices/${tlMarkerCtx.ev.cameraId}`); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.textSecondary, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>📡 Device</button>}
                        {tlMarkerCtx.ev.photoUrl && <button onClick={() => { setTlLightbox(tlMarkerCtx.ev.photoUrl!); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.textSecondary, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>🔍 View Photo</button>}
                        <div style={{ height: 1, background: theme.border, margin: '2px 8px' }} />
                        <button onClick={() => { if (tlMarkerCtx.ev.type === 'face') setFaceHidden(prev => new Set([...prev, tlMarkerCtx.ev.id])); if (tlMarkerCtx.ev.type === 'lpr') setLprHidden(prev => new Set([...prev, tlMarkerCtx.ev.id])); const sid = tlMarkerCtx.ev.id; if (/^(ml|mp|mv|ma|mc|sc|sh|sp|sg|sa)\d/.test(sid)) setHiddenSources(prev => new Set([...prev, sid])); setTlHiddenIds(prev => new Set([...prev, tlMarkerCtx.ev.id])); setTlMarkerCtx(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'none', border: 'none', color: theme.danger, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>👁️‍🗨️ Hide from Map</button>
                    </div>
                </div></div>}

                {/* Coordinates */}
                {showCoords && loaded && <div className="tmap-coords" style={{ bottom: timelineOpen ? 282 : 8, transition: 'bottom 0.3s ease', zIndex: 15 }}><span>LAT {coords.lat.toFixed(5)}</span><span>LNG {coords.lng.toFixed(5)}</span><span>Z {zoom}</span><span>BRG {Math.round(bearing)}°</span></div>}

                {/* Status Bar (bottom-left) */}
                {loaded && <div style={{ position: 'absolute' as const, bottom: timelineOpen ? 282 : 8, left: 8, zIndex: 5, display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 220, transition: 'bottom 0.3s ease' }}>
                    {activeSources.size > 0 && <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)', backdropFilter: 'blur(6px)' }}>📡 {activeSources.size} sources</span>}
                    {layerHeatmap && <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', backdropFilter: 'blur(6px)' }}>🔥 Heatmap</span>}
                    {layerNetwork && <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(6px)' }}>🕸️ Network</span>}
                    {layerLPR && <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', backdropFilter: 'blur(6px)' }}>🚗 LPR</span>}
                    {layerFace && <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.2)', backdropFilter: 'blur(6px)' }}>🧑‍🦲 Face</span>}
                    {showZones && <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', backdropFilter: 'blur(6px)' }}>🛡️ Zones</span>}
                    {active3D && <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(6px)' }}>🏢 3D</span>}
                    {rulerActive && <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', backdropFilter: 'blur(6px)' }}>📏 Ruler</span>}
                    {selectedPersons.length > 0 && <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.2)', backdropFilter: 'blur(6px)' }}>👤 {selectedPersons.length}</span>}
                    {hiddenSources.size > 0 && <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', backdropFilter: 'blur(6px)' }}>👁️ {hiddenSources.size} hidden</span>}
                </div>}

                {/* FPS Counter */}
                {showFps && loaded && <div style={{ position: 'absolute' as const, top: showMinimap ? 118 : 10, right: 10, zIndex: 5, background: fps >= 50 ? 'rgba(34,197,94,0.12)' : fps >= 30 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${fps >= 50 ? '#22c55e30' : fps >= 30 ? '#f59e0b30' : '#ef444430'}`, borderRadius: 6, padding: '4px 10px', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: fps >= 50 ? '#22c55e' : fps >= 30 ? '#f59e0b' : '#ef4444' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: fps >= 50 ? '#22c55e' : fps >= 30 ? '#f59e0b' : '#ef4444' }}>{fps} FPS</span>
                </div>}

                {/* Live Feed Toggle Button */}
                {loaded && !showLiveFeed && <button onClick={() => { setShowLiveFeed(true); setLiveFeedRunning(true); }} style={{ position: 'absolute' as const, top: showMinimap ? 118 : 10, right: showFps ? 85 : 10, zIndex: 6, background: 'rgba(13,18,32,0.9)', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', transition: 'all 0.15s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = '#ef4444')} onMouseLeave={e => (e.currentTarget.style.borderColor = theme.border)}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'tmap-tl-ring 1.5s infinite' }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: theme.textDim }}>LIVE</span>
                </button>}

                {/* Live Feed Widget */}
                {showLiveFeed && loaded && <div data-panel="feed" onMouseDown={e => { if (!(e.target as HTMLElement).closest('button, input, select, textarea, a')) bringToFront('feed' as PanelId); }} style={panelStyle('feed', '320px', liveFeedRunning ? '#ef4444' : theme.border)}>
                    <PanelHeader id="feed" icon={liveFeedRunning ? '🔴' : '⏸️'} title="LIVE FEED" subtitle={`${liveFeedEvents.length} events`} color={liveFeedRunning ? '#ef4444' : theme.border} onClose={() => { setShowLiveFeed(false); if (liveFeedMarkerRef.current) { liveFeedMarkerRef.current.remove(); liveFeedMarkerRef.current = null; } if (liveFeedPopupRef.current) { liveFeedPopupRef.current.remove(); liveFeedPopupRef.current = null; } }} extra={<>
                        <button onClick={() => setLiveFeedMuted(!liveFeedMuted)} title={liveFeedMuted ? 'Unmute' : 'Mute'} style={{ width: 20, height: 20, borderRadius: 4, border: `1px solid ${liveFeedMuted ? '#f59e0b30' : theme.border}`, background: liveFeedMuted ? 'rgba(245,158,11,0.08)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: liveFeedMuted ? '#f59e0b' : theme.textDim, fontSize: 9, padding: 0 }}>{liveFeedMuted ? '🔇' : '🔔'}</button>
                        <button onClick={() => setLiveFeedRunning(!liveFeedRunning)} style={{ padding: '2px 6px', borderRadius: 3, border: `1px solid ${liveFeedRunning ? '#ef444430' : '#22c55e30'}`, background: liveFeedRunning ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', cursor: 'pointer', fontSize: 7, fontWeight: 700, color: liveFeedRunning ? '#ef4444' : '#22c55e', fontFamily: 'inherit' }}>{liveFeedRunning ? '⏸' : '▶'}</button>
                        <button onClick={() => { setLiveFeedEvents([]); if (liveFeedMarkerRef.current) { liveFeedMarkerRef.current.remove(); liveFeedMarkerRef.current = null; } if (liveFeedPopupRef.current) { liveFeedPopupRef.current.remove(); liveFeedPopupRef.current = null; } }} style={{ width: 20, height: 20, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 8, padding: 0 }} title="Clear">🗑️</button>
                    </>} />
                    <PanelResizeGrip id="feed" />

                    {!isPanelMin('feed') && <>{/* Severity summary strip */}
                    <div style={{ display: 'flex', gap: 6, padding: '5px 12px', borderBottom: `1px solid ${theme.border}15`, flexShrink: 0 }}>
                        {[{ sev: 'critical', color: '#ef4444', label: 'CRIT' }, { sev: 'high', color: '#f97316', label: 'HIGH' }, { sev: 'medium', color: '#f59e0b', label: 'MED' }, { sev: 'info', color: '#3b82f6', label: 'INFO' }, { sev: 'low', color: '#6b7280', label: 'LOW' }].map(s => {
                            const count = liveFeedEvents.filter(e => e.sev === s.sev).length;
                            return <div key={s.sev} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8 }}>
                                <div style={{ width: 5, height: 5, borderRadius: 1, background: count > 0 ? s.color : theme.border }} />
                                <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: count > 0 ? s.color : theme.textDim }}>{count}</span>
                            </div>;
                        })}
                    </div>

                    {/* Filter chips */}
                    <div style={{ display: 'flex', gap: 3, padding: '4px 12px', borderBottom: `1px solid ${theme.border}15`, flexShrink: 0, flexWrap: 'wrap' }}>
                        {[{ id: 'lpr', icon: '🚗', label: 'LPR', color: '#10b981' }, { id: 'face', icon: '🧑‍🦲', label: 'Face', color: '#ec4899' }, { id: 'zone', icon: '🛡️', label: 'Zone', color: '#f59e0b' }, { id: 'source', icon: '📡', label: 'Source', color: '#3b82f6' }, { id: 'alert', icon: '🚨', label: 'Alert', color: '#ef4444' }].map(f => {
                            const on = liveFeedFilter.has(f.id);
                            return <button key={f.id} onClick={() => setLiveFeedFilter(prev => { const n = new Set(prev); n.has(f.id) ? n.delete(f.id) : n.add(f.id); return n; })} style={{ padding: '2px 6px', borderRadius: 3, border: `1px solid ${on ? f.color + '40' : theme.border}`, background: on ? f.color + '08' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, fontWeight: 600, color: on ? f.color : theme.textDim }}>{f.icon} {f.label}</button>;
                        })}
                    </div>

                    {/* Event list */}
                    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minHeight: 0 }}>
                        {liveFeedEvents.filter(e => liveFeedFilter.has(e.type)).length === 0 && <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim, fontSize: 11 }}>{liveFeedRunning ? 'Waiting for events...' : 'Feed paused'}<br /><span style={{ fontSize: 9, marginTop: 4, display: 'inline-block' }}>{liveFeedRunning ? 'Events will appear here in real-time' : 'Press Resume to continue receiving events'}</span></div>}
                        {liveFeedEvents.filter(e => liveFeedFilter.has(e.type)).map(evt => {
                            const sevColor = evt.sev === 'critical' ? '#ef4444' : evt.sev === 'high' ? '#f97316' : evt.sev === 'medium' ? '#f59e0b' : evt.sev === 'low' ? '#6b7280' : '#3b82f6';
                            const isPinned = liveFeedPinned.has(evt.id);
                            return <div key={evt.id} onClick={() => showLiveFeedMarker(evt)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 12px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}10`, transition: 'background 0.15s, opacity 0.3s', background: evt.isNew ? `${evt.color}08` : isPinned ? 'rgba(139,92,246,0.04)' : 'transparent', animation: evt.isNew ? 'argux-fadeIn 0.3s ease-out' : 'none' }} onMouseEnter={e => (e.currentTarget.style.background = `${evt.color}08`)} onMouseLeave={e => (e.currentTarget.style.background = evt.isNew ? `${evt.color}08` : isPinned ? 'rgba(139,92,246,0.04)' : 'transparent')}>
                                {/* Severity strip + icon */}
                                <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, flexShrink: 0, paddingTop: 1 }}>
                                    <div style={{ width: 3, height: 16, borderRadius: 2, background: sevColor }} />
                                    <span style={{ fontSize: 13 }}>{evt.icon}</span>
                                </div>
                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 1 }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{evt.title}</span>
                                        {evt.isNew && <span style={{ fontSize: 7, fontWeight: 800, padding: '1px 4px', borderRadius: 2, background: '#ef444420', color: '#ef4444', border: '1px solid #ef444430', flexShrink: 0, animation: 'tmap-tl-ring 1s infinite' }}>NEW</span>}
                                    </div>
                                    <div style={{ fontSize: 8, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, marginBottom: 2 }}>
                                        {evt.person && <span style={{ color: '#ec4899', fontWeight: 600 }}>{evt.person}</span>}
                                        {evt.person && evt.camera ? ' · ' : ''}
                                        {evt.camera && <span>{evt.camera}</span>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: `${sevColor}15`, color: sevColor, border: `1px solid ${sevColor}25` }}>{evt.sev.toUpperCase()}</span>
                                        <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 4px', borderRadius: 2, background: `${evt.color}10`, color: evt.color, border: `1px solid ${evt.color}20` }}>{evt.type.toUpperCase()}</span>
                                        <span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", marginLeft: 'auto' }}>{evt.ts}</span>
                                    </div>
                                </div>
                                {/* Pin button */}
                                <button onClick={e => { e.stopPropagation(); setLiveFeedPinned(prev => { const n = new Set(prev); n.has(evt.id) ? n.delete(evt.id) : n.add(evt.id); return n; }); }} title={isPinned ? 'Unpin' : 'Pin'} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${isPinned ? '#8b5cf640' : 'transparent'}`, background: isPinned ? 'rgba(139,92,246,0.08)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0, fontSize: 8, color: isPinned ? '#8b5cf6' : theme.textDim, marginTop: 2 }}>📌</button>
                            </div>;
                        })}
                    </div>

                    {/* Footer: stats + connection indicator */}
                    <div style={{ padding: '5px 12px', borderTop: `1px solid ${theme.border}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: liveFeedRunning ? '#22c55e' : '#6b7280', boxShadow: liveFeedRunning ? '0 0 6px #22c55e60' : 'none' }} />
                        <span style={{ fontSize: 8, color: liveFeedRunning ? '#22c55e' : theme.textDim, fontWeight: 600 }}>{liveFeedRunning ? 'Connected' : 'Disconnected'}</span>
                        <span style={{ fontSize: 8, color: theme.textDim }}>·</span>
                        <span style={{ fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{liveFeedEvents.filter(e => liveFeedFilter.has(e.type)).length} shown</span>
                        {liveFeedPinned.size > 0 && <><span style={{ fontSize: 8, color: theme.textDim }}>·</span><span style={{ fontSize: 8, color: '#8b5cf6', fontWeight: 600 }}>📌 {liveFeedPinned.size}</span></>}
                        <div style={{ flex: 1 }} />
                        <span style={{ fontSize: 7, color: theme.textDim }}>WS: <span style={{ color: liveFeedRunning ? '#22c55e' : '#6b7280', fontWeight: 700 }}>ws://argux.local:6001</span></span>
                    </div>
                </>}
                </div>}

                {/* ═══ KEYBOARD SHORTCUTS OVERLAY ═══ */}
                {showShortcuts && <div onClick={() => setShowShortcuts(false)} style={{ position: 'fixed' as const, inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'argux-fadeIn 0.15s ease-out' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(13,18,32,0.98)', border: `1px solid ${theme.border}`, borderRadius: 14, boxShadow: '0 24px 64px rgba(0,0,0,0.7)', padding: 0, width: 'min(680px, calc(100vw - 40px))', maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${theme.accent}12`, border: `1px solid ${theme.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⌨️</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Keyboard Shortcuts</div>
                                <div style={{ fontSize: 10, color: theme.textDim }}>ARGUX Tactical Map — Quick Reference</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: `${theme.border}40`, fontSize: 9, color: theme.textDim }}>
                                <span style={{ padding: '1px 5px', borderRadius: 3, background: `${theme.border}`, fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>Ctrl</span>+<span style={{ padding: '1px 5px', borderRadius: 3, background: `${theme.border}`, fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>Q</span>
                                <span style={{ marginLeft: 4 }}>to toggle</span>
                            </div>
                            <button onClick={() => setShowShortcuts(false)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 14, flexShrink: 0 }}>✕</button>
                        </div>
                        {/* Shortcuts grid */}
                        <div style={{ overflowY: 'auto', padding: '16px 20px', scrollbarWidth: 'thin', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                            {/* General */}
                            {[
                                { title: 'General', color: theme.accent, items: [
                                    { keys: ['Ctrl', 'Q'], desc: 'Toggle shortcuts overlay' },
                                    { keys: ['Esc'], desc: 'Close topmost panel / modal / menu' },
                                    { keys: ['/'], desc: 'Focus map search' },
                                    { keys: ['S'], desc: 'Toggle sidebar' },
                                    { keys: ['F'], desc: 'Toggle fullscreen' },
                                ]},
                                { title: 'Navigation', color: '#22c55e', items: [
                                    { keys: ['+'], desc: 'Zoom in' },
                                    { keys: ['-'], desc: 'Zoom out' },
                                    { keys: ['N'], desc: 'Reset north bearing' },
                                    { keys: ['['], desc: 'Rotate map left 45°' },
                                    { keys: [']'], desc: 'Rotate map right 45°' },
                                ]},
                                { title: 'Intelligence Panels', color: '#f59e0b', items: [
                                    { keys: ['Alt', '1'], desc: 'Toggle Live Tracker' },
                                    { keys: ['Alt', '2'], desc: 'Toggle Event Correlation' },
                                    { keys: ['Alt', '3'], desc: 'Toggle Anomaly Detection' },
                                    { keys: ['Alt', '4'], desc: 'Toggle Predictive Risk' },
                                    { keys: ['Alt', '5'], desc: 'Toggle Pattern Detection' },
                                    { keys: ['Alt', '6'], desc: 'Toggle Incident Timeline' },
                                    { keys: ['Alt', '7'], desc: 'Toggle Heat Calendar' },
                                    { keys: ['Alt', '8'], desc: 'Toggle Entity Comparison' },
                                    { keys: ['Alt', '9'], desc: 'Toggle Route Replay' },
                                ]},
                                { title: 'Tools & Overlays', color: '#8b5cf6', items: [
                                    { keys: ['T'], desc: 'Toggle timeline panel' },
                                    { keys: ['R'], desc: 'Toggle ruler / measure tool' },
                                    { keys: ['L'], desc: 'Toggle live event feed' },
                                    { keys: ['M'], desc: 'Toggle minimap' },
                                    { keys: ['G'], desc: 'Toggle coordinates bar' },
                                    { keys: ['P'], desc: 'Place marker on map' },
                                    { keys: ['E'], desc: 'Export / Share map view' },
                                ]},
                            ].map(group => <div key={group.title}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: group.color, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 3, height: 12, borderRadius: 2, background: group.color }} />
                                    {group.title}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                                    {group.items.map(item => <div key={item.desc} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 5, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <div style={{ display: 'flex', gap: 3, flexShrink: 0, minWidth: 80, justifyContent: 'flex-end' }}>
                                            {item.keys.map((k, i) => <Fragment key={i}><span style={{ padding: '2px 7px', borderRadius: 4, background: `${theme.border}60`, border: `1px solid ${theme.border}`, fontSize: 9, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.4, minWidth: 20, textAlign: 'center' as const }}>{k}</span>{i < item.keys.length - 1 && <span style={{ fontSize: 8, color: theme.textDim, alignSelf: "center" }}>+</span>}</Fragment>)}
                                        </div>
                                        <span style={{ fontSize: 11, color: theme.textSecondary }}>{item.desc}</span>
                                    </div>)}
                                </div>
                            </div>)}
                        </div>
                        {/* Footer */}
                        <div style={{ padding: '10px 20px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                            <span style={{ fontSize: 9, color: theme.textDim }}>Shortcuts disabled while typing in input fields</span>
                            <span style={{ fontSize: 9, color: theme.textDim }}>Press <span style={{ padding: '1px 5px', borderRadius: 3, background: `${theme.border}`, fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>Esc</span> to close</span>
                        </div>
                    </div>
                </div>}

                {/* ═══ EXPORT / SHARE MODAL ═══ */}
                {showExportModal && <div onClick={() => setShowExportModal(false)} style={{ position: 'fixed' as const, inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'argux-fadeIn 0.15s ease-out' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(13,18,32,0.98)', border: `1px solid ${theme.border}`, borderRadius: 14, boxShadow: '0 24px 64px rgba(0,0,0,0.7)', width: 'min(520px, calc(100vw - 40px))', maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📤</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Export & Share</div>
                                <div style={{ fontSize: 10, color: theme.textDim }}>Download map view or share workspace link</div>
                            </div>
                            <button onClick={() => setShowExportModal(false)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 14, flexShrink: 0 }}>✕</button>
                        </div>

                        <div style={{ overflowY: 'auto', scrollbarWidth: 'thin', padding: '16px 20px', display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
                            {/* Current viewport info */}
                            <div style={{ padding: '10px 12px', borderRadius: 8, background: `${theme.border}15`, border: `1px solid ${theme.border}30`, display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                                {[
                                    { label: 'Center', value: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`, icon: '📍' },
                                    { label: 'Zoom', value: zoom.toFixed(1), icon: '🔍' },
                                    { label: 'Bearing', value: `${bearing.toFixed(0)}°`, icon: '🧭' },
                                    { label: 'Tile', value: activeTile, icon: '🗺️' },
                                ].map(v => <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 5, flex: '1 1 100px' }}>
                                    <span style={{ fontSize: 12 }}>{v.icon}</span>
                                    <div><div style={{ fontSize: 7, color: theme.textDim, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{v.label}</div><div style={{ fontSize: 10, color: theme.text, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{v.value}</div></div>
                                </div>)}
                            </div>

                            {/* Export PNG */}
                            <div style={{ padding: '12px', borderRadius: 8, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e40'; e.currentTarget.style.background = 'rgba(34,197,94,0.03)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'transparent'; }} onClick={() => {
                                setExportStatus({ type: 'exporting', msg: 'Rendering map to PNG...' });
                                setTimeout(() => {
                                    try {
                                        const canvas = mapContainerRef.current?.querySelector('canvas');
                                        if (canvas) {
                                            const link = document.createElement('a');
                                            link.download = `argux-map-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.png`;
                                            link.href = canvas.toDataURL('image/png');
                                            link.click();
                                            setExportStatus({ type: 'done', msg: 'PNG downloaded successfully' });
                                        } else {
                                            setExportStatus({ type: 'error', msg: 'Map canvas not available' });
                                        }
                                    } catch { setExportStatus({ type: 'error', msg: 'Export failed — canvas may be tainted by cross-origin tiles' }); }
                                    setTimeout(() => setExportStatus({ type: 'idle', msg: '' }), 3000);
                                }, 500);
                            }}>
                                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🖼️</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>Export as PNG</div>
                                    <div style={{ fontSize: 10, color: theme.textDim }}>High-resolution screenshot of current map view with all visible layers and markers</div>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"><path d="M4 12v2h8v-2"/><path d="M8 2v8"/><polyline points="11,7 8,10 5,7"/></svg>
                            </div>

                            {/* Export PDF */}
                            <div style={{ padding: '12px', borderRadius: 8, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef444440'; e.currentTarget.style.background = 'rgba(239,68,68,0.03)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'transparent'; }} onClick={() => {
                                setExportStatus({ type: 'exporting', msg: 'Generating PDF report...' });
                                setTimeout(() => {
                                    try {
                                        const canvas = mapContainerRef.current?.querySelector('canvas');
                                        if (canvas) {
                                            const imgData = canvas.toDataURL('image/png');
                                            // Create a simple print-friendly page
                                            const w = window.open('', '_blank');
                                            if (w) {
                                                w.document.write(`<!DOCTYPE html><html><head><title>ARGUX Map Export</title><style>@page{size:landscape;margin:10mm}body{margin:0;font-family:system-ui,sans-serif;background:#0a0e16;color:#fff}header{padding:12px 20px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #1e293b}header h1{font-size:14px;margin:0}header span{font-size:10px;color:#94a3b8}.meta{padding:8px 20px;font-size:9px;color:#64748b;display:flex;gap:16px}img{width:100%;display:block}.footer{padding:6px 20px;font-size:8px;color:#475569;border-top:1px solid #1e293b;display:flex;justify-content:space-between}</style></head><body><header><h1>ARGUX — Tactical Map Export</h1><span>${new Date().toLocaleString()}</span></header><div class="meta"><span>Center: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}</span><span>Zoom: ${zoom.toFixed(1)}</span><span>Bearing: ${bearing.toFixed(0)}°</span><span>Tile: ${activeTile}</span></div><img src="${imgData}"/><div class="footer"><span>ARGUX Surveillance Platform — CLASSIFIED // NOFORN</span><span>Generated ${new Date().toISOString()}</span></div></body></html>`);
                                                w.document.close();
                                                setTimeout(() => { w.print(); }, 500);
                                                setExportStatus({ type: 'done', msg: 'PDF print dialog opened' });
                                            }
                                        } else { setExportStatus({ type: 'error', msg: 'Map canvas not available' }); }
                                    } catch { setExportStatus({ type: 'error', msg: 'PDF export failed' }); }
                                    setTimeout(() => setExportStatus({ type: 'idle', msg: '' }), 3000);
                                }, 800);
                            }}>
                                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>Export as PDF</div>
                                    <div style={{ fontSize: 10, color: theme.textDim }}>Opens print dialog with map image, metadata header, and CLASSIFIED footer. Save as PDF from browser.</div>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"><path d="M4 12v2h8v-2"/><path d="M8 2v8"/><polyline points="11,7 8,10 5,7"/></svg>
                            </div>

                            {/* Share Workspace URL */}
                            <div style={{ padding: '12px', borderRadius: 8, border: `1px solid ${theme.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🔗</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>Share Workspace Link</div>
                                        <div style={{ fontSize: 10, color: theme.textDim }}>Generate a URL that restores this exact map view — center, zoom, bearing, tile, layers, and filters.</div>
                                    </div>
                                </div>
                                {/* Generate URL */}
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => {
                                        const params = new URLSearchParams();
                                        params.set('lat', coords.lat.toFixed(5));
                                        params.set('lng', coords.lng.toFixed(5));
                                        params.set('z', zoom.toFixed(1));
                                        params.set('b', bearing.toFixed(0));
                                        params.set('tile', activeTile);
                                        if (active3D) params.set('3d', active3D);
                                        if (layerHeatmap) params.set('heat', '1');
                                        if (layerNetwork) params.set('net', '1');
                                        if (layerLPR) params.set('lpr', '1');
                                        if (layerFace) params.set('face', '1');
                                        if (selectedPersons.length) params.set('p', selectedPersons.join(','));
                                        if (selectedOrgs.length) params.set('o', selectedOrgs.join(','));
                                        if (dateFrom) params.set('from', dateFrom);
                                        if (dateTo) params.set('to', dateTo);
                                        const url = `${window.location.origin}/map?${params.toString()}`;
                                        setShareUrl(url);
                                        setShareCopied(false);
                                    }} style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Generate Share Link</button>
                                </div>
                                {shareUrl && <div style={{ marginTop: 8 }}>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
                                        <div style={{ flex: 1, padding: '8px 10px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 9, color: theme.accent, fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all', lineHeight: 1.4, maxHeight: 60, overflowY: 'auto', scrollbarWidth: 'thin' }}>{shareUrl}</div>
                                        <button onClick={() => { navigator.clipboard.writeText(shareUrl).then(() => { setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }); }} style={{ padding: '0 14px', borderRadius: 6, border: `1px solid ${shareCopied ? '#22c55e30' : theme.border}`, background: shareCopied ? 'rgba(34,197,94,0.08)' : 'transparent', color: shareCopied ? '#22c55e' : theme.text, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.2s' }}>{shareCopied ? '✓ Copied!' : '📋 Copy'}</button>
                                    </div>
                                    {/* URL params breakdown */}
                                    <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                                        {shareUrl.split('?')[1]?.split('&').map(p => {
                                            const [k, v] = p.split('=');
                                            return <span key={k} style={{ fontSize: 7, padding: '1px 5px', borderRadius: 3, background: `${theme.border}40`, color: theme.textDim }}><span style={{ color: '#8b5cf6', fontWeight: 700 }}>{k}</span>={decodeURIComponent(v || '')}</span>;
                                        })}
                                    </div>
                                </div>}
                            </div>

                            {/* Export status */}
                            {exportStatus.type !== 'idle' && <div style={{ padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${exportStatus.type === 'done' ? '#22c55e30' : exportStatus.type === 'error' ? '#ef444430' : theme.accent + '30'}`, background: exportStatus.type === 'done' ? 'rgba(34,197,94,0.06)' : exportStatus.type === 'error' ? 'rgba(239,68,68,0.06)' : `${theme.accent}06` }}>
                                {exportStatus.type === 'exporting' && <div style={{ width: 12, height: 12, border: `2px solid ${theme.border}`, borderTopColor: theme.accent, borderRadius: '50%', animation: 'argux-spin 0.6s linear infinite', flexShrink: 0 }} />}
                                {exportStatus.type === 'done' && <span style={{ fontSize: 12 }}>✅</span>}
                                {exportStatus.type === 'error' && <span style={{ fontSize: 12 }}>⚠️</span>}
                                <span style={{ fontSize: 10, color: exportStatus.type === 'done' ? '#22c55e' : exportStatus.type === 'error' ? '#ef4444' : theme.text }}>{exportStatus.msg}</span>
                            </div>}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '10px 20px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                            <span style={{ fontSize: 9, color: theme.textDim }}>ARGUX Surveillance Platform — CLASSIFIED // NOFORN</span>
                            <span style={{ fontSize: 9, color: theme.textDim }}>Press <span style={{ padding: '1px 5px', borderRadius: 3, background: `${theme.border}`, fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>E</span> to toggle</span>
                        </div>
                    </div>
                </div>}

                {/* Zone Context Menu (right-click on zone) */}
                {zoneCtxMenu && <div onClick={e => e.stopPropagation()} style={{ position: 'absolute' as const, left: zoneCtxMenu.x, top: zoneCtxMenu.y, zIndex: 50, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden', minWidth: 180 }}>
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
                {markerCtxMenu && <div onClick={e => e.stopPropagation()} style={{ position: 'absolute' as const, left: markerCtxMenu.x, top: markerCtxMenu.y, zIndex: 55, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden', minWidth: 190 }}>
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={markerCtxMenu.img} style={{ width: 22, height: 22, borderRadius: markerCtxMenu.type === 'person' ? '50%' : 4, objectFit: 'cover', border: `2px solid ${markerCtxMenu.riskColor}` }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{markerCtxMenu.name}</span>
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
                            <a key={i} href={item.href} onClick={() => setMarkerCtxMenu(null)} style={{ display: 'flex', width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, textDecoration: 'none', alignItems: 'center', gap: 8, boxSizing: 'border-box' as const }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{item.icon}{item.label}</a>
                        ))}
                    </div>
                </div>}

                {/* Zone Add: Method Picker Overlay */}
                {zoneAddStep === 'pick' && <div style={{ position: 'absolute' as const, inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={() => setZoneAddStep(null)} style={{ position: 'absolute' as const, inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }} />
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative' as const, width: 420, maxWidth: '92%', background: 'rgba(13,18,32,0.98)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 14, boxShadow: '0 24px 60px rgba(0,0,0,0.7)', padding: 24 }}>
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
                            <button onClick={() => startDrawAndClose('circle')} style={{ padding: '16px 12px', borderRadius: 10, border: `1.5px solid ${theme.border}`, background: 'rgba(139,92,246,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf680'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'rgba(139,92,246,0.03)'; }}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#8b5cf6" strokeWidth="1.5"><circle cx="16" cy="16" r="12" strokeDasharray="4 2"/><circle cx="16" cy="16" r="2" fill="#8b5cf6"/><line x1="16" y1="16" x2="28" y2="16" strokeDasharray="2 2" opacity="0.5"/></svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>Draw Circle</span>
                                <span style={{ fontSize: 9, color: theme.textDim, textAlign: 'center' as const }}>Click center then edge to set radius</span>
                            </button>
                            {/* Draw Polygon */}
                            <button onClick={() => startDrawAndClose('polygon')} style={{ padding: '16px 12px', borderRadius: 10, border: `1.5px solid ${theme.border}`, background: 'rgba(139,92,246,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf680'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'rgba(139,92,246,0.03)'; }}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#8b5cf6" strokeWidth="1.5"><polygon points="6,24 16,4 26,24" strokeDasharray="4 2"/><circle cx="6" cy="24" r="2" fill="#8b5cf6"/><circle cx="16" cy="4" r="2" fill="#8b5cf6"/><circle cx="26" cy="24" r="2" fill="#8b5cf6"/></svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>Draw Polygon</span>
                                <span style={{ fontSize: 9, color: theme.textDim, textAlign: 'center' as const }}>Click vertices, double-click to close</span>
                            </button>
                            {/* Manual Circle */}
                            <button onClick={() => openAddZoneManual('circle')} style={{ padding: '16px 12px', borderRadius: 10, border: `1.5px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent + '80'; e.currentTarget.style.background = 'rgba(59,130,246,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'transparent'; }}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={theme.accent} strokeWidth="1.5"><circle cx="16" cy="16" r="12"/><text x="16" y="20" textAnchor="middle" fontSize="10" fill={theme.accent} stroke="none" fontFamily="JetBrains Mono, monospace">123</text></svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>Manual Circle</span>
                                <span style={{ fontSize: 9, color: theme.textDim, textAlign: 'center' as const }}>Enter coordinates and radius</span>
                            </button>
                            {/* Manual Polygon */}
                            <button onClick={() => openAddZoneManual('polygon')} style={{ padding: '16px 12px', borderRadius: 10, border: `1.5px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent + '80'; e.currentTarget.style.background = 'rgba(59,130,246,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'transparent'; }}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={theme.accent} strokeWidth="1.5"><polygon points="6,24 16,4 26,24"/><text x="16" y="20" textAnchor="middle" fontSize="10" fill={theme.accent} stroke="none" fontFamily="JetBrains Mono, monospace">123</text></svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>Manual Polygon</span>
                                <span style={{ fontSize: 9, color: theme.textDim, textAlign: 'center' as const }}>Enter center coordinates</span>
                            </button>
                        </div>
                    </div>
                </div>}

                {/* Zone Drawing Instruction Bar (top-center) */}
                {zoneDrawing && <div style={{ position: 'absolute' as const, top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 30, background: 'rgba(13,18,32,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, padding: '10px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 12, maxWidth: '90%' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', animation: 'argux-spin 1s linear infinite', boxShadow: '0 0 8px #8b5cf6' }} />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>Drawing {zoneDrawing.shape === 'circle' ? 'Circle Zone' : 'Polygon Zone'}</div>
                        <div style={{ fontSize: 10, color: theme.textDim }}>{zoneDrawing.shape === 'circle' ? (zoneDrawing.points.length === 0 ? 'Click to place center point' : 'Click to set edge — double-click to finish') : (zoneDrawing.points.length < 3 ? `Click to add vertices (${zoneDrawing.points.length}/3 min)` : `${zoneDrawing.points.length} points — double-click to close`)}</div>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#8b5cf6', fontFamily: "'JetBrains Mono', monospace", minWidth: 24, textAlign: 'center' as const }}>{zoneDrawing.points.length}</span>
                    <button onClick={() => setZoneDrawing(null)} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: theme.danger, fontSize: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>Cancel</button>
                </div>}

                {/* Zone Add/Edit Form Panel (right side) */}
                {zoneModal && <div style={{ position: 'absolute' as const, top: 10, right: showMinimap ? 160 : 10, bottom: 50, zIndex: 35, width: 320, maxWidth: '80%', display: 'flex', flexDirection: 'column' as const }}>
                    <div style={{ flex: 1, background: 'rgba(13,18,32,0.97)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', padding: 16, display: 'flex', flexDirection: 'column' as const, gap: 10, overflowY: 'auto' }}>
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
                {zoneDeleteConfirm && <div style={{ position: 'absolute' as const, inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={() => setZoneDeleteConfirm(null)} style={{ position: 'absolute' as const, inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative' as const, width: 340, maxWidth: '90%', background: 'rgba(13,18,32,0.98)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: 20 }}>
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
                    return <div style={{ position: 'absolute' as const, bottom: 50, left: 10, zIndex: 35, width: 360, maxWidth: '80%', maxHeight: 380, background: 'rgba(13,18,32,0.97)', border: `1px solid ${zoneEventsPanel.color}30`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
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
                {mapCtxMenu && <div onClick={e => e.stopPropagation()} className="tmap-ctxmenu" style={{ position: 'absolute' as const, left: mapCtxMenu.x, top: mapCtxMenu.y, zIndex: 55, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'visible', minWidth: 170 }}>
                    <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{mapCtxMenu.lngLat[1].toFixed(5)}, {mapCtxMenu.lngLat[0].toFixed(5)}</div>
                    <div style={{ padding: '2px 0' }}>
                        <button onClick={() => { placeMarkerAt(mapCtxMenu.lngLat); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>📌 Add Marker</button>
                        <div className="tmap-ctxmenu-sub-wrap" style={{ position: 'relative' as const }}>
                            <button style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>🖊️ Add Object</span><svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,2 7,5 3,8"/></svg>
                            </button>
                            <div className="tmap-ctxmenu-sub" style={{ position: 'absolute' as const, left: '100%', top: -2, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden', minWidth: 150, display: 'none' }}>
                                {(['line', 'rectangle', 'polygon', 'freehand', 'circle'] as ObjType[]).map(t => <button key={t} onClick={() => startObjDraw(t)} style={{ width: '100%', padding: '7px 12px', border: 'none', background: 'transparent', color: theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{objTypeLabels[t].icon} Draw {objTypeLabels[t].label}</button>)}
                            </div>
                        </div>
                    </div>
                </div>}

                {/* Object Right-Click Context Menu */}
                {objCtxMenu && <div onClick={e => e.stopPropagation()} style={{ position: 'absolute' as const, left: objCtxMenu.x, top: objCtxMenu.y, zIndex: 55, background: 'rgba(13,18,32,0.96)', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden', minWidth: 170 }}>
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
                {placingMarker && <div style={{ position: 'absolute' as const, top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 30, background: 'rgba(13,18,32,0.95)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 12, maxWidth: '90%' }}>
                    <span style={{ fontSize: 18 }}>📌</span>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>Place Marker</div>
                        <div style={{ fontSize: 10, color: theme.textDim }}>Click anywhere on the map to place your marker.</div>
                    </div>
                    <button onClick={() => setPlacingMarker(false)} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: theme.danger, fontSize: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>Cancel</button>
                </div>}

                {/* Object Drawing Instruction Bar */}
                {objDrawing && <div style={{ position: 'absolute' as const, top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 30, background: 'rgba(13,18,32,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, padding: '10px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 12, maxWidth: '90%' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }} />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent }}>Drawing {objTypeLabels[objDrawing.type].label}</div>
                        <div style={{ fontSize: 10, color: theme.textDim }}>{objDrawing.type === 'freehand' ? 'Click and drag to draw. Release to finish.' : objDrawing.type === 'circle' ? 'Click center point. Double-click to finish.' : objDrawing.type === 'rectangle' ? 'Click two corners. Double-click to finish.' : `Click to add points (${objDrawing.points.length}). Double-click to finish.`}</div>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: theme.accent, fontFamily: "'JetBrains Mono', monospace", minWidth: 24, textAlign: 'center' as const }}>{objDrawing.points.length}</span>
                    <button onClick={() => setObjDrawing(null)} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: theme.danger, fontSize: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>Cancel</button>
                </div>}

                {/* Object Add/Edit Modal (right side) */}
                {objModal && <div style={{ position: 'absolute' as const, top: 10, right: showMinimap ? 160 : 10, bottom: 50, zIndex: 35, width: 300, maxWidth: '80%', display: 'flex', flexDirection: 'column' as const }}>
                    <div style={{ flex: 1, background: 'rgba(13,18,32,0.97)', border: `1px solid ${theme.accent}30`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', padding: 14, display: 'flex', flexDirection: 'column' as const, gap: 8, overflowY: 'auto' }}>
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
                {objDeleteConfirm && <div style={{ position: 'absolute' as const, inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={() => setObjDeleteConfirm(null)} style={{ position: 'absolute' as const, inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative' as const, width: 320, maxWidth: '90%', background: 'rgba(13,18,32,0.98)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: 20 }}>
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
