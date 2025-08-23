// URL base para las peticiones al backend
const API_URL = "http://localhost:5000"

// --- LÓGICA DE EDICIÓN DE PRODUCCIÓN (GET y PUT) ---
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM completamente cargado");
  // Solo ejecutar en la página de actualizar-produccion
  if (!window.location.pathname.endsWith("actualizar-produccion.html")) {
    console.log("No es la página de actualización de producción");
    return;
  }

  const form = document.getElementById("productionForm");
  const urlParams = new URLSearchParams(window.location.search);
  const productionId = urlParams.get("id");
  if (!form || !productionId) return;

  // 1. GET: Cargar datos de la producción
  try {
    const res = await fetch(`${API_URL}/producciones/${productionId}`);
    if (!res.ok) throw new Error("No se pudo obtener la producción");
    const data = await res.json();

    // Poblar productionData.insumos_ids y productionData.sensores_ids para que la validación y el agregado funcionen correctamente
    productionData.insumos_ids = [];
    if (Array.isArray(data.insumos)) {
      data.insumos.forEach(insumo => {
        productionData.insumos_ids.push({
          id: insumo.id,
          cantidad_usar: insumo.cantidad_usar || insumo.cantidad_usada || insumo.cantidad_utilizada || 0,
          esNuevo: false // Los insumos originales NO son nuevos
        });
      });
    }
    productionData.sensores_ids = [];
    if (Array.isArray(data.sensores)) {
      data.sensores.forEach(sensor => {
        productionData.sensores_ids.push(sensor.id);
      });
    }

    // Llenar campos básicos
    form.productionName.value = data.nombre || "";
    form.productionType.value = data.tipo || "";
    form.location.value = data.ubicacion || "";
    form.description.value = data.descripcion || "";
    form.quantity.value = data.cantidad || "";
    form.startDate.value = data.fecha_de_inicio ? data.fecha_de_inicio.slice(0, 10) : "";
    form.endDate.value = data.fecha_fin ? data.fecha_fin.slice(0, 10) : "";

    // Llenar selects dinámicos (cultivo, ciclo, responsable)
    await initializeForm(); // Llenar selects con helpers existentes
    form.crop.value = data.cultivo_id || "";
    form.cropCycle.value = data.ciclo_id || "";
    form.responsible.value = data.usuario_id || "";
    // Importante: agregar listeners para los botones de agregar insumo/sensor
    setupEventListeners();

    // Llenar insumos seleccionados y renderizar tarjetas
    selectedSupplies = [];
    if (Array.isArray(data.insumos)) {
      data.insumos.forEach(insumo => {
        selectedSupplies.push({
          ...insumo,
          id: insumo.id,
          cantidad_usar: insumo.cantidad_usar || insumo.cantidad_usada || insumo.cantidad_utilizada || 0
        });
      });
    }
    updateAvailableSuppliesSelect();
    renderSelectedSupplies();

    // Llenar sensores seleccionados y renderizar tarjetas
    selectedSensors = new Set();
    if (Array.isArray(data.sensores)) {
      data.sensores.forEach(sensor => {
        selectedSensors.add(String(sensor.id));
      });
    }
    renderSelectedSensors();

    // Mostrar inversión y meta de ganancia
    form.totalInvestment.value = data.inversion || "";
    form.estimatedProfit.value = data.meta_ganancia || (data.inversion ? (parseFloat(data.inversion) * 1.3).toFixed(2) : "");

    // Renderiza los insumos seleccionados en el DOM
    function renderSelectedSupplies() {
      const selectedSuppliesDiv = document.getElementById("selectedSupplies");
      if (!selectedSuppliesDiv) return;
      selectedSuppliesDiv.innerHTML = "";
      selectedSupplies.forEach(supply => {
        const supplyCard = document.createElement("div");
        supplyCard.className = "item-card";
        supplyCard.dataset.supplyId = supply.id;
        supplyCard.innerHTML = `
      <button type="button" class="remove-item" onclick="removeSelectedItem(this, 'supply')">
          <i class="fas fa-times"></i>
      </button>
      <div class="item-info">
          <span class="item-name">${supply.nombre}</span>
          <span class="item-details">Valor: $${supply.valor_unitario || ''}</span>
          <span class="item-details">Cantidad: ${supply.cantidad_usar || 'Pendiente...'}</span>
      </div>
    `;
        selectedSuppliesDiv.appendChild(supplyCard);
      });
    }

    // Renderiza los sensores seleccionados en el DOM
    function renderSelectedSensors() {
      const selectedSensorsDiv = document.getElementById("selectedSensors");
      if (!selectedSensorsDiv) return;
      selectedSensorsDiv.innerHTML = "";
      selectedSensors.forEach(sensorId => {
        // Buscar el nombre del sensor en el select (opcional, si quieres mostrar el nombre)
        const sensorSelect = document.getElementById("sensor");
        let sensorName = sensorId;
        if (sensorSelect) {
          const option = Array.from(sensorSelect.options).find(opt => opt.value == sensorId);
          if (option) sensorName = option.text;
        }
        const sensorCard = document.createElement("div");
        sensorCard.className = "item-card";
        sensorCard.dataset.sensorId = sensorId;
        sensorCard.innerHTML = `
      <button type="button" class="remove-item" onclick="removeSelectedItem(this, 'sensor')">
          <i class="fas fa-times"></i>
      </button>
      <div class="item-info">
          <span class="item-name">${sensorName}</span>
      </div>
    `;
        selectedSensorsDiv.appendChild(sensorCard);
      });
    }
  } catch (error) {
    showToast("Error", "No se pudo cargar la producción: " + error.message, "error");
  }

  // 2. PUT: Actualizar datos de la producción
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    // Preparar datos para PUT
    const validSupplies = selectedSupplies.filter(s => s.id && s.cantidad_usar && !isNaN(s.cantidad_usar) && s.cantidad_usar > 0);
    // Mapear insumos para mantener la propiedad esNuevo
    const updatedInsumos = validSupplies.map(s => {
      const prodInsumo = productionData.insumos_ids.find(i => i.id === s.id);
      return {
        id: s.id,
        cantidad_usar: s.cantidad_usar,
        esNuevo: prodInsumo ? !!prodInsumo.esNuevo : true // fallback true si no se encuentra
      };
    });

    // Validar campos numéricos
    const usuario_id = parseInt(form.responsible.value);
    const cantidad = parseFloat(form.quantity.value);
    const cultivo_id = parseInt(form.crop.value);
    const ciclo_id = parseInt(form.cropCycle.value);
    const inversion = parseFloat(form.totalInvestment.value);
    const meta_ganancia = parseFloat(form.estimatedProfit.value);

    // Validar campos requeridos con mensajes personalizados
    if (isNaN(cantidad) || cantidad <= 0) {
      showToast("Error", "Debe ingresar una cantidad válida", "error");
      return;
    }

    if (isNaN(cultivo_id) || cultivo_id <= 0) {
      showToast("Error", "Debe seleccionar un cultivo", "error");
      return;
    }

    if (isNaN(ciclo_id) || ciclo_id <= 0) {
      showToast("Error", "Debe seleccionar un ciclo de cultivo", "error");
      return;
    }

    // Validar campos numéricos restantes
    if (isNaN(usuario_id)) {
      showToast("Error", "Debe seleccionar un responsable", "error");
      return;
    }

    // Validar que haya al menos un insumo seleccionado
    if (updatedInsumos.length === 0) {
      showToast("Error", "Debe seleccionar por lo menos un insumo", "error");
      return;
    }

    // Validar fechas
    if (form.startDate.value && form.endDate.value) {
      const startDate = new Date(form.startDate.value);
      const endDate = new Date(form.endDate.value);
      if (startDate > endDate) {
        showToast("Error", "La fecha de inicio no puede ser posterior a la fecha de finalización", "error");
        return;
      }
    }

    const updatedData = {
      nombre: form.productionName.value.trim(),
      tipo: form.productionType.value,
      ubicacion: form.location.value.trim(),
      descripcion: form.description.value.trim(),
      usuario_id: usuario_id,
      cantidad: cantidad,
      cultivo_id: cultivo_id,
      ciclo_id: ciclo_id,
      insumos_ids: updatedInsumos,
      sensores_ids: Array.from(selectedSensors).map(id => parseInt(id)),
      fecha_de_inicio: form.startDate.value || null,
      fecha_fin: form.endDate.value || null,
      inversion: inversion,
      meta_ganancia: meta_ganancia,
    };

    try {
      console.log('Enviando datos al servidor:', updatedData);
      const response = await fetch(`${API_URL}/producciones/${productionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la producción');
      }

      showToast('Éxito', 'Producción actualizada correctamente', 'success');
      setTimeout(() => {
        window.location.href = 'listar-producciones.html';
      }, 1500);
      
    } catch (error) {
      console.error('Error al actualizar la producción:', error);
      showToast('Error', error.message || 'Error al actualizar la producción', 'error');
    }
  });
});

// Mapeo de campos ID para cada tipo de entidad según la estructura de la base de datos
const ID_FIELDS = {
  crop: "id",
  sensor: "id",
  supply: "id",
  user: "id",
  cycle: "id",
}

// Mapeo de campos nombre para cada tipo de entidad según la estructura de la base de datos
const NAME_FIELDS = {
  crop: "nombre",
  sensor: "nombre_sensor",
  supply: "nombre",
  user: "nombre",
  cycle: "nombre",
}

// Objeto para almacenar los datos de la producción
const productionData = {
  nombre: "",
  tipo: "",
  ubicacion: "",
  descripcion: "",
  usuario_id: 0,
  cantidad: 1,
  estado: "habilitado",
  cultivo_id: 0,
  ciclo_id: 0,
  insumos_ids: [],
  sensores_ids: [],
  fecha_de_inicio: "",
  fecha_fin: "",
  inversion: 0,
  meta_ganancia: 0,
  // NO incluir campo imagen para produccion
}

// Variables globales
// Array para almacenar los insumos seleccionados con sus cantidades
let selectedSupplies = [];
// Set para almacenar los sensores seleccionados
let selectedSensors = new Set();

// Variables para el modal de creación de usuario
let createUserModal = document.getElementById("createUserModal");
let closeCreateUserModal = document.getElementById("closeCreateUserModal");
let createUserBtn = document.getElementById("createUserBtn");
let createUserForm = document.getElementById("createUserForm");
let modalUserData = {
  userTypeId: "",
  userName: "",
  userId: "",
  userTel: "",
  userEmail: "",
  userConfirmEmail: "",
  userRol: "",
  estado: ""
};
const closeCreateSensorModal = document.getElementById("closeCreateSensorModal")
const createSensorForm = document.getElementById("createSensorForm")

// Objeto para almacenar datos del sensor en el modal
const modalSensorData = {
  sensorType: "",
  sensorName: "",
  sensorUnit: "",
  sensorImage: "sensor-default.jpg", // Valor predeterminado para la imagen
  sensorDescription: "",
  sensorScan: "",
  estado: "habilitado",
}

// Variables para el modal de creación de insumo
const createSupplyBtn = document.getElementById("createSupplyBtn")
const createSupplyModal = document.getElementById("createSupplyModal")
const closeCreateSupplyModal = document.getElementById("closeCreateSupplyModal")
const createSupplyForm = document.getElementById("createSupplyForm")

// Objeto para almacenar datos del insumo en el modal
const modalSupplyData = {
  insumeName: "",
  insumeType: "",
  insumeImage: "insumo-default.jpg", // Valor predeterminado para la imagen
  insumeExtent: "",
  insumeDescription: "",
  insumePrice: "",
  insumeAmount: "",
  totalValue: "",
  usuario_id: 1, // Valor por defecto para el usuario
  estado: "habilitado",
}

// Variables para el modal de creación de cultivo
const createCropBtn = document.getElementById("createCropBtn")
const createCropModal = document.getElementById("createCropModal")
const closeCreateCropModal = document.getElementById("closeCreateCropModal")
const createCropForm = document.getElementById("createCropForm")

// Objeto para almacenar datos del cultivo en el modal
const modalCropData = {
  cultiveName: "",
  cultiveType: "",
  cultiveImage: "cultivo-default.jpg", // Valor predeterminado para la imagen
  cultiveLocation: "",
  cultiveDescription: "",
  cultiveSize: "",
  usuario_id: 1, // Valor por defecto para el usuario
  estado: "habilitado",
}

// Variables para el modal de creación de ciclo de cultivo
const createCropCycleBtn = document.getElementById("createCropCycleBtn")
const createCropCycleModal = document.getElementById("createCropCycleModal")
const closeCreateCropCycleModal = document.getElementById("closeCreateCropCycleModal")
const createCropCycleForm = document.getElementById("createCropCycleForm")

// Objeto para almacenar datos del ciclo de cultivo en el modal
const modalCropCycleData = {
  cycleName: "",
  cycleDescription: "",
  cycleStartDate: "",
  cycleEndDate: "",
  cycleUpdates: "",
  usuario_id: 1, // Valor por defecto para el usuario
  estado: "habilitado",
}

// Guardar el array global de insumos al cargar el formulario
let allSuppliesGlobal = []

// Inicializar el Set para almacenar los sensores seleccionados
// Ya está declarado como variable global

// Inicialización del formulario
document.addEventListener("DOMContentLoaded", async () => {
  // Solo inicializar globalmente si NO es la página de actualizar-produccion
  if (!window.location.pathname.endsWith("actualizar-produccion.html")) {
    console.log("DOM cargado, inicializando formulario (creación)");
    await initializeForm();
    setupEventListeners();
    console.log("Formulario inicializado");
  }
});

// Función para obtener todos los items de un endpoint paginado
async function getAllItems(endpoint, limit = 100) {
  try {
    console.log(`Solicitando datos de ${endpoint}...`)
    const response = await fetch(`${API_URL}${endpoint}?page=1&limit=${limit}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Datos recibidos de ${endpoint}:`, data)

    // Determinar la estructura de los datos según el endpoint
    let items = data

    if (endpoint === "/cultivos") {
      items = data.cultivos || data
    } else if (endpoint === "/ciclo_cultivo") {
      items = data.ciclos || data
    } else if (endpoint === "/sensor") {
      items = data.sensores || data
    } else if (endpoint === "/insumos") {
      items = data.insumos || data
    } else if (endpoint === "/usuarios") {
      items = data.usuarios || data
    }

    console.log(`Items procesados de ${endpoint}:`, items)
    return items
  } catch (error) {
    console.error(`Error al obtener datos de ${endpoint}:`, error)
    showToast("Error", `No se pudieron cargar los datos de ${endpoint}`, "error")
    return []
  }
}

// Función para actualizar el select de insumos disponibles

// Función para actualizar el select de insumos disponibles
function updateAvailableSuppliesSelect() {
  const supplySelect = document.getElementById("supply")
  if (!supplySelect) {
    console.error("No se encontró el elemento con id: supply")
    return
  }

  console.log("Actualizando select de insumos con:", allSuppliesGlobal)

  // Filtra los insumos que tienen valor_unitario y cantidad
  const availableSupplies = allSuppliesGlobal.filter(
    (supply) => supply && supply.valor_unitario && supply.cantidad && supply.estado === "habilitado",
  )

  console.log("Insumos disponibles filtrados:", availableSupplies)

  supplySelect.innerHTML = '<option value="">Seleccionar insumo</option>'

  availableSupplies.forEach((supply) => {
    supplySelect.innerHTML += `
      <option value="${supply.id}">
        ${supply.nombre} ($${supply.valor_unitario})
      </option>
    `
  })

  // Verificar si se agregaron opciones
  if (supplySelect.options.length <= 1) {
    console.warn("No se agregaron opciones al selector de insumos")
  } else {
    console.log(`Se agregaron ${supplySelect.options.length - 1} opciones al selector de insumos`)
  }
}

// Función para inicializar el formulario
async function initializeForm() {
  try {
    // Cargar todos los datos necesarios con un límite alto para obtener todos los items
    const [cropsData, cyclesData, sensorsData, suppliesData, usersData] = await Promise.all([
      getAllItems("/cultivos", 100),
      getAllItems("/ciclo_cultivo", 100),
      getAllItems("/sensor", 100),
      getAllItems("/insumos", 100),
      getAllItems("/usuarios", 100),
    ])

    console.log("Datos cargados:", { cropsData, cyclesData, sensorsData, suppliesData, usersData })

    // Extraer los arrays de los datos paginados
    // Verificar la estructura de los datos y extraer correctamente
    const crops = Array.isArray(cropsData) ? cropsData : cropsData.cultivos || []
    const cycles = Array.isArray(cyclesData) ? cyclesData : cyclesData.ciclos || []
    const sensors = Array.isArray(sensorsData) ? sensorsData : sensorsData.sensores || []
    const supplies = Array.isArray(suppliesData) ? suppliesData : suppliesData.insumos || []
    const users = Array.isArray(usersData) ? usersData : usersData.usuarios || []

    console.log("Arrays procesados:", { crops, cycles, sensors, supplies, users })

    // Llenar los selectores
    fillSelect("crop", crops, "Seleccionar cultivo", NAME_FIELDS.crop, ID_FIELDS.crop)
    fillSelect("cropCycle", cycles, "Seleccionar ciclo", NAME_FIELDS.cycle, ID_FIELDS.cycle)
    fillSelect("sensor", sensors, "Seleccionar sensor", NAME_FIELDS.sensor, ID_FIELDS.sensor)

    // Filtrar insumos con cantidad mayor a 0
    const suppliesWithStock = supplies.filter(s => Number(s.cantidad) > 0);
    // Guardar todos los insumos en la variable global
    allSuppliesGlobal = suppliesWithStock;
    updateAvailableSuppliesSelect();

    // Filtrar usuarios con rol 'admin' y mostrar solo esos en el selector de responsables
    const adminUsers = users.filter(u => u.rol && u.rol.toLowerCase() === 'admin');
    fillSelect("responsible", adminUsers, "Seleccionar responsable", NAME_FIELDS.user, ID_FIELDS.user)

    // Inicializar fechas con valores predeterminados
    const startDate = document.getElementById("startDate")
    const endDate = document.getElementById("endDate")

    // Establecer la fecha actual del sistema como valor por defecto para la fecha de inicio
    if (startDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      startDate.value = `${yyyy}-${mm}-${dd}`;
    }

    if (endDate && !endDate.value) {
      const today = new Date();
      const threeMonthsLater = new Date(today);
      threeMonthsLater.setMonth(today.getMonth() + 3);
      endDate.value = threeMonthsLater.toISOString().split("T")[0];
    }

    // Hacer que el campo de inversión sea de solo lectura
    const totalInvestmentField = document.getElementById("totalInvestment")
    if (totalInvestmentField) {
      totalInvestmentField.readOnly = true
    }

    // Ocultar la sección de registro de uso de insumo
    const supplyUsageForm = document.getElementById("supplyUsageForm")
    if (supplyUsageForm) {
      supplyUsageForm.classList.add("hidden")
    }

    // Inicializar campos de inversión y meta de ganancia
    calculateTotalInvestment()
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error)
    showToast("Error", "No se pudieron cargar los datos iniciales", "error")
  }
}

// Función auxiliar para llenar selectores
function fillSelect(elementId, items, defaultText, nameField, idField = "id") {
  const select = document.getElementById(elementId)
  if (!select) {
    console.error(`No se encontró el elemento con id: ${elementId}`)
    return
  }

  select.innerHTML = `<option value="">${defaultText}</option>`

  if (!Array.isArray(items)) {
    console.error(`Los datos para ${elementId} no son un array:`, items)
    return
  }

  console.log(`Llenando selector ${elementId} con ${items.length} items`)

  // Filtrar solo los items habilitados y que tengan los campos necesarios
  const enabledItems = items.filter((item) => item && item.estado === "habilitado")
  console.log(`Items habilitados para ${elementId}:`, enabledItems)

  enabledItems.forEach((item) => {
    const id = item[idField]
    const name = item[nameField]
    if (id && name) {
      select.innerHTML += `<option value="${id}">${name}</option>`
    } else {
      if (elementId == 'crop' && item.cultivoId) {
        select.innerHTML += `<option value="${item.cultivoId}">${item.nombre}</option>`
      } else {
        console.log(`Item inválido en ${elementId} (id: ${id}, name: ${name}):`, item)
        console.log("Campos disponibles:", Object.keys(item))
      }
    }
  })

  // Verificar si se agregaron opciones
  if (select.options.length <= 1) {
    console.warn(`No se agregaron opciones al selector ${elementId}`)
  } else {
    console.log(`Se agregaron ${select.options.length - 1} opciones al selector ${elementId}`)
  }
}

// Add these event listeners after the existing setupEventListeners function
function setupEventListeners() {
  const elements = {
    // Campos básicos
    productionName: document.getElementById("productionName"),
    productionType: document.getElementById("productionType"),
    location: document.getElementById("location"),
    description: document.getElementById("description"),

    // Selects principales
    crop: document.getElementById("crop"),
    cropCycle: document.getElementById("cropCycle"),
    responsible: document.getElementById("responsible"),

    // Nuevos campos de fecha e inversión
    startDate: document.getElementById("startDate"),
    endDate: document.getElementById("endDate"),
    totalInvestment: document.getElementById("totalInvestment"),
    estimatedProfit: document.getElementById("estimatedProfit"),

    // Botones de agregar items
    addSensor: document.getElementById("addSensor"),
    addSupply: document.getElementById("addSupply"),

    // Formulario principal
    productionForm: document.getElementById("productionForm"),
  }

  // Verificar que todos los elementos existen
  for (const [key, element] of Object.entries(elements)) {
    if (!element) {
      console.error(`Elemento no encontrado: ${key}`)
      continue
    }

    if (key === "addSensor") {
      element.addEventListener("click", addSelectedSensor)
    } else if (key === "addSupply") {
      element.addEventListener("click", addSelectedSupply)
    } else if (key === "responsible") {
      // Actualizar el usuario_id cuando cambia el responsable
      element.addEventListener("change", (e) => {
        productionData.usuario_id = parseInt(e.target.value) || 0
      })
    }
  }

  // Configurar el botón de sugerencia de meta de ganancia
  setupProfitSuggestionButton()

  // No agregar lógica de creación en el formulario de actualización
}

// Add these validation functions after the existing validateForm function
// Modificar la función validateDates para eliminar la validación de fecha pasada
function validateDates() {
  const startDate = document.getElementById("startDate")
  const endDate = document.getElementById("endDate")
  const startDateHelperText = document.getElementById("startDateHelperText")
  const endDateHelperText = document.getElementById("endDateHelperText")

  if (!startDate || !endDate) return true

  // Validar que las fechas no estén vacías
  if (!startDate.value) {
    if (startDateHelperText) {
      startDateHelperText.textContent = "Por favor seleccione una fecha de inicio"
      startDateHelperText.classList.add("text-error")
    }
    startDate.setCustomValidity("Por favor seleccione una fecha de inicio")
    return false
  } else {
    startDate.setCustomValidity("")
    if (startDateHelperText) {
      startDateHelperText.textContent = ""
      startDateHelperText.classList.remove("text-error")
    }
  }

  if (!endDate.value) {
    if (endDateHelperText) {
      endDateHelperText.textContent = "Por favor seleccione una fecha de fin"
      endDateHelperText.classList.add("text-error")
    }
    endDate.setCustomValidity("Por favor seleccione una fecha de fin")
    return false
  } else {
    endDate.setCustomValidity("")
    if (endDateHelperText) {
      endDateHelperText.textContent = ""
      endDateHelperText.classList.remove("text-error")
    }
  }

  const start = new Date(startDate.value)
  const end = new Date(endDate.value)

  // Eliminar la validación que impide fechas en el pasado
  // Validar solo que la fecha de fin sea posterior a la fecha de inicio
  if (start >= end) {
    if (endDateHelperText) {
      endDateHelperText.textContent = "La fecha de fin debe ser posterior a la fecha de inicio"
      endDateHelperText.classList.add("text-error")
    }
    endDate.setCustomValidity("La fecha de fin debe ser posterior a la fecha de inicio")
    return false
  } else {
    endDate.setCustomValidity("")
    if (endDateHelperText) {
      endDateHelperText.textContent = ""
      endDateHelperText.classList.remove("text-error")
    }
  }

  // Validar que la duración no sea excesiva (por ejemplo, más de 2 años)
  const twoYearsInMs = 2 * 365 * 24 * 60 * 60 * 1000
  if (end - start > twoYearsInMs) {
    if (endDateHelperText) {
      endDateHelperText.textContent = "La duración no puede ser mayor a 2 años"
      endDateHelperText.classList.add("text-error")
    }
    endDate.setCustomValidity("La duración no puede ser mayor a 2 años")
    return false
  } else {
    endDate.setCustomValidity("")
    if (endDateHelperText) {
      endDateHelperText.textContent = ""
      endDateHelperText.classList.remove("text-error")
    }
  }

  return true
}

// Función para validar inversión y meta de ganancias
function validateInvestmentAndProfit() {
  const totalInvestment = document.getElementById("totalInvestment")
  const estimatedProfit = document.getElementById("estimatedProfit")
  const profitHelperText = document.getElementById("profitHelperText")
  const investmentHelperText = document.getElementById("investmentHelperText")

  if (!totalInvestment || !estimatedProfit) return true

  // Validar que la inversión sea un número válido y mayor que cero
  const investment = Number.parseFloat(totalInvestment.value) || 0
  if (isNaN(investment) || investment <= 0) {
    if (investmentHelperText) {
      investmentHelperText.textContent = "La inversión debe ser un número mayor a 0"
      investmentHelperText.classList.add("text-error")
    }
    totalInvestment.setCustomValidity("La inversión debe ser un número mayor a 0")
    return false
  } else {
    totalInvestment.setCustomValidity("")
    if (investmentHelperText) {
      investmentHelperText.textContent = "Ingrese el monto total de inversión para esta producción"
      investmentHelperText.classList.remove("text-error")
    }
  }

  // Validar que la meta de ganancia sea un número válido y mayor que cero
  const profit = Number.parseFloat(estimatedProfit.value) || 0
  if (isNaN(profit) || profit <= 0) {
    if (profitHelperText) {
      profitHelperText.textContent = "La meta de ganancias debe ser un número mayor a 0"
      profitHelperText.classList.add("text-error")
    }
    estimatedProfit.setCustomValidity("La meta de ganancias debe ser un número mayor a 0")
    return false
  } else {
    estimatedProfit.setCustomValidity("")
    if (profitHelperText) {
      profitHelperText.textContent = "La meta de ganancias debe ser mayor o igual a la inversión"
      profitHelperText.classList.remove("text-error")
    }
  }

  // Validar que la meta de ganancia sea mayor o igual a la inversión
  if (profit < investment) {
    if (profitHelperText) {
      profitHelperText.textContent = "La meta de ganancias debe ser mayor o igual a la inversión"
      profitHelperText.classList.add("text-error")
    }
    estimatedProfit.setCustomValidity("La meta de ganancias debe ser mayor o igual a la inversión")
    return false
  } else {
    estimatedProfit.setCustomValidity("")
    if (profitHelperText) {
      profitHelperText.textContent = "La meta de ganancias debe ser mayor o igual a la inversión"
      profitHelperText.classList.remove("text-error")
    }
  }

  return true
}

// Update the validateForm function to include the new validations
function validateForm() {
  console.log("Validando formulario")
  let isValid = true

  // Validar nombre de producción
  const nombreProduccion = document.getElementById("productionName")?.value.trim()
  const validacionNombre = validarNombreProduccion(nombreProduccion)
  if (!validacionNombre.valido) {
    showToast("Error", validacionNombre.mensaje, "error")
    
  }

  // Validar campos requeridos básicos
  const requiredFields = [
    { id: "productionType", name: "Tipo de producción" },
    { id: "location", name: "Ubicación" },
    { id: "description", name: "Descripción" },
    { id: "crop", name: "Cultivo" },
    { id: "cropCycle", name: "Ciclo de cultivo" },
    { id: "responsible", name: "Responsable" },
    { id: "startDate", name: "Fecha de inicio" },
    { id: "endDate", name: "Fecha de finalización" },
    { id: "totalInvestment", name: "Inversión total" },
    { id: "estimatedProfit", name: "Meta de ganancias" },
  ]

  // Verificar campos requeridos
  requiredFields.forEach(field => {
    const element = document.getElementById(field.id)
    if (!element || (element.value && element.value.trim() === "")) {
      console.log(`Campo requerido no válido: ${field.id}`)
      showToast("Error", `El campo ${field.name} es requerido`, "error")
      
    }
  })

  // Verificar que haya al menos un insumo seleccionado
  if (!productionData.insumos_ids || productionData.insumos_ids.length === 0) {
    console.log("No hay insumos seleccionados")
    showToast("Error", "Debe seleccionar al menos un insumo", "error")
    
  }

  // Verificar máximo de sensores (solo advertencia)
  if (selectedSensors.size > 3) {
    console.log("Advertencia: Se han seleccionado más de 3 sensores")
    showToast("Advertencia", "Se han seleccionado más de 3 sensores", "warning")
  }

  // Validar fechas
  if (!validateDates()) {
    console.log("Fechas no válidas")
    
  }

  // Validar inversión y meta de ganancias
  if (!validateInvestmentAndProfit()) {
    console.log("Inversión o meta de ganancias no válidas")
    
  }

  // // Deshabilitar el botón de enviar si hay errores
  // const submitBtn = document.querySelector('button[type="submit"]')
  // if (submitBtn) {
  //   submitBtn.disabled = !isValid
  // }

  console.log("Formulario válido:", isValid)
  return isValid
}

// Funciones para manejar la selección de sensores e insumos
// Función para agregar un sensor seleccionado
function addSelectedSensor() {
  const sensorSelect = document.getElementById("sensor");
  const selectedSensor = sensorSelect.options[sensorSelect.selectedIndex];

  if (!selectedSensor.value) {
    showToast("Error", "Por favor seleccione un sensor", "error");
    return;
  }

  if (selectedSensors.has(selectedSensor.value)) {
    showToast("Error", "Este sensor ya ha sido agregado", "error");
    return;
  }

  if (selectedSensors.size >= 3) {
    showToast("Error", "No se pueden agregar más de 3 sensores", "error");
    return;
  }

  selectedSensors.add(selectedSensor.value);

  const selectedSensorsDiv = document.getElementById("selectedSensors");
  const sensorCard = document.createElement("div");
  sensorCard.className = "item-card";
  sensorCard.dataset.sensorId = selectedSensor.value;
  sensorCard.innerHTML = `
        <button type="button" class="remove-item" onclick="removeSelectedItem(this, 'sensor')">
            <i class="fas fa-times"></i>
        </button>
        <div class="item-info">
            <span class="item-name">${selectedSensor.text}</span>
        </div>
    `;

  selectedSensorsDiv.appendChild(sensorCard);
  updateCreateButtonState();
}

// Función para calcular la inversión total basada en los insumos seleccionados
function calculateTotalInvestment() {
  const totalInvestmentField = document.getElementById("totalInvestment")
  const estimatedProfitField = document.getElementById("estimatedProfit")

  // Verificar que existan insumos seleccionados
  if (!selectedSupplies || selectedSupplies.length === 0) {
    totalInvestmentField.value = "0.00"
    estimatedProfitField.value = ""
    return
  }

  // Obtener los insumos seleccionados con sus cantidades específicas
  const selectedSuppliesFull = selectedSupplies.map(supply => {
    const supplyData = allSuppliesGlobal.find(s => String(s.id) === String(supply.id));
    return {
      ...supplyData,
      cantidad_usar: supply.cantidad_usar || 0
    };
  }).filter(supply => supply && supply.valor_unitario && supply.cantidad_usar)

  // Calcular el total de inversión
  let totalInvestment = 0
  selectedSuppliesFull.forEach((supply) => {
    if (supply && supply.valor_unitario && supply.cantidad_usar) {
      totalInvestment += Number.parseFloat(supply.valor_unitario) * Number.parseFloat(supply.cantidad_usar)
    }
  })

  // Actualizar el campo de inversión total
  totalInvestmentField.value = totalInvestment.toFixed(2)

  // Si no hay un valor en el campo de meta de ganancia, sugerir un 30% más que la inversión
  if (!estimatedProfitField.value || Number.parseFloat(estimatedProfitField.value) < totalInvestment) {
    const suggestedProfit = totalInvestment * 1.3 // 30% más que la inversión
    estimatedProfitField.value = suggestedProfit.toFixed(2)
  }

  // Validar la inversión y meta de ganancia
  validateInvestmentAndProfit()
}

// Variable temporal para almacenar el insumo seleccionado
let tempSelectedSupply = null;

// Función para mostrar el formulario de cantidad a usar
function showSupplyUsageForm(supplyId) {
  const supply = selectedSupplies.find(s => s.id === supplyId)
  if (!supply) return

  const supplyUsageForm = document.getElementById("supplyUsageForm")
  if (supplyUsageForm) {
    supplyUsageForm.style.display = "block"
    supplyUsageForm.innerHTML = `
      <div class="form-group">
        <label for="supplyUsageAmount">Cantidad a usar (${supply.nombre}):</label>
        <input type="number" class="form-control" id="supplyUsageAmount" min="0" step="0.01" value="${supply.cantidad_usar || 0}">
        <small class="text-muted">Stock disponible: ${supply.cantidad}</small>
      </div>
      <button type="button" class="btn btn-primary" onclick="handleSupplyUsage(${supplyId})">Confirmar cantidad</button>
    `
  }
}

// Función para manejar la cantidad a usar del insumo
function handleSupplyUsage(supplyId) {
  const supplyUsageAmount = document.getElementById("supplyUsageAmount").value
  if (!supplyUsageAmount || parseFloat(supplyUsageAmount) <= 0) {
    showToast("Error", "Por favor, ingrese una cantidad válida.", "error")
    return
  }

  const cantidadDecimal = parseFloat(supplyUsageAmount).toFixed(2)

  const supply = selectedSupplies.find(s => s.id === supplyId)
  if (!supply) {
    showToast("Error", "Insumo no encontrado", "error")
    return
  }

  if (parseFloat(cantidadDecimal) > supply.cantidad) {
    showToast("Error", "La cantidad excede el stock disponible.", "error")
    return
  }

  const supplyIndex = selectedSupplies.findIndex(s => s.id === supplyId)
  if (supplyIndex !== -1) {
    const cantidadUsar = parseFloat(cantidadDecimal);
    selectedSupplies[supplyIndex] = {
      ...selectedSupplies[supplyIndex],
      cantidad_usar: cantidadUsar,
      cantidad_usada: cantidadDecimal // Guardar la cantidad usada
    }
    console.log(`Actualizando insumo ${supplyId} con cantidad: ${cantidadUsar}`)
  }

  const supplyCard = document.querySelector(`[data-supply-id="${supplyId}"]`)
  if (supplyCard) {
    const quantitySpan = supplyCard.querySelector(".item-details:last-child")
    if (quantitySpan) {
      quantitySpan.textContent = `Cantidad: ${cantidadDecimal}`
    }
    const registerButton = supplyCard.querySelector(".btn-success")
    if (registerButton) {
      registerButton.style.display = "inline-block"
    }
  }

  const supplyUsageForm = document.getElementById("supplyUsageForm")
  if (supplyUsageForm) {
    supplyUsageForm.style.display = "none"
  }
  document.getElementById("supplyUsageAmount").value = ""

  calculateTotalInvestment()
}

// Función para registrar el uso del insumo
function registerSupplyUsage() {
  console.log('Iniciando registro de uso');
  console.log('tempSelectedSupply:', tempSelectedSupply);

  const supply = tempSelectedSupply;
  if (!supply) {
    showToast("Error", "No se ha seleccionado ningún insumo", "error");
    return;
  }

  const quantityInput = document.getElementById("supplyUsageQuantity");
  const quantity = parseFloat(quantityInput.value);

  console.log('Cantidad ingresada:', quantity);
  console.log('Cantidad disponible:', supply.cantidad);

  if (isNaN(quantity) || quantity <= 0) {
    showToast("Error", "Por favor ingrese una cantidad válida", "error");
    return;
  }

  if (quantity > supply.cantidad) {
    showToast("Error", "La cantidad excede el stock disponible", "error");
    return;
  }

  // Encontrar y actualizar el objeto en la lista de insumos seleccionados
  const supplyIndex = selectedSupplies.findIndex(s => s.id === supply.id);
  if (supplyIndex !== -1) {
    // Actualizar el objeto en selectedSupplies
    selectedSupplies[supplyIndex] = {
      ...selectedSupplies[supplyIndex],
      cantidad_usar: quantity,
      cantidad_usada: quantity
    };

    // Actualizar o agregar en productionData.insumos_ids
    const productionIndex = productionData.insumos_ids.findIndex(s => s.id === supply.id);
    if (productionIndex !== -1) {
      // Si ya existe, actualizar (mantener esNuevo)
      const prev = productionData.insumos_ids[productionIndex];
      productionData.insumos_ids[productionIndex] = {
        id: supply.id,
        cantidad_usar: quantity,
        esNuevo: prev && typeof prev.esNuevo !== 'undefined' ? prev.esNuevo : true
      };
    } else {
      // Si no existe, agregar como nuevo
      productionData.insumos_ids.push({
        id: supply.id,
        cantidad_usar: quantity,
        esNuevo: true
      });
    }
  }

  // Actualizar la UI de la tarjeta del insumo
  const supplyCard = document.querySelector(`[data-supply-id="${supply.id}"]`);
  if (supplyCard) {
    const cantidadElement = supplyCard.querySelector(".item-details:last-child");
    if (cantidadElement) {
      cantidadElement.textContent = `Cantidad: ${quantity}`;
    }
  }

  // Limpiar el campo de cantidad para el siguiente insumo
  quantityInput.value = '';

  // Recalcular la inversión total
  calculateTotalInvestment();

  // Mostrar mensaje de éxito
  showToast("Éxito", "Uso de insumo registrado correctamente", "success");
}

// Modificar la función addSelectedSupply para incluir la cantidad a usar
function addSelectedSupply() {
  // Verificar si selectedSupplies está inicializado
  if (!Array.isArray(selectedSupplies)) {
    selectedSupplies = [];
  }

  const supplySelect = document.getElementById("supply");
  const supplyId = supplySelect.value;

  // Verificar si el insumo ya está en la lista
  const existingSupply = selectedSupplies.find(s => String(s.id) === String(supplyId));
  if (existingSupply) {
    showToast("Error", "Este insumo ya está agregado", "error");
    return;
  }

  // Buscar el insumo en la lista global
  const supply = allSuppliesGlobal.find(s => String(s.id) === String(supplyId));
  if (!supply || !supply.valor_unitario || !supply.cantidad) {
    showToast("Error", "Este insumo no tiene valor unitario o cantidad definidos", "error");
    return;
  }

  // Crear el objeto del insumo
  const supplyToAdd = {
    ...supply,
    cantidad_usar: 0
  };

  // Usar la misma referencia para tempSelectedSupply
  tempSelectedSupply = supplyToAdd;

  // Agregar el insumo a la lista de insumos seleccionados
  selectedSupplies.push(supplyToAdd);
  // Agregar correctamente el objeto con cantidad_usar inicial 0
  productionData.insumos_ids.push({ id: supplyToAdd.id, cantidad_usar: 0, esNuevo: true });
  // Mostrar el formulario de registro de uso
  const supplyUsageForm = document.getElementById("supplyUsageForm");
  const supplyInfo = document.querySelector('.supply-info');
  const supplyUsageQuantity = document.querySelector('#supplyUsageQuantity');

  if (supplyUsageForm && supplyInfo && supplyUsageQuantity) {
    supplyUsageForm.style.display = "block";
    supplyInfo.style.display = "block";
    supplyUsageQuantity.style.display = "block";

    // Resetear el valor de la cantidad
    supplyUsageQuantity.value = '';

    // Actualizar la información del insumo en el formulario
    document.getElementById("supplyName").textContent = supply.nombre;
    document.getElementById("availableQuantity").textContent = supply.cantidad;
    document.getElementById("unitValue").textContent = `$${supply.valor_unitario}`;
  }

  const selectedSuppliesDiv = document.getElementById("selectedSupplies");
  const supplyCard = document.createElement("div");
  supplyCard.className = "item-card";
  supplyCard.dataset.supplyId = supplyToAdd.id;
  supplyCard.innerHTML = `
      <button type="button" class="remove-item" onclick="removeSelectedItem(this, 'supply')">
          <i class="fas fa-times"></i>
      </button>
      <div class="item-info">
          <span class="item-name">${supplyToAdd.nombre}</span>
          <span class="item-details">Valor: $${supplyToAdd.valor_unitario}</span>
          <span class="item-details">Cantidad: Pendiente...</span>
      </div>
  `;

  selectedSuppliesDiv.appendChild(supplyCard)

  // Recalcular la inversión total (sin considerar la cantidad aún)
  calculateTotalInvestment()
}


// Función para mostrar notificaciones
function showToast(title, message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastDescription = document.getElementById('toastDescription');
  const toastIcon = document.getElementById('toastIcon');
  const toastProgress = document.querySelector('.toast-progress');

  // Establecer el contenido del toast
  toastTitle.textContent = title;
  toastDescription.textContent = message;
  
  // Establecer el icono según el tipo
  switch(type) {
      case 'success':
          toastIcon.className = 'fas fa-check-circle';
          break;
      case 'error':
          toastIcon.className = 'fas fa-exclamation-circle';
          break;
      case 'warning':
          toastIcon.className = 'fas fa-exclamation-triangle';
          break;
      case 'info':
          toastIcon.className = 'fas fa-info-circle';
          break;
  }

  // Mostrar el toast
  toast.classList.remove('hidden');
  
  // Animación de la barra de progreso
  let progress = 0;
  const progressInterval = setInterval(() => {
      progress += 2;
      toastProgress.style.width = `${progress}%`;
      if (progress >= 100) {
          clearInterval(progressInterval);
          // Ocultar el toast después de 5 segundos
          setTimeout(() => {
              toast.classList.add('hidden');
              toastProgress.style.width = '0%';
          }, 3400);
      }
  }, 30);
}

// Hacer la función removeSelectedItem global para que pueda ser llamada desde el HTML
window.removeSelectedItem = (button, type) => {
  if (type === "sensor") {
    const card = button.closest(".item-card")
    const sensorId = card.dataset.sensorId
    selectedSensors.delete(sensorId)
    card.remove()
    updateCreateButtonState()
  } else if (type === "supply") {
    const card = button.closest(".item-card")
    const supplyId = card.dataset.supplyId

    // Limpiar la referencia temporal
    if (tempSelectedSupply && tempSelectedSupply.id === supplyId) {
      tempSelectedSupply = null;
    }


    // Buscar el insumo en productionData.insumos_ids antes de eliminarlo
    let insumoRemovido = null;
    if (productionData && Array.isArray(productionData.insumos_ids)) {
      const idx = productionData.insumos_ids.findIndex(s => String(s.id) === String(supplyId));
      if (idx !== -1) {
        insumoRemovido = productionData.insumos_ids[idx];
        productionData.insumos_ids.splice(idx, 1);
      }
    }

    // Eliminar el insumo de selectedSupplies
    selectedSupplies = selectedSupplies.filter(s => String(s.id) !== String(supplyId));

    // Si el insumo era viejo (esNuevo: false), reponer stock en backend
    if (insumoRemovido && insumoRemovido.esNuevo === false && insumoRemovido.cantidad_usar > 0) {
      fetch(`${API_URL}/insumos/reponer-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: insumoRemovido.id, cantidad: insumoRemovido.cantidad_usar })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast("Stock repuesto", "El stock del insumo fue repuesto correctamente", "success");
        } else {
          showToast("Atención", "No se pudo reponer el stock automáticamente", "error");
        }
      })
      .catch(() => showToast("Atención", "No se pudo reponer el stock automáticamente", "error"));
    }

    // Si tienes una estructura para registrar el uso/cantidad, elimínala aquí
    if (typeof supplyUsageData === 'object' && supplyUsageData !== null) {
      delete supplyUsageData[supplyId];
    }

    // Recalcular la inversión inmediatamente
    calculateTotalInvestment();
    // Si tienes función para meta, recalcular meta de ganancia
    if (typeof updateMetaGanancia === 'function') {
      updateMetaGanancia();
    }

    // Actualizar la UI
    card.remove();
    updateCreateButtonState();

    // Ocultar el formulario de uso de insumo
    const supplyUsageForm = document.getElementById("supplyUsageForm");
    const supplyInfo = document.querySelector('.supply-info');
    const supplyUsageQuantity = document.querySelector('#supplyUsageQuantity');

    if (supplyUsageForm && supplyInfo && supplyUsageQuantity) {
      supplyUsageForm.style.display = "none";
      supplyInfo.style.display = "none";
      supplyUsageQuantity.style.display = "none";
      supplyUsageQuantity.value = "";
    }

    // Mostrar mensaje de éxito
    showToast("Éxito", "Insumo removido correctamente", "success");
  }
}

