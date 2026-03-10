import { useJpycBalance } from '../hooks/useJpycBalance'
import { CHAIN_META, type SupportedChainId } from '../config/chains'
import { JPYC_SYMBOL } from '../config/tokens'

// =========================================================
// BalanceCard コンポーネント
// チェーンごとのJPYC残高とネイティブトークン残高をカード形式で表示
// =========================================================

type Props = {
  chainId:   SupportedChainId
  onRefresh: () => void
}

/** 数値文字列をカンマ区切りで整形する（小数点以下2桁） */
function formatJpyc(value: string | null): string {
  if (value === null) return '---'
  const num = parseFloat(value)
  if (isNaN(num)) return '---'
  return num.toLocaleString('ja-JP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** ネイティブトークン残高を整形する（小数点以下6桁） */
function formatNative(value: string | null): string {
  if (value === null) return '---'
  const num = parseFloat(value)
  if (isNaN(num)) return '---'
  return num.toLocaleString('ja-JP', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  })
}

// スピナーアイコン
function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

// ガスポンプアイコン
function GasIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 22V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13" />
      <path d="M13 15h2a2 2 0 0 0 2-2V9l2 2" />
      <line x1="3" y1="22" x2="13" y2="22" />
      <rect x="5" y="11" width="6" height="3" rx="1" />
    </svg>
  )
}

export function BalanceCard({ chainId, onRefresh }: Props) {
  const meta = CHAIN_META[chainId]
  const {
    jpycBalance,
    nativeBalance,
    nativeSymbol,
    isLoading,
    error,
    refetch,
  } = useJpycBalance(chainId)

  const handleRefresh = () => {
    refetch()
    onRefresh()
  }

  return (
    <div className="
      relative overflow-hidden
      rounded-2xl
      border border-slate-200 dark:border-slate-800
      bg-white dark:bg-slate-900/80
      shadow-sm hover:shadow-md dark:shadow-none
      transition-all duration-200
    ">
      {/* チェーンカラーのアクセントライン */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-70"
        style={{ background: meta.accentColor }}
      />

      <div className="p-5">
        {/* チェーン名 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* チェーンアイコン（カラーバッジ） */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: meta.accentColor }}
            >
              {meta.icon.slice(0, 1)}
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {meta.label}
            </span>
          </div>

          {/* リフレッシュボタン */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="残高を更新"
            title="残高を更新"
            className="
              p-1.5 rounded-lg
              text-slate-400 dark:text-slate-500
              hover:text-blue-500 dark:hover:text-blue-400
              hover:bg-blue-50 dark:hover:bg-blue-950/30
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {isLoading ? <SpinnerIcon /> : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6" />
                <path d="M22 12.5a10 10 0 0 1-14.26 8.21M2 11.5A10 10 0 0 1 16.26 3.29" />
              </svg>
            )}
          </button>
        </div>

        {/* JPYC残高（メイン表示） */}
        <div className="mb-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-medium uppercase tracking-wide">
            JPYC 残高
          </p>
          {isLoading && jpycBalance === null ? (
            // スケルトンローディング
            <div className="h-9 w-40 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ) : error ? (
            // エラー状態（コントラクト未設定など）
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold text-slate-300 dark:text-slate-600 font-mono">
                ---
              </span>
              <span className="text-xs text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">
                未設定
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {formatJpyc(jpycBalance)}
              </span>
              <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                {JPYC_SYMBOL}
              </span>
            </div>
          )}
        </div>

        {/* ネイティブトークン残高（ガス代確認用） */}
        <div className="
          flex items-center gap-1.5
          mt-3 pt-3
          border-t border-slate-100 dark:border-slate-800
        ">
          <span className="text-slate-400 dark:text-slate-600">
            <GasIcon />
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            ガス残高:
          </span>
          {isLoading && nativeBalance === null ? (
            <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ) : (
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {formatNative(nativeBalance)}{' '}{nativeSymbol}
            </span>
          )}
        </div>

        {/* コントラクト未設定の警告 */}
        {error && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            ※ JPYCコントラクトアドレスが未設定です。.envを確認してください。
          </p>
        )}
      </div>
    </div>
  )
}
