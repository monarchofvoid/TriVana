document.addEventListener("DOMContentLoaded", () => {
    // --- Element Selections ---
    const searchInput = document.getElementById("searchInput");
    const searchResultsContainer = document.getElementById("searchResultsContainer");
    const resultsCount = document.getElementById("resultsCount");
    const virtualScrollWindow = document.getElementById("virtualScrollWindow");
    const virtualScrollContent = document.getElementById("virtualScrollContent");

    // --- Configuration & State ---
    let starData = [];
    let fullFilteredResults = []; // Our "resultBuffer"
    let debounceTimer;
    
    const ITEM_HEIGHT = 40; // Must match CSS .result-item height
    const VISIBLE_WINDOW_HEIGHT = 280; // Must match CSS .virtual-scroll-window max-height
    // Calculate how many items to render, plus a buffer for smooth scrolling
    const RENDER_AHEAD = 5;
    const NUM_VISIBLE_ITEMS = Math.ceil(VISIBLE_WINDOW_HEIGHT / ITEM_HEIGHT) + RENDER_AHEAD;

    // --- 1. Fetch Data (Same as before) ---
    async function loadStarData() {
        try {
            const response = await fetch('star-index.json');
            starData = await response.json();
            console.log('Star data loaded:', starData.length, 'entries');
        } catch (error) {
            console.error('Failed to load star data:', error);
        }
    }

    // --- 2. The Search Function (Now with Regex) ---
    function handleSearch(query) {
        if (!query) {
            searchResultsContainer.style.display = 'none';
            return;
        }

        // Create a case-insensitive regular expression from the user's query
        const searchRegex = new RegExp(query, 'i');

        // Filter the full dataset
        fullFilteredResults = starData.filter(item =>
            searchRegex.test(item.pl_name) || searchRegex.test(item.hostname)
        );

        // Update UI feedback
        resultsCount.textContent = `Found ${fullFilteredResults.length} results`;
        
        // If there are results, render the virtual list
        if (fullFilteredResults.length > 0) {
            searchResultsContainer.style.display = 'block';
            // Set the total height of the scrollable area
            virtualScrollContent.style.height = `${fullFilteredResults.length * ITEM_HEIGHT}px`;
            renderVirtualList(); // Initial render
        } else {
            searchResultsContainer.style.display = 'none';
        }
    }
    
    // --- 3. The Virtualization Render Function ---
    function renderVirtualList() {
        // Get the current scroll position
        const scrollTop = virtualScrollWindow.scrollTop;
        
        // Calculate the first item that should be visible
        const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
        
        // Determine the range of items to render
        const endIndex = Math.min(startIndex + NUM_VISIBLE_ITEMS, fullFilteredResults.length);
        
        // Clear previous items
        virtualScrollContent.innerHTML = '';

        // Create and position only the visible items
        for (let i = startIndex; i < endIndex; i++) {
            const result = fullFilteredResults[i];
            
            const item = document.createElement('div');
            item.className = 'result-item';
            item.textContent = result.pl_name;
            // Position the item absolutely within the tall container
            item.style.top = `${i * ITEM_HEIGHT}px`;
            
            item.addEventListener('click', () => {
                searchInput.value = result.pl_name;
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
    
    // The magic happens here: re-render on scroll
    virtualScrollWindow.addEventListener('scroll', renderVirtualList);

    // Hide results if user clicks elsewhere
    document.addEventListener('click', (event) => {
        if (!searchBox.contains(event.target)) {
            searchResultsContainer.style.display = 'none';
        }
    });

    // --- Initial Data Load ---
    loadStarData();
});