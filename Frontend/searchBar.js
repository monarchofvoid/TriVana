document.addEventListener("DOMContentLoaded", () => {
    let selectedKepid = null;  
    window.getSelectedKepid = () => selectedKepid;
    // --- Element Selections ---
    const searchInput = document.getElementById("searchInput");
    const searchResultsContainer = document.getElementById("searchResultsContainer");
    const resultsCount = document.getElementById("resultsCount");
    const virtualScrollWindow = document.getElementById("virtualScrollWindow");
    const virtualScrollContent = document.getElementById("virtualScrollContent");

    // --- Configuration & State ---
    let starData = [];
    let fullFilteredResults = [];
    let debounceTimer;

    const ITEM_HEIGHT = 40;
    const VISIBLE_WINDOW_HEIGHT = 280;
    const RENDER_AHEAD = 5;
    const NUM_VISIBLE_ITEMS = Math.ceil(VISIBLE_WINDOW_HEIGHT / ITEM_HEIGHT) + RENDER_AHEAD;

    // --- 1. Fetch Data ---
    async function loadStarData() {
        try {
            const response = await fetch('star-index.json');
            starData = await response.json();
            console.log('Star data loaded:', starData.length, 'entries');
        } catch (error) {
            console.error('Failed to load star data:', error);
        }
    }

    // --- 2. Search Function ---
    function handleSearch(query) {
        if (!query) {
            searchResultsContainer.style.display = 'none';
            return;
        }

        const searchRegex = new RegExp(query, 'i');

        fullFilteredResults = starData.filter(item =>
            searchRegex.test(String(item.kepid)) ||
            (item.kepler_name && searchRegex.test(item.kepler_name))
        );

        resultsCount.textContent = `Found ${fullFilteredResults.length} results`;

        if (fullFilteredResults.length > 0) {
            searchResultsContainer.style.display = 'block';
            virtualScrollContent.style.height = `${fullFilteredResults.length * ITEM_HEIGHT}px`;
            renderVirtualList();
        } else {
            searchResultsContainer.style.display = 'none';
        }
    }

    // --- 3. Render Function ---
    function renderVirtualList() {
        const scrollTop = virtualScrollWindow.scrollTop;
        const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
        const endIndex = Math.min(startIndex + NUM_VISIBLE_ITEMS, fullFilteredResults.length);
        virtualScrollContent.innerHTML = '';

        for (let i = startIndex; i < endIndex; i++) {
            const result = fullFilteredResults[i];

            const item = document.createElement('div');
            item.className = 'result-item';

            // ✅ display rule
            if (result.kepler_name) {
                item.textContent = `${result.kepler_name} (${result.kepid})`;
            } else {
                item.textContent = `${result.kepid}`;
            }

            item.style.top = `${i * ITEM_HEIGHT}px`;

            // ✅ clicking fills input with same formatted string
            item.addEventListener('click', () => {
                searchInput.value = item.textContent;
                selectedKepid = result.kepid;
                searchResultsContainer.style.display = 'none';
            });

            virtualScrollContent.appendChild(item);
        }
    }

    // --- 4. Event Listeners ---
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            handleSearch(searchInput.value.trim());
        }, 200);
    });

    virtualScrollWindow.addEventListener('scroll', renderVirtualList);

    document.addEventListener('click', (event) => {
        if (
            !searchResultsContainer.contains(event.target) &&
            event.target !== searchInput
        ) {
            searchResultsContainer.style.display = 'none';
        }
    });

    loadStarData();
});
