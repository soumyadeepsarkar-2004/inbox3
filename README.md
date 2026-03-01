# Inbox3 — Decentralized Messaging Platform

<div align="center">

![Inbox3 Logo](https://img.shields.io/badge/Inbox3-Decentralized_Messaging-FF6B35?style=for-the-badge)
[![Aptos](https://img.shields.io/badge/Aptos-Blockchain-00D4FF?style=for-the-badge)](https://aptoslabs.com/)
[![IPFS](https://img.shields.io/badge/IPFS-Storage-65C2CB?style=for-the-badge)](https://ipfs.io/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://inbox3-aptos.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**A fully-featured decentralized messaging application built on the Aptos blockchain with IPFS storage, WebRTC calls, and end-to-end encryption.**

### 🌐 [Try it Live →](https://inbox3-aptos.vercel.app)

[Quick Start](#-quick-start) • [Features](#-features-overview) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

<div align="center">

![Inbox3 App Mockup](frontend/public/chats-mockup.png)

*Secure messaging reimagined — Connect your wallet, select your provider, start messaging on the blockchain*

</div>

---

## ✅ Core Infrastructure

- Smart contract deployed to **Aptos Testnet**
- All blockchain entry functions compiled and tested
- IPFS integration via **Pinata** for decentralized message storage
- Configurable real-time message sync (rate-limit safe)
- Offline message queue with automatic sync on reconnect
- WebRTC voice & video calls via lightweight signaling relay
- Cross-browser compatible (Chrome, Edge, Firefox, Safari)

---

## 🚀 Features Overview

### 💬 Messaging Capabilities

| Feature | Component | Description |
|---------|-----------|-------------|
| **Direct Messages** | `Inbox.tsx` | End-to-end encrypted 1-on-1 conversations |
| **Group Chat** | `GroupChat.tsx` | Create and join unlimited group conversations |
| **Voice & Video Calls** | `CallInterface.tsx` | WebRTC peer-to-peer calls |
| **Voice Messages** | `FileUpload.tsx` | Record and send audio messages (WebM Opus) |
| **File Attachments** | `FileUpload.tsx` | Images (JPEG, PNG, GIF, WebP) and documents (PDF, TXT, JSON) up to 10 MB |
| **IPFS Uploads** | `IPFSUpload.tsx` | Upload files directly to IPFS via Pinata |
| **Message Reactions** | `MessageReactions.tsx` | Emoji reactions on any message |
| **Message Threading** | `MessageBubble.tsx` | Reply to specific messages |
| **Link Previews** | `LinkPreview.tsx` | Automatic preview of shared URLs |
| **Quick Replies** | `QuickReplies.tsx` | Pre-defined message templates |
| **GIF Support** | `GiphyPicker.tsx` | Search and attach GIFs |
| **Stickers** | `StickerPicker.tsx` | Send built-in sticker packs |
| **Draft Messages** | `DraftManager.tsx` | Auto-save unsent messages per conversation |
| **Export Chat** | `ExportChat.tsx` | Download conversations as JSON, TXT, or CSV |

### 👤 User Experience

| Feature | Component | Description |
|---------|-----------|-------------|
| **User Profiles** | `ProfileEditor.tsx` | Customizable username and avatar, stored on IPFS |
| **Contact Management** | `ContactsList.tsx` | Save addresses with nicknames and notes |
| **Message Search** | `MessageSearch.tsx` | Full-text search with saved queries (`SavedSearches.tsx`) |
| **Typing Indicators** | `RealtimeIndicators.tsx` | See when others are composing |
| **Read Receipts** | `MessageIndicators.tsx` | Track sent / delivered / read status |
| **Connection Status** | `ConnectionStatus.tsx` | Real-time network monitoring with offline queue |
| **Notifications** | `NotificationSystem.tsx` | Toast alerts for new messages and events |
| **Onboarding Tour** | `OnboardingTour.tsx` | Guided introduction for first-time users |
| **Performance Dashboard** | `PerformanceDashboard.tsx` | Metrics: messages sent, data usage, uptime |

### 🎨 Interface & Design

| Feature | Location | Description |
|---------|----------|-------------|
| **Dark / Light Mode** | `SettingsPanel.tsx` | Toggle themes; CSS custom properties throughout |
| **Mobile Responsive** | `AppShell.tsx` | Fluid layout from 320 px to 4K |
| **Glassmorphism** | `index.css` | Backdrop-blur glass cards |
| **Smooth Animations** | `index.css` | Fade, slide, scale, bounce keyframes |
| **Skeleton Loading** | `ui/Skeleton` → `Loading.tsx` | Beautiful loading placeholders |
| **Emoji Picker** | `EmojiPicker.tsx` | 300+ emojis in 6 categories with search |
| **QR Code Sharing** | `QRCodeModal.tsx` | Share wallet address as a QR code |
| **Wallet Modal** | `WalletModal.tsx` | Wallet connect / switch flow |
| **Component Showcase** | `ComponentShowcase.tsx` | Visual QA page for every UI primitive |

### ⚡ Power User Features

| Feature | Component | Description |
|---------|-----------|-------------|
| **Keyboard Shortcuts** | `KeyboardShortcuts.tsx` | 8+ shortcuts for rapid navigation |
| **Settings Panel** | `SettingsPanel.tsx` | Comprehensive app customization |
| **Auto-refresh** | `realtime.ts` | Configurable intervals (15 s – 2 min) |
| **Offline Mode** | `ui/OfflineQueue.tsx` | Queue messages when offline, drain on reconnect |
| **Transaction UX** | `TransactionUX.tsx` | Step-by-step wallet transaction feedback |
| **Transaction Status** | `ui/TransactionStatus.tsx` | Live on-chain confirmation tracking |
| **Security Badge** | `ui/SecurityBadge.tsx` | Encryption status indicator |
| **Markdown Editor** | `ui/MarkdownEditor.tsx` | Compose messages with Markdown |

### 🔒 Security & Privacy

| Feature | Description |
|---------|-------------|
| **Blockchain Storage** | All message CIDs recorded on Aptos — immutable and censorship-resistant |
| **IPFS Content** | Message bodies stored on IPFS via Pinata; content-addressed by CID |
| **Wallet-based Auth** | No passwords, no accounts — your wallet *is* your identity |
| **End-to-end Encryption** | Messages encrypted with TweetNaCl Box (X25519-XSalsa20-Poly1305) |
| **No Central Server** | Messaging path: wallet → Aptos chain → IPFS. Signaling server only used for call setup |

---

## 🌐 Live Demo

**Try Inbox3 now:** [https://inbox3-aptos.vercel.app](https://inbox3-aptos.vercel.app)

### Getting Started with the Demo

1. Visit the live demo link above
2. Install [Petra Wallet](https://petra.app/) or [Martian Wallet](https://martianwallet.xyz/)
3. Switch your wallet to **Aptos Testnet**
4. Get free testnet tokens from the [Aptos Faucet](https://aptos.dev/en/network/faucet)
5. Connect your wallet and click **Create Inbox**
6. Start messaging!

---

<div align="center">

<img src="frontend/public/Hand-mockup.png" alt="Inbox3 Mobile App" width="280"/>

*Your messages, your keys, your privacy*

</div>

---

## 📦 Quick Start

### Prerequisites

- **Node.js 18+** and **pnpm** (`npm install -g pnpm`)
- **Aptos Wallet** (Petra or Martian) browser extension
- **Pinata account** — free tier at [pinata.cloud](https://pinata.cloud) (for IPFS message storage)
- **Aptos CLI** — only needed if you want to redeploy the smart contract

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tumansutradhar/inbox-3.git
cd inbox-3/frontend

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Open .env and fill in your Pinata keys and (optionally) signaling server URL
# See docs/PINATA_SETUP.md for details

# 4. Start the development server
pnpm dev
```

Open **http://localhost:5173** in your browser and connect your wallet.

> **Note:** The smart contract is already deployed to Aptos Testnet.  
> `VITE_CONTRACT_ADDRESS` in `.env.example` is pre-filled with the live address.  
> You only need to redeploy if you want your own on-chain instance — see [Smart Contract Deployment](#smart-contract-deployment).

---

## 🏗️ Architecture

### Repository Layout

```
inbox-3/
├── frontend/                    # React 19 + TypeScript + Vite frontend
│   ├── src/
│   │   ├── App.tsx              # Root component & routing state
│   │   ├── config.ts            # Network + contract address + Aptos client
│   │   ├── components/          # Feature components (see below)
│   │   │   ├── ui/              # Primitive UI library (25 components)
│   │   │   └── layout/          # AppShell + ModalSystem
│   │   ├── lib/                 # Business logic & services
│   │   │   ├── crypto.ts        # NaCl Box encrypt/decrypt helpers
│   │   │   ├── encryptionManager.ts
│   │   │   ├── ipfs.ts          # Pinata upload/download
│   │   │   ├── realtime.ts      # Conservative polling service
│   │   │   ├── signaling.ts     # WebRTC signaling client
│   │   │   ├── webrtc.ts        # WebRTC peer connection manager
│   │   │   ├── notifications.ts
│   │   │   ├── profileManager.ts
│   │   │   ├── threadManager.ts
│   │   │   ├── messageSearcher.ts
│   │   │   └── analytics.ts
│   │   ├── types/               # Shared TypeScript types
│   │   ├── styles/              # Extra CSS (layout.css)
│   │   └── abi/inbox3.json      # On-chain ABI for view functions
│   ├── .env.example             # Environment variable template
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── vitest.config.ts
├── smart-contract/              # Move smart contract (Aptos)
│   ├── sources/
│   │   ├── Inbox3.move          # Main contract
│   │   └── Inbox3Tests.move     # Unit tests
│   ├── Move.toml                # Package manifest & address binding
│   └── deploy.sh                # One-command deploy (testnet or mainnet)
├── signaling-server/            # Lightweight WebSocket relay for WebRTC
│   ├── server.js
│   └── package.json
├── docs/                        # Extended documentation
│   ├── HOW_TO_RUN.md
│   ├── HOW_TO_VISUALS.md        # Design system & component guide
│   ├── PINATA_SETUP.md
│   ├── REALTIME_SYSTEM.md
│   ├── RATE_LIMIT_FIX.md
│   └── TROUBLESHOOTING.md
└── README.md
```

### Smart Contract (Move)

**Module:** `inbox3::Inbox3`  
**Network:** Aptos Testnet  
**Address:** `0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e`

```
Entry functions (callable from frontend)
├── create_inbox(user)               — initialise inbox + UserGroups for caller
├── send_message(sender, recipient, cid)  — store IPFS CID in recipient's inbox
├── mark_read(user, message_id)      — mark a DM as read
├── create_group(creator, name)      — deploy a new Group resource
├── join_group(member, group_addr)   — append caller to members list
└── send_group_message(sender, group_addr, cid, parent_id)

View functions (read-only, no gas)
├── inbox_of(addr)                   — return all received DMs
├── sent_messages(addr)              — return all sent DMs
├── get_group_messages(group_addr)   — return all group messages
├── get_user_groups(addr)            — return groups user belongs to
└── inbox_exists(addr)               — check whether inbox is initialised
```

### Frontend Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.8 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 + custom design tokens |
| Blockchain | `@aptos-labs/ts-sdk` 5.x + `@aptos-labs/wallet-adapter-react` |
| IPFS | Pinata REST API |
| Encryption | TweetNaCl (X25519-XSalsa20-Poly1305) |
| Calls | WebRTC + custom WebSocket signaling relay |
| Testing | Vitest + jsdom |

### Component Architecture

```
App.tsx
├── layout/AppShell.tsx           — responsive shell, sidebar toggle
├── layout/ModalSystem.tsx        — global modal portal
│
├── [Header area]
│   ├── ConnectionStatus.tsx      — online/offline banner
│   ├── WalletModal.tsx           — connect / switch wallet
│   ├── QRCodeModal.tsx
│   ├── SettingsPanel.tsx
│   ├── KeyboardShortcuts.tsx
│   └── PerformanceDashboard.tsx
│
├── [Left panel]
│   ├── Sidebar.tsx               — nav tabs + collapse
│   ├── ContactsList.tsx
│   ├── GroupList.tsx
│   ├── MessageSearch.tsx + SavedSearches.tsx
│   └── ProfileEditor.tsx
│
├── [Main chat area]
│   ├── ChatConversation.tsx      — DM thread
│   │   ├── MessageList.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageReactions.tsx
│   │   │   ├── MessageIndicators.tsx
│   │   │   └── LinkPreview.tsx
│   │   └── ChatComposer.tsx      — unified message input
│   │       ├── MessageInput.tsx
│   │       ├── EmojiPicker.tsx
│   │       ├── GiphyPicker.tsx
│   │       ├── StickerPicker.tsx
│   │       ├── FileUpload.tsx
│   │       ├── IPFSUpload.tsx
│   │       └── QuickReplies.tsx
│   │
│   ├── GroupChat.tsx             — group thread (same sub-tree as above)
│   │   ├── CreateGroupModal.tsx
│   │   └── JoinGroupModal.tsx
│   │
│   └── Inbox.tsx                 — message list overview + SendMessage.tsx
│
├── [Overlays]
│   ├── CallInterface.tsx         — WebRTC voice/video call UI
│   ├── DraftManager.tsx
│   ├── ExportChat.tsx
│   ├── NotificationSystem.tsx
│   ├── OnboardingTour.tsx
│   ├── RealtimeIndicators.tsx
│   └── TransactionUX.tsx
│
└── ui/                           — primitive component library
    ├── Avatar.tsx       Badge.tsx      Breadcrumbs.tsx
    ├── Button.tsx       Card.tsx       ConfirmDialog.tsx
    ├── DateSeparator.tsx EmptyState.tsx IconButton.tsx
    ├── Icons.tsx        Illustrations.tsx  Input.tsx
    ├── ListItem.tsx     Loading.tsx    MarkdownEditor.tsx
    ├── Modal.tsx        OfflineQueue.tsx   SecurityBadge.tsx
    ├── SkipLink.tsx     StatusIndicator.tsx Toast.tsx
    ├── Tooltip.tsx      TransactionStatus.tsx TypingIndicator.tsx
    └── VirtualList.tsx
```

### Signaling Server (WebRTC)

A minimal Node.js WebSocket relay (`signaling-server/server.js`) that routes call setup messages between wallet addresses without relaying any media.

```
Protocol
  Client → Server  { type: "register", address: "0x..." }
  Client → Server  { type: "signal",   to: "0x...", payload: <CallSignal> }
  Server → Client  { type: "signal",   from: "0x...", payload: <CallSignal> }
```

See [signaling-server/README.md](signaling-server/README.md) for deployment instructions (one-click free hosting on Render).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Open settings |
| `Ctrl + N` | Start new message |
| `Ctrl + R` | Refresh messages |
| `G` | Switch to groups view |
| `D` | Switch to DMs view |
| `/` | Focus search |
| `Shift + ?` | Show shortcuts reference |
| `Esc` | Close modal / panel |

---

## 🎨 Design System

Design tokens live in `frontend/src/index.css`. See [docs/HOW_TO_VISUALS.md](docs/HOW_TO_VISUALS.md) for the full guide.

```css
/* Light mode */
--primary-brand: #FF6B35;
--bg-main:       #FAFAF9;
--text-primary:  #1C1917;

/* Dark mode */
--primary-brand: #FF6B35;
--bg-main:       #09090b;
--text-primary:  #fafafa;
```

**Utility classes:**
- Animations — `animate-bounce`, `animate-pulse-ring`, `animate-shake`, `animate-scale-in`
- Effects — `.glass`, `.glass-card`, `.btn-gradient`, `.skeleton`
- Interactions — `.hover-lift`, `.active-press`, `.tooltip`
- Status — `.status-dot-online`, `.status-dot-offline`

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Gzipped build size | ~890 KB |
| First load (3G) | < 2 s |
| Memory footprint | ~30 MB average |
| Message refresh interval | 15 s (active) / 45 s (idle) |

---

## 🌐 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | WebM Opus audio, WebRTC |
| Edge 90+ | ✅ Full | WebM Opus audio, WebRTC |
| Firefox 88+ | ✅ Full | WebM audio, WebRTC |
| Safari 14+ | ⚠️ Partial | Default codec fallback; WebRTC supported |

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [HOW_TO_RUN.md](docs/HOW_TO_RUN.md) | Full local setup & smart contract deployment |
| [PINATA_SETUP.md](docs/PINATA_SETUP.md) | Configure Pinata IPFS credentials |
| [HOW_TO_VISUALS.md](docs/HOW_TO_VISUALS.md) | Design system, tokens, and component usage |
| [REALTIME_SYSTEM.md](docs/REALTIME_SYSTEM.md) | Polling architecture & refresh strategy |
| [RATE_LIMIT_FIX.md](docs/RATE_LIMIT_FIX.md) | How rate limits were resolved |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common errors and fixes |
| [signaling-server/README.md](signaling-server/README.md) | Deploy the WebRTC signaling relay |

---

## 🛠️ Development

### Run the Frontend

```bash
cd frontend
pnpm dev          # http://localhost:5173
pnpm build        # production build → dist/
pnpm preview      # preview production build
pnpm test         # run Vitest unit tests
pnpm lint         # ESLint
```

### Run the Signaling Server Locally

```bash
cd signaling-server
npm install
npm start         # WebSocket on ws://localhost:8080
```

Set `VITE_SIGNALING_SERVER_URL=ws://localhost:8080` in `frontend/.env` while developing.

### <a name="smart-contract-deployment"></a>Smart Contract Deployment

The contract is already live on Aptos Testnet. Use the steps below only if you want your own deployment.

```bash
# Install Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Initialise a profile (follow the prompts to create/import a key)
cd smart-contract
aptos init --profile default --network testnet

# Fund the account (testnet only)
aptos account fund-with-faucet --account default --network testnet

# Compile & run tests
aptos move compile  --named-addresses inbox3=default
aptos move test     --named-addresses inbox3=default

# Deploy (testnet)
./deploy.sh testnet

# Deploy (mainnet) — prompts for confirmation
./deploy.sh mainnet
```

After deployment, copy the account address into `frontend/.env`:

```bash
VITE_CONTRACT_ADDRESS=0x<your-deployed-address>
VITE_NETWORK=testnet   # or mainnet
```

---

## 🚀 Deployment

### Deploy Frontend to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tumansutradhar/inbox-3&project-name=inbox3&root-directory=frontend)

**Manual steps:**

```bash
npm install -g vercel
cd frontend
vercel --prod
```

Add the following environment variables in the Vercel project dashboard (or via `vercel env add`):

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONTRACT_ADDRESS` | ✅ | Deployed Aptos contract address |
| `VITE_NETWORK` | ✅ | `testnet` or `mainnet` |
| `VITE_PINATA_API_KEY` | ✅ | Pinata API key |
| `VITE_PINATA_SECRET_KEY` | ✅ | Pinata secret key |
| `VITE_PINATA_GATEWAY` | optional | Custom Pinata gateway hostname |
| `VITE_SIGNALING_SERVER_URL` | optional | `wss://` URL of deployed signaling server |

### Deploy Frontend to Netlify

1. Connect this repository to Netlify
2. **Base directory:** `frontend`
3. **Build command:** `pnpm build`
4. **Publish directory:** `dist`
5. Add the same environment variables listed above in *Site settings → Environment variables*

### Deploy the Signaling Server

See [signaling-server/README.md](signaling-server/README.md) for a free one-click deployment on Render.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style (TypeScript strict, ESLint, Tailwind utility classes).

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Aptos Foundation** — blockchain infrastructure
- **Pinata** — IPFS pinning service
- **React Team** — UI framework
- **Tailwind CSS** — utility-first styling
- **TweetNaCl** — cryptography primitives
- **Vercel** — hosting & deployment

---

<div align="center">

**Built with ❤️ for the decentralized future**

[⬆ Back to Top](#inbox3--decentralized-messaging-platform)

</div>