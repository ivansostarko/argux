import PageMeta from '../../components/layout/PageMeta';
import { useState, useRef, useEffect, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { mockUAVs as FALLBACK_UAVS, uavStatusConfig, uavTypeConfig, uavClassConfig, type UAV, type UAVStatus, type UAVType, type UAVClass } from '../../mock/uav';

function getCsrf(): string { return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''); }
async function apiCall(url: string, method = 'GET', body?: any): Promise<any> {
    try {
        const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        return { ok: res.ok, status: res.status, data: await res.json() };
    } catch { return { ok: false, status: 0, data: {} }; }
}

/* ═══ HELPERS ═══ */
function StatusBadge({ s }: { s: UAVStatus }) { const c = uavStatusConfig[s]; return <span className="uav-stat-chip" style={{ background: `${c.color}12`, color: c.color, border: `1px solid ${c.color}25` }}>{c.icon} {c.label}</span>; }
function TypeBadge({ t }: { t: UAVType }) { const c = uavTypeConfig[t]; return <span className="uav-stat-chip" style={{ background: `${c.color}12`, color: c.color, border: `1px solid ${c.color}25` }}>{c.icon} {c.label}</span>; }
function ClassBadge({ c: cl }: { c: UAVClass }) { const cc = uavClassConfig[cl]; return <span className="uav-stat-chip" style={{ background: `${cc.color}12`, color: cc.color, border: `1px solid ${cc.color}25` }}>{cc.label}</span>; }
function Battery({ v, voltage }: { v: number; voltage: number }) { const col = v > 60 ? '#22c55e' : v > 25 ? '#f59e0b' : '#ef4444'; return <div className="uav-bat"><div className="uav-bat-shell"><div className="uav-bat-fill" style={{ width: `${v}%`, background: col }} /></div><span style={{ fontSize: 10, fontWeight: 700, color: col, fontFamily: "'JetBrains Mono',monospace" }}>{v}%</span><span style={{ fontSize: 8, color: theme.textDim }}>{voltage}V</span></div>; }
function SensorTag({ label }: { label: string }) { return <span className="uav-sensor-tag">{label}</span>; }
function KPI({ label, value, color, icon, active, onClick }: { label: string; value: number; color: string; icon: string; active?: boolean; onClick?: () => void }) {
    return <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${active ? color + '50' : theme.border}`, background: active ? `${color}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', flex: 1, minWidth: 110 }} onMouseEnter={e => !active && (e.currentTarget.style.background = `${color}04`)} onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div style={{ textAlign: 'left' as const }}><div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{value}</div><div style={{ fontSize: 9, color: theme.textDim, fontWeight: 600 }}>{label}</div></div>
    </button>;
}

/* ═══ FORM DEFAULTS ═══ */
const emptyUAV: Partial<UAV> = { callsign: '', model: '', manufacturer: '', type: 'quadcopter', uavClass: 'surveillance', serialNumber: '', status: 'standby', firmware: '', weight: 0, maxPayload: 0, wingspan: 0, maxSpeed: 0, cruiseSpeed: 0, maxAltitude: 0, maxRange: 0, endurance: 0, batteryType: 'Li-Po', batteryCapacity: 5000, batteryLevel: 100, batteryVoltage: 22.2, chargeCycles: 0, sensors: [], hasGPS: true, hasRTK: false, hasThermal: false, hasLiDAR: false, hasNightVision: false, hasEW: false, cameraResolution: '', gimbalType: '', dataLink: '', frequency: '2.4 GHz', encryptedLink: false, videoFeed: true, maxDataRate: '', homeBase: 'Zagreb HQ', lat: null, lng: null, lastFlightDate: '', totalFlightHours: 0, totalFlights: 0, lastMaintenance: '', nextMaintenance: '', acquired: new Date().toISOString().split('T')[0], notes: '', photo: '' };