// Agregar un botón para sugerir automáticamente la meta de ganancia
function setupProfitSuggestionButton() {
  const suggestProfitBtn = document.getElementById("suggestProfitBtn")
  if (suggestProfitBtn) {
    suggestProfitBtn.addEventListener("click", (e) => {
      e.preventDefault()
      const totalInvestment = document.getElementById("totalInvestment")
      const estimatedProfit = document.getElementById("estimatedProfit")

      if (totalInvestment && estimatedProfit) {
        const investment = Number.parseFloat(totalInvestment.value) || 0
        if (investment > 0) {
          // Sugerir un 30% más que la inversión
          const suggestedProfit = investment * 1.3
          estimatedProfit.value = suggestedProfit.toFixed(2)
          validateInvestmentAndProfit()
        } else {
          showToast("Error", "Primero debe ingresar un valor válido para la inversión", "error")
        }
      }
    })
  }
}

// // Función para ocultar el formulario de uso de insumo
function hideSupplyUsageForm() {
  const supplyInfo = document.querySelector('.supply-info');
  const supplyUsageQuantity = document.querySelector('#supplyUsageQuantity');
  const supplyUsageForm = document.getElementById('supplyUsageForm');

  supplyInfo.style.display = 'none';
  supplyUsageQuantity.style.display = 'none';
  supplyUsageForm.style.display = 'none';
}

