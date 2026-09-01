#!/usr/bin/env bash
set -euo pipefail

project_dir="/media/proyecto/webapp"
token="$(sed -n 's/.*--token \([^ ]*\).*/\1/p' "$project_dir/compose.yml")"

if [[ -z "$token" ]]; then
  echo "No hay un token de Cloudflare Tunnel configurado." >&2
  exit 1
fi

exec /usr/local/bin/cloudflared tunnel --no-autoupdate --protocol http2 run --token "$token"
