# JPYCウォレット（テストネット版）

JPYCステーブルコイン専用のウォレットWebアプリです。Ethereum SepioliaとPolygon Amoyテストネットに対応しています。

## 機能

- **ウォレット接続**: MetaMask / WalletConnect対応（RainbowKit使用）
- **残高表示**: 各チェーンのJPYC残高とネイティブトークン残高を表示（30秒自動リフレッシュ）
- **送金**: ガス代見積もり付きの安全な送金フロー（確認モーダル付き）
- **ダーク/ライトテーマ**: ダークモードをデフォルトに切り替え対応
- **日本語UI**: 全UIが日本語表示

## 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | ^18.3 | UIフレームワーク |
| TypeScript | ^5.7 | 型安全性 |
| Vite | ^6.0 | ビルドツール |
| wagmi | ^2.14 | Ethereum接続 |
| viem | ^2.21 | EVM操作 |
| RainbowKit | ^2.2 | ウォレットUI |
| Tailwind CSS | ^3.4 | スタイリング |
| TanStack Query | ^5.64 | データフェッチ |

## セットアップ手順

### 1. リポジトリのクローン / ダウンロード

```bash
git clone <repository-url>
cd jpyc-wallet
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、各値を設定します。

```bash
cp .env.example .env
```

`.env`ファイルを編集してください：

```env
# WalletConnect Project ID（必須）
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# RPC URL（任意 - 設定しない場合はパブリックRPCを使用）
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY

# JPYCコントラクトアドレス（テストネット用）
VITE_JPYC_ADDRESS_SEPOLIA=0x...
VITE_JPYC_ADDRESS_AMOY=0x...
```

### 4. WalletConnect Project IDの取得

1. [WalletConnect Cloud](https://cloud.walletconnect.com) にアクセス
2. アカウント登録 / ログイン
3. 「New Project」を作成
4. Project IDをコピーして`.env`に設定

### 5. テスト用JPYCコントラクトのデプロイ

JPYCはSepoliaとAmoyテストネットに公式デプロイされていません。テスト用のERC-20トークンをデプロイしてください。

#### Remix IDEを使ったデプロイ手順

1. [Remix IDE](https://remix.ethereum.org/) にアクセス
2. 新しいファイル `TestJPYC.sol` を作成して以下のコードを貼り付け：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestJPYC is ERC20 {
    constructor(uint256 initialSupply) ERC20("JPY Coin", "JPYC") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // テスト用: 誰でもmintできる
    function faucet(uint256 amount) external {
        _mint(msg.sender, amount * 10 ** decimals());
    }
}
```

3. 「Solidity Compiler」でコンパイル
4. 「Deploy & Run Transactions」でネットワークを「Injected Provider - MetaMask」に切り替え
5. SepoliaとAmoyそれぞれでデプロイ（初期供給量: `1000000` = 100万JPYC）
6. デプロイ後のコントラクトアドレスを`.env`に設定

#### テストトークンの取得（faucet）

- **Sepolia ETH**: [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia) / [Infura Faucet](https://www.infura.io/faucet/sepolia)
- **Amoy MATIC**: [Polygon Faucet](https://faucet.polygon.technology/)
- **テストJPYC**: デプロイしたコントラクトの `faucet(amount)` 関数を呼び出す

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスします。

### 7. ビルド（本番用）

```bash
npm run build
```

`dist/`フォルダにビルド成果物が生成されます。

## プロジェクト構成

```
src/
├── components/
│   ├── Header.tsx        # ヘッダー（接続・チェーン切替・テーマ）
│   ├── BalanceCard.tsx   # チェーン別残高カード
│   ├── SendForm.tsx      # 送金フォーム（確認モーダル付き）
│   ├── GasEstimate.tsx   # ガス代見積もり表示
│   └── TxToast.tsx       # トランザクション結果トースト
├── config/
│   ├── chains.ts         # チェーン定義（Sepolia, Amoy）
│   ├── tokens.ts         # JPYCコントラクトアドレス・ABI
│   └── wagmi.ts          # wagmi/RainbowKit設定
├── hooks/
│   ├── useJpycBalance.ts # JPYC残高取得フック
│   ├── useSendJpyc.ts    # JPYC送金フック
│   └── useGasEstimate.ts # ガス代見積もりフック
├── App.tsx               # ルートコンポーネント
├── main.tsx              # エントリーポイント
└── index.css             # グローバルスタイル
```

## 注意事項

- このアプリは個人利用のテストネットプロトタイプです
- 実際の資産を扱う本番環境での使用は想定していません
- テストネットのトークンに実際の価値はありません

## ライセンス

MIT
