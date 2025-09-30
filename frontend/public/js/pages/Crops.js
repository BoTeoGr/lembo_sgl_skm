import { cropsConfig } from '../config/cropsConfig.js';

// Nueva función para cargar datos desde la API (si existe)
async function fetchCropsFromAPI() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/cultivos?limit=1000', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status === 403) {
            renderNoPermissionTable();
            return null;
        }
        if (!response.ok) throw new Error('Error al obtener cultivos de la API');
        const data = await response.json();
        const cultivos = Array.isArray(data) ? data : (data.cultivos || []);
        return cultivos.map(cultivo => {
            let status = cultivo.estado || cultivo.status || '';
            if (typeof status === 'string') {
                const estadoLower = status.trim().toLowerCase();
                if (["habilitado", "activo", "enabled"].includes(estadoLower)) {
                    status = 'Activo';
                } else if (["deshabilitado", "inhabilitado", "inactivo", "disabled"].includes(estadoLower)) {
                    status = 'Inhabilitado';
                }
            }
            return {
                id: cultivo.cultivoId || cultivo.id || '',
                idLabel: cultivo.id || cultivo.cultivoId || '',
                name: cultivo.nombre || cultivo.name || '',
                type: cultivo.tipo || cultivo.type || '',
                location: cultivo.ubicacion || cultivo.location || '',
                area: cultivo.tamano || cultivo.area || '',
                status,
                description: cultivo.descripcion || cultivo.description || '',
                createdAt: cultivo.fecha_creacion || cultivo.fechaCreacion || cultivo.createdAt || '',
            };
        });
    } catch (e) {
        // Si el error es de permisos, mostrar mensaje y no datos locales
        if (e.message && e.message.toLowerCase().includes('permiso')) {
            renderNoPermissionTable();
            return null;
        }
        // Otro error: mostrar mensaje genérico
        renderErrorTable(e.message);
        return [];
    }
}

