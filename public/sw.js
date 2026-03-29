const CACHE_NAME = 'argux-v0.2.0';
const SHELL_ASSETS = [
    '/',
    '/login',
    '/map',
    '/manifest.json',
    '/icons/icon-192.svg',
    '/icons/icon-512.svg',
];
const API_CACHE = 'argux-api-v1';
const SYNC_QUEUE = 'argux-sync-queue';

/* ─── Install: cache shell ─── */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
    );
    self.skipWaiting();
});

/* ─── Activate: clean old caches ─── */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== API_CACHE).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

/* ─── Fetch: smart routing ─── */
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // PASS THROUGH: External requests (tiles, APIs, CDNs) — never intercept
    if (url.origin !== self.location.origin) {
        return; // Let the browser handle it natively
    }

    // Mock API responses: network-first with cache fallback
    if (url.pathname.startsWith('/mock-api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(API_CACHE).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Navigation requests: network-first, fallback to cached shell
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() =>
                caches.match(event.request).then((r) => r || caches.match('/'))
            )
        );
        return;
    }

    // Same-origin static assets: cache-first
    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
});

/* ─── Push notifications ─── */
self.addEventListener('push', (event) => {
    let data = { title: 'ARGUX Alert', body: 'New notification', icon: '/icons/icon-192.svg', tag: 'argux-notification' };
    try {
        if (event.data) data = { ...data, ...event.data.json() };
    } catch (e) {
        if (event.data) data.body = event.data.text();
    }
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || '/icons/icon-192.svg',
            badge: '/icons/icon-192.svg',
            tag: data.tag || 'argux-notification',
            vibrate: [100, 50, 100],
            data: data,
            actions: [
                { action: 'view', title: 'View' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
        })
    );
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
            clients.forEach((client) => client.postMessage({ type: 'BADGE_UPDATE' }));
        })
    );
});

/* ─── Notification click ─── */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'dismiss') return;
    const urlToOpen = event.notification.data?.url || '/notifications';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            const existing = clients.find((c) => c.url.includes(urlToOpen));
            if (existing) return existing.focus();
            return self.clients.openWindow(urlToOpen);
        })
    );
});

/* ─── Background Sync ─── */
self.addEventListener('sync', (event) => {
    if (event.tag === SYNC_QUEUE) {
        event.waitUntil(processQueuedActions());
    }
});

async function processQueuedActions() {
    console.log('[ARGUX SW] Background sync: processing queued actions');
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => client.postMessage({ type: 'SYNC_COMPLETE' }));
}

/* ─── Periodic Background Sync ─── */
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'argux-badge-refresh') {
        event.waitUntil(refreshBadge());
    }
});

async function refreshBadge() {
    try {
        if (navigator.setAppBadge) {
            const count = Math.floor(Math.random() * 5) + 1;
            navigator.setAppBadge(count);
        }
    } catch (e) {
        console.log('[ARGUX SW] Badge update skipped');
    }
}
