import express from "express";
import {
	loginUsuario,
	crearUsuario,
	VerUsuarios,
	actualizarEstadoUsuario,
	actualizarUsuario,
	obtenerUsuarioPorId,
	solicitarRecuperacionContrasena,
	verificarCodigoRecuperacion,
	restablecerContrasena,
} from "../controllers/user.controller.js";
import {
	VerSensores,
	crearSensor,
	actualizarEstadoSensor,
	actualizarSensor,
	obtenerSensorPorId,
} from "../controllers/sensor.controller.js";
import {
	crearInsumo,
	VerInsumos,
	actualizarEstadoInsumo,
	actualizarInsumo,
	obtenerInsumoPorId,
	obtenerResumenInsumos,
	reponerStockInsumo,
} from "../controllers/insumo.controller.js";
import {
	crearCultivo,
	VerCultivos,
	actualizarEstadoCultivo,
	actualizarCultivo,
	obtenerCultivoPorId,
} from "../controllers/cultivo.controller.js";
import {
	VerCiclosCultivo,
	crearCicloCultivo,
	actualizarEstadoCicloCultivo,
	obtenerCicloCultivoPorId,
	actualizarCicloCultivo,
} from "../controllers/ciclo-cultivo.controller.js";
import {
	actualizarProduccion,
	crearProduccion,
	eliminarProduccion,
	obtenerProduccionPorId,
	verProducciones,
	actualizarEstadoProduccion,
	obtenerProduccionesPorInsumo,
	obtenerProduccionesPorCultivo,
	obtenerProduccionesPorUsuario,
	obtenerProduccionesPorSensor,
	actualizarEstadosProduccionHabilitado,
	deshabilitarProducciones,
} from "../controllers/production.controller.js";
import {
	verificarRol,
	verificarUsuarioPropioOAdmin,
	verificarSesionActiva,
	logoutUsuario,
} from "../middleware/authRole.js";
import db from "../db/config.db.js";
import { activeSessions } from "../controllers/user.controller.js";

const router = express.Router();

// Ruta para iniciar sesión
router.post("/login", loginUsuario);

// Ruta para cerrar sesión
router.post("/logout", logoutUsuario);

// Ruta para cerrar todas las sesiones de un usuario (forzar logout)
router.post("/force-logout", async (req, res) => {
	const { userEmail } = req.body;

	if (!userEmail) {
		return res.status(400).json({ error: "Correo electrónico es requerido" });
	}

	// Buscar usuario por correo
	db.query(
		"SELECT id FROM usuarios WHERE correo = ?",
		[userEmail],
		(err, results) => {
			if (err) {
				console.error("Error al buscar usuario:", err);
				return res.status(500).json({ error: "Error interno del servidor" });
			}

			if (results.length === 0) {
				return res.status(404).json({ error: "Usuario no encontrado" });
			}

			const usuario = results[0];

			// Cerrar todas las sesiones activas del usuario
			if (activeSessions.has(usuario.id)) {
				activeSessions.get(usuario.id).clear();
				activeSessions.delete(usuario.id);
			}

			res.status(200).json({ message: "Todas las sesiones han sido cerradas exitosamente" });
		}
	);
});

// Rutas para recuperación de contraseña
router.post("/solicitar-recuperacion", solicitarRecuperacionContrasena);
router.post("/verificar-codigo", verificarCodigoRecuperacion);
router.post("/restablecer-contrasena", restablecerContrasena);

