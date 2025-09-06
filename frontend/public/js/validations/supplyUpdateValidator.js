document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const insumoId = params.get("id");

    if (!insumoId) {
        window.location.href = "listar-insumos.html";
        return;
    }

    const form = document.querySelector(".form__container");
    const nombreInput = document.querySelector(".form__input--insume-name");
    const tipoInput = document.querySelector(".form__input--insume-type");
    const medidaInput = document.querySelector(".form__select--insume-extent");
    const valorUnitarioInput = document.querySelector(".form__input--insume-price");
    const cantidadInput = document.querySelector(".form__input--insume-amount");
    const descripcionInput = document.querySelector(".form__textarea--insume-description");
    const estadoRadios = document.getElementsByName("estado-habilitado");
    const imagenInput = document.querySelector(".form__file--insume-image");
    const valorTotalInput = document.querySelector(".form__input--total-value"); // Campo para el valor total
    const submitButton = form.querySelector("button[type='submit']");

    let insumoActual = null;

    // Función para calcular el valor total
    function calculateTotal() {
        const price = parseFloat(valorUnitarioInput.value) || 0;
        const amount = parseInt(cantidadInput.value) || 0;

        // Validar que el precio sea un número válido
        if (isNaN(price)) {
            valorTotalInput.value = ""; // Limpiar campo si el precio no es válido
            return;
        }

        const total = (price * amount).toFixed(0); // Redondear a entero
        // Formatear con el signo $ y sin decimales
        const formattedTotal = `$${total}`;

        valorTotalInput.value = formattedTotal; // Asignar al campo de valor total
    }

    // Cargar datos del insumo actual
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/insumos/${insumoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error("No se pudo obtener el insumo");

        insumoActual = await response.json();
        console.log("Insumo recibido:", insumoActual); // Verifica que valor_total esté en los datos

        nombreInput.value = insumoActual.nombre;
        tipoInput.value = insumoActual.tipo;
        medidaInput.value = insumoActual.unidad_medida;
        valorUnitarioInput.value = insumoActual.valor_unitario;
        cantidadInput.value = insumoActual.cantidad;
        descripcionInput.value = insumoActual.descripcion;

        // Asigna el valor total al campo correspondiente
        valorTotalInput.value = `$${insumoActual.valor_total}`;

        for (const radio of estadoRadios) {
            radio.checked = radio.value === insumoActual.estado;
        }

    } catch (error) {
        console.error("Error cargando datos del insumo:", error);
    }

    // Llamar a la función de cálculo cada vez que cambien los valores de cantidad o valor unitario
    valorUnitarioInput.addEventListener("input", calculateTotal);
    cantidadInput.addEventListener("input", calculateTotal);

    // Manejador de envío del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!insumoActual || !insumoActual.id) {
            console.error("No se pudo cargar la información del insumo");
            window.location.href = "listar-insumos.html";
            return;
        }

        const datosActualizados = {};
        
        if (nombreInput.value.trim() !== "" && nombreInput.value.trim() !== insumoActual.nombre) {
            datosActualizados.nombre = nombreInput.value.trim();
        }

        if (tipoInput.value.trim() !== "" && tipoInput.value.trim() !== insumoActual.tipo) {
            datosActualizados.tipo = tipoInput.value.trim();
        }

        if (medidaInput.value.trim() !== "" && medidaInput.value.trim() !== insumoActual.unidad_medida) {
            datosActualizados.unidad_medida = medidaInput.value.trim();
        }

        if (valorUnitarioInput.value !== "" && valorUnitarioInput.value != insumoActual.valor_unitario) {
            datosActualizados.valor_unitario = parseFloat(valorUnitarioInput.value);
        }

        if (cantidadInput.value !== "" && cantidadInput.value != insumoActual.cantidad) {
            datosActualizados.cantidad = parseFloat(cantidadInput.value);
        }

        if (descripcionInput.value.trim() !== "" && descripcionInput.value.trim() !== insumoActual.descripcion) {
            datosActualizados.descripcion = descripcionInput.value.trim();
        }

        if (imagenInput.value.trim() !== "" && imagenInput.value.trim() !== insumoActual.imagen) {
            datosActualizados.imagen = imagenInput.value.trim(); // Como cadena de texto
        }

        let estadoSeleccionado = null;
        for (const radio of estadoRadios) {
            if (radio.checked) {
                estadoSeleccionado = radio.value;
                break;
            }
        }

        if (estadoSeleccionado && estadoSeleccionado !== insumoActual.estado) {
            datosActualizados.estado = estadoSeleccionado;
        }


        if (Object.keys(datosActualizados).length === 0) {
            return;
        }

        submitButton.disabled = true;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/insumos/${insumoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(datosActualizados)
            });

            if (response.ok) {
                showToast("Insumo actualizado", "El insumo ha sido actualizado correctamente", "success");
                setTimeout(() => {
                    window.location.href = "listar-insumos.html";
                }, 2000);
            } else {
                showToast("Error", data.error || "Error al actualizar el insumo", "error");
            }
            
        } catch (error) {
            console.error("Error actualizando insumo:", error);
            showToast("Error", "Error al comunicarse con el servidor", "error")
        } finally {
            submitButton.disabled = false;
        }
    });
});

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
