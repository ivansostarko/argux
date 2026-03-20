import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button, Skeleton, Icons } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { mockPersons, risks, riskColors, statusColors, genders, nationalities, countries, allLanguages, religions, statuses, type Risk, type Status } from '../../mock/persons';

/* ═══ MULTISELECT ═══ */
function MS({ selected, onChange, options, placeholder }: { selected: string[]; onChange: (v: string[]) => void; options: string[]; placeholder: string }) {
    const [open, setOpen] = useState(false); const [search, setSearch] = useState(''); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
    const toggle = (o: string) => onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o]);
    const has = selected.length > 0;
    return (
        <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: 130 }}>
            <button onClick={() => { setOpen(!open); setSearch(''); }} style={{ width: '100%', padding: '7px 10px', background: theme.bgInput, color: has ? theme.text : theme.textDim, border: `1px solid ${has ? theme.accent+'60' : theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{has ? `${selected.length} selected` : placeholder}</span>
                {has && <span style={{ background: theme.accentDim, color: theme.accent, fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 4, flexShrink: 0 }}>{selected.length}</span>}
            </button>
            {open && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 8, zIndex: 50, maxHeight: 220, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                <div style={{ padding: '6px 8px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." autoFocus style={{ flex: 1, padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 11, fontFamily: 'inherit', outline: 'none' }} />{has && <button onClick={() => onChange([])} style={{ background: 'none', border: 'none', color: theme.danger, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '0 4px' }}>Clear</button>}</div>
                <div style={{ overflowY: 'auto', flex: 1, padding: '2px 0' }}>{filtered.slice(0, 80).map(o => { const c = selected.includes(o); return <div key={o} onClick={() => toggle(o)} style={{ padding: '5px 10px', cursor: 'pointer', fontSize: 11, color: c ? theme.accent : theme.text, display: 'flex', alignItems: 'center', gap: 6 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><div style={{ width: 12, height: 12, borderRadius: 2, border: `1.5px solid ${c ? theme.accent : theme.border}`, background: c ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c && <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>{o}</div>; })}{filtered.length === 0 && <div style={{ padding: '10px', fontSize: 11, color: theme.textDim, textAlign: 'center' }}>No results</div>}</div>
            </div>}
        </div>
    );
}

const RiskBadge = ({ risk }: { risk: Risk }) => { const c = riskColors[risk]; return <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${c}18`, color: c, border: `1px solid ${c}30`, whiteSpace: 'nowrap' as const, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{risk}</span>; };
const StatusBadge = ({ status }: { status: Status }) => { const c = statusColors[status]; return <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${c}18`, color: c, border: `1px solid ${c}30`, whiteSpace: 'nowrap' as const }}>{status}</span>; };

/* ═══ CONFIRM MODAL ═══ */
function ConfirmModal({ open, title, message, onConfirm, onCancel }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
    if (!open) return null;
    return (<div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}><div onClick={e => e.stopPropagation()} style={{ background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 14, width: '100%', maxWidth: 400, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'argux-fadeIn 0.2s ease-out' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: theme.dangerDim, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: theme.danger }}><svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.13 2.5a1 1 0 011.74 0l5.5 9.5A1 1 0 0113.5 13.5h-11a1 1 0 01-.87-1.5z"/><line x1="8" y1="6" x2="8" y2="8.5"/><circle cx="8" cy="10.5" r="0.5" fill="currentColor"/></svg></div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, textAlign: 'center', margin: '0 0 8px' }}>{title}</h3>
        <p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.6, margin: '0 0 24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}><Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button><Button variant="danger" onClick={onConfirm} style={{ flex: 1 }}>Delete</Button></div>
    </div></div>);
}

function TableSkeleton() { return (<div style={{ background: 'rgba(10,14,22,0.5)', border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}><div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${theme.border}` }}><Skeleton height={12} width={600} /></div>{Array.from({ length: 8 }).map((_, i) => (<div key={i} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: `1px solid ${theme.border}20`, alignItems: 'center' }}><Skeleton width={36} height={36} radius={8} /><div style={{ flex: 1 }}><Skeleton height={13} width={160} style={{ marginBottom: 6 }} /><Skeleton height={10} width={100} /></div><Skeleton height={12} width={80} /><Skeleton height={20} width={50} radius={4} /></div>))}</div>); }

