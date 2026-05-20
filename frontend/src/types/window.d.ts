/// <reference types="vite/client" />

interface Window {
  aptos?: {
    signAndSubmitTransaction: (transaction: unknown) => Promise<{ hash: string }>;
    signMessage: (args: { message: string; nonce: string }) => Promise<{
      signature: string;
      fullPublicKey: string;
    }>;
  };
}
