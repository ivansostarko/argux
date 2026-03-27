import PageMeta from '../../components/layout/PageMeta';
import AdminLayout from '../../layouts/AdminLayout';
import { useState, useEffect, useMemo } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import * as D from '../../mock/admin-statistics';
import type { TabId } from '../../mock/admin-statistics';

/* ═══ SVG Chart Primitives ═══ */
const W = 420, H = 180, P = { t: 20, r: 16, b: 28, l: 40 };
const cw = W - P.l - P.r, ch = H - P.t - P.b;

function BarChart({ data, xKey, bars, colors, labels }: { data: any[]; xKey: string; bars: string[]; colors: string[]; labels: string[] }) {
    const max = Math.max(...data.flatMap(d => bars.map(b => d[b] || 0))) * 1.15;
    const bw = cw / data.length; const barW = bw / (bars.length + 1);
    return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {[0, 0.25, 0.5, 0.75, 1].map(f => <g key={f}><line x1={P.l} y1={P.t + ch * (1 - f)} x2={W - P.r} y2={P.t + ch * (1 - f)} stroke={theme.border} strokeWidth="0.5" strokeDasharray={f === 0 ? '' : '3,3'} /><text x={P.l - 4} y={P.t + ch * (1 - f) + 3} textAnchor="end" fontSize="8" fill={theme.textDim}>{Math.round(max * f)}</text></g>)}
        {data.map((d, i) => <g key={i}>{bars.map((b, j) => { const v = d[b] || 0; const h = (v / max) * ch; return <rect key={b} x={P.l + i * bw + (j + 0.5) * barW} y={P.t + ch - h} width={barW * 0.8} height={h} fill={colors[j]} rx="2" opacity="0.85"><title>{labels[j]}: {v}</title></rect>; })}<text x={P.l + i * bw + bw / 2} y={H - 6} textAnchor="middle" fontSize="9" fill={theme.textDim}>{d[xKey]}</text></g>)}
        <g transform={`translate(${P.l},${H - 2})`}>{labels.map((l, i) => <g key={l} transform={`translate(${i * 80},0)`}><rect width="8" height="8" rx="2" fill={colors[i]} /><text x="12" y="7" fontSize="8" fill={theme.textSecondary}>{l}</text></g>)}</g>
    </svg>;
}

