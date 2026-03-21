# Changelog

## 0.6.0 - 2026-03-21

### Added — AI Assistant Chat Module
- **AI Assistant page** (`/chat`): Full-screen ChatGPT-style interface with conversation sidebar, message area, and input bar.
  
  **Conversation Sidebar:**
  - Conversation list with title, message count, date, and entity tag previews (person/org chips)
  - "New Conversation" button creates empty conversation
  - Search filter across conversation titles
  - Delete button (hover-reveal) with confirmation modal
  - Active conversation highlighted with accent border
  - Mobile: slides in from left with overlay backdrop

  **Message Area:**
  - User messages right-aligned with accent background, assistant messages left-aligned with border
  - Avatar icons: user (person silhouette), assistant (clock/analysis icon with gradient)
  - Markdown rendering in assistant messages: `##`/`###` headings, `**bold**`, `` `code` ``, bullet/numbered lists, tables with borders
  - Typing indicator: 3 animated bouncing dots while AI "processes"
  - Auto-scroll to bottom on new messages
  - Empty state: ARGUX AI logo with description prompt
  - Image attachments render as clickable thumbnails (120×80px) with lightbox
  - File/audio/video attachments render as chips with type icon, name, and size

  **Input Area:**
  - Multi-line textarea with Enter to send, Shift+Enter for newline
  - Attachment toolbar: paperclip (any file), image icon (images only), audio waveform (audio only), video camera (video only)
  - Pending files display as removable chips above textarea with type-specific icons
  - Send button disabled during typing animation or when empty
  - Input area border highlights on focus

  **Entity Assignment:**
  - Persons multi-select dropdown (searchable) in chat header — assigns persons to conversation
  - Organizations multi-select dropdown (searchable) in chat header — assigns organizations to conversation
  - Entity tags visible in sidebar conversation items
  - Both populated from connection nodes (15 persons, 10 organizations)

  **Mock AI Responses:**
  - 4 varied response templates: risk assessment, connection analysis, file processing summary, surveillance imagery analysis
  - Simulated 1.5–3s response delay with typing animation
  - Responses include markdown formatting (headings, bold, lists, tables, code)

  **Mock Conversations (5):**
  - "Alpha Security Group — Risk Assessment" — 4 messages, linked to Marko Horvat, Ivan Babić, Alpha Security Group
  - "Mendoza Network — Movement Analysis" — 2 messages with CSV attachment, linked to Carlos Mendoza, Omar Hassan, Mendoza IE, Falcon Trading
  - "Vehicle Registration — LPR Analysis" — 2 messages with image attachment (car_1.jpg), linked to Marko Horvat
  - "Petrova Consulting — Background Check" — 2 messages, linked to Elena Petrova, Petrova Consulting
  - "Gulf Maritime — Vessel Tracking" — 2 messages with Excel + video attachments, linked to Gulf Maritime, Falcon Trading

- **Chat CSS** (`resources/css/pages/chat.css`): Full-height flex layout, sidebar (280px fixed), message bubbles with user/assistant styling, markdown table/heading/code styles, typing animation keyframes, attachment chips/thumbnails, input area with toolbar, entity tags, mobile responsive (sidebar slides in at 768px).

### Routes Changed
- `GET /chat` → now renders `Chat/Index` (was Dashboard placeholder)

## 0.5.3 - 2026-03-21

### Added — Connection CRUD, Graph Interactions, Print Updates
- **Add Connection**: "Add" button in the connections tab toolbar opens a modal form with: Connected Entity (searchable dropdown of all persons + organizations), Connection Type (searchable from 55 types), Relationship (Good/Bad/Neutral/Unknown toggle buttons with color indicators), Strength (1–5 clickable buttons), First Seen / Last Seen (date pickers), Notes (textarea). Saves to local state, rebuilds graph.
- **Edit Connection**: Edit (pencil) button on each connection card opens the same modal pre-populated with existing data. Updates in-place.
- **Delete Connection**: Delete (trash) button on each connection card triggers confirmation modal. Removes from local state and rebuilds graph.
- **Category filters on bubble graph**: Row of filter toggle buttons above the canvas (Family, Personal, Professional, Criminal, Operational, Legal, Unknown). Each with color dot. Toggle on/off filters both the graph and the edge list below. Active filters highlighted with category color border/background.
- **Drag and drop nodes**: Click and drag any node to reposition it within the force simulation. Dragged nodes freeze physics while held. Release resumes simulation. Center entity (larger node) can also be dragged.
- **Zoom controls**: Three button overlay on bottom-right of canvas: + (zoom in 1.2x), − (zoom out 0.8x), FIT (reset to 1x zoom + center pan). Mouse wheel zoom also supported (0.4x–2.5x range). Pan by dragging empty canvas space.
- **Help tooltip**: Top-left canvas overlay showing "Drag nodes · Scroll to zoom · Drag empty to pan".
- **Connection Form Modal** (`ConnectionFormModal`): Full-featured form with searchable selects for entity and connection type, relationship toggle buttons with colored states, strength selector (1–5 numeric buttons), date inputs with dark color scheme, notes textarea. Validates required fields (entity + type).
- **Connections section in Person Print**: Table with columns: Connected Entity (name + type), Type, Category, Relationship, Strength (dots), Period, Notes. Rendered from `allEdges` filtered to `p-{id}`.
- **Connections section in Organization Print**: Same table layout filtered to `o-{id}`.

### Changed
- **ConnectionsBubble component** fully rebuilt: Uses refs for all filter/edge state to prevent blank screen on state changes. Single `useEffect` with `[]` dependency. Graph canvas now supports: drag-and-drop (nodes), panning (empty space), zoom (wheel + buttons), category filtering (toolbar), CRUD (add/edit/delete modals). Edge list cards now include Edit and Delete action buttons alongside type and relationship badges.
- Canvas height increased from 340px to 360px for better visibility.

## 0.5.2 - 2026-03-21

