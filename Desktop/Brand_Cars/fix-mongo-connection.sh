#!/bin/bash

echo "🔧 Fixing MongoDB Connection Issues..."

# Update .env file with correct MongoDB connection string
echo "📝 Updating .env file with correct MongoDB connection..."
cat > .env << 'EOF'
PORT_API=3005
PORT_BATCH=3006

NODE_ENV=production
MONGO_DEV=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/Brand?retryWrites=true&w=majority
MONGO_PROD=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/BrandProd?retryWrites=true&w=majority

JWT_SECRET=your-production-jwt-secret-key-here
JWT_EXPIRES_IN=7d
EOF

echo "✅ .env file updated with correct MongoDB connection string"

# Stop all containers
echo "🛑 Stopping all containers..."
docker compose down --volumes --remove-orphans

# Remove old images to force rebuild
echo "🗑️ Removing old images..."
docker image prune -f

# Start with production configuration
echo "🏗️ Building and starting production containers..."
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

echo "✅ MongoDB connection fix completed!"
echo "📊 Checking container status..."
docker compose -f docker-compose.prod.yml ps

echo "📋 To view logs, run:"
echo "   docker compose -f docker-compose.prod.yml logs -f nestar-api"
echo "   docker compose -f docker-compose.prod.yml logs -f nestar-batch"
