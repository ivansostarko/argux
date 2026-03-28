import { useState, ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import AdminSidebar from '../components/layout/AdminSidebar';
import AppHeader from '../components/layout/AppHeader';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import { usePermissions } from '../hooks/usePermissions';
import PermissionPrompt from '../components/layout/PermissionPrompt';
import { ToastProvider } from '../components/ui/Toast';
import { TopLoaderProvider } from '../components/ui/TopLoader';
import { AppSettingsContext, themes, fonts } from './AppLayout';
import type { SharedProps } from '../types/shared';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { app } = usePage<SharedProps>().props;
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [themeId, setThemeId] = useState('tactical-dark');
    const [fontId, setFontId] = useState('geist');
    const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

    const t = themes.find(x => x.id === themeId) || themes[0];
    const f = fonts.find(x => x.id === fontId) || fonts[0];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/admin/dashboard';

    const { permissions, showPrompt, requesting, requestAll, dismissPrompt } = usePermissions();

    return (
        <AppSettingsContext.Provider value={{ currentTheme: t, setThemeId, currentFont: f, setFontId, dir, setDir }}>
        <ToastProvider>
        <TopLoaderProvider accentColor="#ef4444">
        <div dir={dir} className="ax-app-shell" style={{ fontFamily: f.family, background: t.bg, color: t.text }}>
            <style>{`
                :root {
                    --ax-bg: ${t.bg}; --ax-bg-card: ${t.bgCard}; --ax-bg-input: ${t.bgInput};
                    --ax-bg-input-focus: ${t.bgInput === '#0f1520' ? '#151d2e' : t.bgInput};
                    --ax-border: ${t.border}; --ax-accent: #ef4444; --ax-accent-dim: rgba(239,68,68,0.12);
                    --ax-accent-glow: rgba(239,68,68,0.3); --ax-text: ${t.text}; --ax-text-sec: ${t.textSecondary};
                    --ax-text-dim: ${t.textDim}; --ax-sidebar-bg: ${t.sidebarBg}; --ax-header-bg: ${t.headerBg};
                    --ax-danger: ${t.danger}; --ax-danger-dim: ${t.dangerDim};
                    --ax-success: ${t.success}; --ax-success-dim: ${t.successDim};
                    --ax-warning: ${t.warning}; --ax-warning-dim: ${t.warningDim}; --ax-cyan: ${t.cyan};
                    --ax-font: ${f.family};
                }
                body { background: var(--ax-bg); }
                select option { background: var(--ax-bg-input); color: var(--ax-text); }
            `}</style>

            <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} currentPath={currentPath} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

            <div className="ax-app-main">
                <AppHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} hideClock hideNotifications isAdmin />
                <main className="ax-app-content" style={{ background: t.bg }}>
                    <Breadcrumbs />
                    {children}
                </main>
            </div>

            {showPrompt && <PermissionPrompt permissions={permissions} requesting={requesting} onAccept={requestAll} onDismiss={dismissPrompt} />}
        </div>
        </TopLoaderProvider>
        </ToastProvider>
        </AppSettingsContext.Provider>
    );
}
