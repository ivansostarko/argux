# DOCKER

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
docker compose logs --tail=100 -f postgres
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

docker compose exec cli  php artisan route:clear

docker compose exec cli php artisan storage:link
docker compose exec cli php artisan install:api
docker compose exec cli php artisan install:broadcasting

docker compose exec cli php artisan serve & npm run build 

docker compose exec cli php artisan vendor:publish --provider="Fruitcake\LaravelDebugbar\ServiceProvider"

docker compose exec cli php -m | grep pgsql
```


# Docker Setup

## Development with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
      - "5173:5173"
    volumes:
      - .:/var/www/html
    environment:
      - APP_ENV=local
      - APP_DEBUG=true
    command: >
      sh -c "php artisan serve --host=0.0.0.0 &
             npm run dev -- --host 0.0.0.0"

  # No database service needed
```

## Dockerfile

```dockerfile
FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git curl unzip nodejs npm \
    && docker-php-ext-install pcntl

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0"]
```

## Production Container

For production, use a multi-stage build:
1. **Build stage**: Node.js for `npm run build`
2. **Runtime stage**: PHP-FPM + Nginx

## No Database Container

No MySQL, PostgreSQL, or Redis containers are needed. The application is fully self-contained.

## Kubernetes (Production Target)

Production deployment targets Kubernetes with:
- Horizontal pod autoscaling
- Persistent volumes for session storage
- ConfigMaps for environment variables
- Network policies for air-gap isolation



