import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { theme } from '../../lib/theme';

/* ─── City Clock Dropdown ─── */
const cities = [
    { name: 'Zagreb', tz: 'Europe/Zagreb', flag: '🇭🇷' },
    { name: 'Riyadh', tz: 'Asia/Riyadh', flag: '🇸🇦' },
    { name: 'Sydney', tz: 'Australia/Sydney', flag: '🇦🇺' },
];

function CityClocks() {
    const [open, setOpen] = useState(false);
    const [now, setNow] = useState(new Date());
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const i = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(i);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fmt = (tz: string) => now.toLocaleTimeString('en-US', { hour12: false, timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fmtDate = (tz: string) => now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });
    const primary = cities[0];

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => setOpen(!open)} style={{
                display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${theme.border}`, borderRadius: 8, padding: '6px 12px',
                cursor: 'pointer', color: theme.text, fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, transition: 'all 0.15s',
            }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><polyline points="8,4 8,8 11,10"/></svg>
                <span>{primary.name}</span>
                <span style={{ color: theme.accent, fontWeight: 600 }}>{fmt(primary.tz)}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}><polyline points="2,4 5,7 8,4"/></svg>
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 6,
                    background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 10,
                    padding: 6, minWidth: 230, zIndex: 100,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                }}>
                    {cities.map(c => (
                        <div key={c.name} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', borderRadius: 6, gap: 12,
                        }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 14 }}>{c.flag}</span>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{c.name}</div>
                                    <div style={{ fontSize: 10, color: theme.textDim }}>{fmtDate(c.tz)}</div>
                                </div>
                            </div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.accent }}>
                                {fmt(c.tz)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Notification Dropdown ─── */
const mockNotifications = [
    { id: 1, type: 'system', title: 'System update available', body: 'ARGUX v2.1.1 patch ready — security fixes and performance improvements', time: '3m ago', read: false, severity: 'info' },
    { id: 2, type: 'storage', title: 'Storage threshold exceeded', body: 'MinIO cluster node-03 at 91% capacity — media partition critical', time: '12m ago', read: false, severity: 'warning' },
    { id: 3, type: 'user', title: 'New user registration', body: 'Pending approval: Ana Kovač (ana.kovac@agency.gov) — GEOINT division', time: '28m ago', read: false, severity: 'info' },
    { id: 4, type: 'security', title: 'Failed login attempts detected', body: '7 consecutive failures from IP 185.23.xx.xx — account temporarily locked', time: '45m ago', read: false, severity: 'critical' },
    { id: 5, type: 'device', title: 'Device offline — GPS Tracker #0291', body: 'Last signal received 18 minutes ago from sector Delta-7', time: '1h ago', read: true, severity: 'warning' },
    { id: 6, type: 'backup', title: 'Scheduled backup completed', body: 'Full system backup — 847 GB, verified, encrypted, stored to vault-02', time: '2h ago', read: true, severity: 'info' },
];

function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const ref = useRef<HTMLDivElement>(null);
    const unread = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const typeColors: Record<string, string> = {
        system: theme.accent, storage: theme.warning, user: theme.cyan,
        security: theme.danger, device: theme.warning, backup: theme.success,
    };

    const typeIcons: Record<string, React.ReactNode> = {
        system: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M13 8a5 5 0 00-.3-1.7l1.5-1.2-1-1.7-1.8.6A5 5 0 009.7 3L9 1.5H7L6.3 3a5 5 0 00-1.7 1l-1.8-.6-1 1.7 1.5 1.2A5 5 0 003 8a5 5 0 00.3 1.7l-1.5 1.2 1 1.7 1.8-.6c.5.4 1.1.8 1.7 1l.7 1.5h2l.7-1.5c.6-.2 1.2-.6 1.7-1l1.8.6 1-1.7-1.5-1.2A5 5 0 0013 8z"/></svg>,
        storage: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="4" rx="1"/><rect x="2" y="10" width="12" height="4" rx="1"/><circle cx="4.5" cy="4" r="0.5" fill="currentColor"/><circle cx="4.5" cy="12" r="0.5" fill="currentColor"/></svg>,
        user: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>,
        security: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5l5.5 2v4c0 3.5-2.5 6-5.5 7.5-3-1.5-5.5-4-5.5-7.5v-4z"/></svg>,
        device: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="8" height="8" rx="1"/><rect x="6" y="6" width="4" height="4" rx="0.5"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="6" y1="12" x2="6" y2="14"/><line x1="10" y1="12" x2="10" y2="14"/></svg>,
        backup: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v9a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1H8L6.5 3H3a1 1 0 00-1 1z"/><polyline points="6,9 8,11 10,9"/><line x1="8" y1="7" x2="8" y2="11"/></svg>,
    };

    const handleReadAll = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => setOpen(!open)} style={{
                position: 'relative', background: 'none', border: `1px solid ${theme.border}`,
                borderRadius: 8, padding: 7, cursor: 'pointer', color: theme.textSecondary,
                display: 'flex', transition: 'all 0.15s',
            }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = theme.accent; (e.currentTarget as HTMLElement).style.color = theme.text; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = theme.border; (e.currentTarget as HTMLElement).style.color = theme.textSecondary; }}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6a4 4 0 018 0c0 4 2 5 2 5H2s2-1 2-5"/><path d="M6.5 13a1.5 1.5 0 003 0"/></svg>
                {unread > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4, width: 16, height: 16,
                        background: theme.danger, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid #0a0e16',
                    }}>{unread}</span>
                )}
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 6,
                    background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 10,
                    width: 360, maxHeight: 460, display: 'flex', flexDirection: 'column', zIndex: 100,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                }}>
                    <div style={{
                        padding: '12px 16px', borderBottom: `1px solid ${theme.border}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>Notifications</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {unread > 0 && <span style={{ fontSize: 11, color: theme.accent, fontWeight: 600 }}>{unread} new</span>}
                            {unread > 0 && (
                                <button onClick={handleReadAll} style={{
                                    background: 'none', border: 'none', color: theme.textSecondary, fontSize: 11,
                                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                                    padding: '2px 6px', borderRadius: 4, transition: 'all 0.15s',
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = theme.accent; (e.currentTarget as HTMLElement).style.background = theme.accentDim; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = theme.textSecondary; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                                >Read all</button>
                            )}
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {notifications.map(n => (
                            <div key={n.id} style={{
                                padding: '12px 16px', borderBottom: `1px solid rgba(255,255,255,0.03)`,
                                cursor: 'pointer', display: 'flex', gap: 10,
                                background: n.read ? 'transparent' : 'rgba(29,111,239,0.04)',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(29,111,239,0.04)')}
                            >
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                    background: `${typeColors[n.type] || theme.textDim}15`,
                                    border: `1px solid ${typeColors[n.type] || theme.textDim}25`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: typeColors[n.type] || theme.textDim,
                                }}>
                                    {typeIcons[n.type]}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{n.title}</span>
                                        {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, flexShrink: 0 }} />}
                                    </div>
                                    <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.4 }}>{n.body}</div>
                                    <div style={{ fontSize: 10, color: theme.textDim, marginTop: 4 }}>{n.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: `1px solid ${theme.border}`, flexShrink: 0 }}>
                        <button onClick={() => { setOpen(false); router.visit('/notifications'); }} style={{
                            background: 'none', border: 'none', color: theme.accent, fontSize: 12,
                            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        }}>View all notifications</button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── User Dropdown ─── */
function UserDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const menuItems = [
        { label: 'My Profile', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>, route: '/profile' },
        { label: 'Settings', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2.5"/><path d="M13 8a5.002 5.002 0 00-.3-1.7l1.5-1.2-1-1.7-1.8.6A5 5 0 009.7 3L9 1.5H7L6.3 3a5 5 0 00-1.7 1l-1.8-.6-1 1.7 1.5 1.2A5 5 0 003 8a5 5 0 00.3 1.7l-1.5 1.2 1 1.7 1.8-.6c.5.4 1.1.8 1.7 1l.7 1.5h2l.7-1.5c.6-.2 1.2-.6 1.7-1l1.8.6 1-1.7-1.5-1.2A5 5 0 0013 8z"/></svg>, route: '/settings' },
    ];

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => setOpen(!open)} style={{
                display: 'flex', alignItems: 'center', gap: 8, background: 'none',
                border: `1px solid ${theme.border}`, borderRadius: 8, padding: '4px 10px 4px 4px',
                cursor: 'pointer', color: theme.text, fontFamily: 'inherit', transition: 'all 0.15s',
            }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = theme.accent)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = theme.border)}
            >
                <div style={{
                    width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${theme.accent}, #1858b8)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                }}>JM</div>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>J. Mitchell</div>
                    <div style={{ fontSize: 9, color: theme.textDim, letterSpacing: '0.05em' }}>OPERATOR</div>
                </div>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ marginLeft: 2, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}><polyline points="2,4 5,7 8,4"/></svg>
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 6,
                    background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 10,
                    padding: 6, minWidth: 180, zIndex: 100,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                }}>
                    {/* User info header */}
                    <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>James Mitchell</div>
                        <div style={{ fontSize: 11, color: theme.textSecondary }}>j.mitchell@argux.mil</div>
                    </div>
                    {menuItems.map(item => (
                        <button key={item.route} onClick={() => { setOpen(false); router.visit(item.route); }} style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                            padding: '9px 12px', background: 'none', border: 'none',
                            color: theme.textSecondary, fontSize: 13, fontFamily: 'inherit',
                            cursor: 'pointer', borderRadius: 6, transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = theme.text; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = theme.textSecondary; }}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                    <div style={{ height: 1, background: theme.border, margin: '4px 0' }} />
                    <button onClick={() => { setOpen(false); router.visit('/login'); }} style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '9px 12px', background: 'none', border: 'none',
                        color: theme.danger, fontSize: 13, fontFamily: 'inherit',
                        cursor: 'pointer', borderRadius: 6, transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => (e.currentTarget.style.background = theme.dangerDim)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3"/><polyline points="10,11 14,8 10,5"/><line x1="14" y1="8" x2="6" y2="8"/></svg>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─── Header ─── */
interface AppHeaderProps {
    onMenuToggle: () => void;
}

export default function AppHeader({ onMenuToggle }: AppHeaderProps) {
    return (
        <header style={{
            height: 56, background: '#0a0e16', borderBottom: `1px solid ${theme.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 30,
        }}>
            {/* Left side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Mobile menu button */}
                <button onClick={onMenuToggle} className="mobile-menu-btn" style={{
                    background: 'none', border: 'none', color: theme.textSecondary,
                    cursor: 'pointer', padding: 4, display: 'none', alignItems: 'center',
                }}>
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <line x1="2" y1="4" x2="14" y2="4" /><line x1="2" y1="8" x2="14" y2="8" /><line x1="2" y1="12" x2="14" y2="12" />
                    </svg>
                </button>
                <style>{`@media(max-width:768px){.mobile-menu-btn{display:flex!important}}`}</style>
                <CityClocks />
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <NotificationDropdown />
                <UserDropdown />
            </div>
        </header>
    );
}
