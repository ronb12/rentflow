#!/bin/bash

# RentFlow Test Runner
# This script sets up the test environment and runs comprehensive tests

echo "🚀 RentFlow Test Suite Setup"
echo "=============================="

# Create test screenshots directory
mkdir -p test-screenshots

# Check if port 3004 is available
if lsof -Pi :3004 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3004 is already in use. Please stop the service and try again."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🌱 Seeding test data..."
npx tsx seed-test-data.ts

echo "🔧 Starting development server on port 3004..."
# Start the dev server in background
PORT=3004 npm run dev &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Check if server is running
if ! curl -s http://localhost:3004 > /dev/null; then
    echo "❌ Server failed to start on port 3004"
    kill $SERVER_PID
    exit 1
fi

echo "✅ Server is running on http://localhost:3004"

echo "🧪 Running comprehensive test suite..."
npx tsx test-suite.ts

echo "🛑 Stopping development server..."
kill $SERVER_PID

echo "📊 Test Results Summary:"
echo "========================"
echo "Check the console output above for detailed test results."
echo "Screenshots saved in: test-screenshots/"
echo ""
echo "🎯 Test Coverage:"
echo "- Login functionality"
echo "- Dashboard navigation"
echo "- Properties management"
echo "- Tenants management"
echo "- Inspections system"
echo "- PWA features"
echo "- Offline mode"
echo "- API endpoints"
echo ""
echo "✅ Test suite completed!"
