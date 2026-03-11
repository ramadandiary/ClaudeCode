// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestJPYC
 * @notice テストネット用のダミーJPYCトークン（ERC-20）
 *
 * 機能:
 *   - デプロイ時にデプロイヤーへ初期供給量をmint
 *   - faucet(): 誰でも10,000 JPYCを取得可能（1時間のクールダウン）
 *   - mint(): オーナーのみ任意アドレスへmint
 *
 * @dev このコントラクトはテスト専用です。本番環境では使用しないでください。
 */
contract TestJPYC is ERC20, Ownable {
    // =========================================================
    // 定数
    // =========================================================

    /// @notice faucet 1回あたりの配布量（10,000 JPYC）
    uint256 public constant FAUCET_AMOUNT = 10_000 * 10 ** 18;

    /// @notice faucet のクールダウン時間（1時間）
    uint256 public constant FAUCET_COOLDOWN = 1 hours;

    // =========================================================
    // ストレージ
    // =========================================================

    /// @notice アドレスごとの最終faucet実行時刻
    mapping(address => uint256) public lastFaucetTime;

    // =========================================================
    // イベント
    // =========================================================

    /// @notice faucet実行時に発行されるイベント
    event FaucetUsed(address indexed recipient, uint256 amount);

    // =========================================================
    // コンストラクタ
    // =========================================================

    /**
     * @param initialSupply デプロイヤーへのmint量（JPYC単位、decimals分は自動付与）
     *                      例: 1_000_000 → 1,000,000 JPYC
     */
    constructor(uint256 initialSupply)
        ERC20("JPY Coin", "JPYC")
        Ownable(msg.sender)
    {
        // デプロイヤーへ初期供給量をmint
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // =========================================================
    // パブリック関数
    // =========================================================

    /**
     * @notice テスト用faucet: 呼び出し元に FAUCET_AMOUNT (10,000 JPYC) をmintする
     * @dev 1時間に1回まで呼び出し可能
     */
    function faucet() external {
        require(
            block.timestamp >= lastFaucetTime[msg.sender] + FAUCET_COOLDOWN,
            "TestJPYC: faucet cooldown not expired (1 hour)"
        );

        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);

        emit FaucetUsed(msg.sender, FAUCET_AMOUNT);
    }

    // =========================================================
    // オーナー専用関数
    // =========================================================

    /**
     * @notice オーナーのみ: 任意アドレスへ任意量をmintする
     * @param to     mint先アドレス
     * @param amount mint量（wei単位、例: 1000 * 10**18 = 1,000 JPYC）
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