function LineChart({ data, xKey, lines, colors, labels }: { data: any[]; xKey: string; lines: string[]; colors: string[]; labels: string[] }) {
    const max = Math.max(...data.flatMap(d => lines.map(l => d[l] || 0))) * 1.1;
    const pts = (key: string) => data.map((d, i) => `${P.l + (i / (data.length - 1)) * cw},${P.t + ch - ((d[key] || 0) / max) * ch}`).join(' ');
    return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {[0, 0.25, 0.5, 0.75, 1].map(f => <g key={f}><line x1={P.l} y1={P.t + ch * (1 - f)} x2={W - P.r} y2={P.t + ch * (1 - f)} stroke={theme.border} strokeWidth="0.5" strokeDasharray={f === 0 ? '' : '3,3'} /><text x={P.l - 4} y={P.t + ch * (1 - f) + 3} textAnchor="end" fontSize="8" fill={theme.textDim}>{max >= 100 ? Math.round(max * f / 1000) + 'k' : Math.round(max * f)}</text></g>)}
        {lines.map((l, li) => <polyline key={l} points={pts(l)} fill="none" stroke={colors[li]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />)}
        {data.map((d, i) => <text key={i} x={P.l + (i / (data.length - 1)) * cw} y={H - 6} textAnchor="middle" fontSize="9" fill={theme.textDim}>{d[xKey]}</text>)}
        <g transform={`translate(${P.l},${H - 2})`}>{labels.map((l, i) => <g key={l} transform={`translate(${i * 80},0)`}><line x1="0" y1="4" x2="14" y2="4" stroke={colors[i]} strokeWidth="2" /><text x="18" y="7" fontSize="8" fill={theme.textSecondary}>{l}</text></g>)}</g>
    </svg>;
}

function AreaChart({ data, xKey, lines, colors, labels }: { data: any[]; xKey: string; lines: string[]; colors: string[]; labels: string[] }) {
    const max = Math.max(...data.flatMap(d => { let s = 0; return lines.map(l => s += (d[l] || 0)); })) * 1.1;
    return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {[0, 0.5, 1].map(f => <g key={f}><line x1={P.l} y1={P.t + ch * (1 - f)} x2={W - P.r} y2={P.t + ch * (1 - f)} stroke={theme.border} strokeWidth="0.5" strokeDasharray="3,3" /></g>)}
        {[...lines].reverse().map((l, li) => { const ci = lines.length - 1 - li; const apts = data.map((d, i) => { let s = 0; for (let j = 0; j <= ci; j++) s += (d[lines[j]] || 0); return `${P.l + (i / (data.length - 1)) * cw},${P.t + ch - (s / max) * ch}`; }); return <polygon key={l} points={`${P.l},${P.t + ch} ${apts.join(' ')} ${P.l + cw},${P.t + ch}`} fill={colors[ci]} opacity="0.3" />; })}
        {lines.map((l, li) => { const lpts = data.map((d, i) => { let s = 0; for (let j = 0; j <= li; j++) s += (d[lines[j]] || 0); return `${P.l + (i / (data.length - 1)) * cw},${P.t + ch - (s / max) * ch}`; }); return <polyline key={l} points={lpts.join(' ')} fill="none" stroke={colors[li]} strokeWidth="1.5" />; })}
        {data.map((d, i) => <text key={i} x={P.l + (i / (data.length - 1)) * cw} y={H - 6} textAnchor="middle" fontSize="9" fill={theme.textDim}>{d[xKey]}</text>)}
        <g transform={`translate(${P.l},${H - 2})`}>{labels.map((l, i) => <g key={l} transform={`translate(${i * 64},0)`}><rect width="8" height="8" rx="2" fill={colors[i]} opacity="0.5" /><text x="12" y="7" fontSize="8" fill={theme.textSecondary}>{l}</text></g>)}</g>
    </svg>;
}

function DonutChart({ data, size = 140 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
    const total = data.reduce((s, d) => s + d.value, 0); let angle = -90; const r = size / 2 - 10; const ir = r * 0.6;
    return <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {data.map(d => { const a1 = angle; const sweep = (d.value / total) * 360; angle += sweep; const a2 = a1 + sweep; const rad = (a: number) => (a * Math.PI) / 180; const large = sweep > 180 ? 1 : 0;
                return <path key={d.label} d={`M${size / 2 + r * Math.cos(rad(a1))},${size / 2 + r * Math.sin(rad(a1))} A${r},${r} 0 ${large},1 ${size / 2 + r * Math.cos(rad(a2))},${size / 2 + r * Math.sin(rad(a2))} L${size / 2 + ir * Math.cos(rad(a2))},${size / 2 + ir * Math.sin(rad(a2))} A${ir},${ir} 0 ${large},0 ${size / 2 + ir * Math.cos(rad(a1))},${size / 2 + ir * Math.sin(rad(a1))} Z`} fill={d.color} opacity="0.85"><title>{d.label}: {d.value}</title></path>; })}
            <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="16" fontWeight="800" fill={theme.text}>{total >= 1000 ? (total / 1000).toFixed(1) + 'k' : total}</text>
            <text x={size / 2} y={size / 2 + 10} textAnchor="middle" fontSize="8" fill={theme.textDim}>total</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>{data.map(d => <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} /><span style={{ fontSize: 10, color: theme.textSecondary, flex: 1 }}>{d.label}</span><span style={{ fontSize: 10, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{d.value >= 1000 ? (d.value / 1000).toFixed(0) + 'k' : d.value}</span><span style={{ fontSize: 9, color: theme.textDim }}>{Math.round(d.value / total * 100)}%</span></div>)}</div>
    </div>;
}

function HBar({ data, maxVal }: { data: { name: string; value: number; color: string }[]; maxVal?: number }) {
    const mx = maxVal || Math.max(...data.map(d => d.value));
    return <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>{data.map(d => <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 10, color: theme.textSecondary, width: 90, textAlign: 'right' as const, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.name}</span><div style={{ flex: 1, height: 14, borderRadius: 3, background: `${theme.border}15`, overflow: 'hidden' }}><div style={{ width: `${(d.value / mx) * 100}%`, height: '100%', borderRadius: 3, background: d.color, opacity: 0.8 }} /></div><span style={{ fontSize: 10, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace", width: 45, textAlign: 'right' as const }}>{d.value >= 1000 ? (d.value / 1000).toFixed(0) + 'k' : d.value}</span></div>)}</div>;
}

function Heatmap({ data, rows, cols }: { data: number[][]; rows: string[]; cols?: string[] }) {
    const max = Math.max(...data.flat());
    const hours = cols || Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    return <div style={{ overflowX: 'auto' }}><div style={{ display: 'inline-block', minWidth: 500 }}>
        <div style={{ display: 'flex', gap: 1, marginLeft: 32, marginBottom: 2 }}>{hours.filter((_, i) => i % 3 === 0).map(h => <span key={h} style={{ width: 28, fontSize: 8, color: theme.textDim, textAlign: 'center' as const }}>{h}</span>)}</div>
        {data.map((row, ri) => <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}><span style={{ width: 30, fontSize: 9, color: theme.textDim, textAlign: 'right' as const, paddingRight: 4 }}>{rows[ri]}</span>{row.map((v, ci) => { const pct = v / max; return <div key={ci} style={{ width: 9, height: 12, borderRadius: 1.5, background: pct > 0.7 ? '#ef4444' : pct > 0.4 ? '#f59e0b' : pct > 0.15 ? '#3b82f6' : pct > 0 ? '#3b82f630' : `${theme.border}15` }} title={`${rows[ri]} ${hours[ci]}:00 — ${v} events`} />; })}</div>)}
        <div style={{ display: 'flex', gap: 8, marginTop: 6, marginLeft: 32 }}>{[{ l: 'Low', c: '#3b82f630' }, { l: 'Med', c: '#3b82f6' }, { l: 'High', c: '#f59e0b' }, { l: 'Peak', c: '#ef4444' }].map(x => <span key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, color: theme.textDim }}><div style={{ width: 8, height: 8, borderRadius: 1.5, background: x.c }} />{x.l}</span>)}</div>
    </div></div>;
}

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="stat-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }

/* ═══ TAB CONTENT ═══ */
function OverviewTab() { return <><div className="stat-kpi-row">{D.overviewKpis.map(k => <div key={k.label} style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgCard }}><div style={{ fontSize: 10, color: theme.textDim, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{k.label}</div><div style={{ fontSize: 22, fontWeight: 800, color: k.color, fontFamily: "'JetBrains Mono',monospace" }}>{k.value}</div><div style={{ fontSize: 10, color: '#22c55e', marginTop: 2 }}>{k.trend}</div></div>)}</div><div className="stat-grid"><div className="stat-card"><h3 style={{ color: theme.text }}>📈 Event Trend (6 Months)</h3><LineChart data={D.eventTrend} xKey="month" lines={['events']} colors={['#3b82f6']} labels={['Events']} /></div><div className="stat-card"><h3 style={{ color: theme.text }}>📊 Entity Growth</h3><LineChart data={D.entityGrowth} xKey="month" lines={['persons', 'orgs', 'vehicles']} colors={['#3b82f6', '#22c55e', '#f59e0b']} labels={['Persons', 'Orgs', 'Vehicles']} /></div><div className="stat-card"><h3 style={{ color: theme.text }}>💾 Storage Breakdown</h3><DonutChart data={D.storageDonut} /></div><div className="stat-card"><h3 style={{ color: theme.text }}>⚡ Event Types</h3><HBar data={D.eventTypeBreakdown.map(e => ({ name: e.type, value: e.count, color: e.color }))} /></div></div></>; }

function ActivityTab() { return <div className="stat-grid"><div className="stat-card" style={{ gridColumn: '1 / -1' }}><h3 style={{ color: theme.text }}>🔥 Activity Heatmap (Day × Hour)</h3><Heatmap data={D.activityHeatmap} rows={D.heatmapDays} /></div><div className="stat-card"><h3 style={{ color: theme.text }}>🏆 Top Subjects by Activity</h3><HBar data={D.topSubjectsByActivity.map(s => ({ name: s.name, value: s.events, color: s.color }))} /></div><div className="stat-card"><h3 style={{ color: theme.text }}>📊 Event Type Distribution</h3><DonutChart data={D.eventTypeBreakdown.map(e => ({ label: e.type, value: e.count, color: e.color }))} /></div></div>; }

function DevicesTab() { return <div className="stat-grid"><div className="stat-card"><h3 style={{ color: theme.text }}>📡 Devices by Type (Online / Offline)</h3><BarChart data={D.devicesByType} xKey="type" bars={['online', 'offline']} colors={['#22c55e', '#ef4444']} labels={['Online', 'Offline']} /></div><div className="stat-card"><h3 style={{ color: theme.text }}>🔋 Battery Distribution</h3><BarChart data={D.batteryDistribution} xKey="range" bars={['count']} colors={['#3b82f6']} labels={['Devices']} /></div><div className="stat-card" style={{ gridColumn: '1 / -1' }}><h3 style={{ color: theme.text }}>📶 Sync Rate by Device Type (%)</h3><LineChart data={D.deviceSyncRate} xKey="hour" lines={['cameras', 'gps', 'phones']} colors={['#3b82f6', '#22c55e', '#f59e0b']} labels={['Cameras', 'GPS', 'Phones']} /></div><div className="stat-card" style={{ gridColumn: '1 / -1' }}><h3 style={{ color: theme.text }}>📊 Device Fleet Summary</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>{D.devicesByType.map(d => <div key={d.type} style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${d.color}20`, background: `${d.color}04` }}><div style={{ fontSize: 20, fontWeight: 800, color: d.color, fontFamily: "'JetBrains Mono',monospace" }}>{d.total}</div><div style={{ fontSize: 10, color: theme.textSecondary }}>{d.type}</div><div style={{ display: 'flex', gap: 6, marginTop: 4, fontSize: 9 }}><span style={{ color: '#22c55e' }}>🟢 {d.online}</span><span style={{ color: '#ef4444' }}>🔴 {d.offline}</span></div></div>)}</div></div></div>; }

function AlertsTab() { const sc: Record<string, string> = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }; return <div className="stat-grid"><div className="stat-card"><h3 style={{ color: theme.text }}>📈 Alert Frequency (This Week)</h3><BarChart data={D.alertFrequency} xKey="day" bars={['critical', 'warning', 'info']} colors={['#ef4444', '#f59e0b', '#3b82f6']} labels={['Critical', 'Warning', 'Info']} /></div><div className="stat-card"><h3 style={{ color: theme.text }}>🎯 Severity Distribution</h3><DonutChart data={D.alertSeverityDonut.map(a => ({ label: a.severity, value: a.count, color: a.color }))} /></div><div className="stat-card"><h3 style={{ color: theme.text }}>⏱️ Response Time</h3><BarChart data={D.responseTimeHistogram} xKey="range" bars={['count']} colors={['#3b82f6']} labels={['Alerts']} /></div><div className="stat-card"><h3 style={{ color: theme.text }}>🏆 Top Triggered Rules</h3><div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>{D.topTriggeredRules.map((r, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, border: `1px solid ${theme.border}20` }}><span style={{ fontSize: 11, fontWeight: 800, color: theme.textDim, width: 18 }}>#{i + 1}</span><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 11, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.rule}</div></div><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${sc[r.severity]}12`, color: sc[r.severity] }}>{r.triggers}</span></div>)}</div></div></div>; }

function MediaTab() { return <div className="stat-grid"><div className="stat-card" style={{ gridColumn: '1 / -1' }}><h3 style={{ color: theme.text }}>📤 Upload Volume (Weekly, Stacked)</h3><AreaChart data={D.uploadVolume} xKey="week" lines={['video', 'audio', 'photos', 'docs']} colors={['#3b82f6', '#f59e0b', '#ec4899', '#22c55e']} labels={['Video', 'Audio', 'Photos', 'Docs']} /></div><div className="stat-card"><h3 style={{ color: theme.text }}>🤖 AI Model Performance</h3><div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>{D.aiProcessingStats.map(m => <div key={m.model} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, border: `1px solid ${theme.border}20` }}><div style={{ width: 8, height: 26, borderRadius: 2, background: m.color, flexShrink: 0 }} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 600, color: theme.text }}>{m.model}</div><div style={{ display: 'flex', gap: 8, fontSize: 9, color: theme.textDim, marginTop: 2 }}><span>Jobs: <strong style={{ color: theme.text }}>{m.jobs.toLocaleString()}</strong></span><span>Avg: <strong>{m.avgTime}</strong></span><span style={{ color: Number(m.gpu.replace('%', '')) > 80 ? '#f59e0b' : theme.textDim }}>GPU: <strong>{m.gpu}</strong></span>{m.queue > 0 && <span style={{ color: '#f59e0b' }}>Queue: <strong>{m.queue}</strong></span>}</div></div></div>)}</div></div><div className="stat-card"><h3 style={{ color: theme.text }}>🧑 Face Recognition Match Rate</h3><LineChart data={D.faceMatchRate} xKey="month" lines={['rate']} colors={['#ec4899']} labels={['Match Rate %']} /></div></div>; }

