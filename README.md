# Inbox3 — Decentralized Messaging on Aptos

<div align="center">

**End-to-end encrypted messaging with blockchain verification and IPFS storage**

[**Open App**](https://inbox3-aptos.vercel.app) • [Documentation](#documentation) • [Features](#features) • [Tech Stack](#tech-stack)

</div>

---



</div>

---

## What is Inbox3?

Inbox3 is a **fully-decentralized messaging platform** built on the Aptos blockchain with IPFS storage and end-to-end encryption. Send secure messages, create groups, share files, and make P2P calls — all without a central server.

### Core Features

✅ **Direct Messages** — 1-on-1 encrypted conversations  
✅ **Group Chat** — Create unlimited group chats  
✅ **File Sharing** — IPFS-backed file storage  
✅ **Voice/Video Calls** — P2P WebRTC connections (optional)  
✅ **Message Reactions** — Emoji responses  
✅ **Full-Text Search** — Find messages instantly  
✅ **Dark Mode** — Beautiful dark & light themes  
✅ **Offline Support** — Queue messages when offline  

---

## ⚡ Quick Start

### 1. Get Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Petra wallet](https://petra.app/) or [Martian](https://martianwallet.xyz/)
- [Pinata account](https://pinata.cloud/) (free tier works)

### 2. Install & Run

```bash
git clone https://github.com/tumansutradhar/inbox-3.git
cd inbox-3/frontend

pnpm install
cp .env.example .env
# Edit .env with your Pinata keys

pnpm dev
# Open http://localhost:5173
```

### 3. Start Messaging

1. Click **"Connect Wallet"**
2. Select your wallet
3. Click **"Create Inbox"**
4. Start sending messages!

👉 See [Quick Start Guide](docs/GETTING_STARTED.md) for detailed instructions.

---

## 🎯 Features

### 💬 Messaging
- Direct messages with E2E encryption
- Group chats with unlimited members
- Message reactions (emojis)
- Reply threading
- Full-text search across all messages
- Drafts auto-save
- Export conversations (JSON/CSV/TXT)

### 📁 File Sharing
- Drag-and-drop upload
- Support: images, PDFs, documents
- Max size: 10 MB
- Stored on IPFS (via Pinata)
- Encrypted transmission

### 🎨 User Experience
- Responsive design (mobile to 4K)
- Dark/light mode toggle
- Keyboard shortcuts (press `?`)
- Read receipts & typing indicators
- Unread message badges
- Smooth animations

### 🎥 Voice & Video Calls
- P2P WebRTC connections
- Peer-to-peer (no server in the middle)
- Optional (requires signaling server)
- Audio and video support

See [Complete Feature List](docs/FEATURES.md) for all capabilities.

---

## 🏗️ Architecture

```
Frontend (React 19)
    ↓
Aptos Blockchain (Smart Contract)
    ├─ Message metadata
    ├─ Group management
    └─ Read receipts
    
IPFS (File Storage)
    └─ Encrypted message content
    
WebRTC (Calls, optional)
    └─ P2P voice/video
```

**Key Tech Stack:**
- **Blockchain**: Aptos (Move language)
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Storage**: IPFS (via Pinata)
- **Encryption**: TweetNaCl Box (X25519-XSalsa20-Poly1305)
- **Calls**: WebRTC + lightweight signaling server
- **Deployment**: Vercel (frontend) + Aptos (contract)

👉 See [Architecture Guide](docs/ARCHITECTURE.md) for deep dive.

---

## 🚀 Deployment

### Frontend
```bash
cd frontend
pnpm run build
# Deploy to Vercel, Netlify, or any static host
```

### Signaling Server (optional, for calls)
```bash
cd signaling-server
npm install
# Deploy to Render, Railway, or similar
```

### Smart Contract (already deployed)
- **Network**: Aptos Testnet
- **Address**: `0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e`
- **Status**: ✅ Live and functioning

👉 See [Deployment Guide](docs/DEPLOYMENT.md) for step-by-step instructions.

---

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| [**GETTING_STARTED.md**](docs/GETTING_STARTED.md) | 5-minute local setup |
| [**DEPLOYMENT.md**](docs/DEPLOYMENT.md) | Production deployment |
| [**FEATURES.md**](docs/FEATURES.md) | Complete feature list |
| [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) | System design & tech details |
| [**PINATA_SETUP.md**](docs/PINATA_SETUP.md) | Configure IPFS storage |
| [**TROUBLESHOOTING.md**](docs/TROUBLESHOOTING.md) | Common issues & fixes |
| [**AUDIT.md**](docs/AUDIT.md) | Code quality review |

---

## 🔐 Security

✅ **End-to-End Encryption** — Messages encrypted in browser, never in plaintext on server  
✅ **Wallet-Based Auth** — No passwords, keys stay in wallet  
✅ **Immutable Ledger** — Messages recorded on blockchain  
✅ **Zero-Knowledge** — Server/blockchain never sees message content  
✅ **Open Source** — Code auditable, no hidden back doors  

---

## 📊 Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Frontend** | ✅ Production Ready | Vercel deployable |
| **Smart Contract** | ✅ Live on Testnet | Ready for mainnet |
| **IPFS** | ✅ Configured | Via Pinata integration |
| **Calls** | ✅ Ready | Optional component |
| **Documentation** | ✅ Complete | 7 comprehensive guides |

---

## 🤝 Contributing

We welcome contributions! 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📋 Project Structure

```
inbox-3/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # 25+ UI components
│   │   ├── lib/          # Encryption, IPFS, WebRTC modules
│   │   ├── styles/       # Tailwind CSS
│   │   └── config.ts     # Aptos configuration
│   ├── package.json
│   └── .env.example      # Environment template
│
├── smart-contract/        # Aptos Move contract
│   ├── sources/
│   │   └── Inbox3.move
│   └── Move.toml
│
├── signaling-server/      # WebRTC signaling (optional)
│   ├── server.js
│   └── package.json
│
├── landing/               # Marketing landing page
│   ├── src/
│   └── package.json
│
├── docs/                  # Documentation
│   ├── GETTING_STARTED.md
│   ├── DEPLOYMENT.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   └── ... (7 guides total)
│
└── .github/
    ├── workflows/         # CI/CD pipelines
    └── PULL_REQUEST_TEMPLATE.md
```

---

## 🔗 Useful Links

| Link | Purpose |
|------|---------|
| [Live Demo](https://inbox3-aptos.vercel.app) | Try the app |
| [GitHub](https://github.com/tumansutradhar/inbox-3) | Source code |
| [Issues](https://github.com/tumansutradhar/inbox-3/issues) | Report bugs |
| [Discussions](https://github.com/tumansutradhar/inbox-3/discussions) | Ask questions |
| [Aptos Docs](https://aptos.dev/) | Blockchain info |
| [IPFS Docs](https://docs.ipfs.io/) | Storage info |
| [Petra Wallet](https://petra.app/) | Get wallet |
| [Pinata](https://pinata.cloud/) | Get API keys |

---

## ⚙️ Environment Setup

### Required Variables

```bash
VITE_NETWORK=testnet
VITE_CONTRACT_ADDRESS=0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e
VITE_PINATA_API_KEY=<your_key>
VITE_PINATA_SECRET_KEY=<your_secret>
```

### Optional Variables

```bash
VITE_SIGNALING_SERVER_URL=wss://your-signaling-server.onrender.com
```

👉 Get Pinata keys from [pinata.cloud/keys](https://pinata.cloud/keys)

---

## 💻 Development

```bash
# Frontend
cd frontend
pnpm install
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm test             # Run tests
pnpm lint             # Lint code

# Signaling Server
cd signaling-server
npm install
npm start             # Start server on localhost:8080

# Smart Contract
cd smart-contract
./deploy.sh testnet   # Deploy to testnet
```

---

## 🐛 Troubleshooting

### "Build fails with Tailwind error"
**Solution**: Ensure Tailwind CSS is v4.1+: `npm ls tailwindcss`

### "Can't connect wallet"
**Solution**: Install [Petra wallet](https://petra.app/) browser extension

### "Messages not persisting"
**Solution**: Set Pinata API keys in `.env` file

### "File upload fails"
**Solution**: Check Pinata API credentials and account has storage quota

👉 See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more solutions.

---

## 📜 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Aptos Labs](https://aptoslabs.com/) — Blockchain platform
- [Protocol Labs](https://protocol.ai/) — IPFS technology
- [Petra Wallet](https://petra.app/) — Wallet integration
- [Pinata](https://pinata.cloud/) — IPFS hosting

---

## 📞 Support

- 📖 **Documentation**: See [docs/](docs/) folder
- 🐛 **Bug Report**: [GitHub Issues](https://github.com/tumansutradhar/inbox-3/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/tumansutradhar/inbox-3/discussions)
- 📧 **Email**: Check GitHub profile

---

<div align="center">

**Made with ❤️ by Inbox3 Team**

[⭐ Star us on GitHub](https://github.com/tumansutradhar/inbox-3) | [🚀 Deploy Now](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftumansutradhar%2Finbox-3&project-name=inbox3&env=VITE_PINATA_API_KEY,VITE_PINATA_SECRET_KEY)

</div>