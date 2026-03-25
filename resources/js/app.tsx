import { StrictMode } from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

// React DevTools: Enable component name display in production builds
// @vitejs/plugin-react automatically adds displayName in development
// This ensures Inertia page names are visible in the DevTools component tree
if (import.meta.env.DEV) {
    // Signal to React DevTools that this is a development build
    (window as any).__ARGUX_DEV__ = true;
    console.log(
        '%c🛡️ ARGUX DevTools %c React Developer Tools supported',
        'background: #1d6fef; color: #fff; padding: 2px 8px; border-radius: 3px 0 0 3px; font-weight: 700;',
        'background: #0d1220; color: #64748b; padding: 2px 8px; border-radius: 0 3px 3px 0;'
    );
    console.log(
        '%c  Install React DevTools: https://react.dev/learn/react-developer-tools',
        'color: #64748b; font-size: 11px;'
    );
}

createInertiaApp({
    title: (title) => title ? `${title} — ARGUX` : 'ARGUX',
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx')
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        if (import.meta.env.DEV) {
            // StrictMode enables additional development checks:
            // - Double-rendering to catch side effects
            // - Deprecated API warnings
            // - Better React DevTools integration with component highlighting
            root.render(
                <StrictMode>
                    <App {...props} />
                </StrictMode>
            );
        } else {
            // Production: no StrictMode overhead
            root.render(<App {...props} />);
        }
    },
    progress: {
        color: '#1d6fef',
        showSpinner: true,
    },
});
