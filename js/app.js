/**
 * Languo 240 Colors Marker Chart - Application Logic
 * Main JavaScript file for application functionality
 */

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

/**
 * Initializes the application on page load.
 */
function initApp() {
    const gridContainer = document.getElementById('marker-grid');
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
    });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
