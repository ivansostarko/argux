import PageMeta from '../../components/layout/PageMeta';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { releases, platformColors, detectCurrentPlatform, APP_VERSION, BUILD_DATE, BUILD_NUMBER } from '../../mock/download';
import type { Platform, Tab } from '../../mock/download';

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
        {Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: 20, borderRadius: 12, border: `1px solid ${theme.border}` }}><div style={{ display: 'flex', gap: 12, marginBottom: 14 }}><Skeleton w={48} h={48} r={10} /><div style={{ flex: 1 }}><Skeleton w="60%" h={16} /><Skeleton w="40%" h={10} /></div></div><Skeleton w="100%" h={10} /><div style={{ display: 'flex', gap: 8, marginTop: 14 }}><Skeleton w="70%" h={36} /><Skeleton w="30%" h={36} /></div></div>)}
    </div>;
}

// ═══ QR LIGHTBOX ═══
function QRLightbox({ data, platform, onClose }: { data: string; platform: string; onClose: () => void }) {
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);
    return (
        <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ padding: 20, borderRadius: 16, background: '#ffffff' }}>
                <QRCode data={data} size={260} color="#000000" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Scan with {platform === 'android' ? 'Android' : 'iPhone'} camera</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Click anywhere or press Esc to close</div>
        </div>
    );
}

