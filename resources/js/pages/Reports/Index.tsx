import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockPersons, riskColors, type Risk } from '../../mock/persons';
import { mockOrganizations } from '../../mock/organizations';
import { mockVehicles } from '../../mock/vehicles';
import { mockReports, statusColors, statusIcons, personSections, orgSections, allOps, keyboardShortcuts } from '../../mock/reports';
import type { ReportStatus, EntityType, ViewMode, Report } from '../../mock/reports';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Report Generator  ·  Intelligence Report Center
   ═══════════════════════════════════════════════════════════════ */

function Skel({ w, h }: { w: string | number; h: number }) {
    return <div className="rpt-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />;
}
function SkeletonRows({ count = 6 }: { count?: number }) {
    return <>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'center' }}><Skel w={32} h={32} /><div style={{ flex: 1 }}><Skel w="65%" h={14} /><div style={{ height: 6 }} /><Skel w="40%" h={10} /></div><Skel w={60} h={14} /></div>)}</>;
}

function ReportsIndex() {
    const [view, setView] = useState<ViewMode>('history');
    const [search, setSearch] = useState('');
    const [entityTypeF, setEntityTypeF] = useState<EntityType | 'all'>('all');
    const [opF, setOpF] = useState('all');
    const [statusF, setStatusF] = useState<ReportStatus | 'all'>('all');
    const [selReport, setSelReport] = useState<string | null>(null);
    const [previewReport, setPreviewReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    // Generator state
    const [genType, setGenType] = useState<EntityType>('person');
    const [genEntityId, setGenEntityId] = useState<number | null>(null);
    const [genDateFrom, setGenDateFrom] = useState('2026-03-01');
    const [genDateTo, setGenDateTo] = useState('2026-03-24');
    const [genSections, setGenSections] = useState<Set<string>>(new Set(personSections));

    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

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
    const handlePrint = () => { if (printRef.current) { const w = window.open('', '_blank'); if (w) { w.document.write(`<html><head><title>${preview?.title}</title><style>body{font-family:system-ui;padding:40px;color:#1a1a2e;font-size:13px;line-height:1.6}h1{font-size:22px}h2{font-size:16px;border-bottom:2px solid #1a1a2e;padding-bottom:4px;margin-top:20px}table{width:100%;border-collapse:collapse;margin:8px 0}td,th{border:1px solid #ddd;padding:6px 8px;text-align:left;font-size:12px}th{background:#f0f0f4}.footer{margin-top:40px;padding-top:12px;border-top:2px solid #ef4444;text-align:center;font-size:11px;color:#ef4444;font-weight:700}@media print{body{padding:20px}}</style></head><body>`); w.document.write(printRef.current.innerHTML); w.document.write('</body></html>'); w.document.close(); w.print(); } } };

    const switchView = useCallback((v: ViewMode) => { setView(v); setPreviewReport(null); trigger(); }, [trigger]);
    const resetFilters = useCallback(() => { setSearch(''); setEntityTypeF('all'); setOpF('all'); setStatusF('all'); trigger(); }, [trigger]);

    // ═══ Keyboard Shortcuts ═══
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case '1': switchView('history'); break;
                case '2': switchView('generate'); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 'Escape': setSelReport(null); setPreviewReport(null); setShowShortcuts(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [switchView, resetFilters]);

    return (<>
        <PageMeta title="Reports" />
        <div className="rpt-page" data-testid="reports-page">

            {/* LEFT SIDEBAR */}
            <div className="rpt-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#3b82f610', border: '1px solid #3b82f625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📊</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>REPORTS</div><div style={{ fontSize: 10, color: theme.textDim }}>Intelligence Center</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="rpt-kbd">F</span>
                    </div>
                </div>

                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ n: stats.total, l: 'Total', c: theme.accent }, { n: stats.completed, l: 'Done', c: '#22c55e' }, { n: stats.persons, l: 'Person', c: '#ec4899' }, { n: stats.orgs, l: 'Org', c: '#8b5cf6' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}><div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    {([{ id: 'history', l: '📋 Report History' }, { id: 'generate', l: '➕ Generate New' }] as { id: ViewMode; l: string }[]).map(v => <button key={v.id} onClick={() => switchView(v.id)} style={{ display: 'block', width: '100%', padding: '7px 10px', marginBottom: 3, borderRadius: 5, border: `1px solid ${view === v.id ? theme.accent + '40' : theme.border}`, background: view === v.id ? `${theme.accent}08` : 'transparent', color: view === v.id ? theme.accent : theme.textDim, fontSize: 12, fontWeight: view === v.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}>{v.l}</button>)}
                </div>

                {view === 'history' && !previewReport && <>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 5 }}>Entity Type</div>
                        <div style={{ display: 'flex', gap: 3 }}>
                            {[{ id: 'all' as const, l: 'All' }, { id: 'person' as EntityType, l: '🧑 Person' }, { id: 'organization' as EntityType, l: '🏢 Org' }].map(t => <button key={t.id} onClick={() => { setEntityTypeF(t.id); trigger(); }} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${entityTypeF === t.id ? theme.accent + '40' : theme.border}`, background: entityTypeF === t.id ? `${theme.accent}08` : 'transparent', color: entityTypeF === t.id ? theme.accent : theme.textDim, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: entityTypeF === t.id ? 700 : 500 }}>{t.l}</button>)}
                        </div>
                    </div>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Operation</div>
                        <select value={opF} onChange={e => { setOpF(e.target.value); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Operations</option>{allOps.map(o => <option key={o} value={o}>OP {o}</option>)}</select>
                    </div>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Status</div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                            {(['all', 'Completed', 'Generating', 'Failed'] as const).map(s => <button key={s} onClick={() => { setStatusF(s as any); trigger(); }} style={{ padding: '4px 8px', borderRadius: 4, border: `1px solid ${statusF === s ? (s === 'all' ? theme.accent : statusColors[s as ReportStatus]) + '40' : theme.border}`, background: statusF === s ? `${s === 'all' ? theme.accent : statusColors[s as ReportStatus]}08` : 'transparent', color: statusF === s ? (s === 'all' ? theme.accent : statusColors[s as ReportStatus]) : theme.textDim, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: statusF === s ? 700 : 500 }}>{s === 'all' ? 'All' : s}</button>)}
                        </div>
                    </div>
                </>}

                <div style={{ padding: '10px 14px' }}>
                    <button onClick={resetFilters} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset Filters <span className="rpt-kbd" style={{ marginLeft: 4 }}>R</span></button>
                </div>
            </div>

            {/* CENTER */}
            <div className="rpt-center">
                {/* Mobile bar */}
                <div className="rpt-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <select value={statusF} onChange={e => { setStatusF(e.target.value as any); trigger(); }} style={{ padding: '7px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}>
                        <option value="all">All Status</option>{(['Completed','Generating','Failed'] as const).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* ═══ HISTORY ═══ */}
                {view === 'history' && !previewReport && <>
                    <div className="rpt-table-head" style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', flexShrink: 0, background: theme.bg, gap: 8, alignItems: 'center' }}>
                        <span>Report</span><span>Status</span><span>Pages</span><span>Operation</span><span style={{ textAlign: 'right' as const }}>Generated</span>
                    </div>
                    <div className="rpt-scroll">
                        {loading && <SkeletonRows count={8} />}
                        {!loading && filtered.length === 0 && <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.2 }}>📊</div><div style={{ fontSize: 15, fontWeight: 700, color: theme.textSecondary, marginTop: 6 }}>No reports match</div><button onClick={resetFilters} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset Filters</button></div>}
                        {!loading && filtered.map(r => {
                            const rc = riskColors[r.entityRisk]; const sc = statusColors[r.status]; const sel = selReport === r.id;
                            return <div key={r.id} className="rpt-table-row rpt-event" onClick={() => setSelReport(r.id)} style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', gap: 8, background: sel ? `${sc}04` : 'transparent', borderLeft: `3px solid ${sel ? sc : 'transparent'}` }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{r.title}</div>
                                    <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${rc}12`, color: rc, fontWeight: 600 }}>{r.entityRisk}</span>
                                        <span style={{ fontSize: 10, color: theme.textDim }}>{r.entityType === 'person' ? '🧑' : '🏢'} {r.entityName}</span>
                                        <span style={{ fontSize: 9, color: theme.textDim }}>{r.classification}</span>
                                    </div>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: sc }}>{statusIcons[r.status]} {r.status}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{r.pages || '—'}</span>
                                <a href="/operations" onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: theme.accent, textDecoration: 'none' }}>{r.operationCode}</a>
                                <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 11, color: theme.textDim }}>{r.generatedAt.slice(5, 10)}</div><div style={{ fontSize: 9, color: theme.textDim }}>{r.generatedBy.split(':')[0]}</div></div>
                            </div>;
                        })}
                    </div>
                </>}

                {/* ═══ GENERATE ═══ */}
                {view === 'generate' && !previewReport && <div className="rpt-scroll" style={{ padding: 20 }}>
                    <div style={{ maxWidth: 640 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 6 }}>Generate Intelligence Report</div>
                        <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 20 }}>Select entity, date range, and report sections.</div>

                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Entity Type</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {[{ id: 'person' as EntityType, l: '🧑 Person', desc: `${personSections.length} sections` }, { id: 'organization' as EntityType, l: '🏢 Organization', desc: `${orgSections.length} sections` }].map(t => <button key={t.id} onClick={() => { setGenType(t.id); setGenEntityId(null); setGenSections(new Set(t.id === 'person' ? personSections : orgSections)); }} style={{ flex: 1, padding: 12, borderRadius: 8, border: `1px solid ${genType === t.id ? theme.accent + '40' : theme.border}`, background: genType === t.id ? `${theme.accent}06` : 'transparent', cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'inherit' }}><div style={{ fontSize: 13, fontWeight: 700, color: genType === t.id ? theme.accent : theme.text }}>{t.l}</div><div style={{ fontSize: 10, color: theme.textDim, marginTop: 3 }}>{t.desc}</div></button>)}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Select {genType === 'person' ? 'Person' : 'Organization'}</div>
                            <select value={genEntityId ?? ''} onChange={e => setGenEntityId(e.target.value ? parseInt(e.target.value) : null)} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${genEntityId ? theme.accent + '40' : theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
                                <option value="">— Select {genType === 'person' ? 'person' : 'organization'} —</option>
                                {genEntities.map(e => <option key={e.id} value={e.id}>{e.name} ({e.risk})</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Date From</div><input type="date" value={genDateFrom} onChange={e => setGenDateFrom(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' as any }} /></div>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Date To</div><input type="date" value={genDateTo} onChange={e => setGenDateTo(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' as any }} /></div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>Sections ({genSections.size}/{availSections.length})</span>
                                <div style={{ display: 'flex', gap: 6 }}><button onClick={() => setGenSections(new Set(availSections))} style={{ fontSize: 10, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>All</button><button onClick={() => setGenSections(new Set())} style={{ fontSize: 10, color: theme.textDim, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>None</button></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                {availSections.map(s => <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 5, border: `1px solid ${genSections.has(s) ? theme.accent + '30' : theme.border}`, background: genSections.has(s) ? `${theme.accent}04` : 'transparent', cursor: 'pointer', fontSize: 11, color: genSections.has(s) ? theme.text : theme.textDim }}><input type="checkbox" checked={genSections.has(s)} onChange={() => toggleSection(s)} style={{ accentColor: theme.accent }} />{s}</label>)}
                            </div>
                        </div>

                        <button disabled={!genEntityId || genSections.size === 0} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: genEntityId && genSections.size > 0 ? theme.accent : `${theme.border}30`, color: genEntityId && genSections.size > 0 ? '#fff' : theme.textDim, fontSize: 14, fontWeight: 800, cursor: genEntityId ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>📊 Generate Report ({genSections.size} sections)</button>
                    </div>
                </div>}

                {/* ═══ PREVIEW ═══ */}
                {previewReport && preview && previewEntity && <div className="rpt-scroll">
                    <div style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: theme.bg, position: 'sticky' as const, top: 0, zIndex: 1 }}>
                        <button onClick={() => setPreviewReport(null)} style={{ padding: '5px 12px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
                        <span style={{ fontSize: 13, fontWeight: 700, color: theme.text, flex: 1 }}>{preview.title}</span>
                        <button onClick={handlePrint} style={{ padding: '5px 12px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🖨️ Print / PDF</button>
                    </div>
                    <div ref={printRef} className="rpt-preview-content" style={{ padding: '28px 44px', maxWidth: 840, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center' as const, marginBottom: 24, paddingBottom: 18, borderBottom: `2px solid ${theme.accent}` }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '0.2em', marginBottom: 8 }}>{preview.classification}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>{preview.title}</div>
                            <div style={{ fontSize: 11, color: theme.textDim, marginTop: 6 }}>Period: {preview.dateFrom} — {preview.dateTo} · Generated: {preview.generatedAt}</div>
                            <div style={{ fontSize: 10, color: theme.textDim }}>Operation: {preview.operationCode} · By: {preview.generatedBy}</div>
                        </div>
                        <div className="rpt-preview-stats" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const }}>
                            {[{ l: 'Events', v: preview.stats.events, c: '#3b82f6' }, { l: 'Alerts', v: preview.stats.alerts, c: '#ef4444' }, { l: 'Connections', v: preview.stats.connections, c: '#ec4899' }, { l: 'LPR Hits', v: preview.stats.lprHits, c: '#10b981' }, { l: 'Face', v: preview.stats.faceMatches, c: '#8b5cf6' }, { l: 'Files', v: preview.stats.files, c: '#f59e0b' }].map(s => <div key={s.l} style={{ flex: '1 1 80px', padding: 10, borderRadius: 6, border: `1px solid ${s.c}15`, background: `${s.c}04`, textAlign: 'center' as const }}><div style={{ fontSize: 18, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div><div style={{ fontSize: 9, color: theme.textDim }}>{s.l}</div></div>)}
                        </div>
                        {preview.sections.includes('AI Summary') && <div style={{ marginBottom: 18 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, borderBottom: `2px solid ${theme.text}`, paddingBottom: 4, marginBottom: 10 }}>1. AI Summary</div>
                            <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.8, padding: 12, borderRadius: 8, background: `${theme.accent}04`, border: `1px solid ${theme.accent}15` }}>
                                {preview.entityType === 'person' ? `${(previewEntity as any).firstName} ${(previewEntity as any).lastName} (alias "${(previewEntity as any).nickname}") represents a ${preview.entityRisk}-risk subject under Operation ${preview.operationCode}. During the reporting period, the subject generated ${preview.stats.events} tracked events. ${preview.stats.alerts} alerts were triggered. Analysis of ${preview.stats.lprHits} LPR captures and ${preview.stats.faceMatches} face recognition matches indicates sustained operational activity. Risk assessment: ${preview.entityRisk.toUpperCase()}.` : `${(previewEntity as any).name} is classified as ${preview.entityRisk}-risk under Operation ${preview.operationCode}. The organization has ${(previewEntity as any).linkedPersons?.length || 0} linked persons. ${preview.stats.events} events were recorded with ${preview.stats.alerts} alerts. Connections graph reveals ${preview.stats.connections} significant links.`}
                                <div style={{ marginTop: 8, fontSize: 9, color: theme.textDim }}>Generated by Ollama LLaMA 3.1 (70B) with RAG context · ChromaDB + nomic-embed-text</div>
                            </div>
                        </div>}
                        {preview.sections.includes('Risk Assessment') && <div style={{ marginBottom: 18 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, borderBottom: `2px solid ${theme.text}`, paddingBottom: 4, marginBottom: 10 }}>Risk Assessment</div>
                            <div style={{ padding: 12, borderRadius: 8, border: `1px solid ${riskColors[preview.entityRisk]}20`, background: `${riskColors[preview.entityRisk]}04` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 44, height: 44, borderRadius: '50%', background: `conic-gradient(${riskColors[preview.entityRisk]} ${(preview.entityRisk === 'Critical' ? 95 : 75) * 3.6}deg, ${theme.border}20 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 32, height: 32, borderRadius: '50%', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: riskColors[preview.entityRisk], fontFamily: "'JetBrains Mono',monospace" }}>{preview.entityRisk === 'Critical' ? 95 : 75}</div></div><div><div style={{ fontSize: 14, fontWeight: 800, color: riskColors[preview.entityRisk] }}>{preview.entityRisk} RISK</div><div style={{ fontSize: 10, color: theme.textDim }}>AI-computed composite score</div></div></div>
                            </div>
                        </div>}
                        {preview.sections.filter(s => !['AI Summary', 'Risk Assessment'].includes(s)).map(s => <div key={s} style={{ marginBottom: 18 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, borderBottom: `2px solid ${theme.text}`, paddingBottom: 4, marginBottom: 10 }}>{s}</div>
                            <div style={{ padding: 12, borderRadius: 8, border: `1px solid ${theme.border}`, background: `${theme.border}06`, fontSize: 11, color: theme.textDim, lineHeight: 1.6 }}>Section data compiled from ARGUX database for {preview.dateFrom} to {preview.dateTo}. {preview.stats.events} events, {preview.stats.files} attached files.</div>
                        </div>)}
                        <div style={{ marginTop: 28, paddingTop: 14, borderTop: '2px solid #ef4444', textAlign: 'center' as const }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', letterSpacing: '0.1em' }}>ARGUX Surveillance Platform — {preview.classification}</div>
                            <div style={{ fontSize: 9, color: theme.textDim, marginTop: 3 }}>Report ID: {preview.id} · {preview.pages} pages · Generated {preview.generatedAt}</div>
                        </div>
                    </div>
                </div>}
            </div>

            {/* RIGHT: Detail Panel */}
            {report && !previewReport && <div className="rpt-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 6, background: `${statusColors[report.status]}12`, border: `1px solid ${statusColors[report.status]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{statusIcons[report.status]}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{report.title}</div><div style={{ fontSize: 9, color: theme.textDim }}>{report.classification}</div></div>
                        <button onClick={() => setSelReport(null)} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                </div>
                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    {[{ n: report.stats.events, l: 'Events', c: '#3b82f6' }, { n: report.stats.alerts, l: 'Alerts', c: '#ef4444' }, { n: report.stats.connections, l: 'Links', c: '#ec4899' }, { n: report.stats.lprHits, l: 'LPR', c: '#10b981' }, { n: report.stats.faceMatches, l: 'Face', c: '#8b5cf6' }, { n: report.stats.files, l: 'Files', c: '#f59e0b' }].map(s => <div key={s.l} style={{ textAlign: 'center' as const }}><div style={{ fontSize: 14, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                    {[{ l: 'Entity', v: `${report.entityType === 'person' ? '🧑' : '🏢'} ${report.entityName}` }, { l: 'Risk', v: report.entityRisk }, { l: 'Period', v: `${report.dateFrom} → ${report.dateTo}` }, { l: 'Generated', v: report.generatedAt }, { l: 'By', v: report.generatedBy }, { l: 'Pages', v: `${report.pages}` }, { l: 'Size', v: report.size }, { l: 'Operation', v: `OP ${report.operationCode}` }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 10, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 10, color: theme.text, fontWeight: 600 }}>{r.v}</span></div>)}
                </div>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 4 }}>Sections ({report.sections.length})</div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>{report.sections.map(s => <span key={s} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${theme.border}20`, color: theme.textSecondary }}>{s}</span>)}</div>
                </div>
                <div style={{ padding: '10px 14px', display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginTop: 'auto' }}>
                    {report.status === 'Completed' && <button onClick={() => setPreviewReport(report.id)} style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>👁️ View</button>}
                    {report.status === 'Completed' && <button onClick={() => { setPreviewReport(report.id); setTimeout(handlePrint, 300); }} style={{ flex: 1, padding: '7px', borderRadius: 5, border: '1px solid #22c55e30', background: '#22c55e06', color: '#22c55e', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🖨️ Print</button>}
                    {report.status === 'Failed' && <button style={{ flex: 1, padding: '7px', borderRadius: 5, border: '1px solid #f59e0b30', background: '#f59e0b06', color: '#f59e0b', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Retry</button>}
                </div>
            </div>}

            {/* Ctrl+Q Modal */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div>
                        <button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="rpt-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

ReportsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default ReportsIndex;
