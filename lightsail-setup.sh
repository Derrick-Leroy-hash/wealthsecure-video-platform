#!/bin/bash

# Quick Setup Script for AWS Lightsail
# Run this after cloning the repository on your Lightsail instance

set -e

echo "🚀 WealthSecure Video Platform - Lightsail Setup"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your database credentials:"
    echo ""
    echo "DATABASE_URL=postgresql://dbmasteruser:PASSWORD@ENDPOINT:5432/wealthsecure_video"
    echo "PORT=3001"
    echo "NODE_ENV=production"
    echo ""
    exit 1
fi

echo "✓ Found .env file"

# Install pnpm if not installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    export PNPM_HOME="$HOME/.local/share/pnpm"
    export PATH="$PNPM_HOME:$PATH"
fi

echo "✓ pnpm installed"

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

echo "✓ PM2 installed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

echo "✓ Dependencies installed"

# Build frontend
echo "🏗️  Building frontend..."
pnpm build

echo "✓ Frontend built"

# Run database migrations
echo "🗄️  Running database migrations..."
pnpm db:push

echo "✓ Database ready"

# Start application
echo "🚀 Starting application..."
pm2 start ecosystem.config.js
pm2 save

# Set up PM2 to start on boot
pm2 startup | tail -n 1 > startup-command.sh
chmod +x startup-command.sh

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run the startup command to enable auto-start on reboot:"
echo "   sudo bash startup-command.sh"
echo ""
echo "2. Check application status:"
echo "   pm2 status"
echo ""
echo "3. View logs:"
echo "   pm2 logs"
echo ""
echo "4. Your application is running on port 3001"
echo "   Set up Nginx to proxy port 80 to 3001"
echo ""

