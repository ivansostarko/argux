# Changelog

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
