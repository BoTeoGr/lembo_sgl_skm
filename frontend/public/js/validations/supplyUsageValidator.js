// URL base para las peticiones al backend
const API_URL = 'http://localhost:5000';


// Array global para almacenar todos los insumos traídos del backend
let allSuppliesGlobal = [];

// Variable temporal para almacenar el insumo seleccionado
let tempSelectedSupply = null;

// Función para obtener todos los items de un endpoint
async function getAllItems(endpoint, limit = 100) {
    try {
        const response = await fetch(`${API_URL}${endpoint}?page=1&limit=${limit}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al obtener datos de ${endpoint}:`, error);
        return { error };
    }
}

// Función para mostrar el formulario de uso de insumo
function showSupplyUsageForm(supplyId) {
    const supplyUsageForm = document.getElementById('supplyUsageForm');
    if (supplyUsageForm) {
        supplyUsageForm.classList.remove('hidden');
        
        // Buscar el insumo en el array global
        const supply = allSuppliesGlobal.find(s => s.id === supplyId);
        if (supply) {
            // Llenar los campos con los datos del insumo
            document.getElementById('supplyName').textContent = supply.nombre;
            document.getElementById('availableQuantity').textContent = supply.cantidad;
            document.getElementById('unitValue').textContent = `$${supply.valor_unitario}`;
            
            // Limpiar el campo de cantidad
            document.getElementById('supplyUsageQuantity').value = '';
            
            // Guardar el insumo seleccionado
            tempSelectedSupply = supply;
        }
    }
}

// Función para ocultar el formulario de uso de insumo
function hideSupplyUsageForm() {
    const supplyUsageForm = document.getElementById('supplyUsageForm');
    if (supplyUsageForm) {
        supplyUsageForm.classList.add('hidden');
        supplyUsageForm.reset();
        tempSelectedSupply = null;
    }
}



// Función para mostrar notificaciones
function showToast(title, message, type = "success") {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="mr-auto">${title}</strong>
            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    document.body.appendChild(toast);
    toast.classList.add('show');
    
    // Cerrar el toast cuando se hace clic en el botón de cierre
    const closeButton = toast.querySelector('[data-dismiss="toast"]');
    closeButton.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 150);
    });
    
    // Automáticamente cerrar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 150);
    }, 3000);
}

// Función para calcular la inversión total
function calculateTotalInvestment() {
    let total = 0;
    
    // Calcular la inversión basada en los insumos seleccionados
    const selectedSupplies = productionData.insumos_ids.map(id => {
        return allSuppliesGlobal.find(s => String(s.id) === String(id));
    }).filter(supply => supply);
    
    selectedSupplies.forEach(supply => {
        if (supply.cantidad_usada && supply.valor_unitario) {
            total += supply.cantidad_usada * supply.valor_unitario;
        }
    });
    
    document.getElementById('totalInvestment').value = total.toFixed(2);
}

// Configurar los event listeners
function setupSupplyUsageEventListeners() {
    // Event listener para el formulario de cantidad de uso
    const supplyUsageForm = document.getElementById('supplyUsageForm');
    if (supplyUsageForm) {
        supplyUsageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            registerSupplyUsage();
        });
    }
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    setupSupplyUsageEventListeners();
});

// Función global para mostrar el formulario de uso de un insumo por id
window.showSupplyUsageFormById = function(insumoId) {
    const supply = selectedSupplies.find(s => String(s.id) === String(insumoId));
    if (supply) {
        showSupplyUsageForm(supply);
    }
};