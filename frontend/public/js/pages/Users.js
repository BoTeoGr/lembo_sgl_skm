import { usersConfig } from "../config/usersConfig.js";

// Función para mostrar toasts en la página de usuarios
function showToast(title, message, type = "success") {
	const toast = document.getElementById("userToast");
	const toastTitle = document.getElementById("userToastTitle");
	const toastDescription = document.getElementById("userToastDescription");
	const toastIcon = document.getElementById("userToastIcon");
	const toastProgress = document.querySelector(".user-toast-progress");

	if (
		!toast ||
		!toastTitle ||
		!toastDescription ||
		!toastIcon ||
		!toastProgress
	) {
		console.error("No se encontraron los elementos del toast de usuario");
		return;
	}

	// Establecer el contenido del toast
	toastTitle.textContent = title;
	toastDescription.textContent = message;

	// Establecer el icono según el tipo
	toast.className = "user-toast";
	switch (type) {
		case "success":
			toastIcon.className = "fas fa-check-circle";
			toast.classList.add("success");
			break;
		case "error":
			toastIcon.className = "fas fa-exclamation-circle";
			toast.classList.add("error");
			break;
		case "warning":
			toastIcon.className = "fas fa-exclamation-triangle";
			toast.classList.add("warning");
			break;
		case "info":
			toastIcon.className = "fas fa-info-circle";
			toast.classList.add("info");
			break;
		default:
			toastIcon.className = "fas fa-info-circle";
			toast.classList.add("info");
	}

	// Mostrar el toast
	toast.classList.remove("hidden");

	// Resetear y animar la barra de progreso
	toastProgress.style.transform = "scaleX(1)";
	toastProgress.style.transition = "none";
	toastProgress.offsetHeight; // Forzar reflow

	// Iniciar animación de la barra de progreso
	setTimeout(() => {
		toastProgress.style.transition = "transform 4.5s linear";
		toastProgress.style.transform = "scaleX(0)";
	}, 50);

	// Ocultar el toast después de 5 segundos
	setTimeout(() => {
		toast.classList.add("hidden");
		toastProgress.style.transition = "none";
		toastProgress.style.transform = "scaleX(1)";
	}, 5000);
}