### Added
- **Profile photo lightbox on Person Show**: Clicking the avatar in the header opens a full-screen lightbox overlay (uses shared `veh-lightbox` CSS classes). Close button in top-right. Only appears when person has an avatar. Avatar has hover scale effect (1.05x) and pointer cursor when photo exists.
- **Logo lightbox on Organization Show**: Same lightbox behavior for organization logos. Clicking logo opens full-screen view. Hover scale effect and pointer cursor.
- **Connections tab on Person Show**: New tab (network icon) between Vehicles and Notes. Renders `ConnectionsBubble` component scoped to `p-{id}`. Shows force-directed mini graph (340px height) of the person's direct connections with interactive canvas, plus a scrollable list of all connections below with type badge, relationship badge, strength dots, date range, notes, and click-to-navigate to connected entity.
- **Connections tab on Organization Show**: Same tab and `ConnectionsBubble` component scoped to `o-{id}`. Shows organization's direct connections graph and list.
- **Relationship field** added to `ConnectionEdge` interface: `relationship: Relationship` where `Relationship = 'Good' | 'Bad' | 'Neutral' | 'Unknown'`.
- **Relationship colors**: Good = green `#22c55e`, Bad = red `#ef4444`, Neutral = amber `#f59e0b`, Unknown = gray `#6b7280`.
- **Relationship display** across all connection views:
  - **ConnectionsBubble** (person/org show pages): Colored relationship dot at edge midpoints. Hover shows both connection type and relationship labels. Edge list cards show relationship badge next to type badge.
  - **Connections Index** (`/connections`): Colored relationship dot at edge midpoints on canvas. Hover shows type + relationship labels. Info panel edge items show dual badges (type + relationship) side by side.
- **ConnectionsBubble component** (`components/connections/ConnectionsBubble.tsx`): Reusable mini force-directed graph scoped to a single entity. 340px canvas with physics simulation, hover effects, click-to-navigate to connected entities, relationship dots on edges. Below canvas: full edge list with avatars, type/relationship badges, strength, dates, notes. All cards clickable.
- **35 edges updated** with realistic relationship values: Business partners → Good, Employees → Neutral, Lovers → Good, Criminal connections → mixed (Co-conspirators → Good, Financiers → Bad, Associates → Bad), Family → Good, Classmates/Friends → Good/Neutral, Operational → Unknown, Legal → Neutral.

## 0.5.1 - 2026-03-21

### Fixed
- **Blank screen on node click** in Connections Graph: Root cause was the `useEffect` depending on `[focusedId, search, activeCategories]`, causing full canvas teardown/rebuild on every click. Rewrote to use refs (`focusedRef`, `filterPersonsRef`, `filterOrgsRef`, `activeCatsRef`, `hoveredRef`) for all filter state, with the draw loop reading from refs. The `useEffect` now runs once with empty dependency array `[]`. Node rebuilds triggered via `setTimeout(rebuildNodes, 10)` after state changes. No more flicker or blank screen.

### Changed
- **Replaced search input** with two multi-select dropdowns: Persons (searchable, multi-select from 15 persons) and Organizations (searchable, multi-select from 10 organizations). Selecting entities filters the graph to show only those entities and their direct connections. Both can be used simultaneously.
- **Left-click on node** now properly isolates that entity's connections without blank screen. Click again or click "Show All Connections" to reset.

### Added
- **Right-click context menu** on person/organization nodes: Shows entity name header + "View Profile" button. Navigates to `/persons/:id` or `/organizations/:id`. Menu auto-positions to stay within viewport bounds.
- **Mock profile photos** updated for 5 persons (Marko Horvat, Ana Kovačević, Ahmed Al-Rashid, Elena Petrova, Omar Hassan) with provided photo URL. Info panel shows avatar in header when available.
- **Mock company logos** updated for 4 organizations (Alpha Security Group, Rashid Holdings International, Dragon Tech Solutions, Falcon Trading LLC) with provided logo URL.

## 0.5.0 - 2026-03-21

### Added — Connections Graph Module
- **Connections Graph page** (`/connections`): Full-screen interactive force-directed graph showing relationships between persons and organizations.
  - **Canvas-based rendering** at 60fps with device pixel ratio support for crisp rendering on retina displays.
  - **Force simulation**: Repulsion between nodes, attraction along edges (strength-weighted), center gravity. Continuous physics with velocity damping.
  - **Node types**: Person bubbles (24px radius, dark blue fill) and Organization bubbles (30px radius, slightly lighter). Initials rendered inside. Risk-colored borders (Critical=red, High=orange, etc.). Labels + type badge below each node.
  - **Edge rendering**: Color-coded by connection category. Line thickness based on strength (1–5). Hover highlights connected edges and shows type labels at midpoint. Non-connected edges fade to near-invisible.
  - **Click-to-isolate**: Clicking a node filters the graph to show only that entity and its direct connections. "Show All Connections" reset button appears. Clicking again deselects.
  - **Hover effects**: Node glow ring, edge highlighting, non-connected nodes fade to 20% opacity. Cursor changes to pointer over nodes.
  - **Pan and zoom**: Mouse drag to pan the canvas. Scroll wheel to zoom (0.3x–3x). Zoom centers on mouse position.
  - **Drag nodes**: Click and drag individual nodes to reposition them within the force simulation.
  - **Search**: Text search filters graph to matching entities and their connections. Live filtering as you type.
  - **Category filters**: Toggle visibility by connection category (Family, Personal, Professional, Criminal, Operational, Legal, Unknown). Each with colored dot indicator. Toolbar buttons with active state.
  - **Info panel**: Right-side panel appears on node click showing: entity name, type, nationality/industry, risk badge, "View Profile" link (navigates to `/persons/:id` or `/organizations/:id`), all connections listed with type badge, strength dots (●○), date range, and notes. Click connection names to navigate to that entity.
  - **Legend**: Bottom-left overlay showing active category colors with type counts, plus Person/Organization node indicators.
  - **Stats bar**: Bottom-right showing Nodes count, Edges count, Zoom percentage.

