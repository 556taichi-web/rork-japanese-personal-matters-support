#!/bin/bash

# AI Personal Training App - Backend Startup Script
# This script helps start the backend server with proper error handling

echo "🏋️ AI Personal Training App - Backend Server"
echo "============================================="
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed!"
    echo "💡 Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    echo ""
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/server.ts" ]; then
    echo "❌ backend/server.ts not found!"
    echo "💡 Please run this script from the project root directory"
    echo ""
    exit 1
fi

# Check if port 3001 is already in use
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3001 is already in use!"
    echo ""
    echo "🔍 Process using port 3001:"
    lsof -i :3001
    echo ""
    echo "💡 Options:"
    echo "   1. Kill the existing process: lsof -ti:3001 | xargs kill -9"
    echo "   2. Use a different port: PORT=3002 bun run backend/server.ts"
    echo ""
    read -p "❓ Kill the existing process and continue? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Killing existing process..."
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo "❌ Cancelled by user"
        exit 1
    fi
fi

echo "🔄 Starting backend server..."
echo ""

# Start the server
bun run backend/server.ts