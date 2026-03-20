#!/bin/bash
set -e

echo "=============================="
echo "🚀 SETUP: Full environment bootstrap"
echo "=============================="

echo "🛑 Stopping containers..."
docker compose down

echo "🔨 Building containers..."
docker compose up -d --build

echo "⏳ Waiting for services..."
sleep 5

echo "📦 Installing PHP dependencies..."
docker compose exec cli composer install

echo "📦 Installing Node dependencies..."
docker compose exec node npm install

echo "🔑 Generating app key..."
docker compose exec cli php artisan key:generate || true

echo "🧹 Clearing caches..."
docker compose exec cli php artisan config:clear
docker compose exec cli php artisan route:clear
docker compose exec cli php artisan view:clear
docker compose exec cli php artisan cache:clear

echo "🗄️ Running migrations..."
docker compose exec cli php artisan migrate --force

echo "🔄 Restarting queues..."
docker compose exec cli php artisan queue:restart || true

echo "🔑 Fixing permissions..."
docker compose exec cli chmod -R 775 storage bootstrap/cache || true

echo "🏗️ Building frontend..."
docker compose exec node npm run build

echo "=============================="
echo "✅ SETUP COMPLETE"
echo "=============================="