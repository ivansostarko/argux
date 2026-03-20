import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button, Icons } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { getPersonById, riskColors, statusColors, type Risk, type Status } from '../../mock/persons';

type ShowTab = 'overview' | 'contacts' | 'social' | 'addresses' | 'notes';
const RB = ({ risk }: { risk: Risk }) => { const c = riskColors[risk]; return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${c}18`, color: c, border: `1px solid ${c}30`, textTransform: 'uppercase' as const }}>{risk}</span>; };
const SB = ({ status }: { status: Status }) => { const c = statusColors[status]; return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${c}18`, color: c, border: `1px solid ${c}30` }}>{status}</span>; };
const Field = ({ label, value, mono }: { label: string; value?: string; mono?: boolean }) => value ? <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 3 }}>{label}</div><div style={{ fontSize: 13, color: theme.text, fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', wordBreak: 'break-all' as const }}>{value}</div></div> : null;
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => <div style={{ marginBottom: 24 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${theme.border}` }}>{title}</div>{children}</div>;

const showTabs: { id: ShowTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: Icons.user(14) },
    { id: 'contacts', label: 'Contacts', icon: Icons.mail(14) },
    { id: 'social', label: 'Social', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="4" cy="8" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><line x1="5.8" y1="7" x2="10.2" y2="5"/><line x1="5.8" y1="9" x2="10.2" y2="11"/></svg> },
    { id: 'addresses', label: 'Addresses', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1C5.24 1 3 3.24 3 6c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z"/><circle cx="8" cy="6" r="2"/></svg> },
    { id: 'notes', label: 'Notes', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4z"/><polyline points="10,1 10,4 13,4"/></svg> },
];

export default function PersonShow() {
    const toast = useToast();
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const p = getPersonById(Number(id));
    const [tab, setTab] = useState<ShowTab>('overview');
    const [exporting, setExporting] = useState(false);

    if (!p) return <div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ fontSize: 48, marginBottom: 16 }}>⚠</div><h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Person Not Found</h2><p style={{ fontSize: 13, color: theme.textSecondary }}>ID {String(id)} not found.</p><Button variant="secondary" onClick={() => router.visit('/persons')} style={{ width: 'auto', padding: '10px 20px', marginTop: 16 }}>Back to Persons</Button></div>;

    const handlePrint = () => { window.print(); };

    const handleExportPdf = () => {
        setExporting(true);
        setTimeout(() => {
            setExporting(false);
            toast.success('PDF exported', `${p.firstName}_${p.lastName}_dossier.pdf generated.`);
        }, 1500);
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Print styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                    .no-print { display: none !important; }
                }
                @media(max-width:768px) { .show-vtabs { display: none !important; } .show-htabs { display: flex !important; } .show-layout { flex-direction: column !important; } .show-header-row { flex-direction: column !important; } }
            `}</style>

            {/* Header card */}
            <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
                <div className="show-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, minWidth: 0 }}>
                        <div style={{ width: 68, height: 68, borderRadius: '50%', overflow: 'hidden', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${theme.border}`, flexShrink: 0 }}>
                            {p.avatar ? <img src={p.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{p.firstName[0]}{p.lastName[0]}</span>}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.firstName} {p.middleName ? p.middleName + ' ' : ''}{p.lastName}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                                {p.nickname && <span style={{ fontSize: 12, color: theme.accent, fontWeight: 600 }}>"{p.nickname}"</span>}
                                <span style={{ fontSize: 12, color: theme.textSecondary }}>{p.nationality} · {p.gender} · {p.dob}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><SB status={p.status} /><RB risk={p.risk} /></div>
                        </div>
                    </div>
                    <div className="no-print" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                        <Button variant="secondary" onClick={() => router.visit('/persons')} style={{ width: 'auto', padding: '8px 14px', fontSize: 11 }}>Back</Button>
                        <Button variant="secondary" onClick={handlePrint} style={{ width: 'auto', padding: '8px 14px', fontSize: 11 }}>
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5V1h8v4"/><rect x="2" y="5" width="12" height="6" rx="1"/><path d="M4 11v4h8v-4"/></svg>
                            Print
                        </Button>
                        <Button variant="secondary" onClick={handleExportPdf} loading={exporting} style={{ width: 'auto', padding: '8px 14px', fontSize: 11 }}>
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14H2V2h8l4 4v8h-2"/><polyline points="10,2 10,6 14,6"/><path d="M8 10v5m0 0l-2-2m2 2l2-2"/></svg>
                            Export PDF
                        </Button>
                        <Button onClick={() => router.visit(`/persons/${p.id}/edit`)} style={{ width: 'auto', padding: '8px 14px', fontSize: 11 }}>Edit</Button>
                    </div>
                </div>
            </div>

            {/* Layout: vertical tabs + content */}
            <div className="show-layout print-area" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Vertical tabs — desktop */}
                <div className="show-vtabs no-print" style={{ width: 170, flexShrink: 0, position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {showTabs.map(t => { const a = tab === t.id; return (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: a ? 600 : 400, color: a ? theme.accent : theme.textSecondary, background: a ? theme.accentDim : 'transparent', border: 'none', textAlign: 'left' as const, width: '100%' }}>
                            <span style={{ display: 'flex', color: a ? theme.accent : theme.textDim }}>{t.icon}</span>{t.label}
                        </button>
                    ); })}
                </div>

                {/* Horizontal tabs — mobile */}
                <div className="show-htabs no-print" style={{ display: 'none', gap: 2, marginBottom: 16, borderBottom: `1px solid ${theme.border}`, overflowX: 'auto', width: '100%', scrollbarWidth: 'none' as const }}>
                    {showTabs.map(t => { const a = tab === t.id; return <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${a ? theme.accent : 'transparent'}`, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: a ? theme.text : theme.textSecondary, fontSize: 12, fontWeight: a ? 700 : 500, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{t.label}</button>; })}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, animation: 'argux-fadeIn 0.2s ease-out' }}>
                    {tab === 'overview' && <>
                        <Section title="Personal Information">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 0 }}>
                                <Field label="First Name" value={p.firstName} />
                                <Field label="Last Name" value={p.lastName} />
                                <Field label="Middle Name" value={p.middleName} />
                                <Field label="Maiden Name" value={p.maidenName} />
                                <Field label="Nickname" value={p.nickname} />
                                <Field label="Date of Birth" value={p.dob} />
                                <Field label="Gender" value={p.gender} />
                                <Field label="Nationality" value={p.nationality} />
                                <Field label="Country" value={p.country} />
                                <Field label="Religion" value={p.religion} />
                                <Field label="Primary Language" value={p.language} />
                                <Field label="Tax Number" value={p.taxNumber} mono />
                                <Field label="UUID" value={p.uuid} mono />
                                <Field label="Created" value={new Date(p.createdAt).toLocaleDateString()} />
                                <Field label="Last Updated" value={new Date(p.updatedAt).toLocaleDateString()} />
                            </div>
                        </Section>
                        {p.languages.length > 0 && <Section title={`Languages (${p.languages.length})`}>
                            <div style={{ display: 'grid', gap: 6 }}>
                                {p.languages.map(l => (
                                    <div key={l.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', background: theme.bgInput, borderRadius: 6, border: `1px solid ${theme.border}`, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, minWidth: 100 }}>{l.language}</span>
                                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: theme.accentDim, color: theme.accent, fontWeight: 600 }}>{l.level}</span>
                                        {l.notes && <span style={{ fontSize: 11, color: theme.textDim }}>— {l.notes}</span>}
                                    </div>
                                ))}
                            </div>
                        </Section>}
                        <Section title="Quick Contacts">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 0 }}>
                                <Field label="Primary Email" value={p.email} />
                                <Field label="Primary Phone" value={p.phone} mono />
                            </div>
                        </Section>
                    </>}

                    {tab === 'contacts' && <>
                        <Section title={`Email Addresses (${p.emails.length})`}>
                            {p.emails.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No emails recorded.</p> : p.emails.map(em => (
                                <div key={em.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                                        <span style={{ fontSize: 13, color: theme.accent, wordBreak: 'break-all' as const }}>{em.email}</span>
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.05)', color: theme.textSecondary }}>{em.type}</span>
                                            <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: em.status === 'Active' ? theme.successDim : theme.dangerDim, color: em.status === 'Active' ? theme.success : theme.danger }}>{em.status}</span>
                                            {em.notes && <span style={{ fontSize: 9, color: theme.textDim, padding: '2px 6px', borderRadius: 3, background: theme.accentDim }}>{em.notes}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Section>
                        <Section title={`Phone Numbers (${p.phones.length})`}>
                            {p.phones.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No phones recorded.</p> : p.phones.map(ph => (
                                <div key={ph.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: theme.text, fontFamily: "'JetBrains Mono', monospace" }}>{ph.number}</span>
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.05)', color: theme.textSecondary }}>{ph.type}</span>
                                            <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: ph.status === 'Active' ? theme.successDim : theme.dangerDim, color: ph.status === 'Active' ? theme.success : theme.danger }}>{ph.status}</span>
                                            {ph.notes && <span style={{ fontSize: 9, color: theme.textDim }}>{ph.notes}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                        {[['WhatsApp', ph.isWhatsApp], ['WeChat', ph.isWeChat], ['Telegram', ph.isTelegram], ['Signal', ph.isSignal], ['Viber', ph.isViber]].filter(([, v]) => v).map(([n]) => (
                                            <span key={n as string} style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: theme.accentDim, color: theme.accent }}>{n as string}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </Section>
                    </>}

                    {tab === 'social' && (
                        <Section title="Social Media Profiles">
                            {p.socials.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No social media profiles recorded.</p> : p.socials.map(s => (
                                <div key={s.platform} style={{ marginBottom: 14 }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ width: 22, height: 22, borderRadius: 5, background: theme.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: theme.accent }}>{s.platform[0]}</span>
                                        {s.platform} <span style={{ fontSize: 10, fontWeight: 400, color: theme.textDim }}>({s.profiles.length})</span>
                                    </h4>
                                    {s.profiles.map(pr => (
                                        <div key={pr.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '8px 14px', marginBottom: 4, fontSize: 12, color: theme.accent, wordBreak: 'break-all' as const }}>{pr.url}</div>
                                    ))}
                                </div>
                            ))}
                        </Section>
                    )}

                    {tab === 'addresses' && (
                        <Section title={`Registered Addresses (${p.addresses.length})`}>
                            {p.addresses.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No addresses recorded.</p> : p.addresses.map((a, i) => (
                                <div key={a.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: theme.textSecondary }}>Address #{i + 1}{a.notes ? ` — ${a.notes}` : ''}</span>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{a.address} {a.addressNumber}</div>
                                    <div style={{ fontSize: 13, color: theme.textSecondary }}>{a.zipCode} {a.city}, {a.country}</div>
                                </div>
                            ))}
                        </Section>
                    )}

                    {tab === 'notes' && (
                        <Section title={`Intelligence Notes (${p.notes.length})`}>
                            {p.notes.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No notes recorded for this person.</p> : p.notes.map(n => (
                                <div key={n.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                                    <p style={{ fontSize: 13, color: theme.text, lineHeight: 1.6, margin: '0 0 8px', whiteSpace: 'pre-wrap' as const }}>{n.text}</p>
                                    <div style={{ fontSize: 10, color: theme.textDim }}>Created: {new Date(n.createdAt).toLocaleString()} · Updated: {new Date(n.updatedAt).toLocaleString()}</div>
                                </div>
                            ))}
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}

PersonShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
