import { Account } from '@aptos-labs/ts-sdk';
import * as fs from 'fs';
import * as path from 'path';

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
fs.writeFileSync(configPath, yaml);

// Update Move.toml with the account address
const moveTomlPath = path.resolve(__dirname, '../smart-contract/Move.toml');
let moveToml = fs.readFileSync(moveTomlPath, 'utf8');
moveToml = moveToml.replace(/inbox3 = ".*"/, `inbox3 = "${address}"`);
fs.writeFileSync(moveTomlPath, moveToml);

console.log('SUCCESS');
console.log('Mainnet Address:', address);
