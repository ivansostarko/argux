import { useState, useEffect } from 'react';
import AppLayout, { useAppSettings, themes } from '../../layouts/AppLayout';
import { Input, Button, Toggle, Skeleton, Icons } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';

type Tab = 'personal' | 'password' | 'security' | 'settings' | 'audit';

/* ═══ MOCK DATA ═══ */
interface AuditEntry { id: number; time: string; action: string; details: string; ip: string; }
interface Session { id: string; device: string; browser: string; ip: string; location: string; lastActive: string; current: boolean; trusted: boolean; }

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

const backupCodes = ['A4K2-M9X1','B7J3-P2W8','C1L5-N6Y4','D8R7-Q3V9','E5T2-S1Z6','F3U8-R4X2','G9W1-T7K5','H6Y4-V2M3'];

const languages = [
    { id: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' as const },
    { id: 'hr', label: 'Croatian', flag: '🇭🇷', dir: 'ltr' as const },
    { id: 'ru', label: 'Russian', flag: '🇷🇺', dir: 'ltr' as const },
    { id: 'zh', label: 'Chinese', flag: '🇨🇳', dir: 'ltr' as const },
    { id: 'ar', label: 'Arabic', flag: '🇸🇦', dir: 'rtl' as const },
];

const dateFormats = [
    'YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'DD.MM.YYYY',
    'DD-MM-YYYY', 'YYYY/MM/DD', 'MMM DD, YYYY', 'DD MMM YYYY',
    'MMMM DD, YYYY', 'DD MMMM YYYY',
];

/* ═══ HELPERS ═══ */
const SectionTitle = ({ children }: { children: string }) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 14, marginTop: 28, paddingBottom: 8, borderBottom: `1px solid ${theme.border}` }}>{children}</div>
);

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{label}</label>
        {children}
    </div>
);

const Select = ({ value, onChange, options, style: sx }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; style?: React.CSSProperties }) => (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', cursor: 'pointer', ...sx }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
);

const StatCard = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <div style={{ background: theme.bgInput, borderRadius: 10, padding: '14px 16px', border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: color || theme.text, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    </div>
);

function ProfileSkeleton() {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                <Skeleton width={80} height={80} radius={40} />
                <div><Skeleton width={180} height={18} style={{ marginBottom: 8 }} /><Skeleton width={220} height={12} /></div>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>{[1,2,3,4,5].map(i => <Skeleton key={i} width={90} height={36} radius={8} />)}</div>
            {[1,2,3,4].map(i => <Skeleton key={i} height={44} radius={8} style={{ marginBottom: 14 }} />)}
            <Skeleton width={140} height={40} radius={8} style={{ marginTop: 8 }} />
        </div>
    );
}

/* ═══ TAB: PERSONAL DATA ═══ */
function PersonalDataTab() {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ firstName: 'James', lastName: 'Mitchell', email: 'j.mitchell@argux.mil', phone: '+385 91 234 5847' });
    const [avatar, setAvatar] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { const r = new FileReader(); r.onload = () => setAvatar(r.result as string); r.readAsDataURL(file); }
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => { setLoading(false); toast.success('Profile saved', 'Your personal data has been updated.'); }, 1200);
    };

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: avatar ? 'transparent' : `linear-gradient(135deg, ${theme.accent}, #1858b8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${theme.border}` }}>
                        {avatar ? <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>JM</span>}
                    </div>
                    <label style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `2px solid ${theme.bg}` }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                    </label>
                </div>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>James Mitchell</div>
                    <div style={{ fontSize: 12, color: theme.textSecondary }}>Senior Operator — Intelligence Analysis</div>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, columnGap: 16 }}>
                <Input label="First Name" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} icon={Icons.user()} />
                <Input label="Last Name" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} icon={Icons.user()} />
            </div>
            <Input label="Email Address" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} icon={Icons.mail()} />
            <Input label="Phone Number" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} icon={Icons.phone()} />
            <Button onClick={handleSave} loading={loading} style={{ width: 'auto', padding: '11px 32px' }}>Save Changes</Button>
        </>
    );
}

