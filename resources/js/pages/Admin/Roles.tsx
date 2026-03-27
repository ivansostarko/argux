import PageMeta from '../../components/layout/PageMeta';
import AdminLayout from '../../layouts/AdminLayout';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { useToast } from '../../components/ui/Toast';
import { mockRoles, modules, permActions, keyboardShortcuts } from '../../mock/admin-roles';
import type { RoleScope, PermAction, Role, RolePermission } from '../../mock/admin-roles';

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="rolm-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }

export default function AdminRoles() {
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState(mockRoles);
    const [search, setSearch] = useState('');
    const [scopeF, setScopeF] = useState<RoleScope | ''>('');
    const [selRole, setSelRole] = useState<number | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();
    const toast = useToast();

    const [fmName, setFmName] = useState(''); const [fmScope, setFmScope] = useState<RoleScope>('user');
    const [fmColor, setFmColor] = useState('#3b82f6'); const [fmDesc, setFmDesc] = useState('');
    const [fmLevel, setFmLevel] = useState(3); const [fmPerms, setFmPerms] = useState<RolePermission[]>([]);

    useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

    const resetAll = useCallback(() => { setSearch(''); setScopeF(''); trigger(); }, [trigger]);
    const clearForm = () => { setFmName(''); setFmScope('user'); setFmColor('#3b82f6'); setFmDesc(''); setFmLevel(3); setFmPerms(modules.map(m => ({ moduleId: m.id, actions: [] }))); };

    const openEdit = (r: Role) => { setFmName(r.name); setFmScope(r.scope); setFmColor(r.color); setFmDesc(r.description); setFmLevel(r.level); setFmPerms(modules.map(m => { const rp = r.permissions.find(p => p.moduleId === m.id); return { moduleId: m.id, actions: rp ? [...rp.actions] : [] }; })); setEditId(r.id); setShowNew(false); };
    const openNew = () => { clearForm(); setEditId(null); setShowNew(true); };

    const filtered = useMemo(() => {
        let r = roles;
        if (scopeF) r = r.filter(x => x.scope === scopeF);
        if (search) { const q = search.toLowerCase(); r = r.filter(x => x.name.toLowerCase().includes(q) || x.description.toLowerCase().includes(q)); }
        return r.sort((a, b) => b.level - a.level);
    }, [roles, scopeF, search]);

    const role = selRole ? roles.find(r => r.id === selRole) : null;
    const sections = [...new Set(modules.map(m => m.section))];

    const togglePerm = (moduleId: string, action: PermAction) => {
        setFmPerms(prev => prev.map(p => p.moduleId === moduleId ? { ...p, actions: p.actions.includes(action) ? p.actions.filter(a => a !== action) : [...p.actions, action] } : p));
    };
    const toggleAll = (moduleId: string) => {
        setFmPerms(prev => prev.map(p => p.moduleId === moduleId ? { ...p, actions: p.actions.length === permActions.length ? [] : permActions.map(a => a.id) } : p));
    };
    const toggleSection = (section: string) => {
        const mods = modules.filter(m => m.section === section).map(m => m.id);
        const allFull = mods.every(mid => { const p = fmPerms.find(x => x.moduleId === mid); return p && p.actions.length === permActions.length; });
        setFmPerms(prev => prev.map(p => mods.includes(p.moduleId) ? { ...p, actions: allFull ? [] : permActions.map(a => a.id) } : p));
    };

    const handleCreate = () => { if (!fmName.trim()) return; const nr: Role = { id: Date.now(), name: fmName.trim(), scope: fmScope, color: fmColor, description: fmDesc, level: fmLevel, isSystem: false, permissions: fmPerms.filter(p => p.actions.length > 0), userCount: 0, createdAt: new Date().toISOString().slice(0, 10), createdBy: 'Col. Tomić' }; setRoles([...roles, nr]); setShowNew(false); clearForm(); trigger(); toast.success('Role created', fmName); };
    const handleUpdate = () => { if (!editId || !fmName.trim()) return; setRoles(prev => prev.map(r => r.id === editId ? { ...r, name: fmName.trim(), scope: fmScope, color: fmColor, description: fmDesc, level: fmLevel, permissions: fmPerms.filter(p => p.actions.length > 0) } : r)); setEditId(null); clearForm(); trigger(); toast.success('Role updated', fmName); };
    const handleDelete = () => { if (!deleteId) return; const r = roles.find(x => x.id === deleteId); setRoles(prev => prev.filter(x => x.id !== deleteId)); setDeleteId(null); if (selRole === deleteId) setSelRole(null); toast.success('Role deleted', r?.name || ''); trigger(); };
    const handleDuplicate = (r: Role) => { const dup: Role = { ...r, id: Date.now(), name: `${r.name} (Copy)`, isSystem: false, userCount: 0, createdAt: new Date().toISOString().slice(0, 10), createdBy: 'Col. Tomić', permissions: r.permissions.map(p => ({ ...p, actions: [...p.actions] })) }; setRoles([...roles, dup]); trigger(); toast.success('Role duplicated', dup.name); };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) { case 'n': case 'N': if (!e.ctrlKey && !e.metaKey) openNew(); break; case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break; case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetAll(); break; case 'Escape': setShowShortcuts(false); setShowNew(false); setEditId(null); setDeleteId(null); setSelRole(null); break; }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [resetAll]);

    const permMatrix = (perms: RolePermission[], readOnly: boolean) => (
        <div className="rolm-perm-grid"><table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 650 }}>
            <thead><tr><th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, fontWeight: 700, color: theme.textDim, borderBottom: `1px solid ${theme.border}` }}>Module</th>{permActions.map(a => <th key={a.id} style={{ padding: '6px 4px', fontSize: 9, fontWeight: 700, color: theme.textDim, textAlign: 'center', width: 36, borderBottom: `1px solid ${theme.border}` }}>{a.short}</th>)}<th style={{ width: 36, borderBottom: `1px solid ${theme.border}` }}></th></tr></thead>
            <tbody>{sections.map(sec => {
                const mods = modules.filter(m => m.section === sec);
                return [
                    <tr key={`sec-${sec}`}><td colSpan={permActions.length + 2} style={{ padding: '8px 8px 4px', fontSize: 10, fontWeight: 800, color: theme.text, letterSpacing: '0.06em', textTransform: 'uppercase' as const, borderTop: `1px solid ${theme.border}20`, cursor: readOnly ? 'default' : 'pointer' }} onClick={() => !readOnly && toggleSection(sec)}>{sec}</td></tr>,
                    ...mods.map(m => { const mp = perms.find(p => p.moduleId === m.id); const acts = mp?.actions || [];
                        return <tr key={m.id}><td style={{ padding: '4px 8px 4px 16px', fontSize: 11, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' as const }}><span style={{ fontSize: 11 }}>{m.icon}</span>{m.label}</td>
                            {permActions.map(a => { const has = acts.includes(a.id); return <td key={a.id} style={{ textAlign: 'center', padding: '3px' }}>
                                <div className="rolm-perm-cell" onClick={() => !readOnly && togglePerm(m.id, a.id)} style={{ background: has ? '#22c55e18' : `${theme.border}08`, color: has ? '#22c55e' : `${theme.border}40`, border: `1px solid ${has ? '#22c55e30' : theme.border}20`, margin: '0 auto', cursor: readOnly ? 'default' : 'pointer' }}>{has ? '✓' : ''}</div>
                            </td>; })}
                            <td style={{ textAlign: 'center', padding: '3px' }}>{!readOnly && <div className="rolm-perm-cell" onClick={() => toggleAll(m.id)} style={{ background: acts.length === permActions.length ? '#3b82f618' : `${theme.border}08`, color: acts.length === permActions.length ? '#3b82f6' : theme.textDim, border: `1px solid ${theme.border}20`, margin: '0 auto', fontSize: 8 }} title="Toggle all">⊕</div>}</td>
                        </tr>; })
                ];
            })}</tbody>
        </table></div>
    );

    return (<><PageMeta title="Role Management" /><div data-testid="admin-roles-page">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔑</div><div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Role Management</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{roles.length} roles · {modules.length} modules · {permActions.length} permission types</p></div></div>
            <button onClick={openNew} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>+ New Role</button>
        </div>

        {/* Scope filter + search */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4 }}>{([['', 'All'], ['admin', '🛡️ Admin Roles'], ['user', '👥 User Roles']] as const).map(([k, l]) => <button key={k} onClick={() => { setScopeF(k as any); trigger(); }} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${scopeF === k ? '#8b5cf640' : theme.border}`, background: scopeF === k ? '#8b5cf608' : 'transparent', color: scopeF === k ? '#8b5cf6' : theme.textDim, fontSize: 12, fontWeight: scopeF === k ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{l} <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{k ? roles.filter(r => r.scope === k).length : roles.length}</span></button>)}</div>
            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 14px' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg><input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', minWidth: 0 }} /></div>
        </div>

        {/* Role cards */}
        {loading ? <div className="rolm-cards">{Array.from({ length: 6 }).map((_, i) => <Skel key={i} w="100%" h={120} />)}</div> :
        filtered.length === 0 ? <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.15 }}>🔑</div><div style={{ fontSize: 15, fontWeight: 600, color: theme.textSecondary, marginTop: 6 }}>No roles found</div></div> :
        <div className="rolm-cards">
            {filtered.map(r => { const permCount = r.permissions.reduce((s, p) => s + p.actions.length, 0); const isSel = selRole === r.id;
                return <div key={r.id} className="rolm-card" onClick={() => setSelRole(isSel ? null : r.id)} style={{ padding: 16, borderRadius: 10, border: `1px solid ${isSel ? r.color + '40' : theme.border}`, background: isSel ? `${r.color}04` : theme.bgCard, cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 10, height: 32, borderRadius: 3, background: r.color, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{r.name}</div><div style={{ fontSize: 10, color: theme.textDim }}>{r.scope === 'admin' ? '🛡️ Admin' : '👥 User'} · Level {r.level} {r.isSystem ? '· 🔒 System' : ''}</div></div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: r.color, fontFamily: "'JetBrains Mono',monospace" }}>{r.userCount}</span>
                    </div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5, marginBottom: 10 }}>{r.description.slice(0, 100)}{r.description.length > 100 ? '…' : ''}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3, background: `${r.color}12`, color: r.color, fontWeight: 700 }}>{permCount} permissions</span>
                        <span style={{ fontSize: 9, color: theme.textDim }}>Created {r.createdAt}</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleDuplicate(r)} title="Duplicate" style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.textSecondary, display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="5" y="5" width="9" height="9" rx="1"/><path d="M2 11V3a1 1 0 011-1h8"/></svg></button>
                            <button onClick={() => openEdit(r)} title="Edit" style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.textSecondary, display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg></button>
                            {!r.isSystem && <button onClick={() => setDeleteId(r.id)} title="Delete" style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: '#ef4444', display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></button>}
                        </div>
                    </div>
                </div>; })}
        </div>}

        {/* Selected role permission matrix (read-only) */}
        {role && <div style={{ marginTop: 20, padding: 20, borderRadius: 12, border: `1px solid ${role.color}20`, background: `${role.color}02` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 8, height: 28, borderRadius: 3, background: role.color }} />
                <div><div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{role.name} — Permission Matrix</div><div style={{ fontSize: 11, color: theme.textDim }}>{role.scope === 'admin' ? '🛡️ Admin' : '👥 User'} · Level {role.level} · {role.permissions.reduce((s, p) => s + p.actions.length, 0)} permissions across {role.permissions.filter(p => p.actions.length > 0).length} modules</div></div>
                <button onClick={() => setSelRole(null)} style={{ marginLeft: 'auto', width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 8, display: 'flex', gap: 10 }}>{permActions.map(a => <span key={a.id}><strong>{a.short}</strong> = {a.label}</span>)}</div>
            {permMatrix(role.permissions, true)}
        </div>}

        {/* Create/Edit Modal */}
        {(showNew || editId !== null) && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) { setShowNew(false); setEditId(null); } }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 800, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>{editId ? '✏️ Edit Role' : '🔑 New Role'}</div>
                    <button onClick={() => { setShowNew(false); setEditId(null); }} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 2, minWidth: 150 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Name *</label><input value={fmName} onChange={e => setFmName(e.target.value)} style={{ width: '100%', padding: '9px 12px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} autoFocus /></div>
                    <div style={{ flex: 1, minWidth: 100 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Scope</label><select value={fmScope} onChange={e => setFmScope(e.target.value as RoleScope)} style={{ width: '100%', padding: '9px 12px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}><option value="user">👥 User</option><option value="admin">🛡️ Admin</option></select></div>
                    <div style={{ width: 80 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Level</label><input type="number" min={1} max={10} value={fmLevel} onChange={e => setFmLevel(Number(e.target.value))} style={{ width: '100%', padding: '9px 12px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                    <div style={{ width: 60 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Color</label><input type="color" value={fmColor} onChange={e => setFmColor(e.target.value)} style={{ width: '100%', height: 38, padding: 2, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, cursor: 'pointer' }} /></div>
                </div>
                <div style={{ marginBottom: 14 }}><label style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, display: 'block', marginBottom: 3, textTransform: 'uppercase' as const }}>Description</label><textarea value={fmDesc} onChange={e => setFmDesc(e.target.value)} rows={2} style={{ width: '100%', padding: '9px 12px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const }} /></div>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>Permission Matrix — {fmPerms.reduce((s, p) => s + p.actions.length, 0)} selected</div>
                <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 8, display: 'flex', gap: 10 }}>{permActions.map(a => <span key={a.id}><strong>{a.short}</strong> = {a.label}</span>)}</div>
                {permMatrix(fmPerms, false)}
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button onClick={() => { setShowNew(false); setEditId(null); }} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                    <button onClick={editId ? handleUpdate : handleCreate} disabled={!fmName.trim()} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: fmName.trim() ? '#8b5cf6' : theme.border, color: '#fff', fontSize: 13, fontWeight: 700, cursor: fmName.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>{editId ? 'Save Changes' : 'Create Role'}</button>
                </div>
            </div>
        </div>}

        {/* Delete */}
        {deleteId !== null && (() => { const r = roles.find(x => x.id === deleteId); if (!r) return null; return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setDeleteId(null)}><div onClick={e => e.stopPropagation()} style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 28, textAlign: 'center' as const, marginBottom: 12 }}>🗑️</div><h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, textAlign: 'center', margin: '0 0 8px' }}>Delete Role</h3>
            <p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', margin: '0 0 6px' }}>Delete <strong>{r.name}</strong>?</p>
            <p style={{ fontSize: 11, color: theme.textDim, textAlign: 'center', margin: '0 0 20px' }}>{r.userCount} user{r.userCount !== 1 ? 's' : ''} assigned to this role will need reassignment.</p>
            <div style={{ display: 'flex', gap: 10 }}><button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button><button onClick={handleDelete} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button></div>
        </div></div>; })()}

        {/* Ctrl+Q */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>{keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="rolm-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}<div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div></div></div>}
    </div></>);
}
AdminRoles.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
