#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT/.run/pids"
LOG_DIR="$ROOT/.run/logs"
SERVICES=(gateway auth content-type content media permission)

if [ ! -d "$PID_DIR" ]; then
  echo "No running services found (missing $PID_DIR)."
  exit 0
fi

printf "\nApiforge NestJS service status\n\n"

for s in "${SERVICES[@]}"; do
  pid_file="$PID_DIR/$s.pid"
  if [ ! -f "$pid_file" ]; then
    printf "%-16s %s\n" "$s" "not running"
    continue
  fi

  pid="$(cat "$pid_file")"
  if kill -0 "$pid" 2>/dev/null; then
    log_file="$LOG_DIR/$s.log"
    if [ -f "$log_file" ]; then
      printf "%-16s %s\n" "$s" "running (pid $pid, log $log_file)"
    else
      printf "%-16s %s\n" "$s" "running (pid $pid)"
    fi
  else
    printf "%-16s %s\n" "$s" "stale pid $pid"
  fi
done
