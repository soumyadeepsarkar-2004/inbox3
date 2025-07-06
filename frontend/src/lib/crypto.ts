import nacl from 'tweetnacl';

export const hexToBytes = (hex: string) => Uint8Array.from(Buffer.from(hex.slice(2), 'hex'));

export const encrypt = async (
  senderPrivHex: string,
  recipientPubHex: string,
  plaintext: string
) => {
  const senderSk = hexToBytes(senderPrivHex);
  const recipientPk = hexToBytes(recipientPubHex);
  const { publicKey: senderPk, secretKey } = nacl.box.keyPair.fromSecretKey(senderSk);
  const nonce = nacl.randomBytes(24);
  const cipher = nacl.box(
    Buffer.from(plaintext),
    nonce,
    recipientPk,
    secretKey
  );
  return { cipher: Buffer.from(cipher).toString('base64'), nonce: Buffer.from(nonce).toString('base64'), senderPk: Buffer.from(senderPk).toString('hex') };
};

export const decrypt = (
  recipientPrivHex: string,
  senderPubHex: string,
  cipherB64: string,
  nonceB64: string
) => {
  const recipientSk = hexToBytes(recipientPrivHex);
  const senderPk = hexToBytes(senderPubHex);
  const cipher = Buffer.from(cipherB64, 'base64');
  const nonce = Buffer.from(nonceB64, 'base64');
  const { secretKey } = nacl.box.keyPair.fromSecretKey(recipientSk);
  const plainBytes = nacl.box.open(cipher, nonce, senderPk, secretKey);
  if (!plainBytes) throw new Error('Decryption failed');
  return Buffer.from(plainBytes).toString();
};
