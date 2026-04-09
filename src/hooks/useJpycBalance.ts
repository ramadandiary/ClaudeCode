import { useReadContract, useBalance } from 'wagmi'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { ERC20_ABI, JPYC_DECIMALS, JPYC_ADDRESSES } from '../config/tokens'

// =========================================================
// useJpycBalance
// 指定チェーンのJPYC残高とネイティブトークン残高を取得するフック
//
// @param chainId - 残高を取得するチェーンのID
// =========================================================
export function useJpycBalance(chainId: number) {
  const { address } = useAccount()

  const jpycAddress = JPYC_ADDRESSES[chainId]

  // JPYC（ERC-20）残高を取得
  const {
    data:      jpycRaw,
    isLoading: isJpycLoading,
    error:     jpycError,
    refetch:   refetchJpyc,
  } = useReadContract({
    address:  jpycAddress,
    abi:      ERC20_ABI,
    functionName: 'balanceOf',
    args:     address ? [address] : undefined,
    chainId,
    query: {
      enabled:         !!address && !!jpycAddress,
      // 30秒ごとに自動リフレッシュ
      refetchInterval: 30_000,
      retry:           2,
    },
  })

  // ネイティブトークン（ETH / MATIC）残高を取得
  const {
    data:      nativeRaw,
    isLoading: isNativeLoading,
    refetch:   refetchNative,
  } = useBalance({
    address,
    chainId,
    query: {
      enabled:         !!address,
      refetchInterval: 30_000,
      retry:           2,
    },
  })

  // フォーマット済みの残高文字列
  const jpycBalance   = jpycRaw != null ? formatUnits(jpycRaw, JPYC_DECIMALS) : null
  const nativeBalance = nativeRaw?.formatted ?? null
  const nativeSymbol  = nativeRaw?.symbol    ?? 'ETH'

  /**
   * 手動リフレッシュ
   */
  const refetch = () => {
    void refetchJpyc()
    void refetchNative()
  }

  return {
    /** JPYC残高（文字列、未取得の場合はnull） */
    jpycBalance,
    /** ネイティブトークン残高（文字列、未取得の場合はnull） */
    nativeBalance,
    /** ネイティブトークンのシンボル */
    nativeSymbol,
    /** 読み込み中フラグ */
    isLoading: isJpycLoading || isNativeLoading,
    /** エラー（JPYCコントラクトが未設定の場合はnullになることがある） */
    error: jpycError,
    /** 手動リフレッシュ関数 */
    refetch,
  } as const
}
