# Deploy Quick Reference

Deploy Inbox3 to production in 3 easy steps.

---

## ⚡ 3-Step Deploy

### 1️⃣ Configure Environment
```bash
cd frontend
cp .env.example .env
# Edit .env with Pinata API keys from https://pinata.cloud/keys
```

### 2️⃣ Build & Test Locally
```bash
pnpm install
pnpm build
pnpm preview    # Test at http://localhost:4173
```

### 3️⃣ Deploy to Vercel
```bash
vercel --prod
# OR go to https://vercel.com/new and connect GitHub repo
# Set Root Directory: frontend
# Add env variables from .env
```

---

## 📋 Environment Variables

```bash
# Frontend/.env
VITE_NETWORK=testnet
VITE_CONTRACT_ADDRESS=0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e
VITE_PINATA_API_KEY=your_key_here
VITE_PINATA_SECRET_KEY=your_secret_here
VITE_PINATA_GATEWAY=gateway.pinata.cloud
# VITE_SIGNALING_SERVER_URL=wss://optional-for-calls (optional)
```

---

## ✅ Verify Deployment

After deploying to Vercel:

- [ ] App loads at `your-vercel-url.vercel.app`
- [ ] Wallet connects
- [ ] Can create inbox
- [ ] Can send message
- [ ] No console errors

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Run `pnpm install` first |
| Wallet won't connect | Install Petra wallet |
| Messages not saving | Check Pinata API keys |
| Build takes too long | Clear cache: `rm -rf node_modules` |

---

## 🔗 Links

- **Vercel**: https://vercel.com/new
- **Pinata Keys**: https://pinata.cloud/keys
- **Petra Wallet**: https://petra.app
- **Aptos Faucet**: https://aptos.dev/en/network/faucet

---

## 📚 Full Guides

- [Complete Deployment](DEPLOYMENT.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [Getting Started](GETTING_STARTED.md)

---

**Ready?** Run the 3 steps above! 🚀
