import PageMeta from '../../components/layout/PageMeta';
import AdminLayout from '../../layouts/AdminLayout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { useToast } from '../../components/ui/Toast';
import { mockAdmins as FALLBACK_ADMINS, statusConfig, roleConfig, departments, keyboardShortcuts } from '../../mock/admin-admins';
import type { AdminStatus, AdminRole, MfaMethod, Admin } from '../../mock/admin-admins';

/**
 * ARGUX Admin Management — CRUD via mock REST API.
 *
 * GET    /mock-api/admin/admins              — List (search, filter, sort, paginate)
 * GET    /mock-api/admin/admins/{id}         — Detail
 * POST   /mock-api/admin/admins              — Create
 * PUT    /mock-api/admin/admins/{id}         — Update
 * DELETE /mock-api/admin/admins/{id}         — Delete
 * PATCH  /mock-api/admin/admins/{id}/status  — Toggle status
 * POST   /mock-api/admin/admins/{id}/reset-password — Force password reset
 * POST   /mock-api/admin/admins/{id}/reset-mfa      — Force MFA re-enrollment
 * DELETE /mock-api/admin/admins/{id}/sessions        — Kill all sessions
 */

function getCsrf(): string { return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''); }
async function apiCall(url: string, method = 'GET', body?: any): Promise<any> {
    try {
        const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
    } catch { return { ok: false, status: 0, data: { message: 'Network error.' } }; }
}

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="adma-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }

