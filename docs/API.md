# Mock API Reference

## Overview

ARGUX uses Inertia.js for all page rendering. Mock API endpoints exist for future AJAX-driven features. All responses return predictable JSON shapes.

## Response Formats

### List Response
```json
{
  "data": [],
  "meta": { "page": 1, "per_page": 10, "total": 42 },
  "filters": { "search": "", "status": "all" }
}
```

### Action Response
```json
{
  "message": "Entity created successfully.",
  "data": { "id": 101, "name": "Entity Name" }
}
```

### Error Response
```json
{
  "message": "Validation failed.",
  "errors": { "field": ["Error message."] }
}
```

## Current Endpoints

### Pages (Inertia)

All current pages are served via Inertia — the full route map is in [README.md](../README.md#route-map).

### Locale
- `POST /locale/{locale}` — Switch locale (en, hr). Stores in session.

### Mock API (Planned)

```
GET    /mock-api/persons              — Paginated person list
GET    /mock-api/persons/{id}         — Single person
POST   /mock-api/persons              — Create person
PUT    /mock-api/persons/{id}         — Update person
GET    /mock-api/organizations        — Paginated org list
GET    /mock-api/vehicles             — Paginated vehicle list
GET    /mock-api/dashboard/stats      — Dashboard KPIs
GET    /mock-api/options/countries    — Country dropdown options
GET    /mock-api/notifications        — Notification feed
POST   /mock-api/jobs/report-export  — Trigger report export job
GET    /mock-api/jobs/{id}            — Job status polling
```

## Authentication

No API authentication is implemented. All endpoints are open in mockup mode.