// Event listener para el botón Ocultar Formulario
document.getElementById('hideSupplyUsageForm').addEventListener('click', (e) => {
  hideSupplyUsageForm();
});

// Event listener para el botón Registrar Uso
const addSupplyUsageBtn = document.getElementById('addSupplyUsage');
if (addSupplyUsageBtn) {
  addSupplyUsageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Botón Registrar Uso clickeado');
    console.log('tempSelectedSupply:', tempSelectedSupply);
    console.log('Valor ingresado:', document.getElementById('supplyUsageQuantity').value);
    registerSupplyUsage();
    // Ocultar el formulario automáticamente después de registrar el uso
    hideSupplyUsageForm();
  });
}

// Event listeners para el modal
createUserBtn.addEventListener("click", () => {
  createUserModal.classList.remove("hidden")
})

closeCreateUserModal.addEventListener("click", () => {
  createUserModal.classList.add("hidden")
})

// Event listeners para el formulario del modal
document.getElementById("modal-tipo-documento").addEventListener("change", (e) => {
  modalUserData.userTypeId = e.target.value
})

// Bloquear números en el campo de nombre
document.getElementById("modal-nombre").addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    e.preventDefault()
    console.log("Número bloqueado")
  }
})

document.getElementById("modal-nombre").addEventListener("input", (e) => {
  modalUserData.userName = e.target.value
})

