#!/bin/bash

# Docker Compose Helper Script for Video Transcoding Pipeline
# Usage: ./docker-scripts.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="transcoding"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Command functions
cmd_build() {
    log_info "Building Docker images..."
    docker-compose build
    log_info "Build complete!"
}

cmd_up() {
    log_info "Starting services..."
    docker-compose up -d
    log_info "Services started! Waiting for health checks..."
    sleep 5
    docker-compose ps
}

cmd_down() {
    log_info "Stopping services..."
    docker-compose down
    log_info "Services stopped!"
}

cmd_logs() {
    SERVICE=${2:-""}
    if [ -z "$SERVICE" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$SERVICE"
    fi
}

cmd_ps() {
    log_info "Running services:"
    docker-compose ps
}

cmd_restart() {
    SERVICE=${2:-""}
    if [ -z "$SERVICE" ]; then
        log_info "Restarting all services..."
        docker-compose restart
    else
        log_info "Restarting $SERVICE..."
        docker-compose restart "$SERVICE"
    fi
    log_info "Restart complete!"
}

cmd_clean() {
    log_warn "This will remove all containers, volumes, and data!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        log_info "Cleanup complete!"
    else
        log_info "Cleanup cancelled"
    fi
}

cmd_scale() {
    WORKERS=${2:-2}
    log_info "Scaling workers to $WORKERS instances..."
    docker-compose up -d --scale worker=$WORKERS
    docker-compose ps
}

cmd_health() {
    log_info "Checking service health..."
    
    # Check Redis
    if docker-compose exec -T redis redis-cli PING > /dev/null 2>&1; then
        log_info "✓ Redis is healthy"
    else
        log_error "✗ Redis is not responding"
    fi
    
    # Check MongoDB
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        log_info "✓ MongoDB is healthy"
    else
        log_error "✗ MongoDB is not responding"
    fi
    
    # Check API Server
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        log_info "✓ API Server is healthy"
    else
        log_error "✗ API Server is not responding"
    fi
}

cmd_queue() {
    log_info "Checking transcoding queue status..."
    docker-compose exec -T server node -e "
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const redis = new IORedis({ host: 'redis', port: 6379 });
const q = new Queue('transcoding_queue', { connection: redis });
q.getJobCounts().then(counts => {
    console.log('Queue Status:');
    console.log('  Waiting:', counts.wait || 0);
    console.log('  Active:', counts.active || 0);
    console.log('  Completed:', counts.completed || 0);
    console.log('  Failed:', counts.failed || 0);
    redis.disconnect();
});
" 2>/dev/null || log_error "Could not connect to queue"
}

cmd_shell() {
    SERVICE=${2:-"server"}
    log_info "Opening shell in $SERVICE container..."
    docker-compose exec "$SERVICE" /bin/bash
}

cmd_push() {
    REGISTRY=${2:-"docker.io"}
    IMAGE_NAME=${3:-"transcoding-app"}
    log_info "Pushing images to $REGISTRY/$IMAGE_NAME..."
    
    docker tag transcoding-server:latest $REGISTRY/$IMAGE_NAME:latest
    docker tag transcoding-worker:latest $REGISTRY/$IMAGE_NAME:worker
    
    docker push $REGISTRY/$IMAGE_NAME:latest
    docker push $REGISTRY/$IMAGE_NAME:worker
    
    log_info "Push complete!"
}

cmd_help() {
    cat << EOF
Video Transcoding Pipeline - Docker Management Script

Usage: $0 [command] [options]

Commands:
    build                   Build Docker images
    up                      Start all services
    down                    Stop all services
    logs [service]          View service logs (default: all)
    ps                      Show running services
    restart [service]       Restart services (default: all)
    clean                   Remove all containers and volumes (DESTRUCTIVE)
    scale [count]           Scale worker instances (default: 2)
    health                  Check health of all services
    queue                   View transcoding queue status
    shell [service]         Open shell in service (default: server)
    push [registry] [name]  Push images to registry
    help                    Show this help message

Examples:
    $0 up                   # Start services
    $0 logs worker          # View worker logs
    $0 scale 4              # Scale to 4 workers
    $0 shell server         # Open shell in API server
    $0 queue                # Check job queue status

EOF
}

# Main script
COMMAND=${1:-help}

case "$COMMAND" in
    build)      cmd_build ;;
    up)         cmd_up ;;
    down)       cmd_down ;;
    logs)       cmd_logs "$@" ;;
    ps)         cmd_ps ;;
    restart)    cmd_restart "$@" ;;
    clean)      cmd_clean ;;
    scale)      cmd_scale "$@" ;;
    health)     cmd_health ;;
    queue)      cmd_queue ;;
    shell)      cmd_shell "$@" ;;
    push)       cmd_push "$@" ;;
    help)       cmd_help ;;
    *)
        log_error "Unknown command: $COMMAND"
        cmd_help
        exit 1
        ;;
esac
