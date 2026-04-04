import PageMeta from '../../components/layout/PageMeta';
import AdminLayout from '../../layouts/AdminLayout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { useToast } from '../../components/ui/Toast';
import { mockAuditEntries as FALLBACK, actionConfig, severityConfig, moduleConfig, users, keyboardShortcuts } from '../../mock/admin-audit';
import type { ActionType, Severity, Module, AuditEntry } from '../../mock/admin-audit';

/**
 * ARGUX Audit Log — immutable trail via mock REST API.
 *
 * GET  /mock-api/admin/audit              — List (search, 7 filters, sort, pagination)
 * GET  /mock-api/admin/audit/{id}         — Entry detail
 * POST /mock-api/admin/audit/export       — Export CSV/PDF
 * POST /mock-api/admin/audit/{id}/verify  — Cryptographic integrity check
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

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="aud-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }

export default function AdminAudit() {
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selEntry, setSelEntry] = useState<string | null>(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [page, setPage] = useState(1);
    const [sortCol, setSortCol] = useState<'timestamp' | 'user' | 'action' | 'severity' | 'module'>('timestamp');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();
    const toast = useToast();
    const perPage = 15;

    // Filters
    const [fAction, setFAction] = useState<ActionType | ''>('');
    const [fSeverity, setFSeverity] = useState<Severity | ''>('');
    const [fModule, setFModule] = useState<Module | ''>('');
    const [fUser, setFUser] = useState<string>('');
    const [fIp, setFIp] = useState('');
    const [fDateFrom, setFDateFrom] = useState('');
    const [fDateTo, setFDateTo] = useState('');

    const fetchAudit = useCallback(async () => {
        setLoading(true); trigger();
        const params = new URLSearchParams({ page: String(page), per_page: String(perPage), sort: sortCol, dir: sortDir });
        if (search) params.set('search', search);
        if (fAction) params.set('action', fAction);
        if (fSeverity) params.set('severity', fSeverity);
        if (fModule) params.set('module', fModule);
        if (fUser) params.set('user', fUser);
        if (fIp) params.set('ip', fIp);
        if (fDateFrom) params.set('date_from', fDateFrom);
        if (fDateTo) params.set('date_to', fDateTo);
        const { ok, data } = await apiCall(`/mock-api/admin/audit?${params}`);
        if (ok && data.data) { setEntries(data.data); setTotalCount(data.meta?.total || data.data.length); }
        else { setEntries(FALLBACK as AuditEntry[]); setTotalCount(FALLBACK.length); }
        setLoading(false);
    }, [page, perPage, sortCol, sortDir, search, fAction, fSeverity, fModule, fUser, fIp, fDateFrom, fDateTo, trigger]);

    useEffect(() => { fetchAudit(); }, [fetchAudit]);

    const filterCount = [fAction, fSeverity, fModule, fUser, fIp, fDateFrom, fDateTo].filter(Boolean).length;
    const resetAll = useCallback(() => { setSearch(''); setFAction(''); setFSeverity(''); setFModule(''); setFUser(''); setFIp(''); setFDateFrom(''); setFDateTo(''); setPage(1); trigger(); }, [trigger]);

    // Data already filtered/sorted/paged by API
    const paged = entries;
    const totalPages = Math.ceil(totalCount / perPage);
    const entry = selEntry ? entries.find(e => e.id === selEntry) : null;

    const toggleSort = (col: typeof sortCol) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('desc'); } setPage(1); };
    const SI = ({ col }: { col: typeof sortCol }) => sortCol === col ? <span style={{ fontSize: 9, marginLeft: 2 }}>{sortDir === 'asc' ? '▲' : '▼'}</span> : null;

    const handleExport = async (fmt: string) => {
        const { ok, data } = await apiCall('/mock-api/admin/audit/export', 'POST', { format: fmt });
        if (ok) toast.success(`Export ${fmt.toUpperCase()}`, data.message);
        else toast.error('Export failed', data.message || 'Error');
        trigger();
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetAll(); break;
                case 'ArrowLeft': setPage(p => Math.max(1, p - 1)); break;
                case 'ArrowRight': setPage(p => Math.min(totalPages || 1, p + 1)); break;
                case 'Escape': if (selEntry) setSelEntry(null); else setShowShortcuts(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [resetAll, totalPages, selEntry]);

    // Severity stats
    const sevStats: Record<string, number> = {};
    (Object.keys(severityConfig) as Severity[]).forEach(sv => { sevStats[sv] = entries.filter(e => e.severity === sv).length; });

    const sel: React.CSSProperties = { padding: '8px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', width: '100%' };

    return (<><PageMeta title="Audit Log" /><div data-testid="admin-audit-page">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📋</div>
                <div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Audit Log</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>Immutable trail · {totalCount} entries · ClickHouse backend · SHA-256 integrity</p></div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleExport('csv')} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>📤 CSV</button>
                <button onClick={() => handleExport('pdf')} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>📤 PDF</button>
            </div>
        </div>

        {/* Severity KPI chips */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {(Object.entries(severityConfig) as [Severity, { label: string; color: string }][]).map(([k, v]) => (
                <button key={k} onClick={() => { setFSeverity(fSeverity === k ? '' : k); setPage(1); trigger(); }} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${fSeverity === k ? v.color + '40' : theme.border}`, background: fSeverity === k ? `${v.color}08` : 'transparent', color: fSeverity === k ? v.color : theme.textDim, fontSize: 11, fontWeight: fSeverity === k ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: v.color }} />{v.label}<span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 10 }}>{sevStats[k]}</span>
                </button>
            ))}
            <span style={{ fontSize: 11, color: theme.textDim, alignSelf: 'center', marginLeft: 4 }}>Total: <strong style={{ color: theme.text }}>{totalCount}</strong></span>
        </div>

        {/* Search + filter toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 14px' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                <input ref={searchRef} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search description, target, user, IP..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '10px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', minWidth: 0 }} />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', fontSize: 12, padding: 2 }}>✕</button>}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} style={{ padding: '0 14px', borderRadius: 8, border: `1px solid ${showFilters ? '#8b5cf6' : theme.border}`, background: showFilters ? '#8b5cf608' : 'transparent', color: showFilters ? '#8b5cf6' : theme.textSecondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="6" y1="12" x2="10" y2="12"/></svg>
                Filters{filterCount > 0 && <span style={{ background: '#8b5cf6', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8 }}>{filterCount}</span>}
            </button>
        </div>

        {/* Filter panel */}
        {showFilters && <div style={{ padding: 16, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgInput, marginBottom: 16 }}>
            <div className="aud-filters">
                <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Action</label><select value={fAction} onChange={e => { setFAction(e.target.value as ActionType | ''); setPage(1); }} style={sel}><option value="">All Actions</option>{(Object.entries(actionConfig) as [ActionType, { label: string }][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Module</label><select value={fModule} onChange={e => { setFModule(e.target.value as Module | ''); setPage(1); }} style={sel}><option value="">All Modules</option>{(Object.entries(moduleConfig) as [Module, { label: string; icon: string }][]).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>User</label><select value={fUser} onChange={e => { setFUser(e.target.value); setPage(1); }} style={sel}><option value="">All Users</option>{users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}</select></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>IP Address</label><input value={fIp} onChange={e => { setFIp(e.target.value); setPage(1); }} placeholder="e.g. 10.0.1" style={sel} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Date From</label><input type="date" value={fDateFrom} onChange={e => { setFDateFrom(e.target.value); setPage(1); }} style={sel} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Date To</label><input type="date" value={fDateTo} onChange={e => { setFDateTo(e.target.value); setPage(1); }} style={sel} /></div>
            </div>
            {filterCount > 0 && <div style={{ marginTop: 10 }}><button onClick={resetAll} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 5, padding: '5px 12px', fontSize: 11, color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Clear all filters</button></div>}
        </div>}

        {/* Table */}
        {loading ? <div style={{ borderRadius: 12, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${theme.border}06`, alignItems: 'center' }}><Skel w={90} h={12} /><Skel w={80} h={12} /><Skel w={60} h={18} /><Skel w={60} h={18} /><div style={{ flex: 1 }}><Skel w="80%" h={12} /></div><Skel w={80} h={12} /></div>)}</div> : <>

        <div className="aud-table-wrap">
            <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', minWidth: 1000 }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '130px 110px 95px 70px 100px 1fr 90px', padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' as const }}>
                    <span onClick={() => toggleSort('timestamp')}>Timestamp <SI col="timestamp" /></span>
                    <span onClick={() => toggleSort('user')}>User <SI col="user" /></span>
                    <span onClick={() => toggleSort('action')}>Action <SI col="action" /></span>
                    <span onClick={() => toggleSort('severity')}>Severity <SI col="severity" /></span>
                    <span onClick={() => toggleSort('module')}>Module <SI col="module" /></span>
                    <span>Description</span>
                    <span>IP</span>
                </div>

                {paged.length === 0 ? <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 32, opacity: 0.15 }}>📋</div><div style={{ fontSize: 14, fontWeight: 600, color: theme.textSecondary, marginTop: 6 }}>No entries match</div><button onClick={resetAll} style={{ marginTop: 8, padding: '6px 14px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button></div> :
                paged.map((e, i) => { const ac = actionConfig[e.action]; const sc = severityConfig[e.severity]; const mc = moduleConfig[e.module]; const on = selEntry === e.id;
                    return <div key={e.id} className="aud-row" onClick={() => setSelEntry(on ? null : e.id)} style={{ display: 'grid', gridTemplateColumns: '130px 110px 95px 70px 100px 1fr 90px', padding: '9px 14px', borderBottom: i < paged.length - 1 ? `1px solid ${theme.border}06` : 'none', alignItems: 'center', gap: 8, cursor: 'pointer', background: on ? `${sc.color}04` : 'transparent', borderLeft: `3px solid ${on ? sc.color : 'transparent'}`, fontSize: 11 }}>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: theme.textDim }}>{e.timestamp.slice(5)}</span>
                        <div style={{ minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{e.user}</div><div style={{ fontSize: 9, color: theme.textDim }}>{e.userRole}</div></div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: ac.color, display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ fontSize: 11 }}>{ac.icon}</span>{ac.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${sc.color}12`, color: sc.color, textAlign: 'center' as const }}>{sc.label}</span>
                        <span style={{ fontSize: 10, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ fontSize: 10 }}>{mc.icon}</span>{mc.label.length > 12 ? mc.label.slice(0, 11) + '…' : mc.label}</span>
                        <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, color: theme.textSecondary, fontSize: 11 }}><span style={{ color: theme.text, fontWeight: 500 }}>{e.target}</span> — {e.description.slice(0, 80)}{e.description.length > 80 ? '…' : ''}</div>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: e.ip.startsWith('192') ? '#ef4444' : theme.textDim }}>{e.ip}</span>
                    </div>;
                })}
            </div>
        </div>

        {/* Mobile cards */}
        <div className="aud-mobile-cards">{paged.map(e => { const ac = actionConfig[e.action]; const sc = severityConfig[e.severity]; const mc = moduleConfig[e.module];
            return <div key={e.id} onClick={() => setSelEntry(selEntry === e.id ? null : e.id)} style={{ padding: 14, borderRadius: 10, border: `1px solid ${selEntry === e.id ? sc.color + '30' : theme.border}`, background: theme.bgCard, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: ac.color }}>{ac.icon} {ac.label}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: `${sc.color}12`, color: sc.color }}>{sc.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 9, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{e.timestamp.slice(5, 16)}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 3 }}>{e.target}</div>
                <div style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4 }}>{e.description.slice(0, 100)}{e.description.length > 100 ? '…' : ''}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: theme.textDim }}><span>👤 {e.user}</span><span>{mc.icon} {mc.label}</span><span style={{ color: e.ip.startsWith('192') ? '#ef4444' : theme.textDim }}>{e.ip}</span></div>
            </div>;
        })}</div>
        </>}

        {/* Pagination */}
        {!loading && totalPages > 1 && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: theme.textSecondary }}>Page {page}/{totalPages} · {totalCount} entries</span>
            <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'none', color: page === 1 ? theme.textDim : theme.textSecondary, fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => { const pg = page <= 3 ? i + 1 : Math.min(page - 2 + i, totalPages - 4 + i + 1); if (pg < 1 || pg > totalPages) return null; return <button key={pg} onClick={() => setPage(pg)} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${page === pg ? '#8b5cf6' : theme.border}`, background: page === pg ? '#8b5cf608' : 'none', color: page === pg ? '#8b5cf6' : theme.textSecondary, fontSize: 12, fontWeight: page === pg ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>{pg}</button>; })}
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'none', color: page === totalPages ? theme.textDim : theme.textSecondary, fontSize: 12, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
            </div>
        </div>}

        {/* Entry detail panel */}
        {entry && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setSelEntry(null); }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 600, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{actionConfig[entry.action].icon}</span>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>{actionConfig[entry.action].label}</div><div style={{ fontSize: 10, color: theme.textDim }}>{entry.timestamp}</div></div>
                    </div>
                    <button onClick={() => setSelEntry(null)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${severityConfig[entry.severity].color}12`, color: severityConfig[entry.severity].color, border: `1px solid ${severityConfig[entry.severity].color}25` }}>{severityConfig[entry.severity].label}</span>
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: `${theme.border}15`, color: theme.textSecondary }}>{moduleConfig[entry.module].icon} {moduleConfig[entry.module].label}</span>
                </div>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 16, padding: '14px 16px', borderRadius: 8, border: `1px solid ${theme.border}`, background: `${theme.border}04` }}>
                    {[{ l: 'User', v: `${entry.user} (${entry.userRole})` }, { l: 'Target', v: entry.target }, { l: 'IP Address', v: entry.ip }, { l: 'User Agent', v: entry.userAgent }, { l: 'Session ID', v: entry.sessionId }, { l: 'Timestamp', v: entry.timestamp }].map(r => <div key={r.l}><div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 2 }}>{r.l}</div><div style={{ fontSize: 11, color: theme.text, wordBreak: 'break-all' as const }}>{r.v}</div></div>)}
                </div>

                {/* Description */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>Description</div>
                    <div style={{ fontSize: 12, color: theme.text, lineHeight: 1.7, padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, background: `${theme.border}04` }}>{entry.description}</div>
                </div>

                {/* Metadata */}
                {entry.metadata && <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>Metadata</div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, background: `${theme.border}04` }}>
                        {Object.entries(entry.metadata).map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span style={{ fontSize: 11, color: theme.textDim }}>{k}</span><span style={{ fontSize: 11, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{v}</span></div>)}
                    </div>
                </div>}

                {/* Integrity */}
                <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid #22c55e20`, background: '#22c55e04' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' as const }}>Integrity Verified</span>
                    </div>
                    <div style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace", wordBreak: 'break-all' as const, marginBottom: 4 }}>Hash: {entry.integrityHash}</div>
                    <div style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace", wordBreak: 'break-all' as const }}>Prev: {entry.previousHash}</div>
                </div>
            </div>
        </div>}

        {/* Ctrl+Q */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="aud-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
            </div>
        </div>}
    </div></>);
}
AdminAudit.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
