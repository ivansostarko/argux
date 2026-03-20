FROM dunglas/frankenphp:latest

WORKDIR /app

# System deps you will actually need in real Laravel projects.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip curl ca-certificates bash \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions commonly required by Laravel + Horizon/Queue + MySQL/Redis
# install-php-extensions is provided by FrankenPHP images. :contentReference[oaicite:3]{index=3}
RUN install-php-extensions \
    pdo_mysql \
    redis \
    pcntl \
    intl \
    zip \
    opcache \
    mongodb \
    pcntl \
    exif \
    bcmath

# Composer (copy binary from official composer image)
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# PHP configuration
COPY docker/frankenphp/php.ini $PHP_INI_DIR/conf.d/99-loki.ini

# Ensure storage writable in container contexts
RUN mkdir -p /app/storage /app/bootstrap/cache

EXPOSE 80 443 443/udp 2019