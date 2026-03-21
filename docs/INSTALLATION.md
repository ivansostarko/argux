# Installation Guide

## Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| PHP | 8.3+ |
| Node.js | 20+ |
| Composer | 2.x |
| npm | 10+ |

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone git@github.com:your-org/argux.git
cd argux
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` as needed. See [ENVIRONMENT.md](ENVIRONMENT.md) for all variables.

### 5. Start Development Servers

```bash
# Terminal 1 — Laravel
php artisan serve

# Terminal 2 — Vite HMR
npm run dev
```

### 6. Access the Application

Open **http://localhost:8000/login**

Use any email/password combination — authentication is mocked.

## No Database Required

This application runs entirely without a database. All data is served from static TypeScript mock files in `resources/js/mock/`.

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Blank page | Ensure both `php artisan serve` and `npm run dev` are running |
| 404 on pages | Restart Vite — `import.meta.glob` needs restart for new `.tsx` files |
| CSS not loading | Check that `resources/css/app.css` imports are correct |
| TypeScript errors | Run `npx tsc --noEmit` to see all type issues |
