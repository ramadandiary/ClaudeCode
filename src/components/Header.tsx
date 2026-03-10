import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { sepolia, polygonAmoy } from 'wagmi/chains'

// =========================================================
// Header コンポーネント
// ウォレット接続ボタン・チェーン切り替え・テーマ切り替えを提供
// =========================================================

type Props = {
  isDark: boolean
  onToggleTheme: () => void
}

// チェーン選択肢
const CHAIN_OPTIONS = [
  { id: sepolia.id,      label: 'Ethereum Sepolia' },
  { id: polygonAmoy.id,  label: 'Polygon Amoy'     },
] as const

// 太陽アイコン（ライトモード）
function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="6"  />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2"  y1="12" x2="6"  y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  )
}

// 月アイコン（ダークモード）
function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function Header({ isDark, onToggleTheme }: Props) {
  const { isConnected } = useAccount()
  const chainId         = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  return (
    <header className="
      sticky top-0 z-40
      backdrop-blur-md
      bg-white/90 dark:bg-[#0a0e17]/90
      border-b border-slate-200 dark:border-slate-800/60
      shadow-sm dark:shadow-none
    ">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* === ロゴ === */}
          <div className="flex items-center gap-2 shrink-0">
            {/* JPYCシンボル */}
            <div className="
              w-8 h-8 rounded-lg flex items-center justify-center
              bg-gradient-to-br from-blue-500 to-purple-600
              text-white font-black text-sm
              shadow-lg shadow-blue-500/20
            ">
              ¥
            </div>
            <span className="
              font-bold text-lg tracking-tight
              text-slate-900 dark:text-white
              hidden sm:block
            ">
              JPYCウォレット
            </span>
          </div>

          {/* === 右側コントロール群 === */}
          <div className="flex items-center gap-2">

            {/* チェーン切り替えドロップダウン（接続時のみ表示） */}
            {isConnected && (
              <div className="relative">
                <select
                  value={chainId}
                  disabled={isSwitching}
                  onChange={(e) => switchChain({ chainId: Number(e.target.value) })}
                  className="
                    appearance-none
                    pl-3 pr-8 py-2
                    text-sm font-medium
                    rounded-xl
                    bg-slate-100 dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700
                    text-slate-700 dark:text-slate-200
                    cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    disabled:opacity-50 disabled:cursor-wait
                    transition-colors
                  "
                >
                  {CHAIN_OPTIONS.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.label}
                    </option>
                  ))}
                </select>
                {/* カスタム矢印アイコン */}
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 8L2 4h8L6 8z" />
                  </svg>
                </div>
              </div>
            )}

            {/* RainbowKit コネクトボタン */}
            <ConnectButton
              showBalance={false}
              chainStatus="none"
              accountStatus="address"
            />

            {/* テーマ切り替えボタン */}
            <button
              onClick={onToggleTheme}
              aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              title={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              className="
                p-2 rounded-xl
                bg-slate-100 dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-600 dark:text-slate-300
                hover:bg-slate-200 dark:hover:bg-slate-700
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
              "
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
