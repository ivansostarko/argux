import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { deviceTypes, deviceStatuses, deviceManufacturers, deviceProtocols, type Device } from '../../mock/devices';
import { mockPersons } from '../../mock/persons';
import { mockOrganizations } from '../../mock/organizations';

function SSel({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string }) {
    const [open, setOpen] = useState(false); const [q, setQ] = useState('');
    const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
    return <div style={{ position: 'relative' }}><button onClick={() => { setOpen(!open); setQ(''); }} style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: value ? theme.text : theme.textDim, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', justifyContent: 'space-between' }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{options.find(o => o.value === value)?.label || placeholder}</span><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4" /></svg></button>{open && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 8, zIndex: 60, maxHeight: 200, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}><div style={{ padding: '4px 6px', borderBottom: `1px solid ${theme.border}` }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus style={{ width: '100%', padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 11, fontFamily: 'inherit', outline: 'none' }} /></div><div style={{ overflowY: 'auto', flex: 1 }}><div onClick={() => { onChange(''); setOpen(false); }} style={{ padding: '5px 10px', fontSize: 11, color: theme.textDim, cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>— None —</div>{filtered.map(o => <div key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} style={{ padding: '5px 10px', cursor: 'pointer', fontSize: 11, color: value === o.value ? theme.accent : theme.text }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{o.label}</div>)}</div></div>}</div>;
}

interface Props { device?: Device; isEdit?: boolean; }

