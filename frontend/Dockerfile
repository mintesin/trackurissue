# Stage 1: Build the frontend application using Node.js
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Clean install all dependencies (including devDependencies needed for build)
RUN npm ci --no-audit

# Copy source files for build
COPY . .

# Build the application with production optimization
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom nginx configuration for serving the frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck for the frontend service
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