// Solo permitir números en el campo de documento
document.getElementById("modal-numero-documento").addEventListener("keydown", (e) => {
  if (
    e.key === "Backspace" ||
    e.key === "Tab" ||
    e.key === "Enter" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight"
  ) {
    return //No bloquear estas teclas
  }

  //Bloquear cualquier tecla que NO sea un número
  if (e.key < "0" || e.key > "9") {
    e.preventDefault()
    console.log("Solo se permite números")
  }
})

document.getElementById("modal-numero-documento").addEventListener("input", (e) => {
  modalUserData.userId = e.target.value
})

// Solo permitir números en el campo de teléfono
document.getElementById("modal-telefono").addEventListener("keydown", (e) => {
  if (
    e.key === "Backspace" ||
    e.key === "Tab" ||
    e.key === "Enter" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight"
  ) {
    return //No bloquear estas teclas
  }

  //Bloquear cualquier tecla que NO sea un número
  if (e.key < "0" || e.key > "9") {
    e.preventDefault()
    console.log("Solo se permite números")
  }
})

document.getElementById("modal-telefono").addEventListener("input", (e) => {
  modalUserData.userTel = e.target.value
})

document.getElementById("modal-correo").addEventListener("input", (e) => {
  modalUserData.userEmail = e.target.value
})

