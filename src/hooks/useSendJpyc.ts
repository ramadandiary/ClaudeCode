import { useCallback } from 'react'
import { useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { isAddress, parseUnits, type Address } from 'viem'
import { ERC20_ABI, JPYC_ADDRESSES, JPYC_DECIMALS } from '../config/tokens'

// =========================================================
// useSendJpyc
// JPYCをERC-20 transfer関数で送金するフック
// =========================================================
export function useSendJpyc() {
  const chainId     = useChainId()
  const jpycAddress = JPYC_ADDRESSES[chainId]

  // コントラクト書き込み（sendTransaction相当）
  const {
    writeContract,
    data:      txHash,
    isPending: isWritePending,
    error:     writeError,
    reset:     resetWrite,
  } = useWriteContract()

  // トランザクションのマイニング待機
  const {
    isLoading: isConfirming,
    isSuccess,
    error:     receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  /**
   * JPYCを送金する
   * @param to     - 送金先アドレス
   * @param amount - 送金金額（JPYC単位の文字列）
   */
  const sendJpyc = useCallback(
    (to: string, amount: string) => {
      if (!jpycAddress || !isAddress(to) || !amount || parseFloat(amount) <= 0) {
        throw new Error('送金パラメータが不正です')
      }

      const parsedAmount = parseUnits(amount, JPYC_DECIMALS)

      writeContract({
        address:      jpycAddress,
        abi:          ERC20_ABI,
        functionName: 'transfer',
        args:         [to as Address, parsedAmount],
      })
    },
    [jpycAddress, writeContract]
  )

  /**
   * エラー文言を日本語に変換する
   */
  const errorMessage = (() => {
    const err = writeError ?? receiptError
    if (!err) return null
    const msg = err.message ?? ''

    if (msg.includes('User rejected') || msg.includes('user rejected') || msg.includes('4001')) {
      return 'ユーザーによってキャンセルされました'
    }
    if (msg.includes('insufficient funds') || msg.includes('InsufficientFundsError')) {
      return 'ガス代が不足しています'
    }
    if (msg.includes('execution reverted')) {
      return 'トランザクションが失敗しました（残高不足の可能性があります）'
    }
    return 'トランザクションに失敗しました: ' + msg.slice(0, 60)
  })()

  /** 状態をリセット（フォームをクリアしたい時に使用） */
  const reset = resetWrite

  return {
    /** 送金実行関数 */
    sendJpyc,
    /** 送信済みのトランザクションハッシュ */
    txHash,
    /** ウォレットの承認待ち中 */
    isWritePending,
    /** チェーン上での確認待ち中 */
    isConfirming,
    /** 送金完了フラグ */
    isSuccess,
    /** エラーメッセージ（日本語） */
    errorMessage,
    /** 状態リセット */
    reset,
  } as const
}
