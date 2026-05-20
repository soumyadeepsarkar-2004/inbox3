@echo off
REM Inbox3 Production Deployment Script for Windows

setlocal enabledelayedexpansion

echo 🚀 Inbox3 Production Deployment
echo ==================================
echo.

REM Check Node.js
echo 📋 Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js !NODE_VERSION!

REM Check pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing pnpm...
    call npm install -g pnpm
)

for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
echo ✓ pnpm !PNPM_VERSION!

REM Check Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git not found. Please install Git
    exit /b 1
)

for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
echo ✓ !GIT_VERSION!

echo.
echo 🔧 Setting up environment...
echo.

REM Navigate to frontend
cd /d frontend

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found
    echo Creating .env from .env.example...
    copy .env.example .env
    echo ⚠️  Please edit frontend\.env with your Pinata API keys
    echo Get keys from: https://pinata.cloud/keys
    exit /b 1
)

echo ✓ Environment variables configured
echo.
echo 📦 Installing dependencies...
call pnpm install

echo.
echo 🏗️  Building frontend...
call pnpm run build

if exist dist (
    echo ✓ Build successful
) else (
    echo ❌ Build failed
    exit /b 1
)

echo.
echo 🌐 Deploying to Vercel...
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    call npm install -g vercel
)

REM Deploy
call vercel --prod

echo.
echo ✅ Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Visit your Vercel deployment URL
echo 2. Connect your wallet
echo 3. Create an inbox
echo 4. Test messaging feature
echo.
echo 📚 Documentation:
echo - Deployment Checklist: docs/DEPLOYMENT_CHECKLIST.md
echo - Feature Verification: docs/FEATURE_VERIFICATION.md
echo - Troubleshooting: docs/TROUBLESHOOTING.md
echo.
echo 🎉 Deployment successful!

pause
