// Система редкости и управление NFT
class RarityManager {
  constructor() {
    this.rarityConfig = {
      Common: {
        chance: 60,
        color: "#C0C0C0",
        bgColor: "linear-gradient(45deg, #E8E8E8, #C0C0C0)",
        name: "Обычный",
        multiplier: 1,
        glow: false,
        animation: false,
      },
      Rare: {
        chance: 25,
        color: "#4A90E2",
        bgColor: "linear-gradient(45deg, #6BB6FF, #4A90E2)",
        name: "Редкий",
        multiplier: 2.5,
        glow: true,
        animation: false,
      },
      Epic: {
        chance: 10,
        color: "#9013FE",
        bgColor: "linear-gradient(45deg, #B388FF, #9013FE)",
        name: "Эпический",
        multiplier: 5,
        glow: true,
        animation: false,
      },
      Legendary: {
        chance: 4,
        color: "#FFD700",
        bgColor: "linear-gradient(45deg, #FFE082, #FFD700)",
        name: "Легендарный",
        multiplier: 15,
        glow: true,
        animation: true,
        particles: true,
      },
      Mythic: {
        chance: 1,
        color: "#FF1744",
        bgColor: "linear-gradient(45deg, #FF5722, #FF1744)",
        name: "Мифический",
        multiplier: 50,
        glow: true,
        animation: "pulse",
        particles: true,
        special: true,
      },
    };

    this.packTypes = {
      starter: {
        name: "Starter Pack",
        price: 0.1,
        nftCount: 5,
        icon: "🎵",
        rarityWeights: {
          Common: 70,
          Rare: 25,
          Epic: 5,
        },
      },
      premium: {
        name: "Premium Pack",
        price: 0.5,
        nftCount: 10,
        icon: "🎸",
        rarityWeights: {
          Common: 50,
          Rare: 30,
          Epic: 15,
          Legendary: 5,
        },
      },
      mythic: {
        name: "Mythic Pack",
        price: 2.0,
        nftCount: 3,
        icon: "🌟",
        rarityWeights: {
          Epic: 40,
          Legendary: 50,
          Mythic: 10,
        },
      },
    };
  }

  // Генерация случайной редкости по весам
  generateWeightedRarity(weights) {
    const totalWeight = Object.values(weights).reduce(
      (sum, weight) => sum + weight,
      0
    );
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (const [rarity, weight] of Object.entries(weights)) {
      currentWeight += weight;
      if (random <= currentWeight) {
        return rarity;
      }
    }

    return "Common";
  }

  // Получение конфигурации редкости
  getRarityConfig(rarity) {
    return this.rarityConfig[rarity] || this.rarityConfig.Common;
  }

  // Стилизация карточки NFT
  styleNFTCard(cardElement, rarity) {
    const config = this.getRarityConfig(rarity);

    // Основные стили
    cardElement.style.background = config.bgColor;
    cardElement.style.borderColor = config.color;
    cardElement.style.borderWidth = "3px";
    cardElement.style.borderStyle = "solid";

    // Добавляем класс редкости
    cardElement.classList.add(`rarity-${rarity.toLowerCase()}`);

    // Свечение для редких
    if (config.glow) {
      cardElement.style.boxShadow = `0 0 20px ${config.color}40, 0 0 40px ${config.color}20`;
    }

    // Анимация для мифических
    if (config.animation === "pulse") {
      cardElement.classList.add("mythic-pulse");
    }

    // Частицы для легендарных и мифических
    if (config.particles) {
      this.addParticleEffect(cardElement, config.color);
    }

    // Добавляем badge редкости
    this.addRarityBadge(cardElement, rarity, config);

    // Звуковой эффект при наведении (для особых)
    if (config.special) {
      cardElement.addEventListener("mouseenter", () => {
        this.playRaritySound(rarity);
      });
    }
  }

  // Добавление badge редкости
  addRarityBadge(cardElement, rarity, config) {
    // Удаляем старый badge если есть
    const existingBadge = cardElement.querySelector(".rarity-badge");
    if (existingBadge) existingBadge.remove();

    const badge = document.createElement("div");
    badge.className = "rarity-badge";
    badge.textContent = config.name;
    badge.style.background = config.color;
    badge.style.color = "white";
    badge.style.padding = "4px 8px";
    badge.style.borderRadius = "12px";
    badge.style.fontSize = "12px";
    badge.style.fontWeight = "bold";
    badge.style.position = "absolute";
    badge.style.top = "10px";
    badge.style.right = "10px";
    badge.style.zIndex = "10";
    badge.style.animation = "badgeGlow 2s ease-in-out infinite alternate";

    cardElement.style.position = "relative";
    cardElement.appendChild(badge);
  }

