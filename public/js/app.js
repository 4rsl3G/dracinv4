document.addEventListener('DOMContentLoaded', () => {
    
    // 1. INIT SWIPER (Netflix Rows)
    const swiper = new Swiper(".mySwiper", {
        slidesPerView: "auto",
        spaceBetween: 16,
        freeMode: true,
        mousewheel: true,
        keyboard: {
            enabled: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        breakpoints: {
            640: { spaceBetween: 20 },
            768: { spaceBetween: 24 },
            1024: { spaceBetween: 24 },
        }
    });

    // 2. SEARCH LOGIC (Debounce)
    const searchInput = document.getElementById('globalSearchInput');
    const searchResults = document.getElementById('globalSearchResults');
    let debounceTimer;

    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }

            searchResults.innerHTML = '<div class="p-4 text-center text-graytext"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';

            debounceTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    renderSearch(data.searchCodeSearchResult);
                } catch (err) {
                    searchResults.innerHTML = '<div class="p-4 text-center text-red-500">Error loading results</div>';
                }
            }, 500);
        });
    }

    function renderSearch(results) {
        if (!results || results.length === 0) {
            searchResults.innerHTML = '<div class="p-4 text-center text-graytext">No results found</div>';
            return;
        }

        const html = results.map(item => `
            <a href="/watch/${item.shortPlayId}" class="flex items-center gap-3 p-2 hover:bg-white/10 rounded transition">
                <img src="${item.shortPlayCover}" class="w-10 h-14 object-cover rounded bg-gray-800">
                <div>
                    <h5 class="font-bold text-sm text-white">${item.shortPlayName.replace(/<\/?em>/g, '')}</h5>
                    <span class="text-xs text-primary">Drama</span>
                </div>
            </a>
        `).join('');
        searchResults.innerHTML = html;
    }
});
