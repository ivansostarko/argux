import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthLayout from '../../layouts/AuthLayout';
import Logo from '../../components/auth/Logo';
import { Card, Button, SecurityBadge, Divider, MethodSelector, OtpInput, AlertBox, Icons } from '../../components/ui';
import { t } from '../../i18n';
import { theme } from '../../lib/theme';
import type { TwoFactorProps } from '../../types/shared';

export default function AdminTwoFactor() {
    const { locale, flash } = usePage<TwoFactorProps>().props;
    const lang = locale?.current || 'en';
    const tr = (key: string, params?: Record<string, string>) => t(`admin_2fa.${key}`, lang, params);

    const [method, setMethod] = useState('app');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [resent, setResent] = useState(false);

    const methods = [
        { id: 'app', label: tr('method_app'), icon: Icons.shield(22) },
        { id: 'sms', label: tr('method_sms'), icon: Icons.phone(22) },
        { id: 'email', label: tr('method_email'), icon: Icons.mail(22) },
    ];

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleVerify = () => {
        if (code.length < 6) { setError(tr('enter_complete')); return; }
        setError('');
        setLoading(true);
        router.post('/admin/2fa', { code, method }, {
            onFinish: () => setLoading(false),
            onError: (errors) => {
                setError(errors.code || tr('invalid_code'));
                setCode('');
            },
        });
    };

    const handleResend = () => {
        setResent(true);
        setCountdown(30);
        router.post('/admin/2fa/resend', { method }, { preserveState: true });
        setTimeout(() => setResent(false), 3000);
    };

    const descriptions: Record<string, string> = {
        app: tr('desc_app'),
        sms: tr('desc_sms'),
        email: tr('desc_email'),
    };

    return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                    <Logo />
                </div>

                {/* Admin badge - red accent */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px', borderRadius: 20,
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    marginBottom: 8,
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.4)' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
                        {tr('badge')}
                    </span>
                </div>

                <SecurityBadge text="Admin Verification" />

                <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '14px 0 6px' }}>
                    {tr('title')}
                </h2>
                <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0, lineHeight: 1.5 }}>
                    {tr('subtitle')}
                </p>
            </div>

            <MethodSelector methods={methods} selected={method} onSelect={m => { setMethod(m); setCode(''); setError(''); }} />

            <p style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 22, lineHeight: 1.6 }}>
                {descriptions[method]}
            </p>

            {error && <AlertBox type="error"><span>⚠</span> {error}</AlertBox>}
            {flash?.success && <AlertBox type="success">{flash.success}</AlertBox>}

            <OtpInput length={6} value={code} onChange={setCode} />

            <div style={{ marginTop: 22 }}>
                <Button onClick={handleVerify} loading={loading} disabled={code.length < 6}
                    style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                    {Icons.shield(14)} {tr('submit')}
                </Button>
            </div>

            {method !== 'app' && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button onClick={handleResend} disabled={countdown > 0} style={{
                        background: 'none', border: 'none', fontFamily: 'inherit',
                        color: countdown > 0 ? theme.textDim : '#ef4444',
                        fontSize: 12, cursor: countdown > 0 ? 'default' : 'pointer',
                    }}>
                        {resent ? tr('resent') : countdown > 0 ? tr('resend_in', { seconds: String(countdown) }) : tr('resend')}
                    </button>
                </div>
            )}

            <Divider />

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', fontSize: 12 }}>
                <a href="/admin/login" onClick={e => { e.preventDefault(); router.visit('/admin/login'); }}
                    style={{ color: theme.textSecondary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {Icons.arrowLeft(12)} {tr('back_login')}
                </a>
                <span style={{ color: theme.border }}>|</span>
                <button onClick={() => {}} style={{ background: 'none', border: 'none', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {tr('backup_code')}
                </button>
            </div>

            {/* Classification footer */}
            <div style={{
                marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.border}`,
                textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#ef4444',
                letterSpacing: '0.08em',
            }}>
                ADMIN PANEL — RESTRICTED ACCESS
            </div>
        </Card>
    );
}

AdminTwoFactor.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
