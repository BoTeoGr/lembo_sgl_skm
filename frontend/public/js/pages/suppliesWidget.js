/**
 * Supplies Widget
 * Fetches and displays supplies summary data on the dashboard
 */

// Find the supplies card by looking for a card with 'Insumos' in its title
function findSuppliesCard() {
    const cards = document.querySelectorAll('.card');
    for (const card of cards) {
        const title = card.querySelector('.card__title');
        if (title && title.textContent.includes('Insumos')) {
            return card;
        }
    }
    return null;
}

// Show error message in the UI
function showError(message) {
    const suppliesCard = findSuppliesCard();
    if (!suppliesCard) return;
    
    let errorContainer = suppliesCard.querySelector('.error-container');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.style.padding = '10px';
        errorContainer.style.color = '#dc3545';
        suppliesCard.querySelector('.card__content').prepend(errorContainer);
    }
    errorContainer.textContent = message;
}

// Clear any existing error message
function clearError() {
    const errorContainer = document.querySelector('.error-container');
    if (errorContainer) {
        errorContainer.remove();
    }
}

// Initialize the widget when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const suppliesCard = findSuppliesCard();
    if (!suppliesCard) return;

    // Show loading state
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-message';
    loadingElement.textContent = 'Cargando datos...';
    loadingElement.style.padding = '10px';
    suppliesCard.querySelector('.card__content').prepend(loadingElement);

    // Fetch supplies data from the API
    fetchSuppliesData()
        .finally(() => {
            // Remove loading message
            const loadingMsg = suppliesCard.querySelector('.loading-message');
            if (loadingMsg) loadingMsg.remove();
        });
});

/**
 * Checks if the server is available
 * @returns {Promise<boolean>} True if server is available, false otherwise
 */
async function isServerAvailable() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
        
        const response = await fetch('http://localhost:3000/health', {
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Fetches supplies summary data from the API or uses mock data if server is not available
 */
async function fetchSuppliesData() {
    clearError();
    
    // First check if server is available
    const serverAvailable = await isServerAvailable();
    
    if (serverAvailable) {
        try {
            const response = await fetch('http://localhost:3000/insumos-resumen/resumen');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            updateSuppliesUI(data);
            return data;
        } catch (error) {
            console.warn('Error fetching supplies data, using mock data instead');
        }
    }
    
    // If we get here, either server is not available or there was an error
    const mockData = getMockData();
    updateSuppliesUI(mockData);
    return mockData;
}

// Mock data for development/testing
function getMockData() {
    return [
        { tipo: 'Químico', cantidad: 95, valor_total: 950.00, porcentaje: 85 },
        { tipo: 'Semilla', cantidad: 25, valor_total: 1250.00, porcentaje: 94 },
        { tipo: 'Equipo', cantidad: 10, valor_total: 2000.00, porcentaje: 15 },
        { tipo: 'Orgánico', cantidad: 500, valor_total: 4000.00, porcentaje: 62 }
    ];
}

/**
 * Updates the UI with the fetched supplies data
 * @param {Array} suppliesData - Array of supply type data
 */
function updateSuppliesUI(suppliesData) {
    // Use the existing findSuppliesCard function which has cross-browser compatible selector logic
    const suppliesCard = findSuppliesCard();
    if (!suppliesCard) {
        console.error('Supplies card not found in the DOM');
        return;
    }

    const progressList = suppliesCard.querySelector('.progress-list');
    if (!progressList) return;

    // Clear existing progress items
    progressList.innerHTML = '';

    // Map supply types to their Spanish names and colors
    const supplyTypeMap = {
        'Químico': { name: 'Químicos', color: '#4CAF50' },
        'Semilla': { name: 'Semillas', color: '#2196F3' },
        'Equipo': { name: 'Equipos', color: '#9C27B0' },
        'Orgánico': { name: 'Orgánicos', color: '#FF9800' },
        'default': { name: 'Otros', color: '#607D8B' }
    };

    // Calculate total items for percentage calculation
    const totalItems = suppliesData.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    
    // Create a progress item for each supply type
    suppliesData.forEach(supply => {
        const supplyType = supplyTypeMap[supply.tipo] || supplyTypeMap['default'];
        const percentage = totalItems > 0 ? Math.round((supply.cantidad / totalItems) * 100) : 0;
        
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        
        progressItem.innerHTML = `
            <div class="progress-item__header">
                <span>${supplyType.name}</span>
                <span>${percentage}%</span>
            </div>
            <div class="progress-item__bar">
                <div class="progress-item__fill" style="width: ${percentage}%; background-color: ${supplyType.color};"></div>
            </div>
        `;
        
        progressList.appendChild(progressItem);
    });

    // Update the total items count in the card header
    const cardSubtitle = suppliesCard.querySelector('.card__subtitle');
    if (cardSubtitle) {
        cardSubtitle.textContent = `${totalItems} ${totalItems === 1 ? 'ítem' : 'ítems'}`;
    }
}

// Helper function to check if an element contains specific text
function containsText(selector, text) {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).find(element => {
        return element.textContent.includes(text);
    });
}
