# Inbox3 — Deployment Quick Reference

**Status**: ✅ PRODUCTION READY  
**Last Updated**: May 19, 2026

---

## 🚀 Deploy in 3 Steps

### Step 1: Configure
```bash
cd frontend
cp .env.example .env
# Edit .env with your Pinata API keys from pinata.cloud/keys
```

### Step 2: Build & Test
```bash
pnpm install
pnpm build
pnpm preview    # Test locally at http://localhost:4173
```

### Step 3: Deploy
```bash
vercel --prod    # Deploy to Vercel
# OR connect repo to vercel.com and set environment variables
```

---

## 📋 Environment Variables

```bash
# Required (already correct in .env.example)
VITE_NETWORK=testnet
VITE_CONTRACT_ADDRESS=0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e

# Required (get from https://pinata.cloud/keys)
VITE_PINATA_API_KEY=<your_key>
VITE_PINATA_SECRET_KEY=<your_secret>

# Optional (for P2P calls)
VITE_SIGNALING_SERVER_URL=wss://your-server.onrender.com
```

---

## ✅ Pre-Deployment Checklist

- [ ] Pinata account created (pinata.cloud)
- [ ] Pinata API keys added to .env
- [ ] Local build succeeds (`pnpm build`)
- [ ] Local preview works (`pnpm preview`)
- [ ] Can connect wallet
- [ ] Can create inbox
- [ ] Can send message
- [ ] Vercel project created or GitHub repo connected

---

## 🔗 Useful Links

| Link | Purpose |
|------|---------|
| [Vercel New Project](https://vercel.com/new) | Create new project |
| [Pinata Dashboard](https://pinata.cloud/keys) | Get API keys |
| [Aptos Faucet](https://aptos.dev/en/network/faucet) | Get testnet APT |
| [Petra Wallet](https://petra.app/) | Install wallet |
| [Live Demo](https://inbox3-aptos.vercel.app) | See it live |

---

## 📚 Full Documentation

- **Getting Started**: [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Troubleshooting**: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- **All Docs**: [docs/INDEX.md](docs/INDEX.md)

---

## 🆘 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "Build fails" | Check Node.js 18+ and run `pnpm install` |
| "Wallet not connecting" | Install Petra wallet extension |
| "Messages not saving" | Verify Pinata API keys in .env |
| "Deployment failed" | Check environment variables in Vercel |

---

**Questions?** See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) or open an issue on GitHub.

🎉 **Ready to deploy!**
