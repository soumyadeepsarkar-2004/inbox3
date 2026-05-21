# Architecture & System Design

Understand how Inbox3 works under the hood.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React 19)                   │
│              - Wallet Connection (Petra)                │
│              - Messaging UI Components                  │
│              - File Upload (Drag & Drop)                │
│              - WebRTC Call Initiation                   │
└─────────────────────────────────────────────────────────┘
                           ↓
         ┌─────────────────┬─────────────────┐
         ↓                 ↓                  ↓
    ┌─────────┐      ┌──────────┐      ┌────────┐
    │ Aptos   │      │  IPFS    │      │  WebRTC│
    │Blockchain       │(Pinata) │      │Signaling
    │         │      │          │      │         │
    │Messages │      │ File     │      │ Voice/  │
    │Groups   │      │ Storage  │      │ Video   │
    │Metadata │      │          │      │         │
    └─────────┘      └──────────┘      └────────┘
```

---

## 🔐 Smart Contract Layer

**Blockchain**: Aptos Testnet  
**Address**: `0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e`

### Core Resources
- **Inbox**: Store of messages received
- **Group**: Group chat data and members
- **Message**: IPFS CID + metadata (timestamp, sender, encryption key)

### Entry Functions

| Function | Purpose | Gas Cost |
|----------|---------|----------|
| `create_inbox()` | Initialize user inbox | ~100 APT |
| `send_message(to, cid, encrypted_key)` | Send DM | ~50 APT |
| `mark_read(sender, msg_id)` | Mark as read | ~20 APT |
| `create_group(name)` | Create group | ~100 APT |
| `join_group(group_addr)` | Join group | ~30 APT |
| `send_group_message(group, cid, key)` | Send to group | ~50 APT |

### View Functions
- `inbox_of(user)` — Get received messages
- `outbox_of(user)` — Get sent messages
- `groups_of(user)` — Get user's groups

---

## 🔄 Real-Time System

### Conservative Polling Strategy

Why polling instead of WebSockets?
- Avoids API rate limiting (Aptos has 5000 RPS limit)
- Simpler architecture (no server needed for messages)
- Works with deployed contracts (immutable)

### Refresh Intervals

```
Event                  Interval        Reason
─────────────────────────────────────────────────
After message send     5 seconds       Check for replies
Normal operation       30 seconds      Balance rate limit
User idle (1 min)      60 seconds      Save bandwidth
Force refresh (manual) Immediate       User-initiated
```

### Algorithm
```javascript
// realtime.ts
if (justSentMessage) {
  pollInterval = 5000;      // Fast: 5 seconds
} else if (nowIdle) {
  pollInterval = 60000;     // Slow: 1 minute  
} else {
  pollInterval = 30000;     // Normal: 30 seconds
}

// Fetch new messages
const messages = await fetchMessagesFromContract();
updateUI(messages);
```

---

## 🔐 Encryption (TweetNaCl Box)

### Flow

```
Message Sent
     ↓
