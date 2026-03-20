import { theme } from '../../lib/theme';

export default function Logo({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
    const s = size === 'lg' ? 48 : 32;
    const fs = size === 'lg' ? 28 : 18;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: size === 'lg' ? 14 : 10, userSelect: 'none' }}>
            <div style={{ width: s, height: s, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
                    <polygon points="24,2 44,14 44,34 24,46 4,34 4,14" fill="none" stroke={theme.accent} strokeWidth="1.5" opacity="0.6" />
                    <polygon points="24,8 38,16 38,32 24,40 10,32 10,16" fill="none" stroke={theme.cyan} strokeWidth="0.8" opacity="0.35" />
                    <circle cx="24" cy="24" r="6" fill="none" stroke={theme.accent} strokeWidth="1.5" />
                    <circle cx="24" cy="24" r="2" fill={theme.accent} />
                    <line x1="24" y1="18" x2="24" y2="8" stroke={theme.accent} strokeWidth="1" opacity="0.5" />
                    <line x1="29" y1="27" x2="38" y2="32" stroke={theme.accent} strokeWidth="1" opacity="0.5" />
                    <line x1="19" y1="27" x2="10" y2="32" stroke={theme.accent} strokeWidth="1" opacity="0.5" />
                </svg>
            </div>
            <div>
                <div style={{ fontSize: fs, fontWeight: 800, letterSpacing: '0.18em', color: theme.text, lineHeight: 1, fontFamily: "'Geist', 'Inter', sans-serif" }}>ARGUX</div>
                <div style={{ fontSize: size === 'lg' ? 8.5 : 7, letterSpacing: '0.4em', color: theme.textSecondary, marginTop: 3, textTransform: 'uppercase' as const, fontWeight: 500 }}>Tactical Intelligence</div>
            </div>
        </div>
    );
}
