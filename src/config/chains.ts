import { sepolia, polygonAmoy } from 'wagmi/chains'

// =========================================================
// サポートするチェーン一覧（テストネット）
// =========================================================
export const SUPPORTED_CHAINS = [sepolia, polygonAmoy] as const

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]['id']

// =========================================================
// チェーンごとのメタデータ
// =========================================================
export const CHAIN_META: Record<
  SupportedChainId,
  {
    /** 表示名 */
    label: string
    /** ネイティブトークンシンボル */
    nativeToken: string
    /** ブロックエクスプローラーのベースURL */
    explorerUrl: string
    /** ネットワークのアイコン（絵文字で代替） */
    icon: string
    /** ブロックエクスプローラーの色アクセント */
    accentColor: string
  }
> = {
  // Ethereum Sepolia テストネット
  [sepolia.id]: {
    label:       'Ethereum Sepolia',
    nativeToken: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    icon:        'ETH',
    accentColor: '#627EEA',
  },
  // Polygon Amoy テストネット
  [polygonAmoy.id]: {
    label:       'Polygon Amoy',
    nativeToken: 'MATIC',
    explorerUrl: 'https://amoy.polygonscan.com',
    icon:        'MATIC',
    accentColor: '#8247E5',
  },
}

/**
 * トランザクションハッシュからエクスプローラーのURLを生成する
 */
export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const meta = CHAIN_META[chainId as SupportedChainId]
  if (!meta) return `#`
  return `${meta.explorerUrl}/tx/${txHash}`
}
