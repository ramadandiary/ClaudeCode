import { useEffect, useState, useCallback } from 'react'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import { encodeFunctionData, formatUnits, isAddress, parseUnits, type Address } from 'viem'
import { ERC20_ABI, JPYC_ADDRESSES, JPYC_DECIMALS } from '../config/tokens'

// =========================================================
// useGasEstimate
// 指定の送金先・金額に対するガス代見積もりを返すフック
//
// @param to     - 送金先アドレス（未入力時はundefined）
// @param amount - 送金金額（JPYC単位の文字列）
// =========================================================
export function useGasEstimate(to: string, amount: string) {
  const { address }   = useAccount()
  const chainId       = useChainId()
  const publicClient  = usePublicClient()

  const [gasUnits,     setGasUnits]     = useState<bigint | null>(null)
  const [gasPrice,     setGasPrice]     = useState<bigint | null>(null)
  const [isLoading,    setIsLoading]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  const jpycAddress = JPYC_ADDRESSES[chainId]

  const estimate = useCallback(async () => {
    // 入力が不完全な場合はスキップ
    if (
      !address        ||
      !publicClient   ||
      !jpycAddress    ||
      !isAddress(to)  ||
      !amount         ||
      parseFloat(amount) <= 0
    ) {
      setGasUnits(null)
      setGasPrice(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const parsedAmount = parseUnits(amount, JPYC_DECIMALS)

      // transfer(address,uint256) のエンコードデータ
      const data = encodeFunctionData({
        abi:          ERC20_ABI,
        functionName: 'transfer',
        args:         [to as Address, parsedAmount],
      })

      // ガス使用量とガス価格を並列取得
      const [units, price] = await Promise.all([
        publicClient.estimateGas({
          account: address,
          to:      jpycAddress,
          data,
        }),
        publicClient.getGasPrice(),
      ])

      setGasUnits(units)
      setGasPrice(price)
    } catch (e) {
      // コントラクトが存在しない・残高不足などの場合はエラー
      setError('ガス代の見積もりに失敗しました')
      setGasUnits(null)
      setGasPrice(null)
    } finally {
      setIsLoading(false)
    }
  }, [address, publicClient, jpycAddress, to, amount, chainId])

  // to/amount変化から500msデバウンスしてRPCを叩く
  useEffect(() => {
    const timer = setTimeout(() => {
      void estimate()
    }, 500)
    return () => clearTimeout(timer)
  }, [estimate])

  // ガスコスト（wei）
  const gasCostWei = gasUnits != null && gasPrice != null ? gasUnits * gasPrice : null

  // ガスコスト（ネイティブトークン単位）
  const gasCostFormatted =
    gasCostWei != null
      ? parseFloat(formatUnits(gasCostWei, 18)).toFixed(8)
      : null

  return {
    /** 推定ガスユニット数 */
    gasUnits,
    /** ガス価格（wei） */
    gasPrice,
    /** ガスコスト合計（wei） */
    gasCostWei,
    /** ガスコスト（ネイティブトークン、8桁精度の文字列） */
    gasCostFormatted,
    /** 見積もり中フラグ */
    isLoading,
    /** エラーメッセージ */
    error,
    /** 手動で再見積もり */
    refetch: estimate,
  } as const
}
