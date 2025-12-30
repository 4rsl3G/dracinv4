// GLOBAL LOGIC
document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Search Logic (Debounce)
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${query}`);
                const data = await res.json();
                renderSearchResults(data.searchCodeSearchResult);
            } catch (err) {
                console.error('Search failed');
            }
        }, 400); // 400ms delay per prompt
    });

    function renderSearchResults(results) {
        searchResults.innerHTML = '';
        if (!results || results.length === 0) {
            searchResults.innerHTML = '<div class="search-item" style="cursor:default">No results found</div>';
        } else {
            results.forEach(item => {
                const div = document.createElement('div');
                div.className = 'search-item';
                div.onclick = () => window.location.href = `/watch/${item.shortPlayId}`;
                // Handle <em> tag safely
                div.innerHTML = `
                    <img src="${item.shortPlayCover}" alt="poster">
                    <div class="search-text">
                        <h5>${item.shortPlayName}</h5> <small>${item.formatHeatScore || ''}</small>
                    </div>
                `;
                searchResults.appendChild(div);
            });
        }
        searchResults.classList.remove('hidden');
    }

    // Hide search on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            searchResults.classList.add('hidden');
        }
    });

    // 3. Horizontal Sliders
    document.querySelectorAll('.slider-wrapper').forEach(wrapper => {
        const slider = wrapper.querySelector('.slider');
        const leftBtn = wrapper.querySelector('.left-handle');
        const rightBtn = wrapper.querySelector('.right-handle');

        leftBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -window.innerWidth * 0.8, behavior: 'smooth' });
        });
        rightBtn.addEventListener('click', () => {
            slider.scrollBy({ left: window.innerWidth * 0.8, behavior: 'smooth' });
        });
    });

    // 4. Infinite Scroll (Only on Browse Page)
    if (window.BROWSE_MODE) {
        let page = 2;
        let isLoading = false;
        let isEnd = false;
        const grid = document.getElementById('browseGrid');
        const loader = document.getElementById('loadingIndicator');

        window.addEventListener('scroll', async () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500 && !isLoading && !isEnd) {
                isLoading = true;
                loader.classList.remove('hidden');

                try {
                    const res = await fetch(`/api/browse?page=${page}`);
                    const data = await res.json();
                    
                    if (data && data.contentInfos && data.contentInfos.length > 0) {
                        data.contentInfos.forEach(item => {
                            // Recreate card HTML efficiently
                            const card = document.createElement('div');
                            card.className = 'card';
                            card.onclick = () => window.location.href = `/watch/${item.shortPlayId}`;
                            card.innerHTML = `
                                <div class="card-image-wrapper">
                                    <img src="${item.shortPlayCover}" loading="lazy">
                                </div>
                                <div class="card-info">
                                    <h4>${item.shortPlayName}</h4>
                                </div>
                            `;
                            grid.appendChild(card);
                        });
                        page++;
                    } else {
                        isEnd = true;
                        document.getElementById('endMessage').classList.remove('hidden');
                    }
                } catch (err) {
                    console.log('End of list or error');
                    isEnd = true;
                } finally {
                    isLoading = false;
                    loader.classList.add('hidden');
                }
            }
        });
    }
});
