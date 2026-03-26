import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockPersons } from '../../mock/persons';
import { mockWorkflows, templates, statusColors, statusIcons, prioColors, triggerIcons, actionIcons, kanbanCols, allTriggerTypes, allActionTypes, keyboardShortcuts } from '../../mock/workflows';
import type { WfStatus, ViewTab, Workflow, TriggerType, ActionType } from '../../mock/workflows';

/* ═══ ARGUX — Workflows ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="wf-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }

function WorkflowsIndex() {
    const [view, setView] = useState<ViewTab>('kanban');
    const [selWf, setSelWf] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [opFilter, setOpFilter] = useState('all');
    const [detailTab, setDetailTab] = useState<'config' | 'log'>('config');
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newForm, setNewForm] = useState({ name: '', description: '', priority: 'Medium' as string, operation: 'OP HAWK', trigger: 'zone_entry' as TriggerType, action: 'alert' as ActionType, status: 'Draft' as WfStatus });
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

    const wf = selWf ? mockWorkflows.find(w => w.id === selWf) : null;
    const ops = [...new Set(mockWorkflows.map(w => w.operationName))];

    const filteredWfs = useMemo(() => mockWorkflows.filter(w => {
        if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.operationName.toLowerCase().includes(search.toLowerCase())) return false;
        if (opFilter !== 'all' && w.operationName !== opFilter) return false;
        return true;
    }), [search, opFilter]);

    const switchView = useCallback((v: ViewTab) => { setView(v); trigger(); }, [trigger]);
    const resetFilters = useCallback(() => { setSearch(''); setOpFilter('all'); trigger(); }, [trigger]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case '1': switchView('kanban'); break; case '2': switchView('list'); break; case '3': switchView('templates'); break;
                case 'n': case 'N': if (!e.ctrlKey && !e.metaKey) setShowNewModal(true); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 'Escape': setSelWf(null); setShowShortcuts(false); setShowNewModal(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [switchView, resetFilters]);

    const WfCard = ({ w }: { w: Workflow }) => {
        const sel = selWf === w.id; const sc = statusColors[w.status];
        return <div className="wf-card" onClick={() => { setSelWf(w.id); setDetailTab('config'); }} style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${sel ? sc + '50' : theme.border}`, background: sel ? `${sc}06` : theme.bgCard, cursor: 'pointer', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 3, background: `${prioColors[w.priority]}12`, color: prioColors[w.priority] }}>{w.priority}</span>
                <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: `${theme.accent}10`, color: theme.accent }}>{w.operationName}</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, color: theme.textDim }}>{w.execCount} runs</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 4, lineHeight: 1.3 }}>{w.name}</div>
            <div style={{ display: 'flex', gap: 3, marginBottom: 5, flexWrap: 'wrap' as const }}>
                {w.triggers.map(t => <span key={t.id} style={{ fontSize: 8, padding: '2px 5px', borderRadius: 3, background: `${theme.border}30`, color: theme.textDim }}>{t.icon} {t.type.replace('_', ' ')}</span>)}
                <span style={{ fontSize: 8, color: theme.textDim }}>→</span>
                {w.actions.slice(0, 2).map(a => <span key={a.id} style={{ fontSize: 8, padding: '2px 5px', borderRadius: 3, background: `${theme.border}30`, color: theme.textDim }}>{a.icon}</span>)}
                {w.actions.length > 2 && <span style={{ fontSize: 8, color: theme.textDim }}>+{w.actions.length - 2}</span>}
            </div>
            <div style={{ display: 'flex', gap: 5, fontSize: 9, color: theme.textDim }}>
                <span>👥 {w.linkedPersonNames.length}</span>
                {w.successRate > 0 && <span style={{ color: w.successRate >= 95 ? '#22c55e' : '#f59e0b' }}>{w.successRate}%</span>}
                {w.lastRun !== '—' && <span style={{ marginLeft: 'auto' }}>{w.lastRun.slice(5)}</span>}
            </div>
        </div>;
    };

    return (<>
        <PageMeta title="Workflows" />
        <div className="wf-page" data-testid="workflows-page">
            <div className="wf-main">
                {/* Mobile bar */}
                <div className="wf-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <button onClick={() => setShowNewModal(true)} style={{ padding: '7px 12px', borderRadius: 6, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ New</button>
                </div>

                {/* Header */}
                <div style={{ padding: '10px 18px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' as const }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#8b5cf610', border: '1px solid #8b5cf625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⚡</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>WORKFLOWS</div><div style={{ fontSize: 10, color: theme.textDim }}>Automated Surveillance Engine</div></div>
                    </div>
                    <div className="wf-header-stats" style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                        {kanbanCols.filter(c => mockWorkflows.some(w => w.status === c.status)).map(c => {
                            const count = mockWorkflows.filter(w => w.status === c.status).length;
                            return <span key={c.status} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, border: `1px solid ${statusColors[c.status]}25`, color: statusColors[c.status] }}>{statusIcons[c.status]} {count}</span>;
                        })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: '1 1 140px', minWidth: 100, maxWidth: 220 }}>
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '7px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="wf-kbd">F</span>
                    </div>
                    <select value={opFilter} onChange={e => { setOpFilter(e.target.value); trigger(); }} style={{ padding: '7px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}>
                        <option value="all">All Operations</option>{ops.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
                        {[{ id: 'kanban' as ViewTab, l: '▦ Kanban', k: '1' }, { id: 'list' as ViewTab, l: '☰ List', k: '2' }, { id: 'templates' as ViewTab, l: '📋 Templates', k: '3' }].map(v => <button key={v.id} onClick={() => switchView(v.id)} style={{ padding: '5px 10px', borderRadius: 5, border: `1px solid ${view === v.id ? '#8b5cf640' : theme.border}`, background: view === v.id ? '#8b5cf608' : 'transparent', color: view === v.id ? '#8b5cf6' : theme.textDim, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}><span className="wf-view-label">{v.l}</span><span className="wf-kbd">{v.k}</span></button>)}
                        <button onClick={() => setShowNewModal(true)} style={{ padding: '5px 12px', borderRadius: 5, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>+ New <span className="wf-kbd" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>N</span></button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: view === 'templates' ? 16 : 0 }}>
                    {loading && view === 'kanban' && <div className="wf-kanban">{kanbanCols.map(c => <div key={c.status} className="wf-kanban-col" style={{ borderRight: `1px solid ${theme.border}06` }}><div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}><Skel w="60%" h={14} /></div><div style={{ padding: 8 }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ marginBottom: 8 }}><Skel w="100%" h={90} /></div>)}</div></div>)}</div>}
                    {loading && view === 'list' && Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'center' }}><div style={{ flex: 3 }}><Skel w="70%" h={14} /><div style={{ height: 5 }} /><Skel w="50%" h={10} /></div><Skel w={60} h={14} /><Skel w={60} h={14} /><Skel w={40} h={14} /></div>)}
                    {loading && view === 'templates' && <div className="wf-tpl-grid">{Array.from({ length: 4 }).map((_, i) => <Skel key={i} w="100%" h={140} />)}</div>}

                    {!loading && view === 'kanban' && <div className="wf-kanban">
                        {kanbanCols.map(col => { const colWfs = filteredWfs.filter(w => w.status === col.status);
                            return <div key={col.status} className="wf-kanban-col" style={{ borderRight: `1px solid ${theme.border}06` }}>
                                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, position: 'sticky' as const, top: 0, background: theme.bg, zIndex: 1 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 3, background: statusColors[col.status] }} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{col.label}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace" }}>{colWfs.length}</span>
                                </div>
                                <div style={{ flex: 1, padding: 8, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                                    {colWfs.map(w => <WfCard key={w.id} w={w} />)}
                                    {colWfs.length === 0 && <div style={{ padding: 20, textAlign: 'center' as const, fontSize: 11, color: theme.textDim, opacity: 0.5 }}>Empty</div>}
                                </div>
                            </div>;
                        })}
                    </div>}

                    {!loading && view === 'list' && <div>
                        <div className="wf-list-head" style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', position: 'sticky' as const, top: 0, background: theme.bg, zIndex: 1 }}>
                            <span>Workflow</span><span>Status</span><span>Operation</span><span>Runs</span><span>Success</span><span>Last Run</span>
                        </div>
                        {filteredWfs.map(w => <div key={w.id} className="wf-list-row" onClick={() => { setSelWf(w.id); setDetailTab('config'); }} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', background: selWf === w.id ? `${statusColors[w.status]}04` : 'transparent', borderLeft: `3px solid ${selWf === w.id ? statusColors[w.status] : 'transparent'}` }}>
                            <div><div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{w.name}</div><div style={{ fontSize: 9, color: theme.textDim, marginTop: 2 }}>{w.triggers.length} triggers → {w.actions.length} actions · {w.linkedPersonNames.length} subjects</div></div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: statusColors[w.status] }}>{statusIcons[w.status]} {w.status}</span>
                            <span style={{ fontSize: 10, color: theme.accent }}>{w.operationName}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{w.execCount}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: w.successRate >= 95 ? '#22c55e' : w.successRate > 0 ? '#f59e0b' : theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{w.successRate > 0 ? `${w.successRate}%` : '—'}</span>
                            <span style={{ fontSize: 10, color: theme.textDim }}>{w.lastRun === '—' ? '—' : w.lastRun.slice(5)}</span>
                        </div>)}
                    </div>}

                    {!loading && view === 'templates' && <div className="wf-tpl-grid">
                        {templates.map(t => <div key={t.id} className="wf-card" style={{ padding: 16, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgCard, cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#8b5cf610', border: '1px solid #8b5cf625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{t.icon}</div>
                                <div><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{t.name}</div><div style={{ fontSize: 9, color: '#8b5cf6', fontWeight: 600 }}>{t.category}</div></div>
                            </div>
                            <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5, marginBottom: 10 }}>{t.description}</div>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' as const }}>
                                {t.triggers.map(tr => <span key={tr.id} style={{ fontSize: 9, padding: '3px 6px', borderRadius: 4, background: '#3b82f610', color: '#3b82f6', fontWeight: 600 }}>{tr.icon} {tr.label}</span>)}
                                <span style={{ fontSize: 10, color: theme.textDim }}>→</span>
                                {t.actions.map(a => <span key={a.id} style={{ fontSize: 9, padding: '3px 6px', borderRadius: 4, background: '#22c55e10', color: '#22c55e', fontWeight: 600 }}>{a.icon} {a.label}</span>)}
                            </div>
                            <button style={{ marginTop: 10, width: '100%', padding: '7px', borderRadius: 5, border: '1px solid #8b5cf630', background: '#8b5cf606', color: '#8b5cf6', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Use Template</button>
                        </div>)}
                    </div>}
                </div>
            </div>

            {/* RIGHT: Detail */}
            {wf && <div className="wf-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${statusColors[wf.status]}12`, border: `1px solid ${statusColors[wf.status]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{statusIcons[wf.status]}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{wf.name}</div><div style={{ fontSize: 9, color: theme.textDim, display: 'flex', gap: 5, marginTop: 2 }}><span style={{ color: statusColors[wf.status], fontWeight: 600 }}>{wf.status}</span><span style={{ color: theme.accent }}>{wf.operationName}</span></div></div>
                        <button onClick={() => setSelWf(null)} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ fontSize: 10, color: theme.textSecondary, lineHeight: 1.5 }}>{wf.description}</div>
                </div>
                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 5 }}>
                    {[{ n: wf.execCount, l: 'Runs', c: '#3b82f6' }, { n: `${wf.successRate}%`, l: 'Success', c: wf.successRate >= 95 ? '#22c55e' : '#f59e0b' }, { n: wf.triggers.length, l: 'Triggers', c: '#8b5cf6' }, { n: wf.actions.length, l: 'Actions', c: '#06b6d4' }].map((s, i) => <div key={i} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}><div style={{ fontSize: 15, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {[{ id: 'config' as const, l: '⚙️ Config' }, { id: 'log' as const, l: '📜 Exec Log' }].map(t => <button key={t.id} onClick={() => setDetailTab(t.id)} style={{ flex: 1, padding: '8px', border: 'none', borderBottom: `2px solid ${detailTab === t.id ? '#8b5cf6' : 'transparent'}`, background: 'transparent', color: detailTab === t.id ? theme.text : theme.textDim, fontSize: 11, fontWeight: detailTab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{t.l}</button>)}
                </div>

                {detailTab === 'config' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' as const, marginBottom: 5 }}>⚡ Triggers ({wf.triggers.length})</div>
                        {wf.triggers.map(t => <div key={t.id} style={{ padding: '8px 10px', marginBottom: 4, borderRadius: 6, border: '1px solid #3b82f615', background: '#3b82f604' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, display: 'flex', alignItems: 'center', gap: 5 }}><span>{t.icon}</span>{t.label}</div>
                            <div style={{ fontSize: 9, color: theme.textDim, marginTop: 3 }}>{t.config}</div>
                        </div>)}
                    </div>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' as const, marginBottom: 5 }}>🎯 Actions ({wf.actions.length})</div>
                        {wf.actions.map((a, i) => <div key={a.id} style={{ padding: '8px 10px', marginBottom: 4, borderRadius: 6, border: '1px solid #22c55e15', background: '#22c55e04', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#22c55e15', border: '1px solid #22c55e30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#22c55e', fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                            <div><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{a.icon} {a.label}</div><div style={{ fontSize: 9, color: theme.textDim, marginTop: 2 }}>{a.config}</div></div>
                        </div>)}
                    </div>
                    {wf.linkedPersonNames.length > 0 && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>👥 Subjects ({wf.linkedPersonNames.length})</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>{wf.linkedPersonIds.map((id, i) => <a key={id} href={`/persons/${id}`} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, border: `1px solid ${theme.accent}20`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>🧑 {wf.linkedPersonNames[i]}</a>)}</div>
                    </div>}
                    <div style={{ padding: '10px 14px' }}>
                        {[{ l: 'Operation', v: wf.operationName }, { l: 'Created', v: `${wf.createdAt} by ${wf.createdBy}` }, { l: 'Updated', v: wf.updatedAt }, { l: 'Last run', v: wf.lastRun }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}><span style={{ fontSize: 10, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 10, color: theme.text }}>{r.v}</span></div>)}
                    </div>
                </div>}

                {detailTab === 'log' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {wf.execLog.length === 0 && <div style={{ padding: 30, textAlign: 'center' as const, color: theme.textDim, fontSize: 12 }}>No executions yet</div>}
                    {wf.execLog.map(e => { const ec = e.status === 'success' ? '#22c55e' : e.status === 'failed' ? '#ef4444' : '#f59e0b';
                        return <div key={e.id} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}06` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ec, boxShadow: e.status === 'running' ? `0 0 4px ${ec}` : 'none' }} />
                                <span style={{ fontSize: 10, fontWeight: 700, color: ec, textTransform: 'uppercase' as const }}>{e.status}</span>
                                <span style={{ fontSize: 9, color: theme.textDim, marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace" }}>{e.duration}</span>
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: theme.text, marginBottom: 3 }}>{e.triggeredBy}</div>
                            <div style={{ fontSize: 9, color: theme.textSecondary, lineHeight: 1.4 }}>{e.output}</div>
                            <div style={{ fontSize: 9, color: theme.textDim, marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>{e.ts}</div>
                        </div>;
                    })}
                </div>}
            </div>}

            {/* ═══ NEW WORKFLOW MODAL ═══ */}
            {showNewModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>⚡ New Workflow</div>
                        <button onClick={() => setShowNewModal(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Workflow Name *</div><input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Port Terminal Intrusion" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Description</div><textarea value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the workflow purpose..." rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const }} /></div>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Priority</div><select value={newForm.priority} onChange={e => setNewForm(f => ({ ...f, priority: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Status</div><select value={newForm.status} onChange={e => setNewForm(f => ({ ...f, status: e.target.value as WfStatus }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{kanbanCols.map(c => <option key={c.status} value={c.status}>{statusIcons[c.status]} {c.label}</option>)}</select></div>
                    </div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Operation</div><select value={newForm.operation} onChange={e => setNewForm(f => ({ ...f, operation: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{ops.map(o => <option key={o} value={o}>{o}</option>)}</select></div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 5 }}>⚡ Trigger Type</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                        {allTriggerTypes.map(t => { const on = newForm.trigger === t.type; return <button key={t.type} onClick={() => setNewForm(f => ({ ...f, trigger: t.type }))} style={{ padding: '8px 4px', borderRadius: 6, border: `1px solid ${on ? '#3b82f640' : theme.border}`, background: on ? '#3b82f608' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const }}><div style={{ fontSize: 16 }}>{triggerIcons[t.type]}</div><div style={{ fontSize: 8, fontWeight: on ? 700 : 500, color: on ? '#3b82f6' : theme.textDim, marginTop: 2 }}>{t.label}</div></button>; })}
                    </div></div>

                    <div style={{ marginBottom: 18 }}><div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', marginBottom: 5 }}>🎯 Action Type</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                        {allActionTypes.map(a => { const on = newForm.action === a.type; return <button key={a.type} onClick={() => setNewForm(f => ({ ...f, action: a.type }))} style={{ padding: '8px 4px', borderRadius: 6, border: `1px solid ${on ? '#22c55e40' : theme.border}`, background: on ? '#22c55e08' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const }}><div style={{ fontSize: 16 }}>{actionIcons[a.type]}</div><div style={{ fontSize: 8, fontWeight: on ? 700 : 500, color: on ? '#22c55e' : theme.textDim, marginTop: 2 }}>{a.label}</div></button>; })}
                    </div></div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowNewModal(false)} style={{ flex: 1, padding: '11px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={() => { setShowNewModal(false); trigger(); }} disabled={!newForm.name} style={{ flex: 2, padding: '11px', borderRadius: 6, border: 'none', background: newForm.name ? '#8b5cf6' : `${theme.border}30`, color: newForm.name ? '#fff' : theme.textDim, fontSize: 13, fontWeight: 800, cursor: newForm.name ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>⚡ Create Workflow</button>
                    </div>
                </div>
            </div>}

            {/* Ctrl+Q */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="wf-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

WorkflowsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default WorkflowsIndex;
