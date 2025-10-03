import jwt from "jsonwebtoken";
import { activeSessions } from "../controllers/user.controller.js";

// Middleware generador para verificar roles permitidos
// Permite acceso si es admin o el mismo usuario
export function verificarUsuarioPropioOAdmin(rolesAdmin = []) {
	return (req, res, next) => {
		const authHeader = req.headers["authorization"];
		if (!authHeader) {
			return res.status(401).json({ error: "Token no proporcionado" });
		}
		const token = authHeader.split(" ")[1];
		if (!token) {
			return res.status(401).json({ error: "Token no proporcionado" });
		}
		try {
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || "tu_clave_secreta"
			);
			const userId = req.params.id;
			const userRole = decoded.rol?.toLowerCase();
			const isAdmin = rolesAdmin.map((r) => r.toLowerCase()).includes(userRole);

			// Permitir si es admin o accede a su propio perfil
			if (isAdmin || decoded.id.toString() === userId) {
				return next();
			}

			console.warn(
				"Acceso denegado. No tienes permisos para acceder a este recurso"
			);
			return res
				.status(403)
				.json({ error: "No tienes permisos para realizar esta acción" });
		} catch (error) {
			console.error("Error al verificar token:", error);
			return res.status(401).json({ error: "Token inválido" });
		}
	};
}

// Verifica que el rol del token esté permitido y adjunta el usuario a req
export function verificarRol(rolesPermitidos = []) {
	return (req, res, next) => {
		const authHeader = req.headers["authorization"];
		if (!authHeader) {
			console.warn("Token no proporcionado");
			return res.status(401).json({ error: "Token no proporcionado" });
		}
		const token = authHeader.split(" ")[1];
		if (!token) {
			console.warn("Token no proporcionado (header presente pero sin token)");
			return res.status(401).json({ error: "Token no proporcionado" });
		}
		try {
			console.log("Token recibido:", token);
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || "tu_clave_secreta"
			);
			console.log("Payload decodificado:", decoded);

			// Adjuntar el usuario decodificado al objeto de solicitud
			req.user = decoded;

			const rol = decoded.rol?.toLowerCase();
			console.log("Rol extraído del token:", rol);

			// Si no se especifican rolesPermitidos, deja pasar a cualquiera
			if (rolesPermitidos.length === 0) {
				return next();
			}

			// Permite si el rol está en la lista de permitidos
			if (rolesPermitidos.map((r) => r.toLowerCase()).includes(rol)) {
				return next();
			}
			console.warn(
				"Acceso denegado. Rol no permitido:",
				rol,
				"Permitidos:",
				rolesPermitidos
			);
			return res
				.status(403)
				.json({ error: "No tienes permisos para realizar esta acción" });
		} catch (err) {
			console.error("Error al verificar token:", err);
			return res.status(401).json({ error: "Token inválido" });
		}
	};
}

// Middleware para verificar sesión activa
export function verificarSesionActiva(req, res, next) {
	const authHeader = req.headers["authorization"];
	if (!authHeader) {
		return res.status(401).json({ error: "Token no proporcionado" });
	}
	const token = authHeader.split(" ")[1];
	if (!token) {
		return res.status(401).json({ error: "Token no proporcionado" });
	}

	try {
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "tu_clave_secreta"
		);

		// Verificar si la sesión está activa
		if (!activeSessions.has(decoded.id)) {
			return res.status(401).json({ error: "Sesión expirada o inválida" });
		}

		const userSessions = activeSessions.get(decoded.id);
		if (!userSessions.has(decoded.sessionId)) {
			return res.status(401).json({ error: "Sesión no encontrada" });
		}

		// Verificar si la sesión ha expirado
		const session = userSessions.get(decoded.sessionId);
		if (session.expiresAt < Date.now()) {
			userSessions.delete(decoded.sessionId);
			if (userSessions.size === 0) {
				activeSessions.delete(decoded.id);
			}
			return res.status(401).json({ error: "Sesión expirada" });
		}

		req.user = decoded;
		next();
	} catch (error) {
		console.error("Error al verificar sesión:", error);
		return res.status(401).json({ error: "Token inválido" });
	}
}

// Función para cerrar sesión
export function logoutUsuario(req, res) {
	try {
		const authHeader = req.headers["authorization"];
		if (!authHeader) {
			return res.status(401).json({ error: "Token no proporcionado" });
		}
		const token = authHeader.split(" ")[1];
		if (!token) {
			return res.status(401).json({ error: "Token no proporcionado" });
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "tu_clave_secreta"
		);

		// Remover sesión activa
		if (activeSessions.has(decoded.id)) {
			activeSessions.get(decoded.id).delete(decoded.sessionId);
			if (activeSessions.get(decoded.id).size === 0) {
				activeSessions.delete(decoded.id);
			}
		}

		res.status(200).json({ message: "Sesión cerrada exitosamente" });
	} catch (error) {
		console.error("Error al cerrar sesión:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
}
