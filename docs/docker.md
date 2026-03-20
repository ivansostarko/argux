# Docker

## Setup

*Copy env*
```bash
cp .env.example .env
```

*Build + start*
```bash
docker compose up -d --build
```

*Install dependencies (inside app container)*
```bash
docker compose exec cli composer install
docker compose exec cli php artisan key:generate

docker compose exec node npm install
docker compose exec node npm run build
```

4) Migrate + seed:
```bash
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
docker compose exec app php artisan migrate:fresh
```

*PHP Octane*
docker compose exec app php artisan octane:reload


5) Start Octane (already started by default):
- App: http://localhost:8000


*Logs*
docker compose logs --tail=100 -f app


docker compose stop app
docker compose up -d app


docker stop $(docker ps -qa); docker rm $(docker ps -qa); docker rmi -f $(docker images -qa); docker volume rm $(docker volume ls -q); docker network rm $(docker network ls -q)