import PageMeta from '../../components/layout/PageMeta';
import AdminLayout from '../../layouts/AdminLayout';
import { useState, useEffect, useCallback } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { useToast } from '../../components/ui/Toast';
import { kpiCards, services, quickActions, recentEvents, storageBreakdown, statusColors, keyboardShortcuts } from '../../mock/admin-dashboard';

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="adm-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [confirmAction, setConfirmAction] = useState<string | null>(null);
    const { trigger } = useTopLoader();
    const toast = useToast();

    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

    const handleAction = useCallback((id: string) => {
        const action = quickActions.find(a => a.id === id);
        if (!action) return;
        if (action.confirmText && confirmAction !== id) { setConfirmAction(id); return; }
        setConfirmAction(null); trigger();
        toast.success(`${action.label}`, `${action.description} — initiated.`);
    }, [confirmAction, trigger, toast]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) { setLoading(true); trigger(); setTimeout(() => setLoading(false), 700); } break;
                case 'Escape': setShowShortcuts(false); setConfirmAction(null); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [trigger]);

    const totalStorage = 8000000000000;
    const usedStorage = storageBreakdown.reduce((s, b) => s + b.bytes, 0);
    const usedPct = (usedStorage / totalStorage * 100).toFixed(1);

    return (<><PageMeta title="Admin Dashboard" /><div data-testid="admin-dashboard-page">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📊</div>
                <div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Admin Dashboard</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>System overview · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => { setLoading(true); trigger(); setTimeout(() => setLoading(false), 700); }} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>🔄 Refresh</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px', borderRadius: 6, background: '#22c55e10', border: '1px solid #22c55e25' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'argux-pulse 2s ease-in-out infinite' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>SYSTEMS ONLINE</span>
                </div>
            </div>
        </div>

        {/* KPI Cards */}
        <div className="adm-kpi-grid">
            {loading ? Array.from({ length: 8 }).map((_, i) => <Skel key={i} w="100%" h={90} />) :
            kpiCards.map(k => (
                <div key={k.id} className="adm-kpi" style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgCard, transition: 'border-color 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{k.label}</span>
                        <span style={{ fontSize: 16 }}>{k.icon}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: k.color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{k.value}{k.unit && <span style={{ fontSize: 11, fontWeight: 500, color: theme.textDim, marginLeft: 3 }}>{k.unit}</span>}</div>
                            <div style={{ fontSize: 10, color: k.trend === 'up' ? '#22c55e' : k.trend === 'down' ? '#3b82f6' : theme.textDim, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <span>{k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→'}</span>{k.trendValue}
                            </div>
                        </div>
                        <svg width="60" height="24" viewBox="0 0 60 24" style={{ flexShrink: 0, opacity: 0.5 }}>
                            {k.sparkline.map((v, i, arr) => { const min = Math.min(...arr), max = Math.max(...arr), range = max - min || 1; const x = (i / (arr.length - 1)) * 56 + 2; const y = 22 - ((v - min) / range) * 20; if (i === 0) return null; const px = ((i - 1) / (arr.length - 1)) * 56 + 2; const py = 22 - ((arr[i - 1] - min) / range) * 20; return <line key={i} x1={px} y1={py} x2={x} y2={y} stroke={k.color} strokeWidth="1.5" strokeLinecap="round" />; })}
                        </svg>
                    </div>
                </div>
            ))}
        </div>

        {/* Body */}
        <div className="adm-body">
            <div>
                {/* Services */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        🏥 Service Health
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#22c55e', padding: '2px 8px', borderRadius: 4, background: '#22c55e10', border: '1px solid #22c55e25' }}>{services.filter(s => s.status === 'healthy').length}/{services.length} healthy</span>
                        {services.some(s => s.status === 'degraded') && <span style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b', padding: '2px 8px', borderRadius: 4, background: '#f59e0b10', border: '1px solid #f59e0b25' }}>{services.filter(s => s.status === 'degraded').length} degraded</span>}
                    </div>
                    {loading ? <div className="adm-services-grid">{Array.from({ length: 6 }).map((_, i) => <Skel key={i} w="100%" h={70} />)}</div> :
                    <div className="adm-services-grid">
                        {services.map(s => { const sc = statusColors[s.status];
                            return <div key={s.id} style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${s.status !== 'healthy' ? sc + '30' : theme.border}`, background: s.status !== 'healthy' ? `${sc}04` : theme.bgCard }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontSize: 14 }}>{s.icon}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{s.name}</div><div style={{ fontSize: 9, color: theme.textDim }}>{s.description}</div></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: sc }} /><span style={{ fontSize: 9, fontWeight: 700, color: sc, textTransform: 'uppercase' as const }}>{s.status}</span></div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: theme.textDim }}>
                                    <span>⏱ {s.latency}</span><span>↑ {s.uptime}</span>
                                    {s.cpu > 0 && <span style={{ color: s.cpu > 80 ? '#f59e0b' : theme.textDim }}>CPU {s.cpu}%</span>}
                                    {s.memory > 0 && <span style={{ color: s.memory > 80 ? '#f59e0b' : theme.textDim }}>MEM {s.memory}%</span>}
                                </div>
                            </div>;
                        })}
                    </div>}
                </div>

                {/* Quick Actions */}
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>⚡ Quick Actions</div>
                    {loading ? <div className="adm-actions-grid">{Array.from({ length: 4 }).map((_, i) => <Skel key={i} w="100%" h={60} />)}</div> :
                    <div className="adm-actions-grid">
                        {quickActions.map(a => (
                            <button key={a.id} className="adm-action" onClick={() => handleAction(a.id)} style={{ padding: '12px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bgCard, cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'inherit', transition: 'all 0.15s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><span style={{ fontSize: 16 }}>{a.icon}</span><span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{a.label}</span></div>
                                <div style={{ fontSize: 10, color: theme.textDim, lineHeight: 1.4 }}>{a.description}</div>
                            </button>
                        ))}
                    </div>}
                </div>
            </div>

            {/* Right column */}
            <div>
                {/* Activity */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>📋 Recent Activity</div>
                    {loading ? <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>{Array.from({ length: 6 }).map((_, i) => <Skel key={i} w="100%" h={48} />)}</div> :
                    <div style={{ borderRadius: 10, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                        {recentEvents.map((ev, i) => (
                            <div key={ev.id} style={{ padding: '10px 12px', borderBottom: i < recentEvents.length - 1 ? `1px solid ${theme.border}06` : 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${ev.color}10`, border: `1px solid ${ev.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{ev.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 600, color: theme.text }}>{ev.title}</div><div style={{ fontSize: 10, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{ev.description}</div></div>
                                <span style={{ fontSize: 9, color: theme.textDim, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{ev.time}</span>
                            </div>
                        ))}
                    </div>}
                </div>

                {/* Storage */}
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>💾 Storage — {usedPct}% used</div>
                    {loading ? <Skel w="100%" h={120} /> :
                    <div style={{ borderRadius: 10, border: `1px solid ${theme.border}`, padding: 14 }}>
                        <div style={{ height: 10, borderRadius: 5, background: `${theme.border}20`, overflow: 'hidden', display: 'flex', marginBottom: 12 }}>
                            {storageBreakdown.map(b => <div key={b.label} style={{ width: `${b.bytes / totalStorage * 100}%`, height: '100%', background: b.color }} title={`${b.label}: ${b.size}`} />)}
                        </div>
                        {storageBreakdown.map(b => (
                            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                                <span style={{ fontSize: 12 }}>{b.icon}</span><div style={{ width: 6, height: 6, borderRadius: 2, background: b.color, flexShrink: 0 }} />
                                <span style={{ fontSize: 11, color: theme.textSecondary, flex: 1 }}>{b.label}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{b.size}</span>
                            </div>
                        ))}
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                            <span style={{ color: theme.textDim }}>Total capacity</span>
                            <span style={{ fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>2.4 TB / 8.0 TB</span>
                        </div>
                    </div>}
                </div>
            </div>
        </div>

        {/* Ctrl+Q */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="adm-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
            </div>
        </div>}

        {/* Confirm Modal */}
        {confirmAction && (() => { const a = quickActions.find(x => x.id === confirmAction); if (!a?.confirmText) return null;
            return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setConfirmAction(null)}>
                <div onClick={e => e.stopPropagation()} style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ fontSize: 28, textAlign: 'center' as const, marginBottom: 12 }}>{a.icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, textAlign: 'center' as const, marginBottom: 8 }}>{a.label}</div>
                    <div style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center' as const, lineHeight: 1.6, marginBottom: 20 }}>{a.confirmText}</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setConfirmAction(null)} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={() => handleAction(a.id)} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: a.dangerous ? '#ef4444' : a.color, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Confirm</button>
                    </div>
                </div>
            </div>;
        })()}
    </div></>);
}
AdminDashboard.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
