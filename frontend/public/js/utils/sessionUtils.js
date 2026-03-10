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
	localStorage.removeItem("userTelefono");
	localStorage.removeItem("userTipoDoc");
	localStorage.removeItem("userNumDoc");
}

// Función para limpiar tokens inválidos al inicio
export function cleanupInvalidTokens() {
	const token = localStorage.getItem("token");
	if (token) {
		try {
			// Intentar decodificar el token para verificar si es válido
			const parts = token.split('.');
			if (parts.length !== 3) {
				// Token JWT malformado
				console.warn("Token JWT malformado detectado, limpiando...");
				clearSession();
				return false;
			}
			
			const payload = JSON.parse(atob(parts[1]));
			const now = Date.now() / 1000;
			
			// Verificar si el token ha expirado
			if (payload.exp && payload.exp < now) {
				console.warn("Token expirado detectado, limpiando...");
				clearSession();
				return false;
			}
			
			return true;
		} catch (error) {
			console.warn("Error al verificar token, limpiando...", error);
			clearSession();
			return false;
		}
	}
	return true;
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
		// Si la URL es relativa, añadir el token si existe PERO solo para rutas que no sean login
		if (url.startsWith('http://localhost:5000') || url.startsWith('/')) {
			const token = localStorage.getItem("token");
			// NO añadir token para la ruta de login o logout
			const isAuthRoute = url.includes('/login') || url.includes('/logout') || url.includes('/force-logout');
			
			if (token && !isAuthRoute) {
				options.headers = {
					...options.headers,
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json"
				};
			} else if (!isAuthRoute) {
				// Solo añadir Content-Type si no es ruta de auth
				options.headers = {
					...options.headers,
					"Content-Type": "application/json"
				};
			}
		}

		const response = await originalFetch(url, options);

		// Si la respuesta es 401 (Unauthorized), redirigir al login SOLO si no es una ruta de auth
		if (response.status === 401 && !url.includes('/login') && !url.includes('/logout') && !url.includes('/force-logout')) {
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
// Primero limpiar tokens inválidos
cleanupInvalidTokens();
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
