import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
        build: {
 
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
});
