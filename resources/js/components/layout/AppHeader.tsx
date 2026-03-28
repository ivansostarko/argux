import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useAppSettings } from '../../layouts/AppLayout';

const cities = [
    { name: 'Zagreb', tz: 'Europe/Zagreb', flag: '🇭🇷' },
    { name: 'Riyadh', tz: 'Asia/Riyadh', flag: '🇸🇦' },
    { name: 'Sydney', tz: 'Australia/Sydney', flag: '🇦🇺' },
];

function CityClocks() {
    const { currentTheme: th } = useAppSettings();
    const [open, setOpen] = useState(false);
    const [now, setNow] = useState(new Date());
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i); }, []);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const fmt = (tz: string) => now.toLocaleTimeString('en-US', { hour12: false, timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fmtDate = (tz: string) => now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Desktop: full clock button */}
            <button onClick={() => setOpen(!open)} className="ax-clock-full" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(128,128,128,0.06)', border: `1px solid ${th.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: th.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, transition: 'all 0.15s' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><polyline points="8,4 8,8 11,10"/></svg>
                <span>{cities[0].name}</span><span style={{ color: th.accent, fontWeight: 600 }}>{fmt(cities[0].tz)}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}><polyline points="2,4 5,7 8,4"/></svg>
            </button>
            {/* Mobile: icon-only clock button */}
            <button onClick={() => setOpen(!open)} className="ax-clock-icon" style={{ display: 'none', background: 'none', border: `1px solid ${th.border}`, borderRadius: 8, padding: 7, cursor: 'pointer', color: th.textSecondary, alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><polyline points="8,4 8,8 11,10"/></svg>
            </button>
            {open && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, background: th.sidebarBg, border: `1px solid ${th.border}`, borderRadius: 10, padding: 6, minWidth: 230, zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
                    {cities.map(c => (
                        <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 6, gap: 12 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 14 }}>{c.flag}</span>
                                <div><div style={{ fontSize: 12, fontWeight: 600, color: th.text }}>{c.name}</div><div style={{ fontSize: 10, color: th.textDim }}>{fmtDate(c.tz)}</div></div>
                            </div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: th.accent }}>{fmt(c.tz)}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const mockNotifications = [
    { id: 1, type: 'system' as const, title: 'System update available', body: 'ARGUX v2.1.1 patch ready', time: '3m ago', read: false },
    { id: 2, type: 'storage' as const, title: 'Storage threshold exceeded', body: 'MinIO node-03 at 91% capacity', time: '12m ago', read: false },
    { id: 3, type: 'user' as const, title: 'New user registration', body: 'Pending: Ana Kovač — GEOINT', time: '28m ago', read: false },
    { id: 4, type: 'security' as const, title: 'Failed login attempts', body: '7 failures from IP 185.23.xx.xx', time: '45m ago', read: false },
    { id: 5, type: 'device' as const, title: 'Device offline — #0291', body: 'GPS Tracker lost signal 18m ago', time: '1h ago', read: true },
    { id: 6, type: 'backup' as const, title: 'Backup completed', body: '847 GB, verified, encrypted', time: '2h ago', read: true },
];

function NotificationDropdown() {
    const { currentTheme: th } = useAppSettings();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(mockNotifications);
    const ref = useRef<HTMLDivElement>(null);
    const unread = items.filter(n => !n.read).length;
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const typeColors: Record<string, string> = { system: th.accent, storage: th.warning, user: th.cyan, security: th.danger, device: th.warning, backup: th.success };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => setOpen(!open)} style={{ position: 'relative', background: 'none', border: `1px solid ${th.border}`, borderRadius: 8, padding: 7, cursor: 'pointer', color: th.textSecondary, display: 'flex', transition: 'all 0.15s' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6a4 4 0 018 0c0 4 2 5 2 5H2s2-1 2-5"/><path d="M6.5 13a1.5 1.5 0 003 0"/></svg>
                {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: th.danger, borderRadius: '50%', fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${th.headerBg}` }}>{unread}</span>}
            </button>
            {open && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: th.sidebarBg, border: `1px solid ${th.border}`, borderRadius: 10, width: 360, maxWidth: 'calc(100vw - 20px)', maxHeight: 460, display: 'flex', flexDirection: 'column', zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${th.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: th.text }}>Notifications</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {unread > 0 && <span style={{ fontSize: 11, color: th.accent, fontWeight: 600 }}>{unread} new</span>}
                            {unread > 0 && <button onClick={() => setItems(p => p.map(n => ({ ...n, read: true })))} style={{ background: 'none', border: 'none', color: th.textSecondary, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, padding: '2px 6px', borderRadius: 4, transition: 'all 0.15s' }}>Read all</button>}
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {items.map(n => (
                            <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(128,128,128,0.06)', cursor: 'pointer', display: 'flex', gap: 10, background: n.read ? 'transparent' : `${th.accent}08` }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.06)')} onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : `${th.accent}08`)}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: `${typeColors[n.type]}15`, border: `1px solid ${typeColors[n.type]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColors[n.type], fontSize: 12 }}>●</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}><span style={{ fontSize: 12, fontWeight: 600, color: th.text }}>{n.title}</span>{!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: th.accent, flexShrink: 0 }} />}</div>
                                    <div style={{ fontSize: 11, color: th.textSecondary, lineHeight: 1.4 }}>{n.body}</div>
                                    <div style={{ fontSize: 10, color: th.textDim, marginTop: 4 }}>{n.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: `1px solid ${th.border}`, flexShrink: 0 }}>
                        <button onClick={() => { setOpen(false); router.visit('/notifications'); }} style={{ background: 'none', border: 'none', color: th.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>View all notifications</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function UserDropdown({ isAdmin }: { isAdmin?: boolean }) {
    const { currentTheme: th } = useAppSettings();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

    const menuItems = isAdmin ? [
        { label: 'My Profile', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>, action: () => router.visit('/admin/profile') },
        { label: 'Back to Platform', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="10,3 4,8 10,13"/></svg>, action: () => router.visit('/map') },
    ] : [
        { label: 'My Profile', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>, action: () => router.visit('/profile') },
        { label: 'Download Client', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/></svg>, action: () => router.visit('/download') },
        { label: 'Settings', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2.5"/><path d="M13 8a5.002 5.002 0 00-.3-1.7l1.5-1.2-1-1.7-1.8.6A5 5 0 009.7 3L9 1.5H7L6.3 3a5 5 0 00-1.7 1l-1.8-.6-1 1.7 1.5 1.2A5 5 0 003 8a5 5 0 00.3 1.7l-1.5 1.2 1 1.7 1.8-.6c.5.4 1.1.8 1.7 1l.7 1.5h2l.7-1.5c.6-.2 1.2-.6 1.7-1l1.8.6 1-1.7-1.5-1.2A5 5 0 0013 8z"/></svg>, action: () => router.visit('/profile?tab=settings') },
    ];

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Desktop: full profile button with name */}
            <button onClick={() => setOpen(!open)} className="ax-profile-full" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: `1px solid ${th.border}`, borderRadius: 8, padding: '4px 10px 4px 4px', cursor: 'pointer', color: th.text, fontFamily: 'inherit', transition: 'all 0.15s' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${th.accent}, ${th.accent}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>JM</div>
                <div style={{ textAlign: 'left' }}><div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>J. Mitchell</div><div style={{ fontSize: 9, color: th.textDim, letterSpacing: '0.05em' }}>OPERATOR</div></div>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ marginLeft: 2, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}><polyline points="2,4 5,7 8,4"/></svg>
            </button>
            {/* Mobile: icon-only profile button */}
            <button onClick={() => setOpen(!open)} className="ax-profile-icon" style={{ display: 'none', width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${th.accent}, ${th.accent}99)`, border: 'none', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'inherit' }}>
                JM
            </button>
            {open && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: th.sidebarBg, border: `1px solid ${th.border}`, borderRadius: 10, padding: 6, minWidth: 180, zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ padding: '10px 12px', borderBottom: `1px solid ${th.border}`, marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: th.text }}>James Mitchell</div>
                        <div style={{ fontSize: 11, color: th.textSecondary }}>j.mitchell@argux.mil</div>
                    </div>
                    {menuItems.map((item, i) => (
                        <button key={i} onClick={() => { setOpen(false); item.action(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'none', border: 'none', color: th.textSecondary, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 6, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(128,128,128,0.08)'; e.currentTarget.style.color = th.text; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = th.textSecondary; }}>
                            {item.icon}{item.label}
                        </button>
                    ))}
                    <div style={{ height: 1, background: th.border, margin: '4px 0' }} />
                    <button onClick={() => { setOpen(false); router.visit(isAdmin ? '/admin/login' : '/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'none', border: 'none', color: th.danger, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 6, transition: 'all 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = th.dangerDim)} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3"/><polyline points="10,11 14,8 10,5"/><line x1="14" y1="8" x2="6" y2="8"/></svg>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default function AppHeader({ onMenuToggle, hideClock, hideNotifications, isAdmin }: { onMenuToggle: () => void; hideClock?: boolean; hideNotifications?: boolean; isAdmin?: boolean }) {
    const { currentTheme: th } = useAppSettings();
    return (
        <header style={{ height: 56, background: th.headerBg, borderBottom: `1px solid ${th.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 30 }}>
            {/* Responsive styles for header elements */}
            <style>{`
                @media(min-width:769px) {
                    .ax-hamburger { display: none !important; }
                }
                @media(max-width:768px) {
                    .ax-hamburger { display: flex !important; }
                    .ax-clock-full { display: none !important; }
                    .ax-clock-icon { display: flex !important; }
                    .ax-profile-full { display: none !important; }
                    .ax-profile-icon { display: flex !important; }
                }
            `}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Single hamburger — mobile only, opens sidebar */}
                <button onClick={onMenuToggle} className="ax-hamburger" style={{ display: 'none', background: 'none', border: `1px solid ${th.border}`, borderRadius: 8, padding: 7, cursor: 'pointer', color: th.textSecondary, alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg>
                </button>
                {!hideClock && <CityClocks />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {!hideNotifications && <NotificationDropdown />}
                <UserDropdown isAdmin={isAdmin} />
            </div>
        </header>
    );
}
