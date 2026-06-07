#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
SERVER_SCRIPT="$PROJECT_ROOT/src/server/server.mjs"
URL="http://127.0.0.1:4782"
DATA_DIR="$PROJECT_ROOT/data"
PID_FILE="$DATA_DIR/dashboard-server.pid"
PORT="${PORT:-4782}"
RUNTIME_DIR="$PROJECT_ROOT/runtime"
PACKAGES_DIR="$RUNTIME_DIR/packages"
NODE_VERSION="24.14.0"

detect_runtime_key() {
  os=$(uname -s 2>/dev/null | tr '[:upper:]' '[:lower:]')
  arch=$(uname -m 2>/dev/null | tr '[:upper:]' '[:lower:]')

  case "$os" in
    linux) os_key="linux" ;;
    darwin) os_key="darwin" ;;
    *)
      printf 'Unsupported operating system: %s\n' "$os" >&2
      exit 1
      ;;
  esac

  case "$arch" in
    x86_64|amd64) arch_key="x64" ;;
    arm64|aarch64) arch_key="arm64" ;;
    *)
      printf 'Unsupported CPU architecture: %s\n' "$arch" >&2
      exit 1
      ;;
  esac

  printf '%s-%s\n' "$os_key" "$arch_key"
}

find_node_under() {
  base_path=$1

  for candidate in \
    "$base_path/node" \
    "$base_path/bin/node" \
    "$base_path/node/bin/node"; do
    if [ -x "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  if [ -d "$base_path" ]; then
    candidate=$(find "$base_path" -type f -name node -perm -111 2>/dev/null | head -n 1 || true)
    if [ -n "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  fi

  return 1
}

ensure_bundled_node() {
  runtime_key=$(detect_runtime_key)
  target_dir="$RUNTIME_DIR/$runtime_key"
  archive_path="$PACKAGES_DIR/node-v$NODE_VERSION-$runtime_key.tar.gz"

  if node_path=$(find_node_under "$target_dir"); then
    printf '%s\n' "$node_path"
    return 0
  fi

  if [ ! -f "$archive_path" ]; then
    return 1
  fi

  mkdir -p "$target_dir"
  tar -xzf "$archive_path" -C "$target_dir"

  if node_path=$(find_node_under "$target_dir"); then
    printf '%s\n' "$node_path"
    return 0
  fi

  printf 'Failed to locate node after extracting %s\n' "$archive_path" >&2
  exit 1
}

resolve_node() {
  if node_path=$(ensure_bundled_node); then
    printf '%s\n' "$node_path"
    return
  fi

  if command -v node >/dev/null 2>&1; then
    command -v node
    return
  fi

  printf '%s\n' "Node runtime not found. Put the official Node package in runtime/packages, or make node available on PATH." >&2
  exit 1
}

is_alive() {
  [ -f "$PID_FILE" ] || return 1
  pid=$(sed -n '1p' "$PID_FILE" 2>/dev/null || true)
  [ -n "$pid" ] || return 1
  kill -0 "$pid" 2>/dev/null
}

is_healthy() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsSI "$URL/api/health" 2>/dev/null | tr -d '\r' | grep -qi '^Access-Control-Allow-Origin: \*$'
    return
  fi

  if command -v wget >/dev/null 2>&1; then
    wget --server-response --spider "$URL/api/health" 2>&1 | tr -d '\r' | grep -qi '^  Access-Control-Allow-Origin: \*$'
    return
  fi

  return 1
}

open_browser() {
  if [ "${OFFER_DASHBOARD_NO_OPEN:-0}" = "1" ]; then
    return
  fi

  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then
    open "$URL" >/dev/null 2>&1 &
  else
    printf 'Dashboard is running at %s\n' "$URL"
  fi
}

NODE_EXE=$(resolve_node)
mkdir -p "$DATA_DIR"
mkdir -p "$PACKAGES_DIR"

if ! is_alive || ! is_healthy; then
  NODE_NO_WARNINGS=1 PORT="$PORT" "$NODE_EXE" "$SERVER_SCRIPT" > "$DATA_DIR/server.out.log" 2> "$DATA_DIR/server.err.log" &
  printf '%s\n' "$!" > "$PID_FILE"
fi

attempt=0
while [ "$attempt" -lt 30 ]; do
  if is_healthy; then
    break
  fi
  attempt=$((attempt + 1))
  sleep 0.25
done

open_browser
