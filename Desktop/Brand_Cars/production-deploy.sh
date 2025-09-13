#!/bin/bash

echo "🚀 PRODUCTION DEPLOYMENT - Fixing All MongoDB Errors..."

# Step 1: Complete cleanup
echo "🧹 Complete cleanup of old containers and images..."
docker compose down --volumes --remove-orphans --timeout 0
docker system prune -a -f --volumes

# Step 2: Fix environment files
echo "📝 Creating correct environment configuration..."

# Remove old .env files
rm -f .env .env.production

# Create correct .env file
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

echo "✅ Environment files created with correct MongoDB connection"

# Step 3: Update code
echo "📥 Updating code..."
git reset --hard
git checkout master
git pull origin master

# Step 4: Deploy with production configuration
echo "🏗️ Deploying with production configuration..."
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

# Step 5: Wait and check
echo "⏳ Waiting for services to start..."
sleep 15

echo "📊 Container Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 Checking MongoDB connections..."
echo "API Service:"
docker compose -f docker-compose.prod.yml logs --tail=10 nestar-api | grep -E "(MongoDB|Connection|Error|cluster0|brandprod)"

echo ""
echo "Batch Service:"
docker compose -f docker-compose.prod.yml logs --tail=10 nestar-batch | grep -E "(MongoDB|Connection|Error|cluster0|brandprod)"

echo ""
echo "✅ Production deployment completed!"
echo "🌐 API Health: http://localhost:4001/health"
echo "📋 View logs: docker compose -f docker-compose.prod.yml logs -f"