┌────────────────────────────────────┐
│ Generate Shared Secret             │
│ (Recipient's Public Key + My SK)   │
└────────────────────────────────────┘
     ↓
┌────────────────────────────────────┐
│ Encrypt Message                    │
│ (XSalsa20-Poly1305 with nonce)     │
└────────────────────────────────────┘
     ↓
┌────────────────────────────────────┐
│ Upload to IPFS                     │
│ (Get IPFS CID)                     │
└────────────────────────────────────┘
     ↓
┌────────────────────────────────────┐
│ Store on Blockchain                │
│ (CID + Encryption Metadata)        │
└────────────────────────────────────┘
     ↓
Message Received
     ↓
┌────────────────────────────────────┐
│ Fetch Encrypted Data from IPFS     │
│ (Using CID from blockchain)        │
└────────────────────────────────────┘
     ↓
┌────────────────────────────────────┐
│ Decrypt Using Recipient SK         │
│ (Only recipient can decrypt)       │
└────────────────────────────────────┘
     ↓
Display in UI
```

**Key Points:**
- Encryption happens in browser (keys never leave)
- Server/blockchain never knows message contents
- Only recipient can decrypt
- Uses industry-standard X25519 key exchange

---

## 📁 File Storage (IPFS via Pinata)

### Upload Flow

```
File Selected
     ↓
┌─────────────────────┐
│ Validate File       │
│ (max 10MB, type)    │
└─────────────────────┘
     ↓
┌─────────────────────┐
│ Encrypt File        │
│ (TweetNaCl)         │
└─────────────────────┘
     ↓
┌─────────────────────┐
│ Upload to IPFS      │
│ (via Pinata API)    │
└─────────────────────┘
     ↓
┌─────────────────────┐
│ Get IPFS CID        │
│ (Content hash)      │
└─────────────────────┘
     ↓
┌─────────────────────┐
│ Send Message        │
│ (Include CID)       │
└─────────────────────┘
     ↓
Show in Message Bubble
```

**Why IPFS?**
- Content-addressed (CID = content hash)
- Redundant/distributed storage
- Censorship-resistant
- Free tier via Pinata

---

## 🎥 WebRTC Calls

### Signaling Server Role

```
User A                              User B
  │                                   │
  ├─ Create Offer ─────────────────>  │
  │                                   │
  │  <─ Create Answer ────────────────┤
  │                                   │
  ├─ Exchange ICE Candidates ≷─────>  │
  │         (via Signaling)           │
  │                                   │
  ├─────── P2P Data Connection ─────>│
  │         (Direct WebRTC)           │
  │                                   │
  └─ Media Stream (Audio/Video) ────>│
```

**Signaling Server** (optional, in `signaling-server/`):
- Relays SDP offers/answers
- Exchanges ICE candidates
- Does NOT handle media (P2P direct)
- Lightweight Node.js + WebSocket

**To Enable Calls:**
1. Deploy signaling server (Render, Railway)
2. Set `VITE_SIGNALING_SERVER_URL` in `.env`
3. Users grant microphone/camera permissions
4. Calls work via P2P connection

---

## 🗂️ Frontend Structure

```
frontend/src/
├── App.tsx                    # Main app component
│   ├── Wallet context setup
│   ├── Tab switching (DMs/Groups)
│   ├── Modal management
│   └── Keyboard shortcuts
│
├── components/
│   ├── Inbox.tsx             # DM list & display
│   ├── GroupChat.tsx         # Group messaging
│   ├── ChatComposer.tsx      # Message input
│   ├── MessageBubble.tsx     # Message display
│   ├── CallInterface.tsx     # Voice/video UI
│   ├── FileUpload.tsx        # Upload handler
│   ├── ProfileEditor.tsx     # User profile
│   ├── SettingsPanel.tsx     # App settings
│   └── ...more components
│
├── lib/
│   ├── encryptionManager.ts  # TweetNaCl wrapper
│   ├── ipfs.ts               # Pinata API calls
│   ├── webrtc.ts             # WebRTC peer connection
│   ├── signaling.ts          # Signaling server client
│   ├── realtime.ts           # Message polling loop
│   ├── profileManager.ts     # Profile IPFS storage
│   └── useInbox.ts           # React hook for data
│
├── styles/
│   └── index.css             # Tailwind + animations
│
├── types/
│   ├── reply.ts              # Thread/reply types
│   └── window.d.ts           # Global types
│
└── config.ts                 # Aptos config
```

---

## 🔄 Data Flow Example: Sending a Message

```
1. User Types Message
   └─> ChatComposer.tsx captures input

2. User Clicks Send
   └─> SendMessage.tsx handler triggered

3. Validate & Encrypt
   └─> encryptionManager.encryptMessage()
   └─> Returns encrypted data + ephemeral public key

4. Upload to IPFS
   └─> ipfs.uploadToIPFS()
   └─> Pinata API returns IPFS CID

5. Transaction to Blockchain
   └─> Create transaction
       - Recipient address
       - IPFS CID
       - Encrypted message key
   └─> User signs with wallet (Petra)

6. Blockchain Stores
   └─> Contract adds to recipient's inbox
   └─> Immutable on-chain record

7. Real-Time Poll Detects
   └─> realtime.ts polls contract
   └─> New message detected

8. Decrypt & Display
   └─> Fetch IPFS CID
   └─> encryptionManager.decryptMessage()
   └─> MessageBubble.tsx displays

9. Update Read Status
   └─> mark_read() transaction
   └─> Read receipt sent
```

---

## ⚡ Performance Optimizations

- **Code Splitting**: Vite lazy-loads components
- **Image Optimization**: IPFS CIDs for CDN
- **Caching**: Browser cache for IPFS files
- **Polling Strategy**: Conservative intervals to save bandwidth
- **Message Pagination**: Load recent messages first
- **Virtual Scrolling**: (Future) Render only visible messages

---

## 🛡️ Security Model

| Layer | Mechanism | Notes |
|-------|-----------|-------|
| **Transport** | HTTPS (Vercel) | In-transit encryption |
| **Auth** | Wallet signature | No passwords, keys in wallet |
| **Storage** | E2E encryption | TweetNaCl Box |
| **Data** | Blockchain immutable | Messages permanent, immutable |
| **Privacy** | Zero-knowledge | Server never sees plaintext |

---

## 🚀 Scalability Considerations

### Current Limits
- Aptos: ~5000 TPS network limit
- Polling: 30-60 seconds per user
- Pinata: Free tier ~200MB/day

### Future Improvements
- **Indexer**: Self-hosted Aptos indexer for faster queries
- **Sharding**: Split messages by group/topic
- **Caching**: Redis for frequently accessed data
- **Batch Transactions**: Group operations to save gas
- **Layer 2**: Move calls to lower-cost chain

---

## 📊 Comparison: Our Design vs Alternatives

| Feature | Our Model | Traditional | Note |
|---------|-----------|-------------|------|
| **Decentralization** | Full | Partial | Blockchain + IPFS |
| **Privacy** | E2E | Optional | Server-side encryptions |
| **Censorship** | Resistant | Vulnerable | Immutable blockchain |
| **Latency** | 30s+ | Instant | Tradeoff: decentralization |
| **Scalability** | Moderate | High | Blockchain limitation |
| **Cost (user)** | Gas fees | Free | Pay for security |

---

## 📚 Related Docs

- [REALTIME_SYSTEM.md](REALTIME_SYSTEM.md) — Deep dive on polling strategy
- [GETTING_STARTED.md](GETTING_STARTED.md) — Quick setup
- [DEPLOYMENT.md](DEPLOYMENT.md) — Production guide
