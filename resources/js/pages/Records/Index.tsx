import PageMeta from '../../components/layout/PageMeta';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockRecords as FALLBACK_RECORDS, typeConfig, statusConfig, priorityConfig, languages, keyboardShortcuts } from '../../mock/records';
import type { RecordType, RecordStatus, Priority, AIRecord } from '../../mock/records';

function getCsrf(): string { return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''); }
async function apiCall(url: string, method = 'GET', body?: any): Promise<any> {
    try {
        const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        return { ok: res.ok, status: res.status, data: await res.json() };
    } catch { return { ok: false, status: 0, data: { message: 'Network error.' } }; }
}

/* ═══ ARGUX — Records · AI Processing Center ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="rec-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }
function SkeletonRows({ count = 8 }: { count?: number }) { return <>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'center' }}><Skel w={30} h={30} /><div style={{ flex: 1 }}><Skel w="55%" h={13} /><div style={{ height: 5 }} /><Skel w="35%" h={10} /></div><Skel w={70} h={14} /><Skel w={55} h={14} /></div>)}</>; }

type Tab = 'all' | 'processing' | 'completed' | 'failed';

export default function RecordsIndex() {
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<Tab>('all');
    const [typeF, setTypeF] = useState<RecordType | 'all'>('all');
    const [prioF, setPrioF] = useState<Priority | 'all'>('all');
    const [selRec, setSelRec] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [sortCol, setSortCol] = useState<'createdAt' | 'title' | 'type' | 'status' | 'priority'>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    // Data state — API-driven with fallback to static mock
    const [mockRecords, setMockRecords] = useState(FALLBACK_RECORDS);

    useEffect(() => {
        const load = async () => {
            trigger();
            const { ok, data } = await apiCall('/mock-api/records');
            if (ok && data.data) setMockRecords(data.data);
            setLoading(false);
        };
        load();
    }, []);

    const rec = selRec ? mockRecords.find(r => r.id === selRec) : null;

    const filtered = useMemo(() => {
        let recs = mockRecords as AIRecord[];
        if (tab === 'processing') recs = recs.filter(r => r.status === 'processing' || r.status === 'queued');
        else if (tab === 'completed') recs = recs.filter(r => r.status === 'completed');
        else if (tab === 'failed') recs = recs.filter(r => r.status === 'failed');
        if (typeF !== 'all') recs = recs.filter(r => r.type === typeF);
        if (prioF !== 'all') recs = recs.filter(r => r.priority === prioF);
        if (search) recs = recs.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()) || r.entityName?.toLowerCase().includes(search.toLowerCase()) || r.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
        return [...recs].sort((a, b) => { const m = sortDir === 'asc' ? 1 : -1; const av = (a as any)[sortCol] || ''; const bv = (b as any)[sortCol] || ''; return typeof av === 'string' ? av.localeCompare(bv) * m : (av - bv) * m; });
    }, [tab, typeF, prioF, search, sortCol, sortDir]);

    const resetAll = useCallback(() => { setSearch(''); setTypeF('all'); setPrioF('all'); setTab('all'); trigger(); }, [trigger]);
    const toggleSort = (col: typeof sortCol) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('desc'); } };
    const SI = ({ col }: { col: typeof sortCol }) => sortCol === col ? <span style={{ fontSize: 9, marginLeft: 2 }}>{sortDir === 'asc' ? '▲' : '▼'}</span> : null;

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case '1': setTab('all'); trigger(); break;
                case '2': setTab('processing'); trigger(); break;
                case '3': setTab('completed'); trigger(); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetAll(); break;
                case 'Escape': setShowShortcuts(false); setSelRec(null); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [resetAll, trigger]);

    const tabCounts = useMemo(() => ({
        all: mockRecords.length,
        processing: mockRecords.filter(r => r.status === 'processing' || r.status === 'queued').length,
        completed: mockRecords.filter(r => r.status === 'completed').length,
        failed: mockRecords.filter(r => r.status === 'failed').length,
    }), []);

    const aiTypes: RecordType[] = ['video_transcription', 'audio_transcription', 'translation', 'file_summary', 'photo_ocr'];

    return (<>
        <PageMeta title="Records — AI Processing" />
        <div className="rec-page" data-testid="records-page">

            {/* LEFT SIDEBAR */}
            <div className="rec-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#8b5cf610', border: '1px solid #8b5cf625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🤖</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>RECORDS</div><div style={{ fontSize: 10, color: theme.textDim }}>AI Processing Center</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="rec-kbd">F</span>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}` }}>
                    {([['all', 'All', '📋'], ['processing', 'Processing', '⏳'], ['completed', 'Completed', '✅'], ['failed', 'Failed', '❌']] as [Tab, string, string][]).map(([t, label, icon]) => {
                        const on = tab === t; const cnt = tabCounts[t];
                        return <button key={t} onClick={() => { setTab(t); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', borderRadius: 6, border: 'none', background: on ? `${theme.accent}08` : 'transparent', color: on ? theme.accent : theme.textDim, cursor: 'pointer', fontSize: 12, fontWeight: on ? 700 : 500, fontFamily: 'inherit', textAlign: 'left' as const, borderLeft: `2px solid ${on ? theme.accent : 'transparent'}`, marginBottom: 2 }}><span style={{ fontSize: 13 }}>{icon}</span>{label}<span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: on ? theme.accent : theme.textDim }}>{cnt}</span></button>;
                    })}
                </div>

                {/* AI Type filter */}
                <div style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 6 }}>AI Process Type</div>
                    <button onClick={() => { setTypeF('all'); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 8px', borderRadius: 4, border: 'none', background: typeF === 'all' ? `${theme.accent}08` : 'transparent', color: typeF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontSize: 11, fontWeight: typeF === 'all' ? 700 : 500, fontFamily: 'inherit', marginBottom: 2 }}>All Types</button>
                    {aiTypes.map(t => { const tc = typeConfig[t]; const on = typeF === t; const cnt = mockRecords.filter(r => r.type === t).length;
                        return <button key={t} onClick={() => { setTypeF(t); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 8px', borderRadius: 4, border: 'none', background: on ? `${tc.color}08` : 'transparent', color: on ? tc.color : theme.textDim, cursor: 'pointer', fontSize: 11, fontWeight: on ? 700 : 500, fontFamily: 'inherit', marginBottom: 2 }}><span style={{ fontSize: 12 }}>{tc.icon}</span>{tc.label}<span style={{ marginLeft: 'auto', fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}>{cnt}</span></button>;
                    })}
                </div>

                {/* Priority filter */}
                <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 6 }}>Priority</div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        <button onClick={() => { setPrioF('all'); trigger(); }} style={{ padding: '4px 8px', borderRadius: 4, border: `1px solid ${prioF === 'all' ? theme.accent + '40' : theme.border}`, background: prioF === 'all' ? `${theme.accent}08` : 'transparent', color: prioF === 'all' ? theme.accent : theme.textDim, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
                        {(['critical', 'high', 'medium', 'low'] as Priority[]).map(p => { const pc = priorityConfig[p]; const on = prioF === p;
                            return <button key={p} onClick={() => { setPrioF(p); trigger(); }} style={{ padding: '4px 8px', borderRadius: 4, border: `1px solid ${on ? pc.color + '40' : theme.border}`, background: on ? `${pc.color}08` : 'transparent', color: on ? pc.color : theme.textDim, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' as const }}>{p}</button>;
                        })}
                    </div>
                </div>

                <div style={{ marginTop: 'auto', padding: '8px 12px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    <button onClick={resetAll} style={{ flex: 1, padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
                </div>
            </div>

            {/* CENTER: TABLE */}
            <div className="rec-center">
                {/* Mobile bar */}
                <div className="rec-mobile-bar">
                    <select value={tab} onChange={e => { setTab(e.target.value as Tab); trigger(); }} style={{ padding: '7px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}>{(['all', 'processing', 'completed', 'failed'] as Tab[]).map(t => <option key={t} value={t}>{t === 'all' ? `All (${tabCounts.all})` : `${t.charAt(0).toUpperCase() + t.slice(1)} (${tabCounts[t]})`}</option>)}</select>
                    <select value={typeF} onChange={e => { setTypeF(e.target.value as RecordType | 'all'); trigger(); }} style={{ flex: 1, padding: '7px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}><option value="all">All Types</option>{aiTypes.map(t => <option key={t} value={t}>{typeConfig[t].icon} {typeConfig[t].label}</option>)}</select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 120 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '7px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '30px 3fr 100px 80px 70px 80px 100px', padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', flexShrink: 0, background: theme.bg, gap: 8, cursor: 'pointer', userSelect: 'none' as const, alignItems: 'center' }}>
                    <span></span>
                    <span onClick={() => toggleSort('title')}>Title <SI col="title" /></span>
                    <span onClick={() => toggleSort('type')}>Type <SI col="type" /></span>
                    <span onClick={() => toggleSort('status')}>Status <SI col="status" /></span>
                    <span onClick={() => toggleSort('priority')}>Priority <SI col="priority" /></span>
                    <span>Entity</span>
                    <span onClick={() => toggleSort('createdAt')}>Date <SI col="createdAt" /></span>
                </div>

                {/* Rows */}
                <div className="rec-scroll">
                    {loading && <SkeletonRows count={10} />}

                    {!loading && filtered.length === 0 && <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.2 }}>🤖</div><div style={{ fontSize: 15, fontWeight: 700, color: theme.textSecondary, marginTop: 6 }}>No records match</div><div style={{ fontSize: 12, color: theme.textDim, marginTop: 4 }}>Adjust filters or search</div><button onClick={resetAll} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset filters</button></div>}

                    {!loading && filtered.map(r => { const tc = typeConfig[r.type]; const sc = statusConfig[r.status]; const pc = priorityConfig[r.priority]; const sel = selRec === r.id;
                        return <div key={r.id} className="rec-row" onClick={() => setSelRec(r.id)} style={{ display: 'grid', gridTemplateColumns: '30px 3fr 100px 80px 70px 80px 100px', padding: '10px 16px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', gap: 8, background: sel ? `${tc.color}04` : 'transparent', borderLeft: `3px solid ${sel ? tc.color : 'transparent'}` }}>
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: `${tc.color}12`, border: `1px solid ${tc.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{tc.icon}</div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.title}</div>
                                <div style={{ fontSize: 10, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.sourceFile} · {r.sourceSize}{r.sourceDuration ? ` · ${r.sourceDuration}` : ''}</div>
                            </div>
                            <span style={{ fontSize: 10, color: tc.color, fontWeight: 600 }}>{tc.label.replace(' Transcription', '').replace(' / Transcription', '')}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color, flexShrink: 0 }} />
                                <span style={{ fontSize: 10, color: sc.color, fontWeight: 600 }}>{sc.label}</span>
                                {r.status === 'processing' && r.progress !== undefined && <span style={{ fontSize: 9, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{r.progress}%</span>}
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${pc.color}12`, color: pc.color, textTransform: 'capitalize' as const }}>{r.priority}</span>
                            <div>{r.entityName ? <a href={`/${r.entityType === 'person' ? 'persons' : 'organizations'}/${r.entityId}`} onClick={e => e.stopPropagation()} style={{ fontSize: 10, color: theme.accent, textDecoration: 'none' }}>{r.entityType === 'person' ? '🧑' : '🏢'} {r.entityName.split(' ').slice(0, 2).join(' ')}</a> : <span style={{ fontSize: 10, color: theme.textDim }}>—</span>}</div>
                            <span style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{r.createdAt.slice(5, 16)}</span>
                        </div>;
                    })}
                </div>

                {/* Bottom stats */}
                <div style={{ padding: '6px 16px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 10, fontSize: 10, color: theme.textDim, flexShrink: 0, background: theme.bg, alignItems: 'center' }}>
                    <span>{filtered.length} records</span>
                    <span>·</span>
                    {aiTypes.map(t => { const cnt = filtered.filter(r => r.type === t).length; if (!cnt) return null; return <span key={t} style={{ color: typeConfig[t].color }}>{typeConfig[t].icon}{cnt}</span>; })}
                    <span style={{ marginLeft: 'auto' }}>Faster-Whisper · NLLB-200 · LLaMA 3.1 · LLaVA</span>
                </div>
            </div>

            {/* RIGHT: DETAIL */}
            {rec && <div className="rec-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${typeConfig[rec.type].color}12`, border: `1px solid ${typeConfig[rec.type].color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{typeConfig[rec.type].icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{rec.title}</div>
                            <div style={{ fontSize: 10, color: typeConfig[rec.type].color, fontWeight: 600 }}>{typeConfig[rec.type].label}</div>
                        </div>
                        <button onClick={() => setSelRec(null)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                </div>

                {/* Status + priority */}
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${statusConfig[rec.status].color}15`, color: statusConfig[rec.status].color, border: `1px solid ${statusConfig[rec.status].color}30` }}>{statusConfig[rec.status].label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${priorityConfig[rec.priority].color}15`, color: priorityConfig[rec.priority].color, border: `1px solid ${priorityConfig[rec.priority].color}30`, textTransform: 'capitalize' as const }}>{rec.priority}</span>
                    {rec.operationCode && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#ef444410', color: '#ef4444', border: '1px solid #ef444425', fontFamily: "'JetBrains Mono',monospace" }}>OP {rec.operationCode}</span>}
                    {rec.confidence !== undefined && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${rec.confidence >= 85 ? '#22c55e' : '#f59e0b'}15`, color: rec.confidence >= 85 ? '#22c55e' : '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{rec.confidence}%</span>}
                </div>

                {/* Progress bar */}
                {rec.status === 'processing' && rec.progress !== undefined && <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: theme.textDim, marginBottom: 4 }}><span>Processing...</span><span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#3b82f6' }}>{rec.progress}%</span></div>
                    <div style={{ height: 5, borderRadius: 3, background: `${theme.border}30`, overflow: 'hidden' }}><div style={{ width: `${rec.progress}%`, height: '100%', borderRadius: 3, background: '#3b82f6', transition: 'width 0.3s' }} /></div>
                </div>}

                {/* Info rows */}
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                    {[{ l: 'Source', v: rec.sourceFile }, { l: 'Size', v: rec.sourceSize }, ...(rec.sourceDuration ? [{ l: 'Duration', v: rec.sourceDuration }] : []), { l: 'AI Model', v: rec.aiModel }, ...(rec.sourceLang ? [{ l: 'Source Lang', v: languages.find(l => l.code === rec.sourceLang)?.label || rec.sourceLang }] : []), ...(rec.targetLang ? [{ l: 'Target Lang', v: languages.find(l => l.code === rec.targetLang)?.label || rec.targetLang }] : []), ...(rec.wordCount ? [{ l: 'Words', v: `${rec.wordCount.toLocaleString()}` }] : []), { l: 'Created', v: `${rec.createdAt} by ${rec.createdBy}` }, ...(rec.completedAt ? [{ l: 'Completed', v: rec.completedAt }] : []), ...(rec.processingTime ? [{ l: 'Duration', v: rec.processingTime }] : [])].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 10, color: theme.textDim, flexShrink: 0 }}>{r.l}</span><span style={{ fontSize: 10, color: theme.text, textAlign: 'right' as const, wordBreak: 'break-all' as const }}>{r.v}</span></div>)}
                </div>

                {/* Entity */}
                {rec.entityName && <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>Linked Entity</div>
                    <a href={`/${rec.entityType === 'person' ? 'persons' : 'organizations'}/${rec.entityId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '6px 8px', borderRadius: 6, border: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: 16 }}>{rec.entityType === 'person' ? '🧑' : '🏢'}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: theme.accent }}>{rec.entityName}</span>
                    </a>
                </div>}

                {/* Description */}
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>Description</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>{rec.description}</div>
                </div>

                {/* Result */}
                {rec.result && <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: rec.status === 'failed' ? '#ef4444' : '#22c55e', textTransform: 'uppercase' as const, marginBottom: 5 }}>{rec.status === 'failed' ? '❌ Error' : '✅ Result'}</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6, padding: '8px 10px', borderRadius: 6, background: `${theme.border}08`, border: `1px solid ${theme.border}` }}>{rec.result}</div>
                    {rec.resultPreview && <div style={{ marginTop: 6, padding: '6px 10px', borderRadius: 5, background: '#8b5cf608', border: '1px solid #8b5cf615', fontSize: 11, color: '#8b5cf6', fontStyle: 'italic' as const }}>"{rec.resultPreview}"</div>}
                </div>}

                {/* Tags */}
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>Tags</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>{rec.tags.map(t => <span key={t} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: `${theme.border}20`, color: theme.textSecondary }}>{t}</span>)}</div>
                </div>

                {/* Actions */}
                <div style={{ padding: '10px 16px', display: 'flex', gap: 4, marginTop: 'auto' }}>
                    <button style={{ flex: 1, padding: '8px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⬇️ Download</button>
                    {rec.entityId && <a href={`/${rec.entityType === 'person' ? 'persons' : 'organizations'}/${rec.entityId}`} style={{ flex: 1, padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 11, textAlign: 'center' as const }}>🧑 Entity</a>}
                </div>
            </div>}

            {/* Ctrl+Q */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="rec-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

RecordsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
