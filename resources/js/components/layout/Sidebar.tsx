import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useAppSettings } from '../../layouts/AppLayout';
import Logo from '../auth/Logo';

interface NavItem { label: string; icon: React.ReactNode; route: string; }
interface NavSection { title: string; items: NavItem[]; }

const I = {
    map: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="1,3 6,1 10,3 15,1 15,13 10,15 6,13 1,15"/><line x1="6" y1="1" x2="6" y2="13"/><line x1="10" y1="3" x2="10" y2="15"/></svg>,
    eye: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>,
    target: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2.5"/><line x1="8" y1="2" x2="8" y2="0.5"/><line x1="8" y1="15.5" x2="8" y2="14"/><line x1="2" y1="8" x2="0.5" y2="8"/><line x1="15.5" y1="8" x2="14" y2="8"/></svg>,
    users: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="5" r="2.5"/><path d="M1 14c0-3 2.2-4.5 5-4.5s5 1.5 5 4.5"/><circle cx="11.5" cy="5.5" r="2"/><path d="M12 9.5c1.8.3 3 1.5 3 3.5"/></svg>,
    building: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="12" height="13" rx="1"/><line x1="6" y1="5" x2="6" y2="5.01"/><line x1="10" y1="5" x2="10" y2="5.01"/><line x1="6" y1="8" x2="6" y2="8.01"/><line x1="10" y1="8" x2="10" y2="8.01"/><rect x="6" y="11" width="4" height="4"/></svg>,
    car: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 10.5h11v2.5a1 1 0 01-1 1h-9a1 1 0 01-1-1v-2.5z"/><path d="M3.5 10.5L5 6h6l1.5 4.5"/><circle cx="4.5" cy="12" r="0.5" fill="currentColor"/><circle cx="11.5" cy="12" r="0.5" fill="currentColor"/></svg>,
    cpu: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="8" height="8" rx="1"/><rect x="6" y="6" width="4" height="4" rx="0.5"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="6" y1="12" x2="6" y2="14"/><line x1="10" y1="12" x2="10" y2="14"/><line x1="2" y1="6" x2="4" y2="6"/><line x1="2" y1="10" x2="4" y2="10"/><line x1="12" y1="6" x2="14" y2="6"/><line x1="12" y1="10" x2="14" y2="10"/></svg>,
    plate: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="14" height="8" rx="2"/><line x1="4" y1="7.5" x2="12" y2="7.5"/><circle cx="3.5" cy="9.5" r="0.5" fill="currentColor"/><circle cx="12.5" cy="9.5" r="0.5" fill="currentColor"/></svg>,
    face: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><circle cx="6" cy="7" r="0.5" fill="currentColor"/><circle cx="10" cy="7" r="0.5" fill="currentColor"/><path d="M6 10.5c.5 1 1.5 1.5 2 1.5s1.5-.5 2-1.5"/></svg>,
    share: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="4" cy="8" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><line x1="5.8" y1="7" x2="10.2" y2="5"/><line x1="5.8" y1="9" x2="10.2" y2="11"/></svg>,
    globe: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M2 8h12"/><path d="M8 2c2 2.5 2 9.5 0 12M8 2c-2 2.5-2 9.5 0 12"/></svg>,
    phone: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="1" width="8" height="14" rx="2"/><line x1="7" y1="12" x2="9" y2="12"/></svg>,
    graph: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="3" cy="8" r="1.5"/><circle cx="13" cy="4" r="1.5"/><circle cx="13" cy="12" r="1.5"/><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="13" r="1.5"/><line x1="4.3" y1="7.3" x2="6.7" y2="3.7"/><line x1="9.3" y1="3.3" x2="11.7" y2="4"/><line x1="4.3" y1="8.7" x2="6.7" y2="12.3"/><line x1="9.3" y1="12.7" x2="11.7" y2="12"/></svg>,
    workflow: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="5" height="4" rx="1"/><rect x="10" y="6" width="5" height="4" rx="1"/><rect x="1" y="11" width="5" height="4" rx="1"/><path d="M6 3h3v5h1M6 13h3V8h1"/></svg>,
    database: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><ellipse cx="8" cy="4" rx="5.5" ry="2.5"/><path d="M2.5 4v8c0 1.38 2.46 2.5 5.5 2.5s5.5-1.12 5.5-2.5V4"/><path d="M2.5 8c0 1.38 2.46 2.5 5.5 2.5s5.5-1.12 5.5-2.5"/></svg>,
    bell: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6a4 4 0 018 0c0 4 2 5 2 5H2s2-1 2-5"/><path d="M6.5 13a1.5 1.5 0 003 0"/></svg>,
    alertTriangle: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.13 2.5a1 1 0 011.74 0l5.5 9.5A1 1 0 0113.5 13.5h-11a1 1 0 01-.87-1.5z"/><line x1="8" y1="6" x2="8" y2="8.5"/><circle cx="8" cy="10.5" r="0.5" fill="currentColor"/></svg>,
    activity: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,8 4,8 6,3 8,13 10,6 12,8 15,8"/></svg>,
    shield: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5l5.5 2v4c0 3.5-2.5 6-5.5 7.5-3-1.5-5.5-4-5.5-7.5v-4z"/></svg>,
    chat: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 10a1 1 0 01-1 1H5l-3 3V3a1 1 0 011-1h10a1 1 0 011 1v7z"/></svg>,
    fileText: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4z"/><polyline points="10,1 10,4 13,4"/><line x1="5.5" y1="7" x2="10.5" y2="7"/><line x1="5.5" y1="9.5" x2="10.5" y2="9.5"/></svg>,
    folder: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v9a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1H8L6.5 3H3a1 1 0 00-1 1z"/></svg>,
    report: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="12" height="12" rx="1"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="9" y2="8"/><line x1="5" y1="11" x2="7" y2="11"/></svg>,
    server: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="1.5" width="12" height="4" rx="1"/><rect x="2" y="7.5" width="12" height="4" rx="1"/><circle cx="4.5" cy="3.5" r="0.5" fill="currentColor"/><circle cx="4.5" cy="9.5" r="0.5" fill="currentColor"/><line x1="8" y1="13.5" x2="8" y2="14.5"/><line x1="5" y1="14.5" x2="11" y2="14.5"/></svg>,
    drone: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="3" cy="4" r="2"/><circle cx="13" cy="4" r="2"/><circle cx="3" cy="12" r="2"/><circle cx="13" cy="12" r="2"/><line x1="4.5" y1="5.5" x2="7" y2="7"/><line x1="11.5" y1="5.5" x2="9" y2="7"/><line x1="4.5" y1="10.5" x2="7" y2="9"/><line x1="11.5" y1="10.5" x2="9" y2="9"/><rect x="6.5" y="6.5" width="3" height="3" rx="1"/></svg>,
};

