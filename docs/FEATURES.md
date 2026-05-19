# Features & Capabilities

Complete feature list and usage guide.

---

## 💬 Messaging

### Direct Messages
- ✅ Send encrypted messages to any wallet address
- ✅ End-to-end encryption (TweetNaCl Box)
- ✅ Read receipts and delivery status
- ✅ Message persistence (IPFS + Blockchain)
- ✅ Export conversations (JSON/CSV/TXT)

### Groups
- ✅ Create groups with unique address
- ✅ Invite members to join
- ✅ Group messaging
- ✅ Member list with roles
- ✅ Leave group anytime

### Message Features
- ✅ **Reactions**: Add emoji reactions to any message
- ✅ **Threading**: Reply to specific messages
- ✅ **Links**: URLs automatically linkified
- ✅ **Timestamps**: See exact send time
- ✅ **Edits**: Edit unsent drafts before sending

---

## 📁 File Sharing

### File Upload
- ✅ Drag-and-drop upload
- ✅ Select files via dialog
- ✅ Support: images (PNG, JPG, GIF, WebP), documents (PDF, TXT, JSON)
- ✅ Max size: 10 MB per file
- ✅ Progress indicator

### IPFS Storage
- ✅ Files uploaded to IPFS (via Pinata)
- ✅ Content-addressed (IPFS CID)
- ✅ Encrypted before upload
- ✅ Pinned for persistence
- ✅ Accessible via Pinata gateway

---

## 🎨 Rich Features

### Emojis & GIFs
- ✅ **Emoji Picker**: 300+ emojis in 6 categories
- ✅ **Search**: Find emojis by name
- ✅ **GIF Search**: Search Giphy library
- ✅ **GIF Preview**: See GIF before sending
- ✅ **Insert into Message**: Click to add to text

### Media
- ✅ **Image Preview**: Inline image display
- ✅ **GIF Animation**: Play GIFs in conversation
- ✅ **File Icons**: Visual file type indicators
- ✅ **Download**: Click to download files
- ✅ **Lightbox**: Full-screen image view

---

## 👤 User Profiles

### Profile Settings
- ✅ **Display Name**: Customizable username
- ✅ **Avatar**: Upload custom profile picture
- ✅ **Bio**: Add personal bio (optional)
- ✅ **Status**: Online/Offline/Away status
- ✅ **IPFS Storage**: Profile stored on IPFS

### Contact Management
- ✅ **Save Contacts**: Store addresses with names
- ✅ **Contact Notes**: Add notes to contacts
- ✅ **Quick Access**: Frequently used contacts
- ✅ **Block Users**: Block unwanted contacts

---

## 🔧 App Settings

### Appearance
- ✅ **Dark Mode**: Full dark theme support
- ✅ **Light Mode**: Clean light theme
- ✅ **Theme Persistence**: Remember choice across sessions

### Notifications
- ✅ **Desktop Notifications**: Toast alerts for new messages
- ✅ **Mute Conversations**: Disable notifications per chat
- ✅ **Sound Alerts**: Optional audio notifications
- ✅ **Badge Count**: Unread message count

### Privacy
- ✅ **Encryption**: All messages E2E encrypted by default
- ✅ **Wallet Privacy**: Only your wallet ID visible
- ✅ **Data Deletion**: Clear chat history anytime
- ✅ **No Tracking**: Zero analytics/tracking

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard shortcuts |
| `s` | Open settings |
| `g` | Switch to groups |
| `d` | Switch to direct messages |
| `n` | New message |
| `r` | Refresh inbox |
| `Esc` | Close modals |
| `Enter` (in composer) | Send message |

---

## 🎥 Voice & Video Calls

**Status**: Optional feature (requires signaling server)

### Capabilities
- ✅ **Peer-to-Peer**: Direct WebRTC connection
- ✅ **Voice Calls**: Audio-only calls
- ✅ **Video Calls**: Audio + video
- ✅ **Screen Share**: Share screen (future)
- ✅ **Recording**: Record calls locally (future)

### How to Enable
1. Deploy signaling server (see docs)
2. Set `VITE_SIGNALING_SERVER_URL` in `.env`
3. Users grant microphone/camera permissions
4. Click "Voice Call" or "Video Call" in chat

