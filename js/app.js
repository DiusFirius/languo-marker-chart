/**
 * Languo 240 Colors Marker Chart - Application Logic
 * Main JavaScript file for application functionality
 */

// ==========================================================================
// DOM Element References
// ==========================================================================

let searchInput;
let clearButton;
let searchResults;
let searchStatus;
let gridContainer;

// ==========================================================================
// Core Utility Functions
// ==========================================================================

/**
 * Calculates the appropriate text color (black or white) based on background luminance.
 * Uses the relative luminance formula for perceived brightness.
 * @param {string} hexColor - Hex color string in format "#RRGGBB"
 * @returns {string} "#000000" for light backgrounds, "#FFFFFF" for dark backgrounds
 */
function getTextColor(hexColor) {
    // Remove # if present and parse hex values
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate perceived luminance using weighted formula
    // Formula: (R*299 + G*587 + B*114) / 1000
    const luminance = (r * 299 + g * 587 + b * 114) / 1000;

    // Threshold: 128 - return black text for light backgrounds, white for dark
    return luminance > 128 ? '#000000' : '#FFFFFF';
}

/**
 * Renders all 240 marker cells into the grid container.
 * Position is determined solely by array index (0-239).
 * @param {HTMLElement} gridContainer - The DOM element to render cells into
 */
function renderGrid(gridContainer) {
    // Clear any existing content
    gridContainer.innerHTML = '';

    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();

    // Loop through all markers and create cells
    markers.forEach((marker, index) => {
        const cell = document.createElement('div');
        cell.className = 'marker-cell';
        cell.textContent = marker.id;

        // Set background color and calculated text color
        cell.style.backgroundColor = marker.color;
        cell.style.color = getTextColor(marker.color);

        // Set ARIA attributes for accessibility
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `Marker ${marker.id}`);

        // Enable keyboard navigation
        cell.setAttribute('tabindex', '0');

        // Store marker data for potential future use
        cell.dataset.index = index;
        cell.dataset.markerId = marker.id;

        fragment.appendChild(cell);
    });

    // Append all cells at once for better performance
    gridContainer.appendChild(fragment);
}

// ==========================================================================
// Search Functions (Phase 2)
// ==========================================================================

/**
 * Normalizes a search term for consistent matching.
 * Trims whitespace, converts to uppercase, removes hyphens and spaces.
 * @param {string} term - The raw search term
 * @returns {string} Normalized search term
 */
function normalizeSearchTerm(term) {
    if (!term) {
        return '';
    }
    return term.trim().toUpperCase().replace(/[-\s]/g, '');
}

/**
 * Searches markers array for matches based on normalized ID comparison.
 * Uses partial matching - search term can appear anywhere in the marker ID.
 * @param {string} term - The search term to match
 * @returns {Array} Array of objects containing matched marker data and their indices
 */
function searchMarkers(term) {
    const normalizedTerm = normalizeSearchTerm(term);
    if (!normalizedTerm) {
        return [];
    }

    const results = [];
    markers.forEach((marker, index) => {
        const normalizedId = normalizeSearchTerm(marker.id);
        if (normalizedId.includes(normalizedTerm)) {
            results.push({ marker, index });
        }
    });
    return results;
}

/**
 * Removes blink class from all marker cells.
 * Called before applying new search results or clearing search.
 */
function clearAllBlinking() {
    const blinkingCells = gridContainer.querySelectorAll('.marker-cell.blink');
    blinkingCells.forEach(cell => cell.classList.remove('blink'));
}

/**
 * Scrolls the first matched cell into view (centered in viewport).
 * @param {number} index - Array index of the marker to scroll to
 */
function scrollToMarker(index) {
    const cells = gridContainer.querySelectorAll('.marker-cell');
    const targetCell = cells[index];
    if (targetCell) {
        targetCell.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }
}

/**
 * Displays a "no results" warning message.
 * @param {string} term - The search term that yielded no results
 */
function displayNoResults(term) {
    searchResults.className = 'search-results warning';
    searchResults.textContent = `⚠️ No markers found matching '${term}'`;
    searchStatus.textContent = `No markers found matching ${term}`;
}

