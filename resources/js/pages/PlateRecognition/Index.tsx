import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockVehicles, riskColors } from '../../mock/vehicles';
import { mockScans as FALLBACK_SCANS, readers as FALLBACK_READERS, statusColors, statusIcons, allReaders, allPersons, allOrgs, allPlates, keyboardShortcuts } from '../../mock/plateRecognition';
import type { ScanStatus, ViewTab } from '../../mock/plateRecognition';

function getCsrf(): string { return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''); }
async function apiCall(url: string, method = 'GET', body?: any): Promise<any> {
    try {
        const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        return { ok: res.ok, status: res.status, data: await res.json() };
    } catch { return { ok: false, status: 0, data: {} }; }
}

/* ═══ ARGUX — Plate Recognition ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="lpr-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }
function SkeletonRows({ count = 8 }: { count?: number }) { return <>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: '12px 18px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'center' }}><Skel w={90} h={18} /><div style={{ flex: 1 }}><Skel w="50%" h={12} /><div style={{ height: 5 }} /><Skel w="30%" h={10} /></div><Skel w={60} h={12} /><Skel w={40} h={12} /></div>)}</>; }

function PlateRecognitionIndex() {
    const [tab, setTab] = useState<ViewTab>('scans');
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState<ScanStatus | 'all'>('all');
    const [readerF, setReaderF] = useState('all');
    const [personF, setPersonF] = useState<number | 'all'>('all');
    const [plateF, setPlateF] = useState('all');
    const [selScan, setSelScan] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    // Data state — API-driven with fallback
    const [mockScans, setMockScans] = useState(FALLBACK_SCANS);
    const [readers] = useState(FALLBACK_READERS);

    useEffect(() => {
        const load = async () => {
            trigger();
            const { ok, data } = await apiCall('/mock-api/plate-recognition/scans');
            if (ok && data.data) setMockScans(data.data);
            setLoading(false);
        };
        load();
    }, []);

    const scan = selScan ? mockScans.find(s => s.id === selScan) : null;

    const filtered = useMemo(() => mockScans.filter(s => {
        if (statusF !== 'all' && s.status !== statusF) return false;
        if (readerF !== 'all' && s.readerName !== readerF) return false;
        if (personF !== 'all' && s.personId !== personF) return false;
        if (plateF !== 'all' && s.plate !== plateF) return false;
        if (search && !s.plate.toLowerCase().includes(search.toLowerCase()) && !s.personName.toLowerCase().includes(search.toLowerCase()) && !s.readerLocation.toLowerCase().includes(search.toLowerCase()) && !s.vehicleMake.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [statusF, readerF, personF, plateF, search]);

    const stats = { total: mockScans.length, watchlist: mockScans.filter(s => s.watchlistMatch).length, matched: mockScans.filter(s => s.status === 'Matched').length, unknown: mockScans.filter(s => s.status === 'Unknown').length, readersOnline: readers.filter(r => r.status === 'Online').length };

    const watchlistPlates = [...new Set(mockScans.filter(s => s.watchlistMatch).map(s => s.plate))];
    const watchlistDetails = watchlistPlates.map(p => { const scans = mockScans.filter(s => s.plate === p); const v = mockVehicles.find(vv => vv.plate === p); return { plate: p, scans: scans.length, lastSeen: scans[0]?.timestamp || '', personName: scans[0]?.personName || '', vehicleDesc: v ? `${v.make} ${v.model} · ${v.color}` : '—', risk: (v?.risk || 'No Risk') as keyof typeof riskColors }; });

    const switchTab = useCallback((t: ViewTab) => { setTab(t); trigger(); }, [trigger]);
    const resetFilters = useCallback(() => { setSearch(''); setStatusF('all'); setReaderF('all'); setPersonF('all'); setPlateF('all'); trigger(); }, [trigger]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case '1': switchTab('scans'); break; case '2': switchTab('watchlist'); break; case '3': switchTab('readers'); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 'Escape': setSelScan(null); setShowShortcuts(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [switchTab, resetFilters]);

    return (<>
        <PageMeta title="Plate Recognition" />
        <div className="lpr-page" data-testid="plate-recognition-page">

            {/* LEFT */}
            <div className="lpr-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#10b98110', border: '1px solid #10b98125', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🚗</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>LPR</div><div style={{ fontSize: 10, color: theme.textDim }}>Plate Recognition</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plates..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="lpr-kbd">F</span>
                    </div>
                </div>

                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ n: stats.total, l: 'Total', c: theme.accent }, { n: stats.watchlist, l: 'Watch', c: '#ef4444' }, { n: stats.unknown, l: 'Unkn', c: '#6b7280' }, { n: stats.readersOnline, l: 'Rdrs', c: '#22c55e' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}><div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Scan Status</div>
                    {(['all', 'Watchlist Hit', 'Matched', 'Unknown', 'Partial Read'] as const).map(s => { const c = s === 'all' ? mockScans.length : mockScans.filter(sc => sc.status === s).length; return <button key={s} onClick={() => { setStatusF(s as any); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: statusF === s ? `${s === 'all' ? theme.accent : statusColors[s as ScanStatus]}08` : 'transparent', color: statusF === s ? (s === 'all' ? theme.accent : statusColors[s as ScanStatus]) : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, borderLeft: `2px solid ${statusF === s ? (s === 'all' ? theme.accent : statusColors[s as ScanStatus]) : 'transparent'}`, textAlign: 'left' as const, fontWeight: statusF === s ? 600 : 400, marginBottom: 1 }}>{s === 'all' ? '📋' : statusIcons[s as ScanStatus]} <span style={{ flex: 1 }}>{s === 'all' ? 'All Scans' : s}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Reader</div><select value={readerF} onChange={e => { setReaderF(e.target.value); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Readers ({readers.length})</option>{allReaders.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Person</div><select value={personF === 'all' ? 'all' : String(personF)} onChange={e => { setPersonF(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Persons</option>{allPersons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Plate</div><select value={plateF} onChange={e => { setPlateF(e.target.value); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Plates</option>{allPlates.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                </div>

                <div style={{ padding: '10px 14px' }}>
                    <button onClick={resetFilters} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset <span className="lpr-kbd" style={{ marginLeft: 4 }}>R</span></button>
                </div>
            </div>

            {/* CENTER */}
            <div className="lpr-center">
                <div className="lpr-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <select value={statusF} onChange={e => { setStatusF(e.target.value as any); trigger(); }} style={{ padding: '7px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}><option value="all">All</option>{(['Watchlist Hit','Matched','Unknown'] as const).map(s => <option key={s} value={s}>{s.split(' ')[0]}</option>)}</select>
                </div>

                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
                    {[{ id: 'scans' as ViewTab, l: 'All Scans', icon: '📋', n: filtered.length }, { id: 'watchlist' as ViewTab, l: 'Watchlist', icon: '🚨', n: watchlistPlates.length }, { id: 'readers' as ViewTab, l: 'Readers', icon: '📡', n: readers.length }].map((t, idx) => <button key={t.id} onClick={() => switchTab(t.id)} style={{ padding: '10px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#10b981' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' as const }}>
                        <span>{t.icon}</span><span className="lpr-tab-label">{t.l}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: `${tab === t.id ? '#10b981' : theme.border}20`, color: tab === t.id ? '#10b981' : theme.textDim }}>{t.n}</span>
                        <span className="lpr-kbd" style={{ marginLeft: 2 }}>{idx + 1}</span>
                    </button>)}
                </div>

                <div className="lpr-scroll">
                    {loading && <SkeletonRows count={10} />}

                    {!loading && tab === 'scans' && <>
                        <div className="lpr-table-head" style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', background: theme.bg, gap: 6, alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 1 }}>
                            <span>Plate</span><span>Reader / Location</span><span>Vehicle</span><span>Status</span><span>Conf</span><span>Speed</span><span style={{ textAlign: 'right' as const }}>Time</span>
                        </div>
                        {filtered.length === 0 && <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.2 }}>🚗</div><div style={{ fontSize: 15, fontWeight: 700, color: theme.textSecondary, marginTop: 6 }}>No scans match</div><button onClick={resetFilters} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button></div>}
                        {filtered.map(s => { const sc = statusColors[s.status]; const sel = selScan === s.id;
                            return <div key={s.id} className="lpr-table-row lpr-row" onClick={() => setSelScan(s.id)} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', gap: 6, background: sel ? `${sc}04` : 'transparent', borderLeft: `3px solid ${sel ? sc : 'transparent'}` }}>
                                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 800, color: s.watchlistMatch ? '#ef4444' : theme.text, letterSpacing: '0.04em' }}>{s.plate}</div>
                                <div><div style={{ fontSize: 11, fontWeight: 600, color: theme.text }}>{s.readerName}</div><div style={{ fontSize: 9, color: theme.textDim }}>{s.readerLocation}</div></div>
                                <div>{s.vehicleId ? <><div style={{ fontSize: 10, color: theme.text }}>{s.vehicleMake} {s.vehicleModel}</div><div style={{ fontSize: 9, color: theme.textDim }}>{s.personName && <a href={`/persons/${s.personId}`} onClick={e => e.stopPropagation()} style={{ color: theme.accent, textDecoration: 'none' }}>🧑 {s.personName}</a>}</div></> : <span style={{ fontSize: 10, color: theme.textDim }}>—</span>}</div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: sc }}>{statusIcons[s.status]} {s.status.split(' ')[0]}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 24, height: 4, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${s.plateConfidence}%`, height: '100%', background: s.plateConfidence > 90 ? '#22c55e' : s.plateConfidence > 70 ? '#f59e0b' : '#ef4444' }} /></div><span style={{ fontSize: 9, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{s.plateConfidence}%</span></div>
                                <span style={{ fontSize: 10, color: s.speed && s.speed > 100 ? '#ef4444' : theme.textDim, fontFamily: "'JetBrains Mono',monospace", fontWeight: s.speed && s.speed > 100 ? 700 : 400 }}>{s.speed ? `${s.speed}` : '—'}</span>
                                <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 10, color: theme.textDim }}>{s.timeAgo}</div><div style={{ fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{s.timestamp.slice(11)}</div></div>
                            </div>;
                        })}
                    </>}

                    {!loading && tab === 'watchlist' && <div style={{ padding: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>🚨 Watchlist ({watchlistPlates.length} plates)</div>
                        <div className="lpr-watchlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                            {watchlistDetails.map(w => <div key={w.plate} onClick={() => { switchTab('scans'); setPlateF(w.plate); }} style={{ padding: 14, borderRadius: 10, border: `1px solid ${riskColors[w.risk]}20`, background: `${riskColors[w.risk]}03`, cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 17, fontWeight: 900, color: '#ef4444', letterSpacing: '0.06em', padding: '5px 12px', borderRadius: 5, background: '#ef444408', border: '1px solid #ef444420' }}>{w.plate}</div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: riskColors[w.risk], padding: '3px 8px', borderRadius: 4, background: `${riskColors[w.risk]}12` }}>{w.risk}</span>
                                </div>
                                <div style={{ fontSize: 11, color: theme.text, marginBottom: 3 }}>{w.vehicleDesc}</div>
                                {w.personName && <a href={`/persons/${mockScans.find(s => s.plate === w.plate)?.personId}`} style={{ fontSize: 11, color: theme.accent, textDecoration: 'none' }}>🧑 {w.personName}</a>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: theme.textDim }}><span>{w.scans} captures</span><span>Last: {w.lastSeen.slice(5, 16)}</span></div>
                            </div>)}
                        </div>
                    </div>}

                    {!loading && tab === 'readers' && <div style={{ padding: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>📡 LPR Readers ({readers.length})</div>
                        <div className="lpr-reader-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                            {readers.map(r => { const rc = r.status === 'Online' ? '#22c55e' : r.status === 'Offline' ? '#ef4444' : '#f59e0b'; return <div key={r.id} onClick={() => { switchTab('scans'); setReaderF(r.name); }} style={{ padding: 14, borderRadius: 10, border: `1px solid ${rc}20`, background: `${rc}03`, cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: rc, boxShadow: r.status === 'Online' ? `0 0 6px ${rc}` : 'none' }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{r.name}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: rc }}>{r.status}</span>
                                </div>
                                <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 6 }}>📍 {r.location}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                    <span style={{ color: theme.textDim }}>{r.cameraId ? <a href={`/devices/${r.cameraId}`} style={{ color: theme.accent, textDecoration: 'none' }}>📹 Camera #{r.cameraId}</a> : 'Standalone'}</span>
                                    <span style={{ color: theme.text, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{r.captureCount.toLocaleString()}</span>
                                </div>
                            </div>; })}
                        </div>
                    </div>}
                </div>
            </div>

            {/* RIGHT: Detail */}
            {scan && <div className="lpr-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 900, color: scan.watchlistMatch ? '#ef4444' : theme.text, letterSpacing: '0.06em', padding: '6px 14px', borderRadius: 6, background: scan.watchlistMatch ? '#ef444408' : `${theme.border}10`, border: `1px solid ${scan.watchlistMatch ? '#ef444425' : theme.border}` }}>{scan.plate}</div>
                        <button onClick={() => setSelScan(null)} style={{ marginLeft: 'auto', width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${statusColors[scan.status]}12`, color: statusColors[scan.status] }}>{statusIcons[scan.status]} {scan.status}</span>
                        {scan.operationCode && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${theme.accent}10`, color: theme.accent }}>{scan.operationCode}</span>}
                    </div>
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ width: '100%', height: 80, borderRadius: 8, background: '#0a0e16', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '0.08em', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{scan.plate}</div>
                        <div style={{ position: 'absolute' as const, bottom: 5, right: 8, fontSize: 9, color: '#ffffff80', fontFamily: "'JetBrains Mono',monospace" }}>{scan.plateConfidence}% · {scan.cameraName}</div>
                    </div>
                </div>

                {scan.vehicleId && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' as const, marginBottom: 5 }}>🚗 Vehicle</div>
                    {[{ l: 'Make/Model', v: `${scan.vehicleMake} ${scan.vehicleModel}` }, { l: 'Color', v: scan.vehicleColor }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ fontSize: 10, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 10, color: theme.text, fontWeight: 600 }}>{r.v}</span></div>)}
                </div>}

                {scan.personId && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#ec4899', textTransform: 'uppercase' as const, marginBottom: 5 }}>🧑 Owner</div>
                    <a href={`/persons/${scan.personId}`} style={{ fontSize: 12, color: theme.accent, textDecoration: 'none', fontWeight: 700 }}>{scan.personName}</a>
                    {scan.orgName && <div style={{ marginTop: 3 }}><a href={`/organizations/${scan.orgId}`} style={{ fontSize: 11, color: '#8b5cf6', textDecoration: 'none' }}>🏢 {scan.orgName}</a></div>}
                </div>}

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 3 }}>📡 Capture</div>
                    {[{ l: 'Reader', v: scan.readerName }, { l: 'Location', v: scan.readerLocation }, { l: 'Camera', v: scan.cameraName }, { l: 'Direction', v: scan.direction }, { l: 'Speed', v: scan.speed ? `${scan.speed} km/h` : '—' }, { l: 'Lane', v: scan.lane }, { l: 'Confidence', v: `${scan.plateConfidence}%` }, { l: 'Timestamp', v: scan.timestamp }, { l: 'Coords', v: `${scan.lat.toFixed(4)}, ${scan.lng.toFixed(4)}` }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 10, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 10, color: theme.text }}>{r.v}</span></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>{scan.tags.map(t => <span key={t} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: t === 'watchlist' ? '#ef444412' : `${theme.border}20`, color: t === 'watchlist' ? '#ef4444' : theme.textSecondary }}>{t}</span>)}</div>
                </div>

                <div style={{ padding: '10px 14px', display: 'flex', gap: 4, marginTop: 'auto' }}>
                    <a href="/map" style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, textDecoration: 'none', fontSize: 11, fontWeight: 700, textAlign: 'center' as const }}>🗺️ Map</a>
                    <a href="/alerts" style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 11, textAlign: 'center' as const }}>🚨 Alert</a>
                </div>
            </div>}

            {/* Ctrl+Q */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="lpr-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

PlateRecognitionIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default PlateRecognitionIndex;
