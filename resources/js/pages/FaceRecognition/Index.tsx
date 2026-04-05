import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockPersons, riskColors } from '../../mock/persons';
import { mockCaptures as FALLBACK_CAPTURES, cameras, statusColors, statusIcons, allCameras, allMatchedPersons, allOps, keyboardShortcuts } from '../../mock/faceRecognition';
import type { MatchStatus, ViewTab } from '../../mock/faceRecognition';

function getCsrf(): string { return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''); }
async function apiCall(url: string, method = 'GET', body?: any): Promise<any> {
    try {
        const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        return { ok: res.ok, status: res.status, data: await res.json() };
    } catch { return { ok: false, status: 0, data: {} }; }
}

/* ═══ ARGUX — Face Recognition ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="fr-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }
function SkeletonGrid({ count = 8 }: { count?: number }) { return <div className="fr-capture-grid" style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ borderRadius: 10, border: `1px solid ${theme.border}`, overflow: 'hidden' }}><Skel w="100%" h={110} /><div style={{ padding: '10px 12px' }}><Skel w="60%" h={14} /><div style={{ height: 6 }} /><Skel w="80%" h={10} /></div></div>)}</div>; }

function FaceRecognitionIndex() {
    const [tab, setTab] = useState<ViewTab>('captures');
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState<MatchStatus | 'all'>('all');
    const [cameraF, setCameraF] = useState('all');
    const [personF, setPersonF] = useState<number | 'all'>('all');
    const [opF, setOpF] = useState('all');
    const [minConf, setMinConf] = useState(0);
    const [selCapture, setSelCapture] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    // Data state — API-driven with fallback
    const [mockCaptures, setMockCaptures] = useState(FALLBACK_CAPTURES);

    // Search mode
    const [searchPerson, setSearchPerson] = useState<number | null>(null);
    const [searchDragOver, setSearchDragOver] = useState(false);
    const [searchRunning, setSearchRunning] = useState(false);
    const [searchDone, setSearchDone] = useState(false);

    useEffect(() => {
        const load = async () => {
            trigger();
            const { ok, data } = await apiCall('/mock-api/face-recognition');
            if (ok && data.data) setMockCaptures(data.data);
            setLoading(false);
        };
        load();
    }, []);

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

    const stats = { total: mockCaptures.length, confirmed: mockCaptures.filter(c => c.status === 'Confirmed Match').length, possible: mockCaptures.filter(c => c.status === 'Possible Match').length, pending: mockCaptures.filter(c => c.status === 'Pending Review').length, uniquePersons: new Set(mockCaptures.filter(c => c.personId).map(c => c.personId)).size, avgConf: Math.round(mockCaptures.filter(c => c.confidence > 0).reduce((s, c) => s + c.confidence, 0) / mockCaptures.filter(c => c.confidence > 0).length) };

    const runSearch = () => { setSearchRunning(true); setSearchDone(false); setTimeout(() => { setSearchRunning(false); setSearchDone(true); }, 2500); };
    const searchResults = searchDone && searchPerson ? mockCaptures.filter(c => c.personId === searchPerson) : [];

    const switchTab = useCallback((t: ViewTab) => { setTab(t); trigger(); }, [trigger]);
    const resetFilters = useCallback(() => { setSearch(''); setStatusF('all'); setCameraF('all'); setPersonF('all'); setOpF('all'); setMinConf(0); trigger(); }, [trigger]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case '1': switchTab('captures'); break; case '2': switchTab('search'); break; case '3': switchTab('stats'); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 'Escape': setSelCapture(null); setShowShortcuts(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [switchTab, resetFilters]);

    return (<>
        <PageMeta title="Face Recognition" />
        <div className="fr-page" data-testid="face-recognition-page">

            {/* LEFT */}
            <div className="fr-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ec489910', border: '1px solid #ec489925', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🧑</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>FACE ID</div><div style={{ fontSize: 10, color: theme.textDim }}>InsightFace / ArcFace</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search captures..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="fr-kbd">F</span>
                    </div>
                </div>

                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ n: stats.total, l: 'Total', c: theme.accent }, { n: stats.confirmed, l: 'Match', c: '#22c55e' }, { n: stats.pending, l: 'Pend', c: '#8b5cf6' }, { n: `${stats.avgConf}%`, l: 'Avg', c: '#f59e0b' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}><div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Match Status</div>
                    {(['all', 'Confirmed Match', 'Possible Match', 'No Match', 'Pending Review'] as const).map(s => { const c = s === 'all' ? mockCaptures.length : mockCaptures.filter(cc => cc.status === s).length; return <button key={s} onClick={() => { setStatusF(s as any); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: statusF === s ? `${s === 'all' ? theme.accent : statusColors[s as MatchStatus]}08` : 'transparent', color: statusF === s ? (s === 'all' ? theme.accent : statusColors[s as MatchStatus]) : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, borderLeft: `2px solid ${statusF === s ? (s === 'all' ? theme.accent : statusColors[s as MatchStatus]) : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1, fontWeight: statusF === s ? 600 : 400 }}>{s === 'all' ? '📋' : statusIcons[s as MatchStatus]} <span style={{ flex: 1 }}>{s === 'all' ? 'All' : s.split(' ')[0]}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Camera</div><select value={cameraF} onChange={e => { setCameraF(e.target.value); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Cameras</option>{allCameras.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Person</div><select value={personF === 'all' ? 'all' : String(personF)} onChange={e => { setPersonF(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Persons</option>{allMatchedPersons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Operation</div><select value={opF} onChange={e => { setOpF(e.target.value); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Operations</option>{allOps.map(o => <option key={o} value={o}>OP {o}</option>)}</select></div>
                    <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ fontSize: 10, fontWeight: 700, color: theme.textDim }}>Min Confidence</span><span style={{ fontSize: 10, color: theme.accent, fontFamily: "'JetBrains Mono',monospace" }}>{minConf}%</span></div><input type="range" min={0} max={95} step={5} value={minConf} onChange={e => setMinConf(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#ec4899' }} /></div>
                </div>

                <div style={{ padding: '10px 14px' }}>
                    <button onClick={resetFilters} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset Filters <span className="fr-kbd" style={{ marginLeft: 4 }}>R</span></button>
                </div>
            </div>

            {/* CENTER */}
            <div className="fr-center">
                <div className="fr-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <select value={statusF} onChange={e => { setStatusF(e.target.value as any); trigger(); }} style={{ padding: '7px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}>
                        <option value="all">All Status</option>{(['Confirmed Match','Possible Match','No Match','Pending Review'] as const).map(s => <option key={s} value={s}>{s.split(' ')[0]}</option>)}
                    </select>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
                    {[{ id: 'captures' as ViewTab, l: 'All Captures', icon: '📋', n: filtered.length }, { id: 'search' as ViewTab, l: 'Face Search', icon: '🔍' }, { id: 'stats' as ViewTab, l: 'Statistics', icon: '📊' }].map((t, idx) => <button key={t.id} onClick={() => switchTab(t.id)} style={{ padding: '10px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#ec4899' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' as const }}>
                        <span>{t.icon}</span><span className="fr-tab-label">{t.l}</span>
                        {t.n !== undefined && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: `${tab === t.id ? '#ec4899' : theme.border}20`, color: tab === t.id ? '#ec4899' : theme.textDim }}>{t.n}</span>}
                        <span className="fr-kbd" style={{ marginLeft: 2 }}>{idx + 1}</span>
                    </button>)}
                </div>

                <div className="fr-scroll">
                    {loading && <SkeletonGrid count={8} />}

                    {/* CAPTURES GRID */}
                    {!loading && tab === 'captures' && <div className="fr-capture-grid" style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
                        {filtered.length === 0 && <div style={{ gridColumn: '1/-1', padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.2 }}>🧑</div><div style={{ fontSize: 15, fontWeight: 700, color: theme.textSecondary, marginTop: 6 }}>No captures match</div><button onClick={resetFilters} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button></div>}
                        {filtered.map(c => { const sc = statusColors[c.status]; const sel = selCapture === c.id;
                            return <div key={c.id} onClick={() => setSelCapture(c.id)} style={{ borderRadius: 10, border: `1px solid ${sel ? sc + '40' : theme.border}`, background: sel ? `${sc}04` : theme.bgCard, cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.15s' }}>
                                <div style={{ height: 110, background: '#0a0e16', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
                                    {c.personAvatar ? <img src={c.personAvatar} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${sc}60` }} /> : <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${theme.border}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: `2px solid ${sc}40` }}>❓</div>}
                                    {c.confidence > 0 && <div style={{ position: 'absolute' as const, top: 8, right: 8, padding: '3px 8px', borderRadius: 4, background: c.confidence > 85 ? '#22c55e' : c.confidence > 70 ? '#f59e0b' : '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>{c.confidence}%</div>}
                                    <div style={{ position: 'absolute' as const, bottom: 8, left: 8, padding: '3px 7px', borderRadius: 4, background: 'rgba(0,0,0,0.7)', color: sc, fontSize: 9, fontWeight: 700 }}>{statusIcons[c.status]} {c.status.split(' ')[0]}</div>
                                    <div style={{ position: 'absolute' as const, bottom: 8, right: 8, fontSize: 8, color: '#ffffff60', fontFamily: "'JetBrains Mono',monospace" }}>{c.cameraName.slice(0, 20)}</div>
                                </div>
                                <div style={{ padding: '10px 12px' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: c.personId ? theme.text : theme.textDim, marginBottom: 3 }}>{c.personName || 'Unknown Person'}</div>
                                    <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 6 }}>{c.location.length > 32 ? c.location.slice(0, 32) + '…' : c.location}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: 3 }}>
                                            {c.disguise !== 'None' && <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 3, background: '#f59e0b12', color: '#f59e0b' }}>🎭</span>}
                                            {c.operationCode && <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 3, background: `${theme.accent}10`, color: theme.accent }}>{c.operationCode}</span>}
                                        </div>
                                        <span style={{ fontSize: 10, color: theme.textDim }}>{c.timeAgo}</span>
                                    </div>
                                </div>
                            </div>;
                        })}
                    </div>}

                    {/* FACE SEARCH */}
                    {!loading && tab === 'search' && <div style={{ padding: 18, maxWidth: 660 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 6 }}>🔍 Face Search — Database Lookup</div>
                        <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 18 }}>Upload a photo or select a known person to search all camera captures using InsightFace/ArcFace (ONNX, GPU).</div>

                        <div onDragOver={e => { e.preventDefault(); setSearchDragOver(true); }} onDragLeave={() => setSearchDragOver(false)} onDrop={e => { e.preventDefault(); setSearchDragOver(false); }} style={{ padding: 28, borderRadius: 10, border: `2px dashed ${searchDragOver ? '#ec4899' : theme.border}`, background: searchDragOver ? '#ec489906' : 'transparent', textAlign: 'center' as const, marginBottom: 14 }}>
                            <div style={{ fontSize: 32, marginBottom: 6 }}>📤</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>Drop a face photo here</div>
                            <div style={{ fontSize: 11, color: theme.textDim, marginTop: 3 }}>JPEG, PNG · Min 100×100px · Frontal view recommended</div>
                            <button style={{ marginTop: 10, padding: '7px 18px', borderRadius: 6, border: '1px solid #ec489930', background: '#ec489906', color: '#ec4899', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Browse Files</button>
                        </div>

                        <div style={{ textAlign: 'center' as const, fontSize: 11, color: theme.textDim, margin: '10px 0' }}>— OR —</div>

                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Select Known Person</div>
                            <select value={searchPerson ?? ''} onChange={e => { setSearchPerson(e.target.value ? parseInt(e.target.value) : null); setSearchDone(false); }} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${searchPerson ? '#ec489940' : theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
                                <option value="">— Select person —</option>
                                {mockPersons.slice(0, 15).map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.risk})</option>)}
                            </select>
                        </div>

                        {searchPerson && (() => { const p = mockPersons.find(pp => pp.id === searchPerson); if (!p) return null; return <div style={{ padding: 14, borderRadius: 8, border: '1px solid #ec489920', background: '#ec489904', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                            <img src={p.avatar || undefined} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ec489940' }} />
                            <div><div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{p.firstName} {p.lastName}</div><div style={{ fontSize: 11, color: theme.textDim }}>{p.nationality} · <span style={{ color: riskColors[p.risk], fontWeight: 600 }}>{p.risk}</span></div></div>
                        </div>; })()}

                        <button onClick={runSearch} disabled={!searchPerson || searchRunning} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: searchPerson && !searchRunning ? '#ec4899' : `${theme.border}30`, color: searchPerson && !searchRunning ? '#fff' : theme.textDim, fontSize: 14, fontWeight: 800, cursor: searchPerson ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>{searchRunning ? '⏳ Searching camera database...' : '🔍 Search All Cameras'}</button>

                        {searchRunning && <div style={{ marginTop: 14, padding: 14, borderRadius: 8, border: '1px solid #ec489920', background: '#ec489904' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, color: theme.text }}><span>Scanning archives...</span><span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#ec4899' }}>11 cameras</span></div>
                            <div style={{ height: 5, borderRadius: 3, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: '65%', height: '100%', background: '#ec4899', borderRadius: 3 }} /></div>
                            <div style={{ fontSize: 9, color: theme.textDim, marginTop: 5 }}>InsightFace · ONNX Runtime · GPU: NVIDIA A100</div>
                        </div>}

                        {searchDone && <div style={{ marginTop: 14 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>✅ {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''} found</div>
                            {searchResults.length === 0 && <div style={{ padding: 24, textAlign: 'center' as const, color: theme.textDim, fontSize: 12, borderRadius: 8, border: `1px solid ${theme.border}` }}>No matches in camera archives.</div>}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
                                {searchResults.map(c => <div key={c.id} onClick={() => { switchTab('captures'); setSelCapture(c.id); }} style={{ padding: 12, borderRadius: 8, border: `1px solid ${statusColors[c.status]}20`, background: `${statusColors[c.status]}04`, cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0a0e16', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${c.confidence > 85 ? '#22c55e' : '#f59e0b'}40` }}>{c.personAvatar ? <img src={c.personAvatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} /> : <span>❓</span>}</div>
                                        <div><div style={{ fontSize: 14, fontWeight: 800, color: c.confidence > 85 ? '#22c55e' : '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{c.confidence}%</div><div style={{ fontSize: 9, color: theme.textDim }}>{c.status}</div></div>
                                    </div>
                                    <div style={{ fontSize: 11, color: theme.text }}>{c.cameraName}</div>
                                    <div style={{ fontSize: 10, color: theme.textDim }}>{c.location.slice(0, 32)}</div>
                                    <div style={{ fontSize: 9, color: theme.textDim, marginTop: 3 }}>{c.timestamp.slice(5)} · {c.disguise !== 'None' ? `🎭 ${c.disguise}` : 'No disguise'}</div>
                                </div>)}
                            </div>
                        </div>}
                    </div>}

                    {/* STATISTICS */}
                    {!loading && tab === 'stats' && <div style={{ padding: 18, display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
                        <div><div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Captures by Person</div>
                        <div style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            {allMatchedPersons.map(p => { const caps = mockCaptures.filter(c => c.personId === p.id); const avgC = Math.round(caps.reduce((s, c) => s + c.confidence, 0) / caps.length);
                                return <div key={p.id} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <img src={caps[0]?.personAvatar || undefined} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${riskColors[caps[0]?.personRisk || 'No Risk']}40` }} />
                                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{p.name}</div><div style={{ fontSize: 10, color: theme.textDim }}>{caps.length} captures · Avg: {avgC}%</div></div>
                                    <div style={{ display: 'flex', gap: 3 }}>{caps.slice(0, 5).map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c.confidence > 85 ? '#22c55e' : c.confidence > 70 ? '#f59e0b' : '#ef4444' }} />)}</div>
                                    <a href={`/persons/${p.id}`} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 4, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>Profile</a>
                                </div>;
                            })}
                        </div></div>

                        <div><div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Captures by Camera</div>
                        <div className="fr-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                            {cameras.slice(0, 8).map(cam => { const caps = mockCaptures.filter(c => c.cameraId === cam.id);
                                return <div key={cam.id} style={{ padding: 12, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bgCard }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 3 }}>{cam.name}</div>
                                    <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 6 }}>{cam.location}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 18, fontWeight: 800, color: caps.length > 0 ? '#ec4899' : theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{caps.length}</span>
                                        <a href={`/devices/${cam.id}`} style={{ fontSize: 10, color: theme.accent, textDecoration: 'none' }}>📹 Device</a>
                                    </div>
                                </div>;
                            })}
                        </div></div>
                    </div>}
                </div>
            </div>

            {/* RIGHT: Detail */}
            {capture && tab === 'captures' && <div className="fr-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {capture.personAvatar ? <img src={capture.personAvatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${statusColors[capture.status]}60` }} /> : <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${theme.border}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>❓</div>}
                        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{capture.personName || 'Unknown'}</div><div style={{ fontSize: 10, color: statusColors[capture.status], fontWeight: 600 }}>{statusIcons[capture.status]} {capture.status}</div></div>
                        <button onClick={() => setSelCapture(null)} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                </div>

                {capture.confidence > 0 && <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(${capture.confidence > 85 ? '#22c55e' : capture.confidence > 70 ? '#f59e0b' : '#ef4444'} ${capture.confidence * 3.6}deg, ${theme.border}20 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 46, height: 46, borderRadius: '50%', background: theme.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: capture.confidence > 85 ? '#22c55e' : capture.confidence > 70 ? '#f59e0b' : '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>{capture.confidence}%</div></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim }}>CONFIDENCE</div><div style={{ fontSize: 10, color: theme.textDim }}>Quality: {capture.quality}%</div></div>
                </div>}

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                    {[{ l: 'Camera', v: capture.cameraName }, { l: 'Location', v: capture.location }, { l: 'Disguise', v: capture.disguise }, { l: 'Companions', v: capture.companions }, { l: 'Timestamp', v: capture.timestamp }, { l: 'Quality', v: `${capture.quality}%` }, { l: 'Coordinates', v: `${capture.lat.toFixed(4)}, ${capture.lng.toFixed(4)}` }, ...(capture.operationCode ? [{ l: 'Operation', v: `OP ${capture.operationCode}` }] : [])].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 10, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 10, color: r.l === 'Disguise' && r.v !== 'None' ? '#f59e0b' : theme.text, fontWeight: r.l === 'Disguise' && r.v !== 'None' ? 700 : 400 }}>{r.v}</span></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>{capture.tags.map(t => <span key={t} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: t === 'HAWK' || t === 'GLACIER' ? `${theme.accent}10` : t.includes('disguise') ? '#f59e0b10' : `${theme.border}20`, color: t === 'HAWK' || t === 'GLACIER' ? theme.accent : t.includes('disguise') ? '#f59e0b' : theme.textSecondary }}>{t}</span>)}</div>
                </div>

                <div style={{ padding: '10px 14px', display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginTop: 'auto' }}>
                    {capture.personId && <a href={`/persons/${capture.personId}`} style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, textDecoration: 'none', fontSize: 11, fontWeight: 700, textAlign: 'center' as const }}>🧑 Profile</a>}
                    {capture.cameraId && <a href={`/devices/${capture.cameraId}`} style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 11, textAlign: 'center' as const }}>📹 Camera</a>}
                    <a href="/map" style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 11, textAlign: 'center' as const }}>🗺️ Map</a>
                </div>
            </div>}

            {/* Ctrl+Q */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div>
                        <button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="fr-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

FaceRecognitionIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default FaceRecognitionIndex;
