import PageMeta from '../../components/layout/PageMeta';
import AppLayout from '../../layouts/AppLayout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { useToast } from '../../components/ui/Toast';
import { mockReports as FALLBACK, persons as FALLBACK_P, organizations as FALLBACK_O, statusConfig, riskColors, personSections, orgSections, keyboardShortcuts } from '../../mock/reports';
import type { EntityType, ReportStatus, Report, ReportEntity } from '../../mock/reports';

/**
 * ARGUX Report Generator — intelligence reports via mock REST API.
 *
 * GET  /mock-api/reports/entities         — Available persons + organizations
 * GET  /mock-api/reports                  — Report history (filter + search)
 * GET  /mock-api/reports/{id}             — Report detail with section list
 * POST /mock-api/reports                  — Generate new report
 * POST /mock-api/reports/{id}/retry       — Retry failed
 * GET  /mock-api/reports/{id}/download    — Download completed
 * DELETE /mock-api/reports/{id}           — Delete (not while generating)
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

export default function ReportsIndex() {
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<Report[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [persons, setPersons] = useState<ReportEntity[]>([]);
    const [orgs, setOrgs] = useState<ReportEntity[]>([]);
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState('');
    const [typeF, setTypeF] = useState('');
    const [selId, setSelId] = useState<string | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();
    const toast = useToast();

    // New report form
    const [nType, setNType] = useState<EntityType>('person');
    const [nEntity, setNEntity] = useState(0);
    const [nFormat, setNFormat] = useState<'pdf' | 'docx'>('pdf');
    const [nDateFrom, setNDateFrom] = useState('2026-01-01');
    const [nDateTo, setNDateTo] = useState('2026-03-27');
    const [generating, setGenerating] = useState(false);

    const fetchReports = useCallback(async () => {
        setLoading(true); trigger();
        const params = new URLSearchParams();
        if (statusF) params.set('status', statusF);
        if (typeF) params.set('entity_type', typeF);
        if (search) params.set('search', search);
        const [rptRes, entRes] = await Promise.all([
            apiCall(`/mock-api/reports?${params}`),
            apiCall('/mock-api/reports/entities'),
        ]);
        if (rptRes.ok && rptRes.data.data) { setReports(rptRes.data.data); if (rptRes.data.counts) setCounts(rptRes.data.counts); }
        else { setReports(FALLBACK as Report[]); }
        if (entRes.ok) { setPersons(entRes.data.persons || FALLBACK_P); setOrgs(entRes.data.organizations || FALLBACK_O); }
        else { setPersons(FALLBACK_P); setOrgs(FALLBACK_O); }
        setLoading(false);
    }, [statusF, typeF, search, trigger]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const sel = selId ? reports.find(r => r.id === selId) : null;
    const entityList = nType === 'person' ? persons : orgs;

    const handleGenerate = async () => {
        if (!nEntity) return;
        setGenerating(true);
        const { ok, data } = await apiCall('/mock-api/reports', 'POST', { entity_type: nType, entity_id: nEntity, format: nFormat, date_from: nDateFrom, date_to: nDateTo });
        setGenerating(false);
        if (ok && data.data) { setReports(prev => [data.data as Report, ...prev]); setShowNew(false); toast.success('Report queued', data.message); }
        else toast.error('Error', data.message || 'Failed.');
    };
    const handleRetry = async (id: string) => {
        const { ok, data } = await apiCall(`/mock-api/reports/${id}/retry`, 'POST');
        if (ok) { toast.success('Retrying', data.message); setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'queued' as const } : r)); }
        else toast.error('Error', data.message);
    };
    const handleDownload = async (id: string) => {
        const { ok, data } = await apiCall(`/mock-api/reports/${id}/download`);
        if (ok) toast.success('Download', `${data.file} (${data.size})`);
        else toast.error('Error', data.message);
    };
    const handleDelete = async (id: string) => {
        const { ok, data } = await apiCall(`/mock-api/reports/${id}`, 'DELETE');
        if (ok) { toast.info('Deleted', data.message); setReports(prev => prev.filter(r => r.id !== id)); if (selId === id) setSelId(null); }
        else toast.error('Error', data.message);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); setShowShortcuts(p => !p); return; }
            switch (e.key) { case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break; case 'n': case 'N': setShowNew(true); break; case 'Escape': if (showNew) setShowNew(false); else if (selId) setSelId(null); else setShowShortcuts(false); break; }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [selId, showNew]);

    const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' };

    return (<><PageMeta title="Reports" /><div data-testid="reports-page">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' as const, gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📊</div>
                <div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Report Generator</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{reports.length} reports · CLASSIFIED // NOFORN</p></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowNew(true)} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Generate Report</button>
                <button onClick={() => setShowShortcuts(true)} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>⌨️</button>
            </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200, ...inp, padding: 0, paddingLeft: 12 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit' }} />
            </div>
            <select value={typeF} onChange={e => setTypeF(e.target.value)} style={{ ...inp, width: 'auto', minWidth: 140 }}>
                <option value="">All Types</option><option value="person">Person</option><option value="organization">Organization</option>
            </select>
            <select value={statusF} onChange={e => setStatusF(e.target.value)} style={{ ...inp, width: 'auto', minWidth: 140 }}>
                <option value="">All Status</option>
                {(Object.keys(statusConfig) as ReportStatus[]).map(s => <option key={s} value={s}>{statusConfig[s].label} ({counts[s] || 0})</option>)}
            </select>
        </div>

        {/* Main content */}
        <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 380px' : '1fr', gap: 16 }}>
            {/* Report list */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {loading ? Array.from({ length: 5 }).map((_, i) => <Skel key={i} w="100%" h={80} />) :
                 reports.length === 0 ? <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.15 }}>📊</div><div style={{ fontSize: 15, fontWeight: 600, color: theme.textSecondary, marginTop: 8 }}>No reports found</div></div> :
                 reports.map(r => {
                    const sc = statusConfig[r.status]; const active = selId === r.id;
                    return (
                        <div key={r.id} onClick={() => setSelId(active ? null : r.id)} style={{ padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${active ? sc.color : theme.border}`, background: active ? `${sc.color}05` : theme.bgCard, cursor: 'pointer', transition: 'all 0.15s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                                    <span style={{ fontSize: 14, flexShrink: 0 }}>{r.entityType === 'person' ? '👤' : '🏢'}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.title}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${sc.color}12`, color: sc.color, border: `1px solid ${sc.color}25` }}>{sc.label}</span>
                                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${theme.border}15`, color: theme.textDim, textTransform: 'uppercase' as const }}>{r.format}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: theme.textDim }}>
                                <span>{r.generatedBy}</span><span>·</span><span>{r.generatedAt}</span>
                                {r.pages > 0 && <><span>·</span><span>{r.pages} pages</span></>}
                                {r.size && <><span>·</span><span>{r.size}</span></>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail panel */}
            {sel && (() => { const sc = statusConfig[sel.status]; const sections = sel.entityType === 'person' ? personSections : orgSections; return (
                <div style={{ background: theme.bgCard, borderRadius: 12, border: `1px solid ${theme.border}`, padding: 20, alignSelf: 'start', position: 'sticky' as const, top: 80 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{sel.entityType === 'person' ? '👤' : '🏢'} Report Detail</span>
                        <button onClick={() => setSelId(null)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 8, lineHeight: 1.4 }}>{sel.title}</div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: `${sc.color}12`, color: sc.color, border: `1px solid ${sc.color}25` }}>{sc.icon} {sc.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: `${theme.border}15`, color: theme.textDim }}>{sel.format.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 11, marginBottom: 16 }}>
                        {[['Entity', sel.entityName], ['Generated By', sel.generatedBy], ['Date', sel.generatedAt], ['Period', `${sel.dateFrom} → ${sel.dateTo}`], ['Sections', String(sel.sections)], ['Pages', sel.pages > 0 ? String(sel.pages) : '—'], ['Size', sel.size || '—'], ['Classification', sel.classification]].map(([k, v]) => (
                            <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${theme.border}08` }}>
                                <span style={{ color: theme.textDim }}>{k}</span><span style={{ color: theme.text, fontWeight: 500, fontSize: 11 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                    {sel.status === 'completed' && <><div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Sections ({sections.length})</div><div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginBottom: 16 }}>{sections.map((s, i) => <span key={s} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: `${theme.border}15`, color: theme.textSecondary }}>{i + 1}. {s}</span>)}</div></>}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                        {sel.status === 'completed' && <button onClick={() => handleDownload(sel.id)} style={{ flex: 1, padding: '8px 14px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>📥 Download</button>}
                        {sel.status === 'failed' && <button onClick={() => handleRetry(sel.id)} style={{ flex: 1, padding: '8px 14px', borderRadius: 6, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Retry</button>}
                        {sel.status !== 'generating' && <button onClick={() => handleDelete(sel.id)} style={{ flex: 1, padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Delete</button>}
                    </div>
                    <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', fontSize: 10, color: '#ef4444', fontWeight: 600, textAlign: 'center' as const }}>ARGUX Surveillance Platform — {sel.classification}</div>
                </div>
            ); })()}
        </div>

        {/* New Report Modal */}
        {showNew && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>📊 Generate Report</div>
                    <button onClick={() => setShowNew(false)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6 }}>Entity Type</label>
                    <div style={{ display: 'flex', gap: 8 }}>{(['person', 'organization'] as EntityType[]).map(t => <button key={t} onClick={() => { setNType(t); setNEntity(0); }} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${nType === t ? '#3b82f6' : theme.border}`, background: nType === t ? 'rgba(59,130,246,0.08)' : 'transparent', color: nType === t ? '#3b82f6' : theme.textSecondary, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t === 'person' ? '👤 Person' : '🏢 Organization'}</button>)}</div>
                </div>
                <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6 }}>Select Entity</label>
                    <select value={nEntity} onChange={e => setNEntity(Number(e.target.value))} style={inp}><option value={0}>— Select —</option>{entityList.map(e => <option key={e.id} value={e.id}>{e.name} ({e.risk})</option>)}</select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6 }}>Date From</label><input type="date" value={nDateFrom} onChange={e => setNDateFrom(e.target.value)} style={inp} /></div>
                    <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6 }}>Date To</label><input type="date" value={nDateTo} onChange={e => setNDateTo(e.target.value)} style={inp} /></div>
                </div>
                <div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6 }}>Format</label>
                    <div style={{ display: 'flex', gap: 8 }}>{(['pdf', 'docx'] as const).map(f => <button key={f} onClick={() => setNFormat(f)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${nFormat === f ? '#3b82f6' : theme.border}`, background: nFormat === f ? 'rgba(59,130,246,0.08)' : 'transparent', color: nFormat === f ? '#3b82f6' : theme.textSecondary, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' as const }}>{f === 'pdf' ? '📄' : '📝'} {f}</button>)}</div>
                </div>
                <button onClick={handleGenerate} disabled={!nEntity || generating} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: nEntity && !generating ? '#3b82f6' : theme.border, color: '#fff', fontSize: 14, fontWeight: 700, cursor: nEntity && !generating ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: nEntity && !generating ? 1 : 0.4 }}>{generating ? '⏳ Generating...' : '📊 Generate Report'}</button>
            </div>
        </div>}

        {/* Shortcuts modal */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>{keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${theme.border}08` }}><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 54, height: 22, padding: '0 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'rgba(128,128,128,0.06)', color: theme.textDim, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{s.key}</span><span style={{ fontSize: 12, color: theme.textSecondary }}>{s.description}</span></div>)}</div></div>}
    </div></>);
}
ReportsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
