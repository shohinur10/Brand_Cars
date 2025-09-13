#!/bin/bash

echo "🚀 STARTING WEBSITE ON SERVER..."

# Quick deployment script
echo "📝 Setting up environment..."
cat > .env << 'EOF'
PORT_API=3005
PORT_BATCH=3006
NODE_ENV=production
MONGO_DEV=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/Brand?retryWrites=true&w=majority
MONGO_PROD=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/BrandProd?retryWrites=true&w=majority
JWT_SECRET=your-production-jwt-secret-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://72.60.108.222
API_URL=http://72.60.108.222:4001
EOF

echo "🏗️ Starting services..."
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

echo "⏳ Waiting for services to start..."
sleep 15

echo "📊 Service Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Website is starting!"
echo "🌐 Access your website at: http://72.60.108.222:4001"
echo "🏥 Health check: http://72.60.108.222:4001/health"
echo ""
echo "📋 To view logs: docker compose -f docker-compose.prod.yml logs -f"
