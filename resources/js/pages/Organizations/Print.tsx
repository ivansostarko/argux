import { usePage } from '@inertiajs/react';
import { getOrgById, riskColors, type Organization } from '../../mock/organizations';

const statusColors: Record<string,string> = { Active:'#22c55e', Inactive:'#6b7280', Deleted:'#ef4444', Suspended:'#f59e0b', 'Under Review':'#0ea5e9' };

function generateSummary(o: Organization): string {
    const riskNote = o.risk==='Critical'?'CRITICAL risk — immediate investigation.':o.risk==='High'?'HIGH risk — close monitoring.':o.risk==='Medium'?'MEDIUM risk — notable flags.':o.risk==='Low'?'LOW risk — minimal concerns.':'NO RISK.';
    const contactStr = `${o.emails.length} email(s), ${o.phones.length} phone(s).`;
    const addrStr = o.addresses.length>0?`Location: ${o.addresses[0].city}, ${o.addresses[0].country}.`:'No registered address.';
    const personStr = o.linkedPersons.length>0?`Linked: ${o.linkedPersons.map(p=>`${p.firstName} ${p.lastName} (${p.role})`).join(', ')}.`:'';
    return `${o.name}, ${o.industry} entity in ${o.country}. Status: ${o.status}. ${riskNote} ${o.ceo?`CEO: ${o.ceo}. `:''}${o.owner?`Owner: ${o.owner}. `:''}${contactStr} ${addrStr} ${o.websites.length>0?`Web: ${o.websites.map(w=>w.url).join(', ')}.`:''} ${personStr} VAT: ${o.vat||'N/A'}. ID: ${o.uuid}.`;
}

