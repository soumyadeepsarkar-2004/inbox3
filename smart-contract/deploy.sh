#!/bin/bash

# Inbox3 Smart Contract Deployment Script
# Supports both Testnet and Mainnet deployment

set -e  # Exit on any error

TARGET_NETWORK="${1:-testnet}"  # Default to testnet; pass "mainnet" to deploy to mainnet

echo "========================================"
echo " Inbox3 Smart Contract Deployment"
echo " Target Network: ${TARGET_NETWORK}"
echo "========================================"

# --- Safety guard for mainnet ---
if [ "$TARGET_NETWORK" = "mainnet" ]; then
    echo ""
    echo "⚠️  WARNING: You are about to deploy to APTOS MAINNET."
    echo "    This will cost real APT for gas fees."
    echo "    Make sure your mainnet profile in .aptos/config.yaml is correct."
    echo ""
    read -p "Type 'yes' to confirm mainnet deployment: " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
fi

# --- Validate environment ---
if ! command -v aptos &> /dev/null; then
    echo "❌ Aptos CLI not found. Install it:"
    echo "   curl -fsSL 'https://aptos.dev/scripts/install_cli.py' | python3"
    exit 1
fi

if [ ! -f "Move.toml" ]; then
    echo "❌ Move.toml not found. Run this script from the smart-contract directory."
    exit 1
fi

# --- Compile ---
echo ""
echo "📦 Compiling Move contract..."
aptos move compile --named-addresses inbox3=default

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi
echo "✅ Compilation successful!"

# --- Run tests (only on testnet deploy) ---
if [ "$TARGET_NETWORK" != "mainnet" ]; then
    echo ""
    echo "🧪 Running Move tests..."
    aptos move test --named-addresses inbox3=default
    if [ $? -ne 0 ]; then
        echo "❌ Tests failed! Fix tests before deploying."
        exit 1
    fi
    echo "✅ All tests passed!"
fi

# --- Deploy ---
echo ""
echo "🌐 Deploying to Aptos ${TARGET_NETWORK}..."

PROFILE="default"
if [ "$TARGET_NETWORK" = "mainnet" ]; then
    PROFILE="mainnet"
fi

aptos move publish \
    --named-addresses inbox3=${PROFILE} \
    --profile ${PROFILE} \
    --network ${TARGET_NETWORK} \
    --assume-yes

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Contract deployed successfully to ${TARGET_NETWORK}!"
    echo ""
    echo "📝 NEXT STEPS:"
    echo "   1. Copy your deployed account address"
    echo "   2. Update CONTRACT_ADDRESS in frontend/.env:"
    echo "      VITE_CONTRACT_ADDRESS=<your-mainnet-account-address>"
    echo "   3. Update Move.toml [addresses] inbox3 = \"<your-mainnet-account-address>\""
    echo "   4. Rebuild and redeploy the frontend"
else
    echo "❌ Deployment failed!"
    exit 1
fi