document.getElementById("modal-confirmar-correo").addEventListener("input", (e) => {
  modalUserData.userConfirmEmail = e.target.value
})

document.getElementById("modal-rol").addEventListener("change", (e) => {
  modalUserData.userRol = e.target.value
})

document.querySelectorAll('input[name="modal-estado-habilitado"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    modalUserData.estado = e.target.value
  })
})

// Función para validar los datos del usuario en el modal
function validateModalUserData() {
  const requiredFields = [
    { field: "userTypeId", label: "Tipo de documento" },
    { field: "userName", label: "Nombre" },
    { field: "userId", label: "Número de documento" },
    { field: "userTel", label: "Teléfono" },
    { field: "userEmail", label: "Correo electrónico" },
    { field: "userConfirmEmail", label: "Confirmación de correo" },
    { field: "userRol", label: "Rol" },
    { field: "estado", label: "Estado" },
  ]

  for (const field of requiredFields) {
    if (!modalUserData[field.field]) {
      showToast(`Por favor, complete el campo ${field.label}`, "", "error")
      return false
    }
  }

  // Validar que los correos coincidan
  if (modalUserData.userEmail !== modalUserData.userConfirmEmail) {
    showToast("Error", "Los correos electrónicos no coinciden", "error")
    return false
  }

  // Validar que el tipo de documento sea válido según la base de datos
  const validDocumentTypes = ["ti", "cc", "ce", "ppt", "pep"]
  if (!validDocumentTypes.includes(modalUserData.userTypeId)) {
    showToast("Error", "Tipo de documento no válido", "error")
    return false
  }

  // Validar que el rol sea válido según la base de datos
  const validRoles = ["superadmin", "admin", "apoyo", "visitante"]
  if (!validRoles.includes(modalUserData.userRol)) {
    showToast("Error", "Rol no válido", "error")
    return false
  }

  if (modalUserData.estado === "deshabilitado") {
    showToast("Error", "Cambia el estado para crear el usuario", "error")
    return false
  }

  return true
}