- **Mock connections data** (`resources/js/mock/connections.ts`):
  - **55 connection types** across 7 categories:
    - **Family** (23): Mother, Father, Son, Daughter, Brother, Sister, Uncle, Aunt, Cousin, Nephew, Niece, Grandfather, Grandmother, Godfather, Godmother, Step-Father, Step-Mother, Step-Brother, Step-Sister, In-Law, Guardian, Spouse, Ex-Spouse
    - **Personal** (9): Friend, Best Friend, Acquaintance, Lover, Ex-Lover, Neighbor, Roommate, Classmate, Military Comrade
    - **Professional** (11): Employee, Employer, Business Partner, Business Associate, Investor, Client, Supplier, Contractor, Consultant, Mentor, Protégé
    - **Criminal** (10): Co-Conspirator, Handler, Asset, Informant, Accomplice, Suspect, Associate, Cell Member, Recruiter, Financier
    - **Operational** (7): Co-location, Communication, Financial Transaction, Travel Companion, Shared Vehicle, Shared Property, Shared Device
    - **Legal** (4): Legal Representative, Witness, Defendant, Plaintiff
    - **Unknown** (1): Unknown
  - **35 connection edges** with realistic intelligence data: strength (1–5), notes, first/last seen dates. Covers Alpha Security Group network, Rashid Holdings network, Mendoza network, Petrova/Dragon Tech connections, family relations, co-locations, financial transactions, military comrade links, legal representation.
  - **25 nodes** derived from existing persons (15) and organizations (10) mock data.
  - Category-to-color mapping: Family=amber, Personal=green, Professional=blue, Criminal=red, Operational=purple, Legal=cyan, Unknown=gray.

- **Connections CSS** (`resources/css/pages/connections.css`): Full-height layout, toolbar with filter buttons, canvas wrapper, info panel with glassmorphism, legend overlay, stats bar, reset button. Responsive at 768px and 480px.

### Routes Changed
- `GET /connections` → now renders `Connections/Index` (was Dashboard placeholder)

## 0.4.3 - 2026-03-21

### Added
- **Comprehensive README.md**: Full project overview with tech stack table, implemented features summary, complete route map (21 implemented + 18 planned), project structure tree, documentation index, theming table, mock data summary. Version badges.
- **13 documentation files** in `docs/`:
  - `INSTALLATION.md` — Prerequisites, step-by-step setup, troubleshooting table
  - `ARCHITECTURE.md` — Design principles, data flow diagram, folder structure, state management table, CSS architecture
  - `AUTH.md` — All 4 auth flows documented, mock credentials, session info, Keycloak notes
  - `API.md` — Response format contracts (list/action/error), current endpoints, planned mock API routes
  - `BUILD.md` — Vite config, CSS pipeline (6 import layers), TypeScript setup, asset locations
  - `DATABASE.md` — Mock data strategy, all interfaces listed, reference arrays with counts, color maps, cross-reference documentation
  - `ENVIRONMENT.md` — All env variables with defaults, explicitly lists variables NOT needed
  - `DEPLOYMENT.md` — Production build steps, Nginx config, air-gap deployment notes, classification requirements
  - `DOCKER.md` — docker-compose.yml, Dockerfile, multi-stage production build, Kubernetes notes
  - `GIT.md` — Branch strategy, Conventional Commits with type table, tagging process, PR template
  - `QUEUE.md` — Mock job pattern with code example, simulated operations table, production Kafka target
  - `RELEASE.md` — Semver rules, release checklist, version file locations table
  - `CHANGELOG.md` — Symlink to root CHANGELOG.md

### Changed
- **Vehicle Show page** (`/vehicles/:id`): Replaced hero photo layout with gallery grid using the shared `VehiclePhotos` component. Photos now display as a grid of clickable cards with hover overlay (view/expand), consistent with the Create/Edit photo gallery style. Lightbox with prev/next navigation handled by the component internally. Section header shows photo count. Empty state for vehicles without photos.

## 0.4.2 - 2026-03-21

### Added
- **Vehicle photos** across all vehicle pages:
  - **Vehicle interface**: New `photos: string[]` field added to Vehicle interface.
  - **Mock data**: Car mockup images (`car_1.jpg`, `car_2.jpeg`) assigned to 9 of 18 vehicles. Critical/High risk vehicles tend to have photos.
  - **Show page**: Photo hero section with main image (260px height, hover zoom), thumbnail strip with active state border, full-screen lightbox with prev/next navigation and counter badge. Badge shows "2 PHOTOS" overlay.
  - **Create page**: Vehicle Photos section with editable `VehiclePhotos` component — drag/upload zone, photo gallery grid, delete buttons on hover.
  - **Edit page**: Same editable `VehiclePhotos` component with pre-loaded photos from mock data. Upload and delete functionality.
  - **Index page**: 32x24px photo thumbnail column added to datatable. Shows first photo or a car icon placeholder for vehicles without photos.
- **VehiclePhotos component** (`components/vehicles/VehiclePhotos.tsx`): Reusable gallery with lightbox (prev/next navigation, close button, counter), photo grid with hover overlay (view + delete buttons), upload zone with file picker (multi-file, accepts images). Supports `editable` prop to toggle upload/delete. Toast notifications on upload and delete.
- **Vehicle photos CSS** (`resources/css/pages/vehicles.css`): Photo grid, photo card with aspect-ratio 4/3, hover overlay with action buttons, upload zone with dashed border, lightbox with blur close/nav buttons, hero image with zoom, thumbnail strip, responsive breakpoints.
- **Status dropdown filter** added to Vehicles Index advanced filters (multi-select with Active/Inactive/Deleted/Suspended/Under Review).
- **Status dropdown** added to Vehicle Create form (in Registration section alongside Plate and VIN).

## 0.4.1 - 2026-03-21

