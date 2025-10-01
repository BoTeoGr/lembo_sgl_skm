document.addEventListener("DOMContentLoaded", async () => {
	const params = new URLSearchParams(window.location.search);
	const sensorId = params.get("id");

	if (!sensorId) {
		alert("ID del sensor no encontrado en la URL");
		window.location.href = "listar-sensores.html";
		return;
	}

	const form = document.querySelector(".form__container");
	const tipoSelect = form.querySelector(".form__select--sensor-type");
	const nombreInput = form.querySelector(".form__input--sensor-name");
	const unidadSelect = form.querySelector(".form__select--sensor-unit");
	const descripcionTextarea = form.querySelector(
		".form__textarea--sensor-description"
	);
	const tiempoEscaneoSelect = form.querySelector(".form__select--sensor-scan");
	const estadoRadios = form.querySelectorAll("[name='estado-habilitado']");
	const imagenInput = form.querySelector(".form__file--sensor-image"); // input type=file
	const submitButton = form.querySelector("button[type='submit']");

	let sensorActual = null;

	try {
		const token = localStorage.getItem("token");
		const response = await fetch(`http://localhost:5000/sensor/${sensorId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		if (!response.ok) throw new Error("No se pudo obtener el sensor");

		sensorActual = await response.json();

		// Asignación de valores a los campos del formulario
		if (tipoSelect) tipoSelect.value = sensorActual.tipo_sensor || "default";
		if (nombreInput) nombreInput.value = sensorActual.nombre_sensor || "";
		if (unidadSelect)
			unidadSelect.value = sensorActual.unidad_medida || "default";
		if (descripcionTextarea)
			descripcionTextarea.value = sensorActual.descripcion || "";
		if (tiempoEscaneoSelect)
			tiempoEscaneoSelect.value = sensorActual.tiempo_escaneo || "default";

		// Imagen: solo mostrar nombre si existe, no se puede asignar value por seguridad
		if (imagenInput && sensorActual.imagen) {
			// Mostrar nombre del archivo en algún lugar si es necesario
			imagenInput.setAttribute("data-existing", sensorActual.imagen);
		}

		// Selección del estado
		for (const radio of estadoRadios) {
			radio.checked = radio.value === sensorActual.estado;
		}
	} catch (error) {
		console.error("Error cargando datos del sensor:", error);
		showToast("Error", "No se pudo cargar la información del sensor.", "error");
	}

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		if (!sensorActual) {
			showToast(
				"Error",
				"No se puede actualizar sin datos del sensor cargados.",
				"error"
			);
			return;
		}

		// Mostrar estado de carga
		submitButton.disabled = true;
		submitButton.innerHTML =
			'<i class="fas fa-spinner fa-spin"></i> Actualizando...';

		const datosActualizados = {};

		// Comprobación de campos modificados
		if (
			nombreInput &&
			nombreInput.value.trim() !== "" &&
			nombreInput.value.trim() !== sensorActual.nombre_sensor
		) {
			datosActualizados.nombre_sensor = nombreInput.value.trim();
		}

		if (
			tipoSelect &&
			tipoSelect.value !== "default" &&
			tipoSelect.value !== sensorActual.tipo_sensor
		) {
			datosActualizados.tipo_sensor = tipoSelect.value;
		}

		if (
			unidadSelect &&
			unidadSelect.value !== "default" &&
			unidadSelect.value !== sensorActual.unidad_medida
		) {
			datosActualizados.unidad_medida = unidadSelect.value;
		}

		if (
			descripcionTextarea &&
			descripcionTextarea.value.trim() !== sensorActual.descripcion
		) {
			datosActualizados.descripcion = descripcionTextarea.value.trim();
		}

		if (
			tiempoEscaneoSelect &&
			tiempoEscaneoSelect.value !== "default" &&
			tiempoEscaneoSelect.value !== sensorActual.tiempo_escaneo
		) {
			datosActualizados.tiempo_escaneo = tiempoEscaneoSelect.value;
		}

		// Imagen: solo enviar si se selecciona una nueva
		if (imagenInput && imagenInput.files && imagenInput.files.length > 0) {
			// Aquí se manejar la subida de archivos si el backend lo soporta
			// Por ahora, solo enviamos el nombre del archivo
			datosActualizados.imagen = imagenInput.files[0].name;
		}

		let estadoSeleccionado = null;
		for (const radio of estadoRadios) {
			if (radio.checked) {
				estadoSeleccionado = radio.value;
				break;
			}
		}
		if (estadoSeleccionado && estadoSeleccionado !== sensorActual.estado) {
			datosActualizados.estado = estadoSeleccionado;
		}

		if (Object.keys(datosActualizados).length === 0) {
			return;
		}

		submitButton.disabled = true;
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`http://localhost:5000/sensor/${sensorId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(datosActualizados),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || "No se pudo actualizar el sensor");
			}

			showToast("Éxito", "Sensor actualizado correctamente", "success");
			// Redirigir después de mostrar el mensaje de éxito
			setTimeout(() => {
				window.location.href = "listar-sensores.html";
			}, 2000);
		} catch (error) {
			console.error("Error actualizando sensor:", error);
			showToast(
				"Error",
				error.message || "Error al actualizar el sensor",
				"error"
			);
		} finally {
			if (submitButton) {
				submitButton.disabled = false;
				submitButton.innerHTML = "Actualizar sensor";
			}
		}
	});
});

// Función general para mostrar toasts
function showToast(title, message, type = "success") {
	const toast = document.getElementById("toast");
	const toastTitle = document.getElementById("toastTitle");
	const toastDescription = document.getElementById("toastDescription");
	const toastIcon = document.getElementById("toastIcon");
	const toastProgress = document.querySelector(".toast-progress");

	// Establecer el contenido del toast
	toastTitle.textContent = title;
	toastDescription.textContent = message;

	// Establecer el icono según el tipo
	switch (type) {
		case "success":
			toastIcon.className = "fas fa-check-circle";
			break;
		case "error":
			toastIcon.className = "fas fa-exclamation-circle";
			break;
		case "warning":
			toastIcon.className = "fas fa-exclamation-triangle";
			break;
		case "info":
			toastIcon.className = "fas fa-info-circle";
			break;
	}

	// Mostrar el toast
	toast.classList.remove("hidden");

	// Animación de la barra de progreso
	let progress = 0;
	const progressInterval = setInterval(() => {
		progress += 2;
		toastProgress.style.width = `${progress}%`;
		if (progress >= 100) {
			clearInterval(progressInterval);
			// Ocultar el toast después de 5 segundos
			setTimeout(() => {
				toast.classList.add("hidden");
				toastProgress.style.width = "0%";
			}, 3400);
		}
	}, 30);
}
