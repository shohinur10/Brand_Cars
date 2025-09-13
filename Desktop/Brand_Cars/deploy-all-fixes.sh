#!/bin/bash

echo "🚀 COMPREHENSIVE DEPLOYMENT - Fixing All Errors and Pushing to Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Clean up everything
print_status "🧹 Cleaning up old containers and images..."
docker compose down --volumes --remove-orphans --timeout 0 2>/dev/null || true
docker container prune -f 2>/dev/null || true
docker image prune -a -f 2>/dev/null || true

# Remove specific project images
print_status "🗑️ Removing old project images..."
docker rmi $(docker images -q nestar*) 2>/dev/null || true
docker rmi $(docker images -q brand*) 2>/dev/null || true

# Step 2: Fix environment configuration
print_status "📝 Creating correct environment configuration..."

# Remove any existing .env files
rm -f .env .env.production

# Create new .env file with correct MongoDB connection
cat > .env << 'EOF'
PORT_API=3005
PORT_BATCH=3006

NODE_ENV=production
MONGO_DEV=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/Brand?retryWrites=true&w=majority
MONGO_PROD=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/BrandProd?retryWrites=true&w=majority

JWT_SECRET=your-production-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
FRONTEND_URL=http://72.60.108.222
API_URL=http://72.60.108.222:4001
EOF

# Create .env.production file
cat > .env.production << 'EOF'
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

print_success "Environment files created with correct MongoDB connection strings"

# Step 3: Update git repository
print_status "📥 Updating code from repository..."
git reset --hard
git checkout master
git pull origin master

# Step 4: Build and deploy with production configuration
print_status "🏗️ Building and deploying with production configuration..."

# Set environment variables to override any .env file issues
export MONGO_PROD="mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/BrandProd?retryWrites=true&w=majority"
export MONGO_DEV="mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/Brand?retryWrites=true&w=majority"
export NODE_ENV="production"

# Deploy with production configuration
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

# Step 5: Wait for services to start
print_status "⏳ Waiting for services to start..."
sleep 10

# Step 6: Check container status
print_status "📊 Checking container status..."
docker compose -f docker-compose.prod.yml ps

# Step 7: Show logs to verify connection
print_status "📋 Checking MongoDB connection logs..."

echo ""
echo "🔍 API Service Logs (last 20 lines):"
echo "=================================="
docker compose -f docker-compose.prod.yml logs --tail=20 nestar-api

echo ""
echo "🔍 Batch Service Logs (last 20 lines):"
echo "===================================="
docker compose -f docker-compose.prod.yml logs --tail=20 nestar-batch

# Step 8: Test health endpoint
print_status "🏥 Testing health endpoint..."
sleep 5

# Test if API is responding
if curl -s http://localhost:4001/health > /dev/null 2>&1; then
    print_success "API health check passed!"
    curl -s http://localhost:4001/health | jq . 2>/dev/null || curl -s http://localhost:4001/health
else
    print_warning "API health check failed - service may still be starting"
fi

# Step 9: Final status
echo ""
print_success "🎉 DEPLOYMENT COMPLETED!"
echo ""
echo "📋 Useful Commands:"
echo "=================="
echo "View API logs:     docker compose -f docker-compose.prod.yml logs -f nestar-api"
echo "View Batch logs:   docker compose -f docker-compose.prod.yml logs -f nestar-batch"
echo "Check status:      docker compose -f docker-compose.prod.yml ps"
echo "Stop services:     docker compose -f docker-compose.prod.yml down"
echo "Restart services:  docker compose -f docker-compose.prod.yml restart"
echo ""
echo "🌐 Service URLs:"
echo "==============="
echo "API Health:        http://localhost:4001/health"
echo "GraphQL Playground: http://localhost:4001/graphql"
echo "API Endpoint:      http://localhost:4001/"
echo ""
echo "🔍 Expected MongoDB Connection:"
echo "=============================="
echo "Should show: mongodb+srv://***:***@cluster0.fme80.mongodb.net/BrandProd"
echo "NOT: brandprod-cluster.mongodb.net"
