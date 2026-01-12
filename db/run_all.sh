#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "${DATABASE_URL:-}" ] && [ -f "$ROOT/.env" ]; then
  DATABASE_URL="$(
    node -e "
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join('$ROOT', '.env');
      const lines = fs.readFileSync(envPath, 'utf8').split(/\\r?\\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [key, ...rest] = trimmed.split('=');
        if (key === 'DATABASE_URL') {
          const value = rest.join('=').replace(/^['\"]|['\"]$/g, '');
          console.log(value);
          break;
        }
      }
    "
  )"
  export DATABASE_URL
fi

if [ -n "${DATABASE_URL:-}" ]; then
  read -r DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD DB_SSLMODE DB_CHANNEL_BINDING < <(
    node -e "
      const { URL } = require('url');
      const url = new URL(process.env.DATABASE_URL);
      const sslmode = url.searchParams.get('sslmode') || 'require';
      const channelBinding = url.searchParams.get('channel_binding') || url.searchParams.get('channelBinding') || 'require';
      console.log(url.hostname, url.port || '5432', url.pathname.slice(1), url.username, url.password, sslmode, channelBinding);
    "
  )
fi

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-devdb}
DB_USER=${DB_USER:-dev}
DB_PASSWORD=${DB_PASSWORD:-devpass}
DB_SSLMODE=${DB_SSLMODE:-require}
DB_CHANNEL_BINDING=${DB_CHANNEL_BINDING:-require}

export DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD DB_SSLMODE DB_CHANNEL_BINDING

exec "$ROOT/db/setup_db.sh"
