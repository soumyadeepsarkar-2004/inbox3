import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { Network } from '@aptos-labs/ts-sdk'
import App from './App.tsx'
import './index.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{
        network: Network.DEVNET,
        aptosConnectDappId: 'inbox3-dapp'
      }}
      onError={(error) => {
        console.error('Wallet error:', error)
      }}
    >
      <App />
    </AptosWalletAdapterProvider>
  </StrictMode>
)
