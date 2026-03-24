FROM dunglas/frankenphp:latest

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip curl ca-certificates bash \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*


RUN install-php-extensions \
    pdo_mysql \
    pdo_pgsql \
    pgsql \
    redis \
    pcntl \
    intl \
    zip \
    opcache \
    mongodb \
    exif \
    bcmath


COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

COPY docker/frankenphp/php.ini $PHP_INI_DIR/conf.d/99-loki.ini

RUN mkdir -p /app/storage /app/bootstrap/cache

EXPOSE 80 443 443/udp 2019