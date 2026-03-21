import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '../ui';
import { useToast } from '../ui/Toast';
import { theme } from '../../lib/theme';
import { mockDevices, deviceTypes, deviceStatuses, deviceStatusColors, deviceTypeColors, type DeviceStatus, type DeviceType, type Device } from '../../mock/devices';

/* ═══ MULTISELECT FILTER ═══ */
function MSF({ selected, onChange, options, placeholder }: { selected: string[]; onChange: (v: string[]) => void; options: string[]; placeholder: string }) {
    const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const filtered = options.filter(o => o.toLowerCase().includes(q.toLowerCase()));
    const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
    const has = selected.length > 0;
    return (<div ref={ref} style={{ position: 'relative', minWidth: 0, flex: 1 }}><button onClick={() => { setOpen(!open); setQ(''); }} style={{ width: '100%', padding: '6px 8px', background: theme.bg, color: has ? theme.text : theme.textDim, border: `1px solid ${has ? theme.accent + '50' : theme.border}`, borderRadius: 5, fontSize: 10, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 3 }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, whiteSpace: 'nowrap' as const }}>{has ? `${placeholder} (${selected.length})` : placeholder}</span><svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4" /></svg></button>{open && <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: 170, marginTop: 3, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 7, zIndex: 80, maxHeight: 200, display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}><div style={{ padding: '4px 5px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 3, alignItems: 'center' }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus style={{ flex: 1, padding: '4px 6px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 3, fontSize: 10, fontFamily: 'inherit', outline: 'none', minWidth: 0 }} />{has && <button onClick={() => onChange([])} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: theme.danger, fontSize: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '2px 5px', borderRadius: 3, flexShrink: 0 }}>Clear</button>}</div><div style={{ overflowY: 'auto', flex: 1, padding: '2px 0' }}>{filtered.map(o => { const c = selected.includes(o); return <div key={o} onClick={() => toggle(o)} style={{ padding: '4px 8px', cursor: 'pointer', fontSize: 10, color: c ? theme.accent : theme.text, display: 'flex', alignItems: 'center', gap: 5 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><div style={{ width: 10, height: 10, borderRadius: 2, border: `1.5px solid ${c ? theme.accent : theme.border}`, background: c ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c && <svg width="5" height="5" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>{o}</div>; })}{filtered.length === 0 && <div style={{ padding: 10, fontSize: 10, color: theme.textDim, textAlign: 'center' }}>No results</div>}</div></div>}</div>);
}

/* ═══ CONTEXT MENU ═══ */
function CtxMenu({ x, y, onEdit, onShow, onDelete, onClose }: { x: number; y: number; onEdit: () => void; onShow: () => void; onDelete: () => void; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const Item = ({ label, icon, danger, onClick }: { label: string; icon: React.ReactNode; danger?: boolean; onClick: () => void }) => <button onClick={() => { onClick(); onClose(); }} style={{ width: '100%', padding: '6px 10px', background: 'transparent', border: 'none', color: danger ? theme.danger : theme.text, fontSize: 10, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, textAlign: 'left' as const, borderRadius: 3 }} onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{icon}{label}</button>;
    return (<div ref={ref} style={{ position: 'fixed', left: x, top: y, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 7, padding: 3, zIndex: 200, minWidth: 150, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', animation: 'argux-fadeIn 0.1s ease-out' }}>
        <Item label="Show Device" icon={<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="3"/><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/></svg>} onClick={onShow} />
        <Item label="Edit Device" icon={<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg>} onClick={onEdit} />
        <div style={{ height: 1, background: theme.border, margin: '2px 5px' }} />
        <Item label="Delete Device" danger icon={<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg>} onClick={onDelete} />
    </div>);
}

/* ═══ TOOLTIP BUTTON ═══ */
function TBtn({ tip, children, onClick, danger }: { tip: string; children: React.ReactNode; onClick: (e: React.MouseEvent) => void; danger?: boolean }) {
    const [show, setShow] = useState(false);
    return (<div style={{ position: 'relative', display: 'inline-flex' }}><button onClick={onClick} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} style={{ width: 24, height: 24, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: danger ? theme.danger : theme.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }} onMouseOver={e => { e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = danger ? theme.danger : theme.textSecondary; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = danger ? theme.danger : theme.textDim; }}>{children}</button>{show && <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 5, padding: '3px 7px', background: '#1a1f2e', border: `1px solid ${theme.border}`, borderRadius: 3, fontSize: 9, fontWeight: 600, color: theme.text, whiteSpace: 'nowrap' as const, zIndex: 50, pointerEvents: 'none' }}>{tip}</div>}</div>);
}

