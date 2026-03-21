import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockPersons } from '../../mock/persons';

/* ═══ MULTISELECT (sidebar-optimized) ═══ */
function SidebarMS({ selected, onChange, options, placeholder }: { selected: string[]; onChange: (v: string[]) => void; options: { id: string; label: string; sub?: string }[]; placeholder: string }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
    const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    const has = selected.length > 0;

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button className="tmap-ms-trigger" onClick={() => { setOpen(!open); setQ(''); }} style={{ color: has ? theme.text : theme.textDim, borderColor: has ? theme.accent + '40' : theme.border }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{has ? `${selected.length} selected` : placeholder}</span>
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4" /></svg>
            </button>
            {open && <div className="tmap-ms-panel">
                <div className="tmap-ms-search">
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus />
                    {has && <button onClick={() => onChange([])} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: theme.danger, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '2px 6px', borderRadius: 3, flexShrink: 0 }}>Clear</button>}
                </div>
                <div className="tmap-ms-list">
                    {filtered.map(o => { const c = selected.includes(o.id); return (
                        <div key={o.id} className="tmap-ms-item" onClick={() => toggle(o.id)} style={{ color: c ? theme.accent : theme.text }}>
                            <div className={`tmap-ms-check ${c ? 'on' : ''}`}>{c && <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>
                            <div><div>{o.label}</div>{o.sub && <div style={{ fontSize: 9, color: theme.textDim }}>{o.sub}</div>}</div>
                        </div>
                    ); })}
                    {filtered.length === 0 && <div style={{ padding: 12, fontSize: 10, color: theme.textDim, textAlign: 'center' }}>No results</div>}
                </div>
            </div>}
            {/* Selected tags */}
            {has && <div className="tmap-tags">
                {selected.map(id => { const o = options.find(x => x.id === id); return o ? <span key={id} className="tmap-tag">{o.label.split(' ')[0]}<button onClick={e => { e.stopPropagation(); toggle(id); }}><svg width="7" height="7" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button></span> : null; })}
            </div>}
        </div>
    );
}

/* ═══ COLLAPSIBLE SECTION ═══ */
function Section({ title, icon, children, defaultOpen = false, badge }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; badge?: number }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="tmap-section">
            <div className="tmap-section-header" onClick={() => setOpen(!open)}>
                <div className="tmap-section-title">{icon}{title}{badge !== undefined && badge > 0 && <span style={{ fontSize: 8, fontWeight: 700, padding: '0 4px', borderRadius: 6, background: theme.accent, color: '#fff', lineHeight: '14px' }}>{badge}</span>}</div>
                <svg className={`tmap-section-chevron ${open ? 'open' : ''}`} width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,3 5,7 8,3" /></svg>
            </div>
            {open && <div className="tmap-section-content">{children}</div>}
        </div>
    );
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
    settings: <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="2"/><path d="M13.5 8a5.5 5.5 0 00-.5-2l1.5-1.5-1.5-1.5L11.5 4.5a5.5 5.5 0 00-2-.5V2h-3v2a5.5 5.5 0 00-2 .5L3 3 1.5 4.5 3 6a5.5 5.5 0 00-.5 2H.5v3h2a5.5 5.5 0 00.5 2L1.5 14.5 3 16l1.5-1.5a5.5 5.5 0 002 .5v2h3v-2a5.5 5.5 0 002-.5L13 16l1.5-1.5L13 13a5.5 5.5 0 00.5-2h2v-3z" transform="scale(0.75) translate(2,2)"/></svg>,
};

const personOpts = mockPersons.map(p => ({ id: p.id.toString(), label: `${p.firstName} ${p.lastName}`, sub: p.nationality }));

