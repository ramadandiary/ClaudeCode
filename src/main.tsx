import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'
import { App }         from './App'
import './index.css'

// =========================================================
// エントリーポイント
// =========================================================
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error(
    '#root 要素が見つかりません。index.htmlを確認してください。'
  )
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
