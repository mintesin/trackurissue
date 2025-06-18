# Docker Development Setup

This document explains how to use the Docker development environment for TrackurIssue with live reload capabilities.

## Overview

The development setup includes:
- **Backend**: Node.js with nodemon for live reload
- **Frontend**: React with Vite dev server for live reload
- **Database**: MongoDB for data storage
- **Cache**: Redis for caching
- **Volume Mounting**: Source code is mounted as volumes (not copied into containers)

## Files Structure

```
trackurissue/
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development setup
├── docker-compose.test.yml     # Testing setup
├── .env.dev                    # Development environment variables
├── backend/
│   ├── Dockerfile              # Production backend
│   └── Dockerfile.dev          # Development backend
└── frontend/
    ├── Dockerfile              # Production frontend
    └── Dockerfile.dev          # Development frontend
```

## Quick Start

### 1. Development Environment

Start the development environment with live reload:

```bash
# Using the development compose file
docker-compose -f docker-compose.dev.yml --env-file .env.dev up --build

# Or with detached mode
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d --build
```

**Services will be available at:**
- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

### 2. Testing Environment

Start the parallel testing environment:

```bash
# Start testing environment
docker-compose -f docker-compose.test.yml up --build

# Or with detached mode
docker-compose -f docker-compose.test.yml up -d --build
```

**Test services will be available at:**
- Frontend: http://localhost:5174
- Backend API: http://localhost:5001
- MongoDB: localhost:27018
- Redis: localhost:6380

### 3. Production Environment

Start the production environment:

```bash
# Using the production compose file
docker-compose up --build
```

## Live Reload Features

### Backend Live Reload
- **Tool**: nodemon
- **Watches**: All `.js` files in the backend directory
- **Restart**: Automatic on file changes
- **Logs**: Real-time in Docker logs

### Frontend Live Reload
- **Tool**: Vite dev server
- **Watches**: All source files in the frontend directory
- **Hot Reload**: Instant updates without page refresh
- **HMR**: Hot Module Replacement enabled

## Volume Mounting

The development setup uses volume mounting instead of copying code:

```yaml
volumes:
  - ./backend:/app          # Mount entire backend directory
  - /app/node_modules       # Preserve node_modules in container
  - ./frontend:/app         # Mount entire frontend directory
  - /app/node_modules       # Preserve node_modules in container
```

**Benefits:**
- ✅ Instant code changes without rebuilding
- ✅ Live reload works seamlessly
- ✅ Development tools work normally
- ✅ No need to rebuild containers for code changes

## Environment Variables

### Development (.env.dev)
```bash
NODE_ENV=development
MONGO_DB_NAME=trackurissue_dev
LOG_LEVEL=debug
REACT_APP_API_URL=http://localhost:5000
```

### Testing
```bash
NODE_ENV=test
MONGO_DB_NAME=trackurissue_test
PORT=5001
```

## Common Commands

### Development Workflow

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml --env-file .env.dev up

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down

# Rebuild specific service
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up backend

# Execute commands in running containers
docker-compose -f docker-compose.dev.yml exec backend npm test
docker-compose -f docker-compose.dev.yml exec frontend npm run lint
```

### Testing Workflow

```bash
# Start testing environment
docker-compose -f docker-compose.test.yml up

# Run specific tests
docker-compose -f docker-compose.test.yml exec backend-test npm run test:unit
docker-compose -f docker-compose.test.yml exec backend-test npm run test:integration

# View test logs
docker-compose -f docker-compose.test.yml logs -f backend-test
```

### Database Management

```bash
# Access MongoDB shell (development)
docker-compose -f docker-compose.dev.yml exec mongodb mongosh -u admin -p password123

# Access Redis CLI (development)
docker-compose -f docker-compose.dev.yml exec redis redis-cli -a redis123

# Reset development database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up
```

## Troubleshooting

### Port Conflicts
If ports are already in use, modify the port mappings in the compose files:

```yaml
ports:
  - "5001:5000"  # Change host port from 5000 to 5001
```

### Volume Issues
If you encounter permission issues with volumes:

```bash
# On Linux/Mac, fix permissions
sudo chown -R $USER:$USER ./backend ./frontend

# On Windows, ensure Docker has access to the drive
```

### Node Modules Issues
If node_modules cause issues, rebuild containers:

```bash
# Remove containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# Rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache

# Start fresh
docker-compose -f docker-compose.dev.yml up
```

### Live Reload Not Working

1. **Backend**: Check if nodemon is watching files:
   ```bash
   docker-compose -f docker-compose.dev.yml logs backend
   ```

2. **Frontend**: Ensure Vite dev server is running with correct host:
   ```bash
   docker-compose -f docker-compose.dev.yml logs frontend
   ```

3. **File Watching**: On some systems, you might need to enable polling:
   ```yaml
   # In docker-compose.dev.yml, add environment variable
   environment:
     CHOKIDAR_USEPOLLING: true
   ```

## Performance Tips

1. **Use .dockerignore**: Exclude unnecessary files from build context
2. **Layer Caching**: Package files are copied before source code for better caching
3. **Volume Performance**: Use named volumes for node_modules to improve performance
4. **Resource Limits**: Set appropriate memory and CPU limits for containers

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Code Mounting | Volume mounted | Copied into image |
| Live Reload | ✅ Enabled | ❌ Disabled |
| Source Maps | ✅ Enabled | ❌ Disabled |
| Minification | ❌ Disabled | ✅ Enabled |
| Debug Logs | ✅ Enabled | ❌ Disabled |
| Hot Reload | ✅ Enabled | ❌ Disabled |

## Next Steps

1. Start development environment
2. Make code changes and verify live reload
3. Run tests in parallel testing environment
4. Use production setup for deployment testing
