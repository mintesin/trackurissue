# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Define the command to run your app
CMD [ "node", "index.js" ]