function SubjectsTab() { const rc: Record<string, string> = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#22c55e', 'No Risk': '#6b7280' }; return <div className="stat-grid"><div className="stat-card"><h3 style={{ color: theme.text }}>🏆 Top 10 Persons by Activity</h3><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 400 }}><thead><tr>{['#', 'Name', 'Risk', 'Events', 'Conn', 'Dev'].map(h => <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 9, color: theme.textDim, borderBottom: `1px solid ${theme.border}`, fontWeight: 700 }}>{h}</th>)}</tr></thead><tbody>{D.topPersonsByActivity.map((p, i) => <tr key={i}><td style={{ padding: '5px 8px', color: theme.textDim, fontWeight: 700, borderBottom: `1px solid ${theme.border}08` }}>{i + 1}</td><td style={{ padding: '5px 8px', color: theme.text, fontWeight: 600, borderBottom: `1px solid ${theme.border}08` }}>{p.name}</td><td style={{ padding: '5px 8px', borderBottom: `1px solid ${theme.border}08` }}><span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 3, background: `${rc[p.risk]}12`, color: rc[p.risk] }}>{p.risk}</span></td><td style={{ padding: '5px 8px', color: theme.text, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, borderBottom: `1px solid ${theme.border}08` }}>{p.events.toLocaleString()}</td><td style={{ padding: '5px 8px', color: theme.textSecondary, fontSize: 10, borderBottom: `1px solid ${theme.border}08` }}>{p.connections}</td><td style={{ padding: '5px 8px', color: theme.textSecondary, fontSize: 10, borderBottom: `1px solid ${theme.border}08` }}>{p.devices}</td></tr>)}</tbody></table></div></div>
        <div className="stat-card"><h3 style={{ color: theme.text }}>🏢 Top Orgs by Connections</h3><HBar data={D.topOrgsByConnections.map(o => ({ name: o.name.length > 18 ? o.name.slice(0, 16) + '…' : o.name, value: o.connections, color: rc[o.risk] || '#6b7280' }))} /></div>
        <div className="stat-card"><h3 style={{ color: theme.text }}>⚠️ Risk Distribution</h3><BarChart data={D.riskDistribution} xKey="level" bars={['persons', 'orgs']} colors={['#3b82f6', '#8b5cf6']} labels={['Persons', 'Organizations']} /></div>
        <div className="stat-card"><h3 style={{ color: theme.text }}>📈 New Entities (Monthly)</h3><AreaChart data={D.newEntitiesTrend} xKey="month" lines={['persons', 'orgs', 'vehicles']} colors={['#3b82f6', '#22c55e', '#f59e0b']} labels={['Persons', 'Orgs', 'Vehicles']} /></div>
    </div>; }

