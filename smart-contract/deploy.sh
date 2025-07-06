#!/bin/bash

# Aptos Smart Contract Deployment Script

echo "🚀 Deploying Inbox3 Smart Contract to Aptos..."

# Check if aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo "❌ Aptos CLI not found. Please install it first:"
    echo "curl -fsSL 'https://aptos.dev/scripts/install_cli.py' | python3"
    exit 1
fi

# Check if Move.toml exists
if [ ! -f "Move.toml" ]; then
    echo "❌ Move.toml not found. Please run this script from the smart-contract directory."
    exit 1
fi

# Compile the contract
echo "📦 Compiling Move contract..."
aptos move compile

if [ $? -ne 0 ]; then
    echo "❌ Contract compilation failed!"
    exit 1
fi

echo "✅ Contract compiled successfully!"

# Deploy to devnet
echo "🌐 Deploying to Aptos DevNet..."
aptos move publish --network devnet

if [ $? -eq 0 ]; then
    echo "✅ Contract deployed successfully!"
    echo "📝 Don't forget to update the CONTRACT_ADDRESS in your frontend App.tsx"
else
    echo "❌ Contract deployment failed!"
    exit 1
fi
