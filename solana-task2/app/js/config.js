const CONFIG = {
  // Solana network configuration
  network: 'devnet',
 rpcEndpoint: 'https://api.devnet.solana.com',

  // Program ID
  programId: "8tJhNdGNzxacg9FKTzPzxbXC1uLUET6CreFfujHHppgS",

  metadataProgram: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",

  defaults: {
    symbol: "MUSIC",
    royalty: 5,
    genre: "Электронная",
    duration: 180,
  },

  ui: {
    maxPreviewItems: 6,
    loadingTimeout: 30000,
  },
};

// Utility functions
const utils = {
  // Сокращение публичного ключа для отображения
  shortenAddress: (address, chars = 4) => {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  },

  // Форматирование времени
  formatDuration: (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  // Показать уведомление
  showNotification: (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  },

  // Показать лоадер
  showLoader: (element) => {
    element.classList.add("loading");
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    element.prepend(spinner);
  },

  // Скрыть лоадер
  hideLoader: (element) => {
    element.classList.remove("loading");
    const spinner = element.querySelector(".spinner");
    if (spinner) spinner.remove();
  },
};
