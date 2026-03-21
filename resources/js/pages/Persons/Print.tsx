import { usePage } from '@inertiajs/react';
import { getPersonById, riskColors, statusColors, type Person, type Risk, type Status } from '../../mock/persons';

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

export default function PersonPrint() {
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const p = getPersonById(Number(id));

    if (!p) return <div className="print-page" style={{ textAlign: 'center', padding: 60 }}><h2>Person Not Found</h2></div>;

    return (
        <div className="print-page">
            {/* Header */}
            <div className="print-header">
                <div>
                    <div className="print-brand">ARGUX TACTICAL INTELLIGENCE PLATFORM</div>
                    <div className="print-name">{p.firstName} {p.middleName ? p.middleName + ' ' : ''}{p.lastName}</div>
                    <div className="print-meta">
                        {p.nickname && <span style={{ fontWeight: 600 }}>"{p.nickname}" · </span>}
                        {p.nationality} · {p.gender} · {p.dob}
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <span className="print-badge" style={{ borderColor: statusColors[p.status], color: statusColors[p.status] }}>{p.status}</span>
                        <span className="print-badge" style={{ borderColor: riskColors[p.risk], color: riskColors[p.risk] }}>{p.risk}</span>
                    </div>
                </div>
                <div className="print-meta-right">
                    <div>SUBJECT DOSSIER</div>
                    <div style={{ fontFamily: 'monospace' }}>ID: {p.uuid}</div>
                    <div>Generated: {new Date().toLocaleString()}</div>
                    <button className="print-btn print-no-print" onClick={() => window.print()}>Print This Page</button>
                </div>
            </div>

            {/* AI Summary */}
            <div className="print-section">
                <div className="print-section-title">Intelligence Summary</div>
                <div className="print-summary">{generateSummary(p)}</div>
            </div>

            {/* Personal Info */}
            <div className="print-section">
                <div className="print-section-title">Personal Information</div>
                <div className="print-fields-wrap">
                    {[['First Name',p.firstName],['Last Name',p.lastName],['Middle Name',p.middleName],['Maiden Name',p.maidenName],['Nickname',p.nickname],['DOB',p.dob],['Gender',p.gender],['Nationality',p.nationality],['Country',p.country],['Religion',p.religion],['Language',p.language],['Tax Number',p.taxNumber]].map(([l,v]) => v ? <div key={l} className="print-field"><span className="print-field-label">{l}</span><span className="print-field-value">{v}</span></div> : null)}
                </div>
            </div>

            {/* Languages */}
            {p.languages.length > 0 && <div className="print-section">
                <div className="print-section-title">Languages ({p.languages.length})</div>
                <table className="print-table"><thead><tr><th>Language</th><th>Level</th><th>Notes</th></tr></thead><tbody>{p.languages.map(l => <tr key={l.id}><td className="cell-bold">{l.language}</td><td>{l.level}</td><td className="cell-dim">{l.notes || '—'}</td></tr>)}</tbody></table>
            </div>}

            {/* Education */}
            {p.education.length > 0 && <div className="print-section">
                <div className="print-section-title">Education ({p.education.length})</div>
                <table className="print-table"><thead><tr><th>Institution</th><th>Degree</th><th>Country</th><th>Period</th></tr></thead><tbody>{p.education.map(e => <tr key={e.id}><td className="cell-bold">{e.school}{e.website ? <div style={{ fontSize: 9, color: '#9ca3af' }}>{e.website}</div> : null}</td><td>{e.degree}</td><td>{e.country || '—'}</td><td className="cell-mono">{e.startYear} — {e.endYear}</td></tr>)}</tbody></table>
            </div>}

            {/* Emails */}
            <div className="print-section">
                <div className="print-section-title">Email Addresses ({p.emails.length})</div>
                {p.emails.length === 0 ? <div className="cell-muted">None recorded.</div> :
                <table className="print-table"><thead><tr><th>Email</th><th>Type</th><th>Status</th><th>Notes</th></tr></thead><tbody>{p.emails.map(em => <tr key={em.id}><td className="cell-bold cell-accent">{em.email}</td><td>{em.type}</td><td>{em.status}</td><td className="cell-dim">{em.notes || '—'}</td></tr>)}</tbody></table>}
            </div>

            {/* Phones */}
            <div className="print-section">
                <div className="print-section-title">Phone Numbers ({p.phones.length})</div>
                {p.phones.length === 0 ? <div className="cell-muted">None recorded.</div> :
                <table className="print-table"><thead><tr><th>Number</th><th>Type</th><th>Status</th><th>Apps</th><th>Notes</th></tr></thead><tbody>{p.phones.map(ph => <tr key={ph.id}><td className="cell-bold cell-mono">{ph.number}</td><td>{ph.type}</td><td>{ph.status}</td><td style={{ fontSize: 9 }}>{[ph.isWhatsApp&&'WA',ph.isTelegram&&'TG',ph.isSignal&&'Signal',ph.isViber&&'Viber',ph.isWeChat&&'WeChat'].filter(Boolean).join(', ') || '—'}</td><td className="cell-dim">{ph.notes || '—'}</td></tr>)}</tbody></table>}
            </div>

            {/* Social */}
            {p.socials.length > 0 && <div className="print-section">
                <div className="print-section-title">Social Media</div>
                <table className="print-table"><thead><tr><th>Platform</th><th>Profile URL</th></tr></thead><tbody>{p.socials.flatMap(s => s.profiles.map(pr => <tr key={pr.id}><td className="cell-bold">{s.platform}</td><td className="cell-accent cell-break">{pr.url}</td></tr>))}</tbody></table>
            </div>}

            {/* Addresses */}
            <div className="print-section">
                <div className="print-section-title">Addresses ({p.addresses.length})</div>
                {p.addresses.length === 0 ? <div className="cell-muted">None recorded.</div> :
                <table className="print-table"><thead><tr><th>#</th><th>Street</th><th>No.</th><th>Zip</th><th>City</th><th>Country</th><th>Notes</th></tr></thead><tbody>{p.addresses.map((a, i) => <tr key={a.id}><td>{i+1}</td><td className="cell-bold">{a.address}</td><td>{a.addressNumber}</td><td>{a.zipCode}</td><td>{a.city}</td><td>{a.country}</td><td className="cell-dim">{a.notes || '—'}</td></tr>)}</tbody></table>}
            </div>

            {/* Notes */}
            <div className="print-section">
                <div className="print-section-title">Intelligence Notes ({p.notes.length})</div>
                {p.notes.length === 0 ? <div className="cell-muted">No notes on file.</div> :
                p.notes.map((n, i) => <div key={n.id} className="print-note"><div className="print-note-meta">Note #{i+1} — Created: {new Date(n.createdAt).toLocaleString()} · Updated: {new Date(n.updatedAt).toLocaleString()}</div><div className="print-note-text">{n.text}</div></div>)}
            </div>

            {/* Footer */}
            <div className="print-footer">
                <span>ARGUX Surveillance Platform — CLASSIFIED // NOFORN</span>
                <span>Generated: {new Date().toLocaleString()} · Subject ID: {p.uuid.slice(0,16)}…</span>
            </div>
        </div>
    );
}
