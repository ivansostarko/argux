import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockEvents as FALLBACK_EVENTS, typeConfig, sevConfig, allPersons, allOrgs, allOps, keyboardShortcuts } from '../../mock/activity';
import type { EventType, Severity, ActivityEvent } from '../../mock/activity';

function getCsrf(): string { return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''); }
async function apiCall(url: string): Promise<any> {
    try { const res = await fetch(url, { headers: { Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() } }); return { ok: res.ok, data: await res.json() }; }
    catch { return { ok: false, data: {} }; }
}

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Activity Log  ·  Unified Event Stream
   ═══════════════════════════════════════════════════════════════ */

function Skeleton({ w, h, r = 6 }: { w: string | number; h: number; r?: number }) {
    return <div className="act-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h, borderRadius: r }} />;
}
function SkeletonEvents({ count = 8 }: { count?: number }) {
    return <>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 14 }}>
        <Skeleton w={38} h={38} r={10} />
        <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}><Skeleton w={60} h={18} r={4} /><Skeleton w={50} h={18} r={4} /></div>
            <Skeleton w="80%" h={16} />
            <div style={{ height: 8 }} />
            <Skeleton w="95%" h={12} />
            <div style={{ height: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}><Skeleton w={90} h={12} /><Skeleton w={70} h={12} /><Skeleton w={100} h={12} /></div>
        </div>
    </div>)}</>;
}

