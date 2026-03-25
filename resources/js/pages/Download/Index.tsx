import PageMeta from '../../components/layout/PageMeta';
import { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { releases, releaseNotes, deploymentTypes, systemRequirements, platformColors, detectCurrentPlatform, APP_VERSION, BUILD_DATE, BUILD_NUMBER } from './mockData';
import type { Platform, Tab } from './mockData';
import './download.css';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Download Client  ·  Multi-Platform Native Application
   Desktop: Windows, Linux, macOS  ·  Mobile: Android, iOS
   ═══════════════════════════════════════════════════════════════ */

// ═══ QR CODE ═══
function QRCode({ data, size = 120, color = '#ffffff' }: { data: string; size?: number; color?: string }) {
    const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return Math.abs(h); };
    const seed = hash(data); const gs = 21; const cs = size / gs;
    const cells: boolean[][] = [];
    for (let y = 0; y < gs; y++) { cells[y] = []; for (let x = 0; x < gs; x++) { const tl = x < 7 && y < 7, tr = x >= gs - 7 && y < 7, bl = x < 7 && y >= gs - 7; if (tl || tr || bl) { const fx = tl ? x : tr ? x-(gs-7) : x; const fy = tl ? y : tr ? y : y-(gs-7); cells[y][x] = (fx===0||fx===6||fy===0||fy===6) || (fx>=2&&fx<=4&&fy>=2&&fy<=4); } else if (x===6) cells[y][x]=y%2===0; else if (y===6) cells[y][x]=x%2===0; else cells[y][x]=(seed*(x+1)*(y+1)+x*7+y*13)%100<45; } }
    return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{cells.map((row,y)=>row.map((c,x)=>c?<rect key={`${x}-${y}`} x={x*cs} y={y*cs} width={cs} height={cs} fill={color}/>:null))}</svg>;
}

// ═══ SKELETON ═══
function Skeleton({ w, h, r = 6 }: { w: string | number; h: number; r?: number }) {
    return <div className="dl-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h, borderRadius: r }} />;
}

function SkeletonCards({ count = 4 }: { count?: number }) {
    return <div className="dl-grid-desktop" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12, padding: 20 }}>
        {Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: 20, borderRadius: 12, border: `1px solid ${theme.border}` }}><div style={{ display: 'flex', gap: 12, marginBottom: 14 }}><Skeleton w={48} h={48} r={10} /><div style={{ flex: 1 }}><Skeleton w="60%" h={16} /><Skeleton w="40%" h={10} /></div></div><Skeleton w="100%" h={10} /><div style={{ display: 'flex', gap: 4, marginTop: 10 }}><Skeleton w={60} h={22} /><Skeleton w={60} h={22} /><Skeleton w={60} h={22} /></div><div style={{ display: 'flex', gap: 8, marginTop: 14 }}><Skeleton w="70%" h={36} /><Skeleton w="30%" h={36} /></div></div>)}
    </div>;
}

