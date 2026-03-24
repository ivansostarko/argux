import PageMeta from '../../components/layout/PageMeta';
import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockDevices, deviceTypeIcons, deviceTypeColors, type Device } from '../../mock/devices';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Vision  ·  Camera Surveillance Wall
   Multi-stream grid with AI overlays, alerts & per-cam controls
   ═══════════════════════════════════════════════════════════════ */

const VIDEO_SRC = 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/rtl_direkt.mp4';
const cameras: Device[] = mockDevices.filter(d => d.type === 'Public Camera' || d.type === 'Hidden Camera' || d.type === 'Private Camera');

interface AiBox { id: string; type: 'face' | 'person' | 'vehicle' | 'lpr'; label: string; conf: number; x: number; y: number; w: number; h: number; color: string; }
interface CamAlert { id: string; sev: 'critical' | 'high' | 'medium'; title: string; time: string; icon: string; }
interface CamState { dets: AiBox[]; rec: boolean; nv: boolean; paused: boolean; muted: boolean; vol: number; audioLv: number; fps: number; bitrate: string; playbackRate: number; zoom: number; alerts: CamAlert[]; }
type Grid = '1x1' | '2x2' | '3x3' | '4x4';

function VisionIndex() {
    const [layout, setLayout] = useState<Grid>('3x3');
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState('all');
    const [typeF, setTypeF] = useState('all');
    const [selCam, setSelCam] = useState<number | null>(null);
    const [showAlerts, setShowAlerts] = useState(true);
    const [showAi, setShowAi] = useState(true);
    const [showInfo, setShowInfo] = useState(true);
    const [fsCam, setFsCam] = useState<number | null>(null);
    const [gRec, setGRec] = useState(false);
    const [gNV, setGNV] = useState(false);
    const [gMute, setGMute] = useState(true);
    const [clock, setClock] = useState(new Date().toLocaleTimeString('en-GB'));
    useEffect(() => { const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB')), 1000); return () => clearInterval(t); }, []);

    const [cams, setCams] = useState<Record<number, CamState>>({});
    useEffect(() => {
        const s: Record<number, CamState> = {};
        cameras.forEach(d => {
            const dets: AiBox[] = [];
            if (d.status === 'Online') {
                if (Math.random() > 0.3) dets.push({ id: `${d.id}-f`, type: 'face', label: 'Face', conf: 78 + Math.floor(Math.random() * 20), x: 28 + Math.random() * 35, y: 12 + Math.random() * 25, w: 7 + Math.random() * 4, h: 9 + Math.random() * 5, color: '#ec4899' });
                if (Math.random() > 0.5) dets.push({ id: `${d.id}-p`, type: 'person', label: 'Person', conf: 85 + Math.floor(Math.random() * 14), x: 8 + Math.random() * 45, y: 18 + Math.random() * 35, w: 9 + Math.random() * 8, h: 16 + Math.random() * 15, color: '#3b82f6' });
                if (Math.random() > 0.6) dets.push({ id: `${d.id}-v`, type: 'vehicle', label: 'Vehicle', conf: 90 + Math.floor(Math.random() * 9), x: 5 + Math.random() * 55, y: 48 + Math.random() * 25, w: 14 + Math.random() * 10, h: 9 + Math.random() * 8, color: '#22c55e' });
                if (d.notes?.includes('LPR') && Math.random() > 0.4) dets.push({ id: `${d.id}-l`, type: 'lpr', label: 'ZG-1847-AB', conf: 95 + Math.floor(Math.random() * 4), x: 18 + Math.random() * 35, y: 56 + Math.random() * 18, w: 14, h: 6, color: '#f59e0b' });
            }
            const alerts: CamAlert[] = [];
            if (d.id === 1) alerts.push({ id: 'a1', sev: 'critical', title: 'Face Match: Marko Horvat (94%)', time: '2m', icon: '🧑' });
            if (d.id === 8) alerts.push({ id: 'a2', sev: 'high', title: 'Motion in restricted zone', time: '5m', icon: '🏃' });
            if (d.id === 14) alerts.push({ id: 'a3', sev: 'medium', title: 'LPR: ZG-1847-AB', time: '12m', icon: '🚗' });
            if (d.id === 18) alerts.push({ id: 'a4', sev: 'high', title: 'Speed: 142 km/h', time: '8m', icon: '⚠️' });
            if (d.id === 5) alerts.push({ id: 'a5', sev: 'critical', title: 'Unauthorized vessel', time: '1m', icon: '🚢' });
            s[d.id] = { dets, rec: d.status === 'Online' && Math.random() > 0.3, nv: false, paused: false, muted: true, vol: 60, audioLv: d.status === 'Online' ? Math.floor(Math.random() * 60) : 0, fps: d.status === 'Online' ? (d.resolution?.includes('4K') ? 25 + Math.floor(Math.random() * 6) : 28 + Math.floor(Math.random() * 3)) : 0, bitrate: d.resolution?.includes('4K') ? `${12 + Math.floor(Math.random() * 8)}M` : `${4 + Math.floor(Math.random() * 4)}M`, playbackRate: 1, zoom: 1, alerts };
        });
        setCams(s);
    }, []);

    useEffect(() => { const i = setInterval(() => setCams(p => { const n = { ...p }; Object.keys(n).forEach(k => { const id = +k; if (cameras.find(c => c.id === id)?.status === 'Online') n[id] = { ...n[id], fps: Math.max(20, Math.min(32, n[id].fps + Math.floor(Math.random() * 3) - 1)), audioLv: Math.max(0, Math.min(100, n[id].audioLv + Math.floor(Math.random() * 20) - 10)) }; }); return n; }), 2000); return () => clearInterval(i); }, []);

    const upCam = useCallback((id: number, patch: Partial<CamState>) => setCams(p => ({ ...p, [id]: { ...p[id], ...patch } })), []);

    const filtered = cameras.filter(d => {
        if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.locationName.toLowerCase().includes(search.toLowerCase())) return false;
        if (statusF !== 'all' && d.status.toLowerCase() !== statusF) return false;
        if (typeF !== 'all' && d.type !== typeF) return false;
        return true;
    });

    const cols = layout === '1x1' ? 1 : layout === '2x2' ? 2 : layout === '3x3' ? 3 : 4;
    const sc = { on: cameras.filter(d => d.status === 'Online').length, off: cameras.filter(d => d.status === 'Offline').length, mt: cameras.filter(d => d.status === 'Maintenance').length, sb: cameras.filter(d => d.status === 'Standby').length };
    const alertC = Object.values(cams).reduce((s, m) => s + m.alerts.length, 0);

    const takeSnap = useCallback((dev: Device, v: HTMLVideoElement | null) => {
        if (!v) return;
        const c = document.createElement('canvas');
        c.width = v.videoWidth || 1920; c.height = v.videoHeight || 1080;
        c.getContext('2d')?.drawImage(v, 0, 0);
        const a = document.createElement('a');
        a.download = `ARGUX-${dev.name.replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.png`;
        a.href = c.toDataURL('image/png'); a.click();
    }, []);

    // ═══ CAMERA TILE ═══
    const Tile = ({ dev }: { dev: Device }) => {
        const cam = cams[dev.id];
        const on = dev.status === 'Online';
        const fs = fsCam === dev.id;
        const vr = useRef<HTMLVideoElement>(null);
        const [hov, setHov] = useState(false);
        const tc = deviceTypeColors[dev.type as keyof typeof deviceTypeColors] || '#6b7280';
        const stc = on ? '#22c55e' : dev.status === 'Maintenance' ? '#f59e0b' : dev.status === 'Standby' ? '#06b6d4' : '#ef4444';
        const nv = gNV || cam?.nv;

        // Video autoplay — muted is required by browser policy
        useEffect(() => {
            const v = vr.current;
            if (!v || !on) return;
            v.muted = true;
            if (cam?.paused) { v.pause(); return; }
            v.play().catch(() => {});
        }, [on, cam?.paused]);

        useEffect(() => { if (vr.current) { vr.current.muted = gMute || (cam?.muted ?? true); vr.current.volume = (cam?.vol ?? 60) / 100; } }, [gMute, cam?.muted, cam?.vol]);
        useEffect(() => { if (vr.current && cam) vr.current.playbackRate = cam.playbackRate; }, [cam?.playbackRate]);

        const HBtn = ({ icon, active, onClick: oc, tip }: { icon: string; active?: boolean; onClick: () => void; tip: string }) => <button onClick={e => { e.stopPropagation(); oc(); }} title={tip} style={{ width: fs ? 30 : 24, height: fs ? 30 : 24, borderRadius: 4, border: 'none', background: active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs ? 12 : 10, backdropFilter: 'blur(3px)', transition: 'background 0.15s', flexShrink: 0 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')} onMouseLeave={e => (e.currentTarget.style.background = active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.1)')}>{icon}</button>;

        return <div className="vision-tile" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={() => setSelCam(dev.id)} onDoubleClick={() => setFsCam(fs ? null : dev.id)} style={{
            overflow: 'hidden',
            border: `1px solid ${selCam === dev.id ? theme.accent + '40' : 'rgba(255,255,255,0.04)'}`,
            background: '#000', cursor: 'pointer', transition: 'border-color 0.15s',
            ...(fs ? { position: 'fixed' as const, inset: 0, zIndex: 200, borderRadius: 0 } : { position: 'relative' as const, borderRadius: 5, aspectRatio: '16/9' }),
        }}>
            {on ? <video ref={vr} src={VIDEO_SRC} autoPlay muted loop playsInline preload="auto" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: nv ? 'grayscale(1) brightness(1.6) contrast(1.3) sepia(0.12)' : 'none', opacity: cam?.paused ? 0.3 : 1, transition: 'filter 0.3s, opacity 0.3s', transform: cam ? `scale(${cam.zoom})` : undefined, transformOrigin: 'center' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #080c14, #111827)' }}>
                <div style={{ fontSize: 20, marginBottom: 4, opacity: 0.25 }}>{dev.status === 'Offline' ? '📵' : dev.status === 'Maintenance' ? '🔧' : '💤'}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: stc }}>{dev.status.toUpperCase()}</div>
                <div style={{ fontSize: 6, color: theme.textDim, marginTop: 1 }}>{dev.status === 'Offline' ? `Since ${dev.lastSeen?.slice(0, 10)}` : dev.notes?.slice(0, 30)}</div>
            </div>}

            {on && cam?.paused && <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, pointerEvents: 'none' as const }}><div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, backdropFilter: 'blur(4px)' }}>⏸</div></div>}

            {showAi && on && !cam?.paused && cam?.dets.map(d => <div key={d.id} style={{ position: 'absolute' as const, left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%`, border: `1.5px solid ${d.color}70`, borderRadius: 2, zIndex: 3, pointerEvents: 'none' as const }}>
                <div style={{ position: 'absolute' as const, top: -12, left: -1, padding: '0px 3px', borderRadius: '2px 2px 0 0', background: `${d.color}cc`, fontSize: 5.5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' as const, lineHeight: '11px' }}>{d.type === 'lpr' ? `🚗 ${d.label}` : d.type === 'face' ? `🧑 ${d.conf}%` : d.type === 'vehicle' ? `🚗 ${d.conf}%` : `👤 ${d.conf}%`}</div>
                {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h], i) => <div key={i} style={{ position: 'absolute' as const, [v]: -1, [h]: -1, width: 4, height: 4, [`border${v === 'top' ? 'Top' : 'Bottom'}`]: `1.5px solid ${d.color}`, [`border${h === 'left' ? 'Left' : 'Right'}`]: `1.5px solid ${d.color}` }} />)}
            </div>)}

            {showInfo && <div style={{ position: 'absolute' as const, top: 4, left: 4, zIndex: 4, maxWidth: '60%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: stc, boxShadow: on ? `0 0 4px ${stc}50` : 'none', animation: on && !cam?.paused ? 'argux-pulse 2s ease-in-out infinite' : 'none', flexShrink: 0 }} /><span style={{ fontSize: fs ? 14 : 7.5, fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{dev.name}</span></div>
                <div style={{ fontSize: fs ? 10 : 5.5, color: 'rgba(255,255,255,0.45)', textShadow: '0 1px 2px rgba(0,0,0,0.9)', marginTop: 1 }}>{dev.locationName.split(',')[0]}</div>
            </div>}

            <div style={{ position: 'absolute' as const, top: 4, right: 4, zIndex: 4, display: 'flex', gap: 2, flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
                {on && !cam?.paused && <span style={{ fontSize: 5.5, fontWeight: 800, padding: '1px 4px', borderRadius: 2, background: 'rgba(239,68,68,0.85)', color: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}><div style={{ width: 3, height: 3, borderRadius: '50%', background: '#fff', animation: 'argux-pulse 1.5s ease-in-out infinite' }} />LIVE</span>}
                {(gRec || cam?.rec) && on && <span style={{ fontSize: 5.5, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: 'rgba(239,68,68,0.65)', color: '#fff' }}>⏺ REC</span>}
                {nv && <span style={{ fontSize: 5.5, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: 'rgba(34,197,94,0.65)', color: '#fff' }}>NV</span>}
                {cam && cam.playbackRate !== 1 && <span style={{ fontSize: 5.5, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: 'rgba(59,130,246,0.7)', color: '#fff' }}>{cam.playbackRate}×</span>}
                {cam && cam.zoom > 1 && <span style={{ fontSize: 5.5, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: 'rgba(168,85,247,0.7)', color: '#fff' }}>{cam.zoom.toFixed(1)}×</span>}
                <span style={{ fontSize: 5.5, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: `${tc}aa`, color: '#fff' }}>{dev.type.replace(' Camera', '')}</span>
            </div>

            {showInfo && on && cam && !cam.paused && <div style={{ position: 'absolute' as const, bottom: 4, left: 4, zIndex: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
                <span style={{ fontSize: 5.5, fontWeight: 700, color: 'rgba(255,255,255,0.55)', padding: '0px 3px', borderRadius: 1, background: 'rgba(0,0,0,0.45)', fontFamily: "'JetBrains Mono', monospace" }}>{cam.fps}fps</span>
                <span style={{ fontSize: 5.5, fontWeight: 700, color: 'rgba(255,255,255,0.55)', padding: '0px 3px', borderRadius: 1, background: 'rgba(0,0,0,0.45)', fontFamily: "'JetBrains Mono', monospace" }}>{cam.bitrate}</span>
                <span style={{ fontSize: 5.5, fontWeight: 700, color: 'rgba(255,255,255,0.55)', padding: '0px 3px', borderRadius: 1, background: 'rgba(0,0,0,0.45)' }}>{dev.resolution?.split(' ')[0]}</span>
                <div style={{ width: 18, height: 3, borderRadius: 1, background: 'rgba(0,0,0,0.45)', overflow: 'hidden' }}><div style={{ width: `${cam.audioLv}%`, height: '100%', background: cam.audioLv > 70 ? '#ef4444' : '#22c55e', transition: 'width 0.3s' }} /></div>
            </div>}

            {on && <div style={{ position: 'absolute' as const, bottom: 4, right: 4, zIndex: 4, fontSize: 6, fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace", padding: '0px 3px', borderRadius: 1, background: 'rgba(0,0,0,0.45)' }}>{clock}</div>}

            {showAlerts && cam?.alerts.length > 0 && <div style={{ position: 'absolute' as const, bottom: fs ? 40 : 16, right: 4, zIndex: 4, maxWidth: fs ? 260 : 140 }}>
                {cam.alerts.slice(0, fs ? 3 : 1).map(a => <div key={a.id} style={{ padding: '2px 4px', marginBottom: 1, borderRadius: 2, background: `${a.sev === 'critical' ? '#ef4444' : a.sev === 'high' ? '#f97316' : '#f59e0b'}dd`, color: '#fff', fontSize: fs ? 9 : 5.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}><span>{a.icon}</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{a.title}</span><span style={{ opacity: 0.6, flexShrink: 0 }}>{a.time}</span></div>)}
            </div>}

            {hov && on && cam && <div onClick={e => e.stopPropagation()} style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, zIndex: 6, padding: fs ? '24px 12px 8px' : '18px 6px 4px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8) 50%)', display: 'flex', gap: fs ? 4 : 2, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' as const }}>
                <HBtn icon={cam.paused ? '▶' : '⏸'} onClick={() => upCam(dev.id, { paused: !cam.paused })} tip="Play/Pause" />
                <HBtn icon={cam.muted || gMute ? '🔇' : '🔊'} active={!cam.muted && !gMute} onClick={() => upCam(dev.id, { muted: !cam.muted })} tip="Audio" />
                <HBtn icon="⏺" active={cam.rec} onClick={() => upCam(dev.id, { rec: !cam.rec })} tip="Record" />
                <HBtn icon="🌙" active={cam.nv} onClick={() => upCam(dev.id, { nv: !cam.nv })} tip="Night Vision" />
                <HBtn icon="🖼️" onClick={() => takeSnap(dev, vr.current)} tip="Snapshot" />
                <HBtn icon="⛶" onClick={() => setFsCam(fs ? null : dev.id)} tip="Fullscreen" />
                <div style={{ display: 'flex', gap: 1, marginLeft: 2 }}>{[0.5, 1, 2].map(s => <button key={s} onClick={e => { e.stopPropagation(); upCam(dev.id, { playbackRate: s }); }} style={{ padding: '1px 3px', borderRadius: 2, border: 'none', background: cam.playbackRate === s ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)', color: '#fff', fontSize: fs ? 8 : 6, fontWeight: 700, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>{s}×</button>)}</div>
                <div style={{ display: 'flex', gap: 1, marginLeft: 2 }}>
                    <button onClick={e => { e.stopPropagation(); upCam(dev.id, { zoom: Math.max(1, cam.zoom - 0.5) }); }} style={{ width: fs ? 22 : 16, height: fs ? 22 : 16, borderRadius: 2, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontSize: fs ? 10 : 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <button onClick={e => { e.stopPropagation(); upCam(dev.id, { zoom: Math.min(4, cam.zoom + 0.5) }); }} style={{ width: fs ? 22 : 16, height: fs ? 22 : 16, borderRadius: 2, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontSize: fs ? 10 : 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                {!gMute && !cam.muted && <input type="range" min={0} max={100} value={cam.vol} onChange={e => { e.stopPropagation(); upCam(dev.id, { vol: parseInt(e.target.value) }); }} onClick={e => e.stopPropagation()} style={{ width: fs ? 60 : 35, height: 3, accentColor: '#3b82f6', marginLeft: 2 }} />}
            </div>}

            {fs && <button onClick={e => { e.stopPropagation(); setFsCam(null); }} style={{ position: 'absolute' as const, top: 10, right: 10, zIndex: 10, width: 32, height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>✕</button>}
        </div>;
    };

    return (<>
        <PageMeta title="Vision — Camera Wall" />
        <div className="vision-page" style={{ display: 'flex', flexDirection: 'column' as const, height: 'calc(100vh - 56px)', margin: '-24px -24px -80px', background: '#060810', overflow: 'hidden' }}>
            {/* TOP BAR */}
            <div className="vision-topbar" style={{ padding: '5px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, flexWrap: 'wrap' as const, background: theme.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 5, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>📹</div>
                    <div><div style={{ fontSize: 11, fontWeight: 800, color: theme.text, letterSpacing: '0.06em' }}>VISION</div><div style={{ fontSize: 6, color: theme.textDim }}>SURVEILLANCE WALL</div></div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                    {[{ l: 'Online', c: sc.on, color: '#22c55e', k: 'online' }, { l: 'Off', c: sc.off, color: '#ef4444', k: 'offline' }, { l: 'Maint', c: sc.mt, color: '#f59e0b', k: 'maintenance' }, { l: 'Stby', c: sc.sb, color: '#06b6d4', k: 'standby' }].filter(s => s.c > 0).map(s => <button key={s.k} onClick={() => setStatusF(p => p === s.k ? 'all' : s.k)} style={{ padding: '2px 5px', borderRadius: 3, border: `1px solid ${statusF === s.k ? s.color + '40' : theme.border}`, background: statusF === s.k ? `${s.color}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: s.color }} /><span style={{ fontSize: 9, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.c}</span><span style={{ fontSize: 7, color: theme.textDim }}>{s.l}</span></button>)}
                    {alertC > 0 && <div style={{ padding: '2px 5px', borderRadius: 3, border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 2 }}><span style={{ fontSize: 8 }}>🚨</span><span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>{alertC}</span></div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: theme.bgInput, border: `1px solid ${search ? theme.accent + '40' : theme.border}`, borderRadius: 4, padding: '0 6px', flex: '1 1 120px', minWidth: 80, maxWidth: 200 }}>
                    <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cameras..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '3px 0', color: theme.text, fontSize: 9, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', fontSize: 7 }}>✕</button>}
                </div>
                <div style={{ display: 'flex', gap: 1 }}>{[{ id: 'all', l: 'All' }, { id: 'Public Camera', l: '📹 Pub' }, { id: 'Hidden Camera', l: '🕵️ Hid' }, { id: 'Private Camera', l: '🔒 Prv' }].map(t => <button key={t.id} onClick={() => setTypeF(t.id)} style={{ padding: '2px 5px', borderRadius: 3, border: `1px solid ${typeF === t.id ? theme.accent + '35' : theme.border}`, background: typeF === t.id ? `${theme.accent}06` : 'transparent', color: typeF === t.id ? theme.accent : theme.textDim, fontSize: 7, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t.l}</button>)}</div>
                <div style={{ width: 1, height: 14, background: theme.border, flexShrink: 0 }} />
                <div style={{ display: 'flex', gap: 1 }}>{(['1x1', '2x2', '3x3', '4x4'] as Grid[]).map(l => <button key={l} onClick={() => setLayout(l)} style={{ padding: '2px 5px', borderRadius: 3, border: `1px solid ${layout === l ? theme.accent + '35' : theme.border}`, background: layout === l ? `${theme.accent}06` : 'transparent', color: layout === l ? theme.accent : theme.textDim, fontSize: 7, fontWeight: 700, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>{l}</button>)}</div>
                <div style={{ width: 1, height: 14, background: theme.border, flexShrink: 0 }} />
                <div style={{ display: 'flex', gap: 1 }}>{[
                    { k: 'ai', l: '🤖 AI', on: showAi, fn: () => setShowAi(p => !p), c: theme.accent },
                    { k: 'info', l: 'ℹ️', on: showInfo, fn: () => setShowInfo(p => !p), c: theme.accent },
                    { k: 'alerts', l: '🚨', on: showAlerts, fn: () => setShowAlerts(p => !p), c: '#f59e0b' },
                    { k: 'mute', l: gMute ? '🔇' : '🔊', on: !gMute, fn: () => setGMute(p => !p), c: '#3b82f6' },
                    { k: 'rec', l: '⏺', on: gRec, fn: () => setGRec(p => !p), c: '#ef4444' },
                    { k: 'nv', l: '🌙', on: gNV, fn: () => setGNV(p => !p), c: '#22c55e' },
                ].map(t => <button key={t.k} onClick={t.fn} title={t.k} style={{ padding: '2px 5px', borderRadius: 3, border: `1px solid ${t.on ? t.c + '35' : theme.border}`, background: t.on ? `${t.c}08` : 'transparent', color: t.on ? t.c : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>{t.l}</button>)}</div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 7, color: theme.textDim }}><span style={{ fontWeight: 700, color: theme.accent, fontFamily: "'JetBrains Mono', monospace" }}>{filtered.length}</span>/{cameras.length}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono', monospace", padding: '1px 5px', borderRadius: 3, background: `${theme.border}30` }}>{clock}</span>
                </div>
            </div>

            {/* GRID + SIDEBAR */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2, padding: 2, overflow: 'auto', minHeight: 0, background: '#060810', alignContent: 'start' }}>
                    {filtered.length === 0 && <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: 40 }}><div style={{ fontSize: 28, marginBottom: 6, opacity: 0.25 }}>📹</div><div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary }}>No cameras match</div><div style={{ fontSize: 9, color: theme.textDim, marginTop: 2 }}>Adjust filters or search</div></div>}
                    {filtered.map(d => <Tile key={d.id} dev={d} />)}
                </div>

                {/* SIDEBAR */}
                {selCam && (() => {
                    const d = cameras.find(c => c.id === selCam); const m = cams[selCam];
                    if (!d || !m) return null;
                    const tc = deviceTypeColors[d.type as keyof typeof deviceTypeColors] || '#6b7280';
                    const stc = d.status === 'Online' ? '#22c55e' : d.status === 'Maintenance' ? '#f59e0b' : '#ef4444';
                    return <div className="vision-sidebar" style={{ width: 240, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                        <div style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 5, background: `${tc}12`, border: `1px solid ${tc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{deviceTypeIcons[d.type as keyof typeof deviceTypeIcons] || '📹'}</div>
                            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.name}</div><div style={{ fontSize: 7, color: stc, fontWeight: 600 }}>{d.status} · {d.type.replace(' Camera', '')}</div></div>
                            <button onClick={() => setSelCam(null)} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>
                        <div style={{ padding: '5px 10px', borderBottom: `1px solid ${theme.border}`, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
                            {[{ i: m.paused ? '▶' : '⏸', fn: () => upCam(d.id, { paused: !m.paused }) }, { i: m.muted ? '🔇' : '🔊', fn: () => upCam(d.id, { muted: !m.muted }) }, { i: '⏺', fn: () => upCam(d.id, { rec: !m.rec }) }, { i: '🌙', fn: () => upCam(d.id, { nv: !m.nv }) }, { i: '⛶', fn: () => setFsCam(d.id) }].map((a, i) => <button key={i} onClick={a.fn} style={{ padding: '3px', borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 10, cursor: 'pointer' }}>{a.i}</button>)}
                        </div>
                        {d.status === 'Online' && <div style={{ padding: '4px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ fontSize: 6, color: theme.textDim }}>Vol</span><input type="range" min={0} max={100} value={m.vol} onChange={e => upCam(d.id, { vol: parseInt(e.target.value) })} style={{ flex: 1, height: 2, accentColor: '#3b82f6' }} /><span style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, fontFamily: "'JetBrains Mono', monospace", width: 22, textAlign: 'right' as const }}>{m.vol}%</span></div>}
                        {d.status === 'Online' && <div style={{ padding: '4px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 6 }}>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 6, color: theme.textDim, marginBottom: 2 }}>Speed</div><div style={{ display: 'flex', gap: 1 }}>{[0.5, 1, 1.5, 2].map(s => <button key={s} onClick={() => upCam(d.id, { playbackRate: s })} style={{ flex: 1, padding: '2px', borderRadius: 2, border: `1px solid ${m.playbackRate === s ? '#3b82f640' : theme.border}`, background: m.playbackRate === s ? '#3b82f608' : 'transparent', color: m.playbackRate === s ? '#3b82f6' : theme.textDim, fontSize: 7, fontWeight: 700, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>{s}×</button>)}</div></div>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 6, color: theme.textDim, marginBottom: 2 }}>Zoom</div><div style={{ display: 'flex', alignItems: 'center', gap: 2 }}><button onClick={() => upCam(d.id, { zoom: Math.max(1, m.zoom - 0.5) })} style={{ width: 16, height: 16, borderRadius: 2, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button><span style={{ flex: 1, textAlign: 'center' as const, fontSize: 8, fontWeight: 700, color: m.zoom > 1 ? '#a855f7' : theme.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{m.zoom.toFixed(1)}×</span><button onClick={() => upCam(d.id, { zoom: Math.min(4, m.zoom + 0.5) })} style={{ width: 16, height: 16, borderRadius: 2, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button></div></div>
                        </div>}
                        <div style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                            {[{ l: 'Location', v: d.locationName }, { l: 'Device', v: `${d.manufacturer} ${d.model}` }, { l: 'Resolution', v: d.resolution || '—' }, { l: 'Protocol', v: d.protocol }, { l: 'IP', v: d.ipAddress }, { l: 'Signal', v: `${d.signalStrength}%` }, { l: 'Stream', v: d.status === 'Online' ? `${m.fps}fps · ${m.bitrate}` : '—' }, { l: 'Storage', v: d.storageCapacity || '—' }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: theme.text, textAlign: 'right' as const, wordBreak: 'break-word' }}>{r.v}</span></div>)}
                        </div>
                        {m.dets.length > 0 && <div style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.border}` }}><div style={{ fontSize: 7, fontWeight: 700, color: theme.accent, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>🤖 AI Detections</div>{m.dets.map(det => <div key={det.id} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 0' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: `${det.color}15`, border: `1px solid ${det.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6 }}>{det.type === 'face' ? '🧑' : det.type === 'vehicle' ? '🚗' : det.type === 'lpr' ? '🔢' : '👤'}</div><span style={{ fontSize: 7, color: theme.text, flex: 1 }}>{det.type === 'lpr' ? det.label : det.type}</span><span style={{ fontSize: 7, fontWeight: 700, color: det.conf >= 90 ? '#22c55e' : '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>{det.conf}%</span></div>)}</div>}
                        {m.alerts.length > 0 && <div style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.border}` }}><div style={{ fontSize: 7, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>🚨 Alerts</div>{m.alerts.map(a => <div key={a.id} style={{ padding: '2px 4px', marginBottom: 1, borderRadius: 2, background: `${a.sev === 'critical' ? '#ef4444' : '#f97316'}08`, border: `1px solid ${a.sev === 'critical' ? '#ef4444' : '#f97316'}15`, fontSize: 6.5, color: theme.text, display: 'flex', gap: 2, alignItems: 'center' }}><span>{a.icon}</span><span style={{ flex: 1 }}>{a.title}</span><span style={{ color: theme.textDim }}>{a.time}</span></div>)}</div>}
                        {d.notes && <div style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.border}` }}><div style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Notes</div><div style={{ fontSize: 7, color: theme.textSecondary, lineHeight: 1.4 }}>{d.notes}</div></div>}
                        <div style={{ padding: '6px 10px', marginTop: 'auto', display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                            <a href={`/devices/${d.id}`} style={{ fontSize: 7, fontWeight: 600, padding: '2px 6px', borderRadius: 3, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>📡 Device</a>
                            <a href="/map" style={{ fontSize: 7, fontWeight: 600, padding: '2px 6px', borderRadius: 3, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none' }}>🗺️ Map</a>
                            <a href="/face-recognition" style={{ fontSize: 7, fontWeight: 600, padding: '2px 6px', borderRadius: 3, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none' }}>🧑 Faces</a>
                        </div>
                    </div>;
                })()}
            </div>

            {/* BOTTOM BAR */}
            <div style={{ padding: '2px 12px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px #22c55e50' }} /><span style={{ fontWeight: 600, color: '#22c55e' }}>Online</span><span>·</span>
                <span>{cameras.length} cams · {sc.on} live · {Object.values(cams).filter(m => m.rec).length} rec · {Object.values(cams).reduce((s, m) => s + m.dets.length, 0)} AI det</span>
                <div style={{ flex: 1 }} />
                <span>RTSP/ONVIF · AES-256 · MinIO</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
            </div>
        </div>
    </>);
}

VisionIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default VisionIndex;
