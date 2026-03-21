# Architecture

## Design Principles

1. **Mockup-first** — Every feature is the lightest possible implementation that looks and behaves credibly.
2. **No database** — All data from static arrays, PHP config, or TypeScript mock files.
3. **Inertia + React** — Laravel handles routing and validation; React owns all UI.
4. **CSS custom properties** — Theme switching via `--ax-*` variables, zero re-render overhead.
5. **Feature-based structure** — Each module is self-contained with its own pages, components, and mock data.

## Data Flow

```
Browser Request
    → Laravel Route (routes/web.php)
    → Controller or inline closure
    → Inertia::render('PageName', $props)
    → React Page Component
    → Reads mock data from resources/js/mock/*.ts
    → Renders UI with theme from CSS custom properties
```

## Folder Structure

```
app/Http/Controllers/Web/     — Inertia page controllers
app/Http/Middleware/           — HandleInertiaRequests, SetLocale
bootstrap/app.php              — Exception handler (error pages)
config/app.php                 — Version, locale config
resources/css/                 — CSS architecture
  variables.css                — :root custom properties (--ax-*)
  base.css                     — Reset, keyframe animations
  components.css               — .ax-btn, .ax-input, .ax-card, etc.
  layout.css                   — Sidebar, header, tabs
  pages/*.css                  — Per-page styles
resources/js/
  app.tsx                      — React entry, Inertia createRoot
  layouts/                     — AppLayout (shell), AuthLayout (particles)
  lib/theme.ts                 — 10 theme definitions
  mock/                        — TypeScript mock data files
  components/ui/               — Shared primitives (Button, Input, Skeleton, Toast)
  components/layout/           — Sidebar, AppHeader
  components/vehicles/         — VehiclePhotos gallery
  components/auth/             — ParticleBackground, Logo, ErrorParticles
  pages/                       — Inertia page components
```

## State Management

| State Type | Technology |
|-----------|-----------|
| Page props | Inertia `usePage()` |
| Theme/settings | React Context (`AppSettingsContext`) |
| Form state | React `useState` |
| URL state | Inertia router, route params |
| Toast queue | `ToastProvider` context |

## CSS Architecture

All styles use CSS custom properties defined in `variables.css`:

```css
--ax-bg, --ax-bg-input, --ax-border, --ax-accent, --ax-accent-dim,
--ax-text, --ax-text-sec, --ax-text-dim, --ax-danger, --ax-success,
--ax-warning, --ax-sidebar-bg, --ax-header-bg, --ax-font, --ax-radius-*
```

Component classes: `.ax-btn-primary`, `.ax-input`, `.ax-card`, `.ax-badge`, `.ax-modal`, `.ax-skeleton`

Theme switching: `AppLayout.tsx` injects `:root` overrides dynamically.
