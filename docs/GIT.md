# Git Workflow

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable release branch |
| `develop` | Integration branch |
| `feature/*` | Feature branches |
| `fix/*` | Bug fix branches |
| `release/*` | Release preparation |

## Commit Conventions

Follow Conventional Commits:

```
feat: add vehicles datatable with photo thumbnails
fix: resolve TypeScript union type error in vehicle edit
refactor: extract VehiclePhotos into shared component
docs: add architecture documentation
style: separate vehicle CSS into dedicated file
chore: bump version to 0.4.3
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructure without behavior change |
| `docs` | Documentation only |
| `style` | CSS, formatting (no logic change) |
| `chore` | Build, config, version bumps |
| `test` | Test additions or fixes |

## Tagging

Every meaningful release gets a git tag:

```bash
git tag -a v0.25.7 -m "v0.25.7"
git push origin v0.25.7
```

## Pull Request Template

```markdown
## Summary
Brief description of changes.

## Changes
- List of specific changes

## Route/Page Impact
- New routes added
- Existing routes modified

## Version
- Bumped to: x.y.z
```

## Git Config
```bash
 git config --global user.name "Your Name"
 git config --global user.email you@example.com
 git commit --amend --reset-author
```