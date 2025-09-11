const userLogin = {
	password: "",
	email: "",
};

//Seleccionando elementos
const password = document.querySelector(".form__input--password");
const email = document.querySelector(".form__input--email");
const form = document.querySelector(".form__container--login");

//inputs
form.addEventListener("input", readText);
email.addEventListener("input", readText);
password.addEventListener("input", readText);

import { loginUser } from '../services/loginService.js';

//Evento submit
form.addEventListener("submit", async function (e) {
	e.preventDefault();
	// Captura los valores actuales de los inputs
	const emailValue = email.value.trim();
	const passwordValue = password.value.trim();

	if (emailValue === "" || passwordValue === "") {
		showAlert("Todos los campos son obligatorios", true);
		return;
	}

	if (!validarEmail(emailValue)) {
		showAlert("El correo no es válido", true);
		return;
	}

	try {
		// Enviar el email como userEmail para el backend
		const data = await loginUser(emailValue, passwordValue);
		// Guardar el token en localStorage para futuras peticiones
		if (data.token) {
			localStorage.setItem('token', data.token);
		}
		showAlert("Inicio de sesión exitoso");
		// Redirigir según el rol
		setTimeout(() => {
			if (data.usuario.rol === 'superadmin'|| data.usuario.rol === 'Super administrador') {
				window.location.href = 'home.html';
			} else if (data.usuario.rol === 'admin' || data.usuario.rol === 'Administrador') {
				window.location.href = 'home.html';
			} else if (data.usuario.rol === 'apoyo' || data.usuario.rol === 'Personal de Apoyo') {
				window.location.href = 'listar-sensores.html';
			} else {
				window.location.href = 'visitante.html';
			}
		}, 1000);
	} catch (error) {
		// Mostrar mensaje de error específico para usuarios deshabilitados
		if (error.message && error.message.includes('deshabilitado')) {
			showAlert(error.message, true);
		} else {
			showAlert(error.message || "Error en el inicio de sesión. Verifica tus credenciales e intenta nuevamente.", true);
		}
	}
});

// Esta funcion valida que sea un correo y que cumpla con el formato de uno
function validarEmail(email) {
	const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return regex.test(email);
}

function showAlert(message, error = null) {
	const alert = document.createElement("P");
	alert.textContent = message;

	if (error) {
		alert.classList.add("error");
	} else {
		alert.classList.add("correct");
	}
	form.appendChild(alert);

	setTimeout(() => {
		alert.remove();
	}, 5000);
}

//Callback o funcion
function readText(e) {
	if (e.target.classList.contains("form__input--email")) {
		userLogin.email = e.target.value.trim(); // Actualizar el valor del correo
	} else if (e.target.classList.contains("form__input--password")) {
		userLogin.password = e.target.value.trim(); // Actualizar el valor de la contraseña
	}
}

// FUncion para mostrar u ocultar la contraseña
document.addEventListener('DOMContentLoaded', function() {
    const togglePasswordBtn = document.querySelector('.toggle-password-login');
    const passwordInput = document.getElementById('password');
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
});