#!/bin/bash

# Real-Time Messaging Demo Script
# This script helps test the real-time messaging functionality

echo "🚀 Inbox3 Real-Time Messaging Demo"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Testing Real-Time Messaging Features${NC}"
echo ""

# Check if frontend is running
echo -e "${YELLOW}1. Checking if frontend is running...${NC}"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running at http://localhost:5173${NC}"
else
    echo -e "${RED}❌ Frontend is not running. Please start it with: npm run dev${NC}"
    echo ""
    echo "Starting frontend now..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
    cd ..
fi

echo ""
echo -e "${YELLOW}2. Real-Time Features to Test:${NC}"
echo "   📨 Send a message and watch for instant notification"
echo "   🔄 Observe auto-refresh every 10 seconds"
echo "   ⚡ Fast refresh (3 seconds) for 30 seconds after sending"
echo "   💬 Real-time status indicator (green pulsing dot)"
echo "   🔔 Toast notifications for new messages"
echo "   ⏰ Last updated timestamp"
echo ""

echo -e "${YELLOW}3. Testing Steps:${NC}"
echo "   1. Open http://localhost:5173 in two browser tabs"
echo "   2. Connect different wallets in each tab"
echo "   3. Create inbox in both tabs"
echo "   4. Send a message from Tab 1 to Tab 2"
echo "   5. Watch Tab 2 for instant notification"
echo "   6. Verify message appears without manual refresh"
echo ""

echo -e "${YELLOW}4. Real-Time Indicators:${NC}"
echo "   🟢 Green 'Live' indicator = Real-time mode active"
echo "   🔄 'Refreshing...' text = Inbox is updating"
echo "   ⏰ 'Last updated' timestamp = Shows last refresh time"
echo "   📨 Blue notification = New message received"
echo "   ✅ Green notification = Message sent successfully"
echo ""

echo -e "${YELLOW}5. Console Debugging:${NC}"
echo "   Open browser DevTools (F12) to see real-time logs:"
echo "   - 'Setting up real-time event subscription'"
echo "   - 'Auto-refreshing inbox...'"
echo "   - 'Real-time event received'"
echo "   - 'Loading inbox - refreshKey: X'"
echo ""

echo -e "${YELLOW}6. Performance Testing:${NC}"
echo "   • Normal refresh: Every 10 seconds"
echo "   • After sending: Every 3 seconds for 30 seconds"
echo "   • Event polling: Every 2 seconds for new events"
echo "   • Notification auto-dismiss: After 5 seconds"
echo ""

echo -e "${BLUE}🔧 Troubleshooting:${NC}"
echo "   • If real-time not working: Toggle OFF/ON button"
echo "   • If no notifications: Check browser console for errors"
echo "   • If slow updates: Check network connection"
echo "   • If events not detected: Verify contract address"
echo ""

echo -e "${GREEN}🎉 Ready to test real-time messaging!${NC}"
echo "   Open http://localhost:5173 and start messaging!"
echo ""

# Wait for user input
read -p "Press Enter to continue or Ctrl+C to exit..."

# Optional: Open browser automatically
if command -v xdg-open > /dev/null 2>&1; then
    echo "Opening browser..."
    xdg-open http://localhost:5173
elif command -v open > /dev/null 2>&1; then
    echo "Opening browser..."
    open http://localhost:5173
elif command -v start > /dev/null 2>&1; then
    echo "Opening browser..."
    start http://localhost:5173
else
    echo "Please open http://localhost:5173 manually"
fi

echo ""
echo -e "${GREEN}✨ Happy real-time messaging! ✨${NC}"
