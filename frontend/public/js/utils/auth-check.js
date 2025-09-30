// Verificar si el usuario está autenticado
function checkAuth() {
	// No verificar en la página de login
	if (window.location.pathname.endsWith("index.html")) {
		// Si ya está autenticado y está en la página de login, redirigir a home
		if (localStorage.getItem("token")) {
			window.location.href = "home.html";
		}
		return;
	}

	// Verificar si hay un token
	if (!localStorage.getItem("token")) {
		// Guardar la URL actual para redirigir después del login
		sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
		window.location.href = "acceso-denegado.html?r=unauth";
		return;
	}
}

// Ejecutar la verificación cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", checkAuth);

// También verificar si el script se carga después de que el DOM ya esté listo
if (
	document.readyState === "complete" ||
	document.readyState === "interactive"
) {
	checkAuth();
}
