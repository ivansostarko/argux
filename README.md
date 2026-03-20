# ARGUX — Tactical Intelligence Platform

> High-fidelity mockup application built with Laravel 13 + Inertia.js + React 19 + TypeScript.

## Requirements

- PHP 8.3+
- Node.js 20+
- Composer 2.x

## Setup

```bash
# Install PHP dependencies
composer install

# Install frontend dependencies
npm install

# Copy environment file
cp .env.example .env
php artisan key:generate

# Run development server
php artisan serve &
npm run dev
```

Visit `http://localhost:8000/login` to see the authentication flow.

## Pages

| Route              | Page                |
|--------------------|---------------------|
| `/login`           | Operator Login      |
| `/register`        | Request Access      |
| `/2fa`             | Two-Factor Auth     |
| `/forgot-password` | Password Recovery   |

## Localization

Supported locales: `en` (English), `hr` (Croatian).

Switch via `POST /locale/{locale}`.

## Architecture

- **No database required** — all data is mocked.
- **Laravel** handles routing, validation, locale, and Inertia page rendering.
- **React** owns all UI rendering, state, and interactions.
- **TypeScript** strict mode for all frontend code.

## Version

Current: **0.1.0**
