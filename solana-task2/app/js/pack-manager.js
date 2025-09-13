// Управление паками и их открытием
class PackManager {
  constructor() {
    this.isOpening = false;
    this.currentPack = null;
    this.openedNFTs = [];
  }

  // Покупка пака
  async buyPack(packType) {
    if (!window.walletManager?.isConnected) {
      utils.showNotification("Подключите кошелек для покупки пака", "error");
      return false;
    }

    if (this.isOpening) {
      utils.showNotification(
        "Дождитесь окончания открытия текущего пака",
        "warning"
      );
      return false;
    }

    const pack = rarityManager.packTypes[packType];
    if (!pack) {
      utils.showNotification("Неизвестный тип пака", "error");
      return false;
    }

    try {
      utils.showNotification(
        `Пак "${pack.name}" куплен за ${pack.price} SOL`,
        "success"
      );
      this.showPackOpeningModal(pack);
      return true;
    } catch (error) {
      console.error("Ошибка покупки пака:", error);
      utils.showNotification("Ошибка покупки пака", "error");
      return false;
    }
  }

  // Показать модальное окно открытия
  showPackOpeningModal(pack) {
    this.currentPack = pack;

    const modal = document.getElementById("pack-opening-modal");
    const packTitle = document.getElementById("pack-title");
    const packToOpen = document.getElementById("pack-to-open");
    const packIcon = packToOpen.querySelector(".pack-icon");

    packTitle.textContent = pack.name;
    packIcon.textContent = pack.icon;
    modal.style.display = "flex";

    this.resetPackModal();

    // Обработчик клика на пак
    packToOpen.onclick = () => this.openPack(pack);
  }

  // Сброс модального окна
  resetPackModal() {
    const packToOpen = document.getElementById("pack-to-open");
    const revealedCards = document.getElementById("revealed-cards");
    const controls = document.querySelector(".pack-opening-controls");

    packToOpen.style.display = "flex";
    packToOpen.classList.remove("opening");
    revealedCards.style.display = "none";
    revealedCards.innerHTML = "";
    controls.style.display = "none";
  }

  // Открытие пака
  async openPack(pack) {
    if (this.isOpening) return;

    this.isOpening = true;
    const packElement = document.getElementById("pack-to-open");

    // Анимация открытия пака
    packElement.classList.add("opening");

    // Генерируем NFT
    this.openedNFTs = rarityManager.generatePackNFTs(
      pack.name.split(" ").toLowerCase()
    );

    // Показываем статистику открытия
    this.showOpeningStats();

    setTimeout(() => {
      packElement.style.display = "none";
      this.displayRevealedNFTs();
    }, 2500);
  }

  // Показать статистику открытия
  showOpeningStats() {
    const stats = rarityManager.getRarityStats(this.openedNFTs);
    const rare = stats.Rare + stats.Epic + stats.Legendary + stats.Mythic;

    if (stats.Mythic > 0) {
      utils.showNotification(
        "🌟 МИФИЧЕСКИЙ NFT! Невероятная удача!",
        "success"
      );
    } else if (stats.Legendary > 0) {
      utils.showNotification(
        "✨ Легендарный NFT! Отличная находка!",
        "success"
      );
    } else if (rare > 0) {
      utils.showNotification(`Получено ${rare} редких NFT!`, "success");
    }
  }

  // Отображение полученных NFT
  displayRevealedNFTs() {
    const container = document.getElementById("revealed-cards");
    const controls = document.querySelector(".pack-opening-controls");

    // Сортируем NFT по редкости
    const rarityOrder = ["Mythic", "Legendary", "Epic", "Rare", "Common"];
    const sortedNFTs = this.openedNFTs.sort((a, b) => {
      return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    });

    container.innerHTML = sortedNFTs
      .map((nft, index) => {
        const formatted = rarityManager.formatNFTForDisplay(nft);
        return `
                <div class="nft-card reveal-card ${
                  formatted.rarityClass
                }" style="animation-delay: ${index * 200}ms">
                    <div class="nft-image">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="nft-info">
                        <h4>${nft.name}</h4>
                        <p class="artist">${nft.artist}</p>
                        <div class="nft-rarity-info">
                            <span class="rarity-badge" style="background: ${
                              formatted.rarityConfig.color
                            }">
                                ${formatted.rarityConfig.name}
                            </span>
                            <span class="serial">#${nft.serialNumber}</span>
                        </div>
                        <div class="nft-meta">
                            <span class="genre">${nft.genre}</span>
                            <span class="duration">${
                              formatted.formattedDuration
                            }</span>
                        </div>
                        <div class="nft-value">
                            💎 ${formatted.formattedValue}
                        </div>
                        <div class="attributes">
                            ${nft.attributes
                              .map(
                                (attr) =>
                                  `<span class="attribute">${attr}</span>`
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");

    container.style.display = "grid";

    // Применяем стилизацию редкости с задержкой
    setTimeout(() => {
      container.querySelectorAll(".nft-card").forEach((card, index) => {
        const nft = sortedNFTs[index];
        rarityManager.styleNFTCard(card, nft.rarity);
      });

      controls.style.display = "flex";
      this.isOpening = false;
    }, 500);
  }

  // Закрыть модальное окно
  closePackModal() {
    const modal = document.getElementById("pack-opening-modal");
    modal.style.display = "none";

    // Добавляем NFT в коллекцию пользователя
    if (this.openedNFTs.length > 0) {
      this.addToUserCollection();
      utils.showNotification(
        `${this.openedNFTs.length} NFT добавлены в вашу коллекцию!`,
        "success"
      );
    }

    this.currentPack = null;
    this.openedNFTs = [];
    this.isOpening = false;
  }

  // Добавить в коллекцию пользователя
  addToUserCollection() {
    try {
      const existingCollection = JSON.parse(
        localStorage.getItem("userNFTCollection") || "[]"
      );
      const updatedCollection = [...existingCollection, ...this.openedNFTs];
      localStorage.setItem(
        "userNFTCollection",
        JSON.stringify(updatedCollection)
      );

      // Обновляем отображение коллекции если мы на странице галереи
      if (
        window.nftManager &&
        typeof window.nftManager.refreshCollection === "function"
      ) {
        window.nftManager.refreshCollection();
      }
    } catch (error) {
      console.error("Ошибка сохранения коллекции:", error);
    }
  }

  // Получить коллекцию пользователя
  getUserCollection() {
    try {
      return JSON.parse(localStorage.getItem("userNFTCollection") || "[]");
    } catch (error) {
      console.error("Ошибка загрузки коллекции:", error);
      return [];
    }
  }

  // Статистика коллекции
  getCollectionStats() {
    const collection = this.getUserCollection();
    const stats = rarityManager.getRarityStats(collection);

    const totalValue = collection.reduce(
      (sum, nft) => sum + (nft.value || 0),
      0
    );
    const uniqueArtists = new Set(collection.map((nft) => nft.artist)).size;

    return {
      totalNFTs: collection.length,
      rarityBreakdown: stats,
      totalValue: totalValue,
      uniqueArtists: uniqueArtists,
      collection: collection,
    };
  }
}

// Глобальная инициализация
window.packManager = new PackManager();

window.buyPack = (packType) => packManager.buyPack(packType);
window.closePackModal = () => packManager.closePackModal();
window.openAnotherPack = () => {
  packManager.closePackModal();
};
