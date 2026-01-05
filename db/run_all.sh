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
  read -r DB_HOST DB_NAME DB_USER DB_PASSWORD DB_SSLMODE DB_CHANNEL_BINDING < <(
    node -e "
      const { URL } = require('url');
      const url = new URL(process.env.DATABASE_URL);
      const sslmode = url.searchParams.get('sslmode') || 'require';
      const channelBinding = url.searchParams.get('channel_binding') || url.searchParams.get('channelBinding') || 'require';
      console.log(url.hostname, url.pathname.slice(1), url.username, url.password, sslmode, channelBinding);
    "
  )
fi

DB_HOST=${DB_HOST:-}
DB_NAME=${DB_NAME:-}
DB_USER=${DB_USER:-}
DB_PASSWORD=${DB_PASSWORD:-}
DB_SSLMODE=${DB_SSLMODE:-require}
DB_CHANNEL_BINDING=${DB_CHANNEL_BINDING:-require}

if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
  echo "Missing database connection settings. Provide DATABASE_URL or set DB_HOST, DB_NAME, DB_USER, DB_PASSWORD."
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"
PSQL_CONN="host=$DB_HOST dbname=$DB_NAME user=$DB_USER sslmode=$DB_SSLMODE channel_binding=$DB_CHANNEL_BINDING"

psql "$PSQL_CONN" -c "select current_database(), current_user;"

psql "$PSQL_CONN" -f "$(dirname "$0")/00_ddl.sql"
psql "$PSQL_CONN" -f "$(dirname "$0")/01_seed_auth.sql"
psql "$PSQL_CONN" -f "$(dirname "$0")/02_seed_media.sql"
psql "$PSQL_CONN" -f "$(dirname "$0")/03_seed_content_types.sql"
psql "$PSQL_CONN" -f "$(dirname "$0")/04_seed_dynamic_content.sql"
psql "$PSQL_CONN" -f "$(dirname "$0")/05_seed_permissions.sql"
psql "$PSQL_CONN" -f "$(dirname "$0")/99_reset_sequences.sql"

psql "$PSQL_CONN" -c "select 'users' as table, count(*) from users union all select 'roles', count(*) from roles union all select 'content_types', count(*) from content_types union all select 'fields', count(*) from fields union all select 'media', count(*) from media union all select 'ct_article', count(*) from ct_article union all select 'ct_product', count(*) from ct_product;"
