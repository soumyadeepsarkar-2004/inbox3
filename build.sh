#!/bin/bash
# Multi-project build script for Vercel
# This script builds both the landing page and the product app,
# then organizes them into a single structure for deployment.

echo "--- Building Landing Page ---"
cd landing
npm install
npm run build
cd ..

echo "--- Building Product App ---"
cd frontend
npm install
npm run build
cd ..

echo "--- Organizing Deployment Structure ---"
# Create a unified public directory
mkdir -p public/app

# Copy landing page to root
cp -r landing/dist/* public/

# Copy app to /app subfolder
cp -r frontend/dist/* public/app/

echo "--- Deployment Structure Ready ---"