/* ═══ MAIN COMPONENT ═══ */
export default function UAVIndex() {
    const toast = useToast();
    const [uavs, setUavs] = useState<UAV[]>(FALLBACK_UAVS);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            const { ok, data } = await apiCall('/mock-api/uav');
            if (ok && data.data) setUavs(data.data);
        };
        load();
    }, []);
    const [statusFilter, setStatusFilter] = useState<UAVStatus | null>(null);
    const [typeFilter, setTypeFilter] = useState<string[]>([]);
    const [classFilter, setClassFilter] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'callsign' | 'status' | 'hours' | 'battery' | 'lastFlight'>('callsign');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    // Modals
    const [showCreate, setShowCreate] = useState(false);
    const [showDetail, setShowDetail] = useState<UAV | null>(null);
    const [showEdit, setShowEdit] = useState<UAV | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [detailTab, setDetailTab] = useState<'overview' | 'specs' | 'sensors' | 'comms' | 'history'>('overview');
    const [formData, setFormData] = useState<Partial<UAV>>(emptyUAV);

    // Filtered + sorted
    const filtered = useMemo(() => {
        let list = [...uavs];
        if (statusFilter) list = list.filter(u => u.status === statusFilter);
        if (typeFilter.length > 0) list = list.filter(u => typeFilter.includes(u.type));
        if (classFilter.length > 0) list = list.filter(u => classFilter.includes(u.uavClass));
        if (search) { const q = search.toLowerCase(); list = list.filter(u => u.callsign.toLowerCase().includes(q) || u.model.toLowerCase().includes(q) || u.manufacturer.toLowerCase().includes(q) || u.serialNumber.toLowerCase().includes(q) || (u.assignedOperator || '').toLowerCase().includes(q) || (u.assignedOperation || '').toLowerCase().includes(q)); }
        list.sort((a, b) => {
            let cmp = 0;
            if (sortBy === 'callsign') cmp = a.callsign.localeCompare(b.callsign);
            else if (sortBy === 'status') cmp = a.status.localeCompare(b.status);
            else if (sortBy === 'hours') cmp = a.totalFlightHours - b.totalFlightHours;
            else if (sortBy === 'battery') cmp = a.batteryLevel - b.batteryLevel;
            else if (sortBy === 'lastFlight') cmp = a.lastFlightDate.localeCompare(b.lastFlightDate);
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return list;
    }, [uavs, search, statusFilter, typeFilter, classFilter, sortBy, sortDir]);

    const stats = useMemo(() => {
        const s: Record<UAVStatus, number> = { operational: 0, standby: 0, deployed: 0, maintenance: 0, lost: 0, retired: 0 };
        uavs.forEach(u => s[u.status]++);
        return { ...s, total: uavs.length, totalHours: Math.round(uavs.reduce((a, u) => a + u.totalFlightHours, 0)) };
    }, [uavs]);

    // CRUD handlers
    const handleCreate = () => {
        const newUAV: UAV = { ...emptyUAV, ...formData, id: Date.now(), sensors: formData.sensors || [] } as UAV;
        setUavs(prev => [...prev, newUAV]); setShowCreate(false); setFormData(emptyUAV);
        toast?.({ title: 'UAV Created', description: `${newUAV.callsign} added to fleet.`, variant: 'success' });
    };
    const handleEdit = () => {
        if (!showEdit) return;
        setUavs(prev => prev.map(u => u.id === showEdit.id ? { ...u, ...formData } as UAV : u));
        setShowEdit(null); setFormData(emptyUAV);
        toast?.({ title: 'UAV Updated', description: `${formData.callsign} updated.`, variant: 'success' });
    };
    const handleDelete = () => {
        if (!deleteId) return;
        const uav = uavs.find(u => u.id === deleteId);
        setUavs(prev => prev.filter(u => u.id !== deleteId)); setDeleteId(null);
        toast?.({ title: 'UAV Removed', description: `${uav?.callsign} removed from fleet.`, variant: 'success' });
    };
    const openEdit = (u: UAV) => { setFormData({ ...u }); setShowEdit(u); };
    const openCreate = () => { setFormData({ ...emptyUAV }); setShowCreate(true); };

    /* ═══ FORM MODAL ═══ */
    const FormModal = ({ title, onSubmit, onClose }: { title: string; onSubmit: () => void; onClose: () => void }) => {
        const f = formData;
        const set = (k: string, v: any) => setFormData(prev => ({ ...prev, [k]: v }));
        const Input = ({ label, k, type = 'text', placeholder = '' }: { label: string; k: string; type?: string; placeholder?: string }) => (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                <label style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.06em' }}>{label}</label>
                <input value={(f as any)[k] ?? ''} onChange={e => set(k, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} type={type} placeholder={placeholder} style={{ padding: '7px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', outline: 'none' }} />
            </div>
        );
        const Select = ({ label, k, options }: { label: string; k: string; options: { value: string; label: string }[] }) => (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                <label style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.06em' }}>{label}</label>
                <select value={(f as any)[k] ?? ''} onChange={e => set(k, e.target.value)} style={{ padding: '7px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', outline: 'none' }}>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
        );
        const Check = ({ label, k }: { label: string; k: string }) => (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 10, color: theme.text }}>
                <input type="checkbox" checked={!!(f as any)[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: theme.accent }} />{label}
            </label>
        );
        const Section = ({ title: t, children }: { title: string; children: React.ReactNode }) => (
            <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: theme.accent, letterSpacing: '0.1em', marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${theme.border}` }}>{t}</div>
                {children}
            </div>
        );
        return <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, width: '95%', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', animation: 'argux-fadeIn 0.15s' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>🛩️ {title}</div>
                    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' as const, padding: '16px 20px' }}>
                    <Section title="IDENTIFICATION">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                            <Input label="Callsign *" k="callsign" placeholder="e.g. HAWK-1" />
                            <Input label="Serial Number" k="serialNumber" placeholder="e.g. BK-2024-00147" />
                            <Input label="Model *" k="model" placeholder="e.g. Matrice 350 RTK" />
                            <Input label="Manufacturer" k="manufacturer" placeholder="e.g. DJI" />
                            <Select label="Type *" k="type" options={Object.entries(uavTypeConfig).map(([v, c]) => ({ value: v, label: `${c.icon} ${c.label}` }))} />
                            <Select label="Class" k="uavClass" options={Object.entries(uavClassConfig).map(([v, c]) => ({ value: v, label: c.label }))} />
                            <Select label="Status" k="status" options={Object.entries(uavStatusConfig).map(([v, c]) => ({ value: v, label: `${c.icon} ${c.label}` }))} />
                            <Input label="Firmware" k="firmware" placeholder="e.g. v4.2.1" />
                        </div>
                    </Section>
                    <Section title="PHYSICAL SPECS">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px 12px' }}>
                            <Input label="Weight (kg)" k="weight" type="number" />
                            <Input label="Max Payload (kg)" k="maxPayload" type="number" />
                            <Input label="Wingspan/Diag (cm)" k="wingspan" type="number" />
                            <Input label="Endurance (min)" k="endurance" type="number" />
                            <Input label="Max Speed (km/h)" k="maxSpeed" type="number" />
                            <Input label="Cruise (km/h)" k="cruiseSpeed" type="number" />
                            <Input label="Max Alt (m)" k="maxAltitude" type="number" />
                            <Input label="Max Range (km)" k="maxRange" type="number" />
                        </div>
                    </Section>
                    <Section title="BATTERY / POWER">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px 12px' }}>
                            <Input label="Battery Type" k="batteryType" />
                            <Input label="Capacity (mAh)" k="batteryCapacity" type="number" />
                            <Input label="Voltage (V)" k="batteryVoltage" type="number" />
                            <Input label="Charge Cycles" k="chargeCycles" type="number" />
                        </div>
                    </Section>
                    <Section title="SENSORS & PAYLOAD">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                            <Check label="GPS" k="hasGPS" /><Check label="RTK" k="hasRTK" /><Check label="Thermal" k="hasThermal" />
                            <Check label="LiDAR" k="hasLiDAR" /><Check label="Night Vision" k="hasNightVision" /><Check label="EW Capable" k="hasEW" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginTop: 8 }}>
                            <Input label="Camera Resolution" k="cameraResolution" placeholder="e.g. 4K 30fps" />
                            <Input label="Gimbal Type" k="gimbalType" placeholder="e.g. 3-axis stabilized" />
                        </div>
                    </Section>
                    <Section title="COMMUNICATION">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                            <Input label="Data Link" k="dataLink" /><Input label="Frequency" k="frequency" />
                            <Input label="Max Data Rate" k="maxDataRate" /><Check label="Encrypted Link" k="encryptedLink" />
                        </div>
                    </Section>
                    <Section title="ASSIGNMENT">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 12px' }}>
                            <Input label="Operator" k="assignedOperator" /><Input label="Operation" k="assignedOperation" /><Input label="Team" k="assignedTeam" />
                            <Input label="Home Base" k="homeBase" /><Input label="Acquired" k="acquired" type="date" />
                        </div>
                    </Section>
                    <Section title="NOTES">
                        <textarea value={f.notes || ''} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Mission notes, maintenance log..." style={{ width: '100%', padding: '8px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const }} />
                    </Section>
                </div>
                <div style={{ padding: '12px 20px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                    <button onClick={onSubmit} disabled={!f.callsign || !f.model} style={{ padding: '8px 24px', borderRadius: 6, border: 'none', background: f.callsign && f.model ? theme.accent : theme.border, color: '#fff', fontSize: 11, fontWeight: 700, cursor: f.callsign && f.model ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>{showEdit ? 'Save Changes' : 'Add UAV'}</button>
                </div>
            </div>
        </div>;
    };

    /* ═══ DETAIL MODAL ═══ */
    const DetailModal = ({ u }: { u: UAV }) => {
        const sc = uavStatusConfig[u.status]; const tc = uavTypeConfig[u.type];
        const capIcons = [u.hasGPS && 'GPS', u.hasRTK && 'RTK', u.hasThermal && 'Thermal', u.hasLiDAR && 'LiDAR', u.hasNightVision && 'NVG', u.hasEW && 'EW', u.videoFeed && 'Video', u.encryptedLink && 'Encrypted'].filter(Boolean);
        const Row = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: string }) => <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderBottom: `1px solid ${theme.border}08` }}>{icon && <span style={{ fontSize: 12, width: 18, textAlign: 'center' as const }}>{icon}</span>}<span style={{ fontSize: 9, color: theme.textDim, fontWeight: 700, width: 100, flexShrink: 0, letterSpacing: '0.05em' }}>{label}</span><span style={{ fontSize: 11, color: theme.text, fontFamily: "'JetBrains Mono',monospace", flex: 1, wordBreak: 'break-word' as const }}>{value}</span></div>;
        return <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) setShowDetail(null); }}>
            <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, width: '95%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', animation: 'argux-fadeIn 0.15s' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: `${tc.color}12`, border: `2px solid ${tc.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{tc.icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>{u.callsign}</div><div style={{ fontSize: 11, color: theme.textDim }}>{u.manufacturer} {u.model}</div></div>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 4 }}><StatusBadge s={u.status} /><TypeBadge t={u.type} /></div>
                        <button onClick={() => setShowDetail(null)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>✕</button>
                    </div>
                    {/* Capability badges */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginTop: 8 }}>{capIcons.map(c => <span key={String(c)} className="uav-sensor-tag">{c}</span>)}</div>
                </div>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}10`, flexShrink: 0 }}>
                    {(['overview', 'specs', 'sensors', 'comms', 'history'] as const).map(t => <button key={t} onClick={() => setDetailTab(t)} style={{ flex: 1, padding: '8px 0', border: 'none', borderBottom: `2px solid ${detailTab === t ? theme.accent : 'transparent'}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 9, fontWeight: 700, color: detailTab === t ? theme.accent : theme.textDim, transition: 'all 0.15s', textTransform: 'capitalize' as const }}>{t === 'overview' ? '📊 Overview' : t === 'specs' ? '📐 Specs' : t === 'sensors' ? '🎯 Sensors' : t === 'comms' ? '📡 Comms' : '📋 History'}</button>)}
                </div>
                {/* Tab content */}
                <div style={{ flex: 1, overflowY: 'auto' as const, padding: '12px 20px' }}>
                    {detailTab === 'overview' && <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
                            {[{ l: 'Flight Hours', v: u.totalFlightHours.toFixed(1), c: '#3b82f6', i: '⏱️' },{ l: 'Total Flights', v: String(u.totalFlights), c: '#22c55e', i: '🛫' },{ l: 'Battery', v: `${u.batteryLevel}%`, c: u.batteryLevel > 50 ? '#22c55e' : u.batteryLevel > 20 ? '#f59e0b' : '#ef4444', i: '🔋' }].map(k => <div key={k.l} style={{ padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, textAlign: 'center' as const }}><div style={{ fontSize: 10 }}>{k.i}</div><div style={{ fontSize: 16, fontWeight: 800, color: k.c, fontFamily: "'JetBrains Mono',monospace" }}>{k.v}</div><div style={{ fontSize: 8, color: theme.textDim }}>{k.l}</div></div>)}
                        </div>
                        <Row label="Class" value={<ClassBadge c={u.uavClass} />} icon="🏷️" />
                        <Row label="Serial No." value={u.serialNumber} icon="🔢" />
                        <Row label="Firmware" value={u.firmware} icon="💾" />
                        <Row label="Home Base" value={u.homeBase} icon="🏠" />
                        <Row label="Operator" value={u.assignedOperator || '—'} icon="👤" />
                        <Row label="Operation" value={u.assignedOperation || '—'} icon="🎯" />
                        <Row label="Team" value={u.assignedTeam || '—'} icon="👥" />
                        <Row label="Last Flight" value={u.lastFlightDate || '—'} icon="📅" />
                        <Row label="Acquired" value={u.acquired} icon="📦" />
                        {u.notes && <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', border: `1px solid ${theme.border}`, fontSize: 10, color: theme.textSecondary, lineHeight: 1.6 }}>📝 {u.notes}</div>}
                    </>}
                    {detailTab === 'specs' && <>
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', marginBottom: 6 }}>PHYSICAL</div>
                        <Row label="Weight" value={`${u.weight} kg`} icon="⚖️" />
                        <Row label="Max Payload" value={`${u.maxPayload} kg`} icon="📦" />
                        <Row label="Wingspan/Diag" value={`${u.wingspan} cm`} icon="📏" />
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', marginTop: 10, marginBottom: 6 }}>PERFORMANCE</div>
                        <Row label="Max Speed" value={`${u.maxSpeed} km/h`} icon="⚡" />
                        <Row label="Cruise Speed" value={`${u.cruiseSpeed} km/h`} icon="✈️" />
                        <Row label="Max Altitude" value={`${u.maxAltitude.toLocaleString()} m`} icon="🏔️" />
                        <Row label="Max Range" value={`${u.maxRange} km`} icon="📡" />
                        <Row label="Endurance" value={`${u.endurance} min (${(u.endurance / 60).toFixed(1)} hrs)`} icon="⏱️" />
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', marginTop: 10, marginBottom: 6 }}>BATTERY</div>
                        <Row label="Type" value={u.batteryType} icon="🔋" />
                        <Row label="Capacity" value={`${u.batteryCapacity.toLocaleString()} mAh`} icon="⚡" />
                        <Row label="Voltage" value={`${u.batteryVoltage} V`} icon="🔌" />
                        <Row label="Charge Cycles" value={String(u.chargeCycles)} icon="🔄" />
                        <Row label="Current Level" value={<Battery v={u.batteryLevel} voltage={u.batteryVoltage} />} icon="📊" />
                    </>}
                    {detailTab === 'sensors' && <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                            {[{ l: 'GPS', v: u.hasGPS },{ l: 'RTK', v: u.hasRTK },{ l: 'Thermal', v: u.hasThermal },{ l: 'LiDAR', v: u.hasLiDAR },{ l: 'Night Vision', v: u.hasNightVision },{ l: 'EW', v: u.hasEW }].map(s => <div key={s.l} style={{ padding: '6px 10px', borderRadius: 5, border: `1px solid ${s.v ? '#22c55e25' : theme.border}`, background: s.v ? 'rgba(34,197,94,0.04)' : 'transparent', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.v ? '#22c55e' : '#6b7280' }} /><span style={{ fontSize: 10, color: s.v ? '#22c55e' : theme.textDim, fontWeight: 600 }}>{s.l}</span>
                            </div>)}
                        </div>
                        <Row label="Camera" value={u.cameraResolution || '—'} icon="📹" />
                        <Row label="Gimbal" value={u.gimbalType || '—'} icon="🎯" />
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', marginTop: 10, marginBottom: 6 }}>SENSOR PACKAGE</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>{u.sensors.map(s => <SensorTag key={s} label={s} />)}{u.sensors.length === 0 && <span style={{ fontSize: 10, color: theme.textDim }}>No sensors configured</span>}</div>
                    </>}
                    {detailTab === 'comms' && <>
                        <Row label="Data Link" value={u.dataLink || '—'} icon="📡" />
                        <Row label="Frequency" value={u.frequency} icon="📻" />
                        <Row label="Encrypted" value={u.encryptedLink ? '✅ Yes' : '❌ No'} icon="🔒" />
                        <Row label="Video Feed" value={u.videoFeed ? '✅ Yes' : '❌ No'} icon="🎥" />
                        <Row label="Max Data Rate" value={u.maxDataRate || '—'} icon="⚡" />
                    </>}
                    {detailTab === 'history' && <>
                        <Row label="Total Hours" value={`${u.totalFlightHours.toFixed(1)} hrs`} icon="⏱️" />
                        <Row label="Total Flights" value={String(u.totalFlights)} icon="🛫" />
                        <Row label="Last Flight" value={u.lastFlightDate || '—'} icon="📅" />
                        <Row label="Last Maint." value={u.lastMaintenance || '—'} icon="🔧" />
                        <Row label="Next Maint." value={u.nextMaintenance || '—'} icon="📋" />
                        <Row label="Battery Cycles" value={`${u.chargeCycles} cycles`} icon="🔄" />
                        <Row label="Acquired" value={u.acquired} icon="📦" />
                    </>}
                </div>
                {/* Footer */}
                <div style={{ padding: '10px 20px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 6, justifyContent: 'flex-end', flexShrink: 0 }}>
                    <button onClick={() => { openEdit(u); setShowDetail(null); }} style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${theme.accent}40`, background: `${theme.accent}08`, color: theme.accent, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✏️ Edit</button>
                    <button onClick={() => { setDeleteId(u.id); setShowDetail(null); }} style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${theme.danger}30`, background: `${theme.danger}06`, color: theme.danger, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Delete</button>
                </div>
            </div>
        </div>;
    };

    return (
        <AppLayout>
            <PageMeta title="UAV Fleet — ARGUX" />
            <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' as const, gap: 8 }}>
                    <div><div style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>🛩️ UAV Fleet Management</div><div style={{ fontSize: 11, color: theme.textDim }}>Manage, configure, and track unmanned aerial vehicles</div></div>
                    <button onClick={openCreate} style={{ padding: '9px 18px', borderRadius: 6, border: 'none', background: theme.accent, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>+ Add UAV</button>
                </div>

                {/* KPI chips */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' as const }}>
                    <KPI label="Total Fleet" value={stats.total} color={theme.accent} icon="🛩️" active={!statusFilter} onClick={() => setStatusFilter(null)} />
                    <KPI label="Operational" value={stats.operational} color="#22c55e" icon="✅" active={statusFilter === 'operational'} onClick={() => setStatusFilter(statusFilter === 'operational' ? null : 'operational')} />
                    <KPI label="Deployed" value={stats.deployed} color="#f59e0b" icon="🛫" active={statusFilter === 'deployed'} onClick={() => setStatusFilter(statusFilter === 'deployed' ? null : 'deployed')} />
                    <KPI label="Standby" value={stats.standby} color="#3b82f6" icon="💤" active={statusFilter === 'standby'} onClick={() => setStatusFilter(statusFilter === 'standby' ? null : 'standby')} />
                    <KPI label="Maintenance" value={stats.maintenance} color="#8b5cf6" icon="🔧" active={statusFilter === 'maintenance'} onClick={() => setStatusFilter(statusFilter === 'maintenance' ? null : 'maintenance')} />
                    <KPI label="Flight Hours" value={stats.totalHours} color="#06b6d4" icon="⏱️" />
                </div>

                {/* Filters bar */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' as const, alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${search ? theme.accent + '50' : theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search callsign, model, operator..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit' }} />
                        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', fontSize: 10 }}>✕</button>}
                    </div>
                    {/* Type filter */}
                    <div style={{ display: 'flex', gap: 3 }}>
                        {Object.entries(uavTypeConfig).map(([k, v]) => { const on = typeFilter.includes(k); return <button key={k} onClick={() => setTypeFilter(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])} style={{ padding: '5px 8px', borderRadius: 5, border: `1px solid ${on ? v.color + '40' : theme.border}`, background: on ? `${v.color}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, fontWeight: 700, color: on ? v.color : theme.textDim, display: 'flex', alignItems: 'center', gap: 3 }} title={v.label}><span style={{ fontSize: 12 }}>{v.icon}</span></button>; })}
                    </div>
                    {/* Sort */}
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ padding: '6px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 10, fontFamily: 'inherit', cursor: 'pointer' }}>
                        <option value="callsign">Sort: Callsign</option><option value="status">Sort: Status</option><option value="hours">Sort: Hours</option><option value="battery">Sort: Battery</option><option value="lastFlight">Sort: Last Flight</option>
                    </select>
                    <button onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')} style={{ padding: '6px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, fontWeight: 700, fontFamily: 'inherit' }}>{sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}</button>
                </div>

                {/* Results info */}
                <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 10 }}>{filtered.length} of {uavs.length} UAVs{statusFilter ? ` · ${uavStatusConfig[statusFilter].label}` : ''}{typeFilter.length > 0 ? ` · ${typeFilter.length} types` : ''}</div>

                {/* UAV Grid */}
                {filtered.length === 0 ? <div style={{ padding: 60, textAlign: 'center' as const, border: `1px dashed ${theme.border}`, borderRadius: 10 }}><div style={{ fontSize: 40, opacity: 0.15 }}>🛩️</div><div style={{ fontSize: 14, color: theme.textSecondary, marginTop: 8 }}>No UAVs match your filters</div><button onClick={() => { setSearch(''); setStatusFilter(null); setTypeFilter([]); }} style={{ marginTop: 10, padding: '6px 16px', borderRadius: 5, border: `1px solid ${theme.accent}40`, background: `${theme.accent}08`, color: theme.accent, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Clear Filters</button></div> :
                <div className="uav-grid">
                    {filtered.map(u => {
                        const tc = uavTypeConfig[u.type]; const sc = uavStatusConfig[u.status];
                        return <div key={u.id} className="uav-card" onClick={() => { setDetailTab('overview'); setShowDetail(u); }} onContextMenu={e => { e.preventDefault(); }}>
                            {/* Card header with colored accent */}
                            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}10`, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 8, background: `${tc.color}10`, border: `1.5px solid ${tc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{tc.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>{u.callsign}</span><StatusBadge s={u.status} /></div>
                                    <div style={{ fontSize: 10, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{u.manufacturer} {u.model}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                    <button onClick={e => { e.stopPropagation(); openEdit(u); }} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => { e.currentTarget.style.background = `${theme.accent}08`; e.currentTarget.style.color = theme.accent; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textDim; }}>✏️</button>
                                    <button onClick={e => { e.stopPropagation(); setDeleteId(u.id); }} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.danger}25`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => { e.currentTarget.style.background = `${theme.danger}08`; e.currentTarget.style.color = theme.danger; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textDim; }}>🗑️</button>
                                </div>
                            </div>
                            {/* Card body */}
                            <div style={{ padding: '10px 14px' }}>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginBottom: 8 }}>
                                    <TypeBadge t={u.type} /><ClassBadge c={u.uavClass} />
                                </div>
                                {/* Stats row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
                                    <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: 12, fontWeight: 800, color: '#3b82f6', fontFamily: "'JetBrains Mono',monospace" }}>{u.totalFlightHours.toFixed(0)}h</div><div style={{ fontSize: 7, color: theme.textDim }}>Flight Hours</div></div>
                                    <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: 12, fontWeight: 800, color: '#22c55e', fontFamily: "'JetBrains Mono',monospace" }}>{u.totalFlights}</div><div style={{ fontSize: 7, color: theme.textDim }}>Flights</div></div>
                                    <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: 12, fontWeight: 800, color: u.batteryLevel > 50 ? '#22c55e' : u.batteryLevel > 20 ? '#f59e0b' : '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>{u.batteryLevel}%</div><div style={{ fontSize: 7, color: theme.textDim }}>Battery</div></div>
                                </div>
                                {/* Bottom info */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: `1px solid ${theme.border}08` }}>
                                    <div style={{ fontSize: 9, color: theme.textDim }}>{u.assignedOperator ? `👤 ${u.assignedOperator}` : '—'}{u.assignedOperation ? ` · 🎯 ${u.assignedOperation}` : ''}</div>
                                    <div style={{ fontSize: 8, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{u.lastFlightDate || '—'}</div>
                                </div>
                                {/* Capability dots */}
                                <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
                                    {[{ l: 'GPS', v: u.hasGPS, c: '#22c55e' },{ l: 'RTK', v: u.hasRTK, c: '#3b82f6' },{ l: 'Thermal', v: u.hasThermal, c: '#ef4444' },{ l: 'LiDAR', v: u.hasLiDAR, c: '#8b5cf6' },{ l: 'NVG', v: u.hasNightVision, c: '#f59e0b' },{ l: 'EW', v: u.hasEW, c: '#ec4899' }].map(s => <div key={s.l} title={s.l} style={{ width: 6, height: 6, borderRadius: '50%', background: s.v ? s.c : `${theme.border}40`, boxShadow: s.v ? `0 0 4px ${s.c}60` : 'none' }} />)}
                                </div>
                            </div>
                        </div>;
                    })}
                </div>}
            </div>

            {/* Modals */}
            {showCreate && <FormModal title="Add New UAV" onSubmit={handleCreate} onClose={() => setShowCreate(false)} />}
            {showEdit && <FormModal title={`Edit ${showEdit.callsign}`} onSubmit={handleEdit} onClose={() => setShowEdit(null)} />}
            {showDetail && <DetailModal u={showDetail} />}
            {deleteId && <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
                <div style={{ background: theme.bgCard, border: `1px solid ${theme.danger}30`, borderRadius: 12, padding: '24px 28px', maxWidth: 400, width: '90%', textAlign: 'center' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', animation: 'argux-fadeIn 0.15s' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 4 }}>Remove UAV</div>
                    <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 16 }}>Are you sure you want to remove <strong style={{ color: theme.danger }}>{uavs.find(u => u.id === deleteId)?.callsign}</strong> from the fleet? This action cannot be undone.</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button onClick={() => setDeleteId(null)} style={{ padding: '8px 20px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={handleDelete} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: theme.danger, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Remove UAV</button>
                    </div>
                </div>
            </div>}
        </AppLayout>
    );
}
