import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { nodes as allNodes, edges as allEdges, connectionCategories, getConnectionColor, getConnectionCategory, type ConnectionNode } from '../../mock/connections';
import { riskColors } from '../../mock/persons';

interface SimNode extends ConnectionNode { x: number; y: number; vx: number; vy: number; r: number; }

const NODE_R_P = 24, NODE_R_O = 30;

/* ═══ MULTISELECT ═══ */
function MS({ selected, onChange, options, placeholder }: { selected: string[]; onChange: (v: string[]) => void; options: { id: string; label: string }[]; placeholder: string }) {
    const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
    const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    const has = selected.length > 0;
    return (<div ref={ref} style={{ position: 'relative', minWidth: 140 }}><button onClick={() => { setOpen(!open); setQ(''); }} style={{ width: '100%', padding: '6px 10px', background: theme.bgInput, color: has ? theme.text : theme.textDim, border: `1px solid ${has ? theme.accent+'60' : theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{has ? `${selected.length} selected` : placeholder}</span>{has && <span style={{ background: theme.accentDim, color: theme.accent, fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 4 }}>{selected.length}</span>}</button>{open && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 8, zIndex: 60, maxHeight: 220, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}><div style={{ padding: '5px 6px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus style={{ flex: 1, padding: '5px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 11, fontFamily: 'inherit', outline: 'none' }} />{has && <button onClick={() => onChange([])} style={{ background: 'none', border: 'none', color: theme.danger, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Clear</button>}</div><div style={{ overflowY: 'auto', flex: 1 }}>{filtered.map(o => { const c = selected.includes(o.id); return <div key={o.id} onClick={() => toggle(o.id)} style={{ padding: '5px 10px', cursor: 'pointer', fontSize: 11, color: c ? theme.accent : theme.text, display: 'flex', alignItems: 'center', gap: 6 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><div style={{ width: 12, height: 12, borderRadius: 2, border: `1.5px solid ${c ? theme.accent : theme.border}`, background: c ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c && <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>{o.label}</div>; })}</div></div>}</div>);
}

/* ═══ CONTEXT MENU ═══ */
function CtxMenu({ x, y, node, onClose }: { x: number; y: number; node: ConnectionNode; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = () => onClose(); document.addEventListener('click', h); document.addEventListener('scroll', h, true); return () => { document.removeEventListener('click', h); document.removeEventListener('scroll', h, true); }; }, [onClose]);
    const adjX = x + 180 > window.innerWidth ? x - 180 : x;
    const adjY = y + 80 > window.innerHeight ? y - 80 : y;
    const link = node.type === 'person' ? `/persons/${node.entityId}` : `/organizations/${node.entityId}`;
    return (<div ref={ref} style={{ position: 'fixed', top: adjY, left: adjX, zIndex: 200, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 10, padding: 5, minWidth: 180, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', animation: 'argux-fadeIn 0.12s ease-out' }}>
        <div style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, color: theme.textDim, borderBottom: `1px solid ${theme.border}`, marginBottom: 4 }}>{node.label}</div>
        <button onClick={e => { e.stopPropagation(); router.visit(link); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: theme.accent, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 6, fontWeight: 500 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>View Profile
        </button>
    </div>);
}

export default function ConnectionsIndex() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const simNodesRef = useRef<SimNode[]>([]);

    // UI state (for rendering toolbar/panels)
    const [focusedId, _setFocusedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
    const [filterPersons, _setFilterPersons] = useState<string[]>([]);
    const [filterOrgs, _setFilterOrgs] = useState<string[]>([]);
    const [activeCategories, _setActiveCategories] = useState<Set<string>>(new Set(Object.keys(connectionCategories)));
    const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; node: ConnectionNode } | null>(null);
    const [, forceUpdate] = useState(0);

    // Refs mirror state so draw loop reads them without re-running useEffect
    const focusedRef = useRef<string | null>(null);
    const filterPersonsRef = useRef<string[]>([]);
    const filterOrgsRef = useRef<string[]>([]);
    const activeCatsRef = useRef<Set<string>>(new Set(Object.keys(connectionCategories)));
    const hoveredRef = useRef<string | null>(null);

    const setFocusedId = (v: string | null) => { focusedRef.current = v; _setFocusedId(v); };
    const setFilterPersons = (v: string[]) => { filterPersonsRef.current = v; _setFilterPersons(v); rebuildNodes(); };
    const setFilterOrgs = (v: string[]) => { filterOrgsRef.current = v; _setFilterOrgs(v); rebuildNodes(); };
    const setActiveCategories = (fn: (prev: Set<string>) => Set<string>) => {
        _setActiveCategories(prev => { const next = fn(prev); activeCatsRef.current = next; return next; });
        setTimeout(rebuildNodes, 10);
    };

    // Compute visible data from refs (called from draw loop + rebuild)
    const getVisibleData = () => {
        const catEdges = allEdges.filter(e => activeCatsRef.current.has(getConnectionCategory(e.type)));
        const fId = focusedRef.current;
        const fp = filterPersonsRef.current;
        const fo = filterOrgsRef.current;

        let visEdges = catEdges;
        let visNodeIds: Set<string>;

        if (fId) {
            visEdges = catEdges.filter(e => e.source === fId || e.target === fId);
            visNodeIds = new Set([fId, ...visEdges.map(e => e.source), ...visEdges.map(e => e.target)]);
        } else if (fp.length > 0 || fo.length > 0) {
            const filterIds = new Set([...fp, ...fo]);
            visEdges = catEdges.filter(e => filterIds.has(e.source) || filterIds.has(e.target));
            visNodeIds = new Set([...filterIds, ...visEdges.map(e => e.source), ...visEdges.map(e => e.target)]);
        } else {
            visNodeIds = new Set([...catEdges.map(e => e.source), ...catEdges.map(e => e.target)]);
        }
        return { nodes: allNodes.filter(n => visNodeIds.has(n.id)), edges: visEdges };
    };

    const rebuildNodes = () => {
        const { nodes: vNodes } = getVisibleData();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.parentElement!.getBoundingClientRect();
        const cw = rect.width, ch = rect.height;
        const existing = new Map(simNodesRef.current.map(n => [n.id, n]));
        simNodesRef.current = vNodes.map((n, i) => {
            const ex = existing.get(n.id);
            const r = n.type === 'organization' ? NODE_R_O : NODE_R_P;
            if (ex) return { ...n, x: ex.x, y: ex.y, vx: 0, vy: 0, r };
            const angle = (i / vNodes.length) * Math.PI * 2;
            const radius = Math.min(cw, ch) * 0.3;
            return { ...n, x: cw / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 60, y: ch / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 60, vx: 0, vy: 0, r };
        });
        forceUpdate(v => v + 1);
    };

    const personOptions = allNodes.filter(n => n.type === 'person').map(n => ({ id: n.id, label: n.label }));
    const orgOptions = allNodes.filter(n => n.type === 'organization').map(n => ({ id: n.id, label: n.label }));

    const toggleCategory = (cat: string) => {
        setActiveCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat); else next.add(cat);
            return next;
        });
    };

    // Canvas setup — runs ONCE
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let w = 0, h = 0;

        const resize = () => {
            const rect = canvas.parentElement!.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            w = canvas.width = rect.width * dpr;
            h = canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        // Init nodes
        rebuildNodes();

        const panRef_ = { x: 0, y: 0 };
        const zoomRef_ = { v: 1 };
        const mouse = { x: -1000, y: -1000, dragNode: null as SimNode | null, panning: false, startPanX: 0, startPanY: 0, startMouseX: 0, startMouseY: 0, downX: 0, downY: 0 };

        const getPos = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            return { x: (e.clientX - rect.left - panRef_.x) / zoomRef_.v, y: (e.clientY - rect.top - panRef_.y) / zoomRef_.v };
        };
        const findNode = (mx: number, my: number) => {
            for (let i = simNodesRef.current.length - 1; i >= 0; i--) {
                const n = simNodesRef.current[i];
                const dx = n.x - mx, dy = n.y - my;
                if (dx * dx + dy * dy < (n.r + 4) * (n.r + 4)) return n;
            }
            return null;
        };

        const onMove = (e: MouseEvent) => {
            const pos = getPos(e);
            mouse.x = pos.x; mouse.y = pos.y;
            if (mouse.dragNode) { mouse.dragNode.x = pos.x; mouse.dragNode.y = pos.y; mouse.dragNode.vx = 0; mouse.dragNode.vy = 0; }
            else if (mouse.panning) { panRef_.x = mouse.startPanX + (e.clientX - mouse.startMouseX); panRef_.y = mouse.startPanY + (e.clientY - mouse.startMouseY); }
            const h = findNode(pos.x, pos.y);
            hoveredRef.current = h ? h.id : null;
            setHoveredId(h ? h.id : null);
            canvas.style.cursor = h ? 'pointer' : (mouse.panning ? 'grabbing' : 'grab');
        };
        const onDown = (e: MouseEvent) => {
            if (e.button === 2) return; // skip right click
            const pos = getPos(e);
            mouse.downX = e.clientX; mouse.downY = e.clientY;
            const node = findNode(pos.x, pos.y);
            if (node) { mouse.dragNode = node; }
            else { mouse.panning = true; mouse.startPanX = panRef_.x; mouse.startPanY = panRef_.y; mouse.startMouseX = e.clientX; mouse.startMouseY = e.clientY; }
        };
        const onUp = (e: MouseEvent) => {
            if (e.button === 2) return;
            const dx = e.clientX - mouse.downX, dy = e.clientY - mouse.downY;
            const wasClick = dx * dx + dy * dy < 16;
            if (mouse.dragNode && wasClick) {
                const clickedId = mouse.dragNode.id;
                const newFocused = focusedRef.current === clickedId ? null : clickedId;
                setFocusedId(newFocused);
                setSelectedNode(newFocused ? mouse.dragNode : null);
                // Rebuild nodes for new focus after a tick
                setTimeout(rebuildNodes, 10);
            }
            mouse.dragNode = null; mouse.panning = false;
        };
        const onContext = (e: MouseEvent) => {
            e.preventDefault();
            const pos = getPos(e);
            const node = findNode(pos.x, pos.y);
            if (node) {
                setCtxMenu({ x: e.clientX, y: e.clientY, node });
            } else {
                setCtxMenu(null);
            }
        };
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const d = e.deltaY > 0 ? 0.92 : 1.08;
            const nz = Math.max(0.3, Math.min(3, zoomRef_.v * d));
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left, my = e.clientY - rect.top;
            panRef_.x = mx - (mx - panRef_.x) * (nz / zoomRef_.v);
            panRef_.y = my - (my - panRef_.y) * (nz / zoomRef_.v);
            zoomRef_.v = nz;
        };

        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mouseup', onUp);
        canvas.addEventListener('contextmenu', onContext);
        canvas.addEventListener('mouseleave', () => { mouse.dragNode = null; mouse.panning = false; });
        canvas.addEventListener('wheel', onWheel, { passive: false });

        // Draw loop
        const draw = () => {
            const dpr = window.devicePixelRatio || 1;
            const cw = w / dpr, ch = h / dpr;
            ctx.clearRect(0, 0, cw, ch);
            ctx.save();
            ctx.translate(panRef_.x, panRef_.y);
            ctx.scale(zoomRef_.v, zoomRef_.v);

            const sNodes = simNodesRef.current;
            const { edges: curEdges } = getVisibleData();
            const hId = hoveredRef.current;
            const fId = focusedRef.current;

            // Force step
            for (const n of sNodes) {
                n.vx += (cw / 2 / zoomRef_.v - panRef_.x / zoomRef_.v - n.x) * 0.0005;
                n.vy += (ch / 2 / zoomRef_.v - panRef_.y / zoomRef_.v - n.y) * 0.0005;
                for (const m of sNodes) {
                    if (n.id === m.id) continue;
                    const dx = n.x - m.x, dy = n.y - m.y;
                    let dist = Math.sqrt(dx * dx + dy * dy); if (dist < 1) dist = 1;
                    const minDist = n.r + m.r + 40;
                    if (dist < minDist * 3) {
                        const f = (minDist * 80) / (dist * dist);
                        n.vx += (dx / dist) * f * 0.15; n.vy += (dy / dist) * f * 0.15;
                    }
                }
            }
            for (const e of curEdges) {
                const s = sNodes.find(n => n.id === e.source), t = sNodes.find(n => n.id === e.target);
                if (!s || !t) continue;
                const dx = t.x - s.x, dy = t.y - s.y;
                let dist = Math.sqrt(dx * dx + dy * dy); if (dist < 1) dist = 1;
                const td = 120 + (5 - e.strength) * 30;
                const f = (dist - td) * 0.003 * 0.15;
                s.vx += (dx / dist) * f; s.vy += (dy / dist) * f;
                t.vx -= (dx / dist) * f; t.vy -= (dy / dist) * f;
            }
            for (const n of sNodes) {
                if (mouse.dragNode === n) continue;
                n.vx *= 0.85; n.vy *= 0.85; n.x += n.vx; n.y += n.vy;
            }

            // Draw edges
            for (const e of curEdges) {
                const s = sNodes.find(n => n.id === e.source), t = sNodes.find(n => n.id === e.target);
                if (!s || !t) continue;
                const color = getConnectionColor(e.type);
                const hl = hId && (s.id === hId || t.id === hId);
                const faded = hId && !hl;
                ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y);
                ctx.strokeStyle = faded ? `${color}15` : hl ? `${color}cc` : `${color}50`;
                ctx.lineWidth = hl ? 2 + e.strength * 0.5 : 0.5 + e.strength * 0.3;
                ctx.stroke();
                if (hl && zoomRef_.v > 0.6) {
                    ctx.font = '600 8px system-ui'; ctx.fillStyle = `${color}dd`;
                    ctx.textAlign = 'center'; ctx.fillText(e.type, (s.x + t.x) / 2, (s.y + t.y) / 2 - 4);
                }
            }

            // Draw nodes
            for (const n of sNodes) {
                const isH = hId === n.id;
                const isF = fId === n.id;
                const isFaded = hId && hId !== n.id && !curEdges.some(e => (e.source === hId && e.target === n.id) || (e.target === hId && e.source === n.id));
                const a = isFaded ? 0.2 : 1;
                const rc = (riskColors as any)[n.risk] || theme.accent;

                // Glow
                if ((isH || isF) && !isFaded) {
                    ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 8, 0, Math.PI * 2);
                    ctx.fillStyle = `${rc}20`; ctx.fill();
                }

                // Avatar image or initials
                const isOrg = n.type === 'organization';
                ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = isOrg ? `rgba(29,63,110,${a})` : `rgba(22,38,66,${a})`;
                ctx.fill();
                ctx.strokeStyle = `${rc}${isFaded ? '30' : isH ? 'ff' : '80'}`;
                ctx.lineWidth = isH || isF ? 2.5 : 1.5; ctx.stroke();

                // Initials
                ctx.fillStyle = `rgba(255,255,255,${a * (isFaded ? 0.5 : 0.9)})`;
                ctx.font = `700 ${isOrg ? 11 : 10}px system-ui`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                const parts = n.label.split(' ');
                ctx.fillText((parts[0]?.[0] || '') + (parts[parts.length > 1 ? 1 : 0]?.[0] || ''), n.x, n.y);

                // Label
                if (!isFaded || isH) {
                    ctx.font = `${isH || isF ? '700' : '600'} ${isOrg ? 10 : 9}px system-ui`;
                    ctx.fillStyle = `rgba(232,236,244,${a * 0.9})`;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                    ctx.fillText(n.label.length > 18 ? n.label.slice(0, 16) + '…' : n.label, n.x, n.y + n.r + 5);
                    ctx.font = '500 7px system-ui'; ctx.fillStyle = `rgba(136,150,171,${a * 0.7})`;
                    ctx.fillText(isOrg ? 'ORG' : 'PERSON', n.x, n.y + n.r + 17);
                }
            }

            ctx.restore();
            animRef.current = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', onMove);
            canvas.removeEventListener('mousedown', onDown);
            canvas.removeEventListener('mouseup', onUp);
            canvas.removeEventListener('contextmenu', onContext);
            canvas.removeEventListener('wheel', onWheel);
            cancelAnimationFrame(animRef.current);
        };
    }, []); // runs ONCE — all filter state read from refs

    // Edges for info panel
    const selectedEdges = selectedNode ? allEdges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).filter(e => activeCategories.has(getConnectionCategory(e.type))) : [];
    const { nodes: visibleNodes, edges: curEdges } = getVisibleData();

    return (
        <div className="conn-page">
            {ctxMenu && <CtxMenu x={ctxMenu.x} y={ctxMenu.y} node={ctxMenu.node} onClose={() => setCtxMenu(null)} />}

            {/* Toolbar */}
            <div className="conn-toolbar">
                <MS selected={filterPersons} onChange={v => setFilterPersons(v)} options={personOptions} placeholder="Persons" />
                <MS selected={filterOrgs} onChange={v => setFilterOrgs(v)} options={orgOptions} placeholder="Organizations" />
                <div className="conn-toolbar-divider" />
                <div className="conn-toolbar-group" style={{ flexWrap: 'wrap' }}>
                    {Object.entries(connectionCategories).map(([cat, cfg]) => (
                        <button key={cat} className={`conn-filter-btn ${activeCategories.has(cat) ? 'active' : ''}`} onClick={() => toggleCategory(cat)} style={activeCategories.has(cat) ? { borderColor: cfg.color, color: cfg.color, background: `${cfg.color}12` } : {}}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeCategories.has(cat) ? cfg.color : theme.textDim, flexShrink: 0 }} />
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Canvas */}
            <div className="conn-canvas-wrap">
                <canvas ref={canvasRef} className="conn-canvas" />

                {focusedId && (
                    <button className="conn-reset-btn" onClick={() => { setFocusedId(null); setSelectedNode(null); setTimeout(rebuildNodes, 10); }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>
                        Show All Connections
                    </button>
                )}

                {/* Legend */}
                <div className="conn-legend">
                    <div className="conn-legend-title">Connection Types</div>
                    {Object.entries(connectionCategories).filter(([cat]) => activeCategories.has(cat)).map(([cat, cfg]) => (
                        <div key={cat} className="conn-legend-item">
                            <span className="conn-legend-dot" style={{ background: cfg.color }} />{cat} ({cfg.types.length})
                        </div>
                    ))}
                    <div className="conn-legend-item" style={{ marginTop: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(22,38,66,0.8)', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />Person</div>
                    <div className="conn-legend-item"><span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(29,63,110,0.8)', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />Organization</div>
                </div>

                {/* Stats */}
                <div className="conn-stats">
                    <div className="conn-stat">Nodes<strong>{visibleNodes.length}</strong></div>
                    <div className="conn-stat">Edges<strong>{curEdges.length}</strong></div>
                </div>

                {/* Info panel */}
                {selectedNode && (
                    <div className="conn-info-panel">
                        <div className="conn-info-header">
                            <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                {selectedNode.avatar ? <img src={selectedNode.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedNode.label.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{selectedNode.label}</div>
                                <div style={{ fontSize: 10, color: theme.textSecondary }}>{selectedNode.type === 'organization' ? 'Organization' : 'Person'} · {selectedNode.subLabel}</div>
                            </div>
                            <button onClick={() => { setSelectedNode(null); setFocusedId(null); setTimeout(rebuildNodes, 10); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 4 }}>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>
                            </button>
                        </div>
                        <div style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 6 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${(riskColors as any)[selectedNode.risk]}18`, color: (riskColors as any)[selectedNode.risk], border: `1px solid ${(riskColors as any)[selectedNode.risk]}30`, textTransform: 'uppercase' as const }}>{selectedNode.risk}</span>
                            <button onClick={() => router.visit(selectedNode.type === 'person' ? `/persons/${selectedNode.entityId}` : `/organizations/${selectedNode.entityId}`)} style={{ fontSize: 10, fontWeight: 600, color: theme.accent, background: theme.accentDim, border: `1px solid ${theme.accent}30`, borderRadius: 3, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit' }}>View Profile →</button>
                        </div>
                        <div className="conn-info-body">
                            <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Connections ({selectedEdges.length})</div>
                            {selectedEdges.length === 0 ? <div style={{ fontSize: 12, color: theme.textDim }}>No connections.</div> : selectedEdges.map(e => {
                                const otherId = e.source === selectedNode.id ? e.target : e.source;
                                const otherNode = allNodes.find(n => n.id === otherId);
                                if (!otherNode) return null;
                                const color = getConnectionColor(e.type);
                                return (
                                    <div key={e.id} className="conn-info-edge">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: theme.text, cursor: 'pointer' }} onClick={() => { setFocusedId(otherId); setSelectedNode(allNodes.find(n => n.id === otherId) as any); setTimeout(rebuildNodes, 10); }}>{otherNode.label}</span>
                                            <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: `${color}18`, color, border: `1px solid ${color}30` }}>{e.type}</span>
                                        </div>
                                        <div style={{ fontSize: 10, color: theme.textDim }}>Strength: {'●'.repeat(e.strength)}{'○'.repeat(5 - e.strength)} · {e.firstSeen.slice(0, 7)} → {e.lastSeen.slice(0, 7)}</div>
                                        {e.notes && <div style={{ fontSize: 10, color: theme.textSecondary, marginTop: 3 }}>{e.notes}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

ConnectionsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
