import { useState, ReactNode, createContext, useContext } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '../components/layout/Sidebar';
import AppHeader from '../components/layout/AppHeader';
import { ToastProvider } from '../components/ui/Toast';
import { theme } from '../lib/theme';
import type { SharedProps } from '../types/shared';

/* ─── Theme system ─── */
export interface AppTheme {
    id: string;
    name: string;
    bg: string;
    bgCard: string;
    bgInput: string;
    border: string;
    accent: string;
    accentDim: string;
    text: string;
    textSecondary: string;
    sidebarBg: string;
}

export const themes: AppTheme[] = [
    { id: 'tactical-dark', name: 'Tactical Dark', bg: '#080a0f', bgCard: 'rgba(10,14,22,0.88)', bgInput: '#111827', border: '#1e2736', accent: '#1d6fef', accentDim: 'rgba(29,111,239,0.14)', text: '#e2e8f0', textSecondary: '#94a3b8', sidebarBg: '#0a0e16' },
    { id: 'midnight-ops', name: 'Midnight Ops', bg: '#0c0c14', bgCard: 'rgba(14,14,24,0.9)', bgInput: '#14142a', border: '#252540', accent: '#7c5cfc', accentDim: 'rgba(124,92,252,0.14)', text: '#e0dff0', textSecondary: '#8e8da8', sidebarBg: '#0e0e18' },
    { id: 'arctic-white', name: 'Arctic White', bg: '#f0f2f5', bgCard: 'rgba(255,255,255,0.95)', bgInput: '#ffffff', border: '#d4d8e0', accent: '#1d6fef', accentDim: 'rgba(29,111,239,0.1)', text: '#1a1d23', textSecondary: '#5f6577', sidebarBg: '#ffffff' },
    { id: 'desert-storm', name: 'Desert Storm', bg: '#161210', bgCard: 'rgba(22,18,16,0.9)', bgInput: '#1f1a16', border: '#3a3028', accent: '#c89440', accentDim: 'rgba(200,148,64,0.14)', text: '#e8dfd4', textSecondary: '#9e9488', sidebarBg: '#120f0c' },
    { id: 'crimson-ops', name: 'Crimson Ops', bg: '#0e0a0a', bgCard: 'rgba(18,12,12,0.9)', bgInput: '#1a1212', border: '#3a2020', accent: '#dc2626', accentDim: 'rgba(220,38,38,0.14)', text: '#f0e0e0', textSecondary: '#a08888', sidebarBg: '#100c0c' },
];

interface AppSettingsContextValue {
    currentTheme: AppTheme;
    setThemeId: (id: string) => void;
    dir: 'ltr' | 'rtl';
    setDir: (d: 'ltr' | 'rtl') => void;
}

export const AppSettingsContext = createContext<AppSettingsContextValue>({
    currentTheme: themes[0],
    setThemeId: () => {},
    dir: 'ltr',
    setDir: () => {},
});

export function useAppSettings() {
    return useContext(AppSettingsContext);
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const { app } = usePage<SharedProps>().props;
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [themeId, setThemeId] = useState('tactical-dark');
    const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

    const currentTheme = themes.find(t => t.id === themeId) || themes[0];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    return (
        <AppSettingsContext.Provider value={{ currentTheme, setThemeId, dir, setDir }}>
        <ToastProvider>
        <div dir={dir} style={{
            display: 'flex', height: '100vh', overflow: 'hidden',
            fontFamily: "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: currentTheme.bg, color: currentTheme.text,
            WebkitFontSmoothing: 'antialiased',
            direction: dir,
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
                @keyframes argux-spin { to { transform: rotate(360deg); } }
                @keyframes argux-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                @keyframes argux-fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                * { box-sizing: border-box; }
                html, body { margin: 0; padding: 0; height: 100%; background: ${currentTheme.bg}; }
                body { overflow: hidden; }
                ::selection { background: ${currentTheme.accentDim}; color: ${currentTheme.text}; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: ${currentTheme.border}; border-radius: 3px; }
                input::placeholder { color: #475569 !important; }
            `}</style>

            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
                currentPath={currentPath}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                <AppHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} />
                <main style={{
                    flex: 1, overflowY: 'auto', overflowX: 'hidden',
                    padding: 24, background: currentTheme.bg,
                    WebkitOverflowScrolling: 'touch' as const,
                    paddingBottom: 80,
                    minHeight: 0,
                }}>
                    {children}
                </main>
            </div>
        </div>
        </ToastProvider>
        </AppSettingsContext.Provider>
    );
}
