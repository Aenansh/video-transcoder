# Video Transcoder - Complete Setup & Workflow Documentation

A complete guide to understand, build, and deploy the Video Transcoder project from scratch.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Prerequisites](#prerequisites)
5. [Step-by-Step Setup](#step-by-step-setup)
6. [Project Structure](#project-structure)
7. [Core Components](#core-components)
8. [Workflow Explanation](#workflow-explanation)
9. [Configuration Guide](#configuration-guide)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Maintenance](#maintenance)

---

## Project Overview

**Purpose**: Transcode MP4 videos into HLS (HTTP Live Streaming) segments in different formats.

**Key Features**:
- Asynchronous video processing using job queues
- Multi-worker architecture for parallel processing
- S3/Tigris integration for cloud storage
- RESTful API for job submission
- Real-time monitoring and health checks
- MongoDB event tracking and logging

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT / API REQUESTS                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   Express Server (Port 3000)   │
        │   - User Authentication        │
        │   - Video Upload Handling      │
        │   - Job Submission             │
        └────────────┬───────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────┐
    │    BullMQ Queue (Job Manager)      │
    │    - Queue: transcoding_queue      │
    │    - State Management              │
    └────────────┬───────────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
        ▼                  ▼
    ┌─────────────┐   ┌──────────────┐
    │   Redis     │   │   MongoDB    │
    │ - Queue     │   │ - Events     │
    │ - Cache     │   │ - History    │
    │ - Sessions  │   │ - Analytics  │
    └──────┬──────┘   └──────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │   Worker Pool (Scalable)         │
    │  ┌──────────────────────────────┐│
    │  │ Worker 1                     ││
    │  │ - FFmpeg Transcoding         ││
    │  │ - Progress Tracking          ││
    │  └──────────────────────────────┘│
    │  ┌──────────────────────────────┐│
    │  │ Worker 2                     ││
    │  │ - FFmpeg Transcoding         ││
    │  │ - Progress Tracking          ││
    │  └──────────────────────────────┘│
    │  ┌──────────────────────────────┐│
    │  │ Worker N (Scale as needed)   ││
    │  └──────────────────────────────┘│
    └──────────┬───────────────────────┘
               │
               ▼
    ┌──────────────────────────────────┐
    │   FFmpeg Processing              │
    │  - Video Decoding                │
    │  - HLS Segmentation              │
    │  - Format Conversion             │
    │  - Bitrate Optimization          │
    └──────────┬───────────────────────┘
               │
               ▼
    ┌──────────────────────────────────┐
    │   S3 / Tigris (Cloud Storage)    │
    │  - HLS Segments Storage          │
    │  - Playlist Files (.m3u8)        │
    │  - Metadata Storage              │
    └──────────────────────────────────┘
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js 18 | JavaScript runtime |
| **Framework** | Express 5 | Web API framework |
| **Job Queue** | BullMQ | Job management and scheduling |
| **Cache/Session** | Redis 7 | In-memory data store |
| **Database** | MongoDB | Event and metadata storage |
| **Video Processing** | FFmpeg | Video transcoding engine |
| **Cloud Storage** | AWS S3 / Tigris | Object storage |
| **Authentication** | bcryptjs | Password hashing |
| **Containerization** | Docker | Container runtime |
| **Orchestration** | Docker Compose | Multi-container orchestration |
| **Package Manager** | npm | Node.js package management |

---

## Prerequisites

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended
- **OS**: Linux, macOS, or Windows (with WSL2)

### Software Requirements
```bash
# Required versions (minimum)
Docker >= 20.10
Docker Compose >= 2.0
Node.js >= 18 (for local development)
npm >= 9 (for local development)
```

### Cloud Credentials
- AWS/Tigris Access Key ID
- AWS/Tigris Secret Access Key
- S3 Bucket Name
- (Optional) MongoDB Atlas connection string

### Installation Verification
```bash
# Verify Docker
docker --version
docker-compose --version

# Verify Node.js (optional, only for local development)
node --version
npm --version
```

---

## Step-by-Step Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Aenansh/video-transcoder.git
cd video-transcoder
```

### Step 2: Navigate to Server Directory
```bash
cd server
```

The project is structured with the `server` directory containing all application code:
```
video-transcoder/
├── server/                 # Main application code
│   ├── index.js           # Express app entry point
│   ├── package.json       # Dependencies
│   ├── Dockerfile         # Container configuration
│   ├── docker-compose.yml # Service orchestration
│   ├── Makefile           # Helper commands
│   ├── .env.docker        # Environment template
│   ├── bullmq/            # Queue processing
│   │   ├── producer.js    # Job producer (Express routes)
│   │   └── worker.js      # Job consumer (FFmpeg worker)
│   ├── config/            # Configuration files
│   │   └── db.js          # MongoDB connection
│   ├── routes/            # API endpoints
│   │   ├── user.route.js  # User auth routes
│   │   └── video.route.js # Video upload routes
│   ├── controllers/       # Business logic
│   ├── models/            # Data schemas
│   └── utils/             # Helper functions
```

### Step 3: Configure Environment Variables
```bash
# Copy the template environment file
cp .env.docker .env.local

# Edit with your credentials
nano .env.local
# OR
vi .env.local
```

**Required Environment Variables** (in `.env.local`):
```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# AWS S3 / Tigris Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_ENDPOINT_URL_S3=https://s3.amazonaws.com
# For Tigris, use: https://fly.storage.tigris.dev
BUCKET_NAME=your-bucket-name

# MongoDB Configuration (Optional)
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Application Specific
JWT_SECRET=your_secret_key_here
```

### Step 4: Build Docker Images
```bash
# Build all service images
make build

# Or using docker-compose directly
docker-compose build
```

**What happens during build**:
1. Pulls base Node.js 18 image (bullseye-slim)
2. Installs build dependencies (FFmpeg, Python, build-essential)
3. Copies package files
4. Installs npm dependencies
5. Creates production stage with only runtime dependencies
6. Optimizes final image size using multi-stage build

### Step 5: Start Services
```bash
# Start all services (builds if not already built)
make up

# Or using docker-compose
docker-compose up -d

# View status
make ps

# Expected output:
# NAME                COMMAND                  SERVICE  STATUS
# transcoding-redis   redis-server --appen    redis    Up (healthy)
# transcoding-worker  node bullmq/worker.js    worker   Up
# transcoding-producer node bullmq/producer.js producer Up
```

**Service startup order** (managed by `depends_on`):
1. Redis starts first (required for all services)
2. Worker waits for Redis to be healthy
3. Producer waits for Redis to be healthy
4. Producer API becomes available on port 3000

### Step 6: Verify Services Health
```bash
# Check all services
make health

# Expected output:
# Checking service health...
# ✓ Redis OK
# ✓ MongoDB OK
# ✓ API Server OK
```

### Step 7: Test the API
```bash
# Health check endpoint
curl http://localhost:3000/health

# Expected response (200 OK):
# {"status": "ok", "timestamp": "2026-06-16T10:30:00Z"}
```

---

## Project Structure

```
video-transcoder/
│
├── server/                           # Main application directory
│   │
│   ├── index.js                      # Express app initialization
│   │                                 # - Loads environment
│   │                                 # - Connects to MongoDB
│   │                                 # - Mounts routes
│   │
│   ├── package.json                  # Dependencies (Express, BullMQ, AWS SDK, etc.)
│   ├── package-lock.json             # Locked dependency versions
│   │
│   ├── Dockerfile                    # Multi-stage build config
│   │                                 # - Builder stage: installs build deps
│   │                                 # - Production stage: minimal runtime
│   │                                 # - Health checks
│   │
│   ├── docker-compose.yml            # Service orchestration
│   │                                 # - Redis service
│   │                                 # - Worker service
│   │                                 # - Producer service
│   │
│   ├── Makefile                      # Helper commands (build, up, down, etc.)
│   │
│   ├── .dockerignore                 # Files to exclude from Docker context
│   │
│   ├── .env.docker                   # Environment variable template
│   ├── .env.local                    # Actual credentials (git-ignored)
│   │
│   ├── bullmq/                       # Job queue processing
│   │   ├── producer.js               # Express server + queue producer
│   │   │                             # - User endpoints: /api/v1/users
│   │   │                             # - Video endpoints: /api/v1/videos
│   │   │                             # - Enqueues transcoding jobs
│   │   │
│   │   └── worker.js                 # Queue consumer + FFmpeg executor
│   │                                 # - Processes jobs from queue
│   │                                 # - Executes FFmpeg commands
│   │                                 # - Uploads to S3/Tigris
│   │                                 # - Updates MongoDB with events
│   │
│   ├── config/                       # Configuration modules
│   │   ├── db.js                     # MongoDB connection logic
│   │   └── s3.js                     # AWS S3 client initialization
│   │
│   ├── routes/                       # API route handlers
│   │   ├── user.route.js             # POST /api/v1/users/register
│   │   │                             # POST /api/v1/users/login
│   │   │                             # GET /api/v1/users/profile
│   │   │
│   │   └── video.route.js            # POST /api/v1/videos/upload
│   │                                 # GET /api/v1/videos/:id
│   │                                 # GET /api/v1/videos/:id/status
│   │                                 # GET /api/v1/videos/list
│   │
│   ├── controllers/                  # Business logic
│   │   ├── userController.js         # User auth logic
│   │   └── videoController.js        # Video upload/transcoding logic
│   │
│   ├── models/                       # MongoDB schemas
│   │   ├── User.js                   # User schema (email, password, etc.)
│   │   ├── Video.js                  # Video schema (metadata, status, etc.)
│   │   └── TranscodingJob.js         # Job schema (queue tracking)
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── auth.js                   # JWT authentication middleware
│   │   └── errorHandler.js           # Error handling middleware
│   │
│   ├── utils/                        # Helper functions
│   │   ├── env.js                    # Environment variable loading
│   │   ├── logger.js                 # Logging utility
│   │   ├── ffmpeg.js                 # FFmpeg execution helpers
│   │   └── s3-upload.js              # S3 upload helpers
│   │
│   ├── videos/                       # Local volume mount for videos
│   │   ├── inputs/                   # Input video files (mounted from client)
│   │   └── outputs/                  # HLS output segments
│   │
│   └── transcoder.sh                 # Shell script for FFmpeg commands
│
├── .gitignore                        # Git ignored files (.env.local, node_modules, etc.)
├── README.md                         # Quick start guide
└── SETUP_DOCUMENTATION.md            # This comprehensive guide
```

---

## Core Components

### 1. Express Server (Producer)

**File**: `bullmq/producer.js`

**Responsibilities**:
- Listen for API requests on port 3000
- Authenticate users (JWT/bcrypt)
- Receive video upload files
- Create transcoding jobs in the queue
- Return job IDs to client
- Serve video status and metadata

**Key Routes**:
```javascript
POST   /api/v1/users/register    - Create new user
POST   /api/v1/users/login       - Authenticate user
GET    /api/v1/users/profile     - Get user info

POST   /api/v1/videos/upload     - Upload video (creates job)
GET    /api/v1/videos/:id        - Get video metadata
GET    /api/v1/videos/:id/status - Get transcoding status
GET    /api/v1/videos/list       - List user's videos
```

### 2. BullMQ Queue

**Technology**: BullMQ (Node.js job queue library)
**Backend**: Redis

**How it works**:
1. Producer creates job → Adds to Redis queue
2. Workers poll the queue
3. Worker processes job → Updates Redis with progress
4. Worker completes/fails job → Removes from queue
5. Client polls status endpoint → Gets real-time progress

**Job Structure**:
```javascript
{
  videoId: "unique-video-id",
  userId: "owner-user-id",
  inputPath: "/path/to/input.mp4",
  outputPath: "/path/to/output/",
  formats: ["1080p", "720p", "480p"],
  status: "pending|processing|completed|failed",
  progress: 0-100,
  startTime: timestamp,
  endTime: timestamp
}
```

### 3. Worker Service

**File**: `bullmq/worker.js`

**Responsibilities**:
- Poll Redis queue for jobs
- Download video from S3/Tigris (if cloud-stored)
- Execute FFmpeg transcoding commands
- Track progress and update Redis
- Upload HLS segments to S3/Tigris
- Log events to MongoDB
- Handle job failures and retries

**FFmpeg Transcoding Process**:
```bash
# Input: MP4 file
ffmpeg -i input.mp4 \
  -c:v libx264 \                    # Video codec: H.264
  -preset medium \                  # Encoding speed vs quality
  -b:v 2000k \                      # Bitrate: 2 Mbps
  -c:a aac \                        # Audio codec: AAC
  -b:a 128k \                       # Audio bitrate
  -hls_time 10 \                    # Segment duration: 10s
  -hls_list_size 0 \                # Keep all segments in playlist
  -hls_segment_filename "segment-%d.ts" \
  output.m3u8                       # Output: HLS playlist

# Result: Multiple .ts files + .m3u8 playlist
```

### 4. Redis

**Port**: 6379 (internal)

**Storage**:
- Queue data structure (lists, sorted sets)
- Job state (pending, active, completed, failed)
- Job progress tracking
- Session cache
- Rate limiting data

**Volume**: `redis_data` (persistent storage with AOF - Append Only File)

### 5. MongoDB

**Purpose**: Event tracking and historical data
**Collections**:
- `users` - User accounts and auth
- `videos` - Video metadata
- `transcodingjobs` - Job history
- `events` - Audit logs
- `hls_segments` - Output metadata

### 6. S3 / Tigris Storage

**Configuration**:
```javascript
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  endpoint: process.env.AWS_ENDPOINT_URL_S3
});
```

**Upload Structure**:
```
bucket-name/
├── videos/
│   ├── {videoId}/
│   │   ├── playlist.m3u8
│   │   ├── segment-0.ts
│   │   ├── segment-1.ts
│   │   └── segment-N.ts
│   └── {videoId2}/...
└── metadata/
    └── {videoId}.json
```

---

## Workflow Explanation

### Complete Video Transcoding Workflow

```
┌─ USER ACTION ─────────────────────────────────────────────────┐
│ 1. User uploads MP4 file via POST /api/v1/videos/upload       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─ EXPRESS SERVER (Producer) ────────────────────────────────┐
│ 2. Receive multipart/form-data (video file + metadata)     │
│ 3. Validate file (size, format, type)                      │
│ 4. Save to ./videos/inputs/ or S3                          │
│ 5. Create database record in MongoDB (status: pending)     │
│ 6. Create job object with video metadata                   │
│ 7. Add job to BullMQ queue → Redis                         │
│ 8. Return jobId to client (201 Created)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─ REDIS QUEUE ──────────────────────────────────────────────┐
│ 9. Job stored in queue (state: pending)                    │
│ 10. Available for worker consumption                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─ WORKER POOL (BullMQ Consumer) ────────────────────────┐
│ 11. Worker picks up job from queue                      │
│ 12. Update Redis (state: processing, progress: 0%)     │
│ 13. Download video file (if not local)                 │
│ 14. Start FFmpeg transcoding process                   │
│    - Monitor stdout for progress                        │
│    - Extract duration: FFmpeg outputs frame info        │
│    - Calculate: (processed_frames / total_frames) * 100│
│    - Update Redis progress every 10%                   │
│ 15. Poll progress endpoint for status updates           │
│ 16. For each format (1080p, 720p, 480p):              │
│    - Run separate FFmpeg with specific bitrate         │
│    - Generate HLS segments (.ts files)                 │
│    - Generate playlist file (.m3u8)                    │
│ 17. Upload all segments to S3/Tigris                   │
│ 18. Update MongoDB with completion details             │
│ 19. Mark job as completed in Redis                     │
│ 20. Log event to MongoDB (success)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─ CLIENT STATUS CHECK ────────────────────────────────────┐
│ 21. Client polls GET /api/v1/videos/{videoId}/status   │
│ 22. Returns current status and progress                │
│ 23. Once complete (status: completed):                 │
│    - Provides S3/Tigris playlist URL                   │
│    - Ready for HLS playback                            │
└────────────────────────────────────────────────────────────┘

TIMING:
- Upload: ~1-5 minutes (depends on file size)
- Transcoding: ~2-10x real-time (FFmpeg performance)
  - 5 minute video @ 2x speed = 2.5 minutes
  - Total for 3 formats = ~7-8 minutes
- S3 Upload: ~1-2 minutes (depends on bandwidth)
Total: ~10-20 minutes for typical video
```

### Example API Flow

```bash
# 1. Register User
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
# Response: { "userId": "user123", "token": "jwt..." }

# 2. Upload Video
curl -X POST http://localhost:3000/api/v1/videos/upload \
  -H "Authorization: Bearer jwt_token" \
  -F "video=@myfile.mp4" \
  -F "title=My Video"
# Response: { "videoId": "vid123", "jobId": "job456", "status": "queued" }

# 3. Check Status (poll every 5 seconds)
curl -X GET http://localhost:3000/api/v1/videos/vid123/status \
  -H "Authorization: Bearer jwt_token"
# Response: { 
#   "status": "processing", 
#   "progress": 45,
#   "formats": [
#     { "format": "1080p", "progress": 45 },
#     { "format": "720p", "progress": 25 },
#     { "format": "480p", "progress": 0 }
#   ]
# }

# 4. Once complete
# Response: {
#   "status": "completed",
#   "progress": 100,
#   "outputs": {
#     "1080p": "https://s3-url/videos/vid123/1080p/playlist.m3u8",
#     "720p": "https://s3-url/videos/vid123/720p/playlist.m3u8",
#     "480p": "https://s3-url/videos/vid123/480p/playlist.m3u8"
#   }
# }
```

---

## Configuration Guide

### Docker Compose Services

#### Redis Service
```yaml
redis:
  image: redis:7-alpine                    # Latest stable Redis
  container_name: transcoding-redis        # Unique name
  ports:
    - "6379:6379"                          # Expose for debugging
  command: redis-server --appendonly yes   # AOF persistence
  volumes:
    - redis_data:/data                     # Persistent volume
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]     # Health check
    interval: 10s
    timeout: 5s
    retries: 5
  networks:
    - transcoding-network                  # Internal network
  restart: unless-stopped                  # Auto-restart on failure
```

#### Worker Service
```yaml
worker:
  build:
    context: .                             # Build from current dir
    dockerfile: Dockerfile                 # Use Dockerfile
  container_name: transcoding-worker       # Unique name
  environment:                             # Pass env vars
    - REDIS_URL=redis://redis:6379
    - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
    - AWS_ENDPOINT_URL_S3=${AWS_ENDPOINT_URL_S3}
    - BUCKET_NAME=${BUCKET_NAME}
  command: node bullmq/worker.js           # Start command
  depends_on:
    redis:
      condition: service_healthy           # Wait for Redis to be healthy
  volumes:
    - ./videos:/home/app/videos            # Bind mount for I/O
  networks:
    - transcoding-network
  restart: unless-stopped
  deploy:
    resources:
      limits:
        cpus: '1'                          # CPU limit: 1 core
        memory: 2G                         # Memory limit: 2GB
      reservations:
        cpus: '0.5'                        # CPU reserved: 0.5 cores
        memory: 1G                         # Memory reserved: 1GB
```

#### Producer Service
```yaml
producer:
  build:
    context: .
    dockerfile: Dockerfile
  container_name: transcoding-producer
  environment:
    - REDIS_URL=redis://redis:6379
    - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
    - PORT=3000                            # API port
  command: node bullmq/producer.js         # Start Express server
  depends_on:
    redis:
      condition: service_healthy
  networks:
    - transcoding-network
  restart: unless-stopped
  ports:
    - "3000:3000"                          # Expose API port
```

### Environment Variables Reference

```bash
# ==== SERVER ====
NODE_ENV=production                    # Node environment
PORT=3000                              # API port

# ==== REDIS ====
REDIS_HOST=redis                       # Redis hostname (Docker network)
REDIS_PORT=6379                        # Redis port
REDIS_URL=redis://redis:6379           # Full Redis URL
REDIS_PASSWORD=                        # (Optional) Redis auth

# ==== AWS S3 / TIGRIS ====
AWS_ACCESS_KEY_ID=                     # Your access key
AWS_SECRET_ACCESS_KEY=                 # Your secret key
AWS_REGION=us-east-1                   # AWS region
AWS_ENDPOINT_URL_S3=https://s3.amazonaws.com
# For Tigris: https://fly.storage.tigris.dev
AWS_ENDPOINT_URL_IAM=https://iam.amazonaws.com
BUCKET_NAME=                           # S3 bucket name

# ==== MONGODB ====
DATABASE_URL=                          # MongoDB connection string
# Local: mongodb://mongodb:27017/transcoding
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dbname

# ==== APPLICATION ====
JWT_SECRET=your_super_secret_key       # JWT signing secret
JWT_EXPIRY=7d                          # Token expiry time
LOG_LEVEL=info                         # Logging level
```

### Scaling Configuration

**Scale Workers** (for higher throughput):
```bash
# Scale to 5 worker instances
make scale WORKERS=5

# Docker Compose command
docker-compose up -d --scale worker=5

# Verify
docker-compose ps
```

**Memory/CPU Limits**:
```yaml
# In docker-compose.yml
worker:
  deploy:
    resources:
      limits:
        cpus: '2'              # Increase for faster transcoding
        memory: 4G             # Increase for larger videos
      reservations:
        cpus: '1'
        memory: 2G
```

---

## Deployment

### Local Development Deployment

```bash
# 1. Clone and navigate
git clone https://github.com/Aenansh/video-transcoder.git
cd video-transcoder/server

# 2. Configure
cp .env.docker .env.local
# Edit .env.local with your credentials

# 3. Build and start
make build
make up

# 4. Verify
make health
make ps
```

### Production Deployment to Docker Hub

```bash
# 1. Build image
docker build -t your-registry/transcoding:1.0.0 .

# 2. Tag as latest
docker tag your-registry/transcoding:1.0.0 your-registry/transcoding:latest

# 3. Push to registry
docker login
docker push your-registry/transcoding:1.0.0
docker push your-registry/transcoding:latest

# 4. Deploy on production server
ssh production-server
docker pull your-registry/transcoding:latest
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Production Compose File

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  redis:
    restart: always
    healthcheck:
      retries: 10

  worker:
    restart: always
    deploy:
      replicas: 3  # 3 worker instances
      resources:
        limits:
          cpus: '2'
          memory: 4G

  producer:
    restart: always
    environment:
      - LOG_LEVEL=warn
      - NODE_ENV=production
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
make logs

# Common issues:
# 1. Port 3000 already in use
lsof -i :3000
# Kill process: kill -9 <PID>

# 2. Low disk space
df -h
# Clean up: docker system prune -a

# 3. Permission issues
chmod +x transcoder.sh
sudo chown -R 1000:1000 ./videos
```

### Worker Not Processing Jobs

```bash
# Check queue status
make queue

# Restart worker
docker-compose restart worker

# Check worker logs
docker-compose logs -f worker

# Verify Redis connection
make health
```

### Can't Connect to API

```bash
# Verify producer is running
make ps

# Check API health
curl http://localhost:3000/health

# Check logs
docker-compose logs -f producer

# Restart producer
docker-compose restart producer
```

### FFmpeg Errors

```bash
# Check worker logs for FFmpeg errors
docker-compose logs -f worker | grep -i ffmpeg

# Common FFmpeg issues:
# - Unsupported codec → Check input file format
# - Out of memory → Reduce quality or scale workers
# - Timeout → Increase timeout in worker.js

# Test FFmpeg directly
docker-compose exec worker ffmpeg -version
```

### Out of Memory

```bash
# Check resource usage
docker stats

# Increase limits in docker-compose.yml
# Restart services
docker-compose down
docker-compose up -d

# Or scale differently
make scale WORKERS=2  # Reduce concurrent jobs
```

### MongoDB Connection Issues

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string
echo $DATABASE_URL

# Test connection
docker-compose exec worker mongosh "$DATABASE_URL"
```

---

## Maintenance

### Regular Maintenance Tasks

#### Daily
```bash
# Monitor queue depth
watch -n 5 'make queue'

# Monitor resource usage
watch -n 10 'docker stats'

# Check logs for errors
make logs | grep -i error
```

#### Weekly
```bash
# Backup Redis data
docker-compose exec redis redis-cli BGSAVE

# Backup MongoDB
docker-compose exec mongodb mongodump --out /backup/$(date +%Y%m%d)

# Check disk usage
du -sh ./videos

# Clean old video files (> 30 days)
find ./videos -mtime +30 -delete
```

#### Monthly
```bash
# Update Docker images
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d

# Review logs and errors
docker-compose logs --tail 1000 | grep -i error > /tmp/errors.log

# Optimize database
docker-compose exec mongodb mongosh << EOF
use transcoding
db.videos.reIndex()
db.transcodingjobs.deleteMany({status: "failed", createdAt: {$lt: new Date(Date.now() - 30*24*60*60*1000)}})
EOF
```

### Backup and Recovery

```bash
# Backup all volumes
docker-compose exec -T redis redis-cli BGSAVE
docker run --rm -v redis_data:/data -v /backup:/backup \
  alpine tar czf /backup/redis_data.tar.gz /data

# Backup MongoDB
docker-compose exec -T mongodb mongodump --archive=/backup/mongo_backup.archive

# Restore Redis
docker run --rm -v redis_data:/data -v /backup:/backup \
  alpine tar xzf /backup/redis_data.tar.gz -C /

# Restore MongoDB
docker-compose exec -T mongodb mongorestore --archive=/backup/mongo_backup.archive
```

### Performance Optimization

```bash
# 1. Tune Redis
docker-compose exec redis redis-cli CONFIG SET maxmemory 2gb
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru

# 2. Optimize FFmpeg
# In worker.js, adjust:
# - preset: ultrafast (speed) vs veryslow (quality)
# - bitrates: lower for faster encoding
# - segments: longer segments = less overhead

# 3. Scale workers based on load
watch 'make queue'  # Monitor depth
make scale WORKERS=10  # Scale up if queue grows

# 4. Monitor and alert
# Set up Prometheus scraping and Grafana dashboards
# Alert when queue depth > 100
```

---

## Rebuilding from Scratch

If you ever need to recreate this project, follow these sequential steps:

### 1. **Project Setup**
```bash
mkdir video-transcoder && cd video-transcoder
npm init -y
npm install express dotenv bullmq ioredis mongoose
```

### 2. **Create Directory Structure**
```bash
mkdir -p server/{bullmq,config,routes,controllers,models,middleware,utils,videos/inputs,videos/outputs}
```

### 3. **Create Configuration Files**
- `Dockerfile` - Multi-stage build with FFmpeg
- `docker-compose.yml` - Redis, Worker, Producer services
- `.env.docker` - Environment template
- `Makefile` - Helper commands

### 4. **Implement Core Services**
- `bullmq/producer.js` - Express server
- `bullmq/worker.js` - Job consumer
- `config/db.js` - MongoDB connection
- `routes/user.route.js` - Auth endpoints
- `routes/video.route.js` - Video endpoints

### 5. **Build and Test**
- Run `make build && make up`
- Verify with `make health`
- Test API endpoints

### 6. **Deploy**
- Push to Docker registry
- Configure production environment variables
- Deploy with `docker-compose.prod.yml`

---

## Quick Reference

```bash
# Build
make build                    # Build images

# Lifecycle
make up                       # Start services
make down                     # Stop services
make restart                  # Restart services
make clean                    # Remove containers and volumes

# Monitoring
make ps                       # Show services
make logs                     # View logs
make health                   # Check health
make queue                    # View queue status

# Management
make shell                    # Access server shell
make shell-worker             # Access worker shell
make scale WORKERS=4          # Scale workers
make push REGISTRY=myregistry # Push to registry

# Troubleshooting
docker-compose logs -f [service]  # View specific service logs
docker system prune                # Free up space
```

---

## Additional Resources

- [BullMQ Documentation](https://docs.bullmq.io/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Express.js Guide](https://expressjs.com/)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)

---

**Last Updated**: 2026-06-16
**Version**: 1.0
**Author**: Aenansh (with comprehensive documentation)
