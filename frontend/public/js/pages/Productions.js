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
	setupProductionStatusCard();
  })
// Función para actualizar la Production Status Card
function setupProductionStatusCard() {
	// IDs de los elementos de la card
	const mainValue = document.querySelector('.production-status__main .stat__value');
	const trendValue = document.querySelector('.production-status__main .stat__trend-value');
	const detailsEnProceso = document.querySelector('.production-status__details .status-item:nth-child(1) .status-item__value');
	const detailsPorIniciar = document.querySelector('.production-status__details .status-item:nth-child(2) .status-item__value');
	const detailsCompletadas = document.querySelector('.production-status__details .status-item:nth-child(3) .status-item__value');

	// Actualizar los valores al cargar producciones
	window.actualizarProductionStatusCard = function (producciones) {
		let activas = 0, enProceso = 0, porIniciar = 0, completadas = 0;
		let trend = 0;
		const mesActual = new Date().getMonth();
		const añoActual = new Date().getFullYear();
		let activasMesPasado = 0;

		producciones.forEach(p => {
			if (p.estado === 'habilitado') activas++;
			if (p.estado === 'habilitado' && p.progreso > 0 && p.progreso < 100) enProceso++;
			if (p.estado === 'habilitado' && p.progreso === 0) porIniciar++;
			if (p.progreso === 100 && new Date(p.fecha_fin).getFullYear() === añoActual) completadas++;
			// Para tendencia: contar activas del mes pasado
			if (p.estado === 'habilitado' && new Date(p.fecha_de_inicio).getMonth() === mesActual - 1) activasMesPasado++;
		});
		trend = activas - activasMesPasado;
		if (mainValue) mainValue.textContent = activas;
		if (trendValue) trendValue.textContent = (trend >= 0 ? '+' : '') + trend;
		if (detailsEnProceso) detailsEnProceso.textContent = enProceso;
		if (detailsPorIniciar) detailsPorIniciar.textContent = porIniciar;
		if (detailsCompletadas) detailsCompletadas.textContent = completadas;
	}
}
  
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
	  production: 60000, // 1 minuto para progreso dinámico
	}
  
	// Actualizar sensores
	setInterval(() => {
	  updateSensorData("humidity", generateRandomData(60, 75))
	  actualizarProgresosPorTiempo()
	}, updateIntervals.humidity)
  
	setInterval(() => {
	  updateSensorData("temperature", generateRandomData(20, 28))
	  actualizarProgresosPorTiempo()
	}, updateIntervals.temperature)
  
	// Primera actualización inmediata
	updateSensorData("humidity", generateRandomData(60, 75))
	updateSensorData("temperature", generateRandomData(20, 28))
	actualizarProgresosPorTiempo()

	// Actualizaciones periódicas de progreso basadas en fechas reales
	setInterval(() => {
	  actualizarProgresosPorTiempo()
	}, updateIntervals.production)
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

  // Recalcular progreso real basado en fechas por cada fila de la tabla
  function calcularProgresoPorFechas(fechaInicioStr, fechaFinStr) {
    if (!fechaInicioStr || !fechaFinStr) return 0
    const ahora = new Date()
    const inicio = new Date(fechaInicioStr)
    const fin = new Date(fechaFinStr)
    const total = fin.getTime() - inicio.getTime()
    const transcurrido = ahora.getTime() - inicio.getTime()
    if (total <= 0) return 100
    if (transcurrido <= 0) return 0
    return Math.min(100, Math.round((transcurrido / total) * 100))
  }

  function actualizarProgresosPorTiempo() {
    const rows = document.querySelectorAll('.table__row')
    rows.forEach(row => {
      const inicio = row.dataset.startDate || ''
      const fin = row.dataset.endDate || ''
      const progreso = calcularProgresoPorFechas(inicio, fin)
      const bar = row.querySelector('.progress__bar')
      const text = row.querySelector('.progress__text')
      if (bar) {
        bar.style.width = `${progreso}%`
        if (progreso > 80) {
          bar.classList.add('progress__bar--warning')
        } else {
          bar.classList.remove('progress__bar--warning')
        }
      }
      if (text) text.textContent = `${progreso}%`
    })
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
	const clearButton = document.querySelector(".button--clear")
	// Acceso dinámico a las filas, ya que se renderizan tras cargar datos
	const getRows = () => Array.from(document.querySelectorAll(".table__row"))
  
	// Mostrar/ocultar panel de filtros
	filterButton?.addEventListener("click", () => {
	  filtersPanel?.classList.toggle("hidden")
	})
  
	closeButton?.addEventListener("click", () => {
	  filtersPanel?.classList.add("hidden")
	})
  
	// Función de filtrado
    function filterTable() {
	  const searchTerm = (searchInput?.value || "").trim().toLowerCase()
	  // Normalizar estado del select (UI) a valores reales en datos (habilitado/deshabilitado)
	  const selectedStateRaw = (stateSelect?.value || "").trim()
	  const selectedState = selectedStateRaw === "Activo" ? "habilitado" : selectedStateRaw === "Inactivo" ? "deshabilitado" : ""
	  // Ciclo removido
	
      getRows().forEach((row) => {
		const id = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase() || ""
		const name = row.querySelector("td:nth-child(3)")?.textContent.toLowerCase() || ""
		const stateText = (row.querySelector(".badge--status")?.textContent || "").trim().toLowerCase()
		// Ciclo removido
	
		// Aplicar filtros
        const matchesSearch = !searchTerm || id.includes(searchTerm) || name.includes(searchTerm)
        const matchesState = !selectedState || stateText.includes(selectedState)
        const matchesCycle = true

        const isEligible = matchesSearch && matchesState && matchesCycle
        // Marcar elegibilidad para paginación y aplicar visibilidad provisional
        row.dataset.filtered = isEligible ? "false" : "true"
        row.style.display = isEligible ? "" : "none"
	  })
	
	  updatePaginationAfterFilter()
	}
  
	// Event listeners para filtros
	searchInput?.addEventListener("input", filterTable)
	stateSelect?.addEventListener("change", filterTable)
	// Ciclo removido
  
	// Limpiar filtros
	clearButton?.addEventListener("click", () => {
	  if (searchInput) searchInput.value = ""
	  if (stateSelect) stateSelect.value = ""
	  // Ciclo removido
	  filterTable()
	})
  }
  
  function setupPagination() {
	const itemsPerPage = 6
	let currentPage = 1

    const getAllRows = () => Array.from(document.querySelectorAll('.table__row'))
    // Filas elegibles para la paginación (no filtradas por criterios)
    const getEligibleRows = () => getAllRows().filter(r => r.dataset.filtered !== 'true')

    const paginationInfo = document.querySelector(".pagination__info")
    // Clonar y reemplazar botones para evitar listeners duplicados
    const replaceWithClone = (el) => {
      if (!el || !el.parentNode) return el
      const clone = el.cloneNode(true)
      el.parentNode.replaceChild(clone, el)
      return clone
    }
		let prevBtn = document.querySelector(".pagination__button--prev")
		let nextBtn = document.querySelector(".pagination__button--next")
		prevBtn = replaceWithClone(prevBtn)
		nextBtn = replaceWithClone(nextBtn)

		const getControlsContainer = () => document.querySelector('.pagination__controls')

		function renderPageButtons(totalPages) {
			const controls = getControlsContainer()
			if (!controls) return
			// Eliminar botones numéricos existentes
			Array.from(controls.querySelectorAll('.pagination__button'))
				.filter(btn => !btn.classList.contains('pagination__button--prev') && !btn.classList.contains('pagination__button--next'))
				.forEach(btn => btn.remove())

			// Insertar botones numéricos 1..totalPages
			for (let i = 1; i <= totalPages; i++) {
				const btn = document.createElement('button')
				btn.className = 'pagination__button' + (i === currentPage ? ' pagination__button--active' : '')
				btn.textContent = String(i)
				btn.addEventListener('click', () => showPage(i))
				if (nextBtn && nextBtn.parentNode === controls) {
					controls.insertBefore(btn, nextBtn)
				} else {
					controls.appendChild(btn)
				}
			}
		}

		function refreshPaginationUI() {
			const totalItems = getEligibleRows().length
			const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

			// Volver a crear los botones según totalPages
			renderPageButtons(totalPages)

	  if (prevBtn) prevBtn.disabled = currentPage === 1
	  if (nextBtn) nextBtn.disabled = currentPage === totalPages

	  // Actualizar contadores compactos si existen
	  const totalPagesEl = document.querySelector('.pagination__total-pages')
	  if (totalPagesEl) totalPagesEl.textContent = String(totalPages)
	  const totalItemsEl = document.querySelector('.pagination__total-items')
	  if (totalItemsEl) totalItemsEl.textContent = String(totalItems)
      const itemsPerPageEl = document.querySelector('.pagination__items-per-page')
      if (itemsPerPageEl) itemsPerPageEl.textContent = String(itemsPerPage)
      const currentPageEl = document.querySelector('.pagination__current-page')
      if (currentPageEl) currentPageEl.textContent = String(currentPage)
	}

	function showPage(page) {
      const rows = getEligibleRows()
      const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage))
	  const targetPage = Math.max(1, Math.min(page, totalPages))
	  const start = (targetPage - 1) * itemsPerPage
	  const end = start + itemsPerPage

      // Ocultar todas las filas y luego mostrar solo el subconjunto elegible de la página
      getAllRows().forEach(row => { row.style.display = 'none' })
	  // Volver a mostrar solo el subset de filas correspondientes
	  rows.forEach((row, index) => {
		if (index >= start && index < end) row.style.display = ''
	  })

		currentPage = targetPage
		// Actualizar estado activo de botones
		Array.from(document.querySelectorAll('.pagination__controls .pagination__button'))
			.filter(btn => !btn.classList.contains('pagination__button--prev') && !btn.classList.contains('pagination__button--next'))
			.forEach(btn => {
				btn.classList.toggle('pagination__button--active', btn.textContent === String(currentPage))
			})
	  if (prevBtn) prevBtn.disabled = currentPage === 1
	  if (nextBtn) nextBtn.disabled = currentPage === totalPages
      const currentPageEl = document.querySelector('.pagination__current-page')
      if (currentPageEl) currentPageEl.textContent = String(currentPage)
	}

	// Inicialización
	refreshPaginationUI()
	showPage(currentPage)

	// Event listeners para botones de paginación
		if (prevBtn) {
			prevBtn.addEventListener("click", () => {
				if (currentPage > 1) showPage(currentPage - 1)
			})
		}

		if (nextBtn) {
			nextBtn.addEventListener("click", () => {
				showPage(currentPage + 1)
			})
		}

	// Escuchar reinicio de paginación tras un filtrado
	document.addEventListener('paginationReset', () => {
	  currentPage = 1
	  refreshPaginationUI()
	  showPage(currentPage)
	})
  }
  
  // Añadir esta función después de setupPagination()
  function setupSeleccionMultiple() {
    if (window.__multiSelectInitialized) {
      if (typeof window.__actualizarSeleccionProducciones === 'function') {
        window.__actualizarSeleccionProducciones();
      }
      return;
    }
    window.__multiSelectInitialized = true;

    const checkboxHeader = document.querySelector(".table__checkbox-header");
    const checkboxActionBar = document.querySelector(".actions-bar__checkbox");
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
      const allCheckboxes = Array.from(document.querySelectorAll(".table__checkbox"));
      // Conjuntos: todos elegibles vs visibles (página actual)
      const eligibleAllCheckboxes = allCheckboxes.filter(cb => {
        const row = cb.closest('.table__row');
        return row && row.dataset.filtered !== 'true';
      });
      const eligibleVisibleCheckboxes = eligibleAllCheckboxes.filter(cb => {
        const row = cb.closest('.table__row');
        return row && row.style.display !== 'none';
      });

      // Total global (en barra) = todos elegibles
      totalProducciones = eligibleAllCheckboxes.length;

      // Seleccionadas = todas las elegibles marcadas (en cualquier página)
      eligibleAllCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
          const row = checkbox.closest(".table__row");
          const idCell = row && row.querySelector("td:nth-child(2)");
          const id = idCell ? idCell.textContent : '';
          if (id) seleccionadas.push(id);
        }
      });

      // Sincronizar select-all cabecera según visibles
      const allCheckedVisible = eligibleVisibleCheckboxes.length > 0 && eligibleVisibleCheckboxes.every(cb => cb.checked);
      const someCheckedVisible = eligibleVisibleCheckboxes.some(cb => cb.checked);
      if (checkboxHeader) {
        checkboxHeader.checked = allCheckedVisible;
        checkboxHeader.indeterminate = someCheckedVisible && !allCheckedVisible;
      }

      // Sincronizar select-all barra según todos elegibles
      const allCheckedAll = eligibleAllCheckboxes.length > 0 && eligibleAllCheckboxes.every(cb => cb.checked);
      const someCheckedAll = eligibleAllCheckboxes.some(cb => cb.checked);
      if (checkboxActionBar) {
        checkboxActionBar.checked = allCheckedAll;
        checkboxActionBar.indeterminate = someCheckedAll && !allCheckedAll;
      }

      actualizarContadores();
    }
	
	// Seleccionar/deseleccionar todos
    if (checkboxHeader) {
      checkboxHeader.addEventListener("change", function() {
        const eligibleCheckboxes = Array.from(document.querySelectorAll('.table__row'))
          .filter(r => r.dataset.filtered !== 'true' && r.style.display !== 'none')
          .map(r => r.querySelector('.table__checkbox'))
          .filter(Boolean);
        eligibleCheckboxes.forEach(checkbox => { checkbox.checked = this.checked; });
        if (checkboxActionBar) checkboxActionBar.checked = this.checked;
        actualizarSeleccion();
      });
    }

    if (checkboxActionBar) {
      checkboxActionBar.addEventListener("change", function() {
        const eligibleCheckboxes = Array.from(document.querySelectorAll('.table__row'))
          .filter(r => r.dataset.filtered !== 'true')
          .map(r => r.querySelector('.table__checkbox'))
          .filter(Boolean);
        eligibleCheckboxes.forEach(checkbox => { checkbox.checked = this.checked; });
        if (checkboxHeader) checkboxHeader.checked = this.checked;
        actualizarSeleccion();
      });
    }
	
	// Event delegation para checkboxes individuales
    document.addEventListener("change", function(e) {
	  if (e.target && e.target.classList.contains("table__checkbox")) {
		actualizarSeleccion();
        // No más sincronización manual aquí; actualizarSeleccion ya gestiona ambos select-all
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
    // Exponer función para que paginación pueda recalcular al cambiar de página
    window.__actualizarSeleccionProducciones = actualizarSeleccion;
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
	  
      // Llamada al endpoint para habilitar múltiples producciones (backend espera PUT)
      const response = await fetch("http://localhost:5000/producciones/estados/habilitado", {
        method: "PUT",
		headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token') || ''}`
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
	  
      // Llamada al endpoint para deshabilitar múltiples producciones (backend espera PUT)
      const response = await fetch("http://localhost:5000/producciones/deshabilitar", {
        method: "PUT",
		headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token') || ''}`
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
    const allRows = Array.from(document.querySelectorAll('.table__row'))
    const eligibleRows = allRows.filter(r => r.dataset.filtered !== 'true')
    const totalItems = eligibleRows.length
    const itemsPerPage = 6

    const totalItemsEl = document.querySelector('.pagination__total-items')
    if (totalItemsEl) totalItemsEl.textContent = String(totalItems)
    const totalPagesEl = document.querySelector('.pagination__total-pages')
    if (totalPagesEl) totalPagesEl.textContent = String(Math.max(1, Math.ceil(totalItems / itemsPerPage)))
  
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
    const previewBtn = null
  
	// Mostrar modal
	reportBtn?.addEventListener("click", () => {
	  reportModal.style.display = "flex"
	  // Render inicial
	  try { renderPreview() } catch (_) {}
	})
  
	// Cerrar modal
	;[cancelReportBtn, closeReportModal].forEach((btn) => {
	  btn?.addEventListener("click", () => {
		reportModal.style.display = "none"
	  })
	})
  

	function collectReportData() {
	  const includeInactive = document.getElementById("includeInactive")?.checked
	  const dateFrom = document.getElementById("dateFrom")?.value
	  const dateTo = document.getElementById("dateTo")?.value
	  const selectedCols = Array.from(document.querySelectorAll('.col-check:checked')).map(i => i.getAttribute('data-col'))

	  const rows = Array.from(document.querySelectorAll(".table__row"))
	  const dataset = rows
		.filter((row) => {
		  // Respetar filtros, pero ignorar paginación (incluir todas las páginas)
		  if (row.dataset.filtered === 'true') return false
		  if (!includeInactive && row.querySelector(".badge--inactive")) return false
		  // Filtro por fecha si hay columnas de fecha en dataset (usa data-startDate/ data-endDate si existiera)
		  if (dateFrom || dateTo) {
			const start = row.dataset.startDate || ''
			if (dateFrom && start && start < dateFrom) return false
			if (dateTo && start && start > dateTo) return false
		  }
		  return true
		})
		.map((row) => ({
		  id: row.querySelector("td:nth-child(2)")?.textContent || '',
		  nombre: row.querySelector("td:nth-child(3)")?.textContent || '',
		  responsable: row.querySelector("td:nth-child(4)")?.textContent || '',
		  cultivo: row.querySelector("td:nth-child(5)")?.textContent || '',
		  inversion: row.querySelector("td:nth-child(6)")?.textContent || '',
		  progreso: row.querySelector(".progress__text")?.textContent || '',
		  estado: (row.querySelector(".badge--status")?.textContent || '').trim(),
		}))

	  // Aplicar selección de columnas
	  const mapped = dataset.map(item => {
		const obj = {}
		selectedCols.forEach(c => { obj[c] = item[c] })
		return obj
	  })
	  return { data: mapped, cols: selectedCols }
	}

  function renderPreview() {
      const { data } = collectReportData()
      const prev = document.getElementById('reportPreview')
      if (!prev) return
      const count = data.length
      // Resumen adicional: columnas seleccionadas y formato
      const selectedCols = Array.from(document.querySelectorAll('.col-check:checked')).map(i => i.getAttribute('data-col'))
      const format = (document.getElementById('reportFormat')?.value || '').toUpperCase()
      prev.innerHTML = count > 0
        ? `Se exportarán <strong>${count}</strong> producciones en <strong>${format || 'CSV'}</strong> con <strong>${selectedCols.length}</strong> columnas.`
        : '<em>No hay datos para exportar</em>'
  }

    // Auto-actualizar vista previa al cambiar opciones
	document.getElementById('includeInactive')?.addEventListener('change', renderPreview)
    document.getElementById('dateFrom')?.addEventListener('change', renderPreview)
    document.getElementById('dateTo')?.addEventListener('change', renderPreview)
    document.getElementById('reportFormat')?.addEventListener('change', renderPreview)
	Array.from(document.querySelectorAll('.col-check')).forEach(el => el.addEventListener('change', renderPreview))

	// Generar reporte
	document.getElementById("reportForm")?.addEventListener("submit", (e) => {
	  e.preventDefault()
	  const format = document.getElementById('reportFormat')?.value || 'csv'
	  const { data, cols } = collectReportData()
	  if (!data || data.length === 0) { mostrarError('No hay datos para exportar'); return }

	  const fecha = new Date().toLocaleDateString("es-ES").replace(/\//g, "-")

	  if (format === 'json') {
		const blob = new Blob([JSON.stringify({ columnas: cols, datos: data }, null, 2)], { type: 'application/json;charset=utf-8' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url; a.download = `reporte_producciones_${fecha}.json`
		document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
		reportModal.style.display = 'none'
		return
	  }

	  if (format === 'csv') {
		const BOM = "\uFEFF"
		const header = cols.map(c=>`"${c}"`).join(',')
		const rows = data.map(row => cols.map(c => `"${String(row[c]??'').replace(/"/g,'""')}"`).join(',')).join('\n')
		const csv = `${BOM}${header}\n${rows}`
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url; a.download = `reporte_producciones_${fecha}.csv`
		document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
		reportModal.style.display = 'none'
		return
	  }

  if (format === 'xlsx' || format === 'excel') {
    if (window.ReportGenerator) {
      const columns = cols.map(c => ({ header: c[0].toUpperCase()+c.slice(1), key: c }))
      window.ReportGenerator.generateReport({ columns, data, format: 'excel', filename: `reporte_producciones_${fecha}` })
      reportModal.style.display = 'none'
    } else {
      // Fallback mínimo a CSV si no está el generador
      const header = cols.join(',')
      const rows = data.map(row => cols.map(c => String(row[c]??'')).join(',')).join('\n')
      const csv = `${header}\n${rows}`
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `reporte_producciones_${fecha}.csv`
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    }
    return
  }

  if (format === 'pdf') {
    if (window.ReportGenerator) {
      const columns = cols.map(c => ({ header: c[0].toUpperCase()+c.slice(1), key: c }))
      window.ReportGenerator.generateReport({ columns, data, format: 'pdf', filename: `reporte_producciones_${fecha}` })
      reportModal.style.display = 'none'
    } else {
      mostrarError('Generador de reportes no disponible')
    }
    return
  }
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
						const token = localStorage.getItem('token');
						const response = await fetch("http://localhost:5000/producciones", {
								headers: {
										"Authorization": `Bearer ${token}`
								}
						});
						if (response.status === 403) {
								renderNoPermissionTableProducciones();
								return;
						}
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
			// Actualizar widgets con datos reales
			try {
				if (typeof window.actualizarProductionStatusCard === 'function') {
					window.actualizarProductionStatusCard(produccionesConProgreso)
				}
				// Actualizar tarjeta "Total Producciones" (Activas/Completadas)
				const summaryCard = document.querySelector('.summary .stat-card:nth-child(1)')
				if (summaryCard) {
					let activas = 0
					let completadas = 0
					produccionesConProgreso.forEach(p => {
						if (p.estado === 'habilitado') activas++
						if (p.progreso === 100) completadas++
					})
					const labels = summaryCard.querySelectorAll('.stat-card__details .stat-card__label')
					if (labels && labels.length >= 2) {
						labels[0].textContent = `${activas} Activas`
						labels[1].textContent = `${completadas} Completadas`
					}
					const totalEl = summaryCard.querySelector('.stat-card__value')
					if (totalEl) totalEl.textContent = String(produccionesConProgreso.length)
					// Animar icono
					const icon = summaryCard.querySelector('.stat-card__icon')
					if (icon) {
						icon.classList.add('stat-card__icon--pulse','stat-card__icon--glow')
						setTimeout(() => icon.classList.remove('stat-card__icon--pulse','stat-card__icon--glow'), 800)
					}
				}

				// Utilidades
				const toNumber = (v) => {
					if (v === null || v === undefined) return 0
					if (typeof v === 'number') return v
					const cleaned = String(v).replace(/[^0-9.-]/g, '')
					const num = parseFloat(cleaned)
					return isNaN(num) ? 0 : num
				}
				const formatCurrency = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

				// Totales financieros
				const totalInversion = produccionesConProgreso.reduce((sum, p) => sum + toNumber(p.inversion), 0)
				const totalMeta = produccionesConProgreso.reduce((sum, p) => sum + toNumber(p.meta_ganancia), 0)
				const roiPct = totalInversion > 0 ? Math.round(((totalMeta - totalInversion) / totalInversion) * 100) : 0

				// Actualizar tarjeta "Inversión Total"
				const inversionCard = document.querySelector('.summary .stat-card:nth-child(2)')
				if (inversionCard) {
					const valueEl = inversionCard.querySelector('.stat-card__value')
					if (valueEl) valueEl.textContent = formatCurrency(totalInversion)
					const icon = inversionCard.querySelector('.stat-card__icon')
					if (icon) {
						icon.classList.add('stat-card__icon--pulse','stat-card__icon--glow')
						setTimeout(() => icon.classList.remove('stat-card__icon--pulse','stat-card__icon--glow'), 800)
					}
				}

				// Actualizar tarjeta "Meta de Ganancias"
				const metaCard = document.querySelector('.summary .stat-card:nth-child(3)')
				if (metaCard) {
					const valueEl = metaCard.querySelector('.stat-card__value')
					if (valueEl) valueEl.textContent = formatCurrency(totalMeta)
					const trendValueEl = metaCard.querySelector('.stat-card__trend-value')
					if (trendValueEl) trendValueEl.textContent = `${roiPct}%`
					const trendLabelEl = metaCard.querySelector('.stat-card__trend-label')
					if (trendLabelEl) trendLabelEl.textContent = 'sobre la inversión total'
					const icon = metaCard.querySelector('.stat-card__icon')
					if (icon) {
						icon.classList.add('stat-card__icon--pulse','stat-card__icon--glow')
						setTimeout(() => icon.classList.remove('stat-card__icon--pulse','stat-card__icon--glow'), 800)
					}
				}
			} catch (_) {}
			setupSeleccionMultiple()
  
			// Actualizar contador en el dashboard si existe
			const totalProduccionesElement = document.querySelector(".stat-card__value")
			if (totalProduccionesElement) {
				totalProduccionesElement.textContent = producciones.length
			}
		} catch (error) {
			if (error.message && error.message.toLowerCase().includes('permiso')) {
				renderNoPermissionTableProducciones();
				return;
			}
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

	function renderNoPermissionTableProducciones() {
		const tbody = document.querySelector('.table__body');
		if (tbody) {
			tbody.innerHTML = `
				<tr class="table__row">
					<td class="table__cell" colspan="9" style="text-align: center; color: rgb(253,195,0);">
						<span style="font-size:2rem;vertical-align:middle;">&#9888;</span><br>
						No tienes permisos para realizar esta acción
					</td>
				</tr>
			`;
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
	  // Guardar metadatos útiles para filtros
	  row.dataset.cycle = produccion.nombre_ciclo || ""
	  // Fechas para cálculo de progreso en tiempo real
	  row.dataset.startDate = produccion.fecha_de_inicio || ""
	  row.dataset.endDate = produccion.fecha_fin || ""
      // Marcar como no filtrada por defecto (elegible para paginación)
      row.dataset.filtered = "false"
  
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

	// Ajustar barras de progreso con base en fechas reales
	if (typeof actualizarProgresosPorTiempo === 'function') {
	  actualizarProgresosPorTiempo()
	}
	
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
			const token = localStorage.getItem('token');
			const response = await fetch(`http://localhost:5000/producciones/${id}`, {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
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

	  // Días restantes
	  const diasRestantesEl = document.getElementById('cultivoDiasRestantes');
	  if (diasRestantesEl) {
		let diasRestantes = '-';
		if (produccion.fecha_fin) {
		  const fin = new Date(produccion.fecha_fin).getTime();
		  const hoy = new Date().getTime();
		  const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
		  diasRestantes = (isNaN(diff) ? '-' : (diff < 0 ? '0' : String(diff))) + ' días';
		}
		diasRestantesEl.textContent = diasRestantes;
	  }
	  
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

	  // Gráfico doughnut de progreso
	  try {
		const chartCanvas = document.getElementById('progressDoughnutChart');
		if (chartCanvas && window.Chart) {
		  if (window.__progressChart) {
			window.__progressChart.destroy();
		  }
		  window.__progressChart = new Chart(chartCanvas.getContext('2d'), {
			type: 'doughnut',
			data: {
			  labels: ['Completado', 'Restante'],
			  datasets: [{
				data: [progreso, Math.max(0, 100 - progreso)],
				backgroundColor: ['#22c55e', '#e5e7eb'],
				borderWidth: 0
			  }]
			},
			options: {
			  responsive: false,
			  cutout: '70%',
			  plugins: { legend: { display: false }, tooltip: { enabled: false } }
			}
		  });
		}
	  } catch (e) {
		console.warn('No se pudo renderizar el gráfico de progreso', e);
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
						const token = localStorage.getItem('token');
						return fetch(`http://localhost:5000/insumos/${insumo.id || insumo.insumo_id}`,
							{
								headers: {
									"Authorization": `Bearer ${token}`
								}
							}
						)
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
						const token = localStorage.getItem('token');
						return fetch(`http://localhost:5000/sensor/${sensor.id || sensor.sensor_id}`,
							{
								headers: {
									"Authorization": `Bearer ${token}`
								}
							}
						)
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
								const token = localStorage.getItem('token');
								const response = await fetch(`http://localhost:5000/sensor/${sensorId}`,
									{
										headers: {
											"Authorization": `Bearer ${token}`
										}
									}
								);
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
  
	  // Mostrar el modal y setear botón editar
	  modal.style.display = "flex";
	  const editBtn = document.getElementById('editProduccionBtn');
	  if (editBtn) {
		editBtn.href = `../views/actualizar-produccion.html?id=${produccion.id}`;
	  }
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
          "Authorization": `Bearer ${localStorage.getItem('token') || ''}`
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
			const token = localStorage.getItem('token');
			const response = await fetch("http://localhost:5000/cultivos", {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
			const cultivos = await response.json()
  
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
			const token = localStorage.getItem('token');
			const response = await fetch("http://localhost:5000/sensor", {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
			const sensores = await response.json()
  
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
			const token = localStorage.getItem('token');
			const response = await fetch("http://localhost:5000/insumos", {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
			const insumos = await response.json()
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
			const token = localStorage.getItem('token');
			const response = await fetch("http://localhost:5000/usuarios", {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
			const usuarios = await response.json()
  
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