# Quick Start Guide - Video Transcoding Pipeline Docker Setup

## 📋 Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)
- AWS/Tigris credentials

## 🚀 Quick Start (5 minutes)

### 1. Configure Environment
```bash
cp .env.docker .env.local
# Edit .env.local with your credentials:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - AWS_ENDPOINT_URL_S3
# - BUCKET_NAME
```

### 2. Start Services
```bash
# Using Make (recommended)
make up

# Or using docker-compose directly
docker-compose up -d
```

### 3. Verify Services
```bash
make ps          # See running services
make health      # Check service health
make logs        # View logs
```

### 4. Test API
```bash
curl http://localhost:3000/health
```

## 📊 Common Tasks

### View Logs
```bash
make logs                 # All services
docker-compose logs -f server   # Server only
docker-compose logs -f worker   # Worker only
```

### Scale Workers
```bash
make scale WORKERS=4      # Scale to 4 workers
docker-compose ps         # Verify
```

### Check Queue Status
```bash
make queue
```

### Open Shell in Container
```bash
make shell               # Server shell
make shell-worker        # Worker shell
```

### Stop Services
```bash
make down
```

## 🏗️ Architecture

```
API Request → Express Server → BullMQ Queue → Redis
                                     ↓
                              Workers (3x) → FFmpeg
                                     ↓
                            Upload to S3/Tigris
                                     ↓
                              MongoDB (events)
```

## 📁 Key Files

- `Dockerfile` - Multi-stage build with FFmpeg
- `docker-compose.yml` - Main services definition
- `docker-compose.prod.yml` - Production configuration
- `.dockerignore` - Optimize build context
- `Makefile` - Quick commands
- `DOCKER_README.md` - Full documentation

## 🔧 Configuration Files

- `.env.docker` - Template with all env vars
- `.env.local` - Your actual credentials (git-ignored)
- `docker-compose.override.yml` - Development overrides (optional)

## 💾 Data Persistence

- Redis: `redis_data` volume
- MongoDB: `mongo_data` volume  
- Videos: `./videos` bind mount

## ⚠️ Important Notes

1. **First Run**: Services take 10-15 seconds to become healthy
2. **Credentials**: Update `.env.local` before starting
3. **Volumes**: Ensure `./videos` directory exists
4. **Network**: Services communicate via internal network
5. **Scaling**: Add more workers with `make scale WORKERS=N`

## 🚨 Troubleshooting

### Services won't start
```bash
make logs          # Check error messages
docker system prune # Free up space
```

### Can't connect to API
```bash
make health        # Check if services are running
docker-compose restart server
```

### Worker not processing jobs
```bash
make queue         # Check queue status
make logs          # View worker errors
```

### Out of memory
```bash
# Increase limits in docker-compose.yml
docker-compose down
# Edit deploy.resources.limits.memory
docker-compose up -d
```

## 📦 Deployment to Registry

```bash
# Tag and push to Docker Hub
docker tag transcoding-server:latest myregistry/transcoding:latest
docker push myregistry/transcoding:latest

# Or using make
make push REGISTRY=myregistry IMAGE_NAME=transcoding
```

## 🏭 Production Deployment

```bash
# Use production compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With environment variables
AWS_ACCESS_KEY_ID=xxx \
AWS_SECRET_ACCESS_KEY=yyy \
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📈 Monitoring

```bash
# Watch container stats
docker stats

# Monitor queue depth
watch -n 5 'make queue'

# Check logs in real-time
make logs

# Health check
watch -n 10 'make health'
```

## 🧹 Cleanup

```bash
# Stop services only
make down

# Stop and remove data
make clean

# Prune unused Docker resources
docker system prune -a --volumes
```

## 📚 Full Documentation

See `DOCKER_README.md` for comprehensive documentation.

## ✅ Success Checklist

- [ ] Environment variables configured
- [ ] Services starting without errors
- [ ] Health check passing
- [ ] API responding on localhost:3000
- [ ] Queue showing status
- [ ] Videos persisting to volume
- [ ] S3 connection working

Need help? Check the logs:
```bash
make logs
```
