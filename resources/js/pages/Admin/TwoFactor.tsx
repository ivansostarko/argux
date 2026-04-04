import { useState, useEffect, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthLayout from '../../layouts/AuthLayout';
import Logo from '../../components/auth/Logo';
import { Card, Button, SecurityBadge, Divider, MethodSelector, OtpInput, AlertBox, Icons } from '../../components/ui';
import { t } from '../../i18n';
import { theme } from '../../lib/theme';
import type { SharedProps } from '../../types/shared';

/**
 * ARGUX Admin 2FA Page — Standalone verification via mock REST API.
 *
 * POST /mock-api/admin/auth/2fa/verify  — Verify 6-digit code
 * POST /mock-api/admin/auth/2fa/resend  — Resend code via method
 * POST /mock-api/admin/auth/2fa/backup  — Verify 8-char backup code
 *
 * Mock behavior:
 * - Code "000000" → INVALID_CODE (422)
 * - Code "999999" → CODE_EXPIRED (410)
 * - Any other 6-digit code → success → redirect /admin/dashboard
 * - Backup code "XXXXXXXX" → INVALID_BACKUP_CODE (422)
 * - Any other 8-char alphanumeric → success
 * - Method switching: app / sms / email with resend + cooldown
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

function AdminTwoFactor() {
    const { locale } = usePage<SharedProps>().props;
    const lang = locale?.current || 'en';
    const tr = (key: string, params?: Record<string, string>) => t(`admin_2fa.${key}`, lang, params);

    const [mode, setMode] = useState<'otp' | 'backup'>('otp');
    const [method, setMethod] = useState('app');
    const [code, setCode] = useState('');
    const [backupCode, setBackupCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState<{ type: 'error' | 'success' | 'warning'; text: string } | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [resending, setResending] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

    const accentRed = '#ef4444';

    const methods = [
        { id: 'app', label: tr('method_app'), icon: Icons.shield(22) },
        { id: 'sms', label: tr('method_sms'), icon: Icons.phone(22) },
        { id: 'email', label: tr('method_email'), icon: Icons.mail(22) },
    ];

    const descriptions: Record<string, string> = {
        app: tr('desc_app'),
        sms: tr('desc_sms'),
        email: tr('desc_email'),
    };

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const clearState = () => { setError(''); setMessage(null); setAttemptsLeft(null); };

    /**
     * Verify OTP code via API.
     */
    const handleVerify = useCallback(async () => {
        clearState();
        if (code.length < 6) { setError(tr('enter_complete')); return; }

        setLoading(true);
        const { ok, status, data } = await api('/mock-api/admin/auth/2fa/verify', { code, method });
        setLoading(false);

        if (!ok) {
            if (status === 410) {
                setMessage({ type: 'warning', text: data.message || 'Code expired.' });
            } else {
                setError(data.errors?.code?.[0] || data.message || tr('invalid_code'));
                if (data.attempts_remaining !== undefined) setAttemptsLeft(data.attempts_remaining);
            }
            setCode('');
            return;
        }

        setMessage({ type: 'success', text: 'Admin access granted. Redirecting...' });
        setTimeout(() => router.visit(data.redirect || '/admin/dashboard'), 800);
    }, [code, method, tr]);

    /**
     * Verify backup code via API.
     */
    const handleBackupVerify = useCallback(async () => {
        clearState();
        if (backupCode.length !== 8) { setError('Backup code must be 8 characters.'); return; }

        setLoading(true);
        const { ok, data } = await api('/mock-api/admin/auth/2fa/backup', { code: backupCode });
        setLoading(false);

        if (!ok) {
            setError(data.errors?.code?.[0] || data.message || 'Invalid backup code.');
            setBackupCode('');
            return;
        }

        setMessage({ type: 'success', text: 'Backup code accepted. Redirecting...' });
        setTimeout(() => router.visit(data.redirect || '/admin/dashboard'), 800);
    }, [backupCode]);

    /**
     * Resend code via selected method.
     */
    const handleResend = useCallback(async () => {
        setResending(true);
        setMessage(null);
        const { ok, data } = await api('/mock-api/admin/auth/2fa/resend', { method });
        setResending(false);

        if (ok) {
            setMessage({ type: 'success', text: data.message || 'Code resent.' });
            setCountdown(data.cooldown || 60);
            setCode('');
        } else {
            if (data.code === 'NO_SESSION') {
                setMessage({ type: 'error', text: 'Session expired. Please login again.' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to resend.' });
            }
        }
    }, [method]);

    /**
     * Switch 2FA method.
     */
    const handleMethodSwitch = (m: string) => {
        setMethod(m);
        setCode('');
        clearState();
        if (m !== 'app') {
            handleResendForMethod(m);
        }
    };

    const handleResendForMethod = async (m: string) => {
        setResending(true);
        const { ok, data } = await api('/mock-api/admin/auth/2fa/resend', { method: m });
        setResending(false);
        if (ok) {
            setMessage({ type: 'success', text: data.message || `Code sent via ${m}.` });
            setCountdown(data.cooldown || 60);
        }
    };

    return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><Logo /></div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: accentRed, boxShadow: '0 0 6px rgba(239,68,68,0.4)' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: accentRed, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>{tr('badge')}</span>
                </div>
                <SecurityBadge text="Admin Verification" />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '14px 0 6px' }}>{tr('title')}</h2>
                <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0, lineHeight: 1.5 }}>{tr('subtitle')}</p>
            </div>

            {message && <AlertBox type={message.type}>{message.type === 'error' ? '⚠' : message.type === 'warning' ? '🔒' : '✓'} {message.text}</AlertBox>}
            {attemptsLeft !== null && attemptsLeft <= 1 && <AlertBox type="warning">⚠ {attemptsLeft} attempt remaining before lockout</AlertBox>}

            {/* ═══ OTP Mode ═══ */}
            {mode === 'otp' && <>
                <MethodSelector methods={methods} selected={method} onSelect={handleMethodSwitch} />

                <p style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 22, lineHeight: 1.6 }}>
                    {descriptions[method]}
                </p>

                {error && <AlertBox type="error"><span>⚠</span> {error}</AlertBox>}

                <OtpInput length={6} value={code} onChange={v => { setCode(v); if (error) setError(''); }} />

                <div style={{ marginTop: 22 }}>
                    <Button onClick={handleVerify} loading={loading} disabled={code.length < 6}
                        style={{ background: accentRed, borderColor: accentRed }}>
                        {Icons.shield(14)} {tr('submit')}
                    </Button>
                </div>

                {method !== 'app' && <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button onClick={handleResend} disabled={countdown > 0 || resending} style={{
                        background: 'none', border: 'none', fontFamily: 'inherit',
                        color: countdown > 0 || resending ? theme.textDim : accentRed,
                        fontSize: 12, cursor: countdown > 0 || resending ? 'default' : 'pointer',
                    }}>
                        {resending ? '⏳ Sending...' : countdown > 0 ? tr('resend_in', { seconds: String(countdown) }) : tr('resend')}
                    </button>
                </div>}
            </>}

            {/* ═══ Backup Code Mode ═══ */}
            {mode === 'backup' && <>
                <p style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 16, lineHeight: 1.6 }}>
                    Enter one of your 8-character backup recovery codes. Each code can only be used once.
                </p>

                {error && <AlertBox type="error"><span>⚠</span> {error}</AlertBox>}

                <div style={{ marginBottom: 20 }}>
                    <input value={backupCode} onChange={e => { setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)); if (error) setError(''); }}
                        placeholder="e.g. A7K2M9X4" maxLength={8}
                        onKeyDown={e => e.key === 'Enter' && backupCode.length === 8 && handleBackupVerify()}
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 8, border: `2px solid ${error ? accentRed : backupCode.length === 8 ? accentRed : theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", textAlign: 'center', letterSpacing: '0.15em', outline: 'none' }}
                        autoFocus
                    />
                    <div style={{ fontSize: 10, color: theme.textDim, textAlign: 'center', marginTop: 6 }}>{backupCode.length}/8 characters</div>
                </div>

                <Button onClick={handleBackupVerify} loading={loading} disabled={backupCode.length !== 8}
                    style={{ background: accentRed, borderColor: accentRed }}>
                    🔑 Verify Backup Code
                </Button>

                <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: `${accentRed}06`, border: `1px solid ${accentRed}12`, fontSize: 10, color: theme.textDim, textAlign: 'center', lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 700, color: accentRed }}>Mock:</span> Any 8 alphanumeric chars work. <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>XXXXXXXX</span> = invalid.
                </div>
            </>}

            <Divider />

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', fontSize: 12 }}>
                <a href="/admin/login" onClick={e => { e.preventDefault(); router.visit('/admin/login'); }}
                    style={{ color: theme.textSecondary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {Icons.arrowLeft(12)} {tr('back_login')}
                </a>
                <span style={{ color: theme.border }}>|</span>
                <button onClick={() => { setMode(mode === 'otp' ? 'backup' : 'otp'); clearState(); setCode(''); setBackupCode(''); }} style={{ background: 'none', border: 'none', color: mode === 'backup' ? accentRed : theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {mode === 'otp' ? tr('backup_code') : '🔢 Use verification code'}
                </button>
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.border}`, textAlign: 'center', fontSize: 9, fontWeight: 700, color: accentRed, letterSpacing: '0.08em' }}>
                ADMIN PANEL — RESTRICTED ACCESS
            </div>
        </Card>
    );
}

AdminTwoFactor.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
export default AdminTwoFactor;
