#!/bin/bash

echo "🚀 Starting Production Deployment..."

# Create production environment file
echo "📝 Creating production environment configuration..."
cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production

# MongoDB Configuration
MONGO_PROD=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/BrandProd?retryWrites=true&w=majority
MONGO_DEV=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/Brand?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-production-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3005
BATCH_PORT=3006
FRONTEND_URL=http://72.60.108.222
API_URL=http://72.60.108.222:4001

# File Upload Configuration
UPLOAD_PATH=./uploads
EOF

# Also update the main .env file to ensure consistency
echo "📝 Updating main .env file with correct MongoDB connection..."
cat > .env << EOF
PORT_API=3005
PORT_BATCH=3006

NODE_ENV=production
MONGO_DEV=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/Brand?retryWrites=true&w=majority
MONGO_PROD=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/BrandProd?retryWrites=true&w=majority

JWT_SECRET=your-production-jwt-secret-key-here
JWT_EXPIRES_IN=7d
EOF

echo "✅ Production environment file created"

# Update git repository
echo "📥 Updating code from repository..."
git reset --hard 
git checkout master
git pull origin master 

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down --volumes --remove-orphans

# Remove old images to force rebuild
echo "🗑️ Removing old images..."
docker image prune -f

# Start with production configuration
echo "🏗️ Building and starting production containers..."
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

echo "✅ Production deployment completed!"
echo "📊 Checking container status..."
docker compose -f docker-compose.prod.yml ps

echo "📋 To view logs, run:"
echo "   docker compose -f docker-compose.prod.yml logs -f nestar-api"
echo "   docker compose -f docker-compose.prod.yml logs -f nestar-batch"
