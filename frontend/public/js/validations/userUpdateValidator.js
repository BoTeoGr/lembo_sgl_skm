document.addEventListener("DOMContentLoaded", async () => {
	// Verificar si el usuario actual es super administrador
	const currentUserRole =
		localStorage.getItem("userRole") || localStorage.getItem("userRol") || "";
	const isSuperAdmin = currentUserRole.toLowerCase().includes("super");

	// Ocultar campo de estado si no es super administrador
	const statusContainer = document.getElementById("statusContainer");
	if (statusContainer && !isSuperAdmin) {
		statusContainer.closest(".form-group").style.display = "none";
	}

	const params = new URLSearchParams(window.location.search);
	const userId = params.get("id");

	if (!userId) {
		alert("ID del usuario no encontrado en la URL");
		window.location.href = "listar-usuarios.html";
		return;
	}

	const form = document.querySelector(".form__container");
	const tipoDocumentoInput = form.querySelector("#tipo-documento");
	const nombreInput = form.querySelector("#nombre");
	const numeroDocumentoInput = form.querySelector("#numero-documento");
	const telefonoInput = form.querySelector("#telefono");
	const correoInput = form.querySelector("#correo");
	const confirmarCorreoInput = form.querySelector("#confirmar-correo");
	const passwordInput = form.querySelector("#password");
	const rolInput = form.querySelector("#rol");
	const estadoRadios = form.querySelectorAll("[name='estado-habilitado']");
	const submitButton = form.querySelector("button[type='submit']");

	// Objeto para almacenar datos del usuario
	const userData = {
		tipo_documento: "",
		nombre: "",
		numero_documento: "",
		telefono: "",
		correo: "",
		confirmar_correo: "",
		rol: "",
		estado: "habilitado",
		password: "",
	};

	// Actualizar userData cuando cambian los campos
	const updateUserData = () => {
		userData.tipo_documento = tipoDocumentoInput.value;
		userData.nombre = nombreInput.value.trim();
		userData.numero_documento = numeroDocumentoInput.value.trim();
		userData.telefono = telefonoInput.value.trim();
		userData.correo = correoInput.value.trim();
		userData.confirmar_correo = confirmarCorreoInput.value.trim();
		userData.rol = rolInput.value;
		userData.password = passwordInput.value;

		// Obtener el estado seleccionado
		for (const radio of estadoRadios) {
			if (radio.checked) {
				userData.estado = radio.value;
				break;
			}
		}
	};

	// Validaciones de teclado
	nombreInput.addEventListener("keydown", function (e) {
		if (e.key >= "0" && e.key <= "9") {
			e.preventDefault();
			console.log("Número bloqueado");
		}
	});

	telefonoInput.addEventListener("keydown", function (e) {
		if (
			e.key === "Backspace" ||
			e.key === "Tab" ||
			e.key === "Enter" ||
			e.key === "ArrowLeft" ||
			e.key === "ArrowRight"
		) {
			return;
		}
		if (e.key < "0" || e.key > "9") {
			e.preventDefault();
			console.log("Solo se permite números");
		}
	});

	let usuarioActual = null;

	try {
		const token = localStorage.getItem("token");
		const response = await fetch(`http://localhost:5000/usuarios/${userId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		if (!response.ok) throw new Error("No se pudo obtener el usuario");

		usuarioActual = await response.json();

		// Asignación de valores a los campos del formulario
		tipoDocumentoInput.value =
			usuarioActual.tipo_documento || usuarioActual.tipoDocumento || "";
		nombreInput.value =
			usuarioActual.nombre || usuarioActual.nombre_completo || "";
		numeroDocumentoInput.value =
			usuarioActual.numero_documento || usuarioActual.numeroDocumento || "";
		telefonoInput.value = usuarioActual.telefono || "";
		correoInput.value = usuarioActual.correo || "";
		confirmarCorreoInput.value = usuarioActual.correo || "";
		rolInput.value = usuarioActual.rol || "";

		// Selección del estado
		for (const radio of estadoRadios) {
			radio.checked =
				radio.value === (usuarioActual.estado || "").toLowerCase();
		}
	} catch (error) {
		console.error("Error cargando datos del usuario:", error);
		alert("No se pudo cargar la información del usuario.");
	}

	// Agregar event listeners para actualizar userData cuando cambien los campos
	[
		tipoDocumentoInput,
		nombreInput,
		numeroDocumentoInput,
		telefonoInput,
		correoInput,
		confirmarCorreoInput,
		passwordInput,
		rolInput,
		...estadoRadios,
	].forEach((element) => {
		element.addEventListener("change", updateUserData);
		element.addEventListener("input", updateUserData);
	});

	// Función para validar formato de correo electrónico
	function isValidEmail(email) {
		const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
		return emailRegex.test(email);
	}

	function validateUserData() {
		// Validar formato del correo electrónico
		if (userData.correo && !isValidEmail(userData.correo)) {
			showToast(
				"Correo inválido",
				"El formato del correo electrónico no es válido. Ejemplo: usuario@dominio.com",
				"error"
			);
			return false;
		}

		// Validar formato del correo de confirmación
		if (userData.confirmar_correo && !isValidEmail(userData.confirmar_correo)) {
			showToast(
				"Correo inválido",
				"El formato del correo de confirmación no es válido. Ejemplo: usuario@dominio.com",
				"error"
			);
			return false;
		}

		// Validación de correo
		if (userData.correo !== userData.confirmar_correo) {
			showToast(
				"Correos no coinciden",
				"Los correos electrónicos no coinciden",
				"error"
			);
			return false;
		}

		// Validación de número de documento
		if (userData.numero_documento && !/^\d+$/.test(userData.numero_documento)) {
			showToast(
				"Error",
				"El número de documento solo puede contener números",
				"error"
			);
			return false;
		}

		// Validación de contraseña si se proporciona una nueva
		if (
			userData.password &&
			(userData.password.length < 8 || userData.password.length > 18)
		) {
			showToast(
				"Longitud de contraseña",
				"La contraseña debe tener entre 8 y 18 caracteres",
				"error"
			);
			return false;
		}

		return true;
	}

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

	// Funcion para mostrar u ocultar la contraseña
	const togglePasswordBtnUpdate = document.querySelector(".toggle-password");
	const passwordInputUpdate = document.getElementById("password");

	togglePasswordBtnUpdate.addEventListener("click", function () {
		const type =
			passwordInputUpdate.getAttribute("type") === "password"
				? "text"
				: "password";
		passwordInputUpdate.setAttribute("type", type);
		// Cambiar el icono (ocultar/mostrar contraseña)
		this.querySelector("i").classList.toggle("fa-eye");
		this.querySelector("i").classList.toggle("fa-eye-slash");
	});

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		if (!usuarioActual) {
			alert("No se puede actualizar sin datos del usuario cargados.");
			return;
		}

		// Actualizar userData antes de validar
		updateUserData();

		if (!validateUserData()) {
			return;
		}

		// Construir objeto con los datos actualizados
		const datosActualizados = {
			tipo_documento: userData.tipo_documento,
			nombre: userData.nombre,
			numero_documento: userData.numero_documento,
			telefono: userData.telefono,
			correo: userData.correo,
			rol: userData.rol,
			estado: userData.estado,
			// Incluir la contraseña solo si se proporcionó una nueva
			...(userData.password && { password: userData.password }),
		};

		submitButton.disabled = true;

		try {
			const token = localStorage.getItem("token");

			// Primero actualizamos los datos del usuario
			const response = await fetch(`http://localhost:5000/usuarios/${userId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					tipo_documento: userData.tipo_documento,
					nombre: userData.nombre,
					numero_documento: userData.numero_documento,
					telefono: userData.telefono,
					correo: userData.correo,
					rol: userData.rol,
					...(userData.password && { password: userData.password }),
				}),
			});

			// Luego actualizamos el estado por separado
			if (userData.estado !== usuarioActual.estado) {
				const estadoResponse = await fetch(
					`http://localhost:5000/usuarios/${userId}/estado`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({ estado: userData.estado }),
					}
				);

				if (!estadoResponse.ok) {
					const errorData = await estadoResponse.json().catch(() => ({}));
					const errorMessage =
						errorData.error || "No se pudo actualizar el estado del usuario";
					throw new Error(errorMessage);
				}
			}

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					errorData.error || "No se pudo actualizar el usuario";
				throw new Error(errorMessage);
			}

			showToast(
				"Actualización exitosa",
				"Usuario actualizado correctamente",
				"success"
			);
			setTimeout(() => {
				window.location.href = "listar-usuarios.html";
			}, 2000);
		} catch (error) {
			console.error("Error actualizando usuario:", error);
			showToast(
				"Error",
				error.message || "Hubo un error al actualizar el usuario",
				"error"
			);
		} finally {
			submitButton.disabled = false;
		}
	});
});
