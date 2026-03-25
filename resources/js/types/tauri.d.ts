/// <reference types="vite/client" />

// Tauri v2 environment variables injected at build time
interface ImportMetaEnv {
    readonly TAURI_ENV_PLATFORM?: 'windows' | 'linux' | 'macos' | 'android' | 'ios';
    readonly TAURI_ENV_ARCH?: 'x86_64' | 'aarch64' | 'armv7' | 'i686';
    readonly TAURI_ENV_TARGET_TRIPLE?: string;
    readonly TAURI_ENV_FAMILY?: 'unix' | 'windows';
    readonly TAURI_ENV_DEBUG?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Tauri v2 window internals detection
interface Window {
    __TAURI_INTERNALS__?: Record<string, unknown>;
}