/**
 * Displays the result count message.
 * @param {number} count - Number of matches found
 */
function displayResultCount(count) {
    searchResults.className = 'search-results';
    const pluralized = count === 1 ? 'marker' : 'markers';
    searchResults.textContent = `${count} ${pluralized} found`;
    searchStatus.textContent = `${count} ${pluralized} found`;
}

/**
 * Handles search results: applies blink animation and updates display.
 * Called after searchMarkers() returns results.
 * @param {Array} results - Array of matched marker objects with indices
 * @param {string} term - The original search term (for error messages)
 */
function handleSearchResults(results, term) {
    // Clear any previous blinking
    clearAllBlinking();

    // Handle no results case
    if (results.length === 0) {
        displayNoResults(term);
        return;
    }

    // Display result count
    displayResultCount(results.length);

    // Get all marker cells
    const cells = gridContainer.querySelectorAll('.marker-cell');

    // Apply blink class to all matching cells simultaneously
    results.forEach(({ index }) => {
        if (cells[index]) {
            cells[index].classList.add('blink');
        }
    });

    // Scroll to first match
    scrollToMarker(results[0].index);
}

/**
 * Clears the search: removes animations, clears input, hides clear button.
 * Called on clear button click or Escape key press.
 */
function clearSearch() {
    // Remove blink from all cells
    clearAllBlinking();

    // Clear input field
    searchInput.value = '';

    // Hide clear button
    clearButton.hidden = true;

    // Clear result messages
    searchResults.className = 'search-results';
    searchResults.textContent = '';

    // Clear aria-live announcements
    searchStatus.textContent = '';

    // Return focus to search input
    searchInput.focus();
}

/**
 * Executes a search based on current input value.
 * Handles concurrent searches by clearing previous results first.
 */
function executeSearch() {
    const term = searchInput.value;
    const normalizedTerm = normalizeSearchTerm(term);

    // Don't search for empty input
    if (!normalizedTerm) {
        clearSearch();
        return;
    }

    // Search and handle results (clears previous animations automatically)
    const results = searchMarkers(term);
    handleSearchResults(results, term);
}

/**
 * Updates clear button visibility based on input content.
 */
function updateClearButtonVisibility() {
    clearButton.hidden = searchInput.value.length === 0;
}

// ==========================================================================
// Event Handlers
// ==========================================================================

/**
 * Sets up all event listeners for search functionality.
 */
function setupSearchEventListeners() {
    // Toggle clear button visibility on input
    searchInput.addEventListener('input', updateClearButtonVisibility);

    // Execute search on Enter key
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            executeSearch();
        }
    });

    // Clear search on clear button click
    clearButton.addEventListener('click', clearSearch);

    // Global Escape key to clear search
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            // Only clear if there's something to clear
            if (searchInput.value || searchResults.textContent) {
                clearSearch();
            }
        }
    });
}

// ==========================================================================
// Application Initialization
// ==========================================================================

/**
 * Initializes the application on page load.
 */
function initApp() {
    // Cache DOM references
    gridContainer = document.getElementById('marker-grid');
    searchInput = document.getElementById('marker-search');
    clearButton = document.getElementById('clear-search');
    searchResults = document.getElementById('search-results');
    searchStatus = document.getElementById('search-status');
    const loadingElement = document.getElementById('loading');

    if (!gridContainer) {
        console.error('Grid container not found');
        return;
    }

    // Validate marker data before rendering
    const validation = validateMarkerData();
    if (!validation.success) {
        console.error('Marker data validation failed:', validation.errors);
        alert('Error: Invalid marker data. Check console for details.');
        return;
    }

    // Show loading state
    if (loadingElement) {
        loadingElement.hidden = false;
    }

    // Use requestAnimationFrame to ensure loading state is visible
    requestAnimationFrame(() => {
        const startTime = performance.now();

        // Render the grid
        renderGrid(gridContainer);

        const renderTime = performance.now() - startTime;
        console.log(`Grid rendered in ${renderTime.toFixed(2)}ms`);

        // Hide loading state
        if (loadingElement) {
            loadingElement.hidden = true;
        }

        // Set up search event listeners
        setupSearchEventListeners();
    });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
