import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// ─── Network ────────────────────────────────────────────────────────────────
const rawNetwork = (import.meta.env.VITE_NETWORK as string | undefined) ?? 'testnet';
export const NETWORK: Network = rawNetwork.toLowerCase() === 'testnet'
    ? Network.TESTNET
    : rawNetwork.toLowerCase() === 'devnet'
        ? Network.DEVNET
        : Network.MAINNET;

// ─── Contract Address ───────────────────────────────────────────────────────
const _contractAddress = (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined) ?? '0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';

if (!_contractAddress || _contractAddress === ZERO_ADDRESS) {
    const msg =
        '[Inbox3] CRITICAL: Contract address is not configured.\n' +
        '  1. Deploy the smart contract: cd smart-contract && ./deploy.sh mainnet\n' +
        '  2. Copy the deployed account address\n' +
        '  3. Set VITE_CONTRACT_ADDRESS=<address> in frontend/.env\n' +
        '  4. Restart the dev server';
    console.error(msg);
    // Surface it in the UI (non-blocking so the app can still render the error state)
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            document.body.insertAdjacentHTML(
                'afterbegin',
                `<div style="position:fixed;top:0;left:0;right:0;background:#dc2626;color:#fff;padding:12px 16px;font-family:monospace;font-size:13px;z-index:99999;white-space:pre-wrap;">${msg}</div>`
            );
        });
    }
}

export const CONTRACT_ADDRESS: string = _contractAddress || ZERO_ADDRESS;

// ─── Aptos Client ───────────────────────────────────────────────────────────
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
