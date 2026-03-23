import PageMeta from '../../components/layout/PageMeta';
import { useState, useRef, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { getVehicleById, risks, vehicleTypes, vehicleMakes, vehicleColors, vehicleYears, personOptions, orgOptions, statuses } from '../../mock/vehicles';
import VehiclePhotos from '../../components/vehicles/VehiclePhotos';

const Label = ({ children, required }: { children: string; required?: boolean }) => <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: theme.textSecondary, marginBottom: 5, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{children}{required && <span style={{ color: theme.danger, marginLeft: 2 }}>*</span>}</label>;
const Sel = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) => <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '9px 12px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>{placeholder && <option value="">{placeholder}</option>}{options.map(o => <option key={o} value={o}>{o}</option>)}</select>;
function SearchSel({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) { const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const ref = useRef<HTMLDivElement>(null); useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []); const f = options.filter(o => o.toLowerCase().includes(q.toLowerCase())); return <div ref={ref} style={{ position: 'relative' }}><button onClick={() => { setOpen(!open); setQ(''); }} style={{ width: '100%', padding: '9px 12px', background: theme.bgInput, color: value ? theme.text : theme.textDim, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', justifyContent: 'space-between' }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{value || placeholder}</span><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4" /></svg></button>{open && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 8, zIndex: 50, maxHeight: 200, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}><div style={{ padding: '5px 6px', borderBottom: `1px solid ${theme.border}` }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus style={{ width: '100%', padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} /></div><div style={{ overflowY: 'auto', flex: 1 }}>{f.slice(0, 60).map(o => <div key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ padding: '6px 10px', cursor: 'pointer', fontSize: 12, color: value === o ? theme.accent : theme.text }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{o}</div>)}</div></div>}</div>; }

export default function VehicleEdit() {
    const toast = useToast();
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const v = getVehicleById(Number(id));

    const [loading, setLoading] = useState(false);
    const [plate, setPlate] = useState(v?.plate || '');
    const [person, setPerson] = useState(v?.personName || '');
    const [org, setOrg] = useState(v?.orgName || '');
    const [type, setType] = useState(v?.type || '');
    const [make, setMake] = useState(v?.make || '');
    const [model, setModel] = useState(v?.model || '');
    const [year, setYear] = useState(v?.year || '');
    const [color, setColor] = useState(v?.color || '');
    const [vin, setVin] = useState(v?.vin || '');
    const [risk, setRisk] = useState(v?.risk || '');
    const [status, setStatus] = useState<string>(v?.status || 'Active');
    const [notes, setNotes] = useState(v?.notes || '');
    const [photos, setPhotos] = useState<string[]>(v?.photos || []);

    if (!v) return <div style={{ textAlign: 'center', padding: '60px 20px' }}><h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Vehicle Not Found</h2><p style={{ fontSize: 13, color: theme.textSecondary }}>ID {String(id)} not found.</p><Button variant="secondary" onClick={() => router.visit('/vehicles')} style={{ width: 'auto', padding: '10px 20px', marginTop: 16 }}>Back</Button></div>;

    const handleSave = () => { if (!plate) { toast.error('Validation', 'Plate required.'); return; } setLoading(true); setTimeout(() => { setLoading(false); toast.success('Vehicle updated', `${plate} saved.`); router.visit('/vehicles'); }, 1200); };

    return (
                <>
        <PageMeta title="Edit Vehicle" section="vehicles" />
<div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div><h1 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Edit Vehicle: {v.plate}</h1><p style={{ fontSize: 12, color: theme.textSecondary, margin: 0 }}>{v.make} {v.model} ({v.year})</p></div>
                <div style={{ display: 'flex', gap: 8 }}><Button variant="secondary" onClick={() => router.visit('/vehicles')} style={{ width: 'auto', padding: '9px 18px', fontSize: 11 }}>Cancel</Button><Button onClick={handleSave} loading={loading} style={{ width: 'auto', padding: '9px 22px', fontSize: 11 }}>Save Changes</Button></div>
            </div>
            <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 14 }}>Registration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                    <div><Label required>Registration Plate</Label><input value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} style={{ width: '100%', padding: '10px 14px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 16, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, outline: 'none', letterSpacing: '0.05em' }} /></div>
                    <div><Label>VIN</Label><input value={vin} onChange={e => setVin(e.target.value.toUpperCase())} maxLength={17} style={{ width: '100%', padding: '10px 14px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: 'none' }} /></div>
                    <div><Label>Status</Label><Sel value={status} onChange={setStatus} options={[...statuses]} placeholder="Select" /></div>
                </div>
            </div>
            <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 14 }}>Ownership</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                    <div><Label>Person</Label><SearchSel value={person} onChange={setPerson} options={personOptions.map(p => p.label)} placeholder="Search person" /></div>
                    <div><Label>Organization</Label><SearchSel value={org} onChange={setOrg} options={orgOptions.map(o => o.label)} placeholder="Search organization" /></div>
                </div>
            </div>
            <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 14 }}>Vehicle Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                    <div><Label>Type</Label><SearchSel value={type} onChange={setType} options={vehicleTypes} placeholder="Select" /></div>
                    <div><Label>Make</Label><SearchSel value={make} onChange={setMake} options={vehicleMakes} placeholder="Select" /></div>
                    <div><Label>Model</Label><input value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', padding: '9px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                    <div><Label>Year</Label><Sel value={year} onChange={setYear} options={vehicleYears} placeholder="Select" /></div>
                    <div><Label>Color</Label><SearchSel value={color} onChange={setColor} options={vehicleColors} placeholder="Select" /></div>
                    <div><Label>Risk</Label><Sel value={risk} onChange={setRisk} options={[...risks]} placeholder="Select" /></div>
                </div>
            </div>
            <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 14 }}>Vehicle Photos</h3>
                <VehiclePhotos photos={photos} onPhotosChange={setPhotos} editable />
            </div>
            <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 14 }}>Notes</h3>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{ width: '100%', padding: '12px 14px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
            </div>
        </div>
    </>
    );
}
VehicleEdit.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