/* ═══ HELPERS ═══ */
function Signal({ v }: { v: number }) { return <div className="dev-signal">{[1,2,3,4,5].map(i => <div key={i} className="dev-signal-bar" style={{ height: i * 2 + 2, background: v >= i * 20 ? (v > 60 ? '#22c55e' : v > 30 ? '#f59e0b' : '#ef4444') : theme.border }} />)}</div>; }
function Battery({ v }: { v: number | null }) { if (v === null) return <span style={{ fontSize: 9, color: theme.textDim }}>AC</span>; return <div className="dev-battery"><div className="dev-battery-shell"><div className="dev-battery-fill" style={{ width: `${v}%`, background: v > 50 ? '#22c55e' : v > 20 ? '#f59e0b' : '#ef4444' }} /></div><span style={{ color: v > 20 ? theme.textSecondary : theme.danger }}>{v}%</span></div>; }
function StatusDot({ s }: { s: DeviceStatus }) { return <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="dev-status-dot" style={{ background: deviceStatusColors[s] }} /><span style={{ fontSize: 10, fontWeight: 600, color: deviceStatusColors[s] }}>{s}</span></div>; }
function TypeBadge({ t }: { t: DeviceType }) { const c = deviceTypeColors[t]; return <span className="dev-type-badge" style={{ background: `${c}12`, color: c, border: `1px solid ${c}30`, padding: '2px 6px', fontSize: 9 }}>{t}</span>; }
function getSignalLabel(v: number): string { if (v >= 80) return 'Excellent'; if (v >= 60) return 'Good'; if (v >= 40) return 'Fair'; if (v >= 20) return 'Weak'; return 'None'; }

interface Props { entityId: number; entityType: 'person' | 'organization'; entityName: string; }

