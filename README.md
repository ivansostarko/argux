# ARGUX — Tactical Intelligence & Surveillance Platform

> **CLASSIFIED // NOFORN**

High-fidelity mockup application built with **Laravel 13 + Inertia.js + React 19 + TypeScript**.

**Version 0.4.3** · 60+ Routes Planned · 200+ Components · 10 Themes · On-Premise Architecture

---

## Overview

ARGUX is a presentation-grade prototype of an on-premise tactical intelligence and geospatial surveillance platform. Designed for government agencies, law enforcement, critical infrastructure operators, and corporate security teams.

All AI inference, data storage, and processing is architected to run locally with zero external API dependencies.

> **No real database, no real authentication, no production integrations.** All data is mocked. Every screen looks and behaves like a real product.

## Quick Start

```bash
# Prerequisites: PHP 8.3+, Node.js 20+, Composer 2.x
composer install
npm install
cp .env.example .env
php artisan key:generate

php artisan serve &
npm run dev
```

Visit **http://localhost:8000/login** — use any credentials.

For detailed setup see [docs/INSTALLATION.md](docs/INSTALLATION.md).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13 + Inertia.js 2 |
| Frontend | React 19 + TypeScript 5 (strict mode) |
| Bundler | Vite 6 |
| Styling | CSS custom properties (`--ax-*`) + component classes |
| Maps | MapLibre GL JS (planned) |
| PWA | Service Worker + Web App Manifest |

## Implemented Features

### Authentication
Login, registration, two-factor auth, password recovery. Animated particle backgrounds, hexagonal ARGUX logo, CIA/Palantir dark aesthetic.

### App Shell
Collapsible sidebar (30+ nav items), header with live clock, 10 themes (7 dark, 3 light), profile page (5 tabs), notification center, PWA support.

### Persons Module — `/persons`
Datatable (12 columns, sort, paginate, skeleton), advanced filters (12 fields, multi-select), right-click context menu, mobile cards. Create/Edit with 6-tab form (Basic, Contacts, Social, Addresses, Employment, Notes). Show with 7-tab detail (Overview + AI summary with Generate button, Contacts, Social, Addresses, Employment, Vehicles, Notes). Print dossier page. 15 mock persons.

### Organizations Module — `/organizations`
Datatable with advanced filters (8 fields). Create/Edit with 5-tab form. Show with 6-tab detail (Overview + AI summary, Contacts, Social, Addresses, Vehicles, Notes). Print dossier. CEO/Owner searchable from persons. 10 mock organizations, 41 industries.

### Vehicles Module — `/vehicles`
Datatable with photo thumbnails, color dot swatches, status/risk badges. Advanced filters (9 fields). Create/Edit with photo gallery (upload, delete), status dropdown. Show with gallery lightbox, vehicle info, ownership cards linked to persons/organizations. 18 mock vehicles, 20 types, 33 makes, 20 colors.

### Error Pages
7 custom pages (403, 404, 408, 419, 429, 500, 503) with animated particle backgrounds, tactical messaging, glitch effects (500). Auto-rendered by Laravel exception handler.

### Cross-Cutting
CSS architecture with custom properties, responsive breakpoints, skeleton loading, toast notifications, delete confirmation modals, locale switching (EN/HR).

## Route Map

### Implemented

| Route | Page |
|-------|------|
| `/login` | Operator Login |
| `/register` | Request Access |
| `/2fa` | Two-Factor Auth |
| `/forgot-password` | Password Recovery |
| `/persons` | Persons List |
| `/persons/create` | Add Person |
| `/persons/:id` | Person Detail (7 tabs) |
| `/persons/:id/edit` | Edit Person (6 tabs) |
| `/persons/:id/print` | Print Dossier |
| `/organizations` | Organizations List |
| `/organizations/create` | Add Organization |
| `/organizations/:id` | Organization Detail (6 tabs) |
| `/organizations/:id/edit` | Edit Organization (5 tabs) |
| `/organizations/:id/print` | Print Dossier |
| `/vehicles` | Vehicles List |
| `/vehicles/create` | Add Vehicle |
| `/vehicles/:id` | Vehicle Detail |
| `/vehicles/:id/edit` | Edit Vehicle |
| `/notifications` | Notification Center |
| `/profile` | My Profile (5 tabs) |
| `/errors/*` | Error Page Previews |

### Planned (route stubs exist)

`/map` · `/devices` · `/face-recognition` · `/connections` · `/alerts` · `/operations` · `/chat` · `/scraper` · `/web-scraper` · `/apps` · `/workflows` · `/data-sources` · `/activity` · `/risks` · `/records` · `/storage` · `/reports` · `/jobs`

## Documentation

| Document | Description |
|----------|-------------|
| [docs/API.md](docs/API.md) | Mock API endpoints, request/response contracts |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, folder structure, data flow |
| [docs/AUTH.md](docs/AUTH.md) | Authentication flows, mock credentials |
| [docs/BUILD.md](docs/BUILD.md) | Vite config, build process, asset pipeline |
| [docs/DATABASE.md](docs/DATABASE.md) | Mock data strategy, TypeScript interfaces |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [docs/DOCKER.md](docs/DOCKER.md) | Docker Compose setup |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | Environment variables |
| [docs/GIT.md](docs/GIT.md) | Git workflow, commit conventions |
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Full setup instructions |
| [docs/QUEUE.md](docs/QUEUE.md) | Mock job queue strategy |
| [docs/RELEASE.md](docs/RELEASE.md) | Release process, versioning |
| [CHANGELOG.md](CHANGELOG.md) | Complete version history (0.1.0 → 0.4.3) |

## Theming

10 themes: Tactical Dark, Midnight Ops, Stealth Green, Crimson Ops, Desert Storm, Ocean Depth, Phantom Gray, Arctic White, Sand Light, Silver Steel.

## Mock Data

| Entity | Records | Source |
|--------|---------|--------|
| Persons | 15 | `resources/js/mock/persons.ts` |
| Organizations | 10 | `resources/js/mock/organizations.ts` |
| Vehicles | 18 | `resources/js/mock/vehicles.ts` |

## License

**CLASSIFIED // NOFORN** — Internal use only.
