import toast from 'react-hot-toast'
import { getExplorerTxUrl } from '../config/chains'

// =========================================================
// TxToast ユーティリティ
// トランザクション結果をトーストで表示する
// =========================================================

/** 外部リンクアイコン */
function ExternalLinkIcon() {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

/**
 * 送金成功トーストを表示する
 * @param txHash  - トランザクションハッシュ
 * @param chainId - チェーンID（エクスプローラーURL生成に使用）
 */
export function showSuccessToast(txHash: string, chainId: number) {
  const explorerUrl = getExplorerTxUrl(chainId, txHash)
  const shortHash   = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`

  toast.custom(
    (t) => (
      <div
        className={`
          flex flex-col gap-2
          max-w-sm w-full
          bg-white dark:bg-slate-800
          border border-green-200 dark:border-green-800/60
          shadow-lg shadow-black/10 dark:shadow-black/30
          rounded-2xl p-4
          transition-all duration-300
          ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
      >
        {/* 成功ヘッダー */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 dark:text-white text-sm">
            送金が完了しました
          </span>
        </div>

        {/* ハッシュ + エクスプローラーリンク */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
            {shortHash}
          </span>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-1
              text-xs font-medium
              text-blue-500 dark:text-blue-400
              hover:text-blue-600 dark:hover:text-blue-300
              transition-colors
            "
          >
            エクスプローラーで確認
            <ExternalLinkIcon />
          </a>
        </div>
      </div>
    ),
    {
      duration: 8000,
      position: 'bottom-right',
    }
  )
}

/**
 * 送金エラートーストを表示する
 * @param message - エラーメッセージ
 */
export function showErrorToast(message: string) {
  toast.custom(
    (t) => (
      <div
        className={`
          flex items-start gap-3
          max-w-sm w-full
          bg-white dark:bg-slate-800
          border border-red-200 dark:border-red-800/60
          shadow-lg shadow-black/10 dark:shadow-black/30
          rounded-2xl p-4
          transition-all duration-300
          ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
      >
        {/* エラーアイコン */}
        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-white text-sm">
            送金に失敗しました
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {message}
          </p>
        </div>
      </div>
    ),
    {
      duration: 6000,
      position: 'bottom-right',
    }
  )
}
