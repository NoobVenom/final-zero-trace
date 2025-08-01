#!/bin/bash

# SecureDSA-Pro Startup Script
# This script starts all required services for the SecureDSA-Pro chrome extension

echo "🚀 Starting SecureDSA-Pro System..."
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

echo "📦 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔍 Checking service health..."

# Check Claude 3.5 (Primary)
if curl -f http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Claude 3.5 (Primary) - Port 11434"
else
    echo "❌ Claude 3.5 (Primary) - Port 11434 - Not responding"
fi

# Check Deepseek v3 (Secondary)
if curl -f http://localhost:11436/api/tags > /dev/null 2>&1; then
    echo "✅ Deepseek v3 (Secondary) - Port 11436"
else
    echo "❌ Deepseek v3 (Secondary) - Port 11436 - Not responding"
fi

# Check GPT-4o (Retry 1)
if curl -f http://localhost:11435/api/tags > /dev/null 2>&1; then
    echo "✅ GPT-4o (Retry 1) - Port 11435"
else
    echo "❌ GPT-4o (Retry 1) - Port 11435 - Not responding"
fi

# Check Grok4 (Retry 2)
if curl -f http://localhost:11437/api/tags > /dev/null 2>&1; then
    echo "✅ Grok4 (Retry 2) - Port 11437"
else
    echo "❌ Grok4 (Retry 2) - Port 11437 - Not responding"
fi

echo ""
echo "🎯 SecureDSA-Pro System Status:"
echo "================================"
docker-compose ps

echo ""
echo "📋 Next Steps:"
echo "1. Open Chrome browser"
echo "2. Go to chrome://extensions/"
echo "3. Enable 'Developer mode'"
echo "4. Click 'Load unpacked'"
echo "5. Select the 'secure-dsa-pro' directory"
echo "6. Click the SecureDSA-Pro extension icon to start solving DSA problems!"

echo ""
echo "🔧 Useful Commands:"
echo "- View logs: docker-compose logs -f"
echo "- Stop services: docker-compose down"
echo "- Restart services: docker-compose restart"
echo "- Check status: docker-compose ps"

echo ""
echo "🎉 SecureDSA-Pro is ready to use!" 