#!/bin/bash
set -e

echo "=============================="
echo "⚡ BUILD: Fast rebuild"
echo "=============================="

echo "📡 Ensuring containers are running..."
docker compose up -d

echo "🧹 Clearing caches..."
docker compose exec cli php artisan optimize:clear

echo "⚙️ Re-optimizing..."
docker compose exec cli php artisan optimize

echo "🗄️ Running migrations and seeds..."
docker compose exec cli php artisan migrate:fresh --seed


echo "⚙️ Reload PHP Octane..."
docker compose exec app php artisan octane:reload

echo "🏗️ Building frontend..."
npm run build 

echo "=============================="
echo "✅ BUILD COMPLETE"
echo "=============================="