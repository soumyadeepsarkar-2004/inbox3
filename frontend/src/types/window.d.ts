/// <reference types="vite/client" />

interface Window {
  aptos: {
    signAndSubmitTransaction: (transaction: unknown) => Promise<{ hash: string }>;
  };
}
