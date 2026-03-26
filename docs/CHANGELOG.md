# Changelog

## 0.25.19 - 2026-03-26

### Updated — Operations (/operations)
- **Responsive mobile**: Sidebar hidden ≤768px. Mobile bar (operation selector + New). Tab labels hidden (icons only). Risk gauge hidden. Grids single-column. Header extras hidden.
- **Breadcrumbs fixed**: Added `'operations': 'Operations'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search/codename, 10px phase/priority/description, 9px stats. Header 17px codename, 12px subtitle, 10px meta. Stats 20px numbers. Tabs 11px+13px icons. Overview 12px description, 12px checklist, 11px threat. Targets 12px names, 10px details. Resources 11px device/vehicle names. Teams 12px names, 10px members. Zones 12px names, 10px details. Alerts 11px type, 10px description. Timeline 12px labels, 10px dates. Briefing 12px notes+comms.
- **Skeleton loader**: 4 sidebar skeleton items, content area skeleton (4 stat blocks + description + checklist), 700ms.
- **New Operation modal**: Codename (monospace, uppercase, red, required), name (required), description textarea, phase (5 phases as icon grid), priority (4 levels), classification (5 levels: SECRET through CONFIDENTIAL), commander. Create disabled without codename + name.
- **Mock data** (`resources/js/mock/operations.ts`, 142 lines): 5 operations (HAWK Active/Critical, GLACIER Planning/High, PHOENIX Preparation/Medium, CERBERUS Debrief/High, SHADOW Closed/Critical). HAWK has 6 teams, 4 zones, 5 alert rules, 6 timeline events, 7 checklist items. phaseColors/Icons, prioColors, allPhases, tabList (8), keyboardShortcuts (5).
- **CSS** (`resources/css/pages/operations.css`, 23 lines): Skeleton, kbd, 2-panel, grid responsive, mobile bar.
- **Tests** (`resources/js/tests/Operations.test.ts`): 28 tests across 5 describe blocks — phases, priorities, tabList (8), mockOps (IDs/codenames/fields/phases/active/teams/zones/alerts/timeline/checklists/team structure/zone coords/HAWK complexity), shortcuts.
- **Keyboard shortcuts**: `N` new, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.18 - 2026-03-26

### Updated — Workflows (/workflows)
- **Responsive mobile**: Detail panel hidden ≤768px. Mobile bar (search + New). Kanban columns stack vertically. List table head hidden ≤1024px, rows flex-wrap. Template grid single-column. View labels hidden. Header stats hidden.
- **Breadcrumbs fixed**: Added `'workflows': 'Workflows'`.
- **Footer removed**.
- **Larger fonts**: Title 16px, search 12px, status badges 10px. Kanban column headers 12px, card names 12px, triggers/actions 8-9px, stats 9px. List names 12px, meta 9-10px. Template names 13px, descriptions 11px, triggers/actions 9px. Detail panel name 13px, description 10px, stats 15px, triggers 11px, actions 11px, subjects 10px, meta 10px, exec log 10px.
- **Skeleton loader**: Kanban skeleton (5 columns × 2 cards), List skeleton (6 rows), Templates skeleton (4 cards), all 700ms.
- **New Workflow modal**: Name (required), description textarea, priority (4 levels), status (5 columns), operation selector, trigger type (10 types as 5×2 icon grid), action type (8 types as 4×2 icon grid). Create disabled without name.
- **Mock data** (`resources/js/mock/workflows.ts`, 122 lines): 9 workflows (4 Active, 1 Draft, 1 Paused, 1 Completed, 1 Archived) across 3 operations. 6 templates across 5 categories. statusColors/Icons, prioColors, triggerIcons (10), actionIcons (8), kanbanCols (5), allTriggerTypes (10), allActionTypes (8), keyboardShortcuts (8).
- **CSS** (`resources/css/pages/workflows.css`, 26 lines): Skeleton, kbd, kanban/list/template layouts, responsive breakpoints.
- **Tests** (`resources/js/tests/Workflows.test.ts`): 32 tests across 9 describe blocks — statuses, priorities, triggerIcons/allTriggerTypes, actionIcons/allActionTypes, kanbanCols, mockWorkflows (IDs/fields/statuses/operations/active/exec logs/trigger types/action types), templates (IDs/fields/categories), shortcuts.
- **Keyboard shortcuts**: `1` Kanban, `2` List, `3` Templates, `N` new workflow, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.17 - 2026-03-26

### Updated — Surveillance Apps (/surveillance-apps)
- **Responsive mobile**: Sidebar hidden ≤768px. Mobile bar (search + agent selector dropdown). Header IMEI/phone hidden. Stats bar wraps. Tab labels hidden (icons only). Remote grid single-column. Screenshot grid single-column.
- **Breadcrumbs fixed**: Added `'surveillance-apps': 'Surveillance Apps'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px status/platform filters, 16px stats, 12px app names, 9px device info. Header 15px name, 10px device. Stats 15px numbers. Tabs 11px. SMS 12px body, 11px numbers, 10px flags. Calls 12px name, 10px number, 11px duration. Contacts 12px name, 10px phone. Calendar 13px title, 11px details. Notifications 11px. Network 11px. Location 13px/12px. Remote 14px heading, 12px labels, 10px desc.
- **Skeleton loader**: 5 sidebar skeleton items (avatar + text). Empty state skeleton (circle + text).
- **Mock data** (`resources/js/mock/surveillanceApps.ts`, 186 lines): 6 deployed apps (Horvat Full Monitor Active, Mendoza Stealth Suite, Hassan Comms Intercept Active, Babić GPS Tracker Active, Al-Rashid Full Monitor Offline, Petrova Comms Intercept Paused). SMS with CRITICAL flags, calls with recordings, contacts, calendar, notifications, screenshots, photos, network info. 10 remote commands. statusColors/Icons, typeIcons, tabConfig (10 tabs), keyboardShortcuts (10).
- **CSS** (`resources/css/pages/surveillance-apps.css`, 24 lines): Skeleton, kbd, 2-panel, remote grid, screenshot grid, responsive breakpoints, mobile bar.
- **Tests** (`resources/js/tests/SurveillanceApps.test.ts`): 30 tests across 7 describe blocks — statuses, typeIcons, tabConfig (10 tabs), remoteCommands (10), mockApps (IDs/fields/status/platforms/SMS data/calls/contacts/flagged SMS/recorded calls/networkInfo/stats/GPS tracker empty comms), shortcuts.
- **Keyboard shortcuts**: `1` SMS, `2` Calls, `3` Contacts, `4` Calendar, `5` Network, `0` Remote, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.16 - 2026-03-26

### Updated — Plate Recognition (/plate-recognition)
- **Responsive mobile**: Sidebar + detail hidden ≤768px. Mobile bar (search + status select). Table head hidden ≤1024px, rows flex-wrap. Reader/watchlist grids single-column. Tab labels hidden.
- **Breadcrumbs fixed**: Added `'plate-recognition': 'Plate Recognition'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px status/filters, 16px stats. Tabs 13px. Plate numbers 13px, reader names 11px, vehicle/person 10px, status 10px, confidence 9px, speed 10px. Watchlist plates 17px, details 11px. Reader names 13px, details 10px. Detail panel plate 18px/22px, vehicle/owner 10-12px, capture details 10px.
- **Skeleton loader**: 10 skeleton rows (plate + reader + vehicle + status) during 700ms.
- **Mock data** (`resources/js/mock/plateRecognition.ts`, 59 lines): 10 readers, 15 scans (trimmed from 24), statusColors/Icons, allReaders, allPersons, allOrgs, allPlates, keyboardShortcuts (7).
- **CSS** (`resources/css/pages/plate-recognition.css`, 15 lines): Skeleton, kbd, 3-panel, table grid responsive, reader/watchlist grids, mobile bar.
- **Tests** (`resources/js/tests/PlateRecognition.test.ts`): 28 tests across 5 describe blocks — statuses, readers (IDs/fields/online/offline), mockScans (IDs/fields/watchlist/unknown/partial/speed/readerIds/plates), derived lists, shortcuts.
- **Keyboard shortcuts**: `1` Scans, `2` Watchlist, `3` Readers, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.15 - 2026-03-26

### Updated — Data Sources (/data-sources)
- **Responsive mobile**: Sidebar + detail hidden ≤768px. Mobile bar (search + category select + New).
- **Breadcrumbs fixed**: Added `'data-sources': 'Data Sources'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 11-12px category/status filters, 16px stats. Source header 13px country, source name 13px, provider 10px, status 10px, protocol 9px, category badge 9px. Detail panel 13px name, 10px provider/tags, 16px health/error/records, 11px connection details/sync log, notes 11px. Modal 18px heading, 12-13px labels/inputs.
- **Skeleton loader**: 10 skeleton rows (health ring + text + tags + status) during 700ms.
- **New Data Source modal**: Full form with source name, provider, category (6 types as icon grid), protocol (9 options), schedule (8 intervals), endpoint URL, authentication (10 auth methods), country. Create disabled without name + endpoint.
- **Mock data** (`resources/js/mock/dataSources.ts`, 60 lines): 19 sources across 6 categories (Government ×5, Law Enforcement ×3, Financial ×2, OSINT ×2, Technical ×3, Commercial ×4), statusColors/Icons, catColors/Icons, allCategories, allProtocols (9), allCountries, keyboardShortcuts (6).
- **CSS** (`resources/css/pages/data-sources.css`, 20 lines): Skeleton, kbd, 3-panel, responsive.
- **Tests** (`resources/js/tests/DataSources.test.ts`): 26 tests across 6 describe blocks — statuses, categories, protocols, mockDS (IDs/fields/categories/status/countries/syncLog/tags/protocols), allCountries sorted, shortcuts.
- **Keyboard shortcuts**: `N` new source, `F` search, `R` reset, `S` sync all, `Esc` close, `Ctrl+Q` modal.

## 0.25.14 - 2026-03-26

### Updated — Social Scraper (/scraper)
- **Responsive mobile**: Sidebar + detail hidden ≤768px. Mobile bar (search + New). Tab labels hidden. Scraper grid single-column.
- **Breadcrumbs fixed**: Added `'scraper': 'Social Scraper'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px platform list, 16px stats. Tabs 13px. Post names 12px, content 12px, engagement 9px, badges 9px. Scraper cards 13px handle, 11px details, 10px links. Detail panel 12px name/content, 11px AI assessment, 14px engagement, 10px meta. Modal 18px heading, 12-13px labels/inputs.
- **Skeleton loader**: 8 skeleton post rows (icon + header + content + badges) during 700ms.
- **New Social Scraper modal**: Platform selector (10 platforms as 5×2 icon grid), profile URL, handle, interval (6 options), keywords. **Target Entity section**: toggle Person/Organization, select from mockPersons/mockOrganizations, auto-tag description. Operation selector. Create disabled without URL.
- **Mock data** (`resources/js/mock/scraper.ts`, 68 lines): 12 scrapers (trimmed from 18), 12 posts (trimmed from 17), platformConfig (10), statusColors (4), sentimentColors (4), contentIcons (8), allPlatforms, allPersonsInScrapers, allOrgsInScrapers, keyboardShortcuts (8).
- **CSS** (`resources/css/pages/scraper.css`, 22 lines): Skeleton, kbd, 3-panel, scraper grid responsive, mobile bar.
- **Tests** (`resources/js/tests/Scraper.test.ts`): 30 tests across 8 describe blocks — platformConfig (10 platforms), statusColors, sentimentColors, contentIcons, mockScrapers (IDs/fields/active/platforms/entity links), mockPosts (IDs/fields/AI-flagged/scraperIds cross-ref/media/platforms), derived lists, shortcuts.
- **Keyboard shortcuts**: `1` Feed, `2` AI Flagged, `3` Scrapers, `N` new scraper, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.13 - 2026-03-26

### Updated — Web Scraper (/web-scraper)
- **Responsive mobile**: Sidebar + detail hidden ≤768px. Mobile bar (search + New button). Tab labels hidden. Source grid single-column.
- **Breadcrumbs fixed**: Added `'web-scraper': 'Web Scraper'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 11-12px filters, 16px stats. Tabs 13px. Article titles 13px, excerpts 11px, badges 9px, entity links 9px. Source cards 13px name, 11px details, 10px URL. Detail panel 13px title, 12px excerpt, 11px AI assessment, 10px metadata.
- **Skeleton loader**: 8 skeleton article rows (icon + badge + title + excerpt + tags) during 700ms.
- **New Web Scraper modal**: Full form with source name, URL, category (8 types), schedule (9 intervals), CSS selector, URL pattern, keywords. **Target Entity section**: toggle Person/Organization, select from mockPersons/mockOrganizations, auto-tag description. Create button disabled without name+URL.
- **Mock data** (`resources/js/mock/webScraper.ts`, 87 lines): 15 sources (trimmed from 16), 12 articles (trimmed from 15/20), catConfig (8), statusCol (4), relColors (4), contentIcons (8), allCategories, allCountries, allOps, keyboardShortcuts (8).
- **CSS** (`resources/css/pages/web-scraper.css`, 22 lines): Skeleton, kbd, 3-panel, source grid responsive, mobile bar.
- **Tests** (`resources/js/tests/WebScraper.test.ts`): 32 tests across 8 describe blocks — catConfig, statusCol, relColors, contentIcons, mockSources (IDs/fields/status/categories/countries), mockArticles (IDs/fields/critical/AI-flagged/entities/sourceId cross-ref/content types), derived lists, shortcuts.
- **Keyboard shortcuts**: `1` Articles, `2` Critical Intel, `3` Sources, `N` new scraper, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.12 - 2026-03-26

