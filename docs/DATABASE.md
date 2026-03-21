# Mock Data Strategy

## No Database

ARGUX runs without any database. No MySQL, PostgreSQL, SQLite, or any other database driver.

## Data Sources

All mock data lives in TypeScript files under `resources/js/mock/`:

| File | Entity | Records | Key Interfaces |
|------|--------|---------|---------------|
| `persons.ts` | Person | 15 | `Person`, `PersonEmail`, `PersonPhone`, `PersonAddress`, `PersonNote`, `PersonLanguage`, `PersonEducation`, `PersonEmployment` |
| `organizations.ts` | Organization | 10 | `Organization`, `OrgWebsite`, `OrgSocial`, `OrgLinkedPerson` |
| `vehicles.ts` | Vehicle | 18 | `Vehicle` |

## Shared Types

Exported from `persons.ts` and re-exported where needed:
- `Risk` — `'No Risk' | 'Low' | 'Medium' | 'High' | 'Critical'`
- `Status` — `'Active' | 'Inactive' | 'Deleted' | 'Suspended' | 'Under Review'`

## Reference Arrays

| Array | Source | Count |
|-------|--------|-------|
| `risks` | persons.ts | 5 |
| `statuses` | persons.ts | 5 |
| `countries` | persons.ts | 120+ |
| `nationalities` | persons.ts | 80+ |
| `religions` | persons.ts | 28 |
| `industries` | organizations.ts | 41 |
| `vehicleTypes` | vehicles.ts | 20 |
| `vehicleMakes` | vehicles.ts | 33 |
| `vehicleColors` | vehicles.ts | 20 |
| `vehicleYears` | vehicles.ts | 30 |
| `degrees` | persons.ts | 33 |
| `genders` | persons.ts | 6 |

## Color Maps

- `riskColors` — Risk level → hex color
- `statusColors` — Status → hex color
- `colorMap` (vehicles) — Color name → hex (e.g., "Matte Black" → `#1a1a1a`)

## Cross-References

- Vehicles reference persons by `personId` and organizations by `orgId`
- Organizations reference persons as `linkedPersons` with `{id, firstName, lastName, role}`
- Person employment `company` field references organization names
- All IDs are simple integers; UUIDs are generated strings for display

## Adding Mock Data

1. Add records to the appropriate `mock/*.ts` file
2. Follow existing interface shape
3. Use `generateId()` for new sub-entity IDs
4. Ensure cross-references are consistent
