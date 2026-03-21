# Authentication

## Overview

Authentication is fully mocked. No real credential validation occurs. Any email/password combination is accepted.

## Flows

### Login (`/login`)
- Email + password form
- "Remember me" checkbox
- Mock validation: requires non-empty email and password (6+ chars)
- Success: redirects to `/map`
- Particle background animation with hexagonal ARGUX logo

### Registration (`/register`)
- Name, email, password, confirm password
- Mock validation: email format, password match, 8+ chars
- Success: redirect to `/login` with flash message

### Two-Factor Authentication (`/2fa`)
- 6-digit TOTP code entry
- Method selection: Authenticator App / Email / SMS
- Backup code link
- Resend code action
- Any valid 6-digit code accepted

### Password Recovery (`/forgot-password`)
- Step 1: Enter email → sends mock reset code
- Step 2: Enter 6-digit verification code
- Step 3: Set new password + confirmation
- Multi-step flow with animated transitions

## Mock Credentials

Any credentials work. Example:
- Email: `operator@argux.mil`
- Password: `classified`

## Session

Sessions are Laravel default file-based sessions. No database session driver needed.

## Keycloak Integration (Planned)

Production version targets Keycloak SSO with OIDC/SAML, MFA enforcement, and RBAC. Current mockup simulates the UI flows without real Keycloak connectivity.
