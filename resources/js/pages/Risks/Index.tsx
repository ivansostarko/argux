import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockPersons as FALLBACK_PERSONS, riskColors, type Risk } from '../../mock/persons';
import { mockOrganizations as FALLBACK_ORGS } from '../../mock/organizations';
import { mockVehicles as FALLBACK_VEHICLES } from '../../mock/vehicles';
import { personRiskFactors as FALLBACK_FACTORS, factorCategories, keyboardShortcuts } from '../../mock/risks';
import type { ViewTab, RiskFactor } from '../../mock/risks';

function getCsrf(): string { return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''); }
async function apiCall(url: string): Promise<any> {
    try { const res = await fetch(url, { headers: { Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() } }); return { ok: res.ok, data: await res.json() }; }
    catch { return { ok: false, data: {} }; }
}

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Risks Dashboard  ·  Threat Assessment Center
   ═══════════════════════════════════════════════════════════════ */

function Skel({ w, h }: { w: string | number; h: number }) {
    return <div className="risk-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />;
}
function SkeletonKPI() {
    return <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>{[1,2,3].map(i => <div key={i} style={{ flex: 1, minWidth: 150, padding: 16, borderRadius: 10, border: `1px solid ${theme.border}` }}><Skel w="50%" h={14} /><div style={{ height: 8 }} /><div style={{ display: 'flex', gap: 4 }}><Skel w="33%" h={32} /><Skel w="33%" h={32} /><Skel w="33%" h={32} /></div><div style={{ height: 8 }} /><Skel w="100%" h={5} /></div>)}</div>;
}
function SkeletonRows({ count = 5 }: { count?: number }) {
    return <>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'center' }}><Skel w={32} h={32} /><div style={{ flex: 1 }}><Skel w="60%" h={14} /><div style={{ height: 6 }} /><Skel w="40%" h={10} /></div><Skel w={50} h={14} /></div>)}</>;
}

