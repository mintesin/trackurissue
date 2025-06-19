# TrackurIssue - Enterprise Issue Tracking System

A comprehensive issue tracking and project management system built with Node.js, React, MongoDB, and Redis. Features advanced scalability, reliability, and monitoring capabilities.

## 🚀 Features

### Core Functionality
- **Issue Management**: Create, assign, track, and resolve issues
- **Project Management**: Sprint planning, milestone tracking, Kanban boards
- **Team Collaboration**: Real-time chat, notifications, team management
- **Role-Based Access Control**: Admin, Team Leader, Employee roles with granular permissions

### Scalability & Reliability Features
- **Caching Layer**: Redis-based caching for improved performance
- **Comprehensive Logging**: Structured logging with Winston
- **Application Performance Monitoring (APM)**: Real-time metrics and alerts
- **Enhanced Authentication**: JWT with refresh tokens and RBAC
- **Database Optimization**: Indexing strategies and query optimization
- **Graceful Shutdown**: Proper resource cleanup and connection management

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Cache Layer   │
                       │   (Redis)       │
                       └─────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+
- Redis 6.0+
- Docker and Docker Compose (optional)

## 🛠️ Installation

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trackurissue
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Monitoring Dashboard: http://localhost:3001/api/monitoring/health

### Option 2: Manual Installation

1. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Start MongoDB and Redis**
   ```bash
   # MongoDB
   mongod --dbpath /path/to/data
   
   # Redis
   redis-server
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the services**
   ```bash
   # Backend (in backend directory)
   npm start
   
   # Frontend (in frontend directory)
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/trackurissue
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-jwt-secret
REFRESH_TOKEN_SECRET=your-refresh-secret

# Performance
LOG_LEVEL=info
CACHE_TTL_DEFAULT=3600
RATE_LIMIT_MAX_REQUESTS=100
```

### Logging Configuration

Logs are categorized and stored in separate files:
- `app-combined.log` - General application logs
- `app-error.log` - Error logs
- `security.log` - Security events
- `performance.log` - Performance metrics
- `audit.log` - User actions and data changes
- `database.log` - Database operations

## 📊 Monitoring & Observability

### Application Performance Monitoring

Access the monitoring dashboard at `/api/monitoring/metrics` (admin only):

- **System Metrics**: CPU, memory, uptime
- **Request Metrics**: Response times, success rates, error rates
- **Database Performance**: Query times, slow queries, connection pool
- **Cache Performance**: Hit rates, miss rates
- **Real-time Alerts**: Configurable thresholds and notifications

### Health Checks

- **Endpoint**: `/api/monitoring/health`
- **Checks**: Database connectivity, Redis availability, system resources
- **Response**: JSON with detailed health status

### Metrics Available

```json
{
  "requests": {
    "total": 1000,
    "successRate": 0.95,
    "avgResponseTime": 150,
    "p95ResponseTime": 300,
    "p99ResponseTime": 500
  },
  "database": {
    "queries": 500,
    "slowQueries": 5,
    "errorRate": 0.01
  },
  "cache": {
    "hitRate": 0.85,
    "hits": 850,
    "misses": 150
  },
  "system": {
    "memory": { "usage": 0.65 },
    "cpu": { "loadAverage": [1.2, 1.1, 1.0] },
    "uptime": 86400
  }
}
```

## 🔐 Security Features

### Authentication & Authorization

- **JWT Tokens**: Access tokens (1h) + Refresh tokens (7d)
- **Role-Based Access Control**: Granular permissions system
- **Session Management**: Secure session handling with Redis
- **Rate Limiting**: Configurable per-user/IP limits

### Security Monitoring

- **Failed Login Attempts**: Automatic detection and alerting
- **Unauthorized Access**: Logging and monitoring
- **Suspicious Activity**: Pattern detection and alerts
- **Audit Trail**: Complete user action logging

### Permissions Matrix

| Role | Permissions |
|------|-------------|
| Admin | Full system access, user management, monitoring |
| Team Leader | Team management, project oversight, team metrics |
| Employee | Assigned issues, team collaboration, personal dashboard |

## 🚀 Performance Optimization

### Caching Strategy

- **User Data**: 1 hour TTL
- **Team Information**: 1 hour TTL
- **Issue Lists**: 5 minutes TTL
- **Dashboard Stats**: 5 minutes TTL
- **Session Data**: 24 hours TTL

### Database Optimization

- **Indexes**: Compound indexes on frequently queried fields
- **Aggregation**: Optimized pipelines for complex queries
- **Connection Pooling**: Configurable pool size and timeouts

### API Optimization

- **Pagination**: Limit large result sets
- **Field Selection**: Return only required fields
- **Compression**: Gzip compression for responses
- **Rate Limiting**: Prevent API abuse

## 📈 Scalability Considerations

### Horizontal Scaling

- **Load Balancing**: Multiple API server instances
- **Database Scaling**: MongoDB replica sets and sharding
- **Cache Distribution**: Redis clustering
- **CDN Integration**: Static asset delivery

### Vertical Scaling

- **Memory Optimization**: Efficient data structures and caching
- **CPU Optimization**: Async operations and worker threads
- **I/O Optimization**: Connection pooling and batching

### Monitoring Thresholds

Default alert thresholds:
- Response time: > 1000ms
- Error rate: > 5%
- Memory usage: > 85%
- CPU usage: > 80%
- Database connection pool: > 90%

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/validate` - Validate token
- `POST /api/auth/change-password` - Change password

### Monitoring (Admin Only)
- `GET /api/monitoring/health` - System health check
- `GET /api/monitoring/metrics` - Performance metrics
- `GET /api/monitoring/alerts` - Active alerts
- `POST /api/monitoring/alerts/:id/resolve` - Resolve alert

### Project Management
- `GET /api/sprints` - List sprints
- `POST /api/sprints` - Create sprint
- `PUT /api/sprints/:id` - Update sprint
- `DELETE /api/sprints/:id` - Delete sprint
- `GET /api/milestones` - List milestones
- `POST /api/milestones` - Create milestone

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

## 📦 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

2. **Configure reverse proxy** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
       }
       
       location /api {
           proxy_pass http://localhost:3001;
       }
   }
   ```

3. **Set up SSL/TLS**
   ```bash
   certbot --nginx -d your-domain.com
   ```

### Environment-Specific Configurations

- **Development**: Full logging, debug mode, hot reload
- **Staging**: Production-like with debug capabilities
- **Production**: Optimized performance, minimal logging, security hardened

## 🔍 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Restart Redis
   sudo systemctl restart redis
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB status
   mongosh --eval "db.adminCommand('ping')"
   
   # Check logs
   tail -f /var/log/mongodb/mongod.log
   ```

3. **High Memory Usage**
   - Check cache hit rates
   - Review query performance
   - Monitor for memory leaks

### Log Analysis

```bash
# View recent errors
tail -f backend/logs/app-error.log

# Search for specific patterns
grep "ERROR" backend/logs/app-combined.log

# Monitor performance
tail -f backend/logs/performance.log
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the monitoring dashboard for system health

## 🔮 Roadmap

- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Third-party integrations (Slack, JIRA, etc.)
- [ ] Machine learning for issue prediction
- [ ] Advanced reporting and insights