/* ═══ TAB: CHANGE PASSWORD ═══ */
function ChangePasswordTab() {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
    const pw = form.newPw;
    const valid = form.current && pw.length >= 12 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw) && pw === form.confirm;

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => { setLoading(false); setForm({ current: '', newPw: '', confirm: '' }); toast.success('Password changed', 'All other sessions have been revoked.'); }, 1500);
    };

    return (
        <>
            <Input label="Current Password" type="password" placeholder="Enter current password" value={form.current} onChange={e => setForm({...form, current: e.target.value})} icon={Icons.lock()} />
            <Input label="New Password" type="password" placeholder="Minimum 12 characters" value={form.newPw} onChange={e => setForm({...form, newPw: e.target.value})} icon={Icons.lock()} />
            {pw && (
                <div style={{ marginTop: -8, marginBottom: 16 }}>
                    {[[pw.length >= 12, 'At least 12 characters'], [/[A-Z]/.test(pw), 'One uppercase letter'], [/[a-z]/.test(pw), 'One lowercase letter'], [/[0-9]/.test(pw), 'One number'], [/[^A-Za-z0-9]/.test(pw), 'One special character']].map(([ok, text], i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: ok ? theme.success : theme.textDim, marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700 }}>{ok ? '✓' : '○'}</span> {text as string}
                        </div>
                    ))}
                </div>
            )}
            <Input label="Confirm New Password" type="password" placeholder="Re-enter new password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} icon={Icons.lock()} error={form.confirm && pw !== form.confirm ? 'Passwords do not match' : ''} />
            <Button onClick={handleSave} loading={loading} disabled={!valid} style={{ width: 'auto', padding: '11px 32px' }}>Update Password</Button>
        </>
    );
}

