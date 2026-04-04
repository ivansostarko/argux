import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthLayout from '../../layouts/AuthLayout';
import Logo from '../../components/auth/Logo';
import { Card, Input, Button, SecurityBadge, Divider, AlertBox, Icons } from '../../components/ui';
import { t } from '../../i18n';
import { theme } from '../../lib/theme';
import type { SharedProps } from '../../types/shared';

/**
 * ARGUX Admin Login — Restricted admin authentication via mock REST API.
 *
 * POST /mock-api/admin/auth/login        — Admin credentials
 * POST /mock-api/admin/auth/2fa/verify   — Admin 2FA
 * POST /mock-api/admin/auth/2fa/resend   — Resend admin code
 *
 * Mock credentials:
 * admin@argux.mil     / AdminArgux2026!  (super_admin, 2FA authenticator)
 * security@argux.mil  / SecArgux2026!    (admin, 2FA email)
 * suspended-admin@... — returns 403 ADMIN_SUSPENDED
 * operator@argux.mil  — returns 403 NOT_ADMIN (not an admin account)
 */

function getCsrf(): string {
    return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || '');
}

async function api(url: string, body: Record<string, any>): Promise<{ ok: boolean; status: number; data: any }> {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() },
            body: JSON.stringify(body),
        });
        return { ok: res.ok, status: res.status, data: await res.json() };
    } catch {
        return { ok: false, status: 0, data: { message: 'Network error.' } };
    }
}

