import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthLayout from '../../layouts/AuthLayout';
import Logo from '../../components/auth/Logo';
import { Card, Input, Button, SecurityBadge, Divider, AlertBox, Icons } from '../../components/ui';
import { t } from '../../i18n';
import { theme } from '../../lib/theme';
import type { SharedProps } from '../../types/shared';

export default function AdminLogin() {
    const { locale, flash } = usePage<SharedProps>().props;
    const lang = locale?.current || 'en';
    const tr = (key: string) => t(`admin_login.${key}`, lang);
    const tc = (key: string) => t(`common.${key}`, lang);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (!email || !password) { setError(tr('all_fields_required')); return; }
        setError('');
        setLoading(true);
        router.post('/admin/login', { email, password, remember }, {
            onFinish: () => setLoading(false),
            onError: (errors) => {
                setError(Object.values(errors).flat().join(' '));
            },
        });
    };

    return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
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

                <SecurityBadge text={tc('secure_auth')} />

                <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '16px 0 6px', letterSpacing: '0.02em' }}>
                    {tr('title')}
                </h2>
                <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0, lineHeight: 1.5 }}>
                    {tr('subtitle')}
                </p>
            </div>

            {(error || flash?.error) && (
                <AlertBox type="error">
                    <span>⚠</span> {error || flash.error}
                </AlertBox>
            )}

            {flash?.success && (
                <AlertBox type="success">
                    {flash.success}
                </AlertBox>
            )}

            <Input label={tr('email_label')} type="email" placeholder={tr('email_placeholder')}
                value={email} onChange={e => setEmail(e.target.value)} icon={Icons.mail()} autoComplete="email" />

            <Input label={tr('password_label')} type="password" placeholder={tr('password_placeholder')}
                value={password} onChange={e => setPassword(e.target.value)} icon={Icons.lock()}
                autoComplete="current-password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, marginTop: -4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: theme.textSecondary }}>
                    <div onClick={() => setRemember(!remember)} style={{
                        width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: remember ? '#ef4444' : 'transparent', border: `1.5px solid ${remember ? '#ef4444' : theme.border}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        {remember && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
                    </div>
                    {tr('remember')}
                </label>
                <a href="/forgot-password" onClick={e => { e.preventDefault(); router.visit('/forgot-password'); }}
                    style={{ color: '#ef4444', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>
                    {tr('forgot')}
                </a>
            </div>

            <Button onClick={handleLogin} loading={loading} disabled={!email || !password}
                style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                {Icons.lock(14)} {tr('submit')}
            </Button>

            <Divider text={tc('or')} />

            <Button variant="secondary" onClick={() => {}}>
                {Icons.key(14)} Hardware Security Key
            </Button>

            <div style={{ textAlign: 'center', marginTop: 26, fontSize: 12, color: theme.textSecondary }}>
                <a href="/login" onClick={e => { e.preventDefault(); router.visit('/login'); }}
                    style={{ color: theme.accent, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {Icons.arrowLeft(12)} {tr('back_operator')}
                </a>
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

AdminLogin.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