export default function EntityDevices({ entityId, entityType, entityName }: Props) {
    const toast = useToast();
    const allDevices = mockDevices.filter(d => entityType === 'person' ? d.personId === entityId : d.orgId === entityId);
    const [search, setSearch] = useState('');
    const [fType, setFType] = useState<string[]>([]);
    const [fStatus, setFStatus] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [ctx, setCtx] = useState<{ x: number; y: number; deviceId: number } | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const filtered = allDevices.filter(d => {
        if (search && !`${d.name} ${d.uuid} ${d.manufacturer} ${d.model}`.toLowerCase().includes(search.toLowerCase())) return false;
        if (fType.length && !fType.includes(d.type)) return false;
        if (fStatus.length && !fStatus.includes(d.status)) return false;
        return true;
    });

    const activeFilterCount = [fType, fStatus].filter(a => a.length > 0).length;
    const clearAll = () => { setFType([]); setFStatus([]); };
    const handleDelete = () => { if (!deleteId) return; const dev = allDevices.find(d => d.id === deleteId); setDeleteId(null); toast.warning('Device removed', dev?.name || ''); };
    const handleCtx = (e: React.MouseEvent, id: number) => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY, deviceId: id }); };

    const typesAvail = [...new Set(allDevices.map(d => d.type))].sort();
    const statusAvail = [...new Set(allDevices.map(d => d.status))].sort();
    const counts = { total: allDevices.length, online: allDevices.filter(d => d.status === 'Online').length };

    if (allDevices.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: theme.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="8" rx="1"/><line x1="5" y1="14" x2="11" y2="14"/><line x1="8" y1="10" x2="8" y2="14"/></svg></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 4 }}>No Devices Assigned</div>
                <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 16 }}>No surveillance devices are currently assigned to {entityName}.</div>
                <button onClick={() => router.visit('/devices/create')} style={{ padding: '7px 16px', borderRadius: 6, background: theme.accent, color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Assign Device</button>
            </div>
        );
    }

    return (
        <div>
            {/* Delete modal */}
            {deleteId !== null && (() => { const dev = allDevices.find(d => d.id === deleteId); return <div onClick={() => setDeleteId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}><div onClick={e => e.stopPropagation()} style={{ background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 14, width: '100%', maxWidth: 380, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'argux-fadeIn 0.2s ease-out' }}><div style={{ textAlign: 'center', marginBottom: 14 }}><div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}><svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke={theme.danger} strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></div><h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Delete Device</h3><p style={{ fontSize: 12, color: theme.textSecondary, margin: 0 }}>Remove <strong style={{ color: theme.text }}>{dev?.name}</strong>?</p></div><div style={{ display: 'flex', gap: 8 }}><Button variant="secondary" onClick={() => setDeleteId(null)} style={{ flex: 1 }}>Cancel</Button><Button variant="danger" onClick={handleDelete} style={{ flex: 1 }}>Delete</Button></div></div></div>; })()}

            {/* Context menu */}
            {ctx && <CtxMenu x={ctx.x} y={ctx.y} onShow={() => router.visit(`/devices/${ctx.deviceId}`)} onEdit={() => router.visit(`/devices/${ctx.deviceId}/edit`)} onDelete={() => setDeleteId(ctx.deviceId)} onClose={() => setCtx(null)} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                <div style={{ fontSize: 11, color: theme.textSecondary }}>{counts.total} device{counts.total !== 1 ? 's' : ''} · {counts.online} online</div>
                <button onClick={() => router.visit('/devices/create')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 5, background: theme.accent, color: '#fff', border: 'none', fontSize: 10, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0 }}><svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>Assign</button>
            </div>

            {/* Search + Filter toggle */}
            <div style={{ display: 'flex', gap: 6, marginBottom: showFilters ? 0 : 10, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 8px', flex: 1 }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search devices..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '7px 0', color: theme.text, fontSize: 11, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />{search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', display: 'flex', padding: 1 }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}</div>
                {typesAvail.length > 1 && <button onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 6, background: showFilters || activeFilterCount > 0 ? theme.accentDim : theme.bgInput, color: showFilters || activeFilterCount > 0 ? theme.accent : theme.textSecondary, border: `1px solid ${showFilters || activeFilterCount > 0 ? theme.accent + '40' : theme.border}`, fontSize: 10, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0 }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 3h14M3 8h10M5 13h6"/></svg>Filters{activeFilterCount > 0 && <span style={{ background: theme.accent, color: '#fff', fontSize: 8, fontWeight: 700, padding: '0 4px', borderRadius: 6, lineHeight: '14px' }}>{activeFilterCount}</span>}</button>}
            </div>

            {/* Collapsible filters */}
            {showFilters && <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px 12px', marginBottom: 10, marginTop: 6, animation: 'argux-fadeIn 0.15s ease-out' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <MSF selected={fType} onChange={setFType} options={typesAvail} placeholder="Type" />
                    <MSF selected={fStatus} onChange={setFStatus} options={statusAvail} placeholder="Status" />
                    {activeFilterCount > 0 && <button onClick={clearAll} style={{ background: 'none', border: 'none', color: theme.danger, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>}
                </div>
            </div>}

            {/* Table */}
            <div style={{ border: `1px solid ${theme.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 650 }}>
                        <thead><tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${theme.border}` }}>
                            {['Name','Type','Status','Signal','Battery','Location','Last Seen','Actions'].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 9, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em', whiteSpace: 'nowrap' as const }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {filtered.length === 0 ? <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: theme.textDim, fontSize: 12 }}>No devices match your search.</td></tr> : filtered.map(d => (
                                <tr key={d.id} onContextMenu={e => handleCtx(e, d.id)} style={{ borderBottom: `1px solid ${theme.border}`, transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td style={{ padding: '8px 10px' }}><div style={{ fontWeight: 600, color: theme.text, cursor: 'pointer', whiteSpace: 'nowrap' as const }} onClick={() => router.visit(`/devices/${d.id}`)}>{d.name}</div><div style={{ fontSize: 9, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{d.uuid}</div></td>
                                    <td style={{ padding: '8px 10px' }}><TypeBadge t={d.type} /></td>
                                    <td style={{ padding: '8px 10px' }}><StatusDot s={d.status} /></td>
                                    <td style={{ padding: '8px 10px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Signal v={d.signalStrength} /><span style={{ fontSize: 9, color: theme.textDim }}>{d.signalStrength}%</span></div></td>
                                    <td style={{ padding: '8px 10px' }}><Battery v={d.batteryLevel} /></td>
                                    <td style={{ padding: '8px 10px', maxWidth: 130 }}><div style={{ fontSize: 10, color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.locationName}</div></td>
                                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' as const }}><span style={{ fontSize: 9, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{new Date(d.lastSeen).toLocaleString()}</span></td>
                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                                            <TBtn tip="Show Details" onClick={e => { e.stopPropagation(); router.visit(`/devices/${d.id}`); }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="3"/><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/></svg></TBtn>
                                            <TBtn tip="Edit" onClick={e => { e.stopPropagation(); router.visit(`/devices/${d.id}/edit`); }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg></TBtn>
                                            <TBtn tip="Delete" danger onClick={e => { e.stopPropagation(); setDeleteId(d.id); }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></TBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