const sections: NavSection[] = [
    { title: 'Command', items: [{ label: 'Tactical Map', icon: I.map, route: '/map' }, { label: 'Vision', icon: I.eye, route: '/vision' }, { label: 'Operations', icon: I.target, route: '/operations' }] },
    { title: 'Subjects', items: [{ label: 'Persons', icon: I.users, route: '/persons' }, { label: 'Organizations', icon: I.building, route: '/organizations' }, { label: 'Vehicles', icon: I.car, route: '/vehicles' }, { label: 'Devices', icon: I.cpu, route: '/devices' }, { label: 'UAV Fleet', icon: I.drone, route: '/uav' }] },
    { title: 'Intelligence', items: [{ label: 'Plate Recognition', icon: I.plate, route: '/plate-recognition' }, { label: 'Face Recognition', icon: I.face, route: '/face-recognition' }, { label: 'Social Scraper', icon: I.share, route: '/scraper' }, { label: 'Web Scraper', icon: I.globe, route: '/web-scraper' }, { label: 'Surveillance Apps', icon: I.phone, route: '/surveillance-apps' }] },
    { title: 'Analysis', items: [{ label: 'Connections', icon: I.graph, route: '/connections' }, { label: 'Workflows', icon: I.workflow, route: '/workflows' }, { label: 'Data Sources', icon: I.database, route: '/data-sources' }] },
    { title: 'Monitoring', items: [{ label: 'Alert Rules', icon: I.alertTriangle, route: '/alerts' }, { label: 'Activity Log', icon: I.activity, route: '/activity' }, { label: 'Notifications', icon: I.bell, route: '/notifications' }, { label: 'Risks', icon: I.shield, route: '/risks' }] },
    { title: 'Tools', items: [{ label: 'AI Assistant', icon: I.chat, route: '/chat' }, { label: 'Records', icon: I.fileText, route: '/records' }, { label: 'Storage', icon: I.folder, route: '/storage' }, { label: 'Reports', icon: I.report, route: '/reports' }] },
    { title: 'System', items: [{ label: 'Jobs', icon: I.server, route: '/jobs' }] },
];

interface SidebarProps { collapsed: boolean; onToggle: () => void; currentPath: string; mobileOpen: boolean; onMobileClose: () => void; }

