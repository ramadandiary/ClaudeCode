import { sepolia, polygonAmoy } from 'wagmi/chains'
import type { Address } from 'viem'

// =========================================================
// ERC-20 最小限ABI（残高取得・送金・デシマル取得）
// =========================================================
export const ERC20_ABI = [
  {
    name:            'balanceOf',
    type:            'function',
    stateMutability: 'view',
    inputs:          [{ name: 'account', type: 'address' }],
    outputs:         [{ name: '', type: 'uint256' }],
  },
  {
    name:            'transfer',
    type:            'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to',     type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name:            'decimals',
    type:            'function',
    stateMutability: 'view',
    inputs:          [],
    outputs:         [{ name: '', type: 'uint8' }],
  },
  {
    name:            'symbol',
    type:            'function',
    stateMutability: 'view',
    inputs:          [],
    outputs:         [{ name: '', type: 'string' }],
  },
  {
    name:            'allowance',
    type:            'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner',   type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

// =========================================================
// JPYCコントラクトアドレス（テストネット）
//
// NOTE: JPYCは公式にはSepoliaやAmoyにデプロイされていません。
//       テスト用として以下の方法があります：
//       1. .envファイルに独自デプロイしたERC-20アドレスを設定
//       2. Alchemyのトークンfaucetなどでテストトークンを取得
//       3. ローカルで独自ERC-20をデプロイしてアドレスを設定
//
//       ダミーアドレス（0x000...001）はコントラクトが存在しないため、
//       残高は常に取得失敗となります。実際にテストするには実アドレスを設定してください。
// =========================================================
export const JPYC_ADDRESSES: Readonly<Record<number, Address>> = {
  [sepolia.id]:      (import.meta.env.VITE_JPYC_ADDRESS_SEPOLIA as Address) ??
    '0x0000000000000000000000000000000000000001',
  [polygonAmoy.id]:  (import.meta.env.VITE_JPYC_ADDRESS_AMOY   as Address) ??
    '0x0000000000000000000000000000000000000001',
}

// JPYCトークンのメタデータ
export const JPYC_DECIMALS = 18
export const JPYC_SYMBOL   = 'JPYC'
export const JPYC_NAME     = 'JPY Coin'

/**
 * チェーンIDに対応するJPYCコントラクトアドレスを返す
 * アドレスが設定されていない場合はundefinedを返す
 */
export function getJpycAddress(chainId: number): Address | undefined {
  const addr = JPYC_ADDRESSES[chainId]
  // ダミーアドレスの場合はundefinedとして扱う
  if (!addr || addr === '0x0000000000000000000000000000000000000001') {
    return undefined
  }
  return addr
}
