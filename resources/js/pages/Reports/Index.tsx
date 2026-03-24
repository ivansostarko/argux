import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockPersons, riskColors, type Risk } from '../../mock/persons';
import { mockOrganizations } from '../../mock/organizations';
import { mockVehicles } from '../../mock/vehicles';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Report Generator  ·  Intelligence Report Center
   Generate, view, search, export reports per Person or Org
   ═══════════════════════════════════════════════════════════════ */

type ReportStatus = 'Completed' | 'Generating' | 'Failed' | 'Queued';
type EntityType = 'person' | 'organization';

interface Report {
    id: string; title: string; entityType: EntityType;
    entityId: number; entityName: string; entityRisk: Risk;
    status: ReportStatus; classification: string;
    dateFrom: string; dateTo: string; generatedAt: string;
    generatedBy: string; pages: number; size: string;
    sections: string[]; operationCode: string;
    stats: { events: number; alerts: number; connections: number; lprHits: number; faceMatches: number; files: number };
}

const statusColors: Record<ReportStatus, string> = { Completed: '#22c55e', Generating: '#f59e0b', Failed: '#ef4444', Queued: '#6b7280' };
const statusIcons: Record<ReportStatus, string> = { Completed: '✅', Generating: '⏳', Failed: '❌', Queued: '🕐' };

const personSections = ['AI Summary', 'Profile & Identity', 'Contact Information', 'Known Addresses', 'Employment History', 'Education', 'Vehicles', 'Known Locations', 'Connections Graph', 'Events Timeline', 'LPR Activity', 'Face Recognition Matches', 'Deployed Surveillance', 'Audio Intercepts', 'Social Media', 'Records & Evidence', 'Risk Assessment', 'Notes & Annotations'];
const orgSections = ['AI Summary', 'Company Profile', 'Linked Persons', 'Financial Analysis', 'Connections Graph', 'Data Sources', 'Vehicles', 'Events Timeline', 'Records & Evidence', 'Risk Assessment', 'Notes'];

