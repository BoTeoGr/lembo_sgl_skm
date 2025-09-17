import { sensorsConfig } from '../config/sensorsConfig.js';

// Determina la categoría basada en el tipo de sensor
function determineCategory(tipo) {
    if (!tipo) return 'Otros';
    const tipoLower = String(tipo).toLowerCase().trim();
    
    if (tipoLower.includes('temperatura') || tipoLower.includes('humedad') || 
        tipoLower.includes('luz') || tipoLower.includes('presion') || 
        tipoLower.includes('viento')) {
        return 'Ambiental';
    } else if (tipoLower.includes('suelo') || tipoLower.includes('ph') || 
              tipoLower.includes('nutriente')) {
        return 'Suelo';
    } else if (tipoLower.includes('riego') || tipoLower.includes('agua') || 
              tipoLower.includes('flujo')) {
        return 'Riego';
    } else if (tipoLower.includes('calidad') || tipoLower.includes('co2') || 
              tipoLower.includes('tvoc')) {
        return 'Calidad';
    }
    return 'Otros';
}

// --- Obtener sensores desde la API ---
async function fetchSensorsFromAPI() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/sensor?limit=1000', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Error al obtener sensores de la API');
        const data = await response.json();
        const sensoresArr = Array.isArray(data) ? data : (data.sensores || []);
        return sensoresArr.map(sensor => {
            let status = sensor.estado || '';
            if (typeof status === 'string') {
                const estadoLower = status.trim().toLowerCase();
                if (["habilitado"].includes(estadoLower)) {
                    status = 'habilitado';
                } else if (["deshabilitado"].includes(estadoLower)) {
                    status = 'deshabilitado';
                }
            }
            const tipo = sensor.tipo_sensor || sensor.tipo || '';
            return {
                id: sensor.sensorId || sensor.id || '',
                nombre: sensor.nombre_sensor || sensor.nombre || '',
                tipo: tipo,
                categoria: sensor.categoria || determineCategory(tipo),
                descripcion: sensor.descripcion || '',
                ubicacion: sensor.ubicacion || '',
                estado: status,
                unidad_medida: sensor.unidad_medida || '',
                tiempo_escaneo: sensor.tiempo_escaneo || '',
                fecha_creacion: sensor.fecha_creacion || sensor.createdAt || '',
                imagen: sensor.imagen || ''
            };
        });
    } catch (e) {
        console.warn('Fallo la carga desde la API, usando datos locales:', e.message);
        return [];
    }
}

