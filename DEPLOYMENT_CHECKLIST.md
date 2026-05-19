# Inbox3 — Complete Deployment Checklist ✅

**Last Updated:** May 19, 2026  
**Status:** ✅ **READY FOR PRODUCTION**

---

## 🎯 Pre-Deployment Verification

### Code Quality
- ✅ All TypeScript compilation errors fixed
- ✅ Tailwind CSS classes updated to latest syntax (`bg-linear-to-br`, `shrink-0`)
- ✅ Environment variable naming standardized (`VITE_*` prefix)
- ✅ ESLint rules compliant

### Smart Contract
- ✅ All entry functions have correct modifiers: `create_inbox`, `send_message`, `mark_read`
- ✅ Group chat functions implemented: `create_group`, `join_group`, `send_group_message`
- ✅ Contract deployed to **Aptos Testnet**: `0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e`
- ✅ View functions implemented: `inbox_of`, `outbox_of`, `groups_of`

### Frontend Features
- ✅ **Messaging**: Direct messages with E2E encryption (TweetNaCl Box)
- ✅ **Groups**: Create and join groups, group messaging
- ✅ **Calls**: WebRTC voice & video calls via signaling relay
- ✅ **File Uploads**: IPFS integration with Pinata
- ✅ **Rich Features**: Reactions, threading, GIFs, drafts, profiles, dark mode
- ✅ **Performance**: PerformanceDashboard component included
- ✅ **Security**: Client-side encryption, zero-knowledge backend

### Real-Time System
- ✅ Conservative polling strategy (avoids API rate limits)
- ✅ Fallback to periodic refresh (every 15-45 seconds)
- ✅ Smart intervals: faster after message send, slower during idle
- ✅ Graceful degradation if signaling server unavailable

---

## 📋 Prerequisites

### Required Services
- [ ] **Aptos Wallet** (user-side): Petra or Martian wallet installed
- [ ] **Pinata Account** (for IPFS): Free tier available at https://pinata.cloud
- [ ] **Signaling Server** (optional, for P2P calls): Can deploy to Render, Railway, or similar

### Developer Environment
- [ ] Node.js 18+
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Git configured with your GitHub credentials

---

## 🚀 Frontend Deployment (Vercel)

### Step 1: Setup Environment Variables

```bash
cd frontend
cp .env.example .env
```

**Edit `.env` with your values:**

```bash
# Network (already correct)
VITE_NETWORK=testnet

# Smart contract (pre-filled with live address — no changes needed)
VITE_CONTRACT_ADDRESS=0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e

# IPFS (get from Pinata: https://pinata.cloud/keys)
VITE_PINATA_API_KEY=your_api_key_here
VITE_PINATA_SECRET_KEY=your_secret_key_here
VITE_PINATA_GATEWAY=gateway.pinata.cloud

# Signaling server (optional, can be added later)
# VITE_SIGNALING_SERVER_URL=wss://your-server.onrender.com
```

### Step 2: Build Locally

```bash
cd frontend
pnpm install
pnpm run build
```

✅ **Expected Output:**
- No TypeScript errors
- No ESLint errors  
- Build succeeds without warnings

### Step 3: Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm i -g vercel
vercel
```

**Option B: GitHub Integration**
1. Push to GitHub: `git push origin main`
2. Connect repo at https://vercel.com/new
3. Set **Root Directory** to `frontend`
4. Add environment variables from `.env`
5. Deploy

**Verify deployment:**
- ✅ App loads at https://your-app.vercel.app
- ✅ Wallet connect works
- ✅ Can create inbox
- ✅ Can send messages

---

## 🌐 Landing Page Deployment

### Step 1: Verify Landing Page Build

```bash
cd landing
pnpm install
pnpm run build
```

✅ **Expected Output:**
- Build output in `landing/dist/`
- No errors
- File size < 500KB

### Step 2: Deploy Landing Page to Vercel

The main `vercel.json` is configured to build and serve the landing page:

```json
{
  "installCommand": "npm --prefix landing ci",
  "buildCommand": "npm --prefix landing run build",
  "outputDirectory": "landing/dist"
}
```

This means when you deploy the root folder to Vercel, it will automatically build and serve the landing page.

---

## 📡 Signaling Server (Optional — for P2P Calls)

### If you want to enable voice/video calls:

**Step 1: Deploy to Render.com**

```bash
# Push signaling server code to GitHub
git push origin main

