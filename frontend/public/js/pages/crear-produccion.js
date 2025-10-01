document.addEventListener("DOMContentLoaded", async function () {
	// Caché de elementos del DOM
	const supplyUsageForm = document.getElementById("supplyUsageForm");
	const supplyNameEl = document.getElementById("supplyName");
	const availableQuantityEl = document.getElementById("availableQuantity");
	const unitValueEl = document.getElementById("unitValue");
	const supplyUsageQuantity = document.getElementById("supplyUsageQuantity");
	const addSupplyUsageBtn = document.getElementById("addSupplyUsage");
	const hideSupplyUsageFormBtn = document.getElementById("hideSupplyUsageForm");
	const selectedSuppliesList = document.getElementById("selectedSupplies");
	const addSupplyBtn = document.getElementById("addSupply");
	const supplySelect = document.getElementById("supply");

	let currentSupply = null;
	let usedSupplies = [];
	let allSupplies = [];

	// Obtener insumos desde la API
	async function fetchSupplies() {
		try {
			const response = await fetch("http://localhost:5000/insumos");
			if (!response.ok) throw new Error("Error al cargar los insumos");
			const data = await response.json();
			allSupplies = Array.isArray(data) ? data : data.insumos || [];

			// Llenar el select de insumos
			supplySelect.innerHTML = '<option value="">Seleccionar insumo</option>';
			allSupplies.forEach((supply) => {
				if (supply.estado === "habilitado") {
					const option = document.createElement("option");
					option.value = supply.insumoId || supply.id;
					option.textContent = `${supply.nombre} (${supply.cantidad} ${
						supply.unidad || "unidades"
					})`;
					option.dataset.quantity = supply.cantidad;
					option.dataset.unit = supply.unidad || "unidades";
					option.dataset.value = supply.valorUnitario || 0;
					supplySelect.appendChild(option);
				}
			});
		} catch (error) {
			console.error("Error fetching supplies:", error);
			showToast("Error al cargar los insumos", "error");
		}
	}

	// Inicializar
	fetchSupplies();

	// Función helper para resaltar una sección y hacer scroll hacia ella
	function highlightAndScrollToSection(selector, duration = 2000) {
		const section = document.querySelector(selector)?.closest('.form__section');
		if (section) {
			// Agregar un resaltado temporal para resaltar la sección
			section.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.3)';
			section.style.borderColor = 'var(--primary-green)';
			section.scrollIntoView({ behavior: "smooth", block: "center" });

			// Remover el resaltado después de la animación
			setTimeout(() => {
				section.style.boxShadow = '';
				section.style.borderColor = '';
			}, duration);
		}
	}

	// Mostrar el formulario de uso de insumo cuando se selecciona un insumo
	addSupplyBtn.addEventListener("click", function () {
		const selectedOption = supplySelect.options[supplySelect.selectedIndex];
		if (!selectedOption.value) {
			showToast("Por favor seleccione un insumo", "warning");
			return;
		}

		const supplyId = selectedOption.value;
		const supply = allSupplies.find((s) => (s.insumoId || s.id) === supplyId);

		if (!supply) {
			showToast("Insumo no encontrado", "error");
			return;
		}

		// Verificar si ya se ha usado
		const isAlreadyUsed = usedSupplies.some((s) => s.id === supplyId);
		if (isAlreadyUsed) {
			showToast("Este insumo ya ha sido agregado", "warning");
			return;
		}

		// Establecer el insumo actual
		currentSupply = {
			id: supplyId,
			name: supply.nombre,
			availableQuantity: parseFloat(supply.cantidad),
			unitValue: parseFloat(supply.valorUnitario || 0),
			unit: supply.unidad || "unidades",
			stock: parseFloat(supply.cantidad), // Store original stock
		};

		// Actualizar el formulario con animación
		supplyNameEl.textContent = currentSupply.name;
		availableQuantityEl.textContent = `${currentSupply.availableQuantity} ${currentSupply.unit}`;
		unitValueEl.textContent = `$${currentSupply.unitValue.toLocaleString(
			"es-ES",
			{ minimumFractionDigits: 2, maximumFractionDigits: 2 }
		)}`;
		supplyUsageQuantity.max = currentSupply.availableQuantity;
		supplyUsageQuantity.value = "";

		// Añadir clase de animación
		supplyUsageForm.classList.add("form-enter");

		// Mostrar el formulario con animación
		setTimeout(() => {
			supplyUsageForm.classList.remove("hidden");
			supplyUsageForm.classList.remove("form-enter");
			supplyUsageQuantity.focus();

			// Desplazar al formulario si es necesario
			supplyUsageForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
		}, 10);
	});

	// Manejar la adición de uso de insumo a la lista
	addSupplyUsageBtn.addEventListener("click", function () {
		if (!currentSupply) return;

		const quantity = parseFloat(supplyUsageQuantity.value);

		// Validar la cantidad
		if (isNaN(quantity) || quantity <= 0) {
			showToast("Por favor ingrese una cantidad válida", "warning");
			supplyUsageQuantity.focus();
			supplyUsageQuantity.classList.add("error");
			return;
		}

		if (quantity > currentSupply.availableQuantity) {
			showToast(
				`La cantidad no puede ser mayor a ${currentSupply.availableQuantity}`,
				"error"
			);
			supplyUsageQuantity.focus();
			supplyUsageQuantity.classList.add("error");
			return;
		}

		// Calcular la cantidad restante
		const remainingQuantity = currentSupply.availableQuantity - quantity;
		const totalCost = quantity * currentSupply.unitValue;

		// Añadir a los insumos usados
		usedSupplies.push({
			id: currentSupply.id,
			name: currentSupply.name,
			quantity: quantity,
			unit: currentSupply.unit,
			unitValue: currentSupply.unitValue,
			totalCost: totalCost,
			remainingQuantity: remainingQuantity,
			originalStock: currentSupply.stock,
			usedPercentage: ((quantity / currentSupply.stock) * 100).toFixed(1),
		});

		// Actualizar la UI con animación
		supplyUsageForm.classList.add("form-exit");

		setTimeout(() => {
			// Actualizar la UI
			updateUsedSuppliesList();
			updateTotals();

			// Resetear el formulario pero mantenerlo visible para facilitar agregar más insumos
			supplyUsageForm.classList.remove("form-exit");
			supplySelect.value = "";
			currentSupply = null;

			// Hacer scroll hacia la sección de insumos para facilitar agregar más
			setTimeout(() => {
				highlightAndScrollToSection('.supply-selection');
			}, 300);

			// Mostrar el mensaje de éxito con animación
			const successToast = document.createElement("div");
			successToast.className = "toast-message success";
			successToast.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Uso de insumo registrado correctamente</span>
            `;
			document.body.appendChild(successToast);

			// Eliminar el toast después de la animación
			setTimeout(() => {
				successToast.classList.add("show");
				setTimeout(() => {
					successToast.classList.remove("show");
					setTimeout(() => {
						successToast.remove();
					}, 300);
				}, 3000);
			}, 10);

			// Desplazar a la lista actualizada
			if (usedSupplies.length > 0) {
				document.querySelector(".selected-items").scrollIntoView({
					behavior: "smooth",
					block: "nearest",
				});
			}
		}, 200);
	});

	// Manejar el ocultamiento del formulario
	hideSupplyUsageFormBtn.addEventListener("click", function () {
		supplyUsageForm.classList.add("hidden");
		currentSupply = null;

		// Hacer scroll hacia la sección de insumos después de ocultar el formulario
		setTimeout(() => {
			highlightAndScrollToSection('.supply-selection');
		}, 300);
	});

	// Actualizar la lista de insumos usados en la UI
	function updateUsedSuppliesList() {
		selectedSuppliesList.innerHTML = "";

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
			const item = document.createElement("div");
			item.className = "selected-item";

			// Calcular el porcentaje de uso para la barra de progreso
			const usagePercentage = (
				(supply.quantity / supply.originalStock) *
				100
			).toFixed(1);
			const remainingPercentage = (
				(supply.remainingQuantity / supply.originalStock) *
				100
			).toFixed(1);

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
                            $${supply.unitValue.toLocaleString("es-ES", {
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														})}
                        </span>
                        <span class="total-cost">
                            <i class="fas fa-calculator"></i>
                            $${supply.totalCost.toLocaleString("es-ES", {
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														})}
                        </span>
                        <div class="stock-indicator">
                            <div class="stock-bar">
                                <div class="stock-used" style="width: ${usagePercentage}%" 
                                     title="${usagePercentage}% del stock total"></div>
                            </div>
                            <span class="stock-text">
                                ${supply.remainingQuantity} ${
				supply.unit
			} restantes
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

		// Añadir event listeners a los botones de eliminación con animación
		document.querySelectorAll(".remove-supply").forEach((btn) => {
			btn.addEventListener("click", function (e) {
				e.stopPropagation();
				const index = parseInt(this.getAttribute("data-index"));
				const removedItem = usedSupplies[index];

				// Añadir animación de eliminación
				const item = this.closest(".selected-item");
				item.style.opacity = "0";
				item.style.transform = "translateX(20px)";

				setTimeout(() => {
					usedSupplies.splice(index, 1);
					updateUsedSuppliesList();
					updateTotals();

					// Mostrar el toast de deshacer
					const toast = document.createElement("div");
					toast.className = "toast-message info";
					toast.innerHTML = `
                        <i class="fas fa-info-circle"></i>
                        <span>Insumo eliminado</span>
                        <button class="undo-btn">
                            <i class="fas fa-undo"></i> Deshacer
                        </button>
                    `;

					document.body.appendChild(toast);

					// Mostrar el toast con animación
					setTimeout(() => {
						toast.classList.add("show");
					}, 10);

					// Manejar el deshacer
					const undoBtn = toast.querySelector(".undo-btn");
					let timeoutId = setTimeout(() => {
						toast.remove();
					}, 5000);

					undoBtn.addEventListener("click", () => {
						clearTimeout(timeoutId);
						usedSupplies.splice(index, 0, removedItem);
						updateUsedSuppliesList();
						updateTotals();
						toast.remove();

						// Desplazar al elemento restaurado
						const items = document.querySelectorAll(".selected-item");
						if (items[index]) {
							items[index].scrollIntoView({
								behavior: "smooth",
								block: "nearest",
							});

							// Resaltar el elemento restaurado
							items[index].classList.add("highlight");
							setTimeout(() => {
								items[index].classList.remove("highlight");
							}, 2000);
						}
					});

					// Auto-eliminar el toast
					toast.addEventListener("click", () => {
						clearTimeout(timeoutId);
						toast.classList.remove("show");
						setTimeout(() => {
							toast.remove();
						}, 300);
					});

					// Auto-eliminar después del tiempo de espera
					timeoutId = setTimeout(() => {
						toast.classList.remove("show");
						setTimeout(() => {
							toast.remove();
						}, 300);
					}, 5000);
				}, 200);
			});
		});
	}

	// Actualizar el total de inversión basado en los insumos usados
	function updateTotals() {
		const totalInvestment = usedSupplies.reduce(
			(sum, supply) => sum + supply.totalCost,
			0
		);
		const estimatedProfit = totalInvestment * 0.3; // 30% de la inversión
		const totalProfit = totalInvestment + estimatedProfit;

		// Formatear números con separadores de miles y 2 decimales
		const formatNumber = (num) =>
			num.toLocaleString("es-ES", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});

		// Actualizar los valores de los inputs
		const totalInversionInput = document.getElementById("totalInversion");
		const gananciaEsperadaInput = document.getElementById("gananciaEsperada");
		const totalVentaInput = document.getElementById("precioVenta");

		totalInversionInput.value = formatNumber(totalInvestment);
		gananciaEsperadaInput.value = formatNumber(estimatedProfit);

		// Auto-actualizar precioVenta si está vacío o coincide con el total anterior
		if (
			!totalVentaInput.value ||
			parseFloat(totalVentaInput.value.replace(/\./g, "").replace(",", ".")) ===
				(parseFloat(totalInversionInput.dataset.lastValue) || 0)
		) {
			totalVentaInput.value = formatNumber(totalProfit);
		}

		// Almacenar el total actual para futuras comparaciones
		totalInversionInput.dataset.lastValue = totalInvestment;

		// Actualizar las tarjetas de resumen
		updateSummaryCards(totalInvestment, estimatedProfit);

		// Actualizar el input oculto para la envío del formulario
		document.getElementById("usedSuppliesInput").value =
			JSON.stringify(usedSupplies);

		// Activar el evento de cambio para cualquier cálculo dependiente
		const event = new Event("change");
		totalInversionInput.dispatchEvent(event);
	}

	// Actualizar las tarjetas de resumen con la información de inversión y ganancias
	function updateSummaryCards(totalInvestment, estimatedProfit) {
		const formatCurrency = (num) =>
			`$${num.toLocaleString("es-ES", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})}`;

		const totalProfit = totalInvestment + estimatedProfit;
		const roi =
			totalInvestment > 0
				? ((estimatedProfit / totalInvestment) * 100).toFixed(1)
				: 0;

		// Crear o actualizar las tarjetas de resumen
		let summaryCards = document.querySelector(".summary-cards");
		if (!summaryCards) {
			summaryCards = document.createElement("div");
			summaryCards.className = "summary-cards";
			const suppliesSection = document.querySelector(
				".form__section--supplies"
			);
			if (suppliesSection) {
				suppliesSection.insertAdjacentElement("afterend", summaryCards);
			}
		}

		summaryCards.innerHTML = `
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-coins"></i>
                </div>
                <div class="summary-details">
                    <h4>Inversión Total</h4>
                    <div class="summary-amount">${formatCurrency(
											totalInvestment
										)}</div>
                    <div class="summary-label">Costo de insumos</div>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon profit">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="summary-details">
                    <h4>Ganancia Esperada</h4>
                    <div class="summary-amount">${formatCurrency(
											estimatedProfit
										)}</div>
                    <div class="summary-label">30% de la inversión</div>
                </div>
            </div>
            <div class="summary-card highlight">
                <div class="summary-icon total">
                    <i class="fas fa-hand-holding-usd"></i>
                </div>
                <div class="summary-details">
                    <h4>Total de Venta</h4>
                    <div class="summary-amount">${formatCurrency(
											totalProfit
										)}</div>
                    <div class="summary-label">Inversión + Ganancia (ROI: ${roi}%)</div>
                </div>
            </div>
        `;
	}

	// Mostrar la notificación de toast
	function showToast(message, type = "info") {
		const toast = document.getElementById("toast");
		if (!toast) return;

		const toastContent = toast.querySelector(".toast-content");
		toastContent.textContent = message;

		// Eliminar las clases de tipo anteriores
		toast.className = "toast";
		toast.classList.add(type);

		// Mostrar el toast
		toast.classList.remove("hidden");

		// Ocultar después de 3 segundos
		setTimeout(() => {
			toast.classList.add("hidden");
		}, 3000);
	}

	// Inicializar el envío del formulario
	const productionForm = document.getElementById("productionForm");
	if (productionForm) {
		productionForm.addEventListener("submit", function (e) {
			e.preventDefault();

			// Añadir los insumos usados al formulario
			const existingSuppliesInput = document.querySelector(
				'input[name="usedSupplies"]'
			);
			if (existingSuppliesInput) {
				existingSuppliesInput.value = JSON.stringify(usedSupplies);
			} else {
				const suppliesInput = document.createElement("input");
				suppliesInput.type = "hidden";
				suppliesInput.name = "usedSupplies";
				suppliesInput.value = JSON.stringify(usedSupplies);
				this.appendChild(suppliesInput);
			}

			// Validar que al menos un insumo esté agregado
			if (usedSupplies.length === 0) {
				showToast("Debe agregar al menos un insumo", "error");
				return;
			}

			// Enviar el formulario
			this.submit();
		});
	}

	// Manejar el botón de ocultar el formulario
	if (hideSupplyUsageFormBtn) {
		hideSupplyUsageFormBtn.addEventListener("click", function () {
			supplyUsageForm.classList.add("hidden");
			currentSupply = null;
			supplySelect.selectedIndex = 0;

			// Hacer scroll hacia la sección de insumos después de ocultar el formulario
			setTimeout(() => {
				highlightAndScrollToSection('.supply-selection');
			}, 300);
		});
	}
});
