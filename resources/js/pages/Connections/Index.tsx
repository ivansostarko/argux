import { useState, useRef, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { nodes as allNodes, edges as allEdges, connectionCategories, getConnectionColor, getConnectionCategory, type ConnectionNode, type ConnectionEdge } from '../../mock/connections';
import { riskColors } from '../../mock/persons';

interface SimNode extends ConnectionNode {
    x: number; y: number; vx: number; vy: number; r: number;
    targetX?: number; targetY?: number;
}

const NODE_R_PERSON = 24;
const NODE_R_ORG = 30;

export default function ConnectionsIndex() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const simNodesRef = useRef<SimNode[]>([]);
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
    const [search, setSearch] = useState('');
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(Object.keys(connectionCategories)));
    const mouseRef = useRef({ x: -1000, y: -1000, down: false, dragNode: null as SimNode | null, panX: 0, panY: 0, startPanX: 0, startPanY: 0, startMouseX: 0, startMouseY: 0, panning: false });
    const panRef = useRef({ x: 0, y: 0 });
    const zoomRef = useRef(1);

    // Filter edges by active categories
    const visibleEdges = allEdges.filter(e => activeCategories.has(getConnectionCategory(e.type)));

    // Determine visible nodes
    const getVisibleData = useCallback(() => {
        if (focusedId) {
            const connectedEdges = visibleEdges.filter(e => e.source === focusedId || e.target === focusedId);
            const connectedNodeIds = new Set([focusedId, ...connectedEdges.map(e => e.source), ...connectedEdges.map(e => e.target)]);
            const filteredNodes = allNodes.filter(n => connectedNodeIds.has(n.id));
            return { nodes: filteredNodes, edges: connectedEdges };
        }
        const searchLower = search.toLowerCase();
        if (searchLower) {
            const matchIds = new Set(allNodes.filter(n => n.label.toLowerCase().includes(searchLower)).map(n => n.id));
            const relEdges = visibleEdges.filter(e => matchIds.has(e.source) || matchIds.has(e.target));
            const relNodeIds = new Set([...matchIds, ...relEdges.map(e => e.source), ...relEdges.map(e => e.target)]);
            return { nodes: allNodes.filter(n => relNodeIds.has(n.id)), edges: relEdges };
        }
        const edgeNodeIds = new Set([...visibleEdges.map(e => e.source), ...visibleEdges.map(e => e.target)]);
        return { nodes: allNodes.filter(n => edgeNodeIds.has(n.id)), edges: visibleEdges };
    }, [focusedId, search, visibleEdges]);

    const toggleCategory = (cat: string) => {
        setActiveCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat); else next.add(cat);
            return next;
        });
    };

    // Initialize simulation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let w = 0, h = 0;

        const resize = () => {
            const rect = canvas.parentElement!.getBoundingClientRect();
            w = canvas.width = rect.width * (window.devicePixelRatio || 1);
            h = canvas.height = rect.height * (window.devicePixelRatio || 1);
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        const initNodes = () => {
            const { nodes: vNodes } = getVisibleData();
            const cw = w / (window.devicePixelRatio || 1);
            const ch = h / (window.devicePixelRatio || 1);
            const existing = new Map(simNodesRef.current.map(n => [n.id, n]));
            simNodesRef.current = vNodes.map((n, i) => {
                const ex = existing.get(n.id);
                const r = n.type === 'organization' ? NODE_R_ORG : NODE_R_PERSON;
                if (ex) return { ...n, x: ex.x, y: ex.y, vx: 0, vy: 0, r };
                const angle = (i / vNodes.length) * Math.PI * 2;
                const radius = Math.min(cw, ch) * 0.3;
                return { ...n, x: cw / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 60, y: ch / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 60, vx: 0, vy: 0, r };
            });
        };
        initNodes();

        // Mouse
        const getMousePos = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            return { x: (e.clientX - rect.left - panRef.current.x) / zoomRef.current, y: (e.clientY - rect.top - panRef.current.y) / zoomRef.current };
        };
        const findNode = (mx: number, my: number) => {
            for (let i = simNodesRef.current.length - 1; i >= 0; i--) {
                const n = simNodesRef.current[i];
                const dx = n.x - mx, dy = n.y - my;
                if (dx * dx + dy * dy < n.r * n.r) return n;
            }
            return null;
        };

        const handleMouseMove = (e: MouseEvent) => {
            const m = mouseRef.current;
            const pos = getMousePos(e);
            mouseRef.current.x = pos.x;
            mouseRef.current.y = pos.y;
            if (m.dragNode) {
                m.dragNode.x = pos.x;
                m.dragNode.y = pos.y;
                m.dragNode.vx = 0;
                m.dragNode.vy = 0;
            } else if (m.panning) {
                panRef.current.x = m.startPanX + (e.clientX - m.startMouseX);
                panRef.current.y = m.startPanY + (e.clientY - m.startMouseY);
            }
            const hNode = findNode(pos.x, pos.y);
            setHoveredId(hNode ? hNode.id : null);
            canvas.style.cursor = hNode ? 'pointer' : (m.panning ? 'grabbing' : 'grab');
        };

        const handleMouseDown = (e: MouseEvent) => {
            const pos = getMousePos(e);
            const node = findNode(pos.x, pos.y);
            if (node) {
                mouseRef.current.dragNode = node;
                mouseRef.current.down = true;
            } else {
                mouseRef.current.panning = true;
                mouseRef.current.startPanX = panRef.current.x;
                mouseRef.current.startPanY = panRef.current.y;
                mouseRef.current.startMouseX = e.clientX;
                mouseRef.current.startMouseY = e.clientY;
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            const m = mouseRef.current;
            if (m.dragNode && !m.panning) {
                const pos = getMousePos(e);
                const dx = m.dragNode.x - pos.x, dy = m.dragNode.y - pos.y;
                if (dx * dx + dy * dy < 4) {
                    setFocusedId(prev => prev === m.dragNode!.id ? null : m.dragNode!.id);
                    setSelectedNode(prev => prev?.id === m.dragNode!.id ? null : m.dragNode!);
                }
            }
            m.dragNode = null;
            m.down = false;
            m.panning = false;
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.92 : 1.08;
            const newZoom = Math.max(0.3, Math.min(3, zoomRef.current * delta));
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left, my = e.clientY - rect.top;
            panRef.current.x = mx - (mx - panRef.current.x) * (newZoom / zoomRef.current);
            panRef.current.y = my - (my - panRef.current.y) * (newZoom / zoomRef.current);
            zoomRef.current = newZoom;
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', () => { mouseRef.current.dragNode = null; mouseRef.current.panning = false; });
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        // Simulation
        const { edges: vEdges } = getVisibleData();
        const edgeMap = new Map<string, Set<string>>();
        vEdges.forEach(e => {
            if (!edgeMap.has(e.source)) edgeMap.set(e.source, new Set());
            if (!edgeMap.has(e.target)) edgeMap.set(e.target, new Set());
            edgeMap.get(e.source)!.add(e.target);
            edgeMap.get(e.target)!.add(e.source);
        });

        const draw = () => {
            const cw = w / (window.devicePixelRatio || 1);
            const ch = h / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, cw, ch);
            ctx.save();
            ctx.translate(panRef.current.x, panRef.current.y);
            ctx.scale(zoomRef.current, zoomRef.current);

            const sNodes = simNodesRef.current;
            const { edges: curEdges } = getVisibleData();

            // Force simulation step
            const alpha = 0.15;
            for (const n of sNodes) {
                // Center gravity
                n.vx += (cw / 2 / zoomRef.current - panRef.current.x / zoomRef.current - n.x) * 0.0005;
                n.vy += (ch / 2 / zoomRef.current - panRef.current.y / zoomRef.current - n.y) * 0.0005;
                // Repulsion
                for (const m of sNodes) {
                    if (n.id === m.id) continue;
                    const dx = n.x - m.x, dy = n.y - m.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 1) dist = 1;
                    const minDist = n.r + m.r + 40;
                    if (dist < minDist * 3) {
                        const force = (minDist * 80) / (dist * dist);
                        n.vx += (dx / dist) * force * alpha;
                        n.vy += (dy / dist) * force * alpha;
                    }
                }
            }
            // Attraction along edges
            for (const e of curEdges) {
                const s = sNodes.find(n => n.id === e.source);
                const t = sNodes.find(n => n.id === e.target);
                if (!s || !t) continue;
                const dx = t.x - s.x, dy = t.y - s.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 1) dist = 1;
                const targetDist = 120 + (5 - e.strength) * 30;
                const force = (dist - targetDist) * 0.003 * alpha;
                s.vx += (dx / dist) * force;
                s.vy += (dy / dist) * force;
                t.vx -= (dx / dist) * force;
                t.vy -= (dy / dist) * force;
            }
            // Apply velocities
            for (const n of sNodes) {
                if (mouseRef.current.dragNode === n) continue;
                n.vx *= 0.85; n.vy *= 0.85;
                n.x += n.vx; n.y += n.vy;
            }

            // Draw edges
            for (const e of curEdges) {
                const s = sNodes.find(n => n.id === e.source);
                const t = sNodes.find(n => n.id === e.target);
                if (!s || !t) continue;
                const color = getConnectionColor(e.type);
                const isHighlight = hoveredId && (s.id === hoveredId || t.id === hoveredId);
                const isFaded = hoveredId && !isHighlight;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(t.x, t.y);
                ctx.strokeStyle = isFaded ? `${color}15` : isHighlight ? `${color}cc` : `${color}50`;
                ctx.lineWidth = isHighlight ? 2 + e.strength * 0.5 : 0.5 + e.strength * 0.3;
                ctx.stroke();
                // Edge label
                if (isHighlight && zoomRef.current > 0.6) {
                    const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2;
                    ctx.font = '600 8px system-ui';
                    ctx.fillStyle = `${color}dd`;
                    ctx.textAlign = 'center';
                    ctx.fillText(e.type, mx, my - 4);
                }
            }

            // Draw nodes
            for (const n of sNodes) {
                const isFocused = focusedId === n.id;
                const isHovered = hoveredId === n.id;
                const isFaded = hoveredId && hoveredId !== n.id && !curEdges.some(e => (e.source === hoveredId && e.target === n.id) || (e.target === hoveredId && e.source === n.id));
                const nodeAlpha = isFaded ? 0.2 : 1;

                // Glow
                if ((isHovered || isFocused) && !isFaded) {
                    const rc = (riskColors as any)[n.risk] || theme.accent;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r + 8, 0, Math.PI * 2);
                    ctx.fillStyle = `${rc}20`;
                    ctx.fill();
                }

                // Node circle
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                const isOrg = n.type === 'organization';
                ctx.fillStyle = isOrg ? `rgba(29,63,110,${nodeAlpha})` : `rgba(22,38,66,${nodeAlpha})`;
                ctx.fill();
                const borderColor = (riskColors as any)[n.risk] || theme.accent;
                ctx.strokeStyle = `${borderColor}${isFaded ? '30' : isHovered ? 'ff' : '80'}`;
                ctx.lineWidth = isHovered || isFocused ? 2.5 : 1.5;
                ctx.stroke();

                // Icon / initials
                ctx.fillStyle = `rgba(255,255,255,${nodeAlpha * (isFaded ? 0.5 : 0.9)})`;
                ctx.font = `700 ${isOrg ? 11 : 10}px system-ui`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (isOrg) {
                    ctx.fillText(n.label.slice(0, 2).toUpperCase(), n.x, n.y);
                } else {
                    const parts = n.label.split(' ');
                    ctx.fillText((parts[0]?.[0] || '') + (parts[1]?.[0] || ''), n.x, n.y);
                }

                // Label below
                if (!isFaded || isHovered) {
                    ctx.font = `${isHovered || isFocused ? '700' : '600'} ${isOrg ? 10 : 9}px system-ui`;
                    ctx.fillStyle = `rgba(232,236,244,${nodeAlpha * 0.9})`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    const label = n.label.length > 18 ? n.label.slice(0, 16) + '…' : n.label;
                    ctx.fillText(label, n.x, n.y + n.r + 5);
                    // Type badge
                    ctx.font = '500 7px system-ui';
                    ctx.fillStyle = `rgba(136,150,171,${nodeAlpha * 0.7})`;
                    ctx.fillText(isOrg ? 'ORG' : 'PERSON', n.x, n.y + n.r + 17);
                }
            }

            ctx.restore();
            animRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);
            cancelAnimationFrame(animRef.current);
        };
    }, [focusedId, search, activeCategories]);

    // Get edges for selected node
    const selectedEdges = selectedNode ? allEdges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).filter(e => activeCategories.has(getConnectionCategory(e.type))) : [];

    const handleNodeNav = (node: ConnectionNode) => {
        if (node.type === 'person') router.visit(`/persons/${node.entityId}`);
        else router.visit(`/organizations/${node.entityId}`);
    };

    const { nodes: visibleNodes, edges: curEdges } = getVisibleData();

    return (
        <div className="conn-page">
            {/* Toolbar */}
            <div className="conn-toolbar">
                <div className="conn-search">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                    <input value={search} onChange={e => { setSearch(e.target.value); setFocusedId(null); setSelectedNode(null); }} placeholder="Search entities..." />
                </div>
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

                {/* Reset focus button */}
                {focusedId && (
                    <button className="conn-reset-btn" onClick={() => { setFocusedId(null); setSelectedNode(null); }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l14 14M15 1L1 15"/></svg>
                        Show All Connections
                    </button>
                )}

                {/* Legend */}
                <div className="conn-legend">
                    <div className="conn-legend-title">Connection Types</div>
                    {Object.entries(connectionCategories).filter(([cat]) => activeCategories.has(cat)).map(([cat, cfg]) => (
                        <div key={cat} className="conn-legend-item">
                            <span className="conn-legend-dot" style={{ background: cfg.color }} />
                            {cat} ({cfg.types.length})
                        </div>
                    ))}
                    <div className="conn-legend-item" style={{ marginTop: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(22,38,66,0.8)', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />
                        Person
                    </div>
                    <div className="conn-legend-item">
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(29,63,110,0.8)', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />
                        Organization
                    </div>
                </div>

                {/* Stats */}
                <div className="conn-stats">
                    <div className="conn-stat">Nodes<strong>{visibleNodes.length}</strong></div>
                    <div className="conn-stat">Edges<strong>{curEdges.length}</strong></div>
                    <div className="conn-stat">Zoom<strong>{Math.round(zoomRef.current * 100)}%</strong></div>
                </div>

                {/* Info panel */}
                {selectedNode && (
                    <div className="conn-info-panel">
                        <div className="conn-info-header">
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                {selectedNode.label.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{selectedNode.label}</div>
                                <div style={{ fontSize: 10, color: theme.textSecondary }}>{selectedNode.type === 'organization' ? 'Organization' : 'Person'} · {selectedNode.subLabel}</div>
                            </div>
                            <button onClick={() => { setSelectedNode(null); setFocusedId(null); }} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 4 }}>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>
                            </button>
                        </div>
                        <div style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 6 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${(riskColors as any)[selectedNode.risk]}18`, color: (riskColors as any)[selectedNode.risk], border: `1px solid ${(riskColors as any)[selectedNode.risk]}30`, textTransform: 'uppercase' as const }}>{selectedNode.risk}</span>
                            <button onClick={() => handleNodeNav(selectedNode)} style={{ fontSize: 10, fontWeight: 600, color: theme.accent, background: theme.accentDim, border: `1px solid ${theme.accent}30`, borderRadius: 3, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit' }}>View Profile →</button>
                        </div>
                        <div className="conn-info-body">
                            <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Connections ({selectedEdges.length})</div>
                            {selectedEdges.length === 0 ? <div style={{ fontSize: 12, color: theme.textDim }}>No connections with active filters.</div> : selectedEdges.map(e => {
                                const otherId = e.source === selectedNode.id ? e.target : e.source;
                                const otherNode = allNodes.find(n => n.id === otherId);
                                if (!otherNode) return null;
                                const color = getConnectionColor(e.type);
                                return (
                                    <div key={e.id} className="conn-info-edge">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: theme.text, cursor: 'pointer' }} onClick={() => { setFocusedId(otherId); setSelectedNode(allNodes.find(n => n.id === otherId) as any); }}>{otherNode.label}</span>
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
