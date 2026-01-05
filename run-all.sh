#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT/.run/pids"
LOG_DIR="$ROOT/.run/logs"
SERVICES=(gateway auth content-type content media permission)

mkdir -p "$PID_DIR" "$LOG_DIR"

is_running() {
  local pid_file="$1"
  [ -f "$pid_file" ] || return 1
  local pid
  pid="$(cat "$pid_file")"
  kill -0 "$pid" 2>/dev/null
}

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  echo "Building services..."
  npm --prefix "$ROOT" run build
fi

for s in "${SERVICES[@]}"; do
  pid_file="$PID_DIR/$s.pid"
  if is_running "$pid_file"; then
    echo "$s: already running (pid $(cat "$pid_file"))"
    continue
  fi

  log_file="$LOG_DIR/$s.log"
  nohup node "$ROOT/dist/apps/$s/main.js" >"$log_file" 2>&1 &
  echo $! >"$pid_file"
  echo "$s: started (pid $(cat "$pid_file"))"
  sleep 1
done
