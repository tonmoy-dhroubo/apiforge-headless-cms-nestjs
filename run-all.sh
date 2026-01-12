#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT/.run/pids"
LOG_DIR="$ROOT/.run/logs"
SERVICES=(gateway auth content-type content media permission)

mkdir -p "$PID_DIR" "$LOG_DIR"

usage() {
  cat <<'EOF'
Usage: ./run-all.sh [--skip-build]

Starts all Apiforge NestJS services and writes logs to ./.run/logs.
Use SKIP_BUILD=1 or --skip-build to skip the build.
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

if [ "${1:-}" = "--skip-build" ]; then
  SKIP_BUILD=1
fi

is_running() {
  local pid_file="$1"
  [ -f "$pid_file" ] || return 1
  local pid
  pid="$(cat "$pid_file")"
  kill -0 "$pid" 2>/dev/null
}

printf "\nApiforge NestJS services\n"
printf "Logs: %s\n" "$LOG_DIR"
printf "Status: ./status-all.sh | Stop: ./stop-all.sh\n\n"

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  echo "Building services (set SKIP_BUILD=1 to skip)"
  npm --prefix "$ROOT" run build
else
  echo "Skipping build (SKIP_BUILD=1)"
fi

for s in "${SERVICES[@]}"; do
  pid_file="$PID_DIR/$s.pid"
  if is_running "$pid_file"; then
    printf "%-16s %s\n" "$s" "already running (pid $(cat "$pid_file"))"
    continue
  fi

  log_file="$LOG_DIR/$s.log"
  nohup node "$ROOT/dist/apps/$s/main.js" >"$log_file" 2>&1 &
  echo $! >"$pid_file"
  printf "%-16s %s\n" "$s" "started (pid $(cat "$pid_file"), log $log_file)"
  sleep 1
done
