#!/bin/bash
# Multi-project build script for Vercel
# This script builds both the landing page and the product app,
# then organizes them into a single structure for deployment.

set -e

echo "--- Building Landing Page ---"
cd "$(dirname "$0")/landing"
npm install
npm run build
cd ..

echo "--- Building Product App ---"
cd "$(dirname "$0")/frontend"
# Use pnpm if available, fall back to npm
if command -v pnpm &> /dev/null; then
  pnpm install
  pnpm run build
else
  npm install
  npm run build
fi
cd ..

echo "--- Organizing Deployment Structure ---"
# Create a unified public directory
mkdir -p public/app

# Copy landing page to root
cp -r landing/dist/* public/

# Copy app to /app subfolder
cp -r frontend/dist/* public/app/

# Verify build artifacts exist
if [ ! -f public/index.html ] || [ ! -f public/app/index.html ]; then
  echo "ERROR: Build artifacts missing!"
  exit 1
fi

echo "--- Deployment Structure Ready ---"
