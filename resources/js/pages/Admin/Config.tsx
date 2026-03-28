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
    const [auditEnabled, setAuditEnabled] = useState(true); const [maxSessions, setMaxSessions] = useState('3');
    const [forceHttps, setForceHttps] = useState(true); const [bruteForceThreshold, setBruteForceThreshold] = useState('5');

    // Notifications
    const [notiEnabled, setNotiEnabled] = useState(true);
    const [notiTypes, setNotiTypes] = useState(C.notificationTypes.map(t => ({ ...t, enabled: t.default })));
    const [notiChannels, setNotiChannels] = useState(C.notificationChannels.map(c => ({ ...c })));
    const [quietStart, setQuietStart] = useState('22:00'); const [quietEnd, setQuietEnd] = useState('07:00');
    const [cooldownMin, setCooldownMin] = useState('3');

    // Dev
    const [appEnv, setAppEnv] = useState('production'); const [appDebug, setAppDebug] = useState('disabled');
    const [logLevel, setLogLevel] = useState('error'); const [logChannel, setLogChannel] = useState('daily');
    const [appUrl, setAppUrl] = useState('https://argux.local'); const [filesystem, setFilesystem] = useState('minio');
    const [cacheDriver, setCacheDriver] = useState('redis'); const [queueDriver, setQueueDriver] = useState('redis');

    // Map
    const [mapLat, setMapLat] = useState('45.8150'); const [mapLng, setMapLng] = useState('15.9819');
    const [mapZoom, setMapZoom] = useState('12'); const [mapTile, setMapTile] = useState('CartoDB Dark');
    const [mapLayers, setMapLayers] = useState(C.mapLayers.map(l => ({ id: l, enabled: true })));
    const [clusterThreshold, setClusterThreshold] = useState('50');

    // Retention
    const [retEvents, setRetEvents] = useState('90 days'); const [retLogs, setRetLogs] = useState('30 days');
    const [retMedia, setRetMedia] = useState('1 year'); const [retChat, setRetChat] = useState('180 days');
    const [retBackups, setRetBackups] = useState('90 days'); const [retAudit, setRetAudit] = useState('5 years');
    const [autoPurge, setAutoPurge] = useState(true);

    // System
    const [backupFreq, setBackupFreq] = useState('Daily'); const [backupType, setBackupType] = useState('Incremental');
    const [backupEncrypt, setBackupEncrypt] = useState(true); const [backupVerify, setBackupVerify] = useState(true);
    const [aiModels, setAiModels] = useState(C.aiModels.map(m => ({ ...m })));
    const [ragRebuild, setRagRebuild] = useState('weekly');

    useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

    const switchTab = (t: ConfigTab) => { setTab(t); setLoading(true); trigger(); setTimeout(() => setLoading(false), 300); };
    const handleSave = useCallback(() => { trigger(); toast.success('Settings saved', `${C.configTabs.find(t => t.id === tab)?.label} configuration updated.`); }, [tab, trigger, toast]);

    const addClock = () => { if (!clockLabel.trim()) return; setClocks([...clocks, { id: `c-${Date.now()}`, label: clockLabel.trim(), timezone: clockTz }]); setClockLabel(''); setShowClockModal(false); toast.success('Clock added', clockLabel.trim()); };
    const removeClock = (id: string) => setClocks(clocks.filter(c => c.id !== id));
    const addIp = () => { if (!newIp.trim()) return; setIpWhitelist([...ipWhitelist, newIp.trim()]); setNewIp(''); };
    const removeIp = (ip: string) => setIpWhitelist(ipWhitelist.filter(i => i !== ip));
    const toggleNotiType = (id: string) => setNotiTypes(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
    const toggleNotiChannel = (id: string) => setNotiChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    const togglePwPolicy = (id: string) => setPwPolicies(prev => prev.map(p => p.id === id ? { ...p, value: !p.value } : p));
    const toggleMapLayer = (id: string) => setMapLayers(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
    const toggleAiModel = (id: string) => setAiModels(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'standby' : 'active' } : m));

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            const tabKeys: Record<string, ConfigTab> = { '1': 'general', '2': 'security', '3': 'notifications', '4': 'dev', '5': 'map', '6': 'retention', '7': 'system' };
            if (tabKeys[e.key]) { switchTab(tabKeys[e.key]); return; }
            switch (e.key) { case 's': case 'S': if (!e.ctrlKey && !e.metaKey) handleSave(); break; case 'Escape': setShowShortcuts(false); setShowClockModal(false); break; }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [handleSave]);

    const sel = (v: string, opts: string[], onChange: (v: string) => void) => <select value={v} onChange={e => onChange(e.target.value)} className="cfg-input">{opts.map(o => <option key={o} value={o}>{o}</option>)}</select>;

    const tabContent = () => {
        if (loading) return <div className="cfg-grid">{Array.from({ length: 4 }).map((_, i) => <Skel key={i} w="100%" h={160} />)}</div>;
        switch (tab) {
            case 'general': return <>
                <Section title="Language & Region" icon="🌐"><div className="cfg-grid">
                    <Field label="Language">{sel(lang, C.languages.map(l => l.code), setLang)}</Field>
                    <Field label="Timezone">{sel(tz, C.timezones, setTz)}</Field>
                    <Field label="Date Format">{sel(dateFmt, C.dateFormats, setDateFmt)}</Field>
                    <Field label="Number Format"><select className="cfg-input" defaultValue="1.000,00"><option>1.000,00 (EU)</option><option>1,000.00 (US)</option><option>1 000.00 (SI)</option></select></Field>
                </div></Section>
                <Section title="Appearance" icon="🎨"><div className="cfg-grid">
                    <Field label="Default Theme">{sel(appTheme, C.themes.map(t => t.id), setAppTheme)}</Field>
                    <Field label="Default Font">{sel(appFont, C.fonts.map(f => f.id), setAppFont)}</Field>
                    <Field label="Classification Level"><select className="cfg-input" defaultValue="CLASSIFIED"><option>UNCLASSIFIED</option><option>RESTRICTED</option><option>CONFIDENTIAL</option><option>SECRET</option><option>CLASSIFIED</option><option>TOP SECRET</option></select></Field>
                    <Field label="System Name"><input className="cfg-input" defaultValue="ARGUX" /></Field>
                </div></Section>
                <Section title="Header Clocks" icon="🕐">
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 12 }}>
                        {clocks.map(c => <div key={c.id} className="cfg-clock-item" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, background: `${theme.border}04`, transition: 'border-color 0.15s' }}>
                            <div><div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{c.label}</div><div style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{c.timezone}</div></div>
                            <button onClick={() => removeClock(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, padding: '2px 4px', marginLeft: 4 }}>✕</button>
                        </div>)}
                        <button onClick={() => setShowClockModal(true)} style={{ padding: '8px 14px', borderRadius: 8, border: `1px dashed ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>+ Add Clock</button>
                    </div>
                    <div style={{ fontSize: 10, color: theme.textDim }}>These clocks appear in the application header. Drag to reorder.</div>
                </Section>
            </>;

            case 'security': return <>
                <Section title="Two-Factor Authentication" icon="🔑"><div className="cfg-grid">
                    <Field label="Default MFA Method">{sel(mfaDefault, C.mfaMethods, setMfaDefault)}</Field>
                    <Field label="MFA Enforcement"><select className="cfg-input" defaultValue="required"><option value="required">Required for all users</option><option value="optional">Optional</option><option value="admin_only">Required for admins only</option></select></Field>
                </div></Section>
                <Section title="Session Management" icon="⏱️"><div className="cfg-grid">
                    <Field label="Session Timeout" hint="Auto-logout after inactivity">{sel(sessionTimeout, C.sessionTimeouts, setSessionTimeout)}</Field>
                    <Field label="Max Concurrent Sessions"><input className="cfg-input" type="number" value={maxSessions} onChange={e => setMaxSessions(e.target.value)} min="1" max="10" /></Field>
                </div></Section>
                <Section title="Encryption" icon="🔒"><div className="cfg-grid">
                    <Field label="Encryption Algorithm">{sel(encryption, C.encryptionOptions, setEncryption)}</Field>
                    <Field label="TLS Version"><select className="cfg-input" defaultValue="1.3"><option>TLS 1.2</option><option>TLS 1.3</option></select></Field>
                    <div className="cfg-field"><label>Force HTTPS</label><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><Toggle on={forceHttps} onChange={setForceHttps} /><span style={{ fontSize: 12, color: forceHttps ? '#22c55e' : theme.textDim }}>{forceHttps ? 'Enforced' : 'Disabled'}</span></div></div>
                </div></Section>
                <Section title="Password Policy" icon="🔐"><div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    {pwPolicies.map(p => <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${theme.border}06` }}>
                        <span style={{ fontSize: 12, color: theme.textSecondary }}>{p.label}</span>
                        {p.type === 'toggle' ? <Toggle on={p.value as boolean} onChange={() => togglePwPolicy(p.id)} /> : <input className="cfg-input" type="number" value={p.value as string} onChange={e => setPwPolicies(prev => prev.map(x => x.id === p.id ? { ...x, value: e.target.value } : x))} style={{ width: 80 }} />}
                    </div>)}
                </div></Section>
                <Section title="IP Whitelist" icon="🌐"><div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 10 }}>
                    {ipWhitelist.map(ip => <span key={ip} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 5, background: '#22c55e08', border: '1px solid #22c55e20', fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: '#22c55e' }}>{ip}<button onClick={() => removeIp(ip)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 10, padding: 0 }}>✕</button></span>)}
                </div><div style={{ display: 'flex', gap: 6 }}><input className="cfg-input" placeholder="e.g. 10.0.1.0/24" value={newIp} onChange={e => setNewIp(e.target.value)} style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && addIp()} /><button onClick={addIp} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button></div></Section>
                <Section title="Audit Logging" icon="📋"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Toggle on={auditEnabled} onChange={setAuditEnabled} /><div><div style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>Immutable Audit Trail</div><div style={{ fontSize: 10, color: theme.textDim }}>Log all user actions to ClickHouse with SHA-256 integrity hashing</div></div></div><div className="cfg-grid" style={{ marginTop: 12 }}>
                    <Field label="Brute Force Threshold"><input className="cfg-input" type="number" value={bruteForceThreshold} onChange={e => setBruteForceThreshold(e.target.value)} min="3" max="10" /></Field>
                    <Field label="Lockout Duration"><select className="cfg-input" defaultValue="6"><option value="1">1 hour</option><option value="3">3 hours</option><option value="6">6 hours</option><option value="12">12 hours</option><option value="24">24 hours</option></select></Field>
                </div></Section>
            </>;

            case 'notifications': return <>
                <Section title="Global Settings" icon="🔔"><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}><Toggle on={notiEnabled} onChange={setNotiEnabled} /><div><div style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>Enable Notifications</div><div style={{ fontSize: 10, color: theme.textDim }}>Master switch for all notification delivery</div></div></div>
                    <div className="cfg-grid"><Field label="Quiet Hours Start"><input type="time" className="cfg-input" value={quietStart} onChange={e => setQuietStart(e.target.value)} /></Field><Field label="Quiet Hours End"><input type="time" className="cfg-input" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} /></Field><Field label="Alert Cooldown (minutes)" hint="Prevent flooding for same trigger"><input className="cfg-input" type="number" value={cooldownMin} onChange={e => setCooldownMin(e.target.value)} min="1" /></Field><Field label="Min Severity for Push"><select className="cfg-input" defaultValue="warning"><option>info</option><option>warning</option><option>critical</option></select></Field></div>
                </Section>
                <Section title="Notification Preferences" icon="📋"><div style={{ fontSize: 10, color: theme.textDim, marginBottom: 10 }}>Enable or disable individual notification types</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>{notiTypes.map(t => <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, border: `1px solid ${t.enabled ? '#22c55e20' : theme.border}`, background: t.enabled ? '#22c55e04' : 'transparent' }}>
                        <Toggle on={t.enabled} onChange={() => toggleNotiType(t.id)} /><span style={{ fontSize: 14 }}>{t.icon}</span><span style={{ fontSize: 11, color: t.enabled ? theme.text : theme.textDim }}>{t.label}</span>
                    </div>)}</div>
                </Section>
                <Section title="Delivery Channels" icon="📡"><div style={{ fontSize: 10, color: theme.textDim, marginBottom: 10 }}>Configure which delivery methods are active</div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>{notiChannels.map(c => <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${c.enabled ? '#22c55e20' : theme.border}`, background: c.enabled ? '#22c55e04' : 'transparent' }}>
                        <Toggle on={c.enabled} onChange={() => toggleNotiChannel(c.id)} /><span style={{ fontSize: 18 }}>{c.icon}</span><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: c.enabled ? theme.text : theme.textDim }}>{c.label}</div></div><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: c.enabled ? '#22c55e12' : `${theme.border}15`, color: c.enabled ? '#22c55e' : theme.textDim }}>{c.enabled ? 'ACTIVE' : 'OFF'}</span>
                    </div>)}</div>
                </Section>
            </>;

            case 'dev': return <>
                <Section title="Application Environment" icon="🛠️"><div className="cfg-grid">
                    <Field label="Environment" hint="⚠️ Changing environment affects system behavior">{sel(appEnv, C.appEnvironments, setAppEnv)}</Field>
                    <Field label="Debug Mode" hint="Enable verbose error reporting">{sel(appDebug, C.debugModes, setAppDebug)}</Field>
                    <Field label="Log Level">{sel(logLevel, C.logLevels, setLogLevel)}</Field>
                    <Field label="Log Channel">{sel(logChannel, C.logChannels, setLogChannel)}</Field>
                    <Field label="Application URL"><input className="cfg-input" value={appUrl} onChange={e => setAppUrl(e.target.value)} /></Field>
                    <Field label="Filesystem Driver">{sel(filesystem, C.filesystems, setFilesystem)}</Field>
                </div></Section>
                <Section title="Cache & Queue" icon="⚡"><div className="cfg-grid">
                    <Field label="Cache Driver"><select className="cfg-input" value={cacheDriver} onChange={e => setCacheDriver(e.target.value)}><option>redis</option><option>memcached</option><option>file</option><option>array</option></select></Field>
                    <Field label="Queue Driver"><select className="cfg-input" value={queueDriver} onChange={e => setQueueDriver(e.target.value)}><option>redis</option><option>database</option><option>sync</option><option>null</option></select></Field>
                    <Field label="Queue Workers"><input className="cfg-input" type="number" defaultValue="8" min="1" max="32" /></Field>
                    <Field label="Job Timeout (seconds)"><input className="cfg-input" type="number" defaultValue="300" min="30" /></Field>
                </div></Section>
                <Section title="API & CORS" icon="🌐"><div className="cfg-grid">
                    <Field label="API Rate Limit (req/min)"><input className="cfg-input" type="number" defaultValue="120" min="10" /></Field>
                    <Field label="CORS Origins"><input className="cfg-input" defaultValue="https://argux.local" /></Field>
                </div></Section>
                {appEnv !== 'production' && <div style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #f59e0b30', background: '#f59e0b06', display: 'flex', alignItems: 'center', gap: 8, marginTop: -4 }}><span style={{ fontSize: 14 }}>⚠️</span><span style={{ fontSize: 12, color: '#f59e0b' }}>Non-production environment: <strong>{appEnv}</strong>. Debug data may be exposed.</span></div>}
            </>;

            case 'map': return <>
                <Section title="Default Map View" icon="🗺️"><div className="cfg-grid">
                    <Field label="Center Latitude"><input className="cfg-input" type="number" step="0.0001" value={mapLat} onChange={e => setMapLat(e.target.value)} /></Field>
                    <Field label="Center Longitude"><input className="cfg-input" type="number" step="0.0001" value={mapLng} onChange={e => setMapLng(e.target.value)} /></Field>
                    <Field label="Default Zoom (1-20)"><input className="cfg-input" type="number" min="1" max="20" value={mapZoom} onChange={e => setMapZoom(e.target.value)} /></Field>
                    <Field label="Default Tile Provider">{sel(mapTile, C.tileProviders, setMapTile)}</Field>
                </div><div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, background: `${theme.border}04`, display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 18 }}>📍</span><div style={{ fontSize: 11, color: theme.textSecondary }}>Default center: <strong style={{ color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{mapLat}, {mapLng}</strong> · Zoom: <strong style={{ color: theme.text }}>{mapZoom}</strong> · Tile: <strong style={{ color: theme.text }}>{mapTile}</strong></div></div></Section>
                <Section title="Default Visible Layers" icon="🗂️"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 6 }}>{mapLayers.map(l => <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, border: `1px solid ${l.enabled ? '#22c55e20' : theme.border}` }}><Toggle on={l.enabled} onChange={() => toggleMapLayer(l.id)} /><span style={{ fontSize: 12, color: l.enabled ? theme.text : theme.textDim }}>{l.id}</span></div>)}</div></Section>
                <Section title="Clustering & Performance" icon="⚙️"><div className="cfg-grid">
                    <Field label="Cluster Threshold" hint="Min markers to activate clustering"><input className="cfg-input" type="number" value={clusterThreshold} onChange={e => setClusterThreshold(e.target.value)} min="10" max="500" /></Field>
                    <Field label="Max Markers Rendered"><input className="cfg-input" type="number" defaultValue="5000" min="100" max="50000" /></Field>
                    <Field label="Trail Line History"><select className="cfg-input" defaultValue="24"><option value="6">6 hours</option><option value="12">12 hours</option><option value="24">24 hours</option><option value="48">48 hours</option><option value="168">7 days</option></select></Field>
                    <Field label="3D Buildings"><select className="cfg-input" defaultValue="auto"><option>auto</option><option>always</option><option>never</option></select></Field>
                </div></Section>
            </>;

            case 'retention': return <>
                <Section title="Data Retention Policies" icon="📦"><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}><Toggle on={autoPurge} onChange={setAutoPurge} /><div><div style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>Auto-Purge Enabled</div><div style={{ fontSize: 10, color: theme.textDim }}>Automatically delete data beyond retention period</div></div></div>
                    <div className="cfg-grid">
                        <Field label="Event Logs" hint="GPS, camera, LPR, face match events">{sel(retEvents, C.retentionPeriods, setRetEvents)}</Field>
                        <Field label="Application Logs" hint="System, error, access logs">{sel(retLogs, C.retentionPeriods, setRetLogs)}</Field>
                        <Field label="Media Files" hint="Video, audio, photos, documents">{sel(retMedia, C.retentionPeriods, setRetMedia)}</Field>
                        <Field label="Chat History" hint="AI assistant conversations">{sel(retChat, C.retentionPeriods, setRetChat)}</Field>
                        <Field label="Database Backups">{sel(retBackups, C.retentionPeriods, setRetBackups)}</Field>
                        <Field label="Audit Trail" hint="Immutable — recommended: 5+ years">{sel(retAudit, C.retentionPeriods, setRetAudit)}</Field>
                    </div>
                </Section>
                <Section title="Storage Estimates" icon="💾"><div style={{ fontSize: 10, color: theme.textDim, marginBottom: 10 }}>Estimated storage consumption per retention period</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>{[{ l: 'Events', v: retEvents, s: '~120 GB' }, { l: 'Logs', v: retLogs, s: '~45 GB' }, { l: 'Media', v: retMedia, s: '~1.8 TB' }, { l: 'Chat', v: retChat, s: '~2 GB' }, { l: 'Backups', v: retBackups, s: '~400 GB' }, { l: 'Audit', v: retAudit, s: '~8 GB' }].map(x => <div key={x.l} style={{ padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: `${theme.border}04` }}><div style={{ fontSize: 10, color: theme.textDim }}>{x.l}</div><div style={{ fontSize: 14, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{x.s}</div><div style={{ fontSize: 9, color: theme.textDim }}>Retention: {x.v}</div></div>)}</div>
                </Section>
            </>;

            case 'system': return <>
                <Section title="Automated Backups" icon="💾"><div className="cfg-grid">
                    <Field label="Backup Frequency">{sel(backupFreq, C.backupFrequencies, setBackupFreq)}</Field>
                    <Field label="Backup Type">{sel(backupType, C.backupTypes, setBackupType)}</Field>
                </div><div style={{ display: 'flex', gap: 16, marginTop: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Toggle on={backupEncrypt} onChange={setBackupEncrypt} /><span style={{ fontSize: 12, color: theme.textSecondary }}>Encrypt backups (AES-256)</span></div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Toggle on={backupVerify} onChange={setBackupVerify} /><span style={{ fontSize: 12, color: theme.textSecondary }}>Integrity verification</span></div></div></Section>
                <Section title="AI Model Deployment" icon="🤖"><div style={{ fontSize: 10, color: theme.textDim, marginBottom: 10 }}>Manage on-premise AI models via Ollama. Toggle active/standby status.</div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>{aiModels.map(m => <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${m.status === 'active' ? '#22c55e20' : theme.border}`, background: m.status === 'active' ? '#22c55e04' : 'transparent' }}>
                        <Toggle on={m.status === 'active'} onChange={() => toggleAiModel(m.id)} />
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: m.status === 'active' ? theme.text : theme.textDim }}>{m.label}</div><div style={{ fontSize: 10, color: theme.textDim }}>GPU: {m.gpu}</div></div>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: m.status === 'active' ? '#22c55e12' : `${theme.border}15`, color: m.status === 'active' ? '#22c55e' : theme.textDim }}>{m.status.toUpperCase()}</span>
                    </div>)}</div>
                    <div style={{ marginTop: 12 }}><Field label="RAG Index Rebuild Schedule"><select className="cfg-input" value={ragRebuild} onChange={e => setRagRebuild(e.target.value)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="manual">Manual only</option></select></Field></div>
                    <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, background: `${theme.border}04`, border: `1px solid ${theme.border}`, display: 'flex', gap: 12, fontSize: 10 }}>
                        <span style={{ color: theme.textDim }}>Total GPU: <strong style={{ color: theme.text }}>{aiModels.filter(m => m.status === 'active').reduce((s, m) => s + parseInt(m.gpu), 0)} GB</strong></span>
                        <span style={{ color: theme.textDim }}>Active: <strong style={{ color: '#22c55e' }}>{aiModels.filter(m => m.status === 'active').length}</strong></span>
                        <span style={{ color: theme.textDim }}>Standby: <strong style={{ color: theme.textDim }}>{aiModels.filter(m => m.status === 'standby').length}</strong></span>
                    </div>
                </Section>
            </>;
        }
    };

    return (<><PageMeta title={`Configuration — ${C.configTabs.find(t => t.id === tab)?.label}`} /><div data-testid="admin-config-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚙️</div><div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Configuration</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>System settings · {C.configTabs.length} sections</p></div></div>
            <button onClick={handleSave} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>💾 Save Settings</button>
        </div>

        <div className="cfg-tabs">{C.configTabs.map((t, i) => <button key={t.id} className={`cfg-tab ${tab === t.id ? 'active' : ''}`} onClick={() => switchTab(t.id)}><span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}<span className="cfg-kbd">{i + 1}</span></button>)}</div>

        {tabContent()}

        {/* Clock modal */}
        {showClockModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowClockModal(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 16 }}>🕐 Add Header Clock</div>
            <Field label="City / Label"><input className="cfg-input" value={clockLabel} onChange={e => setClockLabel(e.target.value)} placeholder="e.g. Moscow" autoFocus /></Field>
            <div style={{ height: 10 }} />
            <Field label="Timezone">{sel(clockTz, C.timezones, setClockTz)}</Field>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}><button onClick={() => setShowClockModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button><button onClick={addClock} disabled={!clockLabel.trim()} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: clockLabel.trim() ? '#ef4444' : theme.border, color: '#fff', fontSize: 13, fontWeight: 700, cursor: clockLabel.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>Add Clock</button></div>
        </div></div>}

        {/* Ctrl+Q */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>{C.keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="cfg-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}<div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div></div></div>}
    </div></>);
}
AdminConfig.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