document.addEventListener("DOMContentLoaded", async () => {
	// Pequeño delay para asegurar que todos los componentes estén cargados
	setTimeout(async () => {
		let currentPage = 1;
		const itemsPerPage = usersConfig.table.itemsPerPage || 10;
		let filteredUsers = [];
		let allUsers = [];

		// Normaliza cualquier representación de estado a forma canónica para comparar
		function normalizeStatusForCompare(value) {
			if (value === null || value === undefined) return "";
			if (typeof value === "boolean") return value ? "activo" : "inactivo";
			if (typeof value === "number") return value === 1 ? "activo" : "inactivo";
			const str = String(value).trim().toLowerCase();
			if (
				["habilitado", "activo", "true", "1", "enable", "enabled"].includes(str)
			)
				return "activo";
			if (
				[
					"deshabilitado",
					"inactivo",
					"false",
					"0",
					"disable",
					"disabled",
				].includes(str)
			)
				return "inactivo";
			return str;
		}

		// Cargar datos iniciales
		filteredUsers = await fetchUsersFromAPI();
		allUsers = Array.isArray(filteredUsers) ? [...filteredUsers] : [];
		// Si fetchUsersFromAPI retorna null, significa que no hay permiso y ya se mostró el mensaje
		if (filteredUsers === null) return;
		renderPaginatedTable(filteredUsers);

		// Filtros
		const searchInput = document.querySelector(".filters__search");
		const rolSelect = document.querySelector('select[placeholder="Rol"]');
		const estadoSelect = document.querySelector('select[placeholder="Estado"]');
		const clearBtn = document.querySelector(".button--clear");

		// --- Obtener usuarios desde la API ---
		async function fetchUsersFromAPI() {
			try {
				const token = localStorage.getItem("token");
				const response = await fetch(
					"http://localhost:5000/usuarios?limit=1000",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (response.status === 403) {
					renderNoPermissionTable();
					return null;
				}
				if (!response.ok)
					throw new Error("Error al obtener usuarios de la API");
				const data = await response.json();
				console.log("API Response:", data);
				// Si la respuesta es un array o tiene la clave 'usuarios'
				const usuariosArr = data.usuarios || [];
				// Normalizar campos y estado
				return usuariosArr.map((user) => {
					let status = user.estado;
					// Normalización de estado flexible
					if (typeof status === "boolean") {
						status = status ? "Activo" : "Inactivo";
					} else if (typeof status === "number") {
						status = status === 1 ? "Activo" : "Inactivo";
					} else if (typeof status === "string") {
						const estadoLower = status.trim().toLowerCase();
						if (["habilitado", "activo", "true", "1"].includes(estadoLower)) {
							status = "Activo";
						} else if (
							["deshabilitado", "inactivo", "false", "0"].includes(estadoLower)
						) {
							status = "Inactivo";
						} else {
							// Valor no reconocido: mantener como está pero capitalizar si coincide
							status = status.charAt(0).toUpperCase() + status.slice(1);
						}
					} else {
						status = "Inactivo";
					}
					return {
						id: user.id || user.numero_documento || "",
						nombre: user.nombre || "",
						correo: user.correo || user.email || "",
						tipoDocumento:
							user.tipoDocumento || user.tipo_doc || user.tipo_documento || "",
						numeroDocumento:
							user.numeroDocumento ||
							user.num_doc ||
							user.numero_doc ||
							user.numero_documento ||
							"",
						telefono: user.telefono || user.celular || "",
						rol: user.rol || "",
						estado: status,
						imagen: user.imagen || "",
					};
				});
			} catch (e) {
				// Si el error es de permisos, mostrar mensaje y no datos locales
				if (e.message && e.message.toLowerCase().includes("permiso")) {
					renderNoPermissionTable();
					return null;
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
          <td class="table__cell" colspan="7" style="text-align: center; color: rgb(253,195,0);">
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
          <td class="table__cell" colspan="7" style="text-align: center; color: rgb(253,195,0);">
            <span style="font-size:2rem;vertical-align:middle;">&#9888;</span><br>
            ${msg || "Error al cargar los datos"}
          </td>
        </tr>
      `;
			}
		}

		async function getFilteredUsers() {
			try {
				// Obtener los valores actuales de los filtros
				const search = searchInput?.value?.toLowerCase() || "";
				const rol = rolSelect?.value || "";
				const estado = estadoSelect?.value || "";

				// Si no hay filtros aplicados, devolver todos los usuarios
				if (!search && !rol && !estado) {
					return Array.isArray(allUsers) ? [...allUsers] : [];
				}

				// Aplicar filtros
				const source = Array.isArray(allUsers) ? allUsers : [];
				return source.filter((user) => {
					// Filtrar por búsqueda (nombre o ID)
					const matchesSearch =
						!search ||
						(user.nombre && user.nombre.toLowerCase().includes(search)) ||
						(user.id && String(user.id).toLowerCase().includes(search)) ||
						(user.numeroDocumento &&
							String(user.numeroDocumento).toLowerCase().includes(search));

					// Filtrar por rol
					const matchesRol = !rol || (user.rol && user.rol === rol);

					// Filtrar por estado (comparación robusta)
					const matchesEstado =
						!estado ||
						normalizeStatusForCompare(user.estado) ===
							normalizeStatusForCompare(estado);

					return matchesSearch && matchesRol && matchesEstado;
				});
			} catch (error) {
				console.error("Error al filtrar usuarios:", error);
				return [];
			}
		}

		function renderUsersTable(data) {
			const tbody = document.querySelector(".table__body");
			if (!data || data.length === 0) {
				tbody.innerHTML = `
        <tr class="table__row">
          <td class="table__cell" colspan="7" style="text-align: center;">No se encontraron usuarios</td>
        </tr>
      `;
				return;
			}

			// Obtener el rol del usuario actual
			const currentUserRole =
				localStorage.getItem("userRole") ||
				localStorage.getItem("userRol") ||
				"";
			console.log("Current user role from localStorage:", currentUserRole);
			const isSuperAdmin = currentUserRole.toLowerCase().includes("super");

			tbody.innerHTML = data
				.map((user) => {
					// Solo mostrar botón de cambiar estado si es super administrador
					const statusButton = isSuperAdmin
						? `<button class="table__action-button table__action-button--${
								user.estado === "Activo" ? "disable" : "enable"
						  }">
             <span class="material-symbols-outlined">power_settings_new</span>
           </button>`
						: "";

					return `
        <tr class="table__row">
          <td class="table__cell table__cell--checkbox">
            <input type="checkbox" class="table__checkbox" />
          </td>
          <td class="table__cell table__cell--id">${user.id}</td>
          <td class="table__cell table__cell--name">${user.nombre}</td>
          <td class="table__cell table__cell--role">${user.rol}</td>
          <td class="table__cell table__cell--phone">${user.telefono}</td>
          <td class="table__cell table__cell--status">
            <span class="badge badge--${
							user.estado === "Activo" ? "active" : "inactive"
						}">${user.estado}</span>
          </td>
          <td class="table__cell table__cell--actions">
            <button class="table__action-button table__action-button--view">
              <span class="material-symbols-outlined">visibility</span>
            </button>
            <button class="table__action-button table__action-button--edit" onclick="window.location.href='actualizar-usuario.html?id=${
							user.id
						}'">
              <span class="material-symbols-outlined">edit</span>
            </button>
            ${statusButton}
          </td>
        </tr>
      `;
				})
				.join("");
		}

		function renderPaginatedTable(list) {
			const total = list.length;
			const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
			if (currentPage > totalPages) currentPage = totalPages;
			const startIdx = (currentPage - 1) * itemsPerPage;
			const endIdx = Math.min(startIdx + itemsPerPage, total);
			const pageUsers = list.slice(startIdx, endIdx);
			renderUsersTable(pageUsers);
			renderPaginationInfo(startIdx, endIdx, total);
			renderPaginationControls(totalPages);
			updateSelectionCount();
		}

		function renderPaginationInfo(startIdx, endIdx, total) {
			const currentPageSpan = document.querySelector(
				".pagination__current-page"
			);
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
					renderPaginatedTable(filteredUsers);
				}
			};
			nextBtn.onclick = () => {
				if (currentPage < totalPages) {
					currentPage++;
					renderPaginatedTable(filteredUsers);
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
						renderPaginatedTable(filteredUsers);
					}
				};
			});
		}

		async function applyFilters() {
			try {
				currentPage = 1; // Reset to first page when filters change
				const filtered = await getFilteredUsers();
				// Actualizar dataset actual para que la paginación use el filtrado
				filteredUsers = filtered;
				renderPaginatedTable(filteredUsers);

				// Actualizar el contador de resultados
				const resultCount = document.querySelector(".pagination__total-items");
				if (resultCount) {
					const total = filtered.length;
					resultCount.textContent = total;

					// Actualizar el rango mostrado
					const startIdx = (currentPage - 1) * itemsPerPage + 1;
					const endIdx = Math.min(startIdx + itemsPerPage - 1, total);
					const currentPageSpan = document.querySelector(
						".pagination__current-page"
					);
					const itemsPerPageSpan = document.querySelector(
						".pagination__items-per-page"
					);

					if (currentPageSpan) currentPageSpan.textContent = startIdx;
					if (itemsPerPageSpan) itemsPerPageSpan.textContent = endIdx;
				}
			} catch (error) {
				console.error("Error al aplicar filtros:", error);
				renderErrorTable("Error al aplicar los filtros");
			}
		}

		// Función debounce para el input de búsqueda
		function debounce(func, wait) {
			let timeout;
			return function executedFunction(...args) {
				const later = () => {
					clearTimeout(timeout);
					func(...args);
				};
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
			};
		}

		// Aplicar filtros con debounce
		const debouncedApplyFilters = debounce(applyFilters, 300);

		// Event listeners para los filtros
		searchInput?.addEventListener("input", debouncedApplyFilters);
		rolSelect?.addEventListener("change", applyFilters);
		estadoSelect?.addEventListener("change", applyFilters);

		// Limpiar filtros
		clearBtn?.addEventListener("click", async () => {
			if (searchInput) searchInput.value = "";
			if (rolSelect) rolSelect.value = "";
			if (estadoSelect) estadoSelect.value = "";
			// Restaurar desde allUsers sin convertir filteredUsers en una promesa
			filteredUsers = Array.isArray(allUsers) ? [...allUsers] : [];
			currentPage = 1;
			renderPaginatedTable(filteredUsers);
		});

		// Event listeners para mostrar/ocultar panel de filtros
		const toggleFiltersBtn = document.getElementById("toggleFiltersBtn");
		const filtersPanel = document.getElementById("filtersPanel");
		const closeFiltersBtn = document.getElementById("closeFiltersBtn");

		if (toggleFiltersBtn && filtersPanel) {
			toggleFiltersBtn.addEventListener("click", () => {
				filtersPanel.classList.toggle("hidden");
			});
		}

		if (closeFiltersBtn && filtersPanel) {
			closeFiltersBtn.addEventListener("click", () => {
				filtersPanel.classList.add("hidden");
			});
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
		const initializeHeaderCheckbox = () => {
			let headerCheckbox = document.querySelector(".table__checkbox-header");
			if (!headerCheckbox) {
				// Si no existe, lo agregamos dinámicamente
				const th = document.createElement("th");
				th.className = "table__cell table__cell--checkbox";
				th.innerHTML =
					'<input type="checkbox" class="table__checkbox-header" />';
				const theadRow = document.querySelector(".table__head .table__row");
				if (theadRow) theadRow.insertBefore(th, theadRow.firstChild);
				headerCheckbox = document.querySelector(".table__checkbox-header");
			}
			if (headerCheckbox) {
				headerCheckbox.addEventListener("change", function () {
					const checked = this.checked;
					document.querySelectorAll(".table__checkbox").forEach((cb) => {
						cb.checked = checked;
					});
					const bar = document.querySelector(".actions-bar__checkbox");
					if (bar) bar.checked = checked;
					updateSelectionCount();
				});
			}
		};

		initializeHeaderCheckbox();

		// Acciones de habilitar/deshabilitar (por fila)
		document
			.querySelector(".table__body")
			.addEventListener("click", async (e) => {
				const btn = e.target.closest("button");
				if (!btn) return;
				const row = btn.closest("tr");
				const id = row.querySelector(".table__cell--id").textContent;
				if (btn.classList.contains("table__action-button--view")) {
					try {
						const token = localStorage.getItem("token");
						if (!token) {
							throw new Error("No se encontró el token de autenticación");
						}
						const response = await fetch(
							`http://localhost:5000/usuarios/${id}`,
							{
								headers: {
									Authorization: `Bearer ${token}`,
									"Content-Type": "application/json",
								},
							}
						);
						if (!response.ok)
							throw new Error("Error al obtener los detalles del usuario");
						const usuario = await response.json();
						showUsuarioModal(usuario);
					} catch (error) {
						console.error("Error al cargar el usuario:", error);
						alert("No se pudo cargar la información del usuario");
					}
					return;
				} else if (btn.classList.contains("table__action-button--edit")) {
					window.location.href = `actualizar-usuario.html?id=${id}`;
				} else if (btn.classList.contains("table__action-button--enable")) {
					await toggleUserStatus(id, "Activo");
					renderPaginatedTable(filteredUsers);
				} else if (btn.classList.contains("table__action-button--disable")) {
					await toggleUserStatus(id, "Deshabilitado");
					renderPaginatedTable(filteredUsers);
				}
			});

		// Función para cambiar el estado de un usuario
		async function toggleUserStatus(userId, newStatus) {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					throw new Error("No se encontró el token de autenticación");
				}

				const response = await fetch(
					`http://localhost:5000/usuarios/${userId}/estado`,
					{
						method: "PUT",
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
							Accept: "application/json",
						},
						body: JSON.stringify({
							estado: newStatus === "Activo" ? "habilitado" : "deshabilitado",
						}),
					}
				);

				const responseData = await response.json();

				if (!response.ok) {
					// Mapear mensajes de error del backend a mensajes más amigables
					const errorMessages = {
						"No puedes deshabilitar a otro Super Administrador":
							"No tiene permisos para deshabilitar a otro Super Administrador",
						"Solo un Super Administrador puede modificar el estado de los usuarios":
							"Solo un Super Administrador puede modificar el estado de los usuarios",
						"Error al actualizar estado de usuario":
							"Ocurrió un error al actualizar el estado del usuario",
					};

					const errorMessage =
						errorMessages[responseData.error] ||
						responseData.error ||
						"Error al actualizar el estado del usuario";
					throw new Error(errorMessage);
				}

				// Mostrar mensaje de éxito
				showToast(
					"Éxito",
					`El estado del usuario ha sido actualizado a ${newStatus}`,
					"success"
				);

				// Actualizar la lista de usuarios y el respaldo
				filteredUsers = await fetchUsersFromAPI();
				allUsers = Array.isArray(filteredUsers) ? [...filteredUsers] : [];
				return true;
			} catch (error) {
				console.error("Error al cambiar el estado del usuario:", error);
				// Mostrar mensaje de error
				if (typeof showToast === "function") {
					showToast("Error", error.message, "error");
				} else {
					alert(error.message);
				}
				return false;
			}
		}

		// Acciones de habilitar/deshabilitar masivo
		const enableBtn = document.querySelector(".button--enable");
		const disableBtn = document.querySelector(".button--disable");

		// Ocultar botones de acciones masivas si no es super administrador
		const currentUserRole =
			localStorage.getItem("userRole") || localStorage.getItem("userRol") || "";
		const isSuperAdmin = currentUserRole.toLowerCase().includes("super");
		console.log(
			"Bulk actions - Current user role:",
			currentUserRole,
			"isSuperAdmin:",
			isSuperAdmin
		);
		if (!isSuperAdmin) {
			if (enableBtn) enableBtn.style.display = "none";
			if (disableBtn) disableBtn.style.display = "none";
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
			// Actualiza ambos checkboxes de cabecera según selección
			const header = document.querySelector(".table__checkbox-header");
			const bar = document.querySelector(".actions-bar__checkbox");
			if (header) header.checked = selected === total && total > 0;
			if (bar) bar.checked = selected === total && total > 0;
		}

		document
			.querySelector(".table__body")
			.addEventListener("change", updateSelectionCount);

		enableBtn.addEventListener("click", async () => {
			const ids = getSelectedIds();
			if (ids.length === 0) return;
			await Promise.all(ids.map((id) => toggleUserStatus(id, "Activo")));
			renderPaginatedTable(filteredUsers);
			document.querySelector(".actions-bar__checkbox").checked = false;
			document.querySelector(".table__checkbox-header").checked = false;
		});
		disableBtn.addEventListener("click", async () => {
			const ids = getSelectedIds();
			if (ids.length === 0) return;
			await Promise.all(ids.map((id) => toggleUserStatus(id, "Inactivo")));
			renderPaginatedTable(filteredUsers);
			document.querySelector(".actions-bar__checkbox").checked = false;
			document.querySelector(".table__checkbox-header").checked = false;
		});

		// Selección masiva (actions-bar)
		document
			.querySelector(".actions-bar__checkbox")
			.addEventListener("change", function () {
				const checked = this.checked;
				document.querySelectorAll(".table__checkbox").forEach((cb) => {
					cb.checked = checked;
				});
				// Sincroniza el checkbox-header
				const thHeader = document.querySelector(".table__checkbox-header");
				if (thHeader) thHeader.checked = checked;
				updateSelectionCount();
			});

		// Selección masiva desde el th (checkbox-header)
		const thHeader = document.querySelector(".table__checkbox-header");
		if (thHeader) {
			thHeader.addEventListener("change", function () {
				const checked = this.checked;
				document.querySelectorAll(".table__checkbox").forEach((cb) => {
					cb.checked = checked;
				});
				// Sincroniza el de actions-bar
				const bar = document.querySelector(".actions-bar__checkbox");
				if (bar) bar.checked = checked;
				updateSelectionCount();
			});
		}

		// Mapeo de tipos de documento
		const documentTypes = {
			cc: "Cédula de ciudadanía",
			ti: "Tarjeta de identidad",
			ce: "Cédula de extranjería",
			pep: "Permiso especial de permanencia",
			ppt: "Permiso por protección temporal",
		};

		// --- Modal Visualizar Usuario ---
		function showUsuarioModal(usuario) {
			// Obtener el tipo de documento legible
			const tipoDocumento =
				documentTypes[usuario.tipo_documento?.toLowerCase()] ||
				usuario.tipo_documento ||
				"-";

			document.getElementById("modalUsuarioId").textContent = usuario.id || "";
			document.getElementById("modalUsuarioNombre").textContent =
				usuario.nombre || "";
			document.getElementById("modalUsuarioCorreo").textContent =
				usuario.correo || usuario.email || "-";
			document.getElementById("modalUsuarioTipoDoc").textContent =
				tipoDocumento;
			document.getElementById("modalUsuarioNumDoc").textContent =
				usuario.numeroDocumento ||
				usuario.numero_documento ||
				usuario.numero_doc ||
				"-";
			document.getElementById("modalUsuarioTelefono").textContent =
				usuario.telefono || usuario.celular || "-";
			document.getElementById("modalUsuarioRol").textContent =
				usuario.rol || "-";
			document.getElementById("modalUsuarioEstado").textContent =
				usuario.estado || "-";

			const imgElem = document.getElementById("modalUsuarioImagen");
			if (imgElem) {
				imgElem.src = usuario.imagen || "../imgs/default-user.jpg";
				imgElem.alt = usuario.nombre || "Imagen de usuario";
			}
			document
				.getElementById("viewUsuarioModal")
				.classList.add("modal--active");
		}

		// Cerrar modal
		document.getElementById("closeViewUsuarioModal").onclick = () => {
			document
				.getElementById("viewUsuarioModal")
				.classList.remove("modal--active");
		};
		document.getElementById("closeViewUsuarioBtn").onclick = () => {
			document
				.getElementById("viewUsuarioModal")
				.classList.remove("modal--active");
		};

		// --- FUNCIONALIDAD DEL MODAL DE REPORTES ---
		const reportModal = document.getElementById("reportModal");
		const reportBtn = document.querySelector(".button--report");
		const cancelReportBtn = document.getElementById("cancelReportBtn");
		const generateReportBtn = document.getElementById("generateReportBtn");
		const closeReportModal = document.getElementById("closeReportModal");

		// Debug: verificar que se encuentren todos los elementos
		if (!reportModal || !reportBtn || !generateReportBtn) {
			console.error("Faltan elementos del modal de reportes:", {
				reportModal: !!reportModal,
				reportBtn: !!reportBtn,
				generateReportBtn: !!generateReportBtn,
			});
		}

		// Mostrar modal de reportes
		if (reportBtn && reportModal) {
			reportBtn.addEventListener("click", () => {
				reportModal.classList.add("modal--active");
				// Establecer fecha por defecto (último mes)
				const today = new Date();
				const lastMonth = new Date(
					today.getFullYear(),
					today.getMonth() - 1,
					today.getDate()
				);

				const startDateInput = document.getElementById("reportStartDate");
				const endDateInput = document.getElementById("reportEndDate");

				if (startDateInput)
					startDateInput.value = lastMonth.toISOString().split("T")[0];
				if (endDateInput)
					endDateInput.value = today.toISOString().split("T")[0];
			});
		}

		// Cerrar modal de reportes
		if (cancelReportBtn && reportModal) {
			cancelReportBtn.addEventListener("click", () => {
				reportModal.classList.remove("modal--active");
			});
		}

		if (closeReportModal && reportModal) {
			closeReportModal.addEventListener("click", () => {
				reportModal.classList.remove("modal--active");
			});
		}

		// Cerrar modal al hacer clic fuera de él
		if (reportModal) {
			reportModal.addEventListener("click", (e) => {
				if (e.target === reportModal) {
					reportModal.classList.remove("modal--active");
				}
			});
		}

		// Generar reporte
		if (generateReportBtn && reportModal) {
			generateReportBtn.addEventListener("click", async (e) => {
				e.preventDefault();

				try {
					const format =
						document.getElementById("reportFormat")?.value || "excel";
					const includeInactive =
						document.getElementById("includeInactive")?.checked || false;
					const includeRoles =
						document.getElementById("includeRoles")?.checked || false;
					const startDate = document.getElementById("reportStartDate")?.value;
					const endDate = document.getElementById("reportEndDate")?.value;

					console.log("Generando reporte:", {
						format,
						includeInactive,
						includeRoles,
						usuarios: allUsers.length,
					});

					// Determinar qué usuarios incluir en el reporte
					let reportUsers = [];
					if (includeInactive) {
						// Incluir todos los usuarios (activos e inactivos)
						reportUsers = [...allUsers];
					} else {
						// Solo usuarios activos
						reportUsers = allUsers.filter((user) => user.estado === "Activo");
					}

					if (reportUsers.length === 0) {
						showToast(
							"Advertencia",
							"No hay usuarios para incluir en el reporte",
							"warning"
						);
						return;
					}

					// Definir las columnas del reporte
					const baseColumns = ["ID", "Nombre", "Correo", "Teléfono", "Estado"];
					if (includeRoles) {
						baseColumns.splice(4, 0, "Rol"); // Insertar Rol antes de Estado
					}

					// Preparar los datos para el reporte
					const reportData = reportUsers.map((user) => {
						const row = {
							ID: user.id || "",
							Nombre: user.nombre || "",
							Correo: user.correo || "",
							Teléfono: user.telefono || "",
						};

						if (includeRoles) {
							row["Rol"] = user.rol || "";
						}

						row["Estado"] = user.estado || "Inactivo";

						return row;
					});

					// Generar el reporte según el formato seleccionado
					const fecha = new Date()
						.toLocaleDateString("es-ES")
						.replace(/\//g, "-");
					const filename = `reporte_usuarios_${fecha}`;

					if (format === "csv") {
						generateCSVReport(reportData, baseColumns, filename);
					} else if (format === "excel") {
						generateExcelReport(reportData, baseColumns, filename);
					} else if (format === "pdf") {
						generatePDFReport(reportData, baseColumns, filename);
					} else {
						console.error("Formato no reconocido:", format);
						showToast("Error", "Formato de reporte no válido", "error");
						return;
					}

					showToast("Éxito", "Reporte generado exitosamente", "success");
					reportModal.classList.remove("modal--active");
				} catch (error) {
					console.error("Error al generar reporte:", error);
					showToast("Error", "No se pudo generar el reporte", "error");
				}
			});
		}

		// Funciones para generar reportes en diferentes formatos
		function generateCSVReport(data, columns, filename) {
			const BOM = "\uFEFF"; // Byte Order Mark para UTF-8
			const header = columns.map((col) => `"${col}"`).join(",");
			const rows = data
				.map((row) =>
					columns
						.map((col) => `"${String(row[col] || "").replace(/"/g, '""')}"`)
						.join(",")
				)
				.join("\n");

			const csv = `${BOM}${header}\n${rows}`;
			downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8");
		}

		function generateExcelReport(data, columns, filename) {
			// Implementación simple de Excel usando formato XML
			const xmlHeader = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="Usuarios">
<Table>`;

			const xmlFooter = `</Table>
</Worksheet>
</Workbook>`;

			// Generar header
			const headerRow = `<Row>${columns
				.map(
					(col) =>
						`<Cell><Data ss:Type="String">${escapeXml(col)}</Data></Cell>`
				)
				.join("")}</Row>`;

			// Generar filas de datos
			const dataRows = data
				.map(
					(row) =>
						`<Row>${columns
							.map(
								(col) =>
									`<Cell><Data ss:Type="String">${escapeXml(
										String(row[col] || "")
									)}</Data></Cell>`
							)
							.join("")}</Row>`
				)
				.join("");

			const xmlContent = xmlHeader + headerRow + dataRows + xmlFooter;

			downloadFile(xmlContent, `${filename}.xlsx`, "application/vnd.ms-excel");
		}

		function escapeXml(text) {
			return String(text)
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#39;");
		}

		function generatePDFReport(data, columns, filename) {
			// Generar HTML que se puede imprimir como PDF
			const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte de Usuarios</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #39a900; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #39a900; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .header-info { margin-bottom: 20px; }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header-info">
        <h1>Reporte de Usuarios</h1>
        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString(
					"es-ES"
				)}</p>
        <p><strong>Total de usuarios:</strong> ${data.length}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                ${columns.map((col) => `<th>${col}</th>`).join("")}
            </tr>
        </thead>
        <tbody>
            ${data
							.map(
								(row) => `
                <tr>
                    ${columns
											.map((col) => `<td>${row[col] || ""}</td>`)
											.join("")}
                </tr>
            `
							)
							.join("")}
        </tbody>
    </table>
    
    <div class="no-print" style="margin-top: 20px; text-align: center;">
        <p>Para guardar como PDF: Ctrl+P → Destino: Guardar como PDF</p>
        <button onclick="window.print()">Imprimir / Guardar como PDF</button>
        <button onclick="window.close()">Cerrar</button>
    </div>
</body>
</html>`;

			// Abrir en nueva ventana para imprimir/guardar como PDF
			const newWindow = window.open("", "_blank");
			newWindow.document.write(htmlContent);
			newWindow.document.close();

			// Auto-trigger print dialog after a short delay
			setTimeout(() => {
				newWindow.print();
			}, 500);
		}

		function downloadFile(content, filename, mimeType) {
			const blob = new Blob([content], { type: mimeType });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}
	}, 100); // Delay de 100ms para asegurar que todos los componentes estén cargados
});
