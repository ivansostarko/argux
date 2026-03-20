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
    { id: 1, type: 'alert', title: 'Geofence breach detected', body: 'Subject Alpha entered restricted zone R-4', time: '2m ago', read: false },
    { id: 2, type: 'face', title: 'Face match confirmed', body: '94.7% confidence — Camera #12, Sector B', time: '8m ago', read: false },
    { id: 3, type: 'system', title: 'Data source sync complete', body: 'National Vehicle Registry — 12,847 records', time: '23m ago', read: true },
    { id: 4, type: 'lpr', title: 'LPR hit on watchlist plate', body: 'ZG-4491-AB spotted at checkpoint Delta', time: '1h ago', read: true },
    { id: 5, type: 'alert', title: 'Signal lost — Device #0147', body: 'GPS tracker offline for 15+ minutes', time: '2h ago', read: true },
];

function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const unread = mockNotifications.filter(n => !n.read).length;

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const typeColors: Record<string, string> = {
        alert: theme.danger, face: theme.success, system: theme.accent, lpr: theme.warning,
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
                    width: 340, maxHeight: 420, overflowY: 'auto', zIndex: 100,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                }}>
                    <div style={{
                        padding: '12px 16px', borderBottom: `1px solid ${theme.border}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>Notifications</span>
                        {unread > 0 && <span style={{ fontSize: 11, color: theme.accent, fontWeight: 600 }}>{unread} new</span>}
                    </div>
                    {mockNotifications.map(n => (
                        <div key={n.id} style={{
                            padding: '12px 16px', borderBottom: `1px solid rgba(255,255,255,0.03)`,
                            cursor: 'pointer', display: 'flex', gap: 10,
                            background: n.read ? 'transparent' : 'rgba(29,111,239,0.04)',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                            onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(29,111,239,0.04)')}
                        >
                            <div style={{
                                width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                                background: typeColors[n.type] || theme.textDim,
                                boxShadow: !n.read ? `0 0 6px ${typeColors[n.type] || theme.textDim}` : 'none',
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 2 }}>{n.title}</div>
                                <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.4 }}>{n.body}</div>
                                <div style={{ fontSize: 10, color: theme.textDim, marginTop: 4 }}>{n.time}</div>
                            </div>
                        </div>
                    ))}
                    <div style={{ padding: '10px 16px', textAlign: 'center' }}>
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
