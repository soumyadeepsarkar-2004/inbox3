# Getting Started with Inbox3

**Get Inbox3 running locally in 5 minutes.**

---

## ⚡ Quick Setup

### Prerequisites
- **Node.js 18+** ([nodejs.org](https://nodejs.org/))
- **pnpm** (`npm install -g pnpm`)
- **Wallet**: [Petra](https://petra.app/) or [Martian](https://martianwallet.xyz/)
- **Pinata account** (free): [pinata.cloud](https://pinata.cloud)

### Installation

```bash
# 1. Clone and install
git clone https://github.com/tumansutradhar/inbox-3.git
cd inbox-3/frontend
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your Pinata keys (see PINATA_SETUP.md)

# 3. Start dev server
pnpm dev
# Open http://localhost:5173
```

### First Steps

1. Click **"Connect Wallet"** → Select Petra/Martian → Approve
2. Click **"Create Inbox"** → Approve transaction
3. **Send message** to any wallet address
4. **Create a group** and invite friends
5. 🎉 Start messaging!

---

## 📚 Environment Variables

| Variable | Example | Source |
|----------|---------|--------|
| `VITE_NETWORK` | `testnet` | Fixed |
| `VITE_CONTRACT_ADDRESS` | `0x2fb49...` | Pre-filled |
| `VITE_PINATA_API_KEY` | `xxx` | [pinata.cloud](https://pinata.cloud/keys) |
| `VITE_PINATA_SECRET_KEY` | `xxx` | [pinata.cloud](https://pinata.cloud/keys) |
| `VITE_SIGNALING_SERVER_URL` | `wss://...` | Optional (for calls) |

👉 See [PINATA_SETUP.md](PINATA_SETUP.md) for detailed Pinata configuration.

---

## 🧪 Test Features

### Direct Messages
```
1. Create inbox (wallet 1)
2. Send message to wallet 2 address
3. Switch wallets (use test wallet browser)
4. Receive message ✓
```

### Groups
```
1. Create group (wallet 1)
2. Get group address
3. Join with wallet 2
4. Send group message ✓
```

### Files
```
1. Click paperclip icon
2. Select image (< 10MB)
3. File uploads to IPFS ✓
4. Appears in conversation ✓
```

### Calls (optional)
```
1. Setup signaling server (optional)
2. Click "Voice Call"
3. Grant permissions
4. Call connects ✓
```

---

## 🚀 Build for Production

```bash
# Frontend
cd frontend
pnpm run build        # Creates dist/
pnpm run preview      # Test build locally

# Landing page
cd landing
pnpm run build
pnpm run preview
```

---

## 📖 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** — Deploy to production
- **[FEATURES.md](FEATURES.md)** — Feature checklist
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — Common issues
- **[PINATA_SETUP.md](PINATA_SETUP.md)** — File storage setup
- **[REALTIME_SYSTEM.md](REALTIME_SYSTEM.md)** — Real-time messaging
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — System design

---

## ⚠️ Common Issues

| Issue | Fix |
|-------|-----|
| "Contract not found" | Check `VITE_CONTRACT_ADDRESS` in `.env` |
| "Upload failed" | Verify Pinata API keys in `.env` |
| "Wallet not connecting" | Install [Petra wallet](https://petra.app) |
| "Messages disappear" | Configure Pinata (see PINATA_SETUP.md) |
| "Slow refresh" | Expected: 15-45s intervals to avoid rate limits |

👉 See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more solutions.

---

## 🔗 Quick Links

| Link | Purpose |
|------|---------|
| [Live App](https://inbox3-aptos.vercel.app) | Production deployment |
| [GitHub](https://github.com/tumansutradhar/inbox-3) | Source code |
| [Petra Wallet](https://petra.app) | Wallet extension |
| [Aptos Faucet](https://aptos.dev/en/network/faucet) | Get testnet APT |
| [Pinata Dashboard](https://pinata.cloud) | Manage files |

---

## 💡 Pro Tips

- **2x faster installs**: Use `pnpm` instead of `npm`
- **Test multi-wallet**: Open app in 2 browser tabs with different wallets
- **Debug**: Press F12 → Console to see errors
- **Reset**: Clear browser cache if something breaks
- **Testnet APT**: Get free APT from [Aptos Faucet](https://aptos.dev/en/network/faucet)

---

## ✅ Ready?

```bash
cd frontend && pnpm dev
```

Open http://localhost:5173 and **start messaging!** 🎉
