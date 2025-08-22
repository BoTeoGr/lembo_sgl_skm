// Objeto para almacenar los datos del formulario
const cicloCultivo = {
    nombre: "",
    descripcion: "",
    periodoInicio: "",
    periodoFinal: "",
    novedades: "",
    estado: "habilitado",
};

// Obtener referencias a los elementos del DOM
const form = document.querySelector(".form__container");
const nombre = document.querySelector(".form__input--cycle-name");
const descripcion = document.querySelector(".form__textarea--cycle-description");
const periodoInicio = document.querySelector(".form__input--cycle-start-date");
const periodoFinal = document.querySelector(".form__input--cycle-end-date");
const novedades = document.querySelector(".form__textarea--cycle-updates");
const estadoRadios = document.querySelectorAll("[name='estado-habilitado']");
const submitButton = document.querySelector("button[type='submit']");

// Cargar los datos del ciclo de cultivo al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const cicloId = params.get('id');

    if (!cicloId) {
        showToast('Error', 'No se proporcionó un ID de ciclo de cultivo', 'error');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/ciclo_cultivo/${cicloId}`);
        if (!response.ok) throw new Error('No se pudo cargar el ciclo de cultivo');
        
        const data = await response.json();
        
        // Llenar el formulario con los datos del ciclo
        if (nombre) nombre.value = data.nombre || '';
        if (descripcion) descripcion.value = data.descripcion || '';
        if (periodoInicio) periodoInicio.value = data.periodoInicio?.split('T')[0] || '';
        if (periodoFinal) periodoFinal.value = data.periodoFinal?.split('T')[0] || '';
        if (novedades) novedades.value = data.novedades || '';
        
        // Establecer el estado del radio button
        if (data.estado && estadoRadios.length > 0) {
            const estado = data.estado === 'habilitado' ? 'habilitado' : 'deshabilitado';
            document.querySelector(`input[name="estado-habilitado"][value="${estado}"]`).checked = true;
            cicloCultivo.estado = estado;
        }
        
        // Actualizar el objeto cicloCultivo con los datos cargados
        cicloCultivo.nombre = data.nombre || '';
        cicloCultivo.descripcion = data.descripcion || '';
        cicloCultivo.periodoInicio = data.periodoInicio?.split('T')[0] || '';
        cicloCultivo.periodoFinal = data.periodoFinal?.split('T')[0] || '';
        cicloCultivo.novedades = data.novedades || '';
        cicloCultivo.estado = data.estado || 'habilitado';
        
    } catch (error) {
        console.error('Error cargando el ciclo de cultivo:', error);
        showToast('Error', 'Error al cargar el ciclo de cultivo', 'error');
    }
});

// Actualizar el objeto cuando los campos cambian
if (nombre) {
    nombre.addEventListener("input", () => {
        cicloCultivo.nombre = nombre.value;
    });
}

if (descripcion) {
    descripcion.addEventListener("input", () => {
        cicloCultivo.descripcion = descripcion.value;
    });
}

if (periodoInicio) {
    periodoInicio.addEventListener("input", () => {
        cicloCultivo.periodoInicio = periodoInicio.value;
    });
}

if (periodoFinal) {
    periodoFinal.addEventListener("input", () => {
        cicloCultivo.periodoFinal = periodoFinal.value;
    });
}

if (novedades) {
    novedades.addEventListener("input", () => {
        cicloCultivo.novedades = novedades.value;
    });
}

// Evento para capturar el estado seleccionado
if (estadoRadios) {
    estadoRadios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
            cicloCultivo.estado = e.target.value;
        });
    });
}

// Evento para validar y guardar los datos al enviar el formulario
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Actualizar el objeto con los valores actuales del formulario
        if (nombre) cicloCultivo.nombre = nombre.value.trim();
        if (descripcion) cicloCultivo.descripcion = descripcion.value.trim();
        if (periodoInicio) cicloCultivo.periodoInicio = periodoInicio.value;
        if (periodoFinal) cicloCultivo.periodoFinal = periodoFinal.value;
        if (novedades) cicloCultivo.novedades = novedades.value.trim();

        // Validaciones
        if (!cicloCultivo.nombre)
            return showToast('Error', 'El nombre del ciclo de cultivo es obligatorio', 'error');
        if (!cicloCultivo.descripcion)
            return showToast('Error', 'La descripción no puede estar vacía', 'error');
        if (!cicloCultivo.periodoInicio || !cicloCultivo.periodoFinal)
            return showToast('Error', 'Las fechas de inicio y final son obligatorias', 'error');
        if (new Date(cicloCultivo.periodoInicio) > new Date(cicloCultivo.periodoFinal))
            return showToast('Error', 'La fecha de inicio no puede ser mayor que la fecha final', 'error');
        if (!cicloCultivo.novedades)
            return showToast('Error', 'Debe ingresar novedades del ciclo de cultivo', 'error');

        // Obtener el ID de la URL
        const params = new URLSearchParams(window.location.search);
        const cicloId = params.get('id');

        if (!cicloId) {
            return showToast('Error', 'No se pudo obtener el ID del ciclo de cultivo', 'error');
        }

        // Enviar datos actualizados al backend
        try {
            const res = await fetch(`http://localhost:5000/ciclo_cultivo/${cicloId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: cicloCultivo.nombre,
                    descripcion: cicloCultivo.descripcion,
                    periodoInicio: cicloCultivo.periodoInicio,
                    periodoFinal: cicloCultivo.periodoFinal,
                    novedades: cicloCultivo.novedades,
                    estado: cicloCultivo.estado
                })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'No se pudo actualizar el ciclo de cultivo');
            }
            
            showToast('Éxito', 'Ciclo de cultivo actualizado correctamente', 'success');
            setTimeout(() => {
                window.location.href = "listar-ciclos-cultivos.html";
            }, 1000);
        } catch (err) {
            console.error('Error al actualizar el ciclo de cultivo:', err);
            showToast('Error', "Error al actualizar el ciclo de cultivo: " + (err.message || 'Error desconocido'), 'error');
        }
    });
}

// Función para mostrar toasts
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
        case 'error':
            toastIcon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            toastIcon.className = 'fas fa-exclamation-triangle';
            break;
        case 'info':
            toastIcon.className = 'fas fa-info-circle';
            break;
        case 'success':
        default:
            toastIcon.className = 'fas fa-check-circle';
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
            // Ocultar el toast después de 3.4 segundos
            setTimeout(() => {
                toast.classList.add('hidden');
                toastProgress.style.width = '0%';
            }, 3400);
        }
    }, 30);
}
