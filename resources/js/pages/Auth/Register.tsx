import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthLayout from '../../layouts/AuthLayout';
import Logo from '../../components/auth/Logo';
import { Card, Input, Button, SecurityBadge, PasswordStrength, CheckItem, ProgressSteps, AlertBox, Icons } from '../../components/ui';
import { t } from '../../i18n';
import { theme } from '../../lib/theme';
import type { SharedProps } from '../../types/shared';

export default function Register() {
    const { locale } = usePage<SharedProps>().props;
    const lang = locale?.current || 'en';
    const tr = (key: string) => t(`register.${key}`, lang);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        password: '', confirm: '',
    });
    const [agreed, setAgreed] = useState(false);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [k]: e.target.value });

    const pw = form.password;

    const handleSubmit = () => {
        setLoading(true);
        router.post('/register', {
            first_name: form.firstName,
            last_name: form.lastName,
            email: form.email,
            phone: form.phone,
            password: form.password,
            password_confirmation: form.confirm,
            agree_terms: agreed,
        }, {
            onFinish: () => setLoading(false),
            onSuccess: () => setStep(3),
            onError: () => setLoading(false),
        });
    };

    // Success state
    if (step === 3) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{
                        width: 68, height: 68, borderRadius: '50%', background: theme.successDim,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 22px', color: theme.success,
                    }}>
                        {Icons.checkCircle(34)}
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '0 0 10px' }}>
                        {tr('success_title')}
                    </h2>
                    <p style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6, margin: '0 0 8px' }}>
                        {tr('success_message')}
                    </p>
                    <AlertBox type="warning">
                        {tr('success_notice')}
                    </AlertBox>
                    <Button onClick={() => router.visit('/login')} style={{ marginTop: 8 }}>
                        {tr('return_login')}
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card width={460}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                    <Logo />
                </div>
                <SecurityBadge text={tr('badge')} />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '14px 0 6px' }}>
                    {tr('title')}
                </h2>
                <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0 }}>
                    {tr('subtitle')}
                </p>
            </div>

            <ProgressSteps current={step} total={2} />

            {step === 1 && (
                <>
                    <Input label={tr('first_name_label')} placeholder={tr('first_name_placeholder')}
                        value={form.firstName} onChange={set('firstName')} icon={Icons.user()} />

                    <Input label={tr('last_name_label')} placeholder={tr('last_name_placeholder')}
                        value={form.lastName} onChange={set('lastName')} icon={Icons.user()} />

                    <Input label={tr('email_label')} type="email" placeholder={tr('email_placeholder')}
                        value={form.email} onChange={set('email')} icon={Icons.mail()} />

                    <Input label={tr('phone_label')} type="tel" placeholder={tr('phone_placeholder')}
                        value={form.phone} onChange={set('phone')} icon={Icons.phone()} />

                    <Button onClick={() => setStep(2)}
                        disabled={!form.firstName || !form.lastName || !form.email}>
                        {tr('continue')}
                    </Button>
                </>
            )}

            {step === 2 && (
                <>
                    <Input label={tr('password_label')} type="password" placeholder={tr('password_placeholder')}
                        value={form.password} onChange={set('password')} icon={Icons.lock()} />

                    <PasswordStrength password={pw} t={tr} />

                    <div style={{ marginBottom: 16 }}>
                        <CheckItem checked={pw.length >= 12} text={tr('pw_12_chars')} />
                        <CheckItem checked={/[A-Z]/.test(pw)} text={tr('pw_uppercase')} />
                        <CheckItem checked={/[a-z]/.test(pw)} text={tr('pw_lowercase')} />
                        <CheckItem checked={/[0-9]/.test(pw)} text={tr('pw_number')} />
                        <CheckItem checked={/[^A-Za-z0-9]/.test(pw)} text={tr('pw_special')} />
                    </div>

                    <Input label={tr('confirm_label')} type="password" placeholder={tr('confirm_placeholder')}
                        value={form.confirm} onChange={set('confirm')} icon={Icons.lock()}
                        error={form.confirm && form.password !== form.confirm ? tr('passwords_mismatch') : ''} />

                    <div style={{ marginBottom: 22 }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>
                            <div onClick={() => setAgreed(!agreed)} style={{
                                width: 16, height: 16, minWidth: 16, borderRadius: 4, marginTop: 2,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                background: agreed ? theme.accent : 'transparent',
                                border: `1.5px solid ${agreed ? theme.accent : theme.border}`, transition: 'all 0.2s',
                            }}>
                                {agreed && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
                            </div>
                            {tr('agree_terms')}
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: '0 0 auto', width: 'auto', padding: '11px 18px' }}>
                            {Icons.arrowLeft(14)} {tr('back')}
                        </Button>
                        <Button onClick={handleSubmit} loading={loading}
                            disabled={!form.password || form.password !== form.confirm || !agreed || pw.length < 12}>
                            {tr('submit')}
                        </Button>
                    </div>
                </>
            )}

            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: theme.textSecondary }}>
                {tr('already_access')}{' '}
                <a href="/login" onClick={e => { e.preventDefault(); router.visit('/login'); }}
                    style={{ color: theme.accent, fontWeight: 600, textDecoration: 'none' }}>
                    {tr('sign_in')}
                </a>
            </div>
        </Card>
    );
}

Register.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
