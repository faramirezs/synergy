#!/bin/bash

# Azure App Service startup script for Node.js 18
echo "Starting Synergy Agar.io Clone on Node.js 18..."
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-8080}

# Navigate to app directory
cd /home/site/wwwroot

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Build the application
echo "Building application..."
npm run build

# Start the application
echo "Starting application on port $PORT..."
exec node bin/server/server.js
