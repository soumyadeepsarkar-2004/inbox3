/**
 * Inbox3 WebRTC Signaling Server
 *
 * A lightweight WebSocket relay that routes call signals between Aptos wallet addresses.
 *
 * Protocol:
 *   Client → Server  { type: 'register', address: '0x...' }
 *   Client → Server  { type: 'signal',   to: '0x...',   payload: <CallSignal> }
 *   Server → Client  { type: 'signal',   from: '0x...', payload: <CallSignal> }
 *   Server → Client  { type: 'error',    message: '...' }
 *
 * Usage:
 *   npm install ws
 *   node server.js
 *
 * Or deploy to a free host like Render (https://render.com):
 *   - New Web Service → connect this repo
 *   - Build Command: npm install
 *   - Start Command: node server.js
 *   - Port: 8080
 *
 * Then set VITE_SIGNALING_SERVER_URL=wss://your-app.onrender.com in frontend/.env
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

/** @type {Map<string, WebSocket>} address → socket */
const peers = new Map();

wss.on('connection', (ws) => {
    let myAddress = null;

    ws.on('message', (rawMessage) => {
        let msg;
        try {
            msg = JSON.parse(rawMessage.toString());
        } catch {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
            return;
        }

        // ── register ──────────────────────────────────────────────
        if (msg.type === 'register') {
            if (!msg.address || typeof msg.address !== 'string') {
                ws.send(JSON.stringify({ type: 'error', message: 'register requires address field' }));
                return;
            }
            myAddress = msg.address;
            peers.set(myAddress, ws);
            console.log(`[+] Registered peer: ${myAddress}  (total: ${peers.size})`);
            ws.send(JSON.stringify({ type: 'registered', address: myAddress }));
            return;
        }

        // ── signal ────────────────────────────────────────────────
        if (msg.type === 'signal') {
            if (!myAddress) {
                ws.send(JSON.stringify({ type: 'error', message: 'Must register before sending signals' }));
                return;
            }
            const targetSocket = peers.get(msg.to);
            if (!targetSocket || targetSocket.readyState !== WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'error', message: `Peer ${msg.to} not connected` }));
                return;
            }
            targetSocket.send(JSON.stringify({
                type: 'signal',
                from: myAddress,
                payload: msg.payload,
            }));
            return;
        }
    });

    ws.on('close', () => {
        if (myAddress) {
            peers.delete(myAddress);
            console.log(`[-] Peer disconnected: ${myAddress}  (total: ${peers.size})`);
        }
    });
});

console.log(`Inbox3 signaling server running on ws://0.0.0.0:${PORT}`);