### Added
- **Vehicle Edit page** (`/vehicles/:id/edit`): Pre-populated sectioned form with Registration (plate uppercase + VIN + Status dropdown), Ownership (Person searchable + Organization searchable), Vehicle Details (Type/Make/Model/Year/Color/Risk), Notes textarea. Not-found state for invalid IDs. Shows vehicle plate and make/model in header.
- **Vehicle Show page** (`/vehicles/:id`): Two-column responsive layout. Left column: Vehicle Information field grid (plate, VIN, make, model, year, type, color, UUID all displayed), Intelligence Notes card, Record Timestamps. Right column: Ownership section with clickable Person card (navigates to `/persons/:id`) and Organization card (navigates to `/organizations/:id`) with hover effects and arrow icons, Color Profile section with 60px color swatch rendering the actual color hex. Header: plate in styled badge box, make/model/year title, color dot + type subtitle, status + risk badges, Back/Export PDF/Edit buttons.
- **Vehicles tab on Person Show page**: New "Vehicles" tab (car icon) between Employment and Notes. Lists all vehicles where `personId` matches. Each vehicle card shows: plate in styled monospace badge, make + model, type/year/color (with color dot swatch), status + risk badges, organization name if linked, notes. Cards are clickable → navigates to `/vehicles/:id`. Count shown in tab title.
- **Vehicles tab on Organization Show page**: New "Vehicles" tab (car icon) between Addresses and Notes. Lists all vehicles where `orgId` matches. Same card layout as Person Show vehicles tab, but shows person name instead. Cards clickable to vehicle detail page.

### Changed
- Vehicle routes updated to render proper Edit and Show pages (were previously placeholders pointing to Create).

## 0.4.0 - 2026-03-21

### Added — Vehicles Module
- **Vehicles List** (`/vehicles`): Responsive datatable with columns: Registration Plate (bold monospace), Owner (Person name + Organization name stacked), Type, Color (with color dot swatch), Make + Model, Year, Status badge, Risk badge, Actions (Edit/View/Delete with tooltips). Skeleton loader. Right-click context menu. Mobile card layout at 860px breakpoint. Pagination (10/page). Column sorting on Plate, Type, Make, Year, Risk.
- **Advanced Search Filters**: Plate (text input); Person (multi-select, populated from persons list), Organization (multi-select, populated from organizations list), Type (multi-select, 20 vehicle types), Make (multi-select, 33 makes), Color (multi-select, 20 colors with visual swatches in table), Year (multi-select, 2026–1997), Risk (multi-select, 5 levels). Filter counter badge. "Clear all" button.
- **Create Vehicle** (`/vehicles/create`): Sectioned form layout with Registration (plate input with uppercase transform + VIN), Ownership (Person searchable dropdown + Organization searchable dropdown), Vehicle Details (Type, Make, Model, Year, Color — all searchable; Risk dropdown), Notes textarea.
- **Mock data** (`resources/js/mock/vehicles.ts`): 18 vehicles with realistic data across 10 countries. Includes armored vehicles, motorcycles, boats, EVs. Cross-references existing persons and organizations by ID. Reference arrays: 20 vehicle types (Sedan to Commercial), 33 makes (Audi to Volvo), 20 colors (Black to Gunmetal with RGB mapping for dot swatches), 30 years. Color dot component maps color names to hex values.
- **Vehicle types**: Sedan, SUV, Truck, Van, Motorcycle, Sports Car, Pickup, Hatchback, Coupe, Convertible, Minivan, Bus, Armored Vehicle, Boat, Helicopter, Aircraft, ATV, Electric Vehicle, Luxury Vehicle, Commercial Vehicle.
- Delete confirmation modal with vehicle plate in message.

### Routes Added
- `GET /vehicles` → Vehicles/Index
- `GET /vehicles/create` → Vehicles/Create
- `GET /vehicles/:id/edit` → Vehicles/Create (placeholder)
- `GET /vehicles/:id` → Vehicles/Create (placeholder)

## 0.3.2 - 2026-03-21

### Added
- **Generate Summary button** on Person Show page: Blue accent button in the AI Summary header bar. Clicking triggers a 2-second loading animation (shimmer skeleton lines), then regenerates the summary text with an appended re-analysis timestamp and randomized confidence percentage (85–99%). Shows toast on completion. Button shows spinner icon and "Generating..." text while loading, disabled during generation.
- **Generate Summary button** on Organization Show page: Same behavior — loading skeleton, regenerated text with confidence score, toast notification, disabled state during generation.

### Changed
- **Employment tab layout** in Person Create/Edit: Start Date and End Date fields moved to a separate row below Title and Company (was previously all in one grid). New row also includes Country (searchable dropdown with 120+ countries) and City (text input) as separate fields, replacing the single "Location" text input.
- **PersonEmployment interface** updated: `location: string` field replaced with `city: string` and `country: string` fields.
- **Mock employment data** updated: All 8 employment records across 4 persons now use separate `city` and `country` fields instead of combined `location` string.
- **Person Show employment display**: Location line now renders `city, country` from separate fields (joined with comma, filtered for empty values).
- **Person Print employment table**: Updated columns from "Location" to separate "City" and "Country" columns.

## 0.3.1 - 2026-03-21

### Added
- **Employment tab** for Person Create/Edit forms: 6th vertical tab with fields: Job Title (text), Company (searchable dropdown populated from organizations list), Start Date (month picker), End Date (month picker, empty = "Present"), Location (text), Notes (text). Supports multiple employment entries with add/remove.
- **Employment tab** on Person Show page: Displays employment history with title, company name (accent color), location with map pin icon, date range (monospace), "Current" badge for ongoing positions, notes section with border separator.
- **Employment data** in mock persons: 4 persons with realistic employment histories — Marko Horvat (Intelligence Officer at Alpha Security Group + Military Analyst at Croatian Armed Forces), Ahmed Al-Rashid (CEO at Rashid Holdings + Investment Director at Saudi Investment Bank), Omar Hassan (Managing Director at Falcon Trading + Trade Consultant at Egyptian Ministry), Ivan Babić (Security Director at Alpha Security + Police Inspector at Croatian Police).
- **Employment section** in Person Print page: Table with Title, Company, Location, Period, Notes columns.
- **Organization Print page** (`/organizations/:id/print`): Standalone A4 white-background page with ARGUX header, intelligence summary, company information grid, websites table, linked persons table, emails table, phones table, social media table, addresses table, intelligence notes, CLASSIFIED footer. Uses shared `print-*` CSS classes. "Print This Page" button triggers `window.print()`.
- **Print button** on Organization Show page: Navigates to `/organizations/:id/print`. Positioned between Back and Export PDF buttons.
- `PersonEmployment` interface exported from `mock/persons.ts`.

### Routes Added
- `GET /organizations/:id/print` → Organizations/Print

## 0.3.0 - 2026-03-21

