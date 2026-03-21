import { useRef, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '../ui';
import { useToast } from '../ui/Toast';
import { theme } from '../../lib/theme';
import { nodes as allNodes, edges as allEdges, connectionTypes, connectionCategories, getConnectionColor, getConnectionCategory, relationships, relationshipColors, type ConnectionNode, type ConnectionEdge, type Relationship } from '../../mock/connections';
import { riskColors } from '../../mock/persons';

interface SimNode extends ConnectionNode { x: number; y: number; vx: number; vy: number; r: number; }
interface Props { entityId: string; }

/* ═══ SEARCHABLE SELECT ═══ */
function SSel({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
    const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const f = options.filter(o => o.toLowerCase().includes(q.toLowerCase()));
    return <div ref={ref} style={{ position: 'relative' }}><button onClick={() => { setOpen(!open); setQ(''); }} style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: value ? theme.text : theme.textDim, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', justifyContent: 'space-between' }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{value || placeholder}</span><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4" /></svg></button>{open && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 8, zIndex: 60, maxHeight: 180, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}><div style={{ padding: '4px 6px', borderBottom: `1px solid ${theme.border}` }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus style={{ width: '100%', padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 11, fontFamily: 'inherit', outline: 'none' }} /></div><div style={{ overflowY: 'auto', flex: 1 }}>{f.slice(0, 40).map(o => <div key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ padding: '5px 10px', cursor: 'pointer', fontSize: 11, color: value === o ? theme.accent : theme.text }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{o}</div>)}</div></div>}</div>;
}

/* ═══ CONFIRM MODAL ═══ */
function ConfirmModal({ open, title, message, onConfirm, onCancel }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
    if (!open) return null;
    return (<div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}><div onClick={e => e.stopPropagation()} style={{ background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 14, width: '100%', maxWidth: 380, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'argux-fadeIn 0.2s ease-out' }}><h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, textAlign: 'center', margin: '0 0 8px' }}>{title}</h3><p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', lineHeight: 1.6, margin: '0 0 20px' }}>{message}</p><div style={{ display: 'flex', gap: 10 }}><Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button><Button variant="danger" onClick={onConfirm} style={{ flex: 1 }}>Delete</Button></div></div></div>);
}