---

## ✨ Advanced Features

### Drafts
- ✅ Auto-save unsent messages
- ✅ Save drafts manually
- ✅ Draft manager for all saved drafts
- ✅ Resume draft anytime
- ✅ Delete draft when done

### Search
- ✅ **Full-text Search**: Search message content
- ✅ **Filter by Sender**: Messages from specific user
- ✅ **Filter by Date**: Messages from date range
- ✅ **Saved Searches**: Save frequently used searches
- ✅ **Export Results**: Download search results

### Performance
- ✅ **Performance Dashboard**: View app metrics
- ✅ **Message Count**: Track total messages sent
- ✅ **Data Usage**: Monitor bandwidth
- ✅ **Uptime**: Check connection stability
- ✅ **Latency**: Monitor message delay

---

## 🔄 Real-Time Updates

- ✅ **Live Refresh**: Messages appear in real-time (15-45s intervals)
- ✅ **Typing Indicators**: See when others are typing
- ✅ **Read Status**: Know when messages are read
- ✅ **Offline Queue**: Messages queue when offline
- ✅ **Auto-Sync**: Sync messages when connection restored

---

## 🔐 Security Features

### Encryption
- ✅ **E2E Encryption**: TweetNaCl Box X25519-XSalsa20-Poly1305
- ✅ **Key Exchange**: Automatic shared secret generation
- ✅ **No Key Backup**: Keys never leave browser
- ✅ **Perfect Forward Secrecy**: Each message unique encryption

### Authentication
- ✅ **Wallet-Based**: Connect with Petra/Martian
- ✅ **No Passwords**: Keys in wallet, not app
- ✅ **Transaction Signing**: User approves each transaction
- ✅ **Multi-Wallet**: Support for multiple wallets

### Privacy
- ✅ **Zero-Knowledge Backend**: Server never sees messages
- ✅ **Immutable Ledger**: Messages cannot be deleted on-chain
- ✅ **Anonymous Addresses**: Use multiple wallets if desired
- ✅ **No Tracking**: No analytics or user tracking

---

## 📱 Mobile Support

- ✅ **Responsive Design**: Works on all screen sizes (320px - 4K)
- ✅ **Touch Friendly**: Large tap targets
- ✅ **Mobile Keyboard**: Auto-shows on input focus
- ✅ **Swipe Navigation**: Swipe between tabs
- ✅ **Mobile Wallets**: Petra mobile wallet compatible

---

## 🌐 Browser Support

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Latest | Fully supported |
| Firefox | ✅ Latest | Fully supported |
| Safari | ✅ Latest | Fully supported |
| Edge | ✅ Latest | Fully supported |
| Mobile Safari | ✅ Latest | Works with wallet extension |

---

## ⚙️ Configuration Options

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_NETWORK` | `testnet` | Aptos network (testnet/mainnet) |
| `VITE_CONTRACT_ADDRESS` | Pre-filled | Smart contract address |
| `VITE_PINATA_API_KEY` | — | IPFS file upload (required) |
| `VITE_PINATA_SECRET_KEY` | — | IPFS authentication (required) |
| `VITE_SIGNALING_SERVER_URL` | — | WebRTC signaling (optional) |

---

## 🚀 Performance Metrics

- **Load Time**: < 3 seconds
- **First Paint**: < 1.5 seconds
- **Message Send**: < 2 seconds
- **Message Display**: < 5 seconds (includes blockchain confirmation)
- **Search**: < 500ms for 1000 messages
- **File Upload**: < 30 seconds for 5MB file

---

## 🔮 Planned Features

- 🏗️ Screen sharing in calls
- 🏗️ Message search indexing
- 🏗️ Typing indicators
- 🏗️ Message forwarding
- 🏗️ Channel/broadcast mode
- 🏗️ Polls & surveys in messages
- 🏗️ Wallet integration improvements
- 🏗️ Mainnet support

---

## ❓ Feature Requests?

Have an idea for a feature? [Open an issue](https://github.com/tumansutradhar/inbox-3/issues) on GitHub!

---

## 📚 Related Docs

- [GETTING_STARTED.md](GETTING_STARTED.md) — Quick setup
- [ARCHITECTURE.md](ARCHITECTURE.md) — System design
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Common issues