/* ═══ MAP COMPONENT ═══ */
export default function MapIndex() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const [loaded, setLoaded] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [coords, setCoords] = useState({ lat: 45.8150, lng: 15.9819 });
    const [zoom, setZoom] = useState(13);

    // Sidebar state
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedPersons, setSelectedPersons] = useState<string[]>([]);

    // Load MapLibre GL JS dynamically
    useEffect(() => {
        const maplibreCSS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
        const maplibreJS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';

        // Load CSS
        if (!document.querySelector(`link[href="${maplibreCSS}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet'; link.href = maplibreCSS;
            document.head.appendChild(link);
        }

        // Load JS
        const initMap = () => {
            if (!mapContainer.current || !(window as any).maplibregl) return;
            const maplibregl = (window as any).maplibregl;

            const map = new maplibregl.Map({
                container: mapContainer.current,
                style: {
                    version: 8,
                    sources: {
                        'carto-dark': {
                            type: 'raster',
                            tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
                            tileSize: 256,
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
                        },
                    },
                    layers: [{
                        id: 'carto-dark-layer',
                        type: 'raster',
                        source: 'carto-dark',
                        minzoom: 0,
                        maxzoom: 20,
                    }],
                },
                center: [15.9819, 45.8150], // Zagreb
                zoom: 13,
                attributionControl: false,
            });

            map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
            map.addControl(new maplibregl.ScaleControl({ maxWidth: 200 }), 'bottom-right');
            map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

            map.on('mousemove', (e: any) => {
                setCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
            });
            map.on('zoomend', () => { setZoom(Math.round(map.getZoom() * 10) / 10); });
            map.on('load', () => { setLoaded(true); setZoom(Math.round(map.getZoom() * 10) / 10); });

            mapRef.current = map;
        };

        if ((window as any).maplibregl) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.src = maplibreJS;
            script.onload = () => { setTimeout(initMap, 50); };
            document.head.appendChild(script);
        }

        return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    }, []);

    const handleRecenter = useCallback(() => {
        if (mapRef.current) mapRef.current.flyTo({ center: [15.9819, 45.8150], zoom: 13, duration: 1000 });
    }, []);

    const dateInputStyle: React.CSSProperties = { width: '100%', padding: '7px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", outline: 'none', colorScheme: 'dark' as any };

    return (
        <div className="tmap-page">
            {/* Mobile sidebar toggle */}
            <button className="tmap-mobile-toggle tmap-overlay-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg>
            </button>

            {/* Mobile overlay */}
            {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }} className="tmap-mobile-overlay" />}

            {/* Sidebar */}
            <div className={`tmap-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="tmap-sidebar-header">
                    <div className="tmap-sidebar-brand">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 2v12M2 8h12"/><circle cx="8" cy="8" r="2"/></svg>
                            Tactical Map
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={handleRecenter} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Recenter on Zagreb" onMouseEnter={e => (e.currentTarget.style.color = theme.accent)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}>
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5"/><circle cx="8" cy="8" r="1"/><line x1="8" y1="1" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/></svg>
                        </button>
                    </div>
                </div>

                <div className="tmap-sidebar-body">
                    {/* PERIOD */}
                    <Section title="Period" icon={Ico.period} defaultOpen={true}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>From</div>
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={dateInputStyle} />
                            </div>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>To</div>
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={dateInputStyle} />
                            </div>
                            {(dateFrom || dateTo) && <div style={{ display: 'flex', gap: 6 }}>
                                {['24h', '7d', '30d'].map(p => <button key={p} onClick={() => { const d = new Date(); const from = new Date(); if (p === '24h') from.setDate(d.getDate() - 1); if (p === '7d') from.setDate(d.getDate() - 7); if (p === '30d') from.setDate(d.getDate() - 30); setDateFrom(from.toISOString().slice(0, 10)); setDateTo(d.toISOString().slice(0, 10)); }} style={{ flex: 1, padding: '4px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textDim; }}>{p}</button>)}
                                <button onClick={() => { setDateFrom(''); setDateTo(''); }} style={{ padding: '4px 8px', borderRadius: 4, border: `1px solid rgba(239,68,68,0.2)`, background: 'rgba(239,68,68,0.06)', color: theme.danger, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Clear</button>
                            </div>}
                        </div>
                    </Section>

                    {/* SUBJECTS */}
                    <Section title="Subjects" icon={Ico.subjects} defaultOpen={true} badge={selectedPersons.length}>
                        <div style={{ marginBottom: 6 }}>
                            <div style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Persons</div>
                            <SidebarMS selected={selectedPersons} onChange={setSelectedPersons} options={personOpts} placeholder="Select persons to track..." />
                        </div>
                    </Section>

                    {/* SOURCES */}
                    <Section title="Sources" icon={Ico.sources}>
                        <div className="tmap-empty">No source filters configured.</div>
                    </Section>

                    {/* LAYERS */}
                    <Section title="Layers" icon={Ico.layers}>
                        <div className="tmap-empty">No custom layers configured.</div>
                    </Section>

                    {/* TILES */}
                    <Section title="Tiles" icon={Ico.tiles}>
                        <div className="tmap-empty">Tile source selection coming soon.</div>
                    </Section>

                    {/* TOOLS */}
                    <Section title="Tools" icon={Ico.tools}>
                        <div className="tmap-empty">Drawing and measurement tools coming soon.</div>
                    </Section>

                    {/* INTELLIGENCE */}
                    <Section title="Intelligence" icon={Ico.intel}>
                        <div className="tmap-empty">Intelligence analysis panels coming soon.</div>
                    </Section>

                    {/* CUSTOM OBJECTS */}
                    <Section title="Custom Objects" icon={Ico.objects}>
                        <div className="tmap-empty">No custom objects placed.</div>
                    </Section>

                    {/* SAVED PLACES */}
                    <Section title="Saved Places" icon={Ico.places}>
                        <div className="tmap-empty">No saved places.</div>
                    </Section>

                    {/* SETTINGS */}
                    <Section title="Settings" icon={Ico.settings}>
                        <div className="tmap-empty">Map settings coming soon.</div>
                    </Section>
                </div>
            </div>

            {/* Map */}
            <div className="tmap-container">
                <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

                {/* Loading overlay */}
                {!loaded && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0e16', zIndex: 20, gap: 12 }}>
                    <div style={{ width: 40, height: 40, border: `3px solid ${theme.border}`, borderTop: `3px solid ${theme.accent}`, borderRadius: '50%', animation: 'argux-spin 0.8s linear infinite' }} />
                    <div style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary }}>Loading Tactical Map...</div>
                    <div style={{ fontSize: 10, color: theme.textDim }}>Initializing MapLibre GL JS</div>
                </div>}

                {/* Coordinates */}
                <div className="tmap-coords">
                    <span>LAT {coords.lat.toFixed(5)}</span>
                    <span>LNG {coords.lng.toFixed(5)}</span>
                    <span>Z {zoom}</span>
                </div>
            </div>
        </div>
    );
}

MapIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
