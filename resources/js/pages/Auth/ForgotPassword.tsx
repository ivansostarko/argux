import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthLayout from '../../layouts/AuthLayout';
import Logo from '../../components/auth/Logo';
import { Card, Input, Button, SecurityBadge, PasswordStrength, ProgressSteps, OtpInput, AlertBox, Icons } from '../../components/ui';
import { t } from '../../i18n';
import { theme } from '../../lib/theme';
import type { SharedProps } from '../../types/shared';

export default function ForgotPassword() {
    const { locale } = usePage<SharedProps>().props;
    const lang = locale?.current || 'en';
    const tr = (key: string, params?: Record<string, string>) => t(`forgot.${key}`, lang, params);
    const trReg = (key: string) => t(`register.${key}`, lang);

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = () => {
        setLoading(true);
        router.post('/forgot-password', { email }, {
            preserveState: true,
            onSuccess: () => { setStep(2); setLoading(false); },
            onFinish: () => setLoading(false),
        });
    };

    const handleVerify = () => {
        setLoading(true);
        router.post('/forgot-password/verify', { code }, {
            preserveState: true,
            onSuccess: () => { setStep(3); setLoading(false); },
            onFinish: () => setLoading(false),
        });
    };

    const handleReset = () => {
        setLoading(true);
        router.post('/forgot-password/reset', {
            email, code, password, password_confirmation: confirm,
        }, {
            preserveState: true,
            onSuccess: () => { setStep(4); setLoading(false); },
            onFinish: () => setLoading(false),
        });
    };

    return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                    <Logo />
                </div>
                <SecurityBadge text={tr('badge')} />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '14px 0 6px' }}>
                    {step === 4 ? tr('title_complete') : tr('title')}
                </h2>
            </div>

            <ProgressSteps current={step} total={4} color={step === 4 ? theme.success : undefined} />

            {/* Step 1: Enter email */}
            {step === 1 && (
                <>
                    <p style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 22, lineHeight: 1.6 }}>
                        {tr('step1_desc')}
                    </p>
                    <Input label={tr('email_label')} type="email" placeholder={tr('email_placeholder')}
                        value={email} onChange={e => setEmail(e.target.value)} icon={Icons.mail()}
                        onKeyDown={e => e.key === 'Enter' && email && handleSend()} />
                    <Button onClick={handleSend} loading={loading} disabled={!email}>
                        {tr('send_code')}
                    </Button>
                </>
            )}

            {/* Step 2: Enter code */}
            {step === 2 && (
                <>
                    <AlertBox type="info">
                        {tr('code_sent', { email })}
                    </AlertBox>
                    <p style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginBottom: 22 }}>
                        {tr('enter_code')}
                    </p>
                    <OtpInput length={6} value={code} onChange={setCode} />
                    <div style={{ marginTop: 22 }}>
                        <Button onClick={handleVerify} loading={loading} disabled={code.length < 6}>
                            {tr('verify_code')}
                        </Button>
                    </div>
                </>
            )}

            {/* Step 3: New password */}
            {step === 3 && (
                <>
                    <Input label={tr('new_pw_label')} type="password" placeholder={tr('new_pw_placeholder')}
                        value={password} onChange={e => setPassword(e.target.value)} icon={Icons.lock()} />
                    <PasswordStrength password={password} t={trReg} />
                    <Input label={tr('confirm_pw_label')} type="password" placeholder={tr('confirm_pw_placeholder')}
                        value={confirm} onChange={e => setConfirm(e.target.value)} icon={Icons.lock()}
                        error={confirm && password !== confirm ? trReg('passwords_mismatch') : ''} />
                    <Button onClick={handleReset} loading={loading}
                        disabled={!password || password.length < 12 || password !== confirm}>
                        {tr('reset_password')}
                    </Button>
                </>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
                <div style={{ textAlign: 'center' }}>
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
                </div>
            )}

            {/* Back navigation */}
            {step < 4 && (
                <div style={{ textAlign: 'center', marginTop: 22 }}>
                    <button onClick={() => step === 1 ? router.visit('/login') : setStep(step - 1)} style={{
                        background: 'none', border: 'none', color: theme.textSecondary, fontSize: 12,
                        cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                        {Icons.arrowLeft(12)} {step === 1 ? tr('back_login') : tr('previous_step')}
                    </button>
                </div>
            )}
        </Card>
    );
}

ForgotPassword.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
