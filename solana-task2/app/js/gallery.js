class GalleryManager {
    constructor() {
        this.collection = [];
        this.filteredCollection = [];
        this.selectedNFT = null;
        this.init();
    }

    init() {
        this.loadCollection();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Фильтры
        document.getElementById('rarity-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('sort-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('genre-filter')?.addEventListener('change', () => this.applyFilters());
    }

    // Загрузка коллекции
    loadCollection() {
        this.showLoading(true);
        
        setTimeout(() => {
            // Получаем коллекцию из localStorage
            this.collection = packManager.getUserCollection();
            
            // Если коллекция пуста, добавляем демо NFT для показа
            if (this.collection.length === 0) {
                this.collection = this.generateDemoCollection();
            }
            
            this.filteredCollection = [...this.collection];
            this.renderCollection();
            this.updateStats();
            this.updateRarityBreakdown();
            this.showLoading(false);
        }, 1000);
    }

    // Генерация демо коллекции
    generateDemoCollection() {
        const artists = ['CyberBeats', 'NeonWave', 'DigitalSoul', 'ElectroMind', 'SynthLord'];
        const genres = ['Electronic', 'Synthwave', 'House', 'Techno', 'Ambient'];
        const rarities = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
        
        const demo = [];
        for (let i = 0; i < 12; i++) {
            const rarity = rarities[Math.floor(Math.random() * rarities.length)];
            demo.push({
                name: `Demo Track ${i + 1}`,
                artist: artists[Math.floor(Math.random() * artists.length)],
                genre: genres[Math.floor(Math.random() * genres.length)],
                rarity: rarity,
                attributes: rarityManager.generateAttributes(rarity),
                serialNumber: 1000 + i,
                duration: Math.floor(Math.random() * 300) + 60,
                value: rarityManager.calculatePrice(0.01, rarity),
                createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            });
        }
        return demo;
    }

    // Применение фильтров
    applyFilters() {
        const rarityFilter = document.getElementById('rarity-filter')?.value;
        const sortFilter = document.getElementById('sort-filter')?.value;
        const genreFilter = document.getElementById('genre-filter')?.value;

        this.filteredCollection = [...this.collection];

        // Фильтр по редкости
        if (rarityFilter) {
            this.filteredCollection = this.filteredCollection.filter(nft => nft.rarity === rarityFilter);
        }

        // Фильтр по жанру
        if (genreFilter) {
            this.filteredCollection = this.filteredCollection.filter(nft => nft.genre === genreFilter);
        }

        // Сортировка
        switch (sortFilter) {
            case 'newest':
                this.filteredCollection.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                break;
            case 'rarity':
                const rarityOrder = ['Mythic', 'Legendary', 'Epic', 'Rare', 'Common'];
                this.filteredCollection.sort((a, b) => 
                    rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
                );
                break;
            case 'value-high':
                this.filteredCollection.sort((a, b) => (b.value || 0) - (a.value || 0));
                break;
            case 'value-low':
                this.filteredCollection.sort((a, b) => (a.value || 0) - (b.value || 0));
                break;
            case 'artist':
                this.filteredCollection.sort((a, b) => a.artist.localeCompare(b.artist));
                break;
        }

        this.renderCollection();
    }

    // Отображение коллекции
    renderCollection() {
        const container = document.getElementById('nfts-container');
        const emptyState = document.getElementById('empty-state');

        if (this.filteredCollection.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        container.innerHTML = this.filteredCollection.map((nft, index) => {
            const config = rarityManager.getRarityConfig(nft.rarity);
            return `
                <div class="nft-card gallery-card rarity-${nft.rarity.toLowerCase()}" 
                     onclick="showNFTDetails(${index})">
                    <div class="nft-image">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="nft-info">
                        <h4>${nft.name}</h4>
                        <p class="artist">${nft.artist}</p>
                        <div class="nft-rarity-info">
                            <span class="rarity-badge" style="background: ${config.color}">
                                ${config.name}
                            </span>
                            <span class="serial">#${nft.serialNumber}</span>
                        </div>
                        <div class="nft-meta">
                            <span class="genre">${nft.genre}</span>
                            <span class="duration">${utils.formatDuration(nft.duration)}</span>
                        </div>
                        <div class="nft-value">
                            💎 ${(nft.value || 0).toFixed(3)} SOL
                        </div>
                    </div>
                </div>
            `;
        }).join('');


        container.querySelectorAll('.nft-card').forEach((card, index) => {
            rarityManager.styleNFTCard(card, this.filteredCollection[index].rarity);
        });
    }

    // Показать детали NFT
    showNFTDetails(index) {
        const nft = this.filteredCollection[index];
        if (!nft) return;

        this.selectedNFT = nft;
        const config = rarityManager.getRarityConfig(nft.rarity);

     
        document.getElementById('nft-modal-title').textContent = 'Детали NFT';
        document.getElementById('nft-detail-name').textContent = nft.name;
        document.getElementById('nft-detail-artist').textContent = nft.artist;
        document.getElementById('nft-detail-genre').textContent = nft.genre;
        document.getElementById('nft-detail-duration').textContent = utils.formatDuration(nft.duration);
        document.getElementById('nft-detail-value').textContent = `${(nft.value || 0).toFixed(3)} SOL`;
        
        const rarityBadge = document.getElementById('nft-detail-rarity-badge');
        rarityBadge.textContent = config.name;
        rarityBadge.style.background = config.color;
        
        document.getElementById('nft-detail-serial').textContent = `#${nft.serialNumber}`;

 
        const attributesContainer = document.getElementById('nft-detail-attributes');
        attributesContainer.innerHTML = nft.attributes.map(attr => 
            `<span class="attribute">${attr}</span>`
        ).join('');

   
        const visualCard = document.getElementById('nft-detail-visual');
        visualCard.classList.add(`rarity-${nft.rarity.toLowerCase()}`);
        setTimeout(() => {
            rarityManager.styleNFTCard(visualCard, nft.rarity);
        }, 100);

        document.getElementById('nft-modal').style.display = 'flex';
    }

    // Обновление статистики
    updateStats() {
        const totalNFTs = this.collection.length;
        const totalValue = this.collection.reduce((sum, nft) => sum + (nft.value || 0), 0);
        const uniqueArtists = new Set(this.collection.map(nft => nft.artist)).size;
        const rareCount = this.collection.filter(nft => 
            ['Rare', 'Epic', 'Legendary', 'Mythic'].includes(nft.rarity)
        ).length;

        document.getElementById('total-nfts').textContent = totalNFTs;
        document.getElementById('total-value').textContent = totalValue.toFixed(3);
        document.getElementById('unique-artists').textContent = uniqueArtists;
        document.getElementById('rare-count').textContent = rareCount;
    }

    // Обновление диаграммы редкости
    updateRarityBreakdown() {
        const stats = rarityManager.getRarityStats(this.collection);
        const total = this.collection.length || 1;

        Object.entries(stats).forEach(([rarity, count]) => {
            const percentage = (count / total) * 100;
            const countElement = document.getElementById(`${rarity.toLowerCase()}-count`);
            const barElement = document.getElementById(`${rarity.toLowerCase()}-bar`);
            
            if (countElement) countElement.textContent = count;
            if (barElement) barElement.style.width = `${percentage}%`;
        });
    }

    // Показать/скрыть загрузку
    showLoading(show) {
        const loadingState = document.getElementById('loading-state');
        const container = document.getElementById('nfts-container');
        
        if (show) {
            loadingState.style.display = 'block';
            container.style.display = 'none';
        } else {
            loadingState.style.display = 'none';
            container.style.display = 'grid';
        }
    }

    // Экспорт коллекции
    exportCollection() {
        const data = JSON.stringify(this.collection, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-nft-collection.json';
        a.click();
        
        URL.revokeObjectURL(url);
        utils.showNotification('Коллекция экспортирована!', 'success');
    }


    refreshCollection() {
        this.loadCollection();
    }
}
