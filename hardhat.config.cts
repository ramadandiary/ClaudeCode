import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import * as dotenv from 'dotenv'

// .env を読み込む（VITE_ プレフィックスのRPC URLとデプロイヤー秘密鍵を共用）
dotenv.config()

// =========================================================
// デプロイヤー秘密鍵の取得
// DEPLOYER_PRIVATE_KEY を .env に設定してください
// =========================================================
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY

// 秘密鍵が未設定の場合はコンパイルのみ可能（デプロイは不可）
const accounts = DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : []

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Ethereum Sepolia テストネット
    sepolia: {
      url: process.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
      chainId: 11155111,
      accounts,
    },
    // Polygon Amoy テストネット
    amoy: {
      url: process.env.VITE_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
      chainId: 80002,
      accounts,
    },
  },

  // コンパイル済みアーティファクトの出力先
  paths: {
    sources:   './contracts',
    tests:     './test',
    cache:     './cache',
    artifacts: './artifacts',
  },
}

export default config
