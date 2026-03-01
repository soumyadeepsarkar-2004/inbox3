import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Configuration
export const NETWORK = Network.MAINNET;
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000000"; // TODO: Replace with Mainnet contract address after deployment

// Lazy initialization of Aptos Client to avoid module loading issues
let _aptos: Aptos | null = null;

export function getAptos(): Aptos {
    if (!_aptos) {
        const aptosConfig = new AptosConfig({ network: NETWORK });
        _aptos = new Aptos(aptosConfig);
    }
    return _aptos;
}

// For backward compatibility - use getter
export const aptos = {
    view: async (args: Parameters<Aptos['view']>[0]) => {
        return getAptos().view(args);
    },
    waitForTransaction: async (args: Parameters<Aptos['waitForTransaction']>[0]) => {
        return getAptos().waitForTransaction(args);
    }
};
