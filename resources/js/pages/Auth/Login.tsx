import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthLayout from '../../layouts/AuthLayout';
import Logo from '../../components/auth/Logo';
import { Card, Input, Button, SecurityBadge, Divider, AlertBox, Icons } from '../../components/ui';
import { t } from '../../i18n';
import { theme } from '../../lib/theme';
import type { SharedProps } from '../../types/shared';

/**
 * ARGUX Login Page — Dual-mode authentication.
 * Uses Inertia form submission for page flow + mock REST API for async ops.
 *
 * Mock API Endpoints:
 * POST /mock-api/auth/login          — Authenticate credentials
 * POST /mock-api/auth/2fa/verify     — Verify 2FA code
 * POST /mock-api/auth/2fa/resend     — Resend 2FA code
 * POST /mock-api/auth/forgot-password — Request password reset
 * GET  /mock-api/auth/me             — Current user info
 *
 * Mock credentials:
 * operator@argux.mil / Argux2026!Secure  (2FA: authenticator)
 * analyst@argux.mil  / Argux2026!Analyst (2FA: email)
 * viewer@argux.mil   / Argux2026!Viewer  (no 2FA)
 * suspended@argux.mil — returns 403
 * locked@argux.mil    — returns 429
 */

interface LoginApiResponse {
    message: string;
    requires_2fa?: boolean;
    challenge_token?: string;
    mfa_method?: string;
    masked_email?: string;
    masked_phone?: string;
    token?: string;
    user?: { first_name: string; avatar: string | null; id: number; email: string; role: string };
    redirect?: string;
    errors?: Record<string, string[]>;
    code?: string;
    remaining_attempts?: number;
    locked_until?: string;
}