function DownloadIndex() {
    const [tab, setTab] = useState<Tab>('desktop');
    const [selRelease, setSelRelease] = useState<string | null>(null);
    const [copiedHash, setCopiedHash] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [topLoader, setTopLoader] = useState(0);
    const topTimer = useRef<number | null>(null);
    const currentPlatform = detectCurrentPlatform();
    const rel = selRelease ? releases.find(r => r.filename === selRelease) : null;
    const desktopReleases = releases.filter(r => ['windows', 'linux', 'macos'].includes(r.platform));
    const mobileReleases = releases.filter(r => ['android', 'ios'].includes(r.platform));

    // Simulate loading
    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

    // Top loader
    const triggerLoader = useCallback(() => {
        if (topTimer.current) clearTimeout(topTimer.current);
        setTopLoader(30);
        topTimer.current = window.setTimeout(() => { setTopLoader(70); topTimer.current = window.setTimeout(() => { setTopLoader(100); topTimer.current = window.setTimeout(() => setTopLoader(0), 400); }, 200); }, 150);
    }, []);

    const switchTab = useCallback((t: Tab) => { setTab(t); triggerLoader(); setSelRelease(null); }, [triggerLoader]);
    const copyHash = (hash: string, filename: string) => { navigator.clipboard.writeText(hash).then(() => { setCopiedHash(filename); setTimeout(() => setCopiedHash(null), 2000); }); };

    // ═══ Keyboard Shortcuts ═══
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Don't capture when typing in inputs
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
            switch (e.key) {
                case '1': switchTab('desktop'); break;
                case '2': switchTab('mobile'); break;
                case '3': switchTab('deployment'); break;
                case '4': switchTab('releases'); break;
                case 'd': case 'D': {
                    // Download recommended package
                    const rec = releases.find(r => r.platform === currentPlatform);
                    if (rec) { triggerLoader(); }
                    break;
                }
                case 'Escape': setSelRelease(null); break;
                case '?': {
                    // Show shortcuts hint (toggle)
                    const el = document.getElementById('dl-shortcuts-hint');
                    if (el) el.style.display = el.style.display === 'none' ? 'flex' : 'none';
                    break;
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [switchTab, currentPlatform, triggerLoader]);

    const pc = (p: Platform) => platformColors[p];

    return (<>
        <PageMeta title="Download Client" />
        <div className="dl-page" data-testid="download-page">

            {/* LEFT SIDEBAR */}
            <div className="dl-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#3b82f610', border: '1px solid #3b82f625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⬇️</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>DOWNLOAD</div><div style={{ fontSize: 10, color: theme.textDim }}>Client Applications</div></div>
                    </div>
                </div>

                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>Current Release</div>
                    {[{ l: 'Version', v: APP_VERSION, c: theme.accent }, { l: 'Build', v: BUILD_NUMBER, c: theme.text }, { l: 'Date', v: BUILD_DATE, c: theme.text }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}><span style={{ color: theme.textDim }}>{r.l}</span><span style={{ color: r.c, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{r.v}</span></div>)}
                </div>

                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>Detected Platform</div>
                    <div style={{ padding: '8px 10px', borderRadius: 6, background: `${pc(currentPlatform)}10`, border: `1px solid ${pc(currentPlatform)}25`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{releases.find(r => r.platform === currentPlatform)?.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: pc(currentPlatform) }}>{releases.find(r => r.platform === currentPlatform)?.label}</span>
                    </div>
                </div>

                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ n: 5, l: 'Platforms' }, { n: releases.length, l: 'Packages' }, { n: '2.4K', l: 'Installs' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.accent, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Platforms</div>
                    {(['windows', 'linux', 'macos', 'android', 'ios'] as Platform[]).map(p => { const r = releases.find(rl => rl.platform === p)!; const cnt = releases.filter(rl => rl.platform === p).length; return <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 4, marginBottom: 2, fontSize: 11, color: theme.textDim }}><span style={{ fontSize: 14 }}>{r.icon}</span><span style={{ flex: 1 }}>{r.label.split(' ')[0]}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{cnt}</span></div>; })}
                </div>

                {/* Keyboard shortcuts */}
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Shortcuts</div>
                    {[{ k: '1', d: 'Desktop tab' }, { k: '2', d: 'Mobile tab' }, { k: '3', d: 'Deployment' }, { k: '4', d: 'Releases' }, { k: 'D', d: 'Download' }, { k: 'Esc', d: 'Close panel' }].map(s => <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}><span className="dl-kbd">{s.k}</span><span style={{ fontSize: 10, color: theme.textDim }}>{s.d}</span></div>)}
                </div>

                <div style={{ padding: '10px 16px', marginTop: 'auto' }}>
                    {[{ l: '🧑 Profile', h: '/profile' }, { l: '📊 Dashboard', h: '/map' }, { l: '⚙️ Jobs', h: '/jobs' }].map(lk => <a key={lk.h} href={lk.h} style={{ display: 'block', fontSize: 10, color: theme.textDim, textDecoration: 'none', padding: '3px 0' }}>{lk.l}</a>)}
                </div>
            </div>

            {/* CENTER */}
            <div className="dl-center" style={{ position: 'relative' as const }}>
                {/* Top Loader */}
                {topLoader > 0 && <div className="dl-loader"><div className={`dl-loader-bar${topLoader===100?' done':''}`} style={{ width: `${topLoader}%`, background: `linear-gradient(90deg, ${theme.accent}, #8b5cf6)`, boxShadow: `0 0 10px ${theme.accent}60`, opacity: topLoader===100?0:1 }}><div className="dl-loader-shimmer" /></div></div>}

                {/* Tab bar */}
                <div className="dl-tab-bar" style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {([
                        { id: 'desktop' as Tab, l: '🖥️ Desktop', n: desktopReleases.length, k: '1' },
                        { id: 'mobile' as Tab, l: '📱 Mobile', n: mobileReleases.length, k: '2' },
                        { id: 'deployment' as Tab, l: '🚀 Deploy', n: 3, k: '3' },
                        { id: 'releases' as Tab, l: '📋 Releases', n: releaseNotes.length, k: '4' },
                    ]).map(t => <button key={t.id} onClick={() => switchTab(t.id)} data-testid={`tab-${t.id}`} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab===t.id?'#3b82f6':'transparent'}`, background: 'transparent', color: tab===t.id?theme.text:theme.textDim, fontSize: 13, fontWeight: tab===t.id?700:500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const }}>
                        {t.l} <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: `${tab===t.id?'#3b82f6':theme.border}20`, color: tab===t.id?'#3b82f6':theme.textDim }}>{t.n}</span>
                        <span className="dl-kbd" style={{ marginLeft: 4 }}>{t.k}</span>
                    </button>)}
                </div>

                <div className="dl-scroll">
                    {/* ═══ LOADING ═══ */}
                    {loading && <SkeletonCards count={4} />}

                    {/* ═══ DESKTOP ═══ */}
                    {!loading && tab === 'desktop' && <div style={{ padding: 20 }}>
                        {/* Recommended banner */}
                        {(() => { const rec = releases.find(r => r.platform === currentPlatform); if (!rec || ['android','ios'].includes(currentPlatform)) return null; return <div className="dl-rec-banner" style={{ padding: '18px 24px', borderRadius: 12, border: `1px solid ${theme.accent}25`, background: `${theme.accent}06`, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 56, height: 56, borderRadius: 12, background: `${pc(rec.platform)}15`, border: `1px solid ${pc(rec.platform)}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{rec.icon}</div>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 17, fontWeight: 800, color: theme.text, marginBottom: 4 }}>Recommended for your system</div><div style={{ fontSize: 12, color: theme.textSecondary }}>{rec.label} · {rec.format} · {rec.size} · {rec.arch}</div></div>
                            <button className="dl-btn-download" style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: theme.accent, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>⬇️ Download <span className="dl-kbd" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>D</span></button>
                        </div>; })()}

                        <div className="dl-grid-desktop" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                            {desktopReleases.map(r => { const sel = selRelease === r.filename; const c = pc(r.platform); return <div key={r.filename} className="dl-card" onClick={() => setSelRelease(r.filename)} data-testid={`card-${r.platform}`} style={{ padding: 18, borderRadius: 12, border: `1px solid ${sel?c+40:theme.border}`, background: sel?`${c}04`:theme.bgCard }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 10, background: `${c}12`, border: `1px solid ${c}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{r.icon}</div>
                                    <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{r.label}</div><div style={{ fontSize: 11, color: theme.textDim }}>{r.format}</div></div>
                                    <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "'JetBrains Mono',monospace" }}>v{r.version}</div><div style={{ fontSize: 10, color: theme.textDim }}>{r.size}</div></div>
                                </div>
                                <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 10 }}>📐 {r.arch} · 💻 {r.minOS}</div>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginBottom: 12 }}>{r.features.map(f => <span key={f} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 4, background: `${theme.border}15`, color: theme.textSecondary }}>{f}</span>)}</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={e => { e.stopPropagation(); triggerLoader(); }} className="dl-btn-download" style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: c, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⬇️ Download</button>
                                    <button onClick={e => { e.stopPropagation(); copyHash(r.sha256, r.filename); }} style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{copiedHash===r.filename?'✅ Copied':'🔒 SHA256'}</button>
                                </div>
                            </div>; })}
                        </div>
                    </div>}

                    {/* ═══ MOBILE ═══ */}
                    {!loading && tab === 'mobile' && <div style={{ padding: 20 }}>
                        <div className="dl-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                            {mobileReleases.map(r => { const c = pc(r.platform); return <div key={r.filename} style={{ borderRadius: 14, border: `1px solid ${c}25`, background: `${c}04`, overflow: 'hidden' }}>
                                <div style={{ padding: '22px 22px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                                        <div style={{ width: 56, height: 56, borderRadius: 14, background: `${c}15`, border: `1px solid ${c}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{r.icon}</div>
                                        <div style={{ flex: 1 }}><div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>{r.label}</div><div style={{ fontSize: 12, color: theme.textDim }}>{r.format} · {r.size}</div></div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: "'JetBrains Mono',monospace" }}>v{r.version}</div>
                                    </div>
                                    <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 10 }}>📐 {r.arch} · 💻 {r.minOS}</div>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginBottom: 14 }}>{r.features.map(f => <span key={f} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 4, background: `${c}10`, color: c, fontWeight: 500 }}>{f}</span>)}</div>
                                </div>
                                <div style={{ padding: '18px 22px', borderTop: `1px solid ${c}15`, background: `${c}03`, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' as const }}>
                                    <div style={{ padding: 10, borderRadius: 10, background: '#fff', flexShrink: 0 }}><QRCode data={`argux://download/${r.platform}/${APP_VERSION}`} size={110} color="#000" /></div>
                                    <div style={{ flex: 1, minWidth: 180 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Scan to install</div>
                                        <div style={{ fontSize: 10, color: theme.textDim, lineHeight: 1.6, marginBottom: 10 }}>{r.platform==='android'?'Scan with your Android camera. APK downloads directly.':'Scan with iPhone camera to open TestFlight.'}</div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                                            <button className="dl-btn-download" onClick={() => triggerLoader()} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: c, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{r.platform==='android'?'⬇️ Download APK':'🍎 TestFlight'}</button>
                                            <button onClick={() => copyHash(r.sha256, r.filename)} style={{ padding: '9px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{copiedHash===r.filename?'✅':'🔒'} SHA256</button>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: '10px 22px', borderTop: `1px solid ${c}10`, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {r.platform==='android'&&<><div style={{ padding: '6px 12px', borderRadius: 5, background: '#000', color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>▶ Google Play</div><div style={{ padding: '6px 12px', borderRadius: 5, background: '#000', color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>Direct APK</div><span style={{ fontSize: 9, color: theme.textDim, marginLeft: 'auto' }}>Also via MDM</span></>}
                                    {r.platform==='ios'&&<><div style={{ padding: '6px 12px', borderRadius: 5, background: '#000', color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>🍎 App Store</div><div style={{ padding: '6px 12px', borderRadius: 5, background: '#007AFF', color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>TestFlight</div><span style={{ fontSize: 9, color: theme.textDim, marginLeft: 'auto' }}>Enterprise dist.</span></>}
                                </div>
                            </div>; })}
                        </div>
                        <div style={{ marginTop: 20, padding: '18px 22px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.bgCard }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 8 }}>📱 Mobile Device Management (MDM)</div>
                            <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>ARGUX supports enterprise deployment via MDM. Distribute silently to managed devices with pre-configured settings.</div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' as const }}>{['Microsoft Intune', 'Jamf Pro', 'VMware Workspace ONE', 'MobileIron'].map(m => <span key={m} style={{ fontSize: 9, padding: '4px 8px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim }}>{m}</span>)}</div>
                        </div>
                    </div>}

                    {/* ═══ DEPLOYMENT ═══ */}
                    {!loading && tab === 'deployment' && <div style={{ padding: 20 }}>
                        <div className="dl-grid-desktop" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 20 }}>
                            {deploymentTypes.map(d => <div key={d.id} style={{ padding: 22, borderRadius: 12, border: `1px solid ${d.color}25`, background: `${d.color}04` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}><span style={{ fontSize: 32 }}>{d.icon}</span><div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>{d.title}</div><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${d.color}15`, color: d.color }}>{d.badge}</span></div></div>
                                <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>{d.desc}</div>
                            </div>)}
                        </div>
                        <div style={{ borderRadius: 12, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            <div style={{ padding: '14px 20px', background: `${theme.border}10`, borderBottom: `1px solid ${theme.border}`, fontSize: 14, fontWeight: 700, color: theme.text }}>📋 System Requirements</div>
                            {systemRequirements.map(r => <div key={r.platform} className="dl-sysreq-row" style={{ padding: '12px 20px', borderBottom: `1px solid ${theme.border}08`, display: 'grid', gridTemplateColumns: '130px 1fr 1fr 1fr 1fr 1fr', gap: 10, alignItems: 'center', fontSize: 10 }}>
                                <span style={{ fontWeight: 700, color: theme.text, fontSize: 11 }}>{r.platform}</span>
                                <span style={{ color: theme.textDim }}>🔲 {r.cpu}</span><span style={{ color: theme.textDim }}>💾 {r.ram}</span><span style={{ color: theme.textDim }}>💿 {r.disk}</span><span style={{ color: theme.textDim }}>📋 {r.os}</span><span style={{ color: theme.textDim }}>{r.extra}</span>
                            </div>)}
                        </div>
                        <div style={{ marginTop: 20, padding: '18px 22px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.bgCard }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>🔒 Integrity Verification</div>
                            <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>All packages are signed and include SHA-256 checksums. Verify integrity before installation.</div>
                            <div style={{ padding: '12px 14px', borderRadius: 8, background: theme.bgInput, border: `1px solid ${theme.border}`, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: theme.textDim, lineHeight: 1.8 }}>
                                <div style={{ color: '#22c55e' }}># Windows (PowerShell)</div><div>Get-FileHash ARGUX_*.exe -Algorithm SHA256</div>
                                <div style={{ marginTop: 6, color: '#22c55e' }}># Linux / macOS</div><div>sha256sum argux_*.deb</div><div>shasum -a 256 ARGUX_*.dmg</div>
                            </div>
                        </div>
                    </div>}

                    {/* ═══ RELEASES ═══ */}
                    {!loading && tab === 'releases' && <div style={{ padding: 20 }}>
                        {releaseNotes.map((rn, i) => <div key={rn.version} style={{ padding: '14px 18px', borderRadius: 10, border: `1px solid ${i===0?theme.accent+'25':theme.border}`, background: i===0?`${theme.accent}04`:'transparent', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: i===0?theme.accent:theme.textDim, marginTop: 4, flexShrink: 0, boxShadow: i===0?`0 0 8px ${theme.accent}`:'' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>v{rn.version}</span>
                                    {i===0&&<span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${theme.accent}15`, color: theme.accent }}>LATEST</span>}
                                    <span style={{ fontSize: 11, color: theme.textDim, marginLeft: 'auto' }}>{rn.date}</span>
                                </div>
                                <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>{rn.notes}</div>
                            </div>
                        </div>)}
                    </div>}
                </div>

                {/* Footer */}
                <div className="dl-footer" style={{ padding: '4px 18px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, fontSize: 9, color: theme.textDim, background: theme.bg }}>
                    <span>{releases.length} packages · 5 platforms · v{APP_VERSION}</span>
                    <div style={{ flex: 1 }} /><span>Tauri v2 · Code-signed · AES-256</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>

            {/* RIGHT: Detail */}
            {rel && tab === 'desktop' && <div className="dl-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${pc(rel.platform)}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{rel.icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{rel.label}</div><div style={{ fontSize: 10, color: theme.textDim }}>{rel.format}</div></div>
                        <button onClick={() => setSelRelease(null)} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                </div>
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                    {[{ l: 'Version', v: `v${rel.version}` }, { l: 'Filename', v: rel.filename }, { l: 'Size', v: rel.size }, { l: 'Architecture', v: rel.arch }, { l: 'Min OS', v: rel.minOS }, { l: 'Build', v: BUILD_NUMBER }, { l: 'Date', v: BUILD_DATE }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 10, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 10, color: theme.text, textAlign: 'right' as const, wordBreak: 'break-all' as const }}>{r.v}</span></div>)}
                </div>
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 6 }}>Features</div>
                    {rel.features.map(f => <div key={f} style={{ fontSize: 10, color: theme.textSecondary, padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#22c55e' }}>✓</span> {f}</div>)}
                </div>
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 6 }}>🔒 SHA-256</div>
                    <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: theme.textSecondary, wordBreak: 'break-all' as const, lineHeight: 1.5 }}>{rel.sha256}</div>
                    <button onClick={() => copyHash(rel.sha256, rel.filename)} style={{ marginTop: 6, width: '100%', padding: '6px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>{copiedHash===rel.filename?'✅ Copied to clipboard':'📋 Copy checksum'}</button>
                </div>
                <div style={{ padding: '10px 16px', marginTop: 'auto' }}>
                    <button className="dl-btn-download" onClick={() => triggerLoader()} style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: pc(rel.platform), color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⬇️ Download {rel.label}</button>
                </div>
            </div>}

            {/* Keyboard shortcuts overlay (hidden by default, toggle with ?) */}
            <div id="dl-shortcuts-hint" style={{ display: 'none', position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) (e.currentTarget as HTMLElement).style.display = 'none'; }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, minWidth: 280, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 14 }}>⌨️ Keyboard Shortcuts</div>
                    {[{ k: '1', d: 'Desktop tab' }, { k: '2', d: 'Mobile tab' }, { k: '3', d: 'Deployment tab' }, { k: '4', d: 'Release Notes tab' }, { k: 'D', d: 'Download recommended' }, { k: 'Esc', d: 'Close detail panel' }, { k: '?', d: 'Toggle this dialog' }].map(s => <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}><span className="dl-kbd" style={{ minWidth: 28 }}>{s.k}</span><span style={{ fontSize: 12, color: theme.textSecondary }}>{s.d}</span></div>)}
                </div>
            </div>
        </div>
    </>);
}

DownloadIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default DownloadIndex;