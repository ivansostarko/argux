import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui';
import { theme } from '../../lib/theme';
import { getPersonById, riskColors, type Risk } from '../../mock/persons';

type ShowTab = 'overview' | 'contacts' | 'social' | 'addresses' | 'notes';
const RiskBadge = ({ risk }: { risk: Risk }) => { const c = riskColors[risk]; return <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 5, background: `${c}18`, color: c, border: `1px solid ${c}30`, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{risk}</span>; };
const Field = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => value ? <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 3 }}>{label}</div><div style={{ fontSize: 13, color: theme.text, fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit' }}>{value}</div></div> : null;
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => <div style={{ marginBottom: 24 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${theme.border}` }}>{title}</div>{children}</div>;

export default function PersonShow() {
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const person = getPersonById(Number(id));
    const [tab, setTab] = useState<ShowTab>('overview');

    if (!person) return <div style={{ textAlign: 'center', padding: '60px 20px' }}><h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Person Not Found</h2><p style={{ fontSize: 13, color: theme.textSecondary }}>ID {String(id)} does not exist.</p></div>;

    const tabs: { id: ShowTab; label: string }[] = [{ id: 'overview', label: 'Overview' }, { id: 'contacts', label: `Contacts (${person.emails.length + person.phones.length})` }, { id: 'social', label: 'Social Media' }, { id: 'addresses', label: `Addresses (${person.addresses.length})` }, { id: 'notes', label: `Notes (${person.notes.length})` }];

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Header card */}
            <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${theme.border}`, flexShrink: 0 }}>
                        {person.avatar ? <img src={person.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{person.firstName[0]}{person.lastName[0]}</span>}
                    </div>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>{person.firstName} {person.middleName ? person.middleName + ' ' : ''}{person.lastName}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            {person.nickname && <span style={{ fontSize: 12, color: theme.accent, fontWeight: 600 }}>"{person.nickname}"</span>}
                            <span style={{ fontSize: 12, color: theme.textSecondary }}>{person.nationality} · {person.gender} · {person.dob}</span>
                        </div>
                        <div style={{ marginTop: 8 }}><RiskBadge risk={person.risk} /></div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" onClick={() => router.visit('/persons')} style={{ width: 'auto', padding: '8px 16px', fontSize: 11 }}>Back to list</Button>
                    <Button onClick={() => router.visit(`/persons/${person.id}/edit`)} style={{ width: 'auto', padding: '8px 16px', fontSize: 11 }}>Edit Person</Button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: `1px solid ${theme.border}`, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
                {tabs.map(t => { const active = tab === t.id; return <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${active ? theme.accent : 'transparent'}`, padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', color: active ? theme.text : theme.textSecondary, fontSize: 13, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{t.label}</button>; })}
            </div>

            <div style={{ animation: 'argux-fadeIn 0.2s ease-out' }}>
                {tab === 'overview' && (
                    <>
                        <Section title="Personal Information">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 0 }}>
                                <Field label="First Name" value={person.firstName} />
                                <Field label="Last Name" value={person.lastName} />
                                <Field label="Middle Name" value={person.middleName} />
                                <Field label="Nickname" value={person.nickname} />
                                <Field label="Date of Birth" value={person.dob} />
                                <Field label="Gender" value={person.gender} />
                                <Field label="Nationality" value={person.nationality} />
                                <Field label="Country" value={person.country} />
                                <Field label="Primary Language" value={person.language} />
                                <Field label="Tax Number" value={person.taxNumber} mono />
                            </div>
                        </Section>
                        <Section title="Quick Contacts">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 0 }}>
                                <Field label="Primary Email" value={person.email} />
                                <Field label="Primary Phone" value={person.phone} mono />
                            </div>
                        </Section>
                    </>
                )}

                {tab === 'contacts' && (
                    <>
                        <Section title="Email Addresses">
                            {person.emails.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No email addresses recorded.</p> : person.emails.map(em => (
                                <div key={em.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 13, color: theme.accent }}>{em.email}</span>
                                    {em.notes && <span style={{ fontSize: 11, color: theme.textDim, background: `${theme.accent}10`, padding: '2px 8px', borderRadius: 4 }}>{em.notes}</span>}
                                </div>
                            ))}
                        </Section>
                        <Section title="Phone Numbers">
                            {person.phones.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No phone numbers recorded.</p> : person.phones.map(ph => (
                                <div key={ph.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: theme.text, fontFamily: "'JetBrains Mono', monospace" }}>{ph.number}</span>
                                        {ph.notes && <span style={{ fontSize: 11, color: theme.textDim }}>{ph.notes}</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {[['WhatsApp', ph.isWhatsApp], ['WeChat', ph.isWeChat], ['Telegram', ph.isTelegram], ['Signal', ph.isSignal], ['Viber', ph.isViber]].filter(([, v]) => v).map(([name]) => (
                                            <span key={name as string} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: theme.accentDim, color: theme.accent, border: `1px solid ${theme.accent}20` }}>{name as string}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </Section>
                    </>
                )}

                {tab === 'social' && (
                    <Section title="Social Media Profiles">
                        {person.socials.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No social media profiles recorded.</p> : person.socials.map(s => (
                            <div key={s.platform} style={{ marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 22, height: 22, borderRadius: 5, background: theme.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: theme.accent }}>{s.platform[0]}</span>
                                    {s.platform}
                                </h4>
                                {s.profiles.map(p => (
                                    <div key={p.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px 16px', marginBottom: 6, fontSize: 13, color: theme.accent, wordBreak: 'break-all' as const }}>{p.url}</div>
                                ))}
                            </div>
                        ))}
                    </Section>
                )}

                {tab === 'addresses' && (
                    <Section title="Registered Addresses">
                        {person.addresses.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No addresses recorded.</p> : person.addresses.map((addr, i) => (
                            <div key={addr.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 16, marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary }}>Address #{i + 1} {addr.notes && `— ${addr.notes}`}</span>
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{addr.address} {addr.addressNumber}</div>
                                <div style={{ fontSize: 13, color: theme.textSecondary }}>{addr.zipCode} {addr.city}, {addr.country}</div>
                            </div>
                        ))}
                    </Section>
                )}

                {tab === 'notes' && (
                    <Section title="Intelligence Notes">
                        {person.notes.length === 0 ? <p style={{ fontSize: 13, color: theme.textDim }}>No notes recorded for this person.</p> : person.notes.map(note => (
                            <div key={note.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 16, marginBottom: 10 }}>
                                <p style={{ fontSize: 13, color: theme.text, lineHeight: 1.6, margin: '0 0 8px', whiteSpace: 'pre-wrap' as const }}>{note.text}</p>
                                <div style={{ fontSize: 10, color: theme.textDim }}>Created: {new Date(note.createdAt).toLocaleString()} · Updated: {new Date(note.updatedAt).toLocaleString()}</div>
                            </div>
                        ))}
                    </Section>
                )}
            </div>
        </div>
    );
}

PersonShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
