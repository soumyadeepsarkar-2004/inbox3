const { Account, Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');
const fs = require('fs');
const path = require('path');

async function main() {
    // Generate a new keypair
    const account = Account.generate();

    const privateKey = account.privateKey.toString();
    const publicKey = account.publicKey.toString();
    const address = account.accountAddress.toString();

    // YAML Config
    let yaml = `---
profiles:
  default:
    network: testnet
    private_key: "${privateKey}"
    public_key: "${publicKey}"
    account: "${address}"
    rest_url: "https://fullnode.testnet.aptoslabs.com"
`;

    const configPath = path.resolve(__dirname, 'smart-contract', '.aptos', 'config.yaml');
    const aptosDir = path.dirname(configPath);
    if (!fs.existsSync(aptosDir)) {
        fs.mkdirSync(aptosDir, { recursive: true });
    }

    // Attempt to merge existing mainnet config if present
    if (fs.existsSync(configPath)) {
        let existing = fs.readFileSync(configPath, 'utf8');
        if (existing.includes('mainnet:')) {
            yaml += existing.substring(existing.indexOf('  mainnet:'));
        }
    }

    fs.writeFileSync(configPath, yaml);

    // Update Move.toml with the account address
    const moveTomlPath = path.resolve(__dirname, 'smart-contract', 'Move.toml');
    let moveToml = fs.readFileSync(moveTomlPath, 'utf8');
    moveToml = moveToml.replace(/inbox3 = ".*"/, `inbox3 = "${address}"`);
    fs.writeFileSync(moveTomlPath, moveToml);

    // Fund the account using the testnet faucet
    try {
        console.log('Funding testnet account', address, 'with 1 APT...');
        const aptosConfig = new AptosConfig({ network: Network.TESTNET });
        const client = new Aptos(aptosConfig);
        await client.fundAccount({ accountAddress: address, amount: 100000000 });
        console.log('Funded successfully!');
    } catch (e) {
        console.error('Faucet error', e);
    }

    console.log('TestnetAddress=', address);
}

main().catch(console.error);