// Función para guardar los valores seleccionados actuales
function saveSelectedValues() {
  return {
    crop: document.getElementById("crop").value,
    cropCycle: document.getElementById("cropCycle").value,
    responsible: document.getElementById("responsible").value,
    sensor: document.getElementById("sensor").value,
    supply: document.getElementById("supply").value,
  }
}

// Función para restaurar los valores seleccionados
function restoreSelectedValues(savedValues) {
  if (savedValues) {
    document.getElementById("crop").value = savedValues.crop
    document.getElementById("cropCycle").value = savedValues.cropCycle
    document.getElementById("responsible").value = savedValues.responsible
    document.getElementById("sensor").value = savedValues.sensor
    document.getElementById("supply").value = savedValues.supply
  }
}

// Manejar el envío del formulario del modal
createUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Guardar valores actuales
  const savedValues = saveSelectedValues();

  if (!validateModalUserData()) {
    return;
  }

  try {
    // Preparar los datos en el formato que espera el backend
    const userData = {
      userTypeId: modalUserData.userTypeId,
      userId: modalUserData.userId,
      userName: modalUserData.userName,
      userTel: modalUserData.userTel,
      userEmail: modalUserData.userEmail,
      userRol: modalUserData.userRol,
      estado: modalUserData.estado
    };

    const response = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear el usuario");
    }

    const data = await response.json();
    showToast("Éxito", "Usuario creado correctamente", "success");

    // Actualizar el select de responsables
    await initializeForm();

    // Cerrar el modal
    createUserModal.classList.add("hidden");

    // Limpiar el formulario
    createUserForm.reset();
    modalUserData.estado = "habilitado";

    // Después de crear el usuario exitosamente, restaurar los valores
    restoreSelectedValues(savedValues);
  } catch (error) {
    console.error("Error:", error);
    showToast("Error", error.message || "No se pudo crear el usuario", "error");
  }
})

// Event listeners para el modal de sensor
createSensorBtn.addEventListener("click", () => {
  createSensorModal.classList.remove("hidden")
})

closeCreateSensorModal.addEventListener("click", () => {
  createSensorModal.classList.add("hidden")
})

// Event listeners para el formulario del modal de sensor
document.getElementById("modal-tipo-sensor").addEventListener("change", (e) => {
  modalSensorData.sensorType = e.target.value
})

// Bloquear números en el campo de nombre del sensor
document.getElementById("modal-nombre-sensor").addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    e.preventDefault()
    console.log("Número bloqueado")
  }
})

document.getElementById("modal-nombre-sensor").addEventListener("input", (e) => {
  modalSensorData.sensorName = e.target.value
})

document.getElementById("modal-unidad-medida").addEventListener("change", (e) => {
  modalSensorData.sensorUnit = e.target.value
})

document.getElementById("modal-descripcion").addEventListener("input", (e) => {
  modalSensorData.sensorDescription = e.target.value
})

document.getElementById("modal-tiempo-escaneo").addEventListener("change", (e) => {
  modalSensorData.sensorScan = e.target.value
})

document.querySelectorAll('input[name="modal-estado-sensor"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    modalSensorData.estado = e.target.value
  })
})

// Función para validar los datos del sensor en el modal
function validateModalSensorData() {
  const requiredFields = [
    { field: "sensorType", label: "Tipo de sensor" },
    { field: "sensorName", label: "Nombre del sensor" },
    { field: "sensorUnit", label: "Unidad de medida" },
    { field: "sensorDescription", label: "Descripción" },
    { field: "sensorScan", label: "Tiempo de escaneo" },
    { field: "estado", label: "Estado" },
  ]

  for (const field of requiredFields) {
    if (!modalSensorData[field.field]) {
      showToast(`Por favor, complete el campo ${field.label}`, "", "error")
      return false
    }
  }

  // Validar que el tipo de sensor sea válido según la base de datos
  const validSensorTypes = ["Sensor de contacto", "Sensor de distancia", "Sensores de luz"]
  if (!validSensorTypes.includes(modalSensorData.sensorType)) {
    showToast("Error", "Tipo de sensor no válido", "error")
    return false
  }

  // Validar que la unidad de medida sea válida según la base de datos
  const validUnits = ["Temperatura", "Distancia", "Presión"]
  if (!validUnits.includes(modalSensorData.sensorUnit)) {
    showToast("Error", "Unidad de medida no válida", "error")
    return false
  }

  // Validar que el tiempo de escaneo sea válido según la base de datos
  const validScanTimes = ["Sensores lentos", "Sensores de velocidad media", "Sensores rápidos"]
  if (!validScanTimes.includes(modalSensorData.sensorScan)) {
    showToast("Error", "Tiempo de escaneo no válido", "error")
    return false
  }

  if (modalSensorData.estado === "deshabilitado") {
    showToast("Error", "Cambia el estado para crear el sensor", "error")
    return false
  }

  return true
}

