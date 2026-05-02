#!/bin/bash
# ─────────────────────────────────────────────────────────────
# setup.sh — First-time setup for Zorgati Voyage
# Usage: bash setup.sh
# ─────────────────────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[SETUP]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

log "🚀 Zorgati Voyage — First-time Setup"
echo "────────────────────────────────────"

# 1. Check Docker
if ! command -v docker &>/dev/null; then
  err "Docker is not installed. Install it from https://docs.docker.com/get-docker/"
fi
log "✓ Docker found: $(docker --version)"

# 2. Check Docker Compose
if ! command -v docker compose &>/dev/null; then
  err "Docker Compose is not installed."
fi
log "✓ Docker Compose found"

# 3. Create .env if missing
if [ ! -f backend/.env ]; then
  warn ".env not found — creating from .env.example"
  cp backend/.env.example backend/.env
  warn "⚠  Edit backend/.env and fill in MONGO_URI, JWT_SECRET before continuing"
  exit 0
else
  log "✓ backend/.env exists"
fi

# 4. Build images
log "📦 Building Docker images..."
docker compose build --no-cache

# 5. Start services
log "▶  Starting services..."
docker compose up -d

# 6. Wait for backend health
log "⏳ Waiting for backend to be healthy..."
RETRIES=15
until docker compose exec backend wget -qO- http://localhost:4000/api/health &>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -eq 0 ]; then
    err "Backend did not become healthy. Check logs: docker compose logs backend"
  fi
  sleep 3
done
log "✓ Backend is healthy"

# 7. Seed admin
log "🔑 Seeding admin account..."
docker compose exec backend node seedAdmin.js

log ""
log "✅ Setup complete!"
log "   Frontend : http://localhost"
log "   Backend  : http://localhost:4000/api"
log "   Admin    : username=admin / password=admin"