export default function AdminAdmins() {
    const [loading, setLoading] = useState(true);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [sortCol, setSortCol] = useState<'lastName' | 'email' | 'role' | 'status' | 'lastLogin'>('lastName');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [showNew, setShowNew] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [detailId, setDetailId] = useState<number | null>(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [statusCounts, setStatusCounts] = useState<Record<string,number>>({});
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();
    const toast = useToast();
    const perPage = 10;

    // Filters
    const [fStatus, setFStatus] = useState<AdminStatus | ''>('');
    const [fRole, setFRole] = useState<AdminRole | ''>('');
    const [fDept, setFDept] = useState('');
    const [fMfa, setFMfa] = useState('');

    // Form state
    const [fmFirst, setFmFirst] = useState('');
    const [fmLast, setFmLast] = useState('');
    const [fmEmail, setFmEmail] = useState('');
    const [fmPhone, setFmPhone] = useState('');
    const [fmRole, setFmRole] = useState<AdminRole>('support_agent');
    const [fmDept, setFmDept] = useState('IT Infrastructure');
    const [fmNotes, setFmNotes] = useState('');

    // Fetch admins from API
    const fetchAdmins = useCallback(async () => {
        setLoading(true); trigger();
        const params = new URLSearchParams({ page: String(page), per_page: String(perPage), sort: sortCol, dir: sortDir });
        if (search) params.set('search', search);
        if (fStatus) params.set('status', fStatus);
        if (fRole) params.set('role', fRole);
        if (fDept) params.set('department', fDept);
        if (fMfa) params.set('mfa', fMfa);
        const { ok, data } = await apiCall(`/mock-api/admin/admins?${params}`);
        if (ok && data.data) {
            setAdmins(data.data);
            setTotalCount(data.meta?.total || data.data.length);
            if (data.counts) setStatusCounts(data.counts);
        } else {
            setAdmins(FALLBACK_ADMINS); setTotalCount(FALLBACK_ADMINS.length);
        }
        setLoading(false);
    }, [page, perPage, sortCol, sortDir, search, fStatus, fRole, fDept, fMfa, trigger]);

    useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

    const filterCount = [fStatus, fRole, fDept, fMfa].filter(Boolean).length;
    const resetAll = useCallback(() => { setSearch(''); setFStatus(''); setFRole(''); setFDept(''); setFMfa(''); setPage(1); trigger(); }, [trigger]);

    const clearForm = () => { setFmFirst(''); setFmLast(''); setFmEmail(''); setFmPhone(''); setFmRole('support_agent'); setFmDept('IT Infrastructure'); setFmNotes(''); };

    const openEdit = (admin: Admin) => {
        setFmFirst(admin.firstName); setFmLast(admin.lastName); setFmEmail(admin.email);
        setFmPhone(admin.phone); setFmRole(admin.role); setFmDept(admin.department); setFmNotes(admin.notes);
        setEditId(admin.id); setShowNew(false);
    };

    const openNew = () => { clearForm(); setEditId(null); setShowNew(true); };

    // Data is already filtered/sorted/paged by the API
    const paged = admins;
    const totalPages = Math.ceil(totalCount / perPage);
    const detail = detailId ? admins.find(a => a.id === detailId) : null;

    const toggleSort = (col: typeof sortCol) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } setPage(1); };
    const SI = ({ col }: { col: typeof sortCol }) => sortCol === col ? <span style={{ fontSize: 9, marginLeft: 2 }}>{sortDir === 'asc' ? '▲' : '▼'}</span> : null;

    const handleCreate = async () => {
        if (!fmFirst.trim() || !fmLast.trim() || !fmEmail.trim()) return;
        const { ok, data } = await apiCall('/mock-api/admin/admins', 'POST', { first_name: fmFirst.trim(), last_name: fmLast.trim(), email: fmEmail.trim(), phone: fmPhone.trim(), role: fmRole, department: fmDept, notes: fmNotes });
        if (ok && data.data) {
            setAdmins(prev => [data.data, ...prev]); setShowNew(false); clearForm(); trigger();
            toast.success('Admin created', data.message || `${fmFirst} ${fmLast}`);
        } else {
            toast.error('Error', data.errors?.email?.[0] || data.message || 'Create failed.');
        }
    };

    const handleUpdate = async () => {
        if (!editId || !fmFirst.trim() || !fmLast.trim() || !fmEmail.trim()) return;
        const { ok, data } = await apiCall(`/mock-api/admin/admins/${editId}`, 'PUT', { first_name: fmFirst.trim(), last_name: fmLast.trim(), email: fmEmail.trim(), phone: fmPhone.trim(), role: fmRole, department: fmDept, notes: fmNotes });
        if (ok && data.data) {
            setAdmins(prev => prev.map(a => a.id === editId ? { ...a, ...data.data } : a));
            setEditId(null); clearForm(); trigger();
            toast.success('Admin updated', data.message || `${fmFirst} ${fmLast} saved`);
        } else { toast.error('Error', data.message || 'Update failed.'); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const a = admins.find(x => x.id === deleteId);
        const { ok, data } = await apiCall(`/mock-api/admin/admins/${deleteId}`, 'DELETE');
        if (ok) {
            setAdmins(prev => prev.filter(x => x.id !== deleteId));
            setDeleteId(null); if (detailId === deleteId) setDetailId(null);
            toast.success('Admin deleted', data.message || `${a?.firstName} ${a?.lastName} removed`); trigger();
        } else { toast.error('Error', data.message || 'Delete failed.'); setDeleteId(null); }
    };

    const handleStatusToggle = async (id: number, newStatus: AdminStatus) => {
        const { ok, data } = await apiCall(`/mock-api/admin/admins/${id}/status`, 'PATCH', { status: newStatus });
        if (ok) {
            setAdmins(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            toast.info('Status changed', data.message || statusConfig[newStatus].label); trigger();
        } else { toast.error('Error', data.message || 'Status change failed.'); }
    };

    const handleForceReset = async (id: number) => {
        const { ok, data } = await apiCall(`/mock-api/admin/admins/${id}/reset-password`, 'POST');
        if (ok) toast.success('Password reset', data.message || 'Reset email sent.');
        else toast.error('Error', data.message || 'Reset failed.');
        trigger();
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case 'n': case 'N': if (!e.ctrlKey && !e.metaKey) openNew(); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetAll(); break;
                case 'ArrowLeft': setPage(p => Math.max(1, p - 1)); break;
                case 'ArrowRight': setPage(p => Math.min(totalPages || 1, p + 1)); break;
                case 'Escape': setShowShortcuts(false); setShowNew(false); setEditId(null); setDeleteId(null); setDetailId(null); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [resetAll, totalPages]);

    const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' };
    const gridCols = '44px 1fr 160px 120px 80px 110px 80px 110px';
    const Av = ({ a }: { a: Admin }) => <div style={{ width: 34, height: 34, borderRadius: 8, background: `${roleConfig[a.role].color}15`, border: `1px solid ${roleConfig[a.role].color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: roleConfig[a.role].color, flexShrink: 0 }}>{a.firstName[0]}{a.lastName[0]}</div>;

    return (<><PageMeta title="Admin Management" /><div data-testid="admin-admins-page">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🛡️</div>
                <div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Admin Management</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{admins.length} administrators · Keycloak SSO integrated</p></div>
            </div>
            <button onClick={openNew} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>Add Admin</button>
        </div>

        {/* Status KPI */}
        <div className="adma-kpi">
            {(Object.entries(statusConfig) as [AdminStatus, { label: string; color: string; icon: string }][]).map(([k, v]) => (
                <button key={k} onClick={() => { setFStatus(fStatus === k ? '' : k); setPage(1); trigger(); }} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${fStatus === k ? v.color + '40' : theme.border}`, background: fStatus === k ? `${v.color}08` : 'transparent', color: fStatus === k ? v.color : theme.textDim, fontSize: 11, fontWeight: fStatus === k ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {v.icon} {v.label} <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 10 }}>{statusCounts[k] || 0}</span>
                </button>
            ))}
            <span style={{ fontSize: 11, color: theme.textDim, alignSelf: 'center' }}>Total: <strong style={{ color: theme.text }}>{admins.length}</strong></span>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 14px' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                <input ref={searchRef} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email, department..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '10px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', minWidth: 0 }} />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', fontSize: 12, padding: 2 }}>✕</button>}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} style={{ padding: '0 14px', borderRadius: 8, border: `1px solid ${showFilters ? '#ef4444' : theme.border}`, background: showFilters ? '#ef444408' : 'transparent', color: showFilters ? '#ef4444' : theme.textSecondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="6" y1="12" x2="10" y2="12"/></svg>
                Filters{filterCount > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8 }}>{filterCount}</span>}
            </button>
        </div>

        {showFilters && <div style={{ padding: 14, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgInput, marginBottom: 14 }}>
            <div className="adma-filters">
                <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Role</label><select value={fRole} onChange={e => { setFRole(e.target.value as any); setPage(1); }} style={inp}><option value="">All Roles</option>{(Object.entries(roleConfig) as [AdminRole, any][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Department</label><select value={fDept} onChange={e => { setFDept(e.target.value); setPage(1); }} style={inp}><option value="">All Departments</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>MFA</label><select value={fMfa} onChange={e => { setFMfa(e.target.value); setPage(1); }} style={inp}><option value="">All</option><option value="enrolled">MFA Enrolled</option><option value="not_enrolled">Not Enrolled</option></select></div>
            </div>
            {filterCount > 0 && <div style={{ marginTop: 10 }}><button onClick={resetAll} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 5, padding: '5px 12px', fontSize: 11, color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Clear all</button></div>}
        </div>}

        {/* Table */}
        {loading ? <div style={{ borderRadius: 12, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>{Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${theme.border}06`, alignItems: 'center' }}><Skel w={34} h={34} /><div style={{ flex: 1 }}><Skel w="50%" h={13} /><div style={{ height: 5 }} /><Skel w="35%" h={10} /></div><Skel w={80} h={18} /><Skel w={55} h={18} /></div>)}</div> : <>

        <div className="adma-table-wrap">
            <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', minWidth: 900 }}>
                <div style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' as const }}>
                    <span></span>
                    <span onClick={() => toggleSort('lastName')}>Name <SI col="lastName" /></span>
                    <span onClick={() => toggleSort('email')}>Email <SI col="email" /></span>
                    <span onClick={() => toggleSort('role')}>Role <SI col="role" /></span>
                    <span onClick={() => toggleSort('status')}>Status <SI col="status" /></span>
                    <span onClick={() => toggleSort('lastLogin')}>Last Login <SI col="lastLogin" /></span>
                    <span>MFA</span>
                    <span>Actions</span>
                </div>

                {paged.length === 0 ? <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 32, opacity: 0.15 }}>🛡️</div><div style={{ fontSize: 14, fontWeight: 600, color: theme.textSecondary, marginTop: 6 }}>No admins found</div><button onClick={resetAll} style={{ marginTop: 8, padding: '6px 14px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button></div> :
                paged.map((a, i) => { const rc = roleConfig[a.role]; const sc = statusConfig[a.status];
                    return <div key={a.id} className="adma-row" onClick={() => setDetailId(a.id)} style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '9px 14px', borderBottom: i < paged.length - 1 ? `1px solid ${theme.border}06` : 'none', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 11 }}>
                        <Av a={a} />
                        <div style={{ minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{a.firstName} {a.lastName}</div><div style={{ fontSize: 10, color: theme.textDim }}>{a.department}</div></div>
                        <span style={{ fontSize: 11, color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{a.email}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${rc.color}12`, color: rc.color, border: `1px solid ${rc.color}20`, whiteSpace: 'nowrap' as const }}>{rc.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color }} /><span style={{ fontSize: 10, color: sc.color, fontWeight: 600 }}>{sc.label}</span></div>
                        <span style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{a.lastLogin === 'Never' ? '—' : a.lastLogin.slice(5, 16)}</span>
                        <div>{a.mfaEnrolled ? <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#22c55e12', color: '#22c55e' }}>✓ {a.mfa.toUpperCase()}</span> : <span style={{ fontSize: 9, fontWeight: 600, color: '#ef4444' }}>✗ None</span>}</div>
                        <div style={{ display: 'flex', gap: 3 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEdit(a)} title="Edit" style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.textSecondary, display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg></button>
                            <button onClick={() => handleStatusToggle(a.id, a.status === 'active' ? 'suspended' : 'active')} title={a.status === 'active' ? 'Suspend' : 'Activate'} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: a.status === 'active' ? '#f59e0b' : '#22c55e', display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">{a.status === 'active' ? <><rect x="3" y="3" width="4" height="10" rx="0.5"/><rect x="9" y="3" width="4" height="10" rx="0.5"/></> : <polygon points="4,2 14,8 4,14"/>}</svg></button>
                            <button onClick={() => setDeleteId(a.id)} title="Delete" style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: '#ef4444', display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></button>
                        </div>
                    </div>;
                })}
            </div>
        </div>

        {/* Mobile cards */}
        <div className="adma-mobile-cards">{paged.map(a => { const rc = roleConfig[a.role]; const sc = statusConfig[a.status];
            return <div key={a.id} onClick={() => setDetailId(a.id)} style={{ padding: 14, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgCard, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Av a={a} />
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{a.firstName} {a.lastName}</div><div style={{ fontSize: 11, color: theme.textSecondary }}>{a.email}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color }} /></div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 8 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${rc.color}12`, color: rc.color }}>{rc.label}</span>
                    <span style={{ fontSize: 9, color: theme.textDim }}>{a.department}</span>
                    {a.mfaEnrolled && <span style={{ fontSize: 9, color: '#22c55e' }}>MFA ✓</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(a)} style={{ padding: '5px 10px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                    <button onClick={() => setDeleteId(a.id)} style={{ padding: '5px 10px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.2)', background: '#ef444406', color: '#ef4444', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                </div>
            </div>;
        })}</div>
        </>}

        {/* Pagination */}
        {!loading && totalPages > 1 && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: theme.textSecondary }}>Page {page}/{totalPages} · {totalCount} admins</span>
            <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'none', color: page === 1 ? theme.textDim : theme.textSecondary, fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: page === 1 ? 0.4 : 1 }}>Prev</button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'none', color: page === totalPages ? theme.textDim : theme.textSecondary, fontSize: 12, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: page === totalPages ? 0.4 : 1 }}>Next</button>
            </div>
        </div>}

        {/* Detail modal */}
        {detail && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setDetailId(null); }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 580, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    <Av a={detail} />
                    <div style={{ flex: 1 }}><div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>{detail.firstName} {detail.lastName}</div><div style={{ fontSize: 12, color: theme.textSecondary }}>{detail.email} · {detail.department}</div></div>
                    <button onClick={() => setDetailId(null)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${roleConfig[detail.role].color}12`, color: roleConfig[detail.role].color, border: `1px solid ${roleConfig[detail.role].color}25` }}>{roleConfig[detail.role].label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${statusConfig[detail.status].color}12`, color: statusConfig[detail.status].color, border: `1px solid ${statusConfig[detail.status].color}25` }}>{statusConfig[detail.status].icon} {statusConfig[detail.status].label}</span>
                    {detail.mfaEnrolled ? <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#22c55e12', color: '#22c55e' }}>🔐 MFA: {detail.mfa.toUpperCase()}</span> : <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#ef444412', color: '#ef4444' }}>⚠ MFA Not Enrolled</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', padding: '14px 16px', borderRadius: 8, border: `1px solid ${theme.border}`, background: `${theme.border}04`, marginBottom: 14 }}>
                    {[{ l: 'Phone', v: detail.phone }, { l: 'Last Login', v: detail.lastLogin }, { l: 'Last IP', v: detail.lastIp }, { l: 'Login Count', v: String(detail.loginCount) }, { l: 'Created', v: detail.createdAt }, { l: 'Created By', v: detail.createdBy }, { l: 'Failed Attempts', v: String(detail.failedAttempts) }, ...(detail.lockedUntil ? [{ l: 'Locked Until', v: detail.lockedUntil }] : [])].map(r => <div key={r.l}><div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 2 }}>{r.l}</div><div style={{ fontSize: 11, color: r.l === 'Failed Attempts' && detail.failedAttempts > 0 ? '#ef4444' : theme.text, fontWeight: r.l === 'Failed Attempts' && detail.failedAttempts > 0 ? 700 : 400 }}>{r.v}</div></div>)}
                </div>
                {detail.notes && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 4 }}>Notes</div><div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6, padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: `${theme.border}04` }}>{detail.notes}</div></div>}
                {detail.sessions.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 4 }}>Active Sessions ({detail.sessions.length})</div>{detail.sessions.map(s => <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, border: `1px solid ${s.current ? '#22c55e20' : theme.border}`, marginBottom: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: s.current ? '#22c55e' : theme.textDim }} /><div style={{ flex: 1 }}><div style={{ fontSize: 11, color: theme.text }}>{s.device}</div><div style={{ fontSize: 10, color: theme.textDim }}>{s.ip} · {s.location}</div></div><span style={{ fontSize: 9, color: theme.textDim }}>{s.lastActive}</span></div>)}</div>}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    <button onClick={() => { setDetailId(null); openEdit(detail); }} style={{ flex: 1, padding: '9px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>✏️ Edit</button>
                    <button onClick={() => handleForceReset(detail.id)} style={{ flex: 1, padding: '9px', borderRadius: 6, border: `1px solid #f59e0b30`, background: '#f59e0b06', color: '#f59e0b', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>🔑 Reset Password</button>
                    <button onClick={() => handleStatusToggle(detail.id, detail.status === 'active' ? 'suspended' : 'active')} style={{ flex: 1, padding: '9px', borderRadius: 6, border: `1px solid ${detail.status === 'active' ? '#f59e0b30' : '#22c55e30'}`, background: detail.status === 'active' ? '#f59e0b06' : '#22c55e06', color: detail.status === 'active' ? '#f59e0b' : '#22c55e', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>{detail.status === 'active' ? '⏸ Suspend' : '▶ Activate'}</button>
                    <button onClick={() => { setDetailId(null); setDeleteId(detail.id); }} style={{ padding: '9px 14px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: '#ef444406', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️</button>
                </div>
            </div>
        </div>}

        {/* Create/Edit Modal */}
        {(showNew || editId !== null) && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) { setShowNew(false); setEditId(null); } }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>{editId ? '✏️ Edit Admin' : '🛡️ New Admin'}</div>
                    <button onClick={() => { setShowNew(false); setEditId(null); }} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>First Name *</label><input value={fmFirst} onChange={e => setFmFirst(e.target.value)} placeholder="First name" style={inp} autoFocus /></div>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Last Name *</label><input value={fmLast} onChange={e => setFmLast(e.target.value)} placeholder="Last name" style={inp} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Email *</label><input type="email" value={fmEmail} onChange={e => setFmEmail(e.target.value)} placeholder="admin@argux.mil" style={inp} /></div>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Phone</label><input value={fmPhone} onChange={e => setFmPhone(e.target.value)} placeholder="+385 91 ..." style={inp} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Role</label><select value={fmRole} onChange={e => setFmRole(e.target.value as AdminRole)} style={inp}>{(Object.entries(roleConfig) as [AdminRole, any][]).map(([k, v]) => <option key={k} value={k}>{v.label} (Lvl {v.level})</option>)}</select></div>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Department</label><select value={fmDept} onChange={e => setFmDept(e.target.value)} style={inp}>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                    </div>
                    <div style={{ fontSize: 10, color: roleConfig[fmRole].color, padding: '6px 10px', borderRadius: 5, background: `${roleConfig[fmRole].color}06`, border: `1px solid ${roleConfig[fmRole].color}15` }}><strong>{roleConfig[fmRole].label}</strong> — {roleConfig[fmRole].description}</div>
                    <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Notes</label><textarea value={fmNotes} onChange={e => setFmNotes(e.target.value)} placeholder="Internal notes..." rows={3} style={{ ...inp, resize: 'vertical' as const }} /></div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={() => { setShowNew(false); setEditId(null); }} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={editId ? handleUpdate : handleCreate} disabled={!fmFirst.trim() || !fmLast.trim() || !fmEmail.trim()} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: fmFirst.trim() && fmLast.trim() && fmEmail.trim() ? '#ef4444' : theme.border, color: '#fff', fontSize: 13, fontWeight: 700, cursor: fmFirst.trim() && fmLast.trim() && fmEmail.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>{editId ? 'Save Changes' : 'Create Admin'}</button>
                    </div>
                </div>
            </div>
        </div>}

        {/* Delete confirm */}
        {deleteId !== null && (() => { const a = admins.find(x => x.id === deleteId); if (!a) return null;
            return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setDeleteId(null)}>
                <div onClick={e => e.stopPropagation()} style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>🗑️</div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, textAlign: 'center', margin: '0 0 8px' }}>Delete Admin Account</h3>
                    <p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.6, margin: '0 0 6px' }}>Permanently delete <strong>{a.firstName} {a.lastName}</strong>?</p>
                    <p style={{ fontSize: 11, color: theme.textDim, textAlign: 'center', margin: '0 0 20px' }}>{a.email} · {roleConfig[a.role].label} · {a.sessions.length} active session{a.sessions.length !== 1 ? 's' : ''}</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={handleDelete} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                    </div>
                </div>
            </div>;
        })()}

        {/* Ctrl+Q */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="adma-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
            </div>
        </div>}
    </div></>);
}
AdminAdmins.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
