import { insumosConfig } from "../config/insumosConfig.js";
import { insumos } from "../data/insumosData.js";

document.addEventListener("DOMContentLoaded", async () => {
	let currentPage = 1;
	const itemsPerPage = insumosConfig.table.itemsPerPage || 10;
	let filteredInsumos = [];

	// Cargar datos iniciales
	filteredInsumos = await fetchInsumosFromAPI();
	// Si fetchInsumosFromAPI retorna null, significa que no hay permiso y ya se mostró el mensaje
	if (filteredInsumos === null) return;
	renderPaginatedTable(filteredInsumos);

	// --- Obtener insumos desde la API ---
	async function fetchInsumosFromAPI() {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch("http://localhost:5000/insumos", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (response.status === 403) {
				renderNoPermissionTable();
				return null;
			}
			if (!response.ok) throw new Error("Error al obtener insumos de la API");
			const data = await response.json();
			console.log("API Response:", data);
			// Si la respuesta es un array o tiene la clave 'insumos'
			const insumosArr = Array.isArray(data) ? data : data.insumos || [];
			// Normalizar campos y estado
			return insumosArr.map((insumo) => {
				let status = insumo.estado || "";
				if (typeof status === "string") {
					const estadoLower = status.trim().toLowerCase();
					if (["habilitado"].includes(estadoLower)) {
						status = "habilitado";
					} else if (["deshabilitado"].includes(estadoLower)) {
						status = "deshabilitado";
					}
				}
				return {
					id: insumo.insumoId || insumo.id || "",
					nombre: insumo.nombre || "",
					tipo: insumo.tipo || "",
					cantidad: insumo.cantidad || "",
					estado: status,
					descripcion: insumo.descripcion || "",
					proveedor: insumo.proveedor || "",
					unidad: insumo.unidad || "",
					imagen: insumo.imagen || "",
					fechaCreacion:
						insumo.fechaCreacion ||
						insumo.createdAt ||
						insumo.fecha_creacion ||
						"",
					fechaActualizacion:
						insumo.fechaActualizacion ||
						insumo.updatedAt ||
						insumo.fecha_actualizacion ||
						"",
				};
			});
		} catch (e) {
			// Si el error es de permisos, mostrar mensaje y no datos locales
			if (e.message && e.message.toLowerCase().includes("permiso")) {
				renderNoPermissionTable();
				return [];
			}
			// Otro error: mostrar mensaje genérico
			renderErrorTable(e.message);
			return [];
		}
	}

	function renderNoPermissionTable() {
		const tbody = document.querySelector(".table__body");
		if (tbody) {
			tbody.innerHTML = `
        <tr class="table__row">
          <td class="table__cell" colspan="8" style="text-align: center; color: rgb(253,195,0);">
            <span style="font-size:2rem;vertical-align:middle;">&#9888;</span><br>
            No tienes permisos para realizar esta acción
          </td>
        </tr>
      `;
		}
	}

	function renderErrorTable(msg) {
		const tbody = document.querySelector(".table__body");
		if (tbody) {
			tbody.innerHTML = `
        <tr class="table__row">
          <td class="table__cell" colspan="8" style="text-align: center; color: rgb(253,195,0);">
            <span style="font-size:2rem;vertical-align:middle;">&#9888;</span><br>
            ${msg || "Error al cargar los datos"}
          </td>
        </tr>
      `;
		}
	}

	function updateInsumoStatus(ids, estado) {
		ids.forEach((id) => {
			const insumo = filteredInsumos.find((i) => String(i.id) === String(id));
			if (insumo) insumo.estado = estado;
		});
	}

	function getFilteredInsumos() {
		const search =
			document.querySelector(".filters__search")?.value?.toLowerCase() || "";
		const tipo =
			document.querySelector('select[placeholder="Tipo de Insumo"]')?.value ||
			"";
		const estado =
			document.querySelector('select[placeholder="Estado"]')?.value || "";
		const ubicacion =
			document.querySelector('select[placeholder="Ubicación"]')?.value || "";

		return filteredInsumos.filter((insumo) => {
			// Buscar por nombre o ID
			const matchesSearch =
				!search ||
				(insumo.nombre &&
					typeof insumo.nombre === "string" &&
					insumo.nombre.toLowerCase().includes(search)) ||
				(insumo.id !== undefined &&
					String(insumo.id).toLowerCase().includes(search));

			// Filtrar por tipo si está seleccionado
			const matchesTipo = !tipo || (insumo.tipo && insumo.tipo === tipo);

			// Filtrar por estado si está seleccionado
			let matchesEstado = true;
			if (estado) {
				if (estado === "Activo") {
					matchesEstado = insumo.estado === "habilitado";
				} else if (estado === "Inactivo") {
					matchesEstado = insumo.estado !== "habilitado";
				}
			}

			// Filtrar por ubicación si está seleccionado
			const matchesUbicacion =
				!ubicacion || (insumo.ubicacion && insumo.ubicacion === ubicacion);

			return matchesSearch && matchesTipo && matchesEstado && matchesUbicacion;
		});
	}

	function renderInsumosTable(data) {
		const tbody = document.querySelector(".table__body");
		tbody.innerHTML = data
			.map(
				(insumo) => `
      <tr class="table__row">
        <td class="table__cell table__cell--checkbox">
          <input type="checkbox" class="table__checkbox" />
        </td>
        <td class="table__cell table__cell--id">${insumo.id}</td>
        <td class="table__cell table__cell--name">${insumo.nombre}</td>
        <td class="table__cell table__cell--tipo">${insumo.tipo}</td>
        <td class="table__cell table__cell--cantidad">${insumo.cantidad}</td>
        <td class="table__cell table__cell--estado">
          <span class="badge badge--${
						insumo.estado === "habilitado" ? "active" : "inactive"
					}">${
					insumo.estado === "habilitado" ? "Con stock" : "Sin stock"
				}</span>
        </td>
        <td class="table__cell table__cell--actions">
          <button class="table__action-button table__action-button--view"><span class="material-symbols-outlined">visibility</span></button>
          <button class="table__action-button table__action-button--edit" onclick="window.location.href='../views/actualizar-insumo.html?id=${
						insumo.id
					}'">
          <span class="material-symbols-outlined">edit</span>
        </button>

          <button class="table__action-button table__action-button--${
						insumo.estado === "habilitado" ? "disable" : "enable"
					}"><span class="material-symbols-outlined">power_settings_new</span></button>
        </td>
      </tr>
    `
			)
			.join("");
	}

	function renderPaginatedTable(list) {
		const total = list.length;
		const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
		if (currentPage > totalPages) currentPage = totalPages;
		const startIdx = (currentPage - 1) * itemsPerPage;
		const endIdx = Math.min(startIdx + itemsPerPage, total);
		const pageItems = list.slice(startIdx, endIdx);
		renderInsumosTable(pageItems);
		renderPaginationInfo(startIdx, endIdx, total);
		renderPaginationControls(totalPages);
		updateSelectionCount();
	}

	function renderPaginationInfo(startIdx, endIdx, total) {
		const currentPageSpan = document.querySelector(".pagination__current-page");
		const itemsPerPageSpan = document.querySelector(
			".pagination__items-per-page"
		);
		const totalItemsSpan = document.querySelector(".pagination__total-items");
		if (currentPageSpan) currentPageSpan.textContent = startIdx + 1;
		// Show actual end index, not the slice end
		const actualEndIdx = Math.min(endIdx, total);
		if (itemsPerPageSpan) itemsPerPageSpan.textContent = actualEndIdx;
		if (totalItemsSpan) totalItemsSpan.textContent = total;
	}

	function renderPaginationControls(totalPages) {
		const prevBtn = document.querySelector(".pagination__button--prev");
		const nextBtn = document.querySelector(".pagination__button--next");
		const pageBtns = document.querySelectorAll(
			".pagination__button:not(.pagination__button--prev):not(.pagination__button--next)"
		);
		prevBtn.disabled = currentPage === 1;
		nextBtn.disabled = currentPage === totalPages;
		prevBtn.onclick = () => {
			if (currentPage > 1) {
				currentPage--;
				renderPaginatedTable(filteredInsumos);
			}
		};
		nextBtn.onclick = () => {
			if (currentPage < totalPages) {
				currentPage++;
				renderPaginatedTable(filteredInsumos);
			}
		};
		// Actualiza botones de página
		pageBtns.forEach((btn, i) => {
			const pageNum = i + 1;
			btn.classList.toggle(
				"pagination__button--active",
				pageNum === currentPage
			);
			btn.style.display = pageNum <= totalPages ? "" : "none";
			btn.onclick = () => {
				if (currentPage !== pageNum) {
					currentPage = pageNum;
					renderPaginatedTable(filteredInsumos);
				}
			};
		});
	}

	function getSelectedIds() {
		return Array.from(
			document.querySelectorAll(".table__checkbox:checked")
		).map(
			(cb) => cb.closest("tr").querySelector(".table__cell--id").textContent
		);
	}

	function updateSelectionCount() {
		const total = document.querySelectorAll(".table__checkbox").length;
		const selected = document.querySelectorAll(
			".table__checkbox:checked"
		).length;
		document.querySelector(".actions-bar__count--selected").textContent =
			selected;
		document.querySelector(".actions-bar__count--total").textContent = total;
		const header = document.querySelector(".table__checkbox-header");
		const bar = document.querySelector(".actions-bar__checkbox");
		if (header) header.checked = selected === total && total > 0;
		if (bar) bar.checked = selected === total && total > 0;
	}

	// Sincronización de checkbox general y de tabla
	document
		.querySelector(".table__body")
		.addEventListener("change", updateSelectionCount);

	document
		.querySelector(".actions-bar__checkbox")
		.addEventListener("change", function () {
			const checked = this.checked;
			document.querySelectorAll(".table__checkbox").forEach((cb) => {
				cb.checked = checked;
			});
			const thHeader = document.querySelector(".table__checkbox-header");
			if (thHeader) thHeader.checked = checked;
			updateSelectionCount();
		});

	// Checkbox en header de tabla
	let thHeader = document.querySelector(".table__checkbox-header");
	if (!thHeader) {
		// Si no existe, lo agregamos dinámicamente
		const th = document.createElement("th");
		th.className = "table__cell table__cell--checkbox";
		th.innerHTML = '<input type="checkbox" class="table__checkbox-header" />';
		const theadRow = document.querySelector(".table__head .table__row");
		if (theadRow) theadRow.insertBefore(th, theadRow.firstChild);
		thHeader = document.querySelector(".table__checkbox-header");
	}
	if (thHeader) {
		thHeader.addEventListener("change", function () {
			const checked = this.checked;
			document.querySelectorAll(".table__checkbox").forEach((cb) => {
				cb.checked = checked;
			});
			const bar = document.querySelector(".actions-bar__checkbox");
			if (bar) bar.checked = checked;
			updateSelectionCount();
		});
	}

	document
		.querySelector(".button--enable")
		.addEventListener("click", async () => {
			const ids = getSelectedIds();
			if (ids.length === 0) return;
			updateInsumoStatus(ids, "habilitado");
			await Promise.all(ids.map((id) => toggleInsumoStatus(id, "habilitado")));
			renderPaginatedTable(filteredInsumos);
			document.querySelector(".actions-bar__checkbox").checked = false;
			document.querySelector(".table__checkbox-header").checked = false;
		});
	document
		.querySelector(".button--disable")
		.addEventListener("click", async () => {
			const ids = getSelectedIds();
			if (ids.length === 0) return;
			updateInsumoStatus(ids, "deshabilitado");
			await Promise.all(
				ids.map((id) => toggleInsumoStatus(id, "deshabilitado"))
			);
			renderPaginatedTable(filteredInsumos);
			document.querySelector(".actions-bar__checkbox").checked = false;
			document.querySelector(".table__checkbox-header").checked = false;
		});

	// --- Nueva función para actualizar estado en backend ---
	async function toggleInsumoStatus(id, nuevoEstado) {
		const token = localStorage.getItem("token");
		await fetch(`http://localhost:5000/insumos/${id}/estado`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ estado: nuevoEstado }),
		});
	}

	// --- Mostrar modal de visualizar insumo ---
	function showInsumoModal(insumo) {
		console.log("Datos completos del insumo:", insumo);

		// Formatear valores numéricos
		const formatter = new Intl.NumberFormat("es-CO", {
			style: "currency",
			currency: "COP",
			minimumFractionDigits: 0,
		});

		// Extraer valores del insumo
		const valorUnitario = parseFloat(insumo.valor_unitario || 0);
		const valorTotal = parseFloat(insumo.valor_total || 0);
		const cantidad = insumo.cantidad || 0;
		const unidadMedida = insumo.unidad_medida || insumo.unidad || "";

		console.log("Valores extraídos:", {
			valorUnitario,
			valorTotal,
			cantidad,
			unidadMedida,
		});

		// Actualizar la interfaz de usuario
		const updateField = (id, value) => {
			const element = document.getElementById(id);
			if (element) {
				element.textContent =
					value !== undefined && value !== null ? value : "-";
				console.log(`Actualizando ${id}:`, element.textContent);
			} else {
				console.error(`Elemento no encontrado: ${id}`);
			}
		};

		updateField("modalInsumoId", insumo.id);
		updateField("modalInsumoNombre", insumo.nombre);
		updateField("modalInsumoTipo", insumo.tipo);
		updateField("modalInsumoCantidad", cantidad);
		updateField("modalInsumoUnidad", unidadMedida);
		updateField("modalInsumoEstado", insumo.estado);
		updateField(
			"modalInsumoDescripcion",
			insumo.descripcion || "Sin descripción"
		);
		updateField("modalInsumoValorUnitario", formatter.format(valorUnitario));
		updateField("modalInsumoValorTotal", formatter.format(valorTotal));
		const imgElem = document.getElementById("modalInsumoImagen");
		if (imgElem) {
			imgElem.src = insumo.imagen || "../imgs/default-insumo.jpg";
			imgElem.alt = insumo.nombre || "Imagen de insumo";
		}
		document.getElementById("viewInsumoModal").classList.add("modal--active");
	}

	// Cerrar modal
	document.getElementById("closeViewInsumoModal").onclick = () => {
		document
			.getElementById("viewInsumoModal")
			.classList.remove("modal--active");
	};
	document.getElementById("closeViewInsumoBtn").onclick = () => {
		document
			.getElementById("viewInsumoModal")
			.classList.remove("modal--active");
	};

	// --- Reporte funcional ---
	const reportModal = document.getElementById("reportModal");
	const reportBtn = document.querySelector(".button--report");
	const cancelReportBtn = document.getElementById("cancelReportBtn");
	const generateReportBtn = document.getElementById("generateReportBtn");
	const closeReportModal = document.getElementById("closeReportModal");

	if (reportBtn && reportModal) {
		reportBtn.addEventListener("click", () => {
			// Usa la clase modal--active (no modal--open) para mostrar el modal correctamente
			reportModal.classList.add("modal--active");
			reportModal.style.display = "";
			reportModal.style.alignItems = "";
			reportModal.style.justifyContent = "";
			try {
				renderPreview();
			} catch (_) {}
		});
	}
	if (cancelReportBtn && reportModal) {
		cancelReportBtn.addEventListener("click", () => {
			reportModal.classList.remove("modal--active");
			reportModal.style.display = "";
		});
	}
	if (closeReportModal && reportModal) {
		closeReportModal.addEventListener("click", () => {
			reportModal.classList.remove("modal--active");
			reportModal.style.display = "";
		});
	}
	if (generateReportBtn) {
		generateReportBtn.addEventListener("click", (e) => {
			e.preventDefault();
			const format = (
				document.getElementById("reportFormat")?.value || "excel"
			).toLowerCase();
			const includeInactive =
				document.getElementById("includeInactive")?.checked;
			const includeDetails = document.getElementById("includeDetails")?.checked;
			// Preparar dataset según filtros
			const base = Array.isArray(filteredInsumos) ? filteredInsumos : [];
			const data = base.filter((i) =>
				includeInactive ? true : i.estado !== "deshabilitado"
			);
			// Definir columnas
			const columns = includeDetails
				? [
						{ header: "ID", key: "id" },
						{ header: "Nombre", key: "nombre" },
						{ header: "Tipo", key: "tipo" },
						{ header: "Cantidad", key: "cantidad" },
						{ header: "Estado", key: "estado" },
				  ]
				: [
						{ header: "ID", key: "id" },
						{ header: "Nombre", key: "nombre" },
						{ header: "Estado", key: "estado" },
				  ];
			// Mapear datos a objeto plano
			const rows = data.map((i) => {
				const row = { id: i.id, nombre: i.nombre, estado: i.estado };
				if (includeDetails) {
					row.tipo = i.tipo;
					row.cantidad = i.cantidad;
				}
				return row;
			});
			const filename = `reporte_insumos_${new Date()
				.toLocaleDateString("es-ES")
				.replace(/\//g, "-")}`;
			if (window.ReportGenerator) {
				window.ReportGenerator.generateReport({
					columns,
					data: rows,
					format,
					filename,
				});
			} else {
				// Fallback simple a CSV
				const header = columns.map((c) => `"${c.header}"`).join(",");
				const csvRows = rows
					.map((r) =>
						columns
							.map((c) => `"${String(r[c.key] ?? "").replace(/"/g, '""')}"`)
							.join(",")
					)
					.join("\n");
				const csv = `\uFEFF${header}\n${csvRows}`;
				const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${filename}.csv`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
			reportModal.classList.remove("modal--active");
			reportModal.style.display = "";
		});
	}

	// Vista previa dinámica
	function renderPreview() {
		const prev = document.getElementById("reportPreview");
		if (!prev) return;
		const includeInactive = document.getElementById("includeInactive")?.checked;
		const data = (Array.isArray(filteredInsumos) ? filteredInsumos : []).filter(
			(i) => (includeInactive ? true : i.estado !== "deshabilitado")
		);
		const format = (
			document.getElementById("reportFormat")?.value || "CSV"
		).toUpperCase();
		const colCount = document.getElementById("includeDetails")?.checked ? 5 : 3;
		prev.innerHTML =
			data.length > 0
				? `Se exportarán <strong>${data.length}</strong> insumos en <strong>${format}</strong> con <strong>${colCount}</strong> columnas.`
				: "<em>No hay datos para exportar</em>";
	}
	document
		.getElementById("includeInactive")
		?.addEventListener("change", renderPreview);
	document
		.getElementById("includeDetails")
		?.addEventListener("change", renderPreview);
	document
		.getElementById("reportFormat")
		?.addEventListener("change", renderPreview);

	// Aplicar filtros
	function applyFilters() {
		currentPage = 1; // Resetear a la primera página al aplicar filtros
		const filteredData = getFilteredInsumos();
		renderPaginatedTable(filteredData);
	}

	// Limpiar filtros
	function clearFilters() {
		const searchInput = document.querySelector(".filters__search");
		const selectElements = document.querySelectorAll(".filters__select");

		if (searchInput) searchInput.value = "";
		selectElements.forEach((select) => {
			select.selectedIndex = 0; // Seleccionar la primera opción (Todas)
		});

		applyFilters();
	}

	// Event listeners para los filtros
	const searchInput = document.querySelector(".filters__search");
	const tipoSelect = document.querySelector(
		'select[placeholder="Tipo de Insumo"]'
	);
	const estadoSelect = document.querySelector('select[placeholder="Estado"]');
	const ubicacionSelect = document.querySelector(
		'select[placeholder="Ubicación"]'
	);
	const clearButton = document.querySelector(".button--clear");
	const filterBtn = document.querySelector(".button--filter");
	const filtersDiv = document.querySelector(".filters");
	const closeFilter = document.querySelector(".filters__close");

	// Aplicar filtros al cambiar los valores
	if (searchInput) searchInput.addEventListener("input", applyFilters);
	if (tipoSelect) tipoSelect.addEventListener("change", applyFilters);
	if (estadoSelect) estadoSelect.addEventListener("change", applyFilters);
	if (ubicacionSelect) ubicacionSelect.addEventListener("change", applyFilters);
	if (clearButton) clearButton.addEventListener("click", clearFilters);

	// Mostrar/ocultar panel de filtros
	if (filterBtn && filtersDiv) {
		filterBtn.addEventListener("click", () => {
			filtersDiv.classList.toggle("hidden");
		});
	}

	if (closeFilter) {
		closeFilter.addEventListener("click", () => {
			filtersDiv.classList.add("hidden");
		});
	}

	// Manejar clics en los botones de acción de la tabla
	document.addEventListener("click", async (e) => {
		const btn = e.target.closest(".table__action-button");
		if (!btn) return;

		const row = btn.closest("tr");
		const id = row.querySelector(".table__cell--id").textContent;

		if (btn.classList.contains("table__action-button--view")) {
			// Mostrar modal de visualización
			try {
				const token = localStorage.getItem("token");
				const response = await fetch(`http://localhost:5000/insumos/${id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (!response.ok)
					throw new Error("Error al obtener los detalles del insumo");
				const insumo = await response.json();
				showInsumoModal(insumo);
			} catch (error) {
				console.error("Error al cargar el insumo:", error);
				alert("No se pudo cargar la información del insumo");
			}
		} else if (btn.classList.contains("table__action-button--edit")) {
			// Navegación manejada por el enlace <a> que envuelve el botón
		} else if (btn.classList.contains("table__action-button--enable")) {
			updateInsumoStatus([id], "habilitado");
			await toggleInsumoStatus(id, "habilitado");
			renderPaginatedTable(filteredInsumos);
		} else if (btn.classList.contains("table__action-button--disable")) {
			updateInsumoStatus([id], "deshabilitado");
			await toggleInsumoStatus(id, "deshabilitado");
			renderPaginatedTable(filteredInsumos);
		}
	});

	// Inicializar datos y render
	filteredInsumos = await fetchInsumosFromAPI();
	renderPaginatedTable(filteredInsumos);
});
