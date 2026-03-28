import PageMeta from '../../components/layout/PageMeta';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useAppSettings, themes, fonts } from '../../layouts/AppLayout';
import { Input, Button, Toggle, Skeleton, Icons } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useTopLoader } from '../../components/ui/TopLoader';
import { theme } from '../../lib/theme';
import { mockSessions, mockAuditLog, mockIpData, backupCodes, languages, dateFormats, timezones, actionColors, keyboardShortcuts } from '../../mock/profile';
import type { Tab } from '../../mock/profile';

const SectionTitle = ({ children }: { children: string }) => <div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 14, marginTop: 28, paddingBottom: 8, borderBottom: `1px solid ${theme.border}` }}>{children}</div>;
const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => <div style={{ marginBottom: 18 }}><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{label}</label>{children}</div>;
const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
const StatCard = ({ label, value, color }: { label: string; value: string; color?: string }) => <div style={{ background: theme.bgInput, borderRadius: 10, padding: '14px 16px', border: `1px solid ${theme.border}`, flex: 1, minWidth: 120 }}><div style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>{label}</div><div style={{ fontSize: 20, fontWeight: 700, color: color || theme.text, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div></div>;
function formatDatePreview(fmt: string): string { const map: Record<string, string> = { 'YYYY': '2026', 'MM': '03', 'DD': '20', 'MMM': 'Mar' }; let r = fmt; Object.entries(map).sort((a,b) => b[0].length - a[0].length).forEach(([k,v]) => { r = r.replace(k, v); }); return r; }

/* ═══ TAB: PERSONAL DATA ═══ */
function PersonalDataTab() { const toast = useToast(); const [loading, setLoading] = useState(false); const [form, setForm] = useState({ firstName: 'James', lastName: 'Mitchell', email: 'j.mitchell@argux.mil', phone: '+385 91 234 5847' }); const [avatar, setAvatar] = useState<string | null>(null); const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setAvatar(r.result as string); r.readAsDataURL(f); } }; const handleSave = () => { setLoading(true); setTimeout(() => { setLoading(false); toast.success('Profile saved', 'Your personal data has been updated.'); }, 1200); }; return (<><div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}><div style={{ position: 'relative' }}><div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: avatar ? 'transparent' : 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${theme.border}` }}>{avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>JM</span>}</div><label style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `2px solid ${theme.bg}` }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg><input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} /></label></div><div><div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>James Mitchell</div><div style={{ fontSize: 12, color: theme.textSecondary }}>Administrator — System Operations</div><div style={{ display: 'flex', gap: 6, marginTop: 4 }}><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#ef444412', color: '#ef4444', border: '1px solid #ef444425' }}>ADMIN</span></div></div></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, columnGap: 16 }}><Input label="First Name" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} icon={Icons.user()} /><Input label="Last Name" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} icon={Icons.user()} /></div><Input label="Email Address" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} icon={Icons.mail()} /><Input label="Phone Number" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} icon={Icons.phone()} /><Button onClick={handleSave} loading={loading} style={{ width: 'auto', padding: '11px 32px' }}>Save Changes</Button></>); }

/* ═══ TAB: CHANGE PASSWORD ═══ */
function ChangePasswordTab() { const toast = useToast(); const [loading, setLoading] = useState(false); const [form, setForm] = useState({ current: '', newPw: '', confirm: '' }); const pw = form.newPw; const valid = form.current && pw.length >= 12 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw) && pw === form.confirm; const handleSave = () => { setLoading(true); setTimeout(() => { setLoading(false); setForm({ current: '', newPw: '', confirm: '' }); toast.success('Password changed', 'All other sessions revoked.'); }, 1500); }; return (<><Input label="Current Password" type="password" placeholder="Enter current password" value={form.current} onChange={e => setForm({...form, current: e.target.value})} icon={Icons.lock()} /><Input label="New Password" type="password" placeholder="Minimum 12 characters" value={form.newPw} onChange={e => setForm({...form, newPw: e.target.value})} icon={Icons.lock()} />{pw && <div style={{ marginTop: -8, marginBottom: 16 }}>{[[pw.length>=12,'At least 12 characters'],[/[A-Z]/.test(pw),'One uppercase'],[/[a-z]/.test(pw),'One lowercase'],[/[0-9]/.test(pw),'One number'],[/[^A-Za-z0-9]/.test(pw),'One special char']].map(([ok,text],i)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:ok?theme.success:theme.textDim,marginBottom:4}}><span style={{fontSize:10,fontWeight:700}}>{ok?'✓':'○'}</span>{text as string}</div>)}</div>}<Input label="Confirm New Password" type="password" placeholder="Re-enter new password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} icon={Icons.lock()} error={form.confirm && pw !== form.confirm ? 'Passwords do not match' : ''} /><Button onClick={handleSave} loading={loading} disabled={!valid} style={{ width: 'auto', padding: '11px 32px' }}>Update Password</Button></>); }

/* ═══ TAB: SECURITY ═══ */
function SecurityTab() { const toast = useToast(); const [twoFaMethod, setTwoFaMethod] = useState('app'); const [twoFaPhone, setTwoFaPhone] = useState('+385 91 234 5847'); const [recoveryPhone, setRecoveryPhone] = useState('+385 98 765 4321'); const [showCodes, setShowCodes] = useState(false); const [sessions, setSessions] = useState(mockSessions);
    return (<><SectionTitle>Two-Factor Authentication</SectionTitle><FieldGroup label="2FA Method"><Select value={twoFaMethod} onChange={setTwoFaMethod} options={[{value:'app',label:'Authenticator App'},{value:'sms',label:'SMS'},{value:'email',label:'Email'}]} /></FieldGroup><Input label="2FA Phone" type="tel" value={twoFaPhone} onChange={e=>setTwoFaPhone(e.target.value)} icon={Icons.phone()} /><Input label="Recovery Phone" type="tel" value={recoveryPhone} onChange={e=>setRecoveryPhone(e.target.value)} icon={Icons.phone()} /><div style={{marginBottom:18}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}><label style={{fontSize:11,fontWeight:600,color:theme.textSecondary,letterSpacing:'0.08em',textTransform:'uppercase' as const}}>Backup Codes</label><Button variant="secondary" onClick={()=>{setShowCodes(true);toast.info('Codes generated');}} style={{width:'auto',padding:'6px 14px',fontSize:11}}>{showCodes?'Regenerate':'Generate'}</Button></div>{showCodes&&<div style={{background:theme.bgInput,borderRadius:10,padding:16,border:`1px solid ${theme.border}`,display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(110px, 1fr))',gap:8}}>{backupCodes.map(c=><div key={c} style={{fontFamily:"'JetBrains Mono', monospace",fontSize:13,fontWeight:600,color:theme.text,padding:'6px 10px',background:theme.bg,borderRadius:6,textAlign:'center' as const,border:`1px solid ${theme.border}`}}>{c}</div>)}<div style={{gridColumn:'1 / -1',fontSize:11,color:theme.warning,marginTop:4}}>⚠ Store securely. Each code is single-use.</div></div>}</div>
        <SectionTitle>{`Active Sessions (${sessions.length})`}</SectionTitle><div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}><Button variant="danger" onClick={()=>{setSessions(p=>p.filter(s=>s.current));toast.warning('All other sessions revoked');}} style={{width:'auto',padding:'6px 14px',fontSize:11}}>Revoke All Others</Button></div>
        <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>{sessions.map(s=><div key={s.id} style={{background:theme.bgInput,borderRadius:10,padding:'14px 16px',border:`1px solid ${s.current?'#ef444440':theme.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap' as const}}><div style={{display:'flex',alignItems:'center',gap:12,flex:1,minWidth:180}}><div style={{width:36,height:36,borderRadius:10,background:'#ef444412',border:'1px solid #ef444420',display:'flex',alignItems:'center',justifyContent:'center',color:'#ef4444',flexShrink:0}}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="12" height="8" rx="1"/><line x1="5" y1="14" x2="11" y2="14"/><line x1="8" y1="11" x2="8" y2="14"/></svg></div><div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:theme.text,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' as const}}>{s.device}{s.current&&<span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,background:theme.successDim,color:theme.success}}>CURRENT</span>}</div><div style={{fontSize:11,color:theme.textSecondary}}>{s.browser} · {s.ip} · {s.location} · {s.lastActive}</div></div></div>{!s.current&&<button onClick={()=>{setSessions(p=>p.filter(x=>x.id!==s.id));toast.warning('Session revoked');}} style={{background:theme.dangerDim,border:'1px solid rgba(239,68,68,0.25)',borderRadius:6,padding:'5px 10px',fontSize:10,color:theme.danger,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Revoke</button>}</div>)}</div>
        <SectionTitle>Statistics</SectionTitle><div style={{display:'flex',gap:12,flexWrap:'wrap' as const}}><StatCard label="Total Logins" value="142" color="#ef4444" /><StatCard label="Failed Attempts" value="7" color={theme.danger} /><StatCard label="Active Sessions" value={String(sessions.length)} color={theme.success} /></div>
    </>); }

