const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY as string | undefined;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY as string | undefined;
const PINATA_GATEWAY = (import.meta.env.VITE_PINATA_GATEWAY as string | undefined) || 'gateway.pinata.cloud';

const IS_PROD = import.meta.env.PROD; // true when built with `vite build`

// ─── Validate IPFS config in production ─────────────────────────────────────
if (IS_PROD && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
  console.error(
    '[Inbox3 IPFS] Pinata credentials are not set.\n' +
    '  Messages stored on-chain reference IPFS CIDs. Without Pinata,\n' +
    '  message content will NOT persist between sessions.\n' +
    '  Set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in your .env file.'
  );
}

// ─── Upload ──────────────────────────────────────────────────────────────────
export const upload = async (data: string): Promise<string> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    if (IS_PROD) {
      throw new Error(
        'Pinata IPFS credentials are required in production. ' +
        'Set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in your .env file.'
      );
    }
    // Development-only fallback: store in localStorage
    console.warn('[IPFS] Pinata not configured — using localStorage fallback (dev only).');
    const mockCid = 'mock-cid-' + Date.now();
    try {
      localStorage.setItem(`ipfs-${mockCid}`, data);
    } catch (e) {
      console.warn('Failed to store mock data locally:', e);
    }
    return mockCid;
  }

  try {
    const blob = new Blob([data], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, 'message.json');

    const metadata = {
      name: `inbox3-message-${Date.now()}`,
      keyvalues: {
        app: 'inbox3',
        timestamp: Date.now().toString()
      }
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Proactively cache for immediate retrieval
    try {
      localStorage.setItem(`ipfs-${result.IpfsHash}`, data);
    } catch {
      // Cache failure is non-critical
    }

    return result.IpfsHash;
  } catch (error) {
    // In production, propagate the error — don't silently fall back
    if (IS_PROD) {
      throw error;
    }
    // Dev fallback only
    console.error('[IPFS] Pinata upload failed, using local fallback:', error);
    const fallbackCid = 'fallback-cid-' + Date.now();
    try {
      localStorage.setItem(`ipfs-${fallbackCid}`, data);
    } catch (e) {
      console.warn('Failed to store fallback data locally:', e);
    }
    return fallbackCid;
  }
};

// ─── Fetch with timeout ──────────────────────────────────────────────────────
const fetchWithTimeout = async (url: string, timeout = 10000): Promise<string> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) throw new Error(`Fetch failed for ${url}: ${response.status}`);
    return await response.text();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

// ─── Decode hex-encoded CID (common on Aptos) ───────────────────────────────
const decodeIfHex = (str: string) => {
  if (str.startsWith('0x')) {
    try {
      const hex = str.slice(2);
      let decoded = '';
      for (let i = 0; i < hex.length; i += 2) {
        decoded += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return decoded;
    } catch (e) {
      console.warn('Failed to decode hex CID:', str, e);
      return str;
    }
  }
  return str;
};

// ─── Download ────────────────────────────────────────────────────────────────
export const download = async (rawCid: string): Promise<string> => {
  const cid = decodeIfHex(rawCid);

  // 1. Always check local cache first
  try {
    const cachedData = localStorage.getItem(`ipfs-${cid}`);
    if (cachedData) {
      return cachedData;
    }
  } catch (e) {
    console.warn('Failed to check localStorage for CID:', e);
  }

  // 2. In dev: handle mock CIDs gracefully
  if (!IS_PROD && (cid.startsWith('mock-cid-') || cid.startsWith('fallback-cid-') || cid.startsWith('mock-file-cid-'))) {
    return JSON.stringify({
      content: '⚠️  This message was stored in a previous dev session (no IPFS). Configure Pinata for persistent storage.',
      sender: 'System',
      timestamp: Date.now()
    });
  }

  // 3. Parallel fetch from multiple IPFS gateways
  const gateways = [
    PINATA_GATEWAY.includes('http') ? `${PINATA_GATEWAY}/ipfs/${cid}` : `https://${PINATA_GATEWAY}/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`,
    `https://gateway.ipfs.io/ipfs/${cid}`,
    `https://4everland.io/ipfs/${cid}`,
  ];

  try {
    const text = await Promise.any(gateways.map(url => fetchWithTimeout(url)));

    // Cache successful fetch
    try {
      localStorage.setItem(`ipfs-${cid}`, text);
    } catch {
      // ignore cache failure
    }

    return text;
  } catch (error) {
    console.error('[IPFS] All gateways failed for CID:', cid, error);
    return JSON.stringify({
      content: '⚠️  Unable to retrieve message — IPFS gateways unavailable. Check your connection.',
      sender: 'Network',
      timestamp: Date.now()
    });
  }
};

// ─── Upload File ─────────────────────────────────────────────────────────────
export const uploadFile = async (file: Blob): Promise<string> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    if (IS_PROD) {
      throw new Error('Pinata credentials required for file uploads. Set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY.');
    }
    console.warn('[IPFS] Using mock CID for file upload (dev only).');
    return 'mock-file-cid-' + Date.now();
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = {
    name: `inbox3-file-${Date.now()}`,
    keyvalues: {
      app: 'inbox3',
      timestamp: Date.now().toString(),
      type: file.type
    }
  };
  formData.append('pinataMetadata', JSON.stringify(metadata));

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY,
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Pinata file upload failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.IpfsHash;
};

// ─── High-level helpers ──────────────────────────────────────────────────────
interface IpfsMessagePayload {
  content: string;
  sender: string;
  timestamp: number;
  type?: 'text' | 'audio';
  parentId?: string | null;
}

export const uploadToPinata = async (
  content: string,
  sender: string,
  type: 'text' | 'audio' = 'text',
  parentId?: string | null
): Promise<string> => {
  const payload: IpfsMessagePayload = {
    content,
    sender,
    timestamp: Date.now(),
    type,
    parentId: parentId ?? null,
  };
  return upload(JSON.stringify(payload));
};

export const getFromPinata = async (cid: string): Promise<IpfsMessagePayload> => {
  try {
    const jsonStr = await download(cid);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('[IPFS] Failed to parse message JSON:', e);
    return {
      content: '⚠️  Failed to load message',
      sender: 'Unknown',
      timestamp: Date.now(),
      type: 'text',
      parentId: null,
    };
  }
};