/* ═══ CONNECTION FORM MODAL ═══ */
function ConnectionFormModal({ open, edge, entityId, onSave, onCancel }: { open: boolean; edge: ConnectionEdge | null; entityId: string; onSave: (e: ConnectionEdge) => void; onCancel: () => void }) {
    const isEdit = !!edge;
    const entityNode = allNodes.find(n => n.id === entityId);
    const otherOptions = allNodes.filter(n => n.id !== entityId).map(n => ({ id: n.id, label: `${n.label} (${n.type === 'organization' ? 'Org' : 'Person'})` }));

    const [targetId, setTargetId] = useState(edge ? (edge.source === entityId ? edge.target : edge.source) : '');
    const [type, setType] = useState(edge?.type || '');
    const [relationship, setRelationship] = useState<string>(edge?.relationship || 'Unknown');
    const [strength, setStrength] = useState(edge?.strength || 3);
    const [notes, setNotes] = useState(edge?.notes || '');
    const [firstSeen, setFirstSeen] = useState(edge?.firstSeen || '');
    const [lastSeen, setLastSeen] = useState(edge?.lastSeen || '');

    if (!open) return null;
    const targetLabel = otherOptions.find(o => o.id === targetId)?.label || '';
    const Lbl = ({ children }: { children: React.ReactNode }) => <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: theme.textSecondary, marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{children}</label>;

    return (<div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}><div onClick={e => e.stopPropagation()} style={{ background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 14, width: '100%', maxWidth: 480, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'argux-fadeIn 0.2s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>{isEdit ? 'Edit Connection' : 'Add Connection'}</h3>
        <p style={{ fontSize: 12, color: theme.textSecondary, margin: '0 0 18px' }}>{entityNode?.label} → ...</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><Lbl>Connected Entity *</Lbl><SSel value={targetLabel} onChange={v => { const m = otherOptions.find(o => o.label === v); if (m) setTargetId(m.id); }} options={otherOptions.map(o => o.label)} placeholder="Select person or organization" /></div>
            <div><Lbl>Connection Type *</Lbl><SSel value={type} onChange={setType} options={connectionTypes} placeholder="Select type" /></div>
            <div><Lbl>Relationship</Lbl><div style={{ display: 'flex', gap: 6 }}>{relationships.map(r => { const c = relationshipColors[r]; const sel = relationship === r; return <button key={r} onClick={() => setRelationship(r)} style={{ flex: 1, padding: '7px 4px', borderRadius: 6, border: `1.5px solid ${sel ? c : theme.border}`, background: sel ? `${c}15` : 'transparent', color: sel ? c : theme.textSecondary, fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>{r}</button>; })}</div></div>
            <div><Lbl>Strength ({strength}/5)</Lbl><div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>{[1,2,3,4,5].map(s => <button key={s} onClick={() => setStrength(s)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${s <= strength ? theme.accent : theme.border}`, background: s <= strength ? theme.accentDim : 'transparent', color: s <= strength ? theme.accent : theme.textDim, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{s}</button>)}</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><Lbl>First Seen</Lbl><input type="date" value={firstSeen} onChange={e => setFirstSeen(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", outline: 'none', colorScheme: 'dark' as any }} /></div>
                <div><Lbl>Last Seen</Lbl><input type="date" value={lastSeen} onChange={e => setLastSeen(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", outline: 'none', colorScheme: 'dark' as any }} /></div>
            </div>
            <div><Lbl>Notes</Lbl><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Intelligence notes..." style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button>
            <Button onClick={() => { if (!targetId || !type) return; onSave({ id: edge?.id || `c-new-${Date.now()}`, source: entityId, target: targetId, type, relationship: relationship as Relationship, strength, notes, firstSeen: firstSeen || new Date().toISOString().slice(0, 10), lastSeen: lastSeen || new Date().toISOString().slice(0, 10) }); }} style={{ flex: 1 }}>{isEdit ? 'Save Changes' : 'Add Connection'}</Button>
        </div>
    </div></div>);
}

/* ═══ MAIN COMPONENT ═══ */
export default function ConnectionsBubble({ entityId }: Props) {
    const toast = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const nodesRef = useRef<SimNode[]>([]);
    const hoveredRef = useRef<string | null>(null);
    const dragRef = useRef<SimNode | null>(null);
    const panRef = useRef({ x: 0, y: 0 });
    const zoomRef = useRef(1);
    const mouseDownPos = useRef({ x: 0, y: 0 });
    const panStartRef = useRef({ x: 0, y: 0, mx: 0, my: 0 });
    const isPanning = useRef(false);

    const [localEdges, setLocalEdges] = useState<ConnectionEdge[]>(allEdges);
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(Object.keys(connectionCategories)));
    const [formOpen, setFormOpen] = useState(false);
    const [editEdge, setEditEdge] = useState<ConnectionEdge | null>(null);
    const [deleteEdgeId, setDeleteEdgeId] = useState<string | null>(null);
    const [, forceUpdate] = useState(0);

    const activeCatsRef = useRef(activeCategories);
    const edgesRef = useRef(localEdges);
    activeCatsRef.current = activeCategories;
    edgesRef.current = localEdges;

    const getEntityEdges = () => edgesRef.current.filter(e => (e.source === entityId || e.target === entityId) && activeCatsRef.current.has(getConnectionCategory(e.type)));
    const getEntityNodes = () => {
        const edges = getEntityEdges();
        const ids = new Set([entityId, ...edges.map(e => e.source), ...edges.map(e => e.target)]);
        return allNodes.filter(n => ids.has(n.id));
    };

    const rebuildNodes = () => {
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.parentElement!.getBoundingClientRect();
        const cw = rect.width, ch = rect.height;
        const vNodes = getEntityNodes();
        const existing = new Map(nodesRef.current.map(n => [n.id, n]));
        nodesRef.current = vNodes.map((n, i) => {
            const ex = existing.get(n.id);
            const r = n.id === entityId ? 28 : (n.type === 'organization' ? 22 : 18);
            if (ex) return { ...n, x: ex.x, y: ex.y, vx: 0, vy: 0, r };
            const angle = (i / vNodes.length) * Math.PI * 2;
            const radius = Math.min(cw, ch) * 0.28;
            return { ...n, x: cw / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40, y: ch / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40, vx: 0, vy: 0, r };
        });
        forceUpdate(v => v + 1);
    };

    const handleSave = (e: ConnectionEdge) => {
        const exists = localEdges.find(x => x.id === e.id);
        if (exists) { setLocalEdges(prev => prev.map(x => x.id === e.id ? e : x)); toast.success('Connection updated'); }
        else { setLocalEdges(prev => [...prev, e]); toast.success('Connection added'); }
        setFormOpen(false); setEditEdge(null);
        setTimeout(rebuildNodes, 50);
    };
    const handleDelete = () => {
        if (!deleteEdgeId) return;
        setLocalEdges(prev => prev.filter(x => x.id !== deleteEdgeId));
        setDeleteEdgeId(null);
        toast.warning('Connection removed');
        setTimeout(rebuildNodes, 50);
    };

    const toggleCategory = (cat: string) => {
        setActiveCategories(prev => { const n = new Set(prev); if (n.has(cat)) n.delete(cat); else n.add(cat); return n; });
        setTimeout(rebuildNodes, 20);
    };

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const dpr = window.devicePixelRatio || 1;
        let w = 0, h = 0;
        const resize = () => { const rect = canvas.parentElement!.getBoundingClientRect(); w = canvas.width = rect.width * dpr; h = canvas.height = rect.height * dpr; canvas.style.width = rect.width + 'px'; canvas.style.height = rect.height + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
        resize(); window.addEventListener('resize', resize);
        rebuildNodes();

        const getPos = (e: MouseEvent) => { const rect = canvas.getBoundingClientRect(); return { x: (e.clientX - rect.left - panRef.current.x) / zoomRef.current, y: (e.clientY - rect.top - panRef.current.y) / zoomRef.current }; };
        const findNode = (mx: number, my: number) => { for (let i = nodesRef.current.length - 1; i >= 0; i--) { const n = nodesRef.current[i]; const dx = n.x - mx, dy = n.y - my; if (dx * dx + dy * dy < (n.r + 4) * (n.r + 4)) return n; } return null; };

        const onMove = (e: MouseEvent) => {
            const pos = getPos(e);
            if (dragRef.current) { dragRef.current.x = pos.x; dragRef.current.y = pos.y; dragRef.current.vx = 0; dragRef.current.vy = 0; }
            else if (isPanning.current) { panRef.current.x = panStartRef.current.x + (e.clientX - panStartRef.current.mx); panRef.current.y = panStartRef.current.y + (e.clientY - panStartRef.current.my); }
            hoveredRef.current = findNode(pos.x, pos.y)?.id || null;
            canvas.style.cursor = hoveredRef.current ? 'pointer' : (isPanning.current ? 'grabbing' : 'grab');
        };
        const onDown = (e: MouseEvent) => {
            if (e.button !== 0) return;
            const pos = getPos(e); mouseDownPos.current = { x: e.clientX, y: e.clientY };
            const node = findNode(pos.x, pos.y);
            if (node) { dragRef.current = node; }
            else { isPanning.current = true; panStartRef.current = { x: panRef.current.x, y: panRef.current.y, mx: e.clientX, my: e.clientY }; }
        };
        const onUp = (e: MouseEvent) => {
            const dx = e.clientX - mouseDownPos.current.x, dy = e.clientY - mouseDownPos.current.y;
            if (dragRef.current && dx * dx + dy * dy < 16 && dragRef.current.id !== entityId) {
                const n = dragRef.current;
                if (n.type === 'person') router.visit(`/persons/${n.entityId}`);
                else router.visit(`/organizations/${n.entityId}`);
            }
            dragRef.current = null; isPanning.current = false;
        };
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const d = e.deltaY > 0 ? 0.92 : 1.08;
            const nz = Math.max(0.4, Math.min(2.5, zoomRef.current * d));
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left, my = e.clientY - rect.top;
            panRef.current.x = mx - (mx - panRef.current.x) * (nz / zoomRef.current);
            panRef.current.y = my - (my - panRef.current.y) * (nz / zoomRef.current);
            zoomRef.current = nz;
        };

        canvas.addEventListener('mousemove', onMove); canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mouseup', onUp); canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('mouseleave', () => { dragRef.current = null; isPanning.current = false; });

        const draw = () => {
            const CW = w / dpr, CH = h / dpr;
            ctx.clearRect(0, 0, CW, CH);
            ctx.save(); ctx.translate(panRef.current.x, panRef.current.y); ctx.scale(zoomRef.current, zoomRef.current);
            const sNodes = nodesRef.current; const curEdges = getEntityEdges(); const hId = hoveredRef.current;

            // Forces
            for (const n of sNodes) {
                n.vx += (CW / 2 / zoomRef.current - panRef.current.x / zoomRef.current - n.x) * 0.0004;
                n.vy += (CH / 2 / zoomRef.current - panRef.current.y / zoomRef.current - n.y) * 0.0004;
                for (const m of sNodes) { if (n.id === m.id) continue; const dx = n.x - m.x, dy = n.y - m.y; let d = Math.sqrt(dx * dx + dy * dy); if (d < 1) d = 1; const min = n.r + m.r + 30; if (d < min * 3) { const f = (min * 60) / (d * d); n.vx += (dx / d) * f * 0.1; n.vy += (dy / d) * f * 0.1; } }
            }
            for (const e of curEdges) { const s = sNodes.find(n => n.id === e.source), t = sNodes.find(n => n.id === e.target); if (!s || !t) continue; const dx = t.x - s.x, dy = t.y - s.y; let d = Math.sqrt(dx * dx + dy * dy); if (d < 1) d = 1; const td = 80 + (5 - e.strength) * 20; const f = (d - td) * 0.002; s.vx += (dx / d) * f; s.vy += (dy / d) * f; t.vx -= (dx / d) * f; t.vy -= (dy / d) * f; }
            for (const n of sNodes) { if (dragRef.current === n) continue; n.vx *= 0.88; n.vy *= 0.88; n.x += n.vx; n.y += n.vy; }

            // Edges
            for (const e of curEdges) {
                const s = sNodes.find(n => n.id === e.source), t = sNodes.find(n => n.id === e.target); if (!s || !t) continue;
                const color = getConnectionColor(e.type); const relColor = relationshipColors[e.relationship];
                const hl = hId && (s.id === hId || t.id === hId); const faded = hId && !hl;
                ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y);
                ctx.strokeStyle = faded ? `${color}15` : hl ? `${color}cc` : `${color}45`;
                ctx.lineWidth = hl ? 2 + e.strength * 0.4 : 0.8 + e.strength * 0.3; ctx.stroke();
                const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2;
                if (!faded) { ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI * 2); ctx.fillStyle = `${relColor}${hl ? 'dd' : '80'}`; ctx.fill(); }
                if (hl && zoomRef.current > 0.5) { ctx.font = '600 8px system-ui'; ctx.fillStyle = `${color}dd`; ctx.textAlign = 'center'; ctx.fillText(e.type, mx, my - 8); ctx.font = '500 7px system-ui'; ctx.fillStyle = `${relColor}cc`; ctx.fillText(e.relationship, mx, my + 10); }
            }

            // Nodes
            for (const n of sNodes) {
                const isCenter = n.id === entityId; const isH = hId === n.id;
                const isFaded = hId && hId !== n.id && !curEdges.some(e => (e.source === hId && e.target === n.id) || (e.target === hId && e.source === n.id));
                const a = isFaded ? 0.25 : 1; const rc = (riskColors as any)[n.risk] || theme.accent; const isOrg = n.type === 'organization';
                if ((isH || isCenter) && !isFaded) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2); ctx.fillStyle = `${rc}${isCenter ? '30' : '18'}`; ctx.fill(); }
                ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = isOrg ? `rgba(29,63,110,${a})` : `rgba(22,38,66,${a})`; ctx.fill();
                ctx.strokeStyle = `${rc}${isFaded ? '30' : isH || isCenter ? 'ff' : '70'}`; ctx.lineWidth = isH || isCenter ? 2.5 : 1.5; ctx.stroke();
                ctx.fillStyle = `rgba(255,255,255,${a * 0.9})`; ctx.font = `700 ${isCenter ? 11 : 9}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                const parts = n.label.split(' '); ctx.fillText((parts[0]?.[0] || '') + (parts[parts.length > 1 ? 1 : 0]?.[0] || ''), n.x, n.y);
                if (!isFaded) { ctx.font = `${isH || isCenter ? '700' : '500'} ${isCenter ? 10 : 8}px system-ui`; ctx.fillStyle = `rgba(232,236,244,${a * 0.85})`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(n.label.length > 14 ? n.label.slice(0, 12) + '…' : n.label, n.x, n.y + n.r + 4); }
            }
            ctx.restore();
            animRef.current = requestAnimationFrame(draw);
        };
        draw();
        return () => { window.removeEventListener('resize', resize); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mousedown', onDown); canvas.removeEventListener('mouseup', onUp); canvas.removeEventListener('wheel', onWheel); cancelAnimationFrame(animRef.current); };
    }, [entityId]);

    const entityEdges = getEntityEdges();

    return (
        <div>
            {/* Modals */}
            <ConnectionFormModal open={formOpen} edge={editEdge} entityId={entityId} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditEdge(null); }} />
            <ConfirmModal open={deleteEdgeId !== null} title="Delete Connection" message="Remove this connection? This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteEdgeId(null)} />

            {/* Toolbar: filters + add */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
                    {Object.entries(connectionCategories).map(([cat, cfg]) => {
                        const active = activeCategories.has(cat);
                        return <button key={cat} onClick={() => toggleCategory(cat)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 4, border: `1px solid ${active ? cfg.color : theme.border}`, background: active ? `${cfg.color}12` : 'transparent', color: active ? cfg.color : theme.textDim, fontSize: 9, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' as const }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: active ? cfg.color : theme.textDim }} />{cat}</button>;
                    })}
                </div>
                <button onClick={() => { setEditEdge(null); setFormOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 6, background: theme.accent, color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' as const }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>Add</button>
            </div>

            {/* Canvas with zoom controls */}
            <div style={{ position: 'relative', border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 14, background: 'rgba(10,14,22,0.3)' }}>
                <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 360, cursor: 'grab' }} />
                <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 4 }}>
                    <button onClick={() => { zoomRef.current = Math.min(2.5, zoomRef.current * 1.2); }} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(13,18,32,0.85)', border: `1px solid ${theme.border}`, color: theme.text, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', backdropFilter: 'blur(4px)' }}>+</button>
                    <button onClick={() => { zoomRef.current = Math.max(0.4, zoomRef.current * 0.8); }} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(13,18,32,0.85)', border: `1px solid ${theme.border}`, color: theme.text, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', backdropFilter: 'blur(4px)' }}>−</button>
                    <button onClick={() => { zoomRef.current = 1; panRef.current = { x: 0, y: 0 }; }} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(13,18,32,0.85)', border: `1px solid ${theme.border}`, color: theme.textSecondary, fontSize: 9, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', backdropFilter: 'blur(4px)' }}>FIT</button>
                </div>
                <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 9, fontWeight: 600, color: theme.textDim, background: 'rgba(13,18,32,0.7)', padding: '3px 8px', borderRadius: 4, backdropFilter: 'blur(4px)' }}>Drag nodes · Scroll to zoom · Drag empty to pan</div>
            </div>

            {/* Edge list */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Connections ({entityEdges.length})</span>
            </div>
            {entityEdges.length === 0 ? <div style={{ padding: '24px 16px', textAlign: 'center', color: theme.textDim, fontSize: 13 }}>No connections with active filters.</div> : entityEdges.map(e => {
                const otherId = e.source === entityId ? e.target : e.source;
                const otherNode = allNodes.find(n => n.id === otherId);
                if (!otherNode) return null;
                const color = getConnectionColor(e.type);
                const relColor = relationshipColors[e.relationship];
                return (
                    <div key={e.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => otherNode.type === 'person' ? router.visit(`/persons/${otherNode.entityId}`) : router.visit(`/organizations/${otherNode.entityId}`)}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{otherNode.label.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                                <div><div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{otherNode.label}</div><div style={{ fontSize: 10, color: theme.textSecondary }}>{otherNode.type === 'organization' ? 'Organization' : 'Person'}</div></div>
                            </div>
                            <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: `${color}18`, color, border: `1px solid ${color}30` }}>{e.type}</span>
                                <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: `${relColor}18`, color: relColor, border: `1px solid ${relColor}30` }}>{e.relationship}</span>
                                <button onClick={() => { setEditEdge(e); setFormOpen(true); }} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 3, cursor: 'pointer', color: theme.textSecondary, display: 'flex' }} title="Edit"><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg></button>
                                <button onClick={() => setDeleteEdgeId(e.id)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 3, cursor: 'pointer', color: theme.danger, display: 'flex' }} title="Delete"><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></button>
                            </div>
                        </div>
                        <div style={{ fontSize: 10, color: theme.textDim, marginTop: 4 }}>Strength: {'●'.repeat(e.strength)}{'○'.repeat(5 - e.strength)} · {e.firstSeen.slice(0, 7)} → {e.lastSeen.slice(0, 7)}</div>
                        {e.notes && <div style={{ fontSize: 10, color: theme.textSecondary, marginTop: 2 }}>{e.notes}</div>}
                    </div>
                );
            })}
        </div>
    );
}
