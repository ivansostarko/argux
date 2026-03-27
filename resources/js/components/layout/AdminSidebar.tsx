import { router } from '@inertiajs/react';
import { useAppSettings } from '../../layouts/AppLayout';
import Logo from '../auth/Logo';

interface NavItem { label: string; icon: React.ReactNode; route: string; badge?: number; }
interface NavSection { title: string; items: NavItem[]; }

const I = {
    dashboard: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>,
    admins: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5l5.5 2v4c0 3.5-2.5 6-5.5 7.5-3-1.5-5.5-4-5.5-7.5v-4z"/><circle cx="8" cy="7" r="1.5"/><path d="M6.5 10c.3-.6.9-1 1.5-1s1.2.4 1.5 1"/></svg>,
    users: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="5" r="2.5"/><path d="M1 14c0-3 2.2-4.5 5-4.5s5 1.5 5 4.5"/><circle cx="11.5" cy="5.5" r="2"/><path d="M12 9.5c1.8.3 3 1.5 3 3.5"/></svg>,
    roles: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h12v3H2z"/><path d="M4 6v7"/><path d="M8 6v7"/><path d="M12 6v7"/><circle cx="4" cy="13" r="1"/><circle cx="8" cy="13" r="1"/><circle cx="12" cy="13" r="1"/></svg>,
    stats: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="8" width="3" height="6" rx="0.5"/><rect x="6.5" y="4" width="3" height="10" rx="0.5"/><rect x="12" y="1" width="3" height="13" rx="0.5"/></svg>,
    audit: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4z"/><polyline points="10,1 10,4 13,4"/><line x1="5" y1="7" x2="11" y2="7"/><line x1="5" y1="9.5" x2="11" y2="9.5"/><line x1="5" y1="12" x2="8" y2="12"/></svg>,
    config: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>,
    support: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="2" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="14" y2="8"/></svg>,
    kb: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2h4.5a1.5 1.5 0 011.5 1.5V14l-2-1.5L4 14V2z"/><path d="M14 2H9.5A1.5 1.5 0 008 3.5V14l2-1.5L12 14V2z"/></svg>,
    back: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="4" y2="8"/><polyline points="7,4 3,8 7,12"/></svg>,
};

const sections: NavSection[] = [
    { title: 'Administration', items: [
        { label: 'Dashboard', icon: I.dashboard, route: '/admin/dashboard' },
        { label: 'Admins', icon: I.admins, route: '/admin/admins' },
        { label: 'Users', icon: I.users, route: '/admin/users' },
        { label: 'Roles', icon: I.roles, route: '/admin/roles' },
    ]},
    { title: 'Analytics', items: [
        { label: 'Statistics', icon: I.stats, route: '/admin/statistics' },
        { label: 'Audit Log', icon: I.audit, route: '/admin/audit' },
    ]},
    { title: 'Configuration', items: [
        { label: 'Config', icon: I.config, route: '/admin/config' },
    ]},
    { title: 'Support', items: [
        { label: 'Support Tickets', icon: I.support, route: '/admin/support', badge: 3 },
        { label: 'Knowledge Base', icon: I.kb, route: '/admin/kb' },
    ]},
];

interface AdminSidebarProps { collapsed: boolean; onToggle: () => void; currentPath: string; mobileOpen: boolean; onMobileClose: () => void; }