// Manejar el envío del formulario del modal de sensor
createSensorForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Guardar valores actuales
  const savedValues = saveSelectedValues();

  if (!validateModalSensorData()) {
    return;
  }

  try {
    // Preparar los datos en el formato que espera el backend
    const sensorData = {
      sensorType: modalSensorData.sensorType,
      sensorName: modalSensorData.sensorName,
      sensorUnit: modalSensorData.sensorUnit,
      sensorImage: "sensor-default.jpg", // Usar imagen por defecto
      sensorDescription: modalSensorData.sensorDescription,
      sensorScan: modalSensorData.sensorScan,
      estado: modalSensorData.estado
    };

    const response = await fetch("http://localhost:5000/sensor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sensorData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear el sensor");
    }

    const data = await response.json();
    showToast("Éxito", "Sensor creado correctamente", "success");

    // Actualizar el select de sensores
    await initializeForm();

    // Cerrar el modal
    createSensorModal.classList.add("hidden");

    // Limpiar el formulario
    createSensorForm.reset();
    modalSensorData.estado = "habilitado";

    // Después de crear el sensor exitosamente, restaurar los valores
    restoreSelectedValues(savedValues);
  } catch (error) {
    console.error("Error:", error);
    showToast("Error", error.message || "No se pudo crear el sensor", "error");
  }
})

// Event listeners para el modal de insumo
createSupplyBtn.addEventListener("click", () => {
  createSupplyModal.classList.remove("hidden")
})

closeCreateSupplyModal.addEventListener("click", () => {
  createSupplyModal.classList.add("hidden")
})

// Bloquear números en el campo de nombre
document.getElementById("modal-nombre-insumo").addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    e.preventDefault()
    console.log("Número bloqueado")
  }
})

// Solo permitir números en el campo de valor unitario
document.getElementById("modal-valor-unitario").addEventListener("keydown", (e) => {
  if (
    e.key === "Backspace" ||
    e.key === "Tab" ||
    e.key === "Enter" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "."
  ) {
    return
  }
  if (e.key < "0" || e.key > "9") {
    e.preventDefault()
    console.log("Solo se permite números")
  }
})

// Solo permitir números en el campo de cantidad
document.getElementById("modal-cantidad").addEventListener("keydown", (e) => {
  if (
    e.key === "Backspace" ||
    e.key === "Tab" ||
    e.key === "Enter" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight"
  ) {
    return
  }
  if (e.key < "0" || e.key > "9") {
    e.preventDefault()
    console.log("Solo se permite números")
  }
})

// Event listeners para el formulario del modal de insumo
document.getElementById("modal-nombre-insumo").addEventListener("input", (e) => {
  modalSupplyData.insumeName = e.target.value
  console.log("Nombre actualizado:", modalSupplyData.insumeName)
})

document.getElementById("modal-tipo-insumo").addEventListener("input", (e) => {
  modalSupplyData.insumeType = e.target.value
  console.log("Tipo actualizado:", modalSupplyData.insumeType)
})

document.getElementById("modal-medida-insumo").addEventListener("change", (e) => {
  modalSupplyData.insumeExtent = e.target.value
  console.log("Unidad de medida actualizada:", modalSupplyData.insumeExtent)
})

document.getElementById("modal-valor-unitario").addEventListener("input", (e) => {
  modalSupplyData.insumePrice = e.target.value
  console.log("Valor unitario actualizado:", modalSupplyData.insumePrice)
  calculateTotal()
})

document.getElementById("modal-cantidad").addEventListener("input", (e) => {
  modalSupplyData.insumeAmount = e.target.value
  console.log("Cantidad actualizada:", modalSupplyData.insumeAmount)
  calculateTotal()
})

document.getElementById("modal-descripcion-insumo").addEventListener("input", (e) => {
  modalSupplyData.insumeDescription = e.target.value
  console.log("Descripción actualizada:", modalSupplyData.insumeDescription)
})

document.querySelectorAll('input[name="modal-estado-insumo"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    modalSupplyData.estado = e.target.value
    console.log("Estado actualizado:", modalSupplyData.estado)
  })
})

// Función para calcular el valor total
function calculateTotal() {
  const price = Number.parseFloat(modalSupplyData.insumePrice) || 0
  const amount = Number.parseInt(modalSupplyData.insumeAmount) || 0
  const total = price * amount
  modalSupplyData.totalValue = total.toString()
  document.getElementById("modal-valor-total").value = total
}

// Función para validar los datos del insumo en el modal
function validateModalSupplyData() {
  console.log("Validando datos:", modalSupplyData)

  const requiredFields = [
    { field: "insumeName", label: "Nombre" },
    { field: "insumeType", label: "Tipo de insumo" },
    { field: "insumeExtent", label: "Unidad de medida" },
    { field: "insumeDescription", label: "Descripción" },
    { field: "insumePrice", label: "Valor unitario" },
    { field: "insumeAmount", label: "Cantidad" },
    { field: "totalValue", label: "Valor total" },
    { field: "estado", label: "Estado" },
  ]

  for (const field of requiredFields) {
    if (!modalSupplyData[field.field]) {
      console.log(`Campo vacío: ${field.field}`)
      showToast(`Por favor, complete el campo ${field.label}`, "", "error")
      return false
    }
  }

  // Validar que la unidad de medida sea válida según la base de datos
  const validUnits = ["peso", "volumen", "superficie", "concentración", "litro", "kilo"]
  if (!validUnits.includes(modalSupplyData.insumeExtent)) {
    showToast("Error", "Unidad de medida no válida", "error")
    return false
  }

  // Validar que los valores numéricos sean válidos
  if (isNaN(Number.parseFloat(modalSupplyData.insumePrice)) || Number.parseFloat(modalSupplyData.insumePrice) <= 0) {
    showToast("Error", "El valor unitario debe ser un número mayor a 0", "error")
    return false
  }

  if (isNaN(Number.parseInt(modalSupplyData.insumeAmount)) || Number.parseInt(modalSupplyData.insumeAmount) <= 0) {
    showToast("Error", "La cantidad debe ser un número mayor a 0", "error")
    return false
  }

  if (modalSupplyData.estado === "deshabilitado") {
    showToast("Error", "Cambia el estado para crear el insumo", "error")
    return false
  }

  return true
}

// Manejar el envío del formulario del modal de insumo
createSupplyForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Guardar valores actuales
  const savedValues = saveSelectedValues();

  // Asegurarse de que todos los campos estén actualizados antes de validar
  modalSupplyData.insumeName = document.getElementById("modal-nombre-insumo").value;
  modalSupplyData.insumeType = document.getElementById("modal-tipo-insumo").value;
  modalSupplyData.insumeExtent = document.getElementById("modal-medida-insumo").value;
  modalSupplyData.insumePrice = document.getElementById("modal-valor-unitario").value;
  modalSupplyData.insumeAmount = document.getElementById("modal-cantidad").value;
  modalSupplyData.insumeDescription = document.getElementById("modal-descripcion-insumo").value;

  const estadoRadio = document.querySelector('input[name="modal-estado-insumo"]:checked');
  if (estadoRadio) {
    modalSupplyData.estado = estadoRadio.value;
  }

  if (!validateModalSupplyData()) {
    return;
  }

  try {
    // Preparar los datos en el formato que espera el backend
    const insumoData = {
      insumeName: modalSupplyData.insumeName,
      insumeType: modalSupplyData.insumeType,
      insumeImage: "insumo-default.jpg", // Usar imagen por defecto
      insumeExtent: modalSupplyData.insumeExtent,
      insumePrice: parseFloat(modalSupplyData.insumePrice),
      insumeAmount: parseInt(modalSupplyData.insumeAmount),
      totalValue: parseFloat(modalSupplyData.totalValue),
      insumeDescription: modalSupplyData.insumeDescription,
      insumeId: parseInt(document.getElementById("responsible").value) || 1, // Usar el ID del responsable seleccionado
      estado: modalSupplyData.estado
    };

    const response = await fetch("http://localhost:5000/insumos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(insumoData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear el insumo");
    }

    const data = await response.json();
    showToast("Éxito", "Insumo creado correctamente", "success");

    // Actualizar el select de insumos
    await initializeForm();

    // Cerrar el modal
    createSupplyModal.classList.add("hidden");

    // Limpiar el formulario
    createSupplyForm.reset();
    modalSupplyData.estado = "habilitado";

    // Después de crear el insumo exitosamente, restaurar los valores
    restoreSelectedValues(savedValues);
  } catch (error) {
    console.error("Error:", error);
    showToast("Error", error.message || "No se pudo crear el insumo", "error");
  }
})

// Event listeners para el modal de cultivo
createCropBtn.addEventListener("click", () => {
  createCropModal.classList.remove("hidden")
})

