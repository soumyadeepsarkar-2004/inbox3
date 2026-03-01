const { Account } = require('@aptos-labs/ts-sdk');
const fs = require('fs');
const path = require('path');

// Generate a new keypair
const account = Account.generate();

const privateKey = account.privateKey.toString();
const publicKey = account.publicKey.toString();
const address = account.accountAddress.toString();

const yaml = `---
profiles:
  mainnet:
    network: mainnet
    private_key: "${privateKey}"
    public_key: "${publicKey}"
    account: "${address}"
    rest_url: "https://fullnode.mainnet.aptoslabs.com"
`;

const configPath = path.resolve(__dirname, '../smart-contract/.aptos/config.yaml');
const aptosDir = path.dirname(configPath);
if (!fs.existsSync(aptosDir)) {
    fs.mkdirSync(aptosDir, { recursive: true });
}
fs.writeFileSync(configPath, yaml);

// Update Move.toml with the account address
const moveTomlPath = path.resolve(__dirname, '../smart-contract/Move.toml');
let moveToml = fs.readFileSync(moveTomlPath, 'utf8');
moveToml = moveToml.replace(/inbox3 = ".*"/, `inbox3 = "${address}"`);
fs.writeFileSync(moveTomlPath, moveToml);

// write output to file
fs.writeFileSync(path.resolve(__dirname, 'address.txt'), address);
