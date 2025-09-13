class WalletManager {
  constructor() {
    this.wallet = null;
    this.connection = null;
    this.isConnected = false;

    this.init();
  }

  async init() {
    // Инициализация подключения к Solana
    this.connection = new solanaWeb3.Connection(
      CONFIG.rpcEndpoint,
      "confirmed"
    );

    // Проверяем наличие Phantom кошелька
    if (window.solana && window.solana.isPhantom) {
      this.wallet = window.solana;

      // Проверяем автоматическое подключение
      if (this.wallet.isConnected) {
        await this.handleConnection();
      }
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Кнопка подключения кошелька
    const connectBtn = document.getElementById("connect-wallet");
    if (connectBtn) {
      connectBtn.addEventListener("click", () => this.connect());
    }

    // Кнопка отключения
    const disconnectBtn = document.getElementById("disconnect-wallet");
    if (disconnectBtn) {
      disconnectBtn.addEventListener("click", () => this.disconnect());
    }

    // События кошелька
    if (this.wallet) {
      this.wallet.on("connect", () => this.handleConnection());
      this.wallet.on("disconnect", () => this.handleDisconnection());
    }
  }

  async connect() {
    if (!this.wallet) {
      alert("Пожалуйста, установите Phantom кошелек");
      return;
    }

    try {
      await this.wallet.connect();
    } catch (error) {
      console.error("Ошибка подключения кошелька:", error);
      utils.showNotification("Ошибка подключения кошелька", "error");
    }
  }

  async disconnect() {
    if (this.wallet && this.isConnected) {
      await this.wallet.disconnect();
    }
  }

  async handleConnection() {
    this.isConnected = true;
    const publicKey = this.wallet.publicKey.toString();

    // Обновляем UI
    this.updateWalletUI(publicKey);

    // Получаем баланс
    await this.updateBalance();

    utils.showNotification("Кошелек подключен успешно!", "success");

    // Запускаем загрузку NFT
    if (window.nftManager) {
      await window.nftManager.loadUserNFTs();
    }
  }

  handleDisconnection() {
    this.isConnected = false;
    this.updateWalletUI(null);
    utils.showNotification("Кошелек отключен", "info");
  }

  updateWalletUI(publicKey) {
    const connectBtn = document.getElementById("connect-wallet");
    const walletInfo = document.getElementById("wallet-info");
    const walletAddress = document.getElementById("wallet-address");

    if (publicKey) {
      connectBtn.style.display = "none";
      walletInfo.style.display = "flex";
      walletAddress.textContent = utils.shortenAddress(publicKey);
    } else {
      connectBtn.style.display = "block";
      walletInfo.style.display = "none";
    }
  }

  async updateBalance() {
    if (!this.isConnected) return;

    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      const balanceSOL = balance / solanaWeb3.LAMPORTS_PER_SOL;

      console.log(`Баланс: ${balanceSOL.toFixed(4)} SOL`);
    } catch (error) {
      console.error("Ошибка получения баланса:", error);
    }
  }

  // Подписание транзакции
  async signTransaction(transaction) {
    if (!this.isConnected) {
      throw new Error("Кошелек не подключен");
    }

    return await this.wallet.signTransaction(transaction);
  }

  getPublicKey() {
    return this.isConnected ? this.wallet.publicKey : null;
  }
}

// Инициализация менеджера кошелька
let walletManager;
document.addEventListener("DOMContentLoaded", () => {
  walletManager = new WalletManager();
  window.walletManager = walletManager;
});
