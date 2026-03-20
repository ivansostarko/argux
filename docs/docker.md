# Docker

## Setup

### Copy env
```bash
cp .env.example .env
```

### Build + start
```bash
docker compose up -d --build
```

### Install dependencies 
```bash
docker compose exec cli composer install
docker compose exec cli php artisan key:generate
```

### Node install
```bash
docker compose exec node npm install
docker compose exec node npm run build
```

### Migrate + seed
```bash
docker compose exec cli php artisan migrate
docker compose exec cli php artisan db:seed
docker compose exec cli php artisan migrate:fresh
```

### PHP Octane
```bash
docker compose exec app php artisan octane:reload
docker compose exec app php artisan octane:start --watch
docker compose exec app php  artisan octane:stop
docker compose exec app php  artisan octane:status
```

### Logs
```bash
docker compose logs --tail=100 -f app
docker compose logs --tail=100 -f cli
docker compose logs --tail=100 -f nginx
docker compose logs --tail=100 -f redis
```

### Docker Compose 
```bash
docker compose stop app
docker compose up -d app
```

### Remove all Docker files 
```bash
docker stop $(docker ps -qa); docker rm $(docker ps -qa); docker rmi -f $(docker images -qa); docker volume rm $(docker volume ls -q); docker network rm $(docker network ls -q)
```

### Docker Compose 
```bash
docker compose exec cli php artisan optimize
docker compose exec cli php artisan optimize:clear
docker compose exec cli php artisan config:cache
docker compose exec cli php artisan route:cache
docker compose exec cli php artisan event:cache
docker compose exec cli php artisan view:cache
docker compose exec cli php artisan reload

docker compose exec cli php artisan storage:link
docker compose exec cli php artisan install:api
docker compose exec cli php artisan install:broadcasting

docker compose exec cli php artisan serve & npm run build 




```