import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockJobs, mockWorkers, typeConfig, statusColors, statusIcons, prioColors, allOps, keyboardShortcuts } from '../../mock/jobs';
import type { JobStatus, JobType, Priority, ViewTab } from '../../mock/jobs';

/* ═══ ARGUX — Background Jobs ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="job-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }
function SkeletonRows({ count = 6 }: { count?: number }) { return <>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'center' }}><Skel w={32} h={32} /><div style={{ flex: 1 }}><Skel w="55%" h={14} /><div style={{ height: 6 }} /><Skel w="80%" h={5} /><div style={{ height: 6 }} /><Skel w="35%" h={10} /></div><Skel w={60} h={14} /></div>)}</>; }

function JobsIndex() {
    const [tab, setTab] = useState<ViewTab>('all');
    const [search, setSearch] = useState('');
    const [typeF, setTypeF] = useState<JobType | 'all'>('all');
    const [prioF, setPrioF] = useState<Priority | 'all'>('all');
    const [opF, setOpF] = useState('all');
    const [selJob, setSelJob] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [tick, setTick] = useState(0);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
    useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 3000); return () => clearInterval(iv); }, []);

    const job = selJob ? mockJobs.find(j => j.id === selJob) : null;

    const filtered = useMemo(() => {
        const tabStatusMap: Record<string, JobStatus | undefined> = { running: 'Running', queued: 'Queued', completed: 'Completed' };
        const tabStatus = tabStatusMap[tab];
        return mockJobs.filter(j => {
            if (tab === 'failed' && !['Failed', 'Cancelled', 'Retrying'].includes(j.status)) return false;
            else if (tabStatus && j.status !== tabStatus) return false;
            if (typeF !== 'all' && j.type !== typeF) return false;
            if (prioF !== 'all' && j.priority !== prioF) return false;
            if (opF !== 'all' && j.operationCode !== opF) return false;
            if (search && !j.name.toLowerCase().includes(search.toLowerCase()) && !j.entityName?.toLowerCase().includes(search.toLowerCase()) && !j.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
            return true;
        });
    }, [tab, typeF, prioF, opF, search]);

    const stats = { total: mockJobs.length, running: mockJobs.filter(j => j.status === 'Running').length, queued: mockJobs.filter(j => j.status === 'Queued').length, completed: mockJobs.filter(j => j.status === 'Completed').length, failed: mockJobs.filter(j => ['Failed', 'Cancelled', 'Retrying'].includes(j.status)).length, workersActive: mockWorkers.filter(w => w.status === 'Active').length };

    const tabList: ViewTab[] = ['all', 'running', 'queued', 'completed', 'failed', 'workers'];
    const tabItems: { id: ViewTab; label: string; count: number; color: string; icon: string }[] = [
        { id: 'all', label: 'All Jobs', count: mockJobs.length, color: theme.accent, icon: '📋' },
        { id: 'running', label: 'Running', count: stats.running, color: '#3b82f6', icon: '⏳' },
        { id: 'queued', label: 'Queued', count: stats.queued, color: '#f59e0b', icon: '🕐' },
        { id: 'completed', label: 'Completed', count: stats.completed, color: '#22c55e', icon: '✅' },
        { id: 'failed', label: 'Failed', count: stats.failed, color: '#ef4444', icon: '❌' },
        { id: 'workers', label: 'Workers', count: mockWorkers.length, color: '#8b5cf6', icon: '🖥️' },
    ];

    const switchTab = useCallback((t: ViewTab) => { setTab(t); trigger(); }, [trigger]);
    const resetFilters = useCallback(() => { setSearch(''); setTypeF('all'); setPrioF('all'); setOpF('all'); trigger(); }, [trigger]);

    // ═══ Keyboard Shortcuts ═══
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case '1': switchTab('all'); break; case '2': switchTab('running'); break; case '3': switchTab('queued'); break;
                case '4': switchTab('completed'); break; case '5': switchTab('failed'); break; case '6': switchTab('workers'); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 'Escape': setSelJob(null); setShowShortcuts(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [switchTab, resetFilters]);

    return (<>
        <PageMeta title="Background Jobs" />
        <div className="job-page" data-testid="jobs-page">

            {/* LEFT SIDEBAR */}
            <div className="job-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#8b5cf610', border: '1px solid #8b5cf625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⚙️</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>JOBS</div><div style={{ fontSize: 10, color: theme.textDim }}>Queue & Workers</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="job-kbd">F</span>
                    </div>
                </div>

                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ n: stats.running, l: 'Run', c: '#3b82f6' }, { n: stats.queued, l: 'Queue', c: '#f59e0b' }, { n: stats.completed, l: 'Done', c: '#22c55e' }, { n: stats.failed, l: 'Fail', c: '#ef4444' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}><div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Job Type</div>
                    <button onClick={() => { setTypeF('all'); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: typeF === 'all' ? `${theme.accent}08` : 'transparent', color: typeF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, borderLeft: `2px solid ${typeF === 'all' ? theme.accent : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1, fontWeight: typeF === 'all' ? 700 : 500 }}>All Types</button>
                    {(Object.keys(typeConfig) as JobType[]).map(t => { const tc = typeConfig[t]; const c = mockJobs.filter(j => j.type === t).length; if (c === 0) return null; return <button key={t} onClick={() => { setTypeF(t); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: typeF === t ? `${tc.color}08` : 'transparent', color: typeF === t ? tc.color : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, borderLeft: `2px solid ${typeF === t ? tc.color : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1, fontWeight: typeF === t ? 600 : 400 }}><span style={{ fontSize: 13 }}>{tc.icon}</span><span style={{ flex: 1 }}>{tc.label}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Priority</div><div style={{ display: 'flex', gap: 3 }}>
                        {(['all', 'Critical', 'High', 'Normal', 'Low'] as const).map(p => <button key={p} onClick={() => { setPrioF(p as any); trigger(); }} style={{ flex: 1, padding: '4px', borderRadius: 4, border: `1px solid ${prioF === p ? (p === 'all' ? theme.accent : prioColors[p as Priority]) + '40' : theme.border}`, background: prioF === p ? `${p === 'all' ? theme.accent : prioColors[p as Priority]}08` : 'transparent', color: prioF === p ? (p === 'all' ? theme.accent : prioColors[p as Priority]) : theme.textDim, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{p === 'all' ? 'All' : p.slice(0, 4)}</button>)}
                    </div></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Operation</div><select value={opF} onChange={e => { setOpF(e.target.value); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Operations</option>{allOps.map(o => <option key={o} value={o}>OP {o}</option>)}</select></div>
                </div>

                <div style={{ padding: '10px 14px' }}>
                    <button onClick={resetFilters} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset Filters <span className="job-kbd" style={{ marginLeft: 4 }}>R</span></button>
                </div>
            </div>

            {/* CENTER */}
            <div className="job-center">
                {/* Mobile bar */}
                <div className="job-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <select value={prioF} onChange={e => { setPrioF(e.target.value as any); trigger(); }} style={{ padding: '7px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}>
                        <option value="all">All Prio</option>{(['Critical','High','Normal','Low'] as const).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
                    {tabItems.map((t, idx) => <button key={t.id} onClick={() => switchTab(t.id)} style={{ padding: '10px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? t.color : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' as const }}>
                        <span style={{ fontSize: 13 }}>{t.icon}</span>
                        <span className="job-tab-label">{t.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: `${tab === t.id ? t.color : theme.border}20`, color: tab === t.id ? t.color : theme.textDim }}>{t.count}</span>
                        <span className="job-kbd" style={{ marginLeft: 2 }}>{idx + 1}</span>
                    </button>)}
                </div>

                <div className="job-scroll">
                    {loading && <SkeletonRows count={8} />}

                    {/* WORKERS */}
                    {!loading && tab === 'workers' && <div className="job-worker-grid" style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                        {mockWorkers.map(w => { const wc = w.status === 'Active' ? '#22c55e' : w.status === 'Idle' ? '#f59e0b' : w.status === 'Overloaded' ? '#ef4444' : '#6b7280'; return <div key={w.id} style={{ padding: 16, borderRadius: 10, border: `1px solid ${wc}20`, background: `${wc}03` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: wc, boxShadow: w.status === 'Active' ? `0 0 8px ${wc}` : 'none' }} />
                                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{w.name}</div><div style={{ fontSize: 10, color: wc, fontWeight: 600 }}>{w.status}</div></div>
                                <span style={{ fontSize: 12, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{w.jobsProcessed.toLocaleString()}</span>
                            </div>
                            {w.currentJob && <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 8 }}>Current: <span style={{ color: theme.accent }}>{mockJobs.find(j => j.id === w.currentJob)?.name || '—'}</span></div>}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                                {[{ l: 'CPU', v: w.cpu }, { l: 'MEM', v: w.memory }].map(m => <div key={m.l} style={{ flex: 1 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: theme.textDim, marginBottom: 3 }}><span>{m.l}</span><span>{m.v}%</span></div><div style={{ height: 5, borderRadius: 3, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${m.v}%`, height: '100%', background: m.v > 80 ? '#ef4444' : m.v > 60 ? '#f59e0b' : '#22c55e' }} /></div></div>)}
                            </div>
                            <div style={{ fontSize: 10, color: theme.textDim }}>Uptime: {w.uptime} · {w.jobsProcessed.toLocaleString()} processed</div>
                        </div>; })}
                    </div>}

                    {/* JOB LIST */}
                    {!loading && tab !== 'workers' && <>
                        {filtered.length === 0 && <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.2 }}>⚙️</div><div style={{ fontSize: 15, fontWeight: 700, color: theme.textSecondary, marginTop: 6 }}>No jobs match filters</div><button onClick={resetFilters} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset Filters</button></div>}
                        {filtered.map(j => {
                            const tc = typeConfig[j.type]; const sc = statusColors[j.status]; const sel = selJob === j.id;
                            const animProg = j.status === 'Running' ? Math.min(99, j.progress + (tick % 3) * 2) : j.progress;
                            return <div key={j.id} className="job-row" onClick={() => setSelJob(j.id)} style={{ padding: '12px 18px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: sel ? `${tc.color}04` : 'transparent', borderLeft: `3px solid ${sel ? tc.color : 'transparent'}` }}>
                                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${tc.color}12`, border: `1px solid ${tc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{tc.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{j.name}</span>
                                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${prioColors[j.priority]}12`, color: prioColors[j.priority], flexShrink: 0 }}>{j.priority}</span>
                                    </div>
                                    {(j.status === 'Running' || j.status === 'Retrying') && <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                                        <div style={{ flex: 1, height: 5, borderRadius: 3, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${animProg}%`, height: '100%', background: j.status === 'Retrying' ? '#f97316' : sc, borderRadius: 3, transition: 'width 1s ease' }} /></div>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: sc, fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{animProg}%</span>
                                    </div>}
                                    <div style={{ display: 'flex', gap: 6, fontSize: 10, color: theme.textDim }}>
                                        {j.entityName && <span>{j.entityName}</span>}
                                        <span>· {j.worker || 'Waiting'}</span>
                                        <span>· {j.duration}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: sc, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                        {j.status === 'Running' && <div style={{ width: 7, height: 7, borderRadius: '50%', background: sc, animation: 'argux-pulse 1.5s infinite' }} />}
                                        {statusIcons[j.status]} {j.status}
                                    </div>
                                    {j.operationCode && <div style={{ fontSize: 9, color: theme.accent, marginTop: 2 }}>{j.operationCode}</div>}
                                </div>
                            </div>;
                        })}
                    </>}
                </div>
            </div>

            {/* RIGHT: Job Detail */}
            {job && tab !== 'workers' && <div className="job-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 6, background: `${typeConfig[job.type].color}12`, border: `1px solid ${typeConfig[job.type].color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{typeConfig[job.type].icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{job.name}</div><div style={{ fontSize: 10, color: typeConfig[job.type].color, fontWeight: 600 }}>{typeConfig[job.type].label}</div></div>
                        <button onClick={() => setSelJob(null)} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${statusColors[job.status]}12`, color: statusColors[job.status] }}>{statusIcons[job.status]} {job.status}</span>
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${prioColors[job.priority]}12`, color: prioColors[job.priority] }}>{job.priority}</span>
                        {job.operationCode && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${theme.accent}10`, color: theme.accent }}>{job.operationCode}</span>}
                    </div>
                </div>

                {(job.status === 'Running' || job.status === 'Retrying') && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}><span style={{ color: theme.textDim }}>Progress</span><span style={{ color: statusColors[job.status], fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{Math.min(99, job.progress + (tick % 3) * 2)}%</span></div>
                    <div style={{ height: 7, borderRadius: 4, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${Math.min(99, job.progress + (tick % 3) * 2)}%`, height: '100%', background: statusColors[job.status], borderRadius: 4, transition: 'width 1s ease' }} /></div>
                </div>}

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>📥 Input</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>{job.input}</div>
                </div>

                {job.output && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>📤 Output</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>{job.output}</div>
                </div>}

                {job.errorLog && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, background: '#ef444406' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>❌ Error</div>
                    <div style={{ fontSize: 10, color: theme.textSecondary, lineHeight: 1.6, fontFamily: "'JetBrains Mono',monospace" }}>{job.errorLog}</div>
                    {job.retryCount > 0 && <div style={{ fontSize: 9, color: '#f97316', marginTop: 4 }}>Retry {job.retryCount}/{job.maxRetries}</div>}
                </div>}

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                    {[{ l: 'Worker', v: job.worker || 'Waiting' }, { l: 'Queue', v: job.queue }, { l: 'Initiated', v: job.initiatedBy }, { l: 'Started', v: job.startedAt || '—' }, { l: 'Completed', v: job.completedAt || '—' }, { l: 'Duration', v: job.duration }, ...(job.entityName ? [{ l: 'Entity', v: job.entityName }] : [])].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 10, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 10, color: theme.text, fontWeight: 600 }}>{r.v}</span></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        {job.tags.map(t => <span key={t} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: t === 'error' || t === 'cancelled' ? '#ef444412' : t.includes('HAWK') || t.includes('GLACIER') || t.includes('PHOENIX') ? `${theme.accent}10` : `${theme.border}20`, color: t === 'error' || t === 'cancelled' ? '#ef4444' : t.includes('HAWK') || t.includes('GLACIER') || t.includes('PHOENIX') ? theme.accent : theme.textSecondary }}>{t}</span>)}
                    </div>
                </div>

                <div style={{ padding: '10px 14px', display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginTop: 'auto' }}>
                    {job.status === 'Failed' && <button style={{ flex: 1, padding: '7px', borderRadius: 5, border: '1px solid #f59e0b30', background: '#f59e0b06', color: '#f59e0b', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Retry</button>}
                    {job.status === 'Running' && <button style={{ flex: 1, padding: '7px', borderRadius: 5, border: '1px solid #ef444430', background: '#ef444406', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⛔ Cancel</button>}
                    {job.entityId && <a href={`/${job.entityType === 'person' ? 'persons' : job.entityType === 'organization' ? 'organizations' : 'devices'}/${job.entityId}`} style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, textDecoration: 'none', fontSize: 11, fontWeight: 600, textAlign: 'center' as const }}>View Entity</a>}
                </div>
            </div>}

            {/* Ctrl+Q Modal */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div>
                        <button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="job-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

JobsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default JobsIndex;