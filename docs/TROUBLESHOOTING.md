# Troubleshooting "Failed to create inbox" Error

## Common Issues and Solutions

### 1. **Contract Not Deployed or Wrong Address**
**Issue**: The contract address in the frontend doesn't match the deployed contract.

**Solution**:
- Verify `VITE_CONTRACT_ADDRESS` in `frontend/.env` matches the deployed contract
- The pre-deployed testnet address is `0x2fb49669a943f53c7a0ab469e3fc475b273697f0151554e8321646895ca55d0e`
- If you redeployed, update `.env` with your new address and restart the dev server
- Redeploy the contract if needed:
  ```bash
  cd smart-contract
  aptos init --profile default --network testnet
  ./deploy.sh testnet
  ```

### 2. **Missing Entry Function Modifier**
**Issue**: Functions need `entry` modifier to be called from frontend.

**Solution**: ✅ **FIXED** - Added `entry` modifier to:
- `create_inbox`
- `send_message` 
- `mark_read`

### 3. **Wallet Connection Issues**
**Issue**: Wallet not properly connected or on the wrong network.

**Solution**:
- Make sure your wallet is connected to **Aptos Testnet** (Settings → Network → Testnet)
- Check if `account.address` is available in the browser console
- Try disconnecting and reconnecting the wallet

### 4. **Gas/Transaction Issues**
**Issue**: Insufficient gas or transaction simulation fails.

**Solution**:
- Ensure your wallet has sufficient APT tokens for gas
- Get free testnet tokens: https://aptos.dev/en/network/faucet

### 5. **Contract Function Name Issues**
**Issue**: Function name format incorrect.

**Solution**: ✅ **FIXED** - Using correct format:
```typescript
function: `${CONTRACT_ADDRESS}::Inbox3::create_inbox`
```

## Debugging Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) and check console for detailed error messages.

### Step 2: Verify Contract Deployment
```bash
# Check if contract exists
aptos account list --query modules --account YOUR_CONTRACT_ADDRESS
```

### Step 3: Test Contract Functions
```bash
# Test create_inbox function
aptos move run \
  --function-id YOUR_CONTRACT_ADDRESS::Inbox3::create_inbox \
  --profile default
```

### Step 4: Check Network Configuration
Verify you're using the correct network:
- `VITE_NETWORK` in `frontend/.env`: `testnet`
- Wallet: **Testnet**
- Contract: Deployed to Testnet

### Step 5: Enhanced Error Logging
The frontend now includes detailed console logging. Check for:
- Account address
- Contract address
- Transaction details
- Specific error messages

## Quick Fix Checklist

1. ✅ **Smart Contract**: Deployed with `entry` modifiers on all public functions
2. ✅ **Frontend Error Handling**: Banner shown in UI when contract address is missing
3. ✅ **Function Names**: Correct format `${CONTRACT_ADDRESS}::Inbox3::<fn>`
4. ✅ **Environment**: `VITE_CONTRACT_ADDRESS` read from `.env` — no hardcoding in source
5. ✅ **Network**: Testnet throughout

## Next Steps

1. **If you redeployed the contract**, update `VITE_CONTRACT_ADDRESS` in `frontend/.env`

2. **Restart the dev server** after any `.env` change: `pnpm dev`

3. **Check browser console** (F12) for detailed error messages

4. **Check the banner** at the top of the page — it appears automatically when the contract address is not configured

## Common Error Messages and Solutions

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "Function not found" | Missing entry modifier | Redeploy contract with entry functions |
| "Insufficient gas" | Not enough APT tokens | Get tokens from DevNet faucet |
| "Account not found" | Wrong network | Switch wallet to DevNet |
| "Module not found" | Contract not deployed | Deploy contract to DevNet |
| "Simulation failed" | Contract logic error | Check contract code and parameters |

## Contact Support

If issues persist after following these steps, please provide:
1. Browser console error messages
2. Wallet network configuration
3. Contract deployment status
4. Transaction hash (if any)
