# Deployment Guide

## Production Build

```bash
# Build optimized frontend assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Server Requirements

| Requirement | Specification |
|-------------|--------------|
| PHP | 8.3+ with extensions: mbstring, xml, ctype, json, tokenizer |
| Web Server | Nginx (recommended) or Apache |
| Node.js | 20+ (build only, not needed at runtime) |
| TLS | TLS 1.3 termination via Nginx |

## Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name argux.internal;
    root /var/www/argux/public;
    index index.php;

    ssl_certificate /etc/ssl/argux.crt;
    ssl_certificate_key /etc/ssl/argux.key;
    ssl_protocols TLSv1.3;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

## Air-Gap Deployment

ARGUX is designed for air-gapped environments:
- No external CDN or API dependencies
- All assets bundled locally via Vite
- Map tiles can be pre-cached and self-hosted
- AI models run on-premise via Ollama (production)

## Classification

All deployed instances must display: **ARGUX Surveillance Platform — CLASSIFIED // NOFORN**