// Rutas para usuarios
router.get(
	"/usuarios",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	VerUsuarios
);
router.post(
	"/users",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	crearUsuario
);
router.put(
	"/usuarios/:id/estado",
	verificarSesionActiva,
	verificarRol(["superadmin", "Super Administrador"]),
	actualizarEstadoUsuario
);
// Permite que el usuario actualice su perfil o un admin cualquier perfil
router.put(
	"/usuarios/:id",
	verificarSesionActiva,
	verificarUsuarioPropioOAdmin([
		"admin",
		"Administrador",
		"superadmin",
		"Super Administrador",
	]),
	actualizarUsuario
);
// Permite que el usuario vea su perfil o un admin cualquier perfil
router.get(
	"/usuarios/:id",
	verificarSesionActiva,
	verificarUsuarioPropioOAdmin([
		"admin",
		"Administrador",
		"superadmin",
		"Super Administrador",
	]),
	obtenerUsuarioPorId
);
// Rutas para sensores
router.get(
	"/sensor",
	verificarSesionActiva,
	verificarRol([
		"admin",
		"Administrador",
		"superadmin",
		"Super Administrador",
		"Personal de Apoyo",
		"apoyo",
		"Visitante",
		"visitante",
	]),
	VerSensores
);
router.post(
	"/sensor",
	verificarSesionActiva,
	verificarRol([
		"admin",
		"Administrador",
		"superadmin",
		"Super Administrador",
		"Personal de Apoyo",
		"apoyo",
	]),
	crearSensor
);
router.put(
	"/sensor/:id/estado",
	verificarSesionActiva,
	verificarRol([
		"admin",
		"Administrador",
		"superadmin",
		"Super Administrador",
		"Personal de Apoyo",
		"apoyo",
	]),
	actualizarEstadoSensor
);
router.put(
	"/sensor/:id",
	verificarSesionActiva,
	verificarRol([
		"admin",
		"Administrador",
		"superadmin",
		"Super Administrador",
		"Personal de Apoyo",
		"apoyo",
	]),
	actualizarSensor
);
router.get(
	"/sensor/:id",
	verificarSesionActiva,
	verificarRol([
		"admin",
		"Administrador",
		"superadmin",
		"Super Administrador",
		"Personal de Apoyo",
		"apoyo",
		"Visitante",
		"visitante",
	]),
	obtenerSensorPorId
);
// Rutas para insumos
router.get(
	"/insumos",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	VerInsumos
);
router.post(
	"/insumos",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	crearInsumo
);
router.put(
	"/insumos/:id/estado",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarEstadoInsumo
);
router.put(
	"/insumos/:id",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarInsumo
);
router.get(
	"/insumos/:id",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	obtenerInsumoPorId
);
router.get("/insumos-resumen/resumen", obtenerResumenInsumos);
router.post("/insumos/reponer-stock", reponerStockInsumo);
// Rutas para cultivos
router.get(
	"/cultivos",
	verificarSesionActiva,
	verificarRol([
		"admin",
		"Administrador",
		"superadmin",
		"Super Administrador",
		"Visitante",
		"visitante",
	]),
	VerCultivos
);
router.post(
	"/cultivos",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	crearCultivo
);
router.put(
	"/cultivos/:id/estado",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarEstadoCultivo
);
router.put(
	"/cultivos/:id",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarCultivo
);
router.get(
	"/cultivos/:id",
	verificarSesionActiva,
	verificarRol([
		"admin",
		"Administrador",
		"superadmin",
		"Super Administrador",
		"Visitante",
		"visitante",
	]),
	obtenerCultivoPorId
);
// Rutas para ciclos de cultivo
router.get(
	"/ciclo_cultivo",
	verificarSesionActiva,
	verificarRol([
		"admin",
		"Administrador",
		"superadmin",
		"Super Administrador",
		"Visitante",
		"visitante",
	]),
	VerCiclosCultivo
);
router.get(
	"/ciclo_cultivo/:id",
	verificarSesionActiva,
	verificarRol([
		"admin",
		"Administrador",
		"superadmin",
		"Super Administrador",
		"Visitante",
		"visitante",
	]),
	obtenerCicloCultivoPorId
);
router.post(
	"/ciclo_cultivo",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	crearCicloCultivo
);
router.put(
	"/ciclo_cultivo/:id",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarCicloCultivo
);
router.put(
	"/ciclo_cultivo/:id/estado",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarEstadoCicloCultivo
);
// Rutas para producciones
router.get("/producciones/insumo/:id", obtenerProduccionesPorInsumo);
router.get("/producciones/cultivo/:id", obtenerProduccionesPorCultivo);
router.get("/producciones/usuario/:id", obtenerProduccionesPorUsuario);
router.get("/producciones/sensor/:id", obtenerProduccionesPorSensor);
router.get(
	"/producciones",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	verProducciones
);
router.post(
	"/producciones",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	crearProduccion
);
// Las rutas más específicas para operaciones masivas van ANTES de las rutas con :id
router.put(
	"/producciones/estados/habilitado",
	actualizarEstadosProduccionHabilitado
);
router.put("/producciones/deshabilitar", deshabilitarProducciones);
router.get(
	"/producciones/:id",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	obtenerProduccionPorId
);
router.put(
	"/producciones/:id",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarProduccion
);
router.delete("/producciones/:id", eliminarProduccion);
router.put(
	"/producciones/:id/estado",
	verificarSesionActiva,
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarEstadoProduccion
);
export default router;
