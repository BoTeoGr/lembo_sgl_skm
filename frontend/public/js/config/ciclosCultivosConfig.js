// Configuración de la tabla de ciclos de cultivos
export const ciclosCultivosConfig = {
  table: {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'periodoInicio', label: 'Periodo Inicio' },
      { key: 'periodoFinal', label: 'Periodo Final' },
      { key: 'estado', label: 'Estado' }
    ],
    itemsPerPage: 10
  }
};

let ciclosCultivo = [];

export async function fetchCiclosCultivoFromAPI() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/ciclo_cultivo', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.status === 403) {
      renderNoPermissionTableCiclos();
      return null;
    }
    if (!response.ok) throw new Error('Error al obtener ciclos de cultivo de la API');
    const data = await response.json();
    const arr = Array.isArray(data) ? data : (data.ciclos || data.ciclosCultivo || []);
    ciclosCultivo = arr.map(ciclo => ({
      id: ciclo.id || ciclo.ciclo_id || '',
      nombre: ciclo.nombre || ciclo.nombre_ciclo || '',
      descripcion: ciclo.descripcion || '',
      novedades: ciclo.novedades || '',
      imagen: ciclo.imagen || '',
      periodoInicio: ciclo.periodo_inicio ? new Date(ciclo.periodo_inicio).toLocaleDateString('es-ES') : (ciclo.periodoInicio ? new Date(ciclo.periodoInicio).toLocaleDateString('es-ES') : ''),
      periodoFinal: ciclo.periodo_final ? new Date(ciclo.periodo_final).toLocaleDateString('es-ES') : (ciclo.periodoFinal ? new Date(ciclo.periodoFinal).toLocaleDateString('es-ES') : ''),
      estado: (ciclo.estado && (ciclo.estado.toLowerCase() === 'habilitado' || ciclo.estado.toLowerCase() === 'activo')) ? 'Activo' : 'Inactivo'
    }));
    return ciclosCultivo;
  } catch (e) {
    if (e.message && e.message.toLowerCase().includes('permiso')) {
      renderNoPermissionTableCiclos();
      return null;
    }
    renderErrorTableCiclos(e.message);
    return [];
  }

function renderNoPermissionTableCiclos() {
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

function renderErrorTableCiclos(msg) {
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
}

export function renderCiclosCultivoTable(filtered = ciclosCultivo) {
  const tbody = document.querySelector('.table__body');
  if (!tbody) return;
  
  // Verificar si el usuario es visitante
  const userRole = localStorage.getItem('userRol') || '';
  const isVisitante = ['visitante', 'Visitante'].includes(userRole);
  
  tbody.innerHTML = filtered.map(ciclo => `
    <tr class="table__row">
      <td class="table__cell table__cell--checkbox">
        ${!isVisitante ? `<input type="checkbox" class="table__checkbox" data-id="${ciclo.id}" />` : ''}
      </td>
      <td class="table__cell table__cell--id">${ciclo.id}</td>
      <td class="table__cell table__cell--nombre">${ciclo.nombre}</td>
      <td class="table__cell table__cell--periodo-inicio">${ciclo.periodoInicio}</td>
      <td class="table__cell table__cell--periodo-final">${ciclo.periodoFinal}</td>
      <td class="table__cell table__cell--estado">
        <span class="badge badge--${ciclo.estado === 'Activo' ? 'active' : 'inactive'}">${ciclo.estado}</span>
      </td>
      <td class="table__cell table__cell--actions">
        <button class="table__action-button table__action-button--view" title="Ver"><span class="material-symbols-outlined">visibility</span></button>
        ${!isVisitante ? `
          <button class="table__action-button table__action-button--edit" title="Editar"><span class="material-symbols-outlined">edit</span></button>
          <button class="table__action-button table__action-button--${ciclo.estado === 'Activo' ? 'disable' : 'enable'}" data-id="${ciclo.id}" title="${ciclo.estado === 'Activo' ? 'Desactivar' : 'Activar'}"><span class="material-symbols-outlined">power_settings_new</span></button>
        ` : ''}
      </td>
    </tr>
  `).join('');
}

export async function updateCicloCultivoEstadoAPI(ids, status) {
  // status puede ser 'Activo' o 'Inactivo' desde el front
  // Backend espera 'habilitado' o 'deshabilitado'
  const estadoDB = status === 'Activo' ? 'habilitado' : 'deshabilitado';
  for (const id of ids) {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/ciclo_cultivo/${id}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estado: estadoDB })
    });
  }
}
