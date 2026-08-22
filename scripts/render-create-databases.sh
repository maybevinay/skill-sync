#!/bin/sh
set -eu

export PGSSLMODE="${PGSSLMODE:-require}"
export PGPASSWORD="${DB_PASSWORD:?DB_PASSWORD is required}"

HOST="${POSTGRES_HOST:?POSTGRES_HOST is required}"
PORT="${POSTGRES_PORT:-5432}"
USER="${DB_USERNAME:?DB_USERNAME is required}"
ADMIN_DB="${POSTGRES_DB:-postgres}"

create_db() {
  name="$1"
  exists="$(psql -h "$HOST" -p "$PORT" -U "$USER" -d "$ADMIN_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='${name}'" | tr -d '[:space:]')"
  if [ "$exists" != "1" ]; then
    echo "Creating database ${name}"
    psql -h "$HOST" -p "$PORT" -U "$USER" -d "$ADMIN_DB" -c "CREATE DATABASE ${name};"
  else
    echo "Database ${name} already exists"
  fi
}

create_db skillsync_auth
create_db skillsync_matching
create_db skillsync_ai
