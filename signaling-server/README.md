# Inbox3 Signaling Server

A lightweight WebSocket relay that routes WebRTC call-setup signals between Aptos wallet addresses. **No media passes through this server** — it only relays the SDP offers/answers and ICE candidates needed to establish a direct peer-to-peer connection.

---

## Protocol

```
Client → Server  { "type": "register", "address": "0x..." }
Client → Server  { "type": "signal",   "to": "0x...",   "payload": <CallSignal> }
Server → Client  { "type": "signal",   "from": "0x...", "payload": <CallSignal> }
Server → Client  { "type": "error",    "message": "..." }
```

---

## Run Locally

```bash
cd signaling-server
npm install
npm start        # WebSocket server on ws://localhost:8080
```

Set the following in `frontend/.env` while developing:

```dotenv
VITE_SIGNALING_SERVER_URL=ws://localhost:8080
```

The `PORT` environment variable is respected if set (default: `8080`).

---

## Deploy to Render (Free)

Render's free tier is enough for a personal or demo deployment.

1. Fork / push this repository to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repository
4. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Environment** | Node |
   | **Root directory** | `signaling-server` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Port** | `8080` |

5. Click **Deploy**. Render provides a `wss://` URL once live.
6. Copy that URL into `frontend/.env` (or your Vercel/Netlify environment variables):

```dotenv
VITE_SIGNALING_SERVER_URL=wss://your-app-name.onrender.com
```

---

## Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

railway login
railway init

# Deploy from the signaling-server directory
cd signaling-server
railway up
```

Railway will expose a `wss://` URL automatically.

---

## Deploy to Fly.io

```bash
cd signaling-server

# Install flyctl: https://fly.io/docs/flyctl/install/
fly launch --name inbox3-signaling --no-deploy
fly deploy
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | WebSocket server port |

---

## Notes

- Each wallet address can only have **one active connection** at a time. A new `register` message replaces any existing registration for that address.
- The server does **not** persist any data — all state is in-memory.
- For production, consider adding rate-limiting (e.g., `ws` `verifyClient` option) to prevent abuse.
