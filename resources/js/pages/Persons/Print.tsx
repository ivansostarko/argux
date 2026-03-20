import { usePage } from '@inertiajs/react';
import { getPersonById, riskColors, statusColors, type Person, type Risk, type Status } from '../../mock/persons';

const colors = { bg: '#ffffff', text: '#111827', textSec: '#4b5563', textDim: '#9ca3af', border: '#e5e7eb', accent: '#1d4ed8' };

function generateSummary(p: Person): string {
    const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
    const riskNote = p.risk === 'Critical' ? 'CRITICAL risk — immediate attention required.' : p.risk === 'High' ? 'HIGH risk — close monitoring warranted.' : p.risk === 'Medium' ? 'MEDIUM risk — notable flags present.' : p.risk === 'Low' ? 'LOW risk — minimal threat indicators.' : 'NO RISK classification.';
    const langStr = p.languages.length > 0 ? `Languages: ${p.languages.map(l => `${l.language} (${l.level})`).join(', ')}.` : '';
    const contactStr = `${p.emails.length} email(s), ${p.phones.length} phone(s) on file.`;
    const addrStr = p.addresses.length > 0 ? `Primary location: ${p.addresses[0].city}, ${p.addresses[0].country}.` : 'No registered addresses.';
    const eduStr = p.education.length > 0 ? `Education: ${p.education.map(e => `${e.degree} — ${e.school} (${e.startYear}–${e.endYear})`).join('; ')}.` : '';
    const noteStr = p.notes.length > 0 ? `${p.notes.length} intelligence note(s) on file.` : 'No intelligence notes.';
    return `${p.firstName} ${p.lastName}${p.nickname ? ` ("${p.nickname}")` : ''}, ${age}y/o ${p.gender.toLowerCase()}, ${p.nationality} national. Status: ${p.status}. ${riskNote} ${langStr} ${contactStr} ${addrStr} ${eduStr} ${noteStr} Record ID: ${p.uuid}.`;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20, pageBreakInside: 'avoid' as const }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.accent, letterSpacing: '0.1em', textTransform: 'uppercase' as const, borderBottom: `2px solid ${colors.accent}`, paddingBottom: 4, marginBottom: 10 }}>{title}</div>
        {children}
    </div>
);

const Field = ({ label, value }: { label: string; value?: string }) => value ? (
    <div style={{ display: 'inline-flex', flexDirection: 'column', minWidth: 160, marginBottom: 8, marginRight: 20 }}>
        <span style={{ fontSize: 8, fontWeight: 700, color: colors.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>{label}</span>
        <span style={{ fontSize: 11, color: colors.text, marginTop: 1 }}>{value}</span>
    </div>
) : null;

const Badge = ({ text, color }: { text: string; color: string }) => (
    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3, border: `1.5px solid ${color}`, color, display: 'inline-block', marginRight: 6, textTransform: 'uppercase' as const }}>{text}</span>
);

