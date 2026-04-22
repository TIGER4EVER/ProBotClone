#!/bin/bash

echo "🚀 Starting ProBot Clone..."

# Create data directory if it doesn't exist
mkdir -p ./data

# Run database migrations
echo "📦 Running database migrations..."
pnpm drizzle-kit migrate 2>/dev/null || echo "⚠️ Migration skipped or already applied"

# Start the application
echo "✅ Starting server..."
pnpm start
