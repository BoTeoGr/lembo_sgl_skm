// auth.js - Utilidad para verificar autenticación

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si el usuario tiene un token válido
 */
function isAuthenticated() {
	return !!localStorage.getItem("token");
}

/**
 * Redirige al login si no está autenticado
 */
function checkAuth() {
	// No verificar en la página de login
	if (window.location.pathname.endsWith("index.html")) {
		return;
	}

	if (!isAuthenticated()) {
		// Guardar la URL actual para redirigir después del login
		sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
		window.location.href = "/index.html";
	}
}

// Verificar autenticación cuando se carga la página
document.addEventListener("DOMContentLoaded", checkAuth);

// También verificar si el script se carga después de que el DOM ya esté listo
if (
	document.readyState === "complete" ||
	document.readyState === "interactive"
) {
	checkAuth();
}
