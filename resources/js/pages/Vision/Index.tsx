import PageMeta from '../../components/layout/PageMeta';
import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { mockDevices, deviceTypeIcons, deviceTypeColors, type Device } from '../../mock/devices';

const VIDEO_SRC = 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/rtl_direkt.mp4';
const allCams: Device[] = mockDevices.filter(d => d.type === 'Public Camera' || d.type === 'Hidden Camera' || d.type === 'Private Camera');

interface AiBox { id: string; type: 'face' | 'person' | 'vehicle' | 'lpr'; label: string; conf: number; x: number; y: number; w: number; h: number; color: string; personName?: string; }
interface CamAlert { id: string; sev: 'critical' | 'high' | 'medium'; title: string; time: string; icon: string; }
interface CamState { dets: AiBox[]; rec: boolean; nv: boolean; paused: boolean; muted: boolean; vol: number; audioLv: number; fps: number; bitrate: string; playbackRate: number; zoom: number; alerts: CamAlert[]; bw: number; }
interface FaceHit { id: string; camId: number; camName: string; conf: number; personName: string; time: string; }
interface MotionZone { id: string; camId: number; type: 'include' | 'exclude'; x: number; y: number; w: number; h: number; }
interface Preset { id: string; name: string; layout: string; group: string; filters: string; }
type Grid = '1x1' | '2x2' | '3x3' | '4x4';
type ViewMode = 'grid' | 'map';
type SidePanel = 'detail' | 'faces' | 'bandwidth' | 'presets' | 'ptz' | 'timeline' | 'motionZones' | null;

// Camera groups
const camGroups = [
    { id: 'all', label: 'All Cameras', icon: '🔍', color: theme.accent },
    { id: 'zagreb', label: 'Zagreb', icon: '🏙️', color: '#3b82f6', ids: [1, 8, 14, 17] },
    { id: 'international', label: 'International', icon: '🌍', color: '#8b5cf6', ids: [3, 5, 7, 11, 12, 18, 19] },
    { id: 'hawk', label: 'Operation HAWK', icon: '🦅', color: '#ef4444', ids: [1, 5, 8, 14, 18] },
    { id: 'ptz', label: 'PTZ Cameras', icon: '🎛️', color: '#06b6d4', ids: [5, 17, 19] },
    { id: 'hidden', label: 'Covert', icon: '🕵️', color: '#f97316', ids: [3, 7, 12] },
];

// Screen presets
const defaultPresets: Preset[] = [
    { id: 'ps-1', name: 'Zagreb Only', layout: '2x2', group: 'zagreb', filters: 'online' },
    { id: 'ps-2', name: 'Port Surveillance', layout: '2x2', group: 'international', filters: 'all' },
    { id: 'ps-3', name: 'Operation HAWK', layout: '3x3', group: 'hawk', filters: 'all' },
    { id: 'ps-4', name: 'All Cameras 4×4', layout: '4x4', group: 'all', filters: 'all' },
    { id: 'ps-5', name: 'Covert Ops', layout: '2x2', group: 'hidden', filters: 'all' },
];

// Mock face hits
const mockFaces: FaceHit[] = [
    { id: 'fh-1', camId: 1, camName: 'Zagreb HQ Entrance', conf: 94, personName: 'Marko Horvat', time: '10:12:34' },
    { id: 'fh-2', camId: 8, camName: 'Zagreb Street Cam A1', conf: 87, personName: 'Ivan Babić', time: '10:08:21' },
    { id: 'fh-3', camId: 14, camName: 'Zagreb Airport Cargo', conf: 91, personName: 'Unknown #247', time: '10:05:10' },
    { id: 'fh-4', camId: 5, camName: 'Dubai Port Camera', conf: 78, personName: 'Omar Hassan', time: '09:58:44' },
    { id: 'fh-5', camId: 18, camName: 'A1 Highway Southbound', conf: 82, personName: 'Carlos Mendoza', time: '09:52:11' },
    { id: 'fh-6', camId: 1, camName: 'Zagreb HQ Entrance', conf: 96, personName: 'Ana Kovačević', time: '09:45:02' },
    { id: 'fh-7', camId: 11, camName: 'Rashid Holdings Parking', conf: 73, personName: 'Unknown #312', time: '09:38:55' },
    { id: 'fh-8', camId: 8, camName: 'Zagreb Street Cam A1', conf: 88, personName: 'Marko Horvat', time: '09:30:18' },
];

// Recording timeline segments
const mockTimeline = [
    { start: 0, end: 15, type: 'rec', color: '#22c55e' },
    { start: 15, end: 20, type: 'gap', color: 'transparent' },
    { start: 20, end: 45, type: 'rec', color: '#22c55e' },
    { start: 45, end: 50, type: 'alert', color: '#ef4444' },
    { start: 50, end: 70, type: 'rec', color: '#22c55e' },
    { start: 70, end: 75, type: 'motion', color: '#f59e0b' },
    { start: 75, end: 100, type: 'rec', color: '#22c55e' },
];

