import { ReactNode } from 'react';
import ParticleBackground from '../components/auth/ParticleBackground';
import { theme } from '../lib/theme';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', fontFamily: "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: theme.text, padding: '30px 16px', position: 'relative',
            WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale',
            background: theme.bg,
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
                @keyframes argux-spin { to { transform: rotate(360deg); } }
                @keyframes argux-fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes argux-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
                @keyframes argux-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                * { box-sizing: border-box; }
                body { margin: 0; background: ${theme.bg}; overflow-x: hidden; }
                ::selection { background: ${theme.accentDim}; color: ${theme.text}; }
                input::placeholder { color: ${theme.textDim} !important; }
                select option { background: ${theme.bgInput}; color: ${theme.text}; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 3px; }
            `}</style>

            <ParticleBackground />

            <div style={{
                animation: 'argux-fadeIn 0.4s ease-out',
                position: 'relative', zIndex: 1, width: '100%',
                display: 'flex', justifyContent: 'center',
            }}>
                {children}
            </div>
        </div>
    );
}
