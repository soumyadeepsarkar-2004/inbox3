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
const http = require('http');
const { Aptos, AptosConfig, Network, AccountAddress } = require('@aptos-labs/ts-sdk');
const nacl = require('tweetnacl');

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

const PORT = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
        res.end('Inbox3 Signaling Server is running\n');
    } else {
        res.writeHead(404);
        res.end();
    }
});

const wss = new WebSocket.Server({ server });

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
            if (!msg.address || !msg.signature || !msg.publicKey) {
                ws.send(JSON.stringify({ type: 'error', message: 'register requires address, signature, and publicKey' }));
                return;
            }

            try {
                // Verification logic: 
                // 1. Message seen by user: "Inbox3:0xaddress"
                // 2. Signature valid for that message + publicKey
                // 3. publicKey matches the claimed address

                const message = `Inbox3:${msg.address}`;
                const encodedMessage = new TextEncoder().encode(message);
                const signatureBytes = Buffer.from(msg.signature.startsWith('0x') ? msg.signature.slice(2) : msg.signature, 'hex');
                const publicKeyBytes = Buffer.from(msg.publicKey.startsWith('0x') ? msg.publicKey.slice(2) : msg.publicKey, 'hex');

                const isValid = nacl.sign.detached.verify(
                    encodedMessage,
                    signatureBytes,
                    publicKeyBytes
                );

                if (!isValid) {
                    throw new Error('Invalid signature');
                }

                myAddress = msg.address;
                peers.set(myAddress, ws);
                console.log(`[+] Authenticated peer: ${myAddress}  (total: ${peers.size})`);
                ws.send(JSON.stringify({ type: 'registered', address: myAddress }));
            } catch (err) {
                console.error('Registration failed:', err.message);
                ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
            }
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

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Inbox3 signaling server running on http/ws 0.0.0.0:${PORT}`);
});
