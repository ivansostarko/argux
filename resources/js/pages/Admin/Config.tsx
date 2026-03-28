import PageMeta from '../../components/layout/PageMeta';
import AdminLayout from '../../layouts/AdminLayout';
import { useState, useEffect, useCallback } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { useToast } from '../../components/ui/Toast';
import * as C from '../../mock/admin-config';
import type { ConfigTab, ClockCity } from '../../mock/admin-config';

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="cfg-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) { return <button className="cfg-toggle" onClick={() => onChange(!on)} style={{ background: on ? '#22c55e' : '#6b7280' }}><div className="cfg-toggle-dot" style={{ left: on ? 18 : 3 }} /></button>; }
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) { return <div className="cfg-field"><label>{label}</label>{children}{hint && <div style={{ fontSize: 10, color: theme.textDim, marginTop: 3 }}>{hint}</div>}</div>; }
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) { return <div className="cfg-section"><h3 style={{ color: theme.text }}>{icon} {title}</h3>{children}</div>; }

export default function AdminConfig() {
    const [tab, setTab] = useState<ConfigTab>('general');
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showClockModal, setShowClockModal] = useState(false);
    const { trigger } = useTopLoader();
    const toast = useToast();

    // General
    const [lang, setLang] = useState('en'); const [tz, setTz] = useState('Europe/Zagreb');
    const [dateFmt, setDateFmt] = useState('DD.MM.YYYY'); const [appTheme, setAppTheme] = useState('tactical-dark');
    const [appFont, setAppFont] = useState('geist'); const [clocks, setClocks] = useState<ClockCity[]>(C.defaultClocks);
    const [clockLabel, setClockLabel] = useState(''); const [clockTz, setClockTz] = useState('UTC');
    // Security
    const [mfaDefault, setMfaDefault] = useState('Authenticator App'); const [sessionTimeout, setSessionTimeout] = useState('2 hours');
    const [encryption, setEncryption] = useState('AES-256-GCM'); const [pwPolicies, setPwPolicies] = useState(C.passwordPolicies);
    const [ipWhitelist, setIpWhitelist] = useState(C.defaultIpWhitelist); const [newIp, setNewIp] = useState('');
    const [auditEnabled, setAuditEnabled] = useState(true); const [forceHttps, setForceHttps] = useState(true);
    // Notifications
    const [notiEnabled, setNotiEnabled] = useState(true);
    const [notiTypes, setNotiTypes] = useState(C.notificationTypes.map(t => ({ ...t, enabled: t.default })));
    const [notiChannels, setNotiChannels] = useState(C.notificationChannels.map(c => ({ ...c })));
    const [quietStart, setQuietStart] = useState('22:00'); const [quietEnd, setQuietEnd] = useState('07:00');
    // Dev
    const [appEnv, setAppEnv] = useState('production'); const [appDebug, setAppDebug] = useState('disabled');
    const [logLevel, setLogLevel] = useState('error'); const [logChannel, setLogChannel] = useState('daily');
    const [appUrl, setAppUrl] = useState('https://argux.local'); const [filesystem, setFilesystem] = useState('minio');
    // Map
    const [mapLat, setMapLat] = useState('45.8150'); const [mapLng, setMapLng] = useState('15.9819');
    const [mapZoom, setMapZoom] = useState('12'); const [mapTile, setMapTile] = useState('CartoDB Dark');
    const [mapLayerState, setMapLayerState] = useState(C.mapLayers.map(l => ({ id: l, enabled: true })));
    // Retention
    const [retEvents, setRetEvents] = useState('90 days'); const [retLogs, setRetLogs] = useState('30 days');
    const [retMedia, setRetMedia] = useState('1 year'); const [retChat, setRetChat] = useState('180 days');
    const [retBackups, setRetBackups] = useState('90 days'); const [retAudit, setRetAudit] = useState('5 years');
    const [autoPurge, setAutoPurge] = useState(true);
    // Backup
    const [backupFreq, setBackupFreq] = useState('Daily'); const [backupType, setBackupType] = useState('Incremental');
    const [backupEncrypt, setBackupEncrypt] = useState(true); const [backupVerify, setBackupVerify] = useState(true);
    const [backupDbs, setBackupDbs] = useState(C.backupDatabases.map(d => ({ ...d })));
    const [backupFiles, setBackupFiles] = useState(true);
    const [showRestore, setShowRestore] = useState<string | null>(null);
    // AI
    const [aiFuncs, setAiFuncs] = useState(C.aiFunctions.map(f => ({ ...f, models: f.models.map(m => ({ ...m })) })));
    const [selAiFunc, setSelAiFunc] = useState<string | null>(null);
    // Licence
    const [licModules, setLicModules] = useState(C.licenceModules.map(m => ({ ...m })));

    useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);
    const switchTab = (t: ConfigTab) => { setTab(t); setLoading(true); trigger(); setTimeout(() => setLoading(false), 300); };
    const handleSave = useCallback(() => { trigger(); toast.success('Settings saved', `${C.configTabs.find(t => t.id === tab)?.label} updated.`); }, [tab, trigger, toast]);
    const addClock = () => { if (!clockLabel.trim()) return; setClocks([...clocks, { id: `c-${Date.now()}`, label: clockLabel.trim(), timezone: clockTz }]); setClockLabel(''); setShowClockModal(false); };
    const addIp = () => { if (!newIp.trim()) return; setIpWhitelist([...ipWhitelist, newIp.trim()]); setNewIp(''); };
    const sel = (v: string, opts: string[], onChange: (v: string) => void) => <select value={v} onChange={e => onChange(e.target.value)} className="cfg-input">{opts.map(o => <option key={o} value={o}>{o}</option>)}</select>;

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            const tabKeys: Record<string, ConfigTab> = { '1':'general','2':'security','3':'notifications','4':'dev','5':'map','6':'retention','7':'backup','8':'ai','9':'storage','0':'update' };
            if (tabKeys[e.key]) { switchTab(tabKeys[e.key]); return; }
            if (e.key === '-') { switchTab('licence'); return; }
            switch (e.key) { case 's': case 'S': if (!e.ctrlKey && !e.metaKey) handleSave(); break; case 'Escape': setShowShortcuts(false); setShowClockModal(false); setShowRestore(null); break; }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [handleSave]);

    const sc: Record<string, string> = { completed: '#22c55e', running: '#3b82f6', failed: '#ef4444', scheduled: '#6b7280', active: '#22c55e', standby: '#f59e0b', error: '#ef4444', healthy: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };

    const tabContent = () => {
        if (loading) return <div className="cfg-grid">{Array.from({ length: 4 }).map((_, i) => <Skel key={i} w="100%" h={160} />)}</div>;
        switch (tab) {
            case 'general': return <>
                <Section title="Language & Region" icon="🌐"><div className="cfg-grid"><Field label="Language">{sel(lang, C.languages.map(l => l.code), setLang)}</Field><Field label="Timezone">{sel(tz, C.timezones, setTz)}</Field><Field label="Date Format">{sel(dateFmt, C.dateFormats, setDateFmt)}</Field><Field label="Number Format"><select className="cfg-input" defaultValue="1.000,00"><option>1.000,00 (EU)</option><option>1,000.00 (US)</option></select></Field></div></Section>
                <Section title="Appearance" icon="🎨"><div className="cfg-grid"><Field label="Default Theme">{sel(appTheme, C.themes.map(t => t.id), setAppTheme)}</Field><Field label="Default Font">{sel(appFont, C.fonts.map(f => f.id), setAppFont)}</Field><Field label="Classification"><select className="cfg-input" defaultValue="CLASSIFIED"><option>UNCLASSIFIED</option><option>RESTRICTED</option><option>CONFIDENTIAL</option><option>SECRET</option><option>CLASSIFIED</option><option>TOP SECRET</option></select></Field><Field label="System Name"><input className="cfg-input" defaultValue="ARGUX" /></Field></div></Section>
                <Section title="Header Clocks" icon="🕐"><div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 10 }}>{clocks.map(c => <div key={c.id} className="cfg-clock-item" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, transition: 'border-color 0.15s' }}><div><div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{c.label}</div><div style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{c.timezone}</div></div><button onClick={() => setClocks(clocks.filter(x => x.id !== c.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, marginLeft: 4 }}>✕</button></div>)}<button onClick={() => setShowClockModal(true)} style={{ padding: '8px 14px', borderRadius: 8, border: `1px dashed ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>+ Add</button></div></Section>
            </>;
            case 'security': return <>
                <Section title="Two-Factor Authentication" icon="🔑"><div className="cfg-grid"><Field label="Default MFA Method">{sel(mfaDefault, C.mfaMethods, setMfaDefault)}</Field><Field label="MFA Enforcement"><select className="cfg-input" defaultValue="required"><option>Required for all</option><option>Optional</option><option>Admin only</option></select></Field></div></Section>
                <Section title="Session & Encryption" icon="⏱️"><div className="cfg-grid"><Field label="Session Timeout">{sel(sessionTimeout, C.sessionTimeouts, setSessionTimeout)}</Field><Field label="Encryption">{sel(encryption, C.encryptionOptions, setEncryption)}</Field><div className="cfg-field"><label>Force HTTPS</label><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><Toggle on={forceHttps} onChange={setForceHttps} /><span style={{ fontSize: 12, color: forceHttps ? '#22c55e' : theme.textDim }}>{forceHttps ? 'Enforced' : 'Off'}</span></div></div><div className="cfg-field"><label>Audit Logging</label><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><Toggle on={auditEnabled} onChange={setAuditEnabled} /><span style={{ fontSize: 12, color: auditEnabled ? '#22c55e' : theme.textDim }}>{auditEnabled ? 'Active' : 'Off'}</span></div></div></div></Section>
                <Section title="Password Policy" icon="🔐"><div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>{pwPolicies.map(p => <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${theme.border}06` }}><span style={{ fontSize: 12, color: theme.textSecondary }}>{p.label}</span>{p.type === 'toggle' ? <Toggle on={p.value as boolean} onChange={() => setPwPolicies(prev => prev.map(x => x.id === p.id ? { ...x, value: !x.value } : x))} /> : <input className="cfg-input" type="number" value={p.value as string} onChange={e => setPwPolicies(prev => prev.map(x => x.id === p.id ? { ...x, value: e.target.value } : x))} style={{ width: 80 }} />}</div>)}</div></Section>
                <Section title="IP Whitelist" icon="🌐"><div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 10 }}>{ipWhitelist.map(ip => <span key={ip} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 5, background: '#22c55e08', border: '1px solid #22c55e20', fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: '#22c55e' }}>{ip}<button onClick={() => setIpWhitelist(ipWhitelist.filter(i => i !== ip))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 10, padding: 0 }}>✕</button></span>)}</div><div style={{ display: 'flex', gap: 6 }}><input className="cfg-input" placeholder="e.g. 10.0.1.0/24" value={newIp} onChange={e => setNewIp(e.target.value)} style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && addIp()} /><button onClick={addIp} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button></div></Section>
            </>;
            case 'notifications': return <>
                <Section title="Global" icon="🔔"><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}><Toggle on={notiEnabled} onChange={setNotiEnabled} /><div style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>Enable Notifications</div></div><div className="cfg-grid"><Field label="Quiet Start"><input type="time" className="cfg-input" value={quietStart} onChange={e => setQuietStart(e.target.value)} /></Field><Field label="Quiet End"><input type="time" className="cfg-input" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} /></Field></div></Section>
                <Section title="Preferences" icon="📋"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>{notiTypes.map(t => <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, border: `1px solid ${t.enabled ? '#22c55e20' : theme.border}` }}><Toggle on={t.enabled} onChange={() => setNotiTypes(prev => prev.map(x => x.id === t.id ? { ...x, enabled: !x.enabled } : x))} /><span style={{ fontSize: 14 }}>{t.icon}</span><span style={{ fontSize: 11, color: t.enabled ? theme.text : theme.textDim }}>{t.label}</span></div>)}</div></Section>
                <Section title="Channels" icon="📡"><div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>{notiChannels.map(c => <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${c.enabled ? '#22c55e20' : theme.border}` }}><Toggle on={c.enabled} onChange={() => setNotiChannels(prev => prev.map(x => x.id === c.id ? { ...x, enabled: !x.enabled } : x))} /><span style={{ fontSize: 18 }}>{c.icon}</span><span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: c.enabled ? theme.text : theme.textDim }}>{c.label}</span><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: c.enabled ? '#22c55e12' : `${theme.border}15`, color: c.enabled ? '#22c55e' : theme.textDim }}>{c.enabled ? 'ACTIVE' : 'OFF'}</span></div>)}</div></Section>
            </>;
            case 'dev': return <>
                <Section title="Environment" icon="🛠️"><div className="cfg-grid"><Field label="Environment">{sel(appEnv, C.appEnvironments, setAppEnv)}</Field><Field label="Debug Mode">{sel(appDebug, C.debugModes, setAppDebug)}</Field><Field label="Log Level">{sel(logLevel, C.logLevels, setLogLevel)}</Field><Field label="Log Channel">{sel(logChannel, C.logChannels, setLogChannel)}</Field><Field label="App URL"><input className="cfg-input" value={appUrl} onChange={e => setAppUrl(e.target.value)} /></Field><Field label="Filesystem">{sel(filesystem, C.filesystems, setFilesystem)}</Field></div>{appEnv !== 'production' && <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid #f59e0b30', background: '#f59e0b06' }}><span style={{ fontSize: 12, color: '#f59e0b' }}>⚠️ Non-production: <strong>{appEnv}</strong></span></div>}</Section>
            </>;
            case 'map': return <>
                <Section title="Default View" icon="🗺️"><div className="cfg-grid"><Field label="Center Latitude"><input className="cfg-input" type="number" step="0.0001" value={mapLat} onChange={e => setMapLat(e.target.value)} /></Field><Field label="Center Longitude"><input className="cfg-input" type="number" step="0.0001" value={mapLng} onChange={e => setMapLng(e.target.value)} /></Field><Field label="Zoom (1-20)"><input className="cfg-input" type="number" min="1" max="20" value={mapZoom} onChange={e => setMapZoom(e.target.value)} /></Field><Field label="Tile Provider">{sel(mapTile, C.tileProviders, setMapTile)}</Field></div></Section>
                <Section title="Layers" icon="🗂️"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 6 }}>{mapLayerState.map(l => <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, border: `1px solid ${l.enabled ? '#22c55e20' : theme.border}` }}><Toggle on={l.enabled} onChange={() => setMapLayerState(prev => prev.map(x => x.id === l.id ? { ...x, enabled: !x.enabled } : x))} /><span style={{ fontSize: 12, color: l.enabled ? theme.text : theme.textDim }}>{l.id}</span></div>)}</div></Section>
            </>;
            case 'retention': return <>
                <Section title="Retention Policies" icon="📦"><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}><Toggle on={autoPurge} onChange={setAutoPurge} /><span style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>Auto-Purge Enabled</span></div><div className="cfg-grid">
                    <Field label="Event Logs" hint="GPS, camera, LPR events">{sel(retEvents, C.retentionPeriods, setRetEvents)}</Field>
                    <Field label="App Logs" hint="System, error, access">{sel(retLogs, C.retentionPeriods, setRetLogs)}</Field>
                    <Field label="Media Files" hint="Video, audio, photos">{sel(retMedia, C.retentionPeriods, setRetMedia)}</Field>
                    <Field label="Chat History">{sel(retChat, C.retentionPeriods, setRetChat)}</Field>
                    <Field label="Backups">{sel(retBackups, C.retentionPeriods, setRetBackups)}</Field>
                    <Field label="Audit Trail" hint="Recommended: 5+ years">{sel(retAudit, C.retentionPeriods, setRetAudit)}</Field>
                </div></Section>
            </>;

            // ═══ NEW: BACKUP ═══
            case 'backup': return <>
                <Section title="Backup Schedule" icon="⏰"><div className="cfg-grid"><Field label="Frequency">{sel(backupFreq, C.backupFrequencies, setBackupFreq)}</Field><Field label="Type">{sel(backupType, C.backupTypes, setBackupType)}</Field></div><div style={{ display: 'flex', gap: 16, marginTop: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Toggle on={backupEncrypt} onChange={setBackupEncrypt} /><span style={{ fontSize: 12, color: theme.textSecondary }}>Encrypt (AES-256)</span></div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Toggle on={backupVerify} onChange={setBackupVerify} /><span style={{ fontSize: 12, color: theme.textSecondary }}>Integrity check</span></div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Toggle on={backupFiles} onChange={setBackupFiles} /><span style={{ fontSize: 12, color: theme.textSecondary }}>Include MinIO files</span></div></div></Section>
                <Section title="Database Selection" icon="🗄️"><div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>{backupDbs.map(d => <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${d.enabled ? '#22c55e20' : theme.border}` }}><Toggle on={d.enabled} onChange={() => setBackupDbs(prev => prev.map(x => x.id === d.id ? { ...x, enabled: !x.enabled } : x))} /><span style={{ fontSize: 16 }}>{d.icon}</span><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: d.enabled ? theme.text : theme.textDim }}>{d.label}</div><div style={{ fontSize: 10, color: theme.textDim }}>Size: {d.size}</div></div></div>)}</div></Section>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <button onClick={() => { trigger(); toast.success('Backup started', 'Manual backup initiated. Monitor progress in Jobs.'); }} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#22c55e', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>▶ Run Backup Now</button>
                    <button onClick={() => { trigger(); toast.success('Backup verified', 'Last backup integrity: PASSED (SHA-256).'); }} style={{ padding: '10px 20px', borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>🔍 Verify Last Backup</button>
                </div>
                <Section title="Backup History" icon="📋">{C.backupHistory.map(b => <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${sc[b.status]}20`, background: `${sc[b.status]}02`, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc[b.status], flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{b.type} — {b.createdAt}</div><div style={{ fontSize: 10, color: theme.textDim }}>{b.databases.join(', ')}{b.includesFiles ? ' + Files' : ''} · {b.duration} · {b.size}{b.encryption ? ' · 🔒' : ''}{b.verified ? ' · ✓ Verified' : ''}</div>{b.status === 'failed' && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>{b.note}</div>}</div>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${sc[b.status]}12`, color: sc[b.status], textTransform: 'uppercase' as const }}>{b.status}</span>
                    {b.status === 'completed' && <button onClick={() => setShowRestore(b.id)} style={{ padding: '4px 10px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Restore</button>}
                </div>)}</Section>
            </>;

            // ═══ NEW: AI ═══
            case 'ai': { const totalGpu = aiFuncs.flatMap(f => f.models.filter(m => m.status === 'active')).reduce((s, m) => s + parseInt(m.gpu) || 0, 0);
                return <>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                    <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}><div style={{ fontSize: 10, color: theme.textDim }}>Functions</div><div style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>{aiFuncs.length}</div></div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}><div style={{ fontSize: 10, color: theme.textDim }}>Active Models</div><div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>{aiFuncs.flatMap(f => f.models.filter(m => m.status === 'active')).length}</div></div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}><div style={{ fontSize: 10, color: theme.textDim }}>GPU Allocated</div><div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{totalGpu} GB</div></div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}><div style={{ fontSize: 10, color: theme.textDim }}>Jobs Today</div><div style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6' }}>{aiFuncs.reduce((s, f) => s + f.jobsToday, 0).toLocaleString()}</div></div>
                </div>
                {aiFuncs.map(fn => { const expanded = selAiFunc === fn.id;
                    return <div key={fn.id} className="cfg-section" style={{ marginBottom: 10, borderColor: expanded ? '#8b5cf630' : undefined, background: expanded ? '#8b5cf603' : undefined }}>
                        <div onClick={() => setSelAiFunc(expanded ? null : fn.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 22 }}>{fn.icon}</span>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{fn.label}</div><div style={{ fontSize: 10, color: theme.textDim }}>{fn.description}</div></div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 14, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{fn.jobsToday}</div><div style={{ fontSize: 9, color: theme.textDim }}>today</div></div>
                                <div style={{ width: 40, height: 24, borderRadius: 4, background: `${fn.gpuUsage > 80 ? '#f59e0b' : '#22c55e'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: fn.gpuUsage > 80 ? '#f59e0b' : '#22c55e' }}>{fn.gpuUsage}%</div>
                                <span style={{ fontSize: 12, color: theme.textDim, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                            </div>
                        </div>
                        {expanded && <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${theme.border}` }}>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' as const, fontSize: 10 }}>
                                <span style={{ color: theme.textDim }}>Total jobs: <strong style={{ color: theme.text }}>{fn.jobsTotal.toLocaleString()}</strong></span>
                                <span style={{ color: theme.textDim }}>Avg time: <strong style={{ color: theme.text }}>{fn.avgTime}</strong></span>
                                <span style={{ color: theme.textDim }}>Error rate: <strong style={{ color: parseFloat(fn.errorRate) > 1 ? '#f59e0b' : '#22c55e' }}>{fn.errorRate}</strong></span>
                                <span style={{ color: theme.textDim }}>Queue: <strong style={{ color: fn.queueDepth > 2 ? '#f59e0b' : theme.text }}>{fn.queueDepth}</strong></span>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase' as const }}>Models ({fn.models.length})</div>
                            {fn.models.map(m => <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, border: `1px solid ${sc[m.status]}20`, marginBottom: 4 }}>
                                <Toggle on={m.status === 'active'} onChange={() => setAiFuncs(prev => prev.map(f => f.id === fn.id ? { ...f, models: f.models.map(mm => mm.id === m.id ? { ...mm, status: mm.status === 'active' ? 'standby' : 'active' } : mm) } : f))} />
                                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: m.status === 'active' ? theme.text : theme.textDim }}>{m.name}</div><div style={{ fontSize: 10, color: theme.textDim }}>{m.version} · GPU: {m.gpu}</div></div>
                                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${sc[m.status]}12`, color: sc[m.status] }}>{m.status.toUpperCase()}</span>
                                {m.id === fn.primaryModelId && <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: '#3b82f612', color: '#3b82f6' }}>PRIMARY</span>}
                            </div>)}
                        </div>}
                    </div>;
                })}</>; }

            // ═══ NEW: STORAGE ═══
            case 'storage': { const totalGb = C.storageNodes.reduce((s, n) => s + n.totalGb, 0); const usedGb = C.storageNodes.reduce((s, n) => s + n.usedGb, 0);
                return <>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                    <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}><div style={{ fontSize: 10, color: theme.textDim }}>Total Capacity</div><div style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>{(totalGb / 1000).toFixed(1)} TB</div></div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}><div style={{ fontSize: 10, color: theme.textDim }}>Used</div><div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{(usedGb / 1000).toFixed(1)} TB</div></div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}><div style={{ fontSize: 10, color: theme.textDim }}>Available</div><div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>{((totalGb - usedGb) / 1000).toFixed(1)} TB</div></div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}><div style={{ fontSize: 10, color: theme.textDim }}>Usage</div><div style={{ fontSize: 20, fontWeight: 800, color: usedGb / totalGb > 0.8 ? '#ef4444' : '#3b82f6' }}>{Math.round(usedGb / totalGb * 100)}%</div></div>
                </div>
                <Section title="Database & Service Storage" icon="🗄️">{C.storageNodes.map(n => { const pct = n.usedGb / n.totalGb * 100;
                    return <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, marginBottom: 6 }}>
                        <span style={{ fontSize: 20 }}>{n.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{n.label}</span><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${sc[n.status]}12`, color: sc[n.status] }}>{n.status.toUpperCase()}</span></div>
                            <div style={{ height: 6, borderRadius: 3, background: `${theme.border}20`, overflow: 'hidden', marginBottom: 4 }}><div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#22c55e' }} /></div>
                            <div style={{ display: 'flex', gap: 10, fontSize: 10, color: theme.textDim }}><span><strong style={{ color: theme.text }}>{n.usedGb >= 1000 ? (n.usedGb / 1000).toFixed(1) + ' TB' : n.usedGb + ' GB'}</strong> / {n.totalGb >= 1000 ? (n.totalGb / 1000).toFixed(0) + ' TB' : n.totalGb + ' GB'} ({Math.round(pct)}%)</span><span>v{n.version}</span><span>{n.host}:{n.port}</span>{n.connections !== undefined && <span>{n.connections} conn</span>}</div>
                        </div>
                    </div>;
                })}</Section>
                <Section title="MinIO Buckets" icon="📁"><div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>{C.minioBuckets.map(b => <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#3b82f610', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>📦</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{b.name}</div><div style={{ fontSize: 10, color: theme.textDim }}>{b.objects.toLocaleString()} objects</div></div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{b.size}</span>
                    <div style={{ width: 50 }}><div style={{ height: 4, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${b.sizeGb / 2405 * 100}%`, height: '100%', borderRadius: 2, background: '#3b82f6' }} /></div></div>
                </div>)}</div></Section>
            </>; }

            // ═══ NEW: UPDATE ═══
            case 'update': return <>
                <Section title="Current Installation" icon="📍"><div className="cfg-grid">
                    {[{ l: 'Version', v: C.currentVersion.version },{ l: 'Build', v: C.currentVersion.build },{ l: 'Date', v: C.currentVersion.date },{ l: 'Environment', v: C.currentVersion.environment },{ l: 'Node.js', v: C.currentVersion.node },{ l: 'PHP', v: C.currentVersion.php },{ l: 'Laravel', v: C.currentVersion.laravel },{ l: 'React', v: C.currentVersion.react },{ l: 'Vite', v: C.currentVersion.vite },{ l: 'Tauri', v: C.currentVersion.tauri }].map(r => <div key={r.l} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}` }}><div style={{ fontSize: 10, color: theme.textDim }}>{r.l}</div><div style={{ fontSize: 14, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{r.v}</div></div>)}
                </div></Section>
                {C.availableUpdates.length > 0 && <Section title="Available Updates" icon="⬆️">{C.availableUpdates.map(u => <div key={u.version} style={{ padding: '14px', borderRadius: 10, border: `1px solid ${u.type === 'security' ? '#ef444430' : u.type === 'minor' ? '#3b82f630' : '#22c55e30'}`, background: `${u.type === 'security' ? '#ef4444' : u.type === 'minor' ? '#3b82f6' : '#22c55e'}04`, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>v{u.version}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${u.type === 'security' ? '#ef4444' : u.type === 'minor' ? '#3b82f6' : '#22c55e'}15`, color: u.type === 'security' ? '#ef4444' : u.type === 'minor' ? '#3b82f6' : '#22c55e', textTransform: 'uppercase' as const }}>{u.type}</span>
                        <span style={{ fontSize: 10, color: theme.textDim }}>{u.date} · {u.size}</span>
                        <button onClick={() => { trigger(); toast.success('Update started', `Downloading v${u.version}...`); }} style={{ marginLeft: 'auto', padding: '6px 16px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Install</button>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: theme.textSecondary, lineHeight: 1.8 }}>{u.changes.map((c, i) => <li key={i}>{c}</li>)}</ul>
                </div>)}</Section>}
                <Section title="Update History" icon="📋"><div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>{C.updateHistory.map(u => <div key={u.version} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}` }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace", width: 60 }}>v{u.version}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 3, background: `${theme.border}15`, color: theme.textDim }}>{u.type}</span>
                    <span style={{ fontSize: 10, color: theme.textDim }}>{u.date}</span>
                    <span style={{ flex: 1, fontSize: 10, color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{u.changes[0]}</span>
                    <span style={{ fontSize: 10, color: theme.textDim }}>{u.size}</span>
                </div>)}</div></Section>
                <div style={{ display: 'flex', gap: 8 }}><button onClick={() => { trigger(); toast.info('Checking...', 'Contacting update server...'); }} style={{ padding: '10px 20px', borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Check for Updates</button><button onClick={() => { trigger(); toast.info('System report', 'Generating diagnostic report...'); }} style={{ padding: '10px 20px', borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>📋 System Report</button></div>
            </>;

            // ═══ NEW: LICENCE ═══
            case 'licence': { const li = C.licenceInfo; const seatPct = li.seats.used / li.seats.total * 100; const included = licModules.filter(m => m.included).length; const addons = licModules.filter(m => m.addon && m.included).length;
                return <>
                <Section title="Licence Information" icon="🔑"><div className="cfg-grid">
                    <div style={{ gridColumn: '1 / -1', padding: '14px', borderRadius: 8, background: '#22c55e04', border: '1px solid #22c55e20', display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e40' }} /><span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>LICENCE ACTIVE</span><span style={{ fontSize: 12, color: theme.textDim, marginLeft: 'auto' }}>{li.daysRemaining} days remaining</span></div>
                    {[{ l: 'Licence Key', v: li.key },{ l: 'Type', v: li.type },{ l: 'Holder', v: li.holder },{ l: 'Valid', v: `${li.validFrom} → ${li.validUntil}` },{ l: 'Hardware Lock', v: li.hardwareLock },{ l: 'Support', v: li.support },{ l: 'Last Verified', v: li.lastChecked }].map(r => <div key={r.l} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}` }}><div style={{ fontSize: 10, color: theme.textDim }}>{r.l}</div><div style={{ fontSize: 12, fontWeight: 600, color: theme.text, fontFamily: r.l === 'Licence Key' || r.l === 'Hardware Lock' ? "'JetBrains Mono',monospace" : 'inherit', wordBreak: 'break-all' as const }}>{r.v}</div></div>)}
                </div>
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}><span style={{ color: theme.textDim }}>Seat Usage</span><span style={{ color: theme.text, fontWeight: 700 }}>{li.seats.used} / {li.seats.total}</span></div>
                    <div style={{ height: 8, borderRadius: 4, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${seatPct}%`, height: '100%', borderRadius: 4, background: seatPct > 90 ? '#ef4444' : seatPct > 75 ? '#f59e0b' : '#22c55e' }} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => { trigger(); toast.info('Verifying...', 'Checking licence validity with activation server...'); }} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Verify Licence</button>
                    <button onClick={() => { trigger(); toast.info('Activation', 'Enter new licence key to activate.'); }} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔑 Update Licence Key</button>
                </div>
                </Section>
                <Section title={`Licensed Modules (${included} of ${licModules.length})`} icon="📦"><div style={{ fontSize: 10, color: theme.textDim, marginBottom: 10 }}>{included} modules included · {addons} add-on modules active · {licModules.length - included} not licensed</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 6 }}>{licModules.map(m => <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: `1px solid ${m.included ? '#22c55e20' : '#ef444420'}`, background: m.included ? '#22c55e03' : '#ef444403', opacity: m.included ? 1 : 0.6 }}>
                        <span style={{ fontSize: 16 }}>{m.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: m.included ? theme.text : theme.textDim }}>{m.label}</div>{m.addon && <div style={{ fontSize: 9, color: m.included ? '#f59e0b' : theme.textDim }}>Add-on{m.addonPrice ? ` · ${m.addonPrice}` : ''}</div>}</div>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: m.included ? '#22c55e12' : '#ef444412', color: m.included ? '#22c55e' : '#ef4444' }}>{m.included ? '✓ LICENSED' : '✗ NOT LICENSED'}</span>
                    </div>)}</div>
                </Section>
            </>; }
        }
    };

    return (<><PageMeta title={`Config — ${C.configTabs.find(t => t.id === tab)?.label}`} /><div data-testid="admin-config-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚙️</div><div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Configuration</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{C.configTabs.length} sections · System settings</p></div></div>
            <button onClick={handleSave} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>💾 Save</button>
        </div>

        <div className="cfg-tabs">{C.configTabs.map((t, i) => <button key={t.id} className={`cfg-tab ${tab === t.id ? 'active' : ''}`} onClick={() => switchTab(t.id)}><span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}</button>)}</div>

        {tabContent()}

        {/* Restore confirm */}
        {showRestore && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowRestore(null)}><div onClick={e => e.stopPropagation()} style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 28, textAlign: 'center' as const, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, textAlign: 'center', margin: '0 0 8px' }}>Restore from Backup</h3>
            <p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.6, margin: '0 0 20px' }}>This will overwrite current data with the selected backup. All changes since backup will be lost. Are you sure?</p>
            <div style={{ display: 'flex', gap: 10 }}><button onClick={() => setShowRestore(null)} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button><button onClick={() => { setShowRestore(null); trigger(); toast.success('Restore started', 'System restore initiated. This may take several minutes.'); }} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Restore</button></div>
        </div></div>}

        {/* Clock modal */}
        {showClockModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowClockModal(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 16 }}>🕐 Add Clock</div>
            <Field label="Label"><input className="cfg-input" value={clockLabel} onChange={e => setClockLabel(e.target.value)} placeholder="e.g. Moscow" autoFocus /></Field>
            <div style={{ height: 10 }} />
            <Field label="Timezone">{sel(clockTz, C.timezones, setClockTz)}</Field>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}><button onClick={() => setShowClockModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button><button onClick={addClock} disabled={!clockLabel.trim()} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: clockLabel.trim() ? '#ef4444' : theme.border, color: '#fff', fontSize: 13, fontWeight: 700, cursor: clockLabel.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>Add</button></div>
        </div></div>}

        {/* Ctrl+Q */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>{C.keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="cfg-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}<div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div></div></div>}
    </div></>);
}
AdminConfig.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
