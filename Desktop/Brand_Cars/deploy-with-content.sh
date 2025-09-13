#!/bin/bash

echo "🌐 DEPLOYING WEBSITE WITH CONTENT..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Step 1: Update code
print_status "📥 Updating code from repository..."
git reset --hard
git checkout master
git pull origin master

# Step 2: Fix environment
print_status "📝 Setting up environment..."
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

# Step 3: Rebuild and deploy
print_status "🏗️ Rebuilding and deploying with new content..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

# Step 4: Wait for services
print_status "⏳ Waiting for services to start..."
sleep 20

# Step 5: Check status
print_status "📊 Checking service status..."
docker compose -f docker-compose.prod.yml ps

# Step 6: Test endpoints
print_status "🧪 Testing endpoints..."

echo ""
echo "Testing main page..."
curl -s http://localhost:4001/ | head -5

echo ""
echo "Testing API endpoint..."
curl -s http://localhost:4001/api | jq . 2>/dev/null || curl -s http://localhost:4001/api

echo ""
echo "Testing health endpoint..."
curl -s http://localhost:4001/health | jq . 2>/dev/null || curl -s http://localhost:4001/health

print_success "🎉 DEPLOYMENT COMPLETED!"
echo ""
echo "🌐 Your website is now available at:"
echo "   Main Page: http://72.60.108.222:4001/"
echo "   API Info:  http://72.60.108.222:4001/api"
echo "   Health:    http://72.60.108.222:4001/health"
echo "   GraphQL:   http://72.60.108.222:4001/graphql"
echo ""
echo "📋 To view logs: docker compose -f docker-compose.prod.yml logs -f"
