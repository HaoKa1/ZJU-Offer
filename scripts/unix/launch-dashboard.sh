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
DOWNLOADS_DIR="$RUNTIME_DIR/downloads"
NODE_VERSION="24.14.0"
NODE_DIST_BASE_URL="https://nodejs.org/dist/v$NODE_VERSION"

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

normalize_path() {
  path_value=$1
  if [ -d "$path_value" ]; then
    CDPATH= cd -- "$path_value" 2>/dev/null && pwd
    return
  fi
  printf '%s\n' "$path_value"
}

download_file() {
  url=$1
  destination=$2
  temp_path="$destination.tmp"
  rm -f "$temp_path"

  if command -v curl >/dev/null 2>&1; then
    curl -fL "$url" -o "$temp_path"
  elif command -v wget >/dev/null 2>&1; then
    wget -O "$temp_path" "$url"
  else
    printf 'curl or wget is required to download Node on first launch.\n' >&2
    return 1
  fi

  mv "$temp_path" "$destination"
}

verify_archive_checksum() {
  archive_path=$1
  archive_name=$2
  shasums_path="$DOWNLOADS_DIR/SHASUMS256.txt"

  if [ ! -f "$shasums_path" ]; then
    download_file "$NODE_DIST_BASE_URL/SHASUMS256.txt" "$shasums_path"
  fi

  expected=$(grep " $archive_name\$" "$shasums_path" | awk '{print $1}' | head -n 1)
  if [ -z "$expected" ]; then
    printf 'Checksum entry for %s was not found.\n' "$archive_name" >&2
    return 1
  fi

  if command -v sha256sum >/dev/null 2>&1; then
    actual=$(sha256sum "$archive_path" | awk '{print $1}')
  elif command -v shasum >/dev/null 2>&1; then
    actual=$(shasum -a 256 "$archive_path" | awk '{print $1}')
  else
    printf 'sha256sum or shasum is required to verify Node download.\n' >&2
    return 1
  fi

  [ "$expected" = "$actual" ]
}

find_cached_node_runtime() {
  runtime_key=$(detect_runtime_key)
  target_dir="$RUNTIME_DIR/$runtime_key"

  if node_path=$(find_node_under "$target_dir"); then
    if node_is_compatible "$node_path"; then
      printf '%s\n' "$node_path"
      return 0
    fi
  fi

  return 1
}

ensure_bundled_node() {
  runtime_key=$(detect_runtime_key)
  target_dir="$RUNTIME_DIR/$runtime_key"
  archive_name="node-v$NODE_VERSION-$runtime_key.tar.gz"
  archive_path="$DOWNLOADS_DIR/$archive_name"

  if [ ! -f "$archive_path" ]; then
    mkdir -p "$DOWNLOADS_DIR"
    download_url="$NODE_DIST_BASE_URL/$archive_name"
    printf 'Downloading Node runtime from %s\n' "$download_url" >&2
    if ! download_file "$download_url" "$archive_path"; then
      rm -f "$archive_path"
      return 1
    fi
  fi

  if ! verify_archive_checksum "$archive_path" "$archive_name"; then
    rm -f "$archive_path"
    printf 'Downloaded Node runtime checksum did not match %s. Please retry.\n' "$archive_name" >&2
    return 1
  fi

  rm -rf "$target_dir"
  mkdir -p "$target_dir"
  tar -xzf "$archive_path" -C "$target_dir"

  if node_path=$(find_node_under "$target_dir"); then
    if node_is_compatible "$node_path"; then
      printf '%s\n' "$node_path"
      return 0
    fi
  fi

  printf 'Failed to locate node after extracting %s\n' "$archive_path" >&2
  exit 1
}

node_is_compatible() {
  node_path=$1
  [ -x "$node_path" ] || return 1
  version=$("$node_path" --version 2>/dev/null || true)
  major=$(printf '%s' "$version" | sed 's/^v//' | cut -d. -f1)
  [ "${major:-0}" -ge 24 ] 2>/dev/null
}

resolve_node() {
  if command -v node >/dev/null 2>&1 && node_is_compatible "$(command -v node)"; then
    command -v node
    return
  fi

  if node_path=$(find_cached_node_runtime); then
    printf '%s\n' "$node_path"
    return
  fi

  if node_path=$(ensure_bundled_node); then
    printf '%s\n' "$node_path"
    return
  fi

  printf '%s\n' "Node runtime not found. Connect to the internet for first launch, or install Node.js 24+ and make node available on PATH." >&2
  exit 1
}

is_alive() {
  [ -f "$PID_FILE" ] || return 1
  pid=$(sed -n '1p' "$PID_FILE" 2>/dev/null || true)
  [ -n "$pid" ] || return 1
  kill -0 "$pid" 2>/dev/null
}

is_healthy() {
  body=""
  if command -v curl >/dev/null 2>&1; then
    body=$(curl -fsS "$URL/api/health" 2>/dev/null || true)
  elif command -v wget >/dev/null 2>&1; then
    body=$(wget -qO- "$URL/api/health" 2>/dev/null || true)
  else
    return 1
  fi

  [ -n "$body" ] || return 1
  remote_root=$(printf '%s' "$body" | sed -n 's/.*"projectRoot"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
  [ -n "$remote_root" ] || return 1
  [ "$(normalize_path "$remote_root")" = "$(normalize_path "$PROJECT_ROOT")" ]
}

stop_port_process() {
  port=$1
  pid=""
  if command -v lsof >/dev/null 2>&1; then
    pid=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null | head -n 1 || true)
  elif command -v fuser >/dev/null 2>&1; then
    pid=$(fuser "$port"/tcp 2>/dev/null | awk '{print $1}' | head -n 1 || true)
  fi

  if [ -n "$pid" ]; then
    kill "$pid" 2>/dev/null || true
  fi
}

open_launching_page() {
  if [ "${OFFER_DASHBOARD_NO_OPEN:-0}" = "1" ]; then
    return
  fi

  launch_page="$PROJECT_ROOT/src/web/launching.html?root=$PROJECT_ROOT"
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$launch_page" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then
    open "$launch_page" >/dev/null 2>&1 &
  else
    printf 'Dashboard is running at %s\n' "$URL"
  fi
}

mkdir -p "$DATA_DIR"
mkdir -p "$DOWNLOADS_DIR"
open_launching_page

NODE_EXE=$(resolve_node)

if ! is_alive || ! is_healthy; then
  stop_port_process "$PORT"
  NODE_NO_WARNINGS=1 OFFER_DASHBOARD_AUTO_SHUTDOWN=1 PORT="$PORT" "$NODE_EXE" "$SERVER_SCRIPT" > "$DATA_DIR/server.out.log" 2> "$DATA_DIR/server.err.log" &
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

if ! is_healthy; then
  printf 'Dashboard server is still starting. Keep the launching page open.\n'
fi
