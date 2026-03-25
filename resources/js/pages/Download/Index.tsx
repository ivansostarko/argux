import PageMeta from '../../components/layout/PageMeta';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Download Client  ·  Multi-Platform Native Application
   Desktop: Windows, Linux, macOS  ·  Mobile: Android, iOS
   QR codes for mobile, checksums, system requirements, release notes
   ═══════════════════════════════════════════════════════════════ */

const APP_VERSION = '0.24.2';
const BUILD_DATE = '2026-03-25';
const BUILD_NUMBER = '20260325.1';

type Platform = 'windows' | 'linux' | 'macos' | 'android' | 'ios';

interface ClientRelease {
    platform: Platform; label: string; icon: string; version: string;
    filename: string; size: string; format: string;
    downloadUrl: string; sha256: string;
    minOS: string; arch: string;
    features: string[];
}

const releases: ClientRelease[] = [
    { platform: 'windows', label: 'Windows', icon: '🪟', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_x64-setup.exe`, size: '78.4 MB', format: 'NSIS Installer (.exe)', downloadUrl: '#', sha256: 'a1b2c3d4e5f6...sha256...9f8e7d6c5b4a', minOS: 'Windows 10 (1809+)', arch: 'x86_64', features: ['Auto-update', 'System tray', 'Global shortcuts', 'Native notifications', 'Window state persistence'] },
    { platform: 'windows', label: 'Windows MSI', icon: '🪟', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_x64_en-US.msi`, size: '74.2 MB', format: 'MSI Package (.msi)', downloadUrl: '#', sha256: 'b2c3d4e5f6a1...sha256...8e7d6c5b4a3f', minOS: 'Windows 10 (1809+)', arch: 'x86_64', features: ['Group Policy support', 'Silent install', 'Enterprise deployment', 'SCCM compatible'] },
    { platform: 'linux', label: 'Linux (Debian)', icon: '🐧', version: APP_VERSION, filename: `argux_${APP_VERSION}_amd64.deb`, size: '68.1 MB', format: 'Debian Package (.deb)', downloadUrl: '#', sha256: 'c3d4e5f6a1b2...sha256...7d6c5b4a3f2e', minOS: 'Ubuntu 20.04+ / Debian 11+', arch: 'x86_64', features: ['Auto-update', 'System tray', 'apt repository support', 'Wayland + X11'] },
    { platform: 'linux', label: 'Linux (RPM)', icon: '🐧', version: APP_VERSION, filename: `argux-${APP_VERSION}-1.x86_64.rpm`, size: '69.3 MB', format: 'RPM Package (.rpm)', downloadUrl: '#', sha256: 'd4e5f6a1b2c3...sha256...6c5b4a3f2e1d', minOS: 'Fedora 38+ / RHEL 9+', arch: 'x86_64', features: ['Auto-update', 'System tray', 'dnf repository support', 'Wayland + X11'] },
    { platform: 'linux', label: 'Linux (AppImage)', icon: '🐧', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_amd64.AppImage`, size: '82.7 MB', format: 'AppImage (portable)', downloadUrl: '#', sha256: 'e5f6a1b2c3d4...sha256...5b4a3f2e1d0c', minOS: 'Any Linux (glibc 2.31+)', arch: 'x86_64', features: ['No installation needed', 'Portable', 'Sandboxed', 'Auto-update via AppImageUpdate'] },
    { platform: 'macos', label: 'macOS (Universal)', icon: '🍎', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_universal.dmg`, size: '92.1 MB', format: 'macOS Disk Image (.dmg)', downloadUrl: '#', sha256: 'f6a1b2c3d4e5...sha256...4a3f2e1d0c9b', minOS: 'macOS 10.15 Catalina+', arch: 'Universal (Intel + Apple Silicon)', features: ['Universal binary', 'Auto-update', 'Notarized', 'Touch Bar support', 'Native title bar overlay'] },
    { platform: 'macos', label: 'macOS (Apple Silicon)', icon: '🍎', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_aarch64.dmg`, size: '64.5 MB', format: 'macOS Disk Image (.dmg)', downloadUrl: '#', sha256: 'a7b8c9d0e1f2...sha256...3f2e1d0c9b8a', minOS: 'macOS 11 Big Sur+', arch: 'aarch64 (M1/M2/M3/M4)', features: ['Native ARM performance', 'Optimized for Apple Silicon', 'Auto-update', 'Notarized'] },
    { platform: 'android', label: 'Android', icon: '🤖', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_universal.apk`, size: '45.2 MB', format: 'Android Package (.apk)', downloadUrl: '#', sha256: 'b8c9d0e1f2a7...sha256...2e1d0c9b8a7f', minOS: 'Android 7.0 (API 24+)', arch: 'Universal (ARM64 + ARMv7 + x86_64)', features: ['Biometric unlock', 'Push notifications', 'Offline mode', 'Background tracking'] },
    { platform: 'ios', label: 'iOS', icon: '📱', version: APP_VERSION, filename: 'Available on TestFlight', size: '38.7 MB', format: 'iOS App (.ipa)', downloadUrl: '#', sha256: 'c9d0e1f2a7b8...sha256...1d0c9b8a7f6e', minOS: 'iOS 15.0+', arch: 'arm64', features: ['Face ID / Touch ID', 'Push notifications', 'Offline mode', 'Background location'] },
];

