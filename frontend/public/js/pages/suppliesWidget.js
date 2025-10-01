/**
 * Supplies Widget
 * Fetches and displays supplies summary data on the dashboard
 */

// Find the supplies card by looking for a card with 'Insumos' in its title
function findSuppliesCard() {
	const cards = document.querySelectorAll(".card");
	for (const card of cards) {
		const title = card.querySelector(".card__title");
		if (title && title.textContent.includes("Insumos")) {
			return card;
		}
	}
	return null;
}

// Show error message in the UI
function showError(message) {
	const suppliesCard = findSuppliesCard();
	if (!suppliesCard) return;

	let errorContainer = suppliesCard.querySelector(".error-container");
	if (!errorContainer) {
		errorContainer = document.createElement("div");
		errorContainer.className = "error-container";
		errorContainer.style.padding = "10px";
		errorContainer.style.color = "#dc3545";
		suppliesCard.querySelector(".card__content").prepend(errorContainer);
	}
	errorContainer.textContent = message;
}

// Clear any existing error message
function clearError() {
	const errorContainer = document.querySelector(".error-container");
	if (errorContainer) {
		errorContainer.remove();
	}
}

// Initialize the widget when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
	const suppliesCard = findSuppliesCard();
	if (!suppliesCard) return;

	// Show loading state
	const loadingElement = document.createElement("div");
	loadingElement.className = "loading-message";
	loadingElement.textContent = "Cargando datos...";
	loadingElement.style.padding = "10px";
	suppliesCard.querySelector(".card__content").prepend(loadingElement);

	// Fetch supplies data from the API
	fetchSuppliesData().finally(() => {
		// Remove loading message
		const loadingMsg = suppliesCard.querySelector(".loading-message");
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

		const response = await fetch("http://localhost:3000/health", {
			signal: controller.signal,
		}).finally(() => clearTimeout(timeoutId));

		return response.ok;
	} catch (error) {
		return false;
	}
}

/**
 * Fetches supplies summary data from the public API
 */
async function fetchSuppliesData() {
	try {
		console.log("Fetching supplies data from API...");
		const response = await fetch("http://localhost:5000/api/widgets/supplies");

		if (!response.ok) {
			const errorText = await response.text();
			console.error("API Error Response:", errorText);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log("Received supplies data:", data);

		if (!Array.isArray(data)) {
			throw new Error("Invalid data format: expected array");
		}

		updateSuppliesUI(data);
		return data;
	} catch (error) {
		console.error("Error fetching supplies data:", error);
		showError("No se pudieron cargar los datos de insumos");
		return [];
	}
}

// Mock data for development/testing
function getMockData() {
	return [
		{ tipo: "Químico", cantidad: 95, valor_total: 950.0, porcentaje: 85 },
		{ tipo: "Semilla", cantidad: 25, valor_total: 1250.0, porcentaje: 94 },
		{ tipo: "Equipo", cantidad: 10, valor_total: 2000.0, porcentaje: 15 },
		{ tipo: "Orgánico", cantidad: 500, valor_total: 4000.0, porcentaje: 62 },
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
		console.error("Supplies card not found in the DOM");
		return;
	}

	const progressList = suppliesCard.querySelector(".progress-list");
	if (!progressList) return;

	// Clear existing progress items
	progressList.innerHTML = "";

	// Map supply types to their Spanish names and colors
	const supplyTypeMap = {
		Químico: { name: "Químicos", color: "#4CAF50" },
		Orgánico: { name: "Orgánicos", color: "#FF9800" },
		Semillas: { name: "Semillas", color: "#2196F3" },
		default: { name: "Otros", color: "#607D8B" },
	};

	// Group supplies by type, combining 'Sustrato' and 'Biológico' into 'Otros'
	const groupedSupplies = suppliesData.reduce((acc, item) => {
		const type = ["Químico", "Orgánico", "Semillas"].includes(item.type)
			? item.type
			: "default";
		const existing = acc.find((s) => s.type === type);

		if (existing) {
			existing.count += parseInt(item.count) || 0;
			existing.enabled =
				(parseInt(existing.enabled) || 0) + (parseInt(item.enabled) || 0);
		} else {
			acc.push({
				type: type,
				count: parseInt(item.count) || 0,
				enabled: parseInt(item.enabled) || 0,
			});
		}
		return acc;
	}, []);

	// Calculate total items for percentage calculation
	const totalItems = groupedSupplies.reduce(
		(sum, item) => sum + (item.count || 0),
		0
	);

	// Create a progress item for each supply type
	groupedSupplies.forEach((supply, index) => {
		const supplyType = supplyTypeMap[supply.type] || supplyTypeMap["default"];
		const enabledCount = parseInt(supply.enabled) || 0;
		const percentage =
			totalItems > 0 ? Math.round((supply.count / totalItems) * 100) : 0;

		const progressItem = document.createElement("div");
		progressItem.className = "progress-item";
		progressItem.style.animationDelay = `${index * 100}ms`;

		progressItem.innerHTML = `
            <div class="progress-item__header">
                <span>${supplyType.name} <small>(${enabledCount})</small></span>
                <span>${percentage}%</span>
            </div>
            <div class="progress-item__bar">
                <div class="progress-item__fill" 
                     style="--progress-width: ${percentage}%; 
                            background-color: ${supplyType.color};
                            width: var(--progress-width);">
                </div>
            </div>
        `;

		progressList.appendChild(progressItem);
	});

	// Update the total items count in the card header
	const cardSubtitle = suppliesCard.querySelector(".card__subtitle");
	if (cardSubtitle) {
		cardSubtitle.textContent = `${totalItems} ${
			totalItems === 1 ? "ítem" : "ítems"
		}`;
	}
}

// Helper function to check if an element contains specific text
function containsText(selector, text) {
	const elements = document.querySelectorAll(selector);
	return Array.from(elements).find((element) => {
		return element.textContent.includes(text);
	});
}