function RisksIndex() {
    const [tab, setTab] = useState<ViewTab>('overview');
    const [riskF, setRiskF] = useState<Risk | 'all'>('all');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [catF, setCatF] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    // Data state — populated from API with fallback to static mocks
    const [mockPersons, setMockPersons] = useState(FALLBACK_PERSONS);
    const [mockOrganizations, setMockOrganizations] = useState(FALLBACK_ORGS);
    const [mockVehicles, setMockVehicles] = useState(FALLBACK_VEHICLES);
    const [personRiskFactors, setPersonRiskFactors] = useState(FALLBACK_FACTORS);

    useEffect(() => {
        const load = async () => {
            trigger();
            await Promise.all([
                apiCall('/mock-api/risks/summary'),
                apiCall('/mock-api/risks/factor-categories'),
            ]);
            setLoading(false);
        };
        load();
    }, []);

    const riskOrder: Risk[] = ['Critical', 'High', 'Medium', 'Low', 'No Risk'];

    const personsByRisk = useMemo(() => { const m: Record<string, typeof mockPersons> = {}; mockPersons.forEach(p => { if (!m[p.risk]) m[p.risk] = []; m[p.risk].push(p); }); return m; }, []);
    const orgsByRisk = useMemo(() => { const m: Record<string, typeof mockOrganizations> = {}; mockOrganizations.forEach(o => { if (!m[o.risk]) m[o.risk] = []; m[o.risk].push(o); }); return m; }, []);
    const vehiclesByRisk = useMemo(() => { const m: Record<string, typeof mockVehicles> = {}; mockVehicles.forEach(v => { if (!m[v.risk]) m[v.risk] = []; m[v.risk].push(v); }); return m; }, []);

    const totalRisk = {
        persons: { Critical: (personsByRisk['Critical'] || []).length, High: (personsByRisk['High'] || []).length, Medium: (personsByRisk['Medium'] || []).length },
        orgs: { Critical: (orgsByRisk['Critical'] || []).length, High: (orgsByRisk['High'] || []).length, Medium: (orgsByRisk['Medium'] || []).length },
        vehicles: { Critical: (vehiclesByRisk['Critical'] || []).length, High: (vehiclesByRisk['High'] || []).length, Medium: (vehiclesByRisk['Medium'] || []).length },
    };

    const filteredPersons = mockPersons.filter(p => { if (riskF !== 'all' && p.risk !== riskF) return false; if (search && !`${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) && !p.nickname.toLowerCase().includes(search.toLowerCase())) return false; return true; }).sort((a, b) => riskOrder.indexOf(a.risk) - riskOrder.indexOf(b.risk));
    const filteredOrgs = mockOrganizations.filter(o => { if (riskF !== 'all' && o.risk !== riskF) return false; if (search && !o.name.toLowerCase().includes(search.toLowerCase())) return false; return true; }).sort((a, b) => riskOrder.indexOf(a.risk) - riskOrder.indexOf(b.risk));
    const filteredVehicles = mockVehicles.filter(v => { if (riskF !== 'all' && v.risk !== riskF) return false; if (search && !v.plate.toLowerCase().includes(search.toLowerCase()) && !`${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase())) return false; return true; }).sort((a, b) => riskOrder.indexOf(a.risk) - riskOrder.indexOf(b.risk));

    const allFactors = Object.entries(personRiskFactors).flatMap(([pid, factors]) => { const p = mockPersons.find(pp => pp.id === parseInt(pid)); return factors.map(f => ({ ...f, personId: parseInt(pid), personName: p ? `${p.firstName} ${p.lastName}` : '' })); });
    const filteredFactors = allFactors.filter(f => catF === 'all' || f.category === catF).sort((a, b) => b.score - a.score);

    const tabList: ViewTab[] = ['overview', 'persons', 'organizations', 'vehicles', 'matrix'];
    const switchTab = useCallback((t: ViewTab) => { setTab(t); trigger(); }, [trigger]);
    const resetFilters = useCallback(() => { setSearch(''); setRiskF('all'); setCatF('all'); trigger(); }, [trigger]);

    // ═══ Keyboard Shortcuts ═══
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case '1': switchTab('overview'); break;
                case '2': switchTab('persons'); break;
                case '3': switchTab('organizations'); break;
                case '4': switchTab('vehicles'); break;
                case '5': switchTab('matrix'); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 'Escape': setExpanded(null); setShowShortcuts(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [switchTab, resetFilters]);

    const tabs: { id: ViewTab; label: string; icon: string; shortLabel: string }[] = [
        { id: 'overview', label: 'Overview', icon: '📊', shortLabel: 'Overview' },
        { id: 'persons', label: `Persons (${filteredPersons.length})`, icon: '🧑', shortLabel: 'Persons' },
        { id: 'organizations', label: `Orgs (${filteredOrgs.length})`, icon: '🏢', shortLabel: 'Orgs' },
        { id: 'vehicles', label: `Vehicles (${filteredVehicles.length})`, icon: '🚗', shortLabel: 'Vehicles' },
        { id: 'matrix', label: 'Risk Factors', icon: '⚠️', shortLabel: 'Factors' },
    ];

    const KPI = ({ label, icon, critical, high, medium, total, color }: { label: string; icon: string; critical: number; high: number; medium: number; total: number; color: string }) => <div style={{ flex: 1, minWidth: 160, padding: '14px 16px', borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgCard }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 20, fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace" }}>{total}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {[{ n: critical, l: 'Critical', c: '#ef4444' }, { n: high, l: 'High', c: '#f97316' }, { n: medium, l: 'Med', c: '#f59e0b' }].map(s => <div key={s.l} style={{ flex: 1, padding: '6px 8px', borderRadius: 5, background: `${s.c}08`, border: `1px solid ${s.c}15`, textAlign: 'center' as const }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div>
                <div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div>
            </div>)}
        </div>
        <div style={{ height: 5, borderRadius: 3, background: `${theme.border}20`, overflow: 'hidden', display: 'flex' }}>
            {total > 0 && <><div style={{ width: `${(critical/total)*100}%`, background: '#ef4444' }} /><div style={{ width: `${(high/total)*100}%`, background: '#f97316' }} /><div style={{ width: `${(medium/total)*100}%`, background: '#f59e0b' }} /></>}
        </div>
    </div>;

    return (<>
        <PageMeta title="Risks Dashboard" />
        <div className="risk-page" data-testid="risks-page">

            {/* LEFT SIDEBAR */}
            <div className="risk-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ef444410', border: '1px solid #ef444425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🛡️</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>RISKS</div><div style={{ fontSize: 10, color: theme.textDim }}>Threat Assessment</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entities..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="risk-kbd">F</span>
                    </div>
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Risk Level</div>
                    <button onClick={() => { setRiskF('all'); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', borderRadius: 4, border: 'none', background: riskF === 'all' ? `${theme.accent}08` : 'transparent', color: riskF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: riskF === 'all' ? 700 : 500, textAlign: 'left' as const, borderLeft: `2px solid ${riskF === 'all' ? theme.accent : 'transparent'}` }}>All Levels</button>
                    {riskOrder.map(r => { const c = riskColors[r]; const total = (personsByRisk[r]?.length || 0) + (orgsByRisk[r]?.length || 0) + (vehiclesByRisk[r]?.length || 0);
                        return <button key={r} onClick={() => { setRiskF(r); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '5px 10px', borderRadius: 4, border: 'none', background: riskF === r ? `${c}08` : 'transparent', color: riskF === r ? c : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: riskF === r ? 700 : 500, textAlign: 'left' as const, borderLeft: `2px solid ${riskF === r ? c : 'transparent'}`, marginBottom: 1 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: c, flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>{r}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{total}</span>
                        </button>;
                    })}
                </div>

                {tab === 'matrix' && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Factor Category</div>
                    <button onClick={() => setCatF('all')} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', width: '100%', background: catF === 'all' ? `${theme.accent}08` : 'transparent', color: catF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, textAlign: 'left' as const, borderLeft: `2px solid ${catF === 'all' ? theme.accent : 'transparent'}`, marginBottom: 1 }}>All Categories</button>
                    {factorCategories.map(fc => <button key={fc.id} onClick={() => setCatF(fc.id)} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', width: '100%', background: catF === fc.id ? `${fc.color}08` : 'transparent', color: catF === fc.id ? fc.color : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 6, borderLeft: `2px solid ${catF === fc.id ? fc.color : 'transparent'}`, marginBottom: 1 }}>{fc.icon} {fc.label}</button>)}
                </div>}

                <div style={{ padding: '10px 14px' }}>
                    <button onClick={resetFilters} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset Filters <span className="risk-kbd" style={{ marginLeft: 4 }}>R</span></button>
                </div>
            </div>

            {/* CENTER */}
            <div className="risk-center">
                {/* Mobile filter bar */}
                <div className="risk-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <select value={riskF} onChange={e => { setRiskF(e.target.value as any); trigger(); }} style={{ padding: '7px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}>
                        <option value="all">All Risks</option>{riskOrder.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
                    {tabs.map((t, idx) => <button key={t.id} onClick={() => switchTab(t.id)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#ef4444' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' as const }}>
                        <span style={{ fontSize: 14 }}>{t.icon}</span>
                        <span className="risk-tab-label">{t.label}</span>
                        <span className="risk-kbd" style={{ marginLeft: 2 }}>{idx + 1}</span>
                    </button>)}
                </div>

                <div className="risk-scroll">
                    {loading && <><SkeletonKPI /><div style={{ height: 20 }} /><SkeletonRows count={5} /></>}

                    {/* ═══ OVERVIEW ═══ */}
                    {!loading && tab === 'overview' && <>
                        <div className="risk-kpi-row" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const }}>
                            <KPI label="Persons" icon="🧑" critical={totalRisk.persons.Critical} high={totalRisk.persons.High} medium={totalRisk.persons.Medium} total={mockPersons.length} color={theme.accent} />
                            <KPI label="Organizations" icon="🏢" critical={totalRisk.orgs.Critical} high={totalRisk.orgs.High} medium={totalRisk.orgs.Medium} total={mockOrganizations.length} color="#8b5cf6" />
                            <KPI label="Vehicles" icon="🚗" critical={totalRisk.vehicles.Critical} high={totalRisk.vehicles.High} medium={totalRisk.vehicles.Medium} total={mockVehicles.length} color="#10b981" />
                        </div>

                        <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 10 }}>🔴 Top Threat Entities</div>
                        <div className="risk-threat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10, marginBottom: 20 }}>
                            {mockPersons.filter(p => p.risk === 'Critical').map(p => { const factors = personRiskFactors[p.id] || []; const topScore = factors.length > 0 ? Math.max(...factors.map(f => f.score)) : 0;
                                return <div key={p.id} style={{ padding: 14, borderRadius: 10, border: '1px solid #ef444420', background: '#ef444404' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                        <img src={p.avatar || undefined} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '2px solid #ef444440' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{p.firstName} {p.lastName} <span style={{ color: theme.textDim, fontWeight: 400, fontSize: 11 }}>"{p.nickname}"</span></div>
                                            <div style={{ fontSize: 11, color: theme.textDim }}>{p.nationality} · <span style={{ color: '#ef4444', fontWeight: 700 }}>CRITICAL</span></div>
                                        </div>
                                        {topScore > 0 && <div style={{ width: 40, height: 40, borderRadius: '50%', background: `conic-gradient(#ef4444 ${topScore*3.6}deg, ${theme.border}30 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>{topScore}</div></div>}
                                    </div>
                                    {factors.length > 0 && <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginBottom: 8 }}>{factors.slice(0,4).map(f => { const fc = factorCategories.find(c => c.id === f.category); return <span key={f.id} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 4, background: `${fc?.color || theme.textDim}10`, color: fc?.color || theme.textDim, fontWeight: 600 }}>{f.icon} {f.label.split(' ').slice(0,2).join(' ')}</span>; })}</div>}
                                    <a href={`/persons/${p.id}`} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 5, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>View Profile</a>
                                </div>;
                            })}
                        </div>

                        <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 10 }}>⚠️ Risk Factor Distribution</div>
                        <div className="risk-factor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                            {factorCategories.map(fc => { const count = allFactors.filter(f => f.category === fc.id).length; const avgScore = count > 0 ? Math.round(allFactors.filter(f => f.category === fc.id).reduce((s, f) => s + f.score, 0) / count) : 0;
                                return <div key={fc.id} onClick={() => { switchTab('matrix'); setCatF(fc.id); }} style={{ padding: 12, borderRadius: 8, border: `1px solid ${fc.color}15`, background: `${fc.color}04`, cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><span style={{ fontSize: 16 }}>{fc.icon}</span><span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{fc.label}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: theme.textDim }}><span>{count} factors</span>{avgScore > 0 && <span>Avg: <span style={{ color: avgScore > 85 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{avgScore}</span></span>}</div>
                                </div>;
                            })}
                        </div>
                    </>}

                    {/* ═══ PERSONS ═══ */}
                    {!loading && tab === 'persons' && <div style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                        <div className="risk-table-head" style={{ display: 'grid', gridTemplateColumns: '2.5fr 80px 80px 1fr 80px', padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, background: theme.bg }}><span>Person</span><span>Risk</span><span>Score</span><span>Top Factor</span><span style={{ textAlign: 'right' as const }}>Actions</span></div>
                        {filteredPersons.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 13 }}>No persons match filters</div>}
                        {filteredPersons.map(p => { const factors = personRiskFactors[p.id] || []; const topFactor = [...factors].sort((a,b) => b.score - a.score)[0]; const score = factors.length > 0 ? Math.round(factors.reduce((s,f) => s+f.score,0)/factors.length) : 0; const rc = riskColors[p.risk]; const isExp = expanded === `p-${p.id}`;
                            return <div key={p.id}>
                                <div className="risk-table-row risk-event" onClick={() => setExpanded(isExp ? null : `p-${p.id}`)} style={{ display: 'grid', gridTemplateColumns: '2.5fr 80px 80px 1fr 80px', padding: '10px 14px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', background: isExp ? `${rc}04` : 'transparent', borderLeft: `3px solid ${isExp ? rc : 'transparent'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <img src={p.avatar || undefined} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: `1.5px solid ${rc}30` }} />
                                        <div><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{p.firstName} {p.lastName}</div><div style={{ fontSize: 10, color: theme.textDim }}>{p.nationality}{p.nickname ? ` · "${p.nickname}"` : ''}</div></div>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: rc }}>{p.risk}</span>
                                    <div>{score > 0 ? <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 44, height: 5, borderRadius: 3, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${score}%`, height: '100%', background: score > 85 ? '#ef4444' : score > 60 ? '#f59e0b' : '#22c55e' }} /></div><span style={{ fontSize: 11, fontWeight: 700, color: score > 85 ? '#ef4444' : score > 60 ? '#f59e0b' : '#22c55e', fontFamily: "'JetBrains Mono',monospace" }}>{score}</span></div> : <span style={{ fontSize: 10, color: theme.textDim }}>—</span>}</div>
                                    <div>{topFactor ? <span style={{ fontSize: 10, padding: '3px 6px', borderRadius: 4, background: `${factorCategories.find(c => c.id === topFactor.category)?.color || theme.textDim}10`, color: factorCategories.find(c => c.id === topFactor.category)?.color || theme.textDim }}>{topFactor.icon} {topFactor.label.slice(0,22)}</span> : <span style={{ fontSize: 10, color: theme.textDim }}>No factors</span>}</div>
                                    <div style={{ textAlign: 'right' as const }}><a href={`/persons/${p.id}`} onClick={e => e.stopPropagation()} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 4, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>View</a></div>
                                </div>
                                {isExp && factors.length > 0 && <div style={{ padding: '12px 14px 12px 56px', borderBottom: `1px solid ${theme.border}`, background: `${rc}03` }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>Risk Factors ({factors.length})</div>
                                    {factors.map(f => { const fc = factorCategories.find(c => c.id === f.category); return <div key={f.id} style={{ padding: '8px 10px', marginBottom: 5, borderRadius: 6, border: `1px solid ${fc?.color || theme.border}15`, background: `${fc?.color || theme.border}04`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: 5, background: `${fc?.color || theme.border}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{f.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{f.label}</span><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${f.severity === 'critical' ? '#ef4444' : f.severity === 'high' ? '#f97316' : '#f59e0b'}12`, color: f.severity === 'critical' ? '#ef4444' : f.severity === 'high' ? '#f97316' : '#f59e0b' }}>{f.severity}</span></div>
                                            <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 3, lineHeight: 1.5 }}>{f.detail}</div>
                                        </div>
                                        <div style={{ textAlign: 'center' as const, flexShrink: 0, width: 38 }}><div style={{ fontSize: 16, fontWeight: 800, color: f.score > 85 ? '#ef4444' : f.score > 60 ? '#f59e0b' : '#22c55e', fontFamily: "'JetBrains Mono',monospace" }}>{f.score}</div><div style={{ fontSize: 8, color: theme.textDim }}>score</div></div>
                                    </div>; })}
                                </div>}
                            </div>;
                        })}
                    </div>}

                    {/* ═══ ORGANIZATIONS ═══ */}
                    {!loading && tab === 'organizations' && <div className="risk-threat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                        {filteredOrgs.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 13 }}>No organizations match filters</div>}
                        {filteredOrgs.map(o => { const rc = riskColors[o.risk]; return <div key={o.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${rc}20`, background: `${rc}03` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${rc}10`, border: `1px solid ${rc}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏢</div>
                                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{o.name}</div><div style={{ fontSize: 11, color: theme.textDim }}>{o.industry} · {o.country}</div></div>
                                <span style={{ fontSize: 10, fontWeight: 800, color: rc, padding: '3px 8px', borderRadius: 4, background: `${rc}10` }}>{o.risk}</span>
                            </div>
                            {o.ceo && <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>CEO: <span style={{ color: theme.text }}>{o.ceo}</span></div>}
                            {o.linkedPersons && o.linkedPersons.length > 0 && <div style={{ display: 'flex', gap: 3, marginBottom: 8, flexWrap: 'wrap' as const }}>{o.linkedPersons.map((lp: any) => <a key={lp.id} href={`/persons/${lp.id}`} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${theme.accent}08`, color: theme.accent, textDecoration: 'none' }}>🧑 {lp.firstName} {lp.lastName}</a>)}</div>}
                            <a href={`/organizations/${o.id}`} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 5, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>View Organization</a>
                        </div>; })}
                    </div>}

                    {/* ═══ VEHICLES ═══ */}
                    {!loading && tab === 'vehicles' && <div style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                        <div className="risk-table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 1fr 80px', padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, background: theme.bg }}><span>Plate</span><span>Vehicle</span><span>Risk</span><span>Owner</span><span style={{ textAlign: 'right' as const }}>Actions</span></div>
                        {filteredVehicles.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 13 }}>No vehicles match filters</div>}
                        {filteredVehicles.map(v => { const rc = riskColors[v.risk]; return <div key={v.id} className="risk-table-row risk-event" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 1fr 80px', padding: '10px 14px', borderBottom: `1px solid ${theme.border}06`, alignItems: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{v.plate}</div>
                            <div><div style={{ fontSize: 12, color: theme.text }}>{v.make} {v.model}</div><div style={{ fontSize: 10, color: theme.textDim }}>{v.year} · {v.color}</div></div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: rc }}>{v.risk}</span>
                            <div>{v.personName ? <a href={`/persons/${v.personId}`} style={{ fontSize: 11, color: theme.accent, textDecoration: 'none' }}>{v.personName}</a> : <span style={{ fontSize: 10, color: theme.textDim }}>—</span>}</div>
                            <div style={{ textAlign: 'right' as const }}><a href={`/vehicles/${v.id}`} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 4, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>Detail</a></div>
                        </div>; })}
                    </div>}

                    {/* ═══ RISK FACTORS ═══ */}
                    {!loading && tab === 'matrix' && <>
                        <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 10 }}>{filteredFactors.length} risk factors across {new Set(filteredFactors.map(f => f.personId)).size} subjects — sorted by score</div>
                        <div style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            {filteredFactors.map(f => { const fc = factorCategories.find(c => c.id === f.category); return <div key={f.id} className="risk-event" style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'default' }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${fc?.color || theme.border}12`, border: `1px solid ${fc?.color || theme.border}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{f.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}><span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{f.label}</span><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${f.severity === 'critical' ? '#ef4444' : '#f97316'}12`, color: f.severity === 'critical' ? '#ef4444' : '#f97316' }}>{f.severity}</span></div>
                                    <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5 }}>{f.detail}</div>
                                    <a href={`/persons/${f.personId}`} style={{ fontSize: 10, color: theme.accent, textDecoration: 'none', marginTop: 4, display: 'inline-block' }}>🧑 {f.personName}</a>
                                </div>
                                <div style={{ textAlign: 'center' as const, flexShrink: 0, width: 40 }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: f.score > 90 ? '#ef4444' : f.score > 75 ? '#f97316' : '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{f.score}</div>
                                    <div style={{ width: 34, height: 4, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden', margin: '3px auto 0' }}><div style={{ width: `${f.score}%`, height: '100%', background: f.score > 90 ? '#ef4444' : f.score > 75 ? '#f97316' : '#f59e0b' }} /></div>
                                </div>
                            </div>; })}
                        </div>
                    </>}
                </div>
            </div>

            {/* Ctrl+Q Shortcuts Modal */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div>
                        <button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="risk-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

RisksIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default RisksIndex;
