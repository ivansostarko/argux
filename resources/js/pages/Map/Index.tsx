import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockPersons } from '../../mock/persons';

/* ═══ SIDEBAR MULTISELECT ═══ */
function SidebarMS({ selected, onChange, options, placeholder }: { selected: string[]; onChange: (v: string[]) => void; options: { id: string; label: string; sub?: string }[]; placeholder: string }) {
    const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
    const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    const has = selected.length > 0;
    return (<div ref={ref} style={{ position: 'relative' }}><button className="tmap-ms-trigger" onClick={() => { setOpen(!open); setQ(''); }} style={{ color: has ? theme.text : theme.textDim, borderColor: has ? theme.accent + '40' : theme.border }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{has ? `${selected.length} selected` : placeholder}</span><svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4" /></svg></button>{open && <div className="tmap-ms-panel"><div className="tmap-ms-search"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus />{has && <button onClick={() => onChange([])} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: theme.danger, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '2px 6px', borderRadius: 3, flexShrink: 0 }}>Clear</button>}</div><div className="tmap-ms-list">{filtered.map(o => { const c = selected.includes(o.id); return <div key={o.id} className="tmap-ms-item" onClick={() => toggle(o.id)} style={{ color: c ? theme.accent : theme.text }}><div className={`tmap-ms-check ${c ? 'on' : ''}`}>{c && <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div><div><div>{o.label}</div>{o.sub && <div style={{ fontSize: 9, color: theme.textDim }}>{o.sub}</div>}</div></div>; })}{filtered.length === 0 && <div style={{ padding: 12, fontSize: 10, color: theme.textDim, textAlign: 'center' }}>No results</div>}</div></div>}{has && <div className="tmap-tags">{selected.map(id => { const o = options.find(x => x.id === id); return o ? <span key={id} className="tmap-tag">{o.label.split(' ')[0]}<button onClick={e => { e.stopPropagation(); toggle(id); }}><svg width="7" height="7" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button></span> : null; })}</div>}</div>);
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

const personOpts = mockPersons.map(p => ({ id: p.id.toString(), label: `${p.firstName} ${p.lastName}`, sub: p.nationality }));

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
function Minimap({ center, zoom: mainZoom }: { center: { lat: number; lng: number }; zoom: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const mmRef = useRef<any>(null);

    useEffect(() => {
        if (!ref.current || !(window as any).maplibregl) return;
        const ml = (window as any).maplibregl;
        const mm = new ml.Map({
            container: ref.current,
            style: { version: 8, sources: { 'carto-light': { type: 'raster', tiles: ['https://basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png'], tileSize: 256 } }, layers: [{ id: 'bg', type: 'raster', source: 'carto-light' }] },
            center: [center.lng, center.lat], zoom: Math.max(1, mainZoom - 6),
            interactive: false, attributionControl: false,
        });
        mmRef.current = mm;
        return () => { mm.remove(); mmRef.current = null; };
    }, []);

    useEffect(() => {
        if (mmRef.current) {
            mmRef.current.setCenter([center.lng, center.lat]);
            mmRef.current.setZoom(Math.max(1, mainZoom - 6));
        }
    }, [center.lat, center.lng, mainZoom]);

    return (<div style={{ width: 140, height: 100, borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${theme.border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.5)', position: 'relative' }}>
        <div ref={ref} style={{ width: '100%', height: '100%' }} />
        {/* Crosshair */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.8"><line x1="8" y1="2" x2="8" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="2" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="14" y2="8"/></svg>
        </div>
        <div style={{ position: 'absolute', top: 3, left: 5, fontSize: 7, fontWeight: 700, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", opacity: 0.7 }}>OVERVIEW</div>
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

    // Settings
    const [showMinimap, setShowMinimap] = useState(true);
    const [showCompass, setShowCompass] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [showLocalization, setShowLocalization] = useState(true);
    const [showFps, setShowFps] = useState(false);

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

    // Load MapLibre
    useEffect(() => {
        const maplibreCSS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
        const maplibreJS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
        if (!document.querySelector(`link[href="${maplibreCSS}"]`)) { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = maplibreCSS; document.head.appendChild(link); }

        const initMap = () => {
            if (!mapContainer.current || !(window as any).maplibregl) return;
            const ml = (window as any).maplibregl;
            const map = new ml.Map({
                container: mapContainer.current,
                style: { version: 8, sources: { 'carto-dark': { type: 'raster', tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'], tileSize: 256, attribution: '&copy; OpenStreetMap &copy; CARTO' } }, layers: [{ id: 'carto-dark-layer', type: 'raster', source: 'carto-dark', minzoom: 0, maxzoom: 20 }] },
                center: [15.9819, 45.8150], zoom: 13, attributionControl: false,
            });
            map.addControl(new ml.AttributionControl({ compact: true }), 'bottom-right');
            map.addControl(new ml.ScaleControl({ maxWidth: 150 }), 'bottom-left');
            map.on('mousemove', (e: any) => setCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
            map.on('zoomend', () => setZoom(Math.round(map.getZoom() * 10) / 10));
            map.on('rotate', () => setBearing(map.getBearing()));
            map.on('load', () => { setLoaded(true); setZoom(Math.round(map.getZoom() * 10) / 10); });
            mapRef.current = map;
        };
        if ((window as any).maplibregl) initMap(); else { const s = document.createElement('script'); s.src = maplibreJS; s.onload = () => setTimeout(initMap, 50); document.head.appendChild(s); }
        return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    }, []);

    const handleRecenter = useCallback(() => { mapRef.current?.flyTo({ center: [15.9819, 45.8150], zoom: 13, bearing: 0, duration: 1000 }); }, []);
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
                    <Section title="Period" icon={Ico.period} defaultOpen={true}>
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
                    <Section title="Subjects" icon={Ico.subjects} defaultOpen={true} badge={selectedPersons.length}>
                        <div><div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Persons</div><SidebarMS selected={selectedPersons} onChange={setSelectedPersons} options={personOpts} placeholder="Select persons to track..." /></div>
                    </Section>

                    <Section title="Sources" icon={Ico.sources}><div className="tmap-empty">No source filters configured.</div></Section>
                    <Section title="Layers" icon={Ico.layers}><div className="tmap-empty">No custom layers configured.</div></Section>
                    <Section title="Tiles" icon={Ico.tiles}><div className="tmap-empty">Tile source selection coming soon.</div></Section>
                    <Section title="Tools" icon={Ico.tools}><div className="tmap-empty">Drawing and measurement tools coming soon.</div></Section>
                    <Section title="Intelligence" icon={Ico.intel}><div className="tmap-empty">Intelligence analysis panels coming soon.</div></Section>
                    <Section title="Custom Objects" icon={Ico.objects}><div className="tmap-empty">No custom objects placed.</div></Section>
                    <Section title="Saved Places" icon={Ico.places}><div className="tmap-empty">No saved places.</div></Section>

                    {/* SETTINGS */}
                    <Section title="Settings" icon={Ico.settings} defaultOpen={true}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Toggle label="World Minimap" description="Overview map in top-right corner" enabled={showMinimap} onChange={setShowMinimap} />
                            <Toggle label="Compass" description="Bearing indicator in bottom-left" enabled={showCompass} onChange={setShowCompass} />
                            <Toggle label="Map Controls" description="Zoom, fullscreen, rotation buttons" enabled={showControls} onChange={setShowControls} />
                            <Toggle label="Localization" description="Coordinate bar and scale" enabled={showLocalization} onChange={setShowLocalization} />
                            <Toggle label="FPS Counter" description="Frames per second display" enabled={showFps} onChange={setShowFps} />
                        </div>
                    </Section>
                </div>
            </div>

            {/* Map */}
            <div className="tmap-container">
                <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

                {/* Loading */}
                {!loaded && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0e16', zIndex: 20, gap: 12 }}><div style={{ width: 40, height: 40, border: `3px solid ${theme.border}`, borderTop: `3px solid ${theme.accent}`, borderRadius: '50%', animation: 'argux-spin 0.8s linear infinite' }} /><div style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary }}>Loading Tactical Map...</div></div>}

                {/* TOP-RIGHT: Minimap */}
                {showMinimap && loaded && <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 5 }}><Minimap center={coords} zoom={zoom} /></div>}

                {/* BOTTOM-LEFT: Compass */}
                {showCompass && loaded && <div style={{ position: 'absolute', bottom: 30, left: 12, zIndex: 5 }}><Compass bearing={bearing} /></div>}

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
                {showLocalization && loaded && <div className="tmap-coords"><span>LAT {coords.lat.toFixed(5)}</span><span>LNG {coords.lng.toFixed(5)}</span><span>Z {zoom}</span><span>BRG {Math.round(bearing)}°</span></div>}

                {/* FPS Counter */}
                {showFps && loaded && <div style={{ position: 'absolute', top: showMinimap ? 118 : 10, right: 10, zIndex: 5, background: fps >= 50 ? 'rgba(34,197,94,0.12)' : fps >= 30 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${fps >= 50 ? '#22c55e30' : fps >= 30 ? '#f59e0b30' : '#ef444430'}`, borderRadius: 6, padding: '4px 10px', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: fps >= 50 ? '#22c55e' : fps >= 30 ? '#f59e0b' : '#ef4444' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: fps >= 50 ? '#22c55e' : fps >= 30 ? '#f59e0b' : '#ef4444' }}>{fps} FPS</span>
                </div>}
            </div>
        </div>
    );
}

MapIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
