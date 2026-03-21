import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button, Skeleton } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { mockVehicles, risks, riskColors, statuses, statusColors, vehicleTypes, vehicleMakes, vehicleColors, vehicleYears, personOptions, orgOptions, type Risk, type Status } from '../../mock/vehicles';

/* ═══ MULTISELECT ═══ */
function MS({ selected, onChange, options, placeholder }: { selected: string[]; onChange: (v: string[]) => void; options: string[]; placeholder: string }) {
    const [open, setOpen] = useState(false); const [search, setSearch] = useState(''); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
    const toggle = (o: string) => onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o]);
    const has = selected.length > 0;
    return (<div ref={ref} style={{ position: 'relative', flex: 1, minWidth: 120 }}><button onClick={() => { setOpen(!open); setSearch(''); }} style={{ width: '100%', padding: '7px 10px', background: theme.bgInput, color: has ? theme.text : theme.textDim, border: `1px solid ${has ? theme.accent+'60' : theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{has ? `${selected.length} sel.` : placeholder}</span>{has && <span style={{ background: theme.accentDim, color: theme.accent, fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 4 }}>{selected.length}</span>}</button>{open && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 8, zIndex: 50, maxHeight: 220, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}><div style={{ padding: '6px 8px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." autoFocus style={{ flex: 1, padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 11, fontFamily: 'inherit', outline: 'none' }} />{has && <button onClick={() => onChange([])} style={{ background: 'none', border: 'none', color: theme.danger, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '0 4px' }}>Clear</button>}</div><div style={{ overflowY: 'auto', flex: 1, padding: '2px 0' }}>{filtered.slice(0, 80).map(o => { const c = selected.includes(o); return <div key={o} onClick={() => toggle(o)} style={{ padding: '5px 10px', cursor: 'pointer', fontSize: 11, color: c ? theme.accent : theme.text, display: 'flex', alignItems: 'center', gap: 6 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><div style={{ width: 12, height: 12, borderRadius: 2, border: `1.5px solid ${c ? theme.accent : theme.border}`, background: c ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c && <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>{o}</div>; })}{filtered.length === 0 && <div style={{ padding: '10px', fontSize: 11, color: theme.textDim, textAlign: 'center' }}>No results</div>}</div></div>}</div>);
}

const RiskBadge = ({ risk }: { risk: Risk }) => { const c = riskColors[risk]; return <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${c}18`, color: c, border: `1px solid ${c}30`, whiteSpace: 'nowrap' as const, textTransform: 'uppercase' as const }}>{risk}</span>; };
const StatusBadge = ({ status }: { status: Status }) => { const c = statusColors[status]; return <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${c}18`, color: c, border: `1px solid ${c}30`, whiteSpace: 'nowrap' as const }}>{status}</span>; };
function Tip({ text, children }: { text: string; children: React.ReactNode }) { const [show, setShow] = useState(false); return <div style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>{children}{show && <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6, background: '#1a1f2e', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 11, color: theme.text, whiteSpace: 'nowrap' as const, zIndex: 40, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', pointerEvents: 'none' as const }}>{text}</div>}</div>; }

function ConfirmModal({ open, title, message, onConfirm, onCancel }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) { if (!open) return null; return (<div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}><div onClick={e => e.stopPropagation()} style={{ background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 14, width: '100%', maxWidth: 400, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'argux-fadeIn 0.2s ease-out' }}><div style={{ width: 48, height: 48, borderRadius: 12, background: theme.dangerDim, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: theme.danger }}><svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7.13 2.5a1 1 0 011.74 0l5.5 9.5A1 1 0 0113.5 13.5h-11a1 1 0 01-.87-1.5z"/><line x1="8" y1="6" x2="8" y2="8.5"/><circle cx="8" cy="10.5" r="0.5" fill="currentColor"/></svg></div><h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, textAlign: 'center', margin: '0 0 8px' }}>{title}</h3><p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.6, margin: '0 0 24px' }}>{message}</p><div style={{ display: 'flex', gap: 10 }}><Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button><Button variant="danger" onClick={onConfirm} style={{ flex: 1 }}>Delete</Button></div></div></div>); }

function ContextMenu({ x, y, vehId, onClose, onDelete }: { x: number; y: number; vehId: number; onClose: () => void; onDelete: (id: number) => void }) { const ref = useRef<HTMLDivElement>(null); useEffect(() => { const h = () => onClose(); document.addEventListener('click', h); document.addEventListener('scroll', h, true); return () => { document.removeEventListener('click', h); document.removeEventListener('scroll', h, true); }; }, [onClose]); const adjX = x + 180 > window.innerWidth ? x - 180 : x; const adjY = y + 140 > window.innerHeight ? y - 140 : y; return (<div ref={ref} style={{ position: 'fixed', top: adjY, left: adjX, zIndex: 100, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 10, padding: 5, minWidth: 180, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', animation: 'argux-fadeIn 0.12s ease-out' }}>{[{ label: 'View details', action: () => router.visit(`/vehicles/${vehId}`), color: theme.accent, icon: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg> },{ label: 'Edit vehicle', action: () => router.visit(`/vehicles/${vehId}/edit`), color: theme.textSecondary, icon: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg> },{ label: 'divider' },{ label: 'Delete vehicle', action: () => { onClose(); onDelete(vehId); }, color: theme.danger, icon: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg> }].map((item, i) => item.label === 'divider' ? <div key={i} style={{ height: 1, background: theme.border, margin: '4px 6px' }} /> : <button key={i} onClick={e => { e.stopPropagation(); item.action!(); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: item.color, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 6, fontWeight: 500 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>{item.icon}{item.label}</button>)}</div>); }

function TableSkeleton() { return (<div style={{ background: 'rgba(10,14,22,0.5)', border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}><div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${theme.border}` }}><Skeleton height={12} width={500} /></div>{Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: `1px solid ${theme.border}20`, alignItems: 'center' }}><Skeleton width={80} height={14} radius={4} /><Skeleton width={120} height={12} /><Skeleton width={70} height={12} /><Skeleton width={60} height={12} /><Skeleton width={50} height={20} radius={4} /></div>)}</div>); }

