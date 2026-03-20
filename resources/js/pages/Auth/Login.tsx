import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthLayout from '../../layouts/AuthLayout';
import Logo from '../../components/auth/Logo';
import { Card, Input, Button, SecurityBadge, Divider, AlertBox, Icons } from '../../components/ui';
import { t } from '../../i18n';
import { theme } from '../../lib/theme';
import type { SharedProps } from '../../types/shared';

export default function Login() {
    const { locale, flash } = usePage<SharedProps>().props;
    const lang = locale?.current || 'en';
    const tr = (key: string) => t(`login.${key}`, lang);
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
        router.post('/login', { email, password, remember }, {
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
                        background: remember ? theme.accent : 'transparent', border: `1.5px solid ${remember ? theme.accent : theme.border}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        {remember && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
                    </div>
                    {tr('remember')}
                </label>
                <a href="/forgot-password" onClick={e => { e.preventDefault(); router.visit('/forgot-password'); }}
                    style={{ color: theme.accent, fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>
                    {tr('forgot')}
                </a>
            </div>

            <Button onClick={handleLogin} loading={loading} disabled={!email || !password}>
                {Icons.lock(14)} {tr('submit')}
            </Button>

            <Divider text={tc('or')} />

            <Button variant="secondary" onClick={() => {}}>
                {Icons.key(14)} {tr('hardware_key')}
            </Button>

            <div style={{ textAlign: 'center', marginTop: 26, fontSize: 12, color: theme.textSecondary }}>
                {tr('no_account')}{' '}
                <a href="/register" onClick={e => { e.preventDefault(); router.visit('/register'); }}
                    style={{ color: theme.accent, fontWeight: 600, textDecoration: 'none' }}>
                    {tr('request_access')}
                </a>
            </div>
        </Card>
    );
}

Login.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