function Tip({ text, children }: { text: string; children: React.ReactNode }) { const [show, setShow] = useState(false); return (<div style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>{children}{show && <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6, background: '#1a1f2e', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 11, color: theme.text, whiteSpace: 'nowrap' as const, zIndex: 40, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', pointerEvents: 'none' as const }}>{text}</div>}</div>); }

/* ═══ CONTEXT MENU ═══ */
function ContextMenu({ x, y, personId, onClose, onDelete }: { x: number; y: number; personId: number; onClose: () => void; onDelete: (id: number) => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = () => onClose(); document.addEventListener('click', h); document.addEventListener('scroll', h, true); return () => { document.removeEventListener('click', h); document.removeEventListener('scroll', h, true); }; }, [onClose]);

    const items = [
        { label: 'View details', icon: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>, action: () => router.visit(`/persons/${personId}`), color: theme.accent },
        { label: 'Edit person', icon: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg>, action: () => router.visit(`/persons/${personId}/edit`), color: theme.textSecondary },
        { label: 'divider' },
        { label: 'Delete person', icon: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg>, action: () => onDelete(personId), color: theme.danger },
    ];

    // Keep menu on screen
    const menuW = 180; const menuH = 140;
    const adjX = x + menuW > window.innerWidth ? x - menuW : x;
    const adjY = y + menuH > window.innerHeight ? y - menuH : y;

    return (
        <div ref={ref} style={{ position: 'fixed', top: adjY, left: adjX, zIndex: 100, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 10, padding: 5, minWidth: menuW, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', animation: 'argux-fadeIn 0.12s ease-out' }}>
            {items.map((item, i) => item.label === 'divider'
                ? <div key={i} style={{ height: 1, background: theme.border, margin: '4px 6px' }} />
                : <button key={i} onClick={e => { e.stopPropagation(); item.action!(); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: item.color, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 6, fontWeight: 500 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>{item.icon}{item.label}</button>
            )}
        </div>
    );
}

/* ═══ MAIN ═══ */
export default function PersonsIndex() {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [persons, setPersons] = useState(mockPersons);
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [sortCol, setSortCol] = useState<string>('lastName');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; id: number } | null>(null);
    const perPage = 10;

    useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, []);

    const [fName, setFName] = useState(''); const [fNick, setFNick] = useState(''); const [fEmail, setFEmail] = useState(''); const [fPhone, setFPhone] = useState('');
    const [fUuid, setFUuid] = useState(''); const [fGender, setFGender] = useState<string[]>([]); const [fDobFrom, setFDobFrom] = useState(''); const [fDobTo, setFDobTo] = useState(''); const [fTax, setFTax] = useState('');
    const [fNat, setFNat] = useState<string[]>([]); const [fCountry, setFCountry] = useState<string[]>([]); const [fLang, setFLang] = useState<string[]>([]);
    const [fRisk, setFRisk] = useState<string[]>([]); const [fStatus, setFStatus] = useState<string[]>([]); const [fReligion, setFReligion] = useState<string[]>([]);

    const filterCount = [fName, fNick, fEmail, fPhone, fUuid, fTax, fDobFrom, fDobTo].filter(Boolean).length + [fGender, fNat, fCountry, fLang, fRisk, fStatus, fReligion].filter(a => a.length > 0).length;
    const hasAdv = filterCount > 0;
    const clearAll = () => { setFName(''); setFNick(''); setFEmail(''); setFPhone(''); setFUuid(''); setFGender([]); setFDobFrom(''); setFDobTo(''); setFTax(''); setFNat([]); setFCountry([]); setFLang([]); setFRisk([]); setFStatus([]); setFReligion([]); setSearch(''); setPage(1); };

    const filtered = persons.filter(p => {
        const q = search.toLowerCase();
        const ms = !q || `${p.firstName} ${p.lastName} ${p.nickname} ${p.email} ${p.phone} ${p.uuid}`.toLowerCase().includes(q);
        return ms && (!fName || `${p.firstName} ${p.lastName}`.toLowerCase().includes(fName.toLowerCase())) && (!fNick || p.nickname.toLowerCase().includes(fNick.toLowerCase())) && (!fEmail || p.email.toLowerCase().includes(fEmail.toLowerCase())) && (!fPhone || p.phone.includes(fPhone)) && (!fUuid || p.uuid.toLowerCase().includes(fUuid.toLowerCase())) && (fGender.length === 0 || fGender.includes(p.gender)) && (!fDobFrom || p.dob >= fDobFrom) && (!fDobTo || p.dob <= fDobTo) && (!fTax || p.taxNumber.toLowerCase().includes(fTax.toLowerCase())) && (fNat.length === 0 || fNat.includes(p.nationality)) && (fCountry.length === 0 || fCountry.includes(p.country)) && (fLang.length === 0 || fLang.includes(p.language)) && (fRisk.length === 0 || fRisk.includes(p.risk)) && (fStatus.length === 0 || fStatus.includes(p.status)) && (fReligion.length === 0 || fReligion.includes(p.religion));
    }).sort((a, b) => { const av = (a as any)[sortCol] || ''; const bv = (b as any)[sortCol] || ''; const c = typeof av === 'string' ? av.localeCompare(bv) : av - bv; return sortDir === 'asc' ? c : -c; });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paged = filtered.slice((page - 1) * perPage, page * perPage);
    const toggleSort = (col: string) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } };
    const SI = ({ col }: { col: string }) => sortCol === col ? <span style={{ fontSize: 9, marginLeft: 3 }}>{sortDir === 'asc' ? '▲' : '▼'}</span> : null;
    const inp: React.CSSProperties = { padding: '7px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', width: '100%' };

    const handleDelete = () => { if (deleteTarget === null) return; const p = persons.find(x => x.id === deleteTarget); setPersons(prev => prev.filter(x => x.id !== deleteTarget)); setDeleteTarget(null); toast.success('Person deleted', `${p?.firstName} ${p?.lastName} removed.`); };
    const copyUuid = (uuid: string, e: React.MouseEvent) => { e.stopPropagation(); navigator.clipboard.writeText(uuid).then(() => toast.info('UUID copied', uuid.slice(0, 20) + '…')); };

    const handleContextMenu = (e: React.MouseEvent, id: number) => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, id }); };

    const gridCols = '80px 40px minmax(120px,1fr) 80px 90px 80px 140px 120px 80px 60px 60px 86px';

    return (
        <div>
            <ConfirmModal open={deleteTarget !== null} title="Delete Person" message={`Are you sure you want to permanently delete ${persons.find(p => p.id === deleteTarget)?.firstName} ${persons.find(p => p.id === deleteTarget)?.lastName}? This action cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
            {ctxMenu && <ContextMenu x={ctxMenu.x} y={ctxMenu.y} personId={ctxMenu.id} onClose={() => setCtxMenu(null)} onDelete={id => { setCtxMenu(null); setDeleteTarget(id); }} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Persons</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{filtered.length} subjects in database</p></div>
                <Button onClick={() => router.visit('/persons/create')} style={{ width: 'auto', padding: '10px 20px' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>Add Person</Button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 14px' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email, phone, UUID..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '10px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', minWidth: 0 }} />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? theme.accentDim : 'rgba(255,255,255,0.03)', border: `1px solid ${showFilters ? theme.accent : theme.border}`, borderRadius: 8, padding: '0 14px', cursor: 'pointer', color: showFilters ? theme.accent : theme.textSecondary, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="6" y1="12" x2="10" y2="12"/></svg>Filters{filterCount > 0 && <span style={{ background: theme.accent, color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8, minWidth: 16, textAlign: 'center' as const }}>{filterCount}</span>}
                </button>
            </div>

            {showFilters && (<div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 16, marginBottom: 16, animation: 'argux-fadeIn 0.2s ease-out' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 10 }}>
                    {[['Name',fName,setFName,'First or last name'],['Nickname',fNick,setFNick,'Alias'],['Email',fEmail,setFEmail,'Email'],['Phone',fPhone,setFPhone,'Phone'],['Tax Number',fTax,setFTax,'Tax ID'],['UUID',fUuid,setFUuid,'UUID']].map(([label,val,setter,ph]) => (
                        <div key={label as string}><label style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 3, display: 'block' }}>{label as string}</label><input value={val as string} onChange={e => { (setter as any)(e.target.value); setPage(1); }} placeholder={ph as string} style={inp} /></div>
                    ))}
                    <div><label style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 3, display: 'block' }}>DOB From</label><input type="date" value={fDobFrom} onChange={e => { setFDobFrom(e.target.value); setPage(1); }} style={{ ...inp, colorScheme: 'dark' as any }} /></div>
                    <div><label style={{ fontSize: 9, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 3, display: 'block' }}>DOB To</label><input type="date" value={fDobTo} onChange={e => { setFDobTo(e.target.value); setPage(1); }} style={{ ...inp, colorScheme: 'dark' as any }} /></div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <MS selected={fGender} onChange={v => { setFGender(v); setPage(1); }} options={[...genders]} placeholder="Gender" />
                    <MS selected={fNat} onChange={v => { setFNat(v); setPage(1); }} options={nationalities} placeholder="Nationality" />
                    <MS selected={fCountry} onChange={v => { setFCountry(v); setPage(1); }} options={countries} placeholder="Country" />
                    <MS selected={fLang} onChange={v => { setFLang(v); setPage(1); }} options={allLanguages} placeholder="Language" />
                    <MS selected={fRisk} onChange={v => { setFRisk(v); setPage(1); }} options={[...risks]} placeholder="Risk" />
                    <MS selected={fStatus} onChange={v => { setFStatus(v); setPage(1); }} options={[...statuses]} placeholder="Status" />
                    <MS selected={fReligion} onChange={v => { setFReligion(v); setPage(1); }} options={religions} placeholder="Religion" />
                </div>
                {hasAdv && <div style={{ marginTop: 10 }}><button onClick={clearAll} style={{ background: theme.dangerDim, border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, padding: '5px 12px', fontSize: 11, color: theme.danger, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Clear all filters</button></div>}
            </div>)}

            {loading ? <TableSkeleton /> : <>
                {/* Desktop table */}
                <div className="persons-desktop" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as const }}>
                    <style>{`@media(max-width:860px){.persons-desktop{display:none!important}.persons-mobile{display:flex!important}}`}</style>
                    <div style={{ background: 'rgba(10,14,22,0.5)', border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', minWidth: 1050 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${theme.border}`, fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, alignItems: 'center', gap: 6 }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('uuid')}>UUID<SI col="uuid"/></span><span></span>
                            <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('lastName')}>Name<SI col="lastName"/></span><span>Nick</span>
                            <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('nationality')}>Nationality<SI col="nationality"/></span>
                            <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('country')}>Country<SI col="country"/></span>
                            <span>Email</span><span>Phone</span><span>Tax No.</span>
                            <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('status')}>Status<SI col="status"/></span>
                            <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('risk')}>Risk<SI col="risk"/></span><span>Actions</span>
                        </div>
                        {paged.length === 0 ? <div style={{ padding: '48px 16px', textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 4 }}>No persons found</div><div style={{ fontSize: 12, color: theme.textSecondary }}>Adjust search or filters.</div></div>
                        : paged.map((p, idx) => (
                            <div key={p.id} onContextMenu={e => handleContextMenu(e, p.id)} style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '8px 12px', alignItems: 'center', gap: 6, borderBottom: idx < paged.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none', fontSize: 11, transition: 'background 0.1s', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} onClick={() => router.visit(`/persons/${p.id}`)}>
                                <Tip text="Click to copy UUID"><span onClick={e => copyUuid(p.uuid, e)} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: theme.accent, overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'copy', textDecoration: 'underline', textDecorationStyle: 'dotted' as const }}>{p.uuid.slice(0, 8)}…</span></Tip>
                                <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.avatar ? <img src={p.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{p.firstName[0]}{p.lastName[0]}</span>}</div>
                                <div style={{ minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.firstName} {p.middleName ? p.middleName[0]+'. ' : ''}{p.lastName}</div><div style={{ fontSize: 10, color: theme.textDim }}>{p.gender} · {p.dob}</div></div>
                                <span style={{ color: p.nickname ? theme.textSecondary : theme.textDim, fontStyle: p.nickname ? 'normal' : 'italic', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.nickname || '—'}</span>
                                <span style={{ color: theme.textSecondary, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.nationality}</span>
                                <span style={{ color: theme.textSecondary, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.country}</span>
                                <span style={{ color: theme.textSecondary, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.email}</span>
                                <span style={{ color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.phone}</span>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: p.taxNumber ? theme.textSecondary : theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.taxNumber || '—'}</span>
                                <StatusBadge status={p.status} /><RiskBadge risk={p.risk} />
                                <div style={{ display: 'flex', gap: 3 }} onClick={e => e.stopPropagation()}>
                                    <Tip text="Edit"><button onClick={() => router.visit(`/persons/${p.id}/edit`)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.textSecondary, display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg></button></Tip>
                                    <Tip text="View"><button onClick={() => router.visit(`/persons/${p.id}`)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.accent, display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg></button></Tip>
                                    <Tip text="Delete"><button onClick={() => setDeleteTarget(p.id)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.danger, display: 'flex' }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></button></Tip>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile cards */}
                <div className="persons-mobile" style={{ display: 'none', flexDirection: 'column', gap: 10 }}>
                    {paged.length === 0 ? <div style={{ padding: '48px 16px', textAlign: 'center', color: theme.textSecondary, fontSize: 13 }}>No persons found.</div>
                    : paged.map(p => (
                        <div key={p.id} onClick={() => router.visit(`/persons/${p.id}`)} onContextMenu={e => handleContextMenu(e, p.id)} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, cursor: 'pointer', transition: 'background 0.15s' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.avatar ? <img src={p.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{p.firstName[0]}{p.lastName[0]}</span>}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{p.firstName} {p.lastName}{p.nickname ? ` "${p.nickname}"` : ''}</div>
                                    <div style={{ fontSize: 11, color: theme.textSecondary }}>{p.nationality} · {p.gender} · {p.dob}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}><StatusBadge status={p.status} /><RiskBadge risk={p.risk} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 11 }}>
                                <div><span style={{ color: theme.textDim }}>Email: </span><span style={{ color: theme.textSecondary }}>{p.email}</span></div>
                                <div><span style={{ color: theme.textDim }}>Phone: </span><span style={{ color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{p.phone}</span></div>
                                <div><span style={{ color: theme.textDim }}>Country: </span><span style={{ color: theme.textSecondary }}>{p.country}</span></div>
                                <div><span style={{ color: theme.textDim }}>UUID: </span><span onClick={e => copyUuid(p.uuid, e)} style={{ color: theme.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, cursor: 'copy', textDecoration: 'underline dotted' }}>{p.uuid.slice(0, 12)}…</span></div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                                <button onClick={() => router.visit(`/persons/${p.id}/edit`)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 5, padding: '5px 10px', fontSize: 10, color: theme.textSecondary, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Edit</button>
                                <button onClick={() => router.visit(`/persons/${p.id}`)} style={{ background: theme.accentDim, border: `1px solid ${theme.accent}30`, borderRadius: 5, padding: '5px 10px', fontSize: 10, color: theme.accent, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>View</button>
                                <button onClick={() => setDeleteTarget(p.id)} style={{ background: theme.dangerDim, border: `1px solid rgba(239,68,68,0.25)`, borderRadius: 5, padding: '5px 10px', fontSize: 10, color: theme.danger, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </>}

            {!loading && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 12, color: theme.textSecondary }}>Page {page} of {totalPages} ({filtered.length} results)</span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <button onClick={() => setPage(Math.max(1, page-1))} disabled={page===1} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page===1?'not-allowed':'pointer', color: page===1?theme.textDim:theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page===1?0.4:1 }}>Prev</button>
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => { const pg = page<=3 ? i+1 : Math.min(page-2+i, totalPages-4+i+1); if (pg<1||pg>totalPages) return null; return <button key={pg} onClick={() => setPage(pg)} style={{ background: page===pg?theme.accentDim:'none', border: `1px solid ${page===pg?theme.accent:theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: page===pg?theme.accent:theme.textSecondary, fontSize: 12, fontWeight: page===pg?700:400, fontFamily: 'inherit' }}>{pg}</button>; })}
                        <button onClick={() => setPage(Math.min(totalPages, page+1))} disabled={page===totalPages} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page===totalPages?'not-allowed':'pointer', color: page===totalPages?theme.textDim:theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page===totalPages?0.4:1 }}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}

PersonsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
