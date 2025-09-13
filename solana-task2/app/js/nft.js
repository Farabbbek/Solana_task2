class NFTManager {
  constructor() {
    this.program = null;
    this.provider = null;
    this.userNFTs = [];

    this.init();
  }

  async init() {
    // Инициализация после загрузки кошелька
    if (window.walletManager && window.walletManager.isConnected) {
      await this.setupProgram();
    }
  }

  async setupProgram() {
    try {
      const response = await fetch("../target/idl/music_nft_project.json");
      const idl = await response.json();

      // Создаем провайдера
      this.provider = new anchor.AnchorProvider(
        walletManager.connection,
        walletManager.wallet,
        { commitment: "confirmed" }
      );

      // Инициализируем программу
      this.program = new anchor.Program(
        idl,
        new solanaWeb3.PublicKey(CONFIG.programId),
        this.provider
      );

      console.log("NFT Manager инициализирован");
    } catch (error) {
      console.error("Ошибка инициализации NFT Manager:", error);
    }
  }

  // Создание музыкального NFT
  async createMusicNFT() {
    if (!walletManager.isConnected) {
      utils.showNotification("Подключите кошелек", "error");
      return;
    }

    if (!this.program) {
      await this.setupProgram();
    }

    // Получаем данные из формы
    const formData = this.getFormData();
    if (!formData) return;

    const createBtn = document.getElementById("create-btn");
    utils.showLoader(createBtn);

    try {
      const mintKeypair = solanaWeb3.Keypair.generate();

      const [metadataPDA] = await solanaWeb3.PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          new solanaWeb3.PublicKey(CONFIG.metadataProgram).toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        new solanaWeb3.PublicKey(CONFIG.metadataProgram)
      );

      const [musicMetadataPDA] = await solanaWeb3.PublicKey.findProgramAddress(
        [Buffer.from("music_metadata"), mintKeypair.publicKey.toBuffer()],
        this.program.programId
      );

      // Получаем associated token account
      const associatedTokenAccount = await anchor.utils.token.associatedAddress(
        {
          mint: mintKeypair.publicKey,
          owner: walletManager.getPublicKey(),
        }
      );

      console.log("Создание NFT с данными:", formData);

      // Выполняем транзакцию
      const tx = await this.program.methods
        .createMusicNft(
          formData.name,
          formData.symbol,
          formData.uri,
          formData.artist,
          formData.genre,
          formData.duration,
          formData.royalty * 100
        )
        .accounts({
          payer: walletManager.getPublicKey(),
          mint: mintKeypair.publicKey,
          metadata: metadataPDA,
          associatedTokenAccount: associatedTokenAccount,
          musicMetadata: musicMetadataPDA,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          tokenMetadataProgram: new solanaWeb3.PublicKey(
            CONFIG.metadataProgram
          ),
          systemProgram: solanaWeb3.SystemProgram.programId,
          rent: solanaWeb3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();

      console.log("NFT создан! Transaction:", tx);

      // Показываем успешный результат
      this.showSuccessModal(tx, mintKeypair.publicKey.toString());

      // Обновляем статистику
      await this.updateStats();

      utils.showNotification("NFT успешно создан!", "success");
    } catch (error) {
      console.error("Ошибка создания NFT:", error);
      utils.showNotification("Ошибка создания NFT: " + error.message, "error");
    } finally {
      utils.hideLoader(createBtn);
    }
  }

  // Получение данных из формы
  getFormData() {
    const name = document.getElementById("track-name")?.value;
    const artist = document.getElementById("artist-name")?.value;
    const genre =
      document.getElementById("genre")?.value || CONFIG.defaults.genre;
    const duration =
      parseInt(document.getElementById("duration")?.value) ||
      CONFIG.defaults.duration;
    const royalty =
      parseFloat(document.getElementById("royalty")?.value) ||
      CONFIG.defaults.royalty;
    const uri =
      document.getElementById("metadata-uri")?.value ||
      "https://arweave.net/default-metadata";
    const symbol =
      document.getElementById("symbol")?.value || CONFIG.defaults.symbol;

    if (!name || !artist) {
      utils.showNotification("Заполните название трека и имя артиста", "error");
      return null;
    }

    return { name, artist, genre, duration, royalty, uri, symbol };
  }

  showSuccessModal(txSignature, mintAddress) {
    const modal = document.getElementById("success-modal");
    const mintAddressEl = document.getElementById("mint-address");
    const txLink = document.getElementById("tx-link");

    if (modal && mintAddressEl && txLink) {
      mintAddressEl.textContent = utils.shortenAddress(mintAddress, 8);
      txLink.href = `https://explorer.solana.com/tx/${txSignature}?cluster=custom&customUrl=${CONFIG.rpcEndpoint}`;
      modal.style.display = "flex";
    }
  }

  // Загрузка NFT пользователя
  async loadUserNFTs() {
    if (!walletManager.isConnected || !this.program) {
      return;
    }

    try {
      this.userNFTs = [
        {
          mint: "Demo1...",
          artist: "Демо Артист",
          genre: "Электронная",
          name: "Тестовый трек",
          duration: 180,
          royalty: 5,
        },
      ];

      this.renderNFTs();
      await this.updateStats();
    } catch (error) {
      console.error("Ошибка загрузки NFT:", error);
    }
  }

  // Отображение NFT в UI
  renderNFTs() {
    const grid = document.getElementById("recent-nfts-grid");
    if (!grid) return;

    if (this.userNFTs.length === 0) {
      grid.innerHTML = `
                <div class="nft-placeholder">
                    <i class="fas fa-music"></i>
                    <p>У вас пока нет музыкальных NFT</p>
                    <a href="create.html" class="btn btn-primary">Создать первый NFT</a>
                </div>
            `;
      return;
    }

    grid.innerHTML = this.userNFTs
      .map(
        (nft) => `
            <div class="nft-card" onclick="showNFTDetails(${JSON.stringify(
              nft
            ).replace(/"/g, "&quot;")})">
                <div class="nft-image">
                    <i class="fas fa-music"></i>
                </div>
                <div class="nft-info">
                    <h4>${nft.name}</h4>
                    <p>${nft.artist}</p>
                    <div class="nft-details">
                        <span>${nft.genre}</span>
                        <span>${utils.formatDuration(nft.duration)}</span>
                    </div>
                    <div class="nft-royalty">
                        <i class="fas fa-percentage"></i>
                        <span>${nft.royalty}% роялти</span>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }

  // Обновление статистики
  async updateStats() {
    const totalNFTsEl = document.getElementById("total-nfts");
    const totalArtistsEl = document.getElementById("total-artists");
    const totalRoyaltiesEl = document.getElementById("total-royalties");

    if (totalNFTsEl) totalNFTsEl.textContent = this.userNFTs.length;
    if (totalArtistsEl) {
      const uniqueArtists = new Set(this.userNFTs.map((nft) => nft.artist))
        .size;
      totalArtistsEl.textContent = uniqueArtists;
    }
    if (totalRoyaltiesEl) {
      totalRoyaltiesEl.textContent = "0.00";
    }
  }
}

// Глобальная функция для создания NFT
async function createMusicNFT() {
  if (window.nftManager) {
    await window.nftManager.createMusicNFT();
  } else {
    utils.showNotification("NFT Manager не инициализирован", "error");
  }
}

// Инициализация менеджера NFT
let nftManager;
document.addEventListener("DOMContentLoaded", () => {
  nftManager = new NFTManager();
  window.nftManager = nftManager;
});