function DownloadIndex() {
    const [tab, setTab] = useState<Tab>('desktop');
    const [selRelease, setSelRelease] = useState<string | null>(null);
    const [copiedHash, setCopiedHash] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [qrLightbox, setQrLightbox] = useState<{ data: string; platform: string } | null>(null);
    const { trigger } = useTopLoader();
    const currentPlatform = detectCurrentPlatform();
    const rel = selRelease ? releases.find(r => r.filename === selRelease) : null;
    const desktopReleases = releases.filter(r => ['windows', 'linux', 'macos'].includes(r.platform));
    const mobileReleases = releases.filter(r => ['android', 'ios'].includes(r.platform));

    useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

    const switchTab = useCallback((t: Tab) => { setTab(t); trigger(); setSelRelease(null); }, [trigger]);
    const copyHash = (hash: string, filename: string) => { navigator.clipboard.writeText(hash).then(() => { setCopiedHash(filename); setTimeout(() => setCopiedHash(null), 2000); }); };

    // ═══ Keyboard Shortcuts (Ctrl+Q for modal) ═══
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

            // Ctrl+Q / Cmd+Q — toggle shortcuts modal
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) {
                e.preventDefault();
                e.stopPropagation();
                setShowShortcuts(prev => !prev);
                return;
            }

            switch (e.key) {
                case '1': switchTab('desktop'); break;
                case '2': switchTab('mobile'); break;
                case 'd': case 'D': {
                    const rec = releases.find(r => r.platform === currentPlatform);
                    if (rec) { trigger(); }
                    break;
                }
                case 'Escape': setSelRelease(null); setShowShortcuts(false); setQrLightbox(null); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [switchTab, currentPlatform, trigger]);

    const pc = (p: Platform) => platformColors[p];

    return (<>
        <PageMeta title="Download Client" />
        <div className="dl-page" data-testid="download-page">

            {/* LEFT SIDEBAR */}
            <div className="dl-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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

                <div style={{ padding: '10px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Available Platforms</div>
                    {(['windows', 'linux', 'macos', 'android', 'ios'] as Platform[]).map(p => { const r = releases.find(rl => rl.platform === p)!; const cnt = releases.filter(rl => rl.platform === p).length; return <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 4, marginBottom: 2, fontSize: 11, color: theme.textDim }}><span style={{ fontSize: 14 }}>{r.icon}</span><span style={{ flex: 1 }}>{r.label.split(' ')[0]}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{cnt}</span></div>; })}
                </div>
            </div>

            {/* CENTER */}
            <div className="dl-center" style={{ position: 'relative' as const }}>
                {/* Tab bar — Desktop + Mobile only */}
                <div className="dl-tab-bar" style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {([
                        { id: 'desktop' as Tab, l: '🖥️ Desktop', n: desktopReleases.length, k: '1' },
                        { id: 'mobile' as Tab, l: '📱 Mobile', n: mobileReleases.length, k: '2' },
                    ]).map(t => <button key={t.id} onClick={() => switchTab(t.id)} data-testid={`tab-${t.id}`} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab===t.id?'#3b82f6':'transparent'}`, background: 'transparent', color: tab===t.id?theme.text:theme.textDim, fontSize: 13, fontWeight: tab===t.id?700:500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const }}>
                        {t.l} <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: `${tab===t.id?'#3b82f6':theme.border}20`, color: tab===t.id?'#3b82f6':theme.textDim }}>{t.n}</span>
                        <span className="dl-kbd" style={{ marginLeft: 4 }}>{t.k}</span>
                    </button>)}
                </div>

                <div className="dl-scroll">
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
                            {desktopReleases.map(r => { const sel = selRelease === r.filename; const c = pc(r.platform); return <div key={r.filename} className="dl-card" onClick={() => setSelRelease(r.filename)} data-testid={`card-${r.platform}`} style={{ padding: 18, borderRadius: 12, border: `1px solid ${sel?c+'40':theme.border}`, background: sel?`${c}04`:theme.bgCard }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 10, background: `${c}12`, border: `1px solid ${c}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{r.icon}</div>
                                    <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{r.label}</div><div style={{ fontSize: 11, color: theme.textDim }}>{r.format}</div></div>
                                    <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "'JetBrains Mono',monospace" }}>v{r.version}</div><div style={{ fontSize: 10, color: theme.textDim }}>{r.size}</div></div>
                                </div>
                                <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 12 }}>📐 {r.arch} · 💻 {r.minOS}</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={e => { e.stopPropagation(); trigger(); }} className="dl-btn-download" style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: c, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⬇️ Download</button>
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
                                    <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 14 }}>📐 {r.arch} · 💻 {r.minOS}</div>
                                </div>
                                {/* QR Code section */}
                                <div style={{ padding: '18px 22px', borderTop: `1px solid ${c}15`, background: `${c}03`, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' as const }}>
                                    <div onClick={() => setQrLightbox({ data: `argux://download/${r.platform}/${APP_VERSION}`, platform: r.platform })} style={{ padding: 10, borderRadius: 10, background: '#fff', flexShrink: 0, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                        <QRCode data={`argux://download/${r.platform}/${APP_VERSION}`} size={110} color="#000" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 180 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Scan to install</div>
                                        <div style={{ fontSize: 10, color: theme.textDim, lineHeight: 1.6, marginBottom: 10 }}>{r.platform==='android' ? 'Scan with your Android device camera or any QR reader. The APK will download directly.' : 'Scan with your iPhone camera to open the TestFlight installation page.'}</div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="dl-btn-download" onClick={() => trigger()} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: c, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⬇️ Download {r.platform === 'android' ? 'APK' : 'IPA'}</button>
                                            <button onClick={() => copyHash(r.sha256, r.filename)} style={{ padding: '9px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{copiedHash===r.filename?'✅':'🔒'} SHA256</button>
                                        </div>
                                    </div>
                                </div>
                            </div>; })}
                        </div>
                    </div>}
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
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 6 }}>🔒 SHA-256</div>
                    <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: theme.textSecondary, wordBreak: 'break-all' as const, lineHeight: 1.5 }}>{rel.sha256}</div>
                    <button onClick={() => copyHash(rel.sha256, rel.filename)} style={{ marginTop: 6, width: '100%', padding: '6px', borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>{copiedHash===rel.filename?'✅ Copied to clipboard':'📋 Copy checksum'}</button>
                </div>
                <div style={{ padding: '10px 16px', marginTop: 'auto' }}>
                    <button className="dl-btn-download" onClick={() => trigger()} style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: pc(rel.platform), color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⬇️ Download {rel.label}</button>
                </div>
            </div>}

            {/* QR Lightbox */}
            {qrLightbox && <QRLightbox data={qrLightbox.data} platform={qrLightbox.platform} onClose={() => setQrLightbox(null)} />}

            {/* Keyboard shortcuts modal (Ctrl+Q) */}
            {showShortcuts && <div style={{ position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, minWidth: 300, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div>
                        <button onClick={() => setShowShortcuts(false)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    {[{ k: '1', d: 'Desktop tab' }, { k: '2', d: 'Mobile tab' }, { k: 'D', d: 'Download recommended' }, { k: 'Esc', d: 'Close panel / modal' }, { k: 'Ctrl+Q', d: 'Toggle this dialog' }].map(s => <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="dl-kbd" style={{ minWidth: 54, textAlign: 'center' as const }}>{s.k}</span><span style={{ fontSize: 12, color: theme.textSecondary }}>{s.d}</span></div>)}
                    <div style={{ marginTop: 14, fontSize: 10, color: theme.textDim, textAlign: 'center' as const }}>Press <span className="dl-kbd">Esc</span> or <span className="dl-kbd">Ctrl+Q</span> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

DownloadIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default DownloadIndex;