const releaseNotes = [
    { version: '0.24.2', date: '2026-03-25', notes: 'Tauri v2 multi-platform native app. Desktop + mobile builds for all platforms.' },
    { version: '0.24.1', date: '2026-03-25', notes: 'React Developer Tools integration. StrictMode, source maps, profiler support.' },
    { version: '0.24.0', date: '2026-03-25', notes: 'Surveillance Apps page with remote device monitor.' },
    { version: '0.23.0', date: '2026-03-24', notes: 'Background Jobs dashboard with 30 jobs, 10 types, 6 workers.' },
    { version: '0.22.0', date: '2026-03-24', notes: 'Web Scraper OSINT crawler with 16 sources, 8 categories.' },
    { version: '0.21.0', date: '2026-03-24', notes: 'Social Media Scraper with 10 platforms, 18 scrapers, AI flags.' },
];

const deploymentTypes = [
    { id: 'standalone', icon: '🖥️', title: 'Standalone', desc: 'Single operator workstation. All data local. No server required.', badge: 'Recommended', color: '#22c55e' },
    { id: 'managed', icon: '🏢', title: 'Managed (Server)', desc: 'Connect to ARGUX server instance. Shared data, multi-operator, central admin.', badge: 'Enterprise', color: '#3b82f6' },
    { id: 'airgap', icon: '🔒', title: 'Air-Gapped', desc: 'Fully offline. No network. Pre-loaded map tiles, AI models, and data. USB transfer only.', badge: 'Classified', color: '#ef4444' },
];

