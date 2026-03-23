import PageMeta from '../../components/layout/PageMeta';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui';
import { theme } from '../../lib/theme';
import { getDeviceById, deviceStatusColors, deviceTypeColors, type DeviceStatus, type DeviceType } from '../../mock/devices';

function Signal({ v }: { v: number }) { return <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>{[1,2,3,4,5].map(i => <div key={i} style={{ width: 4, height: i * 3 + 2, borderRadius: 1, background: v >= i * 20 ? (v > 60 ? '#22c55e' : v > 30 ? '#f59e0b' : '#ef4444') : theme.border }} />)}</div>; }
function Battery({ v }: { v: number | null }) { if (v === null) return <span style={{ fontSize: 12, color: theme.textDim }}>AC Powered</span>; return <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 30, height: 14, border: `2px solid ${theme.textDim}`, borderRadius: 3, position: 'relative', overflow: 'hidden' }}><div style={{ height: '100%', width: `${v}%`, background: v > 50 ? '#22c55e' : v > 20 ? '#f59e0b' : '#ef4444', borderRadius: 1 }} /><div style={{ position: 'absolute', right: -5, top: 3, width: 3, height: 6, background: theme.textDim, borderRadius: '0 1px 1px 0' }} /></div><span style={{ fontSize: 13, fontWeight: 700, color: v > 20 ? theme.text : theme.danger }}>{v}%</span></div>; }
const Field = ({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) => value ? <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 3 }}>{label}</div><div style={{ fontSize: 13, color: theme.text, fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', wordBreak: 'break-all' as const }}>{value}</div></div> : null;
const Bool = ({ label, value }: { label: string; value: boolean }) => <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><div style={{ width: 14, height: 14, borderRadius: 3, background: value ? '#22c55e' : theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{value && <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div><span style={{ fontSize: 12, color: value ? theme.text : theme.textDim }}>{label}</span></div>;

export default function DevicesShow() {
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const d = getDeviceById(Number(id));
    if (!d) return <div style={{ textAlign: 'center', padding: 60 }}><h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Device Not Found</h2><Button variant="secondary" onClick={() => router.visit('/devices')} style={{ width: 'auto', padding: '10px 20px', marginTop: 16 }}>Back</Button></div>;

    const tc = deviceTypeColors[d.type]; const sc = deviceStatusColors[d.status];
    const isCamera = d.type.includes('Camera');

    return (
                <>
        <PageMeta title="Device Detail" section="devices" />
<div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 12, background: `${tc}15`, border: `2px solid ${tc}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{d.type === 'GPS Tracker' ? '📡' : d.type === 'Hidden Camera' ? '🕵️' : d.type === 'Public Camera' ? '📹' : d.type === 'Private Camera' ? '🔒' : '🎙️'}</div>
                        <div>
                            <h1 style={{ fontSize: 20, fontWeight: 800, color: theme.text, margin: 0 }}>{d.name}</h1>
                            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${tc}12`, color: tc, border: `1px solid ${tc}30` }}>{d.type}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${sc}12`, color: sc, border: `1px solid ${sc}30`, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: sc }} />{d.status}</span>
                                <span style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{d.uuid}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button variant="secondary" onClick={() => router.visit('/devices')}>Back</Button>
                        <Button variant="secondary" onClick={() => router.visit(`/devices/${d.id}/edit`)}>Edit</Button>
                    </div>
                </div>
            </div>

            {/* Status cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
                <div className="dev-spec-card"><div style={{ fontSize: 10, color: theme.textDim, fontWeight: 600, marginBottom: 6 }}>SIGNAL</div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Signal v={d.signalStrength} /><span style={{ fontSize: 16, fontWeight: 800, color: d.signalStrength > 60 ? '#22c55e' : d.signalStrength > 30 ? '#f59e0b' : '#ef4444' }}>{d.signalStrength}%</span></div></div>
                <div className="dev-spec-card"><div style={{ fontSize: 10, color: theme.textDim, fontWeight: 600, marginBottom: 6 }}>BATTERY</div><Battery v={d.batteryLevel} /></div>
                <div className="dev-spec-card"><div style={{ fontSize: 10, color: theme.textDim, fontWeight: 600, marginBottom: 6 }}>LAST SEEN</div><div style={{ fontSize: 12, fontWeight: 600, color: theme.text, fontFamily: "'JetBrains Mono', monospace" }}>{new Date(d.lastSeen).toLocaleString()}</div></div>
                <div className="dev-spec-card"><div style={{ fontSize: 10, color: theme.textDim, fontWeight: 600, marginBottom: 6 }}>INSTALLED</div><div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{new Date(d.installDate).toLocaleDateString()}</div></div>
            </div>

            {/* Detail grid */}
            <div className="dev-detail-grid" style={{ marginBottom: 20 }}>
                {/* Hardware */}
                <div className="dev-spec-card">
                    <div className="dev-spec-title">Hardware</div>
                    <Field label="Manufacturer" value={d.manufacturer} />
                    <Field label="Model" value={d.model} />
                    <Field label="Serial Number" value={d.serialNumber} mono />
                    <Field label="Firmware" value={d.firmwareVersion} mono />
                    <Field label="Storage" value={d.storageCapacity} />
                </div>

                {/* Network */}
                <div className="dev-spec-card">
                    <div className="dev-spec-title">Network</div>
                    <Field label="Protocol" value={d.protocol} />
                    <Field label="IP Address" value={d.ipAddress} mono />
                    <Field label="MAC Address" value={d.macAddress} mono />
                    <Bool label="Encryption Enabled" value={d.encryptionEnabled} />
                </div>

                {/* Capabilities */}
                {(isCamera || d.type === 'Audio Recorder') && <div className="dev-spec-card">
                    <div className="dev-spec-title">Capabilities</div>
                    {isCamera && <Field label="Resolution" value={d.resolution} />}
                    {isCamera && <Bool label="Night Vision" value={d.nightVision} />}
                    <Bool label="Motion Detection" value={d.motionDetection} />
                </div>}

                {/* Location */}
                <div className="dev-spec-card">
                    <div className="dev-spec-title">Location</div>
                    <Field label="Location" value={d.locationName} />
                    {d.lat && d.lng && <Field label="Coordinates" value={`${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}`} mono />}
                </div>
            </div>

            {/* Assignment */}
            {(d.personName || d.orgName) && <div className="dev-spec-card" style={{ marginBottom: 20 }}>
                <div className="dev-spec-title">Assignment</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {d.personName && <div onClick={() => router.visit(`/persons/${d.personId}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: 'pointer', transition: 'background 0.12s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={e => (e.currentTarget.style.background = theme.bg)}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: theme.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg></div>
                        <div><div style={{ fontSize: 12, fontWeight: 600, color: theme.accent }}>{d.personName}</div><div style={{ fontSize: 10, color: theme.textDim }}>Person</div></div>
                    </div>}
                    {d.orgName && <div onClick={() => router.visit(`/organizations/${d.orgId}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: 'pointer', transition: 'background 0.12s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={e => (e.currentTarget.style.background = theme.bg)}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="6" width="5" height="9"/><rect x="9" y="2" width="5" height="13"/><line x1="4" y1="9" x2="4" y2="9.01"/><line x1="4" y1="12" x2="4" y2="12.01"/><line x1="12" y1="5" x2="12" y2="5.01"/><line x1="12" y1="8" x2="12" y2="8.01"/><line x1="12" y1="11" x2="12" y2="11.01"/></svg></div>
                        <div><div style={{ fontSize: 12, fontWeight: 600, color: '#8b5cf6' }}>{d.orgName}</div><div style={{ fontSize: 10, color: theme.textDim }}>Organization</div></div>
                    </div>}
                </div>
            </div>}

            {/* Notes */}
            {d.notes && <div className="dev-spec-card">
                <div className="dev-spec-title">Notes</div>
                <p style={{ fontSize: 13, color: theme.text, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' as const }}>{d.notes}</p>
            </div>}
        </div>
    </>
    );
}
DevicesShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
