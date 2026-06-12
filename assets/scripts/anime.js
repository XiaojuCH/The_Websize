// 番剧展示功能
(function () {
    let animeData = null;
    let galgameData = null;
    let currentFilter = 'all';

    // 加载番剧数据
    async function loadAnimeData() {
        try {
            // 优先从 Bangumi API 加载
            if (typeof loadAnimeFromBangumi !== 'undefined') {
                animeData = await loadAnimeFromBangumi();
            } else {
                // 降级到本地 JSON
                const response = await fetch('./assets/data/anime.json');
                animeData = await response.json();
            }
            renderAnimeGrid(animeData.animeList);
            initFilters('.anime-section');
        } catch (error) {
            console.error('加载番剧数据失败:', error);
            document.getElementById('anime-grid').innerHTML = '<div class="anime-empty"><i class="fa-solid fa-exclamation-circle"></i><p>加载失败，请刷新重试</p></div>';
        }
    }

    // 加载 Galgame 数据
    async function loadGalgameData() {
        try {
            // 优先从 Bangumi API 加载
            if (typeof loadGalgameFromBangumi !== 'undefined') {
                galgameData = await loadGalgameFromBangumi();
            } else {
                // 降级到本地 JSON
                const response = await fetch('./assets/data/galgame.json');
                galgameData = await response.json();
            }
            renderGalgameGrid(galgameData.galgameList);
            initFilters('.galgame-section');
        } catch (error) {
            console.error('加载 Galgame 数据失败:', error);
            document.getElementById('galgame-grid').innerHTML = '<div class="anime-empty"><i class="fa-solid fa-exclamation-circle"></i><p>加载失败，请刷新重试</p></div>';
        }
    }

    // 渲染番剧网格
    function renderAnimeGrid(animeList) {
        const grid = document.getElementById('anime-grid');
        if (!grid) return; // 如果页面上没有这个元素，直接返回

        const path = window.location.pathname;
        const isHomePage = path.endsWith('index.html') || path === '/' || path.endsWith('/') || (!path.includes('myanime') && !path.includes('mygal'));

        let displayList;
        if (isHomePage) {
            const recommendIds = config?.content?.recommendations?.anime || [];
            if (recommendIds.length > 0) {
                displayList = recommendIds.map(id => animeList.find(a => a.id === id)).filter(Boolean);
            } else {
                displayList = animeList.slice(0, 4);
            }
        } else {
            displayList = animeList;
        }

        if (!displayList || displayList.length === 0) {
            grid.innerHTML = '<div class="anime-empty"><i class="fa-solid fa-inbox"></i><p>暂无番剧</p></div>';
            return;
        }

        grid.innerHTML = displayList.map(anime => `
            <div class="anime-card" data-id="${anime.id}" data-status="${anime.status}">
                <div class="cover-wrapper">
                    <img class="cover" src="${anime.cover}" alt="${anime.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/180x255?text=No+Image'">
                    ${!isHomePage ? `<span class="status-badge ${anime.status}">${animeData.statusLabels[anime.status]}</span>` : ''}
                    <div class="rating">
                        <i class="fa-solid fa-star"></i>
                        <span>${anime.rating}</span>
                    </div>
                </div>
                <div class="info">
                    <div class="title">${anime.title}</div>
                    <div class="meta">
                        <span class="type">${animeData.typeLabels[anime.type]}</span>
                        <span class="year">${anime.year}</span>
                    </div>
                    ${anime.status === 'watching' && anime.watchedEps ? `<div class="progress">看到 ${anime.watchedEps}/${anime.episodes} 话</div>` : ''}
                </div>
            </div>
        `).join('');

        // 绑定点击事件
        grid.querySelectorAll('.anime-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const animeId = parseInt(card.dataset.id);
                const anime = animeList.find(a => a.id === animeId);

                // 按住 Ctrl 键点击时，显示并复制 ID（仅在本地开发环境）
                const isLocalhost = window.location.hostname === 'localhost' ||
                                   window.location.hostname === '127.0.0.1' ||
                                   window.location.hostname === '';
                if ((e.ctrlKey || e.metaKey) && isLocalhost) {
                    e.preventDefault();
                    console.log(`番剧 ID: ${animeId} - ${anime.title}`);
                    navigator.clipboard.writeText(animeId.toString()).then(() => {
                        alert(`已复制 ID: ${animeId}\n标题: ${anime.title}\n\n可以将此 ID 添加到 config.json 的 recommendations.anime 数组中`);
                    });
                    return;
                }

                if (anime) showAnimeModal(anime);
            });
        });
    }

    // 渲染 Galgame 网格
    function renderGalgameGrid(galgameList) {
        const grid = document.getElementById('galgame-grid');
        if (!grid) return; // 如果页面上没有这个元素，直接返回

        const path = window.location.pathname;
        const isHomePage = path.endsWith('index.html') || path === '/' || path.endsWith('/') || (!path.includes('myanime') && !path.includes('mygal'));

        let displayList;
        if (isHomePage) {
            const recommendIds = config?.content?.recommendations?.galgame || [];
            if (recommendIds.length > 0) {
                displayList = recommendIds.map(id => galgameList.find(g => g.id === id)).filter(Boolean);
            } else {
                displayList = galgameList.slice(0, 4);
            }
        } else {
            displayList = galgameList;
        }

        if (!displayList || displayList.length === 0) {
            grid.innerHTML = '<div class="anime-empty"><i class="fa-solid fa-inbox"></i><p>暂无 Galgame</p></div>';
            return;
        }

        grid.innerHTML = displayList.map(game => `
            <div class="anime-card galgame-card" data-id="${game.id}" data-status="${game.status}">
                <div class="cover-wrapper">
                    <img class="cover" src="${game.cover}" alt="${game.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/180x255?text=No+Image'">
                    ${!isHomePage ? `<span class="status-badge ${game.status}">${galgameData.statusLabels[game.status]}</span>` : ''}
                    <div class="rating">
                        <i class="fa-solid fa-star"></i>
                        <span>${game.rating}</span>
                    </div>
                </div>
                <div class="info">
                    <div class="title">${game.title}</div>
                    <div class="meta">
                        <span class="type">${galgameData.platformLabels[game.platform]}</span>
                        <span class="year">${game.releaseYear}</span>
                    </div>
                </div>
            </div>
        `).join('');

        grid.querySelectorAll('.galgame-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameId = parseInt(card.dataset.id);
                const game = galgameList.find(g => g.id === gameId);

                // 按住 Ctrl 键点击时，显示并复制 ID（仅在本地开发环境）
                const isLocalhost = window.location.hostname === 'localhost' ||
                                   window.location.hostname === '127.0.0.1' ||
                                   window.location.hostname === '';
                if ((e.ctrlKey || e.metaKey) && isLocalhost) {
                    e.preventDefault();
                    console.log(`Galgame ID: ${gameId} - ${game.title}`);
                    navigator.clipboard.writeText(gameId.toString()).then(() => {
                        alert(`已复制 ID: ${gameId}\n标题: ${game.title}\n\n可以将此 ID 添加到 config.json 的 recommendations.galgame 数组中`);
                    });
                    return;
                }

                if (game) showGalgameModal(game);
            });
        });
    }

    // 初始化筛选器
    function initFilters(sectionSelector) {
        const section = document.querySelector(sectionSelector);
        if (!section) return; // 如果页面上没有这个section，直接返回

        const filterBtns = section.querySelectorAll('.filter-btn');
        const grid = section.querySelector('.anime-grid');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterItems(btn.dataset.status, grid);
            });
        });
    }

    // 筛选项目
    function filterItems(status, grid) {
        const cards = grid.querySelectorAll('.anime-card');

        cards.forEach(card => {
            card.style.display = (status === 'all' || card.dataset.status === status) ? 'block' : 'none';
        });

        const visibleCards = Array.from(cards).filter(card => card.style.display !== 'none');
        const emptyMsg = grid.querySelector('.anime-empty');

        if (visibleCards.length === 0 && !emptyMsg) {
            const empty = document.createElement('div');
            empty.className = 'anime-empty';
            empty.innerHTML = '<i class="fa-solid fa-inbox"></i><p>该分类暂无内容</p>';
            grid.appendChild(empty);
        } else if (visibleCards.length > 0 && emptyMsg) {
            emptyMsg.remove();
        }
    }

    // 显示番剧详情弹窗
    function showAnimeModal(anime) {
        showModal(anime, animeData, 'tv', '话', 'year');
    }

    // 显示 Galgame 详情弹窗
    function showGalgameModal(game) {
        showModal(game, galgameData, 'gamepad', '', 'releaseYear', 'developer', 'platform');
    }

    // 通用弹窗显示函数
    async function showModal(item, data, icon, episodeUnit, yearKey, devKey, platformKey) {
        const modal = document.createElement('div');
        modal.className = 'anime-modal';
        modal.innerHTML = `
            <div class="anime-modal-content">
                <div class="anime-modal-header">
                    <img src="${item.cover}" alt="${item.title}">
                    <div class="overlay"></div>
                    <button class="anime-modal-close">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="anime-modal-body">
                    <div class="anime-modal-main">
                        <div class="anime-modal-cover">
                            <img src="${item.cover}" alt="${item.title}">
                        </div>
                        <div class="anime-modal-info">
                            <h2>${item.title}</h2>
                            <div class="title-en">${item.titleEn}</div>
                            <div class="rating-large">
                                <i class="fa-solid fa-star"></i>
                                <span>${item.rating}</span>
                            </div>
                            <div class="details">
                                ${item.type ? `<div class="detail-item">
                                    <i class="fa-solid fa-${icon}"></i>
                                    <span>${data.typeLabels[item.type]} · ${item.episodes} ${episodeUnit}</span>
                                </div>` : ''}
                                ${platformKey && item[platformKey] ? `<div class="detail-item">
                                    <i class="fa-solid fa-${icon}"></i>
                                    <span>${data.platformLabels[item[platformKey]]}</span>
                                </div>` : ''}
                                <div class="detail-item">
                                    <i class="fa-solid fa-calendar"></i>
                                    <span>${item[yearKey]} 年</span>
                                </div>
                                ${devKey && item[devKey] ? `<div class="detail-item">
                                    <i class="fa-solid fa-building"></i>
                                    <span>${item[devKey]}</span>
                                </div>` : ''}
                                <div class="detail-item">
                                    <i class="fa-solid fa-check-circle"></i>
                                    <span>${data.statusLabels[item.status]}</span>
                                </div>
                            </div>
                            <div class="tags">
                                ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="anime-modal-summary" id="summary-placeholder">
                        <h3><i class="fa-solid fa-align-left"></i> 简介</h3>
                        <p>加载中...</p>
                    </div>
                    ${item.comment ? `
                        <div class="anime-modal-comment">
                            <h3><i class="fa-solid fa-comment"></i> 我的评价</h3>
                            <p>${item.comment}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        // 异步获取完整简介
        if (typeof fetchSubjectDetail !== 'undefined') {
            const fullSummary = await fetchSubjectDetail(item.id);
            const summaryElement = modal.querySelector('#summary-placeholder p');
            if (summaryElement) {
                if (fullSummary) {
                    summaryElement.textContent = fullSummary;
                } else {
                    modal.querySelector('#summary-placeholder').style.display = 'none';
                }
            }
        } else if (!item.summary) {
            modal.querySelector('#summary-placeholder').style.display = 'none';
        }

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector('.anime-modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadAnimeData();
            loadGalgameData();
        });
    } else {
        loadAnimeData();
        loadGalgameData();
    }
})();
