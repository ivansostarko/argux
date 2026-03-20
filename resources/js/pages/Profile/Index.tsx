import { useState, useEffect } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { Input, Button, Toggle, Skeleton, SkeletonRow, Icons } from '../../components/ui';
import { theme } from '../../lib/theme';

/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */
type Tab = 'personal' | 'password' | 'security' | 'audit';

interface AuditEntry {
    id: number;
    time: string;
    action: string;
    details: string;
    ip: string;
}

interface Session {
    id: string;
    device: string;
    browser: string;
    ip: string;
    location: string;
    lastActive: string;
    current: boolean;
    trusted: boolean;
}

/* ═══════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════ */
const timezones = [
    'UTC', 'Europe/Zagreb', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Rome',
    'Europe/Moscow', 'Asia/Dubai', 'Asia/Riyadh', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo',
    'Asia/Seoul', 'Asia/Singapore', 'Australia/Sydney', 'Pacific/Auckland',
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Sao_Paulo', 'Africa/Cairo', 'Africa/Johannesburg',
];

const mockSessions: Session[] = [
    { id: 's1', device: 'MacBook Pro 16"', browser: 'Chrome 122.0', ip: '185.23.45.67', location: 'Zagreb, HR', lastActive: 'Now', current: true, trusted: true },
    { id: 's2', device: 'iPhone 15 Pro', browser: 'Safari 17.3', ip: '185.23.45.68', location: 'Zagreb, HR', lastActive: '12m ago', current: false, trusted: true },
    { id: 's3', device: 'Windows Desktop', browser: 'Firefox 124.0', ip: '91.207.12.34', location: 'Split, HR', lastActive: '2h ago', current: false, trusted: false },
    { id: 's4', device: 'iPad Air', browser: 'Safari 17.2', ip: '185.23.45.69', location: 'Zagreb, HR', lastActive: '1d ago', current: false, trusted: true },
];

const mockAuditLog: AuditEntry[] = [
    { id: 1, time: '2026-03-20 15:02:14', action: 'Login', details: 'Successful authentication via 2FA (Authenticator App)', ip: '185.23.45.67' },
    { id: 2, time: '2026-03-20 14:58:02', action: 'Failed Login', details: 'Invalid password — attempt 1 of 5', ip: '91.207.12.34' },
    { id: 3, time: '2026-03-20 12:30:00', action: 'Profile Updated', details: 'Changed timezone from UTC to Europe/Zagreb', ip: '185.23.45.67' },
    { id: 4, time: '2026-03-20 10:15:33', action: 'Password Changed', details: 'Password updated successfully, all other sessions revoked', ip: '185.23.45.67' },
    { id: 5, time: '2026-03-19 22:10:00', action: 'New Device Login', details: 'First login from Windows Desktop (Firefox 124.0)', ip: '91.207.12.34' },
    { id: 6, time: '2026-03-19 18:45:12', action: '2FA Method Changed', details: 'Switched from SMS to Authenticator App', ip: '185.23.45.67' },
    { id: 7, time: '2026-03-19 16:22:08', action: 'Session Revoked', details: 'Manually revoked session from Unknown Device', ip: '185.23.45.67' },
    { id: 8, time: '2026-03-19 09:00:44', action: 'Login', details: 'Successful authentication via 2FA (SMS)', ip: '185.23.45.68' },
    { id: 9, time: '2026-03-18 20:55:19', action: 'Backup Codes Generated', details: '8 new backup codes generated, previous codes invalidated', ip: '185.23.45.67' },
    { id: 10, time: '2026-03-18 14:30:02', action: 'API Key Created', details: 'New read-only API key generated for dashboard integration', ip: '185.23.45.67' },
    { id: 11, time: '2026-03-18 11:12:55', action: 'Login', details: 'Successful authentication via 2FA (Authenticator App)', ip: '185.23.45.67' },
    { id: 12, time: '2026-03-17 23:48:30', action: 'Failed Login', details: 'Invalid 2FA code — attempt 2 of 3', ip: '185.23.45.67' },
    { id: 13, time: '2026-03-17 16:05:18', action: 'Device Trusted', details: 'Marked iPhone 15 Pro as trusted device', ip: '185.23.45.68' },
    { id: 14, time: '2026-03-17 09:30:00', action: 'Login', details: 'Successful authentication via 2FA (Authenticator App)', ip: '185.23.45.67' },
    { id: 15, time: '2026-03-16 22:15:44', action: 'Logout', details: 'Manual logout from all devices', ip: '185.23.45.67' },
    { id: 16, time: '2026-03-16 14:20:33', action: 'Profile Updated', details: 'Updated phone number to +385 91 •••• 847', ip: '185.23.45.67' },
    { id: 17, time: '2026-03-16 08:00:12', action: 'Login', details: 'Successful authentication via 2FA (Email)', ip: '185.23.45.68' },
    { id: 18, time: '2026-03-15 19:40:27', action: 'Suspicious Activity', details: 'Rapid location change detected: Zagreb → Split in 15 minutes', ip: '91.207.12.34' },
    { id: 19, time: '2026-03-15 15:10:55', action: 'Role Updated', details: 'Promoted from Analyst to Senior Operator by admin@argux.mil', ip: '10.0.1.1' },
    { id: 20, time: '2026-03-15 10:00:00', action: 'Login', details: 'Successful authentication via 2FA (Authenticator App)', ip: '185.23.45.67' },
];

