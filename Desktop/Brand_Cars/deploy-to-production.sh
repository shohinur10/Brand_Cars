#!/bin/bash

# Production Deployment Script
# This script automates the deployment to the production server

set -e  # Exit on error

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROD_SERVER="72.60.236.198"
PROD_USER="${SSH_USER:-root}"  # Default to root, can be overridden with SSH_USER env var
PROJECT_DIR="${PROJECT_DIR:-/root/Brand_Cars}"

echo "📦 Building deployment package..."

# Step 1: Build and tag images locally
echo -e "${YELLOW}Step 1: Building Docker images...${NC}"
docker compose build --no-cache

# Step 2: Check if SSH access is configured
echo -e "${YELLOW}Step 2: Checking SSH access to production server...${NC}"
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${PROD_USER}@${PROD_SERVER} exit 2>/dev/null; then
    echo -e "${GREEN}✓ SSH access confirmed${NC}"
else
    echo -e "${RED}✗ SSH access failed. Please ensure:${NC}"
    echo "  1. SSH keys are set up"
    echo "  2. You can connect with: ssh ${PROD_USER}@${PROD_SERVER}"
    echo "  3. Or set SSH_USER environment variable: export SSH_USER=your_user"
    exit 1
fi

# Step 3: Deploy to production
echo -e "${YELLOW}Step 3: Deploying to production server...${NC}"
ssh ${PROD_USER}@${PROD_SERVER} << 'EOF'
    set -e
    cd /root/Brand_Cars
    
    echo "📥 Pulling latest code from GitHub..."
    git fetch origin
    git checkout master
    git pull origin master
    
    echo "🛑 Stopping existing containers..."
    docker compose down || true
    
    echo "🔨 Building new containers..."
    docker compose build --no-cache
    
    echo "🚀 Starting containers..."
    docker compose up -d
    
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    echo "📊 Checking container status..."
    docker ps
    
    echo "📝 Checking logs for database connection..."
    docker logs job-board-ai | tail -20
    
    echo "✅ Deployment complete!"
EOF

# Step 4: Verify deployment
echo -e "${YELLOW}Step 4: Verifying deployment...${NC}"
echo "Testing API endpoint..."
if curl -f -s -m 5 "http://${PROD_SERVER}:4001/status" > /dev/null; then
    echo -e "${GREEN}✓ API is responding${NC}"
else
    echo -e "${RED}✗ API is not responding${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment process complete!${NC}"
echo ""
echo "📋 Summary:"
echo "  Production Server: ${PROD_SERVER}"
echo "  API Endpoint: http://${PROD_SERVER}:4001"
echo "  GraphQL: http://${PROD_SERVER}:4001/graphql"
echo ""
echo "🔍 To check logs:"
echo "  ssh ${PROD_USER}@${PROD_SERVER}"
echo "  cd ${PROJECT_DIR}"
echo "  docker logs job-board-ai"
echo ""
echo "📖 For detailed instructions, see: PRODUCTION_DEPLOYMENT.md"




