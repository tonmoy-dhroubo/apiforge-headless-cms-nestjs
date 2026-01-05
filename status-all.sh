#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT/.run/pids"

if [ ! -d "$PID_DIR" ]; then
  echo "No PID directory found."
  exit 0
fi

for pid_file in "$PID_DIR"/*.pid; do
  [ -f "$pid_file" ] || continue
  pid="$(cat "$pid_file")"
  if kill -0 "$pid" 2>/dev/null; then
    echo "$(basename "$pid_file" .pid): running (pid $pid)"
  else
    echo "$(basename "$pid_file" .pid): not running (stale pid $pid)"
  fi
done
