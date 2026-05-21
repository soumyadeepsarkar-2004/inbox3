# How to Run Inbox3 — Complete Guide

## Prerequisites ✅

1. **Node.js 18+** — [nodejs.org](https://nodejs.org/)
2. **pnpm** — `npm install -g pnpm`
3. **Aptos-compatible wallet** — [Petra Wallet](https://petra.app/) or [Martian Wallet](https://martianwallet.xyz/)
4. **Pinata account** (free) — [pinata.cloud](https://pinata.cloud) — for IPFS message storage
5. **Aptos CLI** — only needed if you want to redeploy the smart contract

---

## Step 1: Clone & Install

```bash
git clone https://github.com/tumansutradhar/inbox-3.git
cd inbox-3/frontend
pnpm install
```

---

## Step 2: Configure Environment

```bash
# Copy the template
cp .env.example .env
```

Open `frontend/.env` and fill in your values:

```dotenv
# Required — contract is already deployed to testnet, address pre-filled
VITE_CONTRACT_ADDRESS=0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e
VITE_NETWORK=testnet

# Required for persistent messages — get keys from pinata.cloud
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_PINATA_GATEWAY=gateway.pinata.cloud

# Optional — only needed for voice/video calls
VITE_SIGNALING_SERVER_URL=wss://your-signaling-server.onrender.com
```

See [PINATA_SETUP.md](PINATA_SETUP.md) for detailed Pinata key instructions.

> **Tip:** The app works without Pinata keys — messages use mock IPFS CIDs for local testing.

---

## Step 3: Start the Frontend

```bash
cd frontend   # if not already there
pnpm dev
```

Open **http://localhost:5173** in your browser.

---

## Step 4: (Optional) Run the Signaling Server Locally

The signaling server is only needed for voice/video calls. Skip this if you only want messaging.

```bash
cd signaling-server
npm install
npm start     # WebSocket server on ws://localhost:8080
```

Set `VITE_SIGNALING_SERVER_URL=ws://localhost:8080` in `frontend/.env`, then restart `pnpm dev`.

---

## Step 5: Set Up Your Wallet

1. Install the [Petra Wallet](https://petra.app/) Chrome extension
2. Create a new wallet or import an existing one
3. **Switch to Aptos Testnet** (Settings → Network → Testnet)
4. Fund your wallet: [https://aptos.dev/en/network/faucet](https://aptos.dev/en/network/faucet)

---

## Step 6: Use the App

1. Click **Connect Wallet** → select Petra → approve the connection
2. Click **Create Inbox** → approve the transaction (costs a tiny amount of testnet APT)
3. Wait for on-chain confirmation
4. Send your first message!

---

## Quick-Start Summary

```bash
# Terminal 1 — Frontend
git clone https://github.com/tumansutradhar/inbox-3.git
cd inbox-3/frontend
pnpm install
cp .env.example .env     # edit with your Pinata keys
pnpm dev                 # → http://localhost:5173

# Terminal 2 — Signaling server (optional, for calls)
cd inbox-3/signaling-server
npm install
npm start                # → ws://localhost:8080
```

---

## (Advanced) Redeploy the Smart Contract

You only need this if you want your own on-chain instance.

### Install Aptos CLI

```bash
# macOS / Linux
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Windows (PowerShell)
iwr "https://aptos.dev/scripts/install_cli.py" -useb | python
```

### Initialise a Profile & Deploy

```bash
cd smart-contract

# Create/import key and point to testnet
aptos init --profile default --network testnet

# Fund the account
aptos account fund-with-faucet --account default --network testnet

# Compile
aptos move compile --named-addresses inbox3=default

# Run unit tests
aptos move test --named-addresses inbox3=default

# Deploy to testnet (uses deploy.sh)
./deploy.sh testnet

# Deploy to mainnet (prompts for confirmation)
./deploy.sh mainnet
```

After deploying, copy the account address into `frontend/.env`:

```dotenv
VITE_CONTRACT_ADDRESS=0x<your-deployed-address>
VITE_NETWORK=testnet   # or mainnet
```

Restart `pnpm dev`.

---

## Troubleshooting

### Contract deployment fails
```bash
# Check account balance
aptos account list --account default --network testnet

# Re-fund if needed
aptos account fund-with-faucet --account default --network testnet
```

### Frontend won't start
```bash
# Clean install
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### Wallet connection issues
1. Make sure wallet is on **Testnet** (not Mainnet)
2. Clear browser cache
3. Disconnect and reconnect the wallet

### "Module not found" / "Inbox not initialized"
- Make sure you have clicked **Create Inbox** and the transaction confirmed
- Verify `VITE_CONTRACT_ADDRESS` matches the deployed contract
- Confirm `VITE_NETWORK` matches the network your wallet is on

---

## Project Structure Reference

```
inbox-3/
├── smart-contract/          # Move smart contract
│   ├── sources/
│   │   ├── Inbox3.move      # Main contract logic
│   │   └── Inbox3Tests.move # Unit tests
│   ├── Move.toml            # Package config & address binding
│   └── deploy.sh            # Deployment script (testnet + mainnet)
├── frontend/                # React 19 + Vite frontend
│   ├── src/
│   │   ├── App.tsx          # Root component
│   │   ├── config.ts        # Network / contract / Aptos client
│   │   ├── components/      # Feature & UI components
│   │   └── lib/             # Business logic & services
│   ├── .env.example         # Environment variable template
│   └── package.json
├── signaling-server/        # WebRTC signaling relay
│   ├── server.js
│   └── README.md
└── docs/                    # This and other guides
```

---

**Need help?** Check the other guides in `docs/`:
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — detailed error solutions
- [PINATA_SETUP.md](PINATA_SETUP.md) — IPFS config
- [RATE_LIMIT_FIX.md](RATE_LIMIT_FIX.md) — API rate limit solutions
- [REALTIME_SYSTEM.md](REALTIME_SYSTEM.md) — how real-time messaging works