/* ═══ TAB: SECURITY ═══ */
function SecurityTab() {
    const toast = useToast();
    const [twoFaMethod, setTwoFaMethod] = useState('app');
    const [twoFaPhone, setTwoFaPhone] = useState('+385 91 234 5847');
    const [recoveryPhone, setRecoveryPhone] = useState('+385 98 765 4321');
    const [showCodes, setShowCodes] = useState(false);
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

    const generateCodes = () => { setShowCodes(true); toast.info('Backup codes generated', '8 new single-use codes are ready. Store them securely.'); };
    const revokeSession = (id: string) => { setSessions(prev => prev.filter(s => s.id !== id)); toast.warning('Session revoked', 'The device has been disconnected.'); };
    const toggleTrust = (id: string) => setSessions(prev => prev.map(s => s.id === id ? { ...s, trusted: !s.trusted } : s));

    return (
        <>
            <SectionTitle>Two-Factor Authentication</SectionTitle>
            <FieldGroup label="2FA Method">
                <Select value={twoFaMethod} onChange={setTwoFaMethod} options={[{ value: 'app', label: 'Authenticator App' }, { value: 'sms', label: 'SMS' }, { value: 'email', label: 'Email' }]} />
            </FieldGroup>

            {twoFaMethod === 'app' && (
                <div style={{ background: theme.bgInput, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}`, marginBottom: 18, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: 140, height: 140, background: '#fff', borderRadius: 8, padding: 8, flexShrink: 0 }}>
                        <svg viewBox="0 0 100 100" width="124" height="124">
                            {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => { const b = r===0||r===6||c===0||c===6; const n = r>=2&&r<=4&&c>=2&&c<=4; return (b||n) ? <rect key={`tl${r}${c}`} x={r*4+4} y={c*4+4} width="3.5" height="3.5" fill="#000"/> : null; }))}
                            {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => { const b = r===0||r===6||c===0||c===6; const n = r>=2&&r<=4&&c>=2&&c<=4; return (b||n) ? <rect key={`tr${r}${c}`} x={r*4+68} y={c*4+4} width="3.5" height="3.5" fill="#000"/> : null; }))}
                            {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => { const b = r===0||r===6||c===0||c===6; const n = r>=2&&r<=4&&c>=2&&c<=4; return (b||n) ? <rect key={`bl${r}${c}`} x={r*4+4} y={c*4+68} width="3.5" height="3.5" fill="#000"/> : null; }))}
                            {Array.from({length:80},(_,i)=>{ const x=36+(i%8)*4; const y=36+Math.floor(i/8)*4; return (i*7+3)%11>4 ? <rect key={`d${i}`} x={x} y={y} width="3.5" height="3.5" fill="#000"/> : null; })}
                        </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>Scan with your authenticator app</div>
                        <p style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6, margin: '0 0 10px' }}>Use Google Authenticator, Authy, or any TOTP-compatible app.</p>
                        <div style={{ background: theme.bg, borderRadius: 6, padding: '8px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: theme.textDim, wordBreak: 'break-all' as const, border: `1px solid ${theme.border}` }}>
                            otpauth://totp/ARGUX:j.mitchell?secret=JBSWY3DPEHPK3PXP&issuer=ARGUX
                        </div>
                    </div>
                </div>
            )}

            <Input label="2FA Phone Number" type="tel" value={twoFaPhone} onChange={e => setTwoFaPhone(e.target.value)} icon={Icons.phone()} />
            <Input label="Recovery Phone" type="tel" value={recoveryPhone} onChange={e => setRecoveryPhone(e.target.value)} icon={Icons.phone()} />

            <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: theme.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Backup Codes</label>
                    <Button variant="secondary" onClick={generateCodes} style={{ width: 'auto', padding: '6px 14px', fontSize: 11 }}>{showCodes ? 'Regenerate' : 'Generate Backup Codes'}</Button>
                </div>
                {showCodes && (
                    <div style={{ background: theme.bgInput, borderRadius: 10, padding: 16, border: `1px solid ${theme.border}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
                        {backupCodes.map(c => <div key={c} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.text, padding: '6px 10px', background: theme.bg, borderRadius: 6, textAlign: 'center' as const, border: `1px solid ${theme.border}` }}>{c}</div>)}
                        <div style={{ gridColumn: '1 / -1', fontSize: 11, color: theme.warning, marginTop: 4 }}>⚠ Store these codes securely. Each code can only be used once.</div>
                    </div>
                )}
            </div>

            <div style={{ background: theme.bgInput, borderRadius: 10, padding: 16, border: `1px solid ${theme.border}`, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Physical Security Keys</div><div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>No hardware keys registered.</div></div>
                <Button variant="secondary" onClick={() => toast.info('Feature demo', 'WebAuthn registration dialog would open here.')} style={{ width: 'auto', padding: '6px 14px', fontSize: 11, flexShrink: 0 }}>Register Key</Button>
            </div>

            <SectionTitle>Session Management</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 18 }}>
                <FieldGroup label="Session Timeout"><Select value={sessionTimeout} onChange={setSessionTimeout} options={[{ value:'15', label:'15 minutes' },{ value:'30', label:'30 minutes' },{ value:'60', label:'1 hour' },{ value:'120', label:'2 hours' },{ value:'480', label:'8 hours' },{ value:'1440', label:'24 hours' }]} /></FieldGroup>
                <div style={{ paddingTop: 4 }}><Toggle checked={sessionRestoration} onChange={setSessionRestoration} label="Session Restoration Prevention" description="Prevent session token reuse after logout" /></div>
            </div>

            <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Active Sessions ({sessions.length})</span>
                    <Button variant="danger" onClick={() => { setSessions(prev => prev.filter(s => s.current)); toast.warning('All other sessions revoked'); }} style={{ width: 'auto', padding: '6px 14px', fontSize: 11 }}>Revoke All Others</Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sessions.map(s => (
                        <div key={s.id} style={{ background: theme.bgInput, borderRadius: 10, padding: '14px 16px', border: `1px solid ${s.current ? theme.accent+'40' : theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 180 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${theme.accent}12`, border: `1px solid ${theme.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent, flexShrink: 0 }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="12" height="8" rx="1"/><line x1="5" y1="14" x2="11" y2="14"/><line x1="8" y1="11" x2="8" y2="14"/></svg>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                        {s.device}
                                        {s.current && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: theme.successDim, color: theme.success }}>CURRENT</span>}
                                        {s.trusted && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: theme.accentDim, color: theme.accent }}>TRUSTED</span>}
                                    </div>
                                    <div style={{ fontSize: 11, color: theme.textSecondary, wordBreak: 'break-all' as const }}>{s.browser} · {s.ip} · {s.location} · {s.lastActive}</div>
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

            <SectionTitle>Authentication & Monitoring</SectionTitle>
            <div style={{ background: theme.bgInput, borderRadius: 12, padding: '4px 16px', border: `1px solid ${theme.border}`, marginBottom: 18 }}>
                {[
                    [authLogging, setAuthLogging, 'Authentication Logging', 'Tracks all login/logout attempts with IP, user agent, location, and timestamps'] as const,
                    [deviceFingerprint, setDeviceFingerprint, 'Device Fingerprinting', 'SHA-256 hashing with browser version normalization (prevents false positives)'] as const,
                    [newDeviceDetect, setNewDeviceDetect, 'New Device Detection', 'Automatically detects and notifies users of new device logins'] as const,
                    [failedLoginNotify, setFailedLoginNotify, 'Failed Login Tracking', 'Logs and optionally notifies users of failed login attempts'] as const,
                    [locationTracking, setLocationTracking, 'Location Tracking', 'Optional GeoIP integration for location data'] as const,
                    [suspiciousDetect, setSuspiciousDetect, 'Suspicious Activity Detection', 'Detects multiple failed logins, rapid location changes, and unusual login times'] as const,
                    [requireTrusted, setRequireTrusted, 'Device Trust Management', 'Require trusted devices for sensitive actions'] as const,
                ].map(([val, setter, label, desc], i, arr) => (
                    <div key={label as string}>
                        <Toggle checked={val as boolean} onChange={setter as (v: boolean) => void} label={label as string} description={desc as string} />
                        {i < arr.length - 1 && <div style={{ height: 1, background: theme.border+'50' }} />}
                    </div>
                ))}
            </div>

            <SectionTitle>Statistics & Insights</SectionTitle>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <StatCard label="Total Logins" value="142" color={theme.accent} />
                <StatCard label="Failed Attempts" value="7" color={theme.danger} />
                <StatCard label="Unique Devices" value="4" color={theme.cyan} />
                <StatCard label="Active Sessions" value={String(sessions.length)} color={theme.success} />
            </div>
        </>
    );
}

/* ═══ TAB: SETTINGS ═══ */
function SettingsTab() {
    const toast = useToast();
    const { currentTheme, setThemeId, setDir } = useAppSettings();
    const [lang, setLang] = useState('en');
    const [tz, setTz] = useState('Europe/Zagreb');
    const [dateFmt, setDateFmt] = useState('YYYY-MM-DD');
    const [loading, setLoading] = useState(false);

    const timezones = ['UTC','Europe/Zagreb','Europe/London','Europe/Berlin','Europe/Paris','Europe/Rome','Europe/Moscow','Asia/Dubai','Asia/Riyadh','Asia/Kolkata','Asia/Shanghai','Asia/Tokyo','Asia/Seoul','Asia/Singapore','Australia/Sydney','Pacific/Auckland','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Sao_Paulo','Africa/Cairo','Africa/Johannesburg'];

    const handleLangChange = (id: string) => {
        setLang(id);
        const l = languages.find(x => x.id === id);
        if (l) setDir(l.dir);
        toast.info('Language changed', `Interface language set to ${l?.label || id}.${l?.dir === 'rtl' ? ' Layout switched to RTL.' : ''}`);
    };

    const handleThemeChange = (id: string) => {
        setThemeId(id);
        const t = themes.find(x => x.id === id);
        toast.success('Theme applied', `Switched to ${t?.name || id}.`);
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => { setLoading(false); toast.success('Settings saved', 'Your preferences have been updated.'); }, 800);
    };

    const selectedLang = languages.find(l => l.id === lang);

    return (
        <>
            <SectionTitle>Language & Region</SectionTitle>

            <FieldGroup label="Language">
                <div style={{ position: 'relative' }}>
                    <select value={lang} onChange={e => handleLangChange(e.target.value)} style={{ width: '100%', padding: '10px 14px 10px 40px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                        {languages.map(l => <option key={l.id} value={l.id}>{l.flag}  {l.label}</option>)}
                    </select>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' as const }}>{selectedLang?.flag}</span>
                </div>
                {lang === 'ar' && (
                    <div style={{ marginTop: 8, fontSize: 11, color: theme.warning, display: 'flex', alignItems: 'center', gap: 6 }}>
                        ⚠ Layout direction changed to Right-to-Left (RTL)
                    </div>
                )}
            </FieldGroup>

            <FieldGroup label="Timezone">
                <Select value={tz} onChange={setTz} options={timezones.map(t => ({ value: t, label: t.replace(/_/g, ' ') }))} />
            </FieldGroup>

            <FieldGroup label="Date Format">
                <Select value={dateFmt} onChange={setDateFmt} options={dateFormats.map(f => ({ value: f, label: `${f}  →  ${formatDatePreview(f)}` }))} />
            </FieldGroup>

            <SectionTitle>Appearance</SectionTitle>

            <FieldGroup label="App Theme">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                    {themes.map(t => (
                        <button key={t.id} onClick={() => handleThemeChange(t.id)} style={{
                            padding: 14, borderRadius: 10, cursor: 'pointer', textAlign: 'left' as const,
                            background: currentTheme.id === t.id ? t.accentDim : t.bgInput,
                            border: `1.5px solid ${currentTheme.id === t.id ? t.accent : theme.border}`,
                            transition: 'all 0.2s', fontFamily: 'inherit',
                        }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                                <div style={{ width: 20, height: 20, borderRadius: 4, background: t.bg, border: `1px solid ${t.border}` }} />
                                <div style={{ width: 20, height: 20, borderRadius: 4, background: t.accent }} />
                                <div style={{ width: 20, height: 20, borderRadius: 4, background: t.sidebarBg, border: `1px solid ${t.border}` }} />
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: currentTheme.id === t.id ? t.accent : theme.text }}>{t.name}</div>
                            {currentTheme.id === t.id && <div style={{ fontSize: 10, color: t.accent, marginTop: 2 }}>Active</div>}
                        </button>
                    ))}
                </div>
            </FieldGroup>

            <Button onClick={handleSave} loading={loading} style={{ width: 'auto', padding: '11px 32px', marginTop: 8 }}>Save Settings</Button>
        </>
    );
}

function formatDatePreview(fmt: string): string {
    const d = new Date(2026, 2, 20);
    const map: Record<string, string> = { 'YYYY': '2026', 'MM': '03', 'DD': '20', 'MMM': 'Mar', 'MMMM': 'March' };
    let r = fmt;
    Object.entries(map).sort((a,b) => b[0].length - a[0].length).forEach(([k,v]) => { r = r.replace(k, v); });
    return r;
}

/* ═══ TAB: AUDIT LOGS ═══ */
function AuditLogsTab() {
    const [search, setSearch] = useState('');
    const [filterTime, setFilterTime] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterIp, setFilterIp] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 8;

    const uniqueActions = [...new Set(mockAuditLog.map(e => e.action))].sort();
    const uniqueIps = [...new Set(mockAuditLog.map(e => e.ip))].sort();
    const uniqueDates = [...new Set(mockAuditLog.map(e => e.time.split(' ')[0]))].sort().reverse();

    const filtered = mockAuditLog.filter(e => {
        const matchSearch = !search || e.action.toLowerCase().includes(search.toLowerCase()) || e.details.toLowerCase().includes(search.toLowerCase()) || e.ip.includes(search);
        const matchTime = !filterTime || e.time.startsWith(filterTime);
        const matchAction = !filterAction || e.action === filterAction;
        const matchIp = !filterIp || e.ip === filterIp;
        return matchSearch && matchTime && matchAction && matchIp;
    });

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

    const resetFilters = () => { setSearch(''); setFilterTime(''); setFilterAction(''); setFilterIp(''); setPage(1); };
    const hasFilters = search || filterTime || filterAction || filterIp;

    const filterSelect = (value: string, onChange: (v: string) => void, options: string[], placeholder: string) => (
        <select value={value} onChange={e => { onChange(e.target.value); setPage(1); }} style={{
            padding: '8px 10px', background: theme.bgInput, color: value ? theme.text : theme.textDim,
            border: `1px solid ${value ? theme.accent+'60' : theme.border}`, borderRadius: 6, fontSize: 12,
            fontFamily: 'inherit', outline: 'none', cursor: 'pointer', minWidth: 0, flex: 1,
        }}>
            <option value="">{placeholder}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );

    return (
        <>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 14px', marginBottom: 12 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search audit logs..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '11px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit' }} />
                {search && <button onClick={() => { setSearch(''); setPage(1); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 4, display: 'flex' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>}
            </div>

            {/* Filters row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {filterSelect(filterTime, setFilterTime, uniqueDates, 'All dates')}
                {filterSelect(filterAction, setFilterAction, uniqueActions, 'All actions')}
                {filterSelect(filterIp, setFilterIp, uniqueIps, 'All IPs')}
                {hasFilters && <button onClick={resetFilters} style={{ background: theme.dangerDim, border: `1px solid rgba(239,68,68,0.25)`, borderRadius: 6, padding: '8px 12px', fontSize: 11, color: theme.danger, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, whiteSpace: 'nowrap' as const }}>Clear</button>}
            </div>

            <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 10 }}>
                Showing {paginated.length} of {filtered.length} entries
            </div>

            {/* Responsive table */}
            <div style={{ background: 'rgba(10,14,22,0.5)', border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <style>{`
                    .audit-row { display: grid; grid-template-columns: 155px 130px 1fr 115px; padding: 12px 16px; align-items: center; gap: 8; }
                    @media(max-width:768px) {
                        .audit-row { grid-template-columns: 1fr; gap: 4; padding: 12px 14px; }
                        .audit-head { display: none !important; }
                        .audit-cell-label { display: inline !important; }
                    }
                `}</style>
                <div className="audit-row audit-head" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                    <span>Time</span><span>Action</span><span>Details</span><span>IP</span>
                </div>
                {paginated.length === 0 ? (
                    <div style={{ padding: '40px 16px', textAlign: 'center', color: theme.textSecondary, fontSize: 13 }}>No audit entries found.</div>
                ) : paginated.map((entry, idx) => (
                    <div key={entry.id} className="audit-row" style={{
                        borderBottom: idx < paginated.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                        fontSize: 12, transition: 'background 0.1s', cursor: 'pointer',
                    }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: theme.textSecondary }}>
                            <span className="audit-cell-label" style={{ display: 'none', fontSize: 10, fontWeight: 600, color: theme.textDim, marginRight: 6 }}>TIME:</span>
                            {entry.time}
                        </span>
                        <span>
                            <span className="audit-cell-label" style={{ display: 'none', fontSize: 10, fontWeight: 600, color: theme.textDim, marginRight: 6 }}>ACTION:</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${actionColors[entry.action]||theme.textDim}15`, color: actionColors[entry.action]||theme.textSecondary, border: `1px solid ${actionColors[entry.action]||theme.textDim}25`, whiteSpace: 'nowrap' as const }}>{entry.action}</span>
                        </span>
                        <span style={{ color: theme.textSecondary, lineHeight: 1.4 }}>
                            <span className="audit-cell-label" style={{ display: 'none', fontSize: 10, fontWeight: 600, color: theme.textDim, marginRight: 6 }}>DETAILS:</span>
                            {entry.details}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: theme.textDim }}>
                            <span className="audit-cell-label" style={{ display: 'none', fontSize: 10, fontWeight: 600, color: theme.textDim, marginRight: 6 }}>IP:</span>
                            {entry.ip}
                        </span>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 18, flexWrap: 'wrap' }}>
                    <button onClick={() => setPage(Math.max(1, page-1))} disabled={page===1} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page===1?'not-allowed':'pointer', color: page===1?theme.textDim:theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page===1?0.4:1 }}>Prev</button>
                    {Array.from({length:totalPages}).map((_,i) => (
                        <button key={i} onClick={() => setPage(i+1)} style={{ background: page===i+1?theme.accentDim:'none', border: `1px solid ${page===i+1?theme.accent:theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: page===i+1?theme.accent:theme.textSecondary, fontSize: 12, fontWeight: page===i+1?700:400, fontFamily: 'inherit' }}>{i+1}</button>
                    ))}
                    <button onClick={() => setPage(Math.min(totalPages, page+1))} disabled={page===totalPages} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page===totalPages?'not-allowed':'pointer', color: page===totalPages?theme.textDim:theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page===totalPages?0.4:1 }}>Next</button>
                </div>
            )}
        </>
    );
}

/* ═══ MAIN PAGE ═══ */
const tabDefs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Personal Data', icon: Icons.user(14) },
    { id: 'password', label: 'Password', icon: Icons.lock(14) },
    { id: 'security', label: 'Security', icon: Icons.shield(14) },
    { id: 'settings', label: 'Settings', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2.5"/><path d="M13 8a5 5 0 00-.3-1.7l1.5-1.2-1-1.7-1.8.6A5 5 0 009.7 3L9 1.5H7L6.3 3a5 5 0 00-1.7 1l-1.8-.6-1 1.7 1.5 1.2A5 5 0 003 8a5 5 0 00.3 1.7l-1.5 1.2 1 1.7 1.8-.6c.5.4 1.1.8 1.7 1l.7 1.5h2l.7-1.5c.6-.2 1.2-.6 1.7-1l1.8.6 1-1.7-1.5-1.2A5 5 0 0013 8z"/></svg> },
    { id: 'audit', label: 'Audit Logs', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="12" height="12" rx="1"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="9" y2="8"/><line x1="5" y1="11" x2="7" y2="11"/></svg> },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<Tab>('personal');
    const [loading, setLoading] = useState(true);

    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

    return (
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>My Profile</h1>
            <p style={{ fontSize: 13, color: theme.textSecondary, margin: '0 0 24px' }}>Manage your account, security settings, and preferences.</p>

            <div style={{ display: 'flex', gap: 2, marginBottom: 28, borderBottom: `1px solid ${theme.border}`, overflowX: 'auto', WebkitOverflowScrolling: 'touch' as const, scrollbarWidth: 'none' as const }}>
                <style>{`.profile-tabs::-webkit-scrollbar { display: none; }`}</style>
                {tabDefs.map(tab => {
                    const active = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            background: 'none', border: 'none', borderBottom: `2px solid ${active ? theme.accent : 'transparent'}`,
                            padding: '10px 14px', cursor: 'pointer', fontFamily: 'inherit',
                            color: active ? theme.text : theme.textSecondary,
                            fontSize: 13, fontWeight: active ? 700 : 500, transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const, flexShrink: 0,
                        }}>
                            <span style={{ display: 'flex', color: active ? theme.accent : theme.textDim }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {loading ? <ProfileSkeleton /> : (
                <div style={{ animation: 'argux-fadeIn 0.3s ease-out' }}>
                    {activeTab === 'personal' && <PersonalDataTab />}
                    {activeTab === 'password' && <ChangePasswordTab />}
                    {activeTab === 'security' && <SecurityTab />}
                    {activeTab === 'settings' && <SettingsTab />}
                    {activeTab === 'audit' && <AuditLogsTab />}
                </div>
            )}
        </div>
    );
}

ProfilePage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
