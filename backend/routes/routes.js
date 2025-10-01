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
} from "../middleware/authRole.js";

const router = express.Router();

// Ruta para iniciar sesión
router.post("/login", loginUsuario);

// Rutas para recuperación de contraseña
router.post("/solicitar-recuperacion", solicitarRecuperacionContrasena);
router.post("/verificar-codigo", verificarCodigoRecuperacion);
router.post("/restablecer-contrasena", restablecerContrasena);

// Rutas para usuarios
router.get(
	"/usuarios",
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	VerUsuarios
);
router.post(
	"/users",
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	crearUsuario
);
router.put(
	"/usuarios/:id/estado",
	verificarRol(["superadmin", "Super Administrador"]),
	actualizarEstadoUsuario
);
// Permite que el usuario actualice su perfil o un admin cualquier perfil
router.put(
	"/usuarios/:id",
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
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	VerInsumos
);
router.post(
	"/insumos",
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	crearInsumo
);
router.put(
	"/insumos/:id/estado",
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarEstadoInsumo
);
router.put(
	"/insumos/:id",
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarInsumo
);
router.get(
	"/insumos/:id",
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	obtenerInsumoPorId
);
router.get("/insumos-resumen/resumen", obtenerResumenInsumos);
router.post("/insumos/reponer-stock", reponerStockInsumo);
// Rutas para cultivos
router.get(
	"/cultivos",
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
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	crearCultivo
);
router.put(
	"/cultivos/:id/estado",
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarEstadoCultivo
);
router.put(
	"/cultivos/:id",
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarCultivo
);
router.get(
	"/cultivos/:id",
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
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	crearCicloCultivo
);
router.put(
	"/ciclo_cultivo/:id",
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarCicloCultivo
);
router.put(
	"/ciclo_cultivo/:id/estado",
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
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	verProducciones
);
router.post(
	"/producciones",
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
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	obtenerProduccionPorId
);
router.put(
	"/producciones/:id",
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarProduccion
);
router.delete("/producciones/:id", eliminarProduccion);
router.put(
	"/producciones/:id/estado",
	verificarRol(["admin", "Administrador", "superadmin", "Super Administrador"]),
	actualizarEstadoProduccion
);
export default router;
