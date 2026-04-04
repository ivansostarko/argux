import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthLayout from '../../layouts/AuthLayout';
import Logo from '../../components/auth/Logo';
import { Card, Input, Button, SecurityBadge, PasswordStrength, ProgressSteps, OtpInput, AlertBox, Icons } from '../../components/ui';
import { t } from '../../i18n';
import { theme } from '../../lib/theme';
import type { SharedProps } from '../../types/shared';

/**
 * ARGUX Forgot Password — 4-step flow via mock REST API.
 *
 * Step 1: Enter email       → POST /mock-api/auth/forgot-password
 * Step 2: Enter 6-digit code → POST /mock-api/auth/verify-reset-code
 * Step 3: Set new password   → POST /mock-api/auth/reset-password
 * Step 4: Success confirmation
 *
 * Mock behavior:
 * - Any email succeeds (anti-enumeration)
 * - Code "000000" → invalid (422)
 * - Code "999999" → expired (410)
 * - Any other 6-digit code → success
 * - Password must be ≥12 chars + match confirmation
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
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
    } catch {
        return { ok: false, status: 0, data: { message: 'Network error. Check your connection.' } };
    }
}

function ForgotPassword() {
    const { locale } = usePage<SharedProps>().props;
    const lang = locale?.current || 'en';
    const tr = (key: string, params?: Record<string, string>) => t(`forgot.${key}`, lang, params);
    const trReg = (key: string) => t(`register.${key}`, lang);

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<{ type: 'error' | 'success' | 'warning' | 'info'; text: string } | null>(null);

    const clearState = () => { setErrors({}); setMessage(null); };

    /**
     * Step 1: Send reset code to email.
     */
    const handleSend = useCallback(async () => {
        clearState();
        if (!email.trim()) { setErrors({ email: 'Email is required.' }); return; }

        setLoading(true);
        const { ok, data } = await api('/mock-api/auth/forgot-password', { email });
        setLoading(false);

        if (!ok) {
            if (data.errors) {
                const first: Record<string, string> = {};
                for (const [k, v] of Object.entries(data.errors)) first[k] = (v as string[])[0];
                setErrors(first);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to send code.' });
            }
            return;
        }

        setMaskedEmail(data.masked_email || email);
        setMessage({ type: 'success', text: data.message });
        setStep(2);
    }, [email]);

    /**
     * Step 2: Verify reset code.
     */
    const handleVerify = useCallback(async () => {
        clearState();
        if (code.length !== 6) { setErrors({ code: 'Enter the full 6-digit code.' }); return; }

        setLoading(true);
        const { ok, status, data } = await api('/mock-api/auth/verify-reset-code', { code, email });
        setLoading(false);

        if (!ok) {
            if (status === 410) {
                setMessage({ type: 'warning', text: data.message || 'Code expired.' });
            } else if (data.errors?.code) {
                setErrors({ code: data.errors.code[0] });
                if (data.attempts_remaining !== undefined) {
                    setMessage({ type: 'warning', text: `${data.attempts_remaining} attempt${data.attempts_remaining === 1 ? '' : 's'} remaining.` });
                }
            } else {
                setMessage({ type: 'error', text: data.message || 'Verification failed.' });
            }
            return;
        }

        setMessage({ type: 'success', text: data.message });
        setStep(3);
    }, [code, email]);

    /**
     * Step 2b: Resend reset code.
     */
    const handleResend = useCallback(async () => {
        setResending(true);
        setMessage(null);
        const { ok, data } = await api('/mock-api/auth/resend-reset-code', { email });
        setResending(false);

        if (ok) {
            setCode('');
            setMessage({ type: 'success', text: data.message || 'New code sent.' });
        } else {
            setMessage({ type: 'error', text: data.message || 'Failed to resend.' });
        }
    }, [email]);

    /**
     * Step 3: Set new password.
     */
    const handleReset = useCallback(async () => {
        clearState();
        if (password.length < 12) { setErrors({ password: 'Minimum 12 characters required.' }); return; }
        if (password !== confirm) { setErrors({ password_confirmation: 'Passwords do not match.' }); return; }

        setLoading(true);
        const { ok, data } = await api('/mock-api/auth/reset-password', {
            email, code, password, password_confirmation: confirm,
        });
        setLoading(false);

        if (!ok) {
            if (data.errors) {
                const first: Record<string, string> = {};
                for (const [k, v] of Object.entries(data.errors)) first[k] = (v as string[])[0];
                setErrors(first);
            } else {
                setMessage({ type: 'error', text: data.message || 'Reset failed.' });
            }
            return;
        }

        setStep(4);
    }, [email, code, password, confirm]);

    return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><Logo /></div>
                <SecurityBadge text={tr('badge')} />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '14px 0 6px' }}>
                    {step === 4 ? tr('title_complete') : tr('title')}
                </h2>
            </div>

            <ProgressSteps current={step} total={4} color={step === 4 ? theme.success : undefined} />

            {message && <AlertBox type={message.type}>
                {message.type === 'error' ? '⚠' : message.type === 'warning' ? '🔒' : message.type === 'info' ? 'ℹ' : '✓'} {message.text}
            </AlertBox>}

            {/* ═══ Step 1: Email ═══ */}
            {step === 1 && <>
                <p style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 22, lineHeight: 1.6 }}>
                    {tr('step1_desc')}
                </p>
                <Input label={tr('email_label')} type="email" placeholder={tr('email_placeholder')}
                    value={email} onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({}); }}
                    icon={Icons.mail()} error={errors.email}
                    onKeyDown={e => e.key === 'Enter' && email && handleSend()} />
                <Button onClick={handleSend} loading={loading} disabled={!email}>
                    {tr('send_code')}
                </Button>
            </>}

            {/* ═══ Step 2: Code ═══ */}
            {step === 2 && <>
                <AlertBox type="info">
                    {tr('code_sent', { email: maskedEmail })}
                </AlertBox>
                <p style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 22 }}>
                    {tr('enter_code')}
                </p>
                <OtpInput length={6} value={code} onChange={v => { setCode(v); if (errors.code) setErrors({}); }} />
                {errors.code && <div style={{ fontSize: 11, color: '#ef4444', textAlign: 'center', marginTop: 6 }}>{errors.code}</div>}
                <div style={{ marginTop: 22 }}>
                    <Button onClick={handleVerify} loading={loading} disabled={code.length < 6}>
                        {tr('verify_code')}
                    </Button>
                </div>
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                    <button onClick={handleResend} disabled={resending} style={{
                        background: 'none', border: 'none', color: resending ? theme.textDim : theme.accent,
                        fontSize: 12, cursor: resending ? 'wait' : 'pointer', fontFamily: 'inherit',
                    }}>
                        {resending ? '⏳ Sending...' : '📨 Resend code'}
                    </button>
                </div>
            </>}

            {/* ═══ Step 3: New Password ═══ */}
            {step === 3 && <>
                <Input label={tr('new_pw_label')} type="password" placeholder={tr('new_pw_placeholder')}
                    value={password} onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(prev => { const n = { ...prev }; delete n.password; return n; }); }}
                    icon={Icons.lock()} error={errors.password} />
                <PasswordStrength password={password} t={trReg} />
                <Input label={tr('confirm_pw_label')} type="password" placeholder={tr('confirm_pw_placeholder')}
                    value={confirm} onChange={e => { setConfirm(e.target.value); if (errors.password_confirmation) setErrors(prev => { const n = { ...prev }; delete n.password_confirmation; return n; }); }}
                    icon={Icons.lock()}
                    error={errors.password_confirmation || (confirm && password !== confirm ? trReg('passwords_mismatch') : '')} />
                <Button onClick={handleReset} loading={loading}
                    disabled={!password || password.length < 12 || password !== confirm}>
                    {tr('reset_password')}
                </Button>
            </>}

            {/* ═══ Step 4: Success ═══ */}
            {step === 4 && <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 68, height: 68, borderRadius: '50%', background: theme.successDim,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 22px', color: theme.success,
                }}>
                    {Icons.checkCircle(34)}
                </div>
                <p style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 6, lineHeight: 1.6 }}>
                    {tr('success_message')}
                </p>
                <AlertBox type="warning">
                    {tr('audit_notice')}
                </AlertBox>
                <Button onClick={() => router.visit('/login')} style={{ marginTop: 4 }}>
                    {tr('return_login')}
                </Button>
            </div>}

            {/* Back navigation */}
            {step < 4 && <div style={{ textAlign: 'center', marginTop: 22 }}>
                <button onClick={() => step === 1 ? router.visit('/login') : setStep(step - 1)} style={{
                    background: 'none', border: 'none', color: theme.textSecondary, fontSize: 12,
                    cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                    {Icons.arrowLeft(12)} {step === 1 ? tr('back_login') : tr('previous_step')}
                </button>
            </div>}

            {/* Mock hint */}
            {step === 2 && <div style={{ marginTop: 16, padding: '8px 12px', borderRadius: 8, background: `${theme.accent}06`, border: `1px solid ${theme.accent}15`, fontSize: 10, color: theme.textDim, lineHeight: 1.7 }}>
                <span style={{ fontWeight: 700, color: theme.accent }}>🔑 Mock:</span>{' '}
                Any 6-digit code works. <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>000000</span> = invalid, <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>999999</span> = expired.
            </div>}
        </Card>
    );
}

ForgotPassword.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
export default ForgotPassword;
