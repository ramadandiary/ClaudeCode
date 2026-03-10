import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { sepolia, polygonAmoy } from 'wagmi/chains'

// =========================================================
// wagmi + RainbowKit 設定
//
// WalletConnect Project IDは https://cloud.walletconnect.com で取得してください。
// .envファイルに VITE_WALLETCONNECT_PROJECT_ID として設定してください。
// =========================================================
const WALLET_CONNECT_PROJECT_ID: string =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'demo'

export const wagmiConfig = getDefaultConfig({
  appName:   'JPYCウォレット',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains:    [sepolia, polygonAmoy],
  transports: {
    // Sepolia: AlchemyまたはInfuraのRPC URLを.envに設定（任意）
    [sepolia.id]: http(
      import.meta.env.VITE_SEPOLIA_RPC_URL
        ? import.meta.env.VITE_SEPOLIA_RPC_URL
        : undefined
    ),
    // Polygon Amoy: AlchemyまたはInfuraのRPC URLを.envに設定（任意）
    [polygonAmoy.id]: http(
      import.meta.env.VITE_AMOY_RPC_URL
        ? import.meta.env.VITE_AMOY_RPC_URL
        : undefined
    ),
  },
  ssr: false,
})
