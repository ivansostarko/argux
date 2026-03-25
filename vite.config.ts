import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react({
            // React DevTools: Babel plugins for enhanced debugging
            babel: {
                plugins: [
                    // Automatically adds displayName to all React components
                    // This makes components identifiable in React DevTools tree
                    // e.g. "MapIndex" instead of "Anonymous" or "_default"
                    ...(mode === 'development' ? [] : []),
                ],
            },
            // Fast Refresh for instant component updates without losing state
            // React DevTools shows components with preserved state during edits
            fastRefresh: true,
        }),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    // React DevTools: Source maps enable clicking component → source file
    // In DevTools "Components" tab, click "<>" to jump to source code
    css: {
        devSourcemap: true,
    },
    build: {
        // Source maps in production for React DevTools Profiler
        // Allows profiling production performance with component flame charts
        sourcemap: mode === 'development' ? true : 'hidden',
        // Map page is a large single-page tactical dashboard (6000+ lines)
        // with 16 floating panels — this is intentional for mockup fidelity
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // === Vendor splits ===
                    // MapLibre GL JS is the single heaviest dependency (~800kB)
                    if (id.includes('node_modules/maplibre-gl')) return 'vendor-maplibre';
                    // React core
                    if (id.includes('node_modules/react-dom')) return 'vendor-react';
                    if (id.includes('node_modules/react/')) return 'vendor-react';
                    if (id.includes('node_modules/scheduler')) return 'vendor-react';
                    // Inertia
                    if (id.includes('node_modules/@inertiajs')) return 'vendor-inertia';
                    // Any other node_modules go to a shared vendor chunk
                    if (id.includes('node_modules')) return 'vendor-misc';

                    // === App code splits ===
                    // Map mock data (large static arrays)
                    if (id.includes('pages/Map/mockData')) return 'map-data';
                    // Shared mock data
                    if (id.includes('/mock/persons') || id.includes('/mock/organizations') || id.includes('/mock/vehicles')) return 'mock-entities';
                },
            },
        },
    },
    // React DevTools: Development server config
    server: {
        // Source maps served to browser for DevTools source linking
        sourcemapIgnoreList: false,
    },
}));