export default function OrgPrint() {
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const o = getOrgById(Number(id));
    if (!o) return <div className="print-page" style={{ textAlign:'center', padding:60 }}><h2>Organization Not Found</h2></div>;

    return (
        <div className="print-page">
            {/* Header */}
            <div className="print-header">
                <div>
                    <div className="print-brand">ARGUX TACTICAL INTELLIGENCE PLATFORM</div>
                    <div className="print-name">{o.name}</div>
                    <div className="print-meta">{o.industry} · {o.country}{o.ceo ? ` · CEO: ${o.ceo}` : ''}</div>
                    <div style={{ marginTop: 8 }}>
                        <span className="print-badge" style={{ borderColor: statusColors[o.status]||'#6b7280', color: statusColors[o.status]||'#6b7280' }}>{o.status}</span>
                        <span className="print-badge" style={{ borderColor: riskColors[o.risk], color: riskColors[o.risk] }}>{o.risk}</span>
                    </div>
                </div>
                <div className="print-meta-right">
                    <div>ORGANIZATION DOSSIER</div>
                    <div style={{ fontFamily: 'monospace' }}>ID: {o.uuid}</div>
                    <div>Generated: {new Date().toLocaleString()}</div>
                    <button className="print-btn print-no-print" onClick={() => window.print()}>Print This Page</button>
                </div>
            </div>

            {/* Summary */}
            <div className="print-section">
                <div className="print-section-title">Intelligence Summary</div>
                <div className="print-summary">{generateSummary(o)}</div>
            </div>

            {/* Company Info */}
            <div className="print-section">
                <div className="print-section-title">Company Information</div>
                <div className="print-fields-wrap">
                    {[['Company Name',o.name],['Country',o.country],['Industry',o.industry],['CEO',o.ceo],['Owner',o.owner],['VAT',o.vat],['Tax Number',o.taxNumber],['Status',o.status],['Created',new Date(o.createdAt).toLocaleDateString()],['Updated',new Date(o.updatedAt).toLocaleDateString()]].map(([l,v]) => v ? <div key={l} className="print-field"><span className="print-field-label">{l}</span><span className="print-field-value">{v}</span></div> : null)}
                </div>
            </div>

            {/* Websites */}
            {o.websites.length > 0 && <div className="print-section">
                <div className="print-section-title">Websites ({o.websites.length})</div>
                <table className="print-table"><thead><tr><th>#</th><th>URL</th></tr></thead><tbody>{o.websites.map((w, i) => <tr key={w.id}><td>{i + 1}</td><td className="cell-accent cell-break">{w.url}</td></tr>)}</tbody></table>
            </div>}

            {/* Linked Persons */}
            {o.linkedPersons.length > 0 && <div className="print-section">
                <div className="print-section-title">Linked Persons ({o.linkedPersons.length})</div>
                <table className="print-table"><thead><tr><th>Name</th><th>Role</th></tr></thead><tbody>{o.linkedPersons.map(p => <tr key={p.id}><td className="cell-bold">{p.firstName} {p.lastName}</td><td>{p.role}</td></tr>)}</tbody></table>
            </div>}

            {/* Emails */}
            <div className="print-section">
                <div className="print-section-title">Email Addresses ({o.emails.length})</div>
                {o.emails.length === 0 ? <div className="cell-muted">None recorded.</div> :
                <table className="print-table"><thead><tr><th>Email</th><th>Type</th><th>Status</th><th>Notes</th></tr></thead><tbody>{o.emails.map(em => <tr key={em.id}><td className="cell-bold cell-accent">{em.email}</td><td>{em.type}</td><td>{em.status}</td><td className="cell-dim">{em.notes || '—'}</td></tr>)}</tbody></table>}
            </div>

            {/* Phones */}
            <div className="print-section">
                <div className="print-section-title">Phone Numbers ({o.phones.length})</div>
                {o.phones.length === 0 ? <div className="cell-muted">None recorded.</div> :
                <table className="print-table"><thead><tr><th>Number</th><th>Type</th><th>Status</th><th>Notes</th></tr></thead><tbody>{o.phones.map(ph => <tr key={ph.id}><td className="cell-bold cell-mono">{ph.number}</td><td>{ph.type}</td><td>{ph.status}</td><td className="cell-dim">{ph.notes || '—'}</td></tr>)}</tbody></table>}
            </div>

            {/* Social Media */}
            {o.socials.length > 0 && <div className="print-section">
                <div className="print-section-title">Social Media</div>
                <table className="print-table"><thead><tr><th>Platform</th><th>Profile URL</th></tr></thead><tbody>{o.socials.flatMap(s => s.profiles.map(pr => <tr key={pr.id}><td className="cell-bold">{s.platform}</td><td className="cell-accent cell-break">{pr.url}</td></tr>))}</tbody></table>
            </div>}

            {/* Addresses */}
            <div className="print-section">
                <div className="print-section-title">Addresses ({o.addresses.length})</div>
                {o.addresses.length === 0 ? <div className="cell-muted">None recorded.</div> :
                <table className="print-table"><thead><tr><th>#</th><th>Street</th><th>No.</th><th>Zip</th><th>City</th><th>Country</th><th>Notes</th></tr></thead><tbody>{o.addresses.map((a, i) => <tr key={a.id}><td>{i + 1}</td><td className="cell-bold">{a.address}</td><td>{a.addressNumber}</td><td>{a.zipCode}</td><td>{a.city}</td><td>{a.country}</td><td className="cell-dim">{a.notes || '—'}</td></tr>)}</tbody></table>}
            </div>

            {/* Notes */}
            <div className="print-section">
                <div className="print-section-title">Intelligence Notes ({o.notes.length})</div>
                {o.notes.length === 0 ? <div className="cell-muted">No notes on file.</div> :
                o.notes.map((n, i) => <div key={n.id} className="print-note"><div className="print-note-meta">Note #{i + 1} — Created: {new Date(n.createdAt).toLocaleString()} · Updated: {new Date(n.updatedAt).toLocaleString()}</div><div className="print-note-text">{n.text}</div></div>)}
            </div>

            {/* Footer */}
            <div className="print-footer">
                <span>ARGUX Surveillance Platform — CLASSIFIED // NOFORN</span>
                <span>Generated: {new Date().toLocaleString()} · Entity ID: {o.uuid.slice(0, 16)}…</span>
            </div>
        </div>
    );
}
