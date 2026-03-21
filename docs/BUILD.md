# Laravel Docker Workflow

## Overview

This project uses two scripts to manage the development lifecycle:

- **F5 → setup** → full environment bootstrap
- **F6 → build** → fast rebuild for daily development

---

## Setup (F5)

Runs `setup.sh`:

- Builds Docker containers
- Installs Composer dependencies
- Installs Node dependencies
- Generates Laravel app key
- Clears caches
- Runs migrations
- Fixes permissions
- Builds frontend

Use this:
- First time setup
- After dependency changes
- After Docker changes

---

## Build (F6)

Runs `build.sh`:

- Ensures containers are running
- Clears and rebuilds Laravel cache
- Runs migrations
- Builds frontend

Use this:
- Daily development
- After code changes

---

## Requirements

- Docker + Docker Compose
- VS Code

---

## Setup Instructions

```bash
chmod +x setup.sh build.sh