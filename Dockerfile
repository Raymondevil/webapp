# Build and run the React Router/Cloudflare Worker bundle in Node 22. Wrangler
# 4.123 requires Node 22 or newer.
FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build && npm cache clean --force

EXPOSE 8080

# The app is only published on the Docker network/localhost; Cloudflare Tunnel
# handles the public HTTPS endpoint.
CMD ["npx", "wrangler", "dev", "--local", "--ip", "0.0.0.0", "--port", "8080"]
