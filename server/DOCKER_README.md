# Docker Setup for Video Transcoding Pipeline

This guide explains how to run the video transcoding pipeline using Docker and Docker Compose.

## Prerequisites

- Docker Engine (20.10+)
- Docker Compose (2.0+)
- AWS/Tigris credentials for S3-compatible object storage

## Quick Start

### 1. Configure Environment Variables

Copy the template environment file:
```bash
cp .env.docker .env.local
```

Update `.env.local` with your actual credentials:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_ENDPOINT_URL_S3
- BUCKET_NAME

### 2. Start All Services

```bash
docker-compose up -d
```

This starts:
- **Redis** (Job queue) on port 6379
- **MongoDB** (Database) on port 27017
- **Server** (API) on port 3000
- **Worker** (Transcoding processor) - runs in background

### 3. Verify Services are Running

```bash
docker-compose ps
docker-compose logs -f
```

### 4. Test the API

```bash
curl http://localhost:3000/health
```

## Scaling the Worker

Run multiple transcoding workers to process jobs in parallel:

```bash
# Scale to 3 workers
docker-compose up -d --scale worker=3

# Check running workers
docker-compose ps
```

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f worker
docker-compose logs -f server
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart worker
```

### Stop Services
```bash
docker-compose down
```

### Remove All Data (Clean slate)
```bash
docker-compose down -v
```

## Production Deployment

For production, create a `.env.production` file with production-grade credentials:

```bash
# Use production-specific compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Worker Not Processing Jobs

Check logs:
```bash
docker-compose logs -f worker
```

Ensure Redis and MongoDB are healthy:
```bash
docker-compose logs redis
docker-compose logs mongodb
```

### Video Files Not Persisting

Verify volume mounts:
```bash
docker volume ls
docker volume inspect server_videos
```

### Out of Memory

Increase memory limits in `docker-compose.yml` worker service:
```yaml
deploy:
  resources:
    limits:
      memory: 4G
```

### S3 Connection Issues

Test S3 credentials:
```bash
docker-compose exec server node -e "
const AWS = require('@aws-sdk/client-s3');
const client = new AWS.S3Client({...});
client.send(new AWS.ListBucketsCommand({})).then(console.log);
"
```

## Development Mode

For local development with hot reload:

```bash
# Uses docker-compose.override.yml automatically
docker-compose up -d

# Watch logs
docker-compose logs -f server
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│          Client Requests                │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼────────┐
         │   API Server   │
         │   (Express)    │
         └────────┬───────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
   ┌──▼──┐   ┌───▼────┐  ┌──▼───┐
   │Redis│   │MongoDB │  │Worker│
   │Queue│   │        │  │      │
   └─────┘   └────────┘  └──┬───┘
                             │
                      ┌──────▼────────┐
                      │  FFmpeg       │
                      │  Transcoding  │
                      └───────┬───────┘
                              │
                         ┌────▼─────┐
                         │  S3/     │
                         │  Tigris  │
                         └──────────┘
```

## Performance Tuning

### Optimize FFmpeg for Docker
- Adjust `GOP` (Group of Pictures) size in transcoding settings
- Use hardware acceleration if available
- Adjust worker concurrency in `bullmq/worker.js`

### Memory Management
- Monitor memory usage: `docker stats`
- Adjust NODE_OPTIONS in Dockerfile
- Limit concurrent jobs per worker

### CPU Management
- Use `docker-compose.yml` deploy.resources to limit CPU
- Scale workers based on CPU availability

## Monitoring

### Check Service Health
```bash
docker-compose exec server curl http://localhost:3000/health
docker-compose exec redis redis-cli PING
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### View Queue Status
```bash
docker-compose exec server node -e "
const { Queue } = require('bullmq');
const q = new Queue('transcoding_queue', { host: 'redis' });
console.log(await q.getJobCounts());
"
```

## Security Considerations

- Change MongoDB default credentials in docker-compose.yml
- Use environment variables for sensitive data (not in .env files in version control)
- Use secrets management for production deployments
- Enable SSL/TLS for external S3 connections
- Restrict Redis access (no password by default)
- Use network policies to isolate services

## Next Steps

1. Implement health check endpoints in the API
2. Add monitoring/metrics collection (Prometheus)
3. Set up centralized logging (ELK stack)
4. Configure auto-scaling based on queue depth
5. Implement graceful shutdown handlers
