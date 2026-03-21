import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import ErrorParticles from '../../components/auth/ErrorParticles';
import Logo from '../../components/auth/Logo';

interface ErrorConfig {
    code: number;
    title: string;
    subtitle: string;
    description: string;
    accentColor: string;
    secondaryColor: string;
    icon: React.ReactNode;
    glitch?: boolean;
    actions?: { label: string; href: string; primary?: boolean }[];
}

const defaultActions = [
    { label: 'Go to Dashboard', href: '/map', primary: true },
    { label: 'Go Back', href: 'back' },
];

export default function ErrorPage({ config }: { config: ErrorConfig }) {
    const [time, setTime] = useState(new Date());
    const [loaded, setLoaded] = useState(false);

    useEffect(() => { setLoaded(true); const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

    const actions = config.actions || defaultActions;

    const handleAction = (href: string) => {
        if (href === 'back') { window.history.back(); }
        else { router.visit(href); }
    };

    return (
        <div className="error-page">
            <ErrorParticles accentColor={config.accentColor} secondaryColor={config.secondaryColor} glitch={config.glitch} />

            <div className="error-page-content" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                {/* Logo */}
                <div className="error-logo">
                    <Logo />
                </div>

                {/* Error Code */}
                <div className="error-code-wrap">
                    <div className="error-code" style={{ color: config.accentColor }}>
                        {String(config.code).split('').map((digit, i) => (
                            <span key={i} className="error-code-digit" style={{ animationDelay: `${i * 0.1}s` }}>{digit}</span>
                        ))}
                    </div>
                    <div className="error-code-line" style={{ background: `linear-gradient(90deg, transparent, ${config.accentColor}40, transparent)` }} />
                </div>

                {/* Icon + Title */}
                <div className="error-icon" style={{ background: `${config.accentColor}12`, color: config.accentColor, border: `1px solid ${config.accentColor}25` }}>
                    {config.icon}
                </div>

                <h1 className="error-title">{config.title}</h1>
                <p className="error-subtitle" style={{ color: config.accentColor }}>{config.subtitle}</p>
                <p className="error-description">{config.description}</p>

                {/* Actions */}
                <div className="error-actions">
                    {actions.map((action, i) => (
                        <button key={i} onClick={() => handleAction(action.href)} className={`error-action-btn ${action.primary ? 'primary' : 'secondary'}`} style={action.primary ? { background: config.accentColor, borderColor: config.accentColor } : {}}>
                            {action.primary && <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M8 3l5 5-5 5"/></svg>}
                            {!action.primary && action.href === 'back' && <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 8H3M8 3L3 8l5 5"/></svg>}
                            {action.label}
                        </button>
                    ))}
                </div>

                {/* Status Bar */}
                <div className="error-status-bar">
                    <div className="error-status-item">
                        <span className="error-status-dot" style={{ background: config.accentColor }} />
                        ERROR {config.code}
                    </div>
                    <div className="error-status-item">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></svg>
                        {time.toLocaleTimeString()}
                    </div>
                    <div className="error-status-item">ARGUX v0.2.5</div>
                    <div className="error-status-item" style={{ color: config.accentColor }}>
                        {config.code >= 500 ? 'SERVER FAULT' : config.code === 403 ? 'ACCESS DENIED' : config.code === 404 ? 'NOT FOUND' : config.code === 419 ? 'SESSION EXPIRED' : config.code === 429 ? 'RATE LIMITED' : config.code === 503 ? 'MAINTENANCE' : 'ERROR'}
                    </div>
                </div>
            </div>
        </div>
    );
}
