import PageMeta from '../../components/layout/PageMeta';
import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockDevices, deviceTypeIcons, deviceTypeColors, type Device } from '../../mock/devices';
import { useTopLoader } from '../../components/ui/TopLoader';
import { VIDEO_SRC, allCams, PTZ_IDS, camGroups, defaultPresets, mockFaces, tlSegs, defaultMotionZones, keyboardShortcuts as visShortcuts } from '../../mock/vision';
import type { AiBox, CamAlert, CamState, FaceHit, MotionZone, Preset, Grid, SidePanel } from '../../mock/vision';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Vision · Camera Surveillance Wall
   SINGLE shared <video> → canvas-per-tile (avoids WebMediaPlayer limit)
   ═══════════════════════════════════════════════════════════════ */


function VisionIndex() {
    const [layout, setLayout] = useState<Grid>('3x3');
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState('all');
    const [groupF, setGroupF] = useState('all');
    const [selCam, setSelCam] = useState<number | null>(null);
    const [showAlerts, setShowAlerts] = useState(true);
    const [showAi, setShowAi] = useState(true);
    const [showInfo, setShowInfo] = useState(true);
    const [showWave, setShowWave] = useState(true);
    const [fsCam, setFsCam] = useState<number | null>(null);
    const [gRec, setGRec] = useState(false);
    const [gNV, setGNV] = useState(false);
    const [gMute, setGMute] = useState(true);
    const [syncPlay, setSyncPlay] = useState(false);
    const [tlCursor, setTlCursor] = useState(65);
    const [sideP, setSideP] = useState<SidePanel>(null);
    const [presets, setPresets] = useState(defaultPresets);
    const [motionZones] = useState<MotionZone[]>(defaultMotionZones);
    const [ptzPan, setPtzPan] = useState(0);
    const [ptzTilt, setPtzTilt] = useState(0);
    const [ptzZoom, setPtzZoom] = useState(1);
    const [viewMap, setViewMap] = useState(false);
    const [clock, setClock] = useState(new Date().toLocaleTimeString('en-GB'));
    const [leftOpen, setLeftOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const waveRef = useRef<number[]>(Array(10).fill(0));
    const { trigger } = useTopLoader();

    // ═══ SHARED VIDEO SOURCE (single <video> element) ═══
    const sharedVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
    const rafRef = useRef<number>(0);

    // Pump shared video frames to all canvases
    useEffect(() => {
        const draw = () => {
            const v = sharedVideoRef.current;
            if (v && !v.paused && v.readyState >= 2) {
                Object.entries(canvasRefs.current).forEach(([idStr, canvas]) => {
                    if (!canvas) return;
                    const id = parseInt(idStr);
                    const cam = cams[id];
                    const dev = allCams.find(d => d.id === id);
                    if (!dev || dev.status !== 'Online' || cam?.paused) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    const cw = canvas.width, ch = canvas.height;
                    ctx.clearRect(0, 0, cw, ch);
                    // Apply zoom
                    const z = cam?.zoom || 1;
                    const sw = cw / z, sh = ch / z;
                    const sx = (cw - sw) / 2, sy = (ch - sh) / 2;
                    ctx.drawImage(v, 0, 0, v.videoWidth, v.videoHeight, sx, sy, sw + sx, sh + sy);
                    // Night vision filter via globalCompositeOperation
                    if (gNV || cam?.nv) {
                        ctx.globalCompositeOperation = 'saturation';
                        ctx.fillStyle = '#000';
                        ctx.fillRect(0, 0, cw, ch);
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.fillStyle = 'rgba(0,255,0,0.06)';
                        ctx.fillRect(0, 0, cw, ch);
                    }
                });
            }
            rafRef.current = requestAnimationFrame(draw);
        };
        rafRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(rafRef.current);
    });

    // Ensure shared video plays
    useEffect(() => {
        const v = sharedVideoRef.current;
        if (!v) return;
        v.muted = true;
        const tryPlay = () => { if (v.paused) v.play().catch(() => {}); };
        v.addEventListener('loadeddata', tryPlay);
        v.addEventListener('suspend', tryPlay);
        v.addEventListener('stalled', tryPlay);
        const i = setInterval(tryPlay, 3000);
        tryPlay();
        return () => { clearInterval(i); };
    }, []);

    useEffect(() => { const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB')), 1000); return () => clearInterval(t); }, []);
    useEffect(() => { const t = setInterval(() => { waveRef.current = waveRef.current.map(() => Math.random() * 80 + 5); }, 150); return () => clearInterval(t); }, []);

    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case '1': setLayout('1x1'); setViewMap(false); trigger(); break;
                case '2': setLayout('2x2'); setViewMap(false); trigger(); break;
                case '3': setLayout('3x3'); setViewMap(false); trigger(); break;
                case '4': setLayout('4x4'); setViewMap(false); trigger(); break;
                case 'b': case 'B': if (!e.ctrlKey && !e.metaKey) setLeftOpen(p => !p); break;
                case 'a': case 'A': if (!e.ctrlKey && !e.metaKey) setShowAi(p => !p); break;
                case 'i': case 'I': if (!e.ctrlKey && !e.metaKey) setShowInfo(p => !p); break;
                case 'n': case 'N': if (!e.ctrlKey && !e.metaKey) setGNV(p => !p); break;
                case 'Escape': if (fsCam) setFsCam(null); else { setShowShortcuts(false); setSideP(null); } break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [fsCam, trigger]);

    // Cam state
    const [cams, setCams] = useState<Record<number, CamState>>({});
    useEffect(() => {
        const s: Record<number, CamState> = {};
        allCams.forEach(d => {
            const dets: AiBox[] = [];
            if (d.status === 'Online') {
                if (Math.random() > 0.3) dets.push({ id: `${d.id}-f`, type: 'face', label: 'Face', conf: 78 + Math.floor(Math.random() * 20), x: 28 + Math.random() * 30, y: 12 + Math.random() * 20, w: 7 + Math.random() * 4, h: 9 + Math.random() * 5, color: '#ec4899', personName: ['Marko Horvat', 'Ivan Babić', 'Unknown'][Math.floor(Math.random() * 3)] });
                if (Math.random() > 0.5) dets.push({ id: `${d.id}-p`, type: 'person', label: 'Person', conf: 85 + Math.floor(Math.random() * 14), x: 8 + Math.random() * 40, y: 18 + Math.random() * 30, w: 9 + Math.random() * 8, h: 16 + Math.random() * 12, color: '#3b82f6' });
                if (Math.random() > 0.6) dets.push({ id: `${d.id}-v`, type: 'vehicle', label: 'Vehicle', conf: 90 + Math.floor(Math.random() * 9), x: 5 + Math.random() * 50, y: 48 + Math.random() * 20, w: 14 + Math.random() * 8, h: 9 + Math.random() * 6, color: '#22c55e' });
                if (d.notes?.includes('LPR')) dets.push({ id: `${d.id}-l`, type: 'lpr', label: 'ZG-1847-AB', conf: 96, x: 18 + Math.random() * 30, y: 56 + Math.random() * 15, w: 14, h: 6, color: '#f59e0b' });
            }
            const alerts: CamAlert[] = [];
            if (d.id === 1) alerts.push({ id: 'a1', sev: 'critical', title: 'Face: Horvat (94%)', time: '2m', icon: '🧑' });
            if (d.id === 8) alerts.push({ id: 'a2', sev: 'high', title: 'Restricted motion', time: '5m', icon: '🏃' });
            if (d.id === 14) alerts.push({ id: 'a3', sev: 'medium', title: 'LPR: ZG-1847-AB', time: '12m', icon: '🚗' });
            if (d.id === 18) alerts.push({ id: 'a4', sev: 'high', title: 'Speed: 142 km/h', time: '8m', icon: '⚠️' });
            if (d.id === 5) alerts.push({ id: 'a5', sev: 'critical', title: 'Vessel approach', time: '1m', icon: '🚢' });
            s[d.id] = { dets, rec: d.status === 'Online' && Math.random() > 0.3, nv: false, paused: false, muted: true, vol: 60, audioLv: 20 + Math.floor(Math.random() * 40), fps: d.resolution?.includes('4K') ? 25 + Math.floor(Math.random() * 6) : 28 + Math.floor(Math.random() * 3), bitrate: d.resolution?.includes('4K') ? `${12 + Math.floor(Math.random() * 8)}M` : `${4 + Math.floor(Math.random() * 4)}M`, bw: d.status === 'Online' ? (d.resolution?.includes('4K') ? 12 + Math.random() * 8 : 4 + Math.random() * 4) : 0, alerts, zoom: 1, playbackRate: 1 };
        });
        setCams(s);
    }, []);

    useEffect(() => { const i = setInterval(() => setCams(p => { const n = { ...p }; Object.keys(n).forEach(k => { const id = +k; if (allCams.find(c => c.id === id)?.status === 'Online' && !n[id].paused) n[id] = { ...n[id], fps: Math.max(20, Math.min(32, n[id].fps + Math.floor(Math.random() * 3) - 1)), audioLv: Math.max(0, Math.min(100, n[id].audioLv + Math.floor(Math.random() * 20) - 10)), bw: Math.max(2, n[id].bw + (Math.random() * 2 - 1)) }; }); return n; }), 2000); return () => clearInterval(i); }, []);

    const upCam = useCallback((id: number, patch: Partial<CamState>) => setCams(p => ({ ...p, [id]: { ...p[id], ...patch } })), []);

    const filtered = allCams.filter(d => {
        if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.locationName.toLowerCase().includes(search.toLowerCase())) return false;
        if (statusF !== 'all' && d.status.toLowerCase() !== statusF) return false;
        if (groupF !== 'all') { const g = camGroups.find(gr => gr.id === groupF); if (g && 'ids' in g) return (g as any).ids.includes(d.id); }
        return true;
    });

    const cols = layout === '1x1' ? 1 : layout === '2x2' ? 2 : layout === '3x3' ? 3 : 4;
    const sc = { on: allCams.filter(d => d.status === 'Online').length, off: allCams.filter(d => d.status === 'Offline').length };
    const alertC = Object.values(cams).reduce((s, m) => s + m.alerts.length, 0);
    const totalBw = Object.values(cams).reduce((s, m) => s + m.bw, 0);

    const openPopup = (dev: Device) => {
        const w = window.open('', `cam-${dev.id}`, 'width=960,height=540,toolbar=no,menubar=no');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><title>ARGUX — ${dev.name}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;overflow:hidden;font-family:system-ui}video{width:100vw;height:100vh;object-fit:cover}.hud{position:fixed;top:0;left:0;right:0;padding:8px 14px;background:linear-gradient(rgba(0,0,0,0.8),transparent);display:flex;align-items:center;gap:8px;color:#fff;z-index:10;font-size:12px}.hud .n{font-weight:800}.hud .l{font-size:9px;color:rgba(255,255,255,0.5)}.d{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:p 2s infinite}@keyframes p{0%,100%{opacity:1}50%{opacity:.3}}.lv{font-size:8px;font-weight:800;background:rgba(239,68,68,0.85);padding:2px 6px;border-radius:3px}.bb{position:fixed;bottom:0;left:0;right:0;padding:6px 14px;background:linear-gradient(transparent,rgba(0,0,0,0.8));display:flex;gap:8px;color:rgba(255,255,255,0.5);font-size:9px;font-family:monospace}</style></head><body><div class="hud"><div class="d"></div><span class="n">${dev.name}</span><span class="l">${dev.locationName}</span><span class="lv">● LIVE</span></div><video src="${VIDEO_SRC}" autoplay muted loop playsinline></video><div class="bb"><span>${dev.resolution?.split(' ')[0]||'1080p'}</span><span>${dev.protocol}</span><span>${dev.ipAddress}</span><span style="margin-left:auto;color:#ef4444;font-weight:700">CLASSIFIED</span></div></body></html>`);
        w.document.close();
    };

    const takeSnap = useCallback((dev: Device) => {
        const canvas = canvasRefs.current[dev.id];
        if (!canvas) return;
        const a = document.createElement('a');
        a.download = `ARGUX-${dev.name.replace(/\s/g, '-')}-${Date.now()}.png`;
        a.href = canvas.toDataURL('image/png'); a.click();
    }, []);

    // ═══ CAMERA TILE (canvas-based) ═══
    const Tile = ({ dev }: { dev: Device }) => {
        const cam = cams[dev.id];
        const on = dev.status === 'Online';
        const fs = fsCam === dev.id;
        const [hov, setHov] = useState(false);
        const tc = deviceTypeColors[dev.type as keyof typeof deviceTypeColors] || '#6b7280';
        const stc = on ? '#22c55e' : dev.status === 'Maintenance' ? '#f59e0b' : dev.status === 'Standby' ? '#06b6d4' : '#ef4444';
        const nv = gNV || cam?.nv;
        const isPtz = PTZ_IDS.includes(dev.id);

        const setCanvasRef = useCallback((el: HTMLCanvasElement | null) => { canvasRefs.current[dev.id] = el; if (el) { el.width = 640; el.height = 360; } }, [dev.id]);

        const HBtn = ({ icon, active, fn, tip }: { icon: string; active?: boolean; fn: () => void; tip: string }) => <button onClick={e => { e.stopPropagation(); fn(); }} title={tip} style={{ width: fs ? 28 : 22, height: fs ? 28 : 22, borderRadius: 3, border: 'none', background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs ? 11 : 9, backdropFilter: 'blur(2px)', flexShrink: 0 }}>{icon}</button>;

        return <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={() => { setSelCam(dev.id); if (!sideP) setSideP('detail'); }} onDoubleClick={() => setFsCam(fs ? null : dev.id)} style={{
            overflow: 'hidden', background: '#000', cursor: 'pointer', transition: 'border-color 0.15s',
            border: `1px solid ${selCam === dev.id ? theme.accent + '40' : 'rgba(255,255,255,0.04)'}`,
            ...(fs ? { position: 'fixed' as const, inset: 0, zIndex: 200, borderRadius: 0 } : { position: 'relative' as const, borderRadius: 4, aspectRatio: '16/9' }),
        }}>
            {/* Canvas stream (painted from shared video) */}
            {on ? <canvas ref={setCanvasRef} style={{ width: '100%', height: '100%', display: 'block', filter: nv ? 'brightness(1.5) contrast(1.2)' : 'none', opacity: cam?.paused ? 0.25 : 1, transition: 'opacity 0.3s, filter 0.3s' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#080c14,#111827)' }}>
                <div style={{ fontSize: 18, opacity: 0.2 }}>{dev.status === 'Offline' ? '📵' : dev.status === 'Maintenance' ? '🔧' : '💤'}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: stc, marginTop: 3 }}>{dev.status.toUpperCase()}</div>
            </div>}

            {on && cam?.paused && <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, pointerEvents: 'none' as const }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>⏸</div></div>}

            {/* AI boxes */}
            {showAi && on && !cam?.paused && cam?.dets.map(d => <div key={d.id} style={{ position: 'absolute' as const, left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%`, border: `1.5px solid ${d.color}70`, borderRadius: 2, zIndex: 3, pointerEvents: 'none' as const }}>
                <div style={{ position: 'absolute' as const, top: -11, left: -1, padding: '0 3px', borderRadius: '2px 2px 0 0', background: `${d.color}cc`, fontSize: 9, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' as const, lineHeight: '10px' }}>{d.type === 'lpr' ? `🚗 ${d.label}` : d.type === 'face' ? `🧑 ${d.conf}%` : d.type === 'vehicle' ? `🚗 ${d.conf}%` : `👤 ${d.conf}%`}</div>
            </div>)}

            {/* Motion zones */}
            {motionZones.filter(mz => mz.camId === dev.id).map(mz => <div key={mz.id} style={{ position: 'absolute' as const, left: `${mz.x}%`, top: `${mz.y}%`, width: `${mz.w}%`, height: `${mz.h}%`, border: `1.5px dashed ${mz.type === 'include' ? '#22c55e' : '#ef4444'}60`, background: `${mz.type === 'include' ? '#22c55e' : '#ef4444'}08`, borderRadius: 2, zIndex: 2, pointerEvents: 'none' as const }}><div style={{ position: 'absolute' as const, bottom: -10, left: 0, fontSize: 9, padding: '0 2px', borderRadius: 1, background: mz.type === 'include' ? '#22c55e99' : '#ef444499', color: '#fff', fontWeight: 700 }}>{mz.type === 'include' ? 'MOTION' : 'EXCLUDE'}</div></div>)}

            {/* Waveform */}
            {showWave && on && !cam?.paused && cam && cam.audioLv > 10 && <div style={{ position: 'absolute' as const, bottom: 13, left: 4, zIndex: 4, display: 'flex', gap: 1, alignItems: 'flex-end', height: 10, opacity: 0.5 }}>
                {waveRef.current.map((v, i) => <div key={i} style={{ width: 2, height: `${Math.max(8, v * (cam.audioLv / 100))}%`, background: cam.audioLv > 70 ? '#ef4444' : '#22c55e', borderRadius: 1 }} />)}
            </div>}

            {/* Top-left: info */}
            {showInfo && <div style={{ position: 'absolute' as const, top: 3, left: 3, zIndex: 4, maxWidth: '55%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: stc, boxShadow: on ? `0 0 3px ${stc}50` : 'none', animation: on && !cam?.paused ? 'argux-pulse 2s ease-in-out infinite' : 'none', flexShrink: 0 }} />
                    <span style={{ fontSize: fs ? 13 : 7, fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{dev.name}</span>
                    {isPtz && <span style={{ fontSize: 9, padding: '0 2px', borderRadius: 1, background: '#06b6d4aa', color: '#fff', fontWeight: 700 }}>PTZ</span>}
                </div>
                <div style={{ fontSize: fs ? 9 : 5, color: 'rgba(255,255,255,0.4)', textShadow: '0 1px 2px rgba(0,0,0,0.9)', marginTop: 1 }}>{dev.locationName.split(',')[0]}</div>
            </div>}

            {/* Top-right: badges */}
            <div style={{ position: 'absolute' as const, top: 3, right: 3, zIndex: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {on && !cam?.paused && <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 3px', borderRadius: 2, background: 'rgba(239,68,68,0.85)', color: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}><div style={{ width: 3, height: 3, borderRadius: '50%', background: '#fff', animation: 'argux-pulse 1.5s ease-in-out infinite' }} />LIVE</span>}
                {(gRec || cam?.rec) && on && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 3px', borderRadius: 2, background: 'rgba(239,68,68,0.65)', color: '#fff' }}>REC</span>}
                {nv && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 3px', borderRadius: 2, background: 'rgba(34,197,94,0.65)', color: '#fff' }}>NV</span>}
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 3px', borderRadius: 2, background: `${tc}aa`, color: '#fff' }}>{dev.type.replace(' Camera', '')}</span>
            </div>

            {/* Bottom-right: stats */}
            {showInfo && on && cam && !cam.paused && <div style={{ position: 'absolute' as const, bottom: 3, right: 3, zIndex: 4, display: 'flex', gap: 2 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', padding: '0 2px', borderRadius: 1, background: 'rgba(0,0,0,0.4)', fontFamily: "'JetBrains Mono',monospace" }}>{cam.fps}fps</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', padding: '0 2px', borderRadius: 1, background: 'rgba(0,0,0,0.4)', fontFamily: "'JetBrains Mono',monospace" }}>{cam.bw.toFixed(1)}M</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', padding: '0 2px', borderRadius: 1, background: 'rgba(0,0,0,0.4)', fontFamily: "'JetBrains Mono',monospace" }}>{clock}</span>
            </div>}

            {/* Alert */}
            {showAlerts && cam?.alerts.length > 0 && <div style={{ position: 'absolute' as const, bottom: fs ? 26 : 13, right: 3, zIndex: 4 }}>
                {cam.alerts.slice(0, 1).map(a => <div key={a.id} style={{ padding: '1px 4px', borderRadius: 2, background: `${a.sev === 'critical' ? '#ef4444' : a.sev === 'high' ? '#f97316' : '#f59e0b'}dd`, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}><span>{a.icon}</span><span>{a.title}</span></div>)}
            </div>}

            {/* Hover controls */}
            {hov && on && cam && <div onClick={e => e.stopPropagation()} style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, zIndex: 6, padding: '14px 6px 3px', background: 'linear-gradient(transparent,rgba(0,0,0,0.75) 40%)', display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                <HBtn icon={cam.paused ? '▶' : '⏸'} fn={() => upCam(dev.id, { paused: !cam.paused })} tip="Play/Pause" />
                <HBtn icon={cam.muted || gMute ? '🔇' : '🔊'} active={!cam.muted && !gMute} fn={() => upCam(dev.id, { muted: !cam.muted })} tip="Audio" />
                <HBtn icon="⏺" active={cam.rec} fn={() => upCam(dev.id, { rec: !cam.rec })} tip="Record" />
                <HBtn icon="🌙" active={cam.nv} fn={() => upCam(dev.id, { nv: !cam.nv })} tip="NV" />
                <HBtn icon="🖼️" fn={() => takeSnap(dev)} tip="Snapshot" />
                <HBtn icon="⛶" fn={() => setFsCam(fs ? null : dev.id)} tip="Fullscreen" />
                <HBtn icon="🪟" fn={() => openPopup(dev)} tip="Popup" />
                {isPtz && <HBtn icon="🎛️" active={sideP === 'ptz'} fn={() => { setSelCam(dev.id); setSideP('ptz'); }} tip="PTZ" />}
            </div>}

            {fs && <button onClick={e => { e.stopPropagation(); setFsCam(null); }} style={{ position: 'absolute' as const, top: 8, right: 8, zIndex: 10, width: 28, height: 28, borderRadius: 5, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>}
        </div>;
    };

    // Section header helper
    const Sec = ({ label }: { label: string }) => <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.08em', padding: '6px 10px 2px' }}>{label}</div>;
    const LBtn = ({ icon, label, active, fn }: { icon: string; label: string; active?: boolean; fn: () => void }) => <button onClick={fn} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 10px', border: 'none', borderRadius: 0, background: active ? `${theme.accent}08` : 'transparent', color: active ? theme.accent : theme.textDim, cursor: 'pointer', fontSize: 8, fontWeight: active ? 700 : 500, fontFamily: 'inherit', textAlign: 'left' as const, borderLeft: `2px solid ${active ? theme.accent : 'transparent'}`, transition: 'all 0.1s' }}><span style={{ fontSize: 10, width: 14, textAlign: 'center' as const }}>{icon}</span>{label}</button>;

    return (<>
        <PageMeta title="Vision — Camera Wall" />
        {/* Hidden shared video — single WebMediaPlayer */}
        <video ref={sharedVideoRef} src={VIDEO_SRC} muted loop playsInline preload="auto" style={{ position: 'fixed' as const, top: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' as const }} />

        <div className="vis-page" data-testid="vision-page">

            {/* Mobile bar */}
            <div className="vis-mobile-bar">
                <select value={layout} onChange={e => { setLayout(e.target.value as Grid); setViewMap(false); trigger(); }} style={{ padding: '7px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}>{(['1x1', '2x2', '3x3', '4x4'] as Grid[]).map(l => <option key={l} value={l}>{l}</option>)}</select>
                <select value={groupF} onChange={e => { setGroupF(e.target.value); trigger(); }} style={{ flex: 1, padding: '7px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit' }}>{camGroups.map(g => <option key={g.id} value={g.id}>{g.icon} {g.label}</option>)}</select>
                <button onClick={() => setShowAi(p => !p)} style={{ padding: '7px 10px', borderRadius: 6, border: `1px solid ${showAi ? theme.accent + '40' : theme.border}`, background: showAi ? `${theme.accent}08` : 'transparent', color: showAi ? theme.accent : theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>🤖</button>
            </div>

            {/* ═══ LEFT SIDEBAR ═══ */}
            {leftOpen && <div className="vis-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                {/* Header */}
                <div style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 4, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>📹</div>
                    <div><div style={{ fontSize: 10, fontWeight: 800, color: theme.text, letterSpacing: '0.06em' }}>VISION</div><div style={{ fontSize: 8, color: theme.textDim }}>SURVEILLANCE WALL</div></div>
                </div>

                {/* Status chips */}
                <div style={{ padding: '4px 10px', display: 'flex', gap: 3 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', fontFamily: "'JetBrains Mono',monospace" }}>●{sc.on}</span>
                    {sc.off > 0 && <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>●{sc.off}</span>}
                    {alertC > 0 && <span style={{ fontSize: 9, fontWeight: 800, color: '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>🚨{alertC}</span>}
                    <span style={{ marginLeft: 'auto', fontSize: 8, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{clock}</span>
                </div>

                {/* Search */}
                <div style={{ padding: '0 10px 4px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 3, padding: '0 5px' }}>
                        <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '3px 0', color: theme.text, fontSize: 8, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                {/* Groups */}
                <Sec label="Camera Groups" />
                {camGroups.map(g => <LBtn key={g.id} icon={g.icon} label={g.label} active={groupF === g.id} fn={() => setGroupF(g.id)} />)}

                {/* Layout */}
                <Sec label="Grid Layout" />
                <div style={{ padding: '0 10px 4px', display: 'flex', gap: 2 }}>
                    {(['1x1', '2x2', '3x3', '4x4'] as Grid[]).map(l => <button key={l} onClick={() => { setLayout(l); setViewMap(false); }} style={{ flex: 1, padding: '3px', borderRadius: 3, border: `1px solid ${layout === l && !viewMap ? theme.accent + '40' : theme.border}`, background: layout === l && !viewMap ? `${theme.accent}08` : 'transparent', color: layout === l && !viewMap ? theme.accent : theme.textDim, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace" }}>{l}</button>)}
                </div>
                <LBtn icon="🗺️" label="Map View" active={viewMap} fn={() => setViewMap(!viewMap)} />

                {/* Overlays */}
                <Sec label="Overlays" />
                <LBtn icon="🤖" label="AI Detections" active={showAi} fn={() => setShowAi(p => !p)} />
                <LBtn icon="ℹ️" label="Camera Info" active={showInfo} fn={() => setShowInfo(p => !p)} />
                <LBtn icon="🚨" label="Alert Badges" active={showAlerts} fn={() => setShowAlerts(p => !p)} />
                <LBtn icon="〰️" label="Waveform" active={showWave} fn={() => setShowWave(p => !p)} />

                {/* Global controls */}
                <Sec label="Global" />
                <LBtn icon={gMute ? '🔇' : '🔊'} label={gMute ? 'Audio Off' : 'Audio On'} active={!gMute} fn={() => setGMute(p => !p)} />
                <LBtn icon="⏺" label={gRec ? 'Rec All ON' : 'Rec All'} active={gRec} fn={() => setGRec(p => !p)} />
                <LBtn icon="🌙" label={gNV ? 'NV Active' : 'Night Vision'} active={gNV} fn={() => setGNV(p => !p)} />
                <LBtn icon="🔗" label={syncPlay ? 'Sync ON' : 'Sync Playback'} active={syncPlay} fn={() => setSyncPlay(p => !p)} />

                {/* Panels */}
                <Sec label="Panels" />
                <LBtn icon="🧑" label={`Face Queue (${mockFaces.length})`} active={sideP === 'faces'} fn={() => setSideP(p => p === 'faces' ? null : 'faces')} />
                <LBtn icon="📊" label={`Bandwidth ${totalBw.toFixed(0)}M`} active={sideP === 'bandwidth'} fn={() => setSideP(p => p === 'bandwidth' ? null : 'bandwidth')} />
                <LBtn icon="💾" label="Presets" active={sideP === 'presets'} fn={() => setSideP(p => p === 'presets' ? null : 'presets')} />
                <LBtn icon="⏱️" label="Recording" active={sideP === 'timeline'} fn={() => setSideP(p => p === 'timeline' ? null : 'timeline')} />
                <LBtn icon="🎯" label="Motion Zones" active={sideP === 'motionZones'} fn={() => setSideP(p => p === 'motionZones' ? null : 'motionZones')} />
                <LBtn icon="🎛️" label="PTZ Control" active={sideP === 'ptz'} fn={() => setSideP(p => p === 'ptz' ? null : 'ptz')} />

                <div style={{ marginTop: 'auto', padding: '6px 12px', borderTop: `1px solid ${theme.border}`, fontSize: 9, color: theme.textDim }}>
                    {filtered.length}/{allCams.length} cameras
                </div>
            </div>}

            {/* ═══ CENTER: GRID or MAP ═══ */}
            <div className="vis-center">
                {/* Collapse toggle */}
                <div style={{ position: 'absolute' as const, top: 'calc(50% + 28px)', left: leftOpen ? 170 : 0, zIndex: 50, transform: 'translateY(-50%)' }}>
                    <button onClick={() => setLeftOpen(p => !p)} style={{ width: 14, height: 28, borderRadius: '0 4px 4px 0', border: `1px solid ${theme.border}`, borderLeft: 'none', background: theme.bgCard, color: theme.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>{leftOpen ? '◀' : '▶'}</button>
                </div>

                {loading ? <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2, padding: 2, alignContent: 'start', background: '#060810' }}>{Array.from({ length: cols * cols }).map((_, i) => <div key={i} className="vis-skeleton" style={{ aspectRatio: '16/9', borderRadius: 4 }} />)}</div>
                : !viewMap ? <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2, padding: 2, overflow: 'auto', alignContent: 'start', background: '#060810' }}>
                    {filtered.length === 0 && <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: 40 }}><div style={{ fontSize: 24, opacity: 0.2 }}>📹</div><div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>No cameras match</div></div>}
                    {filtered.map(d => <Tile key={d.id} dev={d} />)}
                </div> : <div style={{ flex: 1, background: '#0a0e16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%', maxWidth: 900 }}>
                        <rect width="800" height="400" fill="#0a0e16" />
                        <text x="400" y="25" textAnchor="middle" fill={theme.textDim} fontSize="10" fontWeight="700">CAMERA NETWORK — GLOBAL</text>
                        <ellipse cx="200" cy="180" rx="120" ry="80" fill="none" stroke={theme.border} strokeWidth="0.5" />
                        <ellipse cx="350" cy="150" rx="80" ry="90" fill="none" stroke={theme.border} strokeWidth="0.5" />
                        <ellipse cx="550" cy="170" rx="100" ry="70" fill="none" stroke={theme.border} strokeWidth="0.5" />
                        {allCams.map(d => {
                            const x = (((d.lng ?? 0) + 180) / 360) * 700 + 50;
                            const y = ((90 - (d.lat ?? 0)) / 180) * 350 + 25;
                            const c = d.status === 'Online' ? '#22c55e' : '#ef4444';
                            return <g key={d.id} onClick={() => { setSelCam(d.id); setSideP('detail'); }} style={{ cursor: 'pointer' }}>
                                {selCam === d.id && <circle cx={x} cy={y} r="14" fill="none" stroke={theme.accent} strokeWidth="1" opacity="0.4" />}
                                <path d={`M${x},${y} L${x-12},${y-20} L${x+12},${y-20} Z`} fill={`${c}15`} stroke={`${c}30`} strokeWidth="0.5" />
                                <circle cx={x} cy={y} r={selCam === d.id ? 5 : 3.5} fill={c} stroke="#000" strokeWidth="1" />
                                <text x={x} y={y+11} textAnchor="middle" fill={theme.textDim} fontSize="4.5" fontWeight="600">{d.name.length > 16 ? d.name.slice(0, 16) + '…' : d.name}</text>
                            </g>;
                        })}
                    </svg>
                </div>}

                {/* Sync timeline */}
                {syncPlay && <div style={{ padding: '3px 10px', borderTop: `1px solid ${theme.border}`, background: theme.bg, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 9, color: theme.textDim }}>00:00</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 3, background: `${theme.border}30`, position: 'relative' as const, overflow: 'hidden', cursor: 'pointer' }} onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setTlCursor(Math.round(((e.clientX - r.left) / r.width) * 100)); }}>
                        {tlSegs.map((seg, i) => <div key={i} style={{ position: 'absolute' as const, left: `${seg.s}%`, width: `${seg.e - seg.s}%`, height: '100%', background: seg.c, opacity: 0.5 }} />)}
                        <div style={{ position: 'absolute' as const, left: `${tlCursor}%`, top: 0, bottom: 0, width: 2, background: '#fff', borderRadius: 1, transform: 'translateX(-1px)', boxShadow: '0 0 4px rgba(255,255,255,0.5)' }} />
                    </div>
                    <span style={{ fontSize: 9, color: theme.textDim }}>24:00</span>
                </div>}

                {/* Bottom bar */}
                <div style={{ padding: '2px 10px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, fontSize: 9, color: theme.textDim, background: theme.bg }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 3px #22c55e50' }} /><span style={{ fontWeight: 600, color: '#22c55e' }}>Online</span>
                    <span>·</span><span>{sc.on} live · {Object.values(cams).filter(m => m.rec).length} rec · BW: {totalBw.toFixed(0)}M/120M</span>
                    <div style={{ flex: 1 }} /><span>RTSP/ONVIF · AES-256</span>
                </div>
            </div>

            {/* ═══ RIGHT PANEL ═══ */}
            {sideP && <div className="vis-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard }}>
                <div style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 10 }}>{sideP === 'detail' ? '📹' : sideP === 'faces' ? '🧑' : sideP === 'bandwidth' ? '📊' : sideP === 'presets' ? '💾' : sideP === 'ptz' ? '🎛️' : sideP === 'timeline' ? '⏱️' : '🎯'}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: theme.text, flex: 1 }}>{sideP === 'detail' ? (allCams.find(c => c.id === selCam)?.name || 'Select cam') : sideP === 'faces' ? 'Face Queue' : sideP === 'bandwidth' ? 'Bandwidth' : sideP === 'presets' ? 'Presets' : sideP === 'ptz' ? 'PTZ Control' : sideP === 'timeline' ? 'Recording' : 'Motion Zones'}</span>
                    <button onClick={() => setSideP(null)} style={{ width: 16, height: 16, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                {/* Detail */}
                {sideP === 'detail' && selCam && (() => { const d = allCams.find(c => c.id === selCam); const m = cams[selCam]; if (!d || !m) return null; return <>
                    <div style={{ padding: '4px 10px', borderBottom: `1px solid ${theme.border}`, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2 }}>
                        {[{ i: m.paused ? '▶' : '⏸', fn: () => upCam(d.id, { paused: !m.paused }) }, { i: m.muted ? '🔇' : '🔊', fn: () => upCam(d.id, { muted: !m.muted }) }, { i: '⏺', fn: () => upCam(d.id, { rec: !m.rec }) }, { i: '🌙', fn: () => upCam(d.id, { nv: !m.nv }) }, { i: '⛶', fn: () => setFsCam(d.id) }, { i: '🪟', fn: () => openPopup(d) }].map((a, i) => <button key={i} onClick={a.fn} style={{ padding: '2px', borderRadius: 2, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, cursor: 'pointer' }}>{a.i}</button>)}
                    </div>
                    <div style={{ padding: '3px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ fontSize: 8, color: theme.textDim }}>Vol</span><input type="range" min={0} max={100} value={m.vol} onChange={e => upCam(d.id, { vol: parseInt(e.target.value) })} style={{ flex: 1, height: 2, accentColor: '#3b82f6' }} /><span style={{ fontSize: 9, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace", width: 20 }}>{m.vol}%</span></div>
                    <div style={{ padding: '5px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                        {[{ l: 'Location', v: d.locationName }, { l: 'Device', v: `${d.manufacturer} ${d.model}` }, { l: 'Resolution', v: d.resolution || '—' }, { l: 'Protocol', v: d.protocol }, { l: 'IP', v: d.ipAddress }, { l: 'Signal', v: `${d.signalStrength}%` }, { l: 'Stream', v: `${m.fps}fps · ${m.bw.toFixed(1)}M` }, { l: 'Storage', v: d.storageCapacity || '—' }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}><span style={{ fontSize: 9, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 9, color: theme.text, textAlign: 'right' as const }}>{r.v}</span></div>)}
                    </div>
                    {m.dets.length > 0 && <div style={{ padding: '5px 10px', borderBottom: `1px solid ${theme.border}` }}><div style={{ fontSize: 9, fontWeight: 700, color: theme.accent, marginBottom: 2 }}>🤖 AI</div>{m.dets.map(det => <div key={det.id} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 0', fontSize: 9 }}><span>{det.type === 'face' ? '🧑' : det.type === 'vehicle' ? '🚗' : det.type === 'lpr' ? '🔢' : '👤'}</span><span style={{ color: theme.text, flex: 1 }}>{det.personName || det.type}</span><span style={{ fontWeight: 700, color: det.conf >= 90 ? '#22c55e' : '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{det.conf}%</span></div>)}</div>}
                    {m.alerts.length > 0 && <div style={{ padding: '5px 10px', borderBottom: `1px solid ${theme.border}` }}><div style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', marginBottom: 2 }}>🚨 Alerts</div>{m.alerts.map(a => <div key={a.id} style={{ padding: '2px 3px', marginBottom: 1, borderRadius: 2, background: `${a.sev === 'critical' ? '#ef4444' : '#f97316'}08`, fontSize: 8, color: theme.text, display: 'flex', gap: 2 }}><span>{a.icon}</span>{a.title}</div>)}</div>}
                    <div style={{ padding: '5px 10px', marginTop: 'auto', display: 'flex', gap: 2 }}><a href={`/devices/${d.id}`} style={{ fontSize: 8, padding: '2px 5px', borderRadius: 2, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>📡 Device</a><a href="/map" style={{ fontSize: 8, padding: '2px 5px', borderRadius: 2, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none' }}>🗺️ Map</a></div>
                </>; })()}

                {/* Faces */}
                {sideP === 'faces' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {mockFaces.map(f => <div key={f.id} onClick={() => { setSelCam(f.camId); setSideP('detail'); }} style={{ padding: '4px 10px', borderBottom: `1px solid ${theme.border}08`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${f.conf >= 90 ? '#22c55e' : '#f59e0b'}15`, border: `1.5px solid ${f.conf >= 90 ? '#22c55e' : '#f59e0b'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0 }}>🧑</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 8, fontWeight: 700, color: theme.text }}>{f.personName}</div><div style={{ fontSize: 8, color: theme.textDim }}>{f.camName} · {f.time}</div></div>
                        <span style={{ fontSize: 8, fontWeight: 800, color: f.conf >= 90 ? '#22c55e' : '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{f.conf}%</span>
                    </div>)}
                </div>}

                {/* Bandwidth */}
                {sideP === 'bandwidth' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    <div style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: totalBw > 80 ? '#ef4444' : '#22c55e', fontFamily: "'JetBrains Mono',monospace" }}>{totalBw.toFixed(1)} <span style={{ fontSize: 8, color: theme.textDim }}>Mbps</span></div>
                        <div style={{ height: 4, borderRadius: 2, background: `${theme.border}30`, marginTop: 3, overflow: 'hidden' }}><div style={{ width: `${Math.min(100, (totalBw / 120) * 100)}%`, height: '100%', background: totalBw > 80 ? '#ef4444' : '#22c55e', borderRadius: 2 }} /></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: theme.textDim, marginTop: 1 }}><span>0</span><span>120 Mbps</span></div>
                    </div>
                    {allCams.filter(d => d.status === 'Online').sort((a, b) => (cams[b.id]?.bw || 0) - (cams[a.id]?.bw || 0)).map(d => { const m = cams[d.id]; return m ? <div key={d.id} style={{ padding: '2px 10px', display: 'flex', alignItems: 'center', gap: 3, borderBottom: `1px solid ${theme.border}06` }}>
                        <span style={{ fontSize: 9, color: theme.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.name}</span>
                        <div style={{ width: 35, height: 3, borderRadius: 1, background: `${theme.border}30`, overflow: 'hidden' }}><div style={{ width: `${(m.bw / 20) * 100}%`, height: '100%', background: m.bw > 15 ? '#ef4444' : '#22c55e' }} /></div>
                        <span style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace", width: 28, textAlign: 'right' as const }}>{m.bw.toFixed(1)}M</span>
                    </div> : null; })}
                </div>}

                {/* Presets */}
                {sideP === 'presets' && <div style={{ flex: 1, overflowY: 'auto' }}>
                    {presets.map(p => <div key={p.id} onClick={() => { setLayout(p.layout as Grid); setGroupF(p.group); setViewMap(false); }} style={{ padding: '5px 10px', borderBottom: `1px solid ${theme.border}08`, cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span style={{ fontSize: 10 }}>💾</span>
                        <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.text }}>{p.name}</div><div style={{ fontSize: 8, color: theme.textDim }}>{p.layout} · {camGroups.find(g => g.id === p.group)?.label}</div></div>
                    </div>)}
                    <div style={{ padding: '6px 10px' }}><button onClick={() => setPresets(p => [...p, { id: `p-${Date.now()}`, name: `Custom ${presets.length + 1}`, layout, group: groupF }])} style={{ width: '100%', padding: '4px', borderRadius: 3, border: `1px dashed ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit' }}>+ Save Current</button></div>
                </div>}

                {/* PTZ */}
                {sideP === 'ptz' && <div style={{ flex: 1, padding: 10, display: 'flex', flexDirection: 'column' as const, gap: 8, alignItems: 'center' }}>
                    <div style={{ fontSize: 9, color: theme.textDim }}>{allCams.find(c => c.id === selCam)?.name || 'Select PTZ cam'}</div>
                    <div style={{ width: 100, height: 100, borderRadius: '50%', border: `2px solid ${theme.border}`, background: `${theme.border}10`, position: 'relative' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {[{ d: 'up', x: 50, y: 10, i: '▲' }, { d: 'dn', x: 50, y: 80, i: '▼' }, { d: 'lt', x: 10, y: 50, i: '◀' }, { d: 'rt', x: 80, y: 50, i: '▶' }].map(b => <button key={b.d} onMouseDown={() => { if (b.d === 'up') setPtzTilt(p => Math.min(90, p + 10)); if (b.d === 'dn') setPtzTilt(p => Math.max(-90, p - 10)); if (b.d === 'lt') setPtzPan(p => p - 15); if (b.d === 'rt') setPtzPan(p => p + 15); }} style={{ position: 'absolute' as const, left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%,-50%)', width: 20, height: 20, borderRadius: 3, border: `1px solid ${theme.border}`, background: '#06b6d408', color: '#06b6d4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>{b.i}</button>)}
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#06b6d4' }}>PTZ</span>
                    </div>
                    <div style={{ fontSize: 8, color: theme.textDim }}>P: <span style={{ color: '#06b6d4', fontWeight: 700 }}>{ptzPan}°</span> T: <span style={{ color: '#06b6d4', fontWeight: 700 }}>{ptzTilt}°</span></div>
                    <div style={{ width: '100%' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: theme.textDim, marginBottom: 2 }}><span>Zoom</span><span style={{ color: '#a855f7', fontWeight: 700 }}>{ptzZoom.toFixed(1)}×</span></div><input type="range" min={1} max={30} step={0.5} value={ptzZoom} onChange={e => setPtzZoom(parseFloat(e.target.value))} style={{ width: '100%', height: 3, accentColor: '#a855f7' }} /></div>
                    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
                        {['Home', 'Gate', 'Dock', 'Road', 'Fence', 'Custom'].map(p => <button key={p} onClick={() => { setPtzPan(0); setPtzTilt(0); setPtzZoom(1); }} style={{ padding: '3px', borderRadius: 2, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, cursor: 'pointer' }}>{p}</button>)}
                    </div>
                </div>}

                {/* Timeline */}
                {sideP === 'timeline' && <div style={{ flex: 1, padding: 10, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                    <div style={{ fontSize: 9, color: theme.textDim }}>24h Recording</div>
                    {allCams.filter(d => d.status === 'Online').slice(0, 6).map(d => <div key={d.id}>
                        <div style={{ fontSize: 8, color: theme.textDim, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.name}</div>
                        <div style={{ height: 5, borderRadius: 2, background: `${theme.border}20`, position: 'relative' as const, overflow: 'hidden' }}>
                            {tlSegs.map((seg, i) => <div key={i} style={{ position: 'absolute' as const, left: `${seg.s}%`, width: `${seg.e - seg.s}%`, height: '100%', background: seg.c, opacity: 0.5 }} />)}
                        </div>
                    </div>)}
                    <div style={{ marginTop: 'auto', fontSize: 8, color: theme.textDim }}>
                        {[{ c: '#22c55e', l: 'Rec' }, { c: '#ef4444', l: 'Alert' }, { c: '#f59e0b', l: 'Motion' }].map(lg => <div key={lg.l} style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}><div style={{ width: 6, height: 3, borderRadius: 1, background: lg.c, opacity: 0.5 }} /><span>{lg.l}</span></div>)}
                    </div>
                </div>}

                {/* Motion zones */}
                {sideP === 'motionZones' && <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ padding: '3px 10px', borderBottom: `1px solid ${theme.border}`, fontSize: 9, color: theme.textDim }}>{motionZones.length} zones</div>
                    {motionZones.map(mz => <div key={mz.id} style={{ padding: '4px 10px', borderBottom: `1px solid ${theme.border}08`, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 2, border: `1.5px dashed ${mz.type === 'include' ? '#22c55e' : '#ef4444'}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>{mz.type === 'include' ? '✓' : '✕'}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 9, color: theme.text }}>{allCams.find(c => c.id === mz.camId)?.name}</div><div style={{ fontSize: 8, color: theme.textDim }}>{mz.type} · {mz.w}×{mz.h}%</div></div>
                    </div>)}
                </div>}
            </div>}

            {/* Ctrl+Q */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                    {visShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="vis-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

VisionIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default VisionIndex;