  // Эффект частиц
  addParticleEffect(element, color) {
    // Удаляем старые частицы
    const existingParticles = element.querySelector(".particles");
    if (existingParticles) existingParticles.remove();

    const particles = document.createElement("div");
    particles.className = "particles";
    particles.innerHTML = `
            <div class="particle" style="background: ${color}"></div>
            <div class="particle" style="background: ${color}"></div>
            <div class="particle" style="background: ${color}"></div>
            <div class="particle" style="background: ${color}"></div>
        `;
    element.appendChild(particles);
  }

  // Расчет стоимости NFT
  calculatePrice(basePrice, rarity) {
    const config = this.getRarityConfig(rarity);
    return basePrice * config.multiplier;
  }

  // Генерация атрибутов по редкости
  generateAttributes(rarity) {
    const attributes = {
      Common: ["Standard Edition"],
      Rare: ["Limited Edition", "Bonus Track Access"],
      Epic: ["Deluxe Edition", "Artist Commentary", "Behind Scenes"],
      Legendary: [
        "Collector's Edition",
        "Exclusive Remix",
        "Virtual Meet & Greet",
        "Signed Digital Copy",
      ],
      Mythic: [
        "Ultra Rare",
        "Unreleased Track",
        "Private Concert Ticket",
        "Lifetime Fan Pass",
        "Revenue Share 0.1%",
      ],
    };

    return attributes[rarity] || attributes.Common;
  }

  // Генерация NFT для пака
  generatePackNFTs(packType) {
    const pack = this.packTypes[packType];
    if (!pack) return [];

    const nfts = [];
    const artists = [
      "ElectroBeats",
      "SynthWave",
      "BassDrop",
      "MelodyMaker",
      "RhythmKing",
    ];
    const genres = ["Electronic", "Synthwave", "House", "Techno", "Ambient"];

    for (let i = 0; i < pack.nftCount; i++) {
      const rarity = this.generateWeightedRarity(pack.rarityWeights);
      const attributes = this.generateAttributes(rarity);
      const artist = artists[Math.floor(Math.random() * artists.length)];
      const genre = genres[Math.floor(Math.random() * genres.length)];

      nfts.push({
        name: `${pack.name} Track #${i + 1}`,
        artist: artist,
        genre: genre,
        rarity: rarity,
        attributes: attributes,
        serialNumber: Math.floor(Math.random() * 10000) + 1,
        duration: Math.floor(Math.random() * 300) + 60, // 1-5 минут
        value: this.calculatePrice(0.01, rarity), // Базовая цена 0.01 SOL
      });
    }

    return nfts;
  }

  // Звуковые эффекты
  playRaritySound(rarity) {
    // Можно добавить звуковые эффекты для каждой редкости
    if (typeof Audio !== "undefined") {
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const frequencies = {
          Common: 440,
          Rare: 523,
          Epic: 659,
          Legendary: 784,
          Mythic: 880,
        };

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(
          frequencies[rarity] || 440,
          audioContext.currentTime
        );
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (e) {
        // Игнорируем ошибки звука
      }
    }
  }

  // Форматирование отображения NFT
  formatNFTForDisplay(nft) {
    const config = this.getRarityConfig(nft.rarity);

    return {
      ...nft,
      rarityConfig: config,
      formattedValue: `${nft.value.toFixed(3)} SOL`,
      formattedDuration: this.formatDuration(nft.duration),
      rarityClass: `rarity-${nft.rarity.toLowerCase()}`,
    };
  }

  // Форматирование времени
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // Получение статистики редкости
  getRarityStats(nfts) {
    const stats = {};

    Object.keys(this.rarityConfig).forEach((rarity) => {
      stats[rarity] = nfts.filter((nft) => nft.rarity === rarity).length;
    });

    return stats;
  }
}

// Глобальная инициализация
window.rarityManager = new RarityManager();
