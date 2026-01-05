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
    kill "$pid"
    echo "Stopped $(basename "$pid_file" .pid) (pid $pid)"
  else
    echo "Not running: $(basename "$pid_file" .pid)"
  fi
  rm -f "$pid_file"
done
