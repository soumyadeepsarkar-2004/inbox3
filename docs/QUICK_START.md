# Inbox3 — Quick Start Guide

Get **Inbox3** running locally in 5 minutes.

---

## ⚡ 5-Minute Setup

### 1. Clone Repository
```bash
git clone https://github.com/tumansutradhar/inbox-3.git
cd inbox-3
```

### 2. Install Frontend Dependencies
```bash
cd frontend
pnpm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

**Edit `frontend/.env`:**
```bash
VITE_NETWORK=testnet
VITE_CONTRACT_ADDRESS=0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e
VITE_PINATA_API_KEY=your_api_key          # Get from pinata.cloud
VITE_PINATA_SECRET_KEY=your_secret_key    # Get from pinata.cloud
VITE_PINATA_GATEWAY=gateway.pinata.cloud
# VITE_SIGNALING_SERVER_URL=wss://... (optional for calls)
```

### 4. Start Development Server
```bash
pnpm dev
```

Open **http://localhost:5173** in your browser.

### 5. Connect Wallet
1. Click **"Connect Wallet"**
2. Select **Petra** or **Martian** wallet
3. Approve connection
4. Click **"Create Inbox"**
5. Approve transaction
6. Start messaging! 🎉

---

## 📦 Environment Variables

### Required
| Variable | Value | Where to Get |
|----------|-------|--------------|
| `VITE_NETWORK` | `testnet` | Fixed |
| `VITE_CONTRACT_ADDRESS` | Pre-filled address | Already set |
| `VITE_PINATA_API_KEY` | Your API key | https://pinata.cloud/keys |
| `VITE_PINATA_SECRET_KEY` | Your secret key | https://pinata.cloud/keys |

### Optional
| Variable | Purpose |
|----------|---------|
| `VITE_SIGNALING_SERVER_URL` | Enable P2P voice/video calls |

---

## 🧪 Test Features Locally

### Direct Messaging
1. Create inbox (one wallet)
2. Send message to another address
3. Switch wallets to receive
4. Verify message appears

### Group Chat
1. Create a group (wallet 1)
2. Get group address
3. Join group (wallet 2)
4. Send group message
5. Both wallets see message

### File Upload
1. Send a message
2. Click paperclip icon
3. Select image (< 10MB)
4. Message with file sends
5. File appears in conversation

### Calls (if signaling server running)
1. Open chat with user
2. Click "Voice Call" or "Video Call"
3. Grant permissions
4. Call initiates

---

## 🚀 Building for Production

### Frontend
```bash
cd frontend
pnpm run build
pnpm run preview  # Test production build locally
```

### Landing Page
```bash
cd landing
pnpm run build
pnpm run preview
```

---

## 📚 Folder Structure

```
inbox-3/
├── frontend/                 # React app (main UI)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities (encryption, IPFS, WebRTC)
│   │   └── config.ts        # Aptos config
│   ├── .env.example         # Environment template
│   └── package.json
│
├── landing/                  # Marketing landing page
│   ├── src/
│   └── package.json
│
├── smart-contract/          # Move contract for Aptos
│   ├── sources/
│   │   └── Inbox3.move
│   └── deploy.sh
│
├── signaling-server/        # WebSocket relay for calls (optional)
│   ├── server.js
│   └── package.json
│
├── docs/                     # Documentation
└── README.md
```

---

## ✅ Common Issues & Fixes

### "Contract not found" Error
**Problem**: Contract address not set in `.env`  
**Fix**: Check `VITE_CONTRACT_ADDRESS` is correct in `frontend/.env`

### "Failed to upload file" Error
**Problem**: Invalid Pinata credentials  
**Fix**: Double-check API key and secret in `.env`

### "Wallet not connecting"
**Problem**: Browser extension not installed  
**Fix**: Install Petra wallet: https://petra.app

### Messages not persisting
**Problem**: Missing Pinata configuration  
**Fix**: Get Pinata keys from https://pinata.cloud/keys

### Slow refresh
**Problem**: API rate limiting  
**Fix**: This is expected. Refresh happens every 15-45 seconds to stay within limits.

---

## 🧑‍💻 Development Commands

### Frontend
```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm test             # Run tests
pnpm lint             # Run ESLint
```

### Landing Page
```bash
cd landing
pnpm dev
pnpm build
```

### Smart Contract
```bash
cd smart-contract
./deploy.sh testnet   # Deploy to testnet
./deploy.sh mainnet   # Deploy to mainnet (requires approval)
```

---

## 📖 Documentation

- **[HOW_TO_RUN.md](docs/HOW_TO_RUN.md)** — Detailed setup instructions
- **[PINATA_SETUP.md](docs/PINATA_SETUP.md)** — Pinata configuration guide
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** — Common issues & solutions
- **[REALTIME_SYSTEM.md](docs/REALTIME_SYSTEM.md)** — Real-time messaging details
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** — Production deployment guide
- **[FEATURE_VERIFICATION.md](FEATURE_VERIFICATION.md)** — Feature test checklist

---

## 🔗 Important Links

- **Live App**: https://inbox3-aptos.vercel.app
- **GitHub**: https://github.com/tumansutradhar/inbox-3
- **Petra Wallet**: https://petra.app
- **Aptos Faucet**: https://aptos.dev/en/network/faucet
- **Pinata**: https://pinata.cloud

---

## 🎯 Next Steps

1. ✅ Complete setup above
2. ✅ Connect wallet and create inbox
3. ✅ Test sending messages
4. ✅ Verify all features work
5. ✅ Review [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
6. ✅ Deploy to Vercel

---

## 💡 Tips

- **Faster development**: Use `pnpm` instead of `npm` (2x faster)
- **Multiple wallets**: Test with Petra and Martian to verify multi-wallet support
- **Check console**: Press F12 and look for any errors during testing
- **Clear cache**: If something breaks, try clearing browser cache
- **Local calls**: For testing calls, run signaling server locally first

---

## 🆘 Need Help?

1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Review [HOW_TO_RUN.md](docs/HOW_TO_RUN.md)
3. Open issue on GitHub

---

**Ready to go!** 🚀

Run `cd frontend && pnpm dev` and start messaging on the blockchain.
