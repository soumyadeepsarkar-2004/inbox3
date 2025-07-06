@echo off
echo 🚀 Starting Inbox3 Application...
echo.

REM Check if we're in the right directory
if not exist "frontend" (
    echo ❌ Please run this script from the inbox3 root directory
    echo    Current directory: %cd%
    pause
    exit /b 1
)

REM Step 1: Deploy Smart Contract
echo 📦 Step 1: Deploying Smart Contract...
cd smart-contract
echo    Funding account...
aptos account fund-with-faucet --account 0xf1768eb79d367572b8e436f8e3bcfecf938eeaf6656a65f73773c50c43b71d67

echo    Compiling contract...
aptos move compile
if %errorlevel% neq 0 (
    echo ❌ Contract compilation failed!
    pause
    exit /b 1
)

echo    Deploying to DevNet...
aptos move publish --profile devnet --assume-yes
if %errorlevel% neq 0 (
    echo ❌ Contract deployment failed!
    echo    Make sure your account is funded and you're on DevNet
    pause
    exit /b 1
)

echo ✅ Smart contract deployed successfully!
echo.

REM Step 2: Start Frontend
echo 💻 Step 2: Starting Frontend...
cd ..\frontend

echo    Installing dependencies...
pnpm install
if %errorlevel% neq 0 (
    echo    Trying with npm...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo    Starting development server...
echo.
echo ✅ Ready! The application will open in your browser.
echo    📱 Make sure your wallet is connected to DevNet
echo    🌐 Application URL: http://localhost:5173
echo.
pnpm dev

pause
