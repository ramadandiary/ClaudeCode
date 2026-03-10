import { useState, useEffect } from 'react'
import { WagmiProvider }         from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { Toaster }  from 'react-hot-toast'
import { useAccount } from 'wagmi'

import { wagmiConfig }  from './config/wagmi'
import { SUPPORTED_CHAINS } from './config/chains'
import { Header }       from './components/Header'
import { BalanceCard }  from './components/BalanceCard'
import { SendForm }     from './components/SendForm'

// RainbowKit CSSのインポート（必須）
import '@rainbow-me/rainbowkit/styles.css'

// =========================================================
// React QueryクライアントをApp外に定義（再レンダリングで再生成されないよう）
// =========================================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ウィンドウフォーカス時の自動リフレッシュを無効化（残高は独自インターバルで管理）
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

// =========================================================
// BalanceSection - 残高エリア全体
// =========================================================
function BalanceSection() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="
        flex flex-col items-center justify-center
        py-20 text-center
      ">
        {/* ウォレットアイコン */}
        <div className="
          w-20 h-20 mx-auto mb-6 rounded-3xl
          bg-gradient-to-br from-blue-500/10 to-purple-500/10
          dark:from-blue-500/20 dark:to-purple-500/20
          border border-blue-500/20 dark:border-blue-500/30
          flex items-center justify-center
        ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-500"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          ウォレットを接続してください
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
          右上の「ウォレットを接続」ボタンからMetaMaskなどを接続してJPYCの残高を確認できます
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* チェーン別残高カード */}
      <div>
        <h2 className="
          text-xs font-semibold uppercase tracking-wider
          text-slate-400 dark:text-slate-500
          mb-3
        ">
          チェーン別残高
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SUPPORTED_CHAINS.map((chain) => (
            <BalanceCard
              key={chain.id}
              chainId={chain.id}
              onRefresh={() => {}}
            />
          ))}
        </div>
      </div>

      {/* 送金フォーム */}
      <div>
        <h2 className="
          text-xs font-semibold uppercase tracking-wider
          text-slate-400 dark:text-slate-500
          mb-3
        ">
          送金
        </h2>
        <SendForm />
      </div>
    </div>
  )
}

// =========================================================
// AppInner - プロバイダー内部で動作するメインコンテンツ
// =========================================================
type AppInnerProps = {
  isDark:         boolean
  onToggleTheme:  () => void
}

function AppInner({ isDark, onToggleTheme }: AppInnerProps) {
  return (
    <RainbowKitProvider
      theme={isDark ? darkTheme({
        accentColor:          '#3b82f6',
        accentColorForeground: 'white',
        borderRadius:          'large',
      }) : lightTheme({
        accentColor:          '#3b82f6',
        accentColorForeground: 'white',
        borderRadius:          'large',
      })}
      locale="ja"
    >
      {/* ページ全体のラッパー */}
      <div className="
        min-h-screen
        bg-slate-50 dark:bg-[#0a0e17]
        text-slate-900 dark:text-white
        transition-colors duration-200
      ">
        {/* ヘッダー */}
        <Header isDark={isDark} onToggleTheme={onToggleTheme} />

        {/* メインコンテンツ */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* ページタイトル（モバイルのみ表示） */}
          <div className="sm:hidden mb-6">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              JPYCウォレット
            </h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
              テストネット版
            </p>
          </div>

          <BalanceSection />
        </main>

        {/* フッター */}
        <footer className="
          text-center py-8
          text-xs text-slate-300 dark:text-slate-700
        ">
          <p>JPYCウォレット テストネット版 &mdash; 個人利用プロトタイプ</p>
        </footer>
      </div>

      {/* トーストコンテナ */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          // デフォルトスタイルはTxToastで上書きするので最小限
          duration: 5000,
        }}
      />
    </RainbowKitProvider>
  )
}

// =========================================================
// App - ルートコンポーネント
// テーマ状態・プロバイダーを管理する
// =========================================================
export function App() {
  // テーマ状態（ローカルストレージから復元、デフォルトはダーク）
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('jpyc-wallet-theme')
    return saved !== 'light'
  })

  // テーマ変更時にhtmlクラスとローカルストレージを更新
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
    localStorage.setItem('jpyc-wallet-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark((prev) => !prev)

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppInner isDark={isDark} onToggleTheme={toggleTheme} />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