// --- Función para actualizar estado en backend ---
async function toggleSensorStatus(id, nuevoEstado) {
     const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/sensor/${id}/estado`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
    });
}

class Sensors {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.originalData = [];
        this.filteredData = [];
        this.selectedSensors = new Set();
        this.isVisitante = this.checkIfVisitante();
        this.init();
    }
    
    checkIfVisitante() {
        const userRole = localStorage.getItem('userRol') || '';
        return userRole.toLowerCase() === 'visitante';
    }

    async init() {
        this.originalData = await fetchSensorsFromAPI();
        this.filteredData = [...this.originalData];
        this.renderTable();
        this.updatePagination();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Filtros
        const filterButton = document.querySelector('.button--filter');
        const filtersClose = document.querySelector('.filters__close');
        const filtersSearch = document.querySelector('.filters__search');
        const filtersSelect = document.querySelectorAll('.filters__select');
        const clearButton = document.querySelector('.button--clear');
        const checkboxHeader = document.querySelector('.table__checkbox-header');
        const enableButton = document.querySelector('.button--enable');
        const disableButton = document.querySelector('.button--disable');
        const actionsBarCheckbox = document.querySelector('.actions-bar__checkbox');

        if (filterButton) {
            filterButton.addEventListener('click', () => {
                document.querySelector('.filters').classList.toggle('hidden');
            });
        }

        if (filtersClose) {
            filtersClose.addEventListener('click', () => {
                document.querySelector('.filters').classList.add('hidden');
            });
        }

        if (filtersSearch) {
            filtersSearch.addEventListener('input', () => {
                this.filterData();
            });
        }

        filtersSelect.forEach(select => {
            select.addEventListener('change', () => {
                this.filterData();
            });
        });

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        if (checkboxHeader) {
            checkboxHeader.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.table__checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    this.updateSelectedSensors(checkbox);
                });
                this.updateActionsBar();
            });
        }

        if (enableButton) {
            enableButton.addEventListener('click', () => {
                this.updateSensorStatus('habilitado');
            });
        }

        if (disableButton) {
            disableButton.addEventListener('click', () => {
                this.updateSensorStatus('deshabilitado');
            });
        }

        // Evento para seleccionar/deseleccionar todos desde la barra superior
        if (actionsBarCheckbox) {
            actionsBarCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.table__checkbox');
                const rows = document.querySelectorAll('.table__row');
                if (e.target.checked) {
                    // Seleccionar TODOS los sensores filtrados (todas las páginas)
                    this.filteredData.forEach(sensor => {
                        this.selectedSensors.add(sensor.id);
                    });
                    // Marcar solo los visibles
                    checkboxes.forEach((checkbox, i) => {
                        checkbox.checked = true;
                    });
                } else {
                    // Deseleccionar todos
                    this.selectedSensors.clear();
                    checkboxes.forEach((checkbox, i) => {
                        checkbox.checked = false;
                    });
                }
                // Sincronizar el checkbox del encabezado de la tabla
                const headerCheckbox = document.querySelector('.table__checkbox-header');
                if (headerCheckbox) headerCheckbox.checked = e.target.checked;
                this.updateActionsBar();
            });
        }

        // Inicializar eventos de paginación
        this.setupPaginationEvents();

        // Modal de reporte
        document.querySelector('.button--report').addEventListener('click', () => {
            this.showReportModal();
        });

        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateReport();
        });

        document.getElementById('cancelReportBtn').addEventListener('click', () => {
            this.hideReportModal();
        });

        // Acción ver sensor
        document.querySelector('.table__body').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const row = btn.closest('tr');
            if (btn.classList.contains('table__action-button--view')) {
                const id = row.querySelector('.table__cell--id').textContent;
                const sensor = this.filteredData.find(s => String(s.id) === String(id));
                if (sensor) this.showSensorDetails(sensor);
                return;
            }
            // Acción editar sensor
            if (btn.classList.contains('table__action-button--edit')) {
                const id = row.querySelector('.table__cell--id').textContent;
                window.location.href = `actualizar-sensor.html?id=${id}`;
                return;
            }
            // Eventos de acción
            if (btn.classList.contains('table__action-button--enable')) {
                const id = row.querySelector('.table__cell--id').textContent;
                const sensor = this.filteredData.find(s => String(s.id) === String(id));
                if (sensor) {
                    sensor.estado = 'habilitado';
                    this.renderTable();
                    toggleSensorStatus(id, 'habilitado');
                }
            }
            if (btn.classList.contains('table__action-button--disable')) {
                const id = row.querySelector('.table__cell--id').textContent;
                const sensor = this.filteredData.find(s => String(s.id) === String(id));
                if (sensor) {
                    sensor.estado = 'deshabilitado';
                    this.renderTable();
                    toggleSensorStatus(id, 'deshabilitado');
                }
            }
        });

        // Cerrar modal
        document.getElementById('closeViewSensorModal').onclick = () => {
            document.getElementById('viewSensorModal').classList.remove('modal--active');
        };
        document.getElementById('closeViewSensorBtn').onclick = () => {
            document.getElementById('viewSensorModal').classList.remove('modal--active');
        };
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

        pageButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pageNumber = parseInt(button.textContent);
                if (pageNumber !== this.currentPage) {
                    this.currentPage = pageNumber;
                    this.renderTable();
                    this.updatePagination();
                }
            });
        });
    }

    filterData() {
        const searchTerm = document.querySelector('.filters__search').value.toLowerCase();
        const statusFilter = document.querySelector('.filters__select[placeholder="Estado"]').value;
        const typeFilter = document.querySelector('.filters__select[placeholder="Tipo de Sensor"]').value;

        // Reset filtered data to original data before applying filters
        this.filteredData = [...this.originalData];

        // Apply filters
        console.log('Aplicando filtros con valores:', {
            searchTerm,
            statusFilter,
            typeFilter
        });
        this.filteredData = this.filteredData.filter(sensor => {
            // Ensure all values are strings before calling toLowerCase()
            const searchFields = [
                String(sensor.nombre || '').toLowerCase(),
                String(sensor.id || '').toLowerCase(),
                String(sensor.descripcion || '').toLowerCase(),
                String(sensor.categoria || '').toLowerCase(),
                String(sensor.tipo || '').toLowerCase() // Include sensor type in search
            ];
            
            const matchesSearch = !searchTerm || 
                searchFields.some(field => field.includes(searchTerm));
                
            const matchesStatus = !statusFilter || 
                (sensor.estado && String(sensor.estado).toLowerCase() === statusFilter.toLowerCase());
                
            const sensorType = String(sensor.tipo || sensor.tipo_sensor || '').toLowerCase().trim();
            const filterType = typeFilter.toLowerCase().trim();
            let matchesType = !typeFilter;
            
            if (typeFilter) {
                // Mapear los valores del select a los valores en la base de datos
                if (filterType === 'contacto') {
                    matchesType = sensorType.includes('contacto');
                } else if (filterType === 'distancia') {
                    matchesType = sensorType.includes('distancia');
                } else if (filterType === 'luz') {
                    matchesType = sensorType.includes('luz');
                }
            }

            return matchesSearch && matchesStatus && matchesType;
        });

        this.currentPage = 1;
        this.renderTable();
        this.updatePagination();
        this.updateActionsBar(); // Update actions bar to reflect filtered selection
    }

    clearFilters() {
        // Reset all filter inputs
        document.querySelector('.filters__search').value = '';
        document.querySelectorAll('.filters__select').forEach(select => {
            select.value = '';
        });
        
        // Reset filtered data to original data
        this.filteredData = [...this.originalData];
        this.currentPage = 1;
        
        // Update UI
        this.renderTable();
        this.updatePagination();
        this.updateActionsBar();
        
        // Close filters panel
        document.querySelector('.filters').classList.add('hidden');
    }

    updateSelectedSensors(checkbox) {
        const row = checkbox.closest('.table__row');
        const sensorId = row.querySelector('.table__cell--id').textContent;
        
        if (checkbox.checked) {
            this.selectedSensors.add(sensorId);
        } else {
            this.selectedSensors.delete(sensorId);
        }
        
        this.updateActionsBar();
    }

    updateActionsBar() {
        const selectedCount = this.selectedSensors.size;
        const totalCount = this.filteredData.length;
        
        const selectedCountElement = document.querySelector('.actions-bar__count--selected');
        const totalCountElement = document.querySelector('.actions-bar__count--total');
        const enableButton = document.querySelector('.button--enable');
        const disableButton = document.querySelector('.button--disable');
        const actionsBarCheckbox = document.querySelector('.actions-bar__checkbox');
        // Sincronizar el checkbox de la barra superior
        if (actionsBarCheckbox) {
            const checkboxes = document.querySelectorAll('.table__checkbox');
            const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
            actionsBarCheckbox.checked = allChecked;
        }
        if (selectedCountElement) {
            selectedCountElement.textContent = selectedCount;
        }
        
        if (totalCountElement) {
            totalCountElement.textContent = totalCount;
        }

        if (enableButton) {
            enableButton.disabled = selectedCount === 0 || this.isVisitante;
        }

        if (disableButton) {
            disableButton.disabled = selectedCount === 0 || this.isVisitante;
        }
    }

    updateSensorStatus(newStatus) {
        if (!this.selectedSensors.size || this.isVisitante) return;
        const ids = Array.from(this.selectedSensors);
        ids.forEach(id => {
            const sensor = this.filteredData.find(s => String(s.id) === String(id));
            if (sensor) sensor.estado = newStatus;
        });
        Promise.all(ids.map(id => toggleSensorStatus(id, newStatus)));
        this.renderTable();
        this.showNotification(`Sensores actualizados a "${newStatus}"`);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification notification--success';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('notification--fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    renderTable() {
        const tbody = document.querySelector('.table__body');
        tbody.innerHTML = '';
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const currentPageData = this.filteredData.slice(startIdx, endIdx);

        currentPageData.forEach(sensor => {
            const row = document.createElement('tr');
            row.className = 'table__row';
            
            // Show only view button for Visitante users, full actions for others
            const actionsHtml = this.isVisitante 
                ? `
                    <button class="table__action-button table__action-button--view">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                `
                : `
                    <button class="table__action-button table__action-button--view">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button class="table__action-button table__action-button--edit" onclick="window.location.href='../views/actualizar-sensor.html?id=${sensor.id}'">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="table__action-button table__action-button--${sensor.estado === 'habilitado' ? 'disable' : 'enable'}">
                        <span class="material-symbols-outlined">power_settings_new</span>
                    </button>
                `;
                
            row.innerHTML = `
                <td class="table__cell table__cell--checkbox">
                    ${this.isVisitante ? '' : `<input type="checkbox" class="table__checkbox" data-id="${sensor.id}" ${this.selectedSensors.has(sensor.id) ? 'checked' : ''} />`}
                </td>
                <td class="table__cell table__cell--id">${sensor.id}</td>
                <td class="table__cell table__cell--name">${sensor.nombre}</td>
                <td class="table__cell table__cell--type">${sensor.tipo}</td>
                <td class="table__cell table__cell--unit">${sensor.unidad_medida || ''}</td>
                <td class="table__cell table__cell--scan-interval">${sensor.tiempo_escaneo || ''}</td>
                <td class="table__cell table__cell--estado">
                    <span class="badge badge--${sensor.estado === 'habilitado' ? 'active' : 'inactive'}">${sensor.estado === 'habilitado' ? 'Habilitado' : 'Deshabilitado'}</span>
                </td>
                <td class="table__cell table__cell--actions">
                    ${actionsHtml}
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Update UI based on user role
        this.updateUIForVisitante();
        this.updateActionsBar();
    }
    
    // updateUIForVisitante() {
    //     if (!this.isVisitante) return;
        
    //     // Hide action buttons except view
    //     const actionButtons = document.querySelectorAll('.button--add, .button--delete, .button--edit, .button--enable, .button--disable');
    //     actionButtons.forEach(btn => {
    //         if (btn) btn.style.display = 'none';
    //     });
        
    //     // Hide all Create Sensor buttons (using multiple selectors to be safe)
    //     const createButtons = [
    //         document.querySelector('.button--add'),
    //         document.querySelector('.button--create'),
    //         document.querySelector('.button.button--secondary.button--create')
    //     ];
        
    //     createButtons.forEach(btn => {
    //         if (btn) btn.style.display = 'none';
    //     });
        
    //     // La visibilidad de los elementos de navegación ahora se maneja en topNavigationBar.js
        
    //     // Hide checkboxes
    //     const checkboxes = document.querySelectorAll('.table__checkbox, .table__checkbox-header');
    //     checkboxes.forEach(checkbox => {
    //         if (checkbox) checkbox.style.display = 'none';
    //     });
        
    //     // Hide report button if it exists
    //     const reportButton = document.querySelector('.button--report');
    //     if (reportButton) reportButton.style.display = 'none';
        
    //     // Hide filter button if it exists
    //     const filterButton = document.querySelector('.button--filter');
    //     if (filterButton) filterButton.style.display = 'none';
    // }

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

    showSensorDetails(sensor) {
        document.getElementById('modalSensorId').textContent = sensor.id || '';
        document.getElementById('modalSensorNombre').textContent = sensor.nombre || '';
        document.getElementById('modalSensorTipo').textContent = sensor.tipo || '';
        document.getElementById('modalSensorDescripcion').textContent = sensor.descripcion || '';
        document.getElementById('modalSensorUnidadMedida').textContent = sensor.unidad_medida || '';
        document.getElementById('modalSensorTiempoEscaneo').textContent = sensor.tiempo_escaneo || '';
        document.getElementById('modalSensorFechaCreacion').textContent = sensor.fecha_creacion || '';
        document.getElementById('modalSensorEstado').textContent = sensor.estado || '';
        const imgElem = document.getElementById('modalSensorImagen');
        if (imgElem) {
            imgElem.src = sensor.imagen || '../imgs/default-sensor.jpg';
            imgElem.alt = sensor.nombre || 'Imagen de sensor';
        }
        document.getElementById('viewSensorModal').classList.add('modal--active');
    }

    editSensor(sensor) {
        // Implementar lógica para editar el sensor
        console.log('Editando sensor:', sensor);
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
        
        // Actualizar información de paginación
        document.querySelector('.pagination__current-page').textContent = ((this.currentPage - 1) * this.itemsPerPage) + 1;
        document.querySelector('.pagination__items-per-page').textContent = Math.min(this.currentPage * this.itemsPerPage, totalItems);
        document.querySelector('.pagination__total-items').textContent = totalItems;
        
        // Actualizar botones de página
        const paginationControls = document.querySelector('.pagination__controls');
        paginationControls.innerHTML = `
            <button class="pagination__button pagination__button--prev ${this.currentPage === 1 ? 'disabled' : ''}">
                <span class="material-symbols-outlined">navigate_before</span>
            </button>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            paginationControls.innerHTML += `
                <button class="pagination__button ${i === this.currentPage ? 'pagination__button--active' : ''}">
                    ${i}
                </button>
            `;
        }
        
        paginationControls.innerHTML += `
            <button class="pagination__button pagination__button--next ${this.currentPage === totalPages ? 'disabled' : ''}">
                <span class="material-symbols-outlined">navigate_next</span>
            </button>
        `;
    }

    showReportModal() {
        document.getElementById('reportModal').classList.add('modal--active');
    }

    hideReportModal() {
        document.getElementById('reportModal').classList.remove('modal--active');
    }

    generateReport() {
        const format = document.getElementById('reportFormat').value;
        const includeInactive = document.getElementById('includeInactive').checked;
        const includeReadings = document.getElementById('includeReadings').checked;
        const includeMaintenance = document.getElementById('includeMaintenance').checked;
        const includeAlerts = document.getElementById('includeAlerts').checked;
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;

        // Aquí iría la lógica para generar el reporte
        console.log('Generando reporte con las siguientes opciones:', {
            format,
            includeInactive,
            includeReadings,
            includeMaintenance,
            includeAlerts,
            startDate,
            endDate
        });

        this.hideReportModal();
    }
}

// Inicializar la clase cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Sensors();
});