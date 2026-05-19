const IPFS_PROXY_URL = (import.meta.env.VITE_IPFS_PROXY_URL as string | undefined) || 'http://localhost:3001';
const PINATA_GATEWAY = (import.meta.env.VITE_PINATA_GATEWAY as string | undefined) || 'gateway.pinata.cloud';

const IS_PROD = import.meta.env.PROD;

// ─── Upload ──────────────────────────────────────────────────────────────────
export const upload = async (data: string): Promise<string> => {
  try {
    const response = await fetch(`${IPFS_PROXY_URL}/api/pin-json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data
    });

    if (!response.ok) {
      throw new Error(`Proxy upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Cache content to avoid immediate re-fetch
    try {
      localStorage.setItem(`ipfs-${result.IpfsHash}`, data);
    } catch { }

    return result.IpfsHash;
  } catch (error) {
    if (IS_PROD) throw error;

    console.warn('[IPFS] Proxy not reachable, using localStorage fallback (dev only).');
    const mockCid = 'mock-cid-' + Date.now();
    localStorage.setItem(`ipfs-${mockCid}`, data);
    return mockCid;
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
    throw new Error(`IPFS_UNAVAILABLE:${cid}`);
  }
};

// ─── Upload File ─────────────────────────────────────────────────────────────
export const uploadFile = async (file: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${IPFS_PROXY_URL}/api/pin-file`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Proxy file upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    if (IS_PROD) throw error;
    console.warn('[IPFS] Proxy not reachable, using mock CID for file upload (dev only).');
    return 'mock-file-cid-' + Date.now();
  }
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
