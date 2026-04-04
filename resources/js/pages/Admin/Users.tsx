import PageMeta from '../../components/layout/PageMeta';
import AdminLayout from '../../layouts/AdminLayout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { useToast } from '../../components/ui/Toast';
import { mockUsers as FALLBACK_USERS, statusConfig, departments, units, keyboardShortcuts } from '../../mock/admin-users';
import { mockRoles } from '../../mock/admin-roles';
import type { UserStatus, AppUser } from '../../mock/admin-users';

/**
 * ARGUX User Management — CRUD via mock REST API.
 *
 * GET    /mock-api/admin/users              — List (search, filter, sort, paginate)
 * GET    /mock-api/admin/users/{id}         — Detail
 * POST   /mock-api/admin/users              — Create
 * PUT    /mock-api/admin/users/{id}         — Update
 * DELETE /mock-api/admin/users/{id}         — Delete (blocks if active sessions)
 * PATCH  /mock-api/admin/users/{id}/status  — Toggle status
 * POST   /mock-api/admin/users/{id}/reset-password
 * POST   /mock-api/admin/users/{id}/reset-mfa
 * DELETE /mock-api/admin/users/{id}/sessions
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

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="usrm-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }

const userRoles = mockRoles.filter(r => r.scope === 'user');

export default function AdminUsers() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [sortCol, setSortCol] = useState<'lastName' | 'email' | 'roleName' | 'status' | 'lastLogin'>('lastName');
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

    const [fStatus, setFStatus] = useState<UserStatus | ''>('');
    const [fRole, setFRole] = useState('');
    const [fDept, setFDept] = useState('');
    const [fUnit, setFUnit] = useState('');
    const [fMfa, setFMfa] = useState('');

    const [fmFirst, setFmFirst] = useState(''); const [fmLast, setFmLast] = useState(''); const [fmEmail, setFmEmail] = useState('');
    const [fmPhone, setFmPhone] = useState(''); const [fmRoleId, setFmRoleId] = useState(12); const [fmDept, setFmDept] = useState('Operations');
    const [fmUnit, setFmUnit] = useState('HQ Staff'); const [fmNotes, setFmNotes] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true); trigger();
        const params = new URLSearchParams({ page: String(page), per_page: String(perPage), sort: sortCol, dir: sortDir });
        if (search) params.set('search', search);
        if (fStatus) params.set('status', fStatus);
        if (fRole) params.set('role', fRole);
        if (fDept) params.set('department', fDept);
        if (fUnit) params.set('unit', fUnit);
        if (fMfa) params.set('mfa', fMfa);
        const { ok, data } = await apiCall(`/mock-api/admin/users?${params}`);
        if (ok && data.data) {
            setUsers(data.data); setTotalCount(data.meta?.total || data.data.length);
            if (data.counts) setStatusCounts(data.counts);
        } else { setUsers(FALLBACK_USERS); setTotalCount(FALLBACK_USERS.length); }
        setLoading(false);
    }, [page, perPage, sortCol, sortDir, search, fStatus, fRole, fDept, fUnit, fMfa, trigger]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const filterCount = [fStatus, fRole, fDept, fUnit, fMfa].filter(Boolean).length;
    const resetAll = useCallback(() => { setSearch(''); setFStatus(''); setFRole(''); setFDept(''); setFUnit(''); setFMfa(''); setPage(1); trigger(); }, [trigger]);
    const clearForm = () => { setFmFirst(''); setFmLast(''); setFmEmail(''); setFmPhone(''); setFmRoleId(12); setFmDept('Operations'); setFmUnit('HQ Staff'); setFmNotes(''); };

    const openEdit = (u: AppUser) => { setFmFirst(u.firstName); setFmLast(u.lastName); setFmEmail(u.email); setFmPhone(u.phone); setFmRoleId(u.roleId); setFmDept(u.department); setFmUnit(u.unit); setFmNotes(u.notes); setEditId(u.id); setShowNew(false); };
    const openNew = () => { clearForm(); setEditId(null); setShowNew(true); };

    // Data already filtered/sorted/paged by API
    const paged = users;
    const totalPages = Math.ceil(totalCount / perPage);
    const detail = detailId ? users.find(u => u.id === detailId) : null;
    const toggleSort = (col: typeof sortCol) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } setPage(1); };
    const SI = ({ col }: { col: typeof sortCol }) => sortCol === col ? <span style={{ fontSize: 9, marginLeft: 2 }}>{sortDir === 'asc' ? '▲' : '▼'}</span> : null;

    const handleCreate = async () => { if (!fmFirst.trim() || !fmLast.trim() || !fmEmail.trim()) return; const { ok, data } = await apiCall('/mock-api/admin/users', 'POST', { first_name: fmFirst.trim(), last_name: fmLast.trim(), email: fmEmail.trim(), phone: fmPhone.trim(), role_id: fmRoleId, department: fmDept, unit: fmUnit, notes: fmNotes }); if (ok && data.data) { setUsers(prev => [data.data, ...prev]); setShowNew(false); clearForm(); trigger(); toast.success('User created', data.message); } else { toast.error('Error', data.errors?.email?.[0] || data.message || 'Failed.'); } };
    const handleUpdate = async () => { if (!editId || !fmFirst.trim() || !fmLast.trim() || !fmEmail.trim()) return; const { ok, data } = await apiCall(`/mock-api/admin/users/${editId}`, 'PUT', { first_name: fmFirst.trim(), last_name: fmLast.trim(), email: fmEmail.trim(), phone: fmPhone.trim(), role_id: fmRoleId, department: fmDept, unit: fmUnit, notes: fmNotes }); if (ok && data.data) { setUsers(prev => prev.map(u => u.id === editId ? { ...u, ...data.data } : u)); setEditId(null); clearForm(); trigger(); toast.success('User updated', data.message); } else { toast.error('Error', data.message || 'Failed.'); } };
    const handleDelete = async () => { if (!deleteId) return; const u = users.find(x => x.id === deleteId); const { ok, data } = await apiCall(`/mock-api/admin/users/${deleteId}`, 'DELETE'); if (ok) { setUsers(prev => prev.filter(x => x.id !== deleteId)); setDeleteId(null); if (detailId === deleteId) setDetailId(null); toast.success('User deleted', data.message); trigger(); } else { toast.error('Error', data.message || 'Failed.'); setDeleteId(null); } };
    const handleStatusToggle = async (id: number, ns: UserStatus) => { const { ok, data } = await apiCall(`/mock-api/admin/users/${id}/status`, 'PATCH', { status: ns }); if (ok) { setUsers(prev => prev.map(u => u.id === id ? { ...u, status: ns } : u)); toast.info('Status changed', data.message || statusConfig[ns].label); trigger(); } else { toast.error('Error', data.message); } };

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
    const gridCols = '44px 1fr 160px 110px 80px 90px 70px 100px';

    return (<><PageMeta title="User Management" /><div data-testid="admin-users-page">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👥</div><div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>User Management</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{users.length} operators · {users.filter(u => u.status === 'active').length} active · {users.filter(u => u.activeSessions > 0).length} online now</p></div></div>
            <button onClick={openNew} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>+ Add User</button>
        </div>

        {/* KPI */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {(Object.entries(statusConfig) as [UserStatus, any][]).map(([k, v]) => (<button key={k} onClick={() => { setFStatus(fStatus === k ? '' : k); setPage(1); trigger(); }} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${fStatus === k ? v.color + '40' : theme.border}`, background: fStatus === k ? `${v.color}08` : 'transparent', color: fStatus === k ? v.color : theme.textDim, fontSize: 11, fontWeight: fStatus === k ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>{v.icon} {v.label} <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 10 }}>{statusCounts[k] || 0}</span></button>))}
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 14px' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg><input ref={searchRef} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email, department, unit..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '10px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', minWidth: 0 }} />{search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', fontSize: 12 }}>✕</button>}</div>
            <button onClick={() => setShowFilters(!showFilters)} style={{ padding: '0 14px', borderRadius: 8, border: `1px solid ${showFilters ? '#3b82f6' : theme.border}`, background: showFilters ? '#3b82f608' : 'transparent', color: showFilters ? '#3b82f6' : theme.textSecondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>Filters{filterCount > 0 && <span style={{ background: '#3b82f6', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8 }}>{filterCount}</span>}</button>
        </div>
        {showFilters && <div style={{ padding: 14, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgInput, marginBottom: 14 }}><div className="usrm-filters">
            <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Role</label><select value={fRole} onChange={e => { setFRole(e.target.value); setPage(1); }} style={inp}><option value="">All</option>{userRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}</select></div>
            <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Dept</label><select value={fDept} onChange={e => { setFDept(e.target.value); setPage(1); }} style={inp}><option value="">All</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Unit</label><select value={fUnit} onChange={e => { setFUnit(e.target.value); setPage(1); }} style={inp}><option value="">All</option>{units.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
            <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>MFA</label><select value={fMfa} onChange={e => { setFMfa(e.target.value); setPage(1); }} style={inp}><option value="">All</option><option value="enrolled">Enrolled</option><option value="not">Not Enrolled</option></select></div>
        </div>{filterCount > 0 && <div style={{ marginTop: 10 }}><button onClick={resetAll} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 5, padding: '5px 12px', fontSize: 11, color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Clear all</button></div>}</div>}

        {/* Table */}
        {loading ? <div style={{ borderRadius: 12, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>{Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${theme.border}06`, alignItems: 'center' }}><Skel w={34} h={34} /><div style={{ flex: 1 }}><Skel w="50%" h={13} /><div style={{ height: 5 }} /><Skel w="35%" h={10} /></div><Skel w={80} h={18} /></div>)}</div> : <>
        <div className="usrm-table-wrap"><div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', minWidth: 920 }}>
            <div style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' as const }}>
                <span></span><span onClick={() => toggleSort('lastName')}>Name <SI col="lastName" /></span><span onClick={() => toggleSort('email')}>Email <SI col="email" /></span><span onClick={() => toggleSort('roleName')}>Role <SI col="roleName" /></span><span onClick={() => toggleSort('status')}>Status <SI col="status" /></span><span onClick={() => toggleSort('lastLogin')}>Last Login <SI col="lastLogin" /></span><span>MFA</span><span>Actions</span>
            </div>
            {paged.length === 0 ? <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 32, opacity: 0.15 }}>👥</div><div style={{ fontSize: 14, fontWeight: 600, color: theme.textSecondary, marginTop: 6 }}>No users found</div><button onClick={resetAll} style={{ marginTop: 8, padding: '6px 14px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button></div> :
            paged.map((u, i) => { const sc = statusConfig[u.status]; const rc = userRoles.find(r => r.id === u.roleId);
                return <div key={u.id} className="usrm-row" onClick={() => setDetailId(u.id)} style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '9px 14px', borderBottom: i < paged.length - 1 ? `1px solid ${theme.border}06` : 'none', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 11 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: `${rc?.color || '#6b7280'}15`, border: `1px solid ${rc?.color || '#6b7280'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: rc?.color || '#6b7280', flexShrink: 0 }}>{u.firstName[0]}{u.lastName[0]}</div>
                    <div style={{ minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{u.firstName} {u.lastName}</div><div style={{ fontSize: 10, color: theme.textDim }}>{u.department} · {u.unit}</div></div>
                    <span style={{ fontSize: 11, color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{u.email}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${rc?.color || '#6b7280'}12`, color: rc?.color || '#6b7280', border: `1px solid ${rc?.color || '#6b7280'}20`, whiteSpace: 'nowrap' as const }}>{u.roleName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color }} /><span style={{ fontSize: 10, color: sc.color, fontWeight: 600 }}>{sc.label}</span></div>
                    <span style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{u.lastLogin === 'Never' ? '—' : u.lastLogin.slice(5, 16)}</span>
                    <div>{u.mfaEnrolled ? <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#22c55e12', color: '#22c55e' }}>✓</span> : <span style={{ fontSize: 9, color: '#ef4444' }}>✗</span>}</div>
                    <div style={{ display: 'flex', gap: 3 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(u)} title="Edit" style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.textSecondary, display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg></button>
                        <button onClick={() => handleStatusToggle(u.id, u.status === 'active' ? 'suspended' : 'active')} title={u.status === 'active' ? 'Suspend' : 'Activate'} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: u.status === 'active' ? '#f59e0b' : '#22c55e', display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">{u.status === 'active' ? <><rect x="3" y="3" width="4" height="10" rx="0.5"/><rect x="9" y="3" width="4" height="10" rx="0.5"/></> : <polygon points="4,2 14,8 4,14"/>}</svg></button>
                        <button onClick={() => setDeleteId(u.id)} title="Delete" style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: '#ef4444', display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></button>
                    </div>
                </div>; })}
        </div></div>

        {/* Mobile cards */}
        <div className="usrm-mobile-cards">{paged.map(u => { const sc = statusConfig[u.status]; const rc = userRoles.find(r => r.id === u.roleId);
            return <div key={u.id} onClick={() => setDetailId(u.id)} style={{ padding: 14, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgCard, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><div style={{ width: 36, height: 36, borderRadius: 8, background: `${rc?.color || '#6b7280'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: rc?.color, flexShrink: 0 }}>{u.firstName[0]}{u.lastName[0]}</div><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{u.firstName} {u.lastName}</div><div style={{ fontSize: 11, color: theme.textSecondary }}>{u.email}</div></div><div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.color }} /></div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${rc?.color}12`, color: rc?.color }}>{u.roleName}</span><span style={{ fontSize: 9, color: theme.textDim }}>{u.department} · {u.unit}</span></div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}><button onClick={() => openEdit(u)} style={{ padding: '5px 10px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button><button onClick={() => setDeleteId(u.id)} style={{ padding: '5px 10px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.2)', background: '#ef444406', color: '#ef4444', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button></div>
            </div>; })}</div>
        </>}

        {/* Pagination */}
        {!loading && totalPages > 1 && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 8 }}><span style={{ fontSize: 12, color: theme.textSecondary }}>Page {page}/{totalPages} · {totalCount} users</span><div style={{ display: 'flex', gap: 4 }}><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'none', color: page === 1 ? theme.textDim : theme.textSecondary, fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: page === 1 ? 0.4 : 1 }}>Prev</button><button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'none', color: page === totalPages ? theme.textDim : theme.textSecondary, fontSize: 12, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: page === totalPages ? 0.4 : 1 }}>Next</button></div></div>}

        {/* Detail */}
        {detail && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setDetailId(null); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 560, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}><div style={{ width: 44, height: 44, borderRadius: 10, background: `${userRoles.find(r => r.id === detail.roleId)?.color || '#6b7280'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: userRoles.find(r => r.id === detail.roleId)?.color }}>{detail.firstName[0]}{detail.lastName[0]}</div><div style={{ flex: 1 }}><div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>{detail.firstName} {detail.lastName}</div><div style={{ fontSize: 12, color: theme.textSecondary }}>{detail.email}</div></div><button onClick={() => setDetailId(null)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' as const }}>{[{ l: detail.roleName, c: userRoles.find(r => r.id === detail.roleId)?.color || '#6b7280' }, { l: statusConfig[detail.status].label, c: statusConfig[detail.status].color }].map(b => <span key={b.l} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${b.c}12`, color: b.c, border: `1px solid ${b.c}25` }}>{b.l}</span>)}{detail.mfaEnrolled ? <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#22c55e12', color: '#22c55e' }}>MFA ✓</span> : <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#ef444412', color: '#ef4444' }}>MFA ✗</span>}{detail.activeSessions > 0 && <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#22c55e12', color: '#22c55e' }}>🟢 {detail.activeSessions} session{detail.activeSessions > 1 ? 's' : ''}</span>}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', padding: '14px 16px', borderRadius: 8, border: `1px solid ${theme.border}`, background: `${theme.border}04`, marginBottom: 14 }}>{[{ l: 'Phone', v: detail.phone }, { l: 'Department', v: detail.department }, { l: 'Unit', v: detail.unit }, { l: 'Last Login', v: detail.lastLogin }, { l: 'Last IP', v: detail.lastIp }, { l: 'Logins', v: String(detail.loginCount) }, { l: 'Created', v: `${detail.createdAt} by ${detail.createdBy}` }, { l: 'Failed Attempts', v: String(detail.failedAttempts) }].map(r => <div key={r.l}><div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 2 }}>{r.l}</div><div style={{ fontSize: 11, color: theme.text }}>{r.v}</div></div>)}</div>
            {detail.notes && <div style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: `${theme.border}04`, fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>{detail.notes}</div>}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}><button onClick={() => { setDetailId(null); openEdit(detail); }} style={{ flex: 1, padding: '9px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>✏️ Edit</button><button onClick={() => handleStatusToggle(detail.id, detail.status === 'active' ? 'suspended' : 'active')} style={{ flex: 1, padding: '9px', borderRadius: 6, border: `1px solid ${detail.status === 'active' ? '#f59e0b30' : '#22c55e30'}`, background: detail.status === 'active' ? '#f59e0b06' : '#22c55e06', color: detail.status === 'active' ? '#f59e0b' : '#22c55e', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>{detail.status === 'active' ? '⏸ Suspend' : '▶ Activate'}</button><button onClick={() => { setDetailId(null); setDeleteId(detail.id); }} style={{ padding: '9px 14px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: '#ef444406', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️</button></div>
        </div></div>}

        {/* Create/Edit */}
        {(showNew || editId !== null) && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) { setShowNew(false); setEditId(null); } }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>{editId ? '✏️ Edit User' : '👥 New User'}</div><button onClick={() => { setShowNew(false); setEditId(null); }} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                <div style={{ display: 'flex', gap: 10 }}><div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>First *</label><input value={fmFirst} onChange={e => setFmFirst(e.target.value)} style={inp} autoFocus /></div><div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Last *</label><input value={fmLast} onChange={e => setFmLast(e.target.value)} style={inp} /></div></div>
                <div style={{ display: 'flex', gap: 10 }}><div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Email *</label><input type="email" value={fmEmail} onChange={e => setFmEmail(e.target.value)} style={inp} /></div><div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Phone</label><input value={fmPhone} onChange={e => setFmPhone(e.target.value)} style={inp} /></div></div>
                <div style={{ display: 'flex', gap: 10 }}><div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Role</label><select value={fmRoleId} onChange={e => setFmRoleId(Number(e.target.value))} style={inp}>{userRoles.map(r => <option key={r.id} value={r.id}>{r.name} (Lvl {r.level})</option>)}</select></div><div style={{ flex: 1 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Department</label><select value={fmDept} onChange={e => setFmDept(e.target.value)} style={inp}>{departments.map(d => <option key={d}>{d}</option>)}</select></div></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Unit</label><select value={fmUnit} onChange={e => setFmUnit(e.target.value)} style={inp}>{units.map(u => <option key={u}>{u}</option>)}</select></div>
                <div><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Notes</label><textarea value={fmNotes} onChange={e => setFmNotes(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' as const }} /></div>
                <div style={{ display: 'flex', gap: 10 }}><button onClick={() => { setShowNew(false); setEditId(null); }} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button><button onClick={editId ? handleUpdate : handleCreate} disabled={!fmFirst.trim() || !fmLast.trim() || !fmEmail.trim()} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: fmFirst.trim() && fmLast.trim() && fmEmail.trim() ? '#3b82f6' : theme.border, color: '#fff', fontSize: 13, fontWeight: 700, cursor: fmFirst.trim() && fmLast.trim() && fmEmail.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>{editId ? 'Save' : 'Create User'}</button></div>
            </div>
        </div></div>}

        {/* Delete */}
        {deleteId !== null && (() => { const u = users.find(x => x.id === deleteId); if (!u) return null; return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setDeleteId(null)}><div onClick={e => e.stopPropagation()} style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 28, textAlign: 'center' as const, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, textAlign: 'center', margin: '0 0 8px' }}>Delete User</h3>
            <p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', margin: '0 0 20px' }}>Remove <strong>{u.firstName} {u.lastName}</strong> ({u.email})?</p>
            <div style={{ display: 'flex', gap: 10 }}><button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button><button onClick={handleDelete} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button></div>
        </div></div>; })()}

        {/* Ctrl+Q */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>{keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="usrm-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}<div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div></div></div>}
    </div></>);
}
AdminUsers.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
