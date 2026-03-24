import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockPersons, riskColors, type Risk } from '../../mock/persons';
import { mockOrganizations } from '../../mock/organizations';
import { mockVehicles } from '../../mock/vehicles';
import { mockDevices, deviceTypeColors, deviceTypeIcons } from '../../mock/devices';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Risks Dashboard  ·  Threat Assessment Center
   Cross-entity risk scoring, factor breakdown, trend analysis
   ═══════════════════════════════════════════════════════════════ */

// Risk factors per entity
interface RiskFactor { id: string; category: string; icon: string; label: string; severity: 'critical' | 'high' | 'medium' | 'low'; score: number; detail: string; }

// Pre-computed risk factors for key persons
const personRiskFactors: Record<number, RiskFactor[]> = {
    1: [ // Horvat
        { id: 'rf1', category: 'connections', icon: '🔗', label: 'High-risk connections', severity: 'critical', score: 95, detail: '5 connections to Critical/High entities (Mendoza, Babić, Al-Rashid, Hassan, Alpha Security)' },
        { id: 'rf2', category: 'zone', icon: '🛡️', label: 'Zone violations', severity: 'critical', score: 92, detail: '3 restricted zone breaches in 7 days. Port Terminal entry 11 times in 14 days.' },
        { id: 'rf3', category: 'behavior', icon: '🧠', label: 'Counter-surveillance', severity: 'high', score: 87, detail: 'Evasive driving (120km/h urban), weekend activity surge, route changes.' },
        { id: 'rf4', category: 'lpr', icon: '🚗', label: 'LPR activity', severity: 'high', score: 82, detail: '31 LPR captures in 30 days. Vehicle ZG-1847-AB at 8 monitored locations.' },
        { id: 'rf5', category: 'colocation', icon: '📍', label: 'Co-location pattern', severity: 'critical', score: 96, detail: '8 co-location events with Mendoza. 6 weekly meetings with Babić at Vukovarska.' },
        { id: 'rf6', category: 'anomaly', icon: '⚠️', label: 'AI anomalies', severity: 'high', score: 85, detail: '3 route deviations, 1 temporal anomaly (weekend surge), 1 speed anomaly detected.' },
    ],
    9: [ // Mendoza
        { id: 'rf7', category: 'behavior', icon: '🧠', label: 'Counter-surveillance', severity: 'critical', score: 95, detail: 'U-turns, phone off during transit, extended waits. 3 incidents this week.' },
        { id: 'rf8', category: 'connections', icon: '🔗', label: 'High-risk connections', severity: 'critical', score: 90, detail: 'Direct contact with Horvat (8 meetings), Babić, Hassan.' },
        { id: 'rf9', category: 'comms', icon: '📡', label: 'Comms anomaly', severity: 'critical', score: 93, detail: 'SIM swap detected. New prepaid IMSI. Encrypted messaging activated.' },
        { id: 'rf10', category: 'zone', icon: '🛡️', label: 'Night activity', severity: 'high', score: 88, detail: 'Active 22:00-03:00 on 4 weeknights. Nighttime ops window escalating.' },
        { id: 'rf11', category: 'anomaly', icon: '⚠️', label: 'AI anomalies', severity: 'high', score: 85, detail: 'Counter-surveillance scoring: HIGH. Evasive speed 118km/h recorded.' },
    ],
    12: [ // Babić
        { id: 'rf12', category: 'connections', icon: '🔗', label: 'Network position', severity: 'high', score: 85, detail: 'Weekly meetings with Horvat. Security Director at Alpha Security Group.' },
        { id: 'rf13', category: 'lpr', icon: '🚗', label: 'Checkpoint avoidance', severity: 'high', score: 90, detail: 'Avoiding 3 fixed LPR cameras. Alternate route used 90% of trips (18/20).' },
        { id: 'rf14', category: 'zone', icon: '🛡️', label: 'Diplomatic zone', severity: 'high', score: 88, detail: 'First-time diplomatic quarter visits. 48 minutes near Embassy Row. New pattern.' },
        { id: 'rf15', category: 'behavior', icon: '🧠', label: 'Loitering detected', severity: 'medium', score: 68, detail: 'Camera AI flagged 22-minute loitering outside Heinzelova building.' },
    ],
    7: [ // Hassan
        { id: 'rf16', category: 'comms', icon: '📡', label: 'Encrypted comms', severity: 'critical', score: 92, detail: 'New encrypted channel. 14 messages in first hour to unknown contact. Burst before meetings.' },
        { id: 'rf17', category: 'zone', icon: '🛡️', label: 'Storage visits', severity: 'high', score: 83, detail: '4 visits to self-storage in 7 days. 48-hour interval. 16:00-16:20 precision.' },
        { id: 'rf18', category: 'connections', icon: '🔗', label: 'Network coordinator', severity: 'high', score: 80, detail: 'Communication burst pattern before 9/11 meetings. Suspected coordinator role.' },
    ],
    3: [ // Al-Rashid
        { id: 'rf19', category: 'financial', icon: '💰', label: 'AML flags', severity: 'critical', score: 94, detail: 'Over-invoicing detected on 12 cargo shipments. Trade-based money laundering pattern.' },
        { id: 'rf20', category: 'connections', icon: '🔗', label: 'Financial network', severity: 'critical', score: 91, detail: 'CEO of Rashid Holdings. Direct link to Hassan (Falcon Trading). Shell company structure.' },
        { id: 'rf21', category: 'lpr', icon: '🚗', label: 'Diplomatic vehicle', severity: 'medium', score: 65, detail: 'SA-9012-RH (diplomatic plates) at airport cargo. Armored modification suspected.' },
    ],
};

