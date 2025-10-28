#!/bin/bash

# WealthSecure Video Platform - Startup Script for AWS Lightsail

echo "Starting WealthSecure Video Platform..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install --prod
fi

# Build frontend if dist doesn't exist
if [ ! -d "dist" ]; then
  echo "Building frontend..."
  pnpm build
fi

# Run database migrations
echo "Running database migrations..."
pnpm db:push

# Start the server with PM2
echo "Starting server..."
pm2 start ecosystem.config.js
pm2 save

echo "✅ WealthSecure Video Platform started successfully!"
echo "Server running on port 3001"

