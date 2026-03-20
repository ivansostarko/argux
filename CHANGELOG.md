# Changelog

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