### Updated — Face Recognition (/face-recognition)
- **Responsive mobile**: Sidebar + detail panel hidden ≤768px. Mobile bar (search + status select). Capture grid adapts (minmax 150px). Tab labels hidden (icons + kbd). Stat grid single-column.
- **Breadcrumbs fixed**: Added `'face-recognition': 'Face Recognition'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px status/filters, 16px stats. Tabs 13px. Capture cards: 13px name, 10-11px location/badges/confidence. Face search: 18px heading, 12-14px labels, 13px inputs/buttons. Statistics: 14px headings, 13px person names, 18px camera counts. Detail panel: 13px name, 10px fields, 16px confidence gauge.
- **Skeleton loader**: 8 skeleton capture cards (image area + text) during 700ms.
- **Mock data** (`resources/js/mock/faceRecognition.ts`, 67 lines): 15 captures (10 confirmed, 3 possible, 1 no-match, 2 pending), 9 cameras, statusColors/Icons, allCameras, allMatchedPersons, allOps, keyboardShortcuts (7).
- **CSS** (`resources/css/pages/face-recognition.css`, 22 lines): Skeleton, kbd, 3-panel layout, capture grid responsive, mobile bar, stat grid collapse.
- **Tests** (`resources/js/tests/FaceRecognition.test.ts`): 28 tests across 7 describe blocks — statusColors/Icons, cameras (IDs/fields), mockCaptures (IDs/fields/confirmed/possible/unmatched/disguises/multi-camera/multi-person), derived lists (sorted cameras, unique persons, allOps), shortcuts, ViewTab.
- **Keyboard shortcuts**: `1` Captures, `2` Face Search, `3` Statistics, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.11 - 2026-03-26

### Updated — Alert Rules (/alerts)
- **Responsive mobile**: Sidebar + detail hidden ≤768px. Mobile bar (search + New button). Tab labels hidden (icons + kbd). Stat grid stacks.
- **Breadcrumbs fixed**: Added `'alerts': 'Alert Rules'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px filters, 16px stats. Tabs 13px. Rule names 13px, severity/channel badges 9px, targets 10px, fired count 16px. Feed titles 13px, details 10px. Stats headings 14px, values 18-22px. Detail panel 13px name, 12px description, 18px stats, 11px config/channels/targets, 10px meta.
- **Skeleton loader**: 8 skeleton rows during 700ms.
- **New Alert modal**: Full form with rule name, trigger type selector (9 types as grid), severity dropdown, cooldown input, notification channels (toggle buttons), operation select, dynamic config fields per trigger type. Create button disabled without name. Opens via `N` key or `+ New Alert` button.
- **Mock data** (`resources/js/mock/alerts.ts`, 80 lines): 13 rules (trimmed), 8 events, triggerConfig (9 types), sevColors, allOps, allPersons, keyboardShortcuts (8).
- **CSS** (`resources/css/pages/alerts.css`, 25 lines): Skeleton, kbd, 3-panel layout, responsive.
- **Tests** (`resources/js/tests/Alerts.test.ts`): 24 tests: triggerConfig, sevColors, mockRules (IDs/fields/types/channels/enabled), mockAlertEvents (IDs/fields/ruleId cross-ref/unack), helpers, shortcuts.
- **Keyboard shortcuts**: `1-3` tabs, `N` new alert, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.10 - 2026-03-25

### Updated — Background Jobs (/jobs)
- **Responsive mobile**: Sidebar + detail panel hidden ≤768px. Mobile filter bar (search + priority). Worker grid single-column. Tab labels hidden (icons + kbd only).
- **Breadcrumbs fixed**: Added `'jobs': 'Background Jobs'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px type list/filters, 16px stats. Tabs 13px. Job names 13px, status 11px, details 10px, progress 10px. Workers 14px name, 11-12px details. Detail panel 13px name, 10-11px fields. Shortcuts modal 13px descriptions.
- **Skeleton loader**: 8 skeleton rows (icon + title + progress bar + meta) during 700ms.
- **Mock data separated** (`resources/js/mock/jobs.ts`): 20 jobs (trimmed from 30 for clarity), 6 workers, typeConfig (10), statusColors/Icons (6), prioColors (4), allOps, keyboardShortcuts (10).
- **CSS separated** (`resources/css/pages/jobs.css`): Skeleton, kbd, 3-panel layout, responsive ≤1024px/≤768px.
- **Tests** (`resources/js/tests/Jobs.test.ts`): 30 tests across 7 describe blocks — typeConfig, statusColors, prioColors, mockJobs (IDs, fields, types, statuses, priorities, progress, output/errors), mockWorkers (IDs, fields, cpu/mem, active→currentJob), allOps, shortcuts.
- **Keyboard shortcuts**: `1-6` tabs, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal (capture phase).

## 0.25.9 - 2026-03-25

### Updated — Reports Page (/reports)
- **Responsive mobile**: Sidebar hidden ≤768px with inline mobile filter bar. Right detail panel hidden on mobile. Tables collapse to stacked layout ≤1024px. Preview content padding reduced. Stats flex to column.
- **Breadcrumbs fixed**: Added `'reports': 'Reports'` to Breadcrumbs.tsx.
- **Footer removed**: Removed CLASSIFIED // NOFORN status bar.
- **Larger fonts**: Sidebar title 13→16px, search 10→13px, filters 7-9→10-12px, stats 13→16px. Table titles 10→13px, status 8→11px, pages 9→12px, operation 8→11px. Generate form all bumped: headings 14→18px, labels 9→12px, inputs 10→13px, sections 8→11px, button 11→14px. Preview report title 18→20px, AI summary 9→12px, sections 13→15px, stats 16→18px. Detail panel stats 12→14px, info 7→10px, sections 7→9px.
- **Skeleton loader**: 8 skeleton rows during 700ms initial load.
- **Mock data separated** (`resources/js/mock/reports.ts`): 12 reports (10 completed, 1 generating, 1 failed), statusColors/Icons, personSections (18), orgSections (11), allOps, keyboardShortcuts (6). Typed interfaces exported.
- **CSS separated** (`resources/css/pages/reports.css`): Skeleton, kbd, 3-panel layout, table grid, responsive ≤1024px (tables collapse, panels shrink), ≤768px (sidebar/detail hidden, mobile bar, preview padding).
- **Tests** (`resources/js/tests/Reports.test.ts`): 24 tests across 7 describe blocks: statusColors/Icons, sections (counts, required), mockReports (IDs unique, fields, stats, statuses, entity types), allOps, shortcuts, ViewMode.
- **Keyboard shortcuts**: `1` History view, `2` Generate view, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal (capture phase).

## 0.25.8 - 2026-03-25

### Updated — Risks Dashboard (/risks)
- **Responsive mobile**: Sidebar hidden ≤768px, replaced by inline mobile filter bar (search + risk select). KPIs stack vertically. Threat/factor grids go single-column. Tables collapse to stacked cards on ≤1024px. Tab labels hidden on mobile (icons + kbd only).
- **Breadcrumbs fixed**: Added `'risks': 'Risks Dashboard'` to Breadcrumbs.tsx.
- **Footer removed**: Removed CLASSIFIED // NOFORN status bar.
- **Larger fonts**: KPI totals 16→20px, labels 11→13px, breakdown 14→16px. Tab buttons 10→13px. Sidebar title 13→16px, search 10→13px, filters 9→12px. Persons table names 10→13px, risk labels 8→11px, scores 8→11px, factors 9→10px. Org cards 11→14px name, 8→11px details. Vehicle plates 10→13px. Matrix factors 10→13px label, 8→11px detail, score 16→18px. Threat cards name 12→14px, nationality 8→11px. Factor distribution label 9→12px, stats 8→11px. Expanded factor labels 9→12px, detail 8→11px.
- **Skeleton loader**: KPI skeleton (3 cards with breakdown placeholders) + row skeleton (5 rows with avatar + text) during 700ms initial load.
- **Mock data separated** (`resources/js/mock/risks.ts`): personRiskFactors (21 factors across 5 persons), factorCategories (8), ViewTab type, RiskFactor interface, keyboardShortcuts (9).
- **CSS separated** (`resources/css/pages/risks.css`, 44 lines): Skeleton, kbd, layout, responsive ≤1024px (tables collapse), ≤768px (sidebar hidden, mobile bar shown, grids single-column).
- **Tests** (`resources/js/tests/Risks.test.ts`): 28 tests across 6 describe blocks: factorCategories (8 cats, unique IDs, required fields), personRiskFactors (unique IDs, valid categories, person ID cross-ref, score ranges, critical count), cross-entity (persons/orgs/vehicles risk fields, riskColors coverage), keyboard shortcuts (1-5, F, R, Ctrl+Q), ViewTab type.
- **Keyboard shortcuts**: `1-5` switch tabs, `F` focus search, `R` reset filters, `Esc` close expanded/modal, `Ctrl+Q` shortcuts modal (capture phase).

## 0.25.7 - 2026-03-25

### Updated — Activity Log Page (/activity)
- **Fixed breadcrumbs**: Removed negative margins (`margin: 0 -24px -80px 0`) from `.act-page` layout. Page now uses `border-radius: 10px` container with `border: 1px solid` instead of bleeding to edges. Breadcrumbs are fully visible above the page content.
- **Removed footer**: No footer bar in the page.
- **Larger fonts**: Event title 13→14px, description 11→12px, meta links 10→11px, header count 14→16px, badges 8→10px, sidebar labels 10→12px, search input 12→13px, stat numbers 16→18px, expanded metadata 10→11px, action buttons 10→11px, empty state text 15→16px, load more button 12→13px, icon sizes 16→18px, type icons 14px in sidebar.
- **Skeleton loader**: Enhanced skeleton with badge placeholders, larger icon (38px), multi-line content blocks with realistic proportions. Shows 8 skeleton rows on initial load.
- **Responsive mobile**: Left sidebar hidden on ≤768px. Mobile filter bar appears with search input, severity dropdown, and person dropdown for quick filtering. Event meta stacks vertically on mobile. Keyboard badges hidden on ≤1024px.
- **Mock data already at** `resources/js/mock/activity.ts` — 20 events, 12 types, 5 severities, filter helpers.
- **CSS already at** `resources/css/pages/activity.css` — Rewritten with fixed layout, mobile filter bar, responsive breakpoints. 49 lines.
- **Tests already at** `resources/js/tests/Activity.test.ts` — 237 lines covering events, type configs, severity configs, filter helpers, keyboard shortcuts, cross-references.
- **Keyboard shortcuts**: F (focus search), C (toggle critical), R (reset filters), Esc (close), Ctrl+Q (shortcuts modal). All use capture phase for Ctrl+Q interception.

## 0.25.6 - 2026-03-25

### Updated — Profile Page (/profile)
- **Responsive mobile**: CSS media queries ≤768px — tab bar shows icons only (labels hidden), audit log table stacks to single column with inline labels, session cards stack vertically, theme grid shrinks to 120px min, font grid to 1 column, filter bar stacks, TOTP QR section centers vertically, backup codes grid to 2 columns. Keyboard shortcut badges hidden on ≤1024px.
- **Mock data separated** (`resources/js/mock/profile.ts`): Extracted mockUser, mockSessions (4), mockAuditLog (20), mockIpData (5 IPs), backupCodes (8), languages (5 with RTL), dateFormats (10), timezones (23), actionColors (13 action types), keyboardShortcuts (8). All fully typed with exported interfaces.
- **CSS already at** `resources/css/pages/profile.css` — appended 40 lines of responsive mobile styles and keyboard badge styles. Total 247 lines.
- **React tests** (`resources/js/tests/Profile.test.ts`): 38 test cases across 9 describe blocks — mockUser fields + initials, sessions (unique IDs, one current, IP cross-ref), audit log (chronological order, action colors, IP cross-ref), IP data (key-value match), backup codes (format, uniqueness), languages (RTL check), settings (date formats, timezones), keyboard shortcuts (1-5 + Ctrl+Q), Tab type.
- **Keyboard shortcuts**: `1-5` switch tabs (Personal/Password/Security/Settings/Audit), `Esc` close modal, `Ctrl+Q` toggle shortcuts modal. Event listener uses capture phase for Ctrl+Q interception. Tab buttons show keyboard number badges on desktop.
- **Ctrl+Q modal**: Fixed-position overlay with all 8 shortcuts listed, close ✕ button, backdrop click close, Esc close. Styled consistently with Download page modal.
- **Top loader integration**: Tab switches trigger global top loader via `useTopLoader().trigger()`.

## 0.25.5 - 2026-03-25

### Changed — Global Top Loader on Every Page Navigation
- **Automatic Inertia integration**: TopLoaderProvider now hooks into `router.on('start')` and `router.on('finish')` events. Every page navigation (sidebar clicks, `router.visit()`, form submissions, back/forward) automatically shows the top loader bar — no manual code needed per page.
- **Realistic progress behavior**: On navigation start, bar jumps to 30% then slowly crawls toward 90% (random +2-5% every 300ms). On navigation finish, bar jumps to 100% and fades out. This feels natural regardless of actual load time.
- **Disabled Inertia built-in progress**: Set `progress: false` in `createInertiaApp()` since our TopLoader replaces it entirely with a better visual (gradient bar with shimmer vs. Inertia's solid line).
- **Backward compatible**: `useTopLoader().trigger()` still works for in-page actions (tab switches, button clicks). New `start()` and `finish()` methods exposed for advanced control.
- **Transition tuning**: Initial jump (0→30%) uses fast 0.1s transition. Crawl phase uses slow 0.6s. Completion (→100%) uses 0.2s + 0.4s opacity fade.

### How it works:
```
Click sidebar link → router.on('start') fires → bar appears at 30%
                   → crawls slowly toward 90% while page loads
                   → router.on('finish') fires → bar hits 100% → fades out