export default function Login() {
    const { locale, flash } = usePage<SharedProps>().props;
    const lang = locale?.current || 'en';
    const tr = (key: string) => t(`login.${key}`, lang);
    const tc = (key: string) => t(`common.${key}`, lang);

    // Form state
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
    const [maskedEmail, setMaskedEmail] = useState('');
    const [maskedPhone, setMaskedPhone] = useState('');
    const [tfaUser, setTfaUser] = useState<{ first_name: string; avatar: string | null } | null>(null);
    const [resending, setResending] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

    const clearErrors = () => { setErrors({}); setMessage(null); };

    /**
     * Step 1: Submit credentials via mock REST API.
     */
    const handleLogin = useCallback(async () => {
        clearErrors();
        if (!email.trim()) { setErrors({ email: tr('all_fields_required') }); return; }
        if (!password) { setErrors({ password: tr('all_fields_required') }); return; }

        setLoading(true);
        try {
            const res = await fetch('/mock-api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ email, password, remember }),
            });

            const data: LoginApiResponse = await res.json();

            if (!res.ok) {
                // Handle specific error codes
                if (data.code === 'ACCOUNT_SUSPENDED') {
                    setMessage({ type: 'error', text: data.message || 'Account suspended.' });
                } else if (data.code === 'ACCOUNT_LOCKED') {
                    setMessage({ type: 'warning', text: data.message || 'Account locked.' });
                } else if (data.errors) {
                    const firstErrors: Record<string, string> = {};
                    for (const [k, v] of Object.entries(data.errors)) firstErrors[k] = v[0];
                    setErrors(firstErrors);
                    if (data.remaining_attempts !== undefined && data.remaining_attempts <= 2) {
                        setMessage({ type: 'warning', text: `${data.remaining_attempts} attempt${data.remaining_attempts === 1 ? '' : 's'} remaining before lockout.` });
                    }
                } else {
                    setMessage({ type: 'error', text: data.message || 'Authentication failed.' });
                }
                setLoading(false);
                return;
            }

            // Success — check if 2FA is required
            if (data.requires_2fa) {
                setStep('2fa');
                setTfaMethod(data.mfa_method || 'authenticator');
                setTfaToken(data.challenge_token || '');
                setMaskedEmail(data.masked_email || '');
                setMaskedPhone(data.masked_phone || '');
                setTfaUser(data.user || null);
                setMessage({ type: 'success', text: data.message || 'Credentials verified.' });
            } else {
                // No 2FA — redirect
                setMessage({ type: 'success', text: 'Authentication successful. Redirecting...' });
                setTimeout(() => router.visit(data.redirect || '/map'), 600);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error. Please check your connection.' });
        } finally {
            setLoading(false);
        }
    }, [email, password, remember, tr]);

    /**
     * Step 2: Verify 2FA code.
     */
    const handleVerify2FA = useCallback(async () => {
        clearErrors();
        if (!tfaCode || tfaCode.length !== 6) { setErrors({ code: 'Enter 6-digit code.' }); return; }

        setLoading(true);
        try {
            const res = await fetch('/mock-api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ code: tfaCode, challenge_token: tfaToken }),
            });

            const data: LoginApiResponse = await res.json();

            if (!res.ok) {
                if (data.code === 'CODE_EXPIRED') {
                    setMessage({ type: 'warning', text: 'Code expired. Request a new one.' });
                } else {
                    setErrors({ code: data.errors?.code?.[0] || data.message || 'Invalid code.' });
                    if (data.remaining_attempts !== undefined) setAttemptsLeft(data.remaining_attempts);
                }
                setLoading(false);
                return;
            }

            setMessage({ type: 'success', text: 'Authenticated. Redirecting to command center...' });
            setTimeout(() => router.visit(data.redirect || '/map'), 800);
        } catch {
            setMessage({ type: 'error', text: 'Network error.' });
        } finally {
            setLoading(false);
        }
    }, [tfaCode, tfaToken]);

    /**
     * Resend 2FA code via selected method.
     */
    const handleResend = useCallback(async (method?: string) => {
        setResending(true);
        try {
            const res = await fetch('/mock-api/auth/2fa/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ method: method || tfaMethod }),
            });
            const data = await res.json();
            setMessage({ type: 'success', text: data.message || 'Code resent.' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to resend code.' });
        } finally {
            setResending(false);
        }
    }, [tfaMethod]);

    // ═══ CREDENTIALS STEP ═══
    if (step === 'credentials') {
        return (
            <Card>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}><Logo /></div>
                    <SecurityBadge text={tc('secure_auth')} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '16px 0 6px', letterSpacing: '0.02em' }}>{tr('title')}</h2>
                    <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0, lineHeight: 1.5 }}>{tr('subtitle')}</p>
                </div>

                {message && <AlertBox type={message.type}>{message.type === 'error' ? '⚠' : message.type === 'warning' ? '🔒' : '✓'} {message.text}</AlertBox>}
                {flash?.success && <AlertBox type="success">✓ {flash.success}</AlertBox>}

                <Input label={tr('email_label')} type="email" placeholder={tr('email_placeholder')}
                    value={email} onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(prev => { const n = { ...prev }; delete n.email; return n; }); }}
                    icon={Icons.mail()} autoComplete="email" error={errors.email}
                   />

                <Input label={tr('password_label')} type="password" placeholder={tr('password_placeholder')}
                    value={password} onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(prev => { const n = { ...prev }; delete n.password; return n; }); }}
                    icon={Icons.lock()} autoComplete="current-password"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    error={errors.password}
                   />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, marginTop: -4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: theme.textSecondary }}>
                        <div onClick={() => setRemember(!remember)} style={{
                            width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: remember ? theme.accent : 'transparent', border: `1.5px solid ${remember ? theme.accent : theme.border}`,
                            cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                            {remember && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
                        </div>
                        {tr('remember')}
                    </label>
                    <a href="/forgot-password" onClick={e => { e.preventDefault(); router.visit('/forgot-password'); }}
                        style={{ color: theme.accent, fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>{tr('forgot')}</a>
                </div>

                <Button onClick={handleLogin} loading={loading} disabled={!email || !password}>
                    {Icons.lock(14)} {tr('submit')}
                </Button>

                <Divider text={tc('or')} />

                <Button variant="secondary" onClick={() => setMessage({ type: 'warning', text: 'Hardware key authentication is not available in mock mode.' })}>
                    {Icons.key(14)} {tr('hardware_key')}
                </Button>

                <div style={{ textAlign: 'center', marginTop: 26, fontSize: 12, color: theme.textSecondary }}>
                    {tr('no_account')}{' '}
                    <a href="/register" onClick={e => { e.preventDefault(); router.visit('/register'); }}
                        style={{ color: theme.accent, fontWeight: 600, textDecoration: 'none' }}>{tr('request_access')}</a>
                </div>

                {/* Mock credentials helper */}
                <div style={{ marginTop: 20, padding: '10px 12px', borderRadius: 8, background: `${theme.accent}06`, border: `1px solid ${theme.accent}15`, fontSize: 10, color: theme.textDim, lineHeight: 1.8 }}>
                    <div style={{ fontWeight: 700, color: theme.accent, marginBottom: 4, fontSize: 11 }}>🔑 Mock Credentials</div>
                    <div><span style={{ fontFamily: "'JetBrains Mono',monospace", color: theme.text }}>operator@argux.mil</span> / <span style={{ color: theme.textSecondary }}>Argux2026!Secure</span> <span style={{ color: '#a855f7' }}>(2FA)</span></div>
                    <div><span style={{ fontFamily: "'JetBrains Mono',monospace", color: theme.text }}>analyst@argux.mil</span> / <span style={{ color: theme.textSecondary }}>Argux2026!Analyst</span> <span style={{ color: '#a855f7' }}>(2FA email)</span></div>
                    <div><span style={{ fontFamily: "'JetBrains Mono',monospace", color: theme.text }}>viewer@argux.mil</span> / <span style={{ color: theme.textSecondary }}>Argux2026!Viewer</span> <span style={{ color: '#22c55e' }}>(no 2FA)</span></div>
                </div>
            </Card>
        );
    }

    // ═══ 2FA STEP ═══
    return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    {tfaUser?.avatar ? <img src={tfaUser.avatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%', border: `2px solid ${theme.accent}40` }} />
                        : <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${theme.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: `2px solid ${theme.accent}30` }}>🔐</div>}
                </div>
                <SecurityBadge text="Two-Factor Authentication" />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text, margin: '14px 0 6px' }}>
                    {tfaUser ? `Welcome, ${tfaUser.first_name}` : 'Verify Identity'}
                </h2>
                <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0, lineHeight: 1.5 }}>
                    {tfaMethod === 'authenticator' ? 'Enter the 6-digit code from your authenticator app.' :
                     tfaMethod === 'email' ? `Enter the code sent to ${maskedEmail}` :
                     `Enter the code sent to ${maskedPhone}`}
                </p>
            </div>

            {message && <AlertBox type={message.type}>{message.text}</AlertBox>}
            {attemptsLeft !== null && attemptsLeft <= 2 && <AlertBox type="warning">⚠ {attemptsLeft} attempt{attemptsLeft === 1 ? '' : 's'} remaining</AlertBox>}

            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 8 }}>Verification Code</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <input key={i} maxLength={1} value={tfaCode[i] || ''}
                            id={`tfa-${i}`} name={`tfa-${i}`}
                            onChange={e => {
                                const v = e.target.value.replace(/\D/g, '');
                                const newCode = tfaCode.split('');
                                newCode[i] = v;
                                setTfaCode(newCode.join('').slice(0, 6));
                                if (v && i < 5) (document.getElementById(`tfa-${i + 1}`) as HTMLInputElement)?.focus();
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Backspace' && !tfaCode[i] && i > 0) (document.getElementById(`tfa-${i - 1}`) as HTMLInputElement)?.focus();
                                if (e.key === 'Enter' && tfaCode.length === 6) handleVerify2FA();
                            }}
                            onPaste={e => { const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); setTfaCode(paste); e.preventDefault(); }}
                            style={{ width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace",
                                borderRadius: 8, border: `2px solid ${errors.code ? '#ef4444' : tfaCode[i] ? theme.accent : theme.border}`,
                                background: theme.bgInput, color: theme.text, outline: 'none', transition: 'border 0.2s' }}
                            autoFocus={i === 0}
                        />
                    ))}
                </div>
                {errors.code && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 6, textAlign: 'center' }}>{errors.code}</div>}
            </div>

            <Button onClick={handleVerify2FA} loading={loading} disabled={tfaCode.length !== 6}>
                🔓 Verify & Access
            </Button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, fontSize: 12 }}>
                <button onClick={() => handleResend()} disabled={resending}
                    style={{ background: 'none', border: 'none', color: theme.accent, cursor: resending ? 'wait' : 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                    {resending ? '⏳ Sending...' : '📨 Resend code'}
                </button>
                <button onClick={() => { setStep('credentials'); setTfaCode(''); clearErrors(); }}
                    style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                    ← Back to login
                </button>
            </div>

            {tfaMethod !== 'authenticator' && <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: theme.textDim }}>
                Try a different method:{' '}
                {['email', 'sms', 'authenticator'].filter(m => m !== tfaMethod).map(m => (
                    <button key={m} onClick={() => { setTfaMethod(m); handleResend(m); }}
                        style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, textDecoration: 'underline', marginLeft: 6 }}>
                        {m === 'email' ? '📧 Email' : m === 'sms' ? '📱 SMS' : '🔑 App'}
                    </button>
                ))}
            </div>}
        </Card>
    );
}

Login.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;

/** Extract CSRF token from cookie. */
function getCsrfToken(): string {
    return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || '');
}
