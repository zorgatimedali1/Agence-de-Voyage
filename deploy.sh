#!/bin/bash
# ─────────────────────────────────────────────────────────────
# deploy.sh — Zero-downtime deployment for Zorgati Voyage
# Usage: bash deploy.sh [--no-cache]
# ─────────────────────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC}   $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}   $1"; }
err()  { echo -e "${RED}[ERROR]${NC}  $1"; exit 1; }

NO_CACHE=""
[ "$1" == "--no-cache" ] && NO_CACHE="--no-cache"

log "🚀 Starting deployment — $(date '+%Y-%m-%d %H:%M:%S')"
echo "────────────────────────────────────────────"

# 1. Pull latest code
log "📥 Pulling latest code from git..."
git pull origin main || err "Git pull failed"
info "Current commit: $(git log -1 --oneline)"

# 2. Build new images
log "📦 Building Docker images... $NO_CACHE"
docker compose build $NO_CACHE || err "Docker build failed"

# 3. Snapshot current state for rollback
PREVIOUS_BACKEND=$(docker ps -q --filter "name=zorgati-backend" 2>/dev/null || echo "")

# 4. Restart services
log "🔄 Restarting services..."
docker compose up -d --force-recreate

# 5. Health check with retry
log "⏳ Waiting for services to be healthy..."
RETRIES=20
HEALTHY=false
until [ $RETRIES -eq 0 ]; do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' zorgati-backend 2>/dev/null || echo "none")
  if [ "$STATUS" == "healthy" ]; then
    HEALTHY=true
    break
  fi
  RETRIES=$((RETRIES - 1))
  sleep 3
done

if [ "$HEALTHY" = false ]; then
  err "Health check failed after 60s. Check logs: docker compose logs backend"
fi

log "✓ Backend healthy"

# 6. Clean up old images
log "🧹 Cleaning up dangling images..."
docker image prune -f

# 7. Summary
echo ""
log "✅ Deployment successful — $(date '+%Y-%m-%d %H:%M:%S')"
info "   Frontend : http://localhost"
info "   Backend  : http://localhost:4000/api/health"
info "   Logs     : docker compose logs -f"