// ═══ QR CODE SVG GENERATOR ═══
// Simplified QR code visual (mock — real app would use a QR library)
function QRCode({ data, size = 120, color = '#ffffff', bg = 'transparent' }: { data: string; size?: number; color?: string; bg?: string }) {
    // Generate a deterministic pattern from the data string
    const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return Math.abs(h); };
    const seed = hash(data);
    const gridSize = 21;
    const cellSize = size / gridSize;
    const cells: boolean[][] = [];

    for (let y = 0; y < gridSize; y++) {
        cells[y] = [];
        for (let x = 0; x < gridSize; x++) {
            // Finder patterns (3 corners)
            const inFinderTL = x < 7 && y < 7;
            const inFinderTR = x >= gridSize - 7 && y < 7;
            const inFinderBL = x < 7 && y >= gridSize - 7;
            if (inFinderTL || inFinderTR || inFinderBL) {
                const fx = inFinderTL ? x : inFinderTR ? x - (gridSize - 7) : x;
                const fy = inFinderTL ? y : inFinderTR ? y : y - (gridSize - 7);
                const border = fx === 0 || fx === 6 || fy === 0 || fy === 6;
                const inner = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
                cells[y][x] = border || inner;
            }
            // Timing patterns
            else if (x === 6) cells[y][x] = y % 2 === 0;
            else if (y === 6) cells[y][x] = x % 2 === 0;
            // Data area — deterministic pseudo-random from seed
            else {
                const v = (seed * (x + 1) * (y + 1) + x * 7 + y * 13) % 100;
                cells[y][x] = v < 45;
            }
        }
    }

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
            {bg !== 'transparent' && <rect width={size} height={size} fill={bg} rx="4" />}
            {cells.map((row, y) => row.map((cell, x) => cell ? <rect key={`${x}-${y}`} x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} fill={color} /> : null))}
        </svg>
    );
}

function detectCurrentPlatform(): Platform {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    if (ua.includes('windows')) return 'windows';
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('linux')) return 'linux';
    return 'windows';
}

type Tab = 'desktop' | 'mobile' | 'releases' | 'deployment';