/* ═══ PAGE ═══ */
export default function AdminStatistics() {
    const [tab, setTab] = useState<TabId>('overview');
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const { trigger } = useTopLoader();

    useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

    const switchTab = (t: TabId) => { setTab(t); setLoading(true); trigger(); setTimeout(() => setLoading(false), 400); };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            const tabKeys: Record<string, TabId> = { '1': 'overview', '2': 'activity', '3': 'devices', '4': 'alerts', '5': 'media', '6': 'subjects' };
            if (tabKeys[e.key]) { switchTab(tabKeys[e.key]); return; }
            switch (e.key) { case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) { setLoading(true); trigger(); setTimeout(() => setLoading(false), 500); } break; case 'Escape': setShowShortcuts(false); break; }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [trigger]);

    const tabContent = useMemo(() => {
        if (loading) return <div className="stat-grid">{Array.from({ length: 4 }).map((_, i) => <Skel key={i} w="100%" h={200} />)}</div>;
        switch (tab) {
            case 'overview': return <OverviewTab />;
            case 'activity': return <ActivityTab />;
            case 'devices': return <DevicesTab />;
            case 'alerts': return <AlertsTab />;
            case 'media': return <MediaTab />;
            case 'subjects': return <SubjectsTab />;
        }
    }, [tab, loading]);

    return (<><PageMeta title={`Statistics — ${D.tabs.find(t => t.id === tab)?.label}`} /><div data-testid="admin-statistics-page">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📈</div>
            <div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Statistics</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>System-wide analytics · 6 dashboards · Real-time data</p></div>
        </div>

        {/* Tabs */}
        <div className="stat-tabs">
            {D.tabs.map((t, i) => <button key={t.id} className={`stat-tab ${tab === t.id ? 'active' : ''}`} onClick={() => switchTab(t.id)}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}<span className="stat-kbd" style={{ marginLeft: 2 }}>{i + 1}</span>
            </button>)}
        </div>

        {tabContent}

        {/* Ctrl+Q */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>{D.keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="stat-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}<div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div></div></div>}
    </div></>);
}
AdminStatistics.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;