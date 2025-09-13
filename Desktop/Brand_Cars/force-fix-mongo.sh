#!/bin/bash

echo "🔧 FORCE FIXING MongoDB Connection Issues..."

# First, let's completely remove the problematic .env file
echo "🗑️ Removing old .env file..."
rm -f .env

# Create new .env file with correct connection string
echo "📝 Creating new .env file with correct MongoDB connection..."
cat > .env << 'EOF'
PORT_API=3005
PORT_BATCH=3006

NODE_ENV=production
MONGO_DEV=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/Brand?retryWrites=true&w=majority
MONGO_PROD=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/BrandProd?retryWrites=true&w=majority

JWT_SECRET=your-production-jwt-secret-key-here
JWT_EXPIRES_IN=7d
EOF

echo "✅ .env file created with correct MongoDB connection string"

# Stop all containers forcefully
echo "🛑 Force stopping all containers..."
docker compose down --volumes --remove-orphans --timeout 0

# Remove all containers and images
echo "🗑️ Removing all containers and images..."
docker container prune -f
docker image prune -a -f

# Remove specific images if they exist
docker rmi $(docker images -q nestar*) 2>/dev/null || true

# Start with production configuration and force environment variables
echo "🏗️ Building and starting production containers with forced environment..."
MONGO_PROD=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/BrandProd?retryWrites=true&w=majority \
MONGO_DEV=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/Brand?retryWrites=true&w=majority \
NODE_ENV=production \
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

echo "✅ Force fix completed!"
echo "📊 Checking container status..."
docker compose -f docker-compose.prod.yml ps

echo "📋 To view logs, run:"
echo "   docker compose -f docker-compose.prod.yml logs -f nestar-api"
echo "   docker compose -f docker-compose.prod.yml logs -f nestar-batch"

echo "🔍 To verify MongoDB connection, check the logs for:"
echo "   'Connection URI: mongodb+srv://***:***@cluster0.fme80.mongodb.net'"
