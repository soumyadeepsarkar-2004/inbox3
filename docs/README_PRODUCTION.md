# Inbox3 — Decentralized Messaging on Aptos

<div align="center">

**End-to-end encrypted messaging with blockchain verification and IPFS storage**

[**Open App**](https://inbox3-aptos.vercel.app) • [Documentation](#documentation) • [Features](#features) • [Tech Stack](#tech-stack)

</div>

---

## 🚀 Quick Start

### Use the App Now
👉 **[https://inbox3-aptos.vercel.app](https://inbox3-aptos.vercel.app)**

1. Connect your wallet (Petra or Martian)
2. Create inbox
3. Start messaging!

### For Developers
```bash
git clone https://github.com/tumansutradhar/inbox-3.git
cd inbox-3/frontend
pnpm install
pnpm dev
```

---

## ✨ Features

| Feature | Status | Details |
|---------|--------|---------|
| **Direct Messaging** | ✅ | End-to-end encrypted |
| **Group Chat** | ✅ | Unlimited members |
| **File Sharing** | ✅ | IPFS + Pinata |
| **Voice/Video** | ✅ | P2P WebRTC |
| **Dark Mode** | ✅ | Light & dark themes |
| **Search** | ✅ | Full-text search |
| **Reactions** | ✅ | Emoji responses |
| **Drafts** | ✅ | Auto-save messages |

---

## 📋 Documentation

All documentation is organized in the `/docs/` folder:

### Getting Started
- [**GETTING_STARTED.md**](docs/GETTING_STARTED.md) — 5-minute setup guide
- [**DEPLOYMENT.md**](docs/DEPLOYMENT.md) — Production deployment
- [**DEPLOY_QUICK_REF.md**](docs/DEPLOY_QUICK_REF.md) — Quick reference

### Understanding the System
- [**FEATURES.md**](docs/FEATURES.md) — Complete feature list
- [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) — System design & tech details
- [**AUDIT.md**](docs/AUDIT.md) — Code quality review

### Configuration & Setup
- [**PINATA_SETUP.md**](docs/PINATA_SETUP.md) — IPFS configuration
- [**TROUBLESHOOTING.md**](docs/TROUBLESHOOTING.md) — Common issues & fixes

### Deployment Info
- [**DEPLOYMENT_STATUS.md**](docs/DEPLOYMENT_STATUS.md) — Current deployment status
- [**DEPLOYMENT_CHECKLIST.md**](docs/DEPLOYMENT_CHECKLIST.md) — Pre/post deployment checklist
- [**README.md**](docs/README.md) — Documentation hub

---

## 🏗️ Tech Stack

### Frontend
- **React 19** — UI library
- **TypeScript 5.8** — Type safety
- **Tailwind CSS 4** — Styling
- **Vite 7** — Build tool
- **@aptos-labs/wallet-adapter** — Wallet integration

### Backend & Storage
- **Aptos Testnet** — Blockchain (message metadata & groups)
- **IPFS/Pinata** — Decentralized file storage
- **TweetNaCl** — Encryption (X25519-XSalsa20-Poly1305)

### Deployment
- **Vercel** — Frontend hosting (global CDN)
- **GitHub Actions** — CI/CD pipeline
- **Move/Aptos CLI** — Smart contract deployment

---

## 🔐 Security

✅ **End-to-End Encryption** — Messages encrypted in browser only  
✅ **Wallet Authentication** — No passwords, keys stay in wallet  
✅ **Zero-Knowledge** — Backend never sees message content  
✅ **Blockchain Verified** — Messages recorded on immutable ledger  
✅ **Open Source** — Code is fully auditable  

---

## 📊 Project Status

| Component | Status | Location |
|-----------|--------|----------|
| **Live App** | ✅ LIVE | https://inbox3-aptos.vercel.app |
| **Landing Page** | ✅ LIVE | Root of Vercel deployment |
| **Smart Contract** | ✅ DEPLOYED | Aptos Testnet |
| **Documentation** | ✅ COMPLETE | `/docs/` folder (15+ guides) |
| **Tests** | ✅ PASSING | Encryption & threading tests |
| **CI/CD** | ✅ ACTIVE | GitHub Actions |

---

## 🎯 Smart Contract Details

**Network**: Aptos Testnet  
**Address**: `0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e`  
**Language**: Move

### Functions
- `create_inbox()` — Initialize user inbox
- `send_message(to, cid, key)` — Send encrypted message
- `mark_read()` — Update read status
- `create_group()` — Create group chat
- `join_group()` — Join existing group
- `send_group_message()` — Send group message

---

## 📁 Repository Structure

```
inbox-3/
├── frontend/              # React application (DEPLOYED)
│   ├── src/
│   │   ├── components/   # 25+ UI components
│   │   ├── lib/          # Encryption, IPFS, WebRTC
│   │   ├── config.ts     # Aptos configuration
│   │   └── App.tsx       # Main application
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example      # Environment template
│
├── landing/               # Marketing landing page
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── smart-contract/        # Aptos Move contract
│   ├── sources/
│   │   └── Inbox3.move
│   └── Move.toml
│
├── signaling-server/      # WebRTC signaling relay (optional)
│   ├── server.js
│   └── package.json
│
├── docs/                  # Documentation (15+ guides)
│   ├── README.md
│   ├── GETTING_STARTED.md
│   ├── DEPLOYMENT.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   └── ... (10+ more guides)
│
└── .github/
    └── workflows/         # CI/CD pipelines
```

---

## 🚀 Deployment

### Live Deployment
The application is currently deployed to Vercel:
- **Landing Page**: https://inbox3-aptos.vercel.app (root)
- **App**: https://inbox3-aptos.vercel.app (accessible via "Open Inbox" button)

### Deploy Your Own

**Frontend:**
```bash
cd frontend
pnpm install
pnpm run build
vercel --prod
```

**Landing Page:**
```bash
cd landing
npm install
npm run build
# Deploy to Vercel or Netlify
```

**Signaling Server (optional, for calls):**
```bash
cd signaling-server
npm install
npm start
# Deploy to Render, Railway, or Heroku
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

---

## 🧪 Development

### Prerequisites
- Node.js 18+
- pnpm
- Petra or Martian wallet

### Local Development

```bash
# Frontend
cd frontend
pnpm install
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm test                   # Run tests
pnpm lint                   # Lint code

# Landing page
cd landing
npm install
npm run dev

# Smart contract
cd smart-contract
./deploy.sh testnet         # Deploy to testnet
```

---

## 📖 Key Documentation Files

**New to Inbox3?**  
→ [GETTING_STARTED.md](docs/GETTING_STARTED.md)

**Want to deploy?**  
→ [DEPLOYMENT.md](docs/DEPLOYMENT.md)

**Having issues?**  
→ [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

**Want technical details?**  
→ [ARCHITECTURE.md](docs/ARCHITECTURE.md)

**Complete documentation index:**  
→ [docs/README.md](docs/README.md)

---

## 🔗 Important Links

| Resource | Link |
|----------|------|
| **Live App** | https://inbox3-aptos.vercel.app |
| **GitHub** | https://github.com/tumansutradhar/inbox-3 |
| **Issues** | https://github.com/tumansutradhar/inbox-3/issues |
| **Discussions** | https://github.com/tumansutradhar/inbox-3/discussions |
| **Aptos Docs** | https://aptos.dev/ |
| **Pinata** | https://pinata.cloud/ |
| **Vercel** | https://vercel.com/ |

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) file for details.

---

## ❓ FAQ

**Q: Is my data private?**  
A: Yes! Messages are encrypted end-to-end in your browser. Only the recipient can decrypt them.

**Q: Do I need to pay?**  
A: No! Inbox3 is completely free. You only need a wallet and some APT tokens for transaction fees (testnet is free).

**Q: Can I use it on mobile?**  
A: Yes! The app is fully responsive and works on mobile browsers.

**Q: Is the source code open?**  
A: Yes! The entire codebase is open source and auditable.

**Q: Where is my data stored?**  
A: Message metadata is on Aptos blockchain. Content is encrypted and stored on IPFS (via Pinata).

---

## 📞 Support

- **Documentation**: See [docs/](docs/) folder
- **Bug Reports**: [GitHub Issues](https://github.com/tumansutradhar/inbox-3/issues)
- **Questions**: [GitHub Discussions](https://github.com/tumansutradhar/inbox-3/discussions)
- **Community**: [Aptos Discord](https://discord.gg/aptosnetwork)

---

**Ready to start?** 👉 [**Open Inbox3 App**](https://inbox3-aptos.vercel.app)

---

**Status**: ✅ Production Ready  
**Last Updated**: May 19, 2026
