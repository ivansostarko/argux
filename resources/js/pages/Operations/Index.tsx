import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockPersons } from '../../mock/persons';
import { mockDevices, deviceTypeIcons } from '../../mock/devices';
import { mockOrganizations } from '../../mock/organizations';
import { mockVehicles } from '../../mock/vehicles';
import { mockOps, phaseColors, phaseIcons, prioColors, allPhases, tabList, keyboardShortcuts } from '../../mock/operations';
import type { Phase, Priority, DetailTab } from '../../mock/operations';

/* ═══ ARGUX — Operations ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="op-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }

function OperationsIndex() {
    const [selOp, setSelOp] = useState<string>(mockOps[0].id);
    const [tab, setTab] = useState<DetailTab>('overview');
    const [phaseF, setPhaseF] = useState<Phase | 'all'>('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newForm, setNewForm] = useState({ codename: '', name: '', description: '', phase: 'Planning' as Phase, priority: 'High' as Priority, classification: 'SECRET', commander: '' });
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

    const op = mockOps.find(o => o.id === selOp) || mockOps[0];
    const filtered = useMemo(() => mockOps.filter(o => {
        if (phaseF !== 'all' && o.phase !== phaseF) return false;
        if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.codename.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [phaseF, search]);

    const targets = op.targetPersonIds.map(id => mockPersons.find(p => p.id === id)).filter(Boolean);
    const targetOrgs = op.targetOrgIds.map(id => mockOrganizations.find(o => o.id === id)).filter(Boolean);
    const devices = op.deployedDeviceIds.map(id => mockDevices.find(d => d.id === id)).filter(Boolean);
    const vehicles = op.trackedVehicleIds.map(id => mockVehicles.find(v => v.id === id)).filter(Boolean);

    const resetFilters = useCallback(() => { setSearch(''); setPhaseF('all'); trigger(); }, [trigger]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case 'n': case 'N': if (!e.ctrlKey && !e.metaKey) setShowNewModal(true); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 'Escape': setShowShortcuts(false); setShowNewModal(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [resetFilters]);

    const SB = ({ c, n, l }: { c: string; n: number | string; l: string }) => <div style={{ padding: '8px 12px', borderRadius: 8, background: `${c}08`, border: `1px solid ${c}20`, flex: 1, minWidth: 80 }}><div style={{ fontSize: 20, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{n}</div><div style={{ fontSize: 9, color: theme.textDim, marginTop: 2 }}>{l}</div></div>;

    return (<>
        <PageMeta title={`Operations — ${op.codename}`} />
        <div className="op-page" data-testid="operations-page">

            {/* LEFT */}
            <div className="op-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ef444410', border: '1px solid #ef444425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🎯</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>OPERATIONS</div><div style={{ fontSize: 10, color: theme.textDim }}>Planning Center</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', marginBottom: 8 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="op-kbd">F</span>
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        {(['all', ...allPhases] as (Phase | 'all')[]).map(p => <button key={p} onClick={() => { setPhaseF(p); trigger(); }} style={{ padding: '4px 8px', borderRadius: 4, border: `1px solid ${phaseF === p ? (p === 'all' ? theme.accent : phaseColors[p as Phase]) + '40' : theme.border}`, background: phaseF === p ? `${p === 'all' ? theme.accent : phaseColors[p as Phase]}08` : 'transparent', color: phaseF === p ? (p === 'all' ? theme.accent : phaseColors[p as Phase]) : theme.textDim, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{p === 'all' ? 'All' : p}</button>)}</div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {loading && Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}06` }}><Skel w="40%" h={14} /><div style={{ height: 5 }} /><Skel w="80%" h={12} /><div style={{ height: 5 }} /><Skel w="60%" h={10} /></div>)}
                    {!loading && filtered.map(o => { const pc = phaseColors[o.phase]; const sel = o.id === selOp;
                        return <div key={o.id} className="op-card" onClick={() => { setSelOp(o.id); setTab('overview'); trigger(); }} style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', borderLeft: `3px solid ${sel ? pc : 'transparent'}`, background: sel ? `${pc}06` : 'transparent' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${pc}15`, color: pc }}>{o.phase.toUpperCase()}</span>
                                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${prioColors[o.priority]}12`, color: prioColors[o.priority] }}>{o.priority}</span>
                                <span style={{ fontSize: 9, color: theme.textDim, marginLeft: 'auto' }}>{o.startDate}</span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: pc, fontFamily: "'JetBrains Mono',monospace", marginBottom: 3 }}>{o.codename}</div>
                            <div style={{ fontSize: 10, color: theme.textDim, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{o.description.slice(0, 100)}</div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 5, fontSize: 9, color: theme.textDim }}>
                                <span>🎯{o.targetPersonIds.length}</span><span>📡{o.deployedDeviceIds.length}</span><span>👥{o.teams.length}</span>
                            </div>
                        </div>; })}
                </div>

                <div style={{ padding: '10px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 6 }}>
                    <button onClick={() => setShowNewModal(true)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>+ New <span className="op-kbd" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>N</span></button>
                    <button onClick={resetFilters} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
                </div>
            </div>

            {/* CENTER */}
            <div className="op-center">
                <div className="op-mobile-bar">
                    <select value={selOp} onChange={e => { setSelOp(e.target.value); setTab('overview'); trigger(); }} style={{ flex: 1, padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}>{mockOps.map(o => <option key={o.id} value={o.id}>{o.codename} — {o.phase}</option>)}</select>
                    <button onClick={() => setShowNewModal(true)} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ New</button>
                </div>

                {/* Header */}
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap' as const }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${phaseColors[op.phase]}10`, border: `1.5px solid ${phaseColors[op.phase]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{phaseIcons[op.phase]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: theme.text }}>
                            <span style={{ color: phaseColors[op.phase], fontFamily: "'JetBrains Mono',monospace" }}>{op.codename}</span>
                            <span style={{ fontWeight: 400, color: theme.textDim, fontSize: 12, marginLeft: 8 }}>{op.name.replace(`Operation ${op.codename} — `, '')}</span>
                        </div>
                        <div style={{ fontSize: 10, color: theme.textDim, marginTop: 3, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' as const }}>
                            <span style={{ fontWeight: 700, color: phaseColors[op.phase] }}>{op.phase}</span>
                            <span>Cmdr: {op.commander}</span>
                            <span>{op.startDate}{op.endDate ? ` → ${op.endDate}` : ' → ongoing'}</span>
                        </div>
                    </div>
                    {op.riskLevel > 0 && <div className="op-header-extra" style={{ textAlign: 'center' as const }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `conic-gradient(${op.riskLevel > 70 ? '#ef4444' : op.riskLevel > 40 ? '#f59e0b' : '#22c55e'} ${op.riskLevel * 3.6}deg, ${theme.border}30 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: op.riskLevel > 70 ? '#ef4444' : op.riskLevel > 40 ? '#f59e0b' : '#22c55e', fontFamily: "'JetBrains Mono',monospace" }}>{op.riskLevel}</div></div>
                        <div style={{ fontSize: 8, color: theme.textDim, marginTop: 2 }}>RISK</div>
                    </div>}
                </div>

                {/* Tabs */}
                <div style={{ padding: '0 18px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 0, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
                    {tabList.map(t => <button key={t.id} onClick={() => { setTab(t.id); trigger(); }} style={{ padding: '9px 12px', border: 'none', borderBottom: `2px solid ${tab === t.id ? phaseColors[op.phase] : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 11, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' as const }}><span style={{ fontSize: 13 }}>{t.icon}</span><span className="op-tab-label">{t.label}</span></button>)}
                </div>

                <div className="op-scroll">
                    {loading && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>{Array.from({ length: 4 }).map((_, i) => <Skel key={i} w="24%" h={80} />)}<Skel w="100%" h={100} /><Skel w="100%" h={120} /></div>}

                    {!loading && tab === 'overview' && <>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' as const }}>
                            <SB c="#3b82f6" n={op.stats.events} l="Events" /><SB c="#ef4444" n={op.stats.alerts} l="Alerts" /><SB c="#22c55e" n={`${op.stats.hoursActive}h`} l="Active" /><SB c="#a855f7" n={op.stats.intel} l="Intel" />
                        </div>
                        <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.7, marginBottom: 14, padding: '12px 14px', borderRadius: 8, background: `${theme.border}08`, border: `1px solid ${theme.border}` }}>{op.description}</div>
                        {op.checklist.length > 0 && <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>📋 Checklist ({op.checklist.filter(c => c.done).length}/{op.checklist.length})</div>
                            <div style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                                {op.checklist.map(c => <div key={c.id} style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
                                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${c.done ? '#22c55e' : theme.border}`, background: c.done ? '#22c55e15' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#22c55e', flexShrink: 0 }}>{c.done ? '✓' : ''}</div>
                                    <span style={{ color: c.done ? theme.textDim : theme.text, textDecoration: c.done ? 'line-through' : 'none', flex: 1 }}>{c.label}</span>
                                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${theme.border}30`, color: theme.textDim }}>{c.assignee}</span>
                                </div>)}
                            </div>
                        </div>}
                        {op.threatAssessment && op.threatAssessment !== '[CLASSIFIED]' && <div style={{ padding: '12px 14px', borderRadius: 8, background: op.riskLevel > 70 ? '#ef444404' : '#f59e0b04', border: `1px solid ${op.riskLevel > 70 ? '#ef4444' : '#f59e0b'}15` }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: op.riskLevel > 70 ? '#ef4444' : '#f59e0b', marginBottom: 5 }}>⚠️ Threat Assessment</div>
                            <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>{op.threatAssessment}</div>
                        </div>}
                    </>}

                    {!loading && tab === 'targets' && <>
                        {targets.length > 0 && <><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>🎯 Persons ({targets.length})</div><div className="op-grid-2" style={{ marginBottom: 14 }}>
                            {targets.map(p => { if (!p) return null; const rc = prioColors[(p.risk as Priority) || 'Medium']; return <div key={p.id} style={{ padding: 12, borderRadius: 8, border: `1px solid ${theme.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
                                <img src={p.avatar || undefined} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' as const, border: `1.5px solid ${rc}40` }} />
                                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{p.firstName} {p.lastName}</div><div style={{ fontSize: 10, color: theme.textDim }}>{p.nationality} · <span style={{ color: rc, fontWeight: 600 }}>{p.risk}</span></div></div>
                                <a href={`/persons/${p.id}`} style={{ fontSize: 9, padding: '4px 8px', borderRadius: 4, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>View</a>
                            </div>; })}
                        </div></>}
                        {targetOrgs.length > 0 && <><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>🏢 Organizations ({targetOrgs.length})</div><div className="op-grid-2">
                            {targetOrgs.map(o => { if (!o) return null; return <div key={o.id} style={{ padding: 12, borderRadius: 8, border: `1px solid ${theme.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${theme.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏢</div>
                                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{o.name}</div><div style={{ fontSize: 10, color: theme.textDim }}>{o.country}</div></div>
                                <a href={`/organizations/${o.id}`} style={{ fontSize: 9, padding: '4px 8px', borderRadius: 4, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>View</a>
                            </div>; })}
                        </div></>}
                        {targets.length === 0 && targetOrgs.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>{op.phase === 'Closed' ? '🔒 Restricted' : 'No targets assigned'}</div>}
                    </>}

                    {!loading && tab === 'resources' && <>
                        {devices.length > 0 && <><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>📡 Devices ({devices.length})</div><div style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden', marginBottom: 14 }}>
                            {devices.map(d => { if (!d) return null; return <div key={d.id} style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 16 }}>{deviceTypeIcons[d.type as keyof typeof deviceTypeIcons] || '📡'}</span>
                                <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{d.name}</div><div style={{ fontSize: 9, color: theme.textDim }}>{d.type} · {d.locationName.split(',')[0]}</div></div>
                                <span style={{ fontSize: 9, fontWeight: 700, color: d.status === 'Online' ? '#22c55e' : '#ef4444' }}>{d.status}</span>
                            </div>; })}
                        </div></>}
                        {vehicles.length > 0 && <><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>🚗 Vehicles ({vehicles.length})</div><div style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            {vehicles.map(v => { if (!v) return null; return <div key={v.id} style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 16 }}>🚗</span>
                                <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{v.plate} — {v.make} {v.model}</div><div style={{ fontSize: 9, color: theme.textDim }}>{v.year} · {v.color}</div></div>
                            </div>; })}
                        </div></>}
                    </>}

                    {!loading && tab === 'teams' && <div className="op-grid-2">
                        {op.teams.map(t => <div key={t.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${t.color}20`, background: `${t.color}04` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${t.color}15`, border: `1px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{t.icon}</div>
                                <div><div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{t.name}</div><div style={{ fontSize: 10, color: theme.textDim }}>Lead: {t.lead}</div></div>
                            </div>
                            {t.members.length > 0 && <div style={{ borderTop: `1px solid ${t.color}15`, paddingTop: 6 }}>
                                {t.members.map(m => { const p = mockPersons.find(pp => pp.id === m.personId); return <div key={m.personId} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 10 }}>
                                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, padding: '2px 5px', borderRadius: 3, background: `${t.color}15`, color: t.color, fontWeight: 700 }}>{m.callsign}</span>
                                    <span style={{ color: theme.text }}>{p ? `${p.firstName} ${p.lastName}` : `#${m.personId}`}</span>
                                    <span style={{ color: theme.textDim, marginLeft: 'auto' }}>{m.role}</span>
                                </div>; })}
                            </div>}
                        </div>)}
                        {op.teams.length === 0 && <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No teams</div>}
                    </div>}

                    {!loading && tab === 'zones' && <div className="op-grid-2">
                        {op.zones.map(z => { const ztc = z.type === 'restricted' ? '#ef4444' : z.type === 'staging' ? '#f59e0b' : z.type === 'buffer' ? '#06b6d4' : '#22c55e';
                            return <div key={z.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${ztc}20`, background: `${ztc}04` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: ztc }} /><span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{z.name}</span></div>
                                <div style={{ fontSize: 10, color: theme.textDim }}>Type: <span style={{ color: ztc, fontWeight: 600 }}>{z.type}</span></div>
                                <div style={{ fontSize: 10, color: theme.textDim }}>{z.lat.toFixed(3)}, {z.lng.toFixed(3)} · {z.radius}m</div>
                                <a href="/map" style={{ fontSize: 9, color: theme.accent, textDecoration: 'none', marginTop: 6, display: 'inline-block' }}>🗺️ Map</a>
                            </div>; })}
                        {op.zones.length === 0 && <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No zones</div>}
                    </div>}

                    {!loading && tab === 'alerts' && <>{op.alertRules.length > 0 ? <div style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                        {op.alertRules.map(a => { const ac = a.severity === 'critical' ? '#ef4444' : a.severity === 'high' ? '#f97316' : '#f59e0b';
                            return <div key={a.id} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 10, opacity: a.enabled ? 1 : 0.4 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.enabled ? ac : theme.textDim }} />
                                <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{a.type}</div><div style={{ fontSize: 10, color: theme.textDim }}>{a.description}</div></div>
                                <span style={{ fontSize: 9, fontWeight: 700, color: ac, padding: '2px 6px', borderRadius: 3, background: `${ac}10` }}>{a.severity}</span>
                                <span style={{ fontSize: 9, color: a.enabled ? '#22c55e' : theme.textDim }}>{a.enabled ? 'ON' : 'OFF'}</span>
                            </div>; })}
                    </div> : <div style={{ padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No alerts configured</div>}</>}

                    {!loading && tab === 'timeline' && <div style={{ paddingLeft: 16 }}>
                        {op.timeline.map((e, i) => <div key={e.id} style={{ display: 'flex', gap: 14, position: 'relative' as const, paddingBottom: 18 }}>
                            {i < op.timeline.length - 1 && <div style={{ position: 'absolute' as const, left: 6, top: 16, bottom: -2, width: 2, background: `${e.color}30` }} />}
                            <div style={{ width: 14, height: 14, borderRadius: '50%', background: `${e.color}20`, border: `2px solid ${e.color}`, flexShrink: 0, marginTop: 2, zIndex: 1 }} />
                            <div><div style={{ fontSize: 10, fontWeight: 700, color: e.color, fontFamily: "'JetBrains Mono',monospace" }}>{e.date}</div><div style={{ fontSize: 12, color: theme.text, marginTop: 3 }}>{e.label}</div><span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${e.color}10`, color: e.color, fontWeight: 600 }}>{e.type}</span></div>
                        </div>)}
                        {op.timeline.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No timeline</div>}
                    </div>}

                    {!loading && tab === 'briefing' && <>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                            {[{ l: 'Comms', v: op.commsChannel }, { l: 'Frequency', v: op.commsFreq }].map(r => <div key={r.l} style={{ flex: 1, padding: '12px 14px', borderRadius: 8, border: `1px solid ${theme.border}` }}><div style={{ fontSize: 10, color: theme.textDim, marginBottom: 3 }}>{r.l}</div><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{r.v}</div></div>)}
                        </div>
                        <div style={{ padding: '14px 16px', borderRadius: 8, background: `${theme.border}08`, border: `1px solid ${theme.border}` }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, marginBottom: 8 }}>📝 Briefing Notes</div>
                            <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.7, whiteSpace: 'pre-wrap' as const }}>{op.briefingNotes}</div>
                        </div>
                    </>}
                </div>
            </div>

            {/* NEW OPERATION MODAL */}
            {showNewModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>🎯 New Operation</div>
                        <button onClick={() => setShowNewModal(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Codename *</div><input value={newForm.codename} onChange={e => setNewForm(f => ({ ...f, codename: e.target.value.toUpperCase() }))} placeholder="e.g. TEMPEST" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: '#ef4444', fontSize: 14, fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, outline: 'none', letterSpacing: '0.08em' }} /></div>
                        <div style={{ flex: 2 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Name *</div><input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Maritime Intercept" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                    </div>
                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Description</div><textarea value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} placeholder="Operation objectives..." rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const }} /></div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Phase</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>{allPhases.map(p => { const on = newForm.phase === p; return <button key={p} onClick={() => setNewForm(f => ({ ...f, phase: p }))} style={{ padding: '7px 2px', borderRadius: 5, border: `1px solid ${on ? phaseColors[p] + '40' : theme.border}`, background: on ? `${phaseColors[p]}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const }}><div style={{ fontSize: 14 }}>{phaseIcons[p]}</div><div style={{ fontSize: 7, fontWeight: on ? 700 : 500, color: on ? phaseColors[p] : theme.textDim }}>{p}</div></button>; })}</div></div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Priority</div><select value={newForm.priority} onChange={e => setNewForm(f => ({ ...f, priority: e.target.value as Priority }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Classification</div><select value={newForm.classification} onChange={e => setNewForm(f => ({ ...f, classification: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{['SECRET', 'TOP SECRET', 'TOP SECRET // NOFORN', 'TOP SECRET // EYES ONLY', 'CONFIDENTIAL'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    </div>
                    <div style={{ marginBottom: 18 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Commander</div><input value={newForm.commander} onChange={e => setNewForm(f => ({ ...f, commander: e.target.value }))} placeholder="e.g. Col. Tomić" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowNewModal(false)} style={{ flex: 1, padding: '11px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={() => { setShowNewModal(false); trigger(); }} disabled={!newForm.codename || !newForm.name} style={{ flex: 2, padding: '11px', borderRadius: 6, border: 'none', background: newForm.codename && newForm.name ? '#ef4444' : `${theme.border}30`, color: newForm.codename && newForm.name ? '#fff' : theme.textDim, fontSize: 13, fontWeight: 800, cursor: newForm.codename && newForm.name ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>🎯 Create Operation</button>
                    </div>
                </div>
            </div>}

            {/* Ctrl+Q */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="op-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

OperationsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default OperationsIndex;