function AdminLogin() {
    const { locale, flash } = usePage<SharedProps>().props;
    const lang = locale?.current || 'en';
    const tr = (key: string) => t(`admin_login.${key}`, lang);
    const tc = (key: string) => t(`common.${key}`, lang);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<{ type: 'error' | 'success' | 'warning'; text: string } | null>(null);

    // 2FA state
    const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
    const [tfaCode, setTfaCode] = useState('');
    const [tfaMethod, setTfaMethod] = useState('');
    const [tfaToken, setTfaToken] = useState('');
    const [tfaUser, setTfaUser] = useState<{ first_name: string; role: string; avatar: string | null } | null>(null);
    const [maskedEmail, setMaskedEmail] = useState('');
    const [resending, setResending] = useState(false);

    const clearState = () => { setErrors({}); setMessage(null); };

    const handleLogin = useCallback(async () => {
        clearState();
        if (!email.trim()) { setErrors({ email: tr('all_fields_required') }); return; }
        if (!password) { setErrors({ password: tr('all_fields_required') }); return; }

        setLoading(true);
        const { ok, status, data } = await api('/mock-api/admin/auth/login', { email, password, remember });
        setLoading(false);

        if (!ok) {
            if (data.code === 'NOT_ADMIN') {
                setMessage({ type: 'error', text: data.message });
            } else if (data.code === 'ADMIN_SUSPENDED') {
                setMessage({ type: 'error', text: data.message });
            } else if (data.code === 'ADMIN_LOCKED') {
                setMessage({ type: 'warning', text: data.message });
            } else if (data.errors) {
                const first: Record<string, string> = {};
                for (const [k, v] of Object.entries(data.errors)) first[k] = (v as string[])[0];
                setErrors(first);
                if (data.remaining_attempts !== undefined && data.remaining_attempts <= 1) {
                    setMessage({ type: 'warning', text: `${data.remaining_attempts} attempt remaining before lockout.` });
                }
            } else {
                setMessage({ type: 'error', text: data.message || 'Authentication failed.' });
            }
            return;
        }

        if (data.requires_2fa) {
            setStep('2fa');
            setTfaMethod(data.mfa_method || 'authenticator');
            setTfaToken(data.challenge_token || '');
            setTfaUser(data.user || null);
            setMaskedEmail(data.masked_email || '');
            setMessage({ type: 'success', text: 'Admin credentials verified.' });
        } else {
            setMessage({ type: 'success', text: 'Authenticated. Redirecting...' });
            setTimeout(() => router.visit(data.redirect || '/admin/dashboard'), 600);
        }
    }, [email, password, remember, tr]);

    const handleVerify2FA = useCallback(async () => {
        clearState();
        if (tfaCode.length !== 6) { setErrors({ code: 'Enter 6-digit code.' }); return; }

        setLoading(true);
        const { ok, data } = await api('/mock-api/admin/auth/2fa/verify', { code: tfaCode, challenge_token: tfaToken });
        setLoading(false);

        if (!ok) {
            if (data.code === 'CODE_EXPIRED') setMessage({ type: 'warning', text: 'Code expired. Request a new one.' });
            else setErrors({ code: data.errors?.code?.[0] || data.message || 'Invalid code.' });
            return;
        }

        setMessage({ type: 'success', text: 'Admin access granted. Redirecting...' });
        setTimeout(() => router.visit(data.redirect || '/admin/dashboard'), 800);
    }, [tfaCode, tfaToken]);

    const handleResend = useCallback(async () => {
        setResending(true);
        setMessage(null);
        const { ok, data } = await api('/mock-api/admin/auth/2fa/resend', { method: tfaMethod });
        setResending(false);
        if (ok) setMessage({ type: 'success', text: data.message });
        else setMessage({ type: 'error', text: 'Failed to resend.' });
    }, [tfaMethod]);

    const accentRed = '#ef4444';

    // ═══ CREDENTIALS ═══
    if (step === 'credentials') return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}><Logo /></div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: accentRed, boxShadow: '0 0 6px rgba(239,68,68,0.4)' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: accentRed, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>{tr('badge')}</span>
                </div>
                <SecurityBadge text={tc('secure_auth')} />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '16px 0 6px' }}>{tr('title')}</h2>
                <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0, lineHeight: 1.5 }}>{tr('subtitle')}</p>
            </div>

            {message && <AlertBox type={message.type}>{message.type === 'error' ? '⚠' : message.type === 'warning' ? '🔒' : '✓'} {message.text}</AlertBox>}
            {flash?.success && <AlertBox type="success">✓ {flash.success}</AlertBox>}

            <Input label={tr('email_label')} type="email" placeholder={tr('email_placeholder')}
                value={email} onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => { const n = { ...p }; delete n.email; return n; }); }}
                icon={Icons.mail()} autoComplete="email" error={errors.email} />

            <Input label={tr('password_label')} type="password" placeholder={tr('password_placeholder')}
                value={password} onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => { const n = { ...p }; delete n.password; return n; }); }}
                icon={Icons.lock()} autoComplete="current-password" error={errors.password}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, marginTop: -4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: theme.textSecondary }}>
                    <div onClick={() => setRemember(!remember)} style={{ width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: remember ? accentRed : 'transparent', border: `1.5px solid ${remember ? accentRed : theme.border}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                        {remember && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
                    </div>
                    {tr('remember')}
                </label>
                <a href="/forgot-password" onClick={e => { e.preventDefault(); router.visit('/forgot-password'); }}
                    style={{ color: accentRed, fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>{tr('forgot')}</a>
            </div>

            <Button onClick={handleLogin} loading={loading} disabled={!email || !password}
                style={{ background: accentRed, borderColor: accentRed }}>
                {Icons.lock(14)} {tr('submit')}
            </Button>

            <Divider text={tc('or')} />

            <Button variant="secondary" onClick={() => setMessage({ type: 'warning', text: 'Hardware key not available in mock mode.' })}>
                {Icons.key(14)} Hardware Security Key
            </Button>

            <div style={{ textAlign: 'center', marginTop: 26, fontSize: 12, color: theme.textSecondary }}>
                <a href="/login" onClick={e => { e.preventDefault(); router.visit('/login'); }}
                    style={{ color: theme.accent, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {Icons.arrowLeft(12)} {tr('back_operator')}
                </a>
            </div>

            {/* Mock credentials */}
            <div style={{ marginTop: 20, padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', fontSize: 10, color: theme.textDim, lineHeight: 1.8 }}>
                <div style={{ fontWeight: 700, color: accentRed, marginBottom: 4, fontSize: 11 }}>🔑 Admin Mock Credentials</div>
                <div><span style={{ fontFamily: "'JetBrains Mono',monospace", color: theme.text }}>admin@argux.mil</span> / <span style={{ color: theme.textSecondary }}>AdminArgux2026!</span> <span style={{ color: '#a855f7' }}>(super_admin, 2FA)</span></div>
                <div><span style={{ fontFamily: "'JetBrains Mono',monospace", color: theme.text }}>security@argux.mil</span> / <span style={{ color: theme.textSecondary }}>SecArgux2026!</span> <span style={{ color: '#a855f7' }}>(admin, 2FA email)</span></div>
                <div style={{ color: theme.textDim, fontSize: 9, marginTop: 2 }}>operator@argux.mil → 403 NOT_ADMIN · suspended-admin@... → 403 SUSPENDED</div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${theme.border}`, textAlign: 'center', fontSize: 9, fontWeight: 700, color: accentRed, letterSpacing: '0.08em' }}>
                ADMIN PANEL — RESTRICTED ACCESS
            </div>
        </Card>
    );

    // ═══ 2FA ═══
    return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    {tfaUser?.avatar ? <img src={tfaUser.avatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%', border: `2px solid ${accentRed}40` }} />
                        : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: `2px solid ${accentRed}30` }}>🛡️</div>}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 8 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: accentRed, letterSpacing: '0.1em' }}>ADMIN 2FA</span>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text, margin: '10px 0 6px' }}>
                    {tfaUser ? `Welcome, ${tfaUser.first_name}` : 'Admin Verification'}
                </h2>
                {tfaUser?.role && <div style={{ fontSize: 10, color: accentRed, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{tfaUser.role.replace('_', ' ')}</div>}
                <p style={{ fontSize: 12, color: theme.textSecondary, margin: '8px 0 0', lineHeight: 1.5 }}>
                    {tfaMethod === 'authenticator' ? 'Enter the 6-digit code from your authenticator app.' : `Enter the code sent to ${maskedEmail}`}
                </p>
            </div>

            {message && <AlertBox type={message.type}>{message.text}</AlertBox>}

            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 8 }}>Verification Code</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <input key={i} maxLength={1} value={tfaCode[i] || ''}
                            id={`admin-tfa-${i}`}
                            onChange={e => {
                                const v = e.target.value.replace(/\D/g, '');
                                const nc = tfaCode.split(''); nc[i] = v;
                                setTfaCode(nc.join('').slice(0, 6));
                                if (v && i < 5) (document.getElementById(`admin-tfa-${i + 1}`) as HTMLInputElement)?.focus();
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Backspace' && !tfaCode[i] && i > 0) (document.getElementById(`admin-tfa-${i - 1}`) as HTMLInputElement)?.focus();
                                if (e.key === 'Enter' && tfaCode.length === 6) handleVerify2FA();
                            }}
                            onPaste={e => { setTfaCode(e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)); e.preventDefault(); }}
                            style={{ width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace",
                                borderRadius: 8, border: `2px solid ${errors.code ? accentRed : tfaCode[i] ? accentRed : theme.border}`,
                                background: theme.bgInput, color: theme.text, outline: 'none' }}
                            autoFocus={i === 0}
                        />
                    ))}
                </div>
                {errors.code && <div style={{ fontSize: 11, color: accentRed, marginTop: 6, textAlign: 'center' }}>{errors.code}</div>}
            </div>

            <Button onClick={handleVerify2FA} loading={loading} disabled={tfaCode.length !== 6}
                style={{ background: accentRed, borderColor: accentRed }}>
                🛡️ Verify Admin Access
            </Button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, fontSize: 12 }}>
                <button onClick={handleResend} disabled={resending}
                    style={{ background: 'none', border: 'none', color: accentRed, cursor: resending ? 'wait' : 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                    {resending ? '⏳ Sending...' : '📨 Resend code'}
                </button>
                <button onClick={() => { setStep('credentials'); setTfaCode(''); clearState(); }}
                    style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                    ← Back to login
                </button>
            </div>

            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${theme.border}`, textAlign: 'center', fontSize: 9, fontWeight: 700, color: accentRed, letterSpacing: '0.08em' }}>
                ADMIN PANEL — RESTRICTED ACCESS
            </div>
        </Card>
    );
}

AdminLogin.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
export default AdminLogin;
