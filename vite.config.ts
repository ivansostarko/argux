import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

// Detect Tauri environment
const isTauri = !!process.env.TAURI_ENV_PLATFORM;
const tauriPlatform = process.env.TAURI_ENV_PLATFORM || '';
const isMobile = tauriPlatform === 'android' || tauriPlatform === 'ios';

export default defineConfig(({ mode }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: !isTauri, // Disable HMR file watcher in Tauri (Tauri handles reload)
        }),
        react({
            babel: {
                plugins: [
                    ...(mode === 'development' ? [] : []),
                ],
            },
            fastRefresh: true,
        }),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },

    // === Tauri Integration ===
    // Tauri CLI reads Vite output — don't clear terminal
    clearScreen: false,
    // Allow TAURI_* env vars in frontend code
    envPrefix: ['VITE_', 'TAURI_ENV_'],

    css: {
        devSourcemap: true,
    },
    build: {
        sourcemap: mode === 'development' ? true : 'hidden',
        chunkSizeWarningLimit: 1500,
        // Tauri: target modern webview engines (no IE/legacy needed)
        target: isTauri ? ['es2021', 'chrome100', 'safari15'] : undefined,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/maplibre-gl')) return 'vendor-maplibre';
                    if (id.includes('node_modules/react-dom')) return 'vendor-react';
                    if (id.includes('node_modules/react/')) return 'vendor-react';
                    if (id.includes('node_modules/scheduler')) return 'vendor-react';
                    if (id.includes('node_modules/@inertiajs')) return 'vendor-inertia';
                    // Tauri API packages
                    if (id.includes('node_modules/@tauri-apps')) return 'vendor-tauri';
                    if (id.includes('node_modules')) return 'vendor-misc';
                    if (id.includes('pages/Map/mockData')) return 'map-data';
                    if (id.includes('/mock/persons') || id.includes('/mock/organizations') || id.includes('/mock/vehicles')) return 'mock-entities';
                },
            },
        },
    },
    server: {
        sourcemapIgnoreList: false,
        // Tauri: dev server must be accessible for mobile devices on local network
        host: isMobile ? '0.0.0.0' : undefined,
        port: 5173,
        strictPort: true,
        // Tauri mobile: allow connections from mobile device emulator
        hmr: isMobile ? { protocol: 'ws', host: '0.0.0.0' } : undefined,
    },
}));