### Added — Organizations Module
- **Organizations List** (`/organizations`): Sortable datatable with columns: UUID (click-to-copy), Company Logo, Company Name, Country, CEO, Industry, VAT (truncated), Website (first URL), Risk badge, Actions (Edit/View/Delete with tooltips). Skeleton loader on initial load. Right-click context menu. Responsive mobile card layout at 860px breakpoint. Pagination (10/page).
- **Advanced Search Filters**: UUID, Company Name, CEO (text inputs); Country (multi-select, 120+ countries), Industry (multi-select, 41 industries), Risk (multi-select, 5 levels), Website (multi-select, dynamic from data). Filter counter badge shows active count.
- **Create Organization** (`/organizations/create`): 5-tab form with vertical left tabs (horizontal on mobile):
  - **Basic Info**: Company logo upload, Company Name, VAT, Tax Number, Industry (searchable, 41 options), Risk level, CEO (searchable dropdown from persons list), Owner (searchable from persons list), multiple Websites (add/remove).
  - **Contacts**: Multiple emails (email, type, status, notes), Multiple phones (number, type, status, notes).
  - **Social Media**: Facebook, LinkedIn, Instagram, TikTok, Snapchat, YouTube — each supports multiple profile URLs.
  - **Addresses**: Multiple addresses (street, number, zip, city, country searchable, notes).
  - **Notes**: Add/edit/delete notes with confirmation modal for deletion.
- **Edit Organization** (`/organizations/:id/edit`): Same form pre-populated from mock data.
- **Show Organization** (`/organizations/:id`): Header card with logo, name, industry, country, CEO, risk badge. Vertical tabs: Overview (AI summary, company info fields, websites list, linked persons with click-to-navigate to person detail), Contacts (emails/phones with type/status badges), Social Media, Addresses, Notes. Export PDF button (simulated).
- **Mock data** (`resources/js/mock/organizations.ts`): 10 organizations across 8 countries/10 industries. Each with realistic data: Alpha Security Group (Croatia, Cybersecurity, Critical), Rashid Holdings (Saudi Arabia, Private Equity, Critical), Meridian Logistics (Germany, Low), Dragon Tech (China, IT, Medium), Falcon Trading (Egypt, High), Mendoza Import-Export (Colombia, Critical), Mitchell & Partners (UK, Legal, No Risk), Petrova Consulting (Russia, Medium), Gulf Maritime (UAE, High), Sharma Pharma (India, Low). Industries array: 41 options. Linked persons reference existing person mock data by ID.

### Routes Added
- `GET /organizations` → Organizations/Index
- `GET /organizations/create` → Organizations/Create
- `GET /organizations/:id/edit` → Organizations/Edit
- `GET /organizations/:id` → Organizations/Show

## 0.2.5 - 2026-03-21

### Added
- **7 custom error pages** with animated particle backgrounds, tactical styling, and full responsiveness:
  - **404 Not Found** — Blue particles, search-minus icon, "Target Not Found / SIGNAL LOST — LOCATION UNKNOWN"
  - **403 Forbidden** — Amber particles, lock icon, "Access Denied / AUTHORIZATION REQUIRED — CLEARANCE INSUFFICIENT"
  - **500 Internal Server Error** — Red particles with glitch effect, warning triangle, "System Malfunction / CRITICAL FAILURE — ALL SYSTEMS COMPROMISED"
  - **503 Service Unavailable** — Purple particles, gear icon, "System Maintenance / SCHEDULED DOWNTIME — SYSTEMS UPGRADING"
  - **419 Session Expired** — Orange particles, clock icon, "Session Expired / AUTHENTICATION TOKEN INVALIDATED"
  - **429 Too Many Requests** — Yellow particles, lightning icon, "Rate Limit Exceeded / REQUEST THROTTLED — COOLING DOWN"
  - **408 Request Timeout** — Cyan particles, wifi-off icon, "Connection Timeout / SIGNAL INTERRUPTED — NO RESPONSE FROM TARGET"
- **ErrorParticles component** (`components/auth/ErrorParticles.tsx`) — Configurable particle canvas with: custom accent/secondary color, glitch effect toggle, grid lines, pulsing warning rings, mouse-repulsion physics, scan line, connection lines between particles.
- **ErrorPage layout** (`pages/Errors/ErrorPage.tsx`) — Shared error page template with: animated error code digits (staggered fade-in with blur), pulsing icon container, tactical status bar (error code, live clock, version, classification), configurable action buttons (primary/secondary with navigation), ARGUX logo.
- **Error preview routes** (`/errors/403`, `/errors/404`, etc.) for development testing.
- **Exception handler** in `bootstrap/app.php` — maps HTTP status codes 403/404/408/419/429/500/503 to their Inertia error pages automatically. Falls back to default response for JSON/API requests.
- **Error pages CSS** (`resources/css/pages/errors.css`) — Full-screen layout, animated digit entry, icon pulse keyframes, dot blink animation, responsive breakpoints at 640px and 400px (code shrinks, buttons stack vertically).

### Routes Added
- `GET /errors/403` → Errors/403 (preview)
- `GET /errors/404` → Errors/404 (preview)
- `GET /errors/408` → Errors/408 (preview)
- `GET /errors/419` → Errors/419 (preview)
- `GET /errors/429` → Errors/429 (preview)
- `GET /errors/500` → Errors/500 (preview)
- `GET /errors/503` → Errors/503 (preview)

## 0.2.4 - 2026-03-21

### Changed — CSS Architecture Refactor
Extracted all CSS into a modular file structure. Replaced monolithic inline `<style>` blocks and inline styles with reusable CSS classes backed by CSS custom properties.

**New CSS file structure:**
```
resources/css/
├── app.css              ← Import hub (loads all modules)
├── variables.css        ← CSS custom properties / theme tokens
├── base.css             ← Reset, animations, utility classes
├── components.css       ← Buttons, inputs, badges, modals, dropdowns, toggles, cards, tooltips, context menus, search bars, toasts, section headers
├── layout.css           ← App shell, sidebar, header, vertical tabs, horizontal tabs, responsive breakpoints
└── pages/
    ├── auth.css         ← Login, register, 2FA, forgot password
    ├── persons.css      ← Table, mobile cards, filters, avatar, header card, AI summary, education, field display
    ├── profile.css      ← Audit logs, settings themes/fonts, security toggles, sessions, stat cards, date range, multiselect
    ├── notifications.css← Notification items, tabs, footer
    └── print.css        ← A4 print layout, tables, badges, notes, header/footer, @page rules
```

