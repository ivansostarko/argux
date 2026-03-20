import { useState, ReactNode, createContext, useContext, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '../components/layout/Sidebar';
import AppHeader from '../components/layout/AppHeader';
import { ToastProvider } from '../components/ui/Toast';
import type { SharedProps } from '../types/shared';

/* ─── Theme definitions ─── */
export interface AppTheme {
    id: string; name: string;
    bg: string; bgCard: string; bgInput: string; border: string;
    accent: string; accentDim: string; accentGlow: string;
    text: string; textSecondary: string; textDim: string;
    sidebarBg: string; headerBg: string;
    danger: string; dangerDim: string; success: string; successDim: string;
    warning: string; warningDim: string; cyan: string;
}

export const themes: AppTheme[] = [
    { id: 'tactical-dark', name: 'Tactical Dark', bg: '#080a0f', bgCard: 'rgba(10,14,22,0.88)', bgInput: '#111827', border: '#1e2736', accent: '#1d6fef', accentDim: 'rgba(29,111,239,0.14)', accentGlow: 'rgba(29,111,239,0.35)', text: '#e2e8f0', textSecondary: '#94a3b8', textDim: '#475569', sidebarBg: '#0a0e16', headerBg: '#0a0e16', danger: '#ef4444', dangerDim: 'rgba(239,68,68,0.12)', success: '#22c55e', successDim: 'rgba(34,197,94,0.12)', warning: '#eab308', warningDim: 'rgba(234,179,8,0.10)', cyan: '#22d3ee' },
    { id: 'midnight-ops', name: 'Midnight Ops', bg: '#0c0c14', bgCard: 'rgba(14,14,24,0.9)', bgInput: '#14142a', border: '#252540', accent: '#7c5cfc', accentDim: 'rgba(124,92,252,0.14)', accentGlow: 'rgba(124,92,252,0.35)', text: '#e0dff0', textSecondary: '#8e8da8', textDim: '#555468', sidebarBg: '#0e0e18', headerBg: '#0e0e18', danger: '#ef4444', dangerDim: 'rgba(239,68,68,0.12)', success: '#22c55e', successDim: 'rgba(34,197,94,0.12)', warning: '#eab308', warningDim: 'rgba(234,179,8,0.10)', cyan: '#22d3ee' },
    { id: 'arctic-white', name: 'Arctic White', bg: '#f0f2f5', bgCard: 'rgba(255,255,255,0.95)', bgInput: '#ffffff', border: '#d4d8e0', accent: '#1d6fef', accentDim: 'rgba(29,111,239,0.08)', accentGlow: 'rgba(29,111,239,0.2)', text: '#1a1d23', textSecondary: '#5f6577', textDim: '#9ca3af', sidebarBg: '#ffffff', headerBg: '#ffffff', danger: '#dc2626', dangerDim: 'rgba(220,38,38,0.08)', success: '#16a34a', successDim: 'rgba(22,163,74,0.08)', warning: '#ca8a04', warningDim: 'rgba(202,138,4,0.08)', cyan: '#0891b2' },
    { id: 'desert-storm', name: 'Desert Storm', bg: '#161210', bgCard: 'rgba(22,18,16,0.9)', bgInput: '#1f1a16', border: '#3a3028', accent: '#c89440', accentDim: 'rgba(200,148,64,0.14)', accentGlow: 'rgba(200,148,64,0.35)', text: '#e8dfd4', textSecondary: '#9e9488', textDim: '#6a6258', sidebarBg: '#120f0c', headerBg: '#120f0c', danger: '#ef4444', dangerDim: 'rgba(239,68,68,0.12)', success: '#22c55e', successDim: 'rgba(34,197,94,0.12)', warning: '#eab308', warningDim: 'rgba(234,179,8,0.10)', cyan: '#22d3ee' },
    { id: 'crimson-ops', name: 'Crimson Ops', bg: '#0e0a0a', bgCard: 'rgba(18,12,12,0.9)', bgInput: '#1a1212', border: '#3a2020', accent: '#dc2626', accentDim: 'rgba(220,38,38,0.14)', accentGlow: 'rgba(220,38,38,0.35)', text: '#f0e0e0', textSecondary: '#a08888', textDim: '#6a5050', sidebarBg: '#100c0c', headerBg: '#100c0c', danger: '#ef4444', dangerDim: 'rgba(239,68,68,0.12)', success: '#22c55e', successDim: 'rgba(34,197,94,0.12)', warning: '#eab308', warningDim: 'rgba(234,179,8,0.10)', cyan: '#22d3ee' },
];

export const fonts = [
    { id: 'geist', name: 'Geist', family: "'Geist', sans-serif" },
    { id: 'ibm-plex', name: 'IBM Plex Sans', family: "'IBM Plex Sans', sans-serif" },
    { id: 'dm-sans', name: 'DM Sans', family: "'DM Sans', sans-serif" },
    { id: 'space-grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
    { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif" },
    { id: 'sora', name: 'Sora', family: "'Sora', sans-serif" },
    { id: 'source-code', name: 'Source Code Pro', family: "'Source Code Pro', monospace" },
];

interface AppSettingsContextValue {
    currentTheme: AppTheme;
    setThemeId: (id: string) => void;
    currentFont: typeof fonts[0];
    setFontId: (id: string) => void;
    dir: 'ltr' | 'rtl';
    setDir: (d: 'ltr' | 'rtl') => void;
}

export const AppSettingsContext = createContext<AppSettingsContextValue>({
    currentTheme: themes[0],
    setThemeId: () => {},
    currentFont: fonts[0],
    setFontId: () => {},
    dir: 'ltr',
    setDir: () => {},
});

export function useAppSettings() { return useContext(AppSettingsContext); }

export default function AppLayout({ children }: { children: ReactNode }) {
    const { app } = usePage<SharedProps>().props;
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [themeId, setThemeId] = useState('tactical-dark');
    const [fontId, setFontId] = useState('geist');
    const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

    const t = themes.find(x => x.id === themeId) || themes[0];
    const f = fonts.find(x => x.id === fontId) || fonts[0];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    // PWA badge support
    useEffect(() => {
        const handler = () => {
            if ('setAppBadge' in navigator) (navigator as any).setAppBadge(3).catch(() => {});
        };
        document.addEventListener('argux-badge-update', handler);
        return () => document.removeEventListener('argux-badge-update', handler);
    }, []);

    return (
        <AppSettingsContext.Provider value={{ currentTheme: t, setThemeId, currentFont: f, setFontId, dir, setDir }}>
        <ToastProvider>
        <div dir={dir} style={{
            display: 'flex', height: '100vh', overflow: 'hidden',
            fontFamily: f.family, background: t.bg, color: t.text,
            WebkitFontSmoothing: 'antialiased', direction: dir,
        }}>
            <style>{`
                :root {
                    --ax-bg: ${t.bg}; --ax-bg-card: ${t.bgCard}; --ax-bg-input: ${t.bgInput};
                    --ax-border: ${t.border}; --ax-accent: ${t.accent}; --ax-accent-dim: ${t.accentDim};
                    --ax-accent-glow: ${t.accentGlow}; --ax-text: ${t.text}; --ax-text-sec: ${t.textSecondary};
                    --ax-text-dim: ${t.textDim}; --ax-sidebar-bg: ${t.sidebarBg}; --ax-header-bg: ${t.headerBg};
                    --ax-danger: ${t.danger}; --ax-danger-dim: ${t.dangerDim};
                    --ax-success: ${t.success}; --ax-success-dim: ${t.successDim};
                    --ax-warning: ${t.warning}; --ax-warning-dim: ${t.warningDim}; --ax-cyan: ${t.cyan};
                    --ax-font: ${f.family};
                }
                @keyframes argux-spin { to { transform: rotate(360deg); } }
                @keyframes argux-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                @keyframes argux-fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                * { box-sizing: border-box; }
                html, body { margin: 0; padding: 0; height: 100%; background: var(--ax-bg); }
                body { overflow: hidden; }
                ::selection { background: var(--ax-accent-dim); color: var(--ax-text); }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: var(--ax-border); border-radius: 3px; }
                input::placeholder { color: var(--ax-text-dim) !important; }
            `}</style>

            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} currentPath={currentPath} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                <AppHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} />
                <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 24, background: t.bg, WebkitOverflowScrolling: 'touch' as const, paddingBottom: 80, minHeight: 0 }}>
                    {children}
                </main>
            </div>
        </div>
        </ToastProvider>
        </AppSettingsContext.Provider>
    );
}