// Color swatch
const ColorDot = ({ color }: { color: string }) => {
    const map: Record<string,string> = { 'Black':'#111','White':'#f5f5f5','Silver':'#c0c0c0','Gray':'#808080','Red':'#dc2626','Blue':'#3b82f6','Dark Blue':'#1e40af','Green':'#22c55e','Dark Green':'#166534','Brown':'#92400e','Beige':'#d2b48c','Yellow':'#eab308','Orange':'#f97316','Gold':'#d4a017','Burgundy':'#800020','Olive':'#808000','Matte Black':'#1a1a1a','Pearl White':'#f0ece2','Champagne':'#f7e7ce','Gunmetal':'#2a3439','British Racing Green':'#004225' };
    return <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: map[color] || '#666', border: '1px solid rgba(255,255,255,0.15)', verticalAlign: 'middle', marginRight: 4 }} />;
};

export default function VehiclesIndex() {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState(mockVehicles);
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState(''); const [page, setPage] = useState(1);
    const [sortCol, setSortCol] = useState<string>('plate'); const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
    const [deleteTarget, setDeleteTarget] = useState<number|null>(null);
    const [ctxMenu, setCtxMenu] = useState<{x:number;y:number;id:number}|null>(null);
    const perPage = 10;
    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

    // Filters
    const [fPlate, setFPlate] = useState('');
    const [fPerson, setFPerson] = useState<string[]>([]);
    const [fOrg, setFOrg] = useState<string[]>([]);
    const [fColor, setFColor] = useState<string[]>([]);
    const [fType, setFType] = useState<string[]>([]);
    const [fMake, setFMake] = useState<string[]>([]);
    const [fYear, setFYear] = useState<string[]>([]);
    const [fRisk, setFRisk] = useState<string[]>([]);
    const [fStatus, setFStatus] = useState<string[]>([]);

    const filterCount = [fPlate].filter(Boolean).length + [fPerson, fOrg, fColor, fType, fMake, fYear, fRisk, fStatus].filter(a => a.length > 0).length;
    const clearAll = () => { setFPlate(''); setFPerson([]); setFOrg([]); setFColor([]); setFType([]); setFMake([]); setFYear([]); setFRisk([]); setFStatus([]); setSearch(''); setPage(1); };

    const filtered = vehicles.filter(v => {
        const q = search.toLowerCase();
        const ms = !q || `${v.plate} ${v.personName} ${v.orgName} ${v.make} ${v.model} ${v.type} ${v.color}`.toLowerCase().includes(q);
        return ms && (!fPlate || v.plate.toLowerCase().includes(fPlate.toLowerCase()))
            && (fPerson.length === 0 || fPerson.includes(v.personName))
            && (fOrg.length === 0 || fOrg.includes(v.orgName))
            && (fColor.length === 0 || fColor.includes(v.color))
            && (fType.length === 0 || fType.includes(v.type))
            && (fMake.length === 0 || fMake.includes(v.make))
            && (fYear.length === 0 || fYear.includes(v.year))
            && (fRisk.length === 0 || fRisk.includes(v.risk))
            && (fStatus.length === 0 || fStatus.includes(v.status));
    }).sort((a, b) => { const av = (a as any)[sortCol] || ''; const bv = (b as any)[sortCol] || ''; const c = typeof av === 'string' ? av.localeCompare(bv) : av - bv; return sortDir === 'asc' ? c : -c; });

    const totalPages = Math.ceil(filtered.length / perPage); const paged = filtered.slice((page - 1) * perPage, page * perPage);
    const toggleSort = (col: string) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } };
    const SI = ({ col }: { col: string }) => sortCol === col ? <span style={{ fontSize: 9, marginLeft: 3 }}>{sortDir === 'asc' ? '▲' : '▼'}</span> : null;
    const inp: React.CSSProperties = { padding: '7px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', width: '100%' };
    const handleDelete = () => { if (!deleteTarget) return; const v = vehicles.find(x => x.id === deleteTarget); setVehicles(prev => prev.filter(x => x.id !== deleteTarget)); setDeleteTarget(null); toast.success('Vehicle deleted', `${v?.plate} removed.`); };
    const gridCols = '36px 110px minmax(100px,1fr) 90px 80px 100px 50px 55px 55px 86px';

    return (<div>
        <ConfirmModal open={deleteTarget !== null} title="Delete Vehicle" message={`Permanently delete ${vehicles.find(v => v.id === deleteTarget)?.plate}? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
        {ctxMenu && <ContextMenu x={ctxMenu.x} y={ctxMenu.y} vehId={ctxMenu.id} onClose={() => setCtxMenu(null)} onDelete={id => { setCtxMenu(null); setDeleteTarget(id); }} />}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Vehicles</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{filtered.length} vehicles in database</p></div>
            <Button onClick={() => router.visit('/vehicles/create')} style={{ width: 'auto', padding: '10px 20px' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>Add Vehicle</Button>
        </div>

        {/* Search + filter toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 14px' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search plate, person, make, model..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '10px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', minWidth: 0 }} /></div>
            <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? theme.accentDim : 'rgba(255,255,255,0.03)', border: `1px solid ${showFilters ? theme.accent : theme.border}`, borderRadius: 8, padding: '0 14px', cursor: 'pointer', color: showFilters ? theme.accent : theme.textSecondary, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="6" y1="12" x2="10" y2="12"/></svg>Filters{filterCount > 0 && <span style={{ background: theme.accent, color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8, minWidth: 16, textAlign: 'center' as const }}>{filterCount}</span>}</button>
        </div>

        {/* Filters */}
        {showFilters && <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 16, marginBottom: 16, animation: 'argux-fadeIn 0.2s ease-out' }}>
            <div style={{ marginBottom: 10 }}><label style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 3, display: 'block' }}>Plate</label><input value={fPlate} onChange={e => { setFPlate(e.target.value); setPage(1); }} placeholder="Registration plate" style={inp} /></div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <MS selected={fPerson} onChange={v => { setFPerson(v); setPage(1); }} options={personOptions.map(p => p.label)} placeholder="Person" />
                <MS selected={fOrg} onChange={v => { setFOrg(v); setPage(1); }} options={orgOptions.map(o => o.label)} placeholder="Organization" />
                <MS selected={fType} onChange={v => { setFType(v); setPage(1); }} options={vehicleTypes} placeholder="Type" />
                <MS selected={fMake} onChange={v => { setFMake(v); setPage(1); }} options={vehicleMakes} placeholder="Make" />
                <MS selected={fColor} onChange={v => { setFColor(v); setPage(1); }} options={vehicleColors} placeholder="Color" />
                <MS selected={fYear} onChange={v => { setFYear(v); setPage(1); }} options={vehicleYears} placeholder="Year" />
                <MS selected={fRisk} onChange={v => { setFRisk(v); setPage(1); }} options={[...risks]} placeholder="Risk" />
                <MS selected={fStatus} onChange={v => { setFStatus(v); setPage(1); }} options={[...statuses]} placeholder="Status" />
            </div>
            {filterCount > 0 && <div style={{ marginTop: 10 }}><button onClick={clearAll} style={{ background: theme.dangerDim, border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, padding: '5px 12px', fontSize: 11, color: theme.danger, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Clear all</button></div>}
        </div>}

        {/* Table */}
        {loading ? <TableSkeleton /> : <>
            <div className="persons-table-wrap">
                <div style={{ background: 'rgba(10,14,22,0.5)', border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', minWidth: 850 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${theme.border}`, fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, alignItems: 'center', gap: 6 }}>
                        <span></span>
                        <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('plate')}>Plate<SI col="plate" /></span>
                        <span>Owner</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('type')}>Type<SI col="type" /></span>
                        <span>Color</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('make')}>Make<SI col="make" /></span>
                        <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('year')}>Year<SI col="year" /></span>
                        <span>Status</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('risk')}>Risk<SI col="risk" /></span>
                        <span>Actions</span>
                    </div>
                    {paged.length === 0 ? <div style={{ padding: '48px 16px', textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 4 }}>No vehicles found</div><div style={{ fontSize: 12, color: theme.textSecondary }}>Adjust search or filters.</div></div>
                    : paged.map((v, idx) => (
                        <div key={v.id} onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, id: v.id }); }} style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '8px 12px', alignItems: 'center', gap: 6, borderBottom: idx < paged.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', fontSize: 11, transition: 'background 0.1s', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} onClick={() => router.visit(`/vehicles/${v.id}`)}>
                            <div style={{ width: 32, height: 24, borderRadius: 4, overflow: 'hidden', background: theme.bg, border: `1px solid ${theme.border}`, flexShrink: 0 }}>{v.photos[0] ? <img src={v.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1"><rect x="1" y="6" width="14" height="6" rx="2"/><circle cx="4.5" cy="12" r="1.5"/><circle cx="11.5" cy="12" r="1.5"/><path d="M3 6l1.5-3h7L13 6"/></svg></div>}</div>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{v.plate}</span>
                            <div style={{ minWidth: 0 }}>
                                {v.personName && <div style={{ fontSize: 11, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{v.personName}</div>}
                                {v.orgName && <div style={{ fontSize: 10, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{v.orgName}</div>}
                                {!v.personName && !v.orgName && <span style={{ color: theme.textDim }}>—</span>}
                            </div>
                            <span style={{ color: theme.textSecondary, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{v.type}</span>
                            <span style={{ color: theme.textSecondary, fontSize: 10, display: 'flex', alignItems: 'center' }}><ColorDot color={v.color} />{v.color.length > 10 ? v.color.slice(0, 8) + '…' : v.color}</span>
                            <span style={{ color: theme.textSecondary, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{v.make} {v.model}</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: theme.textSecondary }}>{v.year}</span>
                            <StatusBadge status={v.status} />
                            <RiskBadge risk={v.risk} />
                            <div style={{ display: 'flex', gap: 3 }} onClick={e => e.stopPropagation()}>
                                <Tip text="Edit"><button onClick={() => router.visit(`/vehicles/${v.id}/edit`)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.textSecondary, display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg></button></Tip>
                                <Tip text="View"><button onClick={() => router.visit(`/vehicles/${v.id}`)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.accent, display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg></button></Tip>
                                <Tip text="Delete"><button onClick={() => setDeleteTarget(v.id)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.danger, display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></button></Tip>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile cards */}
            <div className="persons-mobile-cards">{paged.map(v => (<div key={v.id} onClick={() => router.visit(`/vehicles/${v.id}`)} onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, id: v.id }); }} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: theme.text }}>{v.plate}</span>
                    <div style={{ display: 'flex', gap: 4 }}><StatusBadge status={v.status} /><RiskBadge risk={v.risk} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 11, marginBottom: 8 }}>
                    <div><span style={{ color: theme.textDim }}>Make: </span><span style={{ color: theme.textSecondary }}>{v.make} {v.model}</span></div>
                    <div><span style={{ color: theme.textDim }}>Year: </span><span style={{ color: theme.textSecondary }}>{v.year}</span></div>
                    <div><span style={{ color: theme.textDim }}>Type: </span><span style={{ color: theme.textSecondary }}>{v.type}</span></div>
                    <div><span style={{ color: theme.textDim }}>Color: </span><ColorDot color={v.color} /><span style={{ color: theme.textSecondary }}>{v.color}</span></div>
                    {v.personName && <div><span style={{ color: theme.textDim }}>Person: </span><span style={{ color: theme.text }}>{v.personName}</span></div>}
                    {v.orgName && <div><span style={{ color: theme.textDim }}>Org: </span><span style={{ color: theme.textSecondary }}>{v.orgName}</span></div>}
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => router.visit(`/vehicles/${v.id}/edit`)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 5, padding: '5px 10px', fontSize: 10, color: theme.textSecondary, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => router.visit(`/vehicles/${v.id}`)} style={{ background: theme.accentDim, border: `1px solid ${theme.accent}30`, borderRadius: 5, padding: '5px 10px', fontSize: 10, color: theme.accent, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>View</button>
                    <button onClick={() => setDeleteTarget(v.id)} style={{ background: theme.dangerDim, border: '1px solid rgba(239,68,68,0.25)', borderRadius: 5, padding: '5px 10px', fontSize: 10, color: theme.danger, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Delete</button>
                </div>
            </div>))}</div>
        </>}

        {/* Pagination */}
        {!loading && totalPages > 1 && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 8 }}><span style={{ fontSize: 12, color: theme.textSecondary }}>Page {page} of {totalPages} ({filtered.length} results)</span><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? theme.textDim : theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page === 1 ? 0.4 : 1 }}>Prev</button>{Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => { const pg = page <= 3 ? i + 1 : Math.min(page - 2 + i, totalPages - 4 + i + 1); if (pg < 1 || pg > totalPages) return null; return <button key={pg} onClick={() => setPage(pg)} style={{ background: page === pg ? theme.accentDim : 'none', border: `1px solid ${page === pg ? theme.accent : theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: page === pg ? theme.accent : theme.textSecondary, fontSize: 12, fontWeight: page === pg ? 700 : 400, fontFamily: 'inherit' }}>{pg}</button>; })}<button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? theme.textDim : theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page === totalPages ? 0.4 : 1 }}>Next</button></div></div>}
    </div>);
}

VehiclesIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
