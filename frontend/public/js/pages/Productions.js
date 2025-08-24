document.addEventListener("DOMContentLoaded", () => {
	setupCharts()
	setupDropdowns()
	setupModal()
	setupNavigationButtons()
	setupAutoRefresh()
	setupInvestmentCharts()
	setupTabs()
	setupFilters()
	setupPagination()
	setupReportGeneration()
	setupSeleccionMultiple() // Añadir esta línea
  
	// Cargar todos los datos al iniciar
	cargarProducciones()
	cargarCultivos()
	cargarSensores()
	cargarInsumos()
	cargarResponsables()
  })
  
  // Manejo del botón para mostrar/ocultar cards
  document.addEventListener("DOMContentLoaded", () => {
	const toggleCardsBtn = document.getElementById("toggleCardsBtn")
	const cardsContainer = document.getElementById("cardsContainer")
	const buttonText = toggleCardsBtn.querySelector(".button__text")
  
	toggleCardsBtn.addEventListener("click", () => {
	  const isVisible = cardsContainer.style.display === "block"
	  cardsContainer.style.display = isVisible ? "none" : "block"
	  buttonText.textContent = isVisible
		? "Mostrar Widgets con Informacion Adicional"
		: "Ocultar Widgests con Informacion Adicional"
	  toggleCardsBtn.classList.toggle("active")
	})
  })
  
  // Configuración de gráficos
  function setupCharts() {
	// Datos de ejemplo para los gráficos
	const dates = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
	const humidityData = [62, 64, 65, 68, 67, 65, 68]
	const temperatureData = [22, 23, 24, 25, 24, 23, 24]
  
	// Configuración común para los gráficos
	const commonOptions = {
	  responsive: true,
	  maintainAspectRatio: false,
	  plugins: {
		legend: {
		  display: false,
		},
		tooltip: {
		  mode: "index",
		  intersect: false,
		  backgroundColor: "rgba(255, 255, 255, 0.9)",
		  titleColor: "#1e293b",
		  bodyColor: "#1e293b",
		  borderColor: "#e2e8f0",
		  borderWidth: 1,
		  padding: 10,
		  cornerRadius: 4,
		  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
		  callbacks: {
			label: (context) => {
			  let label = ""
			  if (context.dataset.label) {
				label += context.dataset.label + ": "
			  }

			// --- Lógica de actualización de producción (solo para actualizar-produccion.html) ---
			document.addEventListener('DOMContentLoaded', () => {
				if (!window.location.pathname.endsWith('actualizar-produccion.html')) return;

				const form = document.getElementById('productionForm');
				const urlParams = new URLSearchParams(window.location.search);
				const productionId = urlParams.get('id');
				if (!form || !productionId) return;

				// Elementos del formulario
					const cropSelect = document.getElementById('crop');
					const cycleSelect = document.getElementById('cropCycle');
					const responsibleSelect = document.getElementById('responsible');
					const insumosContainer = document.getElementById('selectedSupplies');
					const sensoresContainer = document.getElementById('selectedSensors');
					const startDateInput = document.getElementById('startDate');
					const endDateInput = document.getElementById('endDate');
					const investmentInput = document.getElementById('totalInvestment');
					const profitInput = document.getElementById('estimatedProfit');

				// Cargar datos de la producción a editar
				fetch(`http://localhost:5000/producciones/${productionId}`)
					.then(res => res.json())
					.then(data => {

						// Llenar campos básicos
						form.productionName.value = data.nombre || '';
						form.productionType.value = data.tipo || '';
						form.location.value = data.ubicacion || '';
						form.description.value = data.descripcion || '';
						form.quantity.value = data.cantidad || '';
						if (startDateInput) startDateInput.value = data.fecha_de_inicio ? data.fecha_de_inicio.slice(0,10) : '';
						if (endDateInput) endDateInput.value = data.fecha_fin ? data.fecha_fin.slice(0,10) : '';
						if (investmentInput) investmentInput.value = data.inversion || '';
						if (profitInput) profitInput.value = data.meta_ganancia || '';

						// Llenar selects dinámicos (cultivo, ciclo, responsable)
						fetch('http://localhost:5000/cultivos')
							// Llenar selects dinámicos (cultivo, ciclo, responsable)
							Promise.all([
								fetch('http://localhost:5000/cultivos').then(res => res.json()),
								fetch('http://localhost:5000/ciclos-cultivo').then(res => res.json()),
								fetch('http://localhost:5000/usuarios').then(res => res.json())
							]).then(([cultivos, ciclos, usuarios]) => {
								cropSelect.innerHTML = '<option value="">Seleccione un cultivo</option>' +
									cultivos.map(c => `<option value="${c.id}"${String(c.id) === String(data.cultivo_id) ? ' selected' : ''}>${c.nombre}</option>`).join('');
								cycleSelect.innerHTML = '<option value="">Seleccione un ciclo</option>' +
									ciclos.map(c => `<option value="${c.id}"${String(c.id) === String(data.ciclo_id) ? ' selected' : ''}>${c.nombre}</option>`).join('');
								const listaUsuarios = Array.isArray(usuarios) ? usuarios : usuarios.usuarios;
								responsibleSelect.innerHTML = '<option value="">Seleccione un responsable</option>' +
									listaUsuarios.map(u => `<option value="${u.id}"${String(u.id) === String(data.usuario_id) ? ' selected' : ''}>${u.nombre}</option>`).join('');
							});

							// Llenar insumos seleccionados
							if (Array.isArray(data.insumos) && data.insumos.length > 0) {
								insumosContainer.innerHTML = '';
								data.insumos.forEach(insumo => {
									const item = document.createElement('div');
									item.className = 'insumo-item';
									item.innerHTML = `
										<span>${insumo.nombre} (Cantidad: <input type="number" min="0" value="${insumo.cantidad || ''}" data-insumo-id="${insumo.id}" class="insumo-cantidad-input" style="width:60px">)</span>
										<button type="button" class="remove-insumo-btn" data-insumo-id="${insumo.id}">Quitar</button>
									`;
									insumosContainer.appendChild(item);
								});
							} else {
								insumosContainer.innerHTML = '<span style="color:#888">No hay insumos seleccionados.</span>';
							}

							// Llenar sensores seleccionados
							if (Array.isArray(data.sensores) && data.sensores.length > 0) {
								sensoresContainer.innerHTML = '';
								data.sensores.forEach(sensor => {
									const item = document.createElement('div');
									item.className = 'sensor-item';
									item.innerHTML = `
										<span>${sensor.nombre || sensor.nombre_sensor || 'Sensor'}</span>
										<button type="button" class="remove-sensor-btn" data-sensor-id="${sensor.id}">Quitar</button>
									`;
									sensoresContainer.appendChild(item);
								});
							} else {
								sensoresContainer.innerHTML = '<span style="color:#888">No hay sensores seleccionados.</span>';
							}
				});

					// Guardar cambios (actualizar producción)
					// Cambiar el botón a type submit si es necesario
					const createBtn = document.getElementById('createBtn');
					if (createBtn && createBtn.type !== 'submit') {
						createBtn.type = 'submit';
					}

					form.addEventListener('submit', function (e) {
						e.preventDefault();

						// Validación básica (ya existe en productionUpdateValidator.js, pero por si acaso)
						if (!form.productionName.value.trim() || !form.productionType.value || !form.location.value.trim() || !form.description.value.trim() || !form.quantity.value) {
							alert('Por favor complete todos los campos obligatorios.');
							return;
						}


							// Recolectar insumos y sensores seleccionados
							const insumos = Array.from(insumosContainer.querySelectorAll('.insumo-cantidad-input')).map(input => ({
								id: input.getAttribute('data-insumo-id'),
								cantidad: input.value
							}));
							const sensores = Array.from(sensoresContainer.querySelectorAll('.sensor-item')).map(item => {
								const btn = item.querySelector('.remove-sensor-btn');
								return { id: btn.getAttribute('data-sensor-id') };
							});

							// Mapear a los campos que espera el backend
							const insumos_ids = insumos.map(i => i.id).join(',');
							const sensores_ids = sensores.map(s => s.id).join(',');

							const updatedData = {
								nombre: form.productionName.value.trim(),
								tipo: form.productionType.value,
								ubicacion: form.location.value.trim(),
								descripcion: form.description.value.trim(),
								cantidad: form.quantity.value,
								cultivo_id: cropSelect.value,
								ciclo_id: cycleSelect.value,
								usuario_id: responsibleSelect.value,
								fecha_de_inicio: startDateInput ? startDateInput.value : undefined,
								fecha_fin: endDateInput ? endDateInput.value : undefined,
								inversion: investmentInput ? investmentInput.value : undefined,
								meta_ganancia: profitInput ? profitInput.value : undefined,
								insumos_ids,
								sensores_ids
							};

						fetch(`http://localhost:5000/producciones/${productionId}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(updatedData)
						})
							.then(res => res.json())
							.then(resp => {
								alert('Producción actualizada correctamente.');
								window.location.href = 'listar-producciones.html';
							})
							.catch(err => {
								alert('Error al actualizar la producción.');
							});
					});
			});
			  if (context.parsed.y !== null) {
				label += context.parsed.y + (context.dataset.label.includes("Humedad") ? "%" : "°C")
			  }
			  return label
			},
		  },
		},
	  },
	  scales: {
		x: {
		  grid: {
			display: false,
		  },
		},
		y: {
		  beginAtZero: false,
		  grid: {
			color: "rgba(226, 232, 240, 0.5)",
		  },
		},
	  },
	  elements: {
		line: {
		  tension: 0.4,
		},
		point: {
		  radius: 3,
		  hoverRadius: 5,
		},
	  },
	}
  
	// Gráfico de humedad en el dashboard
	const humidityCtx = document.getElementById("humidityChart")
	if (humidityCtx) {
	  const humidityChart = new Chart(humidityCtx.getContext("2d"), {
		type: "line",
		data: {
		  labels: dates,
		  datasets: [
			{
			  label: "Humedad",
			  data: humidityData,
			  backgroundColor: "rgba(59, 130, 246, 0.2)",
			  borderColor: "rgba(59, 130, 246, 1)",
			  borderWidth: 2,
			  fill: true,
			},
		  ],
		},
		options: {
		  ...commonOptions,
		  scales: {
			...commonOptions.scales,
			y: {
			  ...commonOptions.scales.y,
			  min: Math.min(...humidityData) - 5,
			  max: Math.max(...humidityData) + 5,
			},
		  },
		},
	  })
	}
  
	// Gráfico de temperatura en el dashboard
	const temperatureCtx = document.getElementById("temperatureChart")
	if (temperatureCtx) {
	  const temperatureChart = new Chart(temperatureCtx.getContext("2d"), {
		type: "line",
		data: {
		  labels: dates,
		  datasets: [
			{
			  label: "Temperatura",
			  data: temperatureData,
			  backgroundColor: "rgba(249, 115, 22, 0.2)",
			  borderColor: "rgba(249, 115, 22, 1)",
			  borderWidth: 2,
			  fill: true,
			},
		  ],
		},
		options: {
		  ...commonOptions,
		  scales: {
			...commonOptions.scales,
			y: {
			  ...commonOptions.scales.y,
			  min: Math.min(...temperatureData) - 2,
			  max: Math.max(...temperatureData) + 2,
			},
		  },
		},
	  })
	}
  }
  
  // Configuración de los gráficos de inversión
  function setupInvestmentCharts() {
	// Gráfico de distribución de inversión (pie chart)
	const pieCtx = document.getElementById("investmentPieChart")
	if (pieCtx) {
	  // Destruir el gráfico existente si existe
	  const existingPieChart = Chart.getChart(pieCtx)
	  if (existingPieChart) {
		existingPieChart.destroy()
	  }
  
	  new Chart(pieCtx, {
		type: "pie",
		data: {
		  labels: ["Maíz", "Frijol", "Tomate", "Papa", "Trigo", "Otros"],
		  datasets: [
			{
			  data: [11, 8, 19, 12, 15, 35],
			  backgroundColor: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#94a3b8"],
			  borderWidth: 1,
			  borderColor: "#ffffff",
			},
		  ],
		},
		options: {
		  responsive: true,
		  maintainAspectRatio: false,
		  plugins: {
			legend: {
			  display: true,
			  position: "right",
			  labels: {
				padding: 20,
				usePointStyle: true,
				font: {
				  size: 12,
				},
			  },
			},
			tooltip: {
			  callbacks: {
				label: (context) => {
				  const value = context.parsed
				  const total = context.dataset.data.reduce((a, b) => a + b, 0)
				  const percentage = Math.round((value / total) * 100)
				  const label = context.label
				  return `${label}: ${percentage}% (${value.toLocaleString()} millones)`
				},
			  },
			},
		  },
		  layout: {
			padding: {
			  left: 20,
			  right: 20,
			  top: 20,
			  bottom: 20,
			},
		  },
		},
	  })
	}
  
	// Gráfico de tendencia de inversión (line chart)
	const trendCtx = document.getElementById("investmentTrendChart")
	if (trendCtx) {
	  // Destruir el gráfico existente si existe
	  const existingTrendChart = Chart.getChart(trendCtx)
	  if (existingTrendChart) {
		existingTrendChart.destroy()
	  }
  
	  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
	  const investmentData = [8000000, 7500000, 4000000, 3500000, 6000000, 4500000]
  
	  new Chart(trendCtx, {
		type: "line",
		data: {
		  labels: months,
		  datasets: [
			{
			  label: "Inversión Mensual",
			  data: investmentData,
			  borderColor: "#4f46e5",
			  backgroundColor: "rgba(79, 70, 229, 0.1)",
			  tension: 0.4,
			  fill: true,
			},
		  ],
		},
		options: {
		  responsive: true,
		  maintainAspectRatio: false,
		  plugins: {
			legend: {
			  display: false,
			},
			tooltip: {
			  callbacks: {
				label: (context) => `$${context.parsed.y.toLocaleString()}`,
			  },
			},
		  },
		  scales: {
			y: {
			  beginAtZero: true,
			  ticks: {
				callback: (value) => "$" + value.toLocaleString(),
			  },
			},
		  },
		},
	  })
	}
  }
  
  // Configuración de menús desplegables
  function setupDropdowns() {
	// Menú de usuario
	const userMenuBtn = document.getElementById("userMenuBtn")
	const userDropdown = document.getElementById("userDropdown")
  
	if (userMenuBtn && userDropdown) {
	  userMenuBtn.addEventListener("click", () => {
		userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block"
	  })
	}
  
	// Cerrar menús al hacer clic fuera
	document.addEventListener("click", () => {
	  document.querySelectorAll(".dropdown-menu").forEach((menu) => {
		menu.style.display = "none"
	  })
	})
  }
  
  // Configuración del modal
  function setupModal() {
	const modal = document.getElementById("modalVisualizarCultivo")
	const viewDetailsBtns = document.querySelectorAll(".table__action-button--view")
	const closeModalBtns = document.querySelectorAll(".modal__close")
  
	// Cerrar todos los modales
	function closeAllModals() {
	  document.querySelectorAll(".modal").forEach((modal) => {
		modal.style.display = "none"
	  })
	}
  
	// Setup para cerrar modales
	closeModalBtns.forEach((btn) => {
	  btn.addEventListener("click", function () {
		const modalId = this.getAttribute("data-close")
		let modal
		if (modalId) {
		  modal = document.getElementById(modalId)
		} else {
		  modal = this.closest(".modal")
		}
  
		if (modal) {
		  modal.style.display = "none"
		} else {
		  console.warn("No se encontró el modal para cerrar.")
		}
	  })
	})
  
	// Cerrar modal al hacer clic fuera
	window.addEventListener("click", (e) => {
	  if (e.target.classList.contains("modal")) {
		e.target.style.display = "none"
	  }
	})
  }
  
  // Configuración de los botones de navegación
  function setupNavigationButtons() {
	// Botones para abrir modales
	const navButtons = {
	  productionsBtn: "productionsModal",
	  cropsBtn: "cropsModal",
	  sensorsBtn: "sensorsModal",
	  inputsBtn: "inputsModal",
	  responsablesBtn: "responsablesModal",
	}
  
	// Agregar event listeners a cada botón
	for (const [buttonId, modalId] of Object.entries(navButtons)) {
	  const button = document.getElementById(buttonId)
	  const modal = document.getElementById(modalId)
  
	  if (button && modal) {
		button.addEventListener("click", () => {
		  // Cerrar otros modales
		  document.querySelectorAll(".modal").forEach((m) => {
			m.style.display = "none"
		  })
  
		  // Mostrar el modal correspondiente
		  modal.style.display = "flex"
		})
	  }
	}
  
	// Cerrar modales al hacer clic fuera del contenido
	const modals = document.querySelectorAll(".modal")
	modals.forEach((modal) => {
	  modal.addEventListener("click", function (e) {
		if (e.target === this) {
		  this.style.display = "none"
		}
	  })
	})
  }
  
  // Configuración de actualizaciones automáticas
  function setupAutoRefresh() {
	const updateIntervals = {
	  humidity: 300000, // 5 minutos
	  temperature: 120000, // 2 minutos
	  production: 600000, // 10 minutos
	}
  
	// Actualizar sensores
	setInterval(() => {
	  updateSensorData("humidity", generateRandomData(60, 75))
	  updateProgressBars()
	}, updateIntervals.humidity)
  
	setInterval(() => {
	  updateSensorData("temperature", generateRandomData(20, 28))
	  updateProgressBars()
	}, updateIntervals.temperature)
  
	// Primera actualización inmediata
	updateSensorData("humidity", generateRandomData(60, 75))
	updateSensorData("temperature", generateRandomData(20, 28))
	updateProgressBars()
  }
  
  // Generar datos aleatorios para simulación
  function generateRandomData(min, max) {
	return Math.round((Math.random() * (max - min) + min) * 10) / 10
  }
  
  // Actualizar datos de sensores
  function updateSensorData(type, value) {
	const elements = {
	  humidity: {
		value: document.querySelector(".humidity-card .sensor__value"),
		timestamp: document.querySelector(".humidity-card .sensor__timestamp"),
	  },
	  temperature: {
		value: document.querySelector(".temperature-card .sensor__value"),
		timestamp: document.querySelector(".temperature-card .sensor__timestamp"),
	  },
	}
  
	const sensor = elements[type]
  
	if (sensor.value) {
	  sensor.value.textContent = `${value}${type === "humidity" ? "%" : "°C"}`
	  sensor.value.classList.add("sensor__value--updated")
	  setTimeout(() => sensor.value.classList.remove("sensor__value--updated"), 1000)
	}
  
	if (sensor.timestamp) {
	  sensor.timestamp.textContent = "Última actualización: hace 1 min"
	}
  
	// Actualizar gráficos
	updateCharts(type, value)
  }
  
  // Actualizar barras de progreso
  function updateProgressBars() {
	document.querySelectorAll(".progress__bar").forEach((bar) => {
	  const currentWidth = Number.parseInt(bar.style.width)
	  const randomChange = Math.random() * 10 - 5 // Cambio entre -5 y +5
	  const newWidth = Math.max(0, Math.min(100, currentWidth + randomChange))
  
	  bar.style.width = `${newWidth}%`
  
	  // Actualizar color según el valor
	  if (newWidth > 80) {
		bar.classList.add("progress__bar--warning")
	  } else {
		bar.classList.remove("progress__bar--warning")
	  }
	})
  }
  
  // Actualizar gráficos con nuevos datos
  function updateCharts(type, value) {
	const chartId = type === "humidity" ? "humidityChart" : "temperatureChart"
	const chart = Chart.getChart(chartId)
  
	if (chart) {
	  const newData = chart.data.datasets[0].data
	  newData.shift()
	  newData.push(value)
	  chart.update("none") // Actualizar sin animación
	}
  }
  
  // Manejo de tabs
  function setupTabs() {
	const tabButtons = document.querySelectorAll(".tab-button")
	const tabContents = document.querySelectorAll(".tab-content")
  
	tabButtons.forEach((button) => {
	  button.addEventListener("click", () => {
		// Remover clase active de todos los botones y contenidos
		tabButtons.forEach((btn) => btn.classList.remove("active"))
		tabContents.forEach((content) => (content.style.display = "none"))
  
		// Activar el tab seleccionado
		button.classList.add("active")
		const tabId = button.getAttribute("data-tab")
		const tabContent = document.getElementById(tabId)
		if (tabContent) {
		  tabContent.style.display = "block"
		}
	  })
	})
  }
  
  // Configuración de filtros
  function setupFilters() {
	const filterButton = document.querySelector(".button--filter")
	const filtersPanel = document.querySelector(".filters")
	const closeButton = document.querySelector(".filters__close")
	const searchInput = document.querySelector(".filters__search")
	const stateSelect = document.querySelector('.filters__select[placeholder="Estado"]')
	const cycleSelect = document.querySelector('.filters__select[placeholder="Ciclo"]')
	const clearButton = document.querySelector(".button--clear")
	const tableRows = document.querySelectorAll(".table__row")
  
	// Mostrar/ocultar panel de filtros
	filterButton?.addEventListener("click", () => {
	  filtersPanel?.classList.toggle("hidden")
	})
  
	closeButton?.addEventListener("click", () => {
	  filtersPanel?.classList.add("hidden")
	})
  
	// Función de filtrado
	function filterTable() {
	  const searchTerm = searchInput?.value.toLowerCase()
	  const selectedState = stateSelect?.value
	  const selectedCycle = cycleSelect?.value
  
	  tableRows.forEach((row) => {
		const id = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase()
		const name = row.querySelector("td:nth-child(3)")?.textContent.toLowerCase()
		const state = row.querySelector(".badge--status")?.textContent.trim()
  
		// Aplicar filtros
		const matchesSearch = !searchTerm || id.includes(searchTerm) || name.includes(searchTerm)
  
		const matchesState = !selectedState || state.includes(selectedState)
  
		const matchesCycle = !selectedCycle // Implementar lógica de ciclo si es necesario
  
		// Mostrar u ocultar fila según filtros
		row.style.display = matchesSearch && matchesState && matchesCycle ? "" : "none"
	  })
  
	  updatePaginationAfterFilter()
	}
  
	// Event listeners para filtros
	searchInput?.addEventListener("input", filterTable)
	stateSelect?.addEventListener("change", filterTable)
	cycleSelect?.addEventListener("change", filterTable)
  
	// Limpiar filtros
	clearButton?.addEventListener("click", () => {
	  if (searchInput) searchInput.value = ""
	  if (stateSelect) stateSelect.value = ""
	  if (cycleSelect) cycleSelect.value = ""
	  tableRows.forEach((row) => (row.style.display = ""))
	  updatePaginationAfterFilter()
	})
  }
  
  function setupPagination() {
	const itemsPerPage = 6
	let currentPage = 1
	const tableRows = document.querySelectorAll(".table__row")
	const totalItems = tableRows.length
	const totalPages = Math.ceil(totalItems / itemsPerPage)
  
	// Actualizar la información de paginación
	const paginationInfo = document.querySelector(".pagination__info")
	if (paginationInfo) {
	  paginationInfo.innerHTML = `Mostrando <span class="pagination__items-per-page">${itemsPerPage}</span> de <span class="pagination__total-items">${totalItems}</span> producciones`
	}
  
	// Actualizar los botones de página
	const pageButtons = document.querySelectorAll(
	  ".pagination__button:not(.pagination__button--prev):not(.pagination__button--next)",
	)
	pageButtons.forEach((button, index) => {
	  const pageNum = index + 1
	  button.style.display = pageNum <= totalPages ? "" : "none"
	  button.classList.toggle("pagination__button--active", pageNum === currentPage)
	})
  
	// Actualizar botones prev/next
	const prevBtn = document.querySelector(".pagination__button--prev")
	const nextBtn = document.querySelector(".pagination__button--next")
	if (prevBtn) prevBtn.disabled = currentPage === 1
	if (nextBtn) nextBtn.disabled = currentPage === totalPages
  
	// Mostrar la primera página
	showPage(currentPage)
  
	function showPage(page) {
	  const start = (page - 1) * itemsPerPage
	  const end = start + itemsPerPage
  
	  tableRows.forEach((row, index) => {
		row.style.display = index >= start && index < end ? "" : "none"
	  })
  
	  currentPage = page
  
	  // Actualizar botones activos
	  pageButtons.forEach((button, index) => {
		button.classList.toggle("pagination__button--active", index + 1 === page)
	  })
  
	  // Actualizar botones prev/next
	  if (prevBtn) prevBtn.disabled = page === 1
	  if (nextBtn) nextBtn.disabled = page === totalPages
	}
  
	// Event listeners para botones de paginación
	if (prevBtn) {
	  prevBtn.addEventListener("click", () => {
		if (currentPage > 1) showPage(currentPage - 1)
	  })
	}
  
	if (nextBtn) {
	  nextBtn.addEventListener("click", () => {
		if (currentPage < totalPages) showPage(currentPage + 1)
	  })
	}
  
	pageButtons.forEach((button, index) => {
	  button.addEventListener("click", () => showPage(index + 1))
	})
  }
  
  // Añadir esta función después de setupPagination()
  function setupSeleccionMultiple() {
	const checkboxHeader = document.querySelector(".table__checkbox-header");
	const actionBar = document.querySelector(".actions-bar");
	const enableBtn = document.querySelector(".button--enable");
	const disableBtn = document.querySelector(".button--disable");
	const countSelected = document.querySelector(".actions-bar__count--selected");
	const countTotal = document.querySelector(".actions-bar__count--total");
	
	// Variables para seguimiento
	let seleccionadas = [];
	let totalProducciones = 0;
	
	// Función para actualizar contadores
	function actualizarContadores() {
	  if (countSelected) countSelected.textContent = seleccionadas.length;
	  if (countTotal) countTotal.textContent = totalProducciones;
	  
	  // Mostrar/ocultar barra de acciones según selección
	  if (actionBar) {
		actionBar.classList.toggle("actions-bar--active", seleccionadas.length > 0);
	  }
	}
	
	// Función para actualizar selección
	function actualizarSeleccion() {
	  seleccionadas = [];
	  const checkboxes = document.querySelectorAll(".table__checkbox");
	  totalProducciones = checkboxes.length;
	  
	  checkboxes.forEach(checkbox => {
		if (checkbox.checked) {
		  const row = checkbox.closest(".table__row");
		  const id = row.querySelector("td:nth-child(2)").textContent;
		  seleccionadas.push(id);
		}
	  });
	  
	  actualizarContadores();
	}
	
	// Seleccionar/deseleccionar todos
	if (checkboxHeader) {
	  checkboxHeader.addEventListener("change", function() {
		const checkboxes = document.querySelectorAll(".table__checkbox");
		checkboxes.forEach(checkbox => {
		  checkbox.checked = this.checked;
		});
		actualizarSeleccion();
	  });
	}
	
	// Event delegation para checkboxes individuales
	document.addEventListener("change", function(e) {
	  if (e.target && e.target.classList.contains("table__checkbox")) {
		actualizarSeleccion();
		
		// Actualizar checkbox de cabecera
		if (checkboxHeader) {
		  const checkboxes = document.querySelectorAll(".table__checkbox");
		  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
		  const someChecked = Array.from(checkboxes).some(cb => cb.checked);
		  
		  checkboxHeader.checked = allChecked;
		  checkboxHeader.indeterminate = someChecked && !allChecked;
		}
	  }
	});
	
	// Habilitar producciones seleccionadas
	if (enableBtn) {
	  enableBtn.addEventListener("click", function() {
		if (seleccionadas.length === 0) {
		  mostrarError("No hay producciones seleccionadas");
		  return;
		}
		
		habilitarProduccionesMultiples(seleccionadas);
	  });
	}
	
	// Deshabilitar producciones seleccionadas
	if (disableBtn) {
	  disableBtn.addEventListener("click", function() {
		if (seleccionadas.length === 0) {
		  mostrarError("No hay producciones seleccionadas");
		  return;
		}
		
		deshabilitarProduccionesMultiples(seleccionadas);
	  });
	}
	
	// Inicializar contadores
	actualizarSeleccion();
  }
  
  // Función para habilitar múltiples producciones
  async function habilitarProduccionesMultiples(ids) {
	try {
	  // Mostrar indicador de carga
	  const enableBtn = document.querySelector(".button--enable");
	  if (enableBtn) {
		enableBtn.disabled = true;
		enableBtn.innerHTML = `
		  <span class="spinner"></span>
		  Habilitando...
		`;
	  }
	  
	  // Llamada al endpoint para habilitar múltiples producciones
	  const response = await fetch("http://localhost:5000/producciones/habilitar-multiples", {
		method: "POST",
		headers: {
		  "Content-Type": "application/json"
		},
		body: JSON.stringify({ ids })
	  });
	  
	  if (!response.ok) {
		const data = await response.json();
		throw new Error(data.error || "Error al habilitar producciones");
	  }
	  
	  // Recargar datos
	  await cargarProducciones();
	  
	  // Mostrar mensaje de éxito
	  mostrarMensaje(`${ids.length} producciones habilitadas correctamente`, "success");
	  
	} catch (error) {
	  console.error("Error al habilitar producciones:", error);
	  mostrarError("Error al habilitar producciones: " + error.message);
	} finally {
	  // Restaurar botón
	  const enableBtn = document.querySelector(".button--enable");
	  if (enableBtn) {
		enableBtn.disabled = false;
		enableBtn.innerHTML = `
		  <span class="material-symbols-outlined button__icon">power_settings_new</span>
		  Habilitar
		`;
	  }
	}
  }
  
  // Función para deshabilitar múltiples producciones
  async function deshabilitarProduccionesMultiples(ids) {
	try {
	  // Mostrar indicador de carga
	  const disableBtn = document.querySelector(".button--disable");
	  if (disableBtn) {
		disableBtn.disabled = true;
		disableBtn.innerHTML = `
		  <span class="spinner"></span>
		  Deshabilitando...
		`;
	  }
	  
	  // Llamada al endpoint para deshabilitar múltiples producciones
	  const response = await fetch("http://localhost:5000/producciones/deshabilitar-multiples", {
		method: "POST",
		headers: {
		  "Content-Type": "application/json"
		},
		body: JSON.stringify({ ids })
	  });
	  
	  if (!response.ok) {
		const data = await response.json();
		throw new Error(data.error || "Error al deshabilitar producciones");
	  }
	  
	  // Recargar datos
	  await cargarProducciones();
	  
	  // Mostrar mensaje de éxito
	  mostrarMensaje(`${ids.length} producciones deshabilitadas correctamente`, "success");
	  
	} catch (error) {
	  console.error("Error al deshabilitar producciones:", error);
	  mostrarError("Error al deshabilitar producciones: " + error.message);
	} finally {
	  // Restaurar botón
	  const disableBtn = document.querySelector(".button--disable");
	  if (disableBtn) {
		disableBtn.disabled = false;
		disableBtn.innerHTML = `
		  <span class="material-symbols-outlined button__icon">power_settings_new</span>
		  Deshabilitar
		`;
	  }
	}
  }
  
  // Función para mostrar mensajes de éxito
  function mostrarMensaje(mensaje, tipo = "info") {
	const toast = document.getElementById("toast");
	if (!toast) {
	  console.log(`${tipo.toUpperCase()}: ${mensaje}`);
	  return;
	}
  
	const toastTitle = document.getElementById("toastTitle");
	const toastDescription = document.getElementById("toastDescription");
	const toastIcon = document.getElementById("toastIcon");
  
	if (toastTitle) toastTitle.textContent = tipo === "success" ? "Éxito" : "Información";
	if (toastDescription) toastDescription.textContent = mensaje;
	if (toastIcon) {
	  toastIcon.className = tipo === "success" 
		? "fas fa-check-circle" 
		: "fas fa-info-circle";
	}
  
	toast.className = `toast toast--${tipo}`;
	toast.classList.remove("hidden");
  
	setTimeout(() => {
	  toast.classList.add("hidden");
	}, 5000);
  }
  
  // Función para actualizar la paginación después de filtrar
  function updatePaginationAfterFilter() {
	const visibleRows = document.querySelectorAll('.table__row:not([style*="display: none"])')
	const totalItems = visibleRows.length
	const itemsPerPage = 6
  
	document.querySelector(".pagination__total-items").textContent = totalItems
	document.querySelector(".pagination__total-pages").textContent = Math.ceil(totalItems / itemsPerPage)
  
	// Resetear a la primera página
	const paginationEvent = new Event("paginationReset")
	document.dispatchEvent(paginationEvent)
  }
  
  function setupReportGeneration() {
	const reportModal = document.getElementById("reportModal")
	const reportBtn = document.querySelector(".button--report")
	const cancelReportBtn = document.getElementById("cancelReportBtn")
	const generateReportBtn = document.getElementById("generateReportBtn")
	const closeReportModal = document.getElementById("closeReportModal")
  
	// Mostrar modal
	reportBtn?.addEventListener("click", () => {
	  reportModal.style.display = "flex"
	})
  
	// Cerrar modal
	;[cancelReportBtn, closeReportModal].forEach((btn) => {
	  btn?.addEventListener("click", () => {
		reportModal.style.display = "none"
	  })
	})
  
	// Generar reporte
	document.getElementById("reportForm")?.addEventListener("submit", (e) => {
	  e.preventDefault()
	  const includeInactive = document.getElementById("includeInactive").checked
	  const includeDetails = document.getElementById("includeDetails").checked
  
	  // Obtener datos de la tabla
	  const rows = Array.from(document.querySelectorAll(".table__row"))
	  const reportData = rows
		.filter((row) => {
		  if (!includeInactive && row.querySelector(".badge--inactive")) {
			return false
		  }
		  return row.style.display !== "none"
		})
		.map((row) => ({
		  id: row.querySelector("td:nth-child(2)").textContent,
		  nombre: row.querySelector("td:nth-child(3)").textContent,
		  responsable: row.querySelector("td:nth-child(4)").textContent,
		  cultivo: row.querySelector("td:nth-child(5)").textContent,
		  inversion: row.querySelector("td:nth-child(6)").textContent,
		  progreso: row.querySelector(".progress__text").textContent,
		  estado: row.querySelector(".badge--status").textContent.trim(),
		}))
  
	  // Agregar BOM para UTF-8
	  const BOM = "\uFEFF"
  
	  // Generar CSV con headers en español
	  let csv = BOM
	  if (includeDetails) {
		csv += "Identificador,Nombre,Responsable,Cultivo,Inversión,Progreso,Estado\n"
		reportData.forEach((item) => {
		  csv += `"${item.id}","${item.nombre}","${item.responsable}","${item.cultivo}","${item.inversion}","${item.progreso}","${item.estado}"\n`
		})
	  } else {
		csv += "Identificador,Nombre,Estado\n"
		reportData.forEach((item) => {
		  csv += `"${item.id}","${item.nombre}","${item.estado}"\n`
		})
	  }
  
	  // Crear y descargar archivo con nombre en español
	  const fecha = new Date().toLocaleDateString("es-ES").replace(/\//g, "-")
	  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
	  const link = document.createElement("a")
	  const url = URL.createObjectURL(blob)
	  link.setAttribute("href", url)
	  link.setAttribute("download", `reporte_producciones_${fecha}.csv`)
	  document.body.appendChild(link)
	  link.click()
	  document.body.removeChild(link)
	  URL.revokeObjectURL(url)
	  reportModal.style.display = "none"
	})
  
	// Cerrar modal al hacer clic fuera
	window.addEventListener("click", (e) => {
	  if (e.target === reportModal) {
		reportModal.style.display = "none"
	  }
	})
  }
  
  // Función para mostrar errores
  function mostrarError(mensaje) {
	const toast = document.getElementById("toast")
	if (!toast) {
	  console.error("Error:", mensaje)
	  return
	}
  
	const toastTitle = document.getElementById("toastTitle")
	const toastDescription = document.getElementById("toastDescription")
	const toastIcon = document.getElementById("toastIcon")
  
	if (toastTitle) toastTitle.textContent = "Error"
	if (toastDescription) toastDescription.textContent = mensaje
	if (toastIcon) toastIcon.className = "fas fa-exclamation-circle"
  
	toast.classList.remove("hidden")
  
	setTimeout(() => {
	  toast.classList.add("hidden")
	}, 5000)
  }
  
  // Función para cargar producciones desde la API
  async function cargarProducciones() {
	try {
	  const response = await fetch("http://localhost:5000/producciones")
	  const producciones = await response.json()
  
	  if (!response.ok) {
		throw new Error(producciones.error || "Error al cargar producciones")
	  }
  
	  const fechaActual = new Date().toISOString().slice(0, 10)
  
	  const produccionesConProgreso = producciones.map((produccion) => {
		// Calcular progreso basado en fechas
		let progreso = 0
		if (produccion.fecha_de_inicio && produccion.fecha_fin) {
		  const fechaInicio = new Date(produccion.fecha_de_inicio)
		  const fechaFin = new Date(produccion.fecha_fin)
		  const tiempoTotal = fechaFin.getTime() - fechaInicio.getTime()
		  const tiempoTranscurrido = new Date(fechaActual).getTime() - fechaInicio.getTime()
  
		  if (tiempoTotal <= 0) {
			progreso = 100
		  } else if (tiempoTranscurrido < 0) {
			progreso = 0
		  } else {
			progreso = Math.min(100, Math.round((tiempoTranscurrido / tiempoTotal) * 100))
		  }
		}
  
		return {
		  ...produccion,
		  progreso: progreso,
		}
	  })
  
	  actualizarTablaProducciones(produccionesConProgreso)
	  setupSeleccionMultiple()
  
	  // Actualizar contador en el dashboard si existe
	  const totalProduccionesElement = document.querySelector(".stat-card__value")
	  if (totalProduccionesElement) {
		totalProduccionesElement.textContent = producciones.length
	  }
	} catch (error) {
	  console.error("Error al cargar producciones:", error)
	  mostrarError("Error al cargar producciones: " + error.message)
  
	  // Mostrar mensaje en la tabla
	  const tbody = document.querySelector(".table__body")
	  if (tbody) {
		tbody.innerHTML = `
		  <tr class="table__row">
			<td colspan="9" class="table__cell table__cell--error">
			  <div class="error-message">
				<span class="material-symbols-outlined">error</span>
				<p>${error.message}</p>
				<button class="button button--retry" onclick="cargarProducciones()">
				  <span class="material-symbols-outlined">refresh</span>
				  Reintentar
				</button>
			  </div>
			</td>
		  </tr>
		`
	  }
	}
  }
  
  // Función para actualizar la tabla con los datos de las producciones
  function actualizarTablaProducciones(producciones) {
	const tbody = document.querySelector(".table__body")
	if (!tbody) return
  
	tbody.innerHTML = ""
  
	producciones.forEach((produccion) => {
	  const row = document.createElement("tr")
	  row.className = "table__row"
  
	  row.innerHTML = `
		<td class="table__cell table__cell--checkbox">
		  <input type="checkbox" class="table__checkbox" />
		</td>
		<td class="table__cell">${produccion.id}</td>
		<td class="table__cell">${produccion.nombre}</td>
		<td class="table__cell">${produccion.nombre_usuario || "No asignado"}</td>
		<td class="table__cell">${produccion.nombre_cultivo || "No asignado"}</td>
		<td class="table__cell">$${produccion.inversion || "0"}</td>
		<td class="table__cell">
		  <div class="progress progress--small">
			<div class="progress__bar" style="width: ${produccion.progreso}%"></div>
		  </div>
		  <span class="progress__text">${produccion.progreso}%</span>
		</td>
		<td class="table__cell">
		  <span class="badge badge--status ${produccion.estado === "habilitado" ? "badge--active" : "badge--inactive"}">
			<span class="material-symbols-outlined">${produccion.estado === "habilitado" ? "check_circle" : "cancel"}</span>
			${produccion.estado}
		  </span>
		</td>
		<td class="table__cell table__cell--actions">
		  <button class="table__action-button table__action-button--view" data-id="${produccion.id}">
			<span class="material-symbols-outlined">visibility</span>
		  </button>

		  
          <a href="../views/actualizar-produccion.html?id=${produccion.id}" class="table__action-button-wrapper">
            <button class="table__action-button table__action-button--edit"><span class="material-symbols-outlined">edit</span></button>
          </a>
        
		  
		  <button class="table__action-button table__action-button--disable" data-id="${produccion.id}">
			<span class="material-symbols-outlined">power_settings_new</span>
		  </button>
		  
		</td>
	  `
  
	  // Agregar event listeners a los botones
	  const viewBtn = row.querySelector(".table__action-button--view")
	  const disableBtn = row.querySelector(".table__action-button--disable")
  
	  viewBtn.addEventListener("click", () => verDetallesProduccion(produccion.id))
	  disableBtn.addEventListener("click", () => cambiarEstadoProduccion(produccion.id, produccion.estado))
  
	  tbody.appendChild(row)
	})
  
	// Inicializar la paginación después de cargar los datos
	setupPagination()
	
	// Reiniciar selección múltiple
	const checkboxHeader = document.querySelector(".table__checkbox-header");
	if (checkboxHeader) {
	  checkboxHeader.checked = false;
	  checkboxHeader.indeterminate = false;
	}
	
	// Actualizar contadores de selección
	if (typeof setupSeleccionMultiple === 'function') {
	  setupSeleccionMultiple();
	}
  }
  
  // Función para ver detalles de una producción
  async function verDetallesProduccion(id) {
	try {
	  const response = await fetch(`http://localhost:5000/producciones/${id}`);
	  const produccion = await response.json();
  
	  if (!response.ok) {
		throw new Error(produccion.error || "Error al cargar detalles de la producción");
	  }
  
	  // Calcular progreso basado en fechas
	  let progreso = 0;
	  if (produccion.fecha_de_inicio && produccion.fecha_fin) {
		const fechaActual = new Date();
		const fechaInicio = new Date(produccion.fecha_de_inicio);
		const fechaFin = new Date(produccion.fecha_fin);
		const tiempoTotal = fechaFin.getTime() - fechaInicio.getTime();
		const tiempoTranscurrido = fechaActual.getTime() - fechaInicio.getTime();
  
		if (tiempoTotal <= 0) {
		  progreso = 100;
		} else if (tiempoTranscurrido < 0) {
		  progreso = 0;
		} else {
		  progreso = Math.min(100, Math.round((tiempoTranscurrido / tiempoTotal) * 100));
		}
	  }
  
	  // Mostrar modal de detalles
	  const modal = document.getElementById("modalVisualizarCultivo");
	  if (!modal) {
		throw new Error("No se encontró el modal de detalles");
	  }
  
	  // Función para actualizar el texto de un elemento de forma segura
	  const actualizarTexto = (elementId, texto) => {
		const elemento = document.getElementById(elementId);
		if (elemento) {
		  elemento.textContent = texto;
		} else {
		  console.warn(`Elemento con ID "${elementId}" no encontrado en el modal.`);
		}
	  };
  
	  // Actualizar datos básicos de forma segura
	  actualizarTexto("cultivoId", produccion.id);
	  actualizarTexto("cultivoNombre", produccion.nombre);
	  actualizarTexto("cultivoResponsable", produccion.nombre_usuario || "No asignado");
	  actualizarTexto("cultivoTipo", produccion.tipo || "No definido");
	  actualizarTexto("cultivoUbicacion", produccion.ubicacion || "No definida");
	  actualizarTexto("cultivoDescripcion", produccion.descripcion || "Sin descripción");
	  actualizarTexto("nombreCultivo", produccion.nombre_cultivo || "No definido");
	  actualizarTexto("nombreCiclo", produccion.nombre_ciclo || "No definido");
	  
	  // Actualizar datos financieros
	  actualizarTexto("cultivoInversion", `$${parseFloat(produccion.inversion || 0).toFixed(2)}`);
	  actualizarTexto("cultivoMetaGanancia", `$${parseFloat(produccion.meta_ganancia || 0).toFixed(2)}`);
	  
	  // Calcular ROI
	  const roi = produccion.meta_ganancia && produccion.inversion
		? Math.round(((parseFloat(produccion.meta_ganancia) - parseFloat(produccion.inversion)) / parseFloat(produccion.inversion)) * 100)
		: 0;
	  actualizarTexto("cultivoROI", `${roi}%`);
	  
	  // Actualizar fechas
	  actualizarTexto("cultivoFechaInicio", produccion.fecha_de_inicio 
		? new Date(produccion.fecha_de_inicio).toLocaleDateString() 
		: "No definida");
	  actualizarTexto("cultivoFechaFin", produccion.fecha_fin 
		? new Date(produccion.fecha_fin).toLocaleDateString() 
		: "No definida");
	  
	  // Actualizar estado
	  const estadoElement = document.getElementById("cultivoEstado");
	  if (estadoElement) {
		estadoElement.textContent = produccion.estado;
		estadoElement.className = `badge badge--status ${produccion.estado === "habilitado" ? "badge--active" : "badge--inactive"}`;
		
		const iconElement = estadoElement.querySelector(".material-symbols-outlined");
		if (iconElement) {
		  iconElement.textContent = produccion.estado === "habilitado" ? "check_circle" : "cancel";
		} else {
		  // Si no existe el elemento de icono, lo creamos
		  const icon = document.createElement("span");
		  icon.className = "material-symbols-outlined";
		  icon.textContent = produccion.estado === "habilitado" ? "check_circle" : "cancel";
		  estadoElement.prepend(icon);
		}
	  }
	  
	  // Actualizar barra de progreso
	  actualizarTexto("cultivoProgreso", `${progreso}%`);
	  const progressBar = document.querySelector(".cultivo-progress .progress__bar");
	  if (progressBar) {
		progressBar.style.width = `${progreso}%`;
		if (progreso > 80) {
		  progressBar.classList.add("progress__bar--warning");
		} else {
		  progressBar.classList.remove("progress__bar--warning");
		}
	  }
  
	  // Actualizar lista de insumos
	  const listaInsumos = document.getElementById("listaInsumos");
	  if (listaInsumos) {
		listaInsumos.innerHTML = "";
		
		// Mostrar mensaje de carga
		listaInsumos.innerHTML = '<li class="insumo-item insumo-item--loading">Cargando insumos...</li>';
		
		// Mostrar insumos seleccionados
		if (produccion.insumos && produccion.insumos.length > 0) {
		  console.log('Datos de insumos recibidos:', JSON.stringify(produccion.insumos, null, 2));
		  // Array para almacenar las promesas de las peticiones de insumos
		  const promesasInsumos = produccion.insumos.map(insumo => {
			console.log('Insumo original:', JSON.stringify(insumo, null, 2));
			// Siempre hacemos una petición para obtener los datos completos del insumo
			// para asegurarnos de tener el tipo
			
			console.log('Solicitando datos completos para insumo ID:', insumo.id || insumo.insumo_id);
			// Si no, hacemos una petición para obtener los datos completos del insumo
			return fetch(`http://localhost:5000/insumos/${insumo.id || insumo.insumo_id}`)
			  .then(response => {
				if (!response.ok) {
				  throw new Error('Error al cargar el insumo');
				}
				return response.json();
			  })
			  .then(datosInsumo => {
				console.log('Respuesta de la API para insumo:', JSON.stringify(datosInsumo, null, 2));
				const insumoData = datosInsumo.insumo || datosInsumo;
				console.log('Datos procesados del insumo:', insumoData);
				const tipo = insumoData.tipo || insumoData.tipo_insumo || 'No especificado';
				console.log('Tipo detectado:', tipo);
				return {
				  ...insumo,
				  ...insumoData,
				  tipo: tipo,
				  cantidad_utilizada: insumo.cantidad || insumo.cantidad_usar || insumo.cantidad_utilizada || 0
				};
			  })
			  .catch(error => {
				console.error('Error al cargar el insumo:', error);
				return {
				  ...insumo,
				  nombre: insumo.nombre || 'Error al cargar',
				  tipo: insumo.tipo || 'No especificado',
				  cantidad_utilizada: insumo.cantidad || insumo.cantidad_usar || insumo.cantidad_utilizada || 0
				};
			  });
		  });
		  
		  // Cuando todas las peticiones de insumos se completen
		  Promise.all(promesasInsumos).then(insumosCompletos => {
			// Limpiar el mensaje de carga
			listaInsumos.innerHTML = '';
			
			// Mostrar cada insumo
			insumosCompletos.forEach(insumo => {
			  const listItem = document.createElement("li");
			  listItem.className = "insumo-item";
			  
			  // Asegurarse de que los valores no sean undefined
			  const nombre = insumo.nombre || insumo.nombre_insumo || 'Sin nombre';
			  // Usar el campo tipo del insumo
			  const tipo = insumo.tipo || insumo.tipo_insumo || insumo.categoria || 'Sin tipo';
			  const valor = parseFloat(insumo.valor_total || insumo.valor_unitario || 0).toFixed(2);
			  const cantidad = insumo.cantidad || insumo.cantidad_usar || insumo.cantidad_utilizada || 0;
			  const unidad = insumo.unidad_medida || insumo.unidad || 'unidades';
			  
			  listItem.innerHTML = `
				<div class="insumo-item__header">
				  <span class="insumo-item__name">${nombre}</span>
				</div>
				<div class="insumo-item__details">
				  <div class="insumo-detail">
					<span class="insumo-label">Tipo:${tipo}</span>
				  </div>
				  <div class="insumo-detail">
					<span class="insumo-label">Valor unitario: $${parseFloat(insumo.valor_unitario || 0).toFixed(2)}</span>
				  </div>
				  <div class="insumo-detail">
					<span class="insumo-label">Cantidad usada: ${cantidad} ${unidad}</span>
				  </div>
				</div>
			  `;
			  listaInsumos.appendChild(listItem);
			});
		  }).catch(error => {
			console.error('Error al cargar los insumos:', error);
			listaInsumos.innerHTML = '<li class="insumo-item insumo-item--error">Error al cargar los insumos. Intente nuevamente.</li>';
		  });
		} else {
		  const listItem = document.createElement("li");
		  listItem.className = "insumo-item insumo-item--empty";
		  listItem.textContent = "No se han registrado insumos para esta producción.";
		  listaInsumos.appendChild(listItem);
		}
	  }

  
	  // Actualizar lista de sensores
	  const listaSensores = document.getElementById("listaSensores");
	  if (listaSensores) {
		listaSensores.innerHTML = "";
		console.log('Datos de sensores recibidos:', JSON.stringify(produccion.sensores, null, 2));
		if (produccion.sensores && produccion.sensores.length > 0) {
		  // Hacer una petición para obtener los datos completos de cada sensor
		  const promesasSensores = produccion.sensores.map(sensor => {
			console.log('Procesando sensor:', JSON.stringify(sensor, null, 2));
			
			// Si ya tenemos todos los datos necesarios, los usamos directamente
			if (sensor.id && sensor.nombre_sensor && sensor.tipo_sensor) {
			  return Promise.resolve({
				...sensor,
				nombre: sensor.nombre_sensor || sensor.nombre || 'Sensor sin nombre',
				tipo: sensor.tipo_sensor || 'Sin tipo',
				unidad: sensor.unidad_medida || 'N/A',
				escaneo: sensor.tiempo_escaneo || 'No especificado'
			  });
			}
			
			// Si no, hacemos una petición para obtener los datos completos del sensor
			return fetch(`http://localhost:5000/sensor/${sensor.id || sensor.sensor_id}`)
			  .then(response => {
				if (!response.ok) {
				  throw new Error('Error al cargar el sensor');
				}
				return response.json();
			  })
			  .then(datosSensor => {
				const sensorData = datosSensor.sensor || datosSensor;
				console.log('Datos completos del sensor:', sensorData);
				return {
				  ...sensor,
				  ...sensorData,
				  nombre: sensorData.nombre_sensor || sensorData.nombre || 'Sensor sin nombre',
				  tipo: sensorData.tipo_sensor || 'Sin tipo',
				  unidad: sensorData.unidad_medida || 'N/A',
				  escaneo: sensorData.tiempo_escaneo || 'No especificado'
				};
			  })
			  .catch(error => {
				console.error('Error al cargar el sensor:', error);
				return {
				  ...sensor,
				  nombre: sensor.nombre_sensor || sensor.nombre || 'Error al cargar',
				  tipo: 'Error',
				  unidad: 'N/A',
				  escaneo: 'No disponible'
				};
			  });
		  });
		  
		  // Cuando todas las peticiones de sensores se completen
		  Promise.all(promesasSensores).then(async (sensoresCompletos) => {
			// Limpiar el mensaje de carga
			listaSensores.innerHTML = '';
			
			// Función para obtener los detalles completos de un sensor
			const fetchSensorDetails = async (sensorId) => {
			  try {
				const response = await fetch(`http://localhost:5000/sensor/${sensorId}`);
				if (!response.ok) {
				  throw new Error('Error al cargar los detalles del sensor');
				}
				const data = await response.json();
				return data.sensor || data; // Asegurarse de manejar ambos formatos de respuesta
			  } catch (error) {
				console.error('Error al cargar detalles del sensor:', error);
				return null;
			  }
			};

			// Mostrar cada sensor
			const loadSensors = async () => {
			  for (const sensor of sensoresCompletos) {
				const listItem = document.createElement("li");
				listItem.className = "sensor-item";
				
				// Mostrar mensaje de carga temporal
				listItem.innerHTML = `
				  <div class="sensor-item__header">
					<span class="sensor-item__name">${sensor.nombre_sensor || sensor.nombre || 'Cargando...'}</span>
				  </div>
				`;
				listaSensores.appendChild(listItem);

				try {
				  // Obtener detalles completos del sensor
				  const sensorCompleto = await fetchSensorDetails(sensor.id || sensor.sensor_id);
				  
				  // Usar los datos completos si están disponibles, de lo contrario usar los datos básicos
				  const datosSensor = sensorCompleto || sensor;
				  
				  // Formatear los valores para mostrar
				  const tipoSensor = datosSensor.tipo_sensor || 'No especificado';
				  const unidadMedida = datosSensor.unidad_medida || 'No especificada';
				  const tiempoEscaneo = datosSensor.tiempo_escaneo || 'No especificado';
				  
				  // Actualizar el elemento con los detalles completos
				  listItem.innerHTML = `
					<div class="sensor-item__header">
					  <span class="sensor-item__name">${datosSensor.nombre_sensor || datosSensor.nombre || 'Sensor sin nombre'}</span>
					</div>
					<div class="sensor-item__details">
					  <div class="sensor-detail">
						<span class="sensor-label">Tipo: ${tipoSensor}</span>
					  </div>
					  <div class="sensor-detail">
						<span class="sensor-label">Unidad de medida: ${unidadMedida}</span>
					  </div>
					  <div class="sensor-detail">
						<span class="sensor-label">Tiempo de escaneo: ${tiempoEscaneo}</span>
					  </div>
					</div>
				  `;
				} catch (error) {
				  console.error('Error al cargar el sensor:', error);
				  listItem.innerHTML = `
					<div class="sensor-item__header">
					  <span class="sensor-item__name">${sensor.nombre_sensor || sensor.nombre || 'Error al cargar'}</span>
					</div>
					<div class="sensor-item__details">
					  <div class="sensor-detail sensor-detail--error">
						Error al cargar los detalles del sensor
					  </div>
					</div>
				  `;
				}
			  }
			};

			// Iniciar la carga de sensores
			await loadSensors();
		  }).catch(error => {
			console.error('Error al cargar los sensores:', error);
			listaSensores.innerHTML = '<li class="sensor-item sensor-item--error">Error al cargar los sensores. Intente nuevamente.</li>';
		  });
		} else {
		  const listItem = document.createElement("li");
		  listItem.className = "sensor-item sensor-item--empty";
		  listItem.textContent = "No se han registrado sensores para esta producción.";
		  listaSensores.appendChild(listItem);
		}
	  }
  
	  // Mostrar el modal
	  modal.style.display = "flex";
	} catch (error) {
	  console.error("Error al cargar detalles:", error);
	  mostrarError("Error al cargar detalles de la producción: " + error.message);
	}
  }
  
  async function cambiarEstadoProduccion(id, estadoActual) {
	try {
  
	  const response = await fetch(`http://localhost:5000/producciones/${id}/estado`, {
		method: "PUT",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({ estado: estadoActual }),
	  });
  
	  if (!response.ok) {
		const data = await response.json();
		throw new Error(data.error || "Error al cambiar el estado");
	  }
  
	  // Recargar los datos
	  cargarProducciones();
	} catch (error) {
	  console.error("Error al cambiar estado:", error);
	  mostrarError("Error al cambiar el estado de la producción: " + error.message);
	}
  }
  
  // Función para cargar cultivos desde la API
  async function cargarCultivos() {
	try {
	  const response = await fetch("http://localhost:5000/cultivos");
	  const cultivos = await response.json();
  
	  if (!response.ok) {
		throw new Error(cultivos.error || "Error al cargar cultivos");
	  }
  
	  actualizarListaCultivos(cultivos.cultivos);
	} catch (error) {
	  console.error("Error al cargar cultivos:", error);
	  mostrarError("Error al cargar cultivos: " + error.message);
  
	  // Mostrar mensaje de error en la lista
	  const listContainer = document.querySelector("#cultivos .list-group");
	  if (listContainer) {
		listContainer.innerHTML = `
		  <div class="error-message">
			<span class="material-symbols-outlined">error</span>
			<p>${error.message}</p>
			<button class="button button--retry" onclick="cargarCultivos()">
			  <span class="material-symbols-outlined">refresh</span>
			  Reintentar
			</button>
		  </div>
		`;
	  }
	}
  }
  
  // Función para actualizar la lista de cultivos
  function actualizarListaCultivos(cultivos) {
	const listContainer = document.querySelector("#cultivos .list-group");
	if (!listContainer) return;
  
	listContainer.innerHTML = "";
	cultivos.forEach((cultivo) => {
	  // Obtener producciones asociadas a este cultivo
	  fetch(`http://localhost:5000/producciones/cultivo/${cultivo.cultivoId}`)
		.then((response) => response.json())
		.then((producciones) => {
		  const listItem = document.createElement("div");
		  listItem.className = "list-group__item";
  
		  listItem.innerHTML = `
			<div class="list-group__header">
			  <h3 class="list-group__title">${cultivo.nombre}</h3>
			  <span class="badge badge--green">${producciones.producciones.length} producciones</span>
			</div>
			<div class="list-group__content">
			  <div class="list-group__description">
				${cultivo.descripcion || `Cultivo de ${cultivo.nombre}`}
			  </div>
			  <div class="list-group__associated">
				<div class="list-group__label">
				  Producciones asociadas:
				</div>
				<ul class="list-group__items">
				  ${
					producciones.producciones.length > 0
					  ? producciones.producciones.map((p) => `<li>${p.nombre}</li>`).join("")
					  : "<li>No hay producciones asociadas</li>"
				  }
				</ul>
			  </div>
			</div>
		  `;
  
		  listContainer.appendChild(listItem);
		})
		.catch((error) => {
		  console.error("Error al cargar producciones por cultivo:", error);
  
		  const listItem = document.createElement("div");
		  listItem.className = "list-group__item";
  
		  listItem.innerHTML = `
			<div class="list-group__header">
			  <h3 class="list-group__title">${cultivo.nombre}</h3>
			  <span class="badge badge--warning">Error al cargar producciones</span>
			</div>
			<div class="list-group__content">
			  <div class="list-group__description">
				${cultivo.descripcion || `Cultivo de ${cultivo.nombre}`}
			  </div>
			</div>
		  `;
  
		  listContainer.appendChild(listItem);
		});
	});
  }
  
  // Función para cargar sensores desde la API
  async function cargarSensores() {
	try {
	  const response = await fetch("http://localhost:5000/sensor");
	  const sensores = await response.json();
  
	  if (!response.ok) {
		throw new Error(sensores.error || "Error al cargar sensores");
	  }
  
	  actualizarListaSensores(sensores.sensores);
	} catch (error) {
	  console.error("Error al cargar sensores:", error);
	  mostrarError("Error al cargar sensores: " + error.message);
  
	  // Mostrar mensaje de error en la lista
	  const listContainer = document.querySelector("#sensores .list-group");
	  if (listContainer) {
		listContainer.innerHTML = `
		  <div class="error-message">
			<span class="material-symbols-outlined">error</span>
			<p>${error.message}</p>
			<button class="button button--retry" onclick="cargarSensores()">
			  <span class="material-symbols-outlined">refresh</span>
			  Reintentar
			</button>
		  </div>
		`;
	  }
	}
  }
  
  // Función para actualizar la lista de sensores
  function actualizarListaSensores(sensores) {
	const listContainer = document.querySelector("#sensores .list-group");
	if (!listContainer) return;
  
	listContainer.innerHTML = "";
  
	// Agrupar sensores por tipo
	const sensoresPorTipo = {};
	sensores.forEach((sensor) => {
	  if (!sensoresPorTipo[sensor.tipo_sensor]) {
		sensoresPorTipo[sensor.tipo_sensor] = [];
	  }
	  sensoresPorTipo[sensor.tipo_sensor].push(sensor);
	});
  
	// Crear elementos para cada tipo de sensor
	Object.entries(sensoresPorTipo).forEach(([tipo, sensoresDelTipo]) => {
	  const listItem = document.createElement("div");
	  listItem.className = "list-group__item";
  
	  let produccionesHTML = "Cargando producciones..."; // Placeholder inicial
  
	  listItem.innerHTML = `
		<div class="list-group__header">
		  <h3 class="list-group__title">${tipo}</h3>
		  <span class="badge badge--green">${sensoresDelTipo.length} instalados</span>
		</div>
		<div class="list-group__content">
		  <div class="list-group__description">
			${sensoresDelTipo[0].descripcion || `Sensores de ${tipo}`}
		  </div>
		  <div class="list-group__associated">
			<div class="list-group__label">
			  Producciones asociadas:
			</div>
			<ul class="list-group__items">
			  ${produccionesHTML} 
			</ul>
		  </div>
		</div>
	  `;
  
	  listContainer.appendChild(listItem);
  
	  // Fetch producciones asociadas para el sensor
	  const sensorId = sensoresDelTipo[0].id; 
	  fetch(`http://localhost:5000/producciones/sensor/${sensorId}`)  
		.then(response => {
		  if (!response.ok) {
			throw new Error(`Error al obtener producciones: ${response.status}`);
		  }
		  return response.json();
		})
		.then(data => {
		  const producciones = data.producciones;
		  if (producciones && producciones.length > 0) {
			produccionesHTML = producciones
			  .map(
				(p) => `<li>${p.nombre}</li>`
			  )
			  .join("");
		  } else {
			produccionesHTML = "<li>Ninguna producción asociada</li>";
		  }
		  // Actualiza el HTML dentro del listItem
		  const produccionesListElement = listItem.querySelector(".list-group__items");
		  if (produccionesListElement) {
			produccionesListElement.innerHTML = produccionesHTML;
		  }
		})
		.catch(error => {
		  console.error("Error al obtener producciones:", error);
		  produccionesHTML = "<li>Error al cargar producciones</li>";
		  const produccionesListElement = listItem.querySelector(".list-group__items");
		  if (produccionesListElement) {
			produccionesListElement.innerHTML = produccionesHTML;
		  }
		});
	});
  }
  
  // Función para cargar insumos desde la API
  async function cargarInsumos() {
	try {
	  const response = await fetch("http://localhost:5000/insumos");
	  const insumos = await response.json();
	  if (!response.ok) {
		throw new Error(insumos.error || "Error al cargar insumos");
	  }
	  
	  actualizarListaInsumos(insumos);
	} catch (error) {
	  console.error("Error al cargar insumos:", error);
	  mostrarError("Error al cargar insumos: " + error.message);
  
	  // Mostrar mensaje de error en la lista
	  const listContainer = document.querySelector("#insumos .list-group");
	  if (listContainer) {
		listContainer.innerHTML = `
		  <div class="error-message">
			<span class="material-symbols-outlined">error</span>
			<p>${error.message}</p>
			<button class="button button--retry" onclick="cargarInsumos()">
			  <span class="material-symbols-outlined">refresh</span>
			  Reintentar
			</button>
		  </div>
		`;
	  }
	}
  }
  
  // Función para actualizar la lista de insumos
  function actualizarListaInsumos(insumos) {
	const listContainer = document.querySelector("#insumos .list-group");
	if (!listContainer) return;
	listContainer.innerHTML = "";
  
	insumos.forEach((insumo) => {
	  // Obtener producciones asociadas a este insumo
	  fetch(`http://localhost:5000/producciones/insumo/${insumo.id}`)
		.then((response) => response.json())
		.then((producciones) => {
		  const listItem = document.createElement("div");
		  listItem.className = "list-group__item";
		  listItem.innerHTML = `
			<div class="list-group__header">
			  <h3 class="list-group__title">${insumo.nombre}</h3>
			  <span class="badge badge--green">Stock: ${insumo.cantidad} ${insumo.unidad_medida}</span>
			</div>
			<div class="list-group__content">
			  <div class="list-group__description">
				${insumo.descripcion || `${insumo.tipo} para uso agrícola`}
			  </div>
			  <div class="list-group__associated">
				<div class="list-group__label">
				  Producciones asociadas:
				</div>
				<ul class="list-group__items">
				  ${
					producciones.producciones.length > 0
					  ? producciones.producciones.map((p) => `<li>${p.nombre}</li>`).join("")
					  : "<li>No hay producciones asociadas</li>"
				  }
				</ul>
			  </div>
			</div>
		  `;
  
		  listContainer.appendChild(listItem);
		})
		.catch((error) => {
		  console.error("Error al cargar producciones por insumo:", error);
  
		  const listItem = document.createElement("div");
		  listItem.className = "list-group__item";
  
		  listItem.innerHTML = `
			<div class="list-group__header">
			  <h3 class="list-group__title">${insumo.nombre}</h3>
			  <span class="badge badge--warning">Error al cargar producciones</span>
			</div>
			<div class="list-group__content">
			  <div class="list-group__description">
				${insumo.descripcion || `${insumo.tipo} para uso agrícola`}
			  </div>
			</div>
		  `;
  
		  listContainer.appendChild(listItem);
		});
	});
  }
  
  // Función para cargar responsables desde la API
  async function cargarResponsables() {
	try {
	  const response = await fetch("http://localhost:5000/usuarios");
	  const usuarios = await response.json();
  
	  if (!response.ok) {
		throw new Error(usuarios.error || "Error al cargar responsables");
	  }
  
	  actualizarListaResponsables(usuarios.usuarios);
	} catch (error) {
	  console.error("Error al cargar responsables:", error);
	  mostrarError("Error al cargar responsables: " + error.message);
  
	  // Mostrar mensaje de error en la lista
	  const listContainer = document.querySelector("#responsables .list-group");
	  if (listContainer) {
		listContainer.innerHTML = `
		  <div class="error-message">
			<span class="material-symbols-outlined">error</span>
			<p>${error.message}</p>
			<button class="button button--retry" onclick="cargarResponsables()">
			  <span class="material-symbols-outlined">refresh</span>
			  Reintentar
			</button>
		  </div>
		`;
	  }
	}
  }
  
  // Función para actualizar la lista de responsables
  function actualizarListaResponsables(usuarios) {
	const listContainer = document.querySelector("#responsables .list-group");
	if (!listContainer) return;
  
	listContainer.innerHTML = "";
  
	usuarios.forEach((usuario) => {
	  // Obtener producciones asociadas a este usuario
	  fetch(`http://localhost:5000/producciones/usuario/${usuario.id}`)
		.then((response) => response.json())
		.then((producciones) => {
		  const listItem = document.createElement("div");
		  listItem.className = "list-group__item";
  
		  listItem.innerHTML = `
			<div class="list-group__header">
			  <h3 class="list-group__title">${usuario.nombre}</h3>
			  <span class="badge badge--green">${usuario.rol}</span>
			</div>
			<div class="list-group__content">
			  <div class="list-group__description">
				${usuario.correo} | ${usuario.telefono}
			  </div>
			  <div class="list-group__associated">
				<div class="list-group__label">
				  Producciones asociadas:
				</div>
				<ul class="list-group__items">
				  ${
					producciones.producciones.length > 0
					  ? producciones.producciones.map((p) => `<li>${p.nombre}</li>`).join("")
					  : "<li>No hay producciones asociadas</li>"
				  }
				</ul>
			  </div>
			</div>
		  `;
  
		  listContainer.appendChild(listItem);
		})
		.catch((error) => {
		  console.error("Error al cargar producciones por usuario:", error);
  
		  const listItem = document.createElement("div");
		  listItem.className = "list-group__item";
  
		  listItem.innerHTML = `
			<div class="list-group__header">
			  <h3 class="list-group__title">${usuario.nombre}</h3>
			  <span class="badge badge--warning">Error al cargar producciones</span>
			</div>
			<div class="list-group__content">
			  <div class="list-group__description">
				${usuario.correo} | ${usuario.telefono}
			  </div>
			</div>
		  `;
  
		  listContainer.appendChild(listItem);
		});
	});
  }