const API_URL = 'http://localhost:5000';
const contraseñaRecuperar = {
	contraseña: "",
	contraseñaConfirm: "",
};

const form = document.querySelector(".form--password");
const password = document.querySelector("#password");
const password2 = document.querySelector("#password2");

// Verificar si hay un token de recuperación
const recoveryToken = localStorage.getItem('recoveryToken');
if (!recoveryToken) {
	showAlert("Sesión de recuperación inválida. Por favor, inténtalo de nuevo.", true);
	setTimeout(() => {
		window.location.href = "login-olvide-contraseña.html";
	}, 3000);
}

// Leer texto en inputs
form.addEventListener("input", readText);
password.addEventListener("input", readText);
password2.addEventListener("input", readText);

// Evento submit
form.addEventListener("submit", async function (e) {
	e.preventDefault();
	const { contraseña, contraseñaConfirm } = contraseñaRecuperar;

	if (contraseña === "" || contraseñaConfirm === "") {
		showAlert("Todos los campos son obligatorios", true);
		return;
	}

	if (contraseña.length < 8) {
		showAlert("La contraseña debe tener al menos 8 caracteres", true);
		return;
	}

	if (contraseña !== contraseñaConfirm) {
		showAlert("Las contraseñas no coinciden", true);
		return;
	}

	try {
		showAlert("Actualizando contraseña...");

		const response = await fetch(`${API_URL}/restablecer-contrasena`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: recoveryToken,
				nuevaContrasena: contraseña
			})
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || 'Error al actualizar la contraseña');
		}

		showAlert("¡Contraseña actualizada correctamente! Redirigiendo...");

		// Limpiar el almacenamiento local
		localStorage.removeItem('recoveryToken');
		localStorage.removeItem('recoveryEmail');

		setTimeout(() => {
			window.location.href = "index.html";
		}, 1500);

	} catch (error) {
		console.error('Error:', error);
		showAlert(error.message || 'Error al actualizar la contraseña', true);
	}
});

function showAlert(message, error = false) {
	// Usar el sistema de toast
	const type = error ? 'error' : 'success';
	showToast(message, type);
}

function readText(e) {
	if (e.target.id === "password") {
		contraseñaRecuperar.contraseña = e.target.value;
	} else if (e.target.id === "password2") {
		contraseñaRecuperar.contraseñaConfirm = e.target.value;
	}
}