const factorCategories = [
    { id: 'connections', label: 'High-Risk Connections', icon: '🔗', color: '#ef4444' },
    { id: 'zone', label: 'Zone Violations', icon: '🛡️', color: '#f97316' },
    { id: 'lpr', label: 'LPR Flags', icon: '🚗', color: '#10b981' },
    { id: 'behavior', label: 'Behavioral Anomalies', icon: '🧠', color: '#8b5cf6' },
    { id: 'comms', label: 'Comms Anomalies', icon: '📡', color: '#3b82f6' },
    { id: 'colocation', label: 'Co-location Patterns', icon: '📍', color: '#ec4899' },
    { id: 'anomaly', label: 'AI Anomalies', icon: '⚠️', color: '#f59e0b' },
    { id: 'financial', label: 'Financial Flags', icon: '💰', color: '#06b6d4' },
];

type ViewTab = 'overview' | 'persons' | 'organizations' | 'vehicles' | 'matrix';

function RisksIndex() {
    const [tab, setTab] = useState<ViewTab>('overview');
    const [riskF, setRiskF] = useState<Risk | 'all'>('all');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [catF, setCatF] = useState<string>('all');

    // Compute risk distributions
    const personsByRisk = useMemo(() => {
        const m: Record<string, typeof mockPersons> = {};
        mockPersons.forEach(p => { if (!m[p.risk]) m[p.risk] = []; m[p.risk].push(p); });
        return m;
    }, []);
    const orgsByRisk = useMemo(() => {
        const m: Record<string, typeof mockOrganizations> = {};
        mockOrganizations.forEach(o => { if (!m[o.risk]) m[o.risk] = []; m[o.risk].push(o); });
        return m;
    }, []);
    const vehiclesByRisk = useMemo(() => {
        const m: Record<string, typeof mockVehicles> = {};
        mockVehicles.forEach(v => { if (!m[v.risk]) m[v.risk] = []; m[v.risk].push(v); });
        return m;
    }, []);

    const riskOrder: Risk[] = ['Critical', 'High', 'Medium', 'Low', 'No Risk'];
    const totalRisk = {
        persons: { Critical: (personsByRisk['Critical'] || []).length, High: (personsByRisk['High'] || []).length, Medium: (personsByRisk['Medium'] || []).length, Low: (personsByRisk['Low'] || []).length, None: (personsByRisk['No Risk'] || []).length },
        orgs: { Critical: (orgsByRisk['Critical'] || []).length, High: (orgsByRisk['High'] || []).length, Medium: (orgsByRisk['Medium'] || []).length, Low: (orgsByRisk['Low'] || []).length, None: (orgsByRisk['No Risk'] || []).length },
        vehicles: { Critical: (vehiclesByRisk['Critical'] || []).length, High: (vehiclesByRisk['High'] || []).length, Medium: (vehiclesByRisk['Medium'] || []).length, Low: (vehiclesByRisk['Low'] || []).length, None: (vehiclesByRisk['No Risk'] || []).length },
    };

    const filteredPersons = mockPersons.filter(p => {
        if (riskF !== 'all' && p.risk !== riskF) return false;
        if (search && !`${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) && !p.nickname.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }).sort((a, b) => riskOrder.indexOf(a.risk) - riskOrder.indexOf(b.risk));

    const filteredOrgs = mockOrganizations.filter(o => {
        if (riskF !== 'all' && o.risk !== riskF) return false;
        if (search && !o.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }).sort((a, b) => riskOrder.indexOf(a.risk) - riskOrder.indexOf(b.risk));

    const filteredVehicles = mockVehicles.filter(v => {
        if (riskF !== 'all' && v.risk !== riskF) return false;
        if (search && !v.plate.toLowerCase().includes(search.toLowerCase()) && !`${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }).sort((a, b) => riskOrder.indexOf(a.risk) - riskOrder.indexOf(b.risk));

    // All risk factors flat
    const allFactors = Object.entries(personRiskFactors).flatMap(([pid, factors]) => {
        const p = mockPersons.find(pp => pp.id === parseInt(pid));
        return factors.map(f => ({ ...f, personId: parseInt(pid), personName: p ? `${p.firstName} ${p.lastName}` : '' }));
    });
    const filteredFactors = allFactors.filter(f => catF === 'all' || f.category === catF).sort((a, b) => b.score - a.score);

    // KPI card
    const KPI = ({ label, icon, critical, high, medium, total, color }: { label: string; icon: string; critical: number; high: number; medium: number; total: number; color: string }) => <div style={{ flex: 1, minWidth: 150, padding: '12px 14px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bgCard }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace" }}>{total}</span>
        </div>
        <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
            {[{ n: critical, l: 'Critical', c: '#ef4444' }, { n: high, l: 'High', c: '#f97316' }, { n: medium, l: 'Med', c: '#f59e0b' }].map(s => <div key={s.l} style={{ flex: 1, padding: '4px 6px', borderRadius: 4, background: `${s.c}08`, border: `1px solid ${s.c}15`, textAlign: 'center' as const }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div>
                <div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div>
            </div>)}
        </div>
        {/* Risk distribution bar */}
        <div style={{ height: 4, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden', display: 'flex' }}>
            {total > 0 && <>
                <div style={{ width: `${(critical / total) * 100}%`, background: '#ef4444' }} />
                <div style={{ width: `${(high / total) * 100}%`, background: '#f97316' }} />
                <div style={{ width: `${(medium / total) * 100}%`, background: '#f59e0b' }} />
            </>}
        </div>
    </div>;

    const tabs: { id: ViewTab; label: string; icon: string }[] = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'persons', label: `Persons (${filteredPersons.length})`, icon: '🧑' },
        { id: 'organizations', label: `Orgs (${filteredOrgs.length})`, icon: '🏢' },
        { id: 'vehicles', label: `Vehicles (${filteredVehicles.length})`, icon: '🚗' },
        { id: 'matrix', label: 'Risk Factors', icon: '⚠️' },
    ];

    return (<>
        <PageMeta title="Risks Dashboard" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* ═══ LEFT: Filters ═══ */}
            <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#ef444410', border: '1px solid #ef444425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🛡️</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>RISKS</div><div style={{ fontSize: 7, color: theme.textDim }}>Threat Assessment Center</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entities..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                {/* Risk level filter */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Risk Level</div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 1 }}>
                        <button onClick={() => setRiskF('all')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 4, border: 'none', background: riskF === 'all' ? `${theme.accent}08` : 'transparent', color: riskF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 9, fontWeight: riskF === 'all' ? 700 : 500, textAlign: 'left' as const, borderLeft: `2px solid ${riskF === 'all' ? theme.accent : 'transparent'}` }}>All Levels</button>
                        {riskOrder.map(r => {
                            const c = riskColors[r];
                            const total = (personsByRisk[r]?.length || 0) + (orgsByRisk[r]?.length || 0) + (vehiclesByRisk[r]?.length || 0);
                            return <button key={r} onClick={() => setRiskF(r)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 4, border: 'none', background: riskF === r ? `${c}08` : 'transparent', color: riskF === r ? c : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 9, fontWeight: riskF === r ? 700 : 500, textAlign: 'left' as const, borderLeft: `2px solid ${riskF === r ? c : 'transparent'}` }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
                                <span style={{ flex: 1 }}>{r}</span>
                                <span style={{ fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{total}</span>
                            </button>;
                        })}
                    </div>
                </div>

                {/* Factor category filter (for matrix tab) */}
                {tab === 'matrix' && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Factor Category</div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 1 }}>
                        <button onClick={() => setCatF('all')} style={{ padding: '3px 8px', borderRadius: 3, border: 'none', background: catF === 'all' ? `${theme.accent}08` : 'transparent', color: catF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, textAlign: 'left' as const, borderLeft: `2px solid ${catF === 'all' ? theme.accent : 'transparent'}` }}>All Categories</button>
                        {factorCategories.map(fc => <button key={fc.id} onClick={() => setCatF(fc.id)} style={{ padding: '3px 8px', borderRadius: 3, border: 'none', background: catF === fc.id ? `${fc.color}08` : 'transparent', color: catF === fc.id ? fc.color : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 4, borderLeft: `2px solid ${catF === fc.id ? fc.color : 'transparent'}` }}>{fc.icon} {fc.label}</button>)}
                    </div>
                </div>}

                {/* Quick links */}
                <div style={{ padding: '8px 12px', marginTop: 'auto' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 4 }}>Quick Links</div>
                    {[{ l: '🗺️ Tactical Map', h: '/map' }, { l: '📊 Activity Log', h: '/activity' }, { l: '🎯 Operations', h: '/operations' }, { l: '⚡ Workflows', h: '/workflows' }].map(lk => <a key={lk.h} href={lk.h} style={{ display: 'block', fontSize: 8, color: theme.textDim, textDecoration: 'none', padding: '2px 0' }}>{lk.l}</a>)}
                </div>
            </div>

            {/* ═══ RIGHT: Content ═══ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#ef4444' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 10, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' as const }}><span style={{ fontSize: 12 }}>{t.icon}</span>{t.label}</button>)}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', padding: 16 }}>

                    {/* ═══ OVERVIEW ═══ */}
                    {tab === 'overview' && <>
                        {/* KPI row */}
                        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const }}>
                            <KPI label="Persons" icon="🧑" critical={totalRisk.persons.Critical} high={totalRisk.persons.High} medium={totalRisk.persons.Medium} total={mockPersons.length} color={theme.accent} />
                            <KPI label="Organizations" icon="🏢" critical={totalRisk.orgs.Critical} high={totalRisk.orgs.High} medium={totalRisk.orgs.Medium} total={mockOrganizations.length} color="#8b5cf6" />
                            <KPI label="Vehicles" icon="🚗" critical={totalRisk.vehicles.Critical} high={totalRisk.vehicles.High} medium={totalRisk.vehicles.Medium} total={mockVehicles.length} color="#10b981" />
                        </div>

                        {/* Top threats */}
                        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>🔴 Top Threat Entities</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8, marginBottom: 16 }}>
                            {mockPersons.filter(p => p.risk === 'Critical').map(p => {
                                const factors = personRiskFactors[p.id] || [];
                                const topScore = factors.length > 0 ? Math.max(...factors.map(f => f.score)) : 0;
                                return <div key={p.id} style={{ padding: '12px', borderRadius: 8, border: '1px solid #ef444420', background: '#ef444404' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <img src={p.avatar || undefined} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '2px solid #ef444440' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{p.firstName} {p.lastName} <span style={{ color: theme.textDim, fontWeight: 400, fontSize: 9 }}>"{p.nickname}"</span></div>
                                            <div style={{ fontSize: 8, color: theme.textDim }}>{p.nationality} · <span style={{ color: '#ef4444', fontWeight: 700 }}>CRITICAL</span></div>
                                        </div>
                                        {topScore > 0 && <div style={{ width: 36, height: 36, borderRadius: '50%', background: `conic-gradient(#ef4444 ${topScore * 3.6}deg, ${theme.border}30 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 26, height: 26, borderRadius: '50%', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>{topScore}</div></div>}
                                    </div>
                                    {factors.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                                        {factors.slice(0, 4).map(f => { const fc = factorCategories.find(c => c.id === f.category);
                                            return <span key={f.id} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${fc?.color || theme.textDim}10`, color: fc?.color || theme.textDim, fontWeight: 600 }}>{f.icon} {f.label.split(' ').slice(0, 2).join(' ')}</span>;
                                        })}
                                    </div>}
                                    <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
                                        <a href={`/persons/${p.id}`} style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>View Profile</a>
                                        <a href="/map" style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none' }}>🗺️ Map</a>
                                    </div>
                                </div>;
                            })}
                        </div>

                        {/* Risk factor summary */}
                        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>⚠️ Risk Factor Distribution</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6 }}>
                            {factorCategories.map(fc => {
                                const count = allFactors.filter(f => f.category === fc.id).length;
                                const avgScore = count > 0 ? Math.round(allFactors.filter(f => f.category === fc.id).reduce((s, f) => s + f.score, 0) / count) : 0;
                                return <div key={fc.id} onClick={() => { setTab('matrix'); setCatF(fc.id); }} style={{ padding: '10px', borderRadius: 6, border: `1px solid ${fc.color}15`, background: `${fc.color}04`, cursor: 'pointer', transition: 'border-color 0.15s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <span style={{ fontSize: 14 }}>{fc.icon}</span>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{fc.label}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: theme.textDim }}>
                                        <span>{count} factors</span>
                                        {avgScore > 0 && <span>Avg: <span style={{ color: avgScore > 85 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{avgScore}</span></span>}
                                    </div>
                                </div>;
                            })}
                        </div>
                    </>}

                    {/* ═══ PERSONS ═══ */}
                    {tab === 'persons' && <>
                        <div style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 80px 80px 1fr 80px', padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', background: theme.bg }}>
                                <span>Person</span><span>Risk</span><span>Score</span><span>Top Factor</span><span style={{ textAlign: 'right' as const }}>Actions</span>
                            </div>
                            {filteredPersons.map(p => {
                                const factors = personRiskFactors[p.id] || [];
                                const topFactor = factors.sort((a, b) => b.score - a.score)[0];
                                const score = factors.length > 0 ? Math.round(factors.reduce((s, f) => s + f.score, 0) / factors.length) : 0;
                                const rc = riskColors[p.risk];
                                const isExp = expanded === `p-${p.id}`;
                                return <div key={p.id}>
                                    <div onClick={() => setExpanded(isExp ? null : `p-${p.id}`)} style={{ display: 'grid', gridTemplateColumns: '2.5fr 80px 80px 1fr 80px', padding: '8px 12px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', background: isExp ? `${rc}04` : 'transparent', borderLeft: `3px solid ${isExp ? rc : 'transparent'}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <img src={p.avatar || undefined} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', border: `1.5px solid ${rc}30` }} />
                                            <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{p.firstName} {p.lastName}</div><div style={{ fontSize: 7, color: theme.textDim }}>{p.nationality} · {p.nickname ? `"${p.nickname}"` : p.country}</div></div>
                                        </div>
                                        <span style={{ fontSize: 8, fontWeight: 700, color: rc }}>{p.risk}</span>
                                        <div>{score > 0 ? <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <div style={{ width: 40, height: 4, borderRadius: 2, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${score}%`, height: '100%', background: score > 85 ? '#ef4444' : score > 60 ? '#f59e0b' : '#22c55e', borderRadius: 2 }} /></div>
                                            <span style={{ fontSize: 8, fontWeight: 700, color: score > 85 ? '#ef4444' : score > 60 ? '#f59e0b' : '#22c55e', fontFamily: "'JetBrains Mono',monospace" }}>{score}</span>
                                        </div> : <span style={{ fontSize: 8, color: theme.textDim }}>—</span>}</div>
                                        <div>{topFactor ? <span style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${factorCategories.find(c => c.id === topFactor.category)?.color || theme.textDim}10`, color: factorCategories.find(c => c.id === topFactor.category)?.color || theme.textDim }}>{topFactor.icon} {topFactor.label.slice(0, 20)}</span> : <span style={{ fontSize: 8, color: theme.textDim }}>No factors</span>}</div>
                                        <div style={{ textAlign: 'right' as const }}><a href={`/persons/${p.id}`} onClick={e => e.stopPropagation()} style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>View</a></div>
                                    </div>
                                    {/* Expanded factors */}
                                    {isExp && factors.length > 0 && <div style={{ padding: '10px 12px 10px 53px', borderBottom: `1px solid ${theme.border}`, background: `${rc}03` }}>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Risk Factors ({factors.length})</div>
                                        {factors.map(f => { const fc = factorCategories.find(c => c.id === f.category);
                                            return <div key={f.id} style={{ padding: '6px 8px', marginBottom: 4, borderRadius: 5, border: `1px solid ${fc?.color || theme.border}15`, background: `${fc?.color || theme.border}04`, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                                <div style={{ width: 20, height: 20, borderRadius: 4, background: `${fc?.color || theme.border}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>{f.icon}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{f.label}</span><span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: `${f.severity === 'critical' ? '#ef4444' : f.severity === 'high' ? '#f97316' : '#f59e0b'}12`, color: f.severity === 'critical' ? '#ef4444' : f.severity === 'high' ? '#f97316' : '#f59e0b' }}>{f.severity}</span></div>
                                                    <div style={{ fontSize: 8, color: theme.textSecondary, marginTop: 2, lineHeight: 1.4 }}>{f.detail}</div>
                                                </div>
                                                <div style={{ width: 30, textAlign: 'center' as const }}><div style={{ fontSize: 12, fontWeight: 800, color: f.score > 85 ? '#ef4444' : f.score > 60 ? '#f59e0b' : '#22c55e', fontFamily: "'JetBrains Mono',monospace" }}>{f.score}</div><div style={{ fontSize: 6, color: theme.textDim }}>score</div></div>
                                            </div>;
                                        })}
                                    </div>}
                                </div>;
                            })}
                        </div>
                    </>}

                    {/* ═══ ORGANIZATIONS ═══ */}
                    {tab === 'organizations' && <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                            {filteredOrgs.map(o => {
                                const rc = riskColors[o.risk];
                                return <div key={o.id} style={{ padding: '12px', borderRadius: 8, border: `1px solid ${rc}20`, background: `${rc}03` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 6, background: `${rc}10`, border: `1px solid ${rc}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏢</div>
                                        <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{o.name}</div><div style={{ fontSize: 8, color: theme.textDim }}>{o.industry} · {o.country}</div></div>
                                        <span style={{ fontSize: 8, fontWeight: 800, color: rc, padding: '2px 6px', borderRadius: 3, background: `${rc}10` }}>{o.risk}</span>
                                    </div>
                                    {o.ceo && <div style={{ fontSize: 8, color: theme.textDim, marginBottom: 2 }}>CEO: <span style={{ color: theme.text }}>{o.ceo}</span></div>}
                                    {o.linkedPersons && o.linkedPersons.length > 0 && <div style={{ display: 'flex', gap: 2, marginBottom: 6, flexWrap: 'wrap' as const }}>
                                        {o.linkedPersons.map((lp: any) => <a key={lp.id} href={`/persons/${lp.id}`} style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${theme.accent}08`, color: theme.accent, textDecoration: 'none' }}>🧑 {lp.firstName} {lp.lastName}</a>)}
                                    </div>}
                                    <a href={`/organizations/${o.id}`} style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>View Organization</a>
                                </div>;
                            })}
                        </div>
                    </>}

                    {/* ═══ VEHICLES ═══ */}
                    {tab === 'vehicles' && <>
                        <div style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 1fr 80px', padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: 7, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, background: theme.bg }}>
                                <span>Plate</span><span>Vehicle</span><span>Risk</span><span>Owner</span><span style={{ textAlign: 'right' as const }}>Actions</span>
                            </div>
                            {filteredVehicles.map(v => {
                                const rc = riskColors[v.risk];
                                return <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 1fr 80px', padding: '8px 12px', borderBottom: `1px solid ${theme.border}06`, alignItems: 'center' }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{v.plate}</div>
                                    <div><div style={{ fontSize: 9, color: theme.text }}>{v.make} {v.model}</div><div style={{ fontSize: 7, color: theme.textDim }}>{v.year} · {v.color}</div></div>
                                    <span style={{ fontSize: 8, fontWeight: 700, color: rc }}>{v.risk}</span>
                                    <div>{v.personName ? <a href={`/persons/${v.personId}`} style={{ fontSize: 8, color: theme.accent, textDecoration: 'none' }}>{v.personName}</a> : <span style={{ fontSize: 8, color: theme.textDim }}>—</span>}</div>
                                    <div style={{ textAlign: 'right' as const }}><a href={`/vehicles/${v.id}`} style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>Detail</a></div>
                                </div>;
                            })}
                        </div>
                    </>}

                    {/* ═══ RISK FACTORS MATRIX ═══ */}
                    {tab === 'matrix' && <>
                        <div style={{ fontSize: 8, color: theme.textDim, marginBottom: 8 }}>{filteredFactors.length} risk factors across {new Set(filteredFactors.map(f => f.personId)).size} subjects — sorted by score</div>
                        <div style={{ borderRadius: 6, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            {filteredFactors.map(f => {
                                const fc = factorCategories.find(c => c.id === f.category);
                                return <div key={f.id} style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: 5, background: `${fc?.color || theme.border}12`, border: `1px solid ${fc?.color || theme.border}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{f.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{f.label}</span>
                                            <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: `${f.severity === 'critical' ? '#ef4444' : '#f97316'}12`, color: f.severity === 'critical' ? '#ef4444' : '#f97316' }}>{f.severity}</span>
                                        </div>
                                        <div style={{ fontSize: 8, color: theme.textSecondary, lineHeight: 1.4 }}>{f.detail}</div>
                                        <a href={`/persons/${f.personId}`} style={{ fontSize: 7, color: theme.accent, textDecoration: 'none', marginTop: 3, display: 'inline-block' }}>🧑 {f.personName}</a>
                                    </div>
                                    <div style={{ textAlign: 'center' as const, flexShrink: 0, width: 36 }}>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: f.score > 90 ? '#ef4444' : f.score > 75 ? '#f97316' : '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{f.score}</div>
                                        <div style={{ width: 30, height: 3, borderRadius: 1, background: `${theme.border}20`, overflow: 'hidden', margin: '2px auto 0' }}><div style={{ width: `${f.score}%`, height: '100%', background: f.score > 90 ? '#ef4444' : f.score > 75 ? '#f97316' : '#f59e0b' }} /></div>
                                    </div>
                                </div>;
                            })}
                        </div>
                    </>}
                </div>

                {/* Bottom */}
                <div style={{ padding: '3px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>{mockPersons.length} persons · {mockOrganizations.length} organizations · {mockVehicles.length} vehicles · {allFactors.length} risk factors</span>
                    <div style={{ flex: 1 }} />
                    <span>AI: XGBoost + scikit-learn · On-Premise</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>
        </div>
    </>);
}

RisksIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default RisksIndex;
