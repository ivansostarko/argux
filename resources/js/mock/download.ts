/**
 * ARGUX — Download Client Mock Data
 * Separated from page component for maintainability and testability
 */

export const APP_VERSION = '0.25.2';
export const BUILD_DATE = '2026-03-25';
export const BUILD_NUMBER = '20260325.2';

export type Platform = 'windows' | 'linux' | 'macos' | 'android' | 'ios';
export type Tab = 'desktop' | 'mobile';

export interface ClientRelease {
    platform: Platform; label: string; icon: string; version: string;
    filename: string; size: string; format: string;
    downloadUrl: string; sha256: string;
    minOS: string; arch: string;
    features: string[];
}

export interface ReleaseNote {
    version: string; date: string; notes: string;
}

export interface DeploymentType {
    id: string; icon: string; title: string; desc: string; badge: string; color: string;
}

export interface SystemReq {
    platform: string; cpu: string; ram: string; disk: string; os: string; extra: string;
}

export const releases: ClientRelease[] = [
    { platform: 'windows', label: 'Windows', icon: '🪟', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_x64-setup.exe`, size: '78.4 MB', format: 'NSIS Installer (.exe)', downloadUrl: '#', sha256: 'a1b2c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890', minOS: 'Windows 10 (1809+)', arch: 'x86_64', features: ['Auto-update', 'System tray', 'Global shortcuts', 'Native notifications', 'Window state persistence'] },
    { platform: 'windows', label: 'Windows MSI', icon: '🪟', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_x64_en-US.msi`, size: '74.2 MB', format: 'MSI Package (.msi)', downloadUrl: '#', sha256: 'b2c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890ab', minOS: 'Windows 10 (1809+)', arch: 'x86_64', features: ['Group Policy support', 'Silent install', 'Enterprise deployment', 'SCCM compatible'] },
    { platform: 'linux', label: 'Linux (Debian)', icon: '🐧', version: APP_VERSION, filename: `argux_${APP_VERSION}_amd64.deb`, size: '68.1 MB', format: 'Debian Package (.deb)', downloadUrl: '#', sha256: 'c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890abcd', minOS: 'Ubuntu 20.04+ / Debian 11+', arch: 'x86_64', features: ['Auto-update', 'System tray', 'apt repository', 'Wayland + X11'] },
    { platform: 'linux', label: 'Linux (RPM)', icon: '🐧', version: APP_VERSION, filename: `argux-${APP_VERSION}-1.x86_64.rpm`, size: '69.3 MB', format: 'RPM Package (.rpm)', downloadUrl: '#', sha256: 'd4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890abcde5', minOS: 'Fedora 38+ / RHEL 9+', arch: 'x86_64', features: ['Auto-update', 'System tray', 'dnf repository', 'Wayland + X11'] },
    { platform: 'linux', label: 'Linux (AppImage)', icon: '🐧', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_amd64.AppImage`, size: '82.7 MB', format: 'AppImage (portable)', downloadUrl: '#', sha256: 'e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890abcde5f6', minOS: 'Any Linux (glibc 2.31+)', arch: 'x86_64', features: ['No install needed', 'Portable', 'Sandboxed', 'Auto-update'] },
    { platform: 'macos', label: 'macOS (Universal)', icon: '🍎', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_universal.dmg`, size: '92.1 MB', format: 'macOS Disk Image (.dmg)', downloadUrl: '#', sha256: 'f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890abcde5f67a', minOS: 'macOS 10.15 Catalina+', arch: 'Universal (Intel + Apple Silicon)', features: ['Universal binary', 'Auto-update', 'Notarized', 'Touch Bar', 'Native title bar'] },
    { platform: 'macos', label: 'macOS (Apple Silicon)', icon: '🍎', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_aarch64.dmg`, size: '64.5 MB', format: 'macOS Disk Image (.dmg)', downloadUrl: '#', sha256: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7', minOS: 'macOS 11 Big Sur+', arch: 'aarch64 (M1/M2/M3/M4)', features: ['Native ARM', 'Apple Silicon optimized', 'Auto-update', 'Notarized'] },
    { platform: 'android', label: 'Android', icon: '🤖', version: APP_VERSION, filename: `ARGUX_${APP_VERSION}_universal.apk`, size: '45.2 MB', format: 'Android Package (.apk)', downloadUrl: '#', sha256: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8', minOS: 'Android 7.0 (API 24+)', arch: 'Universal (ARM64 + ARMv7 + x86_64)', features: ['Biometric unlock', 'Push notifications', 'Offline mode', 'Background tracking'] },
    { platform: 'ios', label: 'iOS', icon: '📱', version: APP_VERSION, filename: 'Available on TestFlight', size: '38.7 MB', format: 'iOS App (.ipa)', downloadUrl: '#', sha256: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9', minOS: 'iOS 15.0+', arch: 'arm64', features: ['Face ID / Touch ID', 'Push notifications', 'Offline mode', 'Background location'] },
];

export const releaseNotes: ReleaseNote[] = [
    { version: '0.25.2', date: '2026-03-25', notes: 'Download page redesign — responsive mobile, larger fonts, skeleton loaders, keyboard shortcuts.' },
    { version: '0.25.1', date: '2026-03-25', notes: 'Responsive header redesign — single hamburger, icon-only clock/profile on mobile.' },
    { version: '0.25.0', date: '2026-03-25', notes: 'Download Client page with multi-platform native app distribution.' },
    { version: '0.24.2', date: '2026-03-25', notes: 'Tauri v2 multi-platform native app. Desktop + mobile builds for all platforms.' },
    { version: '0.24.1', date: '2026-03-25', notes: 'React Developer Tools integration. StrictMode, source maps, profiler support.' },
    { version: '0.24.0', date: '2026-03-25', notes: 'Surveillance Apps page with remote device monitor.' },
    { version: '0.23.0', date: '2026-03-24', notes: 'Background Jobs dashboard with 30 jobs, 10 types, 6 workers.' },
    { version: '0.22.0', date: '2026-03-24', notes: 'Web Scraper OSINT crawler with 16 sources, 8 categories.' },
    { version: '0.21.0', date: '2026-03-24', notes: 'Social Media Scraper with 10 platforms, 18 scrapers, AI flags.' },
];

export const deploymentTypes: DeploymentType[] = [
    { id: 'standalone', icon: '🖥️', title: 'Standalone', desc: 'Single operator workstation. All data local. No server required.', badge: 'Recommended', color: '#22c55e' },
    { id: 'managed', icon: '🏢', title: 'Managed (Server)', desc: 'Connect to ARGUX server instance. Shared data, multi-operator, central admin.', badge: 'Enterprise', color: '#3b82f6' },
    { id: 'airgap', icon: '🔒', title: 'Air-Gapped', desc: 'Fully offline. No network. Pre-loaded map tiles, AI models, and data. USB transfer only.', badge: 'Classified', color: '#ef4444' },
];

export const systemRequirements: SystemReq[] = [
    { platform: '🪟 Windows', cpu: 'x86_64 (64-bit)', ram: '4 GB min / 8 GB rec.', disk: '500 MB', os: 'Windows 10 version 1809+', extra: 'WebView2 Runtime' },
    { platform: '🐧 Linux', cpu: 'x86_64 (64-bit)', ram: '4 GB min / 8 GB rec.', disk: '500 MB', os: 'Ubuntu 20.04+ / Fedora 38+', extra: 'webkit2gtk 4.1, GTK 3' },
    { platform: '🍎 macOS', cpu: 'Intel or Apple Silicon', ram: '4 GB min / 8 GB rec.', disk: '500 MB', os: 'macOS 10.15 Catalina+', extra: 'Notarized by Apple' },
    { platform: '🤖 Android', cpu: 'ARM64 / ARMv7 / x86_64', ram: '3 GB min', disk: '200 MB', os: 'Android 7.0 (API 24)+', extra: 'WebView 100+' },
    { platform: '📱 iOS', cpu: 'A12 Bionic+', ram: '3 GB min', disk: '150 MB', os: 'iOS 15.0+', extra: 'iPhone 8+, iPad Air 3+' },
];

export const platformColors: Record<Platform, string> = {
    windows: '#0078D4', linux: '#FCC624', macos: '#A2AAAD', android: '#3DDC84', ios: '#007AFF',
};

export function detectCurrentPlatform(): Platform {
    if (typeof navigator === 'undefined') return 'windows';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    if (ua.includes('windows')) return 'windows';
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('linux')) return 'linux';
    return 'windows';
}
