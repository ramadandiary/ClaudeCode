import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { isAddress } from 'viem'
import { useSendJpyc } from '../hooks/useSendJpyc'
import { useJpycBalance } from '../hooks/useJpycBalance'
import { GasEstimate } from './GasEstimate'
import { showSuccessToast, showErrorToast } from './TxToast'
import { JPYC_SYMBOL, JPYC_ADDRESSES } from '../config/tokens'
import { CHAIN_META, type SupportedChainId } from '../config/chains'

// =========================================================
// SendForm コンポーネント
// JPYC送金フォーム（確認モーダル付き）
// =========================================================

/** アドレスの妥当性チェック（入力中はエラーを出さないよう注意） */
function validateAddress(value: string): string | null {
  if (!value) return null
  if (!isAddress(value)) return '有効なEthereumアドレスを入力してください（0x...）'
  return null
}

/** 金額の妥当性チェック */
function validateAmount(value: string, balance: string | null): string | null {
  if (!value) return null
  const num = parseFloat(value)
  if (isNaN(num) || num <= 0) return '0より大きい金額を入力してください'
  if (balance !== null && num > parseFloat(balance)) return 'JPYC残高が不足しています'
  return null
}

/** 数値を見やすく整形する */
function formatDisplay(value: string): string {
  const num = parseFloat(value)
  if (isNaN(num)) return value
  return num.toLocaleString('ja-JP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// =========================================================
// 確認モーダルコンポーネント
// =========================================================
type ConfirmModalProps = {
  to:            string
  amount:        string
  chainId:       number
  onConfirm:     () => void
  onCancel:      () => void
  isSubmitting:  boolean
}

function ConfirmModal({ to, amount, chainId, onConfirm, onCancel, isSubmitting }: ConfirmModalProps) {
  const meta = CHAIN_META[chainId as SupportedChainId]

  return (
    // モーダルオーバーレイ
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="
        w-full max-w-sm mx-4 mb-4 sm:mb-0
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-700
        rounded-2xl shadow-2xl shadow-black/30
        overflow-hidden
        animate-slide-in
      ">
        {/* ヘッダー */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            送金確認
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            以下の内容でよろしいですか？
          </p>
        </div>

        {/* 送金詳細 */}
        <div className="px-6 py-4 space-y-4">
          {/* 送金先 */}
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
              送金先アドレス
            </p>
            <p className="font-mono text-sm text-slate-800 dark:text-slate-200 break-all">
              {to}
            </p>
          </div>

          {/* 金額 */}
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
              送金金額
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatDisplay(amount)}
              <span className="text-base font-semibold text-slate-400 dark:text-slate-500 ml-1">
                {JPYC_SYMBOL}
              </span>
            </p>
          </div>

          {/* ガス代 */}
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
              推定ガス代
            </p>
            <GasEstimate to={to} amount={amount} chainId={chainId} />
          </div>

          {/* ネットワーク */}
          <div className="
            px-3 py-2 rounded-xl
            bg-slate-50 dark:bg-slate-800/60
            border border-slate-200 dark:border-slate-700/60
          ">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 dark:text-slate-500">ネットワーク</span>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: meta.accentColor }}
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {meta.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="
              flex-1 py-3 rounded-xl text-sm font-semibold
              bg-slate-100 dark:bg-slate-800
              text-slate-700 dark:text-slate-300
              hover:bg-slate-200 dark:hover:bg-slate-700
              disabled:opacity-50
              transition-colors
            "
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="
              flex-1 py-3 rounded-xl text-sm font-semibold
              bg-blue-600 hover:bg-blue-500
              text-white
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-colors
              shadow-lg shadow-blue-500/20
            "
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                送信中...
              </span>
            ) : '確認して送金'}
          </button>
        </div>
      </div>
    </div>
  )
}