export default function PersonPrint() {
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const p = getPersonById(Number(id));

    if (!p) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Arial, sans-serif' }}><h2>Person Not Found</h2></div>;

    return (
        <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: colors.text, background: colors.bg, maxWidth: 800, margin: '0 auto', padding: '30px 40px', fontSize: 11, lineHeight: 1.5 }}>
            <style>{`@media print { body { margin: 0; padding: 0; } @page { margin: 15mm 12mm; size: A4; } } .print-trigger { cursor: pointer; }`}</style>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `3px solid ${colors.text}`, paddingBottom: 14, marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: colors.accent, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>ARGUX TACTICAL INTELLIGENCE PLATFORM</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, marginTop: 4 }}>{p.firstName} {p.middleName ? p.middleName + ' ' : ''}{p.lastName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        {p.nickname && <span style={{ fontSize: 12, fontWeight: 600, color: colors.textSec }}>"{p.nickname}"</span>}
                        <span style={{ fontSize: 11, color: colors.textSec }}>{p.nationality} · {p.gender} · {p.dob}</span>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <Badge text={p.status} color={statusColors[p.status]} />
                        <Badge text={p.risk} color={riskColors[p.risk]} />
                    </div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                    <div style={{ fontSize: 9, color: colors.textDim }}>SUBJECT DOSSIER</div>
                    <div style={{ fontSize: 9, color: colors.textDim, fontFamily: 'monospace' }}>ID: {p.uuid}</div>
                    <div style={{ fontSize: 9, color: colors.textDim }}>Generated: {new Date().toLocaleString()}</div>
                    <button className="print-trigger" onClick={() => window.print()} style={{ marginTop: 10, padding: '6px 16px', border: `1px solid ${colors.accent}`, borderRadius: 4, background: colors.accent, color: '#fff', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Print This Page</button>
                </div>
            </div>

            {/* AI Summary */}
            <Section title="Intelligence Summary">
                <div style={{ background: '#f0f4ff', border: `1px solid ${colors.accent}40`, borderRadius: 6, padding: 14, fontSize: 11, lineHeight: 1.7, color: colors.text }}>{generateSummary(p)}</div>
            </Section>

            {/* Personal Information */}
            <Section title="Personal Information">
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Field label="First Name" value={p.firstName} /><Field label="Last Name" value={p.lastName} /><Field label="Middle Name" value={p.middleName} /><Field label="Maiden Name" value={p.maidenName} /><Field label="Nickname" value={p.nickname} /><Field label="DOB" value={p.dob} /><Field label="Gender" value={p.gender} /><Field label="Nationality" value={p.nationality} /><Field label="Country" value={p.country} /><Field label="Religion" value={p.religion} /><Field label="Language" value={p.language} /><Field label="Tax Number" value={p.taxNumber} />
                </div>
            </Section>

            {/* Languages */}
            {p.languages.length > 0 && <Section title={`Languages (${p.languages.length})`}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr style={{ borderBottom: `1px solid ${colors.border}` }}>{['Language', 'Level', 'Notes'].map(h => <th key={h} style={{ textAlign: 'left' as const, padding: '4px 8px', fontSize: 9, fontWeight: 700, color: colors.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{h}</th>)}</tr></thead>
                    <tbody>{p.languages.map(l => <tr key={l.id} style={{ borderBottom: `1px solid ${colors.border}20` }}><td style={{ padding: '5px 8px', fontWeight: 600 }}>{l.language}</td><td style={{ padding: '5px 8px' }}>{l.level}</td><td style={{ padding: '5px 8px', color: colors.textSec }}>{l.notes || '—'}</td></tr>)}</tbody>
                </table>
            </Section>}

            {/* Education */}
            {p.education.length > 0 && <Section title={`Education (${p.education.length})`}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr style={{ borderBottom: `1px solid ${colors.border}` }}>{['Institution', 'Degree', 'Country', 'Period'].map(h => <th key={h} style={{ textAlign: 'left' as const, padding: '4px 8px', fontSize: 9, fontWeight: 700, color: colors.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{h}</th>)}</tr></thead>
                    <tbody>{p.education.map(e => <tr key={e.id} style={{ borderBottom: `1px solid ${colors.border}20` }}><td style={{ padding: '5px 8px', fontWeight: 600 }}>{e.school}{e.website ? <div style={{ fontSize: 9, color: colors.textDim }}>{e.website}</div> : null}</td><td style={{ padding: '5px 8px' }}>{e.degree}</td><td style={{ padding: '5px 8px' }}>{e.country || '—'}</td><td style={{ padding: '5px 8px', fontFamily: 'monospace', fontSize: 10 }}>{e.startYear} — {e.endYear}</td></tr>)}</tbody>
                </table>
            </Section>}

            {/* Emails */}
            <Section title={`Email Addresses (${p.emails.length})`}>
                {p.emails.length === 0 ? <div style={{ color: colors.textDim, fontSize: 11 }}>None recorded.</div> :
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr style={{ borderBottom: `1px solid ${colors.border}` }}>{['Email', 'Type', 'Status', 'Notes'].map(h => <th key={h} style={{ textAlign: 'left' as const, padding: '4px 8px', fontSize: 9, fontWeight: 700, color: colors.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{h}</th>)}</tr></thead>
                    <tbody>{p.emails.map(em => <tr key={em.id} style={{ borderBottom: `1px solid ${colors.border}20` }}><td style={{ padding: '5px 8px', fontWeight: 600, color: colors.accent }}>{em.email}</td><td style={{ padding: '5px 8px' }}>{em.type}</td><td style={{ padding: '5px 8px' }}>{em.status}</td><td style={{ padding: '5px 8px', color: colors.textSec }}>{em.notes || '—'}</td></tr>)}</tbody>
                </table>}
            </Section>

            {/* Phones */}
            <Section title={`Phone Numbers (${p.phones.length})`}>
                {p.phones.length === 0 ? <div style={{ color: colors.textDim, fontSize: 11 }}>None recorded.</div> :
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr style={{ borderBottom: `1px solid ${colors.border}` }}>{['Number', 'Type', 'Status', 'Apps', 'Notes'].map(h => <th key={h} style={{ textAlign: 'left' as const, padding: '4px 8px', fontSize: 9, fontWeight: 700, color: colors.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{h}</th>)}</tr></thead>
                    <tbody>{p.phones.map(ph => <tr key={ph.id} style={{ borderBottom: `1px solid ${colors.border}20` }}><td style={{ padding: '5px 8px', fontWeight: 600, fontFamily: 'monospace' }}>{ph.number}</td><td style={{ padding: '5px 8px' }}>{ph.type}</td><td style={{ padding: '5px 8px' }}>{ph.status}</td><td style={{ padding: '5px 8px', fontSize: 9 }}>{[ph.isWhatsApp&&'WA', ph.isTelegram&&'TG', ph.isSignal&&'Signal', ph.isViber&&'Viber', ph.isWeChat&&'WeChat'].filter(Boolean).join(', ') || '—'}</td><td style={{ padding: '5px 8px', color: colors.textSec }}>{ph.notes || '—'}</td></tr>)}</tbody>
                </table>}
            </Section>

            {/* Social Media */}
            {p.socials.length > 0 && <Section title="Social Media">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr style={{ borderBottom: `1px solid ${colors.border}` }}>{['Platform', 'Profile URL'].map(h => <th key={h} style={{ textAlign: 'left' as const, padding: '4px 8px', fontSize: 9, fontWeight: 700, color: colors.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{h}</th>)}</tr></thead>
                    <tbody>{p.socials.flatMap(s => s.profiles.map(pr => <tr key={pr.id} style={{ borderBottom: `1px solid ${colors.border}20` }}><td style={{ padding: '5px 8px', fontWeight: 600 }}>{s.platform}</td><td style={{ padding: '5px 8px', color: colors.accent, wordBreak: 'break-all' as const }}>{pr.url}</td></tr>))}</tbody>
                </table>
            </Section>}

            {/* Addresses */}
            <Section title={`Addresses (${p.addresses.length})`}>
                {p.addresses.length === 0 ? <div style={{ color: colors.textDim, fontSize: 11 }}>None recorded.</div> :
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr style={{ borderBottom: `1px solid ${colors.border}` }}>{['#', 'Street', 'No.', 'Zip', 'City', 'Country', 'Notes'].map(h => <th key={h} style={{ textAlign: 'left' as const, padding: '4px 8px', fontSize: 9, fontWeight: 700, color: colors.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{h}</th>)}</tr></thead>
                    <tbody>{p.addresses.map((a, i) => <tr key={a.id} style={{ borderBottom: `1px solid ${colors.border}20` }}><td style={{ padding: '5px 8px' }}>{i + 1}</td><td style={{ padding: '5px 8px', fontWeight: 600 }}>{a.address}</td><td style={{ padding: '5px 8px' }}>{a.addressNumber}</td><td style={{ padding: '5px 8px' }}>{a.zipCode}</td><td style={{ padding: '5px 8px' }}>{a.city}</td><td style={{ padding: '5px 8px' }}>{a.country}</td><td style={{ padding: '5px 8px', color: colors.textSec }}>{a.notes || '—'}</td></tr>)}</tbody>
                </table>}
            </Section>

            {/* Notes */}
            <Section title={`Intelligence Notes (${p.notes.length})`}>
                {p.notes.length === 0 ? <div style={{ color: colors.textDim, fontSize: 11 }}>No notes on file.</div> :
                p.notes.map((n, i) => (
                    <div key={n.id} style={{ marginBottom: 12, padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 4, pageBreakInside: 'avoid' as const }}>
                        <div style={{ fontSize: 9, color: colors.textDim, marginBottom: 4 }}>Note #{i + 1} — Created: {new Date(n.createdAt).toLocaleString()} · Updated: {new Date(n.updatedAt).toLocaleString()}</div>
                        <div style={{ fontSize: 11, lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>{n.text}</div>
                    </div>
                ))}
            </Section>

            {/* Footer */}
            <div style={{ borderTop: `2px solid ${colors.text}`, paddingTop: 10, marginTop: 30, display: 'flex', justifyContent: 'space-between', fontSize: 8, color: colors.textDim }}>
                <span>ARGUX Surveillance Platform — CLASSIFIED // NOFORN</span>
                <span>Generated: {new Date().toLocaleString()} · Subject ID: {p.uuid.slice(0, 16)}…</span>
            </div>
        </div>
    );
}
