import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui';
import { theme } from '../../lib/theme';
import { mockDevices, deviceTypes, deviceStatuses, deviceStatusColors, deviceTypeColors, type DeviceStatus, type DeviceType } from '../../mock/devices';

function Signal({ v }: { v: number }) { return <div className="dev-signal">{[1,2,3,4,5].map(i => <div key={i} className="dev-signal-bar" style={{ height: i * 2 + 2, background: v >= i * 20 ? (v > 60 ? '#22c55e' : v > 30 ? '#f59e0b' : '#ef4444') : `${theme.border}` }} />)}</div>; }
function Battery({ v }: { v: number | null }) { if (v === null) return <span style={{ fontSize: 10, color: theme.textDim }}>AC</span>; return <div className="dev-battery"><div className="dev-battery-shell"><div className="dev-battery-fill" style={{ width: `${v}%`, background: v > 50 ? '#22c55e' : v > 20 ? '#f59e0b' : '#ef4444' }} /></div><span style={{ color: v > 20 ? theme.textSecondary : theme.danger }}>{v}%</span></div>; }
function StatusDot({ s }: { s: DeviceStatus }) { return <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span className="dev-status-dot" style={{ background: deviceStatusColors[s] }} /><span style={{ fontSize: 11, fontWeight: 600, color: deviceStatusColors[s] }}>{s}</span></div>; }
function TypeBadge({ t }: { t: DeviceType }) { const c = deviceTypeColors[t]; return <span className="dev-type-badge" style={{ background: `${c}12`, color: c, border: `1px solid ${c}30` }}>{t}</span>; }

export default function DevicesIndex() {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const filtered = mockDevices.filter(d => {
        if (search && !`${d.name} ${d.manufacturer} ${d.model} ${d.serialNumber} ${d.personName || ''} ${d.orgName || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterType && d.type !== filterType) return false;
        if (filterStatus && d.status !== filterStatus) return false;
        return true;
    });

    const counts = { total: mockDevices.length, online: mockDevices.filter(d => d.status === 'Online').length, offline: mockDevices.filter(d => d.status === 'Offline').length, maintenance: mockDevices.filter(d => d.status === 'Maintenance').length };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div><h1 style={{ fontSize: 20, fontWeight: 800, color: theme.text, margin: 0 }}>Surveillance Devices</h1><p style={{ fontSize: 12, color: theme.textSecondary, margin: '4px 0 0' }}>{counts.total} devices · {counts.online} online · {counts.offline} offline · {counts.maintenance} maintenance</p></div>
                <Button onClick={() => router.visit('/devices/create')}>+ New Device</Button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 7, padding: '0 10px', flex: 1, minWidth: 180, maxWidth: 320 }}><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search devices..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} /></div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '8px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}><option value="">All Types</option>{deviceTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}><option value="">All Status</option>{deviceStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <span style={{ fontSize: 11, color: theme.textDim }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Table */}
            <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead><tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${theme.border}` }}>
                            {['Name','Type','Status','Signal','Battery','Location','Assigned To','Last Seen',''].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em', whiteSpace: 'nowrap' as const }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {filtered.length === 0 ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: theme.textDim }}>No devices match your filters.</td></tr> : filtered.map(d => (
                                <tr key={d.id} onClick={() => router.visit(`/devices/${d.id}`)} style={{ borderBottom: `1px solid ${theme.border}`, cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td style={{ padding: '10px 12px' }}><div style={{ fontWeight: 600, color: theme.text, whiteSpace: 'nowrap' as const }}>{d.name}</div><div style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{d.uuid}</div></td>
                                    <td style={{ padding: '10px 12px' }}><TypeBadge t={d.type} /></td>
                                    <td style={{ padding: '10px 12px' }}><StatusDot s={d.status} /></td>
                                    <td style={{ padding: '10px 12px' }}><Signal v={d.signalStrength} /></td>
                                    <td style={{ padding: '10px 12px' }}><Battery v={d.batteryLevel} /></td>
                                    <td style={{ padding: '10px 12px', maxWidth: 160 }}><div style={{ fontSize: 11, color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.locationName}</div></td>
                                    <td style={{ padding: '10px 12px' }}>{d.personName ? <span style={{ fontSize: 11, color: theme.accent, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); router.visit(`/persons/${d.personId}`); }}>{d.personName}</span> : d.orgName ? <span style={{ fontSize: 11, color: '#8b5cf6', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); router.visit(`/organizations/${d.orgId}`); }}>{d.orgName}</span> : <span style={{ fontSize: 11, color: theme.textDim }}>—</span>}</td>
                                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' as const }}><span style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{new Date(d.lastSeen).toLocaleString()}</span></td>
                                    <td style={{ padding: '10px 8px' }}><button onClick={e => { e.stopPropagation(); router.visit(`/devices/${d.id}/edit`); }} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: '4px 8px', color: theme.textSecondary, cursor: 'pointer', fontSize: 10, fontFamily: 'inherit', fontWeight: 600 }}>Edit</button></td>
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
