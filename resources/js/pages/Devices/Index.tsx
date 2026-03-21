import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { mockDevices, deviceTypes, deviceStatuses, deviceStatusColors, deviceTypeColors, type DeviceStatus, type DeviceType } from '../../mock/devices';

/* ═══ MULTISELECT FILTER ═══ */
function MSF({ selected, onChange, options, placeholder }: { selected: string[]; onChange: (v: string[]) => void; options: string[]; placeholder: string }) {
    const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const filtered = options.filter(o => o.toLowerCase().includes(q.toLowerCase()));
    const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
    const has = selected.length > 0;
    return (<div ref={ref} style={{ position: 'relative', minWidth: 0, flex: 1 }}><button onClick={() => { setOpen(!open); setQ(''); }} style={{ width: '100%', padding: '7px 10px', background: theme.bgInput, color: has ? theme.text : theme.textDim, border: `1px solid ${has ? theme.accent + '50' : theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' as const }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{has ? `${placeholder} (${selected.length})` : placeholder}</span><svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4" /></svg></button>{open && <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: 180, marginTop: 4, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 8, zIndex: 80, maxHeight: 240, display: 'flex', flexDirection: 'column', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}><div style={{ padding: '5px 6px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4, alignItems: 'center' }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus style={{ flex: 1, padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 10, fontFamily: 'inherit', outline: 'none', minWidth: 0 }} />{has && <button onClick={() => onChange([])} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: theme.danger, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '3px 6px', borderRadius: 3, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>Clear</button>}</div><div style={{ overflowY: 'auto', flex: 1, padding: '2px 0' }}>{filtered.map(o => { const c = selected.includes(o); return <div key={o} onClick={() => toggle(o)} style={{ padding: '5px 10px', cursor: 'pointer', fontSize: 11, color: c ? theme.accent : theme.text, display: 'flex', alignItems: 'center', gap: 6 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><div style={{ width: 11, height: 11, borderRadius: 2, border: `1.5px solid ${c ? theme.accent : theme.border}`, background: c ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c && <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>{o}</div>; })}{filtered.length === 0 && <div style={{ padding: 12, fontSize: 11, color: theme.textDim, textAlign: 'center' }}>No results</div>}</div></div>}</div>);
}

/* ═══ CONTEXT MENU ═══ */
function CtxMenu({ x, y, onEdit, onShow, onDelete, onClose }: { x: number; y: number; onEdit: () => void; onShow: () => void; onDelete: () => void; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const Item = ({ label, icon, danger, onClick }: { label: string; icon: React.ReactNode; danger?: boolean; onClick: () => void }) => <button onClick={() => { onClick(); onClose(); }} style={{ width: '100%', padding: '7px 12px', background: 'transparent', border: 'none', color: danger ? theme.danger : theme.text, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' as const, borderRadius: 4 }} onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{icon}{label}</button>;
    return (<div ref={ref} style={{ position: 'fixed', left: x, top: y, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 8, padding: 4, zIndex: 200, minWidth: 160, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', animation: 'argux-fadeIn 0.1s ease-out' }}>
        <Item label="Show Device" icon={<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="3"/><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/></svg>} onClick={onShow} />
        <Item label="Edit Device" icon={<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg>} onClick={onEdit} />
        <div style={{ height: 1, background: theme.border, margin: '3px 6px' }} />
        <Item label="Delete Device" danger icon={<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg>} onClick={onDelete} />
    </div>);
}

/* ═══ TOOLTIP BUTTON ═══ */
function TBtn({ tip, children, onClick, danger }: { tip: string; children: React.ReactNode; onClick: (e: React.MouseEvent) => void; danger?: boolean }) {
    const [show, setShow] = useState(false); const ref = useRef<HTMLButtonElement>(null);
    return (<div style={{ position: 'relative', display: 'inline-flex' }}><button ref={ref} onClick={onClick} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} style={{ width: 26, height: 26, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: danger ? theme.danger : theme.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }} onMouseOver={e => { e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = danger ? theme.danger : theme.textSecondary; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = danger ? theme.danger : theme.textDim; }}>{children}</button>{show && <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6, padding: '4px 8px', background: '#1a1f2e', border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 10, fontWeight: 600, color: theme.text, whiteSpace: 'nowrap' as const, zIndex: 50, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>{tip}</div>}</div>);
}

/* ═══ HELPERS ═══ */
function Signal({ v }: { v: number }) { return <div className="dev-signal">{[1,2,3,4,5].map(i => <div key={i} className="dev-signal-bar" style={{ height: i * 2 + 2, background: v >= i * 20 ? (v > 60 ? '#22c55e' : v > 30 ? '#f59e0b' : '#ef4444') : theme.border }} />)}</div>; }
function Battery({ v }: { v: number | null }) { if (v === null) return <span style={{ fontSize: 10, color: theme.textDim }}>AC</span>; return <div className="dev-battery"><div className="dev-battery-shell"><div className="dev-battery-fill" style={{ width: `${v}%`, background: v > 50 ? '#22c55e' : v > 20 ? '#f59e0b' : '#ef4444' }} /></div><span style={{ color: v > 20 ? theme.textSecondary : theme.danger }}>{v}%</span></div>; }
function StatusDot({ s }: { s: DeviceStatus }) { return <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span className="dev-status-dot" style={{ background: deviceStatusColors[s] }} /><span style={{ fontSize: 11, fontWeight: 600, color: deviceStatusColors[s] }}>{s}</span></div>; }
function TypeBadge({ t }: { t: DeviceType }) { const c = deviceTypeColors[t]; return <span className="dev-type-badge" style={{ background: `${c}12`, color: c, border: `1px solid ${c}30` }}>{t}</span>; }

function getSignalLabel(v: number): string { if (v >= 80) return 'Excellent'; if (v >= 60) return 'Good'; if (v >= 40) return 'Fair'; if (v >= 20) return 'Weak'; return 'None'; }

export default function DevicesIndex() {
    const toast = useToast();
    const [search, setSearch] = useState('');
    const [fType, setFType] = useState<string[]>([]);
    const [fStatus, setFStatus] = useState<string[]>([]);
    const [fSignal, setFSignal] = useState<string[]>([]);
    const [fLocation, setFLocation] = useState<string[]>([]);
    const [fPerson, setFPerson] = useState<string[]>([]);
    const [fOrg, setFOrg] = useState<string[]>([]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [ctx, setCtx] = useState<{ x: number; y: number; deviceId: number } | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const signalLevels = ['Excellent', 'Good', 'Fair', 'Weak', 'None'];
    const locations = [...new Set(mockDevices.map(d => d.locationName))].sort();
    const persons = [...new Set(mockDevices.filter(d => d.personName).map(d => d.personName!))].sort();
    const orgs = [...new Set(mockDevices.filter(d => d.orgName).map(d => d.orgName!))].sort();

    const filtered = mockDevices.filter(d => {
        if (search && !`${d.name} ${d.uuid} ${d.manufacturer} ${d.model} ${d.serialNumber}`.toLowerCase().includes(search.toLowerCase())) return false;
        if (fType.length && !fType.includes(d.type)) return false;
        if (fStatus.length && !fStatus.includes(d.status)) return false;
        if (fSignal.length && !fSignal.includes(getSignalLabel(d.signalStrength))) return false;
        if (fLocation.length && !fLocation.includes(d.locationName)) return false;
        if (fPerson.length && (!d.personName || !fPerson.includes(d.personName))) return false;
        if (fOrg.length && (!d.orgName || !fOrg.includes(d.orgName))) return false;
        if (dateFrom) { const df = new Date(dateFrom); if (new Date(d.lastSeen) < df) return false; }
        if (dateTo) { const dt = new Date(dateTo + 'T23:59:59'); if (new Date(d.lastSeen) > dt) return false; }
        return true;
    });

    const activeFilterCount = [fType, fStatus, fSignal, fLocation, fPerson, fOrg].filter(a => a.length > 0).length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);
    const clearAll = () => { setFType([]); setFStatus([]); setFSignal([]); setFLocation([]); setFPerson([]); setFOrg([]); setDateFrom(''); setDateTo(''); };

    const counts = { total: mockDevices.length, online: mockDevices.filter(d => d.status === 'Online').length, offline: mockDevices.filter(d => d.status === 'Offline').length };

    const handleDelete = () => {
        if (!deleteId) return;
        const dev = mockDevices.find(d => d.id === deleteId);
        setDeleteId(null);
        toast.warning('Device deleted', dev?.name || 'Unknown');
    };

    const handleContextMenu = (e: React.MouseEvent, deviceId: number) => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY, deviceId }); };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Delete modal */}
            {deleteId !== null && (() => { const dev = mockDevices.find(d => d.id === deleteId); return <div onClick={() => setDeleteId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}><div onClick={e => e.stopPropagation()} style={{ background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 14, width: '100%', maxWidth: 400, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'argux-fadeIn 0.2s ease-out' }}><div style={{ textAlign: 'center', marginBottom: 16 }}><div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke={theme.danger} strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></div><h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, margin: '0 0 6px' }}>Delete Device</h3><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>Are you sure you want to delete <strong style={{ color: theme.text }}>{dev?.name}</strong>?</p><p style={{ fontSize: 11, color: theme.textDim, margin: '6px 0 0' }}>This action cannot be undone.</p></div><div style={{ display: 'flex', gap: 10 }}><Button variant="secondary" onClick={() => setDeleteId(null)} style={{ flex: 1 }}>Cancel</Button><Button variant="danger" onClick={handleDelete} style={{ flex: 1 }}>Delete Device</Button></div></div></div>; })()}

            {/* Context menu */}
            {ctx && <CtxMenu x={ctx.x} y={ctx.y} onShow={() => router.visit(`/devices/${ctx.deviceId}`)} onEdit={() => router.visit(`/devices/${ctx.deviceId}/edit`)} onDelete={() => setDeleteId(ctx.deviceId)} onClose={() => setCtx(null)} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                <div><h1 style={{ fontSize: 20, fontWeight: 800, color: theme.text, margin: 0 }}>Surveillance Devices</h1><p style={{ fontSize: 12, color: theme.textSecondary, margin: '4px 0 0' }}>{counts.total} devices · {counts.online} online · {counts.offline} offline</p></div>
                <button onClick={() => router.visit('/devices/create')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 6, background: theme.accent, color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0 }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>New Device</button>
            </div>

            {/* Search bar + Filter toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: showFilters ? 0 : 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 12px', flex: 1 }}><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, UUID, manufacturer..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />{search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', display: 'flex', padding: 2 }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}</div>
                <button onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8, background: showFilters || activeFilterCount > 0 ? theme.accentDim : theme.bgInput, color: showFilters || activeFilterCount > 0 ? theme.accent : theme.textSecondary, border: `1px solid ${showFilters || activeFilterCount > 0 ? theme.accent + '40' : theme.border}`, fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 3h14M3 8h10M5 13h6"/></svg>Filters{activeFilterCount > 0 && <span style={{ background: theme.accent, color: '#fff', fontSize: 9, fontWeight: 700, padding: '0 5px', borderRadius: 8, lineHeight: '16px', minWidth: 16, textAlign: 'center' }}>{activeFilterCount}</span>}</button>
                <span style={{ fontSize: 11, color: theme.textDim, flexShrink: 0 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Collapsible filters panel */}
            {showFilters && <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16, marginTop: 8, animation: 'argux-fadeIn 0.15s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Advanced Filters</span>
                    {activeFilterCount > 0 && <button onClick={clearAll} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: theme.danger, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: '3px 10px', borderRadius: 4 }}>Clear All ({activeFilterCount})</button>}
                </div>
                {/* Row 1 */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <MSF selected={fType} onChange={setFType} options={[...deviceTypes]} placeholder="Type" />
                    <MSF selected={fStatus} onChange={setFStatus} options={[...deviceStatuses]} placeholder="Status" />
                    <MSF selected={fSignal} onChange={setFSignal} options={signalLevels} placeholder="Signal" />
                    <MSF selected={fLocation} onChange={setFLocation} options={locations} placeholder="Location" />
                </div>
                {/* Row 2 */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <MSF selected={fPerson} onChange={setFPerson} options={persons} placeholder="Person" />
                    <MSF selected={fOrg} onChange={setFOrg} options={orgs} placeholder="Organization" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 180 }}>
                        <div style={{ fontSize: 10, color: theme.textDim, flexShrink: 0, fontWeight: 600 }}>Last Seen</div>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="From" style={{ flex: 1, padding: '7px 8px', background: theme.bg, color: dateFrom ? theme.text : theme.textDim, border: `1px solid ${dateFrom ? theme.accent + '50' : theme.border}`, borderRadius: 6, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: 'none', colorScheme: 'dark' as any, minWidth: 0 }} />
                        <span style={{ fontSize: 10, color: theme.textDim }}>→</span>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} title="To" style={{ flex: 1, padding: '7px 8px', background: theme.bg, color: dateTo ? theme.text : theme.textDim, border: `1px solid ${dateTo ? theme.accent + '50' : theme.border}`, borderRadius: 6, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: 'none', colorScheme: 'dark' as any, minWidth: 0 }} />
                    </div>
                </div>
            </div>}

            {/* Table */}
            <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 900 }}>
                        <thead><tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${theme.border}` }}>
                            {['Name','Type','Status','Signal','Battery','Location','Assigned To','Last Seen','Actions'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em', whiteSpace: 'nowrap' as const, position: 'sticky' as const, top: 0, background: theme.bgInput }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {filtered.length === 0 ? <tr><td colSpan={9} style={{ padding: 50, textAlign: 'center' }}><div style={{ fontSize: 13, color: theme.textDim, marginBottom: 8 }}>No devices match your filters.</div>{activeFilterCount > 0 && <button onClick={clearAll} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 14px', color: theme.textSecondary, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Clear Filters</button>}</td></tr> : filtered.map(d => (
                                <tr key={d.id} onContextMenu={e => handleContextMenu(e, d.id)} style={{ borderBottom: `1px solid ${theme.border}`, transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td style={{ padding: '10px 12px' }}><div style={{ fontWeight: 600, color: theme.text, whiteSpace: 'nowrap' as const, cursor: 'pointer' }} onClick={() => router.visit(`/devices/${d.id}`)}>{d.name}</div><div style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{d.uuid}</div></td>
                                    <td style={{ padding: '10px 12px' }}><TypeBadge t={d.type} /></td>
                                    <td style={{ padding: '10px 12px' }}><StatusDot s={d.status} /></td>
                                    <td style={{ padding: '10px 12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Signal v={d.signalStrength} /><span style={{ fontSize: 10, color: theme.textDim }}>{d.signalStrength}%</span></div></td>
                                    <td style={{ padding: '10px 12px' }}><Battery v={d.batteryLevel} /></td>
                                    <td style={{ padding: '10px 12px', maxWidth: 150 }}><div style={{ fontSize: 11, color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.locationName}</div></td>
                                    <td style={{ padding: '10px 12px' }}>{d.personName ? <span style={{ fontSize: 11, color: theme.accent, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); router.visit(`/persons/${d.personId}`); }}>{d.personName}</span> : d.orgName ? <span style={{ fontSize: 11, color: '#8b5cf6', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); router.visit(`/organizations/${d.orgId}`); }}>{d.orgName}</span> : <span style={{ fontSize: 11, color: theme.textDim }}>—</span>}</td>
                                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' as const }}><span style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{new Date(d.lastSeen).toLocaleString()}</span></td>
                                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                            <TBtn tip="Show Details" onClick={e => { e.stopPropagation(); router.visit(`/devices/${d.id}`); }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="3"/><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/></svg></TBtn>
                                            <TBtn tip="Edit Device" onClick={e => { e.stopPropagation(); router.visit(`/devices/${d.id}/edit`); }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg></TBtn>
                                            <TBtn tip="Delete Device" danger onClick={e => { e.stopPropagation(); setDeleteId(d.id); }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></TBtn>
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
DevicesIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
