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
cd frontend
vercel --prod
```

**Option B: GitHub Integration**
1. Push to GitHub: `git push origin main`
2. Go to https://vercel.com/new
3. Import your repository
4. Set **Root Directory** to `frontend`
5. Add environment variables from `.env`
6. Deploy

**Verify deployment:**
- ✅ App loads at `https://your-app.vercel.app`
- ✅ Wallet connect works
- ✅ Can create inbox
- ✅ Can send messages

---

## 🌐 Landing Page

The landing page is automatically built and served from `landing/` folder.

---

## 📡 Signaling Server (Optional)

For P2P voice/video calls, deploy signaling server:

```bash
# Deploy to Render.com
# New Web Service → Connect GitHub repo
# Build Command: npm install
# Start Command: node server.js
# Port: 8080

# Then update frontend/.env:
VITE_SIGNALING_SERVER_URL=wss://your-server.onrender.com
```

---

## ✅ Final Verification Checklist

### Frontend
- [ ] App loads without errors
- [ ] Can connect wallet
- [ ] Can create inbox
- [ ] Can send/receive messages
- [ ] Dark mode works
- [ ] Groups work
- [ ] No console errors

### Features
- [ ] Messaging encrypted
- [ ] Messages persist
- [ ] Read status updates
- [ ] Unread count accurate

### Security
- [ ] Wallet required
- [ ] Messages encrypted
- [ ] No plaintext in console
- [ ] HTTPS enforced

---

## 🎉 Ready for Production!

Once all checklist items verified, deployment is complete and ready for users.

See [DEPLOY_QUICK_REF.md](DEPLOY_QUICK_REF.md) for quick reference.