/* ═══ TAB: SETTINGS ═══ */
function SettingsTab() {
    const toast = useToast();
    const { currentTheme, setThemeId, currentFont, setFontId, setDir } = useAppSettings();
    const [lang, setLang] = useState('en');
    const [tz, setTz] = useState('Europe/Zagreb');
    const [dateFmt, setDateFmt] = useState('YYYY-MM-DD');
    const [loading, setLoading] = useState(false);
    const selectedLang = languages.find(l => l.id === lang);
    const handleLangChange = (id: string) => { setLang(id); const l = languages.find(x => x.id === id); if (l) setDir(l.dir); toast.info('Language changed', `Set to ${l?.label}.`); };
    const handleThemeChange = (id: string) => { setThemeId(id); const t = themes.find(x => x.id === id); toast.success('Theme applied', `Switched to ${t?.name}.`); };
    const handleFontChange = (id: string) => { setFontId(id); const f = fonts.find(x => x.id === id); toast.success('Font changed', `Using ${f?.name}.`); };
    const handleSave = () => { setLoading(true); setTimeout(() => { setLoading(false); toast.success('Settings saved'); }, 800); };
    return (<>
        <SectionTitle>Language & Region</SectionTitle>
        <FieldGroup label="Language"><div style={{ position: 'relative' }}><select value={lang} onChange={e => handleLangChange(e.target.value)} style={{ width: '100%', padding: '10px 14px 10px 40px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>{languages.map(l => <option key={l.id} value={l.id}>{l.flag}  {l.label}</option>)}</select><span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' as const }}>{selectedLang?.flag}</span></div></FieldGroup>
        <FieldGroup label="Timezone"><Select value={tz} onChange={setTz} options={timezones.map(t => ({ value: t, label: t.replace(/_/g, ' ') }))} /></FieldGroup>
        <FieldGroup label="Date Format"><Select value={dateFmt} onChange={setDateFmt} options={dateFormats.map(f => ({ value: f, label: `${f}  →  ${formatDatePreview(f)}` }))} /></FieldGroup>
        <SectionTitle>Appearance</SectionTitle>
        <FieldGroup label="Theme"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 10 }}>{themes.map(t => { const active = currentTheme.id === t.id; const isDark = t.bg.startsWith('#0') || t.bg.startsWith('#1'); return <button key={t.id} onClick={() => handleThemeChange(t.id)} style={{ padding: 12, borderRadius: 10, cursor: 'pointer', textAlign: 'left' as const, background: active ? t.accentDim : theme.bgInput, border: `1.5px solid ${active ? t.accent : theme.border}`, fontFamily: 'inherit' }}><div style={{ display: 'flex', gap: 4, marginBottom: 8 }}><div style={{ width: 18, height: 18, borderRadius: 4, background: t.sidebarBg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} /><div style={{ width: 18, height: 18, borderRadius: 4, background: t.accent }} /><div style={{ width: 18, height: 18, borderRadius: 4, background: t.bg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} /></div><div style={{ fontSize: 11, fontWeight: 600, color: active ? t.accent : theme.text }}>{t.name}</div><div style={{ fontSize: 10, color: active ? t.accent : theme.textDim, marginTop: 2 }}>{isDark ? 'Dark' : 'Light'}{active ? ' · Active' : ''}</div></button>; })}</div></FieldGroup>
        <FieldGroup label="Font"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>{fonts.map(f => <button key={f.id} onClick={() => handleFontChange(f.id)} style={{ padding: '12px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left' as const, background: currentFont.id === f.id ? theme.accentDim : theme.bgInput, border: `1.5px solid ${currentFont.id === f.id ? theme.accent : theme.border}`, fontFamily: f.family }}><div style={{ fontSize: 14, fontWeight: 600, color: currentFont.id === f.id ? theme.accent : theme.text, marginBottom: 2 }}>{f.name}</div><div style={{ fontSize: 11, color: theme.textSecondary }}>Aa Bb Cc 123</div></button>)}</div></FieldGroup>
        <Button onClick={handleSave} loading={loading} style={{ width: 'auto', padding: '11px 32px', marginTop: 8 }}>Save Settings</Button>
    </>);
}