const backupCodes = ['A4K2-M9X1', 'B7J3-P2W8', 'C1L5-N6Y4', 'D8R7-Q3V9', 'E5T2-S1Z6', 'F3U8-R4X2', 'G9W1-T7K5', 'H6Y4-V2M3'];

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */
const SectionTitle = ({ children }: { children: string }) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 14, marginTop: 28, paddingBottom: 8, borderBottom: `1px solid ${theme.border}` }}>
        {children}
    </div>
);

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{label}</label>
        {children}
    </div>
);

const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', padding: '10px 14px', background: theme.bgInput, color: theme.text,
        border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit',
        outline: 'none', appearance: 'none' as const, cursor: 'pointer',
    }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
);

const StatCard = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <div style={{ background: theme.bgInput, borderRadius: 10, padding: '14px 16px', border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: color || theme.text, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    </div>
);

/* ═══════════════════════════════════════════════════
   SKELETON LOADER
   ═══════════════════════════════════════════════════ */
function ProfileSkeleton() {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                <Skeleton width={80} height={80} radius={40} />
                <div><Skeleton width={180} height={18} style={{ marginBottom: 8 }} /><Skeleton width={220} height={12} /></div>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
                {[1,2,3,4].map(i => <Skeleton key={i} width={90} height={36} radius={8} />)}
            </div>
            {[1,2,3,4].map(i => <Skeleton key={i} height={44} radius={8} style={{ marginBottom: 14 }} />)}
            <Skeleton width={140} height={40} radius={8} style={{ marginTop: 8 }} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   TAB: PERSONAL DATA
   ═══════════════════════════════════════════════════ */
function PersonalDataTab() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: 'James', lastName: 'Mitchell', email: 'j.mitchell@argux.mil',
        phone: '+385 91 234 5847', timezone: 'Europe/Zagreb',
    });
    const [avatar, setAvatar] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setAvatar(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => { setLoading(false); setSaved(true); setTimeout(() => setSaved(false), 3000); }, 1200);
    };

    return (
        <>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                        background: avatar ? 'transparent' : `linear-gradient(135deg, ${theme.accent}, #1858b8)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `3px solid ${theme.border}`,
                    }}>
                        {avatar ? (
                            <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>JM</span>
                        )}
                    </div>
                    <label style={{
                        position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%',
                        background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', border: `2px solid ${theme.bg}`,
                    }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                    </label>
                </div>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>James Mitchell</div>
                    <div style={{ fontSize: 12, color: theme.textSecondary }}>Senior Operator — Intelligence Analysis</div>
                    <div style={{ fontSize: 11, color: theme.textDim, marginTop: 2 }}>Member since March 2024</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 0, columnGap: 16 }}>
                <Input label="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} icon={Icons.user()} />
                <Input label="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} icon={Icons.user()} />
            </div>
            <Input label="Email Address" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} icon={Icons.mail()} />
            <Input label="Phone Number" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} icon={Icons.phone()} />

            <FieldGroup label="Timezone">
                <Select value={form.timezone} onChange={v => setForm({ ...form, timezone: v })} options={timezones.map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }))} />
            </FieldGroup>

            {saved && <div style={{ background: theme.successDim, border: `1px solid rgba(34,197,94,0.25)`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: theme.success, display: 'flex', alignItems: 'center', gap: 8 }}>{Icons.checkCircle(14)} Profile saved successfully.</div>}

            <Button onClick={handleSave} loading={loading} style={{ width: 'auto', padding: '11px 32px' }}>
                Save Changes
            </Button>
        </>
    );
}

/* ═══════════════════════════════════════════════════
   TAB: CHANGE PASSWORD
   ═══════════════════════════════════════════════════ */
function ChangePasswordTab() {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => { setLoading(false); setSaved(true); setForm({ current: '', newPw: '', confirm: '' }); setTimeout(() => setSaved(false), 3000); }, 1500);
    };

    const pw = form.newPw;
    const valid = form.current && pw.length >= 12 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw) && pw === form.confirm;

    return (
        <>
            <Input label="Current Password" type="password" placeholder="Enter current password" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} icon={Icons.lock()} />
            <Input label="New Password" type="password" placeholder="Minimum 12 characters" value={form.newPw} onChange={e => setForm({ ...form, newPw: e.target.value })} icon={Icons.lock()} />

            {pw && (
                <div style={{ marginTop: -8, marginBottom: 16 }}>
                    {[
                        [pw.length >= 12, 'At least 12 characters'],
                        [/[A-Z]/.test(pw), 'One uppercase letter'],
                        [/[a-z]/.test(pw), 'One lowercase letter'],
                        [/[0-9]/.test(pw), 'One number'],
                        [/[^A-Za-z0-9]/.test(pw), 'One special character'],
                    ].map(([ok, text], i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: ok ? theme.success : theme.textDim, marginBottom: 4, transition: 'color 0.2s' }}>
                            <span style={{ fontSize: 10, fontWeight: 700 }}>{ok ? '✓' : '○'}</span> {text as string}
                        </div>
                    ))}
                </div>
            )}

            <Input label="Confirm New Password" type="password" placeholder="Re-enter new password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} icon={Icons.lock()} error={form.confirm && pw !== form.confirm ? 'Passwords do not match' : ''} />

            {saved && <div style={{ background: theme.successDim, border: `1px solid rgba(34,197,94,0.25)`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: theme.success, display: 'flex', alignItems: 'center', gap: 8 }}>{Icons.checkCircle(14)} Password changed. All other sessions revoked.</div>}

            <Button onClick={handleSave} loading={loading} disabled={!valid} style={{ width: 'auto', padding: '11px 32px' }}>
                Update Password
            </Button>
        </>
    );
}

/* ═══════════════════════════════════════════════════
   TAB: SECURITY
   ═══════════════════════════════════════════════════ */
function SecurityTab() {
    const [twoFaMethod, setTwoFaMethod] = useState('app');
    const [twoFaPhone, setTwoFaPhone] = useState('+385 91 234 5847');
    const [recoveryPhone, setRecoveryPhone] = useState('+385 98 765 4321');
    const [showCodes, setShowCodes] = useState(false);
    const [codesGenerated, setCodesGenerated] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState('30');
    const [sessions, setSessions] = useState(mockSessions);

    const [authLogging, setAuthLogging] = useState(true);
    const [deviceFingerprint, setDeviceFingerprint] = useState(true);
    const [newDeviceDetect, setNewDeviceDetect] = useState(true);
    const [failedLoginNotify, setFailedLoginNotify] = useState(true);
    const [locationTracking, setLocationTracking] = useState(false);
    const [suspiciousDetect, setSuspiciousDetect] = useState(true);
    const [sessionRestoration, setSessionRestoration] = useState(false);
    const [requireTrusted, setRequireTrusted] = useState(false);

    const generateCodes = () => {
        setCodesGenerated(true);
        setShowCodes(true);
    };

    const revokeSession = (id: string) => setSessions(prev => prev.filter(s => s.id !== id));
    const toggleTrust = (id: string) => setSessions(prev => prev.map(s => s.id === id ? { ...s, trusted: !s.trusted } : s));

    // Stats
    const stats = { totalLogins: 142, failedAttempts: 7, uniqueDevices: 4, activeSessions: sessions.length };

    return (
        <>
            {/* ── 2FA ── */}
            <SectionTitle>Two-Factor Authentication</SectionTitle>

            <FieldGroup label="2FA Method">
                <Select value={twoFaMethod} onChange={setTwoFaMethod} options={[
                    { value: 'app', label: 'Authenticator App' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'email', label: 'Email' },
                ]} />
            </FieldGroup>

            {twoFaMethod === 'app' && (
                <div style={{ background: theme.bgInput, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}`, marginBottom: 18, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* QR Code mock */}
                    <div style={{ width: 140, height: 140, background: '#fff', borderRadius: 8, padding: 8, flexShrink: 0 }}>
                        <svg viewBox="0 0 100 100" width="124" height="124">
                            {/* Simplified QR pattern */}
                            {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => {
                                const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
                                const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
                                const show = isBorder || isInner;
                                return show ? <rect key={`tl${r}${c}`} x={r*4+4} y={c*4+4} width="3.5" height="3.5" fill="#000" /> : null;
                            }))}
                            {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => {
                                const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
                                const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
                                const show = isBorder || isInner;
                                return show ? <rect key={`tr${r}${c}`} x={r*4+68} y={c*4+4} width="3.5" height="3.5" fill="#000" /> : null;
                            }))}
                            {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => {
                                const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
                                const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
                                const show = isBorder || isInner;
                                return show ? <rect key={`bl${r}${c}`} x={r*4+4} y={c*4+68} width="3.5" height="3.5" fill="#000" /> : null;
                            }))}
                            {Array.from({ length: 80 }, (_, i) => {
                                const x = 36 + (i % 8) * 4;
                                const y = 36 + Math.floor(i / 8) * 4;
                                return Math.random() > 0.45 ? <rect key={`d${i}`} x={x} y={y} width="3.5" height="3.5" fill="#000" /> : null;
                            })}
                        </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>Scan with your authenticator app</div>
                        <p style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6, margin: '0 0 10px' }}>Scan this QR code with Google Authenticator, Authy, or any TOTP-compatible app.</p>
                        <div style={{ background: theme.bg, borderRadius: 6, padding: '8px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: theme.textDim, wordBreak: 'break-all' as const, border: `1px solid ${theme.border}` }}>
                            otpauth://totp/ARGUX:j.mitchell?secret=JBSWY3DPEHPK3PXP&issuer=ARGUX
                        </div>
                    </div>
                </div>
            )}

            <Input label="2FA Phone Number" type="tel" value={twoFaPhone} onChange={e => setTwoFaPhone(e.target.value)} icon={Icons.phone()} />
            <Input label="Recovery Phone" type="tel" value={recoveryPhone} onChange={e => setRecoveryPhone(e.target.value)} icon={Icons.phone()} />

            {/* Backup Codes */}
            <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: theme.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Backup Codes</label>
                    <Button variant="secondary" onClick={generateCodes} style={{ width: 'auto', padding: '6px 14px', fontSize: 11 }}>
                        {codesGenerated ? 'Regenerate' : 'Generate Backup Codes'}
                    </Button>
                </div>
                {showCodes && (
                    <div style={{ background: theme.bgInput, borderRadius: 10, padding: 16, border: `1px solid ${theme.border}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
                        {backupCodes.map(code => (
                            <div key={code} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.text, padding: '6px 10px', background: theme.bg, borderRadius: 6, textAlign: 'center' as const, border: `1px solid ${theme.border}` }}>{code}</div>
                        ))}
                        <div style={{ gridColumn: '1 / -1', fontSize: 11, color: theme.warning, marginTop: 4 }}>⚠ Store these codes in a secure location. Each code can only be used once.</div>
                    </div>
                )}
            </div>

            {/* Physical Keys */}
            <div style={{ background: theme.bgInput, borderRadius: 10, padding: 16, border: `1px solid ${theme.border}`, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Physical Security Keys</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>No hardware keys registered. Add a FIDO2/WebAuthn key for phishing-resistant authentication.</div>
                </div>
                <Button variant="secondary" onClick={() => {}} style={{ width: 'auto', padding: '6px 14px', fontSize: 11, flexShrink: 0 }}>Register Key</Button>
            </div>

            {/* ── Session ── */}
            <SectionTitle>Session Management</SectionTitle>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 18 }}>
                <div>
                    <FieldGroup label="Session Timeout">
                        <Select value={sessionTimeout} onChange={setSessionTimeout} options={[
                            { value: '15', label: '15 minutes' }, { value: '30', label: '30 minutes' },
                            { value: '60', label: '1 hour' }, { value: '120', label: '2 hours' },
                            { value: '480', label: '8 hours' }, { value: '1440', label: '24 hours' },
                        ]} />
                    </FieldGroup>
                </div>
                <div style={{ paddingTop: 4 }}>
                    <Toggle checked={sessionRestoration} onChange={setSessionRestoration} label="Session Restoration Prevention" description="Prevent session token reuse after logout" />
                </div>
            </div>

            {/* Active sessions */}
            <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Active Sessions ({sessions.length})</span>
                    <Button variant="danger" onClick={() => setSessions(prev => prev.filter(s => s.current))} style={{ width: 'auto', padding: '6px 14px', fontSize: 11 }}>Revoke All Others</Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sessions.map(s => (
                        <div key={s.id} style={{ background: theme.bgInput, borderRadius: 10, padding: '14px 16px', border: `1px solid ${s.current ? theme.accent + '40' : theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${theme.accent}12`, border: `1px solid ${theme.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent, flexShrink: 0 }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="12" height="8" rx="1"/><line x1="5" y1="14" x2="11" y2="14"/><line x1="8" y1="11" x2="8" y2="14"/></svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {s.device}
                                        {s.current && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: theme.successDim, color: theme.success, textTransform: 'uppercase' as const }}>Current</span>}
                                        {s.trusted && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: theme.accentDim, color: theme.accent, textTransform: 'uppercase' as const }}>Trusted</span>}
                                    </div>
                                    <div style={{ fontSize: 11, color: theme.textSecondary }}>{s.browser} · {s.ip} · {s.location} · {s.lastActive}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => toggleTrust(s.id)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '5px 10px', fontSize: 10, color: theme.textSecondary, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>{s.trusted ? 'Untrust' : 'Trust'}</button>
                                {!s.current && <button onClick={() => revokeSession(s.id)} style={{ background: theme.dangerDim, border: `1px solid rgba(239,68,68,0.25)`, borderRadius: 6, padding: '5px 10px', fontSize: 10, color: theme.danger, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Revoke</button>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Security Features ── */}
            <SectionTitle>Authentication & Monitoring</SectionTitle>

            <div style={{ background: theme.bgInput, borderRadius: 12, padding: '4px 16px', border: `1px solid ${theme.border}`, marginBottom: 18 }}>
                <Toggle checked={authLogging} onChange={setAuthLogging} label="Authentication Logging" description="Tracks all login/logout attempts with IP, user agent, location, and timestamps" />
                <div style={{ height: 1, background: theme.border + '50' }} />
                <Toggle checked={deviceFingerprint} onChange={setDeviceFingerprint} label="Device Fingerprinting" description="Reliable device identification using SHA-256 hashing with browser version normalization (prevents false positives)" />
                <div style={{ height: 1, background: theme.border + '50' }} />
                <Toggle checked={newDeviceDetect} onChange={setNewDeviceDetect} label="New Device Detection" description="Automatically detects and notifies users of new device logins" />
                <div style={{ height: 1, background: theme.border + '50' }} />
                <Toggle checked={failedLoginNotify} onChange={setFailedLoginNotify} label="Failed Login Tracking" description="Logs and optionally notifies users of failed login attempts" />
                <div style={{ height: 1, background: theme.border + '50' }} />
                <Toggle checked={locationTracking} onChange={setLocationTracking} label="Location Tracking" description="Optional GeoIP integration for location data with login events" />
                <div style={{ height: 1, background: theme.border + '50' }} />
                <Toggle checked={suspiciousDetect} onChange={setSuspiciousDetect} label="Suspicious Activity Detection" description="Automatically detects multiple failed logins, rapid location changes, and unusual login times" />
                <div style={{ height: 1, background: theme.border + '50' }} />
                <Toggle checked={requireTrusted} onChange={setRequireTrusted} label="Device Trust Management" description="Require trusted devices for sensitive actions. Mark devices as trusted and manage device names." />
            </div>

            {/* ── Statistics ── */}
            <SectionTitle>Statistics & Insights</SectionTitle>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <StatCard label="Total Logins" value={String(stats.totalLogins)} color={theme.accent} />
                <StatCard label="Failed Attempts" value={String(stats.failedAttempts)} color={theme.danger} />
                <StatCard label="Unique Devices" value={String(stats.uniqueDevices)} color={theme.cyan} />
                <StatCard label="Active Sessions" value={String(stats.activeSessions)} color={theme.success} />
            </div>
        </>
    );
}

/* ═══════════════════════════════════════════════════
   TAB: AUDIT LOGS
   ═══════════════════════════════════════════════════ */
function AuditLogsTab() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 8;

    const filtered = mockAuditLog.filter(e =>
        e.action.toLowerCase().includes(search.toLowerCase()) ||
        e.details.toLowerCase().includes(search.toLowerCase()) ||
        e.ip.includes(search)
    );
    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const actionColors: Record<string, string> = {
        'Login': theme.success, 'Failed Login': theme.danger, 'Logout': theme.textSecondary,
        'Profile Updated': theme.accent, 'Password Changed': theme.warning,
        'New Device Login': theme.cyan, '2FA Method Changed': theme.accent,
        'Session Revoked': theme.danger, 'Backup Codes Generated': theme.warning,
        'API Key Created': theme.accent, 'Device Trusted': theme.success,
        'Suspicious Activity': theme.danger, 'Role Updated': theme.warning,
    };

    return (
        <>
            {/* Search */}
            <div style={{ marginBottom: 20 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, background: theme.bgInput,
                    border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 14px',
                }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search audit logs by action, details, or IP..."
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '11px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit' }} />
                    {search && (
                        <button onClick={() => { setSearch(''); setPage(1); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 4, display: 'flex' }}>
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 14 }}>
                Showing {paginated.length} of {filtered.length} entries
                {search && <span> matching "<span style={{ color: theme.accent }}>{search}</span>"</span>}
            </div>

            {/* Table */}
            <div style={{ background: 'rgba(10,14,22,0.5)', border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 130px 1fr 120px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                    <span>Time</span><span>Action</span><span>Details</span><span>IP</span>
                </div>
                {/* Rows */}
                {paginated.length === 0 ? (
                    <div style={{ padding: '40px 16px', textAlign: 'center', color: theme.textSecondary, fontSize: 13 }}>No audit entries found.</div>
                ) : paginated.map((entry, idx) => (
                    <div key={entry.id} style={{
                        display: 'grid', gridTemplateColumns: '160px 130px 1fr 120px',
                        padding: '12px 16px', alignItems: 'center', gap: 8,
                        borderBottom: idx < paginated.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                        fontSize: 12, transition: 'background 0.1s',
                    }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: theme.textSecondary, whiteSpace: 'nowrap' }}>{entry.time}</span>
                        <span>
                            <span style={{
                                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                                background: `${actionColors[entry.action] || theme.textDim}15`,
                                color: actionColors[entry.action] || theme.textSecondary,
                                border: `1px solid ${actionColors[entry.action] || theme.textDim}25`,
                                whiteSpace: 'nowrap',
                            }}>{entry.action}</span>
                        </span>
                        <span style={{ color: theme.textSecondary, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.details}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: theme.textDim }}>{entry.ip}</span>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 18 }}>
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? theme.textDim : theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page === 1 ? 0.4 : 1 }}>Prev</button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)} style={{
                            background: page === i + 1 ? theme.accentDim : 'none',
                            border: `1px solid ${page === i + 1 ? theme.accent : theme.border}`,
                            borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
                            color: page === i + 1 ? theme.accent : theme.textSecondary,
                            fontSize: 12, fontWeight: page === i + 1 ? 700 : 400, fontFamily: 'inherit',
                        }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? theme.textDim : theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page === totalPages ? 0.4 : 1 }}>Next</button>
                </div>
            )}
        </>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