**Key CSS classes introduced:**
- Layout: `.ax-app-shell`, `.ax-app-main`, `.ax-app-content`, `.ax-sidebar`, `.ax-header`, `.ax-vtabs`, `.ax-htabs`
- Components: `.ax-btn`, `.ax-btn-primary`, `.ax-btn-secondary`, `.ax-btn-danger`, `.ax-btn-sm`, `.ax-btn-icon`, `.ax-input`, `.ax-input-bare`, `.ax-select`, `.ax-textarea`, `.ax-card`, `.ax-badge`, `.ax-skeleton`, `.ax-overlay`, `.ax-modal`, `.ax-dropdown`, `.ax-checkbox`, `.ax-tooltip`, `.ax-context-menu`, `.ax-search-bar`, `.ax-toast`, `.ax-add-btn`, `.ax-remove-btn`, `.ax-empty`, `.ax-section-title`
- Utilities: `.ax-flex`, `.ax-grid-auto`, `.ax-truncate`, `.ax-mono`, `.ax-fade-in`, `.ax-hide-mobile`, `.ax-hide-desktop`, `.ax-gap-*`, `.ax-mb-*`, `.ax-text-*`, `.ax-color-*`
- Persons: `.persons-table`, `.persons-table-cols`, `.persons-table-row`, `.persons-mobile-cards`, `.persons-filters`, `.person-header-card`, `.person-ai-summary`, `.person-edu-card`, `.person-field`
- Profile: `.audit-table`, `.audit-row`, `.settings-theme-grid`, `.session-card`, `.stat-card`, `.multiselect-trigger`
- Print: `.print-page`, `.print-header`, `.print-section`, `.print-table`, `.print-note`, `.print-footer`, `.print-badge`, `.print-summary`

**AppLayout changes:**
- Removed inline `<style>` block with reset/animations/scrollbar (now in `base.css`)
- Kept only dynamic `:root` CSS variable injection for active theme
- Shell uses `.ax-app-shell`, `.ax-app-main`, `.ax-app-content` classes

**Print page rebuilt** to use `.print-*` CSS classes instead of all-inline styles.

## 0.2.3 - 2026-03-21

### Added
- **Education section** in Create/Edit person Basic Info tab: School/College name, Website URL, Country (searchable dropdown, 120+ countries), Degree (searchable dropdown, 33 options from High School to PhD/Military/Police Academy), Start Year, End Year. Supports multiple education entries with add/remove.
- **Education data** in mock persons: 5 persons populated with realistic education (University of Zagreb, Croatian Military Academy, King Saud University, Cairo University, Police Academy Zagreb).
- `PersonEducation` interface and `degrees` array (33 degree types) exported from mock data.
- **AI Intelligence Summary** on Show person Overview tab — auto-generated paragraph covering age, nationality, risk assessment, languages, contacts, addresses, education, notes, and connection warnings. Styled with gradient background and AI icon/timestamp header.
- **Education section** on Show person Overview tab — displays school, degree, year range, country, and website in structured cards.
- **Print page** (`/persons/:id/print`) — standalone white-background, A4-optimized page with all person data organized in clean tables. Includes: ARGUX header with classification, AI summary, personal info grid, languages table, education table, emails table, phones table (with messenger app abbreviations), social media table, addresses table, intelligence notes. "Print This Page" button triggers `window.print()`. Footer with CLASSIFIED // NOFORN classification. CSS `@page` rules for A4 margins. `pageBreakInside: avoid` on sections and notes.
- **UUID filter** in advanced search panel — text input field for filtering by UUID.
- **Filter counter badge** — shows exact number of active filters (e.g., "3") instead of generic "!" indicator. Counts each text filter and each multi-select with selections separately.
- **Gender multi-select** — changed Gender filter from single dropdown to multi-select component (can select Male + Female, Male + Other, etc.).

### Routes Added
- `GET /persons/:id/print` → Persons/Print

### Changed
- Show person Print button now navigates to dedicated print page (`/persons/:id/print`) instead of calling `window.print()` on the current page.
- Filter counter properly counts: 8 text fields (name, nickname, email, phone, uuid, tax, dob-from, dob-to) + 7 multi-selects (gender, nationality, country, language, risk, status, religion).

## 0.2.2 - 2026-03-20

### Added
- **Right-click context menu** on person table rows with 3 items: View details (accent), Edit person (gray), Delete person (red with divider). Menu auto-positions to stay on screen. Closes on click/scroll outside.
- **UUID click-to-copy** — clicking the UUID cell in the table copies the full UUID to clipboard and shows a toast confirmation. Styled with dotted underline and copy cursor.
- **Mobile card layout** for persons list — on screens below 860px, the table is replaced with stacked cards showing avatar, name, nickname, nationality, gender, DOB, email, phone, country, UUID, status/risk badges, and Edit/View/Delete buttons.
- **Note delete confirmation modal** in Create and Edit person forms — deleting a note now opens a confirmation dialog instead of deleting immediately.
- **Print button** on Show person page — triggers `window.print()` with CSS print styles that show only the content area and hide navigation/buttons.
- **Export PDF button** on Show person page — simulated 1.5s export with loading spinner and success toast showing generated filename.

### Changed
- Persons list responsive design: search bar and filter button wrap properly on small screens. Filters grid uses `minWidth: 160px` columns. Pagination wraps.
- Create/Edit person responsive design: vertical tabs collapse to horizontal scrollable tabs below 768px. Form layout switches from side-by-side to stacked via `flex-direction: column`. Social media URL inputs use `minWidth: 0` to prevent overflow.
- Show person responsive design: vertical tabs collapse to horizontal below 768px. Header card avatar/info/buttons stack vertically on mobile. Field grid uses `minWidth: 170px` for auto-fill. All text uses `word-break: break-all` for long UUIDs/URLs.

