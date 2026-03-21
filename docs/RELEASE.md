# Release Process

## Versioning

ARGUX follows Semantic Versioning: `MAJOR.MINOR.PATCH`

| Component | When to increment |
|-----------|------------------|
| MAJOR | Breaking changes, major UI overhaul |
| MINOR | New module or major feature (e.g., Vehicles module) |
| PATCH | Bug fixes, small improvements, additional pages |

## Release Checklist

1. Ensure all changes are committed
2. Update version in:
   - `config/app.php` → `'version'`
   - `resources/js/components/layout/Sidebar.tsx` → version display
3. Update `CHANGELOG.md` with version entry
4. Create git tag: `git tag -a v0.x.y -m "description"`
5. Push tag: `git push origin v0.x.y`
6. Build production assets: `npm run build`

## Version Locations

| File | Field |
|------|-------|
| `config/app.php` | `'version' => '0.4.3'` |
| `Sidebar.tsx` | `ARGUX v0.4.3` |
| `CHANGELOG.md` | `## 0.4.3 - YYYY-MM-DD` |
| `README.md` | Version badge and footer |

## Version History

See [CHANGELOG.md](../CHANGELOG.md) for the complete history from v0.1.0 to current.

Current: **0.4.3** (19 releases)
