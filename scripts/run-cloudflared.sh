#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${CLOUDFLARED_TUNNEL_TOKEN:-}" ]]; then
  echo "Define CLOUDFLARED_TUNNEL_TOKEN en /etc/fotoseltigre/cloudflared.env." >&2
  exit 1
fi

exec /usr/local/bin/cloudflared tunnel --no-autoupdate --protocol http2 run --token "$CLOUDFLARED_TUNNEL_TOKEN"