/* ═══ TAB: AUDIT LOGS ═══ */
function AuditLogsTab() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 8;
    const filtered = mockAuditLog.filter(e => !search || e.action.toLowerCase().includes(search.toLowerCase()) || e.details.toLowerCase().includes(search.toLowerCase()) || e.ip.includes(search));
    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    return (<>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 14px', marginBottom: 12 }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search audit logs..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '11px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit' }} /></div>
        <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 10 }}>Showing {paginated.length} of {filtered.length} entries</div>
        <div style={{ background: 'rgba(10,14,22,0.5)', border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {paginated.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: theme.textSecondary, fontSize: 13 }}>No entries match.</div> : paginated.map((entry, idx) => (
                <div key={entry.id} style={{ display: 'grid', gridTemplateColumns: '155px 130px 1fr 115px', padding: '12px 16px', alignItems: 'center', gap: 8, borderBottom: idx < paginated.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', fontSize: 12 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: theme.textSecondary }}>{entry.time}</span>
                    <span><span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${actionColors[entry.action]||theme.textDim}15`, color: actionColors[entry.action]||theme.textSecondary, border: `1px solid ${actionColors[entry.action]||theme.textDim}25`, whiteSpace: 'nowrap' as const }}>{entry.action}</span></span>
                    <span style={{ color: theme.textSecondary, lineHeight: 1.4 }}>{entry.details}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: theme.textDim }}>{entry.ip}</span>
                </div>
            ))}
        </div>
        {totalPages > 1 && <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 18 }}><button onClick={() => setPage(Math.max(1,page-1))} disabled={page===1} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page===1?'not-allowed':'pointer', color: page===1?theme.textDim:theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page===1?0.4:1 }}>Prev</button>{Array.from({length:totalPages}).map((_,i)=><button key={i} onClick={() => setPage(i+1)} style={{ background: page===i+1?'#ef444412':'none', border: `1px solid ${page===i+1?'#ef4444':theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: page===i+1?'#ef4444':theme.textSecondary, fontSize: 12, fontWeight: page===i+1?700:400, fontFamily: 'inherit' }}>{i+1}</button>)}<button onClick={() => setPage(Math.min(totalPages,page+1))} disabled={page===totalPages} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page===totalPages?'not-allowed':'pointer', color: page===totalPages?theme.textDim:theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page===totalPages?0.4:1 }}>Next</button></div>}
    </>);
}

