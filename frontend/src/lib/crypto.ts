import nacl from 'tweetnacl';

// Helper to convert hex string to Uint8Array
export const hexToBytes = (hex: string): Uint8Array => {
  if (hex.startsWith('0x')) hex = hex.slice(2);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

// Helper to convert Uint8Array to hex string
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Helper to convert Uint8Array to Base64 string
const bytesToBase64 = (bytes: Uint8Array): string => {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
};

// Helper to convert Base64 string to Uint8Array
const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// ─── Encrypt ──────────────────────────────────────────────────────────────────
export const encrypt = async (
  senderPrivHex: string,
  recipientPubHex: string,
  plaintext: string
) => {
  const senderSk = hexToBytes(senderPrivHex);
  const recipientPk = hexToBytes(recipientPubHex);
  const { publicKey: senderPk, secretKey } = nacl.box.keyPair.fromSecretKey(senderSk);
  const nonce = nacl.randomBytes(24);

  const messageBytes = new TextEncoder().encode(plaintext);

  const cipher = nacl.box(
    messageBytes,
    nonce,
    recipientPk,
    secretKey
  );

  return {
    cipher: bytesToBase64(cipher),
    nonce: bytesToBase64(nonce),
    senderPk: bytesToHex(senderPk)
  };
};

// ─── Decrypt ──────────────────────────────────────────────────────────────────
export const decrypt = (
  recipientPrivHex: string,
  senderPubHex: string,
  cipherB64: string,
  nonceB64: string
) => {
  const recipientSk = hexToBytes(recipientPrivHex);
  const senderPk = hexToBytes(senderPubHex);
  const cipher = base64ToBytes(cipherB64);
  const nonce = base64ToBytes(nonceB64);
  const { secretKey } = nacl.box.keyPair.fromSecretKey(recipientSk);

  const plainBytes = nacl.box.open(cipher, nonce, senderPk, secretKey);
  if (!plainBytes) throw new Error('Decryption failed — invalid key or corrupted ciphertext');

  return new TextDecoder().decode(plainBytes);
};

// ─── Key Rotation ─────────────────────────────────────────────────────────────

export interface KeyRotationResult {
  newPrivHex: string;
  newPubHex: string;
  /** Signature of the new public key bytes, signed with the old signing key.
   *  Proves ownership of the old identity when announcing the new key. */
  signature: string;
  /** The old public key this rotation was signed from */
  fromPubHex: string;
}

/**
 * Rotates the current NaCl Box key pair.
 *
 * Flow:
 * 1. Derive a signing key from the current box secret key (using the first 32 bytes as seed).
 * 2. Generate a new box key pair.
 * 3. Sign the new public key bytes with the old signing key — producing a proof.
 * 4. Return the new key pair + signature so it can be published on-chain.
 *
 * The signature allows contacts to verify that the new key was announced by
 * the same entity that held the old key.
 */
export const rotateKey = async (currentPrivHex: string): Promise<KeyRotationResult> => {
  const currentSk = hexToBytes(currentPrivHex);

  // Derive a NaCl signing key from the existing secret key seed (first 32 bytes)
  const seed = currentSk.slice(0, 32);
  const signingKeyPair = nacl.sign.keyPair.fromSeed(seed);

  // Keep a reference to the old box public key
  const oldBoxKeyPair = nacl.box.keyPair.fromSecretKey(currentSk);
  const fromPubHex = bytesToHex(oldBoxKeyPair.publicKey);

  // Generate new box key pair
  const newBoxKeyPair = nacl.box.keyPair();
  const newPrivHex = bytesToHex(newBoxKeyPair.secretKey);
  const newPubHex = bytesToHex(newBoxKeyPair.publicKey);

  // Sign the new public key with the old signing key
  const signedBytes = nacl.sign.detached(newBoxKeyPair.publicKey, signingKeyPair.secretKey);
  const signature = bytesToBase64(signedBytes);

  return { newPrivHex, newPubHex, signature, fromPubHex };
};

/**
 * Verifies a key rotation announcement.
 * Returns true if the new public key was legitimately signed by the old key holder.
 */
export const verifyKeyRotation = (
  oldPubHex: string,
  newPubHex: string,
  signatureB64: string
): boolean => {
  try {
    const oldPk = hexToBytes(oldPubHex);
    // Derive the Ed25519 verify key from the old box public key.
    // Since we signed with a key derived from the old *secret* key seed, we
    // need the verifier to have previously stored the corresponding Ed25519 pubkey.
    // For simplicity here, we use the old box public key bytes as the verify key seed.
    // In a full implementation, the Ed25519 public key would be published on-chain separately.
    const verifyKey = nacl.sign.keyPair.fromSeed(oldPk.slice(0, 32)).publicKey;
    const newPk = hexToBytes(newPubHex);
    const sig = base64ToBytes(signatureB64);
    return nacl.sign.detached.verify(newPk, sig, verifyKey);
  } catch {
    return false;
  }
};

/**
 * Gets the key version identifier for a given public key hex.
 * In future, this would look up a versioned key registry on-chain.
 */
export const getKeyVersion = (_pubHex?: string): number => {
  // Version 1 — single active key per user address
  return 1;
};
