import PageMeta from '../../components/layout/PageMeta';
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button, Icons } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { getPersonById, riskColors, statusColors, type Risk, type Status, type Person } from '../../mock/persons';
import { mockVehicles } from '../../mock/vehicles';
import ConnectionsBubble from '../../components/connections/ConnectionsBubble';
import EntityChat from '../../components/chat/EntityChat';
import EntityDevices from '../../components/devices/EntityDevices';

type ShowTab = 'overview' | 'contacts' | 'social' | 'addresses' | 'employment' | 'vehicles' | 'devices' | 'connections' | 'ai' | 'notes';
const RB = ({ risk }: { risk: Risk }) => { const c = riskColors[risk]; return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${c}18`, color: c, border: `1px solid ${c}30`, textTransform: 'uppercase' as const }}>{risk}</span>; };
const SB = ({ status }: { status: Status }) => { const c = statusColors[status]; return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${c}18`, color: c, border: `1px solid ${c}30` }}>{status}</span>; };
const Field = ({ label, value, mono }: { label: string; value?: string; mono?: boolean }) => value ? <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 3 }}>{label}</div><div style={{ fontSize: 13, color: theme.text, fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', wordBreak: 'break-all' as const }}>{value}</div></div> : null;
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => <div style={{ marginBottom: 24 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${theme.border}` }}>{title}</div>{children}</div>;

function generateSummary(p: Person): string {
    const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
    const riskNote = p.risk === 'Critical' ? 'This is a CRITICAL risk subject requiring immediate attention.' : p.risk === 'High' ? 'This subject is classified as HIGH risk and warrants close monitoring.' : p.risk === 'Medium' ? 'Subject carries MEDIUM risk level with notable flags.' : p.risk === 'Low' ? 'Subject is LOW risk with minimal threat indicators.' : 'Subject is currently classified as NO RISK.';
    const langStr = p.languages.length > 0 ? `Speaks ${p.languages.map(l => `${l.language} (${l.level})`).join(', ')}.` : '';
    const contactStr = `Has ${p.emails.length} registered email(s) and ${p.phones.length} phone number(s) on file.`;
    const addrStr = p.addresses.length > 0 ? `Primary location: ${p.addresses[0].city}, ${p.addresses[0].country}.` : 'No registered addresses.';
    const socialStr = p.socials.length > 0 ? `Active on ${p.socials.map(s => s.platform).join(', ')}.` : 'No known social media presence.';
    const eduStr = p.education.length > 0 ? `Education: ${p.education.map(e => `${e.degree} from ${e.school} (${e.startYear}–${e.endYear})`).join('; ')}.` : '';
    const noteStr = p.notes.length > 0 ? `Intelligence notes: ${p.notes.length} active note(s) on file. Latest entry: "${p.notes[0].text.slice(0, 80)}${p.notes[0].text.length > 80 ? '…' : ''}"` : 'No intelligence notes on file.';
    const connectionWarning = p.notes.some(n => n.text.toLowerCase().includes('associate') || n.text.toLowerCase().includes('network')) ? '⚠ Subject has known connections to flagged entities or networks.' : '';
    return `${p.firstName} ${p.lastName}${p.nickname ? ` ("${p.nickname}")` : ''} is a ${age}-year-old ${p.gender.toLowerCase()} of ${p.nationality} nationality, currently residing in ${p.country}. Status: ${p.status}. ${riskNote}\n\n${langStr} ${contactStr} ${addrStr} ${socialStr}${eduStr ? '\n\n' + eduStr : ''}\n\n${noteStr}${connectionWarning ? '\n\n' + connectionWarning : ''}\n\nRecord created: ${new Date(p.createdAt).toLocaleDateString()}. Last updated: ${new Date(p.updatedAt).toLocaleDateString()}. Subject ID: ${p.uuid}.`;
}

const showTabs: { id: ShowTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: Icons.user(14) },
    { id: 'contacts', label: 'Contacts', icon: Icons.mail(14) },
    { id: 'social', label: 'Social', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="4" cy="8" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><line x1="5.8" y1="7" x2="10.2" y2="5"/><line x1="5.8" y1="9" x2="10.2" y2="11"/></svg> },
    { id: 'addresses', label: 'Addresses', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1C5.24 1 3 3.24 3 6c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z"/><circle cx="8" cy="6" r="2"/></svg> },
    { id: 'employment', label: 'Employment', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="12" height="9" rx="1"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2"/></svg> },
    { id: 'vehicles', label: 'Vehicles', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="14" height="6" rx="2"/><circle cx="4.5" cy="12" r="1.5"/><circle cx="11.5" cy="12" r="1.5"/><path d="M3 6l1.5-3h7L13 6"/></svg> },
    { id: 'devices', label: 'Devices', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="8" rx="1"/><line x1="5" y1="14" x2="11" y2="14"/><line x1="8" y1="10" x2="8" y2="14"/></svg> },
    { id: 'connections', label: 'Connections', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="4" cy="8" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><line x1="5.8" y1="7" x2="10.2" y2="5"/><line x1="5.8" y1="9" x2="10.2" y2="11"/></svg> },
    { id: 'ai', label: 'AI Assistant', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" transform="scale(0.625)"/><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg> },
    { id: 'notes', label: 'Notes', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4z"/><polyline points="10,1 10,4 13,4"/></svg> },
];

export default function PersonShow() {
    const toast = useToast();
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const p = getPersonById(Number(id));
    const validTabs: ShowTab[] = ['overview','contacts','social','addresses','employment','vehicles','devices','connections','ai','notes'];
    const urlTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') as ShowTab | null : null;
    const [tab, setTab] = useState<ShowTab>(urlTab && validTabs.includes(urlTab) ? urlTab : 'overview');
    const [exporting, setExporting] = useState(false);
    const [avatarLightbox, setAvatarLightbox] = useState(false);
    const [summaryText, setSummaryText] = useState(p ? generateSummary(p) : '');
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryDate, setSummaryDate] = useState(new Date().toLocaleDateString());

    const handleGenerateSummary = () => {
        if (!p) return;
        setSummaryLoading(true);
        setTimeout(() => {
            setSummaryText(generateSummary(p) + `\n\n[Re-analyzed on ${new Date().toLocaleString()} with latest intelligence data. Confidence: ${(85 + Math.random() * 14).toFixed(1)}%]`);
            setSummaryDate(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
            setSummaryLoading(false);
            toast.success('Summary regenerated', 'AI analysis updated with latest data.');
        }, 2000);
    };

    if (!p) return <div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ fontSize: 48, marginBottom: 16 }}>⚠</div><h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Person Not Found</h2><p style={{ fontSize: 13, color: theme.textSecondary }}>ID {String(id)} not found.</p><Button variant="secondary" onClick={() => router.visit('/persons')} style={{ width: 'auto', padding: '10px 20px', marginTop: 16 }}>Back to Persons</Button></div>;

    const handlePrint = () => { router.visit(`/persons/${p.id}/print`); };
    const handleExportPdf = () => { setExporting(true); setTimeout(() => { setExporting(false); toast.success('PDF exported', `${p.firstName}_${p.lastName}_dossier.pdf`); }, 1500); };

    return (
        <>
        <PageMeta title={`${p.firstName} ${p.lastName}`} description={`Intelligence dossier for ${p.firstName} ${p.lastName}`} section="persons" entityName={`${p.firstName} ${p.lastName}`} />
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <style>{`@media(max-width:768px){.show-vtabs{display:none!important}.show-htabs{display:flex!important}.show-layout{flex-direction:column!important}.show-header-row{flex-direction:column!important}.show-header-btns{width:100%}.show-header-btns button{flex:1}}`}</style>

            {/* Avatar Lightbox */}
            {avatarLightbox && p.avatar && (
                <div className="veh-lightbox" onClick={() => setAvatarLightbox(false)}>
                    <button className="veh-lightbox-close" onClick={() => setAvatarLightbox(false)}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
                    <img src={p.avatar} alt={`${p.firstName} ${p.lastName}`} onClick={e => e.stopPropagation()} style={{ borderRadius: 12 }} />
                </div>
            )}

            <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
                <div className="show-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, minWidth: 0 }}>
                        <div onClick={() => p.avatar && setAvatarLightbox(true)} style={{ width: 68, height: 68, borderRadius: '50%', overflow: 'hidden', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${theme.border}`, flexShrink: 0, cursor: p.avatar ? 'pointer' : 'default', transition: 'transform 0.15s' }} onMouseEnter={e => p.avatar && (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>{p.avatar ? <img src={p.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{p.firstName[0]}{p.lastName[0]}</span>}</div>
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>{p.firstName} {p.middleName ? p.middleName + ' ' : ''}{p.lastName}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>{p.nickname && <span style={{ fontSize: 12, color: theme.accent, fontWeight: 600 }}>"{p.nickname}"</span>}<span style={{ fontSize: 12, color: theme.textSecondary }}>{p.nationality} · {p.gender} · {p.dob}</span></div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><SB status={p.status} /><RB risk={p.risk} /></div>
                        </div>
                    </div>
                    <div className="show-header-btns" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                        <Button variant="secondary" onClick={() => router.visit('/persons')} style={{ width: 'auto', padding: '8px 14px', fontSize: 11 }}>Back</Button>
                        <Button variant="secondary" onClick={handlePrint} style={{ width: 'auto', padding: '8px 14px', fontSize: 11 }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5V1h8v4"/><rect x="2" y="5" width="12" height="6" rx="1"/><path d="M4 11v4h8v-4"/></svg>Print</Button>
                        <Button variant="secondary" onClick={handleExportPdf} loading={exporting} style={{ width: 'auto', padding: '8px 14px', fontSize: 11 }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14H2V2h8l4 4v8h-2"/><polyline points="10,2 10,6 14,6"/><path d="M8 10v5m0 0l-2-2m2 2l2-2"/></svg>Export PDF</Button>
                        <Button onClick={() => router.visit(`/persons/${p.id}/edit`)} style={{ width: 'auto', padding: '8px 14px', fontSize: 11 }}>Edit</Button>
                    </div>
                </div>
            </div>

            <div className="show-layout" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div className="show-vtabs" style={{ width: 170, flexShrink: 0, position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {showTabs.map(t => { const a = tab === t.id; return <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: a ? 600 : 400, color: a ? theme.accent : theme.textSecondary, background: a ? theme.accentDim : 'transparent', border: 'none', textAlign: 'left' as const, width: '100%' }}><span style={{ display: 'flex', color: a ? theme.accent : theme.textDim }}>{t.icon}</span>{t.label}</button>; })}
                </div>
                <div className="show-htabs" style={{ display: 'none', gap: 2, marginBottom: 16, borderBottom: `1px solid ${theme.border}`, overflowX: 'auto', width: '100%', scrollbarWidth: 'none' as const }}>
                    {showTabs.map(t => { const a = tab === t.id; return <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${a ? theme.accent : 'transparent'}`, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: a ? theme.text : theme.textSecondary, fontSize: 12, fontWeight: a ? 700 : 500, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{t.label}</button>; })}
                </div>

                <div style={{ flex: 1, minWidth: 0, animation: 'argux-fadeIn 0.2s ease-out' }}>
                    {tab === 'overview' && <>
                        {/* AI Summary */}
                        <Section title="AI Intelligence Summary">
                            <div style={{ background: `linear-gradient(135deg, ${theme.accentDim}, rgba(10,14,22,0.4))`, border: `1px solid ${theme.accent}20`, borderRadius: 10, padding: 18 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: 6, background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg></div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: theme.accent, letterSpacing: '0.06em' }}>GENERATED BY ARGUX AI — {summaryDate}</span>
                                    </div>
                                    <button onClick={handleGenerateSummary} disabled={summaryLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, background: theme.accent, color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: summaryLoading ? 'not-allowed' : 'pointer', opacity: summaryLoading ? 0.7 : 1, transition: 'all 0.15s' }}>
                                        {summaryLoading ? <><svg width="12" height="12" viewBox="0 0 16 16" style={{ animation: 'argux-spin 0.8s linear infinite' }}><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round"/></svg>Generating...</> : <><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s3-7 7-7 7 7 7 7"/><path d="M14.5 2.5L12 5l2.5 2.5"/><path d="M12 5h2.5V2.5"/></svg>Generate Summary</>}
                                    </button>
                                </div>
                                {summaryLoading ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1,2,3,4].map(i => <div key={i} style={{ height: 14, borderRadius: 4, background: `${theme.accent}15`, animation: 'argux-shimmer 1.8s ease-in-out infinite', backgroundSize: '400% 100%', width: i === 4 ? '60%' : '100%' }} />)}</div>
                                ) : (
                                    <p style={{ fontSize: 13, color: theme.text, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' as const }}>{summaryText}</p>
                                )}
                            </div>
                        </Section>

                        <Section title="Personal Information">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 0 }}>
                                <Field label="First Name" value={p.firstName} /><Field label="Last Name" value={p.lastName} /><Field label="Middle Name" value={p.middleName} /><Field label="Maiden Name" value={p.maidenName} /><Field label="Nickname" value={p.nickname} /><Field label="Date of Birth" value={p.dob} /><Field label="Gender" value={p.gender} /><Field label="Nationality" value={p.nationality} /><Field label="Country" value={p.country} /><Field label="Religion" value={p.religion} /><Field label="Primary Language" value={p.language} /><Field label="Tax Number" value={p.taxNumber} mono /><Field label="UUID" value={p.uuid} mono /><Field label="Created" value={new Date(p.createdAt).toLocaleDateString()} /><Field label="Updated" value={new Date(p.updatedAt).toLocaleDateString()} />
                            </div>
                        </Section>

                        {p.languages.length > 0 && <Section title={`Languages (${p.languages.length})`}>
                            <div style={{ display: 'grid', gap: 6 }}>{p.languages.map(l => <div key={l.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', background: theme.bgInput, borderRadius: 6, border: `1px solid ${theme.border}`, flexWrap: 'wrap' }}><span style={{ fontSize: 13, fontWeight: 600, color: theme.text, minWidth: 100 }}>{l.language}</span><span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: theme.accentDim, color: theme.accent, fontWeight: 600 }}>{l.level}</span>{l.notes && <span style={{ fontSize: 11, color: theme.textDim }}>— {l.notes}</span>}</div>)}</div>
                        </Section>}

                        {p.education.length > 0 && <Section title={`Education (${p.education.length})`}>
                            <div style={{ display: 'grid', gap: 8 }}>{p.education.map(e => (
                                <div key={e.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{e.school}</div>
                                            <div style={{ fontSize: 12, color: theme.accent, fontWeight: 500, marginTop: 2 }}>{e.degree}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' as const }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{e.startYear} — {e.endYear}</span>
                                            {e.country && <div style={{ fontSize: 11, color: theme.textDim, marginTop: 2 }}>{e.country}</div>}
                                        </div>
                                    </div>
                                    {e.website && <div style={{ fontSize: 11, color: theme.textDim, marginTop: 6 }}>{e.website}</div>}
                                </div>
                            ))}</div>
                        </Section>}

                        <Section title="Quick Contacts">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 0 }}><Field label="Primary Email" value={p.email} /><Field label="Primary Phone" value={p.phone} mono /></div>
                        </Section>
                    </>}

                    {tab === 'contacts' && <>
                        <Section title={`Email Addresses (${p.emails.length})`}>{p.emails.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No emails.</p> : p.emails.map(em => <div key={em.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}><span style={{ fontSize: 13, color: theme.accent, wordBreak: 'break-all' as const }}>{em.email}</span><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}><span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.05)', color: theme.textSecondary }}>{em.type}</span><span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: em.status==='Active'?theme.successDim:theme.dangerDim, color: em.status==='Active'?theme.success:theme.danger }}>{em.status}</span>{em.notes && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: theme.accentDim, color: theme.textDim }}>{em.notes}</span>}</div></div></div>)}</Section>
                        <Section title={`Phone Numbers (${p.phones.length})`}>{p.phones.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No phones.</p> : p.phones.map(ph => <div key={ph.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}><span style={{ fontSize: 14, fontWeight: 600, color: theme.text, fontFamily: "'JetBrains Mono', monospace" }}>{ph.number}</span><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}><span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.05)', color: theme.textSecondary }}>{ph.type}</span><span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: ph.status==='Active'?theme.successDim:theme.dangerDim, color: ph.status==='Active'?theme.success:theme.danger }}>{ph.status}</span>{ph.notes && <span style={{ fontSize: 9, color: theme.textDim }}>{ph.notes}</span>}</div></div><div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{[['WhatsApp',ph.isWhatsApp],['WeChat',ph.isWeChat],['Telegram',ph.isTelegram],['Signal',ph.isSignal],['Viber',ph.isViber]].filter(([,v])=>v).map(([n])=><span key={n as string} style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: theme.accentDim, color: theme.accent }}>{n as string}</span>)}</div></div>)}</Section>
                    </>}

                    {tab === 'social' && <Section title="Social Media">{p.socials.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No profiles.</p> : p.socials.map(s => <div key={s.platform} style={{ marginBottom: 14 }}><h4 style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 22, height: 22, borderRadius: 5, background: theme.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: theme.accent }}>{s.platform[0]}</span>{s.platform} ({s.profiles.length})</h4>{s.profiles.map(pr => <div key={pr.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '8px 14px', marginBottom: 4, fontSize: 12, color: theme.accent, wordBreak: 'break-all' as const }}>{pr.url}</div>)}</div>)}</Section>}

                    {tab === 'addresses' && <Section title={`Addresses (${p.addresses.length})`}>{p.addresses.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No addresses.</p> : p.addresses.map((a, i) => <div key={a.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6 }}>#{i+1}{a.notes ? ` — ${a.notes}` : ''}</div><div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{a.address} {a.addressNumber}</div><div style={{ fontSize: 13, color: theme.textSecondary }}>{a.zipCode} {a.city}, {a.country}</div></div>)}</Section>}

                    {tab === 'employment' && <Section title={`Employment History (${p.employment.length})`}>
                        {p.employment.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No employment records.</p> : p.employment.map(emp => (
                            <div key={emp.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 16, marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{emp.title}</div>
                                        <div style={{ fontSize: 13, color: theme.accent, fontWeight: 500, marginTop: 2 }}>{emp.company}</div>
                                        {(emp.city || emp.country) && <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1C5.24 1 3 3.24 3 6c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z"/><circle cx="8" cy="6" r="2"/></svg>{[emp.city, emp.country].filter(Boolean).join(', ')}</div>}
                                    </div>
                                    <div style={{ textAlign: 'right' as const }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{emp.startDate} — {emp.endDate || 'Present'}</span>
                                        {!emp.endDate && <div style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: theme.successDim, color: theme.success, display: 'inline-block', marginTop: 4 }}>Current</div>}
                                    </div>
                                </div>
                                {emp.notes && <div style={{ fontSize: 12, color: theme.textDim, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${theme.border}` }}>{emp.notes}</div>}
                            </div>
                        ))}
                    </Section>}

                    {tab === 'vehicles' && (() => {
                        const personVehicles = mockVehicles.filter(v => v.personId === p.id);
                        const colorMap: Record<string,string> = {'Black':'#111','White':'#f5f5f5','Silver':'#c0c0c0','Gray':'#808080','Red':'#dc2626','Blue':'#3b82f6','Dark Blue':'#1e40af','Green':'#22c55e','Dark Green':'#166534','Brown':'#92400e','Beige':'#d2b48c','Yellow':'#eab308','Orange':'#f97316','Gold':'#d4a017','Burgundy':'#800020','Olive':'#808000','Matte Black':'#1a1a1a','Pearl White':'#f0ece2','Champagne':'#f7e7ce','Gunmetal':'#2a3439','British Racing Green':'#004225'};
                        return <Section title={`Vehicles (${personVehicles.length})`}>
                            {personVehicles.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No vehicles registered.</p> : personVehicles.map(v => (
                                <div key={v.id} onClick={() => router.visit(`/vehicles/${v.id}`)} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 16, marginBottom: 10, cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={e => (e.currentTarget.style.background = theme.bgInput)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ background: theme.bg, border: `2px solid ${theme.accent}30`, borderRadius: 8, padding: '8px 14px', textAlign: 'center' as const }}><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 800, color: theme.text, letterSpacing: '0.04em' }}>{v.plate}</div></div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{v.make} {v.model}</div>
                                                <div style={{ fontSize: 12, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                                    <span>{v.type}</span><span>·</span><span>{v.year}</span><span>·</span>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: colorMap[v.color] || '#666', border: '1px solid rgba(255,255,255,0.15)', display: 'inline-block' }} />{v.color}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${statusColors[v.status]}18`, color: statusColors[v.status], border: `1px solid ${statusColors[v.status]}30` }}>{v.status}</span>
                                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${riskColors[v.risk]}18`, color: riskColors[v.risk], border: `1px solid ${riskColors[v.risk]}30`, textTransform: 'uppercase' as const }}>{v.risk}</span>
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><path d="M6 3l5 5-5 5"/></svg>
                                        </div>
                                    </div>
                                    {v.notes && <div style={{ fontSize: 11, color: theme.textDim, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${theme.border}` }}>{v.notes}</div>}
                                    {v.orgName && <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>Org: {v.orgName}</div>}
                                </div>
                            ))}
                        </Section>;
                    })()}

                    {tab === 'devices' && <Section title="Surveillance Devices"><EntityDevices entityId={p.id} entityType="person" entityName={`${p.firstName} ${p.lastName}`} /></Section>}

                    {tab === 'connections' && <Section title="Connections"><ConnectionsBubble entityId={`p-${p.id}`} /></Section>}

                    {tab === 'ai' && <EntityChat entityName={`${p.firstName} ${p.lastName}`} entityType="person" />}

                    {tab === 'notes' && <Section title={`Notes (${p.notes.length})`}>{p.notes.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No notes.</p> : p.notes.map(n => <div key={n.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}><p style={{ fontSize: 13, color: theme.text, lineHeight: 1.6, margin: '0 0 8px', whiteSpace: 'pre-wrap' as const }}>{n.text}</p><div style={{ fontSize: 10, color: theme.textDim }}>Created: {new Date(n.createdAt).toLocaleString()} · Updated: {new Date(n.updatedAt).toLocaleString()}</div></div>)}</Section>}
                </div>
            </div>
        </div>
        </>
    );
}

PersonShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