export default function AdminSidebar({ collapsed, onToggle, currentPath, mobileOpen, onMobileClose }: AdminSidebarProps) {
    const { currentTheme: th } = useAppSettings();
    const sidebarWidth = collapsed ? 62 : 240;
    const nav = (route: string) => { router.visit(route); onMobileClose(); };

    const adminAccent = '#ef4444';
    const adminAccentDim = 'rgba(239, 68, 68, 0.12)';

    const sidebarContent = (width: number, showLabels: boolean, showClose?: boolean) => (
        <div style={{ width, height: '100vh', background: th.sidebarBg, borderRight: `1px solid ${th.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, color: th.text }}>
            {/* Header */}
            <div style={{ padding: showLabels ? '16px 16px' : '16px 8px', display: 'flex', alignItems: 'center', justifyContent: showLabels ? 'space-between' : 'center', borderBottom: `1px solid ${th.border}`, minHeight: 56 }}>
                {showLabels && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Logo size="sm" />
                        <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 3, background: adminAccentDim, color: adminAccent, letterSpacing: '0.1em', border: `1px solid ${adminAccent}25` }}>ADMIN</span>
                    </div>
                )}
                {showClose ? (
                    <button onClick={onMobileClose} style={{ background: 'none', border: `1px solid ${th.border}`, borderRadius: 6, color: th.textSecondary, cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>
                    </button>
                ) : (
                    <button onClick={onToggle} style={{ background: 'none', border: 'none', color: th.textSecondary, cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 4 }}>
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            {collapsed ? <><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></> : <><line x1="3" y1="4" x2="13" y2="4"/><line x1="3" y1="8" x2="10" y2="8"/><line x1="3" y1="12" x2="13" y2="12"/></>}
                        </svg>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
                {sections.map(section => (
                    <div key={section.title} style={{ marginBottom: 4 }}>
                        {showLabels && <div style={{ padding: '10px 16px 4px', fontSize: 10, fontWeight: 700, color: th.textDim, letterSpacing: '0.12em', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' }}>{section.title}</div>}
                        {!showLabels && <div style={{ height: 8 }} />}
                        {section.items.map(item => {
                            const active = currentPath === item.route || currentPath.startsWith(item.route + '/');
                            return (
                                <button key={item.route} onClick={() => nav(item.route)} title={!showLabels ? item.label : undefined} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                    padding: showLabels ? '7px 16px' : '8px 0', justifyContent: showLabels ? 'flex-start' : 'center',
                                    background: active ? adminAccentDim : 'transparent', border: 'none', borderRadius: 0, cursor: 'pointer',
                                    color: active ? adminAccent : th.textSecondary, fontSize: 13, fontFamily: 'var(--ax-font, inherit)', fontWeight: active ? 600 : 400,
                                    transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                                    borderLeft: active ? `2px solid ${adminAccent}` : '2px solid transparent',
                                }}
                                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = th.text; } }}
                                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = th.textSecondary; } }}
                                >
                                    <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                                    {showLabels && <span>{item.label}</span>}
                                    {showLabels && item.badge && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: adminAccentDim, color: adminAccent, border: `1px solid ${adminAccent}30` }}>{item.badge}</span>}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Footer */}
            {showLabels && (
                <div style={{ borderTop: `1px solid ${th.border}`, padding: '6px 0' }}>
                    <button onClick={() => router.visit('/map')} style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 16px',
                        background: 'transparent', border: 'none', cursor: 'pointer', color: th.textSecondary,
                        fontSize: 13, fontFamily: 'var(--ax-font, inherit)', fontWeight: 400,
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = th.text; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = th.textSecondary; }}
                    >
                        <span style={{ display: 'flex', flexShrink: 0 }}>{I.back}</span>
                        <span>Back to Platform</span>
                    </button>
                    <div style={{ padding: '6px 16px', fontSize: 10, color: th.textDim, letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>ARGUX ADMIN</div>
                </div>
            )}
        </div>
    );

    return (
        <>
            <style>{`
                .ax-admin-sidebar-desktop { display: flex; }
                .ax-admin-sidebar-mobile-overlay { display: none; }
                .ax-admin-sidebar-mobile { display: none; }
                @media (max-width: 768px) {
                    .ax-admin-sidebar-desktop { display: none !important; }
                    .ax-admin-sidebar-mobile-overlay { display: ${mobileOpen ? 'block' : 'none'} !important; }
                    .ax-admin-sidebar-mobile { display: ${mobileOpen ? 'flex' : 'none'} !important; }
                }
            `}</style>

            <div className="ax-admin-sidebar-desktop" style={{ transition: 'width 0.2s ease' }}>
                {sidebarContent(sidebarWidth, !collapsed)}
            </div>
            <div className="ax-admin-sidebar-mobile-overlay" onClick={onMobileClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />
            <div className="ax-admin-sidebar-mobile" style={{ position: 'fixed', top: 0, left: 0, width: 260, height: '100vh', zIndex: 50 }}>
                {sidebarContent(260, true, true)}
            </div>
        </>
    );
}