const tabDefs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Personal Data', icon: Icons.user(14) },
    { id: 'password', label: 'Change Password', icon: Icons.lock(14) },
    { id: 'security', label: 'Security', icon: Icons.shield(14) },
    { id: 'audit', label: 'Audit Logs', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="12" height="12" rx="1"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="9" y2="8"/><line x1="5" y1="11" x2="7" y2="11"/></svg> },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<Tab>('personal');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>My Profile</h1>
            <p style={{ fontSize: 13, color: theme.textSecondary, margin: '0 0 24px' }}>Manage your account, security settings, and review activity.</p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: `1px solid ${theme.border}`, overflowX: 'auto' }}>
                {tabDefs.map(tab => {
                    const active = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            background: 'none', border: 'none', borderBottom: `2px solid ${active ? theme.accent : 'transparent'}`,
                            padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit',
                            color: active ? theme.text : theme.textSecondary,
                            fontSize: 13, fontWeight: active ? 700 : 500, transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                        }}>
                            <span style={{ display: 'flex', color: active ? theme.accent : theme.textDim }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? <ProfileSkeleton /> : (
                <div style={{ animation: 'argux-fadeIn 0.3s ease-out' }}>
                    {activeTab === 'personal' && <PersonalDataTab />}
                    {activeTab === 'password' && <ChangePasswordTab />}
                    {activeTab === 'security' && <SecurityTab />}
                    {activeTab === 'audit' && <AuditLogsTab />}
                </div>
            )}
        </div>
    );
}

ProfilePage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
