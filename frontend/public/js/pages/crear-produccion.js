document.addEventListener('DOMContentLoaded', async function() {
    // Cache DOM elements
    const supplyUsageForm = document.getElementById('supplyUsageForm');
    const supplyNameEl = document.getElementById('supplyName');
    const availableQuantityEl = document.getElementById('availableQuantity');
    const unitValueEl = document.getElementById('unitValue');
    const supplyUsageQuantity = document.getElementById('supplyUsageQuantity');
    const addSupplyUsageBtn = document.getElementById('addSupplyUsage');
    const hideSupplyUsageFormBtn = document.getElementById('hideSupplyUsageForm');
    const selectedSuppliesList = document.getElementById('selectedSupplies');
    const addSupplyBtn = document.getElementById('addSupply');
    const supplySelect = document.getElementById('supply');
    
    let currentSupply = null;
    let usedSupplies = [];
    let allSupplies = [];
    
    // Fetch supplies from API
    async function fetchSupplies() {
        try {
            const response = await fetch('http://localhost:5000/insumos');
            if (!response.ok) throw new Error('Error al cargar los insumos');
            const data = await response.json();
            allSupplies = Array.isArray(data) ? data : (data.insumos || []);
            
            // Populate supply select
            supplySelect.innerHTML = '<option value="">Seleccionar insumo</option>';
            allSupplies.forEach(supply => {
                if (supply.estado === 'habilitado') {
                    const option = document.createElement('option');
                    option.value = supply.insumoId || supply.id;
                    option.textContent = `${supply.nombre} (${supply.cantidad} ${supply.unidad || 'unidades'})`;
                    option.dataset.quantity = supply.cantidad;
                    option.dataset.unit = supply.unidad || 'unidades';
                    option.dataset.value = supply.valorUnitario || 0;
                    supplySelect.appendChild(option);
                }
            });
        } catch (error) {
            console.error('Error fetching supplies:', error);
            showToast('Error al cargar los insumos', 'error');
        }
    }
    
    // Initialize
    fetchSupplies();

    // Show the supply usage form when a supply is selected
    addSupplyBtn.addEventListener('click', function() {
        const selectedOption = supplySelect.options[supplySelect.selectedIndex];
        if (!selectedOption.value) {
            showToast('Por favor seleccione un insumo', 'warning');
            return;
        }
        
        const supplyId = selectedOption.value;
        const supply = allSupplies.find(s => (s.insumoId || s.id) === supplyId);
        
        if (!supply) {
            showToast('Insumo no encontrado', 'error');
            return;
        }
        
        // Check if already used
        const isAlreadyUsed = usedSupplies.some(s => s.id === supplyId);
        if (isAlreadyUsed) {
            showToast('Este insumo ya ha sido agregado', 'warning');
            return;
        }
        
        // Set current supply
        currentSupply = {
            id: supplyId,
            name: supply.nombre,
            availableQuantity: parseFloat(supply.cantidad),
            unitValue: parseFloat(supply.valorUnitario || 0),
            unit: supply.unidad || 'unidades',
            stock: parseFloat(supply.cantidad) // Store original stock
        };
        
        // Update form with animation
        supplyNameEl.textContent = currentSupply.name;
        availableQuantityEl.textContent = `${currentSupply.availableQuantity} ${currentSupply.unit}`;
        unitValueEl.textContent = `$${currentSupply.unitValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        supplyUsageQuantity.max = currentSupply.availableQuantity;
        supplyUsageQuantity.value = '';
        
        // Add animation class
        supplyUsageForm.classList.add('form-enter');
        
        // Show the form with animation
        setTimeout(() => {
            supplyUsageForm.classList.remove('hidden');
            supplyUsageForm.classList.remove('form-enter');
            supplyUsageQuantity.focus();
            
            // Scroll to form if needed
            supplyUsageForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 10);
    });
    
    // Handle add supply usage to the list
    addSupplyUsageBtn.addEventListener('click', function() {
        if (!currentSupply) return;
        
        const quantity = parseFloat(supplyUsageQuantity.value);
        
        // Validate quantity
        if (isNaN(quantity) || quantity <= 0) {
            showToast('Por favor ingrese una cantidad válida', 'warning');
            supplyUsageQuantity.focus();
            supplyUsageQuantity.classList.add('error');
            return;
        }
        
        if (quantity > currentSupply.availableQuantity) {
            showToast(`La cantidad no puede ser mayor a ${currentSupply.availableQuantity}`, 'error');
            supplyUsageQuantity.focus();
            supplyUsageQuantity.classList.add('error');
            return;
        }
        
        // Calculate remaining quantity
        const remainingQuantity = currentSupply.availableQuantity - quantity;
        const totalCost = quantity * currentSupply.unitValue;
        
        // Add to used supplies
        usedSupplies.push({
            id: currentSupply.id,
            name: currentSupply.name,
            quantity: quantity,
            unit: currentSupply.unit,
            unitValue: currentSupply.unitValue,
            totalCost: totalCost,
            remainingQuantity: remainingQuantity,
            originalStock: currentSupply.stock,
            usedPercentage: (quantity / currentSupply.stock * 100).toFixed(1)
        });
        
        // Update UI with animation
        supplyUsageForm.classList.add('form-exit');
        
        setTimeout(() => {
            // Update UI
            updateUsedSuppliesList();
            updateTotals();
            
            // Reset form
            supplyUsageForm.classList.add('hidden');
            supplyUsageForm.classList.remove('form-exit');
            supplySelect.value = '';
            currentSupply = null;
            
            // Show success message with animation
            const successToast = document.createElement('div');
            successToast.className = 'toast-message success';
            successToast.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Insumo agregado correctamente</span>
            `;
            document.body.appendChild(successToast);
            
            // Remove toast after animation
            setTimeout(() => {
                successToast.classList.add('show');
                setTimeout(() => {
                    successToast.classList.remove('show');
                    setTimeout(() => {
                        successToast.remove();
                    }, 300);
                }, 3000);
            }, 10);
            
            // Scroll to updated list
            if (usedSupplies.length > 0) {
                document.querySelector('.selected-items').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }
        }, 200);
    });
    
    // Handle hide form
    hideSupplyUsageFormBtn.addEventListener('click', function() {
        supplyUsageForm.classList.add('hidden');
        currentSupply = null;
    });
    
    // Update the used supplies list in the UI
    function updateUsedSuppliesList() {
        selectedSuppliesList.innerHTML = '';
        
        if (usedSupplies.length === 0) {
            selectedSuppliesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>No hay insumos agregados</p>
                    <small>Selecciona un insumo y agrégalo a la lista</small>
                </div>`;
            return;
        }
        
        usedSupplies.forEach((supply, index) => {
            const item = document.createElement('div');
            item.className = 'selected-item';
            
            // Calculate usage percentage for progress bar
            const usagePercentage = (supply.quantity / supply.originalStock * 100).toFixed(1);
            const remainingPercentage = (supply.remainingQuantity / supply.originalStock * 100).toFixed(1);
            
            item.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${supply.name}</span>
                    <div class="item-details">
                        <span class="quantity-badge">
                            <i class="fas fa-balance-scale-right"></i>
                            ${supply.quantity} ${supply.unit}
                        </span>
                        <span class="unit-price">
                            <i class="fas fa-tag"></i>
                            $${supply.unitValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span class="total-cost">
                            <i class="fas fa-calculator"></i>
                            $${supply.totalCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <div class="stock-indicator">
                            <div class="stock-bar">
                                <div class="stock-used" style="width: ${usagePercentage}%" 
                                     title="${usagePercentage}% del stock total"></div>
                            </div>
                            <span class="stock-text">
                                ${supply.remainingQuantity} ${supply.unit} restantes
                                <small>(${remainingPercentage}% del stock)</small>
                            </span>
                        </div>
                    </div>
                </div>
                <button class="remove-supply" data-index="${index}" 
                        title="Eliminar insumo">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            
            selectedSuppliesList.appendChild(item);
        });
        
        // Add event listeners to remove buttons with animation
        document.querySelectorAll('.remove-supply').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                const removedItem = usedSupplies[index];
                
                // Add removal animation
                const item = this.closest('.selected-item');
                item.style.opacity = '0';
                item.style.transform = 'translateX(20px)';
                
                setTimeout(() => {
                    usedSupplies.splice(index, 1);
                    updateUsedSuppliesList();
                    updateTotals();
                    
                    // Show undo toast
                    const toast = document.createElement('div');
                    toast.className = 'toast-message info';
                    toast.innerHTML = `
                        <i class="fas fa-info-circle"></i>
                        <span>Insumo eliminado</span>
                        <button class="undo-btn">
                            <i class="fas fa-undo"></i> Deshacer
                        </button>
                    `;
                    
                    document.body.appendChild(toast);
                    
                    // Show toast with animation
                    setTimeout(() => {
                        toast.classList.add('show');
                    }, 10);
                    
                    // Handle undo
                    const undoBtn = toast.querySelector('.undo-btn');
                    let timeoutId = setTimeout(() => {
                        toast.remove();
                    }, 5000);
                    
                    undoBtn.addEventListener('click', () => {
                        clearTimeout(timeoutId);
                        usedSupplies.splice(index, 0, removedItem);
                        updateUsedSuppliesList();
                        updateTotals();
                        toast.remove();
                        
                        // Scroll to the restored item
                        const items = document.querySelectorAll('.selected-item');
                        if (items[index]) {
                            items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            
                            // Highlight the restored item
                            items[index].classList.add('highlight');
                            setTimeout(() => {
                                items[index].classList.remove('highlight');
                            }, 2000);
                        }
                    });
                    
                    // Auto-remove toast
                    toast.addEventListener('click', () => {
                        clearTimeout(timeoutId);
                        toast.classList.remove('show');
                        setTimeout(() => {
                            toast.remove();
                        }, 300);
                    });
                    
                    // Auto-remove after timeout
                    timeoutId = setTimeout(() => {
                        toast.classList.remove('show');
                        setTimeout(() => {
                            toast.remove();
                        }, 300);
                    }, 5000);
                    
                }, 200);
            });
        });
    }
    
    // Update total investment based on used supplies
    function updateTotals() {
        const totalInvestment = usedSupplies.reduce((sum, supply) => sum + supply.totalCost, 0);
        const estimatedProfit = totalInvestment * 0.3; // 30% of investment
        const totalProfit = totalInvestment + estimatedProfit;
        
        // Format numbers with thousand separators and 2 decimal places
        const formatNumber = num => num.toLocaleString('es-ES', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
        
        // Update input values
        const totalInversionInput = document.getElementById('totalInversion');
        const gananciaEsperadaInput = document.getElementById('gananciaEsperada');
        const totalVentaInput = document.getElementById('precioVenta');
        
        totalInversionInput.value = formatNumber(totalInvestment);
        gananciaEsperadaInput.value = formatNumber(estimatedProfit);
        
        // Auto-update precioVenta if it's empty or matches the previous total
        if (!totalVentaInput.value || parseFloat(totalVentaInput.value.replace(/\./g, '').replace(',', '.')) === 
            (parseFloat(totalInversionInput.dataset.lastValue) || 0)) {
            totalVentaInput.value = formatNumber(totalProfit);
        }
        
        // Store current total for future comparisons
        totalInversionInput.dataset.lastValue = totalInvestment;
        
        // Update summary cards
        updateSummaryCards(totalInvestment, estimatedProfit);
        
        // Update hidden input for form submission
        document.getElementById('usedSuppliesInput').value = JSON.stringify(usedSupplies);
        
        // Trigger change event for any dependent calculations
        const event = new Event('change');
        totalInversionInput.dispatchEvent(event);
    }
    
    // Update summary cards with investment and profit information
    function updateSummaryCards(totalInvestment, estimatedProfit) {
        const formatCurrency = num => `$${num.toLocaleString('es-ES', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
        
        const totalProfit = totalInvestment + estimatedProfit;
        const roi = totalInvestment > 0 ? (estimatedProfit / totalInvestment * 100).toFixed(1) : 0;
        
        // Create or update summary cards
        let summaryCards = document.querySelector('.summary-cards');
        if (!summaryCards) {
            summaryCards = document.createElement('div');
            summaryCards.className = 'summary-cards';
            const suppliesSection = document.querySelector('.form__section--supplies');
            if (suppliesSection) {
                suppliesSection.insertAdjacentElement('afterend', summaryCards);
            }
        }
        
        summaryCards.innerHTML = `
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-coins"></i>
                </div>
                <div class="summary-details">
                    <h4>Inversión Total</h4>
                    <div class="summary-amount">${formatCurrency(totalInvestment)}</div>
                    <div class="summary-label">Costo de insumos</div>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon profit">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="summary-details">
                    <h4>Ganancia Esperada</h4>
                    <div class="summary-amount">${formatCurrency(estimatedProfit)}</div>
                    <div class="summary-label">30% de la inversión</div>
                </div>
            </div>
            <div class="summary-card highlight">
                <div class="summary-icon total">
                    <i class="fas fa-hand-holding-usd"></i>
                </div>
                <div class="summary-details">
                    <h4>Total de Venta</h4>
                    <div class="summary-amount">${formatCurrency(totalProfit)}</div>
                    <div class="summary-label">Inversión + Ganancia (ROI: ${roi}%)</div>
                </div>
            </div>
        `;
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        const toastContent = toast.querySelector('.toast-content');
        toastContent.textContent = message;
        
        // Remove previous type classes
        toast.className = 'toast';
        toast.classList.add(type);
        
        // Show toast
        toast.classList.remove('hidden');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
    
    // Initialize form submission
    const productionForm = document.getElementById('productionForm');
    if (productionForm) {
        productionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Add used supplies to form data
            const existingSuppliesInput = document.querySelector('input[name="usedSupplies"]');
            if (existingSuppliesInput) {
                existingSuppliesInput.value = JSON.stringify(usedSupplies);
            } else {
                const suppliesInput = document.createElement('input');
                suppliesInput.type = 'hidden';
                suppliesInput.name = 'usedSupplies';
                suppliesInput.value = JSON.stringify(usedSupplies);
                this.appendChild(suppliesInput);
            }
            
            // Validate at least one supply is added
            if (usedSupplies.length === 0) {
                showToast('Debe agregar al menos un insumo', 'error');
                return;
            }
            
            // Submit form
            this.submit();
        });
    }
    
    // Handle hide form button
    if (hideSupplyUsageFormBtn) {
        hideSupplyUsageFormBtn.addEventListener('click', function() {
            supplyUsageForm.classList.add('hidden');
            currentSupply = null;
            supplySelect.selectedIndex = 0;
        });
    }
});
