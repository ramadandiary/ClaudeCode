import { useGasEstimate } from '../hooks/useGasEstimate'
import { CHAIN_META, type SupportedChainId } from '../config/chains'

// =========================================================
// GasEstimate コンポーネント
// 送金前のガス代見積もりをインラインで表示する
// =========================================================

type Props = {
  to:      string
  amount:  string
  chainId: number
}

export function GasEstimate({ to, amount, chainId }: Props) {
  const { gasCostFormatted, isLoading, error } = useGasEstimate(to, amount)

  const meta = CHAIN_META[chainId as SupportedChainId]
  const nativeToken = meta?.nativeToken ?? 'ETH'

  // 入力が不完全な場合は何も表示しない
  if (!to || !amount || parseFloat(amount) <= 0) return null

  return (
    <div className="
      flex items-center gap-2
      px-3 py-2 rounded-xl
      bg-slate-50 dark:bg-slate-800/60
      border border-slate-200 dark:border-slate-700/60
      text-sm
    ">
      {/* ガスアイコン */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-400 dark:text-slate-500 shrink-0"
      >
        <path d="M3 22V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13" />
        <path d="M13 15h2a2 2 0 0 0 2-2V9l2 2" />
        <line x1="3" y1="22" x2="13" y2="22" />
        <rect x="5" y="11" width="6" height="3" rx="1" />
      </svg>

      <span className="text-slate-500 dark:text-slate-400 shrink-0">
        推定ガス代:
      </span>

      {isLoading ? (
        // ローディング
        <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
      ) : error ? (
        // エラー
        <span className="text-amber-500 dark:text-amber-400 text-xs">
          {error}
        </span>
      ) : gasCostFormatted ? (
        // ガス代表示
        <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
          {gasCostFormatted}
          <span className="ml-1 text-slate-400 dark:text-slate-500 font-normal">
            {nativeToken}
          </span>
        </span>
      ) : null}
    </div>
  )
}
