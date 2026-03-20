import { useState, useEffect } from 'react';
import { theme } from '../../lib/theme';

export default function StatusBar({ version = '0.1.0' }: { version?: string }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const i = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(i);
    }, []);

    const fmt = (d: Date, tz?: string) =>
        d.toLocaleTimeString('en-US', { hour12: false, ...(tz ? { timeZone: tz } : {}) });

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
            background: 'rgba(8,10,15,0.92)', borderTop: `1px solid ${theme.border}`,
            padding: '6px 24px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', fontSize: 10, color: theme.textDim,
            letterSpacing: '0.1em', backdropFilter: 'blur(12px)',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
        }}>
            <div style={{ display: 'flex', gap: 24 }}>
                <span>LOCAL {fmt(time)}</span>
                <span>UTC {fmt(time, 'UTC')}</span>
                <span>DC {fmt(time, 'America/New_York')}</span>
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <span style={{ color: theme.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: theme.success, display: 'inline-block', boxShadow: `0 0 6px ${theme.success}` }} />
                    ONLINE
                </span>
                <span>AES-256</span>
                <span>TLS 1.3</span>
                <span style={{ color: theme.textSecondary }}>ARGUX v{version}</span>
            </div>
        </div>
    );
}
