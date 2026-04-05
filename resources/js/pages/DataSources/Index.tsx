import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockDS as FALLBACK_DS, statusColors, statusIcons, catColors, catIcons, allCategories, allProtocols, allCountries, keyboardShortcuts } from '../../mock/dataSources';
import type { DSStatus, DSCategory, Protocol, DataSource } from '../../mock/dataSources';

function getCsrf(): string { return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''); }
async function apiCall(url: string, method = 'GET', body?: any): Promise<any> {
    try {
        const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        return { ok: res.ok, status: res.status, data: await res.json() };
    } catch { return { ok: false, status: 0, data: {} }; }
}

/* ═══ ARGUX — Data Sources ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="ds-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }
function SkeletonRows({ count = 6 }: { count?: number }) { return <>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'center' }}><Skel w={40} h={40} /><div style={{ flex: 1 }}><Skel w="55%" h={14} /><div style={{ height: 6 }} /><Skel w="35%" h={10} /></div><Skel w={70} h={14} /><Skel w={55} h={14} /></div>)}</>; }

function DataSourcesIndex() {
    const [search, setSearch] = useState('');
    const [catF, setCatF] = useState<DSCategory | 'all'>('all');
    const [statusF, setStatusF] = useState<DSStatus | 'all'>('all');
    const [countryF, setCountryF] = useState('all');
    const [selDS, setSelDS] = useState<string | null>(null);
    const [detailTab, setDetailTab] = useState<'info' | 'synclog'>('info');
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newForm, setNewForm] = useState({ name: '', provider: '', category: 'Government' as DSCategory, protocol: 'REST' as Protocol, endpoint: '', auth: 'API Key', schedule: 'Every 1h', country: 'Croatia' });
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    // Data state — API-driven with fallback
    const [mockDS, setMockDS] = useState(FALLBACK_DS);

    useEffect(() => {
        const load = async () => {
            trigger();
            const { ok, data } = await apiCall('/mock-api/data-sources');
            if (ok && data.data) setMockDS(data.data);
            setLoading(false);
        };
        load();
    }, []);

    const ds = selDS ? mockDS.find(d => d.id === selDS) : null;

    const filtered = useMemo(() => mockDS.filter(d => {
        if (catF !== 'all' && d.category !== catF) return false;
        if (statusF !== 'all' && d.status !== statusF) return false;
        if (countryF !== 'all' && d.country !== countryF) return false;
        if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.provider.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [catF, statusF, countryF, search]);

    const grouped = useMemo(() => {
        const m: Record<string, DataSource[]> = {};
        filtered.forEach(d => { if (!m[d.country]) m[d.country] = []; m[d.country].push(d); });
        return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered]);

    const stats = { total: mockDS.length, connected: mockDS.filter(d => d.status === 'Connected').length, degraded: mockDS.filter(d => d.status === 'Degraded').length, error: mockDS.filter(d => d.status === 'Error' || d.status === 'Offline').length, paused: mockDS.filter(d => d.status === 'Paused').length, avgHealth: Math.round(mockDS.filter(d => d.health > 0).reduce((s, d) => s + d.health, 0) / mockDS.filter(d => d.health > 0).length) };

    const resetFilters = useCallback(() => { setSearch(''); setCatF('all'); setStatusF('all'); setCountryF('all'); trigger(); }, [trigger]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case 'n': case 'N': if (!e.ctrlKey && !e.metaKey) setShowNewModal(true); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 's': case 'S': if (!e.ctrlKey && !e.metaKey) trigger(); break;
                case 'Escape': setSelDS(null); setShowShortcuts(false); setShowNewModal(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [resetFilters, trigger]);

    return (<>
        <PageMeta title="Data Sources" />
        <div className="ds-page" data-testid="data-sources-page">

            {/* LEFT */}
            <div className="ds-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#06b6d410', border: '1px solid #06b6d425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🗄️</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>DATA SOURCES</div><div style={{ fontSize: 10, color: theme.textDim }}>{stats.total} integrations</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sources..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="ds-kbd">F</span>
                    </div>
                </div>

                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ l: 'Conn', n: stats.connected, c: '#22c55e' }, { l: 'Degr', n: stats.degraded, c: '#f59e0b' }, { l: 'Err', n: stats.error, c: '#ef4444' }, { l: 'Paus', n: stats.paused, c: '#6b7280' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}><div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Category</div>
                    <button onClick={() => { setCatF('all'); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: catF === 'all' ? `${theme.accent}08` : 'transparent', color: catF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, borderLeft: `2px solid ${catF === 'all' ? theme.accent : 'transparent'}`, textAlign: 'left' as const, fontWeight: catF === 'all' ? 700 : 500, marginBottom: 1 }}>All ({mockDS.length})</button>
                    {allCategories.map(c => { const count = mockDS.filter(d => d.category === c).length; return <button key={c} onClick={() => { setCatF(c); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: catF === c ? `${catColors[c]}08` : 'transparent', color: catF === c ? catColors[c] : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, borderLeft: `2px solid ${catF === c ? catColors[c] : 'transparent'}`, textAlign: 'left' as const, fontWeight: catF === c ? 600 : 400, marginBottom: 1 }}><span style={{ fontSize: 13 }}>{catIcons[c]}</span><span style={{ flex: 1 }}>{c}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{count}</span></button>; })}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Status</div>
                    {(['all', 'Connected', 'Degraded', 'Paused', 'Error'] as const).map(s => { const count = s === 'all' ? mockDS.length : mockDS.filter(d => d.status === s).length; if (count === 0 && s !== 'all') return null; return <button key={s} onClick={() => { setStatusF(s as any); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '4px 10px', border: 'none', borderRadius: 4, background: statusF === s ? `${s === 'all' ? theme.accent : statusColors[s as DSStatus]}08` : 'transparent', color: statusF === s ? (s === 'all' ? theme.accent : statusColors[s as DSStatus]) : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, borderLeft: `2px solid ${statusF === s ? (s === 'all' ? theme.accent : statusColors[s as DSStatus]) : 'transparent'}`, textAlign: 'left' as const, fontWeight: statusF === s ? 600 : 400, marginBottom: 1 }}>{s === 'all' ? '📋' : statusIcons[s as DSStatus]} <span style={{ flex: 1 }}>{s === 'all' ? 'All' : s}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{count}</span></button>; })}</div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Country</div><select value={countryF} onChange={e => { setCountryF(e.target.value); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Countries</option>{allCountries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>

                <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                    <button onClick={resetFilters} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset <span className="ds-kbd" style={{ marginLeft: 4 }}>R</span></button>
                    <button onClick={() => trigger()} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Sync All <span className="ds-kbd" style={{ marginLeft: 4 }}>S</span></button>
                    <div style={{ fontSize: 10, color: theme.textDim, textAlign: 'center' as const }}>Avg Health: <span style={{ color: stats.avgHealth > 90 ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>{stats.avgHealth}%</span></div>
                </div>
            </div>

            {/* CENTER */}
            <div className="ds-center" style={{ display: 'flex', flexDirection: 'column' as const }}>
                <div className="ds-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <select value={catF} onChange={e => { setCatF(e.target.value as any); trigger(); }} style={{ padding: '7px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}><option value="all">All Cat</option>{allCategories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <button onClick={() => setShowNewModal(true)} style={{ padding: '7px 12px', borderRadius: 6, border: 'none', background: '#06b6d4', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>+ New</button>
                </div>

                {/* + New button bar */}
                <div style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{filtered.length} Sources</span>
                    <span style={{ fontSize: 11, color: theme.textDim }}>across {grouped.length} {grouped.length === 1 ? 'region' : 'regions'}</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => setShowNewModal(true)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#06b6d4', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>+ New Source <span className="ds-kbd" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>N</span></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {loading && <SkeletonRows count={10} />}

                    {!loading && grouped.length === 0 && <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.2 }}>🗄️</div><div style={{ fontSize: 15, fontWeight: 700, color: theme.textSecondary, marginTop: 6 }}>No sources match</div><button onClick={resetFilters} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button></div>}

                    {!loading && grouped.map(([country, sources]) => <div key={country}>
                        <div style={{ padding: '10px 18px', borderBottom: `1px solid ${theme.border}`, background: `${theme.border}08`, position: 'sticky' as const, top: 0, zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{sources[0]?.countryFlag || '🌍'}</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>{country}</span>
                            <span style={{ fontSize: 10, color: theme.textDim }}>({sources.length})</span>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
                                {(['Connected', 'Degraded', 'Error'] as const).map(s => { const c = sources.filter(d => d.status === s).length; return c > 0 ? <span key={s} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${statusColors[s]}12`, color: statusColors[s] }}>{c} {s.slice(0, 4)}</span> : null; })}
                            </div>
                        </div>
                        {sources.map(d => { const sel = selDS === d.id; const sc = statusColors[d.status]; const cc = catColors[d.category];
                            return <div key={d.id} className="ds-row" onClick={() => { setSelDS(d.id); setDetailTab('info'); }} style={{ padding: '12px 18px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: sel ? `${cc}04` : 'transparent', borderLeft: `3px solid ${sel ? cc : 'transparent'}` }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `conic-gradient(${sc} ${d.health * 3.6}deg, ${theme.border}20 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: sc, fontFamily: "'JetBrains Mono',monospace" }}>{d.health || '—'}</div></div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 2 }}>{d.name}</div>
                                    <div style={{ fontSize: 10, color: theme.textDim }}>{d.provider}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const, justifyContent: 'flex-end', maxWidth: 200 }}>
                                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${cc}12`, color: cc, fontWeight: 600 }}>{catIcons[d.category]} {d.category}</span>
                                    {d.tags.slice(0, 2).map(t => <span key={t.label} style={{ fontSize: 8, padding: '2px 5px', borderRadius: 3, background: `${t.color}12`, color: t.color }}>{t.label}</span>)}
                                </div>
                                <div style={{ textAlign: 'right' as const, flexShrink: 0, width: 70 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: sc }}>{statusIcons[d.status]} {d.status}</div>
                                    <div style={{ fontSize: 9, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{d.protocol}</div>
                                </div>
                            </div>;
                        })}
                    </div>)}
                </div>
            </div>

            {/* RIGHT: Detail */}
            {ds && <div className="ds-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 6, background: `${catColors[ds.category]}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{catIcons[ds.category]}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{ds.name}</div><div style={{ fontSize: 10, color: theme.textDim }}>{ds.provider}</div></div>
                        <button onClick={() => setSelDS(null)} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${statusColors[ds.status]}12`, color: statusColors[ds.status] }}>{statusIcons[ds.status]} {ds.status}</span>
                        {ds.tags.map(t => <span key={t.label} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${t.color}12`, color: t.color }}>{t.label}</span>)}
                    </div>
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' as const }}><div style={{ width: 44, height: 44, borderRadius: '50%', background: `conic-gradient(${statusColors[ds.status]} ${ds.health * 3.6}deg, ${theme.border}20 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><div style={{ width: 34, height: 34, borderRadius: '50%', background: theme.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: statusColors[ds.status], fontFamily: "'JetBrains Mono',monospace" }}>{ds.health || '—'}</div></div><div style={{ fontSize: 8, color: theme.textDim, marginTop: 3 }}>Health</div></div>
                    <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{ds.errorRate}%</div><div style={{ fontSize: 8, color: theme.textDim }}>Error</div></div>
                    <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.accent, fontFamily: "'JetBrains Mono',monospace" }}>{ds.recordCount.includes('Streaming') ? '∞' : ds.recordCount.split(',')[0] + (ds.recordCount.includes(',') ? 'K+' : '')}</div><div style={{ fontSize: 8, color: theme.textDim }}>Records</div></div>
                </div>

                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {[{ id: 'info' as const, l: '⚙️ Connection' }, { id: 'synclog' as const, l: '📜 Sync Log' }].map(t => <button key={t.id} onClick={() => setDetailTab(t.id)} style={{ flex: 1, padding: '8px', border: 'none', borderBottom: `2px solid ${detailTab === t.id ? catColors[ds.category] : 'transparent'}`, background: 'transparent', color: detailTab === t.id ? theme.text : theme.textDim, fontSize: 11, fontWeight: detailTab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{t.l}</button>)}
                </div>

                {detailTab === 'info' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                        {[{ l: 'Protocol', v: ds.protocol }, { l: 'Endpoint', v: ds.endpoint }, { l: 'Auth', v: ds.auth }, { l: 'Rate Limit', v: ds.rateLimit }, { l: 'Country', v: `${ds.countryFlag} ${ds.country}` }, { l: 'Schedule', v: ds.schedule }, { l: 'Last Sync', v: ds.lastSync }, { l: 'Next Sync', v: ds.nextSync }, { l: 'Records', v: ds.recordCount }, { l: 'Encrypt Rest', v: ds.encryptRest ? '✅ AES-256' : '❌ No' }, { l: 'Encrypt Transit', v: ds.encryptTransit ? '✅ TLS 1.3' : '❌ No' }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 10, color: theme.textDim, flexShrink: 0 }}>{r.l}</span><span style={{ fontSize: 10, color: theme.text, textAlign: 'right' as const, wordBreak: 'break-all' as const }}>{r.v}</span></div>)}
                    </div>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>Data Fields ({ds.dataFields.length})</div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>{ds.dataFields.map(f => <span key={f} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${theme.border}30`, color: theme.textSecondary }}>{f}</span>)}</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>Linked Modules ({ds.linkedModules.length})</div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>{ds.linkedModules.map(m => <span key={m} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${theme.accent}08`, color: theme.accent, fontWeight: 600 }}>{m}</span>)}</div>
                    </div>
                    {ds.notes && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 3 }}>Notes</div><div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5 }}>{ds.notes}</div></div>}
                    <div style={{ padding: '10px 14px', display: 'flex', gap: 4 }}>
                        <button style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Sync</button>
                        <button style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{ds.status === 'Paused' ? '▶️ Resume' : '⏸️ Pause'}</button>
                    </div>
                </div>}

                {detailTab === 'synclog' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {ds.syncLog.length === 0 && <div style={{ padding: 24, textAlign: 'center' as const, color: theme.textDim, fontSize: 11 }}>No sync history</div>}
                    {ds.syncLog.map(e => { const ec = e.status === 'success' ? '#22c55e' : e.status === 'error' ? '#ef4444' : '#f59e0b';
                        return <div key={e.id} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}06` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: ec }} /><span style={{ fontSize: 10, fontWeight: 700, color: ec, textTransform: 'uppercase' as const }}>{e.status}</span><span style={{ fontSize: 9, color: theme.textDim, marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace" }}>{e.duration}</span></div>
                            <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5, marginBottom: 3 }}>{e.detail}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: theme.textDim }}><span>{e.ts}</span>{e.records > 0 && <span>{e.records} records</span>}</div>
                        </div>; })}
                </div>}
            </div>}

            {/* ═══ NEW DATA SOURCE MODAL ═══ */}
            {showNewModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 540, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>🗄️ New Data Source</div>
                        <button onClick={() => setShowNewModal(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Source Name *</div><input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Croatian Court Records" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Provider</div><input value={newForm.provider} onChange={e => setNewForm(f => ({ ...f, provider: e.target.value }))} placeholder="e.g. Ministry of Justice" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Category *</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                        {allCategories.map(c => { const on = newForm.category === c; return <button key={c} onClick={() => setNewForm(f => ({ ...f, category: c }))} style={{ padding: '8px 6px', borderRadius: 6, border: `1px solid ${on ? catColors[c] + '40' : theme.border}`, background: on ? `${catColors[c]}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const }}><div style={{ fontSize: 16 }}>{catIcons[c]}</div><div style={{ fontSize: 9, fontWeight: on ? 700 : 500, color: on ? catColors[c] : theme.textDim, marginTop: 2 }}>{c}</div></button>; })}
                    </div></div>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Protocol *</div><select value={newForm.protocol} onChange={e => setNewForm(f => ({ ...f, protocol: e.target.value as Protocol }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{allProtocols.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Schedule</div><select value={newForm.schedule} onChange={e => setNewForm(f => ({ ...f, schedule: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{['Real-time', 'Every 5min', 'Every 15min', 'Every 1h', 'Every 4h', 'Every 6h', 'Every 12h', 'Daily'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    </div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Endpoint URL *</div><input value={newForm.endpoint} onChange={e => setNewForm(f => ({ ...f, endpoint: e.target.value }))} placeholder="https://api.example.com/v1" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: "'JetBrains Mono',monospace", outline: 'none' }} /></div>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Authentication</div><select value={newForm.auth} onChange={e => setNewForm(f => ({ ...f, auth: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{['API Key', 'OAuth2', 'Certificate', 'Certificate + API Key', 'Certificate + OAuth2', 'Certificate + mTLS', 'Certificate + Biometric', 'Hardware Token', 'Key Pair + OTP', 'None'].map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Country</div><select value={newForm.country} onChange={e => setNewForm(f => ({ ...f, country: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{['Croatia', 'EU', 'International', 'USA', 'UK', 'Greece', 'Sweden', 'Qatar', 'Global', 'Multi-country'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowNewModal(false)} style={{ flex: 1, padding: '11px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={() => { setShowNewModal(false); trigger(); }} disabled={!newForm.name || !newForm.endpoint} style={{ flex: 2, padding: '11px', borderRadius: 6, border: 'none', background: newForm.name && newForm.endpoint ? '#06b6d4' : `${theme.border}30`, color: newForm.name && newForm.endpoint ? '#fff' : theme.textDim, fontSize: 13, fontWeight: 800, cursor: newForm.name && newForm.endpoint ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>🗄️ Create Data Source</button>
                    </div>
                </div>
            </div>}

            {/* Ctrl+Q */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="ds-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

DataSourcesIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default DataSourcesIndex;
