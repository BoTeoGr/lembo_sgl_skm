// sessionUtils.js
// Utilidades para manejar sesiones y autenticación

// Función para verificar si hay una sesión activa
export function hasValidSession() {
	const token = localStorage.getItem("token");
	return token && token !== "";
}

// Función para limpiar sesión
export function clearSession() {
	localStorage.removeItem("token");
	localStorage.removeItem("userId");
	localStorage.removeItem("userName");
	localStorage.removeItem("userEmail");
	localStorage.removeItem("userRol");
	localStorage.removeItem("userRole");
}

// Función para manejar respuestas de error que indican sesión inválida
export function handleAuthError(error) {
	if (error.message && (
		error.message.includes("Sesión expirada") ||
		error.message.includes("Sesión no encontrada") ||
		error.message.includes("Token inválido") ||
		error.message.includes("401")
	)) {
		clearSession();
		showToast("Sesión expirada", "Tu sesión ha expirado. Redirigiendo al login...", "warning");
		setTimeout(() => {
			window.location.href = "index.html";
		}, 2000);
		return true;
	}
	return false;
}

// Interceptor global para manejar errores de autenticación
function setupFetchInterceptor() {
	const originalFetch = window.fetch;

	window.fetch = async function(url, options = {}) {
		// Si la URL es relativa, añadir el token si existe
		if (url.startsWith('http://localhost:5000') || url.startsWith('/')) {
			const token = localStorage.getItem("token");
			if (token) {
				options.headers = {
					...options.headers,
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json"
				};
			}
		}

		const response = await originalFetch(url, options);

		// Si la respuesta es 401 (Unauthorized), redirigir al login
		if (response.status === 401) {
			clearSession();
			showToast("Sesión expirada", "Tu sesión ha expirado. Redirigiendo al login...", "warning");
			setTimeout(() => {
				window.location.href = "index.html";
			}, 2000);
			throw new Error("Sesión expirada");
		}

		return response;
	};
}

// Inicializar el interceptor cuando se cargue el módulo
setupFetchInterceptor();

// Función para hacer fetch con manejo automático de autenticación (alternativa al interceptor global)
export async function authenticatedFetch(url, options = {}) {
	const token = localStorage.getItem("token");

	if (!token) {
		throw new Error("No hay sesión activa");
	}

	const defaultOptions = {
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`,
			...options.headers,
		},
		...options,
	};

	try {
		const response = await fetch(url, defaultOptions);

		if (response.status === 401) {
			clearSession();
			throw new Error("Sesión expirada o inválida");
		}

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || `Error HTTP ${response.status}`);
		}

		return response;
	} catch (error) {
		if (!handleAuthError(error)) {
			throw error;
		}
	}
}

// Función para mostrar toast (asumiendo que está disponible globalmente)
function showToast(title, message, type = "info") {
	// Esta función debería estar definida en el contexto donde se use
	// Por ahora, la implementamos aquí para compatibilidad
	if (typeof window.showToast === 'function') {
		window.showToast(title, message, type);
	} else {
		console.warn("showToast no está disponible:", { title, message, type });
	}
}
