# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=5000

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) for dependency installation
COPY package*.json ./

# Install only production dependencies for smaller image size
RUN npm install --omit=dev

# Copy the rest of the application source code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Add healthcheck for the backend API
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Run the app using Node.js
CMD [ "node", "index.js" ]
