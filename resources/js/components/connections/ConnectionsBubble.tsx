import { useRef, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { theme } from '../../lib/theme';
import { nodes as allNodes, edges as allEdges, connectionCategories, getConnectionColor, getConnectionCategory, relationshipColors, type ConnectionNode, type Relationship } from '../../mock/connections';
import { riskColors } from '../../mock/persons';

interface SimNode extends ConnectionNode { x: number; y: number; vx: number; vy: number; r: number; }

interface Props { entityId: string; }

export default function ConnectionsBubble({ entityId }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const nodesRef = useRef<SimNode[]>([]);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const hoveredRef = useRef<string | null>(null);
    const [, forceUpdate] = useState(0);

    const entityEdges = allEdges.filter(e => e.source === entityId || e.target === entityId);
    const entityNodeIds = new Set([entityId, ...entityEdges.map(e => e.source), ...entityEdges.map(e => e.target)]);
    const entityNodes = allNodes.filter(n => entityNodeIds.has(n.id));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || entityNodes.length === 0) return;
        const ctx = canvas.getContext('2d')!;
        const dpr = window.devicePixelRatio || 1;
        let w = 0, h = 0;

        const resize = () => {
            const rect = canvas.parentElement!.getBoundingClientRect();
            w = canvas.width = rect.width * dpr;
            h = canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        const cw = () => w / dpr, ch = () => h / dpr;
        // Init nodes
        const existing = new Map(nodesRef.current.map(n => [n.id, n]));
        nodesRef.current = entityNodes.map((n, i) => {
            const ex = existing.get(n.id);
            const r = n.id === entityId ? 28 : (n.type === 'organization' ? 22 : 18);
            if (ex) return { ...n, x: ex.x, y: ex.y, vx: 0, vy: 0, r };
            const angle = (i / entityNodes.length) * Math.PI * 2;
            const radius = Math.min(cw(), ch()) * 0.28;
            return { ...n, x: cw() / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40, y: ch() / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40, vx: 0, vy: 0, r };
        });

        const mouse = { x: -1000, y: -1000 };
        const findNode = (mx: number, my: number) => {
            for (let i = nodesRef.current.length - 1; i >= 0; i--) {
                const n = nodesRef.current[i]; const dx = n.x - mx, dy = n.y - my;
                if (dx * dx + dy * dy < (n.r + 4) * (n.r + 4)) return n;
            }
            return null;
        };
        const onMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
            const node = findNode(mouse.x, mouse.y);
            hoveredRef.current = node ? node.id : null;
            canvas.style.cursor = node ? 'pointer' : 'default';
            forceUpdate(v => v + 1);
        };
        const onClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const node = findNode(e.clientX - rect.left, e.clientY - rect.top);
            if (node && node.id !== entityId) {
                if (node.type === 'person') router.visit(`/persons/${node.entityId}`);
                else router.visit(`/organizations/${node.entityId}`);
            }
        };
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('click', onClick);

        const draw = () => {
            const CW = cw(), CH = ch();
            ctx.clearRect(0, 0, CW, CH);
            const sNodes = nodesRef.current;
            const hId = hoveredRef.current;

            // Forces
            for (const n of sNodes) {
                n.vx += (CW / 2 - n.x) * 0.001; n.vy += (CH / 2 - n.y) * 0.001;
                for (const m of sNodes) {
                    if (n.id === m.id) continue;
                    const dx = n.x - m.x, dy = n.y - m.y;
                    let d = Math.sqrt(dx * dx + dy * dy); if (d < 1) d = 1;
                    const min = n.r + m.r + 30;
                    if (d < min * 3) { const f = (min * 60) / (d * d); n.vx += (dx / d) * f * 0.1; n.vy += (dy / d) * f * 0.1; }
                }
            }
            for (const e of entityEdges) {
                const s = sNodes.find(n => n.id === e.source), t = sNodes.find(n => n.id === e.target);
                if (!s || !t) continue;
                const dx = t.x - s.x, dy = t.y - s.y;
                let d = Math.sqrt(dx * dx + dy * dy); if (d < 1) d = 1;
                const td = 80 + (5 - e.strength) * 20;
                const f = (d - td) * 0.002;
                s.vx += (dx / d) * f; s.vy += (dy / d) * f;
                t.vx -= (dx / d) * f; t.vy -= (dy / d) * f;
            }
            for (const n of sNodes) { n.vx *= 0.88; n.vy *= 0.88; n.x += n.vx; n.y += n.vy; n.x = Math.max(n.r, Math.min(CW - n.r, n.x)); n.y = Math.max(n.r, Math.min(CH - n.r, n.y)); }

            // Edges
            for (const e of entityEdges) {
                const s = sNodes.find(n => n.id === e.source), t = sNodes.find(n => n.id === e.target);
                if (!s || !t) continue;
                const color = getConnectionColor(e.type);
                const relColor = relationshipColors[e.relationship];
                const hl = hId && (s.id === hId || t.id === hId);
                const faded = hId && !hl;
                ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y);
                ctx.strokeStyle = faded ? `${color}15` : hl ? `${color}cc` : `${color}45`;
                ctx.lineWidth = hl ? 2 + e.strength * 0.4 : 0.8 + e.strength * 0.3;
                ctx.stroke();
                // Relationship dot at midpoint
                const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2;
                if (!faded) {
                    ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI * 2);
                    ctx.fillStyle = `${relColor}${hl ? 'dd' : '80'}`; ctx.fill();
                }
                if (hl) {
                    ctx.font = '600 8px system-ui'; ctx.fillStyle = `${color}dd`;
                    ctx.textAlign = 'center'; ctx.fillText(e.type, mx, my - 8);
                    ctx.font = '500 7px system-ui'; ctx.fillStyle = `${relColor}cc`;
                    ctx.fillText(e.relationship, mx, my + 10);
                }
            }

            // Nodes
            for (const n of sNodes) {
                const isCenter = n.id === entityId;
                const isH = hId === n.id;
                const isFaded = hId && hId !== n.id && !entityEdges.some(e => (e.source === hId && e.target === n.id) || (e.target === hId && e.source === n.id));
                const a = isFaded ? 0.25 : 1;
                const rc = (riskColors as any)[n.risk] || theme.accent;
                const isOrg = n.type === 'organization';

                if ((isH || isCenter) && !isFaded) {
                    ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
                    ctx.fillStyle = `${rc}${isCenter ? '30' : '18'}`; ctx.fill();
                }
                ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = isOrg ? `rgba(29,63,110,${a})` : `rgba(22,38,66,${a})`;
                ctx.fill();
                ctx.strokeStyle = `${rc}${isFaded ? '30' : isH || isCenter ? 'ff' : '70'}`;
                ctx.lineWidth = isH || isCenter ? 2.5 : 1.5; ctx.stroke();

                ctx.fillStyle = `rgba(255,255,255,${a * 0.9})`;
                ctx.font = `700 ${isCenter ? 11 : 9}px system-ui`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                const parts = n.label.split(' ');
                ctx.fillText((parts[0]?.[0] || '') + (parts[parts.length > 1 ? 1 : 0]?.[0] || ''), n.x, n.y);

                if (!isFaded) {
                    ctx.font = `${isH || isCenter ? '700' : '500'} ${isCenter ? 10 : 8}px system-ui`;
                    ctx.fillStyle = `rgba(232,236,244,${a * 0.85})`;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                    const lbl = n.label.length > 14 ? n.label.slice(0, 12) + '…' : n.label;
                    ctx.fillText(lbl, n.x, n.y + n.r + 4);
                }
            }

            animRef.current = requestAnimationFrame(draw);
        };
        draw();

        return () => { window.removeEventListener('resize', resize); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('click', onClick); cancelAnimationFrame(animRef.current); };
    }, [entityId]);

    if (entityEdges.length === 0) return <div style={{ padding: '30px 16px', textAlign: 'center', color: theme.textDim, fontSize: 13 }}>No connections found.</div>;

    return (
        <div>
            <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 14, background: 'rgba(10,14,22,0.3)' }}>
                <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 340 }} />
            </div>
            {/* Edge list */}
            <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Connections ({entityEdges.length})</div>
            {entityEdges.map(e => {
                const otherId = e.source === entityId ? e.target : e.source;
                const otherNode = allNodes.find(n => n.id === otherId);
                if (!otherNode) return null;
                const color = getConnectionColor(e.type);
                const relColor = relationshipColors[e.relationship];
                return (
                    <div key={e.id} style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 6, cursor: 'pointer', transition: 'background 0.12s' }} onClick={() => otherNode.type === 'person' ? router.visit(`/persons/${otherNode.entityId}`) : router.visit(`/organizations/${otherNode.entityId}`)} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={e => (e.currentTarget.style.background = theme.bgInput)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{otherNode.label.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                                <div><div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{otherNode.label}</div><div style={{ fontSize: 10, color: theme.textSecondary }}>{otherNode.type === 'organization' ? 'Organization' : 'Person'}</div></div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: `${color}18`, color, border: `1px solid ${color}30` }}>{e.type}</span>
                                <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: `${relColor}18`, color: relColor, border: `1px solid ${relColor}30` }}>{e.relationship}</span>
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><path d="M6 3l5 5-5 5"/></svg>
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