## 0.2.1 - 2026-03-20

### Added
- Skeleton loader for persons table (8 shimmer rows with avatar, name, and column placeholders).
- Delete confirmation modal with warning icon, person name in message, Cancel/Delete buttons.
- Tooltip component for action buttons (Edit person, View details, Delete person).
- Persons table columns expanded: UUID (truncated), Avatar, Name+gender+DOB, Nickname, Nationality, Country, Email, Phone, Tax Number, Status (Active/Inactive/Deleted/Suspended/Under Review), Risk, Actions.
- Advanced filter fields expanded: Name, Nickname, Email, Phone, Tax Number, Gender, DOB from/to, Nationality (multi-select), Country (multi-select), Language (multi-select), Risk (multi-select), Status (multi-select), Religion (multi-select, 28 religions).
- Vertical left sidebar tabs for Create, Edit, and Show person pages (collapses to horizontal tabs on mobile).
- Person form — Basic Info tab: added Status dropdown, Maiden Name field, Languages section (multiple languages with searchable language dropdown, level dropdown: Native/Fluent/Advanced/Intermediate/Basic/Beginner, notes per language), Religion searchable dropdown (28 options).
- Person form — Contacts tab: added Type dropdown for emails and phones (Private/Business/Secret/Undercover/Government/Temporary), Status dropdown (Active/Inactive/Deleted).
- Person form — Addresses tab: Country field replaced with searchable select dropdown (120+ countries).
- Mock data expanded: Person interface includes uuid, status, maidenName, religion, languages[], contact types/statuses. All 15 persons updated with new fields.

### Changed
- Persons table is now horizontally scrollable on small screens with `minWidth: 900px` inner container.
- Persons table rows are sortable by UUID, Name, Nationality, Country, Status, Risk.
- Show person page now uses vertical left tabs matching the form layout, with status badge alongside risk badge in header.

## 0.2.0 - 2026-03-20

### Added
- Persons module — full CRUD with 15 mock person records featuring realistic intelligence data.
- **Persons List** (`/persons`): Sortable datatable with columns: Avatar, Name (with gender/DOB subtitle), Nickname, Nationality, Email, Phone, Language, Risk (color-coded badge), Actions (Edit/View/Delete). Pagination with page size 10. Column sorting on Name, Nationality, Risk. Responsive table hides columns on smaller screens.
- **Advanced Search Filters**: Collapsible filter panel with: Name, Nickname (text inputs), Email, Phone (text), Gender (dropdown), DOB range (date from/to), Nationality (multi-select with search, 120+ options), Country (multi-select, 120+ options), Language (multi-select, 60+ options), Risk Level (multi-select: No Risk/Low/Medium/High/Critical). All filters combine with AND logic. "Clear all filters" reset button.
- **Create Person** (`/persons/create`): 5-tab form — Basic Info (avatar upload, name fields, DOB calendar, gender, nationality searchable dropdown, risk selector, tax number), Contacts (dynamic email list with notes, dynamic phone list with notes + messenger checkboxes for WhatsApp/WeChat/Telegram/Signal/Viber), Social Media (Facebook/LinkedIn/Instagram/TikTok/Snapchat/YouTube — each supports multiple profile URLs), Addresses (multiple addresses with street/number/zip/city/country/notes), Notes (add/edit/delete text notes with timestamps).
- **Edit Person** (`/persons/:id/edit`): Same 5-tab form pre-populated with existing person data. Loads from mock data by ID.
- **Show Person** (`/persons/:id`): Read-only detail page with header card (avatar, full name, nickname, nationality, gender, DOB, risk badge), 5 tabs: Overview (all personal fields), Contacts (emails with note badges, phones with messenger badges), Social Media (grouped by platform), Addresses (formatted cards), Notes (timestamped cards).
- Mock persons data file (`resources/js/mock/persons.ts`) with 15 diverse records, reference arrays for 120+ nationalities, 120+ countries, 60+ languages, risk levels, shared TypeScript interfaces.
- Shared `PersonForm` component used by both Create and Edit pages.

### Routes Added
- `GET /persons` → Persons/Index
- `GET /persons/create` → Persons/Create
- `GET /persons/:id` → Persons/Show
- `GET /persons/:id/edit` → Persons/Edit

## 0.1.6 - 2026-03-20

### Changed
- Audit Logs date filter: replaced single-date dropdown with date range picker (from/to) using native date inputs. Filters entries between selected dates inclusively.
- Audit Logs action filter: replaced single-select dropdown with multi-select component. Supports selecting multiple actions simultaneously with checkboxes, search within options, selected count badge, and bulk clear.
- Audit Logs IP filter: same multi-select upgrade with searchable checkbox list, count badge, and clear functionality.
- App Themes expanded from 5 to 10 themes with improved color contrast: 7 dark themes (Tactical Dark, Midnight Ops, Stealth Green, Crimson Ops, Desert Storm, Ocean Depth, Phantom Gray) and 3 light themes (Arctic White, Sand Light, Silver Steel). Each theme has distinct sidebar/header/accent/background combinations with proper text contrast ratios. Theme cards now show Dark/Light label and 5 color swatches.

### Added
- `DateRangeFilter` component with two date inputs and arrow separator, styled for dark/light themes with `colorScheme: dark`.
- `MultiSelectFilter` component with searchable dropdown, checkbox items, selected count badge, per-dropdown clear button, and "No results" empty state.

## 0.1.5 - 2026-03-20

### Added
- PWA support: web app manifest, service worker with offline shell caching, mock API response caching, push notifications, badge counts, app shortcuts (Map, Persons, Notifications, AI), share target, background sync for queued actions, periodic badge refresh. SVG icons (192/512). Blade template updated with all PWA meta tags, Apple/Android/Windows support, and SW registration script.
- Font selector in Settings tab: 7 fonts (Geist, IBM Plex Sans, DM Sans, Space Grotesk, Outfit, Sora, Source Code Pro) with live preview cards showing sample text in each font. Selection applies instantly across entire app via context.
- IP info modal in Audit Logs: clicking any IP address opens a modal with mock ipinfo.io data (hostname, city, region, country, coordinates, ISP, organization, ASN, postal, timezone, connection type). Includes skeleton loading state and data source attribution.
- SearchableFilter component: dropdown with built-in search input for filtering large option lists. Used for all three audit log filters (dates, actions, IPs).
- Font context (`currentFont`, `setFontId`) added to AppSettingsContext.

