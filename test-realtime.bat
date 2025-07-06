@echo off
echo.
echo 🚀 Inbox3 Real-Time Messaging Demo
echo ==================================
echo.

echo 📋 Testing Real-Time Messaging Features
echo.

echo 1. Checking if frontend is running...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running at http://localhost:5173
) else (
    echo ❌ Frontend is not running. Please start it with: npm run dev
    echo.
    echo Starting frontend now...
    cd frontend
    start /b npm run dev
    echo ✅ Frontend started
    cd ..
)

echo.
echo 2. Real-Time Features to Test:
echo    📨 Send a message and watch for instant notification
echo    🔄 Observe auto-refresh every 10 seconds
echo    ⚡ Fast refresh (3 seconds) for 30 seconds after sending
echo    💬 Real-time status indicator (green pulsing dot)
echo    🔔 Toast notifications for new messages
echo    ⏰ Last updated timestamp
echo.

echo 3. Testing Steps:
echo    1. Open http://localhost:5173 in two browser tabs
echo    2. Connect different wallets in each tab
echo    3. Create inbox in both tabs
echo    4. Send a message from Tab 1 to Tab 2
echo    5. Watch Tab 2 for instant notification
echo    6. Verify message appears without manual refresh
echo.

echo 4. Real-Time Indicators:
echo    🟢 Green 'Live' indicator = Real-time mode active
echo    🔄 'Refreshing...' text = Inbox is updating
echo    ⏰ 'Last updated' timestamp = Shows last refresh time
echo    📨 Blue notification = New message received
echo    ✅ Green notification = Message sent successfully
echo.

echo 5. Console Debugging:
echo    Open browser DevTools (F12) to see real-time logs:
echo    - 'Setting up real-time event subscription'
echo    - 'Auto-refreshing inbox...'
echo    - 'Real-time event received'
echo    - 'Loading inbox - refreshKey: X'
echo.

echo 6. Performance Testing:
echo    • Normal refresh: Every 10 seconds
echo    • After sending: Every 3 seconds for 30 seconds
echo    • Event polling: Every 2 seconds for new events
echo    • Notification auto-dismiss: After 5 seconds
echo.

echo 🔧 Troubleshooting:
echo    • If real-time not working: Toggle OFF/ON button
echo    • If no notifications: Check browser console for errors
echo    • If slow updates: Check network connection
echo    • If events not detected: Verify contract address
echo.

echo 🎉 Ready to test real-time messaging!
echo    Open http://localhost:5173 and start messaging!
echo.

pause

echo Opening browser...
start http://localhost:5173

echo.
echo ✨ Happy real-time messaging! ✨
echo.
pause
