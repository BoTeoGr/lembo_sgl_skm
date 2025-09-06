import { usersConfig } from '../config/usersConfig.js';

document.addEventListener('DOMContentLoaded', async () => {
  let currentPage = 1;
  const itemsPerPage = usersConfig.table.itemsPerPage || 10;
  let filteredUsers = [];

  // Cargar datos iniciales
  filteredUsers = await fetchUsersFromAPI();
  // Si fetchUsersFromAPI retorna null, significa que no hay permiso y ya se mostró el mensaje
  if (filteredUsers === null) return;
  renderPaginatedTable(filteredUsers);

  // Filtros
  const searchInput = document.querySelector('.filters__search');
  const rolSelect = document.querySelector('select[placeholder="Rol"]');
  const estadoSelect = document.querySelector('select[placeholder="Estado"]');
  const clearBtn = document.querySelector('.button--clear');

  // --- Obtener usuarios desde la API ---
  async function fetchUsersFromAPI() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/usuarios?limit=1000', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.status === 403) {
        renderNoPermissionTable();
        return null;
      }
      if (!response.ok) throw new Error('Error al obtener usuarios de la API');
      const data = await response.json();
      console.log('API Response:', data);
      // Si la respuesta es un array o tiene la clave 'usuarios'
      const usuariosArr = data.usuarios || [];
      // Normalizar campos y estado
      return usuariosArr.map(user => {
        let status = user.estado || '';
        if (typeof status === 'string') {
          const estadoLower = status.trim().toLowerCase();
          if (["habilitado", "activo"].includes(estadoLower)) {
            status = 'Activo';
          } else if (["deshabilitado", "inactivo"].includes(estadoLower)) {
            status = 'Inactivo';
          }
        }
        return {
          id: user.id || user.numero_documento || '',
          nombre: user.nombre || '',
          correo: user.correo || user.email || '',
          tipoDocumento: user.tipoDocumento || user.tipo_doc || user.tipo_documento || '',
          numeroDocumento: user.numeroDocumento || user.num_doc || user.numero_doc || user.numero_documento || '',
          telefono: user.telefono || user.celular || '',
          rol: user.rol || '',
          estado: status,
          imagen: user.imagen || '',
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
          <td class="table__cell" colspan="7" style="text-align: center; color: rgb(253,195,0);">
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
          <td class="table__cell" colspan="7" style="text-align: center; color: rgb(253,195,0);">
            <span style="font-size:2rem;vertical-align:middle;">&#9888;</span><br>
            ${msg || 'Error al cargar los datos'}
          </td>
        </tr>
      `;
    }
  }

  function getFilteredUsers() {
    const search = document.querySelector('.filters__search')?.value?.toLowerCase() || '';
    const rol = document.querySelector('select[placeholder="Rol"]')?.value || '';
    const estado = document.querySelector('select[placeholder="Estado"]')?.value || '';
    return filteredUsers.filter(u => 
      (u.nombre.toLowerCase().includes(search) || String(u.id).toLowerCase().includes(search)) &&
      (rol ? u.rol === rol : true) &&
      (estado ? u.estado === estado : true)
    );
  }

  function renderUsersTable(data) {
    const tbody = document.querySelector('.table__body');
    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr class="table__row">
          <td class="table__cell" colspan="7" style="text-align: center;">No se encontraron usuarios</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data.map(user => `
      <tr class="table__row">
        <td class="table__cell table__cell--checkbox">
          <input type="checkbox" class="table__checkbox" />
        </td>
        <td class="table__cell table__cell--id">${user.id}</td>
        <td class="table__cell table__cell--name">${user.nombre}</td>
        <td class="table__cell table__cell--role">${user.rol}</td>
        <td class="table__cell table__cell--phone">${user.telefono}</td>
        <td class="table__cell table__cell--status">
          <span class="badge badge--${user.estado === 'Activo' ? 'active' : 'inactive'}">${user.estado}</span>
        </td>
        <td class="table__cell table__cell--actions">
          <button class="table__action-button table__action-button--view"><span class="material-symbols-outlined">visibility</span></button>
          <button class="table__action-button table__action-button--edit" onclick="window.location.href='actualizar-usuario.html?id=${user.id}'">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="table__action-button table__action-button--${user.estado === 'Activo' ? 'disable' : 'enable'}"><span class="material-symbols-outlined">power_settings_new</span></button>
        </td>
      </tr>
    `).join('');
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
    const currentPageSpan = document.querySelector('.pagination__current-page');
    const itemsPerPageSpan = document.querySelector('.pagination__items-per-page');
    const totalItemsSpan = document.querySelector('.pagination__total-items');
    if (currentPageSpan) currentPageSpan.textContent = startIdx + 1;
    // Show actual end index, not the slice end
    const actualEndIdx = Math.min(endIdx, total);
    if (itemsPerPageSpan) itemsPerPageSpan.textContent = actualEndIdx;
    if (totalItemsSpan) totalItemsSpan.textContent = total;
  }

  function renderPaginationControls(totalPages) {
    const prevBtn = document.querySelector('.pagination__button--prev');
    const nextBtn = document.querySelector('.pagination__button--next');
    const pageBtns = document.querySelectorAll('.pagination__button:not(.pagination__button--prev):not(.pagination__button--next)');
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderPaginatedTable(filteredUsers); } };
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderPaginatedTable(filteredUsers); } };
    // Actualiza botones de página
    pageBtns.forEach((btn, i) => {
      const pageNum = i + 1;
      btn.classList.toggle('pagination__button--active', pageNum === currentPage);
      btn.style.display = (pageNum <= totalPages) ? '' : 'none';
      btn.onclick = () => { if (currentPage !== pageNum) { currentPage = pageNum; renderPaginatedTable(filteredUsers); } };
    });
  }

  function applyFilters() {
    currentPage = 1; // Reset to first page when filters change
    filteredUsers = getFilteredUsers();
    renderPaginatedTable(filteredUsers);
  }

  searchInput?.addEventListener('input', applyFilters);
  rolSelect?.addEventListener('change', applyFilters);
  estadoSelect?.addEventListener('change', applyFilters);
  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (rolSelect) rolSelect.value = '';
    if (estadoSelect) estadoSelect.value = '';
    filteredUsers = getFilteredUsers();
    currentPage = 1;
    renderPaginatedTable(filteredUsers);
  });

  // Sincronización de checkbox general y de tabla
  document.querySelector('.table__body').addEventListener('change', updateSelectionCount);

  document.querySelector('.actions-bar__checkbox').addEventListener('change', function() {
    const checked = this.checked;
    document.querySelectorAll('.table__checkbox').forEach(cb => { cb.checked = checked; });
    const thHeader = document.querySelector('.table__checkbox-header');
    if (thHeader) thHeader.checked = checked;
    updateSelectionCount();
  });

  // Checkbox en header de tabla
  const initializeHeaderCheckbox = () => {
    let headerCheckbox = document.querySelector('.table__checkbox-header');
    if (!headerCheckbox) {
      // Si no existe, lo agregamos dinámicamente
      const th = document.createElement('th');
      th.className = 'table__cell table__cell--checkbox';
      th.innerHTML = '<input type="checkbox" class="table__checkbox-header" />';
      const theadRow = document.querySelector('.table__head .table__row');
      if (theadRow) theadRow.insertBefore(th, theadRow.firstChild);
      headerCheckbox = document.querySelector('.table__checkbox-header');
    }
    if (headerCheckbox) {
      headerCheckbox.addEventListener('change', function() {
        const checked = this.checked;
        document.querySelectorAll('.table__checkbox').forEach(cb => { cb.checked = checked; });
        const bar = document.querySelector('.actions-bar__checkbox');
        if (bar) bar.checked = checked;
        updateSelectionCount();
      });
    }
  };
  
  initializeHeaderCheckbox();

  // Acciones de habilitar/deshabilitar (por fila)
  document.querySelector('.table__body').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = row.querySelector('.table__cell--id').textContent;
    if (btn.classList.contains('table__action-button--view')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }
        const response = await fetch(`http://localhost:5000/usuarios/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (!response.ok) throw new Error('Error al obtener los detalles del usuario');
        const usuario = await response.json();
        showUsuarioModal(usuario);
      } catch (error) {
        console.error('Error al cargar el usuario:', error);
        alert('No se pudo cargar la información del usuario');
      }
      return;
    } else if (btn.classList.contains('table__action-button--edit')) {
      window.location.href = `actualizar-usuario.html?id=${id}`;
    } else if (btn.classList.contains('table__action-button--enable')) {
      await toggleUserStatus(id, 'Activo');
      renderPaginatedTable(filteredUsers);
    } else if (btn.classList.contains('table__action-button--disable')) {
      await toggleUserStatus(id, 'Deshabilitado');
      renderPaginatedTable(filteredUsers);
    }
  });

  // Acciones de habilitar/deshabilitar masivo
  const enableBtn = document.querySelector('.button--enable');
  const disableBtn = document.querySelector('.button--disable');

  function getSelectedIds() {
    return Array.from(document.querySelectorAll('.table__checkbox:checked'))
      .map(cb => cb.closest('tr').querySelector('.table__cell--id').textContent);
  }

  function updateSelectionCount() {
    const total = document.querySelectorAll('.table__checkbox').length;
    const selected = document.querySelectorAll('.table__checkbox:checked').length;
    document.querySelector('.actions-bar__count--selected').textContent = selected;
    document.querySelector('.actions-bar__count--total').textContent = total;
    // Actualiza ambos checkboxes de cabecera según selección
    const header = document.querySelector('.table__checkbox-header');
    const bar = document.querySelector('.actions-bar__checkbox');
    if (header) header.checked = (selected === total && total > 0);
    if (bar) bar.checked = (selected === total && total > 0);
  }

  document.querySelector('.table__body').addEventListener('change', updateSelectionCount);

  enableBtn.addEventListener('click', async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    updateUserStatus(ids, 'Activo');
    await Promise.all(ids.map(id => toggleUserStatus(id, 'Activo')));
    renderPaginatedTable(filteredUsers);
    document.querySelector('.actions-bar__checkbox').checked = false;
    document.querySelector('.table__checkbox-header').checked = false;
  });
  disableBtn.addEventListener('click', async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    updateUserStatus(ids, 'Inactivo');
    await Promise.all(ids.map(id => toggleUserStatus(id, 'Inactivo')));
    renderPaginatedTable(filteredUsers);
    document.querySelector('.actions-bar__checkbox').checked = false;
    document.querySelector('.table__checkbox-header').checked = false;
  });

  // Selección masiva (actions-bar)
  document.querySelector('.actions-bar__checkbox').addEventListener('change', function() {
    const checked = this.checked;
    document.querySelectorAll('.table__checkbox').forEach(cb => { cb.checked = checked; });
    // Sincroniza el checkbox-header
    const thHeader = document.querySelector('.table__checkbox-header');
    if (thHeader) thHeader.checked = checked;
    updateSelectionCount();
  });

  // Selección masiva desde el th (checkbox-header)
  const thHeader = document.querySelector('.table__checkbox-header');
  if (thHeader) {
    thHeader.addEventListener('change', function() {
      const checked = this.checked;
      document.querySelectorAll('.table__checkbox').forEach(cb => { cb.checked = checked; });
      // Sincroniza el de actions-bar
      const bar = document.querySelector('.actions-bar__checkbox');
      if (bar) bar.checked = checked;
      updateSelectionCount();
    });
  }

  // --- Modal Visualizar Usuario ---
  function showUsuarioModal(usuario) {
    document.getElementById('modalUsuarioId').textContent = usuario.id || '';
    document.getElementById('modalUsuarioNombre').textContent = usuario.nombre || '';
    document.getElementById('modalUsuarioCorreo').textContent = usuario.correo || usuario.email || '-';
    document.getElementById('modalUsuarioTipoDoc').textContent = usuario.tipo_documento || '-';
    document.getElementById('modalUsuarioNumDoc').textContent = usuario.numeroDocumento || usuario.numero_documento || usuario.numero_doc || '-';
    document.getElementById('modalUsuarioTelefono').textContent = usuario.telefono || usuario.celular || '-';
    document.getElementById('modalUsuarioRol').textContent = usuario.rol || '-';
    document.getElementById('modalUsuarioEstado').textContent = usuario.estado || '-';
    const imgElem = document.getElementById('modalUsuarioImagen');
    if (imgElem) {
      imgElem.src = usuario.imagen || '../imgs/default-user.jpg';
      imgElem.alt = usuario.nombre || 'Imagen de usuario';
    }
    document.getElementById('viewUsuarioModal').classList.add('modal--active');
  }

  // Cerrar modal
  document.getElementById('closeViewUsuarioModal').onclick = () => {
    document.getElementById('viewUsuarioModal').classList.remove('modal--active');
  };
  document.getElementById('closeViewUsuarioBtn').onclick = () => {
    document.getElementById('viewUsuarioModal').classList.remove('modal--active');
  };
});