# On render.com:
# 1. New > Web Service
# 2. Connect your GitHub repo
# 3. Build Command: npm install
# 4. Start Command: node server.js
# 5. Environment: Node.js
# 6. Port: 8080 (auto-detected)
# 7. Deploy
```

**Step 2: Update Frontend Env Variable**

```bash
# Add to frontend/.env:
VITE_SIGNALING_SERVER_URL=wss://your-app.onrender.com
```

Redeploy frontend on Vercel.

---

## ✅ Final Verification Checklist

### Frontend
- [ ] App loads without errors
- [ ] Can connect wallet (Petra/Martian)
- [ ] Can create inbox (transaction successful)
- [ ] Can send and receive messages
- [ ] Dark mode toggle works
- [ ] Can create and join groups
- [ ] Profile editor works
- [ ] Draft manager saves/loads correctly
- [ ] Keyboard shortcuts work (press `?`)
- [ ] Export chat feature works
- [ ] No console errors

### Messaging Features
- [ ] Direct messages encrypt properly
- [ ] Messages persist after page reload
- [ ] Read status updates correctly
- [ ] Unread count accurate
- [ ] Message timestamps correct
- [ ] Sender info displays correctly

### Group Features
- [ ] Can create groups
- [ ] Can join groups by address
- [ ] Group messages appear in order
- [ ] Group members list accurate
- [ ] Can leave groups

### Optional Features (if signaling server deployed)
- [ ] Can initiate voice call
- [ ] Can initiate video call  
- [ ] Incoming call notifications work
- [ ] Can accept/reject calls
- [ ] Audio/video streams work
- [ ] Call duration displays

### Performance
- [ ] Page loads < 3 seconds
- [ ] Messages load < 1 second
- [ ] No memory leaks (check DevTools)
- [ ] PerformanceDashboard shows metrics

### Security
- [ ] Wallet address required to send messages
- [ ] Messages encrypted client-side
- [ ] Private keys never leave browser
- [ ] No sensitive data in console
- [ ] HTTPS enforced (Vercel default)

---

## 🔍 Known Limitations & Workarounds

### Rate Limiting
- **Issue**: Aptos API has rate limits (50,000 compute units / 300 seconds per IP)
- **Solution**: Conservative polling strategy implemented
  - Poll every 15-45 seconds (not aggressive 2-10 second polling)
  - Manual refresh available in UI
  - Faster refresh only after sending a message
- **Workaround**: Users can add Aptos API key to avoid rate limits (not implemented yet)

### Signaling Server Optional
- **Issue**: If signaling server unavailable, calls won't work
- **Solution**: App remains fully functional for messaging
- **Workaround**: Deploy signaling server to reliable host with uptime monitoring

### Browser Compatibility
- **Tested**: Chrome, Firefox, Safari, Edge
- **Known Issues**: 
  - IE 11 not supported (uses modern ES2023)
  - Mobile webrtc may have issues on some devices

---

## 📊 Deployment Statistics

| Component | Status | URL | Performance |
|-----------|--------|-----|-------------|
| Frontend | ✅ Ready | `*.vercel.app` | Vite optimized |
| Landing | ✅ Ready | Same as frontend | < 500KB |
| Smart Contract | ✅ Deployed | Testnet | Live |
| Signaling Server | ⏳ Optional | Optional | N/A |

---

## 🆘 Troubleshooting

### Frontend Won't Build
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run build
```

### Environment Variables Not Working
```bash
# Make sure .env is in correct location:
# frontend/.env (NOT frontend/src/.env)

# Restart dev server after updating:
pnpm dev
```

### Wallet Connect Fails
- [ ] Wallet extension installed and enabled
- [ ] Switched to **Testnet** in wallet settings
- [ ] Wallet has APT balance for gas
- [ ] Try disconnecting and reconnecting wallet

### Messages Not Saving
- [ ] Check browser console for CORS errors
- [ ] Verify `VITE_PINATA_API_KEY` is correct
- [ ] Test IPFS upload manually
- [ ] Check Pinata dashboard for quota usage

### Calls Not Working
- [ ] Check `VITE_SIGNALING_SERVER_URL` is correct
- [ ] Verify signaling server is running (`https://server-url/health`)
- [ ] Check browser console for WebRTC errors
- [ ] Ensure microphone/camera permissions granted

---

## 📞 Support & Community

- **GitHub Issues**: https://github.com/tumansutradhar/inbox-3/issues
- **Documentation**: See `/docs` folder
- **Live Demo**: https://inbox3-aptos.vercel.app

---

## 🎉 Launch Complete!

Once all checklist items are verified, your Inbox3 instance is **production-ready** and can accept real users.

**Next Steps:**
1. Monitor error logs
2. Gather user feedback
3. Iterate on improvements
4. Consider mainnet deployment when ready

**Congratulations!** 🚀