closeCreateCropModal.addEventListener("click", () => {
  createCropModal.classList.add("hidden")
})

// Bloquear números en el campo de nombre
document.getElementById("modal-nombre-cultivo").addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    e.preventDefault()
    console.log("Número bloqueado")
  }
})

// Event listeners para el formulario del modal de cultivo
document.getElementById("modal-nombre-cultivo").addEventListener("input", (e) => {
  modalCropData.cultiveName = e.target.value
})

document.getElementById("modal-tipo-cultivo").addEventListener("input", (e) => {
  modalCropData.cultiveType = e.target.value
})

document.getElementById("modal-ubicacion-cultivo").addEventListener("input", (e) => {
  modalCropData.cultiveLocation = e.target.value
})

document.getElementById("modal-tamano-cultivo").addEventListener("input", (e) => {
  modalCropData.cultiveSize = e.target.value
})

document.getElementById("modal-descripcion-cultivo").addEventListener("input", (e) => {
  modalCropData.cultiveDescription = e.target.value
})

document.querySelectorAll('input[name="modal-estado-cultivo"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    modalCropData.estado = e.target.value
  })
})

// Función para validar los datos del cultivo en el modal
function validateModalCropData() {
  const requiredFields = [
    { field: "cultiveName", label: "Nombre" },
    { field: "cultiveType", label: "Tipo de cultivo" },
    { field: "cultiveLocation", label: "Ubicación" },
    { field: "cultiveDescription", label: "Descripción" },
    { field: "cultiveSize", label: "Tamaño" },
    { field: "estado", label: "Estado" },
  ]

  for (const field of requiredFields) {
    if (!modalCropData[field.field]) {
      showToast(`Por favor, complete el campo ${field.label}`, "", "error")
      return false
    }
  }

  // Validar que el tamaño sea un número válido
  if (isNaN(Number.parseFloat(modalCropData.cultiveSize)) || Number.parseFloat(modalCropData.cultiveSize) <= 0) {
    showToast("Error", "El tamaño debe ser un número mayor a 0", "error")
    return false
  }

  if (modalCropData.estado === "deshabilitado") {
    showToast("Error", "Cambia el estado para crear el cultivo", "error")
    return false
  }

  return true
}

// Manejar el envío del formulario del modal de cultivo
createCropForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Guardar valores actuales
  const savedValues = saveSelectedValues();

  if (!validateModalCropData()) {
    return;
  }

  try {
    // Preparar los datos en el formato que espera el backend
    const cultivoData = {
      cultiveName: modalCropData.cultiveName,
      cultiveType: modalCropData.cultiveType,
      cultiveImage: "cultivo-default.jpg", // Usar imagen por defecto
      cultiveLocation: modalCropData.cultiveLocation,
      cultiveDescription: modalCropData.cultiveDescription,
      cultiveSize: modalCropData.cultiveSize,
      usuario_id: parseInt(document.getElementById("responsible").value) || 1, // Usar el ID del responsable seleccionado
      estado: modalCropData.estado
    };

    const response = await fetch("http://localhost:5000/cultivos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cultivoData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear el cultivo");
    }

    const data = await response.json();
    showToast("Éxito", "Cultivo creado correctamente", "success");

    // Actualizar el select de cultivos
    await initializeForm();

    // Cerrar el modal
    createCropModal.classList.add("hidden");

    // Limpiar el formulario
    createCropForm.reset();
    modalCropData.estado = "habilitado";

    // Después de crear el cultivo exitosamente, restaurar los valores
    restoreSelectedValues(savedValues);
  } catch (error) {
    console.error("Error:", error);
    showToast("Error", error.message || "No se pudo crear el cultivo", "error");
  }
})

// Event listeners para el modal de ciclo de cultivo
createCropCycleBtn.addEventListener("click", () => {
  createCropCycleModal.classList.remove("hidden")
})

closeCreateCropCycleModal.addEventListener("click", () => {
  createCropCycleModal.classList.add("hidden")
})

// Bloquear números en el campo de nombre
document.getElementById("modal-nombre-ciclo").addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    e.preventDefault()
    console.log("Número bloqueado")
  }
})

// Event listeners para el formulario del modal de ciclo de cultivo
document.getElementById("modal-nombre-ciclo").addEventListener("input", (e) => {
  modalCropCycleData.cycleName = e.target.value
})

document.getElementById("modal-descripcion-ciclo").addEventListener("input", (e) => {
  modalCropCycleData.cycleDescription = e.target.value
})

document.getElementById("modal-periodo-inicio").addEventListener("input", (e) => {
  modalCropCycleData.cycleStartDate = e.target.value
})

document.getElementById("modal-periodo-final").addEventListener("input", (e) => {
  modalCropCycleData.cycleEndDate = e.target.value
})

document.getElementById("modal-novedades-ciclo").addEventListener("input", (e) => {
  modalCropCycleData.cycleUpdates = e.target.value
})

document.querySelectorAll('input[name="modal-estado-ciclo"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    modalCropCycleData.estado = e.target.value
  })
})

// Función para validar los datos del ciclo de cultivo en el modal
function validateModalCropCycleData() {
  const requiredFields = [
    { field: "cycleName", label: "Nombre" },
    { field: "cycleDescription", label: "Descripción" },
    { field: "cycleStartDate", label: "Periodo de inicio" },
    { field: "cycleEndDate", label: "Periodo final" },
    { field: "cycleUpdates", label: "Novedades" },
    { field: "estado", label: "Estado" },
  ]

  for (const field of requiredFields) {
    if (!modalCropCycleData[field.field]) {
      showToast(`Por favor, complete el campo ${field.label}`, "", "error")
      return false
    }
  }

  // Validar que la fecha de inicio sea anterior a la fecha final
  const startDate = new Date(modalCropCycleData.cycleStartDate)
  const endDate = new Date(modalCropCycleData.cycleEndDate)
  if (startDate >= endDate) {
    showToast("Error", "La fecha de inicio debe ser anterior a la fecha final", "error")
    return false
  }

  if (modalCropCycleData.estado === "deshabilitado") {
    showToast("Error", "Cambia el estado para crear el ciclo de cultivo", "error")
    return false
  }

  return true
}

// Manejar el envío del formulario del modal de ciclo de cultivo
createCropCycleForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Guardar valores actuales
  const savedValues = saveSelectedValues();

  if (!validateModalCropCycleData()) {
    return;
  }

  try {
    // Preparar los datos en el formato que espera el backend
    const cicloData = {
      cycleName: modalCropCycleData.cycleName,
      cycleDescription: modalCropCycleData.cycleDescription,
      cycleStartDate: modalCropCycleData.cycleStartDate,
      cycleEndDate: modalCropCycleData.cycleEndDate,
      cycleUpdates: modalCropCycleData.cycleUpdates,
      usuario_id: parseInt(document.getElementById("responsible").value) || 1, // Usar el ID del responsable seleccionado
      estado: modalCropCycleData.estado
    };

    const response = await fetch("http://localhost:5000/ciclo_cultivo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cicloData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear el ciclo de cultivo");
    }

    const data = await response.json();
    showToast("Éxito", "Ciclo de cultivo creado correctamente", "success");

    // Actualizar el select de ciclos de cultivo
    await initializeForm();

    // Cerrar el modal
    createCropCycleModal.classList.add("hidden");

    // Limpiar el formulario
    createCropCycleForm.reset();
    modalCropCycleData.estado = "habilitado";

    // Después de crear el ciclo exitosamente, restaurar los valores
    restoreSelectedValues(savedValues);
  } catch (error) {
    console.error("Error:", error);
    showToast("Error", error.message || "No se pudo crear el ciclo de cultivo", "error");
  }
})



function updateCreateButtonState() {
  const isValid = validateForm()
  const createBtn = document.getElementById("createBtn")
  if (createBtn) {
    createBtn.disabled = !isValid
  }
}

function validarNombreProduccion(nombre) {
  if (!nombre) {
    return { valido: false, mensaje: "El nombre de la producción es requerido." }
  }
  if (nombre.length < 3) {
    return { valido: false, mensaje: "El nombre de la producción debe tener al menos 3 caracteres." }
  }
  return { valido: true, mensaje: "" }
}

// Asegurarse de que los modales se abran correctamente
document.addEventListener("DOMContentLoaded", () => {
  // Ocultar la sección de registro de uso de insumo
  const supplyUsageForm = document.getElementById("supplyUsageForm")
  if (supplyUsageForm) {
    supplyUsageForm.classList.add("hidden")
  }

  // El manejador de envío del formulario principal ya está definido al inicio del archivo
  // No es necesario agregar otro manejador aquí
  const productionForm = document.getElementById("productionForm")
  if (productionForm) {
    // No hacer nada aquí, ya que el manejador principal manejará la validación y el envío
  }

  // Verificar que los botones de los modales estén correctamente configurados
  const modalButtons = {
    createUserBtn: createUserModal,
    createSensorBtn: createSensorModal,
    createSupplyBtn: createSupplyModal,
    createCropBtn: createCropModal,
    createCropCycleBtn: createCropCycleModal,
  }

  for (const [buttonId, modal] of Object.entries(modalButtons)) {
    const button = document.getElementById(buttonId)
    if (button && modal) {
      // Asegurarse de que el evento click esté correctamente configurado
      button.addEventListener("click", () => {
        modal.classList.remove("hidden")
      })
    }
  }
})