// ═══ MOCK REPORTS ═══
const mockReports: Report[] = [
    { id: 'rpt-01', title: 'HAWK Subject Profile — Marko Horvat', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', entityRisk: 'Critical', status: 'Completed', classification: 'TOP SECRET // NOFORN', dateFrom: '2026-02-24', dateTo: '2026-03-24', generatedAt: '2026-03-24 06:00', generatedBy: 'Col. Tomić', pages: 34, size: '8.2 MB', sections: personSections, operationCode: 'HAWK', stats: { events: 847, alerts: 23, connections: 12, lprHits: 31, faceMatches: 7, files: 9 } },
    { id: 'rpt-02', title: 'Weekly Intelligence — Horvat (Week 4)', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2026-03-18', dateTo: '2026-03-24', generatedAt: '2026-03-24 06:00', generatedBy: 'Workflow: Nightly Sweep', pages: 28, size: '5.4 MB', sections: ['AI Summary', 'Events Timeline', 'LPR Activity', 'Connections Graph', 'Risk Assessment'], operationCode: 'HAWK', stats: { events: 142, alerts: 8, connections: 5, lprHits: 12, faceMatches: 3, files: 4 } },
    { id: 'rpt-03', title: 'Subject Profile — Carlos Mendoza', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2026-03-01', dateTo: '2026-03-24', generatedAt: '2026-03-23 14:00', generatedBy: 'Cpt. Horvat', pages: 22, size: '4.1 MB', sections: personSections.filter(s => s !== 'Education'), operationCode: 'HAWK', stats: { events: 312, alerts: 11, connections: 8, lprHits: 14, faceMatches: 2, files: 4 } },
    { id: 'rpt-04', title: 'Counter-Surveillance Assessment — Mendoza', entityType: 'person', entityId: 9, entityName: 'Carlos Mendoza', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET', dateFrom: '2026-03-20', dateTo: '2026-03-24', generatedAt: '2026-03-24 03:37', generatedBy: 'AI Analysis', pages: 12, size: '2.8 MB', sections: ['AI Summary', 'Events Timeline', 'Known Locations', 'Risk Assessment'], operationCode: 'HAWK', stats: { events: 45, alerts: 4, connections: 3, lprHits: 6, faceMatches: 0, files: 2 } },
    { id: 'rpt-05', title: 'Subject Profile — Ivan Babić', entityType: 'person', entityId: 12, entityName: 'Ivan Babić', entityRisk: 'High', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2026-03-01', dateTo: '2026-03-23', generatedAt: '2026-03-23 10:00', generatedBy: 'Sgt. Matić', pages: 18, size: '3.6 MB', sections: personSections, operationCode: 'HAWK', stats: { events: 198, alerts: 6, connections: 6, lprHits: 20, faceMatches: 4, files: 3 } },
    { id: 'rpt-06', title: 'Subject Profile — Omar Hassan', entityType: 'person', entityId: 7, entityName: 'Omar Hassan', entityRisk: 'High', status: 'Completed', classification: 'SECRET', dateFrom: '2026-03-10', dateTo: '2026-03-23', generatedAt: '2026-03-23 10:00', generatedBy: 'Sgt. Matić', pages: 15, size: '2.9 MB', sections: personSections.filter(s => !['Education', 'Social Media'].includes(s)), operationCode: 'HAWK', stats: { events: 156, alerts: 5, connections: 4, lprHits: 8, faceMatches: 1, files: 3 } },
    { id: 'rpt-07', title: 'Financial Intelligence — Ahmed Al-Rashid', entityType: 'person', entityId: 3, entityName: 'Ahmed Al-Rashid', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2026-01-01', dateTo: '2026-03-24', generatedAt: '2026-03-20 09:00', generatedBy: 'Cpt. Galić', pages: 26, size: '6.2 MB', sections: [...personSections, 'Financial Transactions', 'Shell Company Analysis'], operationCode: 'GLACIER', stats: { events: 89, alerts: 3, connections: 9, lprHits: 4, faceMatches: 1, files: 2 } },
    { id: 'rpt-08', title: 'Organization — Alpha Security Group', entityType: 'organization', entityId: 1, entityName: 'Alpha Security Group', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2025-06-01', dateTo: '2026-03-24', generatedAt: '2026-03-15 08:00', generatedBy: 'Col. Tomić', pages: 42, size: '11.3 MB', sections: orgSections, operationCode: 'HAWK', stats: { events: 1240, alerts: 34, connections: 18, lprHits: 45, faceMatches: 12, files: 4 } },
    { id: 'rpt-09', title: 'Organization — Rashid Holdings International', entityType: 'organization', entityId: 2, entityName: 'Rashid Holdings International', entityRisk: 'Critical', status: 'Completed', classification: 'SECRET // NOFORN', dateFrom: '2025-01-01', dateTo: '2026-03-24', generatedAt: '2026-03-20 14:00', generatedBy: 'Cpt. Galić', pages: 38, size: '9.8 MB', sections: [...orgSections, 'Shell Company Network', 'Sanctions Screening'], operationCode: 'GLACIER', stats: { events: 456, alerts: 12, connections: 14, lprHits: 8, faceMatches: 3, files: 3 } },
    { id: 'rpt-10', title: 'Organization — Falcon Trading LLC', entityType: 'organization', entityId: 5, entityName: 'Falcon Trading LLC', entityRisk: 'High', status: 'Completed', classification: 'SECRET', dateFrom: '2026-01-01', dateTo: '2026-03-24', generatedAt: '2026-03-18 09:00', generatedBy: 'Lt. Petrić', pages: 16, size: '3.1 MB', sections: orgSections, operationCode: 'HAWK', stats: { events: 78, alerts: 4, connections: 7, lprHits: 3, faceMatches: 0, files: 1 } },
    { id: 'rpt-11', title: 'Daily Briefing — HAWK Morning #24', entityType: 'person', entityId: 1, entityName: 'Marko Horvat', entityRisk: 'Critical', status: 'Generating', classification: 'SECRET', dateFrom: '2026-03-23', dateTo: '2026-03-24', generatedAt: '2026-03-24 06:00', generatedBy: 'Workflow: Nightly Sweep', pages: 0, size: '—', sections: ['AI Summary', 'Events Timeline', 'Alerts'], operationCode: 'HAWK', stats: { events: 0, alerts: 0, connections: 0, lprHits: 0, faceMatches: 0, files: 0 } },
    { id: 'rpt-12', title: 'Li Wei — Shanghai Observation', entityType: 'person', entityId: 10, entityName: 'Li Wei', entityRisk: 'Medium', status: 'Failed', classification: 'SECRET // NOFORN', dateFrom: '2026-03-01', dateTo: '2026-03-18', generatedAt: '2026-03-18 06:00', generatedBy: 'Cpt. Perić', pages: 0, size: '—', sections: personSections, operationCode: 'PHOENIX', stats: { events: 0, alerts: 0, connections: 0, lprHits: 0, faceMatches: 0, files: 0 } },
];

type ViewMode = 'history' | 'generate' | 'preview';
const allOps = [...new Set(mockReports.map(r => r.operationCode))];

function ReportsIndex() {
    const [view, setView] = useState<ViewMode>('history');
    const [search, setSearch] = useState('');
    const [entityTypeF, setEntityTypeF] = useState<EntityType | 'all'>('all');
    const [opF, setOpF] = useState('all');
    const [statusF, setStatusF] = useState<ReportStatus | 'all'>('all');
    const [selReport, setSelReport] = useState<string | null>(null);
    const [previewReport, setPreviewReport] = useState<string | null>(null);

    // Generator state
    const [genType, setGenType] = useState<EntityType>('person');
    const [genEntityId, setGenEntityId] = useState<number | null>(null);
    const [genDateFrom, setGenDateFrom] = useState('2026-03-01');
    const [genDateTo, setGenDateTo] = useState('2026-03-24');
    const [genSections, setGenSections] = useState<Set<string>>(new Set(personSections));

    const report = selReport ? mockReports.find(r => r.id === selReport) : null;
    const preview = previewReport ? mockReports.find(r => r.id === previewReport) : null;
    const previewEntity = preview ? (preview.entityType === 'person' ? mockPersons.find(p => p.id === preview.entityId) : mockOrganizations.find(o => o.id === preview.entityId)) : null;
    const previewVehicles = preview ? mockVehicles.filter(v => preview.entityType === 'person' ? v.personId === preview.entityId : v.orgId === preview.entityId) : [];

    const genEntities = genType === 'person' ? mockPersons.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, risk: p.risk })) : mockOrganizations.map(o => ({ id: o.id, name: o.name, risk: o.risk }));
    const availSections = genType === 'person' ? personSections : orgSections;

    const toggleSection = (s: string) => setGenSections(prev => { const n = new Set(prev); if (n.has(s)) n.delete(s); else n.add(s); return n; });

    const filtered = useMemo(() => mockReports.filter(r => {
        if (entityTypeF !== 'all' && r.entityType !== entityTypeF) return false;
        if (opF !== 'all' && r.operationCode !== opF) return false;
        if (statusF !== 'all' && r.status !== statusF) return false;
        if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.entityName.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [entityTypeF, opF, statusF, search]);

    const stats = { total: mockReports.length, completed: mockReports.filter(r => r.status === 'Completed').length, persons: mockReports.filter(r => r.entityType === 'person').length, orgs: mockReports.filter(r => r.entityType === 'organization').length };

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = () => { if (printRef.current) { const w = window.open('', '_blank'); if (w) { w.document.write(`<html><head><title>${preview?.title}</title><style>body{font-family:system-ui;padding:40px;color:#1a1a2e;font-size:12px;line-height:1.6}h1{font-size:20px}h2{font-size:15px;border-bottom:2px solid #1a1a2e;padding-bottom:4px;margin-top:20px}table{width:100%;border-collapse:collapse;margin:8px 0}td,th{border:1px solid #ddd;padding:6px 8px;text-align:left;font-size:11px}th{background:#f0f0f4}.badge{display:inline-block;padding:2px 8px;border-radius:3px;font-weight:700;font-size:10px}.footer{margin-top:40px;padding-top:12px;border-top:2px solid #ef4444;text-align:center;font-size:10px;color:#ef4444;font-weight:700}@media print{body{padding:20px}}</style></head><body>`); w.document.write(printRef.current.innerHTML); w.document.write('</body></html>'); w.document.close(); w.print(); } } };

    return (<>
        <PageMeta title="Reports" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* LEFT: Sidebar */}
            <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#3b82f610', border: '1px solid #3b82f625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>REPORTS</div><div style={{ fontSize: 7, color: theme.textDim }}>Intelligence Report Center</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                {/* Stats */}
                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 3 }}>
                    {[{ n: stats.total, l: 'Total', c: theme.accent }, { n: stats.completed, l: 'Done', c: '#22c55e' }, { n: stats.persons, l: 'Person', c: '#ec4899' }, { n: stats.orgs, l: 'Org', c: '#8b5cf6' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '3px 0' }}><div style={{ fontSize: 13, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* View toggle */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    {[{ id: 'history' as ViewMode, l: '📋 Report History', i: '' }, { id: 'generate' as ViewMode, l: '➕ Generate New', i: '' }].map(v => <button key={v.id} onClick={() => { setView(v.id); setPreviewReport(null); }} style={{ display: 'block', width: '100%', padding: '5px 8px', marginBottom: 2, borderRadius: 4, border: `1px solid ${view === v.id ? theme.accent + '40' : theme.border}`, background: view === v.id ? `${theme.accent}08` : 'transparent', color: view === v.id ? theme.accent : theme.textDim, fontSize: 9, fontWeight: view === v.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}>{v.l}</button>)}
                </div>

                {/* Filters (history view) */}
                {view === 'history' && !previewReport && <>
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Entity Type</div>
                        <div style={{ display: 'flex', gap: 2 }}>
                            {[{ id: 'all' as const, l: 'All' }, { id: 'person' as EntityType, l: '🧑 Person' }, { id: 'organization' as EntityType, l: '🏢 Org' }].map(t => <button key={t.id} onClick={() => setEntityTypeF(t.id)} style={{ flex: 1, padding: '3px', borderRadius: 3, border: `1px solid ${entityTypeF === t.id ? theme.accent + '40' : theme.border}`, background: entityTypeF === t.id ? `${theme.accent}08` : 'transparent', color: entityTypeF === t.id ? theme.accent : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>{t.l}</button>)}
                        </div>
                    </div>
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Operation</div>
                        <select value={opF} onChange={e => setOpF(e.target.value)} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Operations</option>{allOps.map(o => <option key={o} value={o}>OP {o}</option>)}</select>
                    </div>
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Status</div>
                        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                            {(['all', 'Completed', 'Generating', 'Failed'] as const).map(s => <button key={s} onClick={() => setStatusF(s)} style={{ padding: '2px 6px', borderRadius: 3, border: `1px solid ${statusF === s ? (s === 'all' ? theme.accent : statusColors[s as ReportStatus]) + '40' : theme.border}`, background: statusF === s ? `${s === 'all' ? theme.accent : statusColors[s as ReportStatus]}08` : 'transparent', color: statusF === s ? (s === 'all' ? theme.accent : statusColors[s as ReportStatus]) : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>{s === 'all' ? 'All' : s}</button>)}
                        </div>
                    </div>
                </>}

                <div style={{ padding: '8px 12px', marginTop: 'auto' }}>
                    {[{ l: '📊 Activity Log', h: '/activity' }, { l: '🛡️ Risks', h: '/risks' }, { l: '📁 Storage', h: '/storage' }, { l: '🎯 Operations', h: '/operations' }].map(lk => <a key={lk.h} href={lk.h} style={{ display: 'block', fontSize: 8, color: theme.textDim, textDecoration: 'none', padding: '2px 0' }}>{lk.l}</a>)}
                </div>
            </div>

            {/* CENTER */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>

                {/* ═══ HISTORY VIEW ═══ */}
                {view === 'history' && !previewReport && <>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 80px 80px 1fr 80px', padding: '6px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', flexShrink: 0, background: theme.bg, gap: 8 }}>
                        <span>Report</span><span>Status</span><span>Pages</span><span>Operation</span><span style={{ textAlign: 'right' as const }}>Generated</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 28, opacity: 0.2 }}>📊</div><div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>No reports match</div></div>}
                        {filtered.map(r => {
                            const rc = riskColors[r.entityRisk]; const sc = statusColors[r.status]; const sel = selReport === r.id;
                            return <div key={r.id} onClick={() => setSelReport(r.id)} style={{ display: 'grid', gridTemplateColumns: '3fr 80px 80px 1fr 80px', padding: '10px 14px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', gap: 8, background: sel ? `${sc}04` : 'transparent', borderLeft: `3px solid ${sel ? sc : 'transparent'}` }}>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{r.title}</div>
                                    <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
                                        <span style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${rc}12`, color: rc, fontWeight: 600 }}>{r.entityRisk}</span>
                                        <span style={{ fontSize: 7, color: theme.textDim }}>{r.entityType === 'person' ? '🧑' : '🏢'} {r.entityName}</span>
                                        <span style={{ fontSize: 6, color: theme.textDim }}>{r.classification}</span>
                                    </div>
                                </div>
                                <span style={{ fontSize: 8, fontWeight: 700, color: sc }}>{statusIcons[r.status]} {r.status}</span>
                                <span style={{ fontSize: 9, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{r.pages || '—'}</span>
                                <a href="/operations" onClick={e => e.stopPropagation()} style={{ fontSize: 8, color: theme.accent, textDecoration: 'none' }}>{r.operationCode}</a>
                                <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 8, color: theme.textDim }}>{r.generatedAt.slice(5, 10)}</div><div style={{ fontSize: 7, color: theme.textDim }}>{r.generatedBy.split(':')[0]}</div></div>
                            </div>;
                        })}
                    </div>
                </>}

                {/* ═══ GENERATE VIEW ═══ */}
                {view === 'generate' && !previewReport && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', padding: 16 }}>
                    <div style={{ maxWidth: 600 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 4 }}>Generate Intelligence Report</div>
                        <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 16 }}>Select entity, date range, and report sections. Report will be queued for generation.</div>

                        {/* Entity type */}
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Entity Type</div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {[{ id: 'person' as EntityType, l: '🧑 Person', desc: `${personSections.length} sections available` }, { id: 'organization' as EntityType, l: '🏢 Organization', desc: `${orgSections.length} sections available` }].map(t => <button key={t.id} onClick={() => { setGenType(t.id); setGenEntityId(null); setGenSections(new Set(t.id === 'person' ? personSections : orgSections)); }} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${genType === t.id ? theme.accent + '40' : theme.border}`, background: genType === t.id ? `${theme.accent}06` : 'transparent', cursor: 'pointer', textAlign: 'left' as const }}><div style={{ fontSize: 11, fontWeight: 700, color: genType === t.id ? theme.accent : theme.text }}>{t.l}</div><div style={{ fontSize: 8, color: theme.textDim, marginTop: 2 }}>{t.desc}</div></button>)}
                            </div>
                        </div>

                        {/* Entity select */}
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Select {genType === 'person' ? 'Person' : 'Organization'}</div>
                            <select value={genEntityId ?? ''} onChange={e => setGenEntityId(e.target.value ? parseInt(e.target.value) : null)} style={{ width: '100%', padding: '8px 10px', borderRadius: 5, border: `1px solid ${genEntityId ? theme.accent + '40' : theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 10, fontFamily: 'inherit', outline: 'none' }}>
                                <option value="">— Select {genType === 'person' ? 'person' : 'organization'} —</option>
                                {genEntities.map(e => <option key={e.id} value={e.id}>{e.name} ({e.risk})</option>)}
                            </select>
                        </div>

                        {/* Date range */}
                        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Date From</div>
                                <input type="date" value={genDateFrom} onChange={e => setGenDateFrom(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Date To</div>
                                <input type="date" value={genDateTo} onChange={e => setGenDateTo(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }} />
                            </div>
                        </div>

                        {/* Sections */}
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>Report Sections ({genSections.size}/{availSections.length})</span>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button onClick={() => setGenSections(new Set(availSections))} style={{ fontSize: 7, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
                                    <button onClick={() => setGenSections(new Set())} style={{ fontSize: 7, color: theme.textDim, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>None</button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                {availSections.map(s => <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 4, border: `1px solid ${genSections.has(s) ? theme.accent + '30' : theme.border}`, background: genSections.has(s) ? `${theme.accent}04` : 'transparent', cursor: 'pointer', fontSize: 8, color: genSections.has(s) ? theme.text : theme.textDim }}>
                                    <input type="checkbox" checked={genSections.has(s)} onChange={() => toggleSection(s)} style={{ accentColor: theme.accent }} />
                                    {s}
                                </label>)}
                            </div>
                        </div>

                        {/* Generate */}
                        <button disabled={!genEntityId || genSections.size === 0} style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', background: genEntityId && genSections.size > 0 ? theme.accent : `${theme.border}30`, color: genEntityId && genSections.size > 0 ? '#fff' : theme.textDim, fontSize: 11, fontWeight: 800, cursor: genEntityId ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>📊 Generate Report ({genSections.size} sections)</button>
                    </div>
                </div>}

                {/* ═══ REPORT PREVIEW ═══ */}
                {previewReport && preview && previewEntity && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {/* Toolbar */}
                    <div style={{ padding: '6px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, background: theme.bg, position: 'sticky' as const, top: 0, zIndex: 1 }}>
                        <button onClick={() => setPreviewReport(null)} style={{ padding: '3px 8px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
                        <span style={{ fontSize: 10, fontWeight: 700, color: theme.text, flex: 1 }}>{preview.title}</span>
                        <button onClick={handlePrint} style={{ padding: '4px 10px', borderRadius: 4, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🖨️ Print / PDF</button>
                    </div>

                    {/* Report content */}
                    <div ref={printRef} style={{ padding: '24px 40px', maxWidth: 800, margin: '0 auto' }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center' as const, marginBottom: 20, paddingBottom: 16, borderBottom: `2px solid ${theme.accent}` }}>
                            <div style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', letterSpacing: '0.2em', marginBottom: 6 }}>{preview.classification}</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>{preview.title}</div>
                            <div style={{ fontSize: 9, color: theme.textDim, marginTop: 4 }}>Report Period: {preview.dateFrom} — {preview.dateTo} · Generated: {preview.generatedAt}</div>
                            <div style={{ fontSize: 8, color: theme.textDim }}>Operation: {preview.operationCode} · By: {preview.generatedBy}</div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' as const }}>
                            {[{ l: 'Events', v: preview.stats.events, c: '#3b82f6' }, { l: 'Alerts', v: preview.stats.alerts, c: '#ef4444' }, { l: 'Connections', v: preview.stats.connections, c: '#ec4899' }, { l: 'LPR Hits', v: preview.stats.lprHits, c: '#10b981' }, { l: 'Face Matches', v: preview.stats.faceMatches, c: '#8b5cf6' }, { l: 'Files', v: preview.stats.files, c: '#f59e0b' }].map(s => <div key={s.l} style={{ flex: '1 1 80px', padding: '8px', borderRadius: 5, border: `1px solid ${s.c}15`, background: `${s.c}04`, textAlign: 'center' as const }}><div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div><div style={{ fontSize: 7, color: theme.textDim }}>{s.l}</div></div>)}
                        </div>

                        {/* AI Summary section */}
                        {preview.sections.includes('AI Summary') && <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: theme.text, borderBottom: `2px solid ${theme.text}`, paddingBottom: 3, marginBottom: 8 }}>1. AI Summary</div>
                            <div style={{ fontSize: 9, color: theme.textSecondary, lineHeight: 1.7, padding: '10px', borderRadius: 6, background: `${theme.accent}04`, border: `1px solid ${theme.accent}15` }}>
                                {preview.entityType === 'person' ? `${(previewEntity as any).firstName} ${(previewEntity as any).lastName} (alias "${(previewEntity as any).nickname}") represents a ${preview.entityRisk}-risk subject under Operation ${preview.operationCode}. During the reporting period (${preview.dateFrom} to ${preview.dateTo}), the subject generated ${preview.stats.events} tracked events across ${preview.sections.length} intelligence domains. ${preview.stats.alerts} alerts were triggered including zone breaches, co-location events, and surveillance anomalies. Analysis of ${preview.stats.lprHits} LPR captures and ${preview.stats.faceMatches} face recognition matches indicates sustained operational activity in the monitored area. Risk assessment: ${preview.entityRisk.toUpperCase()}. Recommend continued enhanced surveillance and resource allocation.` : `${(previewEntity as any).name} is classified as ${preview.entityRisk}-risk under Operation ${preview.operationCode}. The organization has ${(previewEntity as any).linkedPersons?.length || 0} linked persons under active monitoring. During the reporting period, ${preview.stats.events} events were recorded with ${preview.stats.alerts} alerts triggered. The connections graph reveals ${preview.stats.connections} significant links to other monitored entities. Financial analysis indicates potential trade-based money laundering with over-invoicing patterns. Recommend enhanced financial monitoring.`}
                                <div style={{ marginTop: 6, fontSize: 7, color: theme.textDim }}>Generated by Ollama LLaMA 3.1 (70B) with RAG context from ARGUX database · ChromaDB + nomic-embed-text</div>
                            </div>
                        </div>}

                        {/* Profile section */}
                        {preview.sections.includes('Profile & Identity') && preview.entityType === 'person' && (() => { const p = previewEntity as any; return <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: theme.text, borderBottom: `2px solid ${theme.text}`, paddingBottom: 3, marginBottom: 8 }}>2. Profile & Identity</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                {[{ l: 'Full Name', v: `${p.firstName} ${p.middleName ? p.middleName + ' ' : ''}${p.lastName}` }, { l: 'Nickname', v: p.nickname || '—' }, { l: 'Date of Birth', v: p.dob }, { l: 'Gender', v: p.gender }, { l: 'Nationality', v: p.nationality }, { l: 'Country', v: p.country }, { l: 'Tax Number', v: p.taxNumber || '—' }, { l: 'Religion', v: p.religion || '—' }, { l: 'Risk Level', v: p.risk }, { l: 'Status', v: p.status }].map(r => <div key={r.l} style={{ padding: '4px 8px', borderRadius: 3, background: `${theme.border}10` }}><div style={{ fontSize: 7, color: theme.textDim }}>{r.l}</div><div style={{ fontSize: 9, fontWeight: 600, color: theme.text }}>{r.v}</div></div>)}
                            </div>
                        </div>; })()}

                        {/* Company Profile */}
                        {preview.sections.includes('Company Profile') && preview.entityType === 'organization' && (() => { const o = previewEntity as any; return <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: theme.text, borderBottom: `2px solid ${theme.text}`, paddingBottom: 3, marginBottom: 8 }}>2. Company Profile</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                {[{ l: 'Company', v: o.name }, { l: 'CEO', v: o.ceo || '—' }, { l: 'Industry', v: o.industry }, { l: 'Country', v: o.country }, { l: 'VAT', v: o.vat || '—' }, { l: 'Risk', v: o.risk }].map(r => <div key={r.l} style={{ padding: '4px 8px', borderRadius: 3, background: `${theme.border}10` }}><div style={{ fontSize: 7, color: theme.textDim }}>{r.l}</div><div style={{ fontSize: 9, fontWeight: 600, color: theme.text }}>{r.v}</div></div>)}
                            </div>
                        </div>; })()}

                        {/* Vehicles */}
                        {preview.sections.includes('Vehicles') && previewVehicles.length > 0 && <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: theme.text, borderBottom: `2px solid ${theme.text}`, paddingBottom: 3, marginBottom: 8 }}>{preview.entityType === 'person' ? '7' : '7'}. Vehicles ({previewVehicles.length})</div>
                            <div style={{ borderRadius: 4, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 60px 60px', padding: '4px 8px', background: `${theme.border}15`, fontSize: 7, fontWeight: 700, color: theme.textDim }}><span>Plate</span><span>Vehicle</span><span>Risk</span><span>Year</span></div>
                                {previewVehicles.map(v => <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 60px 60px', padding: '4px 8px', borderTop: `1px solid ${theme.border}06`, fontSize: 8 }}><span style={{ fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{v.plate}</span><span style={{ color: theme.textSecondary }}>{v.make} {v.model}</span><span style={{ color: riskColors[v.risk], fontWeight: 600 }}>{v.risk}</span><span style={{ color: theme.textDim }}>{v.year}</span></div>)}
                            </div>
                        </div>}

                        {/* Connections */}
                        {preview.sections.includes('Connections Graph') && <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: theme.text, borderBottom: `2px solid ${theme.text}`, paddingBottom: 3, marginBottom: 8 }}>Connections Graph ({preview.stats.connections} entities)</div>
                            <div style={{ height: 80, borderRadius: 6, border: `1px solid ${theme.border}`, background: `${theme.border}06`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 9 }}>🔗 Force-directed graph visualization with {preview.stats.connections} connected entities</div>
                        </div>}

                        {/* Events Timeline */}
                        {preview.sections.includes('Events Timeline') && <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: theme.text, borderBottom: `2px solid ${theme.text}`, paddingBottom: 3, marginBottom: 8 }}>Events Timeline ({preview.stats.events} events)</div>
                            <div style={{ height: 60, borderRadius: 6, border: `1px solid ${theme.border}`, background: `${theme.border}06`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 9 }}>📊 Chronological timeline of {preview.stats.events} tracked events across the reporting period</div>
                        </div>}

                        {/* Risk Assessment */}
                        {preview.sections.includes('Risk Assessment') && <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: theme.text, borderBottom: `2px solid ${theme.text}`, paddingBottom: 3, marginBottom: 8 }}>Risk Assessment</div>
                            <div style={{ padding: '10px', borderRadius: 6, border: `1px solid ${riskColors[preview.entityRisk]}20`, background: `${riskColors[preview.entityRisk]}04` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `conic-gradient(${riskColors[preview.entityRisk]} ${(preview.entityRisk === 'Critical' ? 95 : preview.entityRisk === 'High' ? 75 : 50) * 3.6}deg, ${theme.border}20 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: riskColors[preview.entityRisk], fontFamily: "'JetBrains Mono',monospace" }}>{preview.entityRisk === 'Critical' ? 95 : preview.entityRisk === 'High' ? 75 : 50}</div></div>
                                    <div><div style={{ fontSize: 12, fontWeight: 800, color: riskColors[preview.entityRisk] }}>{preview.entityRisk} RISK</div><div style={{ fontSize: 8, color: theme.textDim }}>AI-computed composite score</div></div>
                                </div>
                                <div style={{ fontSize: 8, color: theme.textSecondary, lineHeight: 1.5 }}>Based on {preview.stats.alerts} alerts, {preview.stats.connections} high-risk connections, {preview.stats.lprHits} LPR captures, and {preview.stats.faceMatches} face matches during the reporting period. Risk trajectory: STABLE-HIGH. Recommend: continued enhanced surveillance.</div>
                            </div>
                        </div>}

                        {/* Remaining sections as placeholders */}
                        {preview.sections.filter(s => !['AI Summary', 'Profile & Identity', 'Company Profile', 'Vehicles', 'Connections Graph', 'Events Timeline', 'Risk Assessment'].includes(s)).map((s, i) => <div key={s} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: theme.text, borderBottom: `2px solid ${theme.text}`, paddingBottom: 3, marginBottom: 8 }}>{s}</div>
                            <div style={{ padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: `${theme.border}06`, fontSize: 8, color: theme.textDim, lineHeight: 1.5 }}>
                                Section data compiled from ARGUX database for reporting period {preview.dateFrom} to {preview.dateTo}. Cross-referenced across {preview.stats.events} events and {preview.stats.files} attached files. See full dataset in <a href={`/${preview.entityType === 'person' ? 'persons' : 'organizations'}/${preview.entityId}`} style={{ color: theme.accent }}>entity profile</a>.
                            </div>
                        </div>)}

                        {/* Footer */}
                        <div style={{ marginTop: 24, paddingTop: 12, borderTop: '2px solid #ef4444', textAlign: 'center' as const }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', letterSpacing: '0.1em' }}>ARGUX Surveillance Platform — {preview.classification}</div>
                            <div style={{ fontSize: 7, color: theme.textDim, marginTop: 2 }}>Report ID: {preview.id} · {preview.pages} pages · Generated {preview.generatedAt}</div>
                        </div>
                    </div>
                </div>}

                {/* Bottom */}
                {!previewReport && <div style={{ padding: '3px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>{filtered.length} reports · {stats.completed} completed</span>
                    <div style={{ flex: 1 }} /><span>Ollama LLaMA 3.1 · ChromaDB · On-Premise</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>}
            </div>

            {/* RIGHT: Report Detail */}
            {report && !previewReport && <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${statusColors[report.status]}12`, border: `1px solid ${statusColors[report.status]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{statusIcons[report.status]}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{report.title}</div><div style={{ fontSize: 7, color: theme.textDim }}>{report.classification}</div></div>
                        <button onClick={() => setSelReport(null)} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                    {[{ n: report.stats.events, l: 'Events', c: '#3b82f6' }, { n: report.stats.alerts, l: 'Alerts', c: '#ef4444' }, { n: report.stats.connections, l: 'Links', c: '#ec4899' }, { n: report.stats.lprHits, l: 'LPR', c: '#10b981' }, { n: report.stats.faceMatches, l: 'Face', c: '#8b5cf6' }, { n: report.stats.files, l: 'Files', c: '#f59e0b' }].map(s => <div key={s.l} style={{ textAlign: 'center' as const }}><div style={{ fontSize: 12, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Info */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                    {[{ l: 'Entity', v: `${report.entityType === 'person' ? '🧑' : '🏢'} ${report.entityName}` }, { l: 'Risk', v: report.entityRisk }, { l: 'Period', v: `${report.dateFrom} → ${report.dateTo}` }, { l: 'Generated', v: report.generatedAt }, { l: 'By', v: report.generatedBy }, { l: 'Pages', v: `${report.pages}` }, { l: 'Size', v: report.size }, { l: 'Operation', v: `OP ${report.operationCode}` }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: theme.text, fontWeight: 600 }}>{r.v}</span></div>)}
                </div>

                {/* Sections */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>Sections ({report.sections.length})</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                        {report.sections.map(s => <span key={s} style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${theme.border}20`, color: theme.textSecondary }}>{s}</span>)}
                    </div>
                </div>

                {/* Entity link */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <a href={`/${report.entityType === 'person' ? 'persons' : 'organizations'}/${report.entityId}`} style={{ display: 'block', fontSize: 8, padding: '4px 8px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none', textAlign: 'center' as const, fontWeight: 600 }}>{report.entityType === 'person' ? '🧑' : '🏢'} View {report.entityName} Profile</a>
                </div>

                {/* Actions */}
                <div style={{ padding: '8px 12px', display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginTop: 'auto' }}>
                    {report.status === 'Completed' && <button onClick={() => setPreviewReport(report.id)} style={{ flex: 1, padding: '6px', borderRadius: 4, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>👁️ View Report</button>}
                    {report.status === 'Completed' && <button onClick={() => { setPreviewReport(report.id); setTimeout(handlePrint, 300); }} style={{ flex: 1, padding: '6px', borderRadius: 4, border: `1px solid #22c55e30`, background: '#22c55e06', color: '#22c55e', fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🖨️ Print / PDF</button>}
                    {report.status === 'Failed' && <button style={{ flex: 1, padding: '6px', borderRadius: 4, border: `1px solid #f59e0b30`, background: '#f59e0b06', color: '#f59e0b', fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Retry</button>}
                    <a href="/storage" style={{ flex: 1, padding: '6px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8, textAlign: 'center' as const }}>📁 Storage</a>
                </div>
            </div>}
        </div>
    </>);
}

ReportsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default ReportsIndex;
