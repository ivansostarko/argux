import { useState, useRef, ReactNode, KeyboardEvent, ClipboardEvent } from 'react';
import { theme } from '../../lib/theme';

/* ─── Icons ─── */
export const Icons = {
    user: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>,
    mail: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="14" height="10" rx="2"/><path d="M1 5l7 4 7-4"/></svg>,
    lock: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5 7V5a3 3 0 016 0v2"/></svg>,
    eye: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>,
    eyeOff: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 8s3-5 7-5c1.3 0 2.5.4 3.5 1M15 8s-1.4 2.3-3.5 3.5M6.5 10.5a3 3 0 01-.5-2c0-1.7 1.3-3 3-3"/><line x1="2" y1="2" x2="14" y2="14"/></svg>,
    shield: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5l5.5 2v4c0 3.5-2.5 6-5.5 7.5-3-1.5-5.5-4-5.5-7.5v-4z"/></svg>,
    phone: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="1" width="8" height="14" rx="2"/><line x1="7" y1="12" x2="9" y2="12"/></svg>,
    key: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="10.5" r="3"/><path d="M8 8l5.5-5.5M11.5 2.5l2 2M10 5l2 2"/></svg>,
    arrowLeft: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>,
    checkCircle: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M5.5 8l2 2 3.5-4"/></svg>,
    spinner: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" style={{ animation: 'argux-spin 0.8s linear infinite' }}><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round"/></svg>,
};

/* ─── Input ─── */
interface InputProps {
    label?: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    icon?: ReactNode;
    disabled?: boolean;
    autoComplete?: string;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
    maxLength?: number;
}

export function Input({ label, type = 'text', placeholder, value, onChange, error, icon, disabled, autoComplete, onKeyDown, maxLength }: InputProps) {
    const [focused, setFocused] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPw ? 'text' : type;

    return (
        <div style={{ marginBottom: 16 }}>
            {label && (
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                    {label}
                    {error && <span style={{ color: theme.danger, marginLeft: 8, textTransform: 'none' as const, letterSpacing: 0, fontWeight: 400, fontSize: 11 }}>{error}</span>}
                </label>
            )}
            <div style={{
                position: 'relative', display: 'flex', alignItems: 'center',
                background: focused ? theme.bgInputFocus : theme.bgInput,
                border: `1px solid ${error ? theme.danger : focused ? theme.borderFocus : theme.border}`,
                borderRadius: 8, transition: 'all 0.2s ease',
                boxShadow: focused ? `0 0 0 3px ${error ? theme.dangerDim : theme.accentDim}` : 'none',
            }}>
                {icon && <div style={{ padding: '0 0 0 12px', color: focused ? theme.accent : theme.textDim, transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}>{icon}</div>}
                <input
                    type={inputType} placeholder={placeholder} value={value} onChange={onChange}
                    disabled={disabled} autoComplete={autoComplete} onKeyDown={onKeyDown} maxLength={maxLength}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{
                        flex: 1, background: 'transparent', border: 'none', outline: 'none',
                        padding: `11px ${isPassword ? 4 : 14}px 11px ${icon ? 8 : 14}px`,
                        color: theme.text, fontSize: 14, fontFamily: 'inherit', letterSpacing: '0.01em',
                    }}
                />
                {isPassword && (
                    <button onClick={() => setShowPw(!showPw)} type="button" style={{ background: 'none', border: 'none', padding: '0 12px', cursor: 'pointer', color: theme.textDim, display: 'flex', alignItems: 'center' }}>
                        {showPw ? Icons.eyeOff() : Icons.eye()}
                    </button>
                )}
            </div>
        </div>
    );
}

/* ─── Button ─── */
interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    disabled?: boolean;
    loading?: boolean;
    style?: React.CSSProperties;
    type?: 'button' | 'submit';
}

export function Button({ children, onClick, variant = 'primary', disabled, loading, style: sx, type = 'button' }: ButtonProps) {
    const base: Record<string, React.CSSProperties> = {
        primary: { background: disabled ? theme.textDim : `linear-gradient(135deg, ${theme.accent}, #1858b8)`, color: '#fff', border: 'none', boxShadow: disabled ? 'none' : `0 4px 20px ${theme.accentGlow}` },
        secondary: { background: 'rgba(255,255,255,0.03)', color: theme.textSecondary, border: `1px solid ${theme.border}` },
        ghost: { background: 'transparent', color: theme.accent, border: 'none' },
        danger: { background: theme.dangerDim, color: theme.danger, border: `1px solid rgba(239,68,68,0.25)` },
    };

    return (
        <button type={type} onClick={onClick} disabled={disabled || loading} style={{
            ...base[variant], padding: '11px 20px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            cursor: disabled || loading ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, width: '100%', letterSpacing: '0.08em', fontFamily: 'inherit',
            textTransform: 'uppercase' as const, ...sx,
        }}>
            {loading && Icons.spinner(15)}
            {children}
        </button>
    );
}

