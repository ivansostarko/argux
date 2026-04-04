import { useState, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthLayout from '../../layouts/AuthLayout';
import Logo from '../../components/auth/Logo';
import { Card, Input, Button, SecurityBadge, PasswordStrength, CheckItem, ProgressSteps, AlertBox, Icons } from '../../components/ui';
import { t } from '../../i18n';
import { theme } from '../../lib/theme';
import type { SharedProps } from '../../types/shared';

/**
 * ARGUX Register Page — 3-step registration via mock REST API.
 *
 * Step 1: Personal info (name + email with availability check)
 * Step 2: Password + terms agreement
 * Step 3: Success confirmation
 *
 * Mock API Endpoints:
 * POST /mock-api/auth/register    — Submit registration
 * POST /mock-api/auth/check-email — Real-time email availability check
 *
 * Mock behavior:
 * - Existing mock emails (operator@, analyst@, etc.) → EMAIL_TAKEN
 * - Disposable domains (tempmail.com, etc.) → DISPOSABLE_EMAIL
 * - Approved domains (argux.mil, agency.gov, etc.) → green badge
 * - Password: min 12 chars, uppercase, lowercase, number, special char
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
        return { ok: false, status: 0, data: { message: 'Network error. Check your connection.' } };
    }
}

function Register() {
    const { locale } = usePage<SharedProps>().props;
    const lang = locale?.current || 'en';
    const tr = (key: string) => t(`register.${key}`, lang);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' });
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<{ type: 'error' | 'success' | 'warning' | 'info'; text: string } | null>(null);
    const [emailStatus, setEmailStatus] = useState<{ available?: boolean; approved?: boolean; message?: string } | null>(null);
    const [regResult, setRegResult] = useState<{ id: string; name: string; email: string; time: string } | null>(null);
    const emailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setForm(prev => ({ ...prev, [k]: val }));
        if (errors[k]) setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
        if (k === 'email' && val.includes('@')) {
            if (emailTimer.current) clearTimeout(emailTimer.current);
            emailTimer.current = setTimeout(() => checkEmail(val), 500);
        }
        if (k === 'email' && !val.includes('@')) setEmailStatus(null);
    };

    const pw = form.password;
    const clearState = () => { setErrors({}); setMessage(null); };

    /**
     * Check email availability (debounced).
     */
    const checkEmail = useCallback(async (email: string) => {
        if (!email || !email.includes('@')) return;
        const { ok, data } = await api('/mock-api/auth/check-email', { email });
        if (ok) {
            setEmailStatus({ available: data.available, approved: data.approved_domain, message: data.message });
            if (data.exists) setErrors(prev => ({ ...prev, email: data.message }));
            else if (data.disposable) setErrors(prev => ({ ...prev, email: data.message }));
            else if (errors.email) setErrors(prev => { const n = { ...prev }; delete n.email; return n; });
        }
    }, [errors.email]);

    /**
     * Step 1 → Step 2: Validate personal info.
     */
    const goStep2 = () => {
        clearState();
        const e: Record<string, string> = {};
        if (!form.firstName.trim()) e.firstName = 'First name is required.';
        if (!form.lastName.trim()) e.lastName = 'Last name is required.';
        if (!form.email.trim()) e.email = 'Email is required.';
        else if (!form.email.includes('@')) e.email = 'Enter a valid email address.';
        if (emailStatus && !emailStatus.available) e.email = emailStatus.message || 'Email unavailable.';
        if (Object.keys(e).length) { setErrors(e); return; }
        setStep(2);
    };

    /**
     * Submit registration via mock REST API.
     */
    const handleSubmit = useCallback(async () => {
        clearState();
        setLoading(true);

        const { ok, data } = await api('/mock-api/auth/register', {
            first_name: form.firstName,
            last_name: form.lastName,
            email: form.email,
            phone: form.phone,
            password: form.password,
            password_confirmation: form.confirm,
            agree_terms: agreed,
        });

        setLoading(false);

        if (!ok) {
            if (data.errors) {
                const first: Record<string, string> = {};
                for (const [k, v] of Object.entries(data.errors)) {
                    const key = k === 'first_name' ? 'firstName' : k === 'last_name' ? 'lastName' : k === 'password_confirmation' ? 'confirm' : k === 'agree_terms' ? 'terms' : k;
                    first[key] = (v as string[])[0];
                }
                setErrors(first);
                if (first.firstName || first.lastName || first.email || first.phone) setStep(1);
            }
            if (data.code === 'EMAIL_TAKEN' || data.code === 'DISPOSABLE_EMAIL') {
                setStep(1);
            }
            setMessage({ type: 'error', text: data.message || 'Registration failed.' });
            return;
        }

        setRegResult({
            id: data.registration_id,
            name: data.submitted?.name || '',
            email: data.submitted?.email || '',
            time: data.submitted?.submitted_at || '',
        });
        setStep(3);
    }, [form, agreed]);

    // ═══ Step 3: Success ═══
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
                    {regResult && <div style={{ padding: '10px 14px', borderRadius: 8, background: `${theme.accent}06`, border: `1px solid ${theme.accent}15`, fontSize: 11, color: theme.textDim, marginBottom: 12, textAlign: 'left' }}>
                        <div>Registration ID: <span style={{ fontFamily: "'JetBrains Mono',monospace", color: theme.text }}>{regResult.id}</span></div>
                        <div>Name: <span style={{ color: theme.text }}>{regResult.name}</span></div>
                        <div>Email: <span style={{ color: theme.text }}>{regResult.email}</span></div>
                    </div>}
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
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><Logo /></div>
                <SecurityBadge text={tr('badge')} />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '14px 0 6px' }}>{tr('title')}</h2>
                <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0 }}>{tr('subtitle')}</p>
            </div>

            <ProgressSteps current={step} total={2} />

            {message && <AlertBox type={message.type}>{message.type === 'error' ? '⚠' : '✓'} {message.text}</AlertBox>}

            {/* ═══ Step 1: Personal Info ═══ */}
            {step === 1 && <>
                <Input label={tr('first_name_label')} placeholder={tr('first_name_placeholder')}
                    value={form.firstName} onChange={set('firstName')} icon={Icons.user()} error={errors.firstName} />

                <Input label={tr('last_name_label')} placeholder={tr('last_name_placeholder')}
                    value={form.lastName} onChange={set('lastName')} icon={Icons.user()} error={errors.lastName} />

                <div style={{ position: 'relative' }}>
                    <Input label={tr('email_label')} type="email" placeholder={tr('email_placeholder')}
                        value={form.email} onChange={set('email')} icon={Icons.mail()} error={errors.email} />
                    {emailStatus && !errors.email && <div style={{ fontSize: 10, marginTop: -10, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {emailStatus.available ? <span style={{ color: '#22c55e' }}>✓ {emailStatus.approved ? 'Approved domain' : 'Available'}</span>
                            : <span style={{ color: '#ef4444' }}>✕ {emailStatus.message}</span>}
                    </div>}
                </div>

                <Input label={tr('phone_label')} type="tel" placeholder={tr('phone_placeholder')}
                    value={form.phone} onChange={set('phone')} icon={Icons.phone ? Icons.phone() : <span style={{ fontSize: 13 }}>📱</span>} error={errors.phone} />

                <Button onClick={goStep2} disabled={!form.firstName || !form.lastName || !form.email}>
                    {tr('continue')}
                </Button>
            </>}

            {/* ═══ Step 2: Security ═══ */}
            {step === 2 && <>
                <Input label={tr('password_label')} type="password" placeholder={tr('password_placeholder')}
                    value={form.password} onChange={set('password')} icon={Icons.lock()} error={errors.password} />

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
                    error={errors.confirm || (form.confirm && form.password !== form.confirm ? tr('passwords_mismatch') : '')} />

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
                    {errors.terms && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, marginLeft: 26 }}>{errors.terms}</div>}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="secondary" onClick={() => { setStep(1); clearState(); }} style={{ flex: '0 0 auto', width: 'auto', padding: '11px 18px' }}>
                        {Icons.arrowLeft(14)} {tr('back')}
                    </Button>
                    <Button onClick={handleSubmit} loading={loading}
                        disabled={!form.password || form.password !== form.confirm || !agreed || pw.length < 12
                            || !/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw)}>
                        {tr('submit')}
                    </Button>
                </div>
            </>}

            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: theme.textSecondary }}>
                {tr('already_access')}{' '}
                <a href="/login" onClick={e => { e.preventDefault(); router.visit('/login'); }}
                    style={{ color: theme.accent, fontWeight: 600, textDecoration: 'none' }}>{tr('sign_in')}</a>
            </div>
        </Card>
    );
}

Register.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
export default Register;
