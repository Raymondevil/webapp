#!/usr/bin/env bash
set -euo pipefail

project_dir="/media/proyecto/webapp"
node_bin="/home/ram/.nvm/versions/node/v24.19.0/bin"
runtime_dir="$project_dir/.runtime"

export PATH="$node_bin:$PATH"
export XDG_CONFIG_HOME="$runtime_dir/config"
export WRANGLER_LOG_PATH="$runtime_dir/logs/wrangler.log"

mkdir -p "$runtime_dir/config" "$runtime_dir/logs" "$runtime_dir/wrangler"
cd "$project_dir"

# Build first so the worker runs the immutable production bundle, not Vite's
# development server. Local persistence keeps the D1 emulator data on disk.
npm run build
exec npm exec -- wrangler dev \
  --config build/server/wrangler.json \
  --local \
  --ip 127.0.0.1 \
  --port 8080 \
  --persist-to "$runtime_dir/wrangler"