function DownloadIndex() {
    const [tab, setTab] = useState<Tab>('desktop');
    const [selRelease, setSelRelease] = useState<string | null>(null);
    const [copiedHash, setCopiedHash] = useState<string | null>(null);
    const currentPlatform = detectCurrentPlatform();
    const rel = selRelease ? releases.find(r => r.filename === selRelease) : null;

    const desktopReleases = releases.filter(r => ['windows', 'linux', 'macos'].includes(r.platform));
    const mobileReleases = releases.filter(r => ['android', 'ios'].includes(r.platform));

    const copyHash = (hash: string, filename: string) => { navigator.clipboard.writeText(hash).then(() => { setCopiedHash(filename); setTimeout(() => setCopiedHash(null), 2000); }); };

    const platformColors: Record<Platform, string> = { windows: '#0078D4', linux: '#FCC624', macos: '#A2AAAD', android: '#3DDC84', ios: '#007AFF' };

    return (<>
        <PageMeta title="Download Client" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* LEFT */}
            <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#3b82f610', border: '1px solid #3b82f625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⬇️</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>DOWNLOAD</div><div style={{ fontSize: 7, color: theme.textDim }}>Client Applications</div></div>
                    </div>
                </div>

                {/* Version info */}
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Current Release</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 2 }}><span style={{ color: theme.textDim }}>Version</span><span style={{ color: theme.accent, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{APP_VERSION}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 2 }}><span style={{ color: theme.textDim }}>Build</span><span style={{ color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{BUILD_NUMBER}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}><span style={{ color: theme.textDim }}>Date</span><span style={{ color: theme.text }}>{BUILD_DATE}</span></div>
                </div>

                {/* Auto-detected platform */}
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Detected Platform</div>
                    <div style={{ padding: '6px 8px', borderRadius: 5, background: `${platformColors[currentPlatform]}10`, border: `1px solid ${platformColors[currentPlatform]}25`, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{releases.find(r => r.platform === currentPlatform)?.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: platformColors[currentPlatform] }}>{releases.find(r => r.platform === currentPlatform)?.label}</span>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 3 }}>
                    {[{ n: 5, l: 'Platforms' }, { n: releases.length, l: 'Packages' }, { n: '2.4K', l: 'Installs' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '3px 0' }}><div style={{ fontSize: 13, fontWeight: 800, color: theme.accent, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Platform quick links */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Platforms</div>
                    {(['windows', 'linux', 'macos', 'android', 'ios'] as Platform[]).map(p => { const r = releases.find(rl => rl.platform === p)!; const cnt = releases.filter(rl => rl.platform === p).length; return <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 3, marginBottom: 1, fontSize: 9, color: theme.textDim }}><span>{r.icon}</span><span style={{ flex: 1 }}>{r.label.split(' ')[0]}</span><span style={{ fontSize: 7, fontFamily: "'JetBrains Mono',monospace" }}>{cnt}</span></div>; })}
                </div>

                <div style={{ padding: '8px 12px', marginTop: 'auto' }}>
                    {[{ l: '🧑 Profile', h: '/profile' }, { l: '📊 Dashboard', h: '/dashboard' }, { l: '⚙️ Jobs', h: '/jobs' }].map(lk => <a key={lk.h} href={lk.h} style={{ display: 'block', fontSize: 8, color: theme.textDim, textDecoration: 'none', padding: '2px 0' }}>{lk.l}</a>)}
                </div>
            </div>

            {/* CENTER */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {[{ id: 'desktop' as Tab, l: '🖥️ Desktop', n: desktopReleases.length }, { id: 'mobile' as Tab, l: '📱 Mobile', n: mobileReleases.length }, { id: 'deployment' as Tab, l: '🚀 Deployment', n: 3 }, { id: 'releases' as Tab, l: '📋 Release Notes', n: releaseNotes.length }].map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#3b82f6' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 10, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' as const }}>{t.l} <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: `${tab === t.id ? '#3b82f6' : theme.border}20`, color: tab === t.id ? '#3b82f6' : theme.textDim }}>{t.n}</span></button>)}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {/* ═══ DESKTOP TAB ═══ */}
                    {tab === 'desktop' && <div style={{ padding: 16 }}>
                        {/* Recommended download banner */}
                        {(() => { const rec = releases.find(r => r.platform === currentPlatform); if (!rec || ['android', 'ios'].includes(currentPlatform)) return null; return <div style={{ padding: '16px 20px', borderRadius: 10, border: `1px solid ${theme.accent}25`, background: `${theme.accent}06`, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 10, background: `${platformColors[rec.platform]}15`, border: `1px solid ${platformColors[rec.platform]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{rec.icon}</div>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 2 }}>Recommended for your system</div><div style={{ fontSize: 10, color: theme.textSecondary }}>{rec.label} · {rec.format} · {rec.size} · {rec.arch}</div></div>
                            <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: theme.accent, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>⬇️ Download {rec.label}</button>
                        </div>; })()}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
                            {desktopReleases.map(r => { const sel = selRelease === r.filename; const pc = platformColors[r.platform]; return <div key={r.filename} onClick={() => setSelRelease(r.filename)} style={{ padding: '16px', borderRadius: 10, border: `1px solid ${sel ? pc : theme.border}${sel ? '40' : ''}`, background: sel ? `${pc}04` : theme.bgCard, cursor: 'pointer', transition: 'all 0.15s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${pc}12`, border: `1px solid ${pc}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{r.icon}</div>
                                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{r.label}</div><div style={{ fontSize: 9, color: theme.textDim }}>{r.format}</div></div>
                                    <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 11, fontWeight: 700, color: pc, fontFamily: "'JetBrains Mono',monospace" }}>v{r.version}</div><div style={{ fontSize: 8, color: theme.textDim }}>{r.size}</div></div>
                                </div>
                                <div style={{ fontSize: 8, color: theme.textDim, marginBottom: 8 }}>
                                    <span>📐 {r.arch}</span> · <span>💻 {r.minOS}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginBottom: 8 }}>
                                    {r.features.map(f => <span key={f} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${theme.border}15`, color: theme.textSecondary }}>{f}</span>)}
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={e => { e.stopPropagation(); }} style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: pc, color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⬇️ Download</button>
                                    <button onClick={e => { e.stopPropagation(); copyHash(r.sha256, r.filename); }} style={{ padding: '8px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit' }}>{copiedHash === r.filename ? '✅ Copied' : '🔒 SHA256'}</button>
                                </div>
                            </div>; })}
                        </div>
                    </div>}

                    {/* ═══ MOBILE TAB ═══ */}
                    {tab === 'mobile' && <div style={{ padding: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                            {mobileReleases.map(r => { const pc = platformColors[r.platform]; return <div key={r.filename} style={{ borderRadius: 12, border: `1px solid ${pc}25`, background: `${pc}04`, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 20px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${pc}15`, border: `1px solid ${pc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{r.icon}</div>
                                        <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>{r.label}</div><div style={{ fontSize: 10, color: theme.textDim }}>{r.format} · {r.size}</div></div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: pc, fontFamily: "'JetBrains Mono',monospace" }}>v{r.version}</div>
                                    </div>
                                    <div style={{ fontSize: 9, color: theme.textDim, marginBottom: 8 }}>📐 {r.arch} · 💻 {r.minOS}</div>
                                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginBottom: 12 }}>
                                        {r.features.map(f => <span key={f} style={{ fontSize: 7, padding: '2px 6px', borderRadius: 3, background: `${pc}10`, color: pc, fontWeight: 500 }}>{f}</span>)}
                                    </div>
                                </div>
                                {/* QR Code section */}
                                <div style={{ padding: '16px 20px', borderTop: `1px solid ${pc}15`, background: `${pc}03`, display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ padding: 8, borderRadius: 8, background: '#ffffff', flexShrink: 0 }}>
                                        <QRCode data={`argux://download/${r.platform}/${APP_VERSION}`} size={100} color="#000000" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Scan to install</div>
                                        <div style={{ fontSize: 8, color: theme.textDim, lineHeight: 1.5, marginBottom: 8 }}>
                                            {r.platform === 'android' ? 'Scan with your Android device camera or any QR reader. The APK will download directly.' : 'Scan with your iPhone camera to open the TestFlight installation page.'}
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: pc, color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{r.platform === 'android' ? '⬇️ Download APK' : '🍎 Open TestFlight'}</button>
                                            <button onClick={() => copyHash(r.sha256, r.filename)} style={{ padding: '7px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit' }}>{copiedHash === r.filename ? '✅' : '🔒'} SHA256</button>
                                        </div>
                                    </div>
                                </div>
                                {/* Store badges */}
                                <div style={{ padding: '10px 20px', borderTop: `1px solid ${pc}10`, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {r.platform === 'android' && <>
                                        <div style={{ padding: '5px 10px', borderRadius: 4, background: '#000', color: '#fff', fontSize: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>▶ Google Play</div>
                                        <div style={{ padding: '5px 10px', borderRadius: 4, background: '#000', color: '#fff', fontSize: 8, fontWeight: 600, cursor: 'pointer' }}>Direct APK</div>
                                        <span style={{ fontSize: 7, color: theme.textDim, marginLeft: 'auto' }}>Also available via MDM</span>
                                    </>}
                                    {r.platform === 'ios' && <>
                                        <div style={{ padding: '5px 10px', borderRadius: 4, background: '#000', color: '#fff', fontSize: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>🍎 App Store</div>
                                        <div style={{ padding: '5px 10px', borderRadius: 4, background: '#007AFF', color: '#fff', fontSize: 8, fontWeight: 600, cursor: 'pointer' }}>TestFlight</div>
                                        <span style={{ fontSize: 7, color: theme.textDim, marginLeft: 'auto' }}>Enterprise distribution available</span>
                                    </>}
                                </div>
                            </div>; })}
                        </div>

                        {/* MDM section */}
                        <div style={{ marginTop: 16, padding: '16px 20px', borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgCard }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 6 }}>📱 Mobile Device Management (MDM)</div>
                            <div style={{ fontSize: 9, color: theme.textSecondary, lineHeight: 1.5 }}>ARGUX supports enterprise deployment via MDM solutions. Distribute the client silently to managed devices with pre-configured server settings and security policies.</div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                {['Microsoft Intune', 'Jamf Pro', 'VMware Workspace ONE', 'MobileIron'].map(m => <span key={m} style={{ fontSize: 7, padding: '3px 6px', borderRadius: 3, border: `1px solid ${theme.border}`, color: theme.textDim }}>{m}</span>)}
                            </div>
                        </div>
                    </div>}

                    {/* ═══ DEPLOYMENT TAB ═══ */}
                    {tab === 'deployment' && <div style={{ padding: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
                            {deploymentTypes.map(d => <div key={d.id} style={{ padding: '20px', borderRadius: 10, border: `1px solid ${d.color}25`, background: `${d.color}04` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <span style={{ fontSize: 28 }}>{d.icon}</span>
                                    <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>{d.title}</div><span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${d.color}15`, color: d.color }}>{d.badge}</span></div>
                                </div>
                                <div style={{ fontSize: 10, color: theme.textSecondary, lineHeight: 1.6 }}>{d.desc}</div>
                            </div>)}
                        </div>

                        {/* System Requirements */}
                        <div style={{ borderRadius: 10, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                            <div style={{ padding: '12px 16px', background: `${theme.border}10`, borderBottom: `1px solid ${theme.border}`, fontSize: 12, fontWeight: 700, color: theme.text }}>📋 System Requirements</div>
                            {[
                                { platform: '🪟 Windows', cpu: 'x86_64 (64-bit)', ram: '4 GB min / 8 GB rec.', disk: '500 MB', os: 'Windows 10 version 1809+', extra: 'WebView2 Runtime (auto-installed)' },
                                { platform: '🐧 Linux', cpu: 'x86_64 (64-bit)', ram: '4 GB min / 8 GB rec.', disk: '500 MB', os: 'Ubuntu 20.04+ / Fedora 38+ / Debian 11+', extra: 'webkit2gtk 4.1, GTK 3' },
                                { platform: '🍎 macOS', cpu: 'Intel or Apple Silicon', ram: '4 GB min / 8 GB rec.', disk: '500 MB', os: 'macOS 10.15 Catalina+', extra: 'Notarized by Apple' },
                                { platform: '🤖 Android', cpu: 'ARM64 / ARMv7 / x86_64', ram: '3 GB min', disk: '200 MB', os: 'Android 7.0 (API 24)+', extra: 'WebView 100+' },
                                { platform: '📱 iOS', cpu: 'A12 Bionic+', ram: '3 GB min', disk: '150 MB', os: 'iOS 15.0+', extra: 'iPhone 8+, iPad Air 3+' },
                            ].map(r => <div key={r.platform} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}08`, display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr 1fr 1fr', gap: 8, alignItems: 'center', fontSize: 8 }}>
                                <span style={{ fontWeight: 700, color: theme.text }}>{r.platform}</span>
                                <span style={{ color: theme.textDim }}>🔲 {r.cpu}</span>
                                <span style={{ color: theme.textDim }}>💾 {r.ram}</span>
                                <span style={{ color: theme.textDim }}>💿 {r.disk}</span>
                                <span style={{ color: theme.textDim }}>📋 {r.os}</span>
                                <span style={{ color: theme.textDim }}>{r.extra}</span>
                            </div>)}
                        </div>

                        {/* Verification */}
                        <div style={{ marginTop: 16, padding: '16px 20px', borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgCard }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>🔒 Integrity Verification</div>
                            <div style={{ fontSize: 9, color: theme.textSecondary, lineHeight: 1.5, marginBottom: 10 }}>All packages are signed and include SHA-256 checksums. Verify integrity before installation.</div>
                            <div style={{ padding: '10px 12px', borderRadius: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: theme.textDim, lineHeight: 1.8 }}>
                                <div style={{ color: '#22c55e' }}># Windows (PowerShell)</div>
                                <div>Get-FileHash ARGUX_*.exe -Algorithm SHA256</div>
                                <div style={{ marginTop: 4, color: '#22c55e' }}># Linux / macOS</div>
                                <div>sha256sum argux_*.deb</div>
                                <div>shasum -a 256 ARGUX_*.dmg</div>
                            </div>
                        </div>
                    </div>}

                    {/* ═══ RELEASE NOTES TAB ═══ */}
                    {tab === 'releases' && <div style={{ padding: 16 }}>
                        {releaseNotes.map((rn, i) => <div key={rn.version} style={{ padding: '12px 16px', borderRadius: 8, border: `1px solid ${i === 0 ? theme.accent + '25' : theme.border}`, background: i === 0 ? `${theme.accent}04` : 'transparent', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? theme.accent : theme.textDim, marginTop: 4, flexShrink: 0, boxShadow: i === 0 ? `0 0 6px ${theme.accent}` : 'none' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>v{rn.version}</span>
                                    {i === 0 && <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: `${theme.accent}15`, color: theme.accent }}>LATEST</span>}
                                    <span style={{ fontSize: 9, color: theme.textDim, marginLeft: 'auto' }}>{rn.date}</span>
                                </div>
                                <div style={{ fontSize: 10, color: theme.textSecondary, lineHeight: 1.5 }}>{rn.notes}</div>
                            </div>
                        </div>)}
                        <a href="/CHANGELOG.md" style={{ fontSize: 9, color: theme.accent, textDecoration: 'none' }}>View full changelog →</a>
                    </div>}
                </div>

                <div style={{ padding: '3px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>{releases.length} packages · 5 platforms · v{APP_VERSION} · Build {BUILD_NUMBER}</span>
                    <div style={{ flex: 1 }} /><span>Tauri v2 · Code-signed · AES-256</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>

            {/* RIGHT: Release Detail */}
            {rel && tab === 'desktop' && <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${platformColors[rel.platform]}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{rel.icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{rel.label}</div><div style={{ fontSize: 7, color: theme.textDim }}>{rel.format}</div></div>
                        <button onClick={() => setSelRelease(null)} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                </div>

                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                    {[
                        { l: 'Version', v: `v${rel.version}` },
                        { l: 'Filename', v: rel.filename },
                        { l: 'Size', v: rel.size },
                        { l: 'Architecture', v: rel.arch },
                        { l: 'Min OS', v: rel.minOS },
                        { l: 'Build', v: BUILD_NUMBER },
                        { l: 'Date', v: BUILD_DATE },
                    ].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: theme.text, textAlign: 'right' as const, wordBreak: 'break-all' as const }}>{r.v}</span></div>)}
                </div>

                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 4 }}>Features</div>
                    {rel.features.map(f => <div key={f} style={{ fontSize: 8, color: theme.textSecondary, padding: '2px 0', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ color: '#22c55e' }}>✓</span> {f}</div>)}
                </div>

                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 4 }}>🔒 SHA-256 Checksum</div>
                    <div style={{ fontSize: 7, fontFamily: "'JetBrains Mono',monospace", color: theme.textSecondary, wordBreak: 'break-all' as const, lineHeight: 1.5 }}>{rel.sha256}</div>
                    <button onClick={() => copyHash(rel.sha256, rel.filename)} style={{ marginTop: 4, width: '100%', padding: '4px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, cursor: 'pointer', fontFamily: 'inherit' }}>{copiedHash === rel.filename ? '✅ Copied to clipboard' : '📋 Copy checksum'}</button>
                </div>

                <div style={{ padding: '8px 12px', marginTop: 'auto' }}>
                    <button style={{ width: '100%', padding: '8px', borderRadius: 6, border: 'none', background: platformColors[rel.platform], color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⬇️ Download {rel.label}</button>
                </div>
            </div>}
        </div>
    </>);
}

DownloadIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default DownloadIndex;