export default function DeviceForm({ device, isEdit }: Props) {
    const toast = useToast();
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState(device?.name || '');
    const [type, setType] = useState(device?.type || '');
    const [manufacturer, setManufacturer] = useState(device?.manufacturer || '');
    const [model, setModel] = useState(device?.model || '');
    const [serialNumber, setSerialNumber] = useState(device?.serialNumber || '');
    const [firmwareVersion, setFirmwareVersion] = useState(device?.firmwareVersion || '');
    const [status, setStatus] = useState(device?.status || 'Standby');
    const [protocol, setProtocol] = useState(device?.protocol || '');
    const [ipAddress, setIpAddress] = useState(device?.ipAddress || '');
    const [macAddress, setMacAddress] = useState(device?.macAddress || '');
    const [locationName, setLocationName] = useState(device?.locationName || '');
    const [lat, setLat] = useState(device?.lat?.toString() || '');
    const [lng, setLng] = useState(device?.lng?.toString() || '');
    const [resolution, setResolution] = useState(device?.resolution || '');
    const [nightVision, setNightVision] = useState(device?.nightVision || false);
    const [motionDetection, setMotionDetection] = useState(device?.motionDetection || false);
    const [encryptionEnabled, setEncryption] = useState(device?.encryptionEnabled ?? true);
    const [storageCapacity, setStorageCapacity] = useState(device?.storageCapacity || '');
    const [installDate, setInstallDate] = useState(device?.installDate || '');
    const [personId, setPersonId] = useState(device?.personId?.toString() || '');
    const [orgId, setOrgId] = useState(device?.orgId?.toString() || '');
    const [notes, setNotes] = useState(device?.notes || '');

    const personOpts = mockPersons.map(p => ({ value: p.id.toString(), label: `${p.firstName} ${p.lastName}` }));
    const orgOpts = mockOrganizations.map(o => ({ value: o.id.toString(), label: o.name }));

    const handleSave = () => {
        if (!name.trim() || !type) { toast.error('Missing fields', 'Name and type are required.'); return; }
        setSaving(true);
        setTimeout(() => { setSaving(false); toast.success(isEdit ? 'Device updated' : 'Device created', name); router.visit('/devices'); }, 1000);
    };

    const Lbl = ({ children, required }: { children: string; required?: boolean }) => <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: theme.textSecondary, marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{children}{required && <span style={{ color: theme.danger }}> *</span>}</label>;
    const Inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', ...props.style }} />;
    const Sel = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}><option value="">—</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>;
    const Chk = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: theme.text }}><div onClick={() => onChange(!checked)} style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${checked ? theme.accent : theme.border}`, background: checked ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>{checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>{label}</label>;

    const isCamera = type.includes('Camera');
    const isTracker = type === 'GPS Tracker';

    return (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div><h1 style={{ fontSize: 20, fontWeight: 800, color: theme.text, margin: 0 }}>{isEdit ? 'Edit Device' : 'New Device'}</h1><p style={{ fontSize: 12, color: theme.textSecondary, margin: '4px 0 0' }}>{isEdit ? `Editing ${device?.name}` : 'Configure a new surveillance device'}</p></div>
                <div style={{ display: 'flex', gap: 8 }}><Button variant="secondary" onClick={() => router.visit('/devices')}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Device'}</Button></div>
            </div>

            {/* Device Info */}
            <div className="dev-form-section">
                <div className="dev-form-section-title">Device Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ gridColumn: '1 / -1' }}><Lbl required>Device Name</Lbl><Inp value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Zagreb HQ Entrance" /></div>
                    <div><Lbl required>Type</Lbl><Sel value={type} onChange={setType} options={[...deviceTypes]} /></div>
                    <div><Lbl>Status</Lbl><Sel value={status} onChange={v => setStatus(v as any)} options={[...deviceStatuses]} /></div>
                    <div><Lbl>Manufacturer</Lbl><Sel value={manufacturer} onChange={setManufacturer} options={deviceManufacturers} /></div>
                    <div><Lbl>Model</Lbl><Inp value={model} onChange={e => setModel(e.target.value)} placeholder="Model number" /></div>
                    <div><Lbl>Serial Number</Lbl><Inp value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="Serial number" style={{ fontFamily: "'JetBrains Mono', monospace" }} /></div>
                    <div><Lbl>Firmware Version</Lbl><Inp value={firmwareVersion} onChange={e => setFirmwareVersion(e.target.value)} placeholder="e.g., v5.7.23" style={{ fontFamily: "'JetBrains Mono', monospace" }} /></div>
                </div>
            </div>

            {/* Network */}
            <div className="dev-form-section">
                <div className="dev-form-section-title">Network & Protocol</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><Lbl>Protocol</Lbl><Sel value={protocol} onChange={setProtocol} options={deviceProtocols} /></div>
                    <div><Lbl>IP Address</Lbl><Inp value={ipAddress} onChange={e => setIpAddress(e.target.value)} placeholder="10.0.1.101" style={{ fontFamily: "'JetBrains Mono', monospace" }} /></div>
                    <div><Lbl>MAC Address</Lbl><Inp value={macAddress} onChange={e => setMacAddress(e.target.value)} placeholder="AA:BB:CC:11:22:33" style={{ fontFamily: "'JetBrains Mono', monospace" }} /></div>
                    <div><Lbl>Storage Capacity</Lbl><Inp value={storageCapacity} onChange={e => setStorageCapacity(e.target.value)} placeholder="e.g., 2 TB NVR" /></div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    <Chk label="Encryption Enabled" checked={encryptionEnabled} onChange={setEncryption} />
                </div>
            </div>

            {/* Capabilities (conditional) */}
            {(isCamera || type === 'Audio Recorder') && <div className="dev-form-section">
                <div className="dev-form-section-title">Capabilities</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {isCamera && <div><Lbl>Resolution</Lbl><Inp value={resolution} onChange={e => setResolution(e.target.value)} placeholder="e.g., 4K (3840×2160)" /></div>}
                    {isCamera && <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', paddingBottom: 2 }}><Chk label="Night Vision" checked={nightVision} onChange={setNightVision} /><Chk label="Motion Detection" checked={motionDetection} onChange={setMotionDetection} /></div>}
                </div>
            </div>}

            {/* Location */}
            <div className="dev-form-section">
                <div className="dev-form-section-title">Location</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ gridColumn: '1 / -1' }}><Lbl>Location Name</Lbl><Inp value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="e.g., Savska cesta 120, Zagreb" /></div>
                    <div><Lbl>Latitude</Lbl><Inp value={lat} onChange={e => setLat(e.target.value)} placeholder="45.8150" type="number" step="any" style={{ fontFamily: "'JetBrains Mono', monospace" }} /></div>
                    <div><Lbl>Longitude</Lbl><Inp value={lng} onChange={e => setLng(e.target.value)} placeholder="15.9819" type="number" step="any" style={{ fontFamily: "'JetBrains Mono', monospace" }} /></div>
                    <div><Lbl>Install Date</Lbl><Inp value={installDate} onChange={e => setInstallDate(e.target.value)} type="date" style={{ fontFamily: "'JetBrains Mono', monospace", colorScheme: 'dark' as any }} /></div>
                </div>
            </div>

            {/* Assignment */}
            <div className="dev-form-section">
                <div className="dev-form-section-title">Assignment (Optional)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><Lbl>Assigned Person</Lbl><SSel value={personId} onChange={setPersonId} options={personOpts} placeholder="Select person..." /></div>
                    <div><Lbl>Assigned Organization</Lbl><SSel value={orgId} onChange={setOrgId} options={orgOpts} placeholder="Select organization..." /></div>
                </div>
            </div>

            {/* Notes */}
            <div className="dev-form-section">
                <div className="dev-form-section-title">Notes</div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Device notes, installation details..." style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
            </div>
        </div>
    );
}
