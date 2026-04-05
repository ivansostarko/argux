import PageMeta from '../../components/layout/PageMeta';
import AppLayout from '../../layouts/AppLayout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { useToast } from '../../components/ui/Toast';
import { mockJobs as FALLBACK, typeConfig, statusConfig, keyboardShortcuts } from '../../mock/jobs';
import type { JobStatus, JobType, Job } from '../../mock/jobs';

/**
 * ARGUX Background Jobs — queue dashboard via mock REST API.
 *
 * GET  /mock-api/jobs                      — List (filter status/type/queue + search)
 * GET  /mock-api/jobs/stats                — Worker + queue stats
 * GET  /mock-api/jobs/{id}                 — Job detail
 * POST /mock-api/jobs/{id}/retry           — Retry failed job
 * POST /mock-api/jobs/{id}/cancel          — Cancel running/queued job
 * DELETE /mock-api/jobs/{id}               — Delete finished job
 * POST /mock-api/jobs/clear-completed      — Clear all completed
 */

function getCsrf(): string { return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''); }
async function apiCall(url: string, method = 'GET', body?: any): Promise<any> {
    try {
        const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        return { ok: res.ok, status: res.status, data: await res.json() };
    } catch { return { ok: false, status: 0, data: { message: 'Network error.' } }; }
}

