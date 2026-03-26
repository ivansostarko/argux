import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockApps, statusColors, statusIcons, tabConfig, remoteCommands, keyboardShortcuts } from '../../mock/surveillanceApps';
import type { AppStatus, DataTab } from '../../mock/surveillanceApps';

/* ═══ ARGUX — Surveillance Apps ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="sa-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }

function AppsIndex() {
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState<AppStatus | 'all'>('all');
    const [platformF, setPlatformF] = useState<'Android' | 'iOS' | 'all'>('all');
    const [selApp, setSelApp] = useState<string | null>(null);
    const [dataTab, setDataTab] = useState<DataTab>('sms');
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

    const app = selApp ? mockApps.find(a => a.id === selApp) : null;

    const filtered = useMemo(() => mockApps.filter(a => {
        if (statusF !== 'all' && a.status !== statusF) return false;
        if (platformF !== 'all' && a.platform !== platformF) return false;
        if (search && !a.personName.toLowerCase().includes(search.toLowerCase()) && !a.deviceModel.toLowerCase().includes(search.toLowerCase()) && !a.imei.includes(search)) return false;
        return true;
    }), [statusF, platformF, search]);

    const stats = { total: mockApps.length, active: mockApps.filter(a => a.status === 'Active' || a.status === 'Stealth').length, offline: mockApps.filter(a => a.status === 'Offline' || a.status === 'Paused').length };

    const resetFilters = useCallback(() => { setSearch(''); setStatusF('all'); setPlatformF('all'); trigger(); }, [trigger]);

    const tabKeys: Record<string, DataTab> = { '1': 'sms', '2': 'calls', '3': 'contacts', '4': 'calendar', '5': 'network', '6': 'location', '7': 'screenshots', '8': 'photos', '9': 'notifications', '0': 'remote' };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            if (app && tabKeys[e.key]) { setDataTab(tabKeys[e.key]); trigger(); return; }
            switch (e.key) {
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 'Escape': if (showShortcuts) setShowShortcuts(false); else if (selApp) setSelApp(null); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [resetFilters, trigger, app, selApp, showShortcuts]);

    const isDown = app?.status === 'Offline' || app?.status === 'Paused';

    return (<>
        <PageMeta title="Surveillance Apps" />
        <div className="sa-page" data-testid="surveillance-apps-page">

            {/* LEFT */}
            <div className="sa-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#a855f710', border: '1px solid #a855f725', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📱</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>APPS</div><div style={{ fontSize: 10, color: theme.textDim }}>Surveillance Agents</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search devices..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="sa-kbd">F</span>
                    </div>
                </div>

                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ n: stats.total, l: 'Deploy', c: theme.accent }, { n: stats.active, l: 'Live', c: '#22c55e' }, { n: stats.offline, l: 'Down', c: '#6b7280' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}><div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Status</div>
                    {(['all', 'Active', 'Stealth', 'Paused', 'Offline'] as const).map(s => { const c = s === 'all' ? mockApps.length : mockApps.filter(a => a.status === s).length; if (c === 0 && s !== 'all') return null; return <button key={s} onClick={() => { setStatusF(s as any); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: statusF === s ? `${s === 'all' ? theme.accent : statusColors[s as AppStatus]}08` : 'transparent', color: statusF === s ? (s === 'all' ? theme.accent : statusColors[s as AppStatus]) : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, borderLeft: `2px solid ${statusF === s ? (s === 'all' ? theme.accent : statusColors[s as AppStatus]) : 'transparent'}`, textAlign: 'left' as const, fontWeight: statusF === s ? 600 : 400, marginBottom: 1 }}>{s === 'all' ? '📋' : statusIcons[s as AppStatus]} <span style={{ flex: 1 }}>{s === 'all' ? 'All' : s}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 6 }}>Platform</div>
                    <div style={{ display: 'flex', gap: 3 }}>{(['all', 'Android', 'iOS'] as const).map(p => <button key={p} onClick={() => { setPlatformF(p as any); trigger(); }} style={{ flex: 1, padding: '6px', borderRadius: 4, border: `1px solid ${platformF === p ? theme.accent + '40' : theme.border}`, background: platformF === p ? `${theme.accent}08` : 'transparent', color: platformF === p ? theme.accent : theme.textDim, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: platformF === p ? 600 : 400 }}>{p === 'Android' ? '🤖 ' : p === 'iOS' ? '🍎 ' : ''}{p}</button>)}</div>
                </div>

                {/* App list */}
                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', padding: '4px 0' }}>
                    {loading && Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}><Skel w={36} h={36} /><div style={{ flex: 1 }}><Skel w="70%" h={12} /><div style={{ height: 5 }} /><Skel w="50%" h={10} /></div></div>)}
                    {!loading && filtered.map(a => {
                        const sel = selApp === a.id; const sc = statusColors[a.status];
                        return <div key={a.id} className="sa-app-item" onClick={() => { setSelApp(a.id); setDataTab('sms'); trigger(); }} style={{ padding: '10px 14px', cursor: 'pointer', borderLeft: `3px solid ${sel ? sc : 'transparent'}`, background: sel ? `${sc}06` : 'transparent' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <img src={a.personAvatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${sc}40` }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{a.personName}</div>
                                    <div style={{ fontSize: 9, color: theme.textDim }}>{a.deviceModel.split(' ').slice(0, 2).join(' ')} · {a.platform}</div>
                                </div>
                                <div style={{ textAlign: 'right' as const }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: sc }}>{statusIcons[a.status]}</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>{a.lastCheckInAgo}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 5, fontSize: 9, color: theme.textDim }}>
                                <span>🔋{a.battery}%</span><span>📶{a.signal}%</span><span>💬{a.stats.sms}</span><span>📞{a.stats.calls}</span>
                            </div>
                        </div>;
                    })}
                </div>

                <div style={{ padding: '10px 14px', borderTop: `1px solid ${theme.border}` }}>
                    <button onClick={resetFilters} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset <span className="sa-kbd" style={{ marginLeft: 4 }}>R</span></button>
                </div>
            </div>

            {/* CENTER */}
            <div className="sa-center">
                <div className="sa-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    {!app && <select value={selApp || ''} onChange={e => { if (e.target.value) { setSelApp(e.target.value); setDataTab('sms'); trigger(); } }} style={{ padding: '7px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}><option value="">Select agent...</option>{mockApps.map(a => <option key={a.id} value={a.id}>{a.personName}</option>)}</select>}
                </div>

                {!app && <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim }}>
                    {loading ? <div style={{ textAlign: 'center' as const }}><Skel w={60} h={60} /><div style={{ height: 10 }} /><Skel w={180} h={16} /><div style={{ height: 6 }} /><Skel w={140} h={12} /></div>
                    : <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: 46, opacity: 0.2, marginBottom: 10 }}>📱</div><div style={{ fontSize: 16, fontWeight: 700, color: theme.textSecondary }}>Select a deployed app</div><div style={{ fontSize: 12, color: theme.textDim, marginTop: 5 }}>Choose a target device from the sidebar</div></div>}
                </div>}

                {app && <>
                    {/* Device header */}
                    <div style={{ padding: '12px 18px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, flexWrap: 'wrap' as const }}>
                        <img src={app.personAvatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${statusColors[app.status]}50` }} />
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>{app.personName} <span style={{ fontSize: 11, color: statusColors[app.status], fontWeight: 600 }}>{statusIcons[app.status]} {app.status}</span></div>
                            <div style={{ fontSize: 10, color: theme.textDim }}>{app.deviceModel} · {app.platform} {app.osVersion} · {app.appVersion}</div>
                        </div>
                        <div className="sa-header-details" style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                            {[{ l: 'IMEI', v: app.imei }, { l: 'Phone', v: app.phoneNumber }].map(i => <div key={i.l} style={{ textAlign: 'right' as const }}><div style={{ fontSize: 8, color: theme.textDim }}>{i.l}</div><div style={{ fontSize: 10, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{i.v}</div></div>)}
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="sa-stats-bar" style={{ padding: '8px 18px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
                        {[{ n: app.stats.sms, l: '💬 SMS' }, { n: app.stats.calls, l: '📞 Calls' }, { n: app.stats.contacts, l: '👥 Contacts' }, { n: app.stats.photos, l: '🖼️ Photos' }, { n: app.stats.screenshots, l: '📸 Screens' }].map(s => <div key={s.l} style={{ textAlign: 'center' as const, flex: 1 }}><div style={{ fontSize: 15, fontWeight: 800, color: theme.accent, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                        <div style={{ textAlign: 'center' as const, flex: 1 }}><div style={{ fontSize: 15, fontWeight: 800, color: app.battery > 30 ? '#22c55e' : '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>{app.battery}%</div><div style={{ fontSize: 8, color: theme.textDim }}>🔋</div></div>
                        <div style={{ textAlign: 'center' as const, flex: 1 }}><div style={{ fontSize: 15, fontWeight: 800, color: app.signal > 50 ? '#22c55e' : '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{app.signal}%</div><div style={{ fontSize: 8, color: theme.textDim }}>📶</div></div>
                    </div>

                    {/* Data tabs */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
                        {(Object.keys(tabConfig) as DataTab[]).map(t => { const tc = tabConfig[t]; return <button key={t} onClick={() => { setDataTab(t); trigger(); }} style={{ padding: '8px 10px', border: 'none', borderBottom: `2px solid ${dataTab === t ? '#a855f7' : 'transparent'}`, background: 'transparent', color: dataTab === t ? theme.text : theme.textDim, fontSize: 11, fontWeight: dataTab === t ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, display: 'flex', alignItems: 'center', gap: 3 }}>{tc.icon} <span className="sa-tab-label">{tc.label}</span></button>; })}
                    </div>

                    {/* Data content */}
                    <div className="sa-scroll">
                        {dataTab === 'sms' && <div>
                            {app.sms.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No SMS data {app.type === 'GPS Tracker' ? '(GPS tracker only)' : ''}</div>}
                            {app.sms.map(s => <div key={s.id} style={{ padding: '12px 18px', borderBottom: `1px solid ${theme.border}06`, background: s.flagged ? '#ef444406' : 'transparent', borderLeft: `3px solid ${s.flagged ? '#ef4444' : 'transparent'}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                                    <span style={{ fontSize: 12 }}>{s.direction === 'out' ? '📤' : '📥'}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{s.direction === 'out' ? s.to : s.from}</span>
                                    <span style={{ fontSize: 9, color: theme.textDim }}>{s.direction === 'out' ? 'Sent' : 'Received'}</span>
                                    {s.flagged && <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 3, background: '#ef444420', color: '#ef4444', marginLeft: 'auto' }}>🚩 FLAGGED</span>}
                                    <span style={{ fontSize: 9, color: theme.textDim, marginLeft: s.flagged ? 0 : 'auto' }}>{s.timestamp.slice(5)}</span>
                                </div>
                                <div style={{ fontSize: 12, color: theme.text, lineHeight: 1.6, padding: '4px 0 4px 20px' }}>{s.body}</div>
                                {s.flagged && <div style={{ fontSize: 10, color: '#ef4444', lineHeight: 1.5, padding: '6px 10px', marginLeft: 20, borderRadius: 5, background: '#ef444408', border: '1px solid #ef444415' }}>🚩 {s.flagReason}</div>}
                            </div>)}
                        </div>}

                        {dataTab === 'calls' && <div>
                            {app.calls.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No call data</div>}
                            {app.calls.map(c => <div key={c.id} style={{ padding: '10px 18px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 16 }}>{c.direction === 'out' ? '📞' : c.direction === 'missed' ? '📵' : '📲'}</span>
                                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: c.direction === 'missed' ? '#ef4444' : theme.text }}>{c.name}</div><div style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{c.number}</div></div>
                                <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 11, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{c.duration}</div><div style={{ fontSize: 9, color: theme.textDim }}>{c.timestamp.slice(5)}</div></div>
                                {c.recorded && <span style={{ fontSize: 9, padding: '3px 6px', borderRadius: 4, background: '#ef444412', color: '#ef4444', fontWeight: 700 }}>🎙️ REC</span>}
                            </div>)}
                        </div>}

                        {dataTab === 'contacts' && <div>
                            {app.contacts.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No contacts</div>}
                            {app.contacts.map(c => <div key={c.id} style={{ padding: '10px 18px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${theme.accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: theme.accent, fontWeight: 800 }}>{c.name.charAt(0)}</div>
                                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{c.name} {c.starred && '⭐'}</div><div style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{c.phone}</div>{c.email && <div style={{ fontSize: 9, color: theme.textDim }}>{c.email}</div>}</div>
                                <span style={{ fontSize: 9, padding: '3px 6px', borderRadius: 4, background: `${theme.border}15`, color: theme.textDim }}>{c.label}</span>
                            </div>)}
                        </div>}

                        {dataTab === 'calendar' && <div>
                            {app.calendar.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No calendar data</div>}
                            {app.calendar.map(c => <div key={c.id} style={{ padding: '12px 18px', borderBottom: `1px solid ${theme.border}06`, borderLeft: `3px solid ${c.title.includes('🔴') || c.title.includes('Dock') ? '#ef4444' : theme.accent}` }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 3 }}>{c.title}</div>
                                <div style={{ fontSize: 11, color: theme.textDim }}>{c.date} · {c.time} · 📍 {c.location}</div>
                                {c.notes && <div style={{ fontSize: 10, color: c.notes.includes('CRITICAL') ? '#ef4444' : theme.textSecondary, marginTop: 3 }}>{c.notes}</div>}
                            </div>)}
                        </div>}

                        {dataTab === 'notifications' && <div>
                            {app.notifications.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No notifications</div>}
                            {app.notifications.map(n => <div key={n.id} style={{ padding: '10px 18px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${theme.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🔔</div>
                                <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{n.app} — {n.title}</div><div style={{ fontSize: 11, color: theme.textSecondary }}>{n.body}</div></div>
                                <span style={{ fontSize: 9, color: theme.textDim, flexShrink: 0 }}>{n.timestamp.slice(5)}</span>
                            </div>)}
                        </div>}

                        {dataTab === 'network' && <div style={{ padding: 18 }}>
                            <div style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                                {Object.entries(app.networkInfo).map(([k, v]) => <div key={k} style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 11, color: theme.textDim }}>{k}</span><span style={{ fontSize: 11, color: (k === 'VPN' && v !== 'None' && v !== 'None detected') ? '#f59e0b' : k === 'Status' && v.includes('OFFLINE') ? '#ef4444' : theme.text, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{v}</span></div>)}
                            </div>
                        </div>}

                        {dataTab === 'location' && <div style={{ padding: 18 }}>
                            <div style={{ padding: 18, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgCard }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 5 }}>📍 Current Location</div>
                                <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 8 }}>{app.locationName}</div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {[{ l: 'Latitude', v: app.lat.toFixed(5) }, { l: 'Longitude', v: app.lng.toFixed(5) }, { l: 'Last Update', v: app.lastCheckInAgo }].map(r => <div key={r.l}><div style={{ fontSize: 9, color: theme.textDim }}>{r.l}</div><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{r.v}</div></div>)}
                                </div>
                                <a href="/map" style={{ display: 'inline-block', marginTop: 10, fontSize: 11, padding: '6px 14px', borderRadius: 5, border: `1px solid ${theme.accent}30`, color: theme.accent, textDecoration: 'none', fontWeight: 700 }}>🗺️ Show on Map</a>
                            </div>
                        </div>}

                        {dataTab === 'screenshots' && <div className="sa-screenshot-grid" style={{ padding: 14 }}>
                            {app.screenshots.length === 0 && <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No screenshots</div>}
                            {app.screenshots.map(s => <div key={s.id} style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                                <div style={{ height: 110, background: '#0a0e16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 11 }}>📸 {s.app}</div>
                                <div style={{ padding: '8px 10px' }}><div style={{ fontSize: 10, color: theme.text }}>{s.app}</div><div style={{ fontSize: 9, color: theme.textDim }}>{s.timestamp.slice(5)} · {s.size}</div></div>
                            </div>)}
                        </div>}

                        {dataTab === 'photos' && <div className="sa-screenshot-grid" style={{ padding: 14 }}>
                            {app.photos.length === 0 && <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No photos</div>}
                            {app.photos.map(p => <div key={p.id} style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                                <div style={{ height: 110, background: '#0a0e16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 11 }}>🖼️ {p.filename}</div>
                                <div style={{ padding: '8px 10px' }}><div style={{ fontSize: 10, color: theme.text }}>{p.filename}</div><div style={{ fontSize: 9, color: theme.textDim }}>{p.timestamp.slice(5)} · {p.size} · 📍 {p.location}</div></div>
                            </div>)}
                        </div>}

                        {dataTab === 'remote' && <div style={{ padding: 18 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 5 }}>🎮 Remote Control</div>
                            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 14 }}>Commands execute silently on {app.personName}'s device.</div>
                            <div className="sa-remote-grid">
                                {remoteCommands.map(cmd => <button key={cmd.label} disabled={isDown} style={{ padding: 14, borderRadius: 8, border: `1px solid ${cmd.color}20`, background: `${cmd.color}04`, cursor: isDown ? 'not-allowed' : 'pointer', textAlign: 'left' as const, fontFamily: 'inherit', opacity: isDown ? 0.4 : 1 }}>
                                    <div style={{ fontSize: 18, marginBottom: 5 }}>{cmd.icon}</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{cmd.label}</div>
                                    <div style={{ fontSize: 10, color: theme.textDim }}>{cmd.desc}</div>
                                </button>)}
                            </div>
                            {isDown && <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, border: '1px solid #ef444420', background: '#ef444406', fontSize: 11, color: '#ef4444' }}>⚠️ Device {app.status.toLowerCase()}. Remote commands unavailable.</div>}
                        </div>}
                    </div>
                </>}
            </div>

            {/* Ctrl+Q */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="sa-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

AppsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default AppsIndex;
