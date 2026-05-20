#!/bin/bash

# Inbox3 Production Deployment Script
# This script handles the complete deployment to Vercel

set -e

echo "🚀 Inbox3 Production Deployment"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi
echo -e "${GREEN}✓ pnpm $(pnpm --version)${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found. Please install Git${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git $(git --version | cut -d' ' -f3)${NC}"

echo ""
echo "🔧 Setting up environment..."
echo ""

# Navigate to frontend
cd frontend

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}Please edit frontend/.env with your Pinata API keys${NC}"
    echo "Get keys from: https://pinata.cloud/keys"
    exit 1
fi

# Verify required env vars
if ! grep -q "VITE_PINATA_API_KEY=" .env; then
    echo -e "${RED}❌ VITE_PINATA_API_KEY not set in .env${NC}"
    exit 1
fi

if ! grep -q "VITE_PINATA_SECRET_KEY=" .env; then
    echo -e "${RED}❌ VITE_PINATA_SECRET_KEY not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables configured${NC}"

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🏗️  Building frontend..."
pnpm run build

if [ -d "dist" ]; then
    SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}✓ Build successful (Size: $SIZE)${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo "🧪 Testing production build locally..."
timeout 5 pnpm run preview &
sleep 2
if curl -s http://localhost:4173 > /dev/null; then
    echo -e "${GREEN}✓ Production build verified${NC}"
else
    echo -e "${YELLOW}⚠️  Could not verify build locally (may still be ok)${NC}"
fi
kill %1 2>/dev/null || true

echo ""
echo "🌐 Deploying to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy
vercel --prod

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Visit your Vercel deployment URL"
echo "2. Connect your wallet"
echo "3. Create an inbox"
echo "4. Test messaging feature"
echo ""
echo "📚 Documentation:"
echo "- Deployment Checklist: docs/DEPLOYMENT_CHECKLIST.md"
echo "- Feature Verification: docs/FEATURE_VERIFICATION.md"
echo "- Troubleshooting: docs/TROUBLESHOOTING.md"
echo ""
echo "🎉 Deployment successful!"