```

No code changes needed in any page component. All 27+ pages get the loader automatically.

## 0.25.4 - 2026-03-25

### Updated — Download Client Page (/download)
- **Removed footer bar** (CLASSIFIED // NOFORN status bar at bottom).
- **Fixed Ctrl+Q keyboard shortcut**: Event listener now uses capture phase (`addEventListener('keydown', handler, true)`) and calls both `preventDefault()` and `stopPropagation()` to intercept Ctrl+Q before the browser can close the tab. Modal toggles correctly on repeat press.
- **Removed tabs**: Deploy and Release Notes tabs removed. Only Desktop and Mobile tabs remain.
- **Mobile tab — Android cleaned**: Removed feature labels (Biometric unlock, Push notifications, Offline mode, Background tracking). Removed Google Play, Direct APK buttons. Removed "Also via MDM" text.
- **Mobile tab — iOS cleaned**: Removed feature labels (Face ID / Touch ID, Push notifications, Offline mode, Background location). Removed App Store, TestFlight buttons. Removed "Enterprise dist." text.
- **QR Code lightbox**: Clicking any QR code opens a fullscreen lightbox with enlarged 260px QR code, platform label, and close instructions. Closes on Esc, backdrop click.
- **Removed MDM widget** from mobile tab.
- **Desktop tab — features removed**: Feature label chips removed from desktop release cards.
- **Left sidebar cleaned**: Removed Platforms/Packages/Installs stats row. Removed Shortcuts section. Removed Profile, Dashboard, Jobs links.
- **Tab type updated**: `Tab` type narrowed to `'desktop' | 'mobile'` in mock data.

## 0.25.3 - 2026-03-25

### Changed — Global Top Loader
- **New `TopLoaderProvider`** (`components/ui/TopLoader.tsx`): Global top loader bar rendered at `position: fixed; top: 0; z-index: 9999`. Any page can trigger it via `useTopLoader()` hook. Animated gradient (accent→purple→pink) with shimmer effect. Theme-aware via `accentColor` prop.
- **AppLayout integration**: `TopLoaderProvider` wraps all app content inside `ToastProvider`. Passes current theme accent color.
- **Download page refactored**: Removed per-page `topLoader` state, `topTimer` ref, `triggerLoader` callback, and `dl-loader` JSX. Now uses `const { trigger } = useTopLoader()` — 5 trigger calls converted.
- **Download CSS cleaned**: Removed `.dl-loader`, `.dl-loader-bar`, `.dl-loader-shimmer`, `@keyframes dl-shimmer` (now handled globally).
- **Map page unchanged**: Map's in-container top loader (z-index 60 inside `.tmap-container`) is a map-specific UX element for 60+ map operations — intentionally kept separate from the global page loader.

### Usage for any page:
```tsx
import { useTopLoader } from '@/components/ui/TopLoader';
const { trigger } = useTopLoader();
trigger(); // fires the global loader animation
```

## 0.25.2 - 2026-03-25

### Updated — Download Client Page (/download)
- **Responsive mobile design**: 3 breakpoints — desktop (>1024px, 3-panel), tablet (≤1024px, hides left sidebar), mobile (≤768px, stacked single column). Cards, banners, system requirements table, and QR sections all reflow properly.
- **Larger fonts**: Headings bumped to 14-18px (from 7-13px), body text 10-13px (from 7-10px), sidebar labels 10-11px, tab labels 13px, detail panel 10px. All text now legible on high-DPI and mobile screens.
- **Top loader bar**: Animated gradient bar (accent→purple) with shimmer effect. Triggers on tab switch, download click, and keyboard shortcut actions. 3-phase animation: 30%→70%→100%→fade.
- **Skeleton loader**: Pulsing skeleton cards during 800ms initial load. Matches card layout with avatar, title, tags, and button placeholders.
- **Keyboard shortcuts**: `1`-`4` switch tabs, `D` triggers recommended download, `Esc` closes detail panel, `?` toggles shortcuts overlay dialog. Shortcuts shown in sidebar and as `<kbd>` badges on tab buttons.
- **Separated CSS** (`download.css`): All custom styles extracted — loader animations, skeleton pulse, keyboard hint badges, responsive breakpoints, card hover effects, download button animations. 65 lines.
- **Separated mock data** (`mockData.ts`): All constants, types, releases array, release notes, deployment types, system requirements, platform colors, and detectCurrentPlatform() extracted. 80 lines. Fully typed with exported interfaces.
- **React tests** (`Download.test.ts`): 38 test cases across 9 describe blocks — mock data integrity (constants, releases, release notes, deployment types, system requirements, platform colors), platform detection, data consistency cross-references, keyboard shortcut mapping. Run: `npx vitest run resources/js/pages/Download/Download.test.ts`.
- **Breadcrumbs fixed**: Added `'download': 'Download Client'` to Breadcrumbs route labels. Removed negative top margin from page layout so breadcrumbs are visible above page content.
- **Notification dropdown** max-width capped at `calc(100vw - 20px)` to prevent overflow on mobile.

### Files
- `resources/js/pages/Download/Index.tsx` — refactored page (307 lines, down from 372)
- `resources/js/pages/Download/mockData.ts` — NEW: extracted mock data + types
- `resources/js/pages/Download/download.css` — NEW: extracted custom styles
- `resources/js/pages/Download/Download.test.ts` — NEW: 38 test cases
- `resources/js/components/layout/Breadcrumbs.tsx` — added download label

## 0.25.1 - 2026-03-25

### Fixed — Responsive App Header & Sidebar
- **Single hamburger menu**: Removed duplicate hamburger buttons. On mobile (≤768px), only one hamburger icon appears in the app header. On desktop (>768px), the hamburger is hidden and the sidebar has its own collapse toggle.
- **Profile dropdown responsive**: On desktop shows full button with avatar + "J. Mitchell" + "OPERATOR" text. On mobile shows only the round avatar icon (JM). Click opens the same dropdown menu on both.
- **Clock dropdown responsive**: On desktop shows full button with city name + time. On mobile shows only the clock icon. Click opens the same timezone dropdown on both.
- **Sidebar hidden on mobile by default**: The left sidebar is completely hidden on mobile. It only appears when clicking the hamburger icon in the header. Shows as a slide-over panel with backdrop overlay and close (✕) button.
- **Desktop sidebar unchanged**: Collapse/expand toggle still works as before on desktop. Collapsed mode shows icon-only navigation.
- **Sidebar rendered once per context**: Desktop sidebar and mobile sidebar are separate DOM elements controlled by CSS media queries. No duplicate rendering. Mobile sidebar always renders expanded (260px) with a close button instead of collapse toggle.

## 0.25.0 - 2026-03-25

### Updated — Download Client Page (/download)
- **Complete rebuild** of the Download Client page with 4 tabs, deployment modes, MDM support, release notes, and enhanced QR codes.
- **4 view tabs**: Desktop (7 packages with auto-detect banner), Mobile (2 packages with QR codes + store badges + MDM), Deployment (3 modes + system requirements + integrity verification), Release Notes (version history with timeline).
- **Deployment tab**: 3 deployment modes — Standalone (single workstation), Managed Server (enterprise multi-operator), Air-Gapped (classified, offline). System requirements matrix for all 5 platforms. SHA-256 verification commands (PowerShell + sha256sum).
- **Mobile MDM support**: Microsoft Intune, Jamf Pro, VMware Workspace ONE, MobileIron enterprise deployment.
- **Store badges**: Google Play + Direct APK (Android), App Store + TestFlight (iOS). Enterprise distribution notes.
- **Release Notes tab**: Version timeline v0.24.2→v0.21.0 with dates and summaries. Latest release highlighted with glow dot + LATEST badge.
- **Header profile dropdown**: "Download Client" item with download icon between "My Profile" and "Settings".

## 0.24.2 - 2026-03-25

### Added — Tauri v2 Multi-Platform Native App
- **Tauri v2 integration** for building ARGUX as a native application on 5 platforms: Windows (.msi/.exe), Linux (.deb/.rpm/.AppImage), macOS (.dmg/.app), Android (.apk/.aab), iOS (.ipa).
- **`src-tauri/tauri.conf.json`** — Main configuration: app window (1440×900, min 1024×700), CSP policy for MapLibre + tile providers, bundle targets for all platforms, NSIS installer with English/Croatian, macOS minimum 10.15, Linux deb/rpm/AppImage, iOS/Android settings.
- **`src-tauri/Cargo.toml`** — Rust dependencies: tauri v2 core, 8 cross-platform plugins (shell, notification, clipboard, dialog, process, os, http, opener), 4 desktop-only plugins (single-instance, window-state, updater, global-shortcut). Release profile: LTO, strip symbols, panic=abort.
- **`src-tauri/src/lib.rs`** — Shared app logic: 4 Tauri commands (get_platform_info, set_window_title, toggle_fullscreen, minimize_to_tray), platform-conditional plugin registration, macOS title bar overlay, startup banner, minimum window size enforcement.
- **`src-tauri/src/main.rs`** — Desktop entry point with Windows subsystem flag.
- **`src-tauri/capabilities/default.json`** — Cross-platform permissions: window management, shell open, notifications, clipboard, dialogs, process control, OS info, HTTP, opener.
- **`src-tauri/capabilities/desktop.json`** — Desktop-only permissions: global shortcuts, updater, window state persistence.
- **`src-tauri/icons/icon.svg`** — ARGUX branded app icon with targeting reticle + gradient.
- **`resources/js/lib/tauri.ts`** — Frontend Tauri bridge with graceful browser fallback: platform detection (isTauri/isBrowser/isDesktop/isMobile), tauriInvoke() generic command caller, sendNotification() (falls back to Web Notification API), copyToClipboard() (falls back to navigator.clipboard), openExternal() (system browser in Tauri, new tab in browser), confirmDialog() (native dialog in Tauri, window.confirm in browser), saveFileDialog(), tauriFetch() (bypasses CORS in Tauri), getPlatformInfo().
- **`resources/js/types/tauri.d.ts`** — TypeScript declarations for TAURI_ENV_* variables and window.__TAURI_INTERNALS__.
- **`vite.config.ts`** — Tauri-aware: TAURI_ENV_PLATFORM detection, clearScreen:false, envPrefix includes TAURI_ENV_, modern build targets (es2021/chrome100/safari15), vendor-tauri chunk splitting, mobile dev server host 0.0.0.0, conditional HMR for mobile.
- **`package.json`** — 12 npm scripts: tauri, tauri:dev, tauri:build, platform-specific builds (windows/linux/macos/macos-arm/macos-intel), mobile init/dev/build (android/ios), icon generation. Dependencies: @tauri-apps/api v2, 7 plugin packages. DevDependencies: @tauri-apps/cli v2.
- **`TAURI-SETUP.md`** — Comprehensive build guide: prerequisites per platform, step-by-step build commands, development mode instructions, icon generation, architecture diagram, plugin matrix, CI/CD targets, troubleshooting table.

### Build Commands
```
npm run tauri:dev              # Desktop development
npm run tauri:build            # Build for current platform
npm run tauri:build:windows    # Windows .msi + .exe
npm run tauri:build:linux      # Linux .deb + .rpm + .AppImage
npm run tauri:build:macos      # macOS universal .dmg
npm run tauri:android:dev      # Android development
npm run tauri:android:build    # Android .apk + .aab
npm run tauri:ios:dev          # iOS simulator
npm run tauri:ios:build        # iOS .ipa
```

## 0.24.1 - 2026-03-25

### Added — React Developer Tools Integration
- **React StrictMode** enabled in development builds. Wraps the entire app in `<StrictMode>` to enable: double-rendering checks for side effects, deprecated API warnings, better React DevTools component highlighting and state inspection.
- **Production bypasses StrictMode** — no performance overhead in `npm run build` output.
- **Console DevTools banner** — development mode prints styled ARGUX DevTools message with link to React Developer Tools installation page.
- **Source maps enabled** — `css.devSourcemap: true` for CSS source mapping, `build.sourcemap: 'hidden'` for production profiling. In React DevTools Components tab, clicking `<>` on any component jumps directly to its source file.
- **Fast Refresh preserved** — `@vitejs/plugin-react` fast refresh keeps component state during hot edits, visible in DevTools as preserved state tree.
- **Vite config upgraded** to function mode `defineConfig(({ mode }) => ...)` for environment-aware source map and plugin configuration.
- **Server source maps** — `server.sourcemapIgnoreList: false` ensures all source maps are served to browser DevTools.

### How to use React DevTools with ARGUX:
1. Install the browser extension: [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
2. Run `npm run dev` (development mode enables all DevTools features)
3. Open browser DevTools → "Components" tab to inspect React component tree
4. Open browser DevTools → "Profiler" tab to record and analyze render performance
5. Click any component → see props, state, hooks, and source location
6. For production profiling: `npm run build` generates hidden source maps for the Profiler

## 0.24.0 - 2026-03-25

### Added — Surveillance Apps Page (/apps)
- **Mobile Agent Control Center**: Remote device monitoring for deployed surveillance agents on iOS/Android. 6 deployed agents, 4 agent types, 10 data tabs including SMS, calls, contacts, calendar, notifications, network, location, screenshots, photos, and remote control.
- **4 agent types**: Full Monitor (📱 complete device access), GPS Tracker (📍 location only), Comms Intercept (📡 SMS + calls), Stealth Suite (🕵️ undetectable full monitor).
- **6 deployed agents**: Horvat (Samsung Galaxy S24 Ultra, Full Monitor, Active — 342 SMS, 189 calls, 247 contacts, 2.4GB), Mendoza (Google Pixel 8 Pro, Stealth Suite, Stealth — 567 SMS, VPN detected, new SIM), Hassan (iPhone 15 Pro Max, Comms Intercept, Active — dual SIM, 34% battery), Babić (Samsung Galaxy A54, GPS Tracker, Active — location only, 89% battery), Al-Rashid (iPhone 16 Pro Max, Full Monitor, Offline 16h — Dubai, GLACIER), Petrova (Xiaomi 14 Ultra, Comms Intercept, Paused — Moscow, legal review).
- **10 data tabs**: SMS (flagged messages with AI cross-reference intelligence), Calls (log with REC badge for recorded calls, missed indicators), Contacts (name, phone, email, label, starred), Calendar (events with CRITICAL flags for operational dates), Notifications (app name, title, body from Telegram/Signal/Gmail/WhatsApp/Banking), Network (carrier, network type, cell ID, IP, WiFi SSID/BSSID, DNS, VPN detection, Bluetooth, NFC, IMSI), Location (current GPS + coordinates + map link), Screenshots (grid with app name + timestamp), Photos (gallery with filename, size, GPS location), Remote Control (10 commands).
- **SMS intelligence**: Horvat 6 messages with 3 CRITICAL flagged: "pristanište 7, 22h" (dock 7 Thursday, cross-ref audio + Telegram), "Ruta B bez zaustavljanja" (Route B, cross-ref sp-13), Colombian cross-border "paketi stigli" (packages arrived, 22:45 night). Mendoza 3 messages: Route B confirmation, Hassan storage unit, Spanish Bogotá shipment. Hassan 2 messages: storage unit inbound, "package logistics" to Al-Rashid chain. Al-Rashid 1 inbound from Hassan confirming full command chain.
- **Call log**: Recorded calls marked with 🎙️ REC badge. Horvat→Babić burner (4:12), Horvat→Mendoza Colombia (8:34 night), Al-Rashid→Horvat (12:05). Missed calls shown in red.
- **Contacts analysis**: Horvat 8 contacts including Ivan B. (Babić burner), Carlos M. (Colombia), Ahmed R. (Saudi), Omar H. (Egypt) — all starred. Mendoza contacts use codenames: Hawk, Falcon, Shadow, Bogotá HQ. Hassan contacts: Lobo, The Boss.
- **Calendar intel**: CRITICAL — Horvat "Port Terminal — Dock 7" 2026-03-27 22:00 matches all operational intelligence. Mendoza "Dock 7 — Final" 21:30 (arrive 30min early). Hassan "Storage B — Inspection" 16:00 Thursday. Horvat "Flight to Riyadh" 2026-03-28.
- **Remote control panel**: 10 commands (Force GPS, Front Camera, Rear Camera, Microphone 60s, Screenshot, Network Scan, Clipboard, Silent Ping, Lock Device, Force Data Upload). Commands disabled for Offline/Paused devices with warning banner.
- **Device header**: Avatar with status border, person name, status badge, device model, OS version, agent version, IMEI, MAC address, phone number. Stats bar: SMS count, calls, contacts, photos, screenshots, battery gauge, signal gauge.
- **Left sidebar**: App list with avatar, person name, device model, status icon, battery/signal/SMS/calls quick stats. Filters: Status (Active/Stealth/Paused/Offline), Platform (Android/iOS), search. Stats: deployed, live, down.
- **Cross-linked**: Persons → /persons/:id (Horvat #1, Mendoza #9, Hassan #7, Babić #12, Al-Rashid #3, Petrova #4), Map → /map (GPS location), Devices → /devices, Alerts → /alerts, Storage → /storage. SMS cross-references: audio intercept "delivery dock 7" (ev-07), Telegram "dock 7" (sp-04), "Route B" (sp-13), FlightRadar Al-Rashid jet (wa-13), Hassan storage pattern. Full communication chain visible: Horvat↔Mendoza↔Hassan↔Al-Rashid.

## 0.23.0 - 2026-03-24

### Added — Background Jobs Page (/jobs)
- **Queue & Worker Dashboard**: Full job queue management with 30 mock jobs across 10 types, 6 workers, animated progress bars, and detailed job inspection.
- **6 view tabs**: All Jobs (30), Running (4 with animated progress), Queued (5), Completed (15), Failed (3 failed + 1 cancelled + 2 retrying), Workers (6 worker cards with CPU/memory gauges).
- **10 job types**: Data Sync (🔄), AI Inference (🤖), Report Generation (📊), Bulk Export (📦), Media Processing (🎬), Face Search (🧑), Scraper Run (📱), System Backup (💾), LPR Batch (🚗), Workflow Execution (⚡). Each with icon and color.
- **30 mock jobs** linked to real features: INTERPOL sync (67% running), Horvat movement AI analysis (LLaMA 3.1, 43%), port camera video transcription (Faster-Whisper, 28%), Mendoza face search (InsightFace GPU, 55%), HAWK Weekly Report #5 (queued), Telegram batch scraper (queued), LPR batch A1 Highway (queued), OpenCorporates shell detection (queued), dark web crawl (queued), morning briefing #24 (completed 12.4s), co-location evidence #42 (workflow 1.5s), EU sanctions sync (4.2s), vehicle HAK sync, anomaly detection batch (XGBoost 47s), full backup (42m 2.4TB), social scraper batch (45s), news monitor (8s), port intrusion workflow (2.3s), LPR auto-track workflow (0.8s), audio keyword scan (Faster-Whisper 4.8s), PEP Dow Jones screening, Rashid shell report (22s), activity CSV export, Arabic translation (NLLB-200 13s), HROK credit bureau (failed, connection refused), dark web marketplace (failed, Tor circuit), Li Wei report (failed, insufficient data), bulk photo export (cancelled), Cairo camera reconnect (retrying), court records e-Spis (retrying partial timeout).
- **6 workers**: Alpha (active, CPU 72%), Bravo (active, 45%), Charlie (active, 88%), GPU Delta (active, 34% CPU / 92% memory), Echo (idle), Foxtrot (offline). Cards with status dot, current job, jobs processed count, uptime, CPU/memory progress bars.
- **Animated progress**: Running jobs show progress bars that animate every 3 seconds (+2% tick). Running status has pulsing dot indicator.
- **Left sidebar 5 filters**: Search (job name, entity, tags), Job Type (10 types with counts), Priority (Critical/High/Normal/Low), Operation (HAWK/GLACIER/PHOENIX), stats bar (running/queued/done/failed).
- **Job detail panel**: Type icon + name + label, status/priority/operation badges, animated progress bar with ETA (for running), Input Parameters section (model name, window, subjects, API details), Output section (results, record counts, file paths), Error Log section (red highlight with monospace error text, retry count), metadata (worker, queue, initiator, start/complete/duration, entity), tags, action buttons (Retry for failed, Cancel for running, View Entity link, Activity log).
- **Cross-linked**: Persons → /persons/:id (Horvat, Mendoza, Hassan, Li Wei), Organizations → /organizations/:id (Rashid Holdings), Devices → /devices/:id (Port Terminal Cam, Al-Rashid Residence Mic, Cairo Office), Data Sources → /data-sources (INTERPOL, EU Sanctions, HAK, OpenCorporates, HROK, e-Spis, PEP Dow Jones), Workflows → /workflows (Nightly Sweep, Co-location Evidence, Port Intrusion, LPR Auto-Track), Reports → /reports (briefing #24, weekly #5, shell company), Activity → /activity, Social Scraper → /scraper, Face Recognition → /face-recognition.

## 0.22.1 - 2026-03-24

### Fixed — Map Page WebGL Error Handling
- **Fixed uncaught WebGL context creation error** that crashed the page when GPU acceleration is disabled, browser is sandboxed, or hardware doesn't support WebGL.
- Added **global error handlers** (`window.addEventListener('error')` + `webglcontextcreationerror`) that catch WebGL failures that escape the MapLibre try/catch initialization block.
- Added **WebGL Fallback UI** when WebGL is unavailable: error icon, explanation message, Retry button (page reload), Dashboard link, troubleshooting steps (hardware acceleration, chrome://gpu, driver updates, browser alternatives), and quick navigation links to /activity, /persons, /operations, /vision.
- **Conditional map container rendering**: the `<div ref={mapContainer}>` is no longer rendered when `webglFailed === true`, preventing any secondary WebGL initialization attempts.
- **Minimap gated** on `!webglFailed` to prevent the minimap's separate MapLibre instance from also crashing.
- **Global handler cleanup** added to useEffect return to properly remove event listeners on unmount.

## 0.22.0 - 2026-03-24

### Added — Web Scraper Page (/web-scraper)
- **OSINT Intelligence Crawler**: 16 web sources across 8 categories, 15 scraped articles with AI relevance scoring, entity tagging, and cross-reference intelligence.
- **8 source categories**: News Portal (📰, 6 sources), Court Records (⚖️, 1), Sanctions List (🚫, 2), Dark Web (🕸️, 2), Government Gazette (🏛️, 1), Corporate Registry (🏢, 1), Maritime & Aviation (🚢, 2), Academic & Research (🎓, 1).
- **3 view tabs**: All Articles (filterable article feed with relevance scoring), Critical Intel (7 critical-relevance articles), Sources (16 source cards with health/status/keywords).
- **16 web sources**: Jutarnji List, Večernji List (Croatian news), Reuters World, Al Jazeera ME, OCCRP Investigations (international), e-Spis Court Registry (Croatian courts), INTERPOL Red Notices, EU Sanctions Map, Dark Web Forum Monitor, Dark Web Marketplace (error), Narodne Novine (Croatian gazette), Saudi Gazette, OpenCorporates Filings, MarineTraffic Incidents, FlightRadar24 Alerts, Jane's Defence Weekly (paused). 7 countries: Croatia, International, Qatar, EU, UK, Greece, Sweden, Saudi Arabia.
- **15 mock articles** with intelligence-grade content: Zagreb port security alert (CRITICAL, coincides with HAWK window), EU arms export controls (Balkans trafficking), Saudi investment Cyprus expansion (Rashid Holdings entity match), Alpha Security court proceeding (export violations, Horvat+Babić named), EU sanctions update (MENA arms), dark web Adriatic delivery listing (CRITICAL, Thursday dock 7 match), Rashid Mediterranean shell company filing (Cyprus nominee, layering pattern), unregistered AIS-dark vessel approaching Zagreb port (CRITICAL), OCCRP Adriatic arms pipeline investigation (CRITICAL, parallel intel), Croatian defense export regulation, Alpha Security €15M partnership, Rashid Holdings Q1 results (maritime logistics), Al-Rashid private jet Riyadh→Zagreb TOMORROW (CRITICAL, within 72h window), dark web "Adriatic route" encrypted thread (CRITICAL, triple convergence), Savska safe house incident (police, cross-ref unknown LPR).
- **4 relevance levels**: Critical (7 articles), High (5), Medium (3), Low (0) — color-coded with AI reasoning.
- **AI intelligence flags**: 13/15 articles flagged with detailed cross-reference reasoning connecting to: OP HAWK operational window, intercepted audio ("dock 7"), social scraper posts, LPR captures, IMSI data, GLACIER AML analysis, OpenCorporates shell companies, camera events, safe house surveillance.
- **Left sidebar 8 filters**: Search (title, excerpt, tags), Source Category (8 with counts), Relevance (Critical/High/Medium/Low), Country (7), Person (Horvat, Al-Rashid), Organization (Alpha Security, Rashid Holdings), AI Flagged toggle. Stats bar: sources, live, articles, critical.
- **Article detail panel**: Source icon + name + category, title, relevance + content type badges, full excerpt, AI Intelligence Assessment (red highlighted section with detailed cross-reference reasoning), tagged entities (persons → /persons/:id, organizations → /organizations/:id), metadata (source, category, country, language, published, scraped, media), tags with CRITICAL/HAWK/GLACIER highlighting, action buttons (Activity, Operations, Storage).
- **Source cards**: Category icon, name, country flag + language, status + health, article count + new, schedule, keyword chips, URL.
- **Cross-linked**: Persons → /persons/:id (Horvat, Al-Rashid, Babić), Organizations → /organizations/:id (Alpha Security, Rashid Holdings), Social Scraper → /scraper (cross-ref Falcon Trading Cyprus post, Mendoza dock 7 message), Data Sources → /data-sources (News Monitor, Dark Web Monitor, OpenCorporates, EU Sanctions), Activity → /activity (events cross-referenced), Operations → /operations (HAWK/GLACIER), Storage → /storage, LPR → /plate-recognition (KA-9921-CC cross-ref), Camera events (ev-21 unregistered vessel).

## 0.21.0 - 2026-03-24

### Added — Social Media Scraper Page (/scraper)
- **Social Media OSINT Collection Engine**: 10 platforms, 18 active scrapers, 17 scraped posts with AI sentiment analysis and intelligence flagging. Full content feed with engagement metrics.
- **10 platforms supported**: Facebook (📘), X/Twitter (𝕏), Instagram (📸), TikTok (🎵), YouTube (▶️), LinkedIn (💼), Telegram (✈️), Snapchat (👻), Reddit (🔴), WeChat (💬). Each with branded icon and color.
- **3 view tabs**: Content Feed (filterable post stream with engagement), AI Flagged (posts flagged by NLP sentiment + keyword analysis), Scrapers (18 scraper configuration cards with status/interval/keywords).
- **18 mock scrapers** across 8 persons and 4 organizations: Horvat (Facebook, LinkedIn, Reddit), Kovačević (Instagram), Petrova (TikTok), Mendoza (X, Telegram, Snapchat), Tanaka (YouTube), Babić (Instagram), Hassan (X with error, Telegram), Li Wei (WeChat queued), O'Brien (LinkedIn paused), Alpha Security (LinkedIn, X), Meridian (Facebook paused), Falcon Trading (Facebook, Telegram). Operations: HAWK, PHOENIX.
- **17 mock scraped posts** with rich content: Facebook posts (Horvat port photo GPS-flagged), X posts (Mendoza night activity, SIM swap reference, port retweet), Telegram messages (CRITICAL: "dock 7" keyword match cross-ref with audio, "Route B" evasive language, Hassan storage meeting), Instagram (Kovačević reels, Babić vehicle plate visible), TikTok (Petrova office tour), LinkedIn (Alpha Security defense partnership, Horvat career milestone), Facebook org (Falcon Trading Cyprus expansion shell company flag).
- **AI sentiment analysis**: 4 levels (positive/negative/neutral/flagged) with color coding. 10 posts AI-flagged with detailed intelligence reasoning: port area GPS match, counter-surveillance keywords, audio cross-reference (dock 7), vehicle plate in photo, SIM swap confirmation, storage pattern match, shell company jurisdiction alert.
- **8 content types**: Post (📝), Photo (📷), Video (🎥), Story (⏱️), Reel (🎬), Comment (💬), Share (🔄), Article (📰).
- **Left sidebar 7 filters**: Search (content, person, tags), Platform (10 with post counts), Person (dropdown: Horvat, Kovačević, Petrova, Mendoza, Tanaka, Babić, Hassan), Organization (dropdown: Alpha Security, Mendoza I/E, Falcon Trading, Dragon Tech, Meridian), AI Sentiment (All/Flagged/Negative/Neutral/Positive), Content Type (8 types). Stats bar: scrapers, live, posts, flagged counts.
- **Scraper cards**: Platform icon+color, profile handle, person/org link, status badge (Active/Paused/Error/Queued), total posts, new posts, scrape interval, keyword chips, operation code, last run time, entity links to /persons/:id and /organizations/:id.
- **Post detail panel**: Platform icon + person/org name + handle, full content text, AI intelligence flag section (red highlight with detailed reasoning for flagged posts), engagement metrics (likes/shares/comments/views), metadata (platform, content type, sentiment, timestamp, profile), tags with CRITICAL highlighting, action buttons (Profile, Organization, Activity).
- **Cross-linked**: Persons → /persons/:id (Horvat, Kovačević, Petrova, Mendoza, Tanaka, Babić, Hassan, O'Brien, Li Wei), Organizations → /organizations/:id (Alpha Security, Mendoza I/E, Falcon Trading, Dragon Tech, Meridian), Activity → /activity, Storage → /storage (social media archives). AI flags cross-reference: audio keyword events, IMSI catcher data, GPS tracking patterns, LPR captures, AML financial data.

## 0.20.0 - 2026-03-24

### Added — Face Recognition Page (/face-recognition)
- **InsightFace / ArcFace Intelligence Hub**: Face capture gallery, database search with upload, per-person/camera statistics. 20 mock captures across 7 persons and 11 cameras.
- **3 view tabs**: All Captures (responsive grid of face capture cards), Face Search (upload photo + select known person → simulate GPU-accelerated database scan with results), Statistics (captures per person with confidence dots, captures per camera with device links).
- **20 mock face captures**: 5 Horvat (94% street cam with baseball cap, 91% port with sunglasses, 97% HQ, 96% Frankopanska, 73% Split hotel), 3 Babić (87% Maksimir alone, 92% HQ with Horvat, 78% diplomatic quarter with hat), 1 Kovačević (91% HQ first-in-2-weeks), 2 Al-Rashid (89% airport with bodyguards, 85% Dubai parking), 2 Hassan (82% port, 68% Dubai with keffiyeh), 2 Mendoza (76% night hood+mask, 88% near Savska), 1 Petrova (90% Moscow meeting), 3 unknown/no-match, 2 pending review.
- **Face Search mode**: Drag-and-drop photo upload zone (JPEG/PNG, min 100×100), OR select known person from database dropdown (all 15 persons with risk level). Simulated InsightFace GPU search with progress bar (ONNX Runtime, NVIDIA A100), results shown as confidence cards with camera, location, timestamp, disguise info. Click result → jump to captures tab with detail panel.
- **Capture card grid**: Face photo (avatar or ❓ for unknown), confidence badge (green >85%, amber >70%, red <70%), status overlay (Confirmed/Possible/No Match/Pending), camera label, person name, location, disguise indicator (🎭), operation tag, time ago.
- **Left sidebar 6 filters**: Search (person, camera, location, tags), Match Status (Confirmed 13, Possible 4, No Match 3, Pending 2), Camera Source (11 cameras), Matched Person (7 persons), Operation (HAWK/GLACIER), Min Confidence slider (0-95%).
- **Capture detail panel**: Avatar with status border, confidence gauge (conic-gradient with percentage), capture metadata (camera, location, disguise type, companions, timestamp, quality score, coordinates, operation), tags, action buttons (Profile → /persons/:id, Camera → /devices/:id, Map → /map).
- **Statistics tab**: Per-person breakdown (avatar, name, capture count, avg confidence, individual confidence dots color-coded, profile link). Per-camera breakdown (camera name, location, capture count, device link to /devices/:id).
- **Cross-linked**: Persons → /persons/:id (Horvat #1, Babić #12, Kovačević #2, Al-Rashid #3, Hassan #7, Mendoza #9, Petrova #4), Cameras/Devices → /devices/:id (11 camera devices from mock data), Map → /map, Vision → /vision, Alerts → /alerts (face_match rules ar-03, ar-14), Activity → /activity (face events ev-02, ev-12, ev-24, ev-35), Workflows → /workflows (Face Recognition template), Data Sources → InsightFace/ArcFace ONNX engine.

## 0.19.0 - 2026-03-24

### Added — Plate Recognition Page (/plate-recognition)
- **LPR Intelligence Hub**: Full license plate recognition dashboard with YOLOv8 detection + PaddleOCR v3. 24 mock scans, 10 LPR readers, watchlist management, per-entity filtering.
- **3 view tabs**: All Scans (filterable table of 24 captures), Watchlist (6 tracked plates as cards with risk + vehicle + capture count), Readers (10 LPR reader cards with status, location, camera link, capture count).
- **24 mock LPR scans** across 15 unique plates: 13 watchlist hits (ZG-1234-AB ×5, ZG-5678-CD ×3, SA-9012-RH ×2, SA-3456-RH, BOG-789-ME, EG-4567-FT), 6 matched (registered vehicles), 3 unknown (KA-9921-CC rental near safe house, KA-5511-BB night), 2 partial reads (obscured plates). Linked to 8 persons, 6 organizations, 13 vehicles, 7 cameras.
- **10 LPR readers**: 8 fixed (Vukovarska East, Airport Cargo Gate, A1 Highway Km 78, Savska Safe House, Port Terminal Entry, Ilica/Frankopanska, Rashid Tower Parking Dubai, Split Coastal Road) + 2 mobile units. Status: 8 online, 1 maintenance, 1 offline. Total captures: 106K+.
- **Left sidebar 7 filter dimensions**: Search (plate, person, location, vehicle), Scan Status (Watchlist Hit/Matched/Unknown/Partial Read with counts), LPR Reader (dropdown 10 readers), Person (dropdown: Horvat, Babić, Al-Rashid, Mendoza, Hassan, Müller, Petrova, Al-Zahra), Organization (dropdown: Alpha Security, Rashid Holdings, Falcon Trading, Mendoza I/E, Meridian, Petrova, Gulf Maritime), Plate Number (dropdown all 15 unique plates). Stats bar: total scans, watchlist hits, unknown, readers online.
- **Scan table columns**: Plate (monospace, red if watchlist), Reader/Location, Vehicle (make/model + person link), Status badge, Confidence bar + %, Speed (red if >100km/h), Time (relative + absolute).
- **Watchlist tab**: 6 tracked plates as cards with oversized monospace plate display, risk badge from linked vehicle, vehicle description, person link, capture count, last seen timestamp. Click to filter scans.
- **Readers tab**: 10 reader cards with online/offline/maintenance status dot, location, linked camera (link to /devices/:id), capture count. Click to filter scans by reader.
- **Scan detail panel**: Large plate display on dark background with confidence + camera overlay, Vehicle section (make/model/color + link to /vehicles/:id), Person section (owner name link to /persons/:id + org link to /organizations/:id), Capture Details (reader, location, camera, direction, speed, lane, confidence %, timestamp, coordinates), tags, action buttons (Map, Alert Rules, Camera device link).
- **Cross-linked**: Persons → /persons/:id (Horvat, Babić, Al-Rashid, Mendoza, Hassan, Müller, Petrova, Al-Zahra), Vehicles → /vehicles/:id (real mockVehicles plates), Organizations → /organizations/:id, Devices/Cameras → /devices/:id (cameras #3, #8, #11, #14), Map → /map, Alerts → /alerts (LPR watchlist rules), Activity → /activity (LPR events match). Same plates referenced in Activity Log, Alerts, Workflows, Map live feed.

## 0.18.0 - 2026-03-24

### Added — Reports Page (/reports)
- **Intelligence Report Center**: Full report generation, management, preview, and print/PDF export for persons and organizations.
- **3 views**: Report History (searchable/filterable table of 12 mock reports), Generate New (entity/date/sections selector), Report Preview (full rendered report with print/PDF).
- **Report Generator**: Entity type toggle (Person with 18 sections / Organization with 11 sections), entity dropdown populated from mock data with risk level, date range picker (from/to), section checklist with Select All/None toggle. Generate button with section count.
- **18 person report sections**: AI Summary, Profile & Identity, Contact Information, Known Addresses, Employment History, Education, Vehicles, Known Locations, Connections Graph, Events Timeline, LPR Activity, Face Recognition Matches, Deployed Surveillance, Audio Intercepts, Social Media, Records & Evidence, Risk Assessment, Notes & Annotations.
- **11 organization sections**: AI Summary, Company Profile, Linked Persons, Financial Analysis, Connections Graph, Data Sources, Vehicles, Events Timeline, Records & Evidence, Risk Assessment, Notes.
- **12 mock reports**: Subject profiles (Horvat 34p, Mendoza 22p, Babić 18p, Hassan 15p, Al-Rashid 26p), weekly intelligence (Horvat Week 4 28p), counter-surveillance assessment (Mendoza 12p), organization reports (Alpha Security 42p, Rashid Holdings 38p, Falcon Trading 16p), daily briefing (generating), Li Wei observation (failed). Across HAWK, GLACIER, PHOENIX operations.
- **Report preview**: Full rendered report with classification header, stats cards (events/alerts/connections/LPR/face/files), AI Summary (generated text from Ollama LLaMA 3.1 with RAG), Profile & Identity grid, Company Profile grid, Vehicles table from real mock data, Connections Graph placeholder, Events Timeline placeholder, Risk Assessment with risk gauge, remaining sections as data-linked placeholders, classified footer.
- **Print / PDF export**: Opens print dialog via window.open with styled HTML document. Classification headers and footers included.
- **Report detail panel**: Status badge, classification, stats grid (6 metrics), full metadata (entity, risk, period, generated by/at, pages, size, operation), sections list as chips, entity profile link, View Report / Print / Retry / Storage buttons.
- **Left sidebar filters**: Entity Type (All/Person/Org), Operation (HAWK/GLACIER/PHOENIX), Status (Completed/Generating/Failed), search. Stats bar (total/done/person/org counts).
- **Cross-linked**: Entity profiles (/persons/:id, /organizations/:id), operations (/operations), activity log (/activity), risks (/risks), storage (/storage), workflows (nightly sweep generates reports), real vehicle data from mock entities.

## 0.17.0 - 2026-03-24

### Added — Storage Browser Page (/storage)
- **MinIO File Manager**: Split-panel file browser with entity folder tree (left), sortable file list (center), and file detail/preview panel (right).
- **Folder tree structure**: Two root nodes (Persons/Organizations) with expandable entity folders. Each entity has 9 subfolders: Audio, Video, Photos, Documents, Transcripts, Reports, Evidence, Social Media, Camera Captures. 12 persons + 10 organizations in tree. Click any folder to filter file list. Expand/collapse with arrow indicators.
- **30 mock files** across 8 persons and 3 organizations: Audio intercepts (.wav with transcription), surveillance video (.mp4 with duration/resolution), LPR photos (.jpg), weekly reports (.pdf with page counts), evidence packages (.zip), social media archives (.json), camera captures, transcripts, GPS routes (.gpx), financial analysis (.xlsx), sanctions screening, bank transactions (.csv), face match captures, shell company reports, network graph exports.
- **9 file types**: Audio (🎙️), Video (🎥), Photo (📷), Document (📄), Transcript (📝), Report (📊), Evidence (🔒), Social Media (💬), Camera Capture (📹) — each with icon and color.
- **File list**: Sortable columns (Name, Entity, Type, Tags, Size) with ascending/descending toggle. Entity column links to /persons/:id or /organizations/:id. Tags shown as chips. Size in monospace.
- **Search**: Full-text across filenames, entity names, tags, and transcription text.
- **File type filter**: Quick-toggle chips in sidebar with per-type file counts.
- **Drag-and-drop upload zone**: Expandable upload area with drop target, entity assignment display, browse button. Shows which entity folder files will be assigned to.
- **Path breadcrumb**: Storage → Entity Type → Entity Name navigation with file count and total size.
- **File detail panel**: File icon + name + MIME type, preview area (image placeholder, audio player with progress bar, video player with progress bar), full metadata (size, MIME, entity, folder, path, uploaded by/at, modified, source, duration, resolution, pages), tags as chips, transcription text (for audio files with Faster-Whisper output), Download/Share/Entity link buttons.
- **Cross-linked entities**: Every file linked to /persons/:id (Horvat, Mendoza, Babić, Hassan, Al-Rashid, Kovačević, Li Wei) or /organizations/:id (Alpha Security, Rashid Holdings, Falcon Trading). File sources reference existing features: LPR Reader, InsightFace, Faster-Whisper, IMSI Catcher, GPS Tracker, Camera Network, Social Scraper, Report Generator, Workflow Engine, OpenCorporates, EU Sanctions, Bank Monitor, Connections Graph.

## 0.16.0 - 2026-03-24

### Added — Alert Rules Page (/alerts)
- **Surveillance Alert Engine**: Full alert rule management with 18 rules across 9 trigger types, per-entity targeting, 4 notification channels, and live alert feed.
- **3 view tabs**: Rules (filterable list with inline status), Live Feed (12 recent alert events with acknowledgment state), Statistics (breakdown by trigger type, person, and operation).
- **9 trigger types** from spec: Zone Entry (🛡️), Zone Exit (🚪), Co-location (🔗), Face Match (🧑), Photo/Video (📸), Speed Alert (🏎️), Signal Lost (📵), LPR Match (🚗), Keyword Detection (🔤). Each with icon, color, configurable fields.
- **18 mock alert rules** across 3 operations: HAWK (15 rules: port intrusion, co-location pairs, face at airport, LPR watchlist, signal lost, speed, diplomatic zone, keyword audio, after-hours motion, SIM swap, unknown LPR), GLACIER (2: financial transactions >€50K, Al-Rashid face), PHOENIX (1: Shanghai camera, disabled pending legal auth).
- **12 recent alert events** in live feed: zone breaches, face matches, LPR captures, co-location alerts, keyword detections, speed violations, signal loss, SIM swap — with acknowledged/unacknowledged state and "NEW" indicator.
- **Left sidebar filters**: Trigger Type (9 types with counts), Severity (Critical/Warning/Info), Operation (HAWK/GLACIER/PHOENIX), Target Person (dropdown with all targeted persons), Enabled/Disabled status, text search. Stats bar: total rules, active, unacknowledged, total fired.
- **Rule detail panel**: Trigger type icon + label, severity + enabled badges, description, fired count + cooldown stats, configuration key-value cards (zone/radius/threshold/plates/keywords/confidence etc.), notification channels (In-App 🔔, Email 📧, SMS 💬, Webhook 🔗), target persons linked to /persons/:id, target organizations linked to /organizations/:id, metadata (last fired, created by, operation), Enable/Disable toggle, navigation to /operations and /workflows.
- **Statistics tab**: Alerts by trigger type (cards with rule count + fired count per type), Alert coverage by person (bar chart showing rules and fires per target), By operation (HAWK/GLACIER/PHOENIX comparison).
- **Cross-linked**: Target persons to /persons/:id (Horvat, Mendoza, Babić, Hassan, Al-Rashid, Li Wei), target organizations to /organizations/:id (Alpha Security, Rashid Holdings, Falcon Trading, Dragon Tech), operations to /operations, workflows to /workflows, activity to /activity. Same trigger types used in Map live feed, Workflows engine, and Operations alert rules.

## 0.15.0 - 2026-03-24

### Added — Data Sources Page (/data-sources)
- **Integration Management Hub**: 22 external data sources across 6 categories and 8 countries, with health monitoring, sync controls, and per-country grouping.
- **22 mock data sources**: Government (6: Business Registry, Population Registry, Land Registry, Court Records, Vehicle Registry, Tax Authority), Law Enforcement (3: INTERPOL I-24/7, Europol SIENA, National Police DB), Financial (3: EU Sanctions CFSP, PEP Screening Dow Jones, Bank Transaction Monitor AML), OSINT (3: Social Media Aggregator, News Monitor 500+ sources, Dark Web Monitor), Technical (3: GPS Tracker Fleet MQTT, Camera Network RTSP, IMSI Catcher Array), Commercial (4: OpenCorporates 210M+, Maritime AIS, Aviation Tracker FR24, Credit Bureau).
- **Per-country grouping**: Sources grouped under sticky country headers with flag emoji (🇭🇷 Croatia, 🇪🇺 EU, 🌍 International/Global, 🇬🇧 UK, 🇺🇸 USA, 🇬🇷 Greece, 🇸🇪 Sweden, Multi-country) with per-group status counts.
- **Left sidebar filters**: Category (6 types with icon + count), Status (Connected/Degraded/Paused/Error/Offline), Country (dropdown with counts), text search, stats bar (connected/degraded/error/paused counts), "Sync All Healthy" button, average health display.
- **Source cards**: Health percentage ring (conic-gradient), provider name, category badge with icon, tags (Production/Classified/Real-time/AML/Degraded/Error/Commercial/AI-Enhanced), protocol label, status indicator.
- **Detail panel**: Connection info (protocol, endpoint, auth method, rate limit, encryption at-rest/in-transit, schedule, last/next sync, record count), Data Fields chip list, Linked Modules as clickable navigation chips to relevant pages (/persons, /organizations, /vehicles, /devices, /map, /vision, /alerts, /operations, /risks, /workflows, /face-recognition, /scraper, /chat), notes, Sync Now / Pause / Resume action buttons.
- **Sync Log tab**: Chronological sync history per source with status dot (success green, error red, partial amber), duration, record count, detail description, timestamp.
- **Realistic statuses**: Connected (17 sources, health 88-100%), Degraded (2: Court Records timeout, Dark Web instability), Paused (1: Tax Authority certificate expired), Error (1: Credit Bureau server maintenance), various error rates and sync schedules.
- **Connected to all modules**: Each source links to the modules it feeds — Persons, Organizations, Vehicles, Devices, Map, Vision, Face Recognition, Social Scraper, Web Scraper, AI Assistant, Alerts, Operations, Risks, Workflows, Connections, LPR, Comms.

## 0.14.0 - 2026-03-24

### Added — Risks Dashboard (/risks)
- **Threat Assessment Center**: Cross-entity risk scoring dashboard with 5 tabs, left sidebar filters, and expandable factor breakdowns.
- **5 view tabs**: Overview (KPI cards + top threats + factor distribution), Persons (sortable risk table with expandable factor detail), Organizations (risk-colored cards with linked persons), Vehicles (risk table with owner links), Risk Factors Matrix (all factors sorted by score).
- **Overview tab**: 3 KPI cards (Persons/Orgs/Vehicles) with critical/high/medium counts and stacked risk distribution bars. Top Threat Entities section showing Critical-rated persons with avatar, risk gauge (conic-gradient), and factor chips. Risk Factor Distribution grid showing 8 categories with factor counts and average scores — clickable to jump to matrix.
- **Persons tab**: Table with avatar, name, nationality, risk level, composite risk score bar, top factor chip, and View link. Click to expand and see all risk factors with severity badge, detailed description, and individual score. Factors for 5 key subjects (Horvat: 6 factors, Mendoza: 5, Babić: 4, Hassan: 3, Al-Rashid: 3) totaling 21 risk factors.
- **Organizations tab**: Card grid with industry, country, CEO, linked persons as clickable chips, risk badge. Links to /organizations/:id and /persons/:id.
- **Vehicles tab**: Table with plate (monospace), make/model/year/color, risk level, owner link to /persons/:id, detail link to /vehicles/:id.
- **Risk Factors Matrix tab**: All 21 risk factors across all subjects, sorted by score (0-100), with category icon, severity badge, detailed explanation, and link to subject profile. Filterable by 8 categories.
- **8 risk factor categories**: High-Risk Connections, Zone Violations, LPR Flags, Behavioral Anomalies, Comms Anomalies, Co-location Patterns, AI Anomalies, Financial Flags.
- **Left sidebar**: Risk Level filter (All/Critical/High/Medium/Low/No Risk with entity counts and color-coded bars), Factor Category filter (visible on matrix tab), search, quick links to /map, /activity, /operations, /workflows.
- **Cross-linked**: Persons to /persons/:id, organizations to /organizations/:id, vehicles to /vehicles/:id, map, activity log, operations, workflows. Uses real mock data from all entity modules.

## 0.13.0 - 2026-03-24

### Added — Activity Log Page (/activity)
- **Unified Event Stream**: Full-featured activity log showing all tracked events across the ARGUX platform with 40 realistic mock events spanning 12 event types.
- **Left sidebar filter panel** with 6 filter dimensions: Event Type (12 toggleable chips with counts), Severity (5 levels), Person (dropdown with all subjects), Organization (dropdown), Operation (dropdown: HAWK/GLACIER), and full-text search. All filters update results immediately with pagination reset.
- **12 event types**: Phone, GPS, Camera, LPR, Face Recognition, Audio, Video, Zone (geofence), Alert, System, Workflow, Record — each with icon, color, and count badge.
- **40 mock events** covering: zone breaches, face matches (94% Horvat, 87% Babić, 91% Kovačević), LPR captures (ZG-1847-AB, SA-9012-RH, ZG-5678-CD), co-location alerts (Horvat+Mendoza 3rd in 48h), phone signal events (SIM swap, 6h blackout), GPS anomalies (118km/h urban, storage facility 48h pattern), audio keywords ("delivery" ×3), camera AI detections (loitering, unauthorized vessel), workflow executions, system events (INTERPOL sync, AI inference, backup), evidence records.
- **Expandable event detail**: Click any event row to expand with full description, metadata grid (Zone/Duration/Speed/Confidence etc.), and quick-link buttons to /persons/:id, /organizations/:id, /devices/:id, /operations, /map.
- **Paginated**: 15 events per page with "Load more" button showing remaining count.
- **Stats bar**: Live counts of total events, critical, high, and unique subjects matching current filters.
- **Cross-linked entities**: Every event links to the real mock data — persons (Horvat, Mendoza, Babić, Hassan, Kovačević, Al-Rashid), organizations (Alpha Security, Rashid Holdings, Falcon Trading, Mendoza Import-Export, Gulf Maritime, Petrova Consulting), devices (by ID to /devices/:id), operations (HAWK, GLACIER).
- **Connected to**: Map page (event types match live feed), Operations (same codenames), Workflows (execution events match workflow names), Persons/Orgs/Devices (same IDs), Vision page (same camera device IDs).

## 0.12.0 - 2026-03-24

### Added — Workflows Page (/workflows)
- **Automated Surveillance Workflow Engine**: Kanban board + list + template views for managing trigger→action automation chains.
- **3 view modes**: Kanban (5 columns: Draft/Active/Paused/Completed/Archived), List (sortable table), Templates (pre-built workflow cards).
- **9 mock workflows** linked to real operations (HAWK, GLACIER, PHOENIX, CERBERUS) covering: port intrusion detection, co-location monitoring, counter-surveillance detection, LPR watchlist tracking, financial transaction monitoring, nightly activity sweep, diplomatic surveillance, border crossing alerts, cargo watch.
- **10 trigger types**: Zone Entry, Zone Exit, Co-location, Face Match, LPR Match, Signal Lost, Speed Alert, Keyword Detection, Schedule (cron), Manual.
- **8 action types**: Alert, Assign Team, Escalate, AI Analysis (Ollama/XGBoost), Create Record, Notify, Deploy Device, Generate Report.
- **6 pre-built templates**: Zone Breach Response, Co-location Evidence Capture, Vehicle Tracking Chain, Daily Intelligence Briefing, Signal Loss Response, Face Recognition Alert.
- **Execution log**: Per-workflow run history with status (success/failed/running), duration, trigger description, output summary, timestamps. Running state with pulse animation.
- **Detail panel**: Config tab (triggers with configs, numbered action pipeline, linked persons with /persons/:id links, metadata). Log tab (execution history).
- **Cross-linked**: Workflows tied to Operations (OP HAWK, GLACIER, etc.), linked persons (Horvat, Mendoza, Babić, Hassan, Al-Rashid), with navigation to /operations, /map, /alerts, /persons/:id.
- **Filter/search**: By operation name and text search across workflow names.

## 0.11.0 - 2026-03-24

### Added — Operations Page (/operations)
- **Surveillance Operation Planning Center**: Full-featured operations management page with split-panel layout (operation list + detail view).
- **5 mock operations** with realistic intelligence scenarios: HAWK (Active, arms trafficking), GLACIER (Planning, financial network), PHOENIX (Preparation, tech transfer), CERBERUS (Debrief, border crossing), SHADOW (Closed, diplomatic — redacted).
- **8 detail tabs**: Overview, Targets, Resources, Teams, Zones, Alerts, Timeline, Briefing.
- **Overview tab**: KPI stats cards (events/alerts/hours/intel), operational checklist with team assignments and completion tracking, threat assessment with risk gauge (conic-gradient).
- **Targets tab**: Grid of target persons with avatars, risk badges, nationality — linked to /persons/:id. Target organizations linked to /organizations/:id.
- **Resources tab**: Deployed devices with status and type icons — linked to /devices/:id. Tracked vehicles with plate/make/model — linked to /vehicles/:id.
- **Teams tab**: 6 pre-configured teams (Alpha Ground, Bravo Technical, Charlie SIGINT, Delta Maritime, Echo Air, Fox Rapid Response) with color-coded cards, team leads, member callsigns and roles.
- **Zones tab**: Operation zones (surveillance/restricted/staging/buffer) with coordinates and radius. Linked to Map view.
- **Alerts tab**: Per-operation alert rules with trigger types (Zone Entry, Co-location, LPR Match, Face Match, Signal Lost, Speed, Transaction), severity levels, and enable/disable state.
- **Timeline tab**: Chronological event timeline with connected dot-line visualization, color-coded by type (phase/event/intel/alert).
- **Briefing tab**: SITREP notes, comms channel/frequency display, classification footer.
- **Operation list sidebar**: Filterable by phase (Planning/Preparation/Active/Debrief/Closed) with search, showing codename, priority badge, description preview, and resource counts.
- **Risk gauge**: Conic-gradient circular gauge in operation header showing computed risk level (0-100).
- **Connected features**: Direct links to /persons/:id, /organizations/:id, /devices/:id, /vehicles/:id, /map, /vision from all relevant tabs. Uses real mock data from persons, organizations, devices, vehicles.

## 0.10.2 - 2026-03-24

### Fixed — Vision Page Complete Rewrite
- **WebMediaPlayer limit fix**: Replaced 8-11 simultaneous `<video>` elements with a **single shared `<video>` element** + `<canvas>` per tile architecture. One hidden video plays the source, `requestAnimationFrame` loop paints frames to each camera's canvas. Zero WebMediaPlayer limit issues.
- **Menu reorganized**: Moved all controls from top toolbar to a **collapsible left sidebar** with sections: Camera Groups, Grid Layout, Overlays, Global Controls, Panels. Collapsible via ◀/▶ toggle.
- **Canvas-based rendering**: Each camera tile uses a canvas element registered via `useCallback` ref. The shared RAF loop iterates all registered canvases and draws the video frame with zoom transform and night vision composite.
- All 12 features preserved: PTZ, Motion Zones, Camera Groups, Recording Timeline, Sync Playback, Face Queue, Map View, Bandwidth Monitor, Presets, Waveform, Popup Windows, Per-cam hover controls.

## 0.10.1 - 2026-03-24

### Fixed — Vision Video Playback
- **Video autoplay fix**: Replaced single-shot `play()` with robust event-based recovery. Videos now use `suspend`, `stalled`, `loadeddata`, and `pause` event listeners to retry playback automatically. Added periodic 2-second health check as fallback. Staggered initial play (200-1000ms random delay per tile) prevents browser throttling when loading 8+ simultaneous streams. Separated pause-toggle logic from autoplay logic to avoid dependency conflicts.

## 0.9.0 - 2026-03-24

### Added — Intelligence Panels & Vision Page
- **Anomaly Detection panel** (Alt+3): AI-powered behavioral analysis with 6 anomaly types, 9 mock anomalies, sensitivity slider, deviation bars, baseline vs observed comparison, recommendations. On-premise Ollama LLaMA 3.1.
- **Predictive Risk panel** (Alt+4): ML risk trajectory with conic-gradient risk gauges, predicted locations, threat assessments, numbered recommended actions. XGBoost + scikit-learn.
- **Pattern Detection panel** (Alt+5): Recurring behavioral pattern analysis with 5 categories, weekly heatmap bars, regularity progress bars, involved persons, expanded bar chart.
- **Incident Timeline panel** (Alt+6): Chronological event feed with 10 event types, 15 mock events, visual timeline connectors, severity/type/search filtering, metadata grids.
- **Heat Calendar panel** (Alt+7): GitHub-style 90-day activity grid per person with 13×7 cell grid, month labels, hover tooltips, peak day highlight, legend.
- **Entity Comparison panel** (Alt+8): Side-by-side dual-bar comparison of 12 metrics between two subjects, weekly activity chart, overlap analysis grid.
- **Route Replay panel** (Alt+9): Historical movement animation with VCR transport controls, 0.5×/1×/2×/4× speed, progress scrubber, waypoint event log, speed/bearing/time readout.
- **Geofence alerts** integrated into Live Feed: Zone entry/exit events added as dedicated feed templates.
- **Enhanced map search**: Unified search across 8 categories (persons, orgs, vehicles, devices, saved places, zones, coordinates, geocoding). Category filter chips, grouped results, quick tips.
- **Export/Share modal** (E key): Export map as PNG (canvas download) or PDF (print dialog with metadata). Share workspace URL with encoded viewport state.
- **Keyboard shortcuts overlay** (Ctrl+Q): 27 shortcuts across 4 groups. Input-safe, Esc-priority chain.
- **Panel system upgrades**: Z-index management (click-to-front), snap-to-edge (24px threshold), resize grip (bottom-right), touch drag support, auto-cascade for multi-panel positioning.
- **Vision page** (/vision): Full camera surveillance wall with 11 cameras from mock devices. Features: 1×1/2×2/3×3/4×4 grid layouts, per-camera hover controls (play/pause, mute/unmute, record, night vision, snapshot, fullscreen, volume slider), AI detection overlays with tracking corners, real-time FPS/bitrate/audio stats, live clock, alert badges, status filtering, type filtering, search, detail sidebar with device info + AI detections + alerts + navigation links.
- **Vite chunking**: Manual chunks for maplibre, react, inertia, misc vendors, mock data. Warning limit 1500kB.

### Fixed
- Panel buttons (close/minimize/maximize) not responding: `onMouseDown` on wrapper now skips interactive elements.
- Panel snap-to-edge using wrong dimensions: now reads actual panel element size.
- Multi-panel overlap: auto-cascade positions panels 30px apart.
- TypeScript `as const` assertions added to 175+ lines for CSS literal types.
- `sourceDefs` → `sourceTypes` fix in enhanced search.
- `Record<string, string>` casts on incident metadata objects.
- `bringToFront` optimized to skip re-render when panel already on top.
- Video autoplay: proper play() promise handling with muted-first strategy.
- Breadcrumbs removed from Vision page (full-screen experience like Map).

## 0.8.1 - 2026-03-22

### Added — Map Overlays & Settings
- **World Minimap** (top-right): 140×100px overview map using a second MapLibre GL JS instance with CARTO Dark No-Labels tiles. Non-interactive. Follows main map center and zoom (offset by -6 zoom levels). Crosshair SVG in center. "OVERVIEW" label top-left. Rounded corners with border and shadow. Visible by default, togglable in Settings.
- **Compass widget** (bottom-left): 60px SVG compass rose that rotates based on map bearing in real-time. Features: N/S/E/W cardinal labels, red north needle, white south needle, 8 tick marks (major at 90° intervals), accent-colored center dot, bearing readout in degrees below. Smooth CSS transition on rotation. Visible by default, togglable in Settings.
- **Map Controls** (bottom-right): Vertical button stack with 7 controls:
  - **Zoom In** (+) — `map.zoomIn()` with 300ms animation
  - **Zoom Out** (−) — `map.zoomOut()` with 300ms animation
  - *Divider*
  - **Fullscreen** (expand/collapse icon) — toggles native Fullscreen API on `.tmap-page`. Icon changes between expand/collapse states. Active highlight when fullscreen. Listens to `fullscreenchange` event for external exits (Esc key).
  - *Divider*
  - **Rotate Left** (↺) — rotates bearing -45° with 400ms animation
  - **Reset North** (compass arrow) — resets bearing to 0° with 500ms animation. Active highlight when bearing ≠ 0°.
  - **Rotate Right** (↻) — rotates bearing +45° with 400ms animation
  - All buttons: 32×32px, dark blurred background, border, hover highlight. `MapBtn` component with `active` prop for state highlighting.
- **FPS Counter** (top-right, below minimap): Real-time frames-per-second display using `requestAnimationFrame` loop. Color-coded: green (≥50 FPS), amber (≥30 FPS), red (<30 FPS) with matching dot indicator and tinted background. JetBrains Mono font. **Disabled by default** — enable in Settings. Positioned below minimap when both visible, otherwise top-right corner.
- **Coordinates bar updated**: Now includes bearing (`BRG 0°`) alongside LAT, LNG, Z. Visibility togglable via Settings.

### Changed — Settings Section
- **Settings section** now open by default with 5 toggle switches:
  - **World Minimap** — "Overview map in top-right corner" — default: ON
  - **Compass** — "Bearing indicator in bottom-left" — default: ON
  - **Map Controls** — "Zoom, fullscreen, rotation buttons" — default: ON
  - **Localization** — "Coordinate bar and scale" — default: ON
  - **FPS Counter** — "Frames per second display" — default: OFF
- **Toggle component**: Custom switch with 34×18px track, 14px knob, smooth slide animation, accent color when enabled, label + description text.
- **Removed** built-in MapLibre `NavigationControl` — replaced by custom Map Controls buttons (bottom-right).
- **Map bearing tracking**: Added `map.on('rotate')` listener to update `bearing` state, consumed by Compass widget, Reset North active state, and coordinates bar.
- **Minimap component**: Second MapLibre instance with lifecycle management — creates on mount, updates center/zoom on main map move, removes on unmount.

## 0.8.0 - 2026-03-21

### Added — Tactical Map Module
- **Tactical Map page** (`/map`): Full-screen map interface built on MapLibre GL JS with CARTO Dark basemap tiles. Centered on Zagreb, Croatia (45.8150°N, 15.9819°E) at zoom 13. The map is the application's default landing page (`/` redirects to `/map`).

  **MapLibre GL JS integration:**
  - Loaded dynamically via CDN (`unpkg.com/maplibre-gl@4.7.1`) — no npm dependency required
  - CSS and JS injected in `useEffect` on mount, map initialized after script load
  - CARTO Dark Matter raster tiles (`basemaps.cartocdn.com/dark_all`) for tactical dark aesthetic
  - Built-in controls: NavigationControl (zoom + compass, top-right), ScaleControl (metric, bottom-right), AttributionControl (compact, bottom-right)
  - Cleanup on unmount: `map.remove()` to prevent memory leaks

  **Left sidebar (300px, collapsible on mobile):**
  - **Header**: Tactical Map brand with crosshair icon, recenter button (crosshair icon → flies back to Zagreb)
  - **10 collapsible sections** with icons, chevron toggle, section badges:
    1. **Period** (calendar icon, open by default): Date From / Date To inputs with dark color scheme. Quick presets: 24h, 7d, 30d buttons + Clear. Auto-populates both date fields.
    2. **Subjects** (people icon, open by default): Persons multiselect dropdown (searchable, checkboxes, 15 persons from mock data with nationality sub-text). Selected persons shown as tag chips below dropdown with individual remove buttons. Badge count in section header.
    3. **Sources** (waveform icon): Empty — "No source filters configured."
    4. **Layers** (stack icon): Empty — "No custom layers configured."
    5. **Tiles** (grid icon): Empty — "Tile source selection coming soon."
    6. **Tools** (pencil icon): Empty — "Drawing and measurement tools coming soon."
    7. **Intelligence** (clock icon): Empty — "Intelligence analysis panels coming soon."
    8. **Custom Objects** (pin icon): Empty — "No custom objects placed."
    9. **Saved Places** (marker icon): Empty — "No saved places."
    10. **Settings** (gear icon): Empty — "Map settings coming soon."
  - **SidebarMS component**: Multiselect dropdown optimized for sidebar width — trigger button, searchable panel with checkboxes, Clear button, selected tags below with remove.
  - **Section component**: Collapsible with smooth chevron rotation, optional badge count, hover highlight on header.

  **Map overlays:**
  - **Coordinates bar** (bottom center): LAT, LNG, Z (zoom level) — updates on mouse move and zoom. Mono font, blurred dark background, subtle border.
  - **Loading overlay**: Spinner + "Loading Tactical Map..." / "Initializing MapLibre GL JS" text while map loads.

  **Responsive design:**
  - Desktop: 300px fixed sidebar + flexible map area
  - Mobile (≤768px): Sidebar becomes fixed overlay, slides in from left with box-shadow. Toggle button (hamburger) positioned top-left over map. Backdrop overlay when sidebar open.
  - Full-screen layout: Uses negative margins to negate `ax-app-content` padding (same pattern as `/chat`).

- **Map CSS** (`resources/css/pages/map.css`): Full-height flex layout, sidebar with sections, coordinates overlay, mobile responsive transitions, multiselect panel styles, tag chips, collapsible section animations.

### Routes Changed
- `GET /map` → now renders `Map/Index` (was Dashboard placeholder)

## 0.7.2 - 2026-03-21

### Added — Devices Tab on Person & Organization Show
- **Devices tab on Person Show**: New "Devices" tab (monitor icon) between Vehicles and Connections (tab 7 of 10). Renders `EntityDevices` component filtered to `personId === p.id`. Shows all surveillance devices assigned to that person with full table, search, filters, context menu, actions, delete modal.
- **Devices tab on Organization Show**: Same "Devices" tab (monitor icon) between Vehicles and Connections (tab 7 of 9). Renders `EntityDevices` filtered to `orgId === o.id`.
- **EntityDevices component** (`components/devices/EntityDevices.tsx`): Reusable embedded devices table scoped to a specific person or organization. Full feature parity with `/devices` page:
  - **Empty state**: When no devices assigned — icon, message "No Devices Assigned", entity name, "Assign Device" button → navigates to `/devices/create`.
  - **Header**: Device count + online count, "Assign" button (compact).
  - **Search bar** + collapsible **Filters toggle** button (accent when active, count badge). Filters only show Type and Status multiselect dropdowns (options derived from entity's actual devices — only shows types/statuses that exist). "Clear" link when filters active.
  - **Responsive table** (min-width 650px with horizontal scroll): Columns — Name (clickable → show page), Type (color badge), Status (dot + label), Signal (5-bar indicator + %), Battery (shell graphic or "AC"), Location (truncated), Last Seen (mono timestamp), Actions (3 tooltip buttons: Show/Edit/Delete).
  - **Right-click context menu**: Show Device, Edit Device, Delete Device (red with divider). Click-outside-close.
  - **Delete confirmation modal**: Warning icon, device name bold, Cancel/Delete buttons, toast on confirm.
  - All navigations go to main `/devices/:id` and `/devices/:id/edit` routes.

### Person Show tabs (10 total)
Overview → Contacts → Social → Addresses → Employment → Vehicles → **Devices** → Connections → AI Assistant → Notes

### Organization Show tabs (9 total)
Overview → Contacts → Social → Addresses → Vehicles → **Devices** → Connections → AI Assistant → Notes

## 0.7.1 - 2026-03-21

### Fixed
- **"+ New Device" button**: Replaced large `Button` component with compact styled button — smaller padding (7px 14px), font-size 11px, `flexShrink: 0`, aligned right in header flex row.

### Changed — Devices Index Filters & Table
- **Filter bar redesigned**: Moved into a bordered card with 2 rows of filters + summary row:
  - **Row 1**: Name search (text input), Type (multiselect), Status (multiselect), Signal (multiselect — Excellent/Good/Fair/Weak/None levels)
  - **Row 2**: Location (multiselect — all unique locations), Person (multiselect — all assigned persons), Organization (multiselect — all assigned orgs), Last Seen (date from → date to range pickers)
  - **Summary row**: "X of Y devices · Z filters active" count + "Clear All Filters" button when active
- **All multiselect dropdowns** (MSF component): Searchable, checkboxes with accent color, Clear button (red styled pill), click-outside-close, `min-width: 180px`, `z-index: 80`, shows "(N)" count when active, border highlights accent when selections exist. Empty state "No results" when search yields nothing.
- **Date range filter**: Two date inputs with `colorScheme: dark`, arrow separator, accent border when value set. Filters `lastSeen` inclusive of from/to dates.
- **Table responsive**: `min-width: 900px` on table with horizontal scroll wrapper (`overflowX: auto`, `-webkit-overflow-scrolling: touch`). Sticky header row with `position: sticky; top: 0`.
- **Right-click context menu**: `onContextMenu` on each table row opens a floating menu at cursor position with 3 items:
  - **Show Device** (eye icon) → navigates to `/devices/:id`
  - **Edit Device** (pencil icon) → navigates to `/devices/:id/edit`
  - **Delete Device** (trash icon, red) → opens delete confirmation modal
  - Click-outside-close. Divider before delete. Hover highlights with appropriate colors.
- **Actions column** added as last column (centered header): 3 icon buttons per row with tooltips:
  - **Show Details** (eye icon) — tooltip "Show Details"
  - **Edit Device** (pencil icon) — tooltip "Edit Device"
  - **Delete Device** (trash icon, red) — tooltip "Delete Device"
  - TBtn component: 26×26px, border, hover highlight, danger variant for delete. Tooltip appears above on hover with arrow-less floating label (dark bg, border, 10px font).
- **Delete confirmation modal**: Enhanced with warning icon (red circle + trash), device name in bold, "This action cannot be undone" sub-text, Cancel + Delete Device buttons. Toast "Device deleted" on confirm.
- **Empty state**: Enhanced with "No devices match your filters" message + "Clear Filters" button when filters are active.
- **Row click removed** from entire row (was navigating on any click) — now only Name text is clickable to show details, preventing accidental navigation when using action buttons.

## 0.7.0 - 2026-03-21

### Added — Surveillance Devices Module
- **Devices Index** (`/devices`): Responsive table with 20 mock surveillance devices. Columns: Name (with UUID), Type (color badge), Status (dot + label), Signal (5-bar indicator), Battery (shell graphic + percentage, "AC" for wired), Location, Assigned To (clickable person/org links), Last Seen, Edit button. Search across name/manufacturer/model/serial/assignee. Filter by device type and status dropdowns. Result count. Click row → show detail. KPI summary: total, online, offline, maintenance counts.
- **Devices Create** (`/devices/create`): Full form with 5 sections:
  - **Device Information**: Name (required), Type (required, 5 types), Status, Manufacturer (15 options), Model, Serial Number, Firmware Version
  - **Network & Protocol**: Protocol (12 options), IP Address, MAC Address, Storage Capacity, Encryption toggle
  - **Capabilities** (conditional — cameras/audio only): Resolution, Night Vision checkbox, Motion Detection checkbox
  - **Location**: Location Name, Latitude/Longitude coordinates, Install Date
  - **Assignment** (optional): Person (searchable dropdown, 15 persons), Organization (searchable dropdown, 10 orgs)
  - **Notes**: free-text textarea
- **Devices Edit** (`/devices/:id/edit`): Same form pre-populated from mock device data. Save simulates 1s delay with success toast.
- **Devices Show** (`/devices/:id`): Full device detail page:
  - **Header**: Type emoji icon (📡/🕵️/📹/🔒/🎙️) with color-coded background, device name, type badge, status badge with dot, UUID
  - **Status cards** (4): Signal (5-bar + percentage), Battery (shell graphic + %), Last Seen (timestamp), Installed (date)
  - **Detail grid** (2 columns, responsive): Hardware specs (manufacturer, model, serial, firmware, storage), Network (protocol, IP, MAC, encryption), Capabilities (resolution, night vision, motion detection — conditional), Location (name, coordinates)
  - **Assignment section**: Clickable person/org cards with avatars that navigate to their detail pages
  - **Notes section**: Full-width pre-wrapped text

- **Device types** (5): GPS Tracker (blue 📡), Hidden Camera (red 🕵️), Public Camera (green 📹), Private Camera (amber 🔒), Audio Recorder (purple 🎙️)
- **Device statuses** (5): Online (green), Offline (red), Maintenance (amber), Decommissioned (gray), Standby (cyan)
- **20 mock devices** with realistic data: 5 GPS trackers (vehicles of Horvat, Kovačević, Babić, Hassan, Petrova), 3 hidden cameras (Split hotel, Cairo office, Moscow meeting room), 4 public cameras (Zagreb HQ, street, airport cargo, A1 highway), 4 private cameras (Dubai port, Rashid Holdings parking, ASG server room, Shanghai port), 4 audio recorders (Mendoza car, Al-Rashid residence, Mendoza office, Wei personal). Each with manufacturer/model, serial, firmware, protocol, IP/MAC, coordinates, storage, encryption status, install date, and detailed intel notes.
- **DeviceForm component** (`DeviceForm.tsx`): Shared between Create and Edit. Searchable dropdowns for person/org assignment with "— None —" option. Conditional capabilities section based on device type. Form validation on name + type.
- **Devices CSS** (`devices.css`): Signal bars, battery shell graphic, type badges, status dots, spec cards, detail grid responsive layout, form sections.

### Routes Added
- `GET /devices` → `Devices/Index`
- `GET /devices/create` → `Devices/Create`
- `GET /devices/:id/edit` → `Devices/Edit`
- `GET /devices/:id` → `Devices/Show`

## 0.6.3 - 2026-03-21

### Added — EntityChat: Full Attachment Suite, Export PDF, Print View
- **5 attachment upload buttons** in EntityChat input toolbar (was 2):
  1. **File** (paperclip) — any file type
  2. **Image** (landscape icon) — accepts `image/*` (jpg, png, gif, webp, svg, bmp, tiff)
  3. **Photo** (camera icon) — accepts RAW formats (heic, raw, cr2, nef, arw, dng)
  4. **Audio** (waveform icon) — accepts `audio/*` (mp3, wav, ogg, m4a, flac, aac, wma)
  5. **Video** (camera/film icon) — accepts `video/*` (mp4, avi, mov, mkv, webm, flv, wmv)
  - Each button uses `uploadWithAccept()` helper to set `accept` attribute on hidden file input
  - File type auto-detected from extension with expanded format lists
  - `AttachIcon` component updated with distinct icons for all 5 types including new photo (camera) icon
  - `AttachIcon` now accepts `size` prop for flexible sizing (default 10, pending chips use 8)
- **Export PDF button** in EntityChat header: download icon triggers simulated 1.5s export with spinner animation. Toast "PDF exported" with truncated conversation title filename.
- **Print button** in EntityChat header: printer icon switches to inline print view within the same component (no route navigation needed).
- **Inline print view** renders when `printView` is true:
  - White A4 layout (`chat-print-page` CSS class) with max-width 800px centered
  - Header: ARGUX brand, conversation title, entity name/type, message count, creation date
  - Messages rendered chronologically: role badges (OPERATOR blue / ARGUX AI gray), timestamps, markdown rendering, attachment chips with type-specific emoji (🖼️ image, 📷 photo, 🎬 video, 🎵 audio, 📎 file)
  - Footer: CLASSIFIED // NOFORN + entity context
  - "Back to Chat" button (gray) returns to chat view
  - "Print This Page" button triggers `window.print()` (both hidden via `print-no-print` class)

### Changed
- **EntityChat header** restructured: sidebar toggle + title (flex:1) on left, entity badge + print button + PDF export button on right. All action buttons use consistent `hdrBtn` style with border.
- **Pending file chips**: `AttachIcon` uses `size={8}` for compact display.
- **File type detection**: expanded extension lists — images: +bmp,tiff; photo: +arw,dng; video: +flv,wmv; audio: +aac,wma.

## 0.6.2 - 2026-03-21

### Added
- **AI Assistant tab on Person Show**: New "AI Assistant" tab (9th tab) between Connections and Notes. Contains a full embedded chat interface scoped to the specific person. Conversation sidebar (collapsible, 220px), message area with markdown rendering, file attachments (image/audio/video/file), speech-to-text, typing animation. Pre-initialized with a system message: "AI Assistant context loaded for person: **{Name}**". New conversations auto-title with "{Name} — {first message}". Placeholder shows "Ask about {Name}...".
- **AI Assistant tab on Organization Show**: Same "AI Assistant" tab (8th tab) between Connections and Notes. Full embedded chat scoped to the organization. Context shows "Context: {OrgName} (organization)" in header. Entity type badge shows "ORG".
- **EntityChat component** (`components/chat/EntityChat.tsx`): Reusable chat component accepting `entityName` and `entityType` props. Contains full chat logic extracted from `/chat` page:
  - **Conversation sidebar** (220px, collapsible via toggle button): New conversation button, search filter, conversation list with title/message count/date, delete button (hover-reveal) with confirmation modal.
  - **Message area**: User messages right-aligned (accent blue), assistant messages left-aligned (dark with border). Markdown rendering for AI responses (headings, bold, code, lists, tables). System messages filtered from display. Auto-scroll on new messages. Empty state with entity-specific prompt.
  - **Input area**: Multi-line textarea (Enter to send, Shift+Enter newline), file attachments (paperclip for any file, image icon for images), speech-to-text microphone button with recording state animation, pending file chips with remove button, send button with disabled state.
  - **Speech-to-text**: Web Speech API with continuous recognition, interim results, recording pulse animation. Placeholder changes to "Listening…" when active.
  - **File upload**: Supports image/photo/audio/video/file types with auto-detection from extension. Shows as pending chips above textarea, then as attachment chips on sent messages.
  - **AI responses**: Random responses from mock pool with 1.5–3s delay and typing animation.
  - Fixed height (560px) to fit within the tab content area without affecting page scroll.

## 0.6.1 - 2026-03-21

### Fixed
- **Background broken when writing prompt**: Root cause — `chat-page`, `chat-main`, `chat-messages`, and `chat-input-area` used semi-transparent `rgba()` backgrounds that exposed broken/missing parent background. Fixed by using CSS variable `var(--ax-bg)` for chat-page, chat-main, chat-messages, and `var(--ax-header-bg)` for header and input area. All sections now have solid opaque backgrounds.
- **Persons/Organizations dropdown menu layout broken**: Dropdowns inside the chat header were clipped by the header's `overflow` and low `z-index`. Fixed by: removing implicit overflow, adding `z-index: 20` to `.chat-header`, wrapping selects in `.chat-header-selects` with `z-index: 30`, dropdown panels use `z-index: 100` with absolute positioning and `min-width: 200px` to prevent cramped layout. Header restructured to use `.chat-header-left` (flex, min-width 0) and `.chat-header-actions` (flex-shrink 0) for proper flex behavior.

### Added
- **Speech-to-text**: Microphone button in input toolbar (separated from file buttons by a divider). Uses Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`). Click to start listening — button pulses red with `chatPulse` animation. Continuous recognition with interim results that update the input textarea in real-time. Click again to stop. Toast notification "Listening... Speak into your microphone" on start. Placeholder changes to "Listening… speak now" while recording. Graceful fallback with error toast if browser doesn't support Speech API.
- **Print conversation** (`/chat/:convId/print`): Print icon button in chat header navigates to dedicated print page. Custom white A4 layout with: ARGUX brand header, conversation title, message count, created date, entity tags (person/org). Messages rendered chronologically with role badges (OPERATOR = blue, ARGUX AI = gray), timestamps, markdown rendering in assistant messages, attachment chips. CLASSIFIED // NOFORN footer. "Print This Page" button triggers `window.print()`.
- **Export to PDF**: Download icon button in chat header. Simulated 1.5s export with spinner animation, toast "PDF exported" with filename.
- **Chat CSS print layout classes**: `.chat-print-page`, `.chat-print-header`, `.chat-print-msg`, `.chat-print-msg-role` (user/assistant variants), `.chat-print-msg-content` with markdown table/heading styles, `.chat-print-attach-chip`, `.chat-print-footer`. `@page` rule with A4 margins.

### Changed
- **Header layout restructured**: Split into `.chat-header-left` (title + mobile toggle) and `.chat-header-actions` (entity selects + action buttons). Proper flex behavior prevents overflow. Mobile at 768px stacks vertically.
- **Input toolbar**: Added vertical divider between file upload buttons and microphone. Recording state class `.chat-input-btn.recording` with red color and pulsing box-shadow animation.

### Routes Added
- `GET /chat/:convId/print` → Chat/Print

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