### Changed
- Theme system now propagates to header and sidebar backgrounds via `headerBg` and `sidebarBg` properties on each theme. All 5 themes updated with complete color sets including `accentGlow`, `textDim`, `danger/success/warning/cyan` variants.
- Header Settings menu item now links to `/profile?tab=settings` instead of `/settings`. Profile page reads `?tab=` query param to open correct tab.
- Sidebar and AppHeader now use `useAppSettings()` context for all colors instead of static theme import — fully dynamic theming.
- Audit log filter dropdowns replaced with SearchableFilter component featuring type-ahead search, keyboard navigation, and "No results" empty state.
- All CSS colors now available as CSS custom properties (`--ax-bg`, `--ax-accent`, `--ax-sidebar-bg`, etc.) for potential use in child components.
- Blade template expanded with 8 Google Font families for font selector support.

## 0.1.4 - 2026-03-20

### Added
- Toast notification system (`ToastProvider` + `useToast` hook) with 4 types: success, error, warning, info. Slide-in animation with auto-dismiss, colored left border, click-to-dismiss.
- Profile Settings tab with:
  - Language selector with flags (English 🇬🇧, Croatian 🇭🇷, Russian 🇷🇺, Chinese 🇨🇳, Arabic 🇸🇦). Arabic switches layout to RTL.
  - App Theme selector with 5 visual theme cards (Tactical Dark, Midnight Ops, Arctic White, Desert Storm, Crimson Ops) that apply instantly via context.
  - Timezone dropdown (moved from Personal Data tab).
  - Date format dropdown with 10 formats and live preview.
- Theme context system (`AppSettingsContext`) in AppLayout for global theme and RTL direction state.

### Changed
- All success/error messages across profile tabs now use Toast notifications instead of inline banners.
- Fixed mobile scrolling on /profile and all app pages: added `WebkitOverflowScrolling: touch`, `minHeight: 0`, `paddingBottom: 80px` to main content area. Fixed `body { overflow: hidden }` specificity.
- Audit Logs tab: added individual filter dropdowns for Time (date), Action, and IP alongside the search bar. Added "Clear" button to reset all filters. Table is now fully responsive on mobile with stacked card layout and labeled fields.
- Profile tabs now horizontally scrollable on mobile with hidden scrollbar.
- Removed timezone field from Personal Data tab (moved to Settings).

## 0.1.3 - 2026-03-20

### Added
- Skeleton loader components: `Skeleton`, `SkeletonRow`, `SkeletonCard` with shimmer animation.
- `Toggle` switch component for boolean settings.
- Button press animation (scale 0.97 on mousedown, brightness dim during loading).
- Profile page (/profile) with 4 tabs:
  - **Personal Data**: Avatar upload with edit overlay, first/last name, email, phone, timezone dropdown (23 timezones), save with success toast.
  - **Change Password**: Current/new/confirm password with inline strength checklist, validation, session revocation notice on success.
  - **Security**: 2FA method selector (Auth App/SMS/Email) with QR code display for TOTP, 2FA phone, recovery phone, backup code generator (8 codes), physical key registration, session timeout dropdown, session restoration prevention toggle, active sessions list with trust/revoke actions, 7 security feature toggles (auth logging, device fingerprinting, new device detection, failed login tracking, location tracking, suspicious activity detection, device trust management), statistics cards (total logins, failed attempts, unique devices, active sessions).
  - **Audit Logs**: Searchable data table with 20 mock entries, color-coded action badges, pagination (8 per page), columns: Time, Action, Details, IP. Search filters across action, details, and IP fields.
- `ProfileSkeleton` loading state shown for 800ms on initial tab render.

## 0.1.2 - 2026-03-20

### Changed
- Header notification dropdown: updated mock data to System update, Storage, New User, Security, Device, Backup categories with typed icons. Added "Read all" button in dropdown header.
- Notifications route now renders dedicated Notifications page instead of Dashboard placeholder.

### Added
- Notifications page (/notifications) with filter tabs: All, Unread, Critical, Warning, Info. Includes 20 realistic mock notifications with severity badges, type badges, source labels, timestamps, and unread dot indicators. Click to toggle read/unread. "Mark all as read" bulk action. Empty state. Footer stats.

## 0.1.1 - 2026-03-20

### Changed
- Register page: stacked first/last name vertically, added phone number field.
- Removed footer (StatusBar) from all auth pages (Login, Register, 2FA, Forgot Password).

### Added
- AppLayout with responsive sidebar and header.
- Sidebar navigation with 7 sections: Command, Subjects, Intelligence, Analysis, Monitoring, Tools, System.
- AppHeader with city clock dropdown (Zagreb, Riyadh, Sydney), notification dropdown with mock data, user profile dropdown with My Profile, Settings, and Logout.
- Dashboard/Index placeholder page rendered inside AppLayout.
- All sidebar menu routes wired in web.php.
- Responsive mobile sidebar with hamburger toggle and overlay.

## 0.1.0 - 2026-03-19

### Added
- Project scaffolding: Laravel 13 + Inertia + React + TypeScript + Vite.
- Authentication pages: Login, Register, Two-Factor (Auth App / SMS / Email), Forgot Password (4-step flow).
- Particle background with interactive connected nodes, radar grid, scan line, corner brackets.
- CIA/Palantir-inspired dark tactical design system.
- Reusable UI component library: Input, Button, Card, OtpInput, PasswordStrength, MethodSelector, AlertBox, ProgressSteps, SecurityBadge, CheckItem, Divider.
- AuthLayout with ParticleBackground and StatusBar (live clocks: LOCAL / UTC / DC).
- Full i18n support (English + Croatian) for all auth pages.
- Laravel Form Request validation for all auth forms.
- Shared Inertia props: app config, locale, flash messages.
- SetLocale middleware with session-based locale switching.
- ARGUX hexagonal logo with targeting reticle.