function VisionIndex() {
    const [layout, setLayout] = useState<Grid>('3x3');
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState('all');
    const [typeF, setTypeF] = useState('all');
    const [groupF, setGroupF] = useState('all');
    const [selCam, setSelCam] = useState<number | null>(null);
    const [showAlerts, setShowAlerts] = useState(true);
    const [showAi, setShowAi] = useState(true);
    const [showInfo, setShowInfo] = useState(true);
    const [fsCam, setFsCam] = useState<number | null>(null);
    const [gRec, setGRec] = useState(false);
    const [gNV, setGNV] = useState(false);
    const [gMute, setGMute] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sidePanel, setSidePanel] = useState<SidePanel>(null);
    const [syncPlayback, setSyncPlayback] = useState(false);
    const [timelineCursor, setTimelineCursor] = useState(65);
    const [presets, setPresets] = useState<Preset[]>(defaultPresets);
    const [motionZones, setMotionZones] = useState<MotionZone[]>([
        { id: 'mz-1', camId: 1, type: 'include', x: 10, y: 20, w: 40, h: 50 },
        { id: 'mz-2', camId: 8, type: 'exclude', x: 60, y: 60, w: 30, h: 30 },
    ]);
    const [ptzPan, setPtzPan] = useState(0);
    const [ptzTilt, setPtzTilt] = useState(0);
    const [ptzZoom, setPtzZoom] = useState(1);
    const [showWaveform, setShowWaveform] = useState(true);
    const [clock, setClock] = useState(new Date().toLocaleTimeString('en-GB'));
    const waveRef = useRef<number[]>(Array(20).fill(0));

    useEffect(() => { const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB')), 1000); return () => clearInterval(t); }, []);

    // Waveform simulation
    useEffect(() => { const t = setInterval(() => { waveRef.current = waveRef.current.map(() => Math.random() * 80 + 5); }, 150); return () => clearInterval(t); }, []);

    // Cam state init
    const [cams, setCams] = useState<Record<number, CamState>>({});
    useEffect(() => {
        const s: Record<number, CamState> = {};
        allCams.forEach(d => {
            const dets: AiBox[] = [];
            if (d.status === 'Online') {
                if (Math.random() > 0.3) dets.push({ id: `${d.id}-f`, type: 'face', label: 'Face', conf: 78 + Math.floor(Math.random() * 20), x: 28 + Math.random() * 35, y: 12 + Math.random() * 25, w: 7 + Math.random() * 4, h: 9 + Math.random() * 5, color: '#ec4899', personName: ['Marko Horvat', 'Ivan Babić', 'Unknown'][Math.floor(Math.random() * 3)] });
                if (Math.random() > 0.5) dets.push({ id: `${d.id}-p`, type: 'person', label: 'Person', conf: 85 + Math.floor(Math.random() * 14), x: 8 + Math.random() * 45, y: 18 + Math.random() * 35, w: 9 + Math.random() * 8, h: 16 + Math.random() * 15, color: '#3b82f6' });
                if (Math.random() > 0.6) dets.push({ id: `${d.id}-v`, type: 'vehicle', label: 'Vehicle', conf: 90 + Math.floor(Math.random() * 9), x: 5 + Math.random() * 55, y: 48 + Math.random() * 25, w: 14 + Math.random() * 10, h: 9 + Math.random() * 8, color: '#22c55e' });
                if (d.notes?.includes('LPR')) dets.push({ id: `${d.id}-l`, type: 'lpr', label: 'ZG-1847-AB', conf: 95 + Math.floor(Math.random() * 4), x: 18 + Math.random() * 35, y: 56 + Math.random() * 18, w: 14, h: 6, color: '#f59e0b' });
            }
            const alerts: CamAlert[] = [];
            if (d.id === 1) alerts.push({ id: 'a1', sev: 'critical', title: 'Face: Horvat (94%)', time: '2m', icon: '🧑' });
            if (d.id === 8) alerts.push({ id: 'a2', sev: 'high', title: 'Restricted motion', time: '5m', icon: '🏃' });
            if (d.id === 14) alerts.push({ id: 'a3', sev: 'medium', title: 'LPR: ZG-1847-AB', time: '12m', icon: '🚗' });
            if (d.id === 18) alerts.push({ id: 'a4', sev: 'high', title: 'Speed: 142 km/h', time: '8m', icon: '⚠️' });
            if (d.id === 5) alerts.push({ id: 'a5', sev: 'critical', title: 'Vessel approach', time: '1m', icon: '🚢' });
            s[d.id] = { dets, rec: d.status === 'Online' && Math.random() > 0.3, nv: false, paused: false, muted: true, vol: 60, audioLv: d.status === 'Online' ? 20 + Math.floor(Math.random() * 40) : 0, fps: d.status === 'Online' ? (d.resolution?.includes('4K') ? 25 + Math.floor(Math.random() * 6) : 28 + Math.floor(Math.random() * 3)) : 0, bitrate: d.resolution?.includes('4K') ? `${12 + Math.floor(Math.random() * 8)}M` : `${4 + Math.floor(Math.random() * 4)}M`, playbackRate: 1, zoom: 1, alerts, bw: d.status === 'Online' ? (d.resolution?.includes('4K') ? 12 + Math.random() * 8 : 4 + Math.random() * 4) : 0 };
        });
        setCams(s);
    }, []);

    // FPS/audio/bandwidth fluctuation
    useEffect(() => { const i = setInterval(() => setCams(p => { const n = { ...p }; Object.keys(n).forEach(k => { const id = +k; if (allCams.find(c => c.id === id)?.status === 'Online' && !n[id].paused) { n[id] = { ...n[id], fps: Math.max(20, Math.min(32, n[id].fps + Math.floor(Math.random() * 3) - 1)), audioLv: Math.max(0, Math.min(100, n[id].audioLv + Math.floor(Math.random() * 20) - 10)), bw: Math.max(2, n[id].bw + (Math.random() * 2 - 1)) }; } }); return n; }), 2000); return () => clearInterval(i); }, []);

    const upCam = useCallback((id: number, patch: Partial<CamState>) => setCams(p => ({ ...p, [id]: { ...p[id], ...patch } })), []);

    // Filtering
    const filtered = allCams.filter(d => {
        if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.locationName.toLowerCase().includes(search.toLowerCase())) return false;
        if (statusF !== 'all' && d.status.toLowerCase() !== statusF) return false;
        if (typeF !== 'all' && d.type !== typeF) return false;
        if (groupF !== 'all') { const g = camGroups.find(gr => gr.id === groupF); if (g && 'ids' in g) return (g as any).ids.includes(d.id); }
        return true;
    });

    const cols = layout === '1x1' ? 1 : layout === '2x2' ? 2 : layout === '3x3' ? 3 : 4;
    const sc = { on: allCams.filter(d => d.status === 'Online').length, off: allCams.filter(d => d.status === 'Offline').length, mt: allCams.filter(d => d.status === 'Maintenance').length, sb: allCams.filter(d => d.status === 'Standby').length };
    const alertC = Object.values(cams).reduce((s, m) => s + m.alerts.length, 0);
    const totalBw = Object.values(cams).reduce((s, m) => s + m.bw, 0);

    // Open camera in popup window
    const openPopup = (dev: Device) => {
        const w = window.open('', `cam-${dev.id}`, 'width=960,height=540,toolbar=no,menubar=no,scrollbars=no,resizable=yes');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><title>ARGUX — ${dev.name}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;overflow:hidden;font-family:system-ui}video{width:100vw;height:100vh;object-fit:cover}.bar{position:fixed;top:0;left:0;right:0;padding:6px 12px;background:linear-gradient(rgba(0,0,0,0.8),transparent);display:flex;align-items:center;gap:8px;color:#fff;z-index:10;font-size:12px}.bar .name{font-weight:800}.bar .loc{font-size:9px;color:rgba(255,255,255,0.5)}.dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:p 2s infinite}@keyframes p{0%,100%{opacity:1}50%{opacity:.3}}.live{font-size:8px;font-weight:800;background:rgba(239,68,68,0.85);padding:2px 6px;border-radius:3px;letter-spacing:0.06em}.bbar{position:fixed;bottom:0;left:0;right:0;padding:4px 12px;background:linear-gradient(transparent,rgba(0,0,0,0.8));display:flex;align-items:center;gap:8px;color:rgba(255,255,255,0.5);font-size:9px;font-family:'JetBrains Mono',monospace}</style></head><body><div class="bar"><div class="dot"></div><span class="name">${dev.name}</span><span class="loc">${dev.locationName}</span><span class="live">● LIVE</span></div><video src="${VIDEO_SRC}" autoplay muted loop playsinline></video><div class="bbar"><span>${dev.resolution?.split(' ')[0] || '1080p'}</span><span>${dev.protocol}</span><span>${dev.ipAddress}</span><span style="margin-left:auto">ARGUX — CLASSIFIED</span></div></body></html>`);
        w.document.close();
    };

    // Apply preset
    const applyPreset = (p: Preset) => {
        setLayout(p.layout as Grid);
        setGroupF(p.group);
        setStatusF(p.filters === 'online' ? 'online' : 'all');
    };

    // Snapshot
    const takeSnap = useCallback((dev: Device, v: HTMLVideoElement | null) => {
        if (!v) return;
        const c = document.createElement('canvas'); c.width = v.videoWidth || 1920; c.height = v.videoHeight || 1080;
        c.getContext('2d')?.drawImage(v, 0, 0);
        const a = document.createElement('a'); a.download = `ARGUX-${dev.name.replace(/\s/g, '-')}-${Date.now()}.png`; a.href = c.toDataURL('image/png'); a.click();
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
        const isPtz = [5, 17, 19].includes(dev.id);

        // Video: ensure always playing via periodic check + event recovery
        useEffect(() => {
            const v = vr.current;
            if (!v || !on) return;
            v.muted = true; // Required for autoplay policy

            const ensurePlaying = () => {
                if (!v || cam?.paused) return;
                if (v.paused && v.readyState >= 2) {
                    v.play().catch(() => {});
                }
            };

            // Retry on stall/suspend/pause events
            v.addEventListener('suspend', ensurePlaying);
            v.addEventListener('stalled', ensurePlaying);
            v.addEventListener('pause', () => { if (!cam?.paused) ensurePlaying(); });
            v.addEventListener('loadeddata', ensurePlaying);

            // Periodic check every 2s as fallback
            const interval = setInterval(ensurePlaying, 2000);
            // Initial staggered play (prevents browser throttling of simultaneous plays)
            const delay = setTimeout(ensurePlaying, 200 + Math.random() * 800);

            return () => { clearInterval(interval); clearTimeout(delay); v.removeEventListener('suspend', ensurePlaying); v.removeEventListener('stalled', ensurePlaying); };
        }, [on]);

        // Handle pause toggle
        useEffect(() => {
            const v = vr.current;
            if (!v || !on) return;
            if (cam?.paused) v.pause();
            else if (v.paused) v.play().catch(() => {});
        }, [cam?.paused]);

        useEffect(() => { if (vr.current) { vr.current.muted = gMute || (cam?.muted ?? true); vr.current.volume = (cam?.vol ?? 60) / 100; } }, [gMute, cam?.muted, cam?.vol]);
        useEffect(() => { if (vr.current && cam) vr.current.playbackRate = cam.playbackRate; }, [cam?.playbackRate]);

        // Sync playback
        useEffect(() => { if (syncPlayback && vr.current && cam && !cam.paused) { vr.current.currentTime = (timelineCursor / 100) * (vr.current.duration || 60); } }, [syncPlayback, timelineCursor]);

        const HBtn = ({ icon, active, onClick: oc, tip }: { icon: string; active?: boolean; onClick: () => void; tip: string }) => <button onClick={e => { e.stopPropagation(); oc(); }} title={tip} style={{ width: fs ? 28 : 22, height: fs ? 28 : 22, borderRadius: 3, border: 'none', background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs ? 11 : 9, backdropFilter: 'blur(2px)', flexShrink: 0 }}>{icon}</button>;

        return <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={() => { setSelCam(dev.id); if (!sidePanel) setSidePanel('detail'); }} onDoubleClick={() => setFsCam(fs ? null : dev.id)} style={{
            overflow: 'hidden', background: '#000', cursor: 'pointer', transition: 'border-color 0.15s',
            border: `1px solid ${selCam === dev.id ? theme.accent + '40' : 'rgba(255,255,255,0.04)'}`,
            ...(fs ? { position: 'fixed' as const, inset: 0, zIndex: 200, borderRadius: 0 } : { position: 'relative' as const, borderRadius: 4, aspectRatio: '16/9' }),
        }}>
            {/* Video */}
            {on ? <video ref={vr} src={VIDEO_SRC} autoPlay muted loop playsInline preload="auto" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: nv ? 'grayscale(1) brightness(1.6) contrast(1.3) sepia(0.12)' : 'none', opacity: cam?.paused ? 0.3 : 1, transition: 'filter 0.3s, opacity 0.3s', transform: cam ? `scale(${cam.zoom})` : undefined, transformOrigin: 'center' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#080c14,#111827)' }}>
                <div style={{ fontSize: 18, marginBottom: 3, opacity: 0.2 }}>{dev.status === 'Offline' ? '📵' : dev.status === 'Maintenance' ? '🔧' : '💤'}</div>
                <div style={{ fontSize: 7, fontWeight: 700, color: stc }}>{dev.status.toUpperCase()}</div>
            </div>}

            {/* Pause overlay */}
            {on && cam?.paused && <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, pointerEvents: 'none' as const }}><div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⏸</div></div>}

            {/* AI boxes */}
            {showAi && on && !cam?.paused && cam?.dets.map(d => <div key={d.id} style={{ position: 'absolute' as const, left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%`, border: `1.5px solid ${d.color}70`, borderRadius: 2, zIndex: 3, pointerEvents: 'none' as const }}>
                <div style={{ position: 'absolute' as const, top: -11, left: -1, padding: '0 3px', borderRadius: '2px 2px 0 0', background: `${d.color}cc`, fontSize: 5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' as const, lineHeight: '10px' }}>{d.type === 'lpr' ? `🚗 ${d.label}` : d.type === 'face' ? `🧑 ${d.conf}%` : d.type === 'vehicle' ? `🚗 ${d.conf}%` : `👤 ${d.conf}%`}</div>
            </div>)}

            {/* Motion zones overlay */}
            {motionZones.filter(mz => mz.camId === dev.id).map(mz => <div key={mz.id} style={{ position: 'absolute' as const, left: `${mz.x}%`, top: `${mz.y}%`, width: `${mz.w}%`, height: `${mz.h}%`, border: `1.5px dashed ${mz.type === 'include' ? '#22c55e' : '#ef4444'}60`, background: `${mz.type === 'include' ? '#22c55e' : '#ef4444'}08`, borderRadius: 2, zIndex: 2, pointerEvents: 'none' as const }}>
                <div style={{ position: 'absolute' as const, bottom: -10, left: 0, fontSize: 5, padding: '0 2px', borderRadius: 1, background: mz.type === 'include' ? '#22c55e99' : '#ef444499', color: '#fff', fontWeight: 700 }}>{mz.type === 'include' ? 'MOTION' : 'EXCLUDE'}</div>
            </div>)}

            {/* Audio waveform */}
            {showWaveform && on && !cam?.paused && cam && cam.audioLv > 10 && <div style={{ position: 'absolute' as const, bottom: 14, left: 4, zIndex: 4, display: 'flex', gap: 1, alignItems: 'flex-end', height: 12, opacity: 0.6 }}>
                {waveRef.current.slice(0, 10).map((v, i) => <div key={i} style={{ width: 2, height: `${Math.max(8, v * (cam.audioLv / 100))}%`, background: cam.audioLv > 70 ? '#ef4444' : '#22c55e', borderRadius: 1, transition: 'height 0.1s' }} />)}
            </div>}

            {/* Top-left: name */}
            {showInfo && <div style={{ position: 'absolute' as const, top: 3, left: 3, zIndex: 4, maxWidth: '55%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: stc, boxShadow: on ? `0 0 3px ${stc}50` : 'none', animation: on && !cam?.paused ? 'argux-pulse 2s ease-in-out infinite' : 'none', flexShrink: 0 }} />
                    <span style={{ fontSize: fs ? 13 : 7, fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{dev.name}</span>
                    {isPtz && <span style={{ fontSize: 5, padding: '0 2px', borderRadius: 1, background: '#06b6d4aa', color: '#fff', fontWeight: 700 }}>PTZ</span>}
                </div>
                <div style={{ fontSize: fs ? 9 : 5, color: 'rgba(255,255,255,0.4)', textShadow: '0 1px 2px rgba(0,0,0,0.9)', marginTop: 1 }}>{dev.locationName.split(',')[0]}</div>
            </div>}

            {/* Top-right: badges */}
            <div style={{ position: 'absolute' as const, top: 3, right: 3, zIndex: 4, display: 'flex', gap: 2, flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
                {on && !cam?.paused && <span style={{ fontSize: 5, fontWeight: 800, padding: '1px 3px', borderRadius: 2, background: 'rgba(239,68,68,0.85)', color: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}><div style={{ width: 3, height: 3, borderRadius: '50%', background: '#fff', animation: 'argux-pulse 1.5s ease-in-out infinite' }} />LIVE</span>}
                {(gRec || cam?.rec) && on && <span style={{ fontSize: 5, fontWeight: 700, padding: '1px 3px', borderRadius: 2, background: 'rgba(239,68,68,0.65)', color: '#fff' }}>REC</span>}
                {nv && <span style={{ fontSize: 5, fontWeight: 700, padding: '1px 3px', borderRadius: 2, background: 'rgba(34,197,94,0.65)', color: '#fff' }}>NV</span>}
                <span style={{ fontSize: 5, fontWeight: 700, padding: '1px 3px', borderRadius: 2, background: `${tc}aa`, color: '#fff' }}>{dev.type.replace(' Camera', '')}</span>
            </div>

            {/* Bottom-right: clock + stats */}
            {showInfo && on && cam && !cam.paused && <div style={{ position: 'absolute' as const, bottom: 3, right: 3, zIndex: 4, display: 'flex', gap: 2 }}>
                <span style={{ fontSize: 5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', padding: '0 2px', borderRadius: 1, background: 'rgba(0,0,0,0.4)', fontFamily: "'JetBrains Mono',monospace" }}>{cam.fps}fps</span>
                <span style={{ fontSize: 5, fontWeight: 700, color: 'rgba(255,255,255,0.5)', padding: '0 2px', borderRadius: 1, background: 'rgba(0,0,0,0.4)', fontFamily: "'JetBrains Mono',monospace" }}>{cam.bw.toFixed(1)}M</span>
                <span style={{ fontSize: 5, fontWeight: 700, color: 'rgba(255,255,255,0.4)', padding: '0 2px', borderRadius: 1, background: 'rgba(0,0,0,0.4)', fontFamily: "'JetBrains Mono',monospace" }}>{clock}</span>
            </div>}

            {/* Alert badge */}
            {showAlerts && cam?.alerts.length > 0 && <div style={{ position: 'absolute' as const, bottom: fs ? 26 : 14, right: 3, zIndex: 4 }}>
                {cam.alerts.slice(0, 1).map(a => <div key={a.id} style={{ padding: '1px 4px', borderRadius: 2, background: `${a.sev === 'critical' ? '#ef4444' : a.sev === 'high' ? '#f97316' : '#f59e0b'}dd`, color: '#fff', fontSize: 5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}><span>{a.icon}</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{a.title}</span></div>)}
            </div>}

            {/* Hover controls */}
            {hov && on && cam && <div onClick={e => e.stopPropagation()} style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, zIndex: 6, padding: '16px 6px 4px', background: 'linear-gradient(transparent,rgba(0,0,0,0.75) 50%)', display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                <HBtn icon={cam.paused ? '▶' : '⏸'} onClick={() => upCam(dev.id, { paused: !cam.paused })} tip="Play/Pause" />
                <HBtn icon={cam.muted || gMute ? '🔇' : '🔊'} active={!cam.muted && !gMute} onClick={() => upCam(dev.id, { muted: !cam.muted })} tip="Mute" />
                <HBtn icon="⏺" active={cam.rec} onClick={() => upCam(dev.id, { rec: !cam.rec })} tip="Record" />
                <HBtn icon="🌙" active={cam.nv} onClick={() => upCam(dev.id, { nv: !cam.nv })} tip="Night Vision" />
                <HBtn icon="🖼️" onClick={() => takeSnap(dev, vr.current)} tip="Snapshot" />
                <HBtn icon="⛶" onClick={() => setFsCam(fs ? null : dev.id)} tip="Fullscreen" />
                <HBtn icon="🪟" onClick={() => openPopup(dev)} tip="Popup Window" />
                {isPtz && <HBtn icon="🎛️" active={sidePanel === 'ptz' && selCam === dev.id} onClick={() => { setSelCam(dev.id); setSidePanel('ptz'); }} tip="PTZ Controls" />}
            </div>}

            {/* Fullscreen close */}
            {fs && <button onClick={e => { e.stopPropagation(); setFsCam(null); }} style={{ position: 'absolute' as const, top: 8, right: 8, zIndex: 10, width: 30, height: 30, borderRadius: 5, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>}
        </div>;
    };

    // ═══ RENDER ═══
    return (<>
        <PageMeta title="Vision — Camera Wall" />
        <div style={{ display: 'flex', flexDirection: 'column' as const, height: 'calc(100vh - 56px)', margin: '-24px -24px -80px', background: '#060810', overflow: 'hidden' }}>

            {/* TOP BAR */}
            <div style={{ padding: '4px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, flexWrap: 'wrap' as const, background: theme.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginRight: 2 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 5, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📹</div>
                    <div><div style={{ fontSize: 10, fontWeight: 800, color: theme.text, letterSpacing: '0.06em' }}>VISION</div></div>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', gap: 2 }}>
                    {[{ l: 'On', c: sc.on, color: '#22c55e', k: 'online' }, { l: 'Off', c: sc.off, color: '#ef4444', k: 'offline' }, { l: 'Mt', c: sc.mt, color: '#f59e0b', k: 'maintenance' }].filter(s => s.c > 0).map(s => <button key={s.k} onClick={() => setStatusF(p => p === s.k ? 'all' : s.k)} style={{ padding: '1px 4px', borderRadius: 3, border: `1px solid ${statusF === s.k ? s.color + '40' : theme.border}`, background: statusF === s.k ? `${s.color}08` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 2 }}><div style={{ width: 3, height: 3, borderRadius: '50%', background: s.color }} /><span style={{ fontSize: 8, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.c}</span></button>)}
                    {alertC > 0 && <span style={{ padding: '1px 4px', borderRadius: 3, border: '1px solid #ef444420', fontSize: 8, fontWeight: 800, color: '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>🚨{alertC}</span>}
                </div>

                {/* Group filter */}
                <select value={groupF} onChange={e => setGroupF(e.target.value)} style={{ padding: '2px 4px', borderRadius: 3, border: `1px solid ${groupF !== 'all' ? '#8b5cf640' : theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 8, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                    {camGroups.map(g => <option key={g.id} value={g.id}>{g.icon} {g.label}</option>)}
                </select>

                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: theme.bgInput, border: `1px solid ${search ? theme.accent + '40' : theme.border}`, borderRadius: 3, padding: '0 5px', flex: '1 1 100px', minWidth: 70, maxWidth: 180 }}>
                    <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '2px 0', color: theme.text, fontSize: 8, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                </div>

                <div style={{ width: 1, height: 14, background: theme.border, flexShrink: 0 }} />

                {/* View mode + layout */}
                <div style={{ display: 'flex', gap: 1 }}>
                    <button onClick={() => setViewMode('grid')} style={{ padding: '2px 4px', borderRadius: 3, border: `1px solid ${viewMode === 'grid' ? theme.accent + '35' : theme.border}`, background: viewMode === 'grid' ? `${theme.accent}06` : 'transparent', color: viewMode === 'grid' ? theme.accent : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>▦ Grid</button>
                    <button onClick={() => setViewMode('map')} style={{ padding: '2px 4px', borderRadius: 3, border: `1px solid ${viewMode === 'map' ? '#22c55e35' : theme.border}`, background: viewMode === 'map' ? '#22c55e06' : 'transparent', color: viewMode === 'map' ? '#22c55e' : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>🗺️ Map</button>
                </div>
                {viewMode === 'grid' && <div style={{ display: 'flex', gap: 1 }}>
                    {(['1x1', '2x2', '3x3', '4x4'] as Grid[]).map(l => <button key={l} onClick={() => setLayout(l)} style={{ padding: '1px 3px', borderRadius: 2, border: `1px solid ${layout === l ? theme.accent + '35' : theme.border}`, background: layout === l ? `${theme.accent}06` : 'transparent', color: layout === l ? theme.accent : theme.textDim, fontSize: 7, fontWeight: 700, cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace" }}>{l}</button>)}
                </div>}

                <div style={{ width: 1, height: 14, background: theme.border, flexShrink: 0 }} />

                {/* Toggles */}
                <div style={{ display: 'flex', gap: 1 }}>
                    {[
                        { k: 'ai', l: '🤖', on: showAi, fn: () => setShowAi(p => !p), t: 'AI' },
                        { k: 'info', l: 'ℹ️', on: showInfo, fn: () => setShowInfo(p => !p), t: 'Info' },
                        { k: 'alerts', l: '🚨', on: showAlerts, fn: () => setShowAlerts(p => !p), t: 'Alerts' },
                        { k: 'wave', l: '〰️', on: showWaveform, fn: () => setShowWaveform(p => !p), t: 'Waveform' },
                        { k: 'mute', l: gMute ? '🔇' : '🔊', on: !gMute, fn: () => setGMute(p => !p), t: 'Audio' },
                        { k: 'rec', l: '⏺', on: gRec, fn: () => setGRec(p => !p), t: 'Rec All' },
                        { k: 'nv', l: '🌙', on: gNV, fn: () => setGNV(p => !p), t: 'NV' },
                        { k: 'sync', l: '🔗', on: syncPlayback, fn: () => setSyncPlayback(p => !p), t: 'Sync' },
                    ].map(t => <button key={t.k} onClick={t.fn} title={t.t} style={{ padding: '1px 3px', borderRadius: 2, border: `1px solid ${t.on ? (t.k === 'rec' ? '#ef444435' : t.k === 'nv' ? '#22c55e35' : theme.accent + '35') : theme.border}`, background: t.on ? `${t.k === 'rec' ? '#ef4444' : t.k === 'nv' ? '#22c55e' : theme.accent}08` : 'transparent', color: t.on ? (t.k === 'rec' ? '#ef4444' : t.k === 'nv' ? '#22c55e' : theme.accent) : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>{t.l}</button>)}
                </div>

                <div style={{ width: 1, height: 14, background: theme.border, flexShrink: 0 }} />

                {/* Side panel buttons */}
                <div style={{ display: 'flex', gap: 1 }}>
                    {[
                        { k: 'faces' as SidePanel, l: '🧑 Faces', c: mockFaces.length },
                        { k: 'bandwidth' as SidePanel, l: `📊 ${totalBw.toFixed(0)}M` },
                        { k: 'presets' as SidePanel, l: '💾 Presets' },
                        { k: 'timeline' as SidePanel, l: '⏱️ Timeline' },
                        { k: 'motionZones' as SidePanel, l: '🎯 Zones' },
                    ].map(p => <button key={p.k} onClick={() => setSidePanel(prev => prev === p.k ? null : p.k)} style={{ padding: '1px 4px', borderRadius: 2, border: `1px solid ${sidePanel === p.k ? '#8b5cf640' : theme.border}`, background: sidePanel === p.k ? '#8b5cf606' : 'transparent', color: sidePanel === p.k ? '#8b5cf6' : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>{p.l}</button>)}
                </div>

                {/* Clock + count */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 7, color: theme.textDim }}><span style={{ fontWeight: 700, color: theme.accent }}>{filtered.length}</span>/{allCams.length}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: theme.text, fontFamily: "'JetBrains Mono',monospace", padding: '1px 4px', borderRadius: 2, background: `${theme.border}30` }}>{clock}</span>
                </div>
            </div>

            {/* MAIN AREA */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
                {/* Camera grid or map */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const }}>
                    {viewMode === 'grid' ? <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2, padding: 2, overflow: 'auto', alignContent: 'start', background: '#060810' }}>
                        {filtered.length === 0 && <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: 40 }}><div style={{ fontSize: 24, opacity: 0.2, marginBottom: 4 }}>📹</div><div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary }}>No cameras match</div></div>}
                        {filtered.map(d => <Tile key={d.id} dev={d} />)}
                    </div> : /* Map view */
                    <div style={{ flex: 1, background: '#0a0e16', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const, overflow: 'hidden' }}>
                        {/* Simple world map placeholder with camera dots */}
                        <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%', maxWidth: 900 }}>
                            <rect width="800" height="400" fill="#0a0e16" />
                            <text x="400" y="30" textAnchor="middle" fill={theme.textDim} fontSize="11" fontWeight="700">CAMERA NETWORK — GLOBAL VIEW</text>
                            {/* Simplified continents */}
                            <ellipse cx="200" cy="180" rx="120" ry="80" fill="none" stroke={theme.border} strokeWidth="0.5" />
                            <ellipse cx="350" cy="150" rx="80" ry="90" fill="none" stroke={theme.border} strokeWidth="0.5" />
                            <ellipse cx="550" cy="170" rx="100" ry="70" fill="none" stroke={theme.border} strokeWidth="0.5" />
                            {/* Camera positions */}
                            {allCams.map(d => {
                                const x = (((d.lng ?? 0) + 180) / 360) * 700 + 50;
                                const y = ((90 - (d.lat ?? 0)) / 180) * 350 + 25;
                                const stc = d.status === 'Online' ? '#22c55e' : '#ef4444';
                                const sel = selCam === d.id;
                                return <g key={d.id} onClick={() => { setSelCam(d.id); setSidePanel('detail'); }} style={{ cursor: 'pointer' }}>
                                    {sel && <circle cx={x} cy={y} r="14" fill="none" stroke={theme.accent} strokeWidth="1" opacity="0.4" />}
                                    {/* FOV cone */}
                                    <path d={`M${x},${y} L${x - 15},${y - 25} L${x + 15},${y - 25} Z`} fill={`${stc}15`} stroke={`${stc}30`} strokeWidth="0.5" />
                                    <circle cx={x} cy={y} r={sel ? 5 : 3.5} fill={stc} stroke="#000" strokeWidth="1" />
                                    <text x={x} y={y + 12} textAnchor="middle" fill={theme.textDim} fontSize="5" fontWeight="600">{d.name.length > 15 ? d.name.slice(0, 15) + '…' : d.name}</text>
                                </g>;
                            })}
                        </svg>
                    </div>}

                    {/* Recording timeline bar */}
                    {syncPlayback && <div style={{ padding: '4px 10px', borderTop: `1px solid ${theme.border}`, background: theme.bg, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 7, color: theme.textDim }}>00:00</span>
                            <div style={{ flex: 1, height: 8, borderRadius: 3, background: `${theme.border}30`, position: 'relative' as const, overflow: 'hidden', cursor: 'pointer' }} onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setTimelineCursor(Math.round(((e.clientX - r.left) / r.width) * 100)); }}>
                                {mockTimeline.map((seg, i) => <div key={i} style={{ position: 'absolute' as const, left: `${seg.start}%`, width: `${seg.end - seg.start}%`, height: '100%', background: seg.color, opacity: 0.6 }} />)}
                                <div style={{ position: 'absolute' as const, left: `${timelineCursor}%`, top: 0, bottom: 0, width: 2, background: '#fff', borderRadius: 1, transform: 'translateX(-1px)', boxShadow: '0 0 4px rgba(255,255,255,0.5)' }} />
                            </div>
                            <span style={{ fontSize: 7, color: theme.textDim }}>24:00</span>
                            <div style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
                                {[{ c: '#22c55e', l: 'Rec' }, { c: '#ef4444', l: 'Alert' }, { c: '#f59e0b', l: 'Motion' }].map(lg => <div key={lg.l} style={{ display: 'flex', alignItems: 'center', gap: 2 }}><div style={{ width: 6, height: 4, borderRadius: 1, background: lg.c }} /><span style={{ fontSize: 6, color: theme.textDim }}>{lg.l}</span></div>)}
                            </div>
                        </div>
                    </div>}
                </div>

                {/* SIDE PANEL */}
                {sidePanel && <div style={{ width: 240, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                    {/* Panel header */}
                    <div style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 11 }}>{sidePanel === 'detail' ? '📹' : sidePanel === 'faces' ? '🧑' : sidePanel === 'bandwidth' ? '📊' : sidePanel === 'presets' ? '💾' : sidePanel === 'ptz' ? '🎛️' : sidePanel === 'timeline' ? '⏱️' : '🎯'}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: theme.text, flex: 1 }}>{sidePanel === 'detail' ? (allCams.find(c => c.id === selCam)?.name || 'Select camera') : sidePanel === 'faces' ? 'Face Queue' : sidePanel === 'bandwidth' ? 'Bandwidth' : sidePanel === 'presets' ? 'Screen Presets' : sidePanel === 'ptz' ? 'PTZ Control' : sidePanel === 'timeline' ? 'Recording' : 'Motion Zones'}</span>
                        <button onClick={() => setSidePanel(null)} style={{ width: 16, height: 16, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>

                    {/* Detail panel */}
                    {sidePanel === 'detail' && selCam && (() => { const d = allCams.find(c => c.id === selCam); const m = cams[selCam]; if (!d || !m) return null; const stc = d.status === 'Online' ? '#22c55e' : '#ef4444'; return <>
                        <div style={{ padding: '4px 10px', borderBottom: `1px solid ${theme.border}`, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
                            {[{ i: m.paused ? '▶' : '⏸', fn: () => upCam(d.id, { paused: !m.paused }) }, { i: m.muted ? '🔇' : '🔊', fn: () => upCam(d.id, { muted: !m.muted }) }, { i: '⏺', fn: () => upCam(d.id, { rec: !m.rec }) }, { i: '🌙', fn: () => upCam(d.id, { nv: !m.nv }) }, { i: '⛶', fn: () => setFsCam(d.id) }, { i: '🪟', fn: () => openPopup(d) }].map((a, i) => <button key={i} onClick={a.fn} style={{ padding: '2px', borderRadius: 2, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, cursor: 'pointer' }}>{a.i}</button>)}
                        </div>
                        <div style={{ padding: '4px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ fontSize: 6, color: theme.textDim }}>Vol</span><input type="range" min={0} max={100} value={m.vol} onChange={e => upCam(d.id, { vol: parseInt(e.target.value) })} style={{ flex: 1, height: 2, accentColor: '#3b82f6' }} /><span style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace", width: 20 }}>{m.vol}%</span></div>
                        <div style={{ padding: '4px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 6, color: theme.textDim, marginBottom: 1 }}>Speed</div><div style={{ display: 'flex', gap: 1 }}>{[0.5, 1, 1.5, 2].map(s => <button key={s} onClick={() => upCam(d.id, { playbackRate: s })} style={{ flex: 1, padding: '1px', borderRadius: 2, border: `1px solid ${m.playbackRate === s ? '#3b82f640' : theme.border}`, background: m.playbackRate === s ? '#3b82f608' : 'transparent', color: m.playbackRate === s ? '#3b82f6' : theme.textDim, fontSize: 6, fontWeight: 700, cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace" }}>{s}×</button>)}</div></div>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 6, color: theme.textDim, marginBottom: 1 }}>Zoom</div><div style={{ display: 'flex', alignItems: 'center', gap: 1 }}><button onClick={() => upCam(d.id, { zoom: Math.max(1, m.zoom - 0.5) })} style={{ width: 14, height: 14, borderRadius: 2, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button><span style={{ flex: 1, textAlign: 'center' as const, fontSize: 7, fontWeight: 700, color: m.zoom > 1 ? '#a855f7' : theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{m.zoom.toFixed(1)}×</span><button onClick={() => upCam(d.id, { zoom: Math.min(4, m.zoom + 0.5) })} style={{ width: 14, height: 14, borderRadius: 2, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button></div></div>
                        </div>
                        <div style={{ padding: '5px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                            {[{ l: 'Location', v: d.locationName }, { l: 'Device', v: `${d.manufacturer} ${d.model}` }, { l: 'Resolution', v: d.resolution || '—' }, { l: 'Protocol', v: d.protocol }, { l: 'IP', v: d.ipAddress }, { l: 'Signal', v: `${d.signalStrength}%` }, { l: 'Bandwidth', v: `${m.bw.toFixed(1)} Mbps` }, { l: 'Storage', v: d.storageCapacity || '—' }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: theme.text, textAlign: 'right' as const }}>{r.v}</span></div>)}
                        </div>
                        {m.dets.length > 0 && <div style={{ padding: '5px 10px', borderBottom: `1px solid ${theme.border}` }}><div style={{ fontSize: 7, fontWeight: 700, color: theme.accent, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 2 }}>🤖 AI</div>{m.dets.map(det => <div key={det.id} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 0', fontSize: 7 }}><span>{det.type === 'face' ? '🧑' : det.type === 'vehicle' ? '🚗' : det.type === 'lpr' ? '🔢' : '👤'}</span><span style={{ color: theme.text, flex: 1 }}>{det.type === 'lpr' ? det.label : det.personName || det.type}</span><span style={{ fontWeight: 700, color: det.conf >= 90 ? '#22c55e' : '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>{det.conf}%</span></div>)}</div>}
                        {m.alerts.length > 0 && <div style={{ padding: '5px 10px', borderBottom: `1px solid ${theme.border}` }}><div style={{ fontSize: 7, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 2 }}>🚨 Alerts</div>{m.alerts.map(a => <div key={a.id} style={{ padding: '2px 3px', marginBottom: 1, borderRadius: 2, background: `${a.sev === 'critical' ? '#ef4444' : '#f97316'}08`, fontSize: 6, color: theme.text, display: 'flex', gap: 2, alignItems: 'center' }}><span>{a.icon}</span><span style={{ flex: 1 }}>{a.title}</span></div>)}</div>}
                        <div style={{ padding: '5px 10px', marginTop: 'auto', display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                            <a href={`/devices/${d.id}`} style={{ fontSize: 6, padding: '2px 5px', borderRadius: 2, border: `1px solid ${theme.accent}25`, color: theme.accent, textDecoration: 'none' }}>📡 Device</a>
                            <a href="/map" style={{ fontSize: 6, padding: '2px 5px', borderRadius: 2, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none' }}>🗺️ Map</a>
                        </div>
                    </>; })()}

                    {/* Face recognition queue */}
                    {sidePanel === 'faces' && <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const }}>
                        <div style={{ padding: '4px 10px', borderBottom: `1px solid ${theme.border}`, fontSize: 7, color: theme.textDim }}>{mockFaces.length} detections · Last 30 min</div>
                        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                            {mockFaces.map(f => <div key={f.id} onClick={() => { setSelCam(f.camId); setSidePanel('detail'); }} style={{ padding: '5px 10px', borderBottom: `1px solid ${theme.border}08`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${f.conf >= 90 ? '#22c55e' : f.conf >= 80 ? '#f59e0b' : '#ef4444'}15`, border: `1.5px solid ${f.conf >= 90 ? '#22c55e' : f.conf >= 80 ? '#f59e0b' : '#ef4444'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>🧑</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 8, fontWeight: 700, color: f.personName.startsWith('Unknown') ? theme.textDim : theme.text }}>{f.personName}</div>
                                    <div style={{ fontSize: 6, color: theme.textDim }}>{f.camName} · {f.time}</div>
                                </div>
                                <span style={{ fontSize: 8, fontWeight: 800, color: f.conf >= 90 ? '#22c55e' : f.conf >= 80 ? '#f59e0b' : '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>{f.conf}%</span>
                            </div>)}
                        </div>
                    </div>}

                    {/* Bandwidth monitor */}
                    {sidePanel === 'bandwidth' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                        <div style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.border}` }}>
                            <div style={{ fontSize: 7, color: theme.textDim, marginBottom: 2 }}>Total Throughput</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: totalBw > 80 ? '#ef4444' : '#22c55e', fontFamily: "'JetBrains Mono',monospace" }}>{totalBw.toFixed(1)} <span style={{ fontSize: 8, fontWeight: 400, color: theme.textDim }}>Mbps</span></div>
                            <div style={{ height: 4, borderRadius: 2, background: `${theme.border}30`, marginTop: 4, overflow: 'hidden' }}><div style={{ width: `${Math.min(100, (totalBw / 120) * 100)}%`, height: '100%', background: totalBw > 80 ? '#ef4444' : '#22c55e', borderRadius: 2, transition: 'width 0.5s' }} /></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6, color: theme.textDim, marginTop: 1 }}><span>0</span><span>120 Mbps capacity</span></div>
                        </div>
                        {allCams.filter(d => d.status === 'Online').sort((a, b) => (cams[b.id]?.bw || 0) - (cams[a.id]?.bw || 0)).map(d => {
                            const m = cams[d.id]; if (!m) return null;
                            return <div key={d.id} style={{ padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: `1px solid ${theme.border}06` }}>
                                <span style={{ fontSize: 7, color: theme.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.name}</span>
                                <div style={{ width: 40, height: 3, borderRadius: 1, background: `${theme.border}30`, overflow: 'hidden' }}><div style={{ width: `${(m.bw / 20) * 100}%`, height: '100%', background: m.bw > 15 ? '#ef4444' : '#22c55e', borderRadius: 1 }} /></div>
                                <span style={{ fontSize: 7, fontWeight: 700, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace", width: 30, textAlign: 'right' as const }}>{m.bw.toFixed(1)}M</span>
                            </div>;
                        })}
                    </div>}

                    {/* Screen presets */}
                    {sidePanel === 'presets' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                        {presets.map(p => <div key={p.id} onClick={() => applyPreset(p)} style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.border}08`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ width: 22, height: 22, borderRadius: 4, background: '#8b5cf608', border: '1px solid #8b5cf620', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>💾</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{p.name}</div>
                                <div style={{ fontSize: 6, color: theme.textDim }}>{p.layout} · {camGroups.find(g => g.id === p.group)?.label} · {p.filters}</div>
                            </div>
                        </div>)}
                        <div style={{ padding: '8px 10px' }}>
                            <button onClick={() => { setPresets(p => [...p, { id: `ps-${Date.now()}`, name: `Custom ${presets.length + 1}`, layout, group: groupF, filters: statusF }]); }} style={{ width: '100%', padding: '5px', borderRadius: 4, border: `1px dashed ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, cursor: 'pointer', fontFamily: 'inherit' }}>+ Save Current View</button>
                        </div>
                    </div>}

                    {/* PTZ controls */}
                    {sidePanel === 'ptz' && <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' as const, gap: 8, alignItems: 'center' }}>
                        <div style={{ fontSize: 7, color: theme.textDim, textAlign: 'center' as const }}>PTZ Control — {allCams.find(c => c.id === selCam)?.name || 'Select PTZ camera'}</div>
                        {/* Joystick */}
                        <div style={{ width: 120, height: 120, borderRadius: '50%', border: `2px solid ${theme.border}`, background: `${theme.border}10`, position: 'relative' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {[{ dir: 'up', x: 50, y: 8, icon: '▲' }, { dir: 'down', x: 50, y: 78, icon: '▼' }, { dir: 'left', x: 8, y: 50, icon: '◀' }, { dir: 'right', x: 78, y: 50, icon: '▶' }].map(b => <button key={b.dir} onMouseDown={() => { if (b.dir === 'up') setPtzTilt(p => Math.min(90, p + 10)); if (b.dir === 'down') setPtzTilt(p => Math.max(-90, p - 10)); if (b.dir === 'left') setPtzPan(p => p - 15); if (b.dir === 'right') setPtzPan(p => p + 15); }} style={{ position: 'absolute' as const, left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%,-50%)', width: 24, height: 24, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'rgba(59,130,246,0.08)', color: '#06b6d4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>{b.icon}</button>)}
                            <div style={{ fontSize: 8, fontWeight: 700, color: '#06b6d4', fontFamily: "'JetBrains Mono',monospace" }}>PTZ</div>
                        </div>
                        {/* Readout */}
                        <div style={{ display: 'flex', gap: 6, fontSize: 8, color: theme.textDim }}>
                            <span>Pan: <span style={{ color: '#06b6d4', fontWeight: 700 }}>{ptzPan}°</span></span>
                            <span>Tilt: <span style={{ color: '#06b6d4', fontWeight: 700 }}>{ptzTilt}°</span></span>
                        </div>
                        {/* Zoom slider */}
                        <div style={{ width: '100%' }}>
                            <div style={{ fontSize: 7, color: theme.textDim, marginBottom: 2, display: 'flex', justifyContent: 'space-between' }}><span>Optical Zoom</span><span style={{ color: '#a855f7', fontWeight: 700 }}>{ptzZoom.toFixed(1)}×</span></div>
                            <input type="range" min={1} max={30} step={0.5} value={ptzZoom} onChange={e => setPtzZoom(parseFloat(e.target.value))} style={{ width: '100%', height: 3, accentColor: '#a855f7' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6, color: theme.textDim }}><span>1×</span><span>30×</span></div>
                        </div>
                        {/* Presets */}
                        <div style={{ width: '100%' }}><div style={{ fontSize: 7, color: theme.textDim, marginBottom: 2 }}>PTZ Presets</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                                {['Home', 'Gate', 'Dock', 'Road', 'Fence', 'Custom'].map(p => <button key={p} onClick={() => { setPtzPan(0); setPtzTilt(0); setPtzZoom(1); }} style={{ padding: '3px', borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>)}
                            </div>
                        </div>
                    </div>}

                    {/* Recording timeline */}
                    {sidePanel === 'timeline' && <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                        <div style={{ fontSize: 7, color: theme.textDim }}>24-Hour Recording Timeline</div>
                        {/* Mini timelines per camera */}
                        {allCams.filter(d => d.status === 'Online').slice(0, 6).map(d => <div key={d.id}>
                            <div style={{ fontSize: 6, color: theme.textDim, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.name}</div>
                            <div style={{ height: 6, borderRadius: 2, background: `${theme.border}20`, position: 'relative' as const, overflow: 'hidden' }}>
                                {mockTimeline.map((seg, i) => <div key={i} style={{ position: 'absolute' as const, left: `${seg.start}%`, width: `${seg.end - seg.start}%`, height: '100%', background: seg.color, opacity: 0.5 }} />)}
                            </div>
                        </div>)}
                        <div style={{ marginTop: 'auto', fontSize: 6, color: theme.textDim }}>
                            {[{ c: '#22c55e', l: 'Recording' }, { c: '#ef4444', l: 'Alert event' }, { c: '#f59e0b', l: 'Motion' }].map(lg => <div key={lg.l} style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 1 }}><div style={{ width: 8, height: 4, borderRadius: 1, background: lg.c, opacity: 0.6 }} /><span>{lg.l}</span></div>)}
                        </div>
                    </div>}

                    {/* Motion zones */}
                    {sidePanel === 'motionZones' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                        <div style={{ padding: '4px 10px', borderBottom: `1px solid ${theme.border}`, fontSize: 7, color: theme.textDim }}>{motionZones.length} zones configured</div>
                        {motionZones.map(mz => {
                            const d = allCams.find(c => c.id === mz.camId);
                            return <div key={mz.id} style={{ padding: '5px 10px', borderBottom: `1px solid ${theme.border}08`, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 16, height: 16, borderRadius: 3, border: `1.5px dashed ${mz.type === 'include' ? '#22c55e' : '#ef4444'}60`, background: `${mz.type === 'include' ? '#22c55e' : '#ef4444'}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, flexShrink: 0 }}>{mz.type === 'include' ? '✓' : '✕'}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 8, fontWeight: 600, color: theme.text }}>{d?.name || 'Unknown'}</div>
                                    <div style={{ fontSize: 6, color: theme.textDim }}>{mz.type} · {mz.w}×{mz.h}% area</div>
                                </div>
                                <button onClick={() => setMotionZones(p => p.filter(z => z.id !== mz.id))} style={{ width: 14, height: 14, borderRadius: 2, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, cursor: 'pointer', fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                            </div>;
                        })}
                        <div style={{ padding: '6px 10px' }}>
                            <button onClick={() => setMotionZones(p => [...p, { id: `mz-${Date.now()}`, camId: selCam || 1, type: 'include', x: 10 + Math.random() * 40, y: 10 + Math.random() * 40, w: 20 + Math.random() * 20, h: 20 + Math.random() * 20 }])} style={{ width: '100%', padding: '4px', borderRadius: 3, border: `1px dashed ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Zone to {allCams.find(c => c.id === (selCam || 1))?.name?.slice(0, 15) || 'Camera'}</button>
                        </div>
                    </div>}
                </div>}
            </div>

            {/* BOTTOM */}
            <div style={{ padding: '2px 10px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 3px #22c55e50' }} /><span style={{ fontWeight: 600, color: '#22c55e' }}>Online</span><span>·</span>
                <span>{allCams.length} cams · {sc.on} live · {Object.values(cams).filter(m => m.rec).length} rec · BW: {totalBw.toFixed(0)}M/{120}M</span>
                <div style={{ flex: 1 }} /><span>RTSP/ONVIF · AES-256 · MinIO</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
            </div>
        </div>
    </>);
}

VisionIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default VisionIndex;
