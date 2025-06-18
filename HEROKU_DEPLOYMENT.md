# Heroku Deployment Guide for TrackurIssue

## Prerequisites

1. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
2. [Git](https://git-scm.com/) installed
3. Heroku account
4. MongoDB Atlas account (for production database)

## Setup Steps

### 1. Create Heroku Apps

Create separate apps for frontend and backend:

```bash
# Create backend app
heroku create trackurissue-api

# Create frontend app
heroku create trackurissue-client
```

### 2. Add Heroku Add-ons

```bash
# Add Redis for caching (to backend app)
heroku addons:create heroku-redis:hobby-dev -a trackurissue-api

# Add logging (optional)
heroku addons:create papertrail:choklad -a trackurissue-api
```

### 3. Configure Environment Variables

Set environment variables for the backend app:

```bash
# Copy variables from .env.heroku
heroku config:set $(cat .env.heroku | grep -v '^#' | xargs) -a trackurissue-api

# Set specific URLs
heroku config:set FRONTEND_URL=$(heroku info -s -a trackurissue-client | grep web_url | cut -d= -f2) -a trackurissue-api
heroku config:set CORS_ORIGIN=$(heroku info -s -a trackurissue-client | grep web_url | cut -d= -f2) -a trackurissue-api
```

Set environment variables for the frontend app:

```bash
heroku config:set REACT_APP_API_URL=$(heroku info -s -a trackurissue-api | grep web_url | cut -d= -f2) -a trackurissue-client
heroku config:set REACT_APP_ENVIRONMENT=production -a trackurissue-client
```

### 4. Deploy the Applications

Deploy the backend:

```bash
# From project root
git subtree push --prefix backend heroku-api main

# If you need to force push
git push heroku-api `git subtree split --prefix backend main`:main --force
```

Deploy the frontend:

```bash
# From project root
git subtree push --prefix frontend heroku-client main

# If you need to force push
git push heroku-client `git subtree split --prefix frontend main`:main --force
```

### 5. Scale Dynos

```bash
# Scale backend
heroku ps:scale web=1 -a trackurissue-api

# Scale frontend
heroku ps:scale web=1 -a trackurissue-client
```

## Production Considerations

### 1. MongoDB Setup

- Use MongoDB Atlas for production database
- Enable network access for Heroku IPs
- Create dedicated database user
- Use connection string with SSL enabled

### 2. Redis Configuration

- Heroku Redis is automatically configured
- SSL is enabled by default
- Connection details are in REDIS_URL

### 3. Logging

- Use Papertrail add-on for log aggregation
- Set appropriate LOG_LEVEL in production
- Monitor application logs:
  ```bash
  heroku logs --tail -a trackurissue-api
  ```

### 4. Security

- All environment variables are secured
- SSL is enabled by default
- CORS is configured for specific origins
- Rate limiting is enabled
- Session management is secure

### 5. Monitoring

Access the monitoring dashboard at:
```
https://trackurissue-api.herokuapp.com/api/monitoring/health
```

### 6. Performance Optimization

1. **Caching**:
   - Redis cache is configured
   - Default TTLs are set
   - Cache invalidation is automated

2. **Database**:
   - Connection pooling is configured
   - Indexes are created
   - Queries are optimized

3. **Assets**:
   - Frontend assets are compressed
   - Static files are cached
   - Images are optimized

## Maintenance

### 1. Database Backups

MongoDB Atlas handles automated backups, but you can create manual backups:

```bash
# Get MongoDB URI from Heroku config
heroku config:get MONGODB_URI -a trackurissue-api

# Create backup
mongodump --uri="YOUR_MONGODB_URI"
```

### 2. Redis Maintenance

Monitor Redis usage:

```bash
# Check Redis info
heroku redis:info -a trackurissue-api

# Monitor Redis
heroku redis:cli -a trackurissue-api
```

### 3. Scaling

```bash
# Scale dynos up
heroku ps:scale web=2 -a trackurissue-api

# Scale dynos down
heroku ps:scale web=1 -a trackurissue-api
```

### 4. Updates and Migrations

1. Always test migrations locally first
2. Use maintenance mode when needed:
   ```bash
   heroku maintenance:on -a trackurissue-api
   # perform updates
   heroku maintenance:off -a trackurissue-api
   ```

## Troubleshooting

### 1. Connection Issues

```bash
# Check application status
heroku ps -a trackurissue-api

# View logs
heroku logs --tail -a trackurissue-api

# Check Redis connection
heroku redis:info -a trackurissue-api
```

### 2. Performance Issues

1. Monitor application metrics in the dashboard
2. Check resource usage:
   ```bash
   heroku ps:utilization -a trackurissue-api
   ```
3. Review slow queries in MongoDB Atlas

### 3. Common Problems

1. **H10 - App Crashed**
   - Check logs for error messages
   - Verify environment variables
   - Check for memory issues

2. **H12 - Request Timeout**
   - Optimize slow queries
   - Increase cache usage
   - Check external service calls

3. **R14 - Memory Quota Exceeded**
   - Monitor memory usage
   - Check for memory leaks
   - Consider upgrading dyno type

## Useful Commands

```bash
# View app info
heroku apps:info -a trackurissue-api

# Check running processes
heroku ps -a trackurissue-api

# View logs
heroku logs --tail -a trackurissue-api

# Run database migrations
heroku run npm run migrate -a trackurissue-api

# Access production shell
heroku run bash -a trackurissue-api

# Monitor metrics
heroku metrics:web -a trackurissue-api
```

## Support and Resources

- [Heroku Dev Center](https://devcenter.heroku.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs-support)
