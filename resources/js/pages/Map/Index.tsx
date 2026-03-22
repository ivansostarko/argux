import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockPersons } from '../../mock/persons';
import { mockOrganizations } from '../../mock/organizations';

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
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedPersons, setSelectedPersons] = useState<string[]>([]);
    const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);

    // Settings
    const [showMinimap, setShowMinimap] = useState(true);
    const [showCompass, setShowCompass] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [showLocalization, setShowLocalization] = useState(false);
    const [showCoords, setShowCoords] = useState(true);
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
            if (z.shape === 'circle' && z.radius) {
                geojson.features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [circleToPolygon(z.lat, z.lng, z.radius)] }, properties: { id: z.id, color: z.color, name: z.name } });
            } else if (z.shape === 'polygon' && z.points && z.points.length >= 3) {
                const coords = z.points.map(p => [p.lng, p.lat]);
                coords.push(coords[0]); // close polygon
                geojson.features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: { id: z.id, color: z.color, name: z.name } });
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
            const features = map.queryRenderedFeatures(e.point, { layers: ['zones-fill'] });
            if (features && features.length > 0) {
                e.preventDefault();
                const fid = features[0].properties?.id;
                const zone = zones.find(z => z.id === fid);
                if (zone) { setZoneCtxMenu({ x: e.point.x, y: e.point.y, zone }); }
            }
        };
        const closeCtx = () => setZoneCtxMenu(null);
        map.on('contextmenu', ctxHandler);
        map.on('click', closeCtx);
        map.on('movestart', closeCtx);
        return () => { map.off('contextmenu', ctxHandler); map.off('click', closeCtx); map.off('movestart', closeCtx); };
    }, [zones, loaded]);

    // Close zone ctx menu on outside click
    useEffect(() => { const h = () => setZoneCtxMenu(null); window.addEventListener('click', h); return () => window.removeEventListener('click', h); }, []);

    // Subject markers on map (persons + organizations)
    const markersRef = useRef<any[]>([]);
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
            el.title = `${p.firstName} ${p.lastName} — ${addr.city}, ${addr.country}`;
            const marker = new ml.Marker({ element: el, anchor: 'center' }).setLngLat([mc[0] + offset, mc[1] + offset * 0.7]).addTo(map);
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
            el.title = `${o.name} — ${addr.city}, ${addr.country}`;
            const marker = new ml.Marker({ element: el, anchor: 'center' }).setLngLat([mc[0] + offset, mc[1] - offset * 0.6]).addTo(map);
            markersRef.current.push(marker);
        });

        return () => { markersRef.current.forEach(m => m.remove()); markersRef.current = []; };
    }, [selectedPersons, selectedOrgs, loaded]);

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
                        </div>
                    </Section>

                    {/* SUBJECTS */}
                    <Section title="Subjects" icon={Ico.subjects} badge={selectedPersons.length + selectedOrgs.length}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Persons ({selectedPersons.length}/{mockPersons.length})</div><SidebarMS selected={selectedPersons} onChange={setSelectedPersons} options={personOpts} placeholder="Select persons to track..." showSelectAll /></div>
                            <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Organizations ({selectedOrgs.length}/{mockOrganizations.length})</div><SidebarMS selected={selectedOrgs} onChange={setSelectedOrgs} options={orgOpts} placeholder="Select organizations..." showSelectAll /></div>
                        </div>
                    </Section>

                    <Section title="Sources" icon={Ico.sources}><div className="tmap-empty">No source filters configured.</div></Section>
                    <Section title="Layers" icon={Ico.layers}><div className="tmap-empty">No custom layers configured.</div></Section>
                    <Section title="Tiles" icon={Ico.tiles}  badge={active3D ? 1 : 0}>
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
                    <Section title="Custom Objects" icon={Ico.objects}><div className="tmap-empty">No custom objects placed.</div></Section>
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

                {/* Coordinates */}
                {showCoords && loaded && <div className="tmap-coords"><span>LAT {coords.lat.toFixed(5)}</span><span>LNG {coords.lng.toFixed(5)}</span><span>Z {zoom}</span><span>BRG {Math.round(bearing)}°</span></div>}

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
            </div>
        </div>
    );
}

MapIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
