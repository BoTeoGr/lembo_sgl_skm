// Función general para mostrar toasts
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

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const cropId = params.get("id");

    if (!cropId) {
        showToast("Error", "ID del cultivo no encontrado en la URL", 'error');
        setTimeout(() => {
            window.location.href = "listar-cultivos.html";
        }, 2000);
        return;
    }

    const form = document.querySelector(".form__container");
    const nombreInput = form.querySelector(".form__input--cultive-name");
    const tipoInput = form.querySelector(".form__input--cultive-type");
    const imagenInput = form.querySelector(".form__file--cultive-image"); // cadena, no file
    const ubicacionInput = form.querySelector(".form__input--cultive-location");
    const tamanoInput = form.querySelector(".form__input--cultive-size");
    const descripcionInput = form.querySelector(".form__textarea--cultive-description");
    const estadoRadios = form.querySelectorAll("[name='estado-habilitado']");
    const submitButton = form.querySelector("button[type='submit']");

    let cultivoActual = null;

    try {
        const response = await fetch(`http://localhost:5000/cultivos/${cropId}`);
        if (!response.ok) throw new Error("No se pudo obtener el cultivo");

        cultivoActual = await response.json();

        nombreInput.value = cultivoActual.nombre;
        tipoInput.value = cultivoActual.tipo;
        ubicacionInput.value = cultivoActual.ubicacion;
        tamanoInput.value = cultivoActual.tamano;
        descripcionInput.value = cultivoActual.descripcion;

        for (const radio of estadoRadios) {
            radio.checked = radio.value === cultivoActual.estado;
        }
    } catch (error) {
        console.error("Error cargando datos del cultivo:", error);
        showToast("Error", "No se pudo cargar la información del cultivo.", 'error');
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!cultivoActual) {
            showToast("Error", "No se puede actualizar sin datos del cultivo cargados.", 'error');
            return;
        }

        const datosActualizados = {};

        if (nombreInput.value.trim() !== "" && nombreInput.value.trim() !== cultivoActual.nombre) {
            datosActualizados.nombre = nombreInput.value.trim();
        }

        if (tipoInput.value.trim() !== "" && tipoInput.value.trim() !== cultivoActual.tipo) {
            datosActualizados.tipo = tipoInput.value.trim();
        }

        if (ubicacionInput.value.trim() !== "" && ubicacionInput.value.trim() !== cultivoActual.ubicacion) {
            datosActualizados.ubicacion = ubicacionInput.value.trim();
        }

        if (tamanoInput.value.trim() !== "" && tamanoInput.value.trim() !== cultivoActual.tamano) {
            datosActualizados.tamano = tamanoInput.value.trim();
        }

        if (descripcionInput.value.trim() !== "" && descripcionInput.value.trim() !== cultivoActual.descripcion) {
            datosActualizados.descripcion = descripcionInput.value.trim();
        }

        if (imagenInput.value.trim() !== "" && imagenInput.value.trim() !== cultivoActual.imagen) {
            datosActualizados.imagen = imagenInput.value.trim(); // como cadena de texto
        }

        let estadoSeleccionado = null;
        for (const radio of estadoRadios) {
            if (radio.checked) {
                estadoSeleccionado = radio.value;
                break;
            }
        }

        if (estadoSeleccionado && estadoSeleccionado !== cultivoActual.estado) {
            datosActualizados.estado = estadoSeleccionado;
        }

        if (Object.keys(datosActualizados).length === 0) {
            showToast("Información", "No se han realizado cambios.", 'info');
            return;
        }

        submitButton.disabled = true;

        try {
            const response = await fetch(`http://localhost:5000/cultivos/${cropId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "No se pudo actualizar el cultivo");
            }

            showToast("Éxito", "Cultivo actualizado correctamente.", 'success');
            setTimeout(() => {
                window.location.href = "listar-cultivos.html";
            }, 2000);
        } catch (error) {
            console.error("Error actualizando cultivo:", error);
            const errorMessage = error.message || "Hubo un error al actualizar el cultivo.";
            showToast("Error", errorMessage, 'error');
        } finally {
            submitButton.disabled = false;
        }
    });
});
