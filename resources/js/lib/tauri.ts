/**
 * ARGUX — Tauri Platform Bridge
 *
 * Provides a unified API for Tauri-specific features with graceful
 * fallback when running in a regular browser (web mode).
 *
 * Usage:
 *   import { isTauri, platform, tauriInvoke } from '@/lib/tauri';
 *
 *   if (isTauri) {
 *     const info = await tauriInvoke<PlatformInfo>('get_platform_info');
 *   }
 */

// ═══ Platform Detection ═══

/** True when running inside Tauri webview (desktop or mobile app) */
export const isTauri: boolean = !!(window as any).__TAURI_INTERNALS__;

/** True when running in standard browser (not Tauri) */
export const isBrowser: boolean = !isTauri;

/** Current platform from Tauri env or browser detection */
export const platform = {
    /** 'windows' | 'linux' | 'macos' | 'android' | 'ios' | 'browser' */
    os: detectOS(),
    /** true for Windows/Linux/macOS Tauri app */
    isDesktop: isTauri && !['android', 'ios'].includes(detectOS()),
    /** true for Android/iOS Tauri app */
    isMobile: isTauri && ['android', 'ios'].includes(detectOS()),
    /** true for standard web browser */
    isBrowser: !isTauri,
    /** true if Tauri app (desktop or mobile) */
    isTauri,
};

function detectOS(): string {
    if (isTauri) {
        // Tauri v2 sets this env var at build time
        const tauriPlatform = (import.meta as any).env?.TAURI_ENV_PLATFORM;
        if (tauriPlatform) return tauriPlatform;
        // Fallback: detect from user agent
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('android')) return 'android';
        if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
        if (ua.includes('windows')) return 'windows';
        if (ua.includes('mac')) return 'macos';
        if (ua.includes('linux')) return 'linux';
    }
    return 'browser';
}

// ═══ Tauri Command Invocation ═══

/**
 * Invoke a Tauri command with type safety.
 * Returns undefined if not running in Tauri.
 *
 * @example
 * const info = await tauriInvoke<PlatformInfo>('get_platform_info');
 */
export async function tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T | undefined> {
    if (!isTauri) return undefined;
    try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<T>(command, args);
    } catch (e) {
        console.warn(`[ARGUX Tauri] Command "${command}" failed:`, e);
        return undefined;
    }
}

// ═══ Window Management (Desktop) ═══

/** Set window title (desktop only) */
export async function setWindowTitle(title: string): Promise<void> {
    await tauriInvoke('set_window_title', { title });
}

/** Toggle fullscreen (desktop only) */
export async function toggleFullscreen(): Promise<void> {
    await tauriInvoke('toggle_fullscreen');
}

/** Minimize window (desktop only) */
export async function minimizeToTray(): Promise<void> {
    await tauriInvoke('minimize_to_tray');
}

// ═══ Notifications ═══

/** Send a native OS notification */
export async function sendNotification(title: string, body: string): Promise<void> {
    if (!isTauri) {
        // Browser fallback: use Web Notification API
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') new Notification(title, { body, icon: '/favicon.ico' });
        }
        return;
    }
    try {
        const { sendNotification: tauriNotify } = await import('@tauri-apps/plugin-notification');
        await tauriNotify({ title, body });
    } catch (e) {
        console.warn('[ARGUX Tauri] Notification failed:', e);
    }
}

// ═══ Clipboard ═══

/** Copy text to clipboard */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (!isTauri) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch { return false; }
    }
    try {
        const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
        await writeText(text);
        return true;
    } catch { return false; }
}

// ═══ Shell / External Links ═══

/** Open URL in system browser (Tauri) or new tab (browser) */
export async function openExternal(url: string): Promise<void> {
    if (!isTauri) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
    }
    try {
        const { open } = await import('@tauri-apps/plugin-shell');
        await open(url);
    } catch {
        window.open(url, '_blank');
    }
}

// ═══ Dialog ═══

/** Show a native confirmation dialog */
export async function confirmDialog(title: string, message: string): Promise<boolean> {
    if (!isTauri) return window.confirm(`${title}\n\n${message}`);
    try {
        const { confirm } = await import('@tauri-apps/plugin-dialog');
        return await confirm(message, { title, kind: 'warning' });
    } catch {
        return window.confirm(message);
    }
}

/** Show a native save file dialog */
export async function saveFileDialog(defaultName: string, filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
    if (!isTauri) return null;
    try {
        const { save } = await import('@tauri-apps/plugin-dialog');
        return await save({ defaultPath: defaultName, filters }) || null;
    } catch { return null; }
}

// ═══ HTTP (bypasses CORS in Tauri) ═══

/** Fetch URL using Tauri HTTP plugin (bypasses CORS) or standard fetch */
export async function tauriFetch(url: string, options?: RequestInit): Promise<Response> {
    if (!isTauri) return fetch(url, options);
    try {
        const { fetch: tFetch } = await import('@tauri-apps/plugin-http');
        return await tFetch(url, options);
    } catch {
        return fetch(url, options);
    }
}

// ═══ Platform Info Type ═══

export interface PlatformInfo {
    os: string;
    arch: string;
    platform: string;
    is_desktop: boolean;
    is_mobile: boolean;
    app_version: string;
}

/** Get full platform info from Rust backend */
export async function getPlatformInfo(): Promise<PlatformInfo | null> {
    const info = await tauriInvoke<PlatformInfo>('get_platform_info');
    return info || null;
}
