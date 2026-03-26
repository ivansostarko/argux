import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockRules, mockAlertEvents, triggerConfig, sevColors, allOps, allPersons, keyboardShortcuts } from '../../mock/alerts';
import type { TriggerType, Severity, Channel, ViewTab, AlertRule } from '../../mock/alerts';

/* ═══ ARGUX — Alert Rules ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="alt-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }
function SkeletonRows({ count = 6 }: { count?: number }) { return <>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'center' }}><Skel w={34} h={34} /><div style={{ flex: 1 }}><Skel w="60%" h={14} /><div style={{ height: 6 }} /><Skel w="40%" h={10} /></div><Skel w={45} h={20} /></div>)}</>; }

function AlertsIndex() {
    const [tab, setTab] = useState<ViewTab>('rules');
    const [search, setSearch] = useState('');
    const [triggerF, setTriggerF] = useState<TriggerType | 'all'>('all');
    const [sevF, setSevF] = useState<Severity | 'all'>('all');
    const [opF, setOpF] = useState('all');
    const [personF, setPersonF] = useState('all');
    const [enabledF, setEnabledF] = useState<'all' | 'enabled' | 'disabled'>('all');
    const [selRule, setSelRule] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newForm, setNewForm] = useState({ name: '', triggerType: 'zone_entry' as TriggerType, severity: 'Warning' as Severity, channels: ['In-App'] as Channel[], cooldown: 15, operationCode: 'HAWK' });
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

    const rule = selRule ? mockRules.find(r => r.id === selRule) : null;
    const triggerCounts = Object.fromEntries((Object.keys(triggerConfig) as TriggerType[]).map(t => [t, mockRules.filter(r => r.triggerType === t).length]));

    const filtered = useMemo(() => mockRules.filter(r => {
        if (triggerF !== 'all' && r.triggerType !== triggerF) return false;
        if (sevF !== 'all' && r.severity !== sevF) return false;
        if (opF !== 'all' && r.operationCode !== opF) return false;
        if (personF !== 'all' && !r.targetPersonNames.includes(personF)) return false;
        if (enabledF === 'enabled' && !r.enabled) return false;
        if (enabledF === 'disabled' && r.enabled) return false;
        if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [triggerF, sevF, opF, personF, enabledF, search]);

    const stats = { total: mockRules.length, enabled: mockRules.filter(r => r.enabled).length, critical: mockRules.filter(r => r.severity === 'Critical').length, totalFired: mockRules.reduce((s, r) => s + r.firedCount, 0), unack: mockAlertEvents.filter(e => !e.acknowledged).length };

    const tabList: ViewTab[] = ['rules', 'feed', 'stats'];
    const switchTab = useCallback((t: ViewTab) => { setTab(t); trigger(); }, [trigger]);
    const resetFilters = useCallback(() => { setSearch(''); setTriggerF('all'); setSevF('all'); setOpF('all'); setPersonF('all'); setEnabledF('all'); trigger(); }, [trigger]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case '1': switchTab('rules'); break; case '2': switchTab('feed'); break; case '3': switchTab('stats'); break;
                case 'n': case 'N': if (!e.ctrlKey && !e.metaKey) setShowNewModal(true); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 'Escape': setSelRule(null); setShowShortcuts(false); setShowNewModal(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [switchTab, resetFilters]);

    const toggleChannel = (ch: Channel) => setNewForm(f => ({ ...f, channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch] }));

    return (<>
        <PageMeta title="Alert Rules" />
        <div className="alt-page" data-testid="alerts-page">

            {/* LEFT SIDEBAR */}
            <div className="alt-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ef444410', border: '1px solid #ef444425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🚨</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>ALERTS</div><div style={{ fontSize: 10, color: theme.textDim }}>Alert Engine</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="alt-kbd">F</span>
                    </div>
                </div>

                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ n: stats.total, l: 'Rules', c: theme.accent }, { n: stats.enabled, l: 'Active', c: '#22c55e' }, { n: stats.unack, l: 'Unack', c: '#ef4444' }, { n: stats.totalFired, l: 'Fired', c: '#f59e0b' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}><div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Trigger Type</div>
                    <button onClick={() => { setTriggerF('all'); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: triggerF === 'all' ? `${theme.accent}08` : 'transparent', color: triggerF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, borderLeft: `2px solid ${triggerF === 'all' ? theme.accent : 'transparent'}`, textAlign: 'left' as const, fontWeight: triggerF === 'all' ? 700 : 500, marginBottom: 1 }}>All ({mockRules.length})</button>
                    {(Object.keys(triggerConfig) as TriggerType[]).map(t => { const tc = triggerConfig[t]; const c = triggerCounts[t]; if (c === 0) return null; return <button key={t} onClick={() => { setTriggerF(t); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: triggerF === t ? `${tc.color}08` : 'transparent', color: triggerF === t ? tc.color : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, borderLeft: `2px solid ${triggerF === t ? tc.color : 'transparent'}`, textAlign: 'left' as const, fontWeight: triggerF === t ? 600 : 400, marginBottom: 1 }}><span style={{ fontSize: 13 }}>{tc.icon}</span><span style={{ flex: 1 }}>{tc.label}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Severity</div><div style={{ display: 'flex', gap: 3 }}>
                        {(['all', 'Critical', 'Warning', 'Informational'] as const).map(s => <button key={s} onClick={() => { setSevF(s as any); trigger(); }} style={{ flex: 1, padding: '4px', borderRadius: 4, border: `1px solid ${sevF === s ? (s === 'all' ? theme.accent : sevColors[s as Severity]) + '40' : theme.border}`, background: sevF === s ? `${s === 'all' ? theme.accent : sevColors[s as Severity]}08` : 'transparent', color: sevF === s ? (s === 'all' ? theme.accent : sevColors[s as Severity]) : theme.textDim, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{s === 'all' ? 'All' : s === 'Informational' ? 'Info' : s}</button>)}
                    </div></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Operation</div><select value={opF} onChange={e => { setOpF(e.target.value); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Operations</option>{allOps.map(o => <option key={o} value={o}>OP {o}</option>)}</select></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Person</div><select value={personF} onChange={e => { setPersonF(e.target.value); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Persons</option>{allPersons.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Status</div><div style={{ display: 'flex', gap: 3 }}>{(['all', 'enabled', 'disabled'] as const).map(s => <button key={s} onClick={() => { setEnabledF(s); trigger(); }} style={{ flex: 1, padding: '4px', borderRadius: 4, border: `1px solid ${enabledF === s ? theme.accent + '40' : theme.border}`, background: enabledF === s ? `${theme.accent}08` : 'transparent', color: enabledF === s ? theme.accent : theme.textDim, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' as const }}>{s}</button>)}</div></div>
                </div>

                <div style={{ padding: '10px 14px' }}>
                    <button onClick={resetFilters} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset Filters <span className="alt-kbd" style={{ marginLeft: 4 }}>R</span></button>
                </div>
            </div>

            {/* CENTER */}
            <div className="alt-center">
                {/* Mobile bar */}
                <div className="alt-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <button onClick={() => setShowNewModal(true)} style={{ padding: '7px 12px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>+ New</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
                    {[{ id: 'rules' as ViewTab, l: 'Rules', icon: '📋', n: filtered.length }, { id: 'feed' as ViewTab, l: 'Live Feed', icon: '🔴', n: stats.unack }, { id: 'stats' as ViewTab, l: 'Statistics', icon: '📊' }].map((t, idx) => <button key={t.id} onClick={() => switchTab(t.id)} style={{ padding: '10px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#ef4444' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' as const }}>
                        <span>{t.icon}</span><span className="alt-tab-label">{t.l}</span>
                        {t.n !== undefined && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: `${tab === t.id ? '#ef4444' : theme.border}20`, color: tab === t.id ? '#ef4444' : theme.textDim }}>{t.n}</span>}
                        <span className="alt-kbd" style={{ marginLeft: 2 }}>{idx + 1}</span>
                    </button>)}
                    <div style={{ flex: 1 }} />
                    <button onClick={() => setShowNewModal(true)} style={{ margin: '6px 12px', padding: '5px 14px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>+ New Alert <span className="alt-kbd" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>N</span></button>
                </div>

                <div className="alt-scroll">
                    {loading && <SkeletonRows count={8} />}

                    {/* RULES */}
                    {!loading && tab === 'rules' && <>
                        {filtered.length === 0 && <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.2 }}>🚨</div><div style={{ fontSize: 15, fontWeight: 700, color: theme.textSecondary, marginTop: 6 }}>No rules match</div><button onClick={resetFilters} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button></div>}
                        {filtered.map(r => {
                            const tc = triggerConfig[r.triggerType]; const sc = sevColors[r.severity]; const sel = selRule === r.id;
                            return <div key={r.id} className="alt-row" onClick={() => setSelRule(r.id)} style={{ padding: '12px 18px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: sel ? `${tc.color}04` : 'transparent', borderLeft: `3px solid ${sel ? tc.color : 'transparent'}`, opacity: r.enabled ? 1 : 0.5 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${tc.color}12`, border: `1px solid ${tc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{tc.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{r.name}</span>
                                        {!r.enabled && <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${theme.border}30`, color: theme.textDim }}>DISABLED</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${sc}12`, color: sc, fontWeight: 600 }}>{r.severity}</span>
                                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${theme.accent}10`, color: theme.accent }}>{r.operationCode}</span>
                                        {r.channels.map(c => <span key={c} style={{ fontSize: 8, padding: '2px 5px', borderRadius: 3, background: `${theme.border}20`, color: theme.textDim }}>{c}</span>)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                                    {r.targetPersonNames.length > 0 && <div style={{ fontSize: 10, color: theme.textDim }}>{r.targetPersonNames.length > 2 ? `${r.targetPersonNames.slice(0, 2).join(', ')} +${r.targetPersonNames.length - 2}` : r.targetPersonNames.join(', ')}</div>}
                                </div>
                                <div style={{ textAlign: 'center' as const, flexShrink: 0, width: 48 }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: r.firedCount > 20 ? '#f59e0b' : theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{r.firedCount}</div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>fired</div>
                                </div>
                            </div>;
                        })}
                    </>}

                    {/* LIVE FEED */}
                    {!loading && tab === 'feed' && <>
                        {mockAlertEvents.map(e => {
                            const tc = triggerConfig[e.triggerType]; const sc = sevColors[e.severity];
                            return <div key={e.id} style={{ padding: '12px 18px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'flex-start', background: !e.acknowledged ? `${sc}04` : 'transparent', borderLeft: `3px solid ${!e.acknowledged ? sc : 'transparent'}` }}>
                                <div style={{ width: 32, height: 32, borderRadius: 7, background: `${tc.color}12`, border: `1px solid ${tc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{tc.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 3 }}>{e.title}</div>
                                    <div style={{ display: 'flex', gap: 6, fontSize: 10, color: theme.textDim, flexWrap: 'wrap' as const }}>
                                        {e.personName && <span style={{ color: theme.accent }}>🧑 {e.personName}</span>}
                                        <span>📍 {e.location}</span><span>· {e.ruleName}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${sc}12`, color: sc }}>{e.severity}</span>
                                    <div style={{ fontSize: 10, color: theme.textDim, marginTop: 3 }}>{e.timeAgo}</div>
                                    {!e.acknowledged && <div style={{ fontSize: 8, fontWeight: 800, color: '#ef4444', marginTop: 2 }}>● NEW</div>}
                                </div>
                            </div>;
                        })}
                    </>}

                    {/* STATISTICS */}
                    {!loading && tab === 'stats' && <div style={{ padding: 18, display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
                        <div><div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Alerts by Trigger Type</div>
                        <div className="alt-stat-grid" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                            {(Object.keys(triggerConfig) as TriggerType[]).map(t => { const tc = triggerConfig[t]; const count = mockRules.filter(r => r.triggerType === t).length; const fired = mockRules.filter(r => r.triggerType === t).reduce((s, r) => s + r.firedCount, 0);
                                return <div key={t} style={{ flex: '1 1 120px', minWidth: 120, padding: 12, borderRadius: 8, border: `1px solid ${tc.color}15`, background: `${tc.color}04` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><span style={{ fontSize: 16 }}>{tc.icon}</span><span style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{tc.label}</span></div>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <div><div style={{ fontSize: 18, fontWeight: 800, color: tc.color, fontFamily: "'JetBrains Mono',monospace" }}>{count}</div><div style={{ fontSize: 8, color: theme.textDim }}>rules</div></div>
                                        <div><div style={{ fontSize: 18, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{fired}</div><div style={{ fontSize: 8, color: theme.textDim }}>fired</div></div>
                                    </div>
                                </div>;
                            })}
                        </div></div>

                        <div><div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Coverage by Person</div>
                        <div style={{ borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            {allPersons.map(p => { const rules = mockRules.filter(r => r.targetPersonNames.includes(p)); const fired = rules.reduce((s, r) => s + r.firedCount, 0);
                                return <div key={p} style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: theme.text, flex: 1 }}>{p}</span>
                                    <span style={{ fontSize: 10, color: theme.textDim }}>{rules.length} rules</span>
                                    <div style={{ width: 60, height: 5, borderRadius: 3, background: `${theme.border}20`, overflow: 'hidden' }}><div style={{ width: `${Math.min(100, (fired / 50) * 100)}%`, height: '100%', background: fired > 20 ? '#ef4444' : '#f59e0b' }} /></div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: fired > 20 ? '#ef4444' : theme.textDim, fontFamily: "'JetBrains Mono',monospace", width: 28, textAlign: 'right' as const }}>{fired}</span>
                                </div>;
                            })}
                        </div></div>

                        <div><div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>By Operation</div>
                        <div style={{ display: 'flex', gap: 10 }}>{allOps.map(op => { const rules = mockRules.filter(r => r.operationCode === op); const fired = rules.reduce((s, r) => s + r.firedCount, 0);
                            return <div key={op} style={{ flex: 1, padding: 14, borderRadius: 8, border: `1px solid ${theme.border}` }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, marginBottom: 6 }}>OP {op}</div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <div><div style={{ fontSize: 22, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{rules.length}</div><div style={{ fontSize: 9, color: theme.textDim }}>rules</div></div>
                                    <div><div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{fired}</div><div style={{ fontSize: 9, color: theme.textDim }}>fired</div></div>
                                </div>
                            </div>;
                        })}</div></div>
                    </div>}
                </div>
            </div>

            {/* RIGHT: Detail */}
            {rule && <div className="alt-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 7, background: `${triggerConfig[rule.triggerType].color}12`, border: `1px solid ${triggerConfig[rule.triggerType].color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{triggerConfig[rule.triggerType].icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{rule.name}</div><div style={{ fontSize: 10, color: theme.textDim }}>{triggerConfig[rule.triggerType].label} · {rule.operationCode}</div></div>
                        <button onClick={() => setSelRule(null)} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${sevColors[rule.severity]}12`, color: sevColors[rule.severity] }}>{rule.severity}</span>
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: rule.enabled ? '#22c55e12' : `${theme.border}20`, color: rule.enabled ? '#22c55e' : theme.textDim }}>{rule.enabled ? '● Enabled' : '○ Disabled'}</span>
                    </div>
                </div>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>{rule.description}</div>
                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 6 }}>
                    {[{ n: rule.firedCount, l: 'Fired', c: '#f59e0b' }, { n: rule.cooldown + 'm', l: 'Cooldown', c: theme.textDim }].map((s, i) => <div key={i} style={{ flex: 1, textAlign: 'center' as const }}><div style={{ fontSize: 18, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>⚙️ Configuration</div>
                    {Object.entries(rule.config).map(([k, v]) => <div key={k} style={{ padding: '4px 8px', marginBottom: 3, borderRadius: 4, background: `${theme.border}10`, border: `1px solid ${theme.border}08` }}><div style={{ fontSize: 9, color: theme.textDim }}>{k}</div><div style={{ fontSize: 11, fontWeight: 600, color: theme.text }}>{v}</div></div>)}
                </div>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>📡 Channels</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>{rule.channels.map(c => <span key={c} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: `${theme.accent}08`, color: theme.accent, fontWeight: 600 }}>{c === 'In-App' ? '🔔' : c === 'Email' ? '📧' : c === 'SMS' ? '💬' : '🔗'} {c}</span>)}</div>
                </div>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>🎯 Targets</div>
                    {rule.targetPersonNames.length > 0 && <div style={{ marginBottom: 4 }}>{rule.targetPersonIds.map((id, i) => <a key={id} href={`/persons/${id}`} style={{ display: 'inline-block', fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#ec489908', color: '#ec4899', textDecoration: 'none', fontWeight: 600, marginRight: 4, marginBottom: 3 }}>🧑 {rule.targetPersonNames[i]}</a>)}</div>}
                    {rule.targetOrgNames.length > 0 && <div>{rule.targetOrgIds.map((id, i) => <a key={id} href={`/organizations/${id}`} style={{ display: 'inline-block', fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#8b5cf608', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600, marginRight: 4 }}>🏢 {rule.targetOrgNames[i]}</a>)}</div>}
                </div>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    {[{ l: 'Last Fired', v: rule.lastFired }, { l: 'Created', v: `${rule.createdAt} by ${rule.createdBy}` }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ fontSize: 10, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 10, color: theme.text }}>{r.v}</span></div>)}
                </div>
                <div style={{ padding: '10px 14px', marginTop: 'auto', display: 'flex', gap: 4 }}>
                    <button style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${rule.enabled ? '#f59e0b30' : '#22c55e30'}`, background: rule.enabled ? '#f59e0b06' : '#22c55e06', color: rule.enabled ? '#f59e0b' : '#22c55e', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{rule.enabled ? '⏸ Disable' : '▶ Enable'}</button>
                    <a href="/operations" style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none', fontSize: 11, fontWeight: 600, textAlign: 'center' as const }}>🎯 Op</a>
                </div>
            </div>}

            {/* ═══ NEW ALERT MODAL ═══ */}
            {showNewModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>🚨 New Alert Rule</div>
                        <button onClick={() => setShowNewModal(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Rule Name *</div><input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Horvat Zone Entry Alert" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Trigger Type *</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                        {(Object.keys(triggerConfig) as TriggerType[]).map(t => { const tc = triggerConfig[t]; const on = newForm.triggerType === t; return <button key={t} onClick={() => setNewForm(f => ({ ...f, triggerType: t }))} style={{ padding: '8px 6px', borderRadius: 6, border: `1px solid ${on ? tc.color + '40' : theme.border}`, background: on ? `${tc.color}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const }}><div style={{ fontSize: 16 }}>{tc.icon}</div><div style={{ fontSize: 10, fontWeight: on ? 700 : 500, color: on ? tc.color : theme.textDim, marginTop: 2 }}>{tc.label}</div></button>; })}
                    </div></div>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Severity *</div><select value={newForm.severity} onChange={e => setNewForm(f => ({ ...f, severity: e.target.value as Severity }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{(['Critical', 'Warning', 'Informational'] as const).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Cooldown (min)</div><input type="number" value={newForm.cooldown} onChange={e => setNewForm(f => ({ ...f, cooldown: parseInt(e.target.value) || 0 }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                    </div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Notification Channels</div><div style={{ display: 'flex', gap: 6 }}>
                        {(['In-App', 'Email', 'SMS', 'Webhook'] as Channel[]).map(ch => { const on = newForm.channels.includes(ch); return <button key={ch} onClick={() => toggleChannel(ch)} style={{ padding: '6px 12px', borderRadius: 5, border: `1px solid ${on ? theme.accent + '40' : theme.border}`, background: on ? `${theme.accent}08` : 'transparent', color: on ? theme.accent : theme.textDim, fontSize: 11, fontWeight: on ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{ch === 'In-App' ? '🔔' : ch === 'Email' ? '📧' : ch === 'SMS' ? '💬' : '🔗'} {ch}</button>; })}
                    </div></div>

                    <div style={{ marginBottom: 18 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Operation</div><select value={newForm.operationCode} onChange={e => setNewForm(f => ({ ...f, operationCode: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{allOps.map(o => <option key={o} value={o}>OP {o}</option>)}</select></div>

                    <div style={{ padding: '12px', borderRadius: 8, background: `${theme.border}06`, border: `1px solid ${theme.border}`, marginBottom: 18 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, marginBottom: 6 }}>Dynamic Configuration Fields</div>
                        <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>
                            {triggerConfig[newForm.triggerType].fields.map(f => <div key={f} style={{ padding: '6px 10px', marginBottom: 3, borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput }}>
                                <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 2 }}>{f}</div>
                                <input placeholder={`Enter ${f.toLowerCase()}...`} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: theme.text, fontSize: 12, fontFamily: 'inherit', padding: 0 }} />
                            </div>)}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowNewModal(false)} style={{ flex: 1, padding: '11px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={() => { setShowNewModal(false); trigger(); }} disabled={!newForm.name} style={{ flex: 2, padding: '11px', borderRadius: 6, border: 'none', background: newForm.name ? '#ef4444' : `${theme.border}30`, color: newForm.name ? '#fff' : theme.textDim, fontSize: 13, fontWeight: 800, cursor: newForm.name ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>🚨 Create Alert Rule</button>
                    </div>
                </div>
            </div>}

            {/* Ctrl+Q Modal */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div>
                        <button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="alt-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

AlertsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default AlertsIndex;
