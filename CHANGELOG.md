# Changelog

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
