const API_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
	const codeInputs = document.querySelectorAll(".login-code__input");
	const form = document.querySelector("#form-recovery-code");
	const alertContainer = document.querySelector("#alert-container");

	// Obtener el correo de localStorage
	const recoveryEmail = localStorage.getItem("recoveryEmail");

	// Si no hay correo, redirigir a la página de recuperación
	if (!recoveryEmail) {
		showAlert(
			"Sesión de recuperación inválida. Por favor, inténtalo de nuevo.",
			true
		);
		setTimeout(() => {
			window.location.href = "login-olvide-contraseña.html";
		}, 3000);
		return;
	}

	// Mover al siguiente input
	codeInputs.forEach((input, index) => {
		input.addEventListener("input", (e) => {
			const value = e.target.value;

			// Asegurar que solo se escriba un número
			if (!/^\d$/.test(value)) {
				input.value = "";
				return;
			}

			if (value && index < codeInputs.length - 1) {
				codeInputs[index + 1].focus();
			}

			// Eliminamos esta línea para que no muestre el mensaje mientras se completa el código
			// showAlert("Completando el código...");
		});

		input.addEventListener("keydown", (e) => {
			if (e.key === "Backspace" && !input.value && index > 0) {
				codeInputs[index - 1].focus();
			}
		});
	});

	// Validar código al enviar
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const code = Array.from(codeInputs)
			.map((input) => input.value)
			.join("");

		// Si no se completaron los 6 dígitos
		if (code.length < 6) {
			showAlert("Por favor, completa los 6 dígitos del código.", true);
			return;
		}

		try {
			showAlert("Verificando código...");

			const response = await fetch(`${API_URL}/verificar-codigo`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: recoveryEmail,
					codigo: code,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Error al verificar el código");
			}

			// Guardar el token para el restablecimiento de contraseña
			localStorage.setItem("recoveryToken", data.token);

			showAlert("Código verificado correctamente. Redirigiendo...");

			setTimeout(() => {
				window.location.href = "actualizacion-contraseña.html";
			}, 1500);
		} catch (error) {
			console.error("Error:", error);
			showAlert(error.message || "Error al verificar el código", true);

			// Limpiar los inputs en caso de error
			codeInputs.forEach((input) => (input.value = ""));
			codeInputs[0].focus();
		}
	});

	// Función para mostrar alertas
	function showAlert(message, error = false) {
		const alert = document.createElement("div");
		alert.textContent = message;
		alert.classList.add("login-code__alert");

		if (error) {
			alert.classList.add("login-code__alert--error");
		} else {
			alert.classList.add("login-code__alert--success");
		}

		// Limpiar alertas anteriores
		const existingAlerts =
			alertContainer.querySelectorAll(".login-code__alert");
		existingAlerts.forEach((alert) => alert.remove());

		// Agregar la nueva alerta
		alertContainer.appendChild(alert);

		// Auto-eliminar después de 5 segundos para alertas de error
		if (error) {
			setTimeout(() => {
				if (document.body.contains(alert)) {
					alert.remove();
				}
			}, 5000);
		}
	}
});
