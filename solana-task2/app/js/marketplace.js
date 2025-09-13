// Управление маркетплейсом
class MarketplaceManager {
  constructor() {
    this.listings = [];
    this.myListings = [];
    this.selectedNFTForSale = null;
    this.init();
  }

  init() {
    this.loadMarketplaceData();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document
      .getElementById("rarity-filter")
      ?.addEventListener("change", () => this.applyFilters());
    document
      .getElementById("sort-filter")
      ?.addEventListener("change", () => this.applyFilters());
    document
      .getElementById("min-price")
      ?.addEventListener("input", () => this.debounceFilter());
    document
      .getElementById("max-price")
      ?.addEventListener("input", () => this.debounceFilter());
  }

  debounceFilter() {
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => this.applyFilters(), 500);
  }

  // Загрузка данных маркетплейса
  loadMarketplaceData() {
    // Генерируем демо-данные для маркетплейса
    this.generateDemoListings();
    this.renderListings();
    this.updateMarketplaceStats();
  }

  // Генерация демо-лотов
  generateDemoListings() {
    const artists = [
      "CyberBeats",
      "NeonWave",
      "DigitalSoul",
      "ElectroMind",
      "SynthLord",
    ];
    const genres = ["Synthwave", "Cyberpunk", "Ambient", "Techno", "House"];
    const rarities = ["Common", "Rare", "Epic", "Legendary", "Mythic"];

    this.listings = [];

    for (let i = 0; i < 20; i++) {
      const rarity = rarities[Math.floor(Math.random() * rarities.length)];
      const config = rarityManager.getRarityConfig(rarity);
      const basePrice = 0.01 * config.multiplier;
      const price = basePrice + Math.random() * basePrice * 2;

      this.listings.push({
        id: i + 1,
        name: `Track ${i + 1}`,
        artist: artists[Math.floor(Math.random() * artists.length)],
        genre: genres[Math.floor(Math.random() * genres.length)],
        rarity: rarity,
        price: price,
        seller: this.generateAddress(),
        listedAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Last 7 days
        serialNumber: Math.floor(Math.random() * 10000) + 1,
        duration: Math.floor(Math.random() * 300) + 60,
        attributes: rarityManager.generateAttributes(rarity),
      });
    }
  }

  generateAddress() {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789";
    let result = "";
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Фильтрация лотов
  applyFilters() {
    const rarityFilter = document.getElementById("rarity-filter")?.value;
    const sortFilter = document.getElementById("sort-filter")?.value;
    const minPrice =
      parseFloat(document.getElementById("min-price")?.value) || 0;
    const maxPrice =
      parseFloat(document.getElementById("max-price")?.value) || Infinity;

    let filteredListings = [...this.listings];

    // Фильтр по редкости
    if (rarityFilter) {
      filteredListings = filteredListings.filter(
        (nft) => nft.rarity === rarityFilter
      );
    }

    // Фильтр по цене
    filteredListings = filteredListings.filter(
      (nft) => nft.price >= minPrice && nft.price <= maxPrice
    );

    // Сортировка
    switch (sortFilter) {
      case "price-low":
        filteredListings.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filteredListings.sort((a, b) => b.price - a.price);
        break;
      case "rarity":
        const rarityOrder = ["Mythic", "Legendary", "Epic", "Rare", "Common"];
        filteredListings.sort(
          (a, b) =>
            rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
        );
        break;
      case "newest":
        filteredListings.sort((a, b) => b.listedAt - a.listedAt);
        break;
    }

    this.renderListings(filteredListings);
  }

  // Отображение лотов
  renderListings(listings = this.listings) {
    const grid = document.getElementById("marketplace-grid");
    if (!grid) return;

    if (listings.length === 0) {
      grid.innerHTML = `
                <div class="no-listings">
                    <i class="fas fa-search"></i>
                    <h3>Нет лотов по заданным фильтрам</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                </div>
            `;
      return;
    }

    grid.innerHTML = listings
      .map((nft) => {
        const config = rarityManager.getRarityConfig(nft.rarity);
        return `
                <div class="nft-card marketplace-card rarity-${nft.rarity.toLowerCase()}" 
                     onclick="showBuyModal(${nft.id})">
                    <div class="nft-image">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="nft-info">
                        <h4>${nft.name}</h4>
                        <p class="artist">${nft.artist}</p>
                        <div class="nft-rarity-info">
                            <span class="rarity-badge" style="background: ${
                              config.color
                            }">
                                ${config.name}
                            </span>
                            <span class="serial">#${nft.serialNumber}</span>
                        </div>
                        <div class="nft-meta">
                            <span class="genre">${nft.genre}</span>
                            <span class="duration">${utils.formatDuration(
                              nft.duration
                            )}</span>
                        </div>
                        <div class="price-info">
                            <div class="current-price">
                                💎 ${nft.price.toFixed(3)} SOL
                            </div>
                            <div class="seller-info">
                                Продавец: ${utils.shortenAddress(nft.seller)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");

    // Применяем стилизацию редкости
    grid.querySelectorAll(".nft-card").forEach((card, index) => {
      rarityManager.styleNFTCard(card, listings[index].rarity);
    });
  }

  // Обновление статистики маркетплейса
  updateMarketplaceStats() {
    const totalListings = this.listings.length;
    const floorPrice = Math.min(...this.listings.map((nft) => nft.price));
    const volume24h = this.calculateVolume24h();

    document.getElementById("total-listings").textContent = totalListings;
    document.getElementById("floor-price").textContent = floorPrice.toFixed(3);
    document.getElementById("volume-24h").textContent = volume24h.toFixed(3);
  }

  calculateVolume24h() {
    return Math.random() * 50 + 10;
  }

  // Показать модальное окно покупки
  showBuyModal(nftId) {
    const nft = this.listings.find((item) => item.id === nftId);
    if (!nft) return;

    const modal = document.getElementById("buy-modal");
    const preview = document.getElementById("buy-nft-preview");
    const price = document.getElementById("buy-price");
    const seller = document.getElementById("buy-seller");

    const config = rarityManager.getRarityConfig(nft.rarity);

    preview.innerHTML = `
            <div class="nft-card rarity-${nft.rarity.toLowerCase()}">
                <div class="nft-image">
                    <i class="fas fa-music"></i>
                </div>
                <div class="nft-info">
                    <h4>${nft.name}</h4>
                    <p>${nft.artist}</p>
                    <div class="rarity-badge" style="background: ${
                      config.color
                    }">
                        ${config.name}
                    </div>
                </div>
            </div>
        `;

    price.textContent = `${nft.price.toFixed(3)} SOL`;
    seller.textContent = utils.shortenAddress(nft.seller);

    this.selectedNFTForPurchase = nft;
    modal.style.display = "flex";

    // Применяем стилизацию
    setTimeout(() => {
      const card = preview.querySelector(".nft-card");
      rarityManager.styleNFTCard(card, nft.rarity);
    }, 100);
  }

  // Показать модальное окно продажи
  showSellModal() {
    if (!walletManager?.isConnected) {
      utils.showNotification("Подключите кошелек для продажи NFT", "error");
      return;
    }

    const modal = document.getElementById("sell-modal");
    const myNFTsGrid = document.getElementById("my-nfts-grid");

    // Загружаем NFT пользователя
    const userCollection = packManager.getUserCollection();

    if (userCollection.length === 0) {
      myNFTsGrid.innerHTML = `
                <div class="no-nfts">
                    <p>У вас нет NFT для продажи</p>
                    <a href="packs.html" class="btn btn-primary">Купить паки</a>
                </div>
            `;
    } else {
      myNFTsGrid.innerHTML = userCollection
        .map((nft, index) => {
          const config = rarityManager.getRarityConfig(nft.rarity);
          return `
                    <div class="mini-nft-card ${
                      this.selectedNFTForSale?.id === index ? "selected" : ""
                    }" 
                         onclick="selectNFTForSale(${index})">
                        <div class="mini-nft-image">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="mini-nft-info">
                            <h5>${nft.name}</h5>
                            <span class="mini-rarity" style="color: ${
                              config.color
                            }">
                                ${config.name}
                            </span>
                        </div>
                    </div>
                `;
        })
        .join("");
    }

    modal.style.display = "flex";
  }

  // Выбор NFT для продажи
  selectNFTForSale(index) {
    // Убираем выделение с предыдущего
    document.querySelectorAll(".mini-nft-card").forEach((card) => {
      card.classList.remove("selected");
    });

    // Выделяем новый
    const card = document.querySelector(
      `.mini-nft-card:nth-child(${index + 1})`
    );
    card?.classList.add("selected");

    const userCollection = packManager.getUserCollection();
    this.selectedNFTForSale = { ...userCollection[index], id: index };
  }

  // Подтверждение покупки
  async confirmPurchase() {
    if (!this.selectedNFTForPurchase) return;
    if (!walletManager?.isConnected) {
      utils.showNotification("Подключите кошелек", "error");
      return;
    }

    try {
      // Здесь бы была реальная транзакция покупки
      utils.showNotification(
        `NFT "${this.selectedNFTForPurchase.name}" успешно куплен!`,
        "success"
      );

      // Добавляем в коллекцию пользователя
      const userCollection = packManager.getUserCollection();
      userCollection.push(this.selectedNFTForPurchase);
      localStorage.setItem("userNFTCollection", JSON.stringify(userCollection));

      // Удаляем из маркетплейса
      this.listings = this.listings.filter(
        (nft) => nft.id !== this.selectedNFTForPurchase.id
      );
      this.renderListings();
      this.updateMarketplaceStats();

      this.closeBuyModal();
    } catch (error) {
      console.error("Ошибка покупки:", error);
      utils.showNotification("Ошибка при покупке NFT", "error");
    }
  }

  // Подтверждение выставления на продажу
  async confirmListing() {
    if (!this.selectedNFTForSale) {
      utils.showNotification("Выберите NFT для продажи", "error");
      return;
    }

    const price = parseFloat(document.getElementById("sell-price").value);
    if (!price || price <= 0) {
      utils.showNotification("Укажите корректную цену", "error");
      return;
    }

    try {
      // Создаем новый лот
      const newListing = {
        ...this.selectedNFTForSale,
        id: this.listings.length + 1,
        price: price,
        seller: walletManager.getPublicKey().toString(),
        listedAt: Date.now(),
      };

      this.listings.push(newListing);

      // Удаляем из коллекции пользователя
      const userCollection = packManager.getUserCollection();
      userCollection.splice(this.selectedNFTForSale.id, 1);
      localStorage.setItem("userNFTCollection", JSON.stringify(userCollection));

      utils.showNotification(
        `NFT выставлен на продажу за ${price} SOL!`,
        "success"
      );

      this.renderListings();
      this.updateMarketplaceStats();
      this.closeSellModal();
    } catch (error) {
      console.error("Ошибка выставления на продажу:", error);
      utils.showNotification("Ошибка при выставлении на продажу", "error");
    }
  }

  // Показать мои лоты
  showMyListings() {
    if (!walletManager?.isConnected) {
      utils.showNotification("Подключите кошелек", "error");
      return;
    }

    const userAddress = walletManager.getPublicKey().toString();
    const myListings = this.listings.filter(
      (nft) => nft.seller === userAddress
    );

    if (myListings.length === 0) {
      utils.showNotification("У вас нет активных лотов", "info");
      return;
    }

    this.renderListings(myListings);
    utils.showNotification(`Показано ${myListings.length} ваших лотов`, "info");
  }

  closeBuyModal() {
    document.getElementById("buy-modal").style.display = "none";
    this.selectedNFTForPurchase = null;
  }

  closeSellModal() {
    document.getElementById("sell-modal").style.display = "none";
    this.selectedNFTForSale = null;
    document.getElementById("sell-price").value = "";
  }
}

// Глобальные функции
window.showBuyModal = (nftId) => marketplaceManager.showBuyModal(nftId);
window.showSellModal = () => marketplaceManager.showSellModal();
window.selectNFTForSale = (index) => marketplaceManager.selectNFTForSale(index);
window.confirmPurchase = () => marketplaceManager.confirmPurchase();
window.confirmListing = () => marketplaceManager.confirmListing();
window.closeBuyModal = () => marketplaceManager.closeBuyModal();
window.closeSellModal = () => marketplaceManager.closeSellModal();
window.showMyListings = () => marketplaceManager.showMyListings();

// Инициализация
let marketplaceManager;
document.addEventListener("DOMContentLoaded", () => {
  marketplaceManager = new MarketplaceManager();
  window.marketplaceManager = marketplaceManager;
});