export default function Sidebar({ collapsed, onToggle, currentPath, mobileOpen, onMobileClose }: SidebarProps) {
    const { currentTheme: th } = useAppSettings();
    const sidebarWidth = collapsed ? 62 : 240;
    const nav = (route: string) => { router.visit(route); onMobileClose(); };

    // Fixed-position tooltip (escapes overflow:hidden)
    const [tip, setTip] = useState<{ label: string; top: number; left: number } | null>(null);
    const showTip = useCallback((e: React.MouseEvent, label: string) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTip({ label, top: rect.top + rect.height / 2, left: rect.right + 10 });
    }, []);
    const hideTip = useCallback(() => setTip(null), []);

    const sidebarContent = (width: number, showLabels: boolean, showClose?: boolean) => (
        <div style={{ width, height: '100vh', background: th.sidebarBg, borderRight: `1px solid ${th.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, color: th.text }}>
            <div style={{ padding: showLabels ? '16px 16px' : '16px 8px', display: 'flex', alignItems: 'center', justifyContent: showLabels ? 'space-between' : 'center', borderBottom: `1px solid ${th.border}`, minHeight: 56 }}>
                {showLabels && <Logo size="sm" />}
                {/* Desktop: collapse toggle. Mobile: close X button */}
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
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
                {sections.map(section => (
                    <div key={section.title} style={{ marginBottom: 4 }}>
                        {showLabels && <div style={{ padding: '10px 16px 4px', fontSize: 10, fontWeight: 700, color: th.textDim, letterSpacing: '0.12em', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' }}>{section.title}</div>}
                        {!showLabels && <div style={{ height: 8 }} />}
                        {section.items.map(item => {
                            const active = currentPath === item.route || currentPath.startsWith(item.route + '/');
                            return (
                                <button key={item.route} onClick={() => nav(item.route)} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                    padding: showLabels ? '7px 16px' : '8px 0', justifyContent: showLabels ? 'flex-start' : 'center',
                                    background: active ? th.accentDim : 'transparent', border: 'none', borderRadius: 0, cursor: 'pointer',
                                    color: active ? th.accent : th.textSecondary, fontSize: 13, fontFamily: 'var(--ax-font, inherit)', fontWeight: active ? 600 : 400,
                                    transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                                    borderLeft: active ? `2px solid ${th.accent}` : '2px solid transparent',
                                }}
                                    onMouseEnter={e => {
                                        if (!showLabels) showTip(e, item.label);
                                        if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = th.text; }
                                    }}
                                    onMouseLeave={e => {
                                        hideTip();
                                        if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = th.textSecondary; }
                                    }}
                                >
                                    <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                                    {showLabels && <span>{item.label}</span>}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
            {showLabels && <div style={{ padding: '10px 16px', borderTop: `1px solid ${th.border}`, fontSize: 10, color: th.textDim, letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>ARGUX v0.8.1</div>}
        </div>
    );

    return (
        <>
            {/* Responsive CSS */}
            <style>{`
                .ax-sidebar-desktop { display: flex; flex-shrink: 0; }
                .ax-sidebar-mobile-overlay { display: none; }
                .ax-sidebar-mobile { display: none; }
                @media(max-width:768px) {
                    .ax-sidebar-desktop { display: none !important; }
                    .ax-sidebar-mobile-overlay { display: ${mobileOpen ? 'block' : 'none'} !important; }
                    .ax-sidebar-mobile { display: ${mobileOpen ? 'flex' : 'none'} !important; }
                }
            `}</style>

            {/* Desktop sidebar — always visible, supports collapse */}
            <div className="ax-sidebar-desktop" style={{ transition: 'width 0.2s ease' }}>
                {sidebarContent(sidebarWidth, !collapsed)}
            </div>

            {/* Mobile overlay backdrop */}
            <div className="ax-sidebar-mobile-overlay" onClick={onMobileClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />

            {/* Mobile sidebar — slides in from left, always expanded, with close button */}
            <div className="ax-sidebar-mobile" style={{ position: 'fixed', top: 0, left: 0, width: 260, height: '100vh', zIndex: 50 }}>
                {sidebarContent(260, true, true)}
            </div>

            {/* Fixed tooltip — rendered at document root level, escapes overflow:hidden */}
            {tip && <div style={{
                position: 'fixed', top: tip.top, left: tip.left, transform: 'translateY(-50%)',
                padding: '5px 10px', borderRadius: 5,
                background: th.bgCard || '#1a1f2e', border: `1px solid ${th.border}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 9999,
                fontSize: 11, fontWeight: 600, color: th.text, fontFamily: 'var(--ax-font, inherit)',
            }}>
                <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: `5px solid ${th.border}` }} />
                <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: -1, width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderRight: `4px solid ${th.bgCard || '#1a1f2e'}` }} />
                {tip.label}
            </div>}
        </>
    );
}
