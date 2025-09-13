document.addEventListener("DOMContentLoaded", () => {
  console.log("🎵 Music NFT Platform загружена");

  // Инициализация приложения
  initializeApp();
});

function initializeApp() {
  // Проверяем поддержку Web3
  if (typeof solanaWeb3 === "undefined") {
    console.error("Solana Web3.js не загружен");
    utils.showNotification("Ошибка загрузки библиотек", "error");
    return;
  }
  // Проверяем наличие Phantom кошелька
  if (!window.solana) {
    showPhantomInstallPrompt();
  }

  // Настройка обработчиков событий
  setupGlobalEventListeners();
  const currentPage = getCurrentPage();
  initializePage(currentPage);
}

function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes("create.html")) return "create";
  if (path.includes("gallery.html")) return "gallery";
  return "home";
}

function initializePage(page) {
  switch (page) {
    case "home":
      initializeHomePage();
      break;
    case "create":
      initializeCreatePage();
      break;
    case "gallery":
      initializeGalleryPage();
      break;
  }
}

function initializeHomePage() {
  console.log("Инициализация главной страницы");

  // Автоматически загружаем статистику
  setTimeout(() => {
    if (window.nftManager) {
      window.nftManager.updateStats();
    }
  }, 1000);
}

function initializeCreatePage() {
  console.log("Инициализация страницы создания");

  // Проверяем подключение кошелька
  setTimeout(() => {
    if (!walletManager?.isConnected) {
      utils.showNotification("Подключите кошелек для создания NFT", "info");
    }
  }, 2000);
}

function initializeGalleryPage() {
  console.log("Инициализация галереи");

  // Загружаем NFT если кошелек подключен
  setTimeout(() => {
    if (window.nftManager && walletManager?.isConnected) {
      window.nftManager.loadUserNFTs();
    }
  }, 1000);
}

function setupGlobalEventListeners() {
  // Обработчик изменения размера окна
  window.addEventListener("resize", handleResize);

  // Глобальный обработчик ошибок
  window.addEventListener("error", (event) => {
    console.error("Глобальная ошибка:", event.error);
    utils.showNotification("Произошла ошибка приложения", "error");
  });

  // Обработчик для promise ошибок
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Необработанная ошибка промиса:", event.reason);
    utils.showNotification("Ошибка выполнения операции", "error");
  });
}

function handleResize() {
  // Обработка изменения размера экрана
  const isMobile = window.innerWidth < 768;
  document.body.classList.toggle("mobile", isMobile);
}

function showPhantomInstallPrompt() {
  const installPrompt = document.createElement("div");
  installPrompt.className = "install-prompt";
  installPrompt.innerHTML = `
        <div class="prompt-content">
            <h3>🦄 Установите Phantom кошелек</h3>
            <p>Для работы с Music NFT Platform вам нужен Phantom кошелек</p>
            <a href="https://phantom.app/" target="_blank" class="btn btn-primary">
                Установить Phantom
            </a>
            <button onclick="this.parentElement.parentElement.remove()" class="btn btn-secondary">
                Позже
            </button>
        </div>
    `;

  document.body.appendChild(installPrompt);

  // Автоматически убираем через 10 секунд
  setTimeout(() => {
    if (installPrompt.parentElement) {
      installPrompt.remove();
    }
  }, 10000);
}

// Глобальные утилиты для работы с интерфейсом
window.musicNFT = {
  // Переключение между страницами
  navigateTo: (page) => {
    window.location.href = page;
  },

  // Копирование в буфер обмена
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      utils.showNotification("Скопировано в буфер обмена", "success");
    } catch (err) {
      console.error("Ошибка копирования:", err);
      utils.showNotification("Ошибка копирования", "error");
    }
  },

  // Открытие ссылки на Solana Explorer
  openInExplorer: (signature) => {
    const url = `https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=${CONFIG.rpcEndpoint}`;
    window.open(url, "_blank");
  },
};

// Глобальные функции для галереи
function showNFTDetails(nft) {
  console.log("Показ деталей NFT:", nft);
}