/* ─── Card ─── */
export function Card({ children, width = 420 }: { children: ReactNode; width?: number }) {
    return (
        <div style={{
            background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 16,
            padding: '40px 36px', width: '100%', maxWidth: width, position: 'relative',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            boxShadow: `0 0 80px rgba(0,0,0,0.6), 0 0 40px rgba(29,111,239,0.04), inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}>
            <div style={{ position: 'absolute', top: 0, left: 36, right: 36, height: 1, background: `linear-gradient(90deg, transparent, ${theme.accent}30, transparent)` }} />
            {children}
        </div>
    );
}

/* ─── SecurityBadge ─── */
export function SecurityBadge({ text }: { text: string }) {
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            background: theme.accentDim, borderRadius: 6, fontSize: 10, fontWeight: 700,
            color: theme.accent, letterSpacing: '0.12em', textTransform: 'uppercase' as const,
            border: `1px solid rgba(29,111,239,0.15)`,
        }}>
            {Icons.lock(10)}
            {text}
        </div>
    );
}

/* ─── Divider ─── */
export function Divider({ text }: { text?: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: theme.border }} />
            {text && <span style={{ fontSize: 10, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.12em', fontWeight: 600 }}>{text}</span>}
            <div style={{ flex: 1, height: 1, background: theme.border }} />
        </div>
    );
}

/* ─── AlertBox ─── */
export function AlertBox({ type, children }: { type: 'error' | 'success' | 'warning' | 'info'; children: ReactNode }) {
    const map = {
        error: { bg: theme.dangerDim, border: 'rgba(239,68,68,0.25)', color: theme.danger },
        success: { bg: theme.successDim, border: 'rgba(34,197,94,0.25)', color: theme.success },
        warning: { bg: theme.warningDim, border: 'rgba(234,179,8,0.25)', color: theme.warning },
        info: { bg: theme.accentDim, border: 'rgba(29,111,239,0.2)', color: theme.accent },
    };
    const s = map[type];
    return (
        <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: '11px 14px', marginBottom: 16, fontSize: 12, color: s.color, display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1.5 }}>
            {children}
        </div>
    );
}

/* ─── OTP Input ─── */
interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (v: string) => void;
}

export function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (idx: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const arr = value.split('');
        arr[idx] = val;
        const next = arr.join('').slice(0, length);
        onChange(next);
        if (val && idx < length - 1) refs.current[idx + 1]?.focus();
    };

    const handleKey = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !value[idx] && idx > 0) refs.current[idx - 1]?.focus();
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pasted);
        const focusIdx = Math.min(pasted.length, length - 1);
        refs.current[focusIdx]?.focus();
    };

    return (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={el => { refs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1}
                    value={value[i] || ''}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    style={{
                        width: 46, height: 54, textAlign: 'center' as const, fontSize: 22, fontWeight: 700,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
                        background: theme.bgInput, color: theme.text,
                        border: `1.5px solid ${value[i] ? theme.borderFocus : theme.border}`,
                        borderRadius: 10, outline: 'none', transition: 'all 0.2s ease',
                        boxShadow: value[i] ? `0 0 0 3px ${theme.accentDim}` : 'none',
                    }}
                />
            ))}
        </div>
    );
}

/* ─── MethodSelector ─── */
interface Method { id: string; label: string; icon: ReactNode }

export function MethodSelector({ methods, selected, onSelect }: { methods: Method[]; selected: string; onSelect: (id: string) => void }) {
    return (
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            {methods.map(m => (
                <button key={m.id} onClick={() => onSelect(m.id)} style={{
                    flex: 1, padding: '14px 8px', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' as const,
                    background: selected === m.id ? theme.accentDim : 'rgba(255,255,255,0.02)',
                    border: `1.5px solid ${selected === m.id ? theme.accent : theme.border}`,
                    borderRadius: 10, fontFamily: 'inherit',
                }}>
                    <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center', color: selected === m.id ? theme.accent : theme.textDim }}>{m.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: selected === m.id ? theme.accent : theme.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{m.label}</div>
                </button>
            ))}
        </div>
    );
}

/* ─── PasswordStrength ─── */
export function PasswordStrength({ password, t }: { password: string; t: (k: string) => string }) {
    const calc = (pw: string) => {
        if (!pw) return { score: 0, label: '', color: theme.textDim };
        let s = 0;
        if (pw.length >= 8) s++;
        if (pw.length >= 12) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        const levels: [number, string, string][] = [[1, t('register.strength_weak'), theme.danger], [2, t('register.strength_fair'), theme.warning], [3, t('register.strength_good'), theme.accent], [4, t('register.strength_strong'), theme.success]];
        for (const [max, label, color] of levels) { if (s <= max) return { score: s, label, color }; }
        return { score: 5, label: t('register.strength_excellent'), color: theme.cyan };
    };

    const { score, label, color } = calc(password);
    if (!password) return null;

    return (
        <div style={{ marginTop: -8, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? color : theme.border, transition: 'background 0.3s' }} />)}
            </div>
            <div style={{ fontSize: 10, color, letterSpacing: '0.1em', fontWeight: 700 }}>{label}</div>
        </div>
    );
}

/* ─── CheckItem ─── */
export function CheckItem({ checked, text }: { checked: boolean; text: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: checked ? theme.success : theme.textDim, marginBottom: 5, transition: 'color 0.2s' }}>
            <div style={{
                width: 15, height: 15, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: checked ? theme.successDim : 'transparent', border: `1px solid ${checked ? theme.success : theme.border}`, transition: 'all 0.2s',
            }}>
                {checked && <span style={{ fontSize: 9, fontWeight: 700 }}>✓</span>}
            </div>
            {text}
        </div>
    );
}

/* ─── ProgressSteps ─── */
export function ProgressSteps({ current, total, color }: { current: number; total: number; color?: string }) {
    return (
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < current ? (color || theme.accent) : theme.border, transition: 'background 0.3s ease' }} />
            ))}
        </div>
    );
}
