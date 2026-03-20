<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="color-scheme" content="dark">
    <meta name="theme-color" content="#080a0f">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="ARGUX">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="ARGUX">
    <meta name="msapplication-TileColor" content="#080a0f">
    <title inertia>ARGUX</title>

    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/svg+xml" href="/icons/icon-192.svg">
    <link rel="apple-touch-icon" href="/icons/icon-192.svg">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead

    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(reg => {
                        console.log('[ARGUX] SW registered:', reg.scope);
                        // Request periodic sync for badge updates
                        if ('periodicSync' in reg) {
                            reg.periodicSync.register('argux-badge-refresh', { minInterval: 60 * 60 * 1000 }).catch(() => {});
                        }
                    })
                    .catch(err => console.log('[ARGUX] SW registration failed:', err));

                // Listen for SW messages
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data?.type === 'SYNC_COMPLETE') {
                        console.log('[ARGUX] Background sync completed');
                    }
                    if (event.data?.type === 'BADGE_UPDATE') {
                        // Update in-app badge count
                        document.dispatchEvent(new CustomEvent('argux-badge-update'));
                    }
                });
            });
        }
    </script>
</head>
<body>
    @inertia
</body>
</html>