function ActivityIndex() {
    const [search, setSearch] = useState('');
    const [typeF, setTypeF] = useState<Set<EventType>>(new Set(Object.keys(typeConfig) as EventType[]));
    const [sevF, setSevF] = useState<Severity | 'all'>('all');
    const [personF, setPersonF] = useState<number | 'all'>('all');
    const [orgF, setOrgF] = useState<number | 'all'>('all');
    const [opF, setOpF] = useState<string>('all');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();
    const perPage = 15;

    // Data state — API-driven with fallback
    const [mockEvents, setMockEvents] = useState(FALLBACK_EVENTS);

    useEffect(() => {
        const load = async () => {
            trigger();
            const { ok, data } = await apiCall('/mock-api/activity');
            if (ok && data.data) setMockEvents(data.data);
            setLoading(false);
        };
        load();
    }, []);

    const toggleType = (t: EventType) => { setTypeF(prev => { const n = new Set(prev); if (n.has(t)) n.delete(t); else n.add(t); return n; }); trigger(); };
    const resetFilters = useCallback(() => { setSearch(''); setTypeF(new Set(Object.keys(typeConfig) as EventType[])); setSevF('all'); setPersonF('all'); setOrgF('all'); setOpF('all'); setPage(1); trigger(); }, [trigger]);

    const filtered = useMemo(() => mockEvents.filter(e => {
        if (!typeF.has(e.type)) return false;
        if (sevF !== 'all' && e.severity !== sevF) return false;
        if (personF !== 'all' && e.personId !== personF) return false;
        if (orgF !== 'all' && e.orgId !== orgF) return false;
        if (opF !== 'all' && e.operationCode !== opF) return false;
        if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase()) && !e.personName.toLowerCase().includes(search.toLowerCase()) && !e.location.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [typeF, sevF, personF, orgF, opF, search]);

    const paged = filtered.slice(0, page * perPage);
    const hasMore = paged.length < filtered.length;
    const stats = { total: filtered.length, critical: filtered.filter(e => e.severity === 'critical').length, high: filtered.filter(e => e.severity === 'high').length, persons: new Set(filtered.filter(e => e.personId).map(e => e.personId)).size, types: new Set(filtered.map(e => e.type)).size };

    // ═══ Keyboard Shortcuts ═══
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'c': case 'C': if (!e.ctrlKey && !e.metaKey) { setSevF(prev => prev === 'critical' ? 'all' : 'critical'); trigger(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) { resetFilters(); } break;
                case 'Escape': setExpanded(null); setShowShortcuts(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [trigger, resetFilters]);

    const selectStyle: React.CSSProperties = { width: '100%', padding: '7px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' };

    return (<>
        <PageMeta title="Activity Log" />
        <div className="act-page" data-testid="activity-page">

            {/* LEFT SIDEBAR */}
            <div className="act-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '16px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#22c55e10', border: '1px solid #22c55e25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📊</div>
                        <div><div style={{ fontSize: 17, fontWeight: 800, color: theme.text }}>ACTIVITY</div><div style={{ fontSize: 11, color: theme.textDim }}>Event Stream</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 7, padding: '0 12px' }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search events..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="act-kbd">F</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="act-stats-bar" style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ n: stats.total, l: 'Events', c: theme.accent }, { n: stats.critical, l: 'Critical', c: '#ef4444' }, { n: stats.high, l: 'High', c: '#f97316' }, { n: stats.persons, l: 'Persons', c: '#06b6d4' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '5px 0' }}><div style={{ fontSize: 18, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 9, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Type toggles */}
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>Event Type</div>
                    {(Object.keys(typeConfig) as EventType[]).map(t => { const tc = typeConfig[t]; const cnt = mockEvents.filter(e => e.type === t).length; const on = typeF.has(t); return <button key={t} onClick={() => toggleType(t)} style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 5, background: on ? `${tc.color}08` : 'transparent', color: on ? tc.color : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, borderLeft: `2px solid ${on ? tc.color : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1, opacity: on ? 1 : 0.5 }}><span style={{ fontSize: 14 }}>{tc.icon}</span><span style={{ flex: 1 }}>{tc.label}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{cnt}</span></button>; })}
                </div>

                {/* Severity + Person + Org + Op */}
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Severity</div><div style={{ display: 'flex', gap: 3 }}>
                        {(['all', 'critical', 'high', 'medium', 'low', 'info'] as const).map(s => <button key={s} onClick={() => { setSevF(s as any); trigger(); }} style={{ flex: 1, padding: '4px', borderRadius: 4, border: `1px solid ${sevF === s ? (s === 'all' ? theme.accent : sevConfig[s as Severity].color) + '40' : theme.border}`, background: sevF === s ? `${s === 'all' ? theme.accent : sevConfig[s as Severity].color}08` : 'transparent', color: sevF === s ? (s === 'all' ? theme.accent : sevConfig[s as Severity].color) : theme.textDim, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>{s === 'all' ? 'All' : s.slice(0, 4)}</button>)}
                    </div></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Person</div><select value={personF === 'all' ? 'all' : String(personF)} onChange={e => { setPersonF(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); trigger(); }} style={selectStyle}><option value="all">All Persons</option>{allPersons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Organization</div><select value={orgF === 'all' ? 'all' : String(orgF)} onChange={e => { setOrgF(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); trigger(); }} style={selectStyle}><option value="all">All Organizations</option>{allOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Operation</div><select value={opF} onChange={e => { setOpF(e.target.value); trigger(); }} style={selectStyle}><option value="all">All Operations</option>{allOps.map(o => <option key={o} value={o}>OP {o}</option>)}</select></div>
                </div>

                <div style={{ padding: '12px 16px' }}>
                    <button onClick={resetFilters} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset Filters <span className="act-kbd" style={{ marginLeft: 4 }}>R</span></button>
                </div>
            </div>

            {/* CENTER */}
            <div className="act-center">
                {/* Mobile search + filter bar */}
                <div className="act-mobile-filters" style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 160 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <select value={sevF} onChange={e => { setSevF(e.target.value as any); trigger(); }} style={{ padding: '7px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}>
                        <option value="all">All Sev</option>
                        {Object.entries(sevConfig).map(([k]) => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <select value={personF === 'all' ? 'all' : String(personF)} onChange={e => { setPersonF(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); trigger(); }} style={{ padding: '7px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', maxWidth: 120 }}>
                        <option value="all">All Persons</option>
                        {allPersons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                {/* Header bar */}
                <div style={{ padding: '12px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{stats.total} Events</span>
                    {stats.critical > 0 && <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 5, background: '#ef444412', color: '#ef4444' }}>{stats.critical} critical</span>}
                    {stats.high > 0 && <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 5, background: '#f9731612', color: '#f97316' }}>{stats.high} high</span>}
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: theme.textDim }}>{stats.types} types · {stats.persons} persons</span>
                </div>

                <div className="act-scroll">
                    {loading && <SkeletonEvents count={8} />}

                    {!loading && paged.length === 0 && <div style={{ padding: 60, textAlign: 'center' as const }}><div style={{ fontSize: 40, opacity: 0.2 }}>📊</div><div style={{ fontSize: 16, fontWeight: 700, color: theme.textSecondary, marginTop: 8 }}>No events match filters</div><button onClick={resetFilters} style={{ marginTop: 14, padding: '10px 20px', borderRadius: 7, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Reset Filters</button></div>}

                    {!loading && paged.map(e => {
                        const tc = typeConfig[e.type]; const sc = sevConfig[e.severity]; const isExp = expanded === e.id;
                        return <div key={e.id} className="act-event" onClick={() => setExpanded(isExp ? null : e.id)} style={{ padding: '14px 20px', borderBottom: `1px solid ${theme.border}06`, borderLeft: `3px solid ${isExp ? tc.color : 'transparent'}`, background: isExp ? `${tc.color}04` : 'transparent' }}>
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${tc.color}12`, border: `1px solid ${tc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tc.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${sc.color}12`, color: sc.color }}>{sc.label}</span>
                                        <span style={{ fontSize: 10, color: tc.color, fontWeight: 600 }}>{tc.label}</span>
                                        <span style={{ fontSize: 11, color: theme.textDim, marginLeft: 'auto', flexShrink: 0 }}>{e.timeAgo}</span>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, lineHeight: 1.4, marginBottom: 4 }}>{e.title}</div>
                                    <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>{isExp ? e.description : e.description.length > 120 ? e.description.slice(0, 120) + '…' : e.description}</div>
                                    <div className="act-event-meta" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' as const }}>
                                        {e.personName && <a href={`/persons/${e.personId}`} onClick={ev => ev.stopPropagation()} style={{ fontSize: 11, color: theme.accent, textDecoration: 'none' }}>🧑 {e.personName}</a>}
                                        {e.orgName && <a href={`/organizations/${e.orgId}`} onClick={ev => ev.stopPropagation()} style={{ fontSize: 11, color: '#8b5cf6', textDecoration: 'none' }}>🏢 {e.orgName}</a>}
                                        {e.operationCode && <span style={{ fontSize: 10, color: theme.accent, fontWeight: 600 }}>{e.operationCode}</span>}
                                        {e.location && e.location !== 'System' && <span style={{ fontSize: 10, color: theme.textDim }}>📍 {e.location}</span>}
                                    </div>
                                    {isExp && <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, background: `${theme.border}06` }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                                            {Object.entries(e.metadata).map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 11, color: theme.textDim }}>{k}</span><span style={{ fontSize: 11, color: theme.text, fontWeight: 600 }}>{v}</span></div>)}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 11, color: theme.textDim }}>Source</span><span style={{ fontSize: 11, color: theme.text }}>{e.source}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 11, color: theme.textDim }}>Timestamp</span><span style={{ fontSize: 11, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{e.timestamp}</span></div>
                                        </div>
                                        <div className="act-event-actions" style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                                            {e.personId && <a href={`/persons/${e.personId}`} onClick={ev => ev.stopPropagation()} style={{ padding: '5px 12px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, textDecoration: 'none', fontSize: 11, fontWeight: 600 }}>🧑 Profile</a>}
                                            <a href="/map" onClick={ev => ev.stopPropagation()} style={{ padding: '5px 12px', borderRadius: 5, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 11 }}>🗺️ Map</a>
                                            <a href="/alerts" onClick={ev => ev.stopPropagation()} style={{ padding: '5px 12px', borderRadius: 5, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 11 }}>🔔 Alerts</a>
                                        </div>
                                    </div>}
                                </div>
                            </div>
                        </div>;
                    })}

                    {!loading && hasMore && <div style={{ padding: '16px 20px', textAlign: 'center' as const }}><button onClick={() => { setPage(p => p + 1); trigger(); }} style={{ padding: '10px 28px', borderRadius: 7, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Load more ({filtered.length - paged.length} remaining)</button></div>}
                </div>
            </div>

            {/* Keyboard shortcuts modal (Ctrl+Q) */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div>
                        <button onClick={() => setShowShortcuts(false)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="act-kbd" style={{ minWidth: 54, textAlign: 'center' as const }}>{s.key}</span><span style={{ fontSize: 12, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 14, fontSize: 10, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

ActivityIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default ActivityIndex;
