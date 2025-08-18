const API_URL = 'http://localhost:5000';
const recuperar = {
	emailRecuperar: "",
};

const emailRecuperar = document.querySelector("#emailRecuperar");
const form = document.querySelector(".form--forget");

form.addEventListener("input", readText);
emailRecuperar.addEventListener("input", readText);

// Evento submit
form.addEventListener("submit", async function (e) {
	e.preventDefault();
	const email = emailRecuperar.value.trim();

	if (email === "") {
		showAlert("Este campo es obligatorio", true);
		return;
	}

	if (!validarEmail(email)) {
		showAlert("El correo no es válido", true);
		return;
	}

	try {
		const response = await fetch(`${API_URL}/solicitar-recuperacion`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email })
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || 'Error al procesar la solicitud');
		}

		showAlert("Si el correo existe, se ha enviado un código de recuperación");

		// Guardar el correo en localStorage para usarlo en la siguiente pantalla
		localStorage.setItem('recoveryEmail', email);

		setTimeout(() => {
			window.location.href = "login-codigo-recuperar.html";
		}, 1500);

	} catch (error) {
		console.error('Error:', error);
		showAlert(error.message || 'Error al enviar el correo de recuperación', true);
	}
});

function validarEmail(emailRecuperar) {
	const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return regex.test(emailRecuperar);
}

function showAlert(message, error = null) {
	// Usar el sistema de toast
	const type = error ? 'error' : 'success';
	showToast(message, type);
}

function readText(e) {
    if (e && e.target && e.target.id) {
        recuperar[e.target.id] = e.target.value;
    }
}

// Manejar el botón de retroceso para limpiar el localStorage
window.addEventListener('pageshow', function(event) {
    // Si la página se carga desde la caché (como al presionar atrás)
    if (event.persisted) {
        localStorage.removeItem('recoveryEmail');
    }
});
