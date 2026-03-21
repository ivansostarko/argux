# Build

## Overview

This project uses two scripts to manage the development lifecycle:

- **F5 → setup** → full environment bootstrap
- **F6 → build** → fast rebuild for daily development

---

## Setup (F5)

Runs `setup.sh`:

- Builds Docker containers
- Installs Composer dependencies
- Installs Node dependencies
- Generates Laravel app key
- Clears caches
- Runs migrations
- Fixes permissions
- Builds frontend

Use this:
- First time setup
- After dependency changes
- After Docker changes

---

## Build (F6)

Runs `build.sh`:

- Ensures containers are running
- Clears and rebuilds Laravel cache
- Runs migrations
- Builds frontend

Use this:
- Daily development
- After code changes

---

## Requirements

- Docker + Docker Compose
- VS Code

---

## Setup Instructions

```bash
chmod +x setup.sh build.sh
```


# Build & Bundling

## Vite Configuration

The application uses Vite 6 with the Laravel plugin for asset compilation and HMR.

### Development
```bash
npm run dev
```
Starts Vite dev server with HMR. React components hot-reload instantly.

### Production Build
```bash
npm run build
```
Outputs optimized assets to `public/build/`. Laravel serves these via the `@vite` Blade directive.

## Entry Points

| Entry | Path |
|-------|------|
| JavaScript | `resources/js/app.tsx` |
| CSS | `resources/css/app.css` |

## CSS Pipeline

`app.css` imports all CSS files in order:
1. `variables.css` — Custom properties
2. `base.css` — Reset, keyframes
3. `components.css` — UI component classes
4. `layout.css` — Shell, sidebar, header
5. `pages/*.css` — Per-page styles (auth, persons, profile, notifications, print, errors, vehicles)

## TypeScript

- Strict mode enabled in `tsconfig.json`
- `"types": ["vite/client"]` for Vite asset handling
- Path aliases not used — relative imports throughout

## Import Patterns

Pages are auto-discovered via `import.meta.glob`:
```typescript
// In app.tsx — Inertia resolves pages from the pages/ directory
```

**Important:** After adding new `.tsx` page files, restart Vite for `import.meta.glob` to pick them up.

## Assets

| Type | Location |
|------|----------|
| Favicon | `public/favicon.svg` |
| PWA Icons | `public/icons/` |
| Manifest | `public/manifest.json` |
| Service Worker | `public/sw.js` |
