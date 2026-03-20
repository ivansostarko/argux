import { useState, ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '../components/layout/Sidebar';
import AppHeader from '../components/layout/AppHeader';
import { theme } from '../lib/theme';
import type { SharedProps } from '../types/shared';

export default function AppLayout({ children }: { children: ReactNode }) {
    const { app } = usePage<SharedProps>().props;
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Get current path from window for active state
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    return (
        <div style={{
            display: 'flex', height: '100vh', overflow: 'hidden',
            fontFamily: "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: theme.bg, color: theme.text,
            WebkitFontSmoothing: 'antialiased',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
                @keyframes argux-spin { to { transform: rotate(360deg); } }
                @keyframes argux-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                @keyframes argux-fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                * { box-sizing: border-box; }
                body { margin: 0; background: ${theme.bg}; overflow: hidden; }
                ::selection { background: ${theme.accentDim}; color: ${theme.text}; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 3px; }
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
                    flex: 1, overflow: 'auto', padding: 24,
                    background: theme.bg,
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
