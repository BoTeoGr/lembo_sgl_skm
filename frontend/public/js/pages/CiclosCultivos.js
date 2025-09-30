import { fetchCiclosCultivoFromAPI, renderCiclosCultivoTable, updateCicloCultivoEstadoAPI, ciclosCultivosConfig } from '../config/ciclosCultivosConfig.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar si el usuario es visitante
  const userRole = localStorage.getItem('userRol') || '';
  const isVisitante = ['visitante', 'Visitante'].includes(userRole);
  
  // Ocultar elementos que no debe ver el visitante
  if (isVisitante) {
    const actionsBar = document.querySelector('.actions-bar');
    const createButton = document.querySelector('.button--create');
    const reportButton = document.querySelector('.button--report');
    const filterButton = document.querySelector('.button--filter');
    const tableCheckbox = document.querySelector('.table__checkbox-header');
    
    if (actionsBar) actionsBar.style.display = 'none';
    if (createButton) createButton.style.display = 'none';
    if (reportButton) reportButton.style.display = 'none';
    if (filterButton) filterButton.style.display = 'none';
    if (tableCheckbox) tableCheckbox.style.display = 'none';
  }
  
  let currentPage = 1;
  const itemsPerPage = ciclosCultivosConfig.table.itemsPerPage || 10;
  let allCiclos = await fetchCiclosCultivoFromAPI();
  // Si fetchCiclosCultivoFromAPI retorna null, significa que no hay permiso y ya se mostró el mensaje
  if (allCiclos === null) return;
  let filteredCiclos = allCiclos;
  let selectedIds = [];

  function normalizeEstado(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'boolean') return val ? 'activo' : 'inactivo';
    if (typeof val === 'number') return val === 1 ? 'activo' : 'inactivo';
    const v = String(val).trim().toLowerCase();
    if (['activo', 'habilitado', 'true', '1', 'enabled'].includes(v)) return 'activo';
    if (['inactivo', 'deshabilitado', 'false', '0', 'disabled'].includes(v)) return 'inactivo';
    return v;
  }

  function getFilteredCiclos() {
    const searchInput = document.querySelector('.filters__search');
    const estadoSelect = document.querySelector('.filters__select[placeholder="Estado"]');
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const estadoSel = estadoSelect ? estadoSelect.value : '';
    const estadoCanon = normalizeEstado(estadoSel);
    return allCiclos.filter(c => {
      const matchesSearch = !q || c.nombre.toLowerCase().includes(q) || String(c.id).toLowerCase().includes(q);
      const matchesEstado = !estadoSel || normalizeEstado(c.estado) === estadoCanon;
      return matchesSearch && matchesEstado;
    });
  }

  function renderPaginatedTable(list) {
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = Math.min(startIdx + itemsPerPage, total);
    const pageItems = list.slice(startIdx, endIdx);
    renderCiclosCultivoTable(pageItems);
    const controlsDiv = document.querySelector('.pagination__controls');
    if (!controlsDiv) return;

    // Limpia los botones de página anteriores (excepto prev y next)
    controlsDiv.querySelectorAll('.pagination__button--page').forEach(btn => btn.remove());

    const prevBtn = controlsDiv.querySelector('.pagination__button--prev');
    const nextBtn = controlsDiv.querySelector('.pagination__button--next');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Inserta los botones de página (1, 2, 3, ...)
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = 'pagination__button pagination__button--page' + (i === currentPage ? ' pagination__button--active' : '');
      pageBtn.textContent = i;
      pageBtn.onclick = () => {
        if (currentPage !== i) {
          currentPage = i;
          renderPaginatedTable(filteredCiclos);
        }
      };
      nextBtn.parentNode.insertBefore(pageBtn, nextBtn);
    }

    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderPaginatedTable(filteredCiclos); } };
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderPaginatedTable(filteredCiclos); } };
    // Actualizar resumen de selección tras render
    updateSelectionSummary();
  }

  // Inicializa tabla con datos de API
  filteredCiclos = getFilteredCiclos();
  renderPaginatedTable(filteredCiclos);

  // Filtros
  const searchInput = document.querySelector('.filters__search');
  const clearBtn = document.querySelector('.button--clear');
  const filterButton = document.querySelector('.button--filter');
  const filtersClose = document.querySelector('.filters__close');
  const filtersPanel = document.querySelector('.filters');
  
  // Abrir/cerrar panel de filtros
  if (filterButton && filtersPanel) {
    filterButton.addEventListener('click', () => {
      filtersPanel.classList.toggle('hidden');
    });
  }
  if (filtersClose && filtersPanel) {
    filtersClose.addEventListener('click', () => {
      filtersPanel.classList.add('hidden');
    });
  }
  const estadoSelect = document.querySelector('.filters__select[placeholder="Estado"]');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filteredCiclos = getFilteredCiclos();
      currentPage = 1;
      renderPaginatedTable(filteredCiclos);
    });
  }
  if (estadoSelect) {
    estadoSelect.addEventListener('change', () => {
      filteredCiclos = getFilteredCiclos();
      currentPage = 1;
      renderPaginatedTable(filteredCiclos);
    });
  }
  if (clearBtn) {
    clearBtn.onclick = () => {
      if (searchInput) searchInput.value = '';
      if (estadoSelect) estadoSelect.value = '';
      filteredCiclos = getFilteredCiclos();
      currentPage = 1;
      renderPaginatedTable(filteredCiclos);
      if (filtersPanel) filtersPanel.classList.add('hidden');
    };
  }

  // Habilitar/deshabilitar individual
  document.querySelector('.table__body').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = row.querySelector('.table__cell--id').textContent;
    if (btn.classList.contains('table__action-button--enable')) {
      await updateCicloCultivoEstadoAPI([id], 'Activo');
      allCiclos = await fetchCiclosCultivoFromAPI();
      filteredCiclos = getFilteredCiclos();
      renderPaginatedTable(filteredCiclos);
    } else if (btn.classList.contains('table__action-button--disable')) {
      await updateCicloCultivoEstadoAPI([id], 'Inactivo');
      allCiclos = await fetchCiclosCultivoFromAPI();
      filteredCiclos = getFilteredCiclos();
      renderPaginatedTable(filteredCiclos);
    } else if (btn.classList.contains('table__action-button--edit')) {
      // Redirigir a la página de actualización con el id
      window.location.href = `actualizar-ciclo-cultivo.html?id=${id}`;
    }
  });

  // Habilitar/deshabilitar masivo
  const enableBtn = document.querySelector('.button--enable');
  const disableBtn = document.querySelector('.button--disable');
  function getSelectedIds() {
    return Array.from(document.querySelectorAll('.table__checkbox:checked'))
      .map(cb => cb.closest('tr').querySelector('.table__cell--id').textContent);
  }
  if (enableBtn) {
    enableBtn.addEventListener('click', async () => {
      const ids = getSelectedIds();
      if (ids.length === 0) return;
      await updateCicloCultivoEstadoAPI(ids, 'Activo');
      allCiclos = await fetchCiclosCultivoFromAPI();
      filteredCiclos = getFilteredCiclos();
      renderPaginatedTable(filteredCiclos);
    });
  }
  if (disableBtn) {
    disableBtn.addEventListener('click', async () => {
      const ids = getSelectedIds();
      if (ids.length === 0) return;
      await updateCicloCultivoEstadoAPI(ids, 'Inactivo');
      allCiclos = await fetchCiclosCultivoFromAPI();
      filteredCiclos = getFilteredCiclos();
      renderPaginatedTable(filteredCiclos);
    });
  }

  // --- Eventos checkboxes ---
  function updateSelectionSummary() {
    const total = document.querySelectorAll('.table__checkbox').length;
    const selected = document.querySelectorAll('.table__checkbox:checked').length;
    const selectedEl = document.querySelector('.actions-bar__count--selected');
    const totalEl = document.querySelector('.actions-bar__count--total');
    if (selectedEl) selectedEl.textContent = selected;
    if (totalEl) totalEl.textContent = total;
    const header = document.querySelector('.table__checkbox-header');
    const bar = document.querySelector('.actions-bar__checkbox');
    const allChecked = (selected === total && total > 0);
    if (header) header.checked = allChecked;
    if (bar) bar.checked = allChecked;
  }

  document.querySelector('.table__body').addEventListener('change', () => {
    updateSelectionSummary();
  });

  // Checkbox en header de tabla
  let thHeader = document.querySelector('.table__checkbox-header');
  if (thHeader) {
    thHeader.addEventListener('change', function() {
      const checked = this.checked;
      document.querySelectorAll('.table__checkbox').forEach(cb => { cb.checked = checked; });
      const bar = document.querySelector('.actions-bar__checkbox');
      if (bar) bar.checked = checked;
      updateSelectionSummary();
    });
  }

  // Checkbox en barra de acciones (seleccionar todos)
  const actionsBarCheckbox = document.querySelector('.actions-bar__checkbox');
  if (actionsBarCheckbox) {
    actionsBarCheckbox.addEventListener('change', function() {
      const checked = this.checked;
      document.querySelectorAll('.table__checkbox').forEach(cb => { cb.checked = checked; });
      const header = document.querySelector('.table__checkbox-header');
      if (header) header.checked = checked;
      updateSelectionSummary();
    });
  }

  // Acción ver ciclo de cultivo
  document.querySelector('.table__body').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = row.querySelector('.table__cell--id').textContent;
    if (btn.classList.contains('table__action-button--view')) {
      const ciclo = filteredCiclos.find(c => String(c.id) === String(id));
      if (ciclo) showCicloCultivoDetails(ciclo);
      return;
    }
  });

  function showCicloCultivoDetails(ciclo) {
    document.getElementById('modalCicloCultivoId').textContent = ciclo.id || '';
    document.getElementById('modalCicloCultivoNombre').textContent = ciclo.nombre || '';
    document.getElementById('modalCicloCultivoDescripcion').textContent = ciclo.descripcion || '';
    document.getElementById('modalCicloCultivoNovedades').textContent = ciclo.novedades || '';
    document.getElementById('modalCicloCultivoPeriodoInicio').textContent = ciclo.periodoInicio || '';
    document.getElementById('modalCicloCultivoPeriodoFinal').textContent = ciclo.periodoFinal || '';
    document.getElementById('modalCicloCultivoEstado').textContent = ciclo.estado || '';
    const imgElem = document.getElementById('modalCicloCultivoImagen');
    if (imgElem) {
      imgElem.src = ciclo.imagen || '../imgs/default-ciclo-cultivo.jpg';
      imgElem.alt = ciclo.nombre || 'Imagen de ciclo de cultivo';
    }
    document.getElementById('viewCicloCultivoModal').classList.add('modal--active');
  }
  document.getElementById('closeViewCicloCultivoModal').onclick = () => {
    document.getElementById('viewCicloCultivoModal').classList.remove('modal--active');
  };
  document.getElementById('closeViewCicloCultivoBtn').onclick = () => {
    document.getElementById('viewCicloCultivoModal').classList.remove('modal--active');
  };

  // --- Modal de Generar Reporte avanzado funcional ---
  const reportModal = document.getElementById('reportModal');
  const openReportBtn = document.querySelector('.button--report');
  const closeReportBtn = document.getElementById('closeReportModal');
  const cancelReportBtn = document.getElementById('cancelReportBtn');
  const generateReportBtn = document.getElementById('generateReportBtn');
  const reportForm = document.getElementById('reportForm');

  if (openReportBtn && reportModal) {
    openReportBtn.onclick = () => reportModal.classList.add('modal--active');
    // Render inicial
    try {
      const prev = document.getElementById('reportPreview');
      if (prev) prev.innerHTML = '';
    } catch(_) {}
  }
  if (closeReportBtn && reportModal) {
    closeReportBtn.onclick = () => reportModal.classList.remove('modal--active');
  }
  if (cancelReportBtn && reportModal) {
    cancelReportBtn.onclick = (e) => {
      e.preventDefault();
      reportModal.classList.remove('modal--active');
    };
  }
  if (generateReportBtn && reportModal) {
    generateReportBtn.onclick = (e) => {
      e.preventDefault();
      const format = (document.getElementById('reportFormat')?.value || 'excel').toLowerCase();
      const includeInactive = document.getElementById('includeInactive')?.checked;
      let data = Array.isArray(filteredCiclos) ? filteredCiclos : [];
      if (!includeInactive) data = data.filter(c => c.estado === 'Activo');
      const columns = [
        { header: 'ID', key: 'id' },
        { header: 'Nombre', key: 'nombre' },
        { header: 'Periodo Inicio', key: 'periodoInicio' },
        { header: 'Periodo Final', key: 'periodoFinal' },
        { header: 'Estado', key: 'estado' },
      ];
      const rows = data.map(c => ({ id: c.id, nombre: c.nombre, periodoInicio: c.periodoInicio, periodoFinal: c.periodoFinal, estado: c.estado }));
      const filename = `reporte_ciclos_cultivos_${new Date().toLocaleDateString('es-ES').replace(/\//g,'-')}`;
      if (window.ReportGenerator) {
        window.ReportGenerator.generateReport({ columns, data: rows, format, filename });
      } else {
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
    };
  }

  // Vista previa dinámica
  function renderPreview() {
    const prev = document.getElementById('reportPreview');
    if (!prev) return;
    const includeInactive = document.getElementById('includeInactive')?.checked;
    let data = Array.isArray(filteredCiclos) ? filteredCiclos : [];
    if (!includeInactive) data = data.filter(c => c.estado === 'Activo');
    const cols = 5; // id, nombre, inicio, final, estado
    const format = (document.getElementById('reportFormat')?.value || 'CSV').toUpperCase();
    prev.innerHTML = data.length > 0
      ? `Se exportarán <strong>${data.length}</strong> ciclos en <strong>${format}</strong> con <strong>${cols}</strong> columnas.`
      : '<em>No hay datos para exportar</em>';
  }
  document.getElementById('includeInactive')?.addEventListener('change', renderPreview);
  document.getElementById('reportFormat')?.addEventListener('change', renderPreview);
});
