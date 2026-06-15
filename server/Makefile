.PHONY: help build up down logs ps restart clean scale health queue shell push

help:
	@echo "Video Transcoding Pipeline - Docker Management"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Commands:"
	@echo "  build          Build Docker images"
	@echo "  up             Start all services"
	@echo "  down           Stop all services"
	@echo "  logs           View service logs (tail -f)"
	@echo "  ps             Show running services"
	@echo "  restart        Restart all services"
	@echo "  clean          Remove all containers and volumes"
	@echo "  scale          Scale workers (usage: make scale WORKERS=4)"
	@echo "  health         Check service health status"
	@echo "  queue          View transcoding queue status"
	@echo "  shell          Open bash shell in server"
	@echo "  shell-worker   Open bash shell in worker"
	@echo "  push           Push images to registry"
	@echo ""

build:
	docker-compose build

up: build
	docker-compose up -d
	@echo "Services started. Run 'make ps' to check status"

down:
	docker-compose down

logs:
	docker-compose logs -f

ps:
	docker-compose ps

restart:
	docker-compose restart
	@echo "Services restarted"

clean:
	@echo "WARNING: This will remove all containers and volumes!"
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "Cleanup complete"; \
	fi

scale:
	docker-compose up -d --scale worker=$(WORKERS)
	@docker-compose ps

health:
	@echo "Checking service health..."
	@docker-compose exec -T redis redis-cli PING && echo "✓ Redis OK" || echo "✗ Redis DOWN"
	@docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1 && echo "✓ MongoDB OK" || echo "✗ MongoDB DOWN"
	@curl -s http://localhost:3000/health >/dev/null 2>&1 && echo "✓ API Server OK" || echo "✗ API Server DOWN"

queue:
	docker-compose exec -T server node -e "const {Queue}=require('bullmq');const IORedis=require('ioredis');const redis=new IORedis({host:'redis',port:6379});const q=new Queue('transcoding_queue',{connection:redis});q.getJobCounts().then(c=>{console.log('Queue:',c);redis.disconnect();});"

shell:
	docker-compose exec server /bin/bash

shell-worker:
	docker-compose exec worker /bin/bash

push:
	docker push $(REGISTRY)/$(IMAGE_NAME):latest

.PHONY: build up down logs ps restart clean scale health queue shell push
