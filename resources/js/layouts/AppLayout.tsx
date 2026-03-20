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
    // ─── Dark themes ───
    { id: 'tactical-dark', name: 'Tactical Dark', bg: '#060810', bgCard: 'rgba(8,12,20,0.92)', bgInput: '#0f1520', border: '#1a2235', accent: '#3b82f6', accentDim: 'rgba(59,130,246,0.12)', accentGlow: 'rgba(59,130,246,0.3)', text: '#e8ecf4', textSecondary: '#8896ab', textDim: '#4a5568', sidebarBg: '#070a12', headerBg: '#070a12', danger: '#f43f5e', dangerDim: 'rgba(244,63,94,0.12)', success: '#10b981', successDim: 'rgba(16,185,129,0.12)', warning: '#f59e0b', warningDim: 'rgba(245,158,11,0.10)', cyan: '#06b6d4' },
    { id: 'midnight-ops', name: 'Midnight Ops', bg: '#09090f', bgCard: 'rgba(12,12,22,0.92)', bgInput: '#121220', border: '#22223a', accent: '#8b5cf6', accentDim: 'rgba(139,92,246,0.12)', accentGlow: 'rgba(139,92,246,0.3)', text: '#ededf8', textSecondary: '#9494b8', textDim: '#52526e', sidebarBg: '#0a0a14', headerBg: '#0a0a14', danger: '#f43f5e', dangerDim: 'rgba(244,63,94,0.12)', success: '#10b981', successDim: 'rgba(16,185,129,0.12)', warning: '#f59e0b', warningDim: 'rgba(245,158,11,0.10)', cyan: '#06b6d4' },
    { id: 'stealth-green', name: 'Stealth Green', bg: '#060d08', bgCard: 'rgba(8,16,10,0.92)', bgInput: '#0c1a10', border: '#1a3020', accent: '#22c55e', accentDim: 'rgba(34,197,94,0.12)', accentGlow: 'rgba(34,197,94,0.25)', text: '#ddf0e4', textSecondary: '#7da88a', textDim: '#3d5c45', sidebarBg: '#050c07', headerBg: '#050c07', danger: '#f43f5e', dangerDim: 'rgba(244,63,94,0.12)', success: '#22c55e', successDim: 'rgba(34,197,94,0.12)', warning: '#f59e0b', warningDim: 'rgba(245,158,11,0.10)', cyan: '#06b6d4' },
    { id: 'crimson-ops', name: 'Crimson Ops', bg: '#0c0808', bgCard: 'rgba(16,10,10,0.92)', bgInput: '#1a1010', border: '#351a1a', accent: '#ef4444', accentDim: 'rgba(239,68,68,0.12)', accentGlow: 'rgba(239,68,68,0.25)', text: '#f5e0e0', textSecondary: '#b08080', textDim: '#6a4545', sidebarBg: '#0a0606', headerBg: '#0a0606', danger: '#f43f5e', dangerDim: 'rgba(244,63,94,0.12)', success: '#10b981', successDim: 'rgba(16,185,129,0.12)', warning: '#f59e0b', warningDim: 'rgba(245,158,11,0.10)', cyan: '#06b6d4' },
    { id: 'desert-storm', name: 'Desert Storm', bg: '#100d08', bgCard: 'rgba(18,15,10,0.92)', bgInput: '#1c1810', border: '#352e20', accent: '#d97706', accentDim: 'rgba(217,119,6,0.12)', accentGlow: 'rgba(217,119,6,0.3)', text: '#f0e8d8', textSecondary: '#a89878', textDim: '#6a5e45', sidebarBg: '#0d0a06', headerBg: '#0d0a06', danger: '#f43f5e', dangerDim: 'rgba(244,63,94,0.12)', success: '#10b981', successDim: 'rgba(16,185,129,0.12)', warning: '#f59e0b', warningDim: 'rgba(245,158,11,0.10)', cyan: '#06b6d4' },
    { id: 'ocean-depth', name: 'Ocean Depth', bg: '#060a10', bgCard: 'rgba(8,14,24,0.92)', bgInput: '#0c1420', border: '#18283a', accent: '#0ea5e9', accentDim: 'rgba(14,165,233,0.12)', accentGlow: 'rgba(14,165,233,0.3)', text: '#e0ecf8', textSecondary: '#78a0c0', textDim: '#3a5a78', sidebarBg: '#050810', headerBg: '#050810', danger: '#f43f5e', dangerDim: 'rgba(244,63,94,0.12)', success: '#10b981', successDim: 'rgba(16,185,129,0.12)', warning: '#f59e0b', warningDim: 'rgba(245,158,11,0.10)', cyan: '#06b6d4' },
    { id: 'phantom-gray', name: 'Phantom Gray', bg: '#101012', bgCard: 'rgba(18,18,22,0.92)', bgInput: '#1a1a20', border: '#2a2a32', accent: '#a3a3b0', accentDim: 'rgba(163,163,176,0.10)', accentGlow: 'rgba(163,163,176,0.2)', text: '#e8e8f0', textSecondary: '#8888a0', textDim: '#505060', sidebarBg: '#0c0c10', headerBg: '#0c0c10', danger: '#f43f5e', dangerDim: 'rgba(244,63,94,0.12)', success: '#10b981', successDim: 'rgba(16,185,129,0.12)', warning: '#f59e0b', warningDim: 'rgba(245,158,11,0.10)', cyan: '#06b6d4' },
    // ─── Light themes ───
    { id: 'arctic-white', name: 'Arctic White', bg: '#f4f6f9', bgCard: 'rgba(255,255,255,0.97)', bgInput: '#ffffff', border: '#dde1e8', accent: '#2563eb', accentDim: 'rgba(37,99,235,0.08)', accentGlow: 'rgba(37,99,235,0.18)', text: '#111827', textSecondary: '#4b5563', textDim: '#9ca3af', sidebarBg: '#f9fafb', headerBg: '#ffffff', danger: '#dc2626', dangerDim: 'rgba(220,38,38,0.06)', success: '#059669', successDim: 'rgba(5,150,105,0.06)', warning: '#d97706', warningDim: 'rgba(217,119,6,0.06)', cyan: '#0891b2' },
    { id: 'sand-light', name: 'Sand Light', bg: '#f5f2ed', bgCard: 'rgba(255,252,248,0.97)', bgInput: '#fffcf8', border: '#e0d8cc', accent: '#b45309', accentDim: 'rgba(180,83,9,0.08)', accentGlow: 'rgba(180,83,9,0.18)', text: '#1c1408', textSecondary: '#665840', textDim: '#a89878', sidebarBg: '#faf7f2', headerBg: '#fefcf9', danger: '#dc2626', dangerDim: 'rgba(220,38,38,0.06)', success: '#059669', successDim: 'rgba(5,150,105,0.06)', warning: '#d97706', warningDim: 'rgba(217,119,6,0.06)', cyan: '#0891b2' },
    { id: 'silver-steel', name: 'Silver Steel', bg: '#eef0f4', bgCard: 'rgba(252,253,255,0.97)', bgInput: '#f8f9fc', border: '#d0d5de', accent: '#4f46e5', accentDim: 'rgba(79,70,229,0.07)', accentGlow: 'rgba(79,70,229,0.18)', text: '#0f172a', textSecondary: '#475569', textDim: '#94a3b8', sidebarBg: '#f1f3f8', headerBg: '#f8f9fc', danger: '#dc2626', dangerDim: 'rgba(220,38,38,0.06)', success: '#059669', successDim: 'rgba(5,150,105,0.06)', warning: '#d97706', warningDim: 'rgba(217,119,6,0.06)', cyan: '#0891b2' },
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
