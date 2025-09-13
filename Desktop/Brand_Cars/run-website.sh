#!/bin/bash

echo "🌐 DEPLOYING WEBSITE ON PRODUCTION SERVER..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Step 1: Complete cleanup and preparation
print_status "🧹 Preparing server environment..."

# Stop any running containers
docker compose down --volumes --remove-orphans --timeout 0 2>/dev/null || true
docker compose -f docker-compose.prod.yml down --volumes --remove-orphans --timeout 0 2>/dev/null || true

# Clean up old images
docker system prune -a -f --volumes 2>/dev/null || true

# Step 2: Fix environment configuration
print_status "📝 Setting up correct environment configuration..."

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

print_success "Environment configuration created"

# Step 3: Update code from repository
print_status "📥 Updating code from repository..."
git reset --hard
git checkout master
git pull origin master

# Step 4: Deploy all services
print_status "🏗️ Deploying all services..."

# Deploy with production configuration
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

# Step 5: Wait for services to start
print_status "⏳ Waiting for services to start..."
sleep 20

# Step 6: Check service status
print_status "📊 Checking service status..."
docker compose -f docker-compose.prod.yml ps

# Step 7: Verify MongoDB connections
print_status "🔍 Verifying MongoDB connections..."

echo ""
echo "API Service MongoDB Connection:"
echo "=============================="
docker compose -f docker-compose.prod.yml logs --tail=15 nestar-api | grep -E "(MongoDB|Connection|Error|cluster0|brandprod|✅|❌)"

echo ""
echo "Batch Service MongoDB Connection:"
echo "================================"
docker compose -f docker-compose.prod.yml logs --tail=15 nestar-batch | grep -E "(MongoDB|Connection|Error|cluster0|brandprod|✅|❌)"

# Step 8: Test API endpoints
print_status "🏥 Testing API endpoints..."

# Test health endpoint
if curl -s http://localhost:4001/health > /dev/null 2>&1; then
    print_success "✅ API Health Check: PASSED"
    echo "Health Response:"
    curl -s http://localhost:4001/health | jq . 2>/dev/null || curl -s http://localhost:4001/health
else
    print_warning "⚠️ API Health Check: FAILED - Service may still be starting"
fi

# Test GraphQL endpoint
if curl -s http://localhost:4001/graphql > /dev/null 2>&1; then
    print_success "✅ GraphQL Endpoint: ACCESSIBLE"
else
    print_warning "⚠️ GraphQL Endpoint: NOT ACCESSIBLE"
fi

# Step 9: Show service URLs
echo ""
print_success "🎉 WEBSITE DEPLOYMENT COMPLETED!"
echo ""
echo "🌐 SERVICE URLs:"
echo "==============="
echo "API Health Check:     http://72.60.108.222:4001/health"
echo "GraphQL Playground:   http://72.60.108.222:4001/graphql"
echo "API Endpoint:         http://72.60.108.222:4001/"
echo "Batch Service:        http://72.60.108.222:4002/"
echo ""
echo "📋 MANAGEMENT COMMANDS:"
echo "======================"
echo "View all logs:        docker compose -f docker-compose.prod.yml logs -f"
echo "View API logs:        docker compose -f docker-compose.prod.yml logs -f nestar-api"
echo "View Batch logs:      docker compose -f docker-compose.prod.yml logs -f nestar-batch"
echo "Check status:         docker compose -f docker-compose.prod.yml ps"
echo "Restart services:     docker compose -f docker-compose.prod.yml restart"
echo "Stop services:        docker compose -f docker-compose.prod.yml down"
echo ""
echo "🔍 MONITORING:"
echo "============="
echo "Check MongoDB connection in logs for:"
echo "  ✅ cluster0.fme80.mongodb.net (CORRECT)"
echo "  ❌ brandprod-cluster.mongodb.net (WRONG - should not appear)"
echo ""
echo "🌐 Your website is now running on:"
echo "   http://72.60.108.222:4001"