function renderNoPermissionTable() {
    const tbody = document.querySelector('.table__body');
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
    const tbody = document.querySelector('.table__body');
    if (tbody) {
        tbody.innerHTML = `
            <tr class="table__row">
                <td class="table__cell" colspan="8" style="text-align: center; color: rgb(253,195,0);">
                    <span style="font-size:2rem;vertical-align:middle;">&#9888;</span><br>
                    ${msg || 'Error al cargar los datos'}
                </td>
            </tr>
        `;
    }
}
// --- Función para actualizar estado en backend ---
async function toggleCultivoStatus(id, nuevoEstado) {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/cultivos/${id}/estado`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
    });
}

class Crops {
    constructor() {
        try {
            this.currentPage = 1;
            this.itemsPerPage = (cropsConfig && cropsConfig.table && cropsConfig.table.itemsPerPage) || 10;
            this.originalData = [];
            this.filteredData = [];
            this.selectedCrops = new Set();
            this.isVisitante = this.checkIfVisitante();
            
            // Initialize UI components first
            this.initializeUI();
            
            // Then load data
            this.loadData().catch(error => {
                console.error('Error loading data:', error);
                this.showError('Error al cargar los datos');
            });
        } catch (error) {
            console.error('Error in Crops constructor:', error);
            this.showError('Error al inicializar la página');
        }
    }
    
    checkIfVisitante() {
        const userRole = localStorage.getItem('userRol') || '';
        return userRole.toLowerCase() === 'visitante';
    }
    

    
    initializeUI() {
        // Initialize any UI components here
        const loadingRow = document.querySelector('.table__body');
        if (loadingRow) {
            loadingRow.innerHTML = `
                <tr class="table__row">
                    <td colspan="8" class="table__cell table__cell--loading">
                        <div class="loading-spinner"></div>
                        <p>Cargando cultivos...</p>
                    </td>
                </tr>
            `;
        }
        
        // Update UI based on user role
        this.updateUIForVisitante();
    }
    
    showError(message) {
        const tbody = document.querySelector('.table__body');
        if (tbody) {
            tbody.innerHTML = `
                <tr class="table__row">
                    <td class="table__cell" colspan="8" style="text-align: center; color: #ff4d4f;">
                        ${message}
                    </td>
                </tr>
            `;
        }
    }

    async loadData() {
        const data = await fetchCropsFromAPI();
        // Si fetchCropsFromAPI retorna null, significa que no hay permiso y ya se mostró el mensaje
        if (data === null) return;
        this.originalData = [...data];
        this.filteredData = [...data];
        this.renderTable();
        this.updatePagination();
        this.initializeEventListeners();
    }

    filterData() {
        try {
            const filtersPanel = document.querySelector('.filters');
            const searchInput = document.querySelector('.filters__search');
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            
            // Mostrar el panel de filtros si está oculto cuando se está buscando
            if (searchTerm && filtersPanel && filtersPanel.classList.contains('hidden')) {
                filtersPanel.classList.remove('hidden');
            }
            
            // Asegurarse de que originalData sea un array
            if (!Array.isArray(this.originalData)) {
                console.error('originalData no es un array:', this.originalData);
                this.originalData = [];
            }
            
            // Si no hay término de búsqueda, mostrar todos los datos
            if (!searchTerm.trim()) {
                this.filteredData = [...this.originalData];
            } else {
                // Filtrar los datos basados en el término de búsqueda
                this.filteredData = this.originalData.filter(crop => {
                    if (!crop) return false;
                    
                    // Buscar en múltiples campos
                    return (
                        (crop.id && crop.id.toString().toLowerCase().includes(searchTerm)) ||
                        (crop.name && crop.name.toLowerCase().includes(searchTerm)) ||
                        (crop.type && crop.type.toLowerCase().includes(searchTerm)) ||
                        (crop.location && crop.location.toLowerCase().includes(searchTerm)) ||
                        (crop.status && crop.status.toString().toLowerCase().includes(searchTerm)) ||
                        (crop.description && crop.description.toLowerCase().includes(searchTerm))
                    );
                });
            }
        
            // Reiniciar a la primera página después de filtrar
            this.currentPage = 1;
            
            // Actualizar la tabla y la paginación
            this.renderTable();
            this.updatePagination();
            
            // Actualizar el contador de elementos seleccionados
            if (typeof this.updateSelectedCount === 'function') {
                this.updateSelectedCount();
            }
            
            // Mantener el foco en el campo de búsqueda
            if (searchInput) {
                searchInput.focus();
            }
        } catch (error) {
            console.error('Error en filterData:', error);
            // Asegurarse de que filteredData siempre sea un array
            this.filteredData = [];
            if (typeof this.renderTable === 'function') {
                this.renderTable();
            }
        }
    }
    
    initializeEventListeners() {
        // Botón de filtros
        const filterButton = document.querySelector('.button--filter');
        const filtersClose = document.querySelector('.filters__close');
        const filtersSearch = document.querySelector('.filters__search');
        const clearFiltersButton = document.querySelector('.button--clear');
        
        // Mostrar/ocultar panel de filtros
        if (filterButton && filtersClose) {
            filterButton.addEventListener('click', () => {
                document.querySelector('.filters').classList.toggle('hidden');
            });
            filtersClose.addEventListener('click', () => {
                document.querySelector('.filters').classList.add('hidden');
            });
        }
        
        // Búsqueda en tiempo real
        if (filtersSearch) {
            // Usar un debounce para evitar múltiples renderizados rápidos
            let searchTimeout;
            filtersSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterData();
                    // Mantener el valor en la URL para persistencia
                    const searchParams = new URLSearchParams(window.location.search);
                    if (e.target.value) {
                        searchParams.set('search', e.target.value);
                    } else {
                        searchParams.delete('search');
                    }
                    const newUrl = window.location.pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
                    window.history.pushState({ path: newUrl }, '', newUrl);
                }, 300); // 300ms de retraso
            });
            
            // Cargar búsqueda desde la URL si existe
            const urlParams = new URLSearchParams(window.location.search);
            const savedSearch = urlParams.get('search');
            if (savedSearch) {
                filtersSearch.value = savedSearch;
                this.filterData();
            }
        }
        
        // Botón para limpiar filtros
        if (clearFiltersButton) {
            clearFiltersButton.addEventListener('click', (e) => {
                e.preventDefault();
                const searchInput = document.querySelector('.filters__search');
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                    this.filterData();
                }
            });
        }
        this.setupPaginationEvents();
        // --- Selección masiva: imita lógica de Sensores ---
        const checkboxHeader = document.querySelector('.table__checkbox-header');
        const actionsBarCheckbox = document.querySelector('.actions-bar__checkbox');
        // Encabezado de la tabla
        if (checkboxHeader) {
            checkboxHeader.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.table__checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    this.updateSelectedCrops(checkbox, checkbox.dataset.id);
                });
                // Sincroniza el de la barra
                if (actionsBarCheckbox) actionsBarCheckbox.checked = e.target.checked;
                this.updateHeaderCheckbox();
            });
        }
        // Checkbox de la barra superior
        if (actionsBarCheckbox) {
            actionsBarCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.table__checkbox');
                if (e.target.checked) {
                    // Selecciona todos los filtrados
                    this.filteredData.forEach(crop => {
                        this.selectedCrops.add(crop.id);
                    });
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = true;
                        this.updateSelectedCrops(checkbox, checkbox.dataset.id);
                    });
                } else {
                    // Deselecciona todos
                    this.selectedCrops.clear();
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = false;
                        this.updateSelectedCrops(checkbox, checkbox.dataset.id);
                    });
                }
                // Sincroniza el de la cabecera
                if (checkboxHeader) checkboxHeader.checked = e.target.checked;
                this.updateHeaderCheckbox();
            });
        }
        // Botón habilitar seleccionados (nuevo selector, compatible con múltiples botones)
        document.querySelectorAll('.button--enable').forEach(enableBtn => {
            enableBtn.addEventListener('click', () => {
                if (!this.selectedCrops) return;
                this.filteredData.forEach(crop => {
                    if (this.selectedCrops.has(crop.id)) {
                        crop.status = 'Activo';
                    }
                });
                this.renderTable();
            });
        });
        // Botón deshabilitar seleccionados (nuevo selector, compatible con múltiples botones)
        document.querySelectorAll('.button--disable').forEach(disableBtn => {
            disableBtn.addEventListener('click', () => {
                if (!this.selectedCrops) return;
                this.filteredData.forEach(crop => {
                    if (this.selectedCrops.has(crop.id)) {
                        crop.status = 'Inhabilitado';
                    }
                });
                this.renderTable();
            });
        });

        // --- MODAL DE REPORTE ---
        // Definir referencias una sola vez fuera de cualquier bloque condicional
        const reportModal = document.getElementById('reportModal');
        const openReportBtn = document.querySelector('.button--report');
        const closeReportModal = document.getElementById('closeReportModal');
        const cancelReportBtn = document.getElementById('cancelReportBtn');
        const generateReportBtn = document.getElementById('generateReportBtn');
        // --- MODAL DE VISUALIZAR CULTIVO ---
        const viewCropModal = document.getElementById('viewCropModal');
        const closeViewCropModal = document.getElementById('closeViewCropModal');
        const closeViewCropBtn = document.getElementById('closeViewCropBtn');
        setTimeout(() => {
            // Abrir modal
            if (openReportBtn) {
                openReportBtn.addEventListener('click', () => {
                    reportModal.classList.add('modal--active');
                });
            }
            // Cerrar modal (icono X)
            if (closeReportModal) {
                closeReportModal.addEventListener('click', () => {
                    reportModal.classList.remove('modal--active');
                });
            }
            // Cerrar modal (botón cancelar)
            if (cancelReportBtn) {
                cancelReportBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    reportModal.classList.remove('modal--active');
                });
            }
            // Generar reporte real
            if (generateReportBtn) {
                generateReportBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const format = (document.getElementById('reportFormat')?.value || 'excel').toLowerCase();
                    const includeInactive = document.getElementById('includeInactive')?.checked;
                    const includeDetails = document.getElementById('includeDetails')?.checked;
                    const includeSensors = document.getElementById('includeSensors')?.checked;
                    const includeSupplies = document.getElementById('includeSupplies')?.checked;
                    // Filtra los cultivos a incluir
                    let crops = Array.isArray(this.filteredData) ? this.filteredData : [];
                    if (!includeInactive) crops = crops.filter(crop => crop.status === 'Activo');
                    // Definir columnas
                    const columns = [
                        { header: 'Nombre', key: 'name' },
                        { header: 'Tipo', key: 'type' },
                        { header: 'Tamaño', key: 'area' },
                        { header: 'Ubicación', key: 'location' },
                        { header: 'Estado', key: 'status' }
                    ];
                    // Mapear filas
                    const rows = crops.map(crop => ({
                        name: crop.name,
                        type: crop.type,
                        area: crop.area,
                        location: crop.location,
                        status: crop.status
                    }));
                    const filename = `reporte_cultivos_${new Date().toLocaleDateString('es-ES').replace(/\//g,'-')}`;
                    if (window.ReportGenerator) {
                        window.ReportGenerator.generateReport({ columns, data: rows, format, filename });
                    } else {
                        // Fallback CSV
                        const header = columns.map(c => `"${c.header}"`).join(',');
                        const csvRows = rows.map(r => columns.map(c => `"${String(r[c.key] ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
                        const csv = `\uFEFF${header}\n${csvRows}`;
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `${filename}.csv`;
                        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                    }
                    reportModal.classList.remove('modal--active');
                });
            }

            // Preview dinámico
            const renderPreview = () => {
                try {
                    const prev = document.getElementById('reportPreview');
                    if (!prev) return;
                    const includeInactive = document.getElementById('includeInactive')?.checked;
                    const crops = Array.isArray(this.filteredData) ? this.filteredData : [];
                    const filtered = includeInactive ? crops : crops.filter(c => c.status === 'Activo');
                    const cols = 5; // nombre,tipo,tamaño,ubicación,estado
                    const format = (document.getElementById('reportFormat')?.value || 'CSV').toUpperCase();
                    prev.innerHTML = filtered.length > 0
                      ? `Se exportarán <strong>${filtered.length}</strong> cultivos en <strong>${format}</strong> con <strong>${cols}</strong> columnas.`
                      : '<em>No hay datos para exportar</em>'
                } catch(_) {}
            }
            document.querySelector('.button--report')?.addEventListener('click', renderPreview);
            document.getElementById('includeInactive')?.addEventListener('change', renderPreview);
            document.getElementById('reportFormat')?.addEventListener('change', renderPreview);
            // --- Cerrar modal de visualizar cultivo ---
            if (closeViewCropModal) {
                closeViewCropModal.addEventListener('click', () => {
                    viewCropModal.classList.remove('modal--active');
                });
            }
            if (closeViewCropBtn) {
                closeViewCropBtn.addEventListener('click', () => {
                    viewCropModal.classList.remove('modal--active');
                });
            }
        }, 0);
    }

    setupPaginationEvents() {
        const prevButton = document.querySelector('.pagination__button--prev');
        const nextButton = document.querySelector('.pagination__button--next');
        const pageButtons = document.querySelectorAll('.pagination__button:not(.pagination__button--prev):not(.pagination__button--next)');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderTable();
                    this.updatePagination();
                }
            });
        }
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderTable();
                    this.updatePagination();
                }
            });
        }
        pageButtons.forEach((button, i) => {
            button.addEventListener('click', () => {
                const pageNumber = Number(button.textContent);
                if (!isNaN(pageNumber)) {
                    this.currentPage = pageNumber;
                    this.renderTable();
                    this.updatePagination();
                }
            });
        });
    }


    renderTable() {
        const tbody = document.querySelector('.table__body');
        tbody.innerHTML = '';

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentPageData = this.filteredData.slice(startIndex, endIndex);

        currentPageData.forEach(crop => {
            const row = document.createElement('tr');
            row.className = 'table__row';

            let badgeClass = '';
            if (crop.status === 'Activo') {
                badgeClass = 'badge badge--active';
            } else if (crop.status === 'Inhabilitado') {
                badgeClass = 'badge badge--inactive';
            } else {
                badgeClass = 'badge';
            }

            row.innerHTML = `
                <td class="table__cell table__cell--checkbox">
                    <input type="checkbox" class="table__checkbox" data-id="${crop.id}" ${this.selectedCrops && this.selectedCrops.has(crop.id) ? 'checked' : ''} />
                </td>
                <td class="table__cell table__cell--id">${crop.id}</td>
                <td class="table__cell table__cell--name">${crop.name}</td>
                <td class="table__cell table__cell--type">${crop.type}</td>
                <td class="table__cell table__cell--area">${crop.area}</td>
                <td class="table__cell table__cell--location">${crop.location}</td>
                <td class="table__cell table__cell--status">
                    <span class="${badgeClass}">${crop.status}</span>
                </td>
                <td class="table__cell table__cell--actions">
                    <button class="table__action-button table__action-button--view" title="Ver detalles">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                    ${!this.isVisitante ? `
                    <button class="table__action-button table__action-button--edit" onclick="window.location.href='../views/actualizar-cultivo.html?id=${crop.id}'">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="table__action-button table__action-button--toggle-status ${crop.status === 'Activo' ? 'table__action-button--disable' : 'table__action-button--enable'}" data-id="${crop.id}" title="${crop.status === 'Activo' ? 'Deshabilitar' : 'Habilitar'}">
                        <span class="material-symbols-outlined">power_settings_new</span>
                    </button>
                    ` : ''}
                </td>
            `;
            const checkbox = row.querySelector('.table__checkbox');
            checkbox.addEventListener('change', () => {
                this.updateSelectedCrops(checkbox, checkbox.dataset.id);
            });
            
            const toggleStatusBtn = row.querySelector('.table__action-button--toggle-status');
            if (toggleStatusBtn) {
                toggleStatusBtn.addEventListener('click', async () => {
                    const nuevoEstado = crop.status === 'Activo' ? 'Inhabilitado' : 'Activo';
                    crop.status = nuevoEstado;
                    console.log('PUT cultivo', crop.id, 'nuevo estado:', nuevoEstado);
                    await toggleCultivoStatus(crop.id, nuevoEstado);
                    this.renderTable();
                });
            }
            
            // --- Botón Visualizar ---
            const viewButton = row.querySelector('.table__action-button--view');
            if (viewButton) {
                viewButton.addEventListener('click', () => {
                    this.showCropModal(crop);
                });
            }
            
            tbody.appendChild(row);
        });

        // Mantener sincronizados contadores y checkboxes maestros tras cada render
        this.updateSelectedCount();
        this.updateHeaderCheckbox();
        this.updateUIForVisitante();
    }

    updateUIForVisitante() {
        if (!this.isVisitante) return;
        
        // Hide action buttons
        const actionButtons = document.querySelectorAll('.button--add, .button--delete, .button--edit, .button--enable, .button--disable, .button--report, .button--filter, .button--create');
        actionButtons.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
        
        // Hide checkboxes
        const checkboxes = document.querySelectorAll('.table__checkbox, .table__checkbox-header');
        checkboxes.forEach(checkbox => {
            if (checkbox) checkbox.style.display = 'none';
        });
        
        // Hide actions column header if it exists
        const actionsHeader = document.querySelector('th.table__header--actions');
        if (actionsHeader) actionsHeader.style.display = 'none';
        
        // Hide actions bar
        const actionsBar = document.querySelector('.actions-bar');
        if (actionsBar) actionsBar.style.display = 'none';
    }

    showCropModal(crop) {
        // Rellena el modal con los datos del cultivo
        document.getElementById('modalCropId').textContent = crop.id || '';
        document.getElementById('modalCropName').textContent = crop.name || '';
        document.getElementById('modalCropType').textContent = crop.type || '';
        document.getElementById('modalCropArea').textContent = crop.area || '';
        document.getElementById('modalCropLocation').textContent = crop.location || '';
        document.getElementById('modalCropStatus').textContent = crop.status || '';
        document.getElementById('modalCropDescription').textContent = crop.description || crop.descripcion || '-';
        document.getElementById('modalCropCreated').textContent = crop.createdAt || crop.fecha_creacion || crop.fechaCreacion || '-';
        // Muestra el modal
        document.getElementById('viewCropModal').classList.add('modal--active');
    }

    setupPaginationEvents() {
        const paginationControls = document.querySelector('.pagination__controls');
        paginationControls.addEventListener('click', (e) => {
            const button = e.target.closest('.pagination__button');
            if (!button) return;

            if (button.classList.contains('pagination__button--prev')) {
                if (this.currentPage > 1) {
                    this.currentPage--;
                }
            } else if (button.classList.contains('pagination__button--next')) {
                const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                }
            } else {
                const pageNum = parseInt(button.textContent);
                if (!isNaN(pageNum)) {
                    this.currentPage = pageNum;
                }
            }
            
            this.renderTable();
            this.updatePagination();
        });
    }

    updatePagination() {
        const totalItems = this.filteredData.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        // Actualizar información de paginación para mostrar el rango correcto
        const startItem = ((this.currentPage - 1) * this.itemsPerPage) + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);
        document.querySelector('.pagination__current-page').textContent = startItem;
        document.querySelector('.pagination__items-per-page').textContent = endItem;
        document.querySelector('.pagination__total-items').textContent = totalItems;
        
        // Actualizar botones de página
        const paginationControls = document.querySelector('.pagination__controls');
        let controlsHTML = `
            <button class="pagination__button pagination__button--prev ${this.currentPage === 1 ? 'disabled' : ''}">
                <span class="material-symbols-outlined">navigate_before</span>
            </button>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            controlsHTML += `
                <button class="pagination__button ${i === this.currentPage ? 'pagination__button--active' : ''}">
                    ${i}
                </button>
            `;
        }
        
        controlsHTML += `
            <button class="pagination__button pagination__button--next ${this.currentPage === totalPages ? 'disabled' : ''}">
                <span class="material-symbols-outlined">navigate_next</span>
            </button>
        `;
        
        paginationControls.innerHTML = controlsHTML;
    }

    updateSelectedCrops(checkbox, id) {
        if (!this.selectedCrops) this.selectedCrops = new Set();
        if (checkbox.checked) {
            this.selectedCrops.add(id);
        } else {
            this.selectedCrops.delete(id);
        }
        this.updateSelectedCount();
        this.updateHeaderCheckbox();
    }

    updateHeaderCheckbox() {
        const rowCheckboxes = Array.from(document.querySelectorAll('.table__checkbox'));
        const actionsBarCheckbox = document.querySelector('.actions-bar__checkbox');
        const tableHeaderCheckbox = document.querySelector('.table__checkbox-header');
        const hasRows = rowCheckboxes.length > 0;
        const allChecked = hasRows && rowCheckboxes.every(cb => cb.checked);
        const someChecked = hasRows && rowCheckboxes.some(cb => cb.checked);

        if (actionsBarCheckbox) {
            actionsBarCheckbox.checked = allChecked;
            actionsBarCheckbox.indeterminate = !allChecked && someChecked;
        }
        if (tableHeaderCheckbox) {
            tableHeaderCheckbox.checked = allChecked;
            tableHeaderCheckbox.indeterminate = !allChecked && someChecked;
        }
    }

    updateSelectedCount() {
        const selected = this.selectedCrops ? this.selectedCrops.size : 0;
        const total = document.querySelectorAll('.table__checkbox').length;
        const selectedSpan = document.querySelector('.actions-bar__count--selected');
        const totalSpan = document.querySelector('.actions-bar__count--total');
        if (selectedSpan) selectedSpan.textContent = selected;
        if (totalSpan) totalSpan.textContent = total;
    }
}

// Wait for DOM and all scripts to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Small delay to ensure all components are loaded
        setTimeout(() => {
            new Crops();
        }, 100);
    } catch (error) {
        console.error('Error initializing Crops:', error);
        // Show error to user
        const tbody = document.querySelector('.table__body');
        if (tbody) {
            tbody.innerHTML = `
                <tr class="table__row">
                    <td class="table__cell" colspan="8" style="text-align: center; color: #ff4d4f;">
                        Error al cargar la página. Por favor recarga la página.
                    </td>
                </tr>
            `;
        }
    }
});