/* ═══ MAIN ═══ */
const tabDefs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Personal Data', icon: Icons.user(14) },
    { id: 'password', label: 'Password', icon: Icons.lock(14) },
    { id: 'security', label: 'Security', icon: Icons.shield(14) },
    { id: 'settings', label: 'Settings', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2.5"/><path d="M13 8a5 5 0 00-.3-1.7l1.5-1.2-1-1.7-1.8.6A5 5 0 009.7 3L9 1.5H7L6.3 3a5 5 0 00-1.7 1l-1.8-.6-1 1.7 1.5 1.2A5 5 0 003 8a5 5 0 00.3 1.7l-1.5 1.2 1 1.7 1.8-.6c.5.4 1.1.8 1.7 1l.7 1.5h2l.7-1.5c.6-.2 1.2-.6 1.7-1l1.8.6 1-1.7-1.5-1.2A5 5 0 0013 8z"/></svg> },
    { id: 'audit', label: 'Audit Logs', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="12" height="12" rx="1"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="9" y2="8"/><line x1="5" y1="11" x2="7" y2="11"/></svg> },
];

export default function AdminProfile() {
    const [activeTab, setActiveTab] = useState<Tab>('personal');
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const { trigger } = useTopLoader();
    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
    const switchTab = useCallback((t: Tab) => { setActiveTab(t); trigger(); }, [trigger]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            const tabMap: Record<string, Tab> = { '1': 'personal', '2': 'password', '3': 'security', '4': 'settings', '5': 'audit' };
            if (tabMap[e.key]) { switchTab(tabMap[e.key]); return; }
            if (e.key === 'Escape') setShowShortcuts(false);
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [switchTab]);

    return (<><PageMeta title="Admin Profile" /><div data-testid="admin-profile-page">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
            <div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>My Profile</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>Manage your admin account, security, and preferences.</p></div>
        </div>

        <div style={{ display: 'flex', gap: 2, marginBottom: 28, borderBottom: `1px solid ${theme.border}`, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
            {tabDefs.map((tab, idx) => { const active = activeTab === tab.id; return (
                <button key={tab.id} onClick={() => switchTab(tab.id)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${active ? '#ef4444' : 'transparent'}`, padding: '10px 14px', cursor: 'pointer', fontFamily: 'inherit', color: active ? theme.text : theme.textSecondary, fontSize: 13, fontWeight: active ? 700 : 500, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
                    <span style={{ display: 'flex', color: active ? '#ef4444' : theme.textDim }}>{tab.icon}</span>{tab.label}
                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, border: `1px solid ${theme.border}`, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{idx + 1}</span>
                </button>
            ); })}
        </div>

        {loading ? <div><div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}><Skeleton width={80} height={80} radius={40} /><div><Skeleton width={180} height={18} style={{ marginBottom: 8 }} /><Skeleton width={220} height={12} /></div></div>{[1,2,3,4].map(i => <Skeleton key={i} height={44} radius={8} style={{ marginBottom: 14 }} />)}</div>
        : <div style={{ animation: 'argux-fadeIn 0.3s ease-out' }}>
            {activeTab === 'personal' && <PersonalDataTab />}
            {activeTab === 'password' && <ChangePasswordTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'audit' && <AuditLogsTab />}
        </div>}

        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>{keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${theme.border}08` }}><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 54, height: 22, padding: '0 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'rgba(128,128,128,0.06)', color: theme.textDim, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{s.key}</span><span style={{ fontSize: 12, color: theme.textSecondary }}>{s.description}</span></div>)}<div style={{ marginTop: 14, fontSize: 10, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div></div></div>}
    </div></>);
}
AdminProfile.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;