// =========================================================
// SendForm メインコンポーネント
// =========================================================
export function SendForm() {
  const { isConnected } = useAccount()
  const chainId         = useChainId()

  const [toAddress,    setToAddress]    = useState('')
  const [amount,       setAmount]       = useState('')
  const [showModal,    setShowModal]    = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [amountError,  setAmountError]  = useState<string | null>(null)

  const { jpycBalance, refetch: refetchBalance } = useJpycBalance(chainId)
  const {
    sendJpyc,
    txHash,
    isWritePending,
    isConfirming,
    isSuccess,
    errorMessage,
    reset,
  } = useSendJpyc()

  const jpycAddress = JPYC_ADDRESSES[chainId]
  const isContractSet = !!jpycAddress &&
    jpycAddress !== '0x0000000000000000000000000000000000000001'

  const isSubmitting = isWritePending || isConfirming

  // 送金成功時にトーストを表示しフォームをリセット
  useEffect(() => {
    if (isSuccess && txHash) {
      showSuccessToast(txHash, chainId)
      setToAddress('')
      setAmount('')
      reset()
      refetchBalance()
    }
  }, [isSuccess, txHash, chainId, reset, refetchBalance])

  // エラー発生時にトーストを表示
  useEffect(() => {
    if (errorMessage) {
      showErrorToast(errorMessage)
    }
  }, [errorMessage])

  // アドレス入力バリデーション（フォーカスアウト時）
  const handleAddressBlur = () => {
    setAddressError(validateAddress(toAddress))
  }

  // 金額入力バリデーション（変更時）
  const handleAmountChange = (value: string) => {
    // 数字と小数点のみ許可
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return
    setAmount(value)
    if (value) {
      setAmountError(validateAmount(value, jpycBalance))
    } else {
      setAmountError(null)
    }
  }

  // 最大金額をセット
  const handleMax = () => {
    if (jpycBalance) {
      setAmount(jpycBalance)
      setAmountError(null)
    }
  }

  // 送金ボタン押下：フォームバリデーション → モーダル表示
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const addrErr   = validateAddress(toAddress)
    const amountErr = validateAmount(amount, jpycBalance)
    setAddressError(addrErr)
    setAmountError(amountErr)

    if (addrErr || amountErr || !toAddress || !amount) return
    setShowModal(true)
  }

  // モーダルで確認後に送金実行
  const handleConfirm = () => {
    setShowModal(false)
    sendJpyc(toAddress, amount)
  }

  // 未接続の場合
  if (!isConnected) {
    return (
      <div className="
        rounded-2xl
        border border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-900/80
        p-8 text-center
      ">
        <div className="
          w-16 h-16 mx-auto mb-4 rounded-2xl
          bg-slate-100 dark:bg-slate-800
          flex items-center justify-center
        ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400 dark:text-slate-500"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          ウォレットを接続して送金機能を使用してください
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="
        rounded-2xl
        border border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-900/80
        overflow-hidden
      ">
        {/* カードヘッダー */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            JPYCを送金
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            現在のネットワーク上のJPYCを送金します
          </p>
        </div>

        {/* コントラクト未設定の警告バナー */}
        {!isContractSet && (
          <div className="
            mx-6 mt-4
            px-4 py-3 rounded-xl
            bg-amber-50 dark:bg-amber-950/30
            border border-amber-200 dark:border-amber-800/40
          ">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              このネットワークのJPYCコントラクトアドレスが設定されていません。
              .envファイルにアドレスを設定してください。
            </p>
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>

          {/* 送金先アドレス */}
          <div>
            <label
              htmlFor="to-address"
              className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5"
            >
              送金先アドレス
            </label>
            <input
              id="to-address"
              type="text"
              value={toAddress}
              onChange={(e) => {
                setToAddress(e.target.value)
                setAddressError(null)
              }}
              onBlur={handleAddressBlur}
              placeholder="0x..."
              autoComplete="off"
              spellCheck={false}
              className={`
                w-full px-4 py-3 rounded-xl
                font-mono text-sm
                bg-slate-50 dark:bg-slate-800
                border ${addressError
                  ? 'border-red-400 dark:border-red-600 focus:ring-red-500/30'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/30'
                }
                text-slate-900 dark:text-slate-100
                placeholder-slate-300 dark:placeholder-slate-600
                focus:outline-none focus:ring-2
                transition-colors
              `}
            />
            {addressError && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                {addressError}
              </p>
            )}
          </div>

          {/* 送金金額 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="amount"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
              >
                送金金額
              </label>
              {/* 残高表示 + Maxボタン */}
              {jpycBalance !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    残高: {parseFloat(jpycBalance).toLocaleString('ja-JP', { maximumFractionDigits: 2 })} {JPYC_SYMBOL}
                  </span>
                  <button
                    type="button"
                    onClick={handleMax}
                    className="
                      text-xs font-semibold
                      text-blue-500 dark:text-blue-400
                      hover:text-blue-600 dark:hover:text-blue-300
                      transition-colors
                    "
                  >
                    MAX
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className={`
                  w-full px-4 py-3 pr-20 rounded-xl
                  font-mono text-sm
                  bg-slate-50 dark:bg-slate-800
                  border ${amountError
                    ? 'border-red-400 dark:border-red-600 focus:ring-red-500/30'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/30'
                  }
                  text-slate-900 dark:text-slate-100
                  placeholder-slate-300 dark:placeholder-slate-600
                  focus:outline-none focus:ring-2
                  transition-colors
                `}
              />
              {/* JPYCラベル */}
              <div className="
                absolute right-4 top-1/2 -translate-y-1/2
                text-sm font-semibold text-slate-400 dark:text-slate-500
              ">
                {JPYC_SYMBOL}
              </div>
            </div>

            {amountError && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                {amountError}
              </p>
            )}
          </div>

          {/* ガス代見積もり */}
          {toAddress && amount && !addressError && !amountError && (
            <GasEstimate to={toAddress} amount={amount} chainId={chainId} />
          )}

          {/* トランザクション確認待ちバナー */}
          {isConfirming && (
            <div className="
              flex items-center gap-3
              px-4 py-3 rounded-xl
              bg-blue-50 dark:bg-blue-950/30
              border border-blue-200 dark:border-blue-800/40
            ">
              <svg className="animate-spin w-4 h-4 text-blue-500 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                トランザクションを確認中です。しばらくお待ちください...
              </p>
            </div>
          )}

          {/* 送金ボタン */}
          <button
            type="submit"
            disabled={isSubmitting || !isContractSet}
            className="
              w-full py-3.5 rounded-xl
              text-sm font-bold
              bg-gradient-to-r from-blue-600 to-blue-500
              hover:from-blue-500 hover:to-blue-400
              text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-blue-500/20
              hover:shadow-blue-500/30
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            "
          >
            {isWritePending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                ウォレットで承認してください
              </span>
            ) : isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                確認中...
              </span>
            ) : (
              'JPYCを送金する'
            )}
          </button>
        </form>
      </div>

      {/* 確認モーダル */}
      {showModal && (
        <ConfirmModal
          to={toAddress}
          amount={amount}
          chainId={chainId}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  )
}
