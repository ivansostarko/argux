import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { theme } from '../../lib/theme';

/* ─── Types ─── */
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // Fallback when outside provider (no-op)
        return {
            toast: () => {},
            success: () => {},
            error: () => {},
            warning: () => {},
            info: () => {},
        };
    }
    return ctx;
}

/* ─── Toast Item ─── */
const typeConfig: Record<ToastType, { color: string; bg: string; icon: ReactNode }> = {
    success: {
        color: '#22c55e', bg: 'rgba(34,197,94,0.12)',
        icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M5.5 8l2 2 3.5-4"/></svg>,
    },
    error: {
        color: '#ef4444', bg: 'rgba(239,68,68,0.12)',
        icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><line x1="6" y1="6" x2="10" y2="10"/><line x1="10" y1="6" x2="6" y2="10"/></svg>,
    },
    warning: {
        color: '#eab308', bg: 'rgba(234,179,8,0.10)',
        icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.13 2.5a1 1 0 011.74 0l5.5 9.5A1 1 0 0113.5 13.5h-11a1 1 0 01-.87-1.5z"/><line x1="8" y1="6" x2="8" y2="8.5"/><circle cx="8" cy="10.5" r="0.5" fill="currentColor"/></svg>,
    },
    info: {
        color: '#1d6fef', bg: 'rgba(29,111,239,0.12)',
        icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><line x1="8" y1="7" x2="8" y2="11"/><circle cx="8" cy="5" r="0.5" fill="currentColor"/></svg>,
    },
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
    const [exiting, setExiting] = useState(false);
    const cfg = typeConfig[t.type];

    useEffect(() => {
        const dur = t.duration || 4000;
        const exitTimer = setTimeout(() => setExiting(true), dur - 300);
        const removeTimer = setTimeout(() => onDismiss(t.id), dur);
        return () => { clearTimeout(exitTimer); clearTimeout(removeTimer); };
    }, [t.id, t.duration, onDismiss]);

    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
            background: '#0d1220', border: `1px solid ${theme.border}`,
            borderLeft: `3px solid ${cfg.color}`, borderRadius: '0 10px 10px 0',
            minWidth: 300, maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: exiting ? 'argux-toastOut 0.3s ease forwards' : 'argux-toastIn 0.3s ease',
            pointerEvents: 'auto' as const, cursor: 'pointer',
        }} onClick={() => { setExiting(true); setTimeout(() => onDismiss(t.id), 300); }}>
            <div style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: t.message ? 2 : 0 }}>{t.title}</div>
                {t.message && <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.5 }}>{t.message}</div>}
            </div>
            <button onClick={e => { e.stopPropagation(); setExiting(true); setTimeout(() => onDismiss(t.id), 300); }} style={{
                background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 2,
                display: 'flex', flexShrink: 0,
            }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>
            </button>
        </div>
    );
}

/* ─── Provider ─── */
let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
        const id = ++idCounter;
        setToasts(prev => [...prev, { id, type, title, message, duration }]);
    }, []);

    const value: ToastContextValue = {
        toast: addToast,
        success: (title, message) => addToast('success', title, message),
        error: (title, message) => addToast('error', title, message),
        warning: (title, message) => addToast('warning', title, message),
        info: (title, message) => addToast('info', title, message),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <style>{`
                @keyframes argux-toastIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes argux-toastOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(40px); } }
            `}</style>
            <div style={{
                position: 'fixed', top: 20, right: 20, zIndex: 9999,
                display: 'flex', flexDirection: 'column', gap: 8,
                pointerEvents: 'none' as const,
            }}>
                {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
            </div>
        </ToastContext.Provider>
    );
}
