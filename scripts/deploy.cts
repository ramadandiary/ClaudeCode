import { ethers, network } from 'hardhat'
import fs from 'fs'
import path from 'path'

// =========================================================
// ネットワーク設定
// =========================================================

/** デプロイ対象ネットワークの設定 */
const NETWORK_CONFIG: Record<string, {
  label:       string       // 表示名
  envKey:      string       // .env に書き込むキー名
  explorerUrl: string       // ブロックエクスプローラーのベースURL
}> = {
  sepolia: {
    label:       'Ethereum Sepolia',
    envKey:      'VITE_JPYC_ADDRESS_SEPOLIA',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  amoy: {
    label:       'Polygon Amoy',
    envKey:      'VITE_JPYC_ADDRESS_AMOY',
    explorerUrl: 'https://amoy.polygonscan.com',
  },
}

// 初期供給量: 1,000,000 JPYC（デプロイヤーのウォレットにmint）
const INITIAL_SUPPLY = 1_000_000n

// =========================================================
// .env 自動更新ユーティリティ
// =========================================================

/**
 * .env ファイルの指定キーの値を更新する（または追記する）
 * @param key   環境変数のキー名
 * @param value 設定する値
 */
function updateEnvFile(key: string, value: string): void {
  const envPath = path.resolve(__dirname, '../.env')

  // .env が存在しない場合は空ファイルとして扱う
  let content = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf8')
    : ''

  const pattern = new RegExp(`^${key}=.*$`, 'm')

  if (pattern.test(content)) {
    // 既存の行を上書き
    content = content.replace(pattern, `${key}=${value}`)
  } else {
    // ファイル末尾に追記（改行を確保）
    if (content.length > 0 && !content.endsWith('\n')) {
      content += '\n'
    }
    content += `${key}=${value}\n`
  }

  fs.writeFileSync(envPath, content, 'utf8')
}

// =========================================================
// メインデプロイ処理
// =========================================================

async function main(): Promise<void> {
  const networkName = network.name

  // サポート外のネットワークはエラー
  const netConfig = NETWORK_CONFIG[networkName]
  if (!netConfig) {
    throw new Error(
      `未対応のネットワーク: "${networkName}"\n` +
      `対応ネットワーク: ${Object.keys(NETWORK_CONFIG).join(', ')}`
    )
  }

  // デプロイヤーの signer を取得
  const [deployer] = await ethers.getSigners()
  if (!deployer) {
    throw new Error(
      'デプロイヤーが見つかりません。\n' +
      '.env に DEPLOYER_PRIVATE_KEY を設定してください。'
    )
  }

  // デプロイヤーの残高を確認
  const balance = await ethers.provider.getBalance(deployer.address)
  const balanceEth = ethers.formatEther(balance)

  console.log('')
  console.log('================================================')
  console.log(`  TestJPYC デプロイ開始`)
  console.log('================================================')
  console.log(`  ネットワーク  : ${netConfig.label}`)
  console.log(`  デプロイヤー  : ${deployer.address}`)
  console.log(`  残高          : ${balanceEth} (ネイティブトークン)`)
  console.log(`  初期供給量    : ${INITIAL_SUPPLY.toLocaleString()} JPYC`)
  console.log('================================================')
  console.log('')

  if (balance === 0n) {
    console.warn('⚠️  警告: デプロイヤーの残高が0です。ガス代が不足する可能性があります。')
    console.warn('   テストネット用のネイティブトークンをfaucetから取得してください。')
    console.warn('')
  }

  // =========================================================
  // コントラクトのデプロイ
  // =========================================================
  console.log('📦 コントラクトをデプロイ中...')

  const TestJPYC = await ethers.getContractFactory('TestJPYC')
  const token = await TestJPYC.deploy(INITIAL_SUPPLY)

  console.log(`   トランザクション送信済み: ${token.deploymentTransaction()?.hash}`)
  console.log('   マイニングを待機中...')

  // デプロイ完了を待機
  await token.waitForDeployment()

  const contractAddress = await token.getAddress()

  // =========================================================
  // デプロイ後の確認
  // =========================================================
  const deployedName     = await token.name()
  const deployedSymbol   = await token.symbol()
  const deployedDecimals = await token.decimals()
  const deployedSupply   = await token.totalSupply()

  console.log('')
  console.log('✅ デプロイ完了!')
  console.log('')
  console.log(`  コントラクトアドレス : ${contractAddress}`)
  console.log(`  トークン名           : ${deployedName}`)
  console.log(`  シンボル             : ${deployedSymbol}`)
  console.log(`  Decimals             : ${deployedDecimals}`)
  console.log(`  総供給量             : ${ethers.formatUnits(deployedSupply, deployedDecimals)} ${deployedSymbol}`)
  console.log(`  エクスプローラー     : ${netConfig.explorerUrl}/address/${contractAddress}`)
  console.log('')

  // =========================================================
  // .env の自動更新
  // =========================================================
  console.log(`📝 .env を更新中: ${netConfig.envKey}=${contractAddress}`)
  updateEnvFile(netConfig.envKey, contractAddress)
  console.log('   .env の更新が完了しました。')
  console.log('')
  console.log('================================================')
  console.log('  次のステップ:')
  console.log(`  1. ブラウザで確認: ${netConfig.explorerUrl}/address/${contractAddress}`)
  console.log('  2. アプリを再起動: npm run dev')
  console.log('  3. faucet でテスト JPYC を取得:')
  console.log(`     ${netConfig.explorerUrl}/address/${contractAddress}#writeContract`)
  console.log('================================================')
  console.log('')
}

// =========================================================
// エントリーポイント
// =========================================================
main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error('')
    console.error('❌ デプロイに失敗しました:')
    console.error(error)
    console.error('')
    process.exit(1)
  })
