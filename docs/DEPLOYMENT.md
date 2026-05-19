# Deployment Guide

Deploy Inbox3 to production in minutes.

---

## 📋 Pre-Deployment Checklist

- ✅ Code quality verified (TypeScript, ESLint)
- ✅ Smart contract deployed to Aptos Testnet
- ✅ All features implemented and tested
- ✅ Environment variables prepared
- ✅ Pinata account configured

---

## 🚀 Deploy Frontend to Vercel

### 1. Prepare Environment

```bash
cd frontend
cp .env.example .env
```

**Edit `.env`:**
```bash
VITE_NETWORK=testnet
VITE_CONTRACT_ADDRESS=0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e
VITE_PINATA_API_KEY=<from-pinata-dashboard>
VITE_PINATA_SECRET_KEY=<from-pinata-dashboard>
VITE_PINATA_GATEWAY=gateway.pinata.cloud
```

### 2. Build

```bash
pnpm install
pnpm run build
pnpm run preview    # Test locally
```

### 3. Deploy

**Option A: Vercel CLI**
```bash
npm i -g vercel
vercel --prod
```

**Option B: GitHub Integration**
1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Set root directory: `frontend`
5. Add environment variables (copy from `.env`)
6. Deploy

### 4. Verify

```bash
# Test deployed app
curl https://your-vercel-url.vercel.app

# Check in browser
# - Wallet connects ✓
# - Can create inbox ✓
# - Can send messages ✓
```

---

## 🌐 Deploy Landing Page (Optional)

```bash
cd landing
pnpm run build
# Deploy 'dist/' to Vercel or static host
```

---

## 📡 Deploy Signaling Server (Optional)

For P2P voice/video calls:

```bash
cd signaling-server
npm install
# Deploy to Render, Railway, or similar
# Set VITE_SIGNALING_SERVER_URL in frontend .env
```

---

## ✅ Final Verification

- [ ] App loads without errors
- [ ] Wallet connection works
- [ ] Can create inbox
- [ ] Can send/receive messages
- [ ] File uploads work
- [ ] Groups work
- [ ] No console errors

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check `VITE_CONTRACT_ADDRESS` in `.env` |
| Pinata errors | Verify API keys at [pinata.cloud/keys](https://pinata.cloud/keys) |
| Wallet not connecting | Ensure supported wallet installed |
| Messages not saving | Check Pinata credentials |

👉 See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more help.

---

## 📚 Related Docs

- [GETTING_STARTED.md](GETTING_STARTED.md) — Local setup
- [PINATA_SETUP.md](PINATA_SETUP.md) — Configure IPFS storage
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Common issues
