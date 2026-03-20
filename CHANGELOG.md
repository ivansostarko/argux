# Changelog

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