function Skel({ w, h }: { w: string | number; h: number }) { return <div style={{ width: typeof w === 'number' ? w : w, height: h, background: `linear-gradient(90deg, ${theme.bgInput} 25%, ${theme.border}20 50%, ${theme.bgInput} 75%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 6 }} />; }
function Bar({ pct, color }: { pct: number; color: string }) { return <div style={{ height: 6, borderRadius: 3, background: `${color}20`, overflow: 'hidden', flex: 1 }}><div style={{ height: '100%', borderRadius: 3, background: color, width: `${pct}%`, transition: 'width 0.5s' }} /></div>; }

export default function JobsIndex() {
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState<JobStatus | 'all'>('all');
    const [typeF, setTypeF] = useState<JobType | ''>('');
    const [selId, setSelId] = useState<string | null>(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();
    const toast = useToast();

    const fetchJobs = useCallback(async () => {
        setLoading(true); trigger();
        const params = new URLSearchParams();
        if (statusF !== 'all') params.set('status', statusF);
        if (typeF) params.set('type', typeF);
        if (search) params.set('search', search);
        const { ok, data } = await apiCall(`/mock-api/jobs?${params}`);
        if (ok && data.data) { setJobs(data.data); if (data.counts) setCounts(data.counts); }
        else { setJobs(FALLBACK as Job[]); }
        setLoading(false);
    }, [statusF, typeF, search, trigger]);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const sel = selId ? jobs.find(j => j.id === selId) : null;

    const handleRetry = async (id: string) => {
        const { ok, data } = await apiCall(`/mock-api/jobs/${id}/retry`, 'POST');
        if (ok) { toast.success('Retry queued', data.message); setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'queued' as const, progress: 0, retryCount: j.retryCount + 1, error: null } : j)); }
        else toast.error('Retry failed', data.message || 'Error');
    };
    const handleCancel = async (id: string) => {
        const { ok, data } = await apiCall(`/mock-api/jobs/${id}/cancel`, 'POST');
        if (ok) { toast.warning('Job cancelled', data.message); setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'cancelled' as const } : j)); }
        else toast.error('Cannot cancel', data.message || 'Error');
    };
    const handleDelete = async (id: string) => {
        const { ok, data } = await apiCall(`/mock-api/jobs/${id}`, 'DELETE');
        if (ok) { toast.info('Deleted', data.message); setJobs(prev => prev.filter(j => j.id !== id)); if (selId === id) setSelId(null); }
        else toast.error('Cannot delete', data.message || 'Error');
    };
    const handleClearCompleted = async () => {
        const { ok, data } = await apiCall('/mock-api/jobs/clear-completed', 'POST');
        if (ok) { toast.success('Cleared', data.message); setJobs(prev => prev.filter(j => j.status !== 'completed')); }
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); setShowShortcuts(p => !p); return; }
            switch (e.key) { case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break; case 'r': case 'R': fetchJobs(); break; case 'Escape': if (selId) setSelId(null); else setShowShortcuts(false); break; }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [selId, fetchJobs]);

    const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' };

    return (<><PageMeta title="Background Jobs" /><div data-testid="jobs-page">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' as const, gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚡</div>
                <div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Background Jobs</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{jobs.length} jobs · {counts.running || 0} running · {counts.queued || 0} queued</p></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleClearCompleted} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>🧹 Clear Completed</button>
                <button onClick={() => setShowShortcuts(true)} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>⌨️</button>
            </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
            {(Object.keys(statusConfig) as JobStatus[]).map(s => (
                <button key={s} onClick={() => setStatusF(statusF === s ? 'all' : s)} style={{ padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${statusF === s ? statusConfig[s].color : theme.border}`, background: statusF === s ? `${statusConfig[s].color}08` : theme.bgCard, cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'inherit' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>{statusConfig[s].icon} {statusConfig[s].label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: statusConfig[s].color, fontFamily: "'JetBrains Mono', monospace" }}>{counts[s] || 0}</div>
                </button>
            ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200, ...inp, padding: 0, paddingLeft: 12 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit' }} />
            </div>
            <select value={typeF} onChange={e => setTypeF(e.target.value as JobType | '')} style={{ ...inp, width: 'auto', minWidth: 160 }}>
                <option value="">All Types</option>
                {(Object.keys(typeConfig) as JobType[]).map(t => <option key={t} value={t}>{typeConfig[t].icon} {typeConfig[t].label}</option>)}
            </select>
        </div>

        {/* Main content */}
        <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 380px' : '1fr', gap: 16 }}>
            {/* Job list */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {loading ? Array.from({ length: 6 }).map((_, i) => <Skel key={i} w="100%" h={72} />) :
                 jobs.length === 0 ? <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.15 }}>⚡</div><div style={{ fontSize: 15, fontWeight: 600, color: theme.textSecondary, marginTop: 8 }}>No jobs found</div></div> :
                 jobs.map(j => {
                    const tc = typeConfig[j.type]; const sc = statusConfig[j.status]; const active = selId === j.id;
                    return (
                        <div key={j.id} onClick={() => setSelId(active ? null : j.id)} style={{ padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${active ? tc.color : theme.border}`, background: active ? `${tc.color}05` : theme.bgCard, cursor: 'pointer', transition: 'all 0.15s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                                    <span style={{ fontSize: 16, flexShrink: 0 }}>{tc.icon}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{j.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${sc.color}12`, color: sc.color, border: `1px solid ${sc.color}25` }}>{sc.label}</span>
                                    {j.priority === 'high' && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>HIGH</span>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {(j.status === 'running' || (j.status === 'failed' && j.progress > 0)) && <Bar pct={j.progress} color={j.status === 'failed' ? '#ef4444' : tc.color} />}
                                {j.status === 'running' && <span style={{ fontSize: 11, fontWeight: 700, color: tc.color, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{j.progress}%</span>}
                                <span style={{ fontSize: 11, color: theme.textDim, marginLeft: 'auto', flexShrink: 0 }}>{j.duration || (j.startedAt ? 'In progress...' : 'Waiting...')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 11, color: theme.textDim }}>
                                <span>{j.initiator}</span><span>·</span><span>{j.worker || 'Unassigned'}</span>
                                {j.startedAt && <><span>·</span><span>{j.startedAt}</span></>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail panel */}
            {sel && (() => { const tc = typeConfig[sel.type]; const sc = statusConfig[sel.status]; return (
                <div style={{ background: theme.bgCard, borderRadius: 12, border: `1px solid ${theme.border}`, padding: 20, alignSelf: 'start', position: 'sticky' as const, top: 80 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>{tc.icon}</span><span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{tc.label}</span></div>
                        <button onClick={() => setSelId(null)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 12, lineHeight: 1.4 }}>{sel.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: `${sc.color}12`, color: sc.color, border: `1px solid ${sc.color}25` }}>{sc.icon} {sc.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: `${tc.color}12`, color: tc.color, border: `1px solid ${tc.color}25` }}>{sel.priority}</span>
                    </div>
                    {sel.status === 'running' && <div style={{ marginBottom: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 11, color: theme.textSecondary }}>Progress</span><span style={{ fontSize: 11, fontWeight: 700, color: tc.color }}>{sel.progress}%</span></div><Bar pct={sel.progress} color={tc.color} /></div>}

                    {/* Meta */}
                    <div style={{ fontSize: 11, marginBottom: 16 }}>
                        {[['Worker', sel.worker || '—'], ['Queue', sel.queue], ['Initiator', sel.initiator], ['Started', sel.startedAt || '—'], ['Completed', sel.completedAt || '—'], ['Duration', sel.duration || '—'], ['Retries', `${sel.retryCount}/${sel.maxRetries}`]].map(([k, v]) => (
                            <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${theme.border}08` }}>
                                <span style={{ color: theme.textDim }}>{k}</span><span style={{ color: theme.text, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    {/* Input params */}
                    <div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Input Parameters</div>
                    <div style={{ background: theme.bgInput, borderRadius: 8, padding: 12, marginBottom: 16, border: `1px solid ${theme.border}` }}>
                        {Object.entries(sel.input).map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 }}>
                                <span style={{ color: theme.textDim }}>{k}</span><span style={{ color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    {/* Output */}
                    {sel.output && <><div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Output</div><div style={{ background: `${statusConfig.completed.color}08`, borderRadius: 8, padding: 12, marginBottom: 16, border: `1px solid ${statusConfig.completed.color}20`, fontSize: 12, color: theme.text, lineHeight: 1.5 }}>{sel.output}</div></>}

                    {/* Error */}
                    {sel.error && <><div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Error Log</div><div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: 8, padding: 12, marginBottom: 16, border: '1px solid rgba(239,68,68,0.15)', fontSize: 12, color: '#ef4444', lineHeight: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>{sel.error}</div></>}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                        {sel.status === 'failed' && sel.retryCount < sel.maxRetries && <button onClick={() => handleRetry(sel.id)} style={{ flex: 1, padding: '8px 14px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Retry</button>}
                        {(sel.status === 'running' || sel.status === 'queued') && <button onClick={() => handleCancel(sel.id)} style={{ flex: 1, padding: '8px 14px', borderRadius: 6, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🚫 Cancel</button>}
                        {['completed', 'failed', 'cancelled'].includes(sel.status) && <button onClick={() => handleDelete(sel.id)} style={{ flex: 1, padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Delete</button>}
                    </div>
                </div>
            ); })()}
        </div>

        {/* Shortcuts modal */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>{keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${theme.border}08` }}><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 54, height: 22, padding: '0 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'rgba(128,128,128,0.06)', color: theme.textDim, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{s.key}</span><span style={{ fontSize: 12, color: theme.textSecondary }}>{s.description}</span></div>)}</div></div>}
    </div></>);
}
JobsